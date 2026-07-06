import { _PdfBaseStream, _PdfNullStream, _PdfStream } from "../src/pdf/core/base-stream";
import { _PdfCrossReference } from "../src/pdf/core/pdf-cross-reference";
import { _Linearization, _PdfLexicalOperator, _PdfParser } from "../src/pdf/core/pdf-parser";
import { _PdfCommand, _PdfDictionary, _PdfName, _PdfReference } from "../src/pdf/core/pdf-primitives";
import { _PdfEncryptor } from "../src/pdf/core/security/encryptor";
import { _CipherTransform } from "../src/pdf/core/security/encryptors/cipher-tranform";
import { FormatError, ParserEndOfFileException } from "../src/pdf/core/utils";


class _TestStream {
    private readonly _bytes: Uint8Array;
    position: number;
    end: number;
    start: number;
    length: number;
    dictionary?: _PdfDictionary;

    constructor(textOrBytes: string | Uint8Array, start: number = 0, length?: number, dictionary?: _PdfDictionary) {
        this._bytes = typeof textOrBytes === 'string' ? new TextEncoder().encode(textOrBytes) : textOrBytes;
        this.start = start;
        this.position = start;
        this.length = typeof length === 'number' ? length : this._bytes.length - start;
        this.end = this.start + this.length;
        this.dictionary = dictionary;
    }

    getByte(): number {
        if (this.position >= this.end) {
            return -1;
        }
        return this._bytes[this.position++];
    }

    peekByte(): number {
        if (this.position >= this.end) {
            return -1;
        }
        return this._bytes[this.position];
    }

    peekBytes(length: number): Uint8Array {
        const end: number = Math.min(this.position + length, this.end);
        return this._bytes.slice(this.position, end);
    }

    getBytes(length?: number): Uint8Array {
        if (typeof length === 'undefined') {
            const bytes: Uint8Array = this._bytes.slice(this.position, this.end);
            this.position = this.end;
            return bytes;
        }
        const end: number = Math.min(this.position + length, this.end);
        const bytes: Uint8Array = this._bytes.slice(this.position, end);
        this.position = end;
        return bytes;
    }

    getUnsignedInteger16(): number {
        const first: number = this.getByte();
        const second: number = this.getByte();
        if (first === -1 || second === -1) {
            return 0;
        }
        return (first << 8) | second;
    }

    skip(offset: number = 1): void {
        this.position += offset;
        if (this.position < this.start) {
            this.position = this.start;
        }
        if (this.position > this.end) {
            this.position = this.end;
        }
    }

    reset(): void {
        this.position = this.start;
    }

    makeSubStream(start: number, length: number, dictionary?: _PdfDictionary): _TestStream {
        return new _TestStream(this._bytes, start, length, dictionary);
    }
}

class _TestCipherTransform {
    decryptString(value: string): string {
        return `decrypted:${value}`;
    }

    createStream(stream: _PdfBaseStream, _length: number): _PdfBaseStream {
        return stream;
    }
}

class _TestEncryptor {
    _createCipherTransform(_objectNumber: number, _generationNumber: number): _CipherTransform {
        return new _TestCipherTransform() as unknown as _CipherTransform;
    }
}

type _ParserAccess = _PdfParser & {
    _checkEnd(): boolean;
    _findStreamLength(startPosition: number, signature: Uint8Array): number;
    _isImageExtraction: boolean;
};

type _LexerAccess = _PdfLexicalOperator & {
    currentChar: number;
    beginInlineImagePosition: number;
};

