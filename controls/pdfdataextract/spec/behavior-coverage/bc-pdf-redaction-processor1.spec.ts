
import * as ej2Pdf from '@syncfusion/ej2-pdf';
import { PdfRedactionRegion } from '../../src/pdf-data-extract/core/redaction/pdf-redaction-region';
import { _PdfRedactionProcessor } from '../../src/pdf-data-extract/core/redaction/pdf-redaction-processor';

describe('_PdfRedactionProcessor', () => {
    let processor: _PdfRedactionProcessor;

    function _createDictionary(seed?: { [key: string]: unknown }): any { // eslint-disable-line
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: any = { // eslint-disable-line
            _updated: false,
            has: (key: string): boolean => raw.has(key),
            getRaw: (key: string): unknown => raw.get(key),
            get: (key: string): unknown => raw.get(key),
            getArray: (key: string): unknown => raw.get(key),
            set: (key: string, value: unknown): void => {
                raw.set(key, value);
            }
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function _createCrossReference(fetcher?: (arg: unknown) => unknown): any { // eslint-disable-line
        let nextId: number = 1;

        return {
            _cacheMap: new Map<unknown, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            }),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): unknown => {
                return { _refId: nextId++ };
            })
        };
    }

    function _createAnnotations(items: any[]): any { // eslint-disable-line
        const annotations: any = { // eslint-disable-line
            at: (index: number): unknown => items[index],
            removeAt: jasmine.createSpy('removeAt').and.callFake((index: number): void => {
                items.splice(index, 1);
            })
        };

        Object.defineProperty(annotations, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => items.length
        });

        return annotations;
    }


    function _createPage(options: {
        contents?: unknown;
        annots?: unknown;
        fetcher?: (arg: unknown) => unknown;
    } = {}): any { // eslint-disable-line
        const xref: any = _createCrossReference(options.fetcher); // eslint-disable-line
        const pageDictionary: any = _createDictionary(); // eslint-disable-line

        if (typeof options.contents !== 'undefined') {
            pageDictionary.set('Contents', options.contents);
        }
        if (typeof options.annots !== 'undefined') {
            pageDictionary.set('Annots', options.annots);
        }

        const graphics: any = { // eslint-disable-line
            _size: { width: 500, height: 500 },
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawRectangle: jasmine.createSpy('drawRectangle')
        };

        return {
            _pageDictionary: pageDictionary,
            _crossReference: xref,
            graphics,
            annotations: _createAnnotations([]),
            _ref: { _pageRef: 1 }
        };
    }


    function _createRegion(
        bounds: { x: number; y: number; width: number; height: number },
        appearanceEnabled: boolean,
        fillColor?: unknown
    ): PdfRedactionRegion {
        return {
            bounds,
            _appearanceEnabled: appearanceEnabled,
            appearance: {
                normal: { _isNew: false }
            },
            fillColor
        } as unknown as PdfRedactionRegion;
    }

    function _fieldWithPrototype<T>(prototype: object, extra: { [key: string]: unknown }): T {
        const value: T = Object.create(prototype) as T;
        Object.keys(extra).forEach((key: string) => {
            (value as unknown as { [key: string]: unknown })[key] = extra[key];
        });
        return value;
    }

    beforeEach(() => {
        processor = new _PdfRedactionProcessor();
    });

    it('should cover _updateContentStream for ref base stream, array contents and overlay drawing branches', () => {
        const contentRef: any = { _refId: 'old-content-ref' }; // eslint-disable-line
        const rawBaseStream: any = Object.create((ej2Pdf as any)._PdfBaseStream.prototype); // eslint-disable-line

        const page: any = _createPage({ // eslint-disable-line
            contents: contentRef,
            fetcher: (arg: unknown): unknown => {
                if (arg === contentRef) {
                    return rawBaseStream;
                }
                return arg;
            }
        });

        page._crossReference._cacheMap.set(contentRef, rawBaseStream);

        const stream: any = Object.create((ej2Pdf as any)._PdfContentStream.prototype); // eslint-disable-line

        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 10, y: 20, width: 30, height: 40 }, true),
            _createRegion({ x: 50, y: 60, width: 70, height: 80 }, false, { r: 1, g: 2, b: 3 })
        ];

        spyOn(processor, '_processAnnotation').and.callFake((): void => {
            return;
        });
        spyOn(processor, '_processFormFields').and.callFake((): void => {
            return;
        });

        processor._updateContentStream(page, stream, options, {} as any);

        expect(page._crossReference._getNextReference).toHaveBeenCalled();
        expect(page._pageDictionary.get('Contents').length).toBe(1);
        expect(page._pageDictionary._updated).toBeTruthy();
        expect((options[0].appearance.normal as any)._isNew).toBeTruthy(); // eslint-disable-line
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(page.graphics.drawRectangle).toHaveBeenCalled();

        const refA: any = { _refId: 'A' }; // eslint-disable-line
        const refB: any = { _refId: 'B' }; // eslint-disable-line
        const pageArray: any = _createPage({ contents: [refA, refB] }); // eslint-disable-line
        pageArray._crossReference._cacheMap.set(refA, 1);
        pageArray._crossReference._cacheMap.set(refB, 2);

        processor._updateContentStream(pageArray, stream, [], {} as any);

        expect(pageArray._crossReference._cacheMap.has(refA)).toBeFalsy();
        expect(pageArray._crossReference._cacheMap.has(refB)).toBeFalsy();

        const pageNone: any = _createPage({ contents: 'not-a-stream-or-array' }); // eslint-disable-line
        processor._updateContentStream(pageNone, stream, [], {} as any);
        expect(pageNone._pageDictionary._updated).toBeTruthy();
    });

    it('should cover helper methods', () => {
        const rect1: any = { x: 0, y: 0, width: 10, height: 10 }; // eslint-disable-line
        const rect2: any = { x: 5, y: 5, width: 10, height: 10 }; // eslint-disable-line
        const rect3: any = { x: 20, y: 20, width: 5, height: 5 }; // eslint-disable-line

        expect(processor._isFound(rect1, rect2)).toBeTruthy();
        expect(processor._isFound(rect1, rect3)).toBeFalsy();

        expect(processor._intersectsWith(rect1, rect2)).toBeTruthy();
        expect(processor._intersectsWith(rect1, rect3)).toBeFalsy();

        expect(processor._isEmptyRectangle(0, 10)).toBeTruthy();
        expect(processor._isEmptyRectangle(10, 0)).toBeTruthy();
        expect(processor._isEmptyRectangle(10, 10)).toBeFalsy();

        expect(processor._toRectangle(10, 20, 5, 15)).toEqual({
            x: 5,
            y: 15,
            width: 5,
            height: 5
        });

        const page: any = { _ref: { _page: 1 } }; // eslint-disable-line
        const kidSame: any = { getRaw: jasmine.createSpy('getRaw').and.returnValue(page._ref) }; // eslint-disable-line
        const kidDiff: any = { getRaw: jasmine.createSpy('getRaw').and.returnValue({ _page: 2 }) }; // eslint-disable-line

        expect(processor._isKidInSamePage(kidSame, page)).toBeTruthy();
        expect(processor._isKidInSamePage(kidDiff, page)).toBeFalsy();
    });

    it('should cover _checkAnnotationType', () => {
        const rectangle: any = Object.create((ej2Pdf as any).PdfRectangleAnnotation.prototype); // eslint-disable-line
        const square: any = Object.create((ej2Pdf as any).PdfSquareAnnotation.prototype); // eslint-disable-line
        const circle: any = Object.create((ej2Pdf as any).PdfCircleAnnotation.prototype); // eslint-disable-line
        const ellipse: any = Object.create((ej2Pdf as any).PdfEllipseAnnotation.prototype); // eslint-disable-line

        expect(processor._checkAnnotationType(rectangle)).toBe((ej2Pdf as any)._PdfAnnotationType.rectangleAnnotation);
        expect(processor._checkAnnotationType(square)).toBe((ej2Pdf as any)._PdfAnnotationType.squareAnnotation);
        expect(processor._checkAnnotationType(circle)).toBe((ej2Pdf as any)._PdfAnnotationType.circleAnnotation);
        expect(processor._checkAnnotationType(ellipse)).toBe((ej2Pdf as any)._PdfAnnotationType.ellipseAnnotation);
    });

    it('should cover _processAnnotation across major branches', () => {
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 500, height: 500 }, false, null)
        ];

        const ann0: any = undefined; // eslint-disable-line

        const markupAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Highlight' } }),
            _isLoaded: true,
            bounds: { x: 1, y: 1, width: 10, height: 10 },
            boundsCollection: [{ x: 1, y: 1, width: 10, height: 10 }]
        };

        const lineAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Line' } }),
            _isLoaded: true,
            bounds: { x: 0, y: 0, width: 10, height: 10 },
            linePoints: [{ x: 10, y: 100 }, { x: 50, y: 120 }]
        };
        Object.setPrototypeOf(lineAnn, (ej2Pdf as any).PdfLineAnnotation.prototype);

        const polygonAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Polygon' } }),
            _isLoaded: true,
            bounds: { x: 10, y: 10, width: 30, height: 30 },
            _getLinePoints: jasmine.createSpy('_getLinePoints').and.returnValue([{ x: 1, y: 2 }, { x: 3, y: 4 }])
        };
        Object.setPrototypeOf(polygonAnn, (ej2Pdf as any).PdfPolygonAnnotation.prototype);

        const polylineAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'PolyLine' } }),
            _isLoaded: true,
            bounds: { x: 10, y: 10, width: 30, height: 30 },
            _getLinePoints: jasmine.createSpy('_getLinePoints').and.returnValue([{ x: 1, y: 2 }, { x: 3, y: 4 }])
        };
        Object.setPrototypeOf(polylineAnn, (ej2Pdf as any).PdfPolyLineAnnotation.prototype);

        const inkAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Ink' } }),
            _isLoaded: false,
            bounds: { x: 20, y: 20, width: 30, height: 30 },
            inkPointsCollection: [[{ x: 1, y: 2 }, { x: 3, y: 4 }]]
        };
        Object.setPrototypeOf(inkAnn, (ej2Pdf as any).PdfInkAnnotation.prototype);

        const breakAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Sound' } }),
            _isLoaded: true,
            bounds: { x: 15, y: 15, width: 20, height: 20 }
        };

        const unknownLoadedRect: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: false,
            bounds: { x: 25, y: 25, width: 20, height: 20 }
        };
        Object.setPrototypeOf(unknownLoadedRect, (ej2Pdf as any).PdfRectangleAnnotation.prototype);

        const defaultAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'UnknownSubtype' } }),
            _isLoaded: true,
            bounds: { x: 1000, y: 1000, width: 10, height: 10 }
        };

        const items: any[] = [ann0, markupAnn, lineAnn, polygonAnn, polylineAnn, inkAnn, breakAnn, unknownLoadedRect, defaultAnn]; // eslint-disable-line
        page.annotations = _createAnnotations(items);

        spyOn(ej2Pdf as any, '_convertPointToNumberArray').and.returnValue([[1, 2], [3, 4]]);
        spyOn(ej2Pdf as any, '_convertPointsToNumberArrays').and.returnValue([[1, 2, 3, 4]]);

        processor._processAnnotation(page, options);

        expect(page.annotations.removeAt).toHaveBeenCalled();
        expect(page._pageDictionary._updated).toBeTruthy();
    });

    it('should cover _getBoundsFromPoints, _isLineIntersectRectangle and _isBoundsEqual', () => {
        const page: any = { graphics: { _size: { height: 200 } } }; // eslint-disable-line

        expect(processor._getBoundsFromPoints([10, 20, 30, 40], page)).toEqual({
            bounds: { x: 10, y: 160, width: 20, height: 20 },
            isValidAnnotation: true
        });

        expect(processor._getBoundsFromPoints([], page)).toEqual({
            bounds: { x: 0, y: 0, width: 0, height: 0 },
            isValidAnnotation: false
        });

        expect(
            processor._isLineIntersectRectangle(
                { x: 0, y: 0, width: 100, height: 100 },
                10,
                10,
                50,
                50
            )
        ).toBeTruthy();

        expect(
            processor._isLineIntersectRectangle(
                { x: 0, y: 0, width: 10, height: 10 },
                50,
                50,
                60,
                60
            )
        ).toBeFalsy();

        expect(
            processor._isBoundsEqual(
                { x: 1, y: 2, width: 3, height: 4 },
                { x: 1, y: 2, width: 3, height: 4 }
            )
        ).toBeTruthy();

        expect(
            processor._isBoundsEqual(
                { x: 1, y: 2, width: 3, height: 4 },
                { x: 9, y: 2, width: 3, height: 4 }
            )
        ).toBeFalsy();
    });

    it('should cover _getAnnotationType and _findAnnotation', () => {
        const directCases: Array<{ subtype: string; expected: unknown }> = [
            { subtype: 'Sound', expected: (ej2Pdf as any)._PdfAnnotationType.soundAnnotation },
            { subtype: 'FileAttachment', expected: (ej2Pdf as any)._PdfAnnotationType.fileAttachmentAnnotation },
            { subtype: 'Line', expected: (ej2Pdf as any)._PdfAnnotationType.lineAnnotation },
            { subtype: 'Polygon', expected: (ej2Pdf as any)._PdfAnnotationType.polygonAnnotation },
            { subtype: 'Redact', expected: (ej2Pdf as any)._PdfAnnotationType.redactionAnnotation },
            { subtype: 'PolyLine', expected: (ej2Pdf as any)._PdfAnnotationType.polyLineAnnotation },
            { subtype: 'Widget', expected: (ej2Pdf as any)._PdfAnnotationType.widgetAnnotation },
            { subtype: 'Highlight', expected: (ej2Pdf as any)._PdfAnnotationType.highlight },
            { subtype: 'Underline', expected: (ej2Pdf as any)._PdfAnnotationType.underline },
            { subtype: 'StrikeOut', expected: (ej2Pdf as any)._PdfAnnotationType.strikeOut },
            { subtype: 'Squiggly', expected: (ej2Pdf as any)._PdfAnnotationType.squiggly },
            { subtype: 'Stamp', expected: (ej2Pdf as any)._PdfAnnotationType.rubberStampAnnotation },
            { subtype: 'Ink', expected: (ej2Pdf as any)._PdfAnnotationType.inkAnnotation },
            { subtype: 'FreeText', expected: (ej2Pdf as any)._PdfAnnotationType.freeTextAnnotation },
            { subtype: 'Caret', expected: (ej2Pdf as any)._PdfAnnotationType.caretAnnotation },
            { subtype: 'Watermark', expected: (ej2Pdf as any)._PdfAnnotationType.watermarkAnnotation },
            { subtype: 'Screen', expected: (ej2Pdf as any)._PdfAnnotationType.screenAnnotation },
            { subtype: '3D', expected: (ej2Pdf as any)._PdfAnnotationType.movieAnnotation },
            { subtype: 'RichMedia', expected: (ej2Pdf as any)._PdfAnnotationType.richMediaAnnotation }
        ];


        directCases.forEach((item: { subtype: string; expected: number }): void => {
            const dictionary: any = _createDictionary({ Subtype: { name: item.subtype } }); // eslint-disable-line
            expect(processor._getAnnotationType(dictionary)).toBe(item.expected);
        });

        const textDict: any = _createDictionary({ Subtype: { name: 'Text' } }); // eslint-disable-line
        const popupDict: any = _createDictionary({ Subtype: { name: 'Popup' } }); // eslint-disable-line
        expect(processor._getAnnotationType(textDict)).toBe((ej2Pdf as any)._PdfAnnotationType.popupAnnotation);
        expect(processor._getAnnotationType(popupDict)).toBe((ej2Pdf as any)._PdfAnnotationType.popupAnnotation);

        const linkUriZero: any = _createDictionary({ // eslint-disable-line
            Subtype: { name: 'Link' },
            A: _createDictionary({ S: { name: 'URI' } }),
            Border: [0, 0, 0]
        });
        const linkUriNonZero: any = _createDictionary({ // eslint-disable-line
            Subtype: { name: 'Link' },
            A: _createDictionary({ S: { name: 'URI' } }),
            Border: [0, 0, 1]
        });
        const linkLaunch: any = _createDictionary({ // eslint-disable-line
            Subtype: { name: 'Link' },
            A: _createDictionary({ S: { name: 'Launch' } })
        });
        const linkGotoR: any = _createDictionary({ // eslint-disable-line
            Subtype: { name: 'Link' },
            A: _createDictionary({ S: { name: 'GoToR' } })
        });
        const linkGoto: any = _createDictionary({ // eslint-disable-line
            Subtype: { name: 'Link' },
            A: _createDictionary({ S: { name: 'GoTo' } })
        });
        const linkFallback: any = _createDictionary({ Subtype: { name: 'Link' } }); // eslint-disable-line

        expect(processor._getAnnotationType(linkUriZero)).toBe((ej2Pdf as any)._PdfAnnotationType.textWebLinkAnnotation);
        expect(processor._getAnnotationType(linkUriNonZero)).toBe((ej2Pdf as any)._PdfAnnotationType.linkAnnotation);
        expect(processor._getAnnotationType(linkLaunch)).toBe((ej2Pdf as any)._PdfAnnotationType.fileLinkAnnotation);
        expect(processor._getAnnotationType(linkGotoR)).toBe((ej2Pdf as any)._PdfAnnotationType.linkAnnotation);
        expect(processor._getAnnotationType(linkGoto)).toBe((ej2Pdf as any)._PdfAnnotationType.documentLinkAnnotation);
        expect(processor._getAnnotationType(linkFallback)).toBe((ej2Pdf as any)._PdfAnnotationType.documentLinkAnnotation);

        const circleEqual: any = _createDictionary({ Subtype: { name: 'Circle' }, Rect: [0, 0, 10, 10] }); // eslint-disable-line
        const circleNotEqual: any = _createDictionary({ Subtype: { name: 'Circle' }, Rect: [0, 0, 10, 20] }); // eslint-disable-line
        const squareEqual: any = _createDictionary({ Subtype: { name: 'Square' }, Rect: [0, 0, 10, 10] }); // eslint-disable-line
        const squareNotEqual: any = _createDictionary({ Subtype: { name: 'Square' }, Rect: [0, 0, 10, 20] }); // eslint-disable-line

        expect(processor._getAnnotationType(circleEqual)).toBe((ej2Pdf as any)._PdfAnnotationType.circleAnnotation);
        expect(processor._getAnnotationType(circleNotEqual)).toBe((ej2Pdf as any)._PdfAnnotationType.ellipseAnnotation);
        expect(processor._getAnnotationType(squareEqual)).toBe((ej2Pdf as any)._PdfAnnotationType.squareAnnotation);
        expect(processor._getAnnotationType(squareNotEqual)).toBe((ej2Pdf as any)._PdfAnnotationType.rectangleAnnotation);

        expect(processor._findAnnotation(undefined as unknown as any[])).toBeFalsy(); // eslint-disable-line
        expect(processor._findAnnotation([0, 0, 0])).toBeTruthy();
        expect(processor._findAnnotation([0, 1, 0])).toBeFalsy();
        expect(processor._findAnnotation([[0, 0, 0]])).toBeTruthy();
    });

    it('should cover _updateContentStream highlighted lines for reference contents, cache cleanup, new stream set, template draw and rectangle draw', () => {
        // Arrange
        const contentRef: any = Object.create((ej2Pdf as any)._PdfReference.prototype); // eslint-disable-line
        const rawBaseStream: any = Object.create((ej2Pdf as any)._PdfBaseStream.prototype); // eslint-disable-line

        const page: any = _createPage({ // eslint-disable-line
            contents: contentRef,
            fetcher: (arg: unknown): unknown => {
                if (arg === contentRef) {
                    return rawBaseStream;
                }
                return arg;
            }
        });

        page._crossReference._cacheMap.set(contentRef, rawBaseStream);

        const stream: any = Object.create((ej2Pdf as any)._PdfContentStream.prototype); // eslint-disable-line

        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 10, y: 20, width: 30, height: 40 }, true),
            _createRegion({ x: 50, y: 60, width: 70, height: 80 }, false, { r: 255, g: 0, b: 0 })
        ];

        spyOn(processor, '_processAnnotation').and.callFake((): void => {
            return;
        });
        spyOn(processor, '_processFormFields').and.callFake((): void => {
            return;
        });

        // Act
        processor._updateContentStream(page, stream, options, {} as any);

        // Assert
        expect(page._crossReference._cacheMap.has(contentRef)).toBeFalsy();
        expect(page._crossReference._getNextReference).toHaveBeenCalled();
        expect(page._pageDictionary.get('Contents').length).toBe(1);
        expect(page._pageDictionary._updated).toBeTruthy();

        expect((options[0].appearance.normal as any)._isNew).toBeTruthy(); // eslint-disable-line
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(page.graphics.drawRectangle).toHaveBeenCalled();
    });
    ``



    it('should cover _processAnnotation highlighted cases across line, polygon, polyline, ink, text markup and common removal path', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line

        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 500, height: 500 }, false)
        ];

        const undefinedAnnotation: any = undefined; // eslint-disable-line

        const textMarkupAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Highlight' } }),
            _isLoaded: true,
            bounds: { x: 10, y: 10, width: 20, height: 20 },
            boundsCollection: [{ x: 10, y: 10, width: 20, height: 20 }]
        };

        const lineAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Line' } }),
            _isLoaded: true,
            bounds: { x: 20, y: 20, width: 20, height: 20 },
            linePoints: [{ x: 10, y: 100 }, { x: 60, y: 130 }]
        };
        Object.setPrototypeOf(lineAnnotation, (ej2Pdf as any).PdfLineAnnotation.prototype);

        const polygonAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Polygon' } }),
            _isLoaded: true,
            bounds: { x: 25, y: 25, width: 25, height: 25 },
            _getLinePoints: jasmine.createSpy('_getLinePoints').and.returnValue([{ x: 1, y: 2 }, { x: 3, y: 4 }])
        };
        Object.setPrototypeOf(polygonAnnotation, (ej2Pdf as any).PdfPolygonAnnotation.prototype);

        const polyLineAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'PolyLine' } }),
            _isLoaded: true,
            bounds: { x: 30, y: 30, width: 30, height: 30 },
            _getLinePoints: jasmine.createSpy('_getLinePoints').and.returnValue([{ x: 1, y: 2 }, { x: 3, y: 4 }])
        };
        Object.setPrototypeOf(polyLineAnnotation, (ej2Pdf as any).PdfPolyLineAnnotation.prototype);

        const inkAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Ink' } }),
            _isLoaded: false,
            bounds: { x: 35, y: 35, width: 30, height: 30 },
            inkPointsCollection: [[{ x: 1, y: 2 }, { x: 3, y: 4 }]]
        };
        Object.setPrototypeOf(inkAnnotation, (ej2Pdf as any).PdfInkAnnotation.prototype);

        const soundAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'Sound' } }),
            _isLoaded: true,
            bounds: { x: 15, y: 15, width: 20, height: 20 }
        };

        const unloadedRectangleFallback: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: false,
            bounds: { x: 40, y: 40, width: 20, height: 20 }
        };
        Object.setPrototypeOf(unloadedRectangleFallback, (ej2Pdf as any).PdfRectangleAnnotation.prototype);

        const defaultInvalidAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({ Subtype: { name: 'UnknownSubtype' } }),
            _isLoaded: true,
            bounds: { x: 1000, y: 1000, width: 10, height: 10 }
        };

        const annotationItems: any[] = [ // eslint-disable-line
            undefinedAnnotation,
            textMarkupAnnotation,
            lineAnnotation,
            polygonAnnotation,
            polyLineAnnotation,
            inkAnnotation,
            soundAnnotation,
            unloadedRectangleFallback,
            defaultInvalidAnnotation
        ];

        page.annotations = _createAnnotations(annotationItems);

        spyOn(ej2Pdf as any, '_convertPointToNumberArray').and.returnValue([[1, 2], [3, 4]]);
        spyOn(ej2Pdf as any, '_convertPointsToNumberArrays').and.returnValue([[1, 2, 3, 4]]);

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).toHaveBeenCalled();
        expect(page._pageDictionary._updated).toBeTruthy();
    });


});
describe('_PdfRedactionProcessor highlighted coverage', () => {
    let processor: _PdfRedactionProcessor;

    function _createDictionary(seed?: { [key: string]: unknown }): any { // eslint-disable-line
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: any = { // eslint-disable-line
            _updated: false,
            has: (key: string): boolean => raw.has(key),
            getRaw: (key: string): unknown => raw.get(key),
            get: (key: string): unknown => raw.get(key),
            getArray: (key: string): unknown => raw.get(key),
            set: (key: string, value: unknown): void => {
                raw.set(key, value);
            }
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function _createCrossReference(fetcher?: (arg: unknown) => unknown): any { // eslint-disable-line
        let nextId: number = 1;

        return {
            _cacheMap: new Map<unknown, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            }),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): unknown => {
                return { _refId: nextId++ };
            })
        };
    }

    function _createAnnotations(items: any[]): any { // eslint-disable-line
        const annotations: any = { // eslint-disable-line
            at: (index: number): unknown => items[index],
            removeAt: jasmine.createSpy('removeAt').and.callFake((index: number): void => {
                items.splice(index, 1);
            })
        };

        Object.defineProperty(annotations, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => items.length
        });

        return annotations;
    }

    function _createPage(options: {
        contents?: unknown;
        annots?: unknown;
        fetcher?: (arg: unknown) => unknown;
    } = {}): any { // eslint-disable-line
        const xref: any = _createCrossReference(options.fetcher); // eslint-disable-line
        const pageDictionary: any = _createDictionary(); // eslint-disable-line

        if (typeof options.contents !== 'undefined') {
            pageDictionary.set('Contents', options.contents);
        }
        if (typeof options.annots !== 'undefined') {
            pageDictionary.set('Annots', options.annots);
        }

        const graphics: any = { // eslint-disable-line
            _size: { width: 500, height: 500 },
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawRectangle: jasmine.createSpy('drawRectangle')
        };

        return {
            _pageDictionary: pageDictionary,
            _crossReference: xref,
            graphics,
            annotations: _createAnnotations([]),
            _ref: { _pageRef: 1 }
        };
    }

    function _createRegion(
        bounds: { x: number; y: number; width: number; height: number }
    ): PdfRedactionRegion {
        return {
            bounds,
            _appearanceEnabled: false
        } as unknown as PdfRedactionRegion;
    }

    function _fieldWithPrototype<T>(prototype: object, extra: { [key: string]: unknown }): T {
        const value: T = Object.create(prototype) as T;
        Object.keys(extra).forEach((key: string) => {
            (value as unknown as { [key: string]: unknown })[key] = extra[key];
        });
        return value;
    }

    beforeEach(() => {
        processor = new _PdfRedactionProcessor();
    });



    it('should cover highlighted _processAnnotation text/textMarkup/trapNetwork intersect-and-remove branches', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 500, height: 500 })
        ];

        const textAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 10, y: 10, width: 20, height: 20 },
            boundsCollection: [{ x: 10, y: 10, width: 20, height: 20 }]
        };

        const textMarkupAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 20, y: 20, width: 20, height: 20 },
            boundsCollection: [{ x: 20, y: 20, width: 20, height: 20 }]
        };

        const trapNetAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 30, y: 30, width: 20, height: 20 },
            boundsCollection: [{ x: 30, y: 30, width: 20, height: 20 }]
        };

        const items: any[] = [textAnn, textMarkupAnn, trapNetAnn]; // eslint-disable-line
        page.annotations = _createAnnotations(items);

        spyOn(processor, '_getAnnotationType').and.callFake((annotation: any): number => { // eslint-disable-line
            if (annotation === textAnn) {
                return (ej2Pdf as any)._PdfAnnotationType.textAnnotation;
            }
            if (annotation === textMarkupAnn) {
                return (ej2Pdf as any)._PdfAnnotationType.textMarkupAnnotation;
            }
            return (ej2Pdf as any)._PdfAnnotationType.trapNetworkAnnotation;
        });

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).toHaveBeenCalled();
    });

    it('should cover highlighted _processAnnotation text/textMarkup/trapNetwork non-intersect break path', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 5, height: 5 })
        ];

        const nonIntersectAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 100, y: 100, width: 10, height: 10 },
            boundsCollection: [{ x: 200, y: 200, width: 10, height: 10 }]
        };

        page.annotations = _createAnnotations([nonIntersectAnn]);

        spyOn(processor, '_getAnnotationType').and.returnValue(
            (ej2Pdf as any)._PdfAnnotationType.textMarkupAnnotation
        );

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).not.toHaveBeenCalled();
    });
});


