
import { _PdfHuffmanLine, _PdfHuffmanTreeNode, _PdfJbig2Image, _PdfSimpleSegmentVisitor } from '../src/pdf/core/graphics/images/jbig2-image';
import { _PdfFaxDecoder } from '../src/pdf/core/graphics/images/pdf-fax-decoder';
import * as utils from '../src/pdf/core/utils';
import * as faxDecoderModule from '../src/pdf/core/graphics/images/pdf-fax-decoder';

type SegmentHeader = {
    type: number;
    typeName: string;
    number: number;
    referredTo: number[];
};

type Segment = {
    header: SegmentHeader;
    data: Uint8Array;
    start: number;
    end: number;
};

function writeUint32(buffer: Uint8Array, offset: number, value: number): void {
    buffer[offset] = (value >>> 24) & 0xff;
    buffer[offset + 1] = (value >>> 16) & 0xff;
    buffer[offset + 2] = (value >>> 8) & 0xff;
    buffer[offset + 3] = value & 0xff;
}

function writeUint16(buffer: Uint8Array, offset: number, value: number): void {
    buffer[offset] = (value >>> 8) & 0xff;
    buffer[offset + 1] = value & 0xff;
}

function writeInt8(buffer: Uint8Array, offset: number, value: number): void {
    buffer[offset] = value & 0xff;
}

function createRegionInfoBytes(
    width: number,
    height: number,
    x: number,
    y: number,
    combinationOperator: number
): Uint8Array {
    const buffer: Uint8Array = new Uint8Array(17);
    writeUint32(buffer, 0, width);
    writeUint32(buffer, 4, height);
    writeUint32(buffer, 8, x);
    writeUint32(buffer, 12, y);
    buffer[16] = combinationOperator & 0x07;
    return buffer;
}

