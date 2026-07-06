import { _PdfRsaAlgorithm, _PdfRsaCoreAlgorithm } from "../../src/pdf/core/security/digital-signature/signature/algorithm-handler";
import { _getBigInt } from "../../src/pdf/core/utils";
import * as utils  from "../../src/pdf/core/utils";
describe('Algorithm-handler file behavior test scripts', () => {
    it('getters return value check', () => {
        const algorithm: any = new _PdfRsaAlgorithm();
        const name = algorithm._getAlgorithmName();

        algorithm._rsaCoreEngine._isEncryption = false;
        algorithm._rsaCoreEngine._bitSize = 2;

        const outputBlock = algorithm._getOutputBlock();
        expect(name).toEqual('RSA');
        expect(outputBlock).toBe(0);
    });

    it('processBlock throws when engine not initialized', () => {
        // Arrange
        const algorithm: any = new _PdfRsaAlgorithm();
        const inputBytes: Uint8Array = new Uint8Array([1, 2, 3]);
        // Act / Assert
        try {
            algorithm._processBlock(inputBytes, 0, inputBytes.length)
        } catch (error) {
            expect(error.message).toBe('RSA engine not initialized.');
        }
    });

    it('input/output block sizes in non encryption mode', () => {
        // Arrange
        const algorithm: any = new _PdfRsaAlgorithm();
        algorithm._rsaCoreEngine._isEncryption = false;
        algorithm._rsaCoreEngine._bitSize = 16;
        // Act
        const inputBlock: number = algorithm._getInputBlock();
        const outputBlock: number = algorithm._getOutputBlock();
        // Assert
        expect(inputBlock).toBe(2);
        expect(outputBlock).toBe(1);
    });

    it('_initialize sets bitSize and encryption flag from parameter (lines 78-81)', () => {
        const algorithm: any = new _PdfRsaAlgorithm();
        const fakeParam: any = { modulus: { _bitLength: () => 123 } };
        algorithm._initialize(true, fakeParam);
        expect(algorithm._rsaCoreEngine._bitSize).toBe(123);
        expect(algorithm._rsaCoreEngine._isEncryption).toBeTruthy();
        expect(algorithm._key).toBe(fakeParam);
    });

    it('_getInputBlockSize and _getOutputBlockSize in encryption mode (lines 58,62)', () => {
        const core: any = new _PdfRsaCoreAlgorithm();
        core._isEncryption = true;
        core._bitSize = 16;
        expect(core._getInputBlockSize()).toBe((16 - 1) >>> 3);
        expect(core._getOutputBlockSize()).toBe((16 + 7) >>> 3);
    });

    it('_convertOutput pads output in encryption mode when shorter than block (line 191)', () => {
        const core: any = new _PdfRsaCoreAlgorithm();
        const toBigInt = _getBigInt();
        core._isEncryption = true;
        core._bitSize = 16; // output block should be 2 bytes
        const out = core._convertOutput(toBigInt('1'));
        expect(out.length).toBe((16 + 7) >>> 3);
        // small bigint (1) should be right-padded into block: [0,1]
        expect(Array.from(out)).toEqual([0, 1]);
    });

    it('_processBlock non-CRT path uses modular exponentiation', () => {
        const toBigInt = _getBigInt();
        const core: any = new _PdfRsaCoreAlgorithm();
        core._key = { exponent: toBigInt('3'), modulus: toBigInt('7') };
        const result = core._processBlock(toBigInt('2'));
        // 2^3 mod 7 = 8 mod 7 = 1
        expect(result).toBe(toBigInt('1'));
    });
    it('processBlock uses blinding when private key with publicExponent exists', () => {
        const toBigInt = _getBigInt();
        const algorithm: any = new _PdfRsaAlgorithm();
        algorithm._key = {
            _isPrivate: true,
            publicExponent: { _toBigInt: () => toBigInt('3') },
            modulus: { _toBigInt: () => toBigInt('11') }
        };

        spyOn(algorithm._rsaCoreEngine, '_convertInput').and.returnValue(toBigInt('4'));
        spyOn(utils, '_createRandomInRange').and.returnValue(toBigInt('2'));
        spyOn(utils, '_modPow').and.returnValue(toBigInt('7'));
        spyOn(algorithm._rsaCoreEngine, '_processBlock').and.returnValue(toBigInt('8'));
        spyOn(utils, '_modInverse').and.returnValue(toBigInt('6'));
        spyOn(algorithm._rsaCoreEngine, '_convertOutput').and.returnValue(new Uint8Array([4]));

        const output = algorithm._processBlock(new Uint8Array([1, 2, 3]), 0, 3);

        expect(utils._createRandomInRange).toHaveBeenCalledWith(toBigInt('1'), toBigInt('11') - toBigInt('1'));
        expect(utils._modPow).toHaveBeenCalledWith(toBigInt('2'), toBigInt('3'), toBigInt('11'));
        expect(algorithm._rsaCoreEngine._processBlock).toHaveBeenCalledWith(toBigInt('6'));
        expect(utils._modInverse).toHaveBeenCalledWith(toBigInt('2'), toBigInt('11'));
        expect(algorithm._rsaCoreEngine._convertOutput).toHaveBeenCalledWith(toBigInt('4'));
        expect(Array.from(output)).toEqual([4]);
    });

    it('processBlock delegates to core when no blinding (else path lines 190-192)', () => {
        const toBigInt = _getBigInt();
        const algorithm: any = new _PdfRsaAlgorithm();
        algorithm._key = { _isPrivate: false, modulus: { _toBigInt: () => toBigInt('11') } };

        const inputBigInt = toBigInt('4');
        const processedBigInt = toBigInt('7');

        spyOn(algorithm._rsaCoreEngine, '_convertInput').and.returnValue(inputBigInt);
        spyOn(algorithm._rsaCoreEngine, '_processBlock').and.returnValue(processedBigInt);
        spyOn(algorithm._rsaCoreEngine, '_convertOutput').and.returnValue(new Uint8Array([9]));

        const output = algorithm._processBlock(new Uint8Array([1, 2, 3]), 0, 3);

        expect(algorithm._rsaCoreEngine._convertInput).toHaveBeenCalled();
        expect(algorithm._rsaCoreEngine._processBlock).toHaveBeenCalledWith(inputBigInt);
        expect(algorithm._rsaCoreEngine._convertOutput).toHaveBeenCalledWith(processedBigInt);
        expect(Array.from(output)).toEqual([9]);
    });
});
describe('_convertInput error branches', () => {
    let rsa: any;
    let bytes: Uint8Array;
    let toBigInt: any
    beforeEach(() => {
        bytes = new Uint8Array(32);
        toBigInt = _getBigInt()
        rsa = {
            _key: {
                modulus: toBigInt('1000')
            },
            _getInputBlockSize: jasmine.createSpy(),
            _convertInput: _PdfRsaCoreAlgorithm.prototype._convertInput
        };
    });
    it('should throw when input data is too large for RSA block', () => {
        rsa._getInputBlockSize.and.returnValue(8);

        expect(() => {
            rsa._convertInput(bytes, 0, 10); // 10 > 8 + 1
        }).toThrowError('Input data too large for RSA block.');
    });
    it('should throw when input value is larger than modulus', () => {
        rsa._getInputBlockSize.and.returnValue(32);

        spyOn(utils, '_bytesToBigInt')
            .and.returnValue(toBigInt(1000)); // equal to modulus

        expect(() => {
            rsa._convertInput(bytes, 0, 2);
        }).toThrowError('Input data is larger than modulus.');
    });

});

