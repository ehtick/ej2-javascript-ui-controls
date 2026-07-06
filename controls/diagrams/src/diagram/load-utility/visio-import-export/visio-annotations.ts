import { mapCellValues, toCamelCase } from './visio-core';
import { isValidColor } from './visio-theme';
import {
    CellMapValue, ParsedXmlObject, Point, ShapeData, SyncfusionTextBinding, VisioCell, VisioRow, VisioSection,
    VisioShapeTransform, VisioTextTransform, VisioShapeNode, VisioStyleSheet, ColorRef, ProcessedColor, MasterDefaultValues
} from './visio-types';
import { getValue, getCellElement } from './visio-node-parser';
import { getLineColor, getFillColor, hexToRgb, toHsl, HSLColor, toHexStr, calcColor, createProcessedColor, getColorKeyFromId } from './visio-model-parsers';
import { ParsingContext } from './visio-import-export';
import { VisioTheme, VisioShape } from './visio-models';

/**
 * Retrieves a specific Visio Section from a shape by name.
 * Useful for accessing rich text-related sections like 'Character' or 'Paragraph'.
 *
 * @param {VisioShapeNode} shape - The Visio shape object that may contain Section elements
 * @param {string} name - The Section name to find (e.g., 'Character', 'Paragraph')
 * @returns {VisioSection | null} The matched Section object if found; otherwise null
 */
function getSection(shape: VisioShapeNode, name: string): VisioSection | null {
    if (!shape || !shape.Section) { return null; }
    const sections: VisioSection[] = Array.isArray(shape.Section) ? shape.Section : [shape.Section];
    return sections.find((section: VisioSection) => section && section.$ && section.$.N === name) || null;
}

/**
 * Ensures a value is returned as an array.
 * If the value is already an array, it is returned unchanged; if non-null, it is wrapped in an array; otherwise returns an empty array.
 *
 * @template T
 * @param {any} v - The input value that may be an array or single item
 * @returns {T[]} An array wrapping the input, or empty array when input is null/undefined
 */
function ensureArray<T>(v: any): T[] { return Array.isArray(v) ? v : (v != null ? [v] : []); }

/**
 * Determines whether a shape's text has mixed character formatting across Character rows.
 * Mixed formatting implies the presence of multiple style signatures (font, size, style, color)
 * and multiple word tokens or multiple paragraph rows�indicating rich text that a single EJ2
 * annotation style cannot faithfully reproduce.
 *
 * @param {VisioShapeNode} shape - Visio shape object with potential 'Character' and 'Paragraph' sections
 * @returns {boolean} True if mixed character formatting is detected; otherwise false
 */

function hasMixedCharacterFormatting(shape: VisioShapeNode): boolean {
    const characterSection: VisioSection = getSection(shape, 'Character');
    if (!characterSection || !characterSection.Row) { return false; }

    // Sets to collect distinct Font/Size/Color values (size kept as string per requirement)
    const distinctFonts: Set<string> = new Set<string>();
    const distinctSizes: Set<string> = new Set<string>();
    const distinctColors: Set<string> = new Set<string>();

    // Unique style signatures across character rows
    const characterRows: VisioRow[] = ensureArray(characterSection.Row);

    for (const row of characterRows) {
        const cells: VisioCell[] = ensureArray(row.Cell);

        let isFontValueFound: boolean;
        let isSizeValueFound: boolean;
        let isColorValueFound: boolean;

        for (const cell of cells) {
            if (!cell || !cell.$ || !cell.$.N) {
                continue;
            }
            const cellName: string = cell.$.N;
            const cellValue: string | undefined = cell.$.V as string | undefined;
            if (cellName === 'Font' && cellValue) {
                distinctFonts.add(cellValue);
                isFontValueFound = true;
            }
            if (cellName === 'Size' && cellValue) {
                const size: number = Number(cellValue);
                // Normalize numeric precision to avoid tiny float differences
                distinctSizes.add(String(Math.round(size * 1000) / 1000));
                isSizeValueFound = true;
            }
            if (cellName === 'Color' && cellValue) {
                distinctColors.add(cellValue);
                isColorValueFound = true;
            }

            // Stop early when all three values discovered for this row
            if (isFontValueFound && isSizeValueFound && isColorValueFound) {
                break;
            }
        }
    }
    // Only consider mixed when font OR size OR color actually vary across rows
    const mixedStyleDetected: boolean = (distinctFonts.size > 1) || (distinctSizes.size > 1) || (distinctColors.size > 1);

    const raw: string = shape && shape.Text && shape.Text.value ? String(shape.Text.value) : '';
    // Remove tags but keep whitespace to assess words
    const plain: string = raw.replace(/<cp[^>]*\/>/gi, ' ').replace(/<pp[^>]*\/>/gi, ' ').replace(/\s+/g, ' ').trim();
    const hasMultiWord: boolean = /\S\s+\S/.test(plain);

    // Paragraph info � if there are many paragraphs, treat as multi-part text even if single token
    const paraSec: any = getSection(shape, 'Paragraph');
    const paraRows: number = paraSec && paraSec.Row ? ensureArray<any>(paraSec.Row).length : 0;

    // Mixed only mixed style detected AND (multiple words OR multiple paragraphs)
    return mixedStyleDetected && (hasMultiWord || paraRows > 1);
}

/**
 * Normalizes Visio rich-text content for EJ2 by converting internal paragraph markers
 * into actual line breaks. If the input contains multiple Paragraph rows but no newline
 * characters, it heuristically inserts line breaks before list/bullet patterns.
 *
 * @param {any} shape - Visio shape object used to inspect the 'Paragraph' section
 * @param {string} content - Raw text content possibly containing Visio paragraph markers
 * @returns {string} Normalized text with line breaks suitable for EJ2 annotations
 */

function normalizeParagraphBreaks(shape: any, content: string): string {
    if (!content) { return content; }

    // Replace explicit paragraph markers if the raw text still contains them
    let text: string = content.replace(/<cp[^>]*\/>/gi, '')
        .replace(/<pp[^>]*\/>/gi, '\n');

    // If there are no newlines but Paragraph section indicates multiple paragraphs,
    // heuristically split after period-number bullets and bullet glyphs.
    if (!/\n/.test(text)) {
        const paraSec: any = getSection(shape, 'Paragraph');
        const paraRows: any[] = paraSec && paraSec.Row ? ensureArray<any>(paraSec.Row) : [];
        if (paraRows.length > 1) {
            // Insert newline before numbered list items (2. , 3. , etc.) that are not at start
            text = text.replace(/\s+(?=\d+\.)/g, '\n');
            // Insert newline before bullet glyphs � or hyphen bullets
            text = text.replace(/\s+(?=[�-]\s)/g, '\n');
        }
    }
    return text;
}

/**
 * Applies a conservative default text style when mixed rich-text runs are detected
 * and a single EJ2 annotation style cannot represent the variation.
 * Resets bold/italic, sets a readable default font family and size, and clears decorations.
 *
 * @param {VisioTextStyleModel} style - The current text style model to adjust
 * @returns {VisioTextStyleModel} The updated style model with safe default settings applied
 */

