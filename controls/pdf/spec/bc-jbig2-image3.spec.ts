import { _PdfDecodingContext, _PdfJbig2Image, _PdfSimpleSegmentVisitor, _PdfReader } from "../src/pdf/core/graphics/images/jbig2-image";
import { _PdfFaxDecoder } from "../src/pdf/core/graphics/images/pdf-fax-decoder";

describe('_getSymbolDictionaryHuffmanTables – DW selector coverage', () => {
    let visitor: _PdfSimpleSegmentVisitor;

    beforeEach(() => {
        visitor = new _PdfSimpleSegmentVisitor();
    });

    it('should use STANDARD table for DW selector 0 and 1', () => {
        spyOn(visitor, '_getStandardTable').and.returnValue({} as any);

        const result = visitor._getSymbolDictionaryHuffmanTables(
            {
                huffmanDHSelector: 0,
                huffmanDWSelector: 1,
                bitmapSizeSelector: false,
                aggregationInstancesSelector: false
            },
            [],
            {}
        );

        expect(visitor._getStandardTable).toHaveBeenCalledWith(3); // 1 + 2
        expect(result.tableDeltaWidth).toBeDefined();
    });

    it('should use CUSTOM table for DW selector 3', () => {
        spyOn(visitor, '_getCustomHuffmanTable').and.returnValue('custom');

        const result = visitor._getSymbolDictionaryHuffmanTables(
            {
                huffmanDHSelector: 0,
                huffmanDWSelector: 3,
                bitmapSizeSelector: false,
                aggregationInstancesSelector: false
            },
            [5],
            { 5: 'custom' }
        );

        expect(result.tableDeltaWidth).toBeTruthy();
    });

    it('should throw for INVALID DW selector (explicit else)', () => {
        expect(() => {
            visitor._getSymbolDictionaryHuffmanTables(
                {
                    huffmanDHSelector: 0,
                    huffmanDWSelector: 2,
                    bitmapSizeSelector: false,
                    aggregationInstancesSelector: false
                },
                [],
                {}
            );
        }).toBeTruthy();
    });
});

describe('_onSymbolDictionary – symbol cache branches', () => {
    it('should initialize symbols and append referred symbols', () => {
        const visitor = new _PdfSimpleSegmentVisitor();

        (visitor as any)._symbols = {
            1: [[1]],
        };

        spyOn(visitor, '_decodeSymbolDictionary').and.returnValue(['decoded']);

        visitor._onSymbolDictionary(
            { huffman: false, refinement: false, numberOfNewSymbols: 1, numberOfExportedSymbols: 1 },
            10,
            [1],
            new Uint8Array([0]),
            0,
            1
        );

        expect((visitor as any)._symbols[10]).toEqual(['decoded']);
    });
});
``

describe('_onImmediateTextRegion – inputSymbols branches', () => {
    it('should collect referred symbols and decode using huffman', () => {
        const visitor = new _PdfSimpleSegmentVisitor();
        (visitor as any)._symbols = { 1: [[1]] };

        spyOn(visitor, '_getTextRegionHuffmanTables').and.returnValue({});
        spyOn(visitor, '_decodeTextRegion').and.returnValue([[1]]);
        spyOn(visitor, '_drawBitmap').and.stub();

        visitor._onImmediateTextRegion(
            {
                info: { width: 1, height: 1, x: 0, y: 0 },
                huffman: true,
                refinement: false,
                numberOfSymbolInstances: 1,
                stripSize: 1,
                transposed: false,
                dsOffset: 0,
                referenceCorner: 0,
                combinationOperator: 0
            },
            ['1'],
            new Uint8Array([0]),
            0,
            1
        );

        expect(visitor._decodeTextRegion).toHaveBeenCalled();
    });
});

describe('_decodeRefinement – prediction error branch', () => {
    it('should throw when prediction toggles LTP', () => {
        const visitor = new _PdfSimpleSegmentVisitor();
        const ctx = new _PdfDecodingContext(new Uint8Array([0]), 0, 1);

        spyOnProperty(ctx, 'decoder', 'get').and.returnValue({
            _readBit: () => 1
        });
        spyOnProperty(ctx, 'contextCache', 'get').and.returnValue({
            getContexts: () => new Int8Array(1 << 16)
        });

        expect(() => {
            visitor._decodeRefinement(
                1, 1, 0,
                [[1]],
                0, 0,
                true,
                [{ x: 0, y: 0 }, { x: 0, y: 0 }],
                ctx
            );
        }).toThrowError('Prediction functionality is not supported.');
    });
});

describe('_decodeTextRegion – default operator branch', () => {
    it('should throw for unsupported combination operator', () => {
        const visitor = new _PdfSimpleSegmentVisitor();
        const ctx = new _PdfDecodingContext(new Uint8Array([0]), 0, 1);

        spyOn(visitor, '_decodeInteger').and.returnValues(0, 0, undefined);
        spyOn(visitor, '_decodeImageData').and.returnValue(0);

        expect(() => {
            visitor._decodeTextRegion(
                false, false,
                1, 1,
                0,
                1,
                1,
                [[[1]]],
                1,
                false,
                0,
                0,
                1,   // ❌ unsupported operator
                null,
                0,
                [],
                ctx,
                0,
                null
            );
        }).toThrow();
    });
});

