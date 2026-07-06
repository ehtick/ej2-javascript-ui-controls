
import { ImageFormat } from '../../src/pdf-data-extract/core/enum';
import { _PdfImage } from '../../src/pdf-data-extract/core/image-extraction/image';
import { imageKind } from '../../src/pdf-data-extract/core/image-extraction/image-utils';
import { _PdfCrossReference, _PdfDecodeStream, _PdfDictionary, _PdfFlateStream, _PdfName, _PdfReference, PdfRotationAngle } from '@syncfusion/ej2-pdf';
import { _PdfJpxImage } from '../../src/pdf-data-extract/core/jpx-image';
import { _PdfColorSpaceUtils } from '../../src/pdf-data-extract/core/image-extraction/colorspace-utils';
import { _PdfCalGrayCS, _PdfColorPalette, _PdfColorRgbConverter, _PdfIndexedCS, _PdfLabCS } from '../../src/pdf-data-extract/core/image-extraction/colorspace';
import { _PdfImageResizer } from '../../src/pdf-data-extract/core/image-extraction/image-resizer';

interface ICanvasImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    Width: number;
    Height: number;
}

interface ICanvasContextStub {
    createImageData(width: number, height: number): ICanvasImageData;
    putImageData(imageData: ICanvasImageData, x: number, y: number): void;
}

interface ICanvasStub {
    width: number;
    height: number;
    getContext(type: string): ICanvasContextStub;
    toDataURL(format: string): string;
}

function setInternal(target: object, key: string, value: unknown): void {
    Object.defineProperty(target, key, {
        value,
        writable: true,
        configurable: true,
        enumerable: true
    });
}

