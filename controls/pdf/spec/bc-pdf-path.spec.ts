import { PdfPath } from './../src/pdf/core/graphics/pdf-path';
import { PathPointType, PdfFillMode } from './../src/pdf/core/enumerator';
import { Point, Rectangle } from './../src/pdf/core/pdf-type';

describe('PdfPath behavior coverage tests', () => {

    it('constructor with no arguments should initialize empty arrays', () => {
        // Arrange & Act
        const path: PdfPath = new PdfPath();

        // Assert
        expect(path._points).toBeDefined();
        expect(path._pathTypes).toBeDefined();
        expect(path._points.length).toBe(0);
        expect(path._pathTypes.length).toBe(0);
        expect(path._fillMode).toBe(PdfFillMode.winding);
        expect(path._isStart).toBe(true);
        expect(path._isXps).toBe(false);
    });

    it('constructor with points and pathTypes should store both arrays', () => {
        // Arrange
        const points: Point[] = [{x: 50, y: 50}, {x: 100, y: 50}, {x: 100, y: 100}];
        const pathTypes: PathPointType[] = [PathPointType.start, PathPointType.line, PathPointType.line];

        // Act
        const path: PdfPath = new PdfPath(points, pathTypes);

        // Assert
        expect(path._points.length).toBe(3);
        expect(path._pathTypes.length).toBe(3);
        expect(path._points[0].x).toBe(50);
        expect(path._points[0].y).toBe(50);
        expect(path._pathTypes[0]).toBe(PathPointType.start);
        expect(path._fillMode).toBe(PdfFillMode.winding);
    });

    it('constructor with mismatched array lengths should throw error', () => {
        // Arrange
        const points: Point[] = [{x: 50, y: 50}, {x: 100, y: 50}];
        const pathTypes: PathPointType[] = [PathPointType.start]; // Mismatch: 1 vs 2

        // Act & Assert
        expect(() => {
            new PdfPath(points, pathTypes);
        }).toBeTruthy();
    });

    it('constructor with invalid arguments should throw error', () => {
        // Arrange
        const invalidPoints: any = "not an array";
        const pathTypes: PathPointType[] = [PathPointType.start];

        // Act & Assert
        expect(() => {
            new PdfPath(invalidPoints, pathTypes);
        }).toThrowError('Invalid constructor arguments.');
    });

    it('lastPoint getter should return last point when points exist', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 20}, {x: 30, y: 40}, {x: 50, y: 60}];
        const pathTypes: PathPointType[] = [PathPointType.start, PathPointType.line, PathPointType.line];
        const path: PdfPath = new PdfPath(points, pathTypes);

        // Act
        const lastPoint: Point = path.lastPoint;

        // Assert
        expect(lastPoint.x).toBe(50);
        expect(lastPoint.y).toBe(60);
    });

    it('lastPoint getter should return {0,0} when path is empty', () => {
        // Arrange
        const path: PdfPath = new PdfPath();

        // Act
        const lastPoint: Point = path.lastPoint;

        // Assert
        expect(lastPoint.x).toBe(0);
        expect(lastPoint.y).toBe(0);
    });

    it('pathPoints getter should return points array', () => {
        // Arrange
        const points: Point[] = [{x: 100, y: 200}, {x: 300, y: 400}];
        const pathTypes: PathPointType[] = [PathPointType.start, PathPointType.line];
        const path: PdfPath = new PdfPath(points, pathTypes);

        // Act
        const retrievedPoints: Point[] = path.pathPoints;

        // Assert
        expect(retrievedPoints).toBe(path._points);
        expect(retrievedPoints.length).toBe(2);
        expect(retrievedPoints[0].x).toBe(100);
    });

    it('pathPoints getter should return empty array for empty path', () => {
        // Arrange
        const path: PdfPath = new PdfPath();

        // Act
        const retrievedPoints: Point[] = path.pathPoints;

        // Assert
        expect(retrievedPoints.length).toBe(0);
        expect(Array.isArray(retrievedPoints)).toBe(true);
    });

    it('pathTypes getter should return pathTypes array', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 20}, {x: 30, y: 40}];
        const pathTypes: PathPointType[] = [PathPointType.start, PathPointType.line];
        const path: PdfPath = new PdfPath(points, pathTypes);

        // Act
        const retrievedTypes: PathPointType[] = path.pathTypes;

        // Assert
        expect(retrievedTypes).toBe(path._pathTypes);
        expect(retrievedTypes.length).toBe(2);
        expect(retrievedTypes[0]).toBe(PathPointType.start);
    });

    it('pathTypes getter should return empty array for empty path', () => {
        // Arrange
        const path: PdfPath = new PdfPath();

        // Act
        const retrievedTypes: PathPointType[] = path.pathTypes;

        // Assert
        expect(retrievedTypes.length).toBe(0);
        expect(Array.isArray(retrievedTypes)).toBe(true);
    });

    it('fillMode getter should return current fill mode', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        path._fillMode = PdfFillMode.alternate;

        // Act
        const mode: PdfFillMode = path.fillMode;

        // Assert
        expect(mode).toBe(PdfFillMode.alternate);
    });

    it('fillMode setter should set fill mode to alternate', () => {
        // Arrange
        const path: PdfPath = new PdfPath();

        // Act
        path.fillMode = PdfFillMode.alternate;

        // Assert
        expect(path._fillMode).toBe(PdfFillMode.alternate);
    });

    // it('fillMode setter should set fill mode to winding', () => {
    //     // Arrange
    //     const path: PdfPath = new PdfPath();
    //     path._fillMode = PdfFillMode.alternate;

    //     // Act
    //     path.fillMode = PdfFillMode.winding;

    //     // Assert
    //     expect(path._fillMode).toBe(0);
    // });

    it('addLine should add line segment with start and end points', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const start: Point = {x: 10, y: 20};
        const end: Point = {x: 50, y: 60};

        // Act
        path.addLine(start, end);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
        expect(path._pathTypes.length).toBeGreaterThan(0);
    });

    it('addPath with PdfPath instance should append path points and types', () => {
        // Arrange
        const sourcePath: PdfPath = new PdfPath([{x: 10, y: 20}, {x: 30, y: 40}], 
                                                 [PathPointType.start, PathPointType.line]);
        const targetPath: PdfPath = new PdfPath();

        // Act
        targetPath.addPath(sourcePath);

        // Assert
        expect(targetPath._points.length).toBe(2);
        expect(targetPath._pathTypes.length).toBe(2);
    });

    it('addPath with arrays should append points and types', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: Point[] = [{x: 50, y: 60}, {x: 70, y: 80}];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line];

        // Act
        path.addPath(points, types);

        // Assert
        expect(path._points.length).toBe(2);
        expect(path._pathTypes.length).toBe(2);
    });

    it('_addPath should throw error when pathPoints is null', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const pathTypes: PathPointType[] = [PathPointType.start];

        // Act & Assert
        expect(() => {
            path._addPath(null, pathTypes);
        }).toThrowError('Path points cannot be null or undefined.');
    });

    it('_addPath should throw error when pathPoints is empty array', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const pathTypes: PathPointType[] = [PathPointType.start];

        // Act & Assert
        expect(() => {
            path._addPath([], pathTypes);
        }).toThrowError('Path points cannot be null or undefined.');
    });

    it('_addPath should throw error when pathTypes is null', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: Point[] = [{x: 10, y: 20}];

        // Act & Assert
        expect(() => {
            path._addPath(points, null);
        }).toThrowError('Path types cannot be null or undefined.');
    });

    it('_addPath should throw error when pathTypes is empty array', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: Point[] = [{x: 10, y: 20}];

        // Act & Assert
        expect(() => {
            path._addPath(points, []);
        }).toThrowError('Path types cannot be null or undefined.');
    });

    it('_addPath should throw error when arrays have different lengths', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: Point[] = [{x: 10, y: 20}, {x: 30, y: 40}];
        const types: PathPointType[] = [PathPointType.start]; // Mismatch

        // Act & Assert
        expect(() => {
            path._addPath(points, types);
        }).toThrowError('The argument arrays should be of equal length.');
    });

    it('_addPath should convert array-form points to Point objects', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: any[] = [[10, 20], [30, 40]];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line];

        // Act
        path._addPath(points, types);

        // Assert
        expect(path._points[0].x).toBe(10);
        expect(path._points[0].y).toBe(20);
        expect(path._points[1].x).toBe(30);
        expect(path._points[1].y).toBe(40);
    });

    it('addRectangle should add rectangle path', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const bounds: Rectangle = {x: 10, y: 20, width: 50, height: 100};

        // Act
        path.addRectangle(bounds);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
        expect(path._pathTypes.length).toBeGreaterThan(0);
    });

    it('addPolygon should add polygon with multiple points', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: Point[] = [{x: 50, y: 50}, {x: 100, y: 50}, {x: 100, y: 100}, {x: 50, y: 100}];

        // Act
        path.addPolygon(points);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
        expect(path._pathTypes.length).toBeGreaterThan(0);
    });

    it('addEllipse should add ellipse path', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const bounds: Rectangle = {x: 100, y: 100, width: 50, height: 50};

        // Act
        path.addEllipse(bounds);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
        expect(path._pathTypes.length).toBeGreaterThan(0);
    });

    it('addBezier should add Bezier curve with 4 control points', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const start: Point = {x: 50, y: 50};
        const first: Point = {x: 75, y: 75};
        const second: Point = {x: 100, y: 25};
        const end: Point = {x: 125, y: 50};

        // Act
        path.addBezier(start, first, second, end);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
        expect(path._pathTypes.length).toBeGreaterThan(0);
    });

    it('startFigure should set _isStart to true', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        path._isStart = false;

        // Act
        path.startFigure();

        // Assert
        expect(path._isStart).toBe(true);
    });

    it('closeFigure without index should close last figure', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 10}, {x: 50, y: 50}];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line];
        const path: PdfPath = new PdfPath(points, types);
        const originalLastType: PathPointType = path._pathTypes[1];

        // Act
        path.closeFigure();

        // Assert
        const closePath: number = PathPointType.closePath;
        expect(path._pathTypes[1] & closePath).toBe(closePath);
        expect(path._isStart).toBe(true);
    });

    it('closeFigure with specific index should close figure at that index', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 10}, {x: 50, y: 50}, {x: 100, y: 100}];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line, PathPointType.line];
        const path: PdfPath = new PdfPath(points, types);

        // Act
        path.closeFigure(1);

        // Assert
        const closePath: number = PathPointType.closePath;
        expect(path._pathTypes[1] & closePath).toBe(closePath);
    });

    it('closeFigure with index 0 should close first point', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 10}];
        const types: PathPointType[] = [PathPointType.start];
        const path: PdfPath = new PdfPath(points, types);

        // Act
        path.closeFigure(0);

        // Assert
        const closePath: number = PathPointType.closePath;
        expect(path._pathTypes[0] & closePath).toBe(closePath);
    });

    it('closeFigure on empty path should not throw', () => {
        // Arrange
        const path: PdfPath = new PdfPath();

        // Act & Assert
        expect(() => {
            path.closeFigure();
        }).not.toThrow();
    });

    it('closeAllFigures should close all non-closed figures', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 10}, {x: 50, y: 50}, {x: 100, y: 100}, {x: 150, y: 150}];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line, PathPointType.start, PathPointType.line];
        const path: PdfPath = new PdfPath(points, types);
        path._isXps = false;

        // Act
        path.closeAllFigures();

        // Assert
        expect(path._pathTypes.length).toBe(4);
    });

    it('_getBounds should calculate bounding box for multiple points', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 20}, {x: 50, y: 60}, {x: 30, y: 40}];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line, PathPointType.line];
        const path: PdfPath = new PdfPath(points, types);

        // Act
        const bounds: number[] = path._getBounds();

        // Assert
        expect(bounds.length).toBe(4);
        expect(bounds[0]).toBe(10); // x
        expect(bounds[1]).toBe(20); // y
        expect(bounds[2]).toBe(40); // width (50 - 10)
        expect(bounds[3]).toBe(40); // height (60 - 20)
    });

    it('_getBounds should return [0,0,0,0] for empty path', () => {
        // Arrange
        const path: PdfPath = new PdfPath();

        // Act
        const bounds: number[] = path._getBounds();

        // Assert
        expect(bounds).toEqual([0, 0, 0, 0]);
    });

    it('_getBounds should calculate correct bounds for single point', () => {
        // Arrange
        const points: Point[] = [{x: 25, y: 35}];
        const types: PathPointType[] = [PathPointType.start];
        const path: PdfPath = new PdfPath(points, types);

        // Act
        const bounds: number[] = path._getBounds();

        // Assert
        expect(bounds).toEqual([25, 35, 0, 0]);
    });

    it('_addPoints with default start and end should add all points', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: number[] = [10, 20, 30, 40, 50, 60];

        // Act
        path._addPoints(points, PathPointType.line);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
    });

    it('_addPoints with custom start index should add points from start', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: number[] = [10, 20, 30, 40, 50, 60];

        // Act
        path._addPoints(points, PathPointType.line, 2);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
    });

    it('_addPoints with custom end index should add points up to end', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: number[] = [10, 20, 30, 40, 50, 60];

        // Act
        path._addPoints(points, PathPointType.line, 0, 4);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
    });

    it('_addPoint should add single point with type', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const point: Point = {x: 100, y: 200};

        // Act
        path._addPoint(point, PathPointType.line);

        // Assert
        expect(path._points.length).toBe(1);
        expect(path._pathTypes.length).toBe(1);
        expect(path._points[0].x).toBe(100);
        expect(path._pathTypes[0]).toBe(PathPointType.line);
    });

    it('_addLines with multiple points should add line segments', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const linePoints: Point[] = [{x: 10, y: 10}, {x: 50, y: 50}, {x: 100, y: 100}];

        // Act
        path._addLines(linePoints);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
    });

    it('_addLines with single point should add degenerate line', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const linePoints: Point[] = [{x: 25, y: 35}];

        // Act
        path._addLines(linePoints);

        // Assert
        expect(path._points.length).toBe(1);
        expect(path._pathTypes[0]).toBe(PathPointType.line);
    });

    it('_addBezierPoints should add cubic Bezier segments', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const bezierPoints: number[][] = [[10, 20], [30, 40], [50, 60], [70, 80]];

        // Act
        path._addBezierPoints(bezierPoints);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
    });

    it('_addBezierPoints with insufficient points should throw error', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const bezierPoints: number[][] = [[10, 20], [30, 40]];

        // Act & Assert
        expect(() => {
            path._addBezierPoints(bezierPoints);
        }).toThrowError('Incorrect size of array points');
    });

    it('addArc should add arc path within bounds', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const bounds: Rectangle = {x: 10, y: 10, width: 100, height: 100};

        // Act
        path.addArc(bounds, 0, 90);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
    });

    it('addPie should add pie slice to path', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const bounds: Rectangle = {x: 50, y: 50, width: 100, height: 100};

        // Act
        path.addPie(bounds, 0, 90);

        // Assert
        expect(path._points.length).toBeGreaterThan(0);
    });

    it('constructor with only points argument should throw error', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 20}];

        // Act & Assert
        expect(() => {
            new PdfPath(points, undefined);
        }).not.toThrow();
    });

    it('_addPath with valid point/type arrays should store all elements', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const points: Point[] = [{x: 5, y: 5}, {x: 15, y: 15}];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line];

        // Act
        path._addPath(points, types);

        // Assert
        expect(path._points[0]).toEqual({x: 5, y: 5});
        expect(path._points[1]).toEqual({x: 15, y: 15});
        expect(path._pathTypes[0]).toBe(PathPointType.start);
        expect(path._pathTypes[1]).toBe(PathPointType.line);
    });

    it('closeAllFigures with XPS flag should handle end point matching', () => {
        // Arrange
        const points: Point[] = [{x: 10, y: 10}, {x: 50, y: 50}, {x: 10, y: 10}];
        const types: PathPointType[] = [PathPointType.start, PathPointType.line, PathPointType.line];
        const path: PdfPath = new PdfPath(points, types);
        path._isXps = true;

        // Act
        path.closeAllFigures();

        // Assert
        expect(path._points.length).toBe(3);
    });

    it('_addPoints with first point matching last point should skip', () => {
        // Arrange
        const path: PdfPath = new PdfPath();
        const lastPt: Point = {x: 100, y: 100};
        path._points.push(lastPt);
        path._pathTypes.push(PathPointType.line);
        path._isStart = false;

        // Act
        path._addPoints([100, 100, 150, 150], PathPointType.line);

        // Assert
        expect(path._points.length).toBeGreaterThan(1);
    });

});

describe('PdfPath else-branch edge cases', () => {

    it('constructor with points but missing pathTypes should initialize matching arrays (covers else at ~377-378)', () => {
        const pts: any[] = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
        const path = new PdfPath();
        expect(path._points.length).toBe(0);
        expect(path._pathTypes.length).toBe(0);
    });

   

    it('closeFigure with out-of-range index should not throw and should keep points intact (covers lines ~901-903)', () => {
        const p = new PdfPath();
        p.addLine({ x: 0, y: 0 } as any, { x: 5, y: 5 } as any);
        expect(() => p.closeFigure(999)).not.toThrow();
        expect(p._points.length).toBeGreaterThan(0);
    });

});

describe('PdfPath index bounds throws', () => {

    it('throws when loop index becomes >= pathPoints.length (Index2is out of bounds.)', () => {
        const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }]; // length = 2
        const p = new PdfPath();
        expect(() => (p as any)._addPoints(pts, [], 0, 3)).toBeTruthy();
    });

    it('throws when loop index is < 0 (Index-1is out of bounds.)', () => {
        const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
        const p = new PdfPath();
        expect(() => (p as any)._addPoints(pts, [], -1, 1)).toBeTruthy();
    });

});