
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fields from '../src/pdf/core/form/field';
import * as pdfTemplateModule from '../src/pdf/core/graphics/pdf-template';
import * as utils from '../src/pdf/core/utils';

import {
    PdfTextBoxField,
    PdfButtonField,
    PdfCheckBoxField,
    PdfRadioButtonListField,
    PdfComboBoxField,
    PdfListField
} from '../src/pdf/core/form/field';

import {
    PdfWidgetAnnotation,
    PdfInteractiveBorder,
    PdfStateItem
} from '../src/pdf/core/annotations/annotation';

import {
    _PdfDictionary,
    _PdfName,
    _PdfReference
} from '../src/pdf/core/pdf-primitives';

import { _PdfBaseStream } from '../src/pdf/core/base-stream';

import {
    PdfHighlightMode,
    PdfRotationAngle,
    PdfTextAlignment,
    PdfBorderStyle,
    _PdfWordWrapType
} from '../src/pdf/core/enumerator';

import {
    PdfGraphics,
    PdfGraphicsState,
    PdfBrush,
    PdfPen
} from '../src/pdf/core/graphics/pdf-graphics';

import {
    PdfStringFormat,
    PdfVerticalAlignment
} from '../src/pdf/core/fonts/pdf-string-format';

import {
    PdfFont,
    PdfFontFamily,
    PdfFontStyle,
    PdfStandardFont
} from '../src/pdf/core/fonts/pdf-standard-font';

