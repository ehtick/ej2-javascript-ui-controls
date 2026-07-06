import { PdfNumberStyle } from '../../enumerator';
import { PdfStringFormat } from '../../fonts';
import { PdfFont } from '../../fonts/pdf-standard-font';
import { PdfPage } from '../../pdf-page';
import { _formatNumber } from '../../utils';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfMultipleNumberValueField } from './multiple-number-value-field';
/**
 * Represents an automatic field that provides the section number for the current page within the document.
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
 * // Create a section number field.
 * const sectionNumberField: PdfSectionNumberField = new PdfSectionNumberField({ font: font, brush: brush });
 * // Add page to the section.
 * const page: PdfPage = section.addPage();
 * // Draw the section number
 * sectionNumberField.draw(page.graphics, { x: 150, y: 10 });
 * // Save the document.
 * document.save('Output.pdf');
 * // Destroy the document.
 * document.destroy();
 * ```
 */
export class PdfSectionNumberField extends PdfMultipleNumberValueField {
    /**
     * Initializes a new instance of the section number field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add sections to the document.
     * const section: PdfSection = document.addSection();
     * // Create a section number field.
     * const sectionNumberField: PdfSectionNumberField = new PdfSectionNumberField();
     * // Add page to the section.
     * const page: PdfPage = section.addPage();
     * // Draw the section number
     * sectionNumberField.draw(page.graphics, { x: 150, y: 10 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     */
    public constructor();
    /**
     * Initializes a new instance of the section number field using the specified properties.
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
     * // Create a section number field.
     * const sectionNumberField: PdfSectionNumberField = new PdfSectionNumberField({ font: font, brush: brush, stringFormat: format, numberStyle: PdfNumberStyle.numeric });
     * // Add page to the section.
     * const page: PdfPage = section.addPage();
     * // Draw the section number
     * sectionNumberField.draw(page.graphics, { x: 150, y: 10 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     *
     * @param {Object} properties - Configuration object used to define rendering behavior.
     * @param {PdfFont} [properties.font] - The font used to render the field text.
     * @param {PdfBrush} [properties.brush] - The brush used to define the text color.
     * @param {PdfStringFormat} [properties.stringFormat] - The format used for text layout and alignment.
     * @param {PdfNumberStyle} [properties.numberStyle] - The number style used to format the section number.
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
     * Resolves section number for the current page.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {string} The formatted section number.
     */
    _getValue(graphics: PdfGraphics): string {
        const page: PdfPage = this._getPageFromGraphics(graphics);
        if (page && page._pageDictionary) {
            const sectionIndex: number = page._getSectionIndex();
            if (sectionIndex >= 0) {
                return _formatNumber(sectionIndex + 1, this._numberStyle);
            }
        }
        return _formatNumber(1, this._numberStyle);
    }
}
