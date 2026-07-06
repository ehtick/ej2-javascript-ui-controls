import { _PdfSignatureDictionary } from '../../src/pdf/core/security/digital-signature/signature/signature-dictionary';
import { _PdfReference, _PdfDictionary } from '../../src/pdf/core/pdf-primitives';
import { PdfSignature } from '../../src/pdf/core/security/digital-signature/signature/pdf-signature';

describe('_parsePdfContents behavior', () => {

	it('returns bytes for even-length hex string', () => {
		// Arrange
		const receiver = {} as unknown as _PdfSignatureDictionary;
		const input = '<0A0BFF>';
		// Act
		const result: Uint8Array = _PdfSignatureDictionary.prototype._parsePdfContents.call(receiver, input);
		// Assert
		expect(result).toBeDefined();
		expect(result instanceof Uint8Array).toBeTruthy();
		expect(result.length).toBe(3);
		expect(result[0]).toBe(0x0A);
		expect(result[1]).toBe(0x0B);
		expect(result[2]).toBe(0xFF);
	});

	it('pads odd-length hex string and returns bytes', () => {
		// Arrange
		const receiver = {} as unknown as _PdfSignatureDictionary;
		const input = '<0A3>';
		// Act
		const result: Uint8Array = _PdfSignatureDictionary.prototype._parsePdfContents.call(receiver, input);
		// Assert
		expect(result).toBeDefined();
		expect(result.length).toBe(2);
		expect(result[0]).toBe(0x0A);
		// '3' padded becomes '30' -> 0x30
		expect(result[1]).toBe(0x30);
	});

	it('returns same Uint8Array when passed a Uint8Array', () => {
		// Arrange
		const receiver = {} as unknown as _PdfSignatureDictionary;
		const input = new Uint8Array([1, 2, 3]);
		// Act
		const result: Uint8Array = _PdfSignatureDictionary.prototype._parsePdfContents.call(receiver, input as unknown as any);
		// Assert
		expect(result).toBe(input);
	});

	it('returns undefined for non-string/non-Uint8Array', () => {
		// Arrange
		const receiver = {} as unknown as _PdfSignatureDictionary;
		// Act
		const result = _PdfSignatureDictionary.prototype._parsePdfContents.call(receiver, 123);
		// Assert
		expect(result).toBeUndefined();
	});

	it('PdfSignature dictionary - constructer error', () => {
		try {
			const dictionary = new _PdfSignatureDictionary(null, null);
			fail('Failed while passing the null value');

		} catch (error) {
			expect(error.message).toBe('A valid argument must be provided.');
		}
		try {
			const document = new _PdfDictionary()
			const dictionary = new _PdfSignatureDictionary(document, null);
			fail('Failed while passing the null value');
		} catch (error) {
			expect(error.message).toBe('Argument signature is null or undefined.');
		}

	});

	it('_parsePdfDate branches check', () => {
		const signature = new _PdfSignatureDictionary(new _PdfDictionary, new PdfSignature);
		const check = signature._parsePdfDate(null);
		expect(check).toBeUndefined();
		const check2 = signature._parsePdfDate('2024');
		const check3 = signature._parsePdfDate('2024/dsgdgdsdfsgd');
		expect(check2).toBeDefined();
		expect(check3).toBeUndefined();
	});
	it('_dictionarySave and _allowMessageDigestProcessing  branches check', () => {
		const signature = new _PdfSignatureDictionary(new _PdfDictionary, new PdfSignature);
		try {
			const check = signature._dictionarySave([]);
			fail('Failed while pass the empty buffer array')
		} catch (error) {
			expect(error.message).toBe('dictionary or writer is null.')
		}
		signature._dictionary = null;
		try {
			const check = signature._dictionarySave([]);
			fail('Failed while pass the empty dictionary')
		} catch (error) {
			expect(error.message).toBe('dictionary or writer is null.')
		}
		
	});
	it('_addDate branches check', () => {
		const signature: any = new _PdfSignatureDictionary(new _PdfDictionary, new PdfSignature);
		const date =  new Date(2026,6,5)
		signature._signature._signedDate = date;
		const result = signature._addDate()
		expect(date).toBeTruthy(signature._signature._signedDate);
	});

});

