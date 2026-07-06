
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
    PdfFormFieldVisibility
} from '../src/pdf/core/enumerator';

import { _PdfDictionary, _PdfName, Dictionary } from '../src/pdf/core/pdf-primitives';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { Size } from '../src/pdf/core/pdf-type';

describe('PDF utility coverage suite (branch-complete)', () => {

    /* ------------------------------------------------------------------ */
    /* Annotation flags                                                    */
    /* ------------------------------------------------------------------ */

    it('covers default annotation flag branch', () => {
        // Arrange
        const flag = PdfAnnotationFlag.default;

        // Act
        const result = _annotationFlagsToString(flag);

        // Assert
        expect(result).toBe('');
    });

    it('covers stringToAnnotationFlags default case', () => {
        expect(_stringToAnnotationFlags('unknown'))
            .toBe(PdfAnnotationFlag.default);
    });

    /* ------------------------------------------------------------------ */
    /* String → PDF string (BOM + fallback)                                */
    /* ------------------------------------------------------------------ */

    it('handles UTF-8 BOM encoded string path', () => {
        const bom = '\xEF\xBB\xBFHello';
        expect(_stringToPdfString(bom)).toBe('ï»¿Hello');
    });

    it('covers non-decoding fallback translate table path', () => {
        expect(_stringToPdfString('ABC')).toBe('ABC');
    });

    /* ------------------------------------------------------------------ */
    /* Point comparison                                                    */
    /* ------------------------------------------------------------------ */

    it('covers arePointsNotEqual early return true', () => {
        const a = [{ x: 1, y: 1 }];
        const b = [{ x: 2, y: 1 }];
        expect(_arePointsNotEqual(a, b)).toBeTruthy();
    });

    /* ------------------------------------------------------------------ */
    /* bytesToString chunked while-loop                                    */
    /* ------------------------------------------------------------------ */

    it('forces chunked bytesToString path (while-loop)', () => {
        const bytes = new Uint8Array(9000);
        bytes.fill(65);

        const result = _bytesToString(bytes, false);
        expect(result.length).toBe(9000);
    });

    /* ------------------------------------------------------------------ */
    /* Hex helpers                                                         */
    /* ------------------------------------------------------------------ */

    it('covers isDirect default branch in hexStringToByteArray', () => {
        const result = _hexStringToByteArray('4142') as Uint8Array;
        expect(result[0]).toBe(65);
        expect(result[1]).toBe(66);
    });

    it('covers "#"-prefixed hex string path', () => {
        expect(_hexStringToString('#4142')).toBe('AB');
    });

    /* ------------------------------------------------------------------ */
    /* Base64 decode / encode while loops                                  */
    /* ------------------------------------------------------------------ */

    it('covers base64 decode normal while path', () => {
        const decoded = _decode('QQ==') as Uint8Array;
        expect(decoded[0]).toBe(65);
    });

    it('covers encode padding === 1 byte (%)', () => {
        const encoded = _encode(new Uint8Array([1]));
        expect(encoded.endsWith('==')).toBeTruthy();
    });

    it('covers encode padding === 2 bytes (%)', () => {
        const encoded = _encode(new Uint8Array([1, 2]));
        expect(encoded.endsWith('=')).toBeTruthy();
    });

    /* ------------------------------------------------------------------ */
    /* getInheritableProperty – while loop & refSet                         */
    /* ------------------------------------------------------------------ */

    it('covers inheritable property loop + stopWhenFound = false', () => {
        const dict = new _PdfDictionary();
        dict.objId = 1;
        dict.update('A', 10);

        const result = _getInheritableProperty(dict, 'A', false, false);
        expect(Array.isArray(result)).toBeTruthy();
        expect(result[0]).toBe(10);
    });

    /* ------------------------------------------------------------------ */
    /* Rectangle parsing branches                                          */
    /* ------------------------------------------------------------------ */

    it('covers widget rectangle negative Y branch', () => {
        const dict = new _PdfDictionary();
        dict.update('Rect', [0, -10, 50, 10]);

        const rect = _parseRectangle(dict, true);
        expect(rect.y).toBeLessThan(0);
    });

    /* ------------------------------------------------------------------ */
    /* calculateBounds – CropBox & MediaBox branches                        */
    /* ------------------------------------------------------------------ */


    it('covers calculateBounds CropBox else-branch', () => {
        // Arrange
        const dict: _PdfDictionary = new _PdfDictionary();
        dict.update('Rect', [0, 0, 10, 10]);

        const pageDictionary: _PdfDictionary = new _PdfDictionary();
        pageDictionary.update('CropBox', [0, 0, 100, 100]);

        const page: PdfPage = {
            size: { width: 100, height: 100 },
            cropBox: [0, 0, 100, 100],
            mediaBox: undefined,
            _pageDictionary: pageDictionary
        } as unknown as PdfPage;

        // Act
        const rect = _calculateBounds(dict, page);

        // Assert
        expect(rect).toEqual({
            x: 0,
            y: 90,
            width: 10,
            height: 10
        });
    });


    it('covers MediaBox adjustment branch', () => {
        // Arrange
        const dict: _PdfDictionary = new _PdfDictionary();
        dict.update('Rect', [10, 10, 20, 20]);

        const pageDictionary: _PdfDictionary = new _PdfDictionary();
        pageDictionary.update('MediaBox', [10, 10, 200, 200]);

        const page: PdfPage = {
            size: { width: 200, height: 200 },
            mediaBox: [10, 10, 200, 200],
            cropBox: undefined,
            _pageDictionary: pageDictionary
        } as unknown as PdfPage;

        // Act
        const rect = _calculateBounds(dict, page);

        // Assert
        expect(rect).toEqual({
            x: 0,
            y: 180,
            width: 10,
            height: 10
        });
    });

    /* ------------------------------------------------------------------ */
    /* getUpdatedBounds – else chains                                      */
    /* ------------------------------------------------------------------ */

    it('covers getUpdatedBounds MediaBox branch', () => {
        // Arrange
        const page: PdfPage = {
            size: { width: 100, height: 100 },
            mediaBox: [10, 10, 100, 100],
            cropBox: undefined
        } as unknown as PdfPage;

        // Act
        const result: number[] = _getUpdatedBounds([5, 5, 10, 10], page);

        // Assert
        expect(result).toEqual([-5, 85, 5, 95]);
    });
    ``

    /* ------------------------------------------------------------------ */
    /* Color parsing                                                       */
    /* ------------------------------------------------------------------ */

    it('covers convertToColor hex regex branch', () => {
        const color: any = _convertToColor('#FF0000');
        expect(color.r).toBe(255);
    });

    it('covers parseColor CMYK branch', () => {
        const color = _parseColor([0, 0, 0, 1]);
        expect(color.r).toBe(0);
    });

    /* ------------------------------------------------------------------ */
    /* Line ending style mappings                                          */
    /* ------------------------------------------------------------------ */

    it('covers reverse map ending style cases', () => {
        expect(_reverseMapEndingStyle(PdfLineEndingStyle.square)).toBe('Square');
        expect(_reverseMapEndingStyle(PdfLineEndingStyle.slash)).toBe('Slash');
    });

    it('covers mapLineEndingStyle default branch', () => {
        expect(_mapLineEndingStyle('unknown'))
            .toBe(PdfLineEndingStyle.none);
    });

    /* ------------------------------------------------------------------ */
    /* Highlight mode                                                      */
    /* ------------------------------------------------------------------ */

    it('covers mapHighlightMode default', () => {
        expect(_mapHighlightMode('X'))
            .toBe(PdfHighlightMode.invert);
    });

    it('covers reverseMapHighlightMode outline branch', () => {
        const name = _reverseMapHighlightMode(PdfHighlightMode.outline);
        expect(name).toEqual(_PdfName.get('O'));
    });

});

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Adjust import paths based on your repo structure */

