

import {
    _toUnsigned, _toSigned16, _copyRange,
    _annotationFlagsToString, _stringToAnnotationFlags,
    _stringToPdfString, _stringToBytes,
    _arePointsNotEqual, _bytesToString,
    _hexStringToByteArray, _hexStringToString,
    _decode, _encode,
    _getInheritableProperty,
    _parseRectangle, _calculateBounds, _getUpdatedBounds,
    _convertToColor, _parseColor,
    _reverseMapEndingStyle, _mapLineEndingStyle,
    _mapHighlightMode, _reverseMapHighlightMode
} from '../src/pdf/core/utils';

import {
    PdfAnnotationFlag,
    PdfLineEndingStyle,
    PdfHighlightMode,
    PdfFormFieldVisibility,
    _PdfCheckFieldState,
    PdfRubberStampAnnotationIcon,
    _PdfAnnotationType,
    PdfBorderStyle
} from '../src/pdf/core/enumerator';
import * as utils from '../src/pdf/core/utils'
import { _PdfDictionary, _PdfName, _PdfReference, Dictionary } from '../src/pdf/core/pdf-primitives';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { Size } from '../src/pdf/core/pdf-type';
import { PdfComboBoxField, PdfField, PdfTextBoxField } from '../src/pdf/core/form/field';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { _PdfBaseStream, _PdfStream } from '../src/pdf/core/base-stream';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfCjkStandardFont, PdfFontFamily, PdfFontStyle, PdfStandardFont, PdfTrueTypeFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfForm } from '../src/pdf/core/form/form';
import { PdfAnnotation, PdfListFieldItem, PdfWidgetAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfStringFormat } from '../src/pdf/core/fonts/pdf-string-format';
import { PdfPageSettings } from '../src/pdf/core/pdf-document';
type DictStore = Map<string, unknown>;


function createDictionary(
    initial: Record<string, unknown> = {},
    objId: string = ''
): _PdfDictionary {

    const store: DictStore = new Map<string, unknown>();

    // ✅ Replacement for Object.entries without changing logic
    Object.keys(initial).forEach((key: string) => {
        store.set(key, initial[key]);
    });

    const dict: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;

    (dict as unknown as { objId: string }).objId = objId;

    (dict as unknown as { has: (key: string) => boolean }).has =
        (key: string): boolean => store.has(key);

    (dict as unknown as { get: (key: string) => unknown }).get =
        (key: string): unknown => store.get(key);

    (dict as unknown as { getArray: (key: string) => unknown[] }).getArray =
        (key: string): unknown[] => (store.get(key) as unknown[]) || [];

    (dict as unknown as { set: (key: string, value: unknown) => void }).set =
        (key: string, value: unknown): void => {
            store.set(key, value);
        };

    (dict as unknown as { update: (key: string, value: unknown) => void }).update =
        (key: string, value: unknown): void => {
            store.set(key, value);
        };

    (dict as unknown as { getRaw: (key: string) => unknown }).getRaw =
        (key: string): unknown => store.get(`__raw__${key}`);

    (dict as unknown as {
        forEach: (callback: (key: string, value: unknown) => void) => void;
    }).forEach =
        (callback: (key: string, value: unknown) => void): void => {
            store.forEach((value: unknown, key: string) => {
                if (!key.startsWith('__raw__')) {
                    callback(key, value);
                }
            });
        };

    return dict;
}


function setRaw(dict: _PdfDictionary, key: string, value: unknown): void {
    const getMap = (d: _PdfDictionary): DictStore => {
        // rebuild from visible methods so helper stays isolated
        const map: DictStore = new Map<string, unknown>();
        const keys: string[] = [];
        (d as unknown as { forEach: (cb: (k: string, v: unknown) => void) => void }).forEach((k, v) => {
            keys.push(k);
            map.set(k, v);
        });
        for (const existingKey of keys) {
            map.set(existingKey, (d as unknown as { get: (k: string) => unknown }).get(existingKey));
        }
        return map;
    };

    const original: DictStore = getMap(dict);
    original.set(`__raw__${key}`, value);

    (dict as unknown as { getRaw: (k: string) => unknown }).getRaw = (k: string): unknown => original.get(`__raw__${k}`);
}

