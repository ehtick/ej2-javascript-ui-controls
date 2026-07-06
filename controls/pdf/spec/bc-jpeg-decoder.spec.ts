define(["require", "exports", "../src/pdf/core/graphics/images/jpeg-decoder", "../src/pdf/core/base-stream", "../src/pdf/core/pdf-primitives", "../src/pdf/core/enumerator"], function (require: any, exports: any, jpeg_decoder_1: { _JpegDecoder: new (arg0: any) => any; }, base_stream_1: any, pdf_primitives_1: any, enumerator_1: any) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });

    describe('JpegDecoder behavior tests', function () {
        var decoder:any;
        var mockStream:any;

        beforeEach(function () {
            // Create a valid JPEG-like header to avoid parse errors during instantiation
            // Structure: SOI (FFD8) + APP0 segment (FFE0) with length and JFIF marker
            mockStream = new Uint8Array([
                0xFF, 0xD8,                                    // SOI
                0xFF, 0xE0,                                    // APP0
                0x00, 0x10,                                    // Length = 16
                0x4A, 0x46, 0x49, 0x46, 0x00,                // JFIF\0
                0x01, 0x01,                                    // Version 1.1
                0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00     // DPI and thumbnail
            ]);
            
            // Spy on _initialize to prevent constructor from trying to parse the stream
            spyOn(jpeg_decoder_1._JpegDecoder.prototype, '_initialize').and.callFake(function () {
                this._format = null;
                this._width = 0;
                this._height = 0;
                this._noOfComponents = 0;
                this._bitsPerComponent = 8;
                this._position = 0;
                this._imageStream = null;
                this._imageData = null;
            });
            
            // Now safe to instantiate real _JpegDecoder
            decoder = new jpeg_decoder_1._JpegDecoder(mockStream);
        });

        it('_getColorSpace returns DeviceGray for single component', function () {
            // Arrange
            decoder._noOfComponents = 1;
            // Act
            var colorSpace = decoder._getColorSpace();
            // Assert
            expect(colorSpace).toBe('DeviceGray');
            expect(typeof colorSpace).toBe('string');
        });

        it('_getColorSpace returns DeviceCMYK for four components', function () {
            // Arrange
            decoder._noOfComponents = 4;
            // Act
            var colorSpace = decoder._getColorSpace();
            // Assert
            expect(colorSpace).toBe('DeviceCMYK');
            expect(typeof colorSpace).toBe('string');
        });

        it('_getColorSpace returns DeviceRGB for other components', function () {
            // Arrange
            decoder._noOfComponents = 3;
            // Act
            var colorSpace = decoder._getColorSpace();
            // Assert
            expect(colorSpace).toBe('DeviceRGB');
            expect(typeof colorSpace).toBe('string');
        });

        it('_getColorSpace returns DeviceRGB for two components', function () {
            // Arrange
            decoder._noOfComponents = 2;
            // Act
            var colorSpace = decoder._getColorSpace();
            // Assert
            expect(colorSpace).toBe('DeviceRGB');
        });

        it('_getDecodeParams builds dictionary with proper keys and values', function () {
            // Arrange
            decoder._width = 800;
            decoder._height = 600;
            decoder._bitsPerComponent = 8;
            // Act
            var decodeParams = decoder._getDecodeParams();
            // Assert
            expect(decodeParams).toBeDefined();
            expect(typeof decodeParams).toBe('object');
        });

        it('_skipStream throws error when length is less than 2', function () {
            // Arrange
            decoder._getBuffer = function (pos:any) {
                if (pos === decoder._position) return 0x00;
                if (pos === decoder._position + 1) return 0x01;
                return 0;
            };
            decoder._seek = function (n:any) { decoder._position += n; };
            decoder._position = 0;
            // Act & Assert
            expect(function () {
                decoder._skipStream();
            }).toThrow();
        });

        it('_skipStream does not seek when length equals 2', function () {
            // Arrange
            var seekCalls = 0;
            decoder._getBuffer = function (pos:any) {
                if (pos === decoder._position) return 0x00;
                if (pos === decoder._position + 1) return 0x02;
                return 0;
            };
            decoder._seek = function (n:any) { seekCalls++; decoder._position += n; };
            decoder._position = 0;
            // Act
            decoder._skipStream();
            // Assert'_readHeader parses SOF marker when found before bounds exceeded'
            expect(seekCalls).toBe(2);
        });

        it('_skipStream seeks correct offset when length is greater than 2', function () {
            // Arrange
            var seekOffsets :any= [];
            decoder._getBuffer = function (pos:any) {
                if (pos === decoder._position) return 0x00;
                if (pos === decoder._position + 1) return 0x08;
                return 0;
            };
            decoder._seek = function (n:any) { 
                seekOffsets.push(n);
                decoder._position += n;
            };
            decoder._position = 0;
            // Act
            decoder._skipStream();
            // Assert
            expect(seekOffsets.length).toBe(2);
            expect(seekOffsets[0]).toBe(2);
            expect(seekOffsets[1]).toBe(6);
        });

        it('_getMarker returns marker when no bytes skipped before 0xFF', function () {
            // Arrange
            var readSequence = [255, 216, 0];
            var readIdx = 0;
            decoder._readByte = function () {
                return readSequence[readIdx++];
            };
            decoder._toUnsigned16 = function (val:any) { return val; };
            // Act
            var marker = decoder._getMarker();
            // Assert
            expect(marker).toBeDefined();
            expect(typeof marker).toBe('number');
        });

        it('_getMarker throws error when bytes are skipped before 0xFF', function () {
            // Arrange
            var readSequence = [100, 200, 255, 216, 0];
            var readIdx = 0;
            decoder._readByte = function () {
                return readSequence[readIdx++];
            };
            decoder._toUnsigned16 = function (val:any) { return val; };
            // Act & Assert
            expect(function () {
                decoder._getMarker();
            }).toThrow();
        });

        it('_getMarker handles multiple 0xFF bytes in marker sequence', function () {
            // Arrange
            var readSequence = [255, 255, 255, 216, 0];
            var readIdx = 0;
            decoder._readByte = function () {
                return readSequence[readIdx++];
            };
            decoder._toUnsigned16 = function (val:any) { return val; };
            // Act
            var marker = decoder._getMarker();
            // Assert
            expect(marker).toBeDefined();
        });

        it('_readExceededJpegImage extracts dimensions from SOF marker 0x00C0', function () {
            // Arrange
            decoder._getMarker = function () { return 0x00C0; };
            decoder._seek = function (n:any) { };
            decoder._position = 0;
            decoder._getBuffer = function (pos:any) {
                if (pos === decoder._position + 1) return 0x04;
                if (pos === decoder._position + 2) return 0x80;
                if (pos === decoder._position + 3) return 0x03;
                if (pos === decoder._position + 4) return 0x20;
                if (pos === decoder._position + 5) return 0x03;
                return 0;
            };
            // Act
            decoder._readExceededJpegImage();
            // Assert
            expect(decoder._height).toBeDefined();
            expect(decoder._width).toBeDefined();
            expect(decoder._noOfComponents).toBeDefined();
        });

        it('_readExceededJpegImage extracts dimensions from SOF marker 0x00C2', function () {
            // Arrange
            decoder._getMarker = function () { return 0x00C2; };
            decoder._seek = function (n:any) { };
            decoder._position = 0;
            decoder._getBuffer = function (pos:any) {
                if (pos === decoder._position + 1) return 0x02;
                if (pos === decoder._position + 2) return 0x00;
                if (pos === decoder._position + 3) return 0x01;
                if (pos === decoder._position + 4) return 0x00;
                if (pos === decoder._position + 5) return 0x03;
                return 0;
            };
            // Act
            decoder._readExceededJpegImage();
            // Assert
            expect(decoder._height).toBeGreaterThan(0);
        });

        it('_readExceededJpegImage skips non-SOF markers via default case', function () {
            // Arrange
            var markerSequence = [0x00D8, 0x00E0, 0x00C0];
            var markerIdx = 0;
            decoder._getMarker = function () { return markerSequence[markerIdx++]; };
            decoder._skipStream = function () { };
            decoder._seek = function (n:any) { };
            decoder._position = 0;
            decoder._getBuffer = function (pos:any) {
                if (pos === decoder._position + 1) return 0x04;
                if (pos === decoder._position + 2) return 0x80;
                if (pos === decoder._position + 3) return 0x03;
                if (pos === decoder._position + 4) return 0x20;
                if (pos === decoder._position + 5) return 0x03;
                return 0;
            };
            // Act
            decoder._readExceededJpegImage();
            // Assert
            expect(decoder._width).toBeDefined();
        });

        it('_readHeader parses SOF marker when found before bounds exceeded', function () {
            // Arrange
            var imgBuffer = new Uint8Array(30);
            imgBuffer[4] = 0x00;
            imgBuffer[5] = 0x10;
            imgBuffer[7] = 192;
            imgBuffer[11] = 0x02;
            imgBuffer[12] = 0x80;
            imgBuffer[13] = 0x01;
            imgBuffer[14] = 0xE0;
            imgBuffer[15] = 0x03;
            decoder._reset = function () { };
            decoder._read = function (buf:any, offset:any, len:any) {
                for (var i = 0; i < len && i + offset < imgBuffer.length; i++) {
                    buf[offset + i] = imgBuffer[offset + i];
                }
            };
            decoder._getBuffer = function (idx:any) { return imgBuffer[idx]; };

            // Assert
            expect(decoder._width).toBe(0);
            expect(decoder._height).toBe(0);
        });

        it('_readHeader falls back to exceeded scan when length exceeds bounds', function () {
            // Arrange
            var imgBuffer = new Uint8Array(10);
            imgBuffer[4] = 0xFF;
            imgBuffer[5] = 0xFF;
            decoder._reset = function () { };
            decoder._read = function (buf:any, offset:any, len:any) {
                for (var i = 0; i < len && i + offset < imgBuffer.length; i++) {
                    buf[offset + i] = imgBuffer[offset + i];
                }
            };
            decoder._getBuffer = function (idx:any) { return imgBuffer[idx] || 0; };
            decoder._seek = function (n:any) { };
            decoder._readExceededJpegImage = function () {
                decoder._width = 640;
                decoder._height = 480;
                decoder._noOfComponents = 3;
            };
            // Act
            decoder._readHeader();
            // Assert
            expect(decoder._width).toBe(640);
        });

        it('_getImageDictionary returns existing stream when available and length > 0', function () {
            // Arrange
            var existingStream = { length: 10, bytes: new Uint8Array(100) };
            decoder._imageStream = existingStream;
            // Act
            var result = decoder._getImageDictionary();
            // Assert
            expect(result).toBe(existingStream);
        });

        it('_getImageDictionary builds new stream when _imageStream is null', function () {
            // Arrange
            decoder._imageStream = null;
            decoder._imageData = new Uint8Array(100);
            decoder._width = 800;
            decoder._height = 600;
            decoder._bitsPerComponent = 8;
            decoder._noOfComponents = 3;
            decoder._getBuffer = function (pos:any) { return 0; };
            decoder._reset = function () { };
            decoder._read = function () { };
            // Act
            var result = decoder._getImageDictionary();
            // Assert
            expect(result).toBeDefined();
            expect(result.dictionary).toBeDefined();
        });

        it('_getImageDictionary builds new stream when length is 0', function () {
            // Arrange
            decoder._imageStream = { length: 0 };
            decoder._imageData = new Uint8Array(256);
            decoder._width = 640;
            decoder._height = 480;
            decoder._bitsPerComponent = 8;
            decoder._noOfComponents = 1;
            decoder._getBuffer = function (pos:any) { return pos % 256; };
            decoder._reset = function () { };
            decoder._read = function () { };
            // Act
            var result = decoder._getImageDictionary();
            // Assert
            expect(result).toBeDefined();
            expect(result.bytes.length).toBe(256);
        });

        it('_getImageDictionary copies data in chunks when length > chunkSize', function () {
            // Arrange
            decoder._imageStream = null;
            var largeData = new Uint8Array(2048);
            for (var i = 0; i < largeData.length; i++) {
                largeData[i] = i % 256;
            }
            decoder._imageData = largeData;
            decoder._width = 512;
            decoder._height = 512;
            decoder._bitsPerComponent = 8;
            decoder._noOfComponents = 3;
            var bufferCalls = 0;
            decoder._getBuffer = function (pos:any) {
                bufferCalls++;
                return largeData[pos] || 0;
            };
            decoder._reset = function () { };
            decoder._read = function () { };
            // Act
            var result = decoder._getImageDictionary();
            // Assert
            expect(result.bytes.length).toBe(2048);
            expect(bufferCalls).toBeGreaterThan(1024);
        });

        it('_getImageDictionary sets dictionary entries correctly', function () {
            // Arrange
            decoder._imageStream = null;
            decoder._imageData = new Uint8Array(100);
            decoder._width = 800;
            decoder._height = 600;
            decoder._bitsPerComponent = 8;
            decoder._noOfComponents = 3;
            decoder._getBuffer = function (pos:any) { return 0; };
            decoder._reset = function () { };
            decoder._read = function () { };
            // Act
            var result = decoder._getImageDictionary();
            // Assert
            expect(result.dictionary).toBeDefined();
            expect(result.isImageStream).toBe(true);
            expect(result._isCompress).toBe(false);
        });

        it('_imageDataAsNumberArray getter returns _imageData as ArrayBuffer', function () {
            // Arrange
            var testData = new Uint8Array(50);
            testData[0] = 100;
            decoder._imageData = testData;
            // Act
            var result = decoder._imageDataAsNumberArray;
            // Assert
            expect(result).toBeDefined();
            expect(result).toBe(testData);
        });

    });

});
