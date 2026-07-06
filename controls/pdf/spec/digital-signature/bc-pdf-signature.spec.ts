import { PdfDocument } from '../../src/pdf/core/pdf-document';
import { CryptographicStandard, DigestAlgorithm } from '../../src/pdf/core/enumerator';
import { _PdfCryptographicMessageSyntaxSigner } from '../../src/pdf/core/security/digital-signature/signature/cryptographic-signer';
import { PdfSignature } from '../../src/pdf/core/security/digital-signature/signature/pdf-signature';
import { _PdfX509CertificateParser } from '../../src/pdf/core/security/digital-signature/x509/x509-certificate-parser';
import { _PdfCertificate } from '../../src/pdf/core/security/digital-signature/pdf-certificate';
import { _PdfSignaturePrivateKey } from '../../src/pdf/core/security/digital-signature/signature/signature-privatekey';

var Save: any = (typeof Save !== 'undefined') ? Save : { save: jasmine.createSpy('initial-save-stub') };
var Blob: any = (typeof Blob !== 'undefined') ? Blob : function(parts: any, opts: any) { return { parts, opts }; };

describe('PdfSignature error-branch tests', () => {

    it('throws when certificate data is empty (create branch)', () => {
        expect(() => {
            (PdfSignature as any).create(new Uint8Array(0), 'password');
        }).toThrowError('Certificate data is required.');
    });

    it('throws when password is missing (create branch)', () => {
        expect(() => {
            (PdfSignature as any).create(new Uint8Array([1, 2, 3]), '');
        }).toThrowError('Password is required to open the certificate.');
    });

    it('throws for invalid input/signed data (replaceEmptySignature)', () => {
        expect(() => {
            (PdfSignature as any).replaceEmptySignature(null, 'Signature', new Uint8Array([1]), 0, []);
        }).toThrowError('Invalid Uint8Array: Data is either not a Uint8Array or is empty.');
    });

    it('throws when signatureName is not a string (replaceEmptySignature)', () => {
        expect(() => {
            (PdfSignature as any).replaceEmptySignature(new Uint8Array([1, 2]), ({} as any), new Uint8Array([1]), 0, []);
        }).toThrowError('Signature field name is required');
    });

    it('throws when external certificate chain is empty (replaceEmptySignature)', () => {
        expect(() => {
            (PdfSignature as any).replaceEmptySignature(new Uint8Array([1, 2, 3]), 'Signature', new Uint8Array([1]), 0, []);
        }).toThrowError('Invalid certificate chain: Expected a non-empty array of Certificate.');
    });

    it('applies options and timestamp when callback + options provided (create branch)', () => {
        const externalCallback = () => new Uint8Array([1]);
        const timestampFn = () => ({} as any);
        const options = { certify: true, isLocked: true } as any;
        const signature: any = (PdfSignature as any).create(externalCallback, options, timestampFn);
        expect(signature._externalSignatureCallback).toBeDefined();
        expect(signature._externalSignatureCallback).toBe(externalCallback);
        expect(signature._timestampCallback).toBeDefined();
        expect(signature._timestampCallback).toBe(timestampFn);
        expect(signature._certify).toBeTruthy();
        expect(signature._isLocked).toBeTruthy();
    });

    it('sets timestamp-only when options object as first arg and timestamp second arg', () => {
        const timestampFn = () => ({} as any);
        const options = { certify: true } as any;
        const signature: any = (PdfSignature as any).create(options, timestampFn);
        expect(signature._isTimestampOnly).toBeTruthy();
        expect(signature._timestampCallback).toBe(timestampFn);
    });

    it('accepts nulls for first two args and uses arg3/options + arg4/timestamp', () => {
        const timestampFn = () => ({} as any);
        const options = { isLocked: true } as any;
        const signature: any = (PdfSignature as any).create(null, null, options, timestampFn);
        expect(signature._isTimestampOnly).toBeTruthy();
        expect(signature._timestampCallback).toBe(timestampFn);
        expect(signature._isLocked).toBeTruthy();
    });

    it('sets _timestampCallback when arg1 is function and arg2 is publicCertificates array with arg4 function', () => {
        const readSpy = spyOn((_PdfX509CertificateParser as any).prototype, '_readCertificate').and.returnValue({ mock: true } as any);
        const externalCallback = () => new Uint8Array([1]);
        const publicCerts = [new Uint8Array([1, 2])];
        const timestampFn = () => ({ token: new Uint8Array([9]) }) as any;
        const options = { certify: true } as any;

        const signature: any = (PdfSignature as any).create(externalCallback, publicCerts, options, timestampFn);

        expect(signature._externalSignatureCallback).toBeDefined();
        expect(signature._externalSignatureCallback).toBe(externalCallback);
        expect(signature._externalChain.length).toBe(1);
        expect(readSpy).toHaveBeenCalled();
        expect(signature._timestampCallback).toBeDefined();
        expect(signature._timestampCallback).toBe(timestampFn);
        expect(signature._certify).toBeTruthy();
    });

    it('returns signature when only callback provided (function branch simple return)', () => {
        const externalCallback = () => new Uint8Array([9]);
        const signature: any = (PdfSignature as any).create(externalCallback as any);
        expect(signature._externalSignatureCallback).toBeDefined();
        expect(signature._externalSignatureCallback).toBe(externalCallback);
        expect(signature._externalChain).toBeDefined();
        expect(Array.isArray(signature._externalChain)).toBeTruthy();
    });

    it('throws when arguments are invalid (final create error)', () => {
        expect(() => {
            (PdfSignature as any).create(123 as any, 456 as any);
        }).toThrowError('Cannot create signature due to invalid arguments.');
    });

    it('does not set _timestampCallback when arg4 is non-function in PFX create branch', () => {
        const originalCert: any = (_PdfCertificate as any);
        (_PdfCertificate as any) = function (data?: any, password?: any) {
            this._issuerName = 'issuer';
            this._serialNumber = 'serial';
            this._subjectName = 'subject';
            this._validFrom = new Date(2000, 0, 1);
            this._validTo = new Date(2001, 0, 1);
            this._version = 3;
        } as any;

        try {
            const pfx = new Uint8Array([1, 2, 3]);
            const signature: any = (PdfSignature as any).create(pfx, 'pwd', { certify: false } as any, {} as any);
            expect(signature._certificate).toBeDefined();
            expect(signature._timestampCallback).toBeUndefined();
            expect(signature._certificateInfo).toBeDefined();
            expect(signature._certificateInfo.issuerName).toBe('issuer');
        } finally {
            (_PdfCertificate as any) = originalCert;
        }
    });

    it('sets _timestampCallback when arg4 is function in PFX create branch', () => {
        const originalCert: any = (_PdfCertificate as any);
        (_PdfCertificate as any) = function (data?: any, password?: any) {
            this._issuerName = 'issuer';
            this._serialNumber = 'serial';
            this._subjectName = 'subject';
            this._validFrom = new Date(2000, 0, 1);
            this._validTo = new Date(2001, 0, 1);
            this._version = 3;
        } as any;

        try {
            const pfx = new Uint8Array([4, 5, 6]);
            const timestampFn = () => ({ token: new Uint8Array([9]) }) as any;
            const signature: any = (PdfSignature as any).create(pfx, 'pwd', { certify: false } as any, timestampFn);
            expect(signature._certificate).toBeDefined();
            expect(signature._timestampCallback).toBeDefined();
            expect(signature._timestampCallback).toBe(timestampFn);
            expect(signature._certificateInfo).toBeDefined();
            expect(signature._certificateInfo.issuerName).toBe('issuer');
        } finally {
            (_PdfCertificate as any) = originalCert;
        }
    });

    it('also sets _timestampCallback when arg3 is undefined and arg4 is function (PFX)', () => {
        const originalCert: any = (_PdfCertificate as any);
        (_PdfCertificate as any) = function (data?: any, password?: any) {
            this._issuerName = 'issuer2';
            this._serialNumber = 'serial2';
            this._subjectName = 'subject2';
            this._validFrom = new Date(2002, 0, 1);
            this._validTo = new Date(2003, 0, 1);
            this._version = 4;
        } as any;

        try {
            const pfx = new Uint8Array([7, 8, 9]);
            const timestampFn = function () { return { ts: new Uint8Array([1]) }; } as any;
            const signature: any = (PdfSignature as any).create(pfx, 'pwd', undefined as any, timestampFn);
            expect(signature._certificate).toBeDefined();
            expect(signature._timestampCallback).toBeDefined();
            expect(signature._timestampCallback).toBe(timestampFn);
            expect(signature._certificateInfo).toBeDefined();
            expect(signature._certificateInfo.issuerName).toBe('issuer2');
        } finally {
            (_PdfCertificate as any) = originalCert;
        }
    });

    it('updates catalog perms when DocMDP is missing (_catalogBeginSave)', () => {
        // Arrange
        const signature: any = new (PdfSignature as any)();
        signature._certify = true;

        const ref = { id: 'r1' } as any;
        const sentinelDict = { sentinel: true } as any;
        signature._signatureDictionary = { _dictionary: sentinelDict } as any;

        signature._crossReference = { _getNextReference: () => ref } as any;

        const permission = {
            _map: new Map<string, any>(),
            has: function (k: string) { return this._map.has(k); },
            set: function (k: string, v: any) { this._map.set(k, v); },
            get: function (k: string) { return this._map.get(k); },
            _updated: false
        } as any;

        const document = { _catalog: { _catalogDictionary: { get: (_k: string) => permission } } } as any;

        const cacheMap = new Map<any, any>();
        const sigFieldCrossRef = { _cacheMap: cacheMap, _document: document } as any;
        signature._signatureField = { _crossReference: sigFieldCrossRef } as any;

        // Act
        (signature as any)._catalogBeginSave();

        // Assert
        expect(permission._updated).toBeTruthy();
        expect(permission.get('DocMDP')).toBe(ref);
        expect(cacheMap.get(ref)).toBe(sentinelDict);
    });

    it('_initializeInternals sets _isLocked when field dictionary has Lock', () => {
        // Arrange
        const signature: any = new PdfSignature();
        const dictArg: any = { has: () => false, get: () => undefined as any, objId: 1 };
        const lockObj = { some: 'lock' } as any;
        const field: any = {
            _crossReference: { _document: new PdfDocument() },
            _dictionary: {
                has: (k: string) => k === 'Lock',
                get: (k: string) => lockObj,
                isLoaded: false
            }
        };

        // Act
        signature._initializeInternals(dictArg, field);

        // Assert
        expect(signature._isLocked).toBeTruthy();
    });

    it('_initializeInternals sets _isLocked when Kids reference dictionary has Lock', () => {
        // Arrange
        const signature: any = new (PdfSignature as any)();
        const dictArg: any = { has: () => false, get: () => undefined as any, objId: 2 };
        const refObj = {} as any;
        const innerDict = { has: (k: string) => k === 'Lock', get: () => ({}) } as any;
        const cacheMap = new Map();
        cacheMap.set(refObj, innerDict);
        const field: any = {
            _crossReference: { _cacheMap: cacheMap, _document: new PdfDocument() },
            _dictionary: {
                has: (k: string) => k === 'Kids',
                get: (k: string) => [refObj]
            },
            isLoaded: false
        };

        // Act
        signature._initializeInternals(dictArg, field);

        // Assert
        expect(signature._isLocked).toBeTruthy();
    });

    it('_initializeInternals flips _certify when document catalog DocMDP matches dictionary.objId', () => {
        // Arrange
        const signature: any = new (PdfSignature as any)();
        signature._certify = false;
        const dictArg: any = { has: () => false, get: () => undefined as any, objId: 42 };
        const perms = {
            has: (k: string) => k === 'DocMDP',
            get: (k: string) => ({ objId: 42 })
        } as any;
        const document = { _isLoaded: true, _catalog: { _catalogDictionary: { has: (_: string) => true, get: (_: string) => perms } } } as any;
        const crossRef = { _document: document } as any;
        const field: any = { _crossReference: crossRef, _dictionary: { has: () => false } };

        // Act
        signature._initializeInternals(dictArg, field);

        // Assert
        expect(signature._certify).toBeTruthy();
    });

    it('_toNumberArray method return for invalid inputs', () => {
        const signature = new PdfSignature();
        const check = signature._toNumberArray(null);
        expect(check).toBeUndefined();
        const check2 = signature._toNumberArray(1);
        expect(check2).toBeUndefined();
    });

    it('getters  return values check', () => {
        const signature = new PdfSignature();
        const check = signature.getSignedDate();
        expect(check).toEqual(signature._signedDate);
        const check2 = signature.getCertificateInformation();
        expect(check2).toEqual(signature._certificateInfo);
    });

    it('replaceEmptySignature uses arg6 as options and parses publicCertificates', () => {
        const originalPdfDocument: any = (PdfDocument as any);
        const readSpy = spyOn((_PdfX509CertificateParser as any).prototype, '_readCertificate').and.returnValue({ mock: true } as any);
        const mockDoc: any = { form: { count: 0, fieldAt: (_i: number) => ({}) }, destroy: jasmine.createSpy('destroy') };
        (PdfDocument as any) = function (input?: any, password?: any) { mockDoc._constructed = { input, password }; return mockDoc; } as any;

        const input = new Uint8Array([1, 2, 3]);
        expect(() => {
            (PdfSignature as any).replaceEmptySignature(input, 'Signature', new Uint8Array([1]), DigestAlgorithm.sha256, [new Uint8Array([1, 2])], { password: 'pwd', skipSignatureEncoding: true } as any);
        }).toThrowError('Signing failed: Signature field name not found.');

        expect(readSpy).toHaveBeenCalled();
        expect(mockDoc._constructed.password).toBe('pwd');

        (PdfDocument as any) = originalPdfDocument;
    });

    it('replaceEmptySignature treats arg6 as output filename (string) and uses arg7 undefined', () => {
        const originalPdfDocument: any = (PdfDocument as any);
        const readSpy = spyOn((_PdfX509CertificateParser as any).prototype, '_readCertificate').and.returnValue({ mock: true } as any);
        const mockDoc: any = { form: { count: 0, fieldAt: (_i: number) => ({}) }, destroy: jasmine.createSpy('destroy') };
        (PdfDocument as any) = function (input?: any, password?: any) { mockDoc._constructed = { input, password }; return mockDoc; } as any;

        expect(() => {
            (PdfSignature as any).replaceEmptySignature(new Uint8Array([9]), 'Signature', new Uint8Array([1]), DigestAlgorithm.sha256, [new Uint8Array([2])], 'out.pdf');
        }).toThrowError('Signing failed: Signature field name not found.');

        expect(mockDoc._constructed.password).toBeUndefined();
        expect(readSpy).toHaveBeenCalled();

        (PdfDocument as any) = originalPdfDocument;
    });

    it('replaceEmptySignature uses arg7 options when arg6 is null', () => {
        const originalPdfDocument: any = (PdfDocument as any);
        const readSpy = spyOn((_PdfX509CertificateParser as any).prototype, '_readCertificate').and.returnValue({ mock: true } as any);
        const mockDoc: any = { form: { count: 0, fieldAt: (_i: number) => ({}) }, destroy: jasmine.createSpy('destroy') };
        (PdfDocument as any) = function (input?: any, password?: any) { mockDoc._constructed = { input, password }; return mockDoc; } as any;

        expect(() => {
            (PdfSignature as any).replaceEmptySignature(new Uint8Array([7]), 'Signature', new Uint8Array([1]), DigestAlgorithm.sha256, [new Uint8Array([2])], null, { password: 'p2' } as any);
        }).toThrowError('Signing failed: Signature field name not found.');

        expect(mockDoc._constructed.password).toBe('p2');
        expect(readSpy).toHaveBeenCalled();

        (PdfDocument as any) = originalPdfDocument;
    });

    it('uses CAdES SubFilter branch (lines 818-820)', () => {
        // Arrange
        const originalPdfDocument: any = (PdfDocument as any);
        const originalCms: any = (_PdfCryptographicMessageSyntaxSigner as any);
        const originalPks: any = (_PdfSignaturePrivateKey as any);
        const readSpy = spyOn((_PdfX509CertificateParser as any).prototype, '_readCertificate').and.returnValue({ mock: true } as any);

        let signCalled = false;
        (_PdfCryptographicMessageSyntaxSigner as any) = function () {
            return {
                _getDigestAlgorithm: () => ({ _digest: (_data: Uint8Array, _alg: string) => new Uint8Array([9]) }),
                _setSignedData: (_signedData: Uint8Array, _a: any, _enc: any) => { /* noop */ },
                _sign: (_hash: Uint8Array, _a: any, _b: any, _c: any, cryptographicStandard: any, _d: any) => {
                    signCalled = cryptographicStandard === (CryptographicStandard as any).cades;
                    return new Uint8Array([1, 2, 3]);
                }
            } as any;
        } as any;

        (_PdfSignaturePrivateKey as any) = function (_hash?: any) {
            this._getEncryptionAlgorithm = () => 'RSA';
        } as any;

        const inputPdfData = new Uint8Array(200);
        const signatureDictV = {
            getArray: (_k: string) => [0, 50, 100, 0],
            has: (k: string) => k === 'SubFilter' || k === 'ByteRange',
            get: (k: string) => ({ name: 'ETSI.CAdES.detached' })
        } as any;
        const field = {
            name: 'Signature',
            _dictionary: {
                has: (k: string) => k === 'V',
                get: (k: string) => signatureDictV
            }
        } as any;
        const mockDoc: any = { form: { count: 1, fieldAt: (_i: number) => field }, destroy: jasmine.createSpy('destroy') };
        (PdfDocument as any) = function (input?: any, password?: any) { mockDoc._constructed = { input, password }; return mockDoc; } as any;

        try {
            // Act
            const result: any = (PdfSignature as any).replaceEmptySignature(inputPdfData,
                'Signature', new Uint8Array([1]), (DigestAlgorithm as any).sha256, [new Uint8Array([1, 2, 3])]);

            // Assert
            expect(readSpy).toHaveBeenCalled();
            expect(signCalled).toBeTruthy();
            expect(result[50]).toBe('<'.charCodeAt(0));
            expect(result[99]).toBe('>'.charCodeAt(0));
        } finally {
            // Cleanup
            (PdfDocument as any) = originalPdfDocument;
            (_PdfCryptographicMessageSyntaxSigner as any) = originalCms;
            (_PdfSignaturePrivateKey as any) = originalPks;
        }
    });

    it('replaceEmptySignature returns bytes when no filename provided (no Save/Blob)', () => {
        // Arrange
        const originalPdfDocument: any = (PdfDocument as any);
        const originalCms: any = (_PdfCryptographicMessageSyntaxSigner as any);
        const originalPks: any = (_PdfSignaturePrivateKey as any);

        const readSpy = spyOn((_PdfX509CertificateParser as any).prototype, '_readCertificate').and.returnValue({ mock: true } as any);

        (_PdfCryptographicMessageSyntaxSigner as any) = function () {
            return {
                _getDigestAlgorithm: () => ({ _digest: (_data: Uint8Array, _alg: string) => new Uint8Array([9]) }),
                _setSignedData: (_signedData: Uint8Array, _a: any, _enc: any) => { /* noop */ },
                _sign: (_hash: Uint8Array, _a: any, _b: any, _c: any, _cryptographicStandard: any, _d: any) => new Uint8Array([1, 2, 3, 4, 5])
            } as any;
        } as any;

        (_PdfSignaturePrivateKey as any) = function (_hash?: any) {
            this._getEncryptionAlgorithm = () => 'RSA';
        } as any;

        const inputPdfData = new Uint8Array(200);
        const signatureDictV = {
            getArray: (_k: string) => [0, 50, 100, 0],
            has: (k: string) => k === 'SubFilter' || k === 'ByteRange',
            get: (k: string) => ({ name: 'adbe.pkcs7.detached' })
        } as any;
        const field = {
            name: 'Signature',
            _dictionary: {
                has: (k: string) => k === 'V',
                get: (k: string) => signatureDictV
            }
        } as any;
        const mockDoc: any = { form: { count: 1, fieldAt: (_i: number) => field }, destroy: jasmine.createSpy('destroy') };
        (PdfDocument as any) = function (input?: any, password?: any) { mockDoc._constructed = { input, password }; return mockDoc; } as any;

        try {
            // Act
            const result: any = (PdfSignature as any).replaceEmptySignature(inputPdfData,
                'Signature', new Uint8Array([1]), (DigestAlgorithm as any).sha256, [new Uint8Array([1, 2, 3])]);

            // Assert
            expect(readSpy).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result instanceof Uint8Array).toBeTruthy();
            expect(mockDoc.destroy).toHaveBeenCalled();
        } finally {
            // Cleanup
            (PdfDocument as any) = originalPdfDocument;
            (_PdfCryptographicMessageSyntaxSigner as any) = originalCms;
            (_PdfSignaturePrivateKey as any) = originalPks;
        }
    });

    describe('PdfSignature.replaceEmptySignature – prototype-safe tests', () => {
        let originalPdfDocument: any;
        let originalReadCert: any;
        let originalGetDigest: any;
        let originalSetSignedData: any;
        let originalSign: any;

        beforeEach(() => {
            // Save original constructor
            originalPdfDocument = PdfDocument;

            // Save original prototype methods
            originalReadCert =
                (_PdfX509CertificateParser as any).prototype._readCertificate;
            originalGetDigest =
                (_PdfCryptographicMessageSyntaxSigner as any).prototype._getDigestAlgorithm;
            originalSetSignedData =
                (_PdfCryptographicMessageSyntaxSigner as any).prototype._setSignedData;
            originalSign =
                (_PdfCryptographicMessageSyntaxSigner as any).prototype._sign;

            // Ensure signer prototype methods exist so spyOn won't error
            if (typeof (_PdfCryptographicMessageSyntaxSigner as any).prototype._getDigestAlgorithm !== 'function') {
                (_PdfCryptographicMessageSyntaxSigner as any).prototype._getDigestAlgorithm = function () { return { _digest: () => new Uint8Array([1]) }; } as any;
            }
            if (typeof (_PdfCryptographicMessageSyntaxSigner as any).prototype._setSignedData !== 'function') {
                (_PdfCryptographicMessageSyntaxSigner as any).prototype._setSignedData = function () { } as any;
            }
            if (typeof (_PdfCryptographicMessageSyntaxSigner as any).prototype._sign !== 'function') {
                (_PdfCryptographicMessageSyntaxSigner as any).prototype._sign = function () { return new Uint8Array([1]); } as any;
            }
        });

        afterEach(() => {
            // ✅ Restore constructor
            (PdfDocument as any) = originalPdfDocument;

            // Restore prototype methods (may be undefined originally)
            (_PdfX509CertificateParser as any).prototype._readCertificate = originalReadCert;
            (_PdfCryptographicMessageSyntaxSigner as any).prototype._getDigestAlgorithm = originalGetDigest;
            (_PdfCryptographicMessageSyntaxSigner as any).prototype._setSignedData = originalSetSignedData;
            (_PdfCryptographicMessageSyntaxSigner as any).prototype._sign = originalSign;

        });

        it('writes signature when V present and space sufficient', () => {
            spyOn(
                (_PdfX509CertificateParser as any).prototype,
                '_readCertificate'
            ).and.returnValue({ mock: true } as any);

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_getDigestAlgorithm'
            ).and.returnValue({
                _digest: () => new Uint8Array([1, 2, 3])
            });

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_setSignedData'
            ).and.callFake(() => { });

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_sign'
            ).and.returnValue(new Uint8Array(8));

            const input = new Uint8Array(200).fill(48);

            const signatureDict: any = {
                has: (k: string) => k === 'SubFilter' || k === 'V' || k === 'ByteRange',
                get: () => ({ name: 'adbe.pkcs7.detached' }),
                getArray: () => [0, 10, 30, 0]
            };

            const field: any = {
                name: 'sig',
                _dictionary: {
                    has: (k: string) => k === 'V',
                    get: () => signatureDict
                }
            };

            const mockDoc: any = {
                form: { count: 1, fieldAt: () => field },
                destroy: jasmine.createSpy('destroy')
            };

            (PdfDocument as any) = function () { return mockDoc; };

            const result = (PdfSignature as any).replaceEmptySignature(
                input,
                'sig',
                new Uint8Array([1]),
                DigestAlgorithm.sha256,
                [new Uint8Array([1])],
                { password: 'pwd' }
            );

            expect(result[10]).toBe('<'.charCodeAt(0));
            expect(mockDoc.destroy).toHaveBeenCalled();
        });

        it('throws when allocated signature space is odd', () => {
            spyOn(
                (_PdfX509CertificateParser as any).prototype,
                '_readCertificate'
            ).and.returnValue({ mock: true } as any);

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_getDigestAlgorithm'
            ).and.returnValue({ _digest: () => new Uint8Array([1]) });

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_setSignedData'
            ).and.callFake(() => { });

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_sign'
            ).and.returnValue(new Uint8Array(4));

            const input = new Uint8Array(100).fill(48);

            const signatureDict: any = {
                has: (k: string) => k === 'V' || k === 'ByteRange',
                get: () => ({ name: 'adbe.pkcs7.detached' }),
                getArray: () => [0, 10, 15, 0]
            };

            const field: any = {
                name: 'sig',
                _dictionary: { has: () => true, get: () => signatureDict }
            };

            const mockDoc: any = {
                form: { count: 1, fieldAt: () => field },
                destroy: jasmine.createSpy('destroy')
            };

            (PdfDocument as any) = function () { return mockDoc; };

            expect(() => {
                (PdfSignature as any).replaceEmptySignature(
                    input,
                    'sig',
                    new Uint8Array([1]),
                    DigestAlgorithm.sha256,
                    [new Uint8Array([1])]
                );
            }).toThrowError('Signing failed: Allocated space was not enough');

            expect(mockDoc.destroy).toHaveBeenCalled();
        });

        it('throws when signature content space is insufficient', () => {
            spyOn(
                (_PdfX509CertificateParser as any).prototype,
                '_readCertificate'
            ).and.returnValue({ mock: true } as any);

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_getDigestAlgorithm'
            ).and.returnValue({ _digest: () => new Uint8Array([1]) });

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_setSignedData'
            ).and.callFake(() => { });

            spyOn(
                (_PdfCryptographicMessageSyntaxSigner as any).prototype,
                '_sign'
            ).and.returnValue(new Uint8Array(100));

            const input = new Uint8Array(300).fill(48);

            const signatureDict: any = {
                has: (k: string) => k === 'V' || k === 'ByteRange',
                get: () => ({ name: 'adbe.pkcs7.detached' }),
                getArray: () => [0, 10, 22, 0]
            };

            const field: any = {
                name: 'sig',
                _dictionary: { has: () => true, get: () => signatureDict }
            };

            const mockDoc: any = {
                form: { count: 1, fieldAt: () => field },
                destroy: jasmine.createSpy('destroy')
            };

            (PdfDocument as any) = function () { return mockDoc; };

            expect(() => {
                (PdfSignature as any).replaceEmptySignature(
                    input,
                    'sig',
                    new Uint8Array([1]),
                    DigestAlgorithm.sha256,
                    [new Uint8Array([1])]
                );
            }).toThrowError(
                'Signing failed: Signature content space is not enough for signed bytes'
            );

            expect(mockDoc.destroy).toHaveBeenCalled();
        });
    });
});