import { FormatError } from '@syncfusion/ej2-pdf';
interface CharacterMapMock {
    vertical: boolean;
    _insertCodeSpaceRange: jasmine.Spy;
    _mapOne: jasmine.Spy;
    _mapCharacterIdentifierRange: jasmine.Spy;
    _mapRangeToDestination: jasmine.Spy;
}
import { _PdfBinaryCharacterMapReader, _PdfBinaryCMapStream } from '../../src/pdf-data-extract/core/text-extraction/binary-cmap-reader';

function createCharacterMap(): CharacterMapMock {
    return {
        vertical: false,
        _insertCodeSpaceRange: jasmine.createSpy('_insertCodeSpaceRange'),
        _mapOne: jasmine.createSpy('_mapOne'),
        _mapCharacterIdentifierRange: jasmine.createSpy('_mapCharacterIdentifierRange'),
        _mapRangeToDestination: jasmine.createSpy('_mapRangeToDestination')
    };
}

describe('_PdfBinaryCharacterMapReader strict AAA coverage', () => {
    it('should convert big-endian hex bytes to an integer', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const data: Uint8Array = new Uint8Array([0x01, 0x02, 0x03]);

        // Act
        const result: number = reader._convertHexToInt(data, 2);

        // Assert
        expect(result).toBe(0x010203);
    });

    it('should convert hex arrays to string for size 1, size 3 and default branch', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const sizeOneData: Uint8Array = new Uint8Array([65, 66]);
        const sizeThreeData: Uint8Array = new Uint8Array([65, 66, 67, 68]);
        const defaultData: Uint8Array = new Uint8Array([65, 66, 67]);

        // Act
        const sizeOneResult: string = reader._hexArrayToString(sizeOneData, 1);
        const sizeThreeResult: string = reader._hexArrayToString(sizeThreeData, 3);
        const defaultResult: string = reader._hexArrayToString(defaultData, 2);

        // Assert
        expect(sizeOneResult).toBe('AB');
        expect(sizeThreeResult).toBe('ABCD');
        expect(defaultResult).toBe('ABC');
    });

    it('should add two hex byte arrays into the first array', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const data: Uint8Array = new Uint8Array([0x00, 0xFF]);
        const incrementData: Uint8Array = new Uint8Array([0x00, 0x02]);

        // Act
        reader._addHexData(data, incrementData, 1);

        // Assert
        expect(Array.from(data)).toEqual([0x01, 0x01]);
    });

    it('should increment a multi-byte big-endian number in place', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const data: Uint8Array = new Uint8Array([0x00, 0xFF]);

        // Act
        reader._performHexIncrement(data, 1);

        // Assert
        expect(Array.from(data)).toEqual([0x01, 0x00]);
    });

    it('should process type 7 metadata branches and return enhance(useCharacterMap)', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();
        const enhanceSpy: jasmine.Spy = jasmine.createSpy('enhance').and.returnValue({ marker: 'enhanced' });

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [1, 224, 225, -1];

        const readByteDataSpy: jasmine.Spy = spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readStringIndex: number = 0;
        const readStringSpy: jasmine.Spy = spyOn(_PdfBinaryCMapStream.prototype, '_readStringFromData').and.callFake(function (): string {
            readStringIndex++;
            if (readStringIndex === 1) {
                return 'IgnoreName';
            }
            return 'UseMapName';
        });

        // Act
        const result: object = reader._process(new Uint8Array([0]), characterMap, enhanceSpy);

        // Assert
        expect(readByteDataSpy.calls.count()).toBe(4);
        expect(readStringSpy.calls.count()).toBe(2);
        expect(characterMap.vertical).toBeTruthy();
        expect(enhanceSpy).toHaveBeenCalledWith('UseMapName');
        expect(result).toEqual({ marker: 'enhanced' });
    });

    it('should throw FormatError when dataSize + 1 exceeds maximumSize', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        reader._maximumSize = 15;
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 15];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        // Act / Assert
        expect(function (): void {
            reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance'));
        }).toBeTruthy();
    });

    it('should process type 0 and insert code space ranges including child-items loop', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 0, -1];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readNumberIndex: number = 0;
        const readNumberValues: number[] = [2];

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.callFake(function (): number {
            const value: number = readNumberValues[readNumberIndex];
            readNumberIndex++;
            return value;
        });

        let readHexDataNumberCallCount: number = 0;

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexData').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexDataNumber').and.callFake(function (output: Uint8Array): void {
            readHexDataNumberCallCount++;
            if (readHexDataNumberCallCount === 1) {
                output[0] = 1;
            } else if (readHexDataNumberCallCount === 2) {
                output[0] = 1;
            } else {
                output[0] = 1;
            }
        });

        // Act
        const result: CharacterMapMock = reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance')) as CharacterMapMock;

        // Assert
        expect(characterMap._insertCodeSpaceRange.calls.count()).toBe(2);
        expect(characterMap._insertCodeSpaceRange.calls.argsFor(0)).toEqual([1, 1, 2]);
        expect(characterMap._insertCodeSpaceRange.calls.argsFor(1)).toEqual([1, 4, 5]);
        expect(result).toBe(characterMap);
    });

    it('should process type 1 and execute the child-items loop without mapping values', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 32, -1];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readNumberIndex: number = 0;
        const readNumberValues: number[] = [2, 99, 100];

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.callFake(function (): number {
            const value: number = readNumberValues[readNumberIndex];
            readNumberIndex++;
            return value;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexData').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexDataNumber').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
        });

        // Act
        const result: CharacterMapMock = reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance')) as CharacterMapMock;

        // Assert
        expect(characterMap._insertCodeSpaceRange).not.toHaveBeenCalled();
        expect(characterMap._mapOne).not.toHaveBeenCalled();
        expect(characterMap._mapCharacterIdentifierRange).not.toHaveBeenCalled();
        expect(characterMap._mapRangeToDestination).not.toHaveBeenCalled();
        expect(result).toBe(characterMap);
    });

    it('should process type 2 with non-sequence branch and mapOne in the child-items loop', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 64, -1];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readNumberIndex: number = 0;
        const readNumberValues: number[] = [2, 100];

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.callFake(function (): number {
            const value: number = readNumberValues[readNumberIndex];
            readNumberIndex++;
            return value;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexData').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexDataNumber').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readSignedData').and.returnValue(2);

        // Act
        reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance'));

        // Assert
        expect(characterMap._mapOne.calls.count()).toBe(2);
        expect(characterMap._mapOne.calls.argsFor(0)).toEqual([1, 100]);
        expect(characterMap._mapOne.calls.argsFor(1)).toEqual([3, 103]);
    });

    it('should process type 3 with non-sequence branch and map character identifier ranges', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 96, -1];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readNumberIndex: number = 0;
        const readNumberValues: number[] = [2, 10, 20];

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.callFake(function (): number {
            const value: number = readNumberValues[readNumberIndex];
            readNumberIndex++;
            return value;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexData').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
        });

        let readHexDataNumberCallCount: number = 0;
        spyOn(_PdfBinaryCMapStream.prototype, '_readHexDataNumber').and.callFake(function (output: Uint8Array): void {
            readHexDataNumberCallCount++;
            output[0] = 1;
        });

        // Act
        reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance'));

        // Assert
        expect(characterMap._mapCharacterIdentifierRange.calls.count()).toBe(2);
        expect(characterMap._mapCharacterIdentifierRange.calls.argsFor(0)).toEqual([1, 2, 10]);
        expect(characterMap._mapCharacterIdentifierRange.calls.argsFor(1)).toEqual([4, 5, 20]);
    });

    it('should process type 3 with sequence branch using start.set(end)', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 112, -1];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readNumberIndex: number = 0;
        const readNumberValues: number[] = [2, 10, 20];

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.callFake(function (): number {
            const value: number = readNumberValues[readNumberIndex];
            readNumberIndex++;
            return value;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexData').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexDataNumber').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
        });

        // Act
        reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance'));

        // Assert
        expect(characterMap._mapCharacterIdentifierRange.calls.count()).toBe(2);
        expect(characterMap._mapCharacterIdentifierRange.calls.argsFor(0)).toEqual([1, 2, 10]);
        expect(characterMap._mapCharacterIdentifierRange.calls.argsFor(1)).toEqual([3, 4, 20]);
    });

    it('should process type 4 with non-sequence branch and mapOne using _hexArrayToString', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 129, -1];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readNumberIndex: number = 0;
        const readNumberValues: number[] = [2];

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.callFake(function (): number {
            const value: number = readNumberValues[readNumberIndex];
            readNumberIndex++;
            return value;
        });

        let readHexDataCallCount: number = 0;
        spyOn(_PdfBinaryCMapStream.prototype, '_readHexData').and.callFake(function (output: Uint8Array): void {
            readHexDataCallCount++;
            if (readHexDataCallCount === 1) {
                output[0] = 1;
                output[1] = 0;
            } else {
                output[0] = 65;
                output[1] = 66;
            }
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexDataNumber').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
            output[1] = 0;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexSignedData').and.callFake(function (output: Uint8Array): void {
            output[0] = 0;
            output[1] = 0;
        });

        // Act
        reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance'));

        // Assert
        expect(characterMap._mapOne.calls.count()).toBe(2);
        expect(characterMap._mapOne.calls.argsFor(0)).toEqual([256, 'AB']);
        expect(characterMap._mapOne.calls.argsFor(1)).toBeTruthy();
    });

    it('should process type 5 with non-sequence branch and map ranges to destination strings', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 161, -1];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readNumberIndex: number = 0;
        const readNumberValues: number[] = [2];

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.callFake(function (): number {
            const value: number = readNumberValues[readNumberIndex];
            readNumberIndex++;
            return value;
        });

        let readHexDataCallCount: number = 0;
        spyOn(_PdfBinaryCMapStream.prototype, '_readHexData').and.callFake(function (output: Uint8Array): void {
            readHexDataCallCount++;
            if (readHexDataCallCount === 1) {
                output[0] = 1;
                output[1] = 0;
            } else if (readHexDataCallCount === 2) {
                output[0] = 65;
                output[1] = 66;
            } else {
                output[0] = 67;
                output[1] = 68;
            }
        });

        let readHexDataNumberCallCount: number = 0;
        spyOn(_PdfBinaryCMapStream.prototype, '_readHexDataNumber').and.callFake(function (output: Uint8Array): void {
            readHexDataNumberCallCount++;
            output[0] = 1;
            output[1] = 0;
        });

        // Act
        reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance'));

        // Assert
        expect(characterMap._mapRangeToDestination.calls.count()).toBe(2);
        expect(characterMap._mapRangeToDestination.calls.argsFor(0)).toEqual([256, 512, 'AB']);
        expect(characterMap._mapRangeToDestination.calls.argsFor(1)).toEqual([769, 1025, 'CD']);
    });

    it('should process type 5 with sequence branch using start.set(end)', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 177, -1];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        let readNumberIndex: number = 0;
        const readNumberValues: number[] = [2];

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.callFake(function (): number {
            const value: number = readNumberValues[readNumberIndex];
            readNumberIndex++;
            return value;
        });

        let readHexDataCallCount: number = 0;
        spyOn(_PdfBinaryCMapStream.prototype, '_readHexData').and.callFake(function (output: Uint8Array): void {
            readHexDataCallCount++;
            if (readHexDataCallCount === 1) {
                output[0] = 1;
                output[1] = 0;
            } else {
                output[0] = 65;
                output[1] = 66;
            }
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readHexDataNumber').and.callFake(function (output: Uint8Array): void {
            output[0] = 1;
            output[1] = 0;
        });

        // Act
        reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance'));

        // Assert
        expect(characterMap._mapRangeToDestination.calls.count()).toBe(2);
        expect(characterMap._mapRangeToDestination.calls.argsFor(0)).toEqual([256, 512, 'AB']);
        expect(characterMap._mapRangeToDestination.calls.argsFor(1)).toEqual([513, 769, 'AB']);
    });

    it('should throw an error for an unknown type in _process', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();

        let readByteDataIndex: number = 0;
        const readByteDataValues: number[] = [0, 192];

        spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            const value: number = readByteDataValues[readByteDataIndex];
            readByteDataIndex++;
            return value;
        });

        spyOn(_PdfBinaryCMapStream.prototype, '_readNumber').and.returnValue(1);

        // Act / Assert
        expect(function (): void {
            reader._process(new Uint8Array([0]), characterMap, jasmine.createSpy('enhance'));
        }).toThrowError('BinaryCMapReader.process - unknown type: 6');
    });
});