describe('_PdfRedactionProcessor highlighted coverage', () => {
    let processor: _PdfRedactionProcessor;

    function _createDictionary(seed?: { [key: string]: unknown }): any { // eslint-disable-line
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: any = { // eslint-disable-line
            _updated: false,
            has: (key: string): boolean => raw.has(key),
            getRaw: (key: string): unknown => raw.get(key),
            get: (key: string): unknown => raw.get(key),
            getArray: (key: string): unknown => raw.get(key),
            set: (key: string, value: unknown): void => {
                raw.set(key, value);
            }
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function _createCrossReference(fetcher?: (arg: unknown) => unknown): any { // eslint-disable-line
        let nextId: number = 1;

        return {
            _cacheMap: new Map<unknown, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            }),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): unknown => {
                return { _refId: nextId++ };
            })
        };
    }

    function _createAnnotations(items: any[]): any { // eslint-disable-line
        const annotations: any = { // eslint-disable-line
            at: (index: number): unknown => items[index],
            removeAt: jasmine.createSpy('removeAt').and.callFake((index: number): void => {
                items.splice(index, 1);
            })
        };

        Object.defineProperty(annotations, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => items.length
        });

        return annotations;
    }

    function _createPage(options: {
        contents?: unknown;
        annots?: unknown;
        fetcher?: (arg: unknown) => unknown;
    } = {}): any { // eslint-disable-line
        const xref: any = _createCrossReference(options.fetcher); // eslint-disable-line
        const pageDictionary: any = _createDictionary(); // eslint-disable-line

        if (typeof options.contents !== 'undefined') {
            pageDictionary.set('Contents', options.contents);
        }
        if (typeof options.annots !== 'undefined') {
            pageDictionary.set('Annots', options.annots);
        }

        const graphics: any = { // eslint-disable-line
            _size: { width: 500, height: 500 },
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawRectangle: jasmine.createSpy('drawRectangle')
        };

        return {
            _pageDictionary: pageDictionary,
            _crossReference: xref,
            graphics,
            annotations: _createAnnotations([]),
            _ref: { _pageRef: 1 }
        };
    }

    function _createRegion(
        bounds: { x: number; y: number; width: number; height: number }
    ): PdfRedactionRegion {
        return {
            bounds,
            _appearanceEnabled: false
        } as unknown as PdfRedactionRegion;
    }

    beforeEach(() => {
        processor = new _PdfRedactionProcessor();
    });


    it('should cover highlighted _processFormFields tx, btn, ch and sig lines', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line

        const annotsRef: any = Object.create((ej2Pdf as any)._PdfReference.prototype); // eslint-disable-line
        const kidTxRef: any = Object.create((ej2Pdf as any)._PdfReference.prototype); // eslint-disable-line
        const kidRadioRef: any = Object.create((ej2Pdf as any)._PdfReference.prototype); // eslint-disable-line

        const annotsArray: any[] = [kidTxRef, kidRadioRef]; // eslint-disable-line
        page._pageDictionary.set('Annots', annotsRef);

        const txKidDictionary: any = _createDictionary({ // eslint-disable-line
            Rect: [10, 10, 50, 30],
            P: page._ref
        });

        const radioKidDictionary: any = _createDictionary({ // eslint-disable-line
            Rect: [60, 60, 100, 90],
            P: page._ref
        });

        const fields: any[] = []; // eslint-disable-line

        // field.page !== page -> continue
        const otherPageDictionary: any = _createDictionary(); // eslint-disable-line
        otherPageDictionary._kind = 'skip';

        const otherPageField: any = { // eslint-disable-line
            page: {},
            _dictionary: otherPageDictionary
        };

        // tx with kids > 1
        const txKidsDictionary: any = _createDictionary(); // eslint-disable-line
        txKidsDictionary._kind = 'txKids';
        txKidsDictionary.set('Kids', [kidTxRef, kidTxRef]);

        const txKidsField: any = { // eslint-disable-line
            page,
            _dictionary: txKidsDictionary
        };

        // tx else => bounds = field.bounds
        const txBoundsDictionary: any = _createDictionary(); // eslint-disable-line
        txBoundsDictionary._kind = 'txBounds';

        const txBoundsField: any = { // eslint-disable-line
            page,
            bounds: { x: 5, y: 5, width: 20, height: 20 },
            _dictionary: txBoundsDictionary
        };

        // btn pushButton
        const pushDictionary: any = _createDictionary(); // eslint-disable-line
        pushDictionary._kind = 'push';

        const pushButtonField: any = { // eslint-disable-line
            page,
            bounds: { x: 8, y: 8, width: 20, height: 20 },
            _dictionary: pushDictionary
        };

        // btn radio with kids
        const radioKidsDictionary: any = _createDictionary(); // eslint-disable-line
        radioKidsDictionary._kind = 'radioKids';
        radioKidsDictionary.set('Kids', [kidRadioRef]);

        const radioKidsField: any = { // eslint-disable-line
            page,
            _dictionary: radioKidsDictionary
        };

        // btn radio without kids => bounds = field.bounds
        const radioBoundsDictionary: any = _createDictionary(); // eslint-disable-line
        radioBoundsDictionary._kind = 'radioBounds';

        const radioBoundsField: any = { // eslint-disable-line
            page,
            bounds: { x: 15, y: 15, width: 20, height: 20 },
            _dictionary: radioBoundsDictionary
        };

        // btn default checkbox path
        const checkDictionary: any = _createDictionary(); // eslint-disable-line
        checkDictionary._kind = 'check';

        const checkField: any = { // eslint-disable-line
            page,
            bounds: { x: 18, y: 18, width: 20, height: 20 },
            _dictionary: checkDictionary
        };

        // ch combo
        const comboDictionary: any = _createDictionary(); // eslint-disable-line
        comboDictionary._kind = 'combo';

        const comboField: any = { // eslint-disable-line
            page,
            bounds: { x: 22, y: 22, width: 20, height: 20 },
            _dictionary: comboDictionary
        };

        // ch list
        const listDictionary: any = _createDictionary(); // eslint-disable-line
        listDictionary._kind = 'list';

        const listField: any = { // eslint-disable-line
            page,
            bounds: { x: 26, y: 26, width: 20, height: 20 },
            _dictionary: listDictionary
        };

        // sig
        const sigDictionary: any = _createDictionary(); // eslint-disable-line
        sigDictionary._kind = 'sig';

        const sigField: any = { // eslint-disable-line
            page,
            bounds: { x: 30, y: 30, width: 20, height: 20 },
            _dictionary: sigDictionary
        };

        fields.push(
            otherPageField,
            txKidsField,
            txBoundsField,
            pushButtonField,
            radioKidsField,
            radioBoundsField,
            checkField,
            comboField,
            listField,
            sigField
        );

        const form: any = { // eslint-disable-line
            fieldAt: (index: number): any => fields[index], // eslint-disable-line
            removeFieldAt: jasmine.createSpy('removeFieldAt').and.callFake((index: number): void => {
                fields.splice(index, 1);
            })
        };

        Object.defineProperty(form, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => fields.length
        });

        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
            if (arg === kidTxRef) {
                return txKidDictionary;
            }
            if (arg === kidRadioRef) {
                return radioKidDictionary;
            }
            if (arg === annotsRef) {
                return annotsArray;
            }
            return arg;
        });

        const document: any = { // eslint-disable-line
            form,
            _crossReference: {
                _fetch: xrefFetchSpy
            }
        };

        spyOn(ej2Pdf as any, '_getInheritableProperty').and.callFake((dictionary: any, key: string): unknown => { // eslint-disable-line
            const kind: string = dictionary._kind || '';

            if (key === 'FT') {
                if (kind.indexOf('tx') === 0) {
                    return { name: 'Tx' };
                }
                if (kind.indexOf('push') === 0 || kind.indexOf('radio') === 0 || kind.indexOf('check') === 0) {
                    return { name: 'Btn' };
                }
                if (kind.indexOf('combo') === 0 || kind.indexOf('list') === 0) {
                    return { name: 'Ch' };
                }
                if (kind.indexOf('sig') === 0) {
                    return { name: 'Sig' };
                }
                return { name: 'Tx' };
            }

            if (key === 'Ff') {
                if (kind === 'push') {
                    return (ej2Pdf as any)._FieldFlag.pushButton;
                }
                if (kind === 'radioKids' || kind === 'radioBounds') {
                    return (ej2Pdf as any)._FieldFlag.radio;
                }
                if (kind === 'combo') {
                    return (ej2Pdf as any)._FieldFlag.combo;
                }
                return 0;
            }

            return 0;
        });

        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 1000, height: 1000 })
        ];

        // Act
        processor._processFormFields(page, options, document);

        // Assert
        expect(xrefFetchSpy).toHaveBeenCalled();
        expect(page._pageDictionary._updated).toBeTruthy();
        expect(form.removeFieldAt).toHaveBeenCalled();
    });


    it('should cover highlighted _processAnnotation text/textMarkup/trapNetwork intersect-and-remove branches', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 500, height: 500 })
        ];

        const textAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 10, y: 10, width: 20, height: 20 },
            boundsCollection: [{ x: 10, y: 10, width: 20, height: 20 }]
        };

        const textMarkupAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 20, y: 20, width: 20, height: 20 },
            boundsCollection: [{ x: 20, y: 20, width: 20, height: 20 }]
        };

        const trapNetAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 30, y: 30, width: 20, height: 20 },
            boundsCollection: [{ x: 30, y: 30, width: 20, height: 20 }]
        };

        const items: any[] = [textAnn, textMarkupAnn, trapNetAnn]; // eslint-disable-line
        page.annotations = _createAnnotations(items);

        spyOn(processor, '_getAnnotationType').and.callFake((dictionary: any): number => { // eslint-disable-line
            if (dictionary === textAnn._dictionary) {
                return (ej2Pdf as any)._PdfAnnotationType.textAnnotation;
            }
            if (dictionary === textMarkupAnn._dictionary) {
                return (ej2Pdf as any)._PdfAnnotationType.textMarkupAnnotation;
            }
            return (ej2Pdf as any)._PdfAnnotationType.trapNetworkAnnotation;
        });

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).toHaveBeenCalled();
    });

    it('should cover highlighted _processAnnotation text/textMarkup/trapNetwork non-intersect break path', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 5, height: 5 })
        ];

        const nonIntersectAnn: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 100, y: 100, width: 10, height: 10 },
            boundsCollection: [{ x: 200, y: 200, width: 10, height: 10 }]
        };

        page.annotations = _createAnnotations([nonIntersectAnn]);

        spyOn(processor, '_getAnnotationType').and.returnValue(
            (ej2Pdf as any)._PdfAnnotationType.textMarkupAnnotation
        );

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).not.toHaveBeenCalled();
    });
});

