
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PdfAngleMeasurementAnnotation, PdfCircleAnnotation, PdfFreeTextAnnotation, PdfSquareAnnotation, PdfTextMarkupAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfBorderStyle, PdfCircleMeasurementType, PdfLineEndingStyle, PdfRotationAngle, PdfTextAlignment, PdfTextMarkupAnnotationType } from '../src/pdf/core/enumerator';
import { _PdfDictionary } from '../src/pdf/core/pdf-primitives';
import {
    PdfStandardFont,
    PdfFontFamily,
    PdfFontStyle
} from '../src/pdf/core/fonts/pdf-standard-font';

describe('PdfCircleAnnotation highlighted Contents else branch', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let id = 1;
        return {
            _cacheMap: {
                set: () => { /* no-op */ }
            },
            _getNextReference: () => ({
                objId: id++,
                _isNew: true,
                toString: () => `ref_${id}`
            })
        };
    }

    it('covers highlighted else Contents line when _text is empty', () => {
        const a: any = Object.create((PdfCircleAnnotation as any).prototype);

        a._dictionary = createDictionary();
        a._crossReference = createCrossReference();

        a._isLoaded = true;
        a._setAppearance = true;
        a._flatten = false;
        a._unitString = 'cm';
        a._measureType = PdfCircleMeasurementType.diameter;

        // IMPORTANT: empty text forces the highlighted ELSE branch
        a._text = '';

        // ✅ Use a real font instead of mocking internal font APIs
        const font = new PdfStandardFont(
            PdfFontFamily.helvetica,
            10,
            PdfFontStyle.regular
        );

        a._font = font;
        a._pdfFont = undefined;
        a._circleCaptionFont = font;
        a._obtainFont = () => font;

        // Stable deterministic area value
        a._convertToUnit = () => 25.5;
        a._createMeasureDictionary = () => createDictionary();

        a._page = {
            _isNew: false,
            _pageDictionary: createDictionary(),
            size: [500, 500]
        };

        Object.defineProperty(a, 'bounds', {
            configurable: true,
            writable: true,
            value: { x: 0, y: 0, width: 100, height: 50 }
        });

        Object.defineProperty(a, 'border', {
            configurable: true,
            writable: true,
            value: { width: 1 }
        });

        Object.defineProperty(a, 'color', {
            configurable: true,
            writable: true,
            value: { r: 0, g: 0, b: 0 }
        });

        Object.defineProperty(a, 'innerColor', {
            configurable: true,
            get: () => undefined
        });

        a._customTemplate = {
            has: () => false,
            get: () => undefined as any,
            size: 0
        };

        let contentValue: string | undefined;

        const originalUpdate = a._dictionary.update.bind(a._dictionary);
        a._dictionary.update = (key: string, value: any) => {
            if (key === 'Contents') {
                contentValue = value;
            }
            return originalUpdate(key, value);
        };

        expect(() => {
            const template = (PdfCircleAnnotation as any).prototype._createCircleMeasureAppearance.call(a, false);
            expect(template).toBeDefined();
        }).not.toThrow();

        // ✅ This proves the highlighted line executed
        expect(contentValue).toBe('25.50 cm');
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */


describe('PdfSquareAnnotation _createSquareMeasureAppearance highlighted Subject line', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let id: number = 1;
        return {
            _cacheMap: {
                set: () => { /* no-op */ }
            },
            _getNextReference: () => ({
                _isNew: true,
                objId: id++,
                toString: () => `ref_${id}`
            })
        };
    }

    it('covers highlighted Subject update line when subject is undefined', () => {
        const annotation: any = Object.create((PdfSquareAnnotation as any).prototype);

        annotation._dictionary = createDictionary();
        annotation._crossReference = createCrossReference();

        // Important: this makes the final AP/Measure/Contents block execute
        annotation._isLoaded = false;
        annotation._setAppearance = false;
        annotation._flatten = false;
        annotation._unitString = 'cm';
        annotation._text = '';

        const font = new PdfStandardFont(
            PdfFontFamily.helvetica,
            10,
            PdfFontStyle.regular
        );

        annotation._font = font;
        annotation._pdfFont = undefined;
        annotation._circleCaptionFont = font;
        annotation._obtainFont = () => font;

        annotation._calculateAreaOfSquare = () => 16.2;
        annotation._createMeasureDictionary = () => createDictionary();
        annotation._colorToHex = () => '#000000';

        annotation._page = {
            _isNew: false, // avoid _updateBounds branch
            _pageSettings: {},
            size: { width: 500, height: 500 }
        };

        Object.defineProperty(annotation, 'bounds', {
            configurable: true,
            writable: true,
            value: { x: 10, y: 20, width: 100, height: 60 }
        });

        Object.defineProperty(annotation, 'border', {
            configurable: true,
            writable: true,
            value: { width: 1 }
        });

        Object.defineProperty(annotation, 'color', {
            configurable: true,
            writable: true,
            value: { r: 0, g: 0, b: 0 }
        });

        Object.defineProperty(annotation, 'innerColor', {
            configurable: true,
            get: () => undefined
        });

        annotation._customTemplate = {
            has: () => false,
            get: () => undefined as any,
            size: 0
        };

        // Force the highlighted condition to be true
        Object.defineProperty(annotation, 'subject', {
            configurable: true,
            get: () => undefined
        });

        let subjectUpdateCount: number = 0;

        const originalUpdate = annotation._dictionary.update.bind(annotation._dictionary);
        annotation._dictionary.update = (key: string, value: any) => {
            if (key === 'Subject' && value === 'Area Measurement') {
                subjectUpdateCount++;
            }
            return originalUpdate(key, value);
        };

        expect(() => {
            const template = (PdfSquareAnnotation as any).prototype._createSquareMeasureAppearance.call(annotation, false);
            expect(template).toBeDefined();
        }).not.toThrow();

        // One update happens unconditionally,
        // second update proves the highlighted line executed.
        expect(subjectUpdateCount).toBe(2);

        // Optional sanity checks
        expect(annotation._dictionary.get('Contents')).toBe('16.20 sq cm');
        expect(annotation._dictionary.has('Measure')).toBe(true);
        expect(annotation._dictionary.has('DS')).toBe(true);
    });
});

