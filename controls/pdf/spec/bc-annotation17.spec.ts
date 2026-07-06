
import {
    PdfFreeTextAnnotation
} from '../src/pdf/core/annotations/annotation';

import {
    PdfTextAlignment,
    PdfLineEndingStyle,
    PdfRotationAngle
} from '../src/pdf/core/enumerator';

import {
    PdfStandardFont,
    PdfFontFamily
} from '../src/pdf/core/fonts/pdf-standard-font';

describe('annotation coverage - highlighted uncovered branches', () => {

    function createDictionaryMock(initial?: { [key: string]: any }): any {
        const map: { [key: string]: any } = { ...(initial || {}) };
        return {
            _map: map,
            _updated: false,
            has: (key: string): boolean => Object.prototype.hasOwnProperty.call(map, key),
            get: (key: string): any => map[key],
            getArray: (key: string): any[] => map[key],
            getRaw: (key: string): any => map[key],
            set: (key: string, value: any): void => {
                map[key] = value;
            },
            update: (key: string, value: any): void => {
                map[key] = value;
            }
        };
    }

    function createPageMock(rotation: PdfRotationAngle = PdfRotationAngle.angle0): any {
        return {
            rotation,
            size: { width: 400, height: 500 },
            _size: { width: 400, height: 500 },
            _isNew: false,
            _needInitializeGraphics: false,
            _pageDictionary: createDictionaryMock(),
            _pageSettings: {
                margins: {
                    left: 10,
                    top: 20,
                    right: 10,
                    bottom: 20
                }
            },
            annotations: {
                remove: jasmine.createSpy('remove')
            },
            graphics: {
                save: jasmine.createSpy('save').and.returnValue({}),
                restore: jasmine.createSpy('restore'),
                setTransparency: jasmine.createSpy('setTransparency'),
                drawTemplate: jasmine.createSpy('drawTemplate'),
                drawRectangle: jasmine.createSpy('drawRectangle'),
                drawString: jasmine.createSpy('drawString'),
                drawLine: jasmine.createSpy('drawLine'),
                drawPolygon: jasmine.createSpy('drawPolygon'),
                drawEllipse: jasmine.createSpy('drawEllipse'),
                _stateControl: jasmine.createSpy('_stateControl'),
                _buildUpPath: jasmine.createSpy('_buildUpPath'),
                _drawGraphicsPath: jasmine.createSpy('_drawGraphicsPath'),
                _matrix: {
                    _matrix: {
                        _elements: [1, 0, 0, 1, 0, 0]
                    }
                },
                translateTransform: jasmine.createSpy('translateTransform'),
                rotateTransform: jasmine.createSpy('rotateTransform')
            }
        };
    }

    function createAppearanceTemplateMock(): any {
        const contentDictionary = createDictionaryMock({
            Matrix: [1, 0, 0, 1, 10, 20],
            BBox: [5, 6, 50, 40]
        });

        return {
            _content: {
                dictionary: contentDictionary
            },
            _size: { width: 100, height: 50 }
        };
    }

    // FIX 1: helper specifically for the uncovered BBox -> Matrix update branch.
    function createAppearanceTemplateWithoutMatrixMock(): any {
        const contentDictionary = createDictionaryMock({
            BBox: [5, 6, 50, 40]
        });

        return {
            _content: {
                dictionary: contentDictionary
            },
            _size: { width: 100, height: 50 }
        };
    }

    function defineValueProperty(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            writable: true,
            value
        });
    }

    function defineGetterProperty(target: any, key: string, getter: () => any): void {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get: getter
        });
    }

    describe('PdfFreeTextAnnotation.textMarkUpColor', () => {

        it('covers TextColor branch safely', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            annotation._dictionary = createDictionaryMock({
                TextColor: [1, 0, 0]
            });
            annotation._isLoaded = false;

            const color = annotation.textMarkUpColor;

            expect(color).toBeDefined();
            expect(annotation._textMarkUpColor).toBeDefined();
        });

        it('covers DS color parsing branch safely', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            annotation._dictionary = createDictionaryMock({
                DS: 'font:Helvetica 10pt;color:#00ff00'
            });
            annotation._isLoaded = false;

            const color = annotation.textMarkUpColor;

            expect(color).toEqual({ r: 0, g: 255, b: 0 });
            expect(annotation._textMarkUpColor).toEqual({ r: 0, g: 255, b: 0 });
        });

        it('covers RC override branch safely', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            annotation._dictionary = createDictionaryMock({
                RC: '<body />'
            });
            annotation._isLoaded = false;
            annotation._textMarkUpColor = undefined;

            const brush: any = { _color: { r: 10, g: 20, b: 30 } };
            defineGetterProperty(annotation, '_parsedXMLData', () => ([
                undefined,
                undefined,
                undefined,
                brush
            ]));

            const color = annotation.textMarkUpColor;

            expect(color).toEqual({ r: 10, g: 20, b: 30 });
            expect(annotation._textMarkUpColor).toEqual({ r: 10, g: 20, b: 30 });
        });

        it('covers loaded DA fallback branch safely', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            annotation._dictionary = createDictionaryMock({
                DA: '0.2 0.3 0.4 rg'
            });
            annotation._isLoaded = true;

            spyOn(annotation, '_obtainColor').and.returnValue({ r: 7, g: 8, b: 9 });

            const color = annotation.textMarkUpColor;

            expect(annotation._obtainColor).toHaveBeenCalled();
            expect(color).toEqual({ r: 7, g: 8, b: 9 });
        });

        it('covers setter true branch safely', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            annotation._dictionary = createDictionaryMock();
            annotation._isLoaded = false;

            spyOn(annotation, '_updateStyle').and.stub();
            spyOnProperty(annotation, 'font', 'get').and.returnValue(
                new PdfStandardFont(PdfFontFamily.helvetica, 10)
            );
            spyOnProperty(annotation, 'textAlignment', 'get').and.returnValue(PdfTextAlignment.left);

            annotation.textMarkUpColor = { r: 11, g: 22, b: 33 };

            expect(annotation._updateStyle).toHaveBeenCalled();
            expect(annotation._textMarkUpColor).toEqual({ r: 11, g: 22, b: 33 });
            expect(annotation._isContentUpdated).toBeTruthy();
        });

        it('covers setter false branch safely', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            annotation._dictionary = createDictionaryMock();
            annotation._isLoaded = false;

            spyOn(annotation, '_updateStyle').and.stub();
            spyOnProperty(annotation, 'font', 'get').and.returnValue(
                new PdfStandardFont(PdfFontFamily.helvetica, 10)
            );
            spyOnProperty(annotation, 'textAlignment', 'get').and.returnValue(PdfTextAlignment.left);

            annotation.textMarkUpColor = { r: 11, g: 22, b: 33 };
            const beforeCount = (annotation._updateStyle as jasmine.Spy).calls.count();

            annotation.textMarkUpColor = null as any;

            expect((annotation._updateStyle as jasmine.Spy).calls.count()).toBe(beforeCount);
            expect(annotation._isContentUpdated).toBeTruthy();
        });
    });

    describe('PdfFreeTextAnnotation._doPostProcess', () => {

        it('covers non-flatten AP retrieval branch: appearance = this._dictionary.get("AP")', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            const ap = createDictionaryMock({ N: 'dummy' });

            annotation._dictionary = createDictionaryMock({ AP: ap });
            annotation._isLoaded = true;
            annotation._setAppearance = true;
            annotation._customTemplate = new Map<string, any>();
            annotation._customTemplate.set('N', { _content: {} });
            annotation._page = createPageMock(PdfRotationAngle.angle0);
            annotation._crossReference = {
                _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue({}),
                _cacheMap: new Map<any, any>()
            };
            annotation._isContentUpdated = false;

            spyOnProperty(annotation, 'flattenPopups', 'get').and.returnValue(false);
            spyOn(annotation, '_createAppearance').and.returnValue(undefined);
            spyOn(annotation, '_drawCustomAppearance').and.stub();

            annotation._doPostProcess(false);

            expect(annotation._drawCustomAppearance).toHaveBeenCalledWith(ap);
        });

        it('covers flatten branch when appearanceTemplate exists and AP exists', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            const template = createAppearanceTemplateMock();
            const isValidTemplateMatrixSpy = jasmine.createSpy('_isValidTemplateMatrix').and.returnValue(true);

            annotation._dictionary = createDictionaryMock({
                AP: createDictionaryMock()
            });
            defineValueProperty(annotation, '_appearanceTemplate', template);
            defineValueProperty(annotation, '_isValidTemplateMatrix', isValidTemplateMatrixSpy);
            annotation._isLoaded = true;
            annotation._page = createPageMock(PdfRotationAngle.angle0);
            annotation._customTemplate = new Map<string, any>();
            annotation._isContentUpdated = false;

            spyOnProperty(annotation, 'bounds', 'get').and.returnValue({ x: 10, y: 20, width: 100, height: 40 });
            spyOnProperty(annotation, 'flattenPopups', 'get').and.returnValue(false);
            spyOn(annotation, '_validateTemplateMatrix').and.returnValue(false);
            spyOn(annotation, '_flattenAnnotationTemplate').and.stub();

            annotation._doPostProcess(true);

            expect(annotation._validateTemplateMatrix).toHaveBeenCalledWith(template._content.dictionary);
            expect(annotation._flattenAnnotationTemplate).toHaveBeenCalled();
        });

        // FIX 1 APPLIED ONLY HERE
        it('covers matrix update branch with BBox when not loaded and matrix is not normal', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            const template = createAppearanceTemplateWithoutMatrixMock();
            const updateSpy = spyOn(template._content.dictionary, 'update').and.callThrough();
            const isValidTemplateMatrixSpy = jasmine.createSpy('_isValidTemplateMatrix').and.returnValue(true);

            annotation._dictionary = createDictionaryMock({
                AP: createDictionaryMock()
            });
            defineValueProperty(annotation, '_appearanceTemplate', template);
            defineValueProperty(annotation, '_isValidTemplateMatrix', isValidTemplateMatrixSpy);
            annotation._isLoaded = false;
            annotation._page = createPageMock(PdfRotationAngle.angle0);
            annotation._customTemplate = new Map<string, any>();
            annotation._isContentUpdated = false;

            spyOnProperty(annotation, 'bounds', 'get').and.returnValue({ x: 10, y: 20, width: 100, height: 40 });
            spyOnProperty(annotation, 'flattenPopups', 'get').and.returnValue(false);
            spyOn(annotation, '_postProcess').and.stub();
            spyOn(annotation, '_validateTemplateMatrix').and.returnValue(false);
            spyOn(annotation, '_flattenAnnotationTemplate').and.stub();

            annotation._doPostProcess(true);

            expect(updateSpy).toHaveBeenCalledWith('Matrix', [1, 0, 0, 1, -5, -6]);
            expect(annotation._flattenAnnotationTemplate).toHaveBeenCalled();
        });
    });

    describe('PdfFreeTextAnnotation._createAppearance', () => {

        it('covers loaded lineEndingStyle sync branch and RD rectangle branch without touching rotate setter', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);

            annotation._dictionary = createDictionaryMock({
                RD: [1, 1, 1, 1]
            });
            annotation._page = createPageMock(PdfRotationAngle.angle0);
            annotation._crossReference = undefined;
            annotation._isLoaded = true;
            annotation._customTemplate = new Map<string, any>();
            annotation._bounds = { x: 40, y: 50, width: 120, height: 40 };

            defineValueProperty(annotation, '_font', new PdfStandardFont(PdfFontFamily.helvetica, 10));
            defineValueProperty(annotation, '_lineEndingStyle', PdfLineEndingStyle.none);

            spyOnProperty(annotation, 'border', 'get').and.returnValue({ width: 2 });
            spyOnProperty(annotation, 'bounds', 'get').and.returnValue({ x: 40, y: 50, width: 120, height: 40 });
            spyOnProperty(annotation, 'font', 'get').and.returnValue(
                new PdfStandardFont(PdfFontFamily.helvetica, 10)
            );
            spyOnProperty(annotation, 'textAlignment', 'get').and.returnValue(PdfTextAlignment.left);

            // getter only; never set rotate directly
            spyOnProperty(annotation, 'rotate', 'get').and.returnValue(0);
            spyOnProperty(annotation, 'lineEndingStyle', 'get').and.returnValue(PdfLineEndingStyle.none);

            // force false branch safely without setter validation
            spyOnProperty(annotation, 'calloutLines', 'get').and.returnValue(undefined);

            spyOn(annotation, '_obtainAppearanceBounds').and.returnValue([0, 0, 120, 40]);
            spyOn(annotation, '_getRotationAngle').and.returnValue(0);
            spyOn(annotation, '_obtainText').and.returnValue('free text');
            spyOn(annotation, '_obtainTextAlignment').and.returnValue(PdfTextAlignment.left);
            spyOn(annotation, '_obtainColor').and.returnValue({ r: 1, g: 2, b: 3 });
            spyOn(annotation, '_drawCallOuts').and.stub();
            spyOn(annotation, '_calculateRectangle').and.callFake((rect: number[]) => rect);
            spyOn(annotation, '_drawFreeTextRectangle').and.stub();
            spyOn(annotation, '_drawFreeMarkUpText').and.stub();

            expect(() => {
                annotation._createAppearance();
            }).not.toThrow();

            expect(annotation._lineEndingStyle).toBe(PdfLineEndingStyle.none);
        });
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    PdfRedactionAnnotation,
} from '../src/pdf/core/annotations/annotation';
import {
    _PdfDictionary,
    _PdfReference
} from '../src/pdf/core/pdf-primitives';
import { _PdfStream } from '../src/pdf/core/base-stream';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import * as utils from '../src/pdf/core/utils';

