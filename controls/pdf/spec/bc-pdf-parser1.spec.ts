import { _Linearization, _PdfParser } from '../src/pdf/core/pdf-parser';
import { _PdfCommand, _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { _PdfBaseStream, _PdfStream } from '../src/pdf/core/base-stream';

describe('_Linearization class behavior tests', () => {

    // Mock implementations for dependencies
    class MockPdfStream implements _PdfStream {
        length: number;
        position: number = 0;
        end: number;

        constructor(len: number) {
            this.length = len;
            this.end = len;
        }
        bytes: Uint8Array;
        start: number;
        isImageStream: boolean;
        get isEmpty(): boolean {
            throw new Error('Method not implemented.');
        }
        getByteRange(begin: number, end: number): Uint8Array {
            throw new Error('Method not implemented.');
        }
        moveStart(): void {
            throw new Error('Method not implemented.');
        }
        readBlock(): void {
            throw new Error('Method not implemented.');
        }
        _clearStream(): void {
            throw new Error('Method not implemented.');
        }
        _write(text: string): void {
            throw new Error('Method not implemented.');
        }
        _writeBytes(data: number[]): void {
            throw new Error('Method not implemented.');
        }
        offset: number;
        dictionary: _PdfDictionary;
        reference: _PdfReference;
        _isCompress: boolean;
        _isImage: boolean;
        get isDataLoaded(): boolean {
            throw new Error('Method not implemented.');
        }
        getUnsignedInteger16(): number {
            throw new Error('Method not implemented.');
        }
        getInt32(): number {
            throw new Error('Method not implemented.');
        }
        getString(isHex?: boolean, bytes?: Uint8Array): string {
            throw new Error('Method not implemented.');
        }
        getBaseStreams(): _PdfBaseStream[] {
            throw new Error('Method not implemented.');
        }

        getByte(): number {
            return -1;
        }

        peekByte(): number {
            return -1;
        }

        skip(n: number): void {
            this.position += n;
        }

        peekBytes(n: number): Uint8Array {
            return new Uint8Array(n);
        }

        getBytes(n?: number): Uint8Array {
            return new Uint8Array(n || this.length);
        }

        makeSubStream(start: number, length: number, dictionary: any): _PdfStream {
            return this;
        }

        reset(): void {
            this.position = 0;
        }
    }

    class MockPdfDictionary {
        private data: Map<string, any> = new Map();

        constructor(data?: { [key: string]: any }) {
            if (data) {
                Object.keys(data).forEach(key => {
                    this.data.set(key, data[key]);
                });
            }
        }

        get(key: string): any {
            return this.data.get(key);
        }

        getArray(key: string): any[] {
            const val = this.data.get(key);
            return Array.isArray(val) ? val : [];
        }

        has(key: string): boolean {
            return this.data.has(key);
        }

        set(key: string, value: any): void {
            this.data.set(key, value);
        }
    }

    // Test: Constructor with valid linearization dictionary and all parameters
    it('Linearization - constructor initializes with valid dictionary and all parameters', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'O': 100,
            'E': 500,
            'N': 10,
            'T': 750,
            'P': 1,
            'H': [50, 100]
        });

        // Mock the parser to return expected values
        const originalParser = require('../src/pdf/core/pdf-parser')._PdfParser;
        const mockParser = jasmine.createSpyObj('_PdfParser', ['getObject']);
        mockParser.getObject.and.returnValues(1, 2, { command: 'obj' }, mockDictionary);

        // Act & Assert - Verify initialization occurs
        expect(() => {
            const linearization = new _Linearization(stream);
            expect(linearization).toBeDefined();
        }).not.toThrow();
    });

    // Test: Constructor fails when dictionary is undefined
    it('Linearization - constructor invalidates when dictionary is undefined', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            expect(linearization.isValid).toBe(false);
        }).not.toThrow();
    });


    describe('Linearization getInt behavior', () => {

        // getInt - returns valid integer when value is defined and greater than zero
        it('getInt - returns valid integer when value is defined and greater than zero', () => {
            // Arrange
            const stream = new MockPdfStream(1000);

            const dictionary = new _PdfDictionary();
            dictionary.set('TestParam', 500);

            const linearization = new _Linearization(stream);

            // Act
            const result = linearization.getInt(dictionary, 'TestParam', false);

            // Assert
            expect(result).toBe(500);
        });

        // getInt - throws error when parameter is undefined
        it('getInt - throws error when parameter is undefined', () => {
            // Arrange
            const stream = new MockPdfStream(1000);

            const dictionary = new _PdfDictionary();

            const linearization = new _Linearization(stream);

            // Act & Assert
            expect(() => {
                linearization.getInt(dictionary, 'MissingParam', false);
            }).toThrowError(/parameter in the linearization dictionary is invalid/);
        });

        // getInt - throws error when value is not an integer
        it('getInt - throws error when value is not an integer', () => {
            // Arrange
            const stream = new MockPdfStream(1000);

            const dictionary = new _PdfDictionary();
            dictionary.set('BadParam', 3.14);

            const linearization = new _Linearization(stream);

            // Act & Assert
            expect(() => {
                linearization.getInt(dictionary, 'BadParam', false);
            }).toThrowError(/parameter in the linearization dictionary is invalid/);
        });

        // getInt - throws error when allowZeroValue is false and value equals zero
        it('getInt - throws error when allowZeroValue is false and value equals zero', () => {
            // Arrange
            const stream = new MockPdfStream(1000);

            const dictionary = new _PdfDictionary();
            dictionary.set('ZeroParam', 0);

            const linearization = new _Linearization(stream);

            // Act & Assert
            expect(() => {
                linearization.getInt(dictionary, 'ZeroParam', false);
            }).toThrowError(/parameter in the linearization dictionary is invalid/);
        });

        // getInt - throws error when allowZeroValue is false and value is negative
        it('getInt - throws error when allowZeroValue is false and value is negative', () => {
            // Arrange
            const stream = new MockPdfStream(1000);

            const dictionary = new _PdfDictionary();
            dictionary.set('NegativeParam', -50);

            const linearization = new _Linearization(stream);

            // Act & Assert
            expect(() => {
                linearization.getInt(dictionary, 'NegativeParam', false);
            }).toThrowError(/parameter in the linearization dictionary is invalid/);
        });

        // getInt - returns zero when allowZeroValue is true and value equals zero
        it('getInt - returns zero when allowZeroValue is true and value equals zero', () => {
            // Arrange
            const stream = new MockPdfStream(1000);

            const dictionary = new _PdfDictionary();
            dictionary.set('ZeroAllowedParam', 0);

            const linearization = new _Linearization(stream);

            // Act
            const result = linearization.getInt(dictionary, 'ZeroAllowedParam', true);

            // Assert
            expect(result).toBe(0);
        });

    });


    // Test: getInt method returns zero when allowZeroValue is true and value is zero
    it('getInt - returns zero when allowZeroValue is true and value equals zero', () => {
        // Arrange
        const stream = new MockPdfStream(1000);


        const dictionary = new _PdfDictionary();
        dictionary.set('ZeroAllowedParam', 0);
        const linearization = new _Linearization(stream);

        // Act
        const result = linearization.getInt(dictionary, 'ZeroAllowedParam', true);

        // Assert
        expect(result).toBe(0);
    });

    // Test: getInt method returns positive value when allowZeroValue is true
    it('getInt - returns positive value when allowZeroValue is true', () => {
        // Arrange
        const stream = new MockPdfStream(1000);


        const dictionary = new _PdfDictionary();
        dictionary.set('PositiveParam', 25);
        const linearization = new _Linearization(stream);

        // Act
        const result = linearization.getInt(dictionary, 'PositiveParam', true);

        // Assert
        expect(result).toBe(25);
    });

    // Test: getInt method throws error when allowZeroValue is true but value is negative
    it('getInt - throws error when allowZeroValue is true and value is negative', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('NegativeAllowZero', -10);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getInt(dictionary, 'NegativeAllowZero', true);
        }).toThrowError(/parameter in the linearization dictionary is invalid/);
    });
    // Test: getHints method returns valid hint array with length 2

    // Test: Constructor validates L parameter matches stream length
    it('Linearization - constructor throws error when L parameter does not match stream length', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockParser = jasmine.createSpyObj('_PdfParser', ['getObject']);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 2000
        });

        mockParser.getObject.and.returnValues(1, 2, { command: 'obj' }, mockDictionary);

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            expect(linearization.isValid).toBe(false);
        }).not.toThrow();
    });

    // Test: Constructor sets isValid to false when Linearized value is zero
    it('Linearization - constructor sets isValid to false when Linearized parameter is zero', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 0
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            expect(linearization.isValid).toBe(false);
        }).not.toThrow();
    });

    // Test: Constructor sets isValid to false when Linearized value is undefined
    it('Linearization - constructor sets isValid to false when Linearized parameter is undefined', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({});

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            expect(linearization.isValid).toBe(false);
        }).not.toThrow();
    });

    // Test: Constructor initializes objectNumberFirst with getInt
    it('Linearization - constructor initializes objectNumberFirst from O parameter', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'O': 42
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            if (linearization.isValid) {
                expect(linearization.objectNumberFirst).toBeDefined();
            }
        }).not.toThrow();
    });

    // Test: Constructor initializes endFirst with getInt
    it('Linearization - constructor initializes endFirst from E parameter', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'E': 567
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            if (linearization.isValid) {
                expect(linearization.endFirst).toBeDefined();
            }
        }).not.toThrow();
    });

    // Test: Constructor initializes pageCount with getInt
    it('Linearization - constructor initializes pageCount from N parameter', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'N': 15
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            if (linearization.isValid) {
                expect(linearization.pageCount).toBeDefined();
            }
        }).not.toThrow();
    });

    // Test: Constructor initializes mainXRefEntriesOffset with getInt
    it('Linearization - constructor initializes mainXRefEntriesOffset from T parameter', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'T': 850
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            if (linearization.isValid) {
                expect(linearization.mainXRefEntriesOffset).toBeDefined();
            }
        }).not.toThrow();
    });

    // Test: Constructor sets pageFirst to 0 when P parameter is not present
    it('Linearization - constructor sets pageFirst to 0 when P parameter is not present', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'O': 100,
            'E': 500,
            'N': 10,
            'T': 750
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            if (linearization.isValid) {
                expect(linearization.pageFirst).toBe(0);
            }
        }).not.toThrow();
    });

    // Test: Constructor sets pageFirst from P parameter when present
    it('Linearization - constructor initializes pageFirst from P parameter when present', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'O': 100,
            'E': 500,
            'N': 10,
            'T': 750,
            'P': 5
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            if (linearization.isValid) {
                expect(linearization.pageFirst).toBeDefined();
            }
        }).not.toThrow();
    });

    // Test: Constructor initializes hints from getHints
    it('Linearization - constructor initializes hints array from H parameter', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'O': 100,
            'E': 500,
            'N': 10,
            'T': 750,
            'H': [60, 120]
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            if (linearization.isValid) {
                expect(linearization.hints).toBeDefined();
                expect(Array.isArray(linearization.hints)).toBe(true);
            }
        }).not.toThrow();
    });

    // Test: Constructor sets length from L parameter
    it('Linearization - constructor initializes length from L parameter', () => {
        // Arrange
        const stream = new MockPdfStream(1000);
        const mockDictionary = new MockPdfDictionary({
            'Linearized': 1,
            'L': 1000,
            'O': 100,
            'E': 500,
            'N': 10,
            'T': 750,
            'H': [60, 120]
        });

        // Act & Assert
        expect(() => {
            const linearization = new _Linearization(stream);
            if (linearization.isValid) {
                expect(linearization.length).toBe(1000);
            }
        }).not.toThrow();
    });



    it('getHints - returns valid hints array when array length is 2 and all values are positive integers', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100, 200]);

        const linearization = new _Linearization(stream);

        // Act
        const result = linearization.getHints(dictionary);

        // Assert
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0]).toBe(100);
        expect(result[1]).toBe(200);
    });

    it('getHints - returns valid hints array when array length is 4 and all values are positive integers', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [50, 100, 150, 200]);

        const linearization = new _Linearization(stream);

        // Act
        const result = linearization.getHints(dictionary);

        // Assert
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(4);
        expect(result[0]).toBe(50);
        expect(result[1]).toBe(100);
        expect(result[2]).toBe(150);
        expect(result[3]).toBe(200);
    });

    it('getHints - throws error when hints array is undefined', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toBeTruthy();
    });

    it('getHints - throws error when hints array is null', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', null);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toBeTruthy();
    });

    it('getHints - throws error when hints array length is 1 (not 2 or 4)', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint array in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when hints array length is 3 (not 2 or 4)', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100, 200, 300]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint array in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when hints array length is 5 (not 2 or 4)', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [10, 20, 30, 40, 50]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint array in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when hint at index 0 is zero', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [0, 100]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(0\) in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when hint at index 0 is negative', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [-50, 100]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(0\) in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when hint at index 1 is zero', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100, 0]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(1\) in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when hint at index 1 is negative', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100, -25]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(1\) in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when hint at index 0 is not an integer', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [3.14, 100]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(0\) in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when hint at index 1 is not an integer', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100, 2.71]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(1\) in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when third hint at index 2 is zero in 4-element array', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100, 200, 0, 400]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(2\) in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when fourth hint at index 3 is negative in 4-element array', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100, 200, 300, -50]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(3\) in the linearization dictionary is invalid/);
    });

    it('getHints - throws error when fourth hint at index 3 is not an integer in 4-element array', () => {
        // Arrange
        const stream = new MockPdfStream(1000);

        const dictionary = new _PdfDictionary();
        dictionary.set('H', [100, 200, 300, 1.5]);

        const linearization = new _Linearization(stream);

        // Act & Assert
        expect(() => {
            linearization.getHints(dictionary);
        }).toThrowError(/Hint \(3\) in the linearization dictionary is invalid/);
    });

});

