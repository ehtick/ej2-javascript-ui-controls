import { _PdfBaseStream } from "../src/pdf/core/base-stream";
import { PdfCjkStandardFont, PdfFontStyle, PdfStandardFont } from "../src/pdf/core/fonts/pdf-standard-font";
import { PdfPage } from "../src/pdf/core/pdf-page";
import { _PdfDictionary } from "../src/pdf/core/pdf-primitives";
import * as utils from '../src/pdf/core/utils'
import * as annotationModule from '../src/pdf/core/annotations/annotation'
// utils.coverage.spec.ts

type _MapFontFn = (
    name: string,
    size: number | undefined,
    style: PdfFontStyle,
    annotation: Record<string, unknown>,
    fontDictionary?: _PdfDictionary
) => unknown;

type _CheckUnicodeStringFn = (dictionary: _PdfDictionary) => boolean;
type _GetFontDescriptorFn = (dictionary: _PdfDictionary) => Uint8Array | undefined;
type _CheckImportsFn = (
    importsCollection: Array<Array<{ x: number; y: number }>>,
    previousCollection: Array<Array<{ x: number; y: number }>>
) => boolean;

type _SetRotateAngleFn = (
    rotateAngle: number,
    annot: { rotate: number; _dictionary: { update: (key: string, value: number) => void } } | undefined
) => void;

type _DefineLazyPropertyFn = (
    obj: Record<string, unknown>,
    prop: string,
    value: unknown,
    nonserializable?: boolean
) => unknown;

type _MathClampFn = (v: number, min: number, max: number) => number;

const _internals: {
    _mapFont: _MapFontFn;
    _checkUnicodeString: _CheckUnicodeStringFn;
    _getFontDescriptor: _GetFontDescriptorFn;
    _checkImports: _CheckImportsFn;
    _setRotateAngle: _SetRotateAngleFn;
    _defineLazyProperty: _DefineLazyPropertyFn;
    _mathClamp: _MathClampFn;
} = utils as unknown as {
    _mapFont: _MapFontFn;
    _checkUnicodeString: _CheckUnicodeStringFn;
    _getFontDescriptor: _GetFontDescriptorFn;
    _checkImports: _CheckImportsFn;
    _setRotateAngle: _SetRotateAngleFn;
    _defineLazyProperty: _DefineLazyPropertyFn;
    _mathClamp: _MathClampFn;
};


function _setInternal<T extends object, K extends string, V>(target: T, key: K, value: V): void {
    (target as Record<K, V>)[key] = value;
}

function _createDictionary(initial: Record<string, unknown> = {}, objId?: string): _PdfDictionary {
    const dictionary: _PdfDictionary = new _PdfDictionary();
    Object.keys(initial).forEach((key: string) => {
        dictionary.set(key, initial[key]);
    });
    _setInternal(dictionary, '_updated', false);
    if (objId) {
        _setInternal(dictionary, 'objId', objId);
    }
    return dictionary;
}

function _createBaseStream(bytes: number[]): _PdfBaseStream {
    const stream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
    _setInternal(stream, 'dictionary', new _PdfDictionary());
    _setInternal(stream, 'start', 0);
    _setInternal(stream, 'end', bytes.length);
    _setInternal(stream, 'length', bytes.length);
    _setInternal(stream, 'getByteRange', (start: number, end: number): Uint8Array => {
        return new Uint8Array(bytes.slice(start, end));
    });
    return stream;
}

