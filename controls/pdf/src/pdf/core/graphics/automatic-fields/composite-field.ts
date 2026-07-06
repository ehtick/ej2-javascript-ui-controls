import { PdfFont } from '../../fonts/pdf-standard-font';
import { PdfStringFormat } from '../../fonts/pdf-string-format';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfAutomaticField } from './automatic-field';
import { PdfMultipleValueField } from './multiple-value-field';
/**
 * Represents a composite field that combines multiple automatic fields.
 *
 * ```typescript
 * // Create a new document.
 * const document: PdfDocument = new PdfDocument();
 * // Adds a new page to the document
 * const page: PdfPage = document.addPage();
 * // Initialize a standard Helvetica font.
 * const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
 * // Create a solid brush for drawing text.
 * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
 * // Create a page number field.
 * const pageNumber: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush });
 * // Create a page count field.
 * const pageCount: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush });
 * // Combine fields into a composite with a formatted pattern.
 * const composite: PdfCompositeField = new PdfCompositeField({font: font, brush: brush, pattern: 'Page{0}/{1}', automaticFields: [pageNumber, pageCount] });
 * // Draw the composite field on page.
 * composite.draw(page.graphics, { x: 10, y: 10 });
 * // Save the document.
 * document.save('output.pdf');
 * // Destroy the document.
 * document.destroy();
 * ```
 */
