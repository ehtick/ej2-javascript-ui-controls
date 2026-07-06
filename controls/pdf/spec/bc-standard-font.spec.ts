import { PdfFont, PdfFontStyle, PdfStandardFont, PdfTrueTypeFont, _PdfStandardFontMetricsFactory, PdfFontFamily, PdfCjkStandardFont, PdfCjkFontFamily, _PdfCjkStandardFontMetricsFactory, _PdfCjkFontDescriptorFactory } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfStringFormat } from '../src/pdf/core/fonts/pdf-string-format';
import { PdfSubSuperScript } from '../src/pdf/core/enumerator';
import { _UnicodeTrueTypeFont } from '../src/pdf/core/fonts/unicode-true-type-font';
import { _RtlRenderer } from '../src/pdf/core/graphics/rightToLeft/text-renderer';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { ttfData } from './inputs.spec';

describe('PdfFont constructor behavior tests', () => {

    it('sets size and leaves style undefined when style is omitted', () => {
        // Arrange
        class TestFontNoStyle extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        // Act
        const font = new TestFontNoStyle(12);
        // Assert
        expect(font.size).toBe(12);
        expect(font.style).toBeUndefined();
    });

    it('Courier metrics assignments for bold, italic and regular styles', () => {
        // Arrange / Act
        const boldFont = new PdfStandardFont(PdfFontFamily.courier, 10, PdfFontStyle.bold);
        const italicFont = new PdfStandardFont(PdfFontFamily.courier, 10, PdfFontStyle.italic);
        const regularFont = new PdfStandardFont(PdfFontFamily.courier, 10, PdfFontStyle.regular);
        // Assert - bold
        expect(boldFont._ascent).toBe(_PdfStandardFontMetricsFactory._courierBoldAscent);
        expect(boldFont._descent).toBe(_PdfStandardFontMetricsFactory._courierBoldDescent);
        expect(boldFont._height).toBe(boldFont._ascent - boldFont._descent);
        // Assert - italic
        expect(italicFont._ascent).toBe(_PdfStandardFontMetricsFactory._courierItalicAscent);
        expect(italicFont._descent).toBe(_PdfStandardFontMetricsFactory._courierItalicDescent);
        expect(italicFont._height).toBe(italicFont._ascent - italicFont._descent);
        // Assert - regular
        expect(regularFont._ascent).toBe(_PdfStandardFontMetricsFactory._courierAscent);
        expect(regularFont._descent).toBe(_PdfStandardFontMetricsFactory._courierDescent);
        expect(regularFont._height).toBe(regularFont._ascent - regularFont._descent);
    });

    it('Times metrics assignment when both bold and italic are set', () => {
        // Arrange / Act
        const timesBi = new PdfStandardFont(PdfFontFamily.timesRoman, 12, (PdfFontStyle.bold | PdfFontStyle.italic));
        // Assert
        expect(timesBi._ascent).toBe(_PdfStandardFontMetricsFactory._timesBoldItalicAscent);
        expect(timesBi._descent).toBe(_PdfStandardFontMetricsFactory._timesBoldItalicDescent);
        expect(timesBi._height).toBe(timesBi._ascent - timesBi._descent);
    });

    it('_getCharacterCount counts overlapping occurrences for string symbol', () => {
        // Arrange
        class TestFontCount extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFontCount(10);
        // Act
        const count = font._getCharacterCount('aaaa', 'aa');
        // Assert: 'aaaa' contains overlapping 'aa' at indices 0,1,2 => 3
        expect(count).toBe(3);
    });

    it('_getCharacterCount returns 0 when string symbol not found', () => {
        // Arrange
        class TestFontCountNone extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFontCountNone(10);
        // Act
        const count = font._getCharacterCount('abcdef', 'zz');
        // Assert
        expect(count).toBe(0);
    });

    it('sets both size and style when style is provided', () => {
        // Arrange
        class TestFontWithStyle extends PdfFont {
            constructor(size: number, style: PdfFontStyle) { super(size, style); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        // Act
        const font = new TestFontWithStyle(14, PdfFontStyle.bold);
        // Assert
        expect(font.size).toBe(14);
        expect(font.style).toBe(PdfFontStyle.bold);
    });


    it('height getter returns computed height when descent is negative', () => {
        // Arrange
        class TestFontHeightNeg extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        const size = 10;
        const font = new TestFontHeightNeg(size);
        font._ascent = 900;
        font._descent = -200;
        font._lineGap = 100;
        // Act
        const h = font.height;
        // Assert
        expect(h).toBeCloseTo(12, 5);
    });

    it('height getter returns computed height when descent is non-negative', () => {
        // Arrange
        class TestFontHeightPos extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        const size = 8;
        const font = new TestFontHeightPos(size);
        font._ascent = 500;
        font._descent = 50; // non-negative
        font._lineGap = 20;
        // Act
        const h = font.height;
        // Assert: (500 + 50 + 20) * 0.001 * 8 = 4.56
        expect(h).toBeCloseTo(4.56, 2);
    });

    it('_setInternals throws when internals is null or undefined', () => {
        // Arrange
        class TestFontSetInternals extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFontSetInternals(11);
        // Act / Assert
        expect(() => font._setInternals(null as any)).toThrowError('ArgumentNullException:internals');
        expect(() => font._setInternals(undefined as any)).toThrowError('ArgumentNullException:internals');
    });

    it('_setInternals stores the provided internals object', () => {
        // Arrange
        class TestFontStoreInternals extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFontStoreInternals(9);
        const internals = { updated: true } as any;
        // Act
        font._setInternals(internals);
        // Assert
        expect(font._pdfFontInternals).toBe(internals);
    });

    it('_getSize returns base size when format is null', () => {
        // Arrange
        class TestGetSizeNull extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestGetSizeNull(12);
        font._metrics = { _subScriptSizeFactor: 2, _superscriptSizeFactor: 4 } as any;
        // Act
        const size = (font as any)._getSize(null);
        // Assert
        expect(size).toBe(12);
    });

    it('_getSize applies subscript and superscript scaling', () => {
        // Arrange
        class TestGetSizeSubSuper extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return 0; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestGetSizeSubSuper(12);
        font._metrics = { _subScriptSizeFactor: 2, _superscriptSizeFactor: 4 } as any;
        const subFormat = new PdfStringFormat();
        subFormat.subSuperScript = PdfSubSuperScript.subScript;
        const superFormat = new PdfStringFormat();
        superFormat.subSuperScript = PdfSubSuperScript.superScript;
        // Act
        const subSize = (font as any)._getSize(subFormat);
        const superSize = (font as any)._getSize(superFormat);
        // Assert
        expect(subSize).toBeCloseTo(6, 5);
        expect(superSize).toBeCloseTo(3, 5);
    });

    it('getLineWidth uses raw char code when metrics name is non-standard', () => {
        // Arrange
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        // Provide a custom metrics object whose name is NOT one of the special families
        font._metrics = { _name: 'CustomFont', _widthTable: { _itemAt: (index: number) => index + 10 } } as any;
        // Act
        const width = font.getLineWidth('A', null);
        // Assert: charCode for 'A' is 65 -> _itemAt returns 75 -> scaled by 0.001 * size (10) => 0.75
        expect(width).toBeCloseTo(0.75, 5);
    });

    it('getLineWidth adjusts char code for standard families (subtracts 32)', () => {
        // Arrange
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        // Simulate metrics for a standard family; _itemAt returns index+1 for predictability
        font._metrics = { _name: 'Helvetica', _widthTable: { _itemAt: (index: number) => index + 1 } } as any;
        // Act
        const width = font.getLineWidth('A', null);
        // Assert: 'A' code 65 -> adjusted to 33 -> _itemAt returns 34 -> scaled by 0.001*10 => 0.34
        expect(width).toBeCloseTo(0.34, 5);
    });

    it('PdfCjkStandardFont constructor calls _initializeInternals when primitive is undefined', () => {
        // Arrange
        let initCalled = false;
        class TestCjkFont extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void {
                initCalled = true;
                super._initializeInternals(primitive);
            }
        }
        // Act
        const font = new TestCjkFont(PdfCjkFontFamily.heiseiMinchoW3, 14);
        // Assert
        expect(initCalled).toBeTruthy();
    });

    it('_getEncoding returns UniKS-UCS2-H for Korea families', () => {
        // Arrange
        class TestCjkEncoding extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop to keep test lightweight */ }
        }
        const font = new TestCjkEncoding(PdfCjkFontFamily.hanyangSystemsGothicMedium, 10);
        // Act
        const nameObj: any = (font as any)._getEncoding(PdfCjkFontFamily.hanyangSystemsGothicMedium);
        // Assert
        expect(nameObj.name).toBe('UniKS-UCS2-H');
    });

    it('_getEncoding returns UniJIS-UCS2-H for Japan families', () => {
        // Arrange
        class TestCjkEncoding2 extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkEncoding2(PdfCjkFontFamily.heiseiMinchoW3, 12);
        // Act
        const nameObj: any = (font as any)._getEncoding(PdfCjkFontFamily.heiseiMinchoW3);
        // Assert
        expect(nameObj.name).toBe('UniJIS-UCS2-H');
    });

    it('_getEncoding returns UniJIS-UCS2-H for heiseiKakuGothicW5', () => {
        // Arrange
        class TestCjkEncoding3 extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkEncoding3(PdfCjkFontFamily.heiseiKakuGothicW5, 12);
        // Act
        const nameObj: any = (font as any)._getEncoding(PdfCjkFontFamily.heiseiKakuGothicW5);
        // Assert
        expect(nameObj.name).toBe('UniJIS-UCS2-H');
    });

    it('_getEncoding returns UniCNS-UCS2-H for monotypeSungLight', () => {
        // Arrange
        class TestCjkEncoding4 extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkEncoding4(PdfCjkFontFamily.monotypeSungLight, 11);
        // Act
        const nameObj: any = (font as any)._getEncoding(PdfCjkFontFamily.monotypeSungLight);
        // Assert
        expect(nameObj.name).toBe('UniCNS-UCS2-H');
    });

    it('_getEncoding returns UniCNS-UCS2-H for monotypeHeiMedium', () => {
        // Arrange
        class TestCjkEncoding6 extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkEncoding6(PdfCjkFontFamily.monotypeHeiMedium, 11);
        // Act
        const nameObj: any = (font as any)._getEncoding(PdfCjkFontFamily.monotypeHeiMedium);
        // Assert
        expect(nameObj.name).toBe('UniCNS-UCS2-H');
    });

    it('_getEncoding returns UniGB-UCS2-H for sinoTypeSongLight', () => {
        // Arrange
        class TestCjkEncoding5 extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkEncoding5(PdfCjkFontFamily.sinoTypeSongLight, 13);
        // Act
        const nameObj: any = (font as any)._getEncoding(PdfCjkFontFamily.sinoTypeSongLight);
        // Assert
        expect(nameObj.name).toBe('UniGB-UCS2-H');
    });

    it('_getSystemInformation returns CNS1/CNS supplement for monotype families', () => {
        // Arrange
        class TestCjkSys extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkSys(PdfCjkFontFamily.monotypeHeiMedium, 11);
        // Act
        const sysInfo: any = (font as any)._getSystemInformation();
        // Assert
        expect(sysInfo.get('Ordering')).toBe('CNS1');
        expect(sysInfo.get('Supplement')).toBe('0');
    });

    it('_getSystemInformation returns GB1/2 supplement for sino type family', () => {
        // Arrange
        class TestCjkSys2 extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkSys2(PdfCjkFontFamily.sinoTypeSongLight, 13);
        // Act
        const sysInfo: any = (font as any)._getSystemInformation();
        // Assert
        expect(sysInfo.get('Ordering')).toBe('GB1');
        expect(sysInfo.get('Supplement')).toBe(2);
    });

    it('_getSystemInformation returns Korea1/1 for hanyangSystemsGothicMedium', () => {
        // Arrange
        class TestCjkSysK extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkSysK(PdfCjkFontFamily.hanyangSystemsGothicMedium, 11);
        // Act
        const sysInfo: any = (font as any)._getSystemInformation();
        // Assert
        expect(sysInfo.get('Ordering')).toBe('Korea1');
        expect(sysInfo.get('Supplement')).toBe(1);
    });

    it('_getSystemInformation returns Japan1/2 for heiseiMinchoW3', () => {
        // Arrange
        class TestCjkSysJ extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkSysJ(PdfCjkFontFamily.heiseiMinchoW3, 12);
        // Act
        const sysInfo: any = (font as any)._getSystemInformation();
        // Assert
        expect(sysInfo.get('Ordering')).toBe('Japan1');
        expect(sysInfo.get('Supplement')).toBe(2);
    });

    it('_getSystemInformation returns Japan1/2 for heiseiKakuGothicW5', () => {
        // Arrange
        class TestCjkSysKaku extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkSysKaku(PdfCjkFontFamily.heiseiKakuGothicW5, 12);
        // Act
        const sysInfo: any = (font as any)._getSystemInformation();
        // Assert
        expect(sysInfo.get('Ordering')).toBe('Japan1');
        expect(sysInfo.get('Supplement')).toBe(2);
    });

    it('_getCharacterWidthInternal returns width for positive charCode', () => {
        // Arrange
        class TestCjkWidthPos extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const font = new TestCjkWidthPos(PdfCjkFontFamily.heiseiMinchoW3, 10);
        font._metrics = { _widthTable: { _itemAt: (index: number) => index + 100 } } as any;
        // Act
        const width = (font as any)._getCharacterWidthInternal(5);
        // Assert
        expect(width).toBe(105);
    });

    it('_getCharacterWidthInternal treats negative charCode as 0', () => {
        // Arrange
        class TestCjkWidthNeg extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const fontNeg = new TestCjkWidthNeg(PdfCjkFontFamily.heiseiMinchoW3, 10);
        fontNeg._metrics = { _widthTable: { _itemAt: (index: number) => index + 200 } } as any;
        // Act
        const widthNeg = (fontNeg as any)._getCharacterWidthInternal(-10);
        // Assert
        expect(widthNeg).toBe(200);
    });

    it('PdfCjkStandardFont fontFamily getter returns provided family', () => {
        // Arrange
        class TestCjkFontFamily extends PdfCjkStandardFont {
            constructor(fontFamily: PdfCjkFontFamily, size: number) { super(fontFamily, size); }
            _initializeInternals(primitive?: any): void { /* noop */ }
        }
        const family = PdfCjkFontFamily.heiseiMinchoW3;
        // Act
        const font = new TestCjkFontFamily(family, 16);
        // Assert
        expect(font.fontFamily).toBe(family);
    });

    it('_getCharacterWidthInternal returns width for standard char codes', () => {
        // Arrange
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        font._metrics = { _name: 'CustomFont', _widthTable: { _itemAt: (index: number) => index + 10 } } as any;
        const char = 'A'; // charCode 65
        // Act
        const width = (font as any)._getCharacterWidthInternal(char);
        // Assert
        expect(width).toBe(75); // 65 + 10
    });

    it('_getCharacterWidthInternal maps code 128 to index 0', () => {
        // Arrange
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        font._metrics = { _name: 'CustomFont', _widthTable: { _itemAt: (index: number) => index + 100 } } as any;
        const char128 = String.fromCharCode(128);
        // Act
        const width = (font as any)._getCharacterWidthInternal(char128);
        // Assert: code 128 mapped to 0 -> _itemAt(0) => 100
        expect(width).toBe(100);
    });

    it('_getCharacterWidthInternal handles null char (code 0) correctly', () => {
        // Arrange
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        font._metrics = { _name: 'CustomFont', _widthTable: { _itemAt: (index: number) => index + 500 } } as any;
        const nullChar = String.fromCharCode(0);
        // Act
        const width0 = (font as any)._getCharacterWidthInternal(nullChar);
        // Assert: code 0 -> _itemAt(0) => 500
        expect(width0).toBe(500);
    });

    it('PdfTrueTypeFont isEmbed getter reflects internal flag true', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._isEmbedFont = true;
        // Act / Assert
        expect(tt.isEmbed).toBeTruthy();
    });

    it('PdfTrueTypeFont isEmbed getter reflects internal flag false', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._isEmbedFont = false;
        // Act / Assert
        expect(tt.isEmbed).toBeFalsy();
    });

    it('PdfTrueTypeFont getLineWidth uses _getUnicodeLineWidth when format has textDirection', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._size = 10;
        tt._getUnicodeLineWidth = (line: string, width: number) => 50; // unscaled width
        tt._applyFormatSettings = (line: string, format: any, width: number) => width; // identity
        const format = { textDirection: 1 } as any; // non-none
        // Act
        const result = tt.getLineWidth('abc', format);
        // Assert: scaled by 0.001 * size => 50 * 0.001 * 10 = 0.5
        expect(result).toBeCloseTo(0.5, 5);
    });

    it('PdfTrueTypeFont getLineWidth sums per-character widths when format is null', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._size = 12;
        tt._getCharacterWidthInternal = (ch: string) => 10; // each char width
        tt._applyFormatSettings = (line: string, format: any, width: number) => width; // identity
        // Act
        const result = tt.getLineWidth('ab', null as any);
        // Assert: total 20 scaled by 0.001 * 12 = 0.24
        expect(result).toBeCloseTo(0.24, 5);
    });

    it('PdfTrueTypeFont getLineWidth resets NaN width to zero before scaling', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._size = 10;
        tt._getCharacterWidthInternal = (ch: string) => NaN; // produce NaN total
        tt._applyFormatSettings = (line: string, format: any, width: number) => width; // identity
        // Act
        const result = tt.getLineWidth('x', null as any);
        // Assert: NaN should be replaced with 0 and scaled => 0
        expect(result).toBe(0);
    });

    it('_UnicodeTrueTypeFont - setting data null', () => {
        // Arrange
        let error = undefined;
        try {
            const unicode: _UnicodeTrueTypeFont = new _UnicodeTrueTypeFont(null);
        }
        catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
    });

    it('_initializeInternals sets embed flag, metrics and internals', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._isEmbedFont = true;
        tt._fontInternal = Object.create(_UnicodeTrueTypeFont.prototype) as any;
        let createCalled = false;
        tt._fontInternal._createInternals = () => { createCalled = true; };
        const internals = { foo: 'bar' } as any;
        tt._fontInternal._getInternals = () => internals;
        tt._fontInternal._metrics = { marker: 1 } as any;
        tt._fontInternal._ttfMetrics = { _macAscent: 1000, _macDescent: -200, _lineGap: 50 } as any;
        // Act
        (tt as any)._initializeInternals();
        // Assert
        expect(createCalled).toBeTruthy();
        expect(tt._fontInternal._isEmbed).toBeTruthy();
        expect(tt._metrics).toBe(tt._fontInternal._metrics);
        expect((tt as any)._pdfFontInternals).toBe(internals);
    });
    it('_generateFontProgram', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        // Act
        var doc = new PdfDocument();
        var embedded = new PdfTrueTypeFont(ttfData, 12);
        var page1 = doc.addPage();
        var pen;
        embedded._fontInternal._ttfReader._isOpenType = true;
        embedded._fontInternal._ttfMetrics._contains = true;
        page1.graphics.drawString('Alpha', embedded, { x: 10, y: 10, width: 200, height: 200 }, pen);
        // Assert
        expect(embedded._fontInternal._fontProgram.isEmpty).toBeTruthy();
    });

    it('_initializeInternals skips embed flag when internal is not UnicodeTrueTypeFont', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._isEmbedFont = true;
        // use a plain object (not instanceof _UnicodeTrueTypeFont)
        tt._fontInternal = { _createInternals: () => { /* noop */ }, _getInternals: () => ({ x: 1 }), _metrics: { mark: 2 }, _ttfMetrics: { _macAscent: 200, _macDescent: -50, _lineGap: 10 } } as any;
        // Act
        expect(() => (tt as any)._initializeInternals()).not.toThrow();
        // Assert: _isEmbed should not have been set on plain object
        expect((tt._fontInternal as any)._isEmbed).toBeUndefined();
        expect(tt._metrics).toBe(tt._fontInternal._metrics);
        expect((tt as any)._pdfFontInternals).toEqual({ x: 1 });
    });

    it('_getUnicodeLineWidth accumulates widths when renderer returns glyph indices', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._fontInternal = { _ttfReader: { _getGlyph: (i: number) => ({ _width: i === 0 ? 30 : 20 }) } } as any;
        // stub renderer
        const original = _RtlRenderer.prototype._getGlyphIndex;
        _RtlRenderer.prototype._getGlyphIndex = (_line: string, _font: any, _glyphIndex: any) => ({ _result: true, _glyphIndex: [0, 1] } as any);
        // Act
        const w = (tt as any)._getUnicodeLineWidth('any', 0);
        // cleanup
        _RtlRenderer.prototype._getGlyphIndex = original;
        // Assert: 30 + 20 = 50
        expect(w).toBe(50);
    });

    it('_getUnicodeLineWidth ignores null or undefined glyphs when accumulating', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._fontInternal = { _ttfReader: { _getGlyph: (i: number) => (i === 0 ? { _width: 15 } : (i === 1 ? null : undefined)) } } as any;
        const original = _RtlRenderer.prototype._getGlyphIndex;
        _RtlRenderer.prototype._getGlyphIndex = (_line: string, _font: any, _glyphIndex: any) => ({ _result: true, _glyphIndex: [0, 1, 2] } as any);
        // Act
        const w = (tt as any)._getUnicodeLineWidth('any', 0);
        // cleanup
        _RtlRenderer.prototype._getGlyphIndex = original;
        // Assert: only index 0 contributes (15)
        expect(w).toBe(15);
    });

    it('_getUnicodeLineWidth returns 0 when renderer yields no glyphs', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        const original = _RtlRenderer.prototype._getGlyphIndex;
        _RtlRenderer.prototype._getGlyphIndex = (_line: string, _font: any, _glyphIndex: any) => ({ _result: false, _glyphIndex: null } as any);
        // Act
        const w = (tt as any)._getUnicodeLineWidth('any', 0);
        // cleanup
        _RtlRenderer.prototype._getGlyphIndex = original;
        // Assert
        expect(w).toBe(0);
    });

    it('_getUnicodeLineWidth returns 0 when renderer returns true but glyphIndex is null', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        const original = _RtlRenderer.prototype._getGlyphIndex;
        _RtlRenderer.prototype._getGlyphIndex = (_line: string, _font: any, _glyphIndex: any) => ({ _result: true, _glyphIndex: null } as any);
        // Act
        const w = (tt as any)._getUnicodeLineWidth('any', 0);
        // cleanup
        _RtlRenderer.prototype._getGlyphIndex = original;
        // Assert
        expect(w).toBe(0);
    });

    it('PdfTrueTypeFont _getCharacterWidthInternal returns width for ordinary char codes', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._metrics = { _widthTable: { _itemAt: (index: number) => index + 7 } } as any;
        const ch = 'A'; // charCode 65
        // Act
        const width = (tt as any)._getCharacterWidthInternal(ch);
        // Assert: 65 + 7 => 72
        expect(width).toBe(72);
    });

    it('PdfTrueTypeFont _getCharacterWidthInternal maps code 128 to index 0', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._metrics = { _widthTable: { _itemAt: (index: number) => (index === 0 ? 999 : index) } } as any;
        const char128 = String.fromCharCode(128);
        // Act
        const width = (tt as any)._getCharacterWidthInternal(char128);
        // Assert: code 128 should map to 0 -> returns 999
        expect(width).toBe(999);
    });

    it('_getCharacterWidth scales internal code width by size', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._fontInternal = { _getCharacterWidth: (ch: any) => 500 } as any;
        tt._getSize = (_format: any) => 10;
        // Act
        const v = (tt as any)._getCharacterWidth('A', null);
        // Assert: 500 * 0.001 * 10 = 5
        expect(v).toBeCloseTo(5, 5);
    });

    it('_setSymbols is no-op when _fontInternal is null', () => {
        // Arrange
        const tt = Object.create(PdfTrueTypeFont.prototype) as any;
        tt._fontInternal = null;
        // Act / Assert: should not throw
        expect(() => (tt as any)._setSymbols('abc')).not.toThrow();
        expect(tt._fontInternal).toBeNull();
    });

    it('default _getMetrics falls back to Helvetica for unknown fontFamily', () => {
        // Arrange
        const unknownFamily = 999 as any;
        // Act
        const metrics: any = (_PdfStandardFontMetricsFactory as any)._getMetrics(unknownFamily, PdfFontStyle.regular);
        // Assert
        expect(metrics._name).toBe('Helvetica');
        expect(metrics._subScriptSizeFactor).toBe(_PdfStandardFontMetricsFactory._subSuperScriptFactor);
        expect(metrics._superscriptSizeFactor).toBe(_PdfStandardFontMetricsFactory._subSuperScriptFactor);
    });

    it('_getMetrics returns Helvetica metrics for PdfFontFamily.helvetica', () => {
        // Act
        const metrics: any = (_PdfStandardFontMetricsFactory as any)._getMetrics(PdfFontFamily.helvetica, PdfFontStyle.regular);
        // Assert
        expect(metrics).toBeDefined();
        expect(metrics._name).toBe('Helvetica');
    });

    it('_getMetrics returns Courier metrics for PdfFontFamily.courier', () => {
        // Act
        const metrics: any = (_PdfStandardFontMetricsFactory as any)._getMetrics(PdfFontFamily.courier, PdfFontStyle.regular);
        // Assert
        expect(metrics).toBeDefined();
        expect(metrics._name).toBe('Courier');
    });

});