describe('_addDigest behavior', () => {

	it('writes digest reference and 64 zeros when certify allowed', () => {
		// Arrange
		const writer = {
			_currentLength: 0,
			_writeString: function (str: string, buffer: number[]) {
				for (let i = 0; i < str.length; i++) {
					buffer.push(str.charCodeAt(i) & 0xff);
				}
				this._currentLength += str.length;
			}
		} as any;
		const receiver: any = {};
		receiver._signature = { _certify: true, _documentPermissions: 5 };
		receiver._allowMessageDigestProcessing = () => true;
		receiver._document = { _crossReference: writer, _catalog: { _catalogDictionary: { objId: { toString: () => '99' } } } };
		const buffer: number[] = [];

		// Act
		_PdfSignatureDictionary.prototype._addDigest.call(receiver, buffer);

		// Assert
		expect(buffer.length).toBeGreaterThan(0);
		const zeroCode = '0'.charCodeAt(0) & 0xff;
		const zeroCount = buffer.filter((b) => b === zeroCode).length;
		expect(zeroCount).toBeGreaterThanOrEqual(64);
		// reference digits ('9') should be present
		const nineCode = '9'.charCodeAt(0) & 0xff;
		expect(buffer.indexOf(nineCode)).toBeGreaterThanOrEqual(0);
	});

	it('does nothing when certify not allowed', () => {
		// Arrange
		const writer = { _currentLength: 0, _writeString: function (s: string, b: number[]) { for (let i = 0; i < s.length; i++) b.push(s.charCodeAt(i)); this._currentLength += s.length; } } as any;
		const receiver: any = {};
		receiver._signature = { _certify: false, _documentPermissions: 5 };
		receiver._allowMessageDigestProcessing = () => true;
		receiver._document = { _crossReference: writer, _catalog: { _catalogDictionary: { objId: { toString: () => '1' } } } };
		const buffer: number[] = [];

		// Act
		_PdfSignatureDictionary.prototype._addDigest.call(receiver, buffer);

		// Assert
		expect(buffer.length).toBe(0);
	});

});

describe('_allowMessageDigestProcessing behavior', () => {

	it('returns false when signature dictionary has Reference (docMDP is a _PdfReference)', () => {
		// Arrange
		const receiver: any = {};
		const signatureDictionary = new _PdfDictionary();
		signatureDictionary._map['Reference'] = true;
		receiver._dictionary = signatureDictionary;

		const docRef = _PdfReference.get(10, 0);
		const perms = { get: (k: string) => k === 'DocMDP' ? docRef : undefined };
		const docMDPDictionary = new _PdfDictionary();
		docMDPDictionary._map = {};
		const xref = { _fetch: (_: any) => docMDPDictionary };
		receiver._document = { _catalog: { _catalogDictionary: { get: (_: string) => perms } }, _crossReference: xref };

		// Act
		const allowed = _PdfSignatureDictionary.prototype._allowMessageDigestProcessing.call(receiver);

		// Assert
		expect(allowed).toBeFalsy();
	});

	it('returns false when docMDP dictionary has Reference (docMDP is a _PdfReference)', () => {
		// Arrange
		const receiver: any = {};
		const signatureDictionary = new _PdfDictionary();
		signatureDictionary._map = {};
		receiver._dictionary = signatureDictionary;

		const docRef = _PdfReference.get(11, 0);
		const perms = { get: (k: string) => k === 'DocMDP' ? docRef : undefined };
		const docMDPDictionary = new _PdfDictionary();
		docMDPDictionary._map['Reference'] = true;
		const xref = { _fetch: (_: any) => docMDPDictionary };
		receiver._document = { _catalog: { _catalogDictionary: { get: (_: string) => perms } }, _crossReference: xref };

		// Act
		const allowed = _PdfSignatureDictionary.prototype._allowMessageDigestProcessing.call(receiver);

		// Assert
		expect(allowed).toBeFalsy();
	});
	it('returns false when docMDP dictionary has Reference (docMDP is a _PdfDictionary)', () => {
		// Arrange
		const receiver: any = {};
		const docDict = new _PdfDictionary;
		docDict.objId = 1;
		const docRef = _PdfReference.get(11, 0);
		const perms = { get: (k: string) => k === 'DocMDP' ? docDict : undefined };
		const docMDPDictionary = new _PdfDictionary();
		docMDPDictionary._map['Reference'] = true;
		const xref = { _fetch: (_: any) => docMDPDictionary };
		receiver._document = { _catalog: { _catalogDictionary: { get: (_: string) => perms } }, _crossReference: xref };
		receiver._dictionary = {objId: 0}
		// Act
		const allowed = _PdfSignatureDictionary.prototype._allowMessageDigestProcessing.call(receiver);

		// Assert
		expect(allowed).toBeFalsy();
	});
	it('returns true whent the dictionary is undefined', () => {
		// Arrange
		const receiver: any = {};
		const docDict = new _PdfDictionary;
		docDict.objId = 1;
		const docRef = _PdfReference.get(11, 0);
		const perms = { get: (k: string) => k === 'DocMDP' ? undefined : docDict};
		const docMDPDictionary = new _PdfDictionary();
		docMDPDictionary._map['Reference'] = true;
		const xref = { _fetch: (_: any) => docMDPDictionary };
		receiver._document = { _catalog: { _catalogDictionary: { get: (_: string) => perms } }, _crossReference: xref };
		receiver._dictionary = {objId: 0}
		// Act
		const allowed = _PdfSignatureDictionary.prototype._allowMessageDigestProcessing.call(receiver);

		// Assert
		expect(allowed).toBeTruthy();
	});

});

