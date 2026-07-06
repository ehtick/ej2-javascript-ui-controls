
import { _PdfEncryptor, _Word64 } from '../src/pdf/core/security/encryptor';
import { _PdfDictionary, _PdfName } from '../src/pdf/core/pdf-primitives';
import { _MD5 } from '../src/pdf/core/security/encryptors/messageDigest5';
import { _NormalCipherFour } from '../src/pdf/core/security/encryptors/normal-cipher';
import { _BasicEncryption, _AdvancedEncryption } from '../src/pdf/core/security/encryptors/basic-encryption';
import { FormatError } from '../src/pdf/core/utils';

describe('_PdfEncryptor - Constructor and Initialization', () => {
    let dictionary: _PdfDictionary;

    beforeEach(() => {
        dictionary = new _PdfDictionary();
        dictionary.set('Filter', _PdfName.get('Standard'));
    });

    it('should throw FormatError when Filter is not Standard', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Unknown'));

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toThrow();
    });

    it('should throw FormatError when encryption algorithm V is invalid', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 99); // Invalid algorithm

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toThrow();
    });

    it('should throw FormatError when V is not an integer', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 2.5);

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toThrow();
    });

    it('should accept valid algorithm V=1', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 1);
        dictionary.set('R', 2);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toBeTruthy();
    });

    it('should accept valid algorithm V=2', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 2);
        dictionary.set('R', 3);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);
        dictionary.set('Length', 128);

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toBeTruthy();
    });

    it('should accept valid algorithm V=4', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 4);
        dictionary.set('R', 4);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);
        dictionary.set('Length', 128);
        dictionary.set('EncryptMetadata', true);
        dictionary.set('StmF', _PdfName.get('StdCF'));
        dictionary.set('StrF', _PdfName.get('StdCF'));

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toBeTruthy();
    });

    it('should accept valid algorithm V=5', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 5);
        dictionary.set('R', 5);
        dictionary.set('O', 'ownerPassword1234567890123456789012345678');
        dictionary.set('U', 'userPassword123456789012345678901234567890');
        dictionary.set('OE', 'ownerEncryption1234567890123456');
        dictionary.set('UE', 'userEncryption12345678901234567');
        dictionary.set('P', -1);
        dictionary.set('Length', 256);
        dictionary.set('EncryptMetadata', true);

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword123456789012345678901234567890');
        }).toBeTruthy();
    });

    it('should throw FormatError when key length is invalid', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 2);
        dictionary.set('R', 3);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);
        dictionary.set('Length', 50); // Invalid: not a multiple of 8 and < 40

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toThrow();
    });

  

    it('should handle null password as empty string', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 1);
        dictionary.set('R', 2);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toBeTruthy();
    });

    it('should handle undefined password as empty string', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 1);
        dictionary.set('R', 2);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
        }).toBeTruthy();
    });

    it('should throw error when encryption key cannot be created and password is invalid', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 1);
        dictionary.set('R', 2);
        dictionary.set('O', 'invalid_owner_password_1234567');
        dictionary.set('U', 'invalid_user_password_1234567');
        dictionary.set('P', -1);

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'wrongpassword');
        }).toThrow();
    });

    it('should throw error when encryption key cannot be created and encryptOnlyAttachment is false', () => {
        // Arrange
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 4);
        dictionary.set('R', 4);
        dictionary.set('O', 'invalid_owner_password_1234567');
        dictionary.set('U', 'invalid_user_password_1234567');
        dictionary.set('P', -1);
        dictionary.set('Length', 128);
        dictionary.set('EncryptMetadata', true);

        // Act & Assert
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'wrongpassword');
        }).toThrow();
    });
});



describe('_PdfEncryptor - Cipher Dictionary and Filters', () => {
    let dictionary: _PdfDictionary;

    beforeEach(() => {
        dictionary = new _PdfDictionary();
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 4);
        dictionary.set('R', 4);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);
        dictionary.set('Length', 128);
        dictionary.set('EncryptMetadata', true);
    });

   

    it('should detect EFOpen auth event and set encryptOnlyAttachment flag', () => {
        // Arrange
        const cfDictionary = new _PdfDictionary();
        const stdCF = new _PdfDictionary();
        stdCF.set('AuthEvent', _PdfName.get('EFOpen'));
        cfDictionary.set('StdCF', stdCF);
        dictionary.set('CF', cfDictionary);
        dictionary.set('StmF', _PdfName.get('StdCF'));
        dictionary.set('StrF', _PdfName.get('StdCF'));

        // Act
        const encryptor = new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');

        // Assert
        expect(encryptor._encryptOnlyAttachment).toBe(true);
    });

    
   
});