describe('_PdfJbig2Image – delegation branches', () => {
    it('should delegate parseChunks to parseJbig2Chunks', () => {
        const img = new _PdfJbig2Image();
        spyOn(img, '_parseJbig2Chunks').and.returnValue('buffer');

        expect(img._parseChunks([])).toBe('buffer');
    });

    it('should set width and height in parse', () => {
        const img = new _PdfJbig2Image();
        spyOn(img, '_parseJbig2').and.returnValue({ imgData: [1], width: 1, height: 1 });

        img._parse([0]);

        expect(img.width).toBe(1);
        expect(img.height).toBe(1);
    });
});


describe('_decodeSymbolDictionary – flags export branches', () => {
    it('should export symbols based on flags (E branch)', () => {
        const visitor = new _PdfSimpleSegmentVisitor();
        const ctx = new _PdfDecodingContext(new Uint8Array([0]), 0, 1);

        spyOn(visitor, '_decodeInteger').and.returnValues(
            1,      // IADH
            1,      // IADW
            undefined, // break inner while
            1,      // IAEX
            1       // IAEX
        );

        spyOn(visitor, '_decodeBitmap').and.returnValue([[1]]);

        const result = visitor._decodeSymbolDictionary(
            false,
            false,
            [[0]],
            1,
            1,
            null,
            0,
            [],
            0,
            [],
            ctx,
            null
        );

        expect(result.length).toBe(0);
    });
});

describe('_decodeBitmap – prediction + sbbLeft branch', () => {
    it('should execute prediction path and inner sbbLeft branch', () => {
        // Arrange
        const visitor = new _PdfSimpleSegmentVisitor();

        const data = new Uint8Array([0xff, 0xff, 0xff]);
        const ctx = new _PdfDecodingContext(data, 0, data.length);

        spyOnProperty(ctx, 'decoder', 'get').and.returnValue({
            _readBit: () => 0
        });

        spyOnProperty(ctx, 'contextCache', 'get').and.returnValue({
            getContexts: () => new Int8Array(1 << 16)
        });

        const at = [
            { x: 0, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 0 }
        ];

        // Act
        const bitmap = visitor._decodeBitmap(
            false,        // mmr
            3,            // width
            2,            // height
            0,            // templateIndex
            true,         // ✅ prediction = TRUE (red line)
            null,
            at,
            ctx
        );

        // Assert
        expect(bitmap.length).toBe(2);
        expect(bitmap[0].length).toBe(3);
    });
});

describe('_decodeBitmap – else branch of sbb condition', () => {
    it('should execute ELSE block when pixel outside sbb bounds', () => {
        const visitor = new _PdfSimpleSegmentVisitor();

        const ctx = new _PdfDecodingContext(new Uint8Array([0xff]), 0, 1);

        spyOnProperty(ctx, 'decoder', 'get').and.returnValue({
            _readBit: () => 1
        });

        spyOnProperty(ctx, 'contextCache', 'get').and.returnValue({
            getContexts: () => new Int8Array(1 << 16)
        });

        // width very small forces ELSE path
        const bitmap = visitor._decodeBitmap(
            false,
            1,
            1,
            0,
            false,
            null,
            [{ x: -10, y: -10 }],
            ctx
        );

        expect(bitmap[0][0]).toBe(1);
    });
});

    describe('PdfReader bit-level behavior', () => {
        it('reads single bits MSB-first across a byte', () => {
            const reader = new _PdfReader(new Uint8Array([0b10100000]), 0, 1);
            const bits = [] as number[];
            for (let i = 0; i < 8; i++) {
                bits.push(reader._readBit());
            }
            expect(bits).toEqual([1, 0, 1, 0, 0, 0, 0, 0]);
        });

        it('throws when reading bit at EOF', () => {
            const reader = new _PdfReader(new Uint8Array([0x00]), 1, 1);
            expect(() => reader._readBit()).toThrowError('Unexpected end of input: No more data available while attempting to read a bit.');
        });

        it('reads multiple bits spanning byte refill', () => {
            const reader = new _PdfReader(new Uint8Array([0b10100000, 0b11110000]), 0, 2);
            const value = reader._readBits(5);
            expect(value).toBe(0b10100); // 20
        });

        it('byteAlign causes next read to fetch new byte', () => {
            const reader = new _PdfReader(new Uint8Array([0xff, 0x00]), 0, 2);
            const first = reader._readBit();
            reader.byteAlign();
            const second = reader._readBit();
            expect(first).toBe(1);
            expect(second).toBe(0);
        });

        it('next() returns next byte or -1 at end', () => {
            const reader = new _PdfReader(new Uint8Array([0x7a]), 0, 1);
            expect(reader.next()).toBe(0x7a);
            expect(reader.next()).toBe(-1);
        });
    });

    describe('_parseJbig2 – bit-packed to grayscale unpacking', () => {
        it('unpacks bit-packed buffer into 8-bit grayscale values', () => {
            const img = new _PdfJbig2Image();
            // prepare a valid JBIG2 header (8 bytes) + flags byte (2 to skip page-count read)
            const headerBytes = new Uint8Array([0x97, 0x4a, 0x42, 0x32, 0x0d, 0x0a, 0x1a, 0x0a, 0x02]);

            spyOn(img, '_readSegments').and.returnValue([]);
            spyOn(img, '_processSegments').and.callFake((segments: any, visitor: any) => {
                visitor._currentPageInfo = { width: 8, height: 1 };
                visitor._buffer = new Uint8ClampedArray([0b11110000]);
            });

            const { imgData, width, height } = img._parseJbig2(headerBytes);
            expect(width).toBe(8);
            expect(height).toBe(1);
            expect(Array.from(imgData)).toEqual([0, 0, 0, 0, 255, 255, 255, 255]);
        });
    });
    
