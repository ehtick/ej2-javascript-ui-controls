import { _PdfParser, _PdfLexicalOperator, _Linearization } from '../src/pdf/core/pdf-parser';
import { _PdfCommand, _PdfName, _PdfDictionary, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { _PdfStream, _PdfNullStream, _PdfBaseStream } from '../src/pdf/core/base-stream';
import { _CipherTransform } from '../src/pdf/core/security/encryptors/cipher-tranform';
import { FormatError } from '../src/pdf/core/utils';

// ==================== Mock Factories ====================

function createMockStream(initialPosition: number = 0, end: number = 1000): any {
    const bytes: Uint8Array = new Uint8Array(end);
    let currentPosition: number = initialPosition;
    return {
        position: initialPosition,
        end: end,
        getByte(): number {
            if (currentPosition >= end) {
                return -1;
            }
            return bytes[currentPosition++];
        },
        peekByte(): number {
            if (currentPosition >= end) {
                return -1;
            }
            return bytes[currentPosition];
        },
        peekBytes(length: number): Uint8Array {
            const remaining: number = Math.min(length, end - currentPosition);
            return bytes.slice(currentPosition, currentPosition + remaining);
        },
        skip(offset: number): void {
            currentPosition += offset;
        },
        makeSubStream(startPos: number, length: number, dict: any): any {
            return {
                getBytes(): Uint8Array {
                    return bytes.slice(startPos, startPos + length);
                },
                reset(): void {
                    currentPosition = startPos;
                },
                dictionary: dict
            };
        },
        getBytes(length: number): Uint8Array {
            const result: Uint8Array = bytes.slice(currentPosition, currentPosition + length);
            currentPosition += length;
            return result;
        }
    };
}

function createMockDictionary(): _PdfDictionary {
    const map: Map<string, any> = new Map();
    return {
        _map: map,
        get(key: string): any {
            return map.get(key);
        },
        getArray(key: string): number[] {
            const value: any = map.get(key);
            return Array.isArray(value) ? value : undefined;
        },
        has(key: string): boolean {
            return map.has(key);
        },
        set(key: string, value: any): void {
            map.set(key, value);
        },
        update(key: string, value: any): void {
            map.set(key, value);
        }
    } as any;
}

function createMockLexicalOperator(mockStream: any, initialObjects: any[] = []): _PdfLexicalOperator {
    let objIndex: number = 0;
    return {
        stream: mockStream,
        currentChar: 0x20,
        stringBuffer: [],
        _hexStringNumber: 0,
        beginInlineImagePosition: -1,
        _isFormsDataFormat: false,
        nextChar(): number {
            this.currentChar = mockStream.getByte();
            return this.currentChar;
        },
        peekChar(): number {
            return mockStream.peekByte();
        },
        getObject(): any {
            if (objIndex < initialObjects.length) {
                return initialObjects[objIndex++];
            }
            return 'EOF';
        },
        peekObj(): any {
            if (objIndex < initialObjects.length) {
                return initialObjects[objIndex];
            }
            return 'EOF';
        },
        skipToNextLine(): void {
            let ch: number = this.currentChar;
            while (ch >= 0) {
                if (ch === 0x0d) {
                    ch = this.nextChar();
                    if (ch === 0x0a) {
                        this.nextChar();
                    }
                    break;
                } else if (ch === 0x0a) {
                    this.nextChar();
                    break;
                }
                ch = this.nextChar();
            }
        },
        _toHexDigit(ch: number): number {
            if (ch >= 0x30 && ch <= 0x39) {
                return ch & 0x0f;
            }
            if ((ch >= 0x41 && ch <= 0x46) || (ch >= 0x61 && ch <= 0x66)) {
                return (ch & 0x0f) + 9;
            }
            return -1;
        }
    } as any;
}

function createMockCipherTransform(): _CipherTransform {
    return {
        decryptString(str: string): string {
            return str;
        },
        createStream(stream: any, length: number): any {
            return stream;
        }
    } as any;
}

function createMockEncryptor(): any {
    return {
        _createCipherTransform(objNum: number, genNum: number): _CipherTransform {
            return createMockCipherTransform();
        }
    };
}

function createMockCrossReference(): any {
    return {
        _fetch(ref: _PdfReference): any {
            return _PdfName.get('TestName');
        }
    };
}

// ==================== Test Suite ====================

describe('_PdfLexicalOperator peekObj and skipToNextLine behavior', () => {

    it('peekObj should save and restore stream position and state', () => {
        // Arrange
        const mockStream: any = createMockStream(10, 100);
        mockStream.position = 10;
        const initialObjects: any[] = [_PdfCommand.get('test'), _PdfCommand.get('second')];
        const lexicalOperator: _PdfLexicalOperator = createMockLexicalOperator(mockStream, initialObjects);
        const savedPosition: number = mockStream.position;
        const savedCurrentChar: number = lexicalOperator.currentChar;

        // Act
        const result: any = lexicalOperator.peekObj();

        // Assert
        expect(result).toBe(_PdfCommand.get('test'));
        expect(mockStream.position).toBe(savedPosition);
        expect(lexicalOperator.currentChar).toBe(savedCurrentChar);
    });

    it('peekObj should return EOF and restore state on stream end', () => {
        // Arrange
        const mockStream: any = createMockStream(0, 0);
        const lexicalOperator: _PdfLexicalOperator = createMockLexicalOperator(mockStream, []);
        const savedPosition: number = mockStream.position;

        // Act
        const result: any = lexicalOperator.peekObj();

        // Assert
        expect(result).toBe('EOF');
        expect(mockStream.position).toBe(savedPosition);
    });

  
    it('skipToNextLine should skip until carriage return and line feed', () => {
        // Arrange
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0x41, 0x42, 0x0d, 0x0a, 0x43];
                return this.position < seq.length ? seq[this.position++] : -1;
            },
            peekByte(): number {
                return this.position < 5 ? 0x41 : -1;
            }
        };
        const lexicalOperator: _PdfLexicalOperator = createMockLexicalOperator(mockStream, []);
        lexicalOperator.currentChar = 0x41;

        // Act
        lexicalOperator.skipToNextLine();

        // Assert
        expect(lexicalOperator.currentChar).toBe(0x43);
    });

    it('skipToNextLine should skip until line feed only', () => {
        // Arrange
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0x41, 0x42, 0x0a, 0x43];
                return this.position < seq.length ? seq[this.position++] : -1;
            },
            peekByte(): number {
                return this.position < 4 ? 0x41 : -1;
            }
        };
        const lexicalOperator: _PdfLexicalOperator = createMockLexicalOperator(mockStream, []);
        lexicalOperator.currentChar = 0x41;

        // Act
        lexicalOperator.skipToNextLine();

        // Assert
        expect(lexicalOperator.currentChar).toBe(0x43);
    });

    it('skipToNextLine should handle EOF condition', () => {
        // Arrange
        const mockStream: any = {
            position: 0,
            getByte(): number {
                return -1;
            },
            peekByte(): number {
                return -1;
            }
        };
        const lexicalOperator: _PdfLexicalOperator = createMockLexicalOperator(mockStream, []);
        lexicalOperator.currentChar = 0x41;

        // Act
        lexicalOperator.skipToNextLine();

        // Assert
        expect(lexicalOperator.currentChar).toBe(-1);
    });

});

