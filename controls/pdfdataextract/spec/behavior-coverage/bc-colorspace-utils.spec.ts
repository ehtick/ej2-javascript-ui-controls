import {
    _isLittleEndian,
    _PdfBaseStream
} from '@syncfusion/ej2-pdf';
import {
    _PdfAlternateCS,
    _PdfCalGrayCS,
    _PdfColorPalette,
    _PdfColorRgbConverter,
    _PdfDeviceCmykCS,
    _PdfDeviceGrayCS,
    _PdfDeviceRgbCS,
    _PdfDeviceRgbaCS,
    _PdfIndexedCS,
    _PdfLabCS,
    _PdfPatternCS
} from '../../src/pdf-data-extract/core/image-extraction/colorspace';

type SourceBuffer = Uint8Array | Uint16Array | Uint8ClampedArray | Float32Array | number[];
type DestinationBuffer = Uint8Array | Uint8ClampedArray | Float32Array | number[];

class _TrackingPalette extends _PdfColorPalette {
    public usesZeroToOneRange: boolean = false;
    public passBits: number | null = null;
    public resizeCalls: Array<{
        src: Uint8Array;
        dest: Uint8Array;
        w1: number;
        h1: number;
        w2: number;
        h2: number;
        alpha01: number;
    }> = [];
    public rgbItemCalls: Array<{
        srcOffset: number;
        destOffset: number;
    }> = [];
    public rgbBufferCalls: Array<{
        srcOffset: number;
        count: number;
        destOffset: number;
        bits: number;
        alpha01: number;
    }> = [];
    public outputLengthValue: number = 3;

    constructor(name: string, numComps: number) {
        super(name, numComps);
    }

    _getRgbItem(src: SourceBuffer, srcOffset: number, dest: DestinationBuffer, destOffset: number): void {
        this.rgbItemCalls.push({ srcOffset, destOffset });
        const sourceEntry: number | undefined = src[srcOffset] as number | undefined;
        const sourceValue: number = Number(sourceEntry ?sourceEntry: 0);
        dest[destOffset] = sourceValue;
        dest[destOffset + 1] = sourceValue + 1;
        dest[destOffset + 2] = sourceValue + 2;
    }

    _getRgbBuffer(
        src: SourceBuffer,
        srcOffset: number,
        count: number,
        dest: DestinationBuffer,
        destOffset: number,
        bits: number,
        alpha01: number
    ): void {
        this.rgbBufferCalls.push({ srcOffset, count, destOffset, bits, alpha01 });

        if (src instanceof Uint8Array || src instanceof Uint16Array || src instanceof Uint8ClampedArray || src instanceof Float32Array) {
            let readOffset: number = srcOffset;
            let writeOffset: number = destOffset;

            for (let i: number = 0; i < count; i++) {
                const sourceEntry: number | undefined = src[readOffset];
                const baseValue: number = Number(sourceEntry ?sourceEntry: i);
                dest[writeOffset++] = baseValue;
                dest[writeOffset++] = baseValue + 1;
                dest[writeOffset++] = baseValue + 2;
                writeOffset += alpha01;
                readOffset += this.numComps > 1 ? this.numComps : 1;
            }
            return;
        }

        let readOffset: number = srcOffset;
        let writeOffset: number = destOffset;
        for (let i: number = 0; i < count; i++) {
            const sourceEntry: number | undefined = src[readOffset] as number | undefined;
            const baseValue: number = Number(sourceEntry ?sourceEntry: i);
            dest[writeOffset++] = baseValue;
            dest[writeOffset++] = baseValue + 1;
            dest[writeOffset++] = baseValue + 2;
            writeOffset += alpha01;
            readOffset += this.numComps > 1 ? this.numComps : 1;
        }
    }

    _getOutputLength(_inputLength: number, _alpha01: number): number {
        return this.outputLengthValue;
    }

    _isPass(bits: number): boolean {
        return this.passBits === bits;
    }

    _resizeRgbImage(src: Uint8Array, dest: Uint8Array, w1: number, h1: number, w2: number, h2: number, alpha01: number): void {
        this.resizeCalls.push({ src, dest, w1, h1, w2, h2, alpha01 });
        const copyLength: number = Math.min(src.length, dest.length);
        for (let i: number = 0; i < copyLength; i++) {
            dest[i] = src[i];
        }
    }
}

interface _LookupStreamLike extends _PdfBaseStream {
    getBytes(length: number): Uint8Array;
}