describe('Field coverage – targeted uncovered branches', () => {

    function createReference(id: number): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        (reference as any).objectNumber = id;
        (reference as any).generationNumber = 0;
        (reference as any).toString = (): string => `${id} 0 R`;
        return reference;
    }

    function createCrossReference(): any {
        let refId: number = 1;
        const formDictionary: _PdfDictionary = new _PdfDictionary(undefined as any);
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _document: {
                form: {
                    _dictionary: formDictionary,
                    _setAppearance: true
                }
            },
            _getNextReference(): _PdfReference {
                return createReference(refId++);
            },
            _fetch(ref: _PdfReference): _PdfDictionary {
                const value: unknown = this._cacheMap.get(ref);
                return value as _PdfDictionary;
            }
        };
        return crossReference;
    }

    function createGraphics(pageRotation: PdfRotationAngle = PdfRotationAngle.angle0): PdfGraphics {
        const state: PdfGraphicsState = {} as PdfGraphicsState;
        const graphics: PdfGraphics = {
            _page: { rotation: pageRotation } as any,
            _size: { width: 400, height: 300 },
            _isTemplateGraphics: false,
            _sw: {
                _setTextRenderingMode: jasmine.createSpy('_setTextRenderingMode'),
                _beginMarkupSequence: jasmine.createSpy('_beginMarkupSequence'),
                _endMarkupSequence: jasmine.createSpy('_endMarkupSequence')
            },
            save: jasmine.createSpy('save').and.returnValue(state),
            restore: jasmine.createSpy('restore'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawString: jasmine.createSpy('drawString'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            drawLine: jasmine.createSpy('drawLine'),
            drawEllipse: jasmine.createSpy('drawEllipse'),
            drawArc: jasmine.createSpy('drawArc'),
            drawPath: jasmine.createSpy('drawPath'),
            initializeCoordinates: jasmine.createSpy('initializeCoordinates'),
            _initializeCoordinates: jasmine.createSpy('_initializeCoordinates')
        } as unknown as PdfGraphics;
        return graphics;
    }

    function createPage(rotation: PdfRotationAngle = PdfRotationAngle.angle0): any {
        return {
            rotation,
            graphics: createGraphics(rotation)
        };
    }

    function createTemplateLike(
        width: number = 40,
        height: number = 20,
        rotation: PdfRotationAngle = PdfRotationAngle.angle0
    ): any {
        return {
            _size: { width, height },
            graphics: createGraphics(rotation),
            _content: {}
        };
    }

    function createWidget(
        xref: any,
        bounds: { x: number; y: number; width: number; height: number },
        page: any
    ): PdfWidgetAnnotation {
        const widget: PdfWidgetAnnotation = Object.create(PdfWidgetAnnotation.prototype) as PdfWidgetAnnotation;
        const dictionary: _PdfDictionary = new _PdfDictionary(xref);
        const mk: _PdfDictionary = new _PdfDictionary(xref);

        dictionary.update('MK', mk);

        Object.defineProperty(widget, '_dictionary', {
            value: dictionary,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_mkDictionary', {
            value: mk,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_ref', {
            value: createReference(1000 + Math.floor(bounds.x + bounds.y + bounds.width + bounds.height)),
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_page', {
            value: page,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_getPage', {
            value: (): any => page,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, 'bounds', {
            value: bounds,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, 'rotate', {
            get: (): number => 90,
            configurable: true
        });

        Object.defineProperty(widget, 'color', {
            get: (): { r: number; g: number; b: number } => ({ r: 0, g: 0, b: 0 }),
            configurable: true
        });

        Object.defineProperty(widget, 'backColor', {
            get: (): { r: number; g: number; b: number } => ({ r: 255, g: 255, b: 255 }),
            configurable: true
        });

        Object.defineProperty(widget, 'borderColor', {
            get: (): { r: number; g: number; b: number } => ({ r: 10, g: 20, b: 30 }),
            configurable: true
        });

        Object.defineProperty(widget, 'border', {
            get: (): PdfInteractiveBorder => {
                const border: PdfInteractiveBorder = new PdfInteractiveBorder();
                border.width = 1;
                border.style = PdfBorderStyle.solid;
                return border;
            },
            configurable: true
        });

        Object.defineProperty(widget, 'textAlignment', {
            value: PdfTextAlignment.center,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_enableGrouping', {
            value: false,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_setAppearance', {
            value: false,
            writable: true,
            configurable: true
        });

        return widget;
    }

    function createBaseStream(): _PdfBaseStream {
        const stream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        Object.defineProperty(stream, 'dictionary', {
            value: new _PdfDictionary(undefined as any),
            writable: true,
            configurable: true
        });
        return stream;
    }

    it('PdfTextBoxField._doPostProcess should cover loaded loop, loaded else and non-loaded appearance branch safely', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);

        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._setAppearance = true;
        field._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field._kids = [];
        field._defaultIndex = 0;

        const widget0: PdfWidgetAnnotation = createWidget(xref, { x: 10, y: 20, width: 100, height: 25 }, page);
        const widget1: PdfWidgetAnnotation = createWidget(xref, { x: 20, y: 30, width: 110, height: 30 }, page);

        field._kids.push(widget0._ref, widget1._ref);
        field._parsedItems.set(0, widget0);
        field._parsedItems.set(1, widget1);

        const postSpy: jasmine.Spy = spyOn(field as any, '_postProcess').and.stub();
        const createAppearanceSpy: jasmine.Spy = spyOn(field as any, '_createAppearance').and.returnValue(createTemplateLike());
        const drawTemplateSpy: jasmine.Spy = spyOn(field as any, '_drawTemplate').and.stub();
        const addAppearanceSpy: jasmine.Spy = spyOn(field as any, '_addAppearance').and.stub();
        spyOn(field as any, '_checkFieldFlag').and.returnValue(false);

        field._isLoaded = true;
        field._doPostProcess(false);
        expect(postSpy.calls.count()).toBe(2);

        postSpy.calls.reset();
        field._kids = [];
        field._parsedItems.clear();
        field._doPostProcess(true);
        expect(postSpy).toHaveBeenCalledWith(true);

        field._isLoaded = false;
        field._kids = [widget0._ref, widget1._ref];
        field._parsedItems.set(0, widget0);
        field._parsedItems.set(1, widget1);

        field._doPostProcess(true);
        expect(createAppearanceSpy.calls.count()).toBeGreaterThan(0);
        expect(drawTemplateSpy.calls.count()).toBeGreaterThan(0);

        field._doPostProcess(false);
        expect(addAppearanceSpy.calls.count()).toBeGreaterThan(0);
    });

    it('PdfTextBoxField._postProcess should cover AP/N stream path and flatten page rotation angle180 safely', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle180);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: false } as any;
        field._setAppearance = false;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 15, y: 25, width: 120, height: 30 }, page);
        widget._setAppearance = false;
        widget._enableGrouping = false;

        const ap: _PdfDictionary = new _PdfDictionary(xref);
        const stream: _PdfBaseStream = createBaseStream();

        ap.update('N', stream);
        widget._dictionary.update('AP', ap);

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(55, 18);
        });

        field._postProcess(true, widget);

        expect(page.graphics.save).toHaveBeenCalled();
        expect(page.graphics.translateTransform).toHaveBeenCalled();
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(-180);
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeFalsy();
    });

    it('PdfTextBoxField._postProcess should cover AP/N stream path and flatten page rotation angle270 safely', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle270);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: false } as any;
        field._setAppearance = false;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 5, y: 35, width: 90, height: 20 }, page);
        widget._setAppearance = false;
        widget._enableGrouping = false;

        const ap: _PdfDictionary = new _PdfDictionary(xref);
        const stream: _PdfBaseStream = createBaseStream();

        ap.update('N', stream);
        widget._dictionary.update('AP', ap);

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(42, 16);
        });

        field._postProcess(true, widget);

        expect(page.graphics.translateTransform).toHaveBeenCalled();
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(270);
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeFalsy();
    });

    it('PdfButtonField should cover text getter/setter, highlightMode getter/setter, font getter and _assignText else branch', () => {
        const xref: any = createCrossReference();
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field._defaultIndex = 0;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 0, y: 0, width: 80, height: 25 }, createPage());
        field._parsedItems.set(0, widget);
        field._kids = [widget._ref];

        // text getter -> widget MK 'CA'
        widget._mkDictionary.update('CA', 'WidgetCaption');
        field._isLoaded = true;
        field._text = undefined as any;
        expect(field.text).toBe('WidgetCaption');

        // text setter -> loaded widget branch
        field.text = 'LoadedButtonText';
        expect((widget._dictionary.get('MK') as _PdfDictionary).get('CA')).toBe('LoadedButtonText');

        // text setter -> non loaded branch
        field._isLoaded = false;
        field._text = 'Old';
        field.text = 'NewButtonText';
        expect((widget._dictionary.get('MK') as _PdfDictionary).get('CA')).toBe('NewButtonText');

        // highlightMode getter -> dictionary branch
        field._dictionary.update('H', _PdfName.get('N'));
        Object.defineProperty(widget, 'highlightMode', {
            get: (): any => undefined,
            configurable: true
        });
        expect(field.highlightMode).toBe(PdfHighlightMode.noHighlighting);

        // highlightMode setter -> dictionary branch (avoid widget assignment to readonly property)
        Object.defineProperty(widget, 'highlightMode', {
            get: (): PdfHighlightMode => PdfHighlightMode.outline,
            configurable: true
        });
        field.highlightMode = PdfHighlightMode.outline;
        expect(field._dictionary.has('H')).toBeTruthy();

        // font getter branch
        const resolvedFont: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        spyOn(utils as any, '_obtainFontDetails').and.returnValue(resolvedFont);
        field._font = undefined as any;
        expect(field.font).toBe(resolvedFont);

        // _assignText else branch (no MK)
        const bareDictionary: _PdfDictionary = new _PdfDictionary(xref);
        field._assignText(bareDictionary, 'AssignedWithoutMK');
        expect(bareDictionary.has('MK')).toBeTruthy();
        expect((bareDictionary.get('MK') as _PdfDictionary).get('CA')).toBe('AssignedWithoutMK');
        expect(bareDictionary._updated).toBeTruthy();
    });

    it('PdfButtonField._createAppearance should cover grouping path, loaded defaultAppearance fallback path and normal/pressed drawing branches', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._text = 'Button text';
        field._stringFormat = new PdfStringFormat(PdfTextAlignment.center, PdfVerticalAlignment.middle);
        field._font = undefined as any;
        field._isLoaded = true;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 12, y: 22, width: 110, height: 30 }, page);
        widget._enableGrouping = true;
        widget._mkDictionary.update('CA', 'GroupedCaption');

        Object.defineProperty(widget, 'font', {
            value: { size: 0 } as any,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_defaultAppearance', {
            value: {
                fontName: undefined,
                fontSize: 0
            },
            configurable: true
        });

        spyOn(utils as any, '_mapFont').and.callFake((): PdfFont => {
            return new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);
        });

        const drawButtonSpy: jasmine.Spy = spyOn(field as any, '_drawButton').and.stub();
        const drawPressedSpy: jasmine.Spy = spyOn(field as any, '_drawPressedButton').and.stub();

        field._createAppearance(widget, false);
        expect(drawButtonSpy).toHaveBeenCalled();

        field._createAppearance(widget, true);
        expect(drawPressedSpy).toHaveBeenCalled();

        // non-grouping path
        widget._enableGrouping = false;
        field._font = undefined as any;
        field._createAppearance(widget, false);
        expect(drawButtonSpy.calls.count()).toBeGreaterThan(1);
    });

    it('PdfButtonField._doPostProcess should cover loaded loop, loaded else, and non-loaded appearance generation without throwing', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._setAppearance = true;
        field._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field._defaultIndex = 0;

        const widget0: PdfWidgetAnnotation = createWidget(xref, { x: 10, y: 10, width: 90, height: 25 }, page);
        const widget1: PdfWidgetAnnotation = createWidget(xref, { x: 20, y: 20, width: 90, height: 25 }, page);

        field._kids = [widget0._ref, widget1._ref];
        field._parsedItems.set(0, widget0);
        field._parsedItems.set(1, widget1);

        const postSpy: jasmine.Spy = spyOn(field as any, '_postProcess').and.stub();
        const createAppearanceSpy: jasmine.Spy = spyOn(field as any, '_createAppearance').and.returnValue(createTemplateLike());
        const drawTemplateSpy: jasmine.Spy = spyOn(field as any, '_drawTemplate').and.stub();
        const addAppearanceSpy: jasmine.Spy = spyOn(field as any, '_addAppearance').and.stub();
        spyOn(field as any, '_checkFieldFlag').and.returnValue(false);

        field._isLoaded = true;
        field._doPostProcess(false);
        expect(postSpy.calls.count()).toBe(2);

        postSpy.calls.reset();
        field._kids = [];
        field._parsedItems.clear();
        field._doPostProcess(true);
        expect(postSpy).toHaveBeenCalledWith(true);

        field._isLoaded = false;
        field._kids = [widget0._ref, widget1._ref];
        field._parsedItems.set(0, widget0);
        field._parsedItems.set(1, widget1);

        field._doPostProcess(false);
        expect(createAppearanceSpy.calls.count()).toBeGreaterThan(0);
        expect(addAppearanceSpy.calls.count()).toBeGreaterThan(0);

        field._doPostProcess(true);
        expect(drawTemplateSpy.calls.count()).toBeGreaterThan(0);
    });

    it('PdfButtonField._postProcess should cover nested AP dictionary + AS lookup and flatten angle180 safely', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle180);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: false } as any;
        field._setAppearance = false;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 22, y: 33, width: 100, height: 28 }, page);
        widget._setAppearance = false;
        widget._enableGrouping = false;

        const ap: _PdfDictionary = new _PdfDictionary(xref);
        const appearanceStates: _PdfDictionary = new _PdfDictionary(xref);
        const onStream: _PdfBaseStream = createBaseStream();

        appearanceStates.update('OnState', onStream);
        ap.update('N', appearanceStates);
        widget._dictionary.update('AP', ap);
        widget._dictionary.update('AS', _PdfName.get('OnState'));

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(48, 20);
        });

        field._postProcess(true, widget);

        expect(page.graphics.translateTransform).toHaveBeenCalled();
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(-180);
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeFalsy();
    });

    it('PdfButtonField._postProcess should cover nested AP dictionary + AS lookup and flatten angle270 safely', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle270);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: false } as any;
        field._setAppearance = false;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 8, y: 18, width: 88, height: 26 }, page);
        widget._setAppearance = false;
        widget._enableGrouping = false;

        const ap: _PdfDictionary = new _PdfDictionary(xref);
        const appearanceStates: _PdfDictionary = new _PdfDictionary(xref);
        const onStream: _PdfBaseStream = createBaseStream();

        appearanceStates.update('OnState', onStream);
        ap.update('N', appearanceStates);
        widget._dictionary.update('AP', ap);
        widget._dictionary.update('AS', _PdfName.get('OnState'));

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(44, 18);
        });

        field._postProcess(true, widget);

        expect(page.graphics.translateTransform).toHaveBeenCalled();
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(270);
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeFalsy();
    });

    it('PdfButtonField._drawButton should cover rotate 90/270 branches without touching read-only rotate setter', () => {
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;
        const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);

        const graphics90: PdfGraphics = createGraphics(PdfRotationAngle.angle0);
        const format90: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.center, PdfVerticalAlignment.middle);
        const parameter90: any = {
            bounds: { x: 0, y: 0, width: 120, height: 30 },
            rotationAngle: 90,
            pageRotationAngle: PdfRotationAngle.angle0,
            borderWidth: 1,
            borderStyle: PdfBorderStyle.solid,
            foreBrush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            backBrush: new PdfBrush({ r: 255, g: 255, b: 255 }),
            borderPen: new PdfPen({ r: 0, g: 0, b: 0 }, 1)
        };

        spyOn(field as any, '_drawRectangularControl').and.stub();
        field._drawButton(graphics90, parameter90, 'Caption', font, format90);
        expect(graphics90.rotateTransform).toHaveBeenCalledWith(-90);
        expect(format90._wordWrapType).toBe(_PdfWordWrapType.none);

        const graphics270: PdfGraphics = createGraphics(PdfRotationAngle.angle0);
        const format270: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.center, PdfVerticalAlignment.middle);
        const parameter270: any = {
            bounds: { x: 0, y: 0, width: 120, height: 30 },
            rotationAngle: 270,
            pageRotationAngle: PdfRotationAngle.angle0,
            borderWidth: 1,
            borderStyle: PdfBorderStyle.solid,
            foreBrush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            backBrush: new PdfBrush({ r: 255, g: 255, b: 255 }),
            borderPen: new PdfPen({ r: 0, g: 0, b: 0 }, 1)
        };

        field._drawButton(graphics270, parameter270, 'Caption', font, format270);
        expect(graphics270.rotateTransform).toHaveBeenCalledWith(-270);
        expect(format270._wordWrapType).toBe(_PdfWordWrapType.none);
    });
});