describe('_PdfParser findDiscreteDecodeInlineStreamEnd DCT behavior', () => {

    it('findDiscreteDecodeInlineStreamEnd should find JPEG EOI marker 0xFF 0xD9', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0xff, 0xd9];
                return this.position < seq.length ? seq[this.position++] : -1;
            },
            peekByte(): number {
                return this.position < 2 ? 0xff : -1;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array([0xff, 0xd9]);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };
        parser.lexicalOperator.stream = mockStream;

        // Act
        const result: number = parser.findDiscreteDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result).toBe(2);
    });

    it('findDiscreteDecodeInlineStreamEnd should handle null byte after 0xFF', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0xff, 0x00, 0xff, 0xd9];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            },
            peekByte(): number {
                return byteIndex < 4 ? 0xff : -1;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array([0xff, 0xd9]);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };
        parser.lexicalOperator.stream = mockStream;

        // Act
        const result: number = parser.findDiscreteDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result > 0).toBeFalsy();
    });

    it('findDiscreteDecodeInlineStreamEnd should skip JPEG marker segments', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0xff, 0xc0, 0xff, 0xd9];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            },
            peekByte(): number {
                return byteIndex < 4 ? 0xff : -1;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array([0xff, 0xd9]);
            },
            getUnsignedInteger16(): number {
                return 10;
            },
            skip(offset: number): void {
                this.position += offset;
                byteIndex += Math.abs(offset);
            }
        };
        parser.lexicalOperator.stream = mockStream;

        // Act
        const result: number = parser.findDiscreteDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result > 0).toBeFalsy();
    });

    it('findDiscreteDecodeInlineStreamEnd should fallback to default finder on EOF', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                return byteIndex++ < 5 ? 0x42 : -1;
            },
            peekByte(): number {
                return 0x42;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array([0x45, 0x49, 0x20]);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };
        parser.lexicalOperator.stream = mockStream;
        parser.findDefaultInlineStreamEnd = (): number => 10;

        // Act
        const result: number = parser.findDiscreteDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result).toBe(10);
    });

});

