
import * as encodingUtilsModule from '../../src/pdf-data-extract/core/text-extraction/encoding-utils';
import * as fontUtilsModule from '../../src/pdf-data-extract/core/text-extraction/font-utils';
import {
    FormatError
} from '@syncfusion/ej2-pdf';
import {
    _PdfCompactFontStrings,
    _PdfCompactFontIndex,
    _PdfCompactFontDictionary,
    _PdfCompactFontTopDictionary,
    _PdfCompactFontPrivateDictionary,
    _PdfCompactFontCharacterSet,
    _PdfCompactFontEncoding,
    _PdfCompactFontSelect,
    _PdfCompactFontOffsetTracker,
    _PdfCompactFontCompiler,
    _PdfCompactFont,
    _PdfCompactFontParser,
    _PdfCompactFormatFont,
    _PdfCompactFontHeader
} from '../../src/pdf-data-extract/core/text-extraction/compact-font-parser';

describe('_PdfCompactFontParser strict AAA coverage', () => {
    function createFile(bytes: Uint8Array): { getBytes: () => Uint8Array } {
        return {
            getBytes: function (): Uint8Array {
                return bytes;
            }
        };
    }

    function createParser(bytes: Uint8Array, properties?: object, isAnalysisEnabled?: boolean): _PdfCompactFontParser {
        return new _PdfCompactFontParser(
            createFile(bytes),
            properties ? properties : {},
            typeof isAnalysisEnabled === 'boolean' ? isAnalysisEnabled : false
        );
    }

    it('should initialize the parser constructor fields', () => {
        // Arrange
        const bytes: Uint8Array = new Uint8Array([1, 2, 3]);
        const file: { getBytes: () => Uint8Array } = createFile(bytes);
        const properties: { marker: string } = { marker: 'props' };

        // Act
        const parser: _PdfCompactFontParser = new _PdfCompactFontParser(file, properties, true);

        // Assert
        expect(parser._bytes).toBe(bytes);
        expect(parser._properties).toBe(properties as never);
        expect(parser._isAnalysisEnabled).toBeTruthy();
        expect(parser._pos).toBe(0);
        expect(parser._standardEncodingChars).toEqual([]);
        expect(parser._widths).toEqual([]);
    });

    it('should parse the compact font header and skip leading bytes when needed', () => {
        // Arrange
        const parserAtZero: _PdfCompactFontParser = createParser(new Uint8Array([1, 0, 4, 2]));
        const parserWithLeadingBytes: _PdfCompactFontParser = createParser(new Uint8Array([9, 9, 1, 2, 4, 3]));

        // Act
        const resultAtZero: { obj: _PdfCompactFontHeader; endPos: number } =
            (parserAtZero as unknown as { _parseHeader: () => { obj: _PdfCompactFontHeader; endPos: number } })['_parseHeader']();

        const resultWithLeadingBytes: { obj: _PdfCompactFontHeader; endPos: number } =
            (parserWithLeadingBytes as unknown as { _parseHeader: () => { obj: _PdfCompactFontHeader; endPos: number } })['_parseHeader']();

        // Assert
        expect(resultAtZero.obj.major).toBe(1);
        expect(resultAtZero.obj.minor).toBe(0);
        expect(resultAtZero.obj.headerSize).toBe(4);
        expect(resultAtZero.obj.offSize).toBe(2);
        expect(resultAtZero.endPos).toBe(4);

        expect(resultWithLeadingBytes.obj.major).toBe(1);
        expect(resultWithLeadingBytes.obj.minor).toBe(2);
        expect(resultWithLeadingBytes.obj.headerSize).toBe(4);
        expect(resultWithLeadingBytes.obj.offSize).toBe(3);
        expect(resultWithLeadingBytes.endPos).toBe(4);
    });



    it('should parse all supported operand forms and return NaN for invalid operand forms', () => {
        // Arrange
        const parserFloat: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserShort: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserLong: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserRange: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserPositiveLarge: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserNegativeLarge: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserInvalid: _PdfCompactFontParser = createParser(new Uint8Array([1]));

        const floatDictionary: Uint8Array = new Uint8Array([30, 0x1A, 0x2F]);
        const shortDictionary: Uint8Array = new Uint8Array([28, 0x01, 0x02]);
        const longDictionary: Uint8Array = new Uint8Array([29, 0x00, 0x00, 0x01, 0x00]);
        const rangeDictionary: Uint8Array = new Uint8Array([139]);
        const positiveLargeDictionary: Uint8Array = new Uint8Array([247, 1]);
        const negativeLargeDictionary: Uint8Array = new Uint8Array([251, 1]);
        const invalidDictionary: Uint8Array = new Uint8Array([27]);

        // Act
        const floatResult: number = parserFloat._parseOperand(floatDictionary);
        const shortResult: number = parserShort._parseOperand(shortDictionary);
        const longResult: number = parserLong._parseOperand(longDictionary);
        const rangeResult: number = parserRange._parseOperand(rangeDictionary);
        const positiveLargeResult: number = parserPositiveLarge._parseOperand(positiveLargeDictionary);
        const negativeLargeResult: number = parserNegativeLarge._parseOperand(negativeLargeDictionary);
        const invalidResult: number = parserInvalid._parseOperand(invalidDictionary);

        // Assert
        expect(floatResult).toBe(1.2);
        expect(shortResult).toBe(258);
        expect(longResult).toBe(256);
        expect(rangeResult).toBe(0);
        expect(positiveLargeResult).toBe(109);
        expect(negativeLargeResult).toBe(-109);
        expect(isNaN(invalidResult)).toBeTruthy();
    });

    it('should parse dictionaries, indexes, name indexes, string indexes and create typed dictionaries', () => {
        // Arrange
        const parserDictionary: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const dictionaryBytes: Uint8Array = new Uint8Array([
            139, 0,
            28, 0, 5, 1,
            30, 0x1A, 0x2F, 2,
            12, 30
        ]);

        const parserIndex: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 2,
            1,
            1, 3, 5,
            65, 66, 67, 68
        ]));

        const namesIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        namesIndex.add(new Uint8Array([70, 111, 111]));

        const stringsIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        stringsIndex.add(new Uint8Array([66, 97, 114]));

        // Act
        const dictionaryResult: [number, number[]][] = parserDictionary._parseDictionary(dictionaryBytes);
        const indexResult: { obj: _PdfCompactFontIndex; endPos: number } = parserIndex._parseIndex(0);
        const namesResult: string[] = parserIndex._parseNameIndex(namesIndex);
        const stringsResult: _PdfCompactFontStrings = parserIndex._parseStringIndex(stringsIndex);
        const privateDictionary: _PdfCompactFontPrivateDictionary = parserIndex._createDictionary(
            _PdfCompactFontPrivateDictionary,
            [[20, [10]], [21, [20]]],
            new _PdfCompactFontStrings()
        );

        // Assert
        expect(dictionaryResult.length).toBe(4);
        expect(dictionaryResult[0][0]).toBe(0);
        expect(dictionaryResult[0][1]).toEqual([0]);
        expect(dictionaryResult[1][0]).toBe(1);
        expect(dictionaryResult[1][1]).toEqual([5]);
        expect(dictionaryResult[2][0]).toBe(2);
        expect(dictionaryResult[2][1]).toEqual([1.2]);
        expect(dictionaryResult[3][0]).toBe((12 << 8) | 30);

        expect(indexResult.obj.count).toBe(2);
        expect(Array.from(indexResult.obj._get(0))).toEqual([65, 66]);
        expect(Array.from(indexResult.obj._get(1))).toEqual([67, 68]);
        expect(indexResult.endPos).toBe(10);

        expect(namesResult).toEqual(['Foo']);
        expect(stringsResult._get(391)).toBe('Bar');
        expect(privateDictionary._getByName('defaultWidthX')).toBe(10);
        expect(privateDictionary._getByName('nominalWidthX')).toBe(20);
    });

    it('should parse private dictionaries through all major branches', () => {
        // Arrange
        const parserNoPrivate: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parentNoPrivate: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
        };
        const emptyPrivateDictionarySpyNoPrivate = spyOn(parserNoPrivate, '_emptyPrivateDictionary').and.stub();

        const parserInvalidArray: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parentInvalidArray: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
            _removeByName: jasmine.Spy;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([10]),
            _removeByName: jasmine.createSpy('_removeByName')
        };

        const parserInvalidOffset: _PdfCompactFontParser = createParser(new Uint8Array([1, 2, 3]));
        const parentInvalidOffset: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValues([0, 1], [10, 100])
        };
        const emptyPrivateDictionarySpyInvalidOffset = spyOn(parserInvalidOffset, '_emptyPrivateDictionary').and.stub();

        const parserNoSubrs: _PdfCompactFontParser = createParser(new Uint8Array([1, 2, 3, 4, 5]));
        const privateDictionaryNoSubrs: {
            _getByName: jasmine.Spy;
            _setByName: jasmine.Spy;
        } = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'ExpansionFactor') {
                    return 0;
                }
                if (name === 'Subrs') {
                    return 0;
                }
                return 0;
            }),
            _setByName: jasmine.createSpy('_setByName')
        };
        const parentNoSubrs: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
            privateDictionary?: object;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([2, 1])
        };
        spyOn(parserNoSubrs, '_parseDictionary').and.returnValue([]);
        const createDictionarySpyNoSubrs = spyOn(parserNoSubrs, '_createDictionary').and.returnValue(privateDictionaryNoSubrs as never);

        const parserSubrsInvalid: _PdfCompactFontParser = createParser(new Uint8Array([1, 2, 3, 4, 5]));
        const privateDictionarySubrsInvalid: {
            _getByName: jasmine.Spy;
            _setByName: jasmine.Spy;
        } = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'ExpansionFactor') {
                    return 1;
                }
                if (name === 'Subrs') {
                    return 100;
                }
                return 0;
            }),
            _setByName: jasmine.createSpy('_setByName')
        };
        const parentSubrsInvalid: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([2, 1])
        };
        spyOn(parserSubrsInvalid, '_parseDictionary').and.returnValue([]);
        spyOn(parserSubrsInvalid, '_createDictionary').and.returnValue(privateDictionarySubrsInvalid as never);
        const emptyPrivateDictionarySpySubrsInvalid = spyOn(parserSubrsInvalid, '_emptyPrivateDictionary').and.stub();

        const parserSubrsValid: _PdfCompactFontParser = createParser(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
        const subroutineIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        const privateDictionarySubrsValid: {
            _getByName: jasmine.Spy;
            _setByName: jasmine.Spy;
            subroutineIndex?: object;
        } = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'ExpansionFactor') {
                    return 1;
                }
                if (name === 'Subrs') {
                    return 1;
                }
                return 0;
            }),
            _setByName: jasmine.createSpy('_setByName')
        };
        const parentSubrsValid: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
            privateDictionary?: object;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([2, 1])
        };
        spyOn(parserSubrsValid, '_parseDictionary').and.returnValue([]);
        spyOn(parserSubrsValid, '_createDictionary').and.returnValue(privateDictionarySubrsValid as never);
        spyOn(parserSubrsValid, '_parseIndex').and.returnValue({ obj: subroutineIndex, endPos: 0 });

        // Act
        parserNoPrivate._parsePrivateDictionary(parentNoPrivate);
        parserInvalidArray._parsePrivateDictionary(parentInvalidArray);
        parserInvalidOffset._parsePrivateDictionary(parentInvalidOffset);
        parserInvalidOffset._parsePrivateDictionary(parentInvalidOffset);
        parserNoSubrs._parsePrivateDictionary(parentNoSubrs);
        parserSubrsInvalid._parsePrivateDictionary(parentSubrsInvalid);
        parserSubrsValid._parsePrivateDictionary(parentSubrsValid);

        // Assert
        expect(emptyPrivateDictionarySpyNoPrivate).toHaveBeenCalledWith(parentNoPrivate);
        expect(parentInvalidArray._removeByName).toHaveBeenCalledWith('Private');
        expect(emptyPrivateDictionarySpyInvalidOffset.calls.count()).toBe(2);

        expect(createDictionarySpyNoSubrs).toHaveBeenCalled();
        expect(parentNoSubrs.privateDictionary).toBe(privateDictionaryNoSubrs as never);
        expect(privateDictionaryNoSubrs._setByName).toHaveBeenCalledWith('ExpansionFactor', 0.06);

        expect(emptyPrivateDictionarySpySubrsInvalid).toHaveBeenCalledWith(parentSubrsInvalid);
        expect(privateDictionarySubrsValid.subroutineIndex).toBe(subroutineIndex as never);
    });


    it('should parse charstrings and cover valid, invalid, width and standardCharacter branches', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        const glyphOne: Uint8Array = new Uint8Array([10, 20]);
        const glyphTwo: Uint8Array = new Uint8Array([30, 40]);

        const charStrings: {
            count: number;
            _get: (index: number) => Uint8Array;
            set: jasmine.Spy;
        } = {
            count: 2,
            _get: function (index: number): Uint8Array {
                if (index === 0) {
                    return glyphOne;
                }
                return glyphTwo;
            },
            set: jasmine.createSpy('set')
        };

        const dictionaryToUse: {
            _getByName: jasmine.Spy;
            subroutineIndex?: object;
        } = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'nominalWidthX') {
                    return 10;
                }
                if (name === 'defaultWidthX') {
                    return 20;
                }
                return 0;
            }),
            subroutineIndex: { marker: 'localSubrs' }
        };

        const fontDictionarySelect: {
            getFDIndex: jasmine.Spy;
        } = {
            getFDIndex: jasmine.createSpy('getFDIndex').and.returnValues(0, 0)
        };

        const fontDictionaryArray: Array<{ privateDictionary: object }> = [
            { privateDictionary: dictionaryToUse as never }
        ];

        let parseCharStringCallCount: number = 0;
        spyOn(parser, '_parseCharString').and.callFake(function (
            state: {
                width: number | null;
                standardCharacter: number[] | null;
            }
        ): boolean {
            parseCharStringCallCount++;
            if (parseCharStringCallCount === 1) {
                state.width = null;
                state.standardCharacter = null;
                return false;
            }
            state.width = 5;
            state.standardCharacter = [1, 2, 3, 4];
            return true;
        });

        // Act
        const result: {
            charStrings: object;
            this: object;
            widths: number[];
        } = parser._parseCharStrings(
            charStrings,
            { marker: 'localSubrIndex' },
            { marker: 'globalSubrIndex' },
            fontDictionarySelect,
            fontDictionaryArray,
            dictionaryToUse
        );

        // Assert
        expect(charStrings.set).toHaveBeenCalledWith(0, new Uint8Array([14]));
        expect(parser._widths[0]).toBe(20);
        expect(parser._widths[1]).toBe(15);
        expect(parser._standardEncodingChars[1]).toEqual([1, 2, 3, 4] as never);
        expect(result.charStrings).toBe(charStrings as never);
        expect(result.this).toBe(parser._standardEncodingChars as never);
        expect(result.widths).toBe(parser._widths as never);
    });

    it('should parse charstring bytecode through operand, return, endchar, hintmask, callsubr and invalid subroutine branches', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        const localSubroutineIndex: {
            count: number;
            _get: jasmine.Spy;
        } = {
            count: 10,
            _get: jasmine.createSpy('_get').and.returnValue([11])
        };

        const globalSubroutineIndex: {
            count: number;
            _get: jasmine.Spy;
        } = {
            count: 10,
            _get: jasmine.createSpy('_get').and.returnValue([11])
        };

        const stateSubroutine = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateStandardCharacter = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateHintMask = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 1,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateInvalidSubroutine = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        // Act
        const validSubroutineReturn: boolean = parser._parseCharString(
            stateSubroutine as never,
            [32, 10],
            localSubroutineIndex as never,
            globalSubroutineIndex as never
        );

        const standardCharacterFail: boolean = parser._parseCharString(
            stateStandardCharacter as never,
            [139, 139, 139, 139, 14],
            localSubroutineIndex as never,
            globalSubroutineIndex as never
        );

        const hintMaskContinue: boolean = parser._parseCharString(
            stateHintMask as never,
            [19, 0],
            localSubroutineIndex as never,
            globalSubroutineIndex as never
        );

        const invalidSubroutineResult: boolean = parser._parseCharString(
            stateInvalidSubroutine as never,
            [139, 29],
            null as never,
            null as never
        );

        // Assert
        expect(validSubroutineReturn).toBeTruthy();
        expect(localSubroutineIndex._get).toHaveBeenCalled();

        expect(standardCharacterFail).toBeFalsy();
        expect(stateStandardCharacter.standardCharacter).toEqual([0, 0, 0, 0]);

        expect(hintMaskContinue).toBeTruthy();
        expect(invalidSubroutineResult).toBeFalsy();
    });

    it('should parse the full compact font in non-CID mode', () => {
        // Arrange
        const parserNonCid: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, false);

        const stringsNonCid: _PdfCompactFontStrings = new _PdfCompactFontStrings();

        const nameIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        nameIndexNonCid.add(new Uint8Array([65]));

        const topDictIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        topDictIndexNonCid.add(new Uint8Array([1, 2]));

        const stringIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        stringIndexNonCid.add(new Uint8Array([66]));

        const globalSubrIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        const charStringsIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStringsIndexNonCid.add(new Uint8Array([14]));

        const topDictNonCid: {
            privateDictionary: { subroutineIndex: object };
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
        } = {
            privateDictionary: { subroutineIndex: { marker: 'subrs' } },
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'ROS' ? false : false;
            }),
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): unknown {
                if (name === 'CharStrings') {
                    return 100;
                }
                if (name === 'FontMatrix') {
                    return [0.001, 0, 0, 0.001, 0, 0];
                }
                if (name === 'FontBBox') {
                    return [0, -10, 100, 200];
                }
                if (name === 'charSet') {
                    return 0;
                }
                if (name === 'Encoding') {
                    return 0;
                }
                return undefined;
            })
        };

        const propertiesNonCid: {
            _fontStructure: { _fontMatrix?: number[] };
            ascent?: number;
            descent?: number;
            ascentScaled?: boolean;
        } = {
            _fontStructure: {}
        };

        spyOn(parserNonCid as any, '_parseHeader').and.returnValue({ obj: { marker: 'header' }, endPos: 4 } as never);

        let parseIndexCallCountNonCid: number = 0;
        spyOn(parserNonCid, '_parseIndex').and.callFake(function (): { obj: _PdfCompactFontIndex; endPos: number } {
            parseIndexCallCountNonCid++;
            if (parseIndexCallCountNonCid === 1) {
                return { obj: nameIndexNonCid, endPos: 10 };
            }
            if (parseIndexCallCountNonCid === 2) {
                return { obj: topDictIndexNonCid, endPos: 20 };
            }
            if (parseIndexCallCountNonCid === 3) {
                return { obj: stringIndexNonCid, endPos: 30 };
            }
            if (parseIndexCallCountNonCid === 4) {
                return { obj: globalSubrIndexNonCid, endPos: 40 };
            }
            return { obj: charStringsIndexNonCid, endPos: 50 };
        });

        spyOn(parserNonCid, '_parseDictionary').and.returnValue([]);
        spyOn(parserNonCid, '_createDictionary').and.returnValue(topDictNonCid as never);
        spyOn(parserNonCid, '_parseNameIndex').and.returnValue(['FontName']);
        spyOn(parserNonCid, '_parseStringIndex').and.returnValue(stringsNonCid);
        const parsePrivateDictionarySpyNonCid = spyOn(parserNonCid, '_parsePrivateDictionary').and.stub();
        const parseCharSetsSpyNonCid = spyOn(parserNonCid, '_parseCharSets').and.returnValue({ charSet: ['.notdef'] } as never);
        const parseEncodingSpyNonCid = spyOn(parserNonCid, '_parseEncoding').and.returnValue({ encoding: { 65: 0 } } as never);
        const parseCharStringsSpyNonCid = spyOn(parserNonCid, '_parseCharStrings').and.returnValue({
            charStrings: charStringsIndexNonCid,
            standardEncodingChars: ['A'],
            widths: [500]
        } as never);

        // Act
        const nonCidResult: _PdfCompactFormatFont = parserNonCid._parse(propertiesNonCid);

        // Assert
        expect(parsePrivateDictionarySpyNonCid).toHaveBeenCalled();
        expect(parseCharSetsSpyNonCid).toHaveBeenCalled();
        expect(parseEncodingSpyNonCid).toHaveBeenCalled();
        expect(parseCharStringsSpyNonCid).toHaveBeenCalled();

        expect(propertiesNonCid._fontStructure._fontMatrix).toEqual([0.001, 0, 0, 0.001, 0, 0]);
        expect(propertiesNonCid.ascent).toBe(200);
        expect(propertiesNonCid.descent).toBe(-10);
        expect(propertiesNonCid.ascentScaled).toBeTruthy();

        expect(nonCidResult.isCharacterIdentifierFont).toBeFalsy();
        expect(nonCidResult.charStrings).toBe(charStringsIndexNonCid as never);
        expect(nonCidResult.standardEncodingChars).toEqual(['A'] as never);
        expect(nonCidResult.widths).toEqual([500] as never);
    });

    it('should parse the full compact font in CID mode', () => {
        // Arrange
        const parserCid: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, false);

        const stringsCid: _PdfCompactFontStrings = new _PdfCompactFontStrings();

        const nameIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        nameIndexCid.add(new Uint8Array([65]));

        const topDictIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        topDictIndexCid.add(new Uint8Array([1, 2]));

        const stringIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        stringIndexCid.add(new Uint8Array([66]));

        const globalSubrIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        const fdArrayIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        fdArrayIndexCid.add(new Uint8Array([7, 8]));
        const charStringsIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStringsIndexCid.add(new Uint8Array([14]));

        const topDictCid: {
            privateDictionary: { subroutineIndex: object };
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
        } = {
            privateDictionary: { subroutineIndex: { marker: 'subrs' } },
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'ROS';
            }),
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): unknown {
                if (name === 'FDArray') {
                    return 200;
                }
                if (name === 'CharStrings') {
                    return 100;
                }
                if (name === 'FDSelect') {
                    return 210;
                }
                if (name === 'charSet') {
                    return 0;
                }
                return undefined;
            })
        };

        const fdTopDictOne: {
            privateDictionary?: object;
        } = {};

        spyOn(parserCid as any, '_parseHeader').and.returnValue({ obj: { marker: 'header' }, endPos: 4 } as never);

        let parseIndexCallCountCid: number = 0;
        spyOn(parserCid, '_parseIndex').and.callFake(function (pos: number): { obj: _PdfCompactFontIndex; endPos: number } {
            parseIndexCallCountCid++;
            if (parseIndexCallCountCid === 1) {
                return { obj: nameIndexCid, endPos: 10 };
            }
            if (parseIndexCallCountCid === 2) {
                return { obj: topDictIndexCid, endPos: 20 };
            }
            if (parseIndexCallCountCid === 3) {
                return { obj: stringIndexCid, endPos: 30 };
            }
            if (parseIndexCallCountCid === 4) {
                return { obj: globalSubrIndexCid, endPos: 40 };
            }
            if (pos === 200) {
                return { obj: fdArrayIndexCid, endPos: 45 };
            }
            return { obj: charStringsIndexCid, endPos: 50 };
        });

        let createDictionaryCallCountCid: number = 0;
        spyOn(parserCid, '_parseDictionary').and.returnValue([]);
        spyOn(parserCid, '_createDictionary').and.callFake(function (): unknown {
            createDictionaryCallCountCid++;
            if (createDictionaryCallCountCid === 1) {
                return topDictCid;
            }
            return fdTopDictOne;
        });
        spyOn(parserCid, '_parseNameIndex').and.returnValue(['FontName']);
        spyOn(parserCid, '_parseStringIndex').and.returnValue(stringsCid);
        spyOn(parserCid, '_parsePrivateDictionary').and.callFake(function (dict: Record<string, unknown>): void {
            dict.privateDictionary = { subroutineIndex: { marker: 'fd-subrs' } };
        });
        const parseCharSetsSpyCid = spyOn(parserCid, '_parseCharSets').and.returnValue({ charSet: [0] } as never);
        const parseFontDictionarySelectSpyCid = spyOn(parserCid, '_parseFontDictionarySelect').and.returnValue({ marker: 'fd-select' } as never);
        const parseCharStringsSpyCid = spyOn(parserCid, '_parseCharStrings').and.returnValue({
            charStrings: charStringsIndexCid,
            standardEncodingChars: [] as any,
            widths: [600]
        } as never);

        // Act
        const cidResult: _PdfCompactFormatFont = parserCid._parse({ _fontStructure: {} });

        // Assert
        expect(parseCharSetsSpyCid).toHaveBeenCalled();
        expect(parseFontDictionarySelectSpyCid).toHaveBeenCalled();
        expect(parseCharStringsSpyCid).toHaveBeenCalled();
        expect(cidResult.isCharacterIdentifierFont).toBeTruthy();
        expect(cidResult.fontDictionaryArray.length).toBe(1);
        expect(cidResult.fontDictionarySelect).toEqual({ marker: 'fd-select' } as never);
    });

    it('should create an empty private dictionary helper', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parentDictionary: {
            strings: _PdfCompactFontStrings;
            _setByKey: jasmine.Spy;
            privateDictionary?: object;
        } = {
            strings: new _PdfCompactFontStrings(),
            _setByKey: jasmine.createSpy('_setByKey')
        };

        const createDictionarySpy = spyOn(parser, '_createDictionary').and.returnValue({ marker: 'private' } as never);

        // Act
        parser._emptyPrivateDictionary(parentDictionary);

        // Assert
        expect(createDictionarySpy).toHaveBeenCalled();
        expect(parentDictionary._setByKey).toHaveBeenCalledWith(18, [0, 0]);
        expect(parentDictionary.privateDictionary).toEqual({ marker: 'private' } as never);
    });
});

