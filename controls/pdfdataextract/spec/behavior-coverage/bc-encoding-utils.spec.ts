
import {
    _getEncoding,
    _getGlyphsUnicode,
    _getStdFontMap,
    _getGlyphMapForStandardFonts,
    _getSupplementalGlyphMapForArialBlack,
    _getFontGlyphMap,
    _getNonStdFontMap,
    _getDingbatsGlyphsUnicode
} from '../../src/pdf-data-extract/core/text-extraction/encoding-utils';

import {
    _PdfCompactFont,
    _PdfCompactFontIndex
} from '../../src/pdf-data-extract/core/text-extraction/compact-font-parser';

import * as encodingUtilsModule from '../../src/pdf-data-extract/core/text-extraction/encoding-utils';
import * as fontUtilsModule from '../../src/pdf-data-extract/core/text-extraction/font-utils';

describe('encoding-utils highlighted AAA coverage', () => {
    it('should cover all highlighted _getEncoding switch cases and default null', () => {
        // Arrange

        // Act
        const standardResult: string[] = _getEncoding('StandardEncoding');
        const symbolResult: string[] = _getEncoding('SymbolSetEncoding');
        const zapfResult: string[] = _getEncoding('ZapfDingbatsEncoding');
        const expertResult: string[] = _getEncoding('ExpertEncoding');
        const macExpertResult: string[] = _getEncoding('MacExpertEncoding');
        const unknownResult: string[] = _getEncoding('UnknownEncoding');

        // Assert
        expect(Array.isArray(standardResult)).toBeTruthy();
        expect(Array.isArray(symbolResult)).toBeTruthy();
        expect(Array.isArray(zapfResult)).toBeTruthy();
        expect(Array.isArray(expertResult)).toBeTruthy();
        expect(Array.isArray(macExpertResult)).toBeTruthy();

        expect(standardResult[32]).toBe('space');
        expect(symbolResult[65]).toBe('Alpha');
        expect(zapfResult[33]).toBe('a1');
        expect(expertResult[32]).toBe('exclamsmall');
        expect(macExpertResult[32]).toBe('exclamsmall');

        expect(unknownResult).toBeNull();
    });

    it('should cover _getGlyphsUnicode basic return object', () => {
        // Arrange

        // Act
        const glyphsUnicode: { [key: string]: number } = _getGlyphsUnicode();

        // Assert
        expect(glyphsUnicode.A).toBe(65);
        expect(glyphsUnicode.space).toBe(32);
        expect(glyphsUnicode.euro || glyphsUnicode.Euro).toBeDefined();
    });

    it('should cover _getStdFontMap highlighted return standardFont line', () => {
        // Arrange

        // Act
        const standardFontMap: { [key: string]: string } = _getStdFontMap();

        // Assert
        expect(standardFontMap['TimesNewRomanPSMT']).toBe('Times-Roman');
        expect(standardFontMap['TimesNewRomanPS-BoldMT']).toBe('Times-Bold');
        expect(standardFontMap['ArialMT']).toBeDefined();
    });

    it('should cover _getGlyphMapForStandardFonts highlighted object creation and return line', () => {
        // Arrange

        // Act
        const standardGlyphMap: { [key: number]: number } = _getGlyphMapForStandardFonts();

        // Assert
        expect(standardGlyphMap[2]).toBe(10);
        expect(standardGlyphMap[3]).toBe(32);
        expect(standardGlyphMap[20]).toBe(49);
        expect(Object.keys(standardGlyphMap).length).toBeGreaterThan(0);
    });

    it('should cover _getSupplementalGlyphMapForArialBlack highlighted object and return line', () => {
        // Arrange

        // Act
        const arialBlackMap: { [key: number]: number } = _getSupplementalGlyphMapForArialBlack();

        // Assert
        expect(arialBlackMap[227]).toBe(322);
        expect(arialBlackMap[264]).toBe(261);
        expect(arialBlackMap[291]).toBe(346);
    });

    it('should cover _getFontGlyphMap highlighted calibri object and return calibri line', () => {
        // Arrange

        // Act
        const calibriMap: { [key: number]: number } = _getFontGlyphMap();

        // Assert
        expect(calibriMap[1]).toBe(32);
        expect(calibriMap[4]).toBe(65);
        expect(calibriMap[5]).toBe(192);
        expect(Object.keys(calibriMap).length).toBeGreaterThan(0);
    });

    it('should cover _getNonStdFontMap export and return object', () => {
        // Arrange

        // Act
        const nonStdFontMap: { [key: string]: string } = _getNonStdFontMap();

        // Assert
        expect(typeof _getNonStdFontMap).toBe('function');
        expect(nonStdFontMap['Calibri']).toBeDefined();
        expect(nonStdFontMap['CenturyGothic']).toBeDefined();
        expect(nonStdFontMap['ComicSansMS']).toBeDefined();
    });

    it('should cover _getDingbatsGlyphsUnicode highlighted object initialization and return glyphUnicode', () => {
        // Arrange

        // Act
        const dingbatsMap: { [key: string]: number } = _getDingbatsGlyphsUnicode();

        // Assert
        expect(dingbatsMap.space).toBe(0x0020);
        expect(dingbatsMap.a1).toBeDefined();
        expect(dingbatsMap.a2).toBeDefined();
    });
});


