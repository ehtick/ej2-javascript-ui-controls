import { _CompositeGlyph, _Contour, _GlyphHeader, _PdfGlyph, _PdfGlyphTable, _SimpleGlyph } from "../../src/pdf-data-extract/core/text-extraction/glyph";

describe('glyph.ts reachable full coverage', () => {
 

    function createCompositeGlyphDataView(): DataView {
        const buffer: ArrayBuffer = new ArrayBuffer(40);
        const view: DataView = new DataView(buffer);

        // _GlyphHeader -> composite glyph
        view.setInt16(0, -1);
        view.setInt16(2, 0);
        view.setInt16(4, 0);
        view.setInt16(6, 100);
        view.setInt16(8, 100);

        // component 1
        // flags = moreComponents | xyScale = 96
        view.setUint16(10, 96);
        view.setUint16(12, 5);
        view.setUint8(14, 1);
        view.setUint8(15, 2);
        view.setUint16(16, 10);
        view.setUint16(18, 20);

        // component 2
        // flags = words | argsAreXYValues | twoByTwo | instructions = 387
        view.setUint16(20, 387);
        view.setUint16(22, 6);
        view.setInt16(24, -5);
        view.setInt16(26, 7);
        view.setUint16(28, 1);
        view.setUint16(30, 2);
        view.setUint16(32, 3);
        view.setUint16(34, 4);
        view.setUint16(36, 2);
        view.setUint8(38, 9);
        view.setUint8(39, 10);

        return view;
    }

function createSimpleGlyphDataView(): DataView {
   
  
    const buffer: ArrayBuffer = new ArrayBuffer(30);
          const view: DataView = new DataView(buffer);
    view.setUint16(12, 3);

    // instructions
    view.setUint16(14, 2);
    view.setUint8(16, 9);
    view.setUint8(17, 10);

    // flags
    // point0 = repeat + onCurve + xShort + yShort + xSame + ySame + overlap
    // point1 repeated by repeat count
    // point2 = int16 x / int16 y
    // point3 = x same / y same
    view.setUint8(18, 127);
    view.setUint8(19, 1);
    view.setUint8(20, 0);
    view.setUint8(21, 48);

    // x coordinates payload
    view.setUint8(22, 5);
    view.setUint8(23, 3);
    view.setInt16(24, 300);

    // y coordinates payload
    view.setUint8(26, 7);
    view.setUint8(27, 2);
    view.setInt16(28, -309);

    return view;
}
   

    // endPtsOfContours

    function createShortLocaTableForTwoGlyphs(): DataView {
        const buffer: ArrayBuffer = new ArrayBuffer(6);
        const view: DataView = new DataView(buffer);

        // glyph0 = 0
        // glyph1 = 0 (empty glyph)
        // glyph2 = 15 => byte offset = 30
        view.setUint16(0, 0);
        view.setUint16(2, 0);
        view.setUint16(4, 15);

        return view;
    }

    function createLongLocaTableForTwoGlyphs(): DataView {
        const buffer: ArrayBuffer = new ArrayBuffer(12);
        const view: DataView = new DataView(buffer);

        // glyph0 = 0
        // glyph1 = 0 (empty glyph)
        // glyph2 = 30
        view.setUint32(0, 0);
        view.setUint32(4, 0);
        view.setUint32(8, 30);

        return view;
    }

    it('should cover _GlyphHeader constructor branches, parse, getSize, write and scale', () => {
        // Arrange
        const defaultHeader: _GlyphHeader = new _GlyphHeader();
        const parsedSource: DataView = createSimpleGlyphDataView();

        // Act
        const parsedTuple: [number, _GlyphHeader] = defaultHeader.parse(0, parsedSource);
        const read: number = parsedTuple[0];
        const parsedHeader: _GlyphHeader = parsedTuple[1];

        const size: number = parsedHeader.getSize();

        const writeBuffer: DataView = new DataView(new ArrayBuffer(10));
        const written: number = parsedHeader.write(0, writeBuffer);

        const scaleHeader: _GlyphHeader = new _GlyphHeader({
            numberOfContours: 1,
            xMin: 0,
            yMin: 0,
            xMax: 100,
            yMax: 50
        });
        scaleHeader.scale(50, 2);

        // Assert
        expect(defaultHeader.numberOfContours).toBe(0);
        expect(defaultHeader.xMin).toBe(0);
        expect(defaultHeader.yMin).toBe(0);
        expect(defaultHeader.xMax).toBe(0);
        expect(defaultHeader.yMax).toBe(0);

        expect(read).toBe(10);
        expect(parsedHeader.numberOfContours).toBe(0);
        expect(parsedHeader.xMin).toBe(0);
        expect(parsedHeader.yMin).toBe(0);
        expect(parsedHeader.xMax).toBe(0);
        expect(parsedHeader.yMax).toBe(0);

        expect(size).toBe(10);
        expect(written).toBe(10);
        expect(writeBuffer.getInt16(0)).toBe(0);
        expect(writeBuffer.getInt16(2)).toBe(0);
        expect(writeBuffer.getInt16(4)).toBe(0);
        expect(writeBuffer.getInt16(6)).toBe(0);
        expect(writeBuffer.getInt16(8)).toBe(0);

        expect(scaleHeader.xMin).toBe(-50);
        expect(scaleHeader.xMax).toBe(150);
    });

    it('should cover _Contour constructor and _SimpleGlyph constructor branches', () => {
        // Arrange

        // Act
        const contour: _Contour = new _Contour({
            flags: [1, 64],
            xCoordinates: [10, 20],
            yCoordinates: [30, 40]
        });

        const defaultSimple: _SimpleGlyph = new _SimpleGlyph();
        const paramSimple: _SimpleGlyph = new _SimpleGlyph({
            contours: [
                new _Contour({
                    flags: [1],
                    xCoordinates: [5],
                    yCoordinates: [6]
                })
            ],
            instructions: new Uint8Array([1, 2])
        });

        // Assert
        expect(contour.flags).toEqual([1, 64]);
        expect(contour.xCoordinates).toEqual([10, 20]);
        expect(contour.yCoordinates).toEqual([30, 40]);

        expect(defaultSimple.contours.length).toBe(0);
        expect(paramSimple.contours.length).toBe(1);
        expect(paramSimple.instructions.length).toBe(2);
    });

    it('should cover _SimpleGlyph parse, getSize, write and scale branches', () => {
        // Arrange
        const data: DataView = createSimpleGlyphDataView();
        const simpleGlyphParser: _SimpleGlyph = new _SimpleGlyph();

        // Act
        const simple: _SimpleGlyph = simpleGlyphParser.parse(10, data, 2);

        const size: number = simple.getSize();

        const writeBuffer: DataView = new DataView(new ArrayBuffer(size + 20));
        const written: number = simple.write(0, writeBuffer);

        simple.scale(100, 2);

        // Assert
        expect(simple.contours.length).toBe(2);
        expect(simple.instructions.length).toBe(2);
        expect(simple.instructions[0]).toBe(9);
        expect(simple.instructions[1]).toBe(10);

        expect(simple.contours[0].xCoordinates[0]).toBe(Math.round(100 + (5 - 100) * 2));
        expect(simple.contours[0].xCoordinates[1]).toBeUndefined();
        expect(simple.contours[1].xCoordinates[0]).toBe(-84);
        expect(simple.contours[1].xCoordinates[1]).toBe(Math.round(100 + (308 - 100) * 2));

        expect(simple.contours[0].yCoordinates[0]).toBe(7);
        expect(simple.contours[0].yCoordinates[1]).toBeUndefined();
        expect(simple.contours[1].yCoordinates[0]).toBe(9);
        expect(simple.contours[1].yCoordinates[1]).toBe(-300);

        expect(size).toBeGreaterThan(0);
        expect(written).toBe(size);
    });

    it('should cover _SimpleGlyph write without instructions and scale continue branch', () => {
        // Arrange
        const simple: _SimpleGlyph = new _SimpleGlyph({
            contours: [
                new _Contour({
                    flags: [],
                    xCoordinates: [],
                    yCoordinates: []
                }),
                new _Contour({
                    flags: [1, 1, 1],
                    xCoordinates: [10, 10, 400],
                    yCoordinates: [20, -5, -5]
                })
            ],
            instructions: new Uint8Array([])
        });

        const size: number = simple.getSize();
        const writeBuffer: DataView = new DataView(new ArrayBuffer(size + 20));

        // Act
        const written: number = simple.write(0, writeBuffer);
        simple.scale(0, 2);

        // Assert
        expect(size).toBeGreaterThan(0);
        expect(written).toBe(size);
        expect(simple.contours[0].xCoordinates.length).toBe(0);
        expect(simple.contours[1].xCoordinates[0]).toBe(20);
        expect(simple.contours[1].xCoordinates[1]).toBe(20);
        expect(simple.contours[1].xCoordinates[2]).toBe(800);
    });

    it('should cover _CompositeGlyph constructor default branch, parse words scale instructions branch, getSize and write', () => {
        // Arrange
        const compositeDefault: _CompositeGlyph = new _CompositeGlyph();

        const parseBuffer: ArrayBuffer = new ArrayBuffer(14);
        const parseView: DataView = new DataView(parseBuffer);

        // flags = words | argsAreXYValues | scale | instructions = 267
        parseView.setUint16(0, 267);
        parseView.setUint16(2, 12);
        parseView.setInt16(4, -200);
        parseView.setInt16(6, 300);
        parseView.setUint16(8, 500);
        parseView.setUint16(10, 2);
        parseView.setUint8(12, 9);
        parseView.setUint8(13, 10);

        const parser: _CompositeGlyph = new _CompositeGlyph();

        // Act
        const parsedTuple: [number, _CompositeGlyph] = parser.parse(0, parseView);
        const read: number = parsedTuple[0];
        const parsed: _CompositeGlyph = parsedTuple[1];

        const size: number = parsed.getSize();
        const writeBuffer: DataView = new DataView(new ArrayBuffer(size + 10));
        const written: number = parsed.write(0, writeBuffer);

        // Assert
        expect(compositeDefault.flags).toBe(0);
        expect(compositeDefault.glyphIndex).toBe(0);
        expect(compositeDefault.argument1).toBe(0);
        expect(compositeDefault.argument2).toBe(0);
        expect(compositeDefault.transform.length).toBe(0);
        expect(compositeDefault.instructions).toBeNull();

        expect(read).toBe(14);
        expect(parsed.flags).toBe(267);
        expect(parsed.glyphIndex).toBe(12);
        expect(parsed.argument1).toBe(-200);
        expect(parsed.argument2).toBe(300);
        expect(parsed.transform).toEqual([500]);
        expect(parsed.instructions).not.toBeNull();
        expect((parsed.instructions as Uint8Array).length).toBe(2);

        expect(size).toBeGreaterThan(0);
        expect(written).toBe(12);
    });

    it('should cover _CompositeGlyph parse byte xyScale branch and byte args write branch', () => {
        // Arrange
        const parseBuffer: ArrayBuffer = new ArrayBuffer(10);
        const parseView: DataView = new DataView(parseBuffer);

        // flags = moreComponents | xyScale = 96
        parseView.setUint16(0, 96);
        parseView.setUint16(2, 5);
        parseView.setUint8(4, 1);
        parseView.setUint8(5, 2);
        parseView.setUint16(6, 10);
        parseView.setUint16(8, 20);

        const parser: _CompositeGlyph = new _CompositeGlyph();

        const writable: _CompositeGlyph = new _CompositeGlyph({
            flags: 0,
            glyphIndex: 7,
            argument1: 10,
            argument2: 20,
            transform: [],
            instructions: null
        });

        // Act
        const parsedTuple: [number, _CompositeGlyph] = parser.parse(0, parseView);
        const parsed: _CompositeGlyph = parsedTuple[1];

        const size: number = writable.getSize();
        const writeBuffer: DataView = new DataView(new ArrayBuffer(size + 10));
        const written: number = writable.write(0, writeBuffer);

        // Assert
        expect(parsed.flags).toBe(96);
        expect(parsed.glyphIndex).toBe(5);
        expect(parsed.argument1).toBe(1);
        expect(parsed.argument2).toBe(2);
        expect(parsed.transform).toEqual([10, 20]);

        expect(size).toBeGreaterThan(0);
        expect(written).toBe(size);
        expect(writeBuffer.getUint8(4)).toBe(10);
        expect(writeBuffer.getUint8(5)).toBe(20);
    });

    it('should cover _CompositeGlyph parse twoByTwo branch and uint16 write branch', () => {
        // Arrange
        const parseBuffer: ArrayBuffer = new ArrayBuffer(14);
        const parseView: DataView = new DataView(parseBuffer);

        // flags = twoByTwo = 128
        parseView.setUint16(0, 128);
        parseView.setUint16(2, 9);
        parseView.setUint8(4, 3);
        parseView.setUint8(5, 4);
        parseView.setUint16(6, 1);
        parseView.setUint16(8, 2);
        parseView.setUint16(10, 3);
        parseView.setUint16(12, 4);

        const parser: _CompositeGlyph = new _CompositeGlyph();

        const writable: _CompositeGlyph = new _CompositeGlyph({
            flags: 0,
            glyphIndex: 11,
            argument1: 300,
            argument2: 400,
            transform: [],
            instructions: null
        });

        // Act
        const parsedTuple: [number, _CompositeGlyph] = parser.parse(0, parseView);
        const parsed: _CompositeGlyph = parsedTuple[1];

        const size: number = writable.getSize();
        const writeBuffer: DataView = new DataView(new ArrayBuffer(size + 10));
        const written: number = writable.write(0, writeBuffer);

        // Assert
        expect(parsed.flags).toBe(128);
        expect(parsed.glyphIndex).toBe(9);
        expect(parsed.argument1).toBe(3);
        expect(parsed.argument2).toBe(4);
        expect(parsed.transform).toEqual([1, 2, 3, 4]);

        expect(size).toBeGreaterThan(0);
        expect(written).toBe(size);
        expect(writeBuffer.getUint16(4)).toBe(300);
        expect(writeBuffer.getUint16(6)).toBe(400);
    });

    it('should cover _CompositeGlyph write with instructions flag and empty instructions branch', () => {
        // Arrange
        const writable: _CompositeGlyph = new _CompositeGlyph({
            flags: 256,
            glyphIndex: 2,
            argument1: 1,
            argument2: 2,
            transform: [],
            instructions: null
        });

        const size: number = writable.getSize();
        const writeBuffer: DataView = new DataView(new ArrayBuffer(size + 10));

        // Act
        const written: number = writable.write(0, writeBuffer);

        // Assert
        expect(size).toBeGreaterThan(0);
        expect(written).toBe(size);
        expect(writeBuffer.getUint16(0)).toBe(256);
        expect(writeBuffer.getUint16(2)).toBe(2);
        expect(writeBuffer.getUint16(6)).toBe(0);
    });

    it('should cover _PdfGlyph constructor default branch, simple parse path, _getSize, _write and _scale', () => {
        // Arrange
        const emptyGlyph: _PdfGlyph = new _PdfGlyph();
        const simpleData: DataView = createSimpleGlyphDataView();
        const glyphParser: _PdfGlyph = new _PdfGlyph();

        // Act
        const parsedSimpleGlyph: _PdfGlyph = glyphParser.parse(0, simpleData);

        const emptySize: number = emptyGlyph._getSize();
        const parsedSize: number = parsedSimpleGlyph._getSize();

        const emptyWriteBuffer: DataView = new DataView(new ArrayBuffer(10));
        const emptyWritten: number = emptyGlyph._write(0, emptyWriteBuffer);

        const parsedWriteBuffer: DataView = new DataView(new ArrayBuffer(parsedSize + 20));
        const parsedWritten: number = parsedSimpleGlyph._write(0, parsedWriteBuffer);

        emptyGlyph._scale(2);
        parsedSimpleGlyph._scale(2);

        // Assert
        expect(emptyGlyph.header).toBeNull();
        expect(emptyGlyph.simple).toBeNull();
        expect(emptyGlyph.composites).toBeNull();

        expect(parsedSimpleGlyph.header).not.toBeNull();
        expect(parsedSimpleGlyph.simple).not.toBeNull();
        expect(parsedSimpleGlyph.composites).toBeUndefined();

        expect(emptySize).toBe(0);
        expect(parsedSize).toBeGreaterThan(0);

        expect(emptyWritten).toBe(0);
        expect(parsedWritten).toBe(parsedSize);
    });

    it('should cover _PdfGlyph composite parse path, composite _getSize, _write and _scale header only branch', () => {
        // Arrange
        const compositeData: DataView = createCompositeGlyphDataView();
        const glyphParser: _PdfGlyph = new _PdfGlyph();

        // Act
        const parsedCompositeGlyph: _PdfGlyph = glyphParser.parse(0, compositeData);
        const size: number = parsedCompositeGlyph._getSize();
        const writeBuffer: DataView = new DataView(new ArrayBuffer(size + 20));
        const written: number = parsedCompositeGlyph._write(0, writeBuffer);

        const beforeXMin: number = (parsedCompositeGlyph.header as _GlyphHeader).xMin;
        const beforeXMax: number = (parsedCompositeGlyph.header as _GlyphHeader).xMax;
        parsedCompositeGlyph._scale(2);

        // Assert
        expect(parsedCompositeGlyph.header).not.toBeNull();
        expect(parsedCompositeGlyph.simple).toBeUndefined();
        expect(parsedCompositeGlyph.composites).not.toBeNull();
        expect((parsedCompositeGlyph.composites as _CompositeGlyph[]).length).toBe(2);

        expect(size).toBeGreaterThan(0);
        expect(written).toBe(26);

        expect((parsedCompositeGlyph.header as _GlyphHeader).xMin).not.toBe(beforeXMin);
        expect((parsedCompositeGlyph.header as _GlyphHeader).xMax).not.toBe(beforeXMax);
    });

    it('should cover _PdfGlyphTable constructor short loca path, empty glyph branch, _getSize, _write short loca and scale', () => {
        // Arrange
        const glyfTable: DataView = createSimpleGlyphDataView();
        const locaTable: DataView = createShortLocaTableForTwoGlyphs();

        const table: _PdfGlyphTable = new _PdfGlyphTable({
            glyfTable,
            isGlyphLocationsLong: false,
            locaTable,
            numGlyphs: 2
        });

        // Act
        const size: number = table._getSize();
        const written = table._write();
        table.scale([1, 2]);

        // Assert
        expect(table.glyphs.length).toBe(2);
        expect(table.glyphs[0].header).toBeUndefined();
        expect(table.glyphs[1].header).not.toBeNull();

        expect(size).toBeGreaterThan(0);
        expect(written.isLocationLong).toBeFalsy();
        expect(written.loca.length).toBe(6);
        expect(written.data.length).toBeGreaterThan(0);
    });

    it('should cover _PdfGlyphTable constructor long loca path', () => {
        // Arrange
        const glyfTable: DataView = createSimpleGlyphDataView();
        const locaTable: DataView = createLongLocaTableForTwoGlyphs();

        // Act
        const table: _PdfGlyphTable = new _PdfGlyphTable({
            glyfTable,
            isGlyphLocationsLong: true,
            locaTable,
            numGlyphs: 2
        });

        // Assert
        expect(table.glyphs.length).toBe(2);
        expect(table.glyphs[0].header).toBeUndefined();
        expect(table.glyphs[1].header).not.toBeNull();
    });

    it('should cover _PdfGlyphTable _write long loca branch safely', () => {
        // Arrange
        const table: _PdfGlyphTable = Object.create(_PdfGlyphTable.prototype) as _PdfGlyphTable;
        table.glyphs = [
            {
                _getSize: function (): number {
                    return 0x20000;
                },
                _write: function (): number {
                    return 0x20000;
                },
                _scale: function (): void {
                    // no-op
                }
            } as unknown as _PdfGlyph
        ];

        // Act
        const written = table._write();

        // Assert
        expect(written.isLocationLong).toBeTruthy();
        expect(written.loca.length).toBe(8);
        expect(written.data.length).toBe(0x20000);
    });
});



