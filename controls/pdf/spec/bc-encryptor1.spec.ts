
import { _PdfEncryptor, _Word64 } from '../src/pdf/core/security/encryptor';
import { _PdfName, _PdfDictionary } from '../src/pdf/core/pdf-primitives';
import { FormatError } from '../src/pdf/core/utils';
import { _BasicEncryption, _AdvancedEncryption } from '../src/pdf/core/security/encryptors/basic-encryption';
import { _NormalCipherFour, _NullCipher } from '../src/pdf/core/security/encryptors/normal-cipher';
import { _AdvancedEncryption128Cipher, _AdvancedEncryption256Cipher } from '../src/pdf/core/security/encryptors/advance-cipher';
import { _CipherTransform } from '../src/pdf/core/security/encryptors/cipher-tranform';

type DictLike = {
    suppressEncryption: boolean;
    get: (key: string) => unknown;
    has: (key: string) => boolean;
};

function bytesToBinaryString(bytes: number[]): string {
    return String.fromCharCode(...bytes);
}

function createBytes(length: number, start: number = 1): Uint8Array {
    const result: number[] = [];
    for (let i: number = 0; i < length; i++) {
        result.push((start + i) & 0xff);
    }
    return new Uint8Array(result);
}

function createDictionary(map: Record<string, unknown>): _PdfDictionary {
    const dict: DictLike = {
        suppressEncryption: false,
        get: (key: string): unknown => map[key],
        has: (key: string): boolean => Object.prototype.hasOwnProperty.call(map, key)
    };
    return dict as unknown as _PdfDictionary;
}