describe('_PdfCompactFont key helper classes strict AAA coverage', () => {
    it('should initialize compact font format and duplicate the first glyph when allowed', () => {
        // Arrange
        const compactFormatFont: _PdfCompactFormatFont = new _PdfCompactFormatFont();
        const charStrings: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStrings.add(new Uint8Array([14]));
        compactFormatFont.charStrings = charStrings as never;
        compactFormatFont.fontDictionarySelect = {
            fontDictionarySelect: [5]
        } as never;
        compactFormatFont.isCharacterIdentifierFont = true;

        // Act
        compactFormatFont._duplicateFirstGlyph();
        const hasGlyphZero: boolean = compactFormatFont._hasGlyphId(0);
        const hasGlyphTwo: boolean = compactFormatFont._hasGlyphId(2);

        // Assert
        expect(compactFormatFont.charStrings.count).toBe(2);
        expect(compactFormatFont.fontDictionarySelect.fontDictionarySelect).toEqual([5, 5]);
        expect(hasGlyphZero).toBeTruthy();
        expect(hasGlyphTwo).toBeFalsy();

        compactFormatFont.charStrings = {
            count: 65535,
            _get: function (): Uint8Array {
                return new Uint8Array([14]);
            },
            add: jasmine.createSpy('add')
        } as never;

        compactFormatFont._duplicateFirstGlyph();
        expect((compactFormatFont.charStrings.add as jasmine.Spy)).not.toHaveBeenCalled();
    });


});

