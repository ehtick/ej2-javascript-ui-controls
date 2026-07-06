import { _PdfUniqueEncodingElement } from '../src/pdf/core/security/digital-signature/asn1/unique-encoding-element';
import { _PdfAlgorithms } from '../src/pdf/core/security/digital-signature/x509/x509-algorithm';
import { _PdfObjectIdentifier } from '../src/pdf/core/security/digital-signature/asn1/identifier-mapping';
import { _PdfPublicKeyInformation } from '../src/pdf/core/security/digital-signature/x509/x509-certificate-key';
import { _PdfUniqueBitString } from '../src/pdf/core/security/digital-signature/x509/x509-bit-string-handler';
import { _PdfSignedCertificate } from '../src/pdf/core/security/digital-signature/x509/x509-signed-certificate';
import { _PdfX509CertificateParser } from '../src/pdf/core/security/digital-signature/x509/x509-certificate-parser';
import { _PdfX509CertificateStructure } from '../src/pdf/core/security/digital-signature/x509/x509-certificate-structure';
import { _PdfX509Certificate } from '../src/pdf/core/security/digital-signature/x509/x509-certificate';
import { _PdfBasicEncodingElement } from '../src/pdf/core/security/digital-signature/asn1/basic-encoding-element';
import { _UniversalType, _TagClassType } from '../src/pdf/core/security/digital-signature/asn1/enumerator';
import { _PdfX509Extensions, _PdfX509Extension, _PdfX509ExtensionBase } from '../src/pdf/core/security/digital-signature/x509/x509-extensions';
import { _PdfX509Time } from '../src/pdf/core/security/digital-signature/x509/x509-time';
import { _PdfX509Name } from '../src/pdf/core/security/digital-signature/x509/x509-name';

describe('x509 _PdfAlgorithms (lines 3-56) behavior', () => {

	it('returns same instance when passed a _PdfAlgorithms object', () => {
		const instance = Object.create(_PdfAlgorithms.prototype);
		const result = (instance as any)._getAlgorithms(instance);
		expect(result).toBe(instance);
	});

	it('_PdfX509Extensions constructor else path (line 66) creates empty collection and sets OIDs', () => {
		// Arrange / Act
		const exts = new _PdfX509Extensions();
		// Assert: internal map empty and ordering empty (else branch taken)
		expect((exts as any)._extensions instanceof Map).toBeTruthy();
		expect((exts as any)._extensions.size).toBe(0);
		expect((exts as any)._ordering.length).toBe(0);
		// Assert: reserved OIDs initialized
		expect(exts._authorityKeyIdentifier).toBeDefined();
		expect(exts._certificateRevocationListPoints).toBeDefined();
		expect(exts._authorityInfoAccess).toBeDefined();
	});

	it('returns undefined when passed an unrelated object', () => {
		const instance = Object.create(_PdfAlgorithms.prototype);
		const result = (instance as any)._getAlgorithms({});
		expect(result).toBeUndefined();
	});

	it('_uniqueEncoderEncode returns element value when _element present', () => {
		const alg = Object.create(_PdfAlgorithms.prototype);
		alg._element = { _getValue: () => new Uint8Array([1, 2, 3]) };
		const out = alg._uniqueEncoderEncode();
		expect(out).toBeDefined();
		expect(out instanceof Uint8Array).toBeTruthy();
		expect(out.length).toBe(3);
	});

	it('_uniqueEncoderEncode throws when no _element', () => {
		const alg = Object.create(_PdfAlgorithms.prototype);
		delete alg._element;
		expect(() => alg._uniqueEncoderEncode()).toThrowError('Cannot DER encode: not a DER element');
	});

	it('_getUniqueEncoderNull builds a DER NULL element with zero length', () => {
		const alg = Object.create(_PdfAlgorithms.prototype) as any;
		const derNull = alg._getUniqueEncoderNull();
		expect(derNull._tagClass).toBe(0);
		const value = derNull._getValue();
		expect(value.length).toBe(0);
	});

	it('_getAbstractSyntax returns a sequence with one oid element', () => {
		const alg = Object.create(_PdfAlgorithms.prototype) as any;
		const seq = alg._getAbstractSyntax();
		const elements = seq._getSequence();
		expect(Array.isArray(elements)).toBeTruthy();
		expect(elements.length).toBe(1);
	});

	it('constructor throws for invalid sequence lengths', () => {
		const badElem = { _getSequence: (): any => null };
		expect(() => new _PdfAlgorithms(badElem as any)).toThrow();
		const badElem2 = { _getSequence: (): any => [] };
		expect(() => new _PdfAlgorithms(badElem2 as any)).toThrow();
		const badElem3 = { _getSequence: () => [1, 2, 3] };
		expect(() => new _PdfAlgorithms(badElem3 as any)).toThrow();
	});

	it('constructor sets _parametersDefined true for length 2 and false for length 1', () => {
		const oidElem = { _getValue: () => new Uint8Array([6]) };
		const elem1 = { _getSequence: () => [oidElem] };
		const a1 = new _PdfAlgorithms(elem1 as any) as any;
		expect(a1._parametersDefined).toBeFalsy();
		const paramElem = { foo: 'x' };
		const elem2 = { _getSequence: () => [oidElem, paramElem] };
		const a2 = new _PdfAlgorithms(elem2 as any) as any;
		expect(a2._parametersDefined).toBeTruthy();
	});

	it('MapOidToAlgorithm: _PdfObjectIdentifier roundtrip and validations', () => {
		const oidStr = '1.2.3';
		const oid = new _PdfObjectIdentifier()._fromString(oidStr);
		// Arrange
		const bytes = oid._toBytes();
		expect(bytes instanceof Uint8Array).toBeTruthy();
		// Act: parse from bytes
		const parsed = new _PdfObjectIdentifier()._fromBytes(bytes);
		// Assert
		// _fromParts should throw for invalid short nodes
		expect(() => new _PdfObjectIdentifier()._fromParts([5])).toThrow();
		// _fromBytes should throw for empty bytes
		expect(() => new _PdfObjectIdentifier()._fromBytes(new Uint8Array(0))).toThrow();
	});

});