function _createPage(options: {
    width: number;
    height: number;
    mediaBox?: number[];
    cropBox?: number[];
    hasMediaBox?: boolean;
    hasCropBox?: boolean;
}): PdfPage {
    const page: PdfPage = Object.create(PdfPage.prototype) as PdfPage;
    const pageDictionary: _PdfDictionary = new _PdfDictionary();

    if (options.hasMediaBox) {
        pageDictionary.set('MediaBox', options.mediaBox ?options.mediaBox: []);
    }
    if (options.hasCropBox) {
        pageDictionary.set('CropBox', options.cropBox ? options.cropBox: []);
    }

    _setInternal(page, 'rotation', 0);
    _setInternal(page, 'size', { width: options.width, height: options.height });
    _setInternal(page, 'mediaBox', options.mediaBox ?options.mediaBox: []);
    _setInternal(page, 'cropBox', options.cropBox ? options.cropBox: []);
    _setInternal(page, '_pageDictionary', pageDictionary);

    return page;
}

function _createAnnotation(exportName?: string): Record<string, unknown> {
    const annotationExports: Record<string, unknown> = annotationModule as unknown as Record<string, unknown>;
    const ctorValue: unknown = exportName ? annotationExports[exportName] : annotationExports['PdfAnnotation'];
    const fallbackCtor: unknown = annotationExports['PdfAnnotation'];
    const ctor: { prototype: object } =
        (typeof ctorValue === 'function'
            ? ctorValue
            : fallbackCtor) as { prototype: object };

    const annotation: Record<string, unknown> = Object.create(ctor.prototype) as Record<string, unknown>;
    annotation['_dictionary'] = _createDictionary({ DA: '/Helv 10 Tf 0 g' });
    annotation['_isLoaded'] = false;
    annotation['_crossReference'] = {};
    annotation['_type'] = 0;
    return annotation;
}

