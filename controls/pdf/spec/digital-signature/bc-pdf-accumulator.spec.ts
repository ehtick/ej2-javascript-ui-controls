import { _PdfNativeAccumulatorSink, _PdfNativeHashInput } from '../../src/pdf/core/security/digital-signature/signature/pdf-accumulator';

describe('Pdf accumulator and hash input behavior tests', () => {

    it('setResult replaces events and result', () => {
        // Arrange
        const sink = new _PdfNativeAccumulatorSink();
        const bytes = new Uint8Array([1, 2, 3]);
        // Act
        sink._setResult(bytes);
        // Assert
        expect(sink._events.length).toBe(1);
        expect(Array.from(sink._events[0].bytes)).toEqual([1, 2, 3]);
        expect(Array.from(sink._getResult() as Uint8Array)).toEqual([1, 2, 3]);
    });

    it('_getResult returns _result when events empty', () => {
        // Arrange
        const sink = new _PdfNativeAccumulatorSink();
        sink._events = [];
        sink._result = new Uint8Array([9]);
        // Act
        const res = sink._getResult();
        // Assert
        expect(Array.from(res as Uint8Array)).toEqual([9]);
    });

    it('_add throws if input already closed', () => {
        // Arrange
        const hasher = { _hash: (d: Uint8Array, o: number, l: number) => new Uint8Array([0]) };
        const outSink = new _PdfNativeAccumulatorSink();
        const input = new _PdfNativeHashInput(hasher, outSink);
        (input as unknown as { _closed: boolean })._closed = true;
        // Act & Assert
        expect(() => input._add(new Uint8Array([1]))).toThrowError('Cannot add data to closed hash input');
    });

    it('_add appends bytes when not closed', () => {
        // Arrange
        const hasher = { _hash: (d: Uint8Array, o: number, l: number) => new Uint8Array([0]) };
        const outSink = new _PdfNativeAccumulatorSink();
        const input = new _PdfNativeHashInput(hasher, outSink);
        // Act
        input._add(new Uint8Array([4, 5]));
        // Assert
        const buffer = (input as unknown as { _buffer: number[] })._buffer;
        expect(buffer).toEqual([4, 5]);
    });

    it('_close returns immediately when already closed', () => {
        // Arrange
        let hashCalled = false;
        let addCalled = false;
        const hasher = { _hash: (d: Uint8Array, o: number, l: number) => { hashCalled = true; return new Uint8Array([0]); } };
        const outSink = new _PdfNativeAccumulatorSink();
        outSink._add = function (e: { bytes: Uint8Array }) { addCalled = true; };
        const input = new _PdfNativeHashInput(hasher, outSink);
        (input as unknown as { _closed: boolean })._closed = true;
        // Act
        input._close();
        // Assert
        expect(hashCalled).toBe(false);
        expect(addCalled).toBe(false);
        expect((input as unknown as { _closed: boolean })._closed).toBe(true);
    });

    it('_close sets closed true and does not call hasher when buffer empty', () => {
        // Arrange
        let hashCalled = false;
        let addCalled = false;
        const hasher = { _hash: (d: Uint8Array, o: number, l: number) => { hashCalled = true; return new Uint8Array([0]); } };
        const outSink = new _PdfNativeAccumulatorSink();
        outSink._add = function (e: { bytes: Uint8Array }) { addCalled = true; };
        const input = new _PdfNativeHashInput(hasher, outSink);
        // Act
        input._close();
        // Assert
        expect((input as unknown as { _closed: boolean })._closed).toBe(true);
        expect(hashCalled).toBe(false);
        expect(addCalled).toBe(false);
    });

    it('_close computes hash and pushes to sink when buffer has data', () => {
        // Arrange
        let hashCalled = false;
        let addCalled = false;
        const hasher = { _hash: (d: Uint8Array, o: number, l: number) => { hashCalled = true; return new Uint8Array([7, 8]); } };
        const outSink = new _PdfNativeAccumulatorSink();
        outSink._add = function (e: { bytes: Uint8Array }) { addCalled = true; expect(Array.from(e.bytes)).toEqual([7, 8]); };
        const input = new _PdfNativeHashInput(hasher, outSink);
        // Act
        input._add(new Uint8Array([10, 11]));
        input._close();
        // Assert
        expect(hashCalled).toBe(true);
        expect(addCalled).toBe(true);
    });

});
