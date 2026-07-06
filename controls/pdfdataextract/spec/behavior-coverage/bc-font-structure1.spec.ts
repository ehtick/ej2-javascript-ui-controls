import {
    _PdfBaseStream,
    _PdfDictionary,
    _PdfName,
    _PdfReference,
    _PdfStream,
    PdfFontStyle
} from '@syncfusion/ej2-pdf';
import * as metricsModule from '../../src/pdf-data-extract/core/text-extraction/metrics';
  function createDictionary(values: Record<string, unknown>): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype);

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).get = function (key: string): unknown {
            return values[key];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).getArray = function (key: string): unknown[] {
            const value: unknown = values[key];
            return Array.isArray(value) ? value : [];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).has = function (key: string): boolean {
            return key in values;
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).set = function (key: string, value: unknown): void {
            values[key] = value;
        };

        return dictionary;
    }

describe('_font-structure highlighted coverage AAA complete', () => {
    function createReference(value: unknown): _PdfReference {
        const reference: _PdfReference & { _value?: unknown } = Object.create(_PdfReference.prototype);
        reference._value = value;
        return reference as _PdfReference;
    }

    function createDictionary(values: Record<string, unknown>): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype);

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).get = function (key: string): unknown {
            return values[key];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).getArray = function (key: string): unknown[] {
            const value: unknown = values[key];
            return Array.isArray(value) ? value : [];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).has = function (key: string): boolean {
            return key in values;
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).set = function (key: string, value: unknown): void {
            values[key] = value;
        };

        return dictionary;
    }

    function createCrossReference(): { _fetch: jasmine.Spy } {
        return {
            _fetch: jasmine.createSpy('_fetch').and.callFake(function (value: unknown): unknown {
                const reference: _PdfReference & { _value?: unknown } =
                    value as _PdfReference & { _value?: unknown };
                if (reference && typeof reference === 'object' && '_value' in reference) {
                    return reference._value;
                }
                return value;
            })
        };
    }

    function createFontStructureOverload(): _FontStructure {
        const fontStructure: _FontStructure = Object.create(_FontStructure.prototype) as _FontStructure;
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._glyphCache = Object.create(null);
        fontStructure._charsCache = Object.create(null);
        fontStructure._fontMatrix = [0.001, 0, 0, 0.001, 0, 0];
        fontStructure._toUnicode = {
            _get: function (code: number): number {
                return code;
            },
            _has: function (): boolean {
                return false;
            },
            _amend: jasmine.createSpy('_amend'),
            _charCodeOf: function (value: number): number {
                return value;
            },
            _forEach: function (): void {
                // no-op
            },
            _length: 0
        } as never;
        fontStructure._characterMap = {
            _contains: function (): boolean {
                return false;
            },
            _lookup: function (): number {
                return 0;
            },
            builtInCMap: false,
            _vertical: false
        } as never;
        fontStructure._type = 'Type1';
        fontStructure._name = 'Helvetica';
        fontStructure._flags = 0;
        fontStructure._composite = false;
        fontStructure._isInternalFont = false;
        fontStructure._isSymbolicFont = false;
        fontStructure._encoding = '';
        fontStructure._defaultWidth = 0;
        fontStructure._missingFile = false;
        fontStructure._lineHeight = 0;
        fontStructure._capHeight = NaN;
        fontStructure._ascent = NaN;
        fontStructure._descent = NaN;
        fontStructure._fontStyle = PdfFontStyle.regular;
        fontStructure._subtype = '';
        return fontStructure;
    }

    function createHelper(): _FontHelper {
        const fontStructure: _FontStructure = createFontStructureOverload();
        return new _FontHelper(fontStructure, createCrossReference() as never);
    }

    function getThrownMessage(action: () => void): string {
        let message: string = '';
        try {
            action();
        } catch (error) {
            const thrown: { message?: string } = error as { message?: string };
            if (thrown && typeof thrown.message === 'string') {
                message = thrown.message;
            }
        }
        return message;
    }

    it('should cover _simpleFontToUnicode forceGlyphs branch and _string32, _buildToFontChar, _getUnicodeForGlyph branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._defaultEncoding = ['c2A'];
        helper._fontStructure._differences = [];

        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({} as never);

        // Act
        const forceGlyphResult: any = helper._simpleFontToUnicode(null, true);

        const string32Result: string = helper._string32(0x01020304);
        const toFontCharResult: any = helper._buildToFontChar(
            ['uni0041', '', 'u0042'],
            {},
            { 10: 'uni0043' }
        );

        const directNumericGlyphResult: number = helper._getUnicodeForGlyph('65', { 65: 65 });
        const uniGlyphResult: number = helper._getUnicodeForGlyph('uni0041', {});
        const shortUGlyphResult: number = helper._getUnicodeForGlyph('u0041', {});
        const invalidLowercaseGlyphResult: number = helper._getUnicodeForGlyph('u00ff', {});
        const emptyGlyphResult: number = helper._getUnicodeForGlyph('', {});

        // Assert
        expect(forceGlyphResult[0]).toBe('*');

        expect(string32Result.length).toBe(4);

        expect(toFontCharResult[0]).toBe(65);
        expect(toFontCharResult[2]).toBe(66);
        expect(toFontCharResult[10]).toBe(67);

        expect(directNumericGlyphResult).toBe(65);
        expect(uniGlyphResult).toBe(65);
        expect(shortUGlyphResult).toBe(65);
        expect(invalidLowercaseGlyphResult).toBe(-1);
        expect(emptyGlyphResult).toBe(-1);
    });

    it('should cover _getBaseFontMetrics switch cases and fallback branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({} as never);
        spyOn(helper, '_getMetrics').and.returnValue([
            'Courier',
            'Courier-Bold',
            'Courier-BoldOblique',
            'Courier-Oblique',
            'Helvetica',
            'Helvetica-Bold',
            'Helvetica-BoldOblique',
            'Helvetica-Oblique',
            'Symbol',
            'Times-Roman',
            'Times-Bold',
            'Times-BoldItalic',
            'Times-Italic',
            'ZapfDingbats'
        ] as never);

        spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
            return {
                _courier: { tag: 'courier' },
                _courierBold: { tag: 'courierBold' },
                _courierBoldOblique: { tag: 'courierBoldOblique' },
                _courierOblique: { tag: 'courierOblique' },
                _helveticaWidths: { tag: 'helvetica' },
                _helveticaBold: { tag: 'helveticaBold' },
                _helveticaBoldOblique: { tag: 'helveticaBoldOblique' },
                _helveticaOblique: { tag: 'helveticaOblique' },
                _symbol: 700,
                _timesRoman: { tag: 'timesRoman' },
                _timesBold: { tag: 'timesBold' },
                _timesBoldItalic: { tag: 'timesBoldItalic' },
                _timesItalic: { tag: 'timesItalic' },
                _zapfDingbats: { tag: 'zapf' }
            };
        });

        // Act
        const courierResult: any = helper._getBaseFontMetrics('Courier');
        const courierBoldResult: any = helper._getBaseFontMetrics('Courier-Bold');
        const courierBoldObliqueResult: any = helper._getBaseFontMetrics('Courier-BoldOblique');
        const courierObliqueResult: any = helper._getBaseFontMetrics('Courier-Oblique');
        const helveticaResult: any = helper._getBaseFontMetrics('Helvetica');
        const helveticaBoldResult: any = helper._getBaseFontMetrics('Helvetica-Bold');
        const helveticaBoldObliqueResult: any = helper._getBaseFontMetrics('Helvetica-BoldOblique');
        const helveticaObliqueResult: any = helper._getBaseFontMetrics('Helvetica-Oblique');
        const symbolResult: any = helper._getBaseFontMetrics('Symbol');
        const timesRomanResult: any = helper._getBaseFontMetrics('Times-Roman');
        const timesBoldResult: any = helper._getBaseFontMetrics('Times-Bold');
        const timesBoldItalicResult: any = helper._getBaseFontMetrics('Times-BoldItalic');
        const timesItalicResult: any = helper._getBaseFontMetrics('Times-Italic');
        const zapfResult: any = helper._getBaseFontMetrics('ZapfDingbats');

        // Fallback branches
        const helperSerif: _FontHelper = createHelper();
        const helperSans: _FontHelper = createHelper();

        spyOn(helperSerif, '_getMetrics').and.returnValue(['Helvetica', 'Times-Roman'] as never);
        spyOn(helperSerif, '_isSerifFont').and.returnValue(true);

        spyOn(helperSans, '_getMetrics').and.returnValue(['Helvetica', 'Times-Roman'] as never);
        spyOn(helperSans, '_isSerifFont').and.returnValue(false);

        const serifFallbackResult: any = helperSerif._getBaseFontMetrics('UnknownSerifFont');
        const sansFallbackResult: any = helperSans._getBaseFontMetrics('UnknownSansFont');

        // Assert
        expect(courierResult.widths).toEqual({ tag: 'courier' });
        expect(courierBoldResult.widths).toEqual({ tag: 'courierBold' });
        expect(courierBoldObliqueResult.widths).toEqual({ tag: 'courierBoldOblique' });
        expect(courierObliqueResult.widths).toEqual({ tag: 'courierOblique' });
        expect(helveticaResult.widths).toEqual({ tag: 'helvetica' });
        expect(helveticaBoldResult.widths).toEqual({ tag: 'helveticaBold' });
        expect(helveticaBoldObliqueResult.widths).toEqual({ tag: 'helveticaBoldOblique' });
        expect(helveticaObliqueResult.widths).toEqual({ tag: 'helveticaOblique' });
        expect(symbolResult.defaultWidth).toBe(700);
        expect(symbolResult.monospace).toBeTruthy();
        expect(timesRomanResult.widths).toEqual({ tag: 'timesRoman' });
        expect(timesBoldResult.widths).toEqual({ tag: 'timesBold' });
        expect(timesBoldItalicResult.widths).toEqual({ tag: 'timesBoldItalic' });
        expect(timesItalicResult.widths).toEqual({ tag: 'timesItalic' });
        expect(zapfResult.widths).toEqual({ tag: 'zapf' });

        expect(serifFallbackResult.widths).toEqual({ tag: 'timesRoman' });
        expect(sansFallbackResult.widths).toEqual({ tag: 'helvetica' });
    });

    it('should cover _translateFont highlighted string coercion and invalid font name throw', () => {
        // Arrange
        const helperBaseFontString: _FontHelper = createHelper();

        const descriptorWithoutFontName: _PdfDictionary = createDictionary({
            FontBBox: [0, 0, 10, 10],
            Ascent: 700,
            Descent: -200,
            CapHeight: 600
        });

        const dictionaryStringBaseFont: _PdfDictionary = createDictionary({
            BaseFont: 'Helvetica',
            FontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            FontBBox: [0, 0, 10, 10]
        });

        spyOn(helperBaseFontString, '_extractDataStructures').and.stub();
        spyOn(helperBaseFontString, '_extractWidths').and.stub();
        spyOn(helperBaseFontString, '_setFontData').and.stub();

        // Act
        helperBaseFontString._translateFont(
            descriptorWithoutFontName as never,
            dictionaryStringBaseFont as never,
            dictionaryStringBaseFont as never,
            0,
            255,
            null
        );

        // Assert
        expect(helperBaseFontString._fontStructure._fontMatrix).toEqual([0.001, 0, 0, 0.001, 0, 0]);

        // Arrange
        const helperInvalidFontName: _FontHelper = createHelper();
        const invalidDescriptor: _PdfDictionary = createDictionary({});
        const invalidDictionary: _PdfDictionary = createDictionary({
            BaseFont: 123
        });

        const invalidMessage: string = getThrownMessage(function (): void {
            helperInvalidFontName._translateFont(
                invalidDescriptor as never,
                invalidDictionary as never,
                invalidDictionary as never,
                0,
                255,
                null
            );
        });

        // Assert
        expect(invalidMessage).toBe('invalid font name');
    });

    it('should cover _extractWidths highlighted break, continue and non-number branches safely', () => {
        // Arrange
        const helperBreakContinue: _FontHelper = createHelper();
        helperBreakContinue._fontStructure._composite = true;
        helperBreakContinue._vertical = false;

        const descriptorBreakContinue: _PdfDictionary = createDictionary({
            DW: 500,
            W: [
                'not-an-integer',
                [100],
                5,
                7,
                'not-a-number',
                9,
                { bad: true }
            ]
        });

        // Act
        helperBreakContinue._extractWidths(descriptorBreakContinue, 0, 0, createDictionary({}));

        // Assert
        expect(helperBreakContinue._fontStructure._defaultWidth).toBe(500);

        // Arrange
        const helperContinueRange: _FontHelper = createHelper();
        helperContinueRange._fontStructure._composite = true;
        helperContinueRange._vertical = false;

        const descriptorContinueRange: _PdfDictionary = createDictionary({
            DW: 500,
            W: [
                1,
                3,
                'bad-width'
            ]
        });

        // Act
        helperContinueRange._extractWidths(descriptorContinueRange, 0, 0, createDictionary({}));

        // Assert
        expect(helperContinueRange._fontStructure._widths[1]).toBeUndefined();
        expect(helperContinueRange._fontStructure._widths[2]).toBeUndefined();
        expect(helperContinueRange._fontStructure._widths[3]).toBeUndefined();
    });

    it('should cover highlighted readToUnicode, UnicodeMap and PdfIdentityToUnicodeMap branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        spyOn(_PdfCharacterMapFactory.prototype, '_create').and.returnValues(
            {
                getMap: function (): (string | number)[] {
                    const map: (string | number)[] = [];
                    map[0] = 'A';
                    map[2] = 'B';
                    return map;
                }
            } as never,
            Object.create(_PdfIdentityCharacterMap.prototype) as never,
            {
                _map: new Array(2),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, '\u0000A');
                }
            } as never,
            {
                _map: new Array(1),
                _forEach: function (): void {
                    throw new Error('stream-map-failed');
                }
            } as never
        );

        // Act
        const unicodeMap: any = helper._readToUnicode(_PdfName.get('Any-CMap'));
        const identityMap: any = helper._readToUnicode(_PdfName.get('Identity-H'));

        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const streamResult: any = helper._readToUnicode(streamObject);

        const streamErrorMessage: string = getThrownMessage(function (): void {
            helper._readToUnicode(streamObject);
        });

        const forEachResult = unicodeMap._forEach();
        const hasZero = unicodeMap._has(0);
        const getTwo = unicodeMap._get(2);

        const largeMap: any[] = new Array(0x10001);
        largeMap[70000] = 'Z';
        unicodeMap._map = largeMap;
        const charCodeOfBig = unicodeMap._charCodeOf('Z');

        unicodeMap._map = [];
        unicodeMap._map[0] = 'A';
        unicodeMap._map[2] = 'B';
        const charCodeOfSmall = unicodeMap._charCodeOf('B');

        unicodeMap._amend({ 3: 'C' });
        const amendedValue = unicodeMap._get(3);

        const visited: Array<{ charCode: number; unicode: number }> = [];
        identityMap._forEach(function (charCode: number, unicode: number): void {
            if (charCode < 3) {
                visited.push({ charCode, unicode });
            }
        });

        const identityHasOne = identityMap._has(1);
        const identityGetTwo = identityMap._get(2);
        const identityCharCodeOfTwo = identityMap._charCodeOf(2);
        const identityAmendMessage: string = getThrownMessage(function (): void {
            identityMap._amend();
        });

        // Assert
        expect(streamResult).toBeTruthy();
        expect(streamErrorMessage).toContain('stream-map-failed');

        expect(forEachResult.length).toBe(2);
        expect(forEachResult[0].characterCode).toBe(0);
        expect(hasZero).toBeTruthy();
        expect(getTwo).toBe('B');
        expect(charCodeOfBig).toBe(70000);
        expect(charCodeOfSmall).toBe(2);
        expect(amendedValue).toBe('C');

        expect(identityMap._length).toBe(65536);
        expect(visited[0].charCode).toBe(0);
        expect(visited[1].charCode).toBe(1);
        expect(identityHasOne).toBeTruthy();
        expect(identityGetTwo).toBe(String.fromCharCode(2));
        expect(identityCharCodeOfTwo).toBe(2);
        expect(identityAmendMessage).toContain('Should not call amend()');
    });

    it('should cover highlighted _setFallBackSystemFont, _spaceWidth, _charToGlyph and _convertCidString branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._toUnicode = {
            _has: function (): boolean {
                return false;
            },
            _get: function (): string {
                return '';
            },
            _amend: jasmine.createSpy('_amend'),
            _charCodeOf: function (): number {
                return -1;
            },
            _forEach: function (callback: (charCode: number, unicode: number) => void): void {
                callback(65, 65);
                callback(66, 66);
            },
            _length: 2
        } as never;

        helper._fontStructure._widths = { 65: 500, space: 300 } as never;
        helper._fontStructure._ascent = NaN;
        helper._fontStructure._descent = NaN;
        helper._fontStructure._capHeight = NaN;
        helper._fontStructure._encoding = 'Identity-H';

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({
            Helvetica: 'Helvetica',
            ArialBlack: 'Helvetica',
            Calibri: 'Helvetica',
            Symbol: 'Symbol',
            ZapfDingbats: 'ZapfDingbats'
        } as never);

        spyOn(encodingUtilsModule, '_getNonStdFontMap').and.returnValue({
            Calibri: 'Helvetica'
        } as never);

        spyOn(encodingUtilsModule, '_getFontBasicMetrics').and.returnValue({
            Helvetica: {
                ascent: 700,
                descent: -200,
                capHeight: 600
            },
            Symbol: {
                ascent: 700,
                descent: -200,
                capHeight: 600
            },
            ZapfDingbats: {
                ascent: 700,
                descent: -200,
                capHeight: 600
            }
        } as never);

        spyOn(encodingUtilsModule, '_getGlyphMapForStandardFonts').and.returnValue({ 65: 1 } as never);
        spyOn(encodingUtilsModule, '_getSupplementalGlyphMapForArialBlack').and.returnValue({ 66: 2 } as never);
        spyOn(encodingUtilsModule, '_getFontGlyphMap').and.returnValue({ 67: 3 } as never);
        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66, space: 32 } as never);
        spyOn(encodingUtilsModule, '_getDingbatsGlyphsUnicode').and.returnValue({ a1: 0x2701 } as never);
        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            if (glyphName === 'A') {
                return 65;
            }
            if (glyphName === 'B') {
                return 66;
            }
            return -1;
        });

        spyOn(helper, '_buildToFontChar').and.callFake(function (encoding: string[]): number[] {
            const map: number[] = [];
            if (encoding === encodingUtilsModule._symbolSetEncoding) {
                map[65] = 1000;
            } else if (encoding === encodingUtilsModule._zapfDingbatsEncoding) {
                map[66] = 2000;
            } else {
                map[67] = 3000;
            }
            return map;
        });

        const properties = {
            cidToGidMap: [undefined, 10, 20, 30],
            hasIncludedToUnicodeMap: true,
            _fallBackToUnicodeMap: null as never
        };

        // Act
        helper._fontStructure._name = 'ArialBlack';
        helper._fontStructure._type = 'CIDFontType2';
        helper._fontStructure._composite = true;
        helper._setFallBackSystemFont(properties as never);

        helper._fontStructure._name = 'Symbol';
        helper._fontStructure._type = 'Type1';
        helper._fontStructure._composite = false;
        helper._setFallBackSystemFont(properties as never);

        helper._fontStructure._name = 'ZapfDingbats';
        helper._setFallBackSystemFont(properties as never);

        helper._fontStructure._name = 'Helvetica';
        helper._setFallBackSystemFont(properties as never);

        helper._fontStructure._defaultWidth = 0;
        helper._fontStructure._differences = [];
        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[66] = '';
        helper._fontStructure._glyphCache = Object.create(null);
        helper._fontStructure._glyphCache[65] = {
            isSpace: false,
            marker: true
        } as never;
        helper._fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(false),
            _lookup: jasmine.createSpy('_lookup')
        } as never;
        helper._fontStructure._missingFile = true;
        helper._fontStructure._type = 'Type1';
        helper._standardCharacter = {
            66: {
                accentFontCharCode: 769,
                accentOffset: 10
            }
        };

        const spaceWidth: number = helper._spaceWidth;
        const cachedGlyph = helper._charToGlyph(65, false) as any;
        const glyphTwo: any = helper._charToGlyph(66, false);

        const cidOne: number = helper._convertCidString(1, 'A');
        const cidTwo: number = helper._convertCidString(1, 'AB');
        const cidFallback: string = helper._convertCidString(1, 'ABC');
        const cidThrowMessage: string = getThrownMessage(function (): void {
            helper._convertCidString(1, 'ABC', true);
        });

        // Assert
        expect(helper._fontStructure._missingFile).toBeTruthy();
        expect(helper._fontStructure._ascent).toBe(0.7);
        expect(helper._fontStructure._descent).toBe(-0.2);
        expect(helper._fontStructure._capHeight).toBe(0.6);
        expect(helper._fontStructure._toFontChar).toBeDefined();

        expect(spaceWidth).toBe(300);
        expect(cachedGlyph.marker).toBeTruthy();
        expect(glyphTwo._accent.fontChar).toBe(String.fromCodePoint(769));
        expect(glyphTwo._accent.offset).toBe(10);
        expect(glyphTwo._width).toBe(300);

        expect(cidOne).toBe(65);
        expect(cidTwo).toBe((65 << 8) | 66);
        expect(cidFallback).toBe('ABC');
        expect(cidThrowMessage).toContain('Unsupported CID string');
    });
});
import {
    _PdfCharacterMapFactory,
    _PdfIdentityCharacterMap
} from '../../src/pdf-data-extract/core/text-extraction/cmap';
import * as encodingUtilsModule from '../../src/pdf-data-extract/core/text-extraction/encoding-utils';
import { _FontHelper, _FontStructure } from '../../src/pdf-data-extract/core/text-extraction/font-structure';
import * as fontUtilsModule from '../../src/pdf-data-extract/core/text-extraction/font-utils';
describe('_font-structure screenshot highlighted coverage strict AAA', () => {
    function createReference(value: unknown): _PdfReference {
        const reference: _PdfReference & { _value?: unknown } = Object.create(_PdfReference.prototype);
        reference._value = value;
        return reference as _PdfReference;
    }

    function createDictionary(values: Record<string, unknown>): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype);

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).get = function (key: string): unknown {
            return values[key];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).getArray = function (key: string): unknown[] {
            const value: unknown = values[key];
            return Array.isArray(value) ? value : [];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).has = function (key: string): boolean {
            return key in values;
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).set = function (key: string, value: unknown): void {
            values[key] = value;
        };

        return dictionary;
    }

    function createCrossReference(): { _fetch: jasmine.Spy } {
        return {
            _fetch: jasmine.createSpy('_fetch').and.callFake(function (value: unknown): unknown {
                const reference: _PdfReference & { _value?: unknown } =
                    value as _PdfReference & { _value?: unknown };
                if (reference && typeof reference === 'object' && '_value' in reference) {
                    return reference._value;
                }
                return value;
            })
        };
    }

    function createFontStructureOverload(): _FontStructure {
        const fontStructure: _FontStructure = Object.create(_FontStructure.prototype) as _FontStructure;
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._glyphCache = Object.create(null);
        fontStructure._charsCache = Object.create(null);
        fontStructure._fontMatrix = [0.001, 0, 0, 0.001, 0, 0];
        fontStructure._toUnicode = {
            _get: function (code: number): number {
                return code;
            },
            _has: function (): boolean {
                return false;
            },
            _amend: jasmine.createSpy('_amend'),
            _charCodeOf: function (value: number): number {
                return value;
            },
            _forEach: function (): void {
                // no-op
            },
            _length: 0
        } as never;
        fontStructure._characterMap = {
            _contains: function (): boolean {
                return false;
            },
            _lookup: function (): number {
                return 0;
            },
            builtInCMap: false,
            _vertical: false
        } as never;
        fontStructure._type = 'Type1';
        fontStructure._name = 'Helvetica';
        fontStructure._flags = 0;
        fontStructure._composite = false;
        fontStructure._isInternalFont = false;
        fontStructure._isSymbolicFont = false;
        fontStructure._encoding = '';
        fontStructure._defaultWidth = 0;
        fontStructure._missingFile = false;
        fontStructure._lineHeight = 0;
        fontStructure._capHeight = NaN;
        fontStructure._ascent = NaN;
        fontStructure._descent = NaN;
        fontStructure._fontStyle = PdfFontStyle.regular;
        fontStructure._subtype = '';
        return fontStructure;
    }

    function createHelper(): _FontHelper {
        const fontStructure: _FontStructure = createFontStructureOverload();
        return new _FontHelper(fontStructure, createCrossReference() as never);
    }

    function getThrownMessage(action: () => void): string {
        let message: string = '';
        try {
            action();
        } catch (error) {
            const thrown: { message?: string } = error as { message?: string };
            if (thrown && typeof thrown.message === 'string') {
                message = thrown.message;
            }
        }
        return message;
    }

    it('should cover _extractDataStructures highlighted Symbol, Dingbats, Wingdings and _stringToPdfString utf16/utf8 branches', () => {
        // Arrange
        const helperSymbol: _FontHelper = createHelper();
        helperSymbol._fontStructure._flags = 4;
        helperSymbol._fontStructure._type = 'TrueType';
        helperSymbol._fontStructure._name = 'Symbol';
        helperSymbol._fontStructure._isInternalFont = false;

        const helperDingbats: _FontHelper = createHelper();
        helperDingbats._fontStructure._flags = 4;
        helperDingbats._fontStructure._type = 'TrueType';
        helperDingbats._fontStructure._name = 'ZapfDingbats';
        helperDingbats._fontStructure._isInternalFont = false;

        const helperWingdings: _FontHelper = createHelper();
        helperWingdings._fontStructure._flags = 4;
        helperWingdings._fontStructure._type = 'TrueType';
        helperWingdings._fontStructure._name = 'Wingdings';
        helperWingdings._fontStructure._isInternalFont = false;

        spyOn(helperSymbol, '_readToUnicode').and.returnValue({ _length: 0 } as never);
        spyOn(helperDingbats, '_readToUnicode').and.returnValue({ _length: 0 } as never);
        spyOn(helperWingdings, '_readToUnicode').and.returnValue({ _length: 0 } as never);

        spyOn(helperSymbol, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);
        spyOn(helperDingbats, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);
        spyOn(helperWingdings, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);

        const emptyDictionary: _PdfDictionary = createDictionary({});

        // Act
        helperSymbol._extractDataStructures(emptyDictionary, null);
        helperDingbats._extractDataStructures(emptyDictionary, null);
        helperWingdings._extractDataStructures(emptyDictionary, null);

        const utf16BeResult: string = helperSymbol._stringToPdfString('\xFE\xFF\x00A');
        const utf16LeResult: string = helperSymbol._stringToPdfString('\xFF\xFEA\x00');
        const utf8Result: string = helperSymbol._stringToPdfString('\xEF\xBB\xBFHello');
        const escapedUtf8Result: string = helperSymbol._stringToPdfString('\xEF\xBB\xBFHi\x1bESC');
        const translatedResult: string = helperSymbol._stringToPdfString('\x80A');

        // Assert
        expect(helperSymbol._fontStructure._defaultEncoding).toBe(encodingUtilsModule._symbolSetEncoding as never);
        expect(helperDingbats._fontStructure._defaultEncoding).toBe(encodingUtilsModule._zapfDingbatsEncoding as never);
        expect(helperWingdings._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);

        expect(utf16BeResult).toContain('A');
        expect(utf16LeResult).toContain('A');
        expect(utf8Result).toContain('Hello');
        expect(escapedUtf8Result).toBe('Hi');
        expect(translatedResult.length).toBeGreaterThan(0);
    });

    it('should cover _readToUnicode highlighted name, stream, odd token and surrogate token branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        spyOn(_PdfCharacterMapFactory.prototype, '_create').and.callFake(function (cmapObj: unknown): unknown {
            if (cmapObj instanceof _PdfName) {
                return {
                    getMap: function (): (string | number)[] {
                        const map: (string | number)[] = [];
                        map[0] = 'A';
                        return map;
                    }
                };
            }

            return {
                _map: new Array(3),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, 'A'); // odd length token -> prepend \u0000
                    callback(2, '\uD800\uDC00'); // surrogate pair-like token
                }
            };
        });

        const nameResult: any = helper._readToUnicode(_PdfName.get('Any-CMap'));

        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const streamResult: any = helper._readToUnicode(streamObject);

        // Assert
        expect(nameResult).toBeTruthy();
        expect(streamResult).toBeTruthy();
        expect(streamResult._get(0)).toBe('A');
        expect(typeof streamResult._get(1)).toBe('string');
        expect(typeof streamResult._get(2)).toBe('string');
    });


    it('should cover _getBaseFontMetrics highlighted switch cases, _adjustWidths and helper getters', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];
        helper._fontStructure._widths = { 1: 200, 2: 300 } as never;
        helper._fontStructure._defaultWidth = 400;

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({} as never);
        spyOn(helper, '_getMetrics').and.returnValue([
            'Courier',
            'Courier-Bold',
            'Courier-BoldOblique',
            'Courier-Oblique',
            'Helvetica',
            'Helvetica-Bold',
            'Helvetica-BoldOblique',
            'Helvetica-Oblique',
            'Symbol',
            'Times-Roman',
            'Times-Bold',
            'Times-BoldItalic',
            'Times-Italic',
            'ZapfDingbats'
        ] as never);

        spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
            return {
                _courier: { tag: 'courier' },
                _courierBold: { tag: 'courierBold' },
                _courierBoldOblique: { tag: 'courierBoldOblique' },
                _courierOblique: { tag: 'courierOblique' },
                _helveticaWidths: { tag: 'helvetica' },
                _helveticaBold: { tag: 'helveticaBold' },
                _helveticaBoldOblique: { tag: 'helveticaBoldOblique' },
                _helveticaOblique: { tag: 'helveticaOblique' },
                _symbol: 700,
                _timesRoman: { tag: 'timesRoman' },
                _timesBold: { tag: 'timesBold' },
                _timesBoldItalic: { tag: 'timesBoldItalic' },
                _timesItalic: { tag: 'timesItalic' },
                _zapfDingbats: { tag: 'zapf' }
            };
        });

        spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({ Times: true } as never);

        // Act
        helper._adjustWidths();

        const courierBoldObliqueResult: any = helper._getBaseFontMetrics('Courier-BoldOblique');
        const courierObliqueResult: any = helper._getBaseFontMetrics('Courier-Oblique');
        const helveticaBoldObliqueResult: any = helper._getBaseFontMetrics('Helvetica-BoldOblique');
        const helveticaObliqueResult: any = helper._getBaseFontMetrics('Helvetica-Oblique');
        const timesBoldResult: any = helper._getBaseFontMetrics('Times-Bold');
        const timesBoldItalicResult: any = helper._getBaseFontMetrics('Times-BoldItalic');
        const symbolResult: any = helper._getBaseFontMetrics('Symbol');

        const metricsResult: any = helper._getMetrics();
        const standardFontNameResult: any = helper._getStandardFontName('Arial_MT'.replace('Arial', 'Arial'));
        const normalizedFontNameResult: string = helper._normalizeFontName('Arial_MT');
        const serifResult: boolean = helper._isSerifFont('Times-Roman');

        // Assert
        expect(helper._fontStructure._widths[1]).toBe(100);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._defaultWidth).toBe(200);

        expect(courierBoldObliqueResult.widths).toEqual({ tag: 'courierBoldOblique' });
        expect(courierObliqueResult.widths).toEqual({ tag: 'courierOblique' });
        expect(helveticaBoldObliqueResult.widths).toEqual({ tag: 'helveticaBoldOblique' });
        expect(helveticaObliqueResult.widths).toEqual({ tag: 'helveticaOblique' });
        expect(timesBoldResult.widths).toEqual({ tag: 'timesBold' });
        expect(timesBoldItalicResult.widths).toEqual({ tag: 'timesBoldItalic' });
        expect(symbolResult.defaultWidth).toBe(700);
        expect(symbolResult.monospace).toBeTruthy();

        expect(metricsResult.length).toBeGreaterThan(0);
        expect(normalizedFontNameResult).toBe('Arial-MT');
        expect(serifResult).toBeTruthy();
        expect(standardFontNameResult).toBeUndefined();
    });

    it('should cover highlighted _setFallBackSystemFont, _spaceWidth, _charToGlyph and _convertCidString branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._toUnicode = {
            _has: function (): boolean {
                return false;
            },
            _get: function (): string {
                return '';
            },
            _amend: jasmine.createSpy('_amend'),
            _charCodeOf: function (): number {
                return -1;
            },
            _forEach: function (callback: (charCode: number, unicode: number) => void): void {
                callback(65, 65);
                callback(66, 66);
            },
            _length: 2
        } as never;

        helper._fontStructure._widths = { 65: 500, space: 300 } as never;
        helper._fontStructure._ascent = NaN;
        helper._fontStructure._descent = NaN;
        helper._fontStructure._capHeight = NaN;
        helper._fontStructure._encoding = 'Identity-H';

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({
            Helvetica: 'Helvetica',
            ArialBlack: 'Helvetica',
            Calibri: 'Helvetica',
            Symbol: 'Symbol',
            ZapfDingbats: 'ZapfDingbats'
        } as never);

        spyOn(encodingUtilsModule, '_getNonStdFontMap').and.returnValue({
            Calibri: 'Helvetica'
        } as never);

        spyOn(encodingUtilsModule, '_getFontBasicMetrics').and.returnValue({
            Helvetica: {
                ascent: 700,
                descent: -200,
                capHeight: 600
            },
            Symbol: {
                ascent: 700,
                descent: -200,
                capHeight: 600
            },
            ZapfDingbats: {
                ascent: 700,
                descent: -200,
                capHeight: 600
            }
        } as never);

        spyOn(encodingUtilsModule, '_getGlyphMapForStandardFonts').and.returnValue({ 65: 1 } as never);
        spyOn(encodingUtilsModule, '_getSupplementalGlyphMapForArialBlack').and.returnValue({ 66: 2 } as never);
        spyOn(encodingUtilsModule, '_getFontGlyphMap').and.returnValue({ 67: 3 } as never);
        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66, space: 32 } as never);
        spyOn(encodingUtilsModule, '_getDingbatsGlyphsUnicode').and.returnValue({ a1: 0x2701 } as never);
        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            if (glyphName === 'A') {
                return 65;
            }
            if (glyphName === 'B') {
                return 66;
            }
            return -1;
        });

        spyOn(helper, '_buildToFontChar').and.callFake(function (encoding: string[]): number[] {
            const map: number[] = [];
            if (encoding === encodingUtilsModule._symbolSetEncoding) {
                map[65] = 1000;
            } else if (encoding === encodingUtilsModule._zapfDingbatsEncoding) {
                map[66] = 2000;
            } else {
                map[67] = 3000;
            }
            return map;
        });

        const properties = {
            cidToGidMap: [undefined, 10, 20, 30],
            hasIncludedToUnicodeMap: true,
            _fallBackToUnicodeMap: null as never
        };

        // Act
        helper._fontStructure._name = 'ArialBlack';
        helper._fontStructure._type = 'CIDFontType2';
        helper._fontStructure._composite = true;
        helper._setFallBackSystemFont(properties as never);

        helper._fontStructure._name = 'Symbol';
        helper._fontStructure._type = 'Type1';
        helper._fontStructure._composite = false;
        helper._setFallBackSystemFont(properties as never);

        helper._fontStructure._name = 'ZapfDingbats';
        helper._setFallBackSystemFont(properties as never);

        helper._fontStructure._name = 'Helvetica';
        helper._setFallBackSystemFont(properties as never);

        helper._fontStructure._defaultWidth = 0;
        helper._fontStructure._differences = [];
        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[66] = '';
        helper._fontStructure._glyphCache = Object.create(null);
        helper._fontStructure._glyphCache[65] = {
            isSpace: false,
            marker: true
        } as never;
        helper._fontStructure._characterMap = {
            _contains: jasmine.createSpy('_contains').and.returnValue(false),
            _lookup: jasmine.createSpy('_lookup')
        } as never;
        helper._fontStructure._missingFile = true;
        helper._fontStructure._type = 'Type1';
        helper._standardCharacter = {
            66: {
                accentFontCharCode: 769,
                accentOffset: 10
            }
        };

        const spaceWidth: number = helper._spaceWidth;
        const cachedGlyph = helper._charToGlyph(65, false) as any;
        const glyphTwo: any = helper._charToGlyph(66, false);

        const cidOne: number = helper._convertCidString(1, 'A');
        const cidTwo: number = helper._convertCidString(1, 'AB');
        const cidFallback: string = helper._convertCidString(1, 'ABC');
        const cidThrowMessage: string = getThrownMessage(function (): void {
            helper._convertCidString(1, 'ABC', true);
        });

        // Assert
        expect(helper._fontStructure._missingFile).toBeTruthy();
        expect(helper._fontStructure._ascent).toBe(0.7);
        expect(helper._fontStructure._descent).toBe(-0.2);
        expect(helper._fontStructure._capHeight).toBe(0.6);
        expect(helper._fontStructure._toFontChar).toBeDefined();

        expect(spaceWidth).toBe(300);
        expect(cachedGlyph.marker).toBeTruthy();
        expect(glyphTwo._accent.fontChar).toBe(String.fromCodePoint(769));
        expect(glyphTwo._accent.offset).toBe(10);
        expect(glyphTwo._width).toBe(300);

        expect(cidOne).toBe(65);
        expect(cidTwo).toBe((65 << 8) | 66);
        expect(cidFallback).toBe('ABC');
        expect(cidThrowMessage).toContain('Unsupported CID string');
    });

    it('should cover highlighted _extractWidths break/continue branches safely', () => {
        // Arrange
        const helperBreakContinue: _FontHelper = createHelper();
        helperBreakContinue._fontStructure._composite = true;
        helperBreakContinue._vertical = false;

        const descriptorBreakContinue: _PdfDictionary = createDictionary({
            DW: 500,
            W: [
                'not-an-integer',
                [100],
                5,
                7,
                'not-a-number',
                9,
                { bad: true }
            ]
        });

        // Act
        helperBreakContinue._extractWidths(descriptorBreakContinue, 0, 0, createDictionary({}));

        // Assert
        expect(helperBreakContinue._fontStructure._defaultWidth).toBe(500);

        // Arrange
        const helperContinueRange: _FontHelper = createHelper();
        helperContinueRange._fontStructure._composite = true;
        helperContinueRange._vertical = false;

        const descriptorContinueRange: _PdfDictionary = createDictionary({
            DW: 500,
            W: [
                1,
                3,
                'bad-width'
            ]
        });

        // Act
        helperContinueRange._extractWidths(descriptorContinueRange, 0, 0, createDictionary({}));

        // Assert
        expect(helperContinueRange._fontStructure._widths[1]).toBeUndefined();
        expect(helperContinueRange._fontStructure._widths[2]).toBeUndefined();
        expect(helperContinueRange._fontStructure._widths[3]).toBeUndefined();
    });
});
describe('_font-structure screenshot highlighted coverage strict AAA', () => {
    function createReference(value: unknown): _PdfReference {
        const reference: _PdfReference & { _value?: unknown } = Object.create(_PdfReference.prototype);
        reference._value = value;
        return reference as _PdfReference;
    }

    function createDictionary(values: Record<string, unknown>): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype);

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).get = function (key: string): unknown {
            return values[key];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).getArray = function (key: string): unknown[] {
            const value: unknown = values[key];
            return Array.isArray(value) ? value : [];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).has = function (key: string): boolean {
            return key in values;
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).set = function (key: string, value: unknown): void {
            values[key] = value;
        };

        return dictionary;
    }

    function createCrossReference(): { _fetch: jasmine.Spy } {
        return {
            _fetch: jasmine.createSpy('_fetch').and.callFake(function (value: unknown): unknown {
                const reference: _PdfReference & { _value?: unknown } =
                    value as _PdfReference & { _value?: unknown };
                if (reference && typeof reference === 'object' && '_value' in reference) {
                    return reference._value;
                }
                return value;
            })
        };
    }

    function createFontStructureOverload(): _FontStructure {
        const fontStructure: _FontStructure = Object.create(_FontStructure.prototype) as _FontStructure;
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._glyphCache = Object.create(null);
        fontStructure._charsCache = Object.create(null);
        fontStructure._fontMatrix = [0.001, 0, 0, 0.001, 0, 0];
        fontStructure._toUnicode = {
            _get: function (code: number): number {
                return code;
            },
            _has: function (): boolean {
                return false;
            },
            _amend: jasmine.createSpy('_amend'),
            _charCodeOf: function (value: number): number {
                return value;
            },
            _forEach: function (): void {
                // no-op
            },
            _length: 0
        } as never;
        fontStructure._characterMap = {
            _contains: function (): boolean {
                return false;
            },
            _lookup: function (): number {
                return 0;
            },
            builtInCMap: false,
            _vertical: false
        } as never;
        fontStructure._type = 'Type1';
        fontStructure._name = 'Helvetica';
        fontStructure._flags = 0;
        fontStructure._composite = false;
        fontStructure._isInternalFont = false;
        fontStructure._isSymbolicFont = false;
        fontStructure._encoding = '';
        fontStructure._defaultWidth = 0;
        fontStructure._missingFile = false;
        fontStructure._lineHeight = 0;
        fontStructure._capHeight = NaN;
        fontStructure._ascent = NaN;
        fontStructure._descent = NaN;
        fontStructure._fontStyle = PdfFontStyle.regular;
        fontStructure._subtype = '';
        return fontStructure;
    }

    function createHelper(): _FontHelper {
        const fontStructure: _FontStructure = createFontStructureOverload();
        return new _FontHelper(fontStructure, createCrossReference() as never);
    }

    function getThrownMessage(action: () => void): string {
        let message: string = '';
        try {
            action();
        } catch (error) {
            const thrown: { message?: string } = error as { message?: string };
            if (thrown && typeof thrown.message === 'string') {
                message = thrown.message;
            }
        }
        return message;
    }

    it('should cover _extractDataStructures highlighted Symbol, Dingbats, Wingdings and _stringToPdfString utf16 and utf8 branches', () => {
        // Arrange
        const helperSymbol: _FontHelper = createHelper();
        helperSymbol._fontStructure._flags = 4;
        helperSymbol._fontStructure._type = 'TrueType';
        helperSymbol._fontStructure._name = 'Symbol';
        helperSymbol._fontStructure._isInternalFont = false;

        const helperDingbats: _FontHelper = createHelper();
        helperDingbats._fontStructure._flags = 4;
        helperDingbats._fontStructure._type = 'TrueType';
        helperDingbats._fontStructure._name = 'ZapfDingbats';
        helperDingbats._fontStructure._isInternalFont = false;

        const helperWingdings: _FontHelper = createHelper();
        helperWingdings._fontStructure._flags = 4;
        helperWingdings._fontStructure._type = 'TrueType';
        helperWingdings._fontStructure._name = 'Wingdings';
        helperWingdings._fontStructure._isInternalFont = false;

        spyOn(helperSymbol, '_readToUnicode').and.returnValue({ _length: 0 } as never);
        spyOn(helperDingbats, '_readToUnicode').and.returnValue({ _length: 0 } as never);
        spyOn(helperWingdings, '_readToUnicode').and.returnValue({ _length: 0 } as never);

        spyOn(helperSymbol, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);
        spyOn(helperDingbats, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);
        spyOn(helperWingdings, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);

        const emptyDictionary: _PdfDictionary = createDictionary({});

        // Act
        helperSymbol._extractDataStructures(emptyDictionary, null);
        helperDingbats._extractDataStructures(emptyDictionary, null);
        helperWingdings._extractDataStructures(emptyDictionary, null);

        const utf16BeResult: string = helperSymbol._stringToPdfString('\xFE\xFF\x00A');
        const utf16LeResult: string = helperSymbol._stringToPdfString('\xFF\xFEA\x00');
        const utf8Result: string = helperSymbol._stringToPdfString('\xEF\xBB\xBFHello');
        const escapedUtf8Result: string = helperSymbol._stringToPdfString('\xEF\xBB\xBFHi\x1bESC');
        const translatedResult: string = helperSymbol._stringToPdfString('\x80A');

        // Assert
        expect(helperSymbol._fontStructure._defaultEncoding).toBe(encodingUtilsModule._symbolSetEncoding as never);
        expect(helperDingbats._fontStructure._defaultEncoding).toBe(encodingUtilsModule._zapfDingbatsEncoding as never);
        expect(helperWingdings._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);

        expect(utf16BeResult).toContain('A');
        expect(utf16LeResult).toContain('A');
        expect(utf8Result).toContain('Hello');
        expect(escapedUtf8Result).toBe('Hi');
        expect(translatedResult.length).toBeGreaterThan(0);
    });

    it('should cover _readToUnicode highlighted name, stream, odd token and surrogate token branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        spyOn(_PdfCharacterMapFactory.prototype, '_create').and.callFake(function (cmapObj: unknown): unknown {
            if (cmapObj instanceof _PdfName) {
                return {
                    getMap: function (): (string | number)[] {
                        const map: (string | number)[] = [];
                        map[0] = 'A';
                        return map;
                    }
                };
            }

            return {
                _map: new Array(3),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, 'A');
                    callback(2, '\uD800\uDC00');
                }
            };
        });

        const nameResult: any = helper._readToUnicode(_PdfName.get('Any-CMap'));

        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const streamResult: any = helper._readToUnicode(streamObject);

        // Assert
        expect(nameResult).toBeTruthy();
        expect(streamResult).toBeTruthy();
        expect(streamResult._get(0)).toBe('A');
        expect(typeof streamResult._get(1)).toBe('string');
        expect(typeof streamResult._get(2)).toBe('string');
    });
});
describe('_font-structure highlighted coverage AAA complete', () => {
    function createReference(value: unknown): _PdfReference {
        const reference: _PdfReference & { _value?: unknown } = Object.create(_PdfReference.prototype);
        reference._value = value;
        return reference as _PdfReference;
    }

    function createDictionary(values: Record<string, unknown>): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype);

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).get = function (key: string): unknown {
            return values[key];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).getArray = function (key: string): unknown[] {
            const value: unknown = values[key];
            return Array.isArray(value) ? value : [];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).has = function (key: string): boolean {
            return key in values;
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).set = function (key: string, value: unknown): void {
            values[key] = value;
        };

        return dictionary;
    }

    function createCrossReference(): { _fetch: jasmine.Spy } {
        return {
            _fetch: jasmine.createSpy('_fetch').and.callFake(function (value: unknown): unknown {
                const reference: _PdfReference & { _value?: unknown } =
                    value as _PdfReference & { _value?: unknown };
                if (reference && typeof reference === 'object' && '_value' in reference) {
                    return reference._value;
                }
                return value;
            })
        };
    }

    function createFontStructureOverload(): _FontStructure {
        const fontStructure: _FontStructure = Object.create(_FontStructure.prototype) as _FontStructure;

        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._glyphCache = Object.create(null);
        fontStructure._charsCache = Object.create(null);
        fontStructure._fontMatrix = [0.001, 0, 0, 0.001, 0, 0];
        fontStructure._type = 'Type1';
        fontStructure._name = 'Helvetica';
        fontStructure._flags = 0;
        fontStructure._composite = false;
        fontStructure._isInternalFont = false;
        fontStructure._isSymbolicFont = false;
        fontStructure._encoding = '';
        fontStructure._defaultWidth = 0;
        fontStructure._missingFile = false;
        fontStructure._lineHeight = 0;
        fontStructure._capHeight = NaN;
        fontStructure._ascent = NaN;
        fontStructure._descent = NaN;
        fontStructure._fontStyle = PdfFontStyle.regular;
        fontStructure._subtype = '';

        fontStructure._toUnicode = {
            _get: function (code: number): number {
                return code;
            },
            _has: function (): boolean {
                return false;
            },
            _amend: jasmine.createSpy('_amend'),
            _charCodeOf: function (value: number): number {
                return value;
            },
            _forEach: function (): void {
                // no-op
            },
            _length: 0
        } as never;

        fontStructure._characterMap = {
            _contains: function (): boolean {
                return false;
            },
            _lookup: function (): number {
                return 0;
            },
            builtInCMap: false,
            _vertical: false
        } as never;

        return fontStructure;
    }

    function createHelper(): _FontHelper {
        const fontStructure: _FontStructure = createFontStructureOverload();
        return new _FontHelper(fontStructure, createCrossReference() as never);
    }

    function getThrownMessage(action: () => void): string {
        let message: string = '';
        try {
            action();
        } catch (error) {
            const thrown: { message?: string } = error as { message?: string };
            if (thrown && typeof thrown.message === 'string') {
                message = thrown.message;
            }
        }
        return message;
    }

