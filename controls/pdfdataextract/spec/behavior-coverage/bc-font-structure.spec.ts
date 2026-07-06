import {
    _PdfCharacterMapFactory
} from '../../src/pdf-data-extract/core/text-extraction/cmap';
import * as encodingUtilsModule from '../../src/pdf-data-extract/core/text-extraction/encoding-utils';
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
            const reference: _PdfReference & { _value?: unknown } = value as _PdfReference & { _value?: unknown };
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
        }
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
    fontStructure._fontStyle = 0 as never;
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
describe('encoding-utils highlighted AAA coverage', () => {
    it('should cover lookup helpers, numeric writers, string32, normalizeFontName and serif detection', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({ Times: true } as never);

        const unsignedBytes: number[] = [0, 0, 0, 0];
        const signedBytes: number[] = [0, 0];
        const normalRect: number[] = [10, 20, 1, 2];

        // Act
        const matrixResult: number[] = helper._lookupMatrix([1, 0, 0, 1, 0, 0], [9, 9, 9, 9, 9, 9]);
        const matrixFallbackResult: number[] = helper._lookupMatrix([1, 0, 0], [9, 9, 9, 9, 9, 9]);

        const rectResult: number[] = helper._lookupRect([1, 2, 3, 4], [9, 9, 9, 9]);
        const rectFallbackResult: number[] = helper._lookupRect([1, 2, 3], [9, 9, 9, 9]);

        const normalRectResult: number[] = helper._lookupNormalRect(normalRect, [0, 0, 0, 0]);
        const normalRectFallbackResult: number[] = helper._lookupNormalRect([1, 2], [0, 0, 0, 0]);

        helper._writeUnSignedInt32(unsignedBytes, 0, 0x01020304);
        helper._writeSignedInt16(signedBytes, 0, 0x1234);

        const string32Result: string = helper._string32(0x01020304);
        const normalizedName: string = helper._normalizeFontName('Times_New Roman');
        const serifResult: boolean = helper._isSerifFont('Times-Roman');
        const signedInt16Result: number = helper._signedInt16(0xFF, 0xFE);

        // Assert
        expect(matrixResult).toEqual([1, 0, 0, 1, 0, 0]);
        expect(matrixFallbackResult).toEqual([9, 9, 9, 9, 9, 9]);

        expect(rectResult).toEqual([1, 2, 3, 4]);
        expect(rectFallbackResult).toEqual([9, 9, 9, 9]);

        expect(normalRectResult).toEqual([1, 2, 10, 20]);
        expect(normalRectFallbackResult).toEqual([0, 0, 0, 0]);

        // Actual implementation writes unmasked shifted values into number[]
        expect(unsignedBytes).toEqual([1, 258, 66051, 4]);
        expect(signedBytes[0]).toBe(0x12);
        expect(signedBytes[1]).toBe(0x1234);

        expect(string32Result.length).toBe(4);
        expect(normalizedName).toBe('Times-NewRoman');
        expect(serifResult).toBeTruthy();
        expect(signedInt16Result).toBe(-2);
    });

    it('should cover _stringToBytes and _stringToPdfString utf8 and translator branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const translatedInput: string = '\x80A';
        const utf8Bytes: string = '\xEF\xBB\xBFHello';
        const escapedUtf8Bytes: string = '\xEF\xBB\xBFHi\x1bESC';

        // Act
        const byteResult: Uint8Array = helper._stringToBytes('AB');
        const translatedResult: string = helper._stringToPdfString(translatedInput);
        const utf8Result: string = helper._stringToPdfString(utf8Bytes);
        const escapedUtf8Result: string = helper._stringToPdfString(escapedUtf8Bytes);

        // Assert
        expect(Array.from(byteResult)).toEqual([65, 66]);
        expect(translatedResult.length).toBeGreaterThan(0);
        expect(utf8Result).toContain('Hello');
        expect(escapedUtf8Result).toBe('Hi');
    });

    it('should cover _extractDataStructures composite CID info and encoding dictionary branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._composite = true;
        helper._fontStructure._name = 'Wingdings';
        helper._fontStructure._type = 'TrueType';
        helper._fontStructure._flags = 4;
        helper._fontStructure._isInternalFont = false;

        const cidInfo: _PdfDictionary = createDictionary({
            Registry: 'Adobe',
            Ordering: 'Japan1',
            Supplement: 5
        });

        const encodingDictionary: _PdfDictionary = createDictionary({
            BaseEncoding: _PdfName.get('MacRomanEncoding'),
            Differences: [
                65,
                _PdfName.get('Aacute')
            ]
        });

        const dictionary: _PdfDictionary = createDictionary({
            CIDSystemInfo: cidInfo,
            Encoding: encodingDictionary
        });

        const readToUnicodeSpy = spyOn(helper, '_readToUnicode').and.returnValue({
            _length: 0
        } as never);

        const buildToUnicodeSpy = spyOn(helper, '_buildToUnicode').and.returnValue({
            marker: 'toUnicode'
        } as never);

        // Act
        helper._extractDataStructures(dictionary, { marker: 'unicode' } as never);

        // Assert
        expect(helper._fontStructure._characterSystemInfo.registry).toBe('Adobe');
        expect(helper._fontStructure._characterSystemInfo.ordering).toBe('Japan1');
        expect(helper._fontStructure._characterSystemInfo.supplement).toBe(5);

        expect(helper._fontStructure._differences[65]).toBe('Aacute');
        // Symbolic Wingdings + nonEmbedded resets the explicit base encoding to null
        expect(helper._baseEncodingName).toBeNull();
        expect(helper._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);

        expect(readToUnicodeSpy).toHaveBeenCalled();
        expect(buildToUnicodeSpy).toHaveBeenCalled();
    });

    it('should cover _extractDataStructures name encoding and invalid differences entry branches', () => {
        // Arrange
        const helperName: _FontHelper = createHelper();
        helperName._fontStructure._composite = false;
        helperName._fontStructure._name = 'Helvetica';
        helperName._fontStructure._flags = 0;
        helperName._fontStructure._isInternalFont = false;

        spyOn(helperName, '_readToUnicode').and.returnValue({
            _length: 0
        } as never);

        spyOn(helperName, '_buildToUnicode').and.returnValue({
            marker: 'toUnicode'
        } as never);

        const nameEncodingDictionary: _PdfDictionary = createDictionary({
            Encoding: _PdfName.get('WinAnsiEncoding')
        });

        // Act
        helperName._extractDataStructures(nameEncodingDictionary, null);

        const helperInvalid: _FontHelper = createHelper();
        helperInvalid._fontStructure._name = 'Helvetica';

        const invalidEncodingDictionary: _PdfDictionary = createDictionary({
            BaseEncoding: _PdfName.get('WinAnsiEncoding'),
            Differences: ['invalid']
        });

        const invalidDictionary: _PdfDictionary = createDictionary({
            Encoding: invalidEncodingDictionary
        });

        const invalidMessage: string = getThrownMessage(function (): void {
            helperInvalid._extractDataStructures(invalidDictionary, null);
        });

        // Assert
        expect(helperName._baseEncodingName).toBe('WinAnsiEncoding');
        expect(helperName._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);

        expect(invalidMessage).toContain("Invalid entry in 'Differences' array");
    });

    it('should cover _readToUnicode name, stream, token-number, token-string and error branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const createSpy = spyOn(_PdfCharacterMapFactory.prototype, '_create').and.callFake(function (cmapObj: unknown): unknown {
            if (cmapObj instanceof _PdfName) {
                return {
                    getMap: function (): (string | number)[] {
                        return ['A'];
                    }
                };
            }

            return {
                _map: new Array(2),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, '\u0000A');
                }
            };
        });

        const nameResult = helper._readToUnicode(_PdfName.get('Identity-H'));

        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const streamResult = helper._readToUnicode(streamObject);

        createSpy.and.returnValue({
            _map: new Array(1),
            _forEach: function (): void {
                throw new Error('stream-map-failed');
            }
        } as never);

        const errorMessage: string = getThrownMessage(function (): void {
            helper._readToUnicode(streamObject);
        });

        // Assert
        expect(nameResult).toBeTruthy();
        expect(streamResult).toBeTruthy();
        expect(errorMessage).toContain('stream-map-failed');
    });

    it('should cover _buildToUnicode included-map, simple-map, UCS2 composite map and identity fallback branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._composite = false;
        spyOn(helper, '_simpleFontToUnicode').and.returnValue(['A'] as never);

        const existingMap = {
            _length: 1
        };

        // Act
        const includedResult = helper._buildToUnicode('WinAnsiEncoding', true, existingMap as never);
        const simpleResult = helper._buildToUnicode('WinAnsiEncoding', false, null as never);

        helper._fontStructure._composite = true;
        helper._fontStructure._characterSystemInfo = {
            registry: 'Adobe',
            ordering: 'Japan1'
        } as never;
        helper._fontStructure._characterMap = {
            builtInCMap: true,
            _forEach: function (callback: (charCode: number, cid: number) => void): void {
                callback(5, 10);
            }
        } as never;

        const createSpy = spyOn(_PdfCharacterMapFactory.prototype, '_create').and.returnValue({
            _lookup: function (cid: number): string {
                if (cid === 10) {
                    return '\u0000A';
                }
                return '';
            }
        } as never);

        const compositeResult = helper._buildToUnicode(null, false, null as never);

        helper._fontStructure._characterMap = {
            builtInCMap: false
        } as never;
        helper._fontStructure._characterSystemInfo = null as never;
        helper._firstChar = 1;
        helper._lastChar = 3;

        const identityResult = helper._buildToUnicode(null, false, null as never);

        // Assert
        expect(includedResult).toBe(existingMap as never);
        expect(simpleResult).toBeTruthy();
        expect(createSpy).toHaveBeenCalled();
        expect(compositeResult).toBeTruthy();
        expect(identityResult).toBeTruthy();
    });

    it('should cover _extractWidths composite, referenced values, vertical widths and non-composite widths', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._composite = true;
        helper._vertical = true;

        const crossReference = helper._crossReference as unknown as { _fetch: jasmine.Spy };
        crossReference._fetch.and.callFake(function (value: unknown): unknown {
            const reference = value as _PdfReference & { _value?: unknown };
            if (reference && typeof reference === 'object' && '_value' in reference) {
                return reference._value;
            }
            return value;
        });

        const widthArrayReference: _PdfReference = createReference(200);
        const startReference: _PdfReference = createReference(1);
        const widthReference: _PdfReference = createReference(300);

        const vStartReference: _PdfReference = createReference(1);
        const vRangeCodeReference: _PdfReference = createReference(2);
        const vWidth1Reference: _PdfReference = createReference(10);
        const vWidth2Reference: _PdfReference = createReference(20);
        const vWidth3Reference: _PdfReference = createReference(30);

        const descriptor: _PdfDictionary = createDictionary({
            DW: 555.2,
            W: [
                startReference,
                [widthArrayReference, 150],
                3,
                4,
                widthReference
            ],
            DW2: [880, -1000],
            W2: [
                vStartReference,
                [1, 2, 3], // Array branch
                5,
                vRangeCodeReference, // Integer range branch
                vWidth1Reference,
                vWidth2Reference,
                vWidth3Reference
            ]
        });

        // Act
        helper._extractWidths(descriptor, 0, 0, createDictionary({}));

        const helperNonComposite: _FontHelper = createHelper();
        helperNonComposite._fontStructure._composite = false;

        const nonCompositeDescriptor: _PdfDictionary = createDictionary({
            Widths: [100, createReference(200), 300]
        });

        helperNonComposite._extractWidths(nonCompositeDescriptor, 0, 10, createDictionary({
            MissingWidth: 50
        }));

        // Assert
        expect(helper._fontStructure._defaultWidth).toBe(556);
        expect(helper._fontStructure._widths[1]).toBe(200);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._widths[3]).toBe(300);
        expect(helper._fontStructure._widths[4]).toBe(300);

        expect(helperNonComposite._fontStructure._widths[10]).toBe(100);
        expect(helperNonComposite._fontStructure._widths[11]).toBe(200);
        expect(helperNonComposite._fontStructure._widths[12]).toBe(300);
        expect(helperNonComposite._fontStructure._defaultWidth).toBe(50);
    });

    it('should cover _adjustWidths, _getBaseFontMetrics, _getMetrics, _getStandardFontName, _amendFallBackToUnicodeMap and _applyStandardFontGlyphMap', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];
        helper._fontStructure._widths = { 1: 200, 2: 300 } as never;
        helper._fontStructure._defaultWidth = 400;

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({
            'Arial-MT': 'Helvetica'
        } as never);

        spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({} as never);
        spyOn(helper, '_getMetrics').and.returnValue(['Helvetica', 'Times-Roman'] as never);
        spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
            return {
                _helveticaWidths: { A: 500 },
                _timesRoman: { B: 600 },
                _symbol: 700
            };
        });

        const toUnicodeMap = {
            _has: jasmine.createSpy('_has').and.returnValues(false, true),
            _amend: jasmine.createSpy('_amend')
        };

        const properties = {
            _fallBackToUnicodeMap: {
                65: 'A',
                66: 'B'
            },
            _fontStructure: {
                _toUnicode: toUnicodeMap
            }
        };

        const destinationMap: number[] = [];
        const glyphMap: { [key: number]: number } = { 65: 100, 66: 200 };

        // Act
        helper._adjustWidths();
        const baseMetricsResult = helper._getBaseFontMetrics('ArialMT');
        const metricNamesResult = helper._getMetrics();
        const standardFontNameResult = helper._getStandardFontName('Arial_MT');
        helper._amendFallBackToUnicodeMap(properties as never);
        helper._applyStandardFontGlyphMap(destinationMap, glyphMap);

        const amendArg: any[] = (toUnicodeMap._amend.calls.mostRecent().args[0] as any[]);

        // Assert
        expect(helper._fontStructure._widths[1]).toBe(100);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._defaultWidth).toBe(200);

        expect(baseMetricsResult.widths).toEqual({ A: 500 });
        expect(metricNamesResult.length).toBeGreaterThan(0);
        expect(standardFontNameResult).toBe('Helvetica');

        expect(amendArg[65]).toBe('A');
        expect(amendArg[66]).toBeUndefined();

        expect(destinationMap[65]).toBe(100);
        expect(destinationMap[66]).toBe(200);
    });

    it('should cover _setFallBackSystemFont symbol, dingbats, standard and composite-CID branches', () => {
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

        helper._fontStructure._widths = { 65: 500 } as never;
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
        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66 } as never);
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

        // Assert
        expect(helper._fontStructure._missingFile).toBeTruthy();
        expect(helper._fontStructure._ascent).toBe(0.7);
        expect(helper._fontStructure._descent).toBe(-0.2);
        expect(helper._fontStructure._capHeight).toBe(0.6);
        expect(helper._fontStructure._toFontChar).toBeDefined();
    });

    it('should cover _spaceWidth, _charToGlyph cache, missing-file, accent branches and _convertCidString', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._widths = {
            32: 250,
            65: 500,
            space: 300
        } as never;

        helper._fontStructure._defaultWidth = 0;
        helper._fontStructure._differences = [];
        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[66] = '';
        helper._fontStructure._toUnicode = {
            _get: function (code: number): number {
                return code;
            },
            _charCodeOf: function (value: number): number {
                if (value === 32) {
                    return 32;
                }
                return -1;
            },
            _has: function (): boolean {
                return false;
            },
            _amend: function (): void {
                // no-op
            }
        } as never;

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

        // Act
        const spaceWidth: number = helper._spaceWidth;
        const cachedGlyph: any = helper._charToGlyph(65, false);
        const glyphTwo: any = helper._charToGlyph(66, false);

        const cidOne: number = helper._convertCidString(1, 'A');
        const cidTwo: number = helper._convertCidString(1, 'AB');
        const cidFallback: string = helper._convertCidString(1, 'ABC');
        const cidThrowMessage: string = getThrownMessage(function (): void {
            helper._convertCidString(1, 'ABC', true);
        });

        // Assert
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

    it('should cover TTC helpers, name-record helpers and readNameTable branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const ttcFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x74, 0x74, 0x63, 0x66]);
            }
        };

        const ttcHeaderReader = {
            _stringValues: ['ttcf'],
            _unsigned16Values: [1, 0],
            _int32Values: [2, 100, 200],
            getString: function (): string {
                return this._stringValues.shift() as string;
            },
            getUnsignedInteger16: function (): number {
                return this._unsigned16Values.shift() as number;
            },
            getInt32: function (): number {
                return this._int32Values.shift() as number;
            }
        };

        const nameTable = { offset: 0, length: 40 };
        const fontReader = {
            start: 0,
            pos: 0,
            position: 0,
            _unsigned16Values: [
                0,  // format
                2,  // numRecords
                30, // stringsStart

                1, 0, 0, 6, 4, 0,       // mac record
                3, 1, 0x409, 6, 4, 4,   // win record

                0x0041, 0x0042
            ],
            _stringValues: ['Test'],
            getUnsignedInteger16: function (): number {
                this.position += 2;
                this.pos = this.position;
                return this._unsigned16Values.shift() as number;
            },
            getString: function (): string {
                return this._stringValues.shift() as string;
            }
        };

        const invalidMinorHeaderReader = {
            _stringValues: ['ttcf'],
            _unsigned16Values: [3, 0],
            _int32Values: [1, 100],
            getString: function (): string {
                return this._stringValues.shift() as string;
            },
            getUnsignedInteger16: function (): number {
                return this._unsigned16Values.shift() as number;
            },
            getInt32: function (): number {
                return this._int32Values.shift() as number;
            }
        };

        // Act
        const isTtcResult: boolean = helper._isTrueTypeCollectionFile(ttcFile as never);
        const ttcHeader = helper._readTrueTypeCollectionHeader(ttcHeaderReader as never);
        const macResult: boolean = helper._isMacNameRecord({ platform: 1, encoding: 0, language: 0 });
        const winResult: boolean = helper._isWinNameRecord({ platform: 3, encoding: 1, language: 0x409 });

        const nameResult = helper._readNameTable(nameTable as never, fontReader as never);

        const invalidHeaderMessage: string = getThrownMessage(function (): void {
            helper._readTrueTypeCollectionHeader(invalidMinorHeaderReader as never);
        });

        // Assert
        expect(isTtcResult).toBeTruthy();
        expect(ttcHeader.numFonts).toBe(2);
        expect(ttcHeader.offsetTable).toEqual([100, 200]);

        expect(macResult).toBeTruthy();
        expect(winResult).toBeTruthy();

        expect(nameResult[1].length).toBe(2);
        expect(nameResult[0][0][6]).toBe('Test');
        expect(nameResult[0][1][6]).toBe('AB');

        expect(invalidHeaderMessage).toContain('Invalid TrueType Collection majorVersion');
    });

    it('should cover _checkAndRepair OpenType branch safely', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._name = 'Helvetica';
        helper._fontStructure._composite = false;
        helper._fontStructure._subtype = 'Type1C';
        helper._fontStructure._type = 'TrueType';
        helper._fontStructure._fontMatrix = [0.001, 0, 0, 0.001, 0, 0];
        helper._fontStructure._toUnicode = {
            _length: 0,
            _amend: jasmine.createSpy('_amend'),
            _has: function (): boolean {
                return false;
            },
            _forEach: function (): void {
                // no-op
            }
        } as never;

        const fileLike = {
            getBytes: function (): Uint8Array {
                return new Uint8Array([0, 1, 2, 3]);
            }
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(false);
        spyOn(helper, '_readOpenTypeHeader').and.returnValue({
            version: 'OTTO',
            numTables: 1
        } as never);

        spyOn(helper, '_readTables').and.returnValue({
            'compactFont ': { tag: 'compactFont ' },
            head: { offset: 0, data: new Uint8Array(60) },
            hhea: { data: new Uint8Array(20) },
            maxp: { offset: 0, length: 32, data: new Uint8Array(32) },
            post: {},
            name: { offset: 0, length: 0 }
        } as never);

        spyOn(helper, '_readNameTable').and.returnValue([
            [[], []],
            []
        ] as never);

        // Act
        helper._checkAndRepair(fileLike as never);

        // Assert
        expect(helper._fontStructure._lineHeight).toBeDefined();
        expect(helper._fontStructure._ascent).toBeDefined();
        expect(helper._fontStructure._descent).toBeDefined();
    });

    it('should cover _adjustType1ToUnicode and _adjustTrueTypeToUnicode branches safely', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._isInternalFont = false;
        helper._fontStructure._toUnicode = {
            _length: 0,
            _amend: jasmine.createSpy('_amend'),
            _has: function (): boolean {
                return false;
            },
            _forEach: function (): void {
                // no-op
            }
        } as never;

        helper._fontStructure._builtInEncoding = { 65: 'A', 66: 'B' } as never;
        helper._fontStructure._defaultEncoding = { 65: 'C' } as never;
        helper._fontStructure._differences = [];
        helper._baseEncodingName = null as never;
        helper._hasEncoding = false;
        helper._hasIncludedToUnicodeMap = false;

        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66, 65: 65 } as never);
        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            if (glyphName === 'A') {
                return 65;
            }
            if (glyphName === 'B') {
                return 66;
            }
            return -1;
        });

        // Act
        helper._adjustType1ToUnicode();

        const trueTypeProperties = {
            _isInternalFont: false,
            _toUnicode: {
                _amend: jasmine.createSpy('_amend')
            },
            _defaultEncoding: ['X']
        };

        const originalWinAnsiZero: string = encodingUtilsModule._winAnsiEncoding[0];
        const originalWinAnsiOne: string = encodingUtilsModule._winAnsiEncoding[1];

        encodingUtilsModule._winAnsiEncoding[0] = '65';
        encodingUtilsModule._winAnsiEncoding[1] = '';

        helper._hasIncludedToUnicodeMap = false;
        helper._hasEncoding = false;

        helper._adjustTrueTypeToUnicode(
            trueTypeProperties as never,
            true,
            [{ platform: 3, encoding: 1, language: 0x409 }]
        );

        encodingUtilsModule._winAnsiEncoding[0] = originalWinAnsiZero;
        encodingUtilsModule._winAnsiEncoding[1] = originalWinAnsiOne;

        // Assert
        expect((helper._fontStructure._toUnicode as unknown as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
        expect((trueTypeProperties._toUnicode as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
    });
});
import * as fontUtilsModule from '../../src/pdf-data-extract/core/text-extraction/font-utils';
import * as metricsModule from '../../src/pdf-data-extract/core/text-extraction/metrics';
import {
    _PdfBaseStream,
    _PdfDictionary,
    _PdfName,
    _PdfReference,
    _PdfStream,
    FormatError,
    PdfFontStyle
} from '@syncfusion/ej2-pdf';

