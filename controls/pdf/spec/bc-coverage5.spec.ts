import { _PdfCatalog } from "../src/pdf/core/pdf-catalog";
import { PdfDocument } from "../src/pdf/core/pdf-document";
import { PdfFileStructure } from "../src/pdf/core/pdf-file-structure";
import { _PdfPublicKeyCryptographyCertificate } from "../src/pdf/core/security/digital-signature/pdf-cryptography-certificate";
import { _PdfX509CertificateParser } from "../src/pdf/core/security/digital-signature/x509/x509-certificate-parser";
import { _AdvancedEncryption256Cipher } from "../src/pdf/core/security/encryptors/advance-cipher";
describe('_AdvancedEncryption256Cipher', () => {
    it('should expand a 256-bit key into a 240-byte key schedule', () => {
        // Arrange
        const cipherKey: Uint8Array = new Uint8Array(32).fill(1);

        // Act
        const cipher: _AdvancedEncryption256Cipher = new _AdvancedEncryption256Cipher(cipherKey);
        const output: Uint8Array = cipher._expandKey(cipherKey);

        // Assert
        expect(output).toBeDefined();
        expect(output instanceof Uint8Array).toBe(true);
        expect(output.length).toBe(240);
        expect(Array.from(output.slice(0, 32))).toEqual(Array.from(cipherKey));
    });

    it('should produce the same expanded key for the same input key', () => {
        // Arrange
        const cipherKey: Uint8Array = new Uint8Array(32).fill(7);

        // Act
        const cipher: _AdvancedEncryption256Cipher = new _AdvancedEncryption256Cipher(cipherKey);
        const output1: Uint8Array = cipher._expandKey(cipherKey);
        const output2: Uint8Array = cipher._expandKey(cipherKey);

        // Assert
        expect(Array.from(output1)).toEqual(Array.from(output2));
    });

    it('should produce a different expanded key for a different input key', () => {
        // Arrange
        const cipherKey1: Uint8Array = new Uint8Array(32).fill(1);
        const cipherKey2: Uint8Array = new Uint8Array(32).fill(2);

        // Act
        const cipher1: _AdvancedEncryption256Cipher = new _AdvancedEncryption256Cipher(cipherKey1);
        const cipher2: _AdvancedEncryption256Cipher = new _AdvancedEncryption256Cipher(cipherKey2);
        const output1: Uint8Array = cipher1._expandKey(cipherKey1);
        const output2: Uint8Array = cipher2._expandKey(cipherKey2);

        // Assert
        expect(Array.from(output1)).not.toEqual(Array.from(output2));
    });
});

describe('PdfDocument internal coverage', () => {

    it('should update version from catalog in _parse', () => {
        // Arrange
        const document: any = new PdfDocument();
        document._version = '';

        const parseSpy: jasmine.Spy = spyOn(document._crossReference, '_parse').and.stub();
        const versionSpy: jasmine.Spy = spyOnProperty(_PdfCatalog.prototype, 'version', 'get').and.returnValue('2.0');

        // Act
        document._parse(true);

        // Assert
        expect(parseSpy).toHaveBeenCalledWith(true);
        expect(versionSpy).toHaveBeenCalled();
        expect(document._version).toBe('2.0');
    });

});



describe('PdfDocument _checkHeader coverage', () => {
    let document: any;

    beforeEach(() => {
        document = new PdfDocument();
        document._version = '';
        document._fileStructure = new PdfFileStructure();
        document._fileStructure.isIncrementalUpdate = true;
    });

    it('should parse the header without declaration exception', () => {
        // Arrange
        const header: string = '%PDF-1.3 ';
        const bytes: number[] = header.split('').map((ch: string) => ch.charCodeAt(0));
        let index: number = 0;

        document._stream = {
            reset: jasmine.createSpy('reset'),
            moveStart: jasmine.createSpy('moveStart'),
            getByte: jasmine.createSpy('getByte').and.callFake((): number => bytes[index++])
        };

        spyOn(document, '_find').and.returnValue(true);

        // Act
        document._checkHeader();

        // Assert
        expect(document._stream.reset).toHaveBeenCalled();
        expect(document._stream.moveStart).toHaveBeenCalled();
        expect(document._version).toBe('1.3');
    });
});