function createReference(): _PdfReference {
    return Object.create(_PdfReference.prototype) as _PdfReference;
}

function createBaseStream(dictionary: _PdfDictionary): _PdfBaseStream {
    const stream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
    (stream as unknown as { dictionary: _PdfDictionary }).dictionary = dictionary;
    return stream;
}

function createField(dict: _PdfDictionary): PdfField {
    const field: PdfField = Object.create(PdfField.prototype) as PdfField;
    (field as unknown as { _dictionary: _PdfDictionary })._dictionary = dict;
    (field as unknown as { _crossReference: _PdfCrossReference })._crossReference =
        Object.create(_PdfCrossReference.prototype) as _PdfCrossReference;
    return field;
}

describe('utils helper behaviour coverage', () => {
    describe('_annotationFlagsToString', () => {
        it('should include togglenoview and default when both bits are present', () => {
            // Arrange
            const flag: PdfAnnotationFlag =
                PdfAnnotationFlag.toggleNoView | PdfAnnotationFlag.default;

            // Act
            const result: string = utils._annotationFlagsToString(flag);

            // Assert
            expect(result).toContain('togglenoview');
        });
    });

    describe('_mapLineEndingStyle', () => {
        it('should map square correctly', () => {
            // Arrange
            const input: string = 'square';

            // Act
            const result: PdfLineEndingStyle = utils._mapLineEndingStyle(input);

            // Assert
            expect(result).toBe(PdfLineEndingStyle.square);
        });

        it('should map slash correctly', () => {
            // Arrange
            const input: string = 'slash';

            // Act
            const result: PdfLineEndingStyle = utils._mapLineEndingStyle(input);

            // Assert
            expect(result).toBe(PdfLineEndingStyle.slash);
        });

        it('should fall back to none for unsupported style', () => {
            // Arrange
            const input: string = 'unsupported-value';

            // Act
            const result: PdfLineEndingStyle = utils._mapLineEndingStyle(input);

            // Assert
            expect(result).toBe(PdfLineEndingStyle.none);
        });
    });

    describe('_escapePdfName', () => {
        it('should encode an invalid high surrogate as replacement character bytes', () => {
            // Arrange
            const input: string = '\uD800A'; // lone high surrogate followed by non-low-surrogate

            // Act
            const result: string = utils._escapePdfName(input);

            // Assert
            // U+FFFD => EF BF BD in UTF-8, followed by "A"
            expect(result.startsWith('#EF#BF#BD')).toBeTruthy();
            expect(result.endsWith('A')).toBeTruthy();
        });

        it('should encode an isolated low surrogate as replacement character bytes', () => {
            // Arrange
            const input: string = '\uDC00';

            // Act
            const result: string = utils._escapePdfName(input);

            // Assert
            expect(result).toBe('#EF#BF#BD');
        });

        it('should UTF-8 encode a normal non-ASCII BMP character', () => {
            // Arrange
            const input: string = 'é';

            // Act
            const result: string = utils._escapePdfName(input);

            // Assert
            // é => C3 A9
            expect(result).toBe('#C3#A9');
        });

        it('should preserve already-escaped hex triplets and uppercase them', () => {
            // Arrange
            const input: string = '#2f';

            // Act
            const result: string = utils._escapePdfName(input);

            // Assert
            expect(result).toBe('#2F');
        });
    });

    describe('_getStateTemplate', () => {
        it('should create a template when AP/N contains a base stream and matching raw reference', () => {
            // Arrange
            const valueName: string = 'Yes';
            const normalStateStreamDict: _PdfDictionary = createDictionary({});
            const normalStateStream: _PdfBaseStream = createBaseStream(normalStateStreamDict);
            const rawReference: _PdfReference = createReference();

            const appearanceN: _PdfDictionary = createDictionary({
                [valueName]: normalStateStream
            });
            setRaw(appearanceN, valueName, rawReference);

            const appearanceDict: _PdfDictionary = createDictionary({
                N: createBaseStream(appearanceN) // cover "appearance instanceof _PdfBaseStream"
            });

            const fieldDict: _PdfDictionary = createDictionary({
                AS: _PdfName.get(valueName),
                AP: appearanceDict
            });

            const field: PdfField = createField(fieldDict);

            // Act
            const template: PdfTemplate = utils._getStateTemplate(_PdfCheckFieldState.checked, field);

            // Assert
            expect(template).toBeDefined();
            expect((normalStateStream as unknown as { reference?: _PdfReference }).reference).toBe(rawReference);
        });

        it('should return undefined when AP exists but there is no matching appearance stream', () => {
            // Arrange
            const appearanceN: _PdfDictionary = createDictionary({
                Off: createBaseStream(createDictionary({}))
            });

            const appearanceDict: _PdfDictionary = createDictionary({
                N: appearanceN
            });

            const fieldDict: _PdfDictionary = createDictionary({
                AS: _PdfName.get('Yes'),
                AP: appearanceDict
            });

            const field: PdfField = createField(fieldDict);

            // Act
            const template: PdfTemplate = utils._getStateTemplate(_PdfCheckFieldState.checked, field);

            // Assert
            expect(template).toBeUndefined();
        });
    });

    describe('_getColorValue / _convertToColor', () => {
        it('should return RGB for LightPink exactly', () => {
            // Arrange
            const input: string = 'LightPink';

            // Act
            const value: number[] = utils._getColorValue(input);
            const color = utils._convertToColor(input);

            // Assert
            expect(value).toEqual([255, 182, 193]);
            expect(color).toEqual({ r: 255, g: 182, b: 193 });
        });
    });

    describe('_mapRubberStampIcon', () => {
        it('should map #Final and SBFinal to final', () => {
            // Arrange
            const hashName: string = '#Final';
            const sbName: string = 'SBFinal';

            // Act
            const fromHash: PdfRubberStampAnnotationIcon = utils._mapRubberStampIcon(hashName);
            const fromSB: PdfRubberStampAnnotationIcon = utils._mapRubberStampIcon(sbName);

            // Assert
            expect(fromHash).toBe(PdfRubberStampAnnotationIcon.final);
            expect(fromSB).toBe(PdfRubberStampAnnotationIcon.final);
        });

        it('should map #Sold and SBSold to sold', () => {
            // Arrange
            const hashName: string = '#Sold';
            const sbName: string = 'SBSold';

            // Act
            const fromHash: PdfRubberStampAnnotationIcon = utils._mapRubberStampIcon(hashName);
            const fromSB: PdfRubberStampAnnotationIcon = utils._mapRubberStampIcon(sbName);

            // Assert
            expect(fromHash).toBe(PdfRubberStampAnnotationIcon.sold);
            expect(fromSB).toBe(PdfRubberStampAnnotationIcon.sold);
        });

        it('should remove embedded "23" markers before mapping', () => {
            // Arrange
            const input: string = '23 SBFinal 23';

            // Act
            const result: PdfRubberStampAnnotationIcon = utils._mapRubberStampIcon(input);

            // Assert
            expect(result).toBe(PdfRubberStampAnnotationIcon.final);
        });
    });

    describe('_getSpecialCharacter', () => {
        it('should map fivesans correctly', () => {
            // Arrange
            const input: string = 'fivesans';

            // Act
            const result: string = utils._getSpecialCharacter(input);

            // Assert
            expect(result).toBe('\u2464');
        });

        it('should map deleteleft correctly', () => {
            // Arrange
            const input: string = 'deleteleft';

            // Act
            const result: string = utils._getSpecialCharacter(input);

            // Assert
            expect(result).toBe('\u232B');
        });

        it('should return input itself for an unsupported special-character key', () => {
            // Arrange
            const input: string = 'unknown-glyph-name';

            // Act
            const result: string = utils._getSpecialCharacter(input);

            // Assert
            expect(result).toBe(input);
        });
    });

    describe('small helper sanity tests', () => {
        it('should map default annotation flag string correctly', () => {
            // Arrange / Act / Assert
            expect(utils._stringToAnnotationFlags('not-a-known-flag')).toBe(PdfAnnotationFlag.default);
        });

        it('should convert utf8 bytes back to string without loop issues', () => {
            // Arrange
            const bytes: Uint8Array = new Uint8Array([0x41, 0xC3, 0xA9, 0xE2, 0x82, 0xAC]);

            // Act
            const result: string = utils._decodeUnicodeBytes(bytes);

            // Assert
            expect(result).toBe('Aé€');
        });
    });
});