describe('_PdfCompactFontCompiler strict AAA coverage', () => {
    function createCompactFontBlueprint(): {
        header: _PdfCompactFontHeader;
        names: string[];
        topDict: Record<string, unknown>;
        strings: _PdfCompactFontStrings & { getSID: (name: string) => number };
        globalSubroutineIndex: _PdfCompactFontIndex;
        encoding: Record<string, unknown>;
        charSet: Record<string, unknown>;
        charStrings: _PdfCompactFontIndex;
        fontDictionaryArray: Record<string, unknown>[];
        fontDictionarySelect: Record<string, unknown>;
        isCharacterIdentifierFont: boolean;
    } {
        const strings = new _PdfCompactFontStrings() as _PdfCompactFontStrings & {
            getSID: (name: string) => number;
        };
        strings._add('Custom');
        strings.getSID = function (name: string): number {
            if (name === 'Custom') {
                return 391;
            }
            return -1;
        };

        const globalSubroutineIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();

        const charStrings: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStrings.add(new Uint8Array([14]));
        charStrings.add(new Uint8Array([]));

        const topDict: Record<string, unknown> = {
            order: [] as any,
            values: Object.create(null),
            opcodes: Object.create(null),
            types: Object.create(null),
            keyToNameMap: Object.create(null),
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'Encoding' || name === 'Private' || name === 'XUID';
            }),
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): unknown {
                if (name === 'Encoding') {
                    return 1;
                }
                if (name === 'Private') {
                    return [0, 0];
                }
                if (name === 'XUID') {
                    return new Array(20).fill(1);
                }
                return undefined;
            }),
            _setByName: jasmine.createSpy('_setByName'),
            _removeByName: jasmine.createSpy('_removeByName'),
            privateDictionary: {
                subroutineIndex: null as any,
                _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
            }
        };

        return {
            header: new _PdfCompactFontHeader(1, 0, 4, 1),
            names: ['Bad/Name'],
            topDict: topDict,
            strings: strings,
            globalSubroutineIndex: globalSubroutineIndex,
            encoding: {
                predefined: false,
                format: 1,
                raw: new Uint8Array([1, 2, 3]),
                encoding: { 65: 1 }
            },
            charSet: {
                charSet: ['.notdef', 'Custom'],
                predefined: false,
                format: 0,
                raw: new Uint8Array([0])
            },
            charStrings: charStrings,
            fontDictionaryArray: [] as any,
            fontDictionarySelect: {
                format: 3,
                fontDictionarySelect: [1, 1, 2]
            },
            isCharacterIdentifierFont: false
        };
    }

    it('should compile top-level structures, encode numbers and transform matrices', () => {
        // Arrange
        const compactFontData = createCompactFontBlueprint();
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler(compactFontData as never);

        const compileTopDictionarySpy = spyOn(compiler, '_compileTopDictionary').and.returnValue({
            trackers: [
                {
                    _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
                    _offset: jasmine.createSpy('_offset')
                }
            ],
            output: [1, 2, 3]
        } as never);

        const compileStringIndexSpy = spyOn(compiler, '_compileStringIndex').and.returnValue([4]);
        const compileIndexSpy = spyOn(compiler, '_compileIndex').and.returnValue([5]);
        const compileCharSetSpy = spyOn(compiler, '_compileCharSet').and.returnValue([6]);
        const compileCharStringsSpy = spyOn(compiler, '_compileCharStrings').and.returnValue([7]);
        const compilePrivateDictionarySpy = spyOn(compiler, '_compilePrivateDictionary').and.stub();
        const compileEncodingSpy = spyOn(compiler, '_compileEncoding').and.returnValue([8]);

        // Act
        const compiled: number[] = compiler.compile();

        // Assert
        expect(compileTopDictionarySpy).toHaveBeenCalled();
        expect(compileStringIndexSpy).toHaveBeenCalled();
        expect(compileIndexSpy).toHaveBeenCalled();
        expect(compileCharSetSpy).toHaveBeenCalled();
        expect(compileCharStringsSpy).toHaveBeenCalled();
        expect(compilePrivateDictionarySpy).toHaveBeenCalled();
        expect(compileEncodingSpy).toHaveBeenCalled();
        expect(compiled[compiled.length - 1]).toBe(0);

        expect(compiler._transform([1, 0, 0, 1, 2, 3], [2, 0, 0, 2, 4, 5])).toEqual([2, 0, 0, 2, 6, 8]);

        expect(compiler._encodeInteger(0)).toEqual([139]);
        expect(compiler._encodeInteger(108)).toEqual([247, 0]);
        expect(compiler._encodeInteger(-108)).toEqual([251, 0]);
        expect(compiler._encodeInteger(32768)).toEqual([0x1d, 0, 0, 128, 0]);

        expect(compiler._encodeFloat(1.25)).toEqual([30, 0x1A, 0x25, 0xFF]);
        expect(compiler._encodeNumber(1.25)).toEqual([30, 0x1A, 0x25, 0xFF]);
        expect(compiler._encodeNumber(10)).toEqual([149]);

        expect(compiler._compileHeader(new _PdfCompactFontHeader(1, 0, 6, 2))).toEqual([1, 0, 4, 2]);
        expect(compiler._compileTypedArray(new Uint8Array([1, 2, 3]))).toEqual([1, 2, 3]);
    });


});
describe('_PdfCompactFontParser strict AAA coverage', () => {
    function createFile(bytes: Uint8Array): { getBytes: () => Uint8Array } {
        return {
            getBytes: function (): Uint8Array {
                return bytes;
            }
        };
    }

    function createParser(bytes: Uint8Array, properties?: object, isAnalysisEnabled?: boolean): _PdfCompactFontParser {
        return new _PdfCompactFontParser(
            createFile(bytes),
            properties ? properties : {},
            typeof isAnalysisEnabled === 'boolean' ? isAnalysisEnabled : false
        );
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

    it('should initialize the parser constructor fields', () => {
        // Arrange
        const bytes: Uint8Array = new Uint8Array([1, 2, 3]);
        const file: { getBytes: () => Uint8Array } = createFile(bytes);
        const properties: { marker: string } = { marker: 'props' };

        // Act
        const parser: _PdfCompactFontParser = new _PdfCompactFontParser(file, properties, true);

        // Assert
        expect(parser._bytes).toBe(bytes);
        expect(parser._properties).toBe(properties as never);
        expect(parser._isAnalysisEnabled).toBeTruthy();
        expect(parser._pos).toBe(0);
        expect(parser._standardEncodingChars).toEqual([]);
        expect(parser._widths).toEqual([]);
    });

    it('should parse the compact font header and skip leading bytes when needed', () => {
        // Arrange
        const parserAtZero: _PdfCompactFontParser = createParser(new Uint8Array([1, 0, 4, 2]));
        const parserWithLeadingBytes: _PdfCompactFontParser = createParser(new Uint8Array([9, 9, 1, 2, 4, 3]));

        // Act
        const resultAtZero: { obj: _PdfCompactFontHeader; endPos: number } = (
            parserAtZero as unknown as {
                _parseHeader: () => { obj: _PdfCompactFontHeader; endPos: number };
            }
        )['_parseHeader']();

        const resultWithLeadingBytes: { obj: _PdfCompactFontHeader; endPos: number } = (
            parserWithLeadingBytes as unknown as {
                _parseHeader: () => { obj: _PdfCompactFontHeader; endPos: number };
            }
        )['_parseHeader']();

        // Assert
        expect(resultAtZero.obj.major).toBe(1);
        expect(resultAtZero.obj.minor).toBe(0);
        expect(resultAtZero.obj.headerSize).toBe(4);
        expect(resultAtZero.obj.offSize).toBe(2);
        expect(resultAtZero.endPos).toBe(4);

        expect(resultWithLeadingBytes.obj.major).toBe(1);
        expect(resultWithLeadingBytes.obj.minor).toBe(2);
        expect(resultWithLeadingBytes.obj.headerSize).toBe(4);
        expect(resultWithLeadingBytes.obj.offSize).toBe(3);
        expect(resultWithLeadingBytes.endPos).toBe(4);
    });

    it('should throw for an invalid compact font header', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([9, 9, 9]));

        // Act
        const message: string = getThrownMessage(function (): void {
            (
                parser as unknown as {
                    _parseHeader: () => { obj: _PdfCompactFontHeader; endPos: number };
                }
            )['_parseHeader']();
        });

        // Assert
        expect(message).toBe('Invalid compactFont header');
    });

    it('should parse all supported operand forms and return NaN for invalid operand forms', () => {
        // Arrange
        const parserFloat: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserShort: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserLong: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserRange: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserPositiveLarge: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserNegativeLarge: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parserInvalid: _PdfCompactFontParser = createParser(new Uint8Array([1]));

        const floatDictionary: Uint8Array = new Uint8Array([30, 0x1A, 0x2F]);
        const shortDictionary: Uint8Array = new Uint8Array([28, 0x01, 0x02]);
        const longDictionary: Uint8Array = new Uint8Array([29, 0x00, 0x00, 0x01, 0x00]);
        const rangeDictionary: Uint8Array = new Uint8Array([139]);
        const positiveLargeDictionary: Uint8Array = new Uint8Array([247, 1]);
        const negativeLargeDictionary: Uint8Array = new Uint8Array([251, 1]);
        const invalidDictionary: Uint8Array = new Uint8Array([27]);

        // Act
        const floatResult: number = parserFloat._parseOperand(floatDictionary);
        const shortResult: number = parserShort._parseOperand(shortDictionary);
        const longResult: number = parserLong._parseOperand(longDictionary);
        const rangeResult: number = parserRange._parseOperand(rangeDictionary);
        const positiveLargeResult: number = parserPositiveLarge._parseOperand(positiveLargeDictionary);
        const negativeLargeResult: number = parserNegativeLarge._parseOperand(negativeLargeDictionary);
        const invalidResult: number = parserInvalid._parseOperand(invalidDictionary);

        // Assert
        expect(floatResult).toBe(1.2);
        expect(shortResult).toBe(258);
        expect(longResult).toBe(256);
        expect(rangeResult).toBe(0);
        expect(positiveLargeResult).toBe(109);
        expect(negativeLargeResult).toBe(-109);
        expect(isNaN(invalidResult)).toBeTruthy();
    });

    it('should parse dictionaries, indexes, name indexes, string indexes and create typed dictionaries', () => {
        // Arrange
        const parserDictionary: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const dictionaryBytes: Uint8Array = new Uint8Array([
            139, 0,
            28, 0, 5, 1,
            30, 0x1A, 0x2F, 2,
            12, 30
        ]);

        const parserIndex: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 2,
            1,
            1, 3, 5,
            65, 66, 67, 68
        ]));

        const namesIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        namesIndex.add(new Uint8Array([70, 111, 111]));

        const stringsIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        stringsIndex.add(new Uint8Array([66, 97, 114]));

        // Act
        const dictionaryResult: [number, number[]][] = parserDictionary._parseDictionary(dictionaryBytes);
        const indexResult: { obj: _PdfCompactFontIndex; endPos: number } = parserIndex._parseIndex(0);
        const namesResult: string[] = parserIndex._parseNameIndex(namesIndex);
        const stringsResult: _PdfCompactFontStrings = parserIndex._parseStringIndex(stringsIndex);
        const privateDictionary: _PdfCompactFontPrivateDictionary = parserIndex._createDictionary(
            _PdfCompactFontPrivateDictionary,
            [[20, [10]], [21, [20]]],
            new _PdfCompactFontStrings()
        );

        // Assert
        expect(dictionaryResult.length).toBe(4);
        expect(dictionaryResult[0][0]).toBe(0);
        expect(dictionaryResult[0][1]).toEqual([0]);
        expect(dictionaryResult[1][0]).toBe(1);
        expect(dictionaryResult[1][1]).toEqual([5]);
        expect(dictionaryResult[2][0]).toBe(2);
        expect(dictionaryResult[2][1]).toEqual([1.2]);
        expect(dictionaryResult[3][0]).toBe((12 << 8) | 30);

        expect(indexResult.obj.count).toBe(2);
        expect(Array.from(indexResult.obj._get(0))).toEqual([65, 66]);
        expect(Array.from(indexResult.obj._get(1))).toEqual([67, 68]);
        expect(indexResult.endPos).toBe(10);

        expect(namesResult).toEqual(['Foo']);
        expect(stringsResult._get(391)).toBe('Bar');
        expect(privateDictionary._getByName('defaultWidthX')).toBe(10);
        expect(privateDictionary._getByName('nominalWidthX')).toBe(20);
    });

    it('should parse private dictionaries through all major branches', () => {
        // Arrange
        const parserNoPrivate: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parentNoPrivate: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
        };
        const emptyPrivateDictionarySpyNoPrivate = spyOn(parserNoPrivate, '_emptyPrivateDictionary').and.stub();

        const parserInvalidArray: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parentInvalidArray: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
            _removeByName: jasmine.Spy;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([10]),
            _removeByName: jasmine.createSpy('_removeByName')
        };

        const parserInvalidOffset: _PdfCompactFontParser = createParser(new Uint8Array([1, 2, 3]));
        const parentInvalidOffset: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValues([0, 1], [10, 100])
        };
        const emptyPrivateDictionarySpyInvalidOffset = spyOn(parserInvalidOffset, '_emptyPrivateDictionary').and.stub();

        const parserNoSubrs: _PdfCompactFontParser = createParser(new Uint8Array([1, 2, 3, 4, 5]));
        const privateDictionaryNoSubrs: {
            _getByName: jasmine.Spy;
            _setByName: jasmine.Spy;
        } = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'ExpansionFactor') {
                    return 0;
                }
                if (name === 'Subrs') {
                    return 0;
                }
                return 0;
            }),
            _setByName: jasmine.createSpy('_setByName')
        };
        const parentNoSubrs: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
            privateDictionary?: object;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([2, 1])
        };
        spyOn(parserNoSubrs, '_parseDictionary').and.returnValue([]);
        const createDictionarySpyNoSubrs = spyOn(parserNoSubrs, '_createDictionary').and.returnValue(privateDictionaryNoSubrs as never);

        const parserSubrsInvalid: _PdfCompactFontParser = createParser(new Uint8Array([1, 2, 3, 4, 5]));
        const privateDictionarySubrsInvalid: {
            _getByName: jasmine.Spy;
            _setByName: jasmine.Spy;
        } = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'ExpansionFactor') {
                    return 1;
                }
                if (name === 'Subrs') {
                    return 100;
                }
                return 0;
            }),
            _setByName: jasmine.createSpy('_setByName')
        };
        const parentSubrsInvalid: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([2, 1])
        };
        spyOn(parserSubrsInvalid, '_parseDictionary').and.returnValue([]);
        spyOn(parserSubrsInvalid, '_createDictionary').and.returnValue(privateDictionarySubrsInvalid as never);
        const emptyPrivateDictionarySpySubrsInvalid = spyOn(parserSubrsInvalid, '_emptyPrivateDictionary').and.stub();

        const parserSubrsValid: _PdfCompactFontParser = createParser(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
        const subroutineIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        const privateDictionarySubrsValid: {
            _getByName: jasmine.Spy;
            _setByName: jasmine.Spy;
            subroutineIndex?: object;
        } = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'ExpansionFactor') {
                    return 1;
                }
                if (name === 'Subrs') {
                    return 1;
                }
                return 0;
            }),
            _setByName: jasmine.createSpy('_setByName')
        };
        const parentSubrsValid: {
            strings: _PdfCompactFontStrings;
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
            privateDictionary?: object;
        } = {
            strings: new _PdfCompactFontStrings(),
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([2, 1])
        };
        spyOn(parserSubrsValid, '_parseDictionary').and.returnValue([]);
        spyOn(parserSubrsValid, '_createDictionary').and.returnValue(privateDictionarySubrsValid as never);
        spyOn(parserSubrsValid, '_parseIndex').and.returnValue({ obj: subroutineIndex, endPos: 0 });

        // Act
        parserNoPrivate._parsePrivateDictionary(parentNoPrivate);
        parserInvalidArray._parsePrivateDictionary(parentInvalidArray);
        parserInvalidOffset._parsePrivateDictionary(parentInvalidOffset);
        parserInvalidOffset._parsePrivateDictionary(parentInvalidOffset);
        parserNoSubrs._parsePrivateDictionary(parentNoSubrs);
        parserSubrsInvalid._parsePrivateDictionary(parentSubrsInvalid);
        parserSubrsValid._parsePrivateDictionary(parentSubrsValid);

        // Assert
        expect(emptyPrivateDictionarySpyNoPrivate).toHaveBeenCalledWith(parentNoPrivate);
        expect(parentInvalidArray._removeByName).toHaveBeenCalledWith('Private');
        expect(emptyPrivateDictionarySpyInvalidOffset.calls.count()).toBe(2);

        expect(createDictionarySpyNoSubrs).toHaveBeenCalled();
        expect(parentNoSubrs.privateDictionary).toBe(privateDictionaryNoSubrs as never);
        expect(privateDictionaryNoSubrs._setByName).toHaveBeenCalledWith('ExpansionFactor', 0.06);

        expect(emptyPrivateDictionarySpySubrsInvalid).toHaveBeenCalledWith(parentSubrsInvalid);
        expect(privateDictionarySubrsValid.subroutineIndex).toBe(subroutineIndex as never);
    });

    it('should parse explicit and predefined charsets and throw for unknown format', () => {
        // Arrange
        const parserStandard: _PdfCompactFontParser = createParser(new Uint8Array([0]));
        const parserExpert: _PdfCompactFontParser = createParser(new Uint8Array([0]));
        const parserExpertSubset: _PdfCompactFontParser = createParser(new Uint8Array([0]));

        const parserFormat0: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 0, 0,
            0, 0, 1, 0, 2
        ]));

        const parserFormat1: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 0, 0,
            1, 0, 1, 1
        ]));

        const parserFormat2: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 0, 0,
            2, 0, 1, 0, 1
        ]));

        const parserUnknown: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 0, 0,
            9
        ]));

        const strings: {
            _get: jasmine.Spy;
        } = {
            _get: jasmine.createSpy('_get').and.callFake(function (id: number): string {
                return 'sid-' + id.toString();
            })
        };

        // Act
        const standardResult: _PdfCompactFontCharacterSet = parserStandard._parseCharSets(0, 2, strings, false);
        const expertResult: _PdfCompactFontCharacterSet = parserExpert._parseCharSets(1, 2, strings, false);
        const expertSubsetResult: _PdfCompactFontCharacterSet = parserExpertSubset._parseCharSets(2, 2, strings, false);

        const format0Result: _PdfCompactFontCharacterSet = parserFormat0._parseCharSets(3, 3, strings, true);
        const format1Result: _PdfCompactFontCharacterSet = parserFormat1._parseCharSets(3, 3, strings, false);
        const format2Result: _PdfCompactFontCharacterSet = parserFormat2._parseCharSets(3, 3, strings, false);

        const unknownFormatMessage: string = getThrownMessage(function (): void {
            parserUnknown._parseCharSets(3, 2, strings, false);
        });

        // Assert
        expect(standardResult.predefined).toBeTruthy();
        expect(expertResult.predefined).toBeTruthy();
        expect(expertSubsetResult.predefined).toBeTruthy();

        expect(format0Result.predefined).toBeFalsy();
        expect(format0Result.format).toBe(0);
        expect(format0Result.charSet[0]).toBe(0);
        expect(format0Result.charSet[1]).toBe(1);
        expect(format0Result.charSet[2]).toBe(2);

        expect(format1Result.charSet[0]).toBe('.notdef');
        expect(format1Result.charSet[1]).toBe('sid-1');
        expect(format1Result.charSet[2]).toBe('sid-2');

        expect(format2Result.charSet[0]).toBe('.notdef');
        expect(format2Result.charSet[1]).toBe('sid-1');
        expect(format2Result.charSet[2]).toBe('sid-2');

        expect(unknownFormatMessage).toBe('Unknown charSet format');
    });

    it('should read supplements and parse predefined and explicit encodings and throw for unknown encoding format', () => {
        // Arrange
        const parserPredefinedStandard: _PdfCompactFontParser = createParser(new Uint8Array([0]));
        const parserPredefinedExpert: _PdfCompactFontParser = createParser(new Uint8Array([0]));

        const parserFormat0: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 0,
            0, 2, 65, 66
        ]));

        const parserFormat1Supplement: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 0,
            0x81, 1, 10, 1, 1, 20, 0, 1
        ]));

        const parserUnknown: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 0,
            9
        ]));

        const strings: {
            _get: jasmine.Spy;
        } = {
            _get: jasmine.createSpy('_get').and.returnValue('sid-1')
        };

        const charSet: string[] = ['.notdef', 'A', 'B', 'sid-1'];

        // Act
        const predefinedStandardResult: _PdfCompactFontEncoding = parserPredefinedStandard._parseEncoding(0, {}, strings, charSet);
        const predefinedExpertResult: _PdfCompactFontEncoding = parserPredefinedExpert._parseEncoding(1, {}, strings, charSet);
        const format0Result: _PdfCompactFontEncoding = parserFormat0._parseEncoding(2, {}, strings, charSet);
        const format1SupplementResult: _PdfCompactFontEncoding = parserFormat1Supplement._parseEncoding(2, {}, strings, charSet);

        const unknownMessage: string = getThrownMessage(function (): void {
            parserUnknown._parseEncoding(2, {}, strings, charSet);
        });

        // Assert
        expect(predefinedStandardResult.predefined).toBeTruthy();
        expect(predefinedStandardResult.format).toBe(0);

        expect(predefinedExpertResult.predefined).toBeTruthy();
        expect(predefinedExpertResult.format).toBe(1);

        expect(format0Result.predefined).toBeFalsy();
        expect(format0Result.format).toBe(0);
        expect(format0Result.encoding[65]).toBe(1);
        expect(format0Result.encoding[66]).toBe(2);

        expect(format1SupplementResult.predefined).toBeFalsy();
        expect(format1SupplementResult.format).toBe(1);
        expect(format1SupplementResult.encoding[10]).toBe(1);
        expect(format1SupplementResult.encoding[20]).toBe(3);

        expect(unknownMessage).toBe('Unknown encoding format: 9 in compactFont');
    });

    it('should parse FDSelect format 0 and 3 and throw for invalid format and invalid length', () => {
        // Arrange
        const parserFormat0: _PdfCompactFontParser = createParser(new Uint8Array([
            0, 1, 2, 3
        ]));
        const parserFormat3: _PdfCompactFontParser = createParser(new Uint8Array([
            3, 0, 1, 0, 1, 5, 0, 3
        ]));
        const parserUnknown: _PdfCompactFontParser = createParser(new Uint8Array([9]));
        const parserInvalidLength: _PdfCompactFontParser = createParser(new Uint8Array([
            3, 0, 1, 0, 0, 1, 0, 1
        ]));

        // Act
        const format0Result: _PdfCompactFontSelect = parserFormat0._parseFontDictionarySelect(0, 3);
        const format3Result: _PdfCompactFontSelect = parserFormat3._parseFontDictionarySelect(0, 3);

        const unknownFormatMessage: string = getThrownMessage(function (): void {
            parserUnknown._parseFontDictionarySelect(0, 1);
        });

        const invalidLengthMessage: string = getThrownMessage(function (): void {
            parserInvalidLength._parseFontDictionarySelect(0, 3);
        });

        // Assert
        expect(format0Result.format).toBe(0);
        expect(format0Result.fontDictionarySelect).toEqual([1, 2, 3]);

        expect(format3Result.format).toBe(3);
        expect(format3Result.fontDictionarySelect).toEqual([5, 5, 5]);

        expect(unknownFormatMessage).toBe("parseFDSelect: Unknown format '9'.");
        expect(invalidLengthMessage).toBe('parseFDSelect: Invalid font data.');
    });

    it('should parse charstrings and cover valid, invalid, width and standardCharacter branches', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        const glyphOne: Uint8Array = new Uint8Array([10, 20]);
        const glyphTwo: Uint8Array = new Uint8Array([30, 40]);

        const charStrings: {
            count: number;
            _get: (index: number) => Uint8Array;
            set: jasmine.Spy;
        } = {
            count: 2,
            _get: function (index: number): Uint8Array {
                if (index === 0) {
                    return glyphOne;
                }
                return glyphTwo;
            },
            set: jasmine.createSpy('set')
        };

        const dictionaryToUse: {
            _getByName: jasmine.Spy;
            subroutineIndex?: object;
        } = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'nominalWidthX') {
                    return 10;
                }
                if (name === 'defaultWidthX') {
                    return 20;
                }
                return 0;
            }),
            subroutineIndex: { marker: 'localSubrs' }
        };

        const fontDictionarySelect: {
            getFDIndex: jasmine.Spy;
        } = {
            getFDIndex: jasmine.createSpy('getFDIndex').and.returnValues(0, 0)
        };

        const fontDictionaryArray: Array<{ privateDictionary: object }> = [
            { privateDictionary: dictionaryToUse as never }
        ];

        let parseCharStringCallCount: number = 0;
        spyOn(parser, '_parseCharString').and.callFake(function (
            state: {
                width: number | null;
                standardCharacter: number[] | null;
            }
        ): boolean {
            parseCharStringCallCount++;
            if (parseCharStringCallCount === 1) {
                state.width = null;
                state.standardCharacter = null;
                return false;
            }
            state.width = 5;
            state.standardCharacter = [1, 2, 3, 4];
            return true;
        });

        // Act
        const result: {
            charStrings: object;
            this: object;
            widths: number[];
        } = parser._parseCharStrings(
            charStrings,
            { marker: 'localSubrIndex' },
            { marker: 'globalSubrIndex' },
            fontDictionarySelect,
            fontDictionaryArray,
            dictionaryToUse
        );

        // Assert
        expect(charStrings.set).toHaveBeenCalledWith(0, new Uint8Array([14]));
        expect(parser._widths[0]).toBe(20);
        expect(parser._widths[1]).toBe(15);
        expect(parser._standardEncodingChars[1]).toEqual([1, 2, 3, 4] as never);
        expect(result.charStrings).toBe(charStrings as never);
        expect(result.this).toBe(parser._standardEncodingChars as never);
        expect(result.widths).toBe(parser._widths as never);
    });

    it('should parse charstring bytecode through operand, return, endchar, hintmask, callsubr and invalid subroutine branches', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        const localSubroutineIndex: {
            count: number;
            _get: jasmine.Spy;
        } = {
            count: 10,
            _get: jasmine.createSpy('_get').and.returnValue([11])
        };

        const globalSubroutineIndex: {
            count: number;
            _get: jasmine.Spy;
        } = {
            count: 10,
            _get: jasmine.createSpy('_get').and.returnValue([11])
        };

        const stateSubroutine = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateStandardCharacter = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateHintMask = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 1,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateInvalidSubroutine = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        // Act
        const validSubroutineReturn: boolean = parser._parseCharString(
            stateSubroutine as never,
            [32, 10],
            localSubroutineIndex as never,
            globalSubroutineIndex as never
        );

        const standardCharacterFail: boolean = parser._parseCharString(
            stateStandardCharacter as never,
            [139, 139, 139, 139, 14],
            localSubroutineIndex as never,
            globalSubroutineIndex as never
        );

        const hintMaskContinue: boolean = parser._parseCharString(
            stateHintMask as never,
            [19, 0],
            localSubroutineIndex as never,
            globalSubroutineIndex as never
        );

        const invalidSubroutineResult: boolean = parser._parseCharString(
            stateInvalidSubroutine as never,
            [139, 29],
            null as never,
            null as never
        );

        // Assert
        expect(validSubroutineReturn).toBeTruthy();
        expect(localSubroutineIndex._get).toHaveBeenCalled();

        expect(standardCharacterFail).toBeFalsy();
        expect(stateStandardCharacter.standardCharacter).toEqual([0, 0, 0, 0]);

        expect(hintMaskContinue).toBeTruthy();
        expect(invalidSubroutineResult).toBeFalsy();
    });

    it('should parse the full compact font in non-CID mode', () => {
        // Arrange
        const parserNonCid: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, false);

        const stringsNonCid: _PdfCompactFontStrings = new _PdfCompactFontStrings();

        const nameIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        nameIndexNonCid.add(new Uint8Array([65]));

        const topDictIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        topDictIndexNonCid.add(new Uint8Array([1, 2]));

        const stringIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        stringIndexNonCid.add(new Uint8Array([66]));

        const globalSubrIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        const charStringsIndexNonCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStringsIndexNonCid.add(new Uint8Array([14]));

        const topDictNonCid: {
            privateDictionary: { subroutineIndex: object };
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
        } = {
            privateDictionary: { subroutineIndex: { marker: 'subrs' } },
            _hasName: jasmine.createSpy('_hasName').and.returnValue(false),
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): unknown {
                if (name === 'CharStrings') {
                    return 100;
                }
                if (name === 'FontMatrix') {
                    return [0.001, 0, 0, 0.001, 0, 0];
                }
                if (name === 'FontBBox') {
                    return [0, -10, 100, 200];
                }
                if (name === 'charSet') {
                    return 0;
                }
                if (name === 'Encoding') {
                    return 0;
                }
                return undefined;
            })
        };

        const propertiesNonCid: {
            _fontStructure: { _fontMatrix?: number[] };
            ascent?: number;
            descent?: number;
            ascentScaled?: boolean;
        } = {
            _fontStructure: {}
        };

        spyOn(parserNonCid as unknown as { _parseHeader: () => unknown }, '_parseHeader').and.returnValue({ obj: { marker: 'header' }, endPos: 4 } as never);

        let parseIndexCallCountNonCid: number = 0;
        spyOn(parserNonCid, '_parseIndex').and.callFake(function (): { obj: _PdfCompactFontIndex; endPos: number } {
            parseIndexCallCountNonCid++;
            if (parseIndexCallCountNonCid === 1) {
                return { obj: nameIndexNonCid, endPos: 10 };
            }
            if (parseIndexCallCountNonCid === 2) {
                return { obj: topDictIndexNonCid, endPos: 20 };
            }
            if (parseIndexCallCountNonCid === 3) {
                return { obj: stringIndexNonCid, endPos: 30 };
            }
            if (parseIndexCallCountNonCid === 4) {
                return { obj: globalSubrIndexNonCid, endPos: 40 };
            }
            return { obj: charStringsIndexNonCid, endPos: 50 };
        });

        spyOn(parserNonCid, '_parseDictionary').and.returnValue([]);
        spyOn(parserNonCid, '_createDictionary').and.returnValue(topDictNonCid as never);
        spyOn(parserNonCid, '_parseNameIndex').and.returnValue(['FontName']);
        spyOn(parserNonCid, '_parseStringIndex').and.returnValue(stringsNonCid);
        const parsePrivateDictionarySpyNonCid = spyOn(parserNonCid, '_parsePrivateDictionary').and.stub();
        const parseCharSetsSpyNonCid = spyOn(parserNonCid, '_parseCharSets').and.returnValue({ charSet: ['.notdef'] } as never);
        const parseEncodingSpyNonCid = spyOn(parserNonCid, '_parseEncoding').and.returnValue({ encoding: { 65: 0 } } as never);
        const parseCharStringsSpyNonCid = spyOn(parserNonCid, '_parseCharStrings').and.returnValue({
            charStrings: charStringsIndexNonCid,
            standardEncodingChars: ['A'],
            widths: [500]
        } as never);

        // Act
        const nonCidResult: _PdfCompactFormatFont = parserNonCid._parse(propertiesNonCid);

        // Assert
        expect(parsePrivateDictionarySpyNonCid).toHaveBeenCalled();
        expect(parseCharSetsSpyNonCid).toHaveBeenCalled();
        expect(parseEncodingSpyNonCid).toHaveBeenCalled();
        expect(parseCharStringsSpyNonCid).toHaveBeenCalled();

        expect(propertiesNonCid._fontStructure._fontMatrix).toEqual([0.001, 0, 0, 0.001, 0, 0]);
        expect(propertiesNonCid.ascent).toBe(200);
        expect(propertiesNonCid.descent).toBe(-10);
        expect(propertiesNonCid.ascentScaled).toBeTruthy();

        expect(nonCidResult.isCharacterIdentifierFont).toBeFalsy();
        expect(nonCidResult.charStrings).toBe(charStringsIndexNonCid as never);
        expect(nonCidResult.standardEncodingChars).toEqual(['A'] as never);
        expect(nonCidResult.widths).toEqual([500] as never);
    });

    it('should parse the full compact font in CID mode', () => {
        // Arrange
        const parserCid: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, false);

        const stringsCid: _PdfCompactFontStrings = new _PdfCompactFontStrings();

        const nameIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        nameIndexCid.add(new Uint8Array([65]));

        const topDictIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        topDictIndexCid.add(new Uint8Array([1, 2]));

        const stringIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        stringIndexCid.add(new Uint8Array([66]));

        const globalSubrIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        const fdArrayIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        fdArrayIndexCid.add(new Uint8Array([7, 8]));
        const charStringsIndexCid: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStringsIndexCid.add(new Uint8Array([14]));

        const topDictCid: {
            privateDictionary: { subroutineIndex: object };
            _hasName: jasmine.Spy;
            _getByName: jasmine.Spy;
        } = {
            privateDictionary: { subroutineIndex: { marker: 'subrs' } },
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'ROS';
            }),
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): unknown {
                if (name === 'FDArray') {
                    return 200;
                }
                if (name === 'CharStrings') {
                    return 100;
                }
                if (name === 'FDSelect') {
                    return 210;
                }
                if (name === 'charSet') {
                    return 0;
                }
                return undefined;
            })
        };

        const fdTopDictOne: {
            privateDictionary?: object;
        } = {};

        spyOn(parserCid as unknown as { _parseHeader: () => unknown }, '_parseHeader').and.returnValue({ obj: { marker: 'header' }, endPos: 4 } as never);

        let parseIndexCallCountCid: number = 0;
        spyOn(parserCid, '_parseIndex').and.callFake(function (pos: number): { obj: _PdfCompactFontIndex; endPos: number } {
            parseIndexCallCountCid++;
            if (parseIndexCallCountCid === 1) {
                return { obj: nameIndexCid, endPos: 10 };
            }
            if (parseIndexCallCountCid === 2) {
                return { obj: topDictIndexCid, endPos: 20 };
            }
            if (parseIndexCallCountCid === 3) {
                return { obj: stringIndexCid, endPos: 30 };
            }
            if (parseIndexCallCountCid === 4) {
                return { obj: globalSubrIndexCid, endPos: 40 };
            }
            if (pos === 200) {
                return { obj: fdArrayIndexCid, endPos: 45 };
            }
            return { obj: charStringsIndexCid, endPos: 50 };
        });

        let createDictionaryCallCountCid: number = 0;
        spyOn(parserCid, '_parseDictionary').and.returnValue([]);
        spyOn(parserCid, '_createDictionary').and.callFake(function (): unknown {
            createDictionaryCallCountCid++;
            if (createDictionaryCallCountCid === 1) {
                return topDictCid;
            }
            return fdTopDictOne;
        });
        spyOn(parserCid, '_parseNameIndex').and.returnValue(['FontName']);
        spyOn(parserCid, '_parseStringIndex').and.returnValue(stringsCid);
        spyOn(parserCid, '_parsePrivateDictionary').and.callFake(function (dict: Record<string, unknown>): void {
            dict.privateDictionary = { subroutineIndex: { marker: 'fd-subrs' } };
        });
        const parseCharSetsSpyCid = spyOn(parserCid, '_parseCharSets').and.returnValue({ charSet: [0] } as never);
        const parseFontDictionarySelectSpyCid = spyOn(parserCid, '_parseFontDictionarySelect').and.returnValue({ marker: 'fd-select' } as never);
        const parseCharStringsSpyCid = spyOn(parserCid, '_parseCharStrings').and.returnValue({
            charStrings: charStringsIndexCid,
            standardEncodingChars: [] as any,
            widths: [600]
        } as never);

        // Act
        const cidResult: _PdfCompactFormatFont = parserCid._parse({ _fontStructure: {} });

        // Assert
        expect(parseCharSetsSpyCid).toHaveBeenCalled();
        expect(parseFontDictionarySelectSpyCid).toHaveBeenCalled();
        expect(parseCharStringsSpyCid).toHaveBeenCalled();
        expect(cidResult.isCharacterIdentifierFont).toBeTruthy();
        expect(cidResult.fontDictionaryArray.length).toBe(1);
        expect(cidResult.fontDictionarySelect).toEqual({ marker: 'fd-select' } as never);
    });

    it('should create an empty private dictionary helper', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]));
        const parentDictionary: {
            strings: _PdfCompactFontStrings;
            _setByKey: jasmine.Spy;
            privateDictionary?: object;
        } = {
            strings: new _PdfCompactFontStrings(),
            _setByKey: jasmine.createSpy('_setByKey')
        };

        const createDictionarySpy = spyOn(parser, '_createDictionary').and.returnValue({ marker: 'private' } as never);

        // Act
        parser._emptyPrivateDictionary(parentDictionary);

        // Assert
        expect(createDictionarySpy).toHaveBeenCalled();
        expect(parentDictionary._setByKey).toHaveBeenCalledWith(18, [0, 0]);
        expect(parentDictionary.privateDictionary).toEqual({ marker: 'private' } as never);
    });
});

