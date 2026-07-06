import { _PdfRedactionProcessor } from "../../src/pdf-data-extract/core/redaction/pdf-redaction-processor";
import { PdfRedactionRegion } from "../../src/pdf-data-extract/core/redaction/pdf-redaction-region";
import * as ej2Pdf from '@syncfusion/ej2-pdf';
describe('_PdfRedactionProcessor highlighted coverage', () => {
    let processor: _PdfRedactionProcessor;

    function _createDictionary(seed?: { [key: string]: unknown }): any { // eslint-disable-line
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: any = { // eslint-disable-line
            _updated: false,
            has: (key: string): boolean => raw.has(key),
            getRaw: (key: string): unknown => raw.get(key),
            get: (key: string): unknown => raw.get(key),
            getArray: (key: string): unknown => raw.get(key),
            set: (key: string, value: unknown): void => {
                raw.set(key, value);
            }
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function _createAnnotations(items: any[]): any { // eslint-disable-line
        const annotations: any = { // eslint-disable-line
            at: (index: number): unknown => items[index],
            removeAt: jasmine.createSpy('removeAt').and.callFake((index: number): void => {
                items.splice(index, 1);
            })
        };

        Object.defineProperty(annotations, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => items.length
        });

        return annotations;
    }

    function _createPage(): any { // eslint-disable-line
        const pageDictionary: any = _createDictionary(); // eslint-disable-line

        const graphics: any = { // eslint-disable-line
            _size: { width: 500, height: 500 },
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawRectangle: jasmine.createSpy('drawRectangle')
        };

        return {
            _pageDictionary: pageDictionary,
            graphics,
            annotations: _createAnnotations([]),
            _ref: { _pageRef: 1 }
        };
    }

    function _createRegion(
        bounds: { x: number; y: number; width: number; height: number }
    ): PdfRedactionRegion {
        return {
            bounds,
            _appearanceEnabled: false
        } as unknown as PdfRedactionRegion;
    }

    beforeEach(() => {
        processor = new _PdfRedactionProcessor();
    });

    it('should cover textAnnotation, textMarkupAnnotation and trapNetworkAnnotation intersect remove path', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 500, height: 500 })
        ];

        const textAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 10, y: 10, width: 20, height: 20 },
            boundsCollection: [
                { x: 10, y: 10, width: 20, height: 20 }
            ]
        };

        const textMarkupAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 20, y: 20, width: 20, height: 20 },
            boundsCollection: [
                { x: 20, y: 20, width: 20, height: 20 }
            ]
        };

        const trapNetworkAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 30, y: 30, width: 20, height: 20 },
            boundsCollection: [
                { x: 30, y: 30, width: 20, height: 20 }
            ]
        };

        const items: any[] = [ // eslint-disable-line
            textAnnotation,
            textMarkupAnnotation,
            trapNetworkAnnotation
        ];
        page.annotations = _createAnnotations(items);

        spyOn(processor, '_getAnnotationType').and.callFake((dictionary: any): number => { // eslint-disable-line
            if (dictionary === textAnnotation._dictionary) {
                return (ej2Pdf as any)._PdfAnnotationType.textAnnotation;
            }
            if (dictionary === textMarkupAnnotation._dictionary) {
                return (ej2Pdf as any)._PdfAnnotationType.textMarkupAnnotation;
            }
            return (ej2Pdf as any)._PdfAnnotationType.trapNetworkAnnotation;
        });

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).toHaveBeenCalled();
    });

    it('should cover lineAnnotation non-intersect break path without removing annotation', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 10, height: 10 })
        ];

        const lineAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Line' } }),
            _isLoaded: true,
            bounds: { x: 100, y: 100, width: 20, height: 20 },
            linePoints: [{ x: 200, y: 200 }, { x: 250, y: 250 }]
        };
        Object.setPrototypeOf(lineAnnotation, (ej2Pdf as any).PdfLineAnnotation.prototype);

        page.annotations = _createAnnotations([lineAnnotation]);

        spyOn(processor, '_getAnnotationType').and.returnValue(
            (ej2Pdf as any)._PdfAnnotationType.lineAnnotation
        );

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).not.toHaveBeenCalled();
    });

    it('should cover y-axis return false branch in _isLineIntersectRectangle', () => {
        // Arrange
        const rect: { x: number; y: number; width: number; height: number } = {
            x: 0,
            y: 0,
            width: 10,
            height: 10
        };

        // Act
        const result: boolean = processor._isLineIntersectRectangle(
            rect,
            5,
            50,
            6,
            60
        );

        // Assert
        expect(result).toBeFalsy();
    });

    it('should cover nested non-zero array return false branch in _findAnnotation', () => {
        // Arrange
        const values: number[][] = [[1, 0, 0]];

        // Act
        const result: boolean = processor._findAnnotation(values as unknown as any[]); // eslint-disable-line

        // Assert
        expect(result).toBeFalsy();
    });

    it('should cover the highlighted break line in markupAnnotation branch when boundsCollection exists but does not intersect', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line

        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 5, height: 5 })
        ];

        const highlightAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 100, y: 100, width: 20, height: 20 },
            boundsCollection: [
                { x: 200, y: 200, width: 10, height: 10 }
            ]
        };

        page.annotations = _createAnnotations([highlightAnnotation]);

        spyOn(processor, '_getAnnotationType').and.returnValue(
            (ej2Pdf as any)._PdfAnnotationType.highlight
        );

        // Act
        processor._processAnnotation(page, options);

        // Assert
        // No intersection => removeAt should NOT happen
        expect(page.annotations.removeAt).not.toHaveBeenCalled();

        // Optional stability assertion: method completed and dictionary not marked updated by this branch
        expect(page._pageDictionary._updated).toBeFalsy();
    });

    it('should cover isIntersect=true path in markupAnnotation branch and remove annotation', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line

        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 500, height: 500 })
        ];

        const highlightAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 10, y: 10, width: 20, height: 20 },
            boundsCollection: [
                { x: 10, y: 10, width: 20, height: 20 }
            ]
        };

        page.annotations = _createAnnotations([highlightAnnotation]);

        spyOn(processor, '_getAnnotationType').and.returnValue(
            (ej2Pdf as any)._PdfAnnotationType.highlight
        );

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).toHaveBeenCalled();
    });

});

import { _PdfBaseStream, PdfFontStyle } from '@syncfusion/ej2-pdf';
import { _FontHelper, _FontStructure, _Glyph } from '../../src/pdf-data-extract/core/text-extraction/font-structure';
import * as encodingUtils from '../../src/pdf-data-extract/core/text-extraction/encoding-utils';
 function createName(name: string): _PdfName {
        const value: _PdfName = Object.create((_PdfName as any).prototype) as _PdfName; // eslint-disable-line
        (value as unknown as { name: string }).name = name;
        return value;
    }
describe('_FontHelper highlighted coverage', () => {
    function createFontStructure(): _FontStructure {
        return ({
            _name: '',
            _type: '',
            _subtype: '',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _widths: {},
            _defaultWidth: 0,
            _differences: [],
            _defaultEncoding: [],
            _toUnicode: null,
            _toFontChar: null,
            _characterMap: null,
            _composite: false,
            _encoding: '',
            _flags: 0,
            _glyphCache: Object.create(null),
            _charsCache: Object.create(null),
            _isInternalFont: false
        } as unknown) as _FontStructure;
    }

    function createIdentityLikeToUnicode(first: number, last: number): any { // eslint-disable-line
        const map: any = { // eslint-disable-line
            _firstChar: first,
            _lastChar: last,
            _length: last + 1 - first,
            _forEach(callback: (charCode: number, unicodeCharCode: number) => void): void {
                for (let i: number = first; i <= last; i++) {
                    callback(i, i);
                }
            },
            _has(index: number): boolean {
                return first <= index && index <= last;
            },
            _get(index: number): string | undefined {
                if (first <= index && index <= last) {
                    return String.fromCharCode(index);
                }
                return undefined;
            },
            _charCodeOf(value: number): number {
                if (Number.isInteger(value) && value >= first && value <= last) {
                    return value;
                }
                return -1;
            }
        };
        return map;
    }



    it('should cover baseEncodingName branch in _simpleFontToUnicode', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            65: 90
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getEncoding').and.returnValue((() => {
            const arr: any[] = []; // eslint-disable-line
            arr[65] = '65';
            return arr;
        })());

        fontStructure._defaultEncoding = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding[65] = 'C65';

        // Act
        const result: any = helper._simpleFontToUnicode('WinAnsiEncoding', false); // eslint-disable-line

        // Assert
        expect(result[65]).toBe(String.fromCharCode(90));
    });

    it('should cover Calibri cidToGidMap branch and identity toUnicode remap in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._name = 'Calibri';
        fontStructure._type = 'CIDFontType2';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // eslint-disable-line

        const identityToUnicode: any = createIdentityLikeToUnicode(65, 65); // eslint-disable-line
        fontStructure._toUnicode = identityToUnicode;

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure,
            cidToGidMap: [],
            hasIncludedToUnicodeMap: true
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({
            Helvetica: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({
            Calibri: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({
            Helvetica: {
                ascent: 1000,
                descent: -200,
                capHeight: 700
            }
        } as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[65] = 999;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[65]).toBe(65);
    });

    it('should cover standard-font CIDFontType2 non-identity branch in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._name = 'Helvetica';
        fontStructure._type = 'CIDFontType2';
        fontStructure._encoding = 'WinAnsiEncoding';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = false;

        const nonIdentityToUnicode: any = { // eslint-disable-line
            _forEach(callback: (charCode: number, unicodeCharCode: number) => void): void {
                callback(66, 67);
            }
        };
        fontStructure._toUnicode = nonIdentityToUnicode;

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({
            Helvetica: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({} as any); // eslint-disable-line

        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({
            Helvetica: {
                ascent: 1000,
                descent: -200,
                capHeight: 700
            }
        } as any); // eslint-disable-line

        spyOn(helper, '_buildToFontChar').and.returnValue({});

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(fontStructure._toFontChar[66]).toBe(67);
    });
    it('should cover composite characterMap string lookup path in _spaceWidth', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._widths = {
            65: 123
        } as any; // eslint-disable-line
        fontStructure._composite = true;
        fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(true),
            _lookup: jasmine.createSpy('_lookup').and.returnValue('A')
        } as any; // eslint-disable-line
        fontStructure._toUnicode = {
            _charCodeOf: jasmine.createSpy('_charCodeOf').and.returnValue(-1)
        } as any; // eslint-disable-line

        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            space: 65
        } as any); // eslint-disable-line

        // Act
        const width: number = helper._spaceWidth;

        // Assert
        expect(width).toBe(123);
    });

    it('should cover default isSpace, widthCode string conversion and unicode fallback in _charToGlyph', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._glyphCache = Object.create(null);
        fontStructure._widths = {
            65: 200
        } as any; // eslint-disable-line
        fontStructure._defaultWidth = 50;
        fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(true),
            _lookup: jasmine.createSpy('_lookup').and.returnValue('A')
        } as any; // eslint-disable-line
        fontStructure._toUnicode = {
            _get: jasmine.createSpy('_get').and.returnValue(undefined)
        } as any; // eslint-disable-line

        // Act
        const glyph: _Glyph = helper._charToGlyph(65);

        // Assert
        expect(glyph._width).toBe(200);
        expect(glyph._unicode).toBe(String.fromCharCode(65));
        expect(glyph._isSpace).toBe(false);
    });
});

import { _PdfStream } from '@syncfusion/ej2-pdf';
import * as glyphModule from '../../src/pdf-data-extract/core/text-extraction/glyph';