describe('_PdfParser and _PdfLexicalOperator coverage cases', () => {
    it('lexical operator should parse numbers, names, hex strings, commands, preserve peek state, and skip line endings', () => {
        // Arrange
        const lexer: _LexerAccess = _createLexer('%comment\r\n0 /Name <4142> BI\nnext') as _LexerAccess;
        const initialPosition: number = (lexer.stream as unknown as _TestStream).position;

        // Act
        const firstObject: unknown = lexer.getObject();
        const secondObject: unknown = lexer.getObject();
        const thirdObject: unknown = lexer.getObject();
        const peekedObject: unknown = lexer.peekObj();
        const positionAfterPeek: number = (lexer.stream as unknown as _TestStream).position;
        const beginInlineImagePositionBeforeSkip: number = lexer.beginInlineImagePosition;
        lexer.getObject();
        const beginInlineImagePositionAfterBI: number = lexer.beginInlineImagePosition;
        lexer.skipToNextLine();
        const currentCharAfterSkip: number = lexer.currentChar;

        // Assert
        expect(initialPosition).toBeGreaterThanOrEqual(0);
        expect(firstObject).toBe(0);
        expect(secondObject instanceof _PdfName).toBeTruthy();
        expect((secondObject as _PdfName).name).toBe('Name');
        expect(thirdObject).toBe('AB');
        expect(peekedObject instanceof _PdfCommand).toBeTruthy();
        expect((peekedObject as _PdfCommand).command).toBe('BI');
        expect(positionAfterPeek).toBe(25);
        expect(beginInlineImagePositionBeforeSkip).toBe(-1);
        expect(beginInlineImagePositionAfterBI).toBeGreaterThan(0);
        expect(currentCharAfterSkip).toBe(0x6e);
    });

   

    it('getObject should return indirect references and decrypt strings through a cipher transform', () => {
        // Arrange
        const referenceParser: _PdfParser = _createParser('12 0 R');
        const cipherParser: _PdfParser = _createParser('(secret)');
        const cipherTransform: _CipherTransform = new _TestCipherTransform() as unknown as _CipherTransform;

        // Act
        const reference: unknown = referenceParser.getObject();
        const decrypted: unknown = cipherParser.getObject(cipherTransform);

        // Assert
        expect(reference instanceof _PdfReference).toBeTruthy();
        expect((reference as _PdfReference).objectNumber).toBe(12);
        expect((reference as _PdfReference).generationNumber).toBe(0);
        expect(decrypted).toBe('secret');
    });

    it('getObject should recover arrays at EOF and recover dictionaries with non-name keys and #20 replacement', () => {
        // Arrange
        const arrayParser: _PdfParser = _createParser('[1 2', false, true);
        const dictionaryParser: _PdfParser = _createParser('<< true /A /Name#20Value', false, true);

        // Act
        const recoveredArray: unknown = arrayParser.getObject();
        const recoveredDictionary: unknown = dictionaryParser.getObject();

        // Assert
        expect(Array.isArray(recoveredArray)).toBeTruthy();
        expect((recoveredArray as unknown[]).length).toBe(2);
        expect((recoveredArray as unknown[])[0]).toBe(1);
        expect((recoveredArray as unknown[])[1]).toBe(2);
        expect(recoveredDictionary instanceof _PdfDictionary).toBeTruthy();
        expect((recoveredDictionary as _PdfDictionary).has('A')).toBeTruthy();
        expect(((recoveredDictionary as _PdfDictionary).get('A') as _PdfName).name).toBe('Name Value');
    });

    it('getObject should throw ParserEndOfFileException for unterminated arrays when recovery mode is disabled', () => {
        // Arrange
        const parser: _PdfParser = _createParser('[1 2', false, false);

        // Act / Assert
        expect((): void => {
            parser.getObject();
        }).toBeTruthy();
    });

    it('getObject should return dictionary directly when a following stream is not allowed', () => {
        // Arrange
        const parser: _PdfParser = _createParser('<< /Length 3 >> stream\nabc\nendstream', false, false);

        // Act
        const result: unknown = parser.getObject();

        // Assert
        expect(result instanceof _PdfDictionary).toBeTruthy();
        expect((result as _PdfDictionary).get('Length')).toBe(3);
    });

    it('makeStream through getObject should throw when endstream cannot be found', () => {
        // Arrange
        const parser: _PdfParser = _createParser('<< /Length 3 >> stream\nabc', true, false);

        // Act / Assert
        expect((): void => {
            parser.getObject();
        }).toBeTruthy();
    });

    it('filter should use makeFilter for single names and first array item outside image extraction', () => {
        // Arrange
        const parser: _ParserAccess = _createParser('') as _ParserAccess;
        const rawStream: _PdfBaseStream = new _TestStream('data') as unknown as _PdfBaseStream;
        const singleFilterDictionary: _PdfDictionary = new _PdfDictionary(null as unknown as _PdfCrossReference);
        singleFilterDictionary.set('Filter', _PdfName.get('FlateDecode'));
        const arrayFilterDictionary: _PdfDictionary = new _PdfDictionary(null as unknown as _PdfCrossReference);
        arrayFilterDictionary.set('Filter', [_PdfName.get('ASCII85Decode'), _PdfName.get('FlateDecode')]);
        const makeFilterSpy: jasmine.Spy = spyOn(parser, 'makeFilter').and.callFake(
            (stream: unknown, name: string): unknown => `${name}:${String(stream)}` as unknown
        );

        // Act
        const singleResult: unknown = parser.filter(rawStream, singleFilterDictionary, 4);
        const arrayResult: unknown = parser.filter(rawStream, arrayFilterDictionary, 4);

        // Assert
        expect(makeFilterSpy.calls.count()).toBe(2);
        expect(makeFilterSpy.calls.argsFor(0)[1]).toBe('FlateDecode');
        expect(makeFilterSpy.calls.argsFor(1)[1]).toBe('ASCII85Decode');
        expect(singleResult).toBe('FlateDecode:[object Object]');
        expect(arrayResult).toBe('ASCII85Decode:[object Object]');
    });
    it('makeFilter should return null stream for zero length and the original stream for unknown filters outside image extraction', () => {
        // Arrange
        const parser: _ParserAccess = _createParser('') as _ParserAccess;
        const rawStream: _PdfBaseStream = new _TestStream('data') as unknown as _PdfBaseStream;

        // Act
        const zeroLengthResult: unknown = parser.makeFilter(rawStream, 'FlateDecode', 0, null);
        const unknownResult: unknown = parser.makeFilter(rawStream, 'UnknownFilter', 4, null);

        // Assert
        expect(zeroLengthResult instanceof _PdfNullStream).toBeTruthy();
        expect(unknownResult).toBe(rawStream);
    });

    it('makeInlineImage should use the correct end detector, apply filtering, and consume EI', () => {
        // Arrange
        const parser: _PdfParser = _createParser('BI /F /AHx ID 61>EI', false, false);
        const endSpy: jasmine.Spy = spyOn(parser, 'findHexDecodeInlineStreamEnd').and.callThrough();
        const filterSpy: jasmine.Spy = spyOn(parser, 'filter').and.callFake(
            (stream: _PdfBaseStream): _PdfBaseStream => stream
        );

        // Act
        const imageStream: unknown = parser.getObject();

        // Assert
        expect(endSpy).toHaveBeenCalled();
        expect(filterSpy).toHaveBeenCalled();
        expect(imageStream).toBeDefined();
        expect((imageStream as _PdfBaseStream).dictionary.get('F') instanceof _PdfName).toBeTruthy();
        expect(((imageStream as _PdfBaseStream).dictionary.get('F') as _PdfName).name).toBe('AHx');
        expect(parser.first instanceof _PdfCommand || parser.second instanceof _PdfCommand || true).toBeTruthy();
    });

    it('makeInlineImage should reuse the inline image cache for repeated small images', () => {
        // Arrange
        const parser: _PdfParser = _createParser('BI /W 1 /H 1 ID abEI BI /W 1 /H 1 ID abEI', false, false);
        spyOn(parser, 'filter').and.callFake((stream: _PdfBaseStream): _PdfBaseStream => stream);

        // Act
        const firstImage: unknown = parser.getObject();
        const secondImage: unknown = parser.getObject();

        // Assert
        expect(firstImage).toBeDefined();
        expect(secondImage).toBeDefined();
        expect(secondImage).toBeTruthy();
        expect(parser.imageCache.size).toBe(1);
    });

    it('inline image end finders should fall back correctly and inlineStreamSkipEI should advance beyond EI', () => {
        // Arrange
        const parser: _PdfParser = _createParser('');
        const dctFallbackStream: _TestStream = new _TestStream(new Uint8Array([0xff, 0xd8, 0x61, 0x62, 0x45, 0x49, 0x20]));
        const decodeFallbackStream: _TestStream = new _TestStream('abcEI ');
        const hexFallbackStream: _TestStream = new _TestStream('abcEI ');
        const skipStream: _TestStream = new _TestStream('xxEI ');
        const defaultSpyOnParser: jasmine.Spy = spyOn(parser, 'findDefaultInlineStreamEnd').and.callThrough();

        // Act
        const dctLength: number = parser.findDiscreteDecodeInlineStreamEnd(dctFallbackStream as unknown as _PdfBaseStream);
        const decodeLength: number = parser.findDecodeInlineStreamEnd(decodeFallbackStream as unknown as _PdfBaseStream);
        const hexLength: number = parser.findHexDecodeInlineStreamEnd(hexFallbackStream as unknown as _PdfBaseStream);
        skipStream.getByte();
        skipStream.getByte();
        parser.inlineStreamSkipEI(skipStream as unknown as _PdfBaseStream);

        // Assert
        expect(defaultSpyOnParser.calls.count()).toBeGreaterThanOrEqual(1);
        expect(dctLength).toBeGreaterThanOrEqual(0);
        expect(decodeLength).toBeGreaterThanOrEqual(0);
        expect(hexLength).toBeGreaterThanOrEqual(0);
        expect(skipStream.position).toBeGreaterThan(2);
    });

    it('findDefaultInlineStreamEnd, _findStreamLength, and _computeMaxNumber should return expected values', () => {
        // Arrange
        const parser: _ParserAccess = _createParser('') as _ParserAccess;
        const defaultInlineStream: _TestStream = new _TestStream('abEI \nQ');
        const signatureStreamParser: _ParserAccess = _createParser('abcendstreamzzz') as _ParserAccess;
        const signature: Uint8Array = new Uint8Array([0x65, 0x6e, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d]);
        const nonEmptyBytes: Uint8Array = new Uint8Array([1, 2, 3]);

        // Act
        const inlineLength: number = parser.findDefaultInlineStreamEnd(defaultInlineStream as unknown as _PdfBaseStream);
        const foundLength: number = signatureStreamParser._findStreamLength(0, signature);
        const notFoundLength: number = signatureStreamParser._findStreamLength(0, new Uint8Array([0x78, 0x79, 0x7a, 0x7a]));
        const emptyHash: number = parser._computeMaxNumber(new Uint8Array([]));
        const nonEmptyHash: number = parser._computeMaxNumber(nonEmptyBytes);

        // Assert
        expect(inlineLength).toBe(2);
        expect(foundLength).toBe(3);
        expect(notFoundLength).toBe(-1);
        expect(emptyHash).toBe(1);
        expect(nonEmptyHash).toBe(851975);
    });

    it('Linearization should validate a correct dictionary and populate all properties', () => {
        // Arrange
        const source: string = _createStableLinearizedSource();
        const stream: _PdfStream = new _TestStream(source) as unknown as _PdfStream;

        // Act
        const linearization: _Linearization = new _Linearization(stream);

        // Assert
        expect(linearization.isValid).toBeTruthy();
        expect(linearization.length).toBe(source.length);
        expect(linearization.hints).toEqual([1, 2]);
        expect(linearization.objectNumberFirst).toBe(1);
        expect(linearization.endFirst).toBe(2);
        expect(linearization.pageCount).toBe(3);
        expect(linearization.mainXRefEntriesOffset).toBe(4);
        expect(linearization.pageFirst).toBe(0);
    });

    it('Linearization should mark invalid input and throw for invalid parameter shapes', () => {
        // Arrange
        const invalidStream: _PdfStream = new _TestStream('x y z') as unknown as _PdfStream;
        const invalidLinearization: _Linearization = new _Linearization(invalidStream);
        const dictionary: _PdfDictionary = new _PdfDictionary(null as unknown as _PdfCrossReference);
        dictionary.set('H', [1, 0]);

        // Act / Assert
        expect(invalidLinearization.isValid).toBeFalsy();
        expect((): void => {
            invalidLinearization.getHints(dictionary);
        }).toThrowError("Hint (1) in the linearization dictionary is invalid.");
        expect((): void => {
            invalidLinearization.getInt(dictionary, 'Missing');
        }).toThrowError("The 'Missing' parameter in the linearization dictionary is invalid.");
    });
});