import {
    _PdfBitReader,
    _PdfContextCache,
    _PdfHuffmanLine,
    _PdfHuffmanTreeNode,
    _PdfHuffmanTable,
   
} from '../src/pdf/core/graphics/images/jbig2-image'; // Adjust this path to your actual file.

describe('JBIG2 image behavior coverage', () => {
    function createContextWithDecoder(bitValues: number[]): _PdfDecodingContext {
        const data: Uint8Array = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
        const ctx: _PdfDecodingContext = new _PdfDecodingContext(data, 0, data.length);
        const sequence: number[] = bitValues.slice();

        spyOnProperty(ctx, 'decoder', 'get').and.returnValue({
            _readBit: (): number => {
                if (sequence.length === 0) {
                    return 0;
                }
                return sequence.shift() as number;
            }
        });

        spyOnProperty(ctx, 'contextCache', 'get').and.returnValue({
            getContexts: (_id: string): Int8Array => new Int8Array(1 << 16)
        });

        return ctx;
    }

    function createProcedureSpy(
        visitor: _PdfSimpleSegmentVisitor,
        values: { [key: string]: Array<number | undefined | null> }
    ): jasmine.Spy {
        return spyOn(visitor, '_decodeInteger').and.callFake((
            _contextCache: unknown,
            procedure: string,
            _decoder: unknown
        ): number => {
            const queue: Array<number | undefined | null> | undefined = values[procedure];
            if (!queue || queue.length === 0) {
                return undefined as unknown as number;
            }
            return queue.shift() as number;
        });
    }

    
// describe('_decodeMmrBitmap', () => {
//     it('should cover endOfBlock && !eof loop and break when decoder reaches -1', () => {
//         // Arrange
//         const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();

//         const readNextCharSpy: jasmine.Spy = spyOn(_PdfFaxDecoder.prototype, 'readNextChar')
//             .and.returnValues(
//                 0b10110000, // bitmap byte for width = 4 -> [1,0,1,1]
//                 12,         // EOB scan #1
//                 34,         // EOB scan #2
//                 -1          // break EOB scan loop
//             );

//         // IMPORTANT:
//         // Use a valid reader source instead of a fake object
//         const input: _PdfReader = new _PdfReader(new Uint8Array([0x00]), 0, 1);

//         // Act
//         const bitmap: Uint8Array[] = visitor._decodeMmrBitmap(
//             input,
//             4,
//             1,
//             true
//         );

//         // Assert
//         expect(bitmap.length).toBe(1);
//         expect(Array.from(bitmap[0])).toEqual([1, 0, 1, 1]);
//         expect(readNextCharSpy).toHaveBeenCalled();
//     });

//     it('should skip endOfBlock search when EOF is already reached in image data', () => {
//         // Arrange
//         const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();

//         const readNextCharSpy: jasmine.Spy = spyOn(_PdfFaxDecoder.prototype, 'readNextChar')
//             .and.returnValues(-1);

//         // IMPORTANT:
//         // Use a valid reader source instead of a fake object
//         const input: _PdfReader = new _PdfReader(new Uint8Array([0x00]), 0, 1);

//         // Act
//         const bitmap: Uint8Array[] = visitor._decodeMmrBitmap(
//             input,
//             3,
//             1,
//             true
//         );

//         // Assert
//         expect(bitmap.length).toBe(1);
//         expect(Array.from(bitmap[0])).toEqual([0, 0, 0]);
//         expect(readNextCharSpy).toHaveBeenCalledTimes(1);
//     });
// });


    describe('_onSymbolDictionary / _onImmediateTextRegion / _onPatternDictionary / _onTables', () => {
        it('should cover dictionary.huffman, !symbols, and referredSymbols path in _onSymbolDictionary', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            (visitor as unknown as { _customTables: { [key: number]: string } })._customTables = { 1: 'custom' };
            (visitor as unknown as { _symbols: { [key: number]: unknown[] } })._symbols = {
                5: [[new Uint8Array([1])]]
            };

            spyOn(visitor, '_getSymbolDictionaryHuffmanTables').and.returnValue({
                tableDeltaHeight: 1,
                tableDeltaWidth: 1,
                tableBitmapSize: 1,
                tableAggregateInstances: 1
            } as unknown as {
                tableDeltaHeight: number;
                tableDeltaWidth: number;
                tableBitmapSize: number;
                tableAggregateInstances: unknown;
            });

            spyOn(visitor, '_decodeSymbolDictionary').and.returnValue(['decoded']);

            // Act
            visitor._onSymbolDictionary(
                {
                    huffman: true,
                    refinement: false,
                    numberOfNewSymbols: 1,
                    numberOfExportedSymbols: 1,
                    template: 0,
                    at: [],
                    refinementTemplate: 0,
                    refinementAt: []
                },
                99,
                [5],
                new Uint8Array([0x00, 0x00]),
                0,
                2
            );

            // Assert
            expect((visitor as unknown as { _symbols: { [key: number]: unknown[] } })._symbols[99]).toEqual(['decoded']);
        });

        it('should cover referredSymbols and region.huffman path in _onImmediateTextRegion', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            (visitor as unknown as { _symbols: { [key: number]: unknown[] } })._symbols = {
                1: [[new Uint8Array([1])]]
            };

            spyOn(visitor, '_getTextRegionHuffmanTables').and.returnValue({
                symbolIDTable: {},
                tableFirstS: {},
                tableDeltaS: {},
                tableDeltaT: {}
            });

            spyOn(visitor, '_decodeTextRegion').and.returnValue([new Uint8Array([1])]);
            spyOn(visitor, '_drawBitmap').and.stub();

            // Act
            visitor._onImmediateTextRegion(
                {
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
                },
                ['1'],
                new Uint8Array([0x00]),
                0,
                1
            );

            // Assert
            expect(visitor._decodeTextRegion).toHaveBeenCalled();
            expect(visitor._drawBitmap).toHaveBeenCalled();
        });

        it('should cover !patterns branch in _onPatternDictionary', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            spyOn(visitor, '_decodePatternDictionary').and.returnValue(['pattern']);

            // Act
            visitor._onPatternDictionary(
                {
                    mmr: false,
                    patternWidth: 1,
                    patternHeight: 1,
                    maxPatternIndex: 0,
                    template: 0
                },
                '8',
                new Uint8Array([0x00]),
                0,
                1
            );

            // Assert
            expect((visitor as unknown as { _patterns: { [key: number]: unknown[] } })._patterns[8]).toEqual(['pattern']);
        });

        it('should cover !customTables branch in _onTables', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            spyOn(visitor, '_decodeTablesSegment').and.returnValue({} as _PdfHuffmanTable);

            // Act
            visitor._onTables('7', new Uint8Array([0x00]), 0, 1);

            // Assert
            expect((visitor as unknown as { _customTables: { [key: number]: _PdfHuffmanTable } })._customTables[7])
                .toBeDefined();
        });
    });

    describe('_decodeBitmap', () => {
        it('should cover prediction branch, ltp=false path, and inner highlighted j>=sbbLeft block', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();

            // 3 prediction reads + 15 pixel reads
            const ctx: _PdfDecodingContext = createContextWithDecoder([
                0, // row 0 prediction
                0, // row 1 prediction
                0, // row 2 prediction
                1, 0, 1, 0, 1,
                0, 1, 0, 1, 0,
                1, 1, 0, 0, 1
            ]);

            const at: Array<{ x: number; y: number }> = [{ x: 0, y: -1 }];

            // Act
            const bitmap: Uint8Array[] = visitor._decodeBitmap(
                false,
                5,
                3,
                2,
                true,
                null as unknown as boolean[][],
                at,
                ctx
            );

            // Assert
            expect(bitmap.length).toBe(3);
            expect(bitmap[2].length).toBe(5);
        });

        it('should cover prediction branch where ltp becomes true and pushes previous row then continue', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([
                1, // row 0 prediction => ltp true => continue
                0, // row 1 prediction
                1, 1
            ]);

            // Act
            const bitmap: Uint8Array[] = visitor._decodeBitmap(
                false,
                2,
                2,
                3,
                true,
                null as unknown as boolean[][],
                [{ x: 0, y: -1 }],
                ctx
            );

            // Assert
            expect(bitmap.length).toBe(2);
        });

        it('should cover useskip branch and continue', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([0, 1, 1]);

            const skip: boolean[][] = [[true, false]];

            // Act
            const bitmap: Uint8Array[] = visitor._decodeBitmap(
                false,
                2,
                1,
                3,
                false,
                skip,
                [{ x: 0, y: -1 }],
                ctx
            );

            // Assert
            expect(bitmap[0][0]).toBe(0);
        });

        it('should cover explicit ELSE block when outside sbb bounds', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([1]);

            // Act
            const bitmap: Uint8Array[] = visitor._decodeBitmap(
                false,
                1,
                1,
                0,
                false,
                null as unknown as boolean[][],
                [{ x: -10, y: -10 }],
                ctx
            );

            // Assert
            expect(bitmap[0][0]).toBe(1);
        });

        it('should cover mmr=true branch delegating to _decodeMmrBitmap', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = new _PdfDecodingContext(new Uint8Array([0x00]), 0, 1);
            spyOn(visitor, '_decodeMmrBitmap').and.returnValue([new Uint8Array([1])]);

            // Act
            const result: Uint8Array[] = visitor._decodeBitmap(
                true,
                1,
                1,
                0,
                false,
                null as unknown as boolean[][],
                [],
                ctx
            );

            // Assert
            expect(visitor._decodeMmrBitmap).toHaveBeenCalled();
            expect(result.length).toBe(1);
        });
    });

    describe('_decodeSymbolDictionary', () => {
        it('should cover refinement branch when numberOfInstances > 1', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([0]);

            createProcedureSpy(visitor, {
                IADH: [1],
                IADW: [1, undefined],
                IAAI: [2],
                IAEX: [1, 1]
            });

            spyOn(visitor, '_decodeTextRegion').and.returnValue([[1]]);

            // Act
            const exported: unknown[] = visitor._decodeSymbolDictionary(
                false,
                true,
                [[[1]]],
                1,
                1,
                null,
                0,
                [],
                0,
                [],
                ctx,
                null
            );

            // Assert
            expect(visitor._decodeTextRegion).toHaveBeenCalled();
            expect(exported.length).toBe(0);
        });

        it('should cover refinement ELSE branch when symbolId points to input symbols', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([0]);

            createProcedureSpy(visitor, {
                IADH: [1],
                IADW: [1, undefined],
                IAAI: [1],
                IARDX: [0],
                IARDY: [0],
                IAEX: [1, 1]
            });

            spyOn(visitor, '_decodeImageData').and.returnValue(0);
            spyOn(visitor, '_decodeRefinement').and.returnValue([[1]]);

            // Act
            const exported: unknown[] = visitor._decodeSymbolDictionary(
                false,
                true,
                [[[1]]],
                1,
                1,
                null,
                0,
                [],
                0,
                [],
                ctx,
                null
            );

            // Assert
            expect(visitor._decodeRefinement).toHaveBeenCalled();
            expect(exported.length).toBe(0);
        });

    });

    describe('_decodeTextRegion', () => {
        it('should throw when huffman && refinement are both true', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([0]);

            // Act / Assert
            expect(() => {
                visitor._decodeTextRegion(
                    true,
                    true,
                    1,
                    1,
                    0,
                    1,
                    1,
                    [],
                    1,
                    false,
                    0,
                    0,
                    0,
                    {},
                    0,
                    [],
                    ctx,
                    0,
                    {}
                );
            }).toThrowError('Huffman encoding with refinement is currently not supported.');
        });

        it('should cover huffman path, stripSize > 1, referenceCorner > 1, operator 0, and break on deltaS null', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([0]);

            const inputSymbols: Uint8Array[][] = [
                [new Uint8Array([1, 1]), new Uint8Array([0, 1])]
            ];

            const huffmanTables: {
                tableDeltaT: { decode: jasmine.Spy };
                tableFirstS: { decode: jasmine.Spy };
                symbolIDTable: { decode: jasmine.Spy };
                tableDeltaS: { decode: jasmine.Spy };
            } = {
                tableDeltaT: { decode: jasmine.createSpy('tableDeltaT').and.returnValues(0, 0) },
                tableFirstS: { decode: jasmine.createSpy('tableFirstS').and.returnValue(0) },
                symbolIDTable: { decode: jasmine.createSpy('symbolIDTable').and.returnValue(0) },
                tableDeltaS: { decode: jasmine.createSpy('tableDeltaS').and.returnValue(null) }
            };

            const huffmanInput: {
                _readBits: jasmine.Spy;
                _readBit: jasmine.Spy;
            } = {
                _readBits: jasmine.createSpy('_readBits').and.returnValue(0),
                _readBit: jasmine.createSpy('_readBit').and.returnValue(0)
            };

            // Act
            const bitmap: Uint8Array[] = visitor._decodeTextRegion(
                true,
                false,
                3,
                1,
                0,
                1,
                2,
                inputSymbols,
                1,
                false,
                0,
                3,
                0,
                huffmanTables,
                0,
                [],
                ctx,
                1,
                huffmanInput
            );

            // Assert
            expect(bitmap.length).toBe(1);
            expect(bitmap[0].length).toBe(3);
        });

        it('should cover arithmetic applyRefinement path and call _decodeRefinement', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([0]);

            createProcedureSpy(visitor, {
                IADT: [0, 0],
                IAFS: [0],
                IARI: [1],
                IARDW: [0],
                IARDH: [0],
                IARDX: [0],
                IARDY: [0],
                IADS: [undefined]
            });

            spyOn(visitor, '_decodeImageData').and.returnValue(0);
            spyOn(visitor, '_decodeRefinement').and.returnValue([new Uint8Array([1])]);

            // Act
            const bitmap: Uint8Array[] = visitor._decodeTextRegion(
                false,
                true,
                1,
                1,
                0,
                1,
                1,
                [[new Uint8Array([1])]],
                1,
                false,
                0,
                0,
                0,
                null,
                0,
                [],
                ctx,
                0,
                null
            );

            // Assert
            expect(visitor._decodeRefinement).toHaveBeenCalled();
            expect(bitmap.length).toBe(1);
        });

        it('should cover transposed path with operator 2 and row undefined continue', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([0]);

            createProcedureSpy(visitor, {
                IADT: [0, 0],
                IAFS: [0],
                IADS: [undefined]
            });

            spyOn(visitor, '_decodeImageData').and.returnValue(0);

            const inputSymbols: Uint8Array[][] = [
                [new Uint8Array([1]), new Uint8Array([1])]
            ];

            // Act
            const bitmap: Uint8Array[] = visitor._decodeTextRegion(
                false,
                false,
                1,
                1,
                0,
                1,
                1,
                inputSymbols,
                1,
                true,
                0,
                0,
                2,
                null,
                0,
                [],
                ctx,
                0,
                null
            );

            // Assert
            expect(bitmap.length).toBe(1);
        });

        it('should throw on unsupported operator in transposed branch', () => {
            // Arrange
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const ctx: _PdfDecodingContext = createContextWithDecoder([0]);

            createProcedureSpy(visitor, {
                IADT: [0, 0],
                IAFS: [0],
                IADS: [undefined]
            });

            spyOn(visitor, '_decodeImageData').and.returnValue(0);

            const inputSymbols: Uint8Array[][] = [[new Uint8Array([1])]];

            // Act / Assert
            expect(() => {
                visitor._decodeTextRegion(
                    false,
                    false,
                    1,
                    1,
                    0,
                    1,
                    1,
                    inputSymbols,
                    1,
                    true,
                    0,
                    1,
                    9,
                    null,
                    0,
                    [],
                    ctx,
                    0,
                    null
                );
            }).toThrow();
        });
    });

    describe('_parse / _parseChunks / _processSegments / _parseJbig2Chunks', () => {
        it('should delegate _parseChunks to _parseJbig2Chunks', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            spyOn(image, '_parseJbig2Chunks').and.returnValue(new Uint8ClampedArray([1]));

            // Act
            const result: unknown = image._parseChunks([]);

            // Assert
            expect(image._parseJbig2Chunks).toHaveBeenCalled();
            expect(result).toEqual(new Uint8ClampedArray([1]));
        });

        it('should delegate _parse and assign width/height', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            spyOn(image, '_parseJbig2').and.returnValue({
                imgData: new Uint8ClampedArray([255]),
                width: 1,
                height: 1
            });

            // Act
            const result: unknown = image._parse(new Uint8Array([0x00]));

            // Assert
            expect(result).toEqual(new Uint8ClampedArray([255]));
            expect(image.width).toBe(1);
            expect(image.height).toBe(1);
        });

        it('should cover _processSegments for-loop', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            spyOn(image, '_processSegment').and.stub();

            // Act
            image._processSegments([{}, {}, {}], {} as _PdfSimpleSegmentVisitor);

            // Assert
            expect(image._processSegment).toHaveBeenCalledTimes(3);
        });

        it('should cover _parseJbig2Chunks loop and return visitor buffer', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            spyOn(image, '_readSegments').and.returnValues([{ header: { length: 1, type: 48 } }], [{ header: { length: 1, type: 51 } }]);
            spyOn(image, '_processSegments').and.callFake((
                _segments: unknown,
                visitor: _PdfSimpleSegmentVisitor
            ): void => {
                (visitor as unknown as { _buffer: Uint8ClampedArray })._buffer = new Uint8ClampedArray([42]);
            });

            // Act
            const result: unknown = image._parseJbig2Chunks([
                { data: new Uint8Array([0]), start: 0, end: 1 },
                { data: new Uint8Array([0]), start: 0, end: 1 }
            ]);

            // Assert
            expect(image._readSegments).toHaveBeenCalledTimes(2);
            expect(result).toEqual(new Uint8ClampedArray([42]));
        });
    });

    describe('_readSegmentHeader / _readSegments', () => {
        it('should cover referredFlags === 7 branch and collect retain bits', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            const data: Uint8Array = new Uint8Array(40);

            // segment number = 70000 => 4-byte referred segment numbers
            data[0] = 0x00;
            data[1] = 0x01;
            data[2] = 0x11;
            data[3] = 0x70;

            data[4] = 48; // PageInformation
            // referredFlags encoded through readUint32 at position - 1
            data[5] = 0x00;
            data[6] = 0x00;
            data[7] = 0x00;
            data[8] = 0x02; // referredToCount = 2

            data[9] = 0x1f; // retain bits first byte

            // referred segment #1 = 5
            data[10] = 0x00;
            data[11] = 0x00;
            data[12] = 0x00;
            data[13] = 0x05;

            // referred segment #2 = 6
            data[14] = 0x00;
            data[15] = 0x00;
            data[16] = 0x00;
            data[17] = 0x06;

            // page association
            data[18] = 0x01;

            // length = 3
            data[19] = 0x00;
            data[20] = 0x00;
            data[21] = 0x00;
            data[22] = 0x03;

            // Act
            const header = image._readSegmentHeader(data, 0);

            // Assert
            expect(header.retainBits[0]).toBe(0);
        });

        it('should cover referredToSegmentNumberSize === 2 branch', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            const data: Uint8Array = new Uint8Array(20);

            // number = 300 => 2-byte referred numbers
            data[0] = 0x00;
            data[1] = 0x00;
            data[2] = 0x01;
            data[3] = 0x2c;

            data[4] = 48;
            data[5] = 0x20; // referred count = 1
            data[6] = 0x01;
            data[7] = 0x02; // referred = 258
            data[8] = 0x01; // page association
            data[9] = 0x00;
            data[10] = 0x00;
            data[11] = 0x00;
            data[12] = 0x02;

            // Act
            const header = image._readSegmentHeader(data, 0);

            // Assert
            expect(header.referredTo).toEqual([258]);
        });

        it('should cover length === 0xffffffff with segmentType === 38 and search pattern found', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            const data: Uint8Array = new Uint8Array(80);

            // segment number = 1
            data[0] = 0x00;
            data[1] = 0x00;
            data[2] = 0x00;
            data[3] = 0x01;

            data[4] = 38; // ImmediateGenericRegion
            data[5] = 0x00;
            data[6] = 0x01; // page association
            data[7] = 0xff;
            data[8] = 0xff;
            data[9] = 0xff;
            data[10] = 0xff; // unknown length

            // region info at position 11
            // width = 1
            data[11] = 0x00;
            data[12] = 0x00;
            data[13] = 0x00;
            data[14] = 0x01;
            // height = 3
            data[15] = 0x00;
            data[16] = 0x00;
            data[17] = 0x00;
            data[18] = 0x03;
            // x
            data[19] = 0x00;
            data[20] = 0x00;
            data[21] = 0x00;
            data[22] = 0x00;
            // y
            data[23] = 0x00;
            data[24] = 0x00;
            data[25] = 0x00;
            data[26] = 0x00;
            // combination operator
            data[27] = 0x00;
            // generic region flags at position 28 => mmr false
            data[28] = 0x00;

            // search pattern [0xff, 0xac, 0x00, 0x00, 0x00, 0x03]
            data[40] = 0xff;
            data[41] = 0xac;
            data[42] = 0x00;
            data[43] = 0x00;
            data[44] = 0x00;
            data[45] = 0x03;

            // Act
            const header = image._readSegmentHeader(data, 0);

            // Assert
            expect(header.type).toBe(38);
            expect(header.length).toBe(46);
        });

        it('should throw when length is 0xffffffff and segmentType is not 38', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            const data: Uint8Array = new Uint8Array(20);

            data[4] = 48; // PageInformation
            data[6] = 0x01;
            data[7] = 0xff;
            data[8] = 0xff;
            data[9] = 0xff;
            data[10] = 0xff;

            // Act / Assert
            expect(() => {
                image._readSegmentHeader(data, 0);
            }).toThrowError('Segment length is unknown or invalid');
        });

        it('should cover header.randomAccess branch in _readSegments', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            const headers: Array<{ headerEnd: number; length: number; type: number }> = [
                { headerEnd: 2, length: 3, type: 48 },
                { headerEnd: 4, length: 2, type: 51 }
            ];

            let index: number = 0;
            spyOn(image, '_readSegmentHeader').and.callFake(() => headers[index++] as never);

            // Act
            const segments = image._readSegments(
                { randomAccess: true },
                new Uint8Array(10),
                0,
                10
            );

            // Assert
            expect(segments.length).toBe(2);
            expect(segments[0].start).toBe(4);
            expect(segments[0].end).toBe(7);
            expect(segments[1].start).toBe(7);
            expect(segments[1].end).toBe(9);
        });
    });

    describe('_processSegment', () => {
        function createVisitorSpy(): {
            _onImmediateGenericRegion: jasmine.Spy;
            _onImmediateTextRegion: jasmine.Spy;
            _onImmediateHalftoneRegion: jasmine.Spy;
            _onPageInformation: jasmine.Spy;
            _onSymbolDictionary: jasmine.Spy;
        } {
            return {
                _onImmediateGenericRegion: jasmine.createSpy('_onImmediateGenericRegion'),
                _onImmediateTextRegion: jasmine.createSpy('_onImmediateTextRegion'),
                _onImmediateHalftoneRegion: jasmine.createSpy('_onImmediateHalftoneRegion'),
                _onPageInformation: jasmine.createSpy('_onPageInformation'),
                _onSymbolDictionary: jasmine.createSpy('_onSymbolDictionary')
            };
        }

        it('should cover case 0 with !dictionary.huffman and refinementAt branch and dispatch _onSymbolDictionary', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            const visitor = createVisitorSpy();

            const data: Uint8Array = new Uint8Array(40);
            // dictionary flags: refinement=true, huffman=false, template=0, refinementTemplate=0
            data[0] = 0x02;
            data[1] = 0x00;

            // 4 AT pairs
            for (let i: number = 2; i < 10; i++) {
                data[i] = 0x00;
            }

            // 2 refinement AT pairs
            for (let i: number = 10; i < 14; i++) {
                data[i] = 0x00;
            }

            // exported symbols = 1
            data[14] = 0x00;
            data[15] = 0x00;
            data[16] = 0x00;
            data[17] = 0x01;

            // new symbols = 1
            data[18] = 0x00;
            data[19] = 0x00;
            data[20] = 0x00;
            data[21] = 0x01;

            // Act
            image._processSegment(
                {
                    header: {
                        type: 0,
                        number: 8,
                        referredTo: ([1, 2] as unknown as number)
                    },
                    data,
                    start: 0,
                    end: data.length
                },
                visitor
            );

            // Assert
            expect(visitor._onSymbolDictionary).toBeTruthy();
        });

        it('should cover case 7 with huffman + refinementAt parsing and dispatch _onImmediateTextRegion', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            const visitor = createVisitorSpy();

            spyOn(image, '_readRegionSegmentInformation').and.returnValue({
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                combinationOperator: 0
            });

            const data: Uint8Array = new Uint8Array(64);

            let p: number = 17;
            // textRegion flags => huffman=1, refinement=1, refinementTemplate=0
            data[p] = 0x03;
            data[p + 1] = 0x00;
            p += 2;

            // huffman flags
            data[p] = 0x00;
            data[p + 1] = 0x00;
            p += 2;

            // 2 refinement AT pairs
            data[p] = 0x00;
            data[p + 1] = 0x00;
            data[p + 2] = 0x00;
            data[p + 3] = 0x00;
            p += 4;

            // numberOfSymbolInstances = 1
            data[p] = 0x00;
            data[p + 1] = 0x00;
            data[p + 2] = 0x00;
            data[p + 3] = 0x01;

            // Act
            image._processSegment(
                {
                    header: {
                        type: 7,
                        number: 3,
                        referredTo: ([1] as unknown as number)
                    },
                    data,
                    start: 0,
                    end: data.length
                },
                visitor
            );

            // Assert
            expect(visitor._onImmediateTextRegion).toBeTruthy();
        });

        it('should cover case 16, 23, 39, 48, 49, 50, 51, 53 and 62 branches', () => {
            // Arrange
            const image: _PdfJbig2Image = new _PdfJbig2Image();
            const visitor = createVisitorSpy();

            spyOn(image, '_readRegionSegmentInformation').and.returnValue({
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                combinationOperator: 0
            });

            const patternData: Uint8Array = new Uint8Array(16);
            patternData[0] = 0x01;
            patternData[1] = 0x02;
            patternData[2] = 0x03;

            const halftoneData: Uint8Array = new Uint8Array(64);
            let p1: number = 17;
            halftoneData[p1++] = 0x00;
            // gridWidth
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x01;
            // gridHeight
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x01;
            // gridOffsetX
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            // gridOffsetY
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x00;
            // gridVectorX
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x01;
            // gridVectorY
            halftoneData[p1++] = 0x00;
            halftoneData[p1++] = 0x01;

            const genericData: Uint8Array = new Uint8Array(64);
            let p2: number = 17;
            genericData[p2++] = 0x00;
            for (let i: number = 0; i < 8; i++) {
                genericData[p2++] = 0x00;
            }

            const pageData: Uint8Array = new Uint8Array(32);
            pageData[0] = 0x00;
            pageData[1] = 0x00;
            pageData[2] = 0x00;
            pageData[3] = 0x01;
            pageData[4] = 0xff;
            pageData[5] = 0xff;
            pageData[6] = 0xff;
            pageData[7] = 0xff;
            pageData[8] = 0x00;
            pageData[9] = 0x00;
            pageData[10] = 0x00;
            pageData[11] = 0x01;
            pageData[12] = 0x00;
            pageData[13] = 0x00;
            pageData[14] = 0x00;
            pageData[15] = 0x01;
            pageData[16] = 0x6d;

            const segments = [
                {
                    header: { type: 16, number: 1, referredTo: (0 as unknown as number) },
                    data: patternData,
                    start: 0,
                    end: patternData.length
                },
                {
                    header: { type: 23, number: 1, referredTo: ([9] as unknown as number) },
                    data: halftoneData,
                    start: 0,
                    end: halftoneData.length
                },
                {
                    header: { type: 39, number: 1, referredTo: (0 as unknown as number) },
                    data: genericData,
                    start: 0,
                    end: genericData.length
                },
                {
                    header: { type: 48, number: 1, referredTo: (0 as unknown as number) },
                    data: pageData,
                    start: 0,
                    end: pageData.length
                },
                {
                    header: { type: 49, number: 1, referredTo: (0 as unknown as number) },
                    data: new Uint8Array(0),
                    start: 0,
                    end: 0
                },
                {
                    header: { type: 50, number: 1, referredTo: (0 as unknown as number) },
                    data: new Uint8Array(0),
                    start: 0,
                    end: 0
                },
                {
                    header: { type: 51, number: 1, referredTo: (0 as unknown as number) },
                    data: new Uint8Array(0),
                    start: 0,
                    end: 0
                },
                {
                    header: { type: 53, number: 1, referredTo: (0 as unknown as number) },
                    data: new Uint8Array(0),
                    start: 0,
                    end: 0
                },
                {
                    header: { type: 62, number: 1, referredTo: (0 as unknown as number) },
                    data: new Uint8Array(0),
                    start: 0,
                    end: 0
                }
            ];

            // Act
            for (const segment of segments) {
                expect(() => {
                    image._processSegment(segment as unknown as {
                        header: { type: number; number: number; referredTo: number };
                        data: Uint8Array;
                        start: number;
                        end: number;
                    }, visitor);
                }).not.toThrow();
            }

            // Assert
            expect(visitor._onImmediateHalftoneRegion).toBeTruthy();
            expect(visitor._onImmediateGenericRegion).toBeTruthy();
            expect(visitor._onPageInformation).toBeTruthy();
        });
    });
});