function applyDefaultStyleForMixedRuns(style: VisioTextStyleModel): VisioTextStyleModel {
    if (!style) { return style; }
    style.bold = false;
    style.italic = false;
    // Default family
    style.fontFamily = 'Segoe UI';
    // Slightly increased default font size for readability
    (style as any).fontSize = 16; // pixels
    // Remove decorations
    if (style.textDecoration) {
        style.textDecoration.underline = false;
        style.textDecoration.strikethrough = false;
    }
    return style;
}

/**
 * Represents margin properties for Visio shapes.
 * Defines spacing on all four sides (left, right, top, bottom).
 */
export class VisioMarginModel {
    /** Margin on the left side */
    left: number = 0;
    /** Margin on the right side */
    right: number = 0;
    /** Margin on the top side */
    top: number = 0;
    /** Margin on the bottom side */
    bottom: number = 0;

    /**
     * Creates a VisioMarginModel instance from a Visio shape object.
     * Extracts margin values from the shape's Cell elements.
     * @param {any} shape - The Visio shape object containing Cell elements with margin data
     * @returns {VisioMarginModel} A new VisioMarginModel with extracted margin values, or default values if shape is invalid
     */
    static fromJs(shape: any): VisioMarginModel {
        const margin: VisioMarginModel = new VisioMarginModel();

        // Validate shape and its properties
        if (!shape || !shape.$) {
            return margin;
        }

        /**
         * Helper function to retrieve a cell value by name
         * @param {string} name - The name of the cell to find
         * @returns {string | undefined} The cell value, or undefined if not found
         */
        const getCell: (name: string) => string | undefined = (name: string) => {
            // Ensure shape.Cell is always an array
            const cells: VisioCell[] = ensureArray(shape.Cell);
            const cell: VisioCell = cells.find((c: VisioCell) => c.$.N === name);
            return cell ? (cell.$.V as string) : undefined;
        };

        // Extract margin values from cells and convert to numbers
        margin.left = Number(getCell('LeftMargin')) || 0;
        margin.right = Number(getCell('RightMargin')) || 0;
        margin.top = Number(getCell('TopMargin')) || 0;
        margin.bottom = Number(getCell('BottomMargin')) || 0;
        return margin;
    }
}

/**
 * Represents text decoration properties for Visio text elements.
 * Handles underline and strikethrough styling.
 */
export class VisioTextDecorationModel {
    /** Flag indicating if text is underlined */
    underline?: boolean = false;
    /** Flag indicating if text has strikethrough */
    strikethrough?: boolean = false;

    /**
     * Creates a VisioTextDecorationModel instance from a Visio shape object.
     * Extracts text decoration properties from shape cells using bitwise operations on the Style cell.
     * @param {any} shape - The Visio shape object containing Section elements with decoration data
     * @returns {VisioTextDecorationModel} A new VisioTextDecorationModel with extracted decoration values
     */
    static fromJs(shape: any): VisioTextDecorationModel {
        const style: VisioTextDecorationModel = new VisioTextDecorationModel();
        const allCells: VisioCell[] = [];

        // Validate shape
        if (!shape || !shape.$) {
            return style;
        }

        // Normalize Section to always be an array
        const sections: VisioSection[] = Array.isArray(shape.Section) ? shape.Section : [shape.Section];

        // Iterate through all sections and rows to collect cells
        for (const section of sections) {
            const rows: VisioRow[] = Array.isArray(section.Row) ? section.Row : [section.Row];
            for (const row of rows) {
                // Skip invalid rows
                if (!row || typeof row !== 'object') { continue; }
                const cells: VisioCell[] = Array.isArray(row.Cell) ? row.Cell : [row.Cell];
                allCells.push(...cells);
            }
        }

        /**
         * Helper function to find a cell by name across all collected cells
         * @param {string} name - The name of the cell to find
         * @returns {string | undefined} The cell value, or undefined if not found
         */
        const getCell: (name: string) => string | undefined = (name: string): string | undefined => {
            const cell: VisioCell = allCells.find((c: VisioCell) => c && c.$ && c.$.N === name);
            return (cell && cell.$ && cell.$.V) as string;
        };

        // Extract and parse style code (bitwise flags for text styling)
        const styleCode: number = parseInt(getCell('Style'), 10);
        // Check strikethrough flag (1 = strikethrough)
        const strikethrough: number = Number(getCell('Strikethru'));
        if (strikethrough === 1) {
            style.strikethrough = true;
        }

        // Use bitwise AND operation to check if underline bit (4) is set
        if ((styleCode)) {
            style.underline = (styleCode & 4) !== 0;
        }
        return style;
    }
}

/**
 * Represents text alignment properties for Visio text elements.
 * Handles horizontal alignment (left, center, right, justify).
 */
export class VisioTextAlignmentModel {
    /** Flag indicating left alignment */
    left: boolean = false;
    /** Flag indicating right alignment */
    right: boolean = false;
    /** Flag indicating center alignment (default) */
    center: boolean = true;
    /** Flag indicating justified alignment */
    justify: boolean = false;

    /**
     * Creates a VisioTextAlignmentModel instance from a Visio shape object.
     * Extracts horizontal alignment from the HorzAlign cell value.
     * @param {any} shape - The Visio shape object containing alignment data
     * @returns {VisioTextAlignmentModel} A new VisioTextAlignmentModel with extracted alignment values
     */
    static fromJs(shape: any): VisioTextAlignmentModel {
        const alignment: VisioTextAlignmentModel = new VisioTextAlignmentModel();
        const allCells: VisioCell[] = [];

        // Validate shape
        if (!shape || !shape.$) {
            return alignment;
        }

        // Normalize Section to always be an array
        const sections: VisioSection[] = Array.isArray(shape.Section) ? shape.Section : [shape.Section];

        // Collect all cells from sections and rows
        for (const section of sections) {
            const rows: VisioRow[] = Array.isArray(section.Row) ? section.Row : [section.Row];
            for (const row of rows) {
                if (!row || typeof row !== 'object') { continue; }
                const cells: VisioCell[] = Array.isArray(row.Cell) ? row.Cell : [row.Cell];
                allCells.push(...cells);
            }
        }

        /**
         * Helper function to find a cell by name
         * @param {string} name - The name of the cell to find
         * @returns {string | undefined} The cell value, or undefined if not found
         */
        const getCell: (name: string) => string | undefined = (name: string): string | undefined => {
            const cell: VisioCell = allCells.find((c: VisioCell) => c && c.$ && c.$.N === name);
            return (cell && cell.$ && cell.$.V) as string;
        };

        // Get horizontal alignment value from HorzAlign cell
        const alignValue: string = getCell('HorzAlign');

        // Map alignment codes to boolean flags
        // 0 = left, 2 = right, 3 = justify, default = center
        switch (alignValue) {
        case '0':
            alignment.left = true;
            break;
        case '2':
            alignment.right = true;
            break;
        case '3':
            alignment.justify = true;
            break;
        default:
            alignment.center = true;
        }
        return alignment;
    }
}

/**
 * Represents comprehensive text styling properties for Visio text elements.
 * Includes color, font, size, bold, italic, decoration, and alignment.
 */
