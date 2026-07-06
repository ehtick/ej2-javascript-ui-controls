import { _PdfLexicalOperator, _PdfParser } from './../src/pdf/core/pdf-parser';
import { _PdfStream } from './../src/pdf/core/base-stream';
import { FormatError } from '../src/pdf/core/utils';

class MockStream {
	bytes: number[];
	position: number = 0;
	end: number;
	constructor(bytes: number[]) {
		this.bytes = bytes;
		this.end = bytes.length;
	}
	getByte(): number {
		if (this.position < this.bytes.length) {
			return this.bytes[this.position++];
		}
		return -1;
	}
	peekByte(): number {
		return this.position < this.bytes.length ? this.bytes[this.position] : -1;
	}
	skip(n?: number): void {
		if (typeof n === 'number') {
			this.position += n;
		} else {
			this.position++;
		}
	}
}

describe('PdfLexicalOperator.getNumber - targeted branches', () => {

	it('parses negative number when input starts with "--" then digits (double-minus path)', () => {
		// Arrange
		const bytes: number[] = [0x2d, 0x2d, 0x31, 0x32, 0x20]; // "- - 1 2 space"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const value = lexer.getNumber();

		// Assert
		expect(value).toBe(-12);
	});

	it('parses positive number when input starts with "+" then digits', () => {
		// Arrange
		const bytes: number[] = [0x2b, 0x33, 0x34, 0x0a]; // "+34\n"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const value = lexer.getNumber();

		// Assert
		expect(value).toBe(34);
	});

	it('returns 0 when input is "." followed by whitespace (decimal point with no digits)', () => {
		// Arrange
		const bytes: number[] = [0x2e, 0x20]; // ". "
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const value = lexer.getNumber();

		// Assert
		expect(value).toBe(0);
	});

	it('throws a FormatError when an invalid character follows a sign', () => {
		// Arrange
		const bytes: number[] = [0x2d, 0x41]; // "-A"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act & Assert
		try {
			lexer.getNumber()
		} catch (e) {
			expect(e instanceof FormatError).toBeTruthy();
			expect(e.message).toMatch(/Invalid number/);

		}
	});

	it('parses decimal numbers with fractional part (12.34)', () => {
		// Arrange
		const bytes: number[] = [0x31, 0x32, 0x2e, 0x33, 0x34, 0x20]; // "12.34 "
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const value = lexer.getNumber();

		// Assert
		expect(value).toBeCloseTo(12.34, 12);
	});

	it('skips internal minus and parses combined digits ("12-34" -> 1234)', () => {
		// Arrange
		const bytes: number[] = [0x31, 0x32, 0x2d, 0x33, 0x34, 0x20]; // "12-34 "
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const value = lexer.getNumber();

		// Assert
		expect(value).toBe(1234);
	});

	it('applies positive exponent ("1.2E+3" -> 1200)', () => {
		// Arrange
		const bytes: number[] = [0x31, 0x2e, 0x32, 0x45, 0x2b, 0x33, 0x20]; // "1.2E+3 "
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const value = lexer.getNumber();

		// Assert
		expect(value).toBeCloseTo(1200);
	});

	it('applies negative exponent ("1E-2" -> 0.01)', () => {
		// Arrange
		const bytes: number[] = [0x31, 0x45, 0x2d, 0x32, 0x20]; // "1E-2 "
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const value = lexer.getNumber();

		// Assert
		expect(value).toBeCloseTo(0.01, 12);
	});

});

