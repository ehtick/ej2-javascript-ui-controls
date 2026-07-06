import { _PdfRmdSigner } from '../../src/pdf/core/security/digital-signature/signature/pdf-cipher-signer';

describe('PdfRmdSigner (selected lines) tests', () => {


    it('handles constructor, algorithm, initialization, and signing errors using try/catch', () => {

        // constructor throws on invalid digest
        try {
            new _PdfRmdSigner('unknown-digest');
            fail('Expected constructor to throw for invalid digest');
        } catch (e) {
            expect(e.message).toBe('Invalid digest algorithm: unknown-digest');
        }

        // _getAlgorithmIdentifier throws on unsupported digest
        const signer: any = new _PdfRmdSigner('sha256');
        try {
            signer._getAlgorithmIdentifier('not-supported');
            fail('Expected _getAlgorithmIdentifier to throw for unsupported digest');
        } catch (e) {
            expect(e.message).toBe('Unsupported digest: not-supported');
        }

        // prepare cipher engine mock
        signer._ronCipherEngine = {
            _initialize: jasmine.createSpy('init')
        } as any;

        // signing without privateExponent
        try {
            signer._initialize(true, {});
            fail('Expected initialize to throw when private key is missing');
        } catch (e) {
            expect(e.message).toBe('Private key required for signing.');
        }

        // verifying with privateExponent
        try {
            signer._initialize(false, { privateExponent: 'x' });
            fail('Expected initialize to throw when public key is missing');
        } catch (e) {
            expect(e.message).toBe('Public key required for verification.');
        }

        // valid signing initialization should not throw
        try {
            signer._initialize(true, { privateExponent: 'x' });
            expect(true).toBeTruthy();
        } catch {
            fail('Did not expect initialize to throw with valid signing params');
        }

        // generateSignature when not in signing mode
        const signer2: any = new _PdfRmdSigner('sha256');
        try {
            signer2._generateSignature();
            fail('Expected generateSignature to throw when not in signing mode');
        } catch (e) {
            expect(e.message).toBe('Invalid operation: not in signing mode');
        }

    });

    it('generateSignature returns null when hash is empty', () => {
        const signer: any = new _PdfRmdSigner('sha256');
        signer._ronCipherEngine = { _initialize: jasmine.createSpy('init'), _processBlock: jasmine.createSpy('proc') } as any;
        signer._isSigning = true;
        signer._input = { _close: () => { } } as any;
        signer._output = { _getResult: () => new Uint8Array(0) } as any;
        const result = signer._generateSignature();
        expect(result).toBeNull();
    });

    it('derEncode returns input hash when _id is falsy', () => {
        const signer: any = new _PdfRmdSigner('sha256');
        signer._id = null as any;
        const hash = new Uint8Array([1, 2, 3]);
        const out = signer._derEncode(hash);
        expect(out).toEqual(hash);
    });

    it('derEncode returns empty Uint8Array when _id truthy but hash empty', () => {
        const signer: any = new _PdfRmdSigner('sha256');
        signer._id = {} as any;
        const out = signer._derEncode(new Uint8Array(0));
        expect(out instanceof Uint8Array).toBeTruthy();
        expect(out.length).toBe(0);
    });

    it('_update calls _input._add with single-byte Uint8Array', () => {
        const signer: any = new _PdfRmdSigner('sha256');
        const addSpy = jasmine.createSpy('add');
        signer._input = { _add: addSpy } as any;
        signer._update(55);
        expect(addSpy).toHaveBeenCalled();
        const calledArg = addSpy.calls.mostRecent().args[0];
        expect(calledArg instanceof Uint8Array).toBeTruthy();
        expect(calledArg[0]).toBe(55);
    });

    it('_compareArrays returns false for differing lengths, false for mismatch, true for identical', () => {
        const signer: any = new _PdfRmdSigner('sha256');
        const a1 = new Uint8Array([1]);
        const b1 = new Uint8Array([1, 2]);
        expect(signer._compareArrays(a1, b1)).toBeFalsy();

        const a2 = new Uint8Array([1, 2]);
        const b2 = new Uint8Array([1, 3]);
        expect(signer._compareArrays(a2, b2)).toBeFalsy();

        const a3 = new Uint8Array([5, 6, 7]);
        const b3 = new Uint8Array([5, 6, 7]);
        expect(signer._compareArrays(a3, b3)).toBeTruthy();
    });

});