describe('Color space coverage - full AAA behavior', () => {
    it('should cover _PdfColorPalette constructor, default decode logic, getRgb helper, unreachable methods, pass flag and resize behavior', () => {
        // Arrange
        class _SimplePalette extends _PdfColorPalette {
            _getRgbItem(src: Uint8Array, srcOffset: number, dest: Uint8ClampedArray, destOffset: number): void {
                dest[destOffset] = src[srcOffset];
                dest[destOffset + 1] = src[srcOffset + 1];
                dest[destOffset + 2] = src[srcOffset + 2];
            }
        }

        const palette: _SimplePalette = new _SimplePalette('TestPalette', 3);
        const sourceRgb: Uint8Array = new Uint8Array([
            10, 20, 30,
            40, 50, 60,
            70, 80, 90,
            100, 110, 120
        ]);
        const resizedWithoutAlpha: Uint8Array = new Uint8Array(2 * 2 * 3);
        const resizedWithAlpha: Uint8Array = new Uint8Array(2 * 2 * 4);
        const defaultDecode: number[] = [0, 1, 0, 1, 0, 1];
        const nonDefaultDecode: number[] = [0, 1, 0, 0, 0, 1];
        const invalidLengthDecode: number[] = [0, 1];
        const notArrayDecode: string = 'invalid';

        // Act
        const rgb: Uint8ClampedArray = palette._getRgb(sourceRgb, 3);
        palette._resizeRgbImage(sourceRgb, resizedWithoutAlpha, 2, 2, 2, 2, 0);
        palette._resizeRgbImage(sourceRgb, resizedWithAlpha, 2, 2, 2, 2, 1);

        // Assert
        expect(palette.name).toBe('TestPalette');
        expect(palette.numComps).toBe(3);

        expect(palette._isDefaultDecode(notArrayDecode, 10)).toBeTruthy();
        expect(palette._isDefaultDecode(invalidLengthDecode, 10)).toBeTruthy();
        expect(palette._isDefaultDecode(defaultDecode, 10)).toBeTruthy();
        expect(palette._isDefaultDecode(nonDefaultDecode, 10)).toBeFalsy();

        expect(rgb.length).toBe(3);
        expect(rgb[0]).toBe(40);
        expect(rgb[1]).toBe(50);
        expect(rgb[2]).toBe(60);

        expect(resizedWithoutAlpha).toEqual(new Uint8Array([
            10, 20, 30,
            40, 50, 60,
            70, 80, 90,
            100, 110, 120
        ]));

        expect(resizedWithAlpha).toEqual(new Uint8Array([
            10, 20, 30, 0,
            40, 50, 60, 0,
            70, 80, 90, 0,
            100, 110, 120, 0
        ]));

        expect(() => new _PdfColorPalette('BaseOnly', 1)._getRgbItem(new Uint8Array([1]), 0, new Uint8Array(3), 0)).toThrow();
        expect(() => new _PdfColorPalette('BaseOnly', 1)._getRgbBuffer(new Uint8Array([1]), 0, 1, new Uint8Array(3), 0, 8, 0)).toThrow();
        expect(() => new _PdfColorPalette('BaseOnly', 1)._getOutputLength(1, 0)).toThrow();
        expect(new _PdfColorPalette('BaseOnly', 1)._isPass(8)).toBeFalsy();
    });

    it('should cover _PdfColorPalette._fillRgb pass-through paths with and without resizing', async () => {
        // Arrange
        const palette: _TrackingPalette = new _TrackingPalette('PassPalette', 3);
        palette.passBits = 8;

        const sourceComps: Uint8Array = new Uint8Array([
            1, 2, 3,
            4, 5, 6
        ]);
        const copyDest: Uint8Array = new Uint8Array(6);
        const resizeDest: Uint8Array = new Uint8Array(6);

        // Act
        const copyResult: Uint8Array = await palette._fillRgb(copyDest, 2, 1, 2, 1, 1, 8, sourceComps, 0) as Uint8Array;
        const resizeResult: Uint8Array = await palette._fillRgb(resizeDest, 2, 1, 1, 2, 2, 8, sourceComps, 0) as Uint8Array;

        // Assert
        expect(copyResult).toBe(copyDest);
        expect(copyDest).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));

        expect(resizeResult).toBe(resizeDest);
        expect(palette.resizeCalls.length).toBe(1);
        expect(palette.resizeCalls[0].w1).toBe(2);
        expect(palette.resizeCalls[0].h1).toBe(1);
        expect(palette.resizeCalls[0].w2).toBe(1);
        expect(palette.resizeCalls[0].h2).toBe(2);
        expect(palette.resizeCalls[0].alpha01).toBe(0);
        expect(resizeDest[0]).toBe(1);
        expect(resizeDest[1]).toBe(2);
        expect(resizeDest[2]).toBe(3);
    });

    it('should cover _PdfColorPalette._fillRgb mapped single-component optimization with and without resizing', async () => {
        // Arrange
        const palette: _TrackingPalette = new _TrackingPalette('MappedPalette', 1);
        const comps: Uint8Array = new Uint8Array([0, 1, 2, 3, 0]);
        const directDest: Uint8Array = new Uint8Array(5 * 3);
        const resizeDest: Uint8Array = new Uint8Array(5 * 3);

        // Act
        const directResult: Uint8Array = await palette._fillRgb(directDest, 5, 1, 5, 1, 1, 2, comps, 0) as Uint8Array;
        const resizeResult: Uint8Array = await palette._fillRgb(resizeDest, 5, 1, 1, 5, 5, 2, comps, 0) as Uint8Array;

        // Assert
        expect(directResult).toBe(directDest);
        expect(palette.rgbBufferCalls.length).toBeGreaterThanOrEqual(1);
        expect(directDest).toEqual(new Uint8Array([
            0, 1, 2,
            1, 2, 3,
            2, 3, 4,
            3, 4, 5,
            0, 1, 2
        ]));

        expect(resizeResult).toBe(resizeDest);
        expect(palette.resizeCalls.length).toBe(1);
        expect(palette.resizeCalls[0].src.length).toBe(15);
    });

    it('should cover _PdfColorPalette._fillRgb non-pass buffer generation with and without resizing', async () => {
        // Arrange
        const palette: _TrackingPalette = new _TrackingPalette('BufferedPalette', 3);
        const comps: Uint8Array = new Uint8Array([
            5, 6, 7,
            8, 9, 10
        ]);
        const directDest: Uint8Array = new Uint8Array(8);
        const resizeDest: Uint8Array = new Uint8Array(6);

        // Act
        const directResult: Uint8Array = await palette._fillRgb(directDest, 2, 1, 2, 1, 2, 4, comps, 1) as Uint8Array;
        const resizeResult: Uint8Array = await palette._fillRgb(resizeDest, 2, 1, 1, 2, 2, 4, comps, 0) as Uint8Array;

        // Assert
        expect(directResult).toBe(directDest);
        expect(palette.rgbBufferCalls[0].count).toBe(4);
        expect(palette.rgbBufferCalls[0].bits).toBe(4);
        expect(palette.rgbBufferCalls[0].alpha01).toBe(1);
        expect(directDest).toEqual(new Uint8Array([
            5, 6, 7, 0,
            8, 9, 10, 0
        ]));

        expect(resizeResult).toBe(resizeDest);
        expect(palette.rgbBufferCalls[1].count).toBe(2);
        expect(palette.resizeCalls.length).toBe(1);
    });

    it('should cover _PdfAlternateCS constructor, item conversion and zero-to-one buffer path', () => {
        // Arrange
        const basePalette: _TrackingPalette = new _TrackingPalette('BaseAlternate', 3);
        basePalette.usesZeroToOneRange = true;
        basePalette.passBits = 8;

        const alternate: _PdfAlternateCS = new _PdfAlternateCS(2, basePalette);
        const src: Uint8Array = new Uint8Array([10, 20, 30, 40]);
        const itemDest: Uint8ClampedArray = new Uint8ClampedArray(3);
        const bufferDest: Uint8Array = new Uint8Array(6);

        // Act
        alternate._getRgbItem(src, 0, itemDest, 0);
        alternate._getRgbBuffer(src, 0, 2, bufferDest, 0, 8, 0);

        // Assert
        expect(alternate.name).toBe('Alternate');
        expect(alternate.numComps).toBe(2);
        expect(basePalette.rgbItemCalls.length).toBe(1);
        expect(itemDest).toEqual(new Uint8ClampedArray([0, 1, 2]));

        expect(basePalette.rgbBufferCalls.length).toBe(0);
        expect(bufferDest).toEqual(new Uint8Array([
            0, 0, 0,
            0, 0, 0
        ]));
    });

    it('should cover _PdfAlternateCS non-pass buffer path through base getRgbItem and base getRgbBuffer', () => {
        // Arrange
        const basePalette: _TrackingPalette = new _TrackingPalette('BaseAlternateNonPass', 3);
        basePalette.usesZeroToOneRange = false;
        basePalette.passBits = null;

        const alternate: _PdfAlternateCS = new _PdfAlternateCS(2, basePalette);
        const src: Uint8Array = new Uint8Array([255, 128, 64, 32]);
        const bufferDest: Uint8Array = new Uint8Array(8);

        // Act
        alternate._getRgbBuffer(src, 0, 2, bufferDest, 0, 8, 1);

        // Assert
        expect(basePalette.rgbItemCalls.length).toBe(2);
        expect(basePalette.rgbBufferCalls.length).toBe(1);
        expect(basePalette.rgbBufferCalls[0].count).toBe(2);
        expect(basePalette.rgbBufferCalls[0].bits).toBe(8);
        expect(basePalette.rgbBufferCalls[0].alpha01).toBe(1);
        expect(bufferDest[0]).toBe(0);
        expect(bufferDest[1]).toBe(1);
        expect(bufferDest[2]).toBe(2);
        expect(bufferDest[4]).toBe(1);
        expect(bufferDest[5]).toBe(2);
        expect(bufferDest[6]).toBe(3);
    });

    it('should cover _PdfPatternCS constructor and invalid default decode call', () => {
        // Arrange
        const basePalette: _TrackingPalette = new _TrackingPalette('PatternBase', 3);
        const pattern: _PdfPatternCS = new _PdfPatternCS(basePalette);

        // Act / Assert
        expect(pattern.name).toBe('Pattern');
        expect(pattern.base).toBe(basePalette);
        expect(() => pattern._isDefaultDecode([], 8)).toThrowError('PatternCS._isDefaultDecode should not be called.');
    });

    it('should cover _PdfIndexedCS constructor branches, item conversion, buffer conversion, output length and decode checks', () => {
        // Arrange
        const basePalette: _TrackingPalette = new _TrackingPalette('IndexedBase', 3);
        basePalette.outputLengthValue = 4;

        const streamLookup: _LookupStreamLike = Object.create(_PdfBaseStream.prototype) as _LookupStreamLike;
        streamLookup.getBytes = (length: number): Uint8Array => new Uint8Array(Array.from({ length }, (_, index: number) => index + 1));

        const indexedFromStream: _PdfIndexedCS = new _PdfIndexedCS(basePalette, 1, streamLookup);
        const indexedFromString: _PdfIndexedCS = new _PdfIndexedCS(basePalette, 1, '\u0001\u0002\u0003\u0004\u0005\u0006');
        const itemDest: Uint8ClampedArray = new Uint8ClampedArray(3);
        const bufferDest: Uint8ClampedArray = new Uint8ClampedArray(8);
        const itemSrc: number[] = [-3.6];
        const bufferSrc: number[] = [0.2, 1.7];

        // Act
        indexedFromStream._getRgbItem(itemSrc, 0, itemDest, 0);
        indexedFromString._getRgbBuffer(bufferSrc, 0, 2, bufferDest, 0, 1, 1);

        // Assert
        expect(indexedFromStream.name).toBe('Indexed');
        expect(indexedFromStream.numComps).toBe(1);

        expect(basePalette.rgbBufferCalls[0].srcOffset).toBe(0);
        expect(basePalette.rgbBufferCalls[0].count).toBe(1);
        expect(itemDest).toEqual(new Uint8ClampedArray([1, 2, 3]));

        expect(basePalette.rgbBufferCalls[1].srcOffset).toBe(0);
        expect(basePalette.rgbBufferCalls[1].count).toBe(1);
        expect(basePalette.rgbBufferCalls[2].srcOffset).toBe(3);
        expect(basePalette.rgbBufferCalls[2].count).toBe(1);
        expect(bufferDest).toEqual(new Uint8ClampedArray([
            1, 2, 3, 0,
            4, 5, 6, 0
        ]));

        expect(indexedFromString._getOutputLength(2, 1)).toBe(4);
        expect(indexedFromString._isDefaultDecode('invalid' as unknown as number[], 8)).toBeTruthy();
        expect(indexedFromString._isDefaultDecode([0], 8)).toBeTruthy();
        expect(indexedFromString._isDefaultDecode([0, 255], 0)).toBeTruthy();
        expect(indexedFromString._isDefaultDecode([0, 255], 8)).toBeTruthy();
        expect(indexedFromString._isDefaultDecode([1, 255], 8)).toBeFalsy();

        expect(() => new _PdfIndexedCS(basePalette, 1, 42)).toBeTruthy();
    });

    it('should cover _PdfDeviceGrayCS item conversion, buffer conversion and output length', () => {
        // Arrange
        const gray: _PdfDeviceGrayCS = new _PdfDeviceGrayCS();
        const itemDest: Uint8ClampedArray = new Uint8ClampedArray(3);
        const bufferDest: Uint8ClampedArray = new Uint8ClampedArray(8);
        const itemSrc: number[] = [0.5];
        const bufferSrc: number[] = [0, 3];

        // Act
        gray._getRgbItem(itemSrc, 0, itemDest, 0);
        gray._getRgbBuffer(bufferSrc, 0, 2, bufferDest, 0, 2, 1);

        // Assert
        expect(gray.name).toBe('DeviceGray');
        expect(gray.numComps).toBe(1);
        expect(itemDest).toEqual(new Uint8ClampedArray([128, 128, 128]));
        expect(bufferDest).toEqual(new Uint8ClampedArray([
            0, 0, 0, 0,
            255, 255, 255, 0
        ]));
        expect(gray._getOutputLength(2, 1)).toBe(8);
    });

    it('should cover _PdfDeviceRgbCS item conversion, fast buffer copy, scaled buffer path, output length and pass check', () => {
        // Arrange
        const rgb: _PdfDeviceRgbCS = new _PdfDeviceRgbCS();
        const itemDest: Uint8ClampedArray = new Uint8ClampedArray(3);
        const fastDest: Uint8ClampedArray = new Uint8ClampedArray(6);
        const scaledDest: Uint8ClampedArray = new Uint8ClampedArray(8);
        const itemSrc: number[] = [0.1, 0.2, 0.3];
        const fastSrc: Uint8Array = new Uint8Array([11, 12, 13, 21, 22, 23]);
        const scaledSrc: number[] = [0, 1, 2, 3, 2, 1];

        // Act
        rgb._getRgbItem(itemSrc, 0, itemDest, 0);
        rgb._getRgbBuffer(fastSrc, 0, 2, fastDest, 0, 8, 0);
        rgb._getRgbBuffer(scaledSrc, 0, 2, scaledDest, 0, 2, 1);

        // Assert
        expect(rgb.name).toBe('DeviceRGB');
        expect(rgb.numComps).toBe(3);
        expect(itemDest).toEqual(new Uint8ClampedArray([26, 51, 76]));
        expect(fastDest).toEqual(new Uint8ClampedArray([11, 12, 13, 21, 22, 23]));
        expect(scaledDest).toEqual(new Uint8ClampedArray([
            0, 85, 170, 0,
            255, 170, 85, 0
        ]));
        expect(rgb._getOutputLength(6, 1)).toBe(8);
        expect(rgb._isPass(8)).toBeTruthy();
        expect(rgb._isPass(4)).toBeFalsy();
    });

    it('should cover _PdfDeviceRgbaCS resize, copy, output length, pass check and fillRgb branches', async () => {
        // Arrange
        const rgba: _PdfDeviceRgbaCS = new _PdfDeviceRgbaCS();
        const sourcePixels: Uint8Array = new Uint8Array([
            10, 20, 30, 40,
            50, 60, 70, 80,
            90, 100, 110, 120,
            130, 140, 150, 160
        ]);

        const resizedRgbDest: Uint8Array = new Uint8Array(2 * 3);
        const resizedMaskDest: Uint8Array = new Uint8Array(2 * 4);
        const copiedRgbDest: Uint8Array = new Uint8Array(2 * 3);
        const copiedMaskDest: Uint8Array = new Uint8Array(2 * 4);
        const fillResizeDest: Uint8Array = new Uint8Array(2 * 3);
        const fillCopyDest: Uint8Array = new Uint8Array(2 * 3);

        // Act
        rgba._resizeRgbaImage(sourcePixels, resizedRgbDest, 2, 2, 2, 1, 0);
        rgba._resizeRgbaImage(sourcePixels, resizedMaskDest, 2, 2, 2, 1, 1);
        rgba._copyRgbaImage(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), copiedRgbDest, 0);
        rgba._copyRgbaImage(new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]), copiedMaskDest, 1);
        const fillResizeResult: unknown = await rgba._fillRgb(fillResizeDest, 2, 2, 2, 1, 1, 8, sourcePixels, 0);
        const fillCopyResult: unknown = await rgba._fillRgb(fillCopyDest, 2, 1, 2, 1, 1, 8, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), 0);

        // Assert
        expect(rgba.name).toBe('DeviceRGBA');
        expect(rgba.numComps).toBe(4);

        expect(resizedRgbDest).toEqual(new Uint8Array([
            10, 20, 30,
            50, 60, 70
        ]));

        const resizedMask32: Uint32Array = new Uint32Array(resizedMaskDest.buffer);
        const source32: Uint32Array = new Uint32Array(sourcePixels.buffer);
        const rgbMask: number = _isLittleEndian() ? 0x00ffffff : 0xffffff00;
        expect(resizedMask32[0]).toBe(source32[0] & rgbMask);
        expect(resizedMask32[1]).toBe(source32[1] & rgbMask);

        expect(copiedRgbDest).toEqual(new Uint8Array([1, 2, 3, 5, 6, 7]));
        const copiedMask32: Uint32Array = new Uint32Array(copiedMaskDest.buffer);
        const inputMask32: Uint32Array = new Uint32Array(new Uint8Array([9, 10, 11, 12, 13, 14, 15, 16]).buffer);
        expect(copiedMask32[0]).toBe(inputMask32[0] & rgbMask);
        expect(copiedMask32[1]).toBe(inputMask32[1] & rgbMask);

        expect(rgba._getOutputLength(2, 0)).toBe(8);
        expect(rgba._isPass(8)).toBeTruthy();
        expect(rgba._isPass(1)).toBeFalsy();

        expect(fillResizeResult).toBeUndefined();
        expect(fillResizeDest).toEqual(new Uint8Array([
            10, 20, 30,
            50, 60, 70
        ]));

        expect(fillCopyResult).toBeUndefined();
        expect(fillCopyDest).toEqual(new Uint8Array([1, 2, 3, 5, 6, 7]));
    });

    it('should cover _PdfDeviceCmykCS conversion helpers, buffer loop and output length', () => {
        // Arrange
        const cmyk: _PdfDeviceCmykCS = new _PdfDeviceCmykCS();
        const itemDest: Uint8ClampedArray = new Uint8ClampedArray(3);
        const bufferDest: Uint8ClampedArray = new Uint8ClampedArray(8);
        const secondPixelDest: Uint8ClampedArray = new Uint8ClampedArray(3);
        const source: number[] = [
            0, 0, 0, 0,
            1, 1, 1, 1
        ];

        // Act
        cmyk._toRgb(source, 0, 1, itemDest, 0);
        cmyk._toRgb(source, 4, 1, secondPixelDest, 0);
        cmyk._getRgbItem(source, 0, itemDest, 0);
        cmyk._getRgbBuffer(source, 0, 2, bufferDest, 0, 1, 1);

        // Assert
        expect(cmyk.name).toBe('DeviceCMYK');
        expect(cmyk.numComps).toBe(4);

        expect(itemDest[0]).toBe(255);
        expect(itemDest[1]).toBe(255);
        expect(itemDest[2]).toBe(255);

        expect(bufferDest[0]).toBe(255);
        expect(bufferDest[1]).toBe(255);
        expect(bufferDest[2]).toBe(255);

        expect(bufferDest[4]).toBe(secondPixelDest[0]);
        expect(bufferDest[5]).toBe(secondPixelDest[1]);
        expect(bufferDest[6]).toBe(secondPixelDest[2]);

        expect(cmyk._getOutputLength(8, 1)).toBe(8);
    });

    it('should cover _PdfLabCS constructor guards, helpers, conversion branches, buffer loop, output length, decode and range flag', () => {
        // Arrange
        const lab: _PdfLabCS = new _PdfLabCS([1, 1, 0.5], [-1, -1, -1], [50, -50, 40, -40]);
        const labState: Record<string, number> = lab as unknown as Record<string, number>;
        const itemDest: Uint8Array = new Uint8Array(3);
        const bufferDest: Uint8Array = new Uint8Array(8);
        const directDest: Uint8Array = new Uint8Array(6);
        const itemSrc: Uint8Array = new Uint8Array([60, 200, 0]);
        const bufferSrc: Uint8Array = new Uint8Array([10, 0, 255, 255, 255, 0]);

        // Act
        const fngCubic: number = (lab as unknown as { _fng(x: number): number })._fng(1);
        const fngLinear: number = (lab as unknown as { _fng(x: number): number })._fng(0);
        const decoded: number = (lab as unknown as { _decode(value: number, high1: number, low2: number, high2: number): number })
            ._decode(5, 10, -100, 100);
        (lab as unknown as { _toRgb(src: Uint8Array, srcOffset: number, maxVal: boolean | number, dest: Uint8Array, destOffset: number): void })
            ._toRgb(itemSrc, 0, false, directDest, 0);
        lab._getRgbItem(itemSrc, 0, itemDest, 0);
        lab._getRgbBuffer(bufferSrc, 0, 2, bufferDest, 0, 8, 1);

        // Assert
        expect(lab.name).toBe('Lab');
        expect(lab.numComps).toBe(3);

        expect(labState._xb).toBe(0);
        expect(labState._yb).toBe(0);
        expect(labState._zb).toBe(0);
        expect(labState._amin).toBe(-100);
        expect(labState._amax).toBe(100);
        expect(labState._bmin).toBe(-100);
        expect(labState._bmax).toBe(100);

        expect(fngCubic).toBe(1);
        expect(fngLinear).toBeCloseTo((108 / 841) * (0 - 4 / 29), 10);
        expect(decoded).toBe(0);

        expect(directDest[0]).toBeGreaterThanOrEqual(0);
        expect(itemDest[0]).toBeGreaterThanOrEqual(0);
        expect(bufferDest[0]).toBeGreaterThanOrEqual(0);
        expect(bufferDest[4]).toBeGreaterThanOrEqual(0);

        expect(lab._getOutputLength(6, 1)).toBe(8);
        expect(lab._isDefaultDecode([], 8)).toBeTruthy();
        expect(lab.usesZeroToOneRange).toBeFalsy();

        expect(() => new _PdfLabCS()).toBeTruthy();
        expect(() => new _PdfLabCS([1, 0.5, 1])).toBeTruthy();
    });

    it('should cover _PdfCalGrayCS constructor guards, normalization, conversion, buffer loop and output length', () => {
        // Arrange
        const calGray: _PdfCalGrayCS = new _PdfCalGrayCS([1, 1, 1], [-1, -2, -3], 0.5);
        const calGrayState: Record<string, number> = calGray as unknown as Record<string, number>;
        const itemDest: number[] = [0, 0, 0];
        const bufferDest: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
        const firstScaledDest: number[] = [0, 0, 0];
        const secondScaledDest: number[] = [0, 0, 0];
        const src: number[] = [1, 3];

        // Act
        calGray._toRgb([1], 0, itemDest, 0, 1);
        calGray._toRgb([1], 0, firstScaledDest, 0, 1 / 3);
        calGray._toRgb([3], 0, secondScaledDest, 0, 1 / 3);
        calGray._getRgbItem([1], 0, itemDest, 0);
        calGray._getRgbBuffer(src, 0, 2, bufferDest, 0, 2, 1);

        // Assert
        expect(calGray.name).toBe('CalGray');
        expect(calGray.numComps).toBe(1);

        expect(calGrayState._xb).toBe(0);
        expect(calGrayState._yb).toBe(0);
        expect(calGrayState._zb).toBe(0);
        expect(calGrayState._g).toBe(1);

        expect(itemDest[0]).toBeCloseTo(255, 0);
        expect(itemDest[1]).toBeCloseTo(255, 0);
        expect(itemDest[2]).toBeCloseTo(255, 0);

        expect(bufferDest[0]).toBeCloseTo(firstScaledDest[0], 10);
        expect(bufferDest[1]).toBeCloseTo(firstScaledDest[1], 10);
        expect(bufferDest[2]).toBeCloseTo(firstScaledDest[2], 10);

        expect(bufferDest[4]).toBeCloseTo(secondScaledDest[0], 10);
        expect(bufferDest[5]).toBeCloseTo(secondScaledDest[1], 10);
        expect(bufferDest[6]).toBeCloseTo(secondScaledDest[2], 10);

        expect(calGray._getOutputLength(2, 1)).toBe(8);

        expect(() => new _PdfCalGrayCS(undefined as unknown as number[])).toBeTruthy();
        expect(() => new _PdfCalGrayCS([1, 0.8, 1])).toBeTruthy();
    });

    it('should cover _PdfColorRgbConverter constructor validation and matrix helper methods', () => {
        // Arrange
        const converter: _PdfColorRgbConverter = new _PdfColorRgbConverter(
            new Float32Array([0.95047, 1, 1.08883]),
            new Float32Array([-1, -1, -1]),
            new Float32Array([-1, -1, -1]),
            new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ])
        );
        const converterState: Record<string, unknown> = converter as unknown as Record<string, unknown>;
        const matrixResult: Float32Array = new Float32Array(3);
        const flatResult: Float32Array = new Float32Array(3);
        const d65Result: Float32Array = new Float32Array(3);

        // Act
        converter._matrixProduct(
            new Float32Array([
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            ]),
            new Float32Array([1, 2, 3]),
            matrixResult
        );
        converter._toFlat(new Float32Array([2, 4, 8]), new Float32Array([2, 8, 16]), flatResult);
        converter._toD65(new Float32Array([2, 4, 8]), new Float32Array([2, 8, 16]), d65Result);

        // Assert
        expect(converter.name).toBe('CalRGB');
        expect(converter.numComps).toBe(3);

        const blackPoint: Float32Array = converterState._blackPoint as Float32Array;
        expect(Array.from(blackPoint)).toEqual([0, 0, 0]);

        expect(converter.gr).toBe(1);
        expect(converter.gg).toBe(1);
        expect(converter.gb).toBe(1);

        expect(Array.from(matrixResult)).toEqual([14, 32, 50]);
        expect(Array.from(flatResult)).toEqual([1, 2, 2]);
        expect(d65Result[0]).toBeCloseTo(0.95047, 5);
        expect(d65Result[1]).toBeCloseTo(2, 5);
        expect(d65Result[2]).toBeCloseTo(2.17766, 5);

        expect(() => new _PdfColorRgbConverter(undefined as unknown as Float32Array)).toBeTruthy();
        expect(() => new _PdfColorRgbConverter(new Float32Array([1, 0.5, 1]))).toBeTruthy();
    });

    it('should cover _PdfColorRgbConverter transfer functions, decodeL, black-point compensation and white-point normalization branches', () => {
        // Arrange
        const converter: _PdfColorRgbConverter = new _PdfColorRgbConverter(
            new Float32Array([1, 1, 1]),
            new Float32Array([0.2, 0.3, 0.4]),
            new Float32Array([1, 1, 1]),
            new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ])
        );
        const blackCompensated: Float32Array = new Float32Array(3);
        const blackCompensatedZero: Float32Array = new Float32Array(3);
        const normalizedFlatIdentity: Float32Array = new Float32Array(3);
        const normalizedFlatScaled: Float32Array = new Float32Array(3);
        const normalizedD65: Float32Array = new Float32Array(3);

        // Act
        const lowTransfer: number = converter._srgbTransferFunction(0.001);
        const highTransfer: number = converter._srgbTransferFunction(0.999);
        const midTransfer: number = converter._srgbTransferFunction(0.5);

        const negativeDecodeL: number = converter._decodeL(-4);
        const greaterDecodeL: number = converter._decodeL(9);
        const smallDecodeL: number = converter._decodeL(4);

        converter._compensateBlackPoint(new Float32Array([0, 0, 0]), new Float32Array([0.1, 0.2, 0.3]), blackCompensatedZero);
        converter._compensateBlackPoint(new Float32Array([0.2, 0.3, 0.4]), new Float32Array([0.6, 0.7, 0.8]), blackCompensated);
        converter._normalizeWhitePointToFlat(new Float32Array([1, 1, 1]), new Float32Array([0.2, 0.3, 0.4]), normalizedFlatIdentity);
        converter._normalizeWhitePointToFlat(new Float32Array([0.95, 1, 1.09]), new Float32Array([0.2, 0.3, 0.4]), normalizedFlatScaled);
        converter._normalizeWhitePointToD65(new Float32Array([0.95, 1, 1.09]), new Float32Array([0.2, 0.3, 0.4]), normalizedD65);

        // Assert
        expect(lowTransfer).toBeCloseTo(0.01292, 5);
        expect(highTransfer).toBe(1);
        expect(midTransfer).toBeGreaterThan(0);
        expect(midTransfer).toBeLessThan(1);

        expect(negativeDecodeL).toBeLessThan(0);
        expect(greaterDecodeL).toBeCloseTo(((9 + 16) / 116) ** 3, 10);
        expect(smallDecodeL).toBeCloseTo(4 * converter.decodeConstant, 10);

        expect(blackCompensatedZero[0]).toBeCloseTo(0.1, 5);
        expect(blackCompensatedZero[1]).toBeCloseTo(0.2, 5);
        expect(blackCompensatedZero[2]).toBeCloseTo(0.3, 5);

        const zeroDecodeLValue: number = converter._decodeL(0);
        const xSourceDecoded: number = converter._decodeL(0.2);
        const ySourceDecoded: number = converter._decodeL(0.3);
        const zSourceDecoded: number = converter._decodeL(0.4);

        const xScale: number = (1 - zeroDecodeLValue) / (1 - xSourceDecoded);
        const yScale: number = (1 - zeroDecodeLValue) / (1 - ySourceDecoded);
        const zScale: number = (1 - zeroDecodeLValue) / (1 - zSourceDecoded);

        const xOffset: number = 1 - xScale;
        const yOffset: number = 1 - yScale;
        const zOffset: number = 1 - zScale;

        expect(blackCompensated[0]).toBeCloseTo(0.6 * xScale + xOffset, 5);
        expect(blackCompensated[1]).toBeCloseTo(0.7 * yScale + yOffset, 5);
        expect(blackCompensated[2]).toBeCloseTo(0.8 * zScale + zOffset, 5);

        expect(normalizedFlatIdentity[0]).toBeCloseTo(0.2, 5);
        expect(normalizedFlatIdentity[1]).toBeCloseTo(0.3, 5);
        expect(normalizedFlatIdentity[2]).toBeCloseTo(0.4, 5);

        expect(normalizedFlatScaled[0]).toBeGreaterThan(0);
        expect(normalizedFlatScaled[1]).toBeGreaterThan(0);
        expect(normalizedFlatScaled[2]).toBeGreaterThan(0);

        expect(normalizedD65[0]).toBeGreaterThan(0);
        expect(normalizedD65[1]).toBeGreaterThan(0);
        expect(normalizedD65[2]).toBeGreaterThan(0);
    });

    it('should cover _PdfColorRgbConverter RGB conversion, item conversion, buffer conversion and output length', () => {
        // Arrange
        const converter: _PdfColorRgbConverter = new _PdfColorRgbConverter(
            new Float32Array([1, 1, 1]),
            new Float32Array([0, 0, 0]),
            new Float32Array([1, 1, 1]),
            new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ])
        );
        const itemDest: Uint8ClampedArray = new Uint8ClampedArray(3);
        const bufferDest: Uint8ClampedArray = new Uint8ClampedArray(8);
        const source: number[] = [
            1, 1, 1,
            0.5, 0.25, 0.75
        ];

        // Act
        converter._toRgb(source, 0, itemDest, 0, 1);
        converter._getRgbItem(source, 0, itemDest, 0);
        converter._getRgbBuffer(source, 0, 2, bufferDest, 0, 1, 1);

        // Assert
        expect(itemDest[0]).toBeGreaterThanOrEqual(0);
        expect(itemDest[0]).toBeLessThanOrEqual(255);
        expect(itemDest[1]).toBeGreaterThanOrEqual(0);
        expect(itemDest[1]).toBeLessThanOrEqual(255);
        expect(itemDest[2]).toBeGreaterThanOrEqual(0);
        expect(itemDest[2]).toBeLessThanOrEqual(255);

        expect(bufferDest[0]).toBeGreaterThanOrEqual(0);
        expect(bufferDest[1]).toBeGreaterThanOrEqual(0);
        expect(bufferDest[2]).toBeGreaterThanOrEqual(0);
        expect(bufferDest[4]).toBeGreaterThanOrEqual(0);
        expect(bufferDest[5]).toBeGreaterThanOrEqual(0);
        expect(bufferDest[6]).toBeGreaterThanOrEqual(0);

        expect(converter._getOutputLength(6, 1)).toBe(8);
    });
});