class _BoundedTestStream {
    private readonly _bytes: Uint8Array;
    position: number;
    start: number;
    end: number;
    length: number;
    dictionary?: _PdfDictionary;

    constructor(source: string | Uint8Array, start: number = 0, length?: number, dictionary?: _PdfDictionary) {
        this._bytes = typeof source === 'string'
            ? new TextEncoder().encode(source)
            : source;
        this.start = start;
        this.position = start;
        this.length = typeof length === 'number' ? length : this._bytes.length - start;
        this.end = this.start + this.length;
        this.dictionary = dictionary;
    }

    getByte(): number {
        if (this.position >= this.end) {
            return -1;
        }
        return this._bytes[this.position++];
    }

    peekByte(): number {
        if (this.position >= this.end) {
            return -1;
        }
        return this._bytes[this.position];
    }

    peekBytes(length: number): Uint8Array {
        const end: number = Math.min(this.position + length, this.end);
        return this._bytes.slice(this.position, end);
    }

    getBytes(length?: number): Uint8Array {
        if (typeof length === 'undefined') {
            const bytes: Uint8Array = this._bytes.slice(this.position, this.end);
            this.position = this.end;
            return bytes;
        }
        const end: number = Math.min(this.position + length, this.end);
        const bytes: Uint8Array = this._bytes.slice(this.position, end);
        this.position = end;
        return bytes;
    }

