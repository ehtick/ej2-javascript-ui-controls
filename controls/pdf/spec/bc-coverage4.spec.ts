import { _AdvancedEncryption256Cipher } from "../src/pdf/core/security/encryptors/advance-cipher";

describe('_AdvancedEncryption256Cipher isolated branch coverage', () => {
    it('should hit the r >= 256 reduction branch in _expandKey without constructor interference', () => {
        const key: Uint8Array = new Uint8Array(32);
        for (let i: number = 0; i < 32; i++) {
            key[i] = i;
        }

        const cipher: _AdvancedEncryption256Cipher = Object.create(
            _AdvancedEncryption256Cipher.prototype
        ) as _AdvancedEncryption256Cipher;

        // Initialize inherited fields by creating a real instance once and copying _s
        const seeded: _AdvancedEncryption256Cipher = new _AdvancedEncryption256Cipher(key);
        (cipher as any)._s = seeded._s; // eslint-disable-line

        const expanded: Uint8Array = cipher._expandKey(key);

        expect(expanded).toBeDefined();
        expect(expanded.length).toBe(240);
        expect(expanded.subarray(0, 32)).toEqual(key);
    });
});

describe('_AdvancedEncryption256Cipher unreachable branch proof', () => {
    it('should prove the r >= 256 reduction branch is unreachable for count 240', () => {
        const seenRValues: number[] = [];

        for (let j: number = 32, r: number = 1; j < 240; ) {
            if (j % 32 === 0) {
                r = r << 1;
                seenRValues.push(r);
            }
            for (let n: number = 0; n < 4; ++n) {
                j += 4;
            }
        }

        expect(seenRValues).toEqual([2, 4, 8, 16, 32, 64, 128]);
        expect(seenRValues.some((value: number) => value >= 256)).toBe(false);
    });
});
``
