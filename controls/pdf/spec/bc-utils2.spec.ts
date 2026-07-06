import * as util from '../src/pdf/core/utils'
import {
    _toUnsigned, _toSigned16, _copyRange,
    _annotationFlagsToString, _stringToAnnotationFlags,
    _stringToPdfString, _stringToBytes,
    _arePointsNotEqual, _bytesToString,
    _hexStringToByteArray, _hexStringToString,
    _decode, _encode,
    _getInheritableProperty,
    _parseRectangle, _calculateBounds, _getUpdatedBounds,
    _convertToColor, _parseColor,
    _reverseMapEndingStyle, _mapLineEndingStyle,
    _mapHighlightMode, _reverseMapHighlightMode
} from '../src/pdf/core/utils';

import {
    PdfAnnotationFlag,
    PdfLineEndingStyle,
    PdfHighlightMode,
    PdfFormFieldVisibility,
    PdfCheckBoxStyle,
    PdfMeasurementUnit,
    PdfTextMarkupAnnotationType,
    PdfRubberStampAnnotationIcon,
    PdfPopupIcon,
    PdfAnnotationState,
    PdfAnnotationStateModel,
    PdfAttachmentIcon,
    PdfAnnotationIntent,
    PdfBorderStyle
} from '../src/pdf/core/enumerator';

import { _PdfDictionary, _PdfName, _PdfReference, Dictionary } from '../src/pdf/core/pdf-primitives';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { _PdfStream } from '../src/pdf/core/base-stream';
import { PdfRubberStampAnnotation, PdfWidgetAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfFontFamily, PdfFontStyle, PdfStandardFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfComboBoxField, PdfField, PdfTextBoxField } from '../src/pdf/core/form/field';
import { PdfForm } from '../src/pdf/core/form/form';