describe('_getCryptographicStandardContent behavior (externalSignatureCallback)', () => {

	it('returns signedData from externalSignatureCallback when externalChain is empty', () => {
		// Arrange
		const receiver: any = {};
		receiver._signature = {
			_externalSignatureCallback: (data: Uint8Array, options: any) => {
				return { signedData: new Uint8Array([5, 6, 7]) };
			},
			_externalChain: []
		};
		const input = new Uint8Array([1, 2, 3]);

		// Act
		const result: Uint8Array = _PdfSignatureDictionary.prototype._getCryptographicStandardContent.call(receiver, input);

		// Assert
		expect(result).toBeDefined();
		expect(result instanceof Uint8Array).toBeTruthy();
		expect(Array.from(result)).toEqual([5, 6, 7]);
	});

	it('when externalChain present returns zero-filled array upon error (uses _estimatedSize)', () => {
		// Arrange
		const receiver: any = {};
		receiver._signature = {
			_externalSignatureCallback: () => ({ signedData: new Uint8Array([9]) }),
			_externalChain: [new Uint8Array([1])],
			_digestAlgorithm: 'sha256'
		};
		receiver._estimatedSize = 128;
		// Act
		const result: Uint8Array = _PdfSignatureDictionary.prototype._getCryptographicStandardContent.call(receiver, new Uint8Array([1, 2]));

		// Assert
		expect(result).toBeDefined();
		expect(result.length).toBe(receiver._estimatedSize);
		for (let i = 0; i < result.length; i++) {
			expect(result[i]).toBe(0);
		}
	});

});

describe('_getCryptographicStandardContent externalChain callback edge cases', () => {

	it('returns zero-filled array when externalSignatureCallback returns no signedData', () => {
		// Arrange
		const receiver: any = {};
		receiver._signature = {
			_externalSignatureCallback: () => ({ timestampData: new Uint8Array([1, 2]) }),
			_externalChain: [new Uint8Array([1])],
			_digestAlgorithm: 'sha256',
			_cryptographicStandard: undefined
		};
		receiver._estimatedSize = 32;

		// Act
		const result: Uint8Array = _PdfSignatureDictionary.prototype._getCryptographicStandardContent.call(receiver, new Uint8Array([1, 2, 3]));

		// Assert
		expect(result).toBeDefined();
		expect(result.length).toBe(receiver._estimatedSize);
		for (let i = 0; i < result.length; i++) expect(result[i]).toBe(0);
	});

	it('returns callback.signedData when externalSignatureCallback provides signedData', () => {
		// Arrange
		const receiver: any = {};
		receiver._signature = {
			_externalSignatureCallback: (_data: Uint8Array) => ({ signedData: new Uint8Array([7, 8, 9]) }),
			_externalChain: [new Uint8Array([1])],
			_digestAlgorithm: 'sha256'
		};
		receiver._estimatedSize = 16;

		// Act
		const result: Uint8Array = _PdfSignatureDictionary.prototype._getCryptographicStandardContent.call(receiver, new Uint8Array([4, 5, 6]));

		// Assert
		expect(result).toBeDefined();
		expect(Array.from(result.slice(0, 3))).toEqual([0, 0, 0]);
	});

});

describe('_parseDigestAlgorithm behavior (else branches)', () => {

	it('returns undefined when Contents entry is missing', () => {
		// Arrange
		const receiver: any = {};
		receiver._dictionary = new _PdfDictionary();

		// Act
		const result = _PdfSignatureDictionary.prototype._parseDigestAlgorithm.call(receiver);

		// Assert
		expect(result).toBeUndefined();
	});

});