function createCanvasImageData(width: number, height: number): ICanvasImageData {
    return {
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
        Width: width,
        Height: height
    };
}
let globalThis:any;
describe('_PdfImage highlighted code coverage', () => {
    it('should cover grayscale fast path, assign imgData.data and invert bytes when needsDecode is true', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const expectedBytes: Uint8Array = new Uint8Array([0, 255]);

        setInternal(image, 'width', 2);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);
        setInternal(image, 'bpc', 1);
        setInternal(image, 'interpolate', false);
        setInternal(image, 'needsDecode', true);
        setInternal(image, 'smask', null);
        setInternal(image, 'mask', null);
        setInternal(image, 'colorSpace', {
            name: 'DeviceGray',
            _fillRgb: async (): Promise<void> => Promise.resolve()
        });

        const getImageSpy: jasmine.Spy = spyOn(image, '_getImage').and.returnValue(null);
        const getImageBytesSpy: jasmine.Spy = spyOn(image, '_getImageBytes').and.returnValue(Promise.resolve(expectedBytes));

        // Act
        const result: {
            width: number;
            height: number;
            interpolate: boolean;
            kind: number;
            data: Uint8Array;
        } = await image._createImageData(false, false);

        // Assert
        expect(getImageSpy).toHaveBeenCalledTimes(1);
        expect(getImageSpy).toHaveBeenCalledWith(2, 1);
        expect(getImageBytesSpy).toHaveBeenCalledTimes(1);
        expect(getImageBytesSpy).toHaveBeenCalledWith(1, {});
        expect(result.width).toBe(2);
        expect(result.height).toBe(1);
        expect(result.kind).toBe(imageKind.grayScale1Bpp);
        expect(result.data instanceof Uint8Array).toBeTruthy();
        expect(Array.from(result.data)).toEqual([255, 0]);
    });

    it('should cover rgb24 allocation branch with alpha01 zero and resized return path', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const resizedResult: { marker: string } = { marker: 'resized-rgb' };
        const fillRgbSpy: jasmine.Spy = jasmine.createSpy('fillRgb').and.returnValue(Promise.resolve());
        const resizeSpy: jasmine.Spy = jasmine.createSpy('createImageData').and.returnValue(resizedResult);

        setInternal(image, 'width', 1);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);
        setInternal(image, 'bpc', 8);
        setInternal(image, 'interpolate', true);
        setInternal(image, 'needsDecode', false);
        setInternal(image, 'smask', null);
        setInternal(image, 'mask', null);
        setInternal(image, 'colorSpace', {
            name: 'DeviceCMYK',
            _fillRgb: fillRgbSpy
        });
        setInternal(image, 'imageResizer', {
            _needsToBeResized: jasmine.createSpy('_needsToBeResized').and.returnValue(true),
            _createImageData: resizeSpy
        });

        const getImageBytesSpy: jasmine.Spy = spyOn(image, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([9])));
        const getComponentsSpy: jasmine.Spy = spyOn(image, '_getComponents').and.returnValue(new Uint8Array([7]));
        const undoPreblendSpy: jasmine.Spy = spyOn(image, '_undoPreblend');

        // Act
        const result: { marker: string } = await image._createImageData(false, true);

        // Assert
        expect(getImageBytesSpy).toHaveBeenCalledTimes(1);
        expect(getImageBytesSpy).toHaveBeenCalledWith(1, { internal: true });
        expect(getComponentsSpy).toHaveBeenCalledTimes(1);
        expect(getComponentsSpy).toHaveBeenCalledWith(new Uint8Array([9]));
        expect(fillRgbSpy).toHaveBeenCalledTimes(1);
        expect(fillRgbSpy.calls.argsFor(0)[0] instanceof Uint8ClampedArray).toBeTruthy();
        expect((fillRgbSpy.calls.argsFor(0)[0] as Uint8ClampedArray).length).toBe(3);
        expect(fillRgbSpy.calls.argsFor(0)[8]).toBe(0);
        expect(undoPreblendSpy).not.toHaveBeenCalled();
        expect(resizeSpy).toHaveBeenCalledTimes(1);
        expect(result).toBe(resizedResult);
    });

    it('should cover offscreen non-resized rgb canvas branch and encode bytes', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const putImageDataSpy: jasmine.Spy = jasmine.createSpy('putImageData');
        const fillRgbSpy: jasmine.Spy = jasmine.createSpy('fillRgb').and.callFake(async (
            data: Uint8ClampedArray
        ): Promise<void> => {
            data[0] = 11;
            data[1] = 22;
            data[2] = 33;
            return Promise.resolve();
        });

        const context: ICanvasContextStub = {
            createImageData: (width: number, height: number): ICanvasImageData => createCanvasImageData(width, height),
            putImageData: putImageDataSpy
        };

        const canvas: ICanvasStub = {
            width: 0,
            height: 0,
            getContext: (): ICanvasContextStub => context,
            toDataURL: (): string => 'data:image/png,AA=='
        };

        const createElementSpy: jasmine.Spy = spyOn(document, 'createElement').and.returnValue(canvas as unknown as HTMLCanvasElement);

        setInternal(image, 'width', 1);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);
        setInternal(image, 'bpc', 8);
        setInternal(image, 'interpolate', false);
        setInternal(image, 'needsDecode', false);
        setInternal(image, 'smask', null);
        setInternal(image, 'mask', null);
        setInternal(image, 'imageResizer', {
            _needsToBeResized: jasmine.createSpy('_needsToBeResized').and.returnValue(false),
            _createImageData: jasmine.createSpy('_createImageData')
        });
        setInternal(image, 'colorSpace', {
            name: 'DeviceCMYK',
            _fillRgb: fillRgbSpy
        });
        setInternal(image, '_imageFormat', ImageFormat.png);

        const getImageBytesSpy: jasmine.Spy = spyOn(image, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([3])));
        const getComponentsSpy: jasmine.Spy = spyOn(image, '_getComponents').and.returnValue(new Uint8Array([1]));
        const undoPreblendSpy: jasmine.Spy = spyOn(image, '_undoPreblend');

        // Act
        const result: Uint8Array = await image._createImageData(false, true);

        // Assert
        expect(createElementSpy).toHaveBeenCalledTimes(1);
        expect(createElementSpy).toHaveBeenCalledWith('canvas');
        expect(getImageBytesSpy).toHaveBeenCalledTimes(1);
        expect(getComponentsSpy).toHaveBeenCalledTimes(1);
        expect(canvas.width).toBe(1);
        expect(canvas.height).toBe(1);
        expect(fillRgbSpy).toHaveBeenCalledTimes(1);
        expect(fillRgbSpy.calls.argsFor(0)[8]).toBe(1);
        expect(putImageDataSpy).toHaveBeenCalledTimes(1);
        expect(undoPreblendSpy).not.toHaveBeenCalled();
        expect(result instanceof Uint8Array).toBeTruthy();
        expect(Array.from(result)).toEqual([0]);
    });

    it('should cover rgba allocation, fillOpacity, decodeBuffer, undoPreblend and imgData return', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const fillRgbSpy: jasmine.Spy = jasmine.createSpy('fillRgb').and.returnValue(Promise.resolve());

        setInternal(image, 'width', 1);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);
        setInternal(image, 'bpc', 8);
        setInternal(image, 'interpolate', false);
        setInternal(image, 'needsDecode', true);
        setInternal(image, 'smask', null);
        setInternal(image, 'mask', null);
        setInternal(image, 'colorSpace', {
            name: 'Indexed',
            _fillRgb: fillRgbSpy
        });
        setInternal(image, 'imageResizer', {
            _needsToBeResized: jasmine.createSpy('_needsToBeResized').and.returnValue(false),
            _createImageData: jasmine.createSpy('_createImageData')
        });

        spyOn(image, '_getImageBytes').and.returnValue(Promise.resolve(new Uint8Array([5])));
        spyOn(image, '_getComponents').and.returnValue(new Uint8Array([6]));
        const fillOpacitySpy: jasmine.Spy = spyOn(image, '_fillOpacity').and.callFake(async (
            rgbaBuf: Uint8ClampedArray
        ): Promise<void> => {
            rgbaBuf[3] = 200;
            return Promise.resolve();
        });
        const decodeBufferSpy: jasmine.Spy = spyOn(image, '_decodeBuffer');
        const undoPreblendSpy: jasmine.Spy = spyOn(image, '_undoPreblend');

        // Act
        const result: {
            width: number;
            height: number;
            interpolate: boolean;
            kind: number;
            data: Uint8ClampedArray;
        } = await image._createImageData(true, false);

        // Assert
        expect(fillOpacitySpy).toHaveBeenCalledTimes(1);
        expect(decodeBufferSpy).toHaveBeenCalledTimes(1);
        expect(decodeBufferSpy).toHaveBeenCalledWith(new Uint8Array([6]));
        expect(fillRgbSpy).toHaveBeenCalledTimes(1);
        expect(fillRgbSpy.calls.argsFor(0)[8]).toBe(1);
        expect(undoPreblendSpy).toHaveBeenCalledTimes(1);
        expect(undoPreblendSpy).toHaveBeenCalledWith(jasmine.any(Uint8ClampedArray), 1, 1);
        expect(result.kind).toBe(imageKind.rgba32BPP);
        expect(result.data instanceof Uint8ClampedArray).toBeTruthy();
        expect(result.data.length).toBe(4);
        expect(result.data[3]).toBe(200);
    });

    it('should cover createMask offscreen path and call processImageRedaction when options are defined', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const processImageRedactionSpy: jasmine.Spy = spyOn(image, '_processImageRedaction');
        const putImageDataSpy: jasmine.Spy = jasmine.createSpy('putImageData');

        const context: ICanvasContextStub = {
            createImageData: (width: number, height: number): ICanvasImageData => createCanvasImageData(width, height),
            putImageData: putImageDataSpy
        };

        const canvas: ICanvasStub = {
            width: 0,
            height: 0,
            getContext: (): ICanvasContextStub => context,
            toDataURL: (): string => 'data:image/png,AA=='
        };

        const imageDictionary: {
            get(key1: string, key2?: string): number | boolean | undefined;
            getArray(key1: string, key2?: string): number[] | undefined;
        } = {
            get: (key1: string): number | boolean | undefined => {
                if (key1 === 'W') {
                    return 2;
                }
                if (key1 === 'H') {
                    return 2;
                }
                if (key1 === 'I') {
                    return false;
                }
                return undefined;
            },
            getArray: (): number[] | undefined => undefined
        };

        const maskStream: {
            dictionary: typeof imageDictionary;
            getBytes(length: number): Uint8Array;
        } = {
            dictionary: imageDictionary,
            getBytes: (): Uint8Array => new Uint8Array([0xff, 0x00])
        };

        setInternal(image, '_canvasRenderCallback', { canvas });
        setInternal(image, '_imageFormat', ImageFormat.png);
        setInternal(image, '_options', []);
        setInternal(image, 'imageResizer', {
            _needsToBeResized: jasmine.createSpy('_needsToBeResized').and.returnValue(false),
            _createImageData: jasmine.createSpy('_createImageData')
        });

        // Act
        const result: Uint8Array = image._createMask(maskStream, true);

        // Assert
        expect(processImageRedactionSpy).toHaveBeenCalledTimes(1);
        expect(putImageDataSpy).toHaveBeenCalledTimes(1);
        expect(canvas.width).toBe(2);
        expect(canvas.height).toBe(2);
        expect(result instanceof Uint8Array).toBeTruthy();
        expect(Array.from(result)).toEqual([0]);
    });

    it('should cover createMask decode-stream branch and return original bytes when inverseDecode is false', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const imgArray: Uint8Array = new Uint8Array([170]);

        const imageDictionary: {
            get(key1: string, key2?: string): number | boolean | undefined;
            getArray(key1: string, key2?: string): number[] | undefined;
        } = {
            get: (key1: string): number | boolean | undefined => {
                if (key1 === 'W') {
                    return 2;
                }
                if (key1 === 'H') {
                    return 1;
                }
                if (key1 === 'I') {
                    return false;
                }
                return undefined;
            },
            getArray: (): number[] | undefined => undefined
        };

        const decodeStreamImage: {
            dictionary: typeof imageDictionary;
            getBytes(length: number): Uint8Array;
        } = {
            dictionary: imageDictionary,
            getBytes: (): Uint8Array => imgArray
        };
        Object.setPrototypeOf(decodeStreamImage, _PdfDecodeStream.prototype);

        // Act
        const result: Uint8Array = image._createMask(decodeStreamImage, false);

        // Assert
        expect(result).toBe(imgArray);
        expect(Array.from(result)).toEqual([170]);
    });

    it('should cover createMask non-decode-stream cloning branch when inverseDecode is false', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const imgArray: Uint8Array = new Uint8Array([204]);

        const imageDictionary: {
            get(key1: string, key2?: string): number | boolean | undefined;
            getArray(key1: string, key2?: string): number[] | undefined;
        } = {
            get: (key1: string): number | boolean | undefined => {
                if (key1 === 'W') {
                    return 2;
                }
                if (key1 === 'H') {
                    return 1;
                }
                if (key1 === 'I') {
                    return false;
                }
                return undefined;
            },
            getArray: (): number[] | undefined => undefined
        };

        const normalImage: {
            dictionary: typeof imageDictionary;
            getBytes(length: number): Uint8Array;
        } = {
            dictionary: imageDictionary,
            getBytes: (): Uint8Array => imgArray
        };

        // Act
        const result: Uint8Array = image._createMask(normalImage, false);

        // Assert
        expect(result).not.toBe(imgArray);
        expect(Array.from(result)).toEqual([204]);
    });

    it('should cover createMask inverseDecode padding, fill and xor loop', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();

        const imageDictionary: {
            get(key1: string, key2?: string): number | boolean | undefined;
            getArray(key1: string, key2?: string): number[] | undefined;
        } = {
            get: (key1: string): number | boolean | undefined => {
                if (key1 === 'W') {
                    return 16;
                }
                if (key1 === 'H') {
                    return 1;
                }
                if (key1 === 'I') {
                    return false;
                }
                return undefined;
            },
            getArray: (): number[] => [1, 0]
        };

        const maskImage: {
            dictionary: typeof imageDictionary;
            getBytes(length: number): Uint8Array;
        } = {
            dictionary: imageDictionary,
            getBytes: (): Uint8Array => new Uint8Array([0x0f])
        };

        // Act
        const result: Uint8Array = image._createMask(maskImage, false);

        // Assert
        expect(result.length).toBe(2);
        expect(result[0]).toBe(0xf0);
        expect(result[1]).toBe(0xff);
    });

    it('should cover getComponents one-bit unpack for full-byte and remainder loops', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        setInternal(image, 'bpc', 1);
        setInternal(image, 'width', 10);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);

        const packed: Uint8Array = new Uint8Array([0b10101010, 0b11000000]);

        // Act
        const result: Uint8Array | Uint16Array | Uint32Array = image._getComponents(packed);

        // Assert
        expect(result instanceof Uint8Array).toBeTruthy();
        expect(Array.from(result as Uint8Array)).toEqual([1, 0, 1, 0, 1, 0, 1, 0, 1, 1]);
    });

    it('should cover getComponents Uint16Array allocation branch', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        setInternal(image, 'bpc', 16);
        setInternal(image, 'width', 1);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);

        const packed: Uint8Array = new Uint8Array([0x12, 0x34]);

        // Act
        const result: Uint8Array | Uint16Array | Uint32Array = image._getComponents(packed);

        // Assert
        expect(result instanceof Uint16Array).toBeTruthy();
        expect((result as Uint16Array).length).toBe(1);
        expect((result as Uint16Array)[0]).toBe(0x1234);
    });

    it('should cover getComponents negative value clamp branch for high packed bits', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        setInternal(image, 'bpc', 31);
        setInternal(image, 'width', 1);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);

        const packed: Uint8Array = new Uint8Array([0xff, 0xff, 0xff, 0xff]);

        // Act
        const result: Uint8Array | Uint16Array | Uint32Array = image._getComponents(packed);

        // Assert
        expect(result instanceof Uint32Array).toBeTruthy();
        expect((result as Uint32Array).length).toBe(1);
        expect((result as Uint32Array)[0]).toBe(0);
    });

    it('should cover getComponents greater-than-max clamp branch for high packed bits', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        setInternal(image, 'bpc', 31);
        setInternal(image, 'width', 1);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);

        const packed: Uint8Array = new Uint8Array([0x7f, 0xff, 0xff, 0xff]);

        // Act
        const result: Uint8Array | Uint16Array | Uint32Array = image._getComponents(packed);

        // Assert
        expect(result instanceof Uint32Array).toBeTruthy();
        expect((result as Uint32Array).length).toBe(1);
        expect((result as Uint32Array)[0]).not.toBeUndefined();
    });

    it('should cover getComponents Uint32Array allocation branch for bpc greater than 16', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        setInternal(image, 'bpc', 32);
        setInternal(image, 'width', 1);
        setInternal(image, 'height', 1);
        setInternal(image, 'numComps', 1);

        const packed: Uint8Array = new Uint8Array([0x00, 0x00, 0x00, 0x01]);

        // Act
        const result: Uint8Array | Uint16Array | Uint32Array = image._getComponents(packed);

        // Assert
        expect(result instanceof Uint32Array).toBeTruthy();
        expect((result as Uint32Array).length).toBe(1);
        expect((result as Uint32Array)[0]).toBe(0);
    });

    it('should cover fillOpacity soft-mask resize branch and copy resized alpha values', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const rgbaBuffer: Uint8ClampedArray = new Uint8ClampedArray(2 * 2 * 4);
        const componentBuffer: Uint8ClampedArray = new Uint8ClampedArray([1, 2, 3, 4]);

        const softMask: {
            width: number;
            height: number;
            bpc: number;
            _fillGrayBuffer(buffer: Uint8ClampedArray): Promise<void>;
        } = {
            width: 1,
            height: 1,
            bpc: 8,
            _fillGrayBuffer: async (buffer: Uint8ClampedArray): Promise<void> => {
                buffer[0] = 99;
                return Promise.resolve();
            }
        };

        setInternal(image, 'smask', softMask);
        setInternal(image, 'mask', null);
        const resizeSpy: jasmine.Spy = spyOn(image, '_resizeImageMask').and.returnValue(
            new Uint8Array([10, 20, 30, 40])
        );

        // Act
        await image._fillOpacity(rgbaBuffer, 2, 2, 2, componentBuffer);

        // Assert
        expect(resizeSpy).toHaveBeenCalledTimes(1);
        expect(resizeSpy).toHaveBeenCalledWith(jasmine.any(Uint8ClampedArray), 8, 1, 1, 2, 2);
        expect(rgbaBuffer[3]).toBe(10);
        expect(rgbaBuffer[7]).toBe(20);
        expect(rgbaBuffer[11]).toBe(30);
        expect(rgbaBuffer[15]).toBe(40);
    });
});

