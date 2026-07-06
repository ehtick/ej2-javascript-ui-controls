
import { _mathClamp, _PdfBaseStream, _PdfCrossReference, _PdfDecodeStream, _PdfDictionary, _PdfFlateStream, _PdfJpegStream, _PdfJpxStream, _PdfName, _PdfReference, FormatError, PdfPage, PdfRotationAngle, Rectangle } from '@syncfusion/ej2-pdf';
import * as ImageUtilsModule from '../../src/pdf-data-extract/core/image-extraction/image-utils';
import { _PdfImage, ApplicationPlatform } from '../../src/pdf-data-extract/core/image-extraction/image';
import { _PdfImageResizer } from '../../src/pdf-data-extract/core/image-extraction/image-resizer';
import { ImageFormat } from '../../src/pdf-data-extract/core/enum';
import { imageKind } from '../../src/pdf-data-extract/core/image-extraction/image-utils';
import { _PdfImageProcessor } from '../../src/pdf-data-extract/core/import/decode-image';
import { _PdfColorPalette } from '../../src/pdf-data-extract/core/image-extraction/colorspace';
import { _PdfJpegImage } from '../../src/pdf-data-extract/core/image-extraction/jpeg-image';
import { _PdfJpxImage } from '../../src/pdf-data-extract/core/jpx-image';
import { _PdfColorSpaceUtils } from '../../src/pdf-data-extract/core/image-extraction/colorspace-utils';
import * as UtilsModule from '../../src/pdf-data-extract/core/utils';

import { PdfRedactionRegion } from '../../src/pdf-data-extract/core/redaction/pdf-redaction-region';

class _MockDictionary {
    private _values: Map<string, unknown>;
    private _rawValues: Map<string, unknown>;

    constructor(values: { [key: string]: unknown }, rawValues?: { [key: string]: unknown }) {
        this._values = new Map<string, unknown>();
        this._rawValues = new Map<string, unknown>();

        for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                this._values.set(key, values[key]);
            }
        }

        const actualRawValues: { [key: string]: unknown } = rawValues ? rawValues : values;
        for (const key in actualRawValues) {
            if (Object.prototype.hasOwnProperty.call(actualRawValues, key)) {
                this._rawValues.set(key, actualRawValues[key]);
            }
        }
    }

    has(key: string): boolean {
        return this._values.has(key);
    }

    get(...keys: string[]): unknown {
        for (let i: number = 0; i < keys.length; i++) {
            if (this._values.has(keys[i])) {
                return this._values.get(keys[i]);
            }
        }
        return undefined;
    }

    getRaw(...keys: string[]): unknown {
        for (let i: number = 0; i < keys.length; i++) {
            if (this._rawValues.has(keys[i])) {
                return this._rawValues.get(keys[i]);
            }
        }
        return undefined;
    }

    getArray(...keys: string[]): number[] | null {
        for (let i: number = 0; i < keys.length; i++) {
            if (this._values.has(keys[i])) {
                return this._values.get(keys[i]) as number[];
            }
        }
        return null;
    }
}

class _StubPalette extends _PdfColorPalette {
    usesZeroToOneRange: boolean = false;

    constructor(name: string, numComps: number) {
        super(name, numComps);
    }

    _getRgb(src: Uint8Array | number[], srcOffset: number): Uint8ClampedArray {
        const value0: number = Number(src[srcOffset] || 0);
        const value1: number = Number(src[srcOffset + 1] || 0);
        const value2: number = Number(src[srcOffset + 2] || 0);
        return new Uint8ClampedArray([value0, value1, value2]);
    }

    _getRgbItem(src: unknown, srcOffset: number, dest: Uint8ClampedArray, destOffset: number): void {
        const source: Uint8Array = src as Uint8Array;
        dest[destOffset] = source[srcOffset] || 0;
        dest[destOffset + 1] = source[srcOffset + 1] || 0;
        dest[destOffset + 2] = source[srcOffset + 2] || 0;
    }

    _getRgbBuffer(
        src: unknown,
        srcOffset: number,
        count: number,
        dest: Uint8ClampedArray | Uint8Array,
        destOffset: number,
        bits: number,
        alpha01: number
    ): void {
        const source: Uint8Array = src as Uint8Array;
        let readOffset: number = srcOffset;
        let writeOffset: number = destOffset;

        for (let i: number = 0; i < count; i++) {
            const value: number = source[readOffset] || 0;
            dest[writeOffset++] = value;
            dest[writeOffset++] = value + 1;
            dest[writeOffset++] = value + 2;
            writeOffset += alpha01;
            readOffset += this.numComps > 1 ? this.numComps : 1;
        }
    }

    _getOutputLength(inputLength: number, alpha01: number): number {
        return ((inputLength * (3 + alpha01)) / Math.max(this.numComps, 1)) | 0;
    }

    _isPass(bits: number): boolean {
        return bits === 8;
    }

    async _fillRgb(
        dest: Uint8ClampedArray,
        originalWidth: number,
        originalHeight: number,
        width: number,
        height: number,
        actualHeight: number,
        bpc: number,
        comps: Uint8Array | Uint16Array,
        alpha01: number
    ): Promise<Uint8ClampedArray> {
        let writeOffset: number = 0;
        let readOffset: number = 0;
        const pixelCount: number = Math.min(width * actualHeight, comps.length);

        for (let i: number = 0; i < pixelCount; i++) {
            const value: number = Number(comps[readOffset] || 0);
            dest[writeOffset++] = value;
            dest[writeOffset++] = value;
            dest[writeOffset++] = value;
            writeOffset += alpha01;
            readOffset++;
        }

        return dest;
    }
}

function _setPrivate<T>(target: unknown, key: string, value: T): void {
    (target as { [key: string]: unknown })[key] = value;
}

function _getPrivate<T>(target: unknown, key: string): T {
    return (target as { [key: string]: unknown })[key] as T;
}

async function _expectRejectedWithError(
    action: () => Promise<unknown>,
    errorConstructor: new (...args: never[]) => Error,
    messagePattern: RegExp
): Promise<void> {
    let thrownError: Error | null = null;

    try {
        await action();
    } catch (error) {
        thrownError = error as Error;
    }

    expect(thrownError).not.toBeNull();
    expect(thrownError instanceof errorConstructor).toBeTruthy();
    expect((thrownError as Error).message).toMatch(messagePattern);
}