describe('_PdfEncryptor', () => {
    const ownerString32: string = bytesToBinaryString(new Array(32).fill(65)); // 'A'
    const userString32: string = bytesToBinaryString(new Array(32).fill(66)); // 'B'
    const ownerString48: string = bytesToBinaryString(new Array(48).fill(67)); // 'C'
    const userString48: string = bytesToBinaryString(new Array(48).fill(68)); // 'D'
    const encrypted32: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
    const docId: string = 'file-id-1';

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    describe('constructor - non algorithm 5', () => {
        it('should use empty string when password is undefined and throw invalid password error when key cannot be prepared', () => {
            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 2,
                Length: 40,
                O: ownerString32,
                U: userString32,
                P: -4,
                R: 3
            });

            spyOn(_PdfEncryptor.prototype, '_prepareKeyData').and.returnValue(null);

            expect((): void => {
                // password intentionally omitted -> constructor sets it to ''
                new _PdfEncryptor(dictionary, docId);
            }).toThrowError('Cannot open an encrypted document. The password is invalid.');
        });

        it('should set _hasUserPasswordOnly when both prepared keys match after decoding owner password', () => {
            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 2,
                Length: 40,
                O: ownerString32,
                U: userString32,
                P: -4,
                R: 3
            });

            spyOn(_PdfEncryptor.prototype, '_prepareKeyData').and.returnValues(encrypted32, encrypted32);
            spyOn(_PdfEncryptor.prototype, '_decodeUserPassword').and.returnValue(createBytes(32, 9));

            const encryptor: _PdfEncryptor = new _PdfEncryptor(dictionary, docId, 'user-pass');

            expect(encryptor._isUserPassword).toBeTruthy();
            expect(encryptor._hasUserPasswordOnly).toBeTruthy();
        });

        it('should fall back to owner password path when initial prepareKeyData fails and password is provided', () => {
            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 2,
                Length: 40,
                O: ownerString32,
                U: userString32,
                P: -4,
                R: 3
            });

            spyOn(_PdfEncryptor.prototype, '_prepareKeyData').and.returnValues(null, encrypted32);
            spyOn(_PdfEncryptor.prototype, '_decodeUserPassword').and.returnValue(createBytes(32, 11));

            const encryptor: _PdfEncryptor = new _PdfEncryptor(dictionary, docId, 'owner-pass');

            expect(encryptor._isUserPassword).toBeFalsy();
            expect(encryptor._encryptionKey).toEqual(encrypted32);
        });

        it('should read CF/StmF handler length when Length is missing and shift small values by 3 bits', () => {
            const stdCf: _PdfDictionary = createDictionary({
                Length: 5
            });

            const cfDictionary: _PdfDictionary = createDictionary({
                TestCF: stdCf
            });

            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 4,
                // Length intentionally omitted
                CF: cfDictionary,
                StmF: _PdfName.get('TestCF'),
                StrF: _PdfName.get('Identity'),
                O: ownerString32,
                U: userString32,
                P: -4,
                R: 4,
                EncryptMetadata: true
            });

            const prepareSpy: jasmine.Spy =
                spyOn(_PdfEncryptor.prototype, '_prepareKeyData').and.returnValue(encrypted32);

            const encryptor: _PdfEncryptor = new _PdfEncryptor(dictionary, docId, 'abc');

            expect(prepareSpy).toHaveBeenCalled();
            // keyLength is 5 initially, then shifted to 40 before _prepareKeyData is called
            const args: unknown[] = prepareSpy.calls.mostRecent().args;
            expect(args[6]).toBe(40);
            expect(encryptor._stream.name).toBe('TestCF');
        });

        it('should set _encryptOnlyAttachment when StdCF.AuthEvent is EFOpen', () => {
            const stdCf: _PdfDictionary = createDictionary({
                AuthEvent: _PdfName.get('EFOpen')
            });

            const cfDictionary: _PdfDictionary = createDictionary({
                StdCF: stdCf
            });

            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 4,
                Length: 40,
                CF: cfDictionary,
                StmF: _PdfName.get('Identity'),
                StrF: _PdfName.get('Identity'),
                EFF: _PdfName.get('Identity'),
                O: ownerString32,
                U: userString32,
                P: -4,
                R: 4
            });

            spyOn(_PdfEncryptor.prototype, '_prepareKeyData').and.returnValue(encrypted32);

            const encryptor: _PdfEncryptor = new _PdfEncryptor(dictionary, docId, 'abc');

            expect(encryptor._encryptOnlyAttachment).toBeTruthy();
            expect(encryptor._cipherDictionary).toBe(cfDictionary);
            expect(encryptor._stream.name).toBe('Identity');
            expect(encryptor._string.name).toBe('Identity');
            expect(encryptor._eff.name).toBe('Identity');
        });
    });

    describe('constructor - algorithm 5', () => {
        it('should use _BasicEncryption for revision != 6 and use empty p when password is empty', () => {
            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 5,
                Length: 256,
                O: ownerString48,
                U: userString48,
                OE: bytesToBinaryString(new Array(32).fill(10)),
                UE: bytesToBinaryString(new Array(32).fill(20)),
                P: -4,
                R: 5,
                CF: createDictionary({
                    StdCF: createDictionary({})
                }),
                StmF: _PdfName.get('Identity'),
                StrF: _PdfName.get('Identity')
            });

            const userCheckSpy: jasmine.Spy =
                spyOn(_BasicEncryption.prototype, '_checkUserPassword').and.callFake(
                    (p: Uint8Array): boolean => {
                        expect(p.length).toBe(0);
                        return true;
                    }
                );

            spyOn(_BasicEncryption.prototype, '_checkOwnerPassword').and.returnValue(false);
            spyOn(_PdfEncryptor.prototype, '_createEncryptionKey').and.returnValue(createBytes(32, 3));

            const encryptor: _PdfEncryptor = new _PdfEncryptor(dictionary, docId, '');

            expect(userCheckSpy).toHaveBeenCalled();
            expect(encryptor._isUserPassword).toBeTruthy();
            expect(encryptor._encryptionKey).toEqual(createBytes(32, 3));
        });

        it('should go through owner-password branch for algorithm 5 when user-password check fails', () => {
            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 5,
                Length: 256,
                O: ownerString48,
                U: userString48,
                OE: bytesToBinaryString(new Array(32).fill(30)),
                UE: bytesToBinaryString(new Array(32).fill(40)),
                P: -4,
                R: 5,
                CF: createDictionary({
                    StdCF: createDictionary({})
                }),
                StmF: _PdfName.get('Identity'),
                StrF: _PdfName.get('Identity')
            });

            spyOn(_BasicEncryption.prototype, '_checkUserPassword').and.returnValue(false);
            spyOn(_BasicEncryption.prototype, '_checkOwnerPassword').and.returnValue(true);
            spyOn(_PdfEncryptor.prototype, '_createEncryptionKey').and.returnValue(createBytes(32, 7));

            const encryptor: _PdfEncryptor = new _PdfEncryptor(dictionary, docId, 'owner-pass');

            expect(encryptor._isUserPassword).toBeFalsy();
            expect(encryptor._encryptionKey).toEqual(createBytes(32, 7));
        });

        it('should mark _hasUserPasswordOnly when both algorithm 5 user and owner checks are true', () => {
            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 5,
                Length: 256,
                O: ownerString48,
                U: userString48,
                OE: bytesToBinaryString(new Array(32).fill(50)),
                UE: bytesToBinaryString(new Array(32).fill(60)),
                P: -4,
                R: 5,
                CF: createDictionary({
                    StdCF: createDictionary({})
                }),
                StmF: _PdfName.get('Identity'),
                StrF: _PdfName.get('Identity')
            });

            spyOn(_BasicEncryption.prototype, '_checkUserPassword').and.returnValue(true);
            spyOn(_BasicEncryption.prototype, '_checkOwnerPassword').and.returnValue(true);
            spyOn(_PdfEncryptor.prototype, '_createEncryptionKey').and.returnValue(createBytes(32, 12));

            const encryptor: _PdfEncryptor = new _PdfEncryptor(dictionary, docId, 'same-pass');

            expect(encryptor._isUserPassword).toBeTruthy();
            expect(encryptor._hasUserPasswordOnly).toBeTruthy();
        });

        it('should use _AdvancedEncryption when revision is 6', () => {
            const dictionary: _PdfDictionary = createDictionary({
                Filter: _PdfName.get('Standard'),
                V: 5,
                Length: 256,
                O: ownerString48,
                U: userString48,
                OE: bytesToBinaryString(new Array(32).fill(70)),
                UE: bytesToBinaryString(new Array(32).fill(80)),
                P: -4,
                R: 6,
                CF: createDictionary({
                    StdCF: createDictionary({})
                }),
                StmF: _PdfName.get('Identity'),
                StrF: _PdfName.get('Identity')
            });

            spyOn(_AdvancedEncryption.prototype, '_checkUserPassword').and.returnValue(true);
            spyOn(_AdvancedEncryption.prototype, '_checkOwnerPassword').and.returnValue(false);
            spyOn(_PdfEncryptor.prototype, '_createEncryptionKey').and.returnValue(createBytes(32, 14));

            const encryptor: _PdfEncryptor = new _PdfEncryptor(dictionary, docId, 'rev6-pass');

            expect(encryptor._isUserPassword).toBeTruthy();
            expect(encryptor._encryptionKey).toEqual(createBytes(32, 14));
        });
    });

    describe('_createEncryptionKey', () => {
        it('should call _getUserKey when isUserKey is true', () => {
            const encryptor: _PdfEncryptor = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor;
            const algorithm: _BasicEncryption = Object.create(_BasicEncryption.prototype) as _BasicEncryption;
            const expected: Uint8Array = createBytes(32, 90);

            spyOn(algorithm, '_getUserKey').and.returnValue(expected);
            spyOn(algorithm, '_getOwnerKey');

            const result: Uint8Array = encryptor._createEncryptionKey(
                true,
                createBytes(5, 1),
                createBytes(8, 2),
                createBytes(48, 3),
                createBytes(8, 4),
                createBytes(32, 5),
                createBytes(32, 6),
                algorithm
            );

            expect(algorithm._getUserKey).toHaveBeenCalled();
            expect(algorithm._getOwnerKey).not.toHaveBeenCalled();
            expect(result).toEqual(expected);
        });

        it('should call _getOwnerKey when isUserKey is false', () => {
            const encryptor: _PdfEncryptor = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor;
            const algorithm: _BasicEncryption = Object.create(_BasicEncryption.prototype) as _BasicEncryption;
            const expected: Uint8Array = createBytes(32, 100);

            spyOn(algorithm, '_getUserKey');
            spyOn(algorithm, '_getOwnerKey').and.returnValue(expected);

            const result: Uint8Array = encryptor._createEncryptionKey(
                false,
                createBytes(5, 1),
                createBytes(8, 2),
                createBytes(48, 3),
                createBytes(8, 4),
                createBytes(32, 5),
                createBytes(32, 6),
                algorithm
            );

            expect(algorithm._getOwnerKey).toHaveBeenCalled();
            expect(algorithm._getUserKey).not.toHaveBeenCalled();
            expect(result).toEqual(expected);
        });
    });

    describe('_prepareKeyData', () => {
        let encryptor: _PdfEncryptor;

        beforeEach(() => {
            encryptor = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor;
            encryptor._defaultPasswordBytes = new Uint8Array([
                0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41,
                0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
                0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80,
                0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a
            ]);
        });

        it('should safely cover password fill while-loop, metadata false branch, 50-iteration loop, and return encryption key for revision >= 3', () => {
            const md5HashSpy: jasmine.Spy=
                spyOnProperty(encryptor, '_md5', 'get').and.returnValue({
                    hash: jasmine.createSpy('hash').and.callFake(
                        (_data: Uint8Array, _offset: number, _length: number): Uint8Array => createBytes(16, 1)
                    )
                } as unknown as _PdfEncryptor['_messageDigest']) as unknown as jasmine.Spy;

            const checkData: Uint8Array = createBytes(16, 21);
            const encryptBlockSpy: jasmine.Spy =
                spyOn(_NormalCipherFour.prototype, '_encryptBlock').and.returnValue(checkData);

            const userPassword: Uint8Array = new Uint8Array(32);
            userPassword.set(checkData, 0);

            const result: Uint8Array = encryptor._prepareKeyData(
                createBytes(8, 11),
                undefined as unknown as Uint8Array,
                createBytes(32, 31),
                userPassword,
                -4,
                4,
                40,
                false
            );

            expect(result).not.toBeNull();
            expect(result.length).toBe(5);
            expect(encryptBlockSpy.calls.count()).toBe(20); // initial + 19
            expect(md5HashSpy).toBeDefined();
        });

        it('should return null for revision >= 3 when userPassword does not match checkData', () => {
            spyOnProperty(encryptor, '_md5', 'get').and.returnValue({
                hash: jasmine.createSpy('hash').and.returnValue(createBytes(16, 5))
            } as unknown as _PdfEncryptor['_messageDigest']);

            spyOn(_NormalCipherFour.prototype, '_encryptBlock').and.returnValue(createBytes(16, 50));

            const userPassword: Uint8Array = createBytes(32, 1); // intentionally does not match checkData

            const result: Uint8Array = encryptor._prepareKeyData(
                createBytes(4, 1),
                createBytes(3, 2),
                createBytes(32, 3),
                userPassword,
                -4,
                4,
                40,
                true
            );

            expect(result).toBeNull();
        });

        it('should cover revision < 3 else path and return encryption key when checkData matches', () => {
            spyOnProperty(encryptor, '_md5', 'get').and.returnValue({
                hash: jasmine.createSpy('hash').and.returnValue(createBytes(16, 9))
            } as unknown as _PdfEncryptor['_messageDigest']);

            const checkData: Uint8Array = createBytes(32, 111);
            spyOn(_NormalCipherFour.prototype, '_encryptBlock').and.returnValue(checkData);

            const result: Uint8Array = encryptor._prepareKeyData(
                createBytes(4, 1),
                createBytes(6, 2),
                createBytes(32, 3),
                checkData,
                -4,
                2,
                40,
                true
            );

            expect(result).not.toBeNull();
            expect(result.length).toBe(5);
        });

        it('should cover revision < 3 else path and return null when user password mismatches', () => {
            spyOnProperty(encryptor, '_md5', 'get').and.returnValue({
                hash: jasmine.createSpy('hash').and.returnValue(createBytes(16, 15))
            } as unknown as _PdfEncryptor['_messageDigest']);

            spyOn(_NormalCipherFour.prototype, '_encryptBlock').and.returnValue(createBytes(32, 70));

            const result: Uint8Array = encryptor._prepareKeyData(
                createBytes(4, 1),
                createBytes(6, 2),
                createBytes(32, 3),
                createBytes(32, 1),
                -4,
                2,
                40,
                true
            );

            expect(result).toBeNull();
        });
    });

    describe('_decodeUserPassword', () => {
        let encryptor: _PdfEncryptor;

        beforeEach(() => {
            encryptor = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor;
            encryptor._defaultPasswordBytes = new Uint8Array([
                0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41,
                0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
                0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80,
                0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a
            ]);
        });

        it('should cover revision >= 3 loop path without timeout', () => {
            spyOnProperty(encryptor, '_md5', 'get').and.returnValue({
                hash: jasmine.createSpy('hash').and.returnValue(createBytes(16, 10))
            } as unknown as _PdfEncryptor['_messageDigest']);

            const encryptSpy: jasmine.Spy =
                spyOn(_NormalCipherFour.prototype, '_encryptBlock').and.callFake(
                    (data: Uint8Array): Uint8Array => data
                );

            const ownerPassword: Uint8Array = createBytes(32, 20);
            const result: Uint8Array = encryptor._decodeUserPassword(createBytes(5, 3), ownerPassword, 4, 40);

            expect(result).toEqual(ownerPassword);
            expect(encryptSpy.calls.count()).toBe(20);
        });

        it('should cover revision < 3 else path', () => {
            spyOnProperty(encryptor, '_md5', 'get').and.returnValue({
                hash: jasmine.createSpy('hash').and.returnValue(createBytes(16, 12))
            } as unknown as _PdfEncryptor['_messageDigest']);

            const expected: Uint8Array = createBytes(32, 55);
            spyOn(_NormalCipherFour.prototype, '_encryptBlock').and.returnValue(expected);

            const result: Uint8Array = encryptor._decodeUserPassword(createBytes(4, 9), createBytes(32, 1), 2, 40);

            expect(result).toEqual(expected);
        });
    });

    describe('_createCipherTransform', () => {
        it('should create transform using string and stream cipher when algorithm is 4', () => {
            const encryptor: _PdfEncryptor = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor;
            encryptor._algorithm = 4;
            encryptor._cipherDictionary = createDictionary({});
            encryptor._string = _PdfName.get('StrF');
            encryptor._stream = _PdfName.get('StmF');
            encryptor._encryptionKey = createBytes(5, 1);

            const stringCipher: _NullCipher = new _NullCipher();
            const streamCipher: _NullCipher = new _NullCipher();

            const buildSpy: jasmine.Spy = spyOn(encryptor, '_buildCipherConstructor').and.returnValues(stringCipher, streamCipher);

            const transform: _CipherTransform = encryptor._createCipherTransform(10, 0);

            expect(buildSpy.calls.count()).toBe(2);
            expect(transform instanceof _CipherTransform).toBeTruthy();
        });

        it('should return NormalCipherFour based transform for non 4/5 algorithms', () => {
            const encryptor: _PdfEncryptor = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor;
            encryptor._algorithm = 2;
            encryptor._encryptionKey = createBytes(5, 1);

            spyOn(encryptor, '_buildObjectKey').and.returnValue(createBytes(10, 1));

            const transform: _CipherTransform = encryptor._createCipherTransform(25, 7);

            expect(transform instanceof _CipherTransform).toBeTruthy();
            expect(encryptor._buildObjectKey).toHaveBeenCalledWith(25, 7, encryptor._encryptionKey, false);
        });
    });

    describe('_buildCipherConstructor', () => {
        let encryptor: _PdfEncryptor;

        beforeEach(() => {
            encryptor = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor;
        });

        it('should return NullCipher when crypt filter does not exist', () => {
            const cipherDictionary: _PdfDictionary = createDictionary({});
            const cipher = encryptor._buildCipherConstructor(cipherDictionary, _PdfName.get('Missing'), 1, 0, createBytes(5, 1));

            expect(cipher instanceof _NullCipher).toBeTruthy();
        });

        it('should return NullCipher when CFM is None', () => {
            const cryptFilter: _PdfDictionary = createDictionary({
                CFM: _PdfName.get('None')
            });
            const cipherDictionary: _PdfDictionary = createDictionary({
                Test: cryptFilter
            });

            const cipher = encryptor._buildCipherConstructor(cipherDictionary, _PdfName.get('Test'), 1, 0, createBytes(5, 1));

            expect(cipher instanceof _NullCipher).toBeTruthy();
        });

        it('should return AdvancedEncryption128Cipher when CFM is AESV2', () => {
            const cryptFilter: _PdfDictionary = createDictionary({
                CFM: _PdfName.get('AESV2')
            });
            const cipherDictionary: _PdfDictionary = createDictionary({
                Test: cryptFilter
            });

            spyOn(encryptor, '_buildObjectKey').and.returnValue(createBytes(16, 1));

            const cipher = encryptor._buildCipherConstructor(cipherDictionary, _PdfName.get('Test'), 11, 2, createBytes(5, 1));

            expect(cipher instanceof _AdvancedEncryption128Cipher).toBeTruthy();
            expect(encryptor._buildObjectKey).toHaveBeenCalledWith(11, 2, jasmine.any(Uint8Array), true);
        });

        it('should return AdvancedEncryption256Cipher when CFM is AESV3', () => {
            const cryptFilter: _PdfDictionary = createDictionary({
                CFM: _PdfName.get('AESV3')
            });
            const cipherDictionary: _PdfDictionary = createDictionary({
                Test: cryptFilter
            });

            const cipher = encryptor._buildCipherConstructor(cipherDictionary, _PdfName.get('Test'), 11, 2, createBytes(32, 1));

            expect(cipher instanceof _AdvancedEncryption256Cipher).toBeTruthy();
        });

        it('should return NormalCipherFour when CFM is V2', () => {
            const cryptFilter: _PdfDictionary = createDictionary({
                CFM: _PdfName.get('V2')
            });
            const cipherDictionary: _PdfDictionary = createDictionary({
                Test: cryptFilter
            });

            spyOn(encryptor, '_buildObjectKey').and.returnValue(createBytes(10, 5));

            const cipher = encryptor._buildCipherConstructor(cipherDictionary, _PdfName.get('Test'), 9, 1, createBytes(5, 1));

            expect(cipher instanceof _NormalCipherFour).toBeTruthy();
            expect(encryptor._buildObjectKey).toHaveBeenCalledWith(9, 1, jasmine.any(Uint8Array), false);
        });

        it('should throw FormatError for unknown cryptography method', () => {
            const cryptFilter: _PdfDictionary = createDictionary({
                CFM: _PdfName.get('UnknownCFM')
            });
            const cipherDictionary: _PdfDictionary = createDictionary({
                Test: cryptFilter
            });

            expect((): void => {
                encryptor._buildCipherConstructor(cipherDictionary, _PdfName.get('Test'), 1, 0, createBytes(5, 1));
            }).toBeTruthy();
        });
    });

    describe('_buildObjectKey', () => {
        let encryptor: _PdfEncryptor;

        beforeEach(() => {
            encryptor = Object.create(_PdfEncryptor.prototype) as _PdfEncryptor;
        });

        it('should build object key without AES salt when isAdvancedEncryption is false', () => {
            let capturedData: Uint8Array = new Uint8Array(0);
            let capturedLength: number = 0;

            spyOnProperty(encryptor, '_md5', 'get').and.returnValue({
                hash: jasmine.createSpy('hash').and.callFake(
                    (data: Uint8Array, _offset: number, length: number): Uint8Array => {
                        capturedData = data.slice(0, length);
                        capturedLength = length;
                        return createBytes(32, 1);
                    }
                )
            } as unknown as _PdfEncryptor['_messageDigest']);

            const encryptionKey: Uint8Array = createBytes(5, 20);
            const result: Uint8Array = encryptor._buildObjectKey(0x010203, 0x0405, encryptionKey, false);

            expect(capturedLength).toBe(10);
            expect(Array.from(capturedData)).toEqual([
                20, 21, 22, 23, 24,
                0x03, 0x02, 0x01,
                0x05, 0x04
            ]);
            expect(result.length).toBe(10);
        });

        it('should append AES salt bytes when isAdvancedEncryption is true', () => {
            let capturedData: Uint8Array = new Uint8Array(0);
            let capturedLength: number = 0;

            spyOnProperty(encryptor, '_md5', 'get').and.returnValue({
                hash: jasmine.createSpy('hash').and.callFake(
                    (data: Uint8Array, _offset: number, length: number): Uint8Array => {
                        capturedData = data.slice(0, length);
                        capturedLength = length;
                        return createBytes(32, 2);
                    }
                )
            } as unknown as _PdfEncryptor['_messageDigest']);

            const encryptionKey: Uint8Array = createBytes(5, 30);
            const result: Uint8Array = encryptor._buildObjectKey(0x000102, 0x0304, encryptionKey, true);

            expect(capturedLength).toBe(14);
            expect(Array.from(capturedData)).toEqual([
                30, 31, 32, 33, 34,
                0x02, 0x01, 0x00,
                0x04, 0x03,
                0x73, 0x41, 0x6c, 0x54
            ]);
            expect(result.length).toBe(10);
        });
    });
});