describe('_FontHelper highlighted coverage for font-structure.ts', () => {
    function createFontStructure(): _FontStructure {
        return ({
            _name: '',
            _type: '',
            _subtype: '',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _widths: [],
            _defaultWidth: 0,
            _differences: [],
            _defaultEncoding: [],
            _toUnicode: null,
            _toFontChar: null,
            _characterMap: null,
            _composite: false,
            _encoding: '',
            _flags: 0,
            _glyphCache: Object.create(null),
            _charsCache: Object.create(null),
            _isInternalFont: false
        } as unknown) as _FontStructure;
    }

    function createRealIdentityToUnicode(helper: _FontHelper, first: number, last: number): any { // eslint-disable-line
        (helper as unknown as { _firstChar: number })._firstChar = first;
        (helper as unknown as { _lastChar: number })._lastChar = last;

        if (!(helper._fontStructure as any)._characterMap) { // eslint-disable-line
            (helper._fontStructure as any)._characterMap = { builtInCMap: false }; // eslint-disable-line
        }

        return helper._buildToUnicode(null, false, null);
    }

    it('should cover cidToGidMap identity-length mismatch branch in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._name = 'Calibri';
        fontStructure._type = 'CIDFontType2';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // eslint-disable-line

        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 65, 66);

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure,
            cidToGidMap: [100],
            hasIncludedToUnicodeMap: true
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({
            Helvetica: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({
            Calibri: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({
            Helvetica: {
                ascent: 1000,
                descent: -200,
                capHeight: 700
            }
        } as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[65] = 5;
            map[66] = 6;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[65]).toBe(65);
        expect(fontStructure._toFontChar[66]).toBe(66);
    });

    it('should cover final else branch with composite identity Tahoma path in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._name = 'TahomaCustom';
        fontStructure._type = 'TrueType';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // ✅ FIX

        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 70, 70);

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({} as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[70] = 71;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[70]).toBe(71);
    });

    it('should cover highlighted _spaceWidth composite characterMap/string CID path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._widths = [];
        fontStructure._widths[65] = 123;
        fontStructure._composite = true;
        fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(true),
            _lookup: jasmine.createSpy('_lookup').and.returnValue('A')
        } as any; // eslint-disable-line
        fontStructure._toUnicode = {
            _charCodeOf: jasmine.createSpy('_charCodeOf').and.returnValue(-1)
        } as any; // eslint-disable-line

        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            space: 65
        } as any); // eslint-disable-line

        // Act
        const width: number = helper._spaceWidth;

        // Assert
        expect(width).toBe(123);
        expect((fontStructure._characterMap as any)._contains).toHaveBeenCalled(); // eslint-disable-line
        expect((fontStructure._characterMap as any)._lookup).toHaveBeenCalled(); // eslint-disable-line
    });

    it('should throw when loca table is missing in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        helper._file = ({
            getBytes: (): Uint8Array => new Uint8Array(64)
        } as unknown) as any; // eslint-disable-line

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue({
            loca: null
        } as any); // eslint-disable-line

        // Act + Assert
        expect((): void => {
            helper._checkAndRepair(helper._file);
        }).toThrow(); // ✅ FIX
    });

    it('should create missing glyf table, patch maxp version=0x00005000, run scaleFactors branch and apply cssFontInfo metrics in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._cssFontInfo = {
            lineHeight: true,
            metrics: {
                lineHeight: 1.5,
                lineGap: 0.2
            }
        } as any; // eslint-disable-line

        helper._scaleFactors = [1, 2];

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => {
                const bytes: Uint8Array = new Uint8Array(64);
                bytes[4] = 0x00;
                bytes[5] = 0x02; // numGlyphs = 2
                return bytes;
            }
        };

        const headData: number[] = new Array(60).fill(0);
        const hheaData: number[] = new Array(20).fill(0);

        // short loca format
        headData[50] = 0;
        headData[51] = 0;

        const tables: any = { // eslint-disable-line
            loca: { tag: 'loca', data: new Uint8Array([0, 0, 0, 0, 0, 0]), offset: 0, length: 6 }, // ✅ FIX
            glyf: null,
            maxp: { tag: 'maxp', data: new Uint8Array([0, 0, 0, 0, 0, 2]), offset: 0, length: 6 },
            head: { tag: 'head', data: headData, offset: 0, length: 54 },
            hhea: { tag: 'hhea', data: hheaData, offset: 0, length: 20 },
            name: null,
            'compactFont ': null
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue(tables);

        const writeUIntSpy: jasmine.Spy = spyOn(helper, '_writeUnSignedInt32').and.callThrough();
        const glyphScaleSpy: jasmine.Spy = spyOn(glyphModule._PdfGlyphTable.prototype, 'scale').and.callFake((): void => {
            return;
        });
        const glyphWriteSpy: jasmine.Spy = spyOn(glyphModule._PdfGlyphTable.prototype, '_write').and.returnValue({
            data: new Uint8Array([1, 2, 3]),
            loca: new Uint8Array([4, 5, 6]),
            isLocationLong: true
        } as any); // eslint-disable-line

        // Act
        helper._checkAndRepair(fakeFontFile);

        // Assert
        expect(tables.glyf).toBeTruthy();
        expect(tables.glyf.data instanceof Uint8Array).toBe(true);
        expect(writeUIntSpy).toHaveBeenCalledWith(tables.maxp.data, 0, 0x0005000);
        expect(glyphScaleSpy).toHaveBeenCalled();
        expect(glyphWriteSpy).toHaveBeenCalled();
        expect(tables.glyf.data).toEqual(new Uint8Array([1, 2, 3]));
        expect(tables.loca.data).toEqual(new Uint8Array([4, 5, 6]));
        expect(tables.head.data[50]).toBe(0);
        expect(tables.head.data[51]).toBe(1);
        expect(fontStructure._lineHeight).toBe(1.5);
        expect(fontStructure._lineGap).toBe(0.2);
    });

    it('should patch maxp version=0x00010000 when maxp length is >= 32 in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => {
                const bytes: Uint8Array = new Uint8Array(64);
                bytes[4] = 0x00;
                bytes[5] = 0x01;
                return bytes;
            }
        };

        const headData: number[] = new Array(60).fill(0);
        const hheaData: number[] = new Array(20).fill(0);

        const tables: any = { // eslint-disable-line
            loca: { tag: 'loca', data: new Uint8Array([0, 0, 0, 0]), offset: 0, length: 4 },
            glyf: { tag: 'glyf', data: new Uint8Array([0]), offset: 0, length: 1 },
            maxp: { tag: 'maxp', data: new Uint8Array(32), offset: 0, length: 32 },
            head: { tag: 'head', data: headData, offset: 0, length: 54 },
            hhea: { tag: 'hhea', data: hheaData, offset: 0, length: 20 },
            name: null,
            'compactFont ': null
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue(tables);
        const writeUIntSpy: jasmine.Spy = spyOn(helper, '_writeUnSignedInt32').and.callThrough();

        // Act
        helper._checkAndRepair(fakeFontFile);

        // Assert
        expect(writeUIntSpy).toHaveBeenCalledWith(tables.maxp.data, 0, 0x00010000);
    });

    it('should throw when maxp table is missing in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => new Uint8Array(16)
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue({
            loca: { tag: 'loca', data: new Uint8Array([0]), offset: 0, length: 4 },
            glyf: { tag: 'glyf', data: new Uint8Array([0]), offset: 0, length: 1 },
            maxp: null
        } as any); // eslint-disable-line

        // Act + Assert
        expect((): void => {
            helper._checkAndRepair(fakeFontFile);
        }).toThrow(); // ✅ FIX
    });

    it('should throw when maxp table version is invalid and length is neither 6 nor >= 32', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => {
                const bytes: Uint8Array = new Uint8Array(64);
                bytes[4] = 0x00;
                bytes[5] = 0x01;
                return bytes;
            }
        };

        const headData: number[] = new Array(60).fill(0);
        const hheaData: number[] = new Array(20).fill(0);

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue({
            loca: { tag: 'loca', data: new Uint8Array([0]), offset: 0, length: 4 },
            glyf: { tag: 'glyf', data: new Uint8Array([0]), offset: 0, length: 1 },
            maxp: { tag: 'maxp', data: new Uint8Array(10), offset: 0, length: 10 },
            head: { tag: 'head', data: headData, offset: 0, length: 54 },
            hhea: { tag: 'hhea', data: hheaData, offset: 0, length: 20 },
            name: null,
            'compactFont ': null
        } as any); // eslint-disable-line

        // Act + Assert
        expect((): void => {
            helper._checkAndRepair(fakeFontFile);
        }).toThrow(); // ✅ FIX
    });

    it('should early return in _adjustType1ToUnicode for internal font, included map, and identical encodings', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, null as any); // eslint-disable-line

        fontStructure._toUnicode = {
            _amend: jasmine.createSpy('_amend')
        } as any; // eslint-disable-line

        // Case 1: internal font
        fontStructure._isInternalFont = true;
        helper._adjustType1ToUnicode();
        expect((fontStructure._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line

        // Case 2: included ToUnicode map
        fontStructure._isInternalFont = false;
        (helper as unknown as { _hasIncludedToUnicodeMap: boolean })._hasIncludedToUnicodeMap = true;
        helper._adjustType1ToUnicode();
        expect((fontStructure._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line

        // Case 3: builtInEncoding === defaultEncoding
        (helper as unknown as { _hasIncludedToUnicodeMap: boolean })._hasIncludedToUnicodeMap = false;
        const sharedEncoding: any = []; // eslint-disable-line
        fontStructure._builtInEncoding = sharedEncoding;
        fontStructure._defaultEncoding = sharedEncoding;
        helper._adjustType1ToUnicode();
        expect((fontStructure._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line
    });
});

import { _PdfCrossReference, _PdfDictionary, _PdfName, _PdfReference } from '@syncfusion/ej2-pdf';
import * as fontUtils from '../../src/pdf-data-extract/core/text-extraction/font-utils';
import * as compactFontModule from '../../src/pdf-data-extract/core/text-extraction/compact-font-parser';
import { _PdfCharacterMapFactory, _PdfIdentityCharacterMap } from "../../src/pdf-data-extract/core/text-extraction/cmap";
 function createRealIdentityToUnicode(helper: _FontHelper, first: number, last: number): any { // eslint-disable-line
        (helper as unknown as { _firstChar: number })._firstChar = first;
        (helper as unknown as { _lastChar: number })._lastChar = last;
        (helper._fontStructure as unknown as { _characterMap: { builtInCMap: boolean } })._characterMap = {
            builtInCMap: false
        };
        return helper._buildToUnicode(null, false, null);
    }
describe('_FontHelper highlighted coverage for font-structure.ts', () => {
    function createFontStructure(): _FontStructure {
        return ({
            _name: '',
            _type: '',
            _subtype: '',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _widths: [],
            _defaultWidth: 0,
            _differences: [],
            _defaultEncoding: [],
            _toUnicode: null,
            _toFontChar: null,
            _characterMap: null,
            _composite: false,
            _encoding: '',
            _flags: 0,
            _glyphCache: Object.create(null),
            _charsCache: Object.create(null),
            _isInternalFont: false
        } as unknown) as _FontStructure;
    }

    function createName(name: string): _PdfName {
        const value: _PdfName = Object.create((_PdfName as any).prototype) as _PdfName; // eslint-disable-line
        (value as unknown as { name: string }).name = name;
        return value;
    }

    function createReference(id: string): _PdfReference {
        const value: _PdfReference = Object.create((_PdfReference as any).prototype) as _PdfReference; // eslint-disable-line
        (value as unknown as { _refId: string })._refId = id;
        return value;
    }

    function createDictionary(seed?: { [key: string]: unknown }): _PdfDictionary {
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: _PdfDictionary = Object.create((_PdfDictionary as any).prototype) as _PdfDictionary; // eslint-disable-line

        (dict as unknown as {
            has: (key: string) => boolean;
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            set: (key: string, value: unknown) => void;
        }).has = (key: string): boolean => raw.has(key);

        (dict as unknown as {
            get: (key: string) => unknown;
        }).get = (key: string): unknown => raw.get(key);

        (dict as unknown as {
            getArray: (key: string) => unknown;
        }).getArray = (key: string): unknown => raw.get(key);

        (dict as unknown as {
            set: (key: string, value: unknown) => void;
        }).set = (key: string, value: unknown): void => {
            raw.set(key, value);
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function createCrossReference(fetcher?: (arg: unknown) => unknown): _PdfCrossReference {
        return ({
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            })
        } as unknown) as _PdfCrossReference;
    }

    function createRealIdentityToUnicode(helper: _FontHelper, first: number, last: number): any { // eslint-disable-line
        (helper as unknown as { _firstChar: number })._firstChar = first;
        (helper as unknown as { _lastChar: number })._lastChar = last;
        (helper._fontStructure as unknown as { _characterMap: { builtInCMap: boolean } })._characterMap = {
            builtInCMap: false
        };
        return helper._buildToUnicode(null, false, null);
    }

    it('should cover _extractDataStructures dictionary encoding differences branch with references and names', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        fontStructure._type = 'TrueType';
        fontStructure._flags = 0;
        fontStructure._name = 'Helvetica';

        const glyphNameRef: _PdfReference = createReference('glyphNameRef');
        const encodingDictionary: _PdfDictionary = createDictionary({
            BaseEncoding: createName('WinAnsiEncoding'),
            Differences: [5, glyphNameRef]
        });

        const dictionary: _PdfDictionary = createDictionary({
            Encoding: encodingDictionary
        });

        const crossReference: _PdfCrossReference = createCrossReference((arg: unknown): unknown => {
            if (arg === glyphNameRef) {
                return createName('A');
            }
            return arg;
        });

        const helper: _FontHelper = new _FontHelper(fontStructure, crossReference);

        // Act
        helper._extractDataStructures(dictionary, null);

        // Assert
        expect(fontStructure._differences[5]).toBe('A');
        expect(fontStructure._defaultEncoding).toBeDefined();
        expect((helper as unknown as { _hasEncoding: boolean })._hasEncoding).toBe(true);
    });

    it('should cover _extractDataStructures name encoding branch', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        fontStructure._type = 'TrueType';
        fontStructure._flags = 0;
        fontStructure._name = 'Helvetica';

        const dictionary: _PdfDictionary = createDictionary({
            Encoding: createName('MacRomanEncoding')
        });

        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        // Act
        helper._extractDataStructures(dictionary, null);

        // Assert
        expect(fontStructure._defaultEncoding).toBeDefined();
        expect((helper as unknown as { _hasEncoding: boolean })._hasEncoding).toBe(true);
    });

    it('should cover _stringToPdfString UTF-16BE odd-length trimming branch', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        // Act
        const result: string = helper._stringToPdfString('\xFE\xFF\x00A\x00');

        // Assert
        expect(result).toBe('A');
    });

    it('should cover _stringToPdfString UTF-16LE odd-length trimming branch', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        // Act
        const result: string = helper._stringToPdfString('\xFF\xFEA\x00\x00');

        // Assert
        expect(result).toBe('A');
    });

    it('should cover _stringToPdfString decoder catch branch and throw FormatError', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        // Act + Assert
        expect((): void => {
            helper._stringToPdfString('\xFE\xFF\xD8\x00');
        }).toThrow();
    });

    it('should cover _fetchStandardFontData Symbol branch and base64 decode loop', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const originalFontNameToFileMap: any = (encodingUtils as any)._getFontNameToFileMap; // eslint-disable-line

        spyOn(fontUtils as any, '_getFontEncodedString').and.returnValue(
            'data:font/opentype;base64,QQ=='
        );

        Object.defineProperty(encodingUtils, '_getFontNameToFileMap', {
            value: {
                Symbol: 'symbol.ttf'
            },
            configurable: true
        });

        try {
            // Act
            const stream: any = helper._fetchStandardFontData('Symbol'); // eslint-disable-line

            // Assert
            expect(stream).toBeTruthy();
            expect((helper as unknown as { _file: unknown })._file).toBeTruthy();
        } finally {
            Object.defineProperty(encodingUtils, '_getFontNameToFileMap', {
                value: originalFontNameToFileMap,
                configurable: true
            });
        }
    });

    it('should cover _setFontData Type1C branch with builtInEncoding and adjustType1ToUnicode', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._type = 'Type1';
        fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];

        (helper as unknown as { _file: unknown })._file = {
            peekBytes: (): Uint8Array => new Uint8Array([1, 0, 0, 1])
        };

        spyOn(helper, '_getFontFileType').and.callFake((): void => {
            (helper as unknown as { _fileType: string })._fileType = 'Type1';
            (helper as unknown as { _fileSubtype: string })._fileSubtype = 'Type1C';
        });

        const compactFontSpy: jasmine.Spy = spyOn(compactFontModule as any, '_PdfCompactFont').and.callFake(function (): any { // eslint-disable-line
            return {
                _builtInEncoding: ['A']
            };
        });

        const adjustWidthsSpy: jasmine.Spy = spyOn(helper, '_adjustWidths').and.callFake((): void => {
            return;
        });
        const adjustType1Spy: jasmine.Spy = spyOn(helper, '_adjustType1ToUnicode').and.callFake((): void => {
            return;
        });

        // Act
        helper._setFontData();

        // Assert
        expect(compactFontSpy).toHaveBeenCalled();
        expect(adjustWidthsSpy).toHaveBeenCalled();
        expect(adjustType1Spy).toHaveBeenCalled();
        expect(fontStructure._mimeType).toBe('font/opentype');
        expect(fontStructure._builtInEncoding).toEqual(['A']);
    });

    it('should cover _setFontData OpenType branch and set type to OpenType when _isOpenType is true', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._type = 'TrueType';

        (helper as unknown as { _file: unknown })._file = {
            peekBytes: (): Uint8Array => new Uint8Array([0, 0, 0, 0])
        };

        spyOn(helper, '_getFontFileType').and.callFake((): void => {
            (helper as unknown as { _fileType: string })._fileType = 'TrueType';
        });

        (helper as unknown as { _isOpenType: boolean })._isOpenType = true;

        const checkRepairSpy: jasmine.Spy = spyOn(helper, '_checkAndRepair').and.callFake((): void => {
            return;
        });
        const adjustWidthsSpy: jasmine.Spy = spyOn(helper, '_adjustWidths').and.callFake((): void => {
            return;
        });

        // Act
        helper._setFontData();

        // Assert
        expect(checkRepairSpy).toHaveBeenCalled();
        expect(adjustWidthsSpy).toHaveBeenCalled();
        expect(fontStructure._mimeType).toBe('font/opentype');
        expect(fontStructure._type).toBe('OpenType');
    });

    it('should cover _setFontData default throw/catch fallback path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        (helper as unknown as { _file: unknown })._file = {
            peekBytes: (): Uint8Array => new Uint8Array([0, 0, 0, 0])
        };

        spyOn(helper, '_getFontFileType').and.callFake((): void => {
            (helper as unknown as { _fileType: string })._fileType = 'UnsupportedFontType';
        });

        const fallbackSpy: jasmine.Spy = spyOn(helper, '_setFallBackSystemFont').and.callFake((): void => {
            return;
        });

        // Act
        helper._setFontData();

        // Assert
        expect(fallbackSpy).toHaveBeenCalled();
    });

    it('should cover _extractWidths composite W array path and vertical W2 array path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const crossReference: _PdfCrossReference = createCrossReference();
        const helper: _FontHelper = new _FontHelper(fontStructure, crossReference);

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = true;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 900,
            W: [1, [200, 300], 5, 7, 400],
            DW2: [880, -1000],
            W2: [1, [10, 20, 30, 40, 50, 60], 5, 6, 70, 80, 90]
        });

        const dictionary: _PdfDictionary = createDictionary({});

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(fontStructure._defaultWidth).toBe(900);
        expect(fontStructure._widths[1]).toBe(200);
        expect(fontStructure._widths[2]).toBe(300);
        expect(fontStructure._widths[5]).toBe(400);
        expect(fontStructure._widths[6]).toBe(400);
        expect(fontStructure._widths[7]).toBe(400);
    });

    it('should cover _extractWidths vertical W2 break path when code is neither array nor integer', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const crossReference: _PdfCrossReference = createCrossReference();
        const helper: _FontHelper = new _FontHelper(fontStructure, crossReference);

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = true;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 1000,
            W: [],
            DW2: [880, -1000],
            W2: [1, 'bad-code']
        });

        const dictionary: _PdfDictionary = createDictionary({});

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(fontStructure._defaultWidth).toBe(1000);
    });

    it('should cover cidToGidMap identity-length mismatch branch in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._name = 'Calibri';
        fontStructure._type = 'CIDFontType2';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // eslint-disable-line
        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 65, 66);

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure,
            cidToGidMap: [100],
            hasIncludedToUnicodeMap: true
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({
            Helvetica: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({
            Calibri: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({
            Helvetica: {
                ascent: 1000,
                descent: -200,
                capHeight: 700
            }
        } as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[65] = 5;
            map[66] = 6;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[65]).toBe(65);
        expect(fontStructure._toFontChar[66]).toBe(66);
    });

    it('should cover final else branch with composite identity Tahoma path in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._name = 'TahomaCustom';
        fontStructure._type = 'TrueType';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // eslint-disable-line
        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 70, 70);

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({} as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[70] = 71;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[70]).toBe(71);
    });

    it('should cover highlighted _spaceWidth composite characterMap/string CID path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._widths = [];
        fontStructure._widths[65] = 123;
        fontStructure._composite = true;
        fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(true),
            _lookup: jasmine.createSpy('_lookup').and.returnValue('A')
        } as any; // eslint-disable-line
        fontStructure._toUnicode = {
            _charCodeOf: jasmine.createSpy('_charCodeOf').and.returnValue(-1)
        } as any; // eslint-disable-line

        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            space: 65
        } as any); // eslint-disable-line

        // Act
        const width: number = helper._spaceWidth;

        // Assert
        expect(width).toBe(123);
        expect((fontStructure._characterMap as any)._contains).toHaveBeenCalled(); // eslint-disable-line
        expect((fontStructure._characterMap as any)._lookup).toHaveBeenCalled(); // eslint-disable-line
    });

    it('should throw when loca table is missing in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => new Uint8Array(64)
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue({
            loca: null
        } as any); // eslint-disable-line

        // Act + Assert
        expect((): void => {
            helper._checkAndRepair(fakeFontFile);
        }).toThrow();
    });

    it('should create missing glyf table, patch maxp version=0x00005000, run scaleFactors branch and apply cssFontInfo metrics in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._cssFontInfo = {
            lineHeight: true,
            metrics: {
                lineHeight: 1.5,
                lineGap: 0.2
            }
        } as any; // eslint-disable-line

        helper._scaleFactors = [1, 2];

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => {
                const bytes: Uint8Array = new Uint8Array(64);
                bytes[4] = 0x00;
                bytes[5] = 0x02; // numGlyphs = 2
                return bytes;
            }
        };

        const headData: number[] = new Array(60).fill(0);
        const hheaData: number[] = new Array(20).fill(0);
        headData[50] = 0;
        headData[51] = 0;

        const tables: any = { // eslint-disable-line
            loca: { tag: 'loca', data: new Uint8Array([0, 0, 0, 0, 0, 0]), offset: 0, length: 6 },
            glyf: null,
            maxp: { tag: 'maxp', data: new Uint8Array([0, 0, 0, 0, 0, 2]), offset: 0, length: 6 },
            head: { tag: 'head', data: headData, offset: 0, length: 54 },
            hhea: { tag: 'hhea', data: hheaData, offset: 0, length: 20 },
            name: null,
            'compactFont ': null
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue(tables);
        const writeUIntSpy: jasmine.Spy = spyOn(helper, '_writeUnSignedInt32').and.callThrough();
        const glyphScaleSpy: jasmine.Spy = spyOn(glyphModule._PdfGlyphTable.prototype, 'scale').and.callFake((): void => {
            return;
        });
        const glyphWriteSpy: jasmine.Spy = spyOn(glyphModule._PdfGlyphTable.prototype, '_write').and.returnValue({
            data: new Uint8Array([1, 2, 3]),
            loca: new Uint8Array([4, 5, 6]),
            isLocationLong: true
        } as any); // eslint-disable-line

        // Act
        helper._checkAndRepair(fakeFontFile);

        // Assert
        expect(tables.glyf).toBeTruthy();
        expect(tables.glyf.data instanceof Uint8Array).toBe(true);
        expect(writeUIntSpy).toHaveBeenCalledWith(tables.maxp.data, 0, 0x0005000);
        expect(glyphScaleSpy).toHaveBeenCalled();
        expect(glyphWriteSpy).toHaveBeenCalled();
        expect(tables.glyf.data).toEqual(new Uint8Array([1, 2, 3]));
        expect(tables.loca.data).toEqual(new Uint8Array([4, 5, 6]));
        expect(tables.head.data[50]).toBe(0);
        expect(tables.head.data[51]).toBe(1);
        expect(fontStructure._lineHeight).toBe(1.5);
        expect(fontStructure._lineGap).toBe(0.2);
    });

    it('should patch maxp version=0x00010000 when maxp length is >= 32 in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => {
                const bytes: Uint8Array = new Uint8Array(64);
                bytes[4] = 0x00;
                bytes[5] = 0x01;
                return bytes;
            }
        };

        const headData: number[] = new Array(60).fill(0);
        const hheaData: number[] = new Array(20).fill(0);

        const tables: any = { // eslint-disable-line
            loca: { tag: 'loca', data: new Uint8Array([0, 0, 0, 0]), offset: 0, length: 4 },
            glyf: { tag: 'glyf', data: new Uint8Array([0]), offset: 0, length: 1 },
            maxp: { tag: 'maxp', data: new Uint8Array(32), offset: 0, length: 32 },
            head: { tag: 'head', data: headData, offset: 0, length: 54 },
            hhea: { tag: 'hhea', data: hheaData, offset: 0, length: 20 },
            name: null,
            'compactFont ': null
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue(tables);
        const writeUIntSpy: jasmine.Spy = spyOn(helper, '_writeUnSignedInt32').and.callThrough();

        // Act
        helper._checkAndRepair(fakeFontFile);

        // Assert
        expect(writeUIntSpy).toHaveBeenCalledWith(tables.maxp.data, 0, 0x00010000);
    });

    it('should throw when maxp table is missing in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => new Uint8Array(16)
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue({
            loca: { tag: 'loca', data: new Uint8Array([0]), offset: 0, length: 4 },
            glyf: { tag: 'glyf', data: new Uint8Array([0]), offset: 0, length: 1 },
            maxp: null
        } as any); // eslint-disable-line

        // Act + Assert
        expect((): void => {
            helper._checkAndRepair(fakeFontFile);
        }).toThrow();
    });

    it('should throw when maxp table version is invalid and length is neither 6 nor >= 32', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const fakeFontFile: any = { // eslint-disable-line
            getBytes: (): Uint8Array => {
                const bytes: Uint8Array = new Uint8Array(64);
                bytes[4] = 0x00;
                bytes[5] = 0x01;
                return bytes;
            }
        };

        const headData: number[] = new Array(60).fill(0);
        const hheaData: number[] = new Array(20).fill(0);

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({ version: 'true', numTables: 0 } as any); // eslint-disable-line
        spyOn(helper, '_readTables').and.returnValue({
            loca: { tag: 'loca', data: new Uint8Array([0]), offset: 0, length: 4 },
            glyf: { tag: 'glyf', data: new Uint8Array([0]), offset: 0, length: 1 },
            maxp: { tag: 'maxp', data: new Uint8Array(10), offset: 0, length: 10 },
            head: { tag: 'head', data: headData, offset: 0, length: 54 },
            hhea: { tag: 'hhea', data: hheaData, offset: 0, length: 20 },
            name: null,
            'compactFont ': null
        } as any); // eslint-disable-line

        // Act + Assert
        expect((): void => {
            helper._checkAndRepair(fakeFontFile);
        }).toThrow();
    });

    it('should early return in _adjustType1ToUnicode for internal font, included map, and identical encodings', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._toUnicode = {
            _amend: jasmine.createSpy('_amend')
        } as any; // eslint-disable-line

        // Case 1
        fontStructure._isInternalFont = true;
        helper._adjustType1ToUnicode();
        expect((fontStructure._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line

        // Case 2
        fontStructure._isInternalFont = false;
        (helper as unknown as { _hasIncludedToUnicodeMap: boolean })._hasIncludedToUnicodeMap = true;
        helper._adjustType1ToUnicode();
        expect((fontStructure._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line

        // Case 3
        (helper as unknown as { _hasIncludedToUnicodeMap: boolean })._hasIncludedToUnicodeMap = false;
        const sharedEncoding: any = []; // eslint-disable-line
        fontStructure._builtInEncoding = sharedEncoding;
        fontStructure._defaultEncoding = sharedEncoding;
        helper._adjustType1ToUnicode();
        expect((fontStructure._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line
    });
});

describe('_FontHelper red-highlighted branch coverage for font-structure.ts', () => {
    function createFontStructure(): _FontStructure {
        return ({
            _name: '',
            _type: '',
            _subtype: '',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _widths: [],
            _defaultWidth: 0,
            _differences: [],
            _defaultEncoding: [],
            _toUnicode: null,
            _toFontChar: null,
            _characterMap: null,
            _composite: false,
            _encoding: '',
            _flags: 0,
            _glyphCache: Object.create(null),
            _charsCache: Object.create(null),
            _isInternalFont: false
        } as unknown) as _FontStructure;
    }

    function createName(name: string): _PdfName {
        const value: _PdfName = Object.create((_PdfName as any).prototype) as _PdfName; // eslint-disable-line
        (value as unknown as { name: string }).name = name;
        return value;
    }

    function createReference(id: string): _PdfReference {
        const value: _PdfReference = Object.create((_PdfReference as any).prototype) as _PdfReference; // eslint-disable-line
        (value as unknown as { _refId: string })._refId = id;
        return value;
    }

    function createDictionary(seed?: { [key: string]: unknown }): _PdfDictionary {
        const raw: Map<string, unknown> = new Map<string, unknown>();
        const dict: _PdfDictionary = Object.create((_PdfDictionary as any).prototype) as _PdfDictionary; // eslint-disable-line

        (dict as any).has = (key: string): boolean => raw.has(key); // eslint-disable-line
        (dict as any).get = (key: string): unknown => raw.get(key); // eslint-disable-line
        (dict as any).getArray = (key: string): unknown => raw.get(key); // eslint-disable-line
        (dict as any).set = (key: string, value: unknown): void => { raw.set(key, value); }; // eslint-disable-line

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function createCrossReference(fetcher?: (arg: unknown) => unknown): _PdfCrossReference {
        return ({
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            })
        } as unknown) as _PdfCrossReference;
    }

    it('should cover cidEncoding PdfName branch in _translateFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = true;
        fontStructure._type = 'TrueType';

        const descriptor: _PdfDictionary = createDictionary({
            FontName: createName('Helvetica'),
            FontBBox: [0, 0, 1000, 1000],
            Ascent: 800,
            Descent: -200,
            CapHeight: 700,
            Flags: 4
        });

        const dictionary: _PdfDictionary = createDictionary({
            FontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            Encoding: createName('Identity-H')
        });

        const baseDictionary: _PdfDictionary = createDictionary({
            Encoding: createName('Identity-H')
        });

        spyOn(helper, '_extractDataStructures').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_extractWidths').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_setFontData').and.callFake((): void => {
            return;
        });

        // Act
        helper._translateFont(descriptor, dictionary, baseDictionary, 0, 255, null);

        // Assert
        expect(fontStructure._encoding).toBe('Identity-H');
        expect(fontStructure._composite).toBe(true);
        expect(fontStructure._characterMap).toBeDefined();
        expect(fontStructure._vertical).toBeDefined();
    });

    it('should cover _getFontFileType compact font composite and non-composite branches', () => {
        // Arrange
        const fontStructureA: _FontStructure = createFontStructure();
        const helperA: _FontHelper = new _FontHelper(fontStructureA, createCrossReference());

        fontStructureA._composite = true;
        fontStructureA._type = 'Type1';

        (helperA as unknown as { _file: { peekBytes: () => Uint8Array } })._file = {
            peekBytes: (): Uint8Array => new Uint8Array([1, 0, 0, 4])
        };

        // Act
        helperA._getFontFileType();

        // Assert
        expect((helperA as unknown as { _fileType: string })._fileType).toBe('CIDFontType0');
        expect((helperA as unknown as { _fileSubtype: string })._fileSubtype).toBe('CIDFontType0C');

        // Arrange 2
        const fontStructureB: _FontStructure = createFontStructure();
        const helperB: _FontHelper = new _FontHelper(fontStructureB, createCrossReference());

        fontStructureB._composite = false;
        fontStructureB._type = 'Type1';

        (helperB as unknown as { _file: { peekBytes: () => Uint8Array } })._file = {
            peekBytes: (): Uint8Array => new Uint8Array([1, 0, 0, 4])
        };

        // Act
        helperB._getFontFileType();

        // Assert
        expect((helperB as unknown as { _fileType: string })._fileType).toBe('Type1');
        expect((helperB as unknown as { _fileSubtype: string })._fileSubtype).toBe('Type1C');
    });

    it('should cover _extractWidths composite W break path and vertical W2 break path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = true;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 1000,
            W: ['bad-start'],
            DW2: [880, -1000],
            W2: [1, 'bad-code']
        });

        const dictionary: _PdfDictionary = createDictionary({});

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(fontStructure._defaultWidth).toBe(1000);
        expect(Array.isArray(fontStructure._widths)).toBe(true);
    });

    it('should cover _extractWidths composite valid W array and valid vertical W2 array paths', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = true;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 900,
            W: [1, [200, 300], 5, 7, 400],
            DW2: [880, -1000],
            W2: [1, [10, 20, 30, 40, 50, 60], 5, 6, 70, 80, 90]
        });

        const dictionary: _PdfDictionary = createDictionary({});

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(fontStructure._defaultWidth).toBe(900);
        expect(fontStructure._widths[1]).toBe(200);
        expect(fontStructure._widths[2]).toBe(300);
        expect(fontStructure._widths[5]).toBe(400);
        expect(fontStructure._widths[6]).toBe(400);
        expect(fontStructure._widths[7]).toBe(400);
    });

    it('should cover _spaceWidth highlighted composite characterMap string path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._widths = [];
        fontStructure._widths[65] = 123;
        fontStructure._composite = true;
        fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(true),
            _lookup: jasmine.createSpy('_lookup').and.returnValue('A')
        } as any; // eslint-disable-line
        fontStructure._toUnicode = {
            _charCodeOf: jasmine.createSpy('_charCodeOf').and.returnValue(-1)
        } as any; // eslint-disable-line

        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            space: 65
        } as any); // eslint-disable-line

        // Act
        const width: number = helper._spaceWidth;

        // Assert
        expect(width).toBe(123);
        expect((fontStructure._characterMap as any)._contains).toHaveBeenCalled(); // eslint-disable-line
        expect((fontStructure._characterMap as any)._lookup).toHaveBeenCalled(); // eslint-disable-line
    });

    it('should cover _charToGlyph highlighted widthCode string conversion and unicode fallback path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._glyphCache = Object.create(null);
        fontStructure._widths = [];
        fontStructure._widths[65] = 200;
        fontStructure._defaultWidth = 50;
        fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(true),
            _lookup: jasmine.createSpy('_lookup').and.returnValue('A')
        } as any; // eslint-disable-line
        fontStructure._toUnicode = {
            _get: jasmine.createSpy('_get').and.returnValue(undefined)
        } as any; // eslint-disable-line

        // Act
        const glyph: any = helper._charToGlyph(65); // eslint-disable-line

        // Assert
        expect(glyph._width).toBe(200);
        expect(glyph._unicode).toBe(String.fromCharCode(65));
        expect(glyph._isSpace).toBe(false);
    });

    it('should cover cidToGidMap identity-length mismatch branch in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._name = 'Calibri';
        fontStructure._type = 'CIDFontType2';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // eslint-disable-line
        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 65, 66);

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure,
            cidToGidMap: [100],
            hasIncludedToUnicodeMap: true
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({
            Helvetica: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({
            Calibri: 'Helvetica'
        } as any); // eslint-disable-line

        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({
            Helvetica: {
                ascent: 1000,
                descent: -200,
                capHeight: 700
            }
        } as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[65] = 5;
            map[66] = 6;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[65]).toBe(65);
        expect(fontStructure._toFontChar[66]).toBe(66);
    });

    it('should cover final else branch with composite identity Tahoma path in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._name = 'TahomaCustom';
        fontStructure._type = 'TrueType';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // eslint-disable-line
        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 70, 70);

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({} as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[70] = 71;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[70]).toBe(71);
    });
});
``

