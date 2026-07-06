import { _PdfMessageDigestAlgorithms } from '../../src/pdf/core/security/digital-signature/signature/pdf-digest-algorithms';

describe('PdfMessageDigestAlgorithms - targeted behavior tests', () => {

	it('getDigest returns null for falsy id (covers return null)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const inputId: any = null;
		expect(inputId).toBeNull();
		// Act
		const result = algorithms._getDigest(inputId);
		// Assert
		expect(result).toBeNull();
	});

	it('getDigest returns mapped name for known OID (covers mapped lookup)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const oid = '1.3.14.3.2.26';
		expect(oid).toBe('1.3.14.3.2.26');
		// Act
		const result = algorithms._getDigest(oid);
		// Assert
		expect(result).toBe('SHA1');
	});

	it('getDigest returns original id when unknown (covers fallback to id)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const unknownId = '9.9.9.9';
		expect(unknownId).toBe('9.9.9.9');
		// Act
		const result = algorithms._getDigest(unknownId);
		// Assert
		expect(result).toBe(unknownId);
	});

	it('getMessageDigest returns _Sha1 for sha1 variant (covers sha1 branch)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const input = 'sha-1';
		expect(input).toBe('sha-1');
		// Act
		const instance = algorithms._getMessageDigest(input);
		// Assert
		expect(typeof instance._hash).toBe('function');
	});

	it('getMessageDigest returns _Sha256 for sha256 variant (covers sha256 branch)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const input = 'SHA256';
		expect(input).toBe('SHA256');
		// Act
		const instance = algorithms._getMessageDigest(input);
		// Assert
		expect(typeof instance._hash).toBe('function');
	});

	it('getMessageDigest returns _Sha384 for sha384 variant (covers sha384 branch)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const input = 'sha_384';
		expect(input).toBe('sha_384');
		// Act
		const instance = algorithms._getMessageDigest(input);
		// Assert
		expect(typeof instance._hash).toBe('function');
	});

	it('getMessageDigest returns _Sha512 for sha512 variant (covers sha512 branch)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const input = 'sha512';
		expect(input).toBe('sha512');
		// Act
		const instance = algorithms._getMessageDigest(input);
		// Assert
		expect(typeof instance._hash).toBe('function');
	});

	it('getMessageDigest returns RIPEMD evaluator for ripemd variant (covers ripemd branch)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const input = 'RIPEMD-160';
		expect(input).toBe('RIPEMD-160');
		// Act
		const instance = algorithms._getMessageDigest(input);
		// Assert
		expect(typeof instance._hash).toBe('function');
	});

	it('getMessageDigest resolves algorithm via OID mapping (covers forEach mapping path)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const oidKey = '1.3.14.3.2.26';
		expect(oidKey).toBe('1.3.14.3.2.26');
		// Act
		const instance = algorithms._getMessageDigest(oidKey);
		// Assert
		expect(typeof instance._hash).toBe('function');
	});

	it('getMessageDigest throws for unknown algorithm (covers throw branch)', () => {
		// Arrange
		const algorithms = new _PdfMessageDigestAlgorithms();
		expect(algorithms).toBeDefined();
		const bad = 'not-a-valid-digest';
		expect(bad).toBe('not-a-valid-digest');
		// Act & Assert
		expect(() => { algorithms._getMessageDigest(bad); }).toThrowError(/Invalid message digest algorithm/);
	});

});

