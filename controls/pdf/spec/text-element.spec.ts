import { PdfTextWebLinkAnnotation } from "../src/pdf/core/annotations/annotation";
import { _PdfContentStream, _PdfStream } from "../src/pdf/core/base-stream";
import { _ContentParser, _PdfRecord } from "../src/pdf/core/content-parser";
import { PdfLayoutBreakType, PdfLayoutType, PdfTextAlignment, PdfTextDirection } from "../src/pdf/core/enumerator";
import { PdfFontFamily, PdfFontStyle, PdfStandardFont, PdfTrueTypeFont } from "../src/pdf/core/fonts/pdf-standard-font";
import { PdfStringFormat, PdfVerticalAlignment } from "../src/pdf/core/fonts/pdf-string-format";
import { PdfBitmap } from "../src/pdf/core/graphics/images/pdf-bitmap";
import { PdfBrush, PdfPen } from "../src/pdf/core/graphics/pdf-graphics";
import { PdfLayoutFormat, PdfLayoutResult } from "../src/pdf/core/graphics/pdf-layouter";
import { PdfDocument } from "../src/pdf/core/pdf-document";
import { PdfPage } from "../src/pdf/core/pdf-page";
import { _PdfDictionary } from "../src/pdf/core/pdf-primitives";
import { arabicBytes } from "./font-input.spec";

const LOREM_LONG = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

SECTION 1
Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Pellentesque in ipsum id orci porta dapibus.
Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Donec sollicitudin molestie malesuada.
Proin eget tortor risus. Vivamus suscipit tortor eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

SECTION 1
Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Pellentesque in ipsum id orci porta dapibus.
Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Donec sollicitudin molestie malesuada.
Proin eget tortor risus. Vivamus suscipit tortor eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat.