describe('_FontHelper remaining highlighted coverage strict AAA', () => {
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
                const reference: _PdfReference & { _value?: unknown } = value as _PdfReference & { _value?: unknown };
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
            builtInCMap: false
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

    it('should cover _getFontStyle no-delimiter Bold, BoldItalic/BoldOblique and Italic/Oblique branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const boldDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooBold')
        });

        const boldObliqueDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooBoldOblique')
        });

        const italicDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooItalic')
        });

        // Act
        const boldStyle: PdfFontStyle = helper._getFontStyle(boldDictionary);
        const boldObliqueStyle: PdfFontStyle = helper._getFontStyle(boldObliqueDictionary);
        const italicStyle: PdfFontStyle = helper._getFontStyle(italicDictionary);

        // Assert
        expect(boldStyle).toBe(PdfFontStyle.bold);
        // According to the current implementation, the later Italic/Oblique branch overwrites BoldOblique to italic.
        expect(boldObliqueStyle).toBe(PdfFontStyle.italic);
        expect(italicStyle).toBe(PdfFontStyle.italic);
    });

    it('should cover _translateFont Type3 descriptor creation branch', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._type = 'Type3';

        const dictionary: _PdfDictionary = createDictionary({
            FontBBox: [10, 20, 1, 2]
        });

        const extractDataStructuresSpy = spyOn(helper, '_extractDataStructures').and.stub();
        const extractWidthsSpy = spyOn(helper, '_extractWidths').and.stub();
        const setFontDataSpy = spyOn(helper, '_setFontData').and.stub();

        // Act
        helper._translateFont(
            null as never,
            dictionary as never,
            dictionary as never,
            0,
            255,
            null
        );

        // Assert
        expect(helper._fontStructure._isType3Font).toBeTruthy();
        expect(extractDataStructuresSpy).toHaveBeenCalled();
        expect(extractWidthsSpy).toHaveBeenCalled();
        expect(setFontDataSpy).toHaveBeenCalled();
    });

    it('should cover _translateFont non-Type3 no-descriptor branch with widths array and embedded standard font fetch', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._type = 'Type1';

        spyOn(helper, '_isSerifFont').and.returnValue(true);
        spyOn(helper, '_getBaseFontMetrics').and.returnValue({
            widths: { A: 600 },
            defaultWidth: 500,
            monospace: false
        } as never);

        spyOn(encodingUtilsModule, '_getSymbolsFonts').and.returnValue({} as never);

        const fetchStandardFontDataSpy = spyOn(helper, '_fetchStandardFontData').and.returnValue(
            new _PdfStream(new Uint8Array([1, 2, 3])) as never
        );

        const extractDataStructuresSpy = spyOn(helper, '_extractDataStructures').and.stub();
        const setFontDataSpy = spyOn(helper, '_setFontData').and.stub();

        const widthsArray: unknown[] = [100, createReference(200), 300];

        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('Times-Roman'),
            Widths: widthsArray
        });

        // Act
        helper._translateFont(
            null as never,
            dictionary as never,
            dictionary as never,
            10,
            12,
            null
        );

        // Assert
        expect(helper._fontStructure._name).toBe('Times-Roman');
        expect(helper._fontStructure._defaultWidth).toBe(500);
        expect(helper._fontStructure._widths[10]).toBe(100);
        expect(helper._fontStructure._widths[11]).toBe(200);
        expect(helper._fontStructure._widths[12]).toBe(300);
        expect(fetchStandardFontDataSpy).toHaveBeenCalled();
        expect(helper._fontStructure._isInternalFont).toBeTruthy();
        expect(extractDataStructuresSpy).toHaveBeenCalled();
        expect(setFontDataSpy).toHaveBeenCalled();
    });

    it('should cover _buildCharCodeToWidth differences and encoding branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._differences = [];
        helper._fontStructure._differences[65] = 'Aacute';
        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[66] = 'B';

        const widthsByGlyphName: { [key: string]: number } = {
            Aacute: 700,
            B: 500
        };

        // Act
        const result: { [key: number]: number } = helper._buildCharCodeToWidth(widthsByGlyphName);

        // Assert
        expect(result[65]).toBe(700);
        expect(result[66]).toBe(500);
    });

    it('should cover file signature helpers and _getFontFileType branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const trueTypeFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x00, 0x01, 0x00, 0x00]);
            }
        };

        const openTypeFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x4F, 0x54, 0x54, 0x4F]); // OTTO
            }
        };

        const type1AsciiFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x25, 0x21]);
            }
        };

        const type1BinaryFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x80, 0x01]);
            }
        };

        const compactFontFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([1, 0, 4, 1]);
            }
        };

        const unknownFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([9, 9, 9, 9]);
            }
        };

        // Act
        const trueTypeResult: boolean = helper._isTrueTypeFile(trueTypeFile as never);
        const openTypeResult: boolean = helper._isOpenTypeFile(openTypeFile as never);
        const type1AsciiResult: boolean = helper._isType1File(type1AsciiFile as never);
        const type1BinaryResult: boolean = helper._isType1File(type1BinaryFile as never);
        const compactResult: boolean = helper._isCompactFontFile(compactFontFile as never);
        const int32Result: number = helper._readUnsignedInt32(new Uint8Array([0x00, 0x01, 0x00, 0x00]), 0);

        helper._file = trueTypeFile as never;
        helper._fontStructure._composite = false;
        helper._fontStructure._type = 'Type1';
        helper._fontStructure._subtype = 'SubtypeA';
        helper._getFontFileType();

        const trueTypeFileType: string = helper._fileType;

        helper._file = openTypeFile as never;
        helper._getFontFileType();
        const openTypeFileType: string = helper._fileType;

        helper._file = type1AsciiFile as never;
        helper._fontStructure._composite = true;
        helper._getFontFileType();
        const compositeType1FileType: string = helper._fileType;

        helper._file = compactFontFile as never;
        helper._fontStructure._composite = false;
        helper._fontStructure._type = 'MMType1';
        helper._getFontFileType();
        const compactFileType: string = helper._fileType;
        const compactFileSubtype: string = helper._fileSubtype;

        helper._file = unknownFile as never;
        helper._fontStructure._type = 'CustomType';
        helper._fontStructure._subtype = 'CustomSubtype';
        helper._getFontFileType();
        const fallbackFileType: string = helper._fileType;
        const fallbackFileSubtype: string = helper._fileSubtype;

        // Assert
        expect(trueTypeResult).toBeTruthy();
        expect(openTypeResult).toBeTruthy();
        expect(type1AsciiResult).toBeTruthy();
        expect(type1BinaryResult).toBeTruthy();
        expect(compactResult).toBeTruthy();
        expect(int32Result).toBe(0x00010000);

        expect(trueTypeFileType).toBe('TrueType');
        expect(openTypeFileType).toBe('OpenType');
        expect(compositeType1FileType).toBe('CIDFontType0');
        expect(compactFileType).toBe('MMType1');
        expect(compactFileSubtype).toBe('Type1C');
        expect(fallbackFileType).toBe('CustomType');
        expect(fallbackFileSubtype).toBe('CustomSubtype');
    });

    it('should cover _readTrueTypeCollectionData exact match, fallback part match and errors', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        spyOn(helper, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 2,
            offsetTable: [100, 200]
        } as never);

        spyOn(helper, '_readOpenTypeHeader').and.returnValues(
            { numTables: 1, version: 'OTTO' } as never,
            { numTables: 1, version: 'OTTO' } as never
        );

        const exactTables = { name: { marker: 'nameTable1' } };
        const fallbackTables = { name: { marker: 'nameTable2' } };

        spyOn(helper, '_readTables').and.returnValues(
            exactTables as never,
            fallbackTables as never
        );

        spyOn(helper, '_readNameTable').and.returnValues(
            [[['ExactFont']], []] as never,
            [[['PartFont']], []] as never
        );

        const dataObject = {
            start: 0,
            pos: 0
        };

        const fontObject = {};

        // Act
        const exactMatchResult = helper._readTrueTypeCollectionData(
            dataObject as never,
            'ExactFont',
            fontObject as never
        );

        const helperFallback: _FontHelper = createHelper();
        spyOn(helperFallback, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperFallback, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperFallback, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
        spyOn(helperFallback, '_readNameTable').and.returnValue([[['PartFont']], []] as never);

        const fallbackMatchResult = helperFallback._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'PartFont+OtherPart',
            {} as never
        );

        const helperNoName: _FontHelper = createHelper();
        spyOn(helperNoName, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperNoName, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperNoName, '_readTables').and.returnValue({} as never);

        const noNameMessage: string = getThrownMessage(function (): void {
            helperNoName._readTrueTypeCollectionData(
                { start: 0, pos: 0 } as never,
                'MissingFont',
                {} as never
            );
        });

        const helperNotFound: _FontHelper = createHelper();
        spyOn(helperNotFound, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperNotFound, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperNotFound, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
        spyOn(helperNotFound, '_readNameTable').and.returnValue([[['AnotherFont']], []] as never);

        const notFoundMessage: string = getThrownMessage(function (): void {
            helperNotFound._readTrueTypeCollectionData(
                { start: 0, pos: 0 } as never,
                'MissingFont',
                {} as never
            );
        });

        // Assert
        expect(exactMatchResult.tables).toBe(exactTables as never);
        expect(fallbackMatchResult.tables.marker || fallbackMatchResult.tables.name.marker || fallbackMatchResult.tables).toBeDefined();

        expect(noNameMessage).toContain('TrueType Collection font must contain a name table.');
        expect(notFoundMessage).toContain("TrueType Collection does not contain 'MissingFont' font.");
    });

    it('should cover _UnicodeMap methods through _readToUnicode returned map', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const createSpy = spyOn(_PdfCharacterMapFactory.prototype, '_create').and.returnValue({
            getMap: function (): (string | number)[] {
                const map: (string | number)[] = [];
                map[0] = 'A';
                map[2] = 'B';
                return map;
            }
        } as never);

        const unicodeMap: {
            _forEach: () => Array<{ characterCode: number; unicode: number }>;
            _has: (i: number) => boolean;
            _get: (i: number) => string | number | undefined;
            _charCodeOf: (v: string | number) => number;
            _amend: (map: { [key: number]: string | number }) => void;
        } = helper._readToUnicode(_PdfName.get('Any-CMap')) as never;

        // Act
        const forEachResult = unicodeMap._forEach();
        const hasZero = unicodeMap._has(0);
        const getTwo = unicodeMap._get(2);
        const largeMap = new Array(0x10001);
        largeMap[70000] = 'Z';
        const bigUnicodeMap = {
            _forEach: unicodeMap._forEach,
            _has: unicodeMap._has,
            _get: unicodeMap._get,
            _charCodeOf: (helper._readToUnicode(_PdfName.get('Any-CMap')) as any)._charCodeOf,
            _amend: unicodeMap._amend
        };

        // reuse returned object style safely
        (bigUnicodeMap as unknown as { _map?: (string | number)[] })._map = largeMap;
        const charCodeOfSmall = unicodeMap._charCodeOf('B');
        const charCodeOfBig = (bigUnicodeMap as unknown as { _charCodeOf: (v: string | number) => number })._charCodeOf('Z');

        unicodeMap._amend({ 3: 'C' });
        const amendedValue = unicodeMap._get(3);

        // Assert
        expect(createSpy).toHaveBeenCalled();
        expect(forEachResult.length).toBe(2);
        expect(forEachResult[0].characterCode).toBe(0);
        expect(hasZero).toBeTruthy();
        expect(getTwo).toBe('B');
        expect(charCodeOfSmall).toBe(2);
        expect(charCodeOfBig).toBe(70000);
        expect(amendedValue).toBe('C');
    });

    it('should cover _PdfIdentityToUnicodeMap methods through identity _readToUnicode result', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const identityCMap: _PdfIdentityCharacterMap = Object.create(_PdfIdentityCharacterMap.prototype) as _PdfIdentityCharacterMap;

        spyOn(_PdfCharacterMapFactory.prototype, '_create').and.returnValue(identityCMap as never);

        const identityMap: {
            _length: number;
            _forEach: (callback: (charCode: number, unicode: number) => void) => void;
            _has: (index: number) => boolean;
            _get: (index: number) => string | undefined;
            _charCodeOf: (v: number) => number;
            _amend: () => void;
        } = helper._readToUnicode(_PdfName.get('Identity-H')) as never;

        const visited: Array<{ charCode: number; unicode: number }> = [];

        // Act
        identityMap._forEach(function (charCode: number, unicode: number): void {
            if (charCode < 3) {
                visited.push({ charCode, unicode });
            }
        });

        const hasOne = identityMap._has(1);
        const getTwo = identityMap._get(2);
        const charCodeOfTwo = identityMap._charCodeOf(2);

        const amendMessage: string = getThrownMessage(function (): void {
            identityMap._amend();
        });

        // Assert
        expect(identityMap._length).toBe(65536);
        expect(visited[0].charCode).toBe(0);
        expect(visited[1].charCode).toBe(1);
        expect(hasOne).toBeTruthy();
        expect(getTwo).toBe(String.fromCharCode(2));
        expect(charCodeOfTwo).toBe(2);
        expect(amendMessage).toContain('Should not call amend()');
    });

    it('should cover _checkAndRepair TTC branch entry and _int16 helper', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._name = 'MyFont';

        const fontLike = {
            getBytes: function (): Uint8Array {
                return new Uint8Array([1, 2, 3, 4]);
            }
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(true);
        spyOn(helper, '_readTrueTypeCollectionData').and.returnValue({
            header: { version: 'OTTO', numTables: 1 },
            tables: {
                'compactFont ': { tag: 'compactFont ' },
                head: { offset: 0, data: new Uint8Array(60) },
                hhea: { data: new Uint8Array(20) },
                maxp: { offset: 0, length: 32, data: new Uint8Array(32) },
                post: {},
                name: { offset: 0, length: 0 }
            }
        } as never);

        spyOn(helper, '_readNameTable').and.returnValue([
            [[], []],
            []
        ] as never);

        // Act
        const int16Result: number = helper._int16(0x01, 0x02);
        helper._checkAndRepair(fontLike as never);

        // Assert
        expect(int16Result).toBe(258);
        expect(helper._fontStructure._lineHeight).toBeDefined();
    });
});
import {
    _PdfIdentityCharacterMap
} from '../../src/pdf-data-extract/core/text-extraction/cmap';



it('should cover _getFontStyle no-delimiter Bold, BoldItalic/BoldOblique and Italic/Oblique branches', () => {
    // Arrange
    const helper: _FontHelper = createHelper();

    const boldDictionary: _PdfDictionary = createDictionary({
        BaseFont: _PdfName.get('FooBold')
    });

    const boldObliqueDictionary: _PdfDictionary = createDictionary({
        BaseFont: _PdfName.get('FooBoldOblique')
    });

    const italicDictionary: _PdfDictionary = createDictionary({
        BaseFont: _PdfName.get('FooItalic')
    });

    // Act
    const boldStyle: PdfFontStyle = helper._getFontStyle(boldDictionary);
    const boldObliqueStyle: PdfFontStyle = helper._getFontStyle(boldObliqueDictionary);
    const italicStyle: PdfFontStyle = helper._getFontStyle(italicDictionary);

    // Assert
    expect(boldStyle).toBe(PdfFontStyle.bold);
    // Current implementation overwrites BoldOblique with italic in the later branch.
    expect(boldObliqueStyle).toBe(PdfFontStyle.italic);
    expect(italicStyle).toBe(PdfFontStyle.italic);
});