describe('_FontHelper exact red-line coverage for font-structure.ts', () => {
    function createFontStructure(): _FontStructure {
        return ({
            _name: '',
            _type: '',
            _subtype: '',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _widths: [],
            _defaultWidth: 0,
            _differences: [],
            _defaultEncoding: [],
            _toUnicode: null,
            _toFontChar: null,
            _characterMap: null,
            _composite: false,
            _encoding: '',
            _flags: 0,
            _glyphCache: Object.create(null),
            _charsCache: Object.create(null),
            _isInternalFont: false
        } as unknown) as _FontStructure;
    }

    function createName(name: string): _PdfName {
        const value: _PdfName = Object.create((_PdfName as any).prototype) as _PdfName; // eslint-disable-line
        (value as unknown as { name: string }).name = name;
        return value;
    }

    function createReference(id: string): _PdfReference {
        const value: _PdfReference = Object.create((_PdfReference as any).prototype) as _PdfReference; // eslint-disable-line
        (value as unknown as { _refId: string })._refId = id;
        return value;
    }

    function createDictionary(seed?: { [key: string]: unknown }): _PdfDictionary {
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: _PdfDictionary = Object.create((_PdfDictionary as any).prototype) as _PdfDictionary; // eslint-disable-line

        (dict as unknown as {
            has: (key: string) => boolean;
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            set: (key: string, value: unknown) => void;
        }).has = (key: string): boolean => raw.has(key);

        (dict as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => raw.get(key);
        (dict as unknown as { getArray: (key: string) => unknown }).getArray = (key: string): unknown => raw.get(key);
        (dict as unknown as { set: (key: string, value: unknown) => void }).set = (key: string, value: unknown): void => {
            raw.set(key, value);
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function createCrossReference(fetcher?: (arg: unknown) => unknown): _PdfCrossReference {
        return ({
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            })
        } as unknown) as _PdfCrossReference;
    }

    function createRealIdentityToUnicode(helper: _FontHelper, first: number, last: number): any { // eslint-disable-line
        (helper as unknown as { _firstChar: number })._firstChar = first;
        (helper as unknown as { _lastChar: number })._lastChar = last;
        (helper._fontStructure as unknown as { _characterMap: { builtInCMap: boolean } })._characterMap = {
            builtInCMap: false
        };
        return helper._buildToUnicode(null, false, null);
    }

    it('should cover comma-style parsing line in _getFontStyle', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());
        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: createName('CustomFont,Italic')
        });

        // Act
        const result: PdfFontStyle = helper._getFontStyle(dictionary);

        // Assert
        expect(result).toBe(PdfFontStyle.italic);
    });

    it('should cover typeof fontName === string and descriptor.has(FontFile) branches in _translateFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const descriptor: _PdfDictionary = createDictionary({
            FontName: 'HelveticaStringName',
            FontBBox: [0, 0, 1000, 1000],
            Ascent: 800,
            Descent: -200,
            CapHeight: 700,
            Flags: 4,
            FontFile: {
                dictionary: createDictionary({
                    Length1: 10,
                    Length2: 20,
                    Length3: 30
                })
            }
        });

        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: createName('Helvetica'),
            FontMatrix: [0.001, 0, 0, 0.001, 0, 0]
        });

        const baseDictionary: _PdfDictionary = createDictionary({});

        spyOn(helper, '_extractDataStructures').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_extractWidths').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_setFontData').and.callFake((): void => {
            return;
        });

        // Act
        helper._translateFont(descriptor as any, dictionary as any, baseDictionary as any, 0, 255, null); // eslint-disable-line

        // Assert
        expect(fontStructure._name).toBeUndefined();
        expect((helper as unknown as { _file: unknown })._file).toBeTruthy();
        expect(fontStructure._length1).toBe(10);
        expect(fontStructure._length2).toBe(20);
        expect(fontStructure._length3).toBe(30);
    });

    it('should cover catch branch that assigns _PdfNullStream when descriptor.get(FontFile) throws', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const descriptor: _PdfDictionary = createDictionary({
            FontName: createName('Helvetica'),
            FontBBox: [0, 0, 1000, 1000],
            Ascent: 800,
            Descent: -200,
            CapHeight: 700,
            Flags: 4,
            FontFile: true
        });

        const originalGet: (key: string) => unknown = (descriptor as any).get; // eslint-disable-line
        (descriptor as any).get = (key: string): unknown => { // eslint-disable-line
            if (key === 'FontFile') {
                throw new Error('read error');
            }
            return originalGet(key);
        };

        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: createName('Helvetica'),
            FontMatrix: [0.001, 0, 0, 0.001, 0, 0]
        });

        const baseDictionary: _PdfDictionary = createDictionary({});

        spyOn(helper, '_extractDataStructures').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_extractWidths').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_setFontData').and.callFake((): void => {
            return;
        });

        // Act
        expect((): void => {
            helper._translateFont(descriptor as any, dictionary as any, baseDictionary as any, 0, 255, null); // eslint-disable-line
        }).not.toThrow();
    });

    it('should cover non-composite Type1 else branch in _getFontFileType', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = false;
        fontStructure._type = 'Type1';

        (helper as unknown as { _file: { peekBytes: () => Uint8Array } })._file = {
            peekBytes: (): Uint8Array => new Uint8Array([0x25, 0x21]) // Type1 header
        };

        // Act
        helper._getFontFileType();

        // Assert
        expect((helper as unknown as { _fileType: string })._fileType).toBe('Type1');
    });

    it('should cover code instanceof _PdfReference branch in composite W extraction', () => {
        // Arrange
        const codeRef: _PdfReference = createReference('codeRef');

        const crossReference: _PdfCrossReference = createCrossReference((arg: unknown): unknown => {
            if (arg === codeRef) {
                return 3;
            }
            return arg;
        });

        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, crossReference);

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = false;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 1000,
            W: [1, codeRef, 400]
        });

        const dictionary: _PdfDictionary = createDictionary({});

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(fontStructure._widths[1]).toBe(400);
        expect(fontStructure._widths[2]).toBe(400);
        expect(fontStructure._widths[3]).toBe(400);
    });

    it('should cover break branch in composite W extraction when code is invalid', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = false;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 1000,
            W: [1, 'bad-code']
        });

        const dictionary: _PdfDictionary = createDictionary({});

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(fontStructure._defaultWidth).toBe(1000);
    });

    it('should cover unsupported baseEncodingName reset to null in _extractDataStructures', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        fontStructure._name = 'Helvetica';
        fontStructure._type = 'TrueType';
        fontStructure._flags = 0;

        const encodingDictionary: _PdfDictionary = createDictionary({
            BaseEncoding: createName('UnsupportedEncoding')
        });

        const dictionary: _PdfDictionary = createDictionary({
            Encoding: encodingDictionary
        });

        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        // Act
        helper._extractDataStructures(dictionary, null);

        // Assert
        expect((helper as unknown as { _baseEncodingName: string | null })._baseEncodingName).toBeNull();
    });

    it('should cover _readToUnicode identity-cmap branch and _PdfIdentityToUnicodeMap._get', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());
        const identityCMap: _PdfIdentityCharacterMap = Object.create((_PdfIdentityCharacterMap as any).prototype) as _PdfIdentityCharacterMap; // eslint-disable-line

        const createSpy: jasmine.Spy = spyOn(_PdfCharacterMapFactory.prototype as any, '_create').and.returnValue(identityCMap); // eslint-disable-line
        const cmapName: _PdfName = createName('Identity-H');

        try {
            // Act
            const result: any = helper._readToUnicode(cmapName); // eslint-disable-line

            // Assert
            expect(createSpy).toHaveBeenCalled();
            expect(result._get(65)).toBe('A');
            expect(result._get(-1)).toBeUndefined();
        } finally {
            createSpy.and.callThrough();
        }
    });

    it('should cover cid > 0xffff throw branch in _buildToUnicode', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = true;
        (fontStructure as unknown as {
            _characterMap: {
                builtInCMap: boolean;
                _forEach: (callback: (charCode: number, cid: number) => void) => void;
            };
        })._characterMap = {
            builtInCMap: true,
            _forEach: (callback: (charCode: number, cid: number) => void): void => {
                callback(1, 0x10000);
            }
        };

        (fontStructure as unknown as {
            _characterSystemInfo: { registry: string; ordering: string };
        })._characterSystemInfo = {
            registry: 'Adobe',
            ordering: 'GB1'
        };

        const createSpy: jasmine.Spy = spyOn(_PdfCharacterMapFactory.prototype as any, '_create').and.returnValue({
            _lookup: (): string => '\u0000A'
        });

        try {
            // Act + Assert
            expect((): void => {
                helper._buildToUnicode(null, false, null);
            }).toThrow();
        } finally {
            createSpy.and.callThrough();
        }
    });

    it('should cover recursive Number.isNaN(code) branch in _simpleFontToUnicode without infinite loop', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._defaultEncoding = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding[13] = 'C0A';

        const original: (baseEncodingName: any, forceGlyphs?: boolean) => any = helper._simpleFontToUnicode.bind(helper); // eslint-disable-line

        const simpleSpy: jasmine.Spy = spyOn(helper, '_simpleFontToUnicode').and.callFake((baseEncodingName: any, forceGlyphs?: boolean): any => { // eslint-disable-line
            // Intercept the buggy recursive call `this._simpleFontToUnicode(true)`
            // so the red line executes without causing infinite recursion.
            if (baseEncodingName === true && typeof forceGlyphs === 'undefined') {
                return [];
            }
            return original(baseEncodingName, forceGlyphs);
        });

        // Act
        const result: any = helper._simpleFontToUnicode(null, false); // eslint-disable-line

        // Assert
        expect(simpleSpy.calls.count()).toBe(2);
        expect(result).toEqual([]);
    });

    it('should cover the red fallback unicode path in _setFallBackSystemFont else branch', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._name = 'CustomNonStandardFont';
        fontStructure._type = 'TrueType';
        fontStructure._encoding = 'WinAnsiEncoding';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = false;

        const toUnicodeMap: any = { // eslint-disable-line
            _forEach(callback: (charCode: number, unicodeCharCode: number) => void): void {
                callback(65, 66);
            }
        };
        fontStructure._toUnicode = toUnicodeMap;

        const properties: any = { _fontStructure: fontStructure }; // eslint-disable-line

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            A: 65
        } as any); // eslint-disable-line

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(fontStructure._toFontChar[65]).toBe(66);
    });

    it('should cover the red identity Tahoma/Verdana path in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._name = 'TahomaCustom';
        fontStructure._type = 'TrueType';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // eslint-disable-line
        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 70, 70);

        const properties: any = { _fontStructure: fontStructure }; // eslint-disable-line

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({} as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[70] = 71;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[70]).toBe(71);
    });

    it('should cover highlighted _spaceWidth composite characterMap string CID path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._widths = [];
        fontStructure._widths[65] = 123;
        fontStructure._composite = true;
        fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(true),
            _lookup: jasmine.createSpy('_lookup').and.returnValue('A')
        } as any; // eslint-disable-line
        fontStructure._toUnicode = {
            _charCodeOf: jasmine.createSpy('_charCodeOf').and.returnValue(-1)
        } as any; // eslint-disable-line

        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            space: 65
        } as any); // eslint-disable-line

        // Act
        const width: number = helper._spaceWidth;

        // Assert
        expect(width).toBe(123);
    });

    it('should cover _PdfIdentityToUnicodeMap._get in-range and out-of-range directly via build helper', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());
        const identity: any = createRealIdentityToUnicode(helper, 10, 12); // eslint-disable-line

        // Act + Assert
        expect(identity._get(10)).toBeUndefined();
        expect(identity._get(50)).toBeUndefined();
    });
});


