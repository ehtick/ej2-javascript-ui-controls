import { _PdfSignerUtilities } from '../src/pdf/core/security/digital-signature/signature/signature-utilities';

describe('_PdfSignerUtilities _getSigner', () => {

    it('returns signer for SHA1 variant', () => {
        // Arrange
        const util = new _PdfSignerUtilities();

        // Act
        const signer: any = util._getSigner('SHA1WITHRSA');

        // Assert
        expect(signer).toBeDefined();
        expect(typeof signer._initialize).toBe('function');
        expect(typeof signer._blockUpdate).toBe('function');
        expect(typeof signer._generateSignature).toBe('function');
    });

    it('is case-insensitive and returns SHA256 signer for lower-case input', () => {
        // Arrange
        const util = new _PdfSignerUtilities();

        // Act
        const signer: any = util._getSigner('sha256withrsa');

        // Assert
        expect(signer).toBeDefined();
        expect(typeof signer._generateSignature).toBe('function');
    });

    it('returns signer for RIPEMD160WITHRSA mapping', () => {
        // Arrange
        const util = new _PdfSignerUtilities();

        // Act
        const signer: any = util._getSigner('RIPEMD160WITHRSA');

        // Assert
        expect(signer).toBeDefined();
        expect(typeof signer._generateSignature).toBe('function');
    });

    it('throws when algorithm is not recognised', () => {
        // Arrange
        const util = new _PdfSignerUtilities();

        // Act / Assert
        expect(() => util._getSigner('NOT-A-REAL-ALGORITHM')).toThrowError(/not recognised/i);
    });

});