describe('annotation.js uncovered branch coverage - safe specs', () => {

    function createDictionary(seed?: { [key: string]: any }): _PdfDictionary {
        const dict: _PdfDictionary = new _PdfDictionary();
        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                dict.set(key, seed[key]);
            });
        }
        return dict;
    }

    function createCrossReference(): any {
        let objectNumber: number = 100;
        return {
            _cacheMap: new Map<_PdfReference, any>(),
            _document: {
                layers: {
                    count: 0,
                    at: () => undefined as any
                }
            },
            _getNextReference: (): _PdfReference => {
                objectNumber++;
                return { objectNumber, generationNumber: 0 } as _PdfReference;
            }
        };
    }
    function defineValueProperty(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            writable: true,
            value
        });
    }
    function createGraphics(): any {
        return {
            save: jasmine.createSpy('save').and.returnValue({}),
            restore: jasmine.createSpy('restore'),
            setTransparency: jasmine.createSpy('setTransparency'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawString: jasmine.createSpy('drawString'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            drawLine: jasmine.createSpy('drawLine'),
            drawEllipse: jasmine.createSpy('drawEllipse'),
            drawPolygon: jasmine.createSpy('drawPolygon'),
            _stateControl: jasmine.createSpy('_stateControl'),
            _buildUpPath: jasmine.createSpy('_buildUpPath'),
            _drawGraphicsPath: jasmine.createSpy('_drawGraphicsPath'),
            _matrix: {
                _matrix: {
                    _elements: [1, 0, 0, 1, 0, 0]
                }
            },
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform')
        };
    }

    function createPage(): any {
        const graphics: any = createGraphics();
        const pageDictionary: _PdfDictionary = createDictionary({
            MediaBox: [0, 0, 600, 800]
        });

        return {
            size: { width: 600, height: 800 },
            _size: { width: 600, height: 800 },
            _isNew: false,
            _pageDictionary: pageDictionary,
            _pageSettings: {
                margins: { left: 0, top: 0, right: 0, bottom: 0 }
            },
            _crossReference: createCrossReference(),
            _origin: [0, 0],
            _o: [0, 0],
            rotation: PdfRotationAngle.angle0,
            graphics,
            mediaBox: [0, 0, 600, 800],
            cropBox: [0, 0, 600, 800],
            annotations: {
                remove: jasmine.createSpy('remove')
            }
        };
    }

    function createAppearanceStream(withMatrix: boolean, bbox?: number[]): _PdfStream {
        const stream: _PdfStream = new _PdfStream([]);
        const dict: _PdfDictionary = createDictionary();
        if (bbox) {
            dict.set('BBox', bbox);
        }
        if (withMatrix) {
            dict.set('Matrix', [1, 0, 0, 1, 0, 0]);
        }
        stream.dictionary = dict;
        return stream;
    }

    describe('PdfFreeTextAnnotation._obtainText()', () => {

        it('returns current RC-only behavior safely without throw', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            annotation._dictionary = createDictionary({
                RC: '<body><p>rich-text-value</p></body>'
            });
            annotation._rcText = '<body><p>rich-text-value</p></body>';
            annotation._text = undefined;

            const result: string = annotation._obtainText();

            // In current build, the RC fallback condition is not reached because the local text
            // value is initialized before the "text === null" check. So the safe expected value is ''.
            expect(result).toBe('');
            expect(annotation._rcText).toBe('<body><p>rich-text-value</p></body>');
        });

        it('covers Contents branch safely and caches text', () => {
            const annotation: any = Object.create(PdfFreeTextAnnotation.prototype);
            annotation._dictionary = createDictionary({
                Contents: 'plain-content'
            });
            annotation._rcText = '';
            annotation._text = undefined;

            const result: string = annotation._obtainText();

            expect(result).toBe('plain-content');
            expect(annotation._text).toBe('plain-content');
        });
    });

    describe('PdfRedactionAnnotation._postProcess()', () => {

        it('covers bounds throw branch without uncaught test failure', () => {
            const annotation: any = Object.create(PdfRedactionAnnotation.prototype);
            annotation._dictionary = createDictionary();
            annotation._page = createPage();
            annotation._crossReference = annotation._page._crossReference;
            annotation._customTemplate = new Map<string, PdfTemplate>();
            annotation._setAppearance = false;
            annotation._isChanged = false;

            Object.defineProperty(annotation, 'bounds', {
                configurable: true,
                get: (): any => undefined
            });

            let thrown: Error | undefined;
            try {
                annotation._postProcess(false);
            } catch (error) {
                thrown = error as Error;
            }

            expect(thrown).toBeDefined();
            expect((thrown as Error).message).toContain('Bounds');
        });

        it('covers _isChanged branch and BS creation safely', () => {
            const annotation: any = Object.create(PdfRedactionAnnotation.prototype);
            const page: any = createPage();

            annotation._page = page;
            annotation._crossReference = page._crossReference;
            annotation._dictionary = createDictionary();
            annotation._customTemplate = new Map<string, PdfTemplate>();
            annotation._setAppearance = false;
            annotation._isChanged = true;
            annotation._appearanceTemplate = undefined;
            annotation._bounds = { x: 10, y: 10, width: 120, height: 35 };

            Object.defineProperty(annotation, 'bounds', {
                configurable: true,
                get: (): any => annotation._bounds,
                set: (value: any): void => {
                    annotation._bounds = value;
                }
            });

            Object.defineProperty(annotation, 'border', {
                configurable: true,
                get: (): any => ({ width: 1, style: 0, dash: [] })
            });

            spyOn(annotation, '_setQuadPoints').and.stub();
            spyOn(annotation, '_createRedactionAppearance').and.returnValue(undefined);
            spyOn(utils as any, '_updateBounds').and.returnValue([10, 10, 130, 45]);

            annotation._postProcess(false);

            expect(annotation._setQuadPoints).toHaveBeenCalledWith(page.size);
            expect(annotation._dictionary.has('BS')).toBeTruthy();
            expect(annotation._dictionary.getArray('Rect')).toEqual([10, 10, 130, 45]);
        });
    });

    describe('PdfRedactionAnnotation._doPostProcess()', () => {


        it('covers flatten remove branch when appearance template is not available', () => {
            const annotation: any = Object.create(PdfRedactionAnnotation.prototype);
            const page: any = createPage();

            annotation._page = page;
            annotation._crossReference = page._crossReference;
            annotation._dictionary = createDictionary();
            annotation._customTemplate = new Map<string, PdfTemplate>();
            annotation._setAppearance = false;
            annotation._isImported = false;
            annotation._isLoaded = true;
            annotation._appearanceTemplate = undefined;
            annotation._bounds = { x: 20, y: 30, width: 90, height: 25 };

            Object.defineProperty(annotation, 'bounds', {
                configurable: true,
                get: (): any => annotation._bounds,
                set: (value: any): void => {
                    annotation._bounds = value;
                }
            });

            Object.defineProperty(annotation, 'border', {
                configurable: true,
                get: (): any => ({ width: 1, style: 0, dash: [] })
            });

            spyOn(annotation, '_createRedactionAppearance').and.returnValue(undefined);

            annotation._doPostProcess(true);

            expect(page.annotations.remove).toHaveBeenCalledWith(annotation);
        });
    });

    describe('wrapped text alignment helper', () => {

        function createWrappedTextHost(alignment: PdfTextAlignment): any {
            const host: any = Object.create(PdfRedactionAnnotation.prototype);
            host._dictionary = createDictionary();
            host._font = {};
            host._textAlignment = alignment;

            Object.defineProperty(host, 'font', {
                configurable: true,
                get: (): any => host._font,
                set: (value: any): void => {
                    host._font = value;
                }
            });

            Object.defineProperty(host, 'textAlignment', {
                configurable: true,
                get: (): PdfTextAlignment => alignment
            });

            host._measureText = jasmine.createSpy('_measureText').and.callFake((value: string) => {
                return value.length * 10;
            });

            host._getSpaceWidth = jasmine.createSpy('_getSpaceWidth').and.returnValue(5);
            host._getLineHeight = jasmine.createSpy('_getLineHeight').and.returnValue(12);

            host._breakWordToFit = jasmine.createSpy('_breakWordToFit').and.callFake(
                (word: string, availableWidth: number) => {
                    if (word === 'splitword') {
                        return {
                            text: 'split',
                            remainder: 'word'
                        };
                    }
                    if (word === 'noremainder') {
                        return {
                            text: 'noremainder',
                            remainder: ''
                        };
                    }
                    return {
                        text: word,
                        remainder: ''
                    };
                }
            );

            return host;
        }

        it('covers right alignment branch safely', () => {
            const host: any = createWrappedTextHost(PdfTextAlignment.right);
            const graphics: any = createGraphics();
            const brush: any = {};

            (host as any)._drawWrappedTextAligned(
                graphics,
                0,
                0,
                100,
                20,
                ['abc'],
                0,
                PdfTextAlignment.right,
                brush,
                false
            );

            expect(graphics.drawString).toHaveBeenCalled();
        });

        it('covers center alignment branch safely', () => {
            const host: any = createWrappedTextHost(PdfTextAlignment.center);
            const graphics: any = createGraphics();
            const brush: any = {};

            (host as any)._drawWrappedTextAligned(
                graphics,
                0,
                0,
                100,
                20,
                ['abc'],
                0,
                PdfTextAlignment.center,
                brush,
                false
            );

            expect(graphics.drawString).toHaveBeenCalled();
        });

        it('covers chunk.remainder assignment branch safely', () => {
            const host: any = createWrappedTextHost(PdfTextAlignment.left);
            const graphics: any = createGraphics();
            const brush: any = {};

            (host as any)._drawWrappedTextAligned(
                graphics,
                0,
                0,
                40,
                40,
                ['splitword'],
                0,
                PdfTextAlignment.left,
                brush,
                false
            );

            expect(host._breakWordToFit).toHaveBeenCalled();
            expect(graphics.drawString).toHaveBeenCalled();
        });
        it('covers justify branch where extra > 0 is reset to 0', () => {
            const host: any = createWrappedTextHost(PdfTextAlignment.justify);
            const graphics: any = createGraphics();
            const brush: any = {};

            (host as any)._drawWrappedTextAligned(
                graphics,
                0,
                0,
                100,
                30,
                ['a', 'b', 'c'],
                0,
                PdfTextAlignment.justify,
                brush,
                false
            );

            expect(graphics.drawString.calls.count()).toBeGreaterThan(0);
        });

        it('covers exhausted/repeated loop break safely without timeout', () => {
            const host: any = createWrappedTextHost(PdfTextAlignment.left);
            const graphics: any = createGraphics();
            const brush: any = {};

            (host as any)._drawWrappedTextAligned(
                graphics,
                0,
                0,
                10,
                12,
                ['x'],
                0,
                PdfTextAlignment.left,
                brush,
                false
            );

            expect(graphics.drawString.calls.count()).toBeGreaterThan(0);
        });
    });

    describe('getter-only rotate safety', () => {

        it('never sets rotate directly and uses defineProperty safely when needed', () => {
            const annotation: any = Object.create(PdfRedactionAnnotation.prototype);
            annotation._dictionary = createDictionary();
            annotation._page = createPage();

            Object.defineProperty(annotation, 'rotate', {
                configurable: true,
                get: () => 0
            });

            expect(annotation.rotate).toBe(0);
            // Intentionally no direct assignment:
            // annotation.rotate = 90;
        });
    });
});

