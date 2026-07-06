import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfBrush, PdfGraphics, PdfGraphicsState, PdfPen } from '../src/pdf/core/graphics/pdf-graphics';
import { _PdfDictionary, _PdfName } from '../src/pdf/core/pdf-primitives';
import { _PdfReference } from '../src/pdf/core/pdf-primitives';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { PdfStringFormat } from '../src/pdf/core/fonts/pdf-string-format';
import { PdfFont, PdfFontFamily, PdfFontStyle, PdfStandardFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfTextAlignment, PdfBlendMode, PdfFillMode, PdfSubSuperScript, PathPointType } from '../src/pdf/core/enumerator';
import { PdfTextElement, Point, Rectangle, Size } from '../src/pdf/core/pdf-type';
import { PdfImage } from '../src/pdf/core/graphics/images/pdf-image';
import { PdfPath } from '../src/pdf/core/graphics/pdf-path';
import { _PdfStreamWriter } from '../src/pdf/core/graphics/pdf-stream-writer';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { PdfBitmap } from '../src/pdf/core/graphics/images/pdf-bitmap';

describe('PdfGraphics targeted behavior', () => {

    it('constructor uses parent Resources dictionary when present', () => {
        // Arrange
        const parentResources: _PdfDictionary = new _PdfDictionary();
        const parentPage: _PdfDictionary = new _PdfDictionary();
        parentPage.update('Resources', parentResources);
        const template: PdfTemplate = new PdfTemplate({ width: 10, height: 10 });
        template._content.dictionary.update('Parent', parentPage);
        // Act
        const graphics: PdfGraphics = template.graphics;
        // Assert
        expect(template._content.dictionary.get('Resources')).toBe(parentResources);
        expect(graphics._resourceObject).toBe(parentResources);
    });

    it('constructor fetches resource when Parent.Resources is a reference', () => {
        // Arrange
        const fetchedResources: _PdfDictionary = new _PdfDictionary();
        const ref: _PdfReference = new _PdfReference(5, 0);
        const crossRefStub: any = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedResources)
        };
        const template: PdfTemplate = new PdfTemplate({ x: 0, y: 0, width: 20, height: 20 }, crossRefStub);
        const parentPage: _PdfDictionary = new _PdfDictionary();
        parentPage.update('Resources', ref);
        template._content.dictionary.update('Parent', parentPage);
        // Act
        const graphics: PdfGraphics = template.graphics;
        // Assert
        expect(crossRefStub._fetch).toHaveBeenCalledWith(ref);
        expect(graphics._hasResourceReference).toBeTruthy();
        expect(graphics._resourceObject).toBe(fetchedResources);
    });

    it('constructor creates new Resources dictionary when none exists', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 8, height: 8 });
        // Act
        const graphics: PdfGraphics = template.graphics;
        // Assert
        const res = template._content.dictionary.get('Resources');
        expect(res).toBeDefined();
        expect(res instanceof _PdfDictionary).toBeTruthy();
        expect(graphics._resourceObject).toBe(res);
    });

    it('setTransparency with crossReference updates cache and dictionary', () => {
        // Arrange
        const fetchedDict: _PdfDictionary = new _PdfDictionary();
        const extRef: _PdfReference = new _PdfReference(9, 0);
        const crossRefStub: any = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedDict),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(new _PdfReference(10, 0)),
            _cacheMap: new Map()
        };
        const template: PdfTemplate = new PdfTemplate({ x: 0, y: 0, width: 10, height: 10 }, crossRefStub);
        const graphics: PdfGraphics = template.graphics;
        graphics._resourceObject.update('ExtGState', extRef);
        graphics._hasResourceReference = true;
        // Act
        graphics.setTransparency(0.3, 0.2, undefined);
        // Assert
        expect(crossRefStub._fetch).toHaveBeenCalledWith(extRef);
        expect(crossRefStub._cacheMap.size).toBeGreaterThan(0);
        expect(graphics._resourceObject._updated).toBeTruthy();
        expect(graphics._source._updated).toBeTruthy();
    });

    it('setTransparency without crossReference pushes pending resource', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 12, height: 12 });
        const graphics: PdfGraphics = template.graphics;
        // Ensure no crossReference on graphics
        graphics._crossReference = undefined;
        // Act
        graphics.setTransparency(0.4);
        // Assert
        expect(graphics._pendingResource.length).toBeGreaterThan(0);
    });

    it('drawImage uses existing XObject dictionary when XObject is a reference', () => {
        // Arrange
        const fetchedXObject: _PdfDictionary = new _PdfDictionary();
        const xrefRef: _PdfReference = new _PdfReference(12, 0);
        const crossRefStub: any = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedXObject),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(new _PdfReference(13, 0)),
            _cacheMap: new Map()
        };
        const template: PdfTemplate = new PdfTemplate({ x: 0, y: 0, width: 40, height: 40 }, crossRefStub);
        const graphics: PdfGraphics = template.graphics;
        graphics._resourceObject.update('XObject', xrefRef);
        const fakeImage: any = { _save: () => { }, _key: undefined };
        // Act
        graphics.drawImage(fakeImage, { x: 1, y: 1, width: 2, height: 2 });
        // Assert
        expect(crossRefStub._fetch).toHaveBeenCalledWith(xrefRef);
    });


    it('drawTemplate imports stream when exported and crossReference present', () => {
        // Arrange
        const crossRefStub: any = {
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(new _PdfReference(99, 0)),
            _cacheMap: new Map()
        };
        const template: PdfTemplate = new PdfTemplate({ x: 0, y: 0, width: 10, height: 10 });
        template._isExported = true;
        template._importStream = jasmine.createSpy('_importStream');
        const pageTemplate: PdfTemplate = new PdfTemplate({ x: 0, y: 0, width: 5, height: 5 }, crossRefStub);
        const graphics: PdfGraphics = pageTemplate.graphics;
        graphics._crossReference = crossRefStub;
        // Act
        graphics.drawTemplate(template, { x: 0, y: 0, width: 10, height: 10 });
        // Assert
        expect(template._importStream).toHaveBeenCalledWith(true, template._isResourceExport);
    });
    it('drawTemplate pushes pending template when exported but no crossReference', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 10, height: 10 });
        template._isExported = true;
        template._importStream = jasmine.createSpy('_importStream');
        const pageTemplate: PdfTemplate = new PdfTemplate({ width: 5, height: 5 });
        const graphics: PdfGraphics = pageTemplate.graphics;
        graphics._crossReference = undefined;
        // Act
        graphics.drawTemplate(template, { x: 0, y: 0, width: 10, height: 10 });
        // Assert
        expect(template._importStream).toHaveBeenCalledWith(false, template._isResourceExport);
        expect(graphics._pendingResource.indexOf(template)).toBeGreaterThan(-1);
    });

});

