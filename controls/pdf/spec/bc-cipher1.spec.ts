import { _AdvancedEncryptionBaseCipher } from "../src/pdf/core/security/encryptors/cipher";

/**
 * Internal runtime shape used only by this spec.
 * This avoids TS2339 errors for hidden/internal members.
 */
interface CipherInternalState {
    _mixC?: Uint8Array;
    _buffer: Uint8Array;
    _position: number;
    _keySize: number;
    _cyclesOfRepetition: number;
    _iv: Uint8Array;
    _key: Uint8Array;
    _bufferLength: number;
    _decrypt(input: Uint8Array, key: Uint8Array): Uint8Array;
    _encryptBlock(input: Uint8Array, key: Uint8Array): Uint8Array;
    _decryptBlockHelper(data: Uint8Array, finalize: boolean): Uint8Array;
    _decryptBlock(data: Uint8Array, finalize: boolean, iv?: Uint8Array): Uint8Array;
    _encrypt(data: Uint8Array, iv?: Uint8Array): Uint8Array;
}

/**
 * Minimal concrete implementation for testing the abstract base class.
 */
class TestAdvancedEncryptionBaseCipher extends _AdvancedEncryptionBaseCipher {
    public constructor() {
        super();
        const state: CipherInternalState = this as unknown as CipherInternalState;
        state._keySize = 16;
        state._cyclesOfRepetition = 2;
        state._key = new Uint8Array(32);
        state._iv = new Uint8Array(16);
        state._buffer = new Uint8Array(16);
        state._position = 0;
        state._bufferLength = 0;
    }

    public _expandKey(cipherKey: Uint8Array): Uint8Array {
        return cipherKey;
    }
}

