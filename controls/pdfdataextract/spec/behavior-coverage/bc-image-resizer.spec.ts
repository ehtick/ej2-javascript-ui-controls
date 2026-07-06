
import * as PdfBaseModule from '@syncfusion/ej2-pdf';
import * as ImageUtilsModule from '../../src/pdf-data-extract/core/image-extraction/image-utils';

function _createCanvas(context: _CanvasContextLike): _CanvasLike {
    return {
        width: 0,
        height: 0,
        getContext: jasmine.createSpy('getContext').and.returnValue(context as unknown as CanvasRenderingContext2D)
    };
}
let globalThis:any;
describe('_PdfImageResizer - full AAA behavior coverage', () => {
    it('should cover constructor overloads and canUseImageDecoder getter for both support states', async () => {
        // Arrange
        const emptyResizer: _PdfImageResizer = new _PdfImageResizer();
        const imgData: { width: number; height: number; data: Uint8Array; kind: number } = {
            width: 2,
            height: 2,
            data: new Uint8Array([1, 2, 3, 4]),
            kind: imageKind.rgb24BPP
        };
        const populatedResizer: _PdfImageResizer = new _PdfImageResizer(imgData, true);
        const populatedState: {
            _imgData?: unknown;
            _isMask?: boolean;
        } = populatedResizer as unknown as {
            _imgData?: unknown;
            _isMask?: boolean;
        };

        emptyResizer.isImageDecoderSupported = false;
        const unsupportedResultPromise: Promise<boolean> = emptyResizer.canUseImageDecoder as Promise<boolean>;

        populatedResizer.isImageDecoderSupported = true;
        const supportedResultPromise: Promise<boolean> = populatedResizer.canUseImageDecoder as Promise<boolean>;

        // Act
        const unsupportedResult: boolean = await unsupportedResultPromise;
        const supportedResult: boolean = await supportedResultPromise;

        // Assert
        expect(emptyResizer.minimumImageDimension).toBe(2048);
        expect(emptyResizer.maximumImageDimension).toBe(65537);
        expect(emptyResizer.error).toBe(128);
        expect(emptyResizer.goodSquareLength).toBe(2048);
        expect(unsupportedResult).toBeFalsy();

        expect(populatedState._imgData).toBe(imgData);
        expect(populatedState._isMask).toBeTruthy();
        expect(supportedResult).toBeFalsy();
    });

    it('should cover _needsToBeResized for small images, hasMaxArea comparison and over-maximum dimensions', () => {
        // Arrange
        const resizer: _PdfImageResizer = new _PdfImageResizer();
        const maximumDimSpy: jasmine.Spy = spyOnProperty(resizer, '_maximumDim', 'get').and.returnValue(3000);
        const maximumAreaSpy: jasmine.Spy = spyOnProperty(resizer, '_maximumArea', 'get').and.returnValue(1000);
        const state: { _hasMaxArea: boolean } = resizer as unknown as { _hasMaxArea: boolean };

        // Act
        const smallImageResult: boolean = resizer._needsToBeResized(100, 100);

        state._hasMaxArea = true;
        const hasMaxAreaResult: boolean = resizer._needsToBeResized(3000, 1);

        maximumDimSpy.and.returnValue(40);
        const overMaximumDimResult: boolean = resizer._needsToBeResized(3000, 10);

        // Assert
        expect(smallImageResult).toBeFalsy();
        expect(maximumAreaSpy).toHaveBeenCalled();
        expect(hasMaxAreaResult).toBeTruthy();
        expect(overMaximumDimResult).toBeTruthy();
    });

    it('should cover _needsToBeResized for area below good square threshold and good dimensions success path', () => {
        // Arrange
        const resizer: _PdfImageResizer = new _PdfImageResizer();
        spyOnProperty(resizer, '_maximumDim', 'get').and.returnValue(5000);

        resizer.goodSquareLength = 50;
        const belowAreaThresholdResult: boolean = resizer._needsToBeResized(60, 40);

        const goodDimsSpy: jasmine.Spy = spyOn(resizer, '_areGoodDims').and.returnValue(true);
        resizer.goodSquareLength = 20;

        // Act
        const goodDimsResult: boolean = resizer._needsToBeResized(100, 90);

        // Assert
        expect(belowAreaThresholdResult).toBeFalsy();
        expect(goodDimsSpy).toHaveBeenCalledWith(100, 90);
        expect(goodDimsResult).toBeFalsy();
        expect(resizer.goodSquareLength).toBe(Math.floor(Math.sqrt(100 * 90)));
    });

    it('should cover _needsToBeResized for guessed maximum area path when dimensions are not good', () => {
        // Arrange
        const resizer: _PdfImageResizer = new _PdfImageResizer();
        spyOnProperty(resizer, '_maximumDim', 'get').and.returnValue(4000);
        spyOn(resizer, '_areGoodDims').and.returnValue(false);
        const guessMaxSpy: jasmine.Spy = spyOn(resizer, '_guessMax').and.returnValue(64);

        resizer.goodSquareLength = 32;
        resizer.error = 4;

        // Act
        const needsResize: boolean = resizer._needsToBeResized(100, 100);

        // Assert
        expect(guessMaxSpy).toHaveBeenCalledWith(32, 4000, 4, 0);
        expect(resizer.goodSquareLength).toBe(64);
        expect(needsResize).toBeTruthy();
    });

    it('should cover _getReducePowerForJPX for no-resize zero, no-resize area overflow and resize-required branches', () => {
        // Arrange
        const resizer: _PdfImageResizer = new _PdfImageResizer();
        const firstNeedsSpy: jasmine.Spy = spyOn(resizer, '_needsToBeResized');
        firstNeedsSpy.and.returnValues(false, false, true);

        spyOnProperty(resizer, '_maximumDim', 'get').and.returnValue(100);
        spyOnProperty(resizer, '_maximumArea', 'get').and.returnValue(2000);

        const widthSmall: number = 100;
        const heightSmall: number = 100;
        const componentsSmall: number = 3;

        const widthLarge: number = 32768;
        const heightLarge: number = 32768;
        const componentsLarge: number = 1;

        // Act
        const noResizeZeroResult: number = resizer._getReducePowerForJPX(widthSmall, heightSmall, componentsSmall);
        const noResizeOverflowResult: number = resizer._getReducePowerForJPX(widthLarge, heightLarge, componentsLarge);
        const resizeRequiredResult: number = resizer._getReducePowerForJPX(400, 300, 4);

        // Assert
        expect(noResizeZeroResult).toBe(0);
        expect(noResizeOverflowResult).toBe(2);
        expect(resizeRequiredResult).toBe(3);
    });

    it('should cover _maximumDim getter, _maximumArea getter, _maximumArea setter and _setOptions behavior for both branches', () => {
        // Arrange
        const resizer: _PdfImageResizer = new _PdfImageResizer();
        const guessMaxSpy: jasmine.Spy = spyOn(resizer, '_guessMax').and.callFake((
            start: number,
            end: number,
            tolerance: number,
            defaultHeight: number
        ): number => {
            if (defaultHeight === 1) {
                return 6000;
            }
            return 40;
        });

        // Act
        resizer._setOptions({
            canvasMaxAreaInBytes: 4096,
            isImageDecoderSupported: true
        });

        const stateAfterFirstOptions: { _hasMaxArea: boolean } = resizer as unknown as { _hasMaxArea: boolean };
        const maximumDim: number = resizer._maximumDim;
        const maximumArea: number = resizer._maximumArea;

        resizer._setOptions({
            canvasMaxAreaInBytes: 8192,
            isImageDecoderSupported: false
        });

        // Assert
        expect(stateAfterFirstOptions._hasMaxArea).toBeTruthy();
        expect(maximumDim).toBe(6000);
        expect(maximumArea).toBe(1600);

        expect(guessMaxSpy.calls.argsFor(0)).toEqual([65537, 65537, 0, 1]);
        expect(guessMaxSpy.calls.argsFor(1)).toEqual([65537, 65537, 0, 1]);
        expect(guessMaxSpy.calls.argsFor(2)).toEqual([2048, 6000, 128, 0]);

        expect(resizer.isImageDecoderSupported).toBeFalsy();
    });

    it('should cover _areGoodDims success path with non-zero opacity, zero-opacity false path and catch path', () => {
        // Arrange
        const resizer: _PdfImageResizer = new _PdfImageResizer();

        const successContext: _CanvasContextLike = _createCanvasContext(255);
        const zeroOpacityContext: _CanvasContextLike = _createCanvasContext(0);
        const successCanvas: _CanvasLike = _createCanvas(successContext);
        const zeroOpacityCanvas: _CanvasLike = _createCanvas(zeroOpacityContext);

        const createElementSpy: jasmine.Spy = spyOn(document, 'createElement');

        createElementSpy.and.returnValues(
            successCanvas as unknown as HTMLCanvasElement,
            zeroOpacityCanvas as unknown as HTMLCanvasElement
        );

        // Act
        const successResult: boolean = resizer._areGoodDims(10, 20);
        const zeroOpacityResult: boolean = resizer._areGoodDims(5, 6);

        createElementSpy.and.throwError('canvas failure');
        const catchResult: boolean = resizer._areGoodDims(1, 1);

        // Assert
        expect(successResult).toBeTruthy();
        expect(successCanvas.width).toBe(1);
        expect(successCanvas.height).toBe(1);
        expect(successContext.fillRect).toHaveBeenCalledWith(0, 0, 1, 1);
        expect(successContext.getImageData).toHaveBeenCalledWith(0, 0, 1, 1);

        expect(zeroOpacityResult).toBeFalsy();
        expect(zeroOpacityCanvas.width).toBe(1);
        expect(zeroOpacityCanvas.height).toBe(1);

        expect(catchResult).toBeFalsy();
    });

    it('should cover _guessMax with default height and middle height branches', () => {
        // Arrange
        const resizer: _PdfImageResizer = new _PdfImageResizer();
        const dimsSpy: jasmine.Spy = spyOn(resizer, '_areGoodDims');

        dimsSpy.and.callFake((width: number, height: number): boolean => {
            if (height === 1) {
                return width <= 7;
            }
            return width <= 6 && height === width;
        });

        // Act
        const defaultHeightResult: number = resizer._guessMax(4, 10, 0, 1);
        const middleHeightResult: number = resizer._guessMax(4, 10, 0, 0);

        // Assert
        expect(defaultHeightResult).toBe(7);
        expect(middleHeightResult).toBe(6);
        expect(dimsSpy).toHaveBeenCalled();
    });

    it('should cover _createImageData by creating a new resizer and delegating to _createImage', () => {
        // Arrange
        const resizer: _PdfImageResizer = new _PdfImageResizer();
        const expectedImageData: { width: number; height: number; marker: string } = {
            width: 12,
            height: 34,
            marker: 'created'
        };
        const createImageSpy: jasmine.Spy =
            spyOn(_PdfImageResizer.prototype, '_createImage').and.returnValue(expectedImageData);

        const imgData: { width: number; height: number; kind: number; data: Uint8Array } = {
            width: 3,
            height: 4,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array([1, 2, 3])
        };

        // Act
        const result: unknown = resizer._createImageData(imgData, true);

        // Assert
        expect(createImageSpy).toHaveBeenCalled();
        expect(result).toBe(expectedImageData);
    });

    it('should cover _createImage early return when oversized raw data is rescaled successfully', () => {
        // Arrange
        const oversizedSide: number = Math.max(2, Math.ceil(Math.sqrt((maximumCount / 4) + 1)));
        const imgData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: oversizedSide,
            height: oversizedSide,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array([1, 2, 3])
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(imgData, false);
        const expectedResult: { width: number; height: number; marker: string } = {
            width: 20,
            height: 10,
            marker: 'rescaled'
        };
        const rescaleSpy: jasmine.Spy = spyOn(resizer, '_rescaleImageData').and.returnValue(expectedResult);
        const encodeSpy: jasmine.Spy = spyOn(resizer, '_encodeBMP');

        // Act
        const result: unknown = resizer._createImage();

        // Assert
        expect(rescaleSpy).toHaveBeenCalled();
        expect(encodeSpy).not.toHaveBeenCalled();
        expect(result).toBe(expectedResult);
    });

    it('should cover _createImage continuation setup path and throw when bitmap source is undefined', () => {
        // Arrange
        const imgData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 10,
            height: 10,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array(30)
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(imgData, false);

        const encodeSpy: jasmine.Spy =
            spyOn(resizer, '_encodeBMP').and.returnValue(new Uint8Array([1, 2, 3, 4]));
        spyOnProperty(resizer, '_maximumArea', 'get').and.returnValue(25);
        spyOnProperty(resizer, '_maximumDim', 'get').and.returnValue(5);

        // Act / Assert
        expect(() => resizer._createImage()).toThrow();
        expect(encodeSpy).toHaveBeenCalled();
    });

    it('should cover _rescaleImageData branch that keeps resized raw data when the new image still needs resizing', () => {
        // Arrange
        const originalData: Uint8Array = new Uint8Array(4 * 4 * 3);
        const imgData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array | Uint32Array;
        } = {
            width: 4,
            height: 4,
            kind: imageKind.rgb24BPP,
            data: originalData
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(imgData, false);

        const log2Spy: jasmine.Spy = spyOn(Math, 'log2').and.returnValue(1);
        const convertSpy: jasmine.Spy = spyOn(ImageUtilsModule, '_convertToRGBA').and.callFake((
            kind: number,
            data: Uint8Array,
            dest: Uint32Array,
            width: number,
            height: number,
            isMask: boolean
        ): void => {
            for (let index: number = 0; index < width * height; index++) {
                dest[index] = index + 1;
            }
        });
        const needsResizeSpy: jasmine.Spy = spyOn(resizer, '_needsToBeResized').and.returnValue(true);

        // Act
        const result: unknown = resizer._rescaleImageData();

        // Assert
        expect(log2Spy).toHaveBeenCalled();
        expect(convertSpy).toHaveBeenCalledWith(
            imageKind.rgb24BPP,
            originalData,
            jasmine.any(Uint32Array),
            4,
            4,
            false
        );
        expect(needsResizeSpy).toHaveBeenCalledWith(2, 2);
        expect(result).toBeNull();
        expect(imgData.data instanceof Uint32Array).toBeTruthy();
        expect(imgData.width).toBe(2);
        expect(imgData.height).toBe(2);
        expect(imgData.kind).toBe(imageKind.rgba32BPP);
    });

    it('should cover _rescaleImageData branch that creates canvas image data when no further resize is needed', () => {
        // Arrange
        const imgData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array | null;
        } = {
            width: 4,
            height: 4,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array(4 * 4 * 3)
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(imgData, true);

        spyOn(Math, 'log2').and.returnValue(1);
        spyOn(ImageUtilsModule, '_convertToRGBA').and.callFake((
            kind: number,
            data: Uint8Array,
            dest: Uint32Array,
            width: number,
            height: number,
            isMask: boolean
        ): void => {
            for (let index: number = 0; index < width * height; index++) {
                dest[index] = 0xff00ff00;
            }
        });
        spyOn(resizer, '_needsToBeResized').and.returnValue(false);

        const context: _CanvasContextLike = _createCanvasContext(255);
        const canvas: _CanvasLike = _createCanvas(context);
        const createElementSpy: jasmine.Spy =
            spyOn(document, 'createElement').and.returnValue(canvas as unknown as HTMLCanvasElement);

        // Act
        const result: unknown = resizer._rescaleImageData();

        // Assert
        expect(createElementSpy).toHaveBeenCalledWith('canvas');
        expect(canvas.width).toBe(2);
        expect(canvas.height).toBe(2);
        expect(context.putImageData).toHaveBeenCalled();
        expect(result).toBe(imgData);
        expect(imgData.data).toBeNull();
        expect(imgData.width).toBe(2);
        expect(imgData.height).toBe(2);
    });

    it('should cover _encodeBMP grayscale branch for padded rows and both mask palette directions', () => {
        // Arrange
        const nonMaskData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 9,
            height: 2,
            kind: imageKind.grayScale1Bpp,
            data: new Uint8Array([0xaa, 0x80, 0xff, 0x00])
        };
        const maskData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 1,
            height: 1,
            kind: imageKind.grayScale1Bpp,
            data: new Uint8Array([0x80])
        };

        const nonMaskResizer: _PdfImageResizer = new _PdfImageResizer(nonMaskData, false);
        const maskResizer: _PdfImageResizer = new _PdfImageResizer(maskData, true);

        // Act
        const nonMaskBmp: Uint8Array = nonMaskResizer._encodeBMP();
        const maskBmp: Uint8Array = maskResizer._encodeBMP();

        // Assert
        const nonMaskView: DataView = new DataView(nonMaskBmp.buffer);
        const maskView: DataView = new DataView(maskBmp.buffer);

        expect(nonMaskView.getUint16(0, true)).toBe(0x4d42);
        expect(nonMaskView.getInt32(18, true)).toBe(9);
        expect(nonMaskView.getInt32(22, true)).toBe(-2);
        expect(nonMaskView.getUint16(28, true)).toBe(1);
        expect(nonMaskView.getUint32(34, true)).toBe(0);
        expect(nonMaskView.getUint32(46, true)).toBe(2);

        expect(maskView.getUint16(28, true)).toBe(1);
        expect(maskBmp[54]).toBe(255);
        expect(maskBmp[55]).toBe(255);
        expect(maskBmp[56]).toBe(255);
        expect(maskBmp[57]).toBe(255);
    });

    it('should cover _encodeBMP RGB24 branch for padded rows and in-place BGR conversion', () => {
        // Arrange
        const paddedRgbData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 1,
            height: 2,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array([
                10, 20, 30,
                40, 50, 60
            ])
        };
        const alignedRgbData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 4,
            height: 1,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array([
                1, 2, 3,
                4, 5, 6,
                7, 8, 9,
                10, 11, 12
            ])
        };

        const paddedResizer: _PdfImageResizer = new _PdfImageResizer(paddedRgbData, false);
        const alignedResizer: _PdfImageResizer = new _PdfImageResizer(alignedRgbData, false);

        // Act
        const paddedBmp: Uint8Array = paddedResizer._encodeBMP();
        const alignedBmp: Uint8Array = alignedResizer._encodeBMP();

        // Assert
        const paddedView: DataView = new DataView(paddedBmp.buffer);
        const alignedView: DataView = new DataView(alignedBmp.buffer);

        expect(paddedView.getUint16(0, true)).toBe(0x4d42);
        expect(paddedView.getUint16(28, true)).toBe(24);
        expect(paddedBmp[paddedBmp.length - 8]).toBe(30);
        expect(paddedBmp[paddedBmp.length - 7]).toBe(20);
        expect(paddedBmp[paddedBmp.length - 6]).toBe(10);

        expect(alignedView.getUint16(28, true)).toBe(24);
        expect(alignedRgbData.data[0]).toBe(3);
        expect(alignedRgbData.data[1]).toBe(2);
        expect(alignedRgbData.data[2]).toBe(1);
        expect(alignedRgbData.data[9]).toBe(12);
        expect(alignedRgbData.data[10]).toBe(11);
        expect(alignedRgbData.data[11]).toBe(10);
    });

    it('should cover _encodeBMP RGBA32 branch for little-endian and big-endian masks', () => {
        // Arrange
        const littleEndianData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 1,
            height: 1,
            kind: imageKind.rgba32BPP,
            data: new Uint8Array([1, 2, 3, 4])
        };
        const bigEndianData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 1,
            height: 1,
            kind: imageKind.rgba32BPP,
            data: new Uint8Array([5, 6, 7, 8])
        };

        const littleEndianResizer: _PdfImageResizer = new _PdfImageResizer(littleEndianData, false);
        const bigEndianResizer: _PdfImageResizer = new _PdfImageResizer(bigEndianData, false);

        const endianSpy: jasmine.Spy = spyOn(PdfBaseModule, '_isLittleEndian');
        endianSpy.and.returnValue(true);

        // Act
        const littleEndianBmp: Uint8Array = littleEndianResizer._encodeBMP();

        endianSpy.and.returnValue(false);
        const bigEndianBmp: Uint8Array = bigEndianResizer._encodeBMP();

        // Assert
        const littleEndianView: DataView = new DataView(littleEndianBmp.buffer);
        const bigEndianView: DataView = new DataView(bigEndianBmp.buffer);

        expect(littleEndianView.getUint16(0, true)).toBe(0x4d42);
        expect(littleEndianView.getUint16(28, true)).toBe(32);
        expect(littleEndianView.getUint32(30, true)).toBe(3);
        expect(littleEndianView.getUint32(54, true)).toBe(0x000000ff);
        expect(littleEndianView.getUint32(58, true)).toBe(0x0000ff00);
        expect(littleEndianView.getUint32(62, true)).toBe(0x00ff0000);
        expect(littleEndianView.getUint32(66, true)).toBe(0xff000000);

        expect(bigEndianView.getUint16(28, true)).toBe(32);
        expect(bigEndianView.getUint32(54, true)).toBe(0xff000000);
        expect(bigEndianView.getUint32(58, true)).toBe(0x00ff0000);
        expect(bigEndianView.getUint32(62, true)).toBe(0x0000ff00);
        expect(bigEndianView.getUint32(66, true)).toBe(0x000000ff);
    });

    it('should cover _encodeBMP default invalid format branch', () => {
        // Arrange
        const invalidData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 1,
            height: 1,
            kind: -999,
            data: new Uint8Array([1])
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(invalidData, false);

        // Act / Assert
        expect(() => resizer._encodeBMP()).toThrowError('invalid format');
    });
});
import { _PdfImageResizer } from '../../src/pdf-data-extract/core/image-extraction/image-resizer';
import { imageKind, maximumCount } from '../../src/pdf-data-extract/core/image-extraction/image-utils';



