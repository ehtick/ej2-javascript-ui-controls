import * as utils from '../src/pdf/core/utils';
import * as fontModule from '../src/pdf/core/fonts/pdf-standard-font';
import * as annotationModule from '../src/pdf/core/annotations/annotation';

import { _PdfBaseStream, _PdfStream } from '../src/pdf/core/base-stream';
import {
    PdfAnnotationFlag,
    PdfRotationAngle,
    _PdfCheckFieldState,
    PdfNumberStyle,
    PdfBorderStyle,
    _PdfAnnotationType
} from '../src/pdf/core/enumerator';
import {
    PdfAnnotation,
    PdfLineAnnotation,
    PdfRedactionAnnotation,
    PdfRubberStampAnnotation,
    PdfWidgetAnnotation
} from '../src/pdf/core/annotations/annotation';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfFontFamily, PdfFontStyle, PdfStandardFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfTextBoxField, PdfComboBoxField, PdfField } from '../src/pdf/core/form/field';
import { PdfForm } from '../src/pdf/core/form/form';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';

describe('utils.ts highlighted branches from uploaded images - safe full coverage', function () {

    function createFakeFontFileStream(bytes?: number[]): any {
        var stream: any = Object.create(_PdfBaseStream.prototype);
        var buffer: Uint8Array = new Uint8Array(bytes ? bytes : [1, 2, 3, 4]);

        defineValue(stream, 'length', buffer.length);
        defineValue(stream, 'start', 0);
        defineValue(stream, 'end', buffer.length);
        defineValue(stream, 'buffer', buffer);

        defineValue(stream, 'getByteRange', function (_start: number, _end: number): Uint8Array {
            return buffer;
        });

        defineValue(stream, 'getBytes', function (_length: number): Uint8Array {
            return buffer;
        });

        return stream;
    }

    function createAppearanceFieldWithReferencedFont(fontKey: string, fontReference: _PdfReference, fieldDictionarySeed?: { [key: string]: any }): any {
        var resourcesFont: _PdfDictionary = createDictionary();
        resourcesFont.set(fontKey, fontReference);

        var resources: _PdfDictionary = createDictionary({
            Font: resourcesFont
        });

        var normalStreamDictionary: _PdfDictionary = createDictionary({
            Resources: resources
        });

        var normalStream: any = Object.create(_PdfStream.prototype);
        defineValue(normalStream, 'dictionary', normalStreamDictionary);

        var ap: _PdfDictionary = createDictionary({
            N: normalStream
        });

        var seed: { [key: string]: any } = fieldDictionarySeed ? fieldDictionarySeed : {};
        seed.AP = ap;

        var fieldDictionary: _PdfDictionary = createDictionary(seed);

        var field: any = createComboBoxField({
            _dictionary: fieldDictionary
        });

        return field;
    }
    ``

    function createDictionary(seed?: { [key: string]: any }): _PdfDictionary {
        var dict: _PdfDictionary = new _PdfDictionary();
        if (seed) {
            Object.keys(seed).forEach(function (key: string): void {
                dict.set(key, seed[key]);
            });
        }
        return dict;
    }

    function defineValue(obj: any, prop: string, value: any): void {
        Object.defineProperty(obj, prop, {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }

    function createFakeStreamWithResources(fontKey: string): any {
        var fontRef: _PdfReference = new _PdfReference(10, 0);
        var fontDict: _PdfDictionary = createDictionary();
        fontDict.set(fontKey, fontRef);

        var resources: _PdfDictionary = createDictionary({
            Font: fontDict
        });

        var streamDictionary: _PdfDictionary = createDictionary({
            Resources: resources
        });

        var stream: any = Object.create(_PdfStream.prototype);
        defineValue(stream, 'dictionary', streamDictionary);
        return stream;
    }

    function createWidgetLikeField(baseDictionary?: _PdfDictionary): any {
        var field: any = Object.create(PdfField.prototype);
        defineValue(field, '_dictionary', baseDictionary || createDictionary());
        return field;
    }

    function createTextBoxField(overrides?: { [key: string]: any }): any {
        var field: any = Object.create(PdfTextBoxField.prototype);

        defineValue(field, '_dictionary', createDictionary());
        defineValue(field, 'bounds', { x: 0, y: 0, width: 80, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'text', 'A');
        defineValue(field, 'multiLine', false);
        defineValue(field, '_isTextChanged', false);
        defineValue(field, '_getStringFormat', jasmine.createSpy('_getStringFormat').and.returnValue(undefined));

        if (overrides) {
            Object.keys(overrides).forEach(function (key: string): void {
                defineValue(field, key, overrides[key]);
            });
        }

        return field;
    }

    function createComboBoxField(overrides?: { [key: string]: any }): any {
        var field: any = Object.create(PdfComboBoxField.prototype);

        defineValue(field, '_dictionary', createDictionary());
        defineValue(field, 'bounds', { x: 0, y: 0, width: 80, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'rotationAngle', 0);
        defineValue(field, 'selectedIndex', 0);
        defineValue(field, 'itemAt', jasmine.createSpy('itemAt').and.callFake(function (index: number): any {
            return { text: 'Item-' + index };
        }));
        defineValue(field, '_obtainSelectedValue', jasmine.createSpy('_obtainSelectedValue').and.returnValue('Item-0'));
        defineValue(field, '_getStringFormat', jasmine.createSpy('_getStringFormat').and.returnValue(undefined));

        if (overrides) {
            Object.keys(overrides).forEach(function (key: string): void {
                defineValue(field, key, overrides[key]);
            });
        }

        return field;
    }

    function createFormWithDrFont(alias: string, fontDictionary: _PdfDictionary): any {
        var fonts: _PdfDictionary = createDictionary();
        fonts.set(alias, fontDictionary);

        var dr: _PdfDictionary = createDictionary({
            Font: fonts
        });

        return {
            _dictionary: createDictionary({
                DR: dr
            }),
            _fontCache: new Map<string, any>(),
            _fontResources: fonts,
            _crossReference: {
                _fetch: jasmine.createSpy('_fetch').and.callFake(function (): any {
                    return createDictionary();
                })
            }
        };
    }

    function createFakeStandardFont(size: number, baseFontName: string): any {
        var font: any = Object.create(PdfStandardFont.prototype);
        defineValue(font, 'size', size);
        defineValue(font, '_size', size);
        defineValue(font, 'height', size);
        defineValue(font, '_metrics', { _widthTable: { fake: true } });
        defineValue(font, '_dictionary', createDictionary({
            BaseFont: _PdfName.get(baseFontName)
        }));
        return font;
    }

    function createFakeTrueTypeCacheFont(size: number): any {
        var font: any = Object.create((fontModule as any).PdfTrueTypeFont.prototype);
        defineValue(font, 'size', size);
        defineValue(font, '_size', size);
        defineValue(font, 'height', size);
        defineValue(font, '_isUnicode', false);
        defineValue(font, '_dictionary', createDictionary({
            BaseFont: _PdfName.get('CachedTT')
        }));
        return font;
    }

    beforeEach(function (): void {
        // Deterministic synchronous font math to avoid timeout or long shrink loops.
        spyOn(PdfStandardFont.prototype as any, 'measureString').and.callFake(function (this: any, text: any): any {
            var rawText: string = '';
            if (Array.isArray(text)) {
                rawText = String(text.length > 0 && text[0] !== undefined && text[0] !== null ? text[0] : '');
            } else {
                rawText = String(text !== undefined && text !== null ? text : '');
            }

            var size: number = typeof this._size === 'number'
                ? this._size
                : (typeof this.size === 'number' ? this.size : 12);

            return {
                width: Math.max(1, rawText.length) * size * 1.6,
                height: Math.max(1, size * 1.15)
            };
        });

        spyOn(PdfStandardFont.prototype as any, 'getLineWidth').and.callFake(function (this: any, text: any): number {
            var rawText: string = String(text !== undefined && text !== null ? text : '');
            var size: number = typeof this._size === 'number'
                ? this._size
                : (typeof this.size === 'number' ? this.size : 12);
            return Math.max(1, rawText.length) * size * 1.35;
        });
    });

    describe('_mapFont standard and CJK switch cases', function () {
        function createAnnotationForMapFont(): any {
            var annotation: any = Object.create(annotationModule.PdfAnnotation.prototype);
            defineValue(annotation, '_dictionary', createDictionary({
                DA: '/F1 10 Tf'
            }));
            defineValue(annotation, '_crossReference', {});
            defineValue(annotation, '_type', _PdfAnnotationType.freeTextAnnotation);
            defineValue(annotation, '_circleCaptionFont', new PdfStandardFont(PdfFontFamily.helvetica, 4, PdfFontStyle.regular));
            return annotation;
        }

        it('covers Courier, Symbol, TimesRoman and ZapfDingbats standard-font cases', function () {
            var annotation: any = createAnnotationForMapFont();

            var courierFont: any = utils._mapFont('Cour', 10, PdfFontStyle.regular, annotation);
            var symbolFont: any = utils._mapFont('Symb', 10, PdfFontStyle.regular, annotation);
            var timesFont: any = utils._mapFont('Times', 10, PdfFontStyle.regular, annotation);
            var zapfFont: any = utils._mapFont('ZaDb', 10, PdfFontStyle.regular, annotation);

            expect(courierFont).toBeDefined();
            expect(symbolFont).toBeDefined();
            expect(timesFont).toBeDefined();
            expect(zapfFont).toBeDefined();
        });

        it('covers MonotypeHeiMedium, HanyangSystemsGothicMedium, HanyangSystemsShinMyeongJoMedium, HeiseiKakuGothicW5 and HeiseiMinchoW3 CJK cases', function () {
            var annotation: any = createAnnotationForMapFont();

            var heiFont: any = utils._mapFont('MonotypeHeiMedium', 10, PdfFontStyle.regular, annotation);
            var gothicFont: any = utils._mapFont('HanyangSystemsGothicMedium', 10, PdfFontStyle.regular, annotation);
            var myeongjoFont: any = utils._mapFont('HanyangSystemsShinMyeongJoMedium', 10, PdfFontStyle.regular, annotation);
            var heiseiKakuFont: any = utils._mapFont('HeiseiKakuGothicW5', 10, PdfFontStyle.regular, annotation);
            var heiseiMinFont: any = utils._mapFont('HeiseiMinchoW3', 10, PdfFontStyle.regular, annotation);

            expect(heiFont).toBeDefined();
            expect(gothicFont).toBeDefined();
            expect(myeongjoFont).toBeDefined();
            expect(heiseiKakuFont).toBeDefined();
            expect(heiseiMinFont).toBeDefined();
        });
    });

    describe('_mapFont default TrueType path + internal unicode option branch', function () {
        it('covers default path using fontDictionary without touching AP', function () {
            var originalCtor: any = (fontModule as any).PdfTrueTypeFont;

            spyOn(fontModule as any, 'PdfTrueTypeFont').and.callFake(function (_data: any, size: number, _style: any): any {
                var fake: any = Object.create(originalCtor.prototype);
                defineValue(fake, 'size', size);
                defineValue(fake, '_size', size);
                defineValue(fake, '_dictionary', createDictionary({
                    BaseFont: _PdfName.get('FakeTT2')
                }));
                defineValue(fake, '_metrics', {});
                defineValue(fake, '_isUnicode', false);
                return fake;
            });

            var annotation: any = Object.create(annotationModule.PdfAnnotation.prototype);
            defineValue(annotation, '_dictionary', createDictionary({
                DA: '/TT1 11 Tf',
                V: 'plain'
            }));
            defineValue(annotation, '_crossReference', {});
            defineValue(annotation, '_type', _PdfAnnotationType.freeTextAnnotation);
            defineValue(annotation, '_circleCaptionFont', new PdfStandardFont(PdfFontFamily.helvetica, 4, PdfFontStyle.regular));

            var fontFileStream: any = createFakeFontFileStream([5, 6, 7, 8]);

            var fontDictionary: _PdfDictionary = createDictionary({
                FontDescriptor: createDictionary({
                    FontFile2: fontFileStream
                })
            });

            var font: any = utils._mapFont('SomeDescriptorFont', 11, PdfFontStyle.regular, annotation, fontDictionary);

            expect(font).toBeDefined();
        });

    });

    describe('_mapFont circle-caption / explicit else branches', function () {
        it('covers widget/textbox/combo larger-than-circle-caption path returning helvetica', function () {
            var widgetField: any = createTextBoxField({
                _dictionary: createDictionary(),
                _circleCaptionFont: new PdfStandardFont(PdfFontFamily.helvetica, 4, PdfFontStyle.regular)
            });

            defineValue(widgetField, '_type', _PdfAnnotationType.widgetAnnotation);

            var font: any = utils._mapFont('UnknownNoSwitch', 12, PdfFontStyle.regular, widgetField);

            expect(font).toBeDefined();
        });


        it('covers explicit else branch returning _circleCaptionFont when widgetAnnotation does not need larger font', function () {
            var annotation: any = Object.create(annotationModule.PdfAnnotation.prototype);
            defineValue(annotation, '_dictionary', createDictionary());
            defineValue(annotation, '_crossReference', {});
            defineValue(annotation, '_type', _PdfAnnotationType.widgetAnnotation);

            var circleCaptionFont: any = new PdfStandardFont(PdfFontFamily.helvetica, 5, PdfFontStyle.regular);
            defineValue(annotation, '_circleCaptionFont', circleCaptionFont);

            var font: any = utils._mapFont('UnknownNoSwitch', 2, PdfFontStyle.regular, annotation);

            expect(font).toBe(circleCaptionFont);
        });


        it('covers widgetAnnotation + hasCircleFont branch returning helvetica', function () {
            var annotation: any = Object.create(annotationModule.PdfAnnotation.prototype);
            defineValue(annotation, '_dictionary', createDictionary());
            defineValue(annotation, '_crossReference', {});
            defineValue(annotation, '_type', _PdfAnnotationType.widgetAnnotation);
            defineValue(annotation, '_circleCaptionFont', new PdfStandardFont(PdfFontFamily.helvetica, 4, PdfFontStyle.regular));

            var font: any = utils._mapFont('UnknownNoSwitch', 12, PdfFontStyle.regular, annotation);

            expect(font).toBeDefined();
        });
    });

    describe('_hasSharedFontResource drives _getAppearanceFontResources branches', function () {
        it('covers AP/N direct _PdfStream with Resources/Font and finds shared font key', function () {
            var nStream: any = createFakeStreamWithResources('F1');
            var ap: _PdfDictionary = createDictionary({
                N: nStream
            });

            var field: any = createWidgetLikeField(createDictionary({
                AP: ap
            }));

            var formFonts: _PdfDictionary = createDictionary();
            formFonts.set('F1', new _PdfReference(100, 0));

            defineValue(field, 'form', {
                _dictionary: createDictionary({
                    DR: createDictionary({
                        Font: formFonts
                    })
                }),
                _fontResources: formFonts
            });

            var hasShared: boolean = utils._hasSharedFontResource(field);

            expect(hasShared).toBe(true);
        });

        it('covers AP/N nested baseStream.stream -> _PdfStream explicit else branch', function () {
            var normalStream: any = createFakeStreamWithResources('F2');
            var ap: _PdfDictionary = createDictionary({
                N: {
                    stream: normalStream
                }
            });

            var field: any = createWidgetLikeField(createDictionary({
                AP: ap
            }));

            var formFonts: _PdfDictionary = createDictionary();
            formFonts.set('F2', new _PdfReference(200, 0));

            defineValue(field, 'form', {
                _dictionary: createDictionary({
                    DR: createDictionary({
                        Font: formFonts
                    })
                }),
                _fontResources: formFonts
            });

            var hasShared: boolean = utils._hasSharedFontResource(field);

            expect(hasShared).toBe(true);
        });
    });

    describe('_obtainFontDetails highlighted branches', function () {
        it('covers DA parsing, defaultAppearance "(" trim, cached TrueType reuse and internal unicode option check', function () {
            var fontDictionary: _PdfDictionary = createDictionary({
                BaseFont: _PdfName.get('Helvetica'),
                Subtype: _PdfName.get('TrueType')
            });

            var form: any = createFormWithDrFont('Helv', fontDictionary);

            var cachedTrueTypeFont: any = createFakeTrueTypeCacheFont(12);
            form._fontCache.set('/Helv_12', cachedTrueTypeFont);

            spyOn(form._fontCache, 'has').and.callFake(function (): boolean {
                return true;
            });
            spyOn(form._fontCache, 'get').and.returnValue(cachedTrueTypeFont);

            var widget: any = {
                _dictionary: createDictionary({
                    DA: '/Helv 12 Tf (sample)'
                })
            };

            var field: any = createComboBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 12 Tf',
                    V: 'key1',
                    FT: _PdfName.get('Ch'),
                    Opt: [
                        ['key1', 'தமிழ்'],
                        ['key2', 'Latin']
                    ]
                })
            });

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(form._fontCache.has).toHaveBeenCalled();
            expect(form._fontCache.get).toHaveBeenCalled();
            expect(font).toBeDefined();
            expect(font._isUnicode).toBe(true);
        });


        it('covers mismatched BaseFont -> TrueType recreation path including unicode option scan safely', function () {
            var originalCtor: any = (fontModule as any).PdfTrueTypeFont;

            spyOn(fontModule as any, 'PdfTrueTypeFont').and.callFake(function (_data: any, size: number, _style: any): any {
                var fake: any = Object.create(originalCtor.prototype);
                defineValue(fake, 'size', size);
                defineValue(fake, '_size', size);
                defineValue(fake, '_dictionary', createDictionary({
                    BaseFont: _PdfName.get('CreatedTT')
                }));
                defineValue(fake, '_metrics', {});
                defineValue(fake, '_isUnicode', false);
                return fake;
            });

            var descRef: _PdfReference = new _PdfReference(31, 0);
            var fontFileStream: any = createFakeFontFileStream([11, 12, 13, 14]);

            // createFontStream(...) iterates over fontDictionary values and fetches referenced objects.
            // So we provide one reference entry in the font dictionary.
            var trueTypeFontDictionary: _PdfDictionary = createDictionary({
                BaseFont: _PdfName.get('Helvetica'),
                Subtype: _PdfName.get('TrueType'),
                DescRef: descRef
            });

            var fetchedDescriptorHolder: _PdfDictionary = createDictionary({
                FDMarker: _PdfName.get('FontDescriptor'),
                FontFile2: fontFileStream
            });

            var form: any = createFormWithDrFont('Helv', trueTypeFontDictionary);
            form._crossReference = {
                _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedDescriptorHolder)
            };

            var widget: any = {
                _dictionary: createDictionary({
                    DA: '/Helv 10 Tf'
                })
            };

            var field: any = createComboBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 10 Tf',
                    V: 'display-key',
                    FT: _PdfName.get('Ch'),
                    Opt: [
                        ['display-key', 'தமிழ்'],
                        ['other', 'abc']
                    ]
                })
            });

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(font).toBeDefined();
            expect(font._isUnicode).toBe(true);
        });


        it('covers standard-font metrics repair block for textbox field without throwing', function () {
            var fontDescriptor: _PdfDictionary = createDictionary({
                Ascent: 800,
                Descent: -200
            });

            var fontDictionary: _PdfDictionary = createDictionary({
                BaseFont: _PdfName.get('Helvetica'),
                Subtype: _PdfName.get('Type1'),
                FontDescriptor: fontDescriptor,
                Widths: [400, 500, 600]
            });

            var form: any = createFormWithDrFont('Helv', fontDictionary);

            var cachedStandard: any = new PdfStandardFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);

            // Make obtainFontDetails think there is a cached font and the appearance resource is not valid/shared,
            // so the "!hasValidFontCache && font instanceof PdfStandardFont && field instanceof PdfTextBoxField ..." block executes.
            form._fontCache = {
                has: jasmine.createSpy('has').and.returnValue(true),
                get: jasmine.createSpy('get').and.returnValue(cachedStandard),
                set: jasmine.createSpy('set')
            };

            spyOn(utils as any, '_hasSharedFontResource').and.returnValue(false);

            var widget: any = {
                _dictionary: createDictionary({
                    DA: '/Helv 12 Tf'
                })
            };

            var field: any = createTextBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 12 Tf',
                    AP: createDictionary({ N: createDictionary() })
                }),
                _isTextChanged: false
            });

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(form._fontCache.has).toHaveBeenCalled();
            expect(form._fontCache.get).toHaveBeenCalled();
            expect(font).toBeDefined();
            expect(font._metrics).toBeDefined();
        });


        it('covers fallback font creation when DR/Font is missing and fontSize is zero', function () {
            var form: any = {
                _dictionary: createDictionary(),
                _fontCache: new Map<string, any>()
            };

            var widget: any = {
                _dictionary: createDictionary({
                    DA: '/Helv 0 Tf'
                })
            };

            var field: any = createTextBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 0 Tf'
                })
            });

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(font).toBeDefined();
            expect(font.size).toBeGreaterThan(0);
        });

    });

    describe('_getFontSize branches shown in the uploaded images', function () {
        it('covers combo selectedIndex:number + padding=true + rotationAngle===0', function () {
            var field: any = createComboBoxField({
                selectedIndex: 0,
                rotationAngle: 0,
                border: { width: 1, style: PdfBorderStyle.inset },
                bounds: { x: 0, y: 0, width: 100, height: 24 }
            });

            var size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

            expect(size).toBeGreaterThan(0);
            expect(field.itemAt).toHaveBeenCalledWith(0);
        });

        it('covers combo selectedIndex:number[] explicit else branch', function () {
            var field: any = createComboBoxField({
                selectedIndex: [0, 1],
                border: { width: 1, style: PdfBorderStyle.solid },
                bounds: { x: 0, y: 0, width: 120, height: 28 }
            });

            var size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

            expect(size).toBeGreaterThan(0);
            expect(field.itemAt).toHaveBeenCalledWith(0);
            expect(field.itemAt).toHaveBeenCalledWith(1);
        });

        it('covers combo measureValue.length===0 else branch with array V text', function () {
            var field: any = createComboBoxField({
                selectedIndex: undefined,
                bounds: { x: 0, y: 0, width: 24, height: 10 },
                border: { width: 1, style: PdfBorderStyle.solid }
            });

            field._dictionary.set('V', ['VeryLongComboValue']);
            field._obtainSelectedValue.and.returnValue('VeryLongComboValue');

            var size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

            expect(size).toBeGreaterThan(0);
            expect(size).toBeLessThanOrEqual(12);
        });

        it('covers combo shrink-to-fit inner loop with string V text', function () {
            var field: any = createComboBoxField({
                selectedIndex: undefined,
                bounds: { x: 0, y: 0, width: 22, height: 9 },
                border: { width: 1, style: PdfBorderStyle.solid }
            });

            field._dictionary.set('V', 'VeryLongComboValueThatForcesShrink');
            field._obtainSelectedValue.and.returnValue('VeryLongComboValueThatForcesShrink');

            var size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

            expect(size).toBeGreaterThan(0);
            expect(size).toBeLessThanOrEqual(12);
        });

        it('covers textbox single-line, padding and multiline branches', function () {
            var singleLineField: any = createTextBoxField({
                text: 'Short',
                multiLine: false,
                bounds: { x: 0, y: 0, width: 80, height: 18 },
                border: { width: 1, style: PdfBorderStyle.solid }
            });

            var paddedField: any = createTextBoxField({
                text: 'Text',
                multiLine: false,
                bounds: { x: 0, y: 0, width: 70, height: 20 },
                border: { width: 1, style: PdfBorderStyle.beveled }
            });

            var multiLineField: any = createTextBoxField({
                text: 'Line1\nLine2\nLine3',
                multiLine: true,
                bounds: { x: 0, y: 0, width: 30, height: 12 },
                border: { width: 1, style: PdfBorderStyle.solid }
            });

            expect(utils._getFontSize(singleLineField, PdfFontFamily.helvetica)).toBeGreaterThan(0);
            expect(utils._getFontSize(paddedField, PdfFontFamily.helvetica)).toBeGreaterThan(0);
            expect(utils._getFontSize(multiLineField, PdfFontFamily.helvetica)).toBeGreaterThan(0);
        });
    });

    describe('_setRotateAngle - safe getter-only handling', function () {
        it('updates Rotate without assigning annot.rotate directly', function () {
            var annot: any = Object.create(annotationModule.PdfAnnotation.prototype);
            defineValue(annot, '_dictionary', createDictionary());
            annot._dictionary.update = jasmine.createSpy('update');

            Object.defineProperty(annot, 'rotate', {
                configurable: true,
                get: function (): number {
                    return 90;
                }
            });

            utils._setRotateAngle(-90, annot);

            expect(annot._dictionary.update).toHaveBeenCalledWith('Rotate', 270);
        });

        it('covers rotateAngle >= 360 normalization safely', function () {
            var annot: any = Object.create(annotationModule.PdfAnnotation.prototype);
            defineValue(annot, '_dictionary', createDictionary());
            annot._dictionary.update = jasmine.createSpy('update');

            Object.defineProperty(annot, 'rotate', {
                configurable: true,
                get: function (): number {
                    return 0;
                }
            });

            utils._setRotateAngle(450, annot);

            expect(annot._dictionary.update).toHaveBeenCalledWith('Rotate', -90);
        });

        it('does nothing when rotateAngle matches getter value', function () {
            var annot: any = Object.create(annotationModule.PdfAnnotation.prototype);
            defineValue(annot, '_dictionary', createDictionary());
            annot._dictionary.update = jasmine.createSpy('update');

            Object.defineProperty(annot, 'rotate', {
                configurable: true,
                get: function (): number {
                    return 180;
                }
            });

            utils._setRotateAngle(180, annot);

            expect(annot._dictionary.update).not.toHaveBeenCalled();
        });
    });

});

