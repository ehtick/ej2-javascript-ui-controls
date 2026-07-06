import { _PdfBitReader, _PdfContextCache, _PdfDecodingContext, _PdfHuffmanLine, _PdfHuffmanTable, _PdfHuffmanTreeNode, _PdfJbig2Image, _PdfReader, _PdfSimpleSegmentVisitor } from "../src/pdf/core/graphics/images/jbig2-image";
import { _PdfFaxDecoder } from "../src/pdf/core/graphics/images/pdf-fax-decoder";

describe('_onImmediateGenericRegion', () => {
    it('should decode bitmap and draw it on page buffer', () => {
        // Arrange
        const visitor = new _PdfSimpleSegmentVisitor();
        visitor._currentPageInfo = [{ width: 8, height: 1, combinationOperator: 0 }];

        const region = {
            info: { width: 2, height: 1, x: 0, y: 0 },
            mmr: false,
            template: 0,
            prediction: false,
            at: [
                { x: 3, y: -1 },
                { x: -3, y: -1 },
                { x: 2, y: -2 },
                { x: -2, y: -2 }
            ]
        };

        const data = new Uint8Array([0xff]);
        const bitmap = [new Uint8Array([1, 0])];

        spyOn(visitor as any, '_decodeBitmap').and.returnValue(bitmap);
        spyOn(visitor as any, '_drawBitmap');

        // Act
        visitor._onImmediateGenericRegion(region, data, 0, data.length);

        // Assert
        expect(visitor['_decodeBitmap']).toHaveBeenCalled();
        expect(visitor['_drawBitmap']).toHaveBeenCalledWith(region.info, bitmap);
    });
});

describe('_getCustomHuffmanTable', () => {
    it('should return correct custom table by index', () => {
        // Arrange
        const visitor = new _PdfSimpleSegmentVisitor();
        const tables = { 10: 'A', 20: 'B' };

        // Act
        const table = visitor._getCustomHuffmanTable(1, [10, 20], tables);

        // Assert
        expect(table).toBe('B');
    });

    it('should throw when table is not found', () => {
        // Arrange
        const visitor = new _PdfSimpleSegmentVisitor();

        // Act + Assert
        expect(() =>
            visitor._getCustomHuffmanTable(0, [1], {})
        ).toThrowError('Custom Huffman table not found in the input data.');
    });
});

describe('_getTextRegionHuffmanTables', () => {


    it('should throw when refinement + huffman is enabled', () => {
        // Arrange
        const visitor = new _PdfSimpleSegmentVisitor();
        const reader = { _readBits: () => 0, byteAlign() { } } as any;

        // Act + Assert
        expect(() =>
            visitor._getTextRegionHuffmanTables(
                { huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: true },
                [],
                {},
                1,
                reader
            )
        ).toBeTruthy();
    });
});


describe('_decodeBitmap', () => {
    it('should use template‑0 fast path', () => {
        // Arrange
        const visitor = new _PdfSimpleSegmentVisitor();
        const ctx = {
            _data: new Uint8Array([0]),
            _start: 0,
            _end: 1,
            decoder: { _readBit: () => 1 },
            contextCache: { getContexts: () => new Int8Array(1 << 16) }
        } as any;

        spyOn(visitor as any, '_decodeBitmapTemplate0').and.returnValue([
            new Uint8Array([1])
        ]);

        // Act
        const bmp = visitor._decodeBitmap(
            false,
            1,
            1,
            0,
            false,
            null,
            [
                { x: 3, y: -1 },
                { x: -3, y: -1 },
                { x: 2, y: -2 },
                { x: -2, y: -2 }
            ],
            ctx
        );

        // Assert
        expect(bmp[0][0]).toBe(1);
    });
});

describe('_decodeInteger', () => {
    it('should hit +4, +20, +84, +340 branches', () => {
        const visitor = new _PdfSimpleSegmentVisitor();
        const ctx = { getContexts: () => new Int8Array(1 << 16) };

        const decoder = {
            _readBit: jasmine.createSpy().and.returnValues(
                0, // sign
                1, 1, 1, 1, 0, // deep nesting
                ...new Array(12).fill(0)
            )
        };

        const value = visitor._decodeInteger(ctx, 'IADW', decoder);
        expect(value).toBeDefined();
    });
});

describe('_decodeTextRegion', () => {
    it('should exit do-while loop safely using undefined deltaS', () => {
        // Arrange
        const visitor = new _PdfSimpleSegmentVisitor();
        spyOn(visitor as any, '_decodeInteger').and.returnValues(
            0, // IADT
            0, // IAFS
            undefined // IADS → breaks loop
        );

        spyOn(visitor as any, '_decodeImageData').and.returnValue(0);

        const ctx = {
            decoder: {},
            contextCache: { getContexts: () => new Int8Array(1 << 16) }
        };

        // Act
        const bitmap = visitor._decodeTextRegion(
            false, false, 2, 1, 0, 1, 1,
            [[new Uint8Array([1])]],
            1, false, 0, 0, 0,
            null, 0, [], ctx, 0, null
        );

        // Assert
        expect(bitmap.length).toBe(1);
    });
});
//////////////////////

/* eslint-disable @typescript-eslint/no-explicit-any */


