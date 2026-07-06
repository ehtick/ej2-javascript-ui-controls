import { PdfFont } from '../../fonts/pdf-standard-font';
import { PdfStringFormat } from '../../fonts/pdf-string-format';
import { PdfPage } from '../../pdf-page';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfAutomaticField } from './automatic-field';
/**
 * Represents an abstract class for all dynamic fields.
 *
 * ```typescript
 * // Create a new document.
 * const document: PdfDocument = new PdfDocument();
 * // Create the first section within the document.
 * const section: PdfSection = document.addSection();
 * // Add a page to section1.
 * let page: PdfPage = section.addPage();
 * // Initialize the standard font.
 * const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 13);
 * // Initialize the solid brush.
 * const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 255 });
 * // Create a dynamic field with font and brush.
 * const sectionNumField: PdfDynamicField = new PdfSectionNumberField({ font: font, brush: brush });
 * // Draw the section number field field onto the page graphics.
 * sectionNumField.draw(page.graphics, { x: 150, y: 10 });
 * // Save the document.
 * document.save('output.pdf');
 * // Destroy the document.
 * document.destroy();
 * ```
 */
export abstract class PdfDynamicField extends PdfAutomaticField {
    /**
     * Initializes the base properties of the automatic field.
     *
     * @param {PdfFont} [font] The font used to draw the text.
     * @param {PdfBrush} [brush] The brush used to render the text.
     * @param {PdfStringFormat} [stringFormat] The text layout and alignment settings.
     * @returns {void} Method return nothing.
     * @private
     */
    _initializeBase(font?: PdfFont, brush?: PdfBrush, stringFormat?: PdfStringFormat): void {
        super._initializeBase(font, brush, stringFormat);
    }
    /**
     * Resolves the runtime page from the graphics context.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {PdfPage} The current page.
     */
    _getPageFromGraphics(graphics: PdfGraphics): PdfPage {
        return graphics._page;
    }
}
