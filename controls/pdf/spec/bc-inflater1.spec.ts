
import { _Inflater } from '../src/pdf/core/compression/inflater';
import { _InflaterState, _BlockType } from '../src/pdf/core/compression/enum';
import { _HuffmanTree } from '../src/pdf/core/compression/huffman-tree';

describe('_Inflater additional coverage', () => {
    let inflater: _Inflater;

    function setInputSpies(values: {
        getBits?: jasmine.Spy | ((count: number) => number),
        availableBits?: jasmine.Spy | ((count: number) => boolean),
        skipByteBoundary?: jasmine.Spy | (() => void)
    }): void {
        (inflater as any)._input = {
            _getBits: values.getBits || jasmine.createSpy('_getBits').and.returnValue(0),
            _availableBits: values.availableBits || jasmine.createSpy('_availableBits').and.returnValue(true),
            _skipByteBoundary: values.skipByteBoundary || jasmine.createSpy('_skipByteBoundary')
        } as any;
    }

    function setOutputSpies(values?: {
        unusedBytes?: number,
        copyFrom?: jasmine.Spy | ((input: any, length: number) => number),
        write?: jasmine.Spy | ((value: number) => void),
        writeLD?: jasmine.Spy | ((length: number, offset: number) => void),
        copyTo?: jasmine.Spy | ((bytes: number[], offset: number, length: number) => { count: number, data: number[] })
    }): void {
        (inflater as any)._output = {
            _unusedBytes: values && values.unusedBytes !== undefined ? values.unusedBytes : 300,
            _copyFrom: values && values.copyFrom ? values.copyFrom : jasmine.createSpy('_copyFrom').and.returnValue(0),
            _write: values && values.write ? values.write : jasmine.createSpy('_write'),
            _writeLD: values && values.writeLD ? values.writeLD : jasmine.createSpy('_writeLD'),
            _copyTo: values && values.copyTo ? values.copyTo : jasmine.createSpy('_copyTo').and.returnValue({ count: 0, data: [] })
        } as any;
    }

    beforeEach(() => {
        inflater = new _Inflater();
        setInputSpies({});
        setOutputSpies();
    });

    describe('_decodeUncompressedBlock', () => {
        it('should return false when _unCompressedByte fails in byte states', () => {
            (inflater as any)._inflaterState = _InflaterState.unCompressedByte2;
            spyOn(inflater as any, '_unCompressedByte').and.returnValue(false);

            const result = (inflater as any)._decodeUncompressedBlock(false);

            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
            expect(result.output).toBe((inflater as any)._output);
        });

        it('should finish uncompressed block when copied bytes consume all remaining length', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 5;
            (inflater as any)._output._copyFrom = jasmine.createSpy('_copyFrom').and.returnValue(5);
            (inflater as any)._output._unusedBytes = 20;

            const result = (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(0);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.readingBFinal);
            expect(result.result).toBe(true);
            expect(result.eob).toBe(true);
        });

        it('should return true when output buffer becomes full before block ends', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 10;
            (inflater as any)._output._copyFrom = jasmine.createSpy('_copyFrom').and.returnValue(3);
            (inflater as any)._output._unusedBytes = 0;

            const result = (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(7);
            expect(result.result).toBe(true);
            expect(result.eob).toBe(false);
        });

        it('should return false when block is not finished and output still has space', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 10;
            (inflater as any)._output._copyFrom = jasmine.createSpy('_copyFrom').and.returnValue(2);
            (inflater as any)._output._unusedBytes = 5;

            const result = (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(8);
            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
        });
    });

    describe('_unCompressedByte', () => {
        it('should return false when no byte is available', () => {
            (inflater as any)._inflaterState = _InflaterState.unCompressedByte1;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(-1);

            const result = (inflater as any)._unCompressedByte();

            expect(result).toBe(false);
        });

        it('should read the 4th uncompressed header byte and move to decodeUnCompressedBytes', () => {
            (inflater as any)._inflaterState = _InflaterState.unCompressedByte4;
            (inflater as any)._blBuffer[0] = 0x05;
            (inflater as any)._blBuffer[1] = 0x00;
            (inflater as any)._blBuffer[2] = 0xFA;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0xFF);

            const result = (inflater as any)._unCompressedByte();

            expect(result).toBe(true);
            expect((inflater as any)._bLength).toBe(5);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.decodeUnCompressedBytes);
        });
    });

    describe('_decodeBlock', () => {
        it('should return false when literal/length tree returns negative symbol', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeTop;
            (inflater as any)._llTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(-1)
            } as any;
            (inflater as any)._output._unusedBytes = 300;

            const result = (inflater as any)._decodeBlock(false);

            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
        });

        it('should write literal byte when symbol is less than 256', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeTop;
            (inflater as any)._llTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(65)
            } as any;
            (inflater as any)._output._unusedBytes = 259;

            const result = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._output._write).toHaveBeenCalledWith(65);
            expect(result.result).toBe(true);
            expect(result.eob).toBe(false);
        });

        it('should set end-of-block state when symbol is 256', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeTop;
            (inflater as any)._llTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(256)
            } as any;
            (inflater as any)._output._unusedBytes = 300;

            const result = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._inflaterState).toBe(_InflaterState.readingBFinal);
            expect(result.result).toBe(true);
            expect(result.eob).toBe(true);
        });

        it('should return false when _inLength returns false', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeTop;
            (inflater as any)._llTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(265)
            } as any;
            (inflater as any)._output._unusedBytes = 300;
            spyOn(inflater as any, '_inLength').and.returnValue({ value: false, fb: 300 });

            const result = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._inLength).toHaveBeenCalled();
            expect(result.result).toBe(false);
        });

        it('should return false from iLength state when _inLength returns false', () => {
            (inflater as any)._inflaterState = _InflaterState.iLength;
            (inflater as any)._output._unusedBytes = 300;
            spyOn(inflater as any, '_inLength').and.returnValue({ value: false, fb: 300 });

            const result = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._inLength).toHaveBeenCalled();
            expect(result.result).toBe(false);
        });

        it('should return false from fLength state when _fLength returns false', () => {
            (inflater as any)._inflaterState = _InflaterState.fLength;
            (inflater as any)._output._unusedBytes = 300;
            spyOn(inflater as any, '_fLength').and.returnValue({ value: false, fb: 300 });

            const result = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._fLength).toHaveBeenCalled();
            expect(result.result).toBe(false);
        });

        it('should return false from dCode state when _dcode returns false', () => {
            (inflater as any)._inflaterState = _InflaterState.dCode;
            (inflater as any)._output._unusedBytes = 300;
            spyOn(inflater as any, '_dcode').and.returnValue({ value: false, fb: 300 });

            const result = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._dcode).toHaveBeenCalled();
            expect(result.result).toBe(false);
        });
    });

    describe('_inLength', () => {
        it('should return false when extra length bits are unavailable', () => {
            (inflater as any)._extraBits = 2;
            (inflater as any)._length = 8;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(-1);

            const result = (inflater as any)._inLength(300);

            expect(result.value).toBe(false);
        });

        it('should return false when _fLength returns false', () => {
            (inflater as any)._extraBits = 0;
            spyOn(inflater as any, '_fLength').and.returnValue({ value: false, fb: 123 });

            const result = (inflater as any)._inLength(300);

            expect((inflater as any)._inflaterState).toBe(_InflaterState.fLength);
            expect(result.value).toBe(false);
            expect(result.fb).toBe(123);
        });

        it('should compute length and return true when extra bits are valid', () => {
            (inflater as any)._extraBits = 1;
            (inflater as any)._length = 8;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(1);
            spyOn(inflater as any, '_fLength').and.returnValue({ value: true, fb: 250 });

            const result = (inflater as any)._inLength(300);

            expect((inflater as any)._length).toBe((inflater as any)._lengthBase[8] + 1);
            expect(result.value).toBe(true);
            expect(result.fb).toBe(250);
        });
    });

    describe('_fLength', () => {
        it('should return false when dynamic distance tree returns negative symbol', () => {
            (inflater as any)._blockType = _BlockType.dynamicType;
            (inflater as any)._distanceTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(-1)
            } as any;

            const result = (inflater as any)._fLength(300);

            expect(result.value).toBe(false);
        });

        it('should return false when _dcode returns false for static block', () => {
            (inflater as any)._blockType = _BlockType.staticType;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(5);
            spyOn(inflater as any, '_dcode').and.returnValue({ value: false, fb: 77 });

            const result = (inflater as any)._fLength(300);

            expect((inflater as any)._dcode).toHaveBeenCalled();
            expect(result.value).toBe(false);
            expect(result.fb).toBe(77);
        });

        it('should return true when _dcode succeeds', () => {
            (inflater as any)._blockType = _BlockType.staticType;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0);
            spyOn(inflater as any, '_dcode').and.returnValue({ value: true, fb: 200 });

            const result = (inflater as any)._fLength(300);

            expect(result.value).toBe(true);
            expect(result.fb).toBe(200);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.dCode);
        });
    });

    describe('_dcode', () => {
        it('should return false when distance extra bits are unavailable', () => {
            (inflater as any)._distanceCode = 6;
            (inflater as any)._length = 5;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(-1);

            const result = (inflater as any)._dcode(300);

            expect(result.value).toBe(false);
        });

        it('should write length-distance pair and return true for small distance code', () => {
            (inflater as any)._distanceCode = 2;
            (inflater as any)._length = 6;

            const result = (inflater as any)._dcode(300);

            expect((inflater as any)._output._writeLD).toHaveBeenCalledWith(6, 3);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.decodeTop);
            expect(result.value).toBe(true);
            expect(result.fb).toBe(294);
        });
    });

    describe('_decodeDynamicBlockHeader', () => {
        it('should return false when readingNlCodes cannot read llCodeCount', () => {
            (inflater as any)._inflaterState = _InflaterState.readingNlCodes;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(-1);

            const result = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(false);
        });

        it('should return false when readingNlCodes delegates to _readingNDCodes and it fails', () => {
            (inflater as any)._inflaterState = _InflaterState.readingNlCodes;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0);
            spyOn(inflater as any, '_readingNDCodes').and.returnValue(false);

            const result = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(false);
        });

        it('should return false for readingNdCodes state when _readingNDCodes fails', () => {
            (inflater as any)._inflaterState = _InflaterState.readingNdCodes;
            spyOn(inflater as any, '_readingNDCodes').and.returnValue(false);

            const result = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(false);
        });

        it('should return false for readingCodes state when _readingCodes fails', () => {
            (inflater as any)._inflaterState = _InflaterState.readingCodes;
            spyOn(inflater as any, '_readingCodes').and.returnValue(false);

            const result = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(false);
        });

        it('should return false for readingClCodes state when _readingCLCodes fails', () => {
            (inflater as any)._inflaterState = _InflaterState.readingClCodes;
            spyOn(inflater as any, '_readingCLCodes').and.returnValue(false);

            const result = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(false);
        });

        it('should return false for readingTcAfter state when _readingTCBefore fails', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcAfter;
            spyOn(inflater as any, '_readingTCBefore').and.returnValue(false);

            const result = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(false);
        });

        it('should build trees and move to decodeTop on success', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcBefore;
            (inflater as any)._llCodeCount = 3;
            (inflater as any)._dCodeCount = 2;
            (inflater as any)._codeList[0] = 1;
            (inflater as any)._codeList[1] = 2;
            (inflater as any)._codeList[2] = 3;
            (inflater as any)._codeList[3] = 1;
            (inflater as any)._codeList[4] = 1;

            spyOn(inflater as any, '_readingTCBefore').and.returnValue(true);
            spyOn(_HuffmanTree.prototype as any, '_load').and.stub();

            const result = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(true);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.decodeTop);
        });
    });

    describe('_readingNDCodes', () => {
        it('should return false when distance code count bits are unavailable', () => {
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(-1);

            const result = (inflater as any)._readingNDCodes();

            expect(result).toBe(false);
        });

        it('should return false when _readingCodes fails', () => {
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0);
            spyOn(inflater as any, '_readingCodes').and.returnValue(false);

            const result = (inflater as any)._readingNDCodes();

            expect(result).toBe(false);
        });
    });

    describe('_readingCodes', () => {
        it('should return false when code-length count bits are unavailable', () => {
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(-1);

            const result = (inflater as any)._readingCodes();

            expect(result).toBe(false);
        });

        it('should return false when _readingCLCodes fails', () => {
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0);
            spyOn(inflater as any, '_readingCLCodes').and.returnValue(false);

            const result = (inflater as any)._readingCodes();

            expect(result).toBe(false);
        });
    });

    describe('_readingCLCodes', () => {
        it('should return false when a code-length code cannot be read', () => {
            (inflater as any)._clCodeCount = 5;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(-1);

            const result = (inflater as any)._readingCLCodes();

            expect(result).toBe(false);
        });

        it('should return false when _readingTCBefore fails after building CL tree', () => {
            (inflater as any)._clCodeCount = 4;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._llCodeCount = 257;
            (inflater as any)._dCodeCount = 1;
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0);

            spyOn(_HuffmanTree.prototype as any, '_load').and.stub();
            spyOn(inflater as any, '_readingTCBefore').and.returnValue(false);

            const result = (inflater as any)._readingCLCodes();

            expect(result).toBe(false);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.readingTcBefore);
        });
    });

    describe('_readingTCBefore', () => {
        it('should return false when CL tree symbol cannot be read', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcBefore;
            (inflater as any)._caSize = 1;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._clTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(-1)
            } as any;

            const result = (inflater as any)._readingTCBefore();

            expect(result).toBe(false);
        });

        it('should write literal code directly when lengthCode is <= 15', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcBefore;
            (inflater as any)._caSize = 1;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._clTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(7)
            } as any;

            const result = (inflater as any)._readingTCBefore();

            expect(result).toBe(true);
            expect((inflater as any)._codeList[0]).toBe(7);
            expect((inflater as any)._loopCounter).toBe(1);
        });

        it('should move to readingTcAfter when repeat code needs more bits but they are unavailable', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcBefore;
            (inflater as any)._caSize = 3;
            (inflater as any)._loopCounter = 1;
            (inflater as any)._codeList[0] = 5;
            (inflater as any)._clTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(16)
            } as any;
            (inflater as any)._input._availableBits = jasmine.createSpy('_availableBits').and.returnValue(false);

            const result = (inflater as any)._readingTCBefore();

            expect(result).toBe(false);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.readingTcAfter);
        });

        it('should continue from readingTcAfter and repeat previous code for code 16', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcAfter;
            (inflater as any)._lengthCode = 16;
            (inflater as any)._caSize = 4;
            (inflater as any)._loopCounter = 1;
            (inflater as any)._codeList[0] = 6;
            (inflater as any)._input._availableBits = jasmine.createSpy('_availableBits').and.returnValue(true);
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0);

            const result = (inflater as any)._readingTCBefore();

            expect(result).toBe(true);
            expect((inflater as any)._codeList[1]).toBe(6);
            expect((inflater as any)._codeList[2]).toBe(6);
            expect((inflater as any)._codeList[3]).toBe(6);
            expect((inflater as any)._loopCounter).toBe(4);
        });

        it('should repeat zeros for code 17', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcAfter;
            (inflater as any)._lengthCode = 17;
            (inflater as any)._caSize = 3;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._input._availableBits = jasmine.createSpy('_availableBits').and.returnValue(true);
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0);

            const result = (inflater as any)._readingTCBefore();

            expect(result).toBe(true);
            expect((inflater as any)._codeList[0]).toBe(0);
            expect((inflater as any)._codeList[1]).toBe(0);
            expect((inflater as any)._codeList[2]).toBe(0);
        });

        it('should repeat zeros for code 18', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcAfter;
            (inflater as any)._lengthCode = 18;
            (inflater as any)._caSize = 11;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._input._availableBits = jasmine.createSpy('_availableBits').and.returnValue(true);
            (inflater as any)._input._getBits = jasmine.createSpy('_getBits').and.returnValue(0);

            const result = (inflater as any)._readingTCBefore();

            expect(result).toBe(true);
            for (let i: number = 0; i < 11; i++) {
                expect((inflater as any)._codeList[i]).toBe(0);
            }
        });
    });
});