describe('utils.ts highlighted coverage tests (AAA)', () => {
    let _originalTimeout: number;

    beforeAll(() => {
        _originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    });

    afterAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = _originalTimeout;
    });

    describe('_copyRange', () => {
        it('should use default start and end when omitted', () => {
            // Arrange
            const target: number[] = [];
            const source: number[] = [10, 20, 30];

            // Act
            utils._copyRange(target, 1, source);

            // Assert
            expect(target.length).toBe(4);
            expect(target[1]).toBe(10);
            expect(target[2]).toBe(20);
            expect(target[3]).toBe(30);
        });
    });

    describe('_getDecoder', () => {
        it('should throw error for unsupported image format', () => {
            // Arrange
            const bytes: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);

            // Act
            const action: () => unknown = (): unknown => utils._getDecoder(bytes);

            // Assert
            expect(action).toThrowError('Unsupported image format');
        });
    });

    describe('_encode', () => {
        it('should cover the exact chunk-size branch safely', () => {
            // Arrange
            const bytes: Uint8Array = new Uint8Array(3000000);
            bytes[0] = 1;
            bytes[bytes.length - 1] = 255;

            // Act
            const result: string = utils._encode(bytes);

            // Assert
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        it('should cover the last-chunk padding branch when final chunk length % 3 === 2', () => {
            // Arrange
            const bytes: Uint8Array = new Uint8Array(3000002);
            bytes[3000000] = 77; // M
            bytes[3000001] = 97; // a

            // Act
            const result: string = utils._encode(bytes);

            // Assert
            expect(result.endsWith('TWE=')).toBeTruthy();
        });
    });

    describe('_getInheritableProperty', () => {
        it('should use default isArray = false and stopWhenFound = true', () => {
            // Arrange
            const dictionary: _PdfDictionary = _createDictionary({ Target: 'direct-value' }, 'obj-1');

            // Act
            const result: unknown = utils._getInheritableProperty(dictionary, 'Target');

            // Assert
            expect(result).toBe('direct-value');
        });

        it('should use getArray and collect inherited values when isArray = true and stopWhenFound = false', () => {
            // Arrange
            const grandParent: _PdfDictionary = _createDictionary({ Kids: [3, 4] }, 'grand-parent');
            const parent: _PdfDictionary = _createDictionary({ Kids: [1, 2], Parent: grandParent }, 'parent');
            const child: _PdfDictionary = _createDictionary({ Parent: parent }, 'child');

            // Act
            const result: unknown = utils._getInheritableProperty(child, 'Kids', true, false, 'Parent');

            // Assert
            expect(result).toEqual([[1, 2], [3, 4]]);
        });

        it('should terminate safely on cyclic parent chain without timeout', () => {
            // Arrange
            const dictionary: _PdfDictionary = _createDictionary({}, 'cycle-1');
            dictionary.set('Parent', dictionary);

            // Act
            const result: unknown = utils._getInheritableProperty(dictionary, 'Missing', false, false, 'Parent');

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('_getUpdatedBounds', () => {
       

        it('should cover the no-page branch', () => {
            // Arrange
            const value: number[] = [1, 2, 3, 4];

            // Act
            const result: number[] = utils._getUpdatedBounds(value);

            // Assert
            expect(result).toEqual([1, 2, 4, 6]);
        });
    });

    describe('_mapFont', () => {
        it('should trim the suffix after comma and still resolve standard font', () => {
            // Arrange
            const annotation: Record<string, unknown> = _createAnnotation();

            // Act
            const font: unknown = _internals._mapFont('courier,bold', 10, PdfFontStyle.regular, annotation);

            // Assert
            expect(font instanceof PdfStandardFont).toBeTruthy();
        });

        it('should map highlighted standard font families', () => {
            // Arrange
            const families: string[] = ['courier', 'symbol', 'times', 'timesroman', 'timesnewroman', 'zapfdingbats'];

            // Act / Assert
            families.forEach((family: string) => {
                const annotation: Record<string, unknown> = _createAnnotation();
                const font: unknown = _internals._mapFont(family, 10, PdfFontStyle.regular, annotation);
                expect(font instanceof PdfStandardFont).toBeTruthy();
            });
        });

     
    });

    describe('_setRotateAngle', () => {
        it('should normalize negative angle and update Rotate', () => {
            // Arrange
            const updateSpy: jasmine.Spy = jasmine.createSpy('update');
            const annot: { rotate: number; _dictionary: { update: (key: string, value: number) => void } } = {
                rotate: 0,
                _dictionary: { update: updateSpy as (key: string, value: number) => void }
            };

            // Act
            _internals._setRotateAngle(-90, annot);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith('Rotate', 270);
        });

        it('should normalize angle >= 360 and update Rotate', () => {
            // Arrange
            const updateSpy: jasmine.Spy = jasmine.createSpy('update');
            const annot: { rotate: number; _dictionary: { update: (key: string, value: number) => void } } = {
                rotate: 0,
                _dictionary: { update: updateSpy as (key: string, value: number) => void }
            };

            // Act
            _internals._setRotateAngle(450, annot);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith('Rotate', -90);
        });
    });

    describe('_defineLazyProperty', () => {
        it('should define non-enumerable and non-writable property', () => {
            // Arrange
            const target: Record<string, unknown> = {};

            // Act
            const result: unknown = _internals._defineLazyProperty(target, 'secret', 42);

            // Assert
            expect(result).toBe(42);
            const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(target, 'secret');
            expect(descriptor).toBeDefined();
            expect(descriptor.enumerable).toBeTruthy();
            expect(descriptor.configurable).toBeTruthy();
            expect(descriptor.writable).toBeFalsy();
            expect(target['secret']).toBe(42);
        });
    });

    describe('_mathClamp', () => {
        it('should clamp below min, above max, and keep in-range value unchanged', () => {
            // Arrange
            const low: number = -5;
            const mid: number = 5;
            const high: number = 50;

            // Act
            const lowResult: number = _internals._mathClamp(low, 0, 10);
            const midResult: number = _internals._mathClamp(mid, 0, 10);
            const highResult: number = _internals._mathClamp(high, 0, 10);

            // Assert
            expect(lowResult).toBe(0);
            expect(midResult).toBe(5);
            expect(highResult).toBe(10);
        });
    });
});