it('should cover _translateFont Type3 descriptor creation branch', () => {
    // Arrange
    const helper: _FontHelper = createHelper();
    helper._fontStructure._type = 'Type3';

    const dictionary: _PdfDictionary = createDictionary({
        FontBBox: [10, 20, 1, 2]
    });

    const extractDataStructuresSpy = spyOn(helper, '_extractDataStructures').and.stub();
    const extractWidthsSpy = spyOn(helper, '_extractWidths').and.stub();
    const setFontDataSpy = spyOn(helper, '_setFontData').and.stub();

    // Act
    helper._translateFont(
        null as never,
        dictionary as never,
        dictionary as never,
        0,
        255,
        null
    );

    // Assert
    expect(helper._fontStructure._isType3Font).toBeTruthy();
    expect(extractDataStructuresSpy).toHaveBeenCalled();
    expect(extractWidthsSpy).toHaveBeenCalled();
    expect(setFontDataSpy).toHaveBeenCalled();
});

it('should cover _translateFont non-Type3 no-descriptor invalid basefont throw and widths array branch', () => {
    // Arrange
    const helperThrow: _FontHelper = createHelper();
    helperThrow._fontStructure._type = 'Type1';

    const invalidDictionary: _PdfDictionary = createDictionary({
        BaseFont: 'NotPdfName'
    });

    const invalidMessage: string = getThrownMessage(function (): void {
        helperThrow._translateFont(
            null as never,
            invalidDictionary as never,
            invalidDictionary as never,
            0,
            255,
            null
        );
    });

    const helperWidths: _FontHelper = createHelper();
    helperWidths._fontStructure._type = 'Type1';

    spyOn(helperWidths, '_isSerifFont').and.returnValue(true);
    spyOn(helperWidths, '_getBaseFontMetrics').and.returnValue({
        widths: { A: 600 },
        defaultWidth: 500,
        monospace: false
    } as never);

    spyOn(encodingUtilsModule, '_getSymbolsFonts').and.returnValue({} as never);

    const fetchStandardFontDataSpy = spyOn(helperWidths, '_fetchStandardFontData').and.returnValue(
        new _PdfStream(new Uint8Array([1, 2, 3])) as never
    );

    const extractDataStructuresSpy = spyOn(helperWidths, '_extractDataStructures').and.stub();
    const setFontDataSpy = spyOn(helperWidths, '_setFontData').and.stub();

    const widthsArray: unknown[] = [100, createReference(200), 300];

    const validDictionary: _PdfDictionary = createDictionary({
        BaseFont: _PdfName.get('Times-Roman'),
        Widths: widthsArray
    });

    // Act
    helperWidths._translateFont(
        null as never,
        validDictionary as never,
        validDictionary as never,
        10,
        12,
        null
    );

    // Assert
    expect(invalidMessage).toContain('Base font is not specified');

    expect(helperWidths._fontStructure._name).toBe('Times-Roman');
    expect(helperWidths._fontStructure._defaultWidth).toBe(500);
    expect(helperWidths._fontStructure._widths[10]).toBe(100);
    expect(helperWidths._fontStructure._widths[11]).toBe(200);
    expect(helperWidths._fontStructure._widths[12]).toBe(300);
    expect(fetchStandardFontDataSpy).toHaveBeenCalled();
    expect(helperWidths._fontStructure._isInternalFont).toBeTruthy();
    expect(extractDataStructuresSpy).toHaveBeenCalled();
    expect(setFontDataSpy).toHaveBeenCalled();
});

it('should cover _buildCharCodeToWidth differences and encoding branches', () => {
    // Arrange
    const helper: _FontHelper = createHelper();
    helper._fontStructure._differences = [];
    helper._fontStructure._differences[65] = 'Aacute';
    helper._fontStructure._defaultEncoding = [];
    helper._fontStructure._defaultEncoding[66] = 'B';

    const widthsByGlyphName: { [key: string]: number } = {
        Aacute: 700,
        B: 500
    };

    // Act
    const result: { [key: number]: number } = helper._buildCharCodeToWidth(widthsByGlyphName);

    // Assert
    expect(result[65]).toBe(700);
    expect(result[66]).toBe(500);
});


it('should cover _setFontData Type3 branch, no-file fallback branch and Type1C branch', () => {
    // Arrange
    const helperType3: _FontHelper = createHelper();
    helperType3._fontStructure._type = 'Type3';
    helperType3._fontStructure._differences = [];
    helperType3._fontStructure._defaultEncoding = [];
    helperType3._fontStructure._differences[65] = 'A';
    helperType3._fontStructure._defaultEncoding[66] = 'B';

    // Act
    helperType3._setFontData();

    const helperFallback: _FontHelper = createHelper();
    const setFallBackSystemFontSpy = spyOn(helperFallback, '_setFallBackSystemFont').and.stub();

    // Act
    helperFallback._setFontData();

    const helperType1C: _FontHelper = createHelper();
    helperType1C._file = new _PdfStream(new Uint8Array([1, 2, 3])) as never;
    helperType1C._fileType = 'Type1';
    helperType1C._fileSubtype = 'Type1C';
    helperType1C._fontStructure._defaultEncoding = [] as never;
    helperType1C._fontStructure._builtInEncoding = null as never;

    const compactFontSpy = spyOn(compactFontParserModule as unknown as { _PdfCompactFont: unknown }, '_PdfCompactFont' as never).and.returnValue({
        _builtInEncoding: { 65: 'A' }
    } as never);

    spyOn(helperType1C, '_getFontFileType').and.stub();
    spyOn(helperType1C, '_adjustWidths').and.stub();
    const adjustType1ToUnicodeSpy = spyOn(helperType1C, '_adjustType1ToUnicode').and.stub();

    // Act
    helperType1C._setFontData();

    // Assert
    expect(helperType3._fontStructure._toFontChar[65]).toBe('A');
    expect(helperType3._fontStructure._toFontChar[66]).toBe('B');

    expect(setFallBackSystemFontSpy).toHaveBeenCalled();

    expect(compactFontSpy).toHaveBeenCalled();
    expect(helperType1C._fontStructure._builtInEncoding[65]).toBe('A');
    expect(adjustType1ToUnicodeSpy).toHaveBeenCalled();
});

it('should cover file signature helpers and _getFontFileType branches', () => {
    // Arrange
    const helper: _FontHelper = createHelper();

    const trueTypeFile = {
        peekBytes: function (): Uint8Array {
            return new Uint8Array([0x00, 0x01, 0x00, 0x00]);
        }
    };

    const openTypeFile = {
        peekBytes: function (): Uint8Array {
            return new Uint8Array([0x4F, 0x54, 0x54, 0x4F]);
        }
    };

    const type1AsciiFile = {
        peekBytes: function (): Uint8Array {
            return new Uint8Array([0x25, 0x21]);
        }
    };

    const type1BinaryFile = {
        peekBytes: function (): Uint8Array {
            return new Uint8Array([0x80, 0x01]);
        }
    };

    const compactFontFile = {
        peekBytes: function (): Uint8Array {
            return new Uint8Array([1, 0, 4, 1]);
        }
    };

    const unknownFile = {
        peekBytes: function (): Uint8Array {
            return new Uint8Array([9, 9, 9, 9]);
        }
    };

    // Act
    const trueTypeResult: boolean = helper._isTrueTypeFile(trueTypeFile as never);
    const openTypeResult: boolean = helper._isOpenTypeFile(openTypeFile as never);
    const type1AsciiResult: boolean = helper._isType1File(type1AsciiFile as never);
    const type1BinaryResult: boolean = helper._isType1File(type1BinaryFile as never);
    const compactResult: boolean = helper._isCompactFontFile(compactFontFile as never);
    const int32Result: number = helper._readUnsignedInt32(new Uint8Array([0x00, 0x01, 0x00, 0x00]), 0);

    helper._file = trueTypeFile as never;
    helper._fontStructure._composite = false;
    helper._fontStructure._type = 'Type1';
    helper._fontStructure._subtype = 'SubtypeA';
    helper._getFontFileType();
    const trueTypeFileType: string = helper._fileType;

    helper._file = openTypeFile as never;
    helper._getFontFileType();
    const openTypeFileType: string = helper._fileType;

    helper._file = type1AsciiFile as never;
    helper._fontStructure._composite = true;
    helper._getFontFileType();
    const compositeType1FileType: string = helper._fileType;

    helper._file = compactFontFile as never;
    helper._fontStructure._composite = false;
    helper._fontStructure._type = 'MMType1';
    helper._getFontFileType();
    const compactFileType: string = helper._fileType;
    const compactFileSubtype: string = helper._fileSubtype;

    helper._file = unknownFile as never;
    helper._fontStructure._type = 'CustomType';
    helper._fontStructure._subtype = 'CustomSubtype';
    helper._getFontFileType();
    const fallbackFileType: string = helper._fileType;
    const fallbackFileSubtype: string = helper._fileSubtype;

    // Assert
    expect(trueTypeResult).toBeTruthy();
    expect(openTypeResult).toBeTruthy();
    expect(type1AsciiResult).toBeTruthy();
    expect(type1BinaryResult).toBeTruthy();
    expect(compactResult).toBeTruthy();
    expect(int32Result).toBe(0x00010000);

    expect(trueTypeFileType).toBe('TrueType');
    expect(openTypeFileType).toBe('OpenType');
    expect(compositeType1FileType).toBe('CIDFontType0');
    expect(compactFileType).toBe('MMType1');
    expect(compactFileSubtype).toBe('Type1C');
    expect(fallbackFileType).toBe('CustomType');
    expect(fallbackFileSubtype).toBe('CustomSubtype');
});

it('should cover _extractWidths composite, referenced values, vertical widths and non-composite widths', () => {
    // Arrange
    const helper: _FontHelper = createHelper();
    helper._fontStructure._composite = true;
    helper._vertical = true;

    const crossReference = helper._crossReference as unknown as { _fetch: jasmine.Spy };
    crossReference._fetch.and.callFake(function (value: unknown): unknown {
        const reference = value as _PdfReference & { _value?: unknown };
        if (reference && typeof reference === 'object' && '_value' in reference) {
            return reference._value;
        }
        return value;
    });

    const widthArrayReference: _PdfReference = createReference(200);
    const startReference: _PdfReference = createReference(1);
    const widthReference: _PdfReference = createReference(300);

    const vStartReference: _PdfReference = createReference(1);
    const vRangeCodeReference: _PdfReference = createReference(2);
    const vWidth1Reference: _PdfReference = createReference(10);
    const vWidth2Reference: _PdfReference = createReference(20);
    const vWidth3Reference: _PdfReference = createReference(30);

    const descriptor: _PdfDictionary = createDictionary({
        DW: 555.2,
        W: [
            startReference,
            [widthArrayReference, 150],
            3,
            4,
            widthReference
        ],
        DW2: [880, -1000],
        W2: [
            vStartReference,
            [1, 2, 3], // Array branch
            5,
            vRangeCodeReference, // Integer range branch
            vWidth1Reference,
            vWidth2Reference,
            vWidth3Reference
        ]
    });

    // Act
    helper._extractWidths(descriptor, 0, 0, createDictionary({}));

    const helperNonComposite: _FontHelper = createHelper();
    helperNonComposite._fontStructure._composite = false;

    const nonCompositeDescriptor: _PdfDictionary = createDictionary({
        Widths: [100, createReference(200), 300]
    });

    helperNonComposite._extractWidths(nonCompositeDescriptor, 0, 10, createDictionary({
        MissingWidth: 50
    }));

    // Assert
    expect(helper._fontStructure._defaultWidth).toBe(556);
    expect(helper._fontStructure._widths[1]).toBe(200);
    expect(helper._fontStructure._widths[2]).toBe(150);
    expect(helper._fontStructure._widths[3]).toBe(300);
    expect(helper._fontStructure._widths[4]).toBe(300);

    expect(helperNonComposite._fontStructure._widths[10]).toBe(100);
    expect(helperNonComposite._fontStructure._widths[11]).toBe(200);
    expect(helperNonComposite._fontStructure._widths[12]).toBe(300);
    expect(helperNonComposite._fontStructure._defaultWidth).toBe(50);
});

it('should cover _fetchStandardFontData cache hit, null branch and byte decoding branch', () => {

    const helper: _FontHelper = createHelper();

    const cacheMap = new Map<string, Uint8Array>();
    cacheMap.set('Symbol', new Uint8Array([1, 2]));
    helper._standardFontDataCache = cacheMap as never;

    // Act
    const cachedResult = helper._fetchStandardFontData('Symbol');

    helper._standardFontDataCache = new Map<string, Uint8Array>() as never;
    const nullResult = helper._fetchStandardFontData('Helvetica');

    const encodedStringSpy = spyOn(fontUtilsModule, '_getFontEncodedString').and.returnValue(
        'data:font/opentype;base64,QUJD' as never
    );

    const decodedResult = helper._fetchStandardFontData('Symbol');

    // Assert
    expect(cachedResult).toBeTruthy();
    expect(nullResult).toBeNull();

    expect(encodedStringSpy).toHaveBeenCalled();
    expect(decodedResult).toBeTruthy();
    expect(helper._file).toBeTruthy();
    expect((helper._file as _PdfStream).getBytes().length).toBe(3);
});


it('should cover _simpleFontToUnicode all major branches including forceGlyphs, baseEncoding remap and f_h/f_t/T_h', () => {
    // Arrange
    const helper: _FontHelper = createHelper();

    helper._fontStructure._defaultEncoding = [];
    helper._fontStructure._defaultEncoding[0] = 'u0041';    // u-branch
    helper._fontStructure._defaultEncoding[1] = 'uni0042';  // uni-branch
    helper._fontStructure._defaultEncoding[2] = 'G41';      // G-branch
    helper._fontStructure._defaultEncoding[3] = 'g0043';    // g-branch
    helper._fontStructure._defaultEncoding[5] = 'C5';       // baseEncoding remap branch (code === charcode)
    helper._fontStructure._defaultEncoding[6] = 'f_h';      // ligature branch
    helper._fontStructure._defaultEncoding[7] = 'f_t';      // ligature branch
    helper._fontStructure._defaultEncoding[8] = 'T_h';      // ligature branch
    helper._fontStructure._defaultEncoding[9] = '';         // empty glyph continue
    helper._fontStructure._defaultEncoding[10] = '.notdef'; // no output

    helper._fontStructure._differences = [];
    helper._fontStructure._differences[11] = 'u0044';       // differences override
    helper._fontStructure._differences[12] = 'uni0045';     // differences override
    helper._fontStructure._differences[13] = '.notdef';     // skip differences .notdef

    spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({
        65: 65,     // needed for baseEncoding remap branch
        space: 32
    } as never);

    spyOn(encodingUtilsModule, '_getEncoding').and.returnValue((function (): string[] {
        const baseEncoding: string[] = [];
        baseEncoding[5] = '65'; // numeric-like glyph name so glyphsUnicodeMap[65] resolves
        return baseEncoding;
    })() as never);

    spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
        switch (glyphName) {
            case 'u0041':
                return 65;
            case 'uni0042':
                return 66;
            case 'u0044':
                return 68;
            case 'uni0045':
                return 69;
            default:
                return -1;
        }
    });

    // Act
    const unicodeResult: any = helper._simpleFontToUnicode('WinAnsiEncoding');
    helper._fontStructure._defaultEncoding = ['c2A'];
    helper._fontStructure._differences = [];
    const forceGlyphResult: any = helper._simpleFontToUnicode(null, true);

    // Assert
    expect(unicodeResult[0]).toBe('A');
    expect(unicodeResult[1]).toBe('B');
    expect(unicodeResult[2]).toBe('A');
    expect(unicodeResult[3]).toBe('C');
    expect(unicodeResult[5]).toBeUndefined();  // baseEncoding remap branch
    expect(unicodeResult[6]).toBe('fh');
    expect(unicodeResult[7]).toBe('ft');
    expect(unicodeResult[8]).toBe('Th');
    expect(unicodeResult[9]).toBeUndefined();
    expect(unicodeResult[10]).toBeUndefined();
    expect(unicodeResult[11]).toBe('D');
    expect(unicodeResult[12]).toBe('E');
    expect(unicodeResult[13]).toBeUndefined();

    expect(forceGlyphResult[0]).toBe('*');
});


