
import { PdfPredictorStream } from "../src/pdf/core/predictor-stream";
describe('PdfPredictorStream - uncovered branch coverage', () => {

    function createPredictorInstance(options: {
        rowBytes: number;
        pixBytes?: number;
        bits?: number;
        colors?: number;
        columns?: number;
        bufferLength?: number;
        initialBuffer?: number[];
        getByteValue?: number;
        getBytesValue: number[];
    }): { instance: any; buffer: Uint8Array } {
        const instance: any = Object.create(PdfPredictorStream.prototype);

        const rowBytes: number = options.rowBytes;
        const bufferLength: number = options.bufferLength ?options.bufferLength: 0;
        const totalLength: number = bufferLength + rowBytes;

        const buffer: Uint8Array = new Uint8Array(totalLength > 0 ? totalLength : rowBytes);
        if (options.initialBuffer && options.initialBuffer.length > 0) {
            buffer.set(options.initialBuffer.slice(0, buffer.length));
        }

        instance.rowBytes = rowBytes;
        instance.pixBytes = options.pixBytes ?options.pixBytes: 1;
        instance.bits = options.bits ?options.bits: 8;
        instance.colors = options.colors ?options.colors: 1;
        instance.columns = options.columns ?options.columns: 1;
        instance.bufferLength = bufferLength;
        instance.eof = false;

        instance.ensureBuffer = jasmine.createSpy('ensureBuffer').and.callFake((_size: number) => {
            return buffer;
        });

        instance.stream = {
            getByte: jasmine.createSpy('getByte').and.returnValue(options.getByteValue ?options.getByteValue: 0),
            getBytes: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array(options.getBytesValue))
        };

        return { instance, buffer };
    }

    it('should cover readBlockTiff final packed-bits branch when outbits > 0', () => {
        const { instance, buffer } = createPredictorInstance({
            rowBytes: 1,
            bits: 4,
            colors: 1,
            columns: 1,
            bufferLength: 0,
            getBytesValue: [0xAB]
        });

        instance.readBlockTiff();

        expect(instance.eof).toBeFalsy();
        expect(instance.bufferLength).toBe(1);
        expect(buffer[0]).toBe(0xAB);
        expect(instance.stream.getBytes).toHaveBeenCalledWith(1);
    });

    it('should cover readBlockPng case 4 negative pa, pb and pc branches', () => {
    
        const { instance, buffer } = createPredictorInstance({
            rowBytes: 2,
            pixBytes: 1,
            bufferLength: 2,
            initialBuffer: [250, 5, 0, 0],
            getByteValue: 4,
            getBytesValue: [10, 1]
        });

        instance.readBlockPng();

        expect(instance.eof).toBeFalsy();
        expect(instance.bufferLength).toBe(4);

        // Current row is written starting at index 2
        expect(buffer[2]).toBe((250 + 10) & 0xFF); // 4
        expect(buffer[3]).toBe((buffer[2] + 1) & 0xFF); // chosen branch becomes left + c here
        expect(instance.stream.getByte).toHaveBeenCalled();
        expect(instance.stream.getBytes).toHaveBeenCalledWith(2);
    });

    it('should cover readBlockPng case 4 final explicit else branch (use upLeft + c)', () => {
        
        const { instance, buffer } = createPredictorInstance({
            rowBytes: 2,
            pixBytes: 1,
            bufferLength: 2,
            initialBuffer: [100, 90, 0, 0],
            getByteValue: 4,
            getBytesValue: [10, 5]
        });

        instance.readBlockPng();

        expect(instance.eof).toBeFalsy();
        expect(instance.bufferLength).toBe(4);

        // First byte of current row
        expect(buffer[2]).toBe(110);

        // Second byte should come from the final explicit else => upLeft + c
        expect(buffer[3]).toBe(105);
    });

    it('should safely return on EOF in readBlockPng without throwing', () => {
        const { instance } = createPredictorInstance({
            rowBytes: 2,
            pixBytes: 1,
            bufferLength: 0,
            getByteValue: 4,
            getBytesValue: []
        });

        expect(() => {
            instance.readBlockPng();
        }).not.toThrow();

        expect(instance.eof).toBeTruthy();
    });

    it('should safely return on EOF in readBlockTiff without throwing', () => {
        const { instance } = createPredictorInstance({
            rowBytes: 1,
            bits: 4,
            colors: 1,
            columns: 1,
            bufferLength: 0,
            getBytesValue: []
        });

        expect(() => {
            instance.readBlockTiff();
        }).not.toThrow();

        expect(instance.eof).toBeTruthy();
    });
});
``