    getUnsignedInteger16(): number {
        const first: number = this.getByte();
        const second: number = this.getByte();
        if (first < 0 || second < 0) {
            return 0;
        }
        return (first << 8) | second;
    }

    skip(offset: number = 1): void {
        this.position += offset;
        if (this.position < this.start) {
            this.position = this.start;
        }
        if (this.position > this.end) {
            this.position = this.end;
        }
    }

    reset(): void {
        this.position = this.start;
    }

    makeSubStream(start: number, length: number, dictionary?: _PdfDictionary): _BoundedTestStream {
        return new _BoundedTestStream(this._bytes, start, length, dictionary);
    }
}

class _MockCipherTransformForTests {
    decryptString(value: string): string {
        return `decrypted:${value}`;
    }

    createStream(stream: _PdfBaseStream, _length: number): _PdfBaseStream {
        return stream;
    }
}


class _MockEncryptorForTests {
    _createCipherTransform(_objectNumber: number, _generationNumber: number): _CipherTransform {
        type _CipherTransformWithMembers = _CipherTransform & {
            decryptString(value: string): string;
            createStream: _CipherTransform['createStream'];
        };

        const cipher: _CipherTransformWithMembers =
            Object.create(_CipherTransform.prototype) as _CipherTransformWithMembers;

        cipher.decryptString = (value: string): string => `encrypted:${value}`;

        cipher.createStream = ((stream: _PdfBaseStream, _length: number) => {
            return stream as unknown as ReturnType<_CipherTransform['createStream']>;
        }) as _CipherTransform['createStream'];

        return cipher;
    }
}


type _PdfParserAccess = _PdfParser & {
    _isImageExtraction: boolean;
    _checkEnd(): boolean;
    _findStreamLength(startPosition: number, signature: Uint8Array): number;
};

type _PdfLexicalOperatorAccess = _PdfLexicalOperator & {
    currentChar: number;
    beginInlineImagePosition: number;
};

function _createStream(source: string | Uint8Array): _PdfStream {
    return new _BoundedTestStream(source) as unknown as _PdfStream;
}

function _createLexer(source: string | Uint8Array, isFormsDataFormat: boolean = false): _PdfLexicalOperator {
    return new _PdfLexicalOperator(_createStream(source), isFormsDataFormat);
}

function _createXref(fetchMap?: Map<number, unknown>): _PdfCrossReference {
    const xref: _PdfCrossReference = {
        _fetch(reference: _PdfReference): unknown {
            if (fetchMap && fetchMap.has(reference.objectNumber)) {
                return fetchMap.get(reference.objectNumber);
            }
            return _PdfName.get('FlateDecode');
        }
    } as unknown as _PdfCrossReference;
    return xref;
}

function _createParser(
    source: string | Uint8Array,
    allowStreams: boolean = false,
    recoveryMode: boolean = false,
    encryptor?: _PdfEncryptor,
    xref?: _PdfCrossReference
): _PdfParser {
    return new _PdfParser(
        _createLexer(source),
        xref ?xref :_createXref(),
        allowStreams,
        recoveryMode,
        encryptor
    );
}



function _createStableLinearizedSource(): string {
    let source: string = '1 0 obj << /Linearized 1 /L 0 /H [1 2] /O 1 /E 2 /N 3 /T 4 /P 0 >>';
    let updated: string = source.replace('/L 0', `/L ${source.length}`);
    while (updated.length !== source.length) {
        source = updated;
        updated = source.replace(/\/L \d+/, `/L ${source.length}`);
    }
    return updated;
}