export class VisioTextStyleModel {
    /** Text color value */
    color?: string;
    /** Font family name (default: 'Calibri') */
    fontFamily: string = 'Calibri';
    /** Font size in points */
    fontSize?: number;
    /** Flag indicating if text is italic */
    italic: boolean = false;
    /** Flag indicating if text is bold */
    bold: boolean = false;
    /** Flag indicating no text styling applied */
    TEXT_STYLE_NONE: boolean = true;
    /** Background fill color */
    fill?: string;
    /** Text opacity (0-1 range) */
    opacity: number = 1;
    /** Text decoration properties (underline, strikethrough) */
    textDecoration?: VisioTextDecorationModel;
    /** Text alignment properties */
    textAlign?: VisioTextAlignmentModel;

    /**
     * Creates a VisioTextStyleModel instance from a Visio shape object.
     * Extracts comprehensive text styling information including font, size, color, and decorations.
     * @param {VisioShapeNode} shape - The Visio shape object containing text style data
     * @param {boolean} isConnector - To Check whether the shape is connector or not
     * @param {ParsingContext} context -  - Parser context containing theme and shape data.
     * @returns {VisioTextStyleModel} A new VisioTextStyleModel with all extracted style properties
     */
    static fromJs(shape: VisioShapeNode, isConnector?: boolean, context?: ParsingContext): VisioTextStyleModel {
        const style: VisioTextStyleModel = new VisioTextStyleModel();
        const allCells: VisioCell[] = [];
        const theme: VisioTheme = context && context.data && context.data.currentTheme;
        if (theme && theme.name === 'Integral' && theme.schemeEnum === '36' && style.color === undefined) {
            style.color = '#ffffff';
        }
        // Validate shape has Section property
        if (!shape || !shape.Section) {
            return style;
        }

        // Normalize Section to always be an array
        const sections: VisioSection[] = Array.isArray(shape.Section) ? shape.Section : [shape.Section];

        // Collect all cells from sections and rows
        for (const section of sections) {
            const rows: VisioRow[] = Array.isArray(section.Row) ? section.Row : [section.Row];
            for (const row of rows) {
                if (!row || typeof row !== 'object') { continue; }
                const cells: VisioCell[] = Array.isArray(row.Cell) ? row.Cell : [row.Cell];
                allCells.push(...cells);
            }
        }

        /**
         * Helper function to find a cell by name in Section cells
         * @param {string} name - The name of the cell to find
         * @returns {string | undefined} The cell value
         */
        const getCell: (name: string) => string | undefined = (name: string): string | undefined => {
            const cell: VisioCell = allCells.find((c: VisioCell) => c && c.$ && c.$.N === name);
            return (cell && cell.$ && cell.$.V) as string;
        };

        /**
         * Helper function to find a cell by name in direct Cell array
         * @param {string} name - The name of the cell to find
         * @returns {string | undefined} The cell value
         */
        const getCells: (name: string) => string | undefined = (name: string) => {
            // Ensure shape.Cell is always an array
            const cells: VisioCell[] = ensureArray(shape.Cell);
            const cell: VisioCell = cells.find((c: VisioCell) => c.$.N === name);
            return cell ? (cell.$.V as string) : undefined;
        };


        const getMasterCell: (name: string) => string | undefined = (name: string) => {
            let masterCell: VisioCell;
            let objectStyleSheet: VisioStyleSheet;

            if (!context || !context.entries || !context.entries.RootDocument || !context.entries.RootDocument.StyleSheets
                || !context.entries.RootDocument.StyleSheets.StyleSheet) {
                return undefined;
            }
            const styleSheets: VisioStyleSheet[] = context.entries.RootDocument.StyleSheets.StyleSheet;
            if (shape && shape.$ && shape.$['TextStyle'] && styleSheets && styleSheets.length > 1) {
                objectStyleSheet = styleSheets.find((sheet: VisioStyleSheet) => sheet && sheet.$ && sheet.$.ID === shape.$['TextStyle']);
                // styleSheets.find(function (sheet) { return sheet && sheet.$ && sheet.$.ID === shape.$["TextStyle"]; });
            }
            if (shape && shape && shape.Cell) {
                const masterCells: VisioCell[] = ensureArray(shape.Cell);
                masterCell = masterCells.find((cell: VisioCell) => cell && cell.$ && cell.$.N === name);
            }
            if (masterCell && masterCell.$ && masterCell.$.V) {
                return context.propertyManager.getColor(masterCell.$.V as string);
            }
            if (objectStyleSheet && objectStyleSheet.Cell) {
                const styleSheetcells: VisioCell[] = ensureArray(objectStyleSheet.Cell);
                const styleSheetcell: VisioCell = styleSheetcells.find((cell: VisioCell) => cell && cell.$ && cell.$.N === name);
                if (styleSheetcell && styleSheetcell.$ && styleSheetcell.$.V && isValidColor(styleSheetcell.$.V as string)) {
                    return styleSheetcell.$.V as string;
                }
                return undefined;
            }
            else {
                return undefined;
            }
        };
        const colorFromCell: string = getCell('Color');
        const colorFromMasterCell: string = getMasterCell('Color');
        const colorFromCellElement: string = shape.visioParentStyles &&
            getValue(getCellElement(shape.visioParentStyles, shape, context, 'Character', 'Color'), '');
        // Extract color value
        style.color = colorFromCell != null ? colorFromCell : colorFromMasterCell != null ? colorFromMasterCell
            : (colorFromCellElement !== 'Themed' && colorFromCellElement !== '') ? colorFromCellElement : getFontColor(shape, context);

        // Extract and set font family
        style.fontFamily = getCell('Font') ? getCell('Font') : 'Calibri';

        const sizeFromCell: string = getCell('Size');
        const defaultFontSize: string = '0.167';
        // Extract and convert font size (multiply by 72 * 1.33 to get point size)
        const fontSizeValue: number = sizeFromCell ? Number(sizeFromCell) : shape.visioParentStyles  ?
            Number(getValue(getCellElement(shape.visioParentStyles, shape, context, 'Character', 'Size'), defaultFontSize)) : Number(defaultFontSize);
        if (fontSizeValue) {
            style.fontSize = fontSizeValue * 72 * 1.33;
        }

        // Extract style code and use bitwise operations to determine bold and italic
        // Bit 0 (1) = bold, Bit 1 (2) = italic
        const styleCode: number = parseInt(getCell('Style'), 10);
        if (styleCode > -1) {
            style.bold = (styleCode & 1) !== 0;
            style.italic = (styleCode & 2) !== 0;
            style.TEXT_STYLE_NONE = false;
        }

        // Extract opacity/transparency
        style.opacity = Number(getCell('ColorTrans')) || 1;

        // Extract text alignment properties
        style.textAlign = VisioTextAlignmentModel.fromJs(shape);

        // Extract background color
        const textBkgnd: string = getCells('TextBkgnd') as string | undefined;
        const fill: string =
            textBkgnd !== undefined && textBkgnd !== null && textBkgnd !== ''
                ? (textBkgnd === '0' ? 'transparent' : textBkgnd)
                : (isConnector ? 'white' : 'transparent');
        style.fill = isValidColor(fill, true) ? fill : 'transparent';

        // Extract text decoration properties
        style.textDecoration = VisioTextDecorationModel.fromJs(shape);
        return style;
    }
}
/**
 * Retrieves the font color for a shape based on quick style settings and theme data.
 * Resolves folnt colors from theme font style matrices, variant colors, or base colors.
 * Applies color modifiers (tint, shade, etc.) to generate the final font color.
 *
 * @param {VisioShape} shape - Parsed Visio shape(s) for the vertex node
 * @param {ParsingContext} context - Parser context containing theme and shape data.
 * @returns {string | undefined} The resolved font color in hex format (#RRGGBB), or undefined if not found.
 *
 * @private
 */