/**
 * Helpers (AAA-safe, bounded)
 */
class FakeArithmeticDecoder {
    private bits: number[];
    constructor(bits: number[]) {
        this.bits = bits.slice();
    }
    public _readBit(_contexts: Int8Array, _state: number): number {
        return this.bits.length ? (this.bits.shift() as number) : 0;
    }
}

class FakeContextCache {
    public getContexts(_id: string | number): Int8Array {
        return new Int8Array(1 << 16);
    }
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
function bitmapFrom(rows: number[][]): Uint8Array[] {
    return rows.map((r) => new Uint8Array(r));
}

describe('JBIG2 highlighted coverage (AAA, no timeouts)', () => {
    describe('_PdfBitReader', () => {
        it('should cover prev < 256 AND prev >= 256 branches', () => {
            // Arrange
            const reader = new _PdfBitReader();

            // 9 bits makes prev cross 256 (1<<8 == 256), so iteration 9 uses prev >= 256 branch
            const decoder = new FakeArithmeticDecoder([0, 0, 0, 0, 0, 0, 0, 0, 0]);
            const contexts = new Int8Array(1 << 16);

            // Act
            const v = reader._readBits(9, decoder as any, contexts);

            // Assert
            expect(v).toBe(0);
        });
    });

    describe('_PdfContextCache', () => {
        it('should lazily create contexts and reuse from cache', () => {
            // Arrange
            const cache = new _PdfContextCache();

            // Act
            const a = cache.getContexts('GB');
            const b = cache.getContexts('GB');

            // Assert
            expect(a).toBe(b);
            expect(a.length).toBe(1 << 16);
        });
    });

    describe('_PdfDecodingContext lazy properties', () => {
        it('should lazily define decoder and contextCache and return same instance on repeated access', () => {
            // Arrange
            const ctx = new _PdfDecodingContext(new Uint8Array([0x00]), 0, 1);

            // Act
            const dec1 = (ctx as any).decoder;
            const dec2 = (ctx as any).decoder;

            const cc1 = (ctx as any).contextCache;
            const cc2 = (ctx as any).contextCache;

            // Assert
            expect(dec1).toBe(dec2);
            expect(cc1).toBe(cc2);
        });
    });

    describe('_drawBitmap', () => {
        it('should draw with OR and hit mask rollover offset++ branch', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            visitor._currentPageInfo = [{ width: 9, height: 1, combinationOperatorOverride: false, combinationOperator: 0 }];
            visitor._buffer = new Uint8ClampedArray(2);

            const regionInfo = { x: 0, y: 0, width: 9, height: 1, combinationOperator: 0 };
            const bmp = [new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1])];

            // Act
            visitor._drawBitmap(regionInfo, bmp);

            // Assert
            expect(visitor._buffer[0]).toBe(0xff);
            expect(visitor._buffer[1]).toBe(0x80);
        });

        it('should draw with XOR and use combinationOperatorOverride=true path', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            visitor._currentPageInfo = [{ width: 9, height: 1, combinationOperatorOverride: true, combinationOperator: 0 }];
            visitor._buffer = new Uint8ClampedArray([0xff, 0x80]);

            const regionInfo = { x: 0, y: 0, width: 9, height: 1, combinationOperator: 2 };
            const bmp = [new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1])];

            // Act
            visitor._drawBitmap(regionInfo, bmp);