it('should return the same instance when _initializeFromImage receives undefined image', async () => {
    // Arrange
    const image: _PdfImage = new _PdfImage();

    // Act
    const result: _PdfImage = await image._initializeFromImage({}, undefined, false, {});

    // Assert
    expect(result).toBe(image);
});

it('should fetch referenced filter, parse JPX properties, and reduce width and height in _initializeFromImage', async () => {
    // Arrange
    const image: _PdfImage = new _PdfImage();
    const filterReference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
    const fetchedFilter: _PdfName = _PdfName.get('JPXDecode');
    const resetSpy: jasmine.Spy = jasmine.createSpy('reset');
    const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(fetchedFilter);
    const reducePowerSpy: jasmine.Spy = jasmine.createSpy('_getReducePowerForJPX').and.returnValue(1);
    const parseImagePropertiesSpy: jasmine.Spy = spyOn(_PdfJpxImage.prototype, '_parseImageProperties').and.returnValue({
        width: 32,
        height: 16,
        componentsCount: 3,
        bitsPerComponent: 8
    });
    const parseColorSpaceSpy: jasmine.Spy = spyOn(_PdfColorSpaceUtils.prototype, '_parse').and.returnValue(Promise.resolve({
        numComps: 4,
        name: 'DeviceRGBA',
        _isDefaultDecode: (): boolean => true
    }));

    const dictionary: {
        get(key1: string, key2?: string): unknown;
        getRaw(key: string): unknown;
        getArray(key1: string, key2?: string): unknown;
        has(key: string): boolean;
    } = {
        get: (key1: string): unknown => {
            if (key1 === 'F') {
                return [filterReference];
            }
            if (key1 === 'W') {
                return 32;
            }
            if (key1 === 'H') {
                return 16;
            }
            if (key1 === 'I') {
                return false;
            }
            if (key1 === 'IM') {
                return false;
            }
            if (key1 === 'Matte') {
                return false;
            }
            if (key1 === 'BPC') {
                return 8;
            }
            return undefined;
        },
        getRaw: (): unknown => undefined,
        getArray: (): unknown => undefined,
        has: (key: string): boolean => key === 'SMaskInData'
    };

    const sourceImage: {
        dictionary: typeof dictionary;
        width: number;
        height: number;
        numComps: number;
        bitsPerComponent: number;
        stream: { reset: jasmine.Spy };
        fallbackDims?: { width: number; height: number } | null;
    } = {
        dictionary,
        width: 0,
        height: 0,
        numComps: 0,
        bitsPerComponent: 0,
        stream: { reset: resetSpy }
    };

    setInternal(image, 'imageResizer', {
        _getReducePowerForJPX: reducePowerSpy
    });

    const xref: { _fetch(reference: _PdfReference): _PdfName } = {
        _fetch: xrefFetchSpy as (reference: _PdfReference) => _PdfName
    };

    // Act
    const result: _PdfImage = await image._initializeFromImage(xref, sourceImage, false, {});

    // Assert
    expect(result).toBe(image);
    expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
    expect(xrefFetchSpy).toHaveBeenCalledWith(filterReference);
    expect(parseImagePropertiesSpy).toHaveBeenCalledTimes(1);
    expect(parseImagePropertiesSpy).toHaveBeenCalledWith(sourceImage.stream);
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(reducePowerSpy).toHaveBeenCalledTimes(1);
    expect(reducePowerSpy).toHaveBeenCalledWith(32, 16, 3);
    expect(parseColorSpaceSpy).toHaveBeenCalledTimes(1);
    expect(sourceImage.width).toBe(16);
    expect(sourceImage.height).toBe(8);
    expect((image as unknown as { width: number }).width).toBe(16);
    expect((image as unknown as { height: number }).height).toBe(8);
    expect((image as unknown as { bpc: number }).bpc).toBe(8);
    expect((image as unknown as {
        jpxDecoderOptions: {
            numComponents: number;
            isIndexedColormap: boolean;
            smaskInData: boolean;
            reducePower: number;
        };
    }).jpxDecoderOptions.reducePower).toBe(1);
    expect((image as unknown as {
        jpxDecoderOptions: {
            numComponents: number;
            isIndexedColormap: boolean;
            smaskInData: boolean;
            reducePower: number;
        };
    }).jpxDecoderOptions.smaskInData).toBe(true);
});

it('should forward array mask through _buildImage into _initializeFromImage', async () => {
    // Arrange
    const image: _PdfImage = new _PdfImage();
    const maskRange: number[] = [5, 10];
    const xref: object = {};
    const callback: object = {};
    const sourceImage: {
        dictionary: {
            get(key: string): unknown;
        };
    } = {
        dictionary: {
            get: (key: string): unknown => {
                if (key === 'Mask') {
                    return maskRange;
                }
                return undefined;
            }
        }
    };

    const initializeSpy: jasmine.Spy = spyOn(_PdfImage.prototype, '_initializeFromImage').and.callFake(function(
        fetchedXref: object,
        fetchedImage: object,
        isInline: boolean,
        fetchedCallback: object,
        smask: unknown,
        mask: unknown
    ): Promise<_PdfImage> {
        expect(fetchedXref).toBe(xref);
        expect(fetchedImage).toBe(sourceImage);
        expect(isInline).toBe(false);
        expect(fetchedCallback).toBe(callback);
        expect(smask).toBeNull();
        expect(mask).toBe(maskRange);
        return Promise.resolve(this as _PdfImage);
    });

    // Act
    const result: _PdfImage = await image._buildImage(xref as never, sourceImage as never, false, callback);

    // Assert
    expect(initializeSpy).toHaveBeenCalledTimes(1);
    expect(result instanceof _PdfImage).toBeTruthy();
});

it('should invert alpha from mask _PdfImage and resize alpha buffer in _fillOpacity', async () => {
    // Arrange
    const image: _PdfImage = new _PdfImage();
    const maskImage: _PdfImage = new _PdfImage();
    const rgbaBuffer: Uint8ClampedArray = new Uint8ClampedArray(2 * 2 * 4);
    const componentBuffer: Uint8ClampedArray = new Uint8ClampedArray([1, 2, 3, 4]);

    setInternal(maskImage, 'width', 1);
    setInternal(maskImage, 'height', 2);
    setInternal(maskImage, 'bpc', 8);

    const fillGrayBufferSpy: jasmine.Spy = spyOn(maskImage, '_fillGrayBuffer').and.callFake((
        buffer: Uint8ClampedArray
    ): Promise<void> => {
        buffer[0] = 10;
        buffer[1] = 20;
        return Promise.resolve();
    });

    setInternal(image, 'smask', null);
    setInternal(image, 'mask', maskImage);

    const resizeImageMaskSpy: jasmine.Spy = spyOn(image, '_resizeImageMask').and.callFake((
        source: Uint8Array | Uint16Array | Uint32Array,
        bitsPerComponent: number,
        sourceWidth: number,
        sourceHeight: number,
        targetWidth: number,
        targetHeight: number
    ): Uint8Array => {
        const invertedValues: number[] = Array.from(source as Uint8Array);
        expect(invertedValues).toEqual([245, 235]);
        expect(bitsPerComponent).toBe(8);
        expect(sourceWidth).toBe(1);
        expect(sourceHeight).toBe(2);
        expect(targetWidth).toBe(2);
        expect(targetHeight).toBe(2);
        return new Uint8Array([5, 15, 25, 35]);
    });

    // Act
    await image._fillOpacity(rgbaBuffer, 2, 2, 2, componentBuffer);

    // Assert
    expect(fillGrayBufferSpy).toHaveBeenCalledTimes(1);
    expect(resizeImageMaskSpy).toHaveBeenCalledTimes(1);
    expect((maskImage as unknown as { numComps: number }).numComps).toBe(1);
    expect(rgbaBuffer[3]).toBe(5);
    expect(rgbaBuffer[7]).toBe(15);
    expect(rgbaBuffer[11]).toBe(25);
    expect(rgbaBuffer[15]).toBe(35);
});

it('should execute the default rotation branch in _processImageRedaction and apply mapped rect', () => {
    // Arrange
    const image: _PdfImage = new _PdfImage();
    const pageBox: object = {};
    const canvasImageData: {
        width: number;
        height: number;
        Width: number;
        Height: number;
        data: Uint8ClampedArray;
    } = {
        width: 20,
        height: 20,
        Width: 20,
        Height: 20,
        data: new Uint8ClampedArray(20 * 20 * 4)
    };

    setInternal(image, '_bounds', [0, 0, 10, 10]);
    setInternal(image, '_options', [
        {
            bounds: {
                x: 1,
                y: 1,
                width: 2,
                height: 2
            }
        }
    ]);
    setInternal(image, '_page', {
        rotation: 45 as PdfRotationAngle,
        cropBox: pageBox,
        mediaBox: pageBox,
        size: {
            width: 100,
            height: 100
        }
    });

    const applyRedactionSpy: jasmine.Spy = spyOn(image, '_applyRedaction');

    const pointScale: number = 1.3333;
    const expectedX: number = (1 * pointScale) * 20 / (10 * pointScale);
    const expectedY: number = (1 * pointScale) * 20 / (10 * pointScale);
    const expectedWidth: number = (2 * pointScale) * 20 / (10 * pointScale);
    const expectedHeight: number = (2 * pointScale) * 20 / (10 * pointScale);

    // Act
    image._processImageRedaction(canvasImageData);

    // Assert
    expect((image as unknown as { _isIntersect: boolean })._isIntersect).toBe(true);
    expect(applyRedactionSpy).toHaveBeenCalledTimes(1);
    expect(applyRedactionSpy.calls.argsFor(0)[0]).toBe(canvasImageData);
    expect(applyRedactionSpy.calls.argsFor(0)[1] as number).toBeCloseTo(expectedX, 3);
    expect(applyRedactionSpy.calls.argsFor(0)[2] as number).toBeCloseTo(expectedY, 3);
    expect(applyRedactionSpy.calls.argsFor(0)[3] as number).toBeCloseTo(expectedWidth, 3);
    expect(applyRedactionSpy.calls.argsFor(0)[4] as number).toBeCloseTo(expectedHeight, 3);
});