function getFontColor(shape: VisioShapeNode, context: ParsingContext): string | undefined {
    const theme: VisioTheme | undefined = context.data.currentTheme ? context.data.currentTheme : undefined;
    if (!theme) {
        return undefined;
    }
    let fontColor: { color?: ColorRef | ProcessedColor; name?: string } | null = null;
    let fontColorStyle: number = 0;
    if (shape) {
        fontColorStyle = shape.quickStyleValues && shape.quickStyleValues.quickStyleFontColor;
        const matrix: number = shape.quickStyleValues && shape.quickStyleValues.quickStyleFontMatrix;
        const index: number = matrix - 100;
        switch (matrix) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
            if (theme.fontColorsArray && theme.fontColorsArray.length > 0) {
                fontColor = theme.fontColorsArray[matrix - 1];
            }
            break;
        case 100:
        case 101:
        case 102:
        case 103:
            if (theme.isMonotoneVariant && theme.themeVariantStl !== undefined && theme.isMonotoneVariant[theme.themeVariantStl]) {
                fontColorStyle = 100;
            }
            if (theme.variantFontIdx && theme.themeVariantStl !== undefined && theme.fontColorsArray) {
                const variantRow: Array<number> = theme.variantFontIdx[theme.themeVariantStl];
                if (variantRow && variantRow[parseInt(index.toString(), 10)] !== undefined) {
                    fontColor = theme.fontColorsArray[variantRow[parseInt(index.toString(), 10)] - 1];
                }
            }
            break;
        }
    }
    if (!fontColorStyle || !fontColor) {
        return undefined;
    }
    let txtColor: string;
    if (fontColor && fontColor.color) {
        if (fontColor.color.color) {
            txtColor = toHexStr(fontColor.color.color);
        }
        else if ((fontColor.color as ColorRef).val !== 'phClr') {
            const colorValue: string = (fontColor.color as ColorRef).val;
            const color: string = theme.baseColors[`${colorValue}`] ? theme.baseColors[`${colorValue}`] : undefined;
            txtColor = color;
        }
    }
    let variantColor: ProcessedColor | null = null;
    // Base color from scheme (colors 1-7)
    if (fontColorStyle < 8) {
        if (theme.baseColors) {
            const colorKey: string | undefined = getColorKeyFromId(fontColorStyle);
            if (colorKey && theme.baseColors[`${colorKey}`]) {
                variantColor = createProcessedColor(theme.baseColors[`${colorKey}`]);
            }
        }
    }
    else {
        // Variant colors (100-106, 200-206, etc.)
        let clrIndex: number = 0;
        if (fontColorStyle >= 200) {
            clrIndex = fontColorStyle - 200;
        } else if (fontColorStyle >= 100) {
            clrIndex = fontColorStyle - 100;
        }
        if (clrIndex >= 0 && clrIndex <= 6) {
            if (theme.themeVariantClr !== undefined && theme.variantsColors && theme.variantsColors.length > 0) {
                const variantIndex: number = theme.themeVariantClr % theme.variantsColors.length;
                const variantColors: ProcessedColor[] = theme.variantsColors[parseInt(variantIndex.toString(), 10)];
                if (variantColors && variantColors[parseInt(clrIndex.toString(), 10)]) {
                    variantColor = variantColors[parseInt(clrIndex.toString(), 10)];
                }
            }
        }
    }
    if (fontColor && fontColor.color) {
        fontColor.color.color = variantColor.color;
        calcColor(fontColor.color);
        txtColor = toHexStr(fontColor.color.color);
    }
    if (!txtColor && variantColor && variantColor.color) {
        txtColor = toHexStr(variantColor.color);
    }
    const styleVariation: number = shape.quickStyleValues && shape.quickStyleValues.quickStyleVariation;

    if ((styleVariation & 2) > 0) {
        const bkgndColor: string = theme.bkgndColor;
        const bkgHSLClr: HSLColor = toHsl(hexToRgb(bkgndColor));
        const txtHSLClr: HSLColor = typeof txtColor == 'object' ? toHsl(txtColor) : toHsl(hexToRgb(txtColor));
        const fillColor: string = getFillColor(shape, context);
        const fillHSLClr: HSLColor = typeof fillColor == 'object' ? toHsl(fillColor) : toHsl(hexToRgb(fillColor));
        const lineClr: string = getLineColor(shape, context);
        const lineHSLClr: HSLColor = typeof lineClr == 'object' ? toHsl(lineClr) : toHsl(hexToRgb(lineClr));
        if (Math.abs(bkgHSLClr.getLum() - txtHSLClr.getLum()) >= 0.1666) {
            return txtColor;
        }
        else if (bkgHSLClr.getLum() <= 0.7292) {
            txtColor = 'ffffff';
        }
        else {
            const lineDiff: number = Math.abs(bkgHSLClr.getLum() - lineHSLClr.getLum());
            const fillDiff: number = Math.abs(bkgHSLClr.getLum() - fillHSLClr.getLum());
            const txtDiff: number = Math.abs(bkgHSLClr.getLum() - txtHSLClr.getLum());
            const max: number = Math.max(lineDiff, fillDiff, txtDiff);

            if (max === lineDiff) {
                txtColor = lineClr;
            }
            else if (max === fillDiff) {
                txtColor = fillColor;
            }
        }
    }
    return txtColor;
}

/**
 * Represents hyperlink properties for Visio shapes.
 * Stores link address, description, and target window preferences.
 */
export class VisioHyperlinkModel {
    /** The hyperlink URL/address */
    link: string = '';
    /** The hyperlink display content/description */
    content: string = '';
    /** Flag indicating if link opens in a new window */
    newWindow?: boolean = false;

    /**
     * Creates a VisioHyperlinkModel instance from a Visio shape object.
     * Extracts hyperlink data from the Hyperlink section of the shape.
     * @param {any} shape - The Visio shape object containing hyperlink data
     * @returns {VisioHyperlinkModel} A new VisioHyperlinkModel with extracted hyperlink properties
     */
    static fromJs(shape: any): VisioHyperlinkModel {
        // Validate shape and Section property
        if (!shape || !shape.Section) {
            return new VisioHyperlinkModel();
        }

        // Find the Hyperlink section (may be array or single object)
        let hyperlinkSection: VisioSection = null;
        if (Array.isArray(shape.Section)) {
            hyperlinkSection = shape.Section.find((sec: VisioSection) => sec.$.N === 'Hyperlink');
        } else if (shape.Section) {
            if (shape.Section.$.N === 'Hyperlink') {
                hyperlinkSection = shape.Section;
            }
        }

        // Validate hyperlink section and rows
        if (!hyperlinkSection || !hyperlinkSection.Row) {
            return new VisioHyperlinkModel();
        }

        // Normalize rows to always be an array
        const rows: VisioRow[] = Array.isArray(hyperlinkSection.Row) ? hyperlinkSection.Row : [hyperlinkSection.Row];
        const row: any = rows[0]; // Just get the first row

        /**
         * Helper function to get cell value by name from the hyperlink row
         * @param {string} name - The name of the cell to find
         * @returns {string | undefined} The cell value
         */
        const getCell: (name: string) => string | undefined = (name: string) => {
            const cell: VisioCell = (row.Cell || []).find((c: VisioCell) => c.$.N === name);
            return cell ? (cell.$.V as string) : undefined;
        };

        // Create and populate hyperlink model
        const hyperlink: VisioHyperlinkModel = new VisioHyperlinkModel();
        hyperlink.content = getCell('Description');
        hyperlink.link = getCell('Address');

        // Extract NewWindow flag (1 = true)
        const newWindow: number = Number(getCell('NewWindow'));
        if (newWindow === 1) {
            hyperlink.newWindow = true;
        }
        return hyperlink;
    }
}