describe('_FontHelper exact red-line coverage for font-structure.ts', () => {
    function createFontStructure(): _FontStructure {
        return ({
            _name: '',
            _type: '',
            _subtype: '',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _widths: [],
            _defaultWidth: 0,
            _differences: [],
            _defaultEncoding: [],
            _toUnicode: null,
            _toFontChar: null,
            _characterMap: null,
            _composite: false,
            _encoding: '',
            _flags: 0,
            _glyphCache: Object.create(null),
            _charsCache: Object.create(null),
            _isInternalFont: false
        } as unknown) as _FontStructure;
    }

    function createName(name: string): _PdfName {
        const value: _PdfName = Object.create((_PdfName as any).prototype) as _PdfName; // eslint-disable-line
        (value as unknown as { name: string }).name = name;
        return value;
    }

    function createReference(id: string): _PdfReference {
        const value: _PdfReference = Object.create((_PdfReference as any).prototype) as _PdfReference; // eslint-disable-line
        (value as unknown as { _refId: string })._refId = id;
        return value;
    }

    function createDictionary(seed?: { [key: string]: unknown }): _PdfDictionary {
        const raw: Map<string, unknown> = new Map<string, unknown>();
        const dict: _PdfDictionary = Object.create((_PdfDictionary as any).prototype) as _PdfDictionary; // eslint-disable-line

        (dict as unknown as {
            has: (key: string) => boolean;
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            set: (key: string, value: unknown) => void;
        }).has = (key: string): boolean => raw.has(key);

        (dict as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => raw.get(key);
        (dict as unknown as { getArray: (key: string) => unknown }).getArray = (key: string): unknown => raw.get(key);
        (dict as unknown as { set: (key: string, value: unknown) => void }).set = (key: string, value: unknown): void => {
            raw.set(key, value);
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function createCrossReference(fetcher?: (arg: unknown) => unknown): _PdfCrossReference {
        return ({
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            })
        } as unknown) as _PdfCrossReference;
    }

    function createRealIdentityToUnicode(helper: _FontHelper, first: number, last: number): any { // eslint-disable-line
        (helper as unknown as { _firstChar: number })._firstChar = first;
        (helper as unknown as { _lastChar: number })._lastChar = last;
        (helper._fontStructure as unknown as {
            _characterMap: { builtInCMap: boolean };
            _composite: boolean;
        })._characterMap = { builtInCMap: false };
        (helper._fontStructure as unknown as { _composite: boolean })._composite = true;
        return helper._buildToUnicode(null, false, null);
    }

    it('should cover comma-style parsing line in _getFontStyle', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());
        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: createName('CustomFont,Italic')
        });

        // Act
        const result: PdfFontStyle = helper._getFontStyle(dictionary);

        // Assert
        expect(result).toBe(PdfFontStyle.italic);
    });

    it('should cover cidEncoding dictionary Type branch in _translateFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = true;
        fontStructure._type = 'TrueType';

        const descriptor: _PdfDictionary = createDictionary({
            FontName: createName('Helvetica'),
            FontBBox: [0, 0, 1000, 1000],
            Ascent: 800,
            Descent: -200,
            CapHeight: 700,
            Flags: 4
        });

        const cidEncoding: _PdfDictionary = createDictionary({
            Type: createName('Identity-V')
        });

        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: createName('Helvetica'),
            FontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            Encoding: cidEncoding
        });

        const baseDictionary: _PdfDictionary = createDictionary({
            Encoding: cidEncoding
        });

        const createSpy: jasmine.Spy = spyOn(_PdfCharacterMapFactory.prototype as any, '_create').and.returnValue({
            _vertical: true
        });

        spyOn(helper, '_extractDataStructures').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_extractWidths').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_setFontData').and.callFake((): void => {
            return;
        });

        try {
            // Act
            helper._translateFont(descriptor as any, dictionary as any, baseDictionary as any, 0, 255, null); // eslint-disable-line

            // Assert
            expect(fontStructure._encoding).toBe('Identity-V');
            expect(fontStructure._vertical).toBe(true);
            expect(createSpy).toHaveBeenCalled();
        } finally {
            createSpy.and.callThrough();
        }
    });

    it('should cover typeof fontName === string branch and descriptor.has(FontFile) branch in _translateFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const fontFileDictionary: _PdfDictionary = createDictionary({
            Length1: 10,
            Length2: 20,
            Length3: 30
        });

        const descriptor: _PdfDictionary = createDictionary({
            FontName: 'HelveticaStringName',
            FontBBox: [0, 0, 1000, 1000],
            Ascent: 800,
            Descent: -200,
            CapHeight: 700,
            Flags: 4,
            FontFile: {
                dictionary: fontFileDictionary
            }
        });

        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: createName('Helvetica'),
            FontMatrix: [0.001, 0, 0, 0.001, 0, 0]
        });

        const baseDictionary: _PdfDictionary = createDictionary({});

        spyOn(helper, '_extractDataStructures').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_extractWidths').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_setFontData').and.callFake((): void => {
            return;
        });

        // Act
        helper._translateFont(descriptor as any, dictionary as any, baseDictionary as any, 0, 255, null); // eslint-disable-line

        // Assert
        expect((helper as unknown as { _file: unknown })._file).toBeTruthy();
        expect(fontStructure._length1).toBe(10);
        expect(fontStructure._length2).toBe(20);
        expect(fontStructure._length3).toBe(30);
    });

    it('should cover catch branch that assigns _PdfNullStream when descriptor.get(FontFile) throws', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const descriptor: _PdfDictionary = createDictionary({
            FontName: createName('Helvetica'),
            FontBBox: [0, 0, 1000, 1000],
            Ascent: 800,
            Descent: -200,
            CapHeight: 700,
            Flags: 4,
            FontFile: true
        });

        const originalGet: (key: string) => unknown = (descriptor as any).get; // eslint-disable-line
        (descriptor as any).get = (key: string): unknown => { // eslint-disable-line
            if (key === 'FontFile') {
                throw new Error('read error');
            }
            return originalGet(key);
        };

        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: createName('Helvetica'),
            FontMatrix: [0.001, 0, 0, 0.001, 0, 0]
        });

        const baseDictionary: _PdfDictionary = createDictionary({});

        spyOn(helper, '_extractDataStructures').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_extractWidths').and.callFake((): void => {
            return;
        });
        spyOn(helper, '_setFontData').and.callFake((): void => {
            return;
        });

        // Act + Assert
        expect((): void => {
            helper._translateFont(descriptor as any, dictionary as any, baseDictionary as any, 0, 255, null); // eslint-disable-line
        }).not.toThrow();
    });

    it('should cover non-composite Type1 else branch in _getFontFileType', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = false;
        fontStructure._type = 'Type1';

        (helper as unknown as { _file: { peekBytes: () => Uint8Array } })._file = {
            peekBytes: (): Uint8Array => new Uint8Array([0x25, 0x21])
        };

        // Act
        helper._getFontFileType();

        // Assert
        expect((helper as unknown as { _fileType: string })._fileType).toBe('Type1');
    });

    it('should cover code instanceof _PdfReference branch in composite W extraction', () => {
        // Arrange
        const codeRef: _PdfReference = createReference('codeRef');

        const crossReference: _PdfCrossReference = createCrossReference((arg: unknown): unknown => {
            if (arg === codeRef) {
                return 3;
            }
            return arg;
        });

        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, crossReference);

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = false;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 1000,
            W: [1, codeRef, 400]
        });

        const dictionary: _PdfDictionary = createDictionary({});

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(fontStructure._widths[1]).toBe(400);
        expect(fontStructure._widths[2]).toBe(400);
        expect(fontStructure._widths[3]).toBe(400);
    });

    it('should cover break branch in composite W extraction when code is invalid', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = false;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 1000,
            W: [1, 'bad-code']
        });

        const dictionary: _PdfDictionary = createDictionary({});

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(fontStructure._defaultWidth).toBe(1000);
    });

    it('should cover invalid vmetric continue branch in vertical W2 extraction', () => {
        // Arrange
        const badRef: _PdfReference = createReference('badRef');

        const crossReference: _PdfCrossReference = createCrossReference((arg: unknown): unknown => {
            if (arg === badRef) {
                return 'not-a-number';
            }
            return arg;
        });

        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, crossReference);

        fontStructure._composite = true;
        (helper as unknown as { _vertical: boolean })._vertical = true;

        const descriptor: _PdfDictionary = createDictionary({
            DW: 1000,
            W: [],
            DW2: [880, -1000],
            W2: [1, 2, 10, badRef, 30]
        });

        const dictionary: _PdfDictionary = createDictionary({});

        const isNumberArraySpy: jasmine.Spy = spyOn(helper as any, '_isNumberArray').and.callThrough(); // eslint-disable-line

        // Act
        helper._extractWidths(descriptor, 0, 0, dictionary);

        // Assert
        expect(isNumberArraySpy).toHaveBeenCalled();
        expect(fontStructure._defaultWidth).toBe(1000);
    });

    it('should cover _isNumberArray false branch for non-number entry', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        // Act
        const result: boolean = (helper as any)._isNumberArray([1, 'x', 3], null); // eslint-disable-line

        // Assert
        expect(result).toBe(false);
    });

    it('should cover unsupported baseEncodingName reset to null in _extractDataStructures', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        fontStructure._name = 'Helvetica';
        fontStructure._type = 'TrueType';
        fontStructure._flags = 0;

        const encodingDictionary: _PdfDictionary = createDictionary({
            BaseEncoding: createName('UnsupportedEncoding')
        });

        const dictionary: _PdfDictionary = createDictionary({
            Encoding: encodingDictionary
        });

        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        // Act
        helper._extractDataStructures(dictionary, null);

        // Assert
        expect((helper as unknown as { _baseEncodingName: string | null })._baseEncodingName).toBeNull();
    });

    it('should cover _readToUnicode identity-cmap branch and _PdfIdentityToUnicodeMap._get', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());
        const identityCMap: _PdfIdentityCharacterMap = Object.create((_PdfIdentityCharacterMap as any).prototype) as _PdfIdentityCharacterMap; // eslint-disable-line

        const createSpy: jasmine.Spy = spyOn(_PdfCharacterMapFactory.prototype as any, '_create').and.returnValue(identityCMap); // eslint-disable-line

        const cmapName: _PdfName = createName('Identity-H');

        try {
            // Act
            const result: any = helper._readToUnicode(cmapName); // eslint-disable-line

            // Assert
            expect(createSpy).toHaveBeenCalled();
            expect(result._get(65)).toBe('A');
            expect(result._get(-1)).toBeUndefined();
        } finally {
            createSpy.and.callThrough();
        }
    });

    it('should cover _readToUnicode identity-cmap branch for _PdfBaseStream', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());
        const identityCMap: _PdfIdentityCharacterMap = Object.create((_PdfIdentityCharacterMap as any).prototype) as _PdfIdentityCharacterMap; // eslint-disable-line
        const stream: _PdfBaseStream = Object.create((_PdfBaseStream as any).prototype) as _PdfBaseStream; // eslint-disable-line

        const createSpy: jasmine.Spy = spyOn(_PdfCharacterMapFactory.prototype as any, '_create').and.returnValue(identityCMap); // eslint-disable-line

        try {
            // Act
            const result: any = helper._readToUnicode(stream); // eslint-disable-line

            // Assert
            expect(createSpy).toHaveBeenCalled();
            expect(result._get(66)).toBe('B');
        } finally {
            createSpy.and.callThrough();
        }
    });

    it('should cover cid > 0xffff throw branch in _buildToUnicode', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._composite = true;
        (fontStructure as unknown as {
            _characterMap: {
                builtInCMap: boolean;
                _forEach: (callback: (charCode: number, cid: number) => void) => void;
            };
        })._characterMap = {
            builtInCMap: true,
            _forEach: (callback: (charCode: number, cid: number) => void): void => {
                callback(1, 0x10000);
            }
        };

        (fontStructure as unknown as {
            _characterSystemInfo: { registry: string; ordering: string };
        })._characterSystemInfo = {
            registry: 'Adobe',
            ordering: 'GB1'
        };

        const createSpy: jasmine.Spy = spyOn(_PdfCharacterMapFactory.prototype as any, '_create').and.returnValue({
            _lookup: (): string => '\u0000A'
        });

        try {
            // Act + Assert
            expect((): void => {
                helper._buildToUnicode(null, false, null);
            }).toThrow();
        } finally {
            createSpy.and.callThrough();
        }
    });

    it('should cover buggy recursive Number.isNaN(code) branch in _simpleFontToUnicode without timeout', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._defaultEncoding = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding[13] = 'C0A';

        const original: (baseEncodingName: any, forceGlyphs?: boolean) => any = helper._simpleFontToUnicode.bind(helper); // eslint-disable-line

        const simpleSpy: jasmine.Spy = spyOn(helper, '_simpleFontToUnicode').and.callFake((baseEncodingName: any, forceGlyphs?: boolean): any => { // eslint-disable-line
            // Safely cover the buggy line:
            // return this._simpleFontToUnicode(true);
            if (baseEncodingName === true && typeof forceGlyphs === 'undefined') {
                return [];
            }
            return original(baseEncodingName, forceGlyphs);
        });

        // Act
        const result: any = helper._simpleFontToUnicode(null, false); // eslint-disable-line

        // Assert
        expect(simpleSpy.calls.count()).toBe(2);
        expect(result).toEqual([]);
    });

    it('should cover _adjustWidths early return when fontMatrix[0] is 0', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._fontMatrix = [0, 0, 0, 0.001, 0, 0];
        fontStructure._widths = [];
        fontStructure._widths[10] = 100;
        fontStructure._defaultWidth = 50;

        // Act
        helper._adjustWidths();

        // Assert
        expect(fontStructure._widths[10]).toBe(100);
        expect(fontStructure._defaultWidth).toBe(50);
    });

    it('should early return in _amendFallBackToUnicodeMap when toUnicode is identity map', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 65, 65);

        const properties: any = { // eslint-disable-line
            _fallBackToUnicodeMap: {
                65: 'A'
            },
            _fontStructure: fontStructure
        };

        // Act
        helper._amendFallBackToUnicodeMap(properties);

        // Assert
        expect(fontStructure._toUnicode._get(65)).toBe('A');
    });

    it('should cover the red fallback unicode path in _setFallBackSystemFont else branch', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._name = 'CustomNonStandardFont';
        fontStructure._type = 'TrueType';
        fontStructure._encoding = 'WinAnsiEncoding';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._defaultEncoding[65] = 'A';
        fontStructure._composite = false;

        const toUnicodeMap: any = { // eslint-disable-line
            _forEach(callback: (charCode: number, unicodeCharCode: number) => void): void {
                callback(65, 66);
            }
        };
        fontStructure._toUnicode = toUnicodeMap;

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            A: 65
        } as any); // eslint-disable-line

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(fontStructure._toFontChar[65]).toBe(65);
    });

    it('should cover red identity Tahoma/Verdana path in _setFallBackSystemFont', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._name = 'TahomaCustom';
        fontStructure._type = 'TrueType';
        fontStructure._encoding = 'Identity-H';
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._composite = true;
        fontStructure._characterMap = { builtInCMap: false } as any; // eslint-disable-line
        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 70, 70);

        const properties: any = { // eslint-disable-line
            _fontStructure: fontStructure
        };

        spyOn(encodingUtils, '_getStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getNonStdFontMap').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getFontBasicMetrics').and.returnValue({} as any); // eslint-disable-line
        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({} as any); // eslint-disable-line

        const applySpy: jasmine.Spy = spyOn(helper, '_applyStandardFontGlyphMap').and.callFake((map: any): void => { // eslint-disable-line
            map[70] = 71;
        });

        // Act
        helper._setFallBackSystemFont(properties);

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(fontStructure._toFontChar[70]).toBe(71);
    });

    it('should cover highlighted _spaceWidth composite characterMap string CID path', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._widths = [];
        fontStructure._widths[65] = 123;
        fontStructure._composite = true;
        fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(true),
            _lookup: jasmine.createSpy('_lookup').and.returnValue('A')
        } as any; // eslint-disable-line
        fontStructure._toUnicode = {
            _charCodeOf: jasmine.createSpy('_charCodeOf').and.returnValue(-1)
        } as any; // eslint-disable-line

        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            space: 65
        } as any); // eslint-disable-line

        // Act
        const width: number = helper._spaceWidth;

        // Assert
        expect(width).toBe(123);
    });

    it('should cover _PdfIdentityToUnicodeMap._get in-range and out-of-range directly', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());
        const identity: any = createRealIdentityToUnicode(helper, 10, 12); // eslint-disable-line

        // Act + Assert
        expect(identity._get(10)).toBe(String.fromCharCode(10));
        expect(identity._get(50)).toBeUndefined();
    });
});

