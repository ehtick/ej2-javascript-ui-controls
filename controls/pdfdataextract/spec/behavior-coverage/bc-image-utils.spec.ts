
import * as PdfBaseModule from '@syncfusion/ej2-pdf';
import * as ImageUtilsModule from '../../src/pdf-data-extract/core/image-extraction/image-utils';
import { _convertBlackAndWhiteToRGBA, _convertRGBToRGBA, _convertToRGBA, _grayToRGBA, imageKind } from '../../src/pdf-data-extract/core/image-extraction/image-utils';

describe('image-utils conversion coverage', () => {
    it('should cover _convertToRGBA for grayscale dispatch and default null branch', () => {
        // Arrange
        const littleEndianSpy: jasmine.Spy = spyOn(PdfBaseModule, '_isLittleEndian').and.returnValue(true);
        const grayscaleSource: Uint8Array = new Uint8Array([0b10100000]);
        const grayscaleDestination: Uint32Array = new Uint32Array(8);

        // Act
        const grayscaleResult: { srcPos: number; destPos: number } =
            _convertToRGBA(
                imageKind.grayScale1Bpp,
                grayscaleSource,
                grayscaleDestination,
                8,
                1,
                false
            ) as unknown as { srcPos: number; destPos: number };

        const unhandledResult: unknown =
            _convertToRGBA(999, grayscaleSource, grayscaleDestination, 8, 1, false) as unknown;

        // Assert
        expect(littleEndianSpy).toHaveBeenCalled();
        expect(grayscaleResult.srcPos).toBe(1);
        expect(grayscaleResult.destPos).toBe(8);
        expect(grayscaleDestination[0] >>> 0).toBe(0xffffffff);
        expect(grayscaleDestination[1] >>> 0).toBe(0xff000000);
        expect(grayscaleDestination[2] >>> 0).toBe(0xffffffff);
        expect(grayscaleDestination[3] >>> 0).toBe(0xff000000);
        expect(unhandledResult).toBeNull();
    });

    it('should cover _convertToRGBA for rgb dispatch using little-endian conversion with packed and remainder pixels', () => {
        // Arrange
        spyOn(PdfBaseModule, '_isLittleEndian').and.returnValue(true);
        const rgbSource: Uint8Array = new Uint8Array([
            1, 2, 3,
            4, 5, 6,
            7, 8, 9,
            10, 11, 12,
            13, 14, 15
        ]);
        const rgbDestination: Uint32Array = new Uint32Array(5);

        // Act
        const rgbResult: { srcPos: number; destPos: number } =
            _convertToRGBA(
                imageKind.rgb24BPP,
                rgbSource,
                rgbDestination,
                5,
                1,
                false
            ) as unknown as { srcPos: number; destPos: number };

        // Assert
        expect(rgbResult.srcPos).toBe(15);
        expect(rgbResult.destPos).toBe(5);

        expect(rgbDestination[0] >>> 0).toBe(0xff030201);
        expect(rgbDestination[1] >>> 0).toBe(0xff060504);
        expect(rgbDestination[2] >>> 0).toBe(0xff090807);
        expect(rgbDestination[3] >>> 0).toBe(0xff0c0b0a);
        expect(rgbDestination[4] >>> 0).toBe(0xff0f0e0d);
    });

    it('should cover _convertBlackAndWhiteToRGBA full-byte loop, widthRemainder continue path and little-endian mapping', () => {
        // Arrange
        spyOn(PdfBaseModule, '_isLittleEndian').and.returnValue(true);
        const source: Uint8Array = new Uint8Array([0b10101010]);
        const destination: Uint32Array = new Uint32Array(8);

        // Act
        const result: { srcPos: number; destPos: number } =
            _convertBlackAndWhiteToRGBA(
                source,
                0,
                destination,
                8,
                1,
                0xffffffff,
                false
            ) as { srcPos: number; destPos: number };

        // Assert
        expect(result.srcPos).toBe(1);
        expect(result.destPos).toBe(8);

        expect(destination[0] >>> 0).toBe(0xffffffff);
        expect(destination[1] >>> 0).toBe(0xff000000);
        expect(destination[2] >>> 0).toBe(0xffffffff);
        expect(destination[3] >>> 0).toBe(0xff000000);
        expect(destination[4] >>> 0).toBe(0xffffffff);
        expect(destination[5] >>> 0).toBe(0xff000000);
        expect(destination[6] >>> 0).toBe(0xffffffff);
        expect(destination[7] >>> 0).toBe(0xff000000);
    });

    it('should cover _convertBlackAndWhiteToRGBA remainder path, inverse decode and missing source fallback element', () => {
        // Arrange
        spyOn(PdfBaseModule, '_isLittleEndian').and.returnValue(false);
        const emptySource: Uint8Array = new Uint8Array(0);
        const destination: Uint32Array = new Uint32Array(3);
        const nonBlackColor: number = 0x11223344;

        // Act
        const result: { srcPos: number; destPos: number } =
            _convertBlackAndWhiteToRGBA(
                emptySource,
                0,
                destination,
                3,
                1,
                nonBlackColor,
                true
            ) as { srcPos: number; destPos: number };

        // Assert
        expect(result.srcPos).toBe(0);
        expect(result.destPos).toBe(3);

        // inverseDecode=true => zeroMapping=nonBlackColor, oneMapping=black
        // empty source => elem fallback = 255 => top 3 bits all 1 => all black
        expect(destination[0] >>> 0).toBe(0x000000ff);
        expect(destination[1] >>> 0).toBe(0x000000ff);
        expect(destination[2] >>> 0).toBe(0x000000ff);
    });

    it('should cover _convertRGBToRGBA big-endian branch with packed and remainder pixels', () => {
        // Arrange
        spyOn(PdfBaseModule, '_isLittleEndian').and.returnValue(false);
        const source: Uint8Array = new Uint8Array([
            1, 2, 3,
            4, 5, 6,
            7, 8, 9,
            10, 11, 12,
            13, 14, 15
        ]);
        const destination: Uint32Array = new Uint32Array(5);

        // Act
        const result: { srcPos: number; destPos: number } =
            _convertRGBToRGBA(source, 0, destination, 0, 5, 1) as { srcPos: number; destPos: number };

        // Assert
        expect(result.srcPos).toBe(15);
        expect(result.destPos).toBe(5);

        expect(destination[0] >>> 0).toBe(67306239);
        expect(destination[1] >>> 0).toBe(17303551);
        expect(destination[2] >>> 0).toBe(100994303);
        expect(destination[3] >>> 0).toBe(185207295);
        expect(destination[4] >>> 0).toBe(0x0d0e0fff);
    });

    it('should cover _grayToRGBA for little-endian and big-endian branches', () => {
        // Arrange
        const source: Uint8Array = new Uint8Array([0, 127, 255]);
        const littleEndianDestination: Uint32Array = new Uint32Array(3);
        const bigEndianDestination: Uint32Array = new Uint32Array(3);

        const endianSpy: jasmine.Spy = spyOn(PdfBaseModule, '_isLittleEndian');

        // Act
        endianSpy.and.returnValue(true);
        _grayToRGBA(source, littleEndianDestination);

        endianSpy.and.returnValue(false);
        _grayToRGBA(source, bigEndianDestination);

        // Assert
        expect(littleEndianDestination[0] >>> 0).toBe(0xff000000);
        expect(littleEndianDestination[1] >>> 0).toBe(0xff7f7f7f);
        expect(littleEndianDestination[2] >>> 0).toBe(0xffffffff);

        expect(bigEndianDestination[0] >>> 0).toBe(0x000000ff);
        expect(bigEndianDestination[1] >>> 0).toBe(0x7f7f7fff);
        expect(bigEndianDestination[2] >>> 0).toBe(0xffffffff);
    });
});

describe('_convertBlackAndWhiteToRGBA default parameter coverage', () => {
    it('should apply default nonBlackColor and default inverseDecode when omitted', () => {
        // Arrange
        spyOn(PdfBaseModule, '_isLittleEndian').and.returnValue(true);

        const source: Uint8Array = new Uint8Array([0b10000000]);
        const destination: Uint32Array = new Uint32Array(2);

        // Act
        const result: { srcPos: number; destPos: number } =
            _convertBlackAndWhiteToRGBA(
                source,
                0,
                destination,
                2,
                1
            ) as { srcPos: number; destPos: number };

        // Assert
        expect(result.srcPos).toBe(1);
        expect(result.destPos).toBe(2);

        // default inverseDecode = false:
        // bit 1 -> oneMapping -> default nonBlackColor = 0xffffffff
        expect(destination[0] >>> 0).toBe(0xffffffff);

        // bit 0 -> zeroMapping -> black for little-endian = 0xff000000
        expect(destination[1] >>> 0).toBe(0xff000000);
    });
});
