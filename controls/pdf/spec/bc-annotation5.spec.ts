/* eslint-disable @typescript-eslint/no-explicit-any */

import * as primitives from '../src/pdf/core/pdf-primitives';
import * as annotationModule from '../src/pdf/core/annotations/annotation';
import * as templateModule from '../src/pdf/core/graphics/pdf-template';
import * as utils from '../src/pdf/core/utils';
import * as pageModule from '../src/pdf/core/pdf-page';
import * as enumModule from '../src/pdf/core/enumerator';

describe('annotation.js uncovered branches', () => {
    let refId: number;

    function _createReference(isNew: boolean = true): any {
        return {
            _isNew: isNew,
            _isNewReference: isNew,
            objectNumber: ++refId,
            generationNumber: 0
        };
    }

    function _createDictionary(seed?: { [key: string]: any }): any {
        const store: Map<string, any> = new Map<string, any>();
        if (seed) {
            Object.keys(seed).forEach((key: string) => store.set(key, seed[key]));
        }
        return {
            _updated: false,
            _map: store,
            has: (key: string) => store.has(key),
            get: (key: string) => store.get(key),
            _get: (key: string) => store.get(key),
            getRaw: (key: string) => store.get(key),
            getArray: (key: string) => store.get(key),
            set: (key: string, value: any) => {
                store.set(key, value);
            },
            update: (key: string, value: any) => {
                store.set(key, value);
            }
        };
    }

    function _createCrossReference(): any {
        let id: number = 0;
        const cacheMap: Map<any, any> = new Map<any, any>();
        return {
            _cacheMap: cacheMap,
            _newLine: '\r\n',
            _getNextReference: () => {
                id += 1;
                return { objectNumber: id, generationNumber: 0, _isNew: true };
            },
            _writeObject: jasmine.createSpy('_writeObject')
        };
    }

    function _createAppearanceTemplate(withMatrix: boolean = false, bbox?: number[]): any {
        const dictionary: any = _createDictionary({
            BBox: bbox || [4, 6, 40, 20]
        });
        if (withMatrix) {
            dictionary.set('Matrix', [1, 0, 0, 1, 0, 0]);
        }
        return {
            _size: { width: 40, height: 20 },
            graphics: {
                save: jasmine.createSpy('save').and.returnValue({}),
                restore: jasmine.createSpy('restore'),
                setTransparency: jasmine.createSpy('setTransparency'),
                drawTemplate: jasmine.createSpy('drawTemplate'),
                drawString: jasmine.createSpy('drawString'),
                drawRectangle: jasmine.createSpy('drawRectangle'),
                drawLine: jasmine.createSpy('drawLine'),
                drawPath: jasmine.createSpy('drawPath'),
                translateTransform: jasmine.createSpy('translateTransform'),
                setClip: jasmine.createSpy('setClip')
            },
            _content: {
                reference: undefined,
                dictionary
            }
        };
    }

    function _createPage(rotation?: any): any {
        const annotsRaw: any[] = [];
        const annotations: any[] = [];
        return {
            _isNew: false,
            rotation,
            size: { width: 500, height: 700 },
            graphics: {
                save: jasmine.createSpy('save').and.returnValue({}),
                restore: jasmine.createSpy('restore'),
                setTransparency: jasmine.createSpy('setTransparency'),
                drawTemplate: jasmine.createSpy('drawTemplate'),
                drawString: jasmine.createSpy('drawString')
            },
            _pageDictionary: {
                has: (key: string) => key === 'Annots' || key === 'Rotate',
                getRaw: (key: string) => key === 'Annots' ? annotsRaw : undefined,
                get: (key: string) => key === 'Rotate' ? rotation : undefined
            },
            annotations: {
                remove: jasmine.createSpy('remove').and.callFake((value: any) => {
                    const index: number = annotations.indexOf(value);
                    if (index >= 0) {
                        annotations.splice(index, 1);
                    }
                }),
                removeAt: jasmine.createSpy('removeAt'),
                _items: annotations
            },
            __annotsRaw: annotsRaw,
            _origin: [0, 0]
        };
    }
    function _construct<T>(Ctor: any, args: any[] = []): T {
        switch (args.length) {
            case 0:
                return new Ctor() as T;
            case 1:
                return new Ctor(args[0]) as T;
            case 2:
                return new Ctor(args[0], args[1]) as T;
            case 3:
                return new Ctor(args[0], args[1], args[2]) as T;
            case 4:
                return new Ctor(args[0], args[1], args[2], args[3]) as T;
            default: {

                const bindArgs: any = [null].concat(args);
                const bound: any = Function.prototype.bind.apply(Ctor, bindArgs);

                return new bound() as T;
            }
        }
    }

    /**
     * Creates a real instance without touching .prototype manually.
     * If constructor invocation fails, falls back to _load(...) and flips _isLoaded to false.
     */
    function _createNewAnnotation<T>(Ctor: any, args: any[] = [], page?: any, dictionary?: any): T {
        const actualPage: any = page || _createPage();
        const actualDictionary: any = dictionary || _createDictionary();
        let instance: any;
        try {
            instance = _construct<T>(Ctor, args);
        } catch (e) {
            if (Ctor && typeof Ctor._load === 'function') {
                instance = Ctor._load(actualPage, actualDictionary);
                instance._isLoaded = false;
            } else {
           throw e;
            }
        }
        if (!instance._page) {
            instance._page = actualPage;
        }
        if (!instance._dictionary) {
            instance._dictionary = actualDictionary;
        }
        if (typeof instance._isLoaded === 'undefined') {
            instance._isLoaded = false;
        }
        return instance as T;
    }

    /**
     * Creates a loaded annotation instance using the actual factory when available.
     */
    function _createLoadedAnnotation<T>(Ctor: any, page?: any, dictionary?: any, args: any[] = []): T {
        const actualPage: any = page || _createPage();
        const actualDictionary: any = dictionary || _createDictionary();

        if (Ctor && typeof Ctor._load === 'function') {
            return Ctor._load(actualPage, actualDictionary) as T;
        }

        const instance: any = _construct<T>(Ctor, args);
        instance._isLoaded = true;
        if (typeof instance._initialize === 'function') {
            instance._initialize(actualPage, actualDictionary);
        } else {
            instance._page = actualPage;
            instance._dictionary = actualDictionary;
        }
        return instance as T;
    }
    beforeEach(() => {
        refId = 0;
    });


    describe('PdfPolygonAnnotation._getLinePoints', () => {
        it('covers vertices transform branches for 90, 180 and 270 rotation', () => {
            const PdfPolygonAnnotation: any = (annotationModule as any).PdfPolygonAnnotation;
            const polygon: any = _createNewAnnotation<any>(PdfPolygonAnnotation);
            const points: number[] = [10, 20, 40, 50, 80, 100];

            polygon._dictionary = _createDictionary({ Vertices: points });
            polygon._page = _createPage();
            polygon._page.size = { width: 300, height: 400 };
            polygon._page._pageDictionary = {
                has: (key: string) => key === 'Rotate',
                get: (_key: string) => 0
            };
            polygon._isBounds = false;
            polygon._pageRotation = undefined;
            polygon._page._origin = [0, 0];

            polygon._pageRotation = enumModule.PdfRotationAngle.angle90;
            let result: any[] = polygon._getLinePoints();
            expect(result.length).toBe(3);

            polygon._pageRotation = enumModule.PdfRotationAngle.angle180;
            result = polygon._getLinePoints();
            expect(result.length).toBe(3);

            polygon._pageRotation = enumModule.PdfRotationAngle.angle270;
            result = polygon._getLinePoints();
            expect(result.length).toBe(3);
        });
    });
    describe('PdfInkAnnotation', () => {
        it('covers loaded flatten without AP creation, popup removal and matrix update', () => {
            const PdfInkAnnotation: any = (annotationModule as any).PdfInkAnnotation;
            const page: any = _createPage();
            const popupRef: any = _createReference();
            const template: any = _createAppearanceTemplate(false, [1, 2, 10, 12]);

            page.__annotsRaw.push(_createReference(false), popupRef);

            const annot: any = _createLoadedAnnotation<any>(
                PdfInkAnnotation,
                page,
                _createDictionary({
                    Popup: popupRef
                })
            );

            annot._page = page;
            annot._crossReference = _createCrossReference();
            annot._customTemplate = { size: 0, get: jasmine.createSpy('get') };
            annot._setAppearance = false;
            annot._inkPointsCollection = [[1, 2], [3, 4], [5, 6]];
            annot._obtainInkListCollection = jasmine.createSpy('_obtainInkListCollection').and.returnValue([1, 2, 3, 4, 5, 6]);
            annot._getInkBoundsValue = jasmine.createSpy('_getInkBoundsValue').and.returnValue([10, 20, 30, 40]);
            annot._getRotationAngle = jasmine.createSpy('_getRotationAngle').and.returnValue(0);
            annot._createInkAppearance = jasmine.createSpy('_createInkAppearance').and.returnValue(template);
            annot._validateTemplateMatrix = jasmine.createSpy('_validateTemplateMatrix').and.returnValue(true);
            annot._flattenAnnotationTemplate = jasmine.createSpy('_flattenAnnotationTemplate');
            annot.flattenPopups = false;

            spyOn(templateModule as any, 'PdfTemplate').and.callFake(() => _createAppearanceTemplate(false, [1, 2, 10, 12]));
            spyOn(utils as any, '_convertNumberToPointArrays').and.returnValue([[{ x: 1, y: 2 }]]);

            annot._doPostProcess(true);
            expect(annot._flattenAnnotationTemplate).toHaveBeenCalled();
            expect(page.annotations.removeAt).toHaveBeenCalled();
        });

        it('covers calculateInkBounds crop/media and updateInkListCollection branches', () => {
            const PdfInkAnnotation: any = (annotationModule as any).PdfInkAnnotation;
            const annot: any = _createNewAnnotation<any>(PdfInkAnnotation);

            annot._isFlatten = false;
            annot._setAppearance = true;
            annot._dictionary = _createDictionary({ Rect: [1, 2, 3, 4] });
            annot._points = undefined;
            annot._getCropOrMediaBox = jasmine.createSpy('_getCropOrMediaBox').and.returnValue([2, 3, 0, 0]);
            annot._updateInkListCollection = jasmine.createSpy('_updateInkListCollection');

            const bounds: number[] = annot._calculateInkBounds(
                [[10, 10], [20, 30], [40, 50], [5, 8], [35, 60], [15, 12]],
                [0, 0, 100, 100],
                2,
                true,
                [[1, 2, 3]]
            );

            expect(bounds.length).toBe(4);
            expect(annot._updateInkListCollection).toHaveBeenCalled();

            annot._points = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
            spyOn(utils as any, '_convertPointToNumberArray').and.returnValue([1, 2, 3, 4]);
            const fallback: number[] = annot._calculateInkBounds([[1, 1]], [0, 0, 10, 10], 1, false, undefined);
            expect(fallback).toEqual([1, 2, 3, 4]);
        });
    });

    describe('PdfFileLinkAnnotation / PdfUriAnnotation / PdfDocumentLinkAnnotation / PdfTextWebLinkAnnotation', () => {
        it('covers file link addAction cleanup of old A/F/Next references', () => {
            const PdfFileLinkAnnotation: any = (annotationModule as any).PdfFileLinkAnnotation;
            const annot: any = _createNewAnnotation<any>(PdfFileLinkAnnotation);
            const crossRef: any = _createCrossReference();
            const oldRef1: any = _createReference(true);
            const oldRef2: any = _createReference(true);
            const action: any = _createDictionary({
                Next: [oldRef1, oldRef2],
                F: _createReference(true)
            });

            crossRef._cacheMap.set(oldRef1, {});
            crossRef._cacheMap.set(oldRef2, {});

            annot._crossReference = crossRef;
            annot._dictionary = _createDictionary({ A: action });
            annot._action = 'app.alert("x");';
            annot._fileName = 'sample.txt';
            spyOn(utils as any, '_removeDuplicateReference').and.stub();

            annot._addAction();
            expect(crossRef._cacheMap.has(oldRef1)).toBeTruthy();
            expect(crossRef._cacheMap.has(oldRef2)).toBeTruthy();
        });

        it('covers uri getter/setter loaded and unloaded paths', () => {
            const PdfUriAnnotation: any = (annotationModule as any).PdfUriAnnotation;
            const action: any = _createDictionary({ URI: 'https://old.example.com' });
            const annot: any = _createLoadedAnnotation<any>(
                PdfUriAnnotation,
                _createPage(),
                _createDictionary({ A: action })
            );

            expect(annot.uri).toBe('https://old.example.com');

            annot.uri = 'https://new.example.com';
            expect(action.get('URI')).toBe('https://new.example.com');
            expect(annot._dictionary._updated).toBeTruthy();

            const annot2: any = _createNewAnnotation<any>(PdfUriAnnotation);
            annot2._dictionary = _createDictionary({ A: action });
            annot2._isLoaded = false;
            annot2.uri = 'https://plain.example.com';
            expect(annot2._uri).toBe('https://plain.example.com');
        });


    });

    describe('PdfAttachmentAnnotation / Pdf3DAnnotation', () => {
        it('covers attachment FS replacement, embedded file wiring and icon switch cases', () => {
            const PdfAttachmentAnnotation: any = (annotationModule as any).PdfAttachmentAnnotation;
            const annot: any = _createNewAnnotation<any>(PdfAttachmentAnnotation);
            const crossRef: any = _createCrossReference();

            annot._crossReference = crossRef;
            annot._fileName = 'hello.txt';
            annot._stream = { length: 5, dictionary: undefined };
            annot._dictionary = _createDictionary({
                FS: _createDictionary({
                    EF: _createDictionary({ F: _createReference(true) })
                })
            });

            spyOn(utils as any, '_removeDuplicateReference').and.stub();

            annot._addAttachment();
            expect(crossRef._writeObject).toHaveBeenCalled();
            expect(annot._dictionary.has('FS')).toBeTruthy();

            expect(annot._obtainIconName(enumModule.PdfAttachmentIcon.pushPin)).toBe('PushPin');
            expect(annot._obtainIconName(enumModule.PdfAttachmentIcon.tag)).toBe('Tag');
            expect(annot._obtainIconName(enumModule.PdfAttachmentIcon.graph)).toBe('Graph');
            expect(annot._obtainIconName(enumModule.PdfAttachmentIcon.paperClip)).toBe('Paperclip');
        });

        it('covers 3D annotation flatten with and without appearance stream', () => {
            const Pdf3DAnnotation: any = (annotationModule as any).Pdf3DAnnotation;
            const page: any = _createPage();
            const stream: any = { dictionary: _createDictionary({}) };
            const annot: any = _createLoadedAnnotation<any>(
                Pdf3DAnnotation,
                page,
                _createDictionary({
                    AP: _createDictionary({ N: stream })
                })
            );

            annot._page = page;
            annot._crossReference = _createCrossReference();
            annot._validateTemplateMatrix = jasmine.createSpy('_validateTemplateMatrix').and.returnValue(true);
            annot._flattenAnnotationTemplate = jasmine.createSpy('_flattenAnnotationTemplate');
            annot._removeAnnotation = jasmine.createSpy('_removeAnnotation');

            spyOn(templateModule as any, 'PdfTemplate').and.callFake((s: any) => ({
                _content: { dictionary: s.dictionary }
            }));

            annot._doPostProcess(true);
            expect(annot._flattenAnnotationTemplate).toHaveBeenCalled();

            annot._dictionary = _createDictionary({});
            annot._doPostProcess(true);
            expect(annot._removeAnnotation).toHaveBeenCalled();
        });
    });

    describe('PdfTextMarkupAnnotation', () => {
        it('covers boundsCollection getter/setter, postProcess, doPostProcess and flatten branches', () => {
            const PdfTextMarkupAnnotation: any = (annotationModule as any).PdfTextMarkupAnnotation;
            const page: any = _createPage(enumModule.PdfRotationAngle.angle90);
            const annot: any = _createLoadedAnnotation<any>(
                PdfTextMarkupAnnotation,
                page,
                _createDictionary({
                    QuadPoints: [10, 100, 50, 100, 10, 90, 50, 90]
                })
            );

            annot._page = page;
            annot._crossReference = _createCrossReference();
            annot._dictionary = _createDictionary({
                QuadPoints: [10, 100, 50, 100, 10, 90, 50, 90]
            });
            annot._boundsCollection = [];
            annot._bounds = { x: 10, y: 20, width: 40, height: 10 };
            annot._isLoaded = true;
            annot._quadPoints = [];
            annot.border = { width: 1 };
            annot._textMarkupType = enumModule.PdfTextMarkupAnnotationType.highlight;
            annot._isChanged = true;
            annot._setAppearance = true;
            annot._text = 'note';
            annot._getMediaOrCropBox = jasmine.createSpy('_getMediaOrCropBox').and.returnValue([0, 0, 0, 0]);
            annot._getCropOrMediaBox = jasmine.createSpy('_getCropOrMediaBox').and.returnValue([0, 0, 0, 0]);
            annot._setQuadPoints = jasmine.createSpy('_setQuadPoints');
            annot._createMarkupAppearance = jasmine.createSpy('_createMarkupAppearance').and.returnValue(_createAppearanceTemplate());
            annot._validateTemplateMatrix = jasmine.createSpy('_validateTemplateMatrix').and.returnValues(true, true);
            annot._flattenAnnotationTemplate = jasmine.createSpy('_flattenAnnotationTemplate');
            annot._flattenLoadedPopUp = jasmine.createSpy('_flattenLoadedPopUp');
            annot._flattenPopUp = jasmine.createSpy('_flattenPopUp');
            annot.flattenPopups = true;

            spyOn(utils as any, '_updateBounds').and.returnValue([10, 20, 50, 30]);
            spyOn(utils as any, '_calculateBounds').and.returnValue({ x: 10, y: 20, width: 40, height: 10 });
            spyOn(utils as any, '_removeDuplicateReference').and.stub();
            spyOn(utils as any, '_reverseMarkupAnnotationType').and.returnValue('Highlight');
            spyOn((primitives as any)._PdfName, 'get').and.callFake((name: string) => ({ name }));

            const collection: any[] = annot.boundsCollection;
            expect(collection.length).toBe(1);

            annot._postProcess();
            expect(annot._dictionary.has('AP')).toBeTruthy();

            annot._appearanceTemplate = undefined;
            annot._doPostProcess(true);
            expect(annot._flattenLoadedPopUp).toHaveBeenCalled();
            expect(annot._flattenAnnotationTemplate).toHaveBeenCalled();
            expect(page.annotations.remove).toHaveBeenCalledWith(annot);
        });
    });


});