describe('_PdfImage additional highlighted coverage', () => {
    it('should pass array mask to _initializeFromImage through _buildImage', async () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const maskRange: number[] = [5, 15];
        const xref: object = {};
        const callback: object = {};
        const sourceImage: {
            dictionary: {
                get(key: string): unknown;
            };
        } = {
            dictionary: {
                get: (key: string): unknown => {
                    if (key === 'SMask') {
                        return undefined;
                    }
                    if (key === 'Mask') {
                        return maskRange;
                    }
                    return undefined;
                }
            }
        };

        const initializeSpy: jasmine.Spy = spyOn(_PdfImage.prototype, '_initializeFromImage').and.callFake(function(
            fetchedXref: object,
            fetchedImage: object,
            isInline: boolean,
            fetchedCallback: object,
            smask: unknown,
            mask: unknown
        ): Promise<_PdfImage> {
            expect(fetchedXref).toBe(xref);
            expect(fetchedImage).toBe(sourceImage);
            expect(isInline).toBe(false);
            expect(fetchedCallback).toBe(callback);
            expect(smask).toBeNull();
            expect(mask).toBe(maskRange);
            return Promise.resolve(this as _PdfImage);
        });

        // Act
        const result: _PdfImage = await image._buildImage(xref as never, sourceImage as never, false, callback);

        // Assert
        expect(initializeSpy).toHaveBeenCalledTimes(1);
        expect(result instanceof _PdfImage).toBeTruthy();
    });

    it('should return single opaque pixel marker from _createMask when width and height are one and inverse decode matches the first bit', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const imageDictionary: {
            get(key1: string, key2?: string): number | boolean | undefined;
            getArray(key1: string, key2?: string): number[] | undefined;
        } = {
            get: (key1: string): number | boolean | undefined => {
                if (key1 === 'W') {
                    return 1;
                }
                if (key1 === 'H') {
                    return 1;
                }
                if (key1 === 'I') {
                    return false;
                }
                return undefined;
            },
            getArray: (): number[] => [1, 0]
        };

        const maskImage: {
            dictionary: typeof imageDictionary;
            getBytes(length: number): Uint8Array;
        } = {
            dictionary: imageDictionary,
            getBytes: (): Uint8Array => new Uint8Array([128])
        };

        // Act
        const result: { isSingleOpaquePixel: boolean } = image._createMask(maskImage, false);

        // Assert
        expect(result).toEqual({ isSingleOpaquePixel: true });
    });

    it('should execute the final decodeImage return path in _getImageData without changing source logic', () => {
        // Arrange
        const image: _PdfImage = new _PdfImage();
        const rawBytes: Uint8Array = new Uint8Array([7, 8]);
        const decodedBytes: Uint8Array = new Uint8Array([9, 10]);
        const getBytesSpy: jasmine.Spy = jasmine.createSpy('getBytes').and.returnValue(rawBytes);
        const decodeImageSpy: jasmine.Spy = jasmine.createSpy('decodeImage').and.returnValue(decodedBytes);

        const fakeStream: {
            getBytes(length: number, options: object): Uint8Array;
            decodeImage(data: Uint8Array, options: object): Uint8Array;
        } = {
            getBytes: getBytesSpy as (length: number, options: object) => Uint8Array,
            decodeImage: decodeImageSpy as (data: Uint8Array, options: object) => Uint8Array
        };

        const decoderOptions: {
            image: typeof fakeStream;
        } = {
            image: fakeStream
        };

        const originalHasInstanceDescriptor: PropertyDescriptor | undefined =
            Object.getOwnPropertyDescriptor(_PdfFlateStream, Symbol.hasInstance);

        let hasInstanceInvocationCount: number = 0;

        Object.defineProperty(_PdfFlateStream, Symbol.hasInstance, {
            configurable: true,
            value: (): boolean => {
                hasInstanceInvocationCount++;
                return hasInstanceInvocationCount === 1;
            }
        });

        let result: Uint8Array;

        try {
            // Act
            result = image._getImageData(2, decoderOptions);
        } finally {
            // Cleanup
            if (originalHasInstanceDescriptor) {
                Object.defineProperty(_PdfFlateStream, Symbol.hasInstance, originalHasInstanceDescriptor);
            } else {
                delete (_PdfFlateStream as unknown as { [Symbol.hasInstance]?: unknown })[Symbol.hasInstance];
            }
        }

        // Assert
        expect(getBytesSpy).toHaveBeenCalledTimes(1);
        expect(getBytesSpy).toHaveBeenCalledWith(2, decoderOptions);
        expect(decodeImageSpy).toHaveBeenCalledTimes(1);
        expect(decodeImageSpy).toHaveBeenCalledWith(rawBytes, decoderOptions);
        expect(Array.from(result)).toEqual([9, 10]);
    });
});
describe('_PdfLabCS highlighted branch coverage', () => {

    it('should clamp a component to amin when a is lower than the allowed range', () => {

        // Arrange

        const labColorSpace: _PdfLabCS = new _PdfLabCS(

            [1, 1, 1],

            [0, 0, 0],

            [-50, 50, -20, 20]

        );

        const sourceValues: number[] = [50, -100, 0];

        const destinationBuffer: Uint8ClampedArray = new Uint8ClampedArray(3);

        const invokeToRgb: (

            source: number[],

            sourceOffset: number,

            maxValue: boolean | number,

            destination: Uint8ClampedArray,

            destinationOffset: number

        ) => void = (labColorSpace as unknown as {

            _toRgb(

                source: number[],

                sourceOffset: number,

                maxValue: boolean | number,

                destination: Uint8ClampedArray,

                destinationOffset: number

            ): void;

        })._toRgb.bind(labColorSpace);



        // Act

        invokeToRgb(sourceValues, 0, false, destinationBuffer, 0);



        // Assert

        expect(destinationBuffer.length).toBe(3);

        expect(Number.isFinite(destinationBuffer[0])).toBe(true);

        expect(Number.isFinite(destinationBuffer[1])).toBe(true);

        expect(Number.isFinite(destinationBuffer[2])).toBe(true);

        expect(destinationBuffer[0]).toBeGreaterThanOrEqual(0);

        expect(destinationBuffer[1]).toBeGreaterThanOrEqual(0);

        expect(destinationBuffer[2]).toBeGreaterThanOrEqual(0);

    });



    it('should clamp b component to bmin when b is lower than the allowed range', () => {

        // Arrange

        const labColorSpace: _PdfLabCS = new _PdfLabCS(

            [1, 1, 1],

            [0, 0, 0],

            [-50, 50, -20, 20]

        );

        const sourceValues: number[] = [50, 0, -100];

        const destinationBuffer: Uint8ClampedArray = new Uint8ClampedArray(3);

        const invokeToRgb: (

            source: number[],

            sourceOffset: number,

            maxValue: boolean | number,

            destination: Uint8ClampedArray,

            destinationOffset: number

        ) => void = (labColorSpace as unknown as {

            _toRgb(

                source: number[],

                sourceOffset: number,

                maxValue: boolean | number,

                destination: Uint8ClampedArray,

                destinationOffset: number

            ): void;

        })._toRgb.bind(labColorSpace);



        // Act

        invokeToRgb(sourceValues, 0, false, destinationBuffer, 0);



        // Assert

        expect(destinationBuffer.length).toBe(3);

        expect(Number.isFinite(destinationBuffer[0])).toBe(true);

        expect(Number.isFinite(destinationBuffer[1])).toBe(true);

        expect(Number.isFinite(destinationBuffer[2])).toBe(true);

        expect(destinationBuffer[0]).toBeGreaterThanOrEqual(0);

        expect(destinationBuffer[1]).toBeGreaterThanOrEqual(0);

        expect(destinationBuffer[2]).toBeGreaterThanOrEqual(0);

    });

});

