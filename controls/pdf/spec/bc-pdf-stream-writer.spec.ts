import { _PdfStreamWriter } from './../src/pdf/core/graphics/pdf-stream-writer';
import { _PdfName } from '../src/pdf/core/pdf-primitives';
import { _PdfColorSpace } from './../src/pdf/core/enumerator';

describe('PdfStreamWriter behavior coverage tests', () => {

    it('setColorSpace with string colorspace and forStroking true should write CS operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const colorspaceName: string = 'DeviceRGB';
        const forStroking: boolean = true;

        // Act
        writer._setColorSpace(colorspaceName, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceRGB ');
        expect(mockStream.write).toHaveBeenCalledWith('CS');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColorSpace with string colorspace and forStroking false should write cs operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const colorspaceName: string = 'DeviceCMYK';
        const forStroking: boolean = false;

        // Act
        writer._setColorSpace(colorspaceName, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceCMYK ');
        expect(mockStream.write).toHaveBeenCalledWith('cs');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColorSpace with rgb colorspace and forStroking true should write DeviceRGB and CS', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [255, 128, 64];
        const colorSpace: _PdfColorSpace = _PdfColorSpace.rgb;
        const forStroking: boolean = true;

        // Act
        writer._setColorSpace(color, colorSpace, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceRGB ');
        expect(mockStream.write).toHaveBeenCalledWith('CS');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
        expect(mockStream.write).toHaveBeenCalledWith('1.000 0.502 0.251 ');
        expect(mockStream.write).toHaveBeenCalledWith('RG');
    });

    it('setColorSpace with rgb colorspace and forStroking false should write DeviceRGB and cs', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [200, 100, 50];
        const colorSpace: _PdfColorSpace = _PdfColorSpace.rgb;
        const forStroking: boolean = false;

        // Act
        writer._setColorSpace(color, colorSpace, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceRGB ');
        expect(mockStream.write).toHaveBeenCalledWith('cs');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
        expect(mockStream.write).toHaveBeenCalledWith('0.784 0.392 0.196 ');
        expect(mockStream.write).toHaveBeenCalledWith('rg');
    });

    it('setColorSpace with cmyk colorspace and forStroking true should write DeviceCMYK and CS', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [100, 200, 50, 10];
        const colorSpace: _PdfColorSpace = _PdfColorSpace.cmyk;
        const forStroking: boolean = true;

        // Act
        writer._setColorSpace(color, colorSpace, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceCMYK ');
        expect(mockStream.write).toHaveBeenCalledWith('CS');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColorSpace with cmyk colorspace and forStroking false should write DeviceCMYK and cs', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [50, 100, 200, 5];
        const colorSpace: _PdfColorSpace = _PdfColorSpace.cmyk;
        const forStroking: boolean = false;

        // Act
        writer._setColorSpace(color, colorSpace, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceCMYK ');
        expect(mockStream.write).toHaveBeenCalledWith('cs');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColorSpace with grayScale colorspace and forStroking true should write DeviceGray and CS', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [128, 0, 0];
        const colorSpace: _PdfColorSpace = _PdfColorSpace.grayScale;
        const forStroking: boolean = true;

        // Act
        writer._setColorSpace(color, colorSpace, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceGray ');
        expect(mockStream.write).toHaveBeenCalledWith('CS');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColorSpace with grayScale colorspace and forStroking false should write DeviceGray and cs', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [64, 0, 0];
        const colorSpace: _PdfColorSpace = _PdfColorSpace.grayScale;
        const forStroking: boolean = false;

        // Act
        writer._setColorSpace(color, colorSpace, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceGray ');
        expect(mockStream.write).toHaveBeenCalledWith('cs');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColorSpace with default case (invalid colorspace) and forStroking true should write DeviceRGB and CS', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [180, 90, 45];
        const invalidColorSpace: number = 99; // Invalid enum value
        const forStroking: boolean = true;

        // Act
        writer._setColorSpace(color, invalidColorSpace as _PdfColorSpace, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceRGB ');
        expect(mockStream.write).toHaveBeenCalledWith('CS');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColorSpace with default case (invalid colorspace) and forStroking false should write DeviceRGB and cs', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [75, 150, 225];
        const invalidColorSpace: number = 98; // Invalid enum value
        const forStroking: boolean = false;

        // Act
        writer._setColorSpace(color, invalidColorSpace as _PdfColorSpace, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('/DeviceRGB ');
        expect(mockStream.write).toHaveBeenCalledWith('cs');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColor with forStroking true should write RG operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [255, 0, 0];
        const forStroking: boolean = true;

        // Act
        writer._setColor(color, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('1.000 0.000 0.000 ');
        expect(mockStream.write).toHaveBeenCalledWith('RG');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('setColor with forStroking false should write rg operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const color: number[] = [0, 255, 0];
        const forStroking: boolean = false;

        // Act
        writer._setColor(color, forStroking);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('0.000 1.000 0.000 ');
        expect(mockStream.write).toHaveBeenCalledWith('rg');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('clipPath with isEvenOdd true should write W* operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const isEvenOdd: boolean = true;

        // Act
        writer._clipPath(isEvenOdd);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('W* n\r\n');
    });

    it('clipPath with isEvenOdd false should write W operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const isEvenOdd: boolean = false;

        // Act
        writer._clipPath(isEvenOdd);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('W n\r\n');
    });

    it('fillPath with isEvenOdd true should write f* operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const isEvenOdd: boolean = true;

        // Act
        writer._fillPath(isEvenOdd);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('f*');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('fillPath with isEvenOdd false should write f operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const isEvenOdd: boolean = false;

        // Act
        writer._fillPath(isEvenOdd);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('f');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('fillStrokePath with isEvenOdd true should write B* operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const isEvenOdd: boolean = true;

        // Act
        writer._fillStrokePath(isEvenOdd);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('B*');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('fillStrokePath with isEvenOdd false should write B operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const isEvenOdd: boolean = false;

        // Act
        writer._fillStrokePath(isEvenOdd);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('B');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('closeFillStrokePath with isEvenOdd true should write b* operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const isEvenOdd: boolean = true;

        // Act
        writer._closeFillStrokePath(isEvenOdd);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('b*');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('closeFillStrokePath with isEvenOdd false should write b operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const isEvenOdd: boolean = false;

        // Act
        writer._closeFillStrokePath(isEvenOdd);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('b');
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('escapeSymbols with opening parenthesis should escape with backslash', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = '(';

        // Act
        const result: number[] = writer._escapeSymbols(text);

        // Assert
        expect(result.length).toBe(2);
        expect(result[0]).toBe(92); // backslash
        expect(result[1]).toBe(40); // (
    });

    it('escapeSymbols with closing parenthesis should escape with backslash', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = ')';

        // Act
        const result: number[] = writer._escapeSymbols(text);

        // Assert
        expect(result.length).toBe(2);
        expect(result[0]).toBe(92); // backslash
        expect(result[1]).toBe(41); // )
    });

    it('escapeSymbols with carriage return should escape as \\r', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = String.fromCharCode(13); // carriage return

        // Act
        const result: number[] = writer._escapeSymbols(text);

        // Assert
        expect(result.length).toBe(2);
        expect(result[0]).toBe(92); // backslash
        expect(result[1]).toBe(114); // r
    });

    it('escapeSymbols with backslash should escape with backslash', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = '\\';

        // Act
        const result: number[] = writer._escapeSymbols(text);

        // Assert
        expect(result.length).toBe(2);
        expect(result[0]).toBe(92); // backslash
        expect(result[1]).toBe(92); // backslash
    });

    it('escapeSymbols with regular text should return unescaped', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = 'Hello';

        // Act
        const result: number[] = writer._escapeSymbols(text);

        // Assert
        expect(result.length).toBe(5);
        expect(result[0]).toBe(72); // H
        expect(result[1]).toBe(101); // e
        expect(result[2]).toBe(108); // l
        expect(result[3]).toBe(108); // l
        expect(result[4]).toBe(111); // o
    });

    it('escapeSymbols with mixed content should escape special chars only', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = 'Hi(Test)';

        // Act
        const result: number[] = writer._escapeSymbols(text);

        // Assert
        expect(result.length).toBe(10);
        expect(result[0]).toBe(72); // H
        expect(result[1]).toBe(105); // i
        expect(result[2]).toBe(92); // backslash
        expect(result[3]).toBe(40); // (
        expect(result[4]).toBe(84); // T
        expect(result[5]).toBe(101); // e
        expect(result[6]).toBe(115); // s
        expect(result[7]).toBe(116); // t
        expect(result[8]).toBe(92); // backslash
        expect(result[9]).toBe(41); // )
    });

    it('showNextLineText with unicode true should call writeText and write operator', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = 'Hello';
        const unicode: boolean = true;

        // Act
        writer._showNextLineText(text, unicode);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith("(Hello)");
        expect(mockStream.write).toHaveBeenCalledWith("'");
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('showNextLineText with unicode false should write text directly', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = 'World';
        const unicode: boolean = false;

        // Act
        writer._showNextLineText(text, unicode);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('World');
        expect(mockStream.write).toHaveBeenCalledWith("'");
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('showNextLineText without unicode param should write text directly', () => {
        // Arrange
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        const text: string = 'NoUnicode';

        // Act
        writer._showNextLineText(text);

        // Assert
        expect(mockStream.write).toHaveBeenCalledWith('NoUnicode');
        expect(mockStream.write).toHaveBeenCalledWith("'");
        expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    });

    it('should not write operator when comment is empty', () => {
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        spyOn(writer as any, '_writeOperator');

        writer._writeComment('');

        expect((writer as any)._writeOperator).not.toHaveBeenCalled();
    });

    it('should not write operator when comment is undefined', () => {
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);
        spyOn(writer as any, '_writeOperator');

        writer._writeComment(undefined as any);

        expect((writer as any)._writeOperator).not.toHaveBeenCalled();
    });
    ``

    it('should set color space using number[] value (else-if branch)', () => {
        const mockStream: any = {
            write: jasmine.createSpy('write'),
            _bytes: []
        };
        const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);

        writer._stream = {
            write: jasmine.createSpy('write')
        } as any;

        spyOn(writer as any, '_writeOperator');
        spyOn(writer as any, '_setColor');

        writer._setColorSpace(
            [1, 0, 0],                  // value: number[]
            _PdfColorSpace.rgb,         // arg2: number
            true                        // arg3: boolean
        );

        expect(writer._stream.write).toHaveBeenCalledWith('/DeviceRGB ');
        expect((writer as any)._writeOperator).toHaveBeenCalledWith('CS');
        expect((writer as any)._setColor).toHaveBeenCalledWith([1, 0, 0], true);
    });
    
it('should enter else-if branch (E) when value is number[] and arg2 is number and arg3 is boolean', () => {
    // Arrange
    const mockStream: any = {
        write: jasmine.createSpy('write'),
        _bytes: []
    };

    const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);

    const colorValues: number[] = [10, 20, 30];
    const colorSpace: number = _PdfColorSpace.rgb; // number
    const forStroking: boolean = true;              // boolean

    // Act
    writer._setColorSpace(colorValues, colorSpace, forStroking);

    // Assert – proves else-if path executed
    expect(mockStream.write).toHaveBeenCalledWith('/DeviceRGB ');
    expect(mockStream.write).toHaveBeenCalledWith('CS');
    expect(mockStream.write).toHaveBeenCalledWith('\r\n');

    // proves _setColor was reached from else-if
    expect(mockStream.write).toHaveBeenCalledWith('0.039 0.078 0.118 ');
    expect(mockStream.write).toHaveBeenCalledWith('RG');
});

it('else-if branch: value is number[] and arg2 is number and arg3 is boolean (CMYK path)', () => {
    const mockStream: any = { write: jasmine.createSpy('write'), _bytes: [] };
    const writer: _PdfStreamWriter = new _PdfStreamWriter(mockStream);

    const value: number[] = [10, 20, 30, 40]; // array -> Array.isArray true
    const arg2: number = _PdfColorSpace.cmyk as unknown as number; // typeof arg2 === 'number'
    const arg3: boolean = true; // typeof arg3 === 'boolean'

    // Act
    writer._setColorSpace(value, arg2 as any, arg3);

    // Assert: switch chosen and _setColor called via stream writes
    expect(mockStream.write).toHaveBeenCalledWith('/DeviceCMYK ');
    expect(mockStream.write).toHaveBeenCalledWith('CS');
    expect(mockStream.write).toHaveBeenCalledWith('\r\n');
    // _setColor writes normalized first three components
    expect(mockStream.write).toHaveBeenCalledWith('0.039 0.078 0.118 ');
    expect(mockStream.write).toHaveBeenCalledWith('RG');
});

});