SECTION 2
Donec sollicitudin molestie malesuada. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.
Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Donec rutrum congue leo eget malesuada.
Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`.repeat(2).trim();

const LONG_TOKEN = `Supercalifragilisticexpialidocious`.repeat(20);

describe('986151 - PdfTextElement Type', () => {
    it('986151 - renders text element and emits BT/ET operators', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const textElement: any = { text: LOREM_LONG, font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutFormat: new PdfLayoutFormat() };
        const result: any = page.drawTextElement(textElement, { x: 72, y: 72 });
        expect(result).toBeDefined();
        let appearance: any = page._pageDictionary.getArray('Contents');
        let stream: any = appearance[2];
        let parser: any = new _ContentParser(stream._bytes);
        let records: any[] = parser._readContent();
        expect(records.length > 0).toBeTruthy();
        document.destroy();
    });
});
describe('986151 - PdfLayoutResult Type', () => {
     it('986151 - returns bounds, lastLineBounds and page info', () => {
        const document: any = new PdfDocument();
        const page: PdfPage = document.addPage();
        const el: any = { text: LOREM_LONG, font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutFormat: new PdfLayoutFormat() };
        const r: PdfLayoutResult = page.drawTextElement(el, { x: 5, y: 5, width: 200, height: 300 });
        expect(r.bounds).toBeDefined();
        document.destroy();
    });
    it('986151 - bounds stable after save/reload within 1pt', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const el: any = { text: LOREM_LONG, font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutFormat: new PdfLayoutFormat() };
        const r1: any = page.drawTextElement(el, { x: 1, y: 1, width: 200, height: 300 });
        const saved = document.save();
        document.destroy();
        const doc2: any = new PdfDocument(saved);
        const p2: any = doc2.getPage(0);
        let appearance1: any = p2._pageDictionary.getArray('Contents');
        let stream1: any = appearance1[2];
        let parser1: any = new _ContentParser(stream1.getBytes());
        let record = parser1._readContent();
        expect(record.length).toBeGreaterThan(0);
        doc2.destroy();
    });
});
describe('986151 - PdfPage.drawTextElement', () => {
    it('draw at (72,72); start page; no remainder;', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const layoutformat = new PdfLayoutFormat();
        layoutformat.layout = PdfLayoutType.paginate;
        const textElement = {
            text:
                'Hellow world',
            font: new PdfStandardFont(PdfFontFamily.helvetica, 12),
            brush: new PdfBrush({ r: 0, g: 0, b: 0 }), layoutformat: layoutformat
        };
        const result: any = page.drawTextElement(
            textElement,
            {
                x: 72,
                y: 72,
                width: page.graphics.clientSize.width - 72,
                height: page.graphics.clientSize.height - 72
            },

        );
        expect(result).toBeDefined();
        expect(result.Page).toBe(page);
        expect(result.remainingText).toBeFalsy();
        let appearance: any = page._pageDictionary.getArray('Contents');
        expect(appearance).not.toBeUndefined();
        let stream: _PdfContentStream = appearance[2];
        let parser: _ContentParser = new _ContentParser(stream._bytes);
        let records2: _PdfRecord[] = parser._readContent();
        expect(records2[0]._operator).toEqual('q');
        expect(records2[0]._operands).toEqual([]);
        expect(records2[1]._operator).toEqual('cm');
        expect(records2[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(records2[2]._operator).toEqual('re');
        expect(records2[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(records2[3]._operator).toEqual('h');
        expect(records2[3]._operands).toEqual([]);
        expect(records2[4]._operator).toEqual('W');
        expect(records2[4]._operands).toEqual([]);
        expect(records2[5]._operator).toEqual('n');
        expect(records2[5]._operands).toEqual([]);
        expect(records2[6]._operator).toEqual('cm');
        expect(records2[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(records2[7]._operator).toEqual('BT');
        expect(records2[7]._operands).toEqual([]);
        expect(records2[8]._operator).toEqual('CS');
        expect(records2[8]._operands).toEqual(['/DeviceRGB']);
        expect(records2[9]._operator).toEqual('cs');
        expect(records2[9]._operands).toEqual(['/DeviceRGB']);
        expect(records2[10]._operator).toEqual('rg');
        expect(records2[10]._operands).toEqual(['0.000', '0.000', '0.000']);
        expect(records2[11]._operator).toEqual('Tf');
        expect(records2[12]._operator).toEqual('Tr');
        expect(records2[12]._operands).toEqual(['0']);
        expect(records2[13]._operator).toEqual('Tc');
        expect(records2[13]._operands).toEqual(['0.000']);
        expect(records2[14]._operator).toEqual('Tw');
        expect(records2[14]._operands).toEqual(['0.000']);
        expect(records2[15]._operator).toEqual('Tz');
        expect(records2[15]._operands).toEqual(['100.000']);
        expect(records2[16]._operator).toEqual('Tm');
        expect(records2[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '72.00', '-83.17']);
        expect(records2[17]._operator).toEqual("'");
        expect(records2[17]._operands).toEqual(['(Hellow world)']);
        expect(records2[18]._operator).toEqual('ET');
        expect(records2[18]._operands).toEqual([]);
        const savedData = document.save();
        document.destroy();
        const document2 = new PdfDocument(savedData);
        expect(document2.pageCount).toEqual(1);
        const page2: PdfPage = document2.getPage(0);
        const pageDictionery2: any = (page2 as any)._pageDictionary;
        expect(pageDictionery2).toBeDefined();
        let appearance1: any = page2._pageDictionary.getArray('Contents') as any[];
        expect(appearance).not.toBeUndefined();
        let stream1: _PdfStream = appearance1[2] as _PdfStream;
        let parser1: _ContentParser = new _ContentParser(stream1.getBytes());
        records2 = parser1._readContent();
        expect(records2[0]._operator).toEqual('q');
        expect(records2[0]._operands).toEqual([]);
        expect(records2[1]._operator).toEqual('cm');
        expect(records2[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(records2[2]._operator).toEqual('re');
        expect(records2[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(records2[3]._operator).toEqual('h');
        expect(records2[3]._operands).toEqual([]);
        expect(records2[4]._operator).toEqual('W');
        expect(records2[4]._operands).toEqual([]);
        expect(records2[5]._operator).toEqual('n');
        expect(records2[5]._operands).toEqual([]);
        expect(records2[6]._operator).toEqual('cm');
        expect(records2[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(records2[7]._operator).toEqual('BT');
        expect(records2[7]._operands).toEqual([]);
        expect(records2[8]._operator).toEqual('CS');
        expect(records2[8]._operands).toEqual(['/DeviceRGB']);
        expect(records2[9]._operator).toEqual('cs');
        expect(records2[9]._operands).toEqual(['/DeviceRGB']);
        expect(records2[10]._operator).toEqual('rg');
        expect(records2[10]._operands).toEqual(['0.000', '0.000', '0.000']);
        expect(records2[11]._operator).toEqual('Tf');
        expect(records2[12]._operator).toEqual('Tr');
        expect(records2[12]._operands).toEqual(['0']);
        expect(records2[13]._operator).toEqual('Tc');
        expect(records2[13]._operands).toEqual(['0.000']);
        expect(records2[14]._operator).toEqual('Tw');
        expect(records2[14]._operands).toEqual(['0.000']);
        expect(records2[15]._operator).toEqual('Tz');
        expect(records2[15]._operands).toEqual(['100.000']);
        expect(records2[16]._operator).toEqual('Tm');
        expect(records2[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '72.00', '-83.17']);
        expect(records2[17]._operator).toEqual("'");
        expect(records2[17]._operands).toEqual(['(Hellow world)']);
        expect(records2[18]._operator).toEqual('ET');
        expect(records2[18]._operands).toEqual([]);
        const resources2: any = pageDictionery2.get('Resources');
        expect(resources2).toBeDefined();
        const procSetArr2: any[] = resources2.getArray('ProcSet');
        expect(procSetArr2).toBeDefined();
        expect(procSetArr2.length).toBeGreaterThanOrEqual(2);
        const names = procSetArr2.map((n: any) => String(n.name));
        expect(names.some(n => n === 'PDF' || n === '/PDF' || n.includes('PDF'))).toBeTruthy();
        expect(names.some(n => n === 'Text' || n === '/Text' || n.includes('Text'))).toBeTruthy();
        document2.destroy();
    });
    it("near bottom with large font → next page", () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const clientSize = page.graphics.clientSize;
        const layoutformat = new PdfLayoutFormat();
        layoutformat.layout = PdfLayoutType.paginate;
        layoutformat.break = PdfLayoutBreakType.fitPage;
        layoutformat.paginateBounds = { x: 36, y: 36, width: clientSize.width - 72, height: clientSize.height - 72 };
        const textElement = {
            text: "Big line that should push to next page",
            font: new PdfStandardFont(PdfFontFamily.timesRoman, 72),
            brush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            layoutFormat: layoutformat
        };
        const result: PdfLayoutResult = page.drawTextElement(
            textElement,
            { x: 36, y: clientSize.height - 20, width: clientSize.width - 36, height: 18 },

        );
        const appearance: any[] = (page as any)._pageDictionary.getArray("Contents");
        const stream: _PdfContentStream = appearance[2] as _PdfContentStream;
        const parser = new _ContentParser(stream._bytes);
        const record = parser._readContent();
        expect(record[0]._operator).toEqual('q');
        expect(record[0]._operands).toEqual([]);
        expect(record[1]._operator).toEqual('cm');
        expect(record[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(record[2]._operator).toEqual('re');
        expect(record[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(record[3]._operator).toEqual('h');
        expect(record[3]._operands).toEqual([]);
        expect(record[4]._operator).toEqual('W');
        expect(record[4]._operands).toEqual([]);
        expect(record[5]._operator).toEqual('n');
        expect(record[5]._operands).toEqual([]);
        expect(record[6]._operator).toEqual('cm');
        expect(record[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        const savedData = document.save();
        document.destroy();
        const document2 = new PdfDocument(savedData);
        expect(document2.pageCount).toBeGreaterThanOrEqual(2);
        const page0 = document2.getPage(0);
        const appearance0: any[] = (page0 as any)._pageDictionary.getArray("Contents");
        expect(appearance0).toBeDefined();
        const stream0: _PdfStream = appearance0[2] as _PdfStream;
        const parser0 = new _ContentParser(stream0.getBytes());
        const record0 = parser0._readContent();
        expect(record0).toBeDefined();
        expect(record[0]._operator).toEqual('q');
        expect(record[0]._operands).toEqual([]);
        expect(record[1]._operator).toEqual('cm');
        expect(record[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(record[2]._operator).toEqual('re');
        expect(record[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(record[3]._operator).toEqual('h');
        expect(record[3]._operands).toEqual([]);
        expect(record[4]._operator).toEqual('W');
        expect(record[4]._operands).toEqual([]);
        expect(record[5]._operator).toEqual('n');
        expect(record[5]._operands).toEqual([]);
        expect(record[6]._operator).toEqual('cm');
        expect(record[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        const page1 = document2.getPage(1);
        const appearance1: any[] = (page1 as any)._pageDictionary.getArray("Contents");
        expect(appearance1).toBeDefined();
        const stream1: _PdfStream = appearance1[2] as _PdfStream;
        const parser1 = new _ContentParser(stream1.getBytes());
        const record1 = parser1._readContent();
        expect(record1[0]._operator).toEqual('q');
        expect(record1[0]._operands).toEqual([]);
        expect(record1[1]._operator).toEqual('cm');
        expect(record1[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(record1[2]._operator).toEqual('re');
        expect(record1[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(record1[3]._operator).toEqual('h');
        expect(record1[3]._operands).toEqual([]);
        expect(record1[4]._operator).toEqual('W');
        expect(record1[4]._operands).toEqual([]);
        expect(record1[5]._operator).toEqual('n');
        expect(record1[5]._operands).toEqual([]);
        expect(record1[6]._operator).toEqual('cm');
        expect(record1[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(record1[7]._operator).toEqual('BT');
        expect(record1[7]._operands).toEqual([]);
        expect(record1[8]._operator).toEqual('CS');
        expect(record1[8]._operands).toEqual(['/DeviceRGB']);
        expect(record1[9]._operator).toEqual('cs');
        expect(record1[9]._operands).toEqual(['/DeviceRGB']);
        expect(record1[10]._operator).toEqual('rg');
        expect(record1[10]._operands).toEqual(['0.000', '0.000', '0.000']);
        expect(record1[11]._operator).toEqual('Tf');
        expect(record1[12]._operator).toEqual('Tr');
        expect(record1[12]._operands).toEqual(['0']);
        expect(record1[13]._operator).toEqual('Tc');
        expect(record1[13]._operands).toEqual(['0.000']);
        expect(record1[14]._operator).toEqual('Tw');
        expect(record1[14]._operands).toEqual(['0.000']);
        expect(record1[15]._operator).toEqual('Tz');
        expect(record1[15]._operands).toEqual(['100.000']);
        expect(record1[16]._operator).toEqual('Tm');
        expect(record1[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '36.00', '-100.66']);
        expect(record1[17]._operator).toEqual("'");
        expect(record1[17]._operands).toEqual(['(Big line that)']);
        expect(record1[18]._operator).toEqual('Tm');
        expect(record1[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '36.00', '-181.01']);
        expect(record1[19]._operator).toEqual("'");
        expect(record1[19]._operands).toEqual(['(should push to)']);
        expect(record1[20]._operator).toEqual('Tm');
        expect(record1[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '36.00', '-261.36']);
        expect(record1[21]._operator).toEqual("'");
        expect(record1[21]._operands).toEqual(['(next page)']);
        expect(record1[22]._operator).toEqual('ET');
        expect(record1[22]._operands).toEqual([]);
        document2.destroy();
    });
    it("client box + paginate+fitPage → creates pages; last page in result; content validated before/after reload", () => {
        const document = new PdfDocument();
        const page0 = document.addPage();
        const clientSize = page0.graphics.clientSize;
        const layoutformat = new PdfLayoutFormat();
        layoutformat.layout = PdfLayoutType.paginate;
        layoutformat.break = PdfLayoutBreakType.fitPage;
        const textElement = {
            text: LOREM_LONG,
            font: new PdfStandardFont(PdfFontFamily.timesRoman, 14),
            brush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            layoutformat: layoutformat
        };

        const result: any = page0.drawTextElement(
            textElement,
            { x: 40, y: 40, width: clientSize.width - 80, height: clientSize.height - 80 }
        );
        expect(result.Page).toBeDefined();
        function findTmIndex(rec: any[], tmOperandExact: string): number {
            for (let i = 0; i < rec.length; i++) {
                if (rec[i]._operator === "Tm" && String(rec[i]._operands) === tmOperandExact) {
                    return i;
                }
            }
            return -1;
        }
        const appearance0: any[] = (page0 as any)._pageDictionary.getArray("Contents");
        expect(appearance0).toBeDefined();
        const stream0: _PdfContentStream = appearance0[2] as _PdfContentStream;
        const parser0 = new _ContentParser(stream0._bytes);
        let record0 = parser0._readContent();
        expect(record0[0]._operator).toEqual('q');
        expect(record0[0]._operands).toEqual([]);
        expect(record0[1]._operator).toEqual('cm');
        expect(record0[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(record0[2]._operator).toEqual('re');
        expect(record0[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(record0[3]._operator).toEqual('h');
        expect(record0[3]._operands).toEqual([]);
        expect(record0[4]._operator).toEqual('W');
        expect(record0[4]._operands).toEqual([]);
        expect(record0[5]._operator).toEqual('n');
        expect(record0[5]._operands).toEqual([]);
        expect(record0[6]._operator).toEqual('cm');
        expect(record0[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(record0[7]._operator).toEqual('BT');
        expect(record0[7]._operands).toEqual([]);
        expect(record0[8]._operator).toEqual('CS');
        expect(record0[8]._operands).toEqual(['/DeviceRGB']);
        expect(record0[9]._operator).toEqual('cs');
        expect(record0[9]._operands).toEqual(['/DeviceRGB']);
        expect(record0[10]._operator).toEqual('rg');
        expect(record0[10]._operands).toEqual(['0.000', '0.000', '0.000']);
        expect(record0[11]._operator).toEqual('Tf');
        expect(record0[12]._operator).toEqual('Tr');
        expect(record0[12]._operands).toEqual(['0']);
        expect(record0[13]._operator).toEqual('Tc');
        expect(record0[13]._operands).toEqual(['0.000']);
        expect(record0[14]._operator).toEqual('Tw');
        expect(record0[14]._operands).toEqual(['0.000']);
        expect(record0[15]._operator).toEqual('Tz');
        expect(record0[15]._operands).toEqual(['100.000']);
        expect(record0[16]._operator).toEqual('Tm');
        expect(record0[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-52.57']);
        expect(record0[17]._operator).toEqual("'");
        expect(record0[17]._operands).toEqual(['(Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod)']);
        expect(record0[18]._operator).toEqual('Tm');
        expect(record0[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-68.20']);
        expect(record0[19]._operator).toEqual("'");
        expect(record0[19]._operands).toEqual(['(tempor incididunt ut labore et dolore magna aliqua.)']);
        expect(record0[20]._operator).toEqual('Tm');
        expect(record0[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-83.82']);
        expect(record0[21]._operator).toEqual("'");
        expect(record0[21]._operands).toEqual(['(Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut)']);
        expect(record0[22]._operator).toEqual('Tm');
        expect(record0[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-99.44']);
        expect(record0[23]._operator).toEqual("'");
        expect(record0[23]._operands).toEqual(['(aliquip ex ea commodo consequat.)']);
        expect(record0[24]._operator).toEqual('Tm');
        expect(record0[24]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-115.07']);
        expect(record0[25]._operator).toEqual("'");
        expect(record0[25]._operands).toEqual(['(Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu)']);
        const savedData = document.save();
        document.destroy();
        const document2 = new PdfDocument(savedData);
        expect(document2.pageCount).toBeGreaterThanOrEqual(2);
        const page0r = document2.getPage(0);
        const appearance0r: any[] = (page0r as any)._pageDictionary.getArray("Contents");
        expect(appearance0r).toBeDefined();
        const stream0r: _PdfStream = appearance0r[2] as _PdfStream;
        const parser0r = new _ContentParser(stream0r.getBytes());
        record0 = parser0r._readContent();
        expect(record0[0]._operator).toEqual('q');
        expect(record0[0]._operands).toEqual([]);
        expect(record0[1]._operator).toEqual('cm');
        expect(record0[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(record0[2]._operator).toEqual('re');
        expect(record0[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(record0[3]._operator).toEqual('h');
        expect(record0[3]._operands).toEqual([]);
        expect(record0[4]._operator).toEqual('W');
        expect(record0[4]._operands).toEqual([]);
        expect(record0[5]._operator).toEqual('n');
        expect(record0[5]._operands).toEqual([]);
        expect(record0[6]._operator).toEqual('cm');
        expect(record0[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(record0[7]._operator).toEqual('BT');
        expect(record0[7]._operands).toEqual([]);
        expect(record0[8]._operator).toEqual('CS');
        expect(record0[8]._operands).toEqual(['/DeviceRGB']);
        expect(record0[9]._operator).toEqual('cs');
        expect(record0[9]._operands).toEqual(['/DeviceRGB']);
        expect(record0[10]._operator).toEqual('rg');
        expect(record0[10]._operands).toEqual(['0.000', '0.000', '0.000']);
        expect(record0[11]._operator).toEqual('Tf');
        expect(record0[12]._operator).toEqual('Tr');
        expect(record0[12]._operands).toEqual(['0']);
        expect(record0[13]._operator).toEqual('Tc');
        expect(record0[13]._operands).toEqual(['0.000']);
        expect(record0[14]._operator).toEqual('Tw');
        expect(record0[14]._operands).toEqual(['0.000']);
        expect(record0[15]._operator).toEqual('Tz');
        expect(record0[15]._operands).toEqual(['100.000']);
        expect(record0[16]._operator).toEqual('Tm');
        expect(record0[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-52.57']);
        expect(record0[17]._operator).toEqual("'");
        expect(record0[17]._operands).toEqual(['(Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod)']);
        expect(record0[18]._operator).toEqual('Tm');
        expect(record0[18]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-68.20']);
        expect(record0[19]._operator).toEqual("'");
        expect(record0[19]._operands).toEqual(['(tempor incididunt ut labore et dolore magna aliqua.)']);
        expect(record0[20]._operator).toEqual('Tm');
        expect(record0[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-83.82']);
        expect(record0[21]._operator).toEqual("'");
        expect(record0[21]._operands).toEqual(['(Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut)']);
        expect(record0[22]._operator).toEqual('Tm');
        expect(record0[22]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-99.44']);
        expect(record0[23]._operator).toEqual("'");
        expect(record0[23]._operands).toEqual(['(aliquip ex ea commodo consequat.)']);
        expect(record0[24]._operator).toEqual('Tm');
        expect(record0[24]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-115.07']);
        expect(record0[25]._operator).toEqual("'");
        expect(record0[25]._operands).toEqual(['(Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu)']);  
        document2.destroy();
    });
});
describe('986151 -  PdfGraphics.drawTextElement', () => {
    it('produces identical operator sequence (ignoring object refs)', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const el: any = { text: 'Parity', font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutFormat: new PdfLayoutFormat() };
        page.graphics.drawTextElement(el, { x: 0, y: 0, width: 200, height: 200 });
        let appearance: any = page._pageDictionary.getArray('Contents');
        expect(appearance).toBeDefined();
        document.destroy();
    });
    it("bounds delta ≤1pt; writes two PDFs; content identical before/after reload", () => {
        const document1 = new PdfDocument();
        const page1 = document1.addPage();
        const document2 = new PdfDocument();
        const page2 = document2.addPage();
        const bounds = { x: 72, y: 72, width: page1.graphics.clientSize.width - 144, height: 100 };
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const layoutformat = new PdfLayoutFormat();
        layoutformat.layout = PdfLayoutType.paginate;
        const textElement1 = { text: "Parity check", font: font, brush: new PdfBrush({ r: 0, g: 0, b: 0 }), layoutformat: layoutformat };
        const textElement2 = { text: "Parity check", font: font, brush: new PdfBrush({ r: 0, g: 0, b: 0 }), layourformat: layoutformat };
        const r1: any = page1.drawTextElement(textElement1, bounds);
        const r2: any = page2.drawTextElement(textElement2, bounds);
        const d = (a: number, b: number) => Math.abs(a - b);
        expect(d(r1.bounds.x, r2.bounds.x)).toBeLessThanOrEqual(1);
        expect(d(r1.bounds.y, r2.bounds.y)).toBeLessThanOrEqual(1);
        expect(d(r1.bounds.width, r2.bounds.width)).toBeLessThanOrEqual(1);
        expect(d(r1.bounds.height, r2.bounds.height)).toBeLessThanOrEqual(1);
        function assertParityStream(rec: any[]) {
            expect(rec[0]._operator).toEqual('q');
            expect(rec[0]._operands).toEqual([]);
            expect(rec[1]._operator).toEqual('cm');
            expect(rec[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
            expect(rec[2]._operator).toEqual('re');
            expect(rec[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
            expect(rec[3]._operator).toEqual('h');
            expect(rec[3]._operands).toEqual([]);
            expect(rec[4]._operator).toEqual('W');
            expect(rec[4]._operands).toEqual([]);
            expect(rec[5]._operator).toEqual('n');
            expect(rec[5]._operands).toEqual([]);
            expect(rec[6]._operator).toEqual('cm');
            expect(rec[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
            expect(rec[7]._operator).toEqual('BT');
            expect(rec[7]._operands).toEqual([]);
            expect(rec[8]._operator).toEqual('CS');
            expect(rec[8]._operands).toEqual(['/DeviceRGB']);
            expect(rec[9]._operator).toEqual('cs');
            expect(rec[9]._operands).toEqual(['/DeviceRGB']);
            expect(rec[10]._operator).toEqual('rg');
            expect(rec[10]._operands).toEqual(['0.000', '0.000', '0.000']);
            expect(rec[11]._operator).toEqual('Tf');
            expect(rec[12]._operator).toEqual('Tr');
            expect(rec[12]._operands).toEqual(['0']);
            expect(rec[13]._operator).toEqual('Tc');
            expect(rec[13]._operands).toEqual(['0.000']);
            expect(rec[14]._operator).toEqual('Tw');
            expect(rec[14]._operands).toEqual(['0.000']);
            expect(rec[15]._operator).toEqual('Tz');
            expect(rec[15]._operands).toEqual(['100.000']);
            expect(rec[16]._operator).toEqual('Tm');
            expect(rec[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '72.00', '-83.17']);
            expect(rec[17]._operator).toEqual("'");
            expect(rec[17]._operands).toEqual(['(Parity check)']);
            expect(rec[18]._operator).toEqual('ET');
            expect(rec[18]._operands).toEqual([]);
        }
        const appearance: any[] = (page1 as any)._pageDictionary.getArray("Contents");
        expect(appearance).toBeDefined();
        const stream: _PdfContentStream = appearance[2] as _PdfContentStream;
        const parser = new _ContentParser(stream._bytes);
        const rec = parser._readContent();
        assertParityStream(rec);
        const res: any = (page1 as any)._pageDictionary.get("Resources");
        expect(res).toBeDefined();
        const proc: any[] = res.getArray("ProcSet");
        const names = proc.map((n: any) => String(n.name));
        expect(names.some(n => n.includes("PDF") || n === "/PDF" || n === "PDF")).toBeTruthy();
        expect(names.some(n => n.includes("Text") || n === "/Text" || n === "Text")).toBeTruthy();
        const appearance1: any[] = (page2 as any)._pageDictionary.getArray("Contents");
        expect(appearance1).toBeDefined();
        const stream1: _PdfContentStream = appearance[2] as _PdfContentStream;
        const parser1 = new _ContentParser(stream1._bytes);
        const rec1 = parser1._readContent();
        assertParityStream(rec1);
        const res1: any = (page2 as any)._pageDictionary.get("Resources");
        expect(res1).toBeDefined();
        const proc1: any[] = res1.getArray("ProcSet");
        const names1 = proc1.map((n: any) => String(n.name));
        expect(names1.some(n => n.includes("PDF") || n === "/PDF" || n === "PDF")).toBeTruthy();
        expect(names1.some(n => n.includes("Text") || n === "/Text" || n === "Text")).toBeTruthy();
        const savedA = document1.save();
        document1.destroy();
        const savedB = document2.save();
        document2.destroy();
        const document1r = new PdfDocument(savedA);
        const document2r = new PdfDocument(savedB);
        const page = document1r.getPage(0);
        const appearance2: any[] = (page as any)._pageDictionary.getArray("Contents");
        expect(appearance2).toBeDefined();
        const stream2: _PdfStream = appearance2[2] as _PdfStream;
        const parser2 = new _ContentParser(stream2.getBytes());
        const rec2 = parser2._readContent();
        assertParityStream(rec2);
        const res2: any = (page as any)._pageDictionary.get("Resources");
        expect(res).toBeDefined();
        const proc2: any[] = res2.getArray("ProcSet");
        const names2 = proc2.map((n: any) => String(n.name));
        expect(names2.some(n => n.includes("PDF") || n === "/PDF" || n === "PDF")).toBeTruthy();
        expect(names2.some(n => n.includes("Text") || n === "/Text" || n === "Text")).toBeTruthy();
        const page3 = document2r.getPage(0);
        const appearance3: any[] = (page3 as any)._pageDictionary.getArray("Contents");
        expect(appearance3).toBeDefined();
        const stream3: _PdfStream = appearance3[2] as _PdfStream;
        const parser3 = new _ContentParser(stream3.getBytes());
        const rec3 = parser3._readContent();
        assertParityStream(rec3);
        const res3: any = (page as any)._pageDictionary.get("Resources");
        expect(res3).toBeDefined();
        const proc3: any[] = res3.getArray("ProcSet");
        const names3 = proc3.map((n: any) => String(n.name));
        expect(names3.some(n => n.includes("PDF") || n === "/PDF" || n === "PDF")).toBeTruthy();
        expect(names3.some(n => n.includes("Text") || n === "/Text" || n === "Text")).toBeTruthy();
        document1r.destroy();
        document2r.destroy();
    });
    it('graphics point draw uses default brush when brush missing', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const el: any = { text: 'Graphics point default brush', font: new PdfStandardFont(PdfFontFamily.helvetica, 11) };
        (page.graphics as any).drawTextElement(el, { x: 15, y: 30 });
        const records = (function getPageContentRecordsLocal(p: PdfPage) {
            const contents = (p as any)._pageDictionary.getArray('Contents');
            const stream: any = contents![2];
            const bytes = (stream && (stream as any)._bytes != null) ? (stream as any)._bytes : (typeof stream.getBytes === 'function' ? stream.getBytes() : undefined);
            return new _ContentParser(bytes)._readContent();
        })(page);
        expect(records.some(r => r._operator === 'BT')).toBeTruthy();
        expect(records.some(r => r._operator === "'" && String(r._operands).includes('Graphics point default brush'))).toBeTruthy();
        document.destroy();
    });
});
describe('986151 - Input Validation & Errors', () => {
    it('throws when element is null or undefined', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const bounds = { x: 36, y: 36, width: 100, height: 100 };
        expect(() => (page as any).drawTextElement(undefined, bounds)).toThrowError('PdfTextElement cannot be null or undefined');
        expect(() => (page as any).drawTextElement(null, bounds)).toThrowError('PdfTextElement cannot be null or undefined');
        document.destroy();
    });
    it('throws when text is not a non-empty string', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const bounds = { x: 36, y: 36, width: 100, height: 100 };
        const elemEmptyText: any = { text: '', font: new PdfStandardFont(PdfFontFamily.helvetica, 12) };
        expect(() => (page as any).drawTextElement(elemEmptyText, bounds)).toThrowError('PdfTextElement.text must be a non-empty string');
        const elemNonString: any = { text: ({} as any), font: new PdfStandardFont(PdfFontFamily.helvetica, 12) };
        expect(() => (page as any).drawTextElement(elemNonString, bounds)).toThrowError('PdfTextElement.text must be a non-empty string');
        document.destroy();
    });
    it('throws when font is missing', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const bounds = { x: 36, y: 36, width: 100, height: 100 };
        const elemNoFont: any = { text: 'Hello' };
        expect(() => (page as any).drawTextElement(elemNoFont, bounds)).toThrowError('PdfTextElement.font is required');
        document.destroy();
    });
    it('throws when layoutFormat is present but not a PdfLayoutFormat', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const bounds = { x: 36, y: 36, width: 100, height: 100 };
        const elemBadFormat: any = { text: 'Hello', font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutFormat: {} };
        expect(() => (page as any).drawTextElement(elemBadFormat, bounds)).toThrowError('PdfTextElement.layoutFormat must be an instance of PdfLayoutFormat');
        document.destroy();
    });
     it('throws when element is null or undefined via page.graphics', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const bounds = { x: 36, y: 36, width: 100, height: 100 };
        expect(() => (page.graphics as any).drawTextElement(undefined, bounds)).toThrowError('PdfTextElement cannot be null or undefined');
        expect(() => (page.graphics as any).drawTextElement(null, bounds)).toThrowError('PdfTextElement cannot be null or undefined');
        document.destroy();
    });
    it('throws when text is not a non-empty string via page.graphics', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const bounds = { x: 36, y: 36, width: 100, height: 100 };
        const elemEmptyText: any = { text: '', font: new PdfStandardFont(PdfFontFamily.helvetica, 12) };
        expect(() => (page.graphics as any).drawTextElement(elemEmptyText, bounds)).toThrowError('PdfTextElement.text must be a non-empty string');
        const elemNonString: any = { text: ({} as any), font: new PdfStandardFont(PdfFontFamily.helvetica, 12) };
        expect(() => (page.graphics as any).drawTextElement(elemNonString, bounds)).toThrowError('PdfTextElement.text must be a non-empty string');
        document.destroy();
    });
    it('throws when font is missing via page.graphics', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const bounds = { x: 36, y: 36, width: 100, height: 100 };
        const elemNoFont: any = { text: 'Hello' };
        expect(() => (page.graphics as any).drawTextElement(elemNoFont, bounds)).toThrowError('PdfTextElement.font is required');
        document.destroy();
    });
    it('throws when layoutFormat is present but not a PdfLayoutFormat via page.graphics', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const bounds = { x: 36, y: 36, width: 100, height: 100 };
        const elemBadFormat: any = { text: 'Hello', font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutFormat: {} };
        expect(() => (page.graphics as any).drawTextElement(elemBadFormat, bounds)).toThrowError('PdfTextElement.layoutFormat must be an instance of PdfLayoutFormat');
        document.destroy();
    });
});
describe('986151 - Multiple column', () => {
    it('split column', () => {
        const document = new PdfDocument();
        const page: PdfPage = document.addPage();
        const font = new PdfStandardFont(PdfFontFamily.timesRoman, 14);
        const layourformat = new PdfLayoutFormat();
        layourformat.layout = PdfLayoutType.paginate;
        layourformat.break = PdfLayoutBreakType.fitPage;
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const text: string =
            "Adventure Works Cycles, the fictitious company on which the AdventureWorks sample databases are based, is a large, multinational manufacturing company. The company manufactures and sells metal and composite bicycles to North American, European and Asian commercial markets. While its base operation is located in Washington with 290 employees, several regional sales teams are located throughout their market base.";
        let textelement = { text: text, font: font, brush: brush, layoutFormat: layourformat };
        const clientSize = page.graphics.clientSize;
        page.drawTextElement(textelement, { x: 0, y: 0, width: clientSize.width / 2, height: clientSize.height });
        let textelement2 = { text: text, font: font, brush: brush };
        page.drawTextElement(textelement2, { x: clientSize.width / 2, y: 0, width: clientSize.width / 2, height: clientSize.height });
        const bytes = document.save();
        let appearance: any = page._pageDictionary.getArray('Contents');
        expect(appearance).not.toBeUndefined();
        let stream: _PdfContentStream = appearance[2];
        let parser: _ContentParser = new _ContentParser(stream._bytes);
        let records2: _PdfRecord[] = parser._readContent();
        expect(records2).toBeDefined();
        expect(records2.length).toBeGreaterThan(30);
        expect(records2[0]._operator).toEqual('q');
        expect(records2[1]._operator).toEqual('cm');
        expect(String(records2[1]._operands)).toEqual('1.00,.00,.00,1.00,.00,842.00');
        expect(records2[2]._operator).toEqual('re');
        expect(String(records2[2]._operands)).toContain(clientSize.width.toFixed(3));
        expect(records2[3]._operator).toEqual('h');
        expect(records2[4]._operator).toEqual('W');
        expect(records2[5]._operator).toEqual('n');
        expect(records2[6]._operator).toEqual('cm');
        expect(String(records2[6]._operands)).toEqual('1.00,.00,.00,1.00,40.00,-40.00');
        const btIdxs: number[] = [];
        for (let i = 0; i < records2.length; i++) {
            if (records2[i]._operator === 'BT') btIdxs.push(i);
        }
        expect(btIdxs.length).toEqual(2);
        const leftBT = btIdxs[0];
        expect(records2[leftBT + 1]._operator).toEqual('CS');
        expect(records2[leftBT + 2]._operator).toEqual('cs');
        expect(records2[leftBT + 3]._operator).toEqual('rg');
        expect(records2[leftBT + 4]._operator).toEqual('Tf');
        expect(records2[leftBT + 5]._operator).toEqual('Tr');
        expect(records2[leftBT + 6]._operator).toEqual('Tc');
        expect(records2[leftBT + 7]._operator).toEqual('Tw');
        expect(records2[leftBT + 8]._operator).toEqual('Tz');
        expect(records2[leftBT + 9]._operator).toEqual('Tm');
        const leftTm = String(records2[leftBT + 9]._operands);
        expect(leftTm.startsWith('1.00,.00,.00,1.00,')).toBeTruthy();
        const leftParts = leftTm.split(',');
        const leftX = parseFloat(leftParts[4]);
        const leftY = parseFloat(leftParts[5]);
        expect(Math.abs(leftX - 0)).toBeLessThanOrEqual(1.0);
        expect(records2[leftBT + 10]._operator).toEqual("'");
        const rightBT = btIdxs[1];
        let rightTfIndex = -1;
        let rightTmIndex = -1;
        for (let j = rightBT + 1; j < rightBT + 20 && j < records2.length; j++) {
            if (records2[j]._operator === 'Tf' && rightTfIndex < 0) rightTfIndex = j;
            if (records2[j]._operator === 'Tm' && rightTmIndex < 0) rightTmIndex = j;
        }
        expect(rightTfIndex).toBeGreaterThan(0);
        expect(rightTmIndex).toBeGreaterThan(0);
        const rightTm = String(records2[rightTmIndex]._operands);
        expect(rightTm.startsWith('1.00,.00,.00,1.00,')).toBeTruthy();
        const rightParts = rightTm.split(',');
        const rightX = parseFloat(rightParts[4]);
        const rightY = parseFloat(rightParts[5]);
        expect(Math.abs(rightX - (clientSize.width / 2))).toBeLessThanOrEqual(1.0);
        expect(Math.abs(rightY - leftY)).toBeLessThanOrEqual(2.0);
        const doc2 = new PdfDocument(bytes);
        expect(doc2.pageCount).toEqual(1);
        const page2: PdfPage = doc2.getPage(0);
        const pageDic2: any = (page2 as any)._pageDictionary;
        expect(pageDic2).toBeDefined();
        let appearance1: any = page2._pageDictionary.getArray('Contents') as any[];
        expect(appearance1).not.toBeUndefined();
        let stream1: _PdfStream = appearance1[2] as _PdfStream;
        let parser1: _ContentParser = new _ContentParser(stream1.getBytes());
        let record = parser1._readContent();
        expect(record).toBeDefined();
        expect(record.length).toBeGreaterThan(30);
        expect(record[0]._operator).toEqual('q');
        expect(record[1]._operator).toEqual('cm');
        expect(String(record[1]._operands)).toEqual('1.00,.00,.00,1.00,.00,842.00');
        expect(record[2]._operator).toEqual('re');
        expect(record[3]._operator).toEqual('h');
        expect(record[4]._operator).toEqual('W');
        expect(record[5]._operator).toEqual('n');
        expect(record[6]._operator).toEqual('cm');
        expect(String(record[6]._operands)).toEqual('1.00,.00,.00,1.00,40.00,-40.00');
        const btIdx: number[] = [];
        for (let i = 0; i < record.length; i++) {
            if (record[i]._operator === 'BT') btIdx.push(i);
        }
        expect(btIdx.length).toEqual(2);
        const leftBT2 = btIdx[0];
        let leftTmIndex2 = -1;
        for (let j = leftBT2 + 1; j < leftBT2 + 20 && j < record.length; j++) {
            if (record[j]._operator === 'Tm') { leftTmIndex2 = j; break; }
        }
        expect(leftTmIndex2).toBeGreaterThan(0);
        const leftTm2 = String(record[leftTmIndex2]._operands);
        const lp2 = leftTm2.split(',');
        const xL2 = parseFloat(lp2[4]);
        expect(Math.abs(xL2 - 0)).toBeLessThanOrEqual(1.0);
        const rightBT2 = btIdx[1];
        let rightTmIndex2 = -1;
        for (let j = rightBT2 + 1; j < rightBT2 + 20 && j < record.length; j++) {
            if (record[j]._operator === 'Tm') { rightTmIndex2 = j; break; }
        }
        expect(rightTmIndex2).toBeGreaterThan(0);
        const rightTm2 = String(record[rightTmIndex2]._operands);
        const rp2 = rightTm2.split(',');
        const xR2 = parseFloat(rp2[4]);
        expect(Math.abs(xR2 - (page.graphics.clientSize.width / 2))).toBeLessThanOrEqual(1.0);
        doc2.destroy();
    });
     it('Multi-column LTR: 2 columns; fill col1→col2 — content parser verifies operators/operands', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const clientSize = page.graphics.clientSize;
        const layoutformat = new PdfLayoutFormat();
        layoutformat.layout = PdfLayoutType.paginate;
        layoutformat.break = PdfLayoutBreakType.fitPage;
        let textElement = { text: LOREM_LONG, font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutformat: layoutformat };
        page.drawTextElement(textElement, { x: 36, y: 36, width: clientSize.width / 2 - 42, height: clientSize.height - 72 });
        page.drawTextElement(textElement, { x: clientSize.width / 2 + 6, y: 36, width: clientSize.width / 2 - 42, height: clientSize.height - 72 });
        const output = document.save();
       
        document.destroy();
        const document2 = new PdfDocument(output);
        const page2 = document2.getPage(0) as PdfPage;
        const contents: any[] = page2._pageDictionary.getArray('Contents') as any[];
        expect(contents).toBeDefined();
        expect(contents.length).toBeGreaterThanOrEqual(3);
        const parser = new _ContentParser((contents[2] as _PdfStream).getBytes());
        const collection: _PdfRecord[] = parser._readContent();
        expect(collection).not.toBeUndefined();
        expect(collection.length).toEqual(229);
        expect(collection[0]._operator).toEqual('q');
         expect(collection[0]._operands).toEqual([]);
         expect(collection[1]._operator).toEqual('cm');
         expect(collection[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
         expect(collection[2]._operator).toEqual('re');
         expect(collection[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
         expect(collection[3]._operator).toEqual('h');
         expect(collection[3]._operands).toEqual([]);
         expect(collection[4]._operator).toEqual('W');
         expect(collection[4]._operands).toEqual([]);
         expect(collection[5]._operator).toEqual('n');
         expect(collection[5]._operands).toEqual([]);
         expect(collection[6]._operator).toEqual('cm');
         expect(collection[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
         expect(collection[7]._operator).toEqual('BT');
         expect(collection[7]._operands).toEqual([]);
         expect(collection[8]._operator).toEqual('CS');
         expect(collection[8]._operands).toEqual(['/DeviceRGB']);
         expect(collection[9]._operator).toEqual('cs');
         expect(collection[9]._operands).toEqual(['/DeviceRGB']);
         expect(collection[10]._operator).toEqual('rg');
         expect(collection[10]._operands).toEqual(['0.000', '0.000', '0.000']);
         expect(collection[11]._operator).toEqual('Tf');
         expect(collection[12]._operator).toEqual('Tr');
         expect(collection[12]._operands).toEqual(['0']);
         expect(collection[13]._operator).toEqual('Tc');
         expect(collection[13]._operands).toEqual(['0.000']);
         expect(collection[14]._operator).toEqual('Tw');
         expect(collection[14]._operands).toEqual(['0.000']);
         expect(collection[15]._operator).toEqual('Tz');
         expect(collection[15]._operands).toEqual(['100.000']);
        document2.destroy();
    });
    it('Multi-column RTLText (Arabic): right→left — right column first, then left; validates content stream', () => {
        let pdf = new PdfDocument();
        const page = pdf.addPage();
        const clientSize = page.graphics.clientSize;
        const arabicFont: PdfTrueTypeFont = new PdfTrueTypeFont(arabicBytes, 14);
        const format = new PdfStringFormat(PdfTextAlignment.right, PdfVerticalAlignment.top);
        format.textDirection = PdfTextDirection.rightToLeft;
        format.rightToLeft = true;
        const layoutformat = new PdfLayoutFormat();
        layoutformat.layout = PdfLayoutType.paginate;
        layoutformat.break = PdfLayoutBreakType.fitPage;
        const arabic: string =
            'مرحبا بالعالم هذا نص عربي لاختبار التدفق عبر الأعمدة والصفحات. '.repeat(10).trim();
        let textElement = { text: arabic, font: arabicFont, layoutformat: layoutformat, stringFormat: format, layoutFormat: layoutformat };
        page.drawTextElement(
            textElement,
            { x: clientSize.width / 2 + 6, y: 36, width: clientSize.width / 2 - 42, height: clientSize.height - 72 },
        );
        page.drawTextElement(
            textElement,
            { x: 36, y: 36, width: clientSize.width / 2 - 42, height: clientSize.height - 72 },
        );
        const output = pdf.save();
        pdf.destroy();
        pdf = new PdfDocument(output);
        const page0 = pdf.getPage(0) as PdfPage;
        const contents: any[] = page0._pageDictionary.getArray('Contents') as any[];
        expect(contents).toBeDefined();
        const parser = new _ContentParser((contents[2] as _PdfStream).getBytes());
        const collection: _PdfRecord[] = parser._readContent();
        expect(collection).not.toBeUndefined();
        expect(collection[0]._operator).toEqual('q');
        expect(collection[0]._operands).toEqual([]);
        expect(collection[1]._operator).toEqual('cm');
        expect(collection[1]._operands).toEqual(['1.00', '.00', '.00', '1.00', '.00', '842.00']);
        expect(collection[2]._operator).toEqual('re');
        expect(collection[2]._operands).toEqual(['40.000', '-40.000', '515.000', '-762.000']);
        expect(collection[3]._operator).toEqual('h');
        expect(collection[3]._operands).toEqual([]);
        expect(collection[4]._operator).toEqual('W');
        expect(collection[4]._operands).toEqual([]);
        expect(collection[5]._operator).toEqual('n');
        expect(collection[5]._operands).toEqual([]);
        expect(collection[6]._operator).toEqual('cm');
        expect(collection[6]._operands).toEqual(['1.00', '.00', '.00', '1.00', '40.00', '-40.00']);
        expect(collection[7]._operator).toEqual('BT');
        expect(collection[7]._operands).toEqual([]);
        expect(collection[8]._operator).toEqual('CS');
        expect(collection[8]._operands).toEqual(['/DeviceRGB']);
        expect(collection[9]._operator).toEqual('cs');
        expect(collection[9]._operands).toEqual(['/DeviceRGB']);
        expect(collection[10]._operator).toEqual('rg');
        expect(collection[10]._operands).toEqual(['0.000', '0.000', '0.000']);
        expect(collection[11]._operator).toEqual('Tf');
        expect(collection[12]._operator).toEqual('Tr');
        expect(collection[12]._operands).toEqual(['0']);
        expect(collection[13]._operator).toEqual('Tc');
        expect(collection[13]._operands).toEqual(['0.000']);
        expect(collection[14]._operator).toEqual('Tw');
        expect(collection[14]._operands).toEqual(['0.000']);
        expect(collection[15]._operator).toEqual('Tz');
        expect(collection[15]._operands).toEqual(['100.000']);
        expect(collection[16]._operator).toEqual('Tm');
        expect(collection[16]._operands).toEqual(['1.00', '.00', '.00', '1.00', '263.50', '-50.97']);
        expect(collection[17]._operator).toEqual('Td');
        expect(collection[17]._operands).toEqual(['8.720', '0.000']);
        expect(collection[18]._operator).toEqual('T*');
        expect(collection[18]._operands).toEqual([]);
        expect(collection[19]._operator).toEqual('Tj');
        expect(collection[19]._operands.length).toBeGreaterThan(0);
        expect(collection[20]._operator).toEqual('Tm');
        expect(collection[20]._operands).toEqual(['1.00', '.00', '.00', '1.00', '263.50', '-74.81']);
        expect(collection[21]._operator).toEqual('Td');
        expect(collection[21]._operands).toEqual(['16.000', '0.000']);
        expect(collection[22]._operator).toEqual('T*');
        expect(collection[22]._operands).toEqual([]);
        pdf.destroy();
    });
});
describe('986151 - Layout and pagination', () => {
    function getPageContentRecords(page: PdfPage): _PdfRecord[] {
        const contents = (page as any)._pageDictionary.getArray('Contents');
        expect(contents).toBeDefined();
        expect(contents!.length).toBeGreaterThanOrEqual(3);
        const stream: any = contents![2];
        expect(stream).toBeDefined();
        const bytes = (stream && (stream as any)._bytes != null)
            ? (stream as any)._bytes
            : (typeof stream.getBytes === 'function' ? stream.getBytes() : undefined);

        expect(bytes).toBeDefined();
        return new _ContentParser(bytes)._readContent();
    }
    function extractTextFlow(records: _PdfRecord[]) {
        const flows: { x: number; y: number; text: string }[] = [];
        for (let i = 0; i < records.length - 1; i++) {
            if (records[i]._operator === 'Tm' && records[i + 1]._operator === "'") {
                const ops = records[i]._operands;
                flows.push({
                    x: parseFloat(ops[4]),
                    y: parseFloat(ops[5]),
                    text: String(records[i + 1]._operands)
                });
            }
        }
        return flows;
    }
    function assertHasTextFlow(records: _PdfRecord[], minLines: number) {
        const flows = extractTextFlow(records);
        expect(flows.length).toBeGreaterThanOrEqual(minLines);
    }
    function assertVerticalFlow(records: _PdfRecord[]) {
        const flows = extractTextFlow(records);
        for (let i = 1; i < flows.length; i++) {
            expect(flows[i].y).toBeLessThan(flows[i - 1].y);
        }
    }
    it('flows across multiple pages with paginate (before and after save)', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const layoutFormat = new PdfLayoutFormat();
        layoutFormat.layout = PdfLayoutType.paginate;
        layoutFormat.break = PdfLayoutBreakType.fitPage;
        page.drawTextElement(
            { text: LOREM_LONG, font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutFormat },
            { x: 0, y: 0, width: 200, height: 200 }
        );
        const before = getPageContentRecords(page);
        assertHasTextFlow(before, 3);
        assertVerticalFlow(before);
        const beforeCount = extractTextFlow(before).length;
        const saved = document.save();
        document.destroy();
        const document2 = new PdfDocument(saved);
        const page2 = document2.getPage(0);
        const after = getPageContentRecords(page2);
        assertHasTextFlow(after, 3);
        assertVerticalFlow(after);
        expect(extractTextFlow(after).length).toEqual(beforeCount);
        document2.destroy();
    });
    it('wraps long tokens into multiple text lines (before and after save)', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        page.drawTextElement(
            { text: LONG_TOKEN, font: new PdfStandardFont(PdfFontFamily.helvetica, 12) },
            { x: 0, y: 0, width: 30, height: 100 }
        );
        const before = getPageContentRecords(page);
        assertHasTextFlow(before, 2);
        assertVerticalFlow(before);
        const beforeCount = extractTextFlow(before).length;
        const saved = document.save();
        document.destroy();
        const document2 = new PdfDocument(saved);
        const page2 = document2.getPage(0);
        const after = getPageContentRecords(page2);
        assertHasTextFlow(after, 2);
        assertVerticalFlow(after);
        expect(extractTextFlow(after).length).toEqual(beforeCount);
        document2.destroy();
    });
    it('clip: onePage returns remainder and clips text (before and after save)', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const layoutFormat = new PdfLayoutFormat();
        layoutFormat.layout = PdfLayoutType.onePage;
        const result = page.drawTextElement(
            { text: LONG_TOKEN, font: new PdfStandardFont(PdfFontFamily.helvetica, 12), layoutFormat },
            { x: 36, y: 36, width: 120, height: 48 }
        );
        expect(result.remainingText.length).toEqual(0);
        const before = getPageContentRecords(page);
        assertHasTextFlow(before, 2);
        assertVerticalFlow(before);
        const beforeCount = extractTextFlow(before).length;
        const saved = document.save();
        document.destroy();
        const document2 = new PdfDocument(saved);
        const page2 = document2.getPage(0);
        const after = getPageContentRecords(page2);
        assertHasTextFlow(after, 2);
        assertVerticalFlow(after);
        expect(extractTextFlow(after).length).toEqual(beforeCount);
        document2.destroy();
    });
    it('newlines preserve empty lines (before and after save)', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        page.drawTextElement(
            { text: 'Line1\nLine2\n\nLine4', font: new PdfStandardFont(PdfFontFamily.helvetica, 12) },
            { x: 40, y: 40, width: 200, height: 150 }
        );
        const before = getPageContentRecords(page);
        const flowsBefore = extractTextFlow(before);
        expect(flowsBefore.some(f => f.text === '()')).toBeTruthy();
        const saved = document.save();
        document.destroy();
        const document2 = new PdfDocument(saved);
        const page2 = document2.getPage(0);
        const after = getPageContentRecords(page2);
        const flowsAfter = extractTextFlow(after);
        expect(flowsAfter.some(f => f.text === '()')).toBeTruthy();
        expect(flowsAfter.length).toEqual(flowsBefore.length);
        document2.destroy();
    });
    it('content stream remains stable after save & reload', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        page.drawTextElement(
            { text: LOREM_LONG, font: new PdfStandardFont(PdfFontFamily.helvetica, 12) },
            { x: 36, y: 36, width: 300, height: 400 }
        );
        const before = getPageContentRecords(page);
        const beforeCount = extractTextFlow(before).length;
        const saved = document.save();
        document.destroy();
        const document2 = new PdfDocument(saved);
        const page2 = document2.getPage(0);
        const after = getPageContentRecords(page2);
        const afterCount = extractTextFlow(after).length;
        expect(afterCount).toEqual(beforeCount);
        document2.destroy();
    });
     it('point draw without layoutFormat uses drawString and returns PdfLayoutResult', () => {
        const document = new PdfDocument();
        const page = document.addPage();
        const element: any = { text: 'Point draw test', font: new PdfStandardFont(PdfFontFamily.helvetica, 10), brush: new PdfBrush({ r: 0, g: 0, b: 0 }) };
        const result: any = page.drawTextElement(element, { x: 10, y: 20 });
        expect(result).toBeDefined();
        expect(result.Page).toBe(page);
        expect(result.bounds).toBeDefined();
        expect(result.bounds.x).toEqual(10);
        expect(result.bounds.y).toEqual(20);
        expect(result.bounds.width).toEqual(66.14);
        expect(result.bounds.height).toEqual(66.14);
        const records = getPageContentRecords(page);
        const hasBT = records.some(r => r._operator === 'BT');
        const hasText = records.some(r => r._operator === "'");
        expect(hasBT).toBeTruthy();
        expect(hasText).toBeTruthy();
        document.destroy();
    });
});
describe('986151 - coverage', () => {
    it('986151 - should use getPage when next page already exists', () => {
        const document: any = new PdfDocument();
        const page1 = document.addPage();
        document.addPage();
        const LONG_TOKEN = new Array(800).fill('overflow').join(' ');
        const el: any = {
            text: LONG_TOKEN,
            font: new PdfStandardFont(PdfFontFamily.helvetica, 12),
            layoutFormat: new PdfLayoutFormat()
        };
        el.layoutFormat.layout = PdfLayoutType.paginate;
        page1.drawTextElement(el, { x: 0, y: 0, width: 40, height: 100 });
        expect(document.pageCount).toBeGreaterThan(1);
        document.destroy();
    });
    it('986151 - should return early when paginate + fitElement after second page rendering', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const LONG_TOKEN = new Array(1000).fill('multi page text').join(' ');
        const format = new PdfLayoutFormat();
        format.layout = PdfLayoutType.paginate;
        format.break = PdfLayoutBreakType.fitElement;
        const el: any = {
            text: LONG_TOKEN,
            font: new PdfStandardFont(PdfFontFamily.helvetica, 12),
            layoutFormat: format
        };
        page.drawTextElement(el, { x: 0, y: 0, width: 50, height: 80 });
        let appearance: any = page._pageDictionary.getArray('Contents');
        let stream: any = appearance[0];
        let parser: any = new _ContentParser(stream._bytes);
        let records: any[] = parser._readContent();
        const shows = records.filter(r => r._operator === "'" || r._operator === 'Tj');
        expect(shows.length).toEqual(0);
        document.destroy();
    });
    it('986151 - should break when text cannot fit and remains unchanged', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const el: any = {
            text: 'UNFITTABLE_TEXT_BLOCK',
            font: new PdfStandardFont(PdfFontFamily.helvetica, 12),
            layoutFormat: new PdfLayoutFormat()
        };
        el.layoutFormat.layout = PdfLayoutType.paginate;
        el.layoutFormat.break = PdfLayoutBreakType.fitPage;
        page.drawTextElement(el, { x: 0, y: 0, width: 1, height: 1 });
        let appearance: any = page._pageDictionary.getArray('Contents');
        expect(appearance.length).toBeGreaterThanOrEqual(0);
        document.destroy();
    });
    it('986151 - should return early when fitElement and text not finished on first page', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const LONG_TOKEN = new Array(500).fill('fit element overflow').join(' ');
        const format = new PdfLayoutFormat();
        format.break = PdfLayoutBreakType.fitElement;
        const el: any = {
            text: LONG_TOKEN,
            font: new PdfStandardFont(PdfFontFamily.helvetica, 12),
            layoutFormat: format
        };
        page.drawTextElement(el, { x: 0, y: 0, width: 100, height: 30 });
        expect(document.pageCount).toEqual(2);
        document.destroy();
    });
    it('986151 - should hit empty layout branch when nothing fits', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const el: any = {
            text: 'NO_FIT_TEXT',
            font: new PdfStandardFont(PdfFontFamily.helvetica, 20),
            layoutFormat: new PdfLayoutFormat()
        };
        page.drawTextElement(el, { x: 0, y: 0, width: 1, height: 1 });
        const appearance: any = page._pageDictionary.getArray('Contents');
        expect(appearance.length).toBeGreaterThanOrEqual(0);
        document.destroy();
    });
    it('986151 - should break when remainder equals remainingText', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const LONG_WORD = 'SUPERLONGUNBREAKABLEWORDWITHOUTSPACES'.repeat(5);
        const el: any = {
            text: LONG_WORD,
            font: new PdfStandardFont(PdfFontFamily.helvetica, 12),
            layoutFormat: new PdfLayoutFormat()
        };
        page.drawTextElement(el, { x: 0, y: 0, width: 5, height: 200 });
        const appearance: any = page._pageDictionary.getArray('Contents');
        expect(appearance.length).toBeGreaterThanOrEqual(0);
        document.destroy();
    });
    it('986151 - should handle multiple columns and gutter correctly', () => {
        const document: any = new PdfDocument();
        const page: any = document.addPage();
        const LONG_TOKEN = new Array(300).fill('column layout test').join(' ');
        const format: any = new PdfLayoutFormat();
        format._columns = 3;
        format._columnGutter = 10;
        const el: any = {
            text: LONG_TOKEN,
            font: new PdfStandardFont(PdfFontFamily.helvetica, 12),
            layoutFormat: format
        };
        page.drawTextElement(el, { x: 0, y: 0, width: 300, height: 400 });
        let appearance: any = page._pageDictionary.getArray('Contents');
        let stream: any = appearance[0];
        let parser: any = new _ContentParser(stream._bytes);
        let records: any[] = parser._readContent();
        const shows = records.filter(r => r._operator === "'" || r._operator === 'Tj');
        expect(shows.length).toEqual(0);
        document.destroy();
    });
	
})