/**
 * Utility class for binding Visio text properties to Syncfusion text binding format.
 * Handles text positioning calculations and coordinate conversions.
 */
export class VisioToSyncfusionTextBinder {
    /**
     * Binds Visio text transform properties to Syncfusion text binding format.
     * Calculates the offset position of text within a shape using Visio pin and margin data.
     * @param {VisioShapeTransform} shapeTransform - The Visio shape transform data (position, size)
     * @param {VisioTextTransform} textTransform - The Visio text transform data (pins, margins, dimensions)
     * @returns {SyncfusionTextBinding} A Syncfusion text binding with calculated offset (0-1 normalized range)
     */
    static bindVisioTextToSyncfusion(
        shapeTransform: VisioShapeTransform,
        textTransform: VisioTextTransform
    ): SyncfusionTextBinding {

        // Step 1: Calculate base position offset from TxtPin coordinates
        const visioTextCenter: { x: number; y: number } = this.calculateVisioTextCenter(shapeTransform, textTransform);
        const positionOffset: { x: number; y: number } = this.convertToSyncfusionOffset(visioTextCenter, shapeTransform);

        // Return binding with rounded offset values to 2 decimal places
        // Note: We don't apply vertical alignment adjustments here because the text position
        // is already fully specified by the Visio cells (TxtPinX, TxtPinY, TxtLocPinX, TxtLocPinY).
        // Those adjustments were heuristics for shapes without explicit text positioning.
        return {
            offset: {
                x: Math.round(positionOffset.x * 100) / 100,
                y: Math.round(positionOffset.y * 100) / 100
            }
        };
    }

    /**
     * Calculates the absolute center position of text within a Visio shape.
     * Takes into account text pin position, margins, and dimensions.
     * @param {VisioShapeTransform} shapeTransform - The shape transform data (pinX, pinY, width, height)
     * @param {VisioTextTransform} textTransform - The text transform data (pins, margins, dimensions)
     * @returns {{ x: number, y: number }} The absolute center position of the text
     */
    private static calculateVisioTextCenter(
        shapeTransform: VisioShapeTransform,
        textTransform: VisioTextTransform
    ): { x: number; y: number } {
        // Calculate shape's bottom-left corner position
        const shapeLeft: number = shapeTransform.pinX - shapeTransform.width / 2;
        const shapeBottom: number = shapeTransform.pinY - shapeTransform.height / 2;

        // Calculate absolute text pin position (relative to shape's bottom-left corner)
        // Note: txtPinX and txtPinY are already relative to the shape's bottom-left corner
        const absoluteTxtPinX: number = shapeLeft + textTransform.txtPinX;
        const absoluteTxtPinY: number = shapeBottom + textTransform.txtPinY;

        // Calculate offset from text pin to text center
        // The text pin is the anchor point of the text block
        // The text local pin (txtLocPinX, txtLocPinY) defines where within the text block the pin is located
        // To find the center, we need to offset from the pin by: (txtWidth/2 - txtLocPinX, txtHeight/2 - txtLocPinY)
        const textCenterOffsetX: number = (textTransform.txtWidth / 2) - textTransform.txtLocPinX;
        const textCenterOffsetY: number = (textTransform.txtHeight / 2) - textTransform.txtLocPinY;

        // Calculate final text center position
        const visioTextCenterX: number = absoluteTxtPinX + textCenterOffsetX;
        const visioTextCenterY: number = absoluteTxtPinY + textCenterOffsetY;

        return {
            x: visioTextCenterX,
            y: visioTextCenterY
        };
    }

    /**
     * Converts Visio absolute text center coordinates to Syncfusion normalized offset (0-1 range).
     * Normalizes position relative to shape bounds.
     * @param {{ x: number, y: number }} visioTextCenter - The absolute text center position
     * @param {VisioShapeTransform} shapeTransform - The shape transform data for normalization
     * @returns {{ x: number, y: number }} Normalized offset in 0-1 range where 0.5 is center
     */
    private static convertToSyncfusionOffset(
        visioTextCenter: { x: number; y: number },
        shapeTransform: VisioShapeTransform
    ): { x: number; y: number } {
        // Get shape center coordinates
        const shapeCenterX: number = shapeTransform.pinX;
        const shapeCenterY: number = shapeTransform.pinY;

        // Normalize text position relative to shape
        // X offset: 0.5 + (text position - shape center) / shape width
        const offsetX: number = 0.5 + (visioTextCenter.x - shapeCenterX) / shapeTransform.width;

        // Y offset: 0.5 - (text position - shape center) / shape height
        // Note: Y is inverted (Visio Y increases upward, Syncfusion increases downward)
        const offsetY: number = 0.5 - (visioTextCenter.y - shapeCenterY) / shapeTransform.height;

        return {
            x: offsetX,
            y: offsetY
        };
    }
}

/**
 * Represents a text annotation (label) for Visio shapes and connectors.
 * Contains text content, styling, positioning, and visibility information.
 */
export class VisioAnnotation {
    /** Unique identifier for the annotation */
    id?: string;
    /** Text content of the annotation */
    content: string = '';
    /** Width of the annotation in diagram units */
    width?: number;
    /** Height of the annotation in diagram units */
    height?: number;
    /** Rotation angle in degrees */
    rotateAngle: number = 0;
    /** Margin properties around the text */
    margin?: VisioMarginModel;
    /** Flag indicating if annotation is visible */
    visible: boolean = true;
    /** Hyperlink associated with the annotation */
    hyperlink?: VisioHyperlinkModel;
    /** Text styling properties */
    style?: VisioTextStyleModel;
    /** Vertical alignment of text (Top, Center, Bottom) */
    verticalAlignment: 'Top' | 'Center' | 'Bottom' = 'Center';
    /** Horizontal alignment of text (Left, Center, Right) */
    horizontalAlignment: 'Left' | 'Center' | 'Right' = 'Center';
    /** Normalized offset position (0-1 range) relative to shape bounds */
    offset: Point;
    /** Flag indicating if text angle should follow connector segment angle */
    segmentAngle?: boolean = false;
    /** Flag indicating that page-level TxtPin TxtLocPin TxtWidth/Height define explicit text position. */
    hasExplicitTextPosition?: boolean = false;
}