describe('utils.ts highlighted branches from 3 uploaded images - safe coverage', function () {

    function createDictionary(seed?: { [key: string]: any }): _PdfDictionary {
        var dict: _PdfDictionary = new _PdfDictionary();
        if (seed) {
            Object.keys(seed).forEach(function (key: string): void {
                dict.set(key, seed[key]);
            });
        }
        return dict;
    }

    function defineValue(obj: any, prop: string, value: any): void {
        Object.defineProperty(obj, prop, {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }

    function createFakeFontFileStream(bytes?: number[]): any {
        var stream: any = Object.create(_PdfBaseStream.prototype);
        var buffer: Uint8Array = new Uint8Array(bytes ? bytes : [1, 2, 3, 4]);

        defineValue(stream, 'length', buffer.length);
        defineValue(stream, 'start', 0);
        defineValue(stream, 'end', buffer.length);
        defineValue(stream, 'buffer', buffer);

        defineValue(stream, 'getByteRange', function (_start: number, _end: number): Uint8Array {
            return buffer;
        });

        defineValue(stream, 'getBytes', function (_length: number): Uint8Array {
            return buffer;
        });

        return stream;
    }

    function createFakeTrueTypePdfStream(bytes?: number[]): any {
        var buffer: Uint8Array = new Uint8Array(bytes ? bytes : [11, 22, 33, 44, 55]);

        var stream: any = Object.create(_PdfStream.prototype);
        defineValue(stream, 'length', buffer.length);
        defineValue(stream, 'start', 0);
        defineValue(stream, 'end', buffer.length);
        defineValue(stream, 'buffer', buffer);
        defineValue(stream, 'dictionary', createDictionary({
            Length: buffer.length
        }));

        defineValue(stream, 'getByteRange', function (_start: number, _end: number): Uint8Array {
            return buffer;
        });

        defineValue(stream, 'getBytes', function (_length: number): Uint8Array {
            return buffer;
        });

        return stream;
    }


    function createComboBoxField(overrides?: { [key: string]: any }): any {
        var field: any = Object.create(PdfComboBoxField.prototype);

        defineValue(field, '_dictionary', createDictionary());
        defineValue(field, 'bounds', { x: 0, y: 0, width: 80, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'rotationAngle', 0);
        defineValue(field, 'selectedIndex', 0);
        defineValue(field, 'itemAt', jasmine.createSpy('itemAt').and.callFake(function (index: number): any {
            return { text: 'Item-' + index };
        }));
        defineValue(field, '_obtainSelectedValue', jasmine.createSpy('_obtainSelectedValue').and.returnValue('Item-0'));
        defineValue(field, '_getStringFormat', jasmine.createSpy('_getStringFormat').and.returnValue(undefined));
        defineValue(field, '_circleCaptionFont', new PdfStandardFont(PdfFontFamily.helvetica, 9, PdfFontStyle.regular));

        if (overrides) {
            Object.keys(overrides).forEach(function (key: string): void {
                defineValue(field, key, overrides[key]);
            });
        }

        return field;
    }

    function createTextBoxField(overrides?: { [key: string]: any }): any {
        var field: any = Object.create(PdfTextBoxField.prototype);

        defineValue(field, '_dictionary', createDictionary());
        defineValue(field, 'bounds', { x: 0, y: 0, width: 80, height: 20 });
        defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
        defineValue(field, 'text', 'A');
        defineValue(field, 'multiLine', false);
        defineValue(field, '_isTextChanged', false);
        defineValue(field, '_getStringFormat', jasmine.createSpy('_getStringFormat').and.returnValue(undefined));
        defineValue(field, '_circleCaptionFont', new PdfStandardFont(PdfFontFamily.helvetica, 8, PdfFontStyle.regular));

        if (overrides) {
            Object.keys(overrides).forEach(function (key: string): void {
                defineValue(field, key, overrides[key]);
            });
        }

        return field;
    }

    function createFormWithDrFont(alias: string, fontDictionary: _PdfDictionary): any {
        var fonts: _PdfDictionary = createDictionary();
        fonts.set(alias, fontDictionary);

        var dr: _PdfDictionary = createDictionary({
            Font: fonts
        });

        return {
            _dictionary: createDictionary({
                DR: dr
            }),
            _fontResources: fonts,
            _fontCache: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set')
            },
            _crossReference: {
                _fetch: jasmine.createSpy('_fetch').and.returnValue(createDictionary())
            }
        };
    }

    function attachAppearanceFontResources(field: any, fontKey: string): void {
        var apFontDict: _PdfDictionary = createDictionary();
        apFontDict.set(fontKey, new _PdfReference(70, 0));

        var resources: _PdfDictionary = createDictionary({
            Font: apFontDict
        });

        var nStreamDict: _PdfDictionary = createDictionary({
            Resources: resources
        });

        var nStream: any = Object.create(_PdfStream.prototype);
        defineValue(nStream, 'dictionary', nStreamDict);

        field._dictionary.set('AP', createDictionary({
            N: nStream
        }));
    }

    function createFakeTrueTypeCacheFont(size: number, baseFontName: string): any {
        var proto: any = (fontModule as any).PdfTrueTypeFont.prototype;
        var font: any = Object.create(proto);

        defineValue(font, 'size', size);
        defineValue(font, '_size', size);
        defineValue(font, 'height', size);
        defineValue(font, '_isUnicode', false);
        defineValue(font, '_dictionary', createDictionary({
            BaseFont: _PdfName.get(baseFontName)
        }));
        defineValue(font, '_metrics', {});
        return font;
    }

    beforeEach(function (): void {
        spyOn(PdfStandardFont.prototype as any, 'measureString').and.callFake(function (this: any, text: any): any {
            var rawText: string = '';
            if (Array.isArray(text)) {
                rawText = String(text.length > 0 && text[0] !== undefined && text[0] !== null ? text[0] : '');
            } else {
                rawText = String(text !== undefined && text !== null ? text : '');
            }

            var size: number = typeof this._size === 'number' ? this._size : (typeof this.size === 'number' ? this.size : 12);

            return {
                width: Math.max(1, rawText.length) * size * 1.6,
                height: Math.max(1, size * 1.15)
            };
        });

        spyOn(PdfStandardFont.prototype as any, 'getLineWidth').and.callFake(function (this: any, text: any): number {
            var rawText: string = String(text !== undefined && text !== null ? text : '');
            var size: number = typeof this._size === 'number' ? this._size : (typeof this.size === 'number' ? this.size : 12);
            return Math.max(1, rawText.length) * size * 1.35;
        });
    });

    describe('_removeDuplicateFromResources and _removeReferences', function () {
        it('covers XObject reference recursion and Font/XObject/ExtGState dictionary recursion safely', function () {
            var parentRef: _PdfReference = new _PdfReference(10, 0);
            var childRef1: _PdfReference = new _PdfReference(11, 0);
            var childRef2: _PdfReference = new _PdfReference(12, 0);
            var childRef3: _PdfReference = new _PdfReference(13, 0);

            defineValue(parentRef, '_isNew', true);
            defineValue(childRef1, '_isNew', true);
            defineValue(childRef2, '_isNew', true);
            defineValue(childRef3, '_isNew', true);

            var childResources1: any = {
                size: 1,
                forEach: function (callback: Function): void {
                    callback('ImageLeaf', childRef1);
                },
                get: function (_key: string): any {
                    return createDictionary();
                }
            };

            var childResources2: any = {
                size: 1,
                forEach: function (callback: Function): void {
                    callback('FontLeaf', childRef2);
                },
                get: function (_key: string): any {
                    return createDictionary();
                }
            };

            var childResources3: any = {
                size: 1,
                forEach: function (callback: Function): void {
                    callback('GsLeaf', childRef3);
                },
                get: function (_key: string): any {
                    return createDictionary();
                }
            };

            var xObjectDictionary: _PdfDictionary = createDictionary({
                Resources: childResources1
            });

            var fontDictionary: _PdfDictionary = createDictionary({
                Resources: childResources2
            });

            var extGStateDictionary: _PdfDictionary = createDictionary({
                Resources: childResources3
            });

            var resources: any = {
                size: 4,
                forEach: function (callback: Function): void {
                    callback('XObject', parentRef);
                    callback('Font', fontDictionary);
                    callback('ExtGState', extGStateDictionary);
                    callback('SkipUndefined', undefined);
                },
                get: function (key: string): any {
                    if (key === 'XObject') {
                        return xObjectDictionary;
                    }
                    return undefined;
                }
            };

            var crossTable: any = {
                _cacheMap: new Map<any, any>([
                    [parentRef, true],
                    [childRef1, true],
                    [childRef2, true],
                    [childRef3, true]
                ])
            };

            utils._removeDuplicateFromResources(resources, crossTable);

            expect(crossTable._cacheMap.has(parentRef)).toBe(false);
            expect(crossTable._cacheMap.has(childRef1)).toBe(false);
            expect(crossTable._cacheMap.has(childRef2)).toBe(false);
            expect(crossTable._cacheMap.has(childRef3)).toBe(false);
        });

        it('covers _removeReferences explicit _PdfStream branch safely', function () {
            var firstRef: _PdfReference = new _PdfReference(20, 0);
            var secondRef: _PdfReference = new _PdfReference(21, 0);
            defineValue(firstRef, '_isNew', true);
            defineValue(secondRef, '_isNew', true);

            var fetchedDictionary1: _PdfDictionary = createDictionary();
            var fetchedDictionary2: _PdfDictionary = createDictionary();

            var normalDictionary: _PdfDictionary = createDictionary();
            normalDictionary.set('First', firstRef);
            normalDictionary.set('Second', secondRef);

            var normalStream: any = Object.create(_PdfStream.prototype);
            defineValue(normalStream, 'dictionary', normalDictionary);

            var crossTable: any = {
                _cacheMap: new Map<any, any>([
                    [firstRef, true],
                    [secondRef, true]
                ]),
                _fetch: jasmine.createSpy('_fetch').and.callFake(function (ref: _PdfReference): any {
                    if (ref === firstRef) {
                        return fetchedDictionary1;
                    }
                    if (ref === secondRef) {
                        return fetchedDictionary2;
                    }
                    return createDictionary();
                })
            };

            utils._removeReferences(normalStream, crossTable, 'First', 'Second');

            expect(crossTable._fetch).toHaveBeenCalled();
            expect(crossTable._cacheMap.has(firstRef)).toBe(false);
            expect(crossTable._cacheMap.has(secondRef)).toBe(false);
        });



    });

    describe('_obtainFontDetails highlighted DA/cache/repair/TrueType branches', function () {

        it('covers widget DA without AP path -> _mapFont(defaultAppearance, size, style, widget, fontDictionary)', function () {
            var fontDictionary: _PdfDictionary = createDictionary({
                BaseFont: _PdfName.get('Helvetica'),
                Subtype: _PdfName.get('Type1')
            });

            var form: any = createFormWithDrFont('Helv', fontDictionary);

            var widget: any = {
                _dictionary: createDictionary({
                    DA: '/Helv 10 Tf'
                })
            };

            var field: any = createTextBoxField({
                _dictionary: createDictionary()
            });

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(font).toBeDefined();
            expect(font.size).toBeGreaterThan(0);
        });

        it('covers field DA with AP path -> _mapFont(defaultAppearance, size, style, field)', function () {
            var fontDictionary: _PdfDictionary = createDictionary({
                BaseFont: _PdfName.get('Helvetica'),
                Subtype: _PdfName.get('Type1')
            });

            var form: any = createFormWithDrFont('Helv', fontDictionary);

            var widget: any = {
                _dictionary: createDictionary()
            };

            var field: any = createTextBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 10 Tf',
                    AP: createDictionary({
                        N: createDictionary()
                    })
                })
            });

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(font).toBeDefined();
            expect(font.size).toBeGreaterThan(0);
        });

        it('covers field DA without AP path -> _mapFont(defaultAppearance, size, style, field, fontDictionary)', function () {
            var fontDictionary: _PdfDictionary = createDictionary({
                BaseFont: _PdfName.get('Helvetica'),
                Subtype: _PdfName.get('Type1')
            });

            var form: any = createFormWithDrFont('Helv', fontDictionary);

            var widget: any = {
                _dictionary: createDictionary()
            };

            var field: any = createTextBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 10 Tf'
                })
            });

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(font).toBeDefined();
            expect(font.size).toBeGreaterThan(0);
        });

        it('covers !hasValidFontCache + PdfStandardFont + PdfTextBoxField metrics repair block safely', function () {
            var descriptor: _PdfDictionary = createDictionary({
                Ascent: 800,
                Descent: -200
            });

            var fontDictionary: _PdfDictionary = createDictionary({
                BaseFont: _PdfName.get('Helvetica'),
                Subtype: _PdfName.get('Type1'),
                FontDescriptor: descriptor,
                Widths: [400, 500, 600]
            });

            var form: any = createFormWithDrFont('Helv', fontDictionary);
            var cachedStandard: any = new PdfStandardFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);

            form._fontCache.has.and.returnValue(true);
            form._fontCache.get.and.returnValue(cachedStandard);

            var field: any = createTextBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 12 Tf'
                }),
                _isTextChanged: false
            });

            // Make AP resources intentionally NOT shared with DR font resources, so hasValidFontCache becomes false.
            attachAppearanceFontResources(field, 'DifferentKey');

            var widget: any = {
                _dictionary: createDictionary()
            };

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(font).toBeDefined();
            expect(font._metrics).toBeDefined();
            expect(font._metrics._widthTable).toBeDefined();
        });

        it('covers mismatched BaseFont -> TrueType recreation block and unicode option scan safely', function () {
            var originalCtor: any = (fontModule as any).PdfTrueTypeFont;

            spyOn(fontModule as any, 'PdfTrueTypeFont').and.callFake(function (_data: any, size: number, _style: any): any {
                var fake: any = Object.create(originalCtor.prototype);
                defineValue(fake, 'size', size);
                defineValue(fake, '_size', size);
                defineValue(fake, '_dictionary', createDictionary({
                    BaseFont: _PdfName.get('CreatedTT')
                }));
                defineValue(fake, '_metrics', {});
                defineValue(fake, '_isUnicode', false);
                return fake;
            });

            var descRef: _PdfReference = new _PdfReference(31, 0);
            defineValue(descRef, '_isNew', true);

            var trueTypeFontDictionary: _PdfDictionary = createDictionary({
                BaseFont: _PdfName.get('Helvetica'),
                Subtype: _PdfName.get('TrueType'),
                DescRef: descRef
            });

            var form: any = createFormWithDrFont('Helv', trueTypeFontDictionary);

            var fontFileStream: any = createFakeFontFileStream([11, 12, 13, 14]);
            var fetchedDescriptorHolder: _PdfDictionary = createDictionary({
                Type: _PdfName.get('FontDescriptor'),
                FontFile2: fontFileStream
            });

            form._crossReference = {
                _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedDescriptorHolder)
            };

            var widget: any = {
                _dictionary: createDictionary({
                    DA: '/Helv 10 Tf'
                })
            };

            var field: any = createComboBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 10 Tf',
                    V: 'display-key',
                    FT: _PdfName.get('Ch'),
                    Opt: [
                        ['display-key', 'தமிழ்'],
                        ['other', 'abc']
                    ]
                })
            });

            var font: any = utils._obtainFontDetails(form, widget, field);

            expect(font).toBeDefined();
            expect(font._isUnicode).toBe(true);
        });


        it('covers combo-box _circleCaptionFont explicit else branch when resulting font size is 1', function () {
            var form: any = {
                _dictionary: createDictionary(),
                _fontCache: {
                    has: jasmine.createSpy('has').and.returnValue(false),
                    get: jasmine.createSpy('get'),
                    set: jasmine.createSpy('set')
                }
            };

            var comboCaptionFont: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 9, PdfFontStyle.regular);

            var field: any = createComboBoxField({
                _dictionary: createDictionary({
                    DA: '/Helv 1 Tf'
                }),
                _circleCaptionFont: comboCaptionFont
            });

            // Pass no widget so the field-side combo fallback branch is chosen directly
            var font: any = utils._obtainFontDetails(form, undefined as any, field);

            expect(font).toBeTruthy();
        });

        function createFakeTrueTypePdfStream(bytes?: number[]): any {
            var buffer: Uint8Array = new Uint8Array(bytes ? bytes : [11, 22, 33, 44, 55]);

            var stream: any = Object.create(_PdfStream.prototype);
            defineValue(stream, 'length', buffer.length);
            defineValue(stream, 'start', 0);
            defineValue(stream, 'end', buffer.length);
            defineValue(stream, 'buffer', buffer);
            defineValue(stream, 'dictionary', createDictionary({
                Length: buffer.length
            }));

            defineValue(stream, 'getByteRange', function (_start: number, _end: number): Uint8Array {
                return buffer;
            });

            defineValue(stream, 'getBytes', function (_length: number): Uint8Array {
                return buffer;
            });

            return stream;
        }

        it('covers _mapFont default AP -> _tryParseFontStream -> PdfTrueTypeFont -> _checkUnicodeString path exactly', function () {
            var originalCtor: any = (fontModule as any).PdfTrueTypeFont;

            // Keep constructor stable and synchronous.
            spyOn(fontModule as any, 'PdfTrueTypeFont').and.callFake(function (_data: any, size: number, _style: any): any {
                var fake: any = Object.create(originalCtor.prototype);
                defineValue(fake, 'size', size);
                defineValue(fake, '_size', size);
                defineValue(fake, '_dictionary', createDictionary({
                    BaseFont: _PdfName.get('FakeTrueType')
                }));
                defineValue(fake, '_metrics', {});
                defineValue(fake, '_isUnicode', false);
                return fake;
            });

            // Resource reference used by AP/Resources/Font.
            var fontRef: _PdfReference = new _PdfReference(501, 0);
            defineValue(fontRef, '_isNew', true);

            // IMPORTANT: use _PdfStream shape, not _PdfBaseStream.
            var fontFileStream: any = createFakeTrueTypePdfStream([11, 22, 33, 44, 55]);

            // _crossReference._fetch(fontRef) must return a font dictionary that _getFontFromDescriptor can read.
            var fetchedFontDictionary: _PdfDictionary = createDictionary({
                FontDescriptor: createDictionary({
                    FontFile2: fontFileStream
                })
            });

            // AP -> N -> _PdfStream -> dictionary -> Resources -> Font -> CustomTT
            var appearanceFontDict: _PdfDictionary = createDictionary();
            appearanceFontDict.set('CustomTT', fontRef);

            var resources: _PdfDictionary = createDictionary({
                Font: appearanceFontDict
            });

            var nStreamDictionary: _PdfDictionary = createDictionary({
                Resources: resources
            });

            var nStream: any = Object.create(_PdfStream.prototype);
            defineValue(nStream, 'dictionary', nStreamDictionary);

            var apDictionary: _PdfDictionary = createDictionary({
                N: nStream
            });

            // Unknown font name => default: branch
            // DA present => switch block runs
            // AP present => _tryParseFontStream path
            // V + FT=Ch + Opt => _checkUnicodeString path
            var fieldDictionary: _PdfDictionary = createDictionary({
                DA: '/CustomTT 10 Tf',
                AP: apDictionary,
                V: 'export-key',
                FT: _PdfName.get('Ch'),
                Opt: [
                    ['export-key', 'தமிழ்'],
                    ['other-key', 'Latin']
                ]
            });

            var field: any = Object.create(PdfComboBoxField.prototype);
            defineValue(field, '_dictionary', fieldDictionary);
            defineValue(field, '_crossReference', {
                _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedFontDictionary)
            });
            defineValue(field, '_circleCaptionFont', new PdfStandardFont(PdfFontFamily.helvetica, 9, PdfFontStyle.regular));

            var font: any = utils._mapFont('CustomTT', 10, PdfFontStyle.regular, field);

            expect(field._crossReference._fetch).toHaveBeenCalledWith(fontRef);
            expect(font).toBeDefined();
            expect(font._isUnicode).toBe(true);
        });



    });

});