describe('_Inflater safe additional coverage', () => {
    let inflater: _Inflater;

    function createInputStub(): any {
        return {
            _getBits: jasmine.createSpy('_getBits').and.returnValue(0),
            _availableBits: jasmine.createSpy('_availableBits').and.returnValue(true),
            _skipByteBoundary: jasmine.createSpy('_skipByteBoundary'),
            _setInput: jasmine.createSpy('_setInput')
        };
    }

    function createOutputStub(unusedBytes: number = 300): any {
        return {
            _unusedBytes: unusedBytes,
            _copyFrom: jasmine.createSpy('_copyFrom').and.returnValue(0),
            _copyTo: jasmine.createSpy('_copyTo').and.returnValue({ count: 0, data: [] }),
            _write: jasmine.createSpy('_write'),
            _writeLD: jasmine.createSpy('_writeLD')
        };
    }

    beforeEach(() => {
        inflater = new _Inflater();
        (inflater as any)._input = createInputStub();
        (inflater as any)._output = createOutputStub();
    });

    describe('_decodeUncompressedBlock', () => {
        it('should execute break after unCompressedAligning path and then return false from unCompressedByte1', () => {
            (inflater as any)._inflaterState = _InflaterState.unCompressedAligning;
            const unCompressedByteSpy: jasmine.Spy = spyOn(inflater as any, '_unCompressedByte').and.callFake((): boolean => {
                // first call from unCompressedAligning succeeds,
                // second call from unCompressedByte1 fails so method returns safely
                if ((unCompressedByteSpy.calls.count() as number) === 1) {
                    return true;
                }
                return false;
            });

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._input._skipByteBoundary).toHaveBeenCalled();
            expect(unCompressedByteSpy).toHaveBeenCalled();
            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
        });

        it('should execute break for unCompressedByte2 case and return false when _unCompressedByte fails', () => {
            (inflater as any)._inflaterState = _InflaterState.unCompressedByte2;
            spyOn(inflater as any, '_unCompressedByte').and.returnValue(false);

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._unCompressedByte).toHaveBeenCalled();
            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
        });

        it('should return true with eob=true when decodeUnCompressedBytes consumes all remaining bytes', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 5;
            (inflater as any)._output._copyFrom.and.returnValue(5);
            (inflater as any)._output._unusedBytes = 10;

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(0);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.readingBFinal);
            expect(result.result).toBe(true);
            expect(result.eob).toBe(true);
        });

        it('should return true with eob=false when output buffer becomes full before block ends', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 8;
            (inflater as any)._output._copyFrom.and.returnValue(3);
            (inflater as any)._output._unusedBytes = 0;

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(5);
            expect(result.result).toBe(true);
            expect(result.eob).toBe(false);
        });

        it('should return false with eob=false when bytes remain and output still has space', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 8;
            (inflater as any)._output._copyFrom.and.returnValue(2);
            (inflater as any)._output._unusedBytes = 4;

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(6);
            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
        });
    });

    describe('_decodeBlock highlighted safe branches', () => {
        it('should return false when _inLength returns false from decodeTop length-symbol path', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeTop;
            (inflater as any)._output._unusedBytes = 300;
            (inflater as any)._llTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(265)
            };
            spyOn(inflater as any, '_inLength').and.returnValue({ value: false, fb: 300 });

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._inLength).toHaveBeenCalled();
            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
        });

        it('should return false when state is iLength and _inLength returns false', () => {
            (inflater as any)._inflaterState = _InflaterState.iLength;
            (inflater as any)._output._unusedBytes = 300;
            spyOn(inflater as any, '_inLength').and.returnValue({ value: false, fb: 300 });

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._inLength).toHaveBeenCalled();
            expect(result.result).toBe(false);
        });

        it('should return false when state is fLength and _fLength returns false', () => {
            (inflater as any)._inflaterState = _InflaterState.fLength;
            (inflater as any)._output._unusedBytes = 300;
            spyOn(inflater as any, '_fLength').and.returnValue({ value: false, fb: 300 });

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._fLength).toHaveBeenCalled();
            expect(result.result).toBe(false);
        });

        it('should return false when state is dCode and _dcode returns false', () => {
            (inflater as any)._inflaterState = _InflaterState.dCode;
            (inflater as any)._output._unusedBytes = 300;
            spyOn(inflater as any, '_dcode').and.returnValue({ value: false, fb: 300 });

            const result: { result: boolean; eob: boolean; output: any } = (inflater as any)._decodeBlock(false);

            expect((inflater as any)._dcode).toHaveBeenCalled();
            expect(result.result).toBe(false);
        });
    });

    describe('_decodeDynamicBlockHeader highlighted break paths', () => {
        beforeEach(() => {
            spyOn(_HuffmanTree.prototype as any, '_load').and.stub();
        });

        it('should cover readingNdCodes case and its break path', () => {
            (inflater as any)._inflaterState = _InflaterState.readingNdCodes;
            (inflater as any)._llCodeCount = 1;
            (inflater as any)._dCodeCount = 1;
            (inflater as any)._codeList[0] = 1;
            (inflater as any)._codeList[1] = 1;
            spyOn(inflater as any, '_readingNDCodes').and.returnValue(true);

            const result: boolean = (inflater as any)._decodeDynamicBlockHeader();

            expect((inflater as any)._readingNDCodes).toHaveBeenCalled();
            expect(result).toBe(true);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.decodeTop);
        });

        it('should cover readingCodes case and its break path', () => {
            (inflater as any)._inflaterState = _InflaterState.readingCodes;
            (inflater as any)._llCodeCount = 1;
            (inflater as any)._dCodeCount = 1;
            (inflater as any)._codeList[0] = 1;
            (inflater as any)._codeList[1] = 1;
            spyOn(inflater as any, '_readingCodes').and.returnValue(true);

            const result: boolean = (inflater as any)._decodeDynamicBlockHeader();

            expect((inflater as any)._readingCodes).toHaveBeenCalled();
            expect(result).toBe(true);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.decodeTop);
        });

        it('should return false in readingNdCodes case when _readingNDCodes fails', () => {
            (inflater as any)._inflaterState = _InflaterState.readingNdCodes;
            spyOn(inflater as any, '_readingNDCodes').and.returnValue(false);

            const result: boolean = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(false);
        });

        it('should return false in readingCodes case when _readingCodes fails', () => {
            (inflater as any)._inflaterState = _InflaterState.readingCodes;
            spyOn(inflater as any, '_readingCodes').and.returnValue(false);

            const result: boolean = (inflater as any)._decodeDynamicBlockHeader();

            expect(result).toBe(false);
        });
    });

    describe('_readingTCBefore highlighted safe branches', () => {
        it('should return false and move to readingTcAfter when extra bits are not available', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcBefore;
            (inflater as any)._caSize = 2;
            (inflater as any)._loopCounter = 1;
            (inflater as any)._codeList[0] = 5;
            (inflater as any)._clTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(16)
            };
            (inflater as any)._input._availableBits.and.returnValue(false);

            const result: boolean = (inflater as any)._readingTCBefore();

            expect(result).toBe(false);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.readingTcAfter);
        });

        it('should safely cover lengthCode 16 repeat path when loopCounter is not zero', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcAfter;
            (inflater as any)._lengthCode = 16;
            (inflater as any)._caSize = 4;
            (inflater as any)._loopCounter = 1;
            (inflater as any)._codeList[0] = 9;
            (inflater as any)._input._availableBits.and.returnValue(true);
            (inflater as any)._input._getBits.and.returnValue(0); // repeatCount = 3

            const result: boolean = (inflater as any)._readingTCBefore();

            expect(result).toBe(true);
            expect((inflater as any)._codeList[1]).toBe(9);
            expect((inflater as any)._codeList[2]).toBe(9);
            expect((inflater as any)._codeList[3]).toBe(9);
            expect((inflater as any)._loopCounter).toBe(4);
        });

        it('should cover lengthCode <= 15 branch', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcBefore;
            (inflater as any)._caSize = 1;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._clTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(7)
            };

            const result: boolean = (inflater as any)._readingTCBefore();

            expect(result).toBe(true);
            expect((inflater as any)._codeList[0]).toBe(7);
            expect((inflater as any)._loopCounter).toBe(1);
        });

        it('should return false when _getNextSymbol returns negative', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcBefore;
            (inflater as any)._caSize = 1;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._clTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(-1)
            };

            const result: boolean = (inflater as any)._readingTCBefore();

            expect(result).toBe(false);
        });
    });
});