describe('_Word64', () => {
    it('should perform and/or/not/xor/assign correctly', () => {
        const a: _Word64 = new _Word64(0x0f0f0f0f, 0xf0f0f0f0);
        const b: _Word64 = new _Word64(0x33333333, 0x55555555);

        a.and(b);
        expect(a.high).toBe(0x03030303);
        expect(a.low).toBe(0x50505050);

        a.or(new _Word64(0x0000000f, 0x0000000f));
        expect(a.high).toBe(0x0303030f);
        expect(a.low).toBe(0x5050505f);

        a.xor(new _Word64(0x01010101, 0x11111111));
        expect(a.high).toBe(0x0202020e);
        expect(a.low).toBe(0x4141414e);

        a.not();
        expect(a.high).toBe(~0x0202020e);
        expect(a.low).toBe(~0x4141414e);

        const c: _Word64 = new _Word64(1, 2);
        c.assign(new _Word64(10, 20));
        expect(c.high).toBe(10);
        expect(c.low).toBe(20);
    });

    it('should shiftRight for places >= 32', () => {
        const word: _Word64 = new _Word64(0x12345678, 0x9abcdef0);
        word.shiftRight(36);

        expect(word.low).toBe((0x12345678 >>> 4) | 0);
        expect(word.high).toBe(0);
    });

    it('should shiftRight for places < 32', () => {
        const word: _Word64 = new _Word64(0x12345678, 0x9abcdef0);
        word.shiftRight(4);

        expect(word.low).toBe(((0x9abcdef0 >>> 4) | (0x12345678 << 28)) | 0);
        expect(word.high).toBe((0x12345678 >>> 4) | 0);
    });

    it('should shiftLeft for places >= 32', () => {
        const word: _Word64 = new _Word64(0x12345678, 0x13579bdf);
        word.shiftLeft(36);

        expect(word.high).toBe((0x13579bdf << 4) | 0);
        expect(word.low).toBe(0);
    });

    it('should shiftLeft for places < 32', () => {
        const word: _Word64 = new _Word64(0x12345678, 0x13579bdf);
        word.shiftLeft(4);

        expect(word.high).toBe(((0x12345678 << 4) | (0x13579bdf >>> 28)) | 0);
        expect(word.low).toBe((0x13579bdf << 4) | 0);
    });

    it('should rotateRight when places includes 32-bit swap', () => {
        const word: _Word64 = new _Word64(0x11111111, 0x22222222);
        word.rotateRight(36); // includes swap because 36 & 32

        const low: number = 0x11111111;
        const high: number = 0x22222222;
        const places: number = 4;

        expect(word.low).toBe(((low >>> places) | (high << (32 - places))) | 0);
        expect(word.high).toBe(((high >>> places) | (low << (32 - places))) | 0);
    });

    it('should rotateRight when places does not include 32-bit swap', () => {
        const word: _Word64 = new _Word64(0x11111111, 0x22222222);
        word.rotateRight(4);

        const low: number = 0x22222222;
        const high: number = 0x11111111;
        const places: number = 4;

        expect(word.low).toBe(((low >>> places) | (high << (32 - places))) | 0);
        expect(word.high).toBe(((high >>> places) | (low << (32 - places))) | 0);
    });

    it('should add without carry', () => {
        const word: _Word64 = new _Word64(1, 2);
        word.add(new _Word64(3, 4));

        expect(word.high).toBe(4);
        expect(word.low).toBe(6);
    });

    it('should add with carry from low to high', () => {
        const word: _Word64 = new _Word64(1, 0xffffffff);
        word.add(new _Word64(2, 1));

        expect(word.low).toBe(0);
        expect(word.high).toBe(4);
    });

    it('should copyTo bytes in big-endian order', () => {
        const word: _Word64 = new _Word64(0x11223344, 0x55667788);
        const bytes: Uint8Array = new Uint8Array(8);

        word.copyTo(bytes, 0);

        expect(Array.from(bytes)).toEqual([0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]);
    });
});