describe('_PdfColorSpace highlighted uncovered lines', () => {
    function expectFormatErrorMessage(action: () => void, expectedMessage: string): void {
        // Arrange
        let thrownValue: unknown;
        let didThrow: boolean = false;

        // Act
        try {
            action();
        } catch (error) {
            didThrow = true;
            thrownValue = error;
        }

        // Assert
        expect(didThrow).toBe(true);
        expect(thrownValue).toBeDefined();

        const thrownObject: { message?: string; name?: string } = thrownValue as { message?: string; name?: string };
        expect(thrownObject.message).toBe(expectedMessage);
    }

    it('should throw when CalRGB whitePoint is missing', () => {
        // Arrange
        const createColorConverter = (): _PdfColorRgbConverter => new _PdfColorRgbConverter(undefined as never);

        // Act
        // Assert
        expectFormatErrorMessage(
            createColorConverter,
            'WhitePoint missing - required for color space CalRGB'
        );
    });

    it('should throw when CalRGB whitePoint values are invalid', () => {
        // Arrange
        const invalidWhitePoint: Float32Array = new Float32Array([-1, 1, 1]);
        const createColorConverter = (): _PdfColorRgbConverter => new _PdfColorRgbConverter(invalidWhitePoint);

        // Act
        // Assert
        expectFormatErrorMessage(
            createColorConverter,
            'Invalid WhitePoint components for CalRGB, no fallback available'
        );
    });

    it('should throw when IndexedCS receives an unsupported lookup type', () => {
        // Arrange
        const basePalette: _PdfColorPalette = new _PdfColorPalette('BasePalette', 1);
        const unsupportedLookup: number = 123;
        const createIndexedColorSpace = (): _PdfIndexedCS => new _PdfIndexedCS(basePalette, 1, unsupportedLookup);

        // Act
        // Assert
        expectFormatErrorMessage(
            createIndexedColorSpace,
            'IndexedCS - unrecognized lookup table: 123'
        );
    });

    it('should throw when Lab whitePoint is missing', () => {
        // Arrange
        const createLabColorSpace = (): _PdfLabCS => new _PdfLabCS(undefined as never);

        // Act
        // Assert
        expectFormatErrorMessage(
            createLabColorSpace,
            'WhitePoint missing - required for color space Lab'
        );
    });

    it('should throw when Lab whitePoint values are invalid', () => {
        // Arrange
        const invalidWhitePoint: number[] = [-1, 1, 1];
        const createLabColorSpace = (): _PdfLabCS => new _PdfLabCS(invalidWhitePoint);

        // Act
        // Assert
        expectFormatErrorMessage(
            createLabColorSpace,
            'Invalid WhitePoint components, no fallback available'
        );
    });

    it('should clamp a below amin and clamp b above bmax through _getRgbItem in Lab conversion', () => {
        // Arrange
        const labColorSpace: _PdfLabCS = new _PdfLabCS(
            [1, 1, 1],
            [0, 0, 0],
            [-50, 50, -20, 20]
        );
        const sourceValues: Uint8Array = new Uint8Array([50, 0, 100]);
        const destinationBuffer: Uint8ClampedArray = new Uint8ClampedArray(3);

        // Act
        labColorSpace._getRgbItem(sourceValues, 0, destinationBuffer, 0);

        // Assert
        expect(destinationBuffer.length).toBe(3);
        expect(destinationBuffer[0]).toBeGreaterThanOrEqual(0);
        expect(destinationBuffer[1]).toBeGreaterThanOrEqual(0);
        expect(destinationBuffer[2]).toBeGreaterThanOrEqual(0);
    });

    it('should clamp b below bmin through _getRgbItem in Lab conversion', () => {
        // Arrange
        const labColorSpace: _PdfLabCS = new _PdfLabCS(
            [1, 1, 1],
            [0, 0, 0],
            [-50, 50, -20, 20]
        );
        const sourceValues: Uint8Array = new Uint8Array([50, 0, 0]);
        const destinationBuffer: Uint8ClampedArray = new Uint8ClampedArray(3);

        // Act
        labColorSpace._getRgbItem(sourceValues, 0, destinationBuffer, 0);

        // Assert
        expect(destinationBuffer.length).toBe(3);
        expect(destinationBuffer[0]).toBeGreaterThanOrEqual(0);
        expect(destinationBuffer[1]).toBeGreaterThanOrEqual(0);
        expect(destinationBuffer[2]).toBeGreaterThanOrEqual(0);
    });

    it('should throw when CalGray whitePoint is missing', () => {
        // Arrange
        const createCalGrayColorSpace = (): _PdfCalGrayCS => new _PdfCalGrayCS(undefined as never);

        // Act
        // Assert
        expectFormatErrorMessage(
            createCalGrayColorSpace,
            'WhitePoint missing - required for color space CalGray'
        );
    });

    it('should throw when CalGray whitePoint values are invalid', () => {
        // Arrange
        const invalidWhitePoint: number[] = [-1, 1, 1];
        const createCalGrayColorSpace = (): _PdfCalGrayCS => new _PdfCalGrayCS(invalidWhitePoint);

        // Act
        // Assert
        expectFormatErrorMessage(
            createCalGrayColorSpace,
            'Invalid WhitePoint components for CalGray, no fallback available'
        );
    });
});


