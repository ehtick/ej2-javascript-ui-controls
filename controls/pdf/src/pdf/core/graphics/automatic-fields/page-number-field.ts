import { PdfNumberStyle } from '../../enumerator';
import { PdfFont } from '../../fonts/pdf-standard-font';
import { PdfStringFormat } from '../../fonts/pdf-string-format';
import { PdfPage } from '../../pdf-page';
import { _formatNumber } from '../../utils';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfMultipleNumberValueField } from './multiple-number-value-field';
/**
 * Represents an automatic field that displays the current page number.
 *
 * ```typescript
 * // Create a new document.
 * const document: PdfDocument = new PdfDocument();
 * // Add new page to document.
 * const page: PdfPage = document.addPage();
 * // Initialize standard font.
 * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 12);
 * // Initialize brush.
 * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
 * // Create a page-number field.
 * const pageNumberField: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush });
 * // Use numeric formatting for the page number.
 * pageNumberField.numberStyle = PdfNumberStyle.numeric;
 * // Draw page number field on page graphics.
 * pageNumberField.draw(page.graphics, { x: 250, y: 750 });
 * // Save the document.
 * document.save('Output.pdf');
 * // Destroy the document.
 * document.destroy();
 * ```
 */
export class PdfPageNumberField extends PdfMultipleNumberValueField {
    /**
     * Initializes a new instance of the page number field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add new page to document.
     * const page: PdfPage = document.addPage();
     * // Create a page-number field.
     * const pageNumberField: PdfPageNumberField = new PdfPageNumberField();
     * // Use numeric formatting for the page number.
     * pageNumberField.numberStyle = PdfNumberStyle.numeric;
     * // Draw page number field on page graphics.
     * pageNumberField.draw(page.graphics, { x: 250, y: 750 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     */
    public constructor();
    /**
     * Initializes a new instance of the page number field with the specified properties.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add page to the document.
     * const page: PdfPage = document.addPage();
     * // Initialize the standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
     * // Initialize solid brush.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create the page number field.
     * const pageNumberField: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush, stringFormat: format, numberStyle: PdfNumberStyle.lowerLatin});
     * // Draw the page count on page.
     * pageNumberField.draw(page.graphics, { x: 10, y: 10 });
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
     * @param {PdfNumberStyle} [properties.numberStyle] - The number style used to format the page number.
     */
    public constructor(properties: {font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat, numberStyle?: PdfNumberStyle});
    public constructor(properties?: {font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat, numberStyle?: PdfNumberStyle}) {
        super();
        if (properties) {
            this._initializeBase(properties.font, properties.brush, properties.stringFormat);
            if (properties.numberStyle) {
                this._numberStyle = properties.numberStyle;
            }
        }
    }
    /**
     * Gets the current page number.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {string} The formatted page number.
     */
    _getValue(graphics: PdfGraphics): string {
        if (graphics) {
            const page: PdfPage = this._getPageFromGraphics(graphics);
            if (page && page._crossReference && page._crossReference._document) {
                return _formatNumber(page._pageIndex + 1, this._numberStyle);
            }
        }
        return '1';
    }
    /**
     * Gets page number for loaded documents.
     *
     * @private
     * @param {any} page The loaded page.
     * @returns {string} The formatted page number.
     */
    _internalLoadedGetValue(page: PdfPage): string {
        if (page) {
            return _formatNumber(page._pageIndex + 1, this._numberStyle);
        }
        return '1';
    }
}
