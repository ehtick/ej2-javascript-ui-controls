import { PdfNumberStyle } from '../../enumerator';
import { PdfFont, PdfStringFormat } from '../../fonts';
import { PdfPage } from '../../pdf-page';
import { _PdfReference, _PdfDictionary } from '../../pdf-primitives';
import { _formatNumber } from '../../utils';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfMultipleNumberValueField } from './multiple-number-value-field';
/**
 * Represents an automatic field that displays the page number within the current section.
 *
 * ```typescript
 * // Create a new document.
 * const document: PdfDocument = new PdfDocument();
 * // Add sections to the document.
 * const section: PdfSection = document.addSection();
 * // Initialize standard font.
 * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
 * // Initialize brush.
 * const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 255 });
 * // Create a section page number field.
 * const sectionPageNumberField: PdfSectionPageNumberField = new PdfSectionPageNumberField({ font: font, brush: brush });
 * // Add page to the section.
 * const page: PdfPage = section.addPage();
 * // Draw the section page number field
 * sectionPageNumberField.draw(page.graphics, { x: 150, y: 10 });
 * // Save the document.
 * document.save('Output.pdf');
 * // Destroy the document.
 * document.destroy();
 * ```
 */
export class PdfSectionPageNumberField extends PdfMultipleNumberValueField {
    /**
     * Initializes a new instance of the section page number field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add sections to the document.
     * const section: PdfSection = document.addSection();
     * // Create a section page number field.
     * const sectionPageNumberField: PdfSectionPageNumberField = new PdfSectionPageNumberField();
     * // Add page to the section.
     * const page: PdfPage = section.addPage();
     * // Draw the section page number field
     * sectionPageNumberField.draw(page.graphics, { x: 150, y: 10 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     */
    public constructor();
    /**
     * Initializes a new instance of the section page number field using the specified properties.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add sections to the document.
     * const section: PdfSection = document.addSection();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
     * // Initialize brush.
     * const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 255 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a section page number field.
     * const sectionPageNumberField: PdfSectionPageNumberField = new PdfSectionPageNumberField({ font: font, brush: brush, stringFormat: format, numberStyle: PdfNumberStyle.numeric });
     * // Add page to the section.
     * const page: PdfPage = section.addPage();
     * // Draw the section page number field
     * sectionPageNumberField.draw(page.graphics, { x: 150, y: 10 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @param {Object} properties - Configuration object used to define rendering behavior.
     * @param {PdfFont} [properties.font] - The font used to render the field text.
     * @param {PdfBrush} [properties.brush] - The brush used to define the text color.
     * @param {PdfStringFormat} [properties.stringFormat] - The format used for text layout and alignment.
     * @param {PdfNumberStyle} [properties.numberStyle] - The number style used to format the section page number.
     */
    public constructor(properties: {font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat,
        numberStyle?: PdfNumberStyle});
    public constructor(properties?: {font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat,
        numberStyle?: PdfNumberStyle}) {
        super();
        if (properties) {
            this._initializeBase(properties.font, properties.brush, properties.stringFormat);
            if (properties.numberStyle) {
                this._numberStyle = properties.numberStyle;
            }
        }
    }
    /**
     * Resolves page index within the current section.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {string} The formatted section page number.
     */
    _getValue(graphics: PdfGraphics): string {
        if (graphics) {
            const page: PdfPage = this._getPageFromGraphics(graphics);
            if (!page || !page._pageDictionary) {
                return _formatNumber(1, this._numberStyle);
            }
            const pageRef: _PdfReference = page._ref;
            const parentRef: _PdfReference = page._pageDictionary.getRaw('Parent');
            if (!pageRef || !parentRef) {
                return _formatNumber(1, this._numberStyle);
            }
            const parentDict: _PdfDictionary = page._crossReference._fetch(parentRef);
            if (!parentDict || !parentDict.has('Kids')) {
                return _formatNumber(1, this._numberStyle);
            }
            const kids: _PdfReference[] = parentDict.get('Kids');
            if (!Array.isArray(kids)) {
                return _formatNumber(1, this._numberStyle);
            }
            for (let i: number = 0; i < kids.length; i++) {
                const kidRef: _PdfReference = kids[<number>i];
                if (kidRef && kidRef.objectNumber === pageRef.objectNumber) {
                    return _formatNumber(i + 1, this._numberStyle);
                }
            }
        }
        return _formatNumber(1, this._numberStyle);
    }
}
