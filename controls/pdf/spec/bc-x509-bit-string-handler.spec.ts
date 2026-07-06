import { _PdfUniqueBitString } from '../src/pdf/core/security/digital-signature/x509/x509-bit-string-handler';
import { _PdfUniqueEncodingElement } from '../src/pdf/core/security/digital-signature/asn1/unique-encoding-element';

describe('x509 _PdfUniqueBitString (lines 65-142)', () => {

	it('constructor, _getBytes and _getUniqueEncoded produce expected values', () => {
		// Arrange
		const payload: Uint8Array = new Uint8Array([1, 2, 3]);
		const extraBits: number = 3;
		const bitString: _PdfUniqueBitString = new _PdfUniqueBitString(payload, extraBits);
		// Act
		const bytes: Uint8Array = bitString._getBytes();
		const encoded: Uint8Array = bitString._getUniqueEncoded();
		// Assert
		expect(bytes).toBeDefined();
		expect(bytes.length).toBe(3);
		expect(bytes[0]).toBe(1);
		expect(encoded.length).toBe(4);
		expect(encoded[0]).toBe(extraBits);
		expect(encoded[1]).toBe(1);
		expect(encoded[2]).toBe(2);
		expect(encoded[3]).toBe(3);
	});

	it('_fromAbstractSyntaxOctets parses leading pad octet into _extraBits', () => {
		// Arrange
		const input: Uint8Array = new Uint8Array([2, 10, 11]);
		const subject: _PdfUniqueBitString = new _PdfUniqueBitString();
		// Act
		const parsed: _PdfUniqueBitString = subject._fromAbstractSyntaxOctets(input);
		// Assert
		expect(parsed._getBytes().length).toBe(2);
		expect(parsed._getBytes()[0]).toBe(10);
		expect(parsed._extraBits).toBe(2);
	});

	it('_equals covers non-instance, length/content/extraBits mismatches and equality', () => {
		// Arrange
		const a: _PdfUniqueBitString = new _PdfUniqueBitString(new Uint8Array([1, 2]), 1);
		const nonInstance: any = { foo: 'bar' };
		const differentLength: _PdfUniqueBitString = new _PdfUniqueBitString(new Uint8Array([1, 2, 3]), 1);
		const differentContent: _PdfUniqueBitString = new _PdfUniqueBitString(new Uint8Array([1, 3]), 1);
		const differentPad: _PdfUniqueBitString = new _PdfUniqueBitString(new Uint8Array([1, 2]), 2);
		const equalCopy: _PdfUniqueBitString = new _PdfUniqueBitString(new Uint8Array([1, 2]), 1);
		// Act / Assert
		expect(a._equals(nonInstance)).toBe(false);
		expect(a._equals(differentLength)).toBe(false);
		expect(a._equals(differentContent)).toBe(false);
		expect(a._equals(differentPad)).toBe(false);
		expect(a._equals(equalCopy)).toBe(true);
	});

	it('_getUniqueBitStringFromTag returns inner bit-string when explicit and handles implicit octet-string', () => {
		// Arrange - explicit inner is a _PdfUniqueBitString instance
		const inner: _PdfUniqueBitString = new _PdfUniqueBitString(new Uint8Array([5, 6]), 4);
		const explicitTag: any = { _getInner: () => inner };
		// Act
		const explicitResult: _PdfUniqueBitString = new _PdfUniqueBitString()._getUniqueBitStringFromTag(explicitTag, true);
		// Assert
		expect(explicitResult).toBe(inner);

		// Arrange - implicit inner is an encoding element containing octet string bytes
		const octets: Uint8Array = new Uint8Array([7, 8, 9]); // [pad, payload...]
		const enc: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, octets);
		const implicitTag: any = { _getInner: () => enc };
		// Act
		const implicitResult: _PdfUniqueBitString = new _PdfUniqueBitString()._getUniqueBitStringFromTag(implicitTag, false);
		// Assert - parsed payload should be subarray(1)
		expect(implicitResult._extraBits).toBe(7);
		expect(implicitResult._getBytes().length).toBe(2);
		expect(implicitResult._getBytes()[0]).toBe(8);
		expect(implicitResult._getBytes()[1]).toBe(9);
	});

	it('_getUniqueBitString handles null, instance and invalid entries', () => {
		// Arrange
		const helper: _PdfUniqueBitString = new _PdfUniqueBitString();
		// Act / Assert
		expect(helper._getUniqueBitString(null)).toBeNull();
		const inst: _PdfUniqueBitString = new _PdfUniqueBitString(new Uint8Array([1]), 0);
		expect(helper._getUniqueBitString(inst)).toBe(inst);
		expect(() => helper._getUniqueBitString({})).toThrowError('Invalid Entry');
	});

	it('_getAbstractSyntax returns an encoding element with octet string matching encoded bytes', () => {
		// Arrange
		const subject: _PdfUniqueBitString = new _PdfUniqueBitString(new Uint8Array([12, 13]), 5);
		// Act
		const element: _PdfUniqueEncodingElement = subject._getAbstractSyntax();
		const octets: Uint8Array = element._getOctetString();
		// Assert - first octet is pad, following are data bytes
		expect(octets[0]).toBe(5);
		expect(octets[1]).toBe(12);
		expect(octets[2]).toBe(13);
	});

});