describe('core util uncovered branches - behaviour / AAA tests', () => {

    function createDictionary(initial?: { [key: string]: unknown }): _PdfDictionary {
        const map: { [key: string]: unknown } = { ...(initial || {}) };
        const dict: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;
        (dict as unknown as { _map: { [key: string]: unknown } })._map = map;
        (dict as unknown as { _updated: boolean })._updated = false;

        (dict as unknown as { has: (key: string) => boolean }).has = (key: string): boolean =>
            Object.prototype.hasOwnProperty.call(map, key);

        (dict as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => map[`${key}`];

        (dict as unknown as { getArray: (key: string) => unknown[] }).getArray = (key: string): unknown[] =>
            map[`${key}`] as unknown[];

        (dict as unknown as { getRaw: (key: string) => unknown }).getRaw = (key: string): unknown => map[`${key}`];

        (dict as unknown as { set: (key: string, value: unknown) => void }).set = (key: string, value: unknown): void => {
            map[`${key}`] = value;
        };

        (dict as unknown as { update: (key: string, value: unknown) => void }).update =
            (key: string, value: unknown): void => {
                map[`${key}`] = value;
                (dict as unknown as { _updated: boolean })._updated = true;
            };

        (dict as unknown as { forEach: (callback: (key: string, value: unknown) => void) => void }).forEach =
            (callback: (key: string, value: unknown) => void): void => {
                Object.keys(map).forEach((key: string) => callback(key, map[`${key}`]));
            };

        Object.defineProperty(dict, 'size', {
            get: (): number => Object.keys(map).length,
            configurable: true
        });

        return dict;
    }

    function createReference(isNew: boolean = true): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        (reference as unknown as { _isNew: boolean })._isNew = isNew;
        return reference;
    }

    // function createStream(
    //     dictionary?: _PdfDictionary,
    //     bytes?: Uint8Array
    // ): _PdfStream {
    //     const stream: _PdfStream = Object.create(_PdfStream.prototype) as _PdfStream;
    //     const buffer: Uint8Array = bytes || new Uint8Array([1, 2, 3, 4]);

    //     (stream as unknown as { dictionary: _PdfDictionary }).dictionary = dictionary || createDictionary();
    //     (stream as unknown as { length: number }).length = buffer.length;
    //     (stream as unknown as { start: number }).start = 0;
    //     (stream as unknown as { end: number }).end = buffer.length;
    //     (stream as unknown as { buffer: Uint8Array }).buffer = buffer;

    //     (stream as unknown as { getByteRange: (start: number, end: number) => Uint8Array }).getByteRange =
    //         (start: number, end: number): Uint8Array => buffer.subarray(start, end);

    //     (stream as unknown as { getBytes: (length: number) => Uint8Array }).getBytes =
    //         (length: number): Uint8Array => buffer.subarray(0, length);

    //     return stream;
    // }

    function createStream(
        dictionary?: _PdfDictionary,
        bytes?: Uint8Array
    ): _PdfStream {
        const stream: _PdfStream = Object.create(_PdfStream.prototype) as _PdfStream;
        const buffer: Uint8Array = bytes || new Uint8Array([1, 2, 3, 4]);

        Object.defineProperty(stream, 'dictionary', {
            value: dictionary || createDictionary(),
            writable: true,
            configurable: true
        });

        Object.defineProperty(stream, 'length', {
            value: buffer.length,
            configurable: true
        });

        Object.defineProperty(stream, 'start', {
            value: 0,
            configurable: true
        });

        Object.defineProperty(stream, 'end', {
            value: buffer.length,
            configurable: true
        });

        Object.defineProperty(stream, 'buffer', {
            value: buffer,
            writable: true,
            configurable: true
        });

        Object.defineProperty(stream, 'getByteRange', {
            value: (start: number, end: number): Uint8Array => buffer.subarray(start, end),
            configurable: true
        });

        Object.defineProperty(stream, 'getBytes', {
            value: (length: number): Uint8Array => buffer.subarray(0, length),
            configurable: true
        });

        return stream;
    }

    function createRubberStampAnnotation(
        width: number,
        height: number,
        widthOffset: number = 0,
        heightOffset: number = 0
    ): PdfRubberStampAnnotation {
        const annotation: PdfRubberStampAnnotation = Object.create(
            PdfRubberStampAnnotation.prototype
        ) as PdfRubberStampAnnotation;

        (annotation as unknown as {
            bounds: { width: number; height: number };
        }).bounds = { width, height };

        // Safe transform function for while-loop convergence:
        // returned width/height change gradually as centerX/centerY change.
        (annotation as unknown as {
            _transformBBox: (
                bbox: { x: number; y: number; width: number; height: number },
                matrix: number[]
            ) => number[];
        })._transformBBox = (_bbox, matrix): number[] => {
            const tx: number = typeof matrix[4] === 'number' ? Number(matrix[4].toFixed(1)) : 0;
            const ty: number = typeof matrix[5] === 'number' ? Number(matrix[5].toFixed(1)) : 0;
            return [0, 0, Number((tx + widthOffset).toFixed(1)), Number((ty + heightOffset).toFixed(1))];
        };

        return annotation;
    }

    function createTemplate(bbox: number[]): PdfTemplate {
        const dictionary: _PdfDictionary = createDictionary({ BBox: bbox });
        const template: PdfTemplate = Object.create(PdfTemplate.prototype) as PdfTemplate;
        (template as unknown as { _content: { dictionary: _PdfDictionary } })._content = { dictionary };
        return template;
    }

    describe('_getColorValue', () => {
        it('should return RGB for known colors and leave unknown as undefined', () => {
            // Arrange
            const transparent: string = 'transparent';
            const blue: string = 'blue';
            const unknown: string = 'not-a-real-color';

            // Act
            const transparentValue: number[] = util._getColorValue(transparent);
            const blueValue: number[] = util._getColorValue(blue);
            const unknownValue: number[] = util._getColorValue(unknown);

            // Assert
            expect(transparentValue).toEqual([255, 255, 255]);
            expect(blueValue).toEqual([0, 0, 255]);
            expect(unknownValue).toBeUndefined();
        });
    });

    describe('_setMatrix', () => {
        it('should set identity translation matrix when angle is 0', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([10, 20, 50, 60]);

            // Act
            util._setMatrix(template, 0);

            // Assert
            const matrix: number[] = (template as unknown as { _content: { dictionary: _PdfDictionary } })
                ._content.dictionary.get('Matrix') as number[];
            expect(matrix).toEqual([1, 0, 0, 1, -10, -20]);
        });

        it('should set rotated matrix for 90 degrees', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([10, 20, 50, 60]);

            // Act
            util._setMatrix(template, 90);

            // Assert
            const matrix: number[] = (template as unknown as { _content: { dictionary: _PdfDictionary } })
                ._content.dictionary.get('Matrix') as number[];
            expect(Array.isArray(matrix)).toBeTruthy();
            expect(matrix.length).toBeGreaterThan(0);
        });

        it('should set rotated matrix for 180 degrees', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([10, 20, 50, 60]);

            // Act
            util._setMatrix(template, 180);

            // Assert
            const matrix: number[] = (template as unknown as { _content: { dictionary: _PdfDictionary } })
                ._content.dictionary.get('Matrix') as number[];
            expect(Array.isArray(matrix)).toBeTruthy();
            expect(matrix.length).toBeGreaterThan(0);
        });

        it('should set rotated matrix for 270 degrees and cover the 270 branch', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([10, 20, 50, 60]);

            // Act
            util._setMatrix(template, 270);

            // Assert
            const matrix: number[] = (template as unknown as { _content: { dictionary: _PdfDictionary } })
                ._content.dictionary.get('Matrix') as number[];
            expect(Array.isArray(matrix)).toBeTruthy();
            expect(matrix.length).toBeGreaterThan(0);
        });

        it('should safely cover the non-90-angle width/height increment while-loops without timeout', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([1, 1, 10, 10]);
            const annotation: PdfRubberStampAnnotation = createRubberStampAnnotation(0.3, 0.3);

            // Act
            util._setMatrix(template, 45, annotation);

            // Assert
            const matrix: number[] = (template as unknown as { _content: { dictionary: _PdfDictionary } })
                ._content.dictionary.get('Matrix') as number[];
            expect(Array.isArray(matrix)).toBeTruthy();
            expect(matrix.length).toBeGreaterThan(0);
        });

        it('should safely cover the non-90-angle width/height decrement while-loops without timeout', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([1, 1, 10, 10]);
            const annotation: PdfRubberStampAnnotation = createRubberStampAnnotation(0.0, 0.0, 0.9, 0.9);

            // Act
            util._setMatrix(template, 45, annotation);

            // Assert
            const matrix: number[] = (template as unknown as { _content: { dictionary: _PdfDictionary } })
                ._content.dictionary.get('Matrix') as number[];
            expect(Array.isArray(matrix)).toBeTruthy();
            expect(matrix.length).toBeGreaterThan(0);
        });

        it('should safely cover the width<=0 / height<=0 fallback while-loops without timeout', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([1, 1, 10, 10]);
            // Initial center is 0.1 => width/height become -0.1, then increments converge to target 0.2.
            const annotation: PdfRubberStampAnnotation = createRubberStampAnnotation(0.2, 0.2, -0.2, -0.2);

            // Act
            util._setMatrix(template, 45, annotation);

            // Assert
            const matrix: number[] = (template as unknown as { _content: { dictionary: _PdfDictionary } })
                ._content.dictionary.get('Matrix') as number[];
            expect(Array.isArray(matrix)).toBeTruthy();
            expect(matrix.length).toBeGreaterThan(0);
        });

        it('should cover the else branch when box0/box1 are zero', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([0, 0, 10, 10]);
            const annotation: PdfRubberStampAnnotation = createRubberStampAnnotation(8, 6);

            // Act
            util._setMatrix(template, 45, annotation);

            // Assert
            const matrix: number[] = (template as unknown as { _content: { dictionary: _PdfDictionary } })
                ._content.dictionary.get('Matrix') as number[];
            expect(Array.isArray(matrix)).toBeTruthy();
            expect(matrix.length).toBeGreaterThan(0);
        });

        it('should do nothing when bbox is missing', () => {
            // Arrange
            const template: PdfTemplate = Object.create(PdfTemplate.prototype) as PdfTemplate;
            (template as unknown as { _content: { dictionary: _PdfDictionary } })._content = {
                dictionary: createDictionary()
            };

            // Act
            util._setMatrix(template, 45);

            // Assert
            expect(
                (template as unknown as { _content: { dictionary: _PdfDictionary } })._content.dictionary.has('Matrix')
            ).toBeFalsy();
        });

        it('should do nothing when angle is undefined', () => {
            // Arrange
            const template: PdfTemplate = createTemplate([1, 1, 10, 10]);

            // Act
            util._setMatrix(template);

            // Assert
            expect(
                (template as unknown as { _content: { dictionary: _PdfDictionary } })._content.dictionary.has('Matrix')
            ).toBeFalsy();
        });
    });

    describe('_getCenterX / _getCenterY', () => {
        it('should return transformed width and height from annotation transform result', () => {
            // Arrange
            const annotation: PdfRubberStampAnnotation = createRubberStampAnnotation(1, 1, 0.4, 0.6);
            const bbox: number[] = [0, 0, 10, 20];

            // Act
            const centerX: number = util._getCenterX(45, bbox, 0.2, annotation);
            const centerY: number = util._getCenterY(45, bbox, 0.2, annotation);

            // Assert
            expect(typeof centerX).toBe('number');
            expect(typeof centerY).toBe('number');
        });
    });

    describe('_styleToString / _stringToStyle', () => {
        it('should map styles both ways and preserve default branches', () => {
            // Arrange / Act / Assert
            expect(util._styleToString(PdfCheckBoxStyle.circle)).toBe('l');
            expect(util._styleToString(PdfCheckBoxStyle.cross)).toBe('8');
            expect(util._styleToString(PdfCheckBoxStyle.diamond)).toBe('u');
            expect(util._styleToString(PdfCheckBoxStyle.square)).toBe('n');
            expect(util._styleToString(PdfCheckBoxStyle.star)).toBe('H');
            expect(util._styleToString(PdfCheckBoxStyle.check)).toBe('4');

            expect(util._stringToStyle('l')).toBe(PdfCheckBoxStyle.circle);
            expect(util._stringToStyle('8')).toBe(PdfCheckBoxStyle.cross);
            expect(util._stringToStyle('u')).toBe(PdfCheckBoxStyle.diamond);
            expect(util._stringToStyle('n')).toBe(PdfCheckBoxStyle.square);
            expect(util._stringToStyle('H')).toBe(PdfCheckBoxStyle.star);
            expect(util._stringToStyle('unknown')).toBe(PdfCheckBoxStyle.check);
        });
    });

    describe('measurement / markup / graphics / icon / state mappings', () => {
        it('should map measurement units including default', () => {
            // Arrange / Act / Assert
            expect(util._mapMeasurementUnit('cm')).toBe(PdfMeasurementUnit.centimeter);
            expect(util._mapMeasurementUnit('in')).toBe(PdfMeasurementUnit.inch);
            expect(util._mapMeasurementUnit('mm')).toBe(PdfMeasurementUnit.millimeter);
            expect(util._mapMeasurementUnit('p')).toBe(PdfMeasurementUnit.pica);
            expect(util._mapMeasurementUnit('pt')).toBe(PdfMeasurementUnit.point);
            expect(util._mapMeasurementUnit('unknown')).toBe(PdfMeasurementUnit.centimeter);
        });

        it('should map markup annotation types and reverse them including defaults', () => {
            // Arrange / Act / Assert
            expect(util._mapMarkupAnnotationType('Highlight')).toBe(PdfTextMarkupAnnotationType.highlight);
            expect(util._mapMarkupAnnotationType('Squiggly')).toBe(PdfTextMarkupAnnotationType.squiggly);
            expect(util._mapMarkupAnnotationType('StrikeOut')).toBe(PdfTextMarkupAnnotationType.strikeOut);
            expect(util._mapMarkupAnnotationType('Underline')).toBe(PdfTextMarkupAnnotationType.underline);
            expect(util._mapMarkupAnnotationType('Other')).toBe(PdfTextMarkupAnnotationType.highlight);

            expect(util._reverseMarkupAnnotationType(PdfTextMarkupAnnotationType.highlight)).toBe('Highlight');
            expect(util._reverseMarkupAnnotationType(PdfTextMarkupAnnotationType.squiggly)).toBe('Squiggly');
            expect(util._reverseMarkupAnnotationType(PdfTextMarkupAnnotationType.strikeOut)).toBe('StrikeOut');
            expect(util._reverseMarkupAnnotationType(PdfTextMarkupAnnotationType.underline)).toBe('Underline');
            expect(util._reverseMarkupAnnotationType(-1 as PdfTextMarkupAnnotationType)).toBe('Highlight');
        });

        it('should map graphics units including default', () => {
            // Arrange / Act / Assert
            expect(util._mapGraphicsUnit('cm')).toBeDefined();
            expect(util._mapGraphicsUnit('in')).toBeDefined();
            expect(util._mapGraphicsUnit('mm')).toBeDefined();
            expect(util._mapGraphicsUnit('p')).toBeDefined();
            expect(util._mapGraphicsUnit('pt')).toBeDefined();
            expect(util._mapGraphicsUnit('unknown')).toBeDefined();
        });

        it('should map rubber stamp icon with 23-prefix cleanup and default', () => {
            // Arrange / Act / Assert
            expect(util._mapRubberStampIcon('#Approved')).toBe(PdfRubberStampAnnotationIcon.approved);
            expect(util._mapRubberStampIcon('SBApproved')).toBe(PdfRubberStampAnnotationIcon.approved);
            expect(util._mapRubberStampIcon(' 23 SBApproved ')).toBe(PdfRubberStampAnnotationIcon.approved);
            expect(util._mapRubberStampIcon('Unknown')).toBe(PdfRubberStampAnnotationIcon.draft);
        });

        it('should map popup icon including default', () => {
            // Arrange / Act / Assert
            expect(util._mapPopupIcon('Note')).toBe(PdfPopupIcon.note);
            expect(util._mapPopupIcon('Comment')).toBe(PdfPopupIcon.comment);
            expect(util._mapPopupIcon('Help')).toBe(PdfPopupIcon.help);
            expect(util._mapPopupIcon('Insert')).toBe(PdfPopupIcon.insert);
            expect(util._mapPopupIcon('Key')).toBe(PdfPopupIcon.key);
            expect(util._mapPopupIcon('NewParagraph')).toBe(PdfPopupIcon.newParagraph);
            expect(util._mapPopupIcon('Paragraph')).toBe(PdfPopupIcon.paragraph);
            expect(util._mapPopupIcon('Unknown')).toBe(PdfPopupIcon.note);
        });

        it('should reverse annotation states including default branch', () => {
            // Arrange / Act / Assert
            expect(util._reverseMapAnnotationState(PdfAnnotationState.none)).toBe('None');
            expect(util._reverseMapAnnotationState(PdfAnnotationState.accepted)).toBe('Accepted');
            expect(util._reverseMapAnnotationState(PdfAnnotationState.rejected)).toBe('Rejected');
            expect(util._reverseMapAnnotationState(PdfAnnotationState.cancel)).toBe('Cancelled');
            expect(util._reverseMapAnnotationState(PdfAnnotationState.completed)).toBe('Completed');
            expect(util._reverseMapAnnotationState(PdfAnnotationState.marked)).toBe('Marked');
            expect(util._reverseMapAnnotationState(PdfAnnotationState.unmarked)).toBe('Unmarked');
            expect(util._reverseMapAnnotationState(PdfAnnotationState.unknown)).toBe('Unknown');
            expect(util._reverseMapAnnotationState(-1 as PdfAnnotationState)).toBe('None');
        });

        it('should map annotation states including uncovered cases and preserve default token', () => {
            // Arrange / Act / Assert
            expect(util._mapAnnotationState('None')).toBe(PdfAnnotationState.none);
            expect(util._mapAnnotationState('Accepted')).toBe(PdfAnnotationState.accepted);
            expect(util._mapAnnotationState('Rejected')).toBe(PdfAnnotationState.rejected);
            expect(util._mapAnnotationState('Cancelled')).toBe(PdfAnnotationState.cancel);
            expect(util._mapAnnotationState('Completed')).toBe(PdfAnnotationState.completed);
            expect(util._mapAnnotationState('Marked')).toBe(PdfAnnotationState.marked);
            expect(util._mapAnnotationState('Unmarked')).toBe(PdfAnnotationState.unmarked);
            expect(util._mapAnnotationState('Unknown')).toBe(PdfAnnotationState.unknown);
            expect(util._mapAnnotationState('No-Match')).toBe(PdfAnnotationState.none);
        });

        it('should reverse annotation state model including default branch', () => {
            // Arrange / Act / Assert
            expect(util._reverseMapAnnotationStateModel(PdfAnnotationStateModel.none)).toBe('None');
            expect(util._reverseMapAnnotationStateModel(PdfAnnotationStateModel.marked)).toBe('Marked');
            expect(util._reverseMapAnnotationStateModel(PdfAnnotationStateModel.review)).toBe('Review');
            expect(util._reverseMapAnnotationStateModel(-1 as PdfAnnotationStateModel)).toBe('None');
        });

        it('should map annotation state model including None branch', () => {
            // Arrange / Act / Assert
            expect(util._mapAnnotationStateModel('None')).toBe(PdfAnnotationStateModel.none);
            expect(util._mapAnnotationStateModel('Marked')).toBe(PdfAnnotationStateModel.marked);
            expect(util._mapAnnotationStateModel('Review')).toBe(PdfAnnotationStateModel.review);
            expect(util._mapAnnotationStateModel('NotMatched')).toBe(PdfAnnotationStateModel.none);
        });

        it('should map attachment icon including uncovered Tag, Paperclip and default', () => {
            // Arrange / Act / Assert
            expect(util._mapAttachmentIcon('PushPin')).toBe(PdfAttachmentIcon.pushPin);
            expect(util._mapAttachmentIcon('Tag')).toBe(PdfAttachmentIcon.tag);
            expect(util._mapAttachmentIcon('Graph')).toBe(PdfAttachmentIcon.graph);
            expect(util._mapAttachmentIcon('Paperclip')).toBe(PdfAttachmentIcon.paperClip);
            expect(util._mapAttachmentIcon('Unknown')).toBe(PdfAttachmentIcon.pushPin);
        });

        it('should map annotation intent including None and default', () => {
            // Arrange / Act / Assert
            expect(util._mapAnnotationIntent('None')).toBe(PdfAnnotationIntent.none);
            expect(util._mapAnnotationIntent('FreeTextCallout')).toBe(PdfAnnotationIntent.freeTextCallout);
            expect(util._mapAnnotationIntent('FreeTextTypeWriter')).toBe(PdfAnnotationIntent.freeTextTypeWriter);
            expect(util._mapAnnotationIntent('Unknown')).toBe(PdfAnnotationIntent.none);
        });
    });

    describe('_reverseMapPdfFontStyle', () => {
        it('should return Regular for empty style and combine all active style flags', () => {
            // Arrange / Act / Assert
            expect(util._reverseMapPdfFontStyle(PdfFontStyle.regular)).toBe('Regular');
            expect(util._reverseMapPdfFontStyle(PdfFontStyle.bold)).toBe('Bold');
            expect(util._reverseMapPdfFontStyle(PdfFontStyle.italic)).toBe('Italic');
            expect(util._reverseMapPdfFontStyle(PdfFontStyle.underline)).toBe('Underline');
            expect(util._reverseMapPdfFontStyle(PdfFontStyle.strikeout)).toBe('Strikeout');
            expect(
                util._reverseMapPdfFontStyle(
                    PdfFontStyle.bold | PdfFontStyle.italic | PdfFontStyle.underline | PdfFontStyle.strikeout
                )
            ).toBe('Bold, Italic, Underline, Strikeout');
        });
    });

    describe('_getSpecialCharacter', () => {
        const highlightedCases: Array<[string, string]> = [
            ['head2right', '\u27A2'],
            ['aacute', 'a\u0301'],
            ['eacute', 'e\u0301'],
            ['iacute', 'i\u0301'],
            ['oacute', 'o\u0301'],
            ['uacute', 'u\u0301'],
            ['circleright', '\u27B2'],
            ['bleft', '\u21E6'],
            ['bright', '\u21E8'],
            ['bup', '\u21E7'],
            ['bdown', '\u21E9'],
            ['barb4right', '\u2794'],
            ['bleftright', '\u2B04'],
            ['bupdown', '\u21F3'],
            ['telephonesolid', '\u2701'],
            ['telhandsetcirc', '\u2701'],
            ['envelopeback', '\u2701'],
            ['hourglass', '\u231B'],
            ['keyboard', '\u2328'],
            ['tapereel', '\u2707'],
            ['handwrite', '\u270D'],
            ['handv', '\u270C'],
            ['handptleft', '\u261C'],
            ['handptright', '\u261E'],
            ['handptup', '\u261D'],
            ['handptdown', '\u261F'],
            ['smileface', '\u263A'],
            ['frownface', '\u2639'],
            ['skullcrossbones', '\u2620'],
            ['flag', '\u2690'],
            ['pennant', '\u1F6A9'],
            ['airplane', '\u2708'],
            ['sunshine', '\u263C'],
            ['droplet', '\u1F4A7'],
            ['snowflake', '\u2744'],
            ['crossshadow', '\u271E'],
            ['crossmaltese', '\u2720'],
            ['starofdavid', '\u2721'],
            ['crescentstar', '\u262A'],
            ['yinyang', '\u262F'],
            ['om', '\u0950'],
            ['wheel', '\u2638'],
            ['aries', '\u2648'],
            ['taurus', '\u2649'],
            ['gemini', '\u264A'],
            ['rhombus6', '\u25C6'],
            ['xrhombus', '\u2756'],
            ['rhombus4', '\u2B25'],
            ['clear', '\u2327'],
            ['escape', '\u2353'],
            ['command', '\u2318'],
            ['rosette', '\u2740'],
            ['rosettesolid', '\u273F'],
            ['quotedbllftbld', '\u275D'],
            ['quotedblrtbld', '\u275E'],
            ['.notdef', '\u25AF'],
            ['zerosans', '\u24EA'],
            ['onesans', '\u2460'],
            ['twosans', '\u2461'],
            ['threesans', '\u2462'],
            ['foursans', '\u2463'],
            ['ring2', '\u25CB'],
            ['ringbutton2', '\u25C9'],
            ['target', '\u25CE'],
            ['square4', '\u25AA'],
            ['box2', '\u25FB'],
            ['crosstar2', '\u2726'],
            ['pentastar2', '\u2605'],
            ['hexstar2', '\u2736'],
            ['octastar2', '\u2734'],
            ['dodecastar3', '\u2739'],
            ['octastar4', '\u2735'],
            ['registercircle', '\u2316'],
            ['cuspopen', '\u27E1'],
            ['cuspopen1', '\u2311'],
            ['circlestar', '\u2605'],
            ['starshadow', '\u2730']
        ];

        highlightedCases.forEach(([input, expected]: [string, string]) => {
            it(`should map special character "${input}"`, () => {
                // Arrange

                // Act
                const result: string = util._getSpecialCharacter(input);

                // Assert
                expect(result).toBe(expected);
            });
        });

        it('should return input as-is for the default branch', () => {
            // Arrange
            const input: string = 'no-special-match';

            // Act
            const result: string = util._getSpecialCharacter(input);

            // Assert
            expect(result).toBe('no-special-match');
        });

        it('should cover grouped switch cases', () => {
            // Arrange / Act / Assert
            expect(util._getSpecialCharacter('prohibit')).toBe('\u29B8');
            expect(util._getSpecialCharacter('prohibitbld')).toBe('\u29B8');
            expect(util._getSpecialCharacter('ampersanditaldm')).toBe('\u0026');
            expect(util._getSpecialCharacter('ampersandbld')).toBe('\u0026');
            expect(util._getSpecialCharacter('ampersandsans')).toBe('\u0026');
            expect(util._getSpecialCharacter('ampersandsandm')).toBe('\u0026');
            expect(util._getSpecialCharacter('interrobang')).toBe('\u203D');
            expect(util._getSpecialCharacter('interrobangdm')).toBe('\u203D');
            expect(util._getSpecialCharacter('interrobangsans')).toBe('\u203D');
            expect(util._getSpecialCharacter('interrobngsandm')).toBe('\u203D');
        });
    });

    describe('_getLatinCharacter', () => {
        const highlightedCases: Array<[string, string]> = [
            ['breve', '˘'],
            ['brokenbar', '|'],
            ['bullet3', '•'],
            ['bullet', '•'],
            ['caron', 'ˇ'],
            ['ccedilla', 'ç'],
            ['cedilla', '¸'],
            ['cent', '¢'],
            ['circumflex', 'ˆ'],
            ['colon', ':'],
            ['comma', ','],
            ['copyright', '©'],
            ['currency1', '¤'],
            ['dagger', '†'],
            ['daggerdbl', '‡'],
            ['degree', '°'],
            ['eth', 'ð'],
            ['exclam', '!'],
            ['exclamdown', '¡'],
            ['florin', 'ƒ'],
            ['fraction', '⁄'],
            ['germandbls', 'ß'],
            ['grave', '`'],
            ['greater', '>'],
            ['guillemotleft4', '«'],
            ['guillemotright4', '»'],
            ['guilsinglleft', '‹'],
            ['guilsinglright', '›'],
            ['hungarumlaut', '˝'],
            ['hyphen5', '-'],
            ['iacute', 'í'],
            ['minus', '−'],
            ['mu', 'μ'],
            ['multiply', '×'],
            ['ntilde', 'ñ'],
            ['numbersign', '#'],
            ['oacute', 'ó'],
            ['ocircumflex', 'ô'],
            ['odieresis', 'ö'],
            ['oe', 'oe'],
            ['ogonek', '˛'],
            ['ograve', 'ò'],
            ['onehalf', '1/2'],
            ['onequarter', '1/4'],
            ['onesuperior', '¹'],
            ['ordfeminine', 'ª'],
            ['ordmasculine', 'º'],
            ['otilde', 'õ'],
            ['paragraph', '¶'],
            ['parenleft', '('],
            ['parenright', ')'],
            ['percent', '%'],
            ['period', '.'],
            ['periodcentered', '·'],
            ['perthousand', '‰'],
            ['plus', '+'],
            ['plusminus', '±'],
            ['question', '?'],
            ['questiondown', '¿'],
            ['quotedbl', '\''],
            ['quotedblbase', '„']
        ];

        highlightedCases.forEach(([input, expected]: [string, string]) => {
            it(`should map latin character "${input}"`, () => {
                // Arrange

                // Act
                const result: string = util._getLatinCharacter(input);

                // Assert
                expect(result).toBe(expected);
            });
        });

        it('should return input as-is for default branch', () => {
            // Arrange
            const input: string = 'no-latin-match';

            // Act
            const result: string = util._getLatinCharacter(input);

            // Assert
            expect(result).toBe('no-latin-match');
        });
    });

    describe('_encodeValue', () => {
        it('should encode reserved characters and low/high ascii values', () => {
            // Arrange
            const value: string = 'A B%()<>[]{}//#\u0001';

            // Act
            const result: string = util._encodeValue(value);

            // Assert
            expect(result).toContain('#20');
            expect(result).toContain('#25');
            expect(result).toContain('#28');
            expect(result).toContain('#29');
            expect(result).toContain('#3C');
            expect(result).toContain('#3E');
            expect(result).toContain('#5B');
            expect(result).toContain('#5D');
            expect(result).toContain('#7B');
            expect(result).toContain('#7D');
            expect(result).toContain('#2F');
            expect(result).toContain('#23');
            expect(result).toContain('#01');
        });

        it('should preserve regular printable characters', () => {
            // Arrange
            const value: string = 'AbcXYZ123';

            // Act
            const result: string = util._encodeValue(value);

            // Assert
            expect(result).toBe('AbcXYZ123');
        });
    });

    describe('_getCommentsOrReview', () => {
        it('should return review history when isReview is true and comments when false', () => {
            // Arrange
            const annotation: {
                reviewHistory: string[];
                comments: string[];
            } = {
                reviewHistory: ['r1'],
                comments: ['c1']
            };

            // Act
            const review: unknown = util._getCommentsOrReview(annotation as never, true);
            const comments: unknown = util._getCommentsOrReview(annotation as never, false);

            // Assert
            expect(review).toEqual(['r1']);
            expect(comments).toEqual(['c1']);
        });
    });

    describe('_checkReview / _checkComment', () => {
        it('should detect review dictionaries', () => {
            // Arrange
            const review30: _PdfDictionary = createDictionary({ F: 30, State: 'Accepted' });
            const review128: _PdfDictionary = createDictionary({ F: 128, StateModel: 'Review' });
            const invalid: _PdfDictionary = createDictionary({ F: 29, State: 'Accepted' });

            // Act / Assert
            expect(util._checkReview(review30)).toBeTruthy();
            expect(util._checkReview(review128)).toBeTruthy();
            expect(util._checkReview(invalid)).toBeFalsy();
        });

        it('should detect comment dictionaries including flag 128 branch', () => {
            // Arrange
            const comment28: _PdfDictionary = createDictionary({ F: 28 });
            const comment128: _PdfDictionary = createDictionary({ F: 128 });
            const invalidWithState: _PdfDictionary = createDictionary({ F: 28, State: 'Accepted' });

            // Act / Assert
            expect(util._checkComment(comment28)).toBeTruthy();
            expect(util._checkComment(comment128)).toBeTruthy();
            expect(util._checkComment(invalidWithState)).toBeFalsy();
        });
    });

    describe('_updateVisibility', () => {
        it('should replace F with hidden flag when hidden visibility is used', () => {
            // Arrange
            const dictionary: _PdfDictionary = createDictionary({ F: 999 });

            // Act
            util._updateVisibility(dictionary, PdfFormFieldVisibility.hidden);

            // Assert
            expect(dictionary.get('F')).toBe(PdfAnnotationFlag.hidden as number);
            expect((dictionary as unknown as { _updated: boolean })._updated).toBeTruthy();
        });

        it('should replace F with noView|print when hiddenPrintable visibility is used', () => {
            // Arrange
            const dictionary: _PdfDictionary = createDictionary({ F: 999 });

            // Act
            util._updateVisibility(dictionary, PdfFormFieldVisibility.hiddenPrintable);

            // Assert
            expect(dictionary.get('F')).toBe((PdfAnnotationFlag.noView | PdfAnnotationFlag.print) as number);
        });

        it('should clear DV and MK.BG for visible visibility branch', () => {
            // Arrange
            const mk: _PdfDictionary = createDictionary({ BG: [1, 2, 3] });
            const dictionary: _PdfDictionary = createDictionary({
                F: 123,
                DV: 'old-default',
                MK: mk
            });

            // Act
            util._updateVisibility(dictionary, PdfFormFieldVisibility.visible);

            // Assert
            expect(dictionary.has('DV')).toBeFalsy();
            expect(mk.has('BG')).toBeFalsy();
            expect((mk as unknown as { _updated: boolean })._updated).toBeTruthy();
        });
    });

    describe('_defaultToString', () => {
        it('should prefix strings with $s and others with $o', () => {
            // Arrange / Act / Assert
            expect(util._defaultToString('abc')).toBe('$sabc');
            expect(util._defaultToString(123)).toBe('$o123');
            expect(util._defaultToString(true)).toBe('$otrue');
        });
    });

    describe('_getFontFamily', () => {
        it('should map all highlighted font families and default', () => {
            // Arrange / Act / Assert
            expect(util._getFontFamily('Helv')).toBe(PdfFontFamily.helvetica);
            expect(util._getFontFamily('Helvetica')).toBe(PdfFontFamily.helvetica);
            expect(util._getFontFamily('Cour')).toBe(PdfFontFamily.courier);
            expect(util._getFontFamily('Courier')).toBe(PdfFontFamily.courier);
            expect(util._getFontFamily('Symb')).toBe(PdfFontFamily.symbol);
            expect(util._getFontFamily('Symbol')).toBe(PdfFontFamily.symbol);
            expect(util._getFontFamily('Times')).toBe(PdfFontFamily.timesRoman);
            expect(util._getFontFamily('TiRo')).toBe(PdfFontFamily.timesRoman);
            expect(util._getFontFamily('TimesRoman')).toBe(PdfFontFamily.timesRoman);
            expect(util._getFontFamily('ZaDb')).toBe(PdfFontFamily.zapfDingbats);
            expect(util._getFontFamily('ZapfDingbats')).toBe(PdfFontFamily.zapfDingbats);
            expect(util._getFontFamily('Helvetica-Bold')).toBe(PdfFontFamily.helvetica);
            expect(util._getFontFamily('Unknown')).toBe(PdfFontFamily.helvetica);
        });
    });

    describe('_getFontStyle', () => {
        it('should cover hyphen/comma parsing and all highlighted style branches', () => {
            // Arrange / Act / Assert
            expect(util._getFontStyle('Helvetica')).toBe(PdfFontStyle.regular);
            expect(util._getFontStyle('Helvetica-Bold')).toBe(PdfFontStyle.bold);
            expect(util._getFontStyle('Helvetica-BoldMT')).toBe(PdfFontStyle.bold);
            expect(util._getFontStyle('Helvetica-Italic')).toBe(PdfFontStyle.italic);
            expect(util._getFontStyle('Helvetica-ItalicMT')).toBe(PdfFontStyle.italic);
            expect(util._getFontStyle('Helvetica-Oblique')).toBe(PdfFontStyle.italic);
            expect(util._getFontStyle('Helvetica-It')).toBe(PdfFontStyle.italic);
            expect(util._getFontStyle('Helvetica-BoldItalic')).toBe(PdfFontStyle.bold | PdfFontStyle.italic);
            expect(util._getFontStyle('Helvetica-BoldItalicMT')).toBe(PdfFontStyle.bold | PdfFontStyle.italic);
            expect(util._getFontStyle('Helvetica-BoldOblique')).toBe(PdfFontStyle.bold | PdfFontStyle.italic);
            expect(util._getFontStyle('Helvetica,Bold')).toBe(PdfFontStyle.bold);
        });
    });

    describe('_getFontSize', () => {
        it('should return 12.5 for multiline textbox branch', () => {
            // Arrange
            const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

            Object.defineProperty(field, 'bounds', {
                value: { width: 150, height: 50 },
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'border', {
                value: { width: 1, style: PdfBorderStyle.solid },
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'text', {
                value: 'line 1\nline 2',
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'multiLine', {
                value: true,
                writable: true,
                configurable: true
            });

            // Act
            const size: number = util._getFontSize(field, PdfFontFamily.helvetica);

            // Assert
            expect(size).toBe(12.5);
        });


        it('should calculate size for single-line textbox branch', () => {
            // Arrange
            const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

            Object.defineProperty(field, 'bounds', {
                value: { width: 200, height: 30 },
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'border', {
                value: { width: 1, style: PdfBorderStyle.inset },
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'text', {
                value: 'textbox',
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'multiLine', {
                value: false,
                writable: true,
                configurable: true
            });

            // Act
            const size: number = util._getFontSize(field, PdfFontFamily.helvetica);

            // Assert
            expect(size).toBeGreaterThan(0);
        });
        it('should cover catch block for textbox and return 8 for single-line textbox on error', () => {
            // Arrange
            const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;

            Object.defineProperty(field, 'bounds', {
                value: { width: 200, height: 30 },
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'border', {
                value: { width: 1, style: PdfBorderStyle.solid },
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'multiLine', {
                value: false,
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'text', {
                get(): string {
                    throw new Error('forced textbox failure');
                },
                configurable: true
            });

            // Act
            const size: number = util._getFontSize(field, PdfFontFamily.helvetica);

            // Assert
            expect(size).toBe(8);
        });
        // ...existing code...
        it('should clamp combobox size to 12 when computed size exceeds 12 and no selected value is returned', () => {
            // Arrange
            const field: PdfComboBoxField = Object.create(PdfComboBoxField.prototype) as PdfComboBoxField;

            Object.defineProperty(field, 'bounds', {
                value: { width: 500, height: 200 },
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'border', {
                value: { width: 1, style: PdfBorderStyle.solid },
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'rotationAngle', {
                value: 0,
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'selectedIndex', {
                value: 0,
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, 'itemAt', {
                value: (_index: number): { text: string } => ({ text: 'A' }),
                writable: true,
                configurable: true
            });

            Object.defineProperty(field, '_obtainSelectedValue', {
                value: (): string => '',
                writable: true,
                configurable: true
            });

            // Act
            const size: number = util._getFontSize(field, PdfFontFamily.helvetica);

            // Assert
            expect(size).toBe(12);
        });
        // ...existing code...
    });

    describe('_getFontFromDescriptor', () => {

        it('should read font data from direct FontDescriptor with wrapped stream object using Length1', () => {
            // Arrange
            const wrapped: {
                stream: boolean;
                dictionary: _PdfDictionary;
                buffer: Uint8Array;
                getBytes: (length: number) => Uint8Array;
            } = {
                stream: true,
                dictionary: createDictionary({ Length1: 3 }),
                buffer: new Uint8Array([9, 8, 7, 6]),
                getBytes(length: number): Uint8Array {
                    return this.buffer.subarray(0, length);
                }
            };
            const fontDescriptor: _PdfDictionary = createDictionary({ FontFile2: wrapped });
            const fontDictionary: _PdfDictionary = createDictionary({ FontDescriptor: fontDescriptor });

            // Act
            const data: Uint8Array = util._getFontFromDescriptor(fontDictionary);

            // Assert
            expect(Array.from(data)).toEqual([9, 8, 7]);
        });
    });



    describe('_hasSharedFontResource', () => {
        it('should return true when appearance font resource key exists in form resources', () => {
            // Arrange
            const appearanceFontResources: _PdfDictionary = createDictionary({
                F1: createReference(false)
            });

            const resources: _PdfDictionary = createDictionary({
                Font: appearanceFontResources
            });

            const normalStream: _PdfStream = createStream(createDictionary({ Resources: resources }));
            const appearance: _PdfDictionary = createDictionary({ N: normalStream });

            const formDictionary: _PdfDictionary = createDictionary({
                DR: createDictionary({
                    Font: createDictionary({
                        F1: createDictionary()
                    })
                })
            });

            const form: PdfForm = Object.create(PdfForm.prototype) as PdfForm;
            Object.defineProperty(form, '_dictionary', {
                value: formDictionary,
                writable: true,
                configurable: true
            });
            Object.defineProperty(form, '_fontResources', {
                value: undefined,
                writable: true,
                configurable: true
            });

            const field: PdfField = Object.create(PdfField.prototype) as PdfField;
            Object.defineProperty(field, '_dictionary', {
                value: createDictionary({ AP: appearance }),
                writable: true,
                configurable: true
            });
            Object.defineProperty(field, 'form', {
                value: form,
                configurable: true
            });

            // Act
            const result: boolean = util._hasSharedFontResource(field);

            // Assert
            expect(result).toBeTruthy();
        });

        it('should return false when no shared font resource exists', () => {
            // Arrange
            const emptyForm: PdfForm = Object.create(PdfForm.prototype) as PdfForm;
            Object.defineProperty(emptyForm, '_dictionary', {
                value: createDictionary(),
                writable: true,
                configurable: true
            });

            const field: PdfField = Object.create(PdfField.prototype) as PdfField;
            Object.defineProperty(field, '_dictionary', {
                value: createDictionary(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(field, 'form', {
                value: emptyForm,
                configurable: true
            });

            // Act
            const result: boolean = util._hasSharedFontResource(field);

            // Assert
            expect(result).toBeFalsy();
        });
    });


    describe('_tryParseFontStream', () => {
        it('should parse font stream from appearance font resources via cross-reference fetch', () => {
            // Arrange
            const fontFileStream: _PdfStream = createStream(undefined, new Uint8Array([1, 2, 3]));
            const fetchedDictionary: _PdfDictionary = createDictionary({
                FontDescriptor: createDictionary({
                    FontFile2: fontFileStream
                })
            });

            const reference: _PdfReference = createReference(false);
            const appearanceFontResources: _PdfDictionary = createDictionary({
                F1: reference
            });

            const resources: _PdfDictionary = createDictionary({
                Font: appearanceFontResources
            });

            const normalStream: _PdfStream = createStream(createDictionary({ Resources: resources }));
            const appearance: _PdfDictionary = createDictionary({ N: normalStream });

            const annotation: PdfField = Object.create(PdfField.prototype) as PdfField;
            Object.defineProperty(annotation, '_dictionary', {
                value: createDictionary({ AP: appearance }),
                writable: true,
                configurable: true
            });

            const crossReference: {
                _fetch: (ref: _PdfReference) => _PdfDictionary;
            } = {
                _fetch: (_ref: _PdfReference): _PdfDictionary => fetchedDictionary
            };

            // Act
            const data: Uint8Array = util._tryParseFontStream(crossReference as never, annotation);

            // Assert
            expect(Array.from(data)).toEqual([1, 2, 3]);
        });

        it('should fall back to form DR Font resources when appearance font is absent', () => {
            // Arrange
            const fontFileStream: _PdfStream = createStream(undefined, new Uint8Array([5, 6, 7]));
            const fontDictionary: _PdfDictionary = createDictionary({
                FontDescriptor: createDictionary({
                    FontFile2: fontFileStream
                })
            });

            const formDictionary: _PdfDictionary = createDictionary({
                DR: createDictionary({
                    Font: createDictionary({
                        Helv: fontDictionary
                    })
                })
            });

            const form: PdfForm = Object.create(PdfForm.prototype) as PdfForm;
            Object.defineProperty(form, '_dictionary', {
                value: formDictionary,
                writable: true,
                configurable: true
            });

            const field: PdfField = Object.create(PdfField.prototype) as PdfField;
            Object.defineProperty(field, '_dictionary', {
                value: createDictionary(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(field, 'form', {
                value: form,
                configurable: true
            });

            // Act
            const data: Uint8Array = util._tryParseFontStream(
                { _fetch: (): _PdfDictionary => createDictionary() } as never,
                field,
                'Helv'
            );

            // Assert
            expect(Array.from(data)).toEqual([5, 6, 7]);
        });
    });


    describe('_obtainFontDetails', () => {


        it('should return a standard font using field DA when fontFamily is mapped and fontSize is 0', () => {
            // Arrange
            const fontDictionary: _PdfDictionary = createDictionary({
                BaseFont: new _PdfName('Helvetica'),
                Subtype: new _PdfName('Type1')
            });

            const formResources: _PdfDictionary = createDictionary({
                Font: createDictionary({
                    Helv: fontDictionary
                })
            });

            const form: PdfForm = Object.create(PdfForm.prototype) as PdfForm;
            Object.defineProperty(form, '_dictionary', {
                value: createDictionary({ DR: formResources }),
                writable: true,
                configurable: true
            });
            Object.defineProperty(form, '_fontCache', {
                value: new Map<string, unknown>(),
                writable: true,
                configurable: true
            });

            const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
            Object.defineProperty(field, '_dictionary', {
                value: createDictionary({
                    DA: '/Helv 0 Tf',
                    V: 'abc'
                }),
                writable: true,
                configurable: true
            });
            Object.defineProperty(field, 'bounds', {
                value: { width: 120, height: 20 },
                writable: true,
                configurable: true
            });
            Object.defineProperty(field, 'border', {
                value: {
                    width: 1,
                    style: PdfBorderStyle.solid
                },
                writable: true,
                configurable: true
            });
            Object.defineProperty(field, 'text', {
                value: 'abc',
                writable: true,
                configurable: true
            });
            Object.defineProperty(field, 'multiLine', {
                value: false,
                writable: true,
                configurable: true
            });
            Object.defineProperty(field, '_circleCaptionFont', {
                value: new PdfStandardFont(PdfFontFamily.helvetica, 8),
                writable: true,
                configurable: true
            });

            const widget: PdfWidgetAnnotation = Object.create(PdfWidgetAnnotation.prototype) as PdfWidgetAnnotation;
            Object.defineProperty(widget, '_dictionary', {
                value: createDictionary(),
                writable: true,
                configurable: true
            });
            Object.defineProperty(widget, '_field', {
                value: undefined,
                writable: true,
                configurable: true
            });
            Object.defineProperty(widget, '_circleCaptionFont', {
                value: new PdfStandardFont(PdfFontFamily.helvetica, 8),
                writable: true,
                configurable: true
            });

            // Act
            const font = util._obtainFontDetails(form, widget, field);

            // Assert
            expect(font).toBeDefined();
            expect(font.size).toBeGreaterThan(0);
        });

        it('should return circle caption font when final font is undefined or size 1', () => {
            // Arrange
            const form: PdfForm = Object.create(PdfForm.prototype) as PdfForm;
            (form as unknown as { _dictionary: _PdfDictionary; _fontCache: Map<string, unknown> })._dictionary =
                createDictionary();
            (form as unknown as { _fontCache: Map<string, unknown> })._fontCache = new Map<string, unknown>();

            const field: PdfTextBoxField = Object.create(PdfTextBoxField.prototype) as PdfTextBoxField;
            const fallback: PdfStandardFont = new PdfStandardFont(PdfFontFamily.helvetica, 9);

            (field as unknown as {
                _dictionary: _PdfDictionary;
                _circleCaptionFont: PdfStandardFont;
            })._dictionary = createDictionary();
            (field as unknown as { _circleCaptionFont: PdfStandardFont })._circleCaptionFont = fallback;

            const widget: PdfWidgetAnnotation = Object.create(PdfWidgetAnnotation.prototype) as PdfWidgetAnnotation;
            (widget as unknown as { _dictionary: _PdfDictionary; _field?: unknown; _circleCaptionFont: PdfStandardFont })._dictionary =
                createDictionary();
            (widget as unknown as { _field?: unknown })._field = undefined;
            (widget as unknown as { _circleCaptionFont: PdfStandardFont })._circleCaptionFont = fallback;

            // Act
            const font = util._obtainFontDetails(form, widget, field);

            // Assert
            expect(font).toBe(fallback);
        });
    });
});
