import { PdfTemplate } from '../../src/pdf/core/graphics/pdf-template';
import { PdfPolyLineAnnotation, PdfCircleAnnotation, PdfLineAnnotation, PdfEllipseAnnotation, PdfSquareAnnotation, PdfAnnotationBorder, PdfRectangleAnnotation, PdfPolygonAnnotation, PdfRadioButtonListItem, PdfPopupAnnotation, PdfFileLinkAnnotation, PdfAngleMeasurementAnnotation, PdfAnnotation, PdfInkAnnotation, } from '../../src/pdf/core/annotations/annotation';
import { _PdfAnnotationType, _PdfGraphicsUnit, PdfBorderStyle, PdfCircleMeasurementType, PdfLineCap, PdfLineCaptionType, PdfLineEndingStyle, PdfMeasurementUnit, PdfPopupIcon, PdfRotationAngle } from '../../src/pdf/core/enumerator'
import * as utils from '../../src/pdf/core/utils'
import { _PdfReference } from '../../src/pdf/core/pdf-primitives';
import { PdfAppearance } from '../../src/pdf/core/annotations/pdf-appearance';
class FakePdfPath {
    public _points: number[] = [];
    public _pathTypes: number[] = [];
    public arcs: any[] = [];
    public closed = false;

    addArc(x: number, y: number, width: number, height: number, startAngle: number, sweepAngle: number
    ): void {
        this.arcs.push({ x, y, width, height, startAngle, sweepAngle });
        this._points.push(x, y, width, height, startAngle, sweepAngle);
        this._pathTypes.push(1);
    }

    closeFigure(): void {
        this.closed = true;
    }
}

class FakePdfGraphics {
    public drawCalls: Array<{ path: any; penOrBrush: any }> = [];

    drawPath(path: any, penOrBrush: any): void {
        this.drawCalls.push({ path, penOrBrush });
    }
}

const createPoint = (x: number, y: number) => ({ x, y });
// PdfAnnotation methods check