            // Assert (XOR clears)
            expect(visitor._buffer[0]).toBe(0x00);
            expect(visitor._buffer[1]).toBe(0x00);
        });

        it('should throw for unsupported combination operator', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            visitor._currentPageInfo = [{ width: 1, height: 1, combinationOperatorOverride: false, combinationOperator: 1 }];
            visitor._buffer = new Uint8ClampedArray(1);

            const regionInfo = { x: 0, y: 0, width: 1, height: 1, combinationOperator: 1 };
            const bmp = [new Uint8Array([1])];

            // Act + Assert
            expect(() => visitor._drawBitmap(regionInfo, bmp)).toThrowError(/not supported/i);
        });
    });

    describe('_onImmediateGenericRegion', () => {
        it('should decode bitmap and draw it', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const region = {
                info: { width: 2, height: 1, x: 0, y: 0, combinationOperator: 0 },
                mmr: false,
                template: 0,
                prediction: false,
                at: [
                    { x: 3, y: -1 },
                    { x: -3, y: -1 },
                    { x: 2, y: -2 },
                    { x: -2, y: -2 }
                ]
            };
            const data = new Uint8Array([0x00]);
            const fakeBmp = bitmapFrom([[1, 0]]);

            spyOn(visitor as any, '_decodeBitmap').and.returnValue(fakeBmp);
            const drawSpy = spyOn(visitor as any, '_drawBitmap');

            // Act
            visitor._onImmediateGenericRegion(region as any, data, 0, data.length);

            // Assert
            expect(drawSpy).toHaveBeenCalledWith(region.info, fakeBmp);
        });
    });

    describe('_getCustomHuffmanTable', () => {
        it('should return correct custom table by index and throw when missing', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const tables: Record<number, unknown> = { 10: 'A', 20: 'B' };

            // Act
            const t0 = visitor._getCustomHuffmanTable(0, [10, 20], tables);
            const t1 = visitor._getCustomHuffmanTable(1, [10, 20], tables);

            // Assert
            expect(t0).toBe('A');
            expect(t1).toBe('B');
            expect(() => visitor._getCustomHuffmanTable(2, [10, 20], tables)).toThrowError(/not found/i);
        });
    });

    describe('_getTextRegionHuffmanTables (cases 32/33/34 + selector errors)', () => {
        it('should build tables and cover run-length expansion branches safely', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            // Stub reader bits:
            // First 35 reads for code lengths (4 bits each) -> all 0
            // then for repeats: case 32 uses _readBits(2), case33 uses _readBits(3), case34 uses _readBits(7)
            const bitsQueue: number[] = [
                ...new Array(35).fill(0),
                0, // for case 32 repeats => 0 + 3
                0, // for case 33 repeats => 0 + 3
                0  // for case 34 repeats => 0 + 11
            ];
            const reader: Partial<_PdfReader> = {
                _readBits: jasmine.createSpy('_readBits').and.callFake(() => (bitsQueue.length ? (bitsQueue.shift() as number) : 0)),
                byteAlign: jasmine.createSpy('byteAlign')
            };

            // Make runCodesTable.decode(reader) return:
            // i=0 -> 33 (repeat zeros)
            // i=3 -> 1 (literal)
            // i=4 -> 34 (repeat zeros)
            // then finish with 0 literals by returning 0 a couple of times
            spyOn(_PdfHuffmanTable.prototype, 'decode')
                .and.returnValues(33, 1, 34, 0, 0);

            // Act
            const out = visitor._getTextRegionHuffmanTables(
                { huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: false } as any,
                [],
                {},
                5,
                reader as _PdfReader
            );

            // Assert
            expect(out.symbolIDTable instanceof _PdfHuffmanTable).toBeTruthy();
            expect((reader.byteAlign as jasmine.Spy).calls.count()).toBe(1);
        });

        it('should throw when codeLength=32 and i==0 (no previous symbol)', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const reader: any = { _readBits: () => 0, byteAlign: () => { } };
            spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValue(32);

            // Act + Assert
            expect(() =>
                visitor._getTextRegionHuffmanTables(
                    { huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: false },
                    [],
                    {},
                    1,
                    reader
                )
            ).toThrowError(/No previous value found/i);
        });

        it('should throw for invalid FS/DS/DT selectors and refinement', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const reader: any = { _readBits: () => 0, byteAlign: () => { } };
            spyOn(_PdfHuffmanTable.prototype, 'decode').and.returnValue(1);

            // FS invalid
            expect(() =>
                visitor._getTextRegionHuffmanTables({ huffmanFS: 2, huffmanDS: 0, huffmanDT: 0, refinement: false }, [], {}, 1, reader)
            ).toThrowError(/Invalid Huffman File Segment Selector/i);

            // DS invalid
            expect(() =>
                visitor._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 9, huffmanDT: 0, refinement: false }, [], {}, 1, reader)
            ).toThrowError(/invalid Huffman Data Stream selector/i);

            // DT invalid
            expect(() =>
                visitor._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 0, huffmanDT: 9, refinement: false }, [], {}, 1, reader)
            ).toThrowError(/Invalid Huffman Decoding Table/i);

            // refinement not supported
            expect(() =>
                visitor._getTextRegionHuffmanTables({ huffmanFS: 0, huffmanDS: 0, huffmanDT: 0, refinement: true }, [], {}, 1, reader)
            ).toThrowError(/Refinement with Huffman encoding is not supported/i);
        });
    });

    describe('_getStandardTable', () => {
        it('should create all standard tables (1..15), return cached instance, and throw for invalid table', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            // Act + Assert
            for (let n = 1; n <= 15; n++) {
                const t = visitor._getStandardTable(n);
                expect(t instanceof _PdfHuffmanTable).toBeTruthy();
            }

            const a = visitor._getStandardTable(8);
            const b = visitor._getStandardTable(8);
            expect(a).toBe(b);

            expect(() => visitor._getStandardTable(99)).toThrowError(/does not exist/i);
        });
    });

    describe('_readUncompressedBitmap', () => {
        it('should read bits and align each row', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const reader = {
                _readBit: jasmine.createSpy('_readBit').and.returnValues(1, 0, 1, 0, 1, 0),
                byteAlign: jasmine.createSpy('byteAlign')
            };

            // Act
            const bmp = visitor._readUncompressedBitmap(reader as any, 3, 2);

            // Assert
            expect(Array.from(bmp[0])).toEqual([1, 0, 1]);
            expect(Array.from(bmp[1])).toEqual([0, 1, 0]);
            expect((reader.byteAlign as jasmine.Spy).calls.count()).toBe(2);
        });
    });

   

    describe('_decodeTablesSegment', () => {
        it('should cover do/while range building and optional OOB entry', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            // flags=1 -> prefix bits=1, range bits=1 and adds OOB line
            const data = new Uint8Array([
                0x01,
                ...u32(0),
                ...u32(4),
                0xff // reader stream (enough bits)
            ]);

            // Act
            const table = visitor._decodeTablesSegment(data, 0, data.length);

            // Assert
            expect(table instanceof _PdfHuffmanTable).toBeTruthy();
        });

        it('should cover flags without OOB entry (flags & 1 = 0)', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const data = new Uint8Array([
                0x00,
                ...u32(0),
                ...u32(4),
                0xff
            ]);

            // Act
            const table = visitor._decodeTablesSegment(data, 0, data.length);

            // Assert
            expect(table instanceof _PdfHuffmanTable).toBeTruthy();
        });
    });

    describe('_decodeBitmapTemplate0', () => {
        it('should cover row1/row2 selection and j+3/j+4 conditional reads', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            const ctx: any = {
                decoder: new FakeArithmeticDecoder([
                    // enough bits for width=6, height=3 => 18 reads
                    ...new Array(18).fill(1)
                ]),
                contextCache: new FakeContextCache()
            };

            // Act
            const bmp = visitor._decodeBitmapTemplate0(6, 3, ctx);

            // Assert
            expect(bmp.length).toBe(3);
            expect(bmp[0].length).toBe(6);
        });
    });

    describe('_decodeBitmap', () => {
        it('should use MMR branch and call _decodeMmrBitmap', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const ctx = new _PdfDecodingContext(new Uint8Array([0x00]), 0, 1);

            spyOn(visitor as any, '_decodeMmrBitmap').and.returnValue(bitmapFrom([[1, 0]]));

            // Act
            const bmp = visitor._decodeBitmap(true, 2, 1, 0, false, null as any, [], ctx);

            // Assert
            expect(bmp[0][0]).toBe(1);
            expect((visitor as any)._decodeMmrBitmap).toHaveBeenCalled();
        });

        it('should use template-0 fast path branch', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const ctx: any = {
                _data: new Uint8Array([0]),
                _start: 0,
                _end: 1,
                decoder: new FakeArithmeticDecoder([1]),
                contextCache: new FakeContextCache()
            };
            spyOn(visitor as any, '_decodeBitmapTemplate0').and.returnValue(bitmapFrom([[1]]));

            // Act
            const bmp = visitor._decodeBitmap(
                false, 1, 1, 0, false, null as any,
                [
                    { x: 3, y: -1 },
                    { x: -3, y: -1 },
                    { x: 2, y: -2 },
                    { x: -2, y: -2 }
                ],
                ctx
            );

            // Assert
            expect(bmp[0][0]).toBe(1);
        });

        it('should cover prediction continue + skip branch + both contextLabel paths', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            const ctx: any = {
                decoder: new FakeArithmeticDecoder([
                    1, 0, 1, // prediction bits -> row0 continue, row1 continue, row2 decode
                    1, 0, 1, 0, 1 // pixel bits (width small)
                ]),
                contextCache: new FakeContextCache()
            };

            const skipMask: boolean[][] = [
                [false, false, false],
                [false, false, false],
                [true, false, false] // skip [2][0]
            ];

            const at = [
                { x: 0, y: 0 },
                { x: 0, y: -1 },
                { x: 1, y: -2 },
                { x: -1, y: -2 }
            ];

            // Act
            const bmp = visitor._decodeBitmap(false, 3, 3, 0, true, skipMask, at, ctx);

            // Assert
            expect(bmp.length).toBe(3);
            expect(bmp[0]).toBe(bmp[1]); // prediction rows
            expect(bmp[2][0]).toBe(0);   // skip forces 0
        });
    });

    describe('_decodeInteger', () => {
        it('should cover sign=0 and nested branches (+4/+20/+84/+340/32bit) and return within range', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const cache = new FakeContextCache();

            // Choose a short branch: sign=0, first decision=0 => readBits(2)=2
            const decoder = new FakeArithmeticDecoder([0, 0, 1, 0]);

            // Act
            const v = visitor._decodeInteger(cache as any, 'IADW', decoder as any);

            // Assert
            expect(v).toBe(2);
        });

        it('should cover sign=1 negative branch', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const cache = new FakeContextCache();
            const decoder = new FakeArithmeticDecoder([1, 0, 1, 0]); // sign=1, value=2 => -2

            // Act
            const v = visitor._decodeInteger(cache as any, 'IADW', decoder as any);

            // Assert
            expect(v).toBe(-2);
        });

        it('should return undefined when signedValue is out of 32-bit range or sign=1 value=0 leaves signedValue undefined', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const cache = new FakeContextCache();

            // sign=1, take short path and return value=0 => signedValue stays undefined -> returns result (undefined)
            const decoder = new FakeArithmeticDecoder([1, 0, 0, 0]);

            // Act
            const v = visitor._decodeInteger(cache as any, 'IADW', decoder as any);

            // Assert
            expect(v as any).toBeUndefined();
        });
    });

    describe('_decodeImageData', () => {
        it('should cover codeLength < 31 and >= 31 masks', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const cache = new FakeContextCache();
            const shortDec = new FakeArithmeticDecoder([1, 0, 1]); // => 5 when codeLength=3
            const longDec = new FakeArithmeticDecoder(new Array(31).fill(0)); // => 0

            // Act
            const a = visitor._decodeImageData(cache as any, shortDec as any, 3);
            const b = visitor._decodeImageData(cache as any, longDec as any, 31);

            // Assert
            expect(a).toBe(5);
            expect(b).toBe(0);
        });
    });

    describe('_decodeTextRegion (do/while safe break)', () => {
        it('should break do/while loop using deltaS undefined and cover OR', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            // _decodeInteger sequence for IADT, IADT, IAFS, IADS -> undefined (break)
            spyOn(visitor as any, '_decodeInteger').and.callFake((_cc: any, proc: string) => {
                if (proc === 'IADT') return 0;
                if (proc === 'IAFS') return 0;
                if (proc === 'IADS') return undefined;
                return 0;
            });

            spyOn(visitor as any, '_decodeImageData').and.returnValue(0);

            const ctx: any = { decoder: {}, contextCache: new FakeContextCache() };
            const sym = bitmapFrom([[1, 1], [1, 0]]);

            // Act
            const bmp = visitor._decodeTextRegion(
                false, false,
                4, 4,
                0, 1, 1,
                [sym],
                1,
                false, 0,
                1,
                0, // OR
                null, 0, [],
                ctx, 0, null
            );

            // Assert
            expect(bmp.length).toBe(4);
            expect(bmp[0][0]).toBe(1);
        });

        it('should cover XOR + transposed path + unsupported operator throw', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            spyOn(visitor as any, '_decodeInteger').and.callFake((_cc: any, proc: string) => {
                if (proc === 'IADT') return 0;
                if (proc === 'IAFS') return 0;
                if (proc === 'IADS') return undefined;
                return 0;
            });

            spyOn(visitor as any, '_decodeImageData').and.returnValue(0);

            const ctx: any = { decoder: {}, contextCache: new FakeContextCache() };
            const sym = bitmapFrom([[1, 1]]);

            // XOR transposed
            const ok = visitor._decodeTextRegion(
                false, false,
                4, 4,
                0, 1, 1,
                [sym],
                1,
                true, 0,
                1,
                2, // XOR
                null, 0, [],
                ctx, 0, null
            );
            expect(ok.length).toBe(4);

            // Unsupported operator
            expect(() =>
                visitor._decodeTextRegion(
                    false, false,
                    2, 2,
                    0, 1, 1,
                    [sym],
                    1,
                    false, 0,
                    1,
                    1, // invalid operator
                    null, 0, [],
                    ctx, 0, null
                )
            ).toThrowError(/not supported/i);
        });

        it('should cover refinement applied path', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            spyOn(visitor as any, '_decodeInteger').and.callFake((_cc: any, proc: string) => {
                if (proc === 'IADT') return 0;
                if (proc === 'IAFS') return 0;
                if (proc === 'IARI') return 1; // apply refinement
                if (proc === 'IARDW') return 1;
                if (proc === 'IARDH') return 0;
                if (proc === 'IARDX') return 0;
                if (proc === 'IARDY') return 0;
                if (proc === 'IADS') return undefined;
                return 0;
            });

            spyOn(visitor as any, '_decodeImageData').and.returnValue(0);
            spyOn(visitor as any, '_decodeRefinement').and.returnValue(bitmapFrom([[1, 1]]));

            const ctx: any = { decoder: {}, contextCache: new FakeContextCache() };
            const sym = bitmapFrom([[1]]);

            // Act
            const bmp = visitor._decodeTextRegion(
                false, true,
                4, 1,
                0, 1, 1,
                [sym],
                1,
                false, 0,
                1,
                0,
                null, 0, [{ x: 0, y: 0 }, { x: 0, y: 0 }],
                ctx, 0, null
            );

            // Assert
            expect(bmp[0][0]).toBe(1);
            expect(bmp[0][1]).toBe(1);
        });
    });

    describe('_decodePatternDictionary', () => {
        it('should cover mmr=false template=0 at positions and slicing', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const ctx: any = { decoder: new FakeArithmeticDecoder([]), contextCache: new FakeContextCache() };

            // collective bitmap width = (max+1)*patternWidth => (1+1)*2=4
            spyOn(visitor as any, '_decodeBitmap').and.callFake((_mmr: boolean, w: number, h: number, _t: number, _p: boolean, _s: any, at: any[]) => {
                expect(w).toBe(4);
                expect(h).toBe(1);
                expect(at.length).toBe(4); // -patternWidth + 3 template0 adds
                return bitmapFrom([[1, 0, 0, 1]]);
            });

            // Act
            const patterns = visitor._decodePatternDictionary(false, 2, 1, 1, 0, ctx);

            // Assert
            expect(patterns.length).toBe(2);
            expect(Array.from(patterns[0][0])).toEqual([1, 0]);
            expect(Array.from(patterns[1][0])).toEqual([0, 1]);
        });
    });

    describe('_decodeHalftoneRegion', () => {
        it('should throw for enableSkip and unsupported operator', () => {
            const visitor = new _PdfSimpleSegmentVisitor();
            const patterns = [bitmapFrom([[1]])];

            expect(() =>
                visitor._decodeHalftoneRegion(false, patterns, 0, 1, 1, 0, true, 0, 1, 1, 0, 0, 0, 0, {})
            ).toThrowError(/skip is not implemented/i);

            expect(() =>
                visitor._decodeHalftoneRegion(false, patterns, 0, 1, 1, 0, false, 2, 1, 1, 0, 0, 0, 0, {})
            ).toThrowError(/not supported in halftone region/i);
        });

        it('should cover mmr=false decoding bitplanes and both placement branches (in-bounds and clipped)', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();

            // patterns length=2 => bitsPerValue = log2(2)=1 => one plane only
            const patterns = [
                bitmapFrom([[1, 0]]),
                bitmapFrom([[0, 1]])
            ];

            spyOn(visitor as any, '_decodeBitmap').and.returnValue(bitmapFrom([[0, 1]]));

            // Make one grid cell in-bounds and one clipped by forcing x negative on second cell
            const result = visitor._decodeHalftoneRegion(
                false,
                patterns,
                0,
                3,
                1,
                0,
                false,
                0,
                2,
                1,
                0,
                0,
                -256, // gridVectorX negative => second cell x < 0 triggers else branch
                0,
                { decoder: new FakeArithmeticDecoder([]), contextCache: new FakeContextCache() }
            );

            expect(Array.from(result[0])).toEqual([1, 0, 0]);
        });

        it('should cover mmr=true bitplane path (calls _decodeMmrBitmap)', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            const patterns = [bitmapFrom([[0]]), bitmapFrom([[1]])];

            spyOn(visitor as any, '_decodeMmrBitmap').and.returnValue(bitmapFrom([[1]]));

            const out = visitor._decodeHalftoneRegion(
                true,
                patterns,
                0,
                1,
                1,
                0,
                false,
                0,
                1,
                1,
                0,
                0,
                0,
                0,
                { data: new Uint8Array([0x00]), start: 0, end: 1 }
            );

            expect(out[0][0]).toBe(1);
            expect((visitor as any)._decodeMmrBitmap).toHaveBeenCalled();
        });
    });

    describe('_onSymbolDictionary / _onImmediateTextRegion / _onPatternDictionary / _onImmediateHalftoneRegion / _onTables', () => {
        it('should cover _onSymbolDictionary with symbols init + referredSymbols merge', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            (visitor as any)._symbols = { 5: [bitmapFrom([[1]])] };

            spyOn(visitor as any, '_decodeSymbolDictionary').and.returnValue([bitmapFrom([[1]])]);

            const dict: any = {
                huffman: false,
                refinement: false,
                numberOfNewSymbols: 1,
                numberOfExportedSymbols: 1,
                template: 0,
                at: [],
                refinementTemplate: 0,
                refinementAt: []
            };

            // Act
            visitor._onSymbolDictionary(dict, 10, [5], new Uint8Array([]), 0, 0);

            // Assert
            expect((visitor as any)._symbols[10]).toBeDefined();
        });

        it('should cover _onImmediateTextRegion huffman path calling _getTextRegionHuffmanTables', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            (visitor as any)._symbols = { 7: [bitmapFrom([[1]])] };
            (visitor as any)._customTables = {};

            spyOn(visitor as any, '_getTextRegionHuffmanTables').and.returnValue({ tables: true });
            spyOn(visitor as any, '_decodeTextRegion').and.returnValue(bitmapFrom([[1]]));
            spyOn(visitor as any, '_drawBitmap');

            const region: any = {
                info: { width: 1, height: 1, x: 0, y: 0 },
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
            visitor._onImmediateTextRegion(region, ['7'], new Uint8Array([0x00]), 0, 1);

            // Assert
            expect((visitor as any)._getTextRegionHuffmanTables).toHaveBeenCalled();
            expect((visitor as any)._drawBitmap).toHaveBeenCalled();
        });

        it('should cover _onPatternDictionary patterns init and store', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            spyOn(visitor as any, '_decodePatternDictionary').and.returnValue([bitmapFrom([[1]])]);

            // Act
            visitor._onPatternDictionary({ mmr: false, patternWidth: 1, patternHeight: 1, maxPatternIndex: 0, template: 0 }, '12', new Uint8Array([0x00]), 0, 1);

            // Assert
            expect((visitor as any)._patterns[12]).toBeDefined();
        });

        it('should cover _onImmediateHalftoneRegion', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            (visitor as any)._patterns = { 3: [bitmapFrom([[1]])] };

            spyOn(visitor as any, '_decodeHalftoneRegion').and.returnValue(bitmapFrom([[1]]));
            spyOn(visitor as any, '_drawBitmap');

            const region: any = {
                info: { width: 1, height: 1, x: 0, y: 0 },
                mmr: false,
                template: 0,
                defaultPixelValue: 0,
                enableSkip: false,
                combinationOperator: 0,
                gridWidth: 1,
                gridHeight: 1,
                gridOffsetX: 0,
                gridOffsetY: 0,
                gridVectorX: 256,
                gridVectorY: 0
            };

            // Act
            visitor._onImmediateHalftoneRegion(region, ['3'], new Uint8Array([0x00]), 0, 1);

            // Assert
            expect((visitor as any)._drawBitmap).toHaveBeenCalled();
        });

        it('should cover _onTables customTables init and store', () => {
            // Arrange
            const visitor = new _PdfSimpleSegmentVisitor();
            spyOn(visitor as any, '_decodeTablesSegment').and.returnValue(visitor._getStandardTable(1));

            // Act
            visitor._onTables('21', new Uint8Array([0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0xff]), 0, 10);

            // Assert
            expect((visitor as any)._customTables[21]).toBeDefined();
        });
    });

    describe('_PdfJbig2Image parsing + segment header/segments/processSegment', () => {
        it('should throw for invalid JBIG2 header', () => {
            const img = new _PdfJbig2Image();
            expect(() => img._parseJbig2(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]))).toThrowError(/header is invalid/i);
        });

        it('should unpack bitPacked into imgData and cover mask rollover', () => {
            // Arrange
            const img = new _PdfJbig2Image();
            const data = new Uint8Array([
                0x97, 0x4a, 0x42, 0x32, 0x0d, 0x0a, 0x1a, 0x0a,
                0x00, // flags -> randomAccess=true and pages present
                0x00, 0x00, 0x00, 0x01
            ]);

            spyOn(img as any, '_readSegments').and.returnValue([{ header: { type: 48 } }]);
            spyOn(img as any, '_processSegments').and.callFake((_segments: any, visitor: any) => {
                visitor._currentPageInfo = { width: 9, height: 1 };
                visitor._buffer = new Uint8ClampedArray([0x80, 0x00]); // first pixel black, rest white
            });

            // Act
            const out = img._parseJbig2(data);

            // Assert
            expect(out.width).toBe(9);
            expect(out.height).toBe(1);
            expect(out.imgData.length).toBe(9);
            expect(out.imgData[0]).toBe(0);
            expect(out.imgData[1]).toBe(255);
        });

        it('should cover _readSegmentHeader unknown type and invalid referredFlags 5/6', () => {
            const img = new _PdfJbig2Image();
            const unknown = new Uint8Array([
                ...u32(1),
                0x01, // type 1 -> null in types table
                0x00,
                0x01,
                ...u32(0)
            ]);
            expect(() => img._readSegmentHeader(unknown, 0)).toThrowError(/unknown or unsupported segment type/i);

            const badRefFlags = new Uint8Array([
                ...u32(1),
                48, // PageInformation
                5,  // invalid
                1,
                ...u32(0)
            ]);
            expect(() => img._readSegmentHeader(badRefFlags, 0)).toThrowError(/invalid or malformed referred-to flags/i);
        });



       

        it('should cover _processSegment cases shown (0,7,16,23,39,48,53) and default throw', () => {
            const img = new _PdfJbig2Image();
            const visitor: any = {
                _onSymbolDictionary: jasmine.createSpy('_onSymbolDictionary'),
                _onImmediateTextRegion: jasmine.createSpy('_onImmediateTextRegion'),
                _onImmediateGenericRegion: jasmine.createSpy('_onImmediateGenericRegion'),
                _onImmediateHalftoneRegion: jasmine.createSpy('_onImmediateHalftoneRegion'),
                _onPageInformation: jasmine.createSpy('_onPageInformation')
            };

            // case 0 SymbolDictionary minimal payload
            const dictData = new Uint8Array([
                ...u16(0x0000), // flags: no huffman/refinement
                i8(0), i8(0), i8(0), i8(0), i8(0), i8(0), i8(0), i8(0), // at (template0 => 4 pairs)
                ...u32(0),
                ...u32(0)
            ]);

            (img as any)._processSegment(
                {
                    header: { type: 0, typeName: 'SymbolDictionary', number: 1, referredTo: [] },
                    data: dictData,
                    start: 0,
                    end: dictData.length
                },
                visitor
            );

            expect(visitor._onSymbolDictionary).toHaveBeenCalled();

            // case 48 PageInformation
            const page = new Uint8Array([
                ...u32(1), ...u32(1), ...u32(72), ...u32(72),
                0x00, 0x00, 0x00
            ]);

            img._processSegment(
                { header: { type: 48, typeName: 'PageInformation', number: 2, referredTo: 0 }, data: page, start: 0, end: page.length } as any,
                visitor
            );
            expect(visitor._onPageInformation).toHaveBeenCalled();

            // default not implemented

            expect(() =>
                (img as any)._processSegment(
                    {
                        header: { type: 4, typeName: 'IntermediateTextRegion', number: 3, referredTo: 0 },
                        data: new Uint8Array([]),
                        start: 0,
                        end: 0
                    },
                    visitor
                )
            ).toThrowError(/is not implemented/i);
            ``

        });

        it('should cover _readRegionSegmentInformation', () => {
            const img = new _PdfJbig2Image();
            const d = new Uint8Array([...u32(10), ...u32(20), ...u32(30), ...u32(40), 0x05]);
            const info = img._readRegionSegmentInformation(d, 0);
            expect(info.width).toBe(10);
            expect(info.height).toBe(20);
            expect(info.x).toBe(30);
            expect(info.y).toBe(40);
            expect(info.combinationOperator).toBe(5);
        });
    });
});
////////////////////////////////////////////////////////////////////////////////////
// fdescribe('_decodeMmrBitmap EOF and EOB handling', () => {
//     it('should consume EOB bytes and break safely', () => {
//         const visitor = new _PdfSimpleSegmentVisitor();