describe('_PdfRedactionProcessor highlighted coverage', () => {
    let processor: _PdfRedactionProcessor;

    function _createDictionary(seed?: { [key: string]: unknown }): any { // eslint-disable-line
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: any = { // eslint-disable-line
            _updated: false,
            has: (key: string): boolean => raw.has(key),
            getRaw: (key: string): unknown => raw.get(key),
            get: (key: string): unknown => raw.get(key),
            getArray: (key: string): unknown => raw.get(key),
            set: (key: string, value: unknown): void => {
                raw.set(key, value);
            }
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function _createCrossReference(fetcher?: (arg: unknown) => unknown): any { // eslint-disable-line
        let nextId: number = 1;

        return {
            _cacheMap: new Map<unknown, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
                if (fetcher) {
                    return fetcher(arg);
                }
                return arg;
            }),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): unknown => {
                return { _refId: nextId++ };
            })
        };
    }

    function _createAnnotations(items: any[]): any { // eslint-disable-line
        const annotations: any = { // eslint-disable-line
            at: (index: number): unknown => items[index],
            removeAt: jasmine.createSpy('removeAt').and.callFake((index: number): void => {
                items.splice(index, 1);
            })
        };

        Object.defineProperty(annotations, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => items.length
        });

        return annotations;
    }

    function _createPage(options: {
        contents?: unknown;
        annots?: unknown;
        fetcher?: (arg: unknown) => unknown;
    } = {}): any { // eslint-disable-line
        const xref: any = _createCrossReference(options.fetcher); // eslint-disable-line
        const pageDictionary: any = _createDictionary(); // eslint-disable-line

        if (typeof options.contents !== 'undefined') {
            pageDictionary.set('Contents', options.contents);
        }
        if (typeof options.annots !== 'undefined') {
            pageDictionary.set('Annots', options.annots);
        }

        const graphics: any = { // eslint-disable-line
            _size: { width: 500, height: 500 },
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawRectangle: jasmine.createSpy('drawRectangle')
        };

        return {
            _pageDictionary: pageDictionary,
            _crossReference: xref,
            graphics,
            annotations: _createAnnotations([]),
            _ref: { _pageRef: 1 }
        };
    }

    function _createRegion(
        bounds: { x: number; y: number; width: number; height: number }
    ): PdfRedactionRegion {
        return {
            bounds,
            _appearanceEnabled: false
        } as unknown as PdfRedactionRegion;
    }

    beforeEach(() => {
        processor = new _PdfRedactionProcessor();
    });

    it('should cover highlighted _processFormFields tx, btn, ch and sig lines', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line

        const annotsRef: any = Object.create((ej2Pdf as any)._PdfReference.prototype); // eslint-disable-line
        const kidTxRef: any = Object.create((ej2Pdf as any)._PdfReference.prototype); // eslint-disable-line
        const kidRadioRef: any = Object.create((ej2Pdf as any)._PdfReference.prototype); // eslint-disable-line

        const annotsArray: any[] = [kidTxRef, kidRadioRef]; // eslint-disable-line
        page._pageDictionary.set('Annots', annotsRef);

        const txKidDictionary: any = _createDictionary({ // eslint-disable-line
            Rect: [10, 10, 50, 30],
            P: page._ref
        });

        const radioKidDictionary: any = _createDictionary({ // eslint-disable-line
            Rect: [60, 60, 100, 90],
            P: page._ref
        });

        const fields: any[] = []; // eslint-disable-line

        // field.page !== page -> continue
        const otherPageDictionary: any = _createDictionary(); // eslint-disable-line
        otherPageDictionary._kind = 'skip';

        const otherPageField: any = { // eslint-disable-line
            page: {},
            _dictionary: otherPageDictionary
        };

        // tx with kids > 1
        const txKidsDictionary: any = _createDictionary(); // eslint-disable-line
        txKidsDictionary._kind = 'txKids';
        txKidsDictionary.set('Kids', [kidTxRef, kidTxRef]);

        const txKidsField: any = { // eslint-disable-line
            page,
            _dictionary: txKidsDictionary
        };

        // tx else => bounds = field.bounds
        const txBoundsDictionary: any = _createDictionary(); // eslint-disable-line
        txBoundsDictionary._kind = 'txBounds';

        const txBoundsField: any = { // eslint-disable-line
            page,
            bounds: { x: 5, y: 5, width: 20, height: 20 },
            _dictionary: txBoundsDictionary
        };

        // btn pushButton
        const pushDictionary: any = _createDictionary(); // eslint-disable-line
        pushDictionary._kind = 'push';

        const pushButtonField: any = { // eslint-disable-line
            page,
            bounds: { x: 8, y: 8, width: 20, height: 20 },
            _dictionary: pushDictionary
        };

        // btn radio with kids
        const radioKidsDictionary: any = _createDictionary(); // eslint-disable-line
        radioKidsDictionary._kind = 'radioKids';
        radioKidsDictionary.set('Kids', [kidRadioRef]);

        const radioKidsField: any = { // eslint-disable-line
            page,
            _dictionary: radioKidsDictionary
        };

        // btn radio without kids => bounds = field.bounds
        const radioBoundsDictionary: any = _createDictionary(); // eslint-disable-line
        radioBoundsDictionary._kind = 'radioBounds';

        const radioBoundsField: any = { // eslint-disable-line
            page,
            bounds: { x: 15, y: 15, width: 20, height: 20 },
            _dictionary: radioBoundsDictionary
        };

        // btn default checkbox path
        const checkDictionary: any = _createDictionary(); // eslint-disable-line
        checkDictionary._kind = 'check';

        const checkField: any = { // eslint-disable-line
            page,
            bounds: { x: 18, y: 18, width: 20, height: 20 },
            _dictionary: checkDictionary
        };

        // ch combo
        const comboDictionary: any = _createDictionary(); // eslint-disable-line
        comboDictionary._kind = 'combo';

        const comboField: any = { // eslint-disable-line
            page,
            bounds: { x: 22, y: 22, width: 20, height: 20 },
            _dictionary: comboDictionary
        };

        // ch list
        const listDictionary: any = _createDictionary(); // eslint-disable-line
        listDictionary._kind = 'list';

        const listField: any = { // eslint-disable-line
            page,
            bounds: { x: 26, y: 26, width: 20, height: 20 },
            _dictionary: listDictionary
        };

        // sig
        const sigDictionary: any = _createDictionary(); // eslint-disable-line
        sigDictionary._kind = 'sig';

        const sigField: any = { // eslint-disable-line
            page,
            bounds: { x: 30, y: 30, width: 20, height: 20 },
            _dictionary: sigDictionary
        };

        fields.push(
            otherPageField,
            txKidsField,
            txBoundsField,
            pushButtonField,
            radioKidsField,
            radioBoundsField,
            checkField,
            comboField,
            listField,
            sigField
        );

        const form: any = { // eslint-disable-line
            fieldAt: (index: number): any => fields[index], // eslint-disable-line
            removeFieldAt: jasmine.createSpy('removeFieldAt').and.callFake((index: number): void => {
                fields.splice(index, 1);
            })
        };

        Object.defineProperty(form, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => fields.length
        });

        const xrefFetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.callFake((arg: unknown): unknown => {
            if (arg === kidTxRef) {
                return txKidDictionary;
            }
            if (arg === kidRadioRef) {
                return radioKidDictionary;
            }
            if (arg === annotsRef) {
                return annotsArray;
            }
            return arg;
        });

        const document: any = { // eslint-disable-line
            form,
            _crossReference: {
                _fetch: xrefFetchSpy
            }
        };

        spyOn(ej2Pdf as any, '_getInheritableProperty').and.callFake((dictionary: any, key: string): unknown => { // eslint-disable-line
            const kind: string = dictionary._kind || '';

            if (key === 'FT') {
                if (kind.indexOf('tx') === 0) {
                    return { name: 'Tx' };
                }
                if (kind.indexOf('push') === 0 || kind.indexOf('radio') === 0 || kind.indexOf('check') === 0) {
                    return { name: 'Btn' };
                }
                if (kind.indexOf('combo') === 0 || kind.indexOf('list') === 0) {
                    return { name: 'Ch' };
                }
                if (kind.indexOf('sig') === 0) {
                    return { name: 'Sig' };
                }
                return { name: 'Tx' };
            }

            if (key === 'Ff') {
                if (kind === 'push') {
                    return (ej2Pdf as any)._FieldFlag.pushButton;
                }
                if (kind === 'radioKids' || kind === 'radioBounds') {
                    return (ej2Pdf as any)._FieldFlag.radio;
                }
                if (kind === 'combo') {
                    return (ej2Pdf as any)._FieldFlag.combo;
                }
                return 0;
            }

            return 0;
        });

        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 1000, height: 1000 })
        ];

        // Act
        processor._processFormFields(page, options, document);

        // Assert
        expect(xrefFetchSpy).toHaveBeenCalled();
        expect(page._pageDictionary._updated).toBeTruthy();
        expect(form.removeFieldAt).toHaveBeenCalled();
    });

    it('should cover highlighted _processAnnotation text/textMarkup/trapNetwork intersect remove continue path', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 500, height: 500 })
        ];

        const textAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 10, y: 10, width: 20, height: 20 },
            boundsCollection: [
                { x: 10, y: 10, width: 20, height: 20 }
            ]
        };

        const markupAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 20, y: 20, width: 20, height: 20 },
            boundsCollection: [
                { x: 20, y: 20, width: 20, height: 20 }
            ]
        };

        const trapNetworkAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 30, y: 30, width: 20, height: 20 },
            boundsCollection: [
                { x: 30, y: 30, width: 20, height: 20 }
            ]
        };

        const items: any[] = [ // eslint-disable-line
            textAnnotation,
            markupAnnotation,
            trapNetworkAnnotation
        ];

        page.annotations = _createAnnotations(items);

        spyOn(processor, '_getAnnotationType').and.callFake((dictionary: any): number => { // eslint-disable-line
            if (dictionary === textAnnotation._dictionary) {
                return (ej2Pdf as any)._PdfAnnotationType.textAnnotation;
            }
            if (dictionary === markupAnnotation._dictionary) {
                return (ej2Pdf as any)._PdfAnnotationType.textMarkupAnnotation;
            }
            return (ej2Pdf as any)._PdfAnnotationType.trapNetworkAnnotation;
        });

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).toHaveBeenCalled();
    });

    it('should cover highlighted _processAnnotation text/textMarkup/trapNetwork non-intersect break path', () => {
        // Arrange
        const page: any = _createPage(); // eslint-disable-line
        const options: PdfRedactionRegion[] = [
            _createRegion({ x: 0, y: 0, width: 5, height: 5 })
        ];

        const nonIntersectAnnotation: any = { // eslint-disable-line
            _dictionary: _createDictionary({}),
            _isLoaded: true,
            bounds: { x: 100, y: 100, width: 10, height: 10 },
            boundsCollection: [
                { x: 200, y: 200, width: 10, height: 10 }
            ]
        };

        page.annotations = _createAnnotations([nonIntersectAnnotation]);

        spyOn(processor, '_getAnnotationType').and.returnValue(
            (ej2Pdf as any)._PdfAnnotationType.textMarkupAnnotation
        );

        // Act
        processor._processAnnotation(page, options);

        // Assert
        expect(page.annotations.removeAt).not.toHaveBeenCalled();
    });
    