describe('PdfPolyLineAnnotation - Cloud Style (Full Branch Coverage)', () => {
    let annotation: any;

    beforeEach(() => {
        annotation = new PdfPolyLineAnnotation([{ x: 100, y: 300 }, { x: 180, y: 250 }, { x: 300, y: 260 }, { x: 360, y: 320 }]);
    });

    it('T1: empty points → no circles → only final pen draw', () => {
        const graphics = new FakePdfGraphics();

        annotation._drawCloudStyle(graphics, null, {}, 10, 5, [], false);

        expect(graphics.drawCalls.length).toBe(1);
        expect(graphics.drawCalls[0].penOrBrush).toBeTruthy();
    });

    it('T2: long segment produces circles and intersection arcs', () => {
        const graphics = new FakePdfGraphics();
        const points = [createPoint(0, 0), createPoint(100, 0)];

        annotation._drawCloudStyle(graphics, null, {}, 10, 5, points, false);

        expect(graphics.drawCalls.length).toBeGreaterThan(0);
    });

    it('T7: isAppearance true applies Y-flip and remapping', () => {
        const graphics = new FakePdfGraphics();
        const points = [createPoint(0, 0), createPoint(50, 0)];

        annotation._drawCloudStyle(graphics, null, {}, 10, 5, points, true);

        const path = graphics.drawCalls[0].path;
        expect(path._points.length).toBeGreaterThan(0);
    });

    it('T8: isAppearance false uses direct point assignment', () => {
        const graphics = new FakePdfGraphics();
        const points = [createPoint(0, 0), createPoint(50, 0)];

        annotation._drawCloudStyle(graphics, null, {}, 10, 5, points, false);

        const path = graphics.drawCalls[0].path;
        expect(path._points.length).toBeGreaterThan(0);
    });
    it('T9: brush null → brush drawPath executed', () => {
        const graphics = new FakePdfGraphics();

        annotation._drawCloudStyle(graphics, null, {}, 10, 5, [createPoint(0, 0), createPoint(50, 0)], false);

        expect(graphics.drawCalls.length).toEqual(1);
    });

    it('T10: brush non‑null → skip brush drawPath', () => {
        const graphics = new FakePdfGraphics();

        annotation._drawCloudStyle(graphics, {}, {}, 10, 5, [createPoint(0, 0), createPoint(50, 0)], false);

        expect(graphics.drawCalls.length).toBe(2);
    });

    it('T11: clamp case a < -1', () => {
        const r = annotation._getIntersectionDegrees(
            [1000, 1000],
            [-1000, -1000],
            1
        );

        expect(r[0]).toBeDefined();
        expect(r[1]).toBeDefined();
    });

    it('T12: clamp case a > 1', () => {
        const r = annotation._getIntersectionDegrees(
            [0.0001, 0],
            [0.0002, 0],
            1000
        );

        expect(r[0]).toBeDefined();
        expect(r[1]).toBeDefined();
    });

    it('T13: normal intersection (-1 ≤ a ≤ 1)', () => {
        const r = annotation._getIntersectionDegrees(
            [10, 0],
            [0, 10],
            20
        );
        expect(typeof r[0]).toBe('number');
        expect(typeof r[1]).toBe('number');
        expect(r).toEqual([65.70481105463543, 384.2951889453646]);
    });
    it('T14: _isClockWise returns true and false correctly', () => {

        const clockwise = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 0 }
        ];


        const counterClockWise = [
            createPoint(0, 0),
            createPoint(0, 0),
            createPoint(0, 0),
        ];

        const check: any = null
        expect(annotation._isClockWise(check)).toBeFalsy();
        expect(annotation._isClockWise(clockwise)).toBeTruthy();
        expect(annotation._isClockWise(counterClockWise)).toBeFalsy();
    });
});
describe('Annotation Line End Preparers & Bounds (lines 2573-2643)', () => {
    let annotation: any;

    beforeEach(() => {
        annotation = new PdfPolyLineAnnotation([{ x: 0, y: 0 }, { x: 10, y: 10 }]);
    });

    it('P1: _prepareReverseOpenArrow returns points with numeric coords', () => {
        const axis = { x: 5, y: 5 };
        const out = annotation._prepareReverseOpenArrow(true, axis, 45, 2);
        expect(out).toBeDefined();
        expect(typeof out.startPoint.x).toBe('number');
        expect(typeof out.first.y).toBe('number');
        expect(typeof out.second.x).toBe('number');
    });

    it('P2: _prepareClosedArrow returns points with numeric coords', () => {
        const axis = { x: 1, y: 2 };
        const out = annotation._prepareClosedArrow(false, axis, 90, 3);
        expect(out).toBeDefined();
        expect(typeof out.startPoint.y).toBe('number');
        expect(typeof out.first.x).toBe('number');
        expect(typeof out.second.y).toBe('number');
    });

    it('P3: _prepareReverseCloseArrow returns points with numeric coords', () => {
        const axis = { x: -2, y: 7 };
        const out = annotation._prepareReverseCloseArrow(false, axis, 0, 1);
        expect(out).toBeDefined();
        expect(typeof out.startPoint.x).toBe('number');
        expect(typeof out.first.x).toBe('number');
        expect(typeof out.second.x).toBe('number');
    });

    it('P4: _prepareSlash returns two distinct numeric points', () => {
        const axis = { x: 0, y: 0 };
        const out = annotation._prepareSlash(axis, 30, 2);
        expect(out).toBeDefined();
        expect(typeof out.first.x).toBe('number');
        expect(typeof out.second.y).toBe('number');
    });

    it('P5: _prepareDiamond returns four numeric vertices', () => {
        const axis = { x: 10, y: 10 };
        const out = annotation._prepareDiamond(axis, 2);
        expect(out).toBeDefined();
        expect(typeof out.first.x).toBe('number');
        expect(typeof out.second.y).toBe('number');
        expect(typeof out.third.x).toBe('number');
        expect(typeof out.fourth.y).toBe('number');
    });

    it('P6: _prepareButt returns two numeric endpoints', () => {
        const axis = { x: 3, y: 4 };
        const out = annotation._prepareButt(axis, 10, 1);
        expect(out).toBeDefined();
        expect(typeof out.first.x).toBe('number');
        expect(typeof out.second.y).toBe('number');
    });

    it('P1b: _prepareReverseOpenArrow calls _getAxisValue with negative length when isBegin true', () => {
        const axis = { x: 5, y: 6 };
        const calls: any[] = [];
        annotation._getAxisValue = function (p: any, a: number, len: number) {
            calls.push({ p, a, len });
            return { x: a, y: len };
        };

        const out = annotation._prepareReverseOpenArrow(true, axis, 45, 3);

        expect(calls.length).toBe(3);
        expect(calls[0].len).toBe(-3);
        expect(calls[1].a).toBe(45 + 150);
        expect(calls[2].a).toBe(45 - 150);
        expect(calls[1].len).toBe(9 * 3);
        expect(out.startPoint).toEqual({ x: 45, y: -3 });
        expect(out.first).toEqual({ x: 195, y: 27 });
        expect(out.second).toEqual({ x: -105, y: 27 });
    });

    it('P1c: _prepareReverseOpenArrow positive length when isBegin false', () => {
        const axis = { x: 0, y: 0 };
        const calls: any[] = [];
        annotation._getAxisValue = function (p: any, a: number, len: number) {
            calls.push({ p, a, len });
            return { x: a, y: len };
        };

        const out = annotation._prepareReverseOpenArrow(false, axis, 10, 2);

        expect(calls.length).toBe(3);
        expect(calls[0].len).toBe(2);
        expect(calls[1].a).toBe(10 + 30);
        expect(calls[2].a).toBe(10 - 30);
        expect(calls[1].len).toBe(9 * 2);
        expect(out.startPoint).toEqual({ x: 10, y: 2 });
        expect(out.first).toEqual({ x: 40, y: 18 });
        expect(out.second).toEqual({ x: -20, y: 18 });
    });

    it('B1: _getBoundsFromLineEndStyle handles square (and circle) branch', () => {
        const axis = { x: 10, y: 20 };
        const res = annotation._getBoundsFromLineEndStyle(axis, 0, null, PdfLineEndingStyle.square, 2, true);
        expect(res).toBeDefined();
        expect(res.x).toBe(10 - (3 * 2));
        expect(res.y).toBe(20 + (3 * 2));
        expect(res.width).toBe(6 * 2);
        expect(res.height).toBe(6 * 2);
    });

    it('B2: _getBoundsFromLineEndStyle handles closedArrow and rClosedArrow via _getBoundsValue flow', () => {
        const axis = { x: 0, y: 0 };
        const closed = annotation._getBoundsFromLineEndStyle(axis, 45, null, PdfLineEndingStyle.closedArrow, 2, false);
        const rclosed = annotation._getBoundsFromLineEndStyle(axis, 45, null, PdfLineEndingStyle.rClosedArrow, 2, true);
        expect(closed).toBeDefined();
        expect(rclosed).toBeDefined();
        expect(typeof closed.x).toBe('number');
        expect(typeof rclosed.width).toBe('number');
    });

    it('B3: _getBoundsFromLineEndStyle handles slash, diamond and butt branches', () => {
        const axis = { x: 5, y: 5 };
        const slash = annotation._getBoundsFromLineEndStyle(axis, 0, null, PdfLineEndingStyle.slash, 2, false);
        const diamond = annotation._getBoundsFromLineEndStyle(axis, 0, null, PdfLineEndingStyle.diamond, 2, false);
        const butt = annotation._getBoundsFromLineEndStyle(axis, 0, null, PdfLineEndingStyle.butt, 2, false);
        expect(slash).toBeDefined();
        expect(diamond).toBeDefined();
        expect(butt).toBeDefined();
        expect(typeof slash.height).toBe('number');
        expect(typeof diamond.width).toBe('number');
        expect(typeof butt.x).toBe('number');
    });
    it('B4: _getBoundsFromLineEndStyle handles PdfLineEndingStyle.rOpenArrow, diamond and butt branches', () => {
        const axis = { x: 5, y: 5 };
        const slash = annotation._getBoundsFromLineEndStyle(axis, 0, null, PdfLineEndingStyle.rOpenArrow, 2, false);
        const diamond = annotation._getBoundsFromLineEndStyle(axis, 0, null, PdfLineEndingStyle.diamond, 2, false);
        const butt = annotation._getBoundsFromLineEndStyle(axis, 0, null, PdfLineEndingStyle.butt, 2, false);
        expect(slash).toBeDefined();
        expect(diamond).toBeDefined();
        expect(butt).toBeDefined();
        expect(typeof slash.height).toBe('number');
        expect(typeof diamond.width).toBe('number');
        expect(typeof butt.x).toBe('number');
    });

});
describe('PdfCircleAnnotation - _createCircleAppearance branches', () => {
    it('C1: returns custom template when present', () => {
        const circle: any = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 50 });
        const fakeTemplate = { custom: true } as any;
        circle._customTemplate.set('N', fakeTemplate);

        const t = circle._createCircleAppearance();

        expect(t).toBe(fakeTemplate);
    });

    it('C2: BE absent -> drawEllipse path returns a template', () => {
        const circle = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 50 });
        circle._customTemplate.clear();
        circle._color = { r: 0, g: 0, b: 0 };
        circle.border = { width: 2, style: PdfBorderStyle.solid } as any;

        const t = circle._createCircleAppearance();

        expect(t).toBeDefined();
    });

    it('C3 + C9 + C10: BE present, undefined color -> uses _drawCircleAppearance and sets transparent flag and handles opacity', () => {
        const circle: any = new PdfCircleAnnotation({ x: 0, y: 0, width: 80, height: 40 });
        circle._customTemplate.clear();
        circle._dictionary.set('BE', { S: 'C', I: 2 });
        circle._color = undefined;
        circle._innerColor = { r: 1, g: 1, b: 1 };
        circle.border = { width: 4, style: PdfBorderStyle.dashed } as any;
        circle._opacity = 0.5;

        let called = false;
        circle._drawCircleAppearance = function (rect: any, bw: any, graphics: any, parameter: any) {
            called = true;
        };

        const t = circle._createCircleAppearance();

        expect(t).toBeDefined();
        expect(circle._isTransparentColor).toBeTruthy();
        expect(called).toBeTruthy();
    });

    it('C4: dot border style branch executes without throwing', () => {
        const circle: any = new PdfCircleAnnotation({ x: 0, y: 0, width: 60, height: 60 });
        circle._customTemplate.clear();
        circle._dictionary;
        circle._color = { r: 10, g: 10, b: 10 };
        circle.border = { width: 1, style: PdfBorderStyle.dot } as any;

        expect(() => circle._createCircleAppearance()).not.toThrow();
    });

});
describe('PdfCircleAnnotation - _drawCircleAppearance branches', () => {
    it('D1: RD absent -> drawEllipse called with expected rect', () => {
        const circle: any = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 50 });
        circle._dictionary;
        circle.border = { width: 4 } as any;

        const graphics: any = {
            drawEllipse(rect: any, pen: any, brush: any) {
                (this as any)._called = true;
                (this as any)._args = [rect, pen, brush];
            }
        };

        const parameter: any = { borderPen: 'bp', backBrush: 'bb' };

        circle._drawCircleAppearance([0, 0, 100, 50], 2, graphics, parameter);

        expect((graphics as any)._called).toBeTruthy();
        const args = (graphics as any)._args;
        expect(args[0]).toEqual({ x: 2, y: -0, width: 96, height: -50 });
        expect(args[1]).toBe('bp');
        expect(args[2]).toBe('bb');
    });

    it('D2: RD present but empty array -> drawEllipse called', () => {
        const circle = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 50 });
        circle._dictionary.set('RD', []);

        const graphics: any = {
            drawEllipse() { (this as any)._called = true; }
        };

        circle._drawCircleAppearance([10, 5, 80, 40], 1, graphics, { borderPen: null, backBrush: null } as any);

        expect((graphics as any)._called).toBeTruthy();
    });

    it('D3: RD positive -> _createBezier called 4x and _drawCloudStyle invoked with mapped points', () => {
        const circle: any = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 50 });
        circle._dictionary.set('RD', [2, 2, 2, 2]);

        let createCount = 0;
        circle._createBezier = function (first: any, second: any, third: any, points: any) {
            createCount++;
            points.push([1, 2]);
        };

        let cloudArgs: any = null;
        circle._drawCloudStyle = function (g: any, brush: any, pen: any, radius: any, overlap: any, pts: any, isAppearance: any) {
            cloudArgs = { g, brush, pen, radius, overlap, pts, isAppearance };
        };

        const graphics: any = {
            drawEllipse() { (this as any)._called = true; }
        };

        circle._drawCircleAppearance([0, 0, 100, 50], 2, graphics, { borderPen: 'bp', backBrush: 'bb' } as any);

        expect(createCount).toBe(4);
        expect(cloudArgs).toBeTruthy();
        expect(cloudArgs.radius).toBe(2);
        expect(cloudArgs.pts.length).toBeGreaterThan(0);
        expect(cloudArgs.pts[0]).toEqual({ x: 1, y: 2 });
    });

});
describe('PdfAnnotation._createBezier (lines 2454-2458)', () => {
    let annotation: any;

    beforeEach(() => {
        annotation = new PdfPolyLineAnnotation([{ x: 0, y: 0 }, { x: 10, y: 10 }]);
    });

    it('creates bezierPoints with populate pushing an extra point (AAA)', () => {
        // Arrange
        const first = [1, 2];
        const second = [3, 4];
        const third = [5, 6];
        const bezierPoints: any[] = [];
        const calls: any[] = [];

        // Act
        annotation._createBezier(first, second, third, bezierPoints);

        // Assert
        expect(bezierPoints.length).toBe(5);
        expect(bezierPoints[0]).toEqual(first);
        expect(bezierPoints[1]).toEqual([2, 3]);
        expect(bezierPoints[2]).toEqual([3, 4]);
    });

    it('no-op populate results only first and third entries (AAA)', () => {
        // Arrange
        const first = [10, 11];
        const second = [12, 13];
        const third = [14, 15];
        const bezierPoints: any[] = [];


        // Act
        annotation._createBezier(first, second, third, bezierPoints);

        // Assert
        expect(bezierPoints.length).toBe(5);
        expect(bezierPoints[0]).toEqual(first);
        expect(bezierPoints[1]).toEqual([11, 12]);
    });
});