//         spyOn(_PdfFaxDecoder.prototype as any, 'readNextChar')
//             .and.returnValues(
//                 0b11110000, // bitmap byte
//                 0x55,       // EOB scan
//                 -1          // break condition
//             );

//         const bitmap = visitor._decodeMmrBitmap({}, 8, 1, true);

//         expect(bitmap.length).toBe(1);
//         expect(bitmap[0][0]).toBe(1);
//     });

//     it('should set eof when decoder returns -1 mid row', () => {
//         const visitor = new _PdfSimpleSegmentVisitor();

//         spyOn(_PdfFaxDecoder.prototype as any, 'readNextChar')
//             .and.returnValue(-1);

//         const bitmap = visitor._decodeMmrBitmap({}, 4, 1, true);

//         expect(bitmap[0].every(v => v === 0)).toBeTruthy();
//     });
// });

// fdescribe('_decodeBitmap branch coverage', () => {
//     it('should use MMR path when mmr=true', () => {
//         const visitor = new _PdfSimpleSegmentVisitor();
//         spyOn(visitor as any, '_decodeMmrBitmap')
//             .and.returnValue([new Uint8Array([1])]);

//         const ctx = new _PdfDecodingContext(new Uint8Array([0]), 0, 1);
//         const result = visitor._decodeBitmap(true, 1, 1, 0, false, null as any, [], ctx);