describe('_PdfCompactFont key helper classes strict AAA coverage', () => {
    it('should initialize compact font format and duplicate the first glyph when allowed', () => {
        // Arrange
        const compactFormatFont: _PdfCompactFormatFont = new _PdfCompactFormatFont();
        const charStrings: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStrings.add(new Uint8Array([14]));
        compactFormatFont.charStrings = charStrings as never;
        compactFormatFont.fontDictionarySelect = {
            fontDictionarySelect: [5]
        } as never;
        compactFormatFont.isCharacterIdentifierFont = true;

        // Act
        compactFormatFont._duplicateFirstGlyph();
        const hasGlyphZero: boolean = compactFormatFont._hasGlyphId(0);
        const hasGlyphTwo: boolean = compactFormatFont._hasGlyphId(2);

        // Assert
        expect(compactFormatFont.charStrings.count).toBe(2);
        expect(compactFormatFont.fontDictionarySelect.fontDictionarySelect).toEqual([5, 5]);
        expect(hasGlyphZero).toBeTruthy();
        expect(hasGlyphTwo).toBeFalsy();

        compactFormatFont.charStrings = {
            count: 65535,
            _get: function (): Uint8Array {
                return new Uint8Array([14]);
            },
            add: jasmine.createSpy('add')
        } as never;

        compactFormatFont._duplicateFirstGlyph();
        expect((compactFormatFont.charStrings.add as jasmine.Spy)).not.toHaveBeenCalled();
    });

    it('should initialize header, strings, index, dictionary, charset, encoding, select and tracker helpers', () => {
        // Arrange
        const header: _PdfCompactFontHeader = new _PdfCompactFontHeader(1, 0, 4, 2);

        const strings: _PdfCompactFontStrings = new _PdfCompactFontStrings();
        strings._add('Custom');

        const index: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        index.add(new Uint8Array([1, 2]));
        index.add(new Uint8Array([3]));
        index.set(1, new Uint8Array([4, 5]));

        const privateDictionary: _PdfCompactFontPrivateDictionary = new _PdfCompactFontPrivateDictionary(strings as never);
        const setByKeyNum: boolean = privateDictionary._setByKey(20, [10]);
        const setByKeyArray: boolean = privateDictionary._setByKey(6, [1, 2, 3]);
        const setByKeyNaN: boolean = privateDictionary._setByKey(20, [NaN]);
        const defaultValue: number = privateDictionary._getByName('nominalWidthX');
        privateDictionary._setByName('nominalWidthX', 50);
        const storedValue: number = privateDictionary._getByName('nominalWidthX');
        privateDictionary._removeByName('nominalWidthX');
        const afterRemoveValue: number = privateDictionary._getByName('nominalWidthX');

        const characterSet: _PdfCompactFontCharacterSet = new _PdfCompactFontCharacterSet(true, 0, ['.notdef'], new Uint8Array([0]));
        const encoding: _PdfCompactFontEncoding = new _PdfCompactFontEncoding(false, 1, { 65: 1 }, new Uint8Array([1]));
        const select: _PdfCompactFontSelect = new _PdfCompactFontSelect(0, [2, 3]);
        const tracker: _PdfCompactFontOffsetTracker = new _PdfCompactFontOffsetTracker();

        tracker._track('100', 0);

        const output: {
            data: number[];
            length: number;
        } = {
            data: [0x1d, 0, 0, 0, 0, 0x1d, 0, 0, 0, 0],
            length: 10
        };

        tracker._setEntryLocation('100', [258, 259], output);

        const createdTables = privateDictionary._createTables([
            [20, 'defaultWidthX', 'num', 0],
            [[12, 30], 'ROS', ['sid', 'sid', 'num'], null]
        ]);

        const invalidSetByNameMessage: string = getThrownMessage(function (): void {
            privateDictionary._setByName('InvalidName', 1);
        });

        const invalidGetByNameMessage: string = getThrownMessage(function (): void {
            privateDictionary._getByName('InvalidName');
        });

        const duplicateTrackMessage: string = getThrownMessage(function (): void {
            tracker._track('100', 5);
        });

        const missingTrackMessage: string = getThrownMessage(function (): void {
            tracker._setEntryLocation('200', [1], output);
        });

        const nonEmptyOffsetMessage: string = getThrownMessage(function (): void {
            tracker._setEntryLocation(
                '100',
                [1],
                {
                    data: [0, 1, 2, 3, 4],
                    length: 5
                }
            );
        });

        // Assert
        expect(header.major).toBe(1);
        expect(header.minor).toBe(0);
        expect(header.headerSize).toBe(4);
        expect(header.offSize).toBe(2);

        expect(strings._get(0)).toBe('.notdef');
        expect(strings._get(391)).toBe('Custom');
        expect(strings._get(9999)).toBe('.notdef');
        expect(strings._fetchStringIdentifier('space')).toBeGreaterThanOrEqual(0);
        expect(strings._fetchStringIdentifier('Custom')).toBe(391);
        expect(strings._fetchStringIdentifier('Missing')).toBe(-1);
        expect(strings.count).toBe(1);

        expect(index.count).toBe(2);
        expect(index.length).toBe(4);
        expect(Array.from(index._get(0))).toEqual([1, 2]);
        expect(Array.from(index._get(1))).toEqual([4, 5]);

        expect(setByKeyNum).toBeTruthy();
        expect(setByKeyArray).toBeTruthy();
        expect(setByKeyNaN).toBeTruthy();
        expect(defaultValue).toBe(0);
        expect(storedValue).toBe(0);
        expect(afterRemoveValue).toBe(0);

        expect(characterSet.predefined).toBeTruthy();
        expect(characterSet.format).toBe(0);
        expect(encoding.predefined).toBeFalsy();
        expect(encoding.format).toBe(1);
        expect(select._getFontDictionaryIndex(0)).toBe(2);
        expect(select._getFontDictionaryIndex(10)).toBe(-1);

        expect(tracker._isTracking('100')).toBeTruthy();
        expect(output.data[0]).toBe(0x1d);
        expect(output.data[1]).toBe(0);
        expect(output.data[2]).toBe(0);
        expect(output.data[3]).toBe(1);
        expect(output.data[4]).toBe(2);
        expect(output.data[5]).toBe(0x1d);

        expect(createdTables.keyToNameMap['20']).toBe('defaultWidthX');
        expect(createdTables.nameToKeyMap['ROS']).toBe((12 << 8) + 30);
        expect(createdTables.order.length).toBe(2);

        expect(invalidSetByNameMessage).toBe("Invalid dictionary name 'InvalidName'");
        expect(invalidGetByNameMessage).toBe("Invalid dictionary name InvalidName'");
        expect(duplicateTrackMessage).toBe('Already tracking location of 100');
        expect(missingTrackMessage).toBe('Not tracking location of 200');
        expect(nonEmptyOffsetMessage).toBe('writing to an offset that is not empty');
    });

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
});

