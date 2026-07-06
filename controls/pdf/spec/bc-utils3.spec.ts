
import { PdfFontStyle } from '../src/pdf/core/fonts/pdf-standard-font';
import * as utils from '../src/pdf/core/utils'
import {
    _reverseMapPdfFontStyle,
    _getSpecialCharacter,
    _getLatinCharacter,
    _encodeValue,
    _arabicToRoman,
    _arabicToLetter
} from '../src/pdf/core/utils';


describe('core/utils – behavior coverage spec', () => {

    /*-----------------------------------------------------------
     * _reverseMapPdfFontStyle
     *----------------------------------------------------------*/
    describe('_reverseMapPdfFontStyle', () => {

        it('E: should return Regular when no style flag is set', () => {
            // Arrange
            const style = PdfFontStyle.regular;

            // Act
            const result = _reverseMapPdfFontStyle(style);

            // Assert
            expect(result).toBe('Regular');
        });

        it('should return all combined styles', () => {
            // Arrange
            const style =
                PdfFontStyle.bold |
                PdfFontStyle.italic |
                PdfFontStyle.underline |
                PdfFontStyle.strikeout;

            // Act
            const result = _reverseMapPdfFontStyle(style);

            // Assert
            expect(result).toBe('Bold, Italic, Underline, Strikeout');
        });
    });

    /*-----------------------------------------------------------
     * _getSpecialCharacter – ALL highlighted cases
     *----------------------------------------------------------*/
    describe('_getSpecialCharacter – switch coverage', () => {

        const cases: Array<[string, string]> = [
            // arrows
            ['bnw', '\u2B00'],
            ['bne', '\u2B01'],
            ['bsw', '\u2B03'],
            ['bse', '\u2B02'],

            // dash
            ['bdash1', '\u25AD'],
            ['bdash2', '\u25AB'],

            // marks
            ['xmarkbld', '\u2717'],
            ['checkbld', '\u2713'],
            ['boxxmarkbld', '\u2612'],
            ['boxcheckbld', '\u2611'],

            // misc
            ['space', '\u0020'],
            ['pencil', '\u270F'],
            ['scissors', '\u2702'],
            ['scissorscutting', '\u2701'],
            ['readingglasses', '\u2701'],
            ['bell', '\u2701'],
            ['book', '\u2701'],

            // zodiac
            ['cancer', '\u264B'],
            ['leo', '\u264C'],
            ['virgo', '\u264D'],
            ['libra', '\u264E'],
            ['scorpio', '\u264F'],
            ['saggitarius', '\u2650'],
            ['capricorn', '\u2651'],
            ['aquarius', '\u2652'],
            ['pisces', '\u2653'],

            // ampersand group
            ['ampersanditlc', '\u0026'],
            ['ampersandit', '\u0026'],
            ['ampersanditaldm', '\u0026'],
            ['ampersandbld', '\u0026'],
            ['ampersandsans', '\u0026'],
            ['ampersandsandm', '\u0026'],

            // prohibit group
            ['prohibit', '\u29B8'],
            ['prohibitbld', '\u29B8'],

            // interrobang group
            ['interrobang', '\u203D'],
            ['interrobangdm', '\u203D'],
            ['interrobangsans', '\u203D'],
            ['interrobngsandm', '\u203D'],

            // polish chars
            ['sacute', 'ś'],
            ['Sacute', 'Ś'],
            ['eogonek', 'ę'],
            ['cacute', 'ć'],
            ['aogonek', 'ą']
        ];

        cases.forEach(([input, expected]) => {
            it(`should map "${input}" correctly`, () => {
                // Act
                const result = _getSpecialCharacter(input);

                // Assert
                expect(result).toBe(expected);
            });
        });

        it('E: should return input for default branch', () => {
            // Arrange
            const input = 'unknownGlyph';

            // Act
            const result = _getSpecialCharacter(input);

            // Assert
            expect(result).toBe(input);
        });
    });

    /*-----------------------------------------------------------
     * _getLatinCharacter – ALL highlighted cases
     *----------------------------------------------------------*/
    describe('_getLatinCharacter – switch coverage', () => {

        const cases: Array<[string, string]> = [
            ['one', '1'],
            ['two', '2'],
            ['three', '3'],
            ['four', '4'],
            ['five', '5'],
            ['six', '6'],
            ['seven', '7'],
            ['eight', '8'],
            ['nine', '9'],

            ['dieresis', '¨'],
            ['divide', '÷'],
            ['dollar', '$'],
            ['dotaccent', '˙'],
            ['dotlessi', 'ı'],
            ['eacute', 'é'],
            ['middot', '˙'],
            ['edieresis', 'ë'],
            ['egrave', 'è'],
            ['emdash', '—'],
            ['endash', '–'],
            ['equal', '='],

            ['quotedblleft', '“'],
            ['quotedblright', '”'],
            ['quoteleft', '‘'],
            ['quoteright', '’'],
            ['quotesinglbase', '‚'],
            ['quotesingle', '\''],
            ['registered', '®'],
            ['ring', '˚'],
            ['scaron', 'š'],
            ['section', '§'],
            ['semicolon', ';'],
            ['slash', '/'],
            ['space', ' '],
            ['udieresis', 'ü'],
            ['uacute', 'ú'],
            ['Ecircumflex', 'Ê'],
            ['hyphen', '-']
        ];

        cases.forEach(([input, expected]) => {
            it(`should map "${input}" correctly`, () => {
                expect(_getLatinCharacter(input)).toBe(expected);
            });
        });

        it('E: should return input for default case', () => {
            expect(_getLatinCharacter('unknownLatin')).toBe('unknownLatin');
        });
    });

    /*-----------------------------------------------------------
     * _encodeValue – switch + else coverage
     *----------------------------------------------------------*/
    describe('_encodeValue', () => {

        it('should encode reserved characters using hex', () => {
            // Arrange
            const value = 'A B#';

            // Act
            const result = _encodeValue(value);

            // Assert
            expect(result).toContain('#20'); // space
            expect(result).toContain('#23'); // #
        });

        it('E: should keep printable ASCII unchanged', () => {
            expect(_encodeValue('ABCxyz')).toBe('ABCxyz');
        });
    });

    /*-----------------------------------------------------------
     * _arabicToRoman – while loop (SAFE)
     *----------------------------------------------------------*/
    describe('_arabicToRoman – while loop safety', () => {

        it('should convert number using bounded while loop', () => {
            // Act
            const result = _arabicToRoman(1994);

            // Assert
            expect(result).toBe('MCMXCIV');
        });
    });

    /*-----------------------------------------------------------
     * _arabicToLetter – while loop (SAFE)
     *----------------------------------------------------------*/
    describe('_arabicToLetter – while loop safety', () => {

        it('should convert 26 → Z', () => {
            expect(_arabicToLetter(26)).toBe('Z');
        });

        it('should convert 27 → AA', () => {
            expect(_arabicToLetter(27)).toBe('AA');
        });

        it('should convert 52 → AZ', () => {
            expect(_arabicToLetter(52)).toBe('AZ');
        });
    });

});
//////////////////////////

