import { PdfAngleMeasurementAnnotation, PdfAnnotationBorder, PdfAnnotationLineEndingStyle, PdfBorderEffect, PdfLineAnnotation, PdfPolygonAnnotation, PdfPolyLineAnnotation, PdfPopupAnnotation, PdfRectangleAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfBorderEffectStyle, PdfBorderStyle, PdfLineCaptionType, PdfLineEndingStyle, PdfMeasurementUnit, PdfPopupIcon } from '../src/pdf/core/enumerator';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { PdfColor } from '../src/pdf/core/pdf-type';

describe('PDF annotation uncovered branches', () => {
    function getIntersectionPoint(normalizedAngle: number): number[] {
        const radians: number = normalizedAngle <= 180
            ? (-normalizedAngle * Math.PI) / 180
            : ((360 - normalizedAngle) * Math.PI) / 180;
        return [Math.cos(radians), Math.sin(radians)];
    }

    function runAngleBranchCase(
        startNormalizedAngle: number,
        sweepNormalizedAngle: number,
        expectedStartAngle: number,
        expectedSweepAngle: number,
        useLoadedVertices: boolean = false
    ): void {
        // Arrange
        const annotation: PdfAngleMeasurementAnnotation = new PdfAngleMeasurementAnnotation(
            { x: 10, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 10 }
        );
        const vertices: number[] = [10, 0, 0, 0, 0, 10];

        if (useLoadedVertices) {
            annotation['_isLoaded'] = true;
            annotation['_linePoints'] = [];
            annotation['_dictionary'].update('Vertices', vertices);
        } else {
            annotation['_linePoints'] = vertices;
        }

        annotation['_firstIntersectionPoint'] = [0, 0];
        annotation['_secondIntersectionPoint'] = [0, 0];

        let index: number = 0;
        spyOn(annotation , '_findLineCircleIntersectionPoints').and.callFake((): { first: number[]; second: number[] } => {
            const value: number[] = index++ === 0
                ? getIntersectionPoint(startNormalizedAngle)
                : getIntersectionPoint(sweepNormalizedAngle);
            return { first: [Number.NaN, Number.NaN], second: value };
        });

        // Act
        const result: number = annotation['_calculateAngle']();

        // Assert
        expect(result).toBeDefined();
        expect(annotation['_startAngle']).toBeCloseTo(expectedStartAngle, 6);
        expect(annotation['_sweepAngle']).toBeCloseTo(expectedSweepAngle, 6);
    }

    describe('PdfPopupAnnotation._createPopupAppearance', () => {
        it('should cover opacity, color and all popup icon branches', () => {
            // Arrange
            const bounds: { x: number; y: number; width: number; height: number } = { x: 10, y: 10, width: 24, height: 24 };
            const color: PdfColor = { r: 255, g: 0, b: 0 };
            const icons: PdfPopupIcon[] = [
                PdfPopupIcon.comment,
                PdfPopupIcon.paragraph,
                PdfPopupIcon.help,
                PdfPopupIcon.note,
                PdfPopupIcon.insert,
                PdfPopupIcon.key,
                PdfPopupIcon.newParagraph
            ];

            // Act
            for (const icon of icons) {
                const annotation: PdfPopupAnnotation = new PdfPopupAnnotation('popup', bounds, {
                    color: color,
                    icon: icon,
                    open: true
                });
                annotation.opacity = 0.5;
                const template = annotation['_createPopupAppearance']();

                // Assert
                expect(template).toBeDefined();
                expect(template.graphics).toBeDefined();
            }
        });
    });

    describe('PdfAngleMeasurementAnnotation._calculateAngle', () => {
        it('should cover loaded vertices path and all highlighted angle branches', () => {
            // Arrange / Act / Assert
            runAngleBranchCase(180, 0, 180, 180, true);
            runAngleBranchCase(0, 180, 180, 180);
            runAngleBranchCase(100, 20, 20, 80);
            runAngleBranchCase(10, 250, 250, 120);
            runAngleBranchCase(30, 100, 30, 70);
            runAngleBranchCase(200, 250, 200, 50);
            runAngleBranchCase(300, 50, 300, 110);
            runAngleBranchCase(250, 200, 200, 50);
        });
    });

    describe('PdfPolyLineAnnotation._createPolyLineAppearance', () => {
        let document: PdfDocument;
        let page: PdfPage;

        beforeEach(() => {
            // Arrange
            document = new PdfDocument();
            page = document.addPage() as PdfPage;
        });

        afterEach(() => {
            document.destroy();
        });

        it('should cover flatten true branch with opacity, innerColor, begin and end arrow styles', () => {
            // Arrange
            const annotation: PdfPolyLineAnnotation = new PdfPolyLineAnnotation(
                [{ x: 100, y: 300 }, { x: 180, y: 250 }, { x: 300, y: 260 }],
                {
                    color: { r: 255, g: 0, b: 0 },
                    innerColor: { r: 0, g: 255, b: 0 },
                    opacity: 0.5,
                    lineEndingStyle: new PdfAnnotationLineEndingStyle({
                        begin: PdfLineEndingStyle.closedArrow,
                        end: PdfLineEndingStyle.openArrow
                    }),
                    border: new PdfAnnotationBorder({
                        width: 2,
                        hRadius: 0,
                        vRadius: 0,
                        style: PdfBorderStyle.solid
                    })
                }
            );
            page.annotations.add(annotation);

            const transparencySpy: jasmine.Spy = spyOn(page.graphics, 'setTransparency').and.callThrough();
            const restoreSpy: jasmine.Spy = spyOn(page.graphics, 'restore').and.callThrough();
            const drawLineEndSpy: jasmine.Spy = spyOn(annotation, '_drawLineEndStyle').and.callThrough();

            // Act
            const template = annotation['_createPolyLineAppearance'](true);

            // Assert
            expect(template).toBeUndefined();
            expect(transparencySpy).toHaveBeenCalledWith(0.5);
            expect(drawLineEndSpy).toHaveBeenCalledTimes(2);
            expect(restoreSpy).toHaveBeenCalled();
        });

        it('should cover non flatten vertices branch and create backBrush from innerColor', () => {
            // Arrange
            const annotation: PdfPolyLineAnnotation = new PdfPolyLineAnnotation(
                [{ x: 1, y: 1 }, { x: 2, y: 2 }],
                {
                    color: { r: 0, g: 0, b: 255 },
                    innerColor: { r: 255, g: 255, b: 0 },
                    border: new PdfAnnotationBorder({
                        width: 1,
                        hRadius: 0,
                        vRadius: 0,
                        style: PdfBorderStyle.solid
                    })
                }
            );
            page.annotations.add(annotation);
            annotation['_points'] = [];
            annotation['_isBounds'] = false;
            annotation['_dictionary'].update('Vertices', [100, 300, 180, 250, 300, 260, 360, 320]);

            // Act
            const template = annotation['_createPolyLineAppearance'](false);

            // Assert
            expect(template).toBeDefined();
            expect(annotation['_points'].length).toBe(4);
            expect(annotation['_dictionary'].has('Rect')).toBeTruthy();
        });
    });
});