it('should cover remaining polygon, polyline and ink annotation highlighted lines', () => {
    // Arrange
    const page: any = _createPage(); // eslint-disable-line
    const options: PdfRedactionRegion[] = [
        _createRegion({ x: 0, y: 0, width: 500, height: 500 })
    ];

    const polygonAnnotation: any = { // eslint-disable-line
        _dictionary: _createDictionary({}),
        _isLoaded: true,
        bounds: { x: 10, y: 10, width: 30, height: 30 },
        _getLinePoints: jasmine.createSpy('_getLinePoints').and.returnValue([
            { x: 10, y: 20 },
            { x: 30, y: 40 }
        ])
    };

    const polyLineAnnotation: any = { // eslint-disable-line
        _dictionary: _createDictionary({}),
        _isLoaded: true,
        bounds: { x: 20, y: 20, width: 30, height: 30 },
        _getLinePoints: jasmine.createSpy('_getLinePoints').and.returnValue([
            { x: 15, y: 25 },
            { x: 35, y: 45 }
        ])
    };

    const inkAnnotation: any = { // eslint-disable-line
        _dictionary: _createDictionary({}),
        _isLoaded: false,
        bounds: { x: 25, y: 25, width: 25, height: 25 },
        inkPointsCollection: [
            [
                { x: 5, y: 10 },
                { x: 15, y: 20 }
            ]
        ]
    };

    const items: any[] = [polygonAnnotation, polyLineAnnotation, inkAnnotation]; // eslint-disable-line
    page.annotations = _createAnnotations(items);

    spyOn(processor, '_getAnnotationType').and.callFake((dictionary: any): number => { // eslint-disable-line
        if (dictionary === polygonAnnotation._dictionary) {
            return (ej2Pdf as any)._PdfAnnotationType.polygonAnnotation;
        }
        if (dictionary === polyLineAnnotation._dictionary) {
            return (ej2Pdf as any)._PdfAnnotationType.polyLineAnnotation;
        }
        return (ej2Pdf as any)._PdfAnnotationType.inkAnnotation;
    });

    spyOn(ej2Pdf as any, '_convertPointToNumberArray').and.returnValue([
        [10, 20],
        [30, 40]
    ]);

    spyOn(ej2Pdf as any, '_convertPointsToNumberArrays').and.returnValue([
        [10, 20, 30, 40]
    ]);

    // Act
    processor._processAnnotation(page, options);

    // Assert
    expect(page.annotations.removeAt).toHaveBeenCalled();
    expect(page._pageDictionary._updated).toBeTruthy();
});

});
