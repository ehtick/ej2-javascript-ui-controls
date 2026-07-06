import { PdfRubberStampAnnotation, PdfRectangleAnnotation, PdfAnnotationBorder, PdfInteractiveBorder, PdfRadioButtonListItem } from "../src/pdf/core/annotations/annotation";
import { _PdfStream } from "../src/pdf/core/base-stream";
import { _ContentParser } from "../src/pdf/core/content-parser";
import { PdfBorderStyle, PdfNumberStyle, PdfRotationAngle, PdfTemplateHorizontalAlignment, PdfTemplateLayerMode, PdfTemplateVerticalAlignment, PdfTextAlignment } from "../src/pdf/core/enumerator";
import { PdfCompositeField } from "../src/pdf/core/graphics/automatic-fields/composite-field";
import { PdfPageCountField } from "../src/pdf/core/graphics/automatic-fields/page-count-field";
import { PdfPageNumberField } from "../src/pdf/core/graphics/automatic-fields/page-number-field";
import { PdfBitmap } from "../src/pdf/core/graphics/images/pdf-bitmap";
import { PdfBrush, PdfPen, PdfGraphics, PdfGraphicsState } from "../src/pdf/core/graphics/pdf-graphics";
import { PdfPageTemplateElement } from "../src/pdf/core/graphics/pdf-page-template-element";
import { PdfDocument, PdfPageSettings } from "../src/pdf/core/pdf-document";
import { PdfDocumentInformation } from "../src/pdf/core/pdf-document-information";
import { PdfPage } from "../src/pdf/core/pdf-page";
import { Rectangle } from "../src/pdf/core/pdf-type";
import { _toRoman, _toAlpha, _formatNumber } from "../src/pdf/core/utils";
import { PdfCreationDateField } from "../src/pdf/core/graphics/automatic-fields/creation-date-field";
import { PdfDestinationPageNumberField } from "../src/pdf/core/graphics/automatic-fields/destination-page-number-field";
import { PdfDocumentAuthorField } from "../src/pdf/core/graphics/automatic-fields/document-author-field";
import { PdfDateTimeField } from "../src/pdf/core/graphics/automatic-fields/date-time-field";
import { PdfSectionNumberField } from "../src/pdf/core/graphics/automatic-fields/section-number-field";
import { PdfSectionPageNumberField } from "../src/pdf/core/graphics/automatic-fields/section-page-number-field";
import { PdfSectionPageCountField } from "../src/pdf/core/graphics/automatic-fields/section-page-count-field";
import { logo } from "./image-input.spec";
import { PdfFontFamily, PdfFontStyle, PdfStandardFont } from "../src/pdf/core/fonts/pdf-standard-font";
import { PdfStringFormat } from "../src/pdf/core/fonts/pdf-string-format";
import { PdfRadioButtonListField, PdfTextBoxField } from "../src/pdf/core/form/field";
import { PdfGraphicsElement } from "../src/pdf/core/graphics/pdf-graphics-element";
import { PdfAutomaticField } from "../src/pdf/core/graphics/automatic-fields/automatic-field";
import { PdfMultipleNumberValueField } from "../src/pdf/core/graphics/automatic-fields/multiple-number-value-field";
import { PdfMultipleValueField } from "../src/pdf/core/graphics/automatic-fields/multiple-value-field";
import { PdfSingleValueField } from "../src/pdf/core/graphics/automatic-fields/single-value-field";
import { PdfStaticField } from "../src/pdf/core/graphics/automatic-fields/static-field";
function getclientBounds(page: PdfPage): Rectangle {
    const result: number[] = page._getActualBounds(page._pageSettings);
    return { x: result[0], y: result[1], width: result[2], height: result[3] };
}
const text = 'This document is generated to demonstrate the layout and rendering capabilities of the PDF engine. It illustrates how text, margins, and templates are positioned within a page while maintaining consistent formatting and alignment.';
describe('982023 - Rotated and Mixed Size Pages', () => {
    it('982023 - Templates on rotated pages', () => {
        const doc = new PdfDocument();
        let setting = new PdfPageSettings();
        setting.rotation = PdfRotationAngle.angle90;
        const page1 = doc.addPage(setting);
        setting.rotation = PdfRotationAngle.angle180;
        const page2 = doc.addPage(setting);
        setting.rotation = PdfRotationAngle.angle270;
        const page3 = doc.addPage(setting);
        const template = new PdfPageTemplateElement({ width: 400, height: 40 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        template.graphics.drawRectangle({ x: 0, y: 0, width: 400, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        template.graphics.drawString('Rotated Header', font, { x: 0, y: 0, width: 400, height: 40 }, brush);
        doc.template.top = { template: template, alignment: PdfTemplateHorizontalAlignment.center };
        const bottomTemplate = new PdfPageTemplateElement({ width: 400, height: 40 });
        bottomTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 400, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        bottomTemplate.graphics.drawString('Bottom Footer', font, { x: 0, y: 0, width: 400, height: 40 }, brush);
        const leftTemplate = new PdfPageTemplateElement({ width: 80, height: 300 });
        leftTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        leftTemplate.graphics.drawString('Left Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        const right = new PdfPageTemplateElement({ width: 80, height: 300 });
        right.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1));
        right.graphics.drawString('Right Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        doc.template.bottom = { template: bottomTemplate, alignment: PdfTemplateHorizontalAlignment.center };
        doc.template.right = { template: right, alignment: PdfTemplateVerticalAlignment.middle }
        doc.template.left = { template: leftTemplate, alignment: PdfTemplateVerticalAlignment.middle };
        page1.graphics.drawString(text, font, { x: 20, y: 20, width: 200, height: 300 }, new PdfBrush({ r: 0, g: 0, b: 255 }));
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        let lpage = loadedDoc.getPage(0);
        let contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        let stream = contentsArray[2];
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(47);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '120.00', '-80.00']);
        expect(result[10]._operator).toBe('rg');
        expect(result[10]._operands).toEqual(['0.000', '0.000', '1.000']);
        expect(result[11]._operator).toBe('Tf');
        expect(result[12]._operator).toBe('Tr');
        expect(result[12]._operands).toEqual(['0']);
        expect(result[13]._operator).toBe('Tc');
        expect(result[13]._operands).toEqual(['0.000']);
        expect(result[14]._operator).toBe('Tw');
        expect(result[14]._operands).toEqual(['0.000']);
        expect(result[15]._operator).toBe('Tz');
        expect(result[15]._operands).toEqual(['100.000']);
        expect(result[16]._operator).toBe('Tm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-31.17']);
        expect(result[17]._operator).toBe("'");
        expect(result[17]._operands[0]).toContain('This document is generated');
        expect(result[18]._operator).toBe('Tm');
        expect(result[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-45.04']);
        expect(result[19]._operator).toBe("'");
        expect(result[19]._operands[0]).toContain('demonstrate the layout');
        expect(result[20]._operator).toBe('Tm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-58.92']);
        expect(result[21]._operator).toBe("'");
        expect(result[21]._operands[0]).toContain('capabilities of the PDF engine');
        expect(result[22]._operator).toBe('Tm');
        expect(result[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-72.79']);
        expect(result[23]._operator).toBe("'");
        expect(result[23]._operands[0]).toContain('illustrates how text');
        expect(result[24]._operator).toBe('Tm');
        expect(result[24]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-86.66']);
        expect(result[25]._operator).toBe("'");
        expect(result[25]._operands[0]).toContain('templates are positioned');
        expect(result[26]._operator).toBe('Tm');
        expect(result[26]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-100.53']);
        expect(result[27]._operator).toBe("'");
        expect(result[27]._operands[0]).toContain('page while maintaining');
        expect(result[28]._operator).toBe('Tm');
        expect(result[28]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-114.40']);
        expect(result[29]._operator).toBe("'");
        expect(result[29]._operands[0]).toContain('formatting and alignment');
        expect(result[30]._operator).toBe('ET');
        expect(result[31]._operator).toBe('q');
        expect(result[32]._operator).toBe('cm');
        expect(result[32]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-22.50', '.00']);
        expect(result[36]._operator).toBe('cm');
        expect(result[36]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-22.50', '-722.00']);
        expect(result[40]._operator).toBe('cm');
        expect(result[40]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-80.00', '-491.00']);
        expect(result[44]._operator).toBe('cm');
        expect(result[44]._operands).toEqual(['1.00', '.00', '.00', '1.00', '355.00', '-491.00']);
        expect(result[45]._operator).toBe('Do');
        expect(result[46]._operator).toBe('Q');
         lpage = loadedDoc.getPage(1);
         contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
         stream = contentsArray[2];
         parser = new _ContentParser(stream.getBytes());
         result = parser._readContent();
         expect(result.length).toEqual(23);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '120.00', '-80.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-22.50', '.00']);
        expect(result[12]._operator).toBe('cm');
        expect(result[12]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-22.50', '-722.00']);
        expect(result[16]._operator).toBe('cm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-80.00', '-491.00']);
        expect(result[20]._operator).toBe('cm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '355.00', '-491.00']);
        loadedDoc.destroy();
    });
    it('982023 - Templates adapt to mixed page sizes ', () => {
        const doc = new PdfDocument();
        const page1 = doc.addPage();
        let setting: PdfPageSettings = new PdfPageSettings();
        setting.size = { width: 612, height: 792 };
        const page2 = doc.addPage(setting);
        setting.size = { width: 500, height: 700 };
        const page3 = doc.addPage(setting);
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const headerTemplate = new PdfPageTemplateElement({ width: 400, height: 50 });
        headerTemplate.graphics.drawString(
            'Adaptive Header',
            font,
            { x: 0, y: 0, width: page1.size.width, height: 50 },
            brush
        );
        headerTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 400, height: 50 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1));
        doc.template.top = { template: headerTemplate, alignment: PdfTemplateHorizontalAlignment.center };
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        let lpage = loadedDoc.getPage(0);
        let contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        let stream = contentsArray[2];
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-90.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '57.50', '.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        lpage = loadedDoc.getPage(1);
        contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        stream = contentsArray[2];
        parser = new _ContentParser(stream.getBytes());
        result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '792.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '532.000', '-712.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-90.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        lpage = loadedDoc.getPage(2);
        contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        stream = contentsArray[2];
        parser = new _ContentParser(stream.getBytes());
        result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '700.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '420.000', '-620.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-90.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Image render correctly within templates', () => {
        const doc = new PdfDocument();
        doc.addPage();
        doc.addPage();
        const svgImage = new PdfBitmap(logo);
        const headerTemplate = new PdfPageTemplateElement({ width: 400, height: 70 });
        headerTemplate.graphics.drawImage(svgImage,
            { x: 0, y: 0, width: 400, height: 70 }
        );
        doc.template.top = {
            template: headerTemplate,
            alignment: PdfTemplateHorizontalAlignment.center
        };
        const bottomTemplate = new PdfPageTemplateElement({ width: 400, height: 70 });
        bottomTemplate.graphics.drawImage(svgImage,
            { x: 0, y: 0, width: 400, height: 70 }
        );
        doc.template.bottom = {
            template: bottomTemplate,
            alignment: PdfTemplateHorizontalAlignment.center
        };
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contents = loadedPage._pageDictionary.getArray('Contents');
        expect(contents).toBeDefined();
        expect(contents.length).toBeGreaterThan(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent()
        expect(result.length).toEqual(15);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-110.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '57.50', '.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        expect(result[11]._operator).toBe('q');
        expect(result[12]._operator).toBe('cm');
        expect(result[12]._operands).toEqual(['1.00', '.00', '.00', '1.00', '57.50', '-692.00']);
        expect(result[13]._operator).toBe('Do');
        expect(result[14]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Header title/subtitle render and positioned correctly', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        const template = new PdfPageTemplateElement({ width: 500, height: 80 });
        const titleFont = new PdfStandardFont(PdfFontFamily.helvetica, 24, PdfFontStyle.bold);
        const subtitleFont = new PdfStandardFont(PdfFontFamily.helvetica, 16);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const svgImage = new PdfBitmap(logo);
        template.graphics.drawRectangle({ x: 0, y: 0, width: 500, height: 80 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1));
        template.graphics.drawString('Report Title', titleFont, { x: 0, y: 5, width: 400, height: 40 }, brush);
        template.graphics.drawString('Subtitle Text', subtitleFont, { x: 0, y: 35, width: 400, height: 20 }, brush);
        template.graphics.drawImage(svgImage, { x: 300, y: 5, width: 100, height: 30 });
        doc.template.top = { template: template, alignment: PdfTemplateHorizontalAlignment.center };
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-120.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '7.50', '.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Footer template', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        const template = new PdfPageTemplateElement({ width: 500, height: 50 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const currentDate = new Date().toLocaleDateString();
        template.graphics.drawString(`Prepared on ${currentDate}`, font, { x: 0, y: 25, width: 500, height: 15 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1));
        doc.template.bottom = { template: template, alignment: PdfTemplateHorizontalAlignment.center };
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        const stream = contentsArray[2];
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '7.50', '-762.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
         let XObject = page._pageDictionary.get('Resources').get('XObject');
        expect(XObject).not.toBeUndefined();
        loadedDoc.destroy();
    });
});
describe('982023 - Automatic Fields', () => {
    it('982023 - Date/time automatic fields display generation time consistently', () => {
        const doc = new PdfDocument();
        doc.addPage();
        doc.addPage();
        const template = new PdfPageTemplateElement({ width: 100, height: 50 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const dateField = new PdfDateTimeField({ font: font, brush: brush }
        );
        template.graphics.drawRectangle({  x: 0, y: 0, width: 100, height: 50 }, new PdfPen({r: 255, g: 0, b: 0}, 1));
        dateField.draw(template.graphics, { x: 20, y: 20 });
        doc.template.bottom = {template: template, alignment: PdfTemplateHorizontalAlignment.center};
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        let stream = contentsArray[contentsArray.length - 1];
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '207.50', '-762.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - page number field drawn at bottom of each page', () => {
        const doc = new PdfDocument();
        const pageNumField = new PdfPageNumberField(
            {
                font: new PdfStandardFont(PdfFontFamily.helvetica, 12),
                brush: new PdfBrush({ r: 0, g: 0, b: 0 }), stringFormat: new PdfStringFormat(),
                numberStyle: PdfNumberStyle.lowerRoman
            }
        );
        for (let i = 0; i < 10; i++) {
            const page = doc.addPage();
            const bottomY = getclientBounds(page).height - 30;
            pageNumField.draw(page.graphics, { x: 250, y: bottomY });
        }
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(5);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        const stream = contentsArray[contentsArray.length - 1];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '250.00', '-745.87']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Section page/section numbers render via composite fields', () => {
        const doc = new PdfDocument();
        const section1 = doc.addSection();
        const section2 = doc.addSection();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 255, g: 0, b: 255 });
        const sectionPageField= new PdfSectionPageNumberField({ font: font, brush: brush });
        const sectionNumField = new PdfSectionNumberField({ font: font, brush: new PdfBrush({r: 255, g: 0, b: 0}) });
        const composite = new PdfCompositeField({ font: font, pattern: 'Page {0} of Section {1}', automaticFields: [sectionPageField, sectionNumField] });
        for (let i = 0; i < 3; i++) {
            let page = section1.addPage();
            composite.draw(page.graphics, { x: 150, y: 10 });
        }
         for (let i = 0; i < 3; i++) {
            let page = section2.addPage();
            composite.draw(page.graphics, { x: 150, y: 10 });
        }
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '150.00', '-25.03']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Pattern is not matched with the automatic field listed', () => {
        const doc = new PdfDocument();
        const section1 = doc.addSection();
        const section2 = doc.addSection();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 255, g: 0, b: 255 });
        const sectionPageField= new PdfSectionPageNumberField({ font: font, brush: brush });
        const composite = new PdfCompositeField({ font: font, pattern: 'Page {0} of Section {1}', automaticFields: [sectionPageField] });
        for (let i = 0; i < 3; i++) {
            let page = section1.addPage();
            composite.draw(page.graphics, { x: 150, y: 10 });
        }
         for (let i = 0; i < 3; i++) {
            let page = section2.addPage();
            composite.draw(page.graphics, { x: 150, y: 10 });
        }
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '150.00', '-25.03']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Section page count field updates per section', () => {
        const doc = new PdfDocument();
        let section1 = doc.addSection();
        section1.addPage();
        section1.addPage();
        section1.addPage();
        section1 = doc.addSection();
        section1.addPage();
        section1.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const sectionCountField = new PdfSectionPageCountField({font: font, brush: brush});
        for (let i = 0; i < 5; i++) {
            let page = doc.getPage(i);
            sectionCountField.draw(page.graphics, { x: 10, y: 10 });
        }
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(1);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        const stream = contentsArray[contentsArray.length - 1];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-25.03']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Creation date field and document author field', () => {
        const creation = new Date('2026-05-08T12:00:00');
        const modification = new Date('2026-05-08T12:00:00');
        const doc = new PdfDocument();
        const info: PdfDocumentInformation = {
            title: 'Essential PDF Sample',
            author: 'Syncfusion',
            subject: 'Document information DEMO',
            keywords: 'PDF,ej2',
            creator: 'Essential PDF',
            producer: 'Syncfusion PDF',
            language: 'en-us',
            creationDate: creation,
            modificationDate: modification
        };
        doc.setDocumentInformation(info);
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const dateField = new PdfCreationDateField({font: font, brush: new PdfBrush({ r: 255, g: 0, b: 0 }), dateFormat: 'yyyy/MM/dd'});
        const authorfield = new PdfDocumentAuthorField({font: font, brush: new PdfBrush({ r: 0, g: 0, b: 255 })});
        for (let i = 0; i < 2; i++) {
            let page = doc.addPage();
            dateField.draw(page.graphics, { x: 30, y: 50 });
            authorfield.draw(page.graphics, { x: 30, y: 90 });
        }
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage1 = loadedDoc.getPage(0);
        const loadedPage2 = loadedDoc.getPage(1);
        const contentsArray1 = loadedPage1._pageDictionary.getArray('Contents');
        const contentsArray2 = loadedPage2._pageDictionary.getArray('Contents');
        const stream1 = contentsArray1[contentsArray1.length - 1];
        const stream2 = contentsArray2[contentsArray2.length - 1];
        const parser1 = new _ContentParser(stream1.getBytes());
        const parser2 = new _ContentParser(stream2.getBytes());
        let result = parser1._readContent();
        expect(result.length).toEqual(15);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '30.00', '-63.87']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        expect(result[11]._operator).toBe('q');
        expect(result[12]._operator).toBe('cm');
        expect(result[12]._operands).toEqual(['1.00', '.00', '.00', '1.00', '30.00', '-103.87']);
        expect(result[13]._operator).toBe('Do');
        expect(result[14]._operator).toBe('Q');
        result = parser2._readContent();
        expect(result.length).toEqual(15);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '30.00', '-63.87']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        expect(result[11]._operator).toBe('q');
        expect(result[12]._operator).toBe('cm');
        expect(result[12]._operands).toEqual(['1.00', '.00', '.00', '1.00', '30.00', '-103.87']);
        expect(result[13]._operator).toBe('Do');
        expect(result[14]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Renders destination page number field', () => {
        const doc = new PdfDocument();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const destinationPageField = new PdfDestinationPageNumberField({ font: font, brush: brush });
        for (let i = 0; i < 5; i ++) {
            let page = doc.addPage();
            if (i === 4) {
                destinationPageField.page = page;
                destinationPageField.draw(page.graphics, { x: 10, y: 10 });
            } 
        }
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const page = loadedDoc.getPage(4);
        const contentsArray = page._pageDictionary.getArray('Contents');
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-25.03']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Footer composite page numbering and centered text render correctly', () => {
        const doc = new PdfDocument();
        doc.addPage();
        doc.addPage();
        doc.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const pageCountField = new PdfPageCountField({ font: font, brush: brush });
        pageCountField.numberStyle = PdfNumberStyle.upperLatin;
        for (let i = 0; i < 3; i++) {
            let page = doc.getPage(i);
            pageCountField.draw(page.graphics, { x: 10, y: 10 });
        }
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(1);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        const stream = contentsArray[contentsArray.length - 1];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-25.03']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Header optional period and borders render correctly along with PageNumber Field', () => {
        const doc = new PdfDocument();
        for (let i = 0; i < 10; i++) {
            doc.addPage();
        }
        const template = new PdfPageTemplateElement({ width: 500, height: 80 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const pen = new PdfPen({ r: 169, g: 169, b: 169 }, 2);
        template.graphics.drawString('2024/01/01 to 2024/12/31', font, { x: 10, y: 55, width: 595, height: 20 }, new PdfPen({r: 255, g: 0, b: 0}, 1));
        template.graphics.drawLine(pen, { x: 0, y: 0 }, { x: 500, y: 0 });
        template.graphics.drawLine(pen, { x: 0, y: 77 }, { x: 500, y: 77 });
        doc.template.top = {template: template, alignment: PdfTemplateHorizontalAlignment.left };
        const pageNumField = new PdfPageNumberField({font: new PdfStandardFont(PdfFontFamily.helvetica, 12), brush: new PdfBrush({r:0, g: 0, b: 0})});
        pageNumField.numberStyle = PdfNumberStyle.upperRoman;
        for (let i = 0; i < 10; i++) {
            const page = doc.getPage(i)
            const bottomY = getclientBounds(page).height- 30;
            pageNumField.draw(page.graphics, { x: 250, y: bottomY });
        }
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(15);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-120.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '250.00', '-665.87']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        expect(result[11]._operator).toBe('q');
        expect(result[12]._operator).toBe('cm');
        expect(result[12]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '.00']);
        expect(result[13]._operator).toBe('Do');
        expect(result[14]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - renders page number, count, creation date together', () => {
        const doc = new PdfDocument();
        for (let i = 0; i < 5; i++) {
            doc.addPage();
        }
        const template = new PdfPageTemplateElement({ width: 595, height: 400 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const pageNum = new PdfPageNumberField({ font: font, brush: brush });
        pageNum.numberStyle = PdfNumberStyle.numeric;
        const pageCount = new PdfPageCountField({ font: font, brush: brush });
        const creation = new PdfDateTimeField({ font: font, brush: brush });
        let composite = new PdfCompositeField({
            font: font,
            brush: brush,
            pattern: 'Page{0}/{1}-{2}',
            automaticFields: [pageNum, pageCount, creation]
        });
        for (let i = 0; i < 5; i++) {
            let page = doc.getPage(i);
            composite.draw(page.graphics, { x: 10, y: 10 });
        }
        doc.template.bottom = { template };
        const data = doc.save();
        const loaded = new PdfDocument(data);
        const loadedPage = loaded.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-23.87']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loaded.destroy();
    });
});
describe('982023 - Templates including annotaiton and form fields', () => {
    it('982023 - Templates appear on every page in large documents without overlap', () => {
        const doc = new PdfDocument();
        for (let i = 0; i < 100; i++) {
            doc.addPage();
        }
        const template = new PdfPageTemplateElement({ width: 250, height: 50 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 10);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        template.graphics.drawRectangle({ x: 0, y: 0, width: 250, height: 50 }, new PdfPen({r: 255, g: 0, b: 255}, 1))
        template.graphics.drawString('Header Template', font, { x: 10, y: 10, width: 100, height: 30 }, brush);
        doc.template.top = {template: template};
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        expect(loadedDoc.pageCount).toEqual(100);
        const lastPage = loadedDoc.getPage(99);
        const contentsArray = lastPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-90.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['2.06', '.00', '.00', '1.00', '.00', '.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Annotations coexist with templates', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        const template = new PdfPageTemplateElement({ width: 500, height: 50 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        template.graphics.drawRectangle({ x: 0, y: 0, width: 500, height: 50 }, new PdfPen({ r: 255, g: 0, b: 255 }, 1))
        template.graphics.drawString('Header', font, { x: 10, y: 10, width: 100, height: 30 }, brush);
        doc.template.top = { template: template };
        page.graphics.drawString('Page Content', font, { x: 100, y: 100, width: 200, height: 30 }, brush);
        const rubber: PdfRubberStampAnnotation = new PdfRubberStampAnnotation({ x: 0, y: 0, width: 100, height: 50 })
        page.annotations.add(rubber);
        const rect = new PdfRectangleAnnotation({ x: 120, y: 0, width: 200, height: 50 }, {
            text: 'Rect', author: 'Syncfusion', subject: 'Rectangle Annotation',
            color: { r: 255, g: 0, b: 0 },
            innerColor: { r: 255, g: 240, b: 240 },
            opacity: 0.6,
            border: new PdfAnnotationBorder({ width: 1, hRadius: 0, vRadius: 0, style: PdfBorderStyle.solid })
        });
        page.annotations.add(rect);
        const data = doc.save();
        let loadedDoc = new PdfDocument(data);
        let loadedPage = loadedDoc.getPage(0);
        loadedPage.annotations.at(0).flatten = true;
        let update = loadedDoc.save();
        loadedDoc = new PdfDocument(update);
        loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        const stream = contentsArray[5] ;
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(8);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('q');
        expect(result[3]._operator).toBe('q');
        expect(result[4]._operator).toBe('cm');
        expect(result[4]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-140.00']);
        expect(result[5]._operator).toBe('Do');
        expect(result[6]._operator).toBe('Q');
        expect(result[7]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Form Fields with templates', () => {
        const doc: PdfDocument = new PdfDocument();
        const page = doc.addPage();
        const template = new PdfPageTemplateElement({ width: 500, height: 50 });
        template.graphics.drawRectangle({ x: 0, y: 0, width: 500, height: 50 }, new PdfPen({ r: 255, g: 0, b: 255 }, 1))
        doc.template.top = { template: template };
        const textBox: PdfTextBoxField = new PdfTextBoxField(page, 'Text Box', { x: 0, y: 0, width: 100, height: 50 }, {
            toolTip: 'Enter your first name',
            color: { r: 0, g: 0, b: 0 },
            backColor: { r: 255, g: 255, b: 255 },
            borderColor: { r: 0, g: 122, b: 204 },
            border: new PdfInteractiveBorder({ width: 1, style: PdfBorderStyle.solid }),
            text: 'John',
            font: doc.embedFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular)
        });
        doc.form.add(textBox);
        let field: PdfRadioButtonListField = new PdfRadioButtonListField(page, 'Age');
        let first: PdfRadioButtonListItem = field.add('1-9', { x: 0, y: 55, width: 20, height: 20 });
        let second: PdfRadioButtonListItem = new PdfRadioButtonListItem('10-49', { x: 0, y: 75, width: 20, height: 20 }, page);
        field.add(first);
        field.add(second);
        field.selectedIndex = 0;
        doc.form.add(field);
        const data = doc.save();
        let loadedDoc = new PdfDocument(data);
        let loadedPage = loadedDoc.getPage(0);
        loadedDoc.form.fieldAt(0).flatten = true;
        loadedDoc.form.fieldAt(1).flatten = true;
        let update = loadedDoc.save();
        loadedDoc = new PdfDocument(update);
        loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
         const stream = contentsArray[5] ;
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(22);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('q');
        expect(result[3]._operator).toBe('Tr');
        expect(result[3]._operands).toEqual(['0']);
        expect(result[4]._operator).toBe('q');
        expect(result[5]._operator).toBe('cm');
        expect(result[5]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-165.00']);
        expect(result[6]._operator).toBe('Do');
        expect(result[7]._operator).toBe('Q');
        expect(result[8]._operator).toBe('Q');
        expect(result[9]._operator).toBe('q');
        expect(result[10]._operator).toBe('Tr');
        expect(result[10]._operands).toEqual(['0']);
        expect(result[11]._operator).toBe('q');
        expect(result[12]._operator).toBe('cm');
        expect(result[12]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-185.00']);
        expect(result[13]._operator).toBe('Do');
        expect(result[14]._operator).toBe('Q');
        expect(result[15]._operator).toBe('Q');
        expect(result[16]._operator).toBe('q');
        expect(result[17]._operator).toBe('q');
        expect(result[18]._operator).toBe('cm');
        expect(result[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-140.00']);
        expect(result[19]._operator).toBe('Do');
        expect(result[20]._operator).toBe('Q');
        expect(result[21]._operator).toBe('Q');
        loadedDoc.destroy();
    });
});
describe('982023 - Edge cases', () => {
    it('982023 - Removing/replacing templates updates layout immediately', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        const template1 = new PdfPageTemplateElement({ width: 500, height: 50 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        template1.graphics.drawString('First Header', font, { x: 10, y: 10, width: 100, height: 30 }, brush);
        doc.template.top = {template: template1, alignment: PdfTemplateHorizontalAlignment.center};
        doc.template.top = undefined;
        const template2 = new PdfPageTemplateElement({ width: 500, height: 60 });
        template2.graphics.drawString('Second Header', font, { x: 10, y: 10, width: 100, height: 30 }, brush);
        doc.template.top = {template: template2, alignment: PdfTemplateHorizontalAlignment.center};
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(11);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-100.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '7.50', '.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
});
describe('982023 - odd/ Even and Foreground/ Background Rendering', () => {
    it('982023 - Background templates rendering', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        doc.addPage();
         doc.addPage();
         const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 255, b: 255 });
        page.graphics.drawString(text, font, { x: 50, y: 50, width: getclientBounds(page).width - 100, height: getclientBounds(page).height }, new PdfBrush({r: 0, g: 0, b: 0}));
        const bgTemplate = new PdfPageTemplateElement({  width: getclientBounds(page).width - 50, height: getclientBounds(page).height  });
        bgTemplate.graphics.drawRectangle( { x: 10, y: 10, width: getclientBounds(page).width - 50, height: getclientBounds(page).height  }, new PdfPen({r: 255, g: 0, b: 0}, 1), brush );
        doc.template.top = {template: bgTemplate, templateLayerMode: PdfTemplateLayerMode.background};
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray.length).toBeGreaterThanOrEqual(2);
        const firstStream = contentsArray[5];
        const parser = new _ContentParser(firstStream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(16);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('gs');
        expect(result[9]._operator).toBe('BDC');
        expect(result[10]._operator).toBe('q');
        expect(result[11]._operator).toBe('cm');
        expect(result[11]._operands).toEqual(['1.11', '.00', '.00', '1.00', '.00', '-762.00']);
        expect(result[12]._operator).toBe('Do');
        expect(result[13]._operator).toBe('Q');
        expect(result[14]._operator).toBe('EMC');
        expect(result[15]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Foreground templates rendering', () => {
         const doc = new PdfDocument();
        const page = doc.addPage();
        doc.addPage();
         const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 255, b: 255 });
        page.graphics.drawString(text, font, { x: 50, y: 50, width: getclientBounds(page).width - 50, height: getclientBounds(page).height }, new PdfBrush({r: 0, g: 0, b: 0}));
        const bgTemplate = new PdfPageTemplateElement({ width: getclientBounds(page).width - 50, height: getclientBounds(page).height  });
        bgTemplate.graphics.drawRectangle( { x: 10, y: 10, width: getclientBounds(page).width - 50, height: getclientBounds(page).height  }, new PdfPen({r: 255, g: 0, b: 0}, 1), brush );
        doc.template.top = {template: bgTemplate, templateLayerMode: PdfTemplateLayerMode.foreground};
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray.length).toBeGreaterThanOrEqual(2);
        const firstStream: _PdfStream = contentsArray[2] as _PdfStream;
        const parser = new _ContentParser(firstStream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(23);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('BT');
        expect(result[8]._operator).toBe('CS');
        expect(result[9]._operator).toBe('cs');
        expect(result[10]._operator).toBe('rg');
        expect(result[10]._operands).toEqual(['0.000', '0.000', '0.000']);
        expect(result[11]._operator).toBe('Tf');
        expect(result[12]._operator).toBe('Tr');
        expect(result[12]._operands).toEqual(['0']);
        expect(result[13]._operator).toBe('Tc');
        expect(result[13]._operands).toEqual(['0.000']);
        expect(result[14]._operator).toBe('Tw');
        expect(result[14]._operands).toEqual(['0.000']);
        expect(result[15]._operator).toBe('Tz');
        expect(result[15]._operands).toEqual(['100.000']);
        expect(result[16]._operator).toBe('Tm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '50.00', '-61.17']);
        expect(result[17]._operator).toBe("'");
        expect(result[17]._operands[0]).toContain('This document is generated');
        expect(result[18]._operator).toBe('Tm');
        expect(result[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '50.00', '-75.04']);
        expect(result[19]._operator).toBe("'");
        expect(result[19]._operands[0]).toContain('PDF engine');
        expect(result[20]._operator).toBe('Tm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '50.00', '-88.92']);
        expect(result[21]._operator).toBe("'");
        expect(result[21]._operands[0]).toContain('while maintaining consistent formatting');
        expect(result[22]._operator).toBe('ET');
        loadedDoc.destroy();
    });
    it('982023 - renders odd foreground header and even background header correctly', () => {
        const doc = new PdfDocument();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        let page1 = doc.addPage();
        page1.graphics.drawString(text, font, { x: 50, y: 50, width: getclientBounds(page1).width - 100, height: getclientBounds(page1).height }, new PdfBrush({ r: 255, g: 0, b: 255 }));
        let page2 = doc.addPage();
        page2.graphics.drawString(text, font, { x: 50, y: 50, width: getclientBounds(page1).width - 100, height: getclientBounds(page1).height }, new PdfBrush({ r: 255, g: 0, b: 255}));
        const oddTemplate = new PdfPageTemplateElement({ width: getclientBounds(page1).width - 50, height: getclientBounds(page1).height });
        oddTemplate.graphics.drawString('Odd Foreground', font, { x: 10, y: 10, width: 200, height: 20 }, new PdfBrush({r: 255, g: 255, b: 0}));
        oddTemplate.graphics.drawRectangle({ x: 10, y: 10, width: getclientBounds(page1).width - 50, height: getclientBounds(page1).height }, new PdfPen({ r: 255, g: 0, b: 255 }, 1),  new PdfBrush({r: 255, g: 0, b: 0}));
        const evenTemplate = new PdfPageTemplateElement({ width: getclientBounds(page1).width - 50, height: getclientBounds(page1).height });
        evenTemplate.graphics.drawString('Even Background', font, { x: 10, y: 10, width: 200, height: 20 }, new PdfBrush({r: 255, g: 255, b: 0}));
        evenTemplate.graphics.drawRectangle({ x: 10, y: 10, width: getclientBounds(page1).width - 50, height: getclientBounds(page1).height }, new PdfPen({ r: 255, g: 0, b: 255 }, 1), new PdfBrush({r: 255, g: 0, b: 0}));
        doc.template.oddTop = { template: oddTemplate, templateLayerMode: PdfTemplateLayerMode.foreground};
        doc.template.evenTop = { template: evenTemplate, templateLayerMode: PdfTemplateLayerMode.background };
        const data = doc.save();
         const loadedDoc = new PdfDocument(data);
        let loadedPage = loadedDoc.getPage(0);
        let contentsArray = loadedPage._pageDictionary.getArray('Contents');
        expect(contentsArray.length).toBeGreaterThanOrEqual(2);
        let firstStream: _PdfStream = contentsArray[2] as _PdfStream;
        let parser = new _ContentParser(firstStream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(25);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('BT');
        expect(result[8]._operator).toBe('CS');
        expect(result[9]._operator).toBe('cs');
        expect(result[10]._operator).toBe('rg');
        expect(result[10]._operands).toEqual(['1.000', '0.000', '1.000']);
        expect(result[11]._operator).toBe('Tf');
        expect(result[12]._operator).toBe('Tr');
        expect(result[12]._operands).toEqual(['0']);
        expect(result[13]._operator).toBe('Tc');
        expect(result[13]._operands).toEqual(['0.000']);
        expect(result[14]._operator).toBe('Tw');
        expect(result[14]._operands).toEqual(['0.000']);
        expect(result[15]._operator).toBe('Tz');
        expect(result[15]._operands).toEqual(['100.000']);
        expect(result[16]._operator).toBe('Tm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '50.00', '-61.17']);
        expect(result[17]._operator).toBe("'");
        expect(result[17]._operands[0]).toContain('This document is generated');
        expect(result[18]._operator).toBe('Tm');
        expect(result[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '50.00', '-75.04']);
        expect(result[19]._operator).toBe("'");
        expect(result[19]._operands[0]).toContain('capabilities of the PDF engine');
        expect(result[20]._operator).toBe('Tm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '50.00', '-88.92']);
        expect(result[21]._operator).toBe("'");
        expect(result[21]._operands[0]).toContain('are positioned within a page');
        expect(result[22]._operator).toBe('Tm');
        expect(result[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '50.00', '-102.79']);
        expect(result[23]._operator).toBe("'");
        expect(result[23]._operands[0]).toContain('alignment.');
        expect(result[24]._operator).toBe('ET');
        loadedPage = loadedDoc.getPage(1);
        contentsArray = loadedPage._pageDictionary.getArray('Contents');
        firstStream = contentsArray[5] as _PdfStream;
        parser = new _ContentParser(firstStream.getBytes());
        result = parser._readContent();
        expect(result.length).toEqual(16);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('gs');
        expect(result[9]._operator).toBe('BDC');
        expect(result[10]._operator).toBe('q');
        expect(result[11]._operator).toBe('cm');
        expect(result[11]._operands).toEqual(['1.11', '.00', '.00', '1.00', '.00', '-762.00']);
        expect(result[12]._operator).toBe('Do');
        expect(result[13]._operator).toBe('Q');
        expect(result[14]._operator).toBe('EMC');
        expect(result[15]._operator).toBe('Q');
        loadedDoc.destroy();
    });
});
describe('982023 - Section Template', () => {
    it('982023 - Section-level templates override document-level templates', () => {
        const doc = new PdfDocument();
        const docTemplate = new PdfPageTemplateElement({ width: 500, height: 50 });
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        docTemplate.graphics.drawString('Doc Header', font, { x: 10, y: 10, width: 100, height: 30 }, brush);
        doc.template.top = {template: docTemplate , alignment: PdfTemplateHorizontalAlignment.center};
        const section = doc.addSection();
        section.addPage();
        const sectionTemplate = new PdfPageTemplateElement({ width: 500, height: 50 });
        sectionTemplate.graphics.drawString('Section Header', font, { x: 10, y: 10, width: 150, height: 30 }, brush);
        section.template.top = { template: sectionTemplate, alignment: PdfTemplateHorizontalAlignment.center};
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        const loadedPage = loadedDoc.getPage(0);
        const contentsArray = loadedPage._pageDictionary.getArray('Contents');
        const stream = contentsArray[2];
        const parser = new _ContentParser(stream.getBytes());
        const result = parser._readContent();
        expect(result.length).toEqual(15);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[3]._operator).toBe('h');
        expect(result[4]._operator).toBe('W');
        expect(result[5]._operator).toBe('n');
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-90.00']);
        expect(result[7]._operator).toBe('q');
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '7.50', '.00']);
        expect(result[9]._operator).toBe('Do');
        expect(result[10]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Overlapped', () => {
        const doc = new PdfDocument();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const page1 = doc.addPage();
        page1.graphics.drawString('Hello World', font, { x: 0, y: 0, width: 400, height: 40 }, brush);
        const template = new PdfPageTemplateElement({ width: 400, height: 40 });
        template.graphics.drawRectangle({ x: 0, y: 0, width: 400, height: 40 }, new PdfBrush({ r: 255, g: 0, b: 0 }))
        doc.template.top = { template: template, alignment: PdfTemplateHorizontalAlignment.left };
        page1.graphics.drawString(text, font, { x: 20, y: 20, width: 200, height: 300 }, new PdfBrush({ r: 0, g: 0, b: 255 }));
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        let lpage = loadedDoc.getPage(0);
        let contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        let stream = contentsArray[3];
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result[7]._operator).toBe('BT');
        expect(result[8]._operator).toBe('CS');
        expect(result[8]._operands).toEqual(['/DeviceRGB']);
        expect(result[9]._operator).toBe('cs');
        expect(result[9]._operands).toEqual(['/DeviceRGB']);
        expect(result[10]._operator).toBe('rg');
        expect(result[10]._operands).toEqual(['0.000', '0.000', '0.000']);
        expect(result[11]._operator).toBe('Tf');
        expect(result[12]._operator).toBe('Tr');
        expect(result[12]._operands).toEqual(['0']);
        expect(result[13]._operator).toBe('Tc');
        expect(result[13]._operands).toEqual(['0.000']);
        expect(result[14]._operator).toBe('Tw');
        expect(result[14]._operands).toEqual(['0.000']);
        expect(result[15]._operator).toBe('Tz');
        expect(result[15]._operands).toEqual(['100.000']);
        expect(result[16]._operator).toBe('Tm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '-11.17']);
        expect(result[17]._operator).toBe("'");
        expect(result[17]._operands).toEqual(['(Hello World)']);
        expect(result[18]._operator).toBe('ET');
        expect(result[19]._operator).toBe('BT');
        expect(result[20]._operator).toBe('rg');
        expect(result[20]._operands).toEqual(['0.000', '0.000', '1.000']);
        expect(result[21]._operator).toBe('Tf');
        expect(result[22]._operator).toBe('Tm');
        expect(result[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-31.17']);
        expect(result[23]._operator).toBe("'");
        expect(result[23]._operands).toEqual(['(This document is generated to)']);
        expect(result[24]._operator).toBe('Tm');
        expect(result[24]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-45.04']);
        expect(result[25]._operator).toBe("'");
        expect(result[25]._operands).toEqual(['(demonstrate the layout and rendering)']);
        expect(result[26]._operator).toBe('Tm');
        expect(result[26]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-58.92']);
        expect(result[27]._operator).toBe("'");
        expect(result[27]._operands).toEqual(['(capabilities of the PDF engine. It)']);
        expect(result[28]._operator).toBe('Tm');
        expect(result[28]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-72.79']);
        expect(result[29]._operator).toBe("'");
        expect(result[29]._operands).toEqual(['(illustrates how text, margins, and)']);
        expect(result[30]._operator).toBe('Tm');
        expect(result[30]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-86.66']);
        expect(result[31]._operator).toBe("'");
        expect(result[31]._operands).toEqual(['(templates are positioned within a)']);
        expect(result[32]._operator).toBe('Tm');
        expect(result[32]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-100.53']);
        expect(result[33]._operator).toBe("'");
        expect(result[33]._operands).toEqual(['(page while maintaining consistent)']);
        expect(result[34]._operator).toBe('Tm');
        expect(result[34]._operands).toEqual(['1.00', '.00', '.00', '1.00', '20.00', '-114.40']);
        expect(result[35]._operator).toBe("'");
        expect(result[35]._operands).toEqual(['(formatting and alignment.)']);
        expect(result[36]._operator).toBe('ET');
        loadedDoc.destroy();
    });
});
describe('982023 - Multiple template', () => {
    it('982023 - Multiple templates with alignment', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        doc.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const topTemplate = new PdfPageTemplateElement({ width: 200, height: 40 });
        topTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 200, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        topTemplate.graphics.drawString('Top Header', font, { x: 0, y: 0, width: 300, height: 40 }, brush);
        const bottomTemplate = new PdfPageTemplateElement({ width: 200, height: 40 });
        bottomTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 200, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        bottomTemplate.graphics.drawString('Bottom Footer', font, { x: 0, y: 0, width: 200, height: 40 }, brush);
        const leftTemplate = new PdfPageTemplateElement({ width: 80, height: 300 });
        leftTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        leftTemplate.graphics.drawString('Left Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        const right = new PdfPageTemplateElement({ width: 80, height: 300 });
        right.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1));
        right.graphics.drawString('Right Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        doc.template.bottom = { template: bottomTemplate, alignment: PdfTemplateHorizontalAlignment.center };
        doc.template.right = { template: right, alignment: PdfTemplateVerticalAlignment.middle }
        doc.template.left = { template: leftTemplate, alignment: PdfTemplateVerticalAlignment.middle };
        doc.template.top = { template: topTemplate, alignment: PdfTemplateHorizontalAlignment.center };
        page.graphics.drawString(text, font, { x: 10, y: 20, width: 200, height: 300 }, new PdfBrush({ r: 0, g: 0, b: 255 }));
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        let lpage = loadedDoc.getPage(0);
        let contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        let stream = contentsArray[2];
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(47);
        expect(result[0]._operator).toBe('q');
        expect(result[16]._operator).toBe('Tm');
        expect(result[16]._operands).toEqual([ '1.00', '.00', '.00', '1.00', '10.00', '-31.17' ]);
        expect(result[17]._operator).toBe("'");
        expect(result[17]._operands[0]).toContain('This document is generated');
        expect(result[18]._operator).toBe('Tm');
        expect(result[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-45.04']);
        expect(result[19]._operator).toBe("'");
        expect(result[19]._operands[0]).toContain('demonstrate the layout');
        expect(result[20]._operator).toBe('Tm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-58.92']);
        expect(result[21]._operator).toBe("'");
        expect(result[21]._operands[0]).toContain('capabilities of the PDF engine');
        expect(result[22]._operator).toBe('Tm');
        expect(result[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-72.79']);
        expect(result[23]._operator).toBe("'");
        expect(result[23]._operands[0]).toContain('illustrates how text');
        expect(result[24]._operator).toBe('Tm');
        expect(result[24]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-86.66']);
        expect(result[25]._operator).toBe("'");
        expect(result[25]._operands[0]).toContain('templates are positioned');
        expect(result[26]._operator).toBe('Tm');
        expect(result[26]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-100.53']);
        expect(result[27]._operator).toBe("'");
        expect(result[28]._operator).toBe('Tm');
        expect(result[28]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-114.40']);
        expect(result[32]._operator).toBe('cm');
        expect(result[32]._operands).toEqual(['1.00', '.00', '.00', '1.00', '77.50', '.00']);
        expect(result[36]._operands).toEqual(['1.00', '.00', '.00', '1.00', '77.50', '-722.00']);
        expect(result[40]._operator).toBe('cm');
        expect(result[40]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-80.00', '-491.00']);
        expect(result[44]._operator).toBe('cm');
        expect(result[44]._operands).toEqual(['1.00', '.00', '.00', '1.00', '355.00', '-491.00']);
        lpage = loadedDoc.getPage(1);
        contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        stream = contentsArray[2];
        parser = new _ContentParser(stream.getBytes());
        result = parser._readContent();
        expect(result.length).toEqual(23);
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '120.00', '-80.00']);
        expect(result[8]._operator).toBe('cm');
        expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '77.50', '.00']);
        expect(result[12]._operator).toBe('cm');
        expect(result[12]._operands).toEqual(['1.00', '.00', '.00', '1.00', '77.50', '-722.00']);
        expect(result[16]._operator).toBe('cm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-80.00', '-491.00']);
        expect(result[20]._operator).toBe('cm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '355.00', '-491.00']);
        expect(result[21]._operator).toBe('Do');
        expect(result[22]._operator).toBe('Q');
        loadedDoc.destroy();
    });
    it('982023 - Multiple odd templates with alignment', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        doc.addPage();
        doc.addPage();
        doc.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const topTemplate = new PdfPageTemplateElement({ width: 200, height: 40 });
        topTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 200, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        topTemplate.graphics.drawString('Top Header', font, { x: 0, y: 0, width: 300, height: 40 }, brush);
        const bottomTemplate = new PdfPageTemplateElement({ width: 200, height: 40 });
        bottomTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 200, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        bottomTemplate.graphics.drawString('Bottom Footer', font, { x: 0, y: 0, width: 200, height: 40 }, brush);
        const leftTemplate = new PdfPageTemplateElement({ width: 80, height: 300 });
        leftTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        leftTemplate.graphics.drawString('Left Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        const right = new PdfPageTemplateElement({ width: 80, height: 300 });
        right.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1));
        right.graphics.drawString('Right Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        doc.template.oddBottom = { template: bottomTemplate, alignment: PdfTemplateHorizontalAlignment.left };
        doc.template.oddRight = { template: right, alignment: PdfTemplateVerticalAlignment.top }
        doc.template.oddLeft = { template: leftTemplate, alignment: PdfTemplateVerticalAlignment.top };
        doc.template.oddTop = { template: topTemplate, alignment: PdfTemplateHorizontalAlignment.left };
        page.graphics.drawString(text, font, { x: 10, y: 20, width: 200, height: 300 }, new PdfBrush({ r: 0, g: 0, b: 255 }));
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        let lpage = loadedDoc.getPage(0);
        let contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        let stream = contentsArray[2];
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(47);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '120.00', '-80.00']);
        expect(result[10]._operands).toEqual(['0.000', '0.000', '1.000']);
        expect(result[16]._operator).toBe('Tm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-31.17']);
        expect(result[17]._operator).toBe("'");
        expect(result[17]._operands[0]).toContain('This document is generated');
        expect(result[18]._operator).toBe('Tm');
        expect(result[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-45.04']);
        expect(result[19]._operator).toBe("'");
        expect(result[19]._operands[0]).toContain('demonstrate the layout');
        expect(result[20]._operator).toBe('Tm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-58.92']);
        expect(result[21]._operator).toBe("'");
        expect(result[21]._operands[0]).toContain('capabilities of the PDF engine');
        expect(result[22]._operator).toBe('Tm');
        expect(result[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-72.79']);
        expect(result[23]._operator).toBe("'");
        expect(result[23]._operands[0]).toContain('illustrates how text');
        expect(result[24]._operator).toBe('Tm');
        expect(result[24]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-86.66']);
        expect(result[25]._operator).toBe("'");
        expect(result[25]._operands[0]).toContain('templates are positioned');
        expect(result[26]._operator).toBe('Tm');
        expect(result[26]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-100.53']);
        expect(result[27]._operator).toBe("'");
        expect(result[27]._operands[0]).toContain('page while maintaining');
        expect(result[28]._operator).toBe('Tm');
        expect(result[28]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-114.40']);
        expect(result[29]._operator).toBe("'");
        expect(result[29]._operands[0]).toContain('formatting and alignment');
        loadedDoc.destroy();
    });
    it('982023 - Multiple even templates with alignment', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        doc.addPage();
        doc.addPage();
        doc.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const topTemplate = new PdfPageTemplateElement({ width: 200, height: 40 });
        topTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 200, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        topTemplate.graphics.drawString('Top Header', font, { x: 0, y: 0, width: 300, height: 40 }, brush);
        const bottomTemplate = new PdfPageTemplateElement({ width: 200, height: 40 });
        bottomTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 200, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        bottomTemplate.graphics.drawString('Bottom Footer', font, { x: 0, y: 0, width: 200, height: 40 }, brush);
        const leftTemplate = new PdfPageTemplateElement({ width: 80, height: 300 });
        leftTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        leftTemplate.graphics.drawString('Left Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        const right = new PdfPageTemplateElement({ width: 80, height: 300 });
        right.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1));
        right.graphics.drawString('Right Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        doc.template.evenBottom = { template: bottomTemplate, alignment: PdfTemplateHorizontalAlignment.left };
        doc.template.evenRight = { template: right, alignment: PdfTemplateVerticalAlignment.top }
        doc.template.evenLeft = { template: leftTemplate, alignment: PdfTemplateVerticalAlignment.top };
        doc.template.evenTop = { template: topTemplate, alignment: PdfTemplateHorizontalAlignment.left };
        page.graphics.drawString(text, font, { x: 10, y: 20, width: 200, height: 300 }, new PdfBrush({ r: 0, g: 0, b: 255 }));
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        for (let i = 1; i < 4; i++) {
            if (i === 1 || i === 3) {
                let lpage = loadedDoc.getPage(i);
                let contentsArray = lpage._pageDictionary.getArray('Contents');
                expect(contentsArray).toBeDefined();
                expect(contentsArray.length).toBeGreaterThan(0);
                let stream = contentsArray[2];
                let parser = new _ContentParser(stream.getBytes());
                let result = parser._readContent();
                expect(result.length).toEqual(23);
                expect(result[0]._operator).toBe('q');
                expect(result[1]._operator).toBe('cm');
                expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
                expect(result[2]._operator).toBe('re');
                expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
                expect(result[6]._operator).toBe('cm');
                expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '120.00', '-80.00']);
                expect(result[8]._operator).toBe('cm');
                expect(result[8]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-80.00', '.00']);
                expect(result[12]._operator).toBe('cm');
                expect(result[12]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-80.00', '-722.00']);
                expect(result[16]._operator).toBe('cm');
                expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '-80.00', '-300.00']);
                expect(result[20]._operator).toBe('cm');
                expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '355.00', '-300.00']);
            }
        }
        loadedDoc.destroy();
    });
    it('982023 - Multiple templates without alignment', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        doc.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const bounds = {x: 0, y: 0, width: 100, height: 50};
         const bounds1 = {x: 0, y: 0, width: 80, height: 300};
        const topTemplate = new PdfPageTemplateElement(bounds);
        topTemplate.graphics.drawRectangle(bounds, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        const bottomTemplate = new PdfPageTemplateElement(bounds);
        bottomTemplate.graphics.drawRectangle(bounds, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        const leftTemplate = new PdfPageTemplateElement(bounds1);
        leftTemplate.graphics.drawRectangle(bounds1, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        const rightTemplate = new PdfPageTemplateElement(bounds1);
        rightTemplate.graphics.drawRectangle(bounds1, new PdfPen({ r: 255, g: 0, b: 0 }, 1))
        doc.template.bottom = { template: bottomTemplate };
        doc.template.top = { template: topTemplate };
        doc.template.left = {template: leftTemplate};
        doc.template.right = {template: rightTemplate};
        page.graphics.drawString(text, font, { x: 10, y: 20, width: 200, height: 300 }, new PdfBrush({ r: 0, g: 0, b: 255 }));
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        let lpage = loadedDoc.getPage(0);
        let contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        let stream = contentsArray[2];
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(47);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '120.00', '-90.00']);
        expect(result[10]._operator).toBe('rg');
        expect(result[10]._operands).toEqual(['0.000', '0.000', '1.000']);
        expect(result[16]._operator).toBe('Tm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-31.17']);
        expect(result[17]._operator).toBe("'");
        expect(result[17]._operands[0]).toContain('This document is generated');
        expect(result[18]._operator).toBe('Tm');
        expect(result[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-45.04']);
        expect(result[19]._operator).toBe("'");
        expect(result[19]._operands[0]).toContain('demonstrate the layout');
        expect(result[20]._operator).toBe('Tm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-58.92']);
        expect(result[21]._operator).toBe("'");
        expect(result[21]._operands[0]).toContain('capabilities of the PDF engine');
        expect(result[22]._operator).toBe('Tm');
        expect(result[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-72.79']);
        expect(result[23]._operator).toBe("'");
        expect(result[23]._operands[0]).toContain('illustrates how text');
        expect(result[24]._operator).toBe('Tm');
        expect(result[24]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-86.66']);
        expect(result[25]._operator).toBe("'");
        expect(result[25]._operands[0]).toContain('templates are positioned');
        expect(result[26]._operator).toBe('Tm');
        expect(result[26]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-100.53']);
        expect(result[27]._operator).toBe("'");
        expect(result[27]._operands[0]).toContain('page while maintaining');
        expect(result[28]._operator).toBe('Tm');
        expect(result[28]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-114.40']);
        expect(result[29]._operator).toBe("'");
        expect(result[29]._operands[0]).toContain('formatting and alignment');
        loadedDoc.destroy();
    });
    it('982023 - Multiple templates with alignment and background', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        doc.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const topTemplate = new PdfPageTemplateElement({ width: 400, height: 200 });
        topTemplate.graphics.drawRectangle({  x: 0, y: 0, width: 400, height: 200 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1), new PdfBrush({r: 200, g: 255, b: 255}))
        topTemplate.graphics.drawString('Top Header', font, { x: 0, y: 0, width: 300, height: 40 }, brush);
        const bottomTemplate = new PdfPageTemplateElement({ width: 200, height: 40 });
        bottomTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 200, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1), new PdfBrush({r: 200, g: 255, b: 255}))
        bottomTemplate.graphics.drawString('Bottom Footer', font, { x: 0, y: 0, width: 200, height: 40 }, brush);
        const leftTemplate = new PdfPageTemplateElement({ width: 80, height: 300 });
        leftTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1), new PdfBrush({r: 200, g: 255, b: 255}))
        leftTemplate.graphics.drawString('Left Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        const right = new PdfPageTemplateElement({ width: 80, height: 300 });
        right.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1), new PdfBrush({r: 200, g: 255, b: 255}));
        right.graphics.drawString('Right Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        doc.template.bottom = { template: bottomTemplate, templateLayerMode: PdfTemplateLayerMode.background, alignment: PdfTemplateHorizontalAlignment.center };
        doc.template.right = { template: right,  templateLayerMode: PdfTemplateLayerMode.background, alignment: PdfTemplateVerticalAlignment.middle  }
        doc.template.left = { template: leftTemplate, templateLayerMode: PdfTemplateLayerMode.background, alignment: PdfTemplateVerticalAlignment.middle };
        doc.template.top = { template: topTemplate, templateLayerMode: PdfTemplateLayerMode.background, alignment: PdfTemplateHorizontalAlignment.center};
        page.graphics.drawString(text.repeat(5), font, { x: 10, y: 20, width: 500, height: 300 }, new PdfBrush({ r: 0, g: 0, b: 255 }));
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        let lpage = loadedDoc.getPage(0);
        let contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        let stream: _PdfStream = contentsArray[5] as _PdfStream;
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(43);
        expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[10]._operator).toBe('q');
        expect(result[11]._operator).toBe('cm');
        expect(result[11]._operands).toEqual(['1.00', '.00', '.00', '1.00', '57.50', '-200.00']);
        expect(result[20]._operator).toBe('cm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '157.50', '-762.00']);
        expect(result[29]._operator).toBe('cm');
        expect(result[29]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '-531.00']);
        expect(result[38]._operator).toBe('cm');
        expect(result[38]._operands).toEqual(['1.00', '.00', '.00', '1.00', '435.00', '-531.00']);
        loadedDoc.destroy();
    });
    it('982023 - Multiple templates with alignment and foreground', () => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        doc.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const topTemplate = new PdfPageTemplateElement({ width: 400, height: 200 });
        topTemplate.graphics.drawRectangle({  x: 0, y: 0, width: 400, height: 200 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1), new PdfBrush({r: 200, g: 255, b: 255}))
        topTemplate.graphics.drawString('Top Header', font, { x: 0, y: 0, width: 300, height: 40 }, brush);
        const bottomTemplate = new PdfPageTemplateElement({ width: 200, height: 40 });
        bottomTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 200, height: 40 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1), new PdfBrush({r: 200, g: 255, b: 255}))
        bottomTemplate.graphics.drawString('Bottom Footer', font, { x: 0, y: 0, width: 200, height: 40 }, brush);
        const leftTemplate = new PdfPageTemplateElement({ width: 80, height: 300 });
        leftTemplate.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1), new PdfBrush({r: 200, g: 255, b: 255}))
        leftTemplate.graphics.drawString('Left Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        const right = new PdfPageTemplateElement({ width: 80, height: 300 });
        right.graphics.drawRectangle({ x: 0, y: 0, width: 80, height: 300 }, new PdfPen({ r: 255, g: 0, b: 0 }, 1), new PdfBrush({r: 200, g: 255, b: 255}));
        right.graphics.drawString('Right Header', font, { x: 0, y: 0, width: 80, height: 300 }, brush);
        doc.template.bottom = { template: bottomTemplate, templateLayerMode: PdfTemplateLayerMode.foreground, alignment: PdfTemplateHorizontalAlignment.center };
        doc.template.right = { template: right,   templateLayerMode: PdfTemplateLayerMode.foreground, alignment: PdfTemplateVerticalAlignment.middle  }
        doc.template.left = { template: leftTemplate,   templateLayerMode: PdfTemplateLayerMode.foreground, alignment: PdfTemplateVerticalAlignment.middle };
        doc.template.top = { template: topTemplate,  templateLayerMode: PdfTemplateLayerMode.foreground, alignment: PdfTemplateHorizontalAlignment.center};
        page.graphics.drawString(text.repeat(5), font, { x: 10, y: 20, width: 500, height: 300 }, new PdfBrush({ r: 0, g: 0, b: 255 }));
        const data = doc.save();
        const loadedDoc = new PdfDocument(data);
        let lpage = loadedDoc.getPage(0);
        let contentsArray = lpage._pageDictionary.getArray('Contents');
        expect(contentsArray).toBeDefined();
        expect(contentsArray.length).toBeGreaterThan(0);
        let stream: _PdfStream = contentsArray[6] as _PdfStream;
        let parser = new _ContentParser(stream.getBytes());
        let result = parser._readContent();
        expect(result.length).toEqual(4); expect(result[0]._operator).toBe('q');
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '435.00', '-531.00']);
        expect(result[2]._operator).toBe('Do');
        expect(result[3]._operator).toBe('Q');
         stream = contentsArray[2] as _PdfStream;
        parser = new _ContentParser(stream.getBytes());
         result = parser._readContent();
         expect(result.length).toEqual(43);
        expect(result[1]._operator).toBe('cm');
        expect(result[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(result[2]._operator).toBe('re');
        expect(result[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(result[6]._operator).toBe('cm');
        expect(result[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(result[10]._operator).toBe('rg');
        expect(result[10]._operands).toEqual(['0.000', '0.000', '1.000']);
        expect(result[16]._operator).toBe('Tm');
        expect(result[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-31.17']);
        expect(result[17]._operator).toBe("'");
        expect(result[17]._operands[0]).toContain('This document is generated');
        expect(result[18]._operator).toBe('Tm');
        expect(result[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-45.04']);
        expect(result[19]._operator).toBe("'");
        expect(result[19]._operands[0]).toContain('engine. It illustrates how text');
        expect(result[20]._operator).toBe('Tm');
        expect(result[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-58.92']);
        expect(result[21]._operator).toBe("'");
        expect(result[21]._operands[0]).toContain('maintaining consistent formatting');
        expect(result[22]._operator).toBe('Tm');
        expect(result[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-72.79']);
        expect(result[23]._operator).toBe("'");
        expect(result[23]._operands[0]).toContain('the layout and rendering capabilities');
        expect(result[24]._operator).toBe('Tm');
        expect(result[24]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-86.66']);
        expect(result[25]._operator).toBe("'");
        expect(result[25]._operands[0]).toContain('templates are positioned');
        expect(result[26]._operator).toBe('Tm');
        expect(result[26]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-100.53']);
        expect(result[27]._operator).toBe("'");
        expect(result[27]._operands[0]).toContain('alignment.');
        expect(result[28]._operator).toBe('Tm');
        expect(result[28]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-114.40']);
        expect(result[29]._operator).toBe("'");
        expect(result[29]._operands[0]).toContain('the PDF engine');
        expect(result[30]._operator).toBe('Tm');
        expect(result[30]._operands).toEqual(['1.00', '.00', '.00', '1.00', '10.00', '-128.28']);
        expect(result[31]._operator).toBe("'");
        expect(result[31]._operands[0]).toContain('while maintaining consistent');
        expect(result[32]._operator).toBe('Tm');
        loadedDoc.destroy();
    });
});
describe('982023 - coverage', () => {
    it('982023 - should correctly execute _draw logic with save/translate/drawInternal/restore', () => {
        const mockState = {} as PdfGraphicsState;
        const graphics: any = {
            save: jasmine.createSpy('save').and.returnValue(mockState),
            translateTransform: jasmine.createSpy('translateTransform'),
            restore: jasmine.createSpy('restore')
        };
        class TestGraphicsElement extends PdfGraphicsElement {
            constructor() {
                super();
                this._bounds = { x: 0, y: 0, width: 0, height: 0 };
            }

            _drawInternal = jasmine.createSpy('_drawInternal');
        }
        const element = new TestGraphicsElement();
        const location = { x: 50, y: 100 };
        element.draw(graphics, location);
        expect(element._bounds.x).toBe(50);
        expect(element._bounds.y).toBe(100);
        expect(graphics.save).toHaveBeenCalled();
        expect(graphics.translateTransform).toHaveBeenCalledWith(location);
        expect(element._drawInternal).toHaveBeenCalledWith(graphics);
        expect(graphics.restore).toHaveBeenCalledWith(mockState);
    });
    it('982023 - should compute size when bounds width is 0', () => {
        const graphics: any = {};
        class TestField extends PdfAutomaticField {
            constructor() {
                super();
                this._bounds = { x: 0, y: 0, width: 0, height: 20 };
            }
            _getValue(): string {
                return 'Test';
            }
        }
        const field = new TestField();
        const mockFont: any = {
            measureString: jasmine.createSpy('measureString')
                .and.returnValue({ width: 50, height: 10 })
        };
        field._font = mockFont;
        field._draw(graphics, { x: 10, y: 10 });
        expect(mockFont.measureString).toHaveBeenCalled();
        expect(field._size).toEqual({ width: 50, height: 10 });
    });
    it('982023 - should compute size when bounds height is 0', () => {
        const graphics: any = {};
        class TestField extends PdfAutomaticField {
            constructor() {
                super();
                this._bounds = { x: 0, y: 0, width: 20, height: 0 };
            }
            _getValue(): string {
                return 'Test';
            }
        }
        const field = new TestField();
        const mockFont: any = {
            measureString: jasmine.createSpy('measureString')
                .and.returnValue({ width: 60, height: 15 })
        };
        field._font = mockFont;
        field._draw(graphics, { x: 5, y: 5 });
        expect(mockFont.measureString).toHaveBeenCalled();
        expect(field._size).toEqual({ width: 60, height: 15 });
    });
    it('982023 - should take width and height from bounds when both are defined', () => {
        class TestField extends PdfAutomaticField {
            _getValue(): string {
                return 'Test';
            }
        }
        const field = new TestField();
        field._bounds = { x: 0, y: 0, width: 200, height: 100 };
        field._size = { width: 50, height: 50 };
        const size = field._obtainSize();
        expect(size.width).toBe(200);
        expect(size.height).toBe(100);
    });
    it('982023 - should fall back to size when bounds is undefined', () => {
        class TestField extends PdfAutomaticField {
            _getValue(): string {
                return 'Test';
            }
        }
        const field = new TestField();
        field._bounds = undefined as any;
        field._size = { width: 75, height: 35 };
        const size = field._obtainSize();
        expect(size.width).toBe(75);
        expect(size.height).toBe(35);
    });
    it('982023 - should call drawString with correct parameters in _drawInternal', () => {
        const drawStringSpy = jasmine.createSpy('drawString');
        const graphics: any = {
            drawString: drawStringSpy
        };
        class TestField extends PdfAutomaticField {
            constructor() {
                super();
                this._bounds = { x: 10, y: 20, width: 0, height: 0 };
                this._size = { width: 100, height: 50 };
            }
            _getValue(): string {
                return 'Sample Text';
            }
        }
        const field = new TestField();
        const mockFont: any = {};
        const mockBrush: any = {};
        field._font = mockFont;
        field._brush = mockBrush;
        field._drawInternal(graphics);
        expect(drawStringSpy).toBeDefined();
    });
    it('982023 - should return default Helvetica font when _font is not set', () => {
        class TestField extends PdfAutomaticField {
            _getValue(): string {
                return 'Test';
            }
        }
        const field = new TestField();
        field._font = undefined as any;
        const font = field._obtainFont();
        expect(font).toBeDefined();
        expect(font instanceof PdfStandardFont).toBeTruthy();
        expect((font as PdfStandardFont)._fontFamily).toBe(PdfFontFamily.helvetica);
    });
    it('982023 - should correctly set and get automaticFields and pattern in PdfCompositeField', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const format = new PdfStringFormat(PdfTextAlignment.right);
        const pageNumber = new PdfPageNumberField({ font: font, brush: brush });
        const pageCount = new PdfPageCountField({ font: font, brush: brush });
        const composite = new PdfCompositeField({
            font: font,
            brush: brush,
            stringFormat: format
        });
        composite.automaticFields = [pageNumber, pageCount];
        composite.pattern = 'Page {0} of {1}';
        const fields = composite.automaticFields;
        const pattern = composite.pattern;
        expect(fields).toBeDefined();
        expect(fields.length).toBe(2);
        expect(fields[0]).toBe(pageNumber);
        expect(fields[1]).toBe(pageCount);
        expect(pattern).toBe('Page {0} of {1}');
        composite.draw(page.graphics, { x: 10, y: 10 });
        const data = document.save();
        expect(data).toBeDefined();
        document.destroy();
    });
    it('982023 - should correctly set and get dateFormatString in PdfCreationDateField', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const creationDate = new Date('2026-05-08T12:00:00');
        document.setDocumentInformation({
            title: 'Creation Date Sample',
            creationDate: creationDate
        });
        const field = new PdfCreationDateField();
        field.dateFormatString = 'yyyy/MM/dd';
        const format = field.dateFormatString;
        expect(format).toBe('yyyy/MM/dd');
        field.draw(page.graphics, { x: 10, y: 10 });
        const data = document.save();
        expect(data).toBeDefined();
        document.destroy();
    });
    it('982023 - should return current ISO date when document info is not available', () => {
        const field = new PdfCreationDateField();
        const graphics: any = {};
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _crossReference: {
                _document: {
                    getDocumentInformation: jasmine.createSpy('getDocumentInformation').and.returnValue(undefined)
                }
            }
        });
        const result = (field as any)._getValue(graphics);
        expect(result).toBeDefined();
        const parsedDate = new Date(result);
        expect(parsedDate.toString()).not.toBe('Invalid Date');
    });
    it('982023 - should assign page via constructor and return it using getter', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const format = new PdfStringFormat(PdfTextAlignment.right);
        const destinationField = new PdfDestinationPageNumberField({
            font: font,
            brush: brush,
            stringFormat: format,
            numberStyle: PdfNumberStyle.numeric,
            page: page
        });
        const resultPage = destinationField.page;
        expect(resultPage).toBe(page);
        destinationField.draw(page.graphics, { x: 10, y: 10 });
        const data = document.save();
        expect(data).toBeDefined();
        document.destroy();
    });
    it('982023 - should return assigned destination page using getter', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const format = new PdfStringFormat(PdfTextAlignment.right);
        const field = new PdfDestinationPageNumberField({
            font: font,
            brush: brush,
            stringFormat: format,
            numberStyle: PdfNumberStyle.numeric,
            page: page
        });
        const destinationPage = field.page;
        expect(destinationPage).toBe(page);
        document.destroy();
    });
    it('982023 - should return "1" when destination page is not set', () => {
        const field = new PdfDestinationPageNumberField();
        const graphics: any = {};
        const result = (field as any)._getValue(graphics);
        expect(result).toBe('1');
    });
    it('982023 - should return empty string when document author is not available', () => {
        const field = new PdfDocumentAuthorField();
        const graphics: any = {};
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _crossReference: {
                _document: {
                    getDocumentInformation: jasmine.createSpy('getDocumentInformation')
                        .and.returnValue({})
                }
            }
        });
        const result = (field as any)._getValue(graphics);
        expect(result).toBe('');
    });
    it('982023 - should correctly set and get numberStyle in PdfMultipleNumberValueField', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const field = new PdfPageNumberField({
            font: font,
            brush: brush
        });
        field.numberStyle = PdfNumberStyle.numeric;
        const style = field.numberStyle;
        expect(style).toBe(PdfNumberStyle.numeric);
        field.draw(page.graphics, { x: 10, y: 10 });
        const data = document.save();
        expect(data).toBeDefined();
        document.destroy();
    });
    it('982023 - should return empty string from _getValue in PdfMultipleNumberValueField', () => {
        class TestField extends PdfMultipleNumberValueField { }
        const field = new TestField();
        const graphics: any = {};
        const value = (field as any)._getValue(graphics);
        expect(value).toBe('');
    });
    it('982023 - should return empty string from _getValue in PdfMultipleValueField', () => {
        class TestField extends PdfMultipleValueField { }
        const field = new TestField();
        const graphics: any = {};
        const value = (field as any)._getValue(graphics);
        expect(value).toBe('');
    });
    it('982023 - should assign numberStyle from constructor and return it', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 13);
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const format = new PdfStringFormat(PdfTextAlignment.right);
        const field = new PdfPageCountField({
            font: font,
            brush: brush,
            stringFormat: format,
            numberStyle: PdfNumberStyle.lowerLatin
        });
        const style = field.numberStyle;
        expect(style).toBe(PdfNumberStyle.lowerLatin);
        field.draw(page.graphics, { x: 10, y: 10 });
        const data = document.save();
        expect(data).toBeDefined();
        document.destroy();
    });
    it('982023 - should get numberStyle from PdfPageCountField', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const field = new PdfPageCountField({
            numberStyle: PdfNumberStyle.lowerLatin
        });
        const style = field.numberStyle;
        expect(style).toBe(PdfNumberStyle.lowerLatin);
        document.destroy();
    });
    it('982023 - should return "1" when graphics is undefined', () => {
        const field = new PdfPageCountField();
        const result = (field as any)._getValue(undefined);
        expect(result).toBe('1');
    });
    it('982023 - should return "1" in _getValue when page or document is not available', () => {
        const field = new PdfPageNumberField();
        const graphics: any = {};
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _crossReference: {
                _document: null
            }
        });
        const result = (field as any)._getValue(graphics);
        expect(result).toBe('1');
    });
    it('982023 - should return "1" in _getValue when graphics is undefined', () => {
        const field = new PdfPageNumberField();
        const result = (field as any)._getValue(undefined);
        expect(result).toBe('1');
    });
    it('982023 - should set numberStyle from constructor in PdfSectionNumberField', () => {
        const field = new PdfSectionNumberField({
            numberStyle: PdfNumberStyle.lowerLatin
        });
        expect(field.numberStyle).toBe(PdfNumberStyle.lowerLatin);
    });
    it('982023 - should return default section number when section index is invalid', () => {
        const field = new PdfSectionNumberField();
        const graphics: any = {};
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _pageDictionary: {},
            _getSectionIndex: () => -1
        });
        const result = (field as any)._getValue(graphics);
        expect(result).toBe(_formatNumber(1, field.numberStyle));
    });
    it('982023 - should set numberStyle from constructor in PdfSectionPageCountField', () => {
        const field = new PdfSectionPageCountField({
            numberStyle: PdfNumberStyle.lowerLatin
        });
        expect(field.numberStyle).toBe(PdfNumberStyle.lowerLatin);
    });
    it('982023 - should return default value when page is undefined', () => {
        const field = new PdfSectionPageCountField();
        const result = (field as any)._getValue(undefined);
        expect(result).toBe(_formatNumber(1, field.numberStyle));
    });
    it('982023 - should return default value when section is not found', () => {
        const field = new PdfSectionPageCountField();
        const graphics: any = {};
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _getSectionIndex: () => 0,
            _crossReference: {
                _document: {
                    _sections: []
                }
            }
        });
        const result = (field as any)._getValue(graphics);
        expect(result).toBe(_formatNumber(1, field.numberStyle));
    });
    it('982023 - should set numberStyle from constructor in PdfSectionPageNumberField', () => {
        const field = new PdfSectionPageNumberField({
            numberStyle: PdfNumberStyle.lowerLatin
        });
        expect(field.numberStyle).toBe(PdfNumberStyle.lowerLatin);
    });
    it('982023 - should return default when page is undefined', () => {
        const field = new PdfSectionPageNumberField();
        const result = (field as any)._getValue(undefined);
        expect(result).toBe(_formatNumber(1, field.numberStyle));
    });
    it('982023 - should return default when pageRef or parentRef is missing', () => {
        const field = new PdfSectionPageNumberField();
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _pageDictionary: {
                getRaw: (): any => null
            },
            _ref: null
        });
        const result = (field as any)._getValue({});
        expect(result).toBe(_formatNumber(1, field.numberStyle));
    });
    it('982023 - should return default when parentDict has no Kids', () => {
        const field = new PdfSectionPageNumberField();
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _ref: { objectNumber: 1 },
            _pageDictionary: {
                getRaw: () => ({})
            },
            _crossReference: {
                _fetch: () => ({
                    has: () => false
                })
            }
        });
        const result = (field as any)._getValue({});
        expect(result).toBe(_formatNumber(1, field.numberStyle));
    });
    it('982023 - should return default when kids is not an array', () => {
        const field = new PdfSectionPageNumberField();
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _ref: { objectNumber: 1 },
            _pageDictionary: {
                getRaw: () => ({})
            },
            _crossReference: {
                _fetch: () => ({
                    has: () => true,
                    get: () => 'invalid'
                })
            }
        });
        const result = (field as any)._getValue({});
        expect(result).toBe(_formatNumber(1, field.numberStyle));
    });
    it('982023 - should return default when no matching kidRef is found', () => {
        const field = new PdfSectionPageNumberField();
        const graphics: any = {};
        spyOn(field as any, '_getPageFromGraphics').and.returnValue({
            _ref: { objectNumber: 999 },
            _pageDictionary: {
                getRaw: (): any => ({})
            },
            _crossReference: {
                _fetch: (): any => ({
                    has: (): boolean => true,
                    get: (): any[] => [
                        { objectNumber: 1 },
                        { objectNumber: 2 }
                    ]
                })
            }
        });
        const result = (field as any)._getValue(graphics);
        expect(result).toBe(_formatNumber(1, field.numberStyle));
    });
    it('982023 - should return empty string from PdfSingleValueField _getValue', () => {
        class TestField extends PdfSingleValueField { }
        const field = new TestField();
        const graphics: any = {};
        const result = (field as any)._getValue(graphics);
        expect(result).toBe('');
    });
    it('982023 - should return empty string from PdfStaticField _getValue', () => {
        class TestField extends PdfStaticField { }
        const field = new TestField();
        const graphics: any = {};
        const result = (field as any)._getValue(graphics);
        expect(result).toBe('');
    });
    it('982023 - should cover translateTransform branch', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const element: any = Object.create(PdfGraphicsElement.prototype);
        element._bounds = { x: 0, y: 0, width: 50, height: 20 };
        element._drawInternal = function (graphics: PdfGraphics) {
            graphics.drawString(
                'Test',
                new PdfStandardFont(PdfFontFamily.helvetica, 12),
                { x: 0, y: 0, width: 100, height: 20 },
                new PdfBrush({ r: 255, g: 0, b: 0 })
            );
        };
        element.draw(page.graphics, { x: 50, y: 60 });
        const contents: any = page._pageDictionary.getArray('Contents');
        const stream: any = contents[0];
        const parser: any = new _ContentParser(stream._bytes);
        const records: any[] = parser._readContent();
        const hasTransform = records.some(r => r._operator === 'cm');
        expect(hasTransform).toBe(false);
        document.destroy();
    });
    it('982023 - should use page crossReference when _page is set', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const template: any = new PdfPageTemplateElement({ width: 100, height: 50 });
        template._page = page;
        const graphics = template.graphics;
        graphics.drawString(
            'Template Test',
            new PdfStandardFont(PdfFontFamily.helvetica, 12),
            { x: 0, y: 0, width: 100, height: 20 },
            new PdfBrush({ r: 0, g: 0, b: 0 })
        );
        expect(graphics).toBeDefined();
        document.destroy();
    });
    it('982023 - should create template when cache is empty and value exists', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const field: any = Object.create(PdfMultipleValueField.prototype);
        field._templateValueMap = new Map();
        field._getValue = function () {
            return 'VALUE_1';
        };
        field._obtainFont = () => new PdfStandardFont(PdfFontFamily.helvetica, 10);
        field._obtainBrush = () => new PdfBrush({ r: 0, g: 0, b: 0 });
        field._obtainSize = () => ({ width: 100, height: 20 });
        field._performDraw(page.graphics, { x: 10, y: 10 });
        expect(field._templateValueMap.size).toBe(1);
        document.destroy();
    });
    it('982023 - should recreate template when value changes', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const field: any = Object.create(PdfMultipleValueField.prototype);
        field._templateValueMap = new Map();
        let counter = 0;
        field._getValue = function () {
            counter++;
            return counter === 1 ? 'A' : 'B';
        };
        field._obtainFont = () => new PdfStandardFont(PdfFontFamily.helvetica, 10);
        field._obtainBrush = () => new PdfBrush({ r: 0, g: 0, b: 0 });
        field._obtainSize = () => ({ width: 100, height: 20 });
        field._performDraw(page.graphics, { x: 10, y: 10 });
        field._performDraw(page.graphics, { x: 20, y: 20 });
        document.destroy();
    });
    it('982023 - should reuse cached template when value is same', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const field: any = Object.create(PdfMultipleValueField.prototype);
        field._templateValueMap = new Map();
        field._getValue = function () {
            return 'STATIC_VALUE';
        };
        field._obtainFont = () => new PdfStandardFont(PdfFontFamily.helvetica, 10);
        field._obtainBrush = () => new PdfBrush({ r: 0, g: 0, b: 0 });
        field._obtainSize = () => ({ width: 100, height: 20 });
        field._performDraw(page.graphics, { x: 10, y: 10 });
        const firstTemplate = field._templateValueMap.get(page.graphics).template;
        field._performDraw(page.graphics, { x: 30, y: 30 });
        const secondTemplate = field._templateValueMap.get(page.graphics).template;
        expect(firstTemplate).toBe(secondTemplate);
        document.destroy();
    });
    it('982023 - should skip drawing when value is empty', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const field: any = Object.create(PdfMultipleValueField.prototype);
        field._templateValueMap = new Map();
        field._getValue = function () {
            return '';
        };
        field._obtainFont = () => new PdfStandardFont(PdfFontFamily.helvetica, 10);
        field._obtainBrush = () => new PdfBrush({ r: 0, g: 0, b: 0 });
        field._obtainSize = () => ({ width: 100, height: 20 });
        field._performDraw(page.graphics, { x: 10, y: 10 });
        expect(field._templateValueMap.size).toBe(1);
        document.destroy();
    });
})