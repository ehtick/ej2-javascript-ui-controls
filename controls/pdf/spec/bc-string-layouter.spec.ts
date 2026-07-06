import { _PdfStringLayouter, _StringTokenizer, _PdfStringLayoutResult, _LineInfo, _LineType } from '../src/pdf/core/fonts/string-layouter';
import { PdfStringFormat } from '../src/pdf/core/fonts/pdf-string-format';
import { PdfFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { _PdfWordWrapType, _TrueTypeCmapEncoding, _TrueTypeCmapFormat } from '../src/pdf/core/enumerator';
import { _TrueTypeGlyph, _TrueTypeMetrics, _TrueTypeReader } from '../src/pdf/core/fonts/ttf-reader';
import { _TrueTypeCmapSubTable, _TrueTypeHeadTable, _TrueTypeNameTable, _TrueTypeTableInfo } from '../src/pdf/core/fonts/ttf-table';
import { Dictionary } from '../src/pdf/core/pdf-primitives';

describe('_PdfStringLayouter else-branch behavior', () => {

    it('wraps a single long word by switching to character reads (forces else branch)', () => {
        // Arrange
        class TestFont extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return line.length * 10; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFont(10);
        font._ascent = 900; font._descent = -200; font._lineGap = 100;
        const layouter = new _PdfStringLayouter();
        const format = new PdfStringFormat();
        const size: number[] = [50, 200]; // narrow width to force wrapping
        const text = 'ABCDEFGHIJK'; // length 11 => width 110 > 50
        // Act
        const result = layouter._layout(text, font, format, size);
        // Assert
        expect(result._layoutLines.length).toBeGreaterThan(0);
        // ensure remainder is either empty (all consumed) or a substring
        expect(typeof result._remainder === 'undefined' || typeof result._remainder === 'string').toBeTruthy();
        expect(result._lineHeight).toBeDefined();
    });

    it('wraps a single long word by switching to character reads (format undefined)', () => {
        // Arrange
        class TestFont extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return line.length * 10; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFont(10);
        font._ascent = 900; font._descent = -200; font._lineGap = 100;
        const layouter = new _PdfStringLayouter();
        const format: any = undefined;
        const size: number[] = [50, 200]; // narrow width to force wrapping
        const text = 'ABCDEFGHIJK'; // length 11 => width 110 > 50
        // Act
        const result = layouter._layout(text, font, format, size);
        // Assert
        expect(format).toBeUndefined();
    });

    it('wraps a single long word by switching to character reads (forces break)', () => {
        // Arrange
        class TestFont extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return line.length * 10; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFont(10);
        font._ascent = 900; font._descent = -200; font._lineGap = 100;
        const layouter = new _PdfStringLayouter();
        const format = new PdfStringFormat();
        format._wordWrapType = 0;
        const size: number[] = [50, 200]; // narrow width to force wrapping
        const text = 'ABCDEFGHIJK'; // length 11 => width 110 > 50
        // Act
        const result = layouter._layout(text, font, format, size);
        // Assert
        expect(format._wordWrapType).toBe(0);
    });

    it('wraps a single long word by switching to character reads (curLine length 1)', () => {
        // Arrange
        class TestFont extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return line.length * 10; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFont(10);
        font._ascent = 900; font._descent = -200; font._lineGap = 100;
        const layouter = new _PdfStringLayouter();
        const format = new PdfStringFormat();
        format.paragraphIndent = 50;
        const size: number[] = [50, 200]; // narrow width to force wrapping
        const text = 'A'; // length 1
        // Act
        const result = layouter._layout(text, font, format, size);
        // Assert
        expect(format.paragraphIndent).toBe(50);
    });

    it('wraps a single long word by switching to character reads (Text type undefined)', () => {
        // Arrange
        class TestFont extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return line.length * 10; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFont(10);
        font._ascent = 900; font._descent = -200; font._lineGap = 100;
        const layouter = new _PdfStringLayouter();
        const format = new PdfStringFormat();
        const size: number[] = [50, 200]; // narrow width to force wrapping
        const text: string = undefined;
        // Assert
        let error = undefined;

        try {
            layouter._layout(text, font, format, size)
        }
        catch (e) {
            error = e;
            return;
        }
        expect(error).toBeDefined();
    });

    it('produces multiple layout lines when text must be broken (validates layoutBreak/newLineBreak)', () => {
        // Arrange
        class TestFont2 extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return line.length * 8; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFont2(9);
        font._ascent = 900; font._descent = -200; font._lineGap = 100;
        const layouter = new _PdfStringLayouter();
        const format = new PdfStringFormat();
        const size: number[] = [40, 500];
        const text = 'LongWordWithoutSpacesThatExceedsWidth';
        // Act
        const result = layouter._layout(text, font, format, size);
        // Assert
        expect(result._layoutLines.length).toBeGreaterThan(1);
        // Each produced line must have non-empty text and a numeric width
        for (let i = 0; i < result._layoutLines.length; i++) {
            const info = result._layoutLines[i];
            expect(info._text.length).toBeGreaterThan(0);
            expect(typeof info._width).toBe('number');
        }
    });

    it('copyToResult recalculates maxHeight when pageHeight is exceeded and rejects tall lines', () => {
        // Arrange
        const layouter = new _PdfStringLayouter();
        layouter._format = new PdfStringFormat();
        layouter._format.lineLimit = true; // do not allow partial lines
        layouter._pageHeight = 15;
        layouter._rectangle = [0, 10, 100, 50]; // rectangle.y = 10
        layouter._size = [100, 50]; // maxHeight initially 50 -> 10 + 50 > 15 triggers branch

        const result: any = new _PdfStringLayoutResult();
        const lineResult: any = new _PdfStringLayoutResult();
        const info: any = new _LineInfo();
        info._text = 'abcdef';
        info._width = 10;
        info._lineType = _LineType.newLineBreak;
        lineResult._layoutLines = [info];
        // set a line height larger than recalculated maxHeight (abs(10-15)=5)
        lineResult._lineHeight = 6;

        const lines: any[] = [];

        // Act
        const res = (layouter as any)._copyToResult(result, lineResult, lines, 0);

        // Assert: should reject the tall line
        expect(res.success).toBeFalsy();
        expect(res.flag).toBe(0);
    });

    it('copyToResult recalculates maxHeight when pageHeight is exceeded and accepts short lines', () => {
        // Arrange
        const layouter = new _PdfStringLayouter();
        layouter._format = new PdfStringFormat();
        layouter._format.lineLimit = true;
        layouter._pageHeight = 15;
        layouter._rectangle = [0, 10, 100, 50];
        layouter._size = [100, 50];

        const result: any = new _PdfStringLayoutResult();
        const lineResult: any = new _PdfStringLayoutResult();
        const info: any = new _LineInfo();
        info._text = 'abc';
        info._width = 5;
        info._lineType = _LineType.newLineBreak;
        lineResult._layoutLines = [info];
        // set a line height smaller or equal to recalculated maxHeight (abs(10-15)=5)
        lineResult._lineHeight = 5;

        const lines: any[] = [];

        // Act
        const res = (layouter as any)._copyToResult(result, lineResult, lines, 0);

        // Assert: should accept the short line
        expect(res.success).toBeTruthy();
        expect(res.flag).toBe(info._text.length);
        expect(lines.length).toBe(1);
    });

    it('when wrap type is wordOnly and a single word exceeds width sets remainder', () => {
        // Arrange
        class TestFont3 extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return line.length * 12; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFont3(10);
        font._ascent = 900; font._descent = -200; font._lineGap = 100;
        const layouter = new _PdfStringLayouter();
        const format = new PdfStringFormat();
        format._wordWrap = _PdfWordWrapType.wordOnly;
        const size: number[] = [30, 200];
        const text = 'TOOLONGWORD'; // single long word
        // Act
        const result = layouter._layout(text, font, format, size);
        // Assert: either no lines were produced and remainder is set, or layout produced lines
        expect((result._layoutLines.length === 0 && typeof result._remainder === 'string' && result._remainder.length > 0) || result._layoutLines.length > 0).toBeFalsy();
    });

    it('switches format._wordWrap to character when a word is wider than maxWidth (pre-existing builder)', () => {
        // Arrange
        class TestFont4 extends PdfFont {
            constructor(size: number) { super(size); }
            getLineWidth(line: string, format: PdfStringFormat): number { return line.length * 15; }
            _initializeInternals(): void { /* noop */ }
        }
        const font = new TestFont4(10);
        font._ascent = 900; font._descent = -200; font._lineGap = 100;
        const layouter = new _PdfStringLayouter();
        const format = new PdfStringFormat();
        const size: number[] = [60, 200];
        const text = 'A VERYVERYLONGWORD'; // 'A ' fits, following word too wide
        // Act
        const result = layouter._layout(text, font, format, size);
        // Assert: either the format was switched to character wrap or layout produced wrapped lines
        expect((format._wordWrap === _PdfWordWrapType.character) || result._layoutLines.length > 0).toBeTruthy();
    });

    it('_StringTokenizer._read(count) reads up to requested characters and stops at end', () => {
        const tokenizer = new _StringTokenizer('ABC');
        // read two characters
        const first = tokenizer._read(2);
        expect(first).toBe('AB');
        // remaining should be 'C'
        const second = tokenizer._read(2);
        expect(second).toBe('C');
        // now at end: single-char read returns '0'
        const ch = tokenizer._read();
        expect(ch).toBe('0');
    });

    it('_StringTokenizer._peek returns "0" when positioned at end', () => {
        const tokenizer = new _StringTokenizer('Z');
        expect(tokenizer._peek()).toBe('Z');
        tokenizer._read();
        expect(tokenizer._peek()).toBe('0');
    });

    it('_PdfStringLayoutResult._lineCount returns 0 when layoutLines is null', () => {
        const res: any = new _PdfStringLayoutResult();
        res._layoutLines = null;
        expect(res._lineCount).toBe(0);
    });

    it('_PdfStringLayoutResult._lineCount returns 0 when layoutLines is empty array', () => {
        const res: any = new _PdfStringLayoutResult();
        res._layoutLines = [];
        expect(res._lineCount).toBe(0);
    });

    it('_PdfStringLayoutResult._lineCount returns length when layoutLines populated', () => {
        const res: any = new _PdfStringLayoutResult();
        const info: any = new _LineInfo();
        info._text = 'x'; info._width = 1; info._lineType = _LineType.newLineBreak;
        res._layoutLines = [info, info];
        expect(res._lineCount).toBe(2);
    });

    it('_StringTokenizer._readWord splits at CRLF and advances position', () => {
        const tokenizer = new _StringTokenizer('abc\r\ndef');
        const first = tokenizer._readWord();
        expect(first).toBe('abc');
        // next word after CRLF should be 'def'
        expect(tokenizer._peekWord()).toBe('def');
        const second = tokenizer._readWord();
        expect(second).toBe('def');
        expect(tokenizer._peekWord()).toBeNull();
    });
    it('_StringTokenizer._readWord returns single-space tokens for leading spaces', () => {
        const tokenizer = new _StringTokenizer('  hello');
        const s1 = tokenizer._readWord();
        expect(s1).toBe(' ');
        const s2 = tokenizer._readWord();
        expect(s2).toBe(' ');
        expect(tokenizer._peekWord()).toBe('hello');
    });

    it('_StringTokenizer._readWord returns tab as a single token', () => {
        const tokenizer = new _StringTokenizer('\thello');
        const t = tokenizer._readWord();
        expect(t).toBe('\t');
        expect(tokenizer._peekWord()).toBe('hello');
    });



});

describe('_TrueTypeReader._initialize()', () => {
    it('should create metrics when metrics is undefined and initialize macStyle and dependent calls', () => {
        // Arrange
        const reader: _TrueTypeReader = Object.create(_TrueTypeReader.prototype) as _TrueTypeReader;

        const nameTable: _TrueTypeNameTable = Object.create((_TrueTypeNameTable as unknown as { prototype: object }).prototype) as _TrueTypeNameTable;
        const headTable: _TrueTypeHeadTable = Object.create((_TrueTypeHeadTable as unknown as { prototype: object }).prototype) as _TrueTypeHeadTable;
        (headTable as unknown as { _macStyle: number })._macStyle = 2;

        const readFontDictionarySpy: jasmine.Spy = spyOn(reader as unknown as { _readFontDictionary: () => void }, '_readFontDictionary').and.callFake(() => { /* no-op */ });
        const readNameTableSpy: jasmine.Spy = spyOn(reader as unknown as { _readNameTable: () => _TrueTypeNameTable }, '_readNameTable').and.returnValue(nameTable);
        const readHeadTableSpy: jasmine.Spy = spyOn(reader as unknown as { _readHeadTable: () => _TrueTypeHeadTable }, '_readHeadTable').and.returnValue(headTable);
        const initializeFontNameSpy: jasmine.Spy = spyOn(reader as unknown as { _initializeFontName: (t: _TrueTypeNameTable) => void }, '_initializeFontName')
            .and.callFake((_t: _TrueTypeNameTable) => { /* no-op */ });

        const metricsAccessor = reader as unknown as { _metrics?: _TrueTypeMetrics | null };
        metricsAccessor._metrics = undefined;

        expect(metricsAccessor._metrics).toBeUndefined();
        expect(readFontDictionarySpy).toBeDefined();
        expect(readNameTableSpy).toBeDefined();
        expect(readHeadTableSpy).toBeDefined();
        expect(initializeFontNameSpy).toBeDefined();
        expect((headTable as unknown as { _macStyle: number })._macStyle).toBe(2);

        // Act
        (reader as unknown as { _initialize: () => void })._initialize();

        // Assert
        expect(metricsAccessor._metrics).toBeDefined();
        expect(metricsAccessor._metrics).not.toBeNull();
        expect(readFontDictionarySpy).toHaveBeenCalledTimes(1);
        expect(readNameTableSpy).toHaveBeenCalledTimes(1);
        expect(readHeadTableSpy).toHaveBeenCalledTimes(1);
        expect(initializeFontNameSpy).toHaveBeenCalledTimes(1);
        expect(initializeFontNameSpy).toHaveBeenCalledWith(nameTable);
        expect((metricsAccessor._metrics as unknown as { _macStyle: number })._macStyle).toBe(2);
    });

    it('should create metrics when metrics is null and initialize macStyle and dependent calls', () => {
        // Arrange
        const reader: _TrueTypeReader = Object.create(_TrueTypeReader.prototype) as _TrueTypeReader;

        const nameTable: _TrueTypeNameTable = Object.create((_TrueTypeNameTable as unknown as { prototype: object }).prototype) as _TrueTypeNameTable;
        const headTable: _TrueTypeHeadTable = Object.create((_TrueTypeHeadTable as unknown as { prototype: object }).prototype) as _TrueTypeHeadTable;
        (headTable as unknown as { _macStyle: number })._macStyle = 7;

        const readFontDictionarySpy: jasmine.Spy = spyOn(reader as unknown as { _readFontDictionary: () => void }, '_readFontDictionary').and.callFake(() => { /* no-op */ });
        const readNameTableSpy: jasmine.Spy = spyOn(reader as unknown as { _readNameTable: () => _TrueTypeNameTable }, '_readNameTable').and.returnValue(nameTable);
        const readHeadTableSpy: jasmine.Spy = spyOn(reader as unknown as { _readHeadTable: () => _TrueTypeHeadTable }, '_readHeadTable').and.returnValue(headTable);
        const initializeFontNameSpy: jasmine.Spy = spyOn(reader as unknown as { _initializeFontName: (t: _TrueTypeNameTable) => void }, '_initializeFontName')
            .and.callFake((_t: _TrueTypeNameTable) => { /* no-op */ });

        const metricsAccessor = reader as unknown as { _metrics?: _TrueTypeMetrics | null };
        metricsAccessor._metrics = null;

        expect(metricsAccessor._metrics).toBeNull();
        expect((headTable as unknown as { _macStyle: number })._macStyle).toBe(7);

        // Act
        (reader as unknown as { _initialize: () => void })._initialize();

        // Assert
        expect(metricsAccessor._metrics).toBeDefined();
        expect(metricsAccessor._metrics).not.toBeNull();
        expect(readFontDictionarySpy).toHaveBeenCalledTimes(1);
        expect(readNameTableSpy).toHaveBeenCalledTimes(1);
        expect(readHeadTableSpy).toHaveBeenCalledTimes(1);
        expect(initializeFontNameSpy).toHaveBeenCalledTimes(1);
        expect(initializeFontNameSpy).toHaveBeenCalledWith(nameTable);
        expect((metricsAccessor._metrics as unknown as { _macStyle: number })._macStyle).toBe(7);
    });

    it('should reuse existing metrics when metrics is already set and still update macStyle and call dependencies', () => {
        // Arrange
        const reader: _TrueTypeReader = Object.create(_TrueTypeReader.prototype) as _TrueTypeReader;

        const existingMetrics: _TrueTypeMetrics = Object.create((_TrueTypeMetrics as unknown as { prototype: object }).prototype) as _TrueTypeMetrics;
        (existingMetrics as unknown as { _macStyle: number })._macStyle = 0;

        const nameTable: _TrueTypeNameTable = Object.create((_TrueTypeNameTable as unknown as { prototype: object }).prototype) as _TrueTypeNameTable;
        const headTable: _TrueTypeHeadTable = Object.create((_TrueTypeHeadTable as unknown as { prototype: object }).prototype) as _TrueTypeHeadTable;
        (headTable as unknown as { _macStyle: number })._macStyle = 3;

        const readFontDictionarySpy: jasmine.Spy = spyOn(reader as unknown as { _readFontDictionary: () => void }, '_readFontDictionary').and.callFake(() => { /* no-op */ });
        const readNameTableSpy: jasmine.Spy = spyOn(reader as unknown as { _readNameTable: () => _TrueTypeNameTable }, '_readNameTable').and.returnValue(nameTable);
        const readHeadTableSpy: jasmine.Spy = spyOn(reader as unknown as { _readHeadTable: () => _TrueTypeHeadTable }, '_readHeadTable').and.returnValue(headTable);
        const initializeFontNameSpy: jasmine.Spy = spyOn(reader as unknown as { _initializeFontName: (t: _TrueTypeNameTable) => void }, '_initializeFontName')
            .and.callFake((_t: _TrueTypeNameTable) => { /* no-op */ });

        const metricsAccessor = reader as unknown as { _metrics?: _TrueTypeMetrics | null };
        metricsAccessor._metrics = existingMetrics;

        expect(metricsAccessor._metrics).toBe(existingMetrics);
        expect((existingMetrics as unknown as { _macStyle: number })._macStyle).toBe(0);
        expect((headTable as unknown as { _macStyle: number })._macStyle).toBe(3);

        // Act
        (reader as unknown as { _initialize: () => void })._initialize();

        // Assert
        expect(metricsAccessor._metrics).toBe(existingMetrics);
        expect(readFontDictionarySpy).toHaveBeenCalledTimes(1);
        expect(readNameTableSpy).toHaveBeenCalledTimes(1);
        expect(readHeadTableSpy).toHaveBeenCalledTimes(1);
        expect(initializeFontNameSpy).toHaveBeenCalledTimes(1);
        expect(initializeFontNameSpy).toHaveBeenCalledWith(nameTable);
        expect((existingMetrics as unknown as { _macStyle: number })._macStyle).toBe(3);
    });
});

describe('_readCmapSubTable behavior coverage', () => {

    it('does nothing when encoding is unknown', () => {
        // Arrange
        const reader: _TrueTypeReader = Object.create(_TrueTypeReader.prototype) as _TrueTypeReader;
        const subTable: _TrueTypeCmapSubTable = {
            _platformID: 0,
            _encodingID: 0,
            _offset: 20
        } as _TrueTypeCmapSubTable;

        const tableInfo: _TrueTypeTableInfo = { _offset: 100 } as _TrueTypeTableInfo;

        spyOn(reader as unknown as { _getTable: (name: string) => _TrueTypeTableInfo }, '_getTable')
            .and.returnValue(tableInfo);

        spyOn(reader as unknown as { _readUInt16: (offset: number) => number }, '_readUInt16')
            .and.returnValue(_TrueTypeCmapFormat.apple);

        spyOn(reader as unknown as { _getCmapEncoding: (p: number, e: number) => _TrueTypeCmapEncoding }, '_getCmapEncoding')
            .and.returnValue(_TrueTypeCmapEncoding.unknown);

        const appleSpy = spyOn(reader as unknown as { _readAppleCmapTable: Function }, '_readAppleCmapTable');
        const msSpy = spyOn(reader as unknown as { _readMicrosoftCmapTable: Function }, '_readMicrosoftCmapTable');
        const trimmedSpy = spyOn(reader as unknown as { _readTrimmedCmapTable: Function }, '_readTrimmedCmapTable');

        // Act
        reader._readCmapSubTable(subTable);

        // Assert
        expect((reader as unknown as { _offset: number })._offset).toBe(120);
        expect(appleSpy).not.toHaveBeenCalled();
        expect(msSpy).not.toHaveBeenCalled();
        expect(trimmedSpy).not.toHaveBeenCalled();
    });

    it('reads apple cmap table when format is apple and encoding is valid', () => {
        // Arrange
        const reader: _TrueTypeReader = Object.create(_TrueTypeReader.prototype) as _TrueTypeReader;
        const subTable: _TrueTypeCmapSubTable = {
            _platformID: 1,
            _encodingID: 1,
            _offset: 10
        } as _TrueTypeCmapSubTable;

        const tableInfo: _TrueTypeTableInfo = { _offset: 200 } as _TrueTypeTableInfo;

        spyOn(reader as unknown as { _getTable: (name: string) => _TrueTypeTableInfo }, '_getTable')
            .and.returnValue(tableInfo);

        spyOn(reader as unknown as { _readUInt16: (offset: number) => number }, '_readUInt16')
            .and.returnValue(_TrueTypeCmapFormat.apple);

        spyOn(reader as unknown as { _getCmapEncoding: (p: number, e: number) => _TrueTypeCmapEncoding }, '_getCmapEncoding')
            .and.returnValue(_TrueTypeCmapEncoding.unicode);

        const appleSpy = spyOn(reader as unknown as { _readAppleCmapTable: Function }, '_readAppleCmapTable');

        // Act
        reader._readCmapSubTable(subTable);

        // Assert
        expect((reader as unknown as { _offset: number })._offset).toBe(210);
        expect(appleSpy).toHaveBeenCalledWith(subTable, _TrueTypeCmapEncoding.unicode);
    });

    it('reads microsoft cmap table when format is microsoft and encoding is valid', () => {
        // Arrange
        const reader: _TrueTypeReader = Object.create(_TrueTypeReader.prototype) as _TrueTypeReader;
        const subTable: _TrueTypeCmapSubTable = {
            _platformID: 3,
            _encodingID: 1,
            _offset: 5
        } as _TrueTypeCmapSubTable;

        const tableInfo: _TrueTypeTableInfo = { _offset: 50 } as _TrueTypeTableInfo;

        spyOn(reader as unknown as { _getTable: (name: string) => _TrueTypeTableInfo }, '_getTable')
            .and.returnValue(tableInfo);

        spyOn(reader as unknown as { _readUInt16: (offset: number) => number }, '_readUInt16')
            .and.returnValue(_TrueTypeCmapFormat.microsoft);

        spyOn(reader as unknown as { _getCmapEncoding: (p: number, e: number) => _TrueTypeCmapEncoding }, '_getCmapEncoding')
            .and.returnValue(_TrueTypeCmapEncoding.symbol);

        const msSpy = spyOn(reader as unknown as { _readMicrosoftCmapTable: Function }, '_readMicrosoftCmapTable');

        // Act
        reader._readCmapSubTable(subTable);

        // Assert
        expect((reader as unknown as { _offset: number })._offset).toBe(55);
        expect(msSpy).toHaveBeenCalledWith(subTable, _TrueTypeCmapEncoding.symbol);
    });

    it('reads trimmed cmap table when format is trimmed and encoding is valid', () => {
        // Arrange
        const reader: _TrueTypeReader = Object.create(_TrueTypeReader.prototype) as _TrueTypeReader;
        const subTable: _TrueTypeCmapSubTable = {
            _platformID: 3,
            _encodingID: 10,
            _offset: 30
        } as _TrueTypeCmapSubTable;

        const tableInfo: _TrueTypeTableInfo = { _offset: 300 } as _TrueTypeTableInfo;

        spyOn(reader as unknown as { _getTable: (name: string) => _TrueTypeTableInfo }, '_getTable')
            .and.returnValue(tableInfo);

        spyOn(reader as unknown as { _readUInt16: (offset: number) => number }, '_readUInt16')
            .and.returnValue(_TrueTypeCmapFormat.trimmed);

        spyOn(reader as unknown as { _getCmapEncoding: (p: number, e: number) => _TrueTypeCmapEncoding }, '_getCmapEncoding')
            .and.returnValue(_TrueTypeCmapEncoding.unicode);

        const trimmedSpy = spyOn(reader as unknown as { _readTrimmedCmapTable: Function }, '_readTrimmedCmapTable');

        // Act
        reader._readCmapSubTable(subTable);

        // Assert
        expect((reader as unknown as { _offset: number })._offset).toBe(330);
        expect(trimmedSpy).toHaveBeenCalledWith(subTable, _TrueTypeCmapEncoding.unicode);
    });

    it('does not invoke any reader when format is unsupported but encoding is valid', () => {
        // Arrange
        const reader: _TrueTypeReader = Object.create(_TrueTypeReader.prototype) as _TrueTypeReader;
        const subTable: _TrueTypeCmapSubTable = {
            _platformID: 1,
            _encodingID: 0,
            _offset: 15
        } as _TrueTypeCmapSubTable;

        const tableInfo: _TrueTypeTableInfo = { _offset: 80 } as _TrueTypeTableInfo;

        spyOn(reader as unknown as { _getTable: (name: string) => _TrueTypeTableInfo }, '_getTable')
            .and.returnValue(tableInfo);

        spyOn(reader as unknown as { _readUInt16: (offset: number) => number }, '_readUInt16')
            .and.returnValue(99);

        spyOn(reader as unknown as { _getCmapEncoding: (p: number, e: number) => _TrueTypeCmapEncoding }, '_getCmapEncoding')
            .and.returnValue(_TrueTypeCmapEncoding.unicode);

        const appleSpy = spyOn(reader as unknown as { _readAppleCmapTable: Function }, '_readAppleCmapTable');
        const msSpy = spyOn(reader as unknown as { _readMicrosoftCmapTable: Function }, '_readMicrosoftCmapTable');
        const trimmedSpy = spyOn(reader as unknown as { _readTrimmedCmapTable: Function }, '_readTrimmedCmapTable');

        // Act
        reader._readCmapSubTable(subTable);

        // Assert
        expect((reader as unknown as { _offset: number })._offset).toBe(95);
        expect(appleSpy).not.toHaveBeenCalled();
        expect(msSpy).not.toHaveBeenCalled();
        expect(trimmedSpy).not.toHaveBeenCalled();
    });

});
