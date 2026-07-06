import { _RealValueType } from '../src/pdf/core/security/digital-signature/asn1/enumerator';
import {
    _bufferToInteger,
    _integerToBuffer,
    _decodeSignedBigEndianInteger,
    _decodeUnsignedBigEndianInteger,
    _dissectFloat,
    _encodeBigEndianSignedInteger,
    _encodeUnsignedBigEndianInteger,
    _encodeX690BinaryRealNumber,
    _getBit,
    _packBits,
    _setBit,
    _setBitInBase256,
    _convertBytesToText,
    _isBasicEncodingElement
} from '../src/pdf/core/security/digital-signature/asn1/utils';

describe('ASN.1 utils behavior', () => {

    it('_bufferToInteger handles empty, normal and too-long inputs', () => {
        expect(_bufferToInteger(new Uint8Array([]))).toBe(0);
        expect(_bufferToInteger(new Uint8Array([0x01, 0x02, 0x03]))).toBe(0x010203);
        expect(() => _bufferToInteger(new Uint8Array([1,2,3,4,5]))).toThrowError();
    });

    it('_integerToBuffer encodes various ranges and rejects out of range', () => {
        expect(Array.from(_integerToBuffer(5))).toEqual([5]);
        expect(Array.from(_integerToBuffer(-1))).toEqual([255]);
        const twoByte = _integerToBuffer(-200);
        expect(twoByte.length).toBe(2);
        const threeByte = _integerToBuffer(0x010203);
        expect(threeByte.length).toBe(3);
        const fourByte = _integerToBuffer(0x70000000);
        expect(fourByte.length).toBe(4);
        expect(() => _integerToBuffer(Number.MAX_SAFE_INTEGER)).toThrowError();
    });

    it('_decodeSignedBigEndianInteger and _decodeUnsignedBigEndianInteger edge cases', () => {
        expect(_decodeSignedBigEndianInteger(new Uint8Array([]))).toBe(0);
        expect(_decodeSignedBigEndianInteger(new Uint8Array([0xFF]))).toBe(-1);
        expect(() => _decodeSignedBigEndianInteger(new Uint8Array([1,2,3,4,5]))).toThrowError();

        expect(_decodeUnsignedBigEndianInteger(new Uint8Array([]))).toBe(0);
        expect(_decodeUnsignedBigEndianInteger(new Uint8Array([0x01, 0x00]))).toBe(256);
        expect(() => _decodeUnsignedBigEndianInteger(new Uint8Array([1,2,3,4,5]))).toThrowError();
    });

    it('_dissectFloat returns components consistent with sign and numeric types', () => {
        const pos = _dissectFloat(1.5);
        expect(typeof pos.exponent).toBe('number');
        expect(typeof pos.mantissa).toBe('number');
        expect(pos.negative).toBe(false);

        const neg = _dissectFloat(-2.75);
        expect(neg.negative).toBe(true);
        expect(typeof neg.exponent).toBe('number');
        expect(typeof neg.mantissa).toBe('number');
    });

    it('_encodeBigEndianSignedInteger / _encodeUnsignedBigEndianInteger and errors', () => {
        expect(Array.from(_encodeBigEndianSignedInteger(10))).toEqual([10]);
        expect(Array.from(_encodeBigEndianSignedInteger(-5))).toEqual([251]);
        expect(_encodeBigEndianSignedInteger(20000).length).toBeGreaterThan(1);
        expect(_encodeBigEndianSignedInteger(0x123456).length).toBe(3);
        // force the 4-byte path (previous else not taken) by using a value
        // outside the 3-byte range but within 32-bit signed bounds
        expect(Array.from(_encodeBigEndianSignedInteger(0x12345678))).toEqual([0x12, 0x34, 0x56, 0x78]);
        // out-of-range signed values should throw (covering too-small and too-big branches)
        expect(() => _encodeBigEndianSignedInteger(-2147483649)).toThrowError();
        expect(() => _encodeBigEndianSignedInteger(2147483648)).toThrowError();

        expect(Array.from(_encodeUnsignedBigEndianInteger(0))).toEqual([0]);
        expect(_encodeUnsignedBigEndianInteger(0x123456).length).toBe(3);
        expect(() => _encodeUnsignedBigEndianInteger(-1)).toThrowError();
        expect(() => _encodeUnsignedBigEndianInteger(0x1FFFFFFFF)).toThrowError();
    });

    it('_encodeX690BinaryRealNumber handles special values and normal numbers', () => {
        expect(_encodeX690BinaryRealNumber(0.0).length).toBe(0);
        expect(Array.from(_encodeX690BinaryRealNumber(NaN))).toEqual([_RealValueType.notANumber]);
        expect(Array.from(_encodeX690BinaryRealNumber(Infinity))).toEqual([_RealValueType.plusInfinity]);
        expect(Array.from(_encodeX690BinaryRealNumber(-Infinity))).toEqual([_RealValueType.minusInfinity]);

        const normal = _encodeX690BinaryRealNumber(3.5);
        expect(normal.length).toBeGreaterThan(1);
    });

    it('_encodeX690BinaryRealNumber does not throw for very small encodable numbers (exponent > -1020)', () => {
        const tinyEncodable = Math.pow(2, -988); // raw exponent will be > -1020 after normalization
        const encoded = _encodeX690BinaryRealNumber(tinyEncodable);
        expect(encoded).toBeDefined();
        expect(encoded.length).toBeGreaterThan(0);
    });

    it('_encodeX690BinaryRealNumber throws for numbers too precise to encode (exponent <= -1020)', () => {
        // Number.MIN_VALUE is the smallest positive subnormal JS number and
        // should produce a very small exponent triggering the "too precise" error
        expect(() => _encodeX690BinaryRealNumber(Number.MIN_VALUE)).toThrowError();
    });

    it('_getBit, _packBits, _setBit and _setBitInBase256 behave as expected', () => {
        const one = new Uint8Array([0x01]);
        expect(_getBit(one, 0)).toBeTruthy();
        expect(_getBit(new Uint8Array([0x80]), 7)).toBeTruthy();

        const bits = new Uint8ClampedArray([1,0,1,1,0,0,0,1,1]); // 9 bits
        const packed = _packBits(bits);
        expect(packed.length).toBe(2);
        expect((packed[0] & 0xFF) !== undefined).toBeTruthy();

        const target = new Uint8Array([0]);
        _setBit(target, 0, true);
        expect(target[0] & 0x01).toBe(1);
        _setBit(target, 0, false);
        expect(target[0] & 0x01).toBe(0);

        const target2 = new Uint8Array([0]);
        _setBitInBase256(target2, 7, true);
        expect((target2[0] & 0x80) !== 0).toBeTruthy();
        _setBitInBase256(target2, 7, false);
        expect((target2[0] & 0x80) === 0).toBeTruthy();
    });

    it('_convertBytesToText decodes utf-8 sequences and rejects unsupported encodings', () => {
        expect(_convertBytesToText(new Uint8Array([0x41]))).toBe('A'); // ASCII
        expect(_convertBytesToText(new Uint8Array([0xC2, 0xA2]))).toBe('¢'); // 2-byte
        expect(_convertBytesToText(new Uint8Array([0xE2, 0x82, 0xAC]))).toBe('€'); // 3-byte
        // 4-byte emoji U+1F600 (grinning face)
        expect(_convertBytesToText(new Uint8Array([0xF0,0x9F,0x98,0x80]))).toBe('\uD83D\uDE00'); // surrogate pair check
        expect(() => _convertBytesToText(new Uint8Array([0x41]), 'utf-16')).toThrowError();
    });

    it('_isBasicEncodingElement detects BER indefinite-length sequence', () => {
        expect(_isBasicEncodingElement(new Uint8Array([0x30, 0x80]))).toBeTruthy();
        expect(_isBasicEncodingElement(new Uint8Array([0x00, 0x30, 0x80, 0x01]))).toBeTruthy();
        expect(_isBasicEncodingElement(new Uint8Array([0x30, 0x00]))).toBeFalsy();
    });

});