describe('CJK metrics factory tests', () => {
    it('_getHanyangSystemsGothicMedium returns correct metrics for style variants', () => {
        // Arrange/Act
        const regular: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsGothicMedium(PdfFontStyle.regular);
        const bold: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsGothicMedium(PdfFontStyle.bold);
        const italic: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsGothicMedium(PdfFontStyle.italic);
        const boldItalic: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsGothicMedium(PdfFontStyle.bold | PdfFontStyle.italic);
        // Assert
        expect(regular._postScriptName).toBe('HYGoThic-Medium');
        expect(bold._postScriptName).toBe('HYGoThic-Medium,Bold');
        expect(italic._postScriptName).toBe('HYGoThic-Medium,Italic');
        expect(boldItalic._postScriptName).toBe('HYGoThic-Medium,BoldItalic');
        expect(regular._widthTable._defaultWidth).toBe(1000);
    });

    it('_getHanyangSystemsShinMyeongJoMedium returns correct metrics for style variants', () => {
        // Arrange/Act
        const regular: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsShinMyeongJoMedium(PdfFontStyle.regular);
        const bold: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsShinMyeongJoMedium(PdfFontStyle.bold);
        const italic: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsShinMyeongJoMedium(PdfFontStyle.italic);
        const boldItalic: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsShinMyeongJoMedium(PdfFontStyle.bold | PdfFontStyle.italic);
        // Assert
        expect(regular._postScriptName).toBe('HYSMyeongJo-Medium');
        expect(bold._postScriptName).toBe('HYSMyeongJo-Medium,Bold');
        expect(italic._postScriptName).toBe('HYSMyeongJo-Medium,Italic');
        expect(boldItalic._postScriptName).toBe('HYSMyeongJo-Medium,BoldItalic');
        expect(regular._widthTable._defaultWidth).toBe(1000);
    });

    it('_getHanyangSystemsShinMyeongJoMedium width table returns range-specific and default widths', () => {
        // Arrange
        const metrics: any = (_PdfCjkStandardFontMetricsFactory as any)._getHanyangSystemsShinMyeongJoMedium(PdfFontStyle.regular);
        const table = metrics._widthTable;
        // Act / Assert - values inside first range
        expect(table._itemAt(1)).toBe(500);
        expect(table._itemAt(95)).toBe(500);
        // value just outside first range falls back to default
        expect(table._itemAt(96)).toBe(1000);
        // Act / Assert - values inside second range
        expect(table._itemAt(8094)).toBe(500);
        expect(table._itemAt(8190)).toBe(500);
        // just outside second range falls back to default
        expect(table._itemAt(8191)).toBe(1000);
    });

    it('_getHeiseiKakuGothicW5 returns correct metrics for style variants', () => {
        // Arrange/Act
        const regular: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiKakuGothicW5(PdfFontStyle.regular);
        const bold: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiKakuGothicW5(PdfFontStyle.bold);
        const italic: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiKakuGothicW5(PdfFontStyle.italic);
        const boldItalic: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiKakuGothicW5(PdfFontStyle.bold | PdfFontStyle.italic);
        // Assert
        expect(regular._postScriptName).toBe('HeiseiKakuGo-W5');
        expect(bold._postScriptName).toBe('HeiseiKakuGo-W5,Bold');
        expect(italic._postScriptName).toBe('HeiseiKakuGo-W5,Italic');
        expect(boldItalic._postScriptName).toBe('HeiseiKakuGo-W5,BoldItalic');
        expect(regular._widthTable._defaultWidth).toBe(1000);
    });

    it('_getHeiseiKakuGothicW5 width table returns range-specific and default widths', () => {
        // Arrange
        const metrics: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiKakuGothicW5(PdfFontStyle.regular);
        const table = metrics._widthTable;
        // Act / Assert - values inside first range
        expect(table._itemAt(1)).toBe(500);
        expect(table._itemAt(95)).toBe(500);
        // value just outside first range falls back to default
        expect(table._itemAt(96)).toBe(1000);
        // Act / Assert - values inside second range
        expect(table._itemAt(231)).toBe(500);
        expect(table._itemAt(632)).toBe(500);
        // just outside second range falls back to default
        expect(table._itemAt(633)).toBe(1000);
    });

    it('_getHeiseiMinchoW3 returns correct metrics for style variants', () => {
        // Arrange/Act
        const regular: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiMinchoW3(PdfFontStyle.regular);
        const bold: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiMinchoW3(PdfFontStyle.bold);
        const italic: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiMinchoW3(PdfFontStyle.italic);
        const boldItalic: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiMinchoW3(PdfFontStyle.bold | PdfFontStyle.italic);
        // Assert
        expect(regular._postScriptName).toBe('HeiseiMin-W3');
        expect(bold._postScriptName).toBe('HeiseiMin-W3,Bold');
        expect(italic._postScriptName).toBe('HeiseiMin-W3,Italic');
        expect(boldItalic._postScriptName).toBe('HeiseiMin-W3,BoldItalic');
        expect(regular._widthTable._defaultWidth).toBe(1000);
    });

    it('_getHeiseiMinchoW3 width table returns range-specific and default widths', () => {
        // Arrange
        const metrics: any = (_PdfCjkStandardFontMetricsFactory as any)._getHeiseiMinchoW3(PdfFontStyle.regular);
        const table = metrics._widthTable;
        // Act / Assert - values inside first range
        expect(table._itemAt(1)).toBe(500);
        expect(table._itemAt(95)).toBe(500);
        // value just outside first range falls back to default
        expect(table._itemAt(96)).toBe(1000);
        // Act / Assert - values inside second range
        expect(table._itemAt(231)).toBe(500);
        expect(table._itemAt(632)).toBe(500);
        // just outside second range falls back to default
        expect(table._itemAt(230)).toBe(1000);
        expect(table._itemAt(633)).toBe(1000);
    });

    it('_getMonotypeHeiMedium returns correct metrics for style variants', () => {
        // Arrange/Act
        const regular: any = (_PdfCjkStandardFontMetricsFactory as any)._getMonotypeHeiMedium(PdfFontStyle.regular);
        const bold: any = (_PdfCjkStandardFontMetricsFactory as any)._getMonotypeHeiMedium(PdfFontStyle.bold);
        const italic: any = (_PdfCjkStandardFontMetricsFactory as any)._getMonotypeHeiMedium(PdfFontStyle.italic);
        const boldItalic: any = (_PdfCjkStandardFontMetricsFactory as any)._getMonotypeHeiMedium(PdfFontStyle.bold | PdfFontStyle.italic);
        // Assert
        expect(regular._postScriptName).toBe('MHei-Medium');
        expect(bold._postScriptName).toBe('MHei-Medium,Bold');
        expect(italic._postScriptName).toBe('MHei-Medium,Italic');
        expect(boldItalic._postScriptName).toBe('MHei-Medium,BoldItalic');
        expect(regular._widthTable._defaultWidth).toBe(1000);
    });

    it('_getMonotypeHeiMedium width table returns range-specific and default widths', () => {
        // Arrange
        const metrics: any = (_PdfCjkStandardFontMetricsFactory as any)._getMonotypeHeiMedium(PdfFontStyle.regular);
        const table = metrics._widthTable;
        // Act / Assert - values inside first range
        expect(table._itemAt(1)).toBe(500);
        expect(table._itemAt(95)).toBe(500);
        // value just outside first range falls back to default
        expect(table._itemAt(96)).toBe(1000);
        // Act / Assert - values inside second range
        expect(table._itemAt(13648)).toBe(500);
        expect(table._itemAt(13742)).toBe(500);
        // just outside second range falls back to default
        expect(table._itemAt(13647)).toBe(1000);
        expect(table._itemAt(13743)).toBe(1000);
    });

    it('sinoTypeSongLight postScriptName variants for style flags', () => {
        // Arrange/Act
        const regular: any = (_PdfCjkStandardFontMetricsFactory as any)._getMetrics(PdfCjkFontFamily.sinoTypeSongLight, PdfFontStyle.regular);
        const bold: any = (_PdfCjkStandardFontMetricsFactory as any)._getMetrics(PdfCjkFontFamily.sinoTypeSongLight, PdfFontStyle.bold);
        const italic: any = (_PdfCjkStandardFontMetricsFactory as any)._getMetrics(PdfCjkFontFamily.sinoTypeSongLight, PdfFontStyle.italic);
        const boldItalic: any = (_PdfCjkStandardFontMetricsFactory as any)._getMetrics(PdfCjkFontFamily.sinoTypeSongLight, (PdfFontStyle.bold | PdfFontStyle.italic));
        // Assert
        expect(regular._postScriptName).toBe('STSong-Light');
        expect(bold._postScriptName).toBe('STSong-Light,Bold');
        expect(italic._postScriptName).toBe('STSong-Light,Italic');
        expect(boldItalic._postScriptName).toBe('STSong-Light,BoldItalic');
        expect(regular._name).toBe('SinoTypeSongLight');
    });

    it('sinoTypeSongLight width table returns default width', () => {
        // Arrange
        const metrics: any = (_PdfCjkStandardFontMetricsFactory as any)._getMetrics(PdfCjkFontFamily.sinoTypeSongLight, PdfFontStyle.regular);
        const table = metrics._widthTable;
        // Act / Assert - default width should be set to 1000
        expect(table._defaultWidth).toBe(1000);
    });

    it('sinoTypeSongLight sub/superscript factors set to factory constant', () => {
        // Act
        const metrics: any = (_PdfCjkStandardFontMetricsFactory as any)._getMetrics(PdfCjkFontFamily.sinoTypeSongLight, PdfFontStyle.regular);
        // Assert
        expect(metrics._subScriptSizeFactor).toBe((_PdfCjkStandardFontMetricsFactory as any)._subSuperScriptFactor);
        expect(metrics._superscriptSizeFactor).toBe((_PdfCjkStandardFontMetricsFactory as any)._subSuperScriptFactor);
    });

    it('_getMetrics returns HanyangSystemsShinMyeongJoMedium name and factors', () => {
        // Act
        const metrics: any = (_PdfCjkStandardFontMetricsFactory as any)._getMetrics(PdfCjkFontFamily.hanyangSystemsShinMyeongJoMedium, PdfFontStyle.regular);
        // Assert
        expect(metrics._name).toBe('HanyangSystemsShinMyeongJoMedium');
        expect(metrics._subScriptSizeFactor).toBe((_PdfCjkStandardFontMetricsFactory as any)._subSuperScriptFactor);
        expect(metrics._superscriptSizeFactor).toBe((_PdfCjkStandardFontMetricsFactory as any)._subSuperScriptFactor);
    });

    it('_getMetrics returns MonotypeHeiMedium name and factors', () => {
        // Act
        const metrics: any = (_PdfCjkStandardFontMetricsFactory as any)._getMetrics(PdfCjkFontFamily.monotypeHeiMedium, PdfFontStyle.regular);
        // Assert
        expect(metrics._name).toBe('MonotypeHeiMedium');
        expect(metrics._subScriptSizeFactor).toBe((_PdfCjkStandardFontMetricsFactory as any)._subSuperScriptFactor);
        expect(metrics._superscriptSizeFactor).toBe((_PdfCjkStandardFontMetricsFactory as any)._subSuperScriptFactor);
    });

    it('_fillHanyangSystemsShinMyeongJoMedium sets descriptor properties', () => {
        // Arrange
        const descriptor: any = { set: function (k: string, v: any) { this[k] = v; } };
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const origFillFontBox = factory._fillFontBox;
        const origFillKnownInformation = factory._fillKnownInformation;
        factory._fillFontBox = function () { };
        factory._fillKnownInformation = function () { };
        // Act
        factory._fillHanyangSystemsShinMyeongJoMedium(descriptor, 'Hanyang', {}, 1, -1);
        // Assert
        expect(descriptor['StemV']).toBe(93);
        expect(descriptor['StemH']).toBe(93);
        expect(descriptor['AvgWidth']).toBe(1000);
        expect(descriptor['MaxWidth']).toBe(1000);
        expect(descriptor['CapHeight']).toBe(880);
        expect(descriptor['XHeight']).toBe(616);
        expect(descriptor['Leading']).toBe(250);
        // Cleanup
        factory._fillFontBox = origFillFontBox;
        factory._fillKnownInformation = origFillKnownInformation;
    });

});


    it('_fillFontBox sets FontBBox on descriptor', () => {
        // Arrange
        const descriptor: any = { set: function (k: string, v: any) { this[k] = v; } };
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const box = { x: 1, y: 2, width: 3, height: 4 };
        // Act
        factory._fillFontBox(descriptor, box);
        // Assert
        expect(descriptor['FontBBox']).toBeDefined();
    });

    it('_fillKnownInformation sets descriptor fields and Flags for monotypeHeiMedium', () => {
        // Arrange
        const descriptor: any = { set: function (k: string, v: any) { this[k] = v; } };
        const metrics: any = { _postScriptName: 'TestPS', _widthTable: { _defaultWidth: 123 } };
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        // Act
        factory._fillKnownInformation(descriptor, /*fontFamily*/ (PdfCjkFontFamily.monotypeHeiMedium), metrics, 11, -5);
        // Assert
        expect(descriptor['MissingWidth']).toBe(123);
        expect(descriptor['Ascent']).toBe(11);
        expect(descriptor['Descent']).toBe(-5);
        expect(descriptor['Flags']).toBe(4);
    });

    it('_getFontDescriptor returns updated descriptor for hanyangSystemsGothicMedium', () => {
        // Arrange
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const metrics: any = { _postScriptName: 'PS', _widthTable: { _defaultWidth: 10 } };
        // Act
        const desc: any = factory._getFontDescriptor(PdfCjkFontFamily.hanyangSystemsGothicMedium, PdfFontStyle.regular, metrics, 10, -2);
        // Assert
        expect(desc._updated).toBeTruthy();
    });

    it('_getFontDescriptor returns updated descriptor for hanyangSystemsShinMyeongJoMedium', () => {
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const metrics: any = { _postScriptName: 'PS', _widthTable: { _defaultWidth: 11 } };
        const desc: any = factory._getFontDescriptor(PdfCjkFontFamily.hanyangSystemsShinMyeongJoMedium, PdfFontStyle.regular, metrics, 12, -3);
        expect(desc._updated).toBeTruthy();
    });

    it('_getFontDescriptor returns updated descriptor for heiseiKakuGothicW5 (italic handling)', () => {
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const metrics: any = { _postScriptName: 'PS', _widthTable: { _defaultWidth: 12 } };
        const desc: any = factory._getFontDescriptor(PdfCjkFontFamily.heiseiKakuGothicW5, PdfFontStyle.italic, metrics, 13, -4);
        expect(desc._updated).toBeTruthy();
    });

    it('_getFontDescriptor returns updated descriptor for heiseiMinchoW3', () => {
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const metrics: any = { _postScriptName: 'PS', _widthTable: { _defaultWidth: 13 } };
        const desc: any = factory._getFontDescriptor(PdfCjkFontFamily.heiseiMinchoW3, PdfFontStyle.regular, metrics, 14, -5);
        expect(desc._updated).toBeTruthy();
    });

    it('_getFontDescriptor returns updated descriptor for monotypeHeiMedium', () => {
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const metrics: any = { _postScriptName: 'PS', _widthTable: { _defaultWidth: 14 } };
        const desc: any = factory._getFontDescriptor(PdfCjkFontFamily.monotypeHeiMedium, PdfFontStyle.regular, metrics, 15, -6);
        expect(desc._updated).toBeTruthy();
    });

    it('_getFontDescriptor returns updated descriptor for monotypeSungLight', () => {
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const metrics: any = { _postScriptName: 'PS', _widthTable: { _defaultWidth: 15 } };
        const desc: any = factory._getFontDescriptor(PdfCjkFontFamily.monotypeSungLight, PdfFontStyle.regular, metrics, 16, -7);
        expect(desc._updated).toBeTruthy();
    });

    it('_getFontDescriptor returns updated descriptor for sinoTypeSongLight', () => {
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const metrics: any = { _postScriptName: 'PS', _widthTable: { _defaultWidth: 16 } };
        const desc: any = factory._getFontDescriptor(PdfCjkFontFamily.sinoTypeSongLight, PdfFontStyle.regular, metrics, 17, -8);
        expect(desc._updated).toBeTruthy();
    });

    it('_getFontDescriptor default branch returns updated descriptor for unknown family', () => {
        const factory: any = (_PdfCjkFontDescriptorFactory as any);
        const metrics: any = { _postScriptName: 'PS', _widthTable: { _defaultWidth: 0 } };
        const desc: any = factory._getFontDescriptor(9999, PdfFontStyle.regular, metrics, 0, 0);
        expect(desc._updated).toBeTruthy();
    });

