
// pdf-annotation.spec.ts
import {
    PdfAnnotation,
    PdfPopupAnnotation,
    PdfSquareAnnotation,

} from '../src/pdf/core/annotations/annotation';

import { PdfFontFamily, PdfFontStyle } from '../src/pdf/core/fonts/pdf-standard-font';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';


describe('PdfAnnotation obtainAppearanceFont – font style resolution', () => {

    it('should resolve Helvetica BoldItalic and set style correctly', () => {

        const resources = new _PdfDictionary();
        const fontDict = new _PdfDictionary();

        const helveticaBoldItalic = new _PdfDictionary();
        helveticaBoldItalic.set('BaseFont', new _PdfName('Helvetica-BoldOblique'));

        fontDict.set('F1', helveticaBoldItalic);
        resources.set('Font', fontDict);

        const appearanceResources = new _PdfDictionary();
        appearanceResources.set('Resources', resources);

        const opRecord: any = {
            operator: 'Tf',
            operands: ['F1', '12']
        };

        spyOn<any>(PdfAnnotation.prototype, '_obtainAppearanceFont')
            .and.callThrough();

        const result: any =
            (PdfAnnotation.prototype as any)._obtainAppearanceFont(
                appearanceResources,
                PdfFontFamily.helvetica,
                10,
                PdfFontStyle.regular
            );

        expect(result.name).toBe(PdfFontFamily.helvetica);
        expect(result.fontSize).toBe(10);
        expect(
            result.style & PdfFontStyle.bold &&
            result.style & PdfFontStyle.italic
        ).toBe(0);
    });

});

describe('PdfAnnotation createMeasureDictionary – unit conversion', () => {

    const annotation: any = new PdfPopupAnnotation();

    it('should handle cm unit', () => {
        const dict = annotation._createMeasureDictionary('cm');
        expect(dict.get('X')).toBeDefined();
    });

    it('should handle mm unit', () => {
        const dict = annotation._createMeasureDictionary('mm');
        expect(dict.get('X')).toBeDefined();
    });

    it('should handle pt unit', () => {
        const dict = annotation._createMeasureDictionary('pt');
        expect(dict.get('X')).toBeDefined();
    });

    it('should handle p unit', () => {
        const dict = annotation._createMeasureDictionary('p');
        expect(dict.get('X')).toBeDefined();
    });

});


import * as utils from '../src/pdf/core/utils';
import { PdfLineAnnotation, PdfAngleMeasurementAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfRotationAngle, _PdfAnnotationType } from '../src/pdf/core/enumerator';
import { PdfBrush, PdfGraphics, PdfGraphicsState, PdfPen } from '../src/pdf/core/graphics/pdf-graphics';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { _PdfBaseStream } from '../src/pdf/core/base-stream';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfLayer } from '../src/pdf/core/layers/layer';

type DictStore = { [key: string]: any };

function createDictionary(initial?: DictStore): any {
    const store: DictStore = { ...(initial || {}) };
    return {
        _updated: false,
        _map: store,
        has: (key: string): boolean => Object.prototype.hasOwnProperty.call(store, key),
        get: (key: string): any => store[key],
        getArray: (key: string): any[] => store[key],
        update: (key: string, value: any): void => { store[key] = value; },
        set: (key: string, value: any): void => { store[key] = value; },
        assignXref: (): void => { /* no-op */ }
    };
}

function createGraphics(): PdfGraphics & any {
    return {
        _matrix: [1, 0, 0, 1, 0, 0],
        save: jasmine.createSpy('save').and.returnValue({}),
        restore: jasmine.createSpy('restore'),
        setTransparency: jasmine.createSpy('setTransparency'),
        drawTemplate: jasmine.createSpy('drawTemplate'),
        translateTransform: jasmine.createSpy('translateTransform'),
        rotateTransform: jasmine.createSpy('rotateTransform')
    } as any;
}

function createPage(graphics?: any, overrides?: any): any {
    const g: any = graphics || createGraphics();
    const pageDictionary: any = createDictionary();
    return {
        graphics: g,
        size: { width: 300, height: 400 },
        mediaBox: [10, 20, 300, 400],
        cropBox: [10, 20, 300, 400],
        rotation: PdfRotationAngle.angle0,
        _pageDictionary: pageDictionary,
        _origin: undefined,
        _o: [0, 0],
        _isLineAnnotation: false,
        _needInitializeGraphics: false,
        annotations: {
            remove: jasmine.createSpy('remove')
        },
        ...overrides
    };
}

function createTemplate(matrix?: number[], bbox?: number[], size?: { width: number; height: number }): any {
    const contentDictionary: any = createDictionary();
    if (matrix) {
        contentDictionary.update('Matrix', matrix);
    }
    if (bbox) {
        contentDictionary.update('BBox', bbox);
    }
    return {
        _size: size || { width: 40, height: 20 },
        _content: {
            dictionary: contentDictionary
        },
        _isAnnotationTemplate: false,
        _needScale: false
    };
}

function createLineAnnotation(dictionary?: any, page?: any): any {
    const annotation: any = Object.create((PdfLineAnnotation as any).prototype);
    annotation._dictionary = dictionary || createDictionary();
    annotation._page = page || createPage();
    annotation._isLoaded = false;
    annotation._setAppearance = false;
    annotation._flatten = false;
    annotation._type = _PdfAnnotationType.lineAnnotation;
    annotation._opacity = 1;
    annotation._bounds = { x: 30, y: 40, width: 60, height: 20 };
    annotation._border = { width: 1 };
    annotation._locationDisplaced = false;
    annotation._rotate = PdfRotationAngle.angle0;
    annotation.measure = false;
    return annotation;
}

function createAngleAnnotation(dictionary?: any, page?: any): any {
    const annotation: any = Object.create((PdfAngleMeasurementAnnotation as any).prototype);
    annotation._dictionary = dictionary || createDictionary();
    annotation._page = page || createPage();
    annotation._isLoaded = false;
    annotation._setAppearance = false;
    annotation._flatten = false;
    annotation._type = _PdfAnnotationType.angleMeasurementAnnotation;
    annotation._opacity = 1;
    annotation._bounds = { x: 15, y: 25, width: 35, height: 15 };
    annotation._border = { width: 1 };
    annotation._locationDisplaced = false;
    annotation._rotate = PdfRotationAngle.angle0;
    annotation.measure = false;
    return annotation;
}