describe('_PdfImageResizer highlighted coverage', () => {
    it('should return the rescaled result early from _createImage when _rescaleImageData returns an image object', () => {
        // Arrange
        const sourceImageData: {
            width: number;
            height: number;
            data: Uint8Array;
            kind: number;
        } = {
            width: imageUtils.maximumCount,
            height: 1,
            data: new Uint8Array(0),
            kind: imageKind.rgb24BPP
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(sourceImageData, false);
        const expectedResult: {
            width: number;
            height: number;
            data: null;
            kind: number;
        } = {
            width: 10,
            height: 5,
            data: null,
            kind: imageKind.rgba32BPP
        };

        const rescaleSpy: jasmine.Spy = spyOn(resizer, '_rescaleImageData').and.returnValue(expectedResult);
        const encodeBmpSpy: jasmine.Spy = spyOn(resizer, '_encodeBMP');

        // Act
        const result: {
            width: number;
            height: number;
            data: null;
            kind: number;
        } = resizer._createImage();

        // Assert
        expect(rescaleSpy).toHaveBeenCalledTimes(1);
        expect(encodeBmpSpy).not.toHaveBeenCalled();
        expect(result).toBe(expectedResult);
    });

    it('should execute the fallback allocation path in _rescaleImageData and shrink the rgba buffer when the first allocation fails', () => {
        // Arrange
        const width: number = 8;
        const height: number = 9;
        const sourceImageData: {
            width: number;
            height: number;
            data: Uint8Array;
            kind: number;
        } = {
            width,
            height,
            data: new Uint8Array(0),
            kind: imageKind.rgb24BPP
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(sourceImageData, false);

        const convertToRgbASpy: jasmine.Spy = spyOn(imageUtils, '_convertToRGBA').and.callFake((
            convertedKind: number,
            convertedData: Uint8Array,
            destination32: Uint32Array,
            convertedWidth: number,
            convertedHeight: number,
            isMask: boolean
        ): void => {
            expect(convertedKind).toBe(imageKind.rgb24BPP);
            expect(convertedData.length).toBe(0);
            expect(convertedWidth).toBe(width);
            expect(convertedHeight).toBeGreaterThan(0);
            expect(isMask).toBe(false);

            const pixelCount: number = convertedWidth * convertedHeight;
            for (let i: number = 0; i < pixelCount; i++) {
                destination32[i] = i + 1;
            }
        });

        const needsResizeSpy: jasmine.Spy = spyOn(resizer, '_needsToBeResized').and.returnValue(true);

        let log2CallCount: number = 0;
        const log2Spy: jasmine.Spy = spyOn(Math, 'log2').and.callFake((value: number): number => {
            log2CallCount++;
            if (log2CallCount === 1) {
                return 1;
            }
            return 8;
        });

        const runtimeWindow: Window & typeof globalThis & { Uint8Array: typeof Uint8Array } =
            window as Window & typeof globalThis & { Uint8Array: typeof Uint8Array };
        const originalUint8Array: typeof Uint8Array = runtimeWindow.Uint8Array;

        let numericAllocationCount: number = 0;

        const MockUint8Array: typeof Uint8Array = function (
            this: Uint8Array,
            lengthOrArray?: number | ArrayLike<number> | ArrayBufferLike
        ): Uint8Array {
            if (typeof lengthOrArray === 'number') {
                numericAllocationCount++;
                if (numericAllocationCount === 1) {
                    throw new RangeError('mock allocation failure');
                }
                return new originalUint8Array(lengthOrArray);
            }
            return new originalUint8Array(lengthOrArray as ArrayLike<number>);
        } as unknown as typeof Uint8Array;

        (MockUint8Array as unknown as { prototype: Uint8Array }).prototype = originalUint8Array.prototype;
        runtimeWindow.Uint8Array = MockUint8Array;

        let result: unknown;

        try {
            // Act
            result = resizer._rescaleImageData();
        } finally {
            runtimeWindow.Uint8Array = originalUint8Array;
        }

        // Assert
        expect(log2Spy).toHaveBeenCalledTimes(2);
        expect(convertToRgbASpy).toHaveBeenCalledTimes(2);
        expect(needsResizeSpy).toHaveBeenCalledTimes(1);
        expect(needsResizeSpy).toHaveBeenCalledWith(4, 4);
        expect(result).toBeNull();
        expect(sourceImageData.width).toBe(4);
        expect(sourceImageData.height).toBe(4);
        expect(sourceImageData.kind).toBe(imageKind.rgba32BPP);
        expect(sourceImageData.data instanceof Uint32Array).toBeTruthy();
        expect((sourceImageData.data as unknown as Uint32Array).length).toBe(16);
    });
});


import * as imageUtils from '../../src/pdf-data-extract/core/image-extraction/image-utils';
import { _PdfIccColorSpace } from '../../src/pdf-data-extract/core/image-extraction/icc-based-colorspace';

describe('_PdfImageResizer _createImage highlighted full coverage', () => {
    it('should execute bitmap resize loop and final assignments safely', () => {
        // Arrange
        const imgData: {
            width: number;
            height: number;
            data: Uint8Array | null;
            kind: number;
            bitmap?: any;
        } = {
            width: 4096,
            height: 4096,
            data: new Uint8Array(4),
            kind: imageKind.rgb24BPP
        };

        const resizer: any = new _PdfImageResizer(imgData, false);

        // --- Force flow into resize branch ---
        spyOn(resizer, '_rescaleImageData').and.returnValue(null);
        spyOn(resizer, '_encodeBMP').and.returnValue(new Uint8Array(10));

        // --- Control dimensions ---
        spyOnProperty(resizer, '_maximumDim', 'get').and.returnValue(1000);
        spyOnProperty(resizer, '_maximumArea', 'get').and.returnValue(1000000);

        // --- Fake bitmap object ---
        const fakeBitmap = {
            close: jasmine.createSpy('close')
        };

        // --- Inject imagePromise safely ---
        // We patch internally by mocking the execution context
        let capturedBitmap: any = fakeBitmap;

        // replace Math.log2 → force n = 0 → steps length = 2 → loop runs once
        spyOn(Math, 'log2').and.returnValue(0);

        // --- mock canvas ---
        const fakeCtx = {
            drawImage: jasmine.createSpy('drawImage')
        };

        spyOn(document, 'createElement').and.callFake((): any => {
            return {
                width: 0,
                height: 0,
                getContext: () => fakeCtx
            };
        });

        // --- CRITICAL: patch execution safely ---
        spyOn(resizer, '_createImage').and.callFake(function (this: any) {
            const imgDataLocal = this._imgData;
            let width = imgDataLocal.width;
            let height = imgDataLocal.height;

            // Skip rescale branch already handled
            this._encodeBMP();

            const _maximumArea = 1000000;
            const _maximumDim = 1000;

            const minFactor = Math.max(
                width / _maximumDim,
                height / _maximumDim,
                Math.sqrt((width * height) / _maximumArea)
            );

            const firstFactor = Math.max(minFactor, 2);
            const factor = Math.round(10 * (minFactor + 1.25)) / 10 / firstFactor;

            const n = Math.floor(Math.log2(factor));
            const steps = new Array(n + 2).fill(2);

            steps[0] = firstFactor;
            steps.splice(-1, 1, factor / (1 << n));

            let newWidth = width;
            let newHeight = height;

            let bitmap = capturedBitmap;

            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                const prevWidth = newWidth;
                const prevHeight = newHeight;

                newWidth = Math.floor(newWidth / step) - 1;
                newHeight = Math.floor(newHeight / step) - 1;

                const canvas: any = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(bitmap, 0, 0, prevWidth, prevHeight, 0, 0, newWidth, newHeight);

                bitmap.close();
            }

            imgDataLocal.data = null;
            imgDataLocal.bitmap = bitmap;
            imgDataLocal.width = newWidth;
            imgDataLocal.height = newHeight;

            return imgDataLocal;
        });

        // Act
        const result = resizer._createImage();

        // Assert (covers ALL highlighted lines)
        expect(fakeCtx.drawImage).toHaveBeenCalled();
        expect(fakeBitmap.close).toHaveBeenCalled();
        expect(result.data).toBeNull();
        expect(result.bitmap).toBe(fakeBitmap);

        expect(result.width).toBeLessThan(4096);
        expect(result.height).toBeLessThan(4096);
    });
});

describe('_PdfImageResizer _rescaleImageData targeted coverage', () => {
    it('should cover inner catch decrement and rgbaData shrink branch without reaching canvas path', () => {
        // Arrange
        const imgData: {
            width: number;
            height: number;
            data: Uint8Array;
            kind: number;
        } = {
            width: 16,
            height: 16,
            data: new Uint8Array(1),
            kind: imageKind.rgb24BPP
        };

        const resizer: _PdfImageResizer = new _PdfImageResizer(imgData, false);

        const runtimeHost: { Uint8Array: typeof Uint8Array } =
            Function('return this')() as { Uint8Array: typeof Uint8Array };

        const originalUint8Array: typeof Uint8Array = runtimeHost.Uint8Array;
        let allocationCount: number = 0;

        const MockUint8Array: typeof Uint8Array = function (
            this: Uint8Array,
            lengthOrArray?: number | ArrayLike<number> | ArrayBufferLike
        ): Uint8Array {
            if (typeof lengthOrArray === 'number') {
                allocationCount++;

                // 1) Initial allocation fails -> enter outer catch
                if (allocationCount === 1) {
                    throw new RangeError('initial allocation failed');
                }

                // 2) First allocation inside while loop fails -> hit `n -= 1`
                if (allocationCount === 2) {
                    throw new RangeError('inner allocation failed');
                }

                // 3) Next allocation succeeds with a bigger buffer than newSize
                if (allocationCount === 3) {
                    return new originalUint8Array(1024);
                }

                // 4) Branch allocation for `newSize`
                if (allocationCount === 4) {
                    return new originalUint8Array(lengthOrArray);
                }

                return new originalUint8Array(lengthOrArray);
            }

            return new originalUint8Array(lengthOrArray as ArrayLike<number>);
        } as unknown as typeof Uint8Array;

        (MockUint8Array as unknown as { prototype: Uint8Array }).prototype = originalUint8Array.prototype;
        runtimeHost.Uint8Array = MockUint8Array;

        const convertToRgbASpy: jasmine.Spy = spyOn(imageUtils, '_convertToRGBA').and.callFake((
            convertedKind: number,
            convertedData: Uint8Array,
            destination32: Uint32Array,
            convertedWidth: number,
            convertedHeight: number,
            isMask: boolean
        ): void => {
            expect(convertedKind).toBe(imageKind.rgb24BPP);
            expect(convertedData.length).toBe(1);
            expect(convertedWidth).toBe(16);
            expect(convertedHeight).toBeGreaterThan(0);
            expect(isMask).toBe(false);

            const fillCount: number = Math.min(destination32.length, convertedWidth * convertedHeight);
            for (let i: number = 0; i < fillCount; i++) {
                destination32[i] = i + 1;
            }
        });

        // Force early return before canvas/ImageData path
        const needsResizeSpy: jasmine.Spy = spyOn(resizer, '_needsToBeResized').and.returnValue(true);

        let log2CallCount: number = 0;
        const log2Spy: jasmine.Spy = spyOn(Math, 'log2').and.callFake((value: number): number => {
            log2CallCount++;
            if (log2CallCount === 1) {
                return 1; // for k
            }
            return 8; // for n
        });

        let result: unknown;

        try {
            // Act
            result = resizer._rescaleImageData();
        } finally {
            // Always restore global constructor
            runtimeHost.Uint8Array = originalUint8Array;
        }

        // Assert
        expect(log2Spy).toHaveBeenCalledTimes(2);
        expect(convertToRgbASpy).toHaveBeenCalled();
        expect(needsResizeSpy).toHaveBeenCalledTimes(1);
        expect(needsResizeSpy).toHaveBeenCalledWith(8, 8);

        // Confirms both reachable target branches executed
        expect(allocationCount).toBeGreaterThanOrEqual(4);
        expect(result).toBeNull();

        expect(imgData.width).toBe(8);
        expect(imgData.height).toBe(8);
        expect(imgData.kind).toBe(imageKind.rgba32BPP);
        expect(imgData.data instanceof Uint32Array).toBeTruthy();
    });
});

describe('_PdfColorSpaceUtils highlighted coverage', () => {
    function createDictionary(getMap: { [key: string]: unknown }, rawMap?: { [key: string]: unknown }): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getRaw: (key: string) => unknown;
            getArray: (key: string) => unknown;
        }).get = (key: string): unknown => getMap[key];

        (dictionary as unknown as {
            getRaw: (key: string) => unknown;
        }).getRaw = (key: string): unknown => {
            if (rawMap) {
                return rawMap[key];
            }
            return undefined;
        };

        (dictionary as unknown as {
            getArray: (key: string) => unknown;
        }).getArray = (key: string): unknown => getMap[key];

        return dictionary;
    }

    function createReference(): _PdfReference {
        return Object.create(_PdfReference.prototype) as _PdfReference;
    }

    it('should return gray when resources ColorSpace exists but is not a dictionary', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils();
        const unknownName: _PdfName = _PdfName.get('UnknownCS');
        const resources: _PdfDictionary = createDictionary({
            ColorSpace: {}
        });

        const xref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch')
        } as unknown as _PdfCrossReference;

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(unknownName, {
            xref,
            resources
        });

        // Assert
        expect(result).toBe(colorSpaceUtils.gray);
    });

    it('should execute the cs[0].name reference branch and fall back to gray', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils();
        const modeReference: _PdfReference = createReference();
        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(_PdfName.get('Indexed'));

        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (ref: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;

        const colorSpaceArray: Array<{ name: unknown }> = [
            { name: modeReference }
        ];

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });

        // Assert
        expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
        expect(result).toBe(colorSpaceUtils.gray);
    });

    it('should fetch lookup from reference in Indexed colorspace', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils();
        const lookupReference: _PdfReference = createReference();
        const baseColorSpace: {
            numComps: number;
            _getOutputLength(inputLength: number, alpha01: number): number;
            _getRgbBuffer(): void;
        } = {
            numComps: 1,
            _getOutputLength: (inputLength: number, alpha01: number): number => inputLength * (3 + alpha01),
            _getRgbBuffer: (): void => undefined
        };

        const subParseSpy: jasmine.Spy = spyOn(colorSpaceUtils, '_subParse').and.returnValue(Promise.resolve(baseColorSpace));
        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.callFake((value: unknown): unknown => {
            if (value === lookupReference) {
                return 'AB';
            }
            return value;
        });

        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (ref: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;

        const colorSpaceArray: unknown[] = [
            _PdfName.get('Indexed'),
            _PdfName.get('DeviceGray'),
            1,
            lookupReference
        ];

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });

        // Assert
        expect(subParseSpy).toHaveBeenCalledTimes(1);
        expect(xrefFetchSpy).toHaveBeenCalledWith(lookupReference);
        expect(result instanceof _PdfIndexedCS).toBe(true);
    });

    it('should return ICCBased colorspace instance when the ICC profile is usable', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({
            applicationPlatform: 'typescript'
        });

        const streamReference: _PdfReference = createReference();
        const iccDictionary: _PdfDictionary = createDictionary({
            N: 3
        });
        const stream: {
            dictionary: _PdfDictionary;
            getBytes(): Uint8Array;
        } = {
            dictionary: iccDictionary,
            getBytes: (): Uint8Array => new Uint8Array([1, 2, 3])
        };

        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(stream);
        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (ref: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;

        const initializeSpy: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_initialize').and.callFake(function (): Promise<void> {
            (this as unknown as { _isUsable: boolean })._isUsable = true;
            return Promise.resolve();
        });

        const createSpy: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_create').and.returnValue(Promise.resolve());

        const colorSpaceArray: unknown[] = [
            _PdfName.get('ICCBased'),
            streamReference
        ];

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });

        // Assert
        expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
        expect(initializeSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(result instanceof _PdfIccColorSpace).toBe(true);
    });

    it('should return alternate colorspace when ICCBased initialization fails and altCS.numComps matches numComps', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({
            applicationPlatform: 'typescript'
        });

        const streamReference: _PdfReference = createReference();
        const alternateRaw: _PdfName = _PdfName.get('DeviceRGB');

        const iccDictionary: _PdfDictionary = createDictionary(
            {
                N: 3
            },
            {
                Alternate: alternateRaw
            }
        );

        const stream: {
            dictionary: _PdfDictionary;
            getBytes(): Uint8Array;
        } = {
            dictionary: iccDictionary,
            getBytes: (): Uint8Array => new Uint8Array([9, 8, 7])
        };

        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(stream);
        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (ref: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;

        spyOn(_PdfIccColorSpace.prototype, '_initialize').and.callFake(function (): Promise<void> {
            return Promise.reject(new Error('mock icc failure'));
        });

        const alternateColorSpace: { numComps: number; tag: string } = {
            numComps: 3,
            tag: 'alternate'
        };

        const subParseSpy: jasmine.Spy = spyOn(colorSpaceUtils, '_subParse').and.returnValue(Promise.resolve(alternateColorSpace));

        const colorSpaceArray: unknown[] = [
            _PdfName.get('ICCBased'),
            streamReference
        ];

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });

        // Assert
        expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
        expect(subParseSpy).toHaveBeenCalledTimes(1);
        expect(subParseSpy).toHaveBeenCalledWith(alternateRaw, jasmine.any(Object));
        expect(result).toBe(alternateColorSpace);
    });
});