describe('PdfAngleMeasurementAnnotation exact midpoint-angle highlighted branches', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let id: number = 1;
        return {
            _cacheMap: {
                set: () => { /* no-op */ }
            },
            _getNextReference: () => ({
                _isNew: true,
                objId: id++,
                toString: () => `ref_${id}`
            })
        };
    }

    function createAnnotation(): any {
        const annotation: any = new PdfAngleMeasurementAnnotation(
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 }
        );

        annotation._dictionary = createDictionary();
        annotation._crossReference = createCrossReference();
        annotation._page = {
            rotation: 0,
            size: { width: 500, height: 500 }
        };

        annotation._color = { r: 0, g: 0, b: 0 };

        Object.defineProperty(annotation, 'border', {
            configurable: true,
            writable: true,
            value: {
                width: 1,
                style: PdfBorderStyle.solid
            }
        });

        // Use a REAL font to avoid internal font API failures
        const font = new PdfStandardFont(
            PdfFontFamily.helvetica,
            10,
            PdfFontStyle.regular
        );

        annotation._obtainFont = () => font;

        Object.defineProperty(annotation, 'bounds', {
            configurable: true,
            writable: true,
            value: { x: 0, y: 0, width: 20, height: 20 }
        });

        // keep deterministic
        annotation._calculateAngle = () => 30;
        annotation._radius = 5;
        annotation._startAngle = 0;
        annotation._sweepAngle = 30;

        annotation._getAngleBoundsValue = () => [0, 0, 10, 10];
        annotation._obtainLinePoints = () => [
            [-1, 0],
            [0, 0],
            [1, 0]
        ];

        // real path is fine; no custom template shortcut
        annotation._customTemplate = {
            has: () => false,
            get: () => undefined as any,
            size: 0
        };

        return annotation;
    }

    it('covers UP branch (midpointAngle between 45 and 135 degrees)', () => {
        const annotation: any = createAnnotation();

        // midpoint = average(first, second) = [0.1, 1]
        // center = [0, 0]
        // atan2(1, 0.1) ≈ 84° => up = true;
        annotation._firstIntersectionPoint = [0.1, 1];
        annotation._secondIntersectionPoint = [0.1, 1];

        expect(() => {
            const template = annotation._createAngleMeasureAppearance();
            expect(template).toBeDefined();
        }).not.toThrow();

        expect(annotation._dictionary.has('Rect')).toBe(true);
    });

    it('covers LEFT branch in positive-angle block (midpointAngle > 135 degrees)', () => {
        const annotation: any = createAnnotation();

        // midpoint = [-1, 0.1]
        // atan2(0.1, -1) ≈ 174° => positive-angle block final else => left = true;
        annotation._firstIntersectionPoint = [-1, 0.1];
        annotation._secondIntersectionPoint = [-1, 0.1];

        expect(() => {
            const template = annotation._createAngleMeasureAppearance();
            expect(template).toBeDefined();
        }).not.toThrow();

        expect(annotation._dictionary.has('Rect')).toBe(true);
    });
});
describe('PdfAngleMeasurementAnnotation highlighted Subject line', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let id: number = 1;
        return {
            _cacheMap: {
                set: () => { /* no-op */ }
            },
            _getNextReference: () => ({
                _isNew: true,
                objId: id++,
                toString: () => `ref_${id}`
            })
        };
    }

    it('covers highlighted Subject update line when subject is undefined', () => {
        const annotation: any = Object.create((PdfAngleMeasurementAnnotation as any).prototype);

        annotation._dictionary = createDictionary();
        annotation._crossReference = createCrossReference();

        annotation._color = { r: 0, g: 0, b: 0 };
        annotation._radius = 5;
        annotation._startAngle = 0;
        annotation._sweepAngle = 30;

        // line points used for Vertices
        annotation._linePoints = [-1, 0, 0, 0, 1, 0];

        // minimal point geometry
        annotation._obtainLinePoints = () => [
            [-1, 0],
            [0, 0],
            [1, 0]
        ];

        annotation._getAngleBoundsValue = () => [0, 0, 10, 10];
        annotation._calculateAngle = () => Math.PI / 6; // 30 degrees

        Object.defineProperty(annotation, 'border', {
            configurable: true,
            writable: true,
            value: {
                width: 1,
                style: PdfBorderStyle.solid
            }
        });

        Object.defineProperty(annotation, 'color', {
            configurable: true,
            writable: true,
            value: { r: 0, g: 0, b: 0 }
        });

        // Force the condition in the highlighted line
        Object.defineProperty(annotation, 'subject', {
            configurable: true,
            get: () => undefined
        });

        // Keep text empty so the Contents path does not interfere
        Object.defineProperty(annotation, 'text', {
            configurable: true,
            get: () => ''
        });

        // Real font -> avoids _getAscent / _getSize / getLineWidth failures
        const font = new PdfStandardFont(
            PdfFontFamily.helvetica,
            10,
            PdfFontStyle.regular
        );
        annotation._obtainFont = () => font;

        // needed for DS string
        annotation._colorToHex = () => '#000000';

        // values used by midpoint-angle logic
        annotation._firstIntersectionPoint = [0.1, 1];
        annotation._secondIntersectionPoint = [0.1, 1];

        // IMPORTANT: avoid heavy drawing/template branch
        annotation._customTemplate = {
            has: (key: string) => key === 'N',
            get: (_key: string) => ({
                _content: {
                    dictionary: createDictionary()
                }
            }),
            size: 1
        };

        let subjectValue: string | undefined;

        const originalUpdate = annotation._dictionary.update.bind(annotation._dictionary);
        annotation._dictionary.update = (key: string, value: any) => {
            if (key === 'Subject') {
                subjectValue = value;
            }
            return originalUpdate(key, value);
        };

        expect(() => {
            const template = (PdfAngleMeasurementAnnotation as any).prototype._createAngleMeasureAppearance.call(annotation);
            expect(template).toBeDefined();
        }).not.toThrow();

        // ✅ This proves the highlighted line executed
        expect(subjectValue).toBe('Angle Measurement');
        expect(annotation._dictionary.get('Subject')).toBe('Angle Measurement');
    });
});
describe('PdfAngleMeasurementAnnotation manipulate input to cover highlighted angle lines', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let id: number = 1;
        return {
            _cacheMap: {
                set: () => { /* no-op */ }
            },
            _getNextReference: () => ({
                _isNew: true,
                objId: id++,
                toString: () => `ref_${id}`
            })
        };
    }

    function createAnnotation(): any {
        const annotation: any = Object.create((PdfAngleMeasurementAnnotation as any).prototype);

        annotation._dictionary = createDictionary();
        annotation._crossReference = createCrossReference();

        annotation._color = { r: 0, g: 0, b: 0 };
        annotation._radius = 5;
        annotation._startAngle = 0;
        annotation._sweepAngle = 30;

        // minimal line-point data used by the method
        annotation._linePoints = [-1, 0, 0, 0, 1, 0];
        annotation._obtainLinePoints = () => [
            [-1, 0],
            [0, 0],
            [1, 0]
        ];

        annotation._getAngleBoundsValue = () => [0, 0, 10, 10];
        annotation._calculateAngle = () => Math.PI / 6; // 30 degrees, deterministic

        annotation._page = {
            rotation: 0,
            size: { width: 500, height: 500 }
        };

        Object.defineProperty(annotation, 'border', {
            configurable: true,
            writable: true,
            value: {
                width: 1,
                style: PdfBorderStyle.solid
            }
        });

        Object.defineProperty(annotation, 'color', {
            configurable: true,
            writable: true,
            value: { r: 0, g: 0, b: 0 }
        });

        Object.defineProperty(annotation, 'text', {
            configurable: true,
            get: () => ''
        });

        Object.defineProperty(annotation, 'subject', {
            configurable: true,
            get: () => 'Angle Measurement'
        });

        annotation._colorToHex = () => '#000000';

        // Real font => avoids _getAscent / _getSize / getLineWidth failures
        const font = new PdfStandardFont(
            PdfFontFamily.helvetica,
            10,
            PdfFontStyle.regular
        );
        annotation._obtainFont = () => font;

        // IMPORTANT:
        // use the real appearance path (customTemplate false), otherwise the drawString
        // direction block may be skipped after the flags are set.
        annotation._customTemplate = {
            has: () => false,
            get: () => undefined as any,
            size: 0
        };

        // Any valid values are fine because Math.atan2 will be stubbed
        annotation._firstIntersectionPoint = [1, 0];
        annotation._secondIntersectionPoint = [1, 0];

        return annotation;
    }

    it('covers highlighted right = true line by forcing midpointAngle to a small positive value', () => {
        const annotation: any = createAnnotation();

        // midpointAngle ≈ +5.7 degrees
        const atanSpy = spyOn(Math, 'atan2').and.returnValue(0.1);

        expect(() => {
            const template = annotation._createAngleMeasureAppearance();
            expect(template).toBeDefined();
        }).not.toThrow();

        expect(atanSpy).toHaveBeenCalled();
        expect(annotation._dictionary.has('Rect')).toBe(true);
        expect(annotation._dictionary.has('Measure')).toBe(true);
        expect(annotation._dictionary.has('AP')).toBe(true);
    });

    it('covers highlighted left = true line by forcing midpointAngle to a large negative value', () => {
        const annotation: any = createAnnotation();

        // midpointAngle ≈ -177.6 degrees
        // after midpointAngle = -midpointAngle => 177.6 => final else => left = true
        const atanSpy = spyOn(Math, 'atan2').and.returnValue(-3.1);

        expect(() => {
            const template = annotation._createAngleMeasureAppearance();
            expect(template).toBeDefined();
        }).not.toThrow();

        expect(atanSpy).toHaveBeenCalled();
        expect(annotation._dictionary.has('Rect')).toBe(true);
        expect(annotation._dictionary.has('Measure')).toBe(true);
        expect(annotation._dictionary.has('AP')).toBe(true);
    });
});
describe('PdfTextMarkupAnnotation constructor highlighted innerColor line', () => {
    it('covers highlighted innerColor assignment line by passing innerColor in properties', () => {
        const annotation = new PdfTextMarkupAnnotation(
            'Water Mark',
            { x: 10, y: 20, width: 100, height: 30 },
            {
                innerColor: { r: 0, g: 0, b: 255 }
            }
        );

        expect(annotation).toBeDefined();

        // The highlighted line executes through the setter:
        // this.innerColor = properties.innerColor;
        //
        // We assert through the instance field and dictionary state.
        expect((annotation as any)._innerColor).toEqual({ r: 0, g: 0, b: 255 });

        const dictionary: _PdfDictionary = (annotation as any)._dictionary;
        expect(dictionary).toBeDefined();

        // Inner color setter should persist the color in the dictionary.
        // In this codebase, inner color is stored as normalized RGB array.
        expect(dictionary.has('IC')).toBe(true);
        expect(dictionary.getArray('IC')).toEqual([0, 0, 1]);
    });
});