it('should cover _getBaseFontMetrics highlighted switch cases, _adjustWidths and helper getters', () => {
    // Arrange
    const helper: _FontHelper = createHelper();
    helper._fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];
    helper._fontStructure._widths = { 1: 200, 2: 300 } as never;
    helper._fontStructure._defaultWidth = 400;

    spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({} as never);
    spyOn(helper, '_getMetrics').and.returnValue([
        'Courier',
        'Courier-Bold',
        'Courier-BoldOblique',
        'Courier-Oblique',
        'Helvetica',
        'Helvetica-Bold',
        'Helvetica-BoldOblique',
        'Helvetica-Oblique',
        'Symbol',
        'Times-Roman',
        'Times-Bold',
        'Times-BoldItalic',
        'Times-Italic',
        'ZapfDingbats'
    ] as never);

    spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
        return {
            _courier: { tag: 'courier' },
            _courierBold: { tag: 'courierBold' },
            _courierBoldOblique: { tag: 'courierBoldOblique' },
            _courierOblique: { tag: 'courierOblique' },
            _helveticaWidths: { tag: 'helvetica' },
            _helveticaBold: { tag: 'helveticaBold' },
            _helveticaBoldOblique: { tag: 'helveticaBoldOblique' },
            _helveticaOblique: { tag: 'helveticaOblique' },
            _symbol: 700,
            _timesRoman: { tag: 'timesRoman' },
            _timesBold: { tag: 'timesBold' },
            _timesBoldItalic: { tag: 'timesBoldItalic' },
            _timesItalic: { tag: 'timesItalic' },
            _zapfDingbats: { tag: 'zapf' }
        };
    });

    spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({ Times: true } as never);

    // Act
    helper._adjustWidths();

    const courierBoldObliqueResult: any = helper._getBaseFontMetrics('Courier-BoldOblique');
    const courierObliqueResult: any = helper._getBaseFontMetrics('Courier-Oblique');
    const helveticaBoldObliqueResult: any = helper._getBaseFontMetrics('Helvetica-BoldOblique');
    const helveticaObliqueResult: any = helper._getBaseFontMetrics('Helvetica-Oblique');
    const timesBoldResult: any = helper._getBaseFontMetrics('Times-Bold');
    const timesBoldItalicResult: any = helper._getBaseFontMetrics('Times-BoldItalic');
    const symbolResult: any = helper._getBaseFontMetrics('Symbol');

    const metricsResult: any = helper._getMetrics();
    const standardFontNameResult: any = helper._getStandardFontName('Arial_MT'.replace('Arial', 'Arial'));
    const normalizedFontNameResult: string = helper._normalizeFontName('Arial_MT');
    const serifResult: boolean = helper._isSerifFont('Times-Roman');

    // Assert
    expect(helper._fontStructure._widths[1]).toBe(100);
    expect(helper._fontStructure._widths[2]).toBe(150);
    expect(helper._fontStructure._defaultWidth).toBe(200);

    expect(courierBoldObliqueResult.widths).toEqual({ tag: 'courierBoldOblique' });
    expect(courierObliqueResult.widths).toEqual({ tag: 'courierOblique' });
    expect(helveticaBoldObliqueResult.widths).toEqual({ tag: 'helveticaBoldOblique' });
    expect(helveticaObliqueResult.widths).toEqual({ tag: 'helveticaOblique' });
    expect(timesBoldResult.widths).toEqual({ tag: 'timesBold' });
    expect(timesBoldItalicResult.widths).toEqual({ tag: 'timesBoldItalic' });
    expect(symbolResult.defaultWidth).toBe(700);
    expect(symbolResult.monospace).toBeTruthy();

    expect(metricsResult.length).toBeGreaterThan(0);
    expect(normalizedFontNameResult).toBe('Arial-MT');
    expect(serifResult).toBeTruthy();
    expect(standardFontNameResult).toBeUndefined();
});