describe('PdfLexicalOperator.getString - branches', () => {
	it('getString - returns empty when EOF immediately after opening paren', () => {
		// Arrange
		const bytes: number[] = [0x28]; // "("
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const result = lexer.getString();

		// Assert
		expect(result).toBe('');
	});

	it('getString - parses simple balanced parentheses content', () => {
		// Arrange
		const bytes: number[] = [0x28, 0x61, 0x62, 0x63, 0x29]; // "(abc)"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const result = lexer.getString();

		// Assert
		expect(result).toBe('abc');
	});

	it('getString - handles standard escape sequences (\n, \t, \r, \b, \f)', () => {
		// Arrange
		const bytes: number[] = [0x28, 0x61, 0x5c, 0x6e, 0x5c, 0x74, 0x5c, 0x72, 0x5c, 0x62, 0x5c, 0x66, 0x62, 0x29]; // "(a\n\t\r\b\fb)"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const result = lexer.getString();

		// Assert
		expect(result).toBe('a\n\t\r\b\fb');
	});

	it('getString - parses octal escape (101 -> A)', () => {
		// Arrange
		const bytes: number[] = [0x28, 0x5c, 0x31, 0x30, 0x31, 0x29]; // "(\101)"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const result = lexer.getString();

		// Assert
		expect(result).toBe('A');
	});

	it('getString - line continuation with CRLF after backslash is removed', () => {
		// Arrange
		const bytes: number[] = [0x28, 0x5c, 0x0d, 0x0a, 0x61, 0x29]; // "(\<CR><LF>a)"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const result = lexer.getString();

		// Assert
		expect(result).toBe('a');
	});

	it('getString - escaped parentheses and backslash are preserved', () => {
		// Arrange
		const bytes: number[] = [0x28, 0x5c, 0x28, 0x5c, 0x29, 0x5c, 0x5c, 0x29]; // "(\(\)\\)"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const result = lexer.getString();

		// Assert
		expect(result).toBe('()\\');
	});

	it('getString - octal with two digits leaves following char for next iteration ("\\12X" -> \nX)', () => {
		// Arrange
		const bytes: number[] = [0x28, 0x5c, 0x31, 0x32, 0x58, 0x29]; // "(\12X)"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const result = lexer.getString();

		// Assert: octal 12 => decimal 10 (newline) followed by 'X'
		expect(result).toBe(String.fromCharCode(10) + 'X');
	});

});
describe('PdfLexicalOperator.getName - targeted branches', () => {

	it('handles "#" followed by special char: pushes # and breaks', () => {
		// Arrange
		const bytes: number[] = [0x2f, 0x23, 0x00]; // "/#\0"
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const name = lexer.getName();

		// Assert
		expect(name.name).toBe('#');
	});

	it('handles "#" followed by non-hex -> pushes "#<char>"', () => {
		// Arrange
		const bytes: number[] = [0x2f, 0x23, 0x47, 0x20]; // "/#G "
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const name = lexer.getName();

		// Assert
		expect(name.name).toBe('#G');
	});

	it('handles "#<hex>" then non-hex second nibble branch (pushes "#<first><second>")', () => {
		// Arrange
		const bytes: number[] = [0x2f, 0x23, 0x33, 0x47, 0x20]; // "/#3G "
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const name = lexer.getName();

		// Assert
		expect(name.name).toBe('#3G');
	});

	it('decodes two hex digits after # into a single byte', () => {
		// Arrange
		const bytes: number[] = [0x2f, 0x23, 0x34, 0x31, 0x20]; // "/#41 " => 0x41 == 'A'
		const stream = new MockStream(bytes);
		const lexer = new _PdfLexicalOperator(stream);

		// Act
		const name = lexer.getName();

		// Assert
		expect(name.name).toBe('A');
	});

});
describe('BC Parser small utilities', () => {
    it('_toHexDigit should convert hex chars correctly', () => {
        const stream = new _PdfStream(new Uint8Array(0));
        const lexer = new _PdfLexicalOperator(stream as any);
        expect(lexer._toHexDigit('0'.charCodeAt(0))).toEqual(0);
        expect(lexer._toHexDigit('9'.charCodeAt(0))).toEqual(9);
        expect(lexer._toHexDigit('A'.charCodeAt(0))).toEqual(10);
        expect(lexer._toHexDigit('F'.charCodeAt(0))).toEqual(15);
        expect(lexer._toHexDigit('a'.charCodeAt(0))).toEqual(10);
        expect(lexer._toHexDigit('f'.charCodeAt(0))).toEqual(15);
        expect(lexer._toHexDigit('G'.charCodeAt(0))).toEqual(-1);
        expect(lexer._toHexDigit(0x20)).toEqual(-1);
    });

    it('_computeMaxNumber should compute Adler-like checksum', () => {
        const stream = new _PdfStream(new Uint8Array(0));
        const parser = new _PdfParser(new _PdfLexicalOperator(stream as any), null as any);
        const bytes = new Uint8Array([1, 2, 3]);
        const result = parser._computeMaxNumber(bytes);
        // manual calculation: a starts at 1 -> after bytes a=7, b accumulates 2+4+7=13
        const expected = (13 % 65521 << 16) | (7 % 65521);
        expect(result).toEqual(expected);
    });

    it('_checkEnd should detect EOF sentinel', () => {
        const stream = new _PdfStream(new Uint8Array(0));
        const parser = new _PdfParser(new _PdfLexicalOperator(stream as any), null as any);
        // constructor on empty stream sets first/second to EOF sentinel
        expect(parser._checkEnd()).toBeTruthy();
        parser.first = 123 as any;
        expect(parser._checkEnd()).toBeFalsy();
    });

    it('nextChar and peekChar should read and peek bytes correctly', () => {
        const bytes = new Uint8Array([0x41, 0x42]);
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);
        // constructor calls nextChar() once
        expect(lexer.currentChar).toEqual(0x41);
        // peek should show the next byte without advancing
        const peeked = lexer.peekChar();
        expect(peeked).toEqual(0x42);
        // nextChar advances and returns the same value
        const advanced = lexer.nextChar();
        expect(advanced).toEqual(0x42);
        expect(lexer.currentChar).toEqual(0x42);
        // further nextChar at EOF returns -1
        const eof = lexer.nextChar();
        expect(eof).toEqual(-1);
        expect(lexer.currentChar).toEqual(-1);
    });

    it('peekChar returns -1 at EOF and does not advance', () => {
        const bytes = new Uint8Array([0x11]);
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);
        // constructor consumed the only byte
        expect(lexer.currentChar).toEqual(0x11);
        // peek now should indicate EOF (-1) because no further bytes
        const peeked = lexer.peekChar();
        expect(peeked).toEqual(-1);
        // nextChar should also return -1 and set currentChar
        const advanced = lexer.nextChar();
        expect(advanced).toEqual(-1);
        expect(lexer.currentChar).toEqual(-1);
    });

    it('getNumber returns 0 for lone decimal point followed by whitespace', () => {
        const bytes = new Uint8Array([0x2e, 0x20]); // '.' ' '
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        // currentChar set to '.' by constructor
        expect(lexer.currentChar).toEqual(0x2e);

        const num = lexer.getNumber();
        expect(num).toEqual(0);
    });

    it('getNumber returns 0 for lone minus sign followed by whitespace', () => {
        const bytes = new Uint8Array([0x2d, 0x20]); // '-' ' '
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        // currentChar set to '-' by constructor
        expect(lexer.currentChar).toEqual(0x2d);

        const num = lexer.getNumber();
        expect(num).toEqual(0);
    });

    it('getNumber handles double minus before digit (--3 => -3)', () => {
        const bytes = new Uint8Array([0x2d, 0x2d, 0x33]); // '-' '-' '3'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        // constructor consumed the first '-' and should expose it as currentChar
        expect(lexer.currentChar).toEqual(0x2d);

        const num = lexer.getNumber();
        expect(num).toEqual(-3);
    });

    it('getNumber handles double minus followed by whitespace (-- ) => 0', () => {
        const bytes = new Uint8Array([0x2d, 0x2d, 0x20]); // '-' '-' ' '
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2d);

        const num = lexer.getNumber();
        expect(num).toEqual(0);
    });

    it('getNumber handles leading plus before digit (+3 => 3)', () => {
        const bytes = new Uint8Array([0x2b, 0x33]); // '+' '3'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2b);

        const num = lexer.getNumber();
        expect(num).toEqual(3);
    });

    it('getNumber skips newlines after plus (+\n3 => 3)', () => {
        const bytes = new Uint8Array([0x2b, 0x0a, 0x33]); // '+' '\n' '3'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2b);

        const num = lexer.getNumber();
        expect(num).toEqual(3);
    });

    it('getNumber throws for plus followed by whitespace (+ )', () => {
        const bytes = new Uint8Array([0x2b, 0x20]); // '+' ' '
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2b);

        expect(() => lexer.getNumber()).toThrow();
    });

    it('getNumber handles leading minus with newline (-\n3 => -3)', () => {
        const bytes = new Uint8Array([0x2d, 0x0a, 0x33]); // '-' '\n' '3'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2d);

        const num = lexer.getNumber();
        expect(num).toEqual(-3);
    });

    it('getNumber handles CR+LF after plus (+\r\n4 => 4)', () => {
        const bytes = new Uint8Array([0x2b, 0x0d, 0x0a, 0x34]); // '+' '\r' '\n' '4'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2b);

        const num = lexer.getNumber();
        expect(num).toEqual(4);
    });

    it('getNumber skips multiple CRs before digit (-\r\r3 => -3)', () => {
        const bytes = new Uint8Array([0x2d, 0x0d, 0x0d, 0x33]); // '-' '\r' '\r' '3'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2d);

        const num = lexer.getNumber();
        expect(num).toEqual(-3);
    });

    it('getNumber throws FormatError when decimal point followed by non-digit non-whitespace', () => {
        const bytes = new Uint8Array([0x2e, 0x41]); // '.' 'A'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2e);

        expect(() => lexer.getNumber()).toThrow();
    });

    it('getNumber stops at second decimal point and returns parsed float (1.2.3 => 1.2)', () => {
        const bytes = new Uint8Array([0x31, 0x2e, 0x32, 0x2e, 0x33]); // '1' '.' '2' '.' '3'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x31);

        const num = lexer.getNumber();
        expect(num).toEqual(1.2);
    });

    it('getNumber breaks on second decimal when starting with dot (.1.2 => 0.1)', () => {
        const bytes = new Uint8Array([0x2e, 0x31, 0x2e, 0x32]); // '.' '1' '.' '2'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x2e);

        const num = lexer.getNumber();
        expect(num).toEqual(0.1);
    });
    
    it('getNumber handles standard decimal with two fractional digits (1.23 => 1.23)', () => {
        const bytes = new Uint8Array([0x31, 0x2e, 0x32, 0x33]); // '1' '.' '2' '3'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x31);

        const num = lexer.getNumber();
        expect(num).toEqual(1.23);
    });

    it('getNumber treats hyphen inside integer as ignored (1-2 => 12)', () => {
        const bytes = new Uint8Array([0x31, 0x2d, 0x32]); // '1' '-' '2'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x31);

        const num = lexer.getNumber();
        expect(num).toEqual(12);
    });

    it('getNumber ignores hyphen inside fractional part (1.2-3 => 1.23)', () => {
        const bytes = new Uint8Array([0x31, 0x2e, 0x32, 0x2d, 0x33]); // '1' '.' '2' '-' '3'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x31);

        const num = lexer.getNumber();
        expect(num).toEqual(1.23);
    });

    it('getNumber handles scientific notation without sign (1e2 => 100)', () => {
        const bytes = new Uint8Array([0x31, 0x65, 0x32]); // '1' 'e' '2'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x31);

        const num = lexer.getNumber();
        expect(num).toEqual(100);
    });

    it('getNumber handles scientific notation with plus sign (1e+2 => 100)', () => {
        const bytes = new Uint8Array([0x31, 0x65, 0x2b, 0x32]); // '1' 'e' '+' '2'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x31);

        const num = lexer.getNumber();
        expect(num).toEqual(100);
    });

    it('getNumber handles scientific notation with minus sign (1e-2 => 0.01)', () => {
        const bytes = new Uint8Array([0x31, 0x65, 0x2d, 0x32]); // '1' 'e' '-' '2'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x31);

        const num = lexer.getNumber();
        expect(num).toEqual(0.01);
    });

    it('getNumber stops when exponent is followed by non-digit (1eX => 1)', () => {
        const bytes = new Uint8Array([0x31, 0x65, 0x58]); // '1' 'e' 'X'
        const stream = new _PdfStream(bytes);
        const lexer = new _PdfLexicalOperator(stream as any);

        expect(lexer.currentChar).toEqual(0x31);

        const num = lexer.getNumber();
        expect(num).toEqual(1);
    });
});