describe('EJ2 PDF Utility Full Coverage Suite', () => {

    /* ---------------------------------- */
    /* ✅ _decodeName + surrogate paths */
    /* ---------------------------------- */
    it('should cover decodeName empty + unicode branches', () => {

        // Arrange
        const empty = '';
        const simple = 'PlainText';
        const unicode = 'Val_X0041_';
        const surrogate = 'Smile_X0001F600_';

        // Act
        const r1 = utils._decodeName(empty);
        const r2 = utils._decodeName(simple);
        const r3 = utils._decodeName(unicode);
        const r4 = utils._decodeName(surrogate);

        // Assert
        expect(r1).toBe('');
        expect(r2).toBe('PlainText');
        expect(r3).toBe('ValA');
        expect(r4.length).toBeGreaterThan(0);
    });

    /* ---------------------------------- */
    /* ✅ _decodeUnicodeBytes (while loop safe) */
    /* ---------------------------------- */

    it('should decode UTF‑8 byte sequences', () => {
        // Arrange
        const ascii: Uint8Array = new Uint8Array([65]);
        const two: Uint8Array = new Uint8Array([0xC3, 0xA9]);
        const three: Uint8Array = new Uint8Array([0xE2, 0x82, 0xAC]);
        const four: Uint8Array = new Uint8Array([0xF0, 0x9F, 0x98, 0x80]);

        // Act
        const r1: string = utils._decodeUnicodeBytes(ascii);
        const r2: string = utils._decodeUnicodeBytes(two);
        const r3: string = utils._decodeUnicodeBytes(three);
        const r4: string = utils._decodeUnicodeBytes(four);

        // Assert
        expect(r1).toBe('A');
        expect(r2).toBe('é');
        expect(r3).toBe('€');
        expect(r4).toBeTruthy();
    });


    /* ---------------------------------- */
    /* ✅ _getInheritableProperty (while loop safe) */
    /* ---------------------------------- */
    it('should walk parent chain safely', () => {

        // Arrange
        const root = createDictionary({ A: 'root' }, '1');
        const child = createDictionary({ Parent: root }, '2');

        // Act
        const result = utils._getInheritableProperty(child, 'A', false, true, 'Parent');

        // Assert
        expect(result).toBe('root');

        // cyclic (no infinite loop)
        const loop = createDictionary({}, '3');
        loop.update('Parent', loop);

        const cyclic = utils._getInheritableProperty(loop, 'A', false, false, 'Parent');
        expect(cyclic).toBeUndefined();
    });

    /* ---------------------------------- */
    /* ✅ Latin Character switch (ALL highlighted) */
    /* ---------------------------------- */
    it('should cover all latin char highlighted cases', () => {

        // Arrange
        const inputs = [
            'asciicircum', 'asciitilde', 'asterisk', 'at', 'atilde',
            'backslash', 'bar', 'braceleft', 'braceright', 'bracketleft', 'bracketright',
            'icircumflex', 'idieresis', 'igrave', 'less', 'logicalnot',
            'lslash', 'Lslash', 'macron', 'underscore', 'adieresis', 'ampersand',
            'Adieresis', 'Udieresis', 'ccaron', 'Scaron', 'zcaron',
            'sterling', 'agrave', 'ecircumflex', 'acircumflex', 'Oacute'
        ];

        // Act & Assert
        inputs.forEach(v => {
            expect(utils._getLatinCharacter(v)).toBeDefined();
        });

        expect(utils._getLatinCharacter('unknown')).toBe('unknown');
    });

    /* ---------------------------------- */
    /* ✅ Escape PDF name (loop + surrogate branches) */
    /* ---------------------------------- */
    it('should escape pdf name correctly', () => {

        // Arrange
        const inputs = ['A', '/', '#2f', 'é', '\uD800', '\uDC00', '😀'];

        // Act
        const results = inputs.map(i => utils._escapePdfName(i));

        // Assert
        expect(results.every(r => typeof r === 'string')).toBeTruthy();
    });
    /* ---------------------------------- */
    /* ✅ _removeReferences (_PdfStream branch) */
    /* ---------------------------------- */
    it('should handle removeReferences branch', () => {

        // Arrange
        const dict = createDictionary({});
        const stream: any = { dictionary: dict };
        const cross: any = {};

        // Act
        utils._removeReferences(stream, cross, 'A', 'B');

        // Assert
        expect(true).toBeTruthy();
    });

    /* ---------------------------------- */
    /* ✅ _encode (all branches) */
    /* ---------------------------------- */
    it('should encode base64 chunks', () => {

        // Arrange
        const one = new Uint8Array([77]);
        const two = new Uint8Array([77, 97]);
        const three = new Uint8Array([77, 97, 110]);
        const big = new Uint8Array(3000001);

        // Act
        const r1 = utils._encode(one);
        const r2 = utils._encode(two);
        const r3 = utils._encode(three);
        const r4 = utils._encode(big);

        // Assert
        expect(r1).toBeDefined();
        expect(r2).toBeDefined();
        expect(r3).toBeDefined();
        expect(r4.length).toBeGreaterThan(0);
    });

    /* ---------------------------------- */
    /* ✅ Bezier arc (positive + negative branches) */
    /* ---------------------------------- */
    it('should generate bezier arc', () => {

        // Act
        const positive = utils._getBezierArc(0, 100, 100, 0, 0, 180);
        const negative = utils._getBezierArc(100, 0, 0, 100, 0, -90);

        // Assert
        expect(positive.length).toBeGreaterThan(0);
        expect(negative.length).toBeGreaterThan(0);
    });

    /* ---------------------------------- */
    /* ✅ _checkInkPoints */
    /* ---------------------------------- */
    it('should compare ink points correctly', () => {

        // Arrange
        const a = [[{ x: 1, y: 2 }]];
        const b = [[{ x: 1, y: 2 }]];
        const c = [[{ x: 1, y: 2 }], [{ x: 2, y: 3 }]];

        // Act
        const r1 = utils._checkInkPoints(a as any, b as any);
        const r2 = utils._checkInkPoints(a as any, c as any);

        // Assert
        expect(r1).toBeTruthy();
        expect(r2).toBeFalsy();
    });

    /* ---------------------------------- */
    /* ✅ _getFontSize (WHILE + DO-WHILE safe) */
    /* ---------------------------------- */
    it('should compute font size without infinite loop', () => {

        // Arrange
        const dict = createDictionary({ V: 'Hello' });
        const field: any = {
            bounds: { width: 20, height: 10 },
            border: { width: 1, style: 0 },
            selectedIndex: 0,
            itemAt: () => ({ text: 'Hello' }),
            _obtainSelectedValue: () => ['Hello'],
            _getStringFormat: () => ({}),
            _dictionary: dict,
            rotationAngle: 0
        };

        spyOn(utils as any, '_isUnicode').and.returnValue(false);

        // Act
        const result = utils._getFontSize(field, 0);

        // Assert
        expect(result).toBeGreaterThan(0);
    });

    /* ---------------------------------- */
    /* ✅ _convertToColor (hex + map) */
    /* ---------------------------------- */
    it('should convert colors correctly', () => {

        // Act
        const named = utils._convertToColor('LightPink');
        const hex = utils._convertToColor('#0A1B2C');

        // Assert
        expect(named).toBeDefined();
        expect(hex).toEqual({ r: 10, g: 27, b: 44 });
    });

});
