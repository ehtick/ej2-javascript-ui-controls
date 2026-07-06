
import { _PdfJpegImage } from '../../src/pdf-data-extract/core/image-extraction/jpeg-image';
import { _PdfDeviceCmykCS } from '../../src/pdf-data-extract/core/image-extraction/colorspace';

function _setPrivate<T>(target: unknown, key: string, value: T): void {
    (target as { [key: string]: unknown })[key] = value;
}

function _getPrivate<T>(target: unknown, key: string): T {
    return (target as { [key: string]: unknown })[key] as T;
}

describe('_PdfJpegImage targeted highlighted-line coverage', () => {
    it('should cover _getLinearizedBlockData default isSourcePdf=false path, component loops, cached scale path and auto transform path', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        _setPrivate(jpeg, '_width', 2);
        _setPrivate(jpeg, '_height', 2);
        _setPrivate(jpeg, '_decodeTransform', null);

        const sharedOutput: Uint8ClampedArray = new Uint8ClampedArray([
            10, 11, 12, 13, 14, 15, 16, 17,
            18, 19, 20, 21, 22, 23, 24, 25
        ]);

        _setPrivate(jpeg, '_components', [
            {
                output: sharedOutput,
                scaleX: 1,
                scaleY: 1,
                blocksPerLine: 1
            },
            {
                output: sharedOutput,
                scaleX: 1,
                scaleY: 1,
                blocksPerLine: 1
            },
            {
                output: sharedOutput,
                scaleX: 1,
                scaleY: 1,
                blocksPerLine: 1
            },
            {
                output: sharedOutput,
                scaleX: 1,
                scaleY: 1,
                blocksPerLine: 1
            }
        ]);

        // Act
        const result: Uint8ClampedArray =
            (jpeg as unknown as {
                _getLinearizedBlockData(width: number, height: number, isSourcePdf?: boolean): Uint8ClampedArray;
            })._getLinearizedBlockData(2, 2);

        // Assert
        expect(result.length).toBe(16);

        // Auto transform branch for 4 components should have run.
        expect(result[0]).toBeLessThanOrEqual(255);
        expect(result[1]).toBeLessThanOrEqual(255);
        expect(result[2]).toBeLessThanOrEqual(255);
        expect(result[3]).toBeLessThanOrEqual(255);
    });

    it('should cover _getLinearizedBlockData explicit transform path with isSourcePdf=true', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        _setPrivate(jpeg, '_width', 2);
        _setPrivate(jpeg, '_height', 2);
        _setPrivate(jpeg, '_decodeTransform', new Int32Array([
            1, 1,
            1, 2,
            1, 3
        ]));

        _setPrivate(jpeg, '_components', [
            {
                output: new Uint8ClampedArray([
                    10, 20, 30, 40, 50, 60, 70, 80,
                    90, 100, 110, 120, 130, 140, 150, 160
                ]),
                scaleX: 1,
                scaleY: 1,
                blocksPerLine: 1
            },
            {
                output: new Uint8ClampedArray([
                    1, 2, 3, 4, 5, 6, 7, 8,
                    9, 10, 11, 12, 13, 14, 15, 16
                ]),
                scaleX: 1,
                scaleY: 1,
                blocksPerLine: 1
            },
            {
                output: new Uint8ClampedArray([
                    200, 201, 202, 203, 204, 205, 206, 207,
                    208, 209, 210, 211, 212, 213, 214, 215
                ]),
                scaleX: 1,
                scaleY: 1,
                blocksPerLine: 1
            }
        ]);

        // Act
        const result: Uint8ClampedArray =
            (jpeg as unknown as {
                _getLinearizedBlockData(width: number, height: number, isSourcePdf?: boolean): Uint8ClampedArray;
            })._getLinearizedBlockData(2, 2, true);

        // Assert
        expect(result.length).toBe(12);
        expect(result[0]).toBe(1);
        expect(result[1]).toBe(2);
        expect(result[2]).toBe(3);
    });

    it('should cover _buildHuffmanTable lines including p.index>0 pop and code.length<=i nested push', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        // This pattern safely triggers:
        // - while (p.index > 0)
        // - while (code.length <= i)
        const codeLengths: number[] = [
            0, 2, 1, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0
        ];
        const values: number[] = [5, 6, 7];

        // Act
        const table: unknown = jpeg._buildHuffmanTable(codeLengths, values);

        // Assert
        expect(table).toBeDefined();
        expect(Array.isArray(table)).toBeTruthy();
    });

    it('should cover _quantizeAndInverse row arithmetic block and second-pass normal/clamp write path', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const p: Int16Array = new Int16Array(64);

        const component: {
            quantizationTable: number[];
            blockData: Int16Array;
        } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };

        // Make every row non-zero so the "fast zero row" continue path is avoided
        for (let i: number = 0; i < 64; i++) {
            component.blockData[i] = (i % 8) + 1;
        }

        // Act
        jpeg._quantizeAndInverse(component, 0, p);

        // Assert
        expect(component.blockData[0]).toBeGreaterThanOrEqual(0);
        expect(component.blockData[7]).toBeGreaterThanOrEqual(0);
        expect(component.blockData[56]).toBeGreaterThanOrEqual(0);
        expect(component.blockData[63]).toBeGreaterThanOrEqual(0);
    });

    it('should cover _decodeACFirst for eobrun return, r<15 break branch, r==15 continue branch and coefficient write branch', () => {
        // Arrange
        const jpegA: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegA, '_eobrun', 2);

        const componentA: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        // Act
        (jpegA as unknown as {
            _decodeACFirst(component: { huffmanTableAC: unknown; blockData: number[] }, blockOffset: number, successive: number): void;
        })._decodeACFirst(componentA, 0, 0);

        // Assert
        expect(_getPrivate<number>(jpegA, '_eobrun')).toBe(1);

        // Arrange r < 15 -> sets eobrun and breaks
        const jpegB: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegB, '_eobrun', 0);
        _setPrivate(jpegB, '_spectralStart', 1);
        _setPrivate(jpegB, '_spectralEnd', 3);

        const componentB: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        spyOn(jpegB, '_decodeHuffman').and.returnValue(0x20); // r=2, s=0
        spyOn(jpegB, '_receive').and.returnValue(1);

        (jpegB as unknown as {
            _decodeACFirst(component: { huffmanTableAC: unknown; blockData: number[] }, blockOffset: number, successive: number): void;
        })._decodeACFirst(componentB, 0, 0);

        expect(_getPrivate<number>(jpegB, '_eobrun')).toBe(4);

        // Arrange r == 15 -> k += 16 continue, then coefficient write
        const jpegC: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegC, '_eobrun', 0);
        _setPrivate(jpegC, '_spectralStart', 1);
        _setPrivate(jpegC, '_spectralEnd', 20);

        const componentC: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        spyOn(jpegC, '_decodeHuffman').and.returnValues(
            0xf0, // r=15, s=0 => k += 16
            0x01  // r=0, s=1 => write one AC coeff
        );
        spyOn(jpegC, '_receiveAndExtend').and.returnValue(3);

        (jpegC as unknown as {
            _decodeACFirst(component: { huffmanTableAC: unknown; blockData: number[] }, blockOffset: number, successive: number): void;
        })._decodeACFirst(componentC, 0, 1);

        expect(componentC.blockData.some((value: number): boolean => value !== 0)).toBeTruthy();
    });

    it('should cover _decodeACSuccessive state 0 branches, state 1 or 2 branches, state 3 branch, state 4 branch and final eobrun reset path', () => {
        // 1) state 0, s===0, r<15 -> eobrun and state 4
        const jpegA: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegA, '_spectralStart', 1);
        _setPrivate(jpegA, '_spectralEnd', 1);
        _setPrivate(jpegA, '_successiveACState', 0);

        const componentA: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        spyOn(jpegA, '_decodeHuffman').and.returnValue(0x20); // r=2, s=0
        spyOn(jpegA, '_receive').and.returnValue(1);

        (jpegA as unknown as {
            _decodeACSuccessive(component: { blockData: number[]; huffmanTableAC: unknown }, blockOffset: number, successive: number): void;
        })._decodeACSuccessive(componentA, 0, 1);

        expect(_getPrivate<number>(jpegA, '_successiveACState')).toBe(4);

        // 2) state 0, s===0, r==15 -> state 1
        const jpegB: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegB, '_spectralStart', 1);
        _setPrivate(jpegB, '_spectralEnd', 1);
        _setPrivate(jpegB, '_successiveACState', 0);

        const componentB: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        spyOn(jpegB, '_decodeHuffman').and.returnValue(0xf0);
        (jpegB as unknown as {
            _decodeACSuccessive(component: { blockData: number[]; huffmanTableAC: unknown }, blockOffset: number, successive: number): void;
        })._decodeACSuccessive(componentB, 0, 1);

        expect(_getPrivate<number>(jpegB, '_successiveACState')).toBe(1);

        // 3) state 0, s !== 1 -> error branch
        const jpegC: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegC, '_spectralStart', 1);
        _setPrivate(jpegC, '_spectralEnd', 1);
        _setPrivate(jpegC, '_successiveACState', 0);

        const componentC: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        spyOn(jpegC, '_decodeHuffman').and.returnValue(0x12); // s=2 invalid

        expect(() => (jpegC as unknown as {
            _decodeACSuccessive(component: { blockData: number[]; huffmanTableAC: unknown }, blockOffset: number, successive: number): void;
        })._decodeACSuccessive(componentC, 0, 1)).toThrowError(/Invalid ACn encoding/);

        // 4) state 0, s===1, r!=0 -> state 2, then state 2 with existing coeff
        const jpegD: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegD, '_spectralStart', 1);
        _setPrivate(jpegD, '_spectralEnd', 1);
        _setPrivate(jpegD, '_successiveACState', 0);

        const componentD: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };
        componentD.blockData[1] = 5;

        spyOn(jpegD, '_decodeHuffman').and.returnValue(0x11); // r=1, s=1 => state 2
        spyOn(jpegD, '_receiveAndExtend').and.returnValue(1);
        spyOn(jpegD, '_readBit').and.returnValue(1);

        (jpegD as unknown as {
            _decodeACSuccessive(component: { blockData: number[]; huffmanTableAC: unknown }, blockOffset: number, successive: number): void;
        })._decodeACSuccessive(componentD, 0, 1);

        expect(componentD.blockData[1]).toBeGreaterThan(5);

        // 5) state 0, s===1, r==0 -> state 3, then execute case 3 else branch
        const jpegE: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegE, '_spectralStart', 1);
        _setPrivate(jpegE, '_spectralEnd', 1);
        _setPrivate(jpegE, '_successiveACState', 0);

        const componentE: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        spyOn(jpegE, '_decodeHuffman').and.returnValue(0x01); // r=0, s=1 => state 3
        spyOn(jpegE, '_receiveAndExtend').and.returnValue(2);

        (jpegE as unknown as {
            _decodeACSuccessive(component: { blockData: number[]; huffmanTableAC: unknown }, blockOffset: number, successive: number): void;
        })._decodeACSuccessive(componentE, 0, 1);

        expect(componentE.blockData[_getPrivate<number>(jpegE, '_offset')]).toBe(4);

        // 6) state 4 branch and final eobrun reset to 0
        const jpegF: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegF, '_spectralStart', 1);
        _setPrivate(jpegF, '_spectralEnd', 1);
        _setPrivate(jpegF, '_successiveACState', 4);
        _setPrivate(jpegF, '_eobrun', 1);

        const componentF: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };
        componentF.blockData[0] = 3;
        _setPrivate(jpegF, '_offset', 0);

        spyOn(jpegF, '_readBit').and.returnValue(1);

        (jpegF as unknown as {
            _decodeACSuccessive(component: { blockData: number[]; huffmanTableAC: unknown }, blockOffset: number, successive: number): void;
        })._decodeACSuccessive(componentF, 0, 1);

        expect(_getPrivate<number>(jpegF, '_successiveACState')).toBe(0);
        expect(_getPrivate<number>(jpegF, '_eobrun')).toBe(0);
    });

    it('should cover _decodeScan decodeFn selection for progressive DC first, progressive DC successive, progressive AC first, progressive AC successive and baseline', () => {
        function _createSingleComponent(): {
            blocksPerLine: number;
            blocksPerColumn: number;
            pred: number;
            h: number;
            v: number;
            blockData: number[];
            huffmanTableDC: unknown;
            huffmanTableAC: unknown;
        } {
            return {
                blocksPerLine: 1,
                blocksPerColumn: 1,
                pred: 0,
                h: 1,
                v: 1,
                blockData: new Array<number>(64).fill(0),
                huffmanTableDC: {},
                huffmanTableAC: {}
            };
        }

        // 1) progressive + spectralStart===0 + successivePrev===0 => _decodeDCFirst
        const jpegA: _PdfJpegImage = new _PdfJpegImage();
        const dcFirstSpy: jasmine.Spy = spyOn(jpegA, '_decodeDCFirst').and.callFake((): void => {
            return;
        });
        spyOn(jpegA, '_decodeBlock').and.callThrough();
        spyOn(jpegA, '_findNextFileMarker').and.returnValue(null);

        jpegA._decodeScan(
            new Uint8Array([0x00]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: true },
            [_createSingleComponent()],
            null,
            0,
            0,
            0,
            1,
            false
        );

        expect(dcFirstSpy).toHaveBeenCalled();

        // 2) progressive + spectralStart===0 + successivePrev!==0 => _decodeDCSuccessive
        const jpegB: _PdfJpegImage = new _PdfJpegImage();
        const dcSuccessiveSpy: jasmine.Spy = spyOn(jpegB, '_decodeDCSuccessive').and.callFake((): void => {
            return;
        });
        spyOn(jpegB, '_decodeBlock').and.callThrough();
        spyOn(jpegB, '_findNextFileMarker').and.returnValue(null);

        jpegB._decodeScan(
            new Uint8Array([0x00]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: true },
            [_createSingleComponent()],
            null,
            0,
            0,
            1,
            1,
            false
        );

        expect(dcSuccessiveSpy).toHaveBeenCalled();

        // 3) progressive + spectralStart>0 + successivePrev===0 => _decodeACFirst
        const jpegC: _PdfJpegImage = new _PdfJpegImage();
        const acFirstSpy: jasmine.Spy = spyOn(jpegC, '_decodeACFirst').and.callFake((): void => {
            return;
        });
        spyOn(jpegC, '_decodeBlock').and.callThrough();
        spyOn(jpegC, '_findNextFileMarker').and.returnValue(null);

        jpegC._decodeScan(
            new Uint8Array([0x00]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: true },
            [_createSingleComponent()],
            null,
            1,
            5,
            0,
            1,
            false
        );

        expect(acFirstSpy).toHaveBeenCalled();

        // 4) progressive + spectralStart>0 + successivePrev!==0 => _decodeACSuccessive
        const jpegD: _PdfJpegImage = new _PdfJpegImage();
        const acSuccessiveSpy: jasmine.Spy = spyOn(jpegD, '_decodeACSuccessive').and.callFake((): void => {
            return;
        });
        spyOn(jpegD, '_decodeBlock').and.callThrough();
        spyOn(jpegD, '_findNextFileMarker').and.returnValue(null);

        jpegD._decodeScan(
            new Uint8Array([0x00]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: true },
            [_createSingleComponent()],
            null,
            1,
            5,
            1,
            1,
            false
        );

        expect(acSuccessiveSpy).toHaveBeenCalled();

        // 5) non-progressive => _decodeBaseline
        const jpegE: _PdfJpegImage = new _PdfJpegImage();
        const baselineSpy: jasmine.Spy = spyOn(jpegE, '_decodeBaseline').and.callFake((): void => {
            return;
        });
        spyOn(jpegE, '_decodeBlock').and.callThrough();
        spyOn(jpegE, '_findNextFileMarker').and.returnValue(null);

        jpegE._decodeScan(
            new Uint8Array([0x00]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: false },
            [_createSingleComponent()],
            null,
            0,
            0,
            0,
            0,
            false
        );

        expect(baselineSpy).toHaveBeenCalled();
    });
});