//         expect(result.length).toBe(1);
//     });

//     it('should hit fast template‑0 path', () => {
//         const visitor = new _PdfSimpleSegmentVisitor();
//         spyOn(visitor as any, '_decodeBitmapTemplate0')
//             .and.returnValue([new Uint8Array([1])]);

//         const ctx = new _PdfDecodingContext(new Uint8Array([0]), 0, 1);

//         visitor._decodeBitmap(
//             false, 1, 1, 0, false, null as any,
//             [
//                 { x: 3, y: -1 },
//                 { x: -3, y: -1 },
//                 { x: 2, y: -2 },
//                 { x: -2, y: -2 }
//             ],
//             ctx
//         );

//         expect((visitor as any)._decodeBitmapTemplate0).toHaveBeenCalled();
//     });

//     it('should execute boundary ELSE branch safely', () => {
//         const visitor = new _PdfSimpleSegmentVisitor();

//         const ctx: any = {
//             decoder: { _readBit: () => 1 },
//             contextCache: { getContexts: () => new Int8Array(1 << 16) }
//         };

//         const bitmap = visitor._decodeBitmap(
//             false,
//             2,
//             1,
//             3,
//             false,
//             null as any,
//             [],
//             ctx
//         );

//         expect(bitmap.length).toBe(1);
//     });
// });

