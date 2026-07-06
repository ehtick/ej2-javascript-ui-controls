import { _TrueTypeCmapEncoding } from "../src/pdf/core/enumerator";
import { _TrueTypeCompositeGlyphFlag } from "../src/pdf/core/enumerator";
import { _TrueTypeGlyph } from "../src/pdf/core/fonts/ttf-reader";
import { _StringTokenizer } from "../src/pdf/core/fonts/string-layouter";
import { _TrueTypeReader } from "../src/pdf/core/fonts/ttf-reader";

describe('User Interaction', () => {    
    it('ttf-reader _fixOffsets adjusts table offsets when shift is non-zero', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        const originalA = { _offset: 50 };
        const originalB = { _offset: 80 };
        (reader._tableDirectory as any) = {
            keys: () => ['a', 'b'],
            getValue: (k: string) => (k === 'a' ? originalA : originalB)
        };
        reader._lowestPosition = 100; // minOffset (50) - lowestPosition (100) = -50 -> shift !== 0

        // Act
        (_TrueTypeReader as any).prototype._fixOffsets.call(reader);

        // Assert: a new dictionary was created and offsets adjusted by -shift (i.e. increased by 50)
        expect(typeof (reader._tableDirectory as any).getValue === 'function').toBeTruthy();
        const adjustedA = (reader._tableDirectory as any).getValue('a');
        const adjustedB = (reader._tableDirectory as any).getValue('b');
        expect(adjustedA._offset).toBe(100);
        expect(adjustedB._offset).toBe(130);
    });

    it('ttf-reader _fixOffsets leaves tableDirectory unchanged when shift is zero', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        const original = { _offset: 200 };
        const tableObj = { marker: true, keys: () => ['x'], getValue: (k: string) => original };
        (reader._tableDirectory as any) = tableObj;
        reader._lowestPosition = 200; // minOffset equals lowestPosition -> shift === 0

        // Act
        (_TrueTypeReader as any).prototype._fixOffsets.call(reader);

        // Assert: original object still present (no replacement) and marker preserved
        expect(reader._tableDirectory as any).toBe(tableObj);
        expect((reader._tableDirectory as any).marker).toBeTruthy();
    });

    it('ttf-reader _check returns 0x10000 for TrueType version', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._offset = 0;
        reader._readInt32 = (_: any) => 0x10000;

        // Act
        const v = (_TrueTypeReader as any).prototype._check.call(reader);

        // Assert
        expect(v).toBe(0x10000);
        expect(reader._isMacTtf).toBeFalsy();
        expect(reader._isOpenType).toBeFalsy();
    });

    it('ttf-reader _check sets _isMacTtf when mac signature present', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._offset = 0;
        reader._readInt32 = (_: any) => 0x74727565;

        // Act
        const v = (_TrueTypeReader as any).prototype._check.call(reader);

        // Assert
        expect(v).toBe(0x74727565);
        expect(reader._isMacTtf).toBeTruthy();
    });

    it('ttf-reader _check marks openType when signature 0x4f54544f', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._offset = 0;
        reader._readInt32 = (_: any) => 0x4f54544f;

        // Act
        const v = (_TrueTypeReader as any).prototype._check.call(reader);

        // Assert
        expect(v).toBe(0x4f54544f);
        expect(reader._isOpenType).toBeTruthy();
    });

    it('ttf-reader _check throws when non-standard version and fontTag is not ttcf', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._offset = 0;
        reader._readInt32 = (_: any) => 0x12345678;
        reader._readString = (_: any) => 'ABCD';

        // Act / Assert
        expect(() => (_TrueTypeReader as any).prototype._check.call(reader)).toThrowError('Can not read TTF font data');
    });

    it('ttf-reader _check throws when ttcf present but ttcIdentificationNumber negative', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._offset = 0;
        const ints = [0x11223344, -5];
        reader._readInt32 = (_: any) => ints.shift() as number;
        reader._readString = (_: any) => 'ttcf';

        // Act / Assert
        expect(() => (_TrueTypeReader as any).prototype._check.call(reader)).toThrowError('Can not read TTF font data');
    });

    it('ttf-reader _check handles TTC header and returns new version', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._offset = 0;
        const ints = [0x0badcafe, 1, 10, 0x4f54544f];
        reader._readInt32 = (_: any) => ints.shift() as number;
        reader._readString = (_: any) => 'ttcf';

        // Act
        const v = (_TrueTypeReader as any).prototype._check.call(reader);

        // Assert
        expect(v).toBe(0x4f54544f);
        expect(reader._isFont).toBeTruthy();
        expect(reader._isOpenType).toBeTruthy();
    });

    it('ttf-reader _readTrimmedCmapTable populates macintosh and updates max index', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 0 });
        const ints = [1, 0, 0, 100, 2, 5, 7]; // format, length, version, firstCode, entryCount, glyphIndex1, glyphIndex2
        reader._offset = 0;
        reader._readUInt16 = (_: any) => ints.shift() as number;
        reader._getWidth = (idx: number) => idx + 10;
        reader._macintoshDictionary = { store: {}, setValue: function (k: any, v: any) { this.store[k] = v; }, getValue: function (k: any) { return this.store[k]; } };
        const added: any[] = [];
        reader._addGlyph = (g: any, enc: any) => { added.push(g); };
        reader._maxMacIndex = -1;
        const subTable: any = { _offset: 0 };
        const encoding = 0;

        // Act
        (_TrueTypeReader as any).prototype._readTrimmedCmapTable.call(reader, subTable, encoding);

        // Assert
        expect(Object.keys((reader._macintoshDictionary as any).store).length).toBe(2);
        const g0 = (reader._macintoshDictionary as any).store[0];
        expect(g0._index).toBe(5);
        expect(g0._width).toBe(15);
        expect(g0._charCode).toBe(100);
        const g1 = (reader._macintoshDictionary as any).store[1];
        expect(g1._index).toBe(7);
        expect(g1._width).toBe(17);
        expect(g1._charCode).toBe(101);
        expect(reader._maxMacIndex).toBe(1);
        expect(added.length).toBe(2);
    });

    it('ttf-reader _readTrimmedCmapTable handles zero entries without modification', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 0 });
        const ints = [0, 0, 0, 200, 0]; // format, length, version, firstCode, entryCount=0
        reader._offset = 0;
        reader._readUInt16 = (_: any) => ints.shift() as number;
        reader._getWidth = (_: number) => { throw new Error('should not be called'); };
        reader._macintoshDictionary = { store: {}, setValue: function (k: any, v: any) { this.store[k] = v; }, getValue: function (k: any) { return this.store[k]; } };
        const added: any[] = [];
        reader._addGlyph = (g: any, enc: any) => { added.push(g); };
        reader._maxMacIndex = -5;
        const subTable: any = { _offset: 0 };
        const encoding = 0;

        // Act
        (_TrueTypeReader as any).prototype._readTrimmedCmapTable.call(reader, subTable, encoding);

        // Assert
        expect(Object.keys((reader._macintoshDictionary as any).store).length).toBe(0);
        expect(added.length).toBe(0);
        expect(reader._maxMacIndex).toBe(-5);
    });

    it('ttf-reader _getGlyph returns macintosh glyph when metrics._isSymbol and macintosh contains key', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: true };
        const macGlyph = { name: 'mac-glyph' };
        let containsCalled = false;
        let getCalled = false;
        reader._internalMacintoshGlyphs = {
            containsKey: (k: any) => { containsCalled = true; return k === 65; },
            getValue: (k: any) => { getCalled = true; return macGlyph; }
        };
        reader._getDefaultGlyph = () => ({ default: true });

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, 65);

        // Assert
        expect(containsCalled).toBeTruthy();
        expect(getCalled).toBeTruthy();
        expect(res).toBe(macGlyph);
    });

    it('ttf-reader _getGlyph falls back to default glyph when macintosh does not contain key', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: true };
        reader._internalMacintoshGlyphs = {
            containsKey: (_: any) => false,
            getValue: (_: any) => { throw new Error('should not be called'); }
        };
        const defaultGlyph = { default: true };
        reader._getDefaultGlyph = () => defaultGlyph;

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, 66);

        // Assert
        expect(res).toBe(defaultGlyph);
    });

    it('ttf-reader _getGlyph sets _isFontPresent true when microsoft contains key for char input', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: false };
        let containsCalled = false;
        const mappedGlyph = { _index: 10, _width: 20, _charCode: 65 };
        reader._microsoftDictionary = {
            containsKey: (k: number) => { containsCalled = true; return k === 65; },
            getValue: (k: number) => mappedGlyph
        };
        reader._getDefaultGlyph = () => ({ defaultGlyph: true });

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, 'A');

        // Assert
        expect(containsCalled).toBeTruthy();
        expect(res).toBe(mappedGlyph);
        expect(reader._isFontPresent).toBeTruthy();
    });

    it('ttf-reader _getGlyph sets _isFontPresent false and returns default glyph when microsoft missing for char input', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: false };
        reader._microsoftDictionary = {
            containsKey: (_: number) => false,
            getValue: (_: number) => { throw new Error('should not be called'); }
        };
        const defaultGlyph = { defaultGlyph: true };
        reader._getDefaultGlyph = () => defaultGlyph;

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, 'B');

        // Assert
        expect(res).toBe(defaultGlyph);
        expect(reader._isFontPresent).toBeFalsy();
    });

    it('ttf-reader _getGlyph returns a new TrueTypeGlyph for whitespace when no mapping exists', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: false };
        reader._microsoftDictionary = { containsKey: (_: number) => false };
        const defaultGlyph = { defaultGlyph: true };
        reader._getDefaultGlyph = () => defaultGlyph;
        const ws = _StringTokenizer._whiteSpace;

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, ws);

        // Assert
        expect(res).not.toBe(defaultGlyph);
        expect(typeof res === 'object').toBeTruthy();
    });

    it('ttf-reader _getGlyph returns mapped glyph for whitespace when mapping exists', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: false };
        const mappedGlyph = { _index: 32, _width: 5, _charCode: 32 };
        reader._microsoftDictionary = {
            containsKey: (k: number) => k === _StringTokenizer._whiteSpace.charCodeAt(0),
            getValue: (k: number) => mappedGlyph
        };
        const defaultGlyph = { defaultGlyph: true };
        reader._getDefaultGlyph = () => defaultGlyph;
        const ws = _StringTokenizer._whiteSpace;

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, ws);

        // Assert
        expect(res).toBe(mappedGlyph);
    });

    it('ttf-reader _readFontDictionary creates new Dictionary when _tableDirectory is null', () => {
        // Arrange: simulate minimal reads and avoid _fixOffsets by marking as font
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._tableDirectory = null;
        reader._isFont = true; // skip _fixOffsets
        reader._offset = 0;
        reader._check = () => { return; };
        reader._readInt16 = (_: any) => 0; // table count = 0 and subsequent header reads

        // Act
        (_TrueTypeReader as any).prototype._readFontDictionary.call(reader);

        // Assert
        expect(reader._tableDirectory).not.toBeNull();
        expect(typeof (reader._tableDirectory as any).setValue === 'function').toBeTruthy();
    });

    it('ttf-reader _readMicrosoftCmapTable uses macintosh collection when encoding is symbol', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 0 });
        reader._offset = 0;
        // sequence of uint16 reads: format, length, version, segCountX2, searchRange, entrySelector, rangeShift, reservedPad
        const u16: number[] = [4, 26, 0, 2, 0, 0, 0, 0];
        reader._readUInt16 = (_: any) => u16.shift() as number;
        // provide ushort arrays in call order: endCount, startCount, idDelta, idRangeOffset, glyphID
        let uShortCalls = 0;
        reader._readUShortArray = (len: number) => {
            const seq = uShortCalls++;
            if (seq === 0) { return [65]; } // endCount
            if (seq === 1) { return [65]; } // startCount
            if (seq === 2) { return [0]; } // idDelta
            if (seq === 3) { return [0]; } // idRangeOffset -> 0 path
            if (seq === 4) { return [10]; } // glyphID
            return [];
        };
        reader._getWidth = (idx: number) => 15;
        const recorded: any[] = [];
        const macObj: any = { setValue: (k: any, v: any) => { recorded.push({ k, v }); } };
        // ensure macintosh getter returns our spy object
        Object.defineProperty(reader, 'macintosh', { get: () => macObj });
        reader._addGlyph = (_: any, __: any) => { return; };

        const subTable: any = { _offset: 0 };

        // Act
        (_TrueTypeReader as any).prototype._readMicrosoftCmapTable.call(reader, subTable, (_TrueTypeCmapEncoding as any).symbol);

        // Assert: macintosh.setValue should have been called for code 65
        expect(recorded.length).toBeGreaterThan(0);
        expect(recorded[0].k).toBe(65);
        expect(recorded[0].v._index).toBe(65);
        expect(recorded[0].v._width).toBe(15);
    });

    it('ttf-reader _readMicrosoftCmapTable continues when computed index >= glyphID.length', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 0 });
        reader._offset = 0;
        // format, length chosen so glyphID length becomes 0, segCountX2 = 2
        const u16: number[] = [4, 24, 0, 2, 0, 0, 0, 0];
        reader._readUInt16 = (_: any) => u16.shift() as number;
        let uShortCalls = 0;
        reader._readUShortArray = (len: number) => {
            const seq = uShortCalls++;
            if (seq === 0) { return [65]; } // endCount
            if (seq === 1) { return [65]; } // startCount
            if (seq === 2) { return [0]; } // idDelta
            if (seq === 3) { return [10]; } // idRangeOffset non-zero -> else branch
            if (seq === 4) { return []; } // glyphID empty
            return [];
        };
        const recorded: any[] = [];
        const macObj: any = { setValue: (k: any, v: any) => { recorded.push({ k, v }); } };
        Object.defineProperty(reader, 'macintosh', { get: () => macObj });
        reader._addGlyph = (_: any, __: any) => { return; };

        const subTable: any = { _offset: 0 };

        // Act
        (_TrueTypeReader as any).prototype._readMicrosoftCmapTable.call(reader, subTable, (_TrueTypeCmapEncoding as any).symbol);

        // Assert: no glyphs should have been added because index >= glyphID.length triggers continue
        expect(recorded.length).toBe(0);
    });

    it('ttf-reader _readMicrosoftCmapTable trims high byte for symbol encoding (0xf000 mask)', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 0 });
        reader._offset = 0;
        // format, length, segCountX2 etc. choose values similar to previous working case
        const u16: number[] = [4, 26, 0, 2, 0, 0, 0, 0];
        reader._readUInt16 = (_: any) => u16.shift() as number;
        let uShortCalls = 0;
        // use a code with high byte 0xf000 (e.g., 0xf041)
        const bigCode = 0xf041; // high byte 0xf000, low byte 0x41
        reader._readUShortArray = (len: number) => {
            const seq = uShortCalls++;
            if (seq === 0) { return [bigCode]; } // endCount
            if (seq === 1) { return [bigCode]; } // startCount
            if (seq === 2) { return [0]; } // idDelta
            if (seq === 3) { return [0]; } // idRangeOffset -> 0 path
            if (seq === 4) { return [10]; } // glyphID
            return [];
        };
        reader._getWidth = (idx: number) => 7;
        const recorded: any[] = [];
        const macObj: any = { setValue: (k: any, v: any) => { recorded.push({ k, v }); } };
        Object.defineProperty(reader, 'macintosh', { get: () => macObj });
        reader._addGlyph = (_: any, __: any) => { return; };

        const subTable: any = { _offset: 0 };

        // Act
        (_TrueTypeReader as any).prototype._readMicrosoftCmapTable.call(reader, subTable, (_TrueTypeCmapEncoding as any).symbol);

        // Assert: recorded key should be low byte (0x41 = 65)
        expect(recorded.length).toBeGreaterThan(0);
        expect(recorded[0].k).toBe(0x41);
        expect(recorded[0].v._width).toBe(7);
    });

    it('ttf-reader _readCompactFontFormatTable returns bytes when CFF table present and offset not null', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 10, _length: 3 });
        // provide backing font data so _readBytes can read bytes at offset
        reader._fontData = new Uint8Array([0,0,0,0,0,0,0,0,0,0,9,8,7]);
        reader._offset = 10;

        // Act
        const out = (_TrueTypeReader as any).prototype._readCompactFontFormatTable.call(reader);

        // Assert
        expect(Array.isArray(out)).toBeTruthy();
        expect(out.length).toBe(3);
        expect(out[0]).toBe(9);
    });

    it('ttf-reader _readCompactFontFormatTable returns empty when CFF table offset is null', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: null as number | null });
        // Act
        const out = (_TrueTypeReader as any).prototype._readCompactFontFormatTable.call(reader);
        // Assert
        expect(Array.isArray(out)).toBeTruthy();
        expect(out.length).toBe(0);
    });

    it('ttf-reader _getWidth uses last element when index out of range', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._width = [11, 22, 33];

        // Act
        const w = (_TrueTypeReader as any).prototype._getWidth.call(reader, 9999);

        // Assert: should return last width (33)
        expect(w).toBe(33);
    });

    it('ttf-reader _getCmapEncoding returns symbol for Microsoft platform encoding 0', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);

        // Act
        const enc = (_TrueTypeReader as any).prototype._getCmapEncoding.call(reader, 3, 0);

        // Assert
        expect(enc).toBe((_TrueTypeCmapEncoding as any).symbol);
    });

    it('ttf-reader _updateWidth handles filled, empty and unknown (space fallback) glyphs', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        // Provide metrics flag and simple getString so updateWidth runs without fontData
        reader._metrics = { _isSymbol: false };
        reader._getString = (byteToProcess: number[], start: number, length: number) => String.fromCharCode(byteToProcess[0]);
        // Make a small count by mocking internal behavior: _updateWidth will iterate 0..255 but we only assert a few indices
        reader._getGlyph = (ch: string) => {
            if (ch === String.fromCharCode(0)) { return { _empty: false, _width: 10 }; }
            if (ch === String.fromCharCode(1)) { return { _empty: true, _width: 0 }; }
            if (ch === _StringTokenizer._whiteSpace) { return { _empty: false, _width: 7 }; }
            return { _empty: true, _width: 0 }; // unknown for other codes -> will fallback to space
        };

        // Act
        const bytes = (_TrueTypeReader as any).prototype._updateWidth.call(reader);

        // Assert: index 0 is filled, index 1 is empty (0), index 2 was unknown so should fall back to space width
        expect(bytes[0]).toBe(10);
        expect(bytes[1]).toBe(7);
        expect(bytes[2]).toBe(7);
    });

    it('ttf-reader _updateWidth symbol branch loops and maps glyphs correctly', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: true };
        reader._getGlyph = (ch: string) => {
            const code = ch.charCodeAt(0);
            if (code === 0) { return { _empty: false, _width: 3 }; }
            if (code === 1) { return { _empty: true, _width: 0 }; }
            return { _empty: false, _width: 9 };
        };

        // Act
        const bytes = (_TrueTypeReader as any).prototype._updateWidth.call(reader);

        // Assert: symbol branch should call _getGlyph for char codes
        expect(bytes[0]).toBe(3);
        expect(bytes[1]).toBe(0);
        expect(bytes[2]).toBe(9);
    });

    it('ttf-reader _updateWidth handles unknown text (empty _getString) and falls back to space glyph', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: false };
        // _getString returns empty for code 2 to exercise unknown branch
        reader._getString = (byteToProcess: number[], start: number, length: number) => {
            if (byteToProcess[0] === 2) { return ''; }
            return String.fromCharCode(byteToProcess[0]);
        };
        reader._getGlyph = (ch: string) => {
            if (ch === '?') { return { _empty: true, _width: 0 }; }
            if (ch === _StringTokenizer._whiteSpace) { return { _empty: false, _width: 13 }; }
            return { _empty: false, _width: 5 };
        };

        // Act
        const bytes = (_TrueTypeReader as any).prototype._updateWidth.call(reader);

        // Assert: normal mapped codes get width 5, unknown (i==2) falls back to space width 13
        expect(bytes[0]).toBe(5);
        expect(bytes[1]).toBe(5);
        expect(bytes[2]).toBe(13);
    });

    it('ttf-reader _processCompositeGlyph accounts for WeHaveScale skipBytes', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 0 });
        const loca: any = { _offsets: [0, 10] };
        // _readInt16: numberOfContours negative then zeros for bounds
        const i16 = [-1, 0, 0, 0, 0];
        reader._readInt16 = (_: any) => i16.shift() as number;
        // flags/glyphIndex sequence: first iteration has MoreComponents + Arg1And2AreWords + WeHaveScale
        const flags1 = (_TrueTypeCompositeGlyphFlag as any).MoreComponents | (_TrueTypeCompositeGlyphFlag as any).Arg1And2AreWords | (_TrueTypeCompositeGlyphFlag as any).WeHaveScale;
        const seq = [flags1, 5, 0, 6];
        reader._readUInt16 = (_: any) => seq.shift() as number;
        const stored: any = {};
        const glyphChars: any = { containsKey: (k: any) => !!stored[k], setValue: (k: any, v: any) => { stored[k] = v; } };
        reader._offset = 0;

        // Act
        (_TrueTypeReader as any).prototype._processCompositeGlyph.call(reader, glyphChars, 0, loca);

        // Assert: glyph indices 5 and 6 were added and offset advanced by computed skipBytes (6)
        expect(stored[5]).toBeDefined();
        expect(stored[6]).toBeDefined();
        expect(reader._offset).toBe(6);
    });

    it('ttf-reader _processCompositeGlyph accounts for WeHaveAnXyScale skipBytes', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 0 });
        const loca: any = { _offsets: [0, 10] };
        const i16 = [-1, 0, 0, 0, 0];
        reader._readInt16 = (_: any) => i16.shift() as number;
        const flags1 = (_TrueTypeCompositeGlyphFlag as any).MoreComponents | (_TrueTypeCompositeGlyphFlag as any).Arg1And2AreWords | (_TrueTypeCompositeGlyphFlag as any).WeHaveAnXyScale;
        const seq = [flags1, 7, 0, 8];
        reader._readUInt16 = (_: any) => seq.shift() as number;
        const stored: any = {};
        const glyphChars: any = { containsKey: (k: any) => !!stored[k], setValue: (k: any, v: any) => { stored[k] = v; } };
        reader._offset = 0;

        // Act
        (_TrueTypeReader as any).prototype._processCompositeGlyph.call(reader, glyphChars, 0, loca);

        // Assert: skipBytes = 4 + 4 = 8
        expect(stored[7]).toBeDefined();
        expect(stored[8]).toBeDefined();
        expect(reader._offset).toBe(8);
    });

    it('ttf-reader _processCompositeGlyph accounts for WeHaveTwoByTwo skipBytes', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _offset: 0 });
        const loca: any = { _offsets: [0, 10] };
        const i16 = [-1, 0, 0, 0, 0];
        reader._readInt16 = (_: any) => i16.shift() as number;
        const flags1 = (_TrueTypeCompositeGlyphFlag as any).MoreComponents | (_TrueTypeCompositeGlyphFlag as any).Arg1And2AreWords | (_TrueTypeCompositeGlyphFlag as any).WeHaveTwoByTwo;
        const seq = [flags1, 9, 0, 10];
        reader._readUInt16 = (_: any) => seq.shift() as number;
        const stored: any = {};
        const glyphChars: any = { containsKey: (k: any) => !!stored[k], setValue: (k: any, v: any) => { stored[k] = v; } };
        reader._offset = 0;

        // Act
        (_TrueTypeReader as any).prototype._processCompositeGlyph.call(reader, glyphChars, 0, loca);

        // Assert: skipBytes = 4 + 8 = 12
        expect(stored[9]).toBeDefined();
        expect(stored[10]).toBeDefined();
        expect(reader._offset).toBe(12);
    });

    it('ttf-reader _writeCheckSums returns early for empty table entries', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _empty: true, _length: 0, _checksum: 0 });
        reader._tableNames = ['cvt '];
        const writer: any = { _writeString: (_: any) => { }, _writeInt: (_: any) => { }, _writeUInt: (_: any) => { } };

        // Act / Assert: should not throw and should execute the callback return path
        expect(() => (_TrueTypeReader as any).prototype._writeCheckSums.call(reader, writer, 1, [1], [1], 1, 1)).not.toThrow();
    });

    it('ttf-reader _writeGlyphs returns early for empty table entries', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._getTable = (_: string) => ({ _empty: true, _length: 0, _offset: 0 });
        reader._tableNames = ['cvt '];
        const writer: any = { _writeBytes: (_: any) => { } };

        // Act / Assert: should not throw when early-return inside forEach is hit
        expect(() => (_TrueTypeReader as any).prototype._writeGlyphs.call(reader, writer, [1], [1])).not.toThrow();
    });

    it('ttf-reader _getGlyph handles macintosh symbol path with maxMacIndex non-zero', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: true };
        reader._maxMacIndex = 2; // non-zero path
        const macObj: any = { containsKey: (_: any) => true, getValue: (_: any) => ({ name: 'mac' }) };
        Object.defineProperty(reader, 'macintosh', { get: () => macObj });

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, 'A');

        // Assert
        expect(res).toBeDefined();
        expect(reader._isFontPresent).toBeTruthy();
    });

    it('ttf-reader _getGlyph handles macintosh symbol path with maxMacIndex zero and 0xf000 mask', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: true };
        reader._maxMacIndex = 0; // zero path
        const low = 0x41;
        const char = String.fromCharCode(0xf000 | low);
        const macObj: any = { containsKey: (k: any) => k === low, getValue: (k: any) => ({ name: 'mac-low' }) };
        Object.defineProperty(reader, 'macintosh', { get: () => macObj });

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, char);

        // Assert
        expect(res).toBeDefined();
        expect(reader._isFontPresent).toBeTruthy();
    });

    it('ttf-reader _getDefaultGlyph returns _getGlyph(whitespace) result', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        const expected = { defaultGlyph: true };
        reader._getGlyph = (_: any) => expected;

        // Act
        const res = (_TrueTypeReader as any).prototype._getDefaultGlyph.call(reader);

        // Assert
        expect(res).toBe(expected);
    });

    it('ttf-reader _TrueTypeGlyph._empty returns true when index,width,charCode all zero', () => {
        // Arrange
        const g = new (_TrueTypeGlyph as any)();
        g._index = 0;
        g._width = 0;
        g._charCode = 0;

        // Act / Assert
        expect(g._empty).toBeTruthy();
    });

    it('ttf-reader _getGlyph uses _isMacFont when metrics not symbol and _isMacFont true', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: false };
        reader._isMacFont = true;
        // ensure microsoft branch is skipped by returning null
        Object.defineProperty(reader, '_microsoft', { get: () => null });
        // ensure maxMacIndex is zero so masking path is used
        reader._maxMacIndex = 0;
        const macObj: any = { containsKey: (k: any) => k === 65, getValue: (k: any) => ({ name: 'mac-A' }) };
        Object.defineProperty(reader, 'macintosh', { get: () => macObj });

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, 'A');

        // Assert
        expect(res).toBeDefined();
        expect(res.name).toBe('mac-A');
        expect(reader._isFontPresent).toBeTruthy();
    });

    it('ttf-reader _getGlyph wraps code by _maxMacIndex when non-zero', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        reader._metrics = { _isSymbol: true };
        reader._maxMacIndex = 1; // will modulus by 2
        const macObj: any = { containsKey: (k: any) => k === 1, getValue: (k: any) => ({ name: 'mac-1' }) };
        Object.defineProperty(reader, 'macintosh', { get: () => macObj });
        const ch = String.fromCharCode(67); // code 67 % 2 = 1

        // Act
        const res = (_TrueTypeReader as any).prototype._getGlyph.call(reader, ch);

        // Assert
        expect(res).toBeDefined();
        expect(res.name).toBe('mac-1');
    });

    it('ttf-reader _getCharacterWidth falls back to default glyph and returns 0 when default empty', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        // make _getGlyph return an empty glyph
        const emptyGlyph = new (_TrueTypeGlyph as any)();
        emptyGlyph._index = 0; emptyGlyph._width = 0; emptyGlyph._charCode = 0;
        reader._getGlyph = (_: any) => emptyGlyph;
        // default glyph also empty
        const defaultEmpty = new (_TrueTypeGlyph as any)();
        defaultEmpty._index = 0; defaultEmpty._width = 0; defaultEmpty._charCode = 0;
        reader._getDefaultGlyph = () => defaultEmpty;

        // Act
        const w = (_TrueTypeReader as any).prototype._getCharacterWidth.call(reader, 'x');

        // Assert
        expect(w).toBe(0);
    });

    it('ttf-reader _getCharacterWidth falls back to default glyph and returns default width when non-empty', () => {
        // Arrange
        const reader: any = Object.create((_TrueTypeReader as any).prototype);
        const emptyGlyph = new (_TrueTypeGlyph as any)();
        emptyGlyph._index = 0; emptyGlyph._width = 0; emptyGlyph._charCode = 0;
        reader._getGlyph = (_: any) => emptyGlyph;
        const defaultGlyph = new (_TrueTypeGlyph as any)();
        defaultGlyph._index = 5; defaultGlyph._width = 12; defaultGlyph._charCode = 32;
        reader._getDefaultGlyph = () => defaultGlyph;

        // Act
        const w = (_TrueTypeReader as any).prototype._getCharacterWidth.call(reader, 'y');

        // Assert
        expect(w).toBe(12);
    });
});