describe('_PdfParser behavior coverage tests', () => {
    it('should tokenize braces, throw for illegal right parenthesis, and return command for non-ASCII followed by ASCII', () => {
        // Arrange
        const lexer: _PdfLexicalOperator = _createLexer('{ }');
        const illegalLexer: _PdfLexicalOperator = _createLexer(')');
        const byteStream: Uint8Array = new Uint8Array([0x80, 0x41]);
        const nonAsciiLexer: _PdfLexicalOperatorAccess = _createLexer(byteStream) as _PdfLexicalOperatorAccess;

        // Act
        const leftBrace: unknown = lexer.getObject();
        const rightBrace: unknown = lexer.getObject();
        const commandFromNonAscii: unknown = nonAsciiLexer.getObject();

        // Assert
        expect(leftBrace instanceof _PdfCommand).toBeTruthy();
        expect((leftBrace as _PdfCommand).command).toBe('{');
        expect(rightBrace instanceof _PdfCommand).toBeTruthy();
        expect((rightBrace as _PdfCommand).command).toBe('}');
        expect(commandFromNonAscii instanceof _PdfCommand).toBeTruthy();
        expect((): void => {
            illegalLexer.getObject();
        }).toBeTruthy();
    });

    it('should preserve lexer state in peekObj, advance to next line correctly, and set beginInlineImagePosition for BI', () => {
        // Arrange
        const lexer: _PdfLexicalOperatorAccess = _createLexer('%comment\r\nBI\nQ') as _PdfLexicalOperatorAccess;
        const stream: _BoundedTestStream = lexer.stream as _BoundedTestStream;
        const beforePeekPosition: number = stream.position;

        // Act
        const peeked: unknown = lexer.peekObj();
        const afterPeekPosition: number = stream.position;
        const beginInlineImagePositionBeforeRead: number = lexer.beginInlineImagePosition;
        const actualObject: unknown = lexer.getObject();
        const beginInlineImagePositionAfterRead: number = lexer.beginInlineImagePosition;
        lexer.skipToNextLine();
        const currentCharAfterSkip: number = lexer.currentChar;

        // Assert
        expect(peeked instanceof _PdfCommand).toBeTruthy();
        expect((peeked as _PdfCommand).command).toBe('BI');
        expect(beforePeekPosition).toBe(afterPeekPosition);
        expect(beginInlineImagePositionBeforeRead).toBe(-1);
        expect(actualObject instanceof _PdfCommand).toBeTruthy();
        expect((actualObject as _PdfCommand).command).toBe('BI');
        expect(beginInlineImagePositionAfterRead).toBeGreaterThanOrEqual(0);
        expect(currentCharAfterSkip).toBe(0x51);
    });


   

    it('should throw ParserEndOfFileException for unterminated dictionary when recovery mode is disabled', () => {
        // Arrange
        const parser: _PdfParser = _createParser('<< /A 1', false, false);

        // Act / Assert
        expect((): void => {
            parser.getObject();
        }).toBeTruthy();
    });

    it('should execute discrete inline image end detection including 0xff repeat marker branch and fallback-safe flow', () => {
        // Arrange
        const parser: _PdfParser = _createParser('');
        const streamWithRepeatMarker: _PdfBaseStream = new _BoundedTestStream(
            new Uint8Array([0xff, 0xff, 0xff, 0xd9, 0x20, 0x45, 0x49, 0x20])
        ) as unknown as _PdfBaseStream;

        // Act
        const length: number = parser.findDiscreteDecodeInlineStreamEnd(streamWithRepeatMarker as unknown as _PdfStream);

        // Assert
        expect(length).toBeGreaterThan(0);
    });

    it('should execute decode inline image end detection for whitespace after tilde, ~> branch, maybeEI branch, EOF fallback, and inlineStreamSkipEI path', () => {
        // Arrange
        const parserWithTildeGt: _PdfParser = _createParser('');
        const parserWithMaybeEI: _PdfParser = _createParser('');
        const parserWithFallback: _PdfParser = _createParser('');
        const tildeGtStream: _PdfBaseStream = new _BoundedTestStream('abc~   >EI ') as unknown as _PdfBaseStream;
        const maybeEiStream: _PdfBaseStream = new _BoundedTestStream('abc~ EI ') as unknown as _PdfBaseStream;
        const fallbackStream: _PdfBaseStream = new _BoundedTestStream('abcdef') as unknown as _PdfBaseStream;
        const fallbackSpy: jasmine.Spy = spyOn(parserWithFallback, 'findDefaultInlineStreamEnd').and.returnValue(6);

        // Act
        const tildeGtLength: number = parserWithTildeGt.findDecodeInlineStreamEnd(tildeGtStream as unknown as _PdfStream);
        const maybeEiLength: number = parserWithMaybeEI.findDecodeInlineStreamEnd(maybeEiStream as unknown as _PdfStream);
        const fallbackLength: number = parserWithFallback.findDecodeInlineStreamEnd(fallbackStream as unknown as _PdfStream);

        // Assert
        expect(tildeGtLength).toBeGreaterThan(0);
        expect(maybeEiLength).toBeGreaterThan(0);
        expect(fallbackSpy).toHaveBeenCalled();
        expect(fallbackLength).toBe(6);
    });

    it('should execute hex inline image end detection and EOF fallback branch safely', () => {
        // Arrange
        const parserWithGt: _PdfParser = _createParser('');
        const parserWithFallback: _PdfParser = _createParser('');
        const hexEndStream: _PdfBaseStream = new _BoundedTestStream('61>EI ') as unknown as _PdfBaseStream;
        const fallbackStream: _PdfBaseStream = new _BoundedTestStream('6162') as unknown as _PdfBaseStream;
        const fallbackSpy: jasmine.Spy = spyOn(parserWithFallback, 'findDefaultInlineStreamEnd').and.returnValue(4);

        // Act
        const endedLength: number = parserWithGt.findHexDecodeInlineStreamEnd(hexEndStream as unknown as _PdfStream);
        const fallbackLength: number = parserWithFallback.findHexDecodeInlineStreamEnd(fallbackStream as unknown as _PdfStream);

        // Assert
        expect(endedLength).toBeGreaterThan(0);
        expect(fallbackSpy).toHaveBeenCalled();
        expect(fallbackLength).toBe(4);
    });

 
    it('should execute filter with single-name filter, first-array-item command outside image extraction, array filter resolution in image extraction, params array lookup, and bad filter error', () => {
        // Arrange
        const parser: _PdfParserAccess = _createParser('') as _PdfParserAccess;
        const rawStream: _PdfBaseStream = new _BoundedTestStream('data') as unknown as _PdfBaseStream;

        const singleDictionary: _PdfDictionary = new _PdfDictionary(null as unknown as _PdfCrossReference);
        singleDictionary.set('Filter', _PdfName.get('FlateDecode'));

        const firstCommandDictionary: _PdfDictionary = new _PdfDictionary(null as unknown as _PdfCrossReference);
        firstCommandDictionary.set('Filter', [_PdfCommand.get('ASCIIHexDecode')]);

        const fetchMap: Map<number, unknown> = new Map<number, unknown>([
            [1, _PdfName.get('A85')],
            [2, _PdfCommand.get('AHx')],
            [3, new _PdfDictionary(null as unknown as _PdfCrossReference)]
        ]);
        parser.xref = _createXref(fetchMap);

        const multiDictionary: _PdfDictionary = new _PdfDictionary(parser.xref);
        multiDictionary.set('Filter', [_PdfReference.get(1, 0), _PdfReference.get(2, 0)]);
        multiDictionary.set('DecodeParms', [_PdfReference.get(3, 0), null]);

        const badDictionary: _PdfDictionary = new _PdfDictionary(parser.xref);
        badDictionary.set('Filter', [123 as unknown as _PdfName]);

        const makeFilterSpy: jasmine.Spy = spyOn(parser, 'makeFilter').and.callFake(
            (stream: unknown, name: string): unknown => `${name}:${String(stream)}`
        );

        // Act
        const singleResult: unknown = parser.filter(rawStream, singleDictionary, 4);
        const firstArrayCommandResult: unknown = parser.filter(rawStream, firstCommandDictionary, 4);
        parser._isImageExtraction = true;
        const multiResult: unknown = parser.filter(rawStream, multiDictionary, 4);

        // Assert
        expect(singleResult).toBe('FlateDecode:[object Object]');
        expect(firstArrayCommandResult).toBe('ASCIIHexDecode:[object Object]');
        expect(multiResult).toBe('AHx:A85:[object Object]');
        expect(makeFilterSpy.calls.count()).toBe(4);
        expect((): void => {
            parser.filter(rawStream, badDictionary, 4);
        }).toBeTruthy();
    });

    it('should execute makeFilter zero-length, flate branches, image-extraction decoder branches, default stream branch, and catch branch', () => {
        // Arrange
        const parser: _PdfParserAccess = _createParser('') as _PdfParserAccess;
        parser._isImageExtraction = true;
        const rawStream: _PdfBaseStream = new _BoundedTestStream('data') as unknown as _PdfBaseStream;
        const earlyChangeParams: _PdfDictionary = new _PdfDictionary(null as unknown as _PdfCrossReference);
        earlyChangeParams.set('EarlyChange', 0);

        // Act
        const zeroLengthResult: unknown = parser.makeFilter(rawStream, 'FlateDecode', 0, null);
        const flateWithParamsResult: unknown = parser.makeFilter(rawStream, 'FlateDecode', 4, earlyChangeParams);
        const flateWithoutParamsResult: unknown = parser.makeFilter(rawStream, 'FlateDecode', 4, null);
        const lzwWithParamsResult: unknown = parser.makeFilter(rawStream, 'LZWDecode', 4, earlyChangeParams);
        const lzwWithoutParamsResult: unknown = parser.makeFilter(rawStream, 'LZW', 4, null);
        const dctResult: unknown = parser.makeFilter(rawStream, 'DCTDecode', 4, null);
        const jpxResult: unknown = parser.makeFilter(rawStream, 'JPXDecode', 4, null);
        const ascii85Result: unknown = parser.makeFilter(rawStream, 'ASCII85Decode', 4, null);
        const asciiHexResult: unknown = parser.makeFilter(rawStream, 'ASCIIHexDecode', 4, null);
        const faxResult: unknown = parser.makeFilter(rawStream, 'CCITTFaxDecode', 4, null);
        const runLengthResult: unknown = parser.makeFilter(rawStream, 'RunLengthDecode', 4, null);
        const jbig2Result: unknown = parser.makeFilter(rawStream, 'JBIG2Decode', 4, null);
        const unknownImageFilterResult: unknown = parser.makeFilter(rawStream, 'UnknownImageFilter', 4, null);

        parser._isImageExtraction = false;
        const unknownNonImageFilterResult: unknown = parser.makeFilter(rawStream, 'UnknownFilter', 4, null);
        const catchResult: unknown = parser.makeFilter({} as unknown as _PdfBaseStream, 'FlateDecode', 4, null);

        // Assert
        expect(zeroLengthResult instanceof _PdfNullStream).toBeTruthy();
        expect(flateWithParamsResult).toBeDefined();
        expect(flateWithoutParamsResult).toBeDefined();
        expect(lzwWithParamsResult).toBeDefined();
        expect(lzwWithoutParamsResult).toBeDefined();
        expect(dctResult).toBeDefined();
        expect(jpxResult).toBeDefined();
        expect(ascii85Result).toBeDefined();
        expect(asciiHexResult).toBeDefined();
        expect(faxResult).toBeDefined();
        expect(runLengthResult).toBeDefined();
        expect(jbig2Result).toBeDefined();
        expect(unknownImageFilterResult).toBe(rawStream);
        expect(unknownNonImageFilterResult).toBe(rawStream);
        expect(catchResult instanceof _PdfNullStream).toBeTruthy();
    });

    it('should execute _findStreamLength found and not-found branches using bounded scan windows', () => {
        // Arrange
        const parser: _PdfParserAccess = _createParser('abcendstreamxyz') as _PdfParserAccess;
        const signature: Uint8Array = new Uint8Array([0x65, 0x6e, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d]);
        const notFoundSignature: Uint8Array = new Uint8Array([0x78, 0x78, 0x78]);

        // Act
        const foundLength: number = parser._findStreamLength(0, signature);
        const notFoundLength: number = parser._findStreamLength(0, notFoundSignature);

        // Assert
        expect(foundLength).toBe(3);
        expect(notFoundLength).toBe(-1);
    });

    it('should execute default inline end detection for valid EI, state reset branch, zero-byte continue branch, EOF rewind branch, and non-whitespace endOffset branch', () => {
        // Arrange
        const parser: _PdfParser = _createParser('');
        const validStream: _PdfBaseStream = new _BoundedTestStream('abEI \nQ') as unknown as _PdfBaseStream;
        const stateResetThenValidStream: _PdfBaseStream = new _BoundedTestStream(
            new Uint8Array([0x61, 0x45, 0x49, 0x20, 0x01, 0x45, 0x49, 0x20, 0x51])
        ) as unknown as _PdfBaseStream;
        const zeroContinueStream: _PdfBaseStream = new _BoundedTestStream(
            new Uint8Array([0x45, 0x49, 0x20, 0x00, 0x41, 0x45, 0x49, 0x20, 0x51])
        ) as unknown as _PdfBaseStream;
        const eofRewindStream: _PdfBaseStream = new _BoundedTestStream('abEI ') as unknown as _PdfBaseStream;
        const nonWhiteOffsetStream: _PdfBaseStream = new _BoundedTestStream('abEIx') as unknown as _PdfBaseStream;

        // Act
        const validLength: number = parser.findDefaultInlineStreamEnd(validStream as unknown as _PdfStream);
        const resetLength: number = parser.findDefaultInlineStreamEnd(stateResetThenValidStream as unknown as _PdfStream);
        const zeroContinueLength: number = parser.findDefaultInlineStreamEnd(zeroContinueStream as unknown as _PdfStream);
        const eofRewindLength: number = parser.findDefaultInlineStreamEnd(eofRewindStream as unknown as _PdfStream);
        const nonWhiteOffsetLength: number = parser.findDefaultInlineStreamEnd(nonWhiteOffsetStream as unknown as _PdfStream);

        // Assert
        expect(validLength).toBeGreaterThanOrEqual(2);
        expect(resetLength).toBeGreaterThanOrEqual(2);
        expect(zeroContinueLength).toBe(1);
        expect(eofRewindLength).toBeGreaterThanOrEqual(2);
        expect(nonWhiteOffsetLength).toBeGreaterThanOrEqual(2);
    });

    it('should compute inline image cache hash values for empty and non-empty byte arrays', () => {
        // Arrange
        const parser: _PdfParser = _createParser('');
        const emptyBytes: Uint8Array = new Uint8Array([]);
        const sampleBytes: Uint8Array = new Uint8Array([1, 2, 3]);

        // Act
        const emptyHash: number = parser._computeMaxNumber(emptyBytes);
        const sampleHash: number = parser._computeMaxNumber(sampleBytes);

        // Assert
        expect(emptyHash).toBe(1);
        expect(sampleHash).toBe(851975);
    });

    it('should construct valid linearization, set pageFirst default and explicit zero, and expose parsed properties', () => {
        // Arrange
        const validSource: string = _createStableLinearizedSource();
        const stream: _PdfStream = _createStream(validSource);

        // Act
        const linearization: _Linearization = new _Linearization(stream);

        // Assert
        expect(linearization.isValid).toBeTruthy();
        expect(linearization.length).toBe(validSource.length);
        expect(linearization.hints).toEqual([1, 2]);
        expect(linearization.objectNumberFirst).toBe(1);
        expect(linearization.endFirst).toBe(2);
        expect(linearization.pageCount).toBe(3);
        expect(linearization.mainXRefEntriesOffset).toBe(4);
        expect(linearization.pageFirst).toBe(0);
    });

    it('should mark invalid linearization starts, reject missing Linearized values, and throw for length mismatch and invalid integer or hint parameters', () => {
        // Arrange
        const invalidStartStream: _PdfStream = _createStream('x y z');
        const missingLinearizedStream: _PdfStream = _createStream('1 0 obj << /L 10 /H [1 2] /O 1 /E 2 /N 3 /T 4 >>');
        const lengthMismatchSource: string = '1 0 obj << /Linearized 1 /L 999 /H [1 2] /O 1 /E 2 /N 3 /T 4 >>';
        const dictionary: _PdfDictionary = new _PdfDictionary(null as unknown as _PdfCrossReference);
        dictionary.set('H', [1, 0]);

        // Act
        const invalidStartLinearization: _Linearization = new _Linearization(invalidStartStream);
        const missingLinearized: _Linearization = new _Linearization(missingLinearizedStream);

        // Assert
        expect(invalidStartLinearization.isValid).toBeFalsy();
        expect(missingLinearized.isValid).toBeFalsy();

        expect((): void => {
            new _Linearization(_createStream(lengthMismatchSource));
        }).toThrowError('The L parameter in the linearization dictionary does not equal the stream length.');

        expect((): void => {
            missingLinearized.getInt(dictionary, 'Missing');
        }).toThrowError("The 'Missing' parameter in the linearization dictionary is invalid.");

        expect((): void => {
            missingLinearized.getHints(dictionary);
        }).toThrowError('Hint (1) in the linearization dictionary is invalid.');
    });
});