it('should cover highlighted _setFallBackSystemFont, _spaceWidth, _charToGlyph and _convertCidString branches', () => {
    // Arrange
    const helper: _FontHelper = createHelper();

    helper._fontStructure._toUnicode = {
        _has: function (): boolean {
            return false;
        },
        _get: function (): string {
            return '';
        },
        _amend: jasmine.createSpy('_amend'),
        _charCodeOf: function (): number {
            return -1;
        },
        _forEach: function (callback: (charCode: number, unicode: number) => void): void {
            callback(65, 65);
            callback(66, 66);
        },
        _length: 2
    } as never;

    helper._fontStructure._widths = { 65: 500, space: 300 } as never;
    helper._fontStructure._ascent = NaN;
    helper._fontStructure._descent = NaN;
    helper._fontStructure._capHeight = NaN;
    helper._fontStructure._encoding = 'Identity-H';

    spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({
        Helvetica: 'Helvetica',
        ArialBlack: 'Helvetica',
        Calibri: 'Helvetica',
        Symbol: 'Symbol',
        ZapfDingbats: 'ZapfDingbats'
    } as never);

    spyOn(encodingUtilsModule, '_getNonStdFontMap').and.returnValue({
        Calibri: 'Helvetica'
    } as never);

    spyOn(encodingUtilsModule, '_getFontBasicMetrics').and.returnValue({
        Helvetica: {
            ascent: 700,
            descent: -200,
            capHeight: 600
        },
        Symbol: {
            ascent: 700,
            descent: -200,
            capHeight: 600
        },
        ZapfDingbats: {
            ascent: 700,
            descent: -200,
            capHeight: 600
        }
    } as never);

    spyOn(encodingUtilsModule, '_getGlyphMapForStandardFonts').and.returnValue({ 65: 1 } as never);
    spyOn(encodingUtilsModule, '_getSupplementalGlyphMapForArialBlack').and.returnValue({ 66: 2 } as never);
    spyOn(encodingUtilsModule, '_getFontGlyphMap').and.returnValue({ 67: 3 } as never);
    spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66, space: 32 } as never);
    spyOn(encodingUtilsModule, '_getDingbatsGlyphsUnicode').and.returnValue({ a1: 0x2701 } as never);
    spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
        if (glyphName === 'A') {
            return 65;
        }
        if (glyphName === 'B') {
            return 66;
        }
        return -1;
    });

    spyOn(helper, '_buildToFontChar').and.callFake(function (encoding: string[]): number[] {
        const map: number[] = [];
        if (encoding === encodingUtilsModule._symbolSetEncoding) {
            map[65] = 1000;
        } else if (encoding === encodingUtilsModule._zapfDingbatsEncoding) {
            map[66] = 2000;
        } else {
            map[67] = 3000;
        }
        return map;
    });

    const properties = {
        cidToGidMap: [undefined, 10, 20, 30],
        hasIncludedToUnicodeMap: true,
        _fallBackToUnicodeMap: null as never
    };

    // Act
    helper._fontStructure._name = 'ArialBlack';
    helper._fontStructure._type = 'CIDFontType2';
    helper._fontStructure._composite = true;
    helper._setFallBackSystemFont(properties as never);

    helper._fontStructure._name = 'Symbol';
    helper._fontStructure._type = 'Type1';
    helper._fontStructure._composite = false;
    helper._setFallBackSystemFont(properties as never);

    helper._fontStructure._name = 'ZapfDingbats';
    helper._setFallBackSystemFont(properties as never);

    helper._fontStructure._name = 'Helvetica';
    helper._setFallBackSystemFont(properties as never);

    helper._fontStructure._defaultWidth = 0;
    helper._fontStructure._differences = [];
    helper._fontStructure._defaultEncoding = [];
    helper._fontStructure._defaultEncoding[66] = '';
    helper._fontStructure._glyphCache = Object.create(null);
    helper._fontStructure._glyphCache[65] = {
        isSpace: false,
        marker: true
    } as never;
    helper._fontStructure._characterMap = {
        _contains: jasmine.createSpy('_contains').and.returnValue(false),
        _lookup: jasmine.createSpy('_lookup')
    } as never;
    helper._fontStructure._missingFile = true;
    helper._fontStructure._type = 'Type1';
    helper._standardCharacter = {
        66: {
            accentFontCharCode: 769,
            accentOffset: 10
        }
    };

    const spaceWidth: number = helper._spaceWidth;
    const cachedGlyph = helper._charToGlyph(65, false) as any;
    const glyphTwo: any = helper._charToGlyph(66, false);

    const cidOne: number = helper._convertCidString(1, 'A');
    const cidTwo: number = helper._convertCidString(1, 'AB');
    const cidFallback: string = helper._convertCidString(1, 'ABC');
    const cidThrowMessage: string = getThrownMessage(function (): void {
        helper._convertCidString(1, 'ABC', true);
    });

    // Assert
    expect(helper._fontStructure._missingFile).toBeTruthy();
    expect(helper._fontStructure._ascent).toBe(0.7);
    expect(helper._fontStructure._descent).toBe(-0.2);
    expect(helper._fontStructure._capHeight).toBe(0.6);
    expect(helper._fontStructure._toFontChar).toBeDefined();

    expect(spaceWidth).toBe(300);
    expect(cachedGlyph.marker).toBeTruthy();
    expect(glyphTwo._accent.fontChar).toBe(String.fromCodePoint(769));
    expect(glyphTwo._accent.offset).toBe(10);
    expect(glyphTwo._width).toBe(300);

    expect(cidOne).toBe(65);
    expect(cidTwo).toBe((65 << 8) | 66);
    expect(cidFallback).toBe('ABC');
    expect(cidThrowMessage).toContain('Unsupported CID string');
});

