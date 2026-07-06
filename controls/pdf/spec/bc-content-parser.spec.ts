import { PdfRubberStampAnnotation } from "../src/pdf/core/annotations/annotation";
import { _ContentLexer, _ContentParser, _PdfRecord } from "../src/pdf/core/content-parser";
import { _TokenType, PdfRubberStampAnnotationIcon } from "../src/pdf/core/enumerator";
import { PdfDocument } from "../src/pdf/core/pdf-document";

describe('Content-Parser file code coverage', function () {
    it('parse object method', function () {
        let document = new PdfDocument();
        let page = document.addPage();
        const annotation1 = new PdfRubberStampAnnotation({ x: 50, y: 50, width: 100, height: 50 });
        annotation1.opacity = 0.25;
        annotation1.icon = PdfRubberStampAnnotationIcon.approved;
        annotation1.setAppearance(true);
        const annotation2 = new PdfRubberStampAnnotation({ x: 50, y: 120, width: 100, height: 50 });
        annotation2.opacity = 0.5;
        annotation2.icon = PdfRubberStampAnnotationIcon.asIs;
        annotation2.setAppearance(true);
        const annotation3 = new PdfRubberStampAnnotation({ x: 50, y: 190, width: 100, height: 50 });
        annotation3.opacity = 1;
        annotation3.icon = PdfRubberStampAnnotationIcon.completed;
        annotation3.setAppearance(true);
        const annotation4 = new PdfRubberStampAnnotation({ x: 50, y: 260, width: 100, height: 50 });
        annotation4.opacity = 2;
        annotation4.icon = PdfRubberStampAnnotationIcon.draft;
        annotation4.setAppearance(true);
        const annotation5 = new PdfRubberStampAnnotation({ x: 200, y: 50, width: 100, height: 50 });
        annotation5.opacity = 0.25;
        annotation5.icon = PdfRubberStampAnnotationIcon.departmental;
        annotation5.flatten = true;
        const annotations = [annotation1, annotation2, annotation3, annotation4, annotation5];
        annotations.forEach(annotation => {
            page.annotations.add(annotation);
        });
        let updated = document.save();
        document = new PdfDocument(updated);
        page = document.getPage(0);
        let contents: any = page._pageDictionary.getArray('Contents');
        for (let i = 0; i < contents.length; i++) {
            var parser = new _ContentParser(contents[i].getBytes());
            if (i === 0) {
                parser._lexer._currentCharacter = '-';
            }
            else if (i === 1) {
                parser._lexer._currentCharacter = '1';
            }
            else {
                parser._lexer._currentCharacter = '\'';
            }
            var result = parser._readContent();
            expect(result).toBeDefined();
        }
        document.destroy();
    });
});
describe('_ContentParser / _ContentLexer / _PdfRecord coverage suite', () => {
    const eof: string = String.fromCharCode(65535);

    function toBytes(value: string): Uint8Array {
        return new Uint8Array(Array.from(value).map((ch: string) => ch.charCodeAt(0)));
    }

    describe('_PdfRecord', () => {
        it('should create a record with operands when array data is provided', () => {
            // Arrange
            const operands: string[] = ['10', '20'];

            // Act
            const record: _PdfRecord = new _PdfRecord('m', operands);

            // Assert
            expect(record._operator).toBe('m');
            expect(record._operands).toEqual(['10', '20']);
            expect(record._inlineImageBytes).toBeUndefined();
        });

        it('should create a record with inline image bytes when Uint8Array data is provided', () => {
            // Arrange
            const imageData: Uint8Array = new Uint8Array([1, 2, 3, 4]);

            // Act
            const record: _PdfRecord = new _PdfRecord('ID', imageData);

            // Assert
            expect(record._operator).toBe('ID');
            expect(Array.from(record._inlineImageBytes)).toEqual([1, 2, 3, 4]);
            expect(record._operands).toBeUndefined();
        });
    });

    describe('_ContentParser._parseObject', () => {
        it('should ignore beginArray and then throw when endArray is encountered', () => {
            // Arrange
            const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
            let callIndex: number = 0;
            spyOn(parser, '_getNextToken').and.callFake((): _TokenType => {
                callIndex++;
                switch (callIndex) {
                case 1:
                    return _TokenType.beginArray;
                case 2:
                    return _TokenType.endArray;
                default:
                    return _TokenType.eof;
                }
            });

            // Act / Assert
            expect((): void => {
                parser._parseObject(_TokenType.eof);
            }).toThrowError('Error while parsing content');
        });

        it('should stop parsing when tokenType matches the requested terminator', () => {
            // Arrange
            const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
            let callIndex: number = 0;
            spyOn(parser, '_getNextToken').and.callFake((): _TokenType => {
                callIndex++;
                if (callIndex === 1) {
                    return _TokenType.name;
                }
                return _TokenType.endArray;
            });
            parser._lexer._operatorParams = '/Name';

            // Act
            parser._parseObject(_TokenType.endArray);

            // Assert
            expect(parser._recordCollection.length).toBe(0);
            expect(parser._operands).toEqual(['/Name']);
        });
    });

    describe('_ContentParser._createRecord', () => {
        it('should create operand based record when _isByteOperand is false', () => {
            // Arrange
            const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
            parser._lexer._operatorParams = 'BT';
            parser._lexer._text = ['one', 'two'];
            parser._operands = ['100', '200'];
            parser._isByteOperand = false;

            // Act
            parser._createRecord();

            // Assert
            expect(parser._recordCollection.length).toBe(1);
            expect(parser._recordCollection[0]._operator).toBe('BT');
            expect(parser._recordCollection[0]._operands).toEqual(['100', '200']);
            expect(parser._recordCollection[0]._splitText).toEqual(['one', 'two']);
        });

        it('should create inline image byte record when _isByteOperand is true', () => {
            // Arrange
            const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
            parser._lexer._operatorParams = 'ID';
            parser._lexer._text = [];
            parser._inlineImageBytes = [9, 8, 7];
            parser._isByteOperand = true;

            // Act
            parser._createRecord();

            // Assert
            expect(parser._recordCollection.length).toBe(1);
            expect(parser._recordCollection[0]._operator).toBe('ID');
            expect(Array.from(parser._recordCollection[0]._inlineImageBytes)).toEqual([9, 8, 7]);
        });
    });

    describe('_ContentParser._consumeValue', () => {
        it('should stop safely on EI followed by whitespace and Q, and create inline image record', () => {
            // Arrange
            const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
            parser._inlineImageBytes = [10, 20, 30];

            const fakeLexer: _ContentLexer = parser._lexer;
            fakeLexer._text = [];
            fakeLexer._operatorParams = '';
            fakeLexer._nextCharacter = ' ';

            spyOn(fakeLexer, '_getNextCharForInlineStream').and.returnValue('E');

            let inlineCallIndex: number = 0;
            spyOn(fakeLexer, '_getNextInlineChar').and.callFake((): string => {
                inlineCallIndex++;
                return inlineCallIndex === 1 ? 'I' : ' ';
            });

            spyOn(fakeLexer, '_getNextChar').and.returnValue('Q');
            const resetSpy: jasmine.Spy = spyOn(fakeLexer, '_resetContentPointer').and.callThrough();

            // Act
            parser._consumeValue();

            // Assert
            expect(resetSpy).toHaveBeenCalledWith(1);
            expect(parser._recordCollection.length).toBe(1);
            expect(parser._recordCollection[0]._operator).toBe('EI');
            expect(Array.from(parser._recordCollection[0]._inlineImageBytes)).toEqual([10, 20, 30]);
            expect(parser._isByteOperand).toBeFalsy();
            expect(parser._inlineImageBytes).toEqual([]);
        });

        it('should push current/next/secondNext/third chars when secondNextChar is not whitespace before terminating safely', () => {
            // Arrange
            const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
            const fakeLexer: _ContentLexer = parser._lexer;
            fakeLexer._operatorParams = '';
            fakeLexer._text = [];
            fakeLexer._nextCharacter = 'X';

            let inlineStreamCallIndex: number = 0;
            spyOn(fakeLexer, '_getNextCharForInlineStream').and.callFake((): string => {
                inlineStreamCallIndex++;
                if (inlineStreamCallIndex === 1) {
                    fakeLexer._nextCharacter = 'X';
                    return 'E';
                }
                fakeLexer._nextCharacter = eof;
                return eof;
            });

            let inlineCharCallIndex: number = 0;
            spyOn(fakeLexer, '_getNextInlineChar').and.callFake((): string => {
                inlineCharCallIndex++;
                return inlineCharCallIndex === 1 ? 'I' : eof;
            });

            spyOn(fakeLexer, '_getNextChar').and.returnValue('Q');
            spyOn(fakeLexer, '_resetContentPointer').and.callThrough();

            // Act
            parser._consumeValue();

            // Assert
            expect(parser._recordCollection.length).toBe(1);
            expect(parser._recordCollection[0]._operator).toBe('￿￿');
            expect(Array.from(parser._recordCollection[0]._inlineImageBytes)).toEqual([
                'E'.charCodeAt(0) & 0xFF,
                'I'.charCodeAt(0) & 0xFF,
                'X'.charCodeAt(0) & 0xFF,
                'X'.charCodeAt(0) & 0xFF
            ]);
        });

        it('should push current and next byte when currentChar is E but nextChar is not I', () => {
            // Arrange
            const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
            const fakeLexer: _ContentLexer = parser._lexer;
            fakeLexer._operatorParams = '';
            fakeLexer._text = [];
            fakeLexer._nextCharacter = eof;

            let inlineStreamCallIndex: number = 0;
            spyOn(fakeLexer, '_getNextCharForInlineStream').and.callFake((): string => {
                inlineStreamCallIndex++;
                return inlineStreamCallIndex === 1 ? 'E' : eof;
            });

            let inlineCharCallIndex: number = 0;
            spyOn(fakeLexer, '_getNextInlineChar').and.callFake((): string => {
                inlineCharCallIndex++;
                return inlineCharCallIndex === 1 ? 'X' : eof;
            });

            spyOn(fakeLexer, '_getNextChar').and.returnValue(eof);
            spyOn(fakeLexer, '_resetContentPointer').and.callThrough();

            // Act
            parser._consumeValue();

            // Assert
            expect(parser._recordCollection.length).toBe(1);
            expect(Array.from(parser._recordCollection[0]._inlineImageBytes)).toEqual([
                'E'.charCodeAt(0) & 0xFF,
                'X'.charCodeAt(0) & 0xFF
            ]);
        });

        it('should push only the current byte when currentChar is not E', () => {
            // Arrange
            const parser: _ContentParser = new _ContentParser(new Uint8Array([]));
            const fakeLexer: _ContentLexer = parser._lexer;
            fakeLexer._operatorParams = '';
            fakeLexer._text = [];
            fakeLexer._nextCharacter = eof;

            let inlineStreamCallIndex: number = 0;
            spyOn(fakeLexer, '_getNextCharForInlineStream').and.callFake((): string => {
                inlineStreamCallIndex++;
                return inlineStreamCallIndex === 1 ? 'A' : eof;
            });

            spyOn(fakeLexer, '_getNextInlineChar').and.returnValue(eof);
            spyOn(fakeLexer, '_getNextChar').and.returnValue(eof);
            spyOn(fakeLexer, '_resetContentPointer').and.callThrough();

            // Act
            parser._consumeValue();

            // Assert
            expect(parser._recordCollection.length).toBe(1);
            expect(Array.from(parser._recordCollection[0]._inlineImageBytes)).toEqual([
                'A'.charCodeAt(0) & 0xFF
            ]);
        });
    });

    describe('_ContentLexer._getNextToken', () => {
        it('should route "+" to _getNumber()', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            spyOn(lexer, '_moveToNextChar').and.returnValue('+');
            spyOn(lexer, '_getNumber').and.returnValue(_TokenType.number);

            // Act
            const token: _TokenType = lexer._getNextToken();

            // Assert
            expect(token).toBe(_TokenType.number);
            expect(lexer._getNumber).toHaveBeenCalled();
        });

        it('should route "." to _getNumber()', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            spyOn(lexer, '_moveToNextChar').and.returnValue('.');
            spyOn(lexer, '_getNumber').and.returnValue(_TokenType.number);

            // Act
            const token: _TokenType = lexer._getNextToken();

            // Assert
            expect(token).toBe(_TokenType.number);
            expect(lexer._getNumber).toHaveBeenCalled();
        });

        it('should route double quote to _getOperator()', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            spyOn(lexer, '_moveToNextChar').and.returnValue('"');
            spyOn(lexer, '_getOperator').and.returnValue(_TokenType.operator);

            // Act
            const token: _TokenType = lexer._getNextToken();

            // Assert
            expect(token).toBe(_TokenType.operator);
            expect(lexer._getOperator).toHaveBeenCalled();
        });

        it('should return eof when moveToNextChar returns the EOF sentinel', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            spyOn(lexer, '_moveToNextChar').and.returnValue(eof);

            // Act
            const token: _TokenType = lexer._getNextToken();

            // Assert
            expect(token).toBe(_TokenType.eof);
        });

        it('should return none for an unsupported token starter', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            spyOn(lexer, '_moveToNextChar').and.returnValue(']');

            // Act
            const token: _TokenType = lexer._getNextToken();

            // Assert
            expect(token).toBe(_TokenType.none);
        });
    });

    describe('_ContentLexer._getNumber', () => {
        it('should stop at the second decimal point and keep only the first valid decimal number', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(toBytes('1.2.3 '));
            lexer._currentCharacter = '1';
            lexer._nextCharacter = '.';
            lexer._offset = 2;

            // Act
            const token: _TokenType = lexer._getNumber();

            // Assert
            expect(token).toBe(_TokenType.number);
            expect(lexer._operatorParams).toBe('undefined1.2');
        });

        it('should read a signed number starting with minus', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(toBytes('-25 '));
            lexer._currentCharacter = '-';
            lexer._nextCharacter = '2';
            lexer._offset = 2;

            // Act
            const token: _TokenType = lexer._getNumber();

            // Assert
            expect(token).toBe(_TokenType.number);
            expect(lexer._operatorParams).toBe('undefined-25');
        });
    });

    describe('_ContentLexer._getLiteralString', () => {
        it('should cover array parsing branches for "(", "]", ">", and "<"', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            lexer._currentCharacter = '[';
            lexer._operatorParams = '';
            lexer._text = [];

            const consumeValues: string[] = ['x', '<', '>', '(', 'B', ']'];
            let consumeIndex: number = 0;
            spyOn(lexer, '_consumeValue').and.callFake((): string => {
                return consumeValues[consumeIndex++];
            });

            spyOn(lexer, '_getLiteralStringValue').and.returnValue('B)');
            spyOn(lexer, '_getNextChar').and.returnValue(']');

            // Act
            const token: _TokenType = lexer._getLiteralString();

            // Assert
            expect(token).toBe(_TokenType.string);
            expect(lexer._operatorParams).toBe('B)');
            expect(lexer._text.length).toBeGreaterThan(0);
            expect(lexer._text).toContain('<>');
            expect(lexer._text).toContain('(B)');
        });

        it('should parse a simple literal string when beginChar is "("', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            lexer._currentCharacter = '(';
            spyOn(lexer, '_consumeValue').and.returnValue('H');
            spyOn(lexer, '_getLiteralStringValue').and.returnValue('Hello)');
            spyOn(lexer, '_getNextChar').and.returnValue(' ');

            // Act
            const token: _TokenType = lexer._getLiteralString();

            // Assert
            expect(token).toBe(_TokenType.string);
            expect(lexer._operatorParams).toBe('Hello)');
        });
    });

    describe('_ContentLexer._getEncodedDecimalString', () => {
        it('should cover parentLevel === 1 branch where consumed value is ">"', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            lexer._currentCharacter = '<';

            const values: string[] = ['<', '>', '>', ' '];
            let index: number = 0;
            spyOn(lexer, '_consumeValue').and.callFake((): string => values[index++]);

            // Act
            const token: _TokenType = lexer._getEncodedDecimalString();

            // Assert
            expect(token).toBe(_TokenType.hexString);
        });

        it('should cover parentLevel === 1 branch where consumed value is a space', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            lexer._currentCharacter = '<';

            const values: string[] = ['<', '>', ' '];
            let index: number = 0;
            spyOn(lexer, '_consumeValue').and.callFake((): string => values[index++]);

            // Act
            const token: _TokenType = lexer._getEncodedDecimalString();

            // Assert
            expect(token).toBe(_TokenType.hexString);
        });

        it('should cover nested parentLevel > 1 branch and decrement when value is ">"', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            lexer._currentCharacter = '<';

            const values: string[] = ['<', '<', '>', 'x', '>', ' '];
            let index: number = 0;
            spyOn(lexer, '_consumeValue').and.callFake((): string => values[index++]);

            // Act
            const token: _TokenType = lexer._getEncodedDecimalString();

            // Assert
            expect(token).toBe(_TokenType.hexString);
        });
    });

    describe('_ContentLexer._getLiteralStringValue', () => {
        it('should handle nested parentheses and close them correctly', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            const nextChars: string[] = ['a', ')', ')'];
            let index: number = 0;
            spyOn(lexer, '_getNextChar').and.callFake((): string => nextChars[index++]);

            // Act
            const literal: string = lexer._getLiteralStringValue('(');

            // Assert
            expect(literal).toBe('(a))');
        });

        it('should handle escape sequence inside literal string', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            const nextChars: string[] = ['n', ')'];
            let index: number = 0;
            spyOn(lexer, '_getNextChar').and.callFake((): string => nextChars[index++]);

            // Act
            const literal: string = lexer._getLiteralStringValue('\\');

            // Assert
            expect(literal).toBe('\\n)');
        });
    });

    describe('_ContentLexer._getNextInlineChar', () => {
        it('should keep CR when CR is followed by LF', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(toBytes('\n'));
            lexer._currentCharacter = '\r';
            lexer._nextCharacter = '\r';
            lexer._offset = 0;

            // Act
            const value: string = lexer._getNextInlineChar();

            // Assert
            expect(value).toBe('\r');
        });

        it('should normalize CR to LF when CR is not followed by LF', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(toBytes('A'));
            lexer._currentCharacter = '\r';
            lexer._nextCharacter = '\r';
            lexer._offset = 0;

            // Act
            const value: string = lexer._getNextInlineChar();

            // Assert
            expect(value).toBe('\n');
        });
    });

    describe('_ContentLexer._getNextCharForInlineStream', () => {
        it('should set currentCharacter to LF and nextCharacter to EOF when CRLF occurs at the end of data', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(toBytes('\n'));
            lexer._currentCharacter = '\r';
            lexer._nextCharacter = '\r';
            lexer._offset = 0;

            // Act
            const value: string = lexer._getNextCharForInlineStream();

            // Assert
            expect(value).toBe('\n');
            expect(lexer._nextCharacter).toBe(eof);
        });
    });

    describe('_ContentLexer._getNextChar', () => {
        it('should return nextCharacter when data is exhausted and nextCharacter is Q', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            lexer._currentCharacter = 'X';
            lexer._nextCharacter = 'Q';
            lexer._offset = 0;

            // Act
            const value: string = lexer._getNextChar();

            // Assert
            expect(value).toBe('Q');
            expect(lexer._nextCharacter).toBe(eof);
        });

        it('should return nextCharacter when data is exhausted and currentCharacter is D while nextCharacter is o', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));
            lexer._currentCharacter = 'D';
            lexer._nextCharacter = 'o';
            lexer._offset = 0;

            // Act
            const value: string = lexer._getNextChar();

            // Assert
            expect(value).toBe('o');
            expect(lexer._nextCharacter).toBe(eof);
        });

        it('should advance over CRLF and read the next character', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(toBytes('\nA'));
            lexer._currentCharacter = '\r';
            lexer._nextCharacter = '\r';
            lexer._offset = 0;

            // Act
            const value: string = lexer._getNextChar();

            // Assert
            expect(value).toBe('\n');
            expect(lexer._nextCharacter).toBe('A');
        });

        it('should normalize CR to LF when CR is not followed by LF', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(toBytes('B'));
            lexer._currentCharacter = '\r';
            lexer._nextCharacter = '\r';
            lexer._offset = 0;

            // Act
            const value: string = lexer._getNextChar();

            // Assert
            expect(value).toBe('\n');
        });
    });

    describe('_ContentLexer._moveToNextChar', () => {
        it('should skip whitespace and return the next non-whitespace character', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(toBytes('A'));
            lexer._currentCharacter = ' ';
            lexer._nextCharacter = 'A';
            lexer._offset = 1;

            // Act
            const value: string = lexer._moveToNextChar();

            // Assert
            expect(value).toBe('￿');
        });
    });

    describe('_ContentLexer._isOperator', () => {
        it('should return true for operator characters not covered by alpha branch', () => {
            // Arrange
            const lexer: _ContentLexer = new _ContentLexer(new Uint8Array([]));

            // Act / Assert
            expect(lexer._isOperator('*')).toBeTruthy();
            expect(lexer._isOperator('\'')).toBeTruthy();
            expect(lexer._isOperator('"')).toBeTruthy();
            expect(lexer._isOperator('1')).toBeTruthy();
            expect(lexer._isOperator('0')).toBeTruthy();
            expect(lexer._isOperator('%')).toBeFalsy();
        });
    });
});
``