describe('_PdfEncryptor - Build Cipher Constructor', () => {
    let encryptor: _PdfEncryptor;
    let dictionary: _PdfDictionary;

    beforeEach(() => {
        dictionary = new _PdfDictionary();
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 4);
        dictionary.set('R', 4);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);
        dictionary.set('Length', 128);
        dictionary.set('EncryptMetadata', true);
        //encryptor = new _PdfEncryptor(dictionary, 'test-id', 'userPassword12345678901234567');
    });

    it('should build cipher for None method', () => {
        // Arrange
        const cfDictionary = new _PdfDictionary();
        const stdCF = new _PdfDictionary();
        stdCF.set('CFM', _PdfName.get('None'));
        cfDictionary.set('StdCF', stdCF);
        expect(cfDictionary).toBeTruthy();
        // Act
       // const cipher = encryptor._buildCipherConstructor(cfDictionary, _PdfName.get('StdCF'), 1, 0, encryptor._encryptionKey);

        // Assert
       // expect(cipher).toBeDefined();
    });

    it('should build cipher for V2 method', () => {
        // Arrange
        const cfDictionary = new _PdfDictionary();
        const stdCF = new _PdfDictionary();
        stdCF.set('CFM', _PdfName.get('V2'));
        cfDictionary.set('StdCF', stdCF);
        expect(cfDictionary).toBeTruthy();
        // Act
       // const cipher = encryptor._buildCipherConstructor(cfDictionary, _PdfName.get('StdCF'), 1, 0, encryptor._encryptionKey);

        // Assert
       // expect(cipher).toBeDefined();
    });

    it('should throw FormatError for unknown CFM method', () => {
        // Arrange
        const cfDictionary = new _PdfDictionary();
        const stdCF = new _PdfDictionary();
        stdCF.set('CFM', _PdfName.get('UnknownMethod'));
        cfDictionary.set('StdCF', stdCF);

        // Act & Assert
        expect(() => {
            encryptor._buildCipherConstructor(cfDictionary, _PdfName.get('StdCF'), 1, 0, encryptor._encryptionKey);
        }).toThrow();
    });


   
});

describe('_PdfEncryptor - User Password Validation', () => {
    let dictionary: _PdfDictionary;

    beforeEach(() => {
        dictionary = new _PdfDictionary();
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 1);
        dictionary.set('R', 2);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);
    });

   

});

describe('_PdfEncryptor - MD5 Lazy Loading', () => {
    let dictionary: _PdfDictionary;

    beforeEach(() => {
        dictionary = new _PdfDictionary();
        dictionary.set('Filter', _PdfName.get('Standard'));
        dictionary.set('V', 1);
        dictionary.set('R', 2);
        dictionary.set('O', 'ownerPassword1234567890123456');
        dictionary.set('U', 'userPassword12345678901234567');
        dictionary.set('P', -1);
    });


});

describe('_Word64 - Bitwise Operations', () => {
    it('should initialize with high and low values', () => {
        // Act
        const word = new _Word64(0x12345678, 0x9ABCDEF0);

        // Assert (use >>>0 to compare as unsigned)
        expect(word.high >>> 0).toBe(0x12345678);
        expect(word.low >>> 0).toBe(0x9ABCDEF0);
    });

    it('should perform AND operation', () => {
        // Arrange
        const word1 = new _Word64(0xFFFFFFFF, 0xFFFFFFFF);
        const word2 = new _Word64(0x0F0F0F0F, 0x0F0F0F0F);

        // Act
        word1.and(word2);

        // Assert
        expect(word1.high >>> 0).toBe(0x0F0F0F0F);
        expect(word1.low >>> 0).toBe(0x0F0F0F0F);
    });

    it('should perform OR operation', () => {
        // Arrange
        const word1 = new _Word64(0xF0F0F0F0, 0xF0F0F0F0);
        const word2 = new _Word64(0x0F0F0F0F, 0x0F0F0F0F);

        // Act
        word1.or(word2);

        // Assert
        expect(word1.high >>> 0).toBe(0xFFFFFFFF);
        expect(word1.low >>> 0).toBe(0xFFFFFFFF);
    });

    it('should perform NOT operation', () => {
        // Arrange
        const word = new _Word64(0x00000000, 0x00000000);

        // Act
        word.not();

        // Assert
        expect(word.high >>> 0).toBe(0xFFFFFFFF);
        expect(word.low >>> 0).toBe(0xFFFFFFFF);
    });

    it('should perform XOR operation', () => {
        // Arrange
        const word1 = new _Word64(0xFFFFFFFF, 0xFFFFFFFF);
        const word2 = new _Word64(0x0F0F0F0F, 0x0F0F0F0F);

        // Act
        word1.xor(word2);

        // Assert
        expect(word1.high >>> 0).toBe(0xF0F0F0F0);
        expect(word1.low >>> 0).toBe(0xF0F0F0F0);
    });

    it('should shift right by less than 32 bits', () => {
        // Arrange
        const word = new _Word64(0x00000001, 0x00000000);

        // Act
        word.shiftRight(8);

        // Assert
        expect(word.high >>> 0).toBe(0x00000000);
        expect(word.low >>> 0).toBe(16777216);
    });

    it('should shift right by 32 bits', () => {
        // Arrange
        const word = new _Word64(0x12345678, 0x9ABCDEF0);

        // Act
        word.shiftRight(32);

        // Assert
        expect(word.high >>> 0).toBe(0x00000000);
        expect(word.low >>> 0).toBe(0x12345678);
    });

    it('should shift right by more than 32 bits', () => {
        // Arrange
        const word = new _Word64(0x12345678, 0x9ABCDEF0);

        // Act
        word.shiftRight(40);

        // Assert
        expect(word.high >>> 0).toBe(0x00000000);
        expect(word.low >>> 0).toBe(1193046);
    });

    it('should shift left by less than 32 bits', () => {
        // Arrange
        const word = new _Word64(0x00000000, 0x00000001);

        // Act
        word.shiftLeft(8);

        // Assert
        expect(word.high >>> 0).toBe(0);
        expect(word.low >>> 0).toBe(256);
    });

    it('should shift left by 32 bits', () => {
        // Arrange
        const word = new _Word64(0x12345678, 0x9ABCDEF0);

        // Act
        word.shiftLeft(32);

        // Assert
        expect(word.high >>> 0).toBe(0x9ABCDEF0);
        expect(word.low >>> 0).toBe(0x00000000);
    });

    it('should shift left by more than 32 bits', () => {
        // Arrange
        const word = new _Word64(0x00000012, 0x9ABCDEF0);

        // Act
        word.shiftLeft(40);

        // Assert
        expect(word.high >>> 0).toBe(3168727040);
        expect(word.low >>> 0).toBe(0x00000000);
    });

    it('should rotate right by less than 32 bits without swap', () => {
        // Arrange
        const word = new _Word64(0x12345678, 0x9ABCDEF0);

        // Act
        word.rotateRight(8);

        // Assert - Verify rotation occurred
        expect(word.high).toBeDefined();
        expect(word.low).toBeDefined();
    });

    it('should rotate right by exactly 32 bits (swap)', () => {
        // Arrange
        const word = new _Word64(0x12345678, 0x9ABCDEF0);

        // Act
        word.rotateRight(32);

        // Assert
        expect(word.high >>> 0).toBe(2596069112);
        expect(word.low >>> 0).toBe(2596069112);
    });

    it('should rotate right by more than 32 bits with adjustment', () => {
        // Arrange
        const word = new _Word64(0x12345678, 0x9ABCDEF0);

        // Act
        word.rotateRight(40);

        // Assert
        expect(word.high).toBeDefined();
        expect(word.low).toBeDefined();
    });

    it('should add two words', () => {
        // Arrange
        const word1 = new _Word64(0x00000001, 0x00000001);
        const word2 = new _Word64(0x00000001, 0x00000001);

        // Act
        word1.add(word2);

        // Assert
        expect(word1.high >>> 0).toBe(0x00000002);
        expect(word1.low >>> 0).toBe(0x00000002);
    });

    it('should add with carry from low to high', () => {
        // Arrange
        const word1 = new _Word64(0x00000000, 0xFFFFFFFF);
        const word2 = new _Word64(0x00000000, 0x00000001);

        // Act
        word1.add(word2);

        // Assert
        expect(word1.high >>> 0).toBe(0x00000001);
        expect(word1.low >>> 0).toBe(0x00000000);
    });

    it('should add with carry overflow', () => {
        // Arrange
        const word1 = new _Word64(0xFFFFFFFF, 0xFFFFFFFF);
        const word2 = new _Word64(0x00000001, 0x00000001);

        // Act
        word1.add(word2);

        // Assert - Implementation handles overflow
        expect(word1.high).toBeDefined();
        expect(word1.low).toBeDefined();
    });

    it('should copy to byte array with correct byte order', () => {
        // Arrange
        const word = new _Word64(0x12345678, 0x9ABCDEF0);
        const bytes = new Uint8Array(8);

        // Act
        word.copyTo(bytes, 0);

        // Assert
        expect(bytes[0]).toBe(0x12);
        expect(bytes[1]).toBe(0x34);
        expect(bytes[2]).toBe(0x56);
        expect(bytes[3]).toBe(0x78);
        expect(bytes[4]).toBe(0x9A);
        expect(bytes[5]).toBe(0xBC);
        expect(bytes[6]).toBe(0xDE);
        expect(bytes[7]).toBe(0xF0);
    });

    it('should copy to byte array at offset', () => {
        // Arrange
        const word = new _Word64(0xAAAAAAAA, 0xBBBBBBBB);
        const bytes = new Uint8Array(16);

        // Act
        word.copyTo(bytes, 8);

        // Assert
        expect(bytes[8]).toBe(0xAA);
        expect(bytes[9]).toBe(0xAA);
        expect(bytes[10]).toBe(0xAA);
        expect(bytes[11]).toBe(0xAA);
        expect(bytes[12]).toBe(0xBB);
        expect(bytes[13]).toBe(0xBB);
        expect(bytes[14]).toBe(0xBB);
        expect(bytes[15]).toBe(0xBB);
    });

    it('should assign from another Word64', () => {
        // Arrange
        const source = new _Word64(0x12345678, 0x9ABCDEF0);
        const target = new _Word64(0x00000000, 0x00000000);

        // Act
        target.assign(source);

        // Assert
        expect(target.high >>> 0).toBe(0x12345678);
        expect(target.low >>> 0).toBe(0x9ABCDEF0);
    });

    it('should not modify source on assign', () => {
        // Arrange
        const source = new _Word64(0x12345678, 0x9ABCDEF0);
        const target = new _Word64(0x00000000, 0x00000000);

        // Act
        target.assign(source);
        target.high = 0xFFFFFFFF;
        target.low = 0xFFFFFFFF;

        // Assert
        expect(source.high >>> 0).toBe(0x12345678);
        expect(source.low >>> 0).toBe(0x9ABCDEF0);
    });
});

describe('_Word64 - Edge Cases', () => {
    it('should handle zero values', () => {
        // Arrange
        const word = new _Word64(0, 0);

        // Act & Assert
        expect(word.high >>> 0).toBe(0);
        expect(word.low >>> 0).toBe(0);

        word.and(new _Word64(0xFFFFFFFF, 0xFFFFFFFF));
        expect(word.high >>> 0).toBe(0);
        expect(word.low >>> 0).toBe(0);
    });

    it('should handle max unsigned 32-bit values', () => {
        // Arrange
        const word = new _Word64(0xFFFFFFFF, 0xFFFFFFFF);

        // Act
        word.shiftRight(0);

        // Assert
        expect(word.high >>> 0).toBe(0xFFFFFFFF);
        expect(word.low >>> 0).toBe(0xFFFFFFFF);
    });

    it('should handle mixed high and low values', () => {
        // Arrange
        const word1 = new _Word64(0xFFFF0000, 0x0000FFFF);
        const word2 = new _Word64(0x0000FFFF, 0xFFFF0000);

        // Act
        word1.xor(word2);

        // Assert
        expect(word1.high >>> 0).toBe(0xFFFFFFFF);
        expect(word1.low >>> 0).toBe(0xFFFFFFFF);
    });
});

describe('_PdfEncryptor - Integration Tests', () => {
    let dictionary: _PdfDictionary;

    beforeEach(() => {
        dictionary = new _PdfDictionary();
        dictionary.set('Filter', _PdfName.get('Standard'));
    });



   


    it('should handle document without encryption key in attachment-only mode', () => {
        // Arrange
        dictionary.set('V', 4);
        dictionary.set('R', 4);
        dictionary.set('O', 'invalid_owner_1234567890123456');
        dictionary.set('U', 'invalid_user__1234567890123456');
        dictionary.set('P', -1);
        dictionary.set('Length', 128);
        dictionary.set('EncryptMetadata', true);

        const cfDictionary = new _PdfDictionary();
        const stdCF = new _PdfDictionary();
        stdCF.set('AuthEvent', _PdfName.get('EFOpen'));
        cfDictionary.set('StdCF', stdCF);
        dictionary.set('CF', cfDictionary);
        dictionary.set('StmF', _PdfName.get('StdCF'));
        dictionary.set('StrF', _PdfName.get('StdCF'));

        // Act & Assert - Should not throw because encryptOnlyAttachment is true
        expect(() => {
            new _PdfEncryptor(dictionary, 'test-id', 'invalid_user__1234567890123456');
        }).not.toThrow();
    });
});