describe('reachable compact-font highlighted coverage around _getGlyphMapping AAA', () => {
    it('should cover all reachable _getGlyphMapping branches safely', () => {
        // Arrange
        const compactFont: _PdfCompactFont = Object.create(_PdfCompactFont.prototype) as _PdfCompactFont;

        compactFont.compactFont = {
            charStrings: {
                count: 3
            },
            charSet: {
                charSet: [0, 1, 2]
            },
            isCharacterIdentifierFont: true,
            encoding: {
                encoding: { 65: 1, 66: 2 }
            }
        } as never;

        const glyphMappingProperties: {
            _fontStructure: {
                _composite: boolean;
                _isInternalFont: boolean;
                _defaultEncoding: string[];
                _differences: Record<number, string>;
                _cMap: {
                    _charCodeOf: jasmine.Spy;
                };
            };
            _flags: number;
            _fontFlags: {
                Symbolic: number;
            };
            baseEncodingName?: string;
        } = {
            _fontStructure: {
                _composite: true,
                _isInternalFont: false,
                _defaultEncoding: ['.notdef', 'A', 'B'],
                _differences: {
                    66: 'B'
                },
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

        compactFont.properties = glyphMappingProperties as never;

        spyOn(encodingUtilsModule, '_getEncoding').and.returnValue(['.notdef', 'A', 'B'] as never);
        spyOn(encodingUtilsModule, '_getGlyphsUnicode').and.returnValue({ uni0041: 65 } as never);
        spyOn(fontUtilsModule, '_recoverGlyphName').and.returnValue('A');

        // Act
        const compositeCidResult: { [key: number]: number } = compactFont._getGlyphMapping();

        compactFont.compactFont.isCharacterIdentifierFont = false;
        compactFont.compactFont.charSet = { charSet: ['.notdef', 'A', 'B'] } as never;
        const compositeSimpleResult: { [key: number]: number } = compactFont._getGlyphMapping();

        glyphMappingProperties._fontStructure._composite = false;
        glyphMappingProperties._fontStructure._isInternalFont = true;
        const internalFontResult: { [key: number]: number } = compactFont._getGlyphMapping();

        glyphMappingProperties._fontStructure._isInternalFont = false;
        glyphMappingProperties.baseEncodingName = 'StandardEncoding';
        const baseEncodingResult: { [key: number]: number } = compactFont._getGlyphMapping();

        glyphMappingProperties.baseEncodingName = undefined;
        glyphMappingProperties._flags = 4;
        const symbolicResult: { [key: number]: number } = compactFont._type1FontGlyphMapping(
            glyphMappingProperties as never,
            { 70: 2 } as never,
            ['.notdef', 'A', 'B']
        );

        glyphMappingProperties._flags = 0;
        const directDifferenceResult: { [key: number]: number } = compactFont._type1FontGlyphMapping(
            glyphMappingProperties as never,
            null as never,
            ['.notdef', 'A', 'B']
        );

        // Assert
        expect(compositeCidResult[10]).toBe(0);
        expect(compositeCidResult[11]).toBe(1);
        expect(compositeCidResult[12]).toBe(2);

        expect(compositeSimpleResult[10]).toBe(0);
        expect(compositeSimpleResult[11]).toBe(1);
        expect(compositeSimpleResult[12]).toBe(2);

        expect(internalFontResult[1]).toBe(1);
        expect(internalFontResult[2]).toBe(2);

        expect(baseEncodingResult[1]).toBe(1);
        expect(baseEncodingResult[2]).toBe(2);

        expect(symbolicResult[70]).toBe(2);
        expect(directDifferenceResult[66]).toBe(2);
    });

    it('should cover direct glyph-name match break path in _type1FontGlyphMapping explicitly', () => {
        // Arrange
        const compactFont: _PdfCompactFont = Object.create(_PdfCompactFont.prototype) as _PdfCompactFont;

        const glyphMappingProperties: {
            _fontStructure: {
                _isInternalFont: boolean;
                _differences: Record<number, string>;
            };
            _flags: number;
            _fontFlags: {
                Symbolic: number;
            };
            baseEncodingName?: string;
        } = {
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
            glyphMappingProperties as never,
            null as never,
            glyphNames
        );

        // Assert
        expect(result[66]).toBe(2);
    });
});