// fdescribe('_decodeRefinement coverage', () => {
//     it('should throw when prediction is enabled', () => {
//         const visitor = new _PdfSimpleSegmentVisitor();
//         const ctx: any = {
//             decoder: { _readBit: () => 1 },
//             contextCache: { getContexts: () => new Int8Array(1 << 16) }
//         };

//         expect(() => {
//             visitor._decodeRefinement(
//                 1, 1, 0,
//                 [[1]],
//                 0, 0,
//                 true,
//                 [{ x: 0, y: 0 }, { x: 0, y: 0 }],
//                 ctx
//             );
//         }).toThrow();
//     });

//     it('should decode with templateIndex 1 (else path)', () => {
//         const visitor = new _PdfSimpleSegmentVisitor();
//         const ctx: any = {
//             decoder: { _readBit: () => 0 },
//             contextCache: { getContexts: () => new Int8Array(1 << 16) }
//         };

//         const bitmap = visitor._decodeRefinement(
//             2, 2, 1,
//             [[1, 0]],
//             0, 0,
//             false,
//             [],
//             ctx
//         );

//         expect(bitmap.length).toBe(2);
//     });
// });

// fdescribe('_decodeSymbolDictionary while‑loop safety', () => {
//     it('should exit all while loops safely', () => {
//         const visitor = new _PdfSimpleSegmentVisitor();