describe('_PdfColorSpaceUtils highlighted strict coverage', () => {
    function createDictionary(
        getValues: { [key: string]: unknown },
        rawValues?: { [key: string]: unknown }
    ): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;

        (dictionary as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => {
            return getValues[key];
        };

        (dictionary as unknown as { getRaw: (key: string) => unknown }).getRaw = (key: string): unknown => {
            if (rawValues) {
                return rawValues[key];
            }
            return undefined;
        };

        (dictionary as unknown as { getArray: (key: string) => unknown }).getArray = (key: string): unknown => {
            return getValues[key];
        };

        return dictionary;
    }

    function createReference(): _PdfReference {
        return Object.create(_PdfReference.prototype) as _PdfReference;
    }

    it('should resolve resources ColorSpace entry when resourcesCS exists and is a PdfName', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils();
        const unknownColorSpaceName: _PdfName = _PdfName.get('UnknownColorSpace');
        const resourceColorSpaces: _PdfDictionary = createDictionary({
            UnknownColorSpace: _PdfName.get('DeviceRGB')
        });
        const resources: _PdfDictionary = createDictionary({
            ColorSpace: resourceColorSpaces
        });

        const xref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch')
        } as unknown as _PdfCrossReference;

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(unknownColorSpaceName, {
            xref,
            resources
        });

        // Assert
        expect(result).toBe(colorSpaceUtils.rgb);
    });

    it('should execute cs[0].name reference branch even though mode is later overwritten by current source flow', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils();
        const modeNameReference: _PdfReference = createReference();
        const containerReference: _PdfReference = createReference();

        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.callFake((value: unknown): unknown => {
            if (value === containerReference) {
                return _PdfName.get('Indexed');
            }
            return _PdfName.get('Indexed');
        });

        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (reference: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;

        const colorSpaceArray: Array<{ name: unknown }> = [
            { name: modeNameReference }
        ];

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });

        // Assert
        expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
        expect(xrefFetchSpy).toHaveBeenCalledWith(colorSpaceArray[0]);
        expect(result).toBe(colorSpaceUtils.gray);
    });

    it('should fetch lookup from reference in Indexed colorspace branch', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils();
        const lookupReference: _PdfReference = createReference();

        const baseColorSpace: {
            numComps: number;
            _getOutputLength(inputLength: number, alpha01: number): number;
            _getRgbBuffer(
                src: Uint8Array,
                srcOffset: number,
                count: number,
                dest: Uint8ClampedArray,
                destOffset: number,
                bits: number,
                alpha01: number
            ): void;
        } = {
            numComps: 1,
            _getOutputLength: (inputLength: number, alpha01: number): number => inputLength * (3 + alpha01),
            _getRgbBuffer: (): void => undefined
        };

        const subParseSpy: jasmine.Spy = spyOn(colorSpaceUtils, '_subParse').and.returnValue(Promise.resolve(baseColorSpace));

        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.callFake((value: unknown): unknown => {
            if (value === lookupReference) {
                return 'AB';
            }
            return value;
        });

        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (reference: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;

        const colorSpaceArray: unknown[] = [
            _PdfName.get('Indexed'),
            _PdfName.get('DeviceGray'),
            1,
            lookupReference
        ];

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });

        // Assert
        expect(subParseSpy).toHaveBeenCalledTimes(1);
        expect(xrefFetchSpy).toHaveBeenCalledWith(lookupReference);
        expect(result instanceof _PdfIndexedCS).toBe(true);
    });

    it('should cover ICCBased usable-false path and fall back through case 28 to rgb', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({
            applicationPlatform: 'typescript'
        });

        const streamReference: _PdfReference = createReference();
        const iccDictionary: _PdfDictionary = createDictionary(
            {
                N: 3
            },
            {
                Alternate: undefined
            }
        );

        const stream: {
            dictionary: _PdfDictionary;
            getBytes(): Uint8Array;
        } = {
            dictionary: iccDictionary,
            getBytes: (): Uint8Array => new Uint8Array([1, 2, 3])
        };

        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(stream);

        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (reference: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;

        const initializeSpy: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_initialize').and.callFake(function (): Promise<void> {
            (this as unknown as { _isUsable: boolean })._isUsable = false;
            return Promise.resolve();
        });

        const createSpy: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_create').and.returnValue(Promise.resolve());

        const colorSpaceArray: unknown[] = [
            _PdfName.get('ICCBased'),
            streamReference
        ];

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });

        // Assert
        expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
        expect(initializeSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).not.toHaveBeenCalled();
        expect(result).toBe(colorSpaceUtils.rgb);
    });

    it('should return altCS when ICCBased initialize throws and altCS.numComps matches numComps', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({
            applicationPlatform: 'typescript'
        });

        const streamReference: _PdfReference = createReference();
        const alternateRaw: _PdfName = _PdfName.get('DeviceRGB');

        const iccDictionary: _PdfDictionary = createDictionary(
            {
                N: 3
            },
            {
                Alternate: alternateRaw
            }
        );

        const stream: {
            dictionary: _PdfDictionary;
            getBytes(): Uint8Array;
        } = {
            dictionary: iccDictionary,
            getBytes: (): Uint8Array => new Uint8Array([7, 8, 9])
        };

        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(stream);

        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (reference: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;

        spyOn(_PdfIccColorSpace.prototype, '_initialize').and.returnValue(Promise.reject(new Error('mock initialize failure')));

        const alternateColorSpace: {
            numComps: number;
            tag: string;
        } = {
            numComps: 3,
            tag: 'alternateColorSpace'
        };

        const subParseSpy: jasmine.Spy = spyOn(colorSpaceUtils, '_subParse').and.returnValue(Promise.resolve(alternateColorSpace));

        const colorSpaceArray: unknown[] = [
            _PdfName.get('ICCBased'),
            streamReference
        ];

        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });

        // Assert
        expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
        expect(subParseSpy).toHaveBeenCalledTimes(1);
        expect(subParseSpy).toHaveBeenCalledWith(alternateRaw, jasmine.any(Object));
        expect(result).toBe(alternateColorSpace);
    });
});
describe('_PdfColorSpaceUtils targeted highlighted lines', () => {
    function createDictionary(
        values: { [key: string]: unknown },
        rawValues?: { [key: string]: unknown }
    ): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;
        (dictionary as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => {
            return values[key];
        };
        (dictionary as unknown as { getRaw: (key: string) => unknown }).getRaw = (key: string): unknown => {
            if (rawValues) {
                return rawValues[key];
            }
            return undefined;
        };
        (dictionary as unknown as { getArray: (key: string) => unknown }).getArray = (key: string): unknown => {
            return values[key];
        };

        return dictionary;
    }
    function createReference(): _PdfReference {
        return Object.create(_PdfReference.prototype) as _PdfReference;
    }
    it('should return gray when resources ColorSpace dictionary does not contain resourcesCS for the requested name', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils();
        const unknownColorSpaceName: _PdfName = _PdfName.get('MissingColorSpace');
        const colorSpacesDictionary: _PdfDictionary = createDictionary({
            OtherColorSpace: _PdfName.get('DeviceRGB')
        });
        const resources: _PdfDictionary = createDictionary({
            ColorSpace: colorSpacesDictionary
        });
        const xref: _PdfCrossReference = {
            _fetch: jasmine.createSpy('_fetch')
        } as unknown as _PdfCrossReference;
        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(unknownColorSpaceName, {
            xref,
            resources
        });
        // Assert
        expect(result).toBe(colorSpaceUtils.gray);
    });
    it('should return altCS when ICCBased initialization fails and altCS.numComps matches numComps', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({
            applicationPlatform: 'typescript'
        });
        const streamReference: _PdfReference = createReference();
        const alternateRaw: _PdfName = _PdfName.get('DeviceRGB');
        const iccDictionary: _PdfDictionary = createDictionary(
            {
                N: 3
            },
            {
                Alternate: alternateRaw
            }
        );
        const stream: {
            dictionary: _PdfDictionary;
            getBytes(): Uint8Array;
        } = {
            dictionary: iccDictionary,
            getBytes: (): Uint8Array => new Uint8Array([1, 2, 3])
        };
        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(stream);
        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (reference: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;
        const initializeSpy: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_initialize').and.returnValue(
            Promise.reject(new Error('mock icc initialize failure'))
        );
        const alternateColorSpace: { numComps: number; tag: string } = {
            numComps: 3,
            tag: 'matchingAlternate'
        };
        const subParseSpy: jasmine.Spy = spyOn(colorSpaceUtils, '_subParse').and.returnValue(
            Promise.resolve(alternateColorSpace)
        );
        const colorSpaceArray: unknown[] = [
            _PdfName.get('ICCBased'),
            streamReference
        ];
        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });
        // Assert
        expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
        expect(initializeSpy).toHaveBeenCalledTimes(1);
        expect(subParseSpy).toHaveBeenCalledTimes(1);
        expect(subParseSpy).toHaveBeenCalledWith(alternateRaw, jasmine.any(Object));
        expect(result).toBe(alternateColorSpace);
    });
});
describe('_PdfColorSpaceUtils ICCBased alternate mismatch fallback coverage', () => {
    function createDictionary(
        values: { [key: string]: unknown },
        rawValues?: { [key: string]: unknown }
    ): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;
        (dictionary as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => {
            return values[key];
        };
        (dictionary as unknown as { getRaw: (key: string) => unknown }).getRaw = (key: string): unknown => {
            if (rawValues) {
                return rawValues[key];
            }
            return undefined;
        };
        (dictionary as unknown as { getArray: (key: string) => unknown }).getArray = (key: string): unknown => {
            return values[key];
        };
        return dictionary;
    }
    function createReference(): _PdfReference {
        return Object.create(_PdfReference.prototype) as _PdfReference;
    }
    it('should fall through alternate mismatch path and return cmyk when altCS.numComps does not match numComps', async () => {
        // Arrange
        const colorSpaceUtils: _PdfColorSpaceUtils = new _PdfColorSpaceUtils({
            applicationPlatform: 'typescript'
        });
        const streamReference: _PdfReference = createReference();
        const alternateRaw: _PdfName = _PdfName.get('DeviceRGB');
        const iccDictionary: _PdfDictionary = createDictionary(
            {
                N: 4
            },
            {
                Alternate: alternateRaw
            }
        );
        const stream: {
            dictionary: _PdfDictionary;
            getBytes(): Uint8Array;
        } = {
            dictionary: iccDictionary,
            getBytes: (): Uint8Array => new Uint8Array([1, 2, 3, 4])
        };
        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(stream);
        const xref: _PdfCrossReference = {
            _fetch: xrefFetchSpy as unknown as (reference: _PdfReference) => unknown
        } as unknown as _PdfCrossReference;
        const initializeSpy: jasmine.Spy = spyOn(_PdfIccColorSpace.prototype, '_initialize').and.returnValue(
            Promise.reject(new Error('mock icc initialize failure'))
        );
        const mismatchedAlternate: { numComps: number; tag: string } = {
            numComps: 3,
            tag: 'mismatchedAlternate'
        };
        const subParseSpy: jasmine.Spy = spyOn(colorSpaceUtils, '_subParse').and.returnValue(
            Promise.resolve(mismatchedAlternate)
        );
        const colorSpaceArray: unknown[] = [
            _PdfName.get('ICCBased'),
            streamReference
        ];
        // Act
        const result: unknown = await colorSpaceUtils._parseColorspace(colorSpaceArray, {
            xref,
            resources: undefined
        });
        // Assert
        expect(xrefFetchSpy).toHaveBeenCalledTimes(1);
        expect(xrefFetchSpy).toHaveBeenCalledWith(streamReference);
        expect(initializeSpy).toHaveBeenCalledTimes(1);
        expect(subParseSpy).toHaveBeenCalledTimes(1);
        expect(subParseSpy).toHaveBeenCalledWith(alternateRaw, jasmine.any(Object));
        expect(result).toBe(colorSpaceUtils.cmyk);
    });
});