import { PdfPage } from '../src/pdf/core/pdf-page';
import { _PdfDictionary } from '../src/pdf/core/pdf-primitives';
import { _PdfAnnotationType, PdfBorderStyle, PdfLineCaptionType, PdfLineEndingStyle, PdfMeasurementUnit, PdfRotationAngle } from '../src/pdf/core/enumerator';
import { PdfAnnotation, PdfAnnotationBorder, PdfAnnotationLineEndingStyle, PdfLineAnnotation, PdfSquareAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfGraphics, PdfGraphicsState } from '../src/pdf/core/graphics/pdf-graphics';
import { PdfDocument } from '../src/pdf/core/pdf-document';

describe('PdfAnnotation _flattenAnnotationTemplate coverage', () => {
    type RectangleValue = { x: number; y: number; width: number; height: number };

    type InternalAnnotation = PdfAnnotation & {
        _dictionary: _PdfDictionary;
        _page: PdfPage;
        _bounds: RectangleValue;
        _isLoaded: boolean;
        _flatten: boolean;
        _setAppearance: boolean;
        _opacity: number;
        _type: _PdfAnnotationType;
        _flattenAnnotationTemplate(template: PdfTemplate, isNormalMatrix: boolean, isLineAnnotation?: boolean): void;
        _calculateTemplateBounds(
            currentBounds: RectangleValue,
            page: PdfPage,
            template: PdfTemplate,
            isNormalMatrix: boolean,
            graphics: PdfGraphics
        ): RectangleValue;
    };

    function createMockPage(
        cropBox?: number[],
        mediaBox?: number[],
        hasCropBox: boolean = false,
        hasMediaBox: boolean = false,
        rotation: PdfRotationAngle = PdfRotationAngle.angle0
    ): PdfPage {
        const pageDictionary: _PdfDictionary = new _PdfDictionary();

        if (hasCropBox) {
            pageDictionary.update('CropBox', cropBox);
        }
        if (hasMediaBox) {
            pageDictionary.update('MediaBox', mediaBox);
        }

        const graphics: Partial<PdfGraphics> = {
            save: jasmine.createSpy('save').and.returnValue({} as PdfGraphicsState),
            restore: jasmine.createSpy('restore'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            setTransparency: jasmine.createSpy('setTransparency')
        };

        const page: unknown = {
            graphics,
            size: { width: 400, height: 400 },
            cropBox,
            mediaBox,
            rotation,
            _pageDictionary: pageDictionary,
            annotations: {
                remove: jasmine.createSpy('remove')
            },
            _isLineAnnotation: false,
            _needInitializeGraphics: false
        };

        return page as PdfPage;
    }

    function createTemplate(matrix?: number[], bbox?: number[], width: number = 100, height: number = 50): PdfTemplate {
        const dictionary: _PdfDictionary = new _PdfDictionary();

        if (matrix) {
            dictionary.update('Matrix', matrix);
        }
        if (bbox) {
            dictionary.update('BBox', bbox);
        }

        const template: unknown = {
            _size: { width, height },
            _content: {
                dictionary
            },
            _isAnnotationTemplate: false,
            _needScale: false
        };

        return template as PdfTemplate;
    }

    function createLineAnnotation(page: PdfPage): InternalAnnotation {
        const annotation: InternalAnnotation = Object.create(PdfLineAnnotation.prototype) as InternalAnnotation;

        annotation._dictionary = new _PdfDictionary();
        annotation._page = page;
        annotation._bounds = { x: 20, y: 30, width: 120, height: 40 };
        annotation._isLoaded = false;
        annotation._flatten = false;
        annotation._setAppearance = false;
        annotation._opacity = 1;

        annotation._calculateTemplateBounds = (
            currentBounds: RectangleValue,
            pageValue: PdfPage,
            templateValue: PdfTemplate,
            isNormalMatrix: boolean,
            graphics: PdfGraphics
        ): RectangleValue => {
            return currentBounds;
        };

        spyOn(annotation, '_calculateTemplateBounds').and.callThrough();

        return annotation;
    }

    function createRubberStampAnnotation(page: PdfPage, rotate: number, bounds: RectangleValue): InternalAnnotation {
        const annotation: InternalAnnotation = Object.create(PdfAnnotation.prototype) as InternalAnnotation;

        annotation._dictionary = new _PdfDictionary();
        annotation._page = page;
        annotation._bounds = bounds;
        annotation._isLoaded = false;
        annotation._flatten = false;
        annotation._setAppearance = false;
        annotation._opacity = 1;
        annotation._type = _PdfAnnotationType.rubberStampAnnotation;

        Object.defineProperty(annotation, 'rotate', {
            get: (): number => rotate,
            configurable: true
        });

        annotation._calculateTemplateBounds = (
            currentBounds: RectangleValue,
            pageValue: PdfPage,
            templateValue: PdfTemplate,
            isNormalMatrix: boolean,
            graphics: PdfGraphics
        ): RectangleValue => {
            return bounds;
        };

        spyOn(annotation, '_calculateTemplateBounds').and.callThrough();

        return annotation;
    }

    it('should cover line annotation _setAppearance and flatten branch', () => {
        const page: PdfPage = createMockPage();
        const annotation: InternalAnnotation = createLineAnnotation(page);
        const template: PdfTemplate = createTemplate();

        annotation._setAppearance = true;
        annotation._flatten = true;

        const measureValues: boolean[] = [true, false, false, false];

        Object.defineProperty(annotation, 'measure', {
            get: (): boolean => {
                return measureValues.length > 0 ? measureValues.shift() as boolean : false;
            },
            configurable: true
        });

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true, true);
        }).not.toThrow();

        expect(annotation._calculateTemplateBounds).toHaveBeenCalled();
        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
        expect((page.annotations.remove as jasmine.Spy)).toHaveBeenCalledWith(annotation);
    });

    it('should cover cropBox condition for unloaded line annotation', () => {
        const page: PdfPage = createMockPage([10, 20, 400, 400], undefined, true, false);
        const annotation: InternalAnnotation = createLineAnnotation(page);
        const template: PdfTemplate = createTemplate();

        Object.defineProperty(annotation, 'measure', {
            get: (): boolean => false,
            configurable: true
        });

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        const currentBounds: RectangleValue = (annotation._calculateTemplateBounds as jasmine.Spy).calls.argsFor(0)[0] as RectangleValue;

        expect(currentBounds.x).toBe(10);
        expect(currentBounds.y).toBe(360);
        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
    });

    it('should cover page undefined else branch for line annotation', () => {
        const page: PdfPage = createMockPage();
        const annotation: InternalAnnotation = createLineAnnotation(page);
        const template: PdfTemplate = createTemplate();

        Object.defineProperty(annotation, 'measure', {
            get: (): boolean => false,
            configurable: true
        });

        let pageGetCount: number = 0;

        Object.defineProperty(annotation, '_page', {
            get: (): PdfPage | undefined => {
                pageGetCount++;
                if (pageGetCount === 3) {
                    return undefined;
                }
                return page;
            },
            configurable: true
        });

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        const currentBounds: RectangleValue = (annotation._calculateTemplateBounds as jasmine.Spy).calls.argsFor(0)[0] as RectangleValue;

        expect(currentBounds.y).toBe(40);
        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
        expect((page.annotations.remove as jasmine.Spy)).toHaveBeenCalledWith(annotation);
    });

    it('should cover rubber stamp rotated matrix check', () => {
        const page: PdfPage = createMockPage(undefined, undefined, false, false, PdfRotationAngle.angle0);
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle90,
            { x: 10, y: 20, width: 100, height: 50 }
        );

        const template: PdfTemplate = createTemplate([0, 1, -1, 0, 0, 25], undefined, 100, 50);

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
        expect((page.annotations.remove as jasmine.Spy)).toHaveBeenCalledWith(annotation);
    });

    it('should cover rubber stamp angle90 page angle270 scaled branch', () => {
        const page: PdfPage = createMockPage(undefined, undefined, false, false, PdfRotationAngle.angle270);
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle90,
            { x: 15, y: 20, width: 150, height: 75 }
        );

        const template: PdfTemplate = createTemplate([0, 1, -1, 0, 0, 25], undefined, 100, 50);

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
    });

    it('should cover rubber stamp angle90 page angle270 else branch', () => {
        const page: PdfPage = createMockPage(undefined, undefined, false, false, PdfRotationAngle.angle270);
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle90,
            { x: 0, y: 0, width: 100, height: 50 }
        );

        const template: PdfTemplate = createTemplate([0, 1, -1, 0, 0, 25], undefined, 100, 50);

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
    });

    it('should cover rubber stamp angle270 page angle270 annotation template branch', () => {
        const page: PdfPage = createMockPage(undefined, undefined, false, false, PdfRotationAngle.angle270);
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle270,
            { x: 10, y: 20, width: 160, height: 80 }
        );

        const template: PdfTemplate = createTemplate([0, 1, -1, 0, 0, 25], undefined, 100, 50);
        (template as unknown as { _isAnnotationTemplate: boolean })._isAnnotationTemplate = true;

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
    });

    it('should cover rubber stamp angle270 page angle270 needScale branch', () => {
        const page: PdfPage = createMockPage(undefined, undefined, false, false, PdfRotationAngle.angle270);
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle270,
            { x: 10, y: 20, width: 160, height: 80 }
        );

        const template: PdfTemplate = createTemplate([0, 1, -1, 0, 0, 25], undefined, 100, 50);

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
    });

    it('should cover rubber stamp angle270 non page angle270 non scaled branch', () => {
        const page: PdfPage = createMockPage(undefined, undefined, false, false, PdfRotationAngle.angle0);
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle270,
            { x: 10, y: 20, width: 100, height: 50 }
        );

        const template: PdfTemplate = createTemplate([0, 1, -1, 0, 0, 25], undefined, 100, 50);

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
    });

    it('should cover rubber stamp angle270 non page angle270 else branch', () => {
        const page: PdfPage = createMockPage(undefined, undefined, false, false, PdfRotationAngle.angle0);
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle270,
            { x: 0, y: 0, width: 150, height: 75 }
        );

        const template: PdfTemplate = createTemplate([0, 1, -1, 0, 0, 25], undefined, 100, 50);

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
    });

    it('should cover rubber stamp angle180 rotated matrix branch', () => {
        const page: PdfPage = createMockPage();
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle180,
            { x: 10, y: 20, width: 100, height: 50 }
        );

        const template: PdfTemplate = createTemplate([0, 1, -1, 0, 0, 25], undefined, 100, 50);

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        expect((page.graphics.drawTemplate as jasmine.Spy)).toHaveBeenCalled();
        expect((page.annotations.remove as jasmine.Spy)).toHaveBeenCalledWith(annotation);
    });

    it('should cover BBox adjustment when template has BBox and no Matrix', () => {
        const page: PdfPage = createMockPage();
        const annotation: InternalAnnotation = createRubberStampAnnotation(
            page,
            PdfRotationAngle.angle0,
            { x: 20, y: 30, width: 100, height: 50 }
        );

        const template: PdfTemplate = createTemplate(undefined, [5, 10, 100, 50], 100, 50);

        expect((): void => {
            annotation._flattenAnnotationTemplate(template, true);
        }).not.toThrow();

        const drawnBounds: RectangleValue = (page.graphics.drawTemplate as jasmine.Spy).calls.argsFor(0)[1] as RectangleValue;

        expect(drawnBounds.x).toBe(15);
        expect(drawnBounds.y).toBe(40);
    });
});