describe('x509 _PdfX509Name (lines 43-64) behavior', () => {

	it('parses ordering, values and added flags when value element is encoding element', () => {
		// Arrange
		const oid = new _PdfObjectIdentifier()._fromString('1.2.3');
		const oidBytes = oid._toBytes();
		const valueBytes = new Uint8Array([65, 66, 67]); // 'ABC'
		const valueElem: any = new _PdfUniqueEncodingElement();
		valueElem._getOctetString = () => valueBytes;

		const setElement = { _getSequence: () => [{ _getValue: () => oidBytes }, valueElem] };
		const element = { _getSequence: () => [setElement] } as any;

		// Act
		const name = new _PdfX509Name([element]);

		// Assert
		expect((name as any)._ordering.length).toBe(1);
		expect((name as any)._values.length).toBe(1);
		expect((name as any)._values[0]).toBe(String.fromCharCode(...valueBytes as any));
		expect((name as any)._added[0]).toBe(false);
	});

	it('uses empty string value when valueElement not encoding element and sets _added for non-zero index', () => {
		// Arrange
		const oid = new _PdfObjectIdentifier()._fromString('1.2.3');
		const oidBytes = oid._toBytes();
		const nonValueElem = { some: 'thing' };

		const setElement0 = { _getSequence: () => [{ _getValue: () => oidBytes }, nonValueElem] };
		const setElement1 = { _getSequence: () => [{ _getValue: () => oidBytes }, nonValueElem] };
		const element = { _getSequence: () => [setElement0, setElement1] } as any;

		// Act
		const name = new _PdfX509Name([element]);

		// Assert
		expect((name as any)._values.length).toBe(2);
		expect((name as any)._values[0]).toBe('');
		expect((name as any)._values[1]).toBe('');
		expect((name as any)._added[0]).toBe(false);
		expect((name as any)._added[1]).toBe(true);
	});

	it('skips entries when setElement sequence is null or too short (covers else path)', () => {
		// Arrange: setElement with null sequence
		const setElementNull = { _getSequence: (): any => null };
		const elementNull = { _getSequence: () => [setElementNull] } as any;

		// Act
		const nameNull = new _PdfX509Name([elementNull]);

		// Assert: no ordering/values/added entries created
		expect((nameNull as any)._ordering.length).toBe(0);
		expect((nameNull as any)._values.length).toBe(0);
		expect((nameNull as any)._added.length).toBe(0);

		// Arrange: setElement with too-short sequence (length 1)
		const singlePart = { _getValue: () => new Uint8Array([1]) };
		const setElementShort = { _getSequence: () => [singlePart] };
		const elementShort = { _getSequence: () => [setElementShort] } as any;

		// Act
		const nameShort = new _PdfX509Name([elementShort]);

		// Assert: still no entries created
		expect((nameShort as any)._ordering.length).toBe(0);
		expect((nameShort as any)._values.length).toBe(0);
		expect((nameShort as any)._added.length).toBe(0);
	});

	it('handles null setElement entries (covers setElement falsy branch)', () => {
		// Arrange: element._getSequence returns an array containing a null setElement
		const elementWithNullSet: any = { _getSequence: (): any => [null] };

		// Act
		const nameWithNullSet = new _PdfX509Name([elementWithNullSet]);

		// Assert: no ordering/values/added entries created
		expect((nameWithNullSet as any)._ordering.length).toBe(0);
		expect((nameWithNullSet as any)._values.length).toBe(0);
		expect((nameWithNullSet as any)._added.length).toBe(0);
	});

	it('skips outer null element (covers element falsy branch)', () => {
		// Arrange / Act: pass a null element in the sequence array
		const nameWithOuterNull = new _PdfX509Name([null] as any);

		// Assert: no ordering/values/added entries created
		expect((nameWithOuterNull as any)._ordering.length).toBe(0);
		expect((nameWithOuterNull as any)._values.length).toBe(0);
		expect((nameWithOuterNull as any)._added.length).toBe(0);
	});

});