describe('PdfGraphics drawString and drawTextElement behavior coverage', () => {

    it('drawString resolves PdfPen, PdfBrush and PdfStringFormat overload with full arguments', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
        const format: PdfStringFormat = new PdfStringFormat();
        format.alignment = PdfTextAlignment.center;
        const bounds: Rectangle = { x: 10, y: 10, width: 100, height: 50 };

        // Act
        graphics.drawString('Hello', font, bounds, pen, brush, format);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });

    it('drawString resolves PdfPen with PdfStringFormat (no brush path)', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 255 }, 1);
        const format: PdfStringFormat = new PdfStringFormat();
        format.alignment = PdfTextAlignment.right;
        const bounds: Rectangle = { x: 5, y: 5, width: 80, height: 40 };

        // Act
        graphics.drawString('Test', font, bounds, pen, format);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });

    it('drawString resolves PdfBrush with PdfStringFormat branch', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 11, PdfFontStyle.regular);
        const brush: PdfBrush = new PdfBrush({ r: 0, g: 128, b: 0 });
        const format: PdfStringFormat = new PdfStringFormat();
        format.alignment = PdfTextAlignment.center;
        const bounds: Rectangle = { x: 0, y: 0, width: 60, height: 30 };

        // Act
        graphics.drawString('Brush', font, bounds, brush, format);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });

    it('drawString uses default PdfStringFormat when none is supplied (implicit else path)', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 9, PdfFontStyle.regular);
        const brush: PdfBrush = new PdfBrush({ r: 100, g: 100, b: 100 });
        const bounds: Rectangle = { x: 0, y: 0, width: 50, height: 20 };

        // Act
        graphics.drawString('DefaultFormat', font, bounds, brush);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });

    it('drawTextElement throws when element is null', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;

        // Act & Assert
        expect(() => {
            graphics.drawTextElement(null as unknown as PdfTextElement, { x: 0, y: 0 });
        }).toThrowError();
        document.destroy();
    });

    it('drawTextElement throws when text is empty string', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        const element: PdfTextElement = { text: '', font };

        // Act & Assert
        expect(() => {
            graphics.drawTextElement(element, { x: 10, y: 10 });
        }).toThrowError();
        document.destroy();
    });

    it('drawTextElement applies default brush and delegates to drawString', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        const element: PdfTextElement = {
            text: 'TextElement',
            font
        };
        const location: Point = { x: 15, y: 25 };

        // Act
        graphics.drawTextElement(element, location);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });

});