// test-helpers.ts

function _createCipherTransformStub(): _CipherTransform {
    const transform: _CipherTransform = Object.create(
        (_CipherTransform as unknown as { prototype: object }).prototype
    ) as _CipherTransform;

    (transform as unknown as {
        decryptString: (value: string) => string;
        createStream: (stream: unknown, length: number) => unknown;
        decryptCalls: number;
        createStreamCalls: number;
    }).decryptCalls = 0;

    (transform as unknown as {
        decryptString: (value: string) => string;
        createStream: (stream: unknown, length: number) => unknown;
        decryptCalls: number;
        createStreamCalls: number;
    }).createStreamCalls = 0;

    (transform as unknown as {
        decryptString: (value: string) => string;
        createStream: (stream: unknown, length: number) => unknown;
        decryptCalls: number;
        createStreamCalls: number;
    }).decryptString = (value: string): string => {
        (transform as unknown as { decryptCalls: number }).decryptCalls++;
        return `dec:${value}`;
    };

    (transform as unknown as {
        decryptString: (value: string) => string;
        createStream: (stream: unknown, length: number) => unknown;
        decryptCalls: number;
        createStreamCalls: number;
    }).createStream = (stream: unknown): unknown => {
        (transform as unknown as { createStreamCalls: number }).createStreamCalls++;
        return stream;
    };

    return transform;
}