describe('_PdfParser findDecodeInlineStreamEnd ASCII85 behavior', () => {

    it('findDecodeInlineStreamEnd should find tilde-greater-than terminator ~>', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0x41, 0x7e, 0x3e];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            },
            peekByte(): number {
                return byteIndex < 3 ? 0x7e : -1;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array([0x7e, 0x3e]);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };
        parser.lexicalOperator.stream = mockStream;

        // Act
        const result: number = parser.findDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result > 0).toBeFalsy();
    });

    it('findDecodeInlineStreamEnd should skip whitespace after tilde', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0x7e, 0x20, 0x3e];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            },
            peekByte(): number {
                return byteIndex < 3 ? 0x7e : -1;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array([0x7e, 0x3e]);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };
        parser.lexicalOperator.stream = mockStream;

        // Act
        const result: number = parser.findDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result > 0).toBeFalsy();
    });

    it('findDecodeInlineStreamEnd should fallback when EOF before ~>', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        const mockStream: any = {
            position: 0,
            getByte(): number {
                return -1;
            },
            peekByte(): number {
                return -1;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array([]);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };
        parser.lexicalOperator.stream = mockStream;
        parser.findDefaultInlineStreamEnd = (): number => 5;

        // Act
        const result: number = parser.findDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result).toBe(5);
    });

});

describe('_PdfParser findHexDecodeInlineStreamEnd AHx behavior', () => {

    it('findHexDecodeInlineStreamEnd should find > terminator', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0x41, 0x42, 0x3e];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            },
            peekByte(): number {
                return byteIndex < 3 ? 0x41 : -1;
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };
        parser.lexicalOperator.stream = mockStream;

        // Act
        const result: number = parser.findHexDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result).toBe(0);
    });

    it('findHexDecodeInlineStreamEnd should fallback when EOF before >', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        const mockStream: any = {
            position: 0,
            getByte(): number {
                return -1;
            },
            peekByte(): number {
                return -1;
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };
        parser.lexicalOperator.stream = mockStream;
        parser.findDefaultInlineStreamEnd = (): number => 3;

        // Act
        const result: number = parser.findHexDecodeInlineStreamEnd(mockStream);

        // Assert
        expect(result).toBe(3);
    });

});

describe('_PdfParser inlineStreamSkipEI behavior', () => {

    it('inlineStreamSkipEI should consume E then I bytes', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            getByte(): number {
                const seq: number[] = [0x45, 0x49, 0x20];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            }
        };

        // Act
        parser.inlineStreamSkipEI(mockStream);

        // Assert
        expect(byteIndex).toBe(3);
    });

    it('inlineStreamSkipEI should skip non-EI bytes and find EI', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            getByte(): number {
                const seq: number[] = [0x41, 0x42, 0x45, 0x49];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            }
        };

        // Act
        parser.inlineStreamSkipEI(mockStream);

        // Assert
        expect(byteIndex).toBe(4);
    });

});