/**
 * Determines shape-specific text transform properties based on shape type.
 * Different shapes require different text positioning to maintain proper alignment.
 * @function applyTextTransform
 * @param {string} shapeName - The name/type of the shape (rectangle, ellipse, etc.)
 * @param {number} shapeWidth - The width of the shape
 * @param {number} shapeHeight - The height of the shape
 * @returns {{
 *   txtWidth: number,
 *   txtHeight: number,
 *   txtPinX: number,
 *   txtPinY: number,
 *   txtLocPinX: number,
 *   txtLocPinY: number
 * }} Text transform properties customized for the shape type
 */
function applyTextTransform(shapeName: string, shapeWidth: number, shapeHeight: number): VisioTextTransform {
    // Normalize shape name for comparison
    const safeName: string = (shapeName && shapeName.trim().length) ? shapeName : 'shape';

    // Return shape-specific text positioning multipliers
    switch (safeName.toLowerCase()) {
    case 'rectangle':
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.5, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'ellipse':
        // Ellipse uses 87.5% of shape dimensions for text
        return {
            txtWidth: shapeWidth * 0.875, txtHeight: shapeHeight * 0.875, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.5, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'righttriangle':
        // Right triangle text positioned in lower-left area
        return {
            txtWidth: shapeWidth * 0.5, txtHeight: shapeHeight * 0.5, txtPinX: shapeWidth * 0.25,
            txtPinY: shapeHeight * 0.25, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'triangle':
        // Triangle text positioned in lower-center area
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 0.6667, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.3333, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'pentagon':
        // Pentagon with adjusted vertical pin position
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.4472, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.4472
        };
    case 'heptagon':
        // Heptagon with adjusted vertical pin position
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.474, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.474
        };
    case 'octagon':
    case 'polygon':
    case 'hexagon':
        // Regular polygons with centered text
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.5, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'trapezoid':
        // Trapezoid with centered text
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.5, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'decagon':
        // Decagon with centered text
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.5, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'parallelogram':
        // Parallelogram with centered text
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.5, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'cylinder':
        // Cylinder with centered text
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.5, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    case 'diamond':
        // Diamond with centered text
        return {
            txtWidth: shapeWidth * 1, txtHeight: shapeHeight * 1, txtPinX: shapeWidth * 0.5,
            txtPinY: shapeHeight * 0.5, txtLocPinX: shapeWidth * 0.5, txtLocPinY: shapeHeight * 0.5
        };
    default:
        // Default: use full shape dimensions with center positioning
        return {
            txtWidth: shapeWidth, txtHeight: shapeHeight, txtPinX: shapeWidth / 2,
            txtPinY: shapeHeight / 2, txtLocPinX: shapeWidth / 2, txtLocPinY: shapeHeight / 2
        };
    }
}

/**
 * Represents a text annotation for Visio connectors (lines, arrows).
 * Extends VisioAnnotation with connector-specific text positioning properties.
 */
export class VisioConnectorAnnotation extends VisioAnnotation {
    /** Text pin X coordinate relative to connector */
    txtPinX?: number;
    /** Text pin Y coordinate relative to connector */
    txtPinY?: number;
    /** Text local pin X coordinate (center reference point) */
    txtLocPinX?: number;
    /** Text local pin Y coordinate (center reference point) */
    txtLocPinY?: number;
    /** Text width in connector units */
    txtWidth?: number;
    /** Text height in connector units */
    txtHeight?: number;
    /** QuickStyle font color index */
    QuickStyleFontColor: number;
    /** QuickStyle font matrix index */
    QuickStyleFontMatrix: number;

    /**
     * Creates a VisioConnectorAnnotation instance from a Visio connector shape object.
     * Extracts all text and positioning properties specific to connectors.
     * @param {VisioShapeNode} shape - The Visio connector shape object
     * @param {MasterDefaultValues} defaultData - Default text transform data for fallback values
     * @param {ParsingContext} context - Parser context containing theme and shape data.
     * @returns {VisioConnectorAnnotation} A new VisioConnectorAnnotation with extracted properties
     */
    static fromJs(shape: VisioShapeNode, defaultData: MasterDefaultValues, context: ParsingContext): VisioConnectorAnnotation {
        const annotation: VisioConnectorAnnotation = new VisioConnectorAnnotation();

        // Validate shape properties
        if (!shape || !shape.$ || !shape.Cell) {
            return annotation;
        }

        /**
         * Helper function to get cell value by name
         * @param {string} name - The name of the cell to find
         * @returns {string | undefined} The cell value
         */
        const getCell: (name: string) => string | undefined = (name: string): string | undefined => {
            // Ensure shape.Cell is always an array
            const cells: VisioCell[] = ensureArray(shape.Cell);
            const cell: VisioCell | undefined = cells.find((c: VisioCell) => c.$.N === name);
            return cell ? (cell.$.V as string) : undefined;
        };

        // Extract text content
        annotation.content = (shape.Text && shape.Text.value) ? shape.Text.value : '';

        // Extract and convert text rotation angle from radians to degrees
        const txtAngle: number = parseFloat(getCell('TxtAngle'));
        annotation.rotateAngle = !isNaN(txtAngle) ? txtAngle * (180 / Math.PI) : 0;

        // Extract QuickStyle properties
        annotation.QuickStyleFontColor = getCell('QuickStyleFontColor') !== undefined ? Number(getCell('QuickStyleFontColor')) : undefined;
        annotation.QuickStyleFontMatrix = getCell('QuickStyleFontMatrix') !== undefined ? Number(getCell('QuickStyleFontMatrix')) : undefined;

        // Extract margin and styling
        annotation.margin = VisioMarginModel.fromJs(shape);
        annotation.style = VisioTextStyleModel.fromJs(shape, true, context);

        // Extract visibility (HideText = '1' means hidden)
        annotation.visible = getCell('HideText') !== '1';

        // Extract hyperlink if present
        annotation.hyperlink = VisioHyperlinkModel.fromJs(shape);

        // Apply constraint flags (locks, selection, rotation)
        getAnnotationConstraints(annotation, shape.Cell as VisioCell[]);

        // Determine if text follows connector segment angle
        annotation.segmentAngle = getCell('TextDirection') ? getCell('TextDirection') === '1' : false;

        // Set alignment based on text direction
        if (annotation.segmentAngle) {
            // For segmented text, use horizontal alignment
            annotation.horizontalAlignment = getHorizontalAlignment(shape as VisioShapeNode, true);
        } else {
            // For regular text, use vertical alignment
            annotation.verticalAlignment = getVerticalAlignment(shape as VisioShapeNode, true);
        }

        // Extract text positioning properties with fallback to defaults
        annotation.txtPinX = getCell('TxtPinX') !== undefined ? parseFloat(getCell('TxtPinX')) : defaultData.txtPinX;
        annotation.txtPinY = getCell('TxtPinY') !== undefined ? parseFloat(getCell('TxtPinY')) : defaultData.txtPinY;
        annotation.txtLocPinX = getCell('TxtLocPinX') !== undefined ? parseFloat(getCell('TxtLocPinX')) : defaultData.txtLocalPinX;
        annotation.txtLocPinY = getCell('TxtLocPinY') !== undefined ? parseFloat(getCell('TxtLocPinY')) : defaultData.txtLocalPinY;
        annotation.txtWidth = getCell('TxtWidth') !== undefined ? parseFloat(getCell('TxtWidth')) : defaultData.txtWidth;
        annotation.txtHeight = getCell('TxtHeight') !== undefined ? parseFloat(getCell('TxtHeight')) : defaultData.txtHeight;
        return annotation;
    }
}