// utils.behavior.spec.ts
// NOTE: Adjust only the import paths to match your branch/repo structure.


import {
    PdfAnnotationFlag,
    PdfBorderEffectStyle,

    PdfFormFieldVisibility,
    PdfLineEndingStyle
} from '../src/pdf/core/enumerator';
import { _PdfDictionary, _PdfName } from '../src/pdf/core/pdf-primitives';
import { _PdfBaseStream } from '../src/pdf/core/base-stream';

type _MutablePdfDictionary = _PdfDictionary & {
    _map: Record<string, unknown>;
    _updated: boolean;
    has(key: string): boolean;
    get(key: string): unknown;
    update(key: string, value: unknown): void;
    forEach(callback: (key: string, value: unknown) => void): void;
    getArray(key: string): unknown[];
};

type _MutablePdfName = _PdfName & {
    name: string;
};

type _MutablePdfBaseStream = _PdfBaseStream & {
    dictionary: _MutablePdfDictionary;
};

function _createDictionary(initial: Record<string, unknown> = {}): _MutablePdfDictionary {
    const dictionary: _MutablePdfDictionary = Object.create(_PdfDictionary.prototype) as _MutablePdfDictionary;
    dictionary._map = { ...initial };
    dictionary._updated = false;
    dictionary.has = (key: string): boolean => Object.prototype.hasOwnProperty.call(dictionary._map, key);
    dictionary.get = (key: string): unknown => dictionary._map[key];
    dictionary.update = (key: string, value: unknown): void => {
        dictionary._map[key] = value;
        dictionary._updated = true;
    };
    dictionary.forEach = (callback: (key: string, value: unknown) => void): void => {
        Object.keys(dictionary._map).forEach((key: string) => {
            callback(key, dictionary._map[key]);
        });
    };
    dictionary.getArray = (key: string): unknown[] => {
        const value: unknown = dictionary._map[key];
        return Array.isArray(value) ? value : [];
    };
    return dictionary;
}