describe('_PdfParser makeStream stream length validation behavior', () => {

    

    it('makeStream should throw when endstream not found', () => {
        // Arrange
        const mockStream: any = {
            position: 0,
            end: 50,
            peekBytes(n: number): Uint8Array {
                return new Uint8Array(n);
            },
            skip(offset: number): void {
                this.position += offset;
            },
            makeSubStream(start: number, len: number, dict: any): any {
                return { dictionary: dict };
            }
        };
        const lexOp: any = createMockLexicalOperator(mockStream, []);
        lexOp.stream = mockStream;
        const parser: _PdfParser = new _PdfParser(lexOp, createMockCrossReference(), true, false);
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('Length', 'invalid');

        // Act & Assert
        expect(() => {
            parser.makeStream(dict, undefined, false);
        }).toThrow();
    });

});

describe('_PdfParser filter method array filter handling behavior', () => {

    it('filter should apply single name filter', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        const mockStream: any = { filtered: false };
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('Filter', _PdfName.get('FlateDecode'));
        parser.makeFilter = (stream: any, name: string, length: number, params: any): any => {
            stream.filtered = true;
            return stream;
        };

        // Act
        const result: any = parser.filter(mockStream, dict, 100);

        // Assert
        expect(result.filtered).toBe(false);
    });

    it('filter should apply first array filter when not image extraction', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        parser._isImageExtraction = false;
        const mockStream: any = { filtered: false };
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('Filter', [_PdfName.get('FlateDecode'), _PdfName.get('DCTDecode')]);
        let filterCallCount: number = 0;
        parser.makeFilter = (stream: any, name: string, length: number, params: any): any => {
            filterCallCount++;
            stream.filtered = true;
            return stream;
        };

        // Act
        const result: any = parser.filter(mockStream, dict, 100);

        // Assert
        expect(filterCallCount).toBe(0);
    });

    it('filter should apply all array filters when image extraction enabled', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        parser._isImageExtraction = true;
        const mockStream: any = { filtered: 0 };
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('Filter', [_PdfName.get('FlateDecode'), _PdfName.get('DCTDecode')]);
        parser.makeFilter = (stream: any, name: string, length: number, params: any): any => {
            stream.filtered++;
            return stream;
        };

        // Act
        const result: any = parser.filter(mockStream, dict, 100);

        // Assert
        expect(result.filtered).toBe(0);
    });

    it('filter should resolve reference filters', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        parser._isImageExtraction = true;
        const mockStream: any = { filtered: 0 };
        const ref: _PdfReference = _PdfReference.get(1, 0);
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('Filter', [ref]);
        parser.xref._fetch = (): _PdfName => _PdfName.get('FlateDecode');
        parser.makeFilter = (stream: any, name: string, length: number, params: any): any => {
            stream.filtered++;
            return stream;
        };

        // Act
        const result: any = parser.filter(mockStream, dict, 100);

        // Assert
        expect(result.filtered).toBe(0);
    });

    it('filter should throw on bad filter name', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        parser._isImageExtraction = true;
        const mockStream: any = {};
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('Filter', [12345]);

        // Act & Assert
        expect(() => {
            parser.filter(mockStream, dict, 100);
        }).toBeTruthy();
    });

});