export class PdfCompositeField extends PdfMultipleValueField {
    _automaticFields: PdfAutomaticField[] = [];
    _pattern: string = '';
    /**
     * Initializes a new instance of the composite field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Adds a new page to the document
     * const page: PdfPage = document.addPage();
     * // Initialize a standard Helvetica font.
     * const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Create a solid brush for drawing text.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Create a page number field.
     * const pageNumber: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush });
     * // Create a page count field.
     * const pageCount: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush });
     * // Combine fields into a composite with a formatted pattern.
     * const composite: PdfCompositeField = new PdfCompositeField();
     * // Assign composite field pattern to render
     * composite.pattern = 'Page{0}/{1}';
     * // Assign automatic field list
     * composite.automaticFields = [pageNumber, pageCount];
     * // Draw the composite field on page.
     * composite.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     */
    public constructor();
    /**
     * Initializes a new instance of the composite field with the specified properties.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Adds a new page to the document
     * const page: PdfPage = document.addPage();
     * // Initialize a standard Helvetica font.
     * const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Create a solid brush for drawing text.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a page number field.
     * const pageNumber: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush });
     * // Create a page count field
     * const pageCount: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush });
     * // Combine fields into a composite with a formatted pattern.
     * const composite: PdfCompositeField = new PdfCompositeField({font: font, brush: brush, stringFormat: format, pattern: 'Page{0}/{1}', automaticFields: [pageNumber, pageCount]});
     * // Draw the composite field on page.
     * composite.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @param {object} [properties]  Field configuration properties.
     * @param {PdfFont} [properties.font] The font used to render the field text.
     * @param {PdfBrush} [properties.brush] The brush used to draw the field text.
     * @param {PdfStringFormat} [properties.stringFormat] The string format used for layout and rendering.
     * @param {string} [properties.pattern] The format pattern.
     * @param {PdfAutomaticField[]} [properties.automaticFields] The collection of automatic fields.
     */
    public constructor(properties: {font?: PdfFont; brush?: PdfBrush; stringFormat?: PdfStringFormat;
        pattern?: string; automaticFields?: PdfAutomaticField[]});
    public constructor(properties?: {font?: PdfFont; brush?: PdfBrush; stringFormat?: PdfStringFormat;
        pattern?: string; automaticFields?: PdfAutomaticField[]}) {
        super();
        if (properties) {
            this._initializeBase(properties.font, properties.brush, properties.stringFormat);
            this._pattern = properties.pattern || '';
            this._automaticFields = properties.automaticFields || [];
        }
    }
    /**
     * Gets the collection of automatic fields associated with the composite field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Adds a new page to the document
     * const page: PdfPage = document.addPage();
     * // Initialize a standard Helvetica font.
     * const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Create a solid brush for drawing text.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a page number field.
     * const pageNumber: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush });
     * // Create a page count field
     * const pageCount: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush });
     * // Combine fields into a composite with a formatted pattern.
     * const composite: PdfCompositeField = new PdfCompositeField({font: font, brush: brush, stringFormat: format, pattern: 'Page{0}/{1}', automaticFields: [pageNumber, pageCount]});
     * // Get the collection of automatic fields from the composite field
     * const fields: PdfAutomaticField[] = composite.automaticFields;
     * // Draw the composite field on page.
     * composite.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @returns {PdfAutomaticField[]} The automatic fields used by the composite field.
     */
    get automaticFields(): PdfAutomaticField[] {
        return this._automaticFields;
    }
    /**
     * Sets the collection of automatic fields for the composite field
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add new page to document
     * const page: PdfPage = document.addPage();
     * // Initialize a standard Helvetica font.
     * const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Create a solid brush for drawing text.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a page number field.
     * const pageNumber: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush });
     * // Create a page count field
     * const pageCount: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush });
     * // Combine fields into a composite with a formatted pattern.
     * const composite: PdfCompositeField = new PdfCompositeField({font: font, brush: brush, stringFormat: format, pattern: 'Page{0}/{1}'});
     * // Set the collection of automatic fields to composite field.
     * composite.automaticFields = [pageNumber, pageCount];
     * // Draw the composite field on page.
     * composite.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     *
     * @param {PdfAutomaticField[]} value The automatic fields to associate with the composite field.
     */
    set automaticFields(value: PdfAutomaticField[]) {
        this._automaticFields = value;
    }
    /**
     * Gets the text pattern that defines how multiple automatic fields are combined and displayed.
     *
     * @returns {string} The composite text format string.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Adds a new page to the document
     * const page: PdfPage = document.addPage();
     * // Initialize a standard Helvetica font.
     * const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Create a solid brush for drawing text.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a page number field.
     * const pageNumber: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush });
     * // Create a page count field
     * const pageCount: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush });
     * // Combine fields into a composite with a formatted pattern.
     * const composite: PdfCompositeField = new PdfCompositeField({font: font, brush: brush, stringFormat: format, pattern: 'Page{0}/{1}', automaticFields: [pageNumber, pageCount]});
     * // Get the text pattern from the composite field.
     * const pattern: string = composite.pattern;
     * // Draw the composite field on page.
     * composite.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     *
     */
    get pattern(): string {
        return this._pattern;
    }
    /**
     * Sets the text pattern that defines how multiple automatic fields are combined and displayed.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Adds a new page to the document
     * const page: PdfPage = document.addPage();
     * // Initialize a standard Helvetica font.
     * const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Create a solid brush for drawing text.
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Initialize a string format.
     * const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);
     * // Create a page number field.
     * const pageNumber: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush });
     * // Create a page count field
     * const pageCount: PdfPageCountField = new PdfPageCountField({ font: font, brush: brush });
     * // Combine fields into a composite with a formatted pattern.
     * const composite: PdfCompositeField = new PdfCompositeField({font: font, brush: brush, stringFormat: format, automaticFields: [pageNumber, pageCount]});
     * // Set the text pattern for composite field.
     * composite.pattern = 'Page{0}/{1}';
     * // Draw the composite field on page.
     * composite.draw(page.graphics, { x: 10, y: 10 });
     * // Save the document.
     * document.save('output.pdf');
     * // Destroy the document.
     * document.destroy();
     *
     * @param {string} value The composite text format string.
     */
    set pattern(value: string) {
        this._pattern = value;
    }
    /**
     * Computes the composite field value.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {string} The formatted composite value.
     */
    _getValue(graphics: PdfGraphics): string {
        const values: string[] = [];
        for (const field of this._automaticFields) {
            values.push(field._getValue(graphics));
        }
        let result: string = this._pattern;
        for (let i: number = 0; i < values.length; i++) {
            result = result.replace(`{${i}}`, values[<number>i]);
        }
        return result;
    }
}
