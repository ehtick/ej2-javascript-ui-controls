import { PdfNumberStyle } from '../../enumerator';
import { PdfFont } from '../../fonts/pdf-standard-font';
import { PdfStringFormat } from '../../fonts/pdf-string-format';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfMultipleValueField } from './multiple-value-field';
/**
 * Represents a field with multiple numeric values.
 *
 * @private
 */
export class PdfMultipleNumberValueField extends PdfMultipleValueField {
    /**
     * Gets or sets the number style used to format numeric values.
     *
     * @private
     */
    _numberStyle: PdfNumberStyle = PdfNumberStyle.numeric;
    /**
     * Initializes the base properties of the field.
     *
     * @param {PdfFont} [font] The font used to draw the text.
     * @param {PdfBrush} [brush] The brush used to render the text.
     * @param {PdfStringFormat} [stringFormat] The text layout and alignment settings.
     * @returns {void}
     * @private
     */
    _initializeBase(font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat): void {
        super._initializeBase(font, brush, stringFormat);
    }
    /**
     * Gets the current number formatting style of the field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add new page to document
     * const page: PdfPage = document.addPage();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Initialize solid brush
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Construct the field with specified properties.
     * const field: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush, numberStyle: PdfNumberStyle.numeric });
     * // Gets the current number formatting style of the field
     * const style: PdfNumberStyle = field.numberStyle;
     * // Draw the field on page graphics
     * field.draw(page.graphics, { x: 10, y: 10 });
     * // Save  the document.
     * document.save('Output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     *
     * @returns {PdfNumberStyle} The configured number style.
     */
    get numberStyle(): PdfNumberStyle {
        return this._numberStyle;
    }
    /**
     * Sets the number formatting style of the field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add new page to document
     * const page: PdfPage = document.addPage();
     * // Initialize standard font.
     * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 12);
     * // Initialize solid brush
     * const brush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
     * // Construct the field with specified properties.
     * const field: PdfPageNumberField = new PdfPageNumberField({ font: font, brush: brush});
     * // Sets the number formatting style of the field.
     * field.numberStyle = PdfNumberStyle.numeric;
     * // Draw the field on page graphics
     * field.draw(page.graphics, { x: 10, y: 10 });
     * // Save  the document.
     * document.save('Output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     *
     * @param {PdfNumberStyle} value The number formatting style to apply.
     */
    set numberStyle(value: PdfNumberStyle) {
        this._numberStyle = value;
    }
    /**
     * Returns the string representation of the field’s value used during rendering.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context used for rendering.
     * @returns {string} The formatted value to be rendered.
     */
    _getValue(graphics: PdfGraphics): string { // eslint-disable-line
        return '';
    }
}