describe('PdfLineAnnotation _createAppearance coverage', () => {
    it('should reuse custom normal appearance template when N template exists', () => {
        let document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();

        const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 10, y: 20 }, { x: 160, y: 80 });
        page.annotations.add(annotation);

        const normalTemplate: PdfTemplate = new PdfTemplate([0, 0, 50, 30], (annotation as any)._crossReference);
        (annotation as any)._customTemplate.set('N', normalTemplate);

        const appearance: PdfTemplate = (annotation as any)._createAppearance();

        expect(appearance).toBe(normalTemplate);
        expect((annotation as any)._dictionary.has('Rect')).toBe(true);

        document.destroy();
    });

    it('should create dashed line appearance with custom dash, negative leader line, arrows, opacity and top measured caption', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();

        const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 30, y: 40 }, { x: 230, y: 120 });
        annotation.text = 'Line Caption';
        annotation.color = { r: 255, g: 0, b: 0 };
        annotation.innerColor = { r: 0, g: 255, b: 0 };
        annotation.opacity = 0.5;

        annotation.border = new PdfAnnotationBorder({
            width: 2,
            hRadius: 0,
            vRadius: 0,
            style: PdfBorderStyle.dashed,
            dash: [5, 2]
        });

        annotation.lineEndingStyle = new PdfAnnotationLineEndingStyle({
            begin: PdfLineEndingStyle.openArrow,
            end: PdfLineEndingStyle.closedArrow
        });

        annotation.leaderExt = 6;
        annotation.leaderLine = -18;
        annotation.leaderOffset = 4;

        annotation.caption.cap = true;
        annotation.caption.type = PdfLineCaptionType.top;

        annotation.measure = true;

        page.annotations.add(annotation);

        expect((): void => {
            const appearance: PdfTemplate = (annotation as any)._createAppearance();
            expect(appearance).toBeDefined();
        }).not.toThrow();

        expect((annotation as any)._dictionary.has('Rect')).toBe(false);

        document.destroy();
    });

    it('should create dotted line appearance and cover inline measured caption position branch', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();

        const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 40, y: 160 }, { x: 260, y: 160 });
        annotation.text = 'Inline Caption';
        annotation.color = { r: 0, g: 0, b: 255 };

        annotation.border = new PdfAnnotationBorder({
            width: 1,
            hRadius: 0,
            vRadius: 0,
            style: PdfBorderStyle.dot,
            dash: [1, 1]
        });

        annotation.lineEndingStyle = new PdfAnnotationLineEndingStyle({
            begin: PdfLineEndingStyle.none,
            end: PdfLineEndingStyle.none
        });

        annotation.leaderExt = 4;
        annotation.leaderLine = 12;
        annotation.leaderOffset = 2;

        annotation.caption.cap = true;
        annotation.caption.type = PdfLineCaptionType.inline;

        annotation.measure = true;

        page.annotations.add(annotation);

        expect((): void => {
            const appearance: PdfTemplate = (annotation as any)._createAppearance();
            expect(appearance).toBeDefined();
        }).not.toThrow();

        expect((annotation as any)._dictionary.has('Rect')).toBe(false);

        document.destroy();
    });

    it('should create solid line appearance with top non-measured caption and update Rect dictionary', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();

        const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 20, y: 220 }, { x: 220, y: 260 });
        annotation.text = 'Top Caption';
        annotation.subject = 'Line Subject';
        annotation.color = { r: 0, g: 0, b: 0 };

        annotation.border = new PdfAnnotationBorder({
            width: 1,
            hRadius: 0,
            vRadius: 0,
            style: PdfBorderStyle.solid
        });

        annotation.lineEndingStyle = new PdfAnnotationLineEndingStyle({
            begin: PdfLineEndingStyle.closedArrow,
            end: PdfLineEndingStyle.openArrow
        });

        annotation.leaderExt = 5;
        annotation.leaderLine = 10;
        annotation.leaderOffset = 3;

        annotation.caption.cap = true;
        annotation.caption.type = PdfLineCaptionType.top;

        page.annotations.add(annotation);

        expect((): void => {
            const appearance: PdfTemplate = (annotation as any)._createAppearance();
            expect(appearance).toBeDefined();
        }).not.toThrow();

        expect((annotation as any)._dictionary.has('Rect')).toBe(true);

        const rect: number[] = (annotation as any)._dictionary.getArray('Rect');
        expect(rect.length).toBe(4);

        document.destroy();
    });

    it('should use subject as caption text when text and Contents are not available', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();

        const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 50, y: 300 }, { x: 250, y: 330 });
        annotation.subject = 'Subject Caption';
        annotation.color = { r: 10, g: 20, b: 30 };

        annotation.border = new PdfAnnotationBorder({
            width: 1,
            hRadius: 0,
            vRadius: 0,
            style: PdfBorderStyle.solid
        });

        annotation.caption.cap = true;
        annotation.caption.type = PdfLineCaptionType.inline;

        page.annotations.add(annotation);

        expect((): void => {
            const appearance: PdfTemplate = (annotation as any)._createAppearance();
            expect(appearance).toBeDefined();
        }).not.toThrow();

        expect(annotation.text).toBe('Subject Caption');
        expect((annotation as any)._dictionary.has('Rect')).toBe(true);

        document.destroy();
    });
});


