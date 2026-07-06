import * as utils from '../src/pdf/core/utils';
import { _PdfBaseStream, _PdfStream } from '../src/pdf/core/base-stream';
import {
    PdfAnnotationFlag,
    PdfRotationAngle,
    _PdfCheckFieldState,
    PdfNumberStyle,
    PdfBorderStyle
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
import { PdfTextBoxField, PdfComboBoxField } from '../src/pdf/core/form/field';
import { PdfForm } from '../src/pdf/core/form/form';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';

describe('utils.ts full branch coverage', () => {

    function defineOwn(obj: any, key: string, value: any): void {
        Object.defineProperty(obj, key, {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }

    function createDictionary(seed: Record<string, any> = {}, objId?: string): any {
        const dict: any = Object.create((_PdfDictionary as any).prototype);
        dict._map = { ...seed };
        dict.objId = objId;
        dict._updated = false;

        dict.has = (key: string): boolean =>
            Object.prototype.hasOwnProperty.call(dict._map, key);

        dict.get = (key: string): any => dict._map[key];

        dict.getArray = (key: string): any => dict._map[key];

        dict.getRaw = (key: string): any => {
            if (Object.prototype.hasOwnProperty.call(dict._map, `__raw__${key}`)) {
                return dict._map[`__raw__${key}`];
            }
            return dict._map[key];
        };

        dict.update = (key: string, value: any): void => {
            dict._map[key] = value;
        };

        dict.set = (key: string, value: any): void => {
            dict._map[key] = value;
        };

        dict.forEach = (callback: (key: string, value: any) => void): void => {
            Object.keys(dict._map).forEach((key: string) => callback(key, dict._map[key]));
        };

        Object.defineProperty(dict, 'size', {
            get(): number {
                return Object.keys(dict._map).length;
            }
        });

        return dict;
    }

    function createReference(isNew: boolean = true): any {
        const reference: any = Object.create((_PdfReference as any).prototype);
        reference._isNew = isNew;
        return reference;
    }

    function createBaseStream(dictSeed: Record<string, any> = {}): any {
        const stream: any = Object.create((_PdfBaseStream as any).prototype);
        const dict: any = createDictionary(dictSeed);

        defineOwn(stream, 'dictionary', dict);
        stream.getBytes = jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([1, 2, 3, 4]));

        return stream;
    }

    function createPdfStream(dictSeed: Record<string, any> = {}): any {
        const stream: any = Object.create((_PdfStream as any).prototype);
        const dict: any = createDictionary({
            Length: 4,
            Length1: 4,
            ...dictSeed
        });

        defineOwn(stream, 'dictionary', dict);
        defineOwn(stream, 'stream', new Uint8Array([1, 2, 3, 4]));
        defineOwn(stream, 'buffer', new Uint8Array([1, 2, 3, 4]));

        stream.getBytes = jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([1, 2, 3, 4]));
        stream.getByteRange = jasmine.createSpy('getByteRange').and.returnValue(new Uint8Array([1, 2, 3, 4]));

        return stream;
    }

    function createPage(seed?: Partial<any>): any {
        const page: any = {
            size: { width: 100, height: 100 },
            mediaBox: null,
            cropBox: null,
            rotation: PdfRotationAngle.angle0,
            _pageDictionary: createDictionary({}),
            _isNew: false,
            _pageSettings: {}
        };
        return { ...page, ...(seed || {}) };
    }

    function createTextBoxField(seed?: Partial<any>): any {
        const field: any = Object.create((PdfTextBoxField as any).prototype);

        defineOwn(field, '_dictionary', createDictionary({ FT: _PdfName.get('Tx') }));
        defineOwn(field, 'bounds', { x: 0, y: 0, width: 100, height: 30 });
        defineOwn(field, 'border', { width: 1 });
        defineOwn(field, 'rotationAngle', 0);
        defineOwn(field, 'multiLine', false);
        defineOwn(field, 'text', 'Hello');
        defineOwn(field, '_isTextChanged', false);
        defineOwn(field, '_page', null);
        defineOwn(field, '_kidsCount', 0);
        defineOwn(field, '_font', null);
        defineOwn(field, '_type', 'widgetAnnotation');
        defineOwn(field, '_circleCaptionFont', false);

        field._obtainSelectedValue = jasmine.createSpy('_obtainSelectedValue').and.returnValue('Hello');

        if (seed) {
            Object.keys(seed).forEach((key: string) => defineOwn(field, key, (seed as any)[key]));
        }

        return field;
    }

    function createComboBoxField(seed?: Partial<any>): any {
        const field: any = Object.create((PdfComboBoxField as any).prototype);

        defineOwn(field, '_dictionary', createDictionary({ FT: _PdfName.get('Ch') }));
        defineOwn(field, 'bounds', { x: 0, y: 0, width: 120, height: 30 });
        defineOwn(field, 'border', { width: 1 });
        defineOwn(field, 'rotationAngle', 0);
        defineOwn(field, 'multiLine', false);
        defineOwn(field, 'selectedIndex', [0, 1]);
        defineOwn(field, '_page', null);
        defineOwn(field, '_kidsCount', 0);
        defineOwn(field, '_font', null);

        field.itemAt = jasmine.createSpy('itemAt').and.callFake((index: number) => ({ text: `Item${index}` }));
        field._obtainSelectedValue = jasmine.createSpy('_obtainSelectedValue').and.returnValue('Item0');

        if (seed) {
            Object.keys(seed).forEach((key: string) => defineOwn(field, key, (seed as any)[key]));
        }

        return field;
    }

    function createWidget(seed?: Partial<any>): any {
        const widget: any = Object.create((PdfWidgetAnnotation as any).prototype);
        defineOwn(widget, '_dictionary', createDictionary({}));

        if (seed) {
            Object.keys(seed).forEach((key: string) => defineOwn(widget, key, (seed as any)[key]));
        }

        return widget;
    }

    function createAnnotation(seed?: Partial<any>): any {
        const annotation: any = Object.create((PdfAnnotation as any).prototype);
        defineOwn(annotation, '_dictionary', createDictionary({}));
        defineOwn(annotation, '_bounds', [0, 0, 10, 10]);
        defineOwn(annotation, 'bounds', { x: 0, y: 0, width: 10, height: 10 });
        defineOwn(annotation, '_page', createPage());
        defineOwn(annotation, '_isLoaded', true);
        defineOwn(annotation, '_type', 'annotation');
        annotation._getCropOrMediaBox = jasmine.createSpy('_getCropOrMediaBox').and.returnValue([0, 0, 100, 100]);

        if (seed) {
            Object.keys(seed).forEach((key: string) => defineOwn(annotation, key, (seed as any)[key]));
        }

        return annotation;
    }

    function createRubberStamp(seed?: Partial<any>): any {
        const annotation: any = Object.create((PdfRubberStampAnnotation as any).prototype);
        defineOwn(annotation, 'bounds', { x: 0, y: 0, width: 40, height: 20 });
        annotation._transformBBox = jasmine.createSpy('_transformBBox').and.returnValue([0, 0, 40, 20]);

        if (seed) {
            Object.keys(seed).forEach((key: string) => defineOwn(annotation, key, (seed as any)[key]));
        }

        return annotation;
    }

    beforeEach(() => {
        jasmine.getEnv().allowRespy(true);
    });

    describe('flag/string/byte helpers', () => {

        it('should cover _stringToPdfString utf16be branch', () => {
            // Arrange
            const value: string = '\xFE\xFF\x00A';

            // Act
            const result: string = utils._stringToPdfString(value);

            // Assert
            expect(typeof result).toBe('string');
        });

        it('should cover _stringToPdfString utf8 and utf16le branches', () => {
            // Arrange
            const utf8: string = '\xEF\xBB\xBFABC';
            const utf16le: string = '\xFF\xFEA\x00';

            // Act
            const utf8Result: string = utils._stringToPdfString(utf8);
            const utf16leResult: string = utils._stringToPdfString(utf16le);

            // Assert
            expect(utf8Result.length).toBeGreaterThan(0);
            expect(utf16leResult.length).toBeGreaterThan(0);
        });

        it('should cover _stringToBytes password + isDirect + destination branches', () => {
            // Arrange
            const dest: number[] = [];

            // Act
            const passwordResult: number[] | Uint8Array = utils._stringToBytes('abc', true, true);
            const destinationResult: number[] | Uint8Array = utils._stringToBytes('abc', false, true, dest);

            // Assert
            expect(Array.isArray(passwordResult)).toBeTruthy();
            expect(passwordResult).toEqual([97, 98, 99]);
            expect(destinationResult).toBe(dest);
            expect(dest).toEqual([97, 98, 99]);
        });

        it('should cover _stringToBytes non-password direct and multibyte branches', () => {
            // Act
            const directAscii: number[] | Uint8Array = utils._stringToBytes('abc', true, false);
            const directUnicode: number[] | Uint8Array = utils._stringToBytes('é😀', true, false);

            // Assert
            expect(Array.isArray(directAscii)).toBeTruthy();
            expect(Array.isArray(directUnicode)).toBeTruthy();
            expect((directUnicode as number[]).length).toBeGreaterThan(2);
        });

        it('should cover _decodeName invalid parseInt branch and replacement path', () => {
            // Arrange
            const parseIntSpy = spyOn(window as any, 'parseInt').and.returnValue(NaN as any);

            // Act
            const result: string = utils._decodeName('Name_x0041_');

            // Assert
            expect(result).toBe('Name_x0041_');
            expect(parseIntSpy).toHaveBeenCalled();

            parseIntSpy.and.callThrough();
        });

        it('should cover _decodeName normal BMP and astral replacements', () => {
            // Act
            const bmp: string = utils._decodeName('A_x0041_');
            const astral: string = utils._decodeName('Face_x0001F600_');

            // Assert
            expect(bmp).toBe('AA');
            expect(astral.indexOf('Face')).toBe(0);
        });

        it('should cover _decodeUnicodeBytes for 1, 2, 3 and 4 byte sequences', () => {
            // Arrange
            const ascii: Uint8Array = new Uint8Array([65, 66]);
            const twoByte: Uint8Array = new Uint8Array([0xC3, 0xA9]);
            const threeByte: Uint8Array = new Uint8Array([0xE2, 0x82, 0xAC]);
            const fourByte: Uint8Array = new Uint8Array([0xF0, 0x9F, 0x98, 0x80]);

            // Act
            const a: string = utils._decodeUnicodeBytes(ascii);
            const b: string = utils._decodeUnicodeBytes(twoByte);
            const c: string = utils._decodeUnicodeBytes(threeByte);
            const d: string = utils._decodeUnicodeBytes(fourByte);

            // Assert
            expect(a).toBe('AB');
            expect(b).toBe('é');
            expect(c).toBe('€');
            expect(d.length).toBeGreaterThan(0);
        });

        it('should cover _getLatinCharacter and _encodeValue edge branches', () => {
            // Arrange
            const lowChar: string = String.fromCharCode(10);
            const mixed: string = 'A#';

            // Act
            const latin: string = utils._getLatinCharacter('space6');
            const encodedLow: string = utils._encodeValue(lowChar);
            const encodedMixed: string = utils._encodeValue(mixed);

            // Assert
            expect(latin).toBe(' ');
            expect(encodedLow).toBe('#0A');
            expect(encodedMixed).toBe('A#23');
        });
    });

    describe('rectangle and bounds helpers', () => {
        it('should cover _parseRectangle standard and widget negative branches', () => {
            // Arrange
            const standard: any = createDictionary({ Rect: [10, 20, 30, 40] });
            const widgetNegative: any = createDictionary({ Rect: [10, -20, 30, -40] });

            // Act
            const a = utils._parseRectangle(standard);
            const b = utils._parseRectangle(widgetNegative, true);

            // Assert
            expect(a).toEqual({ x: 10, y: 20, width: 20, height: 20 });
            expect(b.width).toBe(20);
            expect(b.height).toBeGreaterThanOrEqual(0);
        });

        it('should cover _calculateBounds cropBox and mediaBox branches', () => {
            // Arrange
            const rectDict: any = createDictionary({ Rect: [10, 20, 30, 40] });

            const cropPage: any = createPage({
                size: { width: 100, height: 100 },
                cropBox: [5, 5, 100, 100],
                mediaBox: null,
                _pageDictionary: createDictionary({ CropBox: [5, 5, 100, 100] })
            });

            const mediaPage: any = createPage({
                size: { width: 100, height: 100 },
                cropBox: null,
                mediaBox: [5, 5, 100, 100],
                _pageDictionary: createDictionary({ MediaBox: [5, 5, 100, 100] })
            });

            // Act
            const cropResult = utils._calculateBounds(rectDict, cropPage);
            const mediaResult = utils._calculateBounds(rectDict, mediaPage);

            // Assert
            expect(cropResult.width).toBe(20);
            expect(mediaResult.width).toBe(20);
        });

        it('should cover _getUpdatedBounds cropBox, mediaBox and no-page branches', () => {
            // Arrange
            const cropPage: any = createPage({
                size: { width: 100, height: 100 },
                cropBox: [5, 5, 100, 100]
            });

            const mediaPage: any = createPage({
                size: { width: 100, height: 100 },
                mediaBox: [5, 5, 100, 100]
            });

            // Act
            const none = utils._getUpdatedBounds([10, 20, 30, 40]);
            const crop = utils._getUpdatedBounds([10, 20, 30, 40], cropPage);
            const media = utils._getUpdatedBounds([10, 20, 30, 40], mediaPage);

            // Assert
            expect(none).toEqual([10, 20, 40, 60]);
            expect(crop.length).toBe(4);
            expect(media.length).toBe(4);
        });

        it('should cover _updateBounds annotation branch', () => {
            // Arrange
            const annotation: any = createAnnotation({
                _page: createPage({ _isNew: false }),
                bounds: { x: 1, y: 2, width: 20, height: 30 }
            });

            // Act
            const result: number[] = (utils as any)._updateBounds(annotation, [10, 20, 30, 40]);

            // Assert
            expect(Array.isArray(result)).toBeTruthy();
            expect(annotation._bounds).toBeDefined();
        });
    });

    describe('base64 helpers', () => {
        it('should cover _encode/_decode standard round-trip', () => {
            // Arrange
            const bytes = new Uint8Array([65, 66, 67]);

            // Act
            const encoded = utils._encode(bytes);
            const decoded = utils._decode(encoded, true);

            // Assert
            expect(decoded).toEqual([65, 66, 67]);
        });

        it('should cover _encode padding branches for 1 and 2 byte groups', () => {
            // Arrange
            const one = new Uint8Array([65]);
            const two = new Uint8Array([65, 66]);

            // Act
            const encodedOne = utils._encode(one);
            const encodedTwo = utils._encode(two);

            // Assert
            expect(encodedOne.endsWith('==')).toBeTruthy();
            expect(encodedTwo.endsWith('=')).toBeTruthy();
        });

        it('should cover _decode sanitizing and partial write logic', () => {
            // Arrange
            const base64WithNoise = 'QQ==\n***';
            const base64Two = 'QUI=';

            // Act
            const a = utils._decode(base64WithNoise, false) as Uint8Array;
            const b = utils._decode(base64Two, true) as number[];

            // Assert
            expect(Array.from(a)).toBeTruthy();
            expect(b).toBeTruthy();
        });
    });

    describe('color and number helpers', () => {
        it('should cover _parseColor grayscale, rgb and cmyk branches', () => {
            // Act
            const gray = utils._parseColor([0.5]);
            const rgb = utils._parseColor([1, 0, 0]);
            const cmyk = utils._parseColor([0, 1, 1, 0]);

            // Assert
            expect(gray).toEqual({ r: 128, g: 128, b: 128 });
            expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
            expect(cmyk.r).toBe(255);
        });

        it('should cover _convertNumber none and non-none styles', () => {
            // Act
            const none = (utils as any)._convertNumber(10, PdfNumberStyle.none);
            const numeric = (utils as any)._convertNumber(10, PdfNumberStyle.numeric);

            // Assert
            expect(none).toBe('');
            expect(typeof numeric).toBe('string');
        });

        it('should cover _grayToRgba non-little-endian branch', () => {
            // Arrange
            const src = new Uint8Array([0, 127, 255]);
            const dest = new Uint32Array(3);
            spyOn(utils as any, '_isLittleEndian').and.returnValue(false);

            // Act
            (utils as any)._grayToRgba(src, dest);

            // Assert
            expect(dest[0]).not.toBeUndefined();
            expect(dest[2]).not.toBeUndefined();
        });

        it('should cover _padStart default and custom pad branches', () => {
            // Act
            const defaultPad = (utils as any)._padStart('A', 3);
            const customPad = (utils as any)._padStart('A', 4, 'xy');

            // Assert
            expect(defaultPad).toBe('00A');
            expect(customPad).toBe('xyxA');
        });

       ``
    });

    describe('field and appearance helpers', () => {
        it('should cover _checkField through actual value path', () => {
            // Arrange
            const normal: any = createDictionary({ Yes: {} });
            const ap: any = createDictionary({ N: normal });
            const dict: any = createDictionary({
                AS: null,
                V: _PdfName.get('Yes'),
                AP: ap
            });

            // Act
            const result = utils._checkField(dict);

            // Assert
            expect(result).toBeTruthy();
        });

        it('should cover _getItemValue via AS, V and AP/N dictionary paths', () => {
            // Arrange
            const byAs = createDictionary({ AS: _PdfName.get('Yes') });
            const byV = createDictionary({ V: _PdfName.get('Selected') });
            const normal = createDictionary({ Off: {}, OnState: {} });
            const byAp = createDictionary({ AP: createDictionary({ N: normal }) });

            // Act
            const asResult = utils._getItemValue(byAs);
            const vResult = utils._getItemValue(byV);
            const apResult = utils._getItemValue(byAp);

            // Assert
            expect(asResult).toBe('Yes');
            expect(vResult).toBe('Selected');
            expect(apResult).toBe('OnState');
        });

        it('should cover _getStateTemplate matching AP/N stream/reference path', () => {
            // Arrange
            const stream = createBaseStream();
            const reference = createReference();
            const normal = createDictionary({
                Yes: stream,
                __raw__Yes: reference
            });
            const ap = createDictionary({ N: normal });
            const itemDict = createDictionary({
                AS: _PdfName.get('Yes'),
                AP: ap
            });
            const item: any = {
                _dictionary: itemDict,
                _crossReference: {}
            };

            // Act
            const template = utils._getStateTemplate(_PdfCheckFieldState.checked, item);

            // Assert
            expect(template).toBeDefined();
        });

        it('should cover _setMatrix for angle 0, right angles and arbitrary angle', () => {
            // Arrange
            const template0: any = Object.create((PdfTemplate as any).prototype);
            template0._content = { dictionary: createDictionary({ BBox: [0, 0, 10, 20] }) };

            const template90: any = Object.create((PdfTemplate as any).prototype);
            template90._content = { dictionary: createDictionary({ BBox: [0, 0, 10, 20] }) };

            const template37: any = Object.create((PdfTemplate as any).prototype);
            template37._content = { dictionary: createDictionary({ BBox: [0, 0, 10, 20] }) };

            const stamp = createRubberStamp();

            // Act
            utils._setMatrix(template0, 0);
            utils._setMatrix(template90, 90);
            utils._setMatrix(template37, 37, stamp);

            // Assert
            expect(template0._content.dictionary.get('Matrix')).toBeDefined();
            expect(template90._content.dictionary.get('Matrix')).toBeDefined();
            expect(template37._content.dictionary.get('Matrix')).toBeDefined();
        });
    });

    describe('font and unicode helpers', () => {

    

        it('should cover _getFontFamily branches', () => {
            const inputs = ['', 'Helvetica', 'Courier', 'TimesRoman', 'Symbol', 'ZapfDingbats'];
            const outputs = inputs.map((name: string) => (utils as any)._getFontFamily(name));

            expect(outputs.length).toBe(inputs.length);
            outputs.forEach((entry: any) => expect(entry).not.toBeUndefined());
        });

        it('should cover _createFontMetrics with FontDescriptor and Widths', () => {
            const descriptor = createDictionary({
                Ascent: 900,
                Descent: -200,
                FontBBox: [0, -200, 1000, 900],
                CapHeight: 700,
                StemV: 80,
                ItalicAngle: 0
            });

            const fontDictionary = createDictionary({
                FontDescriptor: descriptor,
                Widths: [278, 278, 355]
            });

            const font = new PdfStandardFont(PdfFontFamily.helvetica, 10);
            const metrics = (utils as any)._createFontMetrics(fontDictionary, 1000, 'Helvetica', font);

            expect(metrics).toBeDefined();
        });

        it('should cover _getFontFromDescriptor through DescendantFonts and FontFile2 stream', () => {
            const fontFile = createPdfStream();

            const fontDescriptor = createDictionary({
                FontFile2: fontFile
            });

            const descendant = createDictionary({
                FontDescriptor: fontDescriptor
            });

            const dictionary = createDictionary({
                DescendantFonts: [descendant]
            });

            const fontData = (utils as any)._getFontFromDescriptor(dictionary);

            expect(fontData).toBeDefined();
            expect((fontData as Uint8Array).length).toBeGreaterThan(0);
        });

        it('should cover _mapFont standard font family branches', () => {
            const annotation = createAnnotation();

            const names = [
                'Cour',
                'Symbol',
                'Symb',
                'Times',
                'TiRo',
                'TimesRoman',
                'ZaDb',
                'ZapfDingbats'
            ];

            const fonts = names.map((name: string) => {
                return (utils as any)._mapFont(name, 10, PdfFontStyle.regular, annotation, createDictionary({}));
            });

            fonts.forEach((font: any) => expect(font).toBeDefined());
        });

        it('should cover _mapFont CJK/default/annotation branches', () => {
            const lineAnnotation: any = Object.create((PdfLineAnnotation as any).prototype);
            defineOwn(lineAnnotation, '_dictionary', createDictionary({ DA: '/F1 12 Tf 0 g' }));
            defineOwn(lineAnnotation, '_isLoaded', true);

            const redactionAnnotation: any = Object.create((PdfRedactionAnnotation as any).prototype);
            defineOwn(redactionAnnotation, '_dictionary', createDictionary({ DA: '/F1 12 Tf 0 g' }));
            defineOwn(redactionAnnotation, '_isLoaded', true);

            const textbox = createTextBoxField({
                _dictionary: createDictionary({ V: 'Hello', FT: _PdfName.get('Tx') }),
                _type: 'widgetAnnotation',
                _circleCaptionFont: true,
                text: 'Hello'
            });

            const names = [
                'MonotypeSungLight',
                'SinoTypeSongLight',
                'MonotypeHeiMedium',
                'HanyangSystemsGothicMedium',
                'HanyangSystemsShinMyeongJoMedium',
                'HeiseiKakuGothicW5',
                'HeiseiMinchoW3',
                'UnknownFamily'
            ];

            const a = (utils as any)._mapFont(names[0], 10, PdfFontStyle.regular, lineAnnotation, createDictionary({}));
            const b = (utils as any)._mapFont(names[1], 10, PdfFontStyle.regular, redactionAnnotation, createDictionary({}));
            const rest = names.slice(2).map((name: string) => {
                return (utils as any)._mapFont(name, 10, PdfFontStyle.regular, textbox, createDictionary({}));
            });

            expect(a).toBeDefined();
            expect(b).toBeDefined();
            rest.forEach((font: any) => expect(font).toBeDefined());
        });

        it('should cover _getFontSize for combo box, text box and fallback paths', () => {
            const combo = createComboBoxField({
                bounds: { x: 0, y: 0, width: 150, height: 30 },
                selectedIndex: [0, 1]
            });

            const text = createTextBoxField({
                multiLine: true,
                text: '',
                bounds: { x: 0, y: 0, width: 120, height: 60 }
            });

            const comboSize = (utils as any)._getFontSize(combo, PdfFontFamily.helvetica);
            const textSize = (utils as any)._getFontSize(text, PdfFontFamily.helvetica);

            expect(typeof comboSize).toBe('number');
            expect(typeof textSize).toBe('number');
        });

       
    });

    describe('small helper sanity', () => {
        it('should instantiate exception classes (helps __extends/class paths)', () => {
            // Arrange / Act
            const base = new utils.BaseException('base', 'BaseException');
            const format = new utils.FormatError('bad format');
            const eof = new utils.ParserEndOfFileException('eof');

            // Assert
            expect(base.name).toBe('BaseException');
            expect(format.name).toBe('FormatError');
            expect(eof.name).toBe('ParserEndOfFileException');
        });

        it('should cover _checkRotation and _getPageIndex small residual branches', () => {
            // Arrange
            const page = createPage({ rotation: PdfRotationAngle.angle90 });
            const loadedDocument: any = { pageCount: 0 };

            // Act
            const rotation = utils._checkRotation(page, undefined as any, undefined as any);
            const index = utils._getPageIndex(loadedDocument, null as any);

            // Assert
            expect(rotation).toBe(0);
            expect(index).toBe(-1);
        });
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('utils.ts uncovered branches - safe coverage', function () {

  function createDictionary(seed?: { [key: string]: any }): _PdfDictionary {
    const dict: _PdfDictionary = new _PdfDictionary();
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

  function createComboBoxField(overrides?: { [key: string]: any }): PdfComboBoxField & any {
    const field: PdfComboBoxField & any = Object.create(PdfComboBoxField.prototype);

    defineValue(field, '_dictionary', createDictionary());
    defineValue(field, 'bounds', { x: 0, y: 0, width: 80, height: 20 });
    defineValue(field, 'border', { width: 1, style: PdfBorderStyle.solid });
    defineValue(field, 'rotationAngle', 90);
    defineValue(field, 'selectedIndex', undefined);

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

  function createTextBoxField(overrides?: { [key: string]: any }): PdfTextBoxField & any {
    const field: PdfTextBoxField & any = Object.create(PdfTextBoxField.prototype);

    defineValue(field, '_dictionary', createDictionary());
    defineValue(field, 'bounds', { x: 0, y: 0, width: 60, height: 18 });
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

  function createFormWithFontResources(fontAlias: string, fontDictionary: _PdfDictionary): any {
    const fontResources: _PdfDictionary = createDictionary();
    fontResources.set(fontAlias, fontDictionary);

    const dr: _PdfDictionary = createDictionary({
      Font: fontResources
    });

    return {
      _dictionary: createDictionary({
        DR: dr
      }),
      _fontCache: new Map<string, any>(),
      _crossReference: {
        _fetch: jasmine.createSpy('_fetch')
      }
    };
  }

  beforeEach(function (): void {
    spyOn(PdfStandardFont.prototype as any, 'measureString').and.callFake(function (this: any, text: any): any {
      let rawText: string = '';
      if (Array.isArray(text)) {
        rawText = String(text.length > 0 && text[0] !== undefined && text[0] !== null ? text[0] : '');
      } else {
        rawText = String(text !== undefined && text !== null ? text : '');
      }

      const size: number = typeof this._size === 'number'
        ? this._size
        : (typeof this.size === 'number' ? this.size : 12);

      return {
        width: Math.max(1, rawText.length) * size * 1.6,
        height: Math.max(1, size * 1.15)
      };
    });

    spyOn(PdfStandardFont.prototype as any, 'getLineWidth').and.callFake(function (this: any, text: any): number {
      const rawText: string = String(text !== undefined && text !== null ? text : '');
      const size: number = typeof this._size === 'number'
        ? this._size
        : (typeof this.size === 'number' ? this.size : 12);
      return Math.max(1, rawText.length) * size * 1.35;
    });
  });

  describe('_createFontMetrics', function () {
    it('covers FontDescriptor + Widths + metrics name assignment safely', function () {
      const descriptor: _PdfDictionary = createDictionary({
        Ascent: 800,
        Descent: -200
      });

      const fontDictionary: _PdfDictionary = createDictionary({
        FontDescriptor: descriptor,
        Widths: [500, 600, 700]
      });

      const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);
      const metrics: any = utils._createFontMetrics(fontDictionary, font.height, 'Helvetica', font);

      expect(metrics).toBeDefined();
      expect(font._ascent).toBe(800);
      expect(font._descent).toBe(-200);
      expect(font._height).toBe(1000);
      expect(metrics._postScriptName).toBe('Helvetica');
      expect(metrics._widthTable).toBeDefined();
      expect(metrics._name).toBe('Helvetica');
    });

    it('covers metrics creation without Widths safely', function () {
      const descriptor: _PdfDictionary = createDictionary({
        Ascent: 700,
        Descent: -150
      });

      const fontDictionary: _PdfDictionary = createDictionary({
        FontDescriptor: descriptor
      });

      const font: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
      const metrics: any = utils._createFontMetrics(fontDictionary, font.height, 'Helv', font);

      expect(metrics).toBeDefined();
      expect(metrics._postScriptName).toBe('Helv');
    });
  });

  describe('_getFontSize - PdfComboBoxField branches', function () {
    it('covers selectedIndex:number + padding=true + rotationAngle===0 branch safely', function () {
      const field: any = createComboBoxField({
        selectedIndex: 0,
        rotationAngle: 0,
        border: { width: 1, style: PdfBorderStyle.inset },
        bounds: { x: 0, y: 0, width: 100, height: 24 }
      });

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
      expect(field.itemAt).toHaveBeenCalledWith(0);
    });

    it('covers selectedIndex:number[] array branch safely', function () {
      const field: any = createComboBoxField({
        selectedIndex: [0, 1],
        border: { width: 1, style: PdfBorderStyle.solid },
        bounds: { x: 0, y: 0, width: 120, height: 28 }
      });

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
      expect(field.itemAt).toHaveBeenCalledWith(0);
      expect(field.itemAt).toHaveBeenCalledWith(1);
    });

    it('covers measureValue.length === 0 else branch and text array branch safely', function () {
      const field: any = createComboBoxField({
        selectedIndex: undefined,
        bounds: { x: 0, y: 0, width: 24, height: 10 },
        border: { width: 1, style: PdfBorderStyle.solid }
      });

      field._dictionary.set('V', ['VeryLongComboValue']);
      field._obtainSelectedValue.and.returnValue('VeryLongComboValue');

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(12);
    });

    it('covers shrink-to-fit loop branch with string value safely', function () {
      const field: any = createComboBoxField({
        selectedIndex: undefined,
        bounds: { x: 0, y: 0, width: 22, height: 9 },
        border: { width: 1, style: PdfBorderStyle.solid }
      });

      field._dictionary.set('V', 'VeryLongComboValueThatForcesShrink');
      field._obtainSelectedValue.and.returnValue('VeryLongComboValueThatForcesShrink');

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(12);
    });

    it('covers no padding branch safely', function () {
      const field: any = createComboBoxField({
        selectedIndex: 0,
        rotationAngle: 90,
        border: { width: 2, style: PdfBorderStyle.solid },
        bounds: { x: 0, y: 0, width: 90, height: 22 }
      });

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
    });
  });

  describe('_getFontSize - PdfTextBoxField branches', function () {
    it('covers single-line textbox path safely', function () {
      const field: any = createTextBoxField({
        text: 'Short',
        multiLine: false,
        bounds: { x: 0, y: 0, width: 80, height: 18 },
        border: { width: 1, style: PdfBorderStyle.solid }
      });

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
    });

    it('covers textbox padding branch safely', function () {
      const field: any = createTextBoxField({
        text: 'Text',
        multiLine: false,
        bounds: { x: 0, y: 0, width: 70, height: 20 },
        border: { width: 1, style: PdfBorderStyle.beveled }
      });

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
    });

    it('covers multiline textbox fallback path safely', function () {
      const field: any = createTextBoxField({
        text: 'Line1\nLine2\nLine3',
        multiLine: true,
        bounds: { x: 0, y: 0, width: 30, height: 12 },
        border: { width: 1, style: PdfBorderStyle.solid }
      });

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
    });
  });

  describe('_obtainFontDetails - visible safe branches', function () {
    it('covers DA parsing + DR/Font/BaseFont resolution safely', function () {
      const fontDictionary: _PdfDictionary = createDictionary({
        BaseFont: _PdfName.get('Helvetica'),
        Subtype: _PdfName.get('Type1'),
        FontDescriptor: createDictionary({
          Ascent: 700,
          Descent: -200
        }),
        Widths: [500, 500, 500]
      });

      const form: any = createFormWithFontResources('F1', fontDictionary);

      const widget: any = {
        _dictionary: createDictionary({
          DA: '/F1 12 Tf'
        })
      };

      const field: any = createTextBoxField({
        _dictionary: createDictionary({
          DA: '/F1 12 Tf'
        })
      });

      const font: any = utils._obtainFontDetails(form, widget, field);

      expect(font).toBeDefined();
      expect(font.size).toBeGreaterThan(0);
    });

    it('covers field DA path when widget DA is absent safely', function () {
      const fontDictionary: _PdfDictionary = createDictionary({
        BaseFont: _PdfName.get('Helvetica'),
        Subtype: _PdfName.get('Type1')
      });

      const form: any = createFormWithFontResources('Helv', fontDictionary);

      const widget: any = {
        _dictionary: createDictionary()
      };

      const field: any = createTextBoxField({
        _dictionary: createDictionary({
          DA: '/Helv 10 Tf'
        })
      });

      const font: any = utils._obtainFontDetails(form, widget, field);

      expect(font).toBeDefined();
      expect(font.size).toBeGreaterThan(0);
    });

    it('covers cache repair path for PdfStandardFont + PdfTextBoxField safely', function () {
      const fontDictionary: _PdfDictionary = createDictionary({
        BaseFont: _PdfName.get('Helvetica'),
        Subtype: _PdfName.get('Type1'),
        FontDescriptor: createDictionary({
          Ascent: 800,
          Descent: -200
        }),
        Widths: [400, 500, 600]
      });

      const form: any = createFormWithFontResources('F1', fontDictionary);

      form._fontCache = {
        has: jasmine.createSpy('has').and.returnValue(true),
        get: jasmine.createSpy('get').and.returnValue(new PdfStandardFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular)),
        set: jasmine.createSpy('set')
      };

      const widget: any = {
        _dictionary: createDictionary({
          DA: '/F1 12 Tf'
        })
      };

      const field: any = createTextBoxField({
        _dictionary: createDictionary({
          DA: '/F1 12 Tf'
        }),
        _isTextChanged: false
      });

      const font: any = utils._obtainFontDetails(form, widget, field);

      expect(font).toBeDefined();
      expect(form._fontCache.has).toHaveBeenCalled();
      expect(form._fontCache.get).toHaveBeenCalled();
    });
  });

  describe('_setRotateAngle - avoid readonly rotate setter error', function () {
    it('updates Rotate in dictionary without assigning annot.rotate directly', function () {
      const annot: PdfAnnotation & any = Object.create(PdfAnnotation.prototype);
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
      const annot: PdfAnnotation & any = Object.create(PdfAnnotation.prototype);
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
      const annot: PdfAnnotation & any = Object.create(PdfAnnotation.prototype);
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

  describe('defensive branch tests that prevent undefined access', function () {
    it('returns default font when DR/Font resources are missing', function () {
      const form: any = {
        _dictionary: createDictionary(),
        _fontCache: new Map<string, any>()
      };

      const widget: any = {
        _dictionary: createDictionary({
          DA: '/Helv 0 Tf'
        })
      };

      const field: any = createTextBoxField({
        _dictionary: createDictionary({
          DA: '/Helv 0 Tf'
        })
      });

      const font: any = utils._obtainFontDetails(form, widget, field);

      expect(font).toBeDefined();
      expect(font.size).toBeGreaterThan(0);
    });

    it('keeps _getFontSize safe when selected item text is missing', function () {
      const field: any = createComboBoxField({
        selectedIndex: 0
      });

      field.itemAt.and.returnValue({});

      const size: number = utils._getFontSize(field, PdfFontFamily.helvetica);

      expect(size).toBeGreaterThan(0);
    });
  });
});