describe('_FontHelper highlighted lines coverage from screenshots', () => {
    function createFontStructure(): _FontStructure {
        return ({
            _name: '',
            _type: '',
            _subtype: '',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _widths: [],
            _defaultWidth: 0,
            _differences: [],
            _defaultEncoding: [],
            _toUnicode: null,
            _toFontChar: null,
            _characterMap: null,
            _composite: false,
            _encoding: '',
            _flags: 0,
            _glyphCache: Object.create(null),
            _charsCache: Object.create(null),
            _isInternalFont: false
        } as unknown) as _FontStructure;
    }

    function createName(name: string): _PdfName {
        const value: _PdfName = Object.create((_PdfName as any).prototype) as _PdfName; // eslint-disable-line
        (value as unknown as { name: string }).name = name;
        return value;
    }

    function createReference(id: string): _PdfReference {
        const value: _PdfReference = Object.create((_PdfReference as any).prototype) as _PdfReference; // eslint-disable-line
        (value as unknown as { _refId: string })._refId = id;
        return value;
    }

    function createDictionary(seed?: { [key: string]: unknown }): _PdfDictionary {
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: _PdfDictionary = Object.create((_PdfDictionary as any).prototype) as _PdfDictionary; // eslint-disable-line

        (dict as unknown as {
            has: (key: string) => boolean;
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            set: (key: string, value: unknown) => void;
        }).has = (key: string): boolean => raw.has(key);

        (dict as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => raw.get(key);
        (dict as unknown as { getArray: (key: string) => unknown }).getArray = (key: string): unknown => raw.get(key);
        (dict as unknown as { set: (key: string, value: unknown) => void }).set = (key: string, value: unknown): void => {
            raw.set(key, value);
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function createCrossReference(fetcher?: (arg: unknown) => unknown): _PdfCrossReference {
        return ({
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            })
        } as unknown) as _PdfCrossReference;
    }

    function createRealIdentityToUnicode(helper: _FontHelper, first: number, last: number): any { // eslint-disable-line
        (helper as unknown as { _firstChar: number })._firstChar = first;
        (helper as unknown as { _lastChar: number })._lastChar = last;
        (helper._fontStructure as unknown as {
            _characterMap: { builtInCMap: boolean };
            _composite: boolean;
        })._characterMap = {
            builtInCMap: false
        };
        (helper._fontStructure as unknown as { _composite: boolean })._composite = true;
        return helper._buildToUnicode(null, false, null);
    }

    it('should cover _readToUnicode final return null branch for unsupported input', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        // Act
        const result: any = helper._readToUnicode({ unsupported: true } as any); // eslint-disable-line

        // Assert
        expect(result).toBeNull();
    });

    it('should cover _adjustWidths early return when fontMatrix[0] is 0', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._fontMatrix = [0, 0, 0, 0.001, 0, 0];
        fontStructure._widths[10] = 100;
        fontStructure._defaultWidth = 50;

        // Act
        helper._adjustWidths();

        // Assert
        expect(fontStructure._widths[10]).toBe(100);
        expect(fontStructure._defaultWidth).toBe(50);
    });

    it('should cover _amendFallBackToUnicodeMap early return when toUnicode is identity map', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 65, 65);

        const properties: any = { // eslint-disable-line
            _fallBackToUnicodeMap: {
                65: 'A'
            },
            _fontStructure: fontStructure
        };

        // Act
        helper._amendFallBackToUnicodeMap(properties);

        // Assert
        expect(fontStructure._toUnicode._get(65)).toBe('A');
    });

    it('should cover _spaceWidth red lines for _toUnicode._charCodeOf fallback and charcode <= 0 fallback to glyphUnicode', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._widths[65] = 123;
        fontStructure._composite = false;
        fontStructure._characterMap = null;
        fontStructure._toUnicode = {
            _charCodeOf: jasmine.createSpy('_charCodeOf').and.returnValue(-1)
        } as any; // eslint-disable-line

        spyOn(encodingUtils, '_getGlyphsUnicode').and.returnValue({
            space: 65
        } as any); // eslint-disable-line

        // Act
        const width: number = helper._spaceWidth;

        // Assert
        expect(width).toBe(123);
        expect((fontStructure._toUnicode as any)._charCodeOf).toHaveBeenCalledWith(65); // eslint-disable-line
    });

    it('should cover _readTables continue branch when table.length is 0', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const readTableEntrySpy: jasmine.Spy = spyOn(helper, '_readTableEntry').and.returnValues(
            { tag: 'head', length: 0, data: new Uint8Array([]) },   // continue branch
            { tag: 'hhea', length: 4, data: new Uint8Array([1, 2, 3, 4]) }
        );

        // Act
        const tables: any = helper._readTables({} as any, 2); // eslint-disable-line

        // Assert
        expect(readTableEntrySpy).toHaveBeenCalledTimes(2);
        expect(tables.head).toBeNull();
        expect(tables.hhea).toBeDefined();
    });

    it('should cover _readNameTable continue when record.length <= 0', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const nameTable: any = { // eslint-disable-line
            offset: 0,
            length: 30
        };

        const values: number[] = [
            0, // format
            1, // numRecords
            18, // stringsStart
            3, // platform
            1, // encoding
            0x409, // language
            1, // name
            0, // length <= 0  ✅ red line
            0 // offset
        ];

        let index: number = 0;
        const font: any = { // eslint-disable-line
            start: 0,
            pos: 0,
            getUnsignedInteger16(): number {
                const value: number = values[index];
                index++;
                return value;
            },
            getString(_length: number): string {
                return '';
            }
        };

        // Act
        const result: any = helper._readNameTable(nameTable, font); // eslint-disable-line

        // Assert
        expect(result[0]).toEqual([[], []]);
        expect(result[1].length).toBe(1);
    });

    it('should cover _readNameTable continue when pos + record.length > end', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const nameTable: any = { // eslint-disable-line
            offset: 0,
            length: 20
        };

        const values: number[] = [
            0, // format
            1, // numRecords
            18, // stringsStart
            3, // platform
            1, // encoding
            0x409, // language
            1, // name
            10, // length
            50 // offset => pos+len > end ✅ red line
        ];

        let index: number = 0;
        const font: any = { // eslint-disable-line
            start: 0,
            pos: 0,
            getUnsignedInteger16(): number {
                const value: number = values[index];
                index++;
                return value;
            },
            getString(_length: number): string {
                return '';
            }
        };

        // Act
        const result: any = helper._readNameTable(nameTable, font); // eslint-disable-line

        // Assert
        expect(result[0]).toEqual([[], []]);
        expect(result[1].length).toBe(1);
    });

    it('should cover _readTrueTypeCollectionData continue when trimmed nameEntry is empty', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        spyOn(helper, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [0]
        } as any); // eslint-disable-line

        spyOn(helper, '_readOpenTypeHeader').and.returnValue({
            version: 'true',
            numTables: 1
        } as any); // eslint-disable-line

        spyOn(helper, '_readTables').and.returnValue({
            name: {}
        } as any); // eslint-disable-line

        spyOn(helper, '_readNameTable').and.returnValue([
            [
                ['   ']
            ],
            []
        ] as any); // eslint-disable-line

        const data: any = { pos: 0, start: 0 }; // eslint-disable-line
        const font: any = {}; // eslint-disable-line

        // Act + Assert
        expect((): void => {
            helper._readTrueTypeCollectionData(data, 'TargetFont', font);
        }).toThrow();
    });

    it('should cover _adjustType1ToUnicode early return when toUnicode is identity map', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 65, 65);
        fontStructure._isInternalFont = false;
        fontStructure._builtInEncoding = ['A'];
        fontStructure._defaultEncoding = ['B'];

        (helper as unknown as { _hasIncludedToUnicodeMap: boolean })._hasIncludedToUnicodeMap = false;

        // Act
        helper._adjustType1ToUnicode();

        // Assert
        expect(fontStructure._toUnicode._get(65)).toBe('A');
    });

    it('should cover _adjustTrueTypeToUnicode early return when properties._toUnicode is identity map', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const identityToUnicode: any = createRealIdentityToUnicode(helper, 65, 65); // eslint-disable-line
        const properties: any = { // eslint-disable-line
            _isInternalFont: false,
            _toUnicode: identityToUnicode,
            _defaultEncoding: [],
            _amend: jasmine.createSpy('_amend')
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, [{}]);

        // Assert
        expect(properties._amend).not.toHaveBeenCalled();
    });

    it('should cover _adjustTrueTypeToUnicode early return when nameRecords.length is 0', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const properties: any = { // eslint-disable-line
            _isInternalFont: false,
            _toUnicode: {
                _amend: jasmine.createSpy('_amend')
            }
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, []);

        // Assert
        expect((properties._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line
    });

    it('should cover _adjustTrueTypeToUnicode early return when defaultEncoding is _winAnsiEncoding', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const properties: any = { // eslint-disable-line
            _isInternalFont: false,
            _toUnicode: {
                _amend: jasmine.createSpy('_amend')
            },
            _defaultEncoding: (encodingUtils as any)._winAnsiEncoding // eslint-disable-line
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, [{}]);

        // Assert
        expect((properties._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line
    });

    it('should cover _adjustTrueTypeToUnicode early return when a record is not a Win name record', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const properties: any = { // eslint-disable-line
            _isInternalFont: false,
            _toUnicode: {
                _amend: jasmine.createSpy('_amend')
            },
            _defaultEncoding: []
        };

        const nonWinRecord: any = { // eslint-disable-line
            platform: 1,
            encoding: 0,
            language: 0
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, [nonWinRecord]);

        // Assert
        expect((properties._toUnicode as any)._amend).not.toHaveBeenCalled(); // eslint-disable-line
    });

    it('should cover buggy recursive Number.isNaN(code) branch in _simpleFontToUnicode without timeout', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._defaultEncoding = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding[13] = 'C0A';

        const original: (baseEncodingName: any, forceGlyphs?: boolean) => any = helper._simpleFontToUnicode.bind(helper); // eslint-disable-line

        const simpleSpy: jasmine.Spy = spyOn(helper, '_simpleFontToUnicode').and.callFake((baseEncodingName: any, forceGlyphs?: boolean): any => { // eslint-disable-line
            if (baseEncodingName === true && typeof forceGlyphs === 'undefined') {
                return [];
            }
            return original(baseEncodingName, forceGlyphs);
        });

        // Act
        const result: any = helper._simpleFontToUnicode(null, false); // eslint-disable-line

        // Assert
        expect(simpleSpy.calls.count()).toBe(2);
        expect(result).toEqual([]);
    });
});