describe('_CompositeGlyph.parse highlighted argument branches', function () {
    it('should cover _words branch with non-XY uint16 arguments', function () {
        // Arrange
        var buffer = new ArrayBuffer(8);
        var view = new DataView(buffer);

        // flags = _words only = 1
        // this should hit:
        // argument1 = data.getUint16(pos);
        // argument2 = data.getUint16(pos + 2);
        view.setUint16(0, 1);
        view.setUint16(2, 25);
        view.setUint16(4, 300);
        view.setUint16(6, 400);

        var parser = new _CompositeGlyph();

        // Act
        var parsedTuple = parser.parse(0, view);
        var read = parsedTuple[0];
        var parsed = parsedTuple[1];

        // Assert
        expect(read).toBe(8);
        expect(parsed.flags).toBe(0);
        expect(parsed.glyphIndex).toBe(25);
        expect(parsed.argument1).toBe(300);
        expect(parsed.argument2).toBe(400);
        expect(parsed.transform.length).toBe(0);
        expect(parsed.instructions).toBeNull();
    });

    it('should cover non-_words branch with XY int8 arguments', function () {
        // Arrange
        var buffer = new ArrayBuffer(6);
        var view = new DataView(buffer);

        // flags = _argsAreXYValues only = 2
        // this should hit:
        // argument1 = data.getInt8(pos);
        // argument2 = data.getInt8(pos + 1);
        view.setUint16(0, 2);
        view.setUint16(2, 26);
        view.setInt8(4, -5);
        view.setInt8(5, 7);

        var parser = new _CompositeGlyph();

        // Act
        var parsedTuple = parser.parse(0, view);
        var read = parsedTuple[0];
        var parsed = parsedTuple[1];

        // Assert
        expect(read).toBe(6);
        expect(parsed.flags).toBe(2);
        expect(parsed.glyphIndex).toBe(26);
        expect(parsed.argument1).toBe(-5);
        expect(parsed.argument2).toBe(7);
        expect(parsed.transform.length).toBe(0);
        expect(parsed.instructions).toBeNull();
    });
});


      
        
  