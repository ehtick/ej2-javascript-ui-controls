import { PdfNumberStyle } from '../../enumerator';
import { PdfFont, PdfStringFormat } from '../../fonts';
import { PdfDocument } from '../../pdf-document';
import { PdfPage } from '../../pdf-page';
import { _formatNumber } from '../../utils';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfSingleValueField } from './single-value-field';
/**
 * Represents an automatic field that displays the total number of pages in the document.
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
 * // Create the page count field.
 * const pageCountField: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush });
 * // Draw the page count on page.
 * pageCountField.draw(page.graphics, { x: 10, y: 10 });
 * // Save the document.
 * document.save('Output.pdf');
 * // Destroy the document.
 * document.destroy();
 * ```
 */
export class PdfPageCountField extends PdfSingleValueField {
    /**
     * Specifies the number style used for formatting the field value.
     *
     * @private
     */
    _numberStyle: PdfNumberStyle = PdfNumberStyle.numeric;
    /**
     * Initializes a new instance of the page count field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add page to the document.
     * const page: PdfPage = document.addPage();
     * // Create the page count field.
     * const pageCountField: PdfPageCountField = new PdfPageCountField();
     * // Draw the page count on page.
     * pageCountField.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     */
    public constructor();
    /**
     * Initializes a new instance of the page count field using the specified properties.
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
     * // Create the page count field.
     * const pageCountField: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush, stringFormat: format, numberStyle: PdfNumberStyle.lowerLatin});
     * // Draw the page count on page.
     * pageCountField.draw(page.graphics, { x: 10, y: 10 });
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
     * @param {PdfNumberStyle} [properties.numberStyle] - The number style used to format the page count.
     */
    public constructor(properties: { font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat,
        numberStyle?: PdfNumberStyle});
    public constructor(properties?: { font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat,
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
     * Gets the number formatting style currently used to render the page count.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add page to the document.
     * const page: PdfPage = document.addPage();
     * // Create the page count field.
     * const pageCountField: PdfPageCountField = new PdfPageCountField({numberStyle: PdfNumberStyle.lowerLatin});
     * // Get the number formatting style currently used to render the page count.
     * const style: PdfNumberStyle = pageCountField.numberStyle;
     * // Draw the page count on page.
     * pageCountField.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @returns {PdfNumberStyle} The current number formatting style.
     */
    get numberStyle(): PdfNumberStyle {
        return this._numberStyle;
    }
    /**
     * Sets the number formatting style used to render the page count.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add page to the document.
     * const page: PdfPage = document.addPage();
     * // Create the page count field.
     * const pageCountField: PdfPageCountField = new PdfPageCountField({numberStyle: PdfNumberStyle.lowerLatin});
     * // Set the number formatting style used to render the page count.
     * pageCountField.numberStyle = PdfNumberStyle.lowerLatin;
     * // Draw the page count on page.
     * pageCountField.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @param {PdfNumberStyle} value The number formatting style to apply.
     */
    set numberStyle(value: PdfNumberStyle) {
        this._numberStyle = value;
    }
    /**
     * Resolves total page count.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {string} The formatted page count.
     */
    _getValue(graphics: PdfGraphics): string {
        if (graphics) {
            const page: PdfPage = this._getPageFromGraphics(graphics);
            if (page && page._crossReference && page._crossReference._document) {
                const doc: PdfDocument = page._crossReference._document as PdfDocument;
                const pageCount: number = doc.pageCount;
                return _formatNumber(pageCount, this._numberStyle);
            }
        }
        return '1';
    }
}