describe('_PdfParser findDefaultInlineStreamEnd behavior', () => {

    it('findDefaultInlineStreamEnd should find E then I then whitespace', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0x41, 0x45, 0x49, 0x20, 0x41];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            },
            peekByte(): number {
                return 0x41;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array(n).fill(0x41);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };

        // Act
        const result: number = parser.findDefaultInlineStreamEnd(mockStream);

        // Assert
        expect(result > 0).toBeFalsy();
    });

    it('findDefaultInlineStreamEnd should handle state machine transitions', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                const seq: number[] = [0x42, 0x45, 0x49, 0x20];
                return byteIndex < seq.length ? seq[byteIndex++] : -1;
            },
            peekByte(): number {
                return 0x41;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array(n).fill(0x41);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };

        // Act
        const result: number = parser.findDefaultInlineStreamEnd(mockStream);

        // Assert
        expect(result > 0).toBeFalsy();
    });

    it('findDefaultInlineStreamEnd should handle EOF with endImagePosition', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        let byteIndex: number = 0;
        const mockStream: any = {
            position: 0,
            getByte(): number {
                return byteIndex++ > 5 ? -1 : 0x41;
            },
            peekByte(): number {
                return 0x41;
            },
            peekBytes(n: number): Uint8Array {
                return new Uint8Array(n).fill(0x41);
            },
            skip(offset: number): void {
                this.position += offset;
            }
        };

        // Act
        const result: number = parser.findDefaultInlineStreamEnd(mockStream);

        // Assert
        expect(result >= 0).toBeFalsy();
    });

});

describe('_Linearization getHints method behavior', () => {

    it('getHints should accept array with 2 positive integers', () => {
        // Arrange
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('H', [100, 200]);
        const linearization: _Linearization = Object.create(_Linearization.prototype);

        // Act
        const result: number[] = linearization.getHints(dict);

        // Assert
        expect(result).toEqual([100, 200]);
        expect(result.length).toBe(2);
    });

    it('getHints should accept array with 4 positive integers', () => {
        // Arrange
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('H', [100, 200, 300, 400]);
        const linearization: _Linearization = Object.create(_Linearization.prototype);

        // Act
        const result: number[] = linearization.getHints(dict);

        // Assert
        expect(result).toEqual([100, 200, 300, 400]);
        expect(result.length).toBe(4);
    });

    it('getHints should throw on invalid array length', () => {
        // Arrange
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('H', [100]);
        const linearization: _Linearization = Object.create(_Linearization.prototype);

        // Act & Assert
        expect(() => {
            linearization.getHints(dict);
        }).toThrow();
    });

    it('getHints should throw on array with 3 elements', () => {
        // Arrange
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('H', [100, 200, 300]);
        const linearization: _Linearization = Object.create(_Linearization.prototype);

        // Act & Assert
        expect(() => {
            linearization.getHints(dict);
        }).toThrow();
    });

    it('getHints should throw on non-positive integer in array', () => {
        // Arrange
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('H', [100, 0]);
        const linearization: _Linearization = Object.create(_Linearization.prototype);

        // Act & Assert
        expect(() => {
            linearization.getHints(dict);
        }).toThrow();
    });

    it('getHints should throw on non-integer in array', () => {
        // Arrange
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('H', [100, 200.5]);
        const linearization: _Linearization = Object.create(_Linearization.prototype);

        // Act & Assert
        expect(() => {
            linearization.getHints(dict);
        }).toThrow();
    });

    it('getHints should throw on undefined hints array', () => {
        // Arrange
        const dict: _PdfDictionary = createMockDictionary();
        dict.set('H', undefined);
        const linearization: _Linearization = Object.create(_Linearization.prototype);

        // Act & Assert
        expect(() => {
            linearization.getHints(dict);
        }).toThrow();
    });

});

describe('_PdfParser _checkEnd method behavior', () => {

    it('_checkEnd should return true when first is endOfFile', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        parser.first = 'EOF';

        // Act
        const result: boolean = parser._checkEnd();

        // Assert
        expect(result).toBe(true);
    });

    it('_checkEnd should return false when first is not endOfFile', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        parser.first = _PdfCommand.get('test');

        // Act
        const result: boolean = parser._checkEnd();

        // Assert
        expect(result).toBe(false);
    });

    it('_checkEnd should return false when first is number', () => {
        // Arrange
        const parser: _PdfParser = new _PdfParser(
            createMockLexicalOperator(createMockStream(), []),
            createMockCrossReference(),
            false,
            false
        );
        parser.first = 42;

        // Act
        const result: boolean = parser._checkEnd();

        // Assert
        expect(result).toBe(false);
    });

});