describe('PdfLineAnnotation measure appearance coverage', () => {

    function createMeasureLine(page: PdfPage, document: PdfDocument): PdfLineAnnotation {
        const annotation: PdfLineAnnotation = new PdfLineAnnotation() as PdfLineAnnotation;
        const line: any = annotation as any;

        line._page = page;
        line._crossReference = (document as any)._crossReference;
        line._isLoaded = false;
        line._isBounds = false;
        line._measure = true;
        line._unitString = 'in';
        line._text = 'Distance';
        line._linePoints = [{ x: 10, y: 20 }, { x: 110, y: 20 }];
        line._bounds = { x: 0, y: 0, width: 0, height: 0 };

        annotation.color = { r: 255, g: 0, b: 0 } as PdfColor;
        annotation.innerColor = { r: 0, g: 255, b: 0 } as PdfColor;
        annotation.opacity = 0.5;
        annotation.border = new PdfAnnotationBorder({
            width: 2,
            hRadius: 0,
            vRadius: 0,
            style: PdfBorderStyle.solid
        });

        annotation.lineEndingStyle = new PdfAnnotationLineEndingStyle({
            begin: PdfLineEndingStyle.none,
            end: PdfLineEndingStyle.none
        });

        annotation.caption.type = PdfLineCaptionType.inline;
        annotation.caption.cap = false;
        annotation.leaderLine = 6;
        annotation.leaderExt = 2;
        annotation.leaderOffset = 1;

        return annotation;
    }

    describe('_createLineMeasureAppearance', () => {

        it('should use the custom template branch and update Rect / bounds', () => {
            // Arrange
            const document: PdfDocument = new PdfDocument();
            const page: PdfPage = document.addPage() as PdfPage;
            const annotation: PdfLineAnnotation = createMeasureLine(page, document);
            const line: any = annotation as any;

            const customTemplate: PdfTemplate = new PdfTemplate([5, 6, 40, 10], line._crossReference);
            line._customTemplate.set('N', customTemplate);

            spyOn(line, '_convertToUnit').and.returnValue(12.34);
            spyOn(line, '_obtainLinePoints').and.returnValue([{ x: 10, y: 20 }, { x: 110, y: 20 }]);
            spyOn(line, '_obtainLineBounds').and.returnValue([5, 6, 40, 10]);

            // Act
            const template: PdfTemplate = line._createLineMeasureAppearance(false);

            // Assert
            expect(template).toBe(customTemplate);
            expect(line._dictionary.getArray('Rect')).toEqual([5, 6, 45, 16]);
            expect(line._bounds).toEqual({ x: 5, y: 6, width: 45, height: 16 });

            document.destroy();
        });

        it('should cover dot border, negative leader line, opacity, arrow endings and inline caption path', () => {
            // Arrange
            const document: PdfDocument = new PdfDocument();
            const page: PdfPage = document.addPage() as PdfPage;
            const annotation: PdfLineAnnotation = createMeasureLine(page, document);
            const line: any = annotation as any;

            annotation.border = new PdfAnnotationBorder({
                width: 2,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.dot
            });

            annotation.lineEndingStyle = new PdfAnnotationLineEndingStyle({
                begin: PdfLineEndingStyle.openArrow,
                end: PdfLineEndingStyle.closedArrow
            });

            annotation.caption.type = PdfLineCaptionType.inline;
            annotation.caption.cap = false;
            annotation.leaderLine = -8;
            annotation.leaderExt = 3;
            annotation.leaderOffset = 2;
            annotation.opacity = 0.5;

            line._linePoints = [{ x: 10, y: 20 }, { x: 90, y: 20 }];
            line._customTemplate.clear();

            spyOn(line, '_convertToUnit').and.returnValue(8.5);
            spyOn(line, '_obtainLinePoints').and.returnValue([{ x: 10, y: 20 }, { x: 90, y: 20 }]);
            spyOn(line, '_obtainLineBounds').and.returnValue([0, 0, 120, 40]);
            spyOn(line, '_obtainFont').and.returnValue(line._lineCaptionFont);
            spyOn(line, '_drawLineStyle').and.stub();

            // Act
            const template: PdfTemplate = line._createLineMeasureAppearance(false);

            // Assert
            expect(template).toBeDefined();
            expect(line._dictionary.has('AP')).toBeTruthy();
            expect(line._dictionary.has('Measure')).toBeTruthy();
            expect(line._dictionary.has('DS')).toBeTruthy();
            expect(line._dictionary.has('LE')).toBeTruthy();
            expect(line._dictionary.has('L')).toBeTruthy();
            expect(line._dictionary.has('C')).toBeTruthy();
            expect(line._dictionary.has('Subtype')).toBeTruthy();
            expect(line._dictionary.has('IT')).toBeTruthy();
            expect(line._dictionary.has('LLE')).toBeTruthy();
            expect(line._dictionary.has('LLO')).toBeTruthy();
            expect(line._dictionary.has('LL')).toBeTruthy();
            expect(line._dictionary.has('CP')).toBeTruthy();
            expect(line._dictionary.has('Cap')).toBeTruthy();
            expect(line._dictionary.get('Contents')).toContain('8.50 in');

            document.destroy();
        });

        it('should cover dashed border and top caption branch without throwing', () => {
            // Arrange
            const document: PdfDocument = new PdfDocument();
            const page: PdfPage = document.addPage() as PdfPage;
            const annotation: PdfLineAnnotation = createMeasureLine(page, document);
            const line: any = annotation as any;

            annotation.border = new PdfAnnotationBorder({
                width: 1,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.dashed
            });

            annotation.lineEndingStyle = new PdfAnnotationLineEndingStyle({
                begin: PdfLineEndingStyle.none,
                end: PdfLineEndingStyle.none
            });

            annotation.caption.type = PdfLineCaptionType.top;
            annotation.caption.cap = true;
            annotation.leaderLine = 5;
            annotation.leaderExt = 2;
            annotation.leaderOffset = 0;
            annotation.opacity = 0.5;

            line._linePoints = [{ x: 15, y: 25 }, { x: 95, y: 25 }];
            line._customTemplate.clear();

            spyOn(line, '_convertToUnit').and.returnValue(10);
            spyOn(line, '_obtainLinePoints').and.returnValue([{ x: 15, y: 25 }, { x: 95, y: 25 }]);
            spyOn(line, '_obtainLineBounds').and.returnValue([0, 0, 100, 30]);
            spyOn(line, '_obtainFont').and.returnValue(line._lineCaptionFont);
            spyOn(line, '_drawLineStyle').and.stub();

            // Act
            const template: PdfTemplate = line._createLineMeasureAppearance(false);

            // Assert
            expect(template).toBeDefined();
            expect(line._dictionary.has('AP')).toBeTruthy();
            expect(line._dictionary.has('Measure')).toBeTruthy();
            expect(line._dictionary.get('Contents')).toContain('10.00 in');

            document.destroy();
        });
    });
});


