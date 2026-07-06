
import { _PdfBigInt } from '../src/pdf/core/security/digital-signature/pdf-big-integer';

describe('PdfBigInt basic behaviors', () => {

    it('constructor default and zero string produce "0" and bigint 0', () => {
        // Arrange
        const a: _PdfBigInt = new _PdfBigInt();
        const b: _PdfBigInt = new _PdfBigInt('000');

        // Act
        const sA: string = a._toString();
        const sB: string = b._toString();
        const nA: bigint = a._toBigInt();
        const nB: bigint = b._toBigInt();

        // Assert
        expect(sA).toBe('0');
        expect(sB).toBe('0');
        expect(nA.toString()).toBe('0');
        expect(nB.toString()).toBe('0');
    });

    it('parses decimal string and preserves value in toString / toBigInt', () => {
        // Arrange
        const big: _PdfBigInt = new _PdfBigInt('00123');

        // Act & Assert
        expect(big._toString()).toBe('123');
        expect(big._toBigInt().toString()).toBe('123');
    });

    it('_add handles digit carry correctly', () => {
        // Arrange
        const a: _PdfBigInt = new _PdfBigInt('9');
        const b: _PdfBigInt = new _PdfBigInt('19');

        // Act
        a._add(1);   // 9 + 1 = 10
        b._add(5);   // 19 + 5 = 24

        // Assert
        expect(a._toString()).toBe('10');
        expect(b._toString()).toBe('24');
    });

    it('_multiply multiplies value by 256 correctly', () => {
        // Arrange
        const value: _PdfBigInt = new _PdfBigInt('1');

        // Act
        value._multiply();

        // Assert
        expect(value._toString()).toBe('256');
    });

    it('_bitLength returns correct values for small numbers (no timeout)', () => {
        // NOTE: values intentionally kept small to avoid CPU-heavy loops in Karma
        expect(new _PdfBigInt('0')._bitLength()).toBe(0);
        expect(new _PdfBigInt('1')._bitLength()).toBe(1);
        expect(new _PdfBigInt('2')._bitLength()).toBe(2);
        expect(new _PdfBigInt('3')._bitLength()).toBe(2);
    });

});