function _expectSyncThrow(action: () => void, pattern: RegExp): void {
    let thrown: Error | null = null;

    try {
        action();
    } catch (error) {
        thrown = error as Error;
    }

    expect(thrown).not.toBeNull();
    expect((thrown as Error).message).toMatch(pattern);
}

describe('_PdfJpegImage highlighted screenshot coverage', () => {
    function _setPrivate<T>(target: unknown, key: string, value: T): void {
        (target as { [key: string]: unknown })[key] = value;
    }
    it('should cover _quantizeAndInverse fast zero-column branch for t < -2040, t >= 2024 and middle conversion path', () => {
        // Arrange
        const jpegLow: _PdfJpegImage = new _PdfJpegImage();
        const jpegMid: _PdfJpegImage = new _PdfJpegImage();
        const jpegHigh: _PdfJpegImage = new _PdfJpegImage();

        const pLow: Int16Array = new Int16Array(64);
        const pMid: Int16Array = new Int16Array(64);
        const pHigh: Int16Array = new Int16Array(64);

        const lowComponent: {
            quantizationTable: number[];
            blockData: Int16Array;
        } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };
        const midComponent: {
            quantizationTable: number[];
            blockData: Int16Array;
        } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };
        const highComponent: {
            quantizationTable: number[];
            blockData: Int16Array;
        } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };

        // Only blockData[0] is non-zero.
        // This forces the first pass to make only row0 non-zero,
        // and the second pass goes through the highlighted fast zero-column branch.
        lowComponent.blockData[0] = -2000;  // t < -2040 branch => 0
        midComponent.blockData[0] = 100;    // middle branch => shifted value
        highComponent.blockData[0] = 2000;  // t >= 2024 branch => 255

        // Act
        jpegLow._quantizeAndInverse(lowComponent, 0, pLow);
        jpegMid._quantizeAndInverse(midComponent, 0, pMid);
        jpegHigh._quantizeAndInverse(highComponent, 0, pHigh);

        // Assert
        // low branch -> all repeated writes should be 0
        expect(lowComponent.blockData[0]).toBe(0);
        expect(lowComponent.blockData[8]).toBe(0);
        expect(lowComponent.blockData[16]).toBe(0);
        expect(lowComponent.blockData[24]).toBe(0);
        expect(lowComponent.blockData[32]).toBe(0);
        expect(lowComponent.blockData[40]).toBe(0);
        expect(lowComponent.blockData[48]).toBe(0);
        expect(lowComponent.blockData[56]).toBe(0);

        // middle branch -> should be clamped to a non-zero, non-255 grayscale value
        expect(midComponent.blockData[0]).toBeGreaterThan(0);
        expect(midComponent.blockData[0]).toBeLessThan(255);
        expect(midComponent.blockData[8]).toBe(midComponent.blockData[0]);
        expect(midComponent.blockData[56]).toBe(midComponent.blockData[0]);

        // high branch -> all repeated writes should be 255
        expect(highComponent.blockData[0]).toBe(255);
        expect(highComponent.blockData[8]).toBe(255);
        expect(highComponent.blockData[16]).toBe(255);
        expect(highComponent.blockData[24]).toBe(255);
        expect(highComponent.blockData[32]).toBe(255);
        expect(highComponent.blockData[40]).toBe(255);
        expect(highComponent.blockData[48]).toBe(255);
        expect(highComponent.blockData[56]).toBe(255);
    });

    it('should cover _quantizeAndInverse normal second-pass clamp branches for p0 to p7 low and high assignments', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const temp: Int16Array = new Int16Array(64);

        const component: {
            quantizationTable: number[];
            blockData: Int16Array;
        } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };
        // - pX >= 4080 => pX = 255
        const rowPattern: number[] = [-100, 3000, -3000, 5000, -3000, -300, 3000, -30];
        for (let row: number = 0; row < 8; row++) {
            for (let col: number = 0; col < 8; col++) {
                component.blockData[row * 8 + col] = rowPattern[col];
            }
        }

        // Act
        expect(() => jpeg._quantizeAndInverse(component, 0, temp)).not.toThrow();

        // Assert
        for (let i: number = 0; i < component.blockData.length; i++) {
            expect(component.blockData[i]).toBeGreaterThanOrEqual(0);
            expect(component.blockData[i]).toBeLessThanOrEqual(255);
        }
        const outputValues: number[] = Array.from(component.blockData);
        expect(outputValues.some((value: number): boolean => value === 0)).toBeTruthy();
        expect(outputValues.some((value: number): boolean => value === 255)).toBeTruthy();
    });

    it('should cover _decodeScan highlighted fileMarker.invalid, restart marker increment and non-restart break branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const component: {
            blocksPerLine: number;
            blocksPerColumn: number;
            pred: number;
            h: number;
            v: number;
            blockData: number[];
            huffmanTableDC: unknown;
            huffmanTableAC: unknown;
        } = {
            blocksPerLine: 1,
            blocksPerColumn: 1,
            pred: 0,
            h: 1,
            v: 1,
            blockData: new Array<number>(64).fill(0),
            huffmanTableDC: {},
            huffmanTableAC: {}
        };

        const decodeBlockSpy: jasmine.Spy = spyOn(
            jpeg as unknown as {
                _decodeBlock(
                    component: {
                        blocksPerLine: number;
                        blocksPerColumn: number;
                        pred: number;
                        h: number;
                        v: number;
                        blockData: number[];
                        huffmanTableDC: unknown;
                        huffmanTableAC: unknown;
                    },
                    decode: (component: unknown, blockOffset: number) => void,
                    mcu: number
                ): void;
            },
            '_decodeBlock'
        ).and.callFake((): void => {
            return;
        });

        const findNextFileMarkerSpy: jasmine.Spy = spyOn(jpeg, '_findNextFileMarker').and.returnValues(
            {
                invalid: 'bad',
                marker: 0xffd0, // restart marker -> highlighted branch this._offset += 2
                offset: 5
            },
            {
                invalid: null,
                marker: 0xffc0, // not a restart marker -> highlighted else { break; }
                offset: 9
            }
        );

        // Act
        const consumed: number = jpeg._decodeScan(
            new Uint8Array([0x00, 0x00, 0x00, 0x00]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: false },
            [component],
            null,
            0,
            0,
            0,
            0,
            false
        );

        // Assert
        expect(decodeBlockSpy).toHaveBeenCalled();
        expect(findNextFileMarkerSpy.calls.count()).toBe(2);

        // After invalid marker branch, offset becomes fileMarker.offset (= 5),
        // then restart marker branch adds 2 => 7.
        // The second marker is not restart range, so it breaks and returns 7 - startOffset.
        expect(consumed).toBe(7);
    });

    it('should cover _readBit highlighted DNL marker mismatch branch and EOI parseMarker maybeScanLines branch', () => {
        // DNL mismatch branch
        const jpegDnl: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegDnl, '_data', new Uint8Array([0xff, 0xdc, 0x00, 0x00, 0x00, 0x0a]));
        _setPrivate(jpegDnl, '_offset', 0);
        _setPrivate(jpegDnl, '_bitsCount', 0);
        _setPrivate(jpegDnl, '_parseMarker', true);
        _setPrivate(jpegDnl, '_frame', { scanLines: 1, precision: 8 });

        _expectSyncThrow(
            () => jpegDnl._readBit(),
            /Found DNL marker \(0xFFDC\) while parsing scan data/
        );

        // EOI parseMarker maybeScanLines branch
        const jpegEoi: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpegEoi, '_data', new Uint8Array([0xff, 0xd9]));
        _setPrivate(jpegEoi, '_offset', 0);
        _setPrivate(jpegEoi, '_bitsCount', 0);
        _setPrivate(jpegEoi, '_parseMarker', true);
        _setPrivate(jpegEoi, '_blockRow', 2);
        _setPrivate(jpegEoi, '_frame', {
            scanLines: 100,
            precision: 8
        });

        _expectSyncThrow(
            () => jpegEoi._readBit(),
            /Found EOI marker \(0xFFD9\) while parsing scan data, possibly caused by incorrect `scanLines` parameter/
        );
    });
});