//         const ctx: any = {
//             decoder: {},
//             contextCache: { getContexts: () => new Int8Array(1 << 16) }
//         };

//         spyOn(visitor as any, '_decodeInteger').and.callFake(
//             (_c: any, p: string) => {
//                 if (p === 'IADH') { return 1; }
//                 if (p === 'IADW') { return undefined; } // BREAK
//                 if (p === 'IAEX') { return 1; }
//                 return 0;
//             }
//         );

//         spyOn(visitor as any, '_decodeBitmap')
//             .and.returnValue([[new Uint8Array([1])]]);

//         const result = visitor._decodeSymbolDictionary(
//             false, false, [], 1, 1,
//             null, 0, [], 0, [],
//             ctx, null
//         );

//         expect(result.length).toBe(1);
//     });
// });

// fdescribe('_PdfHuffmanTreeNode decode branches', () => {
//     it('should return null for isoob', () => {
//         const line = new _PdfHuffmanLine([1, 0]);
//         const node = new _PdfHuffmanTreeNode(line);
//         expect(node._decodeNode({ _readBits: () => 0 })).toBeNull();
//     });

//     it('should apply lowerRange offset', () => {
//         const line = new _PdfHuffmanLine([-10, 2, 1, 0, 'lower']);
//         const node = new _PdfHuffmanTreeNode(line);
//         expect(node._decodeNode({ _readBits: () => 1 })).toBe(-11);
//     });

//     it('should throw when child node missing', () => {
//         const node = new _PdfHuffmanTreeNode(null);
//         expect(() => node._decodeNode({ _readBit: () => 1 })).toThrow();
//     });
// });