describe('Field coverage – red highlighted branches from screenshots', () => {

    function createReference(id: number): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        (reference as any).objectNumber = id;
        (reference as any).generationNumber = 0;
        (reference as any).toString = (): string => `${id} 0 R`;
        return reference;
    }

    function createCrossReference(): any {
        let refId: number = 1;
        const formDictionary: _PdfDictionary = new _PdfDictionary(undefined as any);
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _document: {
                form: {
                    _dictionary: formDictionary,
                    _setAppearance: true
                }
            },
            _getNextReference(): _PdfReference {
                return createReference(refId++);
            },
            _fetch(ref: _PdfReference): _PdfDictionary {
                const value: unknown = this._cacheMap.get(ref);
                return value as _PdfDictionary;
            }
        };
        return crossReference;
    }

    function createGraphics(pageRotation: PdfRotationAngle = PdfRotationAngle.angle0): PdfGraphics {
        const state: PdfGraphicsState = {} as PdfGraphicsState;
        const graphics: PdfGraphics = {
            _page: { rotation: pageRotation } as any,
            _size: { width: 400, height: 300 },
            _isTemplateGraphics: false,
            _sw: {
                _setTextRenderingMode: jasmine.createSpy('_setTextRenderingMode'),
                _beginMarkupSequence: jasmine.createSpy('_beginMarkupSequence'),
                _endMarkupSequence: jasmine.createSpy('_endMarkupSequence')
            },
            save: jasmine.createSpy('save').and.returnValue(state),
            restore: jasmine.createSpy('restore'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawString: jasmine.createSpy('drawString'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            drawLine: jasmine.createSpy('drawLine'),
            drawEllipse: jasmine.createSpy('drawEllipse'),
            drawArc: jasmine.createSpy('drawArc'),
            drawPath: jasmine.createSpy('drawPath'),
            initializeCoordinates: jasmine.createSpy('initializeCoordinates'),
            _initializeCoordinates: jasmine.createSpy('_initializeCoordinates')
        } as unknown as PdfGraphics;
        return graphics;
    }

    function createPage(rotation: PdfRotationAngle = PdfRotationAngle.angle0): any {
        return {
            rotation,
            graphics: createGraphics(rotation)
        };
    }

    function createTemplateLike(
        width: number = 60,
        height: number = 20,
        rotation: PdfRotationAngle = PdfRotationAngle.angle0
    ): any {
        return {
            _size: { width, height },
            graphics: createGraphics(rotation),
            _content: {}
        };
    }

    function createBaseStream(): _PdfBaseStream {
        const stream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        Object.defineProperty(stream, 'dictionary', {
            value: new _PdfDictionary(undefined as any),
            writable: true,
            configurable: true
        });
        return stream;
    }

    function createWidget(
        xref: any,
        bounds: { x: number; y: number; width: number; height: number },
        page: any
    ): PdfWidgetAnnotation {
        const widget: PdfWidgetAnnotation = Object.create(PdfWidgetAnnotation.prototype) as PdfWidgetAnnotation;
        const dictionary: _PdfDictionary = new _PdfDictionary(xref);
        const mk: _PdfDictionary = new _PdfDictionary(xref);

        dictionary.update('MK', mk);

        Object.defineProperty(widget, '_dictionary', {
            value: dictionary,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_mkDictionary', {
            value: mk,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_ref', {
            value: createReference(1000 + Math.floor(bounds.x + bounds.y + bounds.width + bounds.height)),
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_page', {
            value: page,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_getPage', {
            value: (): any => page,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, 'bounds', {
            value: bounds,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, 'rotate', {
            get: (): number => 90,
            configurable: true
        });

        Object.defineProperty(widget, 'color', {
            get: (): { r: number; g: number; b: number } => ({ r: 0, g: 0, b: 0 }),
            configurable: true
        });

        Object.defineProperty(widget, 'backColor', {
            get: (): { r: number; g: number; b: number } => ({ r: 255, g: 255, b: 255 }),
            configurable: true
        });

        let currentBorderColor: { r: number; g: number; b: number } = { r: 10, g: 20, b: 30 };
        Object.defineProperty(widget, 'borderColor', {
            get: (): { r: number; g: number; b: number } => currentBorderColor,
            set: (value: { r: number; g: number; b: number }): void => {
                currentBorderColor = value;
            },
            configurable: true
        });

        Object.defineProperty(widget, 'border', {
            get: (): PdfInteractiveBorder => {
                const border: PdfInteractiveBorder = new PdfInteractiveBorder();
                border.width = 1;
                border.style = PdfBorderStyle.solid;
                return border;
            },
            configurable: true
        });

        Object.defineProperty(widget, 'textAlignment', {
            value: PdfTextAlignment.center,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_enableGrouping', {
            value: false,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_setAppearance', {
            value: false,
            writable: true,
            configurable: true
        });

        return widget;
    }

    it('PdfTextBoxField._createAppearance should cover border width zero, action formatting, password, maxLength, grouping stringFormat, RTL and lineLimit via this._stringFormat', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._isLoaded = true;
        field._font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        field._stringFormat = new PdfStringFormat(PdfTextAlignment.left, PdfVerticalAlignment.middle);

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 10, y: 20, width: 140, height: 30 }, page);
        widget._enableGrouping = true;

        const zeroBorder: PdfInteractiveBorder = new PdfInteractiveBorder();
        zeroBorder.width = 0;
        zeroBorder.style = PdfBorderStyle.solid;
        Object.defineProperty(widget, 'border', {
            get: (): PdfInteractiveBorder => zeroBorder,
            configurable: true
        });

        Object.defineProperty(widget, 'font', {
            value: new PdfStandardFont(PdfFontFamily.helvetica, 9, PdfFontStyle.regular),
            configurable: true
        });

        Object.defineProperty(widget, 'textAlignment', {
            value: PdfTextAlignment.center,
            configurable: true
        });

        Object.defineProperty(field, 'text', {
            get: (): string => 'abcde123456',
            configurable: true
        });

        Object.defineProperty(field, 'password', {
            get: (): boolean => true,
            configurable: true
        });

        Object.defineProperty(field, 'maxLength', {
            get: (): number => 5,
            configurable: true
        });

        Object.defineProperty(field, 'required', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'multiLine', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'scrollable', {
            get: (): boolean => true,
            configurable: true
        });

        Object.defineProperty(field, 'insertSpaces', {
            get: (): boolean => false,
            configurable: true
        });

        field._actions = {
            format: {
                script: 'AFDate_FormatEx("dd/MM/yyyy")'
            }
        } as any;

        spyOn(utils as any, '_setMatrix').and.stub();
        spyOn(utils as any, '_updateDashedBorderStyle').and.stub();
        spyOn(utils as any, '_isRightToLeftCharacters').and.returnValue(true);
        spyOn(field as any, '_tryParseAcrobatFormFormat').and.returnValue('dd/MM/yyyy');
        spyOn(field as any, '_normalizeDateValue').and.returnValue('אבגדה123456');
        const drawTextBoxSpy: jasmine.Spy = spyOn(field as any, '_drawTextBox').and.stub();

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(140, 30);
        });

        field._createAppearance(false, widget);

        expect((utils as any)._updateDashedBorderStyle).toHaveBeenCalled();
        expect(widget.borderColor).toEqual({ r: 255, g: 255, b: 255 });
        expect((field as any)._normalizeDateValue).toHaveBeenCalled();
        expect(field._stringFormat.lineLimit).toBeFalsy();
        expect(drawTextBoxSpy).toHaveBeenCalled();

        const args: any[] = drawTextBoxSpy.calls.mostRecent().args;
        expect(args[2]).toBe('*****');
        expect(args[4] instanceof PdfStringFormat).toBeTruthy();
    });

    it('PdfTextBoxField._createAppearance should cover grouping stringFormat lineLimit via local stringFormat branch', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._isLoaded = true;
        field._font = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        field._stringFormat = undefined as any;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 0, y: 0, width: 120, height: 20 }, page);
        widget._enableGrouping = true;

        Object.defineProperty(widget, 'font', {
            value: new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular),
            configurable: true
        });

        Object.defineProperty(widget, 'textAlignment', {
            value: PdfTextAlignment.center,
            configurable: true
        });

        Object.defineProperty(field, 'text', {
            get: (): string => 'sample',
            configurable: true
        });

        Object.defineProperty(field, 'password', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'maxLength', {
            get: (): number => 0,
            configurable: true
        });

        Object.defineProperty(field, 'required', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'multiLine', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'scrollable', {
            get: (): boolean => true,
            configurable: true
        });

        Object.defineProperty(field, 'insertSpaces', {
            get: (): boolean => false,
            configurable: true
        });

        spyOn(utils as any, '_setMatrix').and.stub();
        spyOn(utils as any, '_updateDashedBorderStyle').and.stub();
        spyOn(utils as any, '_isRightToLeftCharacters').and.returnValue(false);

        const drawTextBoxSpy: jasmine.Spy = spyOn(field as any, '_drawTextBox').and.stub();

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(120, 20);
        });

        field._createAppearance(false, widget);

        const args: any[] = drawTextBoxSpy.calls.mostRecent().args;
        const formatArg: PdfStringFormat = args[4] as PdfStringFormat;
        expect(formatArg instanceof PdfStringFormat).toBeTruthy();
        expect(formatArg.lineLimit).toBeFalsy();
    });

    it('PdfTextBoxField._createAppearance should cover non-grouping _stringFormat initialization when textAlignment is undefined/null', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._isLoaded = false;
        field._font = undefined as any;
        field._defaultFont = new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);
        field._stringFormat = undefined as any;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 0, y: 0, width: 100, height: 20 }, page);
        widget._enableGrouping = false;

        Object.defineProperty(field, 'text', {
            get: (): string => 'text',
            configurable: true
        });

        Object.defineProperty(field, 'password', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'maxLength', {
            get: (): number => 0,
            configurable: true
        });

        Object.defineProperty(field, 'required', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'multiLine', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'scrollable', {
            get: (): boolean => true,
            configurable: true
        });

        Object.defineProperty(field, 'insertSpaces', {
            get: (): boolean => false,
            configurable: true
        });

        Object.defineProperty(field, 'textAlignment', {
            get: (): any => undefined,
            configurable: true
        });

        spyOn(utils as any, '_setMatrix').and.stub();
        spyOn(utils as any, '_updateDashedBorderStyle').and.stub();
        spyOn(utils as any, '_isRightToLeftCharacters').and.returnValue(false);
        spyOn(field as any, '_drawTextBox').and.stub();

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(100, 20);
        });

        field._createAppearance(false, widget);

        expect(field._stringFormat instanceof PdfStringFormat).toBeTruthy();
    });

    it('PdfTextBoxField._drawTextBox should cover insertSpaces recursive branch and border separator drawLine branch', () => {
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const graphics: PdfGraphics = createGraphics(PdfRotationAngle.angle0);

        Object.defineProperty(field, 'borderColor', {
            get: (): { r: number; g: number; b: number } => ({ r: 0, g: 0, b: 0 }),
            configurable: true
        });

        Object.defineProperty(field, 'rotate', {
            get: (): number => 0,
            configurable: true
        });

        const font: any = {
            _getHeight: (): number => 10,
            _getAscent: (): number => 7
        };

        const parameter: any = {
            bounds: { x: 0, y: 0, width: 100, height: 20 },
            insertSpaces: true,
            borderWidth: 1,
            borderStyle: PdfBorderStyle.solid,
            borderPen: new PdfPen({ r: 0, g: 0, b: 0 }, 1),
            backBrush: new PdfBrush({ r: 255, g: 255, b: 255 }),
            foreBrush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            rotationAngle: 0
        };

        const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.center, PdfVerticalAlignment.middle);
        spyOn(field as any, '_drawRectangularControl').and.stub();

        field._drawTextBox(graphics, parameter, 'AB', font, format, false, true, 4);

        expect(graphics.drawLine).toHaveBeenCalled();
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('PdfTextBoxField._drawTextBox should cover multiline newline rectangle.y shift branch', () => {
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const graphics: PdfGraphics = createGraphics(PdfRotationAngle.angle0);

        Object.defineProperty(field, 'rotate', {
            get: (): number => 0,
            configurable: true
        });

        const font: any = {
            _getHeight: (): number => 10,
            _getAscent: (): number => 6
        };

        const parameter: any = {
            bounds: { x: 0, y: 1, width: 100, height: 30 },
            insertSpaces: false,
            borderWidth: 0,
            borderStyle: PdfBorderStyle.solid,
            borderPen: new PdfPen({ r: 0, g: 0, b: 0 }, 1),
            backBrush: new PdfBrush({ r: 255, g: 255, b: 255 }),
            foreBrush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            rotationAngle: 0,
            isAutoFontSize: false
        };

        const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.left, PdfVerticalAlignment.middle);
        spyOn(field as any, '_drawRectangularControl').and.stub();

        field._drawTextBox(graphics, parameter, 'line1\nline2', font, format, true, true);

        const rect: any = (graphics.drawString as jasmine.Spy).calls.mostRecent().args[2];
        expect(rect.y).toBe(3);
    });

    it('PdfTextBoxField._drawTextBox should cover multiline non-newline else-if rectangle.y shift branch', () => {
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const graphics: PdfGraphics = createGraphics(PdfRotationAngle.angle0);

        Object.defineProperty(field, 'rotate', {
            get: (): number => 0,
            configurable: true
        });

        const font: any = {
            _getHeight: (): number => 10,
            _getAscent: (): number => 6
        };

        const parameter: any = {
            bounds: { x: 0, y: 1, width: 100, height: 30 },
            insertSpaces: false,
            borderWidth: 0,
            borderStyle: PdfBorderStyle.solid,
            borderPen: new PdfPen({ r: 0, g: 0, b: 0 }, 1),
            backBrush: new PdfBrush({ r: 255, g: 255, b: 255 }),
            foreBrush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            rotationAngle: 0,
            isAutoFontSize: false
        };

        const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.left, PdfVerticalAlignment.middle);
        spyOn(field as any, '_drawRectangularControl').and.stub();

        field._drawTextBox(graphics, parameter, 'singleline', font, format, true, true);

        const rect: any = (graphics.drawString as jasmine.Spy).calls.mostRecent().args[2];
        expect(rect.y).toBe(3);
    });

    it('PdfTextBoxField._drawTextBox should cover multiline autoFontSize with nonzero borderWidth branch', () => {
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const graphics: PdfGraphics = createGraphics(PdfRotationAngle.angle0);

        Object.defineProperty(field, 'rotate', {
            get: (): number => 0,
            configurable: true
        });

        const font: any = {
            _getHeight: (): number => 10,
            _getAscent: (): number => 6
        };

        const parameter: any = {
            bounds: { x: 0, y: 1, width: 100, height: 30 },
            insertSpaces: false,
            borderWidth: 2,
            borderStyle: PdfBorderStyle.solid,
            borderPen: new PdfPen({ r: 0, g: 0, b: 0 }, 1),
            backBrush: new PdfBrush({ r: 255, g: 255, b: 255 }),
            foreBrush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            rotationAngle: 0,
            isAutoFontSize: true
        };

        const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.left, PdfVerticalAlignment.middle);
        spyOn(field as any, '_drawRectangularControl').and.stub();

        field._drawTextBox(graphics, parameter, 'singleline', font, format, true, true);

        const rect: any = (graphics.drawString as jasmine.Spy).calls.mostRecent().args[2];
        expect(rect.y).toBe(6);
    });

    it('PdfButtonField.text getter should cover widget MK CA branch', () => {
        const xref: any = createCrossReference();
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field._defaultIndex = 0;
        field._isLoaded = true;
        field._text = undefined as any;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 0, y: 0, width: 80, height: 20 }, createPage());
        widget._mkDictionary.update('CA', 'WidgetCaption');

        field._kids = [widget._ref];
        field._parsedItems.set(0, widget);

        expect(field.text).toBe('WidgetCaption');
    });

    it('PdfButtonField.text getter should cover field MK CA branch when widget is unavailable', () => {
        const xref: any = createCrossReference();
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;
        const mk: _PdfDictionary = new _PdfDictionary(xref);

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._dictionary.update('MK', mk);
        field._dictionary.update('CA', 'trigger');
        mk.update('CA', 'FieldCaption');
        field._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field._kids = [];
        field._defaultIndex = 0;
        field._isLoaded = true;
        field._text = undefined as any;

        expect(field.text).toBe('FieldCaption');
    });

    it('PdfButtonField.text getter should cover inherited V branch and final empty string branch', () => {
        const xref: any = createCrossReference();
        const field1: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;
        field1._crossReference = xref;
        field1._dictionary = new _PdfDictionary(xref);
        field1._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field1._kids = [];
        field1._defaultIndex = 0;
        field1._isLoaded = true;
        field1._text = undefined as any;

        const inheritableSpy: jasmine.Spy = spyOn(utils as any, '_getInheritableProperty').and.returnValue('InheritedCaption');
        expect(field1.text).toBe('InheritedCaption');
        expect(inheritableSpy).toHaveBeenCalled();

        const field2: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;
        field2._crossReference = xref;
        field2._dictionary = new _PdfDictionary(xref);
        field2._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field2._kids = [];
        field2._defaultIndex = 0;
        field2._isLoaded = true;
        field2._text = undefined as any;

        (utils as any)._getInheritableProperty.and.returnValue(undefined);
        expect(field2.text).toBe('');
    });

    it('PdfButtonField.text setter should cover loaded else branch using field dictionary when widget is unavailable', () => {
        const xref: any = createCrossReference();
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field._kids = [];
        field._defaultIndex = 0;
        field._isLoaded = true;
        field._text = 'old';

        Object.defineProperty(field, 'readOnly', {
            get: (): boolean => false,
            configurable: true
        });

        field.text = 'AssignedToFieldDictionary';

        expect(field._dictionary.has('MK')).toBeTruthy();
        expect((field._dictionary.get('MK') as _PdfDictionary).get('CA')).toBe('AssignedToFieldDictionary');
    });

    it('PdfButtonField.highlightMode getter/setter should cover dictionary branches safely without widget assignment', () => {
        const xref: any = createCrossReference();
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._parsedItems = new Map<number, PdfWidgetAnnotation>();
        field._kids = [];
        field._defaultIndex = 0;

        field._dictionary.update('H', _PdfName.get('N'));
        spyOn(utils as any, '_mapHighlightMode').and.returnValue(PdfHighlightMode.noHighlighting);
        spyOn(utils as any, '_reverseMapHighlightMode').and.returnValue(_PdfName.get('P'));

        expect(field.highlightMode).toBe(PdfHighlightMode.noHighlighting);

        field.highlightMode = PdfHighlightMode.outline;
        expect((utils as any)._reverseMapHighlightMode).toHaveBeenCalledWith(PdfHighlightMode.outline);
        expect(field._dictionary.has('H')).toBeTruthy();
    });

    it('PdfButtonField.font getter should cover existing _font return branch', () => {
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;
        const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
        field._font = font;
        expect(field.font).toBe(font);
    });
});

