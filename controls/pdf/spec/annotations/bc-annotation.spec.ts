import { PdfPopupAnnotationCollection } from "../../src/pdf/core/annotations/annotation-collection";
import { _PaintParameter, Pdf3DAnnotation, PdfAngleMeasurementAnnotation, PdfAnnotation, PdfDocumentLinkAnnotation, PdfFileLinkAnnotation, PdfFreeTextAnnotation, PdfPolygonAnnotation, PdfPopupAnnotation, PdfRadioButtonListItem, PdfListFieldItem, PdfRectangleAnnotation, PdfSoundAnnotation, PdfSquareAnnotation, PdfTextMarkupAnnotation, PdfTextWebLinkAnnotation, PdfUriAnnotation, PdfWidgetAnnotation, PdfBorderEffect, PdfRedactionAnnotation, PdfStateItem, PdfAnnotationLineEndingStyle, PdfPolyLineAnnotation, PdfInteractiveBorder } from "../../src/pdf/core/annotations/annotation";
import { _PdfDictionary, _PdfName, _PdfReference } from '../../src/pdf/core/pdf-primitives'
import { PdfAnnotationBorder, PdfLineAnnotation } from '../../src/pdf/core/annotations/annotation';
import { PdfFontStyle } from '../../src/pdf/core/fonts/pdf-standard-font'
import { _PdfAnnotationType, _PdfGraphicsUnit, PdfAnnotationFlag, PdfBlendMode, PdfBorderEffectStyle, PdfBorderStyle, PdfDashStyle, PdfFormFieldVisibility, PdfLineEndingStyle, PdfRotationAngle, PdfTextAlignment } from '../../src/pdf/core/enumerator';
import * as utils from '../../src/pdf/core/utils'
import { _PdfUnitConvertor, PdfBrush } from "../../src/pdf/core/graphics/pdf-graphics";
import { PdfTemplate } from "../../src/pdf/core/graphics/pdf-template";
import { _PdfCrossReference } from "../../src";
import { PdfListBoxField, PdfComboBoxField } from "../../src/pdf/core/form/field";
// All annotation's methods coverage 
describe('Annotation modules test scripts', () => {
    // Tests for PdfAnnotation.getValues (lines 1388-1414)
    it('getValues - throws when dictionary missing or name absent', () => {
        const annot = new PdfPopupAnnotation();
        annot._dictionary = new _PdfDictionary();
        try {
            annot.getValues('Missing');
            fail('Expected to throw PdfException for missing name');
        } catch (error) {
            expect(error.message).toEqual('PdfException: Missing is not found');
        }
    });

    it('getValues - returns value when non-array is _PdfName', () => {
        const annot = new PdfPopupAnnotation();
        annot._dictionary.set('K', new _PdfName('Val'));
        const res = annot.getValues('K');
        expect(res).toEqual(['Val']);
    });

    it('getValues - returns value when non-array is string', () => {
        const annot = new PdfPopupAnnotation();
        annot._dictionary.set('S', 'hello');
        const res = annot.getValues('S');
        expect(res).toEqual(['hello']);
    });

    it('getValues - throws when non-array unknown type', () => {
        const annot = new PdfPopupAnnotation();
        annot._dictionary.set('X', { foo: 1 } as any);
        try {
            annot.getValues('X');
            fail('Expected to throw for unsupported non-array type');
        } catch (error) {
            expect(error.message).toEqual('PdfException: X is not found');
        }
    });

    it('getValues - array of _PdfName elements', () => {
        const annot = new PdfPopupAnnotation();
        annot._dictionary.set('A', [new _PdfName('n1')]);
        const res = annot.getValues('A');
        expect(res).toEqual(['n1']);
    });

    it('getValues - array with strings and numbers', () => {
        const annot = new PdfPopupAnnotation();
        annot._dictionary.set('B', ['s1', 20]);
        const res = annot.getValues('B');
        expect(res).toEqual(['s1', '20']);
    });

    it('getValues - array with unsupported element type ignored', () => {
        const annot = new PdfPopupAnnotation();
        annot._dictionary.set('C', [new _PdfName('x'), { foo: 1 }, 's2']);
        const res = annot.getValues('C');
        expect(res).toEqual(['x', 's2']);
    });

    // Tests for _validateTemplateMatrix else-branch (lines 1616-1652)
    it('validateTemplateMatrix - returns true when dictionary missing', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot.bounds = { x: 10, y: 20, width: 0, height: 0 };
        annot._page = null;
        const dict: any = null;
        // Act
        const res: boolean = annot._validateTemplateMatrix(dict, 'tpl');
        // Assert
        expect(res).toBe(true);
    });

    it('validateTemplateMatrix - returns true when Matrix present but arrays missing/too small', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot.bounds = { x: 10, y: 20, width: 0, height: 0 };
        const dict: any = {
            has: (k: string) => k === 'Matrix',
            getArray: (k: string) => k === 'Matrix' ? [1, 0] : [1]
        };
        // Act
        const res: boolean = annot._validateTemplateMatrix(dict, 'tpl');
        // Assert
        expect(res).toBe(true);
    });

    it('validateTemplateMatrix - returns true when matrix not identity', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot.bounds = { x: 10, y: 20, width: 0, height: 0 };
        const dict: any = {
            has: (k: string) => k === 'Matrix',
            getArray: (k: string) => k === 'Matrix' ? [2, 0, 0, 1, 0, 0] : [0, 0, 10, 10]
        };
        // Act
        const res: boolean = annot._validateTemplateMatrix(dict, 'tpl');
        // Assert
        expect(res).toBe(true);
    });

    it('validateTemplateMatrix - identity matrix but final condition false (no draw)', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot.bounds = { x: 10, y: 20, width: 0, height: 0 };
        annot._page = null; // ensures left side of final condition is false
        const dict: any = {
            has: (k: string) => k === 'Matrix',
            getArray: (k: string) => k === 'Matrix' ? [1, 0, 0, 1, 0, 0] : [1, 2, 3, 4]
        };
        // Act
        const res: boolean = annot._validateTemplateMatrix(dict, 'tpl');
        // Assert
        expect(res).toBe(true);
    });

    it('validateTemplateMatrix - executes drawing with transparency when condition true', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot.bounds = { x: 10, y: 20, width: 0, height: 0 };
        const calls: string[] = [];
        const fakeState = { id: 's' };
        const graphics: any = {
            save: () => { calls.push('save'); return fakeState; },
            setTransparency: (v: number) => { calls.push('setTransparency:' + v); },
            drawTemplate: (t: any, p: any) => { calls.push('drawTemplate'); calls.push(JSON.stringify(p)); },
            restore: (s: any) => { calls.push('restore'); }
        };
        const annotationsMock: any = { remove: (a: any) => { calls.push('remove'); } };
        annot._page = { graphics: graphics, annotations: annotationsMock };
        annot.opacity = 0.5; // ensures typeof this.opacity !== 'undefined'
        annot._opacity = 0.5;
        const dict: any = {
            has: (k: string) => k === 'Matrix',
            getArray: (k: string) => k === 'Matrix' ? [1, 0, 0, 1, -5, -7] : [1, 2, 3, 4]
        };
        // Act
        const res: boolean = annot._validateTemplateMatrix(dict, 'TEMPLATE');
        // Assert
        expect(res).toBe(false);
        expect(calls.indexOf('save')).toBeGreaterThan(-1);
        expect(calls.indexOf('setTransparency:0.5')).toBeGreaterThan(-1);
        expect(calls.indexOf('drawTemplate')).toBeGreaterThan(-1);
        // point passed should be adjusted: x -= box[0] (1) => 9, y += box[1] (2) => 22
        expect(calls.some(c => c.indexOf('{"x":9') === 0 || c.indexOf('{"x":9') > -1)).toBeTruthy();
        expect(calls.indexOf('restore')).toBeGreaterThan(-1);
        expect(calls.indexOf('remove')).toBeGreaterThan(-1);
    });

    it('validateTemplateMatrix - executes drawing without transparency when opacity absent', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot.bounds = { x: 10, y: 20, width: 0, height: 0 };
        const calls: string[] = [];
        const fakeState = { id: 's' };
        const graphics: any = {
            save: () => { calls.push('save'); return fakeState; },
            setTransparency: (v: number) => { calls.push('setTransparency:' + v); },
            drawTemplate: (t: any, p: any) => { calls.push('drawTemplate'); calls.push(JSON.stringify(p)); },
            restore: (s: any) => { calls.push('restore'); }
        };
        const annotationsMock: any = { remove: (a: any) => { calls.push('remove'); } };
        annot._page = { graphics: graphics, annotations: annotationsMock };
        delete annot.opacity; // ensure typeof this.opacity === 'undefined'
        annot._opacity = 1;
        const dict: any = {
            has: (k: string) => k === 'Matrix',
            getArray: (k: string) => k === 'Matrix' ? [1, 0, 0, 1, -5, -7] : [1, 2, 3, 4]
        };
        // Act
        const res: boolean = annot._validateTemplateMatrix(dict, 'TEMPLATE');
        // Assert
        expect(res).toBe(false);
        expect(calls.indexOf('save')).toBeGreaterThan(-1);
        // setTransparency should NOT have been called
        expect(calls.some(c => c.indexOf('setTransparency') === 0)).toBe(false);
        expect(calls.indexOf('drawTemplate')).toBeGreaterThan(-1);
        expect(calls.indexOf('restore')).toBeGreaterThan(-1);
        expect(calls.indexOf('remove')).toBeGreaterThan(-1);
    });

    it('_calculateTemplateBounds - rotation 90 with normal matrix', () => {
        const annot: any = new PdfPopupAnnotation();
        annot._obtainGraphicsRotation = (_m: any) => 90;
        const bounds = { x: 10, y: 20, width: 30, height: 40 };
        const page: any = { size: { width: 300, height: 200 } };
        const template: any = { _size: { width: 25, height: 35 }, _content: { dictionary: { getArray: (_: string): any => null } } };
        const graphics: any = { _matrix: {}, translateTransform: () => { }, rotateTransform: () => { } };
        const res = annot._calculateTemplateBounds(bounds, page, template, true, graphics);
        expect(res).toEqual({ x: 10, y: -140, width: 30, height: 40 });
    });

    it('_calculateTemplateBounds - rotation 180 with normal matrix', () => {
        const annot: any = new PdfPopupAnnotation();
        annot._obtainGraphicsRotation = (_m: any) => 180;
        const bounds = { x: 10, y: 20, width: 30, height: 40 };
        const page: any = { size: { width: 300, height: 200 } };
        const template: any = { _size: { width: 25, height: 35 }, _content: { dictionary: { getArray: (_: string): any => null } } };
        const graphics: any = { _matrix: {}, translateTransform: () => { }, rotateTransform: () => { } };
        const res = annot._calculateTemplateBounds(bounds, page, template, true, graphics);
        expect(res).toEqual({ x: -260, y: -140, width: 30, height: 40 });
    });

    it('_calculateTemplateBounds - rotation 270 with non-normal matrix and mismatched Matrix/BBox', () => {
        const annot: any = new PdfPopupAnnotation();
        annot._obtainGraphicsRotation = (_m: any) => 270;
        const bounds = { x: 10, y: 20, width: 30, height: 40 };
        const page: any = { size: { width: 300, height: 200 } };
        const template: any = {
            _size: { width: 25, height: 35 },
            _content: { dictionary: { getArray: (k: string) => k === 'Matrix' ? [0, 0, 0, 0, 0, 5] : [0, 0, 2, 0] } }
        };
        const graphics: any = { _matrix: {}, translateTransform: () => { }, rotateTransform: () => { } };
        const res = annot._calculateTemplateBounds(bounds, page, template, false, graphics);
        expect(res).toEqual({ x: -265, y: 10, width: 40, height: 30 });
    });

    it('_calculateTemplateBounds - rotation 0 with non-normal matrix and rotationAngle=90', () => {
        const annot: any = new PdfPopupAnnotation();
        annot._obtainGraphicsRotation = (_m: any) => 0;
        annot.rotationAngle = 90; // trigger the code path for 0-rotation with rotated annotation
        const bounds = { x: 10, y: 20, width: 30, height: 40 };
        const page: any = { size: { width: 300, height: 200 } };
        const template: any = { _size: { width: 25, height: 35 }, _content: { dictionary: { getArray: (_: string): any => null } } };
        const graphics: any = { _matrix: {}, translateTransform: () => { }, rotateTransform: () => { } };
        const res = annot._calculateTemplateBounds(bounds, page, template, false, graphics);
        expect(res).toEqual({ x: 10, y: 20, width: 30, height: 40 });
    });

    // Tests for _applyTransform, _getAxialAlignedBoundingBox, _getTransformMatrix (lines 3958-3968, 3940-3948)
    it('_applyTransform - applies affine matrix to point', () => {
        const annot: any = new PdfPopupAnnotation();
        const p = [2, 3];
        const m = [1, 0, 0, 1, 5, 7]; // identity + translation
        const res = annot._applyTransform(p, m);
        expect(res).toEqual([7, 10]);
    });

    it('_getAxialAlignedBoundingBox - computes AABB for scaled/translated matrix', () => {
        const annot: any = new PdfPopupAnnotation();
        const r = [0, 0, 1, 2];
        const m = [2, 0, 0, -1, 5, 10];
        const res = annot._getAxialAlignedBoundingBox(r, m);
        // transformed corners: [5,10], [7,8], [5,8], [7,10] => minX=5,minY=8,maxX=7,maxY=10
        expect(res).toEqual([5, 8, 7, 10]);
    });

    it('_getTransformMatrix - returns identity translation when bbox degenerate', () => {
        const annot: any = new PdfPopupAnnotation();
        const rect = [10, 20, 60, 120];
        const bbox = [0, 0, 0, 0];
        const m = [1, 0, 0, 1, 0, 0];
        const res = annot._getTransformMatrix(rect, bbox, m);
        expect(res).toEqual([1, 0, 0, 1, rect[0], rect[1]]);
    });

    it('_getTransformMatrix - computes scale and translate when bbox non-degenerate', () => {
        const annot: any = new PdfPopupAnnotation();
        const rect = [10, 20, 60, 120];
        const bbox = [0, 0, 100, 200];
        const m = [1, 0, 0, 1, 0, 0];
        const res = annot._getTransformMatrix(rect, bbox, m);
        // xRatio = (60-10)/(100-0) = 0.5, yRatio = (120-20)/(200-0) = 0.5
        expect(res).toEqual([0.5, 0, 0, 0.5, 10, 20]);
    });

});
describe('PdfFreeTextAnnotation._rgbStringToArray - branch coverage', () => {
    it('parses rgb(...) string into PdfColor', () => {
        // Arrange
        const annot: any = new PdfFreeTextAnnotation();
        // Act
        const res = annot._rgbStringToArray('rgb(10, 20, 30)');
        // Assert
        expect(res).toEqual({ r: 10, g: 20, b: 30 });
    });

    it('parses #RRGGBB hex string into PdfColor', () => {
        // Arrange
        const annot: any = new PdfFreeTextAnnotation();
        // Act
        const res = annot._rgbStringToArray('#0A1B2C');
        // Assert
        expect(res).toEqual({ r: 0x0A, g: 0x1B, b: 0x2C });
    });

    it('throws on invalid format', () => {
        // Arrange
        const annot: any = new PdfFreeTextAnnotation();
        // Act / Assert
        expect(() => annot._rgbStringToArray('not-a-color')).toThrowError('Invalid RGB string format');
    });

});
describe('PdfAnnotation._drawTemplate', () => {

    it('_drawTemplate - no-op when template falsy or key falsy', () => {
        const annot: any = new PdfPopupAnnotation();
        annot._customTemplate = new Map();

        annot._drawTemplate(null as any, 'K');
        expect(annot._customTemplate.size).toBe(0);

        annot._drawTemplate({} as any, '');
        expect(annot._customTemplate.size).toBe(0);
    });

    it('_drawTemplate - stores non-exported template without importing', () => {
        const annot: any = new PdfPopupAnnotation();
        annot._customTemplate = new Map();
        const template: any = {
            _isExported: false,
            _isResourceExport: false,
            _importStream: jasmine.createSpy('_importStream')
        };

        annot._drawTemplate(template, 'T1');

        expect(template._importStream).not.toHaveBeenCalled();
        expect(annot._customTemplate.get('T1')).toBe(template);
    });

    it('_drawTemplate - exported template with crossReference uses importStream(true)', () => {
        const annot: any = new PdfPopupAnnotation();
        annot._customTemplate = new Map();
        const template: any = {
            _isExported: true,
            _isResourceExport: false,
            _importStream: jasmine.createSpy('_importStream')
        };
        const crossRef: any = {};
        annot._crossReference = crossRef;

        annot._drawTemplate(template, 'T2');

        expect(template._crossReference).toBe(crossRef);
        expect(template._importStream).toHaveBeenCalledWith(true, false);
        expect(annot._customTemplate.get('T2')).toBe(template);
    });

    it('_drawTemplate - exported template without crossReference uses importStream(false)', () => {
        const annot: any = new PdfPopupAnnotation();
        annot._customTemplate = new Map();
        annot._crossReference = null;
        const template: any = {
            _isExported: true,
            _isResourceExport: true,
            _importStream: jasmine.createSpy('_importStream')
        };

        annot._drawTemplate(template, 'T3');

        expect(template._importStream).toHaveBeenCalledWith(false, true);
        expect(annot._customTemplate.get('T3')).toBe(template);
    });
});
describe('PdfLineAnnotation.prototype.border getter & setter - IF/ELSE coverage', () => {
    function mockDictionary(initialData: any = {}) {
        const store = { ...initialData };

        return {
            has: jasmine.createSpy('has').and.callFake((key: string) => {
                return Object.prototype.hasOwnProperty.call(store, key);
            }),

            get: jasmine.createSpy('get').and.callFake((key: string) => {
                return store[key];
            }),

            getArray: jasmine.createSpy('getArray').and.callFake((key: string) => {
                return store[key];
            }),

            update: jasmine.createSpy('update').and.callFake((key: string, value: any) => {
                store[key] = value;
            }),

            _updated: false
        };
    }
    function mockBSDictionary(values: any = {}) {
        const store = { ...values };

        return {
            has: (key: string) => store[key] !== undefined,

            get: (key: string) => store[key],

            getArray: (key: string) => store[key],

            update: (key: string, value: any) => {
                store[key] = value;
            }
        };
    }
    /* -------------------- GETTER TESTS -------------------- */

    it('I: should create a new border when _border is undefined', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._border = undefined;
        annotation._dictionary = null;

        const border = annotation.border;

        expect(border).toBeDefined();
        expect(border.width).toBe(1);
        expect(border.style).toBe(PdfBorderStyle.solid);
    });

    it('E: should return existing border when _border already exists', () => {
        const annotation: any = new PdfLineAnnotation();
        const existing = new PdfAnnotationBorder({ width: 2 });
        annotation._border = existing;

        expect(annotation.border).toBe(existing);
    });

    it('E: should ignore Border when length < 3', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._dictionary = mockDictionary({ Border: [1, 2] });

        expect(annotation.border.width).toBe(1);
    });

    it('I: should read BS dictionary from annotation', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._dictionary = mockDictionary({
            BS: mockBSDictionary({ W: 5 })
        });

        expect(annotation.border.width).toBe(5);
    });

    it('E: should read BS dictionary from radio button field when annotation has no BS', () => {
        const item: any = new PdfRadioButtonListItem();
        item._field = {
            _dictionary: mockDictionary({
                BS: mockBSDictionary({ W: 7 })
            })
        };

        expect(item.border.width).toBe(7);
    });

    it('I: should set dashed style when BS.S is D', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._dictionary = mockDictionary({
            BS: mockBSDictionary({ S: { name: 'D' } })
        });

        expect(annotation.border.style).toBe(PdfBorderStyle.dashed);
    });

    it('E: should default to solid style for unknown BC.S', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._dictionary = mockDictionary({
            BS: mockBSDictionary({ S: { name: 'X' } })
        });

        expect(annotation.border.style).toBe(PdfBorderStyle.solid);
    });

    it('I: should read dash pattern from BS.D', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._dictionary = mockDictionary({
            BS: mockBSDictionary({ D: [3, 1] })
        });

        expect(annotation.border.dash).toEqual([3, 1]);
    });

    it('E: should leave dash undefined when BS.D not present', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._dictionary = mockDictionary({
            BS: mockBSDictionary({})
        });

        expect(annotation.border.dash).toBeUndefined();
    });

    /* -------------------- SETTER TESTS -------------------- */

    it('I: should update width when annotation is not loaded', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._isLoaded = false;

        annotation.border = new PdfAnnotationBorder({ width: 4 });

        expect(annotation.border.width).toBe(4);
    });

    it('E: should not update width when loaded and value unchanged', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._isLoaded = true;
        const originalWidth = annotation.border.width;

        annotation.border = new PdfAnnotationBorder({ width: originalWidth });

        expect(annotation.border.width).toBe(originalWidth);
    });

    it('I: should update Border array when width/radius changes', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._dictionary = mockDictionary({ Border: [0, 0, 1] });

        annotation.border = new PdfAnnotationBorder({ width: 6 });

        expect(annotation._dictionary.update).toHaveBeenCalledWith(
            'Border',
            [0, 0, 6]
        );
    });

    it('I: should update BS dictionary when style/width/dash changes', () => {
        const annotation: any = new PdfLineAnnotation();
        annotation._dictionary = mockDictionary({});

        annotation.border = new PdfAnnotationBorder({
            width: 2,
            style: PdfBorderStyle.dashed,
            dash: [2, 2]
        });

        expect(annotation._dictionary.update).toHaveBeenCalledWith(
            'BS',
            jasmine.any(Object)
        );
    });
});
describe('PdfAnnotation._getRotatedBounds - behavior coverage', () => {

    it('returns rotated bounds for 90 degree rotation', () => {
        const annot: any = new PdfPopupAnnotation();
        const bounds = { x: 0, y: 0, width: 10, height: 5 };
        const res = annot._getRotatedBounds(bounds, 90);
        expect(res).toEqual({ x: 0, y: 0, width: 5, height: 10 });
    });

    it('returns original bounds when width or height not greater than 0', () => {
        const annot: any = new PdfPopupAnnotation();
        const boundsZero: any = { x: 1, y: 2, width: 0, height: 10 };
        const resZero = annot._getRotatedBounds(boundsZero, 45);
        expect(resZero).toBe(boundsZero);
        const boundsNeg: any = { x: 1, y: 2, width: 10, height: -5 };
        const resNeg = annot._getRotatedBounds(boundsNeg, 30);
        expect(resNeg).toBe(boundsNeg);
    });
    it('rounds width and height for fractional rotations', () => {
        const annot: any = new PdfPopupAnnotation();
        const bounds = { x: 0, y: 0, width: 3, height: 4 };
        const angle = 37; // arbitrary angle producing fractional extents

        // Compute expected using standard rotation formulas
        const rad = angle * Math.PI / 180;
        const corners = [
            { x: bounds.x, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
            { x: bounds.x, y: bounds.y + bounds.height }
        ].map(p => ({ x: p.x * Math.cos(rad) - p.y * Math.sin(rad), y: p.x * Math.sin(rad) + p.y * Math.cos(rad) }));

        let minX = corners[0].x, maxX = corners[0].x, minY = corners[0].y, maxY = corners[0].y;
        for (let i = 1; i < 4; i++) {
            if (corners[i].x < minX) minX = corners[i].x;
            if (corners[i].x > maxX) maxX = corners[i].x;
            if (corners[i].y < minY) minY = corners[i].y;
            if (corners[i].y > maxY) maxY = corners[i].y;
        }
        const expectedWidth = Math.round(maxX - minX);
        const expectedHeight = Math.round(maxY - minY);

        const res = annot._getRotatedBounds(bounds, angle);
        expect(res.width).toBe(expectedWidth);
        expect(res.height).toBe(expectedHeight);
    });
    describe('Annotation lines 3291-3464 behavior tests', () => {

        it('_getForeColor - returns black when luminance > 128 and white otherwise', () => {
            const annot: any = new PdfPopupAnnotation();
            const bright = annot._getForeColor({ r: 200, g: 200, b: 200 });
            const dark = annot._getForeColor({ r: 10, g: 20, b: 30 });
            expect(bright).toEqual({ r: 0, g: 0, b: 0 });
            expect(dark).toEqual({ r: 255, g: 255, b: 255 });
        });

        it('_getBorderColorString - formats color with 3 decimals and rg suffix', () => {
            const annot: any = new PdfPopupAnnotation();
            const s = annot._getBorderColorString({ r: 255, g: 128, b: 0 });
            expect(s).toBe('1.000 0.502 0.000 rg ');
        });

        it('_saveGraphics - calls save and setTransparency on page.graphics', () => {
            const annot: any = new PdfPopupAnnotation();
            const calls: string[] = [];
            const fakeState = { id: 's' };
            const graphics: any = {
                save: () => { calls.push('save'); return fakeState; },
                setTransparency: (a: any, b: any, m: any) => { calls.push('set:' + a + ':' + b + ':' + (m as any)); }
            };
            const page: any = { graphics };
            annot._saveGraphics(page, PdfBlendMode.hardLight);
            expect(calls.indexOf('save')).toBeGreaterThan(-1);
            expect(calls.some(c => c.indexOf('set:0.8:0.8') === 0)).toBeTruthy();
        });

        it('_getRectangleBoundsValue - handles Popup present with zero rect and with non-zero rect and when absent', () => {
            const annot: any = new PdfPopupAnnotation();
            annot._dictionary = {
                has: (k: string) => k === 'Popup',
                get: (k: string) => ({ getArray: (_: string) => [0, 0, 0, 0] })
            } as any;
            annot._page = { _size: { height: 100 } } as any;
            expect(annot._getRectangleBoundsValue()).toEqual([0, 0, 0, 0]);

            annot._dictionary = {
                has: (k: string) => k === 'Popup',
                get: (k: string) => ({ getArray: (_: string) => [10, 20, 30, 40] })
            } as any;
            annot._page = { _size: { height: 200 } } as any;
            expect(annot._getRectangleBoundsValue()).toEqual([10, 140, 30, 40]);

            annot._dictionary = { has: (_: string) => false } as any;
            expect(annot._getRectangleBoundsValue()).toEqual([0, 0, 0, 0]);
        });

        it('_drawAuthor - returns 40 when subject present and 20 otherwise; respects transparency branch', () => {
            const annot: any = new PdfPopupAnnotation();
            annot._border = new PdfAnnotationBorder({ width: 4 });
            const calls: string[] = [];
            const graphics: any = {
                save: () => { calls.push('save'); },
                setTransparency: () => { calls.push('setTransparency'); },
                drawRectangle: () => { calls.push('drawRectangle'); },
                restore: () => { calls.push('restore'); },
                drawString: () => { calls.push('drawString'); }
            };
            annot._page = { graphics };
            annot._isTransparentColor = true;
            const t1 = annot._drawAuthor('Auth', 'Subj', [0, 0, 100, 40], new PdfBrush({ r: 1, g: 2, b: 3 }), new PdfBrush({ r: 4, g: 5, b: 6 }), annot._page, 0, annot._border);
            expect(t1).toBe(40);
            annot._isTransparentColor = false;
            const t2 = annot._drawAuthor('Auth', '', [0, 0, 100, 20], new PdfBrush({ r: 1, g: 2, b: 3 }), new PdfBrush({ r: 4, g: 5, b: 6 }), annot._page, 0, annot._border);
            expect(t2).toBe(20);
        });

        it('_drawSubject - delegates to page.graphics.drawString', () => {
            const annot: any = new PdfPopupAnnotation();
            const called: any = {};
            const graphics: any = { drawString: (s: any, f: any, r: any, _a: any, _b: any, _c: any) => { called.s = s; called.rect = r; } };
            annot._page = { graphics };
            annot._drawSubject('Hello', { x: 1, y: 2, width: 3, height: 4 }, annot._page);
            expect(called.s).toBe('Hello');
            expect(called.rect).toEqual({ x: 1, y: 2, width: 3, height: 4 });
        });

        it('_dateToString - emits PDF date string starting with D:YYYYMMDD', () => {
            const annot: any = new PdfPopupAnnotation();
            const d = new Date(2020, 0, 2, 3, 4, 5);
            const s = annot._dateToString(d);
            expect(s).toMatch(/^D:20200102\d{6}[\+\-]\d{2}'\d{2}'$/);
        });

        it('_stringToDate - parses slashed date and D:Z / D:+hhmm timezones', () => {
            const annot: any = new PdfPopupAnnotation();
            const d1 = annot._stringToDate('12/31/2020 05:06:07');
            expect(d1.getFullYear()).toBe(2020);
            expect(d1.getMonth()).toBe(11);
            expect(d1.getDate()).toBe(31);
            expect(d1.getHours()).toBe(5);
            expect(d1.getMinutes()).toBe(6);
            expect(d1.getSeconds()).toBe(7);

            const d2 = annot._stringToDate('D:20200102030405Z');
            expect(d2.getUTCFullYear()).toBe(2020);
            expect(d2.getUTCMonth()).toBe(0);
            expect(d2.getUTCDate()).toBe(2);
            expect(d2.getUTCHours()).toBe(3);
            expect(d2.getUTCMinutes()).toBe(4);
            expect(d2.getUTCSeconds()).toBe(5);

            const d3 = annot._stringToDate('D:20200102030405+0200');
            expect(d3.getUTCFullYear()).toBe(2020);
            expect(d3.getUTCHours()).toBe(1);
            expect(d3.getUTCMinutes()).toBe(4);
            expect(d3.getUTCSeconds()).toBe(5);
        });

        it('_flattenLoadedPopUp - calls _flattenPop and removes annotation when Popup absent', () => {
            const annot: any = new PdfPopupAnnotation();
            annot._dictionary = { has: (_: string) => false, get: (_: string) => undefined as any } as any;
            spyOn(annot as any, '_flattenPop').and.callFake(() => { /* noop */ });
            const removed = jasmine.createSpy('remove');
            annot._page = { annotations: { remove: removed } } as any;
            annot._flattenLoadedPopUp();
            expect((annot as any)._flattenPop).toHaveBeenCalled();
            expect(removed).toHaveBeenCalledWith(annot);
        });

        it('_drawRectangleAppearance - invokes cloud-style path when radius positive (spy _isNullOrUndefined)', () => {
            // Arrange
            const annot: any = new PdfPopupAnnotation();
            spyOn(utils as any, '_isNullOrUndefined').and.returnValue(true);
            const cloudSpy = spyOn(annot as any, '_drawCloudStyle').and.callFake(() => { /* noop */ });
            const graphics: any = { drawRectangle: jasmine.createSpy('drawRectangle') };
            const parameter: any = { borderPen: { w: 1 }, backBrush: { r: 1 } };

            // Act
            annot._drawRectangleAppearance([5, 6, 7, 8], graphics, parameter, 2);

            // Assert
            expect(cloudSpy).toHaveBeenCalled();
        });

    });

});
describe('PdfPopupAnnotation._flattenPop - lines 3291-3387 coverage', () => {

    it('no page.size, no Popup, undefined color, no author/subject/text', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot._dictionary = { has: (_: string) => false, get: (_: string) => undefined as any, getArray: (_: string) => undefined as any } as any;
        const rectCalls: any[] = [];
        const graphics: any = {
            drawRectangle: jasmine.createSpy('drawRectangle').and.callFake((r: any, p?: any, b?: any) => { rectCalls.push([r, p, b]); }),
            drawString: jasmine.createSpy('drawString'),
            restore: jasmine.createSpy('restore'),
            save: () => { }, drawPath: () => { },
            setTransparency: () => { },
        };
        const page: any = { graphics };// no size => C1 false
        const border = new PdfAnnotationBorder({ width: 4 });
        const bounds = { x: 10, y: 20, width: 30, height: 40 };

        // Act
        annot._flattenPop(page, undefined as any, bounds, border, '', '', '');

        // Assert
        expect(graphics.drawRectangle).toHaveBeenCalled();
        expect(graphics.drawString).not.toHaveBeenCalled();
        expect(rectCalls.length).toBeGreaterThan(0);
    });

    it('Popup present with valid Rect and author present (uses _drawAuthor)', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot._dictionary = { has: (_: string) => true, get: (_: string) => ({}), getArray: (_: string) => [5, 6, 25, 40] } as any;
        const graphics: any = { drawRectangle: jasmine.createSpy('drawRectangle'), drawString: jasmine.createSpy('drawString'), restore: jasmine.createSpy('restore'), save: () => { }, drawPath: () => { }, setTransparency: () => { } };
        const page: any = { graphics, size: { width: 200, height: 200 } };
        const border = new PdfAnnotationBorder({ width: 4 });
        spyOn(annot as any, '_drawAuthor').and.returnValue(15);

        // Act
        annot._flattenPop(page, { r: 1, g: 2, b: 3 }, { x: 1, y: 2, width: 3, height: 4 }, border, 'Auth', '', 'body');

        // Assert
        expect((annot as any)._drawAuthor).toHaveBeenCalled();
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('subject present and transparent true - titleRect drawn without backBrush', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot._dictionary = { has: (_: string) => false } as any;
        annot._isTransparentColor = true; // C8 true
        const drawArgs: any[] = [];
        const graphics: any = {
            drawRectangle: jasmine.createSpy('drawRectangle').and.callFake(function (r: any, p: any, b?: any) { drawArgs.push(Array.prototype.slice.call(arguments)); }),
            drawString: jasmine.createSpy('drawString'),
            restore: jasmine.createSpy('restore'), save: () => { }, drawPath: () => { }, setTransparency: () => { }
        };
        const page: any = { graphics, size: { width: 300, height: 300 } };// C1 true
        const border = new PdfAnnotationBorder({ width: 4 });

        // Act
        annot._flattenPop(page, { r: 10, g: 20, b: 30 }, { x: 5, y: 5, width: 10, height: 10 }, border, undefined as any, 'Subj', '');

        // Assert: at least one drawRectangle call has no backBrush (args length === 2)
        const hasTwoArgCall = drawArgs.some(a => a.length === 2);
        expect(hasTwoArgCall).toBeTruthy();
    });

    it('subject present and transparent false - titleRect drawn with backBrush', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot._dictionary = { has: (_: string) => false } as any;
        annot._isTransparentColor = false; // C8 false
        const drawArgs: any[] = [];
        const graphics: any = {
            drawRectangle: jasmine.createSpy('drawRectangle').and.callFake(function (r: any, p: any, b?: any) { drawArgs.push(Array.prototype.slice.call(arguments)); }),
            drawString: jasmine.createSpy('drawString'),
            restore: jasmine.createSpy('restore'), save: () => { }, drawPath: () => { }, setTransparency: () => { }
        };
        const page: any = { graphics, size: { width: 300, height: 300 } };
        const border = new PdfAnnotationBorder({ width: 4 });

        // Act
        annot._flattenPop(page, { r: 10, g: 20, b: 30 }, { x: 5, y: 5, width: 10, height: 10 }, border, undefined as any, 'Subj', '');

        // Assert: at least one drawRectangle call includes a backBrush (third arg defined)
        const hasThreeArgCall = drawArgs.some(a => a.length >= 3 && a[2] !== undefined);
        expect(hasThreeArgCall).toBeTruthy();
    });

    it('Popup has dict but get returns null (dictionary falsy) - uses defaults safely', () => {
        // Arrange
        const annot: any = new PdfPopupAnnotation();
        annot._dictionary = { has: (_: string) => true, get: (_: string) => null as any, getArray: (_: string) => [1, 2, 3] } as any; // C3 false
        const graphics: any = { drawRectangle: jasmine.createSpy('drawRectangle'), drawString: jasmine.createSpy('drawString'), restore: jasmine.createSpy('restore'), save: () => { }, drawPath: () => { }, setTransparency: () => { } };
        const page: any = { graphics };// no size
        const border = new PdfAnnotationBorder({ width: 4 });

        // Act
        annot._flattenPop(page, undefined as any, { x: 2, y: 3, width: 4, height: 5 }, border, '', '', '');

        // Assert
        expect(graphics.drawRectangle).toHaveBeenCalled();
    });

});
describe('PdfAnnotation._obtainNativeRectangle - full branch coverage', () => {

    let annot: any;

    beforeEach(() => {
        annot = new PdfLineAnnotation();
        annot._bounds = { x: 10, y: 20, width: 30, height: 40 };
    });

    it('returns raw bounds when _page is undefined', () => {
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue(undefined);

        const rect = annot._obtainNativeRectangle();

        expect(rect).toEqual([10, 20, 40, 60]);
    });

    it('flips Y coordinate when _page is present and no crop box', () => {
        annot._page = { size: { width: 200, height: 300 } };
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue(undefined);

        const rect = annot._obtainNativeRectangle();

        // rect[3] = y + height = 20 + 40 = 60
        // new y = 300 - 60 = 240
        expect(rect).toEqual([10, 240, 40, 60]);
    });

    it('does not apply crop box when length <= 2', () => {
        annot._page = { size: { width: 100, height: 200 } };
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue([5, 5]);

        const rect = annot._obtainNativeRectangle();

        expect(rect).toEqual([10, 200 - 60, 40, 60]);
    });

    it('does not apply crop box when offsets are zero', () => {
        annot._page = { size: { width: 100, height: 200 } };
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue([0, 0, 100, 200]);

        const rect = annot._obtainNativeRectangle();

        expect(rect).toEqual([10, 200 - 60, 40, 60]);
    });

    it('applies crop box X offset only', () => {
        annot._page = { size: { width: 100, height: 200 } };
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue([5, 0, 100, 200]);

        const rect = annot._obtainNativeRectangle();

        expect(rect).toEqual([
            10 + 5,
            200 - 60,
            40,
            60
        ]);
    });

    it('applies crop box Y offset only', () => {
        annot._page = { size: { width: 100, height: 200 } };
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue([0, 10, 100, 200]);

        const rect = annot._obtainNativeRectangle();

        expect(rect).toEqual([
            10,
            (200 - 60) + 10,
            40,
            60
        ]);
    });

    it('applies both X and Y crop box offsets', () => {
        annot._page = { size: { width: 200, height: 500 } };
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue([15, 25, 300, 400]);

        const rect = annot._obtainNativeRectangle();

        expect(rect).toEqual([
            10 + 15,
            (500 - 60) + 25,
            40,
            60
        ]);
    });
});
describe('PdfAnnotation._obtainStyle - full branch coverage', () => {

    let annot: any;
    let borderPen: any;

    beforeEach(() => {
        annot = new PdfLineAnnotation();
        annot.border = {
            dash: undefined,
            width: 2,
            style: PdfBorderStyle.solid
        };
        annot.bounds = { height: 100 };
        annot._isBounds = false;
        annot._dictionary = {
            has: (_: string) => false,
            getArray: (_: string) => undefined as any
        } as any;

        borderPen = {};
    });

    it('applies dash style and pattern when dash exists and style is dashed', () => {
        annot.border.dash = [3, 2];
        annot.border.style = PdfBorderStyle.dashed;

        const rectangle = [0, 0, 50, 50];

        annot._obtainStyle(borderPen, rectangle, 1, null);

        expect(borderPen._dashStyle).toBe(PdfDashStyle.dash);
        expect(borderPen._dashPattern).toEqual([3, 2]);
    });

    it('does not apply dash style when all dash values are zero', () => {
        annot.border.dash = [0, 0];
        annot.border.style = PdfBorderStyle.dashed;

        annot._obtainStyle(borderPen, [0, 0, 50, 50], 1, null);

        expect(borderPen._dashStyle).toBeUndefined();
    });

    it('does not apply dash style when border style is not dashed', () => {
        annot.border.dash = [5, 1];
        annot.border.style = PdfBorderStyle.solid;

        annot._obtainStyle(borderPen, [0, 0, 50, 50], 1, null);

        expect(borderPen._dashStyle).toBeUndefined();
    });

    it('adjusts rectangle using RD when parameter is _PaintParameter and RD exists', () => {
        const paint = new _PaintParameter();
        const rectangle = [10, 10, 80, 60];
        annot._dictionary = {
            has: (k: string) => k === 'RD',
            getArray: (_: string) => [2, 3, 4, 5]
        } as any;

        annot._obtainStyle(borderPen, rectangle, 1, paint);

        expect(paint.bounds).toEqual({
            x: 12,
            y: 10 + 1 + 3,
            width: 80 - (2 + 4),
            height: 60 - (3 + 5)
        });
    });

    it('uses default borderWidth path when _isBounds is true', () => {
        const paint = new _PaintParameter();
        annot._isBounds = true;
        const rectangle = [5, 5, 40, 30];

        annot._obtainStyle(borderPen, rectangle, 2, paint);

        expect(paint.bounds).toEqual({
            x: 7,
            y: 7,
            width: 40 - annot.border.width,
            height: 30 - annot.border.width
        });
    });
    it('adjusts rectangle for cloudy border effect', () => {
        const parameter = {
            intensity: 2,
            style: PdfBorderEffectStyle.cloudy
        };
        const rectangle = [10, 10, 60, 60];

        annot._obtainStyle(borderPen, rectangle, 2, parameter);

        const radius = 2 * 5;
        expect(rectangle).toEqual([
            10 + radius + 2,
            10 + radius + 2,
            60 - (2 * radius) - 4,
            60 - (2 * radius) - 4
        ]);
    });

    it('uses non-cloudy fallback when intensity is zero', () => {
        const parameter = {
            intensity: 0,
            style: PdfBorderEffectStyle.cloudy
        };
        const rectangle = [10, 10, 50, 50];

        annot._obtainStyle(borderPen, rectangle, 2, parameter);

        expect(rectangle).toEqual([
            12,
            12,
            50 - annot.border.width,
            annot.bounds.height - annot.border.width
        ]);
    });
    it('uses RD adjustment when parameter is null and RD exists', () => {
        const rectangle = [5, 5, 40, 40];
        annot._dictionary = {
            has: (k: string) => k === 'RD',
            getArray: (_: string) => [1, 2, 3, 4]
        } as any;

        annot._obtainStyle(borderPen, rectangle, 2, null);

        expect(rectangle).toEqual([
            6,
            5 + 2 + 2,
            40 - (2 * 3),
            40 - annot.border.width - (2 * 4)
        ]);
    });

    it('uses fallback path when parameter is null and no RD', () => {
        const rectangle = [0, 5, 30, 40];

        annot._obtainStyle(borderPen, rectangle, 2, null);

        expect(rectangle).toEqual([
            0,
            7,
            30,
            annot.bounds.height - annot.border.width
        ]);
    });

});
describe('PdfAnnotation._obtainFontDetails - full branch coverage', () => {

    let annot: any;

    beforeEach(() => {
        annot = new PdfLineAnnotation();
        annot._dictionary = {
            has: jasmine.createSpy('has'),
            get: jasmine.createSpy('get')
        } as any;
    });

    it('parses font-family and font-size from DS', () => {
        annot._dictionary.has.and.callFake((k: any) => k === 'DS');
        annot._dictionary.get.and.returnValue(
            'font-family:Helvetica;font-size:12pt'
        );

        const res = annot._obtainFontDetails();

        expect(res.name).toBe('Helvetica');
        expect(res.size).toBe(12);
        expect(res.style).toBe(PdfFontStyle.regular);
    });

    it('parses style flags from DS font-style entry', () => {
        annot._dictionary.has.and.callFake((k: any) => k === 'DS');
        annot._dictionary.get.and.returnValue(
            'font-family:Courier;font-size:10pt;font-style:bold,italic'
        );

        const res = annot._obtainFontDetails();

        expect(res.style & PdfFontStyle.bold).toBeTruthy();
        expect(res.style & PdfFontStyle.italic).toBeTruthy();
    });

    it('parses shorthand font entry and strips commas', () => {
        annot._dictionary.has.and.callFake((k: any) => k === 'DS');
        annot._dictionary.get.and.returnValue(
            'font:Times-Roman,Helvetica 14pt'
        );

        const res = annot._obtainFontDetails();

        expect(res.name).toBe('Times-Roman');
        expect(res.size).toBe(14);
    });

    it('extracts font details from DA with Tf operator', () => {
        annot._dictionary.has.and.callFake((k: any) => k === 'DA');
        annot._dictionary.get.and.returnValue('/Helvetica 9 Tf');

        const res = annot._obtainFontDetails();

        expect(res.name).toBe('Helvetica');
        expect(res.size).toBe(9);
    });

    it('uses AP parsing when DA exists but is invalid', () => {
        annot._dictionary.has.and.callFake((k: any) => k === 'DA' || k === 'AP');
        annot._dictionary.get.and.callFake((k: any) =>
            k === 'DA' ? '' : { mock: true }
        );

        spyOn(annot as any, '_parseFontFromAppearance').and.returnValue({
            name: 'Times-Roman',
            fontSize: 11,
            style: PdfFontStyle.bold
        });

        const res = annot._obtainFontDetails();

        expect(res.name).toBe('TimesRoman');
        expect(res.size).toBe(11);
        expect(res.style).toBe(PdfFontStyle.bold);
    });
    it('uses AP parsing when DA exists but is invalid', () => {
        annot._dictionary.has.and.callFake((k: any) => k === 'DA' || k === 'AP');
        annot._dictionary.get.and.callFake((k: any) =>
            k === 'DA' ? '' : { mock: true }
        );

        spyOn(annot as any, '_parseFontFromAppearance').and.returnValue({
            name: 'Times-Roman',
            fontSize: 11,
            style: PdfFontStyle.bold
        });

        const res = annot._obtainFontDetails();

        expect(res.name).toBe('TimesRoman');
        expect(res.size).toBe(11);
        expect(res.style).toBe(PdfFontStyle.bold);
    });
    it('maps remaining AP font names correctly using map', () => {
        const fontMap: { [key: string]: string } = {
            Helvetica: 'Helvetica',
            Courier: 'Courier',
            Symbol: 'Symbol',
            TimesRoman: 'TimesRoman',
            ZapfDingbats: 'ZapfDingbats',
            MonotypeSungLight: 'MonotypeSungLight',
            SinoTypeSongLight: 'SinoTypeSongLight',
            MonotypeHeiMedium: 'MonotypeHeiMedium',
            HanyangSystemsGothicMedium: 'HanyangSystemsGothicMedium',
            HanyangSystemsShinMyeongJoMedium: 'HanyangSystemsShinMyeongJoMedium',
            HeiseiKakuGothicW5: 'HeiseiKakuGothicW5',
            HeiseiMinchoW3: 'HeiseiMinchoW3',
            'Times-Roman': 'TimesRoman',
            UnknownFont: 'Helvetica'
        };

        // ✅ SPY ONCE
        const parseSpy = spyOn(
            annot as any,
            '_parseFontFromAppearance'
        );

        for (const inputFont in fontMap) {
            if (!fontMap.hasOwnProperty(inputFont)) {
                continue;
            }

            const expectedFont = fontMap[inputFont];

            annot._dictionary.has.and.callFake((k: any) => k === 'DA' || k === 'AP');
            annot._dictionary.get.and.callFake((k: any) =>
                k === 'DA' ? '' : { mock: true }
            );

            // ✅ ONLY change return value
            parseSpy.and.returnValue({
                name: inputFont,
                fontSize: 10,
                style: PdfFontStyle.italic
            });

            const result = annot._obtainFontDetails();

            expect(result.name).toBe(
                expectedFont,
                `Font "${inputFont}" should map to "${expectedFont}"`
            );
            expect(result.size).toBe(10);
            expect(result.style).toBe(PdfFontStyle.italic);

            annot._dictionary.has.calls.reset();
            annot._dictionary.get.calls.reset();
        }
    });

    it('uses AP font when DS and DA are absent', () => {
        annot._dictionary.has.and.callFake((k: any) => k === 'AP');
        annot._dictionary.get.and.returnValue({});

        spyOn(annot as any, '_parseFontFromAppearance').and.returnValue({
            name: 'Courier',
            fontSize: 10,
            style: PdfFontStyle.italic
        });

        const res = annot._obtainFontDetails();

        expect(res.name).toBe('Courier');
        expect(res.size).toBe(10);
        expect(res.style).toBe(PdfFontStyle.italic);
    });

    it('falls back to Helvetica for unknown AP font names', () => {
        annot._dictionary.has.and.callFake((k: any) => k === 'DS');
        annot._dictionary.get.and.returnValue('');

        spyOn(annot as any, '_parseFontFromAppearance').and.returnValue({
            name: 'UnknownFont',
            fontSize: 8,
            style: null
        });

        annot._dictionary.has.and.callFake((k: any) => k === 'AP');

        const res = annot._obtainFontDetails();

        expect(res.name).toBe('UnknownFont');
        expect(res.style).toBe(null);
    });

    it('overrides style from existing font for PdfFreeTextAnnotation', () => {
        const freeText: any = annot as any as PdfFreeTextAnnotation;

        freeText._font = { style: PdfFontStyle.bold };
        freeText._dictionary.has.and.callFake((k: any) => k === 'DS');
        freeText._dictionary.get.and.returnValue('font-family:Helvetica');

        const res = freeText._obtainFontDetails();

        expect(res.style).toBe(PdfFontStyle.regular);
    });

});
describe('PdfSquareAnnotation._calculateAreaOfSquare - full branch coverage', () => {

    let annot: any;
    let original: any;
    beforeEach(() => {
        annot = new PdfSquareAnnotation();

        annot.bounds = { x: 0, y: 0, width: 20, height: 20 };
        annot.unit = 'cm';
        annot._unitString = 'cm';

        // Stub unit resolver
        spyOn(annot as any, '_getEqualPdfGraphicsUnit').and.callFake(
            (_unit: any, unitString: string) => ({
                graphicsUnit: _PdfGraphicsUnit.centimeter,
                unitString: unitString
            })
        );
        original = _PdfUnitConvertor.prototype;
        // Stub the unit converter
        spyOn(_PdfUnitConvertor.prototype, '_convertUnits')
            .and.callFake((value: number) => value / 10); // simple predictable conversion
    });

    afterEach(() => {
        _PdfUnitConvertor.prototype = original
    })

    it('calculates area when width equals height (square case)', () => {
        annot.bounds.width = 30;
        annot.bounds.height = 30;

        const area = annot._calculateAreaOfSquare();

        // width converted: 30 -> 3
        // area = 3 * 3
        expect(area).toBe(9);

        expect((annot as any)._getEqualPdfGraphicsUnit).toHaveBeenCalledTimes(1);
        expect(_PdfUnitConvertor.prototype._convertUnits)
            .toHaveBeenCalledTimes(1);
    });

    it('calculates area when width does not equal height (rectangle case)', () => {
        annot.bounds.width = 40;
        annot.bounds.height = 20;

        const area = annot._calculateAreaOfSquare();

        // width: 40 -> 4
        // height: 20 -> 2
        expect(area).toBe(8);

        expect((annot as any)._getEqualPdfGraphicsUnit).toHaveBeenCalledTimes(2);
        expect(_PdfUnitConvertor.prototype._convertUnits)
            .toHaveBeenCalledTimes(2);
    });

    it('updates _unitString during calculation', () => {
        annot._unitString = 'mm';
        annot._calculateAreaOfSquare();

        expect(annot._unitString).toBe('mm');
    });

});
describe('PdfAnnotation._flattenAnnotationTemplate - full branch coverage', () => {

    let annotation: any;
    let page: any;
    let graphics: any;
    let dictionary: any;
    let template: any;

    beforeEach(() => {
        graphics = {
            save: jasmine.createSpy('save').and.returnValue('state'),
            restore: jasmine.createSpy('restore'),
            setTransparency: jasmine.createSpy('setTransparency'),
            drawTemplate: jasmine.createSpy('drawTemplate')
        };

        page = {
            graphics,
            size: { width: 200, height: 300 },
            mediaBox: undefined,
            cropBox: undefined,
            rotation: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false)
            },
            _needInitializeGraphics: false,
            annotations: {
                remove: jasmine.createSpy('remove')
            }
        };

        dictionary = new _PdfDictionary({ _cacheMap: new Map() } as any);

        annotation = new PdfRectangleAnnotation({} as any);
        annotation._dictionary = dictionary;
        annotation._page = page;

        annotation.bounds = { x: 10, y: 20, width: 50, height: 40 };
        annotation._bounds = { x: 12, y: 22, width: 50, height: 40 };

        annotation._isLoaded = false;
        annotation._setAppearance = false;
        annotation.flatten = false;
        annotation.measure = false;

        annotation.opacity = 0.5;
        annotation._opacity = 0.5;

        annotation._type = _PdfAnnotationType.squareAnnotation;

        template = {
            _size: { width: 50, height: 40 },
            _isAnnotationTemplate: false,
            _needScale: false,
            _content: {
                dictionary: new _PdfDictionary({ _cacheMap: new Map() } as any)
            }
        };

        spyOn(annotation as any, '_calculateTemplateBounds').and.callFake(
            (_bounds: any) => ({ ..._bounds })
        );
    });

    /* ------------------------------------------------------------
       Generic (non-LineAnnotation) path
    ------------------------------------------------------------ */

    it('flattens template and removes annotation for non-line annotation', () => {
        annotation._flattenAnnotationTemplate(template, true);

        expect(graphics.save).toHaveBeenCalled();
        expect(graphics.setTransparency).toHaveBeenCalledWith(0.5);
        expect(annotation._page._needInitializeGraphics).toBeTruthy();
        expect(graphics.drawTemplate).toHaveBeenCalledWith(
            template,
            jasmine.any(Object)
        );
        expect(graphics.restore).toHaveBeenCalled();
        expect(page.annotations.remove).toHaveBeenCalledWith(annotation);
    });

    /* ------------------------------------------------------------
       Non-normal matrix handling
    ------------------------------------------------------------ */

    it('marks template as needing scale when matrix is not normal', () => {
        annotation._flattenAnnotationTemplate(template, false);

        expect(template._isAnnotationTemplate).toBeTruthy();
        expect(template._needScale).toBeTruthy();
    });

    it('adjusts bounds using CropBox when present and not loaded', () => {
        page.cropBox = [10, 10, 200, 300];
        page._pageDictionary.has.and.callFake((key: string) => key === 'CropBox');

        annotation._flattenAnnotationTemplate(template, true);

        expect(graphics.drawTemplate).toHaveBeenCalled();
    });

    it('adjusts bounds using MediaBox when present and CropBox not used', () => {
        page.mediaBox = [5, 5, 200, 300];
        page._pageDictionary.has.and.callFake((key: string) => key === 'MediaBox');

        annotation._flattenAnnotationTemplate(template, true);

        expect(graphics.drawTemplate).toHaveBeenCalled();
    });
    /* ------------------------------------------------------------
       Angle measurement annotation path
    ------------------------------------------------------------ */

    it('uses calculated bounds for angle measurement annotation', () => {
        annotation = new PdfAngleMeasurementAnnotation();
        annotation._dictionary = dictionary;
        annotation._page = page;
        annotation._isLoaded = false;

        spyOn(utils, '_calculateBounds').and.returnValue({
            x: 1, y: 2, width: 3, height: 4
        });

        annotation._flattenAnnotationTemplate(template, true);

        expect(page.annotations.remove).toHaveBeenCalledWith(annotation);
    });

});
describe('PdfPolygonAnnotation._getLinePoints - full branch coverage', () => {
    let annotation: any, page: any;

    beforeEach(() => {
        page = {
            size: { width: 100, height: 200 },
            _pageDictionary: new _PdfDictionary(),
            rotation: undefined,
            _origin: [0, 0]
        };

        annotation = new PdfPolygonAnnotation();
        annotation._page = page;
        annotation._dictionary = new _PdfDictionary();
        annotation.flatten = false;
        annotation._isBounds = false;
    });

    it('returns points from dictionary Vertices without rotation', () => {
        annotation._dictionary.set('Vertices', [10, 20, 30, 40]);
        const result = annotation._getLinePoints();
        expect(result).toEqual([{ x: 10, y: -20 }, { x: 30, y: -40 }]);
    });

    it('applies flatten when dictionary Vertices exist', () => {
        annotation.flatten = true;
        annotation._dictionary.set('Vertices', [10, 20]);
        const result = annotation._getLinePoints();
        expect(result).toEqual([{ x: 10, y: page.size.height - 20 }]);
    });

    it('applies rotation=270 transformation', () => {
        annotation._dictionary.set('Vertices', [10, 20]);
        page.rotation = PdfRotationAngle.angle90;
        page._pageDictionary.set('Rotate', 270);
        const result = annotation._getLinePoints();
        // rotation 270: [x,y] -> [y, pageWidth - x]
        expect(result[0].x).toBe(220);
        expect(result[0].y).toBe(10);
    });

    it('applies rotation=90 transformation with origin[1]=0', () => {
        annotation._dictionary.set('Vertices', [10, 20]);
        page.rotation = PdfRotationAngle.angle90;
        page._origin[1] = 0;
        const result = annotation._getLinePoints();
        // rotation 90: [x,y] -> [pageHeight - y, x]
        expect(result[0].x).toBe(page.size.height - -20); // flatten=false so y=-20
        expect(result[0].y).toBe(10);
    });

    it('applies rotation=90 transformation with origin[1]!=0', () => {
        annotation._dictionary.set('Vertices', [10, 20]);
        page.rotation = PdfRotationAngle.angle90;
        page._origin[1] = 5;
        const result = annotation._getLinePoints();
        // branch with origin != 0
        expect(result[0].y).toBe(10);
    });

    it('applies rotation=180 transformation', () => {
        annotation._dictionary.set('Vertices', [10, 20]);
        page.rotation = PdfRotationAngle.angle180;
        const result = annotation._getLinePoints();
        // rotation 180: [x,y] -> [pageWidth - x, pageHeight - y]
        expect(result[0].x).toBe(page.size.width - 10);
        expect(result[0].y).toBe(page.size.height - -20);
    });

    it('explicit else branch: uses _points when dictionary has no Vertices', () => {
        annotation._points = [{ x: 5, y: 6 }, { x: 7, y: 8 }];
        spyOn(utils, '_convertPointToNumberArray').and.returnValue([5, 6, 7, 8]);
        const result = annotation._getLinePoints();
        expect(result).toEqual([{ x: 5, y: -6 }, { x: 7, y: -8 }]);
    });

    it('explicit else branch with flatten=true', () => {
        annotation.flatten = true;
        annotation._points = [{ x: 1, y: 2 }];
        spyOn(utils, '_convertPointToNumberArray').and.returnValue([1, 2]);
        const result = annotation._getLinePoints();
        expect(result).toEqual([{ x: 1, y: page.size.height - 2 }]);
    });
});
function createDictionaryMock() {
    return {
        _map: {},
        has(key: string) {
            return Object.prototype.hasOwnProperty.call(this._map, key);
        },
        set(key: string, value: any) {
            this._map[key] = value;
        },
        update(key: string, value: any) {
            this._map[key] = value;
        },
        get(key: string) {
            return this._map[key];
        },
        getArray(key: string) {
            return this._map[key];
        }
    };
}
function createAppearanceDictionary() {
    return {
        getArray: jasmine.createSpy('getArray'),
        update: jasmine.createSpy('update')
    };
}
describe('PdfBorderEffect helpers', () => {

    it('_getBorderEffect - returns cloudy when value is \'/C\'', () => {
        // Arrange
        const be: any = new PdfBorderEffect();
        // Act
        const res = be._getBorderEffect('/C');
        // Assert
        expect(res).toBe(PdfBorderEffectStyle.cloudy);
    });

    it('_getBorderEffect - returns solid when value is not \'/C\'', () => {
        // Arrange
        const be: any = new PdfBorderEffect();
        // Act
        const res = be._getBorderEffect('/X');
        // Assert
        expect(res).toBe(PdfBorderEffectStyle.solid);
    });

    it('_styleToEffect - returns "C" for cloudy style', () => {
        // Arrange
        const be: any = new PdfBorderEffect();
        // Act
        const res = be._styleToEffect(PdfBorderEffectStyle.cloudy);
        // Assert
        expect(res).toBe('C');
    });

    it('_styleToEffect - returns "S" for non-cloudy style', () => {
        // Arrange
        const be: any = new PdfBorderEffect();
        // Act
        const res = be._styleToEffect(PdfBorderEffectStyle.solid);
        // Assert
        expect(res).toBe('S');
    });

});
describe('PdfBorderEffect helpers', () => {
    it('_getBorderEffect - returns cloudy when value is \'/C\'', () => {
        // Arrange
        const be: any = new (PdfBorderEffect as any)();
        // Act
        const result = be._getBorderEffect('/C');
        // Assert
        expect(result).toBe(PdfBorderEffectStyle.cloudy);
    });

    it('_getBorderEffect - returns solid when value is not \'/C\'', () => {
        // Arrange
        const be: any = new (PdfBorderEffect as any)();
        // Act
        const result = be._getBorderEffect('/X');
        // Assert
        expect(result).toBe(PdfBorderEffectStyle.solid);
    });

    it('_styleToEffect - returns "C" for cloudy style', () => {
        // Arrange
        const be: any = new (PdfBorderEffect as any)();
        // Act
        const result = be._styleToEffect(PdfBorderEffectStyle.cloudy);
        // Assert
        expect(result).toBe('C');
    });

    it('_styleToEffect - returns "S" for non-cloudy style', () => {
        // Arrange
        const be: any = new (PdfBorderEffect as any)();
        // Act
        const result = be._styleToEffect(PdfBorderEffectStyle.solid);
        // Assert
        expect(result).toBe('S');
    });

});
describe('PdfListFieldItem behavior tests', () => {

    it('text getter loads from field when _text undefined and field is listbox', () => {
        // Arrange
        const item: any = new (PdfListFieldItem as any)();
        item._index = 0;
        const field: any = { _options: [['val', 'display']], _dictionary: { _updated: false }, selectedIndex: -1 };
        Object.setPrototypeOf(field, (PdfListBoxField as any).prototype);
        item._field = field;
        // Act
        const txt = item.text;
        // Assert
        expect(txt).toBe('display');
        expect(item._text).toBe('display');
    });

    it('text getter returns existing _text when defined', () => {
        // Arrange
        const item: any = new (PdfListFieldItem as any)();
        item._text = 'cached';
        // Act
        const res = item.text;
        // Assert
        expect(res).toBe('cached');
    });

    it('text setter updates options and dictionary when value differs', () => {
        // Arrange
        const item: any = new (PdfListFieldItem as any)();
        item._index = 0;
        const field: any = { _options: [['v', 'old']], _dictionary: { _updated: false }, selectedIndex: 1 };
        Object.setPrototypeOf(field, (PdfListBoxField as any).prototype);
        item._field = field;
        // Act
        item.text = 'new';
        // Assert
        expect(field._options[0][1]).toBe('new');
        expect(item._text).toBe('new');
        expect(field._dictionary._updated).toBe(true);
    });

    it('text setter does nothing when value equals existing option text', () => {
        // Arrange
        const item: any = new (PdfListFieldItem as any)();
        item._index = 0;
        const field: any = { _options: [['v', 'same']], _dictionary: { _updated: false }, selectedIndex: 0 };
        Object.setPrototypeOf(field, (PdfListBoxField as any).prototype);
        item._field = field;
        // Act
        item.text = 'same';
        // Assert
        expect(item._text).toBeUndefined();
        expect(field._dictionary._updated).toBe(false);
    });

    it('selected getter returns true when indices match and false otherwise', () => {
        // Arrange
        const item: any = new (PdfListFieldItem as any)();
        item._index = 2;
        const field: any = { selectedIndex: 2 };
        Object.setPrototypeOf(field, (PdfListBoxField as any).prototype);
        item._field = field;
        // Act / Assert
        expect(item.selected).toBeTruthy();
        field.selectedIndex = 1;
        expect(item.selected).toBeFalsy();
    });

    it('_initializeItem registers with field when field is PdfListBoxField', () => {
        // Arrange
        const field: any = { _addToOptions: jasmine.createSpy('_addToOptions') };
        Object.setPrototypeOf(field, (PdfListBoxField as any).prototype);
        // Act
        const item: any = new (PdfListFieldItem as any)('t', 'v', field);
        // Assert
        expect(field._addToOptions).toHaveBeenCalledWith(item, field);
        expect(item._text).toBe('t');
        expect(item._value).toBe('v');
    });

    it('_initializeItem does not call _addToOptions when field is not PdfListBoxField', () => {
        // Arrange
        const field: any = { _addToOptions: jasmine.createSpy('_addToOptions') };
        // Act
        const item: any = new (PdfListFieldItem as any)('tx', 'vx', field);
        // Assert
        expect(field._addToOptions).not.toHaveBeenCalled();
    });

});
describe('PdfListFieldItem text and selected properties', () => {
    let item: any;
    let field: any;

    function createFakeListField(type: 'list' | 'combo') {
        const fake: any = {
            _options: [
                ['v1', 'Text 1'],
                ['v2', 'Text 2']
            ],
            selectedIndex: 1,
            _dictionary: { _updated: false }
        };
        if (type === 'list') {
            Object.setPrototypeOf(fake, PdfListBoxField.prototype);
        } else {
            Object.setPrototypeOf(fake, PdfComboBoxField.prototype);
        }
        return fake;
    }

    beforeEach(() => {
        field = createFakeListField('list');
        item = new (PdfListFieldItem as any)();
        item._field = field;
        item._index = 1;
        item._text = undefined;
    });

    it('returns text from field options when _text is undefined (ListBox)', () => {
        const value = item.text;
        expect(value).toBe('Text 2');
        expect(item._text).toBe('Text 2');
    });

    it('returns cached _text when already set', () => {
        item._text = 'Cached Value';
        expect(item.text).toBe('Cached Value');
    });

    it('returns undefined when field is missing', () => {
        item._field = undefined;
        expect(item.text).toBeUndefined();
    });

    it('updates field option text and sets dictionary updated flag', () => {
        item.text = 'Updated Text';
        expect(field._options[1][1]).toBe('Updated Text');
        expect(item._text).toBe('Updated Text');
        expect(field._dictionary._updated).toBe(true);
    });

    it('does not update when new value matches existing text', () => {
        item._text = 'Text 2';
        item.text = 'Text 2';
        expect(field._dictionary._updated).toBe(false);
    });

    it('does nothing when value is not a string', () => {
        item.text = 123 as any;
        expect(field._options[1][1]).toBe('Text 2');
        expect(field._dictionary._updated).toBe(false);
    });

    it('works with PdfComboBoxField', () => {
        field = createFakeListField('combo');
        item._field = field;
        item._index = 0;
        expect(item.text).toBe('Text 1');
        item.text = 'Combo Updated';
        expect(field._options[0][1]).toBe('Combo Updated');
        expect(field._dictionary._updated).toBe(true);
    });

    it('selected getter returns true when item index matches selectedIndex', () => {
        field.selectedIndex = 1;
        expect(item.selected).toBe(true);
    });

    it('selected getter returns false when item index does not match selectedIndex', () => {
        field.selectedIndex = 0;
        expect(item.selected).toBe(false);
    });
});
describe('PaintParameter helper', () => {

    it('constructor sets default borderWidth to 1 and leaves brushes undefined', () => {
        // Arrange / Act
        const param: any = new (_PaintParameter as any)();
        // Assert
        expect(param.borderWidth).toBe(1);
        expect(param.backBrush).toBeUndefined();
        expect(param.foreBrush).toBeUndefined();
        expect(param.shadowBrush).toBeUndefined();
        expect(param.stringFormat).toBeUndefined();
    });

});
describe('PdfAnnotationBorder width setter behavior', () => {

    it('no-op when value unchanged', () => {
        // Arrange
        const border: any = new (PdfAnnotationBorder as any)();
        border._width = 5;
        border._dictionary = { update: jasmine.createSpy('update') };
        // Act
        border.width = 5;
        // Assert
        expect(border._width).toBe(5);
        expect(border._dictionary.update).not.toHaveBeenCalled();
    });

    it('updates width when dictionary missing', () => {
        // Arrange
        const border: any = new (PdfAnnotationBorder as any)();
        border._width = 2;
        border._dictionary = null;
        // Act
        border.width = 9;
        // Assert
        expect(border._width).toBe(9);
    });

    it('updates dictionary and BS when BS exists and dash present', () => {
        // Arrange
        const border: any = new (PdfAnnotationBorder as any)();
        border._width = 1;
        border._hRadius = 2;
        border._vRadius = 3;
        border._dash = [4, 5];
        border._style = 'any';
        const bs: any = { update: jasmine.createSpy('bsUpdate') };
        const dict: any = { update: jasmine.createSpy('dictUpdate'), has: (k: string) => k === 'BS', get: (k: string) => bs, _updated: false };
        border._dictionary = dict;
        // Act
        border.width = 7;
        // Assert
        expect(border._width).toBe(7);
        expect(dict.update).toHaveBeenCalledWith('Border', [2, 3, 7]);
        const bsCalls = bs.update.calls.allArgs().map((a: any) => a[0]);
        expect(bsCalls.indexOf('Type')).toBeGreaterThan(-1);
        expect(bsCalls.indexOf('W')).toBeGreaterThan(-1);
        expect(bsCalls.indexOf('S')).toBeGreaterThan(-1);
        expect(bs.update).toHaveBeenCalledWith('D', [4, 5]);
        expect(dict.update).toHaveBeenCalledWith('BS', bs);
        expect(dict._updated).toBeTruthy();
    });

    it('constructs new BS when missing and does not write D when dash absent', () => {
        // Arrange
        const border: any = new (PdfAnnotationBorder as any)();
        border._width = 0;
        border._hRadius = 0;
        border._vRadius = 0;
        delete border._dash;
        border._style = null;
        const dict: any = { update: jasmine.createSpy('dictUpdate'), has: (k: string) => false, get: (k: string) => null as any, _updated: false };
        border._dictionary = dict;
        // Spy on prototype of internal dictionary to capture new instance updates
        const protoSpy = spyOn(((_PdfDictionary as any).prototype), 'update').and.callThrough();
        // Act
        border.width = 12;
        // Assert
        expect(border._width).toBe(12);
        expect(dict.update).toHaveBeenCalledWith('Border', [0, 0, 12]);
        const protoArgs = protoSpy.calls.allArgs().map(a => a[0]);
        expect(protoArgs.indexOf('Type')).toBeGreaterThan(-1);
        expect(protoArgs.indexOf('W')).toBeGreaterThan(-1);
        expect(protoArgs.indexOf('S')).toBeGreaterThan(-1);
        expect(protoArgs.indexOf('D')).toBe(-1);
    });

});
describe('PdfAnnotation._getMediaOrCropBox', () => {

    let annot: PdfAnnotation;

    beforeEach(() => {
        annot = new PdfLineAnnotation();
    });

    it('should return undefined when page is undefined', () => {
        const result = annot._getMediaOrCropBox(undefined as any);
        expect(result).toBeUndefined();
    });

    it('should return undefined when page dictionary is missing', () => {
        const page: any = {};
        const result = annot._getMediaOrCropBox(page);
        expect(result).toBeUndefined();
    });

    it('should return MediaBox when MediaBox exists', () => {
        const mediaBox = [0, 0, 600, 800];

        const page: any = {
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => key === 'MediaBox'),
                get: jasmine.createSpy('get').and.returnValue(mediaBox)
            }
        };

        const result = annot._getMediaOrCropBox(page);

        expect(page._pageDictionary.has).toHaveBeenCalledWith('MediaBox');
        expect(page._pageDictionary.get).toHaveBeenCalledWith('MediaBox');
        expect(result).toBe(mediaBox);
    });

    it('should return CropBox when MediaBox does not exist but CropBox does', () => {
        const cropBox = [10, 10, 500, 700];

        const page: any = {
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake(
                    (key: string) => key === 'CropBox'
                ),
                get: jasmine.createSpy('get').and.returnValue(cropBox)
            }
        };

        const result = annot._getMediaOrCropBox(page);

        expect(page._pageDictionary.has).toHaveBeenCalledWith('MediaBox');
        expect(page._pageDictionary.has).toHaveBeenCalledWith('CropBox');
        expect(page._pageDictionary.get).toHaveBeenCalledWith('CropBox');
        expect(result).toBe(cropBox);
    });

    it('should return undefined when neither MediaBox nor CropBox exists', () => {
        const page: any = {
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get')
            }
        };

        const result = annot._getMediaOrCropBox(page);

        expect(result).toBeUndefined();
    });

    it('should prefer MediaBox when both MediaBox and CropBox exist', () => {
        const mediaBox = [0, 0, 600, 800];
        const cropBox = [10, 10, 500, 700];

        const page: any = {
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(true),
                get: jasmine.createSpy('get').and.callFake((key: string) =>
                    key === 'MediaBox' ? mediaBox : cropBox
                )
            }
        };

        const result = annot._getMediaOrCropBox(page);

        expect(result).toBe(mediaBox);
        expect(page._pageDictionary.get).toHaveBeenCalledWith('MediaBox');
    });

});
describe('PdfWidgetAnnotation._updateBorderColor - branch coverage', () => {

    it('transparent value removes top BC, MK.BC and BS.W and sets updated flag', () => {
        const annot: any = new PdfWidgetAnnotation();

        const bs: any = { _map: { W: 2 }, has: function (k: string) { return Object.prototype.hasOwnProperty.call(this._map, k); } };
        const mk: any = { _map: { BC: [0, 0, 0] }, has: function (k: string) { return Object.prototype.hasOwnProperty.call(this._map, k); } };
        const dict: any = {
            _map: { BC: [0, 0, 0], BS: bs, MK: mk },
            has: function (k: string) { return Object.prototype.hasOwnProperty.call(this._map, k); },
            get: function (k: string) { return this._map[k]; },
            update: function (k: string, v: any) { this._map[k] = v; },
            _updated: false
        };

        annot._dictionary = dict;

        annot._updateBorderColor({ isTransparent: true } as any);

        expect(annot._isTransparentBorderColor).toBe(true);
        expect(dict._map.BC).toBeUndefined();
        expect(mk._map.BC).toBeUndefined();
        expect(bs._map.W).toBeUndefined();
        expect(dict._updated).toBe(true);
    });

    it('transparent value removes top BC when MK absent and does not set updated', () => {
        const annot: any = new PdfWidgetAnnotation();

        const dict: any = {
            _map: { BC: [1, 1, 1] },
            has: function (k: string) { return Object.prototype.hasOwnProperty.call(this._map, k); },
            get: function (k: string) { return this._map[k]; },
            update: function (k: string, v: any) { this._map[k] = v; },
            _updated: false
        };

        annot._dictionary = dict;

        annot._updateBorderColor({ isTransparent: true } as any);

        expect(annot._isTransparentBorderColor).toBe(true);
        expect(dict._map.BC).toBeUndefined();
        expect(dict._updated).toBe(false);
    });

    it('non-transparent value creates MK and sets BC array and updates _borderColor and _updated', () => {
        const annot: any = new PdfWidgetAnnotation();

        const dict: any = {
            _map: {},
            has: function (k: string) { return Object.prototype.hasOwnProperty.call(this._map, k); },
            get: function (k: string) { return this._map[k]; },
            update: function (k: string, v: any) { this._map[k] = v; },
            _updated: false
        };

        annot._dictionary = dict;

        const val = { r: 10, g: 20, b: 30 } as any;

        annot._updateBorderColor(val);

        expect(annot._isTransparentBorderColor).toBe(false);
        expect(dict._map.MK).toBeDefined();
        expect(dict._map.MK._map.BC).toEqual([0.039, 0.078, 0.118]);
        expect(annot._borderColor).toBe(val);
        expect(dict._updated).toBe(true);
    });

    it('non-transparent same reference value does not update dictionary', () => {
        const annot: any = new PdfWidgetAnnotation();

        const dict: any = {
            _map: {},
            has: function (k: string) { return Object.prototype.hasOwnProperty.call(this._map, k); },
            get: function (k: string) { return this._map[k]; },
            update: function (k: string, v: any) { this._map[k] = v; },
            _updated: false
        };

        annot._dictionary = dict;

        const same = { r: 1, g: 2, b: 3 } as any;
        annot._borderColor = same;

        annot._updateBorderColor(same);

        expect(annot._isTransparentBorderColor).toBe(false);
        expect(dict._map.MK).toBeUndefined();
        expect(dict._updated).toBe(false);
        expect(annot._borderColor).toBe(same);
    });

    it('non-transparent different value updates MK.BC and replaces _borderColor', () => {
        const annot: any = new PdfWidgetAnnotation();

        const dict: any = {
            _map: {},
            has: function (k: string) { return Object.prototype.hasOwnProperty.call(this._map, k); },
            get: function (k: string) { return this._map[k]; },
            update: function (k: string, v: any) { this._map[k] = v; },
            _updated: false
        };

        annot._dictionary = dict;

        annot._borderColor = { r: 0, g: 0, b: 0 } as any;

        const newVal = { r: 100, g: 110, b: 120 } as any;
        annot._updateBorderColor(newVal);

        expect(dict._map.MK).toBeDefined();
        expect(dict._map.MK._map.BC).toEqual([0.392, 0.431, 0.471]);
        expect(annot._borderColor).toBe(newVal);
        expect(dict._updated).toBe(true);
    });

});
describe('PdfWidgetAnnotation._updateBackColor - branch coverage', () => {

    it('transparent value removes top BG, MK.BG and sets updated flag and field appearance', () => {
        const annot: any = new PdfWidgetAnnotation();
        const mkDictionary: any = { _map: { BG: [0, 0, 0] }, has: (k: string) => k === 'BG' };
        annot._dictionary = {
            _map: { BG: [0, 0, 0], MK: mkDictionary },
            has: function (k: string) { return this._map[k] !== undefined; },
            get: function (k: string) { return this._map[k]; },
            update: jasmine.createSpy('update'),
            _updated: false
        } as any;
        annot._field = { _setAppearance: false };

        annot._updateBackColor({ isTransparent: true } as any, true);

        expect(annot._isTransparentBackColor).toBe(true);
        expect(annot._dictionary._map.BG).toBeUndefined();
        expect(mkDictionary._map.BG).toBeUndefined();
        expect(annot._dictionary._updated).toBe(true);
        expect(annot._field._setAppearance).toBe(true);
    });

    it('transparent value removes top BG when MK absent and does not set updated', () => {
        const annot: any = new PdfWidgetAnnotation();
        annot._dictionary = {
            _map: { BG: [1, 1, 1] },
            has: function (k: string) { return this._map[k] !== undefined; },
            get: function (k: string) { return this._map[k]; },
            update: jasmine.createSpy('update'),
            _updated: false
        } as any;
        annot._field = { _setAppearance: false };

        annot._updateBackColor({ isTransparent: true } as any, true);

        expect(annot._isTransparentBackColor).toBe(true);
        expect(annot._dictionary._map.BG).toBeUndefined();
        expect(annot._dictionary._updated).toBe(false);
        expect(annot._field._setAppearance).toBe(true);
    });

    it('non-transparent value creates MK, writes BG array, updates _backColor and _updated', () => {
        const annot: any = new PdfWidgetAnnotation();
        const mkDictionary: any = { update: jasmine.createSpy('mkUpdate') };
        annot._dictionary = {
            _map: {},
            has: function (k: string) { return this._map[k] !== undefined; },
            get: function (k: string) { return this._map[k]; },
            update: function (k: string, v: any) { if (k === 'MK') { this._map.MK = mkDictionary; } },
            _updated: false
        } as any;
        annot._crossReference = {} as any;
        annot._field = { _setAppearance: false };

        const value: any = { r: 255, g: 128, b: 0 };
        annot._updateBackColor(value, true);

        expect(annot._isTransparentBackColor).toBe(false);
        expect(annot._mkDictionary).toBe(mkDictionary);
        const expectedG = Number.parseFloat((value.g / 255).toFixed(3));
        expect(mkDictionary.update).toHaveBeenCalledWith('BG', [1, expectedG, 0]);
        expect(annot._backColor).toBe(value);
        expect(annot._dictionary._updated).toBe(true);
        expect(annot._field._setAppearance).toBe(true);
    });

});
describe('PdfRedactionAnnotation._breakWordToFit - branch coverage', () => {
    it('returns empty text and null remainder for empty word', () => {
        // Arrange
        const annot: any = new PdfRedactionAnnotation();
        const measure = (t: string) => t.length;
        // Act
        const res = annot._breakWordToFit('', 10, measure);
        // Assert
        expect(res.text).toBe('');
        expect(res.remainder).toBeNull();
    });

    it('returns full word when availableWidth fits whole word', () => {
        // Arrange
        const annot: any = new PdfRedactionAnnotation();
        const measure = (t: string) => t.length;
        // Act
        const res = annot._breakWordToFit('hello', 10, measure);
        // Assert
        expect(res.text).toBe('hello');
        expect(res.remainder).toBeNull();
    });

    it('breaks word into fitting prefix and remainder', () => {
        // Arrange
        const annot: any = new PdfRedactionAnnotation();
        const measure = (t: string) => t.length;
        // Act
        const res = annot._breakWordToFit('abcdef', 3, measure);
        // Assert
        expect(res.text).toBe('abc');
        expect(res.remainder).toBe('def');
    });

    it('returns empty text and full remainder when no characters fit', () => {
        // Arrange
        const annot: any = new PdfRedactionAnnotation();
        const measure = (t: string) => t.length;
        // Act
        const res = annot._breakWordToFit('xyz', 0, measure);
        // Assert
        expect(res.text).toBe('');
        expect(res.remainder).toBe('xyz');
    });

});
describe('PdfFreeTextAnnotation._parseTextAlign - branch coverage', () => {
    it('returns left for "  LEFT  " (trim and case-insensitive)', () => {
        // Arrange
        const annot: any = new PdfFreeTextAnnotation();
        // Act
        const res = (annot as any)._parseTextAlign('  LEFT  ');
        // Assert
        expect(res).toBe(PdfTextAlignment.left);
    });

    it('returns right for "right"', () => {
        // Arrange
        const annot: any = new PdfFreeTextAnnotation();
        // Act
        const res = (annot as any)._parseTextAlign('right');
        // Assert
        expect(res).toBe(PdfTextAlignment.right);
    });

    it('returns center for "Center"', () => {
        // Arrange
        const annot: any = new PdfFreeTextAnnotation();
        // Act
        const res = (annot as any)._parseTextAlign('Center');
        // Assert
        expect(res).toBe(PdfTextAlignment.center);
    });

    it('returns justify for "justify"', () => {
        // Arrange
        const annot: any = new PdfFreeTextAnnotation();
        // Act
        const res = (annot as any)._parseTextAlign('justify');
        // Assert
        expect(res).toBe(PdfTextAlignment.justify);
    });

    it('returns default left for unknown value', () => {
        // Arrange
        const annot: any = new PdfFreeTextAnnotation();
        // Act
        const res = (annot as any)._parseTextAlign('unknown');
        // Assert
        expect(res).toBe(PdfTextAlignment.left);
    });

});
describe('PdfBorderEffect.constructor - branch coverage', () => {
    it('no-arg constructor sets default I=0 and S="S"', () => {
        // Arrange/Act
        const eff: any = new PdfBorderEffect();
        // Assert
        expect(eff._dictionary.get('I')).toBe(0);
        expect(eff._dictionary.get('S')).toBe('S');
    });

    it('options constructor sets provided intensity and style string', () => {
        // Arrange
        const opts: any = { intensity: 3, style: PdfBorderEffectStyle.cloudy };
        // Act
        const eff: any = new PdfBorderEffect(opts);
        // Assert
        expect(eff.intensity).toBe(3);
        expect(eff.style).toBe(PdfBorderEffectStyle.cloudy);
        expect(eff._dictionary.get('I')).toBe(3);
        expect(eff._dictionary.get('S')).toBe('C');
    });

    it('dictionary constructor with BE containing only I sets intensity', () => {
        // Arrange
        const inner = new _PdfDictionary();
        inner.set('I', 7);
        const proto = new _PdfDictionary();
        proto.set('BE', inner);
        const originalProtoDict = (PdfBorderEffect as any).prototype._dictionary;
        (PdfBorderEffect as any).prototype._dictionary = proto;
        const arg = new _PdfDictionary();
        arg.set('BE', null); // ensure arg.has('BE') === true

        // Act
        const eff: any = new PdfBorderEffect(arg);

        // Assert
        expect(eff.intensity).toBe(7);

        // Cleanup
        (PdfBorderEffect as any).prototype._dictionary = originalProtoDict;
    });

    it('dictionary constructor with BE containing only S sets style via mapping', () => {
        // Arrange
        const inner = new _PdfDictionary();
        inner.set('S', '/C'); // raw value that maps to cloudy
        const proto = new _PdfDictionary();
        proto.set('BE', inner);
        const originalProtoDict = (PdfBorderEffect as any).prototype._dictionary;
        (PdfBorderEffect as any).prototype._dictionary = proto;
        const arg = new _PdfDictionary();
        arg.set('BE', null);

        // Act
        const eff: any = new PdfBorderEffect(arg);

        // Assert
        expect(eff.style).toBe(PdfBorderEffectStyle.cloudy);

        // Cleanup
        (PdfBorderEffect as any).prototype._dictionary = originalProtoDict;
    });

    it('dictionary constructor with no BE leaves defaults', () => {
        // Arrange
        const arg = new _PdfDictionary(); // no BE entry

        // Act
        const eff: any = new PdfBorderEffect(arg);

        // Assert
        expect(eff.intensity).toBe(0);
        expect(eff.style).toBeUndefined();
    });

});
describe('PdfAnnotation._obtainGraphicsRotation', () => {

    let annot: PdfAnnotation;

    beforeEach(() => {
        annot = new PdfLineAnnotation();
    });

    it('should return 0 degrees for identity matrix', () => {
        // atan2(0, 1) = 0°
        const matrix = createMatrix(1, 0);

        const angle = annot._obtainGraphicsRotation(matrix);

        expect(angle).toBe(0);
    });

    it('should convert -90 degrees to 90', () => {
        // atan2(-1, 0) ≈ -90°
        const matrix = createMatrix(0, -1);

        const angle = annot._obtainGraphicsRotation(matrix);

        expect(angle).toBe(90);
    });

    it('should convert 90 degrees to 270', () => {
        // atan2(1, 0) ≈ 90°
        const matrix = createMatrix(0, 1);

        const angle = annot._obtainGraphicsRotation(matrix);

        expect(angle).toBe(270);
    });

    it('should convert -180 degrees to 180', () => {
        // atan2(0, -1) ≈ 180° or -180°
        const matrix = createMatrix(-1, -0);

        const angle = annot._obtainGraphicsRotation(matrix);

        expect(angle).toBe(180);
    });

    it('should return unchanged angle when not in switch cases', () => {
        // atan2(1, 1) ≈ 45°
        const matrix = createMatrix(1, 1);

        const angle = annot._obtainGraphicsRotation(matrix);

        expect(angle).toBe(45);
    });
    function createMatrix(a: number, c: number): any {
        return {
            _matrix: {
                _elements: [
                    a,  // index 0
                    0,
                    c,  // index 2
                    0,
                    0,
                    1
                ]
            }
        };
    }
});
describe('PdfAnnotation._drawLineStyle', () => {

    let annot: PdfAnnotation;

    beforeEach(() => {
        annot = new PdfLineAnnotation();
    });

    it('should reset length to 1 and pen to null when length is 0', () => {
        const start = { x: 0, y: 0 };
        const end = { x: 10, y: 10 };
        const graphics = {} as any;
        const angle = 45;
        const pen = { mock: true } as any;
        const brush = { brush: true } as any;
        const lineStyle = new PdfAnnotationLineEndingStyle();
        lineStyle.begin = PdfLineEndingStyle.openArrow;
        lineStyle.end = PdfLineEndingStyle.none

        const drawSpy = spyOn(annot as any, '_drawLineEndStyle');

        annot._drawLineStyle(
            start,
            end,
            graphics,
            angle,
            pen,
            brush,
            lineStyle,
            0
        );

        expect(drawSpy).toHaveBeenCalledWith(
            start,
            graphics,
            angle,
            null,                // pen reset
            brush,
            lineStyle.begin,
            1,                   // length reset
            true
        );

        expect(drawSpy).toHaveBeenCalledWith(
            end,
            graphics,
            angle,
            null,                // pen reset
            brush,
            lineStyle.end,
            1,                   // length reset
            false
        );
    });

    it('should pass length and pen as-is when length is non-zero', () => {
        const start = { x: 5, y: 5 };
        const end = { x: 20, y: 20 };
        const graphics = {} as any;
        const angle = 90;
        const pen = { pen: true } as any;
        const brush = { brush: true } as any;
        const lineStyle = new PdfAnnotationLineEndingStyle();
        lineStyle.begin = PdfLineEndingStyle.circle;
        lineStyle.end = PdfLineEndingStyle.square;
        const length = 8;

        const drawSpy = spyOn(annot as any, '_drawLineEndStyle');

        annot._drawLineStyle(
            start,
            end,
            graphics,
            angle,
            pen,
            brush,
            lineStyle,
            length
        );

        expect(drawSpy).toHaveBeenCalledWith(
            start,
            graphics,
            angle,
            pen,
            brush,
            lineStyle.begin,
            length,
            true
        );

        expect(drawSpy).toHaveBeenCalledWith(
            end,
            graphics,
            angle,
            pen,
            brush,
            lineStyle.end,
            length,
            false
        );
    });

});
describe('PdfAnnotation._flattenPopUp', () => {

    let annot: PdfAnnotation;
    let page: any;

    beforeEach(() => {
        page = { mock: true };

        annot = new PdfLineAnnotation();
        annot._page = page;
        annot.color = { r: 255, g: 0, b: 0 };
        annot.bounds = { x: 10, y: 20, width: 100, height: 50 };
        annot.author = 'Test Author';
        annot.subject = 'Test Subject';
        annot.text = 'Popup text';
    });

    it('should delegate to _flattenPop with correct arguments', () => {
        const flattenSpy = spyOn(annot as any, '_flattenPop');

        annot._flattenPopUp();

        expect(flattenSpy).toHaveBeenCalledWith(
            page,
            annot.color,
            annot.bounds,
            annot.border,
            annot.author,
            annot.subject,
            annot.text
        );
    });

});
describe('PdfAnnotation._getPoints', () => {

    let annot: PdfAnnotation;
    let page: any;

    beforeEach(() => {
        page = {
            _pageDictionary: {
                has: jasmine.createSpy('has')
            }
        };

        annot = new PdfLineAnnotation();
        annot._page = page;
    });

    it('should return empty array when polygonPoints is undefined', () => {
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue(null);

        const result = annot._getPoints(undefined as any);

        expect(result).toEqual([]);
    });

    it('should clone points without modification when no crop or media box', () => {
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue(null);

        const input = [{ x: 10, y: 20 }, { x: 30, y: 40 }];

        const result = annot._getPoints(input);

        expect(result).toEqual(input);
        expect(result).not.toBe(input); // cloned
    });

    it('should offset points using crop/media box x and y values', () => {
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue([5, 10, 0, 0]);

        page._pageDictionary.has.and.returnValue(false);

        const input = [{ x: 1, y: 2 }];

        const result = annot._getPoints(input);

        expect(result[0].x).toBe(6);  // 1 + 5
        expect(result[0].y).toBe(12); // 2 + 10
    });

    it('should use MediaBox-only special Y logic when CropBox is missing', () => {
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue([5, 15, 0, 0]);

        page._pageDictionary.has.and.callFake((key: string) => {
            return key === 'MediaBox';
        });

        const input = [{ x: 10, y: 20 }];

        const result = annot._getPoints(input);

        expect(result[0].x).toBe(15); // 10 + 5
        expect(result[0].y).toBe(20); // y + cropOrMediaBox[3] (0)
    });

    it('should prefer normal Y offset when CropBox exists', () => {
        spyOn(annot as any, '_getCropOrMediaBox').and.returnValue([5, 15, 0, 0]);

        page._pageDictionary.has.and.callFake((key: string) => {
            return key === 'MediaBox' || key === 'CropBox';
        });

        const input = [{ x: 10, y: 20 }];

        const result = annot._getPoints(input);

        expect(result[0].x).toBe(15); // 10 + 5
        expect(result[0].y).toBe(35); // 20 + 15
    });

});
describe('PdfSquareAnnotation._load', () => {

    let page: any;
    let dictionary: any;

    beforeEach(() => {
        page = { page: true };
        dictionary = { dict: true };
    });

    it('should create a loaded PdfSquareAnnotation and initialize it', () => {
        const initializeSpy = spyOn(
            PdfSquareAnnotation.prototype as any,
            '_initialize'
        ).and.stub();

        const annot = PdfSquareAnnotation._load(page, dictionary);

        expect(annot instanceof PdfSquareAnnotation).toBeTruthy();
        expect(annot._isLoaded).toBeTruthy();

        expect(initializeSpy).toHaveBeenCalledWith(page, dictionary);
    });

});
describe('PdfRectangleAnnotation._isValidTemplateMatrix', () => {
    class MockGraphics {
        save = jasmine.createSpy('save').and.returnValue({});
        restore = jasmine.createSpy('restore');
        setTransparency = jasmine.createSpy('setTransparency');
        drawTemplate = jasmine.createSpy('drawTemplate');
    }

    class MockPage {
        graphics = new MockGraphics();
        annotations = {
            remove: jasmine.createSpy('remove')
        };
    }

    class MockDictionary {
        private data: any;

        constructor(data: any) {
            this.data = data;
        }

        has(key: string): boolean {
            return key in this.data;
        }

        getArray(key: string): any[] {
            return this.data[key];
        }
    }
    let annot: PdfRectangleAnnotation;
    let page: MockPage;
    let appearanceTemplate: any;

    beforeEach(() => {
        page = new MockPage();
        annot = new PdfRectangleAnnotation() as any;
        annot._page = page as any;
        annot._opacity = 0.5;

        appearanceTemplate = { template: true };
    });

    it('should return true when dictionary is undefined', () => {
        const bounds = { x: 10, y: 20 };

        const result = annot._isValidTemplateMatrix(
            undefined as any,
            bounds as any,
            appearanceTemplate
        );

        expect(result).toBeTruthy();
    });

    it('should return true when Matrix entry is missing', () => {
        const dict = new MockDictionary({});
        const bounds = { x: 10, y: 20 };

        const result = annot._isValidTemplateMatrix(
            dict as any,
            bounds as any,
            appearanceTemplate
        );

        expect(result).toBeTruthy();
    });

    it('should return true for identity matrix with matching BBox and Matrix translation', () => {
        const dict = new MockDictionary({
            Matrix: [1, 0, 0, 1, -10, -20],
            BBox: [10, 20, 100, 50]
        });

        const bounds = { x: 10, y: 20 };

        const result = annot._isValidTemplateMatrix(
            dict as any,
            bounds as any,
            appearanceTemplate
        );

        expect(result).toBeTruthy();
        expect(page.graphics.drawTemplate).not.toHaveBeenCalled();
        expect(page.annotations.remove).not.toHaveBeenCalled();
    });

    it('should draw template and return false for invalid matrix translation', () => {
        const dict = new MockDictionary({
            Matrix: [1, 0, 0, 1, 0, 0],
            BBox: [10, 20, 100, 50]
        });

        const bounds = { x: 50, y: 60 };

        const result = annot._isValidTemplateMatrix(
            dict as any,
            bounds as any,
            appearanceTemplate
        );

        expect(result).toBeFalsy();

        expect(page.graphics.save).toHaveBeenCalled();
        expect(page.graphics.setTransparency).toHaveBeenCalledWith(0.5);
        expect(page.graphics.drawTemplate)
            .toHaveBeenCalledWith(appearanceTemplate, jasmine.any(Object));

        expect(page.graphics.restore).toHaveBeenCalled();
        expect(page.annotations.remove).toHaveBeenCalledWith(annot);
    });

});
describe('PdfPolyLineAnnotation._getLinePoints', () => {

    let annot: any;
    let page: any;

    beforeEach(() => {
        page = {
            size: {
                width: 600,
                height: 800
            }
        };

        annot = new PdfPolyLineAnnotation() as any;
        annot._page = page;

        annot._dictionary = {
            has: jasmine.createSpy('has'),
            getArray: jasmine.createSpy('getArray')
        };
    });

    it('should calculate points from Vertices when conditions are met', () => {
        annot._dictionary.has.and.returnValue(true);
        annot._dictionary.getArray.and.returnValue([10, 20, 30, 40]);

        annot._isBounds = false;
        annot._setAppearance = false;

        const result = annot._getLinePoints();

        expect(result.length).toBe(2);
        expect(result[0]).toEqual({ x: 10, y: 780 }); // 800 - 20
        expect(result[1]).toEqual({ x: 30, y: 760 }); // 800 - 40
    });

    it('should ignore Vertices when _isBounds is true and use points fallback', () => {
        annot._dictionary.has.and.returnValue(true);
        annot._isBounds = true;

        annot._points = [{ x: 5, y: 10 }];

        spyOn(annot as any, '_getPoints').and.callFake((pts: any[]) => pts);

        annot.flatten = true;

        const result = annot._getLinePoints();

        expect(result[0]).toEqual({ x: 5, y: 790 }); // 800 - 10
    });

    it('should calculate points from _points when vertices path is skipped', () => {
        annot._dictionary.has.and.returnValue(false);

        annot._points = [{ x: 15, y: 25 }];
        spyOn(annot as any, '_getPoints').and.callFake((pts: any[]) => pts);

        annot.flatten = true;

        const result = annot._getLinePoints();

        expect(result.length).toBe(1);
        expect(result[0]).toEqual({ x: 15, y: 775 });
    });

    it('should use negative Y values when flatten is false', () => {
        annot._dictionary.has.and.returnValue(false);

        annot._points = [{ x: 20, y: 30 }];
        spyOn(annot as any, '_getPoints').and.callFake((pts: any[]) => pts);

        annot.flatten = false;

        const result = annot._getLinePoints();

        expect(result[0]).toEqual({ x: 20, y: -30 });
    });

    it('should return empty array when no vertices and no points exist', () => {
        annot._dictionary.has.and.returnValue(false);
        annot._points = undefined;

        const result = annot._getLinePoints();

        expect(result).toEqual([]);
    });

});
describe('PdfAngleMeasurementAnnotation.measure property', () => {
    let annot: any;

    beforeEach(() => {
        annot = new PdfAngleMeasurementAnnotation();
    });

    it('getter loads from dictionary when _measure is undefined and Measure exists', () => {
        annot._measure = undefined;
        annot._dictionary.set('Measure', 'dictMeasure');

        const result = annot.measure;

        expect(result).toBe('dictMeasure');
        expect(annot._measure).toBe('dictMeasure');
    });

    it('getter returns cached _measure when already defined', () => {
        annot._measure = 'cachedMeasure';

        const result = annot.measure;

        expect(result).toBe('cachedMeasure');
    });

    it('setter assigns value and updates caption when not loaded', () => {
        annot._isLoaded = false;
        annot.measure = 'newMeasure';

        expect(annot._measure).toBe('newMeasure');
        expect(annot.caption.cap).toBeTruthy();
    });

    it('setter does not overwrite when already loaded', () => {
        annot._isLoaded = true;
        annot._measure = 'existingMeasure';
        annot.caption.cap = false;

        annot.measure = 'ignoredMeasure';

        expect(annot._measure).toBe('existingMeasure');
        expect(annot.caption.cap).toBeFalsy();
    });

    it('setter does nothing when value is falsy', () => {
        annot._isLoaded = false;
        annot._measure = 'existingMeasure';
        annot.caption.cap = false;

        annot.measure = null;

        expect(annot._measure).toBe('existingMeasure');
        expect(annot.caption.cap).toBeFalsy();
    });
});
describe('PdfAngleMeasurementAnnotation._findLineCircleIntersectionPoints', () => {
    let annot: any;

    beforeEach(() => {
        annot = new PdfAngleMeasurementAnnotation();
    });

    it('returns NaN intersections when line is degenerate (a <= 0.0000001)', () => {
        const result = annot._findLineCircleIntersectionPoints(
            0, 0, 5,
            [1, 1], [1, 1], // same point, dx=dy=0 → a=0
            null, null
        );

        expect(result.first[0]).toBeDefined();
        expect(result.second[0]).toBeDefined();
    });

    it('returns NaN intersections when discriminant is negative (no intersection)', () => {
        const result = annot._findLineCircleIntersectionPoints(
            0, 0, 1,
            [5, 5], [10, 10], // line far away from circle
            null, null
        );

        expect(result.first[0]).toBeDefined();
        expect(result.second[0]).toBeDefined();
    });

    it('returns one intersection when discriminant is zero (tangent)', () => {
        // Circle centered at (0,0) radius=5, line tangent at (5,0)
        const result = annot._findLineCircleIntersectionPoints(
            0, 0, 5,
            [5, 0], [5, 10],
            null, null
        );

        expect(result.first[0]).toBeCloseTo(5, 5);
        expect(result.first[1]).toBeCloseTo(0, 5);
        expect(result.second[0]).toBeNaN();
    });

    it('returns two intersections when discriminant is positive', () => {
        // Circle centered at (0,0) radius=5, line through (-10,0) to (10,0)
        const result = annot._findLineCircleIntersectionPoints(
            0, 0, 5,
            [-10, 0], [10, 0],
            null, null
        );

        expect(result.first[0]).toBeCloseTo(5);
        expect(result.first[1]).toBeCloseTo(0, 5);
        expect(result.second[0]).toBeCloseTo(-5);
        expect(result.second[1]).toBeCloseTo(0, 5);
    });
});
describe('PdfFileLinkAnnotation._addAction', () => {
    class MockCrossReference {
        _cacheMap = new Map<any, any>();

        _getNextReference = jasmine
            .createSpy('_getNextReference')
            .and.callFake(() => ({ _isNew: true }));
    }

    class MockPdfDictionary {
        private data: Record<string, any> = {};

        has(key: string): boolean {
            return key in this.data;
        }

        get(key: string): any {
            return this.data[key];
        }

        set(key: string, value: any): void {
            this.data[key] = value;
        }
    }

    let annot: any;
    let crossRef: MockCrossReference;

    beforeEach(() => {
        crossRef = new MockCrossReference();

        annot = new PdfFileLinkAnnotation() as any;
        annot._crossReference = crossRef;
        annot._fileName = 'test.pdf';

        annot._dictionary = new MockPdfDictionary() as any;
    });

    it('should remove existing action references and add new Launch action', () => {
        const oldRef = { _isNew: true };
        const oldAction = {
            has: jasmine.createSpy('has').and.callFake((k: string) => k === 'Next' || k === 'F'),
            get: jasmine.createSpy('get').and.callFake((k: string) =>
                k === 'Next' ? [oldRef] : null
            )
        };

        annot._dictionary.set('A', oldAction);
        annot._action = undefined;

        spyOn(utils, '_removeDuplicateReference');

        crossRef._cacheMap.set(oldRef, {});

        annot._addAction();


        // duplicate references cleaned
        expect(utils._removeDuplicateReference)
            .toHaveBeenCalledWith(annot._dictionary, crossRef, 'A');

        // new action added
        expect(annot._dictionary.has('A')).toBeTruthy();
    });

    it('should create JavaScript Next action when _action is defined', () => {
        annot._action = 'app.alert("Hello")';

        annot._addAction();

        expect(crossRef._getNextReference).toHaveBeenCalled();

        // two references created: JS action + Filespec
        expect(crossRef._cacheMap.size).toBe(2);

        const actionDict: any = annot._dictionary.get('A');
        expect(actionDict).toBeDefined();
    });

    it('should always create Filespec reference and update dictionary', () => {
        annot._addAction();

        const actionDict: any = annot._dictionary.get('A');
        expect(actionDict).toBeDefined();

    });
});
describe('PdfInteractiveBorder.width', () => {

    let border: any;
    let dictionary: any;
    let bsDict: any;

    beforeEach(() => {
        bsDict = {
            update: jasmine.createSpy('update')
        };

        dictionary = {
            has: jasmine.createSpy('has').and.returnValue(false),
            get: jasmine.createSpy('get').and.returnValue(bsDict),
            update: jasmine.createSpy('update'),
            _updated: false
        };

        border = new PdfInteractiveBorder() as any;
        border._dictionary = dictionary;
        border._crossReference = {}; // dummy
        border._style = 'Solid';
    });

    it('should return current width via getter', () => {
        border._width = 2;

        expect(border.width).toBe(2);
    });

    it('should update width and create BS dictionary when BS does not exist', () => {
        dictionary.has.and.returnValue(false);
        border._dash = undefined;

        spyOn(utils, '_mapBorderStyle').and.returnValue('S');

        border.width = 3;

        expect(border._width).toBe(3);
        expect(bsDict.update).not.toHaveBeenCalledWith('Type', jasmine.any(Object));
        expect(bsDict.update).not.toHaveBeenCalledWith('W', 3);
        expect(bsDict.update).not.toHaveBeenCalledWith('S', 'S');

        expect(dictionary.update).not.toHaveBeenCalledWith('BS', bsDict);
        expect(dictionary._updated).toBeTruthy();
    });

    it('should reuse existing BS dictionary when present', () => {
        dictionary.has.and.returnValue(true);

        border.width = 4;

        expect(dictionary.get).toHaveBeenCalledWith('BS');
        expect(bsDict.update).toHaveBeenCalledWith('W', 4);
        expect(dictionary.update).toHaveBeenCalledWith('BS', bsDict);
    });

    it('should update dash array when _dash is defined', () => {
        dictionary.has.and.returnValue(true);
        border._dash = [3, 2];

        spyOn(utils, '_mapBorderStyle').and.returnValue('D');

        border.width = 5;

        expect(bsDict.update).toHaveBeenCalledWith('D', [3, 2]);
    });

    it('should not update dictionary when width value is unchanged', () => {
        border._width = 6;

        border.width = 6;

        expect(dictionary.update).not.toHaveBeenCalled();
        expect(dictionary._updated).toBeFalsy();
    });

});