describe('PdfTextMarkupAnnotation boundsCollection setter highlighted empty-array branch', () => {
    it('covers _quadPoints = new Array(8) and _boundsCollection = value when not loaded and value is empty', () => {
        const annotation: any = Object.create((PdfTextMarkupAnnotation as any).prototype);

        // Force the setter into the exact highlighted branch
        annotation._isLoaded = false;
        annotation._boundsCollection = [{ x: 1, y: 2, width: 3, height: 4 }]; // prove replacement happens
        annotation._quadPoints = undefined;
        annotation._isChanged = false;

        // Minimal dictionary/page are not required for this branch,
        // because the highlighted lines execute before any dictionary/page access.
        annotation._dictionary = {
            update: () => { /* no-op */ }
        };

        const value: any[] = [];

        expect(() => {
            annotation.boundsCollection = value;
        }).not.toThrow();

        // ✅ proves first highlighted line executed
        expect(Array.isArray(annotation._quadPoints)).toBe(true);
        expect(annotation._quadPoints.length).toBe(8);

        // ✅ proves second highlighted line executed
        expect(annotation._boundsCollection).toBe(value);
        expect(annotation._boundsCollection.length).toBe(0);

        // branch also sets change flag
        expect(annotation._isChanged).toBe(true);
    });
});
describe('PdfTextMarkupAnnotation _doPostProcess highlighted lines', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let id = 1;
        return {
            _cacheMap: {
                set: () => { /* no-op */ }
            },
            _getNextReference: () => ({
                _isNew: true,
                objId: id++,
                toString: () => `ref_${id}`
            })
        };
    }

    it('covers default parameter line and existing AP branch in _doPostProcess', () => {
        const annotation: any = Object.create((PdfTextMarkupAnnotation as any).prototype);

        annotation._dictionary = createDictionary();
        annotation._crossReference = createCrossReference();

        // Reach the loaded + setAppearance path
        annotation._isLoaded = true;
        annotation._setAppearance = true;

        // Existing AP is required to hit the highlighted if (this._dictionary.has("AP"))
        const oldAp: _PdfDictionary = createDictionary();
        oldAp.set('N', { old: true });
        annotation._dictionary.set('AP', oldAp);

        // Minimal fake appearance template returned by _createMarkupAppearance
        const fakeTemplate: any = {
            _content: {
                dictionary: createDictionary(),
                reference: undefined
            }
        };

        annotation._createMarkupAppearance = () => fakeTemplate;

        expect(() => {
            // no argument on purpose -> hits:
            // _doPostProcess(isFlatten: boolean = false)
            annotation._doPostProcess();
        }).not.toThrow();

        // appearance template should have been created
        expect(annotation._appearanceTemplate).toBe(fakeTemplate);

        // AP should still exist and be replaced with a new dictionary containing N
        expect(annotation._dictionary.has('AP')).toBe(true);
        const newAp: _PdfDictionary = annotation._dictionary.get('AP') as _PdfDictionary;
        expect(newAp).toBeDefined();
        expect(newAp).not.toBe(oldAp);
        expect(newAp.has('N')).toBe(true);

        // The template content should have received a reference
        expect(fakeTemplate._content.reference).toBeDefined();
    });
});