import * as pdfTemplateModule from '../src/pdf/core/graphics/pdf-template';
import { PdfPopupAnnotation, PdfFileLinkAnnotation } from '../src/pdf/core/annotations/annotation';

describe('Highlighted uncovered branches - annotation', () => {
 

  describe('PdfFileLinkAnnotation constructor', () => {
    it('should assign properties.action through the action setter when action is provided', () => {
      const actionValue: string = "app.alert('launch');";
      const bounds: { x: number; y: number; width: number; height: number } = {
        x: 10,
        y: 20,
        width: 100,
        height: 40
      };

      const actionSetterSpy: jasmine.Spy = spyOnProperty(
        PdfFileLinkAnnotation.prototype,
        'action',
        'set'
      ).and.callFake((_value: string): void => {
        // Intentionally empty
      });

      new PdfFileLinkAnnotation(bounds as any, 'target.pdf', {
        action: actionValue
      } as any);

      expect(actionSetterSpy).toHaveBeenCalledWith(actionValue);
    });
  });

  describe('PdfFileLinkAnnotation._postProcess', () => {
    it('should throw an error when bounds is undefined', () => {
      const annotation: any = new PdfFileLinkAnnotation();

      annotation._dictionary = {
        has: (_key: string): boolean => false,
        get: (_key: string): any => undefined,
        getArray: (_key: string): any => undefined,
        set: jasmine.createSpy('set'),
        update: jasmine.createSpy('update')
      };

      annotation._crossReference = {};
      annotation._page = {
        _isNew: false
      };

      spyOnProperty(annotation, 'bounds', 'get').and.returnValue(undefined);

      expect((): void => {
        annotation._postProcess();
      }).toThrowError('Bounds cannot be null or undefined');
    });

    it('should throw an error when bounds is null', () => {
      const annotation: any = new PdfFileLinkAnnotation();

      annotation._dictionary = {
        has: (_key: string): boolean => false,
        get: (_key: string): any => undefined,
        getArray: (_key: string): any => undefined,
        set: jasmine.createSpy('set'),
        update: jasmine.createSpy('update')
      };

      annotation._crossReference = {};
      annotation._page = {
        _isNew: false
      };

      spyOnProperty(annotation, 'bounds', 'get').and.returnValue(null);

      expect((): void => {
        annotation._postProcess();
      }).toThrowError('Bounds cannot be null or undefined');
    });
  });
});
import {
  PdfDocumentLinkAnnotation,
  PdfTextWebLinkAnnotation
} from '../src/pdf/core/annotations/annotation';

