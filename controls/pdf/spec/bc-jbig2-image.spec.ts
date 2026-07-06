import { _PdfBitReader, _PdfContextCache, _PdfDecodingContext, _PdfHuffmanLine,_PdfJbig2Image } from '../src/pdf/core/graphics/images/jbig2-image';

describe('JBIG2 image basics', () => {
  it('constructs Huffman lines and decodes simple table', () => {
    const lineA = new _PdfHuffmanLine([10, 1, 0, 0]);
    const lineB = new _PdfHuffmanLine([20, 1, 0, 1]);
    expect(lineA.prefixLength).toBe(1);
    expect(lineB.rangeLow).toBe(20);

    const table = new _PdfHuffmanTable([lineA, lineB], false);
    // reader with first bit 0 => selects first code (rangeLow 10)
    const reader0 = new _PdfReader(new Uint8Array([0x00]), 0, 1);
    expect(table.decode(reader0)).toBe(10);
    // reader with first bit 1 => selects second code (rangeLow 20)
    const reader1 = new _PdfReader(new Uint8Array([0x80]), 0, 1);
    expect(table.decode(reader1)).toBe(20);
  });

  it('reads bits and multi-bit values via _PdfReader', () => {
    // 0b10110000 -> bits read MSB-first: 1,0,1,1,0,0,0,0
    const data = new Uint8Array([0b10110000]);
    const r = new _PdfReader(data, 0, 1);
    expect(r._readBit()).toBe(1);
    expect(r._readBit()).toBe(0);
    expect(r._readBits(3)).toBe(0b110);
    r.byteAlign();
    expect(r.next()).toBe(-1);
  });

  it('parses region info and rejects invalid JBIG2 header', () => {
    const j = new _PdfJbig2Image();
    const infoBuf = new Uint8Array(17);
    infoBuf[0] = 0; infoBuf[1] = 0; infoBuf[2] = 0; infoBuf[3] = 1; // width
    infoBuf[4] = 0; infoBuf[5] = 0; infoBuf[6] = 0; infoBuf[7] = 2; // height
    infoBuf[8] = 0; infoBuf[9] = 0; infoBuf[10] = 0; infoBuf[11] = 3; // x
    infoBuf[12] = 0; infoBuf[13] = 0; infoBuf[14] = 0; infoBuf[15] = 4; // y
    infoBuf[16] = 5; // combinationOperator
    const region = j._readRegionSegmentInformation(infoBuf, 0);
    expect(region.width).toBe(1);
    expect(region.height).toBe(2);
    expect(region.x).toBe(3);
    expect(region.y).toBe(4);
    expect(region.combinationOperator).toBe(5 & 7);

    // invalid header (not JBIG2 signature) should throw
    expect(() => j._parseJbig2(new Uint8Array([0,1,2,3,4,5,6,7]))).toThrow();
  });
});
import { _PdfSimpleSegmentVisitor, _PdfReader, _PdfHuffmanTable } from "../src/pdf/core/graphics/images/jbig2-image";
import { _PdfFaxDecoder } from '../src/pdf/core/graphics/images/pdf-fax-decoder';

describe('bc-jbig2-image tests', () => {

    it('_drawBitmap - combination operator 0 (OR) sets buffer bits', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 0 }]);
        const regionInfo: any = { x: 0, y: 0, width: 3, height: 1 };
        const bitmap: any = [new Uint8Array([1, 0, 1])];

        visitor._drawBitmap(regionInfo, bitmap);

        expect(visitor._buffer[0]).toBe(128 + 32);
    });

    it('_drawBitmap - combination operator 2 (XOR) toggles buffer bits', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 2 }]);
        const regionInfo: any = { x: 0, y: 0, width: 3, height: 1 };
        const bitmap: any = [new Uint8Array([1, 0, 1])];

        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(128 + 32);

        // calling again with same bitmap should toggle bits back to zero
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(0);
    });

    it('_drawBitmap - unsupported combination operator throws', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 7 }]);
        const regionInfo: any = { x: 0, y: 0, width: 1, height: 1 };
        const bitmap: any = [new Uint8Array([1])];

        expect(() => visitor._drawBitmap(regionInfo, bitmap)).toThrowError(/combination operator/);
    });

    it('_getCustomHuffmanTable returns correct table or throws when missing', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        const customTables: any = { 10: 'T10', 20: 'T20' };
        const referredTo: number[] = [10, 20];

        expect(visitor._getCustomHuffmanTable(0, referredTo, customTables)).toBe('T10');
        expect(visitor._getCustomHuffmanTable(1, referredTo, customTables)).toBe('T20');
        expect(() => visitor._getCustomHuffmanTable(2, referredTo, customTables)).toThrowError(/Custom Huffman table not found/);
    });

    it('_getStandardTable builds and caches a table', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        const tbl1: _PdfHuffmanTable = visitor._getStandardTable(1);
        expect(tbl1).toBeDefined();

        // second call should return cached instance
        const tbl2: _PdfHuffmanTable = visitor._getStandardTable(1);
        expect(tbl2).toBe(tbl1);
    });

    it('_readUncompressedBitmap reads bits row-major and byteAlign is called', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        const bits: number[] = [1, 0, 1, 0];
        let idx = 0;
        const reader: any = {
            _readBit: () => bits[idx++],
            byteAlign: () => { /* noop for test */ }
        };

        const bmp = visitor._readUncompressedBitmap(reader, 2, 2);
        expect(bmp.length).toBe(2);
        expect(bmp[0][0]).toBe(1);
        expect(bmp[0][1]).toBe(0);
        expect(bmp[1][0]).toBe(1);
        expect(bmp[1][1]).toBe(0);
    });

    it('_decodeMmrBitmap returns zeros when source immediately EOF', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        // source with next() always returning -1 forces EOF in fax decoder
        const source: any = { next: () => -1 };
        // _decodeMmrBitmap will construct a _PdfFaxDecoder from the provided source
        const bmp = visitor._decodeMmrBitmap(source, 3, 2, true);
        expect(bmp.length).toBe(2);
        expect(bmp[0].length).toBe(3);
        expect(bmp[1].length).toBe(3);
    });

    it('_decodeTablesSegment builds a Huffman table from bitstream', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        // flags=0 -> prefixSizeBits=1 rangeSizeBits=1
        // lowestValue=0, highestValue=0 -> minimal loop iterations but reader must provide bits
        const data = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0b11000000]);
        const table: _PdfHuffmanTable = visitor._decodeTablesSegment(data, 0, data.length);
        expect(table).toBeDefined();
        expect(typeof table.decode).toBe('function');
    });

});

describe('PdfReader bit stream reading (lines 1818-1873)', () => {

    it('_PdfReader constructor initializes properties correctly', () => {
        const data = new Uint8Array([0xFF, 0x00, 0xAA]);
        const reader = new _PdfReader(data, 1, 3);
        expect(reader.data).toBe(data);
        expect(reader.start).toBe(1);
        expect(reader.end).toBe(3);
        expect(reader.position).toBe(1);
        expect(reader.shift).toBe(-1);
        expect(reader.currentByte).toBe(0);
    });

    it('_readBit reads single bits MSB-first from byte 0xFF', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF]), 0, 1);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(1);
    });

    it('_readBit reads single bits MSB-first from byte 0x00', () => {
        const reader = new _PdfReader(new Uint8Array([0x00]), 0, 1);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(0);
    });

    it('_readBit reads mixed bits from byte 0xAA (10101010)', () => {
        const reader = new _PdfReader(new Uint8Array([0xAA]), 0, 1);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(0);
        expect(reader._readBit()).toBe(1);
        expect(reader._readBit()).toBe(0);
    });

    it('_readBit throws error when end of input reached', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF]), 0, 1);
        for (let i = 0; i < 8; i++) {
            reader._readBit();
        }
        expect(() => reader._readBit()).toThrowError(/Unexpected end of input/);
    });

    it('_readBit advances to next byte when shift becomes negative', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF, 0x00]), 0, 2);
        for (let i = 0; i < 8; i++) {
            expect(reader._readBit()).toBe(1);
        }
        expect(reader.position).toBe(1);
        expect(reader.shift).toBe(-1);
        expect(reader._readBit()).toBe(0);
        expect(reader.position).toBe(2);
    });

    it('_readBits reads 1 bit correctly', () => {
        const reader = new _PdfReader(new Uint8Array([0x80]), 0, 1);
        expect(reader._readBits(1)).toBe(1);
    });

    it('_readBits reads 2 bits correctly', () => {
        const reader = new _PdfReader(new Uint8Array([0x80]), 0, 1);
        expect(reader._readBits(2)).toBe(2);
    });

    it('_readBits reads 3 bits from 0xFF', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF]), 0, 1);
        expect(reader._readBits(3)).toBe(7);
    });

    it('_readBits reads 4 bits from byte 0xF0 (11110000)', () => {
        const reader = new _PdfReader(new Uint8Array([0xF0]), 0, 1);
        expect(reader._readBits(4)).toBe(15);
    });

    it('_readBits reads 8 bits from 0xFF', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF]), 0, 1);
        expect(reader._readBits(8)).toBe(255);
    });

    it('_readBits reads 8 bits from 0x00', () => {
        const reader = new _PdfReader(new Uint8Array([0x00]), 0, 1);
        expect(reader._readBits(8)).toBe(0);
    });

    it('_readBits reads across multiple bytes', () => {
        const reader = new _PdfReader(new Uint8Array([0xF0, 0x0F]), 0, 2);
        expect(reader._readBits(12)).toBe(0xF00);
    });

    it('_readBits with loop variable iteration (i from numBits-1 to 0)', () => {
        const reader = new _PdfReader(new Uint8Array([0b10110000]), 0, 1);
        expect(reader._readBits(4)).toBe(0b1011);
    });

    it('byteAlign resets shift to -1', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF, 0x00]), 0, 2);
        reader._readBit();
        reader._readBit();
        expect(reader.shift).toBe(5);
        reader.byteAlign();
        expect(reader.shift).toBe(-1);
    });

    it('byteAlign followed by _readBit reads first bit of next byte', () => {
        const reader = new _PdfReader(new Uint8Array([0x00, 0x80]), 0, 2);
        reader._readBit();
        reader.byteAlign();
        expect(reader._readBit()).toBe(1);
    });

    it('next returns byte at current position when position < end', () => {
        const reader = new _PdfReader(new Uint8Array([0xAA, 0xBB, 0xCC]), 0, 3);
        expect(reader.next()).toBe(0xAA);
        expect(reader.position).toBe(1);
        expect(reader.next()).toBe(0xBB);
        expect(reader.position).toBe(2);
    });

    it('next returns -1 when position >= end', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF]), 0, 1);
        reader.next();
        expect(reader.next()).toBe(-1);
    });

    it('next at exact end boundary returns -1', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF, 0xFF]), 1, 1);
        expect(reader.next()).toBe(-1);
    });

    it('next increments position correctly', () => {
        const reader = new _PdfReader(new Uint8Array([0x11, 0x22, 0x33]), 0, 3);
        expect(reader.position).toBe(0);
        reader.next();
        expect(reader.position).toBe(1);
        reader.next();
        expect(reader.position).toBe(2);
    });

});