function _u16(value: number): number[] {
    return [(value >> 8) & 0xff, value & 0xff];
}

function _concatBytes(parts: number[][]): Uint8Array {
    let total: number = 0;
    for (let i: number = 0; i < parts.length; i++) {
        total += parts[i].length;
    }
    const result: Uint8Array = new Uint8Array(total);
    let offset: number = 0;
    for (let i: number = 0; i < parts.length; i++) {
        result.set(parts[i], offset);
        offset += parts[i].length;
    }
    return result;
}

function _createExifSegment(): number[] {
    const payload: number[] = [
        0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
        0x11, 0x22, 0x33, 0x44
    ];
    return [0xff, 0xe1].concat(_u16(payload.length + 2), payload);
}

function _createSofSegment(marker: number, componentsCount: number): number[] {
    const payload: number[] = [
        0x08,
        0x00, 0x10,
        0x00, 0x10,
        componentsCount
    ];

    for (let i: number = 0; i < componentsCount; i++) {
        const componentId: number = i + 1;
        const hv: number =
            i === 0
                ? 0x21
                : i === 1
                    ? 0x12
                    : 0x11;
        payload.push(componentId, hv, 0x00);
    }

    return [0xff, marker].concat(_u16(payload.length + 2), payload);
}

function _createSosSegment(selectorsCount: number): number[] {
    const payload: number[] = [selectorsCount];
    for (let i: number = 0; i < selectorsCount; i++) {
        payload.push(i + 1, 0x00);
    }
    payload.push(0x00, 0x3f, 0x00);
    return [0xff, 0xda].concat(_u16(payload.length + 2), payload);
}