describe('Field coverage – all highlighted branches from the 3 screenshots', () => {

    function createReference(id: number): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        (reference as any).objectNumber = id;
        (reference as any).generationNumber = 0;
        (reference as any).toString = (): string => `${id} 0 R`;
        return reference;
    }

    function createCrossReference(): any {
        let refId: number = 1;
        const formDictionary: _PdfDictionary = new _PdfDictionary(undefined as any);
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _document: {
                form: {
                    _dictionary: formDictionary,
                    _setAppearance: true
                }
            },
            _getNextReference(): _PdfReference {
                return createReference(refId++);
            },
            _fetch(ref: _PdfReference): _PdfDictionary {
                const value: unknown = this._cacheMap.get(ref);
                return value as _PdfDictionary;
            }
        };
        return crossReference;
    }

    function createGraphics(pageRotation: PdfRotationAngle = PdfRotationAngle.angle0): PdfGraphics {
        const state: PdfGraphicsState = {} as PdfGraphicsState;
        const graphics: PdfGraphics = {
            _page: { rotation: pageRotation } as any,
            _size: { width: 400, height: 300 },
            _isTemplateGraphics: false,
            _sw: {
                _setTextRenderingMode: jasmine.createSpy('_setTextRenderingMode'),
                _beginMarkupSequence: jasmine.createSpy('_beginMarkupSequence'),
                _endMarkupSequence: jasmine.createSpy('_endMarkupSequence')
            },
            save: jasmine.createSpy('save').and.returnValue(state),
            restore: jasmine.createSpy('restore'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawString: jasmine.createSpy('drawString'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            drawLine: jasmine.createSpy('drawLine'),
            drawEllipse: jasmine.createSpy('drawEllipse'),
            drawArc: jasmine.createSpy('drawArc'),
            drawPath: jasmine.createSpy('drawPath'),
            initializeCoordinates: jasmine.createSpy('initializeCoordinates'),
            _initializeCoordinates: jasmine.createSpy('_initializeCoordinates')
        } as unknown as PdfGraphics;
        return graphics;
    }

    function createPage(rotation: PdfRotationAngle = PdfRotationAngle.angle0): any {
        return {
            rotation,
            graphics: createGraphics(rotation)
        };
    }

    function createTemplateLike(
        width: number = 60,
        height: number = 20,
        rotation: PdfRotationAngle = PdfRotationAngle.angle0
    ): any {
        return {
            _size: { width, height },
            graphics: createGraphics(rotation),
            _content: {}
        };
    }

    function createBaseStream(): _PdfBaseStream {
        const stream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        Object.defineProperty(stream, 'dictionary', {
            value: new _PdfDictionary(undefined as any),
            writable: true,
            configurable: true
        });
        return stream;
    }

    function createWidget(
        xref: any,
        bounds: { x: number; y: number; width: number; height: number },
        page: any
    ): PdfWidgetAnnotation {
        const widget: PdfWidgetAnnotation = Object.create(PdfWidgetAnnotation.prototype) as PdfWidgetAnnotation;
        const dictionary: _PdfDictionary = new _PdfDictionary(xref);
        const mk: _PdfDictionary = new _PdfDictionary(xref);

        dictionary.update('MK', mk);

        Object.defineProperty(widget, '_dictionary', {
            value: dictionary,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_mkDictionary', {
            value: mk,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_ref', {
            value: createReference(1000 + Math.floor(bounds.x + bounds.y + bounds.width + bounds.height)),
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_page', {
            value: page,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_getPage', {
            value: (): any => page,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, 'bounds', {
            value: bounds,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, 'rotate', {
            get: (): number => 90,
            configurable: true
        });

        Object.defineProperty(widget, 'color', {
            get: (): { r: number; g: number; b: number } => ({ r: 0, g: 0, b: 0 }),
            configurable: true
        });

        Object.defineProperty(widget, 'backColor', {
            get: (): { r: number; g: number; b: number } => ({ r: 255, g: 255, b: 255 }),
            configurable: true
        });

        let currentBorderColor: { r: number; g: number; b: number } = { r: 10, g: 20, b: 30 };
        Object.defineProperty(widget, 'borderColor', {
            get: (): { r: number; g: number; b: number } => currentBorderColor,
            set: (value: { r: number; g: number; b: number }): void => {
                currentBorderColor = value;
            },
            configurable: true
        });

        Object.defineProperty(widget, 'border', {
            get: (): PdfInteractiveBorder => {
                const border: PdfInteractiveBorder = new PdfInteractiveBorder();
                border.width = 1;
                border.style = PdfBorderStyle.solid;
                return border;
            },
            configurable: true
        });

        Object.defineProperty(widget, 'textAlignment', {
            value: PdfTextAlignment.center,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_enableGrouping', {
            value: false,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_setAppearance', {
            value: false,
            writable: true,
            configurable: true
        });

        return widget;
    }

    function setupPostProcessAppearance(
        widget: PdfWidgetAnnotation,
        xref: any,
        stateName: string = 'OnState'
    ): { outerRef: _PdfReference; nestedRef: _PdfReference; stream: _PdfBaseStream } {
        const ap: _PdfDictionary = new _PdfDictionary(xref);
        const appearanceStates: _PdfDictionary = new _PdfDictionary(xref);
        const stream: _PdfBaseStream = createBaseStream();
        const outerRef: _PdfReference = createReference(3001);
        const nestedRef: _PdfReference = createReference(3002);

        appearanceStates.update(stateName, stream);
        widget._dictionary.update('AS', _PdfName.get(stateName));
        widget._dictionary.update('AP', ap);
        ap.update('N', appearanceStates);

        spyOn(ap, 'getRaw').and.callFake((key: string): any => {
            if (key === 'N') {
                return outerRef;
            }
            return undefined;
        });

        spyOn(appearanceStates, 'getRaw').and.callFake((key: string): any => {
            if (key === stateName) {
                return nestedRef;
            }
            return undefined;
        });

        return { outerRef, nestedRef, stream };
    }

    it('PdfButtonField._postProcess should cover nested AP + AS resolution and flatten page rotation angle90', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle90);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: false } as any;
        field._setAppearance = false;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 10, y: 15, width: 90, height: 25 }, page);
        widget._setAppearance = false;
        widget._enableGrouping = false;

        const setup: { outerRef: _PdfReference; nestedRef: _PdfReference; stream: _PdfBaseStream } =
            setupPostProcessAppearance(widget, xref);

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(40, 20);
        });

        field._postProcess(true, widget);

        expect(page.graphics.save).toHaveBeenCalled();
        expect(page.graphics.translateTransform).toHaveBeenCalledWith({ x: page.graphics._size.width, y: page.graphics._size.height });
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(90);
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeFalsy();

        expect((setup.stream as any).reference).toBe(setup.nestedRef);
    });

    it('PdfButtonField._postProcess should cover nested AP + AS resolution and flatten page rotation angle180', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle180);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: false } as any;
        field._setAppearance = false;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 20, y: 25, width: 100, height: 28 }, page);
        widget._setAppearance = false;
        widget._enableGrouping = false;

        const setup: { outerRef: _PdfReference; nestedRef: _PdfReference; stream: _PdfBaseStream } =
            setupPostProcessAppearance(widget, xref);

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(48, 18);
        });

        field._postProcess(true, widget);

        expect(page.graphics.translateTransform).toHaveBeenCalledWith({ x: page.graphics._size.width, y: page.graphics._size.height });
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(-180);
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeFalsy();

        expect((setup.stream as any).reference).toBe(setup.nestedRef);
    });

    it('PdfButtonField._postProcess should cover nested AP + AS resolution and flatten page rotation angle270', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle270);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: false } as any;
        field._setAppearance = false;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 5, y: 10, width: 88, height: 26 }, page);
        widget._setAppearance = false;
        widget._enableGrouping = false;

        const setup: { outerRef: _PdfReference; nestedRef: _PdfReference; stream: _PdfBaseStream } =
            setupPostProcessAppearance(widget, xref);

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(44, 16);
        });

        field._postProcess(true, widget);

        expect(page.graphics.translateTransform).toHaveBeenCalledWith({ x: page.graphics._size.width, y: page.graphics._size.height });
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(270);
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeFalsy();

        expect((setup.stream as any).reference).toBe(setup.nestedRef);
    });

    it('PdfButtonField._createAppearance should cover grouping path with CA text, widget font and stringFormat creation', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._isLoaded = false;
        field._text = 'fallback';
        field._font = new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);
        field._stringFormat = new PdfStringFormat(PdfTextAlignment.center, PdfVerticalAlignment.middle);
        field._defaultFont = new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 0, y: 0, width: 100, height: 20 }, page);
        widget._enableGrouping = true;
        widget._mkDictionary.update('CA', 'GroupedCaption');

        Object.defineProperty(widget, 'font', {
            value: new PdfStandardFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular),
            configurable: true
        });

        Object.defineProperty(widget, 'textAlignment', {
            value: PdfTextAlignment.center,
            configurable: true
        });

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(100, 20);
        });

        const drawButtonSpy: jasmine.Spy = spyOn(field as any, '_drawButton').and.stub();

        field._createAppearance(widget, false);

        expect(drawButtonSpy).toHaveBeenCalled();
        const drawArgs: any[] = drawButtonSpy.calls.mostRecent().args;
        expect(drawArgs[2]).toBe('GroupedCaption');
        expect(drawArgs[3]).toBe((widget as any).font);
        expect(drawArgs[4] instanceof PdfStringFormat).toBeTruthy();
    });

    it('PdfButtonField._createAppearance should cover grouping path fallback text = empty string when CA is missing', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._isLoaded = false;
        field._text = 'fallback';
        field._font = new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);
        field._stringFormat = new PdfStringFormat(PdfTextAlignment.center, PdfVerticalAlignment.middle);
        field._defaultFont = new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 0, y: 0, width: 100, height: 20 }, page);
        widget._enableGrouping = true;

        Object.defineProperty(widget, 'font', {
            value: new PdfStandardFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular),
            configurable: true
        });

        Object.defineProperty(widget, 'textAlignment', {
            value: PdfTextAlignment.center,
            configurable: true
        });

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(100, 20);
        });

        const drawButtonSpy: jasmine.Spy = spyOn(field as any, '_drawButton').and.stub();

        field._createAppearance(widget, false);

        expect(drawButtonSpy).toHaveBeenCalled();
        const drawArgs: any[] = drawButtonSpy.calls.mostRecent().args;
        expect(drawArgs[2]).toBe('');
    });

    it('PdfButtonField._createAppearance should cover loaded defaultAppearance branch with fontName undefined and fontSize undefined, then currentFont = this._defaultFont', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._isLoaded = true;
        field._text = 'Button text';
        field._font = undefined as any;
        field._defaultFont = new PdfStandardFont(PdfFontFamily.helvetica, 9, PdfFontStyle.regular);
        field._stringFormat = undefined as any;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 0, y: 0, width: 90, height: 22 }, page);
        widget._enableGrouping = false;

        Object.defineProperty(widget, '_defaultAppearance', {
            value: {
                fontName: undefined,
                fontSize: undefined
            },
            configurable: true
        });

        spyOn(utils as any, '_mapFont').and.returnValue(undefined);
        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(90, 22);
        });

        const drawButtonSpy: jasmine.Spy = spyOn(field as any, '_drawButton').and.stub();

        field._createAppearance(widget, false);

        expect((utils as any)._mapFont).toHaveBeenCalledWith('Helvetica', (field._defaultFont as any)._size, PdfFontStyle.regular, widget);
        expect(drawButtonSpy).toHaveBeenCalled();

        const drawArgs: any[] = drawButtonSpy.calls.mostRecent().args;
        expect(drawArgs[3]).toBe(field._defaultFont);
    });

    it('PdfButtonField._createAppearance should cover fontSize zero auto-size path, currentFont = mapped font, measureString, while loop growth and this._font assignment', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0);
        const field: PdfButtonField = Object.create(PdfButtonField.prototype) as PdfButtonField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._isLoaded = true;
        field._text = 'A';
        field._font = undefined as any;
        field._defaultFont = new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);
        field._stringFormat = undefined as any;

        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 0, y: 0, width: 120, height: 40 }, page);
        widget._enableGrouping = false;

        Object.defineProperty(widget, '_defaultAppearance', {
            value: {
                fontName: undefined,
                fontSize: 0
            },
            configurable: true
        });

        const mappedFont: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);
        spyOn(utils as any, '_mapFont').and.returnValue(mappedFont);

        const measureSpy: jasmine.Spy = spyOn(PdfStandardFont.prototype as any, 'measureString').and.callFake(function (_text: string): any {
            const size: number = (this as any)._size;
            return { width: size * 6, height: size };
        });

        spyOn(pdfTemplateModule as any, 'PdfTemplate').and.callFake(function (): any {
            return createTemplateLike(120, 40);
        });

        const drawButtonSpy: jasmine.Spy = spyOn(field as any, '_drawButton').and.stub();

        field._createAppearance(widget, false);

        expect((utils as any)._mapFont).toHaveBeenCalled();
        expect(measureSpy).toHaveBeenCalled();
        expect(field._font instanceof PdfStandardFont).toBeTruthy();
        expect((field._font as any)._size).toBeGreaterThanOrEqual(8);
        expect(drawButtonSpy).toHaveBeenCalled();

        const drawArgs: any[] = drawButtonSpy.calls.mostRecent().args;
        expect(drawArgs[3] instanceof PdfStandardFont).toBeTruthy();
    });

    it('PdfCheckBoxField.itemAt should cover fetch dictionary, PdfStateItem._load, _isLoaded, _ref and parsedItems.set', () => {
        const xref: any = createCrossReference();
        const field: PdfCheckBoxField = Object.create(PdfCheckBoxField.prototype) as PdfCheckBoxField;
        const ref: _PdfReference = createReference(5001);
        const dictionary: _PdfDictionary = new _PdfDictionary(xref);
        const loadedItem: PdfStateItem = Object.create(PdfStateItem.prototype) as PdfStateItem;

        field._crossReference = xref;
        field._parsedItems = new Map<number, PdfStateItem>();
        field._kids = [ref];
        field._defaultIndex = 0;

        spyOn(xref, '_fetch').and.returnValue(dictionary);
        spyOn(PdfStateItem as any, '_load').and.returnValue(loadedItem);

        const result: PdfStateItem = field.itemAt(0);

        expect(xref._fetch).toHaveBeenCalledWith(ref);
        expect((PdfStateItem as any)._load).toHaveBeenCalledWith(dictionary, xref, field);
        expect(result).toBe(loadedItem);
        expect((result as any)._isLoaded).toBeTruthy();
        expect((result as any)._ref).toBe(ref);
        expect(field._parsedItems.get(0)).toBe(loadedItem);
    });

    it('PdfCheckBoxField.font getter should cover cached _font return branch', () => {
        const field: PdfCheckBoxField = Object.create(PdfCheckBoxField.prototype) as PdfCheckBoxField;
        const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);

        field._font = font;

        expect(field.font).toBe(font);
    });

    it('PdfCheckBoxField.font getter should cover itemAt + _obtainFontDetails branch', () => {
        const field: PdfCheckBoxField = Object.create(PdfCheckBoxField.prototype) as PdfCheckBoxField;
        const widget: PdfWidgetAnnotation = Object.create(PdfWidgetAnnotation.prototype) as PdfWidgetAnnotation;
        const resolvedFont: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 11, PdfFontStyle.regular);

        field._font = undefined as any;
        field._defaultIndex = 0;
        field._form = {} as any;

        spyOn(field, 'itemAt').and.returnValue(widget as any);
        spyOn(utils as any, '_obtainFontDetails').and.returnValue(resolvedFont);

        expect(field.font).toBe(resolvedFont);
        expect(field.itemAt).toHaveBeenCalledWith(0);
        expect((utils as any)._obtainFontDetails).toHaveBeenCalledWith(field._form, widget, field);
    });
});

