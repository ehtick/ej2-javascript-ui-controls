import { PdfAnnotation, PdfBorderEffect, PdfFreeTextAnnotation, PdfInkAnnotation, PdfLineAnnotation, PdfPolygonAnnotation, PdfPolyLineAnnotation, PdfRectangleAnnotation, PdfRubberStampAnnotation, PdfTextMarkupAnnotation, PdfWatermarkAnnotation } from '../src/pdf/core/annotations/annotation';
import { _PdfAnnotationType, PdfBorderEffectStyle, PdfBorderStyle, PdfLineEndingStyle, PdfRotationAngle, PdfRubberStampAnnotationIcon, PdfTextAlignment, PdfTextMarkupAnnotationType } from '../src/pdf/core/enumerator';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { PdfBrush, PdfGraphics, PdfPen } from '../src/pdf/core/graphics/pdf-graphics';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfAnnotationBorder, PdfCircleAnnotation, PdfRedactionAnnotation, PdfWidgetAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { PdfCjkStandardFont, PdfFontFamily, PdfFontStyle, PdfStandardFont, PdfTrueTypeFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { _PdfStream } from '../src/pdf/core/base-stream';

describe('Annotation uncovered branch coverage', () => {
    let document: PdfDocument;
    let page: PdfPage;

    beforeEach(() => {
        document = new PdfDocument();
        page = document.addPage();
    });

    afterEach(() => {
        document.destroy();
    });

    function dict(values?: Record<string, unknown>): _PdfDictionary {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        if (values) {
            Object.keys(values).forEach((key: string) => dictionary.update(key, values[key]));
        }
        return dictionary;
    }

    function asPrivate<T>(value: T): T & Record<string, unknown> {
        return value as T & Record<string, unknown>;
    }
    it('covers PdfAnnotation rotationAngle setter else, rotate negative and >= 360 branches', () => {
        const annotation: PdfAnnotation = new PdfRectangleAnnotation({ x: 10, y: 10, width: 40, height: 20 });
        const privateAnnotation: PdfAnnotation & Record<string, unknown> = asPrivate(annotation);

        privateAnnotation['_dictionary'] = dict({ Rotate: -90 });
        expect(annotation.rotationAngle).toBeDefined();

        privateAnnotation['_getRotationAngle'] = (): number => -90;
        expect(annotation.rotate).toBe(270);

        privateAnnotation['_getRotationAngle'] = (): number => 450;
        expect(annotation.rotate).toBe(-90);

        annotation.rotationAngle = undefined as unknown as PdfRotationAngle;
        expect(annotation.rotationAngle).toBeDefined();
    });



    it('covers PdfLineAnnotation linePoints setter error branch and null post-process branch', () => {
        const line: PdfLineAnnotation = new PdfLineAnnotation({ x: 10, y: 10 }, { x: 40, y: 40 });
        expect(() => {
            line.linePoints = [{ x: 10, y: 10 }] as unknown as [{ x: number; y: number }, { x: number; y: number }];
        }).toThrowError('Line points length should be 2.');

        const privateLine: PdfLineAnnotation & Record<string, unknown> = asPrivate(line);
        privateLine['_linePoints'] = null;
        expect(() => privateLine['_postProcess'](false)).toThrowError('Line points cannot be null or undefined');
    });

    it('covers PdfLineAnnotation post-process bounds update and vertical angle branch', () => {
        const line: PdfLineAnnotation = new PdfLineAnnotation({ x: 30, y: 80 }, { x: 30, y: 10 });
        const privateLine: PdfLineAnnotation & Record<string, unknown> = asPrivate(line);

        privateLine['_page'] = page;
        privateLine['_dictionary'] = dict({ Measure: dict() });
        privateLine['_bounds'] = { x: 30, y: 10, width: 1, height: 70 };
        privateLine['_setAppearance'] = true;
        privateLine['_flatten'] = false;
        privateLine['_isLoaded'] = false;
        privateLine['_createLineMeasureAppearance'] = (): PdfTemplate => new PdfTemplate({ width: 20, height: 20 });

        expect(() => privateLine['_postProcess'](false)).not.toThrow();

    });

    it('covers PdfRectangleAnnotation borderEffect setter and cloudy border branch', () => {
        const rectangle: PdfRectangleAnnotation = new PdfRectangleAnnotation({ x: 10, y: 10, width: 50, height: 30 });
        const effect: PdfBorderEffect = new PdfBorderEffect();
        effect.style = PdfBorderEffectStyle.cloudy;
        effect.intensity = 1;

        rectangle.borderEffect = effect;
        expect(rectangle.borderEffect.style).toBe(PdfBorderEffectStyle.cloudy);

        const privateRectangle: PdfRectangleAnnotation & Record<string, unknown> = asPrivate(rectangle);
        privateRectangle['_page'] = page;
        privateRectangle['_dictionary'] = dict({ BE: dict({ S: new _PdfName('C'), I: 1 }) });
        privateRectangle['_isLoaded'] = false;
        expect(() => privateRectangle['_postProcess'](false)).not.toThrow();
    });

    it('covers PdfPolygonAnnotation lineExtension negative, null points, and rotation 270 branches', () => {
        const polygon: PdfPolygonAnnotation = new PdfPolygonAnnotation([
            { x: 10, y: 10 },
            { x: 50, y: 10 },
            { x: 50, y: 40 }
        ]);
        expect(() => {
            polygon.lineExtension = -1;
        }).toThrowError('LineExtension should be non negative number');

        const privatePolygon: PdfPolygonAnnotation & Record<string, unknown> = asPrivate(polygon);
        privatePolygon['_points'] = null;
        expect(() => privatePolygon['_postProcess'](false)).toThrowError('Points cannot be null or undefined');

        privatePolygon['_points'] = [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 30 }];
        privatePolygon['_dictionary'] = dict({ Vertices: [10, 10, 30, 10, 30, 30] });
        privatePolygon['_isBounds'] = true;
        privatePolygon['_page'] = page;
        asPrivate(page)['_pageDictionary'] = dict({ Rotate: 270 });
        asPrivate(page)['rotation'] = PdfRotationAngle.angle270;

        const points: unknown = privatePolygon['_getLinePoints']();
        expect(points).toBeDefined();
    });



    it('covers PdfTextMarkupAnnotation boundsCollection, quadPoints and squiggly branches', () => {
        const markup: PdfTextMarkupAnnotation = new PdfTextMarkupAnnotation(
            'text',
            { x: 10, y: 10, width: 40, height: 10 }
        );
        const privateMarkup: PdfTextMarkupAnnotation & Record<string, unknown> = asPrivate(markup);

        privateMarkup['_isLoaded'] = true;
        privateMarkup['_dictionary'] = dict({
            QuadPoints: [10, 10, 50, 10, 10, 20, 50, 20],
            Rect: [10, 10, 40, 10]
        });
        privateMarkup['_page'] = page;

        markup.boundsCollection = [{ x: 15, y: 15, width: 40, height: 10 }];
        expect(markup.boundsCollection.length).toBe(1);

        privateMarkup['_drawSquiggly'](20, 10);
        expect(privateMarkup['_dictionary'].has('QuadPoints')).toBeTruthy();
    });



    it('covers RubberStamp icon, appearance parsing and template branches', () => {
        const stamp: PdfRubberStampAnnotation = new PdfRubberStampAnnotation(
            { x: 10, y: 10, width: 100, height: 40 },
        );
        const privateStamp: PdfRubberStampAnnotation & Record<string, unknown> = asPrivate(stamp);

        privateStamp['_page'] = page;
        privateStamp['_dictionary'] = dict({ Name: new _PdfName('Final') });
        privateStamp['_isLoaded'] = false;
        expect(stamp.icon).toBe(4);
    });


    it('covers PdfBorderEffect direct dictionary/default setter branches', () => {
        const effect: PdfBorderEffect = new PdfBorderEffect();
        effect.intensity = undefined as unknown as number;
        effect.style = undefined as unknown as PdfBorderEffectStyle;
        expect(effect.intensity).toBeUndefined();
        expect(effect.style).toBeUndefined();

        effect.intensity = 2;
        effect.style = PdfBorderEffectStyle.cloudy;
        expect(effect.intensity).toBe(2);
        expect(effect.style).toBe(PdfBorderEffectStyle.cloudy);
    });
});