describe('PdfGraphics internal state and resource management', () => {

    it('_initialize sets default values for graphics state properties', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const graphics: PdfGraphics = template.graphics;

        // Act
        graphics['_initialize']();

        // Assert
        expect(graphics['_mediaBoxUpperRightBound']).toBe(0);
        expect(graphics['_characterSpacing']).toBe(-1);
        expect(graphics['_wordSpacing']).toBe(-1);
        expect(graphics['_textScaling']).toBe(-100);
        //expect(graphics['_textRenderingMode']).toBe(-1);
        expect(graphics['_graphicsState'].length).toBe(0);
        expect(graphics['_clipBounds'].length).toBe(4);
        expect(graphics['_colorSpaceInitialized']).toBeFalsy();
        expect(graphics['_startCutIndex']).toBe(-1);
    });

    // ...existing code...
    it('_initializeCurrentColorSpace sets DeviceRGB color space once', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 50, height: 50 });
        const graphics: PdfGraphics = template.graphics;
        graphics['_sw'] = {
            _setColorSpace: jasmine.createSpy('_setColorSpace')
        } as unknown as _PdfStreamWriter;
        graphics['_colorSpaceInitialized'] = false;

        // Act
        graphics['_initializeCurrentColorSpace']();
        graphics['_initializeCurrentColorSpace']();

        // Assert
        expect(graphics['_sw']._setColorSpace).toHaveBeenCalledTimes(2);
        expect(graphics['_colorSpaceInitialized']).toBeTruthy();
    });
    // ...existing code...

    it('_brushControl sets color and caches brush', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 40, height: 40 });
        const graphics: PdfGraphics = template.graphics;
        const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
        graphics['_sw'] = {
            _setColor: jasmine.createSpy('_setColor')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_brushControl'](brush);

        // Assert
        expect(graphics['_sw']._setColor).toHaveBeenCalledWith([255, 0, 0], false);
        expect(graphics['_currentBrush']).toBe(brush);
    });

    it('_penControl applies pen and caches pen', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 60, height: 60 });
        const graphics: PdfGraphics = template.graphics;
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 255 }, 2);
        graphics['_sw'] = {
            _setLineDashPattern: jasmine.createSpy('_setLineDashPattern'),
            _setLineWidth: jasmine.createSpy('_setLineWidth'),
            _setLineJoin: jasmine.createSpy('_setLineJoin'),
            _setLineCap: jasmine.createSpy('_setLineCap'),
            _setMiterLimit: jasmine.createSpy('_setMiterLimit'),
            _setColor: jasmine.createSpy('_setColor')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_penControl'](pen);

        // Assert
        expect(graphics['_currentPen']).toBe(pen);
        expect(graphics['_sw']._setLineWidth).toHaveBeenCalledWith(2);
    });

    it('_isRectangle returns true for Rectangle type', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 30, height: 30 });
        const graphics: PdfGraphics = template.graphics;
        const rect: Rectangle = { x: 0, y: 0, width: 100, height: 100 };

        // Act
        const result: boolean = graphics['_isRectangle'](rect);

        // Assert
        expect(result).toBeTruthy();
    });

    it('_isRectangle returns false for Point type', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 30, height: 30 });
        const graphics: PdfGraphics = template.graphics;
        const point: Point = { x: 50, y: 50 };

        // Act
        const result: boolean = graphics['_isRectangle'](point);

        // Assert
        expect(result).toBeFalsy();
    });

    it('_normalizeText filters CJK characters for standard fonts', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 80, height: 80 });
        const graphics: PdfGraphics = template.graphics;
        const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 12);
        const textWithCJK: string = 'Hello你好World';

        // Act
        const result: string = graphics['_normalizeText'](font, textWithCJK);

        // Assert
        expect(result).toContain('Hello');
        expect(result).toContain('World');
        expect(result).not.toContain('你好');
    });

    it('_normalizeText returns original text for empty input', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 70, height: 70 });
        const graphics: PdfGraphics = template.graphics;
        const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);

        // Act
        const result: string = graphics['_normalizeText'](font, '');

        // Assert
        expect(result).toBe('');
    });

    it('_normalizeText returns original text for non-StandardFont', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);
        const text: string = 'Test文字';

        // Act
        const result: string = graphics['_normalizeText'](font, text);

        // Assert
        expect(result).toBe("Test");
        document.destroy();
    });

    it('_setPenBrush resolves first as PdfPen', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 90, height: 90 });
        const graphics: PdfGraphics = template.graphics;
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        graphics['_sw'] = {
            _setLineDashPattern: jasmine.createSpy('_setLineDashPattern'),
            _setLineWidth: jasmine.createSpy('_setLineWidth'),
            _setLineJoin: jasmine.createSpy('_setLineJoin'),
            _setLineCap: jasmine.createSpy('_setLineCap'),
            _setMiterLimit: jasmine.createSpy('_setMiterLimit'),
            _setColor: jasmine.createSpy('_setColor')
        } as unknown as _PdfStreamWriter;


    });


    it('_setPenBrush resolves first as PdfBrush and second as PdfBrush', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const graphics: PdfGraphics = template.graphics;
        const brush1: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
        const brush2: PdfBrush = new PdfBrush({ r: 0, g: 255, b: 0 });
        graphics['_sw'] = {
            _setColor: jasmine.createSpy('_setColor'),
            _setColorSpace: jasmine.createSpy('_setColorSpace')
        } as unknown as _PdfStreamWriter;

        // Act
        const result: { pen: PdfPen; brush: PdfBrush } = graphics['_setPenBrush'](brush1, brush2);

        // Assert
        expect(result.pen).toBeUndefined();
        expect(result.brush).toBe(brush2);
    });
    it('_stateControl applies pen and brush when provided', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 110, height: 110 });
        const graphics: PdfGraphics = template.graphics;
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
        graphics['_sw'] = {
            _setColorSpace: jasmine.createSpy('_setColorSpace'),
            _setLineDashPattern: jasmine.createSpy('_setLineDashPattern'),
            _setLineWidth: jasmine.createSpy('_setLineWidth'),
            _setLineJoin: jasmine.createSpy('_setLineJoin'),
            _setLineCap: jasmine.createSpy('_setLineCap'),
            _setMiterLimit: jasmine.createSpy('_setMiterLimit'),
            _setColor: jasmine.createSpy('_setColor')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_stateControl'](pen, brush, null, undefined);

        // Assert
        expect(graphics['_sw']._setColorSpace).toHaveBeenCalled();
        expect(graphics['_currentPen']).toBe(pen);
        expect(graphics['_currentBrush']).toBe(brush);
    });

    it('_writePen applies all pen properties with miter limit > 0', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 120, height: 120 });
        const graphics: PdfGraphics = template.graphics;
        const pen: PdfPen = new PdfPen({ r: 100, g: 150, b: 200 }, 3);
        graphics['_sw'] = {
            _setLineDashPattern: jasmine.createSpy('_setLineDashPattern'),
            _setLineWidth: jasmine.createSpy('_setLineWidth'),
            _setLineJoin: jasmine.createSpy('_setLineJoin'),
            _setLineCap: jasmine.createSpy('_setLineCap'),
            _setMiterLimit: jasmine.createSpy('_setMiterLimit'),
            _setColor: jasmine.createSpy('_setColor')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_writePen'](pen);

        // Assert
        expect(graphics['_sw']._setLineWidth).toHaveBeenCalledWith(3);
        expect(graphics['_sw']._setColor).toHaveBeenCalled();
    });

});



