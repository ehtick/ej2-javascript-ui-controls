import { _PdfDigestInformation } from '../../src/pdf/core/security/digital-signature/signature/pdf-digest-handler';

describe('_PdfDigestInformation multi-byte length branches', () => {

	it('encodes when content and digest lengths require multi-byte length fields', () => {
		class MockAlgorithm {
			_getEncoded(): Uint8Array { return new Uint8Array([1, 2, 3]); }
		}
		const algorithm = new MockAlgorithm() as unknown as any;
		const digestLength = 130;
		const digest = new Uint8Array(digestLength);
		digest.fill(0xAA);

		const info = new _PdfDigestInformation(algorithm, digest);
		const encoded = info._getUniqueEncoded();

		expect(encoded[0]).toBe(0x30);
		expect(encoded[1]).toBe(0x81);
		expect(encoded[2]).toBe(136);
		expect(Array.from(encoded.slice(3, 6))).toEqual([1, 2, 3]);
		expect(encoded[6]).toBe(0x04);
		expect(encoded[7]).toBe(0x81);
		expect(encoded[8]).toBe(digestLength);
		expect(encoded.length).toBe(1 + 2 + 3 + 1 + 2 + digestLength);
		expect(encoded[encoded.length - 1]).toBe(0xAA);
	});

	it('_getLengthBytes produces multi-byte encoding for medium large lengths', () => {
		const algorithm = { _getEncoded: () => new Uint8Array([1]) } as unknown as any;
		const info = new _PdfDigestInformation(algorithm, new Uint8Array(0));

		const bytes = (info as unknown as any)._getLengthBytes(500);
		expect(bytes).toEqual([0x82, 0x01, 0xF4]);
	});

	it('_getLengthBytes produces two-byte form for value just above 127', () => {
		const algorithm = { _getEncoded: () => new Uint8Array([1]) } as unknown as any;
		const info = new _PdfDigestInformation(algorithm, new Uint8Array(0));

		const bytes = (info as unknown as any)._getLengthBytes(130);
		expect(bytes).toEqual([0x81, 0x82]);
	});

});