describe('_PdfImage coverage', () => {
    it('should cover ApplicationPlatform enum values and _findImageFormat helper', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();

        // Act
        const pngFormat: string = image._findImageFormat(ImageFormat.png);
        const jpegFormat: string = image._findImageFormat(ImageFormat.jpeg);

        // Assert
        expect(ApplicationPlatform.typescript).toBe('typescript');
        expect(ApplicationPlatform.javascript).toBe('javascript');
        expect(ApplicationPlatform.angular).toBe('angular');
        expect(ApplicationPlatform.react).toBe('react');
        expect(ApplicationPlatform.vue).toBe('vue');
        expect(ApplicationPlatform.aspnetcore).toBe('aspnetcore');
        expect(ApplicationPlatform.aspnetmvc).toBe('aspnetmvc');

        expect(pngFormat).toBe('image/png');
        expect(jpegFormat).toBe('image/jpeg');
    });

    it('should cover _resizeImageMask for Uint8Array, Uint16Array and Uint32Array destinations', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const source8: Uint8Array = new Uint8Array([1, 2, 3, 4]);
        const source16: Uint16Array = new Uint16Array([10, 20, 30, 40]);
        const source32: Uint32Array = new Uint32Array([100, 200, 300, 400]);

        // Act
        const result8: Uint8Array | Uint16Array | Uint32Array = image._resizeImageMask(source8, 8, 2, 2, 1, 1);
        const result16: Uint8Array | Uint16Array | Uint32Array = image._resizeImageMask(source16, 16, 2, 2, 1, 1);
        const result32: Uint8Array | Uint16Array | Uint32Array = image._resizeImageMask(source32, 32, 2, 2, 1, 1);

        // Assert
        expect(result8 instanceof Uint8Array).toBeTruthy();
        expect(result16 instanceof Uint16Array).toBeTruthy();
        expect(result32 instanceof Uint32Array).toBeTruthy();

        expect(result8[0]).toBe(1);
        expect(result16[0]).toBe(10);
        expect(result32[0]).toBe(100);
    });

    it('should cover _isDefaultDecode when colorSpace is undefined and when colorSpace exists', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, 'decode', [0, 1]);

        // Act
        const defaultDecodeResult: boolean = image._isDefaultDecode();

        _setPrivate(image, 'colorSpace', new _StubPalette('DeviceRGB', 3));
        const definedColorSpaceResult: boolean = image._isDefaultDecode();

        // Assert
        expect(defaultDecodeResult).toBeTruthy();
        expect(definedColorSpaceResult).toBeFalsy();
    });

    it('should cover _getImageData for jpeg, jpx, generic stream and flate stream branches', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, 'width', 2);
        _setPrivate(image, 'height', 2);
        _setPrivate(image, 'smask', null);
        _setPrivate(image, 'mask', null);
        _setPrivate(image, 'forceRgba', false);
        _setPrivate(image, 'forceRgb', false);

        const jpegStream: _PdfJpegStream = Object.create(_PdfJpegStream.prototype) as _PdfJpegStream;
        const jpegBytes: Uint8Array = new Uint8Array([1, 2, 3, 4]);
        const jpegImageObject: {
            getBytes: jasmine.Spy;
            buffer?: Uint8Array;
        } = {
            getBytes: jasmine.createSpy('getBytes').and.returnValue(jpegBytes)
        };

        const jpegParseSpy: jasmine.Spy = spyOn(_PdfJpegImage.prototype, 'parse').and.callFake((): void => {
            return;
        });
        const jpegGetDataSpy: jasmine.Spy = spyOn(_PdfJpegImage.prototype, '_getData').and.returnValue(new Uint8Array([9, 8, 7, 6]));

        const jpxStream: _PdfJpxStream = Object.create(_PdfJpxStream.prototype) as _PdfJpxStream;
        const jpxImageObject: {
            decodeImage: jasmine.Spy;
        } = {
            decodeImage: jasmine.createSpy('decodeImage').and.returnValue(new Uint8Array([4, 3, 2, 1]))
        };

        const genericStream: _PdfBaseStream = {} as _PdfBaseStream;
        const genericImageObject: {
            getBytes: jasmine.Spy;
        } = {
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([5, 6]))
        };

        const flateStream: _PdfFlateStream = Object.create(_PdfFlateStream.prototype) as _PdfFlateStream;
        const flateImageObject: {
            getBytes: jasmine.Spy;
        } = {
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([7, 8]))
        };

        // Act
        const jpegResult: Uint8Array = image._getImageData(4, {
            image: Object.assign(jpegStream, jpegImageObject)
        }) as Uint8Array;

        const jpxResult: Uint8Array = image._getImageData(2, {
            image: Object.assign(jpxStream, jpxImageObject)
        }) as Uint8Array;

        const genericResult: Uint8Array = image._getImageData(2, {
            image: Object.assign(genericStream, genericImageObject)
        }) as Uint8Array;

        const flateResult: Uint8Array = image._getImageData(2, {
            image: Object.assign(flateStream, flateImageObject)
        }) as Uint8Array;

        // Assert
        expect(jpegParseSpy).toHaveBeenCalledWith(jpegBytes);
        expect(jpegGetDataSpy).toHaveBeenCalled();
        expect(jpegResult).toEqual(new Uint8Array([9, 8, 7, 6]));

        expect(jpxImageObject.decodeImage).toHaveBeenCalled();
        expect(jpxResult).toEqual(new Uint8Array([4, 3, 2, 1]));

        expect(genericImageObject.getBytes).toHaveBeenCalled();
        expect(genericResult).toEqual(new Uint8Array([5, 6]));

        expect(flateImageObject.getBytes).toHaveBeenCalled();
        expect(flateResult).toEqual(new Uint8Array([7, 8]));
    });

    it('should cover _initializeFromImage for JPXDecode path with color space parsing and decode arrays', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch')
        } as unknown as _PdfCrossReference;

        const dictionary: _PdfDictionary = new _MockDictionary({
            Filter: _PdfName.get('JPXDecode'),
            Width: 20,
            Height: 10,
            Interpolate: true,
            ImageMask: false,
            BPC: 8,
            Decode: [0, 1, 0, 1, 0, 1],
            SMaskInData: true
        }) as unknown as _PdfDictionary;

        const stream: {
            reset: jasmine.Spy;
        } = {
            reset: jasmine.createSpy('reset')
        };

        const imageObject: {
            dictionary: _PdfDictionary;
            stream: { reset: jasmine.Spy };
            width: number;
            height: number;
            numComps: number;
            bitsPerComponent: number;
        } = {
            dictionary,
            stream,
            width: 0,
            height: 0,
            numComps: 0,
            bitsPerComponent: 0
        };

        const page: PdfPage = { _pageIndex: 0 } as PdfPage;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const parsePropertiesSpy: jasmine.Spy = spyOn(_PdfJpxImage.prototype, '_parseImageProperties').and.returnValue({
            width: 100,
            height: 50,
            componentsCount: 4,
            bitsPerComponent: 8
        });

        const resizeSpy: jasmine.Spy = spyOn(_PdfImageResizer.prototype, '_getReducePowerForJPX').and.returnValue(1);

        const palette: _StubPalette = new _StubPalette('DeviceRGBA', 4);
        const parseColorSpy: jasmine.Spy = spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.returnValue(Promise.resolve(palette));

        // Act
        const result: unknown = await image._initializeFromImage(xref, imageObject, false, callback);

        // Assert
        expect(result).toBe(image);
        expect(parsePropertiesSpy).toHaveBeenCalled();
        expect(stream.reset).toHaveBeenCalled();
        expect(resizeSpy).toHaveBeenCalledWith(100, 50, 4);
        expect(parseColorSpy).toHaveBeenCalled();

        expect(_getPrivate<number>(image, 'width')).toBe(50);
        expect(_getPrivate<number>(image, 'height')).toBe(25);
        expect(_getPrivate<boolean>(image, 'interpolate')).toBeTruthy();
        expect(_getPrivate<boolean>(image, 'imageMask')).toBeFalsy();
        expect(_getPrivate<number>(image, 'bpc')).toBe(8);
        expect(_getPrivate<number>(image, 'numComps')).toBe(4);
        expect(_getPrivate<number[] | null>(image, 'decode')).toEqual([0, 1, 0, 1, 0, 1]);
    });

    it('should cover _initializeFromImage invalid dimension and missing bits per component error branches', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const invalidDimsDictionary: _PdfDictionary = new _MockDictionary({
            Width: 0,
            Height: 0,
            ImageMask: false
        }) as unknown as _PdfDictionary;

        const invalidImageObject: {
            dictionary: _PdfDictionary;
            width?: number;
            height?: number;
            bitsPerComponent?: number;
            numComps?: number;
            fallbackDims?: { width: number; height: number } | null;
        } = {
            dictionary: invalidDimsDictionary,
            fallbackDims: null
        };

        // Act / Assert
        await _expectRejectedWithError(
            async (): Promise<unknown> => image._initializeFromImage(xref, invalidImageObject, false, callback),
            FormatError,
            /Invalid image width/
        );

        const missingBpcDictionary: _PdfDictionary = new _MockDictionary({
            Width: 10,
            Height: 10,
            ImageMask: false,
            ColorSpace: _PdfName.get('DeviceRGB')
        }) as unknown as _PdfDictionary;

        const missingBpcImageObject: {
            dictionary: _PdfDictionary;
            width?: number;
            height?: number;
            bitsPerComponent?: number;
            numComps?: number;
        } = {
            dictionary: missingBpcDictionary,
            numComps: 3
        };

        spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.returnValue(Promise.resolve(new _StubPalette('DeviceRGB', 3)));

        await _expectRejectedWithError(
            async (): Promise<unknown> => new _PdfImage()._initializeFromImage(xref, missingBpcImageObject, false, callback),
            FormatError,
            /Bits per component missing in image/
        );
    });

    it('should cover _initializeFromImage fallback dimensions, imageMask bits default, JBIG2 path, color space fallback and decode branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const dictionary: _PdfDictionary = new _MockDictionary({
            Filter: _PdfName.get('JBIG2Decode'),
            Width: 0,
            Height: 0,
            ImageMask: true,
            Decode: [1, 0]
        }) as unknown as _PdfDictionary;

        const imageObject: {
            dictionary: _PdfDictionary;
            width?: number;
            height?: number;
            bitsPerComponent?: number;
            numComps?: number;
            fallbackDims?: { width: number; height: number };
        } = {
            dictionary,
            fallbackDims: { width: 9, height: 8 }
        };

        // Act
        const result: unknown = await image._initializeFromImage(xref, imageObject, false, callback, null, null, true);

        // Assert
        expect(result).toBe(image);
        expect(_getPrivate<number>(image, 'width')).toBe(9);
        expect(_getPrivate<number>(image, 'height')).toBe(8);
        expect(_getPrivate<boolean>(image, 'imageMask')).toBeTruthy();
        expect(_getPrivate<number>(image, 'bpc')).toBe(1);
        expect(_getPrivate<boolean>(image, 'needsDecode')).toBeFalsy();
    });

    it('should cover _initializeFromImage color space fallback by component count, indexed decode arrays, smask recursion and mask array branch', async () => {
        // Arrange
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const palette: _StubPalette = new _StubPalette('Indexed', 1);
        spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.returnValue(Promise.resolve(palette));

        const smaskDictionary: _PdfDictionary = new _MockDictionary({
            Width: 2,
            Height: 2,
            BPC: 8,
            ColorSpace: _PdfName.get('DeviceGray')
        }) as unknown as _PdfDictionary;

        const smaskImage: {
            dictionary: _PdfDictionary;
            width?: number;
            height?: number;
            bitsPerComponent?: number;
            numComps?: number;
            fallbackDims?: { width: number; height: number } | null;
        } = {
            dictionary: smaskDictionary,
            numComps: 1,
            bitsPerComponent: 8,
            fallbackDims: null
        };

        const imageDictionary: _PdfDictionary = new _MockDictionary({
            Width: 4,
            Height: 4,
            BPC: 8,
            Decode: [0, 255],
            ColorSpace: _PdfName.get('Indexed')
        }) as unknown as _PdfDictionary;

        const imageObject: {
            dictionary: _PdfDictionary;
            width?: number;
            height?: number;
            bitsPerComponent?: number;
            numComps?: number;
        } = {
            dictionary: imageDictionary,
            numComps: 1,
            bitsPerComponent: 8
        };

        const image: _PdfImage = new _PdfImage();

        // Act
        const result: unknown = await image._initializeFromImage(
            xref,
            imageObject,
            false,
            callback,
            smaskImage,
            [0, 10],
            false
        );

        // Assert
        expect(result).toBe(image);
        expect(_getPrivate<number>(image, 'width')).toBe(4);
        expect(_getPrivate<number>(image, 'height')).toBe(4);
        expect(_getPrivate<boolean>(image, 'needsDecode')).toBeTruthy();
        expect(_getPrivate<number[]>(image, 'decodeCoefficients').length).toBe(1);
        expect(_getPrivate<number[]>(image, 'decodeAddends').length).toBe(1);
        expect(_getPrivate<_PdfImage | null>(image, 'smask')).not.toBeNull();
        expect(_getPrivate<unknown>(image, 'mask')).toBeUndefined();
    });

    it('should cover _buildImage wiring smask and mask sources', async () => {
        // Arrange
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const smaskStream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const imageWithSmask: {
            dictionary: _PdfDictionary;
        } = {
            dictionary: new _MockDictionary({ SMask: smaskStream }) as unknown as _PdfDictionary
        };

        const maskStream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        const imageWithMask: {
            dictionary: _PdfDictionary;
        } = {
            dictionary: new _MockDictionary({ Mask: maskStream }) as unknown as _PdfDictionary
        };

        const initializerSpy: jasmine.Spy = spyOn(_PdfImage.prototype, '_initializeFromImage').and.callFake(function(
            this: _PdfImage
        ): Promise<_PdfImage> {
            return Promise.resolve(this);
        });

        // Act
        const smaskResult: _PdfImage = await new _PdfImage()._buildImage(xref, imageWithSmask, false, callback);
        const maskResult: _PdfImage = await new _PdfImage()._buildImage(xref, imageWithMask, false, callback);

        // Assert
        expect(initializerSpy).toHaveBeenCalled();
        expect(smaskResult instanceof _PdfImage).toBeTruthy();
        expect(maskResult instanceof _PdfImage).toBeTruthy();
    });

 
    it('should cover _createMask offscreen canvas branch and resized image branch', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, '_imageFormat', ImageFormat.png);

        const maskDictionary: _PdfDictionary = new _MockDictionary({
            Width: 8,
            Height: 1,
            Interpolate: true,
            Decode: [0, 1]
        }) as unknown as _PdfDictionary;

        const maskImage: {
            dictionary: _PdfDictionary;
            getBytes: jasmine.Spy;
        } = {
            dictionary: maskDictionary,
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([0xff]))
        };

        const resizerSpy: jasmine.Spy = spyOn(_PdfImageResizer.prototype, '_needsToBeResized').and.returnValues(true, false);
        const createImageDataSpy: jasmine.Spy = spyOn(_PdfImageResizer.prototype, '_createImageData').and.returnValue({
            width: 8,
            height: 1,
            marker: 'resized'
        });

        const context: {
            createImageData: jasmine.Spy;
            putImageData: jasmine.Spy;
        } = {
            createImageData: jasmine.createSpy('createImageData').and.callFake((width: number, height: number): ImageData => {
                return new ImageData(width, height);
            }),
            putImageData: jasmine.createSpy('putImageData')
        };

        const canvas: {
            width: number;
            height: number;
            getContext: jasmine.Spy;
            toDataURL: jasmine.Spy;
        } = {
            width: 0,
            height: 0,
            getContext: jasmine.createSpy('getContext').and.returnValue(context as unknown as CanvasRenderingContext2D),
            toDataURL: jasmine.createSpy('toDataURL').and.returnValue('data:image/png;base64,AA==')
        };

        _setPrivate(image, '_canvasRenderCallback', { canvas });
        spyOn(UtilsModule, '_base64ToUint8Array').and.returnValue(new Uint8Array([0]));

        // Act
        const resizedResult: unknown = image._createMask(maskImage, true);
        const canvasResult: Uint8Array = image._createMask(maskImage, true) as Uint8Array;

        // Assert
        expect(resizerSpy).toHaveBeenCalled();
        expect(createImageDataSpy).toHaveBeenCalled();
        expect(resizedResult).toEqual({ width: 8, height: 1, marker: 'resized' });

        expect(canvas.width).toBe(8);
        expect(canvas.height).toBe(1);
        expect(context.putImageData).toHaveBeenCalled();
        expect(canvasResult).toEqual(new Uint8Array([0]));
    });

    it('should cover drawWidth and drawHeight getters', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, 'width', 10);
        _setPrivate(image, 'height', 8);
        _setPrivate(image, 'smask', { width: 15, height: 5 });
        _setPrivate(image, 'mask', { width: 12, height: 20 });

        // Act
        const drawWidth: number = image.drawWidth;
        const drawHeight: number = image.drawHeight;

        // Assert
        expect(drawWidth).toBe(15);
        expect(drawHeight).toBe(20);
    });

    it('should cover _decodeBuffer for bpc 1 and multi-component decode', () => {
        // Arrange
        const toggleImage: _PdfImage = new _PdfImage();
        _setPrivate(toggleImage, 'bpc', 1);
        _setPrivate(toggleImage, 'numComps', 1);

        const toggleBuffer: Uint8Array = new Uint8Array([0, 1, 0, 1]);

        const multiImage: _PdfImage = new _PdfImage();
        _setPrivate(multiImage, 'bpc', 8);
        _setPrivate(multiImage, 'numComps', 2);
        _setPrivate(multiImage, 'width', 2);
        _setPrivate(multiImage, 'height', 1);
        _setPrivate(multiImage, 'decodeAddends', [10, 20]);
        _setPrivate(multiImage, 'decodeCoefficients', [1, 2]);

        const multiBuffer: Uint8Array = new Uint8Array([5, 6, 7, 8]);

        // Act
        toggleImage._decodeBuffer(toggleBuffer);
        multiImage._decodeBuffer(multiBuffer);

        // Assert
        expect(toggleBuffer).toEqual(new Uint8Array([1, 0, 1, 0]));
        expect(multiBuffer[0]).toBe(_mathClamp(10 + 5 * 1, 0, 255));
        expect(multiBuffer[1]).toBe(_mathClamp(20 + 6 * 2, 0, 255));
        expect(multiBuffer[2]).toBe(_mathClamp(10 + 7 * 1, 0, 255));
        expect(multiBuffer[3]).toBe(_mathClamp(20 + 8 * 2, 0, 255));
    });

    it('should cover _getComponents for bpc 8 passthrough, bpc 1 unpacking and multi-bit unpacking', () => {
        // Arrange
        const passthroughImage: _PdfImage = new _PdfImage();
        _setPrivate(passthroughImage, 'bpc', 8);

        const passthroughBuffer: Uint8Array = new Uint8Array([1, 2, 3]);

        const oneBitImage: _PdfImage = new _PdfImage();
        _setPrivate(oneBitImage, 'bpc', 1);
        _setPrivate(oneBitImage, 'width', 3);
        _setPrivate(oneBitImage, 'height', 1);
        _setPrivate(oneBitImage, 'numComps', 1);

        const oneBitBuffer: Uint8Array = new Uint8Array([0b10100000]);

        const twoBitImage: _PdfImage = new _PdfImage();
        _setPrivate(twoBitImage, 'bpc', 2);
        _setPrivate(twoBitImage, 'width', 2);
        _setPrivate(twoBitImage, 'height', 1);
        _setPrivate(twoBitImage, 'numComps', 1);

        const twoBitBuffer: Uint8Array = new Uint8Array([0b01100000]);

        // Act
        const passthroughResult: Uint8Array | Uint16Array | Uint32Array = passthroughImage._getComponents(passthroughBuffer);
        const oneBitResult: Uint8Array | Uint16Array | Uint32Array = oneBitImage._getComponents(oneBitBuffer);
        const twoBitResult: Uint8Array | Uint16Array | Uint32Array = twoBitImage._getComponents(twoBitBuffer);

        // Assert
        expect(passthroughResult).toBe(passthroughBuffer);
        expect(oneBitResult).toEqual(new Uint8Array([1, 0, 1]));
        expect(twoBitResult[0]).toBe(1);
        expect(twoBitResult[1]).toBe(2);
    });

    it('should cover _fillOpacity for smask, image mask, explicit mask array and default opaque alpha', async () => {
        // Arrange
        const imageWithSmask: _PdfImage = new _PdfImage();
        const smaskImage: _PdfImage = new _PdfImage();
        _setPrivate(smaskImage, 'width', 2);
        _setPrivate(smaskImage, 'height', 1);
        _setPrivate(smaskImage, 'bpc', 8);
        _setPrivate(smaskImage, 'matte', null);
        spyOn(smaskImage, '_fillGrayBuffer').and.callFake(async (buffer: Uint8ClampedArray): Promise<void> => {
            buffer[0] = 10;
            buffer[1] = 20;
        });
        _setPrivate(imageWithSmask, 'smask', smaskImage);
        _setPrivate(imageWithSmask, 'mask', null);

        const rgbaSmask: Uint8ClampedArray = new Uint8ClampedArray(8);
        await imageWithSmask._fillOpacity(rgbaSmask, 2, 1, 1, new Uint8ClampedArray([1, 2]));

        const imageWithMaskImage: _PdfImage = new _PdfImage();
        const maskImage: _PdfImage = new _PdfImage();
        _setPrivate(maskImage, 'width', 2);
        _setPrivate(maskImage, 'height', 1);
        _setPrivate(maskImage, 'bpc', 8);
        spyOn(maskImage, '_fillGrayBuffer').and.callFake(async (buffer: Uint8ClampedArray): Promise<void> => {
            buffer[0] = 100;
            buffer[1] = 200;
        });
        _setPrivate(imageWithMaskImage, 'smask', null);
        _setPrivate(imageWithMaskImage, 'mask', maskImage);

        const rgbaMaskImage: Uint8ClampedArray = new Uint8ClampedArray(8);
        await imageWithMaskImage._fillOpacity(rgbaMaskImage, 2, 1, 1, new Uint8ClampedArray([1, 2]));

        const imageWithMaskArray: _PdfImage = new _PdfImage();
        _setPrivate(imageWithMaskArray, 'smask', null);
        _setPrivate(imageWithMaskArray, 'mask', [5, 10]);
        _setPrivate(imageWithMaskArray, 'numComps', 1);

        const rgbaMaskArray: Uint8ClampedArray = new Uint8ClampedArray(8);
        await imageWithMaskArray._fillOpacity(rgbaMaskArray, 2, 1, 1, new Uint8ClampedArray([7, 11]));

        const imageOpaque: _PdfImage = new _PdfImage();
        _setPrivate(imageOpaque, 'smask', null);
        _setPrivate(imageOpaque, 'mask', null);

        const rgbaOpaque: Uint8ClampedArray = new Uint8ClampedArray(8);
        await imageOpaque._fillOpacity(rgbaOpaque, 2, 1, 1, new Uint8ClampedArray([0, 0]));

        // Assert
        expect(rgbaSmask[3]).toBe(10);
        expect(rgbaSmask[7]).toBe(20);

        expect(rgbaMaskImage[3]).toBe(155);
        expect(rgbaMaskImage[7]).toBe(55);

        expect(rgbaMaskArray[3]).toBe(0);
        expect(rgbaMaskArray[7]).toBe(255);

        expect(rgbaOpaque[3]).toBe(255);
        expect(rgbaOpaque[7]).toBe(255);
    });

    it('should cover _fillOpacity unknown mask format error branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, 'smask', null);
        _setPrivate(image, 'mask', 42);

        // Act / Assert
        await _expectRejectedWithError(
            async (): Promise<unknown> => image._fillOpacity(
                new Uint8ClampedArray(4),
                1,
                1,
                1,
                new Uint8ClampedArray([0])
            ),
            FormatError,
            /Unknown mask format/
        );
    });

    it('should cover _undoPreblend for no matte, alpha zero and alpha non-zero branches', () => {
        // Arrange
        const noMatteImage: _PdfImage = new _PdfImage();
        _setPrivate(noMatteImage, 'smask', { matte: null });

        const noMatteBuffer: Uint8ClampedArray = new Uint8ClampedArray([1, 2, 3, 4]);
        noMatteImage._undoPreblend(noMatteBuffer, 1, 1);

        const matteImage: _PdfImage = new _PdfImage();
        _setPrivate(matteImage, 'smask', { matte: new Uint8Array([10, 20, 30]) });
        _setPrivate(matteImage, 'colorSpace', new _StubPalette('DeviceRGB', 3));

        const matteBuffer: Uint8ClampedArray = new Uint8ClampedArray([
            1, 2, 3, 0,
            50, 60, 70, 128
        ]);

        // Act
        matteImage._undoPreblend(matteBuffer, 2, 1);

        // Assert
        expect(noMatteBuffer).toEqual(new Uint8ClampedArray([1, 2, 3, 4]));

        expect(matteBuffer[0]).toBe(255);
        expect(matteBuffer[1]).toBe(255);
        expect(matteBuffer[2]).toBe(255);

        expect(matteBuffer[4]).not.toBe(50);
        expect(matteBuffer[5]).not.toBe(60);
        expect(matteBuffer[6]).not.toBe(70);
    });

    it('should cover _fillGrayBuffer for bpc 1 with decode/no-decode and multi-bit with decodeBuffer', async () => {
        // Arrange
        const oneBitNoDecodeImage: _PdfImage = new _PdfImage();
        _setPrivate(oneBitNoDecodeImage, 'numComps', 1);
        _setPrivate(oneBitNoDecodeImage, 'width', 2);
        _setPrivate(oneBitNoDecodeImage, 'height', 1);
        _setPrivate(oneBitNoDecodeImage, 'bpc', 1);
        _setPrivate(oneBitNoDecodeImage, 'needsDecode', false);
        spyOn(oneBitNoDecodeImage, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([0b10000000])));

        const grayBufferNoDecode: Uint8ClampedArray = new Uint8ClampedArray(2);
        await oneBitNoDecodeImage._fillGrayBuffer(grayBufferNoDecode);

        const oneBitDecodeImage: _PdfImage = new _PdfImage();
        _setPrivate(oneBitDecodeImage, 'numComps', 1);
        _setPrivate(oneBitDecodeImage, 'width', 2);
        _setPrivate(oneBitDecodeImage, 'height', 1);
        _setPrivate(oneBitDecodeImage, 'bpc', 1);
        _setPrivate(oneBitDecodeImage, 'needsDecode', true);
        spyOn(oneBitDecodeImage, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([0b10000000])));

        const grayBufferDecode: Uint8ClampedArray = new Uint8ClampedArray(2);
        await oneBitDecodeImage._fillGrayBuffer(grayBufferDecode);

        const multiBitImage: _PdfImage = new _PdfImage();
        _setPrivate(multiBitImage, 'numComps', 1);
        _setPrivate(multiBitImage, 'width', 2);
        _setPrivate(multiBitImage, 'height', 1);
        _setPrivate(multiBitImage, 'bpc', 8);
        _setPrivate(multiBitImage, 'needsDecode', true);
        spyOn(multiBitImage, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([10, 20])));
        spyOn(multiBitImage, '_decodeBuffer').and.callFake((buffer: Uint8Array): void => {
            buffer[0] = 100;
            buffer[1] = 200;
        });

        const grayBufferMultiBit: Uint8ClampedArray = new Uint8ClampedArray(2);
        await multiBitImage._fillGrayBuffer(grayBufferMultiBit);

        // Assert
        expect(grayBufferNoDecode[0]).toBe(255);
        expect(grayBufferNoDecode[1]).toBe(0);

        expect(grayBufferDecode[0]).toBe(0);
        expect(grayBufferDecode[1]).toBe(255);

        expect(grayBufferMultiBit[0]).toBe(100);
        expect(grayBufferMultiBit[1]).toBe(200);
    });

    it('should cover _fillGrayBuffer non-gray error branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, 'numComps', 3);

        // Act / Assert
        await _expectRejectedWithError(
            async (): Promise<unknown> => image._fillGrayBuffer(new Uint8ClampedArray(3)),
            FormatError,
            /Reading gray scale from a color image/
        );
    });

    it('should cover _createBitmap for rgba32BPP, rgb24BPP, redaction path and missing canvas error', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, '_imageFormat', ImageFormat.png);
        _setPrivate(image, 'needsDecode', false);

        const context: {
            createImageData: jasmine.Spy;
            putImageData: jasmine.Spy;
        } = {
            createImageData: jasmine.createSpy('createImageData').and.callFake((width: number, height: number): ImageData => {
                return new ImageData(width, height);
            }),
            putImageData: jasmine.createSpy('putImageData')
        };

        const canvas: {
            width: number;
            height: number;
            getContext: jasmine.Spy;
            toDataURL: jasmine.Spy;
        } = {
            width: 0,
            height: 0,
            getContext: jasmine.createSpy('getContext').and.returnValue(context as unknown as CanvasRenderingContext2D),
            toDataURL: jasmine.createSpy('toDataURL').and.returnValue('data:image/png;base64,AA==')
        };

        _setPrivate(image, '_canvasRenderCallback', { canvas });
        spyOn(UtilsModule, '_base64ToUint8Array').and.returnValue(new Uint8Array([0]));
        const redactionSpy: jasmine.Spy = spyOn(image, '_processImageRedaction').and.callFake((): void => {
            return;
        });

        _setPrivate(image, '_options', [{} as PdfRedactionRegion]);

        // Act
        const rgbaResult: Uint8Array = await image._createBitmap(
            imageKind.rgba32BPP,
            1,
            1,
            new Uint8ClampedArray([1, 2, 3, 4])
        ) as Uint8Array;

        const convertSpy: jasmine.Spy = spyOn(ImageUtilsModule, '_convertToRGBA').and.callThrough();
        const rgbResult: Uint8Array = await image._createBitmap(
            imageKind.rgb24BPP,
            1,
            1,
            new Uint8ClampedArray([10, 20, 30])
        ) as Uint8Array;

        const errorImage: _PdfImage = new _PdfImage();

        // Assert
        expect(context.putImageData).toHaveBeenCalled();
        expect(redactionSpy).toHaveBeenCalled();
        expect(rgbaResult).toEqual(new Uint8Array([0]));
        expect(convertSpy).toHaveBeenCalled();
        expect(rgbResult).toEqual(new Uint8Array([0]));

        await _expectRejectedWithError(
            async (): Promise<unknown> => errorImage._createBitmap(
                imageKind.rgb24BPP,
                1,
                1,
                new Uint8ClampedArray([1, 2, 3])
            ),
            Error,
            /canvas is not defined/
        );
    });

    it('should cover _getTransferableImage and _getImage null/non-null branches', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, 'interpolate', true);

        const nullResult: unknown = image._getTransferableImage();
        const imageResultNull: unknown = image._getImage(10, 20);

        const transferableSpy: jasmine.Spy = spyOn(image, '_getTransferableImage').and.returnValue({ close: jasmine.createSpy('close') });

        // Act
        const wrappedImage: {
            data: null;
            width: number;
            height: number;
            bitmap: unknown;
            interpolate: boolean;
        } = image._getImage(10, 20) as {
            data: null;
            width: number;
            height: number;
            bitmap: unknown;
            interpolate: boolean;
        };

        // Assert
        expect(nullResult).toBeNull();
        expect(imageResultNull).toBeNull();
        expect(transferableSpy).toHaveBeenCalled();
        expect(wrappedImage.width).toBe(10);
        expect(wrappedImage.height).toBe(20);
        expect(wrappedImage.interpolate).toBeTruthy();
    });

    it('should cover _getImageBytes for JPX decode processor, internal/decode-stream branch and Uint8Array copy branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, 'width', 3);
        _setPrivate(image, 'height', 2);

        const jpxStream: _PdfJpxStream = Object.create(_PdfJpxStream.prototype) as _PdfJpxStream;
        const resetSpyJpx: jasmine.Spy = jasmine.createSpy('reset');
        const jpxImageObject: _PdfJpxStream & {
            reset: jasmine.Spy;
            drawWidth?: number;
            drawHeight?: number;
            forceRGBA?: boolean;
            forceRGB?: boolean;
        } = Object.assign(jpxStream, {
            reset: resetSpyJpx
        });

        _setPrivate(image, 'image', jpxImageObject);
        _setPrivate(image, '_canvasRenderCallback', {
            applicationPlatform: ApplicationPlatform.vue
        });

        const getImageDataSpy: jasmine.Spy = spyOn(image, '_getImageData').and.returnValues(
            new Uint8Array([1, 2, 3]),
            new Uint8Array([4, 5]),
            new Uint8Array([6, 7])
        );

        const processorSpy: jasmine.Spy = spyOn(_PdfImageProcessor.prototype, '_decodeImage').and.returnValue(
            Promise.resolve(new Uint8Array([9, 9, 9]))
        );

        // Act
        const jpxResult: Uint8Array = await image._getImageBytes(3, { drawWidth: 5, drawHeight: 6, forceRGBA: true, forceRGB: true, internal: false });

        const decodeStream: _PdfDecodeStream = Object.create(_PdfDecodeStream.prototype) as _PdfDecodeStream;
        const decodeImageObject: _PdfDecodeStream & { reset: jasmine.Spy } = Object.assign(decodeStream, {
            reset: jasmine.createSpy('reset')
        });
        _setPrivate(image, 'image', decodeImageObject);

        const internalResult: Uint8Array = await image._getImageBytes(2, { internal: true });

        const baseImageObject: {
            reset: jasmine.Spy;
            drawWidth?: number;
            drawHeight?: number;
            forceRGBA?: boolean;
            forceRGB?: boolean;
        } = {
            reset: jasmine.createSpy('reset')
        };
        _setPrivate(image, 'image', baseImageObject);

        const wrappedResult: Uint8Array = await image._getImageBytes(2, { internal: false });

        // Assert
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(processorSpy).toHaveBeenCalled();
        expect(jpxResult).toEqual(new Uint8Array([9, 9, 9]));

        expect(internalResult).toEqual(new Uint8Array([4, 5]));
        expect(wrappedResult).toEqual(new Uint8Array([6, 7]));
    });


    it('should cover _createImageData getImage shortcut and canvas export/redaction branch', async () => {
        // Arrange
        const imageShortcut: _PdfImage = new _PdfImage();
        _setPrivate(imageShortcut, 'width', 1);
        _setPrivate(imageShortcut, 'height', 1);
        _setPrivate(imageShortcut, 'interpolate', true);
        _setPrivate(imageShortcut, 'numComps', 1);
        _setPrivate(imageShortcut, 'bpc', 1);
        _setPrivate(imageShortcut, 'smask', null);
        _setPrivate(imageShortcut, 'mask', null);
        _setPrivate(imageShortcut, 'needsDecode', false);
        _setPrivate(imageShortcut, 'colorSpace', new _StubPalette('DeviceGray', 1));
        spyOn(imageShortcut, '_getImage').and.returnValue({ kind: 'shortcut' });

        const shortcutResult: { kind: string } = await imageShortcut._createImageData(false, false) as { kind: string };

        const imageCanvas: _PdfImage = new _PdfImage();
        _setPrivate(imageCanvas, 'width', 1);
        _setPrivate(imageCanvas, 'height', 1);
        _setPrivate(imageCanvas, 'interpolate', false);
        _setPrivate(imageCanvas, 'numComps', 3);
        _setPrivate(imageCanvas, 'bpc', 8);
        _setPrivate(imageCanvas, 'smask', {
            width: 1,
            height: 1,
            bpc: 8,
            matte: null,
            _fillGrayBuffer: async (buffer: Uint8ClampedArray): Promise<void> => {
                buffer[0] = 255;
            }
        });
        _setPrivate(imageCanvas, 'mask', null);
        _setPrivate(imageCanvas, 'needsDecode', false);
        _setPrivate(imageCanvas, 'colorSpace', new _StubPalette('DeviceRGB', 3));
        _setPrivate(imageCanvas, '_imageFormat', ImageFormat.png);
        _setPrivate(imageCanvas, '_options', [{} as PdfRedactionRegion]);

        const context: {
            createImageData: jasmine.Spy;
            putImageData: jasmine.Spy;
        } = {
            createImageData: jasmine.createSpy('createImageData').and.callFake((width: number, height: number): ImageData => {
                return new ImageData(width, height);
            }),
            putImageData: jasmine.createSpy('putImageData')
        };

        const canvas: {
            width: number;
            height: number;
            getContext: jasmine.Spy;
            toDataURL: jasmine.Spy;
        } = {
            width: 0,
            height: 0,
            getContext: jasmine.createSpy('getContext').and.returnValue(context as unknown as CanvasRenderingContext2D),
            toDataURL: jasmine.createSpy('toDataURL').and.returnValue('data:image/png;base64,AA==')
        };

        spyOn(document, 'createElement').and.returnValue(canvas as unknown as HTMLCanvasElement);
        spyOn(_PdfImageResizer.prototype, '_needsToBeResized').and.returnValue(false);
        spyOn(imageCanvas, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([20, 30, 40])));
        spyOn(imageCanvas, '_getComponents').and.returnValue(new Uint8Array([20, 30, 40]));
        spyOn(imageCanvas, '_processImageRedaction').and.callFake((): void => {
            return;
        });
        spyOn(UtilsModule, '_base64ToUint8Array').and.returnValue(new Uint8Array([9]));

        const canvasResult: Uint8Array = await imageCanvas._createImageData(true, true) as Uint8Array;

        // Assert
        expect(shortcutResult).toEqual({ kind: 'shortcut' });
        expect(context.putImageData).toHaveBeenCalled();
        expect(canvasResult).toEqual(new Uint8Array([9]));
    });

    it('should cover _processImageRedaction, _intersect and _applyRedaction including rotation branches', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, '_bounds', [10, 20, 30, 40]);

        const page: PdfPage = {
            rotation: PdfRotationAngle.angle180,
            cropBox: 'same-box',
            mediaBox: 'same-box',
            size: { width: 100, height: 200 }
        } as unknown as PdfPage;
        _setPrivate(image, '_page', page);

        const options: PdfRedactionRegion[] = [
            { bounds: { x: 12, y: 22, width: 5, height: 5 } } as PdfRedactionRegion
        ];
        _setPrivate(image, '_options', options);

        const imageData: {
            width: number;
            height: number;
            Width: number;
            Height: number;
            data: Uint8ClampedArray;
        } = {
            width: 100,
            height: 100,
            Width: 100,
            Height: 100,
            data: new Uint8ClampedArray(100 * 100 * 4)
        };

        const applySpy: jasmine.Spy = spyOn(image, '_applyRedaction').and.callThrough();

        // Act
        image._processImageRedaction(imageData);

        const intersectedRect: Rectangle = image._intersect(
            { x: 0, y: 0, width: 10, height: 10 },
            { x: 5, y: 5, width: 10, height: 10 }
        ) as Rectangle;

        const disjointRect: Rectangle | null = image._intersect(
            { x: 0, y: 0, width: 1, height: 1 },
            { x: 5, y: 5, width: 1, height: 1 }
        ) as Rectangle | null;

        image._applyRedaction(
            imageData as unknown as ImageData,
            0.2,
            0.4,
            2.2,
            2.6
        );

        // Assert
        expect(applySpy).toHaveBeenCalled();
        expect(_getPrivate<boolean>(image, '_isIntersect')).toBeTruthy();

        expect(intersectedRect.x).toBe(5);
        expect(intersectedRect.y).toBe(5);
        expect(intersectedRect.width).toBe(5);
        expect(intersectedRect.height).toBe(5);

        expect(disjointRect).toBeNull();

        expect(imageData.data[0]).toBe(255);
        expect(imageData.data[1]).toBe(255);
        expect(imageData.data[2]).toBe(255);
        expect(imageData.data[3]).toBe(255);
    });

    it('should cover _processImageRedaction for angle270, angle90 and default rotation branches', () => {
        // Arrange
        const baseBounds: number[] = [10, 20, 30, 40];
        const options: PdfRedactionRegion[] = [
            { bounds: { x: 12, y: 22, width: 5, height: 5 } } as PdfRedactionRegion
        ];

        const rotations: PdfRotationAngle[] = [
            PdfRotationAngle.angle270,
            PdfRotationAngle.angle90,
            PdfRotationAngle.angle0
        ];

        for (let i: number = 0; i < rotations.length; i++) {
            const image: _PdfImage = new _PdfImage();
            _setPrivate(image, '_bounds', baseBounds);
            _setPrivate(image, '_options', options);
            _setPrivate(image, '_page', {
                rotation: rotations[i],
                cropBox: 'same-box',
                mediaBox: 'same-box',
                size: { width: 100, height: 200 }
            } as unknown as PdfPage);

            const imageData: {
                width: number;
                height: number;
                Width: number;
                Height: number;
                data: Uint8ClampedArray;
            } = {
                width: 50,
                height: 60,
                Width: 50,
                Height: 60,
                data: new Uint8ClampedArray(50 * 60 * 4)
            };

            const applySpy: jasmine.Spy = spyOn(image, '_applyRedaction').and.callFake((): void => {
                return;
            });

            // Act
            image._processImageRedaction(imageData);

            // Assert
            expect(applySpy).toHaveBeenCalled();
        }
    });
});