describe('PdfTextMarkupAnnotation _postProcess highlighted AP-removal branch', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let seed: number = 1;
        const cache = new Map<any, any>();
        return {
            _cacheMap: {
                set: (key: any, value: any) => cache.set(key, value)
            },
            _getNextReference: () => ({
                _isNew: true,
                objId: seed++,
                toString: () => `ref_${seed}`
            })
        };
    }
    it('covers the highlighted if(this._dictionary.has(\"AP\")) branch in _postProcess', () => {
        const annotation: any = Object.create((PdfTextMarkupAnnotation as any).prototype);
        annotation._dictionary = createDictionary();
        annotation._crossReference = createCrossReference();
        // Required preconditions for _postProcess()
        annotation._setAppearance = true;
        annotation._isChanged = false;
        annotation._isLoaded = false;
        annotation._textMarkupType = PdfTextMarkupAnnotationType.highlight;
        annotation._boundsCollection = [];
        annotation._text = undefined;
        annotation._page = {
            size: { width: 500, height: 500 }
        };

        Object.defineProperty(annotation, 'bounds', {
            configurable: true,
            writable: true,
            value: { x: 10, y: 20, width: 100, height: 30 }
        });

        Object.defineProperty(annotation, 'border', {
            configurable: true,
            writable: true,
            value: { width: 1 }
        });

        // IMPORTANT:
        // Put an existing AP dictionary so the highlighted branch is definitely entered.
        const oldAp: _PdfDictionary = createDictionary();
        oldAp.set('N', { old: true });
        annotation._dictionary.set('AP', oldAp);

        // Minimal safe appearance template returned by _createMarkupAppearance()
        const fakeTemplate: any = {
            _content: {
                dictionary: createDictionary(),
                reference: undefined
            }
        };

        annotation._createMarkupAppearance = jasmine
            .createSpy('_createMarkupAppearance')
            .and.returnValue(fakeTemplate);

        expect(() => {
            (PdfTextMarkupAnnotation as any).prototype._postProcess.call(annotation);
        }).not.toThrow();

        // STRICT verification that the branch path executed:
        // 1) markup appearance was created
        expect(annotation._createMarkupAppearance).toHaveBeenCalled();

        // 2) AP still exists after processing
        expect(annotation._dictionary.has('AP')).toBe(true);

        // 3) the old AP object was replaced with a NEW AP dictionary
        const newAp: _PdfDictionary = annotation._dictionary.get('AP') as _PdfDictionary;
        expect(newAp).toBeDefined();
        expect(newAp).not.toBe(oldAp);

        // 4) the new AP dictionary has N set to the new reference
        expect(newAp.has('N')).toBe(true);

        // 5) the appearance content got a reference assigned
        expect(fakeTemplate._content.reference).toBeDefined();

        // 6) the method completed and reset change flag as expected
        expect(annotation._isChanged).toBe(false);
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

import { PdfRubberStampAnnotation } from '../src/pdf/core/annotations/annotation';
describe('PdfRubberStampAnnotation constructor highlighted innerColor line', () => {
    it('covers highlighted innerColor assignment line by passing innerColor in properties', () => {
        const annotation = new PdfRubberStampAnnotation(
            { x: 10, y: 20, width: 100, height: 40 },
            {
                innerColor: { r: 0, g: 0, b: 255 }
            }
        );

        expect(annotation).toBeDefined();

        const raw = annotation as any;
        const dictionary: _PdfDictionary = raw._dictionary;

        // STRICT proof that the highlighted line executed:
        // constructor -> this.innerColor = properties.innerColor;
        expect(raw._innerColor).toEqual({ r: 0, g: 0, b: 255 });

        // innerColor setter persists normalized color in IC
        expect(dictionary).toBeDefined();
        expect(dictionary.has('IC')).toBe(true);
        expect(dictionary.getArray('IC')).toEqual([0, 0, 1]);
    });
});
describe('PdfFreeTextAnnotation constructor highlighted subject line', () => {
    it('covers highlighted subject assignment line by passing subject in properties', () => {
        const annotation = new PdfFreeTextAnnotation(
            { x: 10, y: 20, width: 100, height: 40 },
            {
                subject: 'Important Subject'
            }
        );

        expect(annotation).toBeDefined();

        const raw: any = annotation;
        const dictionary: _PdfDictionary = raw._dictionary;

        // STRICT proof that the highlighted constructor line executed:
        // this.subject = properties.subject;
        expect(annotation.subject).toBe('Important Subject');
        expect(raw._subject).toBe('Important Subject');

        // subject setter writes "Subj"
        expect(dictionary).toBeDefined();
        expect(dictionary.get('Subj')).toBe('Important Subject');
    });
});

describe('PdfFreeTextAnnotation _updateStyle highlighted lines', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    it('covers textAlignment assignment and underline+bold decoration line strictly', () => {
        const annotation: any = Object.create((PdfFreeTextAnnotation as any).prototype);

        annotation._dictionary = createDictionary();
        annotation.text = 'Sample text';

        // Keep helper output deterministic
        annotation._colorToHex = (value: number[]) => {
            if (!value) {
                return '#000000';
            }
            const [r, g, b] = value;

            const hex = (n: number) => {
                const value = n.toString(16);
                return value.length === 1 ? '0' + value : value;
            };

            return `#${hex(r)}${hex(g)}${hex(b)}`;
        };
        annotation._getXmlFormattedString = (value: string) => value;

        const font: any = {
            _metrics: { _name: 'Helvetica' },
            size: 10,
            style: PdfFontStyle.bold,
            isBold: true,
            isItalic: false,
            isUnderline: true,
            isStrikeout: false
        };

        const color = { r: 255, g: 0, b: 0 };

        expect(() => {
            (PdfFreeTextAnnotation as any).prototype._updateStyle.call(
                annotation,
                font,
                color,
                PdfTextAlignment.left
            );
        }).not.toThrow();

        // STRICT proof:
        // 1) highlighted textAlignment line executed
        // 2) highlighted underline+bold decoration line executed
        const rc: string = annotation._dictionary.get('RC');

        expect(rc).toContain('text-align:left;');
        expect(rc).toContain('text-decoration:word');
        expect(rc).toContain('font-style:bold');
        expect(rc).toContain('Sample text');

        // Also verify DS was written correctly
        const ds: string = annotation._dictionary.get('DS');
        expect(ds).toContain('font:Helvetica 10pt');
        expect(ds).toContain('style:');
        expect(ds).toContain('color:#ff0000');
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

import { PdfRedactionAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';

describe('PdfRedactionAnnotation _doPostProcess highlighted AP/N import path', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let id = 1;
        return {
            _cacheMap: {
                set: () => { /* no-op */ }
            },
            _getNextReference: () => ({
                _isNew: true,
                objId: id++,
                toString: () => `ref_${id}`
            })
        };
    }

    it('covers default parameter line safely', () => {
        const annotation: any = Object.create((PdfRedactionAnnotation as any).prototype);

        annotation._dictionary = createDictionary();
        annotation._crossReference = createCrossReference();
        annotation._isImported = true; // exits early after default-param evaluation

        expect(() => {
            // no argument => hits: if (isFlatten === void 0) { isFlatten = false; }
            annotation._doPostProcess();
        }).not.toThrow();
    });

    it('covers highlighted dictionary.has("N"), appearanceStream, reference and PdfTemplate import lines', () => {
        const annotation: any = Object.create((PdfRedactionAnnotation as any).prototype);
        const xref: any = createCrossReference();

        annotation._dictionary = createDictionary();
        annotation._crossReference = xref;

        annotation._isImported = false;
        annotation._isLoaded = false;
        annotation._appearanceTemplate = undefined;

        // Force the code into:
        //   else { this._postProcess(isFlatten); if (!this._appearanceTemplate) { if (isFlatten) { ... AP/N import path ... } } }
        annotation._postProcess = () => { /* no-op */ };

        annotation._page = {
            annotations: {
                remove: () => { /* no-op */ }
            }
        };

        // After _appearanceTemplate is created, the flatten code continues.
        // Keep that part stable.
        annotation._validateTemplateMatrix = () => true;
        annotation._flattenAnnotationTemplate = () => { /* no-op */ };

        // Create a REAL valid appearance stream using PdfTemplate
        const sourceTemplate: any = new PdfTemplate([0, 0, 20, 10], xref);
        const appearanceStream: any = sourceTemplate._content;

        const reference: any = {
            _isNew: false,
            objId: 99,
            toString: () => 'ref_99'
        };

        const ap: any = createDictionary();
        ap.set('N', appearanceStream);
        ap.getRaw = (key: string) => key === 'N' ? reference : undefined;

        annotation._dictionary.set('AP', ap);

        expect(() => {
            // isFlatten = true forces the exact highlighted AP/N import path
            annotation._doPostProcess(true);
        }).not.toThrow();

        // STRICT proof that the highlighted lines executed:
        // 1) reference line executed
        expect(appearanceStream.reference).toBe(reference);

        // 2) PdfTemplate(appearanceStream, xref) line executed
        expect(annotation._appearanceTemplate).toBeDefined();
        expect(annotation._appearanceTemplate._content).toBeDefined();
    });
});
describe('PdfRedactionAnnotation _drawWrappedTextAligned highlighted repeatedThisLine break', () => {
    function createAnnotation(): any {
        const annotation: any = new PdfRedactionAnnotation({
            x: 0,
            y: 0,
            width: 100,
            height: 40
        });

        // Minimal safe font object; drawString should never actually be called in this test.
        annotation._font = {
            _getHeight: () => 10,
            measureString: (_text: string) => ({ width: 10, height: 10 })
        };

        // Make the branch deterministic
        annotation._getLineHeight = () => 10;
        annotation._getSpaceWidth = () => 2;
        annotation._measureText = (_text: string) => 1;

        // This method must NOT be reached in this specific branch,
        // but keep it defined to avoid accidental failures.
        annotation._breakWordToFit = () => ({
            text: '',
            remainder: null as any
        });

        return annotation;
    }

    it('covers the highlighted break when repeatedThisLine > 1 and lineWords.length === 0', () => {
        const annotation: any = createAnnotation();

        let drawStringCalled = false;
        let breakWordCalled = false;

        const graphics: any = {
            drawString: () => {
                drawStringCalled = true;
            }
        };

        annotation._breakWordToFit = () => {
            breakWordCalled = true;
            return {
                text: '',
                remainder: null as any
            };
        };

        expect(() => {
            const result: number = annotation._drawWrappedTextAligned(
                graphics,
                0,      // startX
                0,      // startY
                100,    // availableWidth
                20,     // availableHeight
                [],     // words -> IMPORTANT: empty list forces exhausted path immediately
                0,      // startIndex
                0,      // alignment
                {},     // brush
                true    // loopWhenExhausted -> IMPORTANT: enables repeatedThisLine path
            );

            // Strict result: idx never advances because there are no words
            expect(result).toBe(0);
        }).not.toThrow();

        // Strict proof of the targeted branch behavior:
        // the loop exits before any word-fitting or drawing can happen.
        expect(drawStringCalled).toBe(false);
        expect(breakWordCalled).toBe(false);
    });
});
describe('PdfFreeTextAnnotation _createAppearance highlighted RD=true branch', () => {
    function createDictionary(): _PdfDictionary {
        return new _PdfDictionary();
    }

    function createCrossReference(): any {
        let id: number = 1;
        return {
            _cacheMap: {
                set: () => { /* no-op */ }
            },
            _getNextReference: () => ({
                _isNew: true,
                objId: id++,
                toString: () => `ref_${id}`
            })
        };
    }

    it('covers highlighted rectangle = [rectangle[0], -rectangle[1], rectangle[2], -rectangle[3]] line strictly', () => {
        // ✅ Use a real instance (safer than Object.create)
        const annotation: any = new PdfFreeTextAnnotation(
            { x: 10, y: 20, width: 100, height: 40 },
            { text: 'sample text' }
        );

        annotation._dictionary = createDictionary();

        // ✅ CRITICAL: this makes the highlighted nested ELSE branch reachable
        annotation._dictionary.set('RD', [0, 0, 0, 0]);

        annotation._crossReference = createCrossReference();

        annotation._page = {
            size: { width: 500, height: 500 },
            _pageDictionary: createDictionary(),
            _pageSettings: {
                margins: {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                }
            }
        };

        annotation._cropBoxValueX = 0;
        annotation._cropBoxValueY = 0;
        annotation._isAllRotation = false;
        annotation._isLoaded = false;
        annotation._setAppearance = false;
        annotation._lineEndingStyle = PdfLineEndingStyle.none;
        annotation._opacity = 1;
        annotation._text = 'sample text';

        Object.defineProperty(annotation, 'rotate', {
            configurable: true,
            get: () => 0
        });

        Object.defineProperty(annotation, 'rotationAngle', {
            configurable: true,
            get: () => PdfRotationAngle.angle0
        });

        Object.defineProperty(annotation, 'flatten', {
            configurable: true,
            get: () => false
        });

        Object.defineProperty(annotation, 'bounds', {
            configurable: true,
            writable: true,
            value: { x: 10, y: 20, width: 100, height: 40 }
        });

        Object.defineProperty(annotation, 'border', {
            configurable: true,
            writable: true,
            value: { width: 1, style: 0 }
        });

        Object.defineProperty(annotation, 'color', {
            configurable: true,
            writable: true,
            value: { r: 0, g: 0, b: 0 }
        });

        Object.defineProperty(annotation, 'textMarkUpColor', {
            configurable: true,
            get: () => undefined
        });

        // ✅ CRITICAL: force the calloutLines branch
        annotation._calloutLines = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
        Object.defineProperty(annotation, 'calloutLines', {
            configurable: true,
            get: () => annotation._calloutLines
        });

        // ✅ Real font avoids internal font API failures
        const font = new PdfStandardFont(
            PdfFontFamily.helvetica,
            10,
            PdfFontStyle.regular
        );
        annotation._font = font;
        annotation._markUpFont = font;

        // ✅ CRITICAL FIX: must be FALSE so method goes into the real ELSE block
        annotation._customTemplate = {
            has: () => false,
            get: () => undefined as any,
            size: 0
        };

        // Keep downstream behavior deterministic
        annotation._drawCallOuts = () => { /* no-op */ };
        annotation._drawLineEndStyle = () => { /* no-op */ };
        annotation._drawFreeTextRectangle = () => { /* no-op */ };
        annotation._drawFreeMarkUpText = () => { /* no-op */ };

        annotation._obtainText = () => 'sample text';
        annotation._obtainTextAlignment = () => 0;
        annotation._obtainColor = () => ({ r: 0, g: 0, b: 0 });

        // ✅ This is the rectangle that the highlighted line transforms
        annotation._obtainStyle = () => [5, 6, 70, 30];

        // Used both before and after the highlighted line
        annotation._obtainAppearanceBounds = () => [0, 0, 100, 50];
        annotation._obtainLinePoints = () => [0, 0, 10, 10];
        annotation._getAngle = () => 0;
        annotation._getAxisValue = () => ({ x: 0, y: 0 });

        // Some branches call this helper; keep it deterministic
        annotation._getRotationAngle = () => 0;

        // ✅ STRICT proof: capture rectangle right after the highlighted line
        let capturedRectangle: number[] | undefined;
        annotation._calculateRectangle = (rect: number[]) => {
            capturedRectangle = rect.slice();
        };

        expect(() => {
            const template = (PdfFreeTextAnnotation as any).prototype._createAppearance.call(annotation);
            expect(template).toBeDefined();
        }).not.toThrow();

        // Before highlighted line: [5, 6, 70, 30]
        // After highlighted line:  [5, -6, 70, -30]
        expect(capturedRectangle).toEqual([5, -6, 70, -30]);
    });
});