type _CanvasLike = {
    width: number;
    height: number;
    getContext: jasmine.Spy;
};


type _CanvasContextLike = {
    fillRect: jasmine.Spy;
 drawImage: jasmine.Spy;    getImageData: jasmine.Spy;
    putImageData: jasmine.Spy;
};

function _createCanvasContext(opacity: number): _CanvasContextLike {
    return {
        fillRect: jasmine.createSpy('fillRect'),
        getImageData: jasmine.createSpy('getImageData').and.returnValue({
            data: new Uint8ClampedArray([0, 0, 0, opacity])
        }),
        drawImage: jasmine.createSpy('drawImage'),
        putImageData: jasmine.createSpy('putImageData')
    };
}


describe('_PdfImageResizer highlighted-line coverage', () => {
    it('should cover _createImageData default isMask=false line and delegate to _createImage', () => {
        // Arrange
        const outerResizer: _PdfImageResizer = new _PdfImageResizer();
        const expectedImageData: { width: number; height: number; marker: string } = {
            width: 40,
            height: 20,
            marker: 'created'
        };
        const createImageSpy: jasmine.Spy =
            spyOn(_PdfImageResizer.prototype, '_createImage').and.returnValue(expectedImageData);
        const imgData: { width: number; height: number; kind: number; data: Uint8Array } = {
            width: 5,
            height: 6,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array([1, 2, 3])
        };

        // Act
        const result: unknown = outerResizer._createImageData(imgData);
        const createdInstance: _PdfImageResizer =
            createImageSpy.calls.mostRecent().object as _PdfImageResizer;
        const createdState: { _imgData?: unknown; _isMask?: boolean } =
            createdInstance as unknown as { _imgData?: unknown; _isMask?: boolean };

        // Assert
        expect(createImageSpy).toHaveBeenCalled();
        expect(createdState._imgData).toBe(imgData);
        expect(createdState._isMask).toBeFalsy();
        expect(result).toBe(expectedImageData);
    });

    it('should cover _createImage early return when oversized image returns rescaled data', () => {
        // Arrange
        const oversizedSide: number = Math.max(2, Math.ceil(Math.sqrt((maximumCount / 4) + 1)));
        const imgData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: oversizedSide,
            height: oversizedSide,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array([1, 2, 3])
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(imgData, false);
        const expectedResult: { width: number; height: number; marker: string } = {
            width: 20,
            height: 10,
            marker: 'rescaled'
        };
        const rescaleSpy: jasmine.Spy =
            spyOn(resizer, '_rescaleImageData').and.returnValue(expectedResult);
        const encodeSpy: jasmine.Spy = spyOn(resizer, '_encodeBMP');

        // Act
        const result: unknown = resizer._createImage();

        // Assert
        expect(rescaleSpy).toHaveBeenCalled();
        expect(encodeSpy).not.toHaveBeenCalled();
        expect(result).toBe(expectedResult);
    });

    it('should cover the reachable highlighted setup lines in _createImage and stop before the unreachable bitmap loop', () => {
        // Arrange
        const imgData: {
            width: number;
            height: number;
            kind: number;
            data: Uint8Array;
        } = {
            width: 10,
            height: 10,
            kind: imageKind.rgb24BPP,
            data: new Uint8Array(30)
        };
        const resizer: _PdfImageResizer = new _PdfImageResizer(imgData, false);
        const encodeSpy: jasmine.Spy =
            spyOn(resizer, '_encodeBMP').and.returnValue(new Uint8Array([1, 2, 3, 4]));
        const rescaleSpy: jasmine.Spy =
            spyOn(resizer, '_rescaleImageData').and.returnValue(null);

        spyOnProperty(resizer, '_maximumArea', 'get').and.returnValue(25);
        spyOnProperty(resizer, '_maximumDim', 'get').and.returnValue(5);

        // Act / Assert
        expect(() => resizer._createImage()).toThrow();
        expect(rescaleSpy).not.toHaveBeenCalled();
        expect(encodeSpy).toHaveBeenCalled();
    });
});