describe('_PdfImage highlighted-line strict coverage', () => {
    
class _MockDictionary {
    private _values: Map<string, unknown>;
    private _rawValues: Map<string, unknown>;

    constructor(values: { [key: string]: unknown }, rawValues?: { [key: string]: unknown }) {
        this._values = new Map<string, unknown>();
        this._rawValues = new Map<string, unknown>();

        for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                this._values.set(key, values[key]);
            }
        }

        const actualRawValues: { [key: string]: unknown } = rawValues ? rawValues : values;
        for (const key in actualRawValues) {
            if (Object.prototype.hasOwnProperty.call(actualRawValues, key)) {
                this._rawValues.set(key, actualRawValues[key]);
            }
        }
    }

    has(key: string): boolean {
        return this._values.has(key);
    }

    get(...keys: string[]): unknown {
        for (let i: number = 0; i < keys.length; i++) {
            if (this._values.has(keys[i])) {
                return this._values.get(keys[i]);
            }
        }
        return undefined;
    }

    getRaw(...keys: string[]): unknown {
        for (let i: number = 0; i < keys.length; i++) {
            if (this._rawValues.has(keys[i])) {
                return this._rawValues.get(keys[i]);
            }
        }
        return undefined;
    }

    getArray(...keys: string[]): number[] | null {
        for (let i: number = 0; i < keys.length; i++) {
            if (this._values.has(keys[i])) {
                return this._values.get(keys[i]) as number[];
            }
        }
        return null;
    }
}