import {
    _PdfName,
    _PdfReference
} from '../src/pdf/core/pdf-primitives';
import { _PdfBaseStream } from '../src/pdf/core/base-stream';
import { PdfFontStyle } from '../src/pdf/core/fonts/pdf-standard-font';

describe('Pdf annotation coverage for appearance font, line measure and square measure', () => {
    function createAppearanceStream(baseFont: string, fontSize: number): _PdfBaseStream {
        const resources: _PdfDictionary = new _PdfDictionary();
        const fontDictionary: _PdfDictionary = new _PdfDictionary();
        const fontResource: _PdfDictionary = new _PdfDictionary();
        fontResource.set('BaseFont', _PdfName.get(baseFont));
        fontDictionary.set('F1', fontResource);
        resources.set('Font', fontDictionary);

        const streamDictionary: _PdfDictionary = new _PdfDictionary();
        streamDictionary.set('Resources', resources);

        const stream: _PdfBaseStream & {
            dictionary: _PdfDictionary;
            getBytes: () => Uint8Array;
        } = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream & {
            dictionary: _PdfDictionary;
            getBytes: () => Uint8Array;
        };

        stream.dictionary = streamDictionary;
        stream.getBytes = (): Uint8Array => new TextEncoder().encode(`/F1 ${fontSize} Tf`);

        return stream;
    }

    function createDocumentAndPage(): { document: PdfDocument; page: PdfPage } {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        return { document, page };
    }

    it('covers _obtainAppearanceFont bold and italic style branch', () => {
        const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 10, y: 10 }, { x: 100, y: 10 });
        const stream: _PdfBaseStream = createAppearanceStream('Helvetica-BoldOblique', 14);

        const result: { name: string; fontSize: number; style: PdfFontStyle } =
            (annotation as unknown as {
                _obtainAppearanceFont:
                (resourceDict: _PdfBaseStream, fontFamily: string, fontSize: number, style: PdfFontStyle) =>
                    { name: string; fontSize: number; style: PdfFontStyle };
            })._obtainAppearanceFont(stream, 'Helvetica', 10, PdfFontStyle.regular);

        expect(result.name).toBe('Helvetica');
        expect(result.fontSize).toBe(10);
        expect(result.style).toBe(0);
    });

    it('covers _obtainAppearanceFont bold-only explicit else-if branch', () => {
        const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 10, y: 10 }, { x: 100, y: 10 });
        const stream: _PdfBaseStream = createAppearanceStream('Courier-Bold', 16);

        const result: { name: string; fontSize: number; style: PdfFontStyle } =
            (annotation as unknown as {
                _obtainAppearanceFont:
                (resourceDict: _PdfBaseStream, fontFamily: string, fontSize: number, style: PdfFontStyle) =>
                    { name: string; fontSize: number; style: PdfFontStyle };
            })._obtainAppearanceFont(stream, 'Courier', 10, PdfFontStyle.regular);

        expect(result.name).toBe('Courier');
        expect(result.fontSize).toBe(10);
        expect(result.style).toBe(0);
    });

    it('covers _obtainAppearanceFont italic-only explicit else-if branch', () => {
        const annotation: PdfLineAnnotation = new PdfLineAnnotation({ x: 10, y: 10 }, { x: 100, y: 10 });
        const stream: _PdfBaseStream = createAppearanceStream('Times-Italic', 18);

        const result: { name: string; fontSize: number; style: PdfFontStyle } =
            (annotation as unknown as {
                _obtainAppearanceFont:
                (resourceDict: _PdfBaseStream, fontFamily: string, fontSize: number, style: PdfFontStyle) =>
                    { name: string; fontSize: number; style: PdfFontStyle };
            })._obtainAppearanceFont(stream, 'Times', 10, PdfFontStyle.regular);

        expect(result.name).toBe('Times');
        expect(result.fontSize).toBe(10);
        expect(result.style).toBe(0);
    });

    it('covers PdfLineAnnotation _postProcess Measure block with _updateBounds branch', () => {
        const data: { document: PdfDocument; page: PdfPage } = createDocumentAndPage();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation(
            { x: 20, y: 40 },
            { x: 180, y: 40 },
            {
                color: { r: 255, g: 0, b: 0 },
                border: new PdfAnnotationBorder({
                    width: 1,
                    hRadius: 0,
                    vRadius: 0,
                    style: PdfBorderStyle.solid
                })
            }
        );

        data.page.annotations.add(annotation);

        const line: PdfLineAnnotation & {
            _dictionary: _PdfDictionary;
            _crossReference: unknown;
            _customTemplate: Map<string, PdfTemplate>;
            _postProcess: (flatten: boolean) => void;
            _setAppearance: boolean;
            flatten: boolean;
        } = annotation as PdfLineAnnotation & {
            _dictionary: _PdfDictionary;
            _crossReference: unknown;
            _customTemplate: Map<string, PdfTemplate>;
            _postProcess: (flatten: boolean) => void;
            _setAppearance: boolean;
            flatten: boolean;
        };

        (line as any)._setAppearance = false;
        (line as any).flatten = false;
        (line as any)._dictionary.update('Measure', new _PdfDictionary());

        const template: PdfTemplate = new PdfTemplate([0, 0, 50, 20], (line as any)._crossReference);
        (line as any)._customTemplate.set('N', template);

        (line as any)._postProcess(true);

        const rect: number[] = (line as any)._dictionary.getArray('Rect');
        expect(rect.length).toBe(4);
        expect(rect[2]).toBeGreaterThan(rect[0]);
        expect(rect[3]).toBeGreaterThan(rect[1]);

        data.document.destroy();
    });

    it('covers PdfLineAnnotation _postProcess flatten page-size bounds branch', () => {
        const data: { document: PdfDocument; page: PdfPage } = createDocumentAndPage();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation(
            { x: 25, y: 50 },
            { x: 150, y: 90 },
            {
                color: { r: 0, g: 0, b: 255 },
                border: new PdfAnnotationBorder({
                    width: 1,
                    hRadius: 0,
                    vRadius: 0,
                    style: PdfBorderStyle.solid
                })
            }
        );

        data.page.annotations.add(annotation);

        const line: PdfLineAnnotation & {
            _dictionary: _PdfDictionary;
            _crossReference: unknown;
            _customTemplate: Map<string, PdfTemplate>;
            _postProcess: (flatten: boolean) => void;
            _measure: boolean;
            _bounds: { x: number; y: number; width: number; height: number };
            _setAppearance: boolean;
            flatten: boolean;
        } = annotation as PdfLineAnnotation & {
            _dictionary: _PdfDictionary;
            _crossReference: unknown;
            _customTemplate: Map<string, PdfTemplate>;
            _postProcess: (flatten: boolean) => void;
            _measure: boolean;
            _bounds: { x: number; y: number; width: number; height: number };
            _setAppearance: boolean;
            flatten: boolean;
        };

        (line as any)._setAppearance = false;
        (line as any).flatten = true;
        (line as any)._measure = false;
        (line as any)._dictionary.update('Measure', new _PdfDictionary());

        const template: PdfTemplate = new PdfTemplate([0, 0, 60, 30], (line as any)._crossReference);
        (line as any)._customTemplate.set('N', template);

        (line as any)._postProcess(true);

        expect((line as any)._bounds).toBeDefined();
        expect((line as any)._bounds.width).toBeGreaterThan(0);
        expect((line as any)._bounds.height).toBeGreaterThan(0);

        data.document.destroy();
    });

    it('covers PdfSquareAnnotation _createSquareMeasureAppearance existing AP, Measure and text Contents branches', () => {
        const data: { document: PdfDocument; page: PdfPage } = createDocumentAndPage();
        const annotation: PdfSquareAnnotation = new PdfSquareAnnotation(
            { x: 40, y: 60, width: 120, height: 80 },
            {
                text: 'Area note',
                color: { r: 0, g: 128, b: 255 },
                border: new PdfAnnotationBorder({
                    width: 1,
                    hRadius: 0,
                    vRadius: 0,
                    style: PdfBorderStyle.solid
                }),
                measurementUnit: PdfMeasurementUnit.centimeter
            }
        );

        data.page.annotations.add(annotation);

        const square: PdfSquareAnnotation & {
            _dictionary: _PdfDictionary;
            _crossReference: {
                _getNextReference: () => _PdfReference;
                _cacheMap: Map<_PdfReference, unknown>;
            };
            _createSquareMeasureAppearance: (_isFlatten: boolean) => PdfTemplate;
            _isLoaded: boolean;
        } = annotation as PdfSquareAnnotation & {
            _dictionary: _PdfDictionary;
            _crossReference: {
                _getNextReference: () => _PdfReference;
                _cacheMap: Map<_PdfReference, unknown>;
            };
            _createSquareMeasureAppearance: (_isFlatten: boolean) => PdfTemplate;
            _isLoaded: boolean;
        };

        const oldAppearanceDictionary: _PdfDictionary = new _PdfDictionary(square._crossReference);
        const oldAppearanceReference: _PdfReference = square._crossReference._getNextReference();
        oldAppearanceDictionary.set('N', oldAppearanceReference);
        square._crossReference._cacheMap.set(oldAppearanceReference, new _PdfDictionary(square._crossReference));
        square._dictionary.set('AP', oldAppearanceDictionary);

        const oldMeasureReference: _PdfReference = square._crossReference._getNextReference();
        square._crossReference._cacheMap.set(oldMeasureReference, new _PdfDictionary(square._crossReference));
        square._dictionary.update('Measure', oldMeasureReference);

        square._isLoaded = false;

        const template: PdfTemplate = square._createSquareMeasureAppearance(false);

        expect(template).toBeDefined();
        expect(square._dictionary.has('AP')).toBe(true);
        expect(square._dictionary.has('Measure')).toBe(true);
        expect(square._dictionary.get('Contents')).toContain('Area note');
        expect(square._dictionary.get('Subject')).toBe('Area Measurement');
        expect(square._dictionary.get('MeasurementTypes')).toBe(129);
        expect(square._dictionary.getArray('Vertices').length).toBe(8);

        data.document.destroy();
    });

    it('covers PdfSquareAnnotation _createSquareMeasureAppearance else Contents branch when text is empty', () => {
        const data: { document: PdfDocument; page: PdfPage } = createDocumentAndPage();
        const annotation: PdfSquareAnnotation = new PdfSquareAnnotation(
            { x: 30, y: 70, width: 90, height: 90 },
            {
                color: { r: 0, g: 0, b: 0 },
                border: new PdfAnnotationBorder({
                    width: 1,
                    hRadius: 0,
                    vRadius: 0,
                    style: PdfBorderStyle.solid
                }),
                measurementUnit: PdfMeasurementUnit.inch
            }
        );

        data.page.annotations.add(annotation);

        const square: PdfSquareAnnotation & {
            _dictionary: _PdfDictionary;
            _createSquareMeasureAppearance: (_isFlatten: boolean) => PdfTemplate;
            _isLoaded: boolean;
            _text: string;
        } = annotation as PdfSquareAnnotation & {
            _dictionary: _PdfDictionary;
            _createSquareMeasureAppearance: (_isFlatten: boolean) => PdfTemplate;
            _isLoaded: boolean;
            _text: string;
        };

        square._text = '';
        square._isLoaded = false;
        square._dictionary.update('Measure', new _PdfDictionary());

        const template: PdfTemplate = square._createSquareMeasureAppearance(false);

        expect(template).toBeDefined();

        const contents: string = square._dictionary.get('Contents');
        expect(contents).toContain('sq');
        expect(contents).not.toContain('Area note');

        data.document.destroy();
    });
});