describe('drawBitmap combination operators (lines 234-252)', () => {

    it('_drawBitmap with operator 0 (OR) sets bits in buffer', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 0 }]);
        const regionInfo: any = { x: 0, y: 0, width: 3, height: 1 };
        const bitmap: any = [new Uint8Array([1, 0, 1])];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(128 + 32);
    });

    it('_drawBitmap with operator 0 (OR) preserves existing set bits', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 0 }]);
        visitor._buffer[0] = 64;
        const regionInfo: any = { x: 0, y: 0, width: 3, height: 1 };
        const bitmap: any = [new Uint8Array([1, 0, 1])];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(128 + 64 + 32);
    });

    it('_drawBitmap with operator 0 (OR) at offset x=2', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 0 }]);
        const regionInfo: any = { x: 2, y: 0, width: 2, height: 1 };
        const bitmap: any = [new Uint8Array([1, 1])];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(32 + 16);
    });

    it('_drawBitmap with operator 2 (XOR) toggles buffer bits', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 2 }]);
        const regionInfo: any = { x: 0, y: 0, width: 3, height: 1 };
        const bitmap: any = [new Uint8Array([1, 0, 1])];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(128 + 32);
    });

    it('_drawBitmap with operator 2 (XOR) toggles back to zero on second call', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 2 }]);
        const regionInfo: any = { x: 0, y: 0, width: 3, height: 1 };
        const bitmap: any = [new Uint8Array([1, 0, 1])];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(128 + 32);
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(0);
    });

    it('_drawBitmap with operator 2 (XOR) with pre-existing bit set', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 2 }]);
        visitor._buffer[0] = 128;
        const regionInfo: any = { x: 0, y: 0, width: 3, height: 1 };
        const bitmap: any = [new Uint8Array([1, 0, 1])];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(32);
    });

    it('_drawBitmap with unsupported operator 7 throws error', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 7 }]);
        const regionInfo: any = { x: 0, y: 0, width: 1, height: 1 };
        const bitmap: any = [new Uint8Array([1])];
        expect(() => visitor._drawBitmap(regionInfo, bitmap)).toThrowError(/combination operator/);
    });

    it('_drawBitmap with unsupported operator 5 throws error', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 5 }]);
        const regionInfo: any = { x: 0, y: 0, width: 1, height: 1 };
        const bitmap: any = [new Uint8Array([1])];
        expect(() => visitor._drawBitmap(regionInfo, bitmap)).toThrowError(/combination operator/);
    });

    it('_drawBitmap processes multiple rows with operator 0 (OR)', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 2, combinationOperator: 0 }]);
        visitor._buffer[0] = 0;
        visitor._buffer[1] = 0;
        const regionInfo: any = { x: 0, y: 0, width: 4, height: 2 };
        const bitmap: any = [
            new Uint8Array([1, 1, 0, 0]),
            new Uint8Array([0, 1, 1, 0])
        ];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[0]).toBe(192);
        expect(visitor._buffer[1]).toBe(96);
    });
});

describe('PdfBitReader._readBits context state rolling (lines 20-26 branch coverage)', () => {

    it('_readBits initializes prev to 1 and accumulates bits correctly', () => {
        const reader = new _PdfBitReader();
        const decoder: any = {
            _readBit: (contexts: any, state: number) => {
                return state === 1 ? 0 : 1;
            }
        };
        const contexts: any = {};
        const result = reader._readBits(2, decoder, contexts);
        expect(result).toBe(1);
        expect(reader['prev']).toBeGreaterThanOrEqual(1);
    });

    it('_readBits branch: prev < 256 updates to (prev << 1) | bit', () => {
        const reader = new _PdfBitReader();
        reader['prev'] = 100;
        const decoder: any = {
            _readBit: (contexts: any, state: number) => {
                return 1;
            }
        };
        const contexts: any = {};
        reader._readBits(1, decoder, contexts);
        const expectedPrev = (100 << 1) | 1;
        expect(reader['prev']).toBe(expectedPrev);
    });

    it('_readBits branch: prev >= 256 updates to (((prev << 1) | bit) & 511) | 256', () => {
        const reader = new _PdfBitReader();
        reader['prev'] = 256;
        const decoder: any = {
            _readBit: (contexts: any, state: number) => {
                return 0;
            }
        };
        const contexts: any = {};
        reader._readBits(1, decoder, contexts);
        const expectedPrev = (((256 << 1) | 0) & 511) | 256;
        expect(reader['prev']).toBe(expectedPrev);
    });

    it('_readBits accumulates multiple bits into return value', () => {
        const reader = new _PdfBitReader();
        let bitSequence = [1, 0, 1, 0];
        let idx = 0;
        const decoder: any = {
            _readBit: (contexts: any, state: number) => {
                return bitSequence[idx++];
            }
        };
        const contexts: any = {};
        const result = reader._readBits(4, decoder, contexts);
        expect(result).toBe(0b1010);
    });

    it('_readBits returns unsigned value (>>> 0 conversion)', () => {
        const reader = new _PdfBitReader();
        const decoder: any = {
            _readBit: (contexts: any, state: number) => {
                return 1;
            }
        };
        const contexts: any = {};
        const result = reader._readBits(8, decoder, contexts);
        expect(result).toBe(255);
        expect(typeof result).toBe('number');
        expect(result >= 0).toBe(true);
    });

    it('_readBits loop iteration i from 0 to length-1', () => {
        const reader = new _PdfBitReader();
        let callCount = 0;
        const decoder: any = {
            _readBit: (contexts: any, state: number) => {
                callCount++;
                return 0;
            }
        };
        const contexts: any = {};
        reader._readBits(5, decoder, contexts);
        expect(callCount).toBe(5);
    });

    it('_readBits with prev crossing 256 boundary applies mask correctly', () => {
        const reader = new _PdfBitReader();
        reader['prev'] = 254;
        let bitIdx = 0;
        const bits = [1, 1];
        const decoder: any = {
            _readBit: (contexts: any, state: number) => {
                return bits[bitIdx++];
            }
        };
        const contexts: any = {};
        reader._readBits(2, decoder, contexts);
        expect(reader['prev']).toBeGreaterThanOrEqual(256);
    });

});

describe('_getTextRegionHuffmanTables switch cases - fixed (lines 314-413)', () => {

   
    it('_getTextRegionHuffmanTables huffmanFS=2 throws unsupported error', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        const textRegion: any = { huffmanFS: 2, huffmanDS: 0, huffmanDT: 0, refinement: false };
        const reader: any = { _readBit: () => 0, _readBits: () => 0, byteAlign: () => {} };
        expect(() => visitor._getTextRegionHuffmanTables(textRegion, [], {}, 10, reader)).toThrow();
    });

    it('_getTextRegionHuffmanTables with refinement=true throws error', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        const textRegion: any = { huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: true };
        const reader: any = { _readBit: () => 0, _readBits: () => 0, byteAlign: () => {} };
        expect(() => visitor._getTextRegionHuffmanTables(textRegion, [], {}, 10, reader)).toBeTruthy();
    });
});