describe('_AdvancedEncryptionBaseCipher coverage tests', (): void => {
    let cipher: TestAdvancedEncryptionBaseCipher;
    let state: CipherInternalState;

    beforeEach((): void => {
        cipher = new TestAdvancedEncryptionBaseCipher();
        state = cipher as unknown as CipherInternalState;

        // reset state explicitly for safety
        state._keySize = 16;
        state._cyclesOfRepetition = 2;
        state._key = new Uint8Array(32);
        state._iv = new Uint8Array(16);
        state._buffer = new Uint8Array(16);
        state._position = 0;
        state._bufferLength = 0;
    });

    describe('_decryptBlockHelper()', (): void => {
        it('should return empty Uint8Array when no full block is available', (): void => {
            const data: Uint8Array = new Uint8Array([10, 20, 30, 40, 50]);

            const result: Uint8Array = state._decryptBlockHelper(data, false);

            expect(result).toBeDefined();
            expect(result instanceof Uint8Array).toBeTruthy();
            expect(result.length).toBe(0);
            expect(state._bufferLength).toBe(5);
        });

        it('should remove valid PKCS#7 padding on finalize', (): void => {
            const decrypted: Uint8Array = new Uint8Array([
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12,
                4, 4, 4, 4
            ]);

            spyOn(state as any, '_decrypt').and.returnValue(decrypted);

            state._iv = new Uint8Array(16);
            const input: Uint8Array = new Uint8Array(16);

            const result: Uint8Array = state._decryptBlockHelper(input, true);

            expect(result).toBeDefined();
            expect(result.length).toBe(12);
            expect(Array.from(result)).toEqual([
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12
            ]);
        });

        it('should keep full block when finalize is true and padding length is greater than 16', (): void => {
            const decrypted: Uint8Array = new Uint8Array([
                0, 1, 2, 3,
                4, 5, 6, 7,
                8, 9, 10, 11,
                12, 13, 14, 17
            ]);

            spyOn(state as any, '_decrypt').and.returnValue(decrypted);

            state._iv = new Uint8Array(16);
            const input: Uint8Array = new Uint8Array(16);

            const result: Uint8Array = state._decryptBlockHelper(input, true);

            expect(result).toBeDefined();
            expect(result.length).toBe(16);
            expect(Array.from(result)).toEqual(Array.from(decrypted));
        });

        it('should not trim output when padding bytes are invalid during finalize', (): void => {
            const decrypted: Uint8Array = new Uint8Array([
                21, 22, 23, 24,
                25, 26, 27, 28,
                29, 30, 31, 32,
                33, 34, 1, 2
            ]);
            // last byte = 2, but byte[14] = 1, so padding check fails

            spyOn(state as any, '_decrypt').and.returnValue(decrypted);

            state._iv = new Uint8Array(16);
            const input: Uint8Array = new Uint8Array(16);

            const result: Uint8Array = state._decryptBlockHelper(input, true);

            expect(result).toBeDefined();
            expect(result.length).toBe(16);
            expect(Array.from(result)).toEqual(Array.from(decrypted));
        });
    });

    describe('_decryptBlock()', (): void => {
        it('should return empty Uint8Array and store partial IV bytes when iv is omitted and data is less than 16 bytes', (): void => {
            const data: Uint8Array = new Uint8Array([1, 2, 3, 4, 5, 6]);

            const result: Uint8Array = state._decryptBlock(data, true);

            expect(result).toBeDefined();
            expect(result instanceof Uint8Array).toBeTruthy();
            expect(result.length).toBe(0);
            expect(state._bufferLength).toBe(6);
            expect(state._buffer[0]).toBe(1);
            expect(state._buffer[1]).toBe(2);
            expect(state._buffer[2]).toBe(3);
            expect(state._buffer[3]).toBe(4);
            expect(state._buffer[4]).toBe(5);
            expect(state._buffer[5]).toBe(6);
        });

        it('should set iv directly when iv argument is provided and then delegate to helper', (): void => {
            const iv: Uint8Array = new Uint8Array(16);
            for (let i: number = 0; i < 16; i++) {
                iv[i] = i;
            }

            const helperSpy: jasmine.Spy = spyOn(state as any, '_decryptBlockHelper')
                .and.returnValue(new Uint8Array([99]));

            const data: Uint8Array = new Uint8Array([7, 8, 9]);

            const result: Uint8Array = state._decryptBlock(data, false, iv);

            expect(Array.from(state._iv)).toEqual(Array.from(iv));
            expect(helperSpy).toHaveBeenCalled();
            expect(Array.from(result)).toEqual([99]);
        });
    });

    describe('_encrypt()', (): void => {
        it('should create zero IV and return empty Uint8Array when no full block is available', (): void => {
            const encryptBlockSpy: jasmine.Spy = spyOn(state as any, '_encryptBlock')
                .and.callFake((_input: Uint8Array, _key: Uint8Array): Uint8Array => {
                    return new Uint8Array(16);
                });

            const data: Uint8Array = new Uint8Array([100, 101, 102]);

            const result: Uint8Array = state._encrypt(data);

            expect(result).toBeDefined();
            expect(result instanceof Uint8Array).toBeTruthy();
            expect(result.length).toBe(0);
            expect(state._bufferLength).toBe(3);
            expect(Array.from(state._iv)).toEqual(new Array(16).fill(0));
            expect(encryptBlockSpy).not.toHaveBeenCalled();
        });

        it('should use provided iv and encrypt one full block', (): void => {
            const iv: Uint8Array = new Uint8Array(16);
            const encryptedBlock: Uint8Array = new Uint8Array([
                200, 201, 202, 203,
                204, 205, 206, 207,
                208, 209, 210, 211,
                212, 213, 214, 215
            ]);

            spyOn(state as any, '_encryptBlock').and.returnValue(encryptedBlock);

            const data: Uint8Array = new Uint8Array(16);
            for (let i: number = 0; i < 16; i++) {
                data[i] = i + 1;
                iv[i] = i;
            }

            const result: Uint8Array = state._encrypt(data, iv);

            expect(result).toBeDefined();
            expect(result.length).toBe(16);
            expect(Array.from(result)).toEqual(Array.from(encryptedBlock));
            expect(Array.from(state._iv)).toEqual(Array.from(encryptedBlock));
        });
    });
});