describe('_PdfJbig2Image highlighted coverage', () => {
    let image: _PdfJbig2Image;

    beforeEach(() => {
        image = new _PdfJbig2Image();
    });

    describe('_PdfSimpleSegmentVisitor._decodeMmrBitmap', () => {
        it('covers endOfBlock cleanup loop and break branch without EOF during row decode', () => {
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();

            const fakeDecoder: { readNextChar: jasmine.Spy } = {
                readNextChar: jasmine.createSpy('readNextChar')
                    // first byte used during bitmap row decode
                    .and.returnValues(0x80, -1)
            };

            spyOn(faxDecoderModule, '_PdfFaxDecoder')
                .and.returnValue(fakeDecoder as unknown as _PdfFaxDecoder);

            const bitmap: Uint8Array[] = (visitor as unknown as {
                _decodeMmrBitmap(input: object, width: number, height: number, endOfBlock: boolean): Uint8Array[];
            })._decodeMmrBitmap({}, 1, 1, true);

            expect(bitmap.length).toBe(1);
            expect(bitmap[0].length).toBe(1);
            expect(bitmap[0][0]).toBe(1);
            expect(fakeDecoder.readNextChar).toHaveBeenCalledTimes(2);
        });
    });

    describe('_PdfJbig2Image._readSegmentHeader', () => {
        it('covers 1-byte referred-to segment number parsing', () => {
            const data: Uint8Array = new Uint8Array(16);

            // segment number = 1 (<= 256 => 1-byte referred segment ids)
            writeUint32(data, 0, 1);
            data[4] = 48;          // PageInformation
            data[5] = 0x20;        // referredToCount = 1
            data[6] = 0x2a;        // one-byte referred-to segment number
            data[7] = 0x01;        // page association
            writeUint32(data, 8, 3); // length

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    number: number;
                    type: number;
                    typeName: string | null;
                    deferredNonRetain: boolean;
                    retainBits: number[];
                    pageAssociation: number;
                    length: number;
                    referredTo: number[];
                    headerEnd: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.number).toBe(1);
            expect(header.type).toBe(48);
            expect(header.typeName).toBe('PageInformation');
            expect(header.referredTo).toEqual([0x2a]);
            expect(header.pageAssociation).toBe(0x01);
            expect(header.length).toBe(3);
        });

        it('covers 2-byte referred-to segment number parsing', () => {
            const data: Uint8Array = new Uint8Array(20);

            // segment number = 300 (>256 and <=65536 => 2-byte referred segment ids)
            writeUint32(data, 0, 300);
            data[4] = 48;           // PageInformation
            data[5] = 0x20;         // referredToCount = 1
            writeUint16(data, 6, 513);
            data[8] = 0x01;         // page association
            writeUint32(data, 9, 5); // length

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    referredTo: number[];
                    length: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.referredTo).toEqual([513]);
            expect(header.length).toBe(5);
        });

        it('covers 4-byte referred-to segment number parsing', () => {
            const data: Uint8Array = new Uint8Array(24);

            // segment number = 70000 (>65536 => 4-byte referred segment ids)
            writeUint32(data, 0, 70000);
            data[4] = 48;           // PageInformation
            data[5] = 0x20;         // referredToCount = 1
            writeUint32(data, 6, 123456);
            data[10] = 0x01;        // page association
            writeUint32(data, 11, 8); // length

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    referredTo: number[];
                    length: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.referredTo).toEqual([123456]);
            expect(header.length).toBe(8);
        });

        it('covers referredFlags === 7 branch, extended retain bits, and extended referred-to parsing', () => {
            const data: Uint8Array = new Uint8Array(80);

            writeUint32(data, 0, 70000);
            data[4] = 48; // valid known segment type: PageInformation
            data[5] = 7;  // force highlighted branch

            // retain bits area read after position += 3
            // position starts at 6, becomes 9
            data[9] = 0xaa;
            data[10] = 0x55;

            // ten 4-byte referred segment ids from position 11
            let position = 11;
            for (let i = 0; i < 10; i++) {
                writeUint32(data, position, i + 1);
                position += 4;
            }

            data[position] = 3; // page association
            position += 1;

            writeUint32(data, position, 12); // length

            const originalReadUint32 = utils._readUnsignedInteger32.bind(utils);
            spyOn(utils, '_readUnsignedInteger32').and.callFake((buffer: Uint8Array, offset: number): number => {
                if (offset === 5) {
                    // make referredToCount small and safe while still entering referredFlags===7 branch
                    return 10;
                }
                return originalReadUint32(buffer, offset);
            });

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    retainBits: number[];
                    referredTo: number[];
                    pageAssociation: number;
                    length: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.retainBits).toEqual([0xaa, 0x55]);
            expect(header.referredTo.length).toBe(10);
            expect(header.referredTo[0]).toBe(1);
            expect(header.referredTo[9]).toBe(10);
            expect(header.pageAssociation).toBe(3);
            expect(header.length).toBe(12);
        });

        it('covers unknown generic-region length search path (0xffffffff)', () => {
            const data: Uint8Array = new Uint8Array(64);

            writeUint32(data, 0, 1);
            data[4] = 38; // ImmediateGenericRegion
            data[5] = 0;  // no referred segments
            data[6] = 1;  // page association
            writeUint32(data, 7, 0xffffffff);

            spyOn(image as unknown as {
                _readRegionSegmentInformation(data: Uint8Array, start: number): {
                    width: number;
                    height: number;
                    x: number;
                    y: number;
                    combinationOperator: number;
                };
            }, '_readRegionSegmentInformation').and.returnValue({
                width: 4,
                height: 5,
                x: 0,
                y: 0,
                combinationOperator: 0
            });

            // position after header fields = 11
            // genericRegionSegmentFlags at position + 17 => 28
            data[28] = 0x00; // mmr = false, so search pattern starts with 0xff, 0xac

            // place search pattern later in the payload
            data[35] = 0xff;
            data[36] = 0xac;
            data[37] = 0x00;
            data[38] = 0x00;
            data[39] = 0x00;
            data[40] = 0x05; // height low byte

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    length: number;
                    type: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.type).toBe(38);
            expect(header.length).toBe(41); // i + searchPatternLength
        });
    });

    describe('_PdfJbig2Image._processSegment highlighted branches', () => {
        it('covers SymbolDictionary refinementAt branch and dispatches _onSymbolDictionary', () => {
            const data: Uint8Array = new Uint8Array(32);

            // dictionaryFlags:
            // huffman = 0
            // refinement = 1
            // template = 0
            // refinementTemplate = 0
            writeUint16(data, 0, 0x0002);

            // dictionary.at for template 0 => 4 pairs
            writeInt8(data, 2, 3); writeInt8(data, 3, -1);
            writeInt8(data, 4, -3); writeInt8(data, 5, -1);
            writeInt8(data, 6, 2); writeInt8(data, 7, -2);
            writeInt8(data, 8, -2); writeInt8(data, 9, -2);

            // refinementAt => 2 pairs
            writeInt8(data, 10, 1); writeInt8(data, 11, 2);
            writeInt8(data, 12, -1); writeInt8(data, 13, -2);

            writeUint32(data, 14, 1); // numberOfExportedSymbols
            writeUint32(data, 18, 1); // numberOfNewSymbols

            const segment: Segment = {
                header: {
                    type: 0,
                    typeName: 'SymbolDictionary',
                    number: 11,
                    referredTo: [4, 5]
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor = {
                _onSymbolDictionary: jasmine.createSpy('_onSymbolDictionary')
            };

            (image as unknown as {
                _processSegment(seg: Segment, visitorInstance: object): void;
            })._processSegment(segment, visitor);

            expect(visitor._onSymbolDictionary).toHaveBeenCalled();
            const args = visitor._onSymbolDictionary.calls.mostRecent().args;
            const dictionary = args[0] as {
                refinement: boolean;
                refinementTemplate: number;
                refinementAt: Array<{ x: number; y: number }>;
            };

            expect(dictionary.refinement).toBeTruthy();
            expect(dictionary.refinementTemplate).toBe(0);
            expect(dictionary.refinementAt).toEqual([
                { x: 1, y: 2 },
                { x: -1, y: -2 }
            ]);
        });

        it('covers ImmediateLosslessTextRegion alias, Huffman flags branch, and refinementAt branch', () => {
            const regionInfo: Uint8Array = createRegionInfoBytes(10, 5, 0, 0, 0);

            // total length:
            // 17 region info
            // 2 textRegionSegmentFlags
            // 2 textRegionHuffmanFlags
            // 4 refinementAt
            // 4 numberOfSymbolInstances
            const data: Uint8Array = new Uint8Array(29);
            data.set(regionInfo, 0);

            // textRegionSegmentFlags:
            // huffman = 1
            // refinement = 1
            // refinementTemplate = 0
            writeUint16(data, 17, 0x0003);

            // textRegionHuffmanFlags:
            // populate all selector fields with non-zero bits
            writeUint16(data, 19, 0x5a95);

            // refinementAt
            writeInt8(data, 21, 2); writeInt8(data, 22, 3);
            writeInt8(data, 23, -2); writeInt8(data, 24, -3);

            writeUint32(data, 25, 1); // numberOfSymbolInstances

            const segment: Segment = {
                header: {
                    type: 7,
                    typeName: 'ImmediateLosslessTextRegion',
                    number: 20,
                    referredTo: [1, 2]
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor = {
                _onImmediateTextRegion: jasmine.createSpy('_onImmediateTextRegion')
            };

            (image as unknown as {
                _processSegment(seg: Segment, visitorInstance: object): void;
            })._processSegment(segment, visitor);

            expect(visitor._onImmediateTextRegion).toHaveBeenCalled();

            const args = visitor._onImmediateTextRegion.calls.mostRecent().args;
            const textRegion = args[0] as {
                huffman: boolean;
                refinement: boolean;
                refinementTemplate: number;
                huffmanFS: number;
                huffmanDS: number;
                huffmanDT: number;
                refinementAt: Array<{ x: number; y: number }>;
                numberOfSymbolInstances: number;
            };

            expect(textRegion.huffman).toBeTruthy();
            expect(textRegion.refinement).toBeTruthy();
            expect(textRegion.refinementTemplate).toBe(0);
            expect(textRegion.huffmanFS).toBe(0x5a95 & 3);
            expect(textRegion.huffmanDS).toBe((0x5a95 >> 2) & 3);
            expect(textRegion.huffmanDT).toBe((0x5a95 >> 4) & 3);
            expect(textRegion.refinementAt).toEqual([
                { x: 2, y: 3 },
                { x: -2, y: -3 }
            ]);
            expect(textRegion.numberOfSymbolInstances).toBe(1);
        });

        it('covers ImmediateLosslessGenericRegion alias dispatch', () => {
            const regionInfo: Uint8Array = createRegionInfoBytes(8, 4, 1, 2, 0);

            // region info + flags + at(4 pairs because template 0 and mmr false)
            const data: Uint8Array = new Uint8Array(26);
            data.set(regionInfo, 0);

            // genericRegionSegmentFlags:
            // mmr = 0
            // template = 0
            // prediction = 0
            data[17] = 0x00;

            writeInt8(data, 18, 3); writeInt8(data, 19, -1);
            writeInt8(data, 20, -3); writeInt8(data, 21, -1);
            writeInt8(data, 22, 2); writeInt8(data, 23, -2);
            writeInt8(data, 24, -2); writeInt8(data, 25, -2);

            const segment: Segment = {
                header: {
                    type: 39,
                    typeName: 'ImmediateLosslessGenericRegion',
                    number: 30,
                    referredTo: []
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor = {
                _onImmediateGenericRegion: jasmine.createSpy('_onImmediateGenericRegion')
            };

            (image as unknown as {
                _processSegment(seg: Segment, visitorInstance: object): void;
            })._processSegment(segment, visitor);

            expect(visitor._onImmediateGenericRegion).toHaveBeenCalled();

            const args = visitor._onImmediateGenericRegion.calls.mostRecent().args;
            const region = args[0] as {
                mmr: boolean;
                template: number;
                prediction: boolean;
                at: Array<{ x: number; y: number }>;
            };

            expect(region.mmr).toBeFalsy();
            expect(region.template).toBe(0);
            expect(region.prediction).toBeFalsy();
            expect(region.at).toEqual([
                { x: 3, y: -1 },
                { x: -3, y: -1 },
                { x: 2, y: -2 },
                { x: -2, y: -2 }
            ]);
        });

        it('covers ImmediateLosslessHalftoneRegion alias dispatch', () => {
            const regionInfo: Uint8Array = createRegionInfoBytes(16, 8, 0, 0, 0);

            // 17 region info + 1 flags + 4 + 4 + 4 + 4 + 2 + 2 = 38
            const data: Uint8Array = new Uint8Array(38);
            data.set(regionInfo, 0);

            // halftoneRegionFlags:
            // mmr = 0
            // template = 0
            // enableSkip = 0
            // combinationOperator = 0
            // defaultPixelValue = 0
            data[17] = 0x00;

            writeUint32(data, 18, 2);  // gridWidth
            writeUint32(data, 22, 2);  // gridHeight
            writeUint32(data, 26, 0);  // gridOffsetX
            writeUint32(data, 30, 0);  // gridOffsetY
            writeUint16(data, 34, 1);  // gridVectorX
            writeUint16(data, 36, 1);  // gridVectorY

            const segment: Segment = {
                header: {
                    type: 23,
                    typeName: 'ImmediateLosslessHalftoneRegion',
                    number: 40,
                    referredTo: [99]
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor = {
                _onImmediateHalftoneRegion: jasmine.createSpy('_onImmediateHalftoneRegion')
            };

            (image as unknown as {
                _processSegment(seg: Segment, visitorInstance: object): void;
            })._processSegment(segment, visitor);

            expect(visitor._onImmediateHalftoneRegion).toHaveBeenCalled();

            const args = visitor._onImmediateHalftoneRegion.calls.mostRecent().args;
            const region = args[0] as {
                gridWidth: number;
                gridHeight: number;
                gridVectorX: number;
                gridVectorY: number;
            };

            expect(region.gridWidth).toBe(2);
            expect(region.gridHeight).toBe(2);
            expect(region.gridVectorX).toBe(1);
            expect(region.gridVectorY).toBe(1);
        });

        it('covers PageInformation dispatch branch', () => {
            const data: Uint8Array = new Uint8Array(19);

            writeUint32(data, 0, 100); // width
            writeUint32(data, 4, 200); // height
            writeUint32(data, 8, 300); // resolutionX
            writeUint32(data, 12, 400); // resolutionY

            // pageSegmentFlags
            // lossless = 1
            // refinement = 1
            // defaultPixelValue = 1
            // combinationOperator = 2
            // requiresBuffer = 1
            // combinationOperatorOverride = 1
            data[16] = 0x6f;

            writeUint16(data, 17, 0); // ignored but read

            const segment: Segment = {
                header: {
                    type: 48,
                    typeName: 'PageInformation',
                    number: 50,
                    referredTo: []
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor = {
                _onPageInformation: jasmine.createSpy('_onPageInformation')
            };

            (image as unknown as {
                _processSegment(seg: Segment, visitorInstance: object): void;
            })._processSegment(segment, visitor);

            expect(visitor._onPageInformation).toHaveBeenCalled();

            const pageInfoArray = visitor._onPageInformation.calls.mostRecent().args[0] as Array<{
                width: number;
                height: number;
                resolutionX: number;
                resolutionY: number;
                lossless: boolean;
                refinement: boolean;
                defaultPixelValue: number;
                combinationOperator: number;
                requiresBuffer: boolean;
                combinationOperatorOverride: boolean;
            }>;

            expect(pageInfoArray[0].width).toBe(100);
            expect(pageInfoArray[0].height).toBe(200);
            expect(pageInfoArray[0].resolutionX).toBe(300);
            expect(pageInfoArray[0].resolutionY).toBe(400);
            expect(pageInfoArray[0].lossless).toBeTruthy();
            expect(pageInfoArray[0].refinement).toBeTruthy();
            expect(pageInfoArray[0].defaultPixelValue).toBe(1);
            expect(pageInfoArray[0].combinationOperator).toBe(1);
            expect(pageInfoArray[0].requiresBuffer).toBeTruthy();
            expect(pageInfoArray[0].combinationOperatorOverride).toBeTruthy();
        });
    });
});


interface IRegionInfo {
    width: number;
    height: number;
    x: number;
    y: number;
    combinationOperator: number;
}

interface ISegmentHeader {
    type: number;
    typeName: string;
    number: number;
    referredTo: number[];
}

interface ISegment {
    header: ISegmentHeader;
    data: Uint8Array;
    start: number;
    end: number;
}

interface IArithmeticDecoderLike {
    _readBit(contexts: Int8Array, state: number): number;
}

interface IContextCacheLike {
    getContexts(id: string | number): Int8Array;
}

interface IDecodingContextLike {
    _data?: Uint8Array;
    _start?: number;
    _end?: number;
    data?: Uint8Array;
    start?: number;
    end?: number;
    decoder: IArithmeticDecoderLike;
    contextCache: IContextCacheLike;
}

interface IBitReaderLike {
    _readBit(): number;
    _readBits(length: number): number;
}



function createDecodingContext(bitValue: number = 1): IDecodingContextLike {
    return {
        decoder: {
            _readBit: jasmine.createSpy('_readBit').and.returnValue(bitValue)
        },
        contextCache: {
            getContexts: jasmine.createSpy('getContexts').and.returnValue(new Int8Array(1 << 4))
        }
    };
}

describe('JBIG2 highlighted / uncovered coverage', () => {
    let image: _PdfJbig2Image;
    function writeUint32(buffer: Uint8Array, offset: number, value: number): void {
        buffer[offset] = (value >>> 24) & 0xff;
        buffer[offset + 1] = (value >>> 16) & 0xff;
        buffer[offset + 2] = (value >>> 8) & 0xff;
        buffer[offset + 3] = value & 0xff;
    }

    function writeUint16(buffer: Uint8Array, offset: number, value: number): void {
        buffer[offset] = (value >>> 8) & 0xff;
        buffer[offset + 1] = value & 0xff;
    }

    function writeInt8(buffer: Uint8Array, offset: number, value: number): void {
        buffer[offset] = value & 0xff;
    }

    function createRegionInfoBytes(
        width: number,
        height: number,
        x: number,
        y: number,
        combinationOperator: number
    ): Uint8Array {
        const buffer: Uint8Array = new Uint8Array(17);
        writeUint32(buffer, 0, width);
        writeUint32(buffer, 4, height);
        writeUint32(buffer, 8, x);
        writeUint32(buffer, 12, y);
        buffer[16] = combinationOperator & 0x07;
        return buffer;
    }
    beforeEach((): void => {
        image = new _PdfJbig2Image();
    });

    describe('_PdfSimpleSegmentVisitor._decodeMmrBitmap', () => {
        it('covers endOfBlock cleanup loop and break branch', () => {
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();

            const fakeDecoder: { readNextChar: jasmine.Spy } = {
                readNextChar: jasmine.createSpy('readNextChar').and.returnValues(0x80, -1)
            };

            spyOn(faxDecoderModule, '_PdfFaxDecoder')
                .and.returnValue(fakeDecoder as unknown as _PdfFaxDecoder);

            const bitmap: Uint8Array[] = (visitor as unknown as {
                _decodeMmrBitmap(input: object, width: number, height: number, endOfBlock: boolean): Uint8Array[];
            })._decodeMmrBitmap({}, 1, 1, true);

            expect(bitmap.length).toBe(1);
            expect(bitmap[0].length).toBe(1);
            expect(bitmap[0][0]).toBe(1);
            expect(fakeDecoder.readNextChar).toHaveBeenCalledTimes(2);
        });
    });

    describe('_PdfJbig2Image._readSegmentHeader', () => {
        it('covers 1-byte referred-to segment number parsing', () => {
            const data: Uint8Array = new Uint8Array(16);
            writeUint32(data, 0, 1);
            data[4] = 48;
            data[5] = 0x20;
            data[6] = 0x2a;
            data[7] = 0x01;
            writeUint32(data, 8, 3);

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    number: number;
                    type: number;
                    typeName: string | null;
                    referredTo: number[];
                    pageAssociation: number;
                    length: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.number).toBe(1);
            expect(header.type).toBe(48);
            expect(header.typeName).toBe('PageInformation');
            expect(header.referredTo).toEqual([0x2a]);
            expect(header.pageAssociation).toBe(0x01);
            expect(header.length).toBe(3);
        });

        it('covers 2-byte referred-to segment number parsing', () => {
            const data: Uint8Array = new Uint8Array(20);
            writeUint32(data, 0, 300);
            data[4] = 48;
            data[5] = 0x20;
            writeUint16(data, 6, 513);
            data[8] = 0x01;
            writeUint32(data, 9, 5);

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    referredTo: number[];
                    length: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.referredTo).toEqual([513]);
            expect(header.length).toBe(5);
        });

        it('covers 4-byte referred-to segment number parsing', () => {
            const data: Uint8Array = new Uint8Array(24);
            writeUint32(data, 0, 70000);
            data[4] = 48;
            data[5] = 0x20;
            writeUint32(data, 6, 123456);
            data[10] = 0x01;
            writeUint32(data, 11, 8);

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    referredTo: number[];
                    length: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.referredTo).toEqual([123456]);
            expect(header.length).toBe(8);
        });

        it('covers referredFlags === 7, extended retain bits, and extended referred-to parsing', () => {
            const data: Uint8Array = new Uint8Array(80);
            writeUint32(data, 0, 70000);
            data[4] = 48;
            data[5] = 7;

            data[9] = 0xaa;
            data[10] = 0x55;

            let position: number = 11;
            for (let i: number = 0; i < 10; i++) {
                writeUint32(data, position, i + 1);
                position += 4;
            }

            data[position] = 3;
            position += 1;
            writeUint32(data, position, 12);

            const originalReadUint32: (buffer: Uint8Array, offset: number) => number =
                utils._readUnsignedInteger32.bind(utils);

            spyOn(utils, '_readUnsignedInteger32').and.callFake((buffer: Uint8Array, offset: number): number => {
                if (offset === 5) {
                    return 10;
                }
                return originalReadUint32(buffer, offset);
            });

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    retainBits: number[];
                    referredTo: number[];
                    pageAssociation: number;
                    length: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.retainBits).toEqual([0xaa, 0x55]);
            expect(header.referredTo.length).toBe(10);
            expect(header.referredTo[0]).toBe(1);
            expect(header.referredTo[9]).toBe(10);
            expect(header.pageAssociation).toBe(3);
            expect(header.length).toBe(12);
        });

        it('covers unknown generic-region length search success path', () => {
            const data: Uint8Array = new Uint8Array(64);

            writeUint32(data, 0, 1);
            data[4] = 38;
            data[5] = 0;
            data[6] = 1;
            writeUint32(data, 7, 0xffffffff);

            spyOn(image as unknown as {
                _readRegionSegmentInformation(data: Uint8Array, start: number): IRegionInfo;
            }, '_readRegionSegmentInformation').and.returnValue({
                width: 4,
                height: 5,
                x: 0,
                y: 0,
                combinationOperator: 0
            });

            data[28] = 0x00;
            data[35] = 0xff;
            data[36] = 0xac;
            data[37] = 0x00;
            data[38] = 0x00;
            data[39] = 0x00;
            data[40] = 0x05;

            const header = (image as unknown as {
                _readSegmentHeader(bytes: Uint8Array, start: number): {
                    length: number;
                    type: number;
                };
            })._readSegmentHeader(data, 0);

            expect(header.type).toBe(38);
            expect(header.length).toBe(41);
        });

        it('covers unknown generic-region length throw path when end marker is not found', () => {
            const data: Uint8Array = new Uint8Array(40);

            writeUint32(data, 0, 1);
            data[4] = 38;
            data[5] = 0;
            data[6] = 1;
            writeUint32(data, 7, 0xffffffff);

            spyOn(image as unknown as {
                _readRegionSegmentInformation(data: Uint8Array, start: number): IRegionInfo;
            }, '_readRegionSegmentInformation').and.returnValue({
                width: 4,
                height: 5,
                x: 0,
                y: 0,
                combinationOperator: 0
            });

            data[28] = 0x00;

            expect((): void => {
                (image as unknown as {
                    _readSegmentHeader(bytes: Uint8Array, start: number): unknown;
                })._readSegmentHeader(data, 0);
            }).toThrowError('Decoding error: Unable to find the end of the segment');
        });
    });

    describe('_PdfJbig2Image._processSegment', () => {
        it('covers SymbolDictionary refinementAt branch and dispatches _onSymbolDictionary', () => {
            const data: Uint8Array = new Uint8Array(32);

            writeUint16(data, 0, 0x0002);

            writeInt8(data, 2, 3); writeInt8(data, 3, -1);
            writeInt8(data, 4, -3); writeInt8(data, 5, -1);
            writeInt8(data, 6, 2); writeInt8(data, 7, -2);
            writeInt8(data, 8, -2); writeInt8(data, 9, -2);

            writeInt8(data, 10, 1); writeInt8(data, 11, 2);
            writeInt8(data, 12, -1); writeInt8(data, 13, -2);

            writeUint32(data, 14, 1);
            writeUint32(data, 18, 1);

            const segment: ISegment = {
                header: {
                    type: 0,
                    typeName: 'SymbolDictionary',
                    number: 11,
                    referredTo: [4, 5]
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor: { _onSymbolDictionary: jasmine.Spy } = {
                _onSymbolDictionary: jasmine.createSpy('_onSymbolDictionary')
            };

            (image as unknown as {
                _processSegment(seg: ISegment, visitorInstance: { _onSymbolDictionary: jasmine.Spy }): void;
            })._processSegment(segment, visitor);

            expect(visitor._onSymbolDictionary).toHaveBeenCalled();

            const args: unknown[] = visitor._onSymbolDictionary.calls.mostRecent().args;
            const dictionary = args[0] as {
                refinement: boolean;
                refinementTemplate: number;
                refinementAt: Array<{ x: number; y: number }>;
            };

            expect(dictionary.refinement).toBeTruthy();
            expect(dictionary.refinementTemplate).toBe(0);
            expect(dictionary.refinementAt).toEqual([
                { x: 1, y: 2 },
                { x: -1, y: -2 }
            ]);
        });

        it('covers ImmediateLosslessTextRegion alias, huffman flags branch, and refinementAt branch', () => {
            const regionInfo: Uint8Array = createRegionInfoBytes(10, 5, 0, 0, 0);
            const data: Uint8Array = new Uint8Array(29);
            data.set(regionInfo, 0);

            writeUint16(data, 17, 0x0003);
            writeUint16(data, 19, 0x5a95);

            writeInt8(data, 21, 2); writeInt8(data, 22, 3);
            writeInt8(data, 23, -2); writeInt8(data, 24, -3);

            writeUint32(data, 25, 1);

            const segment: ISegment = {
                header: {
                    type: 7,
                    typeName: 'ImmediateLosslessTextRegion',
                    number: 20,
                    referredTo: [1, 2]
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor: { _onImmediateTextRegion: jasmine.Spy } = {
                _onImmediateTextRegion: jasmine.createSpy('_onImmediateTextRegion')
            };

            (image as unknown as {
                _processSegment(seg: ISegment, visitorInstance: { _onImmediateTextRegion: jasmine.Spy }): void;
            })._processSegment(segment, visitor);

            expect(visitor._onImmediateTextRegion).toHaveBeenCalled();

            const args: unknown[] = visitor._onImmediateTextRegion.calls.mostRecent().args;
            const textRegion = args[0] as {
                huffman: boolean;
                refinement: boolean;
                refinementTemplate: number;
                huffmanFS: number;
                huffmanDS: number;
                huffmanDT: number;
                refinementAt: Array<{ x: number; y: number }>;
                numberOfSymbolInstances: number;
            };

            expect(textRegion.huffman).toBeTruthy();
            expect(textRegion.refinement).toBeTruthy();
            expect(textRegion.refinementTemplate).toBe(0);
            expect(textRegion.huffmanFS).toBe(0x5a95 & 3);
            expect(textRegion.huffmanDS).toBe((0x5a95 >> 2) & 3);
            expect(textRegion.huffmanDT).toBe((0x5a95 >> 4) & 3);
            expect(textRegion.refinementAt).toEqual([
                { x: 2, y: 3 },
                { x: -2, y: -3 }
            ]);
            expect(textRegion.numberOfSymbolInstances).toBe(1);
        });

        it('covers ImmediateLosslessGenericRegion alias dispatch', () => {
            const regionInfo: Uint8Array = createRegionInfoBytes(8, 4, 1, 2, 0);
            const data: Uint8Array = new Uint8Array(26);
            data.set(regionInfo, 0);

            data[17] = 0x00;

            writeInt8(data, 18, 3); writeInt8(data, 19, -1);
            writeInt8(data, 20, -3); writeInt8(data, 21, -1);
            writeInt8(data, 22, 2); writeInt8(data, 23, -2);
            writeInt8(data, 24, -2); writeInt8(data, 25, -2);

            const segment: ISegment = {
                header: {
                    type: 39,
                    typeName: 'ImmediateLosslessGenericRegion',
                    number: 30,
                    referredTo: []
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor: { _onImmediateGenericRegion: jasmine.Spy } = {
                _onImmediateGenericRegion: jasmine.createSpy('_onImmediateGenericRegion')
            };

            (image as unknown as {
                _processSegment(seg: ISegment, visitorInstance: { _onImmediateGenericRegion: jasmine.Spy }): void;
            })._processSegment(segment, visitor);

            expect(visitor._onImmediateGenericRegion).toHaveBeenCalled();

            const args: unknown[] = visitor._onImmediateGenericRegion.calls.mostRecent().args;
            const region = args[0] as {
                mmr: boolean;
                template: number;
                prediction: boolean;
                at: Array<{ x: number; y: number }>;
            };

            expect(region.mmr).toBeFalsy();
            expect(region.template).toBe(0);
            expect(region.prediction).toBeFalsy();
            expect(region.at).toEqual([
                { x: 3, y: -1 },
                { x: -3, y: -1 },
                { x: 2, y: -2 },
                { x: -2, y: -2 }
            ]);
        });

        it('covers ImmediateLosslessHalftoneRegion alias dispatch', () => {
            const regionInfo: Uint8Array = createRegionInfoBytes(16, 8, 0, 0, 0);
            const data: Uint8Array = new Uint8Array(38);
            data.set(regionInfo, 0);

            data[17] = 0x00;

            writeUint32(data, 18, 2);
            writeUint32(data, 22, 2);
            writeUint32(data, 26, 0);
            writeUint32(data, 30, 0);
            writeUint16(data, 34, 1);
            writeUint16(data, 36, 1);

            const segment: ISegment = {
                header: {
                    type: 23,
                    typeName: 'ImmediateLosslessHalftoneRegion',
                    number: 40,
                    referredTo: [99]
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor: { _onImmediateHalftoneRegion: jasmine.Spy } = {
                _onImmediateHalftoneRegion: jasmine.createSpy('_onImmediateHalftoneRegion')
            };

            (image as unknown as {
                _processSegment(seg: ISegment, visitorInstance: { _onImmediateHalftoneRegion: jasmine.Spy }): void;
            })._processSegment(segment, visitor);

            expect(visitor._onImmediateHalftoneRegion).toHaveBeenCalled();

            const args: unknown[] = visitor._onImmediateHalftoneRegion.calls.mostRecent().args;
            const region = args[0] as {
                gridWidth: number;
                gridHeight: number;
                gridVectorX: number;
                gridVectorY: number;
            };

            expect(region.gridWidth).toBe(2);
            expect(region.gridHeight).toBe(2);
            expect(region.gridVectorX).toBe(1);
            expect(region.gridVectorY).toBe(1);
        });

        it('covers PageInformation dispatch branch', () => {
            const data: Uint8Array = new Uint8Array(19);

            writeUint32(data, 0, 100);
            writeUint32(data, 4, 200);
            writeUint32(data, 8, 300);
            writeUint32(data, 12, 400);

            data[16] = 0x6f;
            writeUint16(data, 17, 0);

            const segment: ISegment = {
                header: {
                    type: 48,
                    typeName: 'PageInformation',
                    number: 50,
                    referredTo: []
                },
                data,
                start: 0,
                end: data.length
            };

            const visitor: { _onPageInformation: jasmine.Spy } = {
                _onPageInformation: jasmine.createSpy('_onPageInformation')
            };

            (image as unknown as {
                _processSegment(seg: ISegment, visitorInstance: { _onPageInformation: jasmine.Spy }): void;
            })._processSegment(segment, visitor);

            expect(visitor._onPageInformation).toHaveBeenCalled();

            const pageInfoArray = visitor._onPageInformation.calls.mostRecent().args[0] as Array<{
                width: number;
                height: number;
                resolutionX: number;
                resolutionY: number;
                lossless: boolean;
                refinement: boolean;
                defaultPixelValue: number;
                combinationOperator: number;
                requiresBuffer: boolean;
                combinationOperatorOverride: boolean;
            }>;

            expect(pageInfoArray[0].width).toBe(100);
            expect(pageInfoArray[0].height).toBe(200);
            expect(pageInfoArray[0].resolutionX).toBe(300);
            expect(pageInfoArray[0].resolutionY).toBe(400);
            expect(pageInfoArray[0].lossless).toBeTruthy();
            expect(pageInfoArray[0].refinement).toBeTruthy();
            expect(pageInfoArray[0].defaultPixelValue).toBe(1);
            expect(pageInfoArray[0].combinationOperator).toBe(1);
            expect(pageInfoArray[0].requiresBuffer).toBeTruthy();
            expect(pageInfoArray[0].combinationOperatorOverride).toBeTruthy();
        });
    });

    describe('_PdfSimpleSegmentVisitor._decodeRefinement', () => {
        it('covers in-bounds referenceBitmap branch', () => {
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const referenceBitmap: Uint8Array[] = [
                new Uint8Array([1, 0]),
                new Uint8Array([0, 1])
            ];

            const decodingContext: IDecodingContextLike = createDecodingContext(1);

            const bitmap: Uint8Array[] = (visitor as unknown as {
                _decodeRefinement(
                    width: number,
                    height: number,
                    templateIndex: number,
                    referenceBitmap: Uint8Array[],
                    offsetX: number,
                    offsetY: number,
                    prediction: boolean,
                    at: Array<{ x: number; y: number }>,
                    decodingContext: IDecodingContextLike
                ): Uint8Array[];
            })._decodeRefinement(
                1,
                1,
                0,
                referenceBitmap,
                0,
                0,
                false,
                [{ x: 0, y: 0 }, { x: 0, y: 0 }],
                decodingContext
            );

            expect(bitmap.length).toBe(1);
            expect(bitmap[0].length).toBe(1);
            expect(bitmap[0][0]).toBe(1);
        });
    });

    describe('_PdfSimpleSegmentVisitor._decodeHalftoneRegion', () => {
        it('covers defaultPixelValue fill and regionY out-of-range continue branch', () => {
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();

            const patterns: Uint8Array[][] = [
                [
                    new Uint8Array([0]),
                    new Uint8Array([0])
                ],
                [
                    new Uint8Array([1]),
                    new Uint8Array([1])
                ]
            ];

            spyOn(visitor as unknown as {
                _decodeBitmap(
                    mmr: boolean,
                    width: number,
                    height: number,
                    template: number,
                    prediction: boolean,
                    skip: boolean[][] | null,
                    at: Array<{ x: number; y: number }>,
                    decodingContext: IDecodingContextLike
                ): Uint8Array[];
            }, '_decodeBitmap').and.returnValue([
                new Uint8Array([1])
            ]);

            const regionBitmap: Uint8Array[] = (visitor as unknown as {
                _decodeHalftoneRegion(
                    mmr: boolean,
                    patterns: Uint8Array[][],
                    template: number,
                    regionWidth: number,
                    regionHeight: number,
                    defaultPixelValue: number,
                    enableSkip: boolean,
                    combinationOperator: number,
                    gridWidth: number,
                    gridHeight: number,
                    gridOffsetX: number,
                    gridOffsetY: number,
                    gridVectorX: number,
                    gridVectorY: number,
                    decodingContext: IDecodingContextLike
                ): Uint8Array[];
            })._decodeHalftoneRegion(
                false,
                patterns,
                0,
                2,
                2,
                1,
                false,
                0,
                1,
                1,
                0,
                -256,
                0,
                0,
                createDecodingContext(1)
            );

            expect(regionBitmap.length).toBe(2);
            expect(Array.from(regionBitmap[0])).toEqual([1, 1]);
            expect(Array.from(regionBitmap[1])).toEqual([1, 1]);
        });
    });

    describe('_PdfHuffmanTreeNode._decodeNode', () => {
        it('covers isoob returning null', () => {
            const line: _PdfHuffmanLine = new _PdfHuffmanLine([3, 0]);
            const node: _PdfHuffmanTreeNode = new _PdfHuffmanTreeNode(line);

            const reader: IBitReaderLike = {
                _readBit: (): number => 0,
                _readBits: (): number => 0
            };

            const result: number | null = (node as unknown as {
                _decodeNode(bitReader: IBitReaderLike): number | null;
            })._decodeNode(reader);

            expect(result).toBeNull();
        });
    });

    describe('_PdfSimpleSegmentVisitor._decodePatternDictionary', () => {
        it('covers !mmr branch and template === 0 branch', () => {
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();

            const decodeBitmapSpy = spyOn(visitor as unknown as {
                _decodeBitmap(
                    mmr: boolean,
                    width: number,
                    height: number,
                    template: number,
                    prediction: boolean,
                    skip: boolean[][] | null,
                    at: Array<{ x: number; y: number }>,
                    decodingContext: IDecodingContextLike
                ): Uint8Array[];
            }, '_decodeBitmap').and.returnValue([
                new Uint8Array([1, 0]),
                new Uint8Array([0, 1])
            ]);

            const patterns = (visitor as unknown as {
                _decodePatternDictionary(
                    mmr: boolean,
                    patternWidth: number,
                    patternHeight: number,
                    maxPatternIndex: number,
                    template: number,
                    decodingContext: IDecodingContextLike
                ): Uint8Array[][];
            })._decodePatternDictionary(
                false,
                1,
                2,
                1,
                0,
                createDecodingContext(1)
            );

            expect(decodeBitmapSpy).toHaveBeenCalled();
            const at = decodeBitmapSpy.calls.mostRecent().args[6] as Array<{ x: number; y: number }>;
            expect(at).toEqual([
                { x: -1, y: 0 },
                { x: -3, y: -1 },
                { x: 2, y: -2 },
                { x: -2, y: -2 }
            ]);

            expect(patterns.length).toBe(2);
            expect(Array.from(patterns[0][0])).toEqual([1]);
            expect(Array.from(patterns[0][1])).toEqual([0]);
            expect(Array.from(patterns[1][0])).toEqual([0]);
            expect(Array.from(patterns[1][1])).toEqual([1]);
        });
    });

    describe('_PdfSimpleSegmentVisitor._decodeTextRegion', () => {
        it('covers transposed combinationOperator=0 branch and deltaS undefined break', () => {
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const decodingContext: IDecodingContextLike = createDecodingContext(1);

            const symbolBitmap: Uint8Array[] = [
                new Uint8Array([1]),
                new Uint8Array([1])
            ];

            const decodeIntegerSpy = spyOn(visitor as unknown as {
                _decodeInteger(contextCache: IContextCacheLike, procedure: string, decoder: IArithmeticDecoderLike): number | undefined;
            }, '_decodeInteger').and.callFake((
                _contextCache: IContextCacheLike,
                procedure: string,
                _decoder: IArithmeticDecoderLike
            ): number | undefined => {
                switch (procedure) {
                    case 'IADT':
                        return 0;
                    case 'IAFS':
                        return 0;
                    case 'IADS':
                        return undefined;
                    default:
                        return 0;
                }
            });

            spyOn(visitor as unknown as {
                _decodeImageData(contextCache: IContextCacheLike, decoder: IArithmeticDecoderLike, codeLength: number): number;
            }, '_decodeImageData').and.returnValue(0);

            const bitmap: Uint8Array[] = (visitor as unknown as {
                _decodeTextRegion(
                    huffman: boolean,
                    refinement: boolean,
                    width: number,
                    height: number,
                    defaultPixelValue: number,
                    numberOfSymbolInstances: number,
                    stripSize: number,
                    inputSymbols: Uint8Array[][],
                    symbolCodeLength: number,
                    transposed: boolean,
                    dsOffset: number,
                    referenceCorner: number,
                    combinationOperator: number,
                    huffmanTables: object | null,
                    refinementTemplateIndex: number,
                    refinementAt: Array<{ x: number; y: number }> | null,
                    decodingContext: IDecodingContextLike,
                    logStripSize: number,
                    huffmanInput: object | null
                ): Uint8Array[];
            })._decodeTextRegion(
                false,
                false,
                3,
                3,
                0,
                1,
                1,
                [symbolBitmap],
                1,
                true,
                0,
                1,
                0,
                null,
                0,
                null,
                decodingContext,
                0,
                null
            );

            expect(decodeIntegerSpy).toHaveBeenCalled();
            expect(bitmap[0][0]).toBe(1);
            expect(bitmap[1][0]).toBe(1);
        });
    });

    describe('_PdfSimpleSegmentVisitor._decodeSymbolDictionary', () => {
        it('covers exportedSymbols.push(symbols[i]) for existing symbols', () => {
            const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();
            const existingSymbol: Uint8Array[] = [
                new Uint8Array([1])
            ];

            const decodingContext: IDecodingContextLike = createDecodingContext(1);

            spyOn(visitor as unknown as {
                _decodeInteger(contextCache: IContextCacheLike, procedure: string, decoder: IArithmeticDecoderLike): number;
            }, '_decodeInteger').and.callFake((
                _contextCache: IContextCacheLike,
                procedure: string,
                _decoder: IArithmeticDecoderLike
            ): number => {
                if (procedure === 'IAEX') {
                    const calls = typeof (visitor as unknown as { __iaexCount?: number }).__iaexCount === 'number'
                        ? (visitor as unknown as { __iaexCount?: number }).__iaexCount as number
                        : 0;
                    (visitor as unknown as { __iaexCount: number }).__iaexCount = calls + 1;
                    return calls === 0 ? 0 : 1;
                }
                return 0;
            });

            const exportedSymbols = (visitor as unknown as {
                _decodeSymbolDictionary(
                    huffman: boolean,
                    refinement: boolean,
                    symbols: Uint8Array[][],
                    numberOfNewSymbols: number,
                    numberOfExportedSymbols: number,
                    huffmanTables: object | null,
                    templateIndex: number,
                    at: Array<{ x: number; y: number }>,
                    refinementTemplateIndex: number,
                    refinementAt: Array<{ x: number; y: number }>,
                    decodingContext: IDecodingContextLike,
                    huffmanInput: object | null
                ): Uint8Array[][];
            })._decodeSymbolDictionary(
                false,
                false,
                [existingSymbol],
                0,
                1,
                null,
                0,
                [],
                0,
                [],
                decodingContext,
                null
            );

            expect(exportedSymbols.length).toBe(1);
            expect(exportedSymbols[0]).toBe(existingSymbol);
        });
    });
});
describe('_PdfSimpleSegmentVisitor _decodeTextRegion coverage', () => {
    it('should cover currentS += increment + deltaS + dsOffset line', () => {
        const visitor: _PdfSimpleSegmentVisitor = new _PdfSimpleSegmentVisitor();

        let iadsCallCount: number = 0;

        spyOn(visitor as any, '_decodeInteger').and.callFake(function (
            _contextCache: any, // eslint-disable-line
            procedure: string,
            _decoder: any // eslint-disable-line
        ): any { // eslint-disable-line
            switch (procedure) {
            case 'IADT':
                // stripT / deltaT
                return 0;
            case 'IAFS':
                // deltaFirstS
                return 0;
            case 'IADS':
                // first time => valid deltaS so the highlighted line executes
                // second time => undefined so loop breaks safely
                iadsCallCount++;
                if (iadsCallCount === 1) {
                    return 1;
                }
                return undefined;
            default:
                return 0;
            }
        });

        spyOn(visitor as any, '_decodeImageData').and.returnValue(0);

        const decodingContext: any = { // eslint-disable-line
            decoder: {},
            contextCache: {}
        };

        const inputSymbols: any[] = [ // eslint-disable-line
            [
                new Uint8Array([1, 1])
            ]
        ];

        const bitmap: Uint8Array[] = (visitor as any)._decodeTextRegion( // eslint-disable-line
            false,        
            false,          
            6,              
            3,             
            0,             
            2,           
            1,              
            inputSymbols,  
            1,             
            false,         
            1,           
            0,             
            0,              
            null,          
            0,              
            null,           
            decodingContext,
            0,             
            null            
        );

        expect(bitmap).toBeDefined();
        expect(bitmap.length).toBe(3);
        expect(bitmap[0][0]).toBe(1);
        expect(bitmap[0][1]).toBe(1);
        expect(bitmap[0][3]).toBe(1);
        expect(bitmap[0][4]).toBe(1);
    });
});