class _StubPalette extends _PdfColorPalette {
    usesZeroToOneRange: boolean = false;

    constructor(name: string, numComps: number) {
        super(name, numComps);
    }

    _getRgb(src: Uint8Array | number[], srcOffset: number): Uint8ClampedArray {
        const v0: number = Number(src[srcOffset] || 0);
        const v1: number = Number(src[srcOffset + 1] || 0);
        const v2: number = Number(src[srcOffset + 2] || 0);
        return new Uint8ClampedArray([v0, v1, v2]);
    }

    _getRgbItem(src: unknown, srcOffset: number, dest: Uint8ClampedArray, destOffset: number): void {
        const source: Uint8Array = src as Uint8Array;
        dest[destOffset] = source[srcOffset] || 0;
        dest[destOffset + 1] = source[srcOffset + 1] || 0;
        dest[destOffset + 2] = source[srcOffset + 2] || 0;
    }

    _getRgbBuffer(
        src: unknown,
        srcOffset: number,
        count: number,
        dest: Uint8ClampedArray | Uint8Array,
        destOffset: number,
        bits: number,
        alpha01: number
    ): void {
        const source: Uint8Array = src as Uint8Array;
        let readOffset: number = srcOffset;
        let writeOffset: number = destOffset;

        for (let i: number = 0; i < count; i++) {
            const value: number = source[readOffset] || 0;
            dest[writeOffset++] = value;
            dest[writeOffset++] = value;
            dest[writeOffset++] = value;
            writeOffset += alpha01;
            readOffset += this.numComps > 1 ? this.numComps : 1;
        }
    }