/**
 * Represents a text annotation for Visio node shapes (not connectors).
 * Extends VisioAnnotation with node-specific text positioning based on shape type.
 */
export class VisioNodeAnnotation extends VisioAnnotation {
    /** Text pin X coordinate relative to node */
    txtPinX?: number;
    /** Text pin Y coordinate relative to node */
    txtPinY?: number;
    /** Text local pin X coordinate (center reference point) */
    txtLocPinX?: number;
    /** Text local pin Y coordinate (center reference point) */
    txtLocPinY?: number;
    /** Text width in node units */
    txtWidth?: number;
    /** Text height in node units */
    txtHeight?: number;

    /**
     * Creates a VisioNodeAnnotation instance from a Visio node shape object.
     * Extracts text properties and applies shape-specific text positioning.
     * @param {VisioShapeNode} shape - The Visio node shape object
     * @param {ParsedXmlObject} defaultData - Default data containing shape name, width, height, and positioning
     * @param {ParsingContext} context - Parsing context
     * @returns {VisioNodeAnnotation} A new VisioNodeAnnotation with extracted properties
     */
    static fromJs(shape: VisioShapeNode, defaultData: ParsedXmlObject, context: ParsingContext): VisioNodeAnnotation {
        const annotation: VisioNodeAnnotation = new VisioNodeAnnotation();

        // Validate shape properties
        if (!shape || !shape.$ || !shape.Cell) {
            return annotation;
        }

        /**
         * Helper function to get cell value by name
         * @param {string} name - The name of the cell to find
         * @returns {string | undefined} The cell value
         */
        const getCell: (name: string) => string | undefined = (name: string): string | undefined => {
            // Ensure shape.Cell is always an array
            const cells: VisioCell[] = ensureArray(shape.Cell);
            const cell: VisioCell = cells.find((c: VisioCell) => c.$.N === name);
            return cell ? (cell.$.V as string) : undefined;
        };

        const defaultNodeData: ParsedXmlObject = defaultData;

        // Extract text content (normalize bullets/paragraphs for EJ2)
        const rawContent: string = (shape.Text && shape.Text.value) ? shape.Text.value : '';
        annotation.content = normalizeParagraphBreaks(shape, rawContent);

        // Extract rotation angle and text direction
        const txtAngle: number = parseFloat(getCell('TxtAngle'));
        const textDirection: number = Number(getCell('TextDirection'));
        annotation.rotateAngle = !isNaN(txtAngle) ? txtAngle * (180 / Math.PI) : 0;

        // Adjust rotation if text direction is vertical
        if (textDirection === 1) {
            annotation.rotateAngle -= 90;
        }

        // Extract margin and styling
        annotation.margin = VisioMarginModel.fromJs(shape);
        annotation.style = VisioTextStyleModel.fromJs(shape, false, context);

        // If the Visio text has mixed formatting runs, fall back to a safe, default style
        if (hasMixedCharacterFormatting(shape) && annotation.style) {
            annotation.style = applyDefaultStyleForMixedRuns(annotation.style);
        }

        // Extract visibility
        annotation.visible = getCell('HideText') !== '1';

        // Extract hyperlink
        annotation.hyperlink = VisioHyperlinkModel.fromJs(shape);

        // Apply constraint flags
        getAnnotationConstraints(annotation, shape.Cell as VisioCell[]);

        // Determine text direction mode
        annotation.segmentAngle = textDirection ? textDirection === 1 : false;

        // Populate both horizontal and vertical alignment.  The original code
        // only set one depending on the segmentAngle flag, so non‑rotated text
        // would always fall back to the default center horizontal alignment even
        // if HorzAlign cell specified left/right.
        annotation.horizontalAlignment = getHorizontalAlignment(shape);
        annotation.verticalAlignment = getVerticalAlignment(shape);

        // Extract shape dimensions with fallback to defaults
        const shapeWidth: number = !isNaN(parseFloat(getCell('Width')))
            ? parseFloat(getCell('Width'))
            : (defaultNodeData && defaultNodeData.Width) as number || 1;
        const shapeHeight: number = !isNaN(parseFloat(getCell('Height')))
            ? parseFloat(getCell('Height'))
            : (defaultNodeData && defaultNodeData.Height) as number || 1;

        // Get shape-specific text transform properties
        const transform: VisioTextTransform = applyTextTransform(defaultNodeData.Name as string, shapeWidth, shapeHeight);

        // Extract text width with fallback to shape-specific transform
        const txtWidth: number = parseFloat(getCell('TxtWidth'));
        annotation.txtWidth = !isNaN(txtWidth) ? txtWidth : transform.txtWidth;

        // Extract text height with fallback to shape-specific transform
        const txtHeight: number = parseFloat(getCell('TxtHeight'));
        annotation.txtHeight = !isNaN(txtHeight) ? txtHeight : transform.txtHeight;

        // Extract text pin X coordinate with fallback
        const txtPinX: number = parseFloat(getCell('TxtPinX'));
        annotation.txtPinX = !isNaN(txtPinX) ? txtPinX : transform.txtPinX;

        // Extract text pin Y coordinate with fallback
        const txtPinY: number = parseFloat(getCell('TxtPinY'));
        annotation.txtPinY = !isNaN(txtPinY) ? txtPinY : transform.txtPinY;

        // Extract text local pin X coordinate with fallback
        const txtLocPinX: number = parseFloat(getCell('TxtLocPinX'));
        annotation.txtLocPinX = !isNaN(txtLocPinX) ? txtLocPinX : transform.txtLocPinX;

        // Extract text local pin Y coordinate with fallback
        const txtLocPinY: number = parseFloat(getCell('TxtLocPinY'));
        annotation.txtLocPinY = !isNaN(txtLocPinY) ? txtLocPinY : transform.txtLocPinY;
        // Determine if page-level cells explicitly define text position
        const hasTxtPinX: boolean = getCell('TxtPinX') !== undefined;
        const hasTxtPinY: boolean = getCell('TxtPinY') !== undefined;
        const hasTxtLocPinX: boolean = getCell('TxtLocPinX') !== undefined;
        const hasTxtLocPinY: boolean = getCell('TxtLocPinY') !== undefined;
        const hasTxtWidth: boolean = getCell('TxtWidth') !== undefined;
        const hasTxtHeight: boolean = getCell('TxtHeight') !== undefined;

        // Set explicit-position flag (true if any explicit text-position cell exists on page instance)
        if (hasTxtPinX || hasTxtPinY || hasTxtLocPinX || hasTxtLocPinY || hasTxtWidth || hasTxtHeight) {
            annotation.hasExplicitTextPosition = true;
        } else {
            annotation.hasExplicitTextPosition = false;
        }

        return annotation;
    }