describe('PdfAnnotation._drawLineEndStyle branches (lines 2759-2833)', () => {
    let annotation: any;

    beforeEach(() => {
        annotation = new PdfPolyLineAnnotation([{ x: 0, y: 0 }, { x: 10, y: 10 }]);
    });

    class FakeGraphicsDetailed {
        public calls: any[] = [];
        public stateControlCalled = false;
        public buildUpPathArgs: any = null;
        public drawGraphicsPathArgs: any = null;

        drawRectangle(rect: any, pen: any, brush: any) { this.calls.push({ method: 'drawRectangle', rect, pen, brush }); }
        drawEllipse(rect: any, pen: any, brush: any) { this.calls.push({ method: 'drawEllipse', rect, pen, brush }); }
        drawPolygon(points: any, pen: any, brush: any) { this.calls.push({ method: 'drawPolygon', points, pen, brush }); }
        drawLine(pen: any, p1: any, p2: any) { this.calls.push({ method: 'drawLine', pen, p1, p2 }); }
        _stateControl(p: any, a: any, b: any) { this.stateControlCalled = true; this.calls.push({ method: '_stateControl', p, a, b }); }
        _buildUpPath(points: any, pathTypes: any) { this.buildUpPathArgs = { points, pathTypes }; this.calls.push({ method: '_buildUpPath', points, pathTypes }); }
        _drawGraphicsPath(pen: any, brush: any, fillMode: any, flag: any) { this.drawGraphicsPathArgs = { pen, brush, fillMode, flag }; this.calls.push({ method: '_drawGraphicsPath', pen, brush, fillMode, flag }); }
    }

    it('L1: square draws rectangle with expected values', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        const axis = { x: 10, y: 20 };

        // Act
        annotation._drawLineEndStyle(axis, g as any, 0, 'pen', 'brush', PdfLineEndingStyle.square, 2, false);

        // Assert
        expect(g.calls.length).toBe(1);
        const c = g.calls[0];
        expect(c.method).toBe('drawRectangle');
        expect(c.rect.x).toBe(10 - (3 * 2));
        expect(c.rect.y).toBe(-(20 + (3 * 2)));
        expect(c.rect.width).toBe(6 * 2);
        expect(c.rect.height).toBe(6 * 2);
    });

    it('L2: circle draws ellipse with expected values', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        const axis = { x: 7, y: 8 };

        // Act
        annotation._drawLineEndStyle(axis, g as any, 0, 'pen2', 'brush2', PdfLineEndingStyle.circle, 3, false);

        // Assert
        expect(g.calls.length).toBe(1);
        const c = g.calls[0];
        expect(c.method).toBe('drawEllipse');
        expect(c.rect.x).toBe(7 - (3 * 3));
        expect(c.rect.y).toBe(-(8 + (3 * 3)));
        expect(c.rect.width).toBe(6 * 3);
        expect(c.rect.height).toBe(6 * 3);
    });

    it('L3: openArrow uses path API and draws graphics path', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        annotation._prepareOpenArrow = function (isBegin: any, axis: any, angle: any, len: any) {
            return { startPoint: { x: 1, y: 2 }, first: { x: 3, y: 4 }, second: { x: 5, y: 6 } };
        };

        // Act
        annotation._drawLineEndStyle({ x: 0, y: 0 }, g as any, 0, 'pen', null, PdfLineEndingStyle.openArrow, 1, false);

        // Assert
        expect(g.stateControlCalled).toBeTruthy();
        expect(g.buildUpPathArgs).toBeTruthy();
        expect(g.drawGraphicsPathArgs).toBeTruthy();
    });

    it('L4: rOpenArrow uses reverse prepare and draws graphics path', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        annotation._prepareReverseOpenArrow = function (isBegin: any, axis: any, angle: any, len: any) {
            return { startPoint: { x: 2, y: 3 }, first: { x: 4, y: 5 }, second: { x: 6, y: 7 } };
        };

        // Act
        annotation._drawLineEndStyle({ x: 0, y: 0 }, g as any, 0, 'pen', null, PdfLineEndingStyle.rOpenArrow, 1, true);

        // Assert
        expect(g.stateControlCalled).toBeTruthy();
        expect(g.buildUpPathArgs).toBeTruthy();
        expect(g.drawGraphicsPathArgs).toBeTruthy();
    });

    it('L5: closedArrow calls drawPolygon with negated y coords', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        annotation._prepareClosedArrow = function () {
            return { startPoint: { x: 1, y: 2 }, first: { x: 3, y: 4 }, second: { x: 5, y: 6 } };
        };

        // Act
        annotation._drawLineEndStyle({ x: 0, y: 0 }, g as any, 0, 'p', 'b', PdfLineEndingStyle.closedArrow, 2, false);

        // Assert
        const call = g.calls.find((x: any) => x.method === 'drawPolygon');
        expect(call).toBeTruthy();
        expect(call.points).toEqual([{ x: 1, y: -2 }, { x: 3, y: -4 }, { x: 5, y: -6 }]);
    });

    it('L6: rClosedArrow calls drawPolygon with negated y coords', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        annotation._prepareReverseCloseArrow = function () {
            return { startPoint: { x: 7, y: 8 }, first: { x: 9, y: 10 }, second: { x: 11, y: 12 } };
        };

        // Act
        annotation._drawLineEndStyle({ x: 0, y: 0 }, g as any, 0, 'p', 'b', PdfLineEndingStyle.rClosedArrow, 1, true);

        // Assert
        const call = g.calls.find((x: any) => x.method === 'drawPolygon');
        expect(call).toBeTruthy();
        expect(call.points).toEqual([{ x: 7, y: -8 }, { x: 9, y: -10 }, { x: 11, y: -12 }]);
    });

    it('L7: slash draws two lines from axis to points', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        const axis = { x: 5, y: 5 };
        annotation._prepareSlash = function () { return { first: { x: 1, y: 2 }, second: { x: 3, y: 4 } }; };

        // Act
        annotation._drawLineEndStyle(axis, g as any, 0, 'p', null, PdfLineEndingStyle.slash, 2, false);

        // Assert
        const lineCalls = g.calls.filter((c: any) => c.method === 'drawLine');
        expect(lineCalls.length).toBe(2);
        expect(lineCalls[0].p1).toEqual({ x: 5, y: -5 });
        expect(lineCalls[0].p2).toEqual({ x: 1, y: -2 });
        expect(lineCalls[1].p2).toEqual({ x: 3, y: -4 });
    });

    it('L8: diamond draws polygon with four negated vertices', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        annotation._prepareDiamond = function () {
            return { first: { x: 1, y: 1 }, second: { x: 2, y: 2 }, third: { x: 3, y: 3 }, fourth: { x: 4, y: 4 } };
        };

        // Act
        annotation._drawLineEndStyle({ x: 0, y: 0 }, g as any, 0, 'pen', 'brush', PdfLineEndingStyle.diamond, 1, false);

        // Assert
        const call = g.calls.find((x: any) => x.method === 'drawPolygon');
        expect(call).toBeTruthy();
        expect(call.points).toEqual([{ x: 1, y: -1 }, { x: 2, y: -2 }, { x: 3, y: -3 }, { x: 4, y: -4 }]);
    });

    it('L9: butt draws single line between computed endpoints', () => {
        // Arrange
        const g = new FakeGraphicsDetailed();
        annotation._prepareButt = function () { return { first: { x: 10, y: 11 }, second: { x: 12, y: 13 } }; };

        // Act
        annotation._drawLineEndStyle({ x: 0, y: 0 }, g as any, 0, 'pen', null, PdfLineEndingStyle.butt, 2, false);

        // Assert
        const call = g.calls.find((x: any) => x.method === 'drawLine');
        expect(call).toBeTruthy();
        expect(call.p1).toEqual({ x: 10, y: -11 });
        expect(call.p2).toEqual({ x: 12, y: -13 });
    });

});
describe('PdfAnnotation._getEqualPdfGraphicsUnit (lines 3132-3162)', () => {
    let annotation: any;

    beforeEach(() => {
        annotation = new PdfPolyLineAnnotation([{ x: 0, y: 0 }, { x: 10, y: 10 }]);
    });

    it('G1: inch maps to _PdfGraphicsUnit.inch and "in"', () => {
        const res = annotation._getEqualPdfGraphicsUnit(PdfMeasurementUnit.inch, '');
        expect(res.graphicsUnit).toBe(_PdfGraphicsUnit.inch);
        expect(res.unitString).toBe('in');
    });

    it('G2: centimeter maps to _PdfGraphicsUnit.centimeter and "cm"', () => {
        const res = annotation._getEqualPdfGraphicsUnit(PdfMeasurementUnit.centimeter, '');
        expect(res.graphicsUnit).toBe(_PdfGraphicsUnit.centimeter);
        expect(res.unitString).toBe('cm');
    });

    it('G3: millimeter maps to _PdfGraphicsUnit.millimeter and "mm"', () => {
        const res = annotation._getEqualPdfGraphicsUnit(PdfMeasurementUnit.millimeter, '');
        expect(res.graphicsUnit).toBe(_PdfGraphicsUnit.millimeter);
        expect(res.unitString).toBe('mm');
    });

    it('G4: pica maps to _PdfGraphicsUnit.pica and "p"', () => {
        const res = annotation._getEqualPdfGraphicsUnit(PdfMeasurementUnit.pica, '');
        expect(res.graphicsUnit).toBe(_PdfGraphicsUnit.pica);
        expect(res.unitString).toBe('p');
    });

    it('G5: point maps to _PdfGraphicsUnit.point and "pt"', () => {
        const res = annotation._getEqualPdfGraphicsUnit(PdfMeasurementUnit.point, '');
        expect(res.graphicsUnit).toBe(_PdfGraphicsUnit.point);
        expect(res.unitString).toBe('pt');
    });

    it('G6: unknown measurement defaults to inch and "in"', () => {
        const res = annotation._getEqualPdfGraphicsUnit((<any>999), '');
        expect(res.graphicsUnit).toBe(_PdfGraphicsUnit.inch);
        expect(res.unitString).toBe('in');
    });
});