    _getOutputLength(inputLength: number, alpha01: number): number {
        return ((inputLength * (3 + alpha01)) / Math.max(this.numComps, 1)) | 0;
    }

    _isPass(bits: number): boolean {
        return bits === 8;
    }

    async _fillRgb(
        dest: Uint8ClampedArray,
        originalWidth: number,
        originalHeight: number,
        width: number,
        height: number,
        actualHeight: number,
        bpc: number,
        comps: Uint8Array | Uint16Array,
        alpha01: number
    ): Promise<Uint8ClampedArray> {
        let writeOffset: number = 0;
        let readOffset: number = 0;
        const pixelCount: number = Math.min(width * actualHeight, comps.length);

        for (let i: number = 0; i < pixelCount; i++) {
            const value: number = Number(comps[readOffset] || 0);
            dest[writeOffset++] = value;
            dest[writeOffset++] = value;
            dest[writeOffset++] = value;
            writeOffset += alpha01;
            readOffset++;
        }

        return dest;
    }
}

function _setPrivate<T>(target: unknown, key: string, value: T): void {
    (target as { [key: string]: unknown })[key] = value;
}

function _getPrivate<T>(target: unknown, key: string): T {
    return (target as { [key: string]: unknown })[key] as T;
}

async function _expectRejectedWithError(
    action: () => Promise<unknown>,
    errorConstructor: new (...args: never[]) => Error,
    messagePattern: RegExp
): Promise<void> {
    let thrownError: Error | null = null;

    try {
        await action();
    } catch (error) {
        thrownError = error as Error;
    }

    expect(thrownError).not.toBeNull();
    expect(thrownError instanceof errorConstructor).toBeTruthy();
    expect((thrownError as Error).message).toMatch(messagePattern);
}
   
    it('should cover filter array direct _PdfName path and JBIG2 branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const dictionary: _PdfDictionary = new _MockDictionary({
            Filter: [_PdfName.get('JBIG2Decode')],
            Width: 9,
            Height: 8,
            ImageMask: true,
            Decode: [1, 0]
        }) as unknown as _PdfDictionary;

        const imageObject: {
            dictionary: _PdfDictionary;
        } = {
            dictionary
        };

        // Act
        const result: unknown = await image._initializeFromImage(xref, imageObject, false, callback, null, null, true);

        // Assert
        expect(result).toBe(image);
        expect(_getPrivate<number>(image, 'width')).toBe(9);
        expect(_getPrivate<number>(image, 'height')).toBe(8);
        expect(_getPrivate<boolean>(image, 'imageMask')).toBeTruthy();
        expect(_getPrivate<number>(image, 'bpc')).toBe(1);
    });

    it('should cover missing bitsPerComponent with imageMask true branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const dictionary: _PdfDictionary = new _MockDictionary({
            Width: 7,
            Height: 6,
            ImageMask: true
        }) as unknown as _PdfDictionary;

        const imageObject: {
            dictionary: _PdfDictionary;
        } = {
            dictionary
        };

        // Act
        const result: unknown = await image._initializeFromImage(xref, imageObject, false, callback, null, null, true);

        // Assert
        expect(result).toBe(image);
        expect(_getPrivate<number>(image, 'bpc')).toBe(1);
        expect(_getPrivate<boolean>(image, 'imageMask')).toBeTruthy();
    });

    it('should cover fallback color spaces for 1, 3 and 4 components', async () => {
        // Arrange
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const parseSpy: jasmine.Spy = spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.callFake(
            (colorSpace: unknown): Promise<_StubPalette> => {
                const name: string = (colorSpace as { name: string }).name;
                if (name === 'DeviceGray') {
                    return Promise.resolve(new _StubPalette('DeviceGray', 1));
                }
                if (name === 'DeviceRGB') {
                    return Promise.resolve(new _StubPalette('DeviceRGB', 3));
                }
                return Promise.resolve(new _StubPalette('DeviceCMYK', 4));
            }
        );

        const dictionary: _PdfDictionary = new _MockDictionary({
            Width: 5,
            Height: 5,
            BPC: 8,
            ImageMask: false
        }) as unknown as _PdfDictionary;

        const oneCompImage: _PdfImage = new _PdfImage();
        const threeCompImage: _PdfImage = new _PdfImage();
        const fourCompImage: _PdfImage = new _PdfImage();

        // Act
        await oneCompImage._initializeFromImage(xref, { dictionary, numComps: 1 }, false, callback);
        await threeCompImage._initializeFromImage(xref, { dictionary, numComps: 3 }, false, callback);
        await fourCompImage._initializeFromImage(xref, { dictionary, numComps: 4 }, false, callback);

        // Assert
        expect(parseSpy.calls.count()).toBe(3);
        expect(_getPrivate<_PdfColorPalette>(oneCompImage, 'colorSpace').name).toBe('DeviceGray');
        expect(_getPrivate<_PdfColorPalette>(threeCompImage, 'colorSpace').name).toBe('DeviceRGB');
        expect(_getPrivate<_PdfColorPalette>(fourCompImage, 'colorSpace').name).toBe('DeviceCMYK');
    });

    it('should cover unsupported component count error branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};
        const dictionary: _PdfDictionary = new _MockDictionary({
            Width: 5,
            Height: 5,
            BPC: 8,
            ImageMask: false
        }) as unknown as _PdfDictionary;

        // Act / Assert
        await _expectRejectedWithError(
            async (): Promise<unknown> => image._initializeFromImage(xref, { dictionary, numComps: 2 }, false, callback),
            Error,
            /Images with 2 color components not supported/
        );
    });

    it('should cover JPX smaskInData forcing DeviceRGBA', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const dictionary: _PdfDictionary = new _MockDictionary({
            Filter: [_PdfName.get('JPXDecode')],
            Width: 10,
            Height: 10,
            BPC: 8,
            ColorSpace: _PdfName.get('DeviceRGB'),
            SMaskInData: true
        }) as unknown as _PdfDictionary;

        const imageObject: {
            dictionary: _PdfDictionary;
            stream: { reset: jasmine.Spy };
            width: number;
            height: number;
            numComps: number;
            bitsPerComponent: number;
        } = {
            dictionary,
            stream: { reset: jasmine.createSpy('reset') },
            width: 0,
            height: 0,
            numComps: 0,
            bitsPerComponent: 0
        };

        spyOn(_PdfJpxImage.prototype, '_parseImageProperties').and.returnValue({
            width: 10,
            height: 10,
            componentsCount: 4,
            bitsPerComponent: 8
        });
        spyOn(_PdfImageResizer.prototype, '_getReducePowerForJPX').and.returnValue(0);
        spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.returnValue(
            Promise.resolve(new _StubPalette('DeviceRGBA', 4))
        );

        // Act
        await image._initializeFromImage(xref, imageObject, false, callback);

        // Assert
        expect(_getPrivate<_PdfColorPalette>(image, 'colorSpace').name).toBe('DeviceRGBA');
    });

    it('should cover indexed decode coefficients and addends branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        const dictionary: _PdfDictionary = new _MockDictionary({
            Width: 4,
            Height: 4,
            BPC: 8,
            Decode: [0, 255],
            ColorSpace: _PdfName.get('Indexed')
        }) as unknown as _PdfDictionary;

        spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.returnValue(
            Promise.resolve(new _StubPalette('Indexed', 1))
        );

        // Act
        await image._initializeFromImage(xref, { dictionary, numComps: 1, bitsPerComponent: 8 }, false, callback);

        // Assert
        expect(_getPrivate<boolean>(image, 'needsDecode')).toBeTruthy();
        expect(_getPrivate<number[]>(image, 'decodeCoefficients')[0]).toBe(1);
        expect(_getPrivate<number[]>(image, 'decodeAddends')[0]).toBe(0);
    });

    it('should cover smask fallbackDims assignment and recursive smask branch', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};

        spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.returnValue(
            Promise.resolve(new _StubPalette('DeviceGray', 1))
        );

        const smaskDictionary: _PdfDictionary = new _MockDictionary({
            Width: 2,
            Height: 2,
            BPC: 8,
            ColorSpace: _PdfName.get('DeviceGray')
        }) as unknown as _PdfDictionary;

        const smaskImage: {
            dictionary: _PdfDictionary;
            numComps?: number;
            bitsPerComponent?: number;
            fallbackDims?: { width: number; height: number } | null;
        } = {
            dictionary: smaskDictionary,
            numComps: 1,
            bitsPerComponent: 8,
            fallbackDims: null
        };

        const dictionary: _PdfDictionary = new _MockDictionary({
            Width: 4,
            Height: 4,
            BPC: 8,
            ColorSpace: _PdfName.get('DeviceGray')
        }) as unknown as _PdfDictionary;

        // Act
        await image._initializeFromImage(xref, { dictionary, numComps: 1, bitsPerComponent: 8 }, false, callback, smaskImage, null, false);

        // Assert
        expect(smaskImage.fallbackDims).toEqual({ width: 4, height: 4 });
        expect(_getPrivate<_PdfImage | null>(image, 'smask')).not.toBeNull();
    });

    it('should cover mask base stream imageMask recursive branch and direct mask assignment branch', async () => {
        // Arrange
        const xref: _PdfCrossReference = {} as _PdfCrossReference;
        const callback: { canvas?: HTMLCanvasElement } = {};
        spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.returnValue(
            Promise.resolve(new _StubPalette('DeviceGray', 1))
        );

        const dictionary: _PdfDictionary = new _MockDictionary({
            Width: 2,
            Height: 2,
            BPC: 8,
            ColorSpace: _PdfName.get('DeviceGray')
        }) as unknown as _PdfDictionary;

        const maskStream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        (maskStream as { dictionary: _PdfDictionary }).dictionary = new _MockDictionary({
            ImageMask: true,
            Width: 2,
            Height: 2,
            BPC: 1
        }) as unknown as _PdfDictionary;

        const imageWithMaskStream: _PdfImage = new _PdfImage();
        await imageWithMaskStream._initializeFromImage(
            xref,
            { dictionary, numComps: 1, bitsPerComponent: 8 },
            false,
            callback,
            null,
            maskStream,
            false
        );

        const imageWithDirectMask: _PdfImage = new _PdfImage();
        await imageWithDirectMask._initializeFromImage(
            xref,
            { dictionary, numComps: 1, bitsPerComponent: 8 },
            false,
            callback,
            null,
            [0, 10],
            false
        );

        // Assert
        expect(_getPrivate<unknown>(imageWithMaskStream, 'mask')).not.toBeNull();
        expect(_getPrivate<unknown>(imageWithDirectMask, 'mask')).toEqual([0, 10]);
    });

    it('should cover _createImageData DeviceRGBA default path without offscreen support', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        _setPrivate(image, 'width', 2);
        _setPrivate(image, 'height', 2);
        _setPrivate(image, 'interpolate', false);
        _setPrivate(image, 'numComps', 4);
        _setPrivate(image, 'bpc', 8);
        _setPrivate(image, 'smask', null);
        _setPrivate(image, 'mask', null);
        _setPrivate(image, 'colorSpace', new _StubPalette('DeviceRGBA', 4));

        spyOn(image, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array(16)));

        // Act
        const result: {
            width: number;
            height: number;
            interpolate: boolean;
            kind: number;
            data: Uint8Array;
        } = await image._createImageData() as {
            width: number;
            height: number;
            interpolate: boolean;
            kind: number;
            data: Uint8Array;
        };

        // Assert
        expect(result.kind).toBe(imageKind.rgba32BPP);
        expect(result.width).toBe(2);
        expect(result.height).toBe(2);
        expect(result.data.length).toBe(16);
    });

    it('should cover _createImageData DeviceRGBA offscreen no-resize and must-resize branches', async () => {
        // Arrange
        const noResizeImage: _PdfImage = new _PdfImage();
        _setPrivate(noResizeImage, 'width', 2);
        _setPrivate(noResizeImage, 'height', 2);
        _setPrivate(noResizeImage, 'interpolate', false);
        _setPrivate(noResizeImage, 'numComps', 4);
        _setPrivate(noResizeImage, 'bpc', 8);
        _setPrivate(noResizeImage, 'smask', null);
        _setPrivate(noResizeImage, 'mask', null);
        _setPrivate(noResizeImage, 'colorSpace', new _StubPalette('DeviceRGBA', 4));

        spyOn(noResizeImage, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array(16)));
        spyOn(noResizeImage, '_createBitmap').and.returnValue(Promise.resolve(new Uint8Array([1, 2])));
        const resizerNeedsSpy: jasmine.Spy = spyOn(_PdfImageResizer.prototype, '_needsToBeResized').and.returnValues(false, true);
        const resizerCreateSpy: jasmine.Spy = spyOn(_PdfImageResizer.prototype, '_createImageData').and.returnValue({
            width: 2,
            height: 2,
            marker: 'resized-rgba'
        });

        const resizeImage: _PdfImage = new _PdfImage();
        _setPrivate(resizeImage, 'width', 2);
        _setPrivate(resizeImage, 'height', 2);
        _setPrivate(resizeImage, 'interpolate', false);
        _setPrivate(resizeImage, 'numComps', 4);
        _setPrivate(resizeImage, 'bpc', 8);
        _setPrivate(resizeImage, 'smask', null);
        _setPrivate(resizeImage, 'mask', null);
        _setPrivate(resizeImage, 'colorSpace', new _StubPalette('DeviceRGBA', 4));
        spyOn(resizeImage, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array(16)));

        // Act
        const noResizeResult: Uint8Array = await noResizeImage._createImageData(false, true) as Uint8Array;
        const resizeResult: { width: number; height: number; marker: string } =
            await resizeImage._createImageData(false, true) as { width: number; height: number; marker: string };

        // Assert
        expect(resizerNeedsSpy).toHaveBeenCalled();
        expect(resizerCreateSpy).toHaveBeenCalled();
        expect(noResizeResult).toEqual(new Uint8Array([1, 2]));
        expect(resizeResult).toEqual({ width: 2, height: 2, marker: 'resized-rgba' });
    });

    it('should cover _createImageData raw offscreen createBitmap and imageResizer branches', async () => {
        // Arrange
        const createBitmapImage: _PdfImage = new _PdfImage();
        _setPrivate(createBitmapImage, 'width', 1);
        _setPrivate(createBitmapImage, 'height', 1);
        _setPrivate(createBitmapImage, 'interpolate', false);
        _setPrivate(createBitmapImage, 'numComps', 3);
        _setPrivate(createBitmapImage, 'bpc', 8);
        _setPrivate(createBitmapImage, 'smask', null);
        _setPrivate(createBitmapImage, 'mask', null);
        _setPrivate(createBitmapImage, 'needsDecode', false);
        _setPrivate(createBitmapImage, 'colorSpace', new _StubPalette('DeviceRGB', 3));
        spyOn(createBitmapImage, '_getImage').and.returnValue(null);
        spyOn(createBitmapImage, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([1, 2, 3])));
        spyOn(createBitmapImage, '_createBitmap').and.returnValue(Promise.resolve(new Uint8Array([8])));
        const needsSpy: jasmine.Spy = spyOn(_PdfImageResizer.prototype, '_needsToBeResized').and.returnValues(false, true);
        const resizerCreateSpy: jasmine.Spy = spyOn(_PdfImageResizer.prototype, '_createImageData').and.returnValue({
            width: 1,
            height: 1,
            marker: 'resized-raw'
        });

        const resizeRawImage: _PdfImage = new _PdfImage();
        _setPrivate(resizeRawImage, 'width', 1);
        _setPrivate(resizeRawImage, 'height', 1);
        _setPrivate(resizeRawImage, 'interpolate', false);
        _setPrivate(resizeRawImage, 'numComps', 3);
        _setPrivate(resizeRawImage, 'bpc', 8);
        _setPrivate(resizeRawImage, 'smask', null);
        _setPrivate(resizeRawImage, 'mask', null);
        _setPrivate(resizeRawImage, 'needsDecode', false);
        _setPrivate(resizeRawImage, 'colorSpace', new _StubPalette('DeviceRGB', 3));
        spyOn(resizeRawImage, '_getImage').and.returnValue(null);
        spyOn(resizeRawImage, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([4, 5, 6])));

        // Act
        const createBitmapResult: Uint8Array = await createBitmapImage._createImageData(false, true) as Uint8Array;
        const resizeResult: { width: number; height: number; marker: string } =
            await resizeRawImage._createImageData(false, true) as { width: number; height: number; marker: string };

        // Assert
        expect(needsSpy).toHaveBeenCalled();
        expect(resizerCreateSpy).toHaveBeenCalled();
        expect(createBitmapResult).toEqual(new Uint8Array([8]));
        expect(resizeResult).toEqual({ width: 1, height: 1, marker: 'resized-raw' });
    });
});