import * as utils from '../src/pdf/core/utils';
import {

    _PdfReference,

} from '../src/pdf/core/pdf-primitives';
import { PdfForm } from '../src/pdf/core/form/form';
import { PdfComboBoxField, PdfField, PdfTextBoxField } from '../src/pdf/core/form/field';
import {
    PdfNumberStyle,
    PdfBorderStyle,
    PdfDashStyle,

} from '../src/pdf/core/enumerator';
import { _PdfBaseStream, _PdfStream } from '../src/pdf/core/base-stream';
import { PdfAnnotation, PdfRubberStampAnnotation, PdfWidgetAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfCjkFontFamily, PdfFontFamily, PdfFontStyle, PdfStandardFont } from '../src/pdf/core/fonts/pdf-standard-font';

describe('utils uncovered behaviour tests', () => {

    // ------------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------------

    function createDictionary(initial?: Record<string, any>): any {
        const dict: any = Object.create(_PdfDictionary.prototype);
        const store: Map<string, any> = new Map<string, any>();
        if (initial) {
            Object.keys(initial).forEach((k: string) => store.set(k, initial[k]));
        }

        dict._updated = false;

        dict.has = (key: string): boolean => store.has(key);
        dict.get = (key: string): any => store.get(key);
        dict.set = (key: string, value: any): void => { store.set(key, value); };
        dict.update = (key: string, value: any): void => { store.set(key, value); };
        dict.getArray = (key: string): any[] => store.get(key);
        dict.forEach = (callback: (key: any, value: any) => void): void => {
            store.forEach((value: any, key: string) => callback(key, value));
        };
        dict._store = store;
        return dict;
    }

    function createName(name: string): any {
        const pdfName: any = Object.create(_PdfName.prototype);
        pdfName.name = name;
        return pdfName;
    }

    function createReference(objectNumber: number = 1): any {
        const ref: any = Object.create(_PdfReference.prototype);
        ref.objectNumber = objectNumber;
        return ref;
    }

    function createStream(options: any): any {
        const stream: any = Object.create(_PdfStream.prototype);

        if (!options) {
            options = {};
        }

        stream.dictionary = options.dictionary;
        stream.bytes = options.bytes;

        if (typeof options.start !== 'undefined' && options.start !== null) {
            stream.start = options.start;
        } else {
            stream.start = 0;
        }

        if (typeof options.end !== 'undefined' && options.end !== null) {
            stream.end = options.end;
        } else if (options.bytes) {
            stream.end = options.bytes.length;
        } else {
            stream.end = 0;
        }

        if (typeof options.length !== 'undefined' && options.length !== null) {
            stream.length = options.length;
        } else if (options.bytes) {
            stream.length = options.bytes.length;
        } else {
            stream.length = 0;
        }

        if (typeof options.buffer !== 'undefined' && options.buffer !== null) {
            stream.buffer = options.buffer;
        } else {
            stream.buffer = new Uint8Array([]);
        }

        if (typeof options.isImageStream !== 'undefined' && options.isImageStream !== null) {
            stream.isImageStream = options.isImageStream;
        } else {
            stream.isImageStream = false;
        }

        stream.getByteRange = jasmine.createSpy('getByteRange').and.callFake(function (start: number, end: number): Uint8Array {
            if (stream.bytes) {
                return stream.bytes.subarray(start, end);
            }
            return new Uint8Array([]);
        });

        stream.getBytes = jasmine.createSpy('getBytes').and.callFake(function (len?: number): Uint8Array {
            if (typeof len === 'number' && stream.buffer) {
                return stream.buffer.subarray(0, len);
            }
            if (stream.bytes) {
                return stream.bytes;
            }
            if (stream.buffer) {
                return stream.buffer;
            }
            return new Uint8Array([]);
        });

        if (typeof options.getStringValue !== 'undefined' && options.getStringValue !== null) {
            stream.getString = jasmine.createSpy('getString').and.returnValue(options.getStringValue);
        } else {
            stream.getString = jasmine.createSpy('getString').and.returnValue('');
        }

        return stream;
    }

    function createBaseStream(bytes: Uint8Array): any {
        const stream: any = Object.create(_PdfBaseStream.prototype);
        stream.getBytes = jasmine.createSpy('getBytes').and.returnValue(bytes);
        return stream;
    }

    function createField(form: any, dictionary: any): any {
        const field: any = Object.create(PdfField.prototype);
        field.form = form;
        if (dictionary) {
            field._dictionary = dictionary;
        } else {
            field._dictionary = createDictionary();
        }
        return field;
    }

    function createAnnotation(dictionary?: any): any {
        const annot: any = Object.create(PdfAnnotation.prototype);
        if (dictionary) {
            annot._dictionary = dictionary;
        } else {
            annot._dictionary = createDictionary();
        }
        return annot;
    }

    function createWidgetAnnotation(dictionary: any): any {
        const widget: any = Object.create(PdfWidgetAnnotation.prototype);
        if (dictionary) {
            widget._dictionary = dictionary;
        } else {
            widget._dictionary = createDictionary();
        }
        return widget;
    }

    function createForm(dictionary: any): any {
        const form: any = Object.create(PdfForm.prototype);
        if (dictionary) {
            form._dictionary = dictionary;
        } else {
            form._dictionary = createDictionary();
        }
        form._crossReference = { _fetch: jasmine.createSpy('_fetch') };
        form._fontResources = undefined;
        return form;
    }


    // ------------------------------------------------------------------------
    // _getFontFromDescriptor
    // ------------------------------------------------------------------------

    describe('_getFontFromDescriptor', () => {

        it('should read wrapped FontFile2 stream using Length1 branch', () => {
            // Arrange
            const wrapper = {
                stream: {},
                dictionary: createDictionary({ Length1: 3 }),
                buffer: new Uint8Array([21, 22, 23, 24]),
                getBytes: jasmine.createSpy('getBytes')
            };
            const fontDescriptor = createDictionary({ FontFile2: wrapper });
            const dict = createDictionary({ FontDescriptor: fontDescriptor });

            // Act
            const result = utils._getFontFromDescriptor(dict);

            // Assert
            expect(wrapper.getBytes).toHaveBeenCalledWith(3);
            expect(Array.from(result!)).toEqual([21, 22, 23]);
        });

        it('should read wrapped FontFile2 stream using Length branch when Length1 is missing', () => {
            // Arrange
            const wrapper = {
                stream: {},
                dictionary: createDictionary({ Length: 2 }),
                buffer: new Uint8Array([31, 32, 33]),
                getBytes: jasmine.createSpy('getBytes')
            };
            const fontDescriptor = createDictionary({ FontFile2: wrapper });
            const dict = createDictionary({ FontDescriptor: fontDescriptor });

            // Act
            const result = utils._getFontFromDescriptor(dict);

            // Assert
            expect(wrapper.getBytes).toHaveBeenCalledWith(2);
            expect(Array.from(result!)).toEqual([31, 32]);
        });
    });

    // ------------------------------------------------------------------------
    // _checkInkPoints / _updateBounds / _trimTailIfMatches
    // ------------------------------------------------------------------------

    describe('_checkInkPoints', () => {
        it('should return false when lengths are different', () => {
            // Arrange
            const a = [[{ x: 1, y: 2 } as any]];
            const b: any = [];

            // Act
            const result = utils._checkInkPoints(a as any, b as any);

            // Assert
            expect(result).toBeFalsy();
        });


    });



    describe('_trimTailIfMatches', () => {
        it('should return original string when one character of tail does not match', () => {
            // Arrange
            const input = 'helloXYZ';
            const tail = 'XYA';

            // Act
            const result = utils._trimTailIfMatches(input, tail);

            // Assert
            expect(result).toBe('helloXYZ');
        });

        it('should trim exact tail when it matches', () => {
            // Arrange
            const input = 'helloXYZ';
            const tail = 'XYZ';

            // Act
            const result = utils._trimTailIfMatches(input, tail);

            // Assert
            expect(result).toBe('hello');
        });
    });

    // ------------------------------------------------------------------------
    // _getSize / _convertNumber / _arabicToRoman / _arabicToLetter / _appendChar
    // ------------------------------------------------------------------------

    describe('_getSize', () => {
        it('should return 1 for byte-sized value', () => {
            expect(utils._getSize(0xFF)).toBe(1);
        });

        it('should return 2 for ushort-sized value', () => {
            expect(utils._getSize(0x0100)).toBe(2);
        });

        it('should return 3 for three-byte value', () => {
            expect(utils._getSize(0x00FFFF + 1)).toBe(3);
        });

        it('should return 4 for four-byte value', () => {
            // Arrange
            const value = 0xFFFFFF + 1;

            // Act
            const result = utils._getSize(value);

            // Assert
            expect(result).toBe(4);
        });

        it('should return 8 for values greater than uint max', () => {
            expect(utils._getSize(0xFFFFFFFF + 1)).toBe(8);
        });
    });

    describe('_convertNumber', () => {
        it('should return lower roman for PdfNumberStyle.lowerRoman', () => {
            // Arrange
            const value = 14;

            // Act
            const result = utils._convertNumber(value, PdfNumberStyle.lowerRoman);

            // Assert
            expect(result).toBe('xiv');
        });
    });

    describe('_arabicToRoman', () => {
        it('should convert arabic to roman using finite subtractive loop without timeout', () => {
            // Arrange
            const value = 944;

            // Act
            const result = utils._arabicToRoman(value);

            // Assert
            expect(result).toBe('CMXLIV');
        });
    });

    describe('_arabicToLetter', () => {
        it('should handle remainder===0 branch correctly', () => {
            // Arrange
            const value = 26;

            // Act
            const result = utils._arabicToLetter(value);

            // Assert
            expect(result).toBe('Z');
        });

        it('should convert 27 to AA without timeout', () => {
            // Arrange
            const value = 27;

            // Act
            const result = utils._arabicToLetter(value);

            // Assert
            expect(result).toBe('AA');
        });
    });

    describe('_appendChar', () => {
        it('should throw when value is <= 0', () => {
            expect(() => utils._appendChar(0)).toThrowError('Value can not be less 0 and greater 26');
        });

        it('should throw when value is > 26', () => {
            expect(() => utils._appendChar(27)).toThrowError('Value can not be less 0 and greater 26');
        });

        it('should return alphabet for valid range', () => {
            expect(utils._appendChar(1)).toBe('A');
        });
    });

    // ------------------------------------------------------------------------
    // _isNullOrUndefined / _defineProperty / _compressStream
    // ------------------------------------------------------------------------

    describe('_isNullOrUndefined', () => {
        it('should return true when value is not null and not undefined', () => {
            expect(utils._isNullOrUndefined('x')).toBeTruthy();
        });

        it('should return false when value is null', () => {
            expect(utils._isNullOrUndefined(null)).toBeFalsy();
        });

        it('should return false when value is undefined', () => {
            expect(utils._isNullOrUndefined(undefined)).toBeFalsy();
        });
    });

    describe('_defineProperty', () => {
        it('should define enumerable property when serializable=false (default)', () => {
            // Arrange
            const obj: any = {};

            // Act
            const value = utils._defineProperty(obj, 'prop', 123);

            // Assert
            expect(value).toBe(123);
            expect(obj.prop).toBe(123);
            const descriptor = Object.getOwnPropertyDescriptor(obj, 'prop')!;
            expect(descriptor.enumerable).toBeTruthy();
            expect(descriptor.writable).toBeFalsy();
        });

        it('should define non-enumerable property when serializable=true', () => {
            // Arrange
            const obj: any = {};

            // Act
            utils._defineProperty(obj, 'hidden', 456, true);

            // Assert
            const descriptor = Object.getOwnPropertyDescriptor(obj, 'hidden')!;
            expect(descriptor.enumerable).toBeFalsy();
        });
    });

    describe('_compressStream', () => {


        it('should use getString() for non-image stream and return export hex when isExport=true', () => {
            // Arrange
            const baseStream: any = Object.create(_PdfBaseStream.prototype);
            baseStream.dictionary = createDictionary();
            baseStream.getString = jasmine.createSpy('getString').and.returnValue('ABC');

            // Act
            const result = utils._compressStream(baseStream, true);

            // Assert
            expect(baseStream.getString).toHaveBeenCalled();
            expect(typeof result).toBe('string');
            expect(result).toMatch(/^[0-9A-F]*$/);
            expect(baseStream.dictionary.get('Filter').name).toBe('FlateDecode');
        });
    });

    // ------------------------------------------------------------------------
    // _createFontStream / _isUnicode / _convertToHex / _decodeFontFamily
    // ------------------------------------------------------------------------

    describe('_createFontStream', () => {
        it('should read FontFile2 bytes from fetched font descriptor dictionary', () => {
            // Arrange
            const fontFile = createBaseStream(new Uint8Array([1, 2, 3]));
            const fetched = createDictionary({
                SomeKey: createName('FontDescriptor'),
                FontFile2: fontFile
            });
            fetched.forEach = (callback: (key: any, value: any) => void): void => {
                callback('Type', createName('FontDescriptor'));
            };
            fetched.has = (key: string): boolean => key === 'FontFile2';
            fetched.get = (key: string): any => key === 'FontFile2' ? fontFile : undefined;

            const ref = createReference(100);
            const font = createDictionary({ F0: ref });
            const form = createForm(0);
            form._crossReference._fetch.and.returnValue(fetched);

            // Act
            const result = utils._createFontStream(form, font);

            // Assert
            expect(form._crossReference._fetch).toHaveBeenCalledWith(ref);
            expect(Array.from(result!)).toEqual([1, 2, 3]);
        });

        it('should read FontFile3 bytes when FontFile2 is absent', () => {
            // Arrange
            const fontFile3 = createBaseStream(new Uint8Array([9, 8]));
            const fetched = createDictionary();
            fetched.forEach = (callback: (key: any, value: any) => void): void => {
                callback('Type', createName('FontDescriptor'));
            };
            fetched.has = (key: string): boolean => key === 'FontFile3';
            fetched.get = (key: string): any => key === 'FontFile3' ? fontFile3 : undefined;

            const ref = createReference(101);
            const font = createDictionary({ F1: ref });
            const form = createForm(0);
            form._crossReference._fetch.and.returnValue(fetched);

            // Act
            const result = utils._createFontStream(form, font);

            // Assert
            expect(Array.from(result!)).toEqual([9, 8]);
        });
    });

    describe('_isUnicode', () => {
        it('should throw when value is null', () => {
            expect(() => utils._isUnicode(null as any)).toThrowError('ArgumentNullException: value');
        });

        it('should return false for ASCII string', () => {
            expect(utils._isUnicode('Hello')).toBeFalsy();
        });

        it('should return true for non-ASCII string', () => {
            expect(utils._isUnicode('Héllo')).toBeTruthy();
        });
    });

    describe('_convertToHex', () => {
        it('should convert numeric hex char', () => {
            expect(utils._convertToHex('9')).toBe(9);
        });

        it('should convert uppercase hex char', () => {
            expect(utils._convertToHex('A')).toBe(10);
        });

        it('should convert lowercase hex char', () => {
            expect(utils._convertToHex('f')).toBe(15);
        });

        it('should throw for invalid hex char', () => {
            expect(() => utils._convertToHex('G')).toThrowError('Invalid hex character: G');
        });
    });

    describe('_decodeFontFamily', () => {
        it('should decode #xx encoded characters', () => {
            // Arrange
            const input = 'ABC#20DEF#2D';

            // Act
            const result = utils._decodeFontFamily(input);

            // Assert
            expect(result).toBe('ABC DEF-');
        });
    });

    // ------------------------------------------------------------------------
    // _updateDashedBorderStyle / _setRotateAngle / _log2 / _defineLazyProperty
    // ------------------------------------------------------------------------

    describe('_updateDashedBorderStyle', () => {
        it('should set dash style and pattern for dashed border', () => {
            // Arrange
            const border: any = { style: PdfBorderStyle.dashed };
            const parameter: any = { borderPen: {} };

            // Act
            utils._updateDashedBorderStyle(border, parameter);

            // Assert
            expect(parameter.borderPen._dashStyle).toBe(PdfDashStyle.dash);
            expect(parameter.borderPen._dashPattern).toEqual([3]);
        });
    });


    describe('_log2', () => {
        it('should return ceil(log2(x)) for positive x', () => {
            expect(utils._log2(9)).toBe(4);
        });

        it('should return 0 for x <= 0', () => {
            expect(utils._log2(0)).toBe(0);
            expect(utils._log2(-5)).toBe(0);
        });
    });

    describe('_defineLazyProperty', () => {
        it('should define enumerable property by default', () => {
            // Arrange
            const obj: any = {};

            // Act
            const value = utils._defineLazyProperty(obj, 'lazy', 7);

            // Assert
            expect(value).toBe(7);
            const descriptor = Object.getOwnPropertyDescriptor(obj, 'lazy')!;
            expect(descriptor.enumerable).toBeTruthy();
        });

        it('should define non-enumerable property when nonSerializable=true', () => {
            // Arrange
            const obj: any = {};

            // Act
            utils._defineLazyProperty(obj, 'hiddenLazy', 8, true);

            // Assert
            const descriptor = Object.getOwnPropertyDescriptor(obj, 'hiddenLazy')!;
            expect(descriptor.enumerable).toBeFalsy();
        });
    });

    // ------------------------------------------------------------------------
    // _unreachable / _grayToRgba / _isLittleEndian / _extractAttributes
    // ------------------------------------------------------------------------

    describe('_unreachable', () => {
        it('should always throw with provided message', () => {
            expect(() => utils._unreachable('boom')).toThrowError('boom');
        });
    });

    describe('_grayToRgba', () => {
        it('should write RGBA values for little-endian branch', () => {
            // Arrange
            spyOn(utils, '_isLittleEndian').and.returnValue(true);
            const src = new Uint8Array([1, 2]);
            const dest = new Uint32Array(2);

            // Act
            utils._grayToRgba(src, dest);

            // Assert
            expect(dest[0]).toBe(4278255873);
            expect(dest[1]).toBe(4278321666);
        });

        it('should write RGBA values for big-endian branch', () => {
            // Arrange
            spyOn(utils, '_isLittleEndian').and.returnValue(false);
            const src = new Uint8Array([1, 2]);
            const dest = new Uint32Array(2);

            // Act
            utils._grayToRgba(src, dest);

            // Assert
            expect(dest[0]).toBe(4278255873);
            expect(dest[1]).toBe(4278321666);
        });
    });

    describe('_isLittleEndian', () => {
        it('should return the platform endianness as boolean', () => {
            // Arrange / Act
            const result = utils._isLittleEndian();

            // Assert
            expect(typeof result).toBe('boolean');
        });
    });

    describe('_extractAttributes', () => {
        it('should return undefined when sequence length is not 3', () => {
            // Arrange
            const collection: any = {
                _getSequence: jasmine.createSpy('_getSequence').and.returnValue([1, 2])
            };

            // Act
            const result = utils._extractAttributes(collection);

            // Assert
            expect(result).toBeUndefined();
        });

        it('should return undefined when third item does not match required tag metadata', () => {
            // Arrange
            const attributesElement: any = {
                _tagClass: 999,
                _getTagNumber: jasmine.createSpy('_getTagNumber').and.returnValue(999),
                _construction: 999
            };
            const collection: any = {
                _getSequence: jasmine.createSpy('_getSequence').and.returnValue([{}, {}, attributesElement])
            };

            // Act
            const result = utils._extractAttributes(collection);

            // Assert
            expect(result).toBeUndefined();
        });
    });

    // ------------------------------------------------------------------------
    // _areUint8ArraysEqual / _modPow / _modInverse / _bytesToBigInt / _bigIntToBytes
    // ------------------------------------------------------------------------

    describe('_areUint8ArraysEqual', () => {
        it('should return false when lengths differ', () => {
            expect(utils._areUint8ArraysEqual(new Uint8Array([1]), new Uint8Array([1, 2]))).toBeFalsy();
        });

        it('should return false when at least one byte differs', () => {
            expect(utils._areUint8ArraysEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBeFalsy();
        });

        it('should return true when arrays are equal', () => {
            expect(utils._areUint8ArraysEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBeTruthy();
        });
    });

    describe('_modPow', () => {
        it('should compute modular exponentiation without infinite loop', () => {
            // Arrange
            const bigInt = utils._getBigInt();
            const base = bigInt(4);
            const exp = bigInt(13);
            const mod = bigInt(497);

            // Act
            const result = utils._modPow(base, exp, mod);

            // Assert
            expect(result).toBe(bigInt(445));
        });
    });

    describe('_modInverse', () => {
        it('should return 0 when m === 1', () => {
            // Arrange
            const bigInt = utils._getBigInt();

            // Act
            const result = utils._modInverse(bigInt(10), bigInt(1));

            // Assert
            expect(result).toBe(bigInt(0));
        });

        it('should return 1 when loop reaches m === 0 branch', () => {
            // Arrange
            const bigInt = utils._getBigInt();

            // Act
            const result = utils._modInverse(bigInt(2), bigInt(0));

            // Assert
            expect(result).toBe(bigInt(1));
        });

        it('should adjust negative x1 by adding m0', () => {
            // Arrange
            const bigInt = utils._getBigInt();

            // Act
            const result = utils._modInverse(bigInt(3), bigInt(11));

            // Assert
            expect(result).toBe(bigInt(4));
        });
    });

    describe('_bytesToBigInt', () => {
        it('should convert bytes to bigint', () => {
            // Arrange
            const bytes = new Uint8Array([0x01, 0x00]);

            // Act
            const result = utils._bytesToBigInt(bytes);

            // Assert
            expect(result).toBe(utils._getBigInt()(256));
        });
    });

    describe('_bigIntToBytes', () => {
        it('should return [0] when bigint is zero', () => {
            // Arrange
            const bigInt = utils._getBigInt();

            // Act
            const result = utils._bigIntToBytes(bigInt(0));

            // Assert
            expect(Array.from(result)).toEqual([0]);
        });

        it('should convert non-zero bigint to bytes', () => {
            // Arrange
            const bigInt = utils._getBigInt();

            // Act
            const result = utils._bigIntToBytes(bigInt(0x0ABC));

            // Assert
            expect(Array.from(result)).toEqual([0x0A, 0xBC]);
        });
    });

    // ------------------------------------------------------------------------
    // _randomBigInt / _createRandomInRange / _handleExplicitConversion
    // ------------------------------------------------------------------------

    describe('_randomBigInt', () => {
        it('should mask high bits when bitLength is not multiple of 8', () => {
            // Arrange
            spyOn(Math, 'random').and.returnValue(0.99);

            // Act
            const result = utils._randomBigInt(9);

            // Assert
            // 9 bits => top byte masked to 1 bit max
            expect(typeof result).toBe('bigint');
            expect(result <= utils._getBigInt()(0x1FF)).toBeTruthy();
        });
    });

    describe('_createRandomInRange', () => {
        it('should return min when min >= max', () => {
            // Arrange
            const bigInt = utils._getBigInt();

            // Act
            const result = utils._createRandomInRange(bigInt(5), bigInt(5));

            // Assert
            expect(result).toBe(bigInt(5));
        });
    });

    describe('_handleExplicitConversion', () => {
        it('should slice 1 byte for first explicit conversion branch', () => {
            // Arrange
            const value = new Uint8Array(0x4D);
            value[0] = 0x31;

            // Act
            const result = utils._handleExplicitConversion(value);

            // Assert
            expect(result.length).toBe(0x4C);
        });

        it('should slice 2 bytes for second explicit conversion branch', () => {
            // Arrange
            const value = new Uint8Array(0x87);
            value[0] = 0x31;
            value[1] = 0x81;

            // Act
            const result = utils._handleExplicitConversion(value);

            // Assert
            expect(result.length).toBe(0x85);
        });

        it('should slice 1 byte for third explicit conversion branch', () => {
            // Arrange
            const value = new Uint8Array(0x77);
            value[0] = 0x31;

            // Act
            const result = utils._handleExplicitConversion(value);

            // Assert
            expect(result.length).toBe(0x76);
        });

        it('should return original value when no explicit conversion rule matches', () => {
            // Arrange
            const value = new Uint8Array([0x30, 0x01, 0x02]);

            // Act
            const result = utils._handleExplicitConversion(value);

            // Assert
            expect(result).toBe(value);
        });
    });

    // ------------------------------------------------------------------------
    // _pad2 / _convertDateToString / _convertStringToDate
    // ------------------------------------------------------------------------

    describe('_pad2', () => {
        it('should pad single digit number', () => {
            expect(utils._pad2(5)).toBe('05');
        });

        it('should keep double digit number as string', () => {
            expect(utils._pad2(12)).toBe('12');
        });
    });

    describe('_convertDateToString', () => {
        it('should convert date to PDF date string', () => {
            // Arrange
            const date = new Date(Date.UTC(2026, 3, 20, 10, 11, 12));

            // Act
            const result = utils._convertDateToString(date);

            // Assert
            expect(result).toBe('D:20260420101112Z');
        });
    });

    describe('_convertStringToDate', () => {
        it('should parse PDF date with Z timezone', () => {
            // Arrange
            const dateText = 'D:20260420101112Z';

            // Act
            const result = utils._convertStringToDate(dateText);

            // Assert
            expect(result.toISOString()).toBe('2026-04-20T10:11:12.000Z');
        });

        it('should parse PDF date with + timezone offset', () => {
            // Arrange
            const dateText = "D:20260420101112+02'30'";

            // Act
            const result = utils._convertStringToDate(dateText);

            // Assert
            expect(result.toISOString()).toBe('2026-04-20T07:41:12.000Z');
        });

        it('should parse PDF date with - timezone offset', () => {
            // Arrange
            const dateText = "D:20260420101112-02'30'";

            // Act
            const result = utils._convertStringToDate(dateText);

            // Assert
            expect(result.toISOString()).toBe('2026-04-20T12:41:12.000Z');
        });

        it('should apply IST fallback when PDF date has no timezone suffix', () => {
            // Arrange
            const dateText = 'D:20260420101112';

            // Act
            const result = utils._convertStringToDate(dateText);

            // Assert
            expect(result.toISOString()).toBe('2026-04-20T04:41:12.000Z');
        });

        it('should parse normal date string when input does not start with D:', () => {
            // Arrange
            const dateText = '2026-04-20T10:11:12Z';

            // Act
            const result = utils._convertStringToDate(dateText);

            // Assert
            expect(result.toISOString()).toBe('2026-04-20T10:11:12.000Z');
        });
    });

    // ------------------------------------------------------------------------
    // CJK encoding/system info/family resolution
    // ------------------------------------------------------------------------

    describe('_getCjkEncoding', () => {
        it('should return UniCNS-UCS2-H for monotypeHeiMedium', () => {
            expect(utils._getCjkEncoding(PdfCjkFontFamily.monotypeHeiMedium).name).toBe('UniCNS-UCS2-H');
        });

        it('should return UniCNS-UCS2-H for monotypeSungLight', () => {
            expect(utils._getCjkEncoding(PdfCjkFontFamily.monotypeSungLight).name).toBe('UniCNS-UCS2-H');
        });

        it('should return UniGB-UCS2-H for sinoTypeSongLight', () => {
            expect(utils._getCjkEncoding(PdfCjkFontFamily.sinoTypeSongLight).name).toBe('UniGB-UCS2-H');
        });
    });

    describe('_getCjkSystemInfo', () => {
        it('should return CNS1 and supplement "0" for monotypeHeiMedium', () => {
            // Arrange
            const result = utils._getCjkSystemInfo(PdfCjkFontFamily.monotypeHeiMedium);

            // Assert
            expect(result.get('Registry')).toBe('Adobe');
            expect(result.get('Ordering')).toBe('CNS1');
            expect(result.get('Supplement')).toBe('0');
        });

        it('should return CNS1 and supplement "0" for monotypeSungLight', () => {
            // Arrange
            const result = utils._getCjkSystemInfo(PdfCjkFontFamily.monotypeSungLight);

            // Assert
            expect(result.get('Ordering')).toBe('CNS1');
            expect(result.get('Supplement')).toBe('0');
        });

        it('should return GB1 and supplement 2 for sinoTypeSongLight', () => {
            // Arrange
            const result = utils._getCjkSystemInfo(PdfCjkFontFamily.sinoTypeSongLight);

            // Assert
            expect(result.get('Ordering')).toBe('GB1');
            expect(result.get('Supplement')).toBe(2);
        });
    });

    describe('_resolveStandardFontFamily', () => {
        it('should resolve ZapfDingbats font family', () => {
            expect(utils._resolveStandardFontFamily('ZapfDingbats-Regular')).toBe(PdfFontFamily.zapfDingbats);
        });

        it('should fallback to helvetica when font is unknown', () => {
            expect(utils._resolveStandardFontFamily('Unknown-Font')).toBe(PdfFontFamily.helvetica);
        });
    });

    describe('_resolveCjkFontFamily', () => {
        it('should resolve HYSMyeongJo variations', () => {
            expect(utils._resolveCjkFontFamily('HYSMyeongJo-Medium')).toBe(PdfCjkFontFamily.hanyangSystemsShinMyeongJoMedium);
            expect(utils._resolveCjkFontFamily('HYSMyeongJo-Medium,BoldItalic')).toBe(PdfCjkFontFamily.hanyangSystemsShinMyeongJoMedium);
            expect(utils._resolveCjkFontFamily('HYSMyeongJo-Medium,Bold')).toBe(PdfCjkFontFamily.hanyangSystemsShinMyeongJoMedium);
            expect(utils._resolveCjkFontFamily('HYSMyeongJo-Medium,Italic')).toBe(PdfCjkFontFamily.hanyangSystemsShinMyeongJoMedium);
        });

        it('should resolve MHei variations', () => {
            expect(utils._resolveCjkFontFamily('MHei-Medium')).toBe(PdfCjkFontFamily.monotypeHeiMedium);
            expect(utils._resolveCjkFontFamily('MHei-Medium,BoldItalic')).toBe(PdfCjkFontFamily.monotypeHeiMedium);
            expect(utils._resolveCjkFontFamily('MHei-Medium,Bold')).toBe(PdfCjkFontFamily.monotypeHeiMedium);
            expect(utils._resolveCjkFontFamily('MHei-Medium,Italic')).toBe(PdfCjkFontFamily.monotypeHeiMedium);
        });

        it('should resolve MSung variations', () => {
            expect(utils._resolveCjkFontFamily('MSung-Light')).toBe(PdfCjkFontFamily.monotypeSungLight);
            expect(utils._resolveCjkFontFamily('MSung-Light,BoldItalic')).toBe(PdfCjkFontFamily.monotypeSungLight);
            expect(utils._resolveCjkFontFamily('MSung-Light,Bold')).toBe(PdfCjkFontFamily.monotypeSungLight);
            expect(utils._resolveCjkFontFamily('MSung-Light,Italic')).toBe(PdfCjkFontFamily.monotypeSungLight);
        });

        it('should resolve STSong variations', () => {
            expect(utils._resolveCjkFontFamily('STSong-Light')).toBe(PdfCjkFontFamily.sinoTypeSongLight);
            expect(utils._resolveCjkFontFamily('STSong-Light,BoldItalic')).toBe(PdfCjkFontFamily.sinoTypeSongLight);
            expect(utils._resolveCjkFontFamily('STSong-Light,Bold')).toBe(PdfCjkFontFamily.sinoTypeSongLight);
            expect(utils._resolveCjkFontFamily('STSong-Light,Italic')).toBe(PdfCjkFontFamily.sinoTypeSongLight);
        });

        it('should throw for unknown CJK font family', () => {
            expect(() => utils._resolveCjkFontFamily('Unknown-CJK')).toThrowError('Unknown CJK font family for: Unknown-CJK');
        });
    });

    // ------------------------------------------------------------------------
    // _padStart / _bytesToHex
    // ------------------------------------------------------------------------

    describe('_padStart', () => {
        it('should return original string when already long enough', () => {
            expect(utils._padStart('abcd', 2, '0')).toBe('abcd');
        });

        it('should repeat padString when remaining length is greater than padString length', () => {
            // Arrange
            const value = '1';

            // Act
            const result = utils._padStart(value, 5, 'ab');

            // Assert
            expect(result).toBe('abab1');
        });
    });

    describe('_bytesToHex', () => {
        it('should convert bytes to uppercase hex string', () => {
            // Arrange
            const bytes = new Uint8Array([0x0a, 0xbc, 0x01]);

            // Act
            const result = utils._bytesToHex(bytes);

            // Assert
            expect(result).toBe('0ABC01');
        });
    });
});