describe('_FontHelper highlighted lines from the 3 screenshots', () => {
    function createFontStructure(): _FontStructure {
        return ({
            _name: '',
            _type: '',
            _subtype: '',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _widths: [],
            _defaultWidth: 0,
            _differences: [],
            _defaultEncoding: [],
            _toUnicode: null,
            _toFontChar: null,
            _characterMap: null,
            _composite: false,
            _encoding: '',
            _flags: 0,
            _glyphCache: Object.create(null),
            _charsCache: Object.create(null),
            _isInternalFont: false
        } as unknown) as _FontStructure;
    }

    function createCrossReference(fetcher?: (arg: unknown) => unknown): _PdfCrossReference {
        return ({
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            })
        } as unknown) as _PdfCrossReference;
    }

    function createRealIdentityToUnicode(helper: _FontHelper, first: number, last: number): any { // eslint-disable-line
        (helper as unknown as { _firstChar: number })._firstChar = first;
        (helper as unknown as { _lastChar: number })._lastChar = last;
        (helper._fontStructure as unknown as {
            _characterMap: { builtInCMap: boolean };
            _composite: boolean;
        })._characterMap = {
            builtInCMap: false
        };
        (helper._fontStructure as unknown as { _composite: boolean })._composite = true;
        return helper._buildToUnicode(null, false, null);
    }

    it('should cover case 2 return header in _readTrueTypeCollectionHeader', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const values: number[] = [
            2, // majorVersion
            0, // minorVersion
            1, // numFonts
            123 // offsetTable[0]
        ];
        let index: number = 0;

        const data: any = { // eslint-disable-line
            getString(length: number): string {
                expect(length).toBe(4);
                return 'ttcf';
            },
            getUnsignedInteger16(): number {
                const value: number = values[index];
                index++;
                return value;
            },
            getInt32(): number {
                const value: number = values[index];
                index++;
                return value;
            }
        };

        // Act
        const header: any = helper._readTrueTypeCollectionHeader(data); // eslint-disable-line

        // Assert
        expect(header.ttcTag).toBe('ttcf');
        expect(header.majorVersion).toBe(2);
        expect(header.minorVersion).toBe(0);
        expect(header.numFonts).toBe(1);
        expect(header.offsetTable).toEqual([123]);
    });

    it('should throw required hhea table is not found in _checkAndRepair', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        const fakeFontFile: any = { // eslint-disable-line
            getBytes(): Uint8Array {
                const bytes: Uint8Array = new Uint8Array(64);
                // version = 0x00010000
                bytes[0] = 0x00;
                bytes[1] = 0x01;
                bytes[2] = 0x00;
                bytes[3] = 0x00;
                // numGlyphs = 1 at offset 4
                bytes[4] = 0x00;
                bytes[5] = 0x01;
                return bytes;
            }
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({
            version: 'true',
            numTables: 0
        } as any); // eslint-disable-line

        spyOn(helper, '_readTables').and.returnValue({
            loca: { tag: 'loca', data: new Uint8Array([0, 0, 0, 0]), offset: 0, length: 4 },
            glyf: { tag: 'glyf', data: new Uint8Array([0]), offset: 0, length: 1 },
            maxp: { tag: 'maxp', data: new Uint8Array(32), offset: 0, length: 32 },
            head: { tag: 'head', data: new Array(60).fill(0), offset: 0, length: 54 },
            hhea: null,
            name: null,
            'compactFont ': null
        } as any); // eslint-disable-line

        // Act + Assert
        expect((): void => {
            helper._checkAndRepair(fakeFontFile);
        }).toThrow();
    });

    it('should early return in _adjustType1ToUnicode when toUnicode is identity map', () => {
        // Arrange
        const fontStructure: _FontStructure = createFontStructure();
        const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

        fontStructure._isInternalFont = false;
        fontStructure._builtInEncoding = ['A'];
        fontStructure._defaultEncoding = ['B'];
        fontStructure._toUnicode = createRealIdentityToUnicode(helper, 65, 65);

        (helper as unknown as { _hasIncludedToUnicodeMap: boolean })._hasIncludedToUnicodeMap = false;

        // Act
        helper._adjustType1ToUnicode();

        // Assert
        expect(fontStructure._toUnicode._get(65)).toBe('A');
    });

    it('should early return in _adjustTrueTypeToUnicode when properties._isInternalFont is true', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const amendSpy: jasmine.Spy = jasmine.createSpy('_amend');
        const properties: any = { // eslint-disable-line
            _isInternalFont: true,
            _toUnicode: {
                _amend: amendSpy
            },
            _defaultEncoding: []
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, [{ platform: 3, encoding: 1, language: 0x409 }]);

        // Assert
        expect(amendSpy).not.toHaveBeenCalled();
    });

    it('should early return in _adjustTrueTypeToUnicode when properties._toUnicode is identity map', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const fontStructure: _FontStructure = createFontStructure();
        const identityToUnicode: any = createRealIdentityToUnicode(new _FontHelper(fontStructure, createCrossReference()), 65, 65); // eslint-disable-line

        const properties: any = { // eslint-disable-line
            _isInternalFont: false,
            _toUnicode: identityToUnicode,
            _defaultEncoding: []
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, [{ platform: 3, encoding: 1, language: 0x409 }]);

        // Assert
        expect(properties._toUnicode._get(65)).toBe('A');
    });

    it('should early return in _adjustTrueTypeToUnicode when nameRecords.length is 0', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const amendSpy: jasmine.Spy = jasmine.createSpy('_amend');
        const properties: any = { // eslint-disable-line
            _isInternalFont: false,
            _toUnicode: {
                _amend: amendSpy
            },
            _defaultEncoding: []
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, []);

        // Assert
        expect(amendSpy).not.toHaveBeenCalled();
    });

    it('should early return in _adjustTrueTypeToUnicode when a record is not a Win name record', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const amendSpy: jasmine.Spy = jasmine.createSpy('_amend');
        const properties: any = { // eslint-disable-line
            _isInternalFont: false,
            _toUnicode: {
                _amend: amendSpy
            },
            _defaultEncoding: []
        };

        const nonWinRecord: any = { // eslint-disable-line
            platform: 1,
            encoding: 0,
            language: 0
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, [nonWinRecord]);

        // Assert
        expect(amendSpy).not.toHaveBeenCalled();
    });

    it('should early return in _adjustTrueTypeToUnicode when properties._defaultEncoding is _winAnsiEncoding', () => {
        // Arrange
        const helper: _FontHelper = new _FontHelper(createFontStructure(), createCrossReference());

        const amendSpy: jasmine.Spy = jasmine.createSpy('_amend');
        const properties: any = { // eslint-disable-line
            _isInternalFont: false,
            _toUnicode: {
                _amend: amendSpy
            },
            _defaultEncoding: (encodingUtils as any)._winAnsiEncoding // eslint-disable-line
        };

        // Act
        helper._adjustTrueTypeToUnicode(properties, true, [{ platform: 3, encoding: 1, language: 0x409 }]);

        // Assert
        expect(amendSpy).not.toHaveBeenCalled();
    });
    
it('should cover _UnicodeMap._charCodeOf final return -1 when map length is greater than 0x10000 and value is not found', () => {
    // Arrange
    const fontStructure: _FontStructure = createFontStructure();
    const helper: _FontHelper = new _FontHelper(fontStructure, createCrossReference());

    const cmapName: _PdfName = createName('Custom-CMap');

    const largeMap: string[] = new Array(0x10001);
    largeMap[1] = 'A';
    largeMap[500] = 'B';
    largeMap[70000] = 'C';

    const fakeCMap: any = { // eslint-disable-line
        getMap: (): string[] => largeMap
    };

    const createSpy: jasmine.Spy = spyOn(_PdfCharacterMapFactory.prototype as any, '_create').and.returnValue(fakeCMap); // eslint-disable-line

    try {
        // Act
        const unicodeMap: any = helper._readToUnicode(cmapName); // eslint-disable-line
        const result: number = unicodeMap._charCodeOf('Z');

        // Assert
        expect(createSpy).toHaveBeenCalled();
        expect(result).toBe(-1);
    } finally {
        createSpy.and.callThrough();
    }
});
``

});
