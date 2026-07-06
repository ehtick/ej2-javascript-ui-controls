
/* eslint-disable @typescript-eslint/no-explicit-any */

import { _PngDecoder } from '../src/pdf/core/graphics/images/png-decoder';
import { _DeflateStream } from '../src/pdf/core/compression/deflate-stream';
import { _PdfName, _PdfDictionary } from '../src/pdf/core/pdf-primitives';
import { _PdfStream } from '../src/pdf/core/base-stream';

describe('_PngDecoder - behavior/AAA tests for uncovered branches', () => {

    function createDecoder(): any {
        // Minimal stream => constructor _initialize() exits immediately
        return new _PngDecoder(new Uint8Array(8)) as any;
    }

    function ascii(text: string): number[] {
        return text.split('').map((c: string) => c.charCodeAt(0));
    }

    function uint32Bytes(value: number): number[] {
        return [
            (value >>> 24) & 0xff,
            (value >>> 16) & 0xff,
            (value >>> 8) & 0xff,
            value & 0xff
        ];
    }

    function setHeader(decoder: any, overrides?: Partial<any>): void {
        decoder._header = Object.assign({
            _width: 1,
            _height: 1,
            _bitDepth: 8,
            _colorType: 2,
            _compression: 0,
            _filter: 0,
            _interlace: 0
        }, overrides || {});
        decoder._width = decoder._header._width;
        decoder._height = decoder._header._height;
        decoder._bitsPerComponent = decoder._header._bitDepth;
    }
    afterEach(() => {
        const protoRead: any = (_DeflateStream.prototype as any)._read;
        if (protoRead && protoRead.and && typeof protoRead.and.callThrough === 'function') {
            protoRead.and.callThrough();
        }
    });

    it('should execute _initialize default switch branch safely without timeout', () => {
        // Arrange
        const decoder = createDecoder();
        const readHeaderSpy = spyOn(decoder, '_readHeader');
        const readImageDataSpy = spyOn(decoder, '_readImageData');
        const readPhotoPlateSpy = spyOn(decoder, '_readPhotoPlate');
        const decodeImageDataSpy = spyOn(decoder, '_decodeImageData');
        const readTransparencySpy = spyOn(decoder, '_readTransparency');
        const ignoreChunkSpy = spyOn(decoder, '_ignoreChunk');

        const hasValidSpy = spyOn(decoder, '_hasValidChunkType').and.returnValues(
            { type: 999 as any, hasValidChunk: true }, // forces switch default branch
            { type: 0 as any, hasValidChunk: false }
        );

        // Act
        decoder._initialize();

        // Assert
        expect(hasValidSpy).toHaveBeenCalledTimes(2);
        expect(readHeaderSpy).not.toHaveBeenCalled();
        expect(readImageDataSpy).not.toHaveBeenCalled();
        expect(readPhotoPlateSpy).not.toHaveBeenCalled();
        expect(decodeImageDataSpy).not.toHaveBeenCalled();
        expect(readTransparencySpy).not.toHaveBeenCalled();
        expect(ignoreChunkSpy).not.toHaveBeenCalled();
    });

    it('should return a valid known chunk from _hasValidChunkType when chunk type is recognized', () => {
        // Arrange
        const decoder = createDecoder();
        decoder._stream = new Uint8Array([
            ...uint32Bytes(0),
            ...ascii('IHDR')
        ]);
        decoder._position = 0;

        // Act
        const result = decoder._hasValidChunkType(null);

        // Assert
        expect(result.hasValidChunk).toBeTruthy();
        expect(result.type).toBe(0); // iHDR
        expect(decoder._currentChunkLength).toBe(0);
    });

    it('should return hasValidChunk=false from _hasValidChunkType when unknown chunk reaches stream end exactly', () => {
        // Arrange
        const decoder = createDecoder();
        decoder._stream = new Uint8Array([
            ...uint32Bytes(0),
            ...ascii('ABCD') // unknown -> null
        ]);
        decoder._position = 0;

        // Act
        const result = decoder._hasValidChunkType(null);

        // Assert
        expect(result.hasValidChunk).toBeFalsy();
        expect(result.type).toBe(17); // unknown enum placeholder set in method
        expect(decoder._position).toBe(8);
    });

    it('should return hasValidChunk=false from _hasValidChunkType when fewer than 8 bytes remain', () => {
        // Arrange
        const decoder = createDecoder();
        decoder._stream = new Uint8Array(7);
        decoder._position = 0;

        // Act
        const result = decoder._hasValidChunkType(null);

        // Assert
        expect(result.hasValidChunk).toBeFalsy();
        expect(result.type).toBe(17); // unknown
    });

    it('should skip bytes in _ignoreChunk only when current chunk length is greater than zero', () => {
        // Arrange
        const decoder = createDecoder();
        decoder._position = 10;
        decoder._currentChunkLength = 5;

        // Act
        decoder._ignoreChunk();

        // Assert
        expect(decoder._position).toBe(19); // 10 + (5 + 4)

        // Arrange
        decoder._position = 20;
        decoder._currentChunkLength = 0;

        // Act
        decoder._ignoreChunk();

        // Assert
        expect(decoder._position).toBe(20);
    });

    it('should set idat length, input bands and bitsPerPixel for all highlighted color type branches', () => {
        // Arrange
        const decoder = createDecoder();

        // colorType 0
        setHeader(decoder, { _width: 3, _height: 2, _bitDepth: 8, _colorType: 0, _interlace: 0 });

        // Act
        decoder._setBitsPerPixel();

        // Assert
        expect(decoder._idatLength).toBe(6);
        expect(decoder._inputBands).toBe(1);
        expect(decoder._bitsPerPixel).toBe(1);

        // Arrange - colorType 2
        setHeader(decoder, { _width: 2, _height: 2, _bitDepth: 8, _colorType: 2 });

        // Act
        decoder._setBitsPerPixel();

        // Assert
        expect(decoder._idatLength).toBe(12);
        expect(decoder._inputBands).toBe(3);
        expect(decoder._bitsPerPixel).toBe(3);

        // Arrange - colorType 3
        setHeader(decoder, { _width: 5, _height: 2, _bitDepth: 4, _colorType: 3, _interlace: 0 });

        // Act
        decoder._setBitsPerPixel();

        // Assert
        expect(decoder._idatLength).toBe(6); // floor((4*5+7)/8) * 2 = 3 * 2
        expect(decoder._inputBands).toBe(1);
        expect(decoder._bitsPerPixel).toBe(1);

        // Arrange - colorType 4 (highlighted)
        setHeader(decoder, { _width: 4, _height: 3, _bitDepth: 8, _colorType: 4 });

        // Act
        decoder._setBitsPerPixel();

        // Assert
        expect(decoder._idatLength).toBe(12);
        expect(decoder._inputBands).toBe(2);
        expect(decoder._bitsPerPixel).toBe(2);

        // Arrange - colorType 6
        setHeader(decoder, { _width: 4, _height: 2, _bitDepth: 8, _colorType: 6 });

        // Act
        decoder._setBitsPerPixel();

        // Assert
        expect(decoder._idatLength).toBe(24);
        expect(decoder._inputBands).toBe(4);
        expect(decoder._bitsPerPixel).toBe(4);
    });

    it('should grow the encoded stream buffer in _readImageData and append payload correctly', () => {
        // Arrange
        const decoder = createDecoder();
        decoder._stream = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
        decoder._position = 1;
        decoder._currentChunkLength = 5;

        decoder._encodedStream = new Uint8Array(2);
        decoder._encodedStream[0] = 99;
        decoder._encodedStream[1] = 100;
        decoder._encodedStreamLength = 2;

        // Act
        decoder._readImageData();

        // Assert
        expect(decoder._encodedStreamLength).toBe(7);
        expect(Array.from(decoder._encodedStream.subarray(0, 7))).toEqual([99, 100, 11, 12, 13, 14, 15]);
        expect(decoder._encodedStream.length).toBeGreaterThanOrEqual(7);
        expect(decoder._position).toBe(10); // after payload + CRC skip
    });

    it('should read palette for indexed PNG and should ignore palette chunk for non-indexed PNG', () => {
        // Arrange
        const decoder = createDecoder();

        // Indexed branch
        setHeader(decoder, { _colorType: 3 });
        decoder._currentChunkLength = 3;
        decoder._stream = new Uint8Array([1, 2, 3, 0, 0, 0, 0]);
        decoder._position = 0;

        // Act
        decoder._readPhotoPlate();

        // Assert
        expect(decoder._colorSpace).toBeDefined();
        expect(decoder._colorSpace.length).toBe(4);
        expect(decoder._position).toBe(7);

        // Arrange - else branch
        const decoder2 = createDecoder();
        setHeader(decoder2, { _colorType: 2 });
        decoder2._currentChunkLength = 9;
        const ignoreSpy = spyOn(decoder2, '_ignoreChunk');

        // Act
        decoder2._readPhotoPlate();

        // Assert
        expect(ignoreSpy).toHaveBeenCalled();
    });

    it('should read indexed transparency, set shades=true for partial alpha, and ignore transparency for non-indexed PNG', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _colorType: 3 });
        decoder._currentChunkLength = 3;
        decoder._stream = new Uint8Array([0, 128, 255, 0, 0, 0, 0]);
        decoder._position = 0;

        // Act
        decoder._readTransparency();

        // Assert
        expect(Array.from(decoder._alpha)).toEqual([0, 128, 255]);
        expect(decoder._shades).toBeTruthy();
        expect(decoder._position).toBe(7);

        // Arrange - else branch
        const decoder2 = createDecoder();
        setHeader(decoder2, { _colorType: 2 });
        const ignoreSpy = spyOn(decoder2, '_ignoreChunk');

        // Act
        decoder2._readTransparency();

        // Assert
        expect(ignoreSpy).toHaveBeenCalled();
    });

    it('should return DeviceGray and DeviceRGB in _getPngColorSpace when sRGB is not set', () => {
        // Arrange
        const grayDecoder = createDecoder();
        setHeader(grayDecoder, { _colorType: 0 });
        grayDecoder._isRedGreenBlue = false;

        const rgbDecoder = createDecoder();
        setHeader(rgbDecoder, { _colorType: 2 });
        rgbDecoder._isRedGreenBlue = false;

        // Act
        const gray = grayDecoder._getPngColorSpace();
        const rgb = rgbDecoder._getPngColorSpace();

        // Assert
        expect(gray).toBeDefined();
        expect(rgb).toBeDefined();
        expect(gray).not.toBeNull();
        expect(rgb).not.toBeNull();
    });

    it('should build CalRGB colorspace in _getPngColorSpace when sRGB is set', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _colorType: 2 });
        decoder._isRedGreenBlue = true;

        // Act
        const colorSpace = decoder._getPngColorSpace();

        // Assert
        expect(Array.isArray(colorSpace)).toBeTruthy();
        expect(colorSpace.length).toBe(2);

        const calRgbDictionary = colorSpace[1] as _PdfDictionary;
        expect(calRgbDictionary).toBeDefined();
        expect(calRgbDictionary.get('Gamma')).toEqual([2.2, 2.2, 2.2]);
        expect(calRgbDictionary.get('WhitePoint')).toBeDefined();
        expect(calRgbDictionary.get('Matrix')).toBeDefined();
    });

    it('should inflate data in _getDeflatedData and terminate the while loop without timeout', () => {
        // Arrange
        const decoder = createDecoder();
        let callIndex = 0;

        spyOn(_DeflateStream.prototype as any, '_read').and.callFake((buffer: number[], offset: number, count: number) => {
            callIndex++;
            if (callIndex === 1) {
                return { count: 3, data: [11, 22, 33] };
            }
            if (callIndex === 2) {
                return { count: 2, data: [44, 55] };
            }
            return { count: 0, data: [] }; // stops loop safely
        });

        const zlibWrapped = new Uint8Array([0x78, 0x9c, 1, 2, 3, 4, 5, 0, 0, 0, 0]);

        // Act
        const result = decoder._getDeflatedData(zlibWrapped);

        // Assert
        expect(Array.from(result)).toEqual([11, 22, 33, 44, 55]);
        expect(((_DeflateStream.prototype as any)._read as jasmine.Spy).calls.count()).toBe(3);
    });

    it('should take the shades fallback path in _decodeImageData when decoded image length is zero', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _width: 1, _height: 1, _bitDepth: 8, _colorType: 3, _interlace: 0 });

        decoder._width = 1;
        decoder._height = 1;
        decoder._shades = true;
        decoder._idatLength = 0;
        decoder._encodedStream = new Uint8Array([8, 9, 10]);
        decoder._encodedStreamLength = 3;

        spyOn(decoder, '_getDeflatedData').and.returnValue(new Uint8Array(0));
        spyOn(decoder, '_readDecodeData').and.callFake(() => { /* no-op */ });

        // Act
        decoder._decodeImageData();

        // Assert
        expect(decoder._isDecode).toBeTruthy();
        expect(decoder._maskData).toBeDefined();
        expect(decoder._maskData.length).toBe(1);
        expect(decoder._ideateDecode).toBeTruthy();
    });

    it('should take the non-decode path in _decodeImageData when no raw decode is required', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _bitDepth: 8, _colorType: 2, _interlace: 0 });
        decoder._shades = false;
        decoder._encodedStream = new Uint8Array([1, 2, 3, 4]);
        decoder._encodedStreamLength = 4;

        // Act
        decoder._decodeImageData();

        // Assert
        expect(decoder._isDecode).toBeFalsy();
        expect(decoder._ideateDecode).toBeFalsy();
        expect(Array.from(decoder._decodedImageData)).toEqual([1, 2, 3, 4]);
    });

    it('should allocate mask and decoded image buffers in _decodeImageData when alpha color type requires decode', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _width: 2, _height: 1, _bitDepth: 8, _colorType: 6, _interlace: 0 });
        decoder._idatLength = 6;
        decoder._encodedStream = new Uint8Array([10, 20, 30, 40]);
        decoder._encodedStreamLength = 4;

        spyOn(decoder, '_getDeflatedData').and.returnValue(new Uint8Array([0, 1, 2, 3]));
        spyOn(decoder, '_readDecodeData').and.callFake(() => { /* no-op */ });

        // Act
        decoder._decodeImageData();

        // Assert
        expect(decoder._isDecode).toBeTruthy();
        expect(decoder._maskData.length).toBe(2);
        expect(decoder._decodedImageData.length).toBe(6);
    });

    it('should call all seven Adam7 passes in _readDecodeData for interlaced images', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _width: 9, _height: 9, _interlace: 1 });

        const decodeSpy = spyOn(decoder, '_decodeData');

        // Act
        decoder._readDecodeData();

        // Assert
        expect(decodeSpy.calls.count()).toBe(7);

        expect(decodeSpy.calls.argsFor(0)).toEqual([0, 0, 8, 8, Math.floor((9 + 7) / 8), Math.floor((9 + 7) / 8)]);
        expect(decodeSpy.calls.argsFor(1)).toEqual([4, 0, 8, 8, Math.floor((9 + 3) / 8), Math.floor((9 + 7) / 8)]);
        expect(decodeSpy.calls.argsFor(2)).toEqual([0, 4, 4, 8, Math.floor((9 + 3) / 4), Math.floor((9 + 3) / 8)]);
        expect(decodeSpy.calls.argsFor(3)).toEqual([2, 0, 4, 4, Math.floor((9 + 1) / 4), Math.floor((9 + 3) / 4)]);
        expect(decodeSpy.calls.argsFor(4)).toEqual([0, 2, 2, 4, Math.floor((9 + 1) / 2), Math.floor((9 + 1) / 4)]);
        expect(decodeSpy.calls.argsFor(5)).toEqual([1, 0, 2, 2, Math.floor(9 / 2), Math.floor((9 + 1) / 2)]);
        expect(decodeSpy.calls.argsFor(6)).toEqual([0, 1, 1, 2, 9, Math.floor(9 / 2)]);
    });

    it('should return early from _decodeData when width or height is zero', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _bitDepth: 8, _colorType: 2 });
        decoder._inputBands = 3;
        decoder._dataStream = new Uint8Array([0]);
        decoder._dataStreamOffset = 0;

        const readStreamSpy = spyOn(decoder, '_readStream');
        const processSpy = spyOn(decoder, '_processPixels');

        // Act
        decoder._decodeData(0, 0, 1, 1, 0, 1);
        decoder._decodeData(0, 0, 1, 1, 1, 0);

        // Assert
        expect(readStreamSpy).not.toHaveBeenCalled();
        expect(processSpy).not.toHaveBeenCalled();
    });

    it('should decode an average-filtered row in _decodeData', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _bitDepth: 8, _colorType: 0 });
        decoder._inputBands = 1;
        decoder._bitsPerPixel = 1;

        // one row, width=2 => bytesPerRow=2
        // filter=3 (average), row=[10,20], prior row is zeros
        decoder._dataStream = new Uint8Array([3, 10, 20]);
        decoder._dataStreamOffset = 0;
        decoder._decodedImageData = new Uint8Array(2);

        const processSpy = spyOn(decoder, '_processPixels').and.callThrough();

        // Act
        decoder._decodeData(0, 0, 1, 1, 2, 1);

        // Assert
        expect(processSpy).toHaveBeenCalled();
        expect(decoder._dataStreamOffset).toBe(3);
        // Average with zero prior and bpp=1 => [10, 25]
        expect(Array.from(decoder._decodedImageData)).toEqual([10, 25]);
    });

    it('should throw for unknown PNG filter in _decodeData default branch', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _bitDepth: 8, _colorType: 0 });
        decoder._inputBands = 1;
        decoder._bitsPerPixel = 1;
        decoder._dataStream = new Uint8Array([99, 1]); // raw filter byte doesn't matter because we override _getFilterType
        decoder._dataStreamOffset = 0;

        spyOn(decoder, '_getFilterType').and.returnValue(999 as any);

        // Act / Assert
        expect(() => {
            decoder._decodeData(0, 0, 1, 1, 1, 1);
        }).toThrowError('Unknown PNG filter');
    });

    it('should throw Insufficient data in _readStream when source bytes are not enough', () => {
        // Arrange
        const decoder = createDecoder();

        // Act / Assert
        expect(() => {
            decoder._readStream(new Uint8Array([1, 2]), 1, new Uint8Array(3), 3);
        }).toThrowError('Insufficient data');
    });

    it('should apply the average decompression algorithm in _decompressAverage', () => {
        // Arrange
        const decoder = createDecoder();
        const current = new Uint8Array([10, 20, 30, 40]);
        const prior = new Uint8Array([2, 4, 6, 8]);

        // Act
        decoder._decompressAverage(current, prior, 4, 2);

        // Assert
        // first two: data[i] + (pData[i] >> 1)
        // [10+1, 20+2] => [11,22]
        // next two: data[i] + ((left + up) >> 1)
        // index 2 => 30 + ((11 + 6) >> 1) = 30 + 8 = 38
        // index 3 => 40 + ((22 + 8) >> 1) = 40 + 15 = 55
        expect(Array.from(current)).toEqual([11, 22, 38, 55]);
    });

    it('should process RGBA 16-bit pixels, write RGB image data and 8-bit alpha mask', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _bitDepth: 16, _colorType: 6, _width: 1, _height: 1 });
        decoder._inputBands = 4;
        decoder._decodedImageData = new Uint8Array(3);
        decoder._maskData = new Uint8Array(1);
        decoder._shades = false;

        // R=1, G=2, B=3, A=0xFF00
        const raw = new Uint8Array([0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0xFF, 0x00]);

        // Act
        decoder._processPixels(raw, 0, 1, 0, 1);

        // Assert
        expect(Array.from(decoder._decodedImageData)).toEqual([0, 0, 0]);
        expect(Array.from(decoder._maskData)).toEqual([255]);
    });

    it('should process indexed pixels using alpha lookup in the shades-only branch', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _bitDepth: 8, _colorType: 3, _width: 3, _height: 1 });
        decoder._inputBands = 1;
        decoder._decodedImageData = new Uint8Array(3);
        decoder._maskData = new Uint8Array(3);
        decoder._alpha = new Uint8Array([0, 128]);
        decoder._shades = true;

        const row = new Uint8Array([0, 1, 5]); // last index out of alpha range -> 255

        // Act
        decoder._processPixels(row, 0, 1, 0, 3);

        // Assert
        expect(Array.from(decoder._maskData)).toEqual([0, 128, 255]);
    });

    it('should return the original buffer for 8-bit, a Uint16Array for 16-bit, and unpack sub-byte pixels in _getPixel', () => {
        // Arrange
        const decoder = createDecoder();

        // 8-bit
        setHeader(decoder, { _bitDepth: 8 });
        const eightBit = new Uint8Array([7, 8, 9]);

        // Act
        const result8 = decoder._getPixel(eightBit);

        // Assert
        expect(result8).toBe(eightBit);

        // Arrange - 16-bit
        setHeader(decoder, { _bitDepth: 16 });
        const sixteenBit = new Uint8Array([0x00, 0x01, 0x12, 0x34]);

        // Act
        const result16 = decoder._getPixel(sixteenBit) as Uint16Array;

        // Assert
        expect(Array.from(result16)).toEqual([1, 0x1234]);

        // Arrange - 2-bit packed: 11001001 => [3,0,2,1]
        setHeader(decoder, { _bitDepth: 2 });
        const packed = new Uint8Array([0b11001001]);

        // Act
        const unpacked = decoder._getPixel(packed) as Uint8Array;

        // Assert
        expect(Array.from(unpacked)).toEqual([3, 0, 2, 1]);
    });

    it('should write pixels correctly in _setPixel for 8-bit, 16-bit and packed sub-byte paths', () => {
        // Arrange
        const decoder = createDecoder();

        // 8-bit path
        const image8 = new Uint8Array(6);
        const data8 = new Uint8Array([10, 20, 30]);

        // Act
        decoder._setPixel(image8, data8, 0, 3, 0, 0, 8, 3);

        // Assert
        expect(Array.from(image8)).toEqual([10, 20, 30, 0, 0, 0]);

        // Arrange - 16-bit path
        const image16 = new Uint8Array(3);
        const data16 = new Uint16Array([0x1200, 0x3400, 0x5600]);

        // Act
        decoder._setPixel(image16, data16, 0, 3, 0, 0, 16, 3);

        // Assert
        expect(Array.from(image16)).toEqual([0x12, 0x34, 0x56]);

        // Arrange - packed 2-bit path
        const packedImage = new Uint8Array(1);
        const packedData = new Uint8Array([3]); // binary 11 -> should go to high 2 bits at x=0

        // Act
        decoder._setPixel(packedImage, packedData, 0, 1, 0, 0, 2, 1);

        // Assert
        expect(packedImage[0]).toBe(0b11000000);
    });

    it('should build image dictionary with BitsPerComponent=8 for 16-bit input, set Filter/DecodeParms and create soft mask', () => {
        // Arrange
        const decoder = createDecoder();
        setHeader(decoder, { _colorType: 0, _bitDepth: 16, _width: 2, _height: 1 });

        decoder._width = 2;
        decoder._height = 1;
        decoder._bitsPerComponent = 16;
        decoder._colors = 1;
        decoder._decodedImageData = new Uint8Array([10, 20]);
        decoder._maskData = new Uint8Array([255, 0]);

        decoder._isDecode = true;
        decoder._ideateDecode = false; // forces Filter branch
        decoder._shades = true;        // with !ideateDecode forces DecodeParms branch

        // Act
        const imageStream = decoder._getImageDictionary();

        // Assert
        expect(imageStream).toBeDefined();
        expect(imageStream.bytes).toEqual(decoder._decodedImageData);
        expect(imageStream._isCompress).toBeFalsy();

        const dict = imageStream.dictionary as _PdfDictionary;
        expect(dict.get('Width')).toBe(2);
        expect(dict.get('Height')).toBe(1);
        expect(dict.get('BitsPerComponent')).toBe(8); // highlighted 16-bit branch
        expect(dict.get('Filter')).toEqual(jasmine.any(_PdfName));
        expect(dict.get('ColorSpace')).toEqual(jasmine.anything());
        expect(dict.get('DecodeParms')).toEqual(jasmine.any(_PdfDictionary));

        expect(decoder._maskStream).toBeDefined();
        expect(decoder._maskStream.bytes).toEqual(decoder._maskData);
        expect(decoder._maskStream.dictionary.get('ColorSpace')).toEqual(jasmine.anything());
    });

    it('should reuse previously built image stream in _getImageDictionary when image stream already exists', () => {
        // Arrange
        const decoder = createDecoder();
        const existing = new _PdfStream([], new _PdfDictionary());
        existing.bytes = new Uint8Array([1]);
        existing.end = 1;
        decoder._imageStream = existing;

        // Act
        const result = decoder._getImageDictionary();

        // Assert
        expect(result).toBe(existing);
    });

    it('should return all highlighted chunk types from _getChunkType and return null for default branch', () => {
        // Arrange
        const decoder = createDecoder();

        // Act / Assert
        expect(decoder._getChunkType('bKGD')).toBe(4);
        expect(decoder._getChunkType('gAMA')).toBe(6);
        expect(decoder._getChunkType('hIST')).toBe(7);
        expect(decoder._getChunkType('pHYs')).toBe(8);
        expect(decoder._getChunkType('sBIT')).toBe(9);
        expect(decoder._getChunkType('tIME')).toBe(11);
        expect(decoder._getChunkType('zTXt')).toBe(13);
        expect(decoder._getChunkType('iCCP')).toBe(15);
        expect(decoder._getChunkType('iTXt')).toBe(16);
        expect(decoder._getChunkType('Unknown')).toBe(17);

        expect(decoder._getChunkType('NOT_A_REAL_CHUNK')).toBeNull();
    });

    it('should return average filter for type 3 and none for default in _getFilterType', () => {
        // Arrange
        const decoder = createDecoder();

        // Act
        const average = decoder._getFilterType(3);
        const fallback = decoder._getFilterType(99);

        // Assert
        expect(average).toBe(3);
        expect(fallback).toBe(0);
    });

    it('should dispose all cached buffers and references', () => {
        // Arrange
        const decoder = createDecoder();
        decoder._encodedStream = new Uint8Array([1]);
        decoder._maskData = new Uint8Array([2]);
        decoder._alpha = new Uint8Array([3]);
        decoder._dataStream = new Uint8Array([4]);
        decoder._decodedImageData = new Uint8Array([5]);
        decoder._colorSpace = ['x'];

        // Act
        decoder.dispose();

        // Assert
        expect(decoder._encodedStream).toBeNull();
        expect(decoder._maskData).toBeNull();
        expect(decoder._alpha).toBeNull();
        expect(decoder._dataStream).toBeNull();
        expect(decoder._decodedImageData).toBeNull();
        expect(decoder._colorSpace).toBeNull();
    });
});