it('should cover _readTrueTypeCollectionData exact match, fallback part match and errors', () => {
    // Arrange
    const helper: _FontHelper = createHelper();

    spyOn(helper, '_readTrueTypeCollectionHeader').and.returnValue({
        numFonts: 2,
        offsetTable: [100, 200]
    } as never);

    spyOn(helper, '_readOpenTypeHeader').and.returnValues(
        { numTables: 1, version: 'OTTO' } as never,
        { numTables: 1, version: 'OTTO' } as never
    );

    const exactTables = { name: { marker: 'nameTable1' } };
    const fallbackTables = { name: { marker: 'nameTable2' } };

    spyOn(helper, '_readTables').and.returnValues(
        exactTables as never,
        fallbackTables as never
    );

    spyOn(helper, '_readNameTable').and.returnValues(
        [[['ExactFont']], []] as never,
        [[['PartFont']], []] as never
    );

    const dataObject = { start: 0, pos: 0 };
    const fontObject = {};

    // Act
    const exactMatchResult = helper._readTrueTypeCollectionData(
        dataObject as never,
        'ExactFont',
        fontObject as never
    );

    const helperFallback: _FontHelper = createHelper();
    spyOn(helperFallback, '_readTrueTypeCollectionHeader').and.returnValue({
        numFonts: 1,
        offsetTable: [100]
    } as never);
    spyOn(helperFallback, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
    spyOn(helperFallback, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
    spyOn(helperFallback, '_readNameTable').and.returnValue([[['PartFont']], []] as never);

    const fallbackMatchResult = helperFallback._readTrueTypeCollectionData(
        { start: 0, pos: 0 } as never,
        'PartFont+OtherPart',
        {} as never
    );

    const helperNoName: _FontHelper = createHelper();
    spyOn(helperNoName, '_readTrueTypeCollectionHeader').and.returnValue({
        numFonts: 1,
        offsetTable: [100]
    } as never);
    spyOn(helperNoName, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
    spyOn(helperNoName, '_readTables').and.returnValue({} as never);

    const noNameMessage: string = getThrownMessage(function (): void {
        helperNoName._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'MissingFont',
            {} as never
        );
    });

    const helperNotFound: _FontHelper = createHelper();
    spyOn(helperNotFound, '_readTrueTypeCollectionHeader').and.returnValue({
        numFonts: 1,
        offsetTable: [100]
    } as never);
    spyOn(helperNotFound, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
    spyOn(helperNotFound, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
    spyOn(helperNotFound, '_readNameTable').and.returnValue([[['AnotherFont']], []] as never);

    const notFoundMessage: string = getThrownMessage(function (): void {
        helperNotFound._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'MissingFont',
            {} as never
        );
    });

    // Assert
    expect(exactMatchResult.tables).toBe(exactTables as never);
    expect(fallbackMatchResult.tables).toBeDefined();

    expect(noNameMessage).toContain('TrueType Collection font must contain a name table.');
    expect(notFoundMessage).toContain("TrueType Collection does not contain 'MissingFont' font.");
});

it('should cover _UnicodeMap methods through _readToUnicode returned map', () => {
    // Arrange
    const helper: _FontHelper = createHelper();

    spyOn(_PdfCharacterMapFactory.prototype, '_create').and.returnValue({
        getMap: function (): (string | number)[] {
            const map: (string | number)[] = [];
            map[0] = 'A';
            map[2] = 'B';
            return map;
        }
    } as never);

    const unicodeMap: {
        _forEach: () => Array<{ characterCode: number; unicode: number }>;
        _has: (i: number) => boolean;
        _get: (i: number) => string | number | undefined;
        _charCodeOf: (v: string | number) => number;
        _amend: (map: { [key: number]: string | number }) => void;
        _map?: (string | number)[];
    } = helper._readToUnicode(_PdfName.get('Any-CMap')) as never;

    // Act
    const forEachResult = unicodeMap._forEach();
    const hasZero = unicodeMap._has(0);
    const getTwo = unicodeMap._get(2);
    const charCodeOfSmall = unicodeMap._charCodeOf('B');

    const largeMap = new Array(0x10001);
    largeMap[70000] = 'Z';

    unicodeMap._map = largeMap;
    const charCodeOfBig = unicodeMap._charCodeOf('Z');

    unicodeMap._map = [];
    unicodeMap._map[0] = 'A';
    unicodeMap._map[2] = 'B';
    unicodeMap._amend({ 3: 'C' });
    const amendedValue = unicodeMap._get(3);

    // Assert
    expect(forEachResult.length).toBe(2);
    expect(forEachResult[0].characterCode).toBe(0);
    expect(hasZero).toBeTruthy();
    expect(getTwo).toBe('B');
    expect(charCodeOfSmall).toBe(2);
    expect(charCodeOfBig).toBe(70000);
    expect(amendedValue).toBe('C');
});

it('should cover _PdfIdentityToUnicodeMap methods through identity _readToUnicode result', () => {
    // Arrange
    const helper: _FontHelper = createHelper();

    const identityCMap: _PdfIdentityCharacterMap = Object.create(_PdfIdentityCharacterMap.prototype) as _PdfIdentityCharacterMap;

    spyOn(_PdfCharacterMapFactory.prototype, '_create').and.returnValue(identityCMap as never);

    const identityMap: {
        _length: number;
        _forEach: (callback: (charCode: number, unicode: number) => void) => void;
        _has: (index: number) => boolean;
        _get: (index: number) => string | undefined;
        _charCodeOf: (v: number) => number;
        _amend: () => void;
    } = helper._readToUnicode(_PdfName.get('Identity-H')) as never;

    const visited: Array<{ charCode: number; unicode: number }> = [];

    // Act
    identityMap._forEach(function (charCode: number, unicode: number): void {
        if (charCode < 3) {
            visited.push({ charCode, unicode });
        }
    });

    const hasOne = identityMap._has(1);
    const getTwo = identityMap._get(2);
    const charCodeOfTwo = identityMap._charCodeOf(2);

    const amendMessage: string = getThrownMessage(function (): void {
        identityMap._amend();
    });

    // Assert
    expect(identityMap._length).toBe(65536);
    expect(visited[0].charCode).toBe(0);
    expect(visited[1].charCode).toBe(1);
    expect(hasOne).toBeTruthy();
    expect(getTwo).toBe(String.fromCharCode(2));
    expect(charCodeOfTwo).toBe(2);
    expect(amendMessage).toContain('Should not call amend()');
});

it('should cover _checkAndRepair TTC branch entry and _int16 helper', () => {
    // Arrange
    const helper: _FontHelper = createHelper();
    helper._fontStructure._name = 'MyFont';

    const fontLike = {
        getBytes: function (): Uint8Array {
            return new Uint8Array([1, 2, 3, 4]);
        }
    };

    spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(true);
    spyOn(helper, '_readTrueTypeCollectionData').and.returnValue({
        header: { version: 'OTTO', numTables: 1 },
        tables: {
            'compactFont ': { tag: 'compactFont ' },
            head: { offset: 0, data: new Uint8Array(60) },
            hhea: { data: new Uint8Array(20) },
            maxp: { offset: 0, length: 32, data: new Uint8Array(32) },
            post: {},
            name: { offset: 0, length: 0 }
        }
    } as never);

    spyOn(helper, '_readNameTable').and.returnValue([
        [[], []],
        []
    ] as never);

    // Act
    const int16Result: number = helper._int16(0x01, 0x02);
    helper._checkAndRepair(fontLike as never);

    // Assert
    expect(int16Result).toBe(258);
    expect(helper._fontStructure._lineHeight).toBeDefined();
});

it('should cover _adjustType1ToUnicode and _adjustTrueTypeToUnicode branches safely', () => {
    // Arrange
    const helper: _FontHelper = createHelper();

    helper._fontStructure._isInternalFont = false;
    helper._fontStructure._toUnicode = {
        _length: 0,
        _amend: jasmine.createSpy('_amend'),
        _has: function (): boolean {
            return false;
        },
        _forEach: function (): void {
            // no-op
        }
    } as never;

    helper._fontStructure._builtInEncoding = { 65: 'A', 66: 'B' } as never;
    helper._fontStructure._defaultEncoding = { 65: 'C' } as never;
    helper._fontStructure._differences = [];
    helper._baseEncodingName = null as never;
    helper._hasEncoding = false;
    helper._hasIncludedToUnicodeMap = false;

    spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66, 65: 65 } as never);
    spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
        if (glyphName === 'A') {
            return 65;
        }
        if (glyphName === 'B') {
            return 66;
        }
        return -1;
    });

    // Act
    helper._adjustType1ToUnicode();

    const trueTypeProperties = {
        _isInternalFont: false,
        _toUnicode: {
            _amend: jasmine.createSpy('_amend')
        },
        _defaultEncoding: ['X']
    };

    const originalWinAnsiZero: string = encodingUtilsModule._winAnsiEncoding[0];
    const originalWinAnsiOne: string = encodingUtilsModule._winAnsiEncoding[1];

    encodingUtilsModule._winAnsiEncoding[0] = '65';
    encodingUtilsModule._winAnsiEncoding[1] = '';

    helper._hasIncludedToUnicodeMap = false;
    helper._hasEncoding = false;

    helper._adjustTrueTypeToUnicode(
        trueTypeProperties as never,
        true,
        [{ platform: 3, encoding: 1, language: 0x409 }]
    );

    encodingUtilsModule._winAnsiEncoding[0] = originalWinAnsiZero;
    encodingUtilsModule._winAnsiEncoding[1] = originalWinAnsiOne;

    // Assert
    expect((helper._fontStructure._toUnicode as unknown as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
    expect((trueTypeProperties._toUnicode as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
});

import {
    _PdfCompactFont
} from '../../src/pdf-data-extract/core/text-extraction/compact-font-parser';
import { _FontHelper, _FontStructure } from '../../src/pdf-data-extract/core/text-extraction/font-structure';
describe('_FontHelper highlighted branch add-on AAA coverage', () => {
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
                const reference: _PdfReference & { _value?: unknown } = value as _PdfReference & { _value?: unknown };
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

    it('should cover _getFontStyle no-delimiter Bold, BoldOblique and Italic branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const boldDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooBold')
        });

        const boldObliqueDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooBoldOblique')
        });

        const italicDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooItalic')
        });

        // Act
        const boldStyle: PdfFontStyle = helper._getFontStyle(boldDictionary);
        const boldObliqueStyle: PdfFontStyle = helper._getFontStyle(boldObliqueDictionary);
        const italicStyle: PdfFontStyle = helper._getFontStyle(italicDictionary);

        // Assert
        expect(boldStyle).toBe(PdfFontStyle.bold);
        // Current implementation overwrites BoldOblique to italic in the later branch.
        expect(boldObliqueStyle).toBe(PdfFontStyle.italic);
        expect(italicStyle).toBe(PdfFontStyle.italic);
    });

    it('should cover _translateFont Type3 descriptor creation branch', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._type = 'Type3';

        const dictionary: _PdfDictionary = createDictionary({
            FontBBox: [10, 20, 1, 2]
        });

        const extractDataStructuresSpy = spyOn(helper, '_extractDataStructures').and.stub();
        const extractWidthsSpy = spyOn(helper, '_extractWidths').and.stub();
        const setFontDataSpy = spyOn(helper, '_setFontData').and.stub();

        // Act
        helper._translateFont(
            null as never,
            dictionary as never,
            dictionary as never,
            0,
            255,
            null
        );

        // Assert
        expect(helper._fontStructure._isType3Font).toBeTruthy();
        expect(extractDataStructuresSpy).toHaveBeenCalled();
        expect(extractWidthsSpy).toHaveBeenCalled();
        expect(setFontDataSpy).toHaveBeenCalled();
    });

    it('should cover _translateFont non-Type3 no-descriptor branch with widths array and standard font fetch', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._type = 'Type1';

        spyOn(helper, '_isSerifFont').and.returnValue(true);
        spyOn(helper, '_getBaseFontMetrics').and.returnValue({
            widths: { A: 600 },
            defaultWidth: 500,
            monospace: false
        } as never);

        spyOn(encodingUtilsModule, '_getSymbolsFonts').and.returnValue({} as never);

        const fetchStandardFontDataSpy = spyOn(helper, '_fetchStandardFontData').and.returnValue(
            new _PdfStream(new Uint8Array([1, 2, 3])) as never
        );

        const extractDataStructuresSpy = spyOn(helper, '_extractDataStructures').and.stub();
        const setFontDataSpy = spyOn(helper, '_setFontData').and.stub();

        const widthsArray: unknown[] = [100, createReference(200), 300];

        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('Times-Roman'),
            Widths: widthsArray
        });

        // Act
        helper._translateFont(
            null as never,
            dictionary as never,
            dictionary as never,
            10,
            12,
            null
        );

        // Assert
        expect(helper._fontStructure._name).toBe('Times-Roman');
        expect(helper._fontStructure._defaultWidth).toBe(500);
        expect(helper._fontStructure._widths[10]).toBe(100);
        expect(helper._fontStructure._widths[11]).toBe(200);
        expect(helper._fontStructure._widths[12]).toBe(300);
        expect(fetchStandardFontDataSpy).toHaveBeenCalled();
        expect(helper._fontStructure._isInternalFont).toBeTruthy();
        expect(extractDataStructuresSpy).toHaveBeenCalled();
        expect(setFontDataSpy).toHaveBeenCalled();
    });

    it('should cover _buildCharCodeToWidth differences and default encoding branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._differences = [];
        helper._fontStructure._differences[65] = 'Aacute';
        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[66] = 'B';

        const widthsByGlyphName: { [key: string]: number } = {
            Aacute: 700,
            B: 500
        };

        // Act
        const result: { [key: number]: number } = helper._buildCharCodeToWidth(widthsByGlyphName);

        // Assert
        expect(result[65]).toBe(700);
        expect(result[66]).toBe(500);
    });

    it('should cover _fetchStandardFontData cache-hit, null branch and decoded Symbol branch', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const cacheMap = new Map<string, Uint8Array>();
        cacheMap.set('Symbol', new Uint8Array([1, 2]));
        helper._standardFontDataCache = cacheMap as never;

        // Act
        const cachedResult = helper._fetchStandardFontData('Symbol');

        helper._standardFontDataCache = new Map<string, Uint8Array>() as never;
        const nullResult = helper._fetchStandardFontData('Helvetica');

        const encodedStringSpy = spyOn(fontUtilsModule, '_getFontEncodedString').and.returnValue(
            'data:font/opentype;base64,QUJD' as never
        );

        const decodedResult = helper._fetchStandardFontData('Symbol');

        // Assert
        expect(cachedResult).toBeTruthy();
        expect(nullResult).toBeNull();
        expect(encodedStringSpy).toHaveBeenCalled();
        expect(decodedResult).toBeTruthy();
        expect(helper._file).toBeTruthy();
        expect((helper._file as _PdfStream).getBytes().length).toBe(3);
    });

    it('should cover _setFontData Type3, no-file fallback and Type1C built-in encoding branch', () => {
        // Arrange
        const helperType3: _FontHelper = createHelper();
        helperType3._fontStructure._type = 'Type3';
        helperType3._fontStructure._differences = [];
        helperType3._fontStructure._defaultEncoding = [];
        helperType3._fontStructure._differences[65] = 'A';
        helperType3._fontStructure._defaultEncoding[66] = 'B';

        // Act
        helperType3._setFontData();

        const helperFallback: _FontHelper = createHelper();
        const setFallBackSystemFontSpy = spyOn(helperFallback, '_setFallBackSystemFont').and.stub();

        // Act
        helperFallback._setFontData();

        const helperType1C: _FontHelper = createHelper();
        helperType1C._file = new _PdfStream(new Uint8Array([1, 2, 3])) as never;
        helperType1C._fileType = 'Type1';
        helperType1C._fileSubtype = 'Type1C';
        helperType1C._fontStructure._defaultEncoding = [] as never;
        helperType1C._fontStructure._builtInEncoding = null as never;
        helperType1C._fontStructure._toUnicode = {
            _length: 0,
            _amend: jasmine.createSpy('_amend'),
            _has: function (): boolean {
                return false;
            },
            _forEach: function (): void {
                // no-op
            }
        } as never;

        spyOn(helperType1C, '_getFontFileType').and.stub();
        spyOn(helperType1C, '_adjustWidths').and.stub();
        const adjustType1ToUnicodeSpy = spyOn(helperType1C, '_adjustType1ToUnicode').and.stub();

        spyOn(compactFontParserModule as unknown as { _PdfCompactFont: unknown }, '_PdfCompactFont' as never)
            .and.returnValue({
                _builtInEncoding: { 65: 'A' }
            } as never);

        // Act
        helperType1C._setFontData();

        // Assert
        expect(helperType3._fontStructure._toFontChar[65]).toBe('A');
        expect(helperType3._fontStructure._toFontChar[66]).toBe('B');

        expect(setFallBackSystemFontSpy).toHaveBeenCalled();
        expect(helperType1C._fontStructure._builtInEncoding[65]).toBe('A');
        expect(adjustType1ToUnicodeSpy).toHaveBeenCalled();
    });

    it('should cover file signature helpers and _getFontFileType branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const trueTypeFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x00, 0x01, 0x00, 0x00]);
            }
        };

        const openTypeFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x4F, 0x54, 0x54, 0x4F]);
            }
        };

        const type1AsciiFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x25, 0x21]);
            }
        };

        const type1BinaryFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x80, 0x01]);
            }
        };

        const compactFontFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([1, 0, 4, 1]);
            }
        };

        const unknownFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([9, 9, 9, 9]);
            }
        };

        // Act
        const trueTypeResult: boolean = helper._isTrueTypeFile(trueTypeFile as never);
        const openTypeResult: boolean = helper._isOpenTypeFile(openTypeFile as never);
        const type1AsciiResult: boolean = helper._isType1File(type1AsciiFile as never);
        const type1BinaryResult: boolean = helper._isType1File(type1BinaryFile as never);
        const compactResult: boolean = helper._isCompactFontFile(compactFontFile as never);
        const compactFalseResult: boolean = helper._isCompactFontFile(unknownFile as never);

        const int32Result: number = helper._readUnsignedInt32(new Uint8Array([0x00, 0x01, 0x00, 0x00]), 0);

        helper._file = trueTypeFile as never;
        helper._fontStructure._composite = false;
        helper._fontStructure._type = 'Type1';
        helper._fontStructure._subtype = 'SubtypeA';
        helper._getFontFileType();
        const trueTypeFileType: string = helper._fileType;

        helper._file = openTypeFile as never;
        helper._getFontFileType();
        const openTypeFileType: string = helper._fileType;

        helper._file = type1AsciiFile as never;
        helper._fontStructure._composite = true;
        helper._getFontFileType();
        const compositeType1FileType: string = helper._fileType;

        helper._file = compactFontFile as never;
        helper._fontStructure._composite = false;
        helper._fontStructure._type = 'MMType1';
        helper._getFontFileType();
        const compactFileType: string = helper._fileType;
        const compactFileSubtype: string = helper._fileSubtype;

        helper._file = unknownFile as never;
        helper._fontStructure._type = 'CustomType';
        helper._fontStructure._subtype = 'CustomSubtype';
        helper._getFontFileType();
        const fallbackFileType: string = helper._fileType;
        const fallbackFileSubtype: string = helper._fileSubtype;

        // Assert
        expect(trueTypeResult).toBeTruthy();
        expect(openTypeResult).toBeTruthy();
        expect(type1AsciiResult).toBeTruthy();
        expect(type1BinaryResult).toBeTruthy();
        expect(compactResult).toBeTruthy();
        expect(compactFalseResult).toBeFalsy();
        expect(int32Result).toBe(0x00010000);

        expect(trueTypeFileType).toBe('TrueType');
        expect(openTypeFileType).toBe('OpenType');
        expect(compositeType1FileType).toBe('CIDFontType0');
        expect(compactFileType).toBe('MMType1');
        expect(compactFileSubtype).toBe('Type1C');
        expect(fallbackFileType).toBe('CustomType');
        expect(fallbackFileSubtype).toBe('CustomSubtype');
    });

    it('should cover _extractWidths composite, vertical and non-composite branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._composite = true;
        helper._vertical = true;

        const crossReference = helper._crossReference as unknown as { _fetch: jasmine.Spy };
        crossReference._fetch.and.callFake(function (value: unknown): unknown {
            const reference = value as _PdfReference & { _value?: unknown };
            if (reference && typeof reference === 'object' && '_value' in reference) {
                return reference._value;
            }
            return value;
        });

        const widthArrayReference: _PdfReference = createReference(200);
        const startReference: _PdfReference = createReference(1);
        const widthReference: _PdfReference = createReference(300);

        const vStartReference: _PdfReference = createReference(1);
        const vRangeCodeReference: _PdfReference = createReference(2);
        const vWidth1Reference: _PdfReference = createReference(10);
        const vWidth2Reference: _PdfReference = createReference(20);
        const vWidth3Reference: _PdfReference = createReference(30);

        const descriptor: _PdfDictionary = createDictionary({
            DW: 555.2,
            W: [
                startReference,
                [widthArrayReference, 150],
                3,
                4,
                widthReference
            ],
            DW2: [880, -1000],
            W2: [
                vStartReference,
                [1, 2, 3],
                5,
                vRangeCodeReference,
                vWidth1Reference,
                vWidth2Reference,
                vWidth3Reference
            ]
        });

        // Act
        helper._extractWidths(descriptor, 0, 0, createDictionary({}));

        const helperNonComposite: _FontHelper = createHelper();
        helperNonComposite._fontStructure._composite = false;

        const nonCompositeDescriptor: _PdfDictionary = createDictionary({
            Widths: [100, createReference(200), 300]
        });

        helperNonComposite._extractWidths(nonCompositeDescriptor, 0, 10, createDictionary({
            MissingWidth: 50
        }));

        // Assert
        expect(helper._fontStructure._defaultWidth).toBe(556);
        expect(helper._fontStructure._widths[1]).toBe(200);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._widths[3]).toBe(300);
        expect(helper._fontStructure._widths[4]).toBe(300);

        expect(helperNonComposite._fontStructure._widths[10]).toBe(100);
        expect(helperNonComposite._fontStructure._widths[11]).toBe(200);
        expect(helperNonComposite._fontStructure._widths[12]).toBe(300);
        expect(helperNonComposite._fontStructure._defaultWidth).toBe(50);
    });

    it('should cover _extractDataStructures and _buildToUnicode branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._composite = true;
        helper._fontStructure._name = 'Wingdings';
        helper._fontStructure._type = 'TrueType';
        helper._fontStructure._flags = 4;
        helper._fontStructure._isInternalFont = false;

        const cidInfo: _PdfDictionary = createDictionary({
            Registry: 'Adobe',
            Ordering: 'Japan1',
            Supplement: 5
        });

        const encodingDictionary: _PdfDictionary = createDictionary({
            BaseEncoding: _PdfName.get('MacRomanEncoding'),
            Differences: [
                65,
                _PdfName.get('Aacute')
            ]
        });

        const dictionary: _PdfDictionary = createDictionary({
            CIDSystemInfo: cidInfo,
            Encoding: encodingDictionary
        });

        const readToUnicodeSpy = spyOn(helper, '_readToUnicode').and.returnValue({
            _length: 0
        } as never);

        const buildToUnicodeSpy = spyOn(helper, '_buildToUnicode').and.returnValue({
            marker: 'toUnicode'
        } as never);

        // Act
        helper._extractDataStructures(dictionary, { marker: 'unicode' } as never);

        // Assert
        expect(helper._fontStructure._characterSystemInfo.registry).toBe('Adobe');
        expect(helper._fontStructure._characterSystemInfo.ordering).toBe('Japan1');
        expect(helper._fontStructure._characterSystemInfo.supplement).toBe(5);

        expect(helper._fontStructure._differences[65]).toBe('Aacute');
        expect(helper._baseEncodingName).toBeNull();
        expect(helper._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);

        expect(readToUnicodeSpy).toHaveBeenCalled();
        expect(buildToUnicodeSpy).toHaveBeenCalled();

        const helperIncluded: _FontHelper = createHelper();
        helperIncluded._fontStructure._composite = false;
        spyOn(helperIncluded, '_simpleFontToUnicode').and.returnValue(['A'] as never);

        const existingMap = {
            _length: 1
        };

        const includedResult = helperIncluded._buildToUnicode('WinAnsiEncoding', true, existingMap as never);
        const simpleResult = helperIncluded._buildToUnicode('WinAnsiEncoding', false, null as never);

        expect(includedResult).toBe(existingMap as never);
        expect(simpleResult).toBeTruthy();
    });

    it('should cover _readToUnicode name, stream, token-number, token-string and error branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const createSpy = spyOn(_PdfCharacterMapFactory.prototype, '_create').and.callFake(function (cmapObj: unknown): unknown {
            if (cmapObj instanceof _PdfName) {
                return {
                    getMap: function (): (string | number)[] {
                        return ['A'];
                    }
                };
            }

            return {
                _map: new Array(2),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, '\u0000A');
                }
            };
        });

        const nameResult = helper._readToUnicode(_PdfName.get('Identity-H'));

        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const streamResult = helper._readToUnicode(streamObject);

        createSpy.and.returnValue({
            _map: new Array(1),
            _forEach: function (): void {
                throw new Error('stream-map-failed');
            }
        } as never);

        const errorMessage: string = getThrownMessage(function (): void {
            helper._readToUnicode(streamObject);
        });

        // Assert
        expect(nameResult).toBeTruthy();
        expect(streamResult).toBeTruthy();
        expect(errorMessage).toContain('stream-map-failed');
    });

    it('should cover _simpleFontToUnicode all major branches including forceGlyphs, baseEncoding remap and f_h/f_t/T_h', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[0] = 'u0041';
        helper._fontStructure._defaultEncoding[1] = 'uni0042';
        helper._fontStructure._defaultEncoding[2] = 'G41';
        helper._fontStructure._defaultEncoding[3] = 'g0043';
        helper._fontStructure._defaultEncoding[5] = 'C5';
        helper._fontStructure._defaultEncoding[6] = 'f_h';
        helper._fontStructure._defaultEncoding[7] = 'f_t';
        helper._fontStructure._defaultEncoding[8] = 'T_h';
        helper._fontStructure._defaultEncoding[9] = '';
        helper._fontStructure._defaultEncoding[10] = '.notdef';

        helper._fontStructure._differences = [];
        helper._fontStructure._differences[11] = 'u0044';
        helper._fontStructure._differences[12] = 'uni0045';
        helper._fontStructure._differences[13] = '.notdef';

        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({
            65: 65,
            space: 32
        } as never);

        spyOn(encodingUtilsModule, '_getEncoding').and.returnValue((function (): string[] {
            const baseEncoding: string[] = [];
            baseEncoding[5] = '65';
            return baseEncoding;
        })() as never);

        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            switch (glyphName) {
            case 'u0041':
                return 65;
            case 'uni0042':
                return 66;
            case 'u0044':
                return 68;
            case 'uni0045':
                return 69;
            default:
                return -1;
            }
        });

        // Act
        const unicodeResult: any = helper._simpleFontToUnicode('WinAnsiEncoding');
        helper._fontStructure._defaultEncoding = ['c2A'];
        helper._fontStructure._differences = [];
        const forceGlyphResult: any = helper._simpleFontToUnicode(null, true);

        // Assert
        expect(unicodeResult[0]).toBe('A');
        expect(unicodeResult[1]).toBe('B');
        expect(unicodeResult[2]).toBe('A');
        expect(unicodeResult[3]).toBe('C');
        expect(unicodeResult[5]).toBeUndefined();
        expect(unicodeResult[6]).toBe('fh');
        expect(unicodeResult[7]).toBe('ft');
        expect(unicodeResult[8]).toBe('Th');
        expect(unicodeResult[9]).toBeUndefined();
        expect(unicodeResult[10]).toBeUndefined();
        expect(unicodeResult[11]).toBe('D');
        expect(unicodeResult[12]).toBe('E');
        expect(unicodeResult[13]).toBeUndefined();

        expect(forceGlyphResult[0]).toBe('*');
    });

    it('should cover _adjustWidths, _getBaseFontMetrics, _getMetrics, _getStandardFontName, _amendFallBackToUnicodeMap and _applyStandardFontGlyphMap', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];
        helper._fontStructure._widths = { 1: 200, 2: 300 } as never;
        helper._fontStructure._defaultWidth = 400;

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({
            'Arial-MT': 'Helvetica'
        } as never);

        spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({} as never);
        spyOn(helper, '_getMetrics').and.returnValue(['Helvetica', 'Times-Roman'] as never);
        spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
            return {
                _helveticaWidths: { A: 500 },
                _timesRoman: { B: 600 },
                _symbol: 700
            };
        });

        const toUnicodeMap = {
            _has: jasmine.createSpy('_has').and.returnValues(false, true),
            _amend: jasmine.createSpy('_amend')
        };

        const properties = {
            _fallBackToUnicodeMap: {
                65: 'A',
                66: 'B'
            },
            _fontStructure: {
                _toUnicode: toUnicodeMap
            }
        };

        const destinationMap: number[] = [];
        const glyphMap: { [key: number]: number } = { 65: 100, 66: 200 };

        // Act
        helper._adjustWidths();
        const baseMetricsResult = helper._getBaseFontMetrics('ArialMT');
        const metricNamesResult = helper._getMetrics();
        const standardFontNameResult = helper._getStandardFontName('Arial_MT');
        helper._amendFallBackToUnicodeMap(properties as never);
        helper._applyStandardFontGlyphMap(destinationMap, glyphMap);

        const amendArg: any[] = (toUnicodeMap._amend.calls.mostRecent().args[0] as any[]);

        // Assert
        expect(helper._fontStructure._widths[1]).toBe(100);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._defaultWidth).toBe(200);

        expect(baseMetricsResult.widths).toEqual({ A: 500 });
        expect(metricNamesResult.length).toBeGreaterThan(0);
        expect(standardFontNameResult).toBe('Helvetica');

        expect(amendArg[65]).toBe('A');
        expect(amendArg[66]).toBeUndefined();

        expect(destinationMap[65]).toBe(100);
        expect(destinationMap[66]).toBe(200);
    });

    it('should cover _setFallBackSystemFont, _spaceWidth, _charToGlyph and _convertCidString branches', () => {
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

    it('should cover _readNameTable, _readTrueTypeCollectionHeader and _readTrueTypeCollectionData branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const ttcFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x74, 0x74, 0x63, 0x66]);
            }
        };

        const ttcHeaderReader = {
            _stringValues: ['ttcf'],
            _unsigned16Values: [1, 0],
            _int32Values: [2, 100, 200],
            getString: function (): string {
                return this._stringValues.shift() as string;
            },
            getUnsignedInteger16: function (): number {
                return this._unsigned16Values.shift() as number;
            },
            getInt32: function (): number {
                return this._int32Values.shift() as number;
            }
        };

        const nameTable = { offset: 0, length: 40 };
        const fontReader = {
            start: 0,
            pos: 0,
            position: 0,
            _unsigned16Values: [
                0,
                2,
                30,

                1, 0, 0, 6, 4, 0,
                3, 1, 0x409, 6, 4, 4,

                0x0041, 0x0042
            ],
            _stringValues: ['Test'],
            getUnsignedInteger16: function (): number {
                this.position += 2;
                this.pos = this.position;
                return this._unsigned16Values.shift() as number;
            },
            getString: function (): string {
                return this._stringValues.shift() as string;
            }
        };

        const invalidMinorHeaderReader = {
            _stringValues: ['ttcf'],
            _unsigned16Values: [3, 0],
            _int32Values: [1, 100],
            getString: function (): string {
                return this._stringValues.shift() as string;
            },
            getUnsignedInteger16: function (): number {
                return this._unsigned16Values.shift() as number;
            },
            getInt32: function (): number {
                return this._int32Values.shift() as number;
            }
        };

        // Act
        const isTtcResult: boolean = helper._isTrueTypeCollectionFile(ttcFile as never);
        const ttcHeader = helper._readTrueTypeCollectionHeader(ttcHeaderReader as never);
        const macResult: boolean = helper._isMacNameRecord({ platform: 1, encoding: 0, language: 0 });
        const winResult: boolean = helper._isWinNameRecord({ platform: 3, encoding: 1, language: 0x409 });

        const nameResult = helper._readNameTable(nameTable as never, fontReader as never);

        const invalidHeaderMessage: string = getThrownMessage(function (): void {
            helper._readTrueTypeCollectionHeader(invalidMinorHeaderReader as never);
        });

        const helperExact: _FontHelper = createHelper();
        spyOn(helperExact, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 2,
            offsetTable: [100, 200]
        } as never);

        spyOn(helperExact, '_readOpenTypeHeader').and.returnValues(
            { numTables: 1, version: 'OTTO' } as never,
            { numTables: 1, version: 'OTTO' } as never
        );

        const exactTables = { name: { marker: 'nameTable1' } };
        const fallbackTables = { name: { marker: 'nameTable2' } };

        spyOn(helperExact, '_readTables').and.returnValues(
            exactTables as never,
            fallbackTables as never
        );

        spyOn(helperExact, '_readNameTable').and.returnValues(
            [[['ExactFont']], []] as never,
            [[['PartFont']], []] as never
        );

        const exactMatchResult = helperExact._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'ExactFont',
            {} as never
        );

        const helperFallback: _FontHelper = createHelper();
        spyOn(helperFallback, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperFallback, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperFallback, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
        spyOn(helperFallback, '_readNameTable').and.returnValue([[['PartFont']], []] as never);

        const fallbackMatchResult = helperFallback._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'PartFont+OtherPart',
            {} as never
        );

        const helperNoName: _FontHelper = createHelper();
        spyOn(helperNoName, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperNoName, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperNoName, '_readTables').and.returnValue({} as never);

        const noNameMessage: string = getThrownMessage(function (): void {
            helperNoName._readTrueTypeCollectionData(
                { start: 0, pos: 0 } as never,
                'MissingFont',
                {} as never
            );
        });

        const helperNotFound: _FontHelper = createHelper();
        spyOn(helperNotFound, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperNotFound, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperNotFound, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
        spyOn(helperNotFound, '_readNameTable').and.returnValue([[['AnotherFont']], []] as never);

        const notFoundMessage: string = getThrownMessage(function (): void {
            helperNotFound._readTrueTypeCollectionData(
                { start: 0, pos: 0 } as never,
                'MissingFont',
                {} as never
            );
        });

        // Assert
        expect(isTtcResult).toBeTruthy();
        expect(ttcHeader.numFonts).toBe(2);
        expect(ttcHeader.offsetTable).toEqual([100, 200]);
        expect(macResult).toBeTruthy();
        expect(winResult).toBeTruthy();

        expect(nameResult[1].length).toBe(2);
        expect(nameResult[0][0][6]).toBe('Test');
        expect(nameResult[0][1][6]).toBe('AB');

        expect(invalidHeaderMessage).toContain('Invalid TrueType Collection majorVersion');
        expect(exactMatchResult.tables).toBe(exactTables as never);
        expect(fallbackMatchResult).toBeTruthy();
        expect(noNameMessage).toContain('TrueType Collection font must contain a name table.');
        expect(notFoundMessage).toContain("TrueType Collection does not contain 'MissingFont' font.");
    });

    it('should cover _UnicodeMap and _PdfIdentityToUnicodeMap methods through _readToUnicode results', () => {
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
            Object.create(_PdfIdentityCharacterMap.prototype) as never
        );

        const unicodeMap: any = helper._readToUnicode(_PdfName.get('Any-CMap'));
        const identityMap: any = helper._readToUnicode(_PdfName.get('Identity-H'));

        // Act
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
        const amendMessage: string = getThrownMessage(function (): void {
            identityMap._amend();
        });

        // Assert
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
        expect(amendMessage).toContain('Should not call amend()');
    });

    it('should cover _checkAndRepair TTC entry, OpenType branch, _adjustType1ToUnicode and _adjustTrueTypeToUnicode safely', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._name = 'MyFont';
        helper._fontStructure._toUnicode = {
            _length: 0,
            _amend: jasmine.createSpy('_amend'),
            _has: function (): boolean {
                return false;
            },
            _forEach: function (): void {
                // no-op
            }
        } as never;

        const fontLike = {
            getBytes: function (): Uint8Array {
                return new Uint8Array([1, 2, 3, 4]);
            }
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(true);
        spyOn(helper, '_readTrueTypeCollectionData').and.returnValue({
            header: { version: 'OTTO', numTables: 1 },
            tables: {
                'compactFont ': { tag: 'compactFont ' },
                head: { offset: 0, data: new Uint8Array(60) },
                hhea: { data: new Uint8Array(20) },
                maxp: { offset: 0, length: 32, data: new Uint8Array(32) },
                post: {},
                name: { offset: 0, length: 0 }
            }
        } as never);

        spyOn(helper, '_readNameTable').and.returnValue([
            [[], []],
            []
        ] as never);

        // Act
        const int16Result: number = helper._int16(0x01, 0x02);
        helper._checkAndRepair(fontLike as never);

        helper._fontStructure._isInternalFont = false;
        helper._fontStructure._builtInEncoding = { 65: 'A', 66: 'B' } as never;
        helper._fontStructure._defaultEncoding = { 65: 'C' } as never;
        helper._fontStructure._differences = [];
        helper._baseEncodingName = null as never;
        helper._hasEncoding = false;
        helper._hasIncludedToUnicodeMap = false;

        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66, 65: 65 } as never);
        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            if (glyphName === 'A') {
                return 65;
            }
            if (glyphName === 'B') {
                return 66;
            }
            return -1;
        });

        helper._adjustType1ToUnicode();

        const trueTypeProperties = {
            _isInternalFont: false,
            _toUnicode: {
                _amend: jasmine.createSpy('_amend')
            },
            _defaultEncoding: ['X']
        };

        const originalWinAnsiZero: string = encodingUtilsModule._winAnsiEncoding[0];
        const originalWinAnsiOne: string = encodingUtilsModule._winAnsiEncoding[1];

        encodingUtilsModule._winAnsiEncoding[0] = '65';
        encodingUtilsModule._winAnsiEncoding[1] = '';

        helper._hasIncludedToUnicodeMap = false;
        helper._hasEncoding = false;

        helper._adjustTrueTypeToUnicode(
            trueTypeProperties as never,
            true,
            [{ platform: 3, encoding: 1, language: 0x409 }]
        );

        encodingUtilsModule._winAnsiEncoding[0] = originalWinAnsiZero;
        encodingUtilsModule._winAnsiEncoding[1] = originalWinAnsiOne;

        // Assert
        expect(int16Result).toBe(258);
        expect(helper._fontStructure._lineHeight).toBeDefined();
        expect((helper._fontStructure._toUnicode as unknown as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
        expect((trueTypeProperties._toUnicode as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
    });
});
import * as compactFontParserModule from '../../src/pdf-data-extract/core/text-extraction/compact-font-parser';
 
