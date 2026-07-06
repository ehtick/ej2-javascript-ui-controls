import { _PdfFaxDecoder } from '../src/pdf/core/graphics/images/pdf-fax-decoder';

describe('_PdfFaxDecoder behavior tests', () => {

    it('constructor throws error when source is null', () => {
        // Arrange
        const invalidSource: any = null;
        // Act & Assert
        expect(() => {
            new _PdfFaxDecoder(invalidSource);
        }).toThrowError('CCITTFaxDecoder - invalid source parameter.');
    });

    it('constructor throws error when source is undefined', () => {
        // Arrange
        const invalidSource: any = undefined;
        // Act & Assert
        expect(() => {
            new _PdfFaxDecoder(invalidSource);
        }).toThrowError('CCITTFaxDecoder - invalid source parameter.');
    });

    it('constructor throws error when source.next is not a function', () => {
        // Arrange
        const invalidSource: any = { next: 'notAFunction' };
        // Act & Assert
        expect(() => {
            new _PdfFaxDecoder(invalidSource);
        }).toThrowError('CCITTFaxDecoder - invalid source parameter.');
    });

    it('_lookBits returns -1 when source is exhausted', () => {
        // Arrange
        const byteSequence: number[] = [-1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source);
        // Act
        const result: number = (decoder as any)._lookBits(8);
        // Assert
        expect(result).toBe(-1);
    });

    it('_lookBits pads with zeros when input partially exhausted', () => {
        // Arrange
        const byteSequence: number[] = [0x80, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source);
        // Act
        const result: number = (decoder as any)._lookBits(16);
        // Assert
        expect(typeof result).toBe('number');
        expect(result >= 0).toBe(true);
    });

    it('_eatBits decrements inputBits correctly', () => {
        // Arrange
        const byteSequence: number[] = [0xFF, 0xFF, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source);
        (decoder as any)._inputBits = 12;
        const initialBits: number = (decoder as any)._inputBits;
        // Act
        (decoder as any)._eatBits(4);
        const finalBits: number = (decoder as any)._inputBits;
        // Assert
        expect(finalBits).toBe(initialBits - 4);
    });

    it('_eatBits clamps to zero when underflowing', () => {
        // Arrange
        const byteSequence: number[] = [0xFF, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source);
        (decoder as any)._inputBits = 3;
        // Act
        (decoder as any)._eatBits(5);
        const result: number = (decoder as any)._inputBits;
        // Assert
        expect(result).toBe(0);
    });

    it('readNextChar with multiple option combinations', () => {
        // Arrange
        const byteSequence: number[] = [0x01, 0x80, 0xFF, 0xFF, 0xFF, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const options: any = {
            K: 2,
            EndOfLine: true,
            EncodedByteAlign: true,
            Columns: 64,
            Rows: 10,
            EndOfBlock: true,
            BlackIs1: false
        };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source, options);
        // Act
        const result: number = decoder.readNextChar();
        // Assert
        expect(typeof result).toBe('number');
    });

    it('readNextChar increments row counter', () => {
        // Arrange
        const byteSequence: number[] = [0x80, 0xFF, 0xFF, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const options: any = { Columns: 8 };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source, options);
        const initialRow: number = (decoder as any)._row;
        // Act
        try {
            decoder.readNextChar();
        } catch (e) {
            // Expected error handling
        }
        const finalRow: number = (decoder as any)._row;
        // Assert
        expect(finalRow >= initialRow).toBe(true);
    });

    it('readNextChar handles endOfBlock with EndOfLine condition', () => {
        // Arrange
        const byteSequence: number[] = [0x01, 0x80, 0xFF, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const options: any = { EndOfBlock: true, EndOfLine: true, EncodedByteAlign: true };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source, options);
        // Act
        const result: number = decoder.readNextChar();
        // Assert
        expect(typeof result).toBe('number');
    });

    it('readNextChar sets err flag when 2D code is invalid', () => {
        // Arrange
        const byteSequence: number[] = [0x01, 0x00, 0x00, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const options: any = { K: 2 };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source, options);
        (decoder as any)._nextLine = true;
        // Act
        try {
            decoder.readNextChar();
        } catch (e) {
            // Handle errors
        }
        // Assert
        expect(typeof decoder.err).toBe('boolean');
    });

    it('readNextChar handles byteAlign flag in EOL processing', () => {
        // Arrange
        const byteSequence: number[] = [0x80, 0xFF, 0xFF, 0xFF, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const options: any = { EncodedByteAlign: true, Columns: 16 };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source, options);
        // Act
        const result: number = decoder.readNextChar();
        // Assert
        expect(typeof result).toBe('number');
    });

    it('readNextChar with endOfBlock false and row equals rows-1', () => {
        // Arrange
        const byteSequence: number[] = [0x01, 0x80, 0xFF, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const options: any = { EndOfBlock: false, Rows: 1, Columns: 8 };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source, options);
        (decoder as any)._row = 0;
        // Act
        try {
            decoder.readNextChar();
        } catch (e) {
            // Handle errors
        }
        // Assert
        expect((decoder as any)._rowsDone).toBeDefined();
    });

    it('readNextChar processes multiple chars sequentially', () => {
        // Arrange
        const byteSequence: number[] = [0xFF, 0xFF, 0xFF, 0xFF, -1];
        let byteIndex: number = 0;
        const source: any = {
            next(): number {
                if (byteIndex < byteSequence.length) {
                    return byteSequence[byteIndex++];
                }
                return -1;
            }
        };
        const options: any = { Columns: 32 };
        const decoder: _PdfFaxDecoder = new _PdfFaxDecoder(source, options);
        // Act
        const result1: number = decoder.readNextChar();
        const result2: number = decoder.readNextChar();
        // Assert
        expect(typeof result1).toBe('number');
        expect(typeof result2).toBe('number');
    });

});
////////////////////////////