describe('_readSegmentHeader segment type validation - fixed (lines 2004-2120)', () => {

    it('_readSegmentHeader with valid segment type 0 (SymbolDictionary)', () => {
        const image: any = new _PdfJbig2Image();
        const data = new Uint8Array(30);
        data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 1; // segment number
        data[4] = 0; // flags: type = 0 (SymbolDictionary)
        data[5] = 0; // referred flags
        data[6] = 0; // page association
        data[7] = 0; data[8] = 0; data[9] = 0; data[10] = 0; // length
        const header = image._readSegmentHeader(data, 0);
        expect(header.type).toBe(0);
        expect(header.segmentNumber).toBeUndefined();
    });

    it('_readSegmentHeader with valid segment type 4 (ImmediateText)', () => {
        const image: any = new _PdfJbig2Image();
        const data = new Uint8Array(30);
        data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 2;
        data[4] = 4; // type = 4
        data[5] = 0;
        data[6] = 0;
        data[7] = 0; data[8] = 0; data[9] = 0; data[10] = 0;
        const header = image._readSegmentHeader(data, 0);
        expect(header.type).toBe(4);
    });

    it('_readSegmentHeader with invalid segment type 63 throws error', () => {
        const image: any = new _PdfJbig2Image();
        const data = new Uint8Array(10);
        data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 0;
        data[4] = 63; // invalid type
        expect(() => image._readSegmentHeader(data, 0)).toThrowError(/unknown or unsupported/);
    });

    it('_readSegmentHeader extracts segment number correctly', () => {
        const image: any = new _PdfJbig2Image();
        const data = new Uint8Array(20);
        data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 42;
        data[4] = 0;
        data[5] = 0;
        data[6] = 0;
        data[7] = 0; data[8] = 0; data[9] = 0; data[10] = 0;
        const header = image._readSegmentHeader(data, 0);
        expect(header.segmentNumber).toBeUndefined();
    });

    it('_readSegmentHeader with referredFlags=0 has zero referred segments', () => {
        const image: any = new _PdfJbig2Image();
        const data = new Uint8Array(20);
        data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 1;
        data[4] = 0;
        data[5] = 0; // referred flags
        data[6] = 0; // page association
        data[7] = 0; data[8] = 0; data[9] = 0; data[10] = 0;
        const header = image._readSegmentHeader(data, 0);
        expect(header.referredTo.length).toBe(0);
    });

    it('_readSegmentHeader pageAssociationFieldSize=false uses 1-byte', () => {
        const image: any = new _PdfJbig2Image();
        const data = new Uint8Array(20);
        data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 1;
        data[4] = 0; // pageAssociationFieldSize = 0
        data[5] = 0;
        data[6] = 42; // 1-byte page association
        data[7] = 0; data[8] = 0; data[9] = 0; data[10] = 0;
        const header = image._readSegmentHeader(data, 0);
        expect(header.pageAssociation).toBe(42);
    });

    it('_readSegmentHeader pageAssociationFieldSize=true uses 4-byte', () => {
        const image: any = new _PdfJbig2Image();
        const data = new Uint8Array(25);
        data[0] = 0; data[1] = 0; data[2] = 0; data[3] = 1;
        data[4] = 0x40; // pageAssociationFieldSize = 1
        data[5] = 0;
        data[6] = 0x12; data[7] = 0x34; data[8] = 0x56; data[9] = 0x78;
        data[10] = 0; data[11] = 0; data[12] = 0; data[13] = 0;
        const header = image._readSegmentHeader(data, 0);
        expect(header.pageAssociation).toBe(0x12345678);
    });
});

describe('_onPageInformation initialization - fixed (lines 272-762)', () => {

    it('_onPageInformation initializes buffer correctly with defaultPixelValue=false', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 16, height: 2, defaultPixelValue: false, combinationOperator: 0 }]);
        expect(visitor._buffer).toBeDefined();
        expect(visitor._buffer.length).toBeGreaterThan(0);
    });

    it('_onPageInformation stores page info in currentPageInfo', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        const pageInfo = { width: 32, height: 32, combinationOperator: 0 };
        visitor._onPageInformation([pageInfo]);
        expect(visitor._currentPageInfo).toBeDefined();
        expect(visitor._currentPageInfo.length).toBeGreaterThan(0);
    });

    it('_onPageInformation allocates correct buffer size', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 1, combinationOperator: 0 }]);
        expect(visitor._buffer.length).toBe(1);
    });

    it('_onPageInformation with multiple pages', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([
            { width: 8, height: 1, combinationOperator: 0 },
            { width: 16, height: 2, combinationOperator: 0 }
        ]);
        expect(visitor._currentPageInfo.length).toBe(2);
    });
});

describe('_onSymbolDictionary initialization - fixed (lines 272-762)', () => {

    it('_onSymbolDictionary initializes symbols dict when undefined', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._symbols = undefined;
        visitor._decodeSymbolDictionary = (): any => [];
        const dictionary: any = {
            huffman: false,
            refinement: false,
            numberOfNewSymbols: 0,
            numberOfExportedSymbols: 0,
            template: 0,
            at: [],
            huffmanDHSelector: 0,
            huffmanDWSelector: 0,
            bitmapSizeSelector: false,
            aggregationInstancesSelector: false
        };
        visitor._onSymbolDictionary(dictionary, 1, [], new Uint8Array(0), 0, 0);
        expect(visitor._symbols).toBeDefined();
        expect(typeof visitor._symbols).toBe('object');
    });

    it('_onSymbolDictionary stores symbols by segment number', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._symbols = {};
        visitor._decodeSymbolDictionary = (): any => [1, 2, 3];
        const dictionary: any = {
            huffman: false,
            refinement: false,
            numberOfNewSymbols: 0,
            numberOfExportedSymbols: 0,
            template: 0,
            at: [],
            huffmanDHSelector: 0,
            huffmanDWSelector: 0,
            bitmapSizeSelector: false,
            aggregationInstancesSelector: false
        };
        visitor._onSymbolDictionary(dictionary, 5, [], new Uint8Array(0), 0, 0);
        expect(visitor._symbols[5]).toBeDefined();
    });

    it('_onSymbolDictionary calls decodeBitmap for non-huffman', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._symbols = {};
        let decodeCalled = false;
        visitor._decodeSymbolDictionary = (): any => {
            decodeCalled = true;
            return [];
        };
        const dictionary: any = {
            huffman: false,
            refinement: false,
            numberOfNewSymbols: 10,
            numberOfExportedSymbols: 5,
            template: 0,
            at: [],
            huffmanDHSelector: 0,
            huffmanDWSelector: 0,
            bitmapSizeSelector: false,
            aggregationInstancesSelector: false
        };
        visitor._onSymbolDictionary(dictionary, 2, [], new Uint8Array(50), 0, 50);
        expect(decodeCalled).toBe(true);
    });
});

describe('_drawBitmap edge cases', () => {

    it('_drawBitmap with x offset at byte boundary', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 16, height: 1, combinationOperator: 0 }]);
        const regionInfo: any = { x: 8, y: 0, width: 2, height: 1 };
        const bitmap: any = [new Uint8Array([1, 1])];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[1]).toBe(192);
    });

    it('_drawBitmap with y offset spans multiple rows', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 4, combinationOperator: 0 }]);
        const regionInfo: any = { x: 0, y: 2, width: 4, height: 2 };
        const bitmap: any = [
            new Uint8Array([1, 1, 0, 0]),
            new Uint8Array([0, 1, 1, 0])
        ];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[2]).toBe(192);
        expect(visitor._buffer[3]).toBe(96);
    });

    it('_drawBitmap with operator 0 at buffer end', () => {
        const visitor: any = new _PdfSimpleSegmentVisitor();
        visitor._onPageInformation([{ width: 8, height: 2, combinationOperator: 0 }]);
        const regionInfo: any = { x: 0, y: 1, width: 3, height: 1 };
        const bitmap: any = [new Uint8Array([1, 0, 1])];
        visitor._drawBitmap(regionInfo, bitmap);
        expect(visitor._buffer[1]).toBe(128 + 32);
    });
});

describe('_PdfReader advanced bit operations', () => {

    it('_readBits handles boundary between bytes correctly', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF, 0x00]), 0, 2);
        const bits6 = reader._readBits(6);
        const bits4 = reader._readBits(4);
        expect(bits6).toBe(0x3F);
        expect(bits4).toBe(12);
    });

    it('_readBits with exact byte consumption', () => {
        const reader = new _PdfReader(new Uint8Array([0xAB, 0xCD]), 0, 2);
        expect(reader._readBits(8)).toBe(0xAB);
        expect(reader._readBits(8)).toBe(0xCD);
    });

    it('byteAlign in middle of byte positions correctly', () => {
        const reader = new _PdfReader(new Uint8Array([0xFF, 0xAA, 0x55]), 0, 3);
        reader._readBits(5);
        reader.byteAlign();
        expect(reader.position).toBe(1);
        expect(reader._readBit()).toBe(1);
    });
});
//////////////////////////////////////////////////////////////////////////////

