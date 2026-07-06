import { PdfNumberStyle } from '../../enumerator';
import { PdfFont } from '../../fonts/pdf-standard-font';
import { PdfStringFormat } from '../../fonts/pdf-string-format';
import { PdfPage } from '../../pdf-page';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfPageNumberField } from './page-number-field';
/**
 * Represents an automatic field that shows the page number of a specified destination page within the document.
 *
 * ```typescript
 * // Create a new document.
 * const document: PdfDocument = new PdfDocument();
 * // Initialize standard font.
 * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
 * // Initialize brush.
 * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
 * // Create a destination page number field with the specified properties.
 * const destinationPageField: PdfDestinationPageNumberField = new PdfDestinationPageNumberField({ font: font, brush: brush });
 * // Add pages and set the destination to the final page and draw the field there.
 * for (let i = 0; i < 5; i++) {
 *   const page: PdfPage = document.addPage();
 *   if (i === 4) {
 *      destinationPageField.page = page;
 *      destinationPageField.draw(page.graphics, { x: 10, y: 10 });
 *   }
 * }
 * // Save the document.
 * document.save('output.pdf');
 * // Destroy the document.
 * document.destroy();
 * ```
 */
export class PdfDestinationPageNumberField extends PdfPageNumberField {
    /**
     * Gets or sets the destination page associated with the field.
     *
     * @private
     */
    _page: PdfPage;
    /**
     * Initializes a new instance of the destination page number field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
     * // Initialize brush.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Create a destination page number field.
     * const destinationPageField: PdfDestinationPageNumberField = new PdfDestinationPageNumberField();
     * // Add pages and set the destination to the final page and draw the field there.
     * for (let i = 0; i < 5; i++) {
     *   const page: PdfPage = document.addPage();
     *   if (i === 4) {
     *      destinationPageField.page = page;
     *      destinationPageField.draw(page.graphics, { x: 10, y: 10 });
     *   }
     * }
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     */
    public constructor();
    /**
     * Initializes a new instance of the destination page number field using the specified properties.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add new page to document
     * const page: PdfPage = document.addPage();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
     * // Initialize brush.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a destination page number field with the specified properties.
     * const destinationPageField: PdfDestinationPageNumberField = new PdfDestinationPageNumberField({font: font, brush: brush, stringFormat: format, numberStyle: PdfNumberStyle.numeric, page: page);
     * // Draw the destination page field.
     * destinationPageField.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @param {Object} properties Configuration properties for the field.
     * @param {PdfFont} [properties.font] The font used to render the destination page number.
     * @param {PdfBrush} [properties.brush] The brush used to draw the destination page number.
     * @param {PdfStringFormat} [properties.stringFormat] The text layout and alignment settings.
     * @param {PdfNumberStyle} [properties.numberStyle] The numbering style used to display the destination page number.
     * @param {PdfPage} [properties.page] The destination page whose page number will be displayed.
     */
    public constructor(properties: {font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat,
        numberStyle?: PdfNumberStyle, page?: PdfPage});
    public constructor(properties?: {font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat,
        numberStyle?: PdfNumberStyle, page?: PdfPage}) {
        super(properties);
        if (properties && properties.page) {
            this._page = properties.page;
        }
    }
    /**
     * Gets the currently assigned destination page.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add new page to document
     * const page: PdfPage = document.addPage();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
     * // Initialize brush.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a destination page number field with the specified properties.
     * const destinationPageField: PdfDestinationPageNumberField = new PdfDestinationPageNumberField({font: font, brush: brush, stringFormat: format, numberStyle: PdfNumberStyle.numeric, page: page});
     * // Get the assigned destination page
     * const destinationPage: PdfPage = destinationPageField.page;
     * // Draw the destination page field.
     * destinationPageField.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @returns {PdfPage} The destination page.
     */
    get page(): PdfPage {
        return this._page;
    }
    /**
     * Sets the destination page of the field.
     *
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add new page to document
     * const page: PdfPage = document.addPage();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
     * // Initialize brush.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a destination page number field with the specified properties.
     * const destinationPageField: PdfDestinationPageNumberField = new PdfDestinationPageNumberField({font: font, brush: brush, stringFormat: format, numberStyle: PdfNumberStyle.numeric});
     * // Set destination and draw on the destination page.
     * destinationPageField.page = page;
     * // Draw the destination page field.
     * destinationPageField.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @param {PdfPage} value The destination page.
     */
    set page(value: PdfPage) {
        this._page = value;
    }
    /**
     * Resolves destination page number.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {string} The formatted page number.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getValue(graphics: PdfGraphics): string {
        if (this._page) {
            return this._internalLoadedGetValue(this._page);
        }
        return '1';
    }
}