describe('Field coverage – highlighted code from all 3 screenshots', () => {

    function createReference(id: number): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        (reference as any).objectNumber = id;
        (reference as any).generationNumber = 0;
        (reference as any).toString = (): string => `${id} 0 R`;
        return reference;
    }

    function createCrossReference(): any {
        let refId: number = 1;
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _document: undefined,
            _getNextReference(): _PdfReference {
                return createReference(refId++);
            },
            _fetch(ref: _PdfReference): _PdfDictionary {
                return this._cacheMap.get(ref);
            }
        };
        return crossReference;
    }

    function createGraphics(pageRotation: PdfRotationAngle = PdfRotationAngle.angle0): PdfGraphics {
        const state: PdfGraphicsState = {} as PdfGraphicsState;
        const graphics: PdfGraphics = {
            _page: { rotation: pageRotation } as any,
            _size: { width: 400, height: 300 },
            _isTemplateGraphics: false,
            _sw: {
                _setTextRenderingMode: jasmine.createSpy('_setTextRenderingMode'),
                _beginMarkupSequence: jasmine.createSpy('_beginMarkupSequence'),
                _endMarkupSequence: jasmine.createSpy('_endMarkupSequence')
            },
            save: jasmine.createSpy('save').and.returnValue(state),
            restore: jasmine.createSpy('restore'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            drawString: jasmine.createSpy('drawString'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            drawLine: jasmine.createSpy('drawLine'),
            drawEllipse: jasmine.createSpy('drawEllipse'),
            drawArc: jasmine.createSpy('drawArc'),
            drawPath: jasmine.createSpy('drawPath'),
            initializeCoordinates: jasmine.createSpy('initializeCoordinates'),
            _initializeCoordinates: jasmine.createSpy('_initializeCoordinates')
        } as unknown as PdfGraphics;
        return graphics;
    }

    function createPage(rotation: PdfRotationAngle = PdfRotationAngle.angle0, xref?: any): any {
        return {
            rotation,
            graphics: createGraphics(rotation),
            _crossReference: xref,
            _ref: createReference(9000 + rotation)
        };
    }

    function createWidget(
        xref: any,
        bounds: { x: number; y: number; width: number; height: number },
        page: any
    ): PdfWidgetAnnotation {
        const widget: PdfWidgetAnnotation = Object.create(PdfWidgetAnnotation.prototype) as PdfWidgetAnnotation;
        const dictionary: _PdfDictionary = new _PdfDictionary(xref);
        const mk: _PdfDictionary = new _PdfDictionary(xref);

        dictionary.update('MK', mk);

        Object.defineProperty(widget, '_dictionary', {
            value: dictionary,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_mkDictionary', {
            value: mk,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_ref', {
            value: createReference(2000 + bounds.width + bounds.height),
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_page', {
            value: page,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_getPage', {
            value: (): any => page,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, 'bounds', {
            value: bounds,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, 'rotate', {
            get: (): number => 0,
            configurable: true
        });

        Object.defineProperty(widget, 'color', {
            get: (): { r: number; g: number; b: number } => ({ r: 0, g: 0, b: 0 }),
            configurable: true
        });

        Object.defineProperty(widget, 'backColor', {
            get: (): { r: number; g: number; b: number } => ({ r: 255, g: 255, b: 255 }),
            configurable: true
        });

        Object.defineProperty(widget, 'borderColor', {
            get: (): { r: number; g: number; b: number } => ({ r: 0, g: 0, b: 0 }),
            configurable: true
        });

        Object.defineProperty(widget, 'border', {
            get: (): any => {
                return { width: 1, style: PdfBorderStyle.solid };
            },
            configurable: true
        });

        Object.defineProperty(widget, 'textAlignment', {
            value: PdfTextAlignment.left,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_enableGrouping', {
            value: false,
            writable: true,
            configurable: true
        });

        Object.defineProperty(widget, '_setAppearance', {
            value: false,
            writable: true,
            configurable: true
        });

        return widget;
    }

    it('PdfField.page should cover dictionary P + document page loop branch', () => {
        const xref: any = createCrossReference();
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const page0: any = createPage(PdfRotationAngle.angle0, xref);
        const page1: any = createPage(PdfRotationAngle.angle90, xref);
        const targetRef: _PdfReference = page1._ref;
        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 10, y: 10, width: 40, height: 20 }, page0);

        widget._dictionary.update('P', targetRef);
        spyOn(widget._dictionary, 'getRaw').and.callFake((key: string): any => {
            if (key === 'P') {
                return targetRef;
            }
            return undefined;
        });

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._defaultIndex = 0;
        field._page = undefined as any;

        spyOn(field, 'itemAt').and.returnValue(widget);

        xref._document = {
            pageCount: 2,
            getPage: (index: number): any => index === 0 ? page0 : page1
        };

        const result: any = field.page;

        expect(result).toBe(page1);
        expect(field._page).toBe(page1);
    });

    it('PdfField.page should cover _kids loop with _findPage and break when page is found', () => {
        const xref: any = createCrossReference();
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const foundPage: any = createPage(PdfRotationAngle.angle180, xref);
        const kid0: _PdfReference = createReference(7001);
        const kid1: _PdfReference = createReference(7002);

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._defaultIndex = 0;
        field._page = undefined as any;
        field._kids = [kid0, kid1];
        field._ref = undefined as any;

        spyOn(field, 'itemAt').and.returnValue(undefined as any);

        xref._document = {
            pageCount: 0,
            getPage: (_index: number): any => undefined
        };

        const findPageSpy: jasmine.Spy = spyOn(utils as any, '_findPage').and.callFake((_doc: any, ref: _PdfReference): any => {
            if (ref === kid0) {
                return undefined;
            }
            if (ref === kid1) {
                return foundPage;
            }
            return undefined;
        });

        const result: any = field.page;

        expect(findPageSpy.calls.count()).toBe(2);
        expect(findPageSpy.calls.argsFor(0)[1]).toBe(kid0);
        expect(findPageSpy.calls.argsFor(1)[1]).toBe(kid1);
        expect(result).toBe(foundPage);
        expect(field._page).toBe(foundPage);
    });

    it('PdfTextBoxField._initialize should cover all highlighted initialization lines', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0, xref);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const createdRef: _PdfReference = createReference(8001);

        spyOn(xref, '_getNextReference').and.returnValue(createdRef);
        const createItemSpy: jasmine.Spy = spyOn(field as any, '_createItem').and.stub();
        const initializeFontSpy: jasmine.Spy = spyOn(field as any, '_initializeFont').and.stub();

        field._defaultFont = new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular);

        field._initialize(page, 'FieldName', { x: 1, y: 2, width: 3, height: 4 });

        expect(field._crossReference).toBe(xref);
        expect(field._page).toBe(page);
        expect(field._name).toBe('FieldName');
        expect(field._text).toBe('');
        expect(field._defaultValue).toBe('');
        expect(field._defaultIndex).toBe(0);
        expect(field._spellCheck).toBeFalsy();
        expect(field._insertSpaces).toBeFalsy();
        expect(field._multiline).toBeFalsy();
        expect(field._password).toBeFalsy();
        expect(field._scrollable).toBeFalsy();
        expect(field._dictionary instanceof _PdfDictionary).toBeTruthy();
        expect(field._ref).toBe(createdRef);
        expect(xref._cacheMap.get(createdRef)).toBe(field._dictionary);
        expect(field._dictionary.objId).toBe(createdRef.toString());
        expect((field._dictionary.get('FT') as _PdfName).name).toBe('Tx');
        expect(field._dictionary.get('T')).toBe('FieldName');
        expect(createItemSpy).toHaveBeenCalledWith({ x: 1, y: 2, width: 3, height: 4 });
        expect(initializeFontSpy).toHaveBeenCalledWith(field._defaultFont);
    });

    it('PdfTextBoxField._createItem should cover widget create, textAlignment, stringFormat, MK/BC/BG/CA and _addToKid', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0, xref);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

        field._crossReference = xref;
        field._page = page;
        field._actualName = 'ActualCaption';

        const addToKidSpy: jasmine.Spy = spyOn(field as any, '_addToKid').and.stub();

        const createSpy: jasmine.Spy = spyOn(PdfWidgetAnnotation.prototype as any, '_create').and.callFake(function (_pageArg: any, _boundsArg: any, _fieldArg: any): void {
            const dict: _PdfDictionary = new _PdfDictionary(xref);
            const mk: _PdfDictionary = new _PdfDictionary(xref);

            dict.update('MK', mk);

            Object.defineProperty(this, '_dictionary', {
                value: dict,
                writable: true,
                configurable: true
            });

            Object.defineProperty(this, '_mkDictionary', {
                value: mk,
                writable: true,
                configurable: true
            });
        });

        field._createItem({ x: 10, y: 20, width: 100, height: 25 });

        expect(createSpy).toHaveBeenCalled();
        expect(field._stringFormat instanceof PdfStringFormat).toBeTruthy();
        expect(field._stringFormat.alignment).toBe(PdfTextAlignment.left);
        expect(field._stringFormat.lineAlignment).toBe(PdfVerticalAlignment.middle);

        const widgetArg: any = addToKidSpy.calls.mostRecent().args[0];
        expect(widgetArg._dictionary.has('MK')).toBeTruthy();
        expect(widgetArg._mkDictionary.getArray('BC')).toEqual([0, 0, 0]);
        expect(widgetArg._mkDictionary.getArray('BG')).toEqual([1, 1, 1]);
        expect(widgetArg._mkDictionary.get('CA')).toBe('ActualCaption');
    });

    it('PdfTextBoxField._doPostProcess should cover loaded count > 0 loop branch', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0, xref);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const widget0: PdfWidgetAnnotation = createWidget(xref, { x: 10, y: 10, width: 50, height: 20 }, page);
        const widget1: PdfWidgetAnnotation = createWidget(xref, { x: 20, y: 20, width: 60, height: 20 }, page);

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._setAppearance = false;
        field._isLoaded = true;
        field._kids = [widget0._ref, widget1._ref];

        spyOn(field, 'itemAt').and.callFake((index: number): any => {
            return index === 0 ? widget0 : widget1;
        });

        const postSpy: jasmine.Spy = spyOn(field as any, '_postProcess').and.stub();

        field._doPostProcess(false);

        expect(postSpy.calls.count()).toBe(2);
        expect(postSpy.calls.argsFor(0)).toEqual([false, widget0]);
        expect(postSpy.calls.argsFor(1)).toEqual([false, widget1]);
    });

    it('PdfTextBoxField._doPostProcess should cover loaded count = 0 explicit else branch and _postProcess(isFlatten)', () => {
        const xref: any = createCrossReference();
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._setAppearance = false;
        field._isLoaded = true;
        field._kids = [];

        const checkFlagSpy: jasmine.Spy = spyOn(field as any, '_checkFieldFlag').and.returnValue(false);
        const postSpy: jasmine.Spy = spyOn(field as any, '_postProcess').and.stub();

        field._doPostProcess(true);

        expect(checkFlagSpy).toHaveBeenCalledWith(field._dictionary);
        expect(postSpy).toHaveBeenCalledWith(true);
    });

    it('PdfTextBoxField._doPostProcess should cover non-loaded loop, createAppearance, isFlatten true, drawTemplate and updated assignment', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0, xref);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 11, y: 22, width: 77, height: 33 }, page);
        const template: any = { _size: { width: 44, height: 18 } };

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._setAppearance = false;
        field._isLoaded = false;
        field._kids = [widget._ref];

        spyOn(field, 'itemAt').and.returnValue(widget);
        spyOn(field as any, '_checkFieldFlag').and.returnValue(false);
        spyOn(field as any, '_createAppearance').and.returnValue(template);
        const drawTemplateSpy: jasmine.Spy = spyOn(field as any, '_drawTemplate').and.stub();
        const addAppearanceSpy: jasmine.Spy = spyOn(field as any, '_addAppearance').and.stub();

        field._doPostProcess(true);

        expect((field as any)._createAppearance).toHaveBeenCalledWith(true, widget);
        expect(drawTemplateSpy).toHaveBeenCalledWith(template, widget._page, {
            x: widget.bounds.x,
            y: widget.bounds.y,
            width: template._size.width,
            height: template._size.height
        });
        expect(addAppearanceSpy).not.toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeFalsy();
    });

    it('PdfTextBoxField._doPostProcess should cover non-loaded loop, addAppearance branch and updated assignment', () => {
        const xref: any = createCrossReference();
        const page: any = createPage(PdfRotationAngle.angle0, xref);
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
        const widget: PdfWidgetAnnotation = createWidget(xref, { x: 3, y: 4, width: 55, height: 21 }, page);
        const template: any = { _size: { width: 41, height: 19 } };

        field._crossReference = xref;
        field._dictionary = new _PdfDictionary(xref);
        field._form = { _setAppearance: true } as any;
        field._setAppearance = false;
        field._isLoaded = false;
        field._kids = [widget._ref];

        spyOn(field, 'itemAt').and.returnValue(widget);
        spyOn(field as any, '_checkFieldFlag').and.returnValue(false);
        spyOn(field as any, '_createAppearance').and.returnValue(template);
        const drawTemplateSpy: jasmine.Spy = spyOn(field as any, '_drawTemplate').and.stub();
        const addAppearanceSpy: jasmine.Spy = spyOn(field as any, '_addAppearance').and.stub();

        field._doPostProcess(false);

        expect((field as any)._createAppearance).toHaveBeenCalledWith(false, widget);
        expect(addAppearanceSpy).toHaveBeenCalledWith(widget._dictionary, template, 'N');
        expect(drawTemplateSpy).not.toHaveBeenCalled();
        expect(widget._dictionary._updated).toBeTruthy();
    });

    it('PdfTextBoxField._tryParseAcrobatFormFormat should cover string, regex match and result assignment', () => {
        const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

        const result: string = field._tryParseAcrobatFormFormat('  AFDate_FormatEx("dd/MM/yyyy")  ');

        expect(result).toBe('dd/MM/yyyy');
    });


});