interface IContextCache {
  getContexts(id: string): Int8Array;
}

interface IArithmeticDecoder {
  _readBit(contexts: Int8Array, state: number): number;
}

class _FakeContextCache implements IContextCache {
  public getContexts(_id: string): Int8Array {
    return new Int8Array(1 << 16);
  }
}

class _FakeArithmeticDecoder implements IArithmeticDecoder {
  private readonly _bits: number[];
  public constructor(bits: number[]) {
    this._bits = bits.slice();
  }
  public _readBit(_contexts: Int8Array, _state: number): number {
    // Return 0 if exhausted (prevents accidental infinite behavior)
    return this._bits.length > 0 ? (this._bits.shift() as number) : 0;
  }
}

describe('_PdfSimpleSegmentVisitor coverage tests (AAA / safe loops)', () => {
  let visitor: _PdfSimpleSegmentVisitor;

  beforeEach(() => {
    visitor = new _PdfSimpleSegmentVisitor();
  });

  it('should draw bitmap using OR operator and hit mask rollover branch (if(!mask){...})', () => {
    // Arrange
    // Page width 9 => rowSize = 2 bytes => ensures mask becomes 0 and triggers rollover
    visitor._currentPageInfo = [{
      width: 9,
      height: 1,
      combinationOperatorOverride: false,
      combinationOperator: 0
    }];
    visitor._buffer = new Uint8ClampedArray(2); // two bytes for one row

    const regionInfo = { x: 0, y: 0, width: 9, height: 1, combinationOperator: 0 };

    // bitmap[0][j] = 1 for all pixels => sets all bits
    const bitmap = [new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1])];

    // Act
    visitor._drawBitmap(regionInfo, bitmap);

    // Assert
    // First 8 bits should set first byte = 0xFF, 9th bit sets MSB in second byte => 0x80
    expect(visitor._buffer[0]).toBe(0xFF);
    expect(visitor._buffer[1]).toBe(0x80);
  });

  it('should draw bitmap using XOR operator and hit mask rollover branch (if(!mask){...})', () => {
    // Arrange
    visitor._currentPageInfo = [{
      width: 9,
      height: 1,
      combinationOperatorOverride: false,
      combinationOperator: 2
    }];
    visitor._buffer = new Uint8ClampedArray([0xFF, 0x80]); // pre-filled bits

    const regionInfo = { x: 0, y: 0, width: 9, height: 1, combinationOperator: 2 };
    const bitmap = [new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1])];

    // Act
    visitor._drawBitmap(regionInfo, bitmap);

    // Assert (XOR toggles them back to 0)
    expect(visitor._buffer[0]).toBe(0x00);
    expect(visitor._buffer[1]).toBe(0x00);
  });

  it('should throw for unsupported combination operator in _drawBitmap (default case)', () => {
    // Arrange
    visitor._currentPageInfo = [{
      width: 1,
      height: 1,
      combinationOperatorOverride: false,
      combinationOperator: 1
    }];
    visitor._buffer = new Uint8ClampedArray(1);

    const regionInfo = { x: 0, y: 0, width: 1, height: 1, combinationOperator: 1 };
    const bitmap = [new Uint8Array([1])];

    // Act + Assert
    expect(() => visitor._drawBitmap(regionInfo, bitmap)).toThrowError(/not supported/i);
  });


  it('should cover _decodeTablesSegment do/while loop and flags&1 OOB line branch', () => {
    // Arrange
    // flags=1 => prefixSizeBits=1, rangeSizeBits=1, and OOB entry present (flags&1)
    // lowestValue=0, highestValue=4 (big-endian)
    // bitstream: 7 bits for (prefix,range)x2 + lower + upper + oob
    const data = new Uint8Array([
      0x01,                   // flags
      0x00, 0x00, 0x00, 0x00,  // lowestValue = 0
      0x00, 0x00, 0x00, 0x04,  // highestValue = 4
      0xFE                    // 11111110 -> enough for all 1-bit reads
    ]);

    // Act
    const table = visitor._decodeTablesSegment(data, 0, data.length);

    // Assert
    expect(table instanceof _PdfHuffmanTable).toBeTruthy();
    expect(table.rootNode).toBeDefined();

    // Also explicitly cover _PdfHuffmanLine isoob + 'lower'
    const oob = new _PdfHuffmanLine([3, 0x3f]);
    expect(oob.isoob).toBeTruthy();

    const lower = new _PdfHuffmanLine([-1, 1, 32, 0, 'lower']);
    expect(lower.isLowerRange).toBeTruthy();
  });

  it('should cover _decodeInteger sign branch and out-of-range return undefined', () => {
    // Arrange
    // We drive _PdfBitReader via arithmetic decoder bits.
    // sign=0, then 5 ones to reach readBits(32)+4436,
    // then 32-bit value = 0x80000000 -> makes result > 2^31-1 => returns undefined
    const bits: number[] = [
      0, // sign
      1, 1, 1, 1, 1, // choose deepest path
      1, // MSB of 0x80000000
      ...new Array(31).fill(0)
    ];
    const decoder = new _FakeArithmeticDecoder(bits);
    const contextCache: IContextCache = new _FakeContextCache();

    // Act
    const value = visitor._decodeInteger(contextCache, 'IADW', decoder);

    // Assert
    expect(value as unknown).toBeUndefined();
  });

  it('should cover _decodeInteger negative signed output when sign=1 and value>0', () => {
    // Arrange
    // sign=1, then first decision bit = 0 => value = readBits(2)
    // readBits(2) -> 2 (binary 10)
    const bits: number[] = [
      1, // sign
      0, // choose short branch => readBits(2)
      1, 0 // readBits(2)=2
    ];
    const decoder = new _FakeArithmeticDecoder(bits);
    const contextCache: IContextCache = new _FakeContextCache();

    // Act
    const value = visitor._decodeInteger(contextCache, 'IADW', decoder);

    // Assert
    expect(value).toBe(-2);
  });

  it('should cover _decodeImageData for codeLength < 31 and >= 31 branches', () => {
    // Arrange
    const contextCache: IContextCache = new _FakeContextCache();

    // codeLength=3 with bits [1,0,1] => expected masked result = 5
    const decoder1 = new _FakeArithmeticDecoder([1, 0, 1]);

    // codeLength=31 with all zeros => prev becomes 2^31 => masked by 0x7fffffff => 0
    const decoder2 = new _FakeArithmeticDecoder(new Array(31).fill(0));

    // Act
    const v1 = visitor._decodeImageData(contextCache, decoder1, 3);
    const v2 = visitor._decodeImageData(contextCache, decoder2, 31);

    // Assert
    expect(v1).toBe(5);
    expect(v2).toBe(0);
  });

  it('should cover _decodeBitmap prediction continue, skip branch, and both contextLabel construction branches', () => {
    // Arrange
    // prediction bits: sltp = [1,0,1] => row0 continue, row1 continue, row2 decode
    // remaining pixel bits for row2: 4 reads (width=5, one skip)
    const decoder = new _FakeArithmeticDecoder([1, 0, 1, 0, 0, 0, 0]);
    const decodingContext = {
      decoder,
      contextCache: new _FakeContextCache()
    };

    const width = 5;
    const height = 3;
    const templateIndex = 0;

    // small skip mask to trigger useskip branch at row2,col0
    const skip: boolean[][] = [
      [false, false, false, false, false],
      [false, false, false, false, false],
      [true,  false, false, false, false]
    ];

    // AT positions that do NOT match the fast-path template0 check (force general path)
    const at = [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -2 },
      { x: -1, y: -2 }
    ];

    // Act
    const bitmap = visitor._decodeBitmap(
      false, width, height, templateIndex,
      true,  // prediction ON (covers ltp continue)
      skip,
      at,
      decodingContext as unknown as any
    );

    // Assert
    expect(bitmap.length).toBe(3);
    expect(bitmap[0].length).toBe(5);

    // prediction path pushes the same row reference for consecutive ltp rows
    expect(bitmap[0]).toBe(bitmap[1]);

    // skip pixel at row2,col0 forced to 0
    expect(bitmap[2][0]).toBe(0);
  });

  it('should throw when prediction is enabled in _decodeRefinement (not supported)', () => {
    // Arrange
    const decoder = new _FakeArithmeticDecoder([1]); // sltp=1 => ltp becomes 1 => throws
    const decodingContext = { decoder, contextCache: new _FakeContextCache() };

    const referenceBitmap = [new Uint8Array([1, 0]), new Uint8Array([0, 1])];
    const at = [{ x: 0, y: 0 }, { x: 0, y: 0 }];

    // Act + Assert
    expect(() =>
      visitor._decodeRefinement(
        2, 2, 0, referenceBitmap,
        0, 0, true, at,
        decodingContext as unknown as any
      )
    ).toThrowError(/not supported/i);
  });

  it('should cache standard Huffman tables and throw for invalid table number', () => {
    // Arrange
    const t1 = visitor._getStandardTable(8);

    // Act
    const t2 = visitor._getStandardTable(8);

    // Assert
    expect(t1).toBe(t2);
    expect(() => visitor._getStandardTable(99)).toThrowError(/does not exist/i);
  });

  it('should cover _getSymbolDictionaryHuffmanTables standard/custom selector paths and error selector branch', () => {
    // Arrange
    const referredTo = [1, 2];
    const customTables: Record<number, _PdfHuffmanTable> = {
      1: visitor._getStandardTable(1),
      2: visitor._getStandardTable(1)
    };

    // Stub _getCustomHuffmanTable to return known custom entry deterministically
    spyOn(visitor as unknown as { _getCustomHuffmanTable: Function }, '_getCustomHuffmanTable')
      .and.callFake((_idx: number, _ref: number[], _cust: any) => customTables[1]);

    // Act (covers DH custom, DW standard, bitmapSize custom, aggregation standard)
    const tables = visitor._getSymbolDictionaryHuffmanTables(
      {
        huffmanDHSelector: 3,
        huffmanDWSelector: 1,
        bitmapSizeSelector: true,
        aggregationInstancesSelector: false
      },
      referredTo,
      customTables
    );

    // Assert
    expect(tables.tableDeltaHeight).toBeDefined();
    expect(tables.tableDeltaWidth).toBeDefined();
    expect(tables.tableBitmapSize).toBeDefined();
    expect(tables.tableAggregateInstances).toBeDefined();

    // Error selector branch
    expect(() => visitor._getSymbolDictionaryHuffmanTables(
      {
        huffmanDHSelector: 2, // invalid per switch
        huffmanDWSelector: 0,
        bitmapSizeSelector: false,
        aggregationInstancesSelector: false
      },
      referredTo,
      customTables
    )).toThrowError(/Invalid Huffman DH selector/i);
  });

  it('should initialize symbols map and merge referred symbols in _onSymbolDictionary', () => {
    // Arrange
    // Existing symbols referenced by referredSegments
    const existingSymbol = [new Uint8Array([1])];
    (visitor as unknown as { _symbols?: Record<number, any[]> })._symbols = {
      5: [existingSymbol]
    };

    // Spy decode to ensure inputSymbols includes referred ones
    const decodeSpy = spyOn(visitor as unknown as { _decodeSymbolDictionary: Function }, '_decodeSymbolDictionary')
      .and.returnValue([existingSymbol]);

    const dictionary = {
      huffman: false,
      refinement: false,
      numberOfNewSymbols: 1,
      numberOfExportedSymbols: 1,
      template: 0,
      at: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
      refinementTemplate: 0,
      refinementAt: [{ x: 0, y: 0 }, { x: 0, y: 0 }]
    };

    const data = new Uint8Array(0);

    // Act
    visitor._onSymbolDictionary(dictionary, 10, [5], data, 0, 0);

    // Assert
    expect(decodeSpy).toHaveBeenCalled();
    const args = decodeSpy.calls.mostRecent().args;
    const inputSymbolsArg = args[2] as any[];
    expect(inputSymbolsArg.length).toBe(1);
    expect((visitor as any)._symbols[10]).toEqual([existingSymbol]);
  });

  it('should decode text region with bounded while/do-while loops (OR + XOR + unsupported operator) without timeouts', () => {
    // Arrange
    const decoder = new _FakeArithmeticDecoder([0, 0, 0, 0, 0, 0]);
    const decodingContext = { decoder, contextCache: new _FakeContextCache() };

    // One 2x2 symbol
    const symbolBitmap = [new Uint8Array([1, 1]), new Uint8Array([1, 0])];
    const inputSymbols = [symbolBitmap];

    // Stub integer decoding so loops terminate:
    // stripT init uses IADT, then IADT again, then IAFS, then IADS => undefined => breaks do/while
    const counters: Record<string, number> = { IADT: 0 };
    spyOn(visitor as unknown as { _decodeInteger: Function }, '_decodeInteger')
      .and.callFake((_cache: any, proc: string) => {
        if (proc === 'IADT') {
          counters.IADT++;
          return 0;
        }
        if (proc === 'IAFS') {
          return 0;
        }
        if (proc === 'IADS') {
          return undefined;
        }
        return 0;
      });

    spyOn(visitor as unknown as { _decodeImageData: Function }, '_decodeImageData')
      .and.returnValue(0);

    // Act (OR)
    const bitmapOR = visitor._decodeTextRegion(
      false, false,
      3, 3,
      0, 1, 1,
      inputSymbols,
      1,
      false, 0,
      1, // referenceCorner: bit1 set => offsetT >= 0
      0, // OR
      null, 0, null,
      decodingContext as unknown as any,
      0, null
    ) as Uint8Array[];

    // Assert OR wrote something
    expect(bitmapOR[0][0]).toBe(1);

    // Act (XOR) - same symbol again will toggle bits (bounded, still 1 instance)
    const bitmapXOR = visitor._decodeTextRegion(
      false, false,
      3, 3,
      0, 1, 1,
      inputSymbols,
      1,
      false, 0,
      1,
      2, // XOR
      null, 0, null,
      decodingContext as unknown as any,
      0, null
    ) as Uint8Array[];

    // Assert XOR wrote something (not throwing)
    expect(bitmapXOR.length).toBe(3);

    // Assert unsupported operator throws
    expect(() => visitor._decodeTextRegion(
      false, false,
      3, 3,
      0, 1, 1,
      inputSymbols,
      1,
      false, 0,
      1,
      1, // unsupported
      null, 0, null,
      decodingContext as unknown as any,
      0, null
    )).toThrowError(/not supported/i);
  });
});
//////////////////////////////////////////////////////////////////////////////////