function _createName(value: string): _MutablePdfName {
    const name: _MutablePdfName = Object.create(_PdfName.prototype) as _MutablePdfName;
    name.name = value;
    return name;
}

function _createBaseStream(dictionary: _MutablePdfDictionary): _MutablePdfBaseStream {
    const stream: _MutablePdfBaseStream = Object.create(_PdfBaseStream.prototype) as _MutablePdfBaseStream;
    stream.dictionary = dictionary;
    return stream;
}

describe('core utils - behaviour/AAA coverage tests', () => {
    const _reverseMapEndingStyle: (style?: PdfLineEndingStyle) => string =
        (utils as unknown as { _reverseMapEndingStyle: (style?: PdfLineEndingStyle) => string })._reverseMapEndingStyle;

    const _mapLineEndingStyle: (style: string, defaultValue: PdfLineEndingStyle) => PdfLineEndingStyle =
        (utils as unknown as {
            _mapLineEndingStyle: (style: string, defaultValue: PdfLineEndingStyle) => PdfLineEndingStyle;
        })._mapLineEndingStyle;

    describe('_mapBorderEffectStyle', () => {
        it('should return cloudy when style is C', () => {
            // Arrange
            const style: string = 'C';

            // Act
            const result: PdfBorderEffectStyle = utils._mapBorderEffectStyle(style);

            // Assert
            expect(result).toBe(PdfBorderEffectStyle.cloudy);
        });

        it('should return solid for unknown style', () => {
            // Arrange
            const style: string = 'Unknown';

            // Act
            const result: PdfBorderEffectStyle = utils._mapBorderEffectStyle(style);

            // Assert
            expect(result).toBe(PdfBorderEffectStyle.solid);
        });
    });

    describe('_reverseMapEndingStyle', () => {
        it('should return ROpenArrow for rOpenArrow', () => {
            // Arrange
            const style: PdfLineEndingStyle = PdfLineEndingStyle.rOpenArrow;

            // Act
            const result: string = _reverseMapEndingStyle(style);

            // Assert
            expect(result).toBe('ROpenArrow');
        });

        it('should return RClosedArrow for rClosedArrow', () => {
            // Arrange
            const style: PdfLineEndingStyle = PdfLineEndingStyle.rClosedArrow;

            // Act
            const result: string = _reverseMapEndingStyle(style);

            // Assert
            expect(result).toBe('RClosedArrow');
        });

        it('should return None when style is undefined', () => {
            // Arrange
            const style: PdfLineEndingStyle | undefined = undefined;

            // Act
            const result: string = _reverseMapEndingStyle(style);

            // Assert
            expect(result).toBe('None');
        });
    });

    describe('_mapLineEndingStyle', () => {
        it('should map ropenarrow to rOpenArrow', () => {
            // Arrange
            const style: string = 'ropenarrow';

            // Act
            const result: PdfLineEndingStyle = _mapLineEndingStyle(style, PdfLineEndingStyle.none);

            // Assert
            expect(result).toBe(PdfLineEndingStyle.rOpenArrow);
        });

        it('should map rclosedarrow to rClosedArrow', () => {
            // Arrange
            const style: string = 'rclosedarrow';

            // Act
            const result: PdfLineEndingStyle = _mapLineEndingStyle(style, PdfLineEndingStyle.none);

            // Assert
            expect(result).toBe(PdfLineEndingStyle.rClosedArrow);
        });

        it('should map butt to butt', () => {
            // Arrange
            const style: string = 'butt';

            // Act
            const result: PdfLineEndingStyle = _mapLineEndingStyle(style, PdfLineEndingStyle.none);

            // Assert
            expect(result).toBe(PdfLineEndingStyle.butt);
        });

        it('should use the provided default value for unknown input', () => {
            // Arrange
            const style: string = 'not-a-line-ending-style';

            // Act
            const result: PdfLineEndingStyle = _mapLineEndingStyle(style, PdfLineEndingStyle.circle);

            // Assert
            expect(result).toBe(0);
        });
    });

    describe('_getItemValue', () => {
        it('should return AS name when AS exists and is not Off', () => {
            // Arrange
            const itemDictionary: _MutablePdfDictionary = _createDictionary({
                AS: _createName('Yes')
            });

            // Act
            const result: string = utils._getItemValue(itemDictionary);

            // Assert
            expect(result).toBe('Yes');
        });

        it('should use V when AS is absent and V exists with a non-Off name', () => {
            // Arrange
            const itemDictionary: _MutablePdfDictionary = _createDictionary({
                V: _createName('Selected')
            });

            // Act
            const result: string = utils._getItemValue(itemDictionary);

            // Assert
            expect(result).toBe('Selected');
        });

        it('should not use V when its value is Off', () => {
            // Arrange
            const itemDictionary: _MutablePdfDictionary = _createDictionary({
                V: _createName('Off')
            });

            // Act
            const result: string = utils._getItemValue(itemDictionary);

            // Assert
            expect(result).toBe('');
        });

        it('should resolve the first non-Off key from AP/N when N is a base stream', () => {
            // Arrange
            const appearanceDictionary: _MutablePdfDictionary = _createDictionary({
                Off: true,
                Yes: true,
                Another: true
            });
            const appearanceStream: _MutablePdfBaseStream = _createBaseStream(appearanceDictionary);
            const apDictionary: _MutablePdfDictionary = _createDictionary({
                N: appearanceStream
            });
            const itemDictionary: _MutablePdfDictionary = _createDictionary({
                AP: apDictionary
            });

            // Act
            const result: string = utils._getItemValue(itemDictionary);

            // Assert
            expect(result).toBe('Yes');
        });

        it('should resolve the first non-Off key from AP/N when N is directly a dictionary', () => {
            // Arrange
            const appearanceDictionary: _MutablePdfDictionary = _createDictionary({
                Off: true,
                On: true
            });
            const apDictionary: _MutablePdfDictionary = _createDictionary({
                N: appearanceDictionary
            });
            const itemDictionary: _MutablePdfDictionary = _createDictionary({
                AP: apDictionary
            });

            // Act
            const result: string = utils._getItemValue(itemDictionary);

            // Assert
            expect(result).toBe('On');
        });

        it('should return empty string when AP exists but only Off is present', () => {
            // Arrange
            const appearanceDictionary: _MutablePdfDictionary = _createDictionary({
                Off: true
            });
            const apDictionary: _MutablePdfDictionary = _createDictionary({
                N: appearanceDictionary
            });
            const itemDictionary: _MutablePdfDictionary = _createDictionary({
                AP: apDictionary
            });

            // Act
            const result: string = utils._getItemValue(itemDictionary);

            // Assert
            expect(result).toBe('');
        });

        it('should return empty string for a non-dictionary input', () => {
            // Arrange
            const invalidInput: unknown = { AS: _createName('Yes') };

            // Act
            const result: string = utils._getItemValue(invalidInput as _PdfDictionary);

            // Assert
            expect(result).toBe('');
        });
    });

    describe('_reverseMapPdfFontStyle', () => {
        it('should return Regular when no flags are set', () => {
            // Arrange
            const style: PdfFontStyle = PdfFontStyle.regular;

            // Act
            const result: string = utils._reverseMapPdfFontStyle(style);

            // Assert
            expect(result).toBe('Regular');
        });

        it('should return all enabled flags in order', () => {
            // Arrange
            const style: PdfFontStyle =
                PdfFontStyle.bold |
                PdfFontStyle.italic |
                PdfFontStyle.underline |
                PdfFontStyle.strikeout;

            // Act
            const result: string = utils._reverseMapPdfFontStyle(style);

            // Assert
            expect(result).toBe('Bold, Italic, Underline, Strikeout');
        });

        it('should return only the active subset', () => {
            // Arrange
            const style: PdfFontStyle = PdfFontStyle.bold | PdfFontStyle.underline;

            // Act
            const result: string = utils._reverseMapPdfFontStyle(style);

            // Assert
            expect(result).toBe('Bold, Underline');
        });
    });

    
    describe('_getSpecialCharacter', () => {
        const highlightedCases: Array<{ input: string; expected: string }> = [
            { input: 'circleshadowdwn', expected: '\u274D' },
            { input: 'square6', expected: '\u25A0' },
            { input: 'box3', expected: '\u25A1' },
            { input: 'boxshadowdwn', expected: '\u2751' },
            { input: 'boxshadowup', expected: '\u2752' },
            { input: 'lozenge4', expected: '\u2B27' },
            { input: 'lozenge6', expected: '\u29EB' },

            { input: 'sixsans', expected: '\u2465' },
            { input: 'sevensans', expected: '\u2466' },
            { input: 'eightsans', expected: '\u2467' },
            { input: 'ninesans', expected: '\u2468' },
            { input: 'tensans', expected: '\u2469' },
            { input: 'zerosansinv', expected: '\u24FF' },
            { input: 'onesansinv', expected: '\u2776' },
            { input: 'twosansinv', expected: '\u2777' },
            { input: 'threesansinv', expected: '\u2778' },
            { input: 'foursansinv', expected: '\u2779' },
            { input: 'circle2', expected: '\u00B7' },
            { input: 'circle4', expected: '\u2022' },
            { input: 'square2', expected: '\u25AA' },

            { input: 'deleteright', expected: '\u2326' },
            { input: 'scissorsoutline', expected: '\u2704' },
            { input: 'telephone', expected: '\u260F' },
            { input: 'telhandset', expected: '\u1F4DE' },
            { input: 'handptlft1', expected: '\u261C' },
            { input: 'handptrt1', expected: '\u261E' },
            { input: 'handptlftsld1', expected: '\u261A' },
            { input: 'handptrtsld1', expected: '\u261B' },
            { input: 'handptup1', expected: '\u261D' },
            { input: 'handptdwn1', expected: '\u261F' },
            { input: 'xmark', expected: '\u2717' },
            { input: 'check', expected: '\u2713' },
            { input: 'boxcheck', expected: '\u2611' },
            { input: 'boxx', expected: '\u2612' },
            { input: 'boxxbld', expected: '\u2612' },
            { input: 'circlex', expected: '=\u2314' },
            { input: 'circlexbld', expected: '\u2314' }
        ];

        highlightedCases.forEach(({ input, expected }: { input: string; expected: string }) => {
            it(`should map "${input}" correctly`, () => {
                // Arrange
                const value: string = input;

                // Act
                const result: string = utils._getSpecialCharacter(value);

                // Assert
                expect(result).toBe(expected);
            });
        });

        const defaultBranchCases: string[] = [
            'asciicircum',
            'asciitilde',
            'asterisk',
            'at',
            'atilde',
            'backslash',
            'bar',
            'braceleft',
            'braceright',
            'bracketleft',
            'bracketright',
            'icircumflex',
            'idieresis',
            'igrave',
            'less',
            'logicalnot',
            'lslash',
            'Lslash',
            'macron',
            'space6',
            'underscore',
            'adieresis',
            'ampersand',
            'Adieresis',
            'Udieresis',
            'ccaron',
            'Scaron',
            'zcaron',
            'sterling',
            'agrave',
            'ecircumflex',
            'acircumflex',
            'Oacute'
        ];

        defaultBranchCases.forEach((input: string) => {
            it(`should return the input itself for unsupported glyph "${input}"`, () => {
                // Arrange
                const value: string = input;

                // Act
                const result: string = utils._getSpecialCharacter(value);

                // Assert
                expect(result).toBe(input);
            });
        });

        it('should cover grouped branch values for prohibit / prohibitbld', () => {
            expect(utils._getSpecialCharacter('prohibit')).toBe('\u29B8');
            expect(utils._getSpecialCharacter('prohibitbld')).toBe('\u29B8');
        });

        it('should cover grouped branch values for ampersanditaldm / ampersandbld / ampersandsans / ampersandsandm', () => {
            expect(utils._getSpecialCharacter('ampersanditaldm')).toBe('&');
            expect(utils._getSpecialCharacter('ampersandbld')).toBe('&');
            expect(utils._getSpecialCharacter('ampersandsans')).toBe('&');
            expect(utils._getSpecialCharacter('ampersandsandm')).toBe('&');
        });

        it('should cover grouped branch values for interrobang variants', () => {
            expect(utils._getSpecialCharacter('interrobang')).toBe('\u203D');
            expect(utils._getSpecialCharacter('interrobangdm')).toBe('\u203D');
            expect(utils._getSpecialCharacter('interrobangsans')).toBe('\u203D');
            expect(utils._getSpecialCharacter('interrobngsandm')).toBe('\u203D');
        });

        it('should return the input itself for the default branch', () => {
            const input: string = 'notMappedGlyph';
            const result: string = utils._getSpecialCharacter(input);
            expect(result).toBe('notMappedGlyph');
        });
    });

    describe('_updateVisibility', () => {
        it('should remove existing F and set hidden flag for hidden visibility', () => {
            // Arrange
            const dictionary: _MutablePdfDictionary = _createDictionary({
                F: 999
            });

            // Act
            utils._updateVisibility(dictionary, PdfFormFieldVisibility.hidden);

            // Assert
            expect(dictionary.has('F')).toBeTruthy();
            expect(dictionary.get('F')).toBe(PdfAnnotationFlag.hidden as number);
            expect(dictionary._updated).toBeTruthy();
        });

        it('should set noView | print for hiddenPrintable visibility', () => {
            // Arrange
            const dictionary: _MutablePdfDictionary = _createDictionary();

            // Act
            utils._updateVisibility(dictionary, PdfFormFieldVisibility.hiddenPrintable);

            // Assert
            expect(dictionary.get('F')).toBe((PdfAnnotationFlag.noView | PdfAnnotationFlag.print) as number);
            expect(dictionary._updated).toBeTruthy();
        });

        it('should remove DV and MK.BG for visible visibility', () => {
            // Arrange
            const mkDictionary: _MutablePdfDictionary = _createDictionary({
                BG: [255, 255, 0]
            });
            const dictionary: _MutablePdfDictionary = _createDictionary({
                F: 1,
                DV: 'Default',
                MK: mkDictionary
            });

            // Act
            utils._updateVisibility(dictionary, PdfFormFieldVisibility.visible);

            // Assert
            expect(dictionary.has('DV')).toBeFalsy();
            expect(mkDictionary.has('BG')).toBeFalsy();
            expect(dictionary._updated).toBeTruthy();
            expect(mkDictionary._updated).toBeTruthy();
        });

        it('should safely handle visible visibility when F, DV, MK or BG are absent (else branches)', () => {
            // Arrange
            const mkDictionary: _MutablePdfDictionary = _createDictionary();
            const dictionary: _MutablePdfDictionary = _createDictionary({
                MK: mkDictionary
            });

            // Act
            utils._updateVisibility(dictionary, PdfFormFieldVisibility.visible);

            // Assert
            expect(dictionary.has('DV')).toBeFalsy();
            expect(mkDictionary.has('BG')).toBeFalsy();
            expect(dictionary.get('F')).toBeUndefined();
        });
    });
});