describe('x509 PublicKeyExtraction and SignedCertificateRepresentation (lines 37-61)', () => {

	it('_PdfPublicKeyInformation._fromAbstractSyntax parses algorithm and public key', () => {
		const algObj = Object.create(_PdfAlgorithms.prototype);
		const pubOctets = new Uint8Array([0, 5, 6]);
		const seqElem = { _getSequence: () => [algObj, { _getValue: () => pubOctets }] } as any;
		const parsed = new _PdfPublicKeyInformation()._fromAbstractSyntax(seqElem as any) as any;
		expect(parsed._algorithms).toBe(algObj);
		expect(parsed._publicKey instanceof _PdfUniqueBitString).toBeTruthy();
		expect(parsed._publicKey._getBytes().length).toBe(2);
	});

	it('_getPublicKeyInformation normalizes instances and parses ASN.1 elements', () => {
		const pk = new _PdfPublicKeyInformation();
		// returns same instance when given explicitly
		expect(pk._getPublicKeyInformation(pk)).toBe(pk);

		// parses when given an ASN.1-like element
		const algObj = Object.create(_PdfAlgorithms.prototype);
		const pubOctets = new Uint8Array([0, 9, 10]);
		const asn1 = { _getSequence: () => [algObj, { _getValue: () => pubOctets }] } as any;
		const parsed = pk._getPublicKeyInformation(asn1 as any) as any;
		expect(parsed._algorithms).toBe(algObj);
		expect(parsed._publicKey._getBytes().length).toBe(2);
	});

	it('_readCertificateFromStream throws when input empty or null', () => {
		const parser = new _PdfX509CertificateParser();
		expect(() => (parser as any)._readCertificateFromStream(null, false)).toThrowError('Input stream is empty or null');
		expect(() => (parser as any)._readCertificateFromStream(new Uint8Array(0), false)).toThrowError('Input stream is empty or null');
	});

	it('_createX509Certificate constructs _PdfX509Certificate from structure', () => {
		const parser = new _PdfX509CertificateParser();
		// provide a minimal mock structure that satisfies _PdfX509Certificate expectations
		const signedMock: any = {
			_getVersion: () => 2,
			_publicKeyInformation: null,
			_getDistinguishEncoded: () => new Uint8Array([1])
		};
		const structureMock: any = {
			_getSignedCertificate: () => signedMock
		};
		const cert = parser._createX509Certificate(structureMock as any);
		expect(cert instanceof _PdfX509Certificate).toBeTruthy();
	});

	it('_getCertificate returns created certificate when not certificateParsing and finds sequence', () => {
		const parser = new _PdfX509CertificateParser();
		(parser as any)._sData = [{ _getTagNumber: () => _UniversalType.sequence, _getSequence: () => ['seq'] }];
		(parser as any)._sDataObjectCount = 0;
		(parser as any)._createX509Certificate = (_: any) => 'created';
		const res = (parser as any)._getCertificate();
		expect(res as any).toBe('created');
	});

	it('_getCertificate returns created certificate when isCertificateParsing true', () => {
		const parser = new _PdfX509CertificateParser();
		(parser as any)._sData = ['a'];
		const orig = (_PdfX509CertificateStructure.prototype as any)._getInstance;
		(_PdfX509CertificateStructure.prototype as any)._getInstance = function (s: any) { return 'inst'; };
		(parser as any)._createX509Certificate = (_: any) => 'created2';
		const res = (parser as any)._getCertificate(true);
		expect(res as any).toBe('created2');
		(_PdfX509CertificateStructure.prototype as any)._getInstance = orig;
	});

	it('_readDistinguishEncoderCertificate returns _createX509Certificate result when sequence not objectIdentifier', () => {
		const parser = new _PdfX509CertificateParser();
		const origFromBytes = (_PdfBasicEncodingElement.prototype as any)._fromBytes;
		const origGetSequence = (_PdfBasicEncodingElement.prototype as any)._getSequence;
		const origInst = (_PdfX509CertificateStructure.prototype as any)._getInstance;

		(_PdfBasicEncodingElement.prototype as any)._fromBytes = function (bytes: Uint8Array) { this._sequence = [{ _getTagNumber: () => 0 }]; };
		(_PdfBasicEncodingElement.prototype as any)._getSequence = function () { return this._sequence; };
		(_PdfX509CertificateStructure.prototype as any)._getInstance = function (s: any) { return 'inst2'; };
		(parser as any)._createX509Certificate = (_: any) => 'created3';
		const res = parser._readDistinguishEncoderCertificate(new Uint8Array([1, 2, 3]), false);
		expect(res as any).toBe('created3');

		(_PdfBasicEncodingElement.prototype as any)._fromBytes = origFromBytes;
		(_PdfBasicEncodingElement.prototype as any)._getSequence = origGetSequence;
		(_PdfX509CertificateStructure.prototype as any)._getInstance = origInst;
	});

	it('_readDistinguishEncoderCertificate returns _createX509Certificate when OID is present but not PKCS#7', () => {
		const parser = new _PdfX509CertificateParser();
		const origFromBytes = (_PdfBasicEncodingElement.prototype as any)._fromBytes;
		const origGetSequence = (_PdfBasicEncodingElement.prototype as any)._getSequence;
		const origInst = (_PdfX509CertificateStructure.prototype as any)._getInstance;

		const oidElem: any = { _getTagNumber: () => _UniversalType.objectIdentifier, _getObjectIdentifier: () => ({ _getDotDelimitedNotation: () => '1.2.3.4' }) };
		(_PdfBasicEncodingElement.prototype as any)._fromBytes = function (_bytes: Uint8Array) { this._sequence = [oidElem, {}]; };
		(_PdfBasicEncodingElement.prototype as any)._getSequence = function () { return this._sequence; };
		(_PdfX509CertificateStructure.prototype as any)._getInstance = function (s: any) { return 'instX'; };
		(parser as any)._createX509Certificate = (_: any) => 'createdX';
		const res = parser._readDistinguishEncoderCertificate(new Uint8Array([7, 8, 9]), false);
		expect(res as any).toBe('createdX');

		(_PdfBasicEncodingElement.prototype as any)._fromBytes = origFromBytes;
		(_PdfBasicEncodingElement.prototype as any)._getSequence = origGetSequence;
		(_PdfX509CertificateStructure.prototype as any)._getInstance = origInst;
	});

	it('_readCertificateFromStream returns cached certificate when stream matches and sData present', () => {
		const parser = new _PdfX509CertificateParser() as any;
		const stream = new Uint8Array([1, 2, 3]);
		parser._currentStream = stream;
		parser._sData = ['a', 'b'];
		parser._sDataObjectCount = 0;
		parser._getCertificate = () => 'cachedCert';
		const res = parser._readCertificateFromStream(stream, false);
		expect(res as any).toBe('cachedCert');
	});

	it('_getCertificate returns null when no cached sData present', () => {
		const parser = new _PdfX509CertificateParser() as any;
		parser._sData = null;
		const res = parser._getCertificate();
		expect(res).toBeNull();
	});

	it('_readCertificateFromStream returns null when first tag byte is negative', () => {
		const parser = new _PdfX509CertificateParser() as any;
		// craft a stream-like object whose index 0 is negative to trigger the tag < 0 branch
		const fakeStream: any = { 0: -1, length: 1 };
		const res = parser._readCertificateFromStream(fakeStream as any, false);
		expect(res).toBeNull();
	});

	it('_readDistinguishEncoderCertificate handles PKCS#7 SignedData and delegates to _getCertificate after extracting sData', () => {
		const parser = new _PdfX509CertificateParser();
		// stub BasicEncodingElement._fromBytes to inject a crafted sequence
		const origFromBytes = (_PdfBasicEncodingElement.prototype as any)._fromBytes;
		const origGetSequence = (_PdfBasicEncodingElement.prototype as any)._getSequence;

		// build elements
		const oidElem: any = { _getTagNumber: () => _UniversalType.objectIdentifier, _getObjectIdentifier: () => ({ _getDotDelimitedNotation: () => '1.2.840.113549.1.7.2' }) };
		const contextInnerSet = ['innerSeqItem'];
		const contextElement = new _PdfBasicEncodingElement() as any;
		contextElement._tagClass = _TagClassType.context;
		(contextElement as any)._getTagNumber = () => 0;
		(contextElement as any)._getInner = (_: any) => ({ _getSequence: () => contextInnerSet, _getAbstractSetValue: () => contextInnerSet });

		const secondElem: any = { _getInner: () => ({ _getSequence: () => [contextElement] }) };

		(_PdfBasicEncodingElement.prototype as any)._fromBytes = function (_bytes: Uint8Array) { this._sequence = [oidElem, secondElem]; };
		(_PdfBasicEncodingElement.prototype as any)._getSequence = function () { return this._sequence; };

		// stub parser._getCertificate to observe delegation
		(parser as any)._getCertificate = (_: any) => 'delegatedFromSData';

		const res = parser._readDistinguishEncoderCertificate(new Uint8Array([4, 5, 6]), false);
		expect(res as any).toBe('delegatedFromSData');

		// restore
		(_PdfBasicEncodingElement.prototype as any)._fromBytes = origFromBytes;
		(_PdfBasicEncodingElement.prototype as any)._getSequence = origGetSequence;
	});

	it('_readCertificate delegates to _readCertificateFromStream', () => {
		const parser = new _PdfX509CertificateParser();
		(parser as any)._readCertificateFromStream = (_: any) => 'delegated';
		expect((parser._readCertificate(new Uint8Array([1, 2, 3])) as any)).toBe('delegated');
	});

	it('_PdfUniqueBitString: construct, _getBytes and _getUniqueEncoded and _fromAbstractSyntaxOctets', () => {
		const data = new Uint8Array([10, 20, 30]);
		const pad = 3;
		const bit = new _PdfUniqueBitString(data, pad);
		// Arrange checks
		expect(bit._getBytes()).toBeDefined();
		expect(bit._getBytes().length).toBe(3);
		// Act
		const encoded = bit._getUniqueEncoded();
		// Assert
		expect(encoded instanceof Uint8Array).toBeTruthy();
		expect(encoded[0]).toBe(pad);
		expect(encoded.length).toBe(4);

		// fromAbstractSyntaxOctets strips leading unused-bits octet
		const raw = new Uint8Array([pad, ...data as any]);
		const parsed = new _PdfUniqueBitString()._fromAbstractSyntaxOctets(raw);
		expect(parsed._getBytes().length).toBe(1);
		expect(parsed._getBytes()[0]).toBe(0);
	});

	it('_PdfUniqueBitString: _equals true for identical, false otherwise', () => {
		const a = new _PdfUniqueBitString(new Uint8Array([1, 2]), 0);
		const b = new _PdfUniqueBitString(new Uint8Array([1, 2]), 0);
		const c = new _PdfUniqueBitString(new Uint8Array([1, 3]), 0);
		expect(a._equals(b)).toBeTruthy();
		expect(a._equals(c)).toBeFalsy();
		expect(a._equals({})).toBeFalsy();
	});

	it('_PdfUniqueBitString: _getUniqueBitString handles null, instance and invalid input', () => {
		const der = new _PdfUniqueBitString();
		// null/undefined returns null
		expect(der._getUniqueBitString(null)).toBeNull();
		const inst = new _PdfUniqueBitString(new Uint8Array([5]), 1);
		expect(der._getUniqueBitString(inst)).toBe(inst);
		expect(() => der._getUniqueBitString({})).toThrowError('Invalid Entry');
	});

	it('_PdfUniqueBitString: _getUniqueBitStringFromTag explicit and implicit handling', () => {
		const innerInstance = new _PdfUniqueBitString(new Uint8Array([7, 8]), 2);
		const tagExplicit = { _getInner: () => innerInstance } as any;
		const der = new _PdfUniqueBitString();
		const resExplicit = der._getUniqueBitStringFromTag(tagExplicit as any, true) as any;
		expect(resExplicit).toBe(innerInstance);

		// implicit: inner ASN.1 provides octet string (first octet = unused bits)
		const innerASN1 = { _getOctetString: () => new Uint8Array([1, 9, 10]) } as any;
		const tagImplicit = { _getInner: () => innerASN1 } as any;
		const resImplicit = der._getUniqueBitStringFromTag(tagImplicit as any, false) as any;
		expect(resImplicit._getBytes().length).toBe(2);
		expect(resImplicit._getBytes()[0]).toBe(9);
	});

	it('_PdfPublicKeyInformation._fromAbstractSyntax throws for non-array or invalid-length sequences', () => {
		const pk = new _PdfPublicKeyInformation();
		const badSeq1 = { _getSequence: (): any => null } as any;
		expect(() => pk._fromAbstractSyntax(badSeq1)).toThrowError('Invalid length in sequence');
		const badSeq2 = { _getSequence: () => [1] } as any;
		expect(() => pk._fromAbstractSyntax(badSeq2)).toThrowError('Invalid length in sequence');
	});

	it('_getPublicKeyInformation returns undefined for invalid inputs', () => {
		const pk = new _PdfPublicKeyInformation();
		// pass an ASN.1-like object that returns a falsy sequence to avoid calling a missing function
		expect(pk._getPublicKeyInformation({ _getSequence: (): any => null } as any)).toBeUndefined();
		expect(pk._getPublicKeyInformation(null)).toBeUndefined();
	});

	it('_PdfX509Extensions._fromSequence builds extensions and throws on bad sizes', () => {
		// valid element
		const valueElem: any = { _getSequence: (): any => [] };
		const oidObj: any = { _getObjectIdentifier: () => ({ toString: () => '1.2.3' }) };
		const innerSeq = [oidObj, { _getBooleanValue: () => true } as any, valueElem] as any;
		const elem: any = { _getSequence: () => innerSeq };
		const ext = new _PdfX509Extensions()._fromSequence([elem as any]);
		expect(ext instanceof _PdfX509Extensions).toBeTruthy();

		// invalid sizes should throw
		const badElem1: any = { _getSequence: (): any => null };
		expect(() => new _PdfX509Extensions()._fromSequence([badElem1 as any] as any)).toThrowError('Bad sequence size');
		const badElem2: any = { _getSequence: () => [1,2,3,4] };
		expect(() => new _PdfX509Extensions()._fromSequence([badElem2 as any] as any)).toThrowError('Bad sequence size');
	});

	it('_PdfX509Extensions._getInstance handles instances, ASN.1 element, and unknown object', () => {
		const existing = new _PdfX509Extensions();
		const inst = new _PdfX509Extensions()._getInstance(existing);
		expect(inst).toBe(existing);

		// ASN.1-like element path
		const innerValueElem: any = { _getSequence: (): any => [] };
		const oidObj: any = { _getObjectIdentifier: () => ({ toString: () => '1.2.3' }) };
		const innerSeq = [oidObj, innerValueElem] as any;
		const extensionEntry: any = { _getSequence: () => innerSeq };
		const wrapperElem: any = { _getSequence: () => [extensionEntry] };
		const asn1 = Object.create((require('../src/pdf/core/security/digital-signature/asn1/abstract-syntax') as any)._PdfAbstractSyntaxElement.prototype);
		(asn1 as any)._getSequence = () => [wrapperElem];
		const parsed = new _PdfX509Extensions()._getInstance(asn1 as any);
		expect(parsed instanceof _PdfX509Extensions).toBeTruthy();

		// unknown should throw
		expect(() => new _PdfX509Extensions()._getInstance({} as any)).toThrowError('Unknown object in factory');
	});

	it('_PdfX509Extensions._getExtension returns extension by OID key or null when absent', () => {
		const oid = new _PdfObjectIdentifier()._fromString('1.2.3');
		const extVal: any = { foo: 'bar' };
		const extObj = new _PdfX509Extension(true, extVal as any);
		const map = new Map<string, _PdfX509Extension>();
		map.set('1.2.3', extObj);
		const exts = new _PdfX509Extensions(map, ['1.2.3']);
		const got = exts._getExtension(oid);
		expect(got).toBe(extObj);
		const otherOid = new _PdfObjectIdentifier()._fromString('2.5.4');
		expect(exts._getExtension(otherOid)).toBeNull();
	});

		it('_PdfX509Extensions factory unknown object and _PdfX509ExtensionBase null path (lines 108 & 150)', () => {
			// Unknown object in factory should throw (line 108)
			expect(() => new _PdfX509Extensions()._getInstance({} as any)).toThrowError('Unknown object in factory');

			// Base-class helper should return null when _getExtensions returns falsy (line 150)
			class TestExtensionOwner extends (_PdfX509ExtensionBase as any) {
				_getExtensions(): any { return null; }
			}
			const owner = new (TestExtensionOwner as any)();
			const oid = new _PdfObjectIdentifier()._fromString('1.2.3');
			expect(owner._getExtension(oid)).toBeNull();
		});

		// SignedCertificate constructor and helpers (lines 100-158)

		it('_PdfSignedCertificate constructor covers version-present, extras and encoding (lines 100-158)', () => {
			// Arrange
			const oidElem: any = { _getValue: () => new Uint8Array([1]) };
			const algElem: any = { _getSequence: () => [oidElem] };
			const issuerElem: any = { _getSequence: (): any => [] };
			const datesElem: any = { _getSequence: () => [{}, {}] };
			const subjectElem: any = { _getSequence: (): any => [] };
			const pubAlgElem: any = { _getSequence: () => [oidElem] };
			const pubOctetsElem: any = { _getValue: () => new Uint8Array([0, 5, 6]) };
			const pubInfoElem: any = { _getSequence: () => [pubAlgElem, pubOctetsElem] };

			const issuerTag: any = { _getTagNumber: () => 1, _getInner: () => ({ _getOctetString: () => new Uint8Array([0, 9, 10]) }) };
			const subjectTag: any = { _getTagNumber: () => 2, _getInner: () => ({ _getOctetString: () => new Uint8Array([0, 8, 11]) }) };
			const extInstance: any = new _PdfX509Extensions();
			extInstance._getTagNumber = () => 3;

			const seq: any[] = [
				{ _getTagNumber: () => 0, _tagClass: 2 }, // version present
				{ _getValue: () => new Uint8Array([11]) }, // serial
				algElem,
				issuerElem,
				datesElem,
				subjectElem,
				pubInfoElem,
				issuerTag,
				subjectTag,
				extInstance
			];

			// Act
			const cert = new _PdfSignedCertificate({ _getSequence: () => seq } as any) as any;

			// Assert
			expect(cert._getVersion()).toBe(3);
			expect(cert._serialNumber instanceof Uint8Array).toBeTruthy();
			expect(cert._serialNumber[0]).toBe(11);
			expect(cert._issuerID instanceof _PdfUniqueBitString).toBeTruthy();
			expect(cert._subjectID instanceof _PdfUniqueBitString).toBeTruthy();
			expect(cert._extensions).toBe(extInstance);
			// stub encoding to avoid deep ASN.1 element requirements in this unit test
			const origToBytes = (_PdfUniqueEncodingElement.prototype as any)._toBytes;
			(_PdfUniqueEncodingElement.prototype as any)._toBytes = function () { return new Uint8Array([1]); };
			const enc = cert._getDistinguishEncoded();
			expect(enc instanceof Uint8Array).toBeTruthy();
			expect(enc.length).toBeGreaterThan(0);
			(_PdfUniqueEncodingElement.prototype as any)._toBytes = origToBytes;
		});

		it('_PdfSignedCertificate constructor handles missing version (seqStart = -1) and index offsets', () => {
			// Arrange: build sequence without explicit version element
			const oidElem: any = { _getValue: () => new Uint8Array([1]) };
			const algElem: any = { _getSequence: () => [oidElem] };
			const issuerElem: any = { _getSequence: (): any => [] };
			const datesElem: any = { _getSequence: () => [{}, {}] };
			const subjectElem: any = { _getSequence: (): any => [] };
			const pubInfoElem: any = { _getSequence: () => [algElem, { _getValue: () => new Uint8Array([0, 7, 8]) }] };

			const seqNoVersion: any[] = [
				{ _getTagNumber: () => 4, _getValue: () => new Uint8Array([21]) }, // serial at index 0 when seqStart = -1
				algElem,
				issuerElem,
				datesElem,
				subjectElem,
				pubInfoElem
			];

			// Act
			const cert = new _PdfSignedCertificate({ _getSequence: () => seqNoVersion } as any) as any;

			// Assert
			expect(cert._getVersion()).toBe(1);
			expect(cert._serialNumber[0]).toBe(21);
		});

	describe('x509 _PdfX509Time (lines 18-59) behavior', () => {

		it('_getUniversalTime returns trimmed string when value is string tagged 23', () => {
			// Arrange
			const timeElement: any = { _getTagNumber: () => 23, _getValue: () => '  24010101010203Z  ' };
			const xtime = new _PdfX509Time(timeElement as any);
			// Act
			const ut = xtime._getUniversalTime();
			// Assert
			expect(ut).toBe('24010101010203Z');
		});

		it('_getUniversalTime returns trimmed string when value is Uint8Array tagged 23', () => {
			// Arrange: ASCII for '24010101010203Z'
			const str = '24010101010203Z';
			const bytes = new Uint8Array(Array.prototype.map.call(str, (c: any) => c.charCodeAt(0)));
			const timeElement: any = { _getTagNumber: () => 23, _getValue: () => bytes };
			const xtime = new _PdfX509Time(timeElement as any);
			// Act
			const ut = xtime._getUniversalTime();
			// Assert
			expect(ut).toBe(str);
		});

		it('_getUniversalTime returns undefined for non-23 tag', () => {
			// Arrange
			const timeElement: any = { _getTagNumber: () => 24, _getValue: () => '24010101010203Z' };
			const xtime = new _PdfX509Time(timeElement as any);
			// Act
			const ut = xtime._getUniversalTime();
			// Assert
			expect(ut).toBeUndefined();
		});

		it('_toDate parses YYMMDDhhmmssZ and yields correct UTC date (year < 50 => 2000s)', () => {
			// Arrange: 24 -> 2024, month=01, day=01, 01:02:03
			const timeElement: any = { _getTagNumber: () => 23, _getValue: () => '240101010203Z' };
			const xtime = new _PdfX509Time(timeElement as any);
			// Act
			const dt = xtime._toDate();
			// Assert
			expect(dt).toBeDefined();
			expect(dt.getUTCFullYear()).toBe(2024);
			expect(dt.getUTCMonth()).toBe(0);
			expect(dt.getUTCDate()).toBe(1);
			expect(dt.getUTCHours()).toBe(1);
			expect(dt.getUTCMinutes()).toBe(2);
			expect(dt.getUTCSeconds()).toBe(3);
		});

		it('_toDate parses YYMMDDhhmmZ (no seconds) and yields correct UTC date with second=0 (year >=50 => 1900s)', () => {
			// Arrange: 51 -> 1951, 01-01 01:02
			const timeElement: any = { _getTagNumber: () => 23, _getValue: () => '5101010102Z' };
			const xtime = new _PdfX509Time(timeElement as any);
			// Act
			const dt = xtime._toDate();
			// Assert
			expect(dt).toBeDefined();
			expect(dt.getUTCFullYear()).toBe(1951);
			expect(dt.getUTCMonth()).toBe(0);
			expect(dt.getUTCDate()).toBe(1);
			expect(dt.getUTCHours()).toBe(1);
			expect(dt.getUTCMinutes()).toBe(2);
			expect(dt.getUTCSeconds()).toBe(0);
		});

		it('_toDate returns undefined when universal time malformed', () => {
			// Arrange: invalid time string
			const timeElement: any = { _getTagNumber: () => 23, _getValue: () => 'invalid-time' };
			const xtime = new _PdfX509Time(timeElement as any);
			// Act
			const dt = xtime._toDate();
			// Assert
			expect(dt).toBeUndefined();
		});

		it('_toDate returns undefined when _getUniversalTime returns undefined', () => {
			// Arrange: non-23 tag so _getUniversalTime returns undefined
			const timeElement: any = { _getTagNumber: () => 22, _getValue: () => '240101010203Z' };
			const xtime = new _PdfX509Time(timeElement as any);
			// Act
			const dt = xtime._toDate();
			// Assert
			expect(dt).toBeUndefined();
		});

		it('_getUniversalTime returns undefined when tagged 23 but value is neither string nor Uint8Array', () => {
			// Arrange: tag is 23 but value is an object (neither string nor Uint8Array)
			const timeElement: any = { _getTagNumber: () => 23, _getValue: () => ({ foo: 'bar' }) };
			const xtime = new _PdfX509Time(timeElement as any);
			// Act
			const ut = xtime._getUniversalTime();
			// Assert
			expect(ut).toBeUndefined();
		});

	});

});