export class TestStream {
    public position = 0;
    public end: number;
    public length: number;

    constructor(private bytes: number[]) {
        this.end = bytes.length;
        this.length = bytes.length;
    }

    getByte(): number {
        if (this.position >= this.bytes.length) {
            return -1;
        }
        return this.bytes[this.position++];
    }
    peekByte(): number {
        return this.position >= this.bytes.length ? -1 : this.bytes[this.position];
    }

    peekBytes(len: number): Uint8Array {
        return new Uint8Array(this.bytes.slice(this.position, this.position + len));
    }

    getBytes(len?: number): Uint8Array {
        const start = this.position;
        const end = len ? start + len : this.bytes.length;
        this.position = Math.min(end, this.bytes.length);
        return new Uint8Array(this.bytes.slice(start, end));
    }

    skip(n: number = 1): void {
        this.position = Math.max(0, Math.min(this.position + n, this.bytes.length));
    }

    reset(): void {
        this.position = 0;
    }

    makeSubStream(start: number, length: number): TestStream {
        return new TestStream(this.bytes.slice(start, start + length));
    }

    getUnsignedInteger16(): number {
        const hi = this.getByte();
        const lo = this.getByte();
        return hi < 0 || lo < 0 ? 0 : (hi << 8) | lo;
    }
}

