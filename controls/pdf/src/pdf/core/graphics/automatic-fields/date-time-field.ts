import { PdfFont, PdfStringFormat } from '../../fonts';
import { _padStart } from '../../utils';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfStaticField } from './static-field';
/**
 * Represents an automatic field that displays the current date and time at the time of creation.
 *
 * ```typescript
 * // Create a new document.
 * const document: PdfDocument = new PdfDocument();
 * // Add pages to the document.
 * const page: PdfPage = document.addPage();
 * // Initialize standard font.
 * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 12);
 * // Initialize brush.
 * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
 * // Create the date-time field.
 * const dateTimeField: PdfDateTimeField = new PdfDateTimeField({ font: font, brush: brush });
 * // Draw the date-time field on page.
 * dateTimeField.draw(page.graphics, { x: 10, y: 10 });
 * // Save the document.
 * document.save('output.pdf');
 * // Destroy the document
 * document.destroy();
 * ```
 */
export class PdfDateTimeField extends PdfStaticField {
    /**
     * Gets or sets the creation date of the document.
     *
     * @private
     */
    _date: Date;
    /**
     * Gets or sets the format string used to display the creation date.
     *
     * @private
     */
    _formatString: string = 'yyyy/MM/dd';
    /**
     * Initializes a new instance of the date and time field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add pages to the document.
     * const page: PdfPage = document.addPage();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Initialize brush.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Create the date-time field.
     * const dateTimeField: PdfDateTimeField = new PdfDateTimeField();
     * // Draw the date-time field on page.
     * dateTimeField.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     */
    public constructor();
    /**
     * Initializes a new instance of the date and time field using the specified properties.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add page to the document.
     * const page: PdfPage = document.addPage();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Initialize brush.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create the date-time field.
     * const dateTimeField: PdfDateTimeField = new PdfDateTimeField({ font: font, brush: brush, stringFormat: format });
     * // Draw the date-time field on page.
     * dateTimeField.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @param {Object} [properties] Optional configuration properties to customize the field.
     * @param {PdfFont} [properties.font] The font used to render the text.
     * @param {PdfBrush} [properties.brush] The brush used to draw the text.
     * @param {PdfStringFormat} [properties.stringFormat] The text layout and alignment settings.
     */
    public constructor(properties: {font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat});
    public constructor(properties?: {font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat}) {
        super();
        if (properties) {
            this._initializeBase(properties.font, properties.brush, properties.stringFormat);
        }
        this._date = new Date();
    }
    /**
     * Resolves formatted date/time value.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {string} The formatted date/time.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getValue(graphics: PdfGraphics): string {
        return this._formatDate(this._date, this._formatString);
    }
    /**
     * Formats a date according to the format string.
     *
     * @private
     * @param {Date} date The date to format.
     * @param {string} format The format string.
     * @returns {string} The formatted date.
     */
    private _formatDate(date: Date, format: string): string {
        const year: number = date.getFullYear();
        const month: string = _padStart(String(date.getMonth() + 1), 2, '0');
        const day: string = _padStart(String(date.getDate()), 2, '0');
        return format
            .replace('yyyy', String(year))
            .replace('MM', month)
            .replace('dd', day);
    }
}