describe('annotation uncovered screenshot branches', () => {

    function createDictionary(seed: Record<string, any> | undefined = undefined): _PdfDictionary {
        const d: _PdfDictionary = new _PdfDictionary();
        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                d.update(key, seed[key]);
            });
        }
        return d;
    }

    function createSize(width: number = 600, height: number = 800): any {
        const size: any = [width, height];
        size[0] = width;
        size[1] = height;
        size.width = width;
        size.height = height;
        return size;
    }

    function createCrossReference(): any {
        let refId: number = 0;
        return {
            _cacheMap: new Map<any, any>(),
            _newLine: '\r\n',
            _getNextReference(): _PdfReference {
                return new _PdfReference(refId++, 0);
            },
            _fetch(reference: _PdfReference): any {
                return this._cacheMap.get(reference);
            }
        };
    }

    function createPage(rotation: PdfRotationAngle = PdfRotationAngle.angle0): any {
        const graphics = {
            save: jasmine.createSpy('save').and.returnValue({}),
            restore: jasmine.createSpy('restore'),
            setTransparency: jasmine.createSpy('setTransparency'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawString: jasmine.createSpy('drawString'),
            drawPath: jasmine.createSpy('drawPath'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            drawLine: jasmine.createSpy('drawLine'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            setClip: jasmine.createSpy('setClip'),
            _sw: {
                _clear: jasmine.createSpy('_clear'),
                _write: jasmine.createSpy('_write'),
                _setColorSpace: jasmine.createSpy('_setColorSpace')
            }
        };

        return {
            rotation: rotation,
            size: createSize(600, 800),
            graphics: graphics,
            _isNew: false,
            _pageDictionary: createDictionary(),
            _pageSettings: {
                size: { width: 600, height: 800 },
                margins: { left: 10, top: 20, right: 10, bottom: 20 }
            },
            annotations: {
                remove: jasmine.createSpy('remove'),
                removeAt: jasmine.createSpy('removeAt')
            }
        };
    }

    function shadowValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value: value,
            writable: true,
            configurable: true
        });
    }

    function shadowGetter(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            get: () => {
                return value;
            },
            configurable: true
        });
    }

    it('covers PdfRubberStampAnnotation._parseStampAppearance rotated and non rotated AP plus BBox plus Matrix branches', () => {
        const stamp: any = new PdfRubberStampAnnotation({ x: 0, y: 0, width: 120, height: 35 });
        const crossReference: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle90);

        const stream: any = new _PdfStream(new Uint8Array([1, 2, 3]));
        stream.dictionary = createDictionary({
            Matrix: [1, 0, 0, 1, 0, 0],
            BBox: [0, 0, 120, 40]
        });

        const nRef: _PdfReference = crossReference._getNextReference();
        const ap: _PdfDictionary = createDictionary({ N: stream });
        (ap as any).getRaw = (key: string) => {
            if (key === 'N') {
                return nRef;
            }
            return undefined;
        };

        stamp._dictionary = createDictionary({ AP: ap });
        stamp._crossReference = crossReference;
        stamp._page = page;
        stamp._appearanceTemplate = undefined;
        shadowGetter(stamp, 'rotationAngle', PdfRotationAngle.angle0);
        stamp._transformBBox = jasmine.createSpy('_transformBBox').and.returnValue([0, 0, 120, 40]);

        const isTransformBBox: boolean = stamp._parseStampAppearance();

        expect(isTransformBBox).toBeTruthy();
        expect(stamp._appearanceTemplate).toBeDefined();
        expect(stamp._transformBBox).toHaveBeenCalled();

        stream.dictionary = createDictionary({
            BBox: [0, 0, 100, 25]
        });

        const isTransformBBoxSecond: boolean = stamp._parseStampAppearance();
        expect(isTransformBBoxSecond).toBeTruthy();
        expect(stamp._appearanceTemplate).toBeDefined();
    });



    it('covers PdfRubberStampAnnotation._obtainInnerBounds AP N BBox branch and default return', () => {
        const stamp: any = new PdfRubberStampAnnotation({
            x: 40,
            y: 50,
            width: 120,
            height: 35
        });

        const page: any = createPage();
        stamp._page = page;

        // ✅ FIX: _obtainInnerBounds uses `bounds`, not `_bounds`
        shadowGetter(stamp, 'bounds', {
            x: 40,
            y: 50,
            width: 120,
            height: 35
        });

        // --- AP / N / BBox branch ---
        const normalStream: any = new _PdfStream(new Uint8Array([1]));
        normalStream.dictionary = createDictionary({
            BBox: [0, 0, 90, 26]
        });

        const appearanceDictionary: _PdfDictionary = createDictionary({
            N: normalStream
        });

        const annotDictionary: _PdfDictionary = createDictionary({
            AP: appearanceDictionary
        });

        stamp._dictionary = annotDictionary;

        const bounds = stamp._obtainInnerBounds();
        expect(bounds).toEqual(jasmine.objectContaining({
            width: 90,
            height: 26
        }));

        // --- default return branch ---
        stamp._dictionary = createDictionary();

        const defaultBounds = stamp._obtainInnerBounds();
        expect(defaultBounds).toBeTruthy();
    });


    it('covers PdfFreeTextAnnotation.calloutLines setter changed unchanged and else branches', () => {
        const annot: any = Object.create(PdfFreeTextAnnotation.prototype);
        const page: any = createPage();

        annot._page = page;
        annot._isLoaded = true;
        annot._cropBoxValueX = 5;
        annot._cropBoxValueY = 7;
        annot._dictionary = createDictionary();

        shadowValue(annot, '_calloutLines', [
            { x: 10, y: 20 },
            { x: 30, y: 40 },
            { x: 50, y: 60 }
        ]);

        // unchanged branch
        annot.calloutLines = [
            { x: 10, y: 20 },
            { x: 30, y: 40 },
            { x: 50, y: 60 }
        ];
        expect(annot._dictionary.has('CL')).toBeFalsy();

        // ✅ changed same-length branch (correct Y conversion)
        annot.calloutLines = [
            { x: 11, y: 21 },
            { x: 30, y: 40 },
            { x: 50, y: 60 }
        ];
        expect(annot._dictionary.get('CL')).toEqual([
            16, page.size[1] - 21 + 7,
            35, page.size[1] - 40 + 7,
            55, page.size[1] - 60 + 7
        ]);

        // ✅ else branch (length mismatch)
        annot.calloutLines = [
            { x: 9, y: 9 },
            { x: 19, y: 19 }
        ];
        expect(annot._dictionary.get('CL')).toEqual([
            14, page.size[1] - 9 + 7,
            24, page.size[1] - 19 + 7
        ]);
    });

    it('covers PdfFreeTextAnnotation._isValidTemplateMatrix false branch with Matrix BBox opacity and page removal', () => {
        const annot: any = Object.create(PdfFreeTextAnnotation.prototype);
        const page: any = createPage();

        annot._page = page;

        // ✅ required dictionary for internal updates
        annot._dictionary = createDictionary();

        // ✅ opacity must exist via getter
        annot._opacity = 0.5;
        shadowGetter(annot, 'opacity', 0.5);

        // ✅ annotation bounds
        shadowValue(annot, '_bounds', {
            x: 20,
            y: 30,
            width: 100,
            height: 40
        });

        // ✅ FORCE INVALID matrix (translation does NOT match bounds)
        const dictionary: _PdfDictionary = createDictionary({
            Matrix: [1, 0, 0, 1, 999, 999],
            BBox: [0, 0, 50, 20]
        });

        const template = new PdfTemplate([0, 0, 50, 20], createCrossReference());

        // ✅ MUST pass appearance OBJECT (this is the key fix)
        const result: boolean = annot._isValidTemplateMatrix(
            dictionary,
            [0, 0, 50, 20],
            {
                graphics: page.graphics,
                appearanceTemplate: template
            }
        );

        // ✅ NOW the correct branch executes
        expect(result).toBeFalsy();
        expect(page.graphics.save).toHaveBeenCalled();
        expect(page.graphics.setTransparency).toHaveBeenCalledWith(0.5);
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(page.annotations.remove).toHaveBeenCalledWith(annot);
    });


    it('covers PdfFreeTextAnnotation font color text and alignment helper branches from the screenshots', () => {
        const annot: any = Object.create(PdfFreeTextAnnotation.prototype);

        annot._dictionary = createDictionary();
        annot._isLoaded = true;
        annot._text = undefined;
        annot._rcText = 'fallback-rc-text';
        annot._updateStyle = jasmine.createSpy('_updateStyle');
        annot._page = createPage();
        annot._font = undefined;
        annot._obtainFontDetails = jasmine.createSpy('_obtainFontDetails').and.returnValue({
            name: 'Helvetica',
            size: 10,
            style: PdfFontStyle.regular
        });

        annot._dictionary.update('RC', '<body style="font-family:Helvetica;font-size:10pt"></body>');
        annot._parsedXMLData = [
            new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular)
        ];

        const font = annot._obtainFont();
        expect(font).toBeDefined();

        expect(annot._getFontFamily(PdfFontFamily.helvetica)).toBe('Helvetica');
        expect(annot._getFontFamily(PdfFontFamily.courier)).toBe('Courier');
        expect(annot._getFontFamily(PdfFontFamily.timesRoman)).toBe('TimesRoman');
        expect(annot._getFontFamily(PdfFontFamily.symbol)).toBe('Symbol');
        expect(annot._getFontFamily(PdfFontFamily.zapfDingbats)).toBe('ZapfDingbats');

        expect(annot._parseFontSize('12pt')).toBe(12);
        expect(annot._parseFontSize('12px')).toBe(0);
        expect(annot._parseFontSize('')).toBe(0);
        expect(annot._parseFontFamily(' Helvetica ')).toBe('Helvetica');

        let obtainText: Function;
        if (annot.obtainText) {
            obtainText = annot.obtainText.bind(annot);
        } else {
            obtainText = annot._obtainText.bind(annot);
        }

        annot._dictionary = createDictionary({
            Contents: 'dictionary-text'
        });
        expect(obtainText()).toBe('dictionary-text');

        let obtainTextAlignment: Function;
        if (annot.obtainTextAlignment) {
            obtainTextAlignment = annot.obtainTextAlignment.bind(annot);
        } else {
            obtainTextAlignment = annot._obtainTextAlignment.bind(annot);
        }

        annot._dictionary = createDictionary({
            Q: PdfTextAlignment.right
        });
        expect(obtainTextAlignment()).toBe(PdfTextAlignment.right);

        annot._dictionary = createDictionary({
            RC: 'x'
        });
        annot._parsedXMLData = [
            new PdfStandardFont(PdfFontFamily.helvetica, 10),
            PdfTextAlignment.center
        ];
        expect(obtainTextAlignment()).toBe(PdfTextAlignment.center);

        annot._dictionary = createDictionary({
            DS: 'text-align:left;text-align:right;text-align:center;text-align:justify'
        });
        expect(obtainTextAlignment()).toBe(0);
    });

});


