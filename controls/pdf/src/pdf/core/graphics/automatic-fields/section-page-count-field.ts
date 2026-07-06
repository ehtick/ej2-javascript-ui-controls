import { PdfNumberStyle } from '../../enumerator';
import { PdfFont, PdfStringFormat } from '../../fonts';
import { PdfDocument } from '../../pdf-document';
import { PdfPage } from '../../pdf-page';
import { PdfSection } from '../../pdf-section';
import { _formatNumber } from '../../utils';
import { PdfBrush, PdfGraphics } from '../pdf-graphics';
import { PdfMultipleNumberValueField } from './multiple-number-value-field';
/**
 * Represents an automatic field that displays the total number of pages in the current section.
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
 * // Create a section page count field.
 * const sectionPageCountField: PdfSectionPageCountField = new PdfSectionPageCountField({ font: font, brush: brush });
 * // Add page to the section.
 * const page: PdfPage = section.addPage();
 * // Draw the section page count field
 * sectionPageCountField.draw(page.graphics, { x: 150, y: 10 });
 * // Save the document.
 * document.save('Output.pdf');
 * // Destroy the document.
 * document.destroy();
 * ```
 */
export class PdfSectionPageCountField extends PdfMultipleNumberValueField {
    /**
     * Initializes a new instance of the section page count field.
     *
     * ```typescript
     * // Create a new document.
     * const document: PdfDocument = new PdfDocument();
     * // Add sections to the document.
     * const section: PdfSection = document.addSection();
     * // Create a section page count field.
     * const sectionPageCountField: PdfSectionPageCountField = new PdfSectionPageCountField();
     * // Add page to the section.
     * const page: PdfPage = section.addPage();
     * // Draw the section page count field
     * sectionPageCountField.draw(page.graphics, { x: 150, y: 10 });
     * // Save the document.
     * document.save('Output.pdf');
     * // Destroy the document.
     * document.destroy();
     * ```
     */
    public constructor();
    /**
     * Initializes a new instance of the section page count field using the specified properties.
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
     * // Create a section page count field.
     * const sectionPageCountField: PdfSectionPageCountField = new PdfSectionPageCountField({ font: font, brush: brush, stringFormat: format, numberStyle: PdfNumberStyle.numeric });
     * // Add page to the section.
     * const page: PdfPage = section.addPage();
     * // Draw the section page count field
     * sectionPageCountField.draw(page.graphics, { x: 150, y: 10 });
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
     * @param {PdfNumberStyle} [properties.numberStyle] - The number style used to format the section page count.
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
     * Resolves total page count for the current section.
     *
     * @private
     * @param {PdfGraphics} graphics The graphics context.
     * @returns {string} The formatted section page count.
     */
    _getValue(graphics: PdfGraphics): string {
        if (graphics) {
            const page: PdfPage = this._getPageFromGraphics(graphics);
            if (!page) {
                return _formatNumber(1, this._numberStyle);
            }
            const sectionIndex: number = page._getSectionIndex();
            if (sectionIndex < 0) {
                return _formatNumber(1, this._numberStyle);
            }
            const document: PdfDocument = page._crossReference._document;
            const section: PdfSection = document._sections[<number>sectionIndex];
            if (section) {
                return _formatNumber(section._pageCount, this._numberStyle);
            }
        }
        return _formatNumber(1, this._numberStyle);
    }
}