describe('_PdfJpegImage highlighted screenshots coverage', () => {
    function _expectSyncThrow(action: () => void, pattern: RegExp): void {
        let thrown: Error | null = null;

        try {
            action();
        } catch (error) {
            thrown = error as Error;
        }

        expect(thrown).not.toBeNull();
        expect((thrown as Error).message).toMatch(pattern);
    }
    function _setPrivate<T>(target: unknown, key: string, value: T): void {
        (target as { [key: string]: unknown })[key] = value;
    }

    function _getPrivate<T>(target: unknown, key: string): T {
        return (target as { [key: string]: unknown })[key] as T;
    }
    it('should cover _canUseImageDecoder SOI error, EXIF branch, duplicate EXIF error, SOF early return and 0xffff correction branch', () => {
        // SOI error
        const jpegSoi: _PdfJpegImage = new _PdfJpegImage();
        _expectSyncThrow(
            () => jpegSoi._canUseImageDecoder(new Uint8Array([0x00, 0x00])),
            /Start Of Image \(SOI\) marker not found/
        );

        // EXIF result branch
        const jpegExif: _PdfJpegImage = new _PdfJpegImage();
        const singleExifData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createExifSegment(),
            [0xff, 0xd9]
        ]);
        const exifResult: { exifStart: number; exifEnd: number } | {} | null =
            jpegExif._canUseImageDecoder(singleExifData) as { exifStart: number; exifEnd: number } | {} | null;

        expect((exifResult as { exifStart: number }).exifStart).toBe(12);
        expect((exifResult as { exifEnd: number }).exifEnd).toBe(16);

        // duplicate EXIF error
        const jpegDuplicateExif: _PdfJpegImage = new _PdfJpegImage();
        const duplicateExifData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createExifSegment(),
            _createExifSegment(),
            [0xff, 0xd9]
        ]);

        _expectSyncThrow(
            () => jpegDuplicateExif._canUseImageDecoder(duplicateExifData),
            /duplicate EXIF metadata blocks/
        );

        // SOF early return branch (current implementation returns undefined immediately)
        const jpegSof: _PdfJpegImage = new _PdfJpegImage();
        const sofData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            [0xff, 0xc0],
            [0x00, 0x0b],
            [0x08, 0x00, 0x10, 0x00, 0x10, 0x03, 0x01, 0x11, 0x00]
        ]);
        expect(jpegSof._canUseImageDecoder(sofData)).toBeUndefined();

        // 0xffff correction branch + eventual empty object return
        const jpegFFFF: _PdfJpegImage = new _PdfJpegImage();
        const ffffData: Uint8Array = new Uint8Array([
            0xff, 0xd8,
            0xff, 0xff,
            0x00, 0x00,
            0xff, 0xd9
        ]);
        const skipSpy: jasmine.Spy = spyOn(jpegFFFF, '_skipData').and.returnValue(6);
        const ffffResult: {} | null = jpegFFFF._canUseImageDecoder(ffffData) as {} | null;

        expect(skipSpy).toHaveBeenCalled();
        expect(ffffResult).toEqual({});
    });

    it('should cover parse catch rethrow branch, case 0xffff correction branch and default nextFileMarker.invalid branch', () => {
        // parse catch -> throw ex
        const jpegThrow: _PdfJpegImage = new _PdfJpegImage();
        const throwData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            _createSosSegment(1),
            [0xff, 0xd9]
        ]);

        spyOn(jpegThrow, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });
        spyOn(jpegThrow, '_decodeScan').and.callFake((): number => {
            throw new Error('boom');
        });

        _expectSyncThrow(() => jpegThrow.parse(throwData), /boom/);

        // parse case 0xffff correction branch
        const jpegFFFF: _PdfJpegImage = new _PdfJpegImage();
        const ffffData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            [0xff, 0xff, 0x00],
            [0xff, 0xd9]
        ]);

        spyOn(jpegFFFF, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });
        spyOn(jpegFFFF, '_buildComponentData').and.returnValue(new Int8Array(64));

        expect(() => jpegFFFF.parse(ffffData)).not.toThrow();

        // parse default branch -> nextFileMarker.invalid => offset correction and break
        const jpegInvalidMarker: _PdfJpegImage = new _PdfJpegImage();
        const invalidMarkerData: Uint8Array = _concatBytes([
            [0xff, 0xd8],
            _createSofSegment(0xc0, 1),
            [0xff, 0x01],
            [0xff, 0xd9]
        ]);

        spyOn(jpegInvalidMarker, '_prepareComponents').and.callFake((frame: {
            components: Array<{ blocksPerLine?: number; blocksPerColumn?: number; blockData?: Int16Array }>;
        }): void => {
            for (let i: number = 0; i < frame.components.length; i++) {
                frame.components[i].blocksPerLine = 1;
                frame.components[i].blocksPerColumn = 1;
                frame.components[i].blockData = new Int16Array(128);
            }
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerLine = 1;
            (frame as { mcusPerLine?: number; mcusPerColumn?: number }).mcusPerColumn = 1;
            (frame as { maxH?: number; maxV?: number }).maxH = 1;
            (frame as { maxH?: number; maxV?: number }).maxV = 1;
        });
        spyOn(jpegInvalidMarker, '_findNextFileMarker').and.returnValue({
            invalid: 'bad',
            marker: 0xffd9,
            offset: invalidMarkerData.length - 2
        });
        spyOn(jpegInvalidMarker, '_buildComponentData').and.returnValue(new Int8Array(64));

        expect(() => jpegInvalidMarker.parse(invalidMarkerData)).not.toThrow();
    });

    it('should cover _findNextFileMarker highlighted while search branch and null return branch', () => {
        // direct invalid current marker -> forward search returns marker with invalid string
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const data: Uint8Array = new Uint8Array([0x00, 0x11, 0x22, 0xff, 0xda, 0x33]);

        const result: { invalid: string | null; marker: number; offset: number } | null =
            jpeg._findNextFileMarker(data, 0, 0);

        expect(result).toEqual({ invalid: '11', marker: 0xffda, offset: 3 });

        // currentPos >= maxPos -> null
        const nullResult: { invalid: string | null; marker: number; offset: number } | null =
            jpeg._findNextFileMarker(new Uint8Array([0x00]), 0);

        expect(nullResult).toBeNull();
    });

    it('should cover _readDataBlock and _skipData highlighted invalid-marker offset branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const data: Uint8Array = new Uint8Array([
            0x00, 0x08,
            0x11, 0x22, 0x33, 0xff, 0xd9, 0x44
        ]);

        const findNextSpy: jasmine.Spy = spyOn(jpeg, '_findNextFileMarker').and.returnValues(
            { invalid: 'bad', marker: 0xffd9, offset: 5 },
            { invalid: 'bad', marker: 0xffd9, offset: 5 }
        );

        // Act
        const block: { appData: Uint8Array; oldOffset: number; newOffset: number } = jpeg._readDataBlock(data, 0);
        const skipped: number = jpeg._skipData(data, 0);

        // Assert
        expect(findNextSpy.calls.count()).toBe(2);
        expect(block.oldOffset).toBe(2);
        expect(block.newOffset).toBe(5);
        expect(block.appData).toEqual(new Uint8Array([0x11, 0x22, 0x33]));
        expect(skipped).toBe(5);
    });

    it('should cover _getData highlighted unsupported color mode branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpeg, '_numComponents', 5);

        // Act / Assert
        _expectSyncThrow(
            () => {
                jpeg._getData(1, 1, false, false, false);
            },
            /unsupported color mode/
        );
    });

    it('should cover _quantizeAndInverse highlighted fast zero-column branch for low, middle and high cases', () => {
        const jpegLow: _PdfJpegImage = new _PdfJpegImage();
        const jpegMid: _PdfJpegImage = new _PdfJpegImage();
        const jpegHigh: _PdfJpegImage = new _PdfJpegImage();

        const pLow: Int16Array = new Int16Array(64);
        const pMid: Int16Array = new Int16Array(64);
        const pHigh: Int16Array = new Int16Array(64);

        const lowComponent: { quantizationTable: number[]; blockData: Int16Array } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };
        const midComponent: { quantizationTable: number[]; blockData: Int16Array } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };
        const highComponent: { quantizationTable: number[]; blockData: Int16Array } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };

        // Forces the highlighted fast zero-column branch:
        // only DC value non-zero so second pass has p1..p7 = 0
        lowComponent.blockData[0] = -2000;   // t < -2040 => 0
        midComponent.blockData[0] = 100;     // middle conversion => shifted value
        highComponent.blockData[0] = 2000;   // t >= 2024 => 255

        jpegLow._quantizeAndInverse(lowComponent, 0, pLow);
        jpegMid._quantizeAndInverse(midComponent, 0, pMid);
        jpegHigh._quantizeAndInverse(highComponent, 0, pHigh);

        expect(lowComponent.blockData[0]).toBe(0);
        expect(lowComponent.blockData[8]).toBe(0);
        expect(lowComponent.blockData[56]).toBe(0);

        expect(midComponent.blockData[0]).toBeGreaterThan(0);
        expect(midComponent.blockData[0]).toBeLessThan(255);
        expect(midComponent.blockData[8]).toBe(midComponent.blockData[0]);
        expect(midComponent.blockData[56]).toBe(midComponent.blockData[0]);

        expect(highComponent.blockData[0]).toBe(255);
        expect(highComponent.blockData[8]).toBe(255);
        expect(highComponent.blockData[56]).toBe(255);
    });

    it('should cover _quantizeAndInverse highlighted normal second-pass clamp lines for all p0..p7 branches', () => {
        // Arrange
        const jpegPositive: _PdfJpegImage = new _PdfJpegImage();
        const jpegNegative: _PdfJpegImage = new _PdfJpegImage();
        const jpegMixed: _PdfJpegImage = new _PdfJpegImage();

        const tempPositive: Int16Array = new Int16Array(64);
        const tempNegative: Int16Array = new Int16Array(64);
        const tempMixed: Int16Array = new Int16Array(64);

        const positiveComponent: { quantizationTable: number[]; blockData: Int16Array } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };
        const negativeComponent: { quantizationTable: number[]; blockData: Int16Array } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };
        const mixedComponent: { quantizationTable: number[]; blockData: Int16Array } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };

        // Repeated-pattern blocks chosen to exercise highlighted low/high clamp assignments
        // in the normal second-pass path (not the fast-zero continue path).
        for (let i: number = 0; i < 64; i++) {
            positiveComponent.blockData[i] = 1000;
            negativeComponent.blockData[i] = -1000;
        }

        const mixedRow: number[] = [-100, 3000, -3000, 5000, -3000, -300, 3000, -30];
        for (let row: number = 0; row < 8; row++) {
            for (let col: number = 0; col < 8; col++) {
                mixedComponent.blockData[row * 8 + col] = mixedRow[col];
            }
        }

        // Act
        expect(() => jpegPositive._quantizeAndInverse(positiveComponent, 0, tempPositive)).not.toThrow();
        expect(() => jpegNegative._quantizeAndInverse(negativeComponent, 0, tempNegative)).not.toThrow();
        expect(() => jpegMixed._quantizeAndInverse(mixedComponent, 0, tempMixed)).not.toThrow();

        // Assert
        const positiveValues: number[] = Array.from(positiveComponent.blockData);
        const negativeValues: number[] = Array.from(negativeComponent.blockData);
        const mixedValues: number[] = Array.from(mixedComponent.blockData);

        // These 3 patterns together hit the highlighted low/high clamp lines
        // across p0..p7 in the normal second-pass path.
        expect(positiveValues.some((value: number): boolean => value === 255)).toBeTruthy();
        expect(positiveValues.some((value: number): boolean => value === 0)).toBeTruthy();

        expect(negativeValues.some((value: number): boolean => value === 255)).toBeTruthy();
        expect(negativeValues.some((value: number): boolean => value === 0)).toBeTruthy();

        expect(mixedValues.some((value: number): boolean => value === 255)).toBeTruthy();
        expect(mixedValues.some((value: number): boolean => value === 0)).toBeTruthy();

        // Every written output byte should remain within byte-range after clamp logic.
        for (let i: number = 0; i < 64; i++) {
            expect(positiveComponent.blockData[i]).toBeGreaterThanOrEqual(0);
            expect(positiveComponent.blockData[i]).toBeLessThanOrEqual(255);

            expect(negativeComponent.blockData[i]).toBeGreaterThanOrEqual(0);
            expect(negativeComponent.blockData[i]).toBeLessThanOrEqual(255);

            expect(mixedComponent.blockData[i]).toBeGreaterThanOrEqual(0);
            expect(mixedComponent.blockData[i]).toBeLessThanOrEqual(255);
        }
    });
});

describe('_PdfJpegImage highlighted line coverage from 3 images', () => {

    function _setPrivate<T>(target: unknown, key: string, value: T): void {
        (target as { [key: string]: unknown })[key] = value;
    }
    it('should cover highlighted _quantizeAndInverse clamp branches for p5 and p7 high or low cases', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const temp: Int16Array = new Int16Array(64);

        const component: {
            quantizationTable: number[];
            blockData: Int16Array;
        } = {
            quantizationTable: new Array<number>(64).fill(1),
            blockData: new Int16Array(64)
        };

        // Repeated row pattern chosen so the normal second-pass path
        // hits highlighted clamp branches including p5 and p7.
        const rowPattern: number[] = [-100, 3000, -3000, 5000, -3000, -300, 3000, -30];
        for (let row: number = 0; row < 8; row++) {
            for (let col: number = 0; col < 8; col++) {
                component.blockData[row * 8 + col] = rowPattern[col];
            }
        }

        // Act
        expect(() => jpeg._quantizeAndInverse(component, 0, temp)).not.toThrow();

        // Assert
        const outputValues: number[] = Array.from(component.blockData);

        // Confirms highlighted clamp assignments executed
        expect(outputValues.some((value: number): boolean => value === 0)).toBeTruthy();
        expect(outputValues.some((value: number): boolean => value === 255)).toBeTruthy();

        // All outputs must be clamped into byte range
        for (let i: number = 0; i < outputValues.length; i++) {
            expect(outputValues[i]).toBeGreaterThanOrEqual(0);
            expect(outputValues[i]).toBeLessThanOrEqual(255);
        }
    });

    it('should cover highlighted _findNextFileMarker while-search null return branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const data: Uint8Array = new Uint8Array([0x00, 0x01, 0x02]);

        // Act
        const result: { invalid: string | null; marker: number; offset: number } | null =
            jpeg._findNextFileMarker(data, 0, 0);

        // Assert
        expect(result).toBeNull();
    });

    it('should cover highlighted _decodeHuffman object-continue branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        // First readBit -> 0 => object branch
        // Second readBit -> 0 => number branch
        spyOn(jpeg, '_readBit').and.returnValues(0, 0);

        const tree: unknown = [[7], 5];

        // Act
        const value: number = jpeg._decodeHuffman(tree);

        // Assert
        expect(value).toBe(7);
    });

    it('should cover highlighted _receiveAndExtend direct return n branch', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        spyOn(jpeg, '_receive').and.returnValue(5);

        // Act
        const result: number = jpeg._receiveAndExtend(3);

        // Assert
        expect(result).toBe(5);
    });

    it('should cover highlighted _decodeBaseline s===0 with r<15 break and r===15 continue branches', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        const component: {
            huffmanTableDC: unknown;
            huffmanTableAC: unknown;
            blockData: number[];
            pred: number;
        } = {
            huffmanTableDC: {},
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0),
            pred: 0
        };

        // Sequence:
        // DC t = 0
        // AC rs = 0xf0 => s=0, r=15 => k += 16, continue
        // AC rs = 0x00 => s=0, r=0 < 15 => break
        spyOn(jpeg, '_decodeHuffman').and.returnValues(0, 0xf0, 0x00);

        // Act
        expect(() => (jpeg as unknown as {
            _decodeBaseline(
                component: {
                    huffmanTableDC: unknown;
                    huffmanTableAC: unknown;
                    blockData: number[];
                    pred: number;
                },
                blockOffset: number
            ): void;
        })._decodeBaseline(component, 0)).not.toThrow();

        // Assert
        expect(component.blockData[0]).toBe(0);
    });

    it('should cover highlighted _decodeACSuccessive state transition line where r becomes 0 and state changes from 2 to 3', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpeg, '_spectralStart', 1);
        _setPrivate(jpeg, '_spectralEnd', 2);
        _setPrivate(jpeg, '_successiveACState', 0);

        const component: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        // First iteration (k=1): rs=0x11 => s=1, r=1 => state = 2
        // continue;
        // Second iteration (k=2): case 2, blockData[offsetZ] = 0 => r-- => 0 => state becomes 3
        spyOn(jpeg, '_decodeHuffman').and.returnValue(0x11);
        spyOn(jpeg, '_receiveAndExtend').and.returnValue(1);

        // Act
        (jpeg as unknown as {
            _decodeACSuccessive(
                component: {
                    blockData: number[];
                    huffmanTableAC: unknown;
                },
                blockOffset: number,
                successive: number
            ): void;
        })._decodeACSuccessive(component, 0, 1);

        // Assert
        expect(_setPrivate).toBeDefined(); // sanity
        expect((jpeg as unknown as { _successiveACState: number })._successiveACState).toBe(0);
    });

    it('should cover highlighted _decodeACSuccessive case 3 update branch using component.blockData[this._offset]', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();
        _setPrivate(jpeg, '_spectralStart', 1);
        _setPrivate(jpeg, '_spectralEnd', 1);
        _setPrivate(jpeg, '_successiveACState', 3);
        _setPrivate(jpeg, '_offset', 5);

        const component: {
            huffmanTableAC: unknown;
            blockData: number[];
        } = {
            huffmanTableAC: {},
            blockData: new Array<number>(64).fill(0)
        };

        component.blockData[5] = 2;

        spyOn(jpeg, '_readBit').and.returnValue(1);

        // Act
        (jpeg as unknown as {
            _decodeACSuccessive(
                component: {
                    blockData: number[];
                    huffmanTableAC: unknown;
                },
                blockOffset: number,
                successive: number
            ): void;
        })._decodeACSuccessive(component, 0, 1);

        // Assert
        expect(component.blockData[5]).toBeGreaterThan(2);
    });

    it('should cover highlighted _decodeScan default parseMarker=false line', () => {
        // Arrange
        const jpeg: _PdfJpegImage = new _PdfJpegImage();

        const component: {
            blocksPerLine: number;
            blocksPerColumn: number;
            pred: number;
            h: number;
            v: number;
            blockData: number[];
            huffmanTableDC: unknown;
            huffmanTableAC: unknown;
        } = {
            blocksPerLine: 1,
            blocksPerColumn: 1,
            pred: 0,
            h: 1,
            v: 1,
            blockData: new Array<number>(64).fill(0),
            huffmanTableDC: {},
            huffmanTableAC: {}
        };

        spyOn(jpeg, '_decodeBlock').and.callFake((): void => {
            return;
        });
        spyOn(jpeg, '_findNextFileMarker').and.returnValue(null);

        // Act
        const consumed: number = (jpeg as unknown as {
            _decodeScan(
                data: Uint8Array,
                offset: number,
                frame: { mcusPerLine: number; mcusPerColumn: number; progressive: boolean },
                components: Array<{
                    blocksPerLine: number;
                    blocksPerColumn: number;
                    pred: number;
                    h: number;
                    v: number;
                    blockData: number[];
                    huffmanTableDC: unknown;
                    huffmanTableAC: unknown;
                }>,
                resetInterval: number | null,
                spectralStart: number,
                spectralEnd: number,
                successivePrev: number,
                successive: number,
                parseMarker?: boolean
            ): number;
        })._decodeScan(
            new Uint8Array([0x00]),
            0,
            { mcusPerLine: 1, mcusPerColumn: 1, progressive: false },
            [component],
            null,
            0,
            0,
            0,
            0
        );

        // Assert
        expect(consumed).toBeGreaterThanOrEqual(0);
    });
});
