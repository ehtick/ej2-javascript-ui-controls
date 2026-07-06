import { _PdfSignaturePrivateKey } from '../src/pdf/core/security/digital-signature/signature/signature-privatekey';
import { _PdfMessageDigestAlgorithms } from '../src/pdf/core/security/digital-signature/signature/pdf-digest-algorithms';
import { _PdfSignerUtilities } from '../src/pdf/core/security/digital-signature/signature/signature-utilities';

describe('PdfSignaturePrivateKey', () => {

    it('constructor without key sets RSA and hash', () => {
        // Arrange
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getAllowedDigests').and.returnValue('allowed');
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getDigest').and.returnValue('SHA256');

        // Act
        const pk = new _PdfSignaturePrivateKey('sha256');

        // Assert
        expect(pk._getHashAlgorithm()).toBe('SHA256');
        expect(pk._getEncryptionAlgorithm()).toBe('RSA');
    });

    it('constructor with valid RSA-like key sets RSA', () => {
        // Arrange
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getAllowedDigests').and.returnValue('allowed');
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getDigest').and.returnValue('SHA1');
        const key = { modulus: 'm', privateExponent: 'd' } as any;

        // Act
        const pk = new _PdfSignaturePrivateKey('sha1', key);

        // Assert
        expect(pk._getEncryptionAlgorithm()).toBe('RSA');
    });

    it('constructor with invalid key throws', () => {
        // Arrange
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getAllowedDigests').and.returnValue('allowed');
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getDigest').and.returnValue('SHA1');
        const badKey = { foo: 'bar' } as any;

        // Act / Assert
        expect(() => new _PdfSignaturePrivateKey('sha1', badKey)).toThrowError('Invalid key type');
    });

    it('_isRonCipherKey returns true for RSA-like keys and false otherwise', () => {
        // Arrange
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getAllowedDigests').and.returnValue('x');
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getDigest').and.returnValue('SHA1');
        const pk = new _PdfSignaturePrivateKey('sha1');

        // Act / Assert
        expect(pk._isRonCipherKey({ modulus: 1, privateExponent: 2 } as any)).toBeTruthy();
        expect(pk._isRonCipherKey({ modulus: 1 } as any)).toBeFalsy();
    });

    it('_sign returns signature on success and uses expected signMode', () => {
        // Arrange
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getAllowedDigests').and.returnValue('a');
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getDigest').and.returnValue('SHA512');
        let capturedSignMode: string = '';
        spyOn(_PdfSignerUtilities.prototype, '_getSigner').and.callFake(function (signMode: string) {
            capturedSignMode = signMode;
            const fakeSigner: any = {
                _initialize: jasmine.createSpy('_initialize'),
                _blockUpdate: jasmine.createSpy('_blockUpdate'),
                _generateSignature: () => new Uint8Array([1, 2, 3])
            };
            return fakeSigner;
        });

        const pk = new _PdfSignaturePrivateKey('sha512');
        const bytes = new Uint8Array([10, 20, 30]);

        // Act
        const sig = pk._sign(bytes);

        // Assert
        expect(sig).toEqual(new Uint8Array([1, 2, 3]));
        expect(capturedSignMode).toBe('SHA512withRSA');
    });

    it('_sign returns null when signer creation throws', () => {
        // Arrange
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getAllowedDigests').and.returnValue('a');
        spyOn(_PdfMessageDigestAlgorithms.prototype, '_getDigest').and.returnValue('SHA1');
        spyOn(_PdfSignerUtilities.prototype, '_getSigner').and.throwError('no signer');

        const pk = new _PdfSignaturePrivateKey('sha1');

        // Act
        const sig = pk._sign(new Uint8Array([0]));

        // Assert
        expect(sig).toBeNull();
    });

});