describe('_PdfCompactFontCompiler strict AAA coverage', () => {
    function createCompactFontBlueprint(): {
        header: _PdfCompactFontHeader;
        names: string[];
        topDict: Record<string, unknown>;
        strings: _PdfCompactFontStrings & { getSID: (name: string) => number };
        globalSubroutineIndex: _PdfCompactFontIndex;
        encoding: Record<string, unknown>;
        charSet: Record<string, unknown>;
        charStrings: _PdfCompactFontIndex;
        fontDictionaryArray: Record<string, unknown>[];
        fontDictionarySelect: Record<string, unknown>;
        isCharacterIdentifierFont: boolean;
    } {
        const strings = new _PdfCompactFontStrings() as _PdfCompactFontStrings & {
            getSID: (name: string) => number;
        };
        strings._add('Custom');
        strings.getSID = function (name: string): number {
            if (name === 'Custom') {
                return 391;
            }
            return -1;
        };

        const globalSubroutineIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();

        const charStrings: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStrings.add(new Uint8Array([14]));
        charStrings.add(new Uint8Array([]));

        const topDict: Record<string, unknown> = {
            order: [] as any,
            values: Object.create(null),
            opcodes: Object.create(null),
            types: Object.create(null),
            keyToNameMap: Object.create(null),
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'Encoding' || name === 'Private' || name === 'XUID';
            }),
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): unknown {
                if (name === 'Encoding') {
                    return 1;
                }
                if (name === 'Private') {
                    return [0, 0];
                }
                if (name === 'XUID') {
                    return new Array(20).fill(1);
                }
                return undefined;
            }),
            _setByName: jasmine.createSpy('_setByName'),
            _removeByName: jasmine.createSpy('_removeByName'),
            privateDictionary: {
                subroutineIndex: null as any,
                _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
            }
        };

        return {
            header: new _PdfCompactFontHeader(1, 0, 4, 1),
            names: ['Bad/Name'],
            topDict: topDict,
            strings: strings,
            globalSubroutineIndex: globalSubroutineIndex,
            encoding: {
                predefined: false,
                format: 1,
                raw: new Uint8Array([1, 2, 3]),
                encoding: { 65: 1 }
            },
            charSet: {
                charSet: ['.notdef', 'Custom'],
                predefined: false,
                format: 0,
                raw: new Uint8Array([0])
            },
            charStrings: charStrings,
            fontDictionaryArray: [] as any,
            fontDictionarySelect: {
                format: 3,
                fontDictionarySelect: [1, 1, 2]
            },
            isCharacterIdentifierFont: false
        };
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

    it('should compile top-level structures, encode numbers and transform matrices', () => {
        // Arrange
        const compactFontData = createCompactFontBlueprint();
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler(compactFontData as never);

        const compileTopDictionarySpy = spyOn(compiler, '_compileTopDictionary').and.returnValue({
            trackers: [
                {
                    _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
                    _offset: jasmine.createSpy('_offset')
                }
            ],
            output: [1, 2, 3]
        } as never);

        const compileStringIndexSpy = spyOn(compiler, '_compileStringIndex').and.returnValue([4]);
        const compileIndexSpy = spyOn(compiler, '_compileIndex').and.returnValue([5]);
        const compileCharSetSpy = spyOn(compiler, '_compileCharSet').and.returnValue([6]);
        const compileCharStringsSpy = spyOn(compiler, '_compileCharStrings').and.returnValue([7]);
        const compilePrivateDictionarySpy = spyOn(compiler, '_compilePrivateDictionary').and.stub();
        const compileEncodingSpy = spyOn(compiler, '_compileEncoding').and.returnValue([8]);

        // Act
        const compiled: number[] = compiler.compile();

        // Assert
        expect(compileTopDictionarySpy).toHaveBeenCalled();
        expect(compileStringIndexSpy).toHaveBeenCalled();
        expect(compileIndexSpy).toHaveBeenCalled();
        expect(compileCharSetSpy).toHaveBeenCalled();
        expect(compileCharStringsSpy).toHaveBeenCalled();
        expect(compilePrivateDictionarySpy).toHaveBeenCalled();
        expect(compileEncodingSpy).toHaveBeenCalled();
        expect(compiled[compiled.length - 1]).toBe(0);

        expect(compiler._transform([1, 0, 0, 1, 2, 3], [2, 0, 0, 2, 4, 5])).toEqual([2, 0, 0, 2, 6, 8]);

        expect(compiler._encodeInteger(0)).toEqual([139]);
        expect(compiler._encodeInteger(108)).toEqual([247, 0]);
        expect(compiler._encodeInteger(-108)).toEqual([251, 0]);
        expect(compiler._encodeInteger(32768)).toEqual([0x1d, 0, 0, 128, 0]);

        expect(compiler._encodeFloat(1.25)).toEqual([30, 0x1A, 0x25, 0xFF]);
        expect(compiler._encodeNumber(1.25)).toEqual([30, 0x1A, 0x25, 0xFF]);
        expect(compiler._encodeNumber(10)).toEqual([149]);

        expect(compiler._compileHeader(new _PdfCompactFontHeader(1, 0, 6, 2))).toEqual([1, 0, 4, 2]);
        expect(compiler._compileTypedArray(new Uint8Array([1, 2, 3]))).toEqual([1, 2, 3]);
    });

    it('should compile names, indexes, strings, charstrings, charsets, encodings, dictionaries and private dictionaries', () => {
        // Arrange
        const compactFontData = createCompactFontBlueprint();
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler(compactFontData as never);

        const nameIndexResult: number[] = compiler._compileNameIndex(['Bad/Name']);
        const stringIndexResult: number[] = compiler._compileStringIndex(['Custom']);
        const charStringsResult: number[] = compiler._compileCharStrings(compactFontData.charStrings);
        const charSetResult: number[] = compiler._compileCharSet(
            compactFontData.charSet,
            compactFontData.charStrings.count,
            compactFontData.strings,
            false
        );
        const charSetCidResult: number[] = compiler._compileCharSet(
            compactFontData.charSet,
            3,
            compactFontData.strings,
            true
        );
        const encodingResult: number[] = compiler._compileEncoding(compactFontData.encoding);
        const typedArrayResult: number[] = compiler._compileTypedArray(new Uint8Array([1, 2]));
        const fdSelectFormat0Result: number[] = compiler._compileFontDictionarySelect({
            format: 0,
            fontDictionarySelect: [1, 2]
        });
        const fdSelectFormat3Result: number[] = compiler._compileFontDictionarySelect({
            format: 3,
            fontDictionarySelect: [1, 1, 2]
        });

        const indexSmall: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        indexSmall.add(new Uint8Array([1]));
        const indexMedium: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        indexMedium.add(new Uint8Array(300));
        const indexLarge: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        indexLarge.add(new Uint8Array(70000));
        const trackerOne: {
            offset: jasmine.Spy;
        } = {
            offset: jasmine.createSpy('offset')
        };

        const smallIndexResult: number[] = compiler._compileIndex(indexSmall, [trackerOne]);
        const mediumIndexResult: number[] = compiler._compileIndex(indexMedium);
        const largeIndexResult: number[] = compiler._compileIndex(indexLarge);
        const emptyIndexResult: number[] = compiler._compileIndex(new _PdfCompactFontIndex());

        const offsetTrackerMock: {
            isTracking: jasmine.Spy;
            track: jasmine.Spy;
            offset: jasmine.Spy;
            setEntryLocation: jasmine.Spy;
        } = {
            isTracking: jasmine.createSpy('isTracking').and.returnValue(false),
            track: jasmine.createSpy('track'),
            offset: jasmine.createSpy('offset'),
            setEntryLocation: jasmine.createSpy('setEntryLocation')
        };

        const compileDictionaryResult: number[] = compiler._compileDictionary(
            {
                order: [10, 11, 12, 13],
                values: {
                    10: 5,
                    11: 391,
                    12: 100,
                    13: [1, 2, 3]
                },
                types: {
                    10: 'num',
                    11: 'sid',
                    12: 'offset',
                    13: 'array'
                },
                opcodes: {
                    10: [10],
                    11: [11],
                    12: [12],
                    13: [13]
                },
                keyToNameMap: {
                    12: 'OffsetName'
                }
            },
            offsetTrackerMock
        );

        const topDictOne: {
            _removeByName: jasmine.Spy;
        } = {
            _removeByName: jasmine.createSpy('_removeByName')
        };

        spyOn(compiler, '_compileDictionary').and.returnValue([1, 2, 3]);
        spyOn(compiler, '_compileIndex').and.callFake(function (index: _PdfCompactFontIndex): number[] {
            return [index.count];
        });

        const topDictionaryResult: {
            trackers: _PdfCompactFontOffsetTracker[];
            output: number[];
        } = compiler._compileTopDictionary([topDictOne], 10, true);

        const output: {
            data: number[];
            length: number;
            add: (data: number[]) => void;
        } = {
            data: [] as any,
            length: 0,
            add: function (data: number[]): void {
                this.data = this.data.concat(data);
                this.length = this.data.length;
            }
        };

        const validPrivateDictionary: {
            subroutineIndex: null;
            _hasName: jasmine.Spy;
        } = {
            subroutineIndex: null as any,
            _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
        };

        const validFontDict: {
            privateDictionary: object;
            _hasName: jasmine.Spy;
        } = {
            privateDictionary: validPrivateDictionary,
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true)
        };

        const missingPrivateFontDict: {
            privateDictionary: null;
            _hasName: jasmine.Spy;
        } = {
            privateDictionary: null as any,
            _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
        };

        const trackerMock: {
            setEntryLocation: jasmine.Spy;
        } = {
            setEntryLocation: jasmine.createSpy('setEntryLocation')
        };

        compiler._compilePrivateDictionary([validFontDict], [trackerMock], output);

        const unknownTypeMessage: string = getThrownMessage(function (): void {
            compiler._compileDictionary(
                {
                    order: [14],
                    values: { 14: 7 },
                    types: { 14: 'unknown' },
                    opcodes: { 14: [14] },
                    keyToNameMap: {}
                },
                offsetTrackerMock
            );
        });

        const missingPrivateDictionaryMessage: string = getThrownMessage(function (): void {
            compiler._compilePrivateDictionary([missingPrivateFontDict], [trackerMock], output);
        });

        // Assert
        expect(nameIndexResult.length).toBeGreaterThan(0);
        expect(stringIndexResult.length).toBeGreaterThan(0);
        expect(charStringsResult.length).toBeGreaterThan(0);
        expect(charSetResult.length).toBeGreaterThan(0);
        expect(charSetCidResult.length).toBeGreaterThan(0);
        expect(encodingResult).toEqual([1, 2, 3]);
        expect(typedArrayResult).toEqual([1, 2]);
        expect(fdSelectFormat0Result.length).toBeGreaterThan(0);
        expect(fdSelectFormat3Result.length).toBeGreaterThan(0);

        expect(smallIndexResult[2]).toBe(1);
        expect(mediumIndexResult[2]).toBe(2);
        expect(largeIndexResult[2]).toBe(3);
        expect(emptyIndexResult).toEqual([0, 0]);
        expect(trackerOne.offset).toHaveBeenCalled();

        expect(compileDictionaryResult.length).toBeGreaterThan(0);
        expect(offsetTrackerMock.track).toHaveBeenCalledWith('OffsetName', jasmine.any(Number));

        expect(topDictOne._removeByName.calls.count()).toBe(5);
        expect(topDictionaryResult.trackers.length).toBe(1);
        expect(topDictionaryResult.output).toEqual([1]);

        expect(trackerMock.setEntryLocation).toHaveBeenCalled();
        expect(output.data.length).toBeGreaterThan(0);

        expect(unknownTypeMessage).toBe('');
        expect(missingPrivateDictionaryMessage).toBe('There must be a private dictionary.');
    });
});

describe('_PdfCompactFont strict AAA coverage', () => {
    it('should construct, compile or fall back to file, build built-in encoding and map glyphs across branches', () => {
        // Arrange
        const file: { getBytes: () => Uint8Array } = {
            getBytes: function (): Uint8Array {
                return new Uint8Array([1]);
            }
        };

        const properties: {
            _fontStructure: {
                _cMap: {
                    _charCodeOf: ReturnType<typeof jasmine.createSpy>;
                };
                _composite?: boolean;
                _isInternalFont?: boolean;
                _defaultEncoding?: string[];
                _differences?: Record<number, string>;
            };
            _flags?: number;
            _fontFlags?: { Symbolic: number };
            baseEncodingName?: string;
        } = {
            _fontStructure: {
                _cMap: {
                    _charCodeOf: jasmine.createSpy('_charCodeOf').and.callFake(function (value: number): number {
                        return value + 10;
                    })
                }
            },
            _flags: 0,
            _fontFlags: {
                Symbolic: 4
            }
        };

        const compactFontMock: {
            _duplicateFirstGlyph: ReturnType<typeof jasmine.createSpy>;
            standardCharacter: string[];
            charStrings: _PdfCompactFontIndex;
            charSet: { charSet: unknown[] };
            encoding: { encoding: Record<number, number> } | null;
            isCharacterIdentifierFont: boolean;
            fontDictionarySelect: { fontDictionarySelect: number[] };
            hasGlyphId: ReturnType<typeof jasmine.createSpy>;
        } = {
            _duplicateFirstGlyph: jasmine.createSpy('_duplicateFirstGlyph'),
            standardCharacter: ['A'],
            charStrings: new _PdfCompactFontIndex(),
            charSet: { charSet: ['.notdef', 'A', 'B'] },
            encoding: { encoding: { 65: 1, 66: 2 } },
            isCharacterIdentifierFont: false,
            fontDictionarySelect: { fontDictionarySelect: [0] },
            hasGlyphId: jasmine.createSpy('hasGlyphId').and.returnValue(true)
        };

        compactFontMock.charStrings.add(new Uint8Array([14]));
        compactFontMock.charStrings.add(new Uint8Array([14]));
        compactFontMock.charStrings.add(new Uint8Array([14]));

        const parseSpy = spyOn(_PdfCompactFontParser.prototype, '_parse').and.returnValue(compactFontMock as never);
        const compileSpy = spyOn(_PdfCompactFontCompiler.prototype, 'compile').and.returnValue([1, 2, 3] as never);

        spyOn(encodingUtilsModule, '_getEncoding').and.returnValue(['.notdef', 'A', 'B'] as never);
        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ uni0041: 65 } as never);
        spyOn(fontUtilsModule, '_recoverGlyphName').and.returnValue('A');

        // Act
        const compactFont: _PdfCompactFont = new _PdfCompactFont(file, properties);

        const originalCharSet: unknown[] = compactFont.compactFont.charSet.charSet.slice();

        properties._fontStructure._isInternalFont = true;
        properties._fontStructure._defaultEncoding = ['.notdef', 'A', 'B'];
        const internalGlyphMapping: { [key: number]: number } = compactFont._getGlyphMapping();

        properties._fontStructure._isInternalFont = false;
        properties._fontStructure._composite = false;
        properties.baseEncodingName = 'StandardEncoding';
        const baseEncodingGlyphMapping: { [key: number]: number } = compactFont._getGlyphMapping();

        properties.baseEncodingName = undefined;
        properties._flags = 4;
        const symbolicBuiltInEncoding: { [key: number]: number } = {
            70: 2
        };
        const symbolicGlyphMapping: { [key: number]: number } = compactFont._type1FontGlyphMapping(
            properties,
            symbolicBuiltInEncoding,
            ['.notdef', 'A', 'B']
        );

        properties._flags = 0;
        properties._fontStructure._differences = {
            65: 'UnknownGlyph'
        };
        const differencesGlyphMapping: { [key: number]: number } = compactFont._type1FontGlyphMapping(
            properties,
            null as never,
            ['.notdef', 'A', 'B']
        );

        properties._fontStructure._composite = true;
        compactFont.compactFont.isCharacterIdentifierFont = true;
        compactFont.compactFont.charSet = { charSet: [0, 1, 2] } as never;
        const compositeCidGlyphMapping: { [key: number]: number } = compactFont._getGlyphMapping();

        compactFont.compactFont.isCharacterIdentifierFont = false;
        compactFont.compactFont.charSet = { charSet: originalCharSet } as never;
        const compositeSimpleGlyphMapping: { [key: number]: number } = compactFont._getGlyphMapping();

        compactFont.compactFont.encoding = null;
        compactFont._createBuiltInEncoding();

        compileSpy.and.throwError('compile-failed');
        const compactFontFallback: _PdfCompactFont = new _PdfCompactFont(file, properties);

        // Assert
        expect(parseSpy).toHaveBeenCalled();
        expect(compactFontMock._duplicateFirstGlyph).toHaveBeenCalled();
        expect(compileSpy).toHaveBeenCalled();

        expect(compactFont.data).toEqual([1, 2, 3] as never);
        expect(compactFont._glyphCount).toBe(3);
        expect(compactFont._getCharSet()).toEqual(originalCharSet as never);
        expect(compactFont._hasGlyphId(1)).toBeTruthy();

        expect(internalGlyphMapping[1]).toBe(1);
        expect(internalGlyphMapping[2]).toBe(2);

        expect(baseEncodingGlyphMapping[1]).toBe(1);
        expect(baseEncodingGlyphMapping[2]).toBe(2);

        expect(symbolicGlyphMapping[70]).toBe(2);
        expect(differencesGlyphMapping[65]).toBe(1);

        expect(compositeCidGlyphMapping[10]).toBe(0);
        expect(compositeCidGlyphMapping[11]).toBe(1);

        expect(compositeSimpleGlyphMapping[10]).toBe(0);
        expect(compositeSimpleGlyphMapping[11]).toBe(1);

        expect(compactFont._builtInEncoding[65]).toBe('A');
        expect(compactFontFallback.data).toBe(file as never);
    });

    it('should return early from _createBuiltInEncoding when charset or encoding is missing', () => {
        // Arrange
        const compactFont: _PdfCompactFont = Object.create(_PdfCompactFont.prototype) as _PdfCompactFont;
        compactFont.compactFont = {
            charSet: null as any,
            encoding: null
        } as never;

        // Act
        compactFont._createBuiltInEncoding();

        // Assert
        expect(compactFont._builtInEncoding).toBeUndefined();
    });
});