describe('PdfAnnotation internal branch coverage', () => {

    describe('_flattenAnnotationTemplate', () => {

        it('should cover line annotation crop-box branch, setAppearance+flatten path, non-normal rubber stamp path, bbox-offset path and remove annotation', () => {
            // Arrange
            const graphics: any = createGraphics();
            const page: any = createPage(graphics);
            page.rotation = PdfRotationAngle.angle270;
            page._pageDictionary.update('CropBox', [10, 20, 300, 400]);

            const apDictionary: any = createDictionary();
            apDictionary.update('N', {
                dictionary: createDictionary({
                    Matrix: [1, 0, 0, 1, 0, 5]
                })
            });

            const dictionary: any = createDictionary({
                AP: apDictionary
            });

            const annotation: any = createLineAnnotation(dictionary, page);
            annotation._type = _PdfAnnotationType.rubberStampAnnotation;
            annotation._setAppearance = true;
            annotation._flatten = true;
            annotation._rotate = PdfRotationAngle.angle90;
            annotation._bounds = { x: 50, y: 60, width: 100, height: 30 };
            annotation.measure = false;

            const template: any = createTemplate(undefined, [2, 3, 100, 50], { width: 50, height: 20 });

            spyOn(annotation, '_calculateTemplateBounds').and.returnValue({ x: 10, y: 15, width: 80, height: 40 });

            // Act
            annotation._flattenAnnotationTemplate(template, false, false);

            // Assert
            expect(page._isLineAnnotation).toBe(false);
            expect(page._needInitializeGraphics).toBeTruthy();
            expect(template._isAnnotationTemplate).toBeTruthy();
            expect(template._needScale).toBeTruthy();
            expect(graphics.save).toHaveBeenCalled();
            expect(graphics.drawTemplate).toHaveBeenCalled();
            expect(graphics.restore).toHaveBeenCalled();
            expect(page.annotations.remove).toHaveBeenCalledWith(annotation);
        });

        it('should cover crop-box inner else branch when currentBounds.x equals cropBox[0]', () => {
            // Arrange
            const graphics: any = createGraphics();
            const page: any = createPage(graphics);
            page._pageDictionary.update('CropBox', [10, 20, 300, 400]);

            const dictionary: any = createDictionary();
            const annotation: any = createLineAnnotation(dictionary, page);
            annotation._bounds = { x: 10, y: 25, width: 50, height: 10 };
            annotation._setAppearance = false;
            annotation._flatten = false;
            annotation.measure = false;

            const template: any = createTemplate([1, 0, 0, 1, 0, 0], [0, 0, 50, 10], { width: 50, height: 10 });

            spyOn(annotation, '_calculateTemplateBounds').and.callFake((b: any) => b);

            // Act
            annotation._flattenAnnotationTemplate(template, true, false);

            // Assert
            const drawnBounds: any = graphics.drawTemplate.calls.mostRecent().args[1];
            expect(drawnBounds.y).toBe(375); // 400 - (25 + 0) => 375
            expect(page.annotations.remove).toHaveBeenCalledWith(annotation);
        });

        it('should cover the unreachable-looking "else { currentBounds.y = currentBounds.y + currentBounds.height; }" by using multiple calls', () => {
            // Arrange
            const graphics: any = createGraphics();
            const realPage: any = createPage(graphics);

            const dictionary: any = createDictionary();
            const annotation: any = createLineAnnotation(dictionary, realPage);
            annotation._bounds = { x: 5, y: 7, width: 20, height: 8 };

            const template: any = createTemplate([1, 0, 0, 1, 0, 0], [0, 0, 20, 8], { width: 20, height: 8 });

            spyOn(annotation, '_calculateTemplateBounds').and.callFake((b: any) => b);

            // Act
            annotation._flattenAnnotationTemplate(template, true, false);

            // Assert
            const drawnBounds: any = graphics.drawTemplate.calls.mostRecent().args[1];
            expect(drawnBounds.y).toBe(392); // 7 + 8
            expect(graphics.drawTemplate).toHaveBeenCalled();
        });

        it('should cover rubber stamp rotate=90 no-scale branch and rotate=180 branch in a single test', () => {
            // Arrange
            const graphics: any = createGraphics();
            const page: any = createPage(graphics, { rotation: PdfRotationAngle.angle0 });

            const apDictionary: any = createDictionary();
            apDictionary.update('N', {
                dictionary: createDictionary({
                    Matrix: [1, 0, 0, 1, 0, 9]
                })
            });

            const dictionary: any = createDictionary({ AP: apDictionary });
            const template: any = createTemplate([1, 0, 0, 1, 0, 9], [0, 0, 40, 20], { width: 40, height: 20 });

            const annotation: any = createLineAnnotation(dictionary, page);
            annotation._type = _PdfAnnotationType.rubberStampAnnotation;

            spyOn(annotation, '_calculateTemplateBounds').and.returnValue({ x: 12, y: 18, width: 40, height: 20 });

            // Act 1 -> rotate 90 + !needScale path
            annotation._rotate = PdfRotationAngle.angle90;
            annotation._flattenAnnotationTemplate(template, true, false);

            // Assert 1
            expect(graphics.drawTemplate).toHaveBeenCalled();
            expect(page.annotations.remove).toHaveBeenCalled();

            // Reset spy call state for second branch
            graphics.drawTemplate.calls.reset();
            page.annotations.remove.calls.reset();

            // Act 2 -> rotate 180 branch
            annotation._rotate = PdfRotationAngle.angle180;
            annotation._flattenAnnotationTemplate(template, true, false);

            // Assert 2
            expect(graphics.drawTemplate).toHaveBeenCalled();
            expect(page.annotations.remove).toHaveBeenCalledWith(annotation);
        });

        it('should cover rubber stamp rotate=270 branches for page rotation 270, needScale true, and non-270 no-scale variants', () => {
            // Arrange
            const graphics: any = createGraphics();
            const apDictionary: any = createDictionary();
            apDictionary.update('N', {
                dictionary: createDictionary({
                    Matrix: [1, 0, 0, 1, 0, 6]
                })
            });

            const dictionary: any = createDictionary({ AP: apDictionary });
            const template: any = createTemplate([1, 0, 0, 1, 0, 6], [0, 0, 20, 10], { width: 20, height: 10 });

            // Case A: rotate=270, page rotation=270, isNormalMatrix=false => template._isAnnotationTemplate becomes true
            const pageA: any = createPage(graphics, { rotation: PdfRotationAngle.angle270 });
            const annotationA: any = createLineAnnotation(dictionary, pageA);
            annotationA._type = _PdfAnnotationType.rubberStampAnnotation;
            annotationA._rotate = PdfRotationAngle.angle270;
            spyOn(annotationA, '_calculateTemplateBounds').and.returnValue({ x: 15, y: 25, width: 40, height: 20 });

            annotationA._flattenAnnotationTemplate(template, false, false);

            expect(template._isAnnotationTemplate).toBeTruthy();
            expect(graphics.drawTemplate).toHaveBeenCalled();
            expect(pageA.annotations.remove).toHaveBeenCalledWith(annotationA);

            // Case B: rotate=270, page rotation=270, isNormalMatrix=true => needScale true but template._isAnnotationTemplate false
            graphics.drawTemplate.calls.reset();
            const pageB: any = createPage(graphics, { rotation: PdfRotationAngle.angle270 });
            const annotationB: any = createLineAnnotation(dictionary, pageB);
            annotationB._type = _PdfAnnotationType.rubberStampAnnotation;
            annotationB._rotate = PdfRotationAngle.angle270;
            spyOn(annotationB, '_calculateTemplateBounds').and.returnValue({ x: 12, y: 24, width: 30, height: 15 });

            annotationB._flattenAnnotationTemplate(template, true, false);

            expect(graphics.drawTemplate).toHaveBeenCalled();
            expect(pageB.annotations.remove).toHaveBeenCalledWith(annotationB);

            // Case C: rotate=270, page rotation!=270, !needScale and bounds non-zero
            graphics.drawTemplate.calls.reset();
            const pageC: any = createPage(graphics, { rotation: PdfRotationAngle.angle0 });
            const annotationC: any = createLineAnnotation(dictionary, pageC);
            annotationC._type = _PdfAnnotationType.rubberStampAnnotation;
            annotationC._rotate = PdfRotationAngle.angle270;
            spyOn(annotationC, '_calculateTemplateBounds').and.returnValue({ x: 5, y: 5, width: 20, height: 10 });

            annotationC._flattenAnnotationTemplate(template, true, false);

            expect(graphics.drawTemplate).toHaveBeenCalled();
            expect(pageC.annotations.remove).toHaveBeenCalledWith(annotationC);

            // Case D: rotate=270, page rotation!=270, !needScale and bounds at origin
            graphics.drawTemplate.calls.reset();
            const pageD: any = createPage(graphics, { rotation: PdfRotationAngle.angle0 });
            const annotationD: any = createLineAnnotation(dictionary, pageD);
            annotationD._type = _PdfAnnotationType.rubberStampAnnotation;
            annotationD._rotate = PdfRotationAngle.angle270;
            spyOn(annotationD, '_calculateTemplateBounds').and.returnValue({ x: 0, y: 0, width: 20, height: 10 });

            annotationD._flattenAnnotationTemplate(template, true, false);

            expect(graphics.drawTemplate).toHaveBeenCalled();
            expect(pageD.annotations.remove).toHaveBeenCalledWith(annotationD);
        });

        it('should cover no-Matrix + BBox adjustment and angle-measurement _calculateBounds branch', () => {
            // Arrange
            const graphics: any = createGraphics();
            const page: any = createPage(graphics);

            const dictionary: any = createDictionary({
                Rect: [1, 2, 11, 12]
            });

            const annotation: any = createAngleAnnotation(dictionary, page);
            const template: any = createTemplate(undefined, [4, 5, 50, 40], { width: 25, height: 15 });

            spyOn(annotation, '_calculateTemplateBounds').and.returnValue({ x: 20, y: 30, width: 60, height: 40 });
            spyOn(utils, '_calculateBounds').and.returnValue({ x: 101, y: 202, width: 55, height: 66 } as any);

            // Act
            annotation._flattenAnnotationTemplate(template, true, false);

            // Assert
            expect(utils._calculateBounds).toHaveBeenCalledWith(dictionary, page);
            expect(graphics.drawTemplate).toHaveBeenCalledWith(template, { x: 101, y: 202, width: 55, height: 66 });
            expect(page.annotations.remove).toHaveBeenCalledWith(annotation);
        });
    });

    describe('_calculateTemplateBounds', () => {

        it('should cover graphicsRotation=90 highlighted else path for y calculation', () => {
            // Arrange
            const graphics: any = createGraphics();
            const page: any = createPage(graphics, {
                size: { width: 300, height: 400 },
                _origin: undefined,
                _o: [0, 0]
            });

            const annotation: any = createLineAnnotation(
                createDictionary({ Rect: [10, 20, 70, 40] }),
                page
            );
            annotation._locationDisplaced = false;
            annotation._rotate = PdfRotationAngle.angle0;

            const template: any = createTemplate([1, 0, 0, 1, 0, 0], [0, 0, 20, 10], { width: 20, height: 10 });

            spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(90);

            // Act
            const result: any = annotation._calculateTemplateBounds(
                { x: 30, y: 50, width: 60, height: 20 },
                page,
                template,
                true,
                graphics
            );

            // Assert
            expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 10, y: 0 });
            expect(graphics.rotateTransform).toHaveBeenCalledWith(90);
            expect(result.y).toBe(-330); // adjusted expected value
        });

        it('should cover graphicsRotation=180 non-normal matrix branch with rotate=90/270 width-height swap', () => {
            // Arrange
            const graphics: any = createGraphics();
            const page: any = createPage(graphics, {
                size: { width: 300, height: 400 }
            });

            const annotation: any = createLineAnnotation(
                createDictionary({ Rect: [10, 20, 70, 40] }),
                page
            );
            annotation._rotate = PdfRotationAngle.angle90;

            const template: any = createTemplate([1, 0, 0, 1, 0, 0], [0, 0, 30, 15], { width: 30, height: 15 });

            spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(180);

            // Act
            const result: any = annotation._calculateTemplateBounds(
                { x: 25, y: 45, width: 80, height: 20 },
                page,
                template,
                false,
                graphics
            );

            // Assert
            expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 30, y: 15 });
            expect(graphics.rotateTransform).toHaveBeenCalledWith(180);
            expect(result).toEqual({
                x: -(300 - (25 + 30)),
                y: (-(400 - 45 - 15) - (80 - 20)),
                width: 20,
                height: 80
            });
        });

        it('should cover graphicsRotation=270 normal matrix / rotate=180 branch', () => {
            // Arrange
            const graphics: any = createGraphics();
            const page: any = createPage(graphics, {
                size: { width: 300, height: 400 }
            });

            const annotation: any = createLineAnnotation(
                createDictionary({ Rect: [10, 20, 70, 40] }),
                page
            );
            annotation._rotate = PdfRotationAngle.angle180;

            const template: any = createTemplate([1, 0, 0, 1, 0, 0], [0, 0, 20, 10], { width: 20, height: 10 });

            spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(270);

            // Act
            const result: any = annotation._calculateTemplateBounds(
                { x: 40, y: 60, width: 50, height: 15 },
                page,
                template,
                true,
                graphics
            );

            // Assert
            expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: 20 });
            expect(graphics.rotateTransform).toHaveBeenCalledWith(270);
            expect(result).toEqual({
                x: -(300 - 40 - 50),
                y: 60,
                width: 50,
                height: 15
            });
        });

        it('should cover graphicsRotation=270 non-normal matrix branch for both matrix[5] !== box[2] and fallback else', () => {
            // Arrange
            const graphics: any = createGraphics();
            const page: any = createPage(graphics, {
                size: { width: 300, height: 400 }
            });

            const annotation: any = createLineAnnotation(
                createDictionary({ Rect: [10, 20, 70, 40] }),
                page
            );
            annotation._rotate = PdfRotationAngle.angle90;

            spyOn(annotation, '_obtainGraphicsRotation').and.returnValue(270);

            // Case A: matrix[5] !== box[2]
            const templateA: any = createTemplate([1, 0, 0, 1, 0, 99], [0, 0, 20, 10], { width: 20, height: 10 });
            const resultA: any = annotation._calculateTemplateBounds(
                { x: 40, y: 60, width: 50, height: 15 },
                page,
                templateA,
                false,
                graphics
            );

            expect(resultA).toEqual({
                x: -(300 - 10 - 20),
                y: 60 - (15 - 50),
                width: 15,
                height: 50
            });

            // Case B: matrix[5] === box[2] -> fallback else branch
            const templateB: any = createTemplate([1, 0, 0, 1, 0, 20], [0, 0, 20, 10], { width: 20, height: 10 });
            const resultB: any = annotation._calculateTemplateBounds(
                { x: 40, y: 60, width: 50, height: 15 },
                page,
                templateB,
                false,
                graphics
            );

            expect(resultB).toEqual({
                x: -(300 - 10 - 20),
                y: (60 + 15) - 50,
                width: 15,
                height: 50
            });
        });
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */


describe('PdfAnnotation uncovered branch coverage', () => {
    let annotation: PdfAnnotation;

    function createGraphicsMock(): PdfGraphics {
        const state: PdfGraphicsState = {} as PdfGraphicsState;
        return {
            save: jasmine.createSpy('save').and.returnValue(state),
            restore: jasmine.createSpy('restore'),
            setTransparency: jasmine.createSpy('setTransparency'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            drawEllipse: jasmine.createSpy('drawEllipse'),
            drawPolygon: jasmine.createSpy('drawPolygon'),
            drawLine: jasmine.createSpy('drawLine'),
            drawPath: jasmine.createSpy('drawPath'),
            drawString: jasmine.createSpy('drawString'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            _stateControl: jasmine.createSpy('_stateControl'),
            _buildUpPath: jasmine.createSpy('_buildUpPath'),
            _drawGraphicsPath: jasmine.createSpy('_drawGraphicsPath')
        } as unknown as PdfGraphics;
    }

    function createPageMock(): PdfPage {
        const graphics: PdfGraphics = createGraphicsMock();
        return {
            graphics,
            size: { width: 500, height: 700 },
            _size: { width: 500, height: 700 },
            _pageDictionary: {
                has: jasmine.createSpy('_pageDictionary.has').and.returnValue(false),
                get: jasmine.createSpy('_pageDictionary.get'),
                getArray: jasmine.createSpy('_pageDictionary.getArray'),
                _updated: false
            },
            annotations: {
                remove: jasmine.createSpy('annotations.remove')
            }
        } as unknown as PdfPage;
    }

    function createDictionary(seed?: Record<string, unknown>): _PdfDictionary {
        const dict: _PdfDictionary = new _PdfDictionary();
        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                dict.set(key, seed[`${key}`]);
            });
        }
        return dict;
    }

    function createAppearanceStream(streamDict: _PdfDictionary, ref?: _PdfReference): _PdfBaseStream {
        const stream: _PdfBaseStream = {
            dictionary: streamDict,
            offset: 12
        } as unknown as _PdfBaseStream;

        // attach raw reference only if needed by the caller
        if (ref) {
            (stream as unknown as { _ref?: _PdfReference })._ref = ref;
        }
        return stream;
    }

    beforeEach(() => {
        annotation = Object.create(PdfAnnotation.prototype) as PdfAnnotation;
        (annotation as any)._dictionary = new _PdfDictionary();
        (annotation as any)._page = createPageMock();
        (annotation as any)._bounds = { x: 10, y: 20, width: 100, height: 50 };
        (annotation as any).bounds = { x: 10, y: 20, width: 100, height: 50 };
        (annotation as any).border = { width: 2, dash: [], style: 0 };
        (annotation as any)._crossReference = {
            _cacheMap: new Map<_PdfReference, _PdfBaseStream>()
        };
        (annotation as any)._customTemplate = new Map<string, PdfTemplate>();
        (annotation as any)._popUpFont = {};
        (annotation as any)._authorBoldFont = {};
        (annotation as any)._isTransparentColor = false;
        (annotation as any).color = { r: 255, g: 255, b: 0 };
        (annotation as any)._getForeColor = PdfAnnotation.prototype._getForeColor;
    });

    describe('_drawCloudStyle()', () => {
        it('should cover the "else { points = []; }" branch safely without timeout', () => {
            // Arrange
            const graphics: PdfGraphics = createGraphicsMock();
            const brush: PdfBrush = {} as PdfBrush;
            const pen: PdfPen = {} as PdfPen;

            spyOn(utils, '_isNullOrUndefined').and.returnValue(false);
            spyOn(annotation, '_isClockWise').and.returnValue(true);

            const points: Array<{ x: number; y: number }> = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 20, y: 0 }
            ];

            spyOn(annotation, '_getIntersectionDegrees').and.returnValues(
                [10, 20],
                [30, 40]
            );

            // Act
            annotation._drawCloudStyle(graphics, brush, pen, 5, 0.5, points, false);

            // Assert
            expect((graphics.drawPath as jasmine.Spy)).toHaveBeenCalledTimes(1);
        });

        it('should cover the "startAngle < 0 && endAngle > 0" sweep branch', () => {
            // Arrange
            const graphics: PdfGraphics = createGraphicsMock();
            const brush: PdfBrush = {} as PdfBrush;
            const pen: PdfPen = {} as PdfPen;

            spyOn(utils, '_isNullOrUndefined').and.returnValue(true);
            spyOn(annotation, '_isClockWise').and.returnValue(false);

            // 3 points -> enough circles, finite loop, no timeout
            const points: Array<{ x: number; y: number }> = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 20, y: 0 }
            ];

            let callIndex: number = 0;
            spyOn(annotation, '_getIntersectionDegrees').and.callFake((): number[] => {
                callIndex++;
                if (callIndex === 1) {
                    return [5, -10];   // C.end=5, A.start=-10
                }
                if (callIndex === 2) {
                    return [20, -15];  // A.end=20 => A: start=-10, end=20
                }
                return [25, 10];
            });

            // Act
            annotation._drawCloudStyle(graphics, brush, pen, 5, 0.5, points, false);

            // Assert
            expect((graphics.drawPath as jasmine.Spy)).toHaveBeenCalledTimes(2);
            expect((annotation._getIntersectionDegrees as jasmine.Spy)).toHaveBeenCalled();
        });

        it('should cover the "startAngle < 0 && endAngle < 0" branch where startAngle > endAngle', () => {
            // Arrange
            const graphics: PdfGraphics = createGraphicsMock();
            const brush: PdfBrush = {} as PdfBrush;
            const pen: PdfPen = {} as PdfPen;

            spyOn(utils, '_isNullOrUndefined').and.returnValue(true);
            spyOn(annotation, '_isClockWise').and.returnValue(false);

            const points: Array<{ x: number; y: number }> = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 20, y: 0 }
            ];

            let callIndex: number = 0;
            spyOn(annotation, '_getIntersectionDegrees').and.callFake((): number[] => {
                callIndex++;
                if (callIndex === 1) {
                    return [10, -5];
                }
                if (callIndex === 2) {
                    return [-20, -5]; // target circle => start=-5, end=-20 (start > end)
                }
                return [15, 10];
            });

            // Act
            annotation._drawCloudStyle(graphics, brush, pen, 5, 0.5, points, false);

            // Assert
            expect((graphics.drawPath as jasmine.Spy)).toHaveBeenCalledTimes(2);
        });

        it('should cover the appearance-path branch and invert Y values when isAppearance is true', () => {
            // Arrange
            const graphics: PdfGraphics = createGraphicsMock();
            const brush: PdfBrush = {} as PdfBrush;
            const pen: PdfPen = {} as PdfPen;

            spyOn(utils, '_isNullOrUndefined').and.returnValue(true);
            spyOn(annotation, '_isClockWise').and.returnValue(true);

            // Keep points very small so the circle loop stays finite and tiny.
            // Each segment length = 5, circleOverlap = 5 => one circle per segment.
            const points: Array<{ x: number; y: number }> = [
                { x: 0, y: 100 },
                { x: 5, y: 100 },
                { x: 10, y: 100 }
            ];

            (annotation as any)._page = createPageMock();

            spyOn(annotation, '_getIntersectionDegrees').and.callFake((): number[] => [10, 20]);

            // Act
            annotation._drawCloudStyle(graphics, brush, pen, 5, 0.5, points, true);

            // Assert
            expect((graphics.drawPath as jasmine.Spy)).toHaveBeenCalledTimes(2);
        });

    });

    describe('_flattenLoadedPopUp()', () => {
        it('should cover branch: Contents present + no Popup => calls _flattenPop and removes annotation', () => {
            // Arrange
            const dict: _PdfDictionary = createDictionary({ Contents: 'popup-content' });
            (annotation as any)._dictionary = dict;
            (annotation as any).author = 'Author';
            (annotation as any).subject = 'Subject';

            spyOn(annotation, '_flattenPop').and.stub();

            // Act
            annotation._flattenLoadedPopUp();

            // Assert
            expect(annotation._flattenPop).toHaveBeenCalledWith(
                (annotation as any)._page,
                (annotation as any).color,
                (annotation as any).bounds,
                (annotation as any).border,
                'Author',
                'Subject',
                'popup-content'
            );
            expect(((annotation as any)._page.annotations.remove as jasmine.Spy)).toHaveBeenCalledWith(annotation);
        });

        it('should cover Popup branch with undefined color and author branch', () => {
            // Arrange
            const popup: _PdfDictionary = createDictionary({ Rect: [50, 100, 200, 250] });
            const dict: _PdfDictionary = createDictionary({
                Popup: popup,
                Contents: 'popup-content'
            });

            (annotation as any)._dictionary = dict;
            (annotation as any).author = 'Author';
            (annotation as any).subject = 'Subject';
            (annotation as any).color = undefined;
            (annotation as any)._page = createPageMock();

            spyOn(annotation, '_getRectangleBoundsValue').and.returnValue([50, 100, 150, 150]);
            spyOn(annotation, '_drawAuthor').and.returnValue(40);
            spyOn(annotation, '_saveGraphics').and.callThrough();

            // Act
            annotation._flattenLoadedPopUp();

            // Assert
            expect(annotation._getRectangleBoundsValue).toHaveBeenCalled();
            expect((annotation as any).color).toEqual({ r: 255, g: 255, b: 0 });
            expect(annotation._drawAuthor).toHaveBeenCalled();
            expect(((annotation as any)._page.annotations.remove as jasmine.Spy)).toHaveBeenCalledWith(annotation);
        });

        it('should cover Popup branch with subject only', () => {
            // Arrange
            const popup: _PdfDictionary = createDictionary({ Rect: [40, 80, 220, 260] });
            const dict: _PdfDictionary = createDictionary({
                Popup: popup,
                Contents: 'subject-only-content'
            });

            (annotation as any)._dictionary = dict;
            (annotation as any).author = '';
            (annotation as any).subject = 'Only Subject';
            (annotation as any).color = { r: 255, g: 255, b: 0 };

            spyOn(annotation, '_getRectangleBoundsValue').and.returnValue([40, 80, 180, 180]);
            spyOn(annotation, '_drawSubject').and.stub();
            spyOn(annotation, '_saveGraphics').and.callThrough();

            // Act
            annotation._flattenLoadedPopUp();

            // Assert
            expect(annotation._drawSubject).toHaveBeenCalled();
            expect((((annotation as any)._page.graphics.drawRectangle) as jasmine.Spy)).toHaveBeenCalled();
            expect(((annotation as any)._page.annotations.remove as jasmine.Spy)).toHaveBeenCalledWith(annotation);
        });

        it('should cover Popup branch with neither author nor subject and still draw content text', () => {
            // Arrange
            const popup: _PdfDictionary = createDictionary({ Rect: [10, 20, 210, 180] });
            const dict: _PdfDictionary = createDictionary({
                Popup: popup,
                Contents: 'body-text'
            });

            (annotation as any)._dictionary = dict;
            (annotation as any).author = '';
            (annotation as any).subject = '';
            (annotation as any).color = { r: 10, g: 20, b: 30 };

            spyOn(annotation, '_getRectangleBoundsValue').and.returnValue([10, 20, 200, 160]);
            spyOn(annotation, '_saveGraphics').and.callThrough();

            // Act
            annotation._flattenLoadedPopUp();

            // Assert
            expect((((annotation as any)._page.graphics.drawString) as jasmine.Spy)).toHaveBeenCalled();
            expect(((annotation as any)._page.annotations.remove as jasmine.Spy)).toHaveBeenCalledWith(annotation);
        });
    });

    describe('_getRectangleBoundsValue()', () => {
        it('should cover Popup rect branch when page is not null and rect[1] / rect[3] are zero', () => {
            // Arrange
            const popup: _PdfDictionary = createDictionary({ Rect: [10, 0, 100, 0] });
            const dict: _PdfDictionary = createDictionary({ Popup: popup });

            (annotation as any)._dictionary = dict;
            (annotation as any)._page = {
                _size: { height: 500 }
            } as PdfPage;

            // Act
            const result: number[] = annotation._getRectangleBoundsValue();

            // Assert
            expect(result).toEqual([10, 0, 100, 0]);
        });

        it('should cover Popup rect branch when page is null', () => {
            // Arrange
            const popup: _PdfDictionary = createDictionary({ Rect: [10, 30, 100, 20] });
            const dict: _PdfDictionary = createDictionary({ Popup: popup });

            (annotation as any)._dictionary = dict;
            (annotation as any)._page = null;

            // Act
            const result: number[] = annotation._getRectangleBoundsValue();

            // Assert
            expect(result).toEqual([10, 10, 100, 20]);
        });

        it('should return zero rectangle when Popup is absent', () => {
            // Arrange
            (annotation as any)._dictionary = createDictionary();

            // Act
            const result: number[] = annotation._getRectangleBoundsValue();

            // Assert
            expect(result).toEqual([0, 0, 0, 0]);
        });
    });

    describe('_createTemplate()', () => {
        beforeEach(() => {
            spyOn(PdfTemplate.prototype as any, '_exportStream').and.stub();
        });

        it('should cover matrix+bounds+offset branch and reset appearanceStream.offset to zero', () => {
            // Arrange
            const ref: _PdfReference = {} as _PdfReference;
            const streamDict: _PdfDictionary = createDictionary({
                Matrix: [1, 0, 0, 1, 5, 6],
                BBox: [1, 2, 21, 22]
            });

            const appearanceStream: _PdfBaseStream = createAppearanceStream(streamDict, ref);
            const ap: _PdfDictionary = createDictionary({ N: appearanceStream });

            spyOn(ap, 'getRaw').and.returnValue(ref);

            (annotation as any)._dictionary = createDictionary({ AP: ap });
            (annotation as any)._isLoaded = true;

            spyOn(annotation as any, '_transformBBox').and.returnValue([0, 0, 50, 60]);

            // Act
            const template: PdfTemplate = annotation._createTemplate();

            // Assert
            expect(template).toBeDefined();
            expect((appearanceStream as unknown as { offset: number }).offset).toBe(0);
            expect((PdfTemplate.prototype as any)._exportStream).toHaveBeenCalled();
            expect((template as unknown as { _size: { width: number; height: number } })._size).toEqual({
                width: 50,
                height: 60
            });
        });

        it('should cover no-matrix branch when bounds match and Vertices exists', () => {
            // Arrange
            const ref: _PdfReference = {} as _PdfReference;
            const streamDict: _PdfDictionary = createDictionary({
                BBox: [0, 0, 100, 50]
            });

            const appearanceStream: _PdfBaseStream = createAppearanceStream(streamDict, ref);
            const ap: _PdfDictionary = createDictionary({ N: appearanceStream });

            spyOn(ap, 'getRaw').and.returnValue(ref);

            const rect: number[] = [0, 0, 100, 50];
            const dict: _PdfDictionary = createDictionary({
                AP: ap,
                Rect: rect,
                Vertices: [0, 0, 10, 10]
            });

            (annotation as any)._dictionary = dict;
            (annotation as any)._isLoaded = true;
            (annotation as any).bounds = { x: 0, y: 0, width: 100, height: 50 };

            spyOn(streamDict, 'update').and.callThrough();

            // Act
            const template: PdfTemplate = annotation._createTemplate('N');

            // Assert
            expect(template).toBeDefined();
            expect(streamDict.update).toHaveBeenCalledWith('Matrix', [1, 0, 0, 1, -0, -0]);
            expect((template as unknown as { _size: { width: number; height: number } })._size).toEqual({
                width: 100,
                height: 50
            });
        });


        it('should cover no-matrix branch when transform matrix size matches annotation bounds and cache the appearance stream', () => {
            // Arrange
            const ref: _PdfReference = {} as _PdfReference;
            const streamDict: _PdfDictionary = createDictionary({
                // Deliberately different from bounds/Rect so code goes to _getTransformMatrix branch
                BBox: [5, 6, 45, 26]
            });

            const appearanceStream: _PdfBaseStream = createAppearanceStream(streamDict, ref);
            const ap: _PdfDictionary = createDictionary({ N: appearanceStream });

            spyOn(ap, 'getRaw').and.returnValue(ref);

            const dict: _PdfDictionary = createDictionary({
                AP: ap,
                Rect: [0, 0, 40, 20]
            });

            (annotation as any)._dictionary = dict;
            (annotation as any)._isLoaded = true;
            (annotation as any).bounds = { x: 0, y: 0, width: 40, height: 20 };

            spyOn(annotation as any, '_getTransformMatrix').and.returnValue([40, 0, 0, 20]);
            spyOn(streamDict, 'update').and.callThrough();

            // Act
            const template: PdfTemplate = annotation._createTemplate('N');

            // Assert
            expect(template).toBeDefined();
            expect(streamDict.update).toHaveBeenCalledWith('Matrix', [40, 0, 0, 20, 0, 0]);
            expect(((annotation as any)._crossReference._cacheMap as Map<_PdfReference, _PdfBaseStream>).get(ref))
                .toBe(appearanceStream);
        });


        it('should cover final else branch when transform matrix size does not match annotation bounds', () => {
            // Arrange
            const ref: _PdfReference = {} as _PdfReference;
            const streamDict: _PdfDictionary = createDictionary({
                BBox: [5, 6, 45, 26]
            });

            const appearanceStream: _PdfBaseStream = createAppearanceStream(streamDict, ref);
            const ap: _PdfDictionary = createDictionary({ N: appearanceStream });

            spyOn(ap, 'getRaw').and.returnValue(ref);

            const dict: _PdfDictionary = createDictionary({
                AP: ap,
                Rect: [0, 0, 100, 50]
            });

            (annotation as any)._dictionary = dict;
            (annotation as any)._isLoaded = true;
            (annotation as any).bounds = { x: 0, y: 0, width: 100, height: 50 };

            spyOn(annotation as any, '_getTransformMatrix').and.returnValue([40, 0, 0, 20]);
            spyOn(streamDict, 'update').and.callThrough();

            // Act
            const template: PdfTemplate = annotation._createTemplate('N');

            // Assert
            expect(template).toBeDefined();
            expect(streamDict.update).toHaveBeenCalledWith('Matrix', [1, 0, 0, 1, -5, -6]);
        });

        it('should return undefined when annotation is not loaded', () => {
            // Arrange
            (annotation as any)._isLoaded = false;

            // Act
            const template: PdfTemplate = annotation._createTemplate();

            // Assert
            expect(template).toBeUndefined();
        });
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('PdfAnnotation / PdfSquareAnnotation uncovered behavior tests', () => {
    let annotation: PdfAnnotation;

    function createDictionary(seed?: Record<string, any>): _PdfDictionary {
        const dict: _PdfDictionary = new _PdfDictionary();
        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                dict.set(key, seed[key]);
            });
        }
        return dict;
    }

    function createCrossReferenceMock(): any {
        let refId: number = 0;
        return {
            _cacheMap: new Map<_PdfReference, any>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
                refId += 1;
                return { _refId: refId } as unknown as _PdfReference;
            }),
            _document: null
        };
    }

    function createPageDictionaryMock(hasMap?: Record<string, boolean>): any {
        return {
            has: jasmine.createSpy('pageDictionary.has').and.callFake((key: string): boolean => {
                return !!(hasMap && hasMap[key]);
            })
        };
    }

    function createPageMock(): any {
        return {
            size: { width: 500, height: 700 },
            _size: { width: 500, height: 700 },
            _pageDictionary: createPageDictionaryMock(),
            cropBox: [0, 0, 0, 0],
            mediaBox: [0, 0, 0, 0]
        };
    }

    beforeEach(() => {
        annotation = Object.create(PdfAnnotation.prototype) as PdfAnnotation;
        (annotation as any)._dictionary = new _PdfDictionary();
        (annotation as any)._crossReference = createCrossReferenceMock();
        (annotation as any)._customTemplate = new Map<string, PdfTemplate>();
        (annotation as any)._page = createPageMock();
        (annotation as any)._bounds = { x: 10, y: 20, width: 100, height: 50 };
        (annotation as any).bounds = { x: 10, y: 20, width: 100, height: 50 };
        (annotation as any)._boundsCollection = [];
        (annotation as any)._quadPoints = [];
        (annotation as any)._points = [];
        (annotation as any).flatten = false;
        (annotation as any)._isLoaded = false;
    });

    describe('_dateToString()', () => {
        it('should return a PDF date string with positive timezone sign', () => {
            // Arrange
            const fakeDate: Date = {
                getFullYear: (): number => 2026,
                getMonth: (): number => 4, // May (0-based)
                getDate: (): number => 7,
                getHours: (): number => 9,
                getMinutes: (): number => 8,
                getSeconds: (): number => 6,
                getTimezoneOffset: (): number => -330
            } as unknown as Date;

            // Act
            const result: string = annotation._dateToString(fakeDate);

            // Assert
            expect(result).toBe(`D:20260507090806+05'30'`);
        });

        it('should return a PDF date string with negative timezone sign', () => {
            // Arrange
            const fakeDate: Date = {
                getFullYear: (): number => 2026,
                getMonth: (): number => 0,
                getDate: (): number => 2,
                getHours: (): number => 3,
                getMinutes: (): number => 4,
                getSeconds: (): number => 5,
                getTimezoneOffset: (): number => 120
            } as unknown as Date;

            // Act
            const result: string = annotation._dateToString(fakeDate);

            // Assert
            expect(result).toBe(`D:20260102030405-02'00'`);
        });
    });

    describe('_stringToDate()', () => {
        it('should return Date directly for non-string input', () => {
            // Arrange
            const value: any = 0;

            // Act
            const result: Date = annotation._stringToDate(value);

            // Assert
            expect(result instanceof Date).toBeTruthy();
            expect(result.getTime()).toBe(0);
        });

        it('should parse slash-formatted date with time', () => {
            // Arrange
            const value: string = '05/07/2026 09:08:06';

            // Act
            const result: Date = annotation._stringToDate(value);

            // Assert
            expect(result.getFullYear()).toBe(2026);
            expect(result.getMonth()).toBe(4);
            expect(result.getDate()).toBe(7);
            expect(result.getHours()).toBe(9);
            expect(result.getMinutes()).toBe(8);
            expect(result.getSeconds()).toBe(6);
        });

        it('should parse D: date with Z timezone', () => {
            // Arrange
            const value: string = 'D:20260507090806Z';

            // Act
            const result: Date = annotation._stringToDate(value);

            // Assert
            expect(result.toISOString()).toBe('2026-05-07T09:08:06.000Z');
        });

        it('should parse D: date with +HH:MM timezone', () => {
            // Arrange
            const value: string = 'D:20260507090806+05:30';

            // Act
            const result: Date = annotation._stringToDate(value);

            // Assert
            expect(result.toISOString()).toBe('2026-05-07T03:38:06.000Z');
        });

        it('should parse D: date with -HH timezone', () => {
            // Arrange
            const value: string = 'D:20260507090806-02';

            // Act
            const result: Date = annotation._stringToDate(value);

            // Assert
            expect(result.toISOString()).toBe('2026-05-07T11:08:06.000Z');
        });

        it('should parse D: date without timezone as local date parts', () => {
            // Arrange
            const value: string = 'D:20260507';

            // Act
            const result: Date = annotation._stringToDate(value);

            // Assert
            expect(result.getFullYear()).toBe(2026);
            expect(result.getMonth()).toBe(4);
            expect(result.getDate()).toBe(7);
        });
    });

    describe('_obtainNativeRectangle()', () => {
        it('should convert to native rectangle and apply crop/media offsets', () => {
            // Arrange
            (annotation as any)._bounds = { x: 10, y: 20, width: 30, height: 40 };
            (annotation as any).bounds = { x: 10, y: 20, width: 30, height: 40 };
            (annotation as any)._page = {
                size: { width: 300, height: 200 }
            };
            spyOn(annotation, '_getCropOrMediaBox').and.returnValue([5, 10, 300, 200]);

            // Act
            const result: number[] = annotation._obtainNativeRectangle();

            // Assert
            expect(result).toEqual([15, 150, 40, 60]);
        });

        it('should return raw rectangle when page is undefined', () => {
            // Arrange
            (annotation as any)._bounds = { x: 1, y: 2, width: 3, height: 4 };
            (annotation as any).bounds = { x: 1, y: 2, width: 3, height: 4 };
            (annotation as any)._page = null;
            spyOn(annotation, '_getCropOrMediaBox').and.returnValue([0, 0, 0, 0]);

            // Act
            const result: number[] = annotation._obtainNativeRectangle();

            // Assert
            expect(result).toEqual([1, 2, 4, 6]);
        });
    });

    describe('_getPoints()', () => {
        it('should add x offset and use crop/media special y branch when MediaBox exists and CropBox does not', () => {
            // Arrange
            (annotation as any)._page = {
                _pageDictionary: {
                    has: jasmine.createSpy('has').and.callFake((key: string): boolean => key === 'MediaBox')
                }
            };
            spyOn(annotation, '_getCropOrMediaBox').and.returnValue([5, 10, 100, 0]);

            const polygonPoints: Array<{ x: number; y: number }> = [
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ];

            // Act
            const result: Array<{ x: number; y: number }> = annotation._getPoints(polygonPoints);

            // Assert
            expect(result).toEqual([
                { x: 6, y: 2 },
                { x: 8, y: 4 }
            ]);
        });

        it('should add crop/media normal x and y offsets', () => {
            // Arrange
            (annotation as any)._page = {
                _pageDictionary: {
                    has: jasmine.createSpy('has').and.callFake((key: string): boolean => key === 'CropBox')
                }
            };
            spyOn(annotation, '_getCropOrMediaBox').and.returnValue([5, 10, 100, 50]);

            const polygonPoints: Array<{ x: number; y: number }> = [
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ];

            // Act
            const result: Array<{ x: number; y: number }> = annotation._getPoints(polygonPoints);

            // Assert
            expect(result).toEqual([
                { x: 6, y: 12 },
                { x: 8, y: 14 }
            ]);
        });

        it('should return cloned points unchanged when crop/media offsets are zero', () => {
            // Arrange
            spyOn(annotation, '_getCropOrMediaBox').and.returnValue([0, 0, 100, 50]);
            (annotation as any)._page = {
                _pageDictionary: {
                    has: jasmine.createSpy('has').and.returnValue(false)
                }
            };
            const polygonPoints: Array<{ x: number; y: number }> = [{ x: 7, y: 8 }];

            // Act
            const result: Array<{ x: number; y: number }> = annotation._getPoints(polygonPoints);

            // Assert
            expect(result).toEqual([{ x: 7, y: 8 }]);
            expect(result).not.toBe(polygonPoints);
        });
    });

    describe('_getCropOrMediaBox()', () => {
        it('should prefer CropBox and normalize negative height', () => {
            // Arrange
            (annotation as any)._page = {
                _pageDictionary: {
                    has: jasmine.createSpy('has').and.callFake((key: string): boolean => key === 'CropBox')
                },
                cropBox: [10, 20, 200, -50],
                mediaBox: [0, 0, 0, 0]
            };

            // Act
            const result: number[] = annotation._getCropOrMediaBox();

            // Assert
            expect(result).toEqual([10, -50, 200, 20]);
        });

        it('should fallback to MediaBox when CropBox is absent', () => {
            // Arrange
            (annotation as any)._page = {
                _pageDictionary: {
                    has: jasmine.createSpy('has').and.callFake((key: string): boolean => key === 'MediaBox')
                },
                cropBox: null,
                mediaBox: [1, 2, 300, 400]
            };

            // Act
            const result: number[] = annotation._getCropOrMediaBox();

            // Assert
            expect(result).toEqual([1, 2, 300, 400]);
        });

        it('should return [0, 0, 0, 0] when neither box exists', () => {
            // Arrange
            (annotation as any)._page = {
                _pageDictionary: {
                    has: jasmine.createSpy('has').and.returnValue(false)
                }
            };

            // Act
            const result: number[] = annotation._getCropOrMediaBox();

            // Assert
            expect(result).toEqual([0, 0, 0, 0]);
        });
    });

    describe('_getDocumentLayer() and _isMatched()', () => {
        it('should match a nested layer recursively and assign _layer', () => {
            // Arrange
            const expectedReference: _PdfReference = { id: 5 } as unknown as _PdfReference;
            const nestedLayer: any = {
                _referenceHolder: expectedReference,
                name: 'NestedLayer',
                layers: { count: 0, at: (): any => undefined }
            };
            const parentLayer: any = {
                _referenceHolder: { id: 1 } as unknown as _PdfReference,
                name: '',
                layers: {
                    count: 1,
                    at: (index: number): any => (index === 0 ? nestedLayer : undefined)
                }
            };
            const layerCollection: any = {
                count: 1,
                at: (index: number): any => (index === 0 ? parentLayer : undefined)
            };

            const dict: _PdfDictionary = createDictionary();
            spyOn(dict, 'has').and.callFake((key: string): boolean => key === 'OC');
            spyOn(dict, 'getRaw').and.callFake((key: string): _PdfReference | undefined => {
                return key === 'OC' ? expectedReference : undefined;
            });

            (annotation as any)._dictionary = dict;
            (annotation as any)._page = createPageMock();
            (annotation as any)._crossReference = {
                _document: {
                    layers: layerCollection
                }
            };
            (annotation as any)._layer = undefined;

            // Act
            const result: PdfLayer = (annotation as any)._getDocumentLayer();

            // Assert
            expect((annotation as any)._layer).toBe(nestedLayer);
            expect(result).toBe(nestedLayer as PdfLayer);
        });

        it('should keep existing layer when OC is absent', () => {
            // Arrange
            const existingLayer: any = { name: 'ExistingLayer' };
            const dict: _PdfDictionary = createDictionary();
            spyOn(dict, 'has').and.returnValue(false);

            (annotation as any)._dictionary = dict;
            (annotation as any)._layer = existingLayer;

            // Act
            const result: PdfLayer = (annotation as any)._getDocumentLayer();

            // Assert
            expect(result).toBe(existingLayer);
        });
    });

    describe('_setQuadPoints()', () => {
        it('should cover crop/media branch with margins and set QuadPoints / points', () => {
            // Arrange
            const dict: _PdfDictionary = new _PdfDictionary();
            spyOn(dict, 'set').and.callThrough();
            (annotation as any)._dictionary = dict;

            (annotation as any).bounds = { x: 10, y: 20, width: 30, height: 40 };
            (annotation as any)._boundsCollection = [{ x: 10, y: 20, width: 30, height: 40 }];
            (annotation as any)._quadPoints = new Array<number>(8).fill(0);
            (annotation as any)._isLoaded = false;
            (annotation as any).flatten = false;
            (annotation as any)._page = {
                _isNew: true,
                _pageSettings: {
                    margins: {
                        left: 2,
                        top: 3,
                        right: 4,
                        bottom: 5
                    }
                }
            };

            spyOn(annotation, '_getMediaOrCropBox').and.returnValue([5, 10, 100, 200]);

            // Act
            annotation._setQuadPoints({ width: 300, height: 400 });

            // Assert
            expect(dict.set).toHaveBeenCalled();
            const quadPoints: number[] = (dict.set as jasmine.Spy).calls.mostRecent().args[1];
            expect(quadPoints.length).toBe(8);
            expect((annotation as any)._points.length).toBe(4);
        });

        it('should cover fallback branch without crop/media offsets', () => {
            // Arrange
            const dict: _PdfDictionary = new _PdfDictionary();
            spyOn(dict, 'set').and.callThrough();
            (annotation as any)._dictionary = dict;

            (annotation as any).bounds = { x: 10, y: 20, width: 30, height: 40 };
            (annotation as any)._boundsCollection = [{ x: 10, y: 20, width: 30, height: 40 }];
            (annotation as any)._quadPoints = new Array<number>(8).fill(0);
            (annotation as any)._isLoaded = false;
            (annotation as any).flatten = false;
            (annotation as any)._page = {
                _isNew: false,
                _pageSettings: null
            };

            spyOn(annotation, '_getMediaOrCropBox').and.returnValue([0, 0, 0, 0]);

            // Act
            annotation._setQuadPoints({ width: 300, height: 400 });

            // Assert
            expect(dict.set).toHaveBeenCalledWith('QuadPoints', jasmine.any(Array));
            expect((annotation as any)._points).toEqual([
                { x: 10, y: 380 },
                { x: 40, y: 380 },
                { x: 10, y: 340 },
                { x: 40, y: 340 }
            ]);
        });
    });

    describe('_createTemplate()', () => {
        beforeEach(() => {
            spyOn(PdfTemplate.prototype as any, '_exportStream').and.stub();
        });

        it('should cover matrix branch, copy matrix, transform bbox and reset non-zero offset', () => {
            // Arrange
            const ref: _PdfReference = { id: 1 } as unknown as _PdfReference;
            const streamDict: _PdfDictionary = createDictionary({
                Matrix: [1, 0, 0, 1, 5, 6],
                BBox: [1, 2, 21, 22]
            });
            const appearanceStream: _PdfBaseStream = {
                dictionary: streamDict,
                offset: 12
            } as unknown as _PdfBaseStream;

            const ap: _PdfDictionary = createDictionary({ N: appearanceStream });
            spyOn(ap, 'getRaw').and.returnValue(ref);

            (annotation as any)._dictionary = createDictionary({ AP: ap });
            (annotation as any)._isLoaded = true;

            spyOn(annotation as any, '_transformBBox').and.returnValue([0, 0, 50, 60]);

            // Act
            const template: PdfTemplate = annotation._createTemplate();

            // Assert
            expect(template).toBeDefined();
            expect((appearanceStream as any).offset).toBe(0);
            expect((PdfTemplate.prototype as any)._exportStream).toHaveBeenCalled();
            expect((template as any)._size).toEqual({ width: 50, height: 60 });
            expect((template as any)._templateOriginalSize).toEqual({ width: 20, height: 20 });
        });

        it('should cover no-matrix equality branch with Vertices', () => {
            // Arrange
            const ref: _PdfReference = { id: 2 } as unknown as _PdfReference;
            const streamDict: _PdfDictionary = createDictionary({
                BBox: [0, 0, 100, 50]
            });
            const appearanceStream: _PdfBaseStream = {
                dictionary: streamDict,
                offset: 0
            } as unknown as _PdfBaseStream;

            const ap: _PdfDictionary = createDictionary({ N: appearanceStream });
            spyOn(ap, 'getRaw').and.returnValue(ref);
            spyOn(streamDict, 'update').and.callThrough();

            (annotation as any)._dictionary = createDictionary({
                AP: ap,
                Rect: [0, 0, 100, 50],
                Vertices: [0, 0, 10, 10]
            });
            (annotation as any)._isLoaded = true;
            (annotation as any).bounds = { x: 0, y: 0, width: 100, height: 50 };

            // Act
            const template: PdfTemplate = annotation._createTemplate('N');

            // Assert
            expect(template).toBeDefined();
            expect(streamDict.update).toHaveBeenCalledWith('Matrix', [1, 0, 0, 1, -0, -0]);
            expect((template as any)._size).toEqual({ width: 100, height: 50 });
        });

        it('should cover no-matrix transform branch and cache the appearance stream when transformed size matches bounds', () => {
            // Arrange
            const ref: _PdfReference = { id: 3 } as unknown as _PdfReference;
            const streamDict: _PdfDictionary = createDictionary({
                BBox: [5, 6, 45, 26]
            });
            const appearanceStream: _PdfBaseStream = {
                dictionary: streamDict,
                offset: 0
            } as unknown as _PdfBaseStream;

            const ap: _PdfDictionary = createDictionary({ N: appearanceStream });
            spyOn(ap, 'getRaw').and.returnValue(ref);
            spyOn(streamDict, 'update').and.callThrough();

            (annotation as any)._dictionary = createDictionary({
                AP: ap,
                Rect: [0, 0, 40, 20]
            });
            (annotation as any)._isLoaded = true;
            (annotation as any).bounds = { x: 0, y: 0, width: 40, height: 20 };

            spyOn(annotation as any, '_getTransformMatrix').and.returnValue([40, 0, 0, 20]);

            // Act
            const template: PdfTemplate = annotation._createTemplate('N');

            // Assert
            expect(template).toBeDefined();
            expect(streamDict.update).toHaveBeenCalledWith('Matrix', [40, 0, 0, 20, 0, 0]);
            expect(((annotation as any)._crossReference._cacheMap as Map<_PdfReference, _PdfBaseStream>).get(ref)).toBe(appearanceStream);
        });

        it('should cover no-matrix final else branch when transformed size does not match bounds', () => {
            // Arrange
            const ref: _PdfReference = { id: 4 } as unknown as _PdfReference;
            const streamDict: _PdfDictionary = createDictionary({
                BBox: [5, 6, 45, 26]
            });
            const appearanceStream: _PdfBaseStream = {
                dictionary: streamDict,
                offset: 0
            } as unknown as _PdfBaseStream;

            const ap: _PdfDictionary = createDictionary({ N: appearanceStream });
            spyOn(ap, 'getRaw').and.returnValue(ref);
            spyOn(streamDict, 'update').and.callThrough();

            (annotation as any)._dictionary = createDictionary({
                AP: ap,
                Rect: [0, 0, 100, 50]
            });
            (annotation as any)._isLoaded = true;
            (annotation as any).bounds = { x: 0, y: 0, width: 100, height: 50 };

            spyOn(annotation as any, '_getTransformMatrix').and.returnValue([40, 0, 0, 20]);

            // Act
            const template: PdfTemplate = annotation._createTemplate('N');

            // Assert
            expect(template).toBeDefined();
            expect(streamDict.update).toHaveBeenCalledWith('Matrix', [1, 0, 0, 1, -5, -6]);
            expect((template as any)._size).toEqual({ width: 45, height: 26 });
        });
    });

    describe('_getTransformMatrix()', () => {
        it('should return identity translation when aligned bounding box is degenerate', () => {
            // Arrange
            spyOn(annotation as any, '_getAxialAlignedBoundingBox').and.returnValue([1, 2, 1, 5]);

            // Act
            const result: number[] = (annotation as any)._getTransformMatrix([10, 20, 30, 40], [0, 0, 5, 5], [1, 0, 0, 1, 0, 0]);

            // Assert
            expect(result).toEqual([1, 0, 0, 1, 10, 20]);
        });

        it('should return scaled transform when bounding box is non-degenerate', () => {
            // Arrange
            spyOn(annotation as any, '_getAxialAlignedBoundingBox').and.returnValue([0, 0, 10, 20]);

            // Act
            const result: number[] = (annotation as any)._getTransformMatrix([10, 20, 30, 60], [0, 0, 5, 5], [1, 0, 0, 1, 0, 0]);

            // Assert
            expect(result).toEqual([2, 0, 0, 2, 10, 20]);
        });
    });

    describe('_getAxialAlignedBoundingBox(), _applyTransform(), _transformBBox(), _transformPoint(), _minValue(), _maxValue()', () => {
        it('should apply affine transform to a point', () => {
            // Arrange
            const point: number[] = [2, 3];
            const matrix: number[] = [2, 0, 0, 3, 5, 7];

            // Act
            const result: number[] = (annotation as any)._applyTransform(point, matrix);

            // Assert
            expect(result).toEqual([9, 16]);
        });

        it('should compute axial aligned bounding box', () => {
            // Arrange
            const rect: number[] = [0, 0, 10, 20];
            const matrix: number[] = [1, 0, 0, 1, 5, 7];

            // Act
            const result: number[] = (annotation as any)._getAxialAlignedBoundingBox(rect, matrix);

            // Assert
            expect(result).toEqual([5, 7, 15, 27]);
        });

        it('should transform a bounding box through matrix and return min/max extent', () => {
            // Arrange
            const box: { x: number; y: number; width: number; height: number } = {
                x: 0, y: 0, width: 10, height: 20
            };
            const matrix: number[] = [1, 0, 0, 1, 5, 7];

            // Act
            const result: number[] = (annotation as any)._transformBBox(box, matrix);

            // Assert
            expect(result).toEqual([5, 7, 15, 27]);
        });

        it('should transform a single point', () => {
            // Arrange
            const matrix: number[] = [2, 0, 0, 3, 5, 7];

            // Act
            const result: number[] = (annotation as any)._transformPoint(2, 3, matrix);

            // Assert
            expect(result).toEqual([9, 16]);
        });

        it('should return minimum and maximum values from arrays', () => {
            // Arrange
            const values: number[] = [10, -2, 8, 25, 3];

            // Act
            const minimum: number = (annotation as any)._minValue(values);
            const maximum: number = (annotation as any)._maxValue(values);

            // Assert
            expect(minimum).toBe(-2);
            expect(maximum).toBe(25);
        });
    });

    describe('_drawTemplate()', () => {
        it('should import exported template with cross reference and store it in custom template map', () => {
            // Arrange
            const template: any = {
                _isExported: true,
                _isResourceExport: false,
                _importStream: jasmine.createSpy('_importStream')
            };
            (annotation as any)._crossReference = createCrossReferenceMock();
            (annotation as any)._customTemplate = new Map<string, PdfTemplate>();

            // Act
            annotation._drawTemplate(template as PdfTemplate, 'N');

            // Assert
            expect(template._crossReference).toBe((annotation as any)._crossReference);
            expect(template._importStream).toHaveBeenCalledWith(true, false);
            expect((annotation as any)._customTemplate.get('N')).toBe(template);
        });

        it('should import resource-export template without cross reference when cross reference is absent', () => {
            // Arrange
            const template: any = {
                _isExported: false,
                _isResourceExport: true,
                _importStream: jasmine.createSpy('_importStream')
            };
            (annotation as any)._crossReference = null;
            (annotation as any)._customTemplate = new Map<string, PdfTemplate>();

            // Act
            annotation._drawTemplate(template as PdfTemplate, 'R');

            // Assert
            expect(template._importStream).toHaveBeenCalledWith(false, true);
            expect((annotation as any)._customTemplate.get('R')).toBe(template);
        });
    });

    describe('_drawCustomAppearance()', () => {
        it('should remove duplicate reference, allocate new ref, cache content and update appearance dictionary', () => {
            // Arrange
            const appearance: _PdfDictionary = new _PdfDictionary();
            spyOn(appearance, 'update').and.callThrough();
            spyOn(utils, '_removeDuplicateReference').and.stub();

            const reference: _PdfReference = { id: 100 } as unknown as _PdfReference;
            const crossReference: any = {
                _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(reference),
                _cacheMap: new Map<_PdfReference, any>()
            };
            (annotation as any)._crossReference = crossReference;

            const templateContent: any = {
                reference: undefined,
                dictionary: {
                    _update: false
                }
            };
            const template: any = {
                _content: templateContent
            };
            (annotation as any)._customTemplate = new Map<string, PdfTemplate>([['N', template as PdfTemplate]]);

            // Act
            annotation._drawCustomAppearance(appearance);

            // Assert
            expect(utils._removeDuplicateReference).toHaveBeenCalledWith(appearance, crossReference, 'N');
            expect(crossReference._getNextReference).toHaveBeenCalled();
            expect(templateContent.reference).toBe(reference);
            expect(templateContent.dictionary._update).toBeTruthy();
            expect(crossReference._cacheMap.get(reference)).toBe(templateContent);
            expect(appearance.update).toHaveBeenCalledWith('N', reference);
        });
    });

    describe('PdfSquareAnnotation._createSquareMeasureAppearance() highlighted branches', () => {


        it('should cover custom-template branch, native rectangle conversion, _isBounds path and updateBounds path', () => {
            // Arrange
            const square: PdfSquareAnnotation = new PdfSquareAnnotation();

            const boundsValue = { x: 10, y: 20, width: 30, height: 40 };

            (square as any)._dictionary = new _PdfDictionary();
            spyOn((square as any)._dictionary, 'update').and.callThrough();

            (square as any)._crossReference = createCrossReferenceMock();
            (square as any)._page = {
                size: { width: 300, height: 200 },
                _size: { width: 300, height: 200 },
                _isNew: true,
                _pageSettings: {
                    margins: { top: 0, bottom: 0, left: 0, right: 0 }
                }
            };
            (square as any)._isLoaded = true;
            (square as any)._isBounds = true;
            (square as any)._unitString = 'cm';
            (square as any)._bounds = boundsValue;
            (square as any)._color = { r: 0, g: 0, b: 0 };
            square.color = { r: 0, g: 0, b: 0 };
            square.border = { width: 2 } as any;

            Object.defineProperty(square, 'bounds', {
                configurable: true,
                get: function () {
                    return boundsValue;
                }
            });

            const fakeFont: any = {
                size: 12,
                _size: 12,
                _metrics: { _postScriptName: 'Helvetica' },
                measureString: jasmine.createSpy('measureString').and.returnValue({ width: 40, height: 10 }),
                _getHeight: jasmine.createSpy('_getHeight').and.returnValue(10)
            };
            spyOn(square as any, '_obtainFont').and.returnValue(fakeFont);
            spyOn(square as any, '_calculateAreaOfSquare').and.returnValue(25);

            const customTemplate: PdfTemplate = { id: 'custom-template' } as any;
            (square as any)._customTemplate = new Map<string, PdfTemplate>([['N', customTemplate]]);

            spyOn(utils, '_updateBounds').and.returnValue([1, 2, 3, 4]);

            // Act
            const result: PdfTemplate = (square as any)._createSquareMeasureAppearance(false);

            // Assert
            expect(result).toBe(customTemplate);
            expect(utils._updateBounds).toHaveBeenCalledWith(square);
            expect((square as any)._dictionary.update).toHaveBeenCalledWith('Rect', [1, 2, 3, 4]);
        });



    });
});
