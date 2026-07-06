
import { PdfPage, PdfRotationAngle, Rectangle } from '@syncfusion/ej2-pdf';
import { _PdfTextParser } from '../../src/pdf-data-extract/core/pdf-text-parser';
import * as utils from '../../src/pdf-data-extract/core/utils';
import { TextGlyph } from '../../src/pdf-data-extract/core/text-structure';

describe('_PdfTextParser reachable highlighted branches', () => {
    function createPage(rotation: PdfRotationAngle): PdfPage {
        return {
            rotation: rotation,
            size: { width: 200, height: 100 },
            cropBox: [0, 0, 0, 0],
            mediaBox: [0, 200, 100, 0]
        } as unknown as PdfPage;
    }

    it('should mark text as found in _isFoundText using the page-height yPosition branch', () => {
        // Arrange
        const parser: _PdfTextParser = new _PdfTextParser();
        const page: PdfPage = createPage(PdfRotationAngle.angle0);
        const redactionBounds: { _bounds: Rectangle }[] = [
            { _bounds: { x: 0, y: 72, width: 10, height: 5 } }
        ];

        const getRelativeLocationSpy: jasmine.Spy = spyOn(parser, '_getRelativeLocation').and.returnValue([25, 10]);

        // Act
        const result: boolean = parser._isFoundText(
            25,
            30,
            page,
            redactionBounds as unknown as never
        );

        // Assert
        expect(getRelativeLocationSpy).toHaveBeenCalledWith(25, 30, page);
        expect(result).toBeTruthy();
    });

    it('should split a literal text token, apply escaped replacements and use default isForRedaction=false', () => {
        // Arrange
        const parser: _PdfTextParser = new _PdfTextParser();
        const font: { _encoding: string } = { _encoding: 'WinAnsiEncoding' };

        const literalSpy: jasmine.Spy = spyOn(utils, '_getLiteralString').and.callFake((value: string): string => {
            return value;
        });
        const skipEscapeSpy: jasmine.Spy = spyOn(utils, '_skipEscapeSequence').and.callFake((value: string): string => {
            return value;
        });

        const encodedText: string = '(A\\\nB\\(C\\)\\n\\r)';
        const inputText: string[] = [];

        // Act
        const result: { decodedList: string[] } = parser._getSplitText(
            encodedText,
            font as never,
            inputText
        ) as { decodedList: string[] };

        // Assert
        expect(literalSpy).toHaveBeenCalledWith('AB(C)\n\r', 'WinAnsiEncoding');
        expect(skipEscapeSpy).toHaveBeenCalledWith('AB(C)\n\r');
        expect(result.decodedList.length).toBe(1);
        expect(result.decodedList[0]).toBe('AB(C)\n\rs');
    });

    it('should split an array token for redaction and cover hex, literal-with-backslash, width and inputType branches', () => {
        // Arrange
        const parser: _PdfTextParser = new _PdfTextParser();
        const font: { _encoding: string } = { _encoding: 'WinAnsiEncoding' };

        const hexToCharSpy: jasmine.Spy = spyOn(utils, '_hexToChar').and.callFake((value: string): string => {
            if (value === '4142') {
                return 'AB';
            }
            return value;
        });

        const literalSpy: jasmine.Spy = spyOn(utils, '_getLiteralString').and.callFake((value: string): string => {
            if (value === 'A\\B') {
                return 'A\\B';
            }
            return value;
        });

        const skipEscapeSpy: jasmine.Spy = spyOn(utils, '_skipEscapeSequence').and.callFake((value: string): string => {
            return value.replace('\\', '');
        });

        const inputText: string[] = ['<4142>', '(A\\B)', '120', '(C\\\nD)'];

        // Act
        const result: { decodedList: string[]; inputType: string[] } = parser._getSplitText(
            '[<4142>(A\\B)120(C\\\nD)]',
            font as never,
            inputText,
            true
        ) as { decodedList: string[]; inputType: string[] };

        // Assert
        expect(hexToCharSpy).toHaveBeenCalledWith('4142');
        expect(literalSpy.calls.count()).toBe(2);
        expect(literalSpy.calls.argsFor(0)[0]).toBe('A\\B');
        expect(literalSpy.calls.argsFor(1)[0]).toBe('CD');
        expect(skipEscapeSpy).toHaveBeenCalledWith('A\\B');
        expect(result.decodedList).toEqual(['ABs', 'ABs', '120', 'CDs']);
        expect(result.inputType).toEqual(['<4142>', ' ', ' ', ' ']);
    });

    it('should create a rotated hex glyph and encode the corresponding hex value in _getTextContentItem', () => {
        // Arrange
        const parser: _PdfTextParser = new _PdfTextParser();
        const page: PdfPage = createPage(PdfRotationAngle.angle90);

        const currentFont: {
            _charsToGlyphs: (text: string) => { _unicode: string; _width: number; _fontCharacter: string; vmetric?: number[] }[];
            _fontMatrix: number[];
            _vertical: boolean;
            _dictionary: { has: (key: string) => boolean };
            _name: string;
            _fontStyle: number;
        } = {
            _charsToGlyphs: function (): { _unicode: string; _width: number; _fontCharacter: string; vmetric?: number[] }[] {
                return [{ _unicode: 'A', _width: 500, _fontCharacter: '41' }];
            },
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _vertical: false,
            _dictionary: {
                has: function (): boolean {
                    return false;
                }
            },
            _name: 'TestFont',
            _fontStyle: 0
        };

        const textState: {
            _fontSize: number;
            _textHScale: number;
            _textRise: number;
            _charSpacing: number;
            _wordSpacing: number;
            _ctm: number[];
            _textMatrix: number[];
            _textColor: { r: number; g: number; b: number };
            _translateTextMatrix: jasmine.Spy;
        } = {
            _fontSize: 10,
            _textHScale: 1,
            _textRise: 0,
            _charSpacing: 0,
            _wordSpacing: 0,
            _ctm: [1, 0, 0, 1, 0, 0],
            _textMatrix: [1, 0, 0, 1, 0, 0],
            _textColor: { r: 0, g: 0, b: 0 },
            _translateTextMatrix: jasmine.createSpy('_translateTextMatrix')
        };

        const textGlyphs: TextGlyph[] = [];
        const encodedText: string[] = [];
        const hex: string[] = ['0041'];

        spyOn(parser, '_getPageRotation').and.returnValue(0);
        spyOn(parser, '_getCurrentTransform').and.returnValue([2, 0, 0, 2, 20, 30]);
        spyOn(parser, '_getCropOrMediaBox').and.returnValue([0, 0, 100]);

        // Act
        const result: {
            textGlyphs: TextGlyph[];
            extractedText: string;
            encodedText: string[];
            index: number;
        } = parser._getTextContentItem(
            currentFont as never,
            'As',
            0,
            textState as never,
            page,
            '',
            { x: 0, y: 0, width: 0, height: 0 },
            '',
            undefined,
            textGlyphs,
            hex,
            0,
            encodedText
        ) as {
            textGlyphs: TextGlyph[];
            extractedText: string;
            encodedText: string[];
            index: number;
        };

        // Assert
        expect(result.extractedText).toBe('A');
        expect(result.index).toBe(1);
        expect(result.encodedText.length).toBe(1);
        expect(result.encodedText[0]).toBe('0041');
        expect(result.textGlyphs.length).toBe(1);
        expect(result.textGlyphs[0]._text).toBe('A');
        expect(result.textGlyphs[0]._isHex).toBeTruthy();
        expect(result.textGlyphs[0]._fontName).toBe('TestFont');
        expect(result.textGlyphs[0]._fontStyle).toBe(0);
        expect(result.textGlyphs[0]._fontSize).toBe(10);
        expect(result.textGlyphs[0]._color).toEqual({ r: 0, g: 0, b: 0 });
        expect(result.textGlyphs[0]._width).toBe(500);
        expect(result.textGlyphs[0]._charSpacing).toBe(0);
        expect(result.textGlyphs[0]._wordSpacing).toBe(0);
        expect(result.textGlyphs[0]._isRotated).toBeTruthy();
    });

    it('should reset previousRect to zeros when parser._splitWords returns null previousRect in _getTextContentItem', () => {
        // Arrange
        const parser: _PdfTextParser = new _PdfTextParser();
        const page: PdfPage = createPage(PdfRotationAngle.angle0);

        const currentFont: {
            _charsToGlyphs: (text: string) => { _unicode: string; _width: number; _fontCharacter: string; vmetric?: number[] }[];
            _fontMatrix: number[];
            _vertical: boolean;
            _dictionary: { has: (key: string) => boolean };
            _name: string;
            _fontStyle: number;
        } = {
            _charsToGlyphs: function (): { _unicode: string; _width: number; _fontCharacter: string; vmetric?: number[] }[] {
                return [{ _unicode: 'B', _width: 400, _fontCharacter: '42' }];
            },
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _vertical: false,
            _dictionary: {
                has: function (): boolean {
                    return false;
                }
            },
            _name: 'FallbackFont',
            _fontStyle: 1
        };

        const textState: {
            _fontSize: number;
            _textHScale: number;
            _textRise: number;
            _charSpacing: number;
            _wordSpacing: number;
            _ctm: number[];
            _textMatrix: number[];
            _textColor: { r: number; g: number; b: number };
            _translateTextMatrix: jasmine.Spy;
        } = {
            _fontSize: 12,
            _textHScale: 1,
            _textRise: 0,
            _charSpacing: 0,
            _wordSpacing: 0,
            _ctm: [1, 0, 0, 1, 0, 0],
            _textMatrix: [1, 0, 0, 1, 0, 0],
            _textColor: { r: 1, g: 2, b: 3 },
            _translateTextMatrix: jasmine.createSpy('_translateTextMatrix')
        };

        const helperParser: {
            _splitWords: jasmine.Spy;
        } = {
            _splitWords: jasmine.createSpy('_splitWords').and.returnValue({
                previousRect: null,
                tempString: 'B'
            })
        };

        spyOn(parser, '_getPageRotation').and.returnValue(0);
        spyOn(parser, '_getCurrentTransform').and.returnValue([2, 0, 0, 2, 20, 30]);
        spyOn(parser, '_getCropOrMediaBox').and.returnValue([0, 0, 100]);

        // Act
        const result: {
            tempString: string;
            extractedText: string;
            fontSize: number;
            previousRect: Rectangle;
        } = parser._getTextContentItem(
            currentFont as never,
            'Bs',
            0,
            textState as never,
            page,
            '',
            { x: 9, y: 9, width: 9, height: 9 },
            '',
            helperParser as never
        ) as {
            tempString: string;
            extractedText: string;
            fontSize: number;
            previousRect: Rectangle;
        };

        // Assert
        expect(helperParser._splitWords).toHaveBeenCalled();
        expect(result.tempString).toBe('B');
        expect(result.extractedText).toBe('B');
        expect(result.fontSize).toBe(12);
        expect(result.previousRect).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });
});