describe('_PdfCompactFontParser _characterValidationData12 stackFn strict AAA coverage', () => {
    function createParserForValidation(): _PdfCompactFontParser {
        return new _PdfCompactFontParser(
            {
                getBytes: function (): Uint8Array {
                    return new Uint8Array([1]);
                }
            },
            {},
            false
        );
    }

    it('should execute add, sub, div, neg and mul stack functions', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParserForValidation();

        const addStack: number[] = [5, 3];
        const subStack: number[] = [5, 3];
        const divStack: number[] = [6, 3];
        const negStack: number[] = [7];
        const mulStack: number[] = [4, 3];

        // Act
        parser._characterValidationData12[10].stackFn(addStack, 2);
        parser._characterValidationData12[11].stackFn(subStack, 2);
        parser._characterValidationData12[12].stackFn(divStack, 2);
        parser._characterValidationData12[14].stackFn(negStack, 1);
        parser._characterValidationData12[24].stackFn(mulStack, 2);

        // Assert
        expect(addStack[0]).toBe(8);
        expect(subStack[0]).toBe(2);
        expect(divStack[0]).toBe(2);
        expect(negStack[0]).toBe(-7);
        expect(mulStack[0]).toBe(12);
    });
});

describe('_PdfCompactFontParser highlighted _parseCharString branches strict AAA coverage', () => {
    function createParserForCharString(): _PdfCompactFontParser {
        return new _PdfCompactFontParser(
            {
                getBytes: function (): Uint8Array {
                    return new Uint8Array([1]);
                }
            },
            {},
            true
        );
    }

    it('should cover hintmask zero-hints copyWithin path and fill remaining bytes with endchar', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParserForCharString();
        const state = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };
        const data: number[] = [19];

        // Act
        const result: boolean = parser._parseCharString(
            state as never,
            data,
            null as never,
            null as never
        );

        // Assert
        expect(result).toBeTruthy();
        expect(data[0]).toBe(14);
    });

    it('should cover subroutine bias 107 valid call and recursive invalid return path', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParserForCharString();
        const originalParseCharString = parser._parseCharString.bind(parser);
        let callCount: number = 0;

        spyOn(parser, '_parseCharString').and.callFake(function (
            state: unknown,
            data: number[],
            localSubroutineIndex: unknown,
            globalSubroutineIndex: unknown
        ): boolean {
            callCount++;
            if (callCount === 1) {
                return originalParseCharString(state as never, data, localSubroutineIndex as never, globalSubroutineIndex as never);
            }
            return false;
        });

        const localSubroutineIndex = {
            count: 10,
            _get: jasmine.createSpy('_get').and.returnValue([11])
        };

        const state = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        // Act
        const result: boolean = parser._parseCharString(
            state as never,
            [32, 10],
            localSubroutineIndex as never,
            null as never
        );

        // Assert
        expect(result).toBeFalsy();
        expect(localSubroutineIndex._get).toHaveBeenCalledWith(0);
    });

    it('should cover subroutine bias 1131 and invalid subroutine number path', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParserForCharString();

        const globalSubroutineIndex = {
            count: 2000,
            _get: jasmine.createSpy('_get')
        };

        const state = {
            callDepth: 0,
            stackSize: 1,
            stack: [1000],
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        // Act
        const result: boolean = parser._parseCharString(
            state as never,
            [29],
            null as never,
            globalSubroutineIndex as never
        );

        // Assert
        expect(result).toBeFalsy();
        expect(globalSubroutineIndex._get).not.toHaveBeenCalled();
    });

    it('should cover value===0 at end of data and value===9 copyWithin path', () => {
        // Arrange
        const parserZero: _PdfCompactFontParser = createParserForCharString();
        const parserNine: _PdfCompactFontParser = createParserForCharString();

        const zeroState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const nineState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const zeroData: number[] = [0];
        const nineData: number[] = [9, 99];

        // Act
        const zeroResult: boolean = parserZero._parseCharString(
            zeroState as never,
            zeroData,
            null as never,
            null as never
        );

        const nineResult: boolean = parserNine._parseCharString(
            nineState as never,
            nineData,
            null as never,
            null as never
        );

        // Assert
        expect(zeroResult).toBeTruthy();
        expect(zeroData[0]).toBe(14);

        expect(nineResult).toBeTruthy();
        expect(nineData[1]).toBe(14);
    });

    it('should cover hasVStems conversion and min stack branch with stackSize zero', () => {
        // Arrange
        const parserHasVStems: _PdfCompactFontParser = createParserForCharString();
        const parserMinBranch: _PdfCompactFontParser = createParserForCharString();

        const hasVStemsState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const minState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: false,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const hasVStemsData: number[] = [139, 139, 3, 139, 139, 1];
        const minData: number[] = [5];

        // Act
        const hasVStemsResult: boolean = parserHasVStems._parseCharString(
            hasVStemsState as never,
            hasVStemsData,
            null as never,
            null as never
        );

        const minResult: boolean = parserMinBranch._parseCharString(
            minState as never,
            minData,
            null as never,
            null as never
        );

        // Assert
        expect(hasVStemsResult).toBeTruthy();
        expect(hasVStemsData[5]).toBe(3);

        expect(minResult).toBeTruthy();
        expect(minData[0]).toBe(14);
    });

    it('should cover stackDelta with stackFn and undefStack reset path', () => {
        // Arrange
        const parserStackFn: _PdfCompactFontParser = createParserForCharString();
        const parserUndefStack: _PdfCompactFontParser = createParserForCharString();

        const stackFnState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const undefStackState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: false,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        // Act
        const stackFnResult: boolean = parserStackFn._parseCharString(
            stackFnState as never,
            [139, 140, 12, 10, 11],
            null as never,
            null as never
        );

        const undefStackResult: boolean = parserUndefStack._parseCharString(
            undefStackState as never,
            [32, 10],
            null as never,
            null as never
        );

        // Assert
        expect(stackFnResult).toBeTruthy();
        expect(undefStackState.undefStack).toBeFalsy();
        expect(undefStackResult).toBeFalsy();
    });
});

describe('_PdfCompactFontCompiler highlighted compile/encode branches strict AAA coverage', () => {
    function createCidCompactFont(predefinedEncoding: boolean): {
        header: _PdfCompactFontHeader;
        names: string[];
        topDict: Record<string, unknown>;
        strings: _PdfCompactFontStrings & { getSID: (name: string) => number };
        globalSubroutineIndex: _PdfCompactFontIndex;
        encoding: Record<string, unknown>;
        charSet: Record<string, unknown>;
        charStrings: _PdfCompactFontIndex;
        fontDictionaryArray: Record<string, unknown>[];
        fontDictionarySelect: Record<string, unknown>;
        isCharacterIdentifierFont: boolean;
    } {
        const strings = new _PdfCompactFontStrings() as _PdfCompactFontStrings & {
            getSID: (name: string) => number;
        };
        strings._add('Custom');
        strings.getSID = function (name: string): number {
            if (name === 'Custom') {
                return 391;
            }
            return -1;
        };

        const globalSubroutineIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();

        const charStrings: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStrings.add(new Uint8Array([14]));
        charStrings.add(new Uint8Array([]));

        const subDictOne = {
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'FontMatrix';
            }),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([2, 0, 0, 2, 4, 5]),
            _setByName: jasmine.createSpy('_setByName')
        };

        const subDictTwo = {
            _hasName: jasmine.createSpy('_hasName').and.returnValue(false),
            _getByName: jasmine.createSpy('_getByName'),
            _setByName: jasmine.createSpy('_setByName')
        };

        const topDict = {
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'FontMatrix' || name === 'Encoding' || name === 'Private';
            }),
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): unknown {
                if (name === 'FontMatrix') {
                    return [1, 0, 0, 1, 2, 3];
                }
                if (name === 'XUID') {
                    return new Array(20).fill(1);
                }
                return undefined;
            }),
            _removeByName: jasmine.createSpy('_removeByName'),
            _setByName: jasmine.createSpy('_setByName'),
            privateDictionary: {
                subroutineIndex: null as any,
                _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
            }
        };

        return {
            header: new _PdfCompactFontHeader(1, 0, 4, 1),
            names: ['Bad/Name'],
            topDict: topDict,
            strings: strings,
            globalSubroutineIndex: globalSubroutineIndex,
            encoding: {
                predefined: predefinedEncoding,
                format: 1,
                raw: new Uint8Array([1, 2, 3]),
                encoding: { 65: 1 }
            },
            charSet: {
                charSet: ['.notdef', 'Custom'],
                predefined: false,
                format: 0,
                raw: new Uint8Array([0])
            },
            charStrings: charStrings,
            fontDictionaryArray: [subDictOne, subDictTwo],
            fontDictionarySelect: {
                format: 3,
                fontDictionarySelect: [1, 1, 2]
            },
            isCharacterIdentifierFont: true
        };
    }

    it('should cover compile catch branch, CID FontMatrix/XUID/predefined Encoding and CID compilation branches', () => {
        // Arrange
        const compactFontData = createCidCompactFont(true);
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler(compactFontData as never);

        let compileTopDictionaryCallCount: number = 0;
        const topTracker = {
            _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
            _offset: jasmine.createSpy('_offset')
        };
        const fontDictTrackers = [
            {
                _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
                _offset: jasmine.createSpy('_offset')
            },
            {
                _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
                _offset: jasmine.createSpy('_offset')
            }
        ];

        spyOn(compiler, '_compileTopDictionary').and.callFake(function (): { trackers: unknown[]; output: number[] } {
            compileTopDictionaryCallCount++;
            if (compileTopDictionaryCallCount === 1) {
                return {
                    trackers: [topTracker],
                    output: [1, 2, 3]
                };
            }
            return {
                trackers: fontDictTrackers,
                output: [4, 5, 6]
            };
        });

        spyOn(compiler, '_compileStringIndex').and.returnValue([7]);
        spyOn(compiler, '_compileIndex').and.returnValue([8]);
        spyOn(compiler, '_compileCharSet').and.returnValue([9]);
        spyOn(compiler, '_compileCharStrings').and.returnValue([10]);
        spyOn(compiler, '_compileFontDictionarySelect').and.returnValue([11]);
        const compilePrivateDictionarySpy = spyOn(compiler, '_compilePrivateDictionary').and.stub();
        const compileEncodingSpy = spyOn(compiler, '_compileEncoding').and.returnValue([12]);

        const originalPush = Array.prototype.push;
        let throwOnce: boolean = true;
        (Array.prototype.push as unknown as (...items: number[]) => number) = function (...items: number[]): number {
            if (throwOnce) {
                throwOnce = false;
                throw new Error('force-push-failure');
            }
            return originalPush.apply(this, items);
        };

        let result: number[] | undefined;

        // Act
        try {
            result = compiler.compile();
        } finally {
            Array.prototype.push = originalPush;
        }

        // Assert
        expect(compactFontData.topDict._removeByName).toHaveBeenCalledWith('FontMatrix');
        expect(compactFontData.topDict._removeByName).toHaveBeenCalledWith('XUID');
        expect(compactFontData.topDict._setByName).toHaveBeenCalledWith('charSet', 0);

        expect((compactFontData.fontDictionaryArray[0] as { _setByName: ReturnType<typeof jasmine.createSpy> })._setByName).toHaveBeenCalledWith(
            'FontMatrix',
            [2, 0, 0, 2, 6, 8]
        );

        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('Encoding', [1], jasmine.any(Object));
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('charSet', jasmine.any(Array), jasmine.any(Object));
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('CharStrings', jasmine.any(Array), jasmine.any(Object));
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('FDSelect', jasmine.any(Array), jasmine.any(Object));
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('FDArray', jasmine.any(Array), jasmine.any(Object));

        expect(compilePrivateDictionarySpy.calls.count()).toBe(2);
        expect(compileEncodingSpy).not.toHaveBeenCalled();

        expect(result).toBeDefined();
        expect(result![result!.length - 1]).toBe(0);
    });

    it('should cover non-predefined encoding branch in compile and encodeFloat highlighted branches', () => {
        // Arrange
        const compactFontData = createCidCompactFont(false);
        compactFontData.isCharacterIdentifierFont = false;

        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler(compactFontData as never);

        const topTracker = {
            _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
            _offset: jasmine.createSpy('_offset')
        };

        spyOn(compiler, '_compileTopDictionary').and.returnValue({
            trackers: [topTracker],
            output: [1, 2, 3]
        } as never);
        spyOn(compiler, '_compileStringIndex').and.returnValue([4]);
        spyOn(compiler, '_compileIndex').and.returnValue([5]);
        spyOn(compiler, '_compileCharSet').and.returnValue([6]);
        spyOn(compiler, '_compileCharStrings').and.returnValue([7]);
        const compilePrivateDictionarySpy = spyOn(compiler, '_compilePrivateDictionary').and.stub();
        const compileEncodingSpy = spyOn(compiler, '_compileEncoding').and.returnValue([8]);

        const regexFloatInput = {
            valueOf: function (): number {
                return 1.23;
            },
            toString: function (): string {
                return '1.230000000000000000000';
            }
        } as unknown as number;

        const exponentFloatInput = {
            valueOf: function (): number {
                return -1.25e-7;
            },
            toString: function (): string {
                return '-1.25e-7';
            }
        } as unknown as number;

        // Act
        const compileResult: number[] = compiler.compile();
        const regexFloatResult: number[] = compiler._encodeFloat(regexFloatInput);
        const exponentFloatResult: number[] = compiler._encodeFloat(exponentFloatInput);

        // Assert
        expect(compileEncodingSpy).toHaveBeenCalled();
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('Encoding', jasmine.any(Array), jasmine.any(Object));
        expect(compilePrivateDictionarySpy).toHaveBeenCalled();

        expect(compileResult[compileResult.length - 1]).toBe(0);
        expect(regexFloatResult[0]).toBe(30);
        expect(exponentFloatResult[0]).toBe(30);
    });
});
``