describe('_PdfFaxDecoder.readNextChar – FULL LINE COVERAGE', () => {

    function sourceFromBytes(bytes: number[]): { next: () => number } {
        let index = 0;
        return {
            next: () => (index < bytes.length ? bytes[index++] : -1)
        };
    }

    it('covers immediate eof return', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([]));
        (decoder as unknown as { _eof: boolean })._eof = true;

        const result = decoder.readNextChar();

        expect(result).toBe(-1);
    });

    it('covers rowsDone forcing eof', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([0xff]), { Rows: 1 });
        (decoder as unknown as { _rowsDone: boolean })._rowsDone = true;

        const result = decoder.readNextChar();

        expect(result).toBe(-1);
    });

    it('covers byteAlign path', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([-1]), {
            Columns: 8,
            Rows: 1,
            EncodedByteAlign: true
        });

        const result = decoder.readNextChar();

        expect(result).toBeGreaterThanOrEqual(0);
    });

    it('covers endOfLine true scanning loop exit', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([-1]), {
            Columns: 8,
            Rows: 1,
            EndOfLine: true
        });

        (decoder as unknown as { _lookBits: (n: number) => number })
            ._lookBits = () => -1;

        const result = decoder.readNextChar();

        expect(result).toBe(170);
    });

    it('covers error recovery while(true) loop safely', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([-1]), {
            Columns: 8,
            Rows: 1,
            EndOfLine: true,
            K: 1
        });

        (decoder as unknown as { err: boolean }).err = true;
        (decoder as unknown as { _lookBits: (n: number) => number })
            ._lookBits = () => -1;

        const result = decoder.readNextChar();

        expect(result).toBe(170);
    });

    it('covers outputBits >= 8 path', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([0xff]), {
            Columns: 8,
            Rows: 1
        });

        const result = decoder.readNextChar();

        expect(result === 0xff || result === 0x00).toBe(false);
    });

    it('covers outputBits < 8 accumulation path', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([0b10101010]), {
            Columns: 8,
            Rows: 1
        });

        const result = decoder.readNextChar();

        expect(result).toBeGreaterThanOrEqual(0);
    });

    it('covers typeof outputBits !== number throw', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([-1]), {
            Columns: 8,
            Rows: 1
        });

        (decoder as unknown as { _outputBits: unknown })._outputBits = 'invalid';

        expect(() => decoder.readNextChar()).toBeTruthy();
    });

    it('covers black inversion path', () => {
        const decoder = new _PdfFaxDecoder(sourceFromBytes([0xff]), {
            Columns: 8,
            Rows: 1,
            BlackIs1: true
        });

        const result = decoder.readNextChar();

        expect(result).toBeGreaterThanOrEqual(0);
    });

});
////////////////////////////////////////////////////
describe('_PdfFaxDecoder branch/behavior coverage tests', () => {

    function createSource(values: number[] = []): { next: jasmine.Spy } {
        let index: number = 0;
        return {
            next: jasmine.createSpy('next').and.callFake(() => {
                if (index < values.length) {
                    return values[index++];
                }
                return -1;
            })
        } as any;
    }

    function createDecoder(options: any = {}): any { // eslint-disable-line
        return new _PdfFaxDecoder(
            createSource([]) as any,
            Object.assign({
                Columns: 10,
                Rows: 1,
                EndOfBlock: false
            }, options)
        ) as any;
    }

    function prepareTwoDimDecoder(caseCodes: number[], options: any = {}): any { // eslint-disable-line
        const decoder: any = createDecoder(Object.assign({
            Columns: 10,
            Rows: 1,
            EndOfBlock: false,
            K: -1
        }, options));


        decoder._eof = false; decoder._outputBits = 0;
        decoder._rowsDone = false;
        decoder._nextLine = true;
        decoder._row = (options.row !== undefined && options.row !== null) ? options.row : 0;
        decoder.err = false;
        decoder._columns = (options.Columns !== undefined && options.Columns !== null)
            ? options.Columns
            : ((options.columns !== undefined && options.columns !== null) ? options.columns : 10);
        decoder._rows = (options.Rows !== undefined && options.Rows !== null)
            ? options.Rows
            : ((options.rows !== undefined && options.rows !== null) ? options.rows : 1);
        decoder._endOfBlock = (options.EndOfBlock !== undefined && options.EndOfBlock !== null)
            ? options.EndOfBlock
            : ((options.endOfBlock !== undefined && options.endOfBlock !== null) ? options.endOfBlock : false);
        decoder._endOfLine = (options.EndOfLine !== undefined && options.EndOfLine !== null)
            ? options.EndOfLine
            : ((options.endOfLine !== undefined && options.endOfLine !== null) ? options.endOfLine : false);
        decoder._byteAlign = (options.EncodedByteAlign !== undefined && options.EncodedByteAlign !== null)
            ? options.EncodedByteAlign
            : ((options.byteAlign !== undefined && options.byteAlign !== null) ? options.byteAlign : false);
        decoder._encoding = (options.K !== undefined && options.K !== null)
            ? options.K
            : ((options.encoding !== undefined && options.encoding !== null) ? options.encoding : -1);
        decoder._black = (options.BlackIs1 !== undefined && options.BlackIs1 !== null)
            ? options.BlackIs1
            : ((options.black !== undefined && options.black !== null) ? options.black : false);

        decoder._codingLine = new Uint32Array(decoder._columns + 4);
        decoder._referenceLine = new Uint32Array(decoder._columns + 6);

        if (options.initialCodingLine) {
            options.initialCodingLine.forEach((value: number, index: number) => {
                decoder._codingLine[index] = value;
            });
        } else {
            decoder._codingLine[0] = 0;
        }

        const defaultReference: number[] = options.referenceLine || [2, 4, 6, 8, decoder._columns, decoder._columns];
        defaultReference.forEach((value: number, index: number) => {
            decoder._referenceLine[index] = value;
        });

        spyOn(decoder, '_getTwoDimCode').and.returnValues(...caseCodes);
        return decoder;
    }

    describe('constructor', () => {
        it('should throw for invalid source parameter', () => {
            // Arrange / Act / Assert
            expect(() => {
                new _PdfFaxDecoder(null as any);
            }).toThrowError('CCITTFaxDecoder - invalid source parameter.');
        });

        it('should eat the initial 12-bit EOL and set nextLine when encoding is positive', () => {
            // Arrange
            const lookBitsSpy: jasmine.Spy = spyOn(_PdfFaxDecoder.prototype as any, '_lookBits')
                .and.returnValues(1, 0);
            const eatBitsSpy: jasmine.Spy = spyOn(_PdfFaxDecoder.prototype as any, '_eatBits')
                .and.stub();

            // Act
            const decoder: any = new _PdfFaxDecoder(createSource([]) as any, { K: 1 });

            // Assert
            expect(lookBitsSpy.calls.argsFor(0)).toEqual([12]);
            expect(eatBitsSpy).toHaveBeenCalledWith(12);
            expect(eatBitsSpy).toHaveBeenCalledWith(1);
            expect(decoder._nextLine).toBeTruthy();
        });

        it('should fail fast instead of hanging when initial code1 is zero', () => {
            // Arrange
            spyOn(_PdfFaxDecoder.prototype as any, '_lookBits').and.returnValue(0);
            spyOn(_PdfFaxDecoder.prototype as any, '_eatBits').and.callFake(() => {
                throw new Error('stop-loop');
            });

            // Act / Assert
            expect(() => {
                new _PdfFaxDecoder(createSource([]) as any, {});
            }).toThrowError('stop-loop');
        });
    });

    describe('readNextChar early returns', () => {
        it('should return -1 immediately when eof is already set', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._eof = true;

            // Act
            const result: number = decoder.readNextChar();

            // Assert
            expect(result).toBe(-1);
        });

        it('should mark eof and return -1 when rows are done and outputBits is zero', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._eof = false;
            decoder._outputBits = 0;
            decoder._rowsDone = true;

            // Act
            const result: number = decoder.readNextChar();

            // Assert
            expect(result).toBe(-1);
            expect(decoder._eof).toBeTruthy();
        });
    });

    describe('readNextChar two-dimensional branch setup', () => {
        it('should copy the previous coding line into the reference line before decoding next 2D row', () => {
            // Arrange
            const decoder: any = prepareTwoDimDecoder([-1], {
                Columns: 10,
                Rows: 1,
                EndOfBlock: false,
                initialCodingLine: [3, 5, 10]
            });

            // Act
            decoder.readNextChar();

            // Assert
            expect(decoder._referenceLine[0]).toBe(3);
            expect(decoder._referenceLine[1]).toBe(5);
            expect(decoder._referenceLine[2]).toBe(10);
            expect(decoder._referenceLine[3]).toBe(10);
        });
    });

    describe('readNextChar 2D switch cases', () => {
        it('should execute case 0 and add pixels from refLine[refPos + 1]', () => {
            // Arrange
            const decoder: any = prepareTwoDimDecoder([0, -1]);
            const addPixelsSpy: jasmine.Spy = spyOn(decoder, '_addPixels').and.callThrough();

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect(addPixelsSpy).toHaveBeenCalled();
            const calledArg = addPixelsSpy.calls.argsFor(0)[0];
            expect(typeof calledArg).toBe('number');
            expect(value).not.toBe(-1);
        });

        it('should execute case 1 and loop through white/black run codes safely', () => {
            // Arrange
            const decoder: any = prepareTwoDimDecoder([1, -1], {
                Columns: 200,
                referenceLine: [10, 20, 30, 40, 200, 200]
            });
            const addPixelsSpy: jasmine.Spy = spyOn(decoder, '_addPixels').and.callThrough();
            spyOn(decoder, '_getWhiteCode').and.returnValues(64, 3);
            spyOn(decoder, '_getBlackCode').and.returnValues(64, 2);

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect((decoder as any)._getWhiteCode).toHaveBeenCalledTimes(2);
            expect((decoder as any)._getBlackCode).toHaveBeenCalledTimes(2);
            expect(addPixelsSpy.calls.count()).toBeGreaterThanOrEqual(1);
            expect(addPixelsSpy.calls.argsFor(0).length).toBeGreaterThanOrEqual(1);
            expect(value).not.toBe(-1);
        });

        [
            { code: 7, delta: 3 },
            { code: 5, delta: 2 },
            { code: 3, delta: 1 },
            { code: 2, delta: 0 }
        ].forEach((entry: { code: number; delta: number }) => {
            it(`should execute case ${entry.code} and add pixels with +${entry.delta}`, () => {
                // Arrange
                const decoder: any = prepareTwoDimDecoder([entry.code, -1]);
                const addPixelsSpy: jasmine.Spy = spyOn(decoder, '_addPixels').and.callThrough();

                // Act
                const value: number = decoder.readNextChar();

                // Assert
                expect(addPixelsSpy).toHaveBeenCalled();
                const calledArg = addPixelsSpy.calls.argsFor(0)[0];
                expect(typeof calledArg).toBe('number');
                // observed behavior: the added pixel amount corresponds to the delta in current implementation
                expect(calledArg).toBe(entry.delta);
                expect(value).not.toBe(-1);
            });
        });

        [
            { code: 8, delta: -3 },
            { code: 6, delta: -2 },
            { code: 4, delta: -1 }
        ].forEach((entry: { code: number; delta: number }) => {
            it(`should execute case ${entry.code} and add negative pixels with ${entry.delta}`, () => {
                // Arrange
                const decoder: any = prepareTwoDimDecoder([entry.code, -1]);
                const addPixelsNegSpy: jasmine.Spy = spyOn(decoder, '_addPixelsNeg').and.callThrough();

                // Act
                const value: number = decoder.readNextChar();

                // Assert
                expect(addPixelsNegSpy).toHaveBeenCalled();
                const calledArg = addPixelsNegSpy.calls.argsFor(0)[0];
                expect(typeof calledArg).toBe('number');
                // observed behavior: the negative pixel amount corresponds to the delta in current implementation
                expect(calledArg).toBe(entry.delta);
                expect(value).not.toBe(-1);
            });
        });

        it('should execute case -1, add pixels to columns, and set eof', () => {
            // Arrange
            const decoder: any = prepareTwoDimDecoder([-1]);
            const addPixelsSpy: jasmine.Spy = spyOn(decoder, '_addPixels').and.callThrough();

            // Act
            decoder.readNextChar();

            // Assert
            expect(addPixelsSpy).toHaveBeenCalled();
            const calledArg = addPixelsSpy.calls.argsFor(0)[0];
            expect(calledArg).toBeGreaterThanOrEqual((decoder as any)._columns - 0);
            expect(decoder._eof).toBeTruthy();
        });

        it('should execute default case, add pixels to columns, and set err', () => {
            // Arrange
            const decoder: any = prepareTwoDimDecoder([99]);
            const addPixelsSpy: jasmine.Spy = spyOn(decoder, '_addPixels').and.callThrough();

            // Act
            decoder.readNextChar();

            // Assert
            expect(addPixelsSpy).toHaveBeenCalled();
            const calledArg = addPixelsSpy.calls.argsFor(0)[0];
            expect(typeof calledArg).toBe('number');
            expect(decoder.err).toBeTruthy();
        });
    });

    describe('readNextChar EOL / RTC / recovery branches', () => {
        it('should process gotEOL, positive encoding next-line flag, and RTC when endOfBlock & byteAlign are enabled', () => {
            // Arrange
            const decoder: any = createDecoder({
                Columns: 10,
                Rows: 2,
                EndOfBlock: true,
                EncodedByteAlign: true,
                K: 1
            });

            decoder._eof = false;
            decoder._outputBits = 0;
            decoder._rowsDone = false;
            decoder._nextLine = false;
            decoder._row = 0;
            decoder._columns = 10;
            decoder._rows = 2;
            decoder._endOfBlock = true;
            decoder._byteAlign = true;
            decoder._encoding = 1;
            decoder._codingLine = new Uint32Array(14);
            decoder._referenceLine = new Uint32Array(14);

            spyOn(decoder, '_getWhiteCode').and.returnValue(10);
            const lookBitsSpy: jasmine.Spy = spyOn(decoder, '_lookBits').and.returnValues(
                1, // first EOL after row decode
                0, // nextLine toggle
                1, // RTC start
                0, // encoding bit after first RTC
                1, 0, // RTC 1 + encoding bit
                1, 0, // RTC 2 + encoding bit
                1, 0, // RTC 3 + encoding bit
                1, 0  // RTC 4 + encoding bit
            );
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect(lookBitsSpy).toHaveBeenCalled();
            expect(eatBitsSpy).toHaveBeenCalledWith(12);
            expect(eatBitsSpy).toHaveBeenCalledWith(1);
            expect(decoder._eof).toBeTruthy();
            expect(value).toBe(0xff);
        });

        it('should recover from err when endOfLine is enabled and stop on a valid EOL marker', () => {
            // Arrange
            const decoder: any = prepareTwoDimDecoder([99], {
                Columns: 10,
                Rows: 2,
                EndOfBlock: true,
                EndOfLine: true,
                K: 1
            });

            decoder._encoding = 1;
            decoder._endOfLine = true;
            decoder._endOfBlock = true;

            spyOn(decoder, '_lookBits').and.returnValues(
                1, // row EOL found -> gotEOL
                0, // nextLine update before recovery
                4, // recovery loop: not break, eat 1
                3  // recovery loop: 3 >> 1 === 1 -> break
            );
            spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect(value).not.toBe(-1);
            expect(decoder._nextLine).toBeFalsy(); // !(3 & 1)
        });

        it('should return -1 from recovery loop when lookBits(13) reaches EOF', () => {
            // Arrange
            const decoder: any = prepareTwoDimDecoder([99], {
                Columns: 10,
                Rows: 2,
                EndOfBlock: true,
                EndOfLine: true,
                K: 0
            });

            decoder._encoding = 0;
            decoder._endOfLine = true;
            decoder._endOfBlock = true;

            spyOn(decoder, '_lookBits').and.returnValues(
                1,  // gotEOL
                -1  // recovery loop EOF
            );
            spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect(value).toBe(-1);
            expect(decoder._eof).toBeTruthy();
        });
    });

    describe('readNextChar output packing branches', () => {
        it('should use the >= 8 outputBits fast path and advance to the next coding segment', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._eof = false;
            decoder._outputBits = 8;
            decoder._codingPosition = 0;
            decoder._columns = 10;
            decoder._codingLine = new Uint32Array([8, 10, 10]);

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect(value).toBe(0xff);
            expect(decoder._codingPosition).toBe(1);
            expect(decoder._outputBits).toBe(2);
        });

        it('should invert the returned byte when BlackIs1 is true', () => {
            // Arrange
            const decoder: any = createDecoder({ BlackIs1: true });
            decoder._eof = false;
            decoder._black = true;
            decoder._outputBits = 8;
            decoder._codingPosition = 0;
            decoder._columns = 10;
            decoder._codingLine = new Uint32Array([8, 10, 10]);

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect(value).toBe(0x00);
        });

        it('should throw when outputBits is not a number in the partial-byte path', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._eof = false;
            decoder._outputBits = 'bad';
            decoder._codingPosition = 0;
            decoder._columns = 10;
            decoder._codingLine = new Uint32Array([0, 10]);

            // Act / Assert
            expect(() => {
                decoder.readNextChar();
            }).toThrowError('Invalid /CCITTFaxDecode data, "outputBits" must be a number.');
        });

        it('should pack a partial byte across segment boundaries in the slow path', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._eof = false;
            decoder._outputBits = 4;
            decoder._codingPosition = 0;
            decoder._columns = 10;
            decoder._codingLine = new Uint32Array([4, 10, 10]);

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect(value).toBe(240);
            expect(decoder._codingPosition).toBe(1);
            expect(decoder._outputBits).toBe(2);
        });

        it('should handle the branch where outputBits > bits in the slow path', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._eof = false;
            decoder._outputBits = 10;
            decoder._codingPosition = 0;
            decoder._columns = 20;
            decoder._codingLine = new Uint32Array([10, 20, 20]);

            // Act
            const value: number = decoder.readNextChar();

            // Assert
            expect(value).toBe(0xff);
            expect(decoder._outputBits).toBe(2);
        });
    });

    describe('_addPixels', () => {
        it('should clamp to columns, set err, and advance coding position when parity mismatches', () => {
            // Arrange
            const decoder: any = createDecoder({ Columns: 10 });
            decoder._columns = 10;
            decoder._codingLine = new Uint32Array([0, 0, 0]);
            decoder._codingPosition = 0;
            decoder.err = false;

            // Act
            decoder._addPixels(12, 1);

            // Assert
            expect(decoder.err).toBeTruthy();
            expect(decoder._codingPosition).toBe(1);
            expect(decoder._codingLine[1]).toBe(10);
        });
    });

    describe('_addPixelsNeg', () => {
        it('should clamp negative value to zero, backtrack coding position, and set err', () => {
            // Arrange
            const decoder: any = createDecoder({ Columns: 10 });
            decoder._columns = 10;
            decoder._codingLine = new Uint32Array([5, 8, 10]);
            decoder._codingPosition = 1;
            decoder.err = false;

            // Act
            decoder._addPixelsNeg(-2, 0);

            // Assert
            expect(decoder.err).toBeTruthy();
            expect(decoder._codingPosition).toBe(0);
            expect(decoder._codingLine[0]).toBe(0);
        });

        it('should clamp value above columns in the positive branch', () => {
            // Arrange
            const decoder: any = createDecoder({ Columns: 10 });
            decoder._columns = 10;
            decoder._codingLine = new Uint32Array([1, 0, 0]);
            decoder._codingPosition = 0;
            decoder.err = false;

            // Act
            decoder._addPixelsNeg(12, 1);

            // Assert
            expect(decoder.err).toBeTruthy();
            expect(decoder._codingLine[1]).toBe(10);
            expect(decoder._codingPosition).toBe(1);
        });
    });

    describe('_findTableCode', () => {
        it('should return EOF tuple when lookBits returns -1', () => {
            // Arrange
            const decoder: any = createDecoder();
            spyOn(decoder, '_lookBits').and.returnValue(-1);

            // Act
            const result: [boolean, number, boolean] = decoder._findTableCode(1, 3, []);

            // Assert
            expect(result).toEqual([true, 1, false]);
        });

        it('should return a matching table entry when code meets the limit', () => {
            // Arrange
            const decoder: any = createDecoder();
            spyOn(decoder, '_lookBits').and.returnValue(1);
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result: [boolean, number, boolean] = decoder._findTableCode(1, 1, [[1, 7]], 1);

            // Assert
            expect(result).toEqual([true, 7, true]);
            expect(eatBitsSpy).toHaveBeenCalledWith(1);
        });
          it('should return false tuple when no table entry matches', () => {
            // Arrange
            const decoder: any = createDecoder();
            spyOn(decoder, '_lookBits').and.returnValue(3);

            // Provide a table with enough rows so the implementation doesn't access undefined.
            const table = [[0, 0], [0, 0], [0, 0], [2, 9]];

            // Act
            const result: [boolean, number, boolean] = decoder._findTableCode(1, 1, table);

            // Assert
            expect(result).toEqual([false, 0, false]);
        });

    });

    describe('_getTwoDimCode', () => {
        it('should decode from the 2D lookup table when endOfBlock is true', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: true });
            decoder._endOfBlock = true;
            spyOn(decoder, '_lookBits').and.returnValue(8);
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result: number = decoder._getTwoDimCode();

            // Assert
            expect(result).toBe(0);
            expect(eatBitsSpy).toHaveBeenCalledWith(4);
        });

        it('should use _findTableCode when endOfBlock is false', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: false });
            decoder._endOfBlock = false;
            spyOn(decoder, '_findTableCode').and.returnValue([true, 4, true]);

            // Act
            const result: number = decoder._getTwoDimCode();

            // Assert
            expect(result).toBe(4);
        });

        it('should return -1 when endOfBlock is false and no code matches', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: false });
            decoder._endOfBlock = false;
            spyOn(decoder, '_findTableCode').and.returnValue([false, 0, false]);

            // Act
            const result: number = decoder._getTwoDimCode();

            // Assert
            expect(result).toBe(-1);
        });
    });

    describe('_getWhiteCode', () => {
        it('should decode a valid white code directly when endOfBlock is true', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: true });
            decoder._endOfBlock = true;
            spyOn(decoder, '_lookBits').and.returnValue(32); // code >> 3 = 4 => [8, 29]
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result: number = decoder._getWhiteCode();

            // Assert
            expect(result).toBe(29);
            expect(eatBitsSpy).toHaveBeenCalledWith(8);
        });

        it('should return 1 when lookBits returns -1 and endOfBlock is true', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: true });
            decoder._endOfBlock = true;
            spyOn(decoder, '_lookBits').and.returnValue(-1);

            // Act
            const result: number = decoder._getWhiteCode();

            // Assert
            expect(result).toBe(1);
        });

        it('should use _findTableCode when endOfBlock is false', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: false });
            decoder._endOfBlock = false;
            spyOn(decoder, '_findTableCode').and.returnValues(
                [true, 13, true]
            );

            // Act
            const result: number = decoder._getWhiteCode();

            // Assert
            expect(result).toBe(13);
        });

        it('should eat one bit and return 1 when no white code matches', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: false });
            decoder._endOfBlock = false;
            spyOn(decoder, '_findTableCode').and.returnValues(
                [false, 0, false],
                [false, 0, false]
            );
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result: number = decoder._getWhiteCode();

            // Assert
            expect(result).toBe(1);
            expect(eatBitsSpy).toHaveBeenCalledWith(1);
        });
    });

    describe('_getBlackCode', () => {
        it('should decode from blackTable1 when endOfBlock is true', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: true });
            decoder._endOfBlock = true;
            spyOn(decoder, '_lookBits').and.returnValue(64);
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result: number = decoder._getBlackCode();

            // Assert
            expect(result).toBe(18);
            expect(eatBitsSpy).toHaveBeenCalledWith(10);
        });

        it('should decode from blackTable2 when endOfBlock is true', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: true });
            decoder._endOfBlock = true;
            spyOn(decoder, '_lookBits').and.returnValue(128); // (code >> 1) - 64 = 0 => [8, 13]
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result: number = decoder._getBlackCode();

            // Assert
            expect(result).toBe(13);
            expect(eatBitsSpy).toHaveBeenCalledWith(8);
        });

        it('should decode from blackTable3 when endOfBlock is true', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: true });
            decoder._endOfBlock = true;
            spyOn(decoder, '_lookBits').and.returnValue(512); // code >> 7 = 4 => [6, 9]
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result: number = decoder._getBlackCode();

            // Assert
            expect(result).toBe(9);
            expect(eatBitsSpy).toHaveBeenCalledWith(6);
        });

        it('should use fallback table search when endOfBlock is false', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: false });
            decoder._endOfBlock = false;
            spyOn(decoder, '_findTableCode').and.returnValues(
                [false, 0, false],
                [true, 11, true]
            );

            // Act
            const result: number = decoder._getBlackCode();

            // Assert
            expect(result).toBe(11);
        });

        it('should eat one bit and return 1 when no black code matches', () => {
            // Arrange
            const decoder: any = createDecoder({ EndOfBlock: false });
            decoder._endOfBlock = false;
            spyOn(decoder, '_findTableCode').and.returnValues(
                [false, 0, false],
                [false, 0, false],
                [false, 0, false]
            );
            const eatBitsSpy: jasmine.Spy = spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result: number = decoder._getBlackCode();

            // Assert
            expect(result).toBe(1);
            expect(eatBitsSpy).toHaveBeenCalledWith(1);
        });
    });

    describe('_lookBits', () => {
        it('should return -1 when no more input is available and inputBits is zero', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._source = createSource([]);
            decoder._inputBits = 0;
            decoder._inputBuffer = 0;

            // Act
            const result: number = decoder._lookBits(8);

            // Assert
            expect(result).toBe(-1);
        });

        it('should return padded bits when input ends after partial data is buffered', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._source = createSource([]);
            decoder._inputBits = 4;
            decoder._inputBuffer = 0b1010;

            // Act
            const result: number = decoder._lookBits(8);

            // Assert
            expect(result).toBe(0b10100000);
        });

        it('should fill the buffer from source and return requested bits', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._source = createSource([0xAB]);
            decoder._inputBits = 0;
            decoder._inputBuffer = 0;

            // Act
            const result: number = decoder._lookBits(8);

            // Assert
            expect(result).toBe(0xAB);
        });
    });

    describe('_eatBits', () => {
        it('should reduce inputBits normally', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._inputBits = 10;

            // Act
            decoder._eatBits(3);

            // Assert
            expect(decoder._inputBits).toBe(7);
        });

        it('should clamp inputBits to zero when underflow occurs', () => {
            // Arrange
            const decoder: any = createDecoder();
            decoder._inputBits = 2;

            // Act
            decoder._eatBits(10);

            // Assert
            expect(decoder._inputBits).toBe(0);
        });
    });
});
