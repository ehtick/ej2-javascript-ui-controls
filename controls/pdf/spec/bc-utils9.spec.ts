
/* eslint-disable @typescript-eslint/no-explicit-any */

import { _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { _PdfStream } from '../src/pdf/core/base-stream';
import * as fontModule from '../src/pdf/core/fonts/pdf-standard-font';

import * as utils from '../src/pdf/core/utils';
import { _PdfDictionary } from '../src/pdf/core/pdf-primitives';
import {
    PdfAnnotationFlag,
    PdfBorderStyle
} from '../src/pdf/core/enumerator';
import { PdfPageSettings } from '../src/pdf/core/pdf-document';
import { PdfAnnotation, PdfLineAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfField, PdfTextBoxField, PdfComboBoxField } from '../src/pdf/core/form/field';
import { PdfFontFamily, PdfFontStyle, PdfStandardFont } from '../src/pdf/core/fonts/pdf-standard-font';

describe('utils.ts uncovered branch coverage', () => {

    function createDictionary(map: Record<string, any> | undefined = undefined): _PdfDictionary {
        const dict: any = Object.create(_PdfDictionary.prototype);
        dict._map = map ? { ...map } : {};
        dict._updated = false;
        dict.has = jasmine.createSpy('has').and.callFake((key: string) =>
            Object.prototype.hasOwnProperty.call(dict._map, key)
        );
        dict.get = jasmine.createSpy('get').and.callFake((key: string) => dict._map[key]);
        dict.getArray = jasmine.createSpy('getArray').and.callFake((key: string) => dict._map[key]);
        dict.update = jasmine.createSpy('update').and.callFake((key: string, value: any) => {
            dict._map[key] = value;
            dict._updated = true;
        });
        dict.set = jasmine.createSpy('set').and.callFake((key: string, value: any) => {
            dict._map[key] = value;
            dict._updated = true;
        });
        dict.getRaw = jasmine.createSpy('getRaw').and.callFake((key: string) => dict._map[key]);
        dict.forEach = jasmine.createSpy('forEach').and.callFake((callback: (key: any, value: any) => void) => {
            Object.keys(dict._map).forEach((k: string) => callback(k, dict._map[k]));
        });
        return dict as _PdfDictionary;
    }

    function defineValue(obj: any, key: string, value: any): void {
        Object.defineProperty(obj, key, {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }

    function createPage(options: any = undefined): any {
        const width: number = options && typeof options.width !== 'undefined' ? options.width : 300;
        const height: number = options && typeof options.height !== 'undefined' ? options.height : 500;
        const dictMap: any = {};

        if (options && options.hasMediaBox) {
            dictMap.MediaBox = options.mediaBox ? options.mediaBox : [0, 0, width, height];
        }
        if (options && options.hasCropBox) {
            dictMap.CropBox = options.cropBox ? options.cropBox : [0, 0, width, height];
        }

        return {
            size: { width: width, height: height },
            mediaBox: options ? options.mediaBox : undefined,
            cropBox: options ? options.cropBox : undefined,
            _pageDictionary: createDictionary(dictMap)
        };
    }

    beforeEach((): void => {
        jasmine.getEnv().allowRespy(true);
    });

    it('should cover _annotationFlagsToString default flag branch', () => {
        const originalDefault: any = (PdfAnnotationFlag as any).default;
        Object.defineProperty(PdfAnnotationFlag, 'default', {
            value: 1024,
            writable: true,
            configurable: true,
            enumerable: true
        });

        try {
            const value: string = utils._annotationFlagsToString(1024 as PdfAnnotationFlag);
            expect(value).toBe('default');
        } finally {
            Object.defineProperty(PdfAnnotationFlag, 'default', {
                value: originalDefault,
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
    });

    it('should cover _getUpdatedBounds final else branch when page has no cropBox/mediaBox', () => {
        const page: any = createPage({
            width: 200,
            height: 400,
            mediaBox: undefined,
            cropBox: undefined,
            hasMediaBox: false,
            hasCropBox: false
        });

        const result: number[] = utils._getUpdatedBounds([10, 20, 30, 40], page);
        expect(result).toEqual([10, 340, 40, 380]);
    });

    it('should cover _bytesToString empty branch safely', () => {
        expect(utils._bytesToString(new Uint8Array(0))).toBe('');
        expect(utils._bytesToString(undefined as any)).toBe('');
    });

    it('should cover _decodeUnicodeBytes length zero branch safely', () => {
        expect(utils._decodeUnicodeBytes(new Uint8Array(0))).toBe('');
    });

    it('should cover _obtainFontDetails field else branch and use field._circleCaptionFont', () => {
        const circleFont: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 9, PdfFontStyle.regular);

        const field: any = Object.create(PdfField.prototype);
        defineValue(field, '_dictionary', createDictionary({}));
        defineValue(field, '_circleCaptionFont', circleFont);

        const font = utils._obtainFontDetails(undefined as any, undefined as any, field);
        expect(font).toBe(circleFont);
    });

    it('should cover _getFontSize catch branch for multiline PdfTextBoxField => 12.5', () => {
        const field: any = Object.create(PdfTextBoxField.prototype);

        defineValue(field, 'bounds', { width: 100, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'text', 'sample');
        defineValue(field, 'multiLine', true);

        spyOn(PdfStandardFont.prototype, 'measureString').and.throwError('forced');
        const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

        expect(size).toBe(12.5);
    });

    it('should cover _getFontSize catch branch for single-line PdfTextBoxField => 8', () => {
        const field: any = Object.create(PdfTextBoxField.prototype);

        defineValue(field, 'bounds', { width: 100, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'text', 'sample');
        defineValue(field, 'multiLine', false);

        spyOn(PdfStandardFont.prototype, 'measureString').and.throwError('forced');
        const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

        expect(size).toBe(8);
    });

    it('should cover _getFontSize catch branch for non-textbox field => 12', () => {
        const field: any = Object.create(PdfComboBoxField.prototype);

        defineValue(field, 'bounds', { width: 100, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'selectedIndex', 0);
        defineValue(field, 'rotationAngle', 0);
        field.itemAt = jasmine.createSpy('itemAt').and.throwError('forced');

        const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);
        expect(size).toBe(12);
    });

    it('should cover _getFontSize return s === 0 ? 12 : s fallback without throwing', () => {
        const field: any = {
            bounds: { width: 100, height: 20 },
            border: { width: 1, style: PdfBorderStyle.solid }
        };

        const size: number = utils._getFontSize(field as PdfField, PdfFontFamily.helvetica);
        expect(size).toBe(12);
    });

    it('should cover _getFontSize minimumFontSize branch in combo processing safely', () => {
        const field: any = Object.create(PdfComboBoxField.prototype);

        defineValue(field, 'bounds', { width: 5, height: 1 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'rotationAngle', 0);
        defineValue(field, 'selectedIndex', undefined);
        defineValue(field, '_dictionary', createDictionary({ V: 'very-long-text-value' }));

        field._obtainSelectedValue = jasmine.createSpy('_obtainSelectedValue').and.returnValue('very-long-text-value');
        field._getStringFormat = jasmine.createSpy('_getStringFormat').and.returnValue({});
        field.itemAt = jasmine.createSpy('itemAt');

        spyOn(PdfStandardFont.prototype, 'measureString').and.callFake((_text: any) => {
            return {
                width: 10000,
                height: 10000
            } as any;
        });
        spyOn(PdfStandardFont.prototype, 'getLineWidth').and.returnValue(10000);

        const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

        expect(size).toBeGreaterThan(0);
        expect(size).toBeLessThanOrEqual(1);
    });

    it('should cover _mapFont fontFamily.includes("-") and loaded PdfLineAnnotation default size branch', () => {
        const line: any = Object.create(PdfLineAnnotation.prototype);
        defineValue(line, '_isLoaded', true);
        defineValue(line, '_type', 1);
        defineValue(line, '_dictionary', createDictionary({}));
        defineValue(line, '_crossReference', {});
        defineValue(line, '_circleCaptionFont', undefined);

        const font = utils._mapFont('Helvetica-Bold', undefined as any, PdfFontStyle.regular, line);

        expect(font).toBeDefined();
        expect(font.size).toBe(10);
    });

    it('should cover _updatePageSettings rotate >= 360 normalization branch', () => {
        const dict: _PdfDictionary = createDictionary({});
        const settings: any = {
            size: { width: 612, height: 792 },
            rotation: 5
        };

        utils._updatePageSettings(dict, settings as PdfPageSettings);

        expect((dict.update as any).calls.allArgs()).toEqual([
            ['MediaBox', [0, 0, 612, 792]],
            ['CropBox', [0, 0, 612, 792]],
            ['Rotate', 90]
        ]);
    });

    it('should cover _grayToRgba big-endian else branch using global typed-array patch', () => {
        const src: Uint8Array = new Uint8Array([0, 127, 255]);
        const dest: Uint32Array = new Uint32Array(src.length);

        const globalObj: any = Function('return this')();
        const OriginalUint8Array: any = globalObj.Uint8Array;
        const OriginalUint32Array: any = globalObj.Uint32Array;

        class FakeUint32Array {
            public buffer: ArrayBuffer;
            public length: number;
            [index: number]: number;

            constructor(arg: any = undefined) {
                this.buffer = arg instanceof ArrayBuffer ? arg : new ArrayBuffer(4);
                this.length = typeof arg === 'number' ? arg : 1;
                this[0] = 0;
            }
        }

        class FakeUint8Array {
            public length: number;
            [index: number]: number;

            constructor(_arg: any = undefined) {
                this.length = 4;
                this[0] = 0;
            }
        }

        Object.defineProperty(globalObj, 'Uint32Array', {
            value: FakeUint32Array,
            configurable: true
        });
        Object.defineProperty(globalObj, 'Uint8Array', {
            value: FakeUint8Array,
            configurable: true
        });

        try {
            (utils as any)._grayToRgba(src, dest);
        } finally {
            Object.defineProperty(globalObj, 'Uint32Array', {
                value: OriginalUint32Array,
                configurable: true
            });
            Object.defineProperty(globalObj, 'Uint8Array', {
                value: OriginalUint8Array,
                configurable: true
            });
        }

        expect(Array.from(dest)).toEqual([
            (((0 * 0x1010100) | 0x000000ff) >>> 0),
            (((127 * 0x1010100) | 0x000000ff) >>> 0),
            (((255 * 0x1010100) | 0x000000ff) >>> 0)
        ]);
    });

    it('should cover _mapFont with widget/field-safe fallback and not touch rotate/read-only properties', () => {
        const annotation: any = Object.create(PdfAnnotation.prototype);
        defineValue(annotation, '_type', 999);
        defineValue(annotation, '_dictionary', createDictionary({}));
        defineValue(annotation, '_crossReference', {});
        defineValue(annotation, '_circleCaptionFont', new PdfStandardFont(PdfFontFamily.helvetica, 6, PdfFontStyle.regular));

        const font = utils._mapFont('Courier-Bold', 4, PdfFontStyle.bold, annotation);
        expect(font).toBeDefined();
    });

    it('should cover _obtainFontDetails defaultAppearance hyphen substring branch safely', () => {
        const fontDictionary: any = createDictionary({
            BaseFont: _PdfName.get('Helvetica-Bold'),
            Subtype: _PdfName.get('Type1')
        });

        const fonts: any = createDictionary({
            F1: fontDictionary
        });

        const resources: any = createDictionary({
            Font: fonts
        });

        const form: any = {
            _dictionary: createDictionary({
                DR: resources
            }),
            _fontCache: new Map()
        };

        const widget: any = {
            _dictionary: createDictionary({
                DA: '/F1 12 Tf 0 g'
            }),
            _crossReference: {}
        };

        const font: any = utils._obtainFontDetails(form, widget, undefined as any);

        expect(font).toBeDefined();
        expect(font.size).toBe(12);
    });

    it('should cover _obtainFontDetails unicode option lookup branch safely', () => {
        const originalTrueType: any = (fontModule as any).PdfTrueTypeFont;

        function FakePdfTrueTypeFont(data: any, size: any, style: any) {
            this._data = data;
            this.size = size;
            this.style = style;
            this._dictionary = createDictionary({
                BaseFont: _PdfName.get('FakeTrueType')
            });
            this._isUnicode = false;
        }

        Object.defineProperty(fontModule, 'PdfTrueTypeFont', {
            value: FakePdfTrueTypeFont,
            configurable: true
        });

        const fakeFontFile: any = Object.create(_PdfStream.prototype);
        defineValue(fakeFontFile, 'length', 4);
        defineValue(fakeFontFile, 'start', 0);
        defineValue(fakeFontFile, 'end', 4);
        fakeFontFile.getByteRange = jasmine.createSpy('getByteRange').and.returnValue(new Uint8Array([0, 1, 0, 0]));
        fakeFontFile.getBytes = jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([0, 1, 0, 0]));
        defineValue(fakeFontFile, 'buffer', new Uint8Array([0, 1, 0, 0]));
        defineValue(fakeFontFile, 'dictionary', createDictionary({
            Length1: 4,
            Length: 4
        }));
        defineValue(fakeFontFile, 'stream', fakeFontFile);

        const fontDescriptor: any = createDictionary({
            FontFile2: fakeFontFile
        });

        const ref: any = Object.create(_PdfReference.prototype);
        defineValue(ref, 'objectNumber', 1);
        defineValue(ref, 'generationNumber', 0);

        const fetchedDescriptorDictionary: any = createDictionary({
            Type: _PdfName.get('FontDescriptor'),
            FontFile2: fakeFontFile
        });

        const fontDictionary: any = createDictionary({
            BaseFont: _PdfName.get('CustomFont-Bold'),
            Subtype: _PdfName.get('TrueType'),
            FontDescriptor: fontDescriptor,
            RefEntry: ref
        });

        const fonts: any = createDictionary({
            F1: fontDictionary
        });

        const resources: any = createDictionary({
            Font: fonts
        });

        const form: any = {
            _dictionary: createDictionary({
                DR: resources
            }),
            _fontCache: new Map(),
            _crossReference: {
                _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedDescriptorDictionary)
            }
        };

        const field: any = Object.create(PdfTextBoxField.prototype);
        defineValue(field, '_dictionary', createDictionary({
            DA: '/F1 12 Tf 0 g',
            V: 'key1',
            FT: _PdfName.get('Ch'),
            Opt: [
                ['key1', 'Ā'],
                ['dummy'],
                ['x', 'y']
            ]
        }));
        defineValue(field, '_isTextChanged', false);
        defineValue(field, '_circleCaptionFont', undefined);
        defineValue(field, 'multiLine', false);

        try {
            const font: any = utils._obtainFontDetails(form, undefined as any, field);
            expect(font).toBeDefined();
            expect(font._isUnicode).toBe(true);
        } finally {
            Object.defineProperty(fontModule, 'PdfTrueTypeFont', {
                value: originalTrueType,
                configurable: true
            });
        }
    });

    it('should cover _createRandomInRange fallback branch safely without bigint literal syntax', () => {
        const BigIntCtor: any = Function('return BigInt')();
        const globalObj: any = Function('return this')();
        const cryptoObject: any = globalObj.crypto;
        const originalGetRandomValues: any = cryptoObject.getRandomValues;
        let callCount: number = 0;

        cryptoObject.getRandomValues = function (array: any): any {
            let fillValue: number;
            let i: number;
            callCount++;
            fillValue = callCount <= 1000 ? 255 : 0;
            for (i = 0; i < array.length; i++) {
                array[i] = fillValue;
            }
            return array;
        };

        try {
            const min: any = BigIntCtor(10);
            const max: any = BigIntCtor(20);
            const result: any = (utils as any)._createRandomInRange(min, max);

            expect(result.toString()).toBeTruthy();
            expect(callCount).toBe(0);
        } finally {
            cryptoObject.getRandomValues = originalGetRandomValues;
        }
    });

    it('should cover _createRandomInRange fallback branch using a huge sparse range', () => {
        const min: any = Function('return (BigInt(1) << BigInt(4096))')();
        const max: any = Function('return (BigInt(1) << BigInt(4096)) + BigInt(1)')();

        const value: any = (utils as any)._createRandomInRange(min, max);

        expect(value.toString()).toBe(min.toString());
    });

    it('should cover _getUpdatedBounds mediaBox inner else branch', () => {
        const page: any = {
            size: { width: 200, height: 400 },
            mediaBox: [0, 0, 999, 998],
            cropBox: undefined
        };

        const result: number[] = utils._getUpdatedBounds([10, 20, 30, 40], page);

        expect(result).toEqual([10, 340, 40, 380]);
    });

    it('should cover _getFontSize single-line textbox non-exception else branch => 8', () => {
        const field: any = Object.create(PdfTextBoxField.prototype);

        defineValue(field, 'bounds', { width: 100, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'text', 'sample');
        defineValue(field, 'multiLine', false);

        spyOn(PdfStandardFont.prototype, 'measureString').and.returnValue({
            width: 0,
            height: 0
        } as any);

        const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

        expect(size).toBe(8);
    });

    it('should cover _getFontSize catch multiline textbox branch => 12.5', () => {
        const field: any = Object.create(PdfTextBoxField.prototype);

        defineValue(field, 'bounds', { width: 100, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'text', 'sample');
        defineValue(field, 'multiLine', true);

        spyOn(PdfStandardFont.prototype, 'measureString').and.throwError('forced');

        const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

        expect(size).toBe(12.5);
    });


});
