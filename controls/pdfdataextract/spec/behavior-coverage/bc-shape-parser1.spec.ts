import { _PdfContentStream, _PdfRecord, PdfPage, Point, Rectangle } from '@syncfusion/ej2-pdf';
import { _PdfShapeParser } from '../../src/pdf-data-extract/core/redaction/shape-parser-helper';
import { PdfRedactor } from '../../src/pdf-data-extract/core/redaction/pdf-redactor';
import { PdfRedactionRegion } from '../../src/pdf-data-extract/core/redaction/pdf-redaction-region';
import { _PdfBezierSegment, _PdfLineSegment, _PdfPathFigure } from '../../src/pdf-data-extract/core/redaction/pdf-path-segment';
import { _TextProcessingMode } from '../../src/pdf-data-extract/core/enum';
import { _PdfPolygon } from '../../src/pdf-data-extract/core/redaction/pdf-shape-redaction';
describe('_PdfShapeParser targeted highlighted coverage', () => {
    function _createParser(): _PdfShapeParser {
        return new _PdfShapeParser();
    }

    function _createRecord(operator: string, operands: string[]): _PdfRecord {
        return { _operator: operator, _operands: operands } as unknown as _PdfRecord;
    }

    function _createPage(): PdfPage {
        return {
            size: { width: 500, height: 700 }
        } as unknown as PdfPage;
    }

    function _createRedactorStub(): PdfRedactor {
        return {
            _redactionRegion: [],
            _optimizeContent: jasmine.createSpy('_optimizeContent')
        } as unknown as PdfRedactor;
    }

    function _createRegion(bounds: Rectangle, isTextOnly: boolean = false): PdfRedactionRegion {
        return {
            _bounds: bounds,
            _isTextOnly: isTextOnly,
            bounds
        } as unknown as PdfRedactionRegion;
    }

    it('should cover highlighted line 1 and line 2 in _findRedactPath', () => {
        // Arrange
        const parser: _PdfShapeParser = _createParser();
        const page: PdfPage = _createPage();
        const stream: _PdfContentStream = {} as _PdfContentStream;
        const redaction: PdfRedactor = _createRedactorStub();

        const records: _PdfRecord[] = [
            _createRecord('m', ['10', '20']),
            _createRecord('l', ['30', '40']),
            _createRecord('c', ['1', '2', '3', '4', '5', '6']),
            _createRecord('v', ['7', '8', '9', '10']),
            _createRecord('y', ['11', '12', '13', '14']),
            _createRecord('S', [])
        ];

        const geometrySpy: jasmine.Spy = spyOn(
            parser as unknown as { _getGeometry(figure: _PdfPathFigure): unknown },
            '_getGeometry'
        ).and.callFake((figure: _PdfPathFigure): unknown => {
            expect(figure._segments.length).toBe(4);

            expect(figure._segments[0] instanceof _PdfLineSegment).toBeTruthy();
            expect(figure._segments[1] instanceof _PdfBezierSegment).toBeTruthy();
            expect(figure._segments[2] instanceof _PdfBezierSegment).toBeTruthy();
            expect(figure._segments[3] instanceof _PdfBezierSegment).toBeTruthy();

            const lineSegment: _PdfLineSegment = figure._segments[0] as _PdfLineSegment;
            expect(lineSegment._point).toEqual({ x: 30, y: 40 });

            const curveSegment: _PdfBezierSegment = figure._segments[1] as _PdfBezierSegment;
            expect(curveSegment._point1).toEqual({ x: 1, y: 2 });
            expect(curveSegment._point2).toEqual({ x: 3, y: 4 });
            expect(curveSegment._point3).toEqual({ x: 5, y: 6 });

            const curveVSegment: _PdfBezierSegment = figure._segments[2] as _PdfBezierSegment;
            expect(curveVSegment._point1).toEqual({ x: 10, y: 20 });
            expect(curveVSegment._point2).toEqual({ x: 7, y: 8 });
            expect(curveVSegment._point3).toEqual({ x: 9, y: 10 });

            const curveYSegment: _PdfBezierSegment = figure._segments[3] as _PdfBezierSegment;
            expect(curveYSegment._point1).toEqual({ x: 11, y: 12 });
            expect(curveYSegment._point2).toEqual({ x: 13, y: 14 });
            expect(curveYSegment._point3).toEqual({ x: 13, y: 14 });

            return [{ operator: 'm', points: [{ x: 1, y: 1 }] }];
        });

        spyOn(parser as unknown as { _flattenIfNeeded(shapePaths: unknown): unknown }, '_flattenIfNeeded')
            .and.callFake((shapePaths: unknown): unknown => shapePaths);

        spyOn(parser as unknown as { _extractPoints(commands: unknown): Point[] }, '_extractPoints')
            .and.returnValue([{ x: 1, y: 1 }]);

        spyOn(parser as unknown as {
            _clipAgainstRedactions(
                shapePoints: Point[][],
                redactions: PdfRedactionRegion[],
                pageArg: PdfPage
            ): {
                updatedShapePoints: Point[][];
                intersectionsPoints: Point[];
                isInSide: boolean;
                isOutSide: boolean;
                inSideRects: unknown[];
                totalRedactionPoints: Point[][];
            };
        }, '_clipAgainstRedactions').and.returnValue({
            updatedShapePoints: [[{ x: 1, y: 1 }]],
            intersectionsPoints: [],
            isInSide: false,
            isOutSide: false,
            inSideRects: [],
            totalRedactionPoints: []
        });

        spyOn(parser as unknown as {
            _shouldSkipRendering(shapePoints: Point[][], originalPoints: unknown, isInSide: boolean): boolean;
        }, '_shouldSkipRendering').and.returnValue(false);

        const builtRecords: _PdfRecord[] = [
            _createRecord('m', ['1', '1']),
            _createRecord('l', ['2', '2'])
        ];

        spyOn(parser as unknown as {
            _buildRenderingRecords(
                value: string,
                shapePoints: Point[][],
                intersectionsPoints: Point[],
                isInSide: boolean,
                isOutSide: boolean,
                inSideRects: unknown[],
                totalRedactionPoints: Point[][]
            ): _PdfRecord[];
        }, '_buildRenderingRecords').and.returnValue(builtRecords);

        // Act
        const result: number = parser._findRedactPath(
            records,
            0,
            page,
            redaction,
            _TextProcessingMode.redaction,
            stream
        );

        // Assert
        expect(geometrySpy).toHaveBeenCalled();
        expect((redaction as unknown as { _optimizeContent: jasmine.Spy })._optimizeContent).toHaveBeenCalledTimes(2);
        expect((redaction as unknown as { _optimizeContent: jasmine.Spy })._optimizeContent.calls.argsFor(0)).toEqual([
            builtRecords,
            0,
            '',
            stream
        ]);
        expect(result).toBe(4);
    });

    it('should cover highlighted line 3 default switch case returning -1', () => {
        // Arrange
        const parser: _PdfShapeParser = _createParser();
        const page: PdfPage = _createPage();
        const stream: _PdfContentStream = {} as _PdfContentStream;
        const redaction: PdfRedactor = _createRedactorStub();

        const records: _PdfRecord[] = [
            _createRecord('m', ['10', '20']),
            _createRecord('ZZ', ['1'])
        ];

        // Act
        const result: number = parser._findRedactPath(
            records,
            0,
            page,
            redaction,
            _TextProcessingMode.redaction,
            stream
        );

        // Assert
        expect(result).toBe(-1);
    });

    it('should cover highlighted line 4 _clipAgainstRedactions isInSide branch', () => {
        // Arrange
        const parser: _PdfShapeParser = _createParser();
        const page: PdfPage = _createPage();

        const redactions: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 10, height: 10 })
        ];

        const shapePoints: Point[][] = [[{ x: 1, y: 1 }]];
        const redactionPath = [{ operator: 'm', points: [{ x: 9, y: 9 }] }];

        spyOn(
            parser as unknown as {
                _adjustRedactionBounds(bounds: Rectangle, y: number, pageArg: PdfPage): Rectangle;
            },
            '_adjustRedactionBounds'
        ).and.callFake((bounds: Rectangle): Rectangle => bounds);

        spyOn(
            parser as unknown as {
                _rectToPathCommands(rect: Rectangle): { operator: string; points: Point[] }[];
            },
            '_rectToPathCommands'
        ).and.returnValue(redactionPath);

        spyOn(
            parser as unknown as {
                _extractPoints(commands: unknown): Point[];
            },
            '_extractPoints'
        ).and.returnValue([{ x: 9, y: 9 }]);

        spyOn(_PdfPolygon.prototype as any, '_clip').and.callFake(function(): Point[][] { // eslint-disable-line
            (this as any)._globalIntersections = [{ x: 100, y: 100 }];
            return [
                [{ x: 1, y: 1 }],
                [{ x: 9, y: 9 }]
            ];
        });

        spyOn(
            parser as unknown as {
                _pointsArraysEqual(a: Point[], b: Point[]): boolean;
            },
            '_pointsArraysEqual'
        ).and.callFake((a: Point[], b: Point[]): boolean => {
            return a.length === 1 && b.length === 1 && a[0].x === 9 && b[0].x === 9;
        });

        // Act
        const result: {
            updatedShapePoints: Point[][];
            intersectionsPoints: Point[];
            isInSide: boolean;
            isOutSide: boolean;
            inSideRects: { operator: string; points: Point[] }[][];
            totalRedactionPoints: Point[][];
        } = (parser as unknown as {
            _clipAgainstRedactions(shapePointsArg: Point[][], redactionsArg: PdfRedactionRegion[], pageArg: PdfPage): {
                updatedShapePoints: Point[][];
                intersectionsPoints: Point[];
                isInSide: boolean;
                isOutSide: boolean;
                inSideRects: { operator: string; points: Point[] }[][];
                totalRedactionPoints: Point[][];
            };
        })._clipAgainstRedactions(shapePoints, redactions, page);

        // Assert
        expect(result.isInSide).toBeTruthy();
        expect(result.isOutSide).toBeFalsy();
        expect(result.inSideRects.length).toBe(1);
        expect(result.updatedShapePoints.length).toBe(1);
    });

    it('should cover highlighted line 4 _clipAgainstRedactions isOutSide branch', () => {
        // Arrange
        const parser: _PdfShapeParser = _createParser();
        const page: PdfPage = _createPage();

        const redactions: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 10, height: 10 })
        ];

        const shapePoints: Point[][] = [[{ x: 1, y: 1 }]];
        const redactionPath = [{ operator: 'm', points: [{ x: 9, y: 9 }] }];

        spyOn(
            parser as unknown as {
                _adjustRedactionBounds(bounds: Rectangle, y: number, pageArg: PdfPage): Rectangle;
            },
            '_adjustRedactionBounds'
        ).and.callFake((bounds: Rectangle): Rectangle => bounds);

        spyOn(
            parser as unknown as {
                _rectToPathCommands(rect: Rectangle): { operator: string; points: Point[] }[];
            },
            '_rectToPathCommands'
        ).and.returnValue(redactionPath);

        spyOn(
            parser as unknown as {
                _extractPoints(commands: unknown): Point[];
            },
            '_extractPoints'
        ).and.returnValue([{ x: 9, y: 9 }]);

        spyOn(_PdfPolygon.prototype as any, '_clip').and.callFake(function(): Point[][] { // eslint-disable-line
            (this as any)._globalIntersections = [];
            return [
                [{ x: 9, y: 9 }],
                [{ x: 1, y: 1 }]
            ];
        });

        let compareCount: number = 0;
        spyOn(
            parser as unknown as {
                _pointsArraysEqual(a: Point[], b: Point[]): boolean;
            },
            '_pointsArraysEqual'
        ).and.callFake((): boolean => {
            compareCount++;
            return compareCount === 2;
        });

        // Act
        const result: {
            updatedShapePoints: Point[][];
            intersectionsPoints: Point[];
            isInSide: boolean;
            isOutSide: boolean;
            inSideRects: { operator: string; points: Point[] }[][];
            totalRedactionPoints: Point[][];
        } = (parser as unknown as {
            _clipAgainstRedactions(shapePointsArg: Point[][], redactionsArg: PdfRedactionRegion[], pageArg: PdfPage): {
                updatedShapePoints: Point[][];
                intersectionsPoints: Point[];
                isInSide: boolean;
                isOutSide: boolean;
                inSideRects: { operator: string; points: Point[] }[][];
                totalRedactionPoints: Point[][];
            };
        })._clipAgainstRedactions(shapePoints, redactions, page);

        // Assert
        expect(result.isInSide).toBeFalsy();
        expect(result.isOutSide).toBeTruthy();
        expect(result.updatedShapePoints.length).toBe(1);
    });

    it('should cover highlighted line 5 _buildRenderingRecords final isInSide and inSideRects branch', () => {
        // Arrange
        const parser: _PdfShapeParser = _createParser();

        const insideRectCommands = [
            { operator: 'm', points: [{ x: 200, y: 200 }] }
        ];

        const buildRecordsSpy: jasmine.Spy = spyOn(
            parser as unknown as {
                _buildRecords(commands: unknown): _PdfRecord[];
            },
            '_buildRecords'
        ).and.callFake((commands: unknown): _PdfRecord[] => {
            if (commands === insideRectCommands) {
                return [_createRecord('m', ['200.000', '200.000'])];
            }
            return [_createRecord('m', ['1.000', '1.000'])];
        });

        spyOn(
            parser as unknown as {
                _convertPointsToPath(points: Point[][], intersections?: Point[]): { operator: string; points: Point[] }[];
            },
            '_convertPointsToPath'
        ).and.returnValue([{ operator: 'm', points: [{ x: 1, y: 1 }] }]);

        spyOn(
            parser as unknown as {
                _removeDuplicatePoints(points: Point[][]): Point[][];
            },
            '_removeDuplicatePoints'
        ).and.callFake((points: Point[][]): Point[][] => points);

        spyOn(
            parser as unknown as {
                _removeRedactionPoints(nonRedactedPoints: Point[][], redactionPoints: Point[][]): Point[][];
            },
            '_removeRedactionPoints'
        ).and.callFake((points: Point[][]): Point[][] => points);

        // Act
        const result: _PdfRecord[] = (parser as unknown as {
            _buildRenderingRecords(
                value: string,
                shapePoints: Point[][],
                intersectionsPoints: Point[],
                isInSide: boolean,
                isOutSide: boolean,
                inSideRects: { operator: string; points: Point[] }[][] | undefined,
                totalRedactionPoints: Point[][]
            ): _PdfRecord[];
        })._buildRenderingRecords(
            'B',
            [[{ x: 1, y: 1 }]],
            [],
            true,
            false,
            [insideRectCommands],
            [[]]
        );

        // Assert
        expect(buildRecordsSpy).toHaveBeenCalledWith(insideRectCommands);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should cover highlighted line 6 _convertPointsToPath branch where prev and current are both intersections', () => {
        // Arrange
        const parser: _PdfShapeParser = _createParser();

        const p0: Point = { x: 1, y: 1 };
        const p1: Point = { x: 2, y: 2 };
        const p2: Point = { x: 3, y: 3 };

        // Act
        const commands: { operator: string; points: Point[] }[] = (parser as unknown as {
            _convertPointsToPath(input: Point[][], polygonIntersections?: Point[]): { operator: string; points: Point[] }[];
        })._convertPointsToPath([[p0, p1, p2]], [p0, p1]);

        // Assert
        expect(commands.length).toBe(3);
        expect(commands[0]).toEqual({ operator: 'm', points: [p0] });
        expect(commands[1]).toEqual({ operator: 'm', points: [p1] });
        expect(commands[2]).toEqual({ operator: 'l', points: [p2] });
    });
});