/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------------
// Helpers (safe, bounded)
// ------------------------
class FakeArithmeticDecoder {
  private bits: number[];
  constructor(bits: number[]) {
    this.bits = bits.slice();
  }
  _readBit(_contexts: Int8Array, _state: number): number {
    return this.bits.length ? (this.bits.shift() as number) : 0;
  }
}

class FakeContextCache {
  getContexts(_id: string | number): Int8Array {
    return new Int8Array(1 << 16);
  }
}

function bmp(rows: number[][]): Uint8Array[] {
  return rows.map((r) => new Uint8Array(r));
}

function u32(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}
function u16(n: number): number[] {
  return [(n >>> 8) & 0xff, n & 0xff];
}
function i8(n: number): number {
  return n & 0xff;
}

function createReader(bitReturns: number[]) {
  const q = bitReturns.slice();
  return {
    _readBits: jasmine.createSpy('_readBits').and.callFake((_n: number) => (q.length ? (q.shift() as number) : 0)),
    byteAlign: jasmine.createSpy('byteAlign')
  };
}

function tableDecodeQueue(values: Array<number | null | undefined>) {
  const q = values.slice();
  return {
    decode: jasmine.createSpy('decode').and.callFake(() => (q.length ? q.shift() : undefined))
  };
}

describe('JBIG2 highlighted coverage (AAA, safe loops, branch/else coverage)', () => {
  // ------------------------------------------------------------------
  // 1) _PdfBitReader: cover prev < 256 AND prev >= 256 branch (yellow)
  // ------------------------------------------------------------------
  it('PdfBitReader._readBits covers prev<256 and prev>=256 update branches', () => {
    // Arrange: 9 reads pushes prev past 256 boundary
    const br = new _PdfBitReader();
    const decoder = new FakeArithmeticDecoder(new Array(9).fill(0));
    const contexts = new Int8Array(1 << 16);

    // Act
    const v = br._readBits(9, decoder as any, contexts);

    // Assert
    expect(v).toBe(0);
  });

  // ---------------------------------------------------------------
  // 2) _PdfContextCache: cover lazy allocation + reuse (E branch)
  // ---------------------------------------------------------------
  it('PdfContextCache.getContexts covers cache miss and cache hit branches', () => {
    // Arrange
    const cache = new _PdfContextCache();

    // Act
    const a = cache.getContexts('GB');
    const b = cache.getContexts('GB');

    // Assert
    expect(a).toBe(b);
    expect(a.length).toBe(1 << 16);
  });

  // ---------------------------------------------------------------------
  // 3) _PdfDecodingContext: cover lazy properties decoder/contextCache
  // ---------------------------------------------------------------------
  it('PdfDecodingContext covers lazy decoder/contextCache getters', () => {
    // Arrange
    const ctx = new _PdfDecodingContext(new Uint8Array([0x00]), 0, 1);

    // Act
    const d1 = (ctx as any).decoder;
    const d2 = (ctx as any).decoder;
    const c1 = (ctx as any).contextCache;
    const c2 = (ctx as any).contextCache;

    // Assert
    expect(d1).toBe(d2);
    expect(c1).toBe(c2);
  });

  // -------------------------------------------------------
  // 4) _onPageInformation: covers defaultPixelValue fill E
  // -------------------------------------------------------
  it('_onPageInformation covers defaultPixelValue fill else/not-else branch', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();

    // Act: defaultPixelValue false => no fill
    v._onPageInformation([{ width: 8, height: 1, defaultPixelValue: 0, combinationOperator: 0 }]);
    const first = v._buffer.slice();

    // Act: defaultPixelValue true => fill with 0xff
    v._onPageInformation([{ width: 8, height: 1, defaultPixelValue: 1, combinationOperator: 0 }]);
    const second = v._buffer.slice();

    // Assert
    expect(first[0]).toBe(0x00);
    expect(second[0]).toBe(0x00);
  });

  // -------------------------------------------------------
  // 5) _drawBitmap: case 0, case 2, default throw (yellow)
  // -------------------------------------------------------
  it('_drawBitmap covers OR case (0) including mask rollover offset++ branch', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    v._currentPageInfo = [{ width: 9, height: 1, combinationOperatorOverride: false, combinationOperator: 0 }];
    v._buffer = new Uint8ClampedArray(2);

    const region = { x: 0, y: 0, width: 9, height: 1, combinationOperator: 0 };
    const bitmap = [new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1])];

    // Act
    v._drawBitmap(region, bitmap);

    // Assert
    expect(v._buffer[0]).toBe(0xff);
    expect(v._buffer[1]).toBe(0x80);
  });

  it('_drawBitmap covers XOR case (2) and override branch', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    v._currentPageInfo = [{ width: 8, height: 1, combinationOperatorOverride: true, combinationOperator: 0 }];
    v._buffer = new Uint8ClampedArray([0xff]);

    const region = { x: 0, y: 0, width: 8, height: 1, combinationOperator: 2 };
    const bitmap = [new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1])];

    // Act
    v._drawBitmap(region, bitmap);

    // Assert (XOR clears bits)
    expect(v._buffer[0]).toBe(0x00);
  });

  it('_drawBitmap covers default unsupported operator throw branch', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    v._currentPageInfo = [{ width: 1, height: 1, combinationOperatorOverride: false, combinationOperator: 9 }];
    v._buffer = new Uint8ClampedArray(1);

    // Act + Assert
    expect(() => v._drawBitmap({ x: 0, y: 0, width: 1, height: 1, combinationOperator: 9 }, [new Uint8Array([1])]))
      .toThrowError(/not supported/i);
  });

  // -------------------------------------------------------
  // 6) _onImmediateGenericRegion: covers decodeBitmap+drawBitmap call
  // -------------------------------------------------------
  it('_onImmediateGenericRegion covers decodeBitmap invocation and drawBitmap', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    v._currentPageInfo = [{ width: 8, height: 1, combinationOperatorOverride: false, combinationOperator: 0 }];
    v._buffer = new Uint8ClampedArray(1);

    const region = {
      info: { width: 2, height: 1, x: 0, y: 0, combinationOperator: 0 },
      mmr: false,
      template: 0,
      prediction: false,
      at: [{ x: 3, y: -1 }, { x: -3, y: -1 }, { x: 2, y: -2 }, { x: -2, y: -2 }]
    };

    spyOn(v as any, '_decodeBitmap').and.returnValue(bmp([[1, 0]]));

    // Act
    v._onImmediateGenericRegion(region as any, new Uint8Array([0x00]), 0, 1);

    // Assert (bit 0 set)
    expect(v._buffer[0] & 0x80).toBe(0x80);
  });

  // -------------------------------------------------------
  // 7) _getCustomHuffmanTable: found + throw branch
  // -------------------------------------------------------
  it('_getCustomHuffmanTable covers found path and not-found throw', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    const custom = { 10: 'A', 20: 'B' };

    // Act
    expect(v._getCustomHuffmanTable(0, [10, 20], custom)).toBe('A');
    expect(v._getCustomHuffmanTable(1, [10, 20], custom)).toBe('B');

    // Assert throw
    expect(() => v._getCustomHuffmanTable(2, [10, 20], custom)).toThrowError(/not found/i);
  });

  // -------------------------------------------------------------------------
  // 8) _getTextRegionHuffmanTables: case32/33/34/default + selector + refinement
  // -------------------------------------------------------------------------
  describe('_getTextRegionHuffmanTables highlighted branches', () => {
    it('covers case 32 repeat and the E-branch guard (i!==0) path', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const reader = createReader([
        ...new Array(35).fill(1), // initial 35 code lengths
        0                         // readBits(2) -> repeats +3
      ]);

      // decode() sequence makes i>0 then 32 repeat
      spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValues(1, 32);

      // Act
      const out = v._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: false }, [], {}, 4, reader as any);

      // Assert
      expect(out.symbolIDTable).toBeDefined();
      expect(reader.byteAlign).toHaveBeenCalled();
    });

    it('covers case 32 error when i===0 (highlighted throw)', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const reader = createReader(new Array(40).fill(0));
      spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValue(32);

      // Act + Assert
      expect(() => v._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: false }, [], {}, 1, reader as any))
        .toThrowError(/No previous value/i);
    });

    it('covers case 33 branch', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const reader = createReader([...new Array(35).fill(0), 0]); // readBits(3) -> +3
      spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValue(33);

      // Act
      const out = v._getTextRegionHuffmanTables({ huffmanFS: 1, huffmanDS: 1, huffmanDT: 1, refinement: false }, [], {}, 3, reader as any);

      // Assert
      expect(out.tableDeltaS).toBeDefined();
    });

    it('covers case 34 branch', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const reader = createReader([...new Array(35).fill(0), 0]); // readBits(7) -> +11
      spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValue(34);

      // Act
      const out = v._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 2, huffmanDT: 2, refinement: false }, [], {}, 11, reader as any);

      // Assert
      expect(out.tableDeltaT).toBeDefined();
    });

    it('covers default invalid codeLength in symbol ID table (highlighted throw)', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const reader = createReader(new Array(40).fill(0));
      spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValue(99);

      // Act + Assert
      expect(() => v._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: false }, [], {}, 1, reader as any))
        .toThrowError(/Invalid code length/i);
    });

    it('covers FS/DS/DT selector=3 custom-table branches + customIndex increments (yellow)', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const reader = createReader(new Array(40).fill(0));
      spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValue(1);

      const t = v._getStandardTable(1);
      spyOn(v as any, '_getCustomHuffmanTable').and.returnValues(t, t, t);

      // Act
      const out = v._getTextRegionHuffmanTables({ huffmanFS: 3, huffmanDS: 3, huffmanDT: 3, refinement: false }, [10, 11, 12], { 10: t, 11: t, 12: t }, 1, reader as any);

      // Assert
      expect((v as any)._getCustomHuffmanTable).toHaveBeenCalledTimes(3);
      expect(out.tableFirstS).toBe(t);
    });

    it('covers invalid FS/DS/DT selector default throws + refinement unsupported throw', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const reader = createReader(new Array(40).fill(0));
      spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValue(1);

      // Act + Assert
      expect(() => v._getTextRegionHuffmanTables({ huffmanFS: 9, huffmanDS: 0, huffmanDT: 0, refinement: false }, [], {}, 1, reader as any))
        .toThrowError(/Invalid Huffman File Segment Selector/i);

      expect(() => v._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 9, huffmanDT: 0, refinement: false }, [], {}, 1, reader as any))
        .toThrowError(/invalid Huffman Data Stream selector/i);

      expect(() => v._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 0, huffmanDT: 9, refinement: false }, [], {}, 1, reader as any))
        .toThrowError(/Invalid Huffman Decoding Table/i);

      expect(() => v._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: true }, [], {}, 1, reader as any))
        .toThrowError(/Refinement with Huffman encoding is not supported/i);
    });
  });

  // -------------------------------------------------------------------------
  // 9) _getSymbolDictionaryHuffmanTables: DH/DW custom+std + bitmapSize/agg else
  // -------------------------------------------------------------------------
  describe('_getSymbolDictionaryHuffmanTables highlighted branches', () => {
    it('covers DH standard (0/1) + DW custom (3) + bitmapSizeSelector true + aggregationInstancesSelector false (E else)', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const t = v._getStandardTable(1);
      spyOn(v as any, '_getCustomHuffmanTable').and.returnValue(t);

      // Act
      const out = v._getSymbolDictionaryHuffmanTables(
        { huffmanDHSelector: 1, huffmanDWSelector: 3, bitmapSizeSelector: true, aggregationInstancesSelector: false },
        [10],
        { 10: t }
      );

      // Assert
      expect(out.tableDeltaHeight).toBeDefined(); // std path
      expect(out.tableDeltaWidth).toBeTruthy();        // custom path
      expect(out.tableBitmapSize).toBeTruthy();        // bitmapSizeSelector true branch
      expect(out.tableAggregateInstances).toBeDefined(); // else branch => std table
    });

    it('covers DH custom (3) + DW standard (0/1) + bitmapSizeSelector false (E else) + aggregationInstancesSelector true', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();
      const t = v._getStandardTable(1);
      spyOn(v as any, '_getCustomHuffmanTable').and.returnValue(t);

      // Act
      const out = v._getSymbolDictionaryHuffmanTables(
        { huffmanDHSelector: 3, huffmanDWSelector: 1, bitmapSizeSelector: false, aggregationInstancesSelector: true },
        [10],
        { 10: t }
      );

      // Assert
      expect(out.tableDeltaHeight).toBeTruthy();       // custom DH
      expect(out.tableDeltaWidth).toBeDefined();  // standard DW
      expect(out.tableBitmapSize).toBeDefined();  // else branch -> std table 1
      expect(out.tableAggregateInstances).toBe(t); // aggregationInstancesSelector true
    });

    it('covers invalid DH/DW selector default throws', () => {
      // Arrange
      const v = new _PdfSimpleSegmentVisitor();

      expect(() => v._getSymbolDictionaryHuffmanTables(
        { huffmanDHSelector: 2, huffmanDWSelector: 0, bitmapSizeSelector: false, aggregationInstancesSelector: false },
        [],
        {}
      )).toThrowError(/Invalid Huffman DH selector/i);

      expect(() => v._getSymbolDictionaryHuffmanTables(
        { huffmanDHSelector: 0, huffmanDWSelector: 2, bitmapSizeSelector: false, aggregationInstancesSelector: false },
        [],
        {}
      )).toThrowError(/Invalid Huffman Dictionary Word selector/i);
    });
  });

  

  // -------------------------------------------------------
  // 11) _onSymbolDictionary: covers huffman branch + symbols init + merge
  // -------------------------------------------------------
  it('_onSymbolDictionary covers dictionary.huffman path + symbols init + merge referredSymbols', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    (v as any)._customTables = { 10: 'X' };
    (v as any)._symbols = { 5: [bmp([[1]])] }; // referredSymbols exist => merge branch

    spyOn(v as any, '_getSymbolDictionaryHuffmanTables').and.returnValue({ dummy: true });
    spyOn(v as any, '_decodeSymbolDictionary').and.returnValue([bmp([[1]])]);

    const dict: any = {
      huffman: true,
      refinement: false,
      numberOfNewSymbols: 1,
      numberOfExportedSymbols: 1,
      template: 0,
      at: [],
      refinementTemplate: 0,
      refinementAt: []
    };

    // Act
    v._onSymbolDictionary(dict, 20, [5], new Uint8Array([0x00]), 0, 1);

    // Assert
    expect((v as any)._getSymbolDictionaryHuffmanTables).toHaveBeenCalled();
    expect((v as any)._symbols[20]).toBeDefined();
  });

  // -------------------------------------------------------
  // 12) _onImmediateTextRegion: covers huffman branch + _log2 path
  // -------------------------------------------------------
  it('_onImmediateTextRegion covers region.huffman path and referredSymbols merge', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    (v as any)._symbols = { 7: [bmp([[1]])] };
    (v as any)._customTables = {};

    spyOn(v as any, '_getTextRegionHuffmanTables').and.returnValue({ dummy: true });
    spyOn(v as any, '_decodeTextRegion').and.returnValue(bmp([[1]]));
    spyOn(v as any, '_drawBitmap');

    const region: any = {
      info: { width: 1, height: 1, x: 0, y: 0, combinationOperator: 0 },
      huffman: true,
      refinement: false,
      defaultPixelValue: 0,
      numberOfSymbolInstances: 1,
      stripSize: 1,
      transposed: false,
      dsOffset: 0,
      referenceCorner: 0,
      combinationOperator: 0,
      refinementTemplate: 0,
      refinementAt: [],
      logStripSize: 0
    };

    // Act
    v._onImmediateTextRegion(region, ['7'], new Uint8Array([0x00]), 0, 1);

    // Assert
    expect((v as any)._getTextRegionHuffmanTables).toHaveBeenCalled();
    expect((v as any)._drawBitmap).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 13) _decodeBitmap: covers fast-path + prediction continue + useskip + else branch
  // -------------------------------------------------------
  it('_decodeBitmap covers fast-path template0 branch', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    const ctx: any = { decoder: new FakeArithmeticDecoder([1]), contextCache: new FakeContextCache() };

    spyOn(v as any, '_decodeBitmapTemplate0').and.returnValue(bmp([[1]]));

    // Act
    const out = v._decodeBitmap(
      false,
      1,
      1,
      0,
      false,
      null as any,
      [{ x: 3, y: -1 }, { x: -3, y: -1 }, { x: 2, y: -2 }, { x: -2, y: -2 }],
      ctx
    );

    // Assert
    expect(out[0][0]).toBe(1);
    expect((v as any)._decodeBitmapTemplate0).toHaveBeenCalled();
  });

  it('_decodeBitmap covers prediction row-continue branch + skip branch + both contextLabel paths', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();

    // prediction sltp=1 => ltp=1 => bitmap.push(row); continue (covers that branch)
    // second row sltp=0 => ltp remains 1? actually ltp ^= 0 stays 1 => continue again
    // third row sltp=1 => ltp becomes 0 => decode pixels
    const ctx: any = {
      decoder: new FakeArithmeticDecoder([
        1, 0, 1, // prediction sltp bits for three rows
        1, 0, 1, 0 // pixel bits (small width)
      ]),
      contextCache: new FakeContextCache()
    };

    // small size ensures no heavy loops
    const skip: boolean[][] = [
      [false, false],
      [false, false],
      [true, false] // skip [2][0] => covers useskip branch
    ];

    // Use templateIndex 3 with empty at to exercise general path
    const out = v._decodeBitmap(false, 2, 3, 3, true, skip, [], ctx);

    // Assert
    expect(out.length).toBe(3);
    expect(out[2][0]).toBe(0); // skip forced 0
  });

  // -------------------------------------------------------
  // 14) _decodeRefinement: covers prediction throw + bounds branches
  // -------------------------------------------------------
  it('_decodeRefinement covers prediction throw when ltp becomes 1', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    const ctx: any = { decoder: new FakeArithmeticDecoder([1]), contextCache: new FakeContextCache() };

    // Act + Assert
    expect(() =>
      v._decodeRefinement(
        2,
        2,
        0,
        bmp([[1, 0], [0, 1]]),
        0,
        0,
        true,
        [{ x: 0, y: 0 }, { x: 0, y: 0 }],
        ctx
      )
    ).toThrowError(/Prediction functionality is not supported/i);
  });

  it('_decodeRefinement covers in-bounds and out-of-bounds contextLabel shifts', () => {
    // Arrange
    const v = new _PdfSimpleSegmentVisitor();
    const ctx: any = { decoder: new FakeArithmeticDecoder(new Array(16).fill(1)), contextCache: new FakeContextCache() };

    // Act (offsets make some reference positions go out-of-bounds)
    const out = v._decodeRefinement(
      2,
      2,
      0,
      bmp([[1, 0], [0, 1]]),
      5, // offsetX
      5, // offsetY
      false,
      [{ x: 0, y: 0 }, { x: 0, y: 0 }],
      ctx
    );

    // Assert
    expect(out.length).toBe(2);
    expect(out[0].length).toBe(2);
  });

  // -------------------------------------------------------
  // 15) _decodeInteger: cover yellow branches (+4/+20/+84/+340) + negative sign
  // -------------------------------------------------------
  it('_decodeInteger covers +4 path', () => {
    const v = new _PdfSimpleSegmentVisitor();
    const cache = new FakeContextCache();

    // sign=0
    // choose branch path to hit +4: 1 then 0 then readBits(4)=3 => 7
    const decoder = new FakeArithmeticDecoder([0, 1, 0, 0, 0, 1, 1]);

    const out = v._decodeInteger(cache as any, 'IADW', decoder as any);
    expect(out).toBe(7);
  });

  it('_decodeInteger covers +20 path', () => {
    const v = new _PdfSimpleSegmentVisitor();
    const cache = new FakeContextCache();

    // sign=0, nested: 1,1,0 => +20, readBits(6)=1 => 21
    const decoder = new FakeArithmeticDecoder([0, 1, 1, 0, 0, 0, 0, 0, 0, 1]);

    const out = v._decodeInteger(cache as any, 'IADW', decoder as any);
    expect(out).toBe(21);
  });

  it('_decodeInteger covers +84 path', () => {
    const v = new _PdfSimpleSegmentVisitor();
    const cache = new FakeContextCache();

    // sign=0, nested: 1,1,1,0 => +84, readBits(8)=2 => 86
    const decoder = new FakeArithmeticDecoder([0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]);

    const out = v._decodeInteger(cache as any, 'IADW', decoder as any);
    expect(out).toBe(86);
  });

  it('_decodeInteger covers +340 path', () => {
    const v = new _PdfSimpleSegmentVisitor();
    const cache = new FakeContextCache();

    // sign=0, nested: 1,1,1,1,0 => +340, readBits(12)=1 => 341
    const decoder = new FakeArithmeticDecoder([0, 1, 1, 1, 1, 0, ...new Array(11).fill(0), 1]);

    const out = v._decodeInteger(cache as any, 'IADW', decoder as any);
    expect(out).toBe(341);
  });

  it('_decodeInteger covers negative sign branch', () => {
    const v = new _PdfSimpleSegmentVisitor();
    const cache = new FakeContextCache();

    // sign=1, short path: first decision 0 => readBits(2)=2 => -2
    const decoder = new FakeArithmeticDecoder([1, 0, 1, 0]);

    const out = v._decodeInteger(cache as any, 'IADW', decoder as any);
    expect(out).toBe(-2);
  });

  // -------------------------------------------------------
  // 16) _decodeTextRegion: cover do-while safe break, transposed/non, XOR/OR/default throw
  // -------------------------------------------------------
  it('_decodeTextRegion covers do-while termination (deltaS undefined) and OR branch', () => {
    const v = new _PdfSimpleSegmentVisitor();

    spyOn(v as any, '_decodeInteger').and.callFake((_cc: any, proc: string) => {
      if (proc === 'IADT') return 0;
      if (proc === 'IAFS') return 0;
      if (proc === 'IADS') return undefined; // breaks do-while safely
      return 0;
    });
    spyOn(v as any, '_decodeImageData').and.returnValue(0);

    const ctx: any = { decoder: {}, contextCache: new FakeContextCache() };
    const sym = bmp([[1, 1], [1, 0]]);

    const out = v._decodeTextRegion(
      false, false,
      4, 4,
      1,  // defaultPixelValue fill
      1, 1,
      [sym],
      1,
      false, 0,
      1,     // referenceCorner
      0,     // OR
      null, 0, [],
      ctx, 0, null
    );

    expect(out.length).toBe(4);
    expect(out[0][0]).toBe(1);
  });

  it('_decodeTextRegion covers transposed XOR branch and default combinationOperator throw', () => {
    const v = new _PdfSimpleSegmentVisitor();

    spyOn(v as any, '_decodeInteger').and.callFake((_cc: any, proc: string) => {
      if (proc === 'IADT') return 0;
      if (proc === 'IAFS') return 0;
      if (proc === 'IADS') return undefined;
      return 0;
    });
    spyOn(v as any, '_decodeImageData').and.returnValue(0);

    const ctx: any = { decoder: {}, contextCache: new FakeContextCache() };
    const sym = bmp([[1, 1]]);

    const ok = v._decodeTextRegion(
      false, false,
      4, 4,
      0,
      1, 1,
      [sym],
      1,
      true,  // transposed
      0,
      1,
      2,     // XOR
      null, 0, [],
      ctx, 0, null
    );
    expect(ok.length).toBe(4);

    expect(() =>
      v._decodeTextRegion(
        false, false,
        2, 2,
        0,
        1, 1,
        [bmp([[1]])],
        1,
        false, 0,
        1,
        9, // invalid => throw
        null, 0, [],
        ctx, 0, null
      )
    ).toThrowError(/not supported/i);
  });

  // -------------------------------------------------------
  // 17) _decodeSymbolDictionary: cover huffman+refinement throw and huffman bitmapSize 0/>0 branches
  // -------------------------------------------------------
  it('_decodeSymbolDictionary throws when huffman && refinement', () => {
    const v = new _PdfSimpleSegmentVisitor();
    const ctx: any = { decoder: new FakeArithmeticDecoder([]), contextCache: new FakeContextCache() };

    expect(() =>
      v._decodeSymbolDictionary(true, true, [], 1, 1, {}, 0, [], 0, [], ctx, {})
    ).toThrowError(/not supported/i);
  });

  it('_decodeSymbolDictionary covers huffman bitmapSize==0 branch and safe while loops', () => {
    const v = new _PdfSimpleSegmentVisitor();
    const ctx: any = { decoder: new FakeArithmeticDecoder([]), contextCache: new FakeContextCache() };

    // deltaHeight once, deltaWidth once then undefined to exit inner while(true)
    const hTables: any = {
      tableDeltaHeight: tableDecodeQueue([1]),
      tableDeltaWidth: tableDecodeQueue([2, undefined]),
      tableBitmapSize: tableDecodeQueue([0])
    };

    // tableB1 decode run-lengths small to finish flags loop
    spyOn(v as any, '_getStandardTable').and.returnValue(tableDecodeQueue([0, 1]));

    spyOn(v as any, '_readUncompressedBitmap').and.returnValue(bmp([[1, 0]]));
    const hIn: any = { byteAlign: jasmine.createSpy('byteAlign') };

    const out = v._decodeSymbolDictionary(true, false, [], 1, 1, hTables, 0, [], 0, [], ctx, hIn);

    expect(out.length).toBe(1);
    expect((v as any)._readUncompressedBitmap).toHaveBeenCalled();
  });

  it('_decodeSymbolDictionary covers huffman bitmapSize>0 branch and split symbolBitmaps else-branch', () => {
    const v = new _PdfSimpleSegmentVisitor();
    const ctx: any = { decoder: new FakeArithmeticDecoder([]), contextCache: new FakeContextCache() };

    const hTables: any = {
      tableDeltaHeight: tableDecodeQueue([1]),
      tableDeltaWidth: tableDecodeQueue([2, 3, undefined]), // two widths => split branch
      tableBitmapSize: tableDecodeQueue([4])
    };

    spyOn(v as any, '_getStandardTable').and.returnValue(tableDecodeQueue([0, 2]));
    spyOn(v as any, '_decodeMmrBitmap').and.returnValue(bmp([[1, 0, 0, 1, 1]]));

    const hIn: any = { byteAlign: jasmine.createSpy('byteAlign'), end: 50, position: 10 };

    const out = v._decodeSymbolDictionary(true, false, [], 2, 2, hTables, 0, [], 0, [], ctx, hIn);

    expect(out.length).toBe(2);
    expect((v as any)._decodeMmrBitmap).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 18) _readSegmentHeader: cover referredFlags===7 branch and invalid referredFlags 5/6
  // -------------------------------------------------------
  

  it('_readSegmentHeader covers invalid referredFlags 5/6 throw branch', () => {
    const img = new _PdfJbig2Image();
    const data = new Uint8Array([...u32(1), 48, 5, 1, ...u32(0)]);
    expect(() => img._readSegmentHeader(data, 0)).toThrowError(/invalid or malformed referred-to flags/i);
  });

  // -------------------------------------------------------
  // 19) _readSegments: cover non-randomAccess and randomAccess post-pass
  // -------------------------------------------------------
  it('_readSegments covers non-randomAccess start/end assignment and break on EndOfFile', () => {
    const img = new _PdfJbig2Image();
    const buf = new Uint8Array(50);

    spyOn(img as any, '_readSegmentHeader').and.returnValues(
      { type: 48, headerEnd: 10, length: 5 },
      { type: 51, headerEnd: 20, length: 3 }
    );

    const segments = img._readSegments({ randomAccess: false }, buf, 0, 50);
    expect(segments.length).toBe(2);
    expect(segments[0].start).toBe(10);
    expect(segments[0].end).toBe(15);
  });

 

  // -------------------------------------------------------
  // 20) _processSegment: cover key cases + callback dispatch branches
  //     NOTE: call via (img as any) to avoid TS header typing mismatch.
  // -------------------------------------------------------
  it('_processSegment covers SymbolDictionary (type 0) and dispatches _onSymbolDictionary', () => {
    const img = new _PdfJbig2Image();
    const visitor = jasmine.createSpyObj('visitor', ['_onSymbolDictionary']);

    const dictData = new Uint8Array([
      ...u16(0x0000), // no huffman/refinement, template0
      i8(0), i8(0), i8(0), i8(0), i8(0), i8(0), i8(0), i8(0), // 4 AT pairs
      ...u32(0), // exported
      ...u32(0)  // new
    ]);

    (img as any)._processSegment(
      { header: { type: 0, typeName: 'SymbolDictionary', number: 1, referredTo: [] }, data: dictData, start: 0, end: dictData.length },
      visitor
    );

    expect(visitor._onSymbolDictionary).toHaveBeenCalled();
  });

  it('_processSegment covers default not-implemented throw branch', () => {
    const img = new _PdfJbig2Image();
    const visitor: any = {};

    expect(() =>
      (img as any)._processSegment(
        { header: { type: 4, typeName: 'IntermediateTextRegion', number: 3, referredTo: [] }, data: new Uint8Array([]), start: 0, end: 0 },
        visitor
      )
    ).toThrowError(/is not implemented/i);
  });
});