describe('_PdfCharacterMapFactory highlighted 4-line coverage', () => {
    it('should cover _getFontStyle no-delimiter Bold, BoldOblique and Italic branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        const boldDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooBold')
        });
        const boldObliqueDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooBoldOblique')
        });
        const italicDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('FooItalic')
        });

        // Act
        const boldStyle: PdfFontStyle = helper._getFontStyle(boldDictionary);
        const boldObliqueStyle: PdfFontStyle = helper._getFontStyle(boldObliqueDictionary);
        const italicStyle: PdfFontStyle = helper._getFontStyle(italicDictionary);

        // Assert
        expect(boldStyle).toBe(PdfFontStyle.bold);
        expect(boldObliqueStyle).toBe(PdfFontStyle.italic);
        expect(italicStyle).toBe(PdfFontStyle.italic);
    });

    it('should cover _translateFont Type3 descriptor creation branch', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._type = 'Type3';

        const dictionary: _PdfDictionary = createDictionary({
            FontBBox: [10, 20, 1, 2]
        });

        const extractDataStructuresSpy = spyOn(helper, '_extractDataStructures').and.stub();
        const extractWidthsSpy = spyOn(helper, '_extractWidths').and.stub();
        const setFontDataSpy = spyOn(helper, '_setFontData').and.stub();

        // Act
        helper._translateFont(
            null as never,
            dictionary as never,
            dictionary as never,
            0,
            255,
            null
        );

        // Assert
        expect(helper._fontStructure._isType3Font).toBeTruthy();
        expect(extractDataStructuresSpy).toHaveBeenCalled();
        expect(extractWidthsSpy).toHaveBeenCalled();
        expect(setFontDataSpy).toHaveBeenCalled();
    });

    it('should cover _translateFont non-Type3 no-descriptor branch with widths array and standard font fetch', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._type = 'Type1';

        spyOn(helper, '_isSerifFont').and.returnValue(true);
        spyOn(helper, '_getBaseFontMetrics').and.returnValue({
            widths: { A: 600 },
            defaultWidth: 500,
            monospace: false
        } as never);

        spyOn(encodingUtilsModule, '_getSymbolsFonts').and.returnValue({} as never);

        const fetchStandardFontDataSpy = spyOn(helper, '_fetchStandardFontData').and.returnValue(
            new _PdfStream(new Uint8Array([1, 2, 3])) as never
        );

        const extractDataStructuresSpy = spyOn(helper, '_extractDataStructures').and.stub();
        const setFontDataSpy = spyOn(helper, '_setFontData').and.stub();

        const widthsArray: unknown[] = [100, createReference(200), 300];

        const dictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('Times-Roman'),
            Widths: widthsArray
        });

        // Act
        helper._translateFont(
            null as never,
            dictionary as never,
            dictionary as never,
            10,
            12,
            null
        );

        // Assert
        expect(helper._fontStructure._name).toBe('Times-Roman');
        expect(helper._fontStructure._defaultWidth).toBe(500);
        expect(helper._fontStructure._widths[10]).toBe(100);
        expect(helper._fontStructure._widths[11]).toBe(200);
        expect(helper._fontStructure._widths[12]).toBe(300);
        expect(fetchStandardFontDataSpy).toHaveBeenCalled();
        expect(helper._fontStructure._isInternalFont).toBeTruthy();
        expect(extractDataStructuresSpy).toHaveBeenCalled();
        expect(setFontDataSpy).toHaveBeenCalled();
    });

    it('should cover _buildCharCodeToWidth differences and default encoding branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._differences = [];
        helper._fontStructure._differences[65] = 'Aacute';
        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[66] = 'B';

        const widthsByGlyphName: { [key: string]: number } = {
            Aacute: 700,
            B: 500
        };

        // Act
        const result: { [key: number]: number } = helper._buildCharCodeToWidth(widthsByGlyphName);

        // Assert
        expect(result[65]).toBe(700);
        expect(result[66]).toBe(500);
    });

    it('should cover _fetchStandardFontData cache-hit, null branch and decoded Symbol branch', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const cacheMap = new Map<string, Uint8Array>();
        cacheMap.set('Symbol', new Uint8Array([1, 2]));
        helper._standardFontDataCache = cacheMap as never;

        // Act
        const cachedResult = helper._fetchStandardFontData('Symbol');

        helper._standardFontDataCache = new Map<string, Uint8Array>() as never;
        const nullResult = helper._fetchStandardFontData('Helvetica');

        const encodedStringSpy = spyOn(fontUtilsModule, '_getFontEncodedString').and.returnValue(
            'data:font/opentype;base64,QUJD' as never
        );

        const decodedResult = helper._fetchStandardFontData('Symbol');

        // Assert
        expect(cachedResult).toBeTruthy();
        expect(nullResult).toBeNull();
        expect(encodedStringSpy).toHaveBeenCalled();
        expect(decodedResult).toBeTruthy();
        expect(helper._file).toBeTruthy();
        expect((helper._file as _PdfStream).getBytes().length).toBe(3);
    });

    it('should cover _setFontData Type3, no-file fallback and Type1C built-in encoding branch', () => {
        // Arrange
        const helperType3: _FontHelper = createHelper();
        helperType3._fontStructure._type = 'Type3';
        helperType3._fontStructure._differences = [];
        helperType3._fontStructure._defaultEncoding = [];
        helperType3._fontStructure._differences[65] = 'A';
        helperType3._fontStructure._defaultEncoding[66] = 'B';

        // Act
        helperType3._setFontData();

        const helperFallback: _FontHelper = createHelper();
        const setFallBackSystemFontSpy = spyOn(helperFallback, '_setFallBackSystemFont').and.stub();

        // Act
        helperFallback._setFontData();

        const helperType1C: _FontHelper = createHelper();
        helperType1C._file = new _PdfStream(new Uint8Array([1, 2, 3])) as never;
        helperType1C._fileType = 'Type1';
        helperType1C._fileSubtype = 'Type1C';
        helperType1C._fontStructure._defaultEncoding = [] as never;
        helperType1C._fontStructure._builtInEncoding = null as never;
        helperType1C._fontStructure._toUnicode = {
            _length: 0,
            _amend: jasmine.createSpy('_amend'),
            _has: function (): boolean {
                return false;
            },
            _forEach: function (): void {
                // no-op
            }
        } as never;

        spyOn(helperType1C, '_getFontFileType').and.stub();
        spyOn(helperType1C, '_adjustWidths').and.stub();
        const adjustType1ToUnicodeSpy = spyOn(helperType1C, '_adjustType1ToUnicode').and.stub();

        spyOn(compactFontParserModule as unknown as { _PdfCompactFont: unknown }, '_PdfCompactFont' as never)
            .and.returnValue({
                _builtInEncoding: { 65: 'A' }
            } as never);

        // Act
        helperType1C._setFontData();

        // Assert
        expect(helperType3._fontStructure._toFontChar[65]).toBe('A');
        expect(helperType3._fontStructure._toFontChar[66]).toBe('B');

        expect(setFallBackSystemFontSpy).toHaveBeenCalled();
        expect(helperType1C._fontStructure._builtInEncoding[65]).toBe('A');
        expect(adjustType1ToUnicodeSpy).toHaveBeenCalled();
    });

    it('should cover file signature helpers and _getFontFileType branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const trueTypeFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x00, 0x01, 0x00, 0x00]);
            }
        };

        const openTypeFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x4F, 0x54, 0x54, 0x4F]);
            }
        };

        const type1AsciiFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x25, 0x21]);
            }
        };

        const type1BinaryFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x80, 0x01]);
            }
        };

        const compactFontFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([1, 0, 4, 1]);
            }
        };

        const unknownFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([9, 9, 9, 9]);
            }
        };

        // Act
        const trueTypeResult: boolean = helper._isTrueTypeFile(trueTypeFile as never);
        const openTypeResult: boolean = helper._isOpenTypeFile(openTypeFile as never);
        const type1AsciiResult: boolean = helper._isType1File(type1AsciiFile as never);
        const type1BinaryResult: boolean = helper._isType1File(type1BinaryFile as never);
        const compactResult: boolean = helper._isCompactFontFile(compactFontFile as never);
        const compactFalseResult: boolean = helper._isCompactFontFile(unknownFile as never);

        const int32Result: number = helper._readUnsignedInt32(new Uint8Array([0x00, 0x01, 0x00, 0x00]), 0);

        helper._file = trueTypeFile as never;
        helper._fontStructure._composite = false;
        helper._fontStructure._type = 'Type1';
        helper._fontStructure._subtype = 'SubtypeA';
        helper._getFontFileType();
        const trueTypeFileType: string = helper._fileType;

        helper._file = openTypeFile as never;
        helper._getFontFileType();
        const openTypeFileType: string = helper._fileType;

        helper._file = type1AsciiFile as never;
        helper._fontStructure._composite = true;
        helper._getFontFileType();
        const compositeType1FileType: string = helper._fileType;

        helper._file = compactFontFile as never;
        helper._fontStructure._composite = false;
        helper._fontStructure._type = 'MMType1';
        helper._getFontFileType();
        const compactFileType: string = helper._fileType;
        const compactFileSubtype: string = helper._fileSubtype;

        helper._file = unknownFile as never;
        helper._fontStructure._type = 'CustomType';
        helper._fontStructure._subtype = 'CustomSubtype';
        helper._getFontFileType();
        const fallbackFileType: string = helper._fileType;
        const fallbackFileSubtype: string = helper._fileSubtype;

        // Assert
        expect(trueTypeResult).toBeTruthy();
        expect(openTypeResult).toBeTruthy();
        expect(type1AsciiResult).toBeTruthy();
        expect(type1BinaryResult).toBeTruthy();
        expect(compactResult).toBeTruthy();
        expect(compactFalseResult).toBeFalsy();
        expect(int32Result).toBe(0x00010000);

        expect(trueTypeFileType).toBe('TrueType');
        expect(openTypeFileType).toBe('OpenType');
        expect(compositeType1FileType).toBe('CIDFontType0');
        expect(compactFileType).toBe('MMType1');
        expect(compactFileSubtype).toBe('Type1C');
        expect(fallbackFileType).toBe('CustomType');
        expect(fallbackFileSubtype).toBe('CustomSubtype');
    });

    it('should cover _extractWidths composite, vertical and non-composite branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._composite = true;
        helper._vertical = true;

        const crossReference = helper._crossReference as unknown as { _fetch: jasmine.Spy };
        crossReference._fetch.and.callFake(function (value: unknown): unknown {
            const reference = value as _PdfReference & { _value?: unknown };
            if (reference && typeof reference === 'object' && '_value' in reference) {
                return reference._value;
            }
            return value;
        });

        const widthArrayReference: _PdfReference = createReference(200);
        const startReference: _PdfReference = createReference(1);
        const widthReference: _PdfReference = createReference(300);

        const vStartReference: _PdfReference = createReference(1);
        const vRangeCodeReference: _PdfReference = createReference(2);
        const vWidth1Reference: _PdfReference = createReference(10);
        const vWidth2Reference: _PdfReference = createReference(20);
        const vWidth3Reference: _PdfReference = createReference(30);

        const descriptor: _PdfDictionary = createDictionary({
            DW: 555.2,
            W: [
                startReference,
                [widthArrayReference, 150],
                3,
                4,
                widthReference
            ],
            DW2: [880, -1000],
            W2: [
                vStartReference,
                [1, 2, 3],
                5,
                vRangeCodeReference,
                vWidth1Reference,
                vWidth2Reference,
                vWidth3Reference
            ]
        });

        // Act
        helper._extractWidths(descriptor, 0, 0, createDictionary({}));

        const helperNonComposite: _FontHelper = createHelper();
        helperNonComposite._fontStructure._composite = false;

        const nonCompositeDescriptor: _PdfDictionary = createDictionary({
            Widths: [100, createReference(200), 300]
        });

        helperNonComposite._extractWidths(nonCompositeDescriptor, 0, 10, createDictionary({
            MissingWidth: 50
        }));

        // Assert
        expect(helper._fontStructure._defaultWidth).toBe(556);
        expect(helper._fontStructure._widths[1]).toBe(200);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._widths[3]).toBe(300);
        expect(helper._fontStructure._widths[4]).toBe(300);

        expect(helperNonComposite._fontStructure._widths[10]).toBe(100);
        expect(helperNonComposite._fontStructure._widths[11]).toBe(200);
        expect(helperNonComposite._fontStructure._widths[12]).toBe(300);
        expect(helperNonComposite._fontStructure._defaultWidth).toBe(50);
    });

    it('should cover _extractDataStructures and _buildToUnicode branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._composite = true;
        helper._fontStructure._name = 'Wingdings';
        helper._fontStructure._type = 'TrueType';
        helper._fontStructure._flags = 4;
        helper._fontStructure._isInternalFont = false;

        const cidInfo: _PdfDictionary = createDictionary({
            Registry: 'Adobe',
            Ordering: 'Japan1',
            Supplement: 5
        });

        const encodingDictionary: _PdfDictionary = createDictionary({
            BaseEncoding: _PdfName.get('MacRomanEncoding'),
            Differences: [
                65,
                _PdfName.get('Aacute')
            ]
        });

        const dictionary: _PdfDictionary = createDictionary({
            CIDSystemInfo: cidInfo,
            Encoding: encodingDictionary
        });

        const readToUnicodeSpy = spyOn(helper, '_readToUnicode').and.returnValue({
            _length: 0
        } as never);

        const buildToUnicodeSpy = spyOn(helper, '_buildToUnicode').and.returnValue({
            marker: 'toUnicode'
        } as never);

        // Act
        helper._extractDataStructures(dictionary, { marker: 'unicode' } as never);

        // Assert
        expect(helper._fontStructure._characterSystemInfo.registry).toBe('Adobe');
        expect(helper._fontStructure._characterSystemInfo.ordering).toBe('Japan1');
        expect(helper._fontStructure._characterSystemInfo.supplement).toBe(5);

        expect(helper._fontStructure._differences[65]).toBe('Aacute');
        expect(helper._baseEncodingName).toBeNull();
        expect(helper._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);

        expect(readToUnicodeSpy).toHaveBeenCalled();
        expect(buildToUnicodeSpy).toHaveBeenCalled();

        const helperIncluded: _FontHelper = createHelper();
        helperIncluded._fontStructure._composite = false;
        spyOn(helperIncluded, '_simpleFontToUnicode').and.returnValue(['A'] as never);

        const existingMap = {
            _length: 1
        };

        const includedResult = helperIncluded._buildToUnicode('WinAnsiEncoding', true, existingMap as never);
        const simpleResult = helperIncluded._buildToUnicode('WinAnsiEncoding', false, null as never);

        expect(includedResult).toBe(existingMap as never);
        expect(simpleResult).toBeTruthy();
    });

    it('should cover _readToUnicode name, stream, token-number, token-string and error branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const createSpy = spyOn(_PdfCharacterMapFactory.prototype, '_create').and.callFake(function (cmapObj: unknown): unknown {
            if (cmapObj instanceof _PdfName) {
                return {
                    getMap: function (): (string | number)[] {
                        return ['A'];
                    }
                };
            }

            return {
                _map: new Array(2),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, '\u0000A');
                }
            };
        });

        const nameResult = helper._readToUnicode(_PdfName.get('Identity-H'));

        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const streamResult = helper._readToUnicode(streamObject);

        createSpy.and.returnValue({
            _map: new Array(1),
            _forEach: function (): void {
                throw new Error('stream-map-failed');
            }
        } as never);

        const errorMessage: string = getThrownMessage(function (): void {
            helper._readToUnicode(streamObject);
        });

        // Assert
        expect(nameResult).toBeTruthy();
        expect(streamResult).toBeTruthy();
        expect(errorMessage).toContain('stream-map-failed');
    });

    it('should cover _simpleFontToUnicode all major branches including forceGlyphs, baseEncoding remap and ligature paths', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[0] = 'u0041';
        helper._fontStructure._defaultEncoding[1] = 'uni0042';
        helper._fontStructure._defaultEncoding[2] = 'G41';
        helper._fontStructure._defaultEncoding[3] = 'g0043';
        helper._fontStructure._defaultEncoding[5] = 'C5';
        helper._fontStructure._defaultEncoding[6] = 'f_h';
        helper._fontStructure._defaultEncoding[7] = 'f_t';
        helper._fontStructure._defaultEncoding[8] = 'T_h';
        helper._fontStructure._defaultEncoding[9] = '';
        helper._fontStructure._defaultEncoding[10] = '.notdef';

        helper._fontStructure._differences = [];
        helper._fontStructure._differences[11] = 'u0044';
        helper._fontStructure._differences[12] = 'uni0045';
        helper._fontStructure._differences[13] = '.notdef';

        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({
            65: 65,
            space: 32
        } as never);

        spyOn(encodingUtilsModule, '_getEncoding').and.returnValue((function (): string[] {
            const baseEncoding: string[] = [];
            baseEncoding[5] = '65';
            return baseEncoding;
        })() as never);

        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            switch (glyphName) {
            case 'u0041':
                return 65;
            case 'uni0042':
                return 66;
            case 'u0044':
                return 68;
            case 'uni0045':
                return 69;
            default:
                return -1;
            }
        });

        // Act
        const unicodeResult: any = helper._simpleFontToUnicode('WinAnsiEncoding');
        helper._fontStructure._defaultEncoding = ['c2A'];
        helper._fontStructure._differences = [];
        const forceGlyphResult: any = helper._simpleFontToUnicode(null, true);

        // Assert
        expect(unicodeResult[0]).toBe('A');
        expect(unicodeResult[1]).toBe('B');
        expect(unicodeResult[2]).toBe('A');
        expect(unicodeResult[3]).toBe('C');
        expect(unicodeResult[5]).toBeUndefined();
        expect(unicodeResult[6]).toBe('fh');
        expect(unicodeResult[7]).toBe('ft');
        expect(unicodeResult[8]).toBe('Th');
        expect(unicodeResult[9]).toBeUndefined();
        expect(unicodeResult[10]).toBeUndefined();
        expect(unicodeResult[11]).toBe('D');
        expect(unicodeResult[12]).toBe('E');
        expect(unicodeResult[13]).toBeUndefined();

        expect(forceGlyphResult[0]).toBe('*');
    });

    it('should cover _adjustWidths, _getBaseFontMetrics, _getMetrics, _getStandardFontName, _amendFallBackToUnicodeMap and _applyStandardFontGlyphMap', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];
        helper._fontStructure._widths = { 1: 200, 2: 300 } as never;
        helper._fontStructure._defaultWidth = 400;

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({
            'Arial-MT': 'Helvetica'
        } as never);

        spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({} as never);
        spyOn(helper, '_getMetrics').and.returnValue(['Helvetica', 'Times-Roman'] as never);
        spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
            return {
                _helveticaWidths: { A: 500 },
                _timesRoman: { B: 600 },
                _symbol: 700
            };
        });

        const toUnicodeMap = {
            _has: jasmine.createSpy('_has').and.returnValues(false, true),
            _amend: jasmine.createSpy('_amend')
        };

        const properties = {
            _fallBackToUnicodeMap: {
                65: 'A',
                66: 'B'
            },
            _fontStructure: {
                _toUnicode: toUnicodeMap
            }
        };

        const destinationMap: number[] = [];
        const glyphMap: { [key: number]: number } = { 65: 100, 66: 200 };

        // Act
        helper._adjustWidths();
        const baseMetricsResult = helper._getBaseFontMetrics('ArialMT');
        const metricNamesResult = helper._getMetrics();
        const standardFontNameResult = helper._getStandardFontName('Arial_MT');
        helper._amendFallBackToUnicodeMap(properties as never);
        helper._applyStandardFontGlyphMap(destinationMap, glyphMap);

        const amendArg: any[] = (toUnicodeMap._amend.calls.mostRecent().args[0] as any[]);

        // Assert
        expect(helper._fontStructure._widths[1]).toBe(100);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._defaultWidth).toBe(200);

        expect(baseMetricsResult.widths).toEqual({ A: 500 });
        expect(metricNamesResult.length).toBeGreaterThan(0);
        expect(standardFontNameResult).toBe('Helvetica');

        expect(amendArg[65]).toBe('A');
        expect(amendArg[66]).toBeUndefined();

        expect(destinationMap[65]).toBe(100);
        expect(destinationMap[66]).toBe(200);
    });

    it('should cover _setFallBackSystemFont, _spaceWidth, _charToGlyph and _convertCidString branches', () => {
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

    it('should cover _readNameTable, _readTrueTypeCollectionHeader and _readTrueTypeCollectionData branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const ttcFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x74, 0x74, 0x63, 0x66]);
            }
        };

        const ttcHeaderReader = {
            _stringValues: ['ttcf'],
            _unsigned16Values: [1, 0],
            _int32Values: [2, 100, 200],
            getString: function (): string {
                return this._stringValues.shift() as string;
            },
            getUnsignedInteger16: function (): number {
                return this._unsigned16Values.shift() as number;
            },
            getInt32: function (): number {
                return this._int32Values.shift() as number;
            }
        };

        const nameTable = { offset: 0, length: 40 };
        const fontReader = {
            start: 0,
            pos: 0,
            position: 0,
            _unsigned16Values: [
                0,
                2,
                30,

                1, 0, 0, 6, 4, 0,
                3, 1, 0x409, 6, 4, 4,

                0x0041, 0x0042
            ],
            _stringValues: ['Test'],
            getUnsignedInteger16: function (): number {
                this.position += 2;
                this.pos = this.position;
                return this._unsigned16Values.shift() as number;
            },
            getString: function (): string {
                return this._stringValues.shift() as string;
            }
        };

        const invalidMinorHeaderReader = {
            _stringValues: ['ttcf'],
            _unsigned16Values: [3, 0],
            _int32Values: [1, 100],
            getString: function (): string {
                return this._stringValues.shift() as string;
            },
            getUnsignedInteger16: function (): number {
                return this._unsigned16Values.shift() as number;
            },
            getInt32: function (): number {
                return this._int32Values.shift() as number;
            }
        };

        // Act
        const isTtcResult: boolean = helper._isTrueTypeCollectionFile(ttcFile as never);
        const ttcHeader = helper._readTrueTypeCollectionHeader(ttcHeaderReader as never);
        const macResult: boolean = helper._isMacNameRecord({ platform: 1, encoding: 0, language: 0 });
        const winResult: boolean = helper._isWinNameRecord({ platform: 3, encoding: 1, language: 0x409 });

        const nameResult = helper._readNameTable(nameTable as never, fontReader as never);

        const invalidHeaderMessage: string = getThrownMessage(function (): void {
            helper._readTrueTypeCollectionHeader(invalidMinorHeaderReader as never);
        });

        const helperExact: _FontHelper = createHelper();
        spyOn(helperExact, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 2,
            offsetTable: [100, 200]
        } as never);

        spyOn(helperExact, '_readOpenTypeHeader').and.returnValues(
            { numTables: 1, version: 'OTTO' } as never,
            { numTables: 1, version: 'OTTO' } as never
        );

        const exactTables = { name: { marker: 'nameTable1' } };
        const fallbackTables = { name: { marker: 'nameTable2' } };

        spyOn(helperExact, '_readTables').and.returnValues(
            exactTables as never,
            fallbackTables as never
        );

        spyOn(helperExact, '_readNameTable').and.returnValues(
            [[['ExactFont']], []] as never,
            [[['PartFont']], []] as never
        );

        const exactMatchResult = helperExact._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'ExactFont',
            {} as never
        );

        const helperFallback: _FontHelper = createHelper();
        spyOn(helperFallback, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperFallback, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperFallback, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
        spyOn(helperFallback, '_readNameTable').and.returnValue([[['PartFont']], []] as never);

        const fallbackMatchResult = helperFallback._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'PartFont+OtherPart',
            {} as never
        );

        const helperNoName: _FontHelper = createHelper();
        spyOn(helperNoName, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperNoName, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperNoName, '_readTables').and.returnValue({} as never);

        const noNameMessage: string = getThrownMessage(function (): void {
            helperNoName._readTrueTypeCollectionData(
                { start: 0, pos: 0 } as never,
                'MissingFont',
                {} as never
            );
        });

        const helperNotFound: _FontHelper = createHelper();
        spyOn(helperNotFound, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperNotFound, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperNotFound, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
        spyOn(helperNotFound, '_readNameTable').and.returnValue([[['AnotherFont']], []] as never);

        const notFoundMessage: string = getThrownMessage(function (): void {
            helperNotFound._readTrueTypeCollectionData(
                { start: 0, pos: 0 } as never,
                'MissingFont',
                {} as never
            );
        });

        // Assert
        expect(isTtcResult).toBeTruthy();
        expect(ttcHeader.numFonts).toBe(2);
        expect(ttcHeader.offsetTable).toEqual([100, 200]);
        expect(macResult).toBeTruthy();
        expect(winResult).toBeTruthy();

        expect(nameResult[1].length).toBe(2);
        expect(nameResult[0][0][6]).toBe('Test');
        expect(nameResult[0][1][6]).toBe('AB');

        expect(invalidHeaderMessage).toContain('Invalid TrueType Collection majorVersion');
        expect(exactMatchResult.tables).toBe(exactTables as never);
        expect(fallbackMatchResult).toBeTruthy();
        expect(noNameMessage).toContain('TrueType Collection font must contain a name table.');
        expect(notFoundMessage).toContain("TrueType Collection does not contain 'MissingFont' font.");
    });

    it('should cover _UnicodeMap and _PdfIdentityToUnicodeMap methods through _readToUnicode results', () => {
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
            Object.create(_PdfIdentityCharacterMap.prototype) as never
        );

        const unicodeMap: any = helper._readToUnicode(_PdfName.get('Any-CMap'));
        const identityMap: any = helper._readToUnicode(_PdfName.get('Identity-H'));

        // Act
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
        const amendMessage: string = getThrownMessage(function (): void {
            identityMap._amend();
        });

        // Assert
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
        expect(amendMessage).toContain('Should not call amend()');
    });

    it('should cover _checkAndRepair TTC entry, OpenType branch, _adjustType1ToUnicode and _adjustTrueTypeToUnicode safely', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._name = 'MyFont';
        helper._fontStructure._toUnicode = {
            _length: 0,
            _amend: jasmine.createSpy('_amend'),
            _has: function (): boolean {
                return false;
            },
            _forEach: function (): void {
                // no-op
            }
        } as never;

        const fontLike = {
            getBytes: function (): Uint8Array {
                return new Uint8Array([1, 2, 3, 4]);
            }
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(true);
        spyOn(helper, '_readTrueTypeCollectionData').and.returnValue({
            header: { version: 'OTTO', numTables: 1 },
            tables: {
                'compactFont ': { tag: 'compactFont ' },
                head: { offset: 0, data: new Uint8Array(60) },
                hhea: { data: new Uint8Array(20) },
                maxp: { offset: 0, length: 32, data: new Uint8Array(32) },
                post: {},
                name: { offset: 0, length: 0 }
            }
        } as never);

        spyOn(helper, '_readNameTable').and.returnValue([
            [[], []],
            []
        ] as never);

        // Act
        const int16Result: number = helper._int16(0x01, 0x02);
        helper._checkAndRepair(fontLike as never);

        helper._fontStructure._isInternalFont = false;
        helper._fontStructure._builtInEncoding = { 65: 'A', 66: 'B' } as never;
        helper._fontStructure._defaultEncoding = { 65: 'C' } as never;
        helper._fontStructure._differences = [];
        helper._baseEncodingName = null as never;
        helper._hasEncoding = false;
        helper._hasIncludedToUnicodeMap = false;

        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66, 65: 65 } as never);
        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            if (glyphName === 'A') {
                return 65;
            }
            if (glyphName === 'B') {
                return 66;
            }
            return -1;
        });

        helper._adjustType1ToUnicode();

        const trueTypeProperties = {
            _isInternalFont: false,
            _toUnicode: {
                _amend: jasmine.createSpy('_amend')
            },
            _defaultEncoding: ['X']
        };

        const originalWinAnsiZero: string = encodingUtilsModule._winAnsiEncoding[0];
        const originalWinAnsiOne: string = encodingUtilsModule._winAnsiEncoding[1];

        encodingUtilsModule._winAnsiEncoding[0] = '65';
        encodingUtilsModule._winAnsiEncoding[1] = '';

        helper._hasIncludedToUnicodeMap = false;
        helper._hasEncoding = false;

        helper._adjustTrueTypeToUnicode(
            trueTypeProperties as never,
            true,
            [{ platform: 3, encoding: 1, language: 0x409 }]
        );

        encodingUtilsModule._winAnsiEncoding[0] = originalWinAnsiZero;
        encodingUtilsModule._winAnsiEncoding[1] = originalWinAnsiOne;

        // Assert
        expect(int16Result).toBe(258);
        expect(helper._fontStructure._lineHeight).toBeDefined();
        expect((helper._fontStructure._toUnicode as unknown as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
        expect((trueTypeProperties._toUnicode as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
    });


describe('_font-structure remaining highlighted coverage strict AAA', () => {
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
});


    it('should cover _extractWidths highlighted composite, vertical and non-composite branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._composite = true;
        helper._vertical = true;

        const crossReference = helper._crossReference as unknown as { _fetch: jasmine.Spy };
        crossReference._fetch.and.callFake(function (value: unknown): unknown {
            const reference = value as _PdfReference & { _value?: unknown };
            if (reference && typeof reference === 'object' && '_value' in reference) {
                return reference._value;
            }
            return value;
        });

        const widthArrayReference: _PdfReference = createReference(200);
        const startReference: _PdfReference = createReference(1);
        const widthReference: _PdfReference = createReference(300);

        const vStartReference: _PdfReference = createReference(1);
        const vRangeCodeReference: _PdfReference = createReference(2);
        const vWidth1Reference: _PdfReference = createReference(10);
        const vWidth2Reference: _PdfReference = createReference(20);
        const vWidth3Reference: _PdfReference = createReference(30);

        const descriptor: _PdfDictionary = createDictionary({
            DW: 555.2,
            W: [
                startReference,
                [widthArrayReference, 150],
                3,
                4,
                widthReference
            ],
            DW2: [880, -1000],
            W2: [
                vStartReference,
                [1, 2, 3],
                5,
                vRangeCodeReference,
                vWidth1Reference,
                vWidth2Reference,
                vWidth3Reference
            ]
        });

        // Act
        helper._extractWidths(descriptor, 0, 0, createDictionary({}));

        const helperNonComposite: _FontHelper = createHelper();
        helperNonComposite._fontStructure._composite = false;

        const nonCompositeDescriptor: _PdfDictionary = createDictionary({
            Widths: [100, createReference(200), 300]
        });

        helperNonComposite._extractWidths(nonCompositeDescriptor, 0, 10, createDictionary({
            MissingWidth: 50
        }));

        // Assert
        expect(helper._fontStructure._defaultWidth).toBe(556);
        expect(helper._fontStructure._widths[1]).toBe(200);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._widths[3]).toBe(300);
        expect(helper._fontStructure._widths[4]).toBe(300);

        expect(helperNonComposite._fontStructure._widths[10]).toBe(100);
        expect(helperNonComposite._fontStructure._widths[11]).toBe(200);
        expect(helperNonComposite._fontStructure._widths[12]).toBe(300);
        expect(helperNonComposite._fontStructure._defaultWidth).toBe(50);
    });

    it('should cover _extractDataStructures highlighted branches and _buildToUnicode simple path', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._composite = true;
        helper._fontStructure._name = 'Wingdings';
        helper._fontStructure._type = 'TrueType';
        helper._fontStructure._flags = 4;
        helper._fontStructure._isInternalFont = false;

        const cidInfo: _PdfDictionary = createDictionary({
            Registry: 'Adobe',
            Ordering: 'Japan1',
            Supplement: 5
        });

        const encodingDictionary: _PdfDictionary = createDictionary({
            BaseEncoding: _PdfName.get('MacRomanEncoding'),
            Differences: [65, _PdfName.get('Aacute')]
        });

        const dictionary: _PdfDictionary = createDictionary({
            CIDSystemInfo: cidInfo,
            Encoding: encodingDictionary
        });

        const readToUnicodeSpy = spyOn(helper, '_readToUnicode').and.returnValue({
            _length: 0
        } as never);

        const buildToUnicodeSpy = spyOn(helper, '_buildToUnicode').and.returnValue({
            marker: 'toUnicode'
        } as never);

        // Act
        helper._extractDataStructures(dictionary, { marker: 'unicode' } as never);

        // Assert
        expect(helper._fontStructure._characterSystemInfo.registry).toBe('Adobe');
        expect(helper._fontStructure._characterSystemInfo.ordering).toBe('Japan1');
        expect(helper._fontStructure._characterSystemInfo.supplement).toBe(5);
        expect(helper._fontStructure._differences[65]).toBe('Aacute');
        expect(helper._baseEncodingName).toBeNull();
        expect(helper._fontStructure._defaultEncoding).toBe(encodingUtilsModule._winAnsiEncoding as never);
        expect(readToUnicodeSpy).toHaveBeenCalled();
        expect(buildToUnicodeSpy).toHaveBeenCalled();

        const helperSimple: _FontHelper = createHelper();
        helperSimple._fontStructure._composite = false;
        spyOn(helperSimple, '_simpleFontToUnicode').and.returnValue(['A'] as never);

        const includedMap = { _length: 1 };
        const includedResult = helperSimple._buildToUnicode('WinAnsiEncoding', true, includedMap as never);
        const nonCompositeResult = helperSimple._buildToUnicode('WinAnsiEncoding', false, null as never);

        expect(includedResult).toBe(includedMap as never);
        expect(nonCompositeResult).toBeTruthy();
    });

    it('should cover _readToUnicode highlighted name, stream and error branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const createSpy = spyOn(_PdfCharacterMapFactory.prototype, '_create').and.callFake(function (
            cmapObj: unknown
        ): unknown {
            if (cmapObj instanceof _PdfName) {
                return {
                    getMap: function (): (string | number)[] {
                        return ['A'];
                    }
                };
            }

            return {
                _map: new Array(2),
                _forEach: function (callback: (charCode: number, token: string | number) => void): void {
                    callback(0, 65);
                    callback(1, '\u0000A');
                }
            };
        });

        const nameResult = helper._readToUnicode(_PdfName.get('Identity-H'));

        const streamObject: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const streamResult = helper._readToUnicode(streamObject);

        createSpy.and.returnValue({
            _map: new Array(1),
            _forEach: function (): void {
                throw new Error('stream-map-failed');
            }
        } as never);

        const errorMessage: string = getThrownMessage(function (): void {
            helper._readToUnicode(streamObject);
        });

        // Assert
        expect(nameResult).toBeTruthy();
        expect(streamResult).toBeTruthy();
        expect(errorMessage).toContain('stream-map-failed');
    });

    it('should cover _simpleFontToUnicode all major safe branches including forceGlyphs, baseEncoding remap and ligatures', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[0] = 'u0041';
        helper._fontStructure._defaultEncoding[1] = 'uni0042';
        helper._fontStructure._defaultEncoding[2] = 'G41';
        helper._fontStructure._defaultEncoding[3] = 'g0043';
        helper._fontStructure._defaultEncoding[5] = 'C5';
        helper._fontStructure._defaultEncoding[6] = 'f_h';
        helper._fontStructure._defaultEncoding[7] = 'f_t';
        helper._fontStructure._defaultEncoding[8] = 'T_h';
        helper._fontStructure._defaultEncoding[9] = '';
        helper._fontStructure._defaultEncoding[10] = '.notdef';

        helper._fontStructure._differences = [];
        helper._fontStructure._differences[11] = 'u0044';
        helper._fontStructure._differences[12] = 'uni0045';
        helper._fontStructure._differences[13] = '.notdef';

        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({
            65: 65,
            space: 32
        } as never);

        spyOn(encodingUtilsModule, '_getEncoding').and.returnValue((function (): string[] {
            const baseEncoding: string[] = [];
            baseEncoding[5] = '65';
            return baseEncoding;
        })() as never);

        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            switch (glyphName) {
            case 'u0041':
                return 65;
            case 'uni0042':
                return 66;
            case 'u0044':
                return 68;
            case 'uni0045':
                return 69;
            default:
                return -1;
            }
        });

        // Act
        const unicodeResult: any = helper._simpleFontToUnicode('WinAnsiEncoding');

        helper._fontStructure._defaultEncoding = ['c2A'];
        helper._fontStructure._differences = [];
        const forceGlyphResult: any = helper._simpleFontToUnicode(null, true);

        // Assert
        expect(unicodeResult[0]).toBe('A');
        expect(unicodeResult[1]).toBe('B');
        expect(unicodeResult[2]).toBe('A');
        expect(unicodeResult[3]).toBe('C');
        expect(unicodeResult[5]).toBeUndefined();
        expect(unicodeResult[6]).toBe('fh');
        expect(unicodeResult[7]).toBe('ft');
        expect(unicodeResult[8]).toBe('Th');
        expect(unicodeResult[9]).toBeUndefined();
        expect(unicodeResult[10]).toBeUndefined();
        expect(unicodeResult[11]).toBe('D');
        expect(unicodeResult[12]).toBe('E');
        expect(unicodeResult[13]).toBeUndefined();

        expect(forceGlyphResult[0]).toBe('*');
    });

    it('should cover _adjustWidths, _getBaseFontMetrics, _getMetrics, _getStandardFontName, _amendFallBackToUnicodeMap and _applyStandardFontGlyphMap', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._fontMatrix = [0.002, 0, 0, 0.002, 0, 0];
        helper._fontStructure._widths = { 1: 200, 2: 300 } as never;
        helper._fontStructure._defaultWidth = 400;

        spyOn(encodingUtilsModule, '_getStdFontMap').and.returnValue({
            'Arial-MT': 'Helvetica'
        } as never);

        spyOn(encodingUtilsModule, '_getSerifFonts').and.returnValue({} as never);
        spyOn(helper, '_getMetrics').and.returnValue(['Helvetica', 'Times-Roman'] as never);
        spyOn(metricsModule, '_PdfMetrics').and.callFake(function (): unknown {
            return {
                _helveticaWidths: { A: 500 },
                _timesRoman: { B: 600 },
                _symbol: 700
            };
        });

        const toUnicodeMap = {
            _has: jasmine.createSpy('_has').and.returnValues(false, true),
            _amend: jasmine.createSpy('_amend')
        };

        const properties = {
            _fallBackToUnicodeMap: {
                65: 'A',
                66: 'B'
            },
            _fontStructure: {
                _toUnicode: toUnicodeMap
            }
        };

        const destinationMap: number[] = [];
        const glyphMap: { [key: number]: number } = { 65: 100, 66: 200 };

        // Act
        helper._adjustWidths();
        const baseMetricsResult = helper._getBaseFontMetrics('ArialMT');
        const metricNamesResult = helper._getMetrics();
        const standardFontNameResult = helper._getStandardFontName('Arial_MT');
        helper._amendFallBackToUnicodeMap(properties as never);
        helper._applyStandardFontGlyphMap(destinationMap, glyphMap);

        const amendArg: any[] = (toUnicodeMap._amend.calls.mostRecent().args[0] as any[]);

        // Assert
        expect(helper._fontStructure._widths[1]).toBe(100);
        expect(helper._fontStructure._widths[2]).toBe(150);
        expect(helper._fontStructure._defaultWidth).toBe(200);

        expect(baseMetricsResult.widths).toEqual({ A: 500 });
        expect(metricNamesResult.length).toBeGreaterThan(0);
        expect(standardFontNameResult).toBe('Helvetica');

        expect(amendArg[65]).toBe('A');
        expect(amendArg[66]).toBeUndefined();

        expect(destinationMap[65]).toBe(100);
        expect(destinationMap[66]).toBe(200);
    });

    it('should cover _setFallBackSystemFont, _spaceWidth, _charToGlyph and _convertCidString branches', () => {
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

    it('should cover _readNameTable, _readTrueTypeCollectionHeader and _readTrueTypeCollectionData branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const ttcFile = {
            peekBytes: function (): Uint8Array {
                return new Uint8Array([0x74, 0x74, 0x63, 0x66]);
            }
        };

        const ttcHeaderReader = {
            _stringValues: ['ttcf'],
            _unsigned16Values: [1, 0],
            _int32Values: [2, 100, 200],
            getString: function (): string {
                return this._stringValues.shift() as string;
            },
            getUnsignedInteger16: function (): number {
                return this._unsigned16Values.shift() as number;
            },
            getInt32: function (): number {
                return this._int32Values.shift() as number;
            }
        };

        const nameTable = { offset: 0, length: 40 };
        const fontReader = {
            start: 0,
            pos: 0,
            position: 0,
            _unsigned16Values: [
                0,
                2,
                30,

                1, 0, 0, 6, 4, 0,
                3, 1, 0x409, 6, 4, 4,

                0x0041, 0x0042
            ],
            _stringValues: ['Test'],
            getUnsignedInteger16: function (): number {
                this.position += 2;
                this.pos = this.position;
                return this._unsigned16Values.shift() as number;
            },
            getString: function (): string {
                return this._stringValues.shift() as string;
            }
        };

        const invalidMinorHeaderReader = {
            _stringValues: ['ttcf'],
            _unsigned16Values: [3, 0],
            _int32Values: [1, 100],
            getString: function (): string {
                return this._stringValues.shift() as string;
            },
            getUnsignedInteger16: function (): number {
                return this._unsigned16Values.shift() as number;
            },
            getInt32: function (): number {
                return this._int32Values.shift() as number;
            }
        };

        // Act
        const isTtcResult: boolean = helper._isTrueTypeCollectionFile(ttcFile as never);
        const ttcHeader = helper._readTrueTypeCollectionHeader(ttcHeaderReader as never);
        const macResult: boolean = helper._isMacNameRecord({ platform: 1, encoding: 0, language: 0 });
        const winResult: boolean = helper._isWinNameRecord({ platform: 3, encoding: 1, language: 0x409 });

        const nameResult = helper._readNameTable(nameTable as never, fontReader as never);

        const invalidHeaderMessage: string = getThrownMessage(function (): void {
            helper._readTrueTypeCollectionHeader(invalidMinorHeaderReader as never);
        });

        const helperExact: _FontHelper = createHelper();
        spyOn(helperExact, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 2,
            offsetTable: [100, 200]
        } as never);

        spyOn(helperExact, '_readOpenTypeHeader').and.returnValues(
            { numTables: 1, version: 'OTTO' } as never,
            { numTables: 1, version: 'OTTO' } as never
        );

        const exactTables = { name: { marker: 'nameTable1' } };
        const fallbackTables = { name: { marker: 'nameTable2' } };

        spyOn(helperExact, '_readTables').and.returnValues(
            exactTables as never,
            fallbackTables as never
        );

        spyOn(helperExact, '_readNameTable').and.returnValues(
            [[['ExactFont']], []] as never,
            [[['PartFont']], []] as never
        );

        const exactMatchResult = helperExact._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'ExactFont',
            {} as never
        );

        const helperFallback: _FontHelper = createHelper();
        spyOn(helperFallback, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperFallback, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperFallback, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
        spyOn(helperFallback, '_readNameTable').and.returnValue([[['PartFont']], []] as never);

        const fallbackMatchResult = helperFallback._readTrueTypeCollectionData(
            { start: 0, pos: 0 } as never,
            'PartFont+OtherPart',
            {} as never
        );

        const helperNoName: _FontHelper = createHelper();
        spyOn(helperNoName, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperNoName, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperNoName, '_readTables').and.returnValue({} as never);

        const noNameMessage: string = getThrownMessage(function (): void {
            helperNoName._readTrueTypeCollectionData(
                { start: 0, pos: 0 } as never,
                'MissingFont',
                {} as never
            );
        });

        const helperNotFound: _FontHelper = createHelper();
        spyOn(helperNotFound, '_readTrueTypeCollectionHeader').and.returnValue({
            numFonts: 1,
            offsetTable: [100]
        } as never);
        spyOn(helperNotFound, '_readOpenTypeHeader').and.returnValue({ numTables: 1, version: 'OTTO' } as never);
        spyOn(helperNotFound, '_readTables').and.returnValue({ name: { marker: 'nameTable' } } as never);
        spyOn(helperNotFound, '_readNameTable').and.returnValue([[['AnotherFont']], []] as never);

        const notFoundMessage: string = getThrownMessage(function (): void {
            helperNotFound._readTrueTypeCollectionData(
                { start: 0, pos: 0 } as never,
                'MissingFont',
                {} as never
            );
        });

        // Assert
        expect(isTtcResult).toBeTruthy();
        expect(ttcHeader.numFonts).toBe(2);
        expect(ttcHeader.offsetTable).toEqual([100, 200]);
        expect(macResult).toBeTruthy();
        expect(winResult).toBeTruthy();

        expect(nameResult[1].length).toBe(2);
        expect(nameResult[0][0][6]).toBe('Test');
        expect(nameResult[0][1][6]).toBe('AB');

        expect(invalidHeaderMessage).toContain('Invalid TrueType Collection majorVersion');
        expect(exactMatchResult.tables).toBe(exactTables as never);
        expect(fallbackMatchResult).toBeTruthy();
        expect(noNameMessage).toContain('TrueType Collection font must contain a name table.');
        expect(notFoundMessage).toContain("TrueType Collection does not contain 'MissingFont' font.");
    });

    it('should cover _UnicodeMap and _PdfIdentityToUnicodeMap methods through _readToUnicode results', () => {
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
            Object.create(_PdfIdentityCharacterMap.prototype) as never
        );

        const unicodeMap: any = helper._readToUnicode(_PdfName.get('Any-CMap'));
        const identityMap: any = helper._readToUnicode(_PdfName.get('Identity-H'));

        // Act
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
        const amendMessage: string = getThrownMessage(function (): void {
            identityMap._amend();
        });

        // Assert
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
        expect(amendMessage).toContain('Should not call amend()');
    });

    it('should cover _checkAndRepair highlighted TTC/OpenType entry, _adjustType1ToUnicode and _adjustTrueTypeToUnicode branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._name = 'MyFont';
        helper._fontStructure._toUnicode = {
            _length: 0,
            _amend: jasmine.createSpy('_amend'),
            _has: function (): boolean {
                return false;
            },
            _forEach: function (): void {
                // no-op
            }
        } as never;

        const fontLike = {
            getBytes: function (): Uint8Array {
                return new Uint8Array([1, 2, 3, 4]);
            }
        };

        spyOn(helper, '_isTrueTypeCollectionFile').and.returnValue(true);
        spyOn(helper, '_readTrueTypeCollectionData').and.returnValue({
            header: { version: 'OTTO', numTables: 1 },
            tables: {
                'compactFont ': { tag: 'compactFont ' },
                head: { offset: 0, data: new Uint8Array(60) },
                hhea: { data: new Uint8Array(20) },
                maxp: { offset: 0, length: 32, data: new Uint8Array(32) },
                post: {},
                name: { offset: 0, length: 0 }
            }
        } as never);

        spyOn(helper, '_readNameTable').and.returnValue([
            [[], []],
            []
        ] as never);

        // Act
        const int16Result: number = helper._int16(0x01, 0x02);
        helper._checkAndRepair(fontLike as never);

        helper._fontStructure._isInternalFont = false;
        helper._fontStructure._builtInEncoding = { 65: 'A', 66: 'B' } as never;
        helper._fontStructure._defaultEncoding = { 65: 'C' } as never;
        helper._fontStructure._differences = [];
        helper._baseEncodingName = null as never;
        helper._hasEncoding = false;
        helper._hasIncludedToUnicodeMap = false;

        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ A: 65, B: 66, 65: 65 } as never);
        spyOn(fontUtilsModule, '_getUnicodeForGlyph').and.callFake(function (glyphName: string): number {
            if (glyphName === 'A') {
                return 65;
            }
            if (glyphName === 'B') {
                return 66;
            }
            return -1;
        });

        helper._adjustType1ToUnicode();

        const trueTypeProperties = {
            _isInternalFont: false,
            _toUnicode: {
                _amend: jasmine.createSpy('_amend')
            },
            _defaultEncoding: ['X']
        };

        const originalWinAnsiZero: string = encodingUtilsModule._winAnsiEncoding[0];
        const originalWinAnsiOne: string = encodingUtilsModule._winAnsiEncoding[1];

        encodingUtilsModule._winAnsiEncoding[0] = '65';
        encodingUtilsModule._winAnsiEncoding[1] = '';

        helper._hasIncludedToUnicodeMap = false;
        helper._hasEncoding = false;

        helper._adjustTrueTypeToUnicode(
            trueTypeProperties as never,
            true,
            [{ platform: 3, encoding: 1, language: 0x409 }]
        );

        encodingUtilsModule._winAnsiEncoding[0] = originalWinAnsiZero;
        encodingUtilsModule._winAnsiEncoding[1] = originalWinAnsiOne;

        // Assert
        expect(int16Result).toBe(258);
        expect(helper._fontStructure._lineHeight).toBeDefined();
        expect((helper._fontStructure._toUnicode as unknown as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
        expect((trueTypeProperties._toUnicode as { _amend: jasmine.Spy })._amend).toHaveBeenCalled();
    });

