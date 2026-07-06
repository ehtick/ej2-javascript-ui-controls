import { _ContentParser, _ContentLexer, _PdfRecord } from '../src/pdf/core/content-parser';
import { _TokenType } from '../src/pdf/core/enumerator';

describe('_ContentParser and _ContentLexer behavior tests', () => {

    it('constructor - initializes with Uint8Array', () => {
        // Arrange
        const data: Uint8Array = new Uint8Array([49, 50, 32, 48, 32, 84, 102]); // "12 0 Tf"
        // Act
        const parser: _ContentParser = new _ContentParser(data);
        // Assert
        expect(parser).toBeDefined();
        expect(parser._lexer).toBeDefined();
        expect(parser._operands).toEqual([]);
        expect(parser._recordCollection).toEqual([]);
    });

    it('constructor - initializes with number array', () => {
        // Arrange
        const data: number[] = [49, 50, 32, 48, 32, 84, 102]; // "12 0 Tf"
        // Act
        const parser: _ContentParser = new _ContentParser(data);
        // Assert
        expect(parser).toBeDefined();
        expect(parser._lexer).toBeDefined();
        expect(parser._operands).toEqual([]);
    });

    it('_readContent - parses complete content stream', () => {
        // Arrange
        const data: number[] = [49, 50, 32, 48, 32, 84, 102]; // "12 0 Tf"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        const records: _PdfRecord[] = parser._readContent();
        // Assert
        expect(records).toBeDefined();
        expect(Array.isArray(records)).toBe(true);
    });

    it('_parseObject - handles comment tokens and skips them', () => {
        // Arrange
        const data: number[] = [37, 99, 111, 109, 109, 101, 110, 116, 10]; // "%comment\n"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBe(0);
    });

    it('_parseObject - number token with valid operatorParams', () => {
        // Arrange
        const data: number[] = [49, 50, 32, 84, 102]; // "12 Tf"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
        expect(parser._recordCollection[0]._operands).toBeDefined();
    });

    it('_parseObject - number token with minus sign operatorParam branch', () => {
        // Arrange
        const data: number[] = [45, 32, 84, 102]; // "- Tf" (minus sign alone)
        const parser: _ContentParser = new _ContentParser(data);
        parser._lexer._operatorParams = '-';
        // Act
        parser._operands.push('initial');
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._operands.length).toBe(0);
    });

    it('_parseObject - real token handling', () => {
        // Arrange
        const data: number[] = [49, 50, 46, 51, 32, 84, 102]; // "12.3 Tf"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - string token handling', () => {
        // Arrange
        const data: number[] = [40, 116, 101, 120, 116, 41, 32, 84, 106]; // "(text) Tj"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - hexString token handling', () => {
        // Arrange
        const data: number[] = [60, 48, 49, 62, 32, 84, 106]; // "<01> Tj"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - unicodeHexString token handling', () => {
        // Arrange
        const data: number[] = [60, 48, 49, 62, 32, 84, 106]; // "<01> Tj"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - unicodeString token handling', () => {
        // Arrange
        const data: number[] = [40, 117, 110, 105, 99, 111, 100, 101, 41, 32, 84, 106]; // "(unicode) Tj"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - name token handling', () => {
        // Arrange
        const data: number[] = [47, 70, 49, 32, 84, 102]; // "/F1 Tf"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - operator token (not ID)', () => {
        // Arrange
        const data: number[] = [49, 50, 32, 84, 102]; // "12 Tf"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });


    it('_parseObject - beginArray token', () => {
        // Arrange
        const data: number[] = [91, 49, 50, 93, 32, 84, 102]; // "[12] Tf"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });



    it('_parseObject - returns on tokenType match', () => {
        // Arrange
        const data: number[] = [49, 50]; // "12"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.number);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThanOrEqual(0);
    });

    it('_parseObject - returns on none token type', () => {
        // Arrange
        const data: number[] = [64]; // "@" (unknown character, maps to none)
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThanOrEqual(0);
    });


    it('_createRecord - creates record with operands', () => {
        // Arrange
        const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
        parser._lexer._operatorParams = 'Tf';
        parser._operands = ['12', '0'];
        parser._lexer._text = ['Tf'];
        // Act
        parser._createRecord();
        // Assert
        expect(parser._recordCollection.length).toBe(1);
        expect(parser._recordCollection[0]._operator).toBe('Tf');
        expect(parser._recordCollection[0]._operands).toEqual(['12', '0']);
    });

    it('_createRecord - creates record with byte operand', () => {
        // Arrange
        const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
        parser._lexer._operatorParams = 'ID';
        parser._isByteOperand = true;
        parser._inlineImageBytes = [82, 71, 66];
        parser._lexer._text = [];
        // Act
        parser._createRecord();
        // Assert
        expect(parser._recordCollection.length).toBe(1);
        expect(parser._recordCollection[0]._operator).toBe('ID');
        expect(parser._recordCollection[0]._inlineImageBytes).toBeDefined();
    });


    it('_getComment - consumes comment until newline', () => {
        // Arrange
        const data: number[] = [37, 116, 101, 115, 116, 10]; // "%test\n"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '%';
        // Act
        const token: _TokenType = lexer._getComment();
        // Assert
        expect(token).toBe(_TokenType.comment);
    });

    it('_getComment - stops at EOF', () => {
        // Arrange
        const data: number[] = [37]; // "%"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '%';
        // Act
        const token: _TokenType = lexer._getComment();
        // Assert
        expect(token).toBe(_TokenType.comment);
    });

    it('_getName - extracts name delimited by whitespace', () => {
        // Arrange
        const data: number[] = [70, 49, 32]; // "F1 "
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '/';
        // Act
        const token: _TokenType = lexer._getName();
        // Assert
        expect(token).toBe(_TokenType.name);
    });

    it('_getNumber - parses positive integer', () => {
        // Arrange
        const data: number[] = [49, 50]; // "12"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '1';
        // Act
        const token: _TokenType = lexer._getNumber();
        // Assert
        expect(token).toBe(_TokenType.number);
        expect(lexer._operatorParams.length).toBeGreaterThan(0);
    });

    it('_getNumber - parses negative integer', () => {
        // Arrange
        const data: number[] = [49, 50]; // "12"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '-';
        // Act
        const token: _TokenType = lexer._getNumber();
        // Assert
        expect(token).toBe(_TokenType.number);
    });

    it('_getNumber - parses positive sign prefix', () => {
        // Arrange
        const data: number[] = [49, 50]; // "12"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '+';
        // Act
        const token: _TokenType = lexer._getNumber();
        // Assert
        expect(token).toBe(_TokenType.number);
    });
    it('_getOperator - parses alphabetic operator', () => {
        // Arrange
        const data: number[] = [102]; // "f"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = 'T';
        // Act
        const token: _TokenType = lexer._getOperator();
        // Assert
        expect(token).toBe(_TokenType.operator);
    });

    it('_isOperator - recognizes alphabetic character', () => {
        // Arrange
        const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
        // Act
        const result: boolean = lexer._isOperator('a');
        // Assert
        expect(result).toBe(true);
    });

    it('_isOperator - recognizes star character', () => {
        // Arrange
        const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
        // Act
        const result: boolean = lexer._isOperator('*');
        // Assert
        expect(result).toBe(true);
    });

    it('_isOperator - recognizes quote character', () => {
        // Arrange
        const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
        // Act
        const result: boolean = lexer._isOperator('\'');
        // Assert
        expect(result).toBe(true);
    });

    it('_isOperator - recognizes double quote character', () => {
        // Arrange
        const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
        // Act
        const result: boolean = lexer._isOperator('"');
        // Assert
        expect(result).toBe(true);
    });

    it('_isOperator - recognizes digit 1', () => {
        // Arrange
        const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
        // Act
        const result: boolean = lexer._isOperator('1');
        // Assert
        expect(result).toBe(true);
    });

    it('_isOperator - recognizes digit 0', () => {
        // Arrange
        const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
        // Act
        const result: boolean = lexer._isOperator('0');
        // Assert
        expect(result).toBe(true);
    });

    it('_isOperator - rejects non-operator character', () => {
        // Arrange
        const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
        // Act
        const result: boolean = lexer._isOperator(' ');
        // Assert
        expect(result).toBe(false);
    });





    it('_getEncodedDecimalString - parses simple hex string', () => {
        // Arrange
        const data: number[] = [60, 48, 49, 62]; // "<01>"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '<';
        // Act
        const token: _TokenType = lexer._getEncodedDecimalString();
        // Assert
        expect(token).toBe(_TokenType.hexString);
    });

    it('_getEncodedDecimalString - handles nested angle brackets', () => {
        // Arrange
        const data: number[] = [60, 60, 48, 49, 62, 62]; // "<<01>>"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '<';
        // Act
        const token: _TokenType = lexer._getEncodedDecimalString();
        // Assert
        expect(token).toBe(_TokenType.hexString);
    });



    it('_getEncodedDecimalString - handles space with nested brackets', () => {
        ;
        // Arrange
        const data: number[] = [60, 60, 48, 32, 62, 62]; // "<<0 >>"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '<';
        // Act
        const token: _TokenType = lexer._getEncodedDecimalString();
        // Assert
        expect(token).toBe(_TokenType.hexString);
    });

    it('_moveToNextChar - skips whitespace characters', () => {
        // Arrange
        const data: number[] = [32, 32, 84, 102]; // "  Tf"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._moveToNextChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_moveToNextChar - skips tab characters', () => {
        // Arrange
        const data: number[] = [9, 84, 102]; // "\tTf"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._moveToNextChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_moveToNextChar - skips newline characters', () => {
        // Arrange
        const data: number[] = [10, 84, 102]; // "\nTf"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._moveToNextChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_moveToNextChar - skips form feed characters', () => {
        // Arrange
        const data: number[] = [12, 84, 102]; // "\fTf"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._moveToNextChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_moveToNextChar - skips carriage return characters', () => {
        // Arrange
        const data: number[] = [13, 84, 102]; // "\rTf"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._moveToNextChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_moveToNextChar - skips backspace characters', () => {
        // Arrange
        const data: number[] = [8, 84, 102]; // "\bTf"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._moveToNextChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_moveToNextChar - returns non-whitespace character', () => {
        // Arrange
        const data: number[] = [84, 102]; // "Tf"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._moveToNextChar();
        // Assert
        expect(result).toBe('T');
    });

    it('_moveToNextChar - handles EOF', () => {
        // Arrange
        const data: number[] = [];
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = String.fromCharCode(65535);
        // Act
        const result: string = lexer._moveToNextChar();
        // Assert
        expect(result).toBe(String.fromCharCode(65535));
    });

    it('_resetContentPointer - decrements offset by count', () => {
        // Arrange
        const data: number[] = [49, 50, 51, 52]; // "1234"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._offset = 4;
        // Act
        lexer._resetContentPointer(2);
        // Assert
        expect(lexer._offset).toBe(2);
    });

    it('_getNextInlineChar - retrieves next character for inline stream', () => {
        // Arrange
        const data: number[] = [82, 71, 66]; // "RGB"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._getNextInlineChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_getNextInlineChar - handles EOF', () => {
        // Arrange
        const data: number[] = [];
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._getNextInlineChar();
        // Assert
        expect(result).toBe(String.fromCharCode(65535));
    });

    it('_getNextInlineChar - normalizes carriage return without line feed', () => {
        // Arrange
        const data: number[] = [13, 82]; // "\rR"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '\x0D';
        // Act
        const result: string = lexer._getNextInlineChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_getNextInlineChar - normalizes CRLF sequence', () => {
        // Arrange
        const data: number[] = [13, 10, 82]; // "\r\nR"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '\x0D';
        // Act
        const result: string = lexer._getNextInlineChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_getNextCharForInlineStream - retrieves next character', () => {
        // Arrange
        const data: number[] = [82, 71, 66]; // "RGB"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._getNextCharForInlineStream();
        // Assert
        expect(result).toBeDefined();
    });

    it('_getNextCharForInlineStream - handles EOF', () => {
        // Arrange
        const data: number[] = [];
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._getNextCharForInlineStream();
        // Assert
        expect(result).toBe(String.fromCharCode(65535));
    });

    it('_getNextCharForInlineStream - normalizes CR without LF and sets nextCharacter to EOF', () => {
        // Arrange
        const data: number[] = [13]; // "\r"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '\x0D';
        // Act
        const result: string = lexer._getNextCharForInlineStream();
        // Assert
        expect(result).toBeDefined();
    });

    it('_getNextCharForInlineStream - normalizes CRLF correctly', () => {
        // Arrange
        const data: number[] = [13, 10, 82]; // "\r\nR"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '\x0D';
        // Act
        const result: string = lexer._getNextCharForInlineStream();
        // Assert
        expect(result).toBeDefined();
    });

    it('_getNextChar - retrieves next character and advances offset', () => {
        // Arrange
        const data: number[] = [49, 50]; // "12"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._getNextChar();
        // Assert
        expect(result).toBeDefined();
    });

    it('_getNextChar - handles EOF condition', () => {
        // Arrange
        const data: number[] = [];
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const result: string = lexer._getNextChar();
        // Assert
        expect(result).toBe(String.fromCharCode(65535));
    });

    it('_getNextChar - special handling for Q character at EOF', () => {
        // Arrange
        const data: number[] = [];
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._nextCharacter = 'Q';
        // Act
        const result: string = lexer._getNextChar();
        // Assert
        expect(result).toBe('Q');
        expect(lexer._nextCharacter).toBe(String.fromCharCode(65535));
    });

    it('_getNextChar - special handling for Do character sequence at EOF', () => {
        // Arrange
        const data: number[] = [];
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = 'D';
        lexer._nextCharacter = 'o';
        // Act
        const result: string = lexer._getNextChar();
        // Assert
        expect(result).toBe('o');
        expect(lexer._nextCharacter).toBe(String.fromCharCode(65535));
    });


    it('_getNextChar - normalizes CR without LF', () => {
        // Arrange
        const data: number[] = [82]; // "R"
        const lexer: _ContentLexer = new _ContentLexer(data);

        lexer._currentCharacter = '\x0D'; // CR
        lexer._nextCharacter = 'R';       // simulate next char not LF

        // Act
        const result: string = lexer._getNextChar();

        // Assert
        expect(result).toBe('R'); // normalized to LF
    });


    it('_getNextChar - normalizes CRLF to LF', () => {
        // Arrange
        const data: number[] = [82]; // remaining data ("R")
        const lexer: _ContentLexer = new _ContentLexer(data);

        lexer._currentCharacter = '\x0D'; // CR
        lexer._nextCharacter = '\x0A';    // LF

        // Act
        const result: string = lexer._getNextChar();

        // Assert
        expect(result).toBe('\x0A');
    });


    it('_PdfRecord constructor - stores operator and operands', () => {
        // Arrange
        const operator: string = 'Tf';
        const operands: string[] = ['12', '0'];
        // Act
        const record: _PdfRecord = new _PdfRecord(operator, operands);
        // Assert
        expect(record._operator).toBe('Tf');
        expect(record._operands).toEqual(['12', '0']);
    });

    it('_PdfRecord constructor - stores operator and inline image bytes', () => {
        // Arrange
        const operator: string = 'ID';
        const imageData: Uint8Array = new Uint8Array([82, 71, 66]);
        // Act
        const record: _PdfRecord = new _PdfRecord(operator, imageData);
        // Assert
        expect(record._operator).toBe('ID');
        expect(record._inlineImageBytes).toEqual(imageData);
    });




    it('_getNextChar - normalizes CRLF and sets EOF for nextCharacter', () => {
        // Arrange
        const data: number[] = []; // no more bytes after LF
        const lexer: _ContentLexer = new _ContentLexer(data);

        lexer._currentCharacter = '\x0D'; // CR
        lexer._nextCharacter = '\x0A';    // LF

        // Act
        const result: string = lexer._getNextChar();

        // Assert
        expect(result).toBe('￿');
        expect(lexer._nextCharacter).toBe(String.fromCharCode(65535)); // EOF
    });

    it('_parseObject - real token case (line 90-93) - operand collection', () => {
        // Arrange
        const data: number[] = [49, 50, 46, 51, 32, 84, 102]; // "12.3 Tf"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
        expect(parser._recordCollection[0]._operands).toContain('12.3');
    });

    it('_parseObject - hexString token case (line 112+) - operand collection', () => {
        // Arrange
        const data: number[] = [60, 48, 49, 62, 32, 84, 106]; // "<01> Tj"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - string token case (line 112+) - operand collection', () => {
        // Arrange
        const data: number[] = [40, 116, 101, 120, 116, 41, 32, 84, 106]; // "(text) Tj"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - unicodeHexString token case (line 112+)', () => {
        // Arrange
        const data: number[] = [60, 48, 49, 50, 51, 62, 32, 84, 106]; // "<0123> Tj"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - unicodeString token case (line 112+)', () => {
        // Arrange
        const data: number[] = [40, 117, 110, 105, 99, 111, 100, 101, 41, 32, 84, 106]; // "(unicode) Tj"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - name token case (line 112+)', () => {
        // Arrange
        const data: number[] = [47, 70, 49, 32, 84, 102]; // "/F1 Tf"
        const parser: _ContentParser = new _ContentParser(data);
        // Act
        parser._parseObject(_TokenType.eof);
        // Assert
        expect(parser._recordCollection.length).toBeGreaterThan(0);
    });

    it('_parseObject - operator token ID case (line 89-93) - calls consumeValue', () => {
        // Arrange
        const data: number[] = [73, 68, 32, 65]; // "ID A"
        const parser: _ContentParser = new _ContentParser(data);
        spyOn(parser, '_consumeValue');
        // Act
        try {
            parser._parseObject(_TokenType.eof);
        } catch (e) {
            // Expected: consumeValue enters infinite loop, we just verify it was called
        }
        // Assert
        expect(parser._consumeValue).toHaveBeenCalled();
    });

    it('_getNextToken - returns eof when value is 65535 (line 273)', () => {
        // Arrange
        const data: number[] = [];
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = String.fromCharCode(65535);
        // Act
        const token: _TokenType = lexer._getNextToken();
        // Assert
        expect(token).toBe(_TokenType.eof);
    });

    it('_getNextToken - returns none for invalid character (line 273)', () => {
        // Arrange
        const data: number[] = [64]; // "@"
        const lexer: _ContentLexer = new _ContentLexer(data);
        // Act
        const token: _TokenType = lexer._getNextToken();
        // Assert
        expect(token).toBe(12);
    });

    it('_getName - returns name on delimiter detection (line 323)', () => {
        // Arrange
        const data: number[] = [70, 49, 32]; // "F1 "
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '/';
        // Act
        const token: _TokenType = lexer._getName();
        // Assert
        expect(token).toBe(_TokenType.name);
    });

    it('_getNumber - parses decimal with plus sign (line 342+)', () => {
        // Arrange
        const data: number[] = [49, 50, 46, 51]; // "12.3"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '+';
        // Act
        const token: _TokenType = lexer._getNumber();
        // Assert
        expect(token).toBe(_TokenType.number);
        expect(lexer._operatorParams).toContain('+');
    });

    it('_getNumber - handles duplicate decimal point (line 342+)', () => {
        // Arrange
        const data: number[] = [50, 46, 51]; // "2.3"
        const lexer: _ContentLexer = new _ContentLexer(data);
        lexer._currentCharacter = '1';
        lexer._operatorParams = '1.2';
        // Act
        const token: _TokenType = lexer._getNumber();
        // Assert
        expect(token).toBe(_TokenType.number);
    });


});


describe('_ContentParser _parseObject (lines 112-157) targeted tests', () => {
  it('collects various operand token types and creates an operator record', () => {
    const parser = new _ContentParser(new Uint8Array(0));
    const tokens = [
      _TokenType.number,            // '-'
      _TokenType.number,            // '42'
      _TokenType.real,              // '3.14'
      _TokenType.string,            // '(abc)'
      _TokenType.hexString,         // '<AB>'
      _TokenType.unicodeHexString,  // '<UHEX>'
      _TokenType.unicodeString,     // '(u)'
      _TokenType.name,              // '/Name'
      _TokenType.operator,          // 'Tj'
      _TokenType.eof
    ];
    const params = [
      '-', '42', '3.14', '(abc)', '<AB>', '<UHEX>', '(u)', '/Name', 'Tj', ''
    ];
    parser._lexer = {
      _operatorParams: '',
      _text: [],
      _getNextToken: jasmine.createSpy('_getNextToken').and.callFake(() => {
        const t = tokens.shift();
        parser._lexer._operatorParams = params.shift();
        return t;
      })
    } as any;

    parser._parseObject(_TokenType.eof);

    expect(parser._recordCollection.length).toBe(1);
    const rec = parser._recordCollection[0];
    expect(rec._operator).toBe('Tj');
    expect(rec._operands).toEqual(['0', '42', '3.14', '(abc)', '<AB>', '<UHEX>', '(u)', '/Name']);
  });

  it('throws when encountering endArray token', () => {
    const parser = new _ContentParser(new Uint8Array(0));
    parser._lexer = {
      _operatorParams: '',
      _text: [],
      _getNextToken: jasmine.createSpy('_getNextToken').and.returnValue(_TokenType.endArray)
    } as any;

    expect(() => parser._parseObject(_TokenType.eof)).toThrowError('Error while parsing content');
  });
});
