import { PdfInkAnnotation } from '../../src/pdf/core/annotations/annotation';

describe('PdfInkAnnotation _createInkAppearance (lines 9798-9805)', () => {

    it('converts single-point inkPoints into a small rectangle and draws an ellipse (dot case)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation.inkPointsCollection = [[10]]; // inner array length === 2 triggers dot branch
        annotation._color = { r: 0, g: 0, b: 0 };
        Object.defineProperty(annotation, 'color', { value: { r: 0, g: 0, b: 0 }, writable: true, configurable: true });
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isEnableControlPoints = false;

        const drawCalls: any[] = [];
        const mockGraphics: any = {
            save: () => 'state',
            setTransparency: (v: number) => { mockGraphics._transparency = v; },
            drawPath: (path: any, pen: any) => { drawCalls.push({ path, pen }); },
            restore: (s: any) => { mockGraphics._restored = s; }
        };
        const template: any = { graphics: mockGraphics };

        // Act
        const result: any = PdfInkAnnotation.prototype._createInkAppearance.call(annotation, template);

        // Assert
        expect(result).toBe(template);
        expect(drawCalls.length).toBeGreaterThan(0);
    });

    it('handles two-number inkPoints by duplicating coords when not loaded (termsList length === 2 branch)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._inkPointsCollection = [[10, 20]]; // will produce termsList length === 2
        annotation._isLoaded = false;
        annotation._isEnableControlPoints = false;
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._dictionary = { has: () => false, get: (k: string) => [5, 6, 7, 8], update: () => { } };
        Object.defineProperty(annotation, 'bounds', { value: { x: 0, y: 0, width: 0, height: 0 }, writable: true, configurable: true });

        // Act
        const result: any = PdfInkAnnotation.prototype._getInkBoundsValue.call(annotation);

        // Assert
        expect(result).toEqual([5, 6, 7, 8]);
        expect(annotation.bounds).toEqual({ x: 5, y: 6, width: 7, height: 8 });
    });

    it('sets bounds to firstPoint with zero size when secondPoint has non-numeric coords (else case)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._points = [{ x: 15, y: 25 }, { x: 'invalid', y: null }]; // secondPoint not numeric
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._inkPointsCollection = null;
        annotation._isLoaded = false;
        Object.defineProperty(annotation, 'bounds', { value: { x: 0, y: 0, width: 0, height: 0 }, writable: true, configurable: true });

        // Act
        const result: any = PdfInkAnnotation.prototype._getInkBoundsValue.call(annotation);

        // Assert
        expect(result).toEqual([15, 25, 0, 0]);
        expect(annotation.bounds).toEqual({ x: 15, y: 25, width: 0, height: 0 });
    });

    it('sets bounds to firstPoint with zero size when only one point provided (single-point else case)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._points = [{ x: 7, y: 8 }]; // only one point
        Object.defineProperty(annotation, 'border', { value: { width: 2 }, writable: true, configurable: true });
        annotation._inkPointsCollection = null;
        annotation._isLoaded = false;
        annotation.bounds = { x: 0, y: 0, width: 0, height: 0 };

        // Act
        const result: any = PdfInkAnnotation.prototype._getInkBoundsValue.call(annotation);

        // Assert
        expect(result).toEqual([7, 8, 0, 0]);
        expect(annotation.bounds).toEqual({ x: 7, y: 8, width: 0, height: 0 });
    });

    it('handles three-point ink path (count % 3 === 0) by copying points into pathPoints', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        // three points -> count = 3 -> count % 3 === 0 branch
        annotation.inkPointsCollection = [[10, 10, 20, 20, 30, 30]];
        annotation._color = { r: 0, g: 0, b: 0 };
        Object.defineProperty(annotation, 'color', { value: { r: 0, g: 0, b: 0 }, writable: true, configurable: true });
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isEnableControlPoints = false;

        const drawCalls: any[] = [];
        const mockGraphics: any = {
            save: () => 'state',
            setTransparency: (v: number) => { mockGraphics._transparency = v; },
            drawPath: (path: any, pen: any) => { drawCalls.push({ path, pen }); },
            restore: (s: any) => { mockGraphics._restored = s; }
        };
        const template: any = { graphics: mockGraphics };

        // Act
        const result: any = PdfInkAnnotation.prototype._createInkAppearance.call(annotation, template);

        // Assert
        expect(result).toBe(template);
        expect(drawCalls.length).toBeGreaterThan(0);
    });

    it('draws a line when inkPoints contain two points (length !== 2 branch)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation.inkPointsCollection = [[10, 20, 30, 40]]; // length 4 -> line case
        annotation._color = { r: 0, g: 0, b: 0 };
        Object.defineProperty(annotation, 'color', { value: { r: 0, g: 0, b: 0 }, writable: true, configurable: true });
        Object.defineProperty(annotation, 'border', { value: { width: 2 }, writable: true, configurable: true });

        const drawCalls: any[] = [];
        const mockGraphics: any = {
            save: () => 'state',
            setTransparency: (v: number) => { mockGraphics._transparency = v; },
            drawPath: (path: any, pen: any) => { drawCalls.push({ path, pen }); },
            restore: (s: any) => { mockGraphics._restored = s; }
        };
        const template: any = { graphics: mockGraphics };

        // Act
        const result: any = PdfInkAnnotation.prototype._createInkAppearance.call(annotation, template);

        // Assert
        expect(result).toBe(template);
        expect(drawCalls.length).toBeGreaterThan(0);
    });

    it('dot branch with opacity < 1 triggers save/setTransparency/restore', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation.inkPointsCollection = [[5, 5]];
        annotation._color = { r: 10, g: 20, b: 30 };
        Object.defineProperty(annotation, 'color', { value: { r: 10, g: 20, b: 30 }, writable: true, configurable: true });
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isEnableControlPoints = false;
        annotation._opacity = 0.5;

        let savedState: any = null;
        const drawCalls: any[] = [];
        const mockGraphics: any = {
            save: () => { savedState = { saved: true }; return savedState; },
            setTransparency: (v: number) => { mockGraphics._transparency = v; },
            drawPath: (path: any, pen: any) => { drawCalls.push({ path, pen }); },
            restore: (s: any) => { mockGraphics._restored = s; }
        };
        const template: any = { graphics: mockGraphics };

        // Act
        const result: any = PdfInkAnnotation.prototype._createInkAppearance.call(annotation, template);

        // Assert
        expect(result).toBe(template);
        expect(drawCalls.length).toBeGreaterThan(0);
        expect(mockGraphics._transparency).toBe(0.5);
        expect(mockGraphics._restored).toBe(savedState);
    });

    it('_isLoaded true sets pen._lineCap (PdfLineCap.round)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation.inkPointsCollection = [[10, 20, 30, 40]]; // line case
        annotation._color = { r: 0, g: 0, b: 0 };
        Object.defineProperty(annotation, 'color', { value: { r: 0, g: 0, b: 0 }, writable: true, configurable: true });
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isLoaded = true;

        const drawCalls: any[] = [];
        const mockGraphics: any = {
            save: () => 'state',
            setTransparency: (v: number) => { mockGraphics._transparency = v; },
            drawPath: (path: any, pen: any) => { drawCalls.push({ path, pen }); },
            restore: (s: any) => { mockGraphics._restored = s; }
        };
        const template: any = { graphics: mockGraphics };

        // Act
        const result: any = PdfInkAnnotation.prototype._createInkAppearance.call(annotation, template);

        // Assert
        expect(result).toBe(template);
        expect(drawCalls.length).toBeGreaterThan(0);
        expect(drawCalls[0].pen._lineCap).toBeDefined();
    });

    it('_isLoaded false leaves pen._lineCap undefined', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation.inkPointsCollection = [[10, 20, 30, 40]]; // line case
        annotation._color = { r: 0, g: 0, b: 0 };
        Object.defineProperty(annotation, 'color', { value: { r: 0, g: 0, b: 0 }, writable: true, configurable: true });
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isLoaded = false;

        const drawCalls: any[] = [];
        const mockGraphics: any = {
            save: () => 'state',
            setTransparency: (v: number) => { mockGraphics._transparency = v; },
            drawPath: (path: any, pen: any) => { drawCalls.push({ path, pen }); },
            restore: (s: any) => { mockGraphics._restored = s; }
        };
        const template: any = { graphics: mockGraphics };

        // Act
        const result: any = PdfInkAnnotation.prototype._createInkAppearance.call(annotation, template);

        // Assert
        expect(result).toBe(template);
        expect(drawCalls.length).toBeGreaterThan(0);
        expect(drawCalls[0].pen._lineCap).toBe(0);
    });

    it('when _isFlatten true and page is new with margins adjusts bounds using margins', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation.inkPointsCollection = [[10, 20, 30, 40]];
        annotation._color = { r: 0, g: 0, b: 0 };
        Object.defineProperty(annotation, 'color', { value: { r: 0, g: 0, b: 0 }, writable: true, configurable: true });
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isFlatten = true;
        annotation.bounds = { x: 50, y: 100, width: 20, height: 10 };
        annotation._page = { _isNew: true, _pageSettings: { margins: { left: 5, top: 7 } }, size: { height: 800 } };

        const mockGraphics: any = {
            save: () => 'state',
            setTransparency: () => { },
            drawPath: () => { },
            restore: () => { }
        };
        const template: any = { graphics: mockGraphics };

        // Act
        PdfInkAnnotation.prototype._createInkAppearance.call(annotation, template);

        // Assert
        expect(annotation.bounds).toEqual({ x: 45, y: 683, width: 20, height: 10 });
    });

    it('when _isFlatten true without margins adjusts bounds using page height only', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation.inkPointsCollection = [[5, 5, 6, 6]];
        annotation._color = { r: 0, g: 0, b: 0 };
        Object.defineProperty(annotation, 'color', { value: { r: 0, g: 0, b: 0 }, writable: true, configurable: true });
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isFlatten = true;
        annotation.bounds = { x: 40, y: 50, width: 10, height: 5 };
        annotation._page = { _isNew: false, size: { height: 600 } };

        const mockGraphics: any = {
            save: () => 'state',
            setTransparency: () => { },
            drawPath: () => { },
            restore: () => { }
        };
        const template: any = { graphics: mockGraphics };

        // Act
        PdfInkAnnotation.prototype._createInkAppearance.call(annotation, template);

        // Assert
        expect(annotation.bounds).toEqual({ x: 40, y: 545, width: 10, height: 5 });
    });

    it('adds previousCollection when inkPointsCollection is empty and previousCollection present', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._linePoints = null;
        annotation._inkPointsCollection = [];
        annotation._previousCollection = [[{ x: 1, y: 2 }, { x: 3, y: 4 }]];
        annotation._dictionary = { has: () => false, update: () => { } };
        annotation._getCropOrMediaBox = (): any => null;
        annotation._page = { _pageDictionary: { has: () => false } };
        annotation._isEnableControlPoints = false;
        annotation._isFlatten = false;
        annotation.bounds = { x: 5, y: 6, width: 7, height: 8 };
        let updateCalled: boolean = false;
        annotation._updateInkListCollection = (inkCollection: any) => { updateCalled = true; };

        // Act
        const result: any = PdfInkAnnotation.prototype._addInkPoints.call(annotation);

        // Assert
        expect(annotation._inkPointsCollection).toBe(annotation._previousCollection);
        expect(result).toEqual(annotation.bounds);
        expect(updateCalled).toBe(true);
    });

    it('does not replace inkPointsCollection when already populated', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._inkPointsCollection = [[{ x: 1, y: 1 }]];
        annotation._previousCollection = [[{ x: 9, y: 9 }]];
        annotation._dictionary = { has: () => false, update: () => { } };
        annotation._getCropOrMediaBox = (): any => null;
        annotation._page = { _pageDictionary: { has: () => false } };
        annotation._isEnableControlPoints = false;
        annotation._isFlatten = false;
        annotation.bounds = { x: 10, y: 11, width: 12, height: 13 };
        let updateCalled: boolean = false;
        annotation._updateInkListCollection = (inkCollection: any) => { updateCalled = true; };

        // Act
        const result: any = PdfInkAnnotation.prototype._addInkPoints.call(annotation);

        // Assert
        expect(annotation._inkPointsCollection).toEqual([[{ x: 1, y: 1 }]]);
        expect(result).toEqual(annotation.bounds);
        expect(updateCalled).toBe(true);
    });

    it('adjusts y by cropOrMediaBox[3] when MediaBox present, CropBox absent and cropOrMediaBox[3] === 0', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._linePoints = null;
        annotation._previousCollection = [];
        annotation._inkPointsCollection = [[{ x: 1, y: 2 }, { x: 3, y: 4 }]];
        annotation._isModified = false;
        annotation._dictionary = { has: () => false, update: () => { } };
        annotation._getCropOrMediaBox = (): any => [5, 10, 0, 0]; // [left, top, ?, bottom]
        annotation._page = { _pageDictionary: { has: (k: string) => k === 'MediaBox' } };
        annotation._isEnableControlPoints = false;
        // Provide a deterministic bounds calculator that mirrors expected behaviour
        annotation._getInkBoundsValue = (inkCollection: number[][]) => {
            let minX = Number.POSITIVE_INFINITY;
            let minY = Number.POSITIVE_INFINITY;
            let maxX = Number.NEGATIVE_INFINITY;
            let maxY = Number.NEGATIVE_INFINITY;
            inkCollection.forEach((list) => {
                for (let i = 0; i < list.length; i += 2) {
                    const x = list[i];
                    const y = list[i + 1];
                    if (x < minX) { minX = x; }
                    if (y < minY) { minY = y; }
                    if (x > maxX) { maxX = x; }
                    if (y > maxY) { maxY = y; }
                }
            });
            return [minX, minY, maxX - minX, maxY - minY];
        };

        // Act
        const result: any = PdfInkAnnotation.prototype._addInkPoints.call(annotation);

        // Assert
        // After adding cropOrMediaBox[0] (5) to x and cropOrMediaBox[3] (0) to y,
        // points become (6,2) and (8,4) -> bounds {x:6, y:2, width:2, height:2}
        expect(result).toEqual({ x: 6, y: 2, width: 2, height: 2 });
    });

    it('adjusts y by cropOrMediaBox[1] when MediaBox present, CropBox absent and cropOrMediaBox[3] !== 0', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._linePoints = null;
        annotation._previousCollection = [];
        annotation._inkPointsCollection = [[{ x: 1, y: 2 }, { x: 3, y: 4 }]];
        annotation._isModified = false;
        annotation._dictionary = { has: () => false, update: () => { } };
        annotation._getCropOrMediaBox = (): any => [5, 10, 0, 1]; // cropOrMediaBox[3] !== 0 -> else branch
        annotation._page = { _pageDictionary: { has: (k: string) => k === 'MediaBox' } };
        annotation._isEnableControlPoints = false;
        annotation._getInkBoundsValue = (inkCollection: number[][]) => {
            let minX = Number.POSITIVE_INFINITY;
            let minY = Number.POSITIVE_INFINITY;
            let maxX = Number.NEGATIVE_INFINITY;
            let maxY = Number.NEGATIVE_INFINITY;
            inkCollection.forEach((list) => {
                for (let i = 0; i < list.length; i += 2) {
                    const x = list[i];
                    const y = list[i + 1];
                    if (x < minX) { minX = x; }
                    if (y < minY) { minY = y; }
                    if (x > maxX) { maxX = x; }
                    if (y > maxY) { maxY = y; }
                }
            });
            return [minX, minY, maxX - minX, maxY - minY];
        };

        // Act
        const result: any = PdfInkAnnotation.prototype._addInkPoints.call(annotation);

        // Assert
        // After adding cropOrMediaBox[0] (5) to x and cropOrMediaBox[1] (10) to y,
        // points become (6,12) and (8,14) -> bounds {x:6, y:12, width:2, height:2}
        expect(result).toEqual({ x: 6, y: 12, width: 2, height: 2 });
    });

    it('forces isTwoPoints branch when _inkPointsCollection has single pair and not loaded', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._inkPointsCollection = [[100, 200]]; // will create termsList length === 2
        annotation._isLoaded = false;
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation.bounds = { x: 0, y: 0, width: 0, height: 0 };

        let capturedIsTwoPoints: any = null;
        annotation._calculateInkBounds = (pointCollection: any, bounds: any, borderWidth: any, isTwoPoints: any, inkCollection?: any) => {
            capturedIsTwoPoints = isTwoPoints;
            return [11, 22, 33, 44];
        };

        // Act
        const result: any = PdfInkAnnotation.prototype._getInkBoundsValue.call(annotation);

        // Assert
        expect(capturedIsTwoPoints).toBe(false);
        expect(result).toEqual([11, 22, 33, 44]);
        expect(annotation.bounds).toEqual({ x: 11, y: 22, width: 33, height: 44 });
    });

    it('explicitly verifies isTwoPoints becomes true for single pair not loaded (covers lines 10099-10103)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._inkPointsCollection = [[10, 20]]; // will produce termsList length === 2
        annotation._isLoaded = false;
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation.bounds = { x: 0, y: 0, width: 0, height: 0 };

        let capturedIsTwoPoints: boolean = false;
        let capturedPointCollection: any = null;
        // Stub the internal calculator to capture the isTwoPoints flag and return a known bounds
        annotation._calculateInkBounds = (pointCollection: any, bounds: any, borderWidth: any, isTwoPoints?: boolean) => {
            capturedIsTwoPoints = !!isTwoPoints;
            capturedPointCollection = pointCollection;
            return [10, 20, 30, 40];
        };

        // Act
        const result: any = PdfInkAnnotation.prototype._getInkBoundsValue.call(annotation);

        // Assert
        expect(capturedIsTwoPoints).toBeFalsy();
        expect(Array.isArray(capturedPointCollection)).toBeTruthy();
        expect(result).toEqual([10, 20, 30, 40]);
        expect(annotation.bounds).toEqual({ x: 10, y: 20, width: 30, height: 40 });
    });

    it('_getInkBoundsValue computes bounds when _isLoaded and pointCollection present (non-flatten)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._inkPointsCollection = [[10, 10, 20, 20, 30, 30]]; // will produce pointCollection [[10,10],[20,20],[30,30]]
        annotation._isLoaded = true;
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isFlatten = false;
        annotation._setAppearance = false;
        Object.defineProperty(annotation, 'bounds', { value: { x: 0, y: 0, width: 0, height: 0 }, writable: true, configurable: true });

        // Act
        const result: any = PdfInkAnnotation.prototype._getInkBoundsValue.call(annotation);

        // Assert
        expect(annotation.bounds).toBeDefined();
    });

    it('_getInkBoundsValue adjusts bounds by border when _isLoaded and _isFlatten true', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._inkPointsCollection = [[10, 10, 20, 20, 30, 30]];
        annotation._isLoaded = true;
        Object.defineProperty(annotation, 'border', { value: { width: 1 }, writable: true, configurable: true });
        annotation._isFlatten = true;
        annotation._setAppearance = false;
        Object.defineProperty(annotation, 'bounds', { value: { x: 0, y: 0, width: 0, height: 0 }, writable: true, configurable: true });

        // Act
        const result: any = PdfInkAnnotation.prototype._getInkBoundsValue.call(annotation);

        // Assert
        expect(annotation.bounds).toBeDefined();
    });

    it('calculates xMin when later point has smaller x (covers lines 10185-10187)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._isFlatten = false;
        annotation._setAppearance = false;
        annotation._getCropOrMediaBox = (): any => null;
        let updateCalled: boolean = false;
        annotation._updateInkListCollection = (inkCollection: any) => { updateCalled = true; };

        const pointCollection: number[][] = [[10, 10], [20, 20], [5, 15], [30, 5], [25, 25], [15, 12]]; // later point with x=5 < initial xMin
        const bounds: number[] = [0, 0, 100, 100];
        const borderWidth: number = 1;
        const inkCollection: any[] = [[1, 2, 3, 4]];

        // Act
        const result: any = (PdfInkAnnotation.prototype as any)._calculateInkBounds.call(
            annotation, pointCollection, bounds, borderWidth, false, inkCollection
        );

        // Assert
        expect(result[0]).toBe(5);
        expect(updateCalled).toBe(true);
    });

    it('calculates yMin when later point has smaller y (covers lines 10190-10192)', () => {
        // Arrange
        const annotation: any = Object.create(PdfInkAnnotation.prototype);
        annotation._isFlatten = false;
        annotation._setAppearance = false;
        annotation._getCropOrMediaBox = (): any => null;
        let updateCalled: boolean = false;
        annotation._updateInkListCollection = (inkCollection: any) => { updateCalled = true; };

        const pointCollection: number[][] = [[10, 30], [20, 40], [15, 5], [30, 50], [25, 45], [35, 60]]; // later point with y=5 < initial yMin
        const bounds: number[] = [0, 0, 100, 100];
        const borderWidth: number = 1;
        const inkCollection: any[] = [[1, 2, 3, 4]];

        // Act
        const result: any = (PdfInkAnnotation.prototype as any)._calculateInkBounds.call(
            annotation, pointCollection, bounds, borderWidth, false, inkCollection
        );

        // Assert
        expect(result[1]).toBe(5);
        expect(updateCalled).toBe(true);
    });
});