describe('Remaining highlighted compact-font coverage strict AAA', () => {
    function createFile(bytes: Uint8Array): { getBytes: () => Uint8Array } {
        return {
            getBytes: function (): Uint8Array {
                return bytes;
            }
        };
    }

    function createParser(bytes: Uint8Array, properties?: object, isAnalysisEnabled?: boolean): _PdfCompactFontParser {
        return new _PdfCompactFontParser(
            createFile(bytes),
            properties ? properties : {},
            typeof isAnalysisEnabled === 'boolean' ? isAnalysisEnabled : false
        );
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

    it('should cover _PdfCompactFontOffsetTracker._offset for multiple tracked keys', () => {
        // Arrange
        const tracker: _PdfCompactFontOffsetTracker = new _PdfCompactFontOffsetTracker();
        tracker._track('100', 2);
        tracker._track('200', 5);

        // Act
        tracker._offset(3);

        // Assert
        expect(tracker.offsets[100]).toBe(5);
        expect(tracker.offsets[200]).toBe(8);
    });
    it('should cover _compileDictionary key-missing, non-array type/value, empty values and offsetTracker tracking paths', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        const offsetTracker = {
            isTracking: jasmine.createSpy('isTracking').and.returnValues(false, true),
            track: jasmine.createSpy('track')
        };

        const dictionary = {
            order: [1, 2, 3, 4],
            values: {
                2: 5,
                3: 100,
                4: [] as any
            },
            types: {
                2: 'num',
                3: 'offset',
                4: 'array'
            },
            opcodes: {
                2: [2],
                3: [3],
                4: [4]
            },
            keyToNameMap: {
                3: 'OffsetName'
            }
        };

        // Act
        const result: number[] = compiler._compileDictionary(dictionary as never, offsetTracker as never);

        // Assert
        expect(offsetTracker.track).toHaveBeenCalledWith('OffsetName', jasmine.any(Number));
        expect(result.length).toBeGreaterThan(0);
    });

    it('should cover _parseCharString early return, q===0 path, value===28 path and stackSize nonzero min-failure path', () => {
        // Arrange
        const parserOne: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserTwo: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserThree: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserFour: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        const stateEarly = {
            callDepth: 1001,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateQZero = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateValue28 = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stateMinFail = {
            callDepth: 0,
            stackSize: 1,
            stack: [10],
            undefStack: false,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const qZeroData: number[] = [12, 0, 11];
        const value28Data: number[] = [28, 0, 5, 11];
        const minFailData: number[] = [4];

        // Act
        const earlyResult: boolean = parserOne._parseCharString(
            stateEarly as never,
            null as never,
            null as never,
            null as never
        );

        const qZeroResult: boolean = parserTwo._parseCharString(
            stateQZero as never,
            qZeroData,
            null as never,
            null as never
        );

        const value28Result: boolean = parserThree._parseCharString(
            stateValue28 as never,
            value28Data,
            null as never,
            null as never
        );

        const minFailResult: boolean = parserFour._parseCharString(
            stateMinFail as never,
            minFailData,
            null as never,
            null as never
        );

        // Assert
        expect(earlyResult).toBeFalsy();

        expect(qZeroResult).toBeTruthy();
        expect(qZeroData[0]).toBe(139);
        expect(qZeroData[1]).toBe(22);

        expect(value28Result).toBeTruthy();
        expect(stateValue28.stackSize).toBe(1);
        expect(stateValue28.stack[0]).toBe(5);

        expect(minFailResult).toBeTruthy();
    });

});


describe('Remaining highlighted compact-font coverage strict AAA', () => {
    function createFile(bytes: Uint8Array): { getBytes: () => Uint8Array } {
        return {
            getBytes: function (): Uint8Array {
                return bytes;
            }
        };
    }

    function createParser(bytes: Uint8Array, properties?: object, isAnalysisEnabled?: boolean): _PdfCompactFontParser {
        return new _PdfCompactFontParser(
            createFile(bytes),
            properties ? properties : {},
            typeof isAnalysisEnabled === 'boolean' ? isAnalysisEnabled : false
        );
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

    it('should cover _PdfCompactFontOffsetTracker._offset for multiple tracked keys', () => {
        // Arrange
        const tracker: _PdfCompactFontOffsetTracker = new _PdfCompactFontOffsetTracker();
        tracker._track('100', 2);
        tracker._track('200', 5);

        // Act
        tracker._offset(3);

        // Assert
        expect(tracker.offsets[100]).toBe(5);
        expect(tracker.offsets[200]).toBe(8);
    });

    it('should cover _compilePrivateDictionary empty-data branch and Subrs branch', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        const outputEmpty: {
            data: number[];
            length: number;
            add: (data: number[]) => void;
        } = {
            data: [],
            length: 7,
            add: function (data: number[]): void {
                this.data = this.data.concat(data);
                this.length = this.data.length;
            }
        };

        const trackerEmpty = {
            setEntryLocation: jasmine.createSpy('setEntryLocation')
        };

        const privateDictionaryEmpty = {
            subroutineIndex: null as never,
            _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
        };

        const fontDictEmpty = {
            privateDictionary: privateDictionaryEmpty,
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true)
        };

        const outputSubrs: {
            data: number[];
            length: number;
            add: (data: number[]) => void;
        } = {
            data: [],
            length: 0,
            add: function (data: number[]): void {
                this.data = this.data.concat(data);
                this.length = this.data.length;
            }
        };

        const trackerSubrs = {
            setEntryLocation: jasmine.createSpy('setEntryLocation')
        };

        const subroutineIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        subroutineIndex.add(new Uint8Array([1, 2]));

        const privateDictionaryWithSubrs = {
            subroutineIndex: subroutineIndex,
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'Subrs';
            })
        };

        const fontDictWithSubrs = {
            privateDictionary: privateDictionaryWithSubrs,
            _hasName: jasmine.createSpy('_hasName').and.returnValue(true)
        };

        const compileDictionarySpy = spyOn(compiler, '_compileDictionary').and.callFake(function (
            privateDictionary: unknown
        ): number[] {
            if (privateDictionary === privateDictionaryEmpty) {
                return [];
            }
            return [10, 20, 30];
        });

        const compileIndexSpySubrs = spyOn(compiler, '_compileIndex').and.returnValue([40, 50]);
        const privateTrackerSetEntryLocationSpy = spyOn(_PdfCompactFontOffsetTracker.prototype, '_setEntryLocation').and.stub();

        // Act
        compiler._compilePrivateDictionary([fontDictEmpty], [trackerEmpty], outputEmpty);
        compiler._compilePrivateDictionary([fontDictWithSubrs], [trackerSubrs], outputSubrs);

        // Assert
        expect(compileDictionarySpy).toHaveBeenCalled();
        expect(trackerEmpty.setEntryLocation).toHaveBeenCalledWith('Private', [0, 0], outputEmpty);

        expect(trackerSubrs.setEntryLocation).toHaveBeenCalledWith('Private', [3, 0], outputSubrs);
        expect(compileIndexSpySubrs).toHaveBeenCalledWith(subroutineIndex);
        expect(privateTrackerSetEntryLocationSpy).toHaveBeenCalledWith('Subrs', [3], outputSubrs);
    });

    it('should cover _compileDictionary key-missing, non-array type/value, empty values and offset-tracking paths', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        const offsetTracker = {
            isTracking: jasmine.createSpy('isTracking').and.returnValues(false, true),
            track: jasmine.createSpy('track')
        };

        const dictionary = {
            order: [1, 2, 3, 4],
            values: {
                2: 5,
                3: 100,
                4: [] as any
            },
            types: {
                2: 'num',
                3: 'offset',
                4: 'array'
            },
            opcodes: {
                2: [2],
                3: [3],
                4: [4]
            },
            keyToNameMap: {
                3: 'OffsetName'
            }
        };

        // Act
        const result: number[] = compiler._compileDictionary(dictionary as never, offsetTracker as never);

        // Assert
        expect(offsetTracker.track).toHaveBeenCalledWith('OffsetName', jasmine.any(Number));
        expect(result.length).toBeGreaterThan(0);
    });

    it('should cover compile output.add catch branch, CID FontMatrix propagation, XUID removal, predefined and non-predefined Encoding, FDSelect and FDArray branches', () => {
        // Arrange
        const strings = new _PdfCompactFontStrings() as _PdfCompactFontStrings & {
            getSID: (name: string) => number;
        };
        strings._add('Custom');
        strings.getSID = function (name: string): number {
            if (name === 'Custom') {
                return 391;
            }
            return -1;
        };

        const charStrings: _PdfCompactFontIndex = new _PdfCompactFontIndex();
        charStrings.add(new Uint8Array([14]));
        charStrings.add(new Uint8Array([]));

        const subDictOne = {
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'FontMatrix';
            }),
            _getByName: jasmine.createSpy('_getByName').and.returnValue([2, 0, 0, 2, 4, 5]),
            _setByName: jasmine.createSpy('_setByName')
        };

        const subDictTwo = {
            _hasName: jasmine.createSpy('_hasName').and.returnValue(false),
            _getByName: jasmine.createSpy('_getByName'),
            _setByName: jasmine.createSpy('_setByName')
        };

        const topDict = {
            _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
                return name === 'FontMatrix' || name === 'Encoding' || name === 'Private';
            }),
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): unknown {
                if (name === 'FontMatrix') {
                    return [1, 0, 0, 1, 2, 3];
                }
                if (name === 'XUID') {
                    return new Array(20).fill(1);
                }
                return undefined;
            }),
            _removeByName: jasmine.createSpy('_removeByName'),
            _setByName: jasmine.createSpy('_setByName'),
            privateDictionary: {
                subroutineIndex: null as never,
                _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
            }
        };

        const compactFontData = {
            header: new _PdfCompactFontHeader(1, 0, 4, 1),
            names: ['Bad/Name'],
            topDict: topDict,
            strings: strings,
            globalSubroutineIndex: new _PdfCompactFontIndex(),
            encoding: {
                predefined: true,
                format: 1,
                raw: new Uint8Array([1, 2, 3]),
                encoding: { 65: 1 }
            },
            charSet: {
                charSet: ['.notdef', 'Custom'],
                predefined: false,
                format: 0,
                raw: new Uint8Array([0])
            },
            charStrings: charStrings,
            fontDictionaryArray: [subDictOne, subDictTwo],
            fontDictionarySelect: {
                format: 3,
                fontDictionarySelect: [1, 1, 2]
            },
            isCharacterIdentifierFont: true
        };

        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler(compactFontData as never);

        let compileTopDictionaryCallCount: number = 0;
        const topTracker = {
            _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
            _offset: jasmine.createSpy('_offset')
        };
        const fontDictTrackers = [
            {
                _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
                _offset: jasmine.createSpy('_offset')
            },
            {
                _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
                _offset: jasmine.createSpy('_offset')
            }
        ];

        spyOn(compiler, '_compileTopDictionary').and.callFake(function (): { trackers: unknown[]; output: number[] } {
            compileTopDictionaryCallCount++;
            if (compileTopDictionaryCallCount === 1) {
                return {
                    trackers: [topTracker],
                    output: [1, 2, 3]
                };
            }
            return {
                trackers: fontDictTrackers,
                output: [4, 5, 6]
            };
        });

        spyOn(compiler, '_compileStringIndex').and.returnValue([7]);
        spyOn(compiler, '_compileIndex').and.returnValue([8]);
        spyOn(compiler, '_compileCharSet').and.returnValue([9]);
        spyOn(compiler, '_compileCharStrings').and.returnValue([10]);
        spyOn(compiler, '_compileFontDictionarySelect').and.returnValue([11]);
        const compilePrivateDictionarySpy = spyOn(compiler, '_compilePrivateDictionary').and.stub();
        const compileEncodingSpy = spyOn(compiler, '_compileEncoding').and.returnValue([12]);

        const originalPush = Array.prototype.push;
        let throwOnce: boolean = true;
        (Array.prototype.push as unknown as (...items: number[]) => number) = function (...items: number[]): number {
            if (throwOnce) {
                throwOnce = false;
                throw new Error('force-push-failure');
            }
            return originalPush.apply(this, items);
        };

        let predefinedResult: number[] = [];

        try {
            // Act
            predefinedResult = compiler.compile();
        } finally {
            Array.prototype.push = originalPush;
        }

        compactFontData.encoding.predefined = false;
        const nonPredefinedCompiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler(compactFontData as never);

        const nonPredefinedTopTracker = {
            _setEntryLocation: jasmine.createSpy('_setEntryLocation'),
            _offset: jasmine.createSpy('_offset')
        };

        spyOn(nonPredefinedCompiler, '_compileTopDictionary').and.returnValue({
            trackers: [nonPredefinedTopTracker],
            output: [1, 2, 3]
        } as never);
        spyOn(nonPredefinedCompiler, '_compileStringIndex').and.returnValue([4]);
        spyOn(nonPredefinedCompiler, '_compileIndex').and.returnValue([5]);
        spyOn(nonPredefinedCompiler, '_compileCharSet').and.returnValue([6]);
        spyOn(nonPredefinedCompiler, '_compileCharStrings').and.returnValue([7]);
        spyOn(nonPredefinedCompiler, '_compilePrivateDictionary').and.stub();
        const nonPredefinedCompileEncodingSpy = spyOn(nonPredefinedCompiler, '_compileEncoding').and.returnValue([8]);

        // Act
        const nonPredefinedResult: number[] = nonPredefinedCompiler.compile();

        // Assert
        expect(topDict._removeByName).toHaveBeenCalledWith('FontMatrix');
        expect(topDict._removeByName).toHaveBeenCalledWith('XUID');
        expect(topDict._setByName).toHaveBeenCalledWith('charSet', 0);

        expect(subDictOne._setByName).toHaveBeenCalledWith('FontMatrix', [2, 0, 0, 2, 6, 8]);

        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('Encoding', [1], jasmine.any(Object));
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('charSet', jasmine.any(Array), jasmine.any(Object));
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('CharStrings', jasmine.any(Array), jasmine.any(Object));
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('FDSelect', jasmine.any(Array), jasmine.any(Object));
        expect(topTracker._setEntryLocation).toHaveBeenCalledWith('FDArray', jasmine.any(Array), jasmine.any(Object));

        expect(compilePrivateDictionarySpy.calls.count()).toBe(2);
        expect(compileEncodingSpy).not.toHaveBeenCalled();
        expect(predefinedResult[predefinedResult.length - 1]).toBe(0);

        expect(nonPredefinedCompileEncodingSpy).toHaveBeenCalled();
        expect(nonPredefinedTopTracker._setEntryLocation).toHaveBeenCalledWith('Encoding', jasmine.any(Array), jasmine.any(Object));
        expect(nonPredefinedResult[nonPredefinedResult.length - 1]).toBe(0);
    });

    it('should cover _encodeFloat regex branch, exponent branch, _compileNameIndex empty sanitized name, and _compileTopDictionary removeCidKeys', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        const regexFloatInput = {
            valueOf: function (): number {
                return 1.23;
            },
            toString: function (): string {
                return '1.230000000000000000000';
            }
        } as unknown as number;

        const exponentFloatInput = {
            valueOf: function (): number {
                return -1.25e-7;
            },
            toString: function (): string {
                return '-1.25e-7';
            }
        } as unknown as number;

        const compileIndexSpy = spyOn(compiler, '_compileIndex').and.callFake(function (index: _PdfCompactFontIndex): number[] {
            return [index.count];
        });
        spyOn(compiler, '_compileDictionary').and.returnValue([1, 2, 3]);

        const fontDict = {
            _removeByName: jasmine.createSpy('_removeByName')
        };

        // Act
        const regexFloatResult: number[] = compiler._encodeFloat(regexFloatInput);
        const exponentFloatResult: number[] = compiler._encodeFloat(exponentFloatInput);
        const nameIndexResult: number[] = compiler._compileNameIndex(['']);
        const topDictionaryResult: { trackers: _PdfCompactFontOffsetTracker[]; output: number[] } = compiler._compileTopDictionary([fontDict], 10, true);

        // Assert
        expect(regexFloatResult[0]).toBe(30);
        expect(exponentFloatResult[0]).toBe(30);

        expect(nameIndexResult).toEqual([1]);
        expect(compileIndexSpy).toHaveBeenCalled();

        expect(fontDict._removeByName.calls.count()).toBe(5);
        expect(topDictionaryResult.trackers.length).toBe(1);
        expect(topDictionaryResult.output).toEqual([1]);
    });

    it('should cover _parse and _parseCharStrings highlighted dictionary-select branches and localSubroutineIndex fallback', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, false);

        const charStrings = {
            count: 3,
            _get: jasmine.createSpy('_get').and.returnValues(
                new Uint8Array([14]),
                new Uint8Array([14]),
                new Uint8Array([14])
            ),
            set: jasmine.createSpy('set')
        };

        const fallbackPrivateDictionary = {
            _getByName: jasmine.createSpy('_getByName').and.callFake(function (name: string): number {
                if (name === 'nominalWidthX') {
                    return 100;
                }
                if (name === 'defaultWidthX') {
                    return 50;
                }
                return 0;
            }),
            subroutineIndex: { marker: 'fallback-subrs' }
        };

        const fontDictionaryArray: Array<{ privateDictionary: typeof fallbackPrivateDictionary }> = [
            { privateDictionary: fallbackPrivateDictionary }
        ];

        const fontDictionarySelect = {
            getFDIndex: jasmine.createSpy('getFDIndex').and.returnValues(-1, 10, 0)
        };

        // IMPORTANT FIX:
        // _parseCharString is called only for the 3rd glyph here,
        // because the first two glyphs become invalid before parse execution.
        spyOn(parser, '_parseCharString').and.callFake(function (
            state: { width: number | null; standardCharacter: number[] | null },
            charstring: Uint8Array,
            localSubrToUse: unknown
        ): boolean {
            state.width = 25;
            state.standardCharacter = [7, 8];
            expect(localSubrToUse).toBe(fallbackPrivateDictionary.subroutineIndex as never);
            return true;
        });

        // Act
        const resultWithFontDictionarySelect = parser._parseCharStrings(
            charStrings as any,
            null,
            { marker: 'global-subrs' } as any,
            fontDictionarySelect as any,
            fontDictionaryArray as any,
            fallbackPrivateDictionary as any
        ) as {
            charStrings: unknown;
            this: number[][];
            widths: number[];
        };

        const parserFallbackLocalSubr: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, false);

        const charStringsFallback = {
            count: 1,
            _get: jasmine.createSpy('_get').and.returnValue(new Uint8Array([14])),
            set: jasmine.createSpy('set')
        };

        const fallbackLocalSubroutineIndex = { marker: 'local-subrs' };

        spyOn(parserFallbackLocalSubr, '_parseCharString').and.callFake(function (
            state: { width: number | null; standardCharacter: number[] | null },
            charstring: Uint8Array,
            localSubrToUse: unknown
        ): boolean {
            state.width = 5;
            state.standardCharacter = [9];
            expect(localSubrToUse).toBe(fallbackLocalSubroutineIndex as never);
            return true;
        });

        const resultWithLocalSubrFallback = parserFallbackLocalSubr._parseCharStrings(
            charStringsFallback as any,
            fallbackLocalSubroutineIndex,
            { marker: 'global-subrs' } as any,
            null,
            [],
            fallbackPrivateDictionary as any
        ) as {
            charStrings: unknown;
            this: number[][];
            widths: number[];
        };

        // Assert
        expect(charStrings.set).toHaveBeenCalledWith(0, new Uint8Array([14]));
        expect(charStrings.set).toHaveBeenCalledWith(1, new Uint8Array([14]));

        expect(resultWithFontDictionarySelect.widths[2]).toBe(125);
        expect(resultWithFontDictionarySelect.this[2]).toEqual([7, 8]);

        expect(resultWithLocalSubrFallback.widths[0]).toBe(105);
        expect(resultWithLocalSubrFallback.this[0]).toEqual([9]);
    });

    it('should cover remaining _parseCharString highlighted branches', () => {
        // Arrange
        const parserEarly: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserQZero: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserValue28: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserValueZeroEnd: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserValueNine: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserHasVStems: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserMinZero: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserMinNonZero: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserStackFn: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserResetStack: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserHintMaskEmpty: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        const earlyState = {
            callDepth: 1001,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const qZeroState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const value28State = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const zeroEndState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const nineState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const hasVStemsState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const minZeroState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: false,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const minNonZeroState = {
            callDepth: 0,
            stackSize: 1,
            stack: [10],
            undefStack: false,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const stackFnState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const resetStackState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const hintMaskState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as any,
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as any,
            width: null as any,
            hasVStems: false
        };

        const qZeroData: number[] = [12, 0, 11];
        const value28Data: number[] = [28, 0, 5, 11];
        const zeroEndData: number[] = [0];
        const nineData: number[] = [9, 99];
        const hasVStemsData: number[] = [139, 139, 3, 139, 139, 18];
        const minZeroData: number[] = [4];
        const minNonZeroData: number[] = [5]; // FIXED: min 2 opcode to hit return false branch
        const stackFnData: number[] = [139, 140, 12, 10, 11];
        const resetStackData: number[] = [139, 139, 5];
        const hintMaskData: number[] = [19];

        // Act
        const earlyResult: boolean = parserEarly._parseCharString(
            earlyState as never,
            null as never,
            null as never,
            null as never
        );

        const qZeroResult: boolean = parserQZero._parseCharString(
            qZeroState as never,
            qZeroData,
            null as never,
            null as never
        );

        const value28Result: boolean = parserValue28._parseCharString(
            value28State as never,
            value28Data,
            null as never,
            null as never
        );

        const zeroEndResult: boolean = parserValueZeroEnd._parseCharString(
            zeroEndState as never,
            zeroEndData,
            null as never,
            null as never
        );

        const nineResult: boolean = parserValueNine._parseCharString(
            nineState as never,
            nineData,
            null as never,
            null as never
        );

        const hasVStemsResult: boolean = parserHasVStems._parseCharString(
            hasVStemsState as never,
            hasVStemsData,
            null as never,
            null as never
        );

        const minZeroResult: boolean = parserMinZero._parseCharString(
            minZeroState as never,
            minZeroData,
            null as never,
            null as never
        );

        const minNonZeroResult: boolean = parserMinNonZero._parseCharString(
            minNonZeroState as never,
            minNonZeroData,
            null as never,
            null as never
        );

        const stackFnResult: boolean = parserStackFn._parseCharString(
            stackFnState as never,
            stackFnData,
            null as never,
            null as never
        );

        const resetStackResult: boolean = parserResetStack._parseCharString(
            resetStackState as never,
            resetStackData,
            null as never,
            null as never
        );

        const hintMaskResult: boolean = parserHintMaskEmpty._parseCharString(
            hintMaskState as never,
            hintMaskData,
            null as never,
            null as never
        );

        // Assert
        expect(earlyResult).toBeFalsy();

        expect(qZeroResult).toBeTruthy();
        expect(qZeroData[0]).toBe(139);
        expect(qZeroData[1]).toBe(22);

        expect(value28Result).toBeTruthy();
        expect(value28State.stackSize).toBe(1);
        expect(value28State.stack[0]).toBe(5);

        expect(zeroEndResult).toBeTruthy();
        expect(zeroEndData[0]).toBe(14);

        expect(nineResult).toBeTruthy();
        expect(nineData[1]).toBe(14);

        expect(hasVStemsResult).toBeTruthy();
        expect(hasVStemsData[5]).toBe(23);

        expect(minZeroResult).toBeTruthy();
        expect(minZeroData[0]).toBe(14);

        expect(minNonZeroResult).toBeFalsy();

        expect(stackFnResult).toBeTruthy();
        expect(resetStackResult).toBeTruthy();
        expect(resetStackState.undefStack).toBeFalsy();

        expect(hintMaskResult).toBeTruthy();
        expect(hintMaskData[0]).toBe(14);
    });
});
it('should cover _compilePrivateDictionary empty-data branch and Subrs branch', () => {
    // Arrange
    const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

    const outputEmpty: {
        data: number[];
        length: number;
        add: (data: number[]) => void;
    } = {
        data: [],
        length: 7,
        add: function (data: number[]): void {
            this.data = this.data.concat(data);
            this.length = this.data.length;
        }
    };

    const trackerEmpty = {
        setEntryLocation: jasmine.createSpy('setEntryLocation')
    };

    const privateDictionaryEmpty = {
        subroutineIndex: null as never,
        _hasName: jasmine.createSpy('_hasName').and.returnValue(false)
    };

    const fontDictEmpty = {
        privateDictionary: privateDictionaryEmpty,
        _hasName: jasmine.createSpy('_hasName').and.returnValue(true)
    };

    const outputSubrs: {
        data: number[];
        length: number;
        add: (data: number[]) => void;
    } = {
        data: [],
        length: 0,
        add: function (data: number[]): void {
            this.data = this.data.concat(data);
            this.length = this.data.length;
        }
    };

    const trackerSubrs = {
        setEntryLocation: jasmine.createSpy('setEntryLocation')
    };

    const subroutineIndex: _PdfCompactFontIndex = new _PdfCompactFontIndex();
    subroutineIndex.add(new Uint8Array([1, 2]));

    const privateDictionaryWithSubrs = {
        subroutineIndex: subroutineIndex,
        _hasName: jasmine.createSpy('_hasName').and.callFake(function (name: string): boolean {
            return name === 'Subrs';
        })
    };

    const fontDictWithSubrs = {
        privateDictionary: privateDictionaryWithSubrs,
        _hasName: jasmine.createSpy('_hasName').and.returnValue(true)
    };

    const compileDictionarySpy = spyOn(compiler, '_compileDictionary').and.callFake(function (
        privateDictionary: unknown
    ): number[] {
        if (privateDictionary === privateDictionaryEmpty) {
            return [];
        }
        return [10, 20, 30];
    });

    const compileIndexSpySubrs = spyOn(compiler, '_compileIndex').and.returnValue([40, 50]);
    const privateTrackerSetEntryLocationSpy = spyOn(_PdfCompactFontOffsetTracker.prototype, '_setEntryLocation').and.stub();

    // Act
    compiler._compilePrivateDictionary([fontDictEmpty], [trackerEmpty], outputEmpty);
    compiler._compilePrivateDictionary([fontDictWithSubrs], [trackerSubrs], outputSubrs);

    // Assert
    expect(compileDictionarySpy).toHaveBeenCalled();
    expect(trackerEmpty.setEntryLocation).toHaveBeenCalledWith('Private', [0, 0], outputEmpty);

    expect(trackerSubrs.setEntryLocation).toHaveBeenCalledWith('Private', [3, 0], outputSubrs);
    expect(compileIndexSpySubrs).toHaveBeenCalledWith(subroutineIndex);
    expect(privateTrackerSetEntryLocationSpy).toHaveBeenCalledWith('Subrs', [3], outputSubrs);
});

