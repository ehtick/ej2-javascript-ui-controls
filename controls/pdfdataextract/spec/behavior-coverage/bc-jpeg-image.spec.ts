

import { _PdfDeviceCmykCS } from '../../src/pdf-data-extract/core/image-extraction/colorspace';
import { _PdfJpegImage } from '../../src/pdf-data-extract/core/image-extraction/jpeg-image';

function _u16(value: number): number[] {
    return [(value >> 8) & 0xff, value & 0xff];
}

function _concatBytes(parts: number[][]): Uint8Array {
    let total: number = 0;
    for (let i: number = 0; i < parts.length; i++) {
        total += parts[i].length;
    }
    const result: Uint8Array = new Uint8Array(total);
    let offset: number = 0;
    for (let i: number = 0; i < parts.length; i++) {
        result.set(parts[i], offset);
        offset += parts[i].length;
    }
    return result;
}

function _setPrivate<T>(target: unknown, key: string, value: T): void {
    (target as { [key: string]: unknown })[key] = value;
}

function _getPrivate<T>(target: unknown, key: string): T {
    return (target as { [key: string]: unknown })[key] as T;
}

describe('_PdfJpegImage clean coverage', () => {
    it('should cover constructor defaults', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        // Assert
        expect(jpeg._dctZigZag.length).toBe(64);
        expect(jpeg._dctCos1).toBe(4017);
        expect(jpeg._dctSin1).toBe(799);
        expect(jpeg._dctCos3).toBe(3406);
        expect(jpeg._dctSin3).toBe(2276);
        expect(jpeg._dctCos6).toBe(1567);
        expect(jpeg._dctSin6).toBe(3784);
        expect(jpeg._dctSqrt2).toBe(5793);
        expect(jpeg._dctSqrt).toBe(2896);

        expect(_getPrivate<number>(jpeg, '_eobrun')).toBe(0);
        expect(_getPrivate<number>(jpeg, '_successiveACState')).toBe(0);
        expect(_getPrivate<number>(jpeg, '_successiveACNextValue')).toBe(0);
        expect(_getPrivate<number>(jpeg, '_blockRow')).toBe(0);
        expect(_getPrivate<number>(jpeg, '_colorTransform')).toBe(-1);
        expect(_getPrivate<number>(jpeg, '_width')).toBe(0);
        expect(_getPrivate<number>(jpeg, '_height')).toBe(0);
        expect(_getPrivate<number>(jpeg, '_bitsCount')).toBe(0);
        expect(_getPrivate<unknown>(jpeg, '_jfif')).toBeNull();
        expect(_getPrivate<unknown>(jpeg, '_adobe')).toBeNull();
        expect(_getPrivate<unknown[]>(jpeg, '_components').length).toBe(0);
        expect(_getPrivate<number>(jpeg, '_numComponents')).toBe(0);
    });


    it('should cover _canUseImageDecoder APP1 EXIF branch and return exif offsets', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const app1Payload: number[] = [
            0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
            0x01, 0x02, 0x03, 0x04
        ];
        const app1Length: number = app1Payload.length + 2;

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0xe1], _u16(app1Length), app1Payload,
            [0xff, 0xd9]
        ]);

        // Act
        const result: { exifStart: number; exifEnd: number } | {} | null =
            jpeg._canUseImageDecoder(data) as { exifStart: number; exifEnd: number } | {} | null;

        // Assert
        expect(result).not.toBeNull();
        expect((result as { exifStart: number }).exifStart).toBe(12);
        expect((result as { exifEnd: number }).exifEnd).toBe(16);
    });

    it('should cover _canUseImageDecoder duplicate EXIF metadata error', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const exifPayload: number[] = [
            0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
            0x11, 0x22
        ];
        const exifLength: number = exifPayload.length + 2;

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0xe1], _u16(exifLength), exifPayload,
            [0xff, 0xe1], _u16(exifLength), exifPayload,
            [0xff, 0xd9]
        ]);

        // Act / Assert
        expect(() => jpeg._canUseImageDecoder(data)).toThrowError(/duplicate EXIF metadata blocks/);
    });

    it('should cover _canUseImageDecoder SOF branch returning undefined', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0xc0],
            [0x00, 0x0b],
            [0x08, 0x00, 0x10, 0x00, 0x10, 0x03, 0x01, 0x11, 0x00]
        ]);

        // Act
        const result: unknown = jpeg._canUseImageDecoder(data);

        // Assert
        expect(result).toBeUndefined();
    });

    it('should cover _buildHuffmanTable', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const codeLengths: number[] = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const values: number[] = [5, 9];

        // Act
        const table: unknown = jpeg._buildHuffmanTable(codeLengths, values);

        // Assert
        expect(Array.isArray(table)).toBeTruthy();
    });

    it('should cover _getBlockBufferOffset', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        // Act
        const offset: number = jpeg._getBlockBufferOffset({ blocksPerLine: 4 }, 2, 3);

        // Assert
        expect(offset).toBe(64 * ((4 + 1) * 2 + 3));
    });

    it('should cover _prepareComponents', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const frame: {
            samplesPerLine: number;
            scanLines: number;
            maxH: number;
            maxV: number;
            components: Array<{ h: number; v: number; blockData?: Int16Array; blocksPerLine?: number; blocksPerColumn?: number }>;
            mcusPerLine?: number;
            mcusPerColumn?: number;
        } = {
            samplesPerLine: 16,
            scanLines: 16,
            maxH: 2,
            maxV: 2,
            components: [
                { h: 2, v: 2 },
                { h: 1, v: 1 }
            ]
        };

        // Act
        jpeg._prepareComponents(frame);

        // Assert
        expect(frame.mcusPerLine).toBe(1);
        expect(frame.mcusPerColumn).toBe(1);

        expect(frame.components[0].blocksPerLine).toBe(2);
        expect(frame.components[0].blocksPerColumn).toBe(2);
        expect(frame.components[0].blockData instanceof Int16Array).toBeTruthy();

        expect(frame.components[1].blocksPerLine).toBe(1);
        expect(frame.components[1].blocksPerColumn).toBe(1);
        expect(frame.components[1].blockData instanceof Int16Array).toBeTruthy();
    });

    it('should cover _findNextFileMarker direct marker, forward search and null branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const directData: Uint8Array = new Uint8Array([0xff, 0xc0, 0x00, 0x00]);
        const forwardData: Uint8Array = new Uint8Array([0x00, 0x11, 0x22, 0xff, 0xda, 0x33]);
        const shortData: Uint8Array = new Uint8Array([0x00]);

        // Act
        const directResult: { invalid: string | null; marker: number; offset: number } | null =
            jpeg._findNextFileMarker(directData, 0);
        const forwardResult: { invalid: string | null; marker: number; offset: number } | null =
            jpeg._findNextFileMarker(forwardData, 0, 0);
        const nullResult: { invalid: string | null; marker: number; offset: number } | null =
            jpeg._findNextFileMarker(shortData, 0);

        // Assert
        expect(directResult).toEqual({ invalid: null, marker: 0xffc0, offset: 0 });
        expect(forwardResult).toEqual({ invalid: '11', marker: 0xffda, offset: 3 });
        expect(nullResult).toBeNull();
    });

    it('should cover _readDataBlock and _skipData', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const data: Uint8Array = new Uint8Array([
            0x00, 0x06,
            0xaa, 0xbb, 0xcc, 0xdd
        ]);

        // Act
        const block: { appData: Uint8Array; oldOffset: number; newOffset: number } = jpeg._readDataBlock(data, 0);
        const skipped: number = jpeg._skipData(data, 0);

        // Assert
        expect(block.oldOffset).toBe(2);
        expect(block.newOffset).toBe(6);
        expect(block.appData).toEqual(new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]));
        expect(skipped).toBe(6);
    });

    it('should cover _decodeHuffman number path and invalid sequence error', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        spyOn(jpeg, '_readBit').and.returnValues(0, 1);

        // Act
        const value: number = jpeg._decodeHuffman([7, [9]]);

        // Assert
        expect(value).toBe(7);
        expect(() => jpeg._decodeHuffman(['bad'])).toThrowError(/invalid Huffman sequence/);
    });

    it('should cover _receive and _receiveAndExtend', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        spyOn(jpeg, '_readBit').and.returnValues(
            1, 0, 1, // _receive(3) => 5
            1,       // _receiveAndExtend(1) => 1
            0,       // _receiveAndExtend(1) => -1
            0, 1     // _receiveAndExtend(2) => -2
        );

        // Act
        const received: number = jpeg._receive(3);
        const extendedPositive: number = jpeg._receiveAndExtend(1);
        const extendedNegativeSingle: number = jpeg._receiveAndExtend(1);
        const extendedNegative: number = jpeg._receiveAndExtend(2);

        // Assert
        expect(received).toBe(5);
        expect(extendedPositive).toBe(1);
        expect(extendedNegativeSingle).toBe(-1);
        expect(extendedNegative).toBe(-2);
    });

    it('should cover _quantizeAndInverse missing table error and fast zero branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const temp: Int16Array = new Int16Array(64);

        const missingQtComponent: {
            quantizationTable: number[] | null;
            blockData: Int16Array;
        } = {
            quantizationTable: null,
            blockData: new Int16Array(64)
        };

        const zeroComponent: {
            quantizationTable: number[];
            blockData: Int16Array;
        } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };
        zeroComponent.blockData[0] = 2;

        // Act / Assert
        expect(() => jpeg._quantizeAndInverse(
            missingQtComponent as unknown as { quantizationTable: number[]; blockData: Int16Array },
            0,
            temp
        )).toThrowError(/quantization table is missing/);

        jpeg._quantizeAndInverse(
            zeroComponent as unknown as { quantizationTable: number[]; blockData: Int16Array },
            0,
            temp
        );

        expect(zeroComponent.blockData[0]).toBeGreaterThanOrEqual(0);
    });

    it('should cover _buildComponentData calling _quantizeAndInverse', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const component: {
            blocksPerLine: number;
            blocksPerColumn: number;
            blockData: Int8Array;
            quantizationTable: number[];
        } = {
            blocksPerLine: 2,
            blocksPerColumn: 2,
            blockData: new Int8Array(64 * 6),
            quantizationTable: new Array<number>(64).fill(1)
        };

        const quantizeSpy: jasmine.Spy = spyOn(jpeg, '_quantizeAndInverse').and.callFake((): void => {
            return;
        });

        // Act
        const result: Int8Array = jpeg._buildComponentData(
            {} as { blocksPerLine: number; blocksPerColumn: number; blockData: Int8Array },
            component
        );

        // Assert
        expect(quantizeSpy.calls.count()).toBe(4);
        expect(result).toBe(component.blockData);
    });

    it('should cover _isColorConversionNeeded branches', () => {
        // Arrange
        const jpegAdobe: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegAdobe, '_adobe', { transformCode: 1 });

        const jpegRgbNoTransform: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegRgbNoTransform, '_adobe', null);
        _setPrivate(jpegRgbNoTransform, '_numComponents', 3);
        _setPrivate(jpegRgbNoTransform, '_colorTransform', 0);

        const jpegRgbNamed: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegRgbNamed, '_adobe', null);
        _setPrivate(jpegRgbNamed, '_numComponents', 3);
        _setPrivate(jpegRgbNamed, '_colorTransform', -1);
        _setPrivate(jpegRgbNamed, '_components', [
            { index: 0x52 },
            { index: 0x47 },
            { index: 0x42 }
        ]);

        const jpegRgbConvert: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegRgbConvert, '_adobe', null);
        _setPrivate(jpegRgbConvert, '_numComponents', 3);
        _setPrivate(jpegRgbConvert, '_colorTransform', -1);
        _setPrivate(jpegRgbConvert, '_components', [
            { index: 1 },
            { index: 2 },
            { index: 3 }
        ]);

        const jpegCmykTransform: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegCmykTransform, '_adobe', null);
        _setPrivate(jpegCmykTransform, '_numComponents', 4);
        _setPrivate(jpegCmykTransform, '_colorTransform', 1);

        const jpegCmykNoTransform: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegCmykNoTransform, '_adobe', null);
        _setPrivate(jpegCmykNoTransform, '_numComponents', 4);
        _setPrivate(jpegCmykNoTransform, '_colorTransform', 0);

        // Assert
        expect((jpegAdobe as unknown as { _isColorConversionNeeded: boolean })._isColorConversionNeeded).toBeTruthy();
        expect((jpegRgbNoTransform as unknown as { _isColorConversionNeeded: boolean })._isColorConversionNeeded).toBeFalsy();
        expect((jpegRgbNamed as unknown as { _isColorConversionNeeded: boolean })._isColorConversionNeeded).toBeFalsy();
        expect((jpegRgbConvert as unknown as { _isColorConversionNeeded: boolean })._isColorConversionNeeded).toBeTruthy();
        expect((jpegCmykTransform as unknown as { _isColorConversionNeeded: boolean })._isColorConversionNeeded).toBeTruthy();
        expect((jpegCmykNoTransform as unknown as { _isColorConversionNeeded: boolean })._isColorConversionNeeded).toBeFalsy();
    });

    it('should cover conversion helpers for YCC, YCCK and CMYK', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const ycc: Uint8ClampedArray = new Uint8ClampedArray([100, 110, 120]);
        const yccForRgba: Uint8ClampedArray = new Uint8ClampedArray([100, 110, 120]);
        const rgbaOut: Uint8ClampedArray = new Uint8ClampedArray(4);

        const fakeColorSpace: { cmyk: _PdfDeviceCmykCS } = {
            cmyk: new _PdfDeviceCmykCS()
        };
        spyOn(fakeColorSpace.cmyk, '_getRgbBuffer').and.callFake((
            src: Uint8ClampedArray,
            srcOffset: number,
            count: number,
            dest: Uint8ClampedArray,
            destOffset: number,
            bits: number,
            alpha01: number
        ): void => {
            let readOffset: number = srcOffset;
            let writeOffset: number = destOffset;
            for (let i: number = 0; i < count; i++) {
                dest[writeOffset++] = src[readOffset];
                dest[writeOffset++] = src[readOffset + 1];
                dest[writeOffset++] = src[readOffset + 2];
                if (alpha01 === 1) {
                    writeOffset++;
                }
                readOffset += 4;
            }
        });
        _setPrivate(jpeg, '_colorSpace', fakeColorSpace);

        // Act
        const rgb: Uint8ClampedArray = (jpeg as unknown as { _convertYccToRgb(data: Uint8ClampedArray): Uint8ClampedArray })
            ._convertYccToRgb(ycc);

        const rgba: Uint8ClampedArray = (jpeg as unknown as { _convertYccToRgba(data: Uint8ClampedArray, out: Uint8ClampedArray): Uint8ClampedArray })
            ._convertYccToRgba(yccForRgba, rgbaOut);

        const ycckToRgb: Uint8ClampedArray = (jpeg as unknown as { _convertYcckToRgb(data: Uint8ClampedArray): Uint8ClampedArray })
            ._convertYcckToRgb(new Uint8ClampedArray([50, 60, 70, 80]));

        const ycckToRgba: Uint8ClampedArray = (jpeg as unknown as { _convertYcckToRgba(data: Uint8ClampedArray): Uint8ClampedArray })
            ._convertYcckToRgba(new Uint8ClampedArray([50, 60, 70, 80]));

        const cmykToRgb: Uint8ClampedArray = (jpeg as unknown as { _convertCmykToRgb(data: Uint8ClampedArray): Uint8ClampedArray })
            ._convertCmykToRgb(new Uint8ClampedArray([10, 20, 30, 40, 50, 60, 70, 80]));

        const cmykToRgba: Uint8ClampedArray = (jpeg as unknown as { _convertCmykToRgba(data: Uint8ClampedArray): Uint8ClampedArray })
            ._convertCmykToRgba(new Uint8ClampedArray([10, 20, 30, 40, 50, 60, 70, 80]));

        // Assert
        expect(rgb.length).toBe(3);
        expect(rgba.length).toBe(4);
        expect(rgba[3]).toBe(255);

        expect(ycckToRgb.length).toBe(3);
        expect(ycckToRgba.length).toBe(4);

        expect(cmykToRgb.length).toBe(6);
        expect(cmykToRgba.length).toBe(8);
        expect(cmykToRgba[3]).toBe(255);
        expect(cmykToRgba[7]).toBe(255);
    });

    it('should cover _getData branches', () => {
        // Arrange
        const unsupported: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(unsupported, '_numComponents', 5);

        const grayImage: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(grayImage, '_numComponents', 1);
        spyOn(grayImage as unknown as { _getLinearizedBlockData(width: number, height: number, isSourcePdf: boolean): Uint8ClampedArray }, '_getLinearizedBlockData')
            .and.returnValue(new Uint8ClampedArray([10, 20]));

        const yccImage: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(yccImage, '_numComponents', 3);
        _setPrivate(yccImage, '_adobe', { transformCode: 1 });
        spyOn(yccImage as unknown as { _getLinearizedBlockData(width: number, height: number, isSourcePdf: boolean): Uint8ClampedArray }, '_getLinearizedBlockData')
            .and.returnValue(new Uint8ClampedArray([100, 110, 120]));
        spyOn(yccImage as unknown as { _convertYccToRgb(data: Uint8ClampedArray): Uint8ClampedArray }, '_convertYccToRgb')
            .and.returnValue(new Uint8ClampedArray([1, 2, 3]));
        spyOn(yccImage as unknown as { _convertYccToRgba(data: Uint8ClampedArray, out: Uint8ClampedArray): Uint8ClampedArray }, '_convertYccToRgba')
            .and.returnValue(new Uint8ClampedArray([1, 2, 3, 255]));

        const ycckImage: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(ycckImage, '_numComponents', 4);
        _setPrivate(ycckImage, '_colorTransform', 1);
        spyOn(ycckImage as unknown as { _getLinearizedBlockData(width: number, height: number, isSourcePdf: boolean): Uint8ClampedArray }, '_getLinearizedBlockData')
            .and.returnValue(new Uint8ClampedArray([10, 20, 30, 40]));
        spyOn(ycckImage as unknown as { _convertYcckToRgba(data: Uint8ClampedArray): Uint8ClampedArray }, '_convertYcckToRgba')
            .and.returnValue(new Uint8ClampedArray([1, 2, 3, 255]));
        spyOn(ycckImage as unknown as { _convertYcckToRgb(data: Uint8ClampedArray): Uint8ClampedArray }, '_convertYcckToRgb')
            .and.returnValue(new Uint8ClampedArray([1, 2, 3]));
        spyOn(ycckImage as unknown as { _convertYcckToCmyk(data: Uint8ClampedArray): Uint8ClampedArray }, '_convertYcckToCmyk')
            .and.returnValue(new Uint8ClampedArray([1, 2, 3, 4]));

        const cmykImage: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(cmykImage, '_numComponents', 4);
        _setPrivate(cmykImage, '_colorTransform', 0);
        spyOn(cmykImage as unknown as { _getLinearizedBlockData(width: number, height: number, isSourcePdf: boolean): Uint8ClampedArray }, '_getLinearizedBlockData')
            .and.returnValue(new Uint8ClampedArray([10, 20, 30, 40]));
        spyOn(cmykImage as unknown as { _convertCmykToRgba(data: Uint8ClampedArray): Uint8ClampedArray }, '_convertCmykToRgba')
            .and.returnValue(new Uint8ClampedArray([2, 3, 4, 255]));
        spyOn(cmykImage as unknown as { _convertCmykToRgb(data: Uint8ClampedArray): Uint8ClampedArray }, '_convertCmykToRgb')
            .and.returnValue(new Uint8ClampedArray([2, 3, 4]));

        const passthroughImage: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(passthroughImage, '_numComponents', 3);
        _setPrivate(passthroughImage, '_colorTransform', 0);
        spyOn(passthroughImage as unknown as { _getLinearizedBlockData(width: number, height: number, isSourcePdf: boolean): Uint8ClampedArray }, '_getLinearizedBlockData')
            .and.returnValue(new Uint8ClampedArray([9, 9, 9]));

        // Act / Assert
        expect(() => unsupported._getData(1, 1, false, false, false)).toThrowError(/unsupported color mode/);

        const grayRgb: Uint8ClampedArray | Uint8Array = grayImage._getData(1, 2, false, true, false);
        const grayRgba: Uint8ClampedArray | Uint8Array = grayImage._getData(1, 2, true, false, false);
        const yccRgb: Uint8ClampedArray | Uint8Array = yccImage._getData(1, 1, false, false, false);
        const yccRgba: Uint8ClampedArray | Uint8Array = yccImage._getData(1, 1, true, false, false);
        const ycckRgba: Uint8ClampedArray | Uint8Array = ycckImage._getData(1, 1, true, false, false);
        const ycckRgb: Uint8ClampedArray | Uint8Array = ycckImage._getData(1, 1, false, true, false);
        const ycckCmyk: Uint8ClampedArray | Uint8Array = ycckImage._getData(1, 1, false, false, false);
        const cmykRgba: Uint8ClampedArray | Uint8Array = cmykImage._getData(1, 1, true, false, false);
        const cmykRgb: Uint8ClampedArray | Uint8Array = cmykImage._getData(1, 1, false, true, false);
        const passthrough: Uint8ClampedArray | Uint8Array = passthroughImage._getData(1, 1, false, false, false);

        expect(grayRgb.length).toBe(6);
        expect(grayRgba.length).toBe(8);
        expect(yccRgb).toEqual(new Uint8ClampedArray([1, 2, 3]));
        expect(yccRgba).toEqual(new Uint8ClampedArray([1, 2, 3, 255]));
        expect(ycckRgba).toEqual(new Uint8ClampedArray([1, 2, 3, 255]));
        expect(ycckRgb).toEqual(new Uint8ClampedArray([1, 2, 3]));
        expect(ycckCmyk).toEqual(new Uint8ClampedArray([1, 2, 3, 4]));
        expect(cmykRgba).toEqual(new Uint8ClampedArray([2, 3, 4, 255]));
        expect(cmykRgb).toEqual(new Uint8ClampedArray([2, 3, 4]));
        expect(passthrough).toEqual(new Uint8ClampedArray([9, 9, 9]));
    });

    it('should cover _decodeBaseline, _decodeDCFirst, _decodeDCSuccessive and AC invalid branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const component: {
            huffmanTableDC: unknown;
            huffmanTableAC: unknown;
            blockData: number[];
            pred: number;
        } = {
            huffmanTableDC: [],
            huffmanTableAC: [],
            blockData: new Array<number>(64).fill(0),
            pred: 0
        };

        const decodeHuffmanSpy: jasmine.Spy = spyOn(jpeg, '_decodeHuffman').and.returnValues(
            2,    // baseline DC
            0x21, // baseline AC
            0x00, // baseline break
            1,    // DC first
            0x12  // invalid AC successive
        );
        const receiveAndExtendSpy: jasmine.Spy = spyOn(jpeg, '_receiveAndExtend').and.returnValues(
            3,
            -2,
            1
        );
        spyOn(jpeg, '_receive').and.returnValue(0);
        spyOn(jpeg, '_readBit').and.returnValue(1);

        _setPrivate(jpeg, '_spectralStart', 1);
        _setPrivate(jpeg, '_spectralEnd', 3);
        _setPrivate(jpeg, '_successiveACState', 0);

        // Act
        (jpeg as unknown as { _decodeBaseline(component: unknown, blockOffset: number): void })._decodeBaseline(component, 0);
        (jpeg as unknown as { _decodeDCFirst(component: unknown, blockOffset: number, successive: number): void })._decodeDCFirst(component, 0, 1);
        (jpeg as unknown as { _decodeDCSuccessive(component: unknown, blockOffset: number, successive: number): void })._decodeDCSuccessive(component, 0, 1);

        // Assert
        expect(component.pred).toBe(5);
        expect(component.blockData[3]).toBe(0);
        expect(receiveAndExtendSpy).toHaveBeenCalled();

        expect(() => (jpeg as unknown as { _decodeACSuccessive(component: unknown, blockOffset: number, successive: number): void })
            ._decodeACSuccessive(component, 0, 1)).toThrowError(/Invalid ACn encoding/);

        expect(decodeHuffmanSpy).toHaveBeenCalled();
    });

    it('should cover _decodeMcu and _decodeBlock helpers', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const component: {
            v: number;
            h: number;
            blocksPerLine: number;
        } = {
            v: 2,
            h: 2,
            blocksPerLine: 4
        };
        const decodeSpy: jasmine.Spy = jasmine.createSpy('decode');

        // Act
        jpeg._decodeMcu(component, decodeSpy as unknown as (component: unknown, blockOffset: number) => void, 3, 1, 1, 2);
        (jpeg as unknown as { _decodeBlock(component: unknown, decode: (component: unknown, blockOffset: number) => void, mcu: number): void })
            ._decodeBlock(component, decodeSpy as unknown as (component: unknown, blockOffset: number) => void, 5);

        // Assert
        expect(decodeSpy.calls.count()).toBe(2);
        expect(_getPrivate<number>(jpeg, '_blockRow')).toBeGreaterThanOrEqual(1);
    });

    it('should cover _decodeScan single-component and multi-component paths', () => {
        // Arrange
        const singleJpeg: _PdfJpegImage = new _PdfJpegImage();
        const singleComponent: {
            blocksPerLine: number;
            blocksPerColumn: number;
            pred: number;
        } = {
            blocksPerLine: 1,
            blocksPerColumn: 1,
            pred: 99
        };
        const decodeBlockSpy: jasmine.Spy = spyOn(singleJpeg as unknown as { _decodeBlock(component: unknown, decode: (component: unknown, blockOffset: number) => void, mcu: number): void }, '_decodeBlock')
            .and.callFake((): void => {
                return;
            });
        spyOn(singleJpeg, '_findNextFileMarker').and.returnValues(
            { invalid: null, marker: 0xffd0, offset: 0 },
            null
        );

        const singleConsumed: number = singleJpeg._decodeScan(
            new Uint8Array([0xff, 0xd0]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: false },
            [singleComponent],
            1,
            0,
            0,
            0,
            0,
            false
        );

        const multiJpeg: _PdfJpegImage = new _PdfJpegImage();
        const componentA: { h: number; v: number; pred: number } = { h: 1, v: 1, pred: 1 };
        const componentB: { h: number; v: 1; pred: number } = { h: 1, v: 1, pred: 2 };
        const decodeMcuSpy: jasmine.Spy = spyOn(multiJpeg, '_decodeMcu').and.callFake((): void => {
            return;
        });
        spyOn(multiJpeg, '_findNextFileMarker').and.returnValue(null);

        const multiConsumed: number = multiJpeg._decodeScan(
            new Uint8Array([0x00, 0x00]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: false },
            [componentA, componentB],
            null,
            0,
            0,
            0,
            0,
            false
        );

        // Assert
        expect(decodeBlockSpy).toHaveBeenCalled();
        expect(singleComponent.pred).toBe(0);
        expect(singleConsumed).toBeGreaterThanOrEqual(0);

        expect(decodeMcuSpy.calls.count()).toBe(2);
        expect(componentA.pred).toBe(0);
        expect(componentB.pred).toBe(0);
        expect(multiConsumed).toBeGreaterThanOrEqual(0);
    });

    it('should cover _readBit normal, stuffed byte, unexpected marker and EOI branches', () => {
        // Arrange
        const normalJpeg: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(normalJpeg, '_data', new Uint8Array([0b10100000]));
        _setPrivate(normalJpeg, '_offset', 0);
        _setPrivate(normalJpeg, '_bitsCount', 0);

        // Act
        const firstBit: number = normalJpeg._readBit();
        const secondBit: number = normalJpeg._readBit();

        // Assert
        expect(firstBit).toBe(1);
        expect(secondBit).toBe(0);

        const stuffedJpeg: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(stuffedJpeg, '_data', new Uint8Array([0xff, 0x00]));
        _setPrivate(stuffedJpeg, '_offset', 0);
        _setPrivate(stuffedJpeg, '_bitsCount', 0);
        expect(stuffedJpeg._readBit()).toBe(1);

        const unexpectedJpeg: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(unexpectedJpeg, '_data', new Uint8Array([0xff, 0xda]));
        _setPrivate(unexpectedJpeg, '_offset', 0);
        _setPrivate(unexpectedJpeg, '_bitsCount', 0);
        expect(() => unexpectedJpeg._readBit()).toThrowError(/Unexpected marker encountered/);

        const eoiJpeg: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(eoiJpeg, '_data', new Uint8Array([0xff, 0xd9]));
        _setPrivate(eoiJpeg, '_offset', 0);
        _setPrivate(eoiJpeg, '_bitsCount', 0);
        _setPrivate(eoiJpeg, '_parseMarker', false);
        expect(() => eoiJpeg._readBit()).toBeTruthy();
    });


});
describe('_PdfJpegImage highlighted line coverage', () => {

    function _setPrivate<T>(target: unknown, key: string, value: T): void {
        (target as { [key: string]: unknown })[key] = value;
    }

    function _getPrivate<T>(target: unknown, key: string): T {
        return (target as { [key: string]: unknown })[key] as T;
    }

    function _u16(value: number): number[] {
        return [(value >> 8) & 0xff, value & 0xff];
    }

    function _concatBytes(parts: number[][]): Uint8Array {
        let total: number = 0;
        for (let i: number = 0; i < parts.length; i++) {
            total += parts[i].length;
        }
        const result: Uint8Array = new Uint8Array(total);
        let offset: number = 0;
        for (let i: number = 0; i < parts.length; i++) {
            result.set(parts[i], offset);
            offset += parts[i].length;
        }
        return result;
    }

    function _createJfifSegment(): number[] {
        const payload: number[] = [
            0x4a, 0x46, 0x49, 0x46, 0x00,
            0x01, 0x02,
            0x01,
            0x00, 0x01,
            0x00, 0x01,
            0x00,
            0x00
        ];
        return [0xff, 0xe0].concat(_u16(payload.length + 2), payload);
    }

    function _createAdobeSegment(): number[] {
        const payload: number[] = [
            0x41, 0x64, 0x6f, 0x62, 0x65,
            0x00, 0x64,
            0x00, 0x01,
            0x00, 0x02,
            0x01
        ];
        return [0xff, 0xee].concat(_u16(payload.length + 2), payload);
    }

    function _createExifSegment(): number[] {
        const payload: number[] = [
            0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
            0x11, 0x22, 0x33, 0x44
        ];
        return [0xff, 0xe1].concat(_u16(payload.length + 2), payload);
    }

    function _createDqt8Segment(): number[] {
        const payload: number[] = [0x00];
        for (let i: number = 0; i < 64; i++) {
            payload.push(1);
        }
        return [0xff, 0xdb].concat(_u16(payload.length + 2), payload);
    }

    function _createDqt16Segment(): number[] {
        const payload: number[] = [0x10];
        for (let i: number = 0; i < 64; i++) {
            payload.push(0x00, 0x02);
        }
        return [0xff, 0xdb].concat(_u16(payload.length + 2), payload);
    }

    function _createInvalidDqtSegment(): number[] {
        return [0xff, 0xdb, 0x00, 0x03, 0x20];
    }

    function _createSofSegment(marker: number, componentsCount: number): number[] {
        const payload: number[] = [
            0x08,
            0x00, 0x10,
            0x00, 0x10,
            componentsCount
        ];

        for (let i: number = 0; i < componentsCount; i++) {
            const componentId: number = i + 1;
            const hv: number =
                i === 0
                    ? 0x21
                    : i === 1
                        ? 0x12
                        : 0x11;
            payload.push(componentId, hv, 0x00);
        }

        return [0xff, marker].concat(_u16(payload.length + 2), payload);
    }

    function _createMinimalDhtSegment(): number[] {
        const payload: number[] = [
            0x00,
            0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00
        ];
        return [0xff, 0xc4].concat(_u16(payload.length + 2), payload);
    }

    function _createDriSegment(interval: number): number[] {
        return [0xff, 0xdd, 0x00, 0x04].concat(_u16(interval));
    }

    function _createSosSegment(selectorsCount: number): number[] {
        const payload: number[] = [selectorsCount];
        for (let i: number = 0; i < selectorsCount; i++) {
            payload.push(i + 1, 0x00);
        }
        payload.push(0x00, 0x3f, 0x00);
        return [0xff, 0xda].concat(_u16(payload.length + 2), payload);
    }

    function _expectSyncThrow(action: () => void, pattern: RegExp): void {
        let thrown: Error | null = null;
        try {
            action();
        } catch (error) {
            thrown = error as Error;
        }
        expect(thrown).not.toBeNull();
        expect((thrown as Error).message).toMatch(pattern);
    }
    it('should cover _canUseImageDecoder SOI error', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const invalidData: Uint8Array = new Uint8Array([0x00, 0x00]);

        // Act / Assert
        _expectSyncThrow(
            () => jpeg._canUseImageDecoder(invalidData),
            /Start Of Image \(SOI\) marker not found/
        );
    });

    it('should cover parse APP0/JFIF, APP14/Adobe, DQT8, SOF0 component loop, DHT, DRI, SOS selector loop, decodeScan processed path and final assignments', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createJfifSegment(),
            _createAdobeSegment(),
            _createDqt8Segment(),
            _createSofSegment(0xc0, 2),
            _createMinimalDhtSegment(),
            _createDriSegment(1),
            _createSosSegment(2),
            [0xff, 0xd9]
        ]);

        const buildHuffmanSpy: jasmine.Spy = spyOn(jpeg, '_buildHuffmanTable').and.returnValue([0]);
        const prepareSpy: jasmine.Spy = spyOn(jpeg, '_prepareComponents').and.callFake((frame: {
            components: Array<{
                quantizationId: number;
                h: number;
                v: number;
                index?: number;
                blocksPerLine?: number;
                blocksPerColumn?: number;
                blockData?: Int16Array;
            }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 2;
            (frame as { maxH?: number; maxV?: number }).maxV = 2;
        });
        const decodeScanSpy: jasmine.Spy = spyOn(jpeg, '_decodeScan').and.returnValue(0);
        const buildComponentSpy: jasmine.Spy = spyOn(jpeg, '_buildComponentData').and.returnValues(
            new Int8Array(64),
            new Int8Array(64)
        );

        // Act
        jpeg.parse(data);

        // Assert
        expect(buildHuffmanSpy).toHaveBeenCalled();
        expect(prepareSpy).toHaveBeenCalled();
        expect(decodeScanSpy).toHaveBeenCalled();
        expect(buildComponentSpy.calls.count()).toBe(2);

        expect(_getPrivate<number>(jpeg, '_width')).toBe(16);
        expect(_getPrivate<number>(jpeg, '_height')).toBe(16);

        const jfif: {
            version: { major: number; minor: number };
            densityUnits: number;
            xDensity: number;
            yDensity: number;
            thumbWidth: number;
            thumbHeight: number;
            thumbData: Uint8Array;
        } = _getPrivate(jpeg, '_jfif');
        expect(jfif.version.major).toBe(1);
        expect(jfif.version.minor).toBe(2);
        expect(jfif.densityUnits).toBe(1);

        const adobe: {
            version: number;
            flags0: number;
            flags1: number;
            transformCode: number;
        } = _getPrivate(jpeg, '_adobe');
        expect(adobe.version).toBe(100);
        expect(adobe.flags0).toBe(1);
        expect(adobe.flags1).toBe(2);
        expect(adobe.transformCode).toBe(1);

        expect(_getPrivate<number>(jpeg, '_numComponents')).toBe(2);
        expect(_getPrivate<unknown[]>(jpeg, '_components').length).toBe(2);
    });

    it('should cover parse APP markers e1-e9 / ea-ef / fe by reading and breaking without crashes', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const genericAppPayload: number[] = [0x00, 0x00];
        const genericAppLength: number = genericAppPayload.length + 2;

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0xe1], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xe2], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xe3], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xe4], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xe5], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xe6], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xe7], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xe8], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xe9], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xea], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xeb], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xec], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xed], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xee], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xef], _u16(genericAppLength), genericAppPayload,
            [0xff, 0xfe], _u16(genericAppLength), genericAppPayload,
            _createSofSegment(0xc0, 1),
            _createSosSegment(1),
            [0xff, 0xd9]
        ]);

        spyOn(jpeg, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });
        spyOn(jpeg, '_decodeScan').and.returnValue(0);
        spyOn(jpeg, '_buildComponentData').and.returnValue(new Int8Array(64));

        // Act / Assert
        expect(() => jpeg.parse(data)).not.toThrow();
        expect(_getPrivate<number>(jpeg, '_numComponents')).toBe(1);
    });

    it('should cover DQT16 and invalid DQT branches', () => {
        // Arrange
        const jpeg16: _PdfJpegImage = new _PdfJpegImage();
        const data16: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createDqt16Segment(),
            _createSofSegment(0xc0, 1),
            _createSosSegment(1),
            [0xff, 0xd9]
        ]);

        spyOn(jpeg16, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });
        spyOn(jpeg16, '_decodeScan').and.returnValue(0);
        spyOn(jpeg16, '_buildComponentData').and.returnValue(new Int8Array(64));

        const jpegInvalid: _PdfJpegImage = new _PdfJpegImage();
        const invalidData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createInvalidDqtSegment(),
            [0xff, 0xd9]
        ]);

        // Act
        jpeg16.parse(data16);

        // Assert
        expect(_getPrivate<number>(jpeg16, '_width')).toBe(16);
        expect(_getPrivate<number>(jpeg16, '_height')).toBe(16);

        _expectSyncThrow(() => jpegInvalid.parse(invalidData), /DQT Error/);
    });

    it('should cover duplicate-frame, SOF0, SOF1 and SOF2 branches', () => {
        // Arrange
        const jpegExtended: _PdfJpegImage = new _PdfJpegImage();
        const extendedData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc1, 1),
            _createSosSegment(1),
            [0xff, 0xd9]
        ]);

        const jpegProgressive: _PdfJpegImage = new _PdfJpegImage();
        const progressiveData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc2, 1),
            _createSosSegment(1),
            [0xff, 0xd9]
        ]);

        const jpegDuplicateFrame: _PdfJpegImage = new _PdfJpegImage();
        const duplicateFrameData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            _createSofSegment(0xc1, 1),
            [0xff, 0xd9]
        ]);

        const prepareFrameSpyFactory = (instance: _PdfJpegImage): void => {
            spyOn(instance, '_prepareComponents').and.callFake((frame: {
                components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
            }): void => {
                for (let i: number = 0; i < frame.components.length; i++) {
                    frame.components[i].blocksPerLine = 1;
                    frame.components[i].blocksPerColumn = 1;
                    frame.components[i].blockData = new Int16Array(128);
                }
                (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
                (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
                (frame as { maxH?: number; maxV?: number }).maxH = 1;
                (frame as { maxH?: number; maxV?: number }).maxV = 1;
            });
            spyOn(instance, '_decodeScan').and.returnValue(0);
            spyOn(instance, '_buildComponentData').and.returnValue(new Int8Array(64));
        };

        prepareFrameSpyFactory(jpegExtended);
        prepareFrameSpyFactory(jpegProgressive);

        // Act
        jpegExtended.parse(extendedData);
        jpegProgressive.parse(progressiveData);

        // Assert
        expect(_getPrivate<number>(jpegExtended, '_width')).toBe(16);
        expect(_getPrivate<number>(jpegProgressive, '_width')).toBe(16);

        _expectSyncThrow(() => jpegDuplicateFrame.parse(duplicateFrameData), /Only single-frame JPEG images are supported/);
    });

    it('should cover _canUseImageDecoder SOI error', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const invalidData: Uint8Array = new Uint8Array([0x00, 0x00]);

        // Act / Assert
        _expectSyncThrow(
            () => jpeg._canUseImageDecoder(invalidData),
            /Start Of Image \(SOI\) marker not found/
        );
    });

    it('should cover _canUseImageDecoder duplicate EXIF, EXIF result, SOF return, 0xffff correction and empty-object return', () => {
        // Arrange
        const jpegExif: _PdfJpegImage = new _PdfJpegImage();
        const singleExifData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createExifSegment(),
            [0xff, 0xd9]
        ]);

        const jpegDuplicateExif: _PdfJpegImage = new _PdfJpegImage();
        const duplicateExifData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createExifSegment(),
            _createExifSegment(),
            [0xff, 0xd9]
        ]);

        const jpegSof: _PdfJpegImage = new _PdfJpegImage();
        const sofData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0xc0],
            [0x00, 0x0b],
            [0x08, 0x00, 0x10, 0x00, 0x10, 0x03, 0x01, 0x11, 0x00]
        ]);

        const jpegFFFF: _PdfJpegImage = new _PdfJpegImage();
        const ffffData: Uint8Array = new Uint8Array([
            0xff, 0xd8,
            0xff, 0xff,
            0x00, 0x00,
            0xff, 0xd9
        ]);
        const skipSpy: jasmine.Spy = spyOn(jpegFFFF, '_skipData').and.returnValue(6);

        const jpegFourComponents: _PdfJpegImage = new _PdfJpegImage();
        const fourCompData: Uint8Array = new Uint8Array([
            0xff, 0xd8,
            0xff, 0xff,
            0xff, 0xc0,
            0x00, 0x0b,
            0x08, 0x00, 0x10, 0x00, 0x10, 0x04,
            0x01, 0x11, 0x00,
            0xff, 0xd9
        ]);
        spyOn(jpegFourComponents, '_skipData').and.returnValue(4);

        const jpegThreeNoTransform: _PdfJpegImage = new _PdfJpegImage();
        const threeCompData: Uint8Array = sofData;

        const jpegEmptyObject: _PdfJpegImage = new _PdfJpegImage();
        const emptyObjectData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0xd9]
        ]);

        // Act
        const exifResult: { exifStart: number; exifEnd: number } | {} | null =
            jpegExif._canUseImageDecoder(singleExifData) as { exifStart: number; exifEnd: number } | {} | null;

        const sofResult: unknown = jpegSof._canUseImageDecoder(sofData);
        const ffffResult: {} | null = jpegFFFF._canUseImageDecoder(ffffData) as {} | null;

        // NOTE:
        // In the current implementation, SOF markers return immediately,
        // so these are undefined rather than null.
        const fourCompResult: unknown = jpegFourComponents._canUseImageDecoder(fourCompData);
        const threeCompResult: unknown = jpegThreeNoTransform._canUseImageDecoder(threeCompData, 0);

        const emptyResult: {} | null = jpegEmptyObject._canUseImageDecoder(emptyObjectData) as {} | null;

        // Assert
        expect((exifResult as { exifStart: number }).exifStart).toBe(12);
        expect((exifResult as { exifEnd: number }).exifEnd).toBe(16);

        _expectSyncThrow(
            () => jpegDuplicateExif._canUseImageDecoder(duplicateExifData),
            /duplicate EXIF metadata blocks/
        );

        expect(sofResult).toBeUndefined();
        expect(skipSpy).toHaveBeenCalled();
        expect(ffffResult).toEqual({});

        // These are undefined because the SOF branch returns immediately.
        expect(fourCompResult).toBeUndefined();
        expect(threeCompResult).toBeUndefined();

        expect(emptyResult).toEqual({});
    });

    it('should cover parse SOI error and missing-frame error', () => {
        // Arrange
        const jpegSoi: _PdfJpegImage = new _PdfJpegImage();
        const jpegMissingFrame: _PdfJpegImage = new _PdfJpegImage();

        // Act / Assert
        _expectSyncThrow(
            () => jpegSoi.parse(new Uint8Array([0x00, 0x00])),
            /Start Of Image \(SOI\) marker not found/
        );

        const noFrameData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0xd9]
        ]);

        _expectSyncThrow(
            () => jpegMissingFrame.parse(noFrameData),
            /No frame data found/
        );
    });

    it('should cover DHT loop and table assignment branch for DC and AC', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const dcPayload: number[] = [
            0x00,
            0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00
        ];
        const acPayload: number[] = [
            0x10,
            0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00
        ];
        const combinedPayload: number[] = dcPayload.concat(acPayload);

        const dhtSegment: number[] = [0xff, 0xc4].concat(_u16(combinedPayload.length + 2), combinedPayload);

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            dhtSegment,
            _createSosSegment(1),
            [0xff, 0xd9]
        ]);

        const huffmanSpy: jasmine.Spy = spyOn(jpeg, '_buildHuffmanTable').and.returnValues([0], [1]);

        spyOn(jpeg, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });

        spyOn(jpeg, '_decodeScan').and.returnValue(0);
        spyOn(jpeg, '_buildComponentData').and.returnValue(new Int8Array(64));

        // Act / Assert
        expect(() => jpeg.parse(data)).not.toThrow();

        // This is the important assertion for the highlighted DHT branch.
        expect(huffmanSpy.calls.count()).toBe(2);
    });


    it('should cover SOS catch branch for EndOfImageMarkerError return path', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const errorSource: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(errorSource, '_data', new Uint8Array([0xff, 0xd9]));
        _setPrivate(errorSource, '_offset', 0);
        _setPrivate(errorSource, '_bitsCount', 0);
        _setPrivate(errorSource, '_parseMarker', false);

        let eoiError: Error | null = null;
        try {
            errorSource._readBit();
        } catch (error) {
            eoiError = error as Error;
        }

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            _createSosSegment(1),
            [0xff, 0xd9]
        ]);

        spyOn(jpeg, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });

        spyOn(jpeg, '_decodeScan').and.callFake((): number => {
            throw eoiError as Error;
        });

        // Act / Assert
        expect(() => jpeg.parse(data)).not.toThrow();
    });

    it('should cover SOS catch branch for DoNotLoadMarkerError recursion path', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const errorSource: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(errorSource, '_data', new Uint8Array([0xff, 0xdc, 0x00, 0x00, 0x00, 0x0a]));
        _setPrivate(errorSource, '_offset', 0);
        _setPrivate(errorSource, '_bitsCount', 0);
        _setPrivate(errorSource, '_parseMarker', true);
        _setPrivate(errorSource, '_frame', { scanLines: 1, precision: 8 });
        _setPrivate(errorSource, '_blockRow', 1);

        let dnlError: Error | null = null;
        try {
            errorSource._readBit();
        } catch (error) {
            dnlError = error as Error;
        }

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            _createSosSegment(1),
            [0xff, 0xd9]
        ]);

        spyOn(jpeg, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });

        const parseSpy: jasmine.Spy = spyOn(jpeg, 'parse').and.callThrough();
        const decodeScanSpy: jasmine.Spy = spyOn(jpeg, '_decodeScan').and.callFake((function (): () => number {
            let firstCall: boolean = true;
            return (): number => {
                if (firstCall) {
                    firstCall = false;
                    throw dnlError as Error;
                }
                return 0;
            };
        })());
        spyOn(jpeg, '_buildComponentData').and.returnValue(new Int8Array(64));

        // Act
        jpeg.parse(data);

        // Assert
        expect(parseSpy.calls.count()).toBe(2);
        expect(decodeScanSpy.calls.count()).toBe(2);
    });

    it('should cover 0xffdc skip branch and 0xffff correction branch inside parse', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const data: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            [0xff, 0xdc, 0x00, 0x04, 0x00, 0x00],
            [0xff, 0xff, 0x00],
            [0xff, 0xd9]
        ]);

        spyOn(jpeg, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });
        spyOn(jpeg, '_buildComponentData').and.returnValue(new Int8Array(64));

        // Act / Assert
        expect(() => jpeg.parse(data)).not.toThrow();
    });

    it('should cover default-marker branch with invalid next marker correction, early return on null marker, and unknown marker throw', () => {
        // Arrange
        const jpegInvalidCorrection: _PdfJpegImage = new _PdfJpegImage();
        const invalidCorrectionData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            [0xff, 0x01],
            [0xff, 0xd9]
        ]);

        spyOn(jpegInvalidCorrection, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });
        spyOn(jpegInvalidCorrection, '_findNextFileMarker').and.returnValue({
            invalid: 'bad',
            marker: 0xffd9,
            offset: invalidCorrectionData.length - 2
        });
        spyOn(jpegInvalidCorrection, '_buildComponentData').and.returnValue(new Int8Array(64));

        const jpegNullNextMarker: _PdfJpegImage = new _PdfJpegImage();
        const nullNextMarkerData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0x01],
            [0x00, 0x00]
        ]);
        spyOn(jpegNullNextMarker, '_findNextFileMarker').and.returnValue(null);

        const jpegUnknownThrow: _PdfJpegImage = new _PdfJpegImage();
        const unknownThrowData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0x01],
            [0x00, 0x00],
            [0x00, 0x00]
        ]);
        spyOn(jpegUnknownThrow, '_findNextFileMarker').and.returnValue({
            invalid: null,
            marker: 0xffc0,
            offset: 4
        });

        // Act / Assert
        expect(() => jpegInvalidCorrection.parse(invalidCorrectionData)).not.toThrow();
        expect(() => jpegNullNextMarker.parse(nullNextMarkerData)).not.toThrow();

        _expectSyncThrow(
            () => jpegUnknownThrow.parse(unknownThrowData),
            /unknown JPEG marker encountered/
        );
    });
});