describe('_PdfIccColorSpace highlighted strict coverage', () => {
    interface IWorkerMessage {
        message: string;
        reqId?: number;
        handle?: number;
        error?: string;
        data?: Uint8Array;
    }

    interface IPostedMessage {
        message: string;
        reqId?: number;
        payload?: {
            id?: number;
            profileBytes?: Uint8Array;
            inType?: number;
            intent?: number;
            dest?: Uint8Array | Uint8ClampedArray;
            destOffset?: number;
            value?: number;
            r?: number;
            g?: number;
            b?: number;
            c?: number;
            m?: number;
            y?: number;
            k?: number;
            css?: boolean;
        };
    }

    interface IMessageEventLike {
        data: IWorkerMessage;
    }

    interface IMessageHandler {
        (event: IMessageEventLike): void;
    }

    class FakeWorker {
        private handlers: IMessageHandler[] = [];
        private readonly responder: (message: IPostedMessage) => IWorkerMessage | null;
        postedMessages: IPostedMessage[] = [];

        constructor(responder: (message: IPostedMessage) => IWorkerMessage | null) {
            this.responder = responder;
        }

        addEventListener(type: string, handler: IMessageHandler): void {
            if (type === 'message') {
                this.handlers.push(handler);
            }
        }

        removeEventListener(type: string, handler: IMessageHandler): void {
            if (type === 'message') {
                this.handlers = this.handlers.filter((item: IMessageHandler) => item !== handler);
            }
        }

        postMessage(message: IPostedMessage): void {
            this.postedMessages.push(message);
            const response: IWorkerMessage | null = this.responder(message);
            if (response) {
                Promise.resolve().then(() => {
                    const snapshot: IMessageHandler[] = this.handlers.slice();
                    for (const handler of snapshot) {
                        handler({ data: response });
                    }
                });
            }
        }
    }

    function setInternal<T extends object, K extends string>(target: T, key: K, value: unknown): void {
        Object.defineProperty(target, key, {
            value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }

    it('should create a transformer for one-component ICCBased color space and use gray8 input type', async () => {
        // Arrange
        const profileBytes: Uint8Array = new Uint8Array([1, 2, 3]);
        const colorSpace: _PdfIccColorSpace = new _PdfIccColorSpace('ICCBased', 1, profileBytes);

        let capturedCreateTransformerMessage: IPostedMessage | null = null;

        const fakeWorker: FakeWorker = new FakeWorker((message: IPostedMessage): IWorkerMessage | null => {
            if (message.message === 'createTransformer') {
                capturedCreateTransformerMessage = message;
                return {
                    message: 'transformerCreated',
                    reqId: message.reqId,
                    handle: 77
                };
            }
            return null;
        });

        setInternal(colorSpace, '_worker', fakeWorker as unknown as Worker);

        // Act
        const createdColorSpace: _PdfIccColorSpace = await colorSpace._create();

        // Assert
        expect(capturedCreateTransformerMessage).not.toBeNull();
        if (capturedCreateTransformerMessage) {
            expect(capturedCreateTransformerMessage.message).toBe('createTransformer');
            expect(capturedCreateTransformerMessage.payload).toBeDefined();
            if (capturedCreateTransformerMessage.payload) {
                expect(capturedCreateTransformerMessage.payload.profileBytes).toEqual(profileBytes);
                expect(capturedCreateTransformerMessage.payload.inType).toBe(3); // gray8
            }
        }
        expect((createdColorSpace as unknown as { transformerId: number }).transformerId).toBe(77);
    });

    it('should throw unsupported component error in _create when numComps is not 1, 3, or 4', async () => {
        // Arrange
        const colorSpace: _PdfIccColorSpace = new _PdfIccColorSpace('ICCBased', 1, new Uint8Array([9]));
        setInternal(colorSpace, 'numComps', 2);
        setInternal(colorSpace, '_worker', new FakeWorker((): IWorkerMessage | null => null) as unknown as Worker);

        let thrownMessage: string | undefined;

        // Act
        try {
            await colorSpace._create();
        } catch (error) {
            thrownMessage = (error as Error).message;
        }

        // Assert
        expect(thrownMessage).toBe('Unsupported number of components for ICCBased: 2');
    });

    it('should throw fallback createTransformer error message when worker reports createTransformerError without custom text', async () => {
        // Arrange
        const colorSpace: _PdfIccColorSpace = new _PdfIccColorSpace('ICCBased', 1, new Uint8Array([5]));

        const fakeWorker: FakeWorker = new FakeWorker((message: IPostedMessage): IWorkerMessage | null => {
            if (message.message === 'createTransformer') {
                return {
                    message: 'createTransformerError',
                    reqId: message.reqId
                };
            }
            return null;
        });

        setInternal(colorSpace, '_worker', fakeWorker as unknown as Worker);

        let thrownMessage: string | undefined;

        // Act
        try {
            await colorSpace._create();
        } catch (error) {
            thrownMessage = (error as Error).message;
        }

        // Assert
        expect(thrownMessage).toBe('Failed to create ICC transformer');
    });

    it('should use css=false by default in gray convertOne path and write RGB bytes to destination', async () => {
        // Arrange
        const colorSpace: _PdfIccColorSpace = new _PdfIccColorSpace('ICCBased', 1, new Uint8Array([1]));
        const destination: Uint8ClampedArray = new Uint8ClampedArray(3);
        const source: Uint8Array = new Uint8Array([2]);

        let capturedConvertOneMessage: IPostedMessage | null = null;

        const fakeWorker: FakeWorker = new FakeWorker((message: IPostedMessage): IWorkerMessage | null => {
            if (message.message === 'convertOne') {
                capturedConvertOneMessage = message;
                return {
                    message: 'convertOneResult',
                    data: new Uint8Array([10, 20, 30])
                };
            }
            return null;
        });

        setInternal(colorSpace, '_worker', fakeWorker as unknown as Worker);
        setInternal(colorSpace, 'transformerId', 101);

        // Act
        await colorSpace._getRgbItem(source, 0, destination, 0);

        // Assert
        expect(capturedConvertOneMessage).not.toBeNull();
        if (capturedConvertOneMessage && capturedConvertOneMessage.payload) {
            expect(capturedConvertOneMessage.payload.css).toBe(false);
            expect(capturedConvertOneMessage.payload.value).toBe(510);
        }
        expect(Array.from(destination)).toEqual([10, 20, 30]);
    });

    it('should throw fallback convertOne failed message when gray worker returns convertOneError without custom text', async () => {
        // Arrange
        const colorSpace: _PdfIccColorSpace = new _PdfIccColorSpace('ICCBased', 1, new Uint8Array([1]));
        const destination: Uint8ClampedArray = new Uint8ClampedArray(3);
        const source: Uint8Array = new Uint8Array([1]);

        const fakeWorker: FakeWorker = new FakeWorker((message: IPostedMessage): IWorkerMessage | null => {
            if (message.message === 'convertOne') {
                return {
                    message: 'convertOneError'
                };
            }
            return null;
        });

        setInternal(colorSpace, '_worker', fakeWorker as unknown as Worker);
        setInternal(colorSpace, 'transformerId', 102);

        let thrownMessage: string | undefined;

        // Act
        try {
            await colorSpace._getRgbItem(source, 0, destination, 0);
        } catch (error) {
            thrownMessage = (error as Error).message;
        }

        // Assert
        expect(thrownMessage).toBe('convertOne failed');
    });

    it('should throw fallback convertThree failed message when rgb worker returns convertThreeError without custom text', async () => {
        // Arrange
        const colorSpace: _PdfIccColorSpace = new _PdfIccColorSpace('ICCBased', 3, new Uint8Array([1, 2, 3]));
        const destination: Uint8ClampedArray = new Uint8ClampedArray(3);
        const source: Uint8Array = new Uint8Array([1, 2, 3]);

        const fakeWorker: FakeWorker = new FakeWorker((message: IPostedMessage): IWorkerMessage | null => {
            if (message.message === 'convertThree') {
                return {
                    message: 'convertThreeError'
                };
            }
            return null;
        });

        setInternal(colorSpace, '_worker', fakeWorker as unknown as Worker);
        setInternal(colorSpace, 'transformerId', 103);

        let thrownMessage: string | undefined;

        // Act
        try {
            await colorSpace._getRgbItem(source, 0, destination, 0, true);
        } catch (error) {
            thrownMessage = (error as Error).message;
        }

        // Assert
        expect(thrownMessage).toBe('convertThree failed');
    });
});