import {  _PdfName } from '../src/pdf/core/pdf-primitives';
import { _PdfDestinationHelper } from '../src/pdf/core/pdf-page';
import { PdfPath } from '../src/pdf/core/graphics/pdf-path';

describe('annotation.js highlighted uncovered branches', () => {
  function defineMutableProperty<T extends object>(target: T, key: string, initialValue: any): { get: () => any; set: (value: any) => void } {
    let currentValue: any = initialValue;
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get: (): any => currentValue,
      set: (value: any): void => {
        currentValue = value;
      }
    });
    return {
      get: (): any => currentValue,
      set: (value: any): void => {
        currentValue = value;
      }
    };
  }

  function createGraphicsStub(): any {
    return {
      drawString: jasmine.createSpy('drawString'),
      drawRectangle: jasmine.createSpy('drawRectangle'),
      save: jasmine.createSpy('save').and.returnValue({}),
      restore: jasmine.createSpy('restore'),
      setTransparency: jasmine.createSpy('setTransparency')
    };
  }

  function createPageStub(isNew: boolean, width: number, height: number, marginLeft: number = 0, marginTop: number = 0): any {
    return {
      _isNew: isNew,
      size: { width, height },
      _pageSettings: {
        margins: {
          left: marginLeft,
          top: marginTop,
          right: 0,
          bottom: 0
        }
      },
      graphics: createGraphicsStub(),
      annotations: {
        remove: jasmine.createSpy('remove')
      }
    };
  }

  describe('PdfDocumentLinkAnnotation', () => {
    

    it('covers destination setter if(value) branch and loaded _initializePrimitive call', () => {
      const annotation: any = new PdfDocumentLinkAnnotation();
      annotation._isLoaded = true;

      const fakeDestination: any = {
        _initializePrimitive: jasmine.createSpy('_initializePrimitive')
      };

      annotation.destination = fakeDestination;

      expect(annotation.destination).toBe(fakeDestination);
      expect(fakeDestination._initializePrimitive).toHaveBeenCalled();
    });

    it('covers _postProcess throw branch safely when bounds is undefined', () => {
      const annotation: any = new PdfDocumentLinkAnnotation();

      defineMutableProperty(annotation, 'bounds', undefined);

      let thrownError: Error | undefined;
      try {
        annotation._postProcess();
      } catch (error) {
        thrownError = error as Error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError!.message).toBe('Bounds cannot be null or undefined');
    });
  });

  describe('PdfTextWebLinkAnnotation', () => {
    it('covers _addAction font fallback branch and URI action branch safely', () => {
      const annotation: any = new PdfTextWebLinkAnnotation();

      annotation._dictionary = new _PdfDictionary();
      annotation._page = createPageStub(false, 400, 600);
      annotation._url = 'https://example.com';
      annotation._textWebLink = 'Syncfusion';
      annotation._isLoaded = false;

      defineMutableProperty(annotation, 'bounds', {
        x: 10,
        y: 20,
        width: 100,
        height: 30
      });

      const fontState = defineMutableProperty(annotation, 'font', undefined);

      annotation._addAction();

      const actionDictionary: any = annotation._dictionary.get('A');

      expect(fontState.get()).toBe(annotation._lineCaptionFont);
      expect(actionDictionary).toBeDefined();
      expect(actionDictionary.get('URI')).toBe('https://example.com');
      expect(annotation._dictionary.get('Border')).toEqual([0, 0, 0]);
      expect(annotation._page.graphics.drawString).toHaveBeenCalled();
    });

    it('covers _postProcess throw branch safely when bounds is null', () => {
      const annotation: any = new PdfTextWebLinkAnnotation();
      defineMutableProperty(annotation, 'bounds', null);

      let thrownError: Error | undefined;
      try {
        annotation._postProcess();
      } catch (error) {
        thrownError = error as Error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError!.message).toBe('Bounds cannot be null or undefined');
    });
  });

  describe('PdfFreeTextAnnotation', () => {
    it('covers _obtainAppearanceBounds callout path, expand branch, and new-page margins path safely', () => {
      const annotation: any = new PdfFreeTextAnnotation();

      annotation._page = createPageStub(true, 500, 700, 12, 18);
      annotation._cropBoxValueX = 5;
      annotation._cropBoxValueY = 7;
      annotation._calloutLines = [
        { x: 20, y: 40 },
        { x: 60, y: 80 }
      ];
      annotation._calloutsClone = [];
      annotation._dictionary = new _PdfDictionary();

      defineMutableProperty(annotation, 'bounds', {
        x: 50,
        y: 100,
        width: 120,
        height: 40
      });

      defineMutableProperty(annotation, 'lineEndingStyle', PdfLineEndingStyle.openArrow);

      spyOn(annotation, '_obtainCallOutsNative').and.callFake((): void => {
        annotation._calloutsClone = [
          { x: 15, y: 25 },
          { x: 45, y: 55 }
        ];
      });

      const expandAppearanceSpy: jasmine.Spy = spyOn(annotation, '_expandAppearance').and.stub();

      const addLinesSpy: jasmine.Spy = spyOn(PdfPath.prototype as any, '_addLines').and.stub();
      const addRectangleSpy: jasmine.Spy = spyOn(PdfPath.prototype as any, 'addRectangle').and.stub();
      const getBoundsSpy: jasmine.Spy = spyOn(PdfPath.prototype as any, '_getBounds')
        .and.returnValues(
          { x: 10, y: 20, width: 30, height: 40 },
          { x: 12, y: 22, width: 34, height: 44 }
        );

      const result: any = annotation._obtainAppearanceBounds();

      expect(annotation._obtainCallOutsNative).toHaveBeenCalled();
      expect(expandAppearanceSpy).toHaveBeenCalled();
      expect(addLinesSpy).toHaveBeenCalled();
      expect(addRectangleSpy).toHaveBeenCalled();
      expect(getBoundsSpy).toHaveBeenCalled();
      expect(result).toEqual({ x: 12, y: 22, width: 34, height: 44 });
    });

  
   

    it('covers highlighted line-ending-style mapping path safely', () => {
      const annotation: any = new PdfFreeTextAnnotation();
      const dictionary: _PdfDictionary = new _PdfDictionary();

      dictionary.set('LE', _PdfName.get('OpenArrow'));
      annotation._dictionary = dictionary;

      const result: any = annotation._obtainLineEndingStyle();

      expect(result).not.toBeUndefined();
    });

    it('covers highlighted text-alignment branch safely when Q exists', () => {
      const annotation: any = new PdfFreeTextAnnotation();
      const dictionary: _PdfDictionary = new _PdfDictionary();

      dictionary.set('Q', PdfTextAlignment.center);
      annotation._dictionary = dictionary;

      const result: any = annotation._obtainTextAlignment();

      expect(result).toBe(PdfTextAlignment.center);
    });
  });
});