it('should cover highlighted _extractWidths break and continue branches safely', () => {
    // Arrange
    const helperBreakContinue: _FontHelper = createHelper();
    helperBreakContinue._fontStructure._composite = true;
    helperBreakContinue._vertical = false;

    const descriptorBreakContinue: _PdfDictionary = createDictionary({
        DW: 500,
        W: [
            'not-an-integer',
            [100],
            5,
            7,
            'not-a-number',
            9,
            { bad: true }
        ]
    });

    // Act
    helperBreakContinue._extractWidths(descriptorBreakContinue, 0, 0, createDictionary({}));

    // Assert
    expect(helperBreakContinue._fontStructure._defaultWidth).toBe(500);

    // Arrange
    const helperContinueRange: _FontHelper = createHelper();
    helperContinueRange._fontStructure._composite = true;
    helperContinueRange._vertical = false;

    const descriptorContinueRange: _PdfDictionary = createDictionary({
        DW: 500,
        W: [
            1,
            3,
            'bad-width'
        ]
    });

    // Act
    helperContinueRange._extractWidths(descriptorContinueRange, 0, 0, createDictionary({}));

    // Assert
    expect(helperContinueRange._fontStructure._widths[1]).toBeUndefined();
    expect(helperContinueRange._fontStructure._widths[2]).toBeUndefined();
    expect(helperContinueRange._fontStructure._widths[3]).toBeUndefined();
});
});
describe('_font-structure screenshot highlighted coverage strict AAA', () => {
    function createReference(value: unknown): _PdfReference {
        const reference: _PdfReference & { _value?: unknown } = Object.create(_PdfReference.prototype);
        reference._value = value;
        return reference as _PdfReference;
    }

    function createDictionary(values: Record<string, unknown>): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype);

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).get = function (key: string): unknown {
            return values[key];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).getArray = function (key: string): unknown[] {
            const value: unknown = values[key];
            return Array.isArray(value) ? value : [];
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).has = function (key: string): boolean {
            return key in values;
        };

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown[];
            has: (key: string) => boolean;
            set: (key: string, value: unknown) => void;
        }).set = function (key: string, value: unknown): void {
            values[key] = value;
        };

        return dictionary;
    }

    function createCrossReference(): { _fetch: jasmine.Spy } {
        return {
            _fetch: jasmine.createSpy('_fetch').and.callFake(function (value: unknown): unknown {
                const reference: _PdfReference & { _value?: unknown } =
                    value as _PdfReference & { _value?: unknown };
                if (reference && typeof reference === 'object' && '_value' in reference) {
                    return reference._value;
                }
                return value;
            })
        };
    }

    function createFontStructureOverload(): _FontStructure {
        const fontStructure: _FontStructure = Object.create(_FontStructure.prototype) as _FontStructure;
        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._glyphCache = Object.create(null);
        fontStructure._charsCache = Object.create(null);
        fontStructure._fontMatrix = [0.001, 0, 0, 0.001, 0, 0];
        fontStructure._type = 'Type1';
        fontStructure._name = 'Helvetica';
        fontStructure._flags = 0;
        fontStructure._composite = false;
        fontStructure._isInternalFont = false;
        fontStructure._isSymbolicFont = false;
        fontStructure._encoding = '';
        fontStructure._defaultWidth = 0;
        fontStructure._missingFile = false;
        fontStructure._lineHeight = 0;
        fontStructure._capHeight = NaN;
        fontStructure._ascent = NaN;
        fontStructure._descent = NaN;
        fontStructure._fontStyle = PdfFontStyle.regular;
        fontStructure._subtype = '';

        fontStructure._toUnicode = {
            _get: function (code: number): number {
                return code;
            },
            _has: function (): boolean {
                return false;
            },
            _amend: jasmine.createSpy('_amend'),
            _charCodeOf: function (value: number): number {
                return value;
            },
            _forEach: function (): void {
                // no-op
            },
            _length: 0
        } as never;

        fontStructure._characterMap = {
            _contains: function (): boolean {
                return false;
            },
            _lookup: function (): number {
                return 0;
            },
            builtInCMap: false,
            _vertical: false
        } as never;

        return fontStructure;
    }

    function createHelper(): _FontHelper {
        const fontStructure: _FontStructure = createFontStructureOverload();
        return new _FontHelper(fontStructure, createCrossReference() as never);
    }

    function getThrownMessage(action: () => void): string {
        let message: string = '';
        try {
            action();
        } catch (error) {
            const thrown: { message?: string } = error as { message?: string };
            if (thrown && typeof thrown.message === 'string') {
                message = thrown.message;
            }
        }
        return message;
    }

    it('should cover _extractDataStructures symbolic font name branches and _stringToPdfString BOM branches', () => {
        // Arrange
        const helperSymbol: _FontHelper = createHelper();
        helperSymbol._fontStructure._flags = 4;
        helperSymbol._fontStructure._type = 'TrueType';
        helperSymbol._fontStructure._name = 'Symbol';
        helperSymbol._fontStructure._isInternalFont = false;

        const helperDingbats: _FontHelper = createHelper();
        helperDingbats._fontStructure._flags = 4;
        helperDingbats._fontStructure._type = 'TrueType';
        helperDingbats._fontStructure._name = 'ZapfDingbats';
        helperDingbats._fontStructure._isInternalFont = false;

        const helperWingdings: _FontHelper = createHelper();
        helperWingdings._fontStructure._flags = 4;
        helperWingdings._fontStructure._type = 'TrueType';
        helperWingdings._fontStructure._name = 'Wingdings';
        helperWingdings._fontStructure._isInternalFont = false;

        spyOn(helperSymbol, '_readToUnicode').and.returnValue({ _length: 0 } as never);
        spyOn(helperDingbats, '_readToUnicode').and.returnValue({ _length: 0 } as never);
        spyOn(helperWingdings, '_readToUnicode').and.returnValue({ _length: 0 } as never);

        spyOn(helperSymbol, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);
        spyOn(helperDingbats, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);
        spyOn(helperWingdings, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);

        const emptyDictionary: _PdfDictionary = createDictionary({});

        // Act
        helperSymbol._extractDataStructures(emptyDictionary, null);
        helperDingbats._extractDataStructures(emptyDictionary, null);
        helperWingdings._extractDataStructures(emptyDictionary, null);

        const utf16BeResult: string = helperSymbol._stringToPdfString('\xFE\xFF\x00A');
        const utf16LeResult: string = helperSymbol._stringToPdfString('\xFF\xFEA\x00');
        const utf8Result: string = helperSymbol._stringToPdfString('\xEF\xBB\xBFHello');
        const escapedUtf8Result: string = helperSymbol._stringToPdfString('\xEF\xBB\xBFHi\x1bESC');
        const translatedResult: string = helperSymbol._stringToPdfString('\x80A');

        // Assert
        expect(helperSymbol._fontStructure._defaultEncoding).toBe(encodingUtilsModule._symbolSetEncoding as never);
        expect(helperDingbats._fontStructure._defaultEncoding).toBe(encodingUtilsModule._zapfDingbatsEncoding as never);
        expect(helperWingdings._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);

        expect(utf16BeResult).toContain('A');
        expect(utf16LeResult).toContain('A');
        expect(utf8Result).toContain('Hello');
        expect(escapedUtf8Result).toBe('Hi');
        expect(translatedResult.length).toBeGreaterThan(0);
    });

    it('should cover _readToUnicode name path, stream path, odd-length token path and surrogate token path', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        spyOn(_PdfCharacterMapFactory.prototype, '_create').and.callFake(function (cmapObj: unknown): unknown {
            if (cmapObj instanceof _PdfName) {
                return {
                    getMap: function (): (string | number)[] {
                        const map: (string | number)[] = [];
                        map[0] = 'A';
                        return map;
                    }
                };
            }

            return {
                _map: new Array(3),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, 'A'); // odd token length branch
                    callback(2, '\uD800\uDC00'); // surrogate pair path
                }
            };
        });

        const nameResult: any = helper._readToUnicode(_PdfName.get('Any-CMap'));
        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;

        // Act
        const streamResult: any = helper._readToUnicode(streamObject);

        // Assert
        expect(nameResult).toBeTruthy();
        expect(streamResult).toBeTruthy();
        expect(streamResult._get(0)).toBe('A');
        expect(typeof streamResult._get(1)).toBe('string');
        expect(typeof streamResult._get(2)).toBe('string');
    });

    it('should cover _getBaseFontMetrics highlighted switch cases, _adjustWidths and helper getter methods', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];
        helper._fontStructure._widths = { 1: 200, 2: 300 } as never;
        helper._fontStructure._defaultWidth = 400;

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({} as never);
        spyOn(helper, '_getMetrics').and.returnValue([
            'Courier',
            'Courier-Bold',
            'Courier-BoldOblique',
            'Courier-Oblique',
            'Helvetica',
            'Helvetica-Bold',
            'Helvetica-BoldOblique',
            'Helvetica-Oblique',
            'Symbol',
            'Times-Roman',
            'Times-Bold',
            'Times-BoldItalic',
            'Times-Italic',
            'ZapfDingbats'
        ] as never);

        spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
            return {
                _courier: { tag: 'courier' },
                _courierBold: { tag: 'courierBold' },
                _courierBoldOblique: { tag: 'courierBoldOblique' },
                _courierOblique: { tag: 'courierOblique' },
                _helveticaWidths: { tag: 'helvetica' },
                _helveticaBold: { tag: 'helveticaBold' },
                _helveticaBoldOblique: { tag: 'helveticaBoldOblique' },
                _helveticaOblique: { tag: 'helveticaOblique' },
                _symbol: 700,
                _timesRoman: { tag: 'timesRoman' },
                _timesBold: { tag: 'timesBold' },
                _timesBoldItalic: { tag: 'timesBoldItalic' },
                _timesItalic: { tag: 'timesItalic' },
                _zapfDingbats: { tag: 'zapf' }
            };
        });

        spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({ Times: true } as never);

        // Act
        helper._adjustWidths();

        const courierBoldObliqueResult: any = helper._getBaseFontMetrics('Courier-BoldOblique');
        const courierObliqueResult: any = helper._getBaseFontMetrics('Courier-Oblique');
        const helveticaBoldObliqueResult: any = helper._getBaseFontMetrics('Helvetica-BoldOblique');
        const helveticaObliqueResult: any = helper._getBaseFontMetrics('Helvetica-Oblique');
        const timesBoldResult: any = helper._getBaseFontMetrics('Times-Bold');
        const timesBoldItalicResult: any = helper._getBaseFontMetrics('Times-BoldItalic');
        const symbolResult: any = helper._getBaseFontMetrics('Symbol');

        const metricsResult: any = helper._getMetrics();
        const standardFontNameResult: any = helper._getStandardFontName('Arial_MT');
        const normalizedFontNameResult: string = helper._normalizeFontName('Arial_MT');
        const serifResult: boolean = helper._isSerifFont('Times-Roman');

        // Assert
        expect(helper._fontStructure._widths[1]).toBe(100);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._defaultWidth).toBe(200);

        expect(courierBoldObliqueResult.widths).toEqual({ tag: 'courierBoldOblique' });
        expect(courierObliqueResult.widths).toEqual({ tag: 'courierOblique' });
        expect(helveticaBoldObliqueResult.widths).toEqual({ tag: 'helveticaBoldOblique' });
        expect(helveticaObliqueResult.widths).toEqual({ tag: 'helveticaOblique' });
        expect(timesBoldResult.widths).toEqual({ tag: 'timesBold' });
        expect(timesBoldItalicResult.widths).toEqual({ tag: 'timesBoldItalic' });
        expect(symbolResult.defaultWidth).toBe(700);
        expect(symbolResult.monospace).toBeTruthy();

        expect(metricsResult.length).toBeGreaterThan(0);
        expect(normalizedFontNameResult).toBe('Arial-MT');
        expect(serifResult).toBeTruthy();
        expect(standardFontNameResult).toBeUndefined();
    });
    it('should cover highlighted _extractWidths break and continue branches safely', () => {
        // Arrange
        const helperBreakContinue: _FontHelper = createHelper();
        helperBreakContinue._fontStructure._composite = true;
        helperBreakContinue._vertical = false;

        const descriptorBreakContinue: _PdfDictionary = createDictionary({
            DW: 500,
            W: [
                'not-an-integer',
                [100],
                5,
                7,
                'not-a-number',
                9,
                { bad: true }
            ]
        });

        // Act
        helperBreakContinue._extractWidths(descriptorBreakContinue, 0, 0, createDictionary({}));

        // Assert
        expect(helperBreakContinue._fontStructure._defaultWidth).toBe(500);

        // Arrange
        const helperContinueRange: _FontHelper = createHelper();
        helperContinueRange._fontStructure._composite = true;
        helperContinueRange._vertical = true;

        const helperContinueCrossReference = helperContinueRange._crossReference as unknown as { _fetch: jasmine.Spy };
        helperContinueCrossReference._fetch.and.callFake(function (value: unknown): unknown {
            const reference: _PdfReference & { _value?: unknown } =
                value as _PdfReference & { _value?: unknown };
            if (reference && typeof reference === 'object' && '_value' in reference) {
                return reference._value;
            }
            return value;
        });

        const descriptorContinueRange: _PdfDictionary = createDictionary({
            DW: 500,
            W: [
                1,
                3,
                'bad-width'
            ],
            DW2: [880, -1000],
            W2: [
                createReference('bad-start'),
                [1, 2, 3],
                createReference(10),
                createReference(12),
                createReference('bad-vmetric'),
                createReference(20),
                createReference({ bad: true })
            ]
        });

        // Act
        helperContinueRange._extractWidths(descriptorContinueRange, 0, 0, createDictionary({}));

        // Assert
        expect(helperContinueRange._fontStructure._widths[1]).toBeUndefined();
        expect(helperContinueRange._fontStructure._widths[2]).toBeUndefined();
        expect(helperContinueRange._fontStructure._widths[3]).toBeUndefined();
    });
});

    function createCrossReference(): { _fetch: jasmine.Spy } {
        return {
            _fetch: jasmine.createSpy('_fetch').and.callFake(function (value: unknown): unknown {
                const reference: _PdfReference & { _value?: unknown } =
                    value as _PdfReference & { _value?: unknown };
                if (reference && typeof reference === 'object' && '_value' in reference) {
                    return reference._value;
                }
                return value;
            })
        };
    }

    function createFontStructureOverload(): _FontStructure {
        const fontStructure: _FontStructure = Object.create(_FontStructure.prototype) as _FontStructure;

        fontStructure._widths = [];
        fontStructure._differences = [];
        fontStructure._defaultEncoding = [];
        fontStructure._glyphCache = Object.create(null);
        fontStructure._charsCache = Object.create(null);
        fontStructure._fontMatrix = [0.001, 0, 0, 0.001, 0, 0];
        fontStructure._type = 'Type1';
        fontStructure._name = 'Helvetica';
        fontStructure._flags = 0;
        fontStructure._composite = false;
        fontStructure._isInternalFont = false;
        fontStructure._isSymbolicFont = false;
        fontStructure._encoding = '';
        fontStructure._defaultWidth = 0;
        fontStructure._missingFile = false;
        fontStructure._lineHeight = 0;
        fontStructure._capHeight = NaN;
        fontStructure._ascent = NaN;
        fontStructure._descent = NaN;
        fontStructure._fontStyle = PdfFontStyle.regular;
        fontStructure._subtype = '';

        fontStructure._toUnicode = {
            _get: function (code: number): number {
                return code;
            },
            _has: function (): boolean {
                return false;
            },
            _amend: jasmine.createSpy('_amend'),
            _charCodeOf: function (value: number): number {
                return value;
            },
            _forEach: function (): void {
                // no-op
            },
            _length: 0
        } as never;

        fontStructure._characterMap = {
            _contains: function (): boolean {
                return false;
            },
            _lookup: function (): number {
                return 0;
            },
            builtInCMap: false,
            _vertical: false
        } as never;

        return fontStructure;
    }

    function createHelper(): _FontHelper {
        const fontStructure: _FontStructure = createFontStructureOverload();
        return new _FontHelper(fontStructure, createCrossReference() as never);
    }

    function getThrownMessage(action: () => void): string {
        let message: string = '';
        try {
            action();
        } catch (error) {
            const thrown: { message?: string } = error as { message?: string };
            if (thrown && typeof thrown.message === 'string') {
                message = thrown.message;
            }
        }
        return message;
    }

    it('should cover _extractDataStructures highlighted symbolic-name branches and _stringToPdfString BOM branches', () => {
        // Arrange
        const helperSymbol: _FontHelper = createHelper();
        helperSymbol._fontStructure._flags = 4;
        helperSymbol._fontStructure._type = 'TrueType';
        helperSymbol._fontStructure._name = 'Symbol';
        helperSymbol._fontStructure._isInternalFont = false;

        const helperDingbats: _FontHelper = createHelper();
        helperDingbats._fontStructure._flags = 4;
        helperDingbats._fontStructure._type = 'TrueType';
        helperDingbats._fontStructure._name = 'ZapfDingbats';
        helperDingbats._fontStructure._isInternalFont = false;

        const helperWingdings: _FontHelper = createHelper();
        helperWingdings._fontStructure._flags = 4;
        helperWingdings._fontStructure._type = 'TrueType';
        helperWingdings._fontStructure._name = 'Wingdings';
        helperWingdings._fontStructure._isInternalFont = false;

        spyOn(helperSymbol, '_readToUnicode').and.returnValue({ _length: 0 } as never);
        spyOn(helperDingbats, '_readToUnicode').and.returnValue({ _length: 0 } as never);
        spyOn(helperWingdings, '_readToUnicode').and.returnValue({ _length: 0 } as never);

        spyOn(helperSymbol, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);
        spyOn(helperDingbats, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);
        spyOn(helperWingdings, '_buildToUnicode').and.returnValue({ marker: 'unicode' } as never);

        const emptyDictionary: _PdfDictionary = createDictionary({});

        // Act
        helperSymbol._extractDataStructures(emptyDictionary, null);
        helperDingbats._extractDataStructures(emptyDictionary, null);
        helperWingdings._extractDataStructures(emptyDictionary, null);

        const utf16BeResult: string = helperSymbol._stringToPdfString('\xFE\xFF\x00A');
        const utf16LeResult: string = helperSymbol._stringToPdfString('\xFF\xFEA\x00');
        const utf8Result: string = helperSymbol._stringToPdfString('\xEF\xBB\xBFHello');
        const escapedUtf8Result: string = helperSymbol._stringToPdfString('\xEF\xBB\xBFHi\x1bESC');
        const translatedResult: string = helperSymbol._stringToPdfString('\x80A');

        // Assert
        expect(helperSymbol._fontStructure._defaultEncoding).toBe(encodingUtilsModule._symbolSetEncoding as never);
        expect(helperDingbats._fontStructure._defaultEncoding).toBe(encodingUtilsModule._zapfDingbatsEncoding as never);
        expect(helperWingdings._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);

        expect(utf16BeResult).toContain('A');
        expect(utf16LeResult).toContain('A');
        expect(utf8Result).toContain('Hello');
        expect(escapedUtf8Result).toBe('Hi');
        expect(translatedResult.length).toBeGreaterThan(0);
    });

    it('should cover _readToUnicode highlighted name path, stream path, odd token path and surrogate token path', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        spyOn(_PdfCharacterMapFactory.prototype, '_create').and.callFake(function (cmapObj: unknown): unknown {
            if (cmapObj instanceof _PdfName) {
                return {
                    getMap: function (): (string | number)[] {
                        const map: (string | number)[] = [];
                        map[0] = 'A';
                        return map;
                    }
                };
            }

            return {
                _map: new Array(3),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, 'A');
                    callback(2, '\uD800\uDC00');
                }
            };
        });

        const nameResult: any = helper._readToUnicode(_PdfName.get('Any-CMap'));
        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;

        // Act
        const streamResult: any = helper._readToUnicode(streamObject);

        // Assert
        expect(nameResult).toBeTruthy();
        expect(streamResult).toBeTruthy();
        expect(streamResult._get(0)).toBe('A');
        expect(typeof streamResult._get(1)).toBe('string');
        expect(typeof streamResult._get(2)).toBe('string');
    });
    it('should cover _getBaseFontMetrics highlighted switch cases, _adjustWidths and helper getters', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];
        helper._fontStructure._widths = { 1: 200, 2: 300 } as never;
        helper._fontStructure._defaultWidth = 400;

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({} as never);
        spyOn(helper, '_getMetrics').and.returnValue([
            'Courier',
            'Courier-Bold',
            'Courier-BoldOblique',
            'Courier-Oblique',
            'Helvetica',
            'Helvetica-Bold',
            'Helvetica-BoldOblique',
            'Helvetica-Oblique',
            'Symbol',
            'Times-Roman',
            'Times-Bold',
            'Times-BoldItalic',
            'Times-Italic',
            'ZapfDingbats'
        ] as never);

        spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
            return {
                _courier: { tag: 'courier' },
                _courierBold: { tag: 'courierBold' },
                _courierBoldOblique: { tag: 'courierBoldOblique' },
                _courierOblique: { tag: 'courierOblique' },
                _helveticaWidths: { tag: 'helvetica' },
                _helveticaBold: { tag: 'helveticaBold' },
                _helveticaBoldOblique: { tag: 'helveticaBoldOblique' },
                _helveticaOblique: { tag: 'helveticaOblique' },
                _symbol: 700,
                _timesRoman: { tag: 'timesRoman' },
                _timesBold: { tag: 'timesBold' },
                _timesBoldItalic: { tag: 'timesBoldItalic' },
                _timesItalic: { tag: 'timesItalic' },
                _zapfDingbats: { tag: 'zapf' }
            };
        });

        spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({ Times: true } as never);

        // Act
        helper._adjustWidths();

        const courierBoldObliqueResult: any = helper._getBaseFontMetrics('Courier-BoldOblique');
        const courierObliqueResult: any = helper._getBaseFontMetrics('Courier-Oblique');
        const helveticaBoldObliqueResult: any = helper._getBaseFontMetrics('Helvetica-BoldOblique');
        const helveticaObliqueResult: any = helper._getBaseFontMetrics('Helvetica-Oblique');
        const timesBoldResult: any = helper._getBaseFontMetrics('Times-Bold');
        const timesBoldItalicResult: any = helper._getBaseFontMetrics('Times-BoldItalic');
        const symbolResult: any = helper._getBaseFontMetrics('Symbol');

        const metricsResult: any = helper._getMetrics();
        const standardFontNameResult: any = helper._getStandardFontName('Arial_MT');
        const normalizedFontNameResult: string = helper._normalizeFontName('Arial_MT');
        const serifResult: boolean = helper._isSerifFont('Times-Roman');

        // Assert
        expect(helper._fontStructure._widths[1]).toBe(100);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._defaultWidth).toBe(200);

        expect(courierBoldObliqueResult.widths).toEqual({ tag: 'courierBoldOblique' });
        expect(courierObliqueResult.widths).toEqual({ tag: 'courierOblique' });
        expect(helveticaBoldObliqueResult.widths).toEqual({ tag: 'helveticaBoldOblique' });
        expect(helveticaObliqueResult.widths).toEqual({ tag: 'helveticaOblique' });
        expect(timesBoldResult.widths).toEqual({ tag: 'timesBold' });
        expect(timesBoldItalicResult.widths).toEqual({ tag: 'timesBoldItalic' });
        expect(symbolResult.defaultWidth).toBe(700);
        expect(symbolResult.monospace).toBeTruthy();

        expect(metricsResult.length).toBeGreaterThan(0);
        expect(normalizedFontNameResult).toBe('Arial-MT');
        expect(serifResult).toBeTruthy();
        expect(standardFontNameResult).toBeUndefined();
    });

    it('should cover highlighted _extractWidths break and continue branches safely', () => {
        // Arrange
        const helperBreakContinue: _FontHelper = createHelper();
        helperBreakContinue._fontStructure._composite = true;
        helperBreakContinue._vertical = false;

        const descriptorBreakContinue: _PdfDictionary = createDictionary({
            DW: 500,
            W: [
                'not-an-integer',
                [100],
                5,
                7,
                'not-a-number',
                9,
                { bad: true }
            ]
        });

        // Act
        helperBreakContinue._extractWidths(descriptorBreakContinue, 0, 0, createDictionary({}));

        // Assert
        expect(helperBreakContinue._fontStructure._defaultWidth).toBe(500);

        // Arrange
        const helperContinueRange: _FontHelper = createHelper();
        helperContinueRange._fontStructure._composite = true;
        helperContinueRange._vertical = true;

        const helperContinueCrossReference = helperContinueRange._crossReference as unknown as { _fetch: jasmine.Spy };
        helperContinueCrossReference._fetch.and.callFake(function (value: unknown): unknown {
            const reference: _PdfReference & { _value?: unknown } =
                value as _PdfReference & { _value?: unknown };
            if (reference && typeof reference === 'object' && '_value' in reference) {
                return reference._value;
            }
            return value;
        });

        const descriptorContinueRange: _PdfDictionary = createDictionary({
            DW: 500,
            W: [
                1,
                3,
                'bad-width'
            ],
            DW2: [880, -1000],
            W2: [
                createReference('bad-start'),
                [1, 2, 3],
                createReference(10),
                createReference(12),
                createReference('bad-vmetric'),
                createReference(20),
                createReference({ bad: true })
            ]
        });

        // Act
        helperContinueRange._extractWidths(descriptorContinueRange, 0, 0, createDictionary({}));

        // Assert
        expect(helperContinueRange._fontStructure._widths[1]).toBeUndefined();
        expect(helperContinueRange._fontStructure._widths[2]).toBeUndefined();
        expect(helperContinueRange._fontStructure._widths[3]).toBeUndefined();
    });

    function createReference(value: unknown): _PdfReference {
        const reference: _PdfReference & { _value?: unknown } = Object.create(_PdfReference.prototype);
        reference._value = value;
        return reference as _PdfReference;
    }