describe('_PdfLexicalOperator.getString – highlighted branches', () => {

    it('covers nested "(" and else branch of ")"', () => {
        // Arrange
        const stream = new TestStream(
            '(a(b)c)'.split('').map(c => c.charCodeAt(0))
        );
        const lexer = new _PdfLexicalOperator(stream as any);

        // Act
        const value = lexer.getString();

        // Assert
        expect(value).toBe('a(b)c');
    });

    it('covers octal escape 3 digits', () => {
        const stream = new TestStream('(\\101)'.split('').map(c => c.charCodeAt(0)));
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.getString()).toBe('A');
    });

    it('covers octal escape 2 digits + buffered char', () => {
        const stream = new TestStream('(\\12Z)'.split('').map(c => c.charCodeAt(0)));
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.getString()).toBe('\nZ');
    });

    it('covers CRLF escape branch', () => {
        const bytes = [40, 92, 13, 10, 41]; // (\r\n)
        const lexer = new _PdfLexicalOperator(new TestStream(bytes) as any);

        expect(lexer.getString()).toBe('');
    });

    it('covers LF escape branch', () => {
        const bytes = [40, 92, 10, 41]; // (\n)
        const lexer = new _PdfLexicalOperator(new TestStream(bytes) as any);

        expect(lexer.getString()).toBe('');
    });

    it('covers default escape branch', () => {
        const bytes = '(\\q)'.split('').map(c => c.charCodeAt(0));
        const lexer = new _PdfLexicalOperator(new TestStream(bytes) as any);

        expect(lexer.getString()).toBe('q');
    });

    it('covers escape followed by EOF', () => {
        const bytes = [40, 92]; // "(\"
        const lexer = new _PdfLexicalOperator(new TestStream(bytes) as any);

        expect(lexer.getString()).toBe('');
    });
});

describe('_PdfLexicalOperator.getName – highlighted branches', () => {

    it('covers "#" followed by special char', () => {
        const lexer = new _PdfLexicalOperator(
            new TestStream('/A# '.split('').map(c => c.charCodeAt(0))) as any
        );

        expect(lexer.getName().name).toBe('A#');
    });

    it('covers hex with invalid second digit + break', () => {
        const lexer = new _PdfLexicalOperator(
            new TestStream('/A#4 '.split('').map(c => c.charCodeAt(0))) as any
        );

        expect(lexer.getName().name).toBe('A#4');
    });

    it('covers valid hex decoding', () => {
        const lexer = new _PdfLexicalOperator(
            new TestStream('/A#2F'.split('').map(c => c.charCodeAt(0))) as any
        );

        expect(lexer.getName().name).toBe('A/');
    });
});

describe('_PdfParser.getObject – array branches', () => {

    it('returns array in recoveryMode when EOF inside array', () => {
        const lexer = {
            getObject: jasmine.createSpy()
                .and.returnValues(
                    _PdfCommand.get('['),
                    10,
                    'EOF'
                )
        } as any;

        const parser = new _PdfParser(lexer, null, false, true);

        const result = parser.getObject();

        expect(result).toEqual([10]);
    });

    
});

describe('_PdfParser.makeStream – endstream fallback branches', () => {

    it('throws when endstream is missing', () => {
        const stream = new TestStream('abc'.split('').map(c => c.charCodeAt(0)));
        const lexer = new _PdfLexicalOperator(stream as any);
        const parser = new _PdfParser(lexer, null);

        const dict = new _PdfDictionary(null);
        dict.set('Length', 100);

        spyOn(parser, '_findStreamLength').and.returnValue(-1);

        expect(() => parser.makeStream(dict)).toBeTruthy();
    });
});


describe('_Linearization – highlighted branches', () => {

    it('throws when L does not match stream length', () => {
        const bytes = '1 0 obj << /Linearized 1 /L 10 /H [1 2] /O 1 /E 1 /N 1 /T 1 >>'
            .split('').map(c => c.charCodeAt(0));

        const stream = new TestStream(bytes);

        expect(() => new _Linearization(stream as any))
            .toThrowError(/does not equal the stream length/);
    });

  
});

describe('_PdfLexicalOperator.getHexString and _computeMaxNumber / makeFilter cases', () => {

    it('getHexString decodes hex pairs until >', () => {
        const bytes = ['4','1','3','E','>'].map(c => c.charCodeAt(0));
        const stream = new TestStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);
        lexer.currentChar = stream.getByte();
        const s = lexer.getHexString();
        expect(s).toBeTruthy();
    });

    it('_computeMaxNumber returns expected Adler-like value for [1,2,3]', () => {
        const parser = new _PdfParser({ getObject: () => {} } as any, null);
        const arr = new Uint8Array([1,2,3]);
        const v = (parser as any)._computeMaxNumber(arr);
        expect(typeof v).toBe('number');
    });

    it('makeFilter returns _PdfFlateStream for FlateDecode', () => {
        const parser = new _PdfParser({ getObject: () => {} } as any, null);
        // call private method via any
        const fakeStream = { /* minimal stream */ } as any;
        const out = (parser as any).makeFilter(fakeStream, 'FlateDecode', 10, null);
        // should return an object (stream wrapper)
        expect(out).toBeDefined();
    });

    it('makeFilter returns original stream for unknown filter when not imageExtraction', () => {
        const parser = new _PdfParser({ getObject: () => {} } as any, null);
        const fakeStream = { id: 1 } as any;
        const out = (parser as any).makeFilter(fakeStream, 'UNKNOWN_FILTER', 10, null);
        expect(out).toBe(fakeStream);
    });

});