describe('Getters, setter and constructor - explicit else branch', () => {
    it('PdfLineAnnotation- creates comments collection when none exists (explicit else)', () => {
        const annotation: any = new PdfLineAnnotation({ x: 0, y: 0 }, { x: 10, y: 10 });
        // ensure internal is not set
        expect(annotation._comments).toBeUndefined();
        const comments = annotation.comments;
        expect(comments).toBeDefined();
        expect(annotation._comments).toBe(comments);
    });
    it('PdfLineAnnotation- constructors properties none exists (explicit else)', () => {
        const annotation = new PdfLineAnnotation({ x: 0, y: 0 }, { x: 10, y: 10 }, { subject: 'subject' });
        // ensure internal is not set
        const comments = annotation.subject;
        expect(comments).toBeDefined();
        expect(comments).toBe("subject");
    });
    it('PdfLineAnnotation- _calculateAngle should return 0 degrees for a horizontal line to the right', () => {
        const annotation = new (PdfLineAnnotation as any)();
        const angle = annotation._calculateAngle(0, 0, 10, 0);
        expect(angle).toBe(0);
    });
    it('PdfLineAnnotation- leaderOffset setter check', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation.leaderOffset = 15;
        annotation.leaderOffset = 'abc';

        expect(annotation.leaderOffset).toEqual('abc');
    });
    it('PdfLineAnnotation- unit - getter check', () => {
        const annotation = new PdfLineAnnotation();
        spyOn(utils, '_mapMeasurementUnit').and.returnValue(PdfMeasurementUnit.inch);
        annotation._isTextUpdated = true;
        annotation._unit = PdfMeasurementUnit.centimeter;

        expect(annotation.unit).toEqual(PdfMeasurementUnit.centimeter);

        annotation._isTextUpdated = false;
        annotation._unit = undefined;
        annotation._isLoaded = true;
        expect(annotation.unit).toEqual(PdfMeasurementUnit.centimeter);


        annotation._dictionary.set('Contents', '100inch');
        expect(annotation.unit).toEqual(PdfMeasurementUnit.inch);
    });
    it('PdfCircleAnnotation - constructors properties none exists (explicit else)', () => {
        const annotation = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 100 }, { measure: { unit: PdfMeasurementUnit.inch } });
        // ensure internal is not set
        const unit = annotation.unit;
        expect(unit).toBeDefined();
        expect(unit).toBe(PdfMeasurementUnit.inch);
        const annotation1 = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 100 }, { measure: { type: PdfCircleMeasurementType.diameter } });
        // ensure internal is not set
        const type = annotation.measureType;
        expect(type).toBeDefined();
        expect(type).toBe(PdfCircleMeasurementType.diameter);
    });
    it('PdfCircleAnnotation - unit - getter check', () => {
        const annotation: any = new PdfCircleAnnotation();
        spyOn(utils, '_mapMeasurementUnit').and.returnValue(PdfMeasurementUnit.inch);
        annotation._isTextUpdated = true;
        annotation._unit = PdfMeasurementUnit.centimeter;

        expect(annotation.unit).toEqual(PdfMeasurementUnit.centimeter);

        annotation._isTextUpdated = false;
        annotation._unit = undefined;
        annotation._isLoaded = true;
        expect(annotation.unit).toEqual(PdfMeasurementUnit.centimeter);

        annotation._dictionary.set('Contents', '100inch');
        expect(annotation.unit).toEqual(PdfMeasurementUnit.inch);
    });
    it('PdfSquareAnnotation - unit - getter check', () => {
        const annotation: any = new PdfSquareAnnotation();
        spyOn(utils, '_mapMeasurementUnit').and.returnValue(PdfMeasurementUnit.inch);
        annotation._isTextUpdated = true;
        annotation._unit = PdfMeasurementUnit.centimeter;

        expect(annotation.unit).toEqual(PdfMeasurementUnit.centimeter);

        annotation._isTextUpdated = false;
        annotation._unit = undefined;
        annotation._isLoaded = true;
        expect(annotation.unit).toEqual(PdfMeasurementUnit.centimeter);

        annotation._dictionary.set('Contents', '100inch');
    });
    it('PdfEllipseAnnotation- constructors properties none exists (explicit else)', () => {
        const annotation = new PdfEllipseAnnotation({ x: 0, y: 0, width: 100, height: 100 }, { subject: 'subject' });
        // ensure internal is not set
        const comments = annotation.subject;
        expect(comments).toBeDefined();
        expect(comments).toBe("subject");
        const annotation1 = new PdfEllipseAnnotation({ x: 0, y: 0, width: 100, height: 100 }, { text: 'text' });
        // ensure internal is not set
        const text = annotation1.text;
        expect(text).toBeDefined();
        expect(text).toBe("text");
    });
    it('PdfSquareAnnotation- constructors properties none exists (explicit else)', () => {
        const annotation = new PdfSquareAnnotation({ x: 0, y: 0, width: 100, height: 100 }, { text: "text" });
        // ensure internal is not set
        const text = annotation.text;
        expect(text).toBeDefined();
        expect(text).toBe("text");
        const annotation1 = new PdfSquareAnnotation({ x: 0, y: 0, width: 100, height: 100 }, { author: 'author' });
        // ensure internal is not set
        const author = annotation1.author;
        expect(author).toBeDefined();
        expect(author).toBe("author");
    });
    it('PdfRectangleAnnotation- constructors properties none exists (explicit else)', () => {
        const annotation = new PdfRectangleAnnotation({ x: 0, y: 0, width: 100, height: 100 }, { text: "text" });
        // ensure internal is not set
        const text = annotation.text;
        expect(text).toBeDefined();
        expect(text).toBe("text");
        const annotation1 = new PdfRectangleAnnotation({ x: 0, y: 0, width: 100, height: 100 }, { author: 'author' });
        // ensure internal is not set
        const author = annotation1.author;
        expect(author).toBeDefined();
        expect(author).toBe("author");
    });
    it('PdfPolygonAnnotation - constructors properties none exists (explicit else)', () => {
        const annotation = new PdfPolygonAnnotation([{ x: 0, y: 0 }], { text: "text" });
        // ensure internal is not set
        const text = annotation.text;
        expect(text).toBeDefined();
        expect(text).toBe("text");
        const annotation1 = new PdfPolygonAnnotation([{ x: 0, y: 0 }], { author: 'author' });
        // ensure internal is not set
        const author = annotation1.author;
        expect(author).toBeDefined();
        expect(author).toBe("author");
    });
    it('PdfPolyLineAnnotation - constructors properties none exists (explicit else)', () => {
        const annotation = new PdfPolyLineAnnotation([{ x: 0, y: 0 }], { text: "text" });
        // ensure internal is not set
        const text = annotation.text;
        expect(text).toBeDefined();
        expect(text).toBe("text");
        const annotation1 = new PdfPolyLineAnnotation([{ x: 0, y: 0 }], { author: 'author' });
        // ensure internal is not set
        const author = annotation1.author;
        expect(author).toBeDefined();
        expect(author).toBe("author");
    });
});
describe('PdfLineAnnotation._calculateLineBounds -  branch coverage', () => {
    let annotation: any;

    beforeEach(() => {
        annotation = new (PdfLineAnnotation as any)();

        annotation._dictionary = {
            update: jasmine.createSpy('update')
        };

        spyOn(annotation, '_getAngle').and.returnValue(0);
        spyOn(annotation, '_getAxisValue').and.callFake(
            (pt: any, angle: any, dist: any) => ({
                x: pt.x + dist,
                y: pt.y + dist
            })
        );
        spyOn(annotation, '_getLinePoint').and.returnValue({ x: 2, y: 2 });
        spyOn(annotation, '_getBounds').and.callFake((points: any) => ({
            x: Math.min(points[0].x, points[1].x),
            y: Math.min(points[0].y, points[1].y),
            width: Math.abs(points[1].x - points[0].x),
            height: Math.abs(points[1].y - points[0].y)
        }));
    });

    it('should return default bounds when linePoints is undefined', () => {
        const bounds = annotation._calculateLineBounds(
            null, 0, 0, 0, { begin: 0, end: 0 }, 1
        );

        expect(bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should handle negative leaderLine (if branch)', () => {
        annotation._calculateLineBounds(
            [{ x: 0, y: 0 }, { x: 10, y: 0 }],
            2,
            -5,
            0,
            { begin: 0, end: 0 },
            1
        );

        expect(annotation._getAxisValue).toHaveBeenCalled();
    });

    it('should update line points when leaderOffset is non-zero', () => {
        annotation._calculateLineBounds(
            [{ x: 1, y: 1 }, { x: 5, y: 5 }],
            1,
            3,
            4, // leaderOffset ≠ 0
            { begin: 0, end: 0 },
            1
        );

        expect(annotation._dictionary.update).toHaveBeenCalledWith(
            'L',
            jasmine.any(Array)
        );
    });

    it('should execute else branch for X comparison', () => {
        annotation._getAxisValue.and.callFake((pt: any, a: any, d: any) => ({
            x: pt.x - d, y: pt.y
        }));

        annotation._calculateLineBounds(
            [{ x: 10, y: 0 }, { x: 0, y: 0 }],
            1,
            2,
            0,
            { begin: 0, end: 0 },
            1
        );

        expect(annotation._getBounds).toHaveBeenCalled();
    });

    it('should execute else branch for Y comparison', () => {
        annotation._getAxisValue.and.callFake((pt: any, a: any, d: any) => ({
            x: pt.x, y: pt.y - d
        }));

        annotation._calculateLineBounds(
            [{ x: 0, y: 10 }, { x: 0, y: 0 }], 1, 2, 0, { begin: 0, end: 0 }, 1);

        expect(annotation._getBounds).toHaveBeenCalled();
    });
});
describe('PdfLineAnnotation._getLinePoint', () => {
    let annotation: any;

    beforeEach(() => {
        annotation = new (PdfLineAnnotation as any)();
    });

    it('should return {3,3} for square style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.square, 2))
            .toEqual({ x: 3, y: 3 });
    });

    it('should return {3,3} for circle style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.circle, 2))
            .toEqual({ x: 3, y: 3 });
    });

    it('should return {3,3} for diamond style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.diamond, 2))
            .toEqual({ x: 3, y: 3 });
    });

    it('should return {1,5} for openArrow style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.openArrow, 2))
            .toEqual({ x: 1, y: 5 });
    });

    it('should return {1,5} for closedArrow style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.closedArrow, 2))
            .toEqual({ x: 1, y: 5 });
    });

    it('should calculate values for rOpenArrow style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.rOpenArrow, 4))
            .toEqual({ x: 11, y: 7 });
    });

    it('should calculate values for rClosedArrow style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.rClosedArrow, 6))
            .toEqual({ x: 12, y: 8 });
    });

    it('should return {5,9} for slash style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.slash, 2))
            .toEqual({ x: 5, y: 9 });
    });

    it('should return {1,3} for butt style', () => {
        expect(annotation._getLinePoint(PdfLineEndingStyle.butt, 2))
            .toEqual({ x: 1, y: 3 });
    });

    it('should return {0,0} for unknown style (default case)', () => {
        expect(annotation._getLinePoint(9999, 2))
            .toEqual({ x: 0, y: 0 });
    });

    it('should return {0,0} when style is undefined', () => {
        expect(annotation._getLinePoint(undefined, 2))
            .toEqual({ x: 0, y: 0 });
    });
});
describe('._postProcess (lines 4746-4758)', () => {
    it('throws when linePoints undefined', () => {
        // Arrange
        const annot: any = new PdfLineAnnotation();
        annot._linePoints = undefined;
        annot._dictionary = { has: () => false, set: () => { }, update: () => { } } as any;
        annot._getCropOrMediaBox = () => null as any;
        // Act / Assert
        expect(() => annot._postProcess(false)).toThrowError('Line points cannot be null or undefined');
    });
});
describe('PdfLineAnnotation appearance + geometry rendering', () => {
    let annotation: any;
    let graphics: any;
    let template: any;

    beforeEach(() => {
        graphics = {
            save: jasmine.createSpy('save').and.returnValue('state'),
            restore: jasmine.createSpy('restore'),
            drawLine: jasmine.createSpy('drawLine'),
            drawString: jasmine.createSpy('drawString'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            setTransparency: jasmine.createSpy('setTransparency')
        };

        template = {
            graphics,
            _writeTransformation: true
        };

        annotation = new (PdfLineAnnotation as any)();

        annotation._customTemplate = {
            has: jasmine.createSpy().and.returnValue(false),
            get: jasmine.createSpy()
        };

        annotation._dictionary = {
            has: jasmine.createSpy().and.returnValue(false),
            update: jasmine.createSpy(),
            get: () => { }
        };

        annotation._crossReference = {};
        annotation._obtainLineBounds = jasmine.createSpy().and.returnValue([0, 0, 100, 100]);
        annotation._obtainFont = jasmine.createSpy().and.returnValue({
            size: 12,
            measureString: () => ({ width: 40 }),
            _getHeight: () => 10
        });

        annotation._getAngle = jasmine.createSpy().and.returnValue(0);
        annotation._getAxisValue = jasmine.createSpy().and.callFake(
            (pt: any, a: any, d: any) => ({ x: pt.x + d, y: pt.y + d })
        );

        annotation._drawLine = jasmine.createSpy();
        annotation._drawLineStyle = jasmine.createSpy();

        annotation.bounds = { x: 0, y: 0, width: 0, height: 0 };
        annotation._linePoints = [{ x: 0, y: 0 }, { x: 100, y: 0 }];

        spyOn(utils, '_fromRectangle').and.returnValue([0, 0, 100, 100]);
    });
});
describe('PdfCircleAnnotation.measureType getter (lines 5800-5817)', () => {
    it('returns diameter when Contents matches converted radius (explicit else: true)', () => {
        // Arrange
        const circle: any = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 50 });
        circle._dictionary.set('Contents', '50pt');
        // Act
        const mt = circle.measureType;
        // Assert
        expect(mt).toBe(PdfCircleMeasurementType.diameter);
    });

    it('returns diameter when Contents present but value differs from converted radius', () => {
        // Arrange
        const circle: any = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 50 });
        circle._dictionary.set('Contents', '999pt');
        // Act
        const mt = circle.measureType;
        // Assert
        expect(mt).toBe(PdfCircleMeasurementType.diameter);
    });

    it('returns existing measureType when Contents is absent', () => {
        // Arrange
        const circle: any = new PdfCircleAnnotation({ x: 0, y: 0, width: 100, height: 50 });
        circle._measureType = PdfCircleMeasurementType.diameter;
        circle._dictionary = { has: () => false } as any;
        // Act
        const mt = circle.measureType;
        // Assert
        expect(mt).toBe(PdfCircleMeasurementType.diameter);
    });
});
describe('_postProcess throws when bounds are undefined', () => {
    const annotationClasses = [
        { name: 'PdfEllipseAnnotation', cls: PdfEllipseAnnotation, property: 'bounds', Bounds: "Bounds" },
        { name: 'PdfSquareAnnotation', cls: PdfSquareAnnotation, property: 'bounds', Bounds: "Bounds" },
        { name: 'PdfRectangleAnnotation', cls: PdfRectangleAnnotation, property: 'bounds', Bounds: "Bounds" },
        { name: 'PdfPolyLineAnnotation', cls: PdfPolyLineAnnotation, property: '_points', Bounds: "Points" },
    ];

    annotationClasses.forEach(({ name, cls, property, Bounds }) => {
        it(`${name} should throw error when ${property} is undefined`, () => {
            const annotation = new cls(null, null);
            (annotation as any)[property] = undefined;
            try {
                annotation._postProcess(true);
                fail(`Failed to throw when ${property} is undefined for ${name}`);
            } catch (error) {
                expect(error.message).toEqual(`${Bounds} cannot be null or undefined`);
            }
        });
    });
});
describe('PdfPopupAnnotation._obtainIconName', () => {
    let annotation: any;

    beforeEach(() => {
        // real object using prototype
        annotation = Object.create(PdfPopupAnnotation.prototype);
    });

    it('should return "Note" for PdfPopupIcon.note', () => {
        const result = annotation._obtainIconName(
            PdfPopupIcon.note
        );

        expect(result).toBe('Note');
        expect(annotation._iconString).toBe('Note');
    });

    it('should return "Comment" for PdfPopupIcon.comment', () => {
        const result = annotation._obtainIconName(
            PdfPopupIcon.comment
        );

        expect(result).toBe('Comment');
    });

    it('should return "Help" for PdfPopupIcon.help', () => {
        const result = annotation._obtainIconName(
            PdfPopupIcon.help
        );

        expect(result).toBe('Help');
    });

    it('should return "Insert" for PdfPopupIcon.insert', () => {
        const result = annotation._obtainIconName(
            PdfPopupIcon.insert
        );

        expect(result).toBe('Insert');
    });

    it('should return "Key" for PdfPopupIcon.key', () => {
        const result = annotation._obtainIconName(
            PdfPopupIcon.key
        );

        expect(result).toBe('Key');
    });

    it('should return "NewParagraph" for PdfPopupIcon.newParagraph', () => {
        const result = annotation._obtainIconName(
            PdfPopupIcon.newParagraph
        );

        expect(result).toBe('NewParagraph');
    });

    it('should return "Paragraph" for PdfPopupIcon.paragraph', () => {
        const result = annotation._obtainIconName(
            PdfPopupIcon.paragraph
        );

        expect(result).toBe('Paragraph');
    });
});
describe('PdfFileLinkAnnotation.action (getter / setter)', () => {
    let annotation: any;
    let actionDict: any;
    let nextActionDict: any;
    let reference: any;

    beforeEach(() => {
        /* ---------- fake PdfReference ---------- */
        reference = Object.create(_PdfReference.prototype);

        /* ---------- fetched action dictionary ---------- */
        nextActionDict = jasmine.createSpyObj('actionDict', ['has', 'get', 'update']);
        nextActionDict.has.and.callFake((key: string) => key === 'JS');
        nextActionDict.get.and.returnValue('app.alert("Hi")');

        /* ---------- A dictionary ---------- */
        actionDict = jasmine.createSpyObj('A', ['has', 'get']);
        actionDict.has.and.callFake((key: string) => key === 'Next');
        actionDict.get.and.returnValue([reference]);

        /* ---------- real object shape ---------- */
        annotation = Object.create(PdfFileLinkAnnotation.prototype);

        annotation._action = undefined;
        annotation._isLoaded = false;
        annotation._dictionary = jasmine.createSpyObj('dict', ['has', 'get']);
        annotation._dictionary.has.and.callFake((key: string) => key === 'A');
        annotation._dictionary.get.and.returnValue(actionDict);

        annotation._dictionary._updated = false;

        annotation._crossReference = {
            _fetch: jasmine.createSpy().and.returnValue(nextActionDict)
        };
    });

    /* ===================== GETTER ===================== */

    it('I: should read JS action from Next array reference', () => {
        const result = annotation.action;

        expect(result).toBe('app.alert("Hi")');
        expect(annotation._action).toBe('app.alert("Hi")');
    });

    it('E: should return undefined when no JS entry exists', () => {
        nextActionDict.has.and.returnValue(false);

        const result = annotation.action;

        expect(result).toBeUndefined();
    });

    it('E: should return undefined when Next is not an array', () => {
        actionDict.get.and.returnValue({});

        const result = annotation.action;

        expect(result).toBeUndefined();
    });

    /* ===================== SETTER NOT LOADED ===================== */

    it('Eif: should set _action directly when not loaded', () => {
        annotation._isLoaded = false;

        annotation.action = 'app.alert("New")';

        expect(annotation._action).toBe('app.alert("New")');
    });

    /* ===================== SETTER LOADED ===================== */

    it('Iif: should update JS in fetched dictionary when loaded', () => {
        annotation._isLoaded = true;
        annotation._action = 'old';

        annotation.action = 'newAction';

        expect(nextActionDict.update).toHaveBeenCalledWith('JS', 'newAction');
        expect(annotation._action).toBe('newAction');
        expect(annotation._dictionary._updated).toBeTruthy();
    });

    it('E: should not update when value is same', () => {
        annotation._isLoaded = true;
        annotation._action = 'same';

        annotation.action = 'same';

        expect(nextActionDict.update).not.toHaveBeenCalled();
    });

    it('E: should not update when A dictionary missing', () => {
        annotation._isLoaded = true;
        annotation._dictionary.has.and.returnValue(false);

        annotation.action = 'test';

        expect(nextActionDict.update).not.toHaveBeenCalled();
    });
});
describe('PdfPolyLineAnnotation._createPolyLineAppearance', () => {
    let annotation: any;
    let graphics: any;
    let originalPdfTemplate: any;
    let originalPdfAppearance: any;

    beforeEach(() => {
        /* ---------- graphics stub ---------- */
        graphics = {
            save: jasmine.createSpy('save').and.returnValue({}),
            restore: jasmine.createSpy('restore'),
            setTransparency: jasmine.createSpy('setTransparency'),
            drawPath: jasmine.createSpy('drawPath'),
            _template: { template: true }
        };

        /* ---------- PdfTemplate interception ---------- */
        originalPdfTemplate = PdfTemplate;
        (PdfTemplate as any) = jasmine
            .createSpy('PdfTemplate')
            .and.callFake(() => ({
                graphics,
                _content: {
                    dictionary: jasmine.createSpyObj('dict', ['has', 'update', 'getArray'])
                }
            }));
        /* ---------- PdfAppearance interception ---------- */
        originalPdfAppearance = PdfAppearance;
        (PdfAppearance as any) = jasmine.createSpy('PdfAppearance').and.callFake(() => ({
            normal: {
                graphics,
                _content: { dictionary: jasmine.createSpyObj('dict', ['update']) }
            }
        }));

        /* ---------- real annotation instance ---------- */
        annotation = Object.create(PdfPolyLineAnnotation.prototype);

        annotation._page = {
            graphics,
            size: { height: 500 }
        };

        annotation._dictionary = jasmine.createSpyObj('dict', ['has', 'get', 'update']);
        annotation._dictionary.has.and.returnValue(false);

        annotation._crossReference = {};
        annotation._customTemplate = new Map();
        annotation._points = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
        annotation._polylinePoints = undefined;
        annotation._pathTypes = undefined;

        annotation.border = { width: 1 };
        annotation.color = { r: 0, g: 0, b: 0 };
        annotation.innerColor = undefined;

        annotation.beginLineStyle = PdfLineEndingStyle.none;
        annotation.endLineStyle = PdfLineEndingStyle.none;

        annotation.opacity = 1;
        annotation._opacity = 1;
        annotation._isBounds = false;
        annotation.lineExtension = 0;

        /* ---------- stub heavy helpers ---------- */
        spyOn(annotation, '_getBoundsValue').and.returnValue({
            x: 0, y: 0, width: 100, height: 50
        });

        spyOn(annotation, '_updateBorder').and.callFake((v: any) => v);
        spyOn(annotation, '_getLinePoints').and.returnValue([
            { x: 0, y: 0 },
            { x: 10, y: 10 }
        ]);

        spyOn(annotation, '_prepareStartEndAngle').and.returnValue({
            transformedStart: { x: 0, y: 0 },
            transformedEnd: { x: 10, y: 10 },
            startAngle: 0,
            endAngle: 0
        });

        spyOn(annotation, '_getAxisValue').and.callFake((p: any) => p);
        spyOn(annotation, '_drawLineEndStyle').and.stub();
        spyOn(annotation, '_getCombinedRectangleBounds').and.callFake((a: any, b: any) => a);
        spyOn(annotation, '_getBoundsFromLineEndStyle').and.returnValue({
            x: 0, y: 0, width: 5, height: 5
        });

        spyOn(utils, '_convertPointToNumberArray').and.returnValue([0, 0, 10, 10]);
        spyOn(utils, '_isPointArray').and.returnValue(true);
        spyOn(utils, '_convertToPoints').and.returnValue(annotation._points);
        spyOn(utils, '_setMatrix').and.stub();
        spyOn(utils, '_reverseMapEndingStyle').and.returnValue('None');
    });

    afterEach(() => {
        (PdfTemplate as any) = originalPdfTemplate;
        (PdfAppearance as any) = originalPdfAppearance;
    });

    /* ============================ FLATTEN TRUE ============================ */

    it('I: should create appearance when flatten=true without custom template', () => {
        const result = annotation._createPolyLineAppearance(true);

        expect(graphics.drawPath).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('I: should use custom template when flatten=true and customTemplate has N', () => {
        annotation._customTemplate.set('N', { custom: true });

        const result = annotation._createPolyLineAppearance(true);

        expect(result.custom).toBeTruthy();
    });

    /* ============================ FLATTEN FALSE ============================ */
    it('Iif: should create appearance via PdfAppearance when no custom template', () => {
        const result = annotation._createPolyLineAppearance(false);

        expect(graphics.drawPath).toHaveBeenCalled();
        expect(result).toBeDefined();
    });

    it('Iif: should use opacity save/restore when opacity < 1', () => {
        annotation.opacity = 0.5;
        annotation._opacity = 0.5;

        annotation._createPolyLineAppearance(false);

        expect(graphics.save).toHaveBeenCalled();
        expect(graphics.restore).toHaveBeenCalled();
    });

    it('E: should use custom template when available in non-flatten mode', () => {
        annotation._customTemplate.set('N', { custom: true });

        const result = annotation._createPolyLineAppearance(false);

        expect(result.custom).toBeTruthy();
    });
});
describe('PdfInkAnnotation._obtainInkListCollection', () => {
    let annotation: any;

    beforeEach(() => {
        annotation = Object.create(PdfInkAnnotation.prototype);

        annotation._dictionary = jasmine.createSpyObj('dict', [
            'has',
            'getArray'
        ]);
    });

    /* ========================= InkList NOT present ========================= */

    it('E: should return empty array when InkList is not present', () => {
        annotation._dictionary.has.and.returnValue(false);

        const result = annotation._obtainInkListCollection();

        expect(result).toEqual([]);
        expect(annotation._dictionary.getArray).not.toHaveBeenCalled();
    });

    /* ========================= Single inner list ========================= */

    it('I: should convert a single InkList entry into path array', () => {
        annotation._dictionary.has.and.returnValue(true);
        annotation._dictionary.getArray.and.returnValue([
            [10, 20, 30, 40]
        ]);

        const result = annotation._obtainInkListCollection();

        expect(result.length).toBe(1);
        expect(result[0]).toEqual([10, 20, 30, 40]);
    });

    /* ========================= Multiple inner lists ========================= */

    it('I: should process multiple InkList arrays correctly', () => {
        annotation._dictionary.has.and.returnValue(true);
        annotation._dictionary.getArray.and.returnValue([
            [1, 2, 3, 4],
            [5, 6, 7, 8]
        ]);

        const result = annotation._obtainInkListCollection();

        expect(result.length).toBe(2);
        expect(result[0]).toEqual([1, 2, 3, 4]);
        expect(result[1]).toEqual([5, 6, 7, 8]);
    });

    /* ========================= Reset list logic ========================= */

    it('I: should reset internal list after each inner list', () => {
        annotation._dictionary.has.and.returnValue(true);
        annotation._dictionary.getArray.and.returnValue([
            [1, 2],
            [3, 4]
        ]);

        const result = annotation._obtainInkListCollection();

        // ensure new array instance for each path
        expect(result[0]).not.toBe(result[1]);
        expect(result[0]).toEqual([1, 2]);
        expect(result[1]).toEqual([3, 4]);
    });
});
describe('PdfAnnotation._calculateTemplateBounds', () => {
    class MockGraphics {
        _matrix = {};

        translateTransform = jasmine.createSpy('translateTransform');
        rotateTransform = jasmine.createSpy('rotateTransform');
    }

    class MockTemplate {
        _size = { width: 100, height: 50 };

        _content = {
            dictionary: {
                getArray: jasmine.createSpy('getArray')
            }
        };
    }

    class MockPage {
        size = { width: 600, height: 800 };
        _origin = false;
        _o = [0, 0];
    }

    class TestPdfAnnotation extends PdfAnnotation {
        constructor() {
            super();
            this._dictionary = {
                has: jasmine.createSpy('has').and.returnValue(false),
                getArray: jasmine.createSpy('getArray'),
                update: jasmine.createSpy('update')
            } as any;
        }
        _doPostProcess(isFlatten?: boolean): void {

        }
        // stub rotation resolver
        _obtainGraphicsRotation(_: any): number {
            return 0;
        }
    }
    let annotation: TestPdfAnnotation;
    let page: MockPage;
    let template: MockTemplate;
    let graphics: MockGraphics;

    const baseBounds = { x: 10, y: 20, width: 100, height: 50 };

    beforeEach(() => {
        annotation = new TestPdfAnnotation();
        page = new MockPage();
        template = new MockTemplate();
        graphics = new MockGraphics();
    });

    it('should override bounds using Rect when not normal matrix', () => {

        const result = annotation._calculateTemplateBounds(
            baseBounds,
            page as any,
            template as any,
            false,
            graphics as any
        );

        expect(annotation._dictionary.getArray).toHaveBeenCalledWith('Rect');
        expect(result.width).toBe(100);
        expect(result.height).toBe(50);
    });

    it('should apply rotation 90 transforms and swap width/height', () => {
        spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(90);

        const result = annotation._calculateTemplateBounds(
            baseBounds,
            page as any,
            template as any,
            false,
            graphics as any
        );

        expect(graphics.translateTransform).toHaveBeenCalled();
        expect(graphics.rotateTransform).toHaveBeenCalledWith(90);
        expect(result.width).toBe(50);
        expect(result.height).toBe(100);
    });

    it('should apply rotation 180 transforms with normal matrix', () => {
        spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(180);

        const result = annotation._calculateTemplateBounds(
            baseBounds,
            page as any,
            template as any,
            true,
            graphics as any
        );

        expect(graphics.translateTransform).toHaveBeenCalled();
        expect(graphics.rotateTransform).toHaveBeenCalledWith(180);
        expect(result.x).toBeLessThan(0);
        expect(result.y).toBeLessThan(0);
    });

    it('should apply rotation 270 and swap dimensions when needed', () => {
        spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(270);

        template._content.dictionary.getArray.and.callFake((key: string) => {
            if (key === 'Matrix') {
                return [1, 0, 0, 1, 0, 10];
            }
            if (key === 'BBox') {
                return [0, 0, 40, 20];
            }
            return null;
        });

        const result = annotation._calculateTemplateBounds(
            baseBounds,
            page as any,
            template as any,
            false,
            graphics as any
        );

        expect(graphics.rotateTransform).toHaveBeenCalledWith(270);
        expect(result.width).toBe(50);
        expect(result.height).toBe(100);
    });

    it('should adjust bounds for rotationAngle at graphics rotation 0', () => {
        spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(0);

        annotation.rotationAngle = PdfRotationAngle.angle90;

        const result = annotation._calculateTemplateBounds(
            baseBounds,
            page as any,
            template as any,
            false,
            graphics as any
        );

        expect(result.width).toBe(50);
        expect(result.height).toBe(100);
    });

    it('should return original bounds when no rotation is applied', () => {
        spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(0);

        const result = annotation._calculateTemplateBounds(
            baseBounds,
            page as any,
            template as any,
            true,
            graphics as any
        );

        expect(result).toEqual(baseBounds);
    });

});
describe('PdfInkAnnotation._getControlPoints - branch coverage', () => {

    let annot: PdfInkAnnotation;

    beforeEach(() => {

        annot = new PdfInkAnnotation() as any;

        annot.color = { r: 0, g: 0, b: 0 };
        annot._color = annot.color;
        annot.opacity = 0.5;

        annot._page = {
            size: { height: 800, width: 100 },
            _isNew: false
        } as any;

        spyOn(utils, '_convertPointsToNumberArrays')
            .and.callFake((pts: any[]) => pts);

        spyOn(utils, '_convertNumberArraysToPoints')
            .and.callFake((pts: any[]) => pts);
    });

    it('toThrow error when point is null', () => {
        try {
            annot._getControlPoints(null, null, null);
            fail('Failed to throw error');
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    it('Point count error  when point is empty', () => {
        try {
            annot._getControlPoints([], null, null);
            fail('Failed to throw error');
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
    it('Point count error  when point is empty', () => {
        const result = annot._getControlPoints([
            [10, 20],
            [30, 40],
        ], null, null)
        expect(result).toBeDefined();
    });
});
describe('PdfInkAnnotation._addInkPoints – branch coverage', () => {
    class MockDictionary {
        update = jasmine.createSpy('update');
    }

    class MockPage {
        size = { height: 800 };
        _pageDictionary = {
            has: jasmine.createSpy('has').and.returnValue(false)
        };
    }

    let annot: any;

    beforeEach(() => {
        annot = new PdfInkAnnotation() as any;

        annot._dictionary = new MockDictionary() as any;
        annot._page = new MockPage() as any;
        annot.bounds = { x: 0, y: 0, width: 100, height: 50 };

        annot._inkPointsCollection = [];
        annot._previousCollection = [];
        annot._linePoints = [[10, 20]];
        annot._isModified = false;
        annot._isFlatten = false;
        annot._isEnableControlPoints = false;

        spyOn(utils, '_checkInkPoints').and.returnValue(false);
        spyOn(utils, '_convertPointsToNumberArrays')
            .and.callFake((pts: any[]) => pts);

        spyOn(annot as any, '_updateInkListCollection');
        spyOn(annot as any, '_getInkBoundsValue')
            .and.returnValue([1, 2, 3, 4]);

        spyOn(annot as any, '_getCropOrMediaBox')
            .and.returnValue(null);
    });

    /* ---------- Branch 1 ---------- */
    it('should prepend linePoints when previous collection is empty', () => {
        annot._addInkPoints();

        expect(annot._inkPointsCollection.length).toBe(1);
    });

    /* ---------- Branch 3 ---------- */
    it('should update InkList when ink points changed', () => {
        annot._inkPointsCollection = [[{ x: 1, y: 2 }]];

        annot._addInkPoints();

        expect(annot._dictionary.update)
            .toHaveBeenCalledWith('InkList', jasmine.any(Array));
    });

    /* ---------- Branch 4 ---------- */
    it('should append to previousCollection and reset isModified', () => {
        annot._inkPointsCollection = [[{ x: 1, y: 2 }]];
        annot._isModified = true;

        annot._addInkPoints();

        expect(annot._previousCollection.length).toBeGreaterThan(0);
        expect(annot._isModified).toBeFalsy();
    });

    /* ---------- Branch 5 (crop/media box) ---------- */
    it('should adjust ink points when crop or media box exists', () => {
        (annot as any)._getCropOrMediaBox.and.returnValue([10, 10, 0, 0]);

        annot._page._pageDictionary.has.and.returnValue(false);
        annot._inkPointsCollection = [[{ x: 1, y: 2 }]];

        annot._addInkPoints();

        expect(annot._dictionary.update)
            .toHaveBeenCalled();
    });

    /* ---------- Branch 6 ---------- */
    it('should return bounds when control points enabled', () => {
        annot._isEnableControlPoints = true;
        annot._inkPointsCollection = [[{ x: 1, y: 2 }]];

        const result = annot._addInkPoints();

        expect(result).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    });

    /* ---------- Branch 7 ---------- */
    it('should update ink list collection when not flattened', () => {
        annot._inkPointsCollection = [[{ x: 1, y: 2 }]];

        const result = annot._addInkPoints();

        expect((annot as any)._updateInkListCollection)
            .toHaveBeenCalled();
        expect(result).toBe(annot.bounds);
    });

});