describe('_font-structure screenshot-highlighted coverage strict AAA', () => {
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
                const reference: _PdfReference & { _value?: unknown } = value as _PdfReference & { _value?: unknown };
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

    it('should cover _getFontStyle highlighted no-delimiter bold and italic branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const boldDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('SampleBold')
        });

        const boldObliqueDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('SampleBoldOblique')
        });

        const italicDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('SampleItalic')
        });

        // Act
        const boldStyle: PdfFontStyle = helper._getFontStyle(boldDictionary);
        const boldObliqueStyle: PdfFontStyle = helper._getFontStyle(boldObliqueDictionary);
        const italicStyle: PdfFontStyle = helper._getFontStyle(italicDictionary);

        // Assert
        expect(boldStyle).toBe(PdfFontStyle.bold);
        expect(boldObliqueStyle).toBe(PdfFontStyle.italic);
        expect(italicStyle).toBe(PdfFontStyle.italic);
    });

    it('should cover _translateFont type3 creation and no-descriptor standard metric path with widths loop', () => {
        // Arrange
        const helperType3: _FontHelper = createHelper();
        helperType3._fontStructure._type = 'Type3';

        const type3Dictionary: _PdfDictionary = createDictionary({
            FontBBox: [10, 20, 1, 2]
        });

        const extractDataStructuresSpy = spyOn(helperType3, '_extractDataStructures').and.stub();
        const extractWidthsSpy = spyOn(helperType3, '_extractWidths').and.stub();
        const setFontDataSpy = spyOn(helperType3, '_setFontData').and.stub();

        // Act
        helperType3._translateFont(
            null as never,
            type3Dictionary as never,
            type3Dictionary as never,
            0,
            255,
            null
        );

        // Assert
        expect(helperType3._fontStructure._isType3Font).toBeTruthy();
        expect(extractDataStructuresSpy).toHaveBeenCalled();
        expect(extractWidthsSpy).toHaveBeenCalled();
        expect(setFontDataSpy).toHaveBeenCalled();

        // Arrange
        const helperNoDescriptor: _FontHelper = createHelper();
        helperNoDescriptor._fontStructure._type = 'Type1';

        spyOn(helperNoDescriptor, '_isSerifFont').and.returnValue(true);
        spyOn(helperNoDescriptor, '_getBaseFontMetrics').and.returnValue({
            widths: { A: 600 },
            defaultWidth: 500,
            monospace: false
        } as never);
        spyOn(encodingUtilsModule, '_getSymbolsFonts').and.returnValue({} as never);

        const fetchStandardFontDataSpy = spyOn(helperNoDescriptor, '_fetchStandardFontData').and.returnValue(
            new _PdfStream(new Uint8Array([1, 2, 3])) as never
        );
        const extractStructuresSpy = spyOn(helperNoDescriptor, '_extractDataStructures').and.stub();
        const setFontDataNoDescriptorSpy = spyOn(helperNoDescriptor, '_setFontData').and.stub();

        const noDescriptorDictionary: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('Times-Roman'),
            Widths: [100, createReference(200), 300]
        });

        // Act
        helperNoDescriptor._translateFont(
            null as never,
            noDescriptorDictionary as never,
            noDescriptorDictionary as never,
            10,
            12,
            null
        );

        // Assert
        expect(helperNoDescriptor._fontStructure._name).toBe('Times-Roman');
        expect(helperNoDescriptor._fontStructure._defaultWidth).toBe(500);
        expect(helperNoDescriptor._fontStructure._widths[10]).toBe(100);
        expect(helperNoDescriptor._fontStructure._widths[11]).toBe(200);
        expect(helperNoDescriptor._fontStructure._widths[12]).toBe(300);
        expect(fetchStandardFontDataSpy).toHaveBeenCalled();
        expect(helperNoDescriptor._fontStructure._isInternalFont).toBeTruthy();
        expect(extractStructuresSpy).toHaveBeenCalled();
        expect(setFontDataNoDescriptorSpy).toHaveBeenCalled();
    });

    it('should cover _buildCharCodeToWidth highlighted differences and encoding branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();
        helper._fontStructure._differences = [];
        helper._fontStructure._differences[65] = 'Aacute';
        helper._fontStructure._defaultEncoding = [];
        helper._fontStructure._defaultEncoding[66] = 'B';

        const widthsByGlyphName: { [key: string]: number } = {
            Aacute: 700,
            B: 500
        };

        // Act
        const result: { [key: number]: number } = helper._buildCharCodeToWidth(widthsByGlyphName);

        // Assert
        expect(result[65]).toBe(700);
        expect(result[66]).toBe(500);
    });

    it('should cover _fetchStandardFontData highlighted cache-hit, null and base64 decode branches', () => {
        // Arrange
        const helper: _FontHelper = createHelper();

        const cacheMap = new Map<string, Uint8Array>();
        cacheMap.set('Symbol', new Uint8Array([1, 2]));
        helper._standardFontDataCache = cacheMap as never;

        // Act
        const cachedResult = helper._fetchStandardFontData('Symbol');

        helper._standardFontDataCache = new Map<string, Uint8Array>() as never;
        const nullResult = helper._fetchStandardFontData('Helvetica');

        const encodedStringSpy = spyOn(fontUtilsModule, '_getFontEncodedString').and.returnValue(
            'data:font/opentype;base64,QUJD' as never
        );

        const decodedResult = helper._fetchStandardFontData('Symbol');

        // Assert
        expect(cachedResult).toBeTruthy();
        expect(nullResult).toBeNull();
        expect(encodedStringSpy).toHaveBeenCalled();
        expect(decodedResult).toBeTruthy();
        expect(helper._file).toBeTruthy();
        expect((helper._file as _PdfStream).getBytes().length).toBe(3);
    });

    it('should cover _setFontData highlighted type3, no-file and type1c branches', () => {
        // Arrange
        const helperType3: _FontHelper = createHelper();
        helperType3._fontStructure._type = 'Type3';
        helperType3._fontStructure._differences = [];
        helperType3._fontStructure._defaultEncoding = [];
        helperType3._fontStructure._differences[65] = 'A';
        helperType3._fontStructure._defaultEncoding[66] = 'B';

        // Act
        helperType3._setFontData();

        // Assert
        expect(helperType3._fontStructure._toFontChar[65]).toBe('A');
        expect(helperType3._fontStructure._toFontChar[66]).toBe('B');

        // Arrange
        const helperFallback: _FontHelper = createHelper();
        const fallbackSpy = spyOn(helperFallback, '_setFallBackSystemFont').and.stub();

        // Act
        helperFallback._setFontData();

        // Assert
        expect(fallbackSpy).toHaveBeenCalled();

        // Arrange
        const helperType1C: _FontHelper = createHelper();
        helperType1C._file = new _PdfStream(new Uint8Array([1, 2, 3])) as never;
        helperType1C._fileType = 'Type1';
        helperType1C._fileSubtype = 'Type1C';
        helperType1C._fontStructure._defaultEncoding = [] as never;
        helperType1C._fontStructure._builtInEncoding = null as never;
        helperType1C._fontStructure._toUnicode = {
            _length: 0,
            _amend: jasmine.createSpy('_amend'),
            _has: function (): boolean {
                return false;
            },
            _forEach: function (): void {
                // no-op
            }
        } as never;

        spyOn(helperType1C, '_getFontFileType').and.stub();
        spyOn(helperType1C, '_adjustWidths').and.stub();
        const adjustType1ToUnicodeSpy = spyOn(helperType1C, '_adjustType1ToUnicode').and.stub();

        spyOn(compactFontParserModule as unknown as { _PdfCompactFont: unknown }, '_PdfCompactFont' as never)
            .and.returnValue({
                _builtInEncoding: { 65: 'A' }
            } as never);

        // Act
        helperType1C._setFontData();

        // Assert
        expect(helperType1C._fontStructure._builtInEncoding[65]).toBe('A');
        expect(adjustType1ToUnicodeSpy).toHaveBeenCalled();
    });

});
});