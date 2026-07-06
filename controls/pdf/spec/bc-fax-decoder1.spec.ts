
import { _PdfFaxDecoder } from '../src/pdf/core/graphics/images/pdf-fax-decoder'; 
describe('_PdfFaxDecoder coverage tests', () => {
    function createDecoder(options: any = {}): any { // eslint-disable-line
        const source = {
            next: jasmine.createSpy('next').and.returnValue(-1)
        };
        return new _PdfFaxDecoder(source, options) as any;
    }

    function setUint32(decoder: any, values: number[]): void {
        decoder._codingLine = Uint32Array.from(values);
    }

    describe('constructor', () => {
        it('should throw when source is invalid', () => {
            // Arrange / Act / Assert
            expect(() => new (_PdfFaxDecoder as any)(null)).toThrowError(
                'CCITTFaxDecoder - invalid source parameter.'
            );
            expect(() => new (_PdfFaxDecoder as any)({})).toThrowError(
                'CCITTFaxDecoder - invalid source parameter.'
            );
        });
    });

    describe('readNextChar - 2D mode highlighted branches', () => {
        it('should cover case 0 when refLine[refPos + 1] is NOT less than columns (false branch)', () => {
            // Arrange
            const decoder: any = createDecoder({
                K: -1,
                Columns: 10,
                EndOfBlock: false,
                Rows: 1
            });

            // Initial coding line copied into reference line:
            // copy loop creates refLine[0] = 2, refLine[1] = 10, refLine[2] = 10
            // so case 0 executes _addPixels(refLine[1], ...) with refLine[1] === columns
            // and the highlighted "if (refLine[refPos + 1] < columns)" becomes false.
            setUint32(decoder, [2, 10, 10]);

            spyOn(decoder, '_getTwoDimCode').and.returnValues(0);

            // Act
            const result = decoder.readNextChar();

            // Assert
            expect(result).toBeDefined();
            expect(decoder._codingLine[0]).toBe(10);
            expect(decoder._row).toBe(1);
            expect(decoder._rowsDone).toBeTruthy();
        });

        it('should cover case 1 when blackPixels is true and both do/while loops iterate more than once', () => {
            // Arrange
            const decoder: any = createDecoder({
                K: -1,
                Columns: 10,
                EndOfBlock: false,
                Rows: 1
            });

            // Reference line after copy:
            // refLine = [2, 10, 10]
            // first code 2 toggles blackPixels to 1
            // second code 1 enters the highlighted blackPixels=true branch
            setUint32(decoder, [2, 10, 10]);

            spyOn(decoder, '_getTwoDimCode').and.returnValues(2, 1);
            spyOn(decoder, '_getBlackCode').and.returnValues(
                64, // first loop iterates again
                3   // exit first loop
            );
            spyOn(decoder, '_getWhiteCode').and.returnValues(
                64, // second loop iterates again
                2   // exit second loop
            );

            // Act
            const result = decoder.readNextChar();

            // Assert
            expect(result).toBeDefined();
            expect(decoder._row).toBe(1);
            expect(decoder.err).toBeTruthy(); // addPixels clamps > columns, expected for this coverage path
            expect(decoder._codingLine[1]).toBe(10);
        });

        [8, 6, 4].forEach((twoDimCode: number) => {
            it(`should cover case ${twoDimCode} with refPos > 0 so the decrement branch executes`, () => {
                // Arrange
                const decoder: any = createDecoder({
                    K: -1,
                    Columns: 10,
                    EndOfBlock: false,
                    Rows: 1
                });

                // After copy:
                // refLine = [2, 5, 10, 10]
                // First case 2 moves refPos from 0 to 1
                // Then case 8/6/4 enters:
                //   if (refPos > 0) { --refPos; } else { ++refPos; }
                setUint32(decoder, [2, 5, 10, 10]);

                spyOn(decoder, '_getTwoDimCode').and.returnValues(
                    2,           // moves refPos to 1
                    twoDimCode,  // covers decrement branch (refPos > 0)
                    -1           // terminates line cleanly
                );

                // Act
                const result = decoder.readNextChar();

                // Assert
                expect(result).toBeDefined();
                expect(decoder._row).toBe(1);
                expect(decoder._eof).toBeTruthy();
            });
        });

        [7, 5, 3, 2].forEach((twoDimCode: number) => {
            it(`should cover case ${twoDimCode} when codingLine[this._codingPosition] reaches columns (false branch of inner if)`, () => {
                // Arrange
                const decoder: any = createDecoder({
                    K: -1,
                    Columns: 10,
                    EndOfBlock: false,
                    Rows: 1
                });

                // Build a reference line such that refLine[0] is already columns or reaches columns
                // making: if (codingLine[this._codingPosition] < columns) { ... } evaluate false
                setUint32(decoder, [10, 10, 10]);

                spyOn(decoder, '_getTwoDimCode').and.returnValues(twoDimCode);

                // Act
                const result = decoder.readNextChar();

                // Assert
                expect(result).toBeDefined();
                expect(decoder._row).toBe(1);
                expect(decoder._rowsDone).toBeTruthy();
            });
        });
    });

    describe('readNextChar - EOL / RTC / recovery highlighted branches', () => {
        it('should cover the while(code1 === 0) loop when EndOfLine is false', () => {
            // Arrange
            const decoder: any = createDecoder({
                K: 0,
                Columns: 8,
                EndOfBlock: true,
                EndOfLine: false,
                EncodedByteAlign: false
            });

            decoder._nextLine = false;

            // 1D line ends in one step
            spyOn(decoder, '_getWhiteCode').and.returnValue(8);

            // After line decode, readNextChar goes into:
            //   code1 = _lookBits(12)
            //   while (code1 === 0) { _eatBits(1); code1 = _lookBits(12); }
            spyOn(decoder, '_lookBits').and.returnValues(
                0, // enter loop
                0, // stay in loop
                1  // exit loop, then gotEOL = true
            );

            spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result = decoder.readNextChar();

            // Assert
            expect(result).toBeDefined();
            expect(decoder._row).toBe(1);
            expect(decoder._eatBits).toHaveBeenCalled();
        });

        it('should cover RTC handling when endOfBlock && gotEOL && byteAlign are true', () => {
            // Arrange
            const decoder: any = createDecoder({
                K: 0,
                Columns: 8,
                EndOfBlock: true,
                EndOfLine: true,
                EncodedByteAlign: true
            });

            decoder._nextLine = false;
            decoder._encoding = 1; // force the highlighted encoding > 0 and encoding >= 0 branches

            spyOn(decoder, '_getWhiteCode').and.returnValue(8);

            // Sequence of _lookBits calls after the 1D line:
            // 1) code1 for EOL scan => 1
            // 2) _lookBits(1) for nextLine bit after EOL
            // 3) code1 for RTC first check => 1
            // 4) _lookBits(1) because encoding > 0
            // 5..12) four RTC loop iterations, with one "bad rtc code" value (0) to cover if (code1 !== 1)
            spyOn(decoder, '_lookBits').and.returnValues(
                1, // main EOL scan -> gotEOL true
                0, // nextLine bit
                1, // RTC check enters branch
                0, // extra bit for encoding > 0
                0, // loop i=0 -> code1 !== 1 (highlighted branch)
                0, // extra bit
                1, // loop i=1
                0, // extra bit
                1, // loop i=2
                0, // extra bit
                1, // loop i=3
                0  // extra bit
            );

            spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result = decoder.readNextChar();

            // Assert
            expect(result).toBeDefined();
            expect(decoder._eof).toBeTruthy();
            expect(decoder._row).toBe(1);
            expect(decoder._eatBits).toHaveBeenCalled();
        });

        it('should cover err && endOfLine recovery loop and set _nextLine using code1 bit', () => {
            // Arrange
            const decoder: any = createDecoder({
                K: 0,
                Columns: 8,
                EndOfBlock: true,
                EndOfLine: true,
                EncodedByteAlign: false
            });

            // Force 2D path manually
            decoder._nextLine = true;
            decoder._encoding = 1;

            setUint32(decoder, [2, 8, 8]);

            // Return an unknown 2D code to hit the default switch case:
            //   this._addPixels(columns, 0);
            //   this.err = true;
            spyOn(decoder, '_getTwoDimCode').and.returnValue(99);

            // _lookBits sequence:
            // 1) initial EOL scan: 5 -> not 1, loop consumes 1 bit
            // 2) initial EOL scan: 1 -> gotEOL true
            // 3) !this._eof && this._encoding > 0 && !this._rowsDone  -> nextLine bit
            // 4) recovery while loop first lookBits(13): 0 -> not break
            // 5) recovery while loop second lookBits(13): 2 -> (2 >> 1) === 1, break
            spyOn(decoder, '_lookBits').and.returnValues(
                5,
                1,
                0,
                0,
                2
            );

            spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result = decoder.readNextChar();

            // Assert
            expect(result).toBeDefined();
            expect(decoder.err).toBeTruthy();
            expect(decoder._nextLine).toBeTruthy(); // from !(2 & 1)
            expect(decoder._row).toBe(1);
        });
    });

    describe('readNextChar - outputBits highlighted branches', () => {
        it('should cover the ternary false branch: codingLine[0] <= 0 ? codingLine[1]', () => {
            // Arrange
            const decoder: any = createDecoder({
                K: 0,
                Columns: 5,
                EndOfBlock: false,
                Rows: 1
            });

            decoder._nextLine = false;

            // First 1D white run = 0
            // Then black run = 5
            // Result:
            //   codingLine[0] stays 0
            //   codingLine[1] becomes 5
            // so:
            //   this._outputBits = codingLine[(this._codingPosition = 1)]
            spyOn(decoder, '_getWhiteCode').and.returnValues(0);
            spyOn(decoder, '_getBlackCode').and.returnValues(5);

            // Act
            const result = decoder.readNextChar();

            // Assert
            expect(result).toBeDefined();
            expect(decoder._codingPosition).toBe(1);
            expect(decoder._row).toBe(1);
        });

        it('should cover the partial-byte packing branch where outputBits > bits and codingPosition is even', () => {
            // Arrange
            const decoder: any = createDecoder({
                K: 0,
                Columns: 20
            });

            // Skip line generation completely and jump into the output packing logic
            decoder._outputBits = 3;
            decoder._codingPosition = 1; // odd to skip OR on first fragment
            decoder._codingLine = Uint32Array.from([0, 3, 9, 20]);
            decoder._columns = 20;

            // Flow:
            // iteration 1: outputBits=3 <= bits=8, codingPosition=1 (odd) => no OR
            // then codingPosition becomes 2 and outputBits becomes 6
            // iteration 2: outputBits=6 > bits=5, codingPosition=2 (even) => highlighted OR line executes
            // result becomes non-zero
            // Act
            const result = decoder.readNextChar();

            // Assert
            expect(result).toBeGreaterThan(0);
            expect(decoder._outputBits).toBe(1);
            expect(decoder._codingPosition).toBe(2);
        });
    });

    describe('_getBlackCode highlighted branches', () => {
        it('should cover endOfBlock path where table entry is invalid and fall back to eatBits(1) + return 1', () => {
            // Arrange
            const decoder: any = createDecoder({ K: 0 });
            decoder._endOfBlock = true;

            spyOn(decoder, '_lookBits').and.returnValue(0); // blackTable1[0] => [-1, -1]
            spyOn(decoder, '_eatBits').and.callThrough();

            // Act
            const result = decoder._getBlackCode();

            // Assert
            expect(result).toBe(1);
            expect(decoder._eatBits).toHaveBeenCalledWith(1);
        });

        it('should cover non-endOfBlock path returning from the first _findTableCode result', () => {
            // Arrange
            const decoder: any = createDecoder({ K: 0 });
            decoder._endOfBlock = false;

            spyOn(decoder, '_findTableCode').and.returnValues(
                [true, 3, true] // first branch hit immediately
            );

            // Act
            const result = decoder._getBlackCode();

            // Assert
            expect(result).toBe(3);
            expect(decoder._findTableCode).toHaveBeenCalled();
        });

        it('should cover non-endOfBlock path returning from the third _findTableCode result', () => {
            // Arrange
            const decoder: any = createDecoder({ K: 0 });
            decoder._endOfBlock = false;

            spyOn(decoder, '_findTableCode').and.returnValues(
                [false, 0, false],   // first lookup fails
                [false, 0, false],   // second lookup fails
                [true, 1792, true]   // third lookup succeeds
            );

            // Act
            const result = decoder._getBlackCode();

            // Assert
            expect(result).toBe(1792);
            expect(decoder._findTableCode).toHaveBeenCalledTimes(3);
        });
    });

    describe('_addPixelsNeg direct edge coverage', () => {
        it('should cover _addPixelsNeg branch where a1 is less than current coding line and less than zero', () => {
            // Arrange
            const decoder: any = createDecoder({ Columns: 10 });
            decoder._codingLine = Uint32Array.from([3, 6, 10, 10]);
            decoder._codingPosition = 1;
            decoder.err = false;

            // Act
            decoder._addPixelsNeg(-2, 0);

            // Assert
            expect(decoder.err).toBeTruthy();
            expect(decoder._codingLine[0]).toBe(0);
            expect(decoder._codingPosition).toBe(0);
        });
    });

    describe('_lookBits / _eatBits sanity', () => {
        it('should return padded bits when source ends after partial data and _eatBits should clamp to zero', () => {
            // Arrange
            const bytes = [0b10100000];
            const source = {
                next: jasmine.createSpy('next').and.callFake(() => {
                    return bytes.length ? bytes.shift()! : -1;
                })
            };
            const decoder: any = new _PdfFaxDecoder(source, {});

            // Act
            const looked = decoder._lookBits(12); // partial buffer then EOF -> padded value
            decoder._eatBits(999);

            // Assert
            expect(looked).not.toBe(-1);
            expect(decoder._inputBits).toBe(0);
        });
    });
});