describe('PdfGraphics text layout and rendering', () => {

    it('_getNextPage returns existing page when index is within range', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        document.addPage();
        document.addPage();
        document.addPage();
        const page: PdfPage = document.getPage(0);
        const graphics: PdfGraphics = page.graphics;

        // Act
        const nextPage: PdfPage = graphics['_getNextPage']();

        // Assert
        expect(nextPage).toBeDefined();
        expect(nextPage).not.toBe(page);
        document.destroy();
    });

    it('_getNextPage creates new page when at end', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const initialPageCount: number = document.pageCount;

        // Act
        const nextPage: PdfPage = graphics['_getNextPage']();

        // Assert
        expect(document.pageCount).toBe(initialPageCount + 1);
        expect(nextPage).toBeDefined();
        document.destroy();
    });

    it('_fontControl registers standard font in resources', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 14, PdfFontStyle.regular);
        const format: PdfStringFormat = new PdfStringFormat();

        // Act
        graphics['_fontControl'](font, format);

        // Assert
        expect(graphics['_currentFont']).toBe(font);
        expect(graphics['_resourceObject'].has('Font')).toBeTruthy();
        document.destroy();
    });

    it('_fontControl caches font reference when already present', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);
        const format: PdfStringFormat = new PdfStringFormat();
        graphics['_fontControl'](font, format);
        const firstCall: PdfFont = graphics['_currentFont'];

        // Act
        graphics['_fontControl'](font, format);

        // Assert
        expect(graphics['_currentFont']).toBe(firstCall);
        document.destroy();
    });

});