describe('Additional highlighted compact-font coverage strict AAA', () => {
    function createFile(bytes: Uint8Array): { getBytes: () => Uint8Array } {
        return {
            getBytes: function (): Uint8Array {
                return bytes;
            }
        };
    }

    function createParser(bytes: Uint8Array, properties?: object, isAnalysisEnabled?: boolean): _PdfCompactFontParser {
        return new _PdfCompactFontParser(
            createFile(bytes),
            properties ? properties : {},
            typeof isAnalysisEnabled === 'boolean' ? isAnalysisEnabled : false
        );
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

    it('should cover _setByKey value.length === 0 branch safely', () => {
        // Arrange
        const strings: _PdfCompactFontStrings = new _PdfCompactFontStrings();
        const dictionary: _PdfCompactFontPrivateDictionary =
            new _PdfCompactFontPrivateDictionary(strings as unknown as string);

        // Act
        const result: boolean = dictionary._setByKey(20, []);

        // Assert
        expect(result).toBeTruthy();
        expect(dictionary._getByName('defaultWidthX')).toBe(0);
    });

    it('should cover _PdfCompactFontTopDictionary._tables getter', () => {
        // Arrange

        // Act
        const tables: {
            keyToNameMap: Record<string, string>;
            nameToKeyMap: Record<string, number>;
            defaults: Record<string, unknown>;
            types: Record<string, unknown>;
            opcodes: Record<string, number[]>;
            order: number[];
        } = _PdfCompactFontTopDictionary._tables;

        // Assert
        expect(tables.keyToNameMap['17']).toBe('CharStrings');
        expect(tables.nameToKeyMap['FontMatrix']).toBe((12 << 8) + 7);
        expect(tables.order.length).toBeGreaterThan(0);
    });

    it('should cover _encodeInteger 16-bit branch', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        // Act
        const result: number[] = compiler._encodeInteger(2000);

        // Assert
        expect(result).toEqual([0x1c, 0x07, 0xD0]);
    });

    it('should cover _compileDictionary default throw branch for unknown type', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        const dictionary = {
            order: [99],
            values: {
                99: 1
            },
            types: {
                99: 'unknown-type'
            },
            opcodes: {
                99: [99]
            },
            keyToNameMap: {}
        };

        const offsetTracker = {
            isTracking: jasmine.createSpy('isTracking'),
            track: jasmine.createSpy('track')
        };

        // Act
        const message: string = getThrownMessage(function (): void {
            compiler._compileDictionary(dictionary as never, offsetTracker as never);
        });

        // Assert
        expect(message).toBe('Unknown data type of unknown-type');
    });

    it('should cover _type1FontGlyphMapping direct glyph-name match branch with break', () => {
        // Arrange
        const compactFont: _PdfCompactFont = Object.create(_PdfCompactFont.prototype) as _PdfCompactFont;

        const properties = {
            _fontStructure: {
                _isInternalFont: false,
                _differences: {
                    66: 'B'
                }
            },
            _flags: 0,
            _fontFlags: {
                Symbolic: 4
            }
        };

        const glyphNames: string[] = ['.notdef', 'A', 'B'];

        // Act
        const result: { [key: number]: number } = compactFont._type1FontGlyphMapping(
            properties as never,
            null,
            glyphNames
        );

        // Assert
        expect(result[66]).toBe(2);
    });

    it('should cover _parseCharString custom undefStack branch safely', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        parser._characterValidationData[13] = {
            id: 'custom-undefstack',
            undefStack: true
        };

        const state = {
            callDepth: 0,
            stackSize: 2,
            stack: [10, 20],
            undefStack: false,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as unknown,
            width: null as unknown,
            hasVStems: false
        };

        const data: number[] = [13];

        // Act
        const result: boolean = parser._parseCharString(
            state as never,
            data,
            null as never,
            null as never
        );

        // Assert
        expect(result).toBeTruthy();
        expect(state.stackSize).toBe(0);
        expect(state.undefStack).toBeTruthy();
        expect(state.firstStackClearing).toBeFalsy();
    });

    it('should cover _createDictionary iteration and _setByKey application for each entry', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, false);
        const entries: [number, number[]][] = [
            [20, [11]],
            [21, [22]]
        ];
        const strings: _PdfCompactFontStrings = new _PdfCompactFontStrings();

        // Act
        const dictionary: _PdfCompactFontPrivateDictionary = parser._createDictionary(
            _PdfCompactFontPrivateDictionary,
            entries,
            strings
        );

        // Assert
        expect(dictionary._getByName('defaultWidthX')).toBe(11);
        expect(dictionary._getByName('nominalWidthX')).toBe(22);
    });

    it('should cover _parseCharString stackFn math path and resetStack branch together', () => {
        // Arrange
        const parserMath: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);
        const parserReset: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        const mathState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as number[],
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as unknown,
            width: null as unknown,
            hasVStems: false
        };

        const resetState = {
            callDepth: 0,
            stackSize: 0,
            stack: [] as number[],
            undefStack: true,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as unknown,
            width: null as unknown,
            hasVStems: false
        };

        const mathData: number[] = [139, 140, 12, 10, 11];
        const resetData: number[] = [139, 139, 5];

        // Act
        const mathResult: boolean = parserMath._parseCharString(
            mathState as never,
            mathData,
            null as never,
            null as never
        );

        const resetResult: boolean = parserReset._parseCharString(
            resetState as never,
            resetData,
            null as never,
            null as never
        );

        // Assert
        expect(mathResult).toBeTruthy();
        expect(resetResult).toBeTruthy();
        expect(resetState.undefStack).toBeFalsy();
    });
});

describe('Additional highlighted compact-font coverage strict AAA', () => {
    function createFile(bytes: Uint8Array): { getBytes: () => Uint8Array } {
        return {
            getBytes: function (): Uint8Array {
                return bytes;
            }
        };
    }

    function createParser(bytes: Uint8Array, properties?: object, isAnalysisEnabled?: boolean): _PdfCompactFontParser {
        return new _PdfCompactFontParser(
            createFile(bytes),
            properties ? properties : {},
            typeof isAnalysisEnabled === 'boolean' ? isAnalysisEnabled : false
        );
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

    it('should cover _PdfCompactFontDictionary._setByKey falsy keyToNameMap branch safely in Chrome', () => {
        // Arrange
        const strings: _PdfCompactFontStrings = new _PdfCompactFontStrings();
        const dictionary: _PdfCompactFontPrivateDictionary =
            new _PdfCompactFontPrivateDictionary(strings as unknown as string);

        // IMPORTANT:
        // document.all is a special falsy host object in browsers like Chrome,
        // but still allows "key in document.all" safely.
        const browserFalsyObject: unknown = (document as unknown as { all: unknown }).all;
        dictionary.keyToNameMap = browserFalsyObject as never;

        // Act
        const result: boolean = dictionary._setByKey('item', [1] as never);

        // Assert
        expect(result).toBeFalsy();
    });

    it('should cover _PdfCompactFontDictionary._setByKey value.length === 0 branch', () => {
        // Arrange
        const strings: _PdfCompactFontStrings = new _PdfCompactFontStrings();
        const dictionary: _PdfCompactFontPrivateDictionary =
            new _PdfCompactFontPrivateDictionary(strings as unknown as string);

        // Act
        const result: boolean = dictionary._setByKey(20, []);

        // Assert
        expect(result).toBeTruthy();
        expect(dictionary._getByName('defaultWidthX')).toBe(0);
    });

    it('should cover _PdfCompactFontTopDictionary._tables getter', () => {
        // Arrange

        // Act
        const tables: {
            keyToNameMap: Record<string, string>;
            nameToKeyMap: Record<string, number>;
            defaults: Record<string, unknown>;
            types: Record<string, unknown>;
            opcodes: Record<string, number[]>;
            order: number[];
        } = _PdfCompactFontTopDictionary._tables;

        // Assert
        expect(tables.keyToNameMap['17']).toBe('CharStrings');
        expect(tables.nameToKeyMap['FontMatrix']).toBe((12 << 8) + 7);
        expect(tables.order.length).toBeGreaterThan(0);
    });

    it('should cover _PdfCompactFontCompiler._encodeInteger 16-bit branch', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        // Act
        const result: number[] = compiler._encodeInteger(2000);

        // Assert
        expect(result).toEqual([0x1c, 0x07, 0xD0]);
    });

    it('should cover _PdfCompactFontCompiler._compileDictionary unknown type throw branch', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        const dictionary = {
            order: [99],
            values: {
                99: 1
            },
            types: {
                99: 'unknown-type'
            },
            opcodes: {
                99: [99]
            },
            keyToNameMap: {}
        };

        const offsetTracker = {
            isTracking: jasmine.createSpy('isTracking'),
            track: jasmine.createSpy('track')
        };

        // Act
        const message: string = getThrownMessage(function (): void {
            compiler._compileDictionary(dictionary as never, offsetTracker as never);
        });

        // Assert
        expect(message).toBe('Unknown data type of unknown-type');
    });

    it('should cover _PdfCompactFontCompiler._compileIndex offsetSize 4 branch safely without huge memory usage', () => {
        // Arrange
        const compiler: _PdfCompactFontCompiler = new _PdfCompactFontCompiler({} as never);

        let lengthAccessCount: number = 0;
        const hugeThenEmptyObject: {
            readonly length: number;
            [index: number]: number;
        } = {
            get length(): number {
                lengthAccessCount++;
                if (lengthAccessCount === 1) {
                    return 0x1000000;
                }
                return 0;
            }
        };

        const tracker = {
            offset: jasmine.createSpy('offset')
        };

        // Act
        const result: number[] = compiler._compileIndex(
            {
                objects: [hugeThenEmptyObject]
            } as never,
            [tracker] as never
        );

        // Assert
        expect(result[2]).toBe(4);
        expect(result[3]).toBe(0);
        expect(result[4]).toBe(0);
        expect(result[5]).toBe(0);
        expect(result[6]).toBe(1);
        expect(tracker.offset).toHaveBeenCalled();
    });

    it('should cover _PdfCompactFont._type1FontGlyphMapping direct glyph match with break', () => {
        // Arrange
        const compactFont: _PdfCompactFont = Object.create(_PdfCompactFont.prototype) as _PdfCompactFont;

        const properties = {
            _fontStructure: {
                _isInternalFont: false,
                _differences: {
                    66: 'B'
                }
            },
            _flags: 0,
            _fontFlags: {
                Symbolic: 4
            }
        };

        const glyphNames: string[] = ['.notdef', 'A', 'B'];

        // Act
        const result: { [key: number]: number } = compactFont._type1FontGlyphMapping(
            properties as never,
            null,
            glyphNames
        );

        // Assert
        expect(result[66]).toBe(2);
    });

    it('should cover _PdfCompactFont._getGlyphMapping composite simple branch without cidToGidMap remap', () => {
        // Arrange
        const compactFont: _PdfCompactFont = Object.create(_PdfCompactFont.prototype) as _PdfCompactFont;

        compactFont.compactFont = {
            charStrings: {
                count: 3
            },
            charSet: {
                charSet: ['.notdef', 'A', 'B']
            },
            isCharacterIdentifierFont: false,
            encoding: {
                encoding: { 65: 1, 66: 2 }
            }
        } as never;

        compactFont.properties = {
            _fontStructure: {
                _composite: true,
                _isInternalFont: false,
                _cMap: {
                    _charCodeOf: jasmine.createSpy('_charCodeOf').and.callFake(function (value: number): number {
                        return value + 20;
                    })
                },
                _differences: {
                    66: 'B'
                }
            },
            _flags: 0,
            _fontFlags: {
                Symbolic: 4
            }
        } as never;

        // Act
        const result: { [key: number]: number } = compactFont._getGlyphMapping();

        // Assert
        expect(result[20]).toBe(0);
        expect(result[21]).toBe(1);
        expect(result[22]).toBe(2);
    });

    it('should cover _parseCharString custom undefStack branch safely', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, true);

        parser._characterValidationData[13] = {
            id: 'custom-undefstack',
            undefStack: true
        };

        const state = {
            callDepth: 0,
            stackSize: 2,
            stack: [10, 20],
            undefStack: false,
            hints: 0,
            firstStackClearing: true,
            standardCharacter: null as unknown,
            width: null as unknown,
            hasVStems: false
        };

        const data: number[] = [13];

        // Act
        const result: boolean = parser._parseCharString(
            state as never,
            data,
            null as never,
            null as never
        );

        // Assert
        expect(result).toBeTruthy();
        expect(state.stackSize).toBe(0);
        expect(state.undefStack).toBeTruthy();
        expect(state.firstStackClearing).toBeFalsy();
    });

    it('should cover _createDictionary iteration and _setByKey application', () => {
        // Arrange
        const parser: _PdfCompactFontParser = createParser(new Uint8Array([1]), {}, false);
        const entries: [number, number[]][] = [
            [20, [11]],
            [21, [22]]
        ];
        const strings: _PdfCompactFontStrings = new _PdfCompactFontStrings();

        // Act
        const dictionary: _PdfCompactFontPrivateDictionary = parser._createDictionary(
            _PdfCompactFontPrivateDictionary,
            entries,
            strings
        );

        // Assert
        expect(dictionary._getByName('defaultWidthX')).toBe(11);
        expect(dictionary._getByName('nominalWidthX')).toBe(22);
    });
});