describe('_PdfBinaryCMapStream strict AAA coverage', () => {
    it('should initialize constructor fields correctly', () => {
        // Arrange
        const data: Uint8Array = new Uint8Array([1, 2, 3]);

        // Act
        const stream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(data);

        // Assert
        expect(stream._buffer).toBe(data);
        expect(stream._pos).toBe(0);
        expect(stream._end).toBe(3);
        expect(stream._tempBuffer.length).toBe(stream._maxEncodedNumberSize);
    });

    it('should read bytes and return -1 at the end of the stream', () => {
        // Arrange
        const stream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(new Uint8Array([10, 20]));

        // Act
        const first: number = stream._readByteData();
        const second: number = stream._readByteData();
        const third: number = stream._readByteData();

        // Assert
        expect(first).toBe(10);
        expect(second).toBe(20);
        expect(third).toBe(-1);
    });

    it('should read a variable-length number', () => {
        // Arrange
        const stream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(new Uint8Array([0x82, 0x02]));

        // Act
        const result: number = stream._readNumber();

        // Assert
        expect(result).toBe(258);
    });

    it('should read signed zig-zag encoded data for positive and negative values', () => {
        // Arrange
        const positiveStream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(new Uint8Array([0x02]));
        const negativeStream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(new Uint8Array([0x01]));

        // Act
        const positiveResult: number = positiveStream._readSignedData();
        const negativeResult: number = negativeStream._readSignedData();

        // Assert
        expect(positiveResult).toBe(1);
        expect(negativeResult).toBe(-1);
    });

    it('should read raw hex data into the destination array', () => {
        // Arrange
        const stream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(new Uint8Array([11, 12, 13]));
        const output: Uint8Array = new Uint8Array(3);

        // Act
        stream._readHexData(output, 2);

        // Assert
        expect(Array.from(output)).toEqual([11, 12, 13]);
        expect(stream._pos).toBe(3);
    });

    it('should read signed hex-encoded data and apply sign extension', () => {
        // Arrange
        const negativeStream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(new Uint8Array([0x01]));
        const positiveStream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(new Uint8Array([0x02]));
        const negativeOutput: Uint8Array = new Uint8Array(1);
        const positiveOutput: Uint8Array = new Uint8Array(1);

        // Act
        negativeStream._readHexSignedData(negativeOutput, 0);
        positiveStream._readHexSignedData(positiveOutput, 0);

        // Assert
        expect(Array.from(negativeOutput)).toEqual([255]);
        expect(Array.from(positiveOutput)).toEqual([1]);
    });

    it('should read a string from encoded numeric character codes', () => {
        // Arrange
        const stream: _PdfBinaryCMapStream = new _PdfBinaryCMapStream(new Uint8Array([0x03, 0x41, 0x42, 0x43]));

        // Act
        const result: string = stream._readStringFromData();

        // Assert
        expect(result).toBe('ABC');
    });

    it('should throw the expected invalid dataSize error when dataSize plus one exceeds maximumSize', () => {
        // Arrange
        const reader: _PdfBinaryCharacterMapReader = new _PdfBinaryCharacterMapReader();
        const characterMap: CharacterMapMock = createCharacterMap();
        const enhanceSpy: jasmine.Spy = jasmine.createSpy('enhance');

        reader._maximumSize = 15;

        let readByteCallCount: number = 0;
        const readByteDataSpy: jasmine.Spy = spyOn(_PdfBinaryCMapStream.prototype, '_readByteData').and.callFake(function (): number {
            readByteCallCount++;
            if (readByteCallCount === 1) {
                return 0;
            }
            if (readByteCallCount === 2) {
                return 15;
            }
            return -1;
        });

        let thrownError: Error;

        // Act
        try {
            reader._process(new Uint8Array([0]), characterMap, enhanceSpy);
        } catch (error) {
            thrownError = error as Error;
        }

        // Assert
        expect(thrownError).toBeDefined();
        expect(thrownError.message).toBe('BinaryCMapReader has encountered an invalid dataSize value.');
        expect(readByteDataSpy.calls.count()).toBe(2);
        expect(characterMap.vertical).toBeFalsy();
        expect(enhanceSpy).not.toHaveBeenCalled();
        expect(characterMap._insertCodeSpaceRange).not.toHaveBeenCalled();
        expect(characterMap._mapOne).not.toHaveBeenCalled();
        expect(characterMap._mapCharacterIdentifierRange).not.toHaveBeenCalled();
        expect(characterMap._mapRangeToDestination).not.toHaveBeenCalled();
    });

});