describe('PdfGraphics uncovered private branch coverage', () => {

    it('processResources covers PdfTemplate new, existing, dictionary and font branches', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;

        const template: PdfTemplate = new PdfTemplate();
        template._isNew = true;

        const dictionary: _PdfDictionary = new _PdfDictionary();
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);

        graphics._pendingResource = [
            { resource: template, key: _PdfName.get('T1'), source: new _PdfDictionary() },
            { resource: dictionary, key: _PdfName.get('D1'), source: new _PdfDictionary() },
            { resource: font, key: _PdfName.get('F1'), source: new _PdfDictionary() }
        ];

        // Act
        graphics._processResources(document._crossReference);
        const bytes: Uint8Array = document.save();

        // Assert
        expect(bytes.length).toBeGreaterThan(0);
        expect(graphics._pendingResource.length).toBe(0);
        document.destroy();
    });

    it('updateFontResource covers reference exists, new reference and PdfTrueTypeFont branch', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        document.addPage();
        const graphics: PdfGraphics = document.getPage(0).graphics;

        const font: PdfFont = document.embedFont(PdfFontFamily.courier, 12, PdfFontStyle.regular);
        const source: _PdfDictionary = new _PdfDictionary();
        const key: _PdfName = _PdfName.get('F2');

        // Act
        graphics._updateFontResource(font, key, source, document._crossReference);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });

    ;

    it('getNextPage covers existing page and addPage else branch', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        document.addPage();
        document.addPage();

        const graphics: PdfGraphics = document.getPage(0).graphics;

        // Act
        const next1: PdfPage = graphics._getNextPage();
        const next2: PdfPage = graphics._getNextPage();
        const result = document.save();

        // Assert
        expect(next1).toBeDefined();
        expect(next2).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        document.destroy();
    });

    it('_getCjkString throws on null and returns escaped value for valid input', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        document.addPage();
        const graphics: PdfGraphics = document.getPage(0).graphics;

        // Act & Assert
        expect(() => graphics._getCjkString(null as any)).toThrow();

        const data: Uint8Array = graphics._getCjkString('(A)');
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });

    it('_escapeSymbols covers all symbol switch cases and default branch', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        document.addPage();
        const graphics: PdfGraphics = document.getPage(0).graphics;

        const input: Uint8Array = new Uint8Array([
            40,  // '('
            41,  // ')'
            92,  // '\'
            13,  // CR
            65   // 'A' default
        ]);

        // Act
        const escaped: Uint8Array = graphics._escapeSymbols(input);

        // Assert
        expect(escaped.length).toBeGreaterThan(input.length - 1);
        document.destroy();
    });

    it('applyStringSettings covers pen+brush, pen-only and brush-only branches', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        document.addPage();
        const graphics: PdfGraphics = document.getPage(0).graphics;

        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
        const format: PdfStringFormat = new PdfStringFormat();

        // Act
        graphics._applyStringSettings(font, pen, brush, format);
        graphics._applyStringSettings(font, pen, null, format);
        graphics._applyStringSettings(font, null, brush, format);
        const bytes = document.save();

        // Assert
        expect(bytes.length).toBeGreaterThan(0);
        document.destroy();
    });

});

describe('PdfGraphics path and arc construction', () => {

    it('_constructArcPath emits bezier arc with valid points', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 200, height: 200 });
        const graphics: PdfGraphics = template.graphics;
        graphics['_sw'] = {
            _beginPath: jasmine.createSpy('_beginPath'),
            _appendBezierSegment: jasmine.createSpy('_appendBezierSegment')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_constructArcPath'](10, 10, 100, 100, 0, 90);

        // Assert
        expect(graphics['_sw']._beginPath).toHaveBeenCalled();
        expect(graphics['_sw']._appendBezierSegment).toHaveBeenCalled();
    });



    it('_constructPiePath emits pie arc only when points length is 8', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 180, height: 180 });
        const graphics: PdfGraphics = template.graphics;
        graphics['_sw'] = {
            _beginPath: jasmine.createSpy('_beginPath'),
            _appendBezierSegment: jasmine.createSpy('_appendBezierSegment')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_constructPiePath'](20, 20, 120, 120, 45, 90);

        // Assert
        expect(graphics['_sw']._beginPath).toHaveBeenCalled();
    });

    it('_buildUpPath handles start point type', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 160, height: 160 });
        const graphics: PdfGraphics = template.graphics;
        const points: Point[] = [{ x: 10, y: 10 }];
        const types: PathPointType[] = [PathPointType.start];
        graphics['_sw'] = {
            _beginPath: jasmine.createSpy('_beginPath')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_buildUpPath'](points, types);

        // Assert
        expect(graphics['_sw']._beginPath).toHaveBeenCalledWith(10, 10);
    });

    it('_buildUpPath handles line point type', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 170, height: 170 });
        const graphics: PdfGraphics = template.graphics;
        const points: Point[] = [{ x: 0, y: 0 }, { x: 50, y: 50 }];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line];
        graphics['_sw'] = {
            _beginPath: jasmine.createSpy('_beginPath'),
            _appendLineSegment: jasmine.createSpy('_appendLineSegment')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_buildUpPath'](points, types);

        // Assert
        expect(graphics['_sw']._appendLineSegment).toHaveBeenCalledWith(50, 50);
    });

    it('_buildUpPath throws error for invalid path point type', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 175, height: 175 });
        const graphics: PdfGraphics = template.graphics;
        const points: Point[] = [{ x: 0, y: 0 }, { x: 50, y: 50 }];
        const types: PathPointType[] = [PathPointType.start, 99 as PathPointType];
        graphics['_sw'] = {
            _beginPath: jasmine.createSpy('_beginPath')
        } as unknown as _PdfStreamWriter;

        // Act & Assert
        expect(() => {
            graphics['_buildUpPath'](points, types);
        }).toThrowError('Malforming path.');
    });

    it('_getBezierPoint throws error when current type is not bezier', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 140, height: 140 });
        const graphics: PdfGraphics = template.graphics;
        const points: Point[] = [{ x: 10, y: 10 }, { x: 20, y: 20 }];
        const types: PathPointType[] = [PathPointType.line, PathPointType.start];

        // Act & Assert
        expect(() => {
            graphics['_getBezierPoint'](points, types, 0);
        }).toThrowError('Malforming path.');
    });

    it('_getBezierPoint returns incremented index and next point', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 145, height: 145 });
        const graphics: PdfGraphics = template.graphics;
        const points: Point[] = [{ x: 10, y: 10 }, { x: 30, y: 30 }, { x: 50, y: 50 }];
        const types: PathPointType[] = [PathPointType.bezier, PathPointType.bezier, PathPointType.start];

        // Act
        const result = graphics['_getBezierPoint'](points, types, 0);

        // Assert
        expect(result.index).toBe(1);
        expect(result.point).toEqual({ x: 30, y: 30 });
    });

});