    /**
     * Applies a master-text fallback to a node annotation when page text is empty.
     * Keeps page text if present; otherwise fills from master and forces visibility true.
     * @static
     * @param {VisioNodeAnnotation} annotation - The already-parsed page annotation object
     * @param {VisioShapeNode} pageShape - The page-level shape XML (source for page text)
     * @param {VisioShapeNode | null} masterShape - The master-level shape XML (source for placeholder text)
     * @returns {void}
     */
    static applyMasterTextFallback(
        annotation: VisioNodeAnnotation,
        pageShape: VisioShapeNode,
        masterShape: VisioShapeNode | null
    ): void {
        // Guard: invalid annotation or page shape
        if (!annotation) { return; }
        if (!pageShape) { return; }

        // -- Check if page text has any visible content --
        let pageText: string = '';
        if (pageShape.Text && (pageShape.Text as any).value) {
            pageText = String((pageShape.Text as any).value);
        }
        let hasPageText: boolean = false;
        if (pageText && pageText.trim().length > 0) {
            hasPageText = true;
        }

        // -- If page has text, keep it and return --
        if (hasPageText) {
            return;
        }

        // -- Otherwise, try to use master placeholder text --
        if (!masterShape) { return; }

        let masterTextRaw: string = '';
        if (masterShape.Text && (masterShape.Text as any).value) {
            masterTextRaw = String((masterShape.Text as any).value);
        }
        if (!masterTextRaw || masterTextRaw.trim().length === 0) {
            return;
        }

        // -- Normalize master text using the same paragraph rules as page text --
        const normalized: string = normalizeParagraphBreaks(masterShape, masterTextRaw);

        // -- Apply content and ensure visibility --
        annotation.content = normalized;
        annotation.visible = true;
    }
}

/**
 * Resolves horizontal alignment for annotations.
 * Uses 'HorzAlign' for nodes and legacy 'VerticalAlign' mapping for connectors (when isConnector === true).
 * @param {VisioShapeNode} shape - The Visio shape node to inspect
 * @param {boolean} [isConnector] - When true, apply legacy connector mapping (VerticalAlign 0→Left, 2→Right)
 * @returns {'Left' | 'Center' | 'Right'} Horizontal alignment result
 */
function getHorizontalAlignment(
    shape: VisioShapeNode,
    isConnector?: boolean
): 'Left' | 'Center' | 'Right' {
    // Helper to map cell value to alignment string (branches only the switch-case based on isConnector)
    const mapValue: (val: string) => 'Left' | 'Center' | 'Right' = (val: string): 'Left' | 'Center' | 'Right' => {
        // Connector legacy mapping uses VerticalAlign: 0→Left, 2→Right, default→Center
        if (isConnector === true) {
            switch (val) {
            case '0':
                return 'Left';
            case '2':
                return 'Right';
            default:
                return 'Center';
            }
        }

        // Node mapping uses HorzAlign: 0→Left, 1→Center, 2→Right
        switch (val) {
        case '0':
            return 'Left';
        case '1':
            return 'Center';
        case '2':
            return 'Right';
        default:
            return 'Center';
        }
    };

    // Search top‑level cells first (HorzAlign for nodes; VerticalAlign for connectors handled by mapValue)
    const cells: VisioCell[] = ensureArray(shape.Cell);
    let found: VisioCell | undefined = undefined;

    // For connectors, we prefer VerticalAlign; for nodes, HorzAlign
    if (isConnector === true) {
        found = cells.find((c: VisioCell) => c && c.$ && c.$.N === 'VerticalAlign');
    } else {
        found = cells.find((c: VisioCell) => c && c.$ && c.$.N === 'HorzAlign');
    }

    // If not found, walk through sections->rows->cells
    if (!found) {
        const sectionBag: VisioSection | VisioSection[] | undefined =
            (shape as unknown as {
                Section?: VisioSection | VisioSection[];
            }).Section;
        const sections: VisioSection[] = Array.isArray(sectionBag) ? sectionBag : (sectionBag ? [sectionBag] : []);
        for (let si: number = 0; si < sections.length; si += 1) {
            const section: VisioSection = sections[parseInt(si.toString(), 10)];
            if (section && section.Row) {
                const rows: VisioRow[] = ensureArray(section.Row);
                for (let ri: number = 0; ri < rows.length; ri += 1) {
                    const row: VisioRow = rows[parseInt(ri.toString(), 10)];
                    const rowCells: VisioCell[] = ensureArray(row.Cell);
                    if (isConnector === true) {
                        const matchV: VisioCell | undefined = rowCells.find((c: VisioCell) => c && c.$ && c.$.N === 'VerticalAlign');
                        if (matchV) {
                            found = matchV;
                            break;
                        }
                    } else {
                        const matchH: VisioCell | undefined = rowCells.find((c: VisioCell) => c && c.$ && c.$.N === 'HorzAlign');
                        if (matchH) {
                            found = matchH;
                            break;
                        }
                    }
                }
            }
            if (found) {
                break;
            }
        }
    }

    // Return mapped value if a cell with value exists; default to 'Center'
    if (found && found.$ && found.$.V != null) {
        return mapValue(String(found.$.V));
    }
    return 'Center';
}

/**
 * Extracts and applies text constraint flags from a shape's cells.
 * Sets constraint properties like text editing, selection, and rotation locks.
 * @function getAnnotationConstraints
 * @param {any} shape - The annotation object to populate with constraint flags
 * @param {VisioCell[]} cells - The array of Cell objects from the shape
 * @returns {void} The modified shape object with constraint flags applied
 */
function getAnnotationConstraints(shape: any, cells: VisioCell[]): void {
    // Convert cells array to a map for easier lookup
    const cellMap: Map<string, CellMapValue> = mapCellValues(cells);

    // Array of lock constraint keys to check
    const lockKeys: string[] = [
        'LockTextEdit',
        'LockSelect',
        'LockRotate'
    ];

    // Iterate through lock keys and set boolean flags on shape
    // Convert value to true if it exists and is not '0'
    for (const key of lockKeys) {
        const value: CellMapValue = cellMap.get(key);
        shape[toCamelCase(key)] = value != null && value !== '0';
    }
}

/**
 * Resolves vertical alignment from Visio 'VerticalAlign' cell.
 * Uses the legacy connector mapping when `isConnector === true`, otherwise uses the updated node mapping.
 * @param {VisioShapeNode} shape - The Visio shape node containing cells
 * @param {boolean} [isConnector] - When true, apply old connector mapping (0→Bottom, 2→Top, default Center)
 * @returns {'Top' | 'Center' | 'Bottom'} Resolved vertical alignment
 */
function getVerticalAlignment(
    shape: VisioShapeNode,
    isConnector?: boolean
): 'Top' | 'Center' | 'Bottom' {
    // Find VerticalAlign cell
    const cells: VisioCell[] = ensureArray(shape.Cell);
    const cell: VisioCell = cells.find((c: VisioCell) => c && c.$ && c.$.N === 'VerticalAlign');

    // Fallback when not present or value is null/undefined
    if (!cell || !cell.$ || cell.$.V == null) {
        return 'Center';
    }

    // Connector path: restore old mapping (0→Bottom, 2→Top, default Center)
    if (isConnector === true) {
        switch (String(cell.$.V)) {
        case '0':
            return 'Bottom';
        case '2':
            return 'Top';
        default:
            return 'Center';
        }
    }

    // Node path: updated mapping (0→Top, 1→Center, 2→Bottom)
    switch (String(cell.$.V)) {
    case '0':
        return 'Top';
    case '1':
        return 'Center';
    case '2':
        return 'Bottom';
    default:
        return 'Center';
    }
}
