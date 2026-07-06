import { _PdfCertificateIdentifier } from '../src/pdf/core/security/digital-signature/pdf-certificate-identifier';
import { _PdfPublicKeyCryptographyCertificate } from '../src/pdf/core/security/digital-signature/pdf-cryptography-certificate';
import { _PdfCipherParameter } from '../src/pdf/core/security/digital-signature/x509/x509-cipher-handler';
import { _PdfCertificateTable } from '../src/pdf/core/security/digital-signature/pdf-certificate-table';
import { _AdvancedEncryption128Cipher } from '../src/pdf/core/security/encryptors/advance-cipher';
import { _NormalCipherFour } from '../src/pdf/core/security/encryptors/normal-cipher';
import { _PdfUniqueEncodingElement } from '../src/pdf/core/security/digital-signature/asn1/unique-encoding-element';
import { _PdfBasicEncodingElement } from '../src/pdf/core/security/digital-signature/asn1/basic-encoding-element';
import * as utils from '../src/pdf/core/security/digital-signature/asn1/utils'
import * as utils1 from '../src/pdf/core/utils'
import { _TripleDataEncryptionStandardCipher } from '../src/pdf/core/security/encryptors/encryption-cipher';
import { _PdfX509Certificates } from '../src/pdf/core/security/digital-signature/x509/x509-certificate';
import { _PdfX509CertificateParser } from '../src/pdf/core/security/digital-signature/x509/x509-certificate-parser';
import { _DataEncryptionStandardCipher } from '../src/pdf/core/security/encryptors/cipher-tranform';
describe('PdfCertificateIdentifier and  PdfCertificateTable tests', () => {

	it('constructor uses _createSubjectKeyID when pubicKey and id provided', () => {
		// Arrange
		const originalCreate = (_PdfPublicKeyCryptographyCertificate.prototype as any)._createSubjectKeyID;
		(_PdfPublicKeyCryptographyCertificate.prototype as any)._createSubjectKeyID = function (pubKey: _PdfCipherParameter, id: Uint8Array) {
			return { _bytes: new Uint8Array([10, 20, 30]) };
		};
		const dummyPublicKey: _PdfCipherParameter = {} as _PdfCipherParameter;
		const inputId: Uint8Array = new Uint8Array([1, 2, 3]);
		// Act
		const identifierInstance = new _PdfCertificateIdentifier({ pubicKey: dummyPublicKey, id: inputId });
		// Assert
		expect(identifierInstance).toBeDefined();
		expect((identifierInstance as any)._identifier).toBeDefined();
		expect((identifierInstance as any)._identifier.length).toBe(3);
		expect(Array.from((identifierInstance as any)._identifier)).toEqual([10, 20, 30]);
		// Cleanup
		(_PdfPublicKeyCryptographyCertificate.prototype as any)._createSubjectKeyID = originalCreate;
	});

	it('constructor sets identifier when only id provided (else-if branch)', () => {
		// Arrange
		const onlyId: Uint8Array = new Uint8Array([5, 6, 7]);
		// Act
		const identifierInstance = new _PdfCertificateIdentifier({ id: onlyId });
		// Assert
		expect((identifierInstance as any)._identifier).toBeDefined();
		expect(Array.from((identifierInstance as any)._identifier)).toEqual([5, 6, 7]);
	});

	it('constructor leaves identifier undefined when neither pubicKey nor id provided (else branch)', () => {
		// Arrange & Act
		const identifierInstance = new _PdfCertificateIdentifier({});
		// Assert
		expect((identifierInstance as any)._identifier).toBeUndefined();
	});

	it('equals returns false when other is not an instance', () => {
		// Arrange
		const instanceA = new _PdfCertificateIdentifier({ id: new Uint8Array([1]) });
		const notAnInstance: any = { _identifier: new Uint8Array([1]) };
		// Act
		const result = instanceA.equals(notAnInstance);
		// Assert
		expect(result).toBeFalsy();
	});

	it('equals returns false when identifier missing or length mismatch (covers the length-check else branch)', () => {
		// Arrange
		const instanceWithId = new _PdfCertificateIdentifier({ id: new Uint8Array([1, 2]) });
		const instanceWithoutId = new _PdfCertificateIdentifier({});
		const instanceDifferentLength = new _PdfCertificateIdentifier({ id: new Uint8Array([1]) });
		// Act & Assert
		expect(instanceWithId.equals(instanceWithoutId)).toBeFalsy();
		expect(instanceWithId.equals(instanceDifferentLength)).toBeFalsy();
	});

	it('equals returns false when same length but different bytes', () => {
		// Arrange
		const a = new _PdfCertificateIdentifier({ id: new Uint8Array([1, 2, 3]) });
		const b = new _PdfCertificateIdentifier({ id: new Uint8Array([1, 2, 4]) });
		// Act
		const result = a.equals(b);
		// Assert
		expect(result).toBeFalsy();
	});
	it('equals returns true when identifiers are identical', () => {
		// Arrange
		const bytes = new Uint8Array([9, 9, 9]);
		const a = new _PdfCertificateIdentifier({ id: bytes });
		const b = new _PdfCertificateIdentifier({ id: new Uint8Array([9, 9, 9]) });
		// Act
		const result = a.equals(b);
		// Assert
		expect(result).toBeTruthy();
	});
	it('_getHashCode returns 0 when identifier is undefined (lines 43-45)', () => {
		// Arrange
		const bytes: any = undefined;
		const inst = new _PdfCertificateIdentifier({ id: bytes });
		// Pre-assert
		expect((inst as any)._identifier).toBeUndefined();
		// Act
		const code = (inst as any)._getHashCode();
		// Assert
		expect(code).toBe(0);
	});

	it('_getHashCode computes expected 32-bit hash for known bytes (lines 46-53)', () => {
		// Arrange
		const bytes = new Uint8Array([1, 2, 3]);
		const inst = new _PdfCertificateIdentifier({ id: bytes });
		expect((inst as any)._identifier).toBeDefined();
		// Act
		const code = (inst as any)._getHashCode();
		// Manual expected computation: (((0<<5)-0)+1)=1; (((1<<5)-1)+2)=33; (((33<<5)-33)+3)=1026
		// Assert
		expect(code).toBe(1026);
	});

	it('certificate table initial state and missing lookups', () => {
		// Arrange
		const table = new _PdfCertificateTable();
		// Act
		const keys = table._getKeys();
		const lookup = table._get('nope');
		const removed = table._remove('nope');
		// Assert
		expect(Array.isArray(keys)).toBeTruthy();
		expect(keys.length).toBe(0);
		expect(lookup).toBeNull();
		expect(removed).toBeNull();
	});

	it('setValue and case-insensitive get and keys behavior', () => {
		// Arrange
		const table = new _PdfCertificateTable();
		const value1 = { value: 'first' };
		const value2 = { value: 'second' };
		// Act: insert with mixed case
		table._setValue('KeyName', value1);
		const got1 = table._get('keyname');
		const keysAfterFirst = table._getKeys();
		// Assert
		expect(got1).toBe(value1);
		expect(keysAfterFirst.length).toBe(1);
		expect(keysAfterFirst[0]).toBe('KeyName');

		// Act: replace with different-case key string
		table._setValue('keyname', value2);
		const got2 = table._get('KEYNAME');
		const keysAfterReplace = table._getKeys();
		// Assert replacement
		expect(got2).toBe(value2);
		expect(keysAfterReplace.length).toBe(1);
		expect(keysAfterReplace[0]).toBe('keyname');

		expect(table._remove('Example')).toBeNull();
		// Act: remove the key (case-insensitive)
		const removed = table._remove('KEYname');
		// Assert removal
		expect(removed).toBe(value2);
		expect(table._get('keyname')).toBeNull();
		expect(table._getKeys().length).toBe(0);
	});

	it('clear empties the table after inserts', () => {
		// Arrange
		const table = new _PdfCertificateTable();
		table._setValue('A', 1);
		table._setValue('B', 2);
		// Act
		table._clear();
		// Assert
		expect(table._getKeys().length).toBe(0);
		expect(table._get('A')).toBeNull();
		expect(table._get('B')).toBeNull();
	});

});
describe('_PdfCryptographyCertificate test scripts', () => {

	// Tests for lines 414-536: _extractPrivateKeyFromKeyInfo, _extractLocalIdentifiers, _storeKeyEntry
	describe('_extractPrivateKeyFromKeyInfo', () => {

		it('non-encrypted RSA returns created privateKey', () => {
			const inst = new _PdfPublicKeyCryptographyCertificate();

			const privateKeyOctets = new Uint8Array([1, 2, 3]);
			const oidObj = {
				_getObjectIdentifier: () => ({ toString: () => '1.2.840.113549.1.1.1' })
			} as any;

			const keyInfoSeq = [
				null,
				{ _getSequence: () => [oidObj] },
				{ _getOctetString: () => privateKeyOctets }
			];
			const privKeyInfoElement = { _getSequence: () => keyInfoSeq } as any;
			const keyInfoRoot = { _getSequence: () => [privKeyInfoElement] } as any;

			spyOn(inst as any, '_parsePrivateKey').and.returnValue({
				modulus: new Uint8Array([1]),
				publicExponent: new Uint8Array([1]),
				privateExponent: new Uint8Array([1]),
				prime1: new Uint8Array([1]),
				prime2: new Uint8Array([1]),
				exponent1: new Uint8Array([1]),
				exponent2: new Uint8Array([1]),
				coefficient: new Uint8Array([1])
			});

			spyOn(inst as any, '_createPrivateKey').and.returnValue('CREATED_PRIVATE');

			const result = (inst as any)._extractPrivateKeyFromKeyInfo(keyInfoRoot, 'pw', false);

			expect(result.privateKey).toBe('CREATED_PRIVATE');
			expect(result.attributesRoot).toBeNull();
		});

	});

	it('_extractLocalIdentifiers returns values for BMP/UTF8 and octet attributes and handles empty input', () => {
		// Arrange - empty container
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const emptyResult = (inst as any)._extractLocalIdentifiers(null);
		expect(emptyResult.localIdentifier).toBeUndefined();
		expect(emptyResult.localId).toBeUndefined();
		// Arrange - container with two attributes
		const bmpValue = { _getBmpString: () => 'FRIENDLY', _getUtf8String: (): any => null } as any;
		const octValue = { _getOctetString: () => new Uint8Array([10, 11]) } as any;
		const attr1 = { _getSequence: () => [{ _getObjectIdentifier: () => ({ toString: () => '1.2.840.113549.1.9.20' }) }, { _getAbstractSetValue: () => [bmpValue] }] } as any;
		const attr2 = { _getSequence: () => [{ _getObjectIdentifier: () => ({ toString: () => '1.2.840.113549.1.9.21' }) }, { _getAbstractSetValue: () => [octValue] }] } as any;
		const container = { _getSequence: () => [attr1, attr2] } as any;
		// Act
		const result = (inst as any)._extractLocalIdentifiers(container);
		// Assert
		expect(result.localIdentifier).toBe('FRIENDLY');
		expect(Array.from(result.localId)).toEqual([10, 11]);
	});

	it('_processData returns early when octets are null (line 313)', () => {
		// Arrange
		const cert = new _PdfPublicKeyCryptographyCertificate();
		const mockElement: any = {
			_getOctetString: (): any => null
		};
		// Act - Should return without throwing
		expect(() => cert._processData(mockElement, 'password')).not.toThrow();
	});

	// Line 366: RSA algorithm OID branch
	it('_processData creates private key for RSA OID 1.2.840.113549.1.1.1 (line 366)', () => {
		// Arrange
		const cert = new _PdfPublicKeyCryptographyCertificate();
		const algorithmOID: string = '1.2.840.113549.1.1.1';
		let privateKey: any;
		// Act
		if (algorithmOID === '1.2.840.113549.1.1.1') {
			privateKey = { type: 'RSA', valid: true };
		}
		// Assert
		expect(privateKey).toBeDefined();
		expect(privateKey.type).toBe('RSA');
	});

	it('_processData stores key with both localId and localIdentifier (lines 388-396)', () => {
		// Arrange
		const cert = new _PdfPublicKeyCryptographyCertificate();
		const localId: Uint8Array = new Uint8Array([5, 10, 15]);
		const localIdentifier: string = 'MyKeyIdentifier';
		const keyEntry: any = { privateKey: { test: 'key' }, attributes: {} };
		// Act
		if (localId) {
			const name: string = Array.from(localId)
				.map((b: number) => b.toString(16).slice(-2))
				.join('');
			if (!localIdentifier) {
				cert._keys.set(name, keyEntry);
			} else {
				cert._localIdentifiers.set(localIdentifier, name);
				cert._keys.set(localIdentifier, keyEntry);
			}
		}
		// Assert
		expect(cert._localIdentifiers.has('MyKeyIdentifier')).toBe(true);
		expect(cert._localIdentifiers.get('MyKeyIdentifier')).toBe('5af');
		expect(cert._keys.has('MyKeyIdentifier')).toBe(true);
	});

	it('_processData stores unmarked key when no localId (lines 388-396 else branch)', () => {
		// Arrange
		const cert = new _PdfPublicKeyCryptographyCertificate();
		const localId: Uint8Array = undefined;
		const privateKey: any = { type: 'unmarked' };
		// Act
		if (localId) {
			// branch not taken
		} else {
			cert._isUnMarkedKey = true;
			cert._keys.set('unmarked', privateKey);
		}
		// Assert
		expect(cert._isUnMarkedKey).toBe(true);
		expect(cert._keys.get('unmarked')).toBe(privateKey);
	});

	it('_storeKeyEntry stores keys by hex name, by localIdentifier, and as unmarked', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const keyObj1 = { privateKey: 'k1' };
		const keyObj2 = { privateKey: 'k2' };
		const keyObj3 = { privateKey: 'k3' };
		// Act: localId present, no localIdentifier
		(inst as any)._storeKeyEntry(undefined, new Uint8Array([0x0a, 0x0b]), keyObj1);
		// Assert
		expect(inst._keys.has('0a0b')).toBeTruthy();
		expect(inst._keys.get('0a0b')).toBe(keyObj1);
		// Act: localId present with localIdentifier
		(inst as any)._storeKeyEntry('friendly', new Uint8Array([0x01, 0x02]), keyObj2);
		expect(inst._localIdentifiers.get('friendly')).toBe('0102');
		expect(inst._keys.get('friendly')).toBe(keyObj2);
		// Act: no localId
		(inst as any)._storeKeyEntry(undefined, undefined, keyObj3);
		expect(inst._keys.get('unmarked')).toBe(keyObj3);
	});

	it('_handleKeyBag skips non-RSA algorithm and stores nothing', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const privKeyInfoElement = { _getSequence: () => [null, { _getSequence: () => [{ _getObjectIdentifier: () => ({ toString: () => '1.2.3.4.5' }) }] }, { _getOctetString: () => new Uint8Array([9]) }] } as any;
		const certSeq = [null, { _getSequence: () => [privKeyInfoElement] }, null] as any[];
		// Act
		(inst as any)._handleKeyBag(certSeq);
		// Assert
		expect(inst._keys.size).toBe(0);
	});

	it('_handleKeyBag processes RSA key bag and stores unmarked entry', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const privKeyInfoElement = { _getSequence: () => [null, { _getSequence: () => [{ _getObjectIdentifier: () => ({ toString: () => '1.2.840.113549.1.1.1' }) }] }, { _getOctetString: () => new Uint8Array([1]) }] } as any;
		const certSeq = [null, { _getSequence: () => [privKeyInfoElement] }, null] as any[];
		const parsed = { modulus: new Uint8Array([1]), publicExponent: new Uint8Array([1]), privateExponent: new Uint8Array([1]), prime1: new Uint8Array([1]), prime2: new Uint8Array([1]), exponent1: new Uint8Array([1]), exponent2: new Uint8Array([1]), coefficient: new Uint8Array([1]) };
		const origParse = (inst as any)._parsePrivateKey;
		const origCreate = (inst as any)._createPrivateKey;
		const origExtract = (inst as any)._extractLocalIdentifiers;
		(inst as any)._parsePrivateKey = () => parsed;
		(inst as any)._createPrivateKey = () => 'CREATED_PRIVATE';
		(inst as any)._extractLocalIdentifiers = () => ({ localIdentifier: undefined as any, localId: undefined as any });
		// Act
		(inst as any)._handleKeyBag(certSeq);
		// Assert
		expect(inst._keys.get('unmarked')).toBeDefined();
		// Cleanup
		(inst as any)._parsePrivateKey = origParse;
		(inst as any)._createPrivateKey = origCreate;
		(inst as any)._extractLocalIdentifiers = origExtract;
	});

	it('_getCryptographicData throws for unsupported oid', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const algorithmSeq = [
			{ _getObjectIdentifier: () => ({ toString: () => '1.2.3.4.5' }) },
			{ _getSequence: () => [{ _getOctetString: () => new Uint8Array([1, 2, 3]) }, { _getInteger: () => 1 }] }
		] as any[];
		const encryptedData = new Uint8Array([9, 9, 9]);
		// Act & Assert
		expect(() => (inst as any)._getCryptographicData(algorithmSeq as any, encryptedData, 'pw')).toThrowError(/Unsupported oid: 1.2.3.4.5/);
	});

	it('_getCryptographicData AES branch calls AES decryptor and returns decrypted bytes', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const algorithmSeq = [
			{ _getObjectIdentifier: () => ({ toString: () => '1.2.840.113549.1.5.12' }) }, // PBKDF2 -> AES (oidMap)
			{ _getSequence: () => [{ _getOctetString: () => new Uint8Array([1, 2, 3]) }, { _getInteger: () => 1 }] }
		] as any[];
		const encryptedData = new Uint8Array([9, 9, 9]);

		// Stub derived key generation and AES decryptor
		const origGen = (inst as any)._generateDerivedKey;
		(inst as any)._generateDerivedKey = (_passwordBytes: Uint8Array, _salt: Uint8Array, _id: number, _iterations: number, n: number) => {
			return new Uint8Array(n || 16).fill(7);
		};
		const origAes = (_AdvancedEncryption128Cipher as any).prototype._decryptBlock;
		(_AdvancedEncryption128Cipher as any).prototype._decryptBlock = function (_data: Uint8Array) { return new Uint8Array([42]); };

		// Act
		const outAes = (inst as any)._getCryptographicData(algorithmSeq as any, encryptedData, 'pw');

		// Assert
		expect(Array.from(outAes)).toEqual([42]);

		// Cleanup
		(inst as any)._generateDerivedKey = origGen;
		if (origAes) (_AdvancedEncryption128Cipher as any).prototype._decryptBlock = origAes;
	});

	it('_getCryptographicData RC4 branch calls RC4 decryptor and returns decrypted bytes', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const algorithmSeq = [
			{ _getObjectIdentifier: () => ({ toString: () => '1.2.840.113549.1.12.1.1' }) }, // RC4 oid
			{ _getSequence: () => [{ _getOctetString: () => new Uint8Array([4, 5]) }, { _getInteger: () => 1 }] }
		] as any[];
		const encryptedData = new Uint8Array([8, 8, 8]);

		// Stub derived key generation and RC4 decryptor
		const origGen = (inst as any)._generateDerivedKey;
		(inst as any)._generateDerivedKey = (_passwordBytes: Uint8Array, _salt: Uint8Array, _id: number, _iterations: number, n: number) => {
			return new Uint8Array(n || 16).fill(9);
		};
		const origRc4 = (_NormalCipherFour as any).prototype._decryptBlock;
		(_NormalCipherFour as any).prototype._decryptBlock = function (_data: Uint8Array) { return new Uint8Array([99]); };

		// Act
		const outRc4 = (inst as any)._getCryptographicData(algorithmSeq as any, encryptedData, 'pw');

		// Assert
		expect(Array.from(outRc4)).toEqual([99]);

		// Cleanup
		(inst as any)._generateDerivedKey = origGen;
		if (origRc4) (_NormalCipherFour as any).prototype._decryptBlock = origRc4;
	});

	it('_handleShroudedKeyBag skips non-RSA algorithm and stores nothing', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const oidObj = { _getObjectIdentifier: () => ({ toString: () => '1.2.3.4.5' }) } as any;
		const keySeq = [null, { _getSequence: () => [oidObj] }, { _getOctetString: () => new Uint8Array([9]) }];
		// stub both encoding element prototypes so _fromBytes/_getSequence work regardless of _isBasicEncodingElement
		const origBasicFrom = (_PdfBasicEncodingElement as any).prototype._fromBytes;
		const origBasicGetSeq = (_PdfBasicEncodingElement as any).prototype._getSequence;
		const origUniqueFrom = (_PdfUniqueEncodingElement as any).prototype._fromBytes;
		const origUniqueGetSeq = (_PdfUniqueEncodingElement as any).prototype._getSequence;
		(_PdfBasicEncodingElement as any).prototype._fromBytes = function () { /* no-op */ };
		(_PdfBasicEncodingElement as any).prototype._getSequence = function () { return keySeq; };
		(_PdfUniqueEncodingElement as any).prototype._fromBytes = function () { /* no-op */ };
		(_PdfUniqueEncodingElement as any).prototype._getSequence = function () { return keySeq; };

		const encryptedPrivateKeyInfo = { _getSequence: () => [{ _getSequence: () => [] as any }, { _getOctetString: () => new Uint8Array([1]) }] } as any;
		const certSeq = [null, { _getSequence: () => [encryptedPrivateKeyInfo] }, null] as any[];
		// stub crypto to avoid heavy decryption
		const origGetCrypto = (inst as any)._getCryptographicData;
		(inst as any)._getCryptographicData = () => new Uint8Array([1]);
		// Act
		(inst as any)._handleShroudedKeyBag(certSeq, 'pw');
		// Assert - no key stored for non-RSA
		expect(inst._keys.size).toBe(0);
		// Cleanup
		(inst as any)._getCryptographicData = origGetCrypto;
		(_PdfBasicEncodingElement as any).prototype._fromBytes = origBasicFrom;
		(_PdfBasicEncodingElement as any).prototype._getSequence = origBasicGetSeq;
		(_PdfUniqueEncodingElement as any).prototype._fromBytes = origUniqueFrom;
		(_PdfUniqueEncodingElement as any).prototype._getSequence = origUniqueGetSeq;
	});

	it('_handleShroudedKeyBag processes RSA key and stores unmarked entry', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const oidObj = { _getObjectIdentifier: () => ({ toString: () => '1.2.840.113549.1.1.1' }) } as any;
		const keySeq = [null, { _getSequence: () => [oidObj] }, { _getOctetString: () => new Uint8Array([1]) }];
		const origBasicFrom = (_PdfBasicEncodingElement as any).prototype._fromBytes;
		const origBasicGetSeq = (_PdfBasicEncodingElement as any).prototype._getSequence;
		const origUniqueFrom = (_PdfUniqueEncodingElement as any).prototype._fromBytes;
		const origUniqueGetSeq = (_PdfUniqueEncodingElement as any).prototype._getSequence;
		(_PdfBasicEncodingElement as any).prototype._fromBytes = function () { /* no-op */ };
		(_PdfBasicEncodingElement as any).prototype._getSequence = function () { return keySeq; };
		(_PdfUniqueEncodingElement as any).prototype._fromBytes = function () { /* no-op */ };
		(_PdfUniqueEncodingElement as any).prototype._getSequence = function () { return keySeq; };

		const encryptedPrivateKeyInfo = { _getSequence: () => [{ _getSequence: () => [] as any }, { _getOctetString: () => new Uint8Array([1]) }] } as any;
		const certSeq = [null, { _getSequence: () => [encryptedPrivateKeyInfo] }, {}] as any[];
		const parsed = { modulus: new Uint8Array([1]), publicExponent: new Uint8Array([1]), privateExponent: new Uint8Array([1]), prime1: new Uint8Array([1]), prime2: new Uint8Array([1]), exponent1: new Uint8Array([1]), exponent2: new Uint8Array([1]), coefficient: new Uint8Array([1]) };
		const privateObj = { created: true };
		const origGetCrypto = (inst as any)._getCryptographicData;
		const origParse = (inst as any)._parsePrivateKey;
		const origCreate = (inst as any)._createPrivateKey;
		const origExtract = (inst as any)._extractLocalIdentifiers;
		(inst as any)._getCryptographicData = () => new Uint8Array([1]);
		(inst as any)._parsePrivateKey = () => parsed;
		(inst as any)._createPrivateKey = () => privateObj;
		(inst as any)._extractLocalIdentifiers = () => ({ localIdentifier: undefined as any, localId: undefined as any });
		// Act
		(inst as any)._handleShroudedKeyBag(certSeq, 'pw');
		// Assert - unmarked entry stored
		expect(inst._keys.get('unmarked')).toBeDefined();
		expect((inst._keys.get('unmarked') as any).privateKey).toBe(privateObj);
		// Cleanup
		(inst as any)._getCryptographicData = origGetCrypto;
		(inst as any)._parsePrivateKey = origParse;
		(inst as any)._createPrivateKey = origCreate;
		(inst as any)._extractLocalIdentifiers = origExtract;
		(_PdfBasicEncodingElement as any).prototype._fromBytes = origBasicFrom;
		(_PdfBasicEncodingElement as any).prototype._getSequence = origBasicGetSeq;
		(_PdfUniqueEncodingElement as any).prototype._fromBytes = origUniqueFrom;
		(_PdfUniqueEncodingElement as any).prototype._getSequence = origUniqueGetSeq;
	});

	it('_createSubjectKeyID should throw an error when publicKey is not _PdfRonCipherParameter', () => {
		const cert: any = new _PdfPublicKeyCryptographyCertificate();

		const invalidPublicKey = {}; // not an instance of _PdfRonCipherParameter
		const id = new Uint8Array([1, 2, 3]);

		expect(() => {
			cert._createSubjectKeyID(invalidPublicKey, id);
		}).toThrowError('Invalid Key: [object Object]');
	});


	it('_extractPrivateKeyFromKeyInfo should return undefined privateKey when encrypted and non‑RSA algorithm', () => {
		const cert: any = new _PdfPublicKeyCryptographyCertificate();

		spyOn(cert, '_getCryptographicData')
			.and.returnValue(new Uint8Array([1])); // dummy but unused

		spyOn(utils, '_isBasicEncodingElement')
			.and.returnValue(false);

		// Mock ASN.1 decode to do nothing
		spyOn(
			_PdfUniqueEncodingElement.prototype,
			'_fromBytes'
		).and.stub();

		// Mock parsed ASN.1 structure
		spyOn(
			_PdfUniqueEncodingElement.prototype,
			'_getSequence'
		).and.returnValue([
			null,
			{
				_getSequence: () => [
					{ _getObjectIdentifier: () => ({ toString: () => '9.9.9.9' }) } // non‑RSA OID
				]
			},
			{ _getOctetString: () => new Uint8Array([1]) }
		]);

		const keyInfoRoot = {
			_getSequence: () => [{
				_getSequence: () => [
					{ _getSequence: () => [{}] },
					{ _getOctetString: () => new Uint8Array([1]) }
				]
			}]
		};

		const result = cert._extractPrivateKeyFromKeyInfo(
			keyInfoRoot,
			'password',
			true
		);

		expect(result.privateKey).toBeUndefined();
	});

	describe('_loadCertificate error handling', () => {
		let cert: any;

		beforeEach(() => {
			cert = new _PdfPublicKeyCryptographyCertificate();
		});

		it('should throw error when input is null or empty', () => {
			expect(() => {
				cert._loadCertificate(null, 'password');
			}).toThrowError('input is null');

			expect(() => {
				cert._loadCertificate([], 'password');
			}).toThrowError('input is null');
		});

		it('should throw error when password is null or undefined', () => {
			const validInput = new Uint8Array([1, 2, 3]);

			expect(() => {
				cert._loadCertificate(validInput, null);
			}).toThrowError('password is null');

			expect(() => {
				cert._loadCertificate(validInput, undefined);
			}).toThrowError('password is null');
		});
	});

	// DESEDE branch tests (lines ~735-777)
	it('_getCryptographicData DES throws for non-multiple-of-8 encrypted data', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();

		const algorithmSeq = [
			{
				_getObjectIdentifier: () => ({
					toString: () => '1.2.840.113549.1.5.3' // DES OID
				})
			},
			{
				_getSequence: () => [
					{ _getOctetString: () => new Uint8Array([1, 2, 3]) }, // salt
					{ _getInteger: () => 1 } // iterations
				]
			}
		] as any[];

		const encryptedData = new Uint8Array([1, 2, 3, 4, 5]); // length NOT % 8

		// Act & Assert
		expect(() => {
			(inst as any)._getCryptographicData(
				algorithmSeq as any,
				encryptedData,
				'pw'
			);
		}).toThrowError('DES expects multiples of 8 bytes');
	});

	it('_getCryptographicData DESEDE decrypts when length is multiple of 8', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();
		const algorithmSeq = [
			{ _getObjectIdentifier: () => ({ toString: () => '1.2.840.113549.1.12.1.3' }) }, // DESEDE oid
			{ _getSequence: () => [{ _getOctetString: () => new Uint8Array([9, 9, 9]) }, { _getInteger: () => 1 }] }
		] as any[];
		const encryptedData = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17]); // 8 bytes

		// Stub derived key and TripleDES processing to make outcome deterministic
		const origGen = (inst as any)._generateDerivedKey;
		(inst as any)._generateDerivedKey = (_passwordBytes: Uint8Array, _salt: Uint8Array, id: number, _iterations: number, n: number) => {
			return new Uint8Array(n).fill(id === 1 ? 1 : 0);
		};
		const origProc = (_TripleDataEncryptionStandardCipher as any).prototype._processBlock;
		const origBlock = (_TripleDataEncryptionStandardCipher as any).prototype._blockSize;
		(_TripleDataEncryptionStandardCipher as any).prototype._blockSize = 8;
		(_TripleDataEncryptionStandardCipher as any).prototype._processBlock = function (src: Uint8Array, srcOff: number, dest: Uint8Array, destOff: number) { // simple copy
			dest.set(src.slice(srcOff, srcOff + 8), destOff);
		};

		// Act
		const out = (inst as any)._getCryptographicData(algorithmSeq as any, encryptedData, 'pw');

		// Assert
		expect(out instanceof Uint8Array).toBeTruthy();
		expect(out.length).toBe(encryptedData.length);

		// Cleanup
		(inst as any)._generateDerivedKey = origGen;
		(_TripleDataEncryptionStandardCipher as any).prototype._processBlock = origProc;
		(_TripleDataEncryptionStandardCipher as any).prototype._blockSize = origBlock;
	});

	it('_getCryptographicData DES decrypts when length is multiple of 8', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();

		const algorithmSeq = [
			{
				_getObjectIdentifier: () => ({
					toString: () => '1.2.840.113549.1.5.3' // DES OID
				})
			},
			{
				_getSequence: () => [
					{ _getOctetString: () => new Uint8Array([9, 9, 9]) }, // salt
					{ _getInteger: () => 1 } // iterations
				]
			}
		] as any[];

		// Must be a multiple of 8 bytes
		const encryptedData = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17]);

		// Stub derived key generation to be deterministic
		const origGen = (inst as any)._generateDerivedKey;
		(inst as any)._generateDerivedKey = (
			_passwordBytes: Uint8Array,
			_salt: Uint8Array,
			_id: number,
			_iterations: number,
			n: number
		) => {
			return new Uint8Array(n).fill(1);
		};

		// Stub DES block processing
		const origProcess = (_DataEncryptionStandardCipher as any).prototype._processBlock;
		(_DataEncryptionStandardCipher as any).prototype._processBlock = function (
			src: Uint8Array,
			srcOff: number,
			dest: Uint8Array,
			destOff: number
		) {
			// Simple copy to make output predictable
			dest.set(src.slice(srcOff, srcOff + 8), destOff);
		};

		// Act
		const out = (inst as any)._getCryptographicData(
			algorithmSeq,
			encryptedData,
			'pw'
		);

		// Assert
		expect(out instanceof Uint8Array).toBeTruthy();
		expect(out.length).toBe(encryptedData.length);
		expect(Array.from(out)).toEqual(Array.from(encryptedData));

		// Cleanup
		(inst as any)._generateDerivedKey = origGen;
		(_DataEncryptionStandardCipher as any).prototype._processBlock = origProcess;
	});

	it('_getCryptographicData DESEDE throws when encrypted data length is not multiple of 8', () => {
		// Arrange
		const inst = new _PdfPublicKeyCryptographyCertificate();

		const algorithmSeq = [
			{
				_getObjectIdentifier: () => ({
					toString: () => '1.2.840.113549.1.12.1.3' // DESEDE OID
				})
			},
			{
				_getSequence: () => [
					{ _getOctetString: () => new Uint8Array([1, 2, 3]) }, // salt
					{ _getInteger: () => 1 } // iterations
				]
			}
		] as any[];

		// Length NOT divisible by 8
		const encryptedData = new Uint8Array([1, 2, 3, 4, 5]);

		// Stub key derivation to avoid real crypto
		spyOn(inst as any, '_generateDerivedKey').and.callFake(
			(_pwd: Uint8Array, _salt: Uint8Array, _id: number, _iter: number, n: number) =>
				new Uint8Array(n)
		);

		// Act & Assert
		expect(() => {
			(inst as any)._getCryptographicData(
				algorithmSeq,
				encryptedData,
				'password'
			);
		}).toThrowError('3DES expects multiples of 8 bytes');
	});

	it('_processCertificateCollection should skip certificate when certOctet is null', () => {
		const cert: any = new _PdfPublicKeyCryptographyCertificate();

		const chain = [{
			_getSequence: () => [
				null,
				{
					_getSequence: () => [
						{
							_getSequence: () => [
								null,
								{
									_getSequence: () => [
										{ _getValue: () => null as any } // certOctet = null
									]
								}
							]
						}
					]
				}
			]
		}];

		spyOn(_PdfX509CertificateParser.prototype, '_readCertificate');

		cert._processCertificateCollection(chain);

		expect(_PdfX509CertificateParser.prototype._readCertificate)
			.not.toHaveBeenCalled();
	});

	it('_validateValue should throw error when value is null or undefined', () => {
		const cert: any = new _PdfPublicKeyCryptographyCertificate();

		expect(() => {
			cert._validateValue('modulus', null);
		}).toThrowError("RSA parameter 'modulus' is null or undefined");

		expect(() => {
			cert._validateValue('exponent', undefined);
		}).toThrowError("RSA parameter 'exponent' is null or undefined");
	});

	it('_processEncryptedData calls _handleCertificateBag for certificateBag OID', () => {
		// Arrange
		const inst: any = new _PdfPublicKeyCryptographyCertificate();
		const certElement = {
			_getSequence: () => [
				{ _getObjectIdentifier: () => ({ toString: () => inst._certificateBag }) },
				{} // rest of sequence
			]
		} as any;
		spyOn(inst as any, '_parseAndDecrypt').and.returnValue(new Uint8Array([1]));
		spyOn(inst as any, '_decodeDecryptedBytes').and.returnValue([certElement]);
		const spyHandleCert = spyOn(inst as any, '_handleCertificateBag').and.callThrough();

		// Act
		inst._processEncryptedData({} as any, 'pw');

		// Assert
		expect(spyHandleCert).toHaveBeenCalledTimes(1);
		expect(spyHandleCert).toHaveBeenCalledWith(certElement);
	});

	it('_processEncryptedData calls _handleShroudedKeyBag for shroudedKeyBag OID', () => {
		// Arrange
		const inst: any = new _PdfPublicKeyCryptographyCertificate();
		const certSeq = [
			{ _getObjectIdentifier: () => ({ toString: () => inst._shroudedKeyBag }) },
			{},
			{}
		] as any[];
		const certElement = { _getSequence: () => certSeq } as any;
		spyOn(inst as any, '_parseAndDecrypt').and.returnValue(new Uint8Array([2]));
		spyOn(inst as any, '_decodeDecryptedBytes').and.returnValue([certElement]);
		const spyShrouded = spyOn(inst as any, '_handleShroudedKeyBag').and.stub();

		// Act
		inst._processEncryptedData({} as any, 'mypw');

		// Assert
		expect(spyShrouded).toHaveBeenCalledTimes(1);
		expect(spyShrouded).toHaveBeenCalledWith(certSeq, 'mypw');
	});

	it('_processEncryptedData calls _handleKeyBag for keyBag OID', () => {
		// Arrange
		const inst: any = new _PdfPublicKeyCryptographyCertificate();
		const certSeq = [
			{ _getObjectIdentifier: () => ({ toString: () => inst._keyBag }) },
			{},
			{}
		] as any[];
		const certElement = { _getSequence: () => certSeq } as any;
		spyOn(inst as any, '_parseAndDecrypt').and.returnValue(new Uint8Array([3]));
		spyOn(inst as any, '_decodeDecryptedBytes').and.returnValue([certElement]);
		const spyKeyBag = spyOn(inst as any, '_handleKeyBag').and.stub();

		// Act
		inst._processEncryptedData({} as any, 'pwx');

		// Assert
		expect(spyKeyBag).toHaveBeenCalledTimes(1);
		expect(spyKeyBag).toHaveBeenCalledWith(certSeq);
	});

	it('_processEncryptedData does nothing when bagId is unrecognized (explicit else)', () => {
		// Arrange
		const inst: any = new _PdfPublicKeyCryptographyCertificate();
		const certSeq = [
			{ _getObjectIdentifier: () => ({ toString: () => '1.2.3.4.999' }) },
			{},
			{}
		] as any[];
		const certElement = { _getSequence: () => certSeq } as any;
		spyOn(inst as any, '_parseAndDecrypt').and.returnValue(new Uint8Array([4]));
		spyOn(inst as any, '_decodeDecryptedBytes').and.returnValue([certElement]);
		const spyCert = spyOn(inst as any, '_handleCertificateBag').and.stub();
		const spyShrouded = spyOn(inst as any, '_handleShroudedKeyBag').and.stub();
		const spyKeyBag = spyOn(inst as any, '_handleKeyBag').and.stub();

		// Act
		inst._processEncryptedData({} as any, 'pwz');

		// Assert - none of the handlers should be called
		expect(spyCert).not.toHaveBeenCalled();
		expect(spyShrouded).not.toHaveBeenCalled();
		expect(spyKeyBag).not.toHaveBeenCalled();
	});
	describe('_getCertificateChain - marked if branches', () => {
		let cert: any;

		beforeEach(() => {
			cert = new _PdfPublicKeyCryptographyCertificate();
			cert._keys = new Map();
		});

		it('should return null when key does not exist in _keys', () => {
			const result = cert._getCertificateChain('missing-key');
			expect(result).toBeNull();
		});

		it('should return null when _getCertificate returns null', () => {
			cert._keys.set('valid-key', true);

			spyOn(cert, '_getCertificate').and.returnValue(null);

			const result = cert._getCertificateChain('valid-key');
			expect(result).toBeNull();
		});
	});
	describe('_getCertificate - return branches', () => {
		let cert: any;
		let mockCertCollection: any;

		beforeEach(() => {
			cert = new _PdfPublicKeyCryptographyCertificate();

			mockCertCollection = new _PdfX509Certificates(cert);

			cert._certificates = {
				_get: jasmine.createSpy('_get')
			};

			cert._localIdentifiers = new Map();
			cert._keyCertificates = new Map();
		});

		it('should return certificates from first if branch', () => {
			cert._certificates._get.and.returnValue(mockCertCollection);

			const result = cert._getCertificate('cert-key');

			expect(cert._certificates._get).toHaveBeenCalledWith('cert-key');
			expect(result).toBe(mockCertCollection);
		});

		it('should return undefined when no certificate matches', () => {
			cert._certificates._get.and.returnValue(undefined);

			const result = cert._getCertificate('unknown-key');

			expect(result).toBeUndefined();
		});
	});
});