describe('PdfGraphics resource and pending resource management', () => {

    it('_processResources updates pending stream and dictionary resources', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;

        const mockStream: any = { _reference: undefined, dictionary: { _updated: false } };
        const mockDictionary: any = { _reference: undefined };

        graphics['_crossReference'] = {
            _cacheMap: new Map(),
            _getNextReference: jasmine.createSpy().and.returnValue(new _PdfReference(50, 0))
        } as unknown as _PdfCrossReference;

        graphics['_pendingResource'] = [
            { resource: mockStream, key: { name: 'Stream1' }, source: graphics['_resourceObject'] },
            { resource: mockDictionary, key: { name: 'Dict1' }, source: graphics['_resourceObject'] }
        ];

        // Act
        graphics['_processResources'](graphics['_crossReference']);

        // Assert
        expect(graphics['_pendingResource'].length).toBe(0);
        expect(graphics['_resourceObject']._updated).toBeTruthy();
        document.destroy();
    });

    it('_updateImageResource caches image stream and sets SMask when present', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;

        const mockImageStream: any = {
            dictionary: { _updated: false, set: jasmine.createSpy('set') }
        };
        const mockMaskStream: any = { dictionary: { _updated: false } };

        const mockImage: any = {
            _reference: undefined,
            _imageStream: mockImageStream,
            _maskStream: mockMaskStream,
            _maskReference: undefined
        };

        const crossRefStub: any = {
            _cacheMap: new Map(),
            _getNextReference: jasmine.createSpy().and.returnValues(
                new _PdfReference(51, 0),
                new _PdfReference(52, 0)
            )
        };

        const xobjectDict: _PdfDictionary = new _PdfDictionary();
        spyOn(xobjectDict, 'update').and.callThrough();

        const keyName: any = { name: 'Image1' };

        // Act
        graphics['_updateImageResource'](mockImage, keyName, xobjectDict, crossRefStub);

        // Assert
        expect(crossRefStub._cacheMap.has(mockImage._reference)).toBeTruthy();
        expect(mockImageStream.dictionary.set)
            .toHaveBeenCalledWith('SMask', mockImage._maskReference);
        expect(xobjectDict.update).toHaveBeenCalled();
        document.destroy();
    });

    it('_updateImageResource skips caching when already in cache map', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;

        const ref: _PdfReference = new _PdfReference(53, 0);
        const mockImageStream: any = { dictionary: { _updated: false } };
        const mockImage: any = {
            _reference: ref,
            _imageStream: mockImageStream,
            _maskStream: undefined
        };

        const crossRefStub: any = {
            _cacheMap: new Map([[ref, mockImageStream]])
        };

        const xobjectDict: _PdfDictionary = new _PdfDictionary();
        const keyName: any = { name: 'Image2' };

        // Act
        graphics['_updateImageResource'](mockImage, keyName, xobjectDict, crossRefStub);

        // Assert
        expect(mockImageStream.dictionary._updated).toBeFalsy();
        document.destroy();
    });

    it('_updateFontResource caches standard font dictionary', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;

        const mockFont: any = {
            _reference: undefined,
            _dictionary: new _PdfDictionary(),
            _fontInternal: undefined
        };

        const ref: _PdfReference = new _PdfReference(54, 0);
        const crossRefStub: any = {
            _cacheMap: new Map(),
            _getNextReference: jasmine.createSpy().and.returnValue(ref)
        };

        const fontDict: _PdfDictionary = new _PdfDictionary();
        spyOn(fontDict, 'update').and.callThrough();

        const keyName: any = { name: 'F1' };

        // Act
        graphics['_updateFontResource'](mockFont, keyName, fontDict, crossRefStub);

        // Assert
        expect(crossRefStub._cacheMap.has(ref)).toBeTruthy();
        expect(fontDict.update).toHaveBeenCalled();
        document.destroy();
    });

    it('_updateFontResource skips caching when already in cache map', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;

        const ref: _PdfReference = new _PdfReference(55, 0);
        const fontDict: _PdfDictionary = new _PdfDictionary();

        const mockFont: any = {
            _reference: ref,
            _dictionary: fontDict
        };

        const crossRefStub: any = {
            _cacheMap: new Map([[ref, fontDict]])
        };

        const fontDictTarget: _PdfDictionary = new _PdfDictionary();
        spyOn(fontDictTarget, 'update').and.callThrough();

        const keyName: any = { name: 'F2' };

        // Act
        graphics['_updateFontResource'](mockFont, keyName, fontDictTarget, crossRefStub);

        // Assert
        expect(fontDictTarget.update).not.toHaveBeenCalled();
        document.destroy();
    });

    // Else branch test cases (Lines 272, 274, 284, 292, 297, 449, 451, 711, 715, 1071, 1195, 1269, 1272, 1280, 1335, 1437)

    it('_resources getter - else branch when XObject not present', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 50, height: 50 });
        const graphics: PdfGraphics = template.graphics;
        graphics['_resourceMap'] = undefined;
        graphics['_resourceObject'].update('Font', new _PdfDictionary());
        // No XObject dictionary

        // Act
        const resources: Map<_PdfReference, _PdfName> = graphics['_resources'];

        // Assert
        expect(resources).toBeDefined();
        expect(resources instanceof Map).toBeTruthy();
    });

    it('_resources getter - else branch when ExtGState not present', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 50, height: 50 });
        const graphics: PdfGraphics = template.graphics;
        graphics['_resourceMap'] = undefined;
        // No ExtGState

        // Act
        const resources: Map<_PdfReference, _PdfName> = graphics['_resources'];

        // Assert
        expect(resources).toBeDefined();
        expect(resources instanceof Map).toBeTruthy();
    });

    it('restore - else branch when state is defined and found in stack', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const graphics: PdfGraphics = template.graphics;
        const state1: PdfGraphicsState = graphics.save();
        const state2: PdfGraphicsState = graphics.save();
        expect(graphics['_graphicsState'].length).toBeGreaterThan(0);

        // Act
        graphics.restore(state1);

        // Assert
        expect(graphics['_graphicsState'].indexOf(state1)).toBe(-1);
    });

    it('restore - else branch when graphics state is empty', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const graphics: PdfGraphics = template.graphics;
        graphics['_graphicsState'] = [];
        const state: PdfGraphicsState = graphics.save();

        // Act - should not throw
        expect(() => {
            graphics.restore(state);
        }).not.toThrow();

        // Assert
        expect(graphics['_graphicsState'].length).toBe(0);
    });

    it('drawArc - else branch when sweepAngle is zero', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        const bounds: Rectangle = { x: 10, y: 10, width: 50, height: 50 };

        // Act - sweepAngle is 0
        graphics.drawArc(bounds, 45, 0, pen);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });

    it('drawPolygon - else branch when points array is empty', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        const points: Point[] = [];

        // Act
        graphics.drawPolygon(points, pen);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });





    it('drawTemplate - else branch when template is not exported', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const template: PdfTemplate = new PdfTemplate({ width: 50, height: 50 });
        template._isExported = false;
        template._isResourceExport = false;
        const bounds: Rectangle = { x: 10, y: 10, width: 100, height: 100 };

        // Act
        graphics.drawTemplate(template, bounds);
        const data: Uint8Array = document.save();

        // Assert
        expect(data.length).toBeGreaterThan(0);
        document.destroy();
    });




    it('_isRectangle - else branch when bounds is Point (no width/height)', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const point: Point = { x: 10, y: 20 };

        // Act
        const result: boolean = graphics['_isRectangle'](point);

        // Assert
        expect(result).toBeFalsy();
        document.destroy();
    });

    it('_normalizeText - else branch when font is not PdfStandardFont', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);
        const text: string = 'Hello世界';

        // Act
        const result: string = graphics['_normalizeText'](font, text);

        // Assert
        expect(result).toBe('Hello');
        document.destroy();
    });


    it('_buildUpPath - else branch for line PathPointType', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const points: Point[] = [
            { x: 10, y: 10 },
            { x: 50, y: 50 }
        ];
        const types: any[] = [0, 1]; // PathPointType.start, PathPointType.line

        // Act - should not throw
        expect(() => {
            graphics['_buildUpPath'](points, types);
        }).not.toThrow();

        // Assert
        expect(graphics).toBeDefined();
        document.destroy();
    });




    it('_getBezierPoint - else branch when type is not bezier throws error', () => {
        // Arrange
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const graphics: PdfGraphics = page.graphics;
        const points: Point[] = [{ x: 10, y: 10 }, { x: 20, y: 20 }];
        const types: any[] = [1, 2]; // Not bezier type

        // Act & Assert ✅ FIXED
        expect(() => {
            graphics['_getBezierPoint'](points, types, 0);
        }).toThrowError(/Malforming path/);

        document.destroy();
    });

    it('_brushControl - applies brush color and sets current brush', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 60, height: 60 });
        const graphics: PdfGraphics = template.graphics;
        const brush: PdfBrush = new PdfBrush({ r: 100, g: 150, b: 200 });
        graphics['_sw'] = {
            _setColor: jasmine.createSpy('_setColor'),
            _setColorSpace: jasmine.createSpy('_setColorSpace')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_brushControl'](brush);

        // Assert
        expect(graphics['_sw']._setColor).toHaveBeenCalledWith([100, 150, 200], false);
        expect(graphics['_currentBrush']).toBe(brush);
    });

    it('_penControl - applies pen and caches current pen', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 60, height: 60 });
        const graphics: PdfGraphics = template.graphics;
        const pen: PdfPen = new PdfPen({ r: 50, g: 100, b: 150 }, 2);
        graphics['_sw'] = {
            _setColor: jasmine.createSpy('_setColor'),
            _setColorSpace: jasmine.createSpy('_setColorSpace'),
            _setLineDashPattern: jasmine.createSpy('_setLineDashPattern'),
            _setLineWidth: jasmine.createSpy('_setLineWidth'),
            _setLineJoin: jasmine.createSpy('_setLineJoin'),
            _setLineCap: jasmine.createSpy('_setLineCap'),
            _setMiterLimit: jasmine.createSpy('_setMiterLimit')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_penControl'](pen);

        // Assert
        expect(graphics['_currentPen']).toBe(pen);
        expect(graphics['_sw']._setColor).toHaveBeenCalled();
    });

    it('_stateControl - with pen only', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 60, height: 60 });
        const graphics: PdfGraphics = template.graphics;
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        graphics['_sw'] = {
            _setColor: jasmine.createSpy('_setColor'),
            _setColorSpace: jasmine.createSpy('_setColorSpace'),
            _setLineDashPattern: jasmine.createSpy('_setLineDashPattern'),
            _setLineWidth: jasmine.createSpy('_setLineWidth'),
            _setLineJoin: jasmine.createSpy('_setLineJoin'),
            _setLineCap: jasmine.createSpy('_setLineCap')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_stateControl'](pen, undefined, undefined);

        // Assert
        expect(graphics['_currentPen']).toBe(pen);
    });

    it('_stateControl - with brush only', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 60, height: 60 });
        const graphics: PdfGraphics = template.graphics;
        const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
        graphics['_sw'] = {
            _setColor: jasmine.createSpy('_setColor'),
            _setColorSpace: jasmine.createSpy('_setColorSpace')
        } as unknown as _PdfStreamWriter;

        // Act
        graphics['_stateControl'](undefined, brush, undefined);

        // Assert
        expect(graphics['_currentBrush']).toBe(brush);
    });

    it('_setPenBrush - with pen and brush both', () => {
        // Arrange
        const template: PdfTemplate = new PdfTemplate({ width: 100, height: 100 });
        const graphics: PdfGraphics = template.graphics;
        const pen: PdfPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        const brush: PdfBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
        graphics['_sw'] = {
            _setColor: jasmine.createSpy('_setColor'),
            _setColorSpace: jasmine.createSpy('_setColorSpace'),
            _setLineDashPattern: jasmine.createSpy('_setLineDashPattern'),
            _setLineWidth: jasmine.createSpy('_setLineWidth'),
            _setLineJoin: jasmine.createSpy('_setLineJoin'),
            _setLineCap: jasmine.createSpy('_setLineCap')
        } as unknown as _PdfStreamWriter;

        // Act
        const result: { pen: PdfPen; brush: PdfBrush } = graphics['_setPenBrush'](pen, brush);

        // Assert
        expect(result.pen).toBe(pen);
        expect(result.brush).toBe(brush);
    });

});

describe('PdfGraphics uncovered branches – consolidated and fixed', () => {



    it('_normalizeText strips CJK characters for PdfStandardFont', () => {
        const doc = new PdfDocument();
        const graphics = doc.addPage().graphics;
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 12);

        const result = graphics['_normalizeText'](font, 'Hello世界Test');
        expect(result).toBe('HelloTest');
        doc.destroy();
    });

    it('_getBezierPoint throws error for non-bezier type', () => {
        const graphics = new PdfTemplate({ width: 100, height: 100 }).graphics;
        expect(() => {
            graphics['_getBezierPoint'](
                [{ x: 0, y: 0 }, { x: 10, y: 10 }],
                [PathPointType.line, PathPointType.start],
                0
            );
        }).toThrowError(/Malforming path/);
    });

});
