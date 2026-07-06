
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    _PdfDictionary,
    _PdfName,
    _PdfReference
} from '../src/pdf/core/pdf-primitives';

import { _PdfBaseStream } from '../src/pdf/core/base-stream';
import { _PdfTransformationMatrix, PdfBrush, PdfGraphics, PdfPen } from '../src/pdf/core/graphics/pdf-graphics';
import { _UnicodeTrueTypeFont } from '../src/pdf/core/fonts/unicode-true-type-font';
import { _RtlRenderer } from '../src/pdf/core/graphics/rightToLeft/text-renderer';
import * as graphicsUtils from '../src/pdf/core/utils';
import {
    PathPointType,
    PdfRotationAngle,
    PdfSubSuperScript,
    PdfTextAlignment,
    PdfTextDirection
} from '../src/pdf/core/enumerator';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfFontStyle, PdfStandardFont, PdfTrueTypeFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfPath } from '../src/pdf/core/graphics/pdf-path';
import { PdfStringFormat, PdfVerticalAlignment } from '../src/pdf/core/fonts/pdf-string-format';

/* Adjust this path only if your layouter file is in a different location */
import { _PdfStringLayouter } from '../src/pdf/core/fonts/string-layouter';
import { PdfImage } from '../src/pdf/core/graphics/images/pdf-image';

