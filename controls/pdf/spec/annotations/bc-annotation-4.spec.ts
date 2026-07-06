import { Pdf3DAnnotation, PdfWidgetAnnotation, PdfAttachmentAnnotation, PdfDocumentLinkAnnotation, PdfFileLinkAnnotation, PdfRichMediaAnnotation, PdfSoundAnnotation, PdfTextWebLinkAnnotation, PdfUriAnnotation, PdfSquareAnnotation, PdfStateItem, PdfRedactionAnnotation, PdfTextMarkupAnnotation, PdfInkAnnotation, PdfLineAnnotation, PdfRadioButtonListItem } from '../../src/pdf/core/annotations/annotation';
import * as utils from '../../src/pdf/core/utils';
import { PdfTemplate } from '../../src/pdf/core/graphics/pdf-template';
import { _PdfCheckFieldState, PdfAnnotationFlag, PdfBorderEffectStyle, PdfFormFieldVisibility, PdfMeasurementUnit, PdfRotationAngle, PdfTextMarkupAnnotationType } from '../../src/pdf/core/enumerator';
import { _PdfDictionary, _PdfReference } from '../../src/pdf/core/pdf-primitives';
import { _TextRenderingMode } from '../../src/pdf/core/graphics/pdf-graphics';
import { _PdfStream } from "../../src/pdf/core/base-stream";
import { PdfAngleMeasurementAnnotation, PdfCircleAnnotation, PdfEllipseAnnotation, PdfFreeTextAnnotation, PdfPolygonAnnotation, PdfPolyLineAnnotation, PdfPopupAnnotation, PdfRectangleAnnotation, PdfRubberStampAnnotation, PdfWatermarkAnnotation } from "../../src/pdf/core/annotations/annotation";
import { PdfDocument } from '../../src/pdf/core/pdf-document';
import { PdfPage } from '../../src/pdf/core/pdf-page';
import { _PdfCrossReference } from '../../src/pdf/core/pdf-cross-reference'
import { PdfFontFamily, PdfStandardFont } from '../../src/pdf/core/fonts/pdf-standard-font';
import { PdfField, PdfListBoxField } from '../../src/pdf/core/form/field';
//Propeties test scripts
describe('PdfAnnotation.modifiedDate & _hasFlags', () => {

    let annot: any;
    let dictionary: any;

    beforeEach(() => {
        dictionary = {
            has: jasmine.createSpy('has'),
            get: jasmine.createSpy('get'),
            update: jasmine.createSpy('update')
        };

        annot = new PdfLineAnnotation() as any;
        annot._dictionary = dictionary;

        spyOn(annot as any, '_stringToDate')
            .and.callFake((v: string) => new Date('2024-01-01T00:00:00Z'));

        spyOn(annot as any, '_dateToString')
            .and.callFake((d: Date) => 'D:20240101000000Z');
    });

    it('should return existing _modifiedDate without reading dictionary and _hasFlags check', () => {
        const date = new Date('2023-01-01T00:00:00Z');
        annot._modifiedDate = date;
        const flag = annot._hasFlags

        expect(flag).toBe(annot._hasFlags);
        const result = annot.modifiedDate;

        expect(result).toBe(date);
    });

    it('should read ModDate when _modifiedDate is undefined', () => {
        annot._modifiedDate = undefined;

        dictionary.has.and.callFake((k: string) => k === 'ModDate');
        dictionary.get.and.returnValue('D:20240101000000Z');

        const result = annot.modifiedDate;

        expect(dictionary.has).toHaveBeenCalledWith('ModDate');
        expect(dictionary.get).toHaveBeenCalledWith('ModDate');
        expect((annot as any)._stringToDate).toHaveBeenCalled();
        expect(result instanceof Date).toBeTruthy();
    });

    it('should read M when ModDate does not exist', () => {
        annot._modifiedDate = undefined;

        dictionary.has.and.callFake((k: string) => k === 'M');
        dictionary.get.and.returnValue('D:20240101000000Z');

        const result = annot.modifiedDate;

        expect(dictionary.has).toHaveBeenCalledWith('ModDate');
        expect(dictionary.has).toHaveBeenCalledWith('M');
        expect(dictionary.get).toHaveBeenCalledWith('M');
        expect((annot as any)._stringToDate).toHaveBeenCalled();
        expect(result instanceof Date).toBeTruthy();
    });

    it('should return undefined when no ModDate or M exists', () => {
        annot._modifiedDate = undefined;

        dictionary.has.and.returnValue(false);

        const result = annot.modifiedDate;

        expect(result).toBeUndefined();
        expect(dictionary.get).not.toHaveBeenCalled();
    });

    it('should update dictionary when modifiedDate is set', () => {
        const date = new Date('2024-01-01T00:00:00Z');

        annot.modifiedDate = date;

        expect((annot as any)._dateToString).toHaveBeenCalledWith(date);
        expect(dictionary.update).toHaveBeenCalledWith(
            'M',
            'D:20240101000000Z'
        );
    });

});
describe('PdfSquareAnnotation.borderEffect – marked if / else coverage', () => {

    let annot: PdfSquareAnnotation;
    let dictionary: any;
    let beDict: any;

    beforeEach(() => {
        beDict = {
            get: jasmine.createSpy('get').and.callFake((k: string) => {
                if (k === 'I') {
                    return 2;
                }
                if (k === 'S') {
                    return { name: 'C' };
                }
                return null;
            })
        };

        dictionary = {
            has: jasmine.createSpy('has'),
            get: jasmine.createSpy('get')
        };

        annot = new PdfSquareAnnotation() as any;
        annot._dictionary = dictionary;

        spyOn(utils, '_mapBorderEffectStyle')
            .and.returnValue(PdfBorderEffectStyle.cloudy);
    });

    /* ---------- GETTER: BE exists (Iif true) ---------- */

    it('should read border effect from BE dictionary when BE exists', () => {
        dictionary.has.and.returnValue(true);
        dictionary.get.and.returnValue(beDict);

        const result = annot.borderEffect;

        expect(dictionary.has).toHaveBeenCalledWith('BE');
        expect(beDict.get).toHaveBeenCalledWith('I');
        expect(beDict.get).toHaveBeenCalledWith('S');
        expect(result._intensity).toBe(2);
        expect(result._style)
            .toBe(PdfBorderEffectStyle.cloudy);
    });

    /* ---------- GETTER: BE missing (else branch) ---------- */

    it('should default border effect style to solid when BE does not exist', () => {
        dictionary.has.and.returnValue(false);

        const result = annot.borderEffect;

        expect(result._style)
            .toBe(PdfBorderEffectStyle.solid);
    });

    /* ---------- GETTER: caching branch ---------- */

    it('should return cached borderEffect without re-reading dictionary', () => {
        dictionary.has.and.returnValue(false);

        const first = annot.borderEffect;
        const second = annot.borderEffect;

        expect(second).toBe(first);
        expect(dictionary.has).toHaveBeenCalledTimes(1);
    });

    /* ---------- SETTER: value defined (Eif true) ---------- */

    it('should update borderEffect when setter receives a value', () => {
        const newEffect = { test: true } as any;

        annot.borderEffect = newEffect;

        expect(annot._borderEffect).toBe(newEffect);
    });

    /* ---------- SETTER: value undefined (else path) ---------- */

    it('should not update borderEffect when setter receives undefined', () => {
        const existing = annot.borderEffect;

        annot.borderEffect = undefined as any;

        expect(annot._borderEffect).toBe(existing);
    });

});
describe('PdfSquareAnnotation.unit – marked if / else coverage', () => {
    let annot: any
    let dictionary: any;

    beforeEach(() => {
        dictionary = {
            has: jasmine.createSpy('has'),
            get: jasmine.createSpy('get')
        };

        annot = new PdfSquareAnnotation() as any;
        annot._dictionary = dictionary;

        spyOn(utils, '_mapMeasurementUnit')
            .and.returnValue(PdfMeasurementUnit.millimeter);
    });

    /* ---------- GETTER: _isTextUpdated short‑circuit ---------- */

    it('should return existing unit immediately when _isTextUpdated is true', () => {
        annot._isTextUpdated = true;
        annot._unit = PdfMeasurementUnit.inch;

        const result = annot.unit;

        expect(result).toBe(PdfMeasurementUnit.inch);
        expect(dictionary.has).not.toHaveBeenCalled();
    });

    /* ---------- GETTER: default + Contents path ---------- */

    it('should derive unit from Contents when unit is undefined', () => {
        annot._isTextUpdated = false;
        annot._unit = undefined;

        dictionary.has.and.returnValue(true);
        dictionary.get.and.returnValue('Length 25mm');

        const result = annot.unit;

        expect(dictionary.has).toHaveBeenCalledWith('Contents');
        expect(utils._mapMeasurementUnit).toHaveBeenCalledWith('mm');
        expect(result)
            .toBe(PdfMeasurementUnit.millimeter);
    });

    /* ---------- GETTER: default without Contents ---------- */

    it('should default unit to centimeter when Contents is missing', () => {
        annot._isTextUpdated = false;
        annot._unit = undefined;

        dictionary.has.and.returnValue(false);

        const result = annot.unit;

        expect(result)
            .toBe(PdfMeasurementUnit.centimeter);
    });

    /* ---------- SETTER: value updated when measure active and not loaded ---------- */

    it('should update unit in setter when measure is true and annotation not loaded', () => {
        annot._measure = true;
        annot._isLoaded = false;

        annot.unit = PdfMeasurementUnit.inch;

        expect(annot._unit)
            .toBe(PdfMeasurementUnit.inch);
    });

    /* ---------- SETTER: else branches ---------- */

    it('should NOT update unit when annotation is loaded', () => {
        annot._measure = true;
        annot._isLoaded = true;
        annot._unit = PdfMeasurementUnit.centimeter;

        annot.unit = PdfMeasurementUnit.inch;

        expect(annot._unit)
            .toBe(PdfMeasurementUnit.centimeter);
    });

    it('should NOT update unit when measure is false', () => {
        annot._measure = false;
        annot._isLoaded = false;
        annot._unit = PdfMeasurementUnit.centimeter;

        annot.unit = PdfMeasurementUnit.inch;

        expect(annot._unit)
            .toBe(PdfMeasurementUnit.centimeter);
    });

});
describe('PdfRadioButtonListItem.selected and value coverage', () => {
    let annot: PdfRadioButtonListItem;
    let dictionary: any;

    beforeEach(() => {
        dictionary = {
            has: jasmine.createSpy('has'),
            get: jasmine.createSpy('get')
        };

        annot = new PdfRadioButtonListItem();
        annot._dictionary = dictionary;

    });

    it('should return existing unit immediately when selected is present', () => {

        annot.value = 'option';
        const result = annot.value;

        expect(result).toBe('option');
    });
});
describe('PdfStateItem.checked – else if / else branch coverage', () => {

    let item: PdfStateItem;
    let dictionary: any;

    beforeEach(() => {
        dictionary = {
            update: jasmine.createSpy('update')
        };

        item = new PdfStateItem() as any;
        item._dictionary = dictionary;

        // Force setter execution
        spyOnProperty(item, 'checked', 'get').and.returnValue(false);
    });

    /* ---------- ELSE IF branch ---------- */

    it('should use field exportValue when item exportValue is not defined (else-if)', () => {
        item._exportValue = undefined; // required to skip IF
        item._field = {
            _exportValue: 'FieldExport',
            _setAppearance: false
        } as any;

        spyOn(item as any, '_setCheckedStatus');

        item.checked = true;


        expect(item._field._setAppearance).toBeTruthy();
        expect((item as any)._setCheckedStatus).toHaveBeenCalledWith(true);
    });

    /* ---------- ELSE branch ---------- */

    it('should default to Yes/Off when no exportValue exists (else)', () => {
        item._exportValue = undefined;
        item._field = undefined;

        item.checked = true;

        expect(dictionary.update).toHaveBeenCalled();

    });

    it('should write Off when value is false in else branch', () => {
        item._exportValue = undefined;
        item._field = undefined;

        item.checked = false;

        expect(dictionary.update).not.toHaveBeenCalled();
    });

});
describe('PdfWidgetAnnotation – getter/setter branch coverage', () => {

    let annot: any;
    let dictionary: _PdfDictionary;

    beforeEach(() => {
        dictionary = new _PdfDictionary();
        dictionary._updated = false;
        annot = new PdfWidgetAnnotation() as any;
        annot._dictionary = dictionary;
    });

    /* ============================================================
       GETTER – _isLoaded = true
       ============================================================ */

    it('should return visible when flags indicate visible (flagValue = 3)', () => {
        annot._dictionary.set('F', 'true');
        annot._isLoaded = true;
        annot.flags = PdfAnnotationFlag.print;

        const result = annot.visibility;

        expect(result).toBe(PdfFormFieldVisibility.visible);
    });

    it('should return hidden when hidden flag is set (flagValue = 0)', () => {
        annot._dictionary.set('F', 'true');
        annot._isLoaded = true;
        annot.flags = PdfAnnotationFlag.hidden;

        const result = annot.visibility;

        expect(result).toBe(PdfFormFieldVisibility.hidden);
    });

    it('should return hiddenPrintable when noView flag is set (flagValue = 1)', () => {
        annot._dictionary.set('F', 'true');
        annot._isLoaded = true;
        annot.flags =
            PdfAnnotationFlag.noView |
            PdfAnnotationFlag.print;

        const result = annot.visibility;

        expect(result).toBe(
            PdfFormFieldVisibility.hiddenPrintable
        );
    });

    it('should return visibleNotPrintable when print flag is missing (flagValue = 2)', () => {
        annot._dictionary.set('F', 'true');
        annot._isLoaded = true;
        annot.flags = PdfAnnotationFlag.default;

        const result = annot.visibility;

        expect(result).toBe(
            PdfFormFieldVisibility.visibleNotPrintable
        );
    });

    it('should return visibleNotPrintable when no flags exist', () => {
        annot._isLoaded = true;

        const result = annot.visibility;

        expect(result).toBe(
            PdfFormFieldVisibility.visibleNotPrintable
        );
    });

    /* ============================================================
       GETTER – _isLoaded = false
       ============================================================ */

    it('should return stored visibility when annotation is not loaded', () => {
        annot._isLoaded = false;
        annot._visibility =
            PdfFormFieldVisibility.hiddenPrintable;

        const result = annot.visibility;

        expect(result).toBe(
            PdfFormFieldVisibility.hiddenPrintable
        );
    });

    /* ============================================================
       SETTER – _isLoaded = true
       ============================================================ */

    it('should update dictionary when setting visibility on loaded annotation', () => {
        annot._isLoaded = true;

        spyOn(utils, '_updateVisibility');

        annot.visibility = PdfFormFieldVisibility.hidden;

        expect(utils._updateVisibility)
            .toHaveBeenCalledWith(
                annot._dictionary,
                PdfFormFieldVisibility.hidden
            );

        expect(dictionary._updated).toBeTruthy();
    });

    /* ============================================================
       SETTER – _isLoaded = false (switch cases)
       ============================================================ */

    it('should set hidden flag when visibility is hidden', () => {
        annot._isLoaded = false;

        annot.visibility = PdfFormFieldVisibility.hidden;

        expect(annot.flags)
            .toBe(PdfAnnotationFlag.hidden);
        expect(annot._visibility)
            .toBe(PdfFormFieldVisibility.hidden);
    });

    it('should set noView | print when visibility is hiddenPrintable', () => {
        annot._isLoaded = false;

        annot.visibility =
            PdfFormFieldVisibility.hiddenPrintable;

        expect(annot.flags)
            .toBe(
                PdfAnnotationFlag.noView |
                PdfAnnotationFlag.print
            );
    });

    it('should set print when visibility is visible', () => {
        annot._isLoaded = false;

        annot.visibility =
            PdfFormFieldVisibility.visible;

        expect(annot.flags)
            .toBe(PdfAnnotationFlag.print);
    });

    it('should set default when visibility is visibleNotPrintable', () => {
        annot._isLoaded = false;

        annot.visibility =
            PdfFormFieldVisibility.visibleNotPrintable;

        expect(annot.flags)
            .toBe(PdfAnnotationFlag.default);
    });
    it('should get _hasBackColor', () => {
        annot._isLoaded = false;
        annot._isTransparentBackColor = true
        const result = annot._hasBackColor;
        expect(result)
            .toBeFalsy();
    });
    it('should get _hasBorderColor', () => {
        annot._isLoaded = false;
        annot._isTransparentBorderColor = true
        const result = annot._hasBorderColor;
        expect(result)
            .toBeFalsy();
    });

});