describe('Annotation highlighted branch coverage', () => {

    function createDocumentAndPage(): { document: PdfDocument; page: PdfPage } {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage() as PdfPage;
        return { document, page };
    }

    function setCrossRefAndPage(annotation: any, document: PdfDocument, page: PdfPage): void {
        annotation._crossReference = (document as any)._crossReference;
        annotation._page = page;
    }

    function getAnglePoint(normalizedAngle: number): number[] {
        const radians: number = normalizedAngle <= 180
            ? (-normalizedAngle * Math.PI) / 180
            : ((360 - normalizedAngle) * Math.PI) / 180;
        return [Math.cos(radians), Math.sin(radians)];
    }

    function runAngleBranchCase(
        startNormalizedAngle: number,
        sweepNormalizedAngle: number,
        expectedStartAngle: number,
        expectedSweepAngle: number,
        useLoadedVertices: boolean = false
    ): void {
        // Arrange
        const annotation: PdfAngleMeasurementAnnotation = new PdfAngleMeasurementAnnotation(
            { x: 10, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 10 }
        );
        const annot: any = annotation;
        const vertices: number[] = [10, 0, 0, 0, 0, 10];

        if (useLoadedVertices) {
            annot._isLoaded = true;
            annot._linePoints = [];
            annot._dictionary.update('Vertices', vertices);
        } else {
            annot._linePoints = vertices;
        }

        annot._firstIntersectionPoint = [0, 0];
        annot._secondIntersectionPoint = [0, 0];

        let callIndex: number = 0;
        spyOn<any>(annot, '_findLineCircleIntersectionPoints').and.callFake(() => {
            const point: number[] = callIndex++ === 0
                ? getAnglePoint(startNormalizedAngle)
                : getAnglePoint(sweepNormalizedAngle);
            return { first: [Number.NaN, Number.NaN], second: point };
        });

        // Act
        const value: number = annot._calculateAngle();

        // Assert
        expect(typeof value).toBe('number');
        expect(annot._startAngle).toBeCloseTo(expectedStartAngle, 6);
        expect(annot._sweepAngle).toBeCloseTo(expectedSweepAngle, 6);
    }

    describe('Shared annotation helper methods', () => {

        it('should cover transform helpers, min/max helpers, drawTemplate import branches, and drawCustomAppearance', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation({ x: 10, y: 20, width: 30, height: 40 });
            const annot: any = annotation;
            setCrossRefAndPage(annot, document, page);

            const transformedPoint: number[] = annot._transformPoint(2, 3, [2, 0, 0, 3, 5, 7]);
            const appliedPoint: number[] = annot._applyTransform([2, 3], [2, 0, 0, 3, 5, 7]);
            const bbox: number[] = annot._getAxialAlignedBoundingBox([0, 0, 10, 20], [1, 0, 0, 1, 5, 6]);
            const transformedBox: number[] = annot._transformBBox({ x: 0, y: 0, width: 10, height: 20 }, [1, 0, 0, 1, 5, 6]);
            const transformMatrix1: number[] = annot._getTransformMatrix([0, 0, 10, 20], [5, 5, 5, 10], [1, 0, 0, 1, 0, 0]); // zero-width bbox branch
            const transformMatrix2: number[] = annot._getTransformMatrix([0, 0, 20, 40], [0, 0, 10, 20], [1, 0, 0, 1, 0, 0]); // ratio branch

            const template1: PdfTemplate = new PdfTemplate([0, 0, 10, 10], annot._crossReference);
            const template2: PdfTemplate = new PdfTemplate([0, 0, 12, 12], annot._crossReference);

            (template1 as any)._isExported = true;
            (template1 as any)._isResourceExport = false;
            (template2 as any)._isExported = false;
            (template2 as any)._isResourceExport = true;

            const importSpy1: jasmine.Spy = spyOn<any>(template1, '_importStream').and.stub();
            const importSpy2: jasmine.Spy = spyOn<any>(template2, '_importStream').and.stub();

            const appearance: any = annot._dictionary;

            // Act
            annot._drawTemplate(template1, 'N');
            annot._drawTemplate(template2, 'R');
            annot._drawCustomAppearance(appearance);

            // Assert
            expect(transformedPoint).toEqual([9, 16]);
            expect(appliedPoint).toEqual([9, 16]);
            expect(bbox).toEqual([5, 6, 15, 26]);
            expect(transformedBox).toEqual([5, 6, 15, 26]);
            expect(transformMatrix1).toEqual([1, 0, 0, 1, 0, 0]);
            expect(transformMatrix2[0]).toBeCloseTo(2, 6);
            expect(transformMatrix2[3]).toBeCloseTo(2, 6);
            expect(annot._minValue([5, 2, 9, 1])).toBe(1);
            expect(annot._maxValue([5, 2, 9, 1])).toBe(9);

            expect(importSpy1).toHaveBeenCalled();
            expect(importSpy2).toHaveBeenCalled();
            expect(annot._customTemplate.has('N')).toBeTruthy();
            expect(annot._customTemplate.has('R')).toBeTruthy();
            expect(appearance.has('N') || appearance.has('R')).toBeTruthy();

            document.destroy();
        });
    });

    describe('PdfPopupAnnotation._createPopupAppearance', () => {
        it('should cover opacity, color and all popup icon branches', () => {
            // Arrange
            const bounds = { x: 10, y: 10, width: 24, height: 24 };
            const color: PdfColor = { r: 255, g: 0, b: 0 };
            const icons: PdfPopupIcon[] = [
                PdfPopupIcon.comment,
                PdfPopupIcon.paragraph,
                PdfPopupIcon.help,
                PdfPopupIcon.note,
                PdfPopupIcon.insert,
                PdfPopupIcon.key,
                PdfPopupIcon.newParagraph
            ];

            // Act / Assert
            icons.forEach((icon: PdfPopupIcon) => {
                const annotation: PdfPopupAnnotation = new PdfPopupAnnotation('popup', bounds, {
                    color: color,
                    icon: icon,
                    open: true
                });
                annotation.opacity = 0.5;
                const template: PdfTemplate = (annotation as any)._createPopupAppearance();
                expect(template).toBeDefined();
                expect((template as any).graphics).toBeDefined();
            });
        });
    });

    describe('PdfAngleMeasurementAnnotation._calculateAngle', () => {
        it('should cover loaded vertices path and all highlighted angle branches', () => {
            // Arrange / Act / Assert
            runAngleBranchCase(180, 0, 180, 180, true);
            runAngleBranchCase(0, 180, 180, 180);
            runAngleBranchCase(100, 20, 20, 80);
            runAngleBranchCase(10, 250, 250, 120);
            runAngleBranchCase(200, 250, 200, 50);
            runAngleBranchCase(300, 50, 300, 110);
        });
    });

    describe('PdfPolyLineAnnotation._createPolyLineAppearance', () => {
        it('should cover flatten true branch with opacity, innerColor and arrow endings', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfPolyLineAnnotation = new PdfPolyLineAnnotation(
                [{ x: 100, y: 300 }, { x: 180, y: 250 }, { x: 300, y: 260 }],
                {
                    color: { r: 255, g: 0, b: 0 },
                    innerColor: { r: 0, g: 255, b: 0 },
                    opacity: 0.5,
                    lineEndingStyle: new PdfAnnotationLineEndingStyle({
                        begin: PdfLineEndingStyle.closedArrow,
                        end: PdfLineEndingStyle.openArrow
                    }),
                    border: new PdfAnnotationBorder({
                        width: 2,
                        hRadius: 0,
                        vRadius: 0,
                        style: PdfBorderStyle.solid
                    })
                }
            );
            page.annotations.add(annotation);

            const transparencySpy: jasmine.Spy = spyOn<any>(page.graphics, 'setTransparency').and.callThrough();
            const restoreSpy: jasmine.Spy = spyOn<any>(page.graphics, 'restore').and.callThrough();
            const lineEndSpy: jasmine.Spy = spyOn<any>(annotation, '_drawLineEndStyle').and.callThrough();

            // Act
            const template: PdfTemplate = (annotation as any)._createPolyLineAppearance(true);

            // Assert
            expect(template).toBeUndefined();
            expect(transparencySpy).toHaveBeenCalledWith(0.5);
            expect(lineEndSpy).toHaveBeenCalledTimes(2);
            expect(restoreSpy).toHaveBeenCalled();

            document.destroy();
        });

        it('should cover non-flatten vertices branch and innerColor backBrush creation', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfPolyLineAnnotation = new PdfPolyLineAnnotation(
                [{ x: 1, y: 1 }, { x: 2, y: 2 }],
                {
                    color: { r: 0, g: 0, b: 255 },
                    innerColor: { r: 255, g: 255, b: 0 },
                    border: new PdfAnnotationBorder({
                        width: 1,
                        hRadius: 0,
                        vRadius: 0,
                        style: PdfBorderStyle.solid
                    })
                }
            );
            page.annotations.add(annotation);

            (annotation as any)._points = [];
            (annotation as any)._isBounds = false;
            (annotation as any)._dictionary.update('Vertices', [100, 300, 180, 250, 300, 260, 360, 320]);

            // Act
            const template: PdfTemplate = (annotation as any)._createPolyLineAppearance(false);

            // Assert
            expect(template).toBeDefined();
            expect((annotation as any)._points.length).toBe(4);
            expect((annotation as any)._dictionary.has('Rect')).toBeTruthy();

            document.destroy();
        });
    });

    describe('PdfLineAnnotation._postProcess', () => {

        it('should cover crop/media box offset adjustment and dot dash default branch', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 10, y: 50 }, { x: 110, y: 50 });
            const annot: any = annotation;
            page.annotations.add(annotation);

            annot._crossReference = (document as any)._crossReference;
            annot._page = page;
            annotation.border = new PdfAnnotationBorder({
                width: 1,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.dot
            });
            annotation.color = { r: 0, g: 0, b: 0 };

            spyOn<any>(annot, '_getCropOrMediaBox').and.returnValue([5, 7, 300, 400]);
            spyOn<any>(annot, '_obtainLineBounds').and.returnValue([10, 10, 100, 20]);

            // Act
            annot._postProcess(false);

            // Assert
            expect(annot._linePoints[0].x).toBe(15);
            expect(annot._linePoints[0].y).toBe(57);
            expect(annot._linePoints[1].x).toBe(115);
            expect(annot._linePoints[1].y).toBe(57);
            expect(annotation.border.dash).toEqual([1, 1]);
            expect(annot._dictionary.getArray('L')).toEqual([15, 57, 115, 57]);

            document.destroy();
        });

        it('should cover dashed dash default branch', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 10, y: 50 }, { x: 110, y: 50 });
            const annot: any = annotation;
            page.annotations.add(annotation);

            annot._crossReference = (document as any)._crossReference;
            annot._page = page;
            annotation.border = new PdfAnnotationBorder({
                width: 1,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.dashed
            });
            annotation.color = { r: 0, g: 0, b: 0 };

            spyOn<any>(annot, '_getCropOrMediaBox').and.returnValue([0, 0, 300, 400]);
            spyOn<any>(annot, '_obtainLineBounds').and.returnValue([10, 10, 100, 20]);

            // Act
            annot._postProcess(false);

            // Assert
            expect(annotation.border.dash).toEqual([3, 1]);

            document.destroy();
        });

        it('should cover measure rect update branch with flatten bounds update', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 20, y: 40 }, { x: 120, y: 40 });
            const annot: any = annotation;
            page.annotations.add(annotation);

            annot._crossReference = (document as any)._crossReference;
            annot._page = page;
            annot._setAppearance = true;
            annot._flatten = true;
            annot.flatten = true;
            annot._measure = false; // keeps !this.measure true
            annot._dictionary.update('Measure', true); // keeps dictionary.has('Measure') true
            annot._page._size = [400, 600];
            annot._page._isNew = false;
            annotation.border = new PdfAnnotationBorder({
                width: 1,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.solid
            });
            annotation.color = { r: 0, g: 0, b: 0 };

            spyOn<any>(annot, '_getCropOrMediaBox').and.returnValue([0, 0, 300, 400]);
            spyOn<any>(annot, '_createAppearance').and.returnValue(new PdfTemplate([0, 0, 10, 10], annot._crossReference));
            spyOn<any>(annot, '_obtainLineBounds').and.returnValue([20, 40, 100, 10]);

            // Act
            annot._postProcess(false);

            // Assert
            expect(annot._dictionary.has('Rect')).toBeTruthy();
            expect(annot._bounds).toBeTruthy();

            document.destroy();
        });
    });

    describe('PdfLineAnnotation._createLineMeasureAppearance', () => {

        function createMeasureLine(): { document: PdfDocument; page: PdfPage; annotation: PdfLineAnnotation; annot: any } {
            const { document, page } = createDocumentAndPage();
            const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 10, y: 20 }, { x: 110, y: 20 }, {
                color: { r: 255, g: 0, b: 0 },
                innerColor: { r: 0, g: 255, b: 0 },
                opacity: 0.5,
                border: new PdfAnnotationBorder({
                    width: 2,
                    hRadius: 0,
                    vRadius: 0,
                    style: PdfBorderStyle.solid
                }),
                measurementUnit: PdfMeasurementUnit.centimeter
            });
            const annot: any = annotation;
            page.annotations.add(annotation);
            setCrossRefAndPage(annot, document, page);

            annot._measure = true;
            annot._unitString = 'cm';
            annot._linePoints = [{ x: 10, y: 20 }, { x: 110, y: 20 }];
            annotation.lineEndingStyle = new PdfAnnotationLineEndingStyle({
                begin: PdfLineEndingStyle.none,
                end: PdfLineEndingStyle.none
            });
            annotation.caption.type = PdfLineCaptionType.inline;
            annotation.caption.cap = false;
            annotation.leaderExt = 2;
            annot._leaderLine = 5;
            annotation.leaderOffset = 1;

            return { document, page, annotation, annot };
        }

        it('should cover custom template branch and rect update', () => {
            // Arrange
            const { document, annotation, annot } = createMeasureLine();
            const customTemplate: PdfTemplate = new PdfTemplate([5, 6, 40, 10], annot._crossReference);
            annot._customTemplate.set('N', customTemplate);

            spyOn<any>(annot, '_convertToUnit').and.returnValue(12.34);
            spyOn<any>(annot, '_obtainLinePoints').and.returnValue([{ x: 10, y: 20 }, { x: 110, y: 20 }]);
            spyOn<any>(annot, '_obtainLineBounds').and.returnValue([5, 6, 40, 10]);

            // Act
            const template: PdfTemplate = annot._createLineMeasureAppearance(false);

            // Assert
            expect(template).toBe(customTemplate);
            expect(annot._dictionary.getArray('Rect')).toEqual([5, 6, 45, 16]);

            document.destroy();
        });

        it('should cover dot border, negative leader line, opacity, arrow endings, inline caption and measure AP updates', () => {
            // Arrange
            const { document, annotation, annot } = createMeasureLine();

            annotation.border = new PdfAnnotationBorder({
                width: 2,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.dot
            });
            annotation.lineEndingStyle = new PdfAnnotationLineEndingStyle({
                begin: PdfLineEndingStyle.openArrow,
                end: PdfLineEndingStyle.closedArrow
            });
            annotation.caption.type = PdfLineCaptionType.inline;
            annotation.caption.cap = false;
            annot._leaderLine = -8;
            annotation.opacity = 0.5;
            annot._customTemplate.clear();

            spyOn<any>(annot, '_convertToUnit').and.returnValue(8.5);
            spyOn<any>(annot, '_obtainLinePoints').and.returnValue([{ x: 10, y: 20 }, { x: 90, y: 20 }]);
            spyOn<any>(annot, '_obtainLineBounds').and.returnValue([0, 0, 120, 40]);
            spyOn<any>(annot, '_obtainFont').and.returnValue(annot._lineCaptionFont);
            spyOn<any>(annot, '_drawLineStyle').and.stub();

            // Act
            const template: PdfTemplate = annot._createLineMeasureAppearance(false);

            // Assert
            expect(template).toBeDefined();
            expect(annot._dictionary.has('AP')).toBeTruthy();
            expect(annot._dictionary.has('Measure')).toBeTruthy();
            expect(annot._dictionary.has('DS')).toBeTruthy();
            expect(annot._dictionary.has('LE')).toBeTruthy();
            expect(annot._dictionary.has('L')).toBeTruthy();
            expect(annot._dictionary.has('C')).toBeTruthy();
            expect(annot._dictionary.has('Subtype')).toBeTruthy();
            expect(annot._dictionary.has('IT')).toBeTruthy();
            expect(annot._dictionary.has('LLE')).toBeTruthy();
            expect(annot._dictionary.has('LLO')).toBeTruthy();
            expect(annot._dictionary.has('LL')).toBeTruthy();
            expect(annot._dictionary.has('CP')).toBeTruthy();
            expect(annot._dictionary.has('Cap')).toBeTruthy();
            expect(annot._dictionary.get('Contents')).toContain('8.50 cm');

            document.destroy();
        });

        it('should cover dashed border and top caption branch', () => {
            // Arrange
            const { document, annotation, annot } = createMeasureLine();

            annotation.border = new PdfAnnotationBorder({
                width: 1,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.dashed
            });
            annotation.caption.type = PdfLineCaptionType.top;
            annotation.caption.cap = true;
            annot._leaderLine = 5;
            annotation.opacity = 0.5;
            annot._customTemplate.clear();

            spyOn<any>(annot, '_convertToUnit').and.returnValue(10);
            spyOn<any>(annot, '_obtainLinePoints').and.returnValue([{ x: 15, y: 25 }, { x: 95, y: 25 }]);
            spyOn<any>(annot, '_obtainLineBounds').and.returnValue([0, 0, 100, 30]);
            spyOn<any>(annot, '_obtainFont').and.returnValue(annot._lineCaptionFont);
            spyOn<any>(annot, '_drawLineStyle').and.stub();

            // Act
            const template: PdfTemplate = annot._createLineMeasureAppearance(false);

            // Assert
            expect(template).toBeDefined();
            expect(annot._dictionary.get('Contents')).toContain('10.00 cm');

            document.destroy();
        });

        it('should cover solid border with dash array and non-measure caption position else branch', () => {
            // Arrange
            const { document, annotation, annot } = createMeasureLine();

            annotation.border = new PdfAnnotationBorder({
                width: 1,
                hRadius: 0,
                vRadius: 0,
                style: PdfBorderStyle.solid,
                dash: [2, 2]
            });
            annotation.caption.type = PdfLineCaptionType.inline;
            annotation.caption.cap = true;
            annot._measure = false; // forces final caption-position else branch
            annot._customTemplate.clear();

            spyOn<any>(annot, '_convertToUnit').and.returnValue(5);
            spyOn<any>(annot, '_obtainLinePoints').and.returnValue([{ x: 10, y: 20 }, { x: 80, y: 20 }]);
            spyOn<any>(annot, '_obtainLineBounds').and.returnValue([0, 0, 90, 25]);
            spyOn<any>(annot, '_obtainFont').and.returnValue(annot._lineCaptionFont);
            spyOn<any>(annot, '_drawLineStyle').and.stub();

            // Act
            const template: PdfTemplate = annot._createLineMeasureAppearance(false);

            // Assert
            expect(template).toBeDefined();

            document.destroy();
        });
    });

    describe('PdfPolygonAnnotation._createPolygonAppearance', () => {

        it('should cover flatten=true custom template branch and bounds update', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfPolygonAnnotation = new PdfPolygonAnnotation([
                { x: 100, y: 300 },
                { x: 150, y: 200 },
                { x: 300, y: 200 },
                { x: 350, y: 300 }
            ]);
            const annot: any = annotation;
            page.annotations.add(annotation);
            setCrossRefAndPage(annot, document, page);

            const customTemplate: PdfTemplate = new PdfTemplate([0, 0, 100, 100], annot._crossReference);
            annot._customTemplate.set('N', customTemplate);

            // Act
            const template: PdfTemplate = annot._createPolygonAppearance(true);

            // Assert
            expect(template).toBe(customTemplate);
            expect(annotation.bounds).toBeDefined();

            document.destroy();
        });

        it('should cover flatten=true cloudy branch with opacity, brushes and drawCloudStyle', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfPolygonAnnotation = new PdfPolygonAnnotation(
                [
                    { x: 100, y: 300 },
                    { x: 150, y: 200 },
                    { x: 300, y: 200 },
                    { x: 350, y: 300 },
                    { x: 300, y: 400 },
                    { x: 150, y: 400 }
                ],
                {
                    color: { r: 0, g: 128, b: 255 },
                    innerColor: { r: 220, g: 240, b: 255 },
                    opacity: 0.7,
                    border: new PdfAnnotationBorder({
                        width: 2,
                        hRadius: 0,
                        vRadius: 0,
                        style: PdfBorderStyle.solid
                    })
                }
            );
            const annot: any = annotation;
            page.annotations.add(annotation);
            setCrossRefAndPage(annot, document, page);

            const effect: PdfBorderEffect = annotation.borderEffect;
            effect.style = PdfBorderEffectStyle.cloudy;
            effect.intensity = 2;

            const cloudSpy: jasmine.Spy = spyOn<any>(annot, '_drawCloudStyle').and.callThrough();
            const transparencySpy: jasmine.Spy = spyOn<any>(page.graphics, 'setTransparency').and.callThrough();

            // Act
            const template: PdfTemplate = annot._createPolygonAppearance(true);

            // Assert
            expect(template).toBeUndefined();
            expect(cloudSpy).toHaveBeenCalled();
            expect(transparencySpy).toHaveBeenCalledWith(0.7);

            document.destroy();
        });

        it('should cover flatten=true normal drawPolygon branch', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfPolygonAnnotation = new PdfPolygonAnnotation(
                [
                    { x: 100, y: 300 },
                    { x: 150, y: 200 },
                    { x: 300, y: 200 },
                    { x: 350, y: 300 }
                ],
                {
                    color: { r: 255, g: 0, b: 0 },
                    innerColor: { r: 255, g: 255, b: 0 },
                    opacity: 0.5,
                    border: new PdfAnnotationBorder({
                        width: 1,
                        hRadius: 0,
                        vRadius: 0,
                        style: PdfBorderStyle.solid
                    })
                }
            );
            const annot: any = annotation;
            page.annotations.add(annotation);
            setCrossRefAndPage(annot, document, page);

            const drawPolygonSpy: jasmine.Spy = spyOn<any>(page.graphics, 'drawPolygon').and.callThrough();

            // Act
            const template: PdfTemplate = annot._createPolygonAppearance(true);

            // Assert
            expect(template).toBeUndefined();
            expect(drawPolygonSpy).toHaveBeenCalled();

            document.destroy();
        });

        it('should cover non-flatten vertices branch, cloudy rect expansion, opacity and _isBounds update', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfPolygonAnnotation = new PdfPolygonAnnotation(
                [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 },
                    { x: 3, y: 1 }
                ],
                {
                    color: { r: 0, g: 0, b: 255 },
                    innerColor: { r: 255, g: 255, b: 0 },
                    opacity: 0.6,
                    border: new PdfAnnotationBorder({
                        width: 2,
                        hRadius: 0,
                        vRadius: 0,
                        style: PdfBorderStyle.solid
                    })
                }
            );
            const annot: any = annotation;
            page.annotations.add(annotation);
            setCrossRefAndPage(annot, document, page);

            annot._points = undefined;
            annot._dictionary.update('Vertices', [100, 300, 150, 200, 300, 200, 350, 300]);
            annot._isBounds = true;

            const effect: PdfBorderEffect = annotation.borderEffect;
            effect.style = PdfBorderEffectStyle.cloudy;
            effect.intensity = 2;

            // Act
            const template: PdfTemplate = annot._createPolygonAppearance(false);

            // Assert
            expect(template).toBeDefined();
            expect(annot._points.length).toBeGreaterThan(0);
            expect(annot._dictionary.has('Rect')).toBeTruthy();
            expect(annot._dictionary.has('Vertices')).toBeTruthy();

            document.destroy();
        });

        it('should cover non-flatten custom template branch', () => {
            // Arrange
            const { document, page } = createDocumentAndPage();
            const annotation: PdfPolygonAnnotation = new PdfPolygonAnnotation([
                { x: 100, y: 300 },
                { x: 150, y: 200 },
                { x: 300, y: 200 }
            ]);
            const annot: any = annotation;
            page.annotations.add(annotation);
            setCrossRefAndPage(annot, document, page);

            const customTemplate: PdfTemplate = new PdfTemplate([0, 0, 50, 50], annot._crossReference);
            annot._customTemplate.set('N', customTemplate);

            // Act
            const template: PdfTemplate = annot._createPolygonAppearance(false);

            // Assert
            expect(template).toBe(customTemplate);

            document.destroy();
        });
    });
});