import { _BasicEncryption, _AdvancedEncryption } from "../src/pdf/core/security/encryptors/basic-encryption";
import { _AdvancedEncryption256Cipher } from "../src/pdf/core/security/encryptors/advance-cipher";
import { _CipherTransform, _DataEncryptionStandardCipher } from "../src/pdf/core/security/encryptors/cipher-tranform";
import { _AdvancedEncryptionBaseCipher } from "../src/pdf/core/security/encryptors/cipher";
import { _stringToBytes, _bytesToString } from "../src/pdf/core/utils";
import { _NormalCipherFour, _NullCipher, _CipherTwo } from "../src/pdf/core/security/encryptors/normal-cipher";

describe('_BasicEncryptionx behavior', () => {

    it('_checkOwnerPassword returns true when hash matches expected ownerPassword', () => {
        // Arrange
        const fakeSha: any = {
            lastInput: null as Uint8Array | null,
            _hash: function (input: Uint8Array, offset: number, len: number) {
                this.lastInput = input.slice(offset, offset + len);
                return new Uint8Array([1, 2, 3, 4]);
            }
        };
        const ctx: any = { _sha256: fakeSha };
        const password = new Uint8Array([10, 20]);
        const ownerValidationSalt = new Uint8Array([30, 40, 50]);
        const userBytes = new Uint8Array([60, 70, 80]);
        const expectedOwnerPassword = new Uint8Array([1, 2, 3, 4]);

        // Act
        const result = (_BasicEncryption as any).prototype._checkOwnerPassword.call(ctx,
            password, ownerValidationSalt, userBytes, expectedOwnerPassword);

        // Assert
        expect(result).toBeTruthy();
        expect(fakeSha.lastInput).not.toBeNull();
        expect((fakeSha.lastInput as Uint8Array).length).toBe(password.length + 56);
        // check password placed at start
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(0, password.length))).toEqual(Array.from(password));
        // check ownerValidationSalt placed after password
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(password.length, password.length + ownerValidationSalt.length))).toEqual(Array.from(ownerValidationSalt));
        // check userBytes placed at the expected offset
        const userOffset = password.length + ownerValidationSalt.length;
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(userOffset, userOffset + userBytes.length))).toEqual(Array.from(userBytes));
    });

    it('_checkOwnerPassword returns false when hash does not match ownerPassword', () => {
        // Arrange
        const fakeSha: any = {
            lastInput: null as Uint8Array | null,
            _hash: function (input: Uint8Array, offset: number, len: number) {
                this.lastInput = input.slice(offset, offset + len);
                return new Uint8Array([9, 9, 9]);
            }
        };
        const ctx: any = { _sha256: fakeSha };
        const password = new Uint8Array([]);
        const ownerValidationSalt = new Uint8Array([1]);
        const userBytes = new Uint8Array([]);
        const expectedOwnerPassword = new Uint8Array([0]);

        // Act
        const result = (_BasicEncryption as any).prototype._checkOwnerPassword.call(ctx,
            password, ownerValidationSalt, userBytes, expectedOwnerPassword);

        // Assert
        expect(result).toBeFalsy();
        expect(fakeSha.lastInput).not.toBeNull();
        expect((fakeSha.lastInput as Uint8Array).length).toBe(password.length + 56);
    });

    it('_checkUserPassword returns true when hash matches expected userPassword', () => {
        // Arrange
        const fakeSha: any = {
            lastInput: null as Uint8Array | null,
            _hash: function (input: Uint8Array, offset: number, len: number) {
                this.lastInput = input.slice(offset, offset + len);
                return new Uint8Array([5, 6, 7, 8]);
            }
        };
        const ctx: any = { _sha256: fakeSha };
        const password = new Uint8Array([1]);
        const userValidationSalt = new Uint8Array([2, 3, 4, 5]);
        const expectedUserPassword = new Uint8Array([5, 6, 7, 8]);

        // Act
        const result = (_BasicEncryption as any).prototype._checkUserPassword.call(ctx,
            password, userValidationSalt, expectedUserPassword);

        // Assert
        expect(result).toBeTruthy();
        expect(fakeSha.lastInput).not.toBeNull();
        expect((fakeSha.lastInput as Uint8Array).length).toBe(password.length + 8);
        // password at start
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(0, password.length))).toEqual(Array.from(password));
        // salt immediately after password
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(password.length, password.length + userValidationSalt.length))).toEqual(Array.from(userValidationSalt));
    });

    it('_checkUserPassword returns false when hash does not match userPassword', () => {
        // Arrange
        const fakeSha: any = {
            lastInput: null as Uint8Array | null,
            _hash: function (input: Uint8Array, offset: number, len: number) {
                this.lastInput = input.slice(offset, offset + len);
                return new Uint8Array([0, 0, 0]);
            }
        };
        const ctx: any = { _sha256: fakeSha };
        const password = new Uint8Array([7, 8]);
        const userValidationSalt = new Uint8Array([]);
        const expectedUserPassword = new Uint8Array([1]);

        // Act
        const result = (_BasicEncryption as any).prototype._checkUserPassword.call(ctx,
            password, userValidationSalt, expectedUserPassword);

        // Assert
        expect(result).toBeFalsy();
        expect(fakeSha.lastInput).not.toBeNull();
        expect((fakeSha.lastInput as Uint8Array).length).toBe(password.length + 8);
    });

    it('_getOwnerKey calls _hash and uses AdvancedEncryption256Cipher to decrypt ownerEncryption', () => {
        // Arrange
        const fakeHashHost: any = {
            lastArgs: null as any,
            _hash: function (password: Uint8Array, input: Uint8Array, userBytes: Uint8Array) {
                this.lastArgs = { password, input, userBytes };
                return new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]);
            }
        };
        const ctx: any = { _hash: fakeHashHost._hash.bind(fakeHashHost) };
        const password = new Uint8Array([1, 2]);
        const ownerKeySalt = new Uint8Array([3, 4, 5]);
        const userBytes = new Uint8Array([6, 7, 8]);
        const ownerEncryption = new Uint8Array([100, 101, 102]);

        const fakeDecrypted = new Uint8Array([200, 201]);
        const originalDecrypt = (_AdvancedEncryption256Cipher as any).prototype._decryptBlock;
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = function (enc: Uint8Array, flag: boolean, iv: Uint8Array) {
            (_AdvancedEncryption256Cipher as any).prototype._calledWith = { enc, flag, iv };
            return fakeDecrypted;
        };

        // Act
        const result = (_AdvancedEncryption as any).prototype._getOwnerKey.call(ctx,
            password, ownerKeySalt, userBytes, ownerEncryption);

        // Assert
        expect(result).toEqual(fakeDecrypted);
        expect(fakeHashHost.lastArgs).not.toBeNull();
        expect((fakeHashHost.lastArgs.input as Uint8Array).length).toBe(password.length + 56);
        // password at start
        expect(Array.from((fakeHashHost.lastArgs.input as Uint8Array).slice(0, password.length))).toEqual(Array.from(password));
        // ownerKeySalt placed after password
        expect(Array.from((fakeHashHost.lastArgs.input as Uint8Array).slice(password.length, password.length + ownerKeySalt.length))).toEqual(Array.from(ownerKeySalt));
        // userBytes placed at expected offset
        const userOffset = password.length + ownerKeySalt.length;
        expect(Array.from((fakeHashHost.lastArgs.input as Uint8Array).slice(userOffset, userOffset + userBytes.length))).toEqual(Array.from(userBytes));

        // verify decrypt called with ownerEncryption and iv length 16
        const called = (new _AdvancedEncryption256Cipher(new Uint8Array(32)) as any)._calledWith || ({} as any);
        // since we stored _calledWith on the prototype instance, check via the function we set earlier
        const protoCalled = (_AdvancedEncryption256Cipher as any).prototype._calledWith || ({} as any);
        expect(Array.from(protoCalled.enc || [])).toEqual(Array.from(ownerEncryption));
        expect(protoCalled.flag).toBeFalsy();
        expect((protoCalled.iv as Uint8Array).length).toBe(16);

        // Cleanup
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = originalDecrypt;
    });

    it('_getUserKey - derives user key and calls decryptBlock with correct iv and args', () => {
        // Arrange
        const fakeSha: any = {
            lastInput: null as Uint8Array | null,
            _hash: function (input: Uint8Array, offset: number, len: number) {
                this.lastInput = input.slice(offset, offset + len);
                return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
            }
        };
        const ctx: any = { _sha256: fakeSha };
        const password = new Uint8Array([9, 9]);
        const userKeySalt = new Uint8Array([8, 7, 6]);
        const userEncryption = new Uint8Array([200, 201]);

        const fakeDecrypted = new Uint8Array([42, 43]);
        const originalDecrypt = (_AdvancedEncryption256Cipher as any).prototype._decryptBlock;
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = function (enc: Uint8Array, flag: boolean, iv: Uint8Array) {
            (_AdvancedEncryption256Cipher as any).prototype._calledWith = { enc, flag, iv };
            return fakeDecrypted;
        };

        // Act
        const result = (_BasicEncryption as any).prototype._getUserKey.call(ctx, password, userKeySalt, userEncryption);

        // Assert
        expect(result).toEqual(fakeDecrypted);
        expect(fakeSha.lastInput).not.toBeNull();
        expect((fakeSha.lastInput as Uint8Array).length).toBe(password.length + 8);
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(0, password.length))).toEqual(Array.from(password));
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(password.length, password.length + userKeySalt.length))).toEqual(Array.from(userKeySalt));

        const protoCalled = (_AdvancedEncryption256Cipher as any).prototype._calledWith || ({} as any);
        expect(Array.from(protoCalled.enc || [])).toEqual(Array.from(userEncryption));
        expect(protoCalled.flag).toBeFalsy();
        expect((protoCalled.iv as Uint8Array).length).toBe(16);

        // Cleanup
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = originalDecrypt;
    });

    it('_getUserKey - handles empty password and salt correctly', () => {
        // Arrange
        const fakeSha: any = {
            lastInput: null as Uint8Array | null,
            _hash: function (input: Uint8Array, offset: number, len: number) {
                this.lastInput = input.slice(offset, offset + len);
                return new Uint8Array([9, 9, 9, 9, 9, 9, 9, 9]);
            }
        };
        const ctx: any = { _sha256: fakeSha };
        const password = new Uint8Array([]);
        const userKeySalt = new Uint8Array([]);
        const userEncryption = new Uint8Array([1]);

        const fakeDecrypted = new Uint8Array([7]);
        const originalDecrypt = (_AdvancedEncryption256Cipher as any).prototype._decryptBlock;
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = function () {
            return fakeDecrypted;
        };

        // Act
        const result = (_BasicEncryption as any).prototype._getUserKey.call(ctx, password, userKeySalt, userEncryption);

        // Assert
        expect(result).toEqual(fakeDecrypted);
        expect(fakeSha.lastInput).not.toBeNull();
        expect((fakeSha.lastInput as Uint8Array).length).toBe(password.length + 8);

        // Cleanup
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = originalDecrypt;
    });

    it('_getOwnerKey (Basic) calls sha256 and decrypts ownerEncryption correctly', () => {
        // Arrange
        const fakeSha: any = {
            lastInput: null as Uint8Array | null,
            _hash: function (input: Uint8Array, offset: number, len: number) {
                this.lastInput = input.slice(offset, offset + len);
                return new Uint8Array(32).fill(4);
            }
        };
        const ctx: any = { _sha256: fakeSha };
        const password = new Uint8Array([1, 2, 3]);
        const ownerKeySalt = new Uint8Array([9, 8]);
        const userBytes = new Uint8Array([7, 6, 5]);
        const ownerEncryption = new Uint8Array([11, 12]);

        const fakeDecrypted = new Uint8Array([99, 100]);
        const originalDecrypt = (_AdvancedEncryption256Cipher as any).prototype._decryptBlock;
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = function (enc: Uint8Array, flag: boolean, iv: Uint8Array) {
            (_AdvancedEncryption256Cipher as any).prototype._calledWith = { enc, flag, iv };
            return fakeDecrypted;
        };

        // Act
        const result = (_BasicEncryption as any).prototype._getOwnerKey.call(ctx, password, ownerKeySalt, userBytes, ownerEncryption);

        // Assert
        expect(result).toEqual(fakeDecrypted);
        expect(fakeSha.lastInput).not.toBeNull();
        expect((fakeSha.lastInput as Uint8Array).length).toBe(password.length + 56);
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(0, password.length))).toEqual(Array.from(password));
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(password.length, password.length + ownerKeySalt.length))).toEqual(Array.from(ownerKeySalt));
        const userOffset = password.length + ownerKeySalt.length;
        expect(Array.from((fakeSha.lastInput as Uint8Array).slice(userOffset, userOffset + userBytes.length))).toEqual(Array.from(userBytes));

        const protoCalled = (_AdvancedEncryption256Cipher as any).prototype._calledWith || ({} as any);
        expect(Array.from(protoCalled.enc || [])).toEqual(Array.from(ownerEncryption));
        expect(protoCalled.flag).toBeFalsy();
        expect((protoCalled.iv as Uint8Array).length).toBe(16);

        // Cleanup
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = originalDecrypt;
    });

    it('_getOwnerKey (Basic) handles empty salts and userBytes', () => {
        // Arrange
        const fakeSha: any = {
            lastInput: null as Uint8Array | null,
            _hash: function (input: Uint8Array, offset: number, len: number) {
                this.lastInput = input.slice(offset, offset + len);
                return new Uint8Array(24).fill(1);
            }
        };
        const ctx: any = { _sha256: fakeSha };
        const password = new Uint8Array([]);
        const ownerKeySalt = new Uint8Array([]);
        const userBytes = new Uint8Array([]);
        const ownerEncryption = new Uint8Array([5]);

        const fakeDecrypted = new Uint8Array([7]);
        const originalDecrypt = (_AdvancedEncryption256Cipher as any).prototype._decryptBlock;
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = function () {
            return fakeDecrypted;
        };

        // Act
        const result = (_BasicEncryption as any).prototype._getOwnerKey.call(ctx, password, ownerKeySalt, userBytes, ownerEncryption);

        // Assert
        expect(result).toEqual(fakeDecrypted);
        expect(fakeSha.lastInput).not.toBeNull();
        expect((fakeSha.lastInput as Uint8Array).length).toBe(password.length + 56);

        // Cleanup
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = originalDecrypt;
    });

    it('decryptString uses _stringCipher._decryptBlock and returns decoded string', () => {
        // Arrange
        const fakeStringCipher: any = {
            _decryptBlock: function (_input: Uint8Array, _finalize?: boolean) {
                return new Uint8Array([65, 66]); // 'AB'
            }
        };
        const ct: any = new _CipherTransform(fakeStringCipher, {} as any);

        // Act
        const out: string = ct.decryptString('ignored');

        // Assert
        expect(out).toBe('AB');
    });

    it('encryptString uses non-advanced cipher branch and returns encrypted bytes as string', () => {
        // Arrange
        const fakeStringCipher: any = {
            _encrypt: function (_input: Uint8Array) {
                return new Uint8Array([80, 81]); // 'PQ'
            }
        };
        const ct: any = new _CipherTransform(fakeStringCipher, {} as any);

        // Act
        const out: string = ct.encryptString('x');
        const outBytes = _stringToBytes(out) as Uint8Array;

        // Assert
        expect(Array.from(outBytes)).toEqual([80, 81]);
    });

    it('encryptString uses advanced cipher branch and prefixes iv to encrypted data', () => {
        // Arrange
        class FakeAdvanced extends _AdvancedEncryptionBaseCipher {
            constructor() {
                super();
                this._keySize = 16;
                this._cyclesOfRepetition = 1;
                this._key = new Uint8Array(48);
            }
            _expandKey(_k: Uint8Array): Uint8Array { return new Uint8Array(48); }
            _decryptBlock(data: Uint8Array, _finalize?: boolean, _iv?: Uint8Array): Uint8Array { return data; }
            _encrypt(data: Uint8Array, _iv?: Uint8Array): Uint8Array { return new Uint8Array([1, 2, 3, 4]); }
        }
        const fake = new FakeAdvanced();
        const ct: any = new _CipherTransform(fake, {} as any);

        // Act
        const out: string = ct.encryptString('abc');
        const outBytes = _stringToBytes(out, false, true) as Uint8Array;

        // Assert: buffer = iv (16) + encrypted data (we returned 4 bytes)
        expect(outBytes.length).toBe(16 + 4);
        expect(Array.from(outBytes.slice(16))).toEqual([1, 2, 3, 4]);
    });

    it('_DataEncryptionStandardCipher basic helpers and process block', () => {
        // Arrange
        const des = new _DataEncryptionStandardCipher(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
        const beBytes = new Uint8Array([0, 0, 0, 5]);
        const outBuf = new Uint8Array(4);

        // Act
        const val = des._beToUint32(beBytes, 0);
        des._uint32ToBe(0x01020304, outBuf, 0);
        const input = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const output = new Uint8Array(8);
        des._processBlock(input, 0, output, 0);

        // Assert
        expect(val).toBe(5);
        expect(Array.from(outBuf)).toEqual([1, 2, 3, 4]);
        expect(output.length).toBe(8);
    });

    it('_getOwnerKey handles empty salts and userBytes correctly', () => {
        // Arrange
        const fakeHashHost: any = {
            lastArgs: null as any,
            _hash: function (password: Uint8Array, input: Uint8Array, userBytes: Uint8Array) {
                this.lastArgs = { password, input, userBytes };
                return new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
            }
        };
        const ctx: any = { _hash: fakeHashHost._hash.bind(fakeHashHost) };
        const password = new Uint8Array([]);
        const ownerKeySalt = new Uint8Array([]);
        const userBytes = new Uint8Array([]);
        const ownerEncryption = new Uint8Array([9]);

        const fakeDecrypted = new Uint8Array([42]);
        const originalDecrypt = (_AdvancedEncryption256Cipher as any).prototype._decryptBlock;
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = function () {
            return fakeDecrypted;
        };

        // Act
        const result = (_AdvancedEncryption as any).prototype._getOwnerKey.call(ctx,
            password, ownerKeySalt, userBytes, ownerEncryption);

        // Assert
        expect(result).toEqual(fakeDecrypted);
        expect(fakeHashHost.lastArgs).not.toBeNull();
        expect((fakeHashHost.lastArgs.input as Uint8Array).length).toBe(password.length + 56);

        // Cleanup
        (_AdvancedEncryption256Cipher as any).prototype._decryptBlock = originalDecrypt;
    });

    it('_NormalCipherFour encrypt/decrypt roundtrip and state behavior', () => {
        // Arrange
        const key = new Uint8Array([1, 2, 3, 4]);
        const plain = new Uint8Array([10, 20, 30, 40]);
        const cipher1 = new _NormalCipherFour(key);
        const cipher2 = new _NormalCipherFour(key);

        // Act
        const encrypted = cipher1._encryptBlock(plain);
        const decrypted = cipher2._decryptBlock(encrypted);
        // call a second time on cipher1 to ensure state advances
        const encryptedSecond = cipher1._encryptBlock(plain);

        // Assert
        expect(Array.from(decrypted)).toEqual(Array.from(plain));
        expect(Array.from(encrypted)).not.toEqual(Array.from(plain));
        expect(Array.from(encrypted)).not.toEqual(Array.from(encryptedSecond));
    });

    it('_NullCipher returns input unchanged for encrypt and decrypt', () => {
        // Arrange
        const nc = new _NullCipher();
        const data = new Uint8Array([5, 6, 7]);

        // Act
        const enc = nc._encrypt(data);
        const dec = nc._decryptBlock(data);

        // Assert
        expect(Array.from(enc)).toEqual(Array.from(data));
        expect(Array.from(dec)).toEqual(Array.from(data));
    });

    it('_CipherTwo constructor validation, rotate helpers and block roundtrip', () => {
        // Arrange / Act / Assert - invalid length throws
        expect(() => new _CipherTwo(new Uint8Array(3))).toThrow();
        expect(() => new _CipherTwo(("notbytes" as unknown) as Uint8Array)).toThrow();

        // Arrange valid
        const validKey = new Uint8Array([1,2,3,4,5,6,7,8]);
        const cipher = new _CipherTwo(validKey);
        const block = new Uint8Array([1,2,3,4,5,6,7,8]);

        // Act
        const encBlock = cipher._encryptBlock(block);
        const decBlock = cipher._decryptBlock(encBlock);

        // Assert
        expect(decBlock.length).toBe(8);
        expect(Array.from(decBlock)).toEqual(Array.from(block));

        // rotate helpers
        expect(cipher._rotateLeft(0x1234, 4)).toBe(((0x1234 << 4) | (0x1234 >>> 12)) & 0xFFFF);
        expect(cipher._rotateRight(0x1234, 4)).toBe(((0x1234 >>> 4) | (0x1234 << 12)) & 0xFFFF);
    });

    it('_CipherTwo _encrypt produces padded output and _decrypt (CBC) recovers original when using CBC encryption', () => {
        // Arrange
        const key = new Uint8Array([9,9,9,9,9,9,9,9]);
        const cipher = new _CipherTwo(key);
        const plaintext = new Uint8Array([1,2,3]);
        const blockSize = 8;
        const iv = new Uint8Array(blockSize).fill(0);

        // Act - call _encrypt (ECB-like) and ensure padded length is multiple of blockSize
        const encryptedEcb = cipher._encrypt(plaintext);

        // Create CBC-style encrypted bytes manually to match _decrypt expectations
        // Pad plaintext first (same way _encrypt does)
        const padLength = blockSize - (plaintext.length % blockSize);
        const padded = new Uint8Array(plaintext.length + padLength);
        padded.set(plaintext);
        padded.fill(padLength, plaintext.length);

        // CBC encrypt manually
        let prev = iv;
        const cbcChunks: Uint8Array[] = [];
        for (let i = 0; i < padded.length; i += blockSize) {
            const block = padded.subarray(i, i + blockSize);
            const xored = new Uint8Array(blockSize);
            for (let j = 0; j < blockSize; j++) xored[j] = block[j] ^ prev[j];
            const ciph = cipher._encryptBlock(xored);
            cbcChunks.push(ciph);
            prev = ciph;
        }
        const cbcEncrypted = new Uint8Array(cbcChunks.reduce((s, a) => s + a.length, 0));
        let off = 0; for (const ch of cbcChunks) { cbcEncrypted.set(ch, off); off += ch.length; }

        // Act - decrypt CBC encrypted bytes
        const decrypted = cipher._decrypt(cbcEncrypted, iv);

        // Assert
        expect(encryptedEcb.length % blockSize).toBe(0);
        expect(Array.from(decrypted)).toEqual(Array.from(plaintext));
    });

});