describe('_Inflater highlighted branch coverage', () => {
    let inflater: _Inflater;

    function createInputStub(): any {
        return {
            _getBits: jasmine.createSpy('_getBits').and.returnValue(0),
            _availableBits: jasmine.createSpy('_availableBits').and.returnValue(true),
            _skipByteBoundary: jasmine.createSpy('_skipByteBoundary'),
            _setInput: jasmine.createSpy('_setInput')
        };
    }

    function createOutputStub(unusedBytes: any = 300): any {
        return {
            _unusedBytes: unusedBytes,
            _copyFrom: jasmine.createSpy('_copyFrom').and.returnValue(0),
            _copyTo: jasmine.createSpy('_copyTo').and.returnValue({ count: 0, data: [] }),
            _write: jasmine.createSpy('_write'),
            _writeLD: jasmine.createSpy('_writeLD')
        };
    }

    /**
     * Creates an object whose numeric value changes across comparisons.
     * Useful to safely exit loops like:
     *   while (fb > 258) { ... default: break; }
     */
    function createSequentialNumber(values: number[]): any {
        let index: number = 0;
        return {
            valueOf(): number {
                const value: number = values[Math.min(index, values.length - 1)];
                index++;
                return value;
            }
        };
    }

    beforeEach(() => {
        inflater = new _Inflater();
        (inflater as any)._input = createInputStub();
        (inflater as any)._output = createOutputStub();
    });

    describe('_decodeUncompressedBlock highlighted lines', () => {
        it('should cover the break after unCompressedAligning by succeeding once and then exiting through byte1 failure', () => {
            (inflater as any)._inflaterState = _InflaterState.unCompressedAligning;

            let callCount: number = 0;
            spyOn(inflater as any, '_unCompressedByte').and.callFake((): boolean => {
                callCount++;
                // first call from unCompressedAligning => true
                // second call from unCompressedByte1 => false
                return callCount === 1;
            });

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._input._skipByteBoundary).toHaveBeenCalled();
            expect((inflater as any)._unCompressedByte).toHaveBeenCalled();
            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
        });

        it('should cover the break after unCompressedByte2 case and then finish through decodeUnCompressedBytes without timeout', () => {
            (inflater as any)._inflaterState = _InflaterState.unCompressedByte2;
            (inflater as any)._bLength = 4;

            let callCount: number = 0;
            spyOn(inflater as any, '_unCompressedByte').and.callFake((): boolean => {
                callCount++;
                if (callCount === 1) {
                    (inflater as any)._inflaterState = _InflaterState.unCompressedByte3;
                    return true;
                }
                if (callCount === 2) {
                    (inflater as any)._inflaterState = _InflaterState.unCompressedByte4;
                    return true;
                }
                (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
                return true;
            });

            (inflater as any)._output._copyFrom.and.returnValue(4);
            (inflater as any)._output._unusedBytes = 10;

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._unCompressedByte).toHaveBeenCalled();
            expect(result.result).toBe(true);
            expect(result.eob).toBe(true);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.readingBFinal);
        });

        it('should cover decodeUnCompressedBytes branch when _bLength becomes 0', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 5;
            (inflater as any)._output._copyFrom.and.returnValue(5);
            (inflater as any)._output._unusedBytes = 8;

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(0);
            expect(result.result).toBe(true);
            expect(result.eob).toBe(true);
            expect((inflater as any)._inflaterState).toBe(_InflaterState.readingBFinal);
        });

        it('should cover decodeUnCompressedBytes branch when output buffer becomes full', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 9;
            (inflater as any)._output._copyFrom.and.returnValue(3);
            (inflater as any)._output._unusedBytes = 0;

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(6);
            expect(result.result).toBe(true);
            expect(result.eob).toBe(false);
        });

        it('should cover decodeUnCompressedBytes final false return when bytes remain and output still has space', () => {
            (inflater as any)._inflaterState = _InflaterState.decodeUnCompressedBytes;
            (inflater as any)._bLength = 9;
            (inflater as any)._output._copyFrom.and.returnValue(2);
            (inflater as any)._output._unusedBytes = 5;

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeUncompressedBlock(false);

            expect((inflater as any)._bLength).toBe(7);
            expect(result.result).toBe(false);
            expect(result.eob).toBe(false);
        });

        /**
         * IMPORTANT:
         * Do not write a runtime test for the default block in _decodeUncompressedBlock().
         * That branch sits inside while(true) and only breaks the switch, not the loop.
         * Entering it will cause an infinite loop / timeout.
         */
    });

    describe('_decodeBlock highlighted lines', () => {
        it('should cover the break after iLength case', () => {
            (inflater as any)._inflaterState = _InflaterState.iLength;
            (inflater as any)._output = createOutputStub(300);

            spyOn(inflater as any, '_inLength').and.returnValue({
                value: true,
                fb: 0
            });

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeBlock(false);

            expect((inflater as any)._inLength).toHaveBeenCalled();
            expect(result.result).toBe(true);
            expect(result.eob).toBe(false);
        });

        it('should cover the break after fLength case', () => {
            (inflater as any)._inflaterState = _InflaterState.fLength;
            (inflater as any)._output = createOutputStub(300);

            spyOn(inflater as any, '_fLength').and.returnValue({
                value: true,
                fb: 0
            });

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeBlock(false);

            expect((inflater as any)._fLength).toHaveBeenCalled();
            expect(result.result).toBe(true);
            expect(result.eob).toBe(false);
        });

        it('should cover the break after dCode case', () => {
            (inflater as any)._inflaterState = _InflaterState.dCode;
            (inflater as any)._output = createOutputStub(300);

            spyOn(inflater as any, '_dcode').and.returnValue({
                value: true,
                fb: 0
            });

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeBlock(false);

            expect((inflater as any)._dcode).toHaveBeenCalled();
            expect(result.result).toBe(true);
            expect(result.eob).toBe(false);
        });

        it('should cover the default block in _decodeBlock safely without timeout', () => {
            (inflater as any)._inflaterState = _InflaterState.readingHeader;
            const fbSequence: any = createSequentialNumber([300, 0]);
            (inflater as any)._output = createOutputStub(fbSequence);

            const result: { result: boolean; eob: boolean; output: any } =
                (inflater as any)._decodeBlock(false);

            expect(result.result).toBe(true);
            expect(result.eob).toBe(false);
            expect(result.output).toBe((inflater as any)._output);
        });
    });

    describe('_readingTCBefore highlighted throw line', () => {
        it('should cover the throw branch when lengthCode is 16 and loopCounter is 0', () => {
            (inflater as any)._inflaterState = _InflaterState.readingTcBefore;
            (inflater as any)._caSize = 1;
            (inflater as any)._loopCounter = 0;
            (inflater as any)._clTree = {
                _getNextSymbol: jasmine.createSpy('_getNextSymbol').and.returnValue(16)
            };
            (inflater as any)._input._availableBits.and.returnValue(true);

            expect((): void => {
                (inflater as any)._readingTCBefore();
            }).toThrowError('Invalid data.');
        });
        it('should cover the default branch in _decodeUncompressedBlock without timeout', () => {
            const inflater: any = new _Inflater();
            inflater._input = {
                _skipByteBoundary: jasmine.createSpy('_skipByteBoundary'),
                _getBits: jasmine.createSpy('_getBits').and.returnValue(0),
                _availableBits: jasmine.createSpy('_availableBits').and.returnValue(true)
            };

            inflater._output = {
                _copyFrom: jasmine.createSpy('_copyFrom').and.returnValue(0),
                _unusedBytes: 10
            };

            let stateReadCount: number = 0;
            Object.defineProperty(inflater, '_inflaterState', {
                configurable: true,
                get(): number {
                    stateReadCount++;
                    if (stateReadCount === 1) {
                        return 99999; // not a valid inflater state -> goes to default:
                    }
                    throw new Error('__STOP_AFTER_DEFAULT__');
                },
                set(_value: number): void {
                    // no-op setter so the object remains writable if touched elsewhere
                }
            });

            expect((): void => {
                inflater._decodeUncompressedBlock(false);
            }).toThrowError('__STOP_AFTER_DEFAULT__');
        });
    });
});