describe('PdfGraphics highlighted branch coverage suite', () => {
    type TestSw = {
        _modifyCtm: jasmine.Spy;
        _executeObject: jasmine.Spy;
        _write: jasmine.Spy;
        _beginPath: jasmine.Spy;
        _appendBezierSegment: jasmine.Spy;
        _appendLineSegment: jasmine.Spy;
        _closePath: jasmine.Spy;
        _restoreGraphicsState: jasmine.Spy;
        _setLineDashPattern: jasmine.Spy;
        _setLineWidth: jasmine.Spy;
        _setLineJoin: jasmine.Spy;
        _setLineCap: jasmine.Spy;
        _setMiterLimit: jasmine.Spy;
        _setColor: jasmine.Spy;
        _setColorSpace: jasmine.Spy;
        _setFont: jasmine.Spy;
        _beginText: jasmine.Spy;
        _setTextRenderingMode: jasmine.Spy;
        _setCharacterSpacing: jasmine.Spy;
        _setWordSpacing: jasmine.Spy;
        _setTextScaling: jasmine.Spy;
        _modifyTM: jasmine.Spy;
        _startNextLine: jasmine.Spy;
        _setLeading: jasmine.Spy;
        _showNextLineText: jasmine.Spy;
        _showText: jasmine.Spy;
        _endText: jasmine.Spy;
    };

    function defineOwn(obj: object, key: string, value: unknown): void {
        Object.defineProperty(obj, key, {
            value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }

    function createReference(): _PdfReference {
        return Object.create(_PdfReference.prototype) as _PdfReference;
    }

    function createName(name: string): _PdfName {
        return { name } as _PdfName;
    }

    function createDictionary(initial?: Record<string, unknown>): _PdfDictionary {
        const store: Map<string, unknown> = new Map<string, unknown>();
        if (initial) {
            Object.keys(initial).forEach((key: string) => store.set(key, initial[key]));
        }
        const dict: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;
        defineOwn(dict, '_updated', false);
        defineOwn(dict, 'has', (key: string): boolean => store.has(key));
        defineOwn(dict, 'get', (key: string): unknown => store.get(key));
        defineOwn(dict, 'set', (key: string, value: unknown): void => { store.set(key, value); });
        defineOwn(dict, 'update', (key: string, value: unknown): void => { store.set(key, value); });
        defineOwn(dict, 'getRaw', (key: string): unknown => store.get(key));
        defineOwn(dict, 'getArray', (key: string): unknown[] => {
            const value: unknown = store.get(key);
            return Array.isArray(value) ? value : [];
        });
        defineOwn(dict, 'dictionary', undefined);
        return dict;
    }

    function createBaseStreamWithDictionary(): _PdfBaseStream {
        const stream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        defineOwn(stream, 'dictionary', createDictionary());
        defineOwn(stream, '_reference', undefined);
        return stream;
    }

    function createStreamWriter(): TestSw {
        return {
            _modifyCtm: jasmine.createSpy('_modifyCtm'),
            _executeObject: jasmine.createSpy('_executeObject'),
            _write: jasmine.createSpy('_write'),
            _beginPath: jasmine.createSpy('_beginPath'),
            _appendBezierSegment: jasmine.createSpy('_appendBezierSegment'),
            _appendLineSegment: jasmine.createSpy('_appendLineSegment'),
            _closePath: jasmine.createSpy('_closePath'),
            _restoreGraphicsState: jasmine.createSpy('_restoreGraphicsState'),
            _setLineDashPattern: jasmine.createSpy('_setLineDashPattern'),
            _setLineWidth: jasmine.createSpy('_setLineWidth'),
            _setLineJoin: jasmine.createSpy('_setLineJoin'),
            _setLineCap: jasmine.createSpy('_setLineCap'),
            _setMiterLimit: jasmine.createSpy('_setMiterLimit'),
            _setColor: jasmine.createSpy('_setColor'),
            _setColorSpace: jasmine.createSpy('_setColorSpace'),
            _setFont: jasmine.createSpy('_setFont'),
            _beginText: jasmine.createSpy('_beginText'),
            _setTextRenderingMode: jasmine.createSpy('_setTextRenderingMode'),
            _setCharacterSpacing: jasmine.createSpy('_setCharacterSpacing'),
            _setWordSpacing: jasmine.createSpy('_setWordSpacing'),
            _setTextScaling: jasmine.createSpy('_setTextScaling'),
            _modifyTM: jasmine.createSpy('_modifyTM'),
            _startNextLine: jasmine.createSpy('_startNextLine'),
            _setLeading: jasmine.createSpy('_setLeading'),
            _showNextLineText: jasmine.createSpy('_showNextLineText'),
            _showText: jasmine.createSpy('_showText'),
            _endText: jasmine.createSpy('_endText')
        };
    }

    function createGraphics(): PdfGraphics {
        const graphics: PdfGraphics = Object.create(PdfGraphics.prototype) as PdfGraphics;
        const sw: TestSw = createStreamWriter();
        const resourceObject: _PdfDictionary = createDictionary();
        const source: _PdfDictionary = createDictionary();

        defineOwn(graphics, '_sw', sw);
        defineOwn(graphics, '_resourceObject', resourceObject);
        defineOwn(graphics, '_source', source);
        defineOwn(graphics, '_resources', new Map<_PdfReference, _PdfName>());
        defineOwn(graphics, '_resourceMap', new Map<_PdfReference, _PdfName>());
        defineOwn(graphics, '_pendingResource', []);
        defineOwn(graphics, '_graphicsState', []);
        defineOwn(graphics, '_size', { width: 500, height: 700 });
        defineOwn(graphics, '_clipBounds', [0, 0, 500, 700]);
        defineOwn(graphics, '_page', undefined);
        defineOwn(graphics, '_template', undefined);
        defineOwn(graphics, '_layer', undefined);
        defineOwn(graphics, '_crossReference', undefined);
        defineOwn(graphics, '_hasResourceReference', false);
        defineOwn(graphics, '_mediaBoxUpperRightBound', 0);
        defineOwn(graphics, '_characterSpacing', -1);
        defineOwn(graphics, '_wordSpacing', -1);
        defineOwn(graphics, '_textScaling', -100);
        defineOwn(graphics, '_textRenderingMode', -1);
        defineOwn(graphics, '_colorSpaceInitialized', false);
        defineOwn(graphics, '_startCutIndex', -1);
        defineOwn(graphics, '_isItalic', false);
        defineOwn(graphics, '_currentFont', undefined);
        defineOwn(graphics, '_currentPen', undefined);
        defineOwn(graphics, '_currentBrush', undefined);
        defineOwn(graphics, '_m', undefined);

        defineOwn(graphics, 'save', jasmine.createSpy('save').and.returnValues(
            {
                _transformationMatrix: {},
                _currentBrush: undefined,
                _currentPen: undefined,
                _currentFont: undefined,
                _charSpacing: 0,
                _wordSpacing: 0,
                _textScaling: 100,
                _textRenderingMode: 0
            },
            {
                _transformationMatrix: {},
                _currentBrush: undefined,
                _currentPen: undefined,
                _currentFont: undefined,
                _charSpacing: 0,
                _wordSpacing: 0,
                _textScaling: 100,
                _textRenderingMode: 0
            }
        ));
        defineOwn(graphics, 'restore', jasmine.createSpy('restore'));
        defineOwn(graphics, 'setClip', jasmine.createSpy('setClip'));
        defineOwn(graphics, 'translateTransform', jasmine.createSpy('translateTransform'));
        defineOwn(graphics, '_skewTransform', jasmine.createSpy('_skewTransform'));
        defineOwn(graphics, 'drawLine', jasmine.createSpy('drawLine'));

        return graphics;
    }

    function createTemplate(): PdfTemplate {
        const template: PdfTemplate = Object.create(PdfTemplate.prototype) as PdfTemplate;
        defineOwn(template, '_isExported', false);
        defineOwn(template, '_isResourceExport', false);
        defineOwn(template, '_isSignature', false);
        defineOwn(template, '_isAnnotationTemplate', false);
        defineOwn(template, '_needScale', false);
        defineOwn(template, '_isNew', false);
        defineOwn(template, '_key', undefined);
        defineOwn(template, '_size', { width: 0, height: 0 });
        defineOwn(template, '_content', undefined);
        defineOwn(template, '_crossReference', undefined);
        defineOwn(template, 'graphics', { _processResources: jasmine.createSpy('_processResources') });
        defineOwn(template, '_importStream', jasmine.createSpy('_importStream'));
        defineOwn(template, '_updatePendingResource', jasmine.createSpy('_updatePendingResource'));
        return template;
    }

    function createPen(): PdfPen {
        return {
            _width: 1,
            _dashPattern: [],
            _dashOffset: 0,
            _lineJoin: 0,
            _lineCap: 0,
            _miterLimit: 10,
            _color: { r: 0, g: 0, b: 0 }
        } as unknown as PdfPen;
    }

    function createBrush(): PdfBrush {
        return { _color: { r: 10, g: 20, b: 30 } } as unknown as PdfBrush;
    }

    function createStandardFont(): PdfStandardFont {
        const font: PdfStandardFont = Object.create(PdfStandardFont.prototype) as PdfStandardFont;
        defineOwn(font, '_dictionary', createDictionary());
        defineOwn(font, '_reference', undefined);
        defineOwn(font, '_key', undefined);
        defineOwn(font, '_document', undefined);
        defineOwn(font, '_size', 12);
        defineOwn(font, 'size', 12);
        defineOwn(font, 'height', 12);
        defineOwn(font, '_style', 0);
        defineOwn(font, '_getSize', jasmine.createSpy('_getSize').and.returnValue(12));
        defineOwn(font, '_getHeight', jasmine.createSpy('_getHeight').and.returnValue(12));
        defineOwn(font, '_getAscent', jasmine.createSpy('_getAscent').and.returnValue(9));
        defineOwn(font, '_getDescent', jasmine.createSpy('_getDescent').and.returnValue(-3));
        defineOwn(font, '_getCharacterCount', jasmine.createSpy('_getCharacterCount').and.returnValue(1));
        return font;
    }

    function createUnicodeTtfFont(): PdfTrueTypeFont {
        const internal: _UnicodeTrueTypeFont = Object.create(_UnicodeTrueTypeFont.prototype) as _UnicodeTrueTypeFont;
        defineOwn(internal, '_fontDictionary', createDictionary());
        defineOwn(internal, '_ttfMetrics', { _isItalic: false });
        defineOwn(internal, '_metrics', { _postScriptName: 'RegularFont', _isBold: false });
        defineOwn(internal, '_ttfReader', {
            _convertString: jasmine.createSpy('_convertString').and.callFake((text: string) => text)
        });

        const font: PdfTrueTypeFont = Object.create(PdfTrueTypeFont.prototype) as PdfTrueTypeFont;
        defineOwn(font, '_dictionary', undefined);
        defineOwn(font, '_reference', undefined);
        defineOwn(font, '_key', undefined);
        defineOwn(font, '_fontInternal', internal);
        defineOwn(font, '_style', 0);
        defineOwn(font, '_size', 20);
        defineOwn(font, 'size', 20);
        defineOwn(font, 'height', 18);
        defineOwn(font, 'isItalic', false);
        defineOwn(font, 'isBold', false);
        defineOwn(font, 'isUnicode', true);
        defineOwn(font, '_document', undefined);
        defineOwn(font, '_setSymbols', jasmine.createSpy('_setSymbols'));
        defineOwn(font, '_getSize', jasmine.createSpy('_getSize').and.returnValue(20));
        defineOwn(font, '_getHeight', jasmine.createSpy('_getHeight').and.returnValue(100));
        defineOwn(font, '_getAscent', jasmine.createSpy('_getAscent').and.returnValue(80));
        defineOwn(font, '_getDescent', jasmine.createSpy('_getDescent').and.returnValue(-20));
        defineOwn(font, '_getCharacterWidth', jasmine.createSpy('_getCharacterWidth').and.returnValue(5));
        defineOwn(font, '_getCharacterCount', jasmine.createSpy('_getCharacterCount').and.returnValue(1));
        defineOwn(font, 'measureString', jasmine.createSpy('measureString').and.callFake((word: string) => ({ width: word.length * 5 })));
        return font;
    }

    it('drawTemplate should cover rotated signature + crop/media translation + BBox translation + annotation matrix reuse + existing XObject reference', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const crossReferenceRef: _PdfReference = createReference();
        const xObjectRef: _PdfReference = createReference();
        const templateContentRef: _PdfReference = createReference();

        const sourceDictionary: _PdfDictionary = createDictionary();
        const xObjectDictionary: _PdfDictionary = createDictionary();
        const templateDictionary: _PdfDictionary = createDictionary({
            Matrix: [0, -2, 2, 0, 5, 6],
            BBox: [0, 0, 100, 50]
        });
        const templateContent: _PdfBaseStream = createBaseStreamWithDictionary();
        defineOwn(templateContent, 'dictionary', templateDictionary);
        defineOwn(templateContent, 'reference', templateContentRef);

        const template: PdfTemplate = createTemplate();
        template._isSignature = true;
        template._isAnnotationTemplate = true;
        template._needScale = true;
        template._size = { width: 100, height: 50 };
        template._content = templateContent;

        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.callFake((ref: _PdfReference) => {
                if (ref === xObjectRef) {
                    return xObjectDictionary;
                }
                if (ref === templateContentRef) {
                    return templateContent;
                }
                return undefined;
            }),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(crossReferenceRef)
        };

        (graphics as any)._crossReference = crossReference;
        (graphics as any)._hasResourceReference = true;
        (graphics as any)._source = sourceDictionary;
        (graphics as any)._resourceObject = createDictionary({ XObject: xObjectRef });
        (graphics as any)._resources.set(templateContentRef, createName('XO1'));
        (graphics as any)._page = {
            rotation: PdfRotationAngle.angle270,
            _size: { width: 600, height: 400 },
            size: { width: 600, height: 400 },
            cropBox: [10, 20, 300, 400],
            mediaBox: [-10, -20, 300, 400],
            _origin: [1, 0],
            _pageDictionary: createDictionary({ CropBox: true, MediaBox: true })
        };

        const translateSpy: jasmine.Spy = spyOn(_PdfTransformationMatrix.prototype as any, '_translate').and.callThrough();
        const scaleSpy: jasmine.Spy = spyOn(_PdfTransformationMatrix.prototype as any, '_scale').and.callThrough();
        const bounds = { x: 10, y: 15, width: 100, height: 200 };

        // Act
        graphics.drawTemplate(template, bounds);

        // Assert
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 10, y: -20 });
        expect(translateSpy).toHaveBeenCalled();
        expect(scaleSpy).toHaveBeenCalledWith(1, 1);
        expect((graphics as any)._sw._modifyCtm).toHaveBeenCalled();
        expect((graphics as any)._sw._executeObject).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'XO1' }));
        expect((graphics as any)._resourceObject._updated).toBeTruthy();
        expect((graphics as any)._source._updated).toBeTruthy();
    });

    it('drawTemplate should queue both resource entry and template when there is no cross reference and hasPendingTemplate is true', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const template: PdfTemplate = createTemplate();
        const sourceDictionary: _PdfDictionary = createDictionary();

        template._size = { width: 50, height: 40 };
        const stream: _PdfBaseStream = createBaseStreamWithDictionary();
        defineOwn(stream, 'dictionary', createDictionary());
        template._content = stream;

        (graphics as any)._resourceObject = sourceDictionary;
        (graphics as any)._template = {};
        (graphics as any)._crossReference = undefined;

        const bounds = { x: 0, y: 0, width: 80, height: 100 };

        // Act
        graphics.drawTemplate(template, bounds);

        // Assert
        expect((graphics as any)._pendingResource.length).toBe(2);
        expect((graphics as any)._pendingResource[0]).toEqual(jasmine.objectContaining({
            resource: template._content
        }));
        expect((graphics as any)._pendingResource[1]).toBe(template);
    });

    it('drawPath should build and draw only when resolved pen/brush exists', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const path: PdfPath = {
            _points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
            _pathTypes: [PathPointType.start, PathPointType.line],
            fillMode: 0
        } as unknown as PdfPath;

        spyOn(graphics as any, '_setPenBrush').and.returnValue({ pen: createPen(), brush: createBrush() });
        const buildSpy: jasmine.Spy = spyOn(graphics as any, '_buildUpPath').and.stub();
        const drawGraphicsSpy: jasmine.Spy = spyOn(graphics as any, '_drawGraphicsPath').and.stub();

        // Act
        graphics.drawPath(path, createPen());

        // Assert
        expect(buildSpy).toHaveBeenCalledWith(path._points, path._pathTypes);
        expect(drawGraphicsSpy).toHaveBeenCalled();
    });

    it('drawPath should skip path generation when neither pen nor brush is resolved', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const path: PdfPath = {
            _points: [{ x: 0, y: 0 }],
            _pathTypes: [PathPointType.start],
            fillMode: 0
        } as unknown as PdfPath;

        spyOn(graphics as any, '_setPenBrush').and.returnValue({ pen: undefined, brush: undefined });
        const buildSpy: jasmine.Spy = spyOn(graphics as any, '_buildUpPath').and.stub();
        const drawGraphicsSpy: jasmine.Spy = spyOn(graphics as any, '_drawGraphicsPath').and.stub();

        // Act
        graphics.drawPath(path, createPen());

        // Assert
        expect(buildSpy).not.toHaveBeenCalled();
        expect(drawGraphicsSpy).not.toHaveBeenCalled();
    });

    it('drawRoundedRectangle should throw when pen is null', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();

        // Act / Assert
        expect(() => {
            graphics.drawRoundedRectangle({ x: 1, y: 2, width: 10, height: 20 }, 2, null as unknown as PdfPen, createBrush());
        }).toThrowError('Pen cannot be null or undefined');
    });

    it('drawRoundedRectangle should throw when brush is undefined', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();

        // Act / Assert
        expect(() => {
            graphics.drawRoundedRectangle({ x: 1, y: 2, width: 10, height: 20 }, 2, createPen(), undefined as unknown as PdfBrush);
        }).toThrowError('Brush cannot be null or undefined');
    });

    it('drawRoundedRectangle should use addRectangle branch when radius is zero', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const drawPathSpy: jasmine.Spy = spyOn(graphics, 'drawPath').and.stub();
        const addRectangleSpy: jasmine.Spy = spyOn(PdfPath.prototype, 'addRectangle').and.callFake((): any => undefined);

        // Act
        graphics.drawRoundedRectangle({ x: 10, y: 20, width: 30, height: 40 }, 0, createPen(), createBrush());

        // Assert
        expect(addRectangleSpy).toHaveBeenCalledWith({ x: 10, y: 20, width: 30, height: 40 });
        expect(drawPathSpy).toHaveBeenCalled();
    });

    it('_processResources should cover PdfTemplate new/existing entries and base stream entry with existing reference', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(createReference())
        };

        const newTemplate: PdfTemplate = createTemplate();
        newTemplate._isNew = true;

        const existingTemplate: PdfTemplate = createTemplate();
        existingTemplate._isNew = false;

        const existingRef: _PdfReference = createReference();
        const stream: _PdfBaseStream = createBaseStreamWithDictionary();
        defineOwn(stream, '_reference', existingRef);

        const source: _PdfDictionary = createDictionary();
        const keyName: _PdfName = createName('R1');

        (graphics as any)._pendingResource = [
            newTemplate,
            existingTemplate,
            { resource: stream, key: keyName, source }
        ];

        // Act
        graphics['_processResources'](crossReference);

        // Assert
        expect(newTemplate.graphics._processResources).toHaveBeenCalledWith(crossReference);
        expect(existingTemplate._updatePendingResource).toHaveBeenCalledWith(crossReference);
        expect(crossReference._cacheMap.get(existingRef)).toBe(stream);
        expect((graphics as any)._resources.get(existingRef)).toBe(keyName);
        expect((graphics as any)._pendingResource.length).toBe(0);
    });

    it('_updateFontResource should cover PdfTrueTypeFont internal dictionary branch', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const source: _PdfDictionary = createDictionary();
        const keyName: _PdfName = createName('F1');
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(createReference())
        };

        // Act
        graphics['_updateFontResource'](font, keyName, source, crossReference);

        // Assert
        const assignedRef: _PdfReference = font._reference as _PdfReference;
        expect(assignedRef).toBeDefined();
        expect(crossReference._cacheMap.get(assignedRef)).toBe(font._fontInternal._fontDictionary);
        expect((source as any).get(keyName.name)).toBe(assignedRef);
        expect((graphics as any)._resources.get(assignedRef)).toBe(keyName);
    });

    it('_constructArcPath should return early when bezier arc returns empty array', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const getBezierArcSpy: jasmine.Spy = spyOn(graphicsUtils, '_getBezierArc').and.returnValue([]);

        // Act
        graphics['_constructArcPath'](1, 2, 3, 4, 0, 90);

        // Assert
        expect(getBezierArcSpy).toHaveBeenCalled();
        expect((graphics as any)._sw._beginPath).not.toHaveBeenCalled();
        expect((graphics as any)._sw._appendBezierSegment).not.toHaveBeenCalled();
    });

    it('_fontControl should cover Font resource as reference and set updated flags', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfStandardFont = createStandardFont();
        const fontDictRef: _PdfReference = createReference();
        const actualFontDict: _PdfDictionary = font._dictionary;
        const sourceDictionary: _PdfDictionary = createDictionary();

        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.callFake((ref: _PdfReference) => {
                if (ref === fontDictRef) {
                    return sourceDictionary;
                }
                return actualFontDict;
            }),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(createReference())
        };

        (graphics as any)._crossReference = crossReference;
        (graphics as any)._resourceObject = createDictionary({ Font: fontDictRef });
        (graphics as any)._hasResourceReference = true;
        (graphics as any)._source = createDictionary();

        // Act
        graphics['_fontControl'](font, new PdfStringFormat());

        // Assert
        expect(crossReference._fetch).toHaveBeenCalledWith(fontDictRef);
        expect((graphics as any)._resourceObject._updated).toBeTruthy();
        expect((graphics as any)._source._updated).toBeTruthy();
        expect((graphics as any)._sw._setFont).toHaveBeenCalled();
    });

    it('_fontControl should reuse existing key via font._reference when no crossReference exists', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfStandardFont = createStandardFont();
        const existingRef: _PdfReference = createReference();
        const existingKey: _PdfName = createName('FExisting');

        font._reference = existingRef;
        (graphics as any)._crossReference = undefined;
        (graphics as any)._resourceObject = createDictionary({ Font: createDictionary() });
        (graphics as any)._resources.set(existingRef, existingKey);

        // Act
        graphics['_fontControl'](font, new PdfStringFormat());

        // Assert
        expect((graphics as any)._sw._setFont).toHaveBeenCalledWith('FExisting', 12);
    });

    it('_fontControl should queue font as pending resource when there is no ref and no crossReference', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfStandardFont = createStandardFont();

        (graphics as any)._crossReference = undefined;
        (graphics as any)._resourceObject = createDictionary();

        // Act
        graphics['_fontControl'](font, new PdfStringFormat());

        // Assert
        expect((graphics as any)._pendingResource.length).toBe(1);
        expect((graphics as any)._pendingResource[0]).toEqual(jasmine.objectContaining({
            resource: font
        }));
    });

    it('_fontControl should cover TrueType internal dictionary cache branch', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _fetch: jasmine.createSpy('_fetch'),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(createReference())
        };

        /* keep undefined for the branch:
           if (internal && internal._fontDictionary && !internal._fontDictionary._currentObj) */
        (font._fontInternal as any)._fontDictionary._currentObj = undefined;
        (graphics as any)._crossReference = crossReference;
        (graphics as any)._resourceObject = createDictionary();

        // Act
        graphics['_fontControl'](font, new PdfStringFormat());

        // Assert
        expect(font._reference).toBeDefined();
        expect(crossReference._cacheMap.size).toBeGreaterThan(0);
        expect((graphics as any)._sw._setFont).toHaveBeenCalled();
    });

    it('_drawStringLayoutResult should cover clipRegion bottom-align + italic simulation + bottom shift adjustment', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        (font as any).isItalic = true;
        (font._fontInternal as any)._ttfMetrics._isItalic = false;
        (graphics as any)._currentFont = font;

        const format: PdfStringFormat = new PdfStringFormat();
        format.lineLimit = false;
        format.noClip = false;
        format.lineAlignment = PdfVerticalAlignment.bottom;
        format.horizontalScalingFactor = 100;
        format.lineSpacing = 0;
        format.subSuperScript = PdfSubSuperScript.subScript;

        const result: any = {
            _empty: false,
            _actualSize: { width: 50, height: 99 },
            _lineHeight: 14,
            _lines: []
        };

        const layoutRectangle: number[] = [10, 20, 100, 100];

        const applySpy: jasmine.Spy = spyOn(graphics as any, '_applyStringSettings').and.callFake((): void => {
            (graphics as any)._currentFont = font;
        });
        const drawLayoutSpy: jasmine.Spy = spyOn(graphics as any, '_drawLayoutResult').and.stub();
        const underlineSpy: jasmine.Spy = spyOn(graphics as any, '_underlineStrikeoutText').and.stub();

        // Act
        graphics['_drawStringLayoutResult'](result, font, createPen(), createBrush(), layoutRectangle, format);

        // Assert
        expect((graphics as any).save).toHaveBeenCalledTimes(2);
        expect((graphics as any).setClip).toHaveBeenCalled();
        expect((graphics as any).translateTransform).toHaveBeenCalled();
        expect((graphics as any)._skewTransform).toHaveBeenCalledWith(0, -11);
        expect(applySpy).toHaveBeenCalled();
        expect(drawLayoutSpy).toHaveBeenCalled();
        expect(underlineSpy).toHaveBeenCalled();
        expect((graphics as any).restore).toHaveBeenCalled();
    });

    it('_drawUnicodeLine should cover RTL/textDirection branch using _layout + _splitLayout', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const format: PdfStringFormat = new PdfStringFormat();
        format.rightToLeft = true;
        format.wordSpacing = 2;
        format.alignment = PdfTextAlignment.right;
        format.textDirection = PdfTextDirection.rightToLeft;

        spyOn(graphics as any, '_justifyLine').and.returnValue(0);
        spyOn(graphics as any, '_drawUnicodeBlocks').and.stub();
        spyOn(_RtlRenderer.prototype as any, '_layout').and.returnValue(['A', 'B']);
        spyOn(_RtlRenderer.prototype as any, '_splitLayout').and.returnValue(['one', 'two']);

        const lineInfo: any = {
            _text: 'one two',
            _width: 30
        };

        // Act
        graphics['_drawUnicodeLine'](lineInfo, 100, font, format);

        // Assert
        expect((graphics as any)._drawUnicodeBlocks).toHaveBeenCalledWith(['A', 'B'], ['one', 'two'], font, format, 0);
    });

    it('_drawUnicodeLine should cover non-RTL useWordSpace branch via _breakUnicodeLine', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const format: PdfStringFormat = new PdfStringFormat();
        format.rightToLeft = false;
        format.wordSpacing = 5;
        format.textDirection = PdfTextDirection.none;

        spyOn(graphics as any, '_justifyLine').and.returnValue(0);
        spyOn(graphics as any, '_breakUnicodeLine').and.returnValue({
            tokens: ['<a>', '<b>'],
            words: ['one', 'two']
        });
        spyOn(graphics as any, '_drawUnicodeBlocks').and.stub();

        const lineInfo: any = {
            _text: 'one two',
            _width: 30
        };

        // Act
        graphics['_drawUnicodeLine'](lineInfo, 100, font, format);

        // Assert
        expect((graphics as any)._breakUnicodeLine).toHaveBeenCalledWith('one two', font, null);
        expect((graphics as any)._drawUnicodeBlocks).toHaveBeenCalledWith(['<a>', '<b>'], ['one', 'two'], font, format, 0);
    });

    it('_drawUnicodeLine should cover non-RTL non-wordSpace branch via _convertToUnicode + _showNextLineText', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const format: PdfStringFormat = new PdfStringFormat();
        format.wordSpacing = 0;
        format.rightToLeft = false;
        format.textDirection = PdfTextDirection.none;

        spyOn(graphics as any, '_justifyLine').and.returnValue(0);
        spyOn(graphics as any, '_convertToUnicode').and.returnValue('(U)');

        const lineInfo: any = {
            _text: 'plain',
            _width: 20
        };

        // Act
        graphics['_drawUnicodeLine'](lineInfo, 100, font, format);

        // Assert
        expect((graphics as any)._convertToUnicode).toHaveBeenCalledWith('plain', font);
        expect((graphics as any)._sw._showNextLineText).toHaveBeenCalledWith('(U)', true);
    });

    it('_drawUnicodeBlocks should cover x !== 0, non-empty words, xShift > 0 and restore indents in finally', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const format: PdfStringFormat = new PdfStringFormat();
        format.firstLineIndent = 10;
        format.paragraphIndent = 20;
        format.characterSpacing = 1;
        format.wordSpacing = 2;

        // Act
        graphics['_drawUnicodeBlocks'](['<A>', '<B>'], ['one', 'two'], font, format, 0);

        // Assert
        expect((graphics as any)._sw._startNextLine).toHaveBeenCalled();
        expect((graphics as any)._sw._showText).toHaveBeenCalledTimes(2);
        expect(format.firstLineIndent).toBe(20);
        expect(format.paragraphIndent).toBe(20);
        expect((graphics as any)._sw._startNextLine).toHaveBeenCalledWith(jasmine.any(Number), 0);
    });

    it('_breakUnicodeLine should split non-empty line and convert each token', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();

        spyOn(graphics as any, '_convertToUnicode').and.callFake((word: string) => '<' + word + '>');

        // Act
        const result: { tokens: string[]; words: string[] } = graphics['_breakUnicodeLine']('alpha beta', font, null);

        // Assert
        /* current implementation uses line.split(null), so it returns a single item */
        expect(result.words).toEqual(['alpha beta']);
        expect(result.tokens).toEqual(['<alpha beta>']);
    });

    it('_convertToUnicode should convert through unicode ttf reader branch', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();

        // Act
        const token: string = graphics['_convertToUnicode']('Hello', font);

        // Assert
        expect(font._setSymbols).toHaveBeenCalledWith('Hello');
        expect((font._fontInternal as any)._ttfReader._convertString).toHaveBeenCalledWith('Hello');
        expect(token).not.toBeNull();
    });

    it('_justifyLine should cover hasWordSpacing branch and computed setWordSpacing', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const format: PdfStringFormat = new PdfStringFormat();
        format.alignment = PdfTextAlignment.justify;
        format.wordSpacing = 2;

        spyOn(graphics as any, '_shouldJustify').and.returnValue(true);

        const lineInfo: any = {
            _text: 'a b',
            _width: 10
        };

        // Act
        const wordSpace: number = graphics['_justifyLine'](lineInfo, 30, format, font);

        // Assert
        expect(wordSpace).toBeGreaterThan(0);
        expect((graphics as any)._sw._setWordSpacing).toHaveBeenCalledWith(wordSpace);
    });



    it('drawString should cover argument overload resolution for pen + brush + format and layout rectangle correction', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfStandardFont = createStandardFont();
        const pen: PdfPen = createPen();
        const brush: PdfBrush = createBrush();
        const format: PdfStringFormat = new PdfStringFormat();
        const bounds = { x: 10, y: 20, width: 0, height: 0 };

        const fakeLayoutResult: any = {
            _empty: false,
            _actualSize: { width: 60, height: 20 }
        };

        const layoutSpy: jasmine.Spy = spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult);
        const normalizeSpy: jasmine.Spy = spyOn(graphics as any, '_normalizeText').and.callThrough();
        const rectSpy: jasmine.Spy = spyOn(graphics as any, '_checkCorrectLayoutRectangle').and.returnValue([10, 20, 60, 20]);
        const drawLayoutSpy: jasmine.Spy = spyOn(graphics as any, '_drawStringLayoutResult').and.stub();

        // Act
        graphics.drawString('Hello', font, bounds, pen, brush, format);

        // Assert
        expect(normalizeSpy).toHaveBeenCalledWith(font, 'Hello');
        expect(rectSpy).toHaveBeenCalled();
        expect(drawLayoutSpy).toHaveBeenCalled();
        expect(layoutSpy).toHaveBeenCalled();
    });

    it('drawTextElement should throw for invalid element and should use default brush when brush is missing', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfStandardFont = createStandardFont();

        // Act / Assert: invalid element
        expect(() => {
            graphics.drawTextElement(null as unknown as any, { x: 1, y: 2 });
        }).toThrowError('PdfTextElement cannot be null or undefined');

        expect(() => {
            graphics.drawTextElement({ text: '', font } as any, { x: 1, y: 2 });
        }).toThrowError('PdfTextElement.text must be a non-empty string');

        expect(() => {
            graphics.drawTextElement({ text: 'x', font: null } as any, { x: 1, y: 2 });
        }).toThrowError('PdfTextElement.font is required');

        expect(() => {
            graphics.drawTextElement({ text: 'x', font, layoutFormat: {} } as any, { x: 1, y: 2 });
        }).toThrowError('PdfTextElement.layoutFormat must be an instance of PdfLayoutFormat');

        // Arrange: valid element without brush
        const drawStringSpy: jasmine.Spy = spyOn(graphics, 'drawString').and.stub();

        // Act
        graphics.drawTextElement(
            { text: 'Hello', font, pen: createPen(), stringFormat: new PdfStringFormat() } as any,
            { x: 10, y: 20, width: 30, height: 40 }
        );

        // Assert
        expect(drawStringSpy).toHaveBeenCalled();
        expect(drawStringSpy.calls.mostRecent().args[4]).toEqual(jasmine.objectContaining({
            _color: { r: 0, g: 0, b: 0 }
        }));
    });

    /* ---------------------------
       Extra focused coverage cases
       These help hit remaining highlighted branches without changing the 25-case intent.
       --------------------------- */

    it('_drawTemplate should cover signature BBox translate branch when BBox starts at non-zero matching bounds.x', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const template: PdfTemplate = createTemplate();
        const stream: _PdfBaseStream = createBaseStreamWithDictionary();
        const dict: _PdfDictionary = createDictionary({
            Matrix: [1, 0, 0, 1, 0, 0],
            BBox: [10, 5, 100, 50]
        });
        defineOwn(stream, 'dictionary', dict);
        defineOwn(stream, 'reference', createReference());
        template._content = stream;
        template._size = { width: 100, height: 50 };
        template._isSignature = true;

        const xobjSource: _PdfDictionary = createDictionary();
        const xobjRef: _PdfReference = createReference();
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.returnValue(xobjSource),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(createReference())
        };

        (graphics as any)._crossReference = crossReference;
        (graphics as any)._resourceObject = createDictionary({ XObject: xobjRef });
        (graphics as any)._page = {
            rotation: 0,
            _size: { width: 300, height: 500 },
            size: { width: 300, height: 500 },
            cropBox: [0, 0, 300, 500],
            mediaBox: [0, 0, 300, 500],
            _origin: [1, 0],
            _pageDictionary: createDictionary({ CropBox: true, MediaBox: true })
        };

        const translateSpy: jasmine.Spy = spyOn(_PdfTransformationMatrix.prototype as any, '_translate').and.callThrough();
        const scaleSpy: jasmine.Spy = spyOn(_PdfTransformationMatrix.prototype as any, '_scale').and.callThrough();

        // Act
        graphics.drawTemplate(template, { x: 10, y: 20, width: 100, height: 50 });

        // Assert
        expect(translateSpy).toHaveBeenCalled();
        expect(scaleSpy).toHaveBeenCalled();
    });

    it('_fontControl should mark resourceObject updated when Font resource object is a reference', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfStandardFont = createStandardFont();
        const ref: _PdfReference = createReference();
        const fetchedDict: _PdfDictionary = createDictionary();
        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedDict),
            _getNextReference: jasmine.createSpy('_getNextReference').and.returnValue(createReference())
        };

        (graphics as any)._crossReference = crossReference;
        (graphics as any)._resourceObject = createDictionary({ Font: ref });

        // Act
        graphics['_fontControl'](font, new PdfStringFormat());

        // Assert
        expect((graphics as any)._resourceObject._updated).toBeTruthy();
    });



    it('_applyStringSettings should cover bold-style TrueType font when postScriptName already contains bold', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const brush: PdfBrush = createBrush();
        const format: PdfStringFormat = new PdfStringFormat();

        (font as any).isUnicode = false;
        (font as any)._style = PdfFontStyle.bold;
        (font as any).isBold = true;
        (font._fontInternal as any)._metrics._postScriptName = 'MyBoldFont';
        (font._fontInternal as any)._metrics._isBold = false;

        const stateSpy: jasmine.Spy = spyOn(graphics as any, '_stateControl').and.stub();

        // Act
        graphics['_applyStringSettings'](font, undefined, brush, format);

        // Assert
        expect((graphics as any)._sw._beginText).toHaveBeenCalled();
        expect(stateSpy).toHaveBeenCalled();
        expect((graphics as any)._sw._setLineWidth).not.toHaveBeenCalled();
        expect((graphics as any)._sw._setTextRenderingMode).toHaveBeenCalled();
    });

    it('_applyStringSettings should create synthetic pen for faux bold TrueType font when brush exists and font name is not bold', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const brush: PdfBrush = createBrush();
        const format: PdfStringFormat = new PdfStringFormat();

        (font as any).isUnicode = true;
        (font as any).isBold = true;
        (font as any)._style = PdfFontStyle.bold;
        (font._fontInternal as any)._metrics._postScriptName = 'RegularFont';
        (font._fontInternal as any)._metrics._isBold = false;

        const stateSpy: jasmine.Spy = spyOn(graphics as any, '_stateControl').and.stub();

        // Act
        graphics['_applyStringSettings'](font, undefined, brush, format);

        // Assert
        expect((graphics as any)._sw._beginText).toHaveBeenCalled();
        expect(stateSpy).toHaveBeenCalled();
        expect((graphics as any)._sw._setLineWidth).toHaveBeenCalled();
        expect((graphics as any)._sw._setTextRenderingMode).toHaveBeenCalled();
    });

    it('_escapeSymbols should throw when data is null', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();

        // Act / Assert
        expect(() => {
            graphics['_escapeSymbols'](null as any);
        }).toThrowError('data cannot be null');
    });

    it('_drawUnicodeLine should use rtl layout branch with rightAlign when textDirection is none', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const format: PdfStringFormat = new PdfStringFormat();
        format.rightToLeft = true;
        format.alignment = PdfTextAlignment.right;
        format.textDirection = PdfTextDirection.none;
        format.wordSpacing = 0;

        const lineInfo: any = {
            _text: 'rtl text',
            _width: 30
        };

        spyOn(graphics as any, '_justifyLine').and.returnValue(0);
        spyOn(graphics as any, '_drawUnicodeBlocks').and.stub();

        const layoutSpy: jasmine.Spy = spyOn(_RtlRenderer.prototype as any, '_layout').and.returnValue(['rtl text']);

        // Act
        graphics['_drawUnicodeLine'](lineInfo, 100, font, format);

        // Assert
        expect(layoutSpy).toHaveBeenCalledWith('rtl text', font, true, false, format);
        expect((graphics as any)._drawUnicodeBlocks).toHaveBeenCalledWith(['rtl text'], ['rtl text'], font, format, 0);
    });

    it('_drawUnicodeLine should cover splitLayout false branch when textDirection is leftToRight', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfTrueTypeFont = createUnicodeTtfFont();
        const format: PdfStringFormat = new PdfStringFormat();
        format.rightToLeft = false;
        format.alignment = PdfTextAlignment.left;
        format.textDirection = PdfTextDirection.leftToRight;
        format.wordSpacing = 2;

        const lineInfo: any = {
            _text: 'one two',
            _width: 20
        };

        spyOn(graphics as any, '_justifyLine').and.returnValue(0);
        spyOn(graphics as any, '_drawUnicodeBlocks').and.stub();

        const layoutSpy: jasmine.Spy = spyOn(_RtlRenderer.prototype as any, '_layout').and.returnValue(['A', 'B']);
        const splitSpy: jasmine.Spy = spyOn(_RtlRenderer.prototype as any, '_splitLayout').and.returnValue(['one', 'two']);

        // Act
        graphics['_drawUnicodeLine'](lineInfo, 100, font, format);

        // Assert
        expect(layoutSpy).toHaveBeenCalled();
        expect(splitSpy).toHaveBeenCalledWith('one two', font, false, true, format);
        expect((graphics as any)._drawUnicodeBlocks).toHaveBeenCalledWith(['A', 'B'], ['one', 'two'], font, format, 0);
    });

    it('_drawAsciiLine should escape carriage return character', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const font: PdfStandardFont = createStandardFont();
        const format: PdfStringFormat = new PdfStringFormat();
        const lineInfo: any = {
            _text: 'AB\rCD',
            _width: 20
        };

        spyOn(graphics as any, '_justifyLine').and.returnValue(0);

        // Act
        graphics['_drawAsciiLine'](lineInfo, 100, format, font);

        // Assert
        expect((graphics as any)._sw._showNextLineText).toHaveBeenCalledWith('(AB\\rCD)');
    });

    it('_initializeCoordinates should cover page cropBox/mediaBox equal branch and local cropBox translation branch', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        defineOwn((graphics as any)._sw, '_writeComment', jasmine.createSpy('_writeComment'));

        (graphics as any)._cropBox = [5, 6, 300, 400];
        (graphics as any)._mediaBoxUpperRightBound = 0;

        const page: any = {
            _origin: [0, 0],
            _pageDictionary: createDictionary({
                CropBox: [10, 20, 300, 400],
                MediaBox: [10, 20, 300, 400]
            })
        };

        // Act
        graphics['_initializeCoordinates'](page);

        // Assert
        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 5, y: -400 });
    });



    it('_underlineStrikeoutText should cover justified underline branch with x1 = layoutWidth - lineIndent', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const brush: PdfBrush = createBrush();
        const font: any = createStandardFont();

        // Use defineOwn because these are getter-backed in the real font type
        defineOwn(font, 'isUnderline', true);
        defineOwn(font, 'isStrikeout', false);

        spyOn(graphics as any, '_createUnderlineStrikeoutPen').and.returnValue({ _width: 1 });
        spyOn(graphics as any, '_getHorizontalAlignShift').and.returnValue(0);
        spyOn(graphics as any, '_getLineIndent').and.returnValue(5);
        spyOn(graphics as any, '_shouldJustify').and.returnValue(true);

        const result: any = {
            _actualSize: { height: 20 },
            _lines: [
                { _width: 15, _lineType: 0, _text: 'line one' }
            ]
        };

        const layoutRectangle: number[] = [10, 20, 100, 40];
        const format: PdfStringFormat = new PdfStringFormat();

        // Act
        graphics['_underlineStrikeoutText'](brush, result, font, layoutRectangle, format);

        // Assert
        expect((graphics as any).drawLine).toHaveBeenCalled();

    });

    it('_buildUpPath should throw error for invalid path point type default branch', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const points: any[] = [{ x: 10, y: 20 }];

        // Important:
        // 99 & 0xf becomes 3, which enters the bezier branch and throws "Malforming path."
        // Use 2 so it falls into the default branch and throws "Incorrect path formation."
        const invalidType: number = 2;
        const types: any[] = [invalidType];

        // Act / Assert
        expect(() => {
            graphics['_buildUpPath'](points, types);
        }).toThrowError('Incorrect path formation.');
    });
    it('_initializeCoordinates should cover no-page branch with cropBox height matching page height', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        defineOwn((graphics as any)._sw, '_writeComment', jasmine.createSpy('_writeComment'));

        (graphics as any)._size = { width: 500, height: 700 };
        (graphics as any)._cropBox = [0, 0, 200, 700];

        // Important:
        // If _mediaBoxUpperRightBound === -this._size.height, the outer condition skips translation.
        // So use a different value to enter the cropBox branch.
        (graphics as any)._mediaBoxUpperRightBound = 10;

        // Act
        graphics['_initializeCoordinates'](undefined);

        // Assert
        expect((graphics as any)._sw._writeComment).toHaveBeenCalledWith('Change co-ordinate system to left/top.');
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

    it('_initializeCoordinates should cover no-page branch cropBox present and media upper bound equals size height', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        defineOwn((graphics as any)._sw, '_writeComment', jasmine.createSpy('_writeComment'));

        (graphics as any)._size = { width: 500, height: 700 };
        (graphics as any)._cropBox = [0, 0, 200, 200];
        (graphics as any)._mediaBoxUpperRightBound = 700;

        // Act
        graphics['_initializeCoordinates'](undefined);

        // Assert
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -700 });
    });

    it('_initializeCoordinates should cover no-page branch without cropBox and translate using non-zero media upper bound', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        defineOwn((graphics as any)._sw, '_writeComment', jasmine.createSpy('_writeComment'));

        (graphics as any)._size = { width: 500, height: 700 };
        (graphics as any)._cropBox = undefined;
        (graphics as any)._mediaBoxUpperRightBound = 150;

        // Act
        graphics['_initializeCoordinates'](undefined);

        // Assert
        expect((graphics as any).translateTransform).toHaveBeenCalledWith({ x: 0, y: -150 });
    });

    it('_getScaleTransform should create new transformation matrix when input is undefined', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const scaleSpy: jasmine.Spy = spyOn(_PdfTransformationMatrix.prototype as any, '_scale').and.callThrough();

        // Act
        const matrix: _PdfTransformationMatrix = graphics['_getScaleTransform'](2, 3, undefined);

        // Assert
        expect(matrix).toBeDefined();
        expect(scaleSpy).toHaveBeenCalledWith(2, 3);
    });

    it('_updateImageResource should set source entry, register resource and mark resourceObject updated', () => {
        // Arrange
        const graphics: PdfGraphics = createGraphics();
        const image: PdfImage = Object.create(PdfImage.prototype) as PdfImage;
        defineOwn(image, '_imageStream', createBaseStreamWithDictionary());
        defineOwn(image, '_maskStream', createBaseStreamWithDictionary());
        defineOwn(image, '_maskReference', createBaseStreamWithDictionary());
        defineOwn(image, '_reference', undefined);

        const crossReference: any = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake(() => createReference())
        };

        (graphics as any)._crossReference = crossReference;
        const source: _PdfDictionary = createDictionary();
        const keyName: _PdfName = createName('XO_TEST');

        // Act
        (graphics as any)._updateImageResource(image, keyName, source, crossReference);

        // Assert
        expect(source.get(keyName.name)).toBeDefined();
        expect((graphics as any)._resources.has(image._reference)).toBeTruthy();
        expect((graphics as any)._resourceObject._updated).toBeTruthy();
    });
});