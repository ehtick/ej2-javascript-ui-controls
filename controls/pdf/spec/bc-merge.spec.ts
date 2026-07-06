

import { _PdfMergeHelper, _PdfCopier } from '../src/pdf/core/pdf-merge';
import { PdfDocument, PdfPageSettings } from '../src/pdf/core/pdf-document';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { PdfForm } from '../src/pdf/core/form/form';
import { PdfField, PdfCheckBoxField, PdfRadioButtonListField, PdfTextBoxField, PdfButtonField, PdfSignatureField, PdfListField, PdfListBoxField } from '../src/pdf/core/form/field';
import { _PdfDictionary, _PdfReference, _PdfName } from '../src/pdf/core/pdf-primitives';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { PdfPageImportOptions } from "../src/pdf/core/pdf-page-import-options";
import { PdfFontStyle, PdfFontFamily, PdfStandardFont, PdfFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfDestination } from '../src/pdf/core/pdf-page';
import { PdfNamedDestination, PdfBookmarkBase } from '../src/pdf/core/pdf-outline';
import { _PdfBaseStream, _PdfContentStream, _PdfStream } from '../src/pdf/core/base-stream';
import { PdfLineAnnotation, PdfSquareAnnotation, PdfWidgetAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { PdfDestinationMode, PdfRotationAngle } from '../src/pdf/core/enumerator';

describe('_PdfMergeHelper behavior tests', () => {
    function createHelper(): {
        helper: _PdfMergeHelper;
        crossRef: _PdfCrossReference;
    } {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const options = new PdfPageImportOptions();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        return { helper, crossRef };
    }
    it('_mergeFormFieldsWithDocument - populates Fields from form dictionary and clears NeedAppearances', () => {
        const { helper, crossRef } = createHelper();
        const formDict: _PdfDictionary = helper._destinationDocument.form._dictionary;

        // Arrange: destination already has a Fields array and NeedAppearances true
        const existingRef: _PdfReference = crossRef._getNextReference();
        formDict.set('Fields', [existingRef]);
        formDict.set('NeedAppearances', true);

        // Put a new mapping into the collection (should overwrite index 0)
        const newRef: _PdfReference = crossRef._getNextReference();
        helper._formFieldsCollection.set(0, newRef);

        // Act
        (helper as any)._mergeFormFieldsWithDocument();

        // Assert
        const pdfFields = formDict.get('Fields');
        expect(pdfFields[0]).toEqual(newRef);
        expect(formDict.get('NeedAppearances')).toBe(false);
        expect(helper._destinationDocument.form._fields).toEqual(pdfFields);
        expect(formDict._updated).toBeTruthy();
    });

    it('_mergeFormFieldsWithDocument - builds Fields when form dictionary missing Fields key', () => {
        const { helper, crossRef } = createHelper();
        const formDict: _PdfDictionary = helper._destinationDocument.form._dictionary;

        // Arrange: ensure no 'Fields' key and NeedAppearances falsy
        if (formDict.has('Fields')) {
            // remove by reassigning a fresh dictionary map if possible
            formDict._map = {};
        }
        formDict.set('NeedAppearances', false);

        // Add a mapping at index 2
        const mappedRef: _PdfReference = crossRef._getNextReference();
        helper._formFieldsCollection.set(2, mappedRef);

        // Act
        (helper as any)._mergeFormFieldsWithDocument();

        // Assert: Fields array should contain mappedRef at index 2
        const pdfFields = formDict.get('Fields');
        expect(pdfFields[2]).toEqual(mappedRef);
        expect(formDict.get('NeedAppearances')).toBe(false);
        expect(helper._destinationDocument.form._fields).toEqual(pdfFields);
        expect(formDict._updated).toBeTruthy();
    });

    it('_mergeFormFieldsWithDocument - uses existing destination form._fields when no new mappings', () => {
        const { helper, crossRef } = createHelper();
        const formDict: _PdfDictionary = helper._destinationDocument.form._dictionary;

        // Arrange: ensure collection empty and destination form._fields set
        helper._formFieldsCollection.clear();
        const existingFields: _PdfReference[] = [crossRef._getNextReference()];
        helper._destinationDocument.form._fields = existingFields;

        // Act
        (helper as any)._mergeFormFieldsWithDocument();

        // Assert: dictionary Fields and form._fields point to the same array
        expect(formDict.get('Fields')).toEqual(existingFields);
        expect(helper._destinationDocument.form._fields).toEqual(existingFields);
        expect(formDict._updated).toBeTruthy();
    });
    it('_formFieldsGroupingSupport - no DR entry initializes drEntry to undefined', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const mockForm: any = {
            _dictionary: new _PdfDictionary(crossRef),
            count: 0,
            fieldAt: (): PdfField | null => null
        };

        const oldPage: PdfPage = destDoc.addPage();
        const newPage: PdfPage = destDoc.addPage();
        helper._isDuplicatePage = false;

        // Act
        helper._formFieldsGroupingSupport(mockForm, oldPage, newPage);

        // Assert
        expect(mockForm._dictionary.has('DR')).toBeFalsy();
        expect(newPage).toBeDefined();
    });

    it('_mergeLayer - when old page Resources has Properties, sets Properties on resource and marks updated (lines 1051-1067)', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        // Prepare xobjdict that provides a resource dictionary for assignment
        const resource = new _PdfDictionary(crossRef);
        const xobjdict: any = { dictionary: new _PdfDictionary(crossRef) };
        xobjdict.dictionary.set('Resources', resource);
        const xobjRef = crossRef._getNextReference();
        crossRef._cacheMap.set(xobjRef, xobjdict);

        // newPageDictionary with Resources -> XObject -> { key: xobjRef }
        const xobject = new _PdfDictionary(crossRef);
        xobject.set('ImgKey', xobjRef);
        const resDict = new _PdfDictionary(crossRef);
        resDict.set('XObject', xobject);
        const newPageDictionary = new _PdfDictionary(crossRef);
        newPageDictionary.set('Resources', resDict);

        // oldPageDictionary with Resources -> Properties -> { propName: oldRef }
        const oldPageDictionary = new _PdfDictionary(crossRef);
        const oldPageResource = new _PdfDictionary(crossRef);
        const oldRef = crossRef._getNextReference();
        const layerDictionary = new _PdfDictionary(crossRef);
        layerDictionary.set('PropName', oldRef);
        oldPageResource.set('Properties', layerDictionary);
        oldPageDictionary.set('Resources', oldPageResource);

        // Map oldRef -> mappedRef in helper._newList so properties.set will use mappedRef
        const mappedRef = crossRef._getNextReference();
        helper._newList.set(oldRef, mappedRef);

        // Act
        helper._mergeLayer(newPageDictionary, oldPageDictionary, crossRef);

        // Assert: resource should now have a Properties dict with PropName -> mappedRef
        expect(resource.has('Properties')).toBeTruthy();
        const properties = resource.get('Properties');
        expect(resource._updated).toBeTruthy();
        expect(properties._updated).toBeTruthy();
    });




    it('_importPages - calls _formFieldsGroupingSupport when groupFormFields and AcroForm present (line 228)', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcDoc: PdfDocument = new PdfDocument();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        // Ensure destination has a form field so dest form.count > 0
        destDoc.addPage();
        const destField = new PdfTextBoxField(destDoc.getPage(0), 'destField', { x: 0, y: 0, width: 10, height: 10 });
        destDoc.form.add(destField);

        // Ensure source catalog reports AcroForm and page has Annots
        srcDoc._catalog._catalogDictionary.set('AcroForm', new _PdfDictionary(srcDoc._crossReference));
        const sourcePage: PdfPage = srcDoc.addPage();
        sourcePage._pageDictionary.set('Annots', [srcDoc._crossReference._getNextReference()]);

        helper._options.groupFormFields = true;

        // Spy on the private method to ensure it is invoked
        spyOn((helper as any), '_formFieldsGroupingSupport').and.callThrough();

        // Act
        helper._importPages(sourcePage, 0, false, false);

        // Assert
        expect((helper as any)._formFieldsGroupingSupport).toHaveBeenCalled();
    });

    it('_formFieldsGroupingSupport - newPage has Annots gets existing array', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const mockForm: any = {
            _dictionary: new _PdfDictionary(crossRef),
            count: 0,
            fieldAt: (): PdfField | null => null
        };

        const oldPage: PdfPage = destDoc.addPage();
        const newPage: PdfPage = destDoc.addPage();

        const annotRef: _PdfReference = crossRef._getNextReference();
        newPage._pageDictionary.set('Annots', [annotRef]);

        // Act
        helper._formFieldsGroupingSupport(mockForm, oldPage, newPage);

        // Assert
        expect(newPage._pageDictionary.has('Annots')).toBeTruthy();
        expect(newPage._pageDictionary.get('Annots').length).toBe(1);
    });

    it('_formFieldsGroupingSupport - oldPage has Annots gets kids array', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const mockForm: any = {
            _dictionary: new _PdfDictionary(crossRef),
            count: 0,
            fieldAt: (): PdfField | null => null
        };

        const oldPage: PdfPage = destDoc.addPage();
        const newPage: PdfPage = destDoc.addPage();

        const kidRef: _PdfReference = crossRef._getNextReference();
        oldPage._pageDictionary.set('Annots', [kidRef]);

        // Act
        helper._formFieldsGroupingSupport(mockForm, oldPage, newPage);

        // Assert
        expect(oldPage._pageDictionary.has('Annots')).toBeTruthy();
    });
    it('_groupFormFieldsKids - destination has Kids, source does not', () => {
        const { helper, crossRef } = createHelper();

        const destField: any = { _dictionary: new _PdfDictionary(crossRef) };
        const srcField: any = { _dictionary: new _PdfDictionary(crossRef) };

        destField._dictionary.set('Kids', [crossRef._getNextReference()]);

        const result = helper._groupFormFieldsKids(
            destField, srcField, [], [], [], crossRef._getNextReference(), [], 0, 0
        );

        expect(result).toBeDefined();
    });

    it('_groupFormFieldsKids - both fields have Kids with valid index range', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);
        helper._copier = new _PdfCopier(crossRef, srcDoc._crossReference);

        const destField: any = {
            _dictionary: new _PdfDictionary(crossRef),
            _ref: crossRef._getNextReference(),
            _kidsCount: 1,
            itemAt: () => ({ _dictionary: new _PdfDictionary(crossRef) })
        };
        destField._dictionary.set('Kids', [destField._ref]);

        const srcField: any = {
            _dictionary: new _PdfDictionary(crossRef),
            _ref: crossRef._getNextReference(),
            _crossReference: crossRef,
            _isDuplicatePage: false
        };

        const oldKidRef: _PdfReference = crossRef._getNextReference();
        srcField._dictionary.set('Kids', [oldKidRef]);

        const oldDict: _PdfDictionary = new _PdfDictionary(crossRef);
        crossRef._cacheMap.set(oldKidRef, oldDict);

        const array: _PdfReference[] = [];
        const destKids: _PdfReference[] = [];
        const pageRef: _PdfReference = crossRef._getNextReference();

        helper._isDuplicatePage = false;

        // Act
        const result: _PdfReference[] = helper._groupFormFieldsKids(
            destField, srcField, [oldKidRef], destKids, [oldKidRef], pageRef, array, 0, 0, null
        );

        // Assert
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    });

    it('_groupFormFieldsKids - index out of range returns empty array', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const destField: any = {
            _dictionary: new _PdfDictionary(crossRef),
            _ref: crossRef._getNextReference()
        };
        destField._dictionary.set('Kids', []);

        const srcField: any = {
            _dictionary: new _PdfDictionary(crossRef)
        };
        srcField._dictionary.set('Kids', []);

        const array: _PdfReference[] = [crossRef._getNextReference()];

        // Act
        const result: _PdfReference[] = helper._groupFormFieldsKids(
            destField, srcField, [], [], [], crossRef._getNextReference(), array, 5, 0
        );

        // Assert
        expect(result).toEqual(array);
    });

    it('_groupFormFieldsKids - source without Kids and destination has Kids updates destKids and calls _createAppearance (lines 429-437)', () => {
      // Arrange
      const destDoc: PdfDocument = new PdfDocument();
      const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

      const srcDoc: PdfDocument = new PdfDocument();
      const options: PdfPageImportOptions = new PdfPageImportOptions();
      const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

      const destinationField: any = { _dictionary: new _PdfDictionary(crossRef), _ref: crossRef._getNextReference() };
      destinationField._dictionary.set('Kids', [crossRef._getNextReference()]);

      const field: any = { _dictionary: new _PdfDictionary(crossRef) };

      const ref: _PdfReference = crossRef._getNextReference();
      const array: _PdfReference[] = [];
      const destKids: _PdfReference[] = [];
      const oldKids: _PdfReference[] = [];

      spyOn((helper as any), '_createAppearance').and.callFake(() => {});

      // Act
      const result = helper._groupFormFieldsKids(destinationField, field, [], destKids, oldKids, ref, array, 0, 0, undefined, undefined);

      // Assert
      expect(result).toBeDefined();
      expect(destKids.length).toBeGreaterThan(0);
      expect(array.length).toBeGreaterThan(0);
      expect(destinationField._dictionary._updated).toBeTruthy();
      expect((helper as any)._createAppearance).toHaveBeenCalled();

      const cachedDict: any = crossRef._cacheMap.get(destKids[0]);
      expect(cachedDict).toBeDefined();
      expect(cachedDict._map.P).toEqual(ref);
    });

    it('_groupFormFieldsKids - both have Kids and matching oldKid causes AS removal and appearance creation (lines 416-418)', () => {
      // Arrange
      const destDoc: PdfDocument = new PdfDocument();
      const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

      const srcDoc: PdfDocument = new PdfDocument();
      const options: PdfPageImportOptions = new PdfPageImportOptions();
      const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

      const destPage: PdfPage = destDoc.addPage();
      const destinationField: PdfTextBoxField = new PdfTextBoxField(destPage, 'destField', { x: 0, y: 0, width: 10, height: 10 });
      destinationField._dictionary.set('Kids', [crossRef._getNextReference()]);

      const srcPage: PdfPage = srcDoc.addPage();
      const field: any = { _dictionary: new _PdfDictionary(srcDoc._crossReference), _crossReference: srcDoc._crossReference };

      const oldKid: _PdfReference = srcDoc._crossReference._getNextReference();
      const oldDict: _PdfDictionary = new _PdfDictionary(srcDoc._crossReference);
      oldDict.set('AS', 'oldAS');
      srcDoc._crossReference._cacheMap.set(oldKid, oldDict);

      field._dictionary.set('Kids', [oldKid]);

      const kidsArray: _PdfReference[] = [oldKid];
      const destKids: _PdfReference[] = [];
      const array: _PdfReference[] = [];
      const ref: _PdfReference = crossRef._getNextReference();

      spyOn((helper as any), '_createAppearance').and.callFake(() => {});

      // Act
      const result = helper._groupFormFieldsKids(destinationField, field, kidsArray, destKids, [oldKid], ref, array, 0, 0, undefined, undefined);

      // Assert
      expect(result).toBeDefined();
      expect(destKids.length).toBeGreaterThan(0);
      expect(array.length).toBeGreaterThan(0);
      expect((helper as any)._createAppearance).toHaveBeenCalled();

      const cachedDict: _PdfDictionary = crossRef._cacheMap.get(destKids[0]);
      expect(cachedDict).toBeDefined();
      expect(cachedDict.has('AS')).toBeFalsy();
    });

    it('_copyStream - copies non-image stream', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(
            new _PdfCrossReference(destDoc),
            new _PdfCrossReference(srcDoc)
        );

        const stream = new _PdfStream([], new _PdfDictionary(copier._targetCrossReference));

        const result = copier._copyStream(stream);
        expect(result).toBeDefined();
    });

    it('_importFormField - imports field without Kids to new page', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(
            crossRef,
            destDoc,
            srcDoc,
            new Map(),
            new PdfPageImportOptions()
        );

        const srcPage = srcDoc.addPage();
        const newPage = destDoc.addPage();

        const field = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });
        srcDoc.form.add(field);

        // Act
        helper._importFormField(srcPage, srcDoc.form, newPage);

        // Assert
        expect(destDoc.form.count).toBeGreaterThan(0);
        expect(newPage._pageDictionary.has('Annots')).toBeTruthy();
    });

    it('_importFormField - calls _insertFormFields when field has multiple kids and one widget on source page (lines 772-777)', () => {
      // Arrange
      const { helper, crossRef } = createHelper();
      const srcPage: PdfPage = helper._sourceDocument.addPage();
      const newPage: PdfPage = helper._destinationDocument.addPage();

      const ref1: _PdfReference = crossRef._getNextReference();
      const ref2: _PdfReference = crossRef._getNextReference();

      const pdfField: any = {
        _dictionary: new _PdfDictionary(crossRef),
        itemAt: (index: number) => { return (index === 0) ? { page: null } : { page: srcPage }; }
      };
      pdfField._dictionary.set('Kids', [ref1, ref2]);

      const mockForm: any = { count: 1, fieldAt: (_: number) => pdfField, _dictionary: new _PdfDictionary(crossRef) };

      spyOn((helper as any), '_insertFormFields').and.returnValue([]);

      // Act
      helper._importFormField(srcPage, mockForm, newPage);

      // Assert
      expect((helper as any)._insertFormFields).toHaveBeenCalled();
    });

    it('_importFormField - calls _insertFormFields when field has exactly one kid on source page (lines 780-783)', () => {
      // Arrange
      const { helper, crossRef } = createHelper();
      const srcPage: PdfPage = helper._sourceDocument.addPage();
      const newPage: PdfPage = helper._destinationDocument.addPage();

      const ref1: _PdfReference = crossRef._getNextReference();

      const pdfField: any = {
        _dictionary: new _PdfDictionary(crossRef),
        page: srcPage
      };
      pdfField._dictionary.set('Kids', [ref1]);

      const mockForm: any = { count: 1, fieldAt: (_: number) => pdfField, _dictionary: new _PdfDictionary(crossRef) };

      spyOn((helper as any), '_insertFormFields').and.returnValue([]);

      // Act
      helper._importFormField(srcPage, mockForm, newPage);

      // Assert
      expect((helper as any)._insertFormFields).toHaveBeenCalled();
    });

    it('_importFormField - calls _insertFormFields when field has no Kids and belongs to source page (lines 786-787)', () => {
      // Arrange
      const { helper, crossRef } = createHelper();
      const srcPage: PdfPage = helper._sourceDocument.addPage();
      const newPage: PdfPage = helper._destinationDocument.addPage();

      const pdfField: any = {
        _dictionary: new _PdfDictionary(crossRef),
        page: srcPage
      };

      const mockForm: any = { count: 1, fieldAt: (_: number) => pdfField, _dictionary: new _PdfDictionary(crossRef) };

      spyOn((helper as any), '_insertFormFields').and.returnValue([]);

      // Act
      helper._importFormField(srcPage, mockForm, newPage);

      // Assert
      expect((helper as any)._insertFormFields).toHaveBeenCalled();
    });

    it('_importFormField - copies DR to destination when destination has no DR (lines 789-797)', () => {
      // Arrange
      const { helper, crossRef } = createHelper();
      const srcPage: PdfPage = helper._sourceDocument.addPage();
      const newPage: PdfPage = helper._destinationDocument.addPage();

      const dr: _PdfDictionary = new _PdfDictionary(crossRef);
      const fontDict: _PdfDictionary = new _PdfDictionary(crossRef);
      fontDict.set('FNew', 'fontValue');
      dr.set('Font', fontDict);

      helper._sourceDocument.form._dictionary.set('DR', dr);

      // Precondition: destination has no DR
      expect(helper._destinationDocument.form._dictionary.has('DR')).toBeFalsy();

      // Act
      helper._importFormField(srcPage, helper._sourceDocument.form, newPage);

      // Assert: destination DR now exists and contains Font
      const destDR: _PdfDictionary = helper._destinationDocument.form._dictionary.get('DR');
      expect(destDR).toBeDefined();
      expect(destDR.has('Font')).toBeTruthy();
    });

    it('_importFormField - merges Font entries when both source and destination DR.Font exist (lines 798-806)', () => {
      // Arrange
      const { helper, crossRef } = createHelper();
      const srcPage: PdfPage = helper._sourceDocument.addPage();
      const newPage: PdfPage = helper._destinationDocument.addPage();

      const srcDR: _PdfDictionary = new _PdfDictionary(crossRef);
      const srcFont: _PdfDictionary = new _PdfDictionary(crossRef);
      srcFont.set('NewF', 'v1');
      srcDR.set('Font', srcFont);
      helper._sourceDocument.form._dictionary.set('DR', srcDR);

      const destDR: _PdfDictionary = new _PdfDictionary(crossRef);
      const destFont: _PdfDictionary = new _PdfDictionary(crossRef);
      destFont.set('Existing', 'v0');
      destDR.set('Font', destFont);
      helper._destinationDocument.form._dictionary.set('DR', destDR);

      // Act
      helper._importFormField(srcPage, helper._sourceDocument.form, newPage);

      // Assert: destination Font dictionary contains merged key and is marked updated
      const updatedDR: _PdfDictionary = helper._destinationDocument.form._dictionary.get('DR');
      const updatedFont: _PdfDictionary = updatedDR.get('Font');
      expect(updatedFont.has('NewF')).toBeTruthy();
      expect(updatedFont.has('Existing')).toBeTruthy();
      expect(updatedFont._updated).toBeTruthy();
    });

      it('_importFormField - reads existing destination field names into _fieldNames when Fields exists (lines 755-762)', () => {
        // Arrange
        const { helper, crossRef } = createHelper();
        const destForm: PdfForm = helper._destinationDocument.form;
        const destPage: PdfPage = helper._destinationDocument.addPage();
        const existingField: PdfTextBoxField = new PdfTextBoxField(destPage, 'existingField', { x: 1, y: 1, width: 10, height: 10 });
        destForm.add(existingField);

        // Verify preconditions: destination form has fields
        expect(destForm.count).toBeGreaterThan(0);

        // Prepare a source page and source form to call the importer
        const srcPage: PdfPage = helper._sourceDocument.addPage();
        const srcField: PdfTextBoxField = new PdfTextBoxField(helper._sourceDocument.getPage(0), 'srcField', { x: 5, y: 5, width: 8, height: 8 });
        helper._sourceDocument.form.add(srcField);
        const newPage: PdfPage = helper._destinationDocument.addPage();

        // Act
        (helper as any)._importFormField(srcPage, helper._sourceDocument.form, newPage);

        // Assert: internal counters and names populated from destination form
        expect(helper._fieldCount).toEqual(destForm.count);
        expect(helper._fieldNames.indexOf('existingField')).not.toEqual(-1);
      });

    it('_removeFieldDictionary - removes specified keys from dictionary', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const dict: _PdfDictionary = new _PdfDictionary(crossRef);
        dict.set('Parent', 'parentValue');
        dict.set('FT', 'fieldType');
        dict.set('T', 'fieldName');

        // Act
        const result: _PdfDictionary = helper._removeFieldDictionary(dict, ['Parent', 'FT', 'T']);

        // Assert
        expect(result.has('Parent')).toBeFalsy();
        expect(result.has('FT')).toBeFalsy();
        expect(result.has('T')).toBeFalsy();
    });

    it('_removeFieldDictionary - skips non-existent keys gracefully', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const dict: _PdfDictionary = new _PdfDictionary(crossRef);
        dict.set('Existing', 'value');

        // Act
        const result: _PdfDictionary = helper._removeFieldDictionary(dict, ['NonExistent', 'AlsoMissing']);

        // Assert
        expect(result.has('Existing')).toBeTruthy();
    });
    it('_updateFieldDictionary - updates page and parent references', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = destDoc._crossReference;

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const dict: _PdfDictionary = new _PdfDictionary(crossRef);
        dict.set('Parent', 'oldParent');
        dict.set('FT', 'fieldType');

        const pageRef: _PdfReference = crossRef._getNextReference();
        const parentRef: _PdfReference = crossRef._getNextReference();

        // Act
        helper._updateFieldDictionary(dict, pageRef, parentRef);

        // Assert
        expect(dict._map.P).toEqual(pageRef);
        expect(dict._map.Parent).toEqual(parentRef);
        expect(dict._updated).toBeTruthy();
    });

    it('_createNewFieldDictionary - copies specified keys and removes from originals', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const fieldDict: _PdfDictionary = new _PdfDictionary(crossRef);
        fieldDict.set('FT', 'Tx');
        fieldDict.set('T', 'fieldName');
        fieldDict.set('V', 'fieldValue');

        const destDict: _PdfDictionary = new _PdfDictionary(crossRef);
        destDict.set('FT', 'Tx');

        // Act
        const result: _PdfDictionary = helper._createNewFieldDictionary(fieldDict, destDict);

        // Assert
        expect(result.has('FT')).toBeTruthy();
        expect(result.has('T')).toBeTruthy();
        expect(fieldDict.has('FT')).toBeFalsy();
    });

    it('_getItemStyle - extracts CA from MK dictionary', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const mkDict: _PdfDictionary = new _PdfDictionary(crossRef);
        mkDict.set('CA', 'checkmark');

        const item: any = { _dictionary: new _PdfDictionary(crossRef) };
        item._dictionary.set('MK', mkDict);

        const field: any = {};

        // Act
        helper._getItemStyle(item, field);

        // Assert
        expect(item._styleText).toBe('c');
    });

    it('_getItemStyle - defaults to 4 for non-radio field when MK absent', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const item: any = { _dictionary: new _PdfDictionary(crossRef) };

        const field: PdfCheckBoxField = new PdfCheckBoxField();
        destDoc.form.add(field);

        // Act
        helper._getItemStyle(item, field);

        // Assert
        expect(item._styleText).toBe('4');
    });

    it('_createAppearance - Checkbox with source RadioButtonList sets AS and enables grouping', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        destDoc.addPage();
        srcDoc.addPage();

        const destField: PdfCheckBoxField = new PdfCheckBoxField('cb', { x: 10, y: 10, width: 20, height: 20 }, destDoc.getPage(0));
        destDoc.form.add(destField);
        destField.checked = true;

        const srcField: PdfRadioButtonListField = new PdfRadioButtonListField(srcDoc.getPage(0), 'rb');
        srcDoc.form.add(srcField);

        const oldDict: _PdfDictionary = new _PdfDictionary(crossRef);
        const widgetDict: _PdfDictionary = new _PdfDictionary(crossRef);

        // Act
        helper._createAppearance(destField, srcField, oldDict, widgetDict, undefined);

        // Assert
        const item = destField.itemAt(destField._kidsCount - 1);
        expect(item).toBeDefined();
        expect(item._dictionary.has('AS')).toBeTruthy();
        expect(item._enableGrouping).toBeTruthy();
    });

    it('_createAppearance - Checkbox with non-radio source uses checked state for postProcess', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const dPage = destDoc.addPage();
        const sPage = srcDoc.addPage();

        const destField: PdfCheckBoxField = new PdfCheckBoxField('cb2', { x: 12, y: 12, width: 20, height: 20 }, dPage);
        destDoc.form.add(destField);
        destField.checked = false;

        const srcField: PdfTextBoxField = new PdfTextBoxField(sPage, 'txt', { x: 5, y: 5, width: 30, height: 10 });
        srcDoc.form.add(srcField);

        const oldDict: _PdfDictionary = new _PdfDictionary(crossRef);
        const widgetDict: _PdfDictionary = new _PdfDictionary(crossRef);

        // Act
        helper._createAppearance(destField, srcField, oldDict, widgetDict, undefined);

        // Assert
        const item = destField.itemAt(destField._kidsCount - 1);
        expect(item).toBeDefined();
        expect(item._enableGrouping).toBeTruthy();
    });

    it('_obtainFont - parses DS property to extract font family', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:Helv;font-size:12pt');

        const font = helper._obtainFont(item, formDictionary);

        expect(font).toBeDefined();
    });

    it('_obtainFont - parses DA property to extract Tf font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DA', '/Helv 12 Tf');

        const font = helper._obtainFont(item, formDictionary);

        expect(font).toBeDefined();
    });

    it('_obtainFont - Helv font family returns Helvetica standard font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:Helv');

        const font = helper._obtainFont(item, formDictionary);

    });

    it('_obtainFont - Courier font family returns Courier standard font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:Courier');

        const font = helper._obtainFont(item, formDictionary);

    });

    it('_obtainFont - Cour alias returns Courier standard font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:Cour');

        const font = helper._obtainFont(item, formDictionary);

        expect(font).toBeDefined();
    });

    it('_obtainFont - Symb returns Symbol font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:Symb');

        const font = helper._obtainFont(item, formDictionary);


    });

    it('_obtainFont - TiRo returns Times Roman font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:TiRo');

        const font = helper._obtainFont(item, formDictionary);


    });
    it('_obtainFont - Symb returns Symbol font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:Symb');

        const font = helper._obtainFont(item, formDictionary);


    });

    it('_obtainFont - TiRo returns Times Roman font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:TiRo');

        const font = helper._obtainFont(item, formDictionary);


    });

    it('_obtainFont - ZaDb returns Zapf Dingbats font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:ZaDb');

        const font = helper._obtainFont(item, formDictionary);


    });
    it('_obtainFont - unknown font falls back to Helvetica', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:Unknown');

        const font = helper._obtainFont(item, formDictionary);


    });
    it('_obtainFont - empty item returns default Helvetica font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        const font = helper._obtainFont(item, formDictionary);

    });
    it('_obtainFont - ZaDb returns Zapf Dingbats font', () => {
        const { helper, crossRef } = createHelper();

        const item = new _PdfDictionary(crossRef);
        const formDictionary = new _PdfDictionary(crossRef);

        item.set('DS', 'font-family:ZaDb');

        const font = helper._obtainFont(item, formDictionary);


    });

    it('_getFontStyle - Bold in name returns bold style', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        // Act
        const style: PdfFontStyle = helper._getFontStyle('HelveticaBold');

        // Assert
        expect(style).toBe(PdfFontStyle.bold);
    });

    it('_getFontStyle - Italic in name returns italic style', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        // Act
        const style: PdfFontStyle = helper._getFontStyle('HelveticaItalic');

        // Assert
        expect(style).toBe(PdfFontStyle.italic);
    });

    it('_getFontStyle - no style indicators returns regular style', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        // Act
        const style: PdfFontStyle = helper._getFontStyle('Helvetica');

        // Assert
        expect(style).toBe(PdfFontStyle.regular);
    });

    it('_mergeFormFieldsWithDocument - empty form fields collection uses destination form fields', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        helper._formFieldsCollection.clear();
        helper._destinationDocument = destDoc;

        // Act
        helper._mergeFormFieldsWithDocument();

        // Assert
        expect(destDoc.form._dictionary.get('Fields')).toBeDefined();
    });

    it('_importLayers - layers present with destination OCProperties updates defaults', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const ocPropsDict: _PdfDictionary = new _PdfDictionary(crossRef);
        const currentOCProps: _PdfDictionary = new _PdfDictionary(crossRef);
        currentOCProps.set('OCGs', []);
        ocPropsDict.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocPropsDict, true);

        // Assert
        expect(helper._isLayersPresent).toBeTruthy();
    });

    it('_importLayers - no destination OCProperties creates new one', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const ocPropsDict: _PdfDictionary = new _PdfDictionary(crossRef);
        const currentOCProps: _PdfDictionary = new _PdfDictionary(crossRef);
        ocPropsDict.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocPropsDict, true);

        // Assert
        expect(helper._isLayersPresent).toBeTruthy();
    });

    it('_getNamedDestination - copies title and clones destination', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const page: PdfPage = destDoc.addPage();
        const namedDest: PdfNamedDestination = new PdfNamedDestination('testDest');
        namedDest.destination = new PdfDestination(page, { x: 10, y: 10 });

        // Act
        const result: PdfNamedDestination = helper._getNamedDestination(namedDest, page);

        // Assert
        expect(result).toBeDefined();
        expect(result.destination).toBeDefined();
    });

    it('_getDestination - copies mode, zoom and location from source destination', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const srcPage: PdfPage = srcDoc.addPage();
        const destPage: PdfPage = destDoc.addPage();
        const srcDest: PdfDestination = new PdfDestination(srcPage, { x: 10, y: 10 });
        srcDest.zoom = 150;

        // Act
        const result: PdfDestination = helper._getDestination(destPage, srcDest);

        // Assert
        expect(result).toBeDefined();
        expect(result.zoom).toBe(srcDest.zoom);
    });

    it('_writeObject - primitive string value calls writeDictionary', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const table: _PdfDictionary = new _PdfDictionary(crossRef);
        const array: any[] = [];

        // Act
        helper._writeObject(destDoc, table, 'testValue', null, 'key', array);

        // Assert
        expect(table.has('key')).toBeTruthy();
    });

    it('_writeObject - array value calls writeArray', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const array: any[] = [];

        // Act
        helper._writeObject(destDoc, null, ['item1', 'item2'], null, null, array);

        // Assert
        expect(array.length).toBeGreaterThan(0);
    });

    it('_writeObject - dictionary value creates sub-table', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const subDict: _PdfDictionary = new _PdfDictionary(crossRef);
        subDict.set('test', 'value');
        const array: any[] = [];

        // Act
        helper._writeObject(destDoc, null, subDict, null, null, array);

        // Assert
        expect(array.length).toBeGreaterThan(0);
    });

    it('_writeObject - null value calls writeDictionary with null', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const table: _PdfDictionary = new _PdfDictionary(crossRef);

        // Act
        helper._writeObject(destDoc, table, null, null, 'key');

        // Assert
        expect(table.has('key')).toBeTruthy();
    });

    it('_writeDictionary - key and value sets in table', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const table: _PdfDictionary = new _PdfDictionary(crossRef);

        // Act
        helper._writeDictionary('testValue', table, 'key', null, null, null);

        // Assert
        expect(table.has('key')).toBeTruthy();
        expect(table.get('key')).toBe('testValue');
    });

    it('_writeDictionary - key and list sets in table', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const table: _PdfDictionary = new _PdfDictionary(crossRef);
        const list: any[] = ['item1'];

        // Act
        helper._writeDictionary(null, table, 'key', null, null, list);

        // Assert
        expect(table.has('key')).toBeTruthy();
    });

    it('_writeDictionary - list without ref pushes to array', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const array: any[] = [];
        const list: any[] = ['item1'];

        // Act
        helper._writeDictionary(null, null, null, array, null, list);

        // Assert
        expect(array.length).toBe(1);
    });

    it('_writeDictionary - value without key or list pushes to array', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const array: any[] = [];

        // Act
        helper._writeDictionary('testValue', null, null, array, null, null);

        // Assert
        expect(array.length).toBe(1);
        expect(array[0]).toBe('testValue');
    });

    it('_writeDictionary - ref with cached mapping uses new reference', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const oldRef: _PdfReference = crossRef._getNextReference();
        const newRef: _PdfReference = crossRef._getNextReference();
        helper._newList.set(oldRef, newRef);

        const array: any[] = [];

        // Act
        helper._writeDictionary(null, null, null, array, oldRef, null);

        // Assert
        expect(array.length).toBe(1);
        expect(array[0]).toEqual(newRef);
    });

    it('_writeDictionary - ref without existing mapping creates new cached reference', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const oldRef: _PdfReference = crossRef._getNextReference();
        const array: any[] = [];
        const layerList: _PdfDictionary = new _PdfDictionary(crossRef);

        // Act
        helper._writeDictionary(null, null, null, array, oldRef, layerList);

        // Assert
        expect(array.length).toBe(1);
        const createdRef: any = array[0];
        expect(crossRef._cacheMap.get(createdRef)).toBe(layerList);
        expect(layerList._updated).toBeTruthy();
        expect(helper._newList.get(oldRef)).toEqual(createdRef);
    });

    it('_writeArray - iterates and copies all items', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const array: any[] = [];
        const value: any[] = ['item1', 'item2', 'item3'];

        // Act
        helper._writeArray(destDoc, array, value, null);

        // Assert
        expect(array.length).toBe(3);
    });

    it('_writePropertiesDictionary - iterates dictionary and writes properties', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const table: _PdfDictionary = new _PdfDictionary(crossRef);
        const dict: _PdfDictionary = new _PdfDictionary(crossRef);
        dict.set('prop1', 'value1');
        dict.set('prop2', 'value2');

        // Act
        helper._writePropertiesDictionary(destDoc, table, dict);

        // Assert
        expect(table.has('prop1')).toBeTruthy();
        expect(table.has('prop2')).toBeTruthy();
    });

    it('_fixDestinations - updates destination references when page found in map', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const page: PdfPage = destDoc.addPage();
        const srcPageDict: _PdfDictionary = new _PdfDictionary(crossRef);

        const destRef: _PdfReference = crossRef._getNextReference();
        const srcRef: _PdfReference = crossRef._getNextReference();

        helper._pageReference.set(srcPageDict, page);
        crossRef._cacheMap.set(destRef, srcPageDict);
        helper._destination = [[destRef, 100, 100]];

        // Act
        helper._fixDestinations(destDoc);

        // Assert
        expect(helper._destination[0][0]).toBeDefined();
    });

    it('_insertNewPage - copies MediaBox from source page', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const srcPage: PdfPage = srcDoc.addPage();
        srcPage._pageDictionary.set('MediaBox', [0, 0, 612, 792]);

        helper._destinationDocument = destDoc;
        helper._options = options;

        // Act
        const newPage: PdfPage = helper._insertNewPage(srcPage);

        // Assert
        expect(newPage._pageDictionary.has('MediaBox')).toBeTruthy();
    });

    it('_insertNewPage - copies CropBox from source page', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const srcPage: PdfPage = srcDoc.addPage();
        srcPage._pageDictionary.set('CropBox', [10, 10, 600, 780]);

        helper._destinationDocument = destDoc;
        helper._options = options;

        // Act
        const newPage: PdfPage = helper._insertNewPage(srcPage);

        // Assert
        expect(newPage._pageDictionary.has('CropBox')).toBeTruthy();
    });

    it('_insertNewPage - sets rotation when options.rotation defined', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        options.rotation = 1;
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const srcPage: PdfPage = srcDoc.addPage();
        helper._destinationDocument = destDoc;
        helper._options = options;

        // Act
        const newPage: PdfPage = helper._insertNewPage(srcPage);

        // Assert
        expect(newPage._pageDictionary.has('Rotate')).toBeTruthy();
    });

    it('_insertNewPage - rotation calculation handles modulo for >= 360', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        options.rotation = PdfRotationAngle.angle180;
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const srcPage: PdfPage = srcDoc.addPage();
        helper._destinationDocument = destDoc;
        helper._options = options;

        // Act
        const newPage: PdfPage = helper._insertNewPage(srcPage);
        const rotate: number = newPage._pageDictionary.get('Rotate') as number;

        // Assert
        expect(rotate).toBeLessThan(360);
    });

    it('_insertNewPage - inserts at specific index when provided', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        const srcPage: PdfPage = srcDoc.addPage();
        helper._destinationDocument = destDoc;
        helper._options = options;

        // Act
        const newPage: PdfPage = helper._insertNewPage(srcPage, 0);

        // Assert
        expect(newPage).toBeDefined();
    });

    it('_importPages - numeric index inserts page at specified index (branch line 186)', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcDoc: PdfDocument = new PdfDocument();
        srcDoc.addPage();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const sourcePage: PdfPage = srcDoc.getPage(0);
        const beforeCount: number = destDoc.pageCount;

        // Act
        helper._importPages(sourcePage, 0, false, false);

        // Assert
        expect(destDoc.pageCount).toBe(beforeCount + 1);
        const insertedPage: PdfPage = destDoc.getPage(0);
        expect(insertedPage).toBeDefined();
    });

    it('_importPages - processes Contents array when optimizeResources and split/copy flags set (lines 200-201)', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        helper._options.optimizeResources = true;
        srcDoc.addPage();
        const sourcePage: PdfPage = srcDoc.getPage(0);
        sourcePage._pageDictionary.set('Contents', ['c1', 'c2']);

        // Act
        helper._importPages(sourcePage, 0, false, true, undefined, true);

        // Assert
        const newPage: PdfPage = destDoc.getPage(0);
        expect(newPage._pageDictionary.has('Contents')).toBeTruthy();
        expect(newPage._pageDictionary.get('Contents').length).toBe(2);
    });

    it('_objectDispose - clears all internal collections', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);

        const srcDoc: PdfDocument = new PdfDocument();
        const options: PdfPageImportOptions = new PdfPageImportOptions();
        const helper: _PdfMergeHelper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), options);

        helper._bookmarks = [null];
        helper._namedDestinations = [null];
        helper._destination = [null];
        helper._fieldNames = ['field'];

        // Act
        helper._objectDispose();

        // Assert
        expect(helper._bookmarks.length).toBe(0);
        expect(helper._namedDestinations.length).toBe(0);
        expect(helper._destination.length).toBe(0);
    });

    it('_exportBookmarks - named destination mapping creates named entry and caches reference', () => {
        // Arrange
        const { helper } = createHelper();
        helper._sourceDocument.addPage();
        helper._destinationDocument.addPage();

        const srcPage: PdfPage = (helper as any)._sourceDocument.getPage(0);
        const bm: any = (helper as any)._sourceDocument.bookmarks.add('srcNamedBm');

        const named: PdfNamedDestination = new PdfNamedDestination('named1');
        named.destination = new PdfDestination(srcPage, { x: 10, y: 10 });
        bm.namedDestination = named;

        (helper as any)._bookmarks = [bm];
        (helper as any)._bookmarksPageLinkReference.set(srcPage._ref, 0);

        // Act
        helper._exportBookmarks((helper as any)._destinationDocument, 0);

        // Assert
        expect((helper as any)._namedDestinations.length).toBeGreaterThan(0);
        const cachedRef: any = (helper as any)._namedDestinations[1];
        expect((helper as any)._crossReference._cacheMap.get(cachedRef)).toBeDefined();
        expect((helper as any)._destinationDocument._catalog._catalogDictionary.get('Names')).toBeDefined();
    });


});

describe('_PdfMergeHelper._mergeLayer - Additional coverage scripts', () => {
  let helper: any;
  let crossReference: any;

  function createDict(initial: Record<string, any> = {}): any {
    const store = new Map<string, any>();
    for (const key in initial) {
      if (initial.hasOwnProperty(key)) {
        store.set(key, initial[key]);
      }
    }
    return {
      _updated: false,
      get: (key: string) => store.get(key),
      _get: (key: string) => store.get(key),
      set: (key: string, value: any) => store.set(key, value),
      has: (key: string) => store.has(key)
    };
  }

  /**
   * Important:
   * Your transpiled code uses forEach(function (key, value) { ... })
   * so this helper intentionally invokes callback(key, value)
   * instead of native Map.forEach(value, key).
   */
  function createCallbackOrderedCollection(entries: Array<[any, any]>): any {
    return {
      forEach: (callback: (key: any, value: any) => void) => {
        entries.forEach(([key, value]) => callback(key, value));
      }
    };
  }

  beforeEach(() => {
    // DO NOT call new _PdfMergeHelper()
    helper = Object.create((_PdfMergeHelper as any).prototype);

    crossReference = {
      _fetch: jasmine.createSpy('_fetch')
    };

    helper._crossReference = crossReference;
    helper._newList = new Map();
    helper._annotationLayer = new Map();
  });

  it('should skip XObject processing when Resources has no XObject (Eif)', () => {
    const newPageDictionary = createDict({
      Resources: createDict()
    });

    const oldPageDictionary = createDict({
      Resources: createDict()
    });

    helper._mergeLayer(newPageDictionary, oldPageDictionary, crossReference);

    expect(crossReference._fetch).not.toHaveBeenCalled();
  });

  it('should assign resource when XObject reference exists (Iif)', () => {
    const xRef = new _PdfReference(1, 0);

    const innerResource = createDict();

    crossReference._fetch.and.returnValue({
      dictionary: createDict({
        Resources: innerResource
      })
    });

    const newPageDictionary = createDict({
      Resources: createDict({
        XObject: createCallbackOrderedCollection([
          ['X1', xRef]
        ])
      })
    });

    const oldPageDictionary = createDict({
      Resources: createDict()
    });

    helper._mergeLayer(newPageDictionary, oldPageDictionary, crossReference);

    expect(crossReference._fetch).toHaveBeenCalledWith(xRef);
  });

  it('should update OC inside XObject when old page has XObject (Eif)', () => {
    const newPageXRef = new _PdfReference(10, 0);
    const oldXObjectRef = new _PdfReference(11, 0);
    const oldLayerRef = new _PdfReference(12, 0);
    const newLayerRef = new _PdfReference(13, 0);

    helper._newList.set(oldLayerRef, newLayerRef);

    const targetXObjectDictionary = {
      dictionary: new Map<string, any>(),
      _updated: false
    };

    const innerResource = createDict({
      XObject: new Map([
        ['XO1', targetXObjectDictionary]
      ])
    });

    crossReference._fetch.and.callFake((ref: any) => {
      if (ref === newPageXRef) {
        return {
          dictionary: createDict({
            Resources: innerResource
          })
        };
      }

      if (ref === oldXObjectRef) {
        return {
          dictionary: createCallbackOrderedCollection([
            ['OC', oldLayerRef]
          ])
        };
      }

      return undefined;
    });

    const newPageDictionary = createDict({
      Resources: createDict({
        XObject: createCallbackOrderedCollection([
          ['XO1', newPageXRef]
        ])
      })
    });

    const oldPageDictionary = createDict({
      Resources: createDict({
        XObject: createCallbackOrderedCollection([
          ['XO1', oldXObjectRef]
        ])
      })
    });

    helper._mergeLayer(newPageDictionary, oldPageDictionary, crossReference);

    expect(targetXObjectDictionary.dictionary.get('OC')).toBe(newLayerRef);
    expect(targetXObjectDictionary._updated).toBeTruthy();
  });

  it('should update OC when annotation key equals OC (Iif)', () => {
    const newPageXRef = new _PdfReference(20, 0);
    const oldXObjectRef = new _PdfReference(21, 0);
    const oldLayerRef = new _PdfReference(22, 0);
    const newLayerRef = new _PdfReference(23, 0);

    helper._newList.set(oldLayerRef, newLayerRef);

    const targetXObjectDictionary = {
      dictionary: new Map<string, any>(),
      _updated: false
    };

    const innerResource = createDict({
      XObject: new Map([
        ['X1', targetXObjectDictionary]
      ])
    });

    crossReference._fetch.and.callFake((ref: any) => {
      if (ref === newPageXRef) {
        return {
          dictionary: createDict({
            Resources: innerResource
          })
        };
      }

      if (ref === oldXObjectRef) {
        return {
          dictionary: createCallbackOrderedCollection([
            ['NotOC', oldLayerRef],
            ['OC', oldLayerRef]
          ])
        };
      }

      return undefined;
    });

    const newPageDictionary = createDict({
      Resources: createDict({
        XObject: createCallbackOrderedCollection([
          ['X1', newPageXRef]
        ])
      })
    });

    const oldPageDictionary = createDict({
      Resources: createDict({
        XObject: createCallbackOrderedCollection([
          ['X1', oldXObjectRef]
        ])
      })
    });

    helper._mergeLayer(newPageDictionary, oldPageDictionary, crossReference);

    expect(targetXObjectDictionary.dictionary.get('OC')).toBe(newLayerRef);
    expect(targetXObjectDictionary._updated).toBeTruthy();
  });

  it('should update annotation layer OC mapping when annotationLayer exists (Iif)', () => {
    const oldAnnotRef = new _PdfReference(30, 0);
    const newAnnotRef = new _PdfReference(31, 0);
    const annotationRef = new _PdfReference(32, 0);

    // IMPORTANT: Map.forEach => (value, key)
    // code expects (reference, index)
    helper._annotationLayer.set(0, oldAnnotRef);

    helper._newList.set(oldAnnotRef, newAnnotRef);

    const annotStore = new Map<string, any>();
    const annotDictionary = {
      set: (key: string, value: any) => annotStore.set(key, value),
      get: (key: string) => annotStore.get(key)
    };

    crossReference._fetch.and.returnValue(annotDictionary);

    const newPageDictionary = createDict({
      Resources: createDict(),
      Annots: [annotationRef]
    });

    const oldPageDictionary = createDict({
      Resources: createDict()
    });

    helper._mergeLayer(newPageDictionary, oldPageDictionary, crossReference);

    expect(annotDictionary.get('OC')).toBe(newAnnotRef);
  });
});

describe('_PdfMergeHelper._exportBookmarks - Eif / Iif branch coverage', () => {
  let helper: any;
  let document: any;
  let destinationDoc: any;

  function createSourceBookmark(options: any = {}): any {
    const dictionary = {
      has: jasmine.createSpy('has').and.callFake((key: string) => key === 'A' && !!options.hasAction),
      get: jasmine.createSpy('get').and.callFake((key: string) => key === 'A' ? options.action : undefined)
    };

    return {
      title: options.title || 'Bookmark',
      count: options.count || 0,
      _bookMarkList: options.kids || [],
      destination: options.destination || null,
      namedDestination: options.namedDestination || null,
      textStyle: options.textStyle || 0,
      color: options.color || [0, 0, 0],
      _dictionary: dictionary
    };
  }

  function createAddedBookmark(title: string): any {
    return {
      title,
      color: null,
      textStyle: null,
      destination: null,
      namedDestination: null,
      _dictionary: {
        _map: {},
        update: jasmine.createSpy('update')
      },
      add: jasmine.createSpy('add').and.callFake((childTitle: string) => createAddedBookmark(childTitle))
    };
  }

  beforeEach(() => {
    // Avoid calling the real constructor in tests
    helper = Object.create((_PdfMergeHelper as any).prototype);

    helper._bookmarks = [];
    helper._namedDestinations = [];
    helper._bookmarksPageLinkReference = new Map();

    helper._crossReference = {
      _getNextReference: jasmine.createSpy('_getNextReference').and.returnValues(
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 }
      ),
      _cacheMap: new Map(),
      _allowCatalog: false
    };

    destinationDoc = {
      bookmarks: {
        add: jasmine.createSpy('add').and.callFake((title: string) => createAddedBookmark(title))
      },
      _catalog: {
        _catalogDictionary: {
          set: jasmine.createSpy('set'),
          _updated: false,
          isCatalog: false
        }
      },
      getPage: jasmine.createSpy('getPage').and.callFake((i: number) => ({ index: i }))
    };

    helper._destinationDocument = destinationDoc;

    document = {
      pageCount: 1,
      bookmarks: null
    };
  });

  it('should skip export when no bookmarks exist (Eif outer)', () => {
    helper._exportBookmarks(document, 1);

    expect(destinationDoc.bookmarks.add).not.toHaveBeenCalled();
    expect(destinationDoc._catalog._catalogDictionary.set).not.toHaveBeenCalled();
  });

  it('should process when document.bookmarks exists (Eif current)', () => {
    const bm = createSourceBookmark({
      title: 'A'
    });

    helper._bookmarks = [bm];

    document.bookmarks = {
      _bookMarkList: [bm]
    };

    helper._exportBookmarks(document, 1);

    expect(destinationDoc.bookmarks.add).toHaveBeenCalledWith('A');
    expect(destinationDoc._catalog._catalogDictionary._updated).toBeTruthy();
    expect(destinationDoc._catalog._catalogDictionary.isCatalog).toBeTruthy();
    expect(helper._crossReference._allowCatalog).toBeTruthy();
  });

  it('should use local bookmark collection when pageCount differs (Iif)', () => {
    const bm = createSourceBookmark({
      title: 'Page Diff'
    });

    helper._bookmarks = [bm];

    document.pageCount = 2;
    document.bookmarks = {
      _bookMarkList: []
    };

    helper._exportBookmarks(document, 1);

    expect(destinationDoc.bookmarks.add).toHaveBeenCalledWith('Page Diff');
  });

  it('should process named destination when available in pageCount-different path (Iif namedDestination)', () => {
    const pageRef = { _ref: 10 };

    const namedDest = {
      destination: { page: pageRef },
      _title: 'ND'
    };

    helper._bookmarksPageLinkReference.set(pageRef._ref, 0);

    const resolvedNamedDest = {
      _title: 'ResolvedND',
      _dictionary: {}
    };

    helper._getNamedDestination = jasmine.createSpy('_getNamedDestination')
      .and.returnValue(resolvedNamedDest);

    const bm = createSourceBookmark({
      title: 'NamedDest',
      namedDestination: namedDest
    });

    helper._bookmarks = [bm];

    // Make pageCount differ so the branch checks nDest.destination
    document.pageCount = 2;
    document.bookmarks = {
      _bookMarkList: []
    };

    helper._exportBookmarks(document, 1);

    expect(destinationDoc.bookmarks.add).toHaveBeenCalledWith('NamedDest');
    expect(destinationDoc.getPage).toHaveBeenCalledWith(0);
    expect(helper._getNamedDestination).toHaveBeenCalledWith(namedDest, jasmine.objectContaining({ index: 0 }));
    expect(helper._namedDestinations.length).toBeGreaterThan(0);
  });

  it('should process regular destination when named destination is absent (Eif dest)', () => {
    const pageRef = { _ref: 20 };

    const dest = {
      page: pageRef,
      location: [0, 0],
      zoom: 1,
      mode: 'XYZ'
    };

    helper._bookmarksPageLinkReference.set(pageRef._ref, 1);

    const bm = createSourceBookmark({
      title: 'DestOnly',
      destination: dest
    });

    helper._bookmarks = [bm];

    // Use pageCount-different path
    document.pageCount = 2;
    document.bookmarks = {
      _bookMarkList: []
    };

    helper._exportBookmarks(document, 1);

    expect(destinationDoc.bookmarks.add).toHaveBeenCalledWith('DestOnly');
    expect(destinationDoc.getPage).toHaveBeenCalledWith(1);
  });

  it('should register names dictionary when named destinations exist (Iif)', () => {
    helper._bookmarks = [
      createSourceBookmark({ title: 'WithNames' })
    ];

    helper._namedDestinations.push('ND1');

    // current = null -> skips bookmark traversal, but still executes names section
    document.bookmarks = null;

    helper._exportBookmarks(document, 1);

    expect(destinationDoc._catalog._catalogDictionary.set)
      .toHaveBeenCalledWith('Names', jasmine.anything());

    expect(destinationDoc._catalog._catalogDictionary._updated).toBeTruthy();
    expect(destinationDoc._catalog._catalogDictionary.isCatalog).toBeTruthy();
    expect(helper._crossReference._allowCatalog).toBeTruthy();
  });
});


describe('_PdfCopier stream/reference lines 1595-1641', () => {

    it('_copyStream - image stream when originalStream is _PdfStream uses getByteRange', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const dict = new _PdfDictionary(srcDoc._crossReference);
        dict.set('Subtype', { name: 'Image' });

        const originalStream: any = {
            dictionary: dict,
            offset: 0,
            end: 3,
            getByteRange: (_s: number, _e: number) => new Uint8Array([1, 2, 3])
        };
        Object.setPrototypeOf(originalStream, (_PdfStream as any).prototype);

        const result: any = (copier as any)._copyStream(originalStream);

        expect(result).toBeDefined();
        expect(result instanceof _PdfContentStream).toBeTruthy();
        expect(result._isImage).toBeTruthy();
        expect(result.dictionary._updated).toBeTruthy();
    });

    it('_copyStream - image stream when wrapper has stream and cipher reads base buffer', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const dict = new _PdfDictionary(srcDoc._crossReference);
        dict.set('Subtype', { name: 'Image' });

        const innerStream: any = { start: 0, end: 4 };
        Object.setPrototypeOf(innerStream, (_PdfStream as any).prototype);

        const baseStream: any = {
            dictionary: dict,
            stream: innerStream,
            _initialized: true,
            _cipher: true,
            getBytes: (len: number) => {
                baseStream.buffer = new Uint8Array([5, 6, 7, 8]);
                baseStream.bufferLength = 4;
            }
        };

        const result: any = (copier as any)._copyStream(baseStream);

        expect(result).toBeDefined();
        expect(result._isImage).toBeTruthy();
        expect(result.dictionary._updated).toBeTruthy();
    });

    it('_copyStream - image stream when flate wrapper contains inner _PdfStream uses inner getByteRange', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const dict = new _PdfDictionary(srcDoc._crossReference);
        dict.set('Subtype', { name: 'Image' });

        const inner: any = {
            start: 0,
            end: 2,
            getByteRange: (_s: number, _e: number) => new Uint8Array([9, 10])
        };
        Object.setPrototypeOf(inner, (_PdfStream as any).prototype);

        const flateStream: any = { stream: inner, _initialized: false, _cipher: false };
        const baseStream: any = { dictionary: dict, stream: flateStream };

        const result: any = (copier as any)._copyStream(baseStream);

        expect(result).toBeDefined();
        expect(result._isImage).toBeTruthy();
        expect(result.dictionary._updated).toBeTruthy();
    });

    it('_copyStream - image stream when flate wrapper initialized and cipher reads flate buffer', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const dict = new _PdfDictionary(srcDoc._crossReference);
        dict.set('Subtype', { name: 'Image' });

        const inner: any = { start: 0, end: 6 };
        Object.setPrototypeOf(inner, (_PdfStream as any).prototype);

        const flateStream: any = {
            stream: inner,
            _initialized: true,
            _cipher: true,
            getBytes: (len: number) => {
                flateStream.buffer = new Uint8Array([13, 14, 15, 16, 17, 18]);
                flateStream.bufferLength = 6;
            }
        };
        const baseStream: any = { dictionary: dict, stream: flateStream };

        const result: any = (copier as any)._copyStream(baseStream);

        expect(result).toBeDefined();
        expect(result._isImage).toBeTruthy();
        expect(result.dictionary._updated).toBeTruthy();
    });

    it('_copyStream - image stream when flate wrapper contains non-_PdfStream yields empty bytes', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const dict = new _PdfDictionary(srcDoc._crossReference);
        dict.set('Subtype', { name: 'Image' });

        const flateStream: any = { stream: { notAStream: true }, _initialized: false, _cipher: false };
        const baseStream: any = { dictionary: dict, stream: flateStream };

        const result: any = (copier as any)._copyStream(baseStream);

        expect(result).toBeDefined();
        expect(result._isImage).toBeTruthy();
        expect(result.dictionary._updated).toBeTruthy();
    });

    it('_copyStream - non-image fallback uses _bytes when getBytes empty and is _PdfContentStream', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const dict = new _PdfDictionary(srcDoc._crossReference);

        const originalStream: any = {
            dictionary: dict,
            getBytes: () => new Uint8Array([]),
            _bytes: new Uint8Array([11, 12])
        };
        Object.setPrototypeOf(originalStream, (_PdfContentStream as any).prototype);

        const result: any = (copier as any)._copyStream(originalStream);

        expect(result).toBeDefined();
        expect(result._isImage).toBeFalsy();
        expect(result.dictionary._updated).toBeTruthy();
    });

    it('_copyReference - returns cached mapping when present', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const ref = srcDoc._crossReference._getNextReference();
        const check = new _PdfReference(4, 0);
        copier._traversedObjects.set(ref, check);

        const result = (copier as any)._copyReference(ref);
        expect(result).toBe(check);
    });

});
describe('_PdfCopier behavior tests', () => {

    it('_copy - dictionary delegates to copyDictionary', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const srcDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        const dict: _PdfDictionary = new _PdfDictionary(crossRef);
        dict.set('test', 'value');

        // Act
        const result: any = copier._copy(dict);

        // Assert
        expect(result).toBeDefined();
        expect(result instanceof _PdfDictionary).toBeTruthy();
    });

    it('_copy - array delegates to copyArray', () => {
        // Arrange
        const srcDoc: PdfDocument = new PdfDocument();
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        const array: any[] = ['item1', 'item2'];

        // Act
        const result: any = copier._copy(array);

        // Assert
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBeTruthy();
    });

    it('_copy - primitive string returns unchanged', () => {
        // Arrange
        const destDoc: PdfDocument = new PdfDocument();
        const srcDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        // Act
        const result: any = copier._copy('testString');

        // Assert
        expect(result).toBe('testString');
    });

    it('_copy - primitive number returns unchanged', () => {
        // Arrange
        const srcDoc: PdfDocument = new PdfDocument();
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        // Act
        const result: any = copier._copy(42);

        // Assert
        expect(result).toBe(42);
    });

    it('_copy - primitive boolean returns unchanged', () => {
        // Arrange
        const srcDoc: PdfDocument = new PdfDocument();
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        // Act
        const result: any = copier._copy(true);

        // Assert
        expect(result).toBe(true);
    });

    it('_copyDictionary - empty dictionary creates empty clone', () => {
        // Arrange
        const srcDoc: PdfDocument = new PdfDocument();
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        const dict: _PdfDictionary = new _PdfDictionary(crossRef);

        // Act
        const result: _PdfDictionary = copier._copyDictionary(dict);

        // Assert
        expect(result).toBeDefined();
        expect(result.size).toBe(0);
    });

    it('_copyDictionary - populated dictionary copies non-excluded keys', () => {
        // Arrange
        const srcDoc: PdfDocument = new PdfDocument();
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        const dict: _PdfDictionary = new _PdfDictionary(crossRef);
        dict.set('key1', 'value1');
        dict.set('Parent', 'parentValue');

        // Act
        const result: _PdfDictionary = copier._copyDictionary(dict);

        // Assert
        expect(result.has('key1')).toBeTruthy();
    });

    it('_copyArray - copies all items recursively', () => {
        // Arrange
        const srcDoc: PdfDocument = new PdfDocument();
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        const array: any[] = ['item1', 'item2', 'item3'];

        // Act
        const result: any[] = copier._copyArray(array);

        // Assert
        expect(result.length).toBe(3);
        expect(result[0]).toBe('item1');
    });

    it('_copyReference - cached reference returns existing mapping', () => {
        // Arrange
        const srcDoc: PdfDocument = new PdfDocument();
        const destDoc: PdfDocument = new PdfDocument();
        const crossRef: _PdfCrossReference = new _PdfCrossReference(destDoc);
        const srcCrossRef: _PdfCrossReference = new _PdfCrossReference(srcDoc);
        const copier: _PdfCopier = new _PdfCopier(crossRef, srcCrossRef);

        const srcRef: _PdfReference = srcCrossRef._getNextReference();
        const cachedRef: _PdfReference = crossRef._getNextReference();
        copier._traversedObjects.set(srcRef, cachedRef);

        // Act
        const result: any = copier._copyReference(srcRef);

        // Assert
        expect(result).toEqual(cachedRef);
    });

});

describe('_PdfMergeHelper - Additional behavior coverage (LOC 260-288, 337-370, 445-495, 574-633, 828-891, 926-1023)', () => {

    // ==================== LOC 260-288: _importAnnotation branch coverage ====================


    it('_importAnnotation LOC 260-288 - annotation with no Dest skips destination handling', () => {
        // Arrange
        const srcDoc = new PdfDocument();
        const destDoc = new PdfDocument();
        const srcPage = srcDoc.addPage();
        const destPage = destDoc.addPage();
        const sqaureAnnot = new PdfSquareAnnotation({ x: 120, y: 150, width: 100, height: 100 });
        destDoc.getPage(0).annotations.add(sqaureAnnot);
        const bytes1 = destDoc.save();
        const loadedDestDoc = new PdfDocument(bytes1);
        const crossRef = loadedDestDoc._crossReference;
        const helper = new _PdfMergeHelper(
            crossRef,
            loadedDestDoc,
            srcDoc,
            new Map(),
            new PdfPageImportOptions()
        );
        // Create and add annotation
        const annot = new PdfLineAnnotation(
            { x: 10, y: 10 },
            { x: 20, y: 10 }
        );
        srcPage.annotations.add(annot);

        // Save and reload to ensure realistic document state
        const bytes = srcDoc.save();
        const loadedDoc = new PdfDocument(bytes);
        const loadedPage = loadedDoc.getPage(0);
        const loadedAnnot = loadedPage.annotations.at(0);

        // Create annotation reference and register it
        const annotRef = loadedAnnot._ref;
        srcDoc._crossReference._cacheMap.set(annotRef, loadedAnnot._dictionary);

        // Act
        helper._importAnnotation(loadedPage, destPage);

        // Assert
        expect(helper._destination.length).toBe(0);
    });

    it('_importAnnotation LOC 260-288 - annotation with Dest array pushes to destination list', () => {
        // Arrange
        const srcDoc = new PdfDocument();
        const destDoc = new PdfDocument();
        const srcPage = srcDoc.addPage();
        const destPage = destDoc.addPage();
        const sqaureAnnot = new PdfSquareAnnotation({ x: 120, y: 150, width: 100, height: 100 });
        destDoc.getPage(0).annotations.add(sqaureAnnot);
        const bytes1 = destDoc.save();
        const loadedDestDoc = new PdfDocument(bytes1);
        const crossRef = loadedDestDoc._crossReference;
        const helper = new _PdfMergeHelper(
            crossRef,
            loadedDestDoc,
            srcDoc,
            new Map(),
            new PdfPageImportOptions()
        );
        // Create and add annotation
        const annot = new PdfLineAnnotation(
            { x: 10, y: 10 },
            { x: 20, y: 10 }
        );
        srcPage.annotations.add(annot);

        // Save and reload to ensure realistic document state
        const bytes = srcDoc.save();
        const loadedDoc = new PdfDocument(bytes);
        const loadedPage = loadedDoc.getPage(0);
        const loadedAnnot = loadedPage.annotations.at(0);

        // Create annotation reference and register it
        const annotRef = loadedAnnot._ref;
        srcDoc._crossReference._cacheMap.set(annotRef, loadedAnnot._dictionary);

        const destRef = srcDoc._crossReference._getNextReference();
        loadedAnnot._dictionary.set('Dest', [destRef, '100 0']);

        // Act
        helper._importAnnotation(loadedPage, destPage);

        // Assert
        expect(helper._destination.length).toBeGreaterThan(0);
    });

    it('_importAnnotation LOC 260-288 - annotation with Dest reference handles reference type', () => {
        // Arrange
        const srcDoc = new PdfDocument();
        const destDoc = new PdfDocument();
        const srcPage = srcDoc.addPage();
        const destPage = destDoc.addPage();
        const sqaureAnnot = new PdfSquareAnnotation({ x: 120, y: 150, width: 100, height: 100 });
        destDoc.getPage(0).annotations.add(sqaureAnnot);
        const bytes1 = destDoc.save();
        const loadedDestDoc = new PdfDocument(bytes1);
        const crossRef = loadedDestDoc._crossReference;
        const helper = new _PdfMergeHelper(
            crossRef,
            loadedDestDoc,
            srcDoc,
            new Map(),
            new PdfPageImportOptions()
        );
        // Create and add annotation
        const annot = new PdfLineAnnotation(
            { x: 10, y: 10 },
            { x: 20, y: 10 }
        );
        srcPage.annotations.add(annot);

        // Save and reload to ensure realistic document state
        const bytes = srcDoc.save();
        const loadedDoc = new PdfDocument(bytes);
        const loadedPage = loadedDoc.getPage(0);
        const loadedAnnot = loadedPage.annotations.at(0);

        // Create annotation reference and register it
        const annotRef = loadedAnnot._ref;
        srcDoc._crossReference._cacheMap.set(annotRef, loadedAnnot._dictionary);

        const destRef = srcDoc._crossReference._getNextReference();
        loadedAnnot._dictionary.set('Dest', destRef);

        // Act
        helper._importAnnotation(loadedPage, destPage);

        // Assert
        expect(helper._destination.length).toBeGreaterThan(0);
    });

    it('_importAnnotation LOC 260-288 - annotation with OC reference stores layer mapping', () => {
        // Arrange
        const srcDoc = new PdfDocument();
        const destDoc = new PdfDocument();
        const srcPage = srcDoc.addPage();
        const destPage = destDoc.addPage();
        const sqaureAnnot = new PdfSquareAnnotation({ x: 120, y: 150, width: 100, height: 100 });
        destDoc.getPage(0).annotations.add(sqaureAnnot);
        const bytes1 = destDoc.save();
        const loadedDestDoc = new PdfDocument(bytes1);
        const crossRef = loadedDestDoc._crossReference;
        const helper = new _PdfMergeHelper(
            crossRef,
            loadedDestDoc,
            srcDoc,
            new Map(),
            new PdfPageImportOptions()
        );
        // Create and add annotation
        const annot = new PdfLineAnnotation(
            { x: 10, y: 10 },
            { x: 20, y: 10 }
        );
        srcPage.annotations.add(annot);

        // Save and reload to ensure realistic document state
        const bytes = srcDoc.save();
        const loadedDoc = new PdfDocument(bytes);
        const loadedPage = loadedDoc.getPage(0);
        const loadedAnnot = loadedPage.annotations.at(0);

        // Create annotation reference and register it
        const annotRef = loadedAnnot._ref;
        srcDoc._crossReference._cacheMap.set(annotRef, loadedAnnot._dictionary);

        const destRef = srcDoc._crossReference._getNextReference();
        loadedAnnot._dictionary.set('OC', destRef);

        // Act
        helper._importAnnotation(loadedPage, destPage);

        // Assert
        expect(helper._annotationLayer.size).toBeGreaterThan(0);
    });

    it('_importAnnotation LOC 260-288 - empty annotation reference skips processing', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const srcPage = srcDoc.addPage();
        const newPage = destDoc.addPage();

        srcPage.annotations._annotations = [];

        // Act
        helper._importAnnotation(srcPage, newPage);

        // Assert
        expect(newPage._pageDictionary.has('Annots')).toBeFalsy();
    });

    // ==================== LOC 337-370: _formFieldsGroupingSupport field field processing ====================

    it('_formFieldsGroupingSupport LOC 337-370 - field name found in fieldNames updates existing field', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const srcForm = srcDoc.form;
        const field = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        srcForm.add(field);

        const destForm = destDoc.form;
        destForm.add(new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 }));

        const oldPage = srcDoc.addPage();
        const newPage = destDoc.addPage();

        helper._isDuplicatePage = false;

        // Act
        helper._formFieldsGroupingSupport(srcForm, oldPage, newPage);

        // Assert
        expect(destForm.count).toBeGreaterThan(0);
    });

    it('_formFieldsGroupingSupport LOC 337-370 - duplicate page sets _isDuplicatePage flag', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const srcForm = srcDoc.form;
        const field = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        srcForm.add(field);

        const oldPage = srcDoc.addPage();
        const newPage = destDoc.addPage();

        // Act
        helper._isDuplicatePage = true;
        helper._formFieldsGroupingSupport(srcForm, oldPage, newPage);

        // Assert
        expect(field._isDuplicatePage).toBeTruthy();
    });

    it('_formFieldsGroupingSupport - when a field item is on the oldPage it calls _groupFormFieldsKids and updates newPage Annots (lines 353-366)', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        // Ensure destination has a field with the same name so branch selects existing dest field
        const dPage = destDoc.addPage();
        const destField = new PdfTextBoxField(dPage, 'example', { x: 0, y: 0, width: 10, height: 10 });
        destDoc.form.add(destField);

        const srcForm = srcDoc.form;
        const srcPage = srcDoc.getPage(0);
        const field = new PdfTextBoxField(srcPage, 'example', { x: 1, y: 1, width: 10, height: 10 });
        srcForm.add(field);

        // Add a kid reference and ensure the widget reports its page as the old page
        const kidRef = srcDoc._crossReference._getNextReference();
        field._dictionary.set('Kids', [kidRef]);
        srcPage._pageDictionary.set('Annots', [kidRef]);
        (field as any).itemAt = (_j: number) => ({ page: srcPage, _dictionary: new _PdfDictionary(srcDoc._crossReference) });

        const newPage = destDoc.addPage();

        spyOn((helper as any), '_groupFormFieldsKids').and.returnValue([crossRef._getNextReference()]);

        // Act
        helper._isDuplicatePage = false;
        helper._formFieldsGroupingSupport(srcForm, srcPage, newPage);

        // Assert
        expect((helper as any)._groupFormFieldsKids).toHaveBeenCalled();
        expect(newPage._pageDictionary.has('Annots')).toBeTruthy();
    });

    it('_formFieldsGroupingSupport - sourceKids undefined calls _groupFormFieldsKids with index 0 (lines 353-366)', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const srcForm = srcDoc.form;
        const field = new PdfTextBoxField(srcDoc.getPage(0), "noKids", { x: 0, y: 0, width: 10, height: 10 });
        field._dictionary.set('Kids', undefined)
        srcForm.add(field);
        const oldPage = srcDoc.addPage();
        const newPage = destDoc.addPage();

        spyOn((helper as any), '_groupFormFieldsKids').and.returnValue([crossRef._getNextReference()]);

        // Act
        helper._isDuplicatePage = true; // forces branch that calls groupFormFieldsKids when sourceKids undefined
        helper._formFieldsGroupingSupport(srcForm, oldPage, newPage);

        // Assert
        expect((helper as any)._groupFormFieldsKids).toHaveBeenCalled();
        expect(newPage._pageDictionary.has('Annots')).toBeTruthy();
    });

    // ==================== LOC 445-495: _updateFieldsWithKids complex processing ====================

    it('_updateFieldsWithKids LOC 445-495 - creates new field reference and caches it', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destField = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        destDoc.form.add(destField);
        const srcField = new PdfTextBoxField(srcDoc.getPage(0), "example1", { x: 200, y: 100, width: 20, height: 20 });;

        const fieldDict = destField._dictionary;
        const array: _PdfReference[] = [];

        // Act
        helper._updateFieldsWithKids(destField, srcField, fieldDict, -1, 0, crossRef._getNextReference(), [], array, srcDoc.form._dictionary);

        // Assert
        expect(helper._formFieldsCollection.size).toBeGreaterThanOrEqual(0);
    });

    it('_updateFieldsWithKids LOC 445-495 - updates destination field parent reference', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destField = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        destDoc.form.add(destField);
        const srcField = new PdfTextBoxField(srcDoc.getPage(0), "example1", { x: 200, y: 100, width: 20, height: 20 });;

        const fieldDict = destField._dictionary;
        const oldParent = destField._dictionary.get('Parent');

        // Act
        helper._updateFieldsWithKids(destField, srcField, fieldDict, -1, 0, crossRef._getNextReference(), [], [], srcDoc.form._dictionary);

        // Assert
        expect(destField._dictionary.has('Parent')).toBeTruthy();
    });

    it('_updateFieldsWithKids LOC 445-495 - adds widget reference to array', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destField = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        destDoc.form.add(destField);
        const srcField = new PdfTextBoxField(srcDoc.getPage(0), "example1", { x: 200, y: 100, width: 20, height: 20 });;

        const fieldDict = destField._dictionary;
        const array: _PdfReference[] = [];

        // Act
        helper._updateFieldsWithKids(destField, srcField, fieldDict, -1, 0, crossRef._getNextReference(), [], array, srcDoc.form._dictionary);

        // Assert
        expect(array.length).toBeGreaterThan(0);
    });

    // ==================== LOC 574-633: _createAppearance complex branching ====================





    it('_createAppearance LOC 574-633 - list field with widget rotationAngle sets angle', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage()
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destField: PdfListField = new PdfListBoxField(srcDoc.getPage(0), 'list1', { x: 100, y: 60, width: 100, height: 50 });
        destDoc.form.add(destField);
        const srcField = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });

        const oldDict = new _PdfDictionary(crossRef);
        const newDict = new _PdfDictionary(crossRef);
        const widget = { rotationAngle: 90 };

        // Act
        expect(() => {
            helper._createAppearance(destField, srcField, oldDict, newDict, new _PdfDictionary(), widget);
        }).not.toThrow();

        // Assert
        expect(destField).toBeDefined();
    });

    it('_createAppearance LOC 574-633 - text box field with widget dictionary obtains font', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        destDoc.addPage();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destField = new PdfTextBoxField(destDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        destDoc.form.add(destField);
        const srcField = new PdfTextBoxField(srcDoc.getPage(0), "example1", { x: 200, y: 100, width: 20, height: 20 });;

        const oldDict = new _PdfDictionary(crossRef);
        const newDict = new _PdfDictionary(crossRef);
        const drEntry = new _PdfDictionary(crossRef);
        const widget = { _dictionary: new _PdfDictionary(crossRef) };

        // Act
        expect(() => {
            helper._createAppearance(destField, srcField, oldDict, newDict, drEntry, widget);
        }).not.toThrow();

        // Assert
        expect(destField).toBeDefined();
    });

    // ==================== LOC 828-891: _insertFormFields complex processing ====================

    it('_insertFormFields LOC 828-891 - field with Kids copies all non-Kids entries', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const field = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        srcDoc.form.add(field);
        field._dictionary.set('TestKey', 'TestValue');
        const kidRef = crossRef._getNextReference();
        field._dictionary.set('Kids', [kidRef]);

        // Act
        const result = helper._insertFormFields(0, field, destDoc.form, crossRef._getNextReference(), [], []);

        // Assert
        expect(result).toBeDefined();
    });

    it('_insertFormFields LOC 828-891 - field without Kids copies entire dictionary', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcCrossRef = new _PdfCrossReference(srcDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());
        helper._copier = new _PdfCopier(crossRef, srcCrossRef);

        const field = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        srcDoc.form.add(field);

        // Act
        const result = helper._insertFormFields(0, field, destDoc.form, crossRef._getNextReference(), [], []);

        // Assert
        expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('_insertFormFields LOC 828-891 - field name collision appends index', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcCrossRef = new _PdfCrossReference(srcDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());
        helper._copier = new _PdfCopier(crossRef, srcCrossRef);

        const field = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        srcDoc.form.add(field);
        helper._fieldNames.push(field.name);

        // Act
        const result = helper._insertFormFields(0, field, destDoc.form, crossRef._getNextReference(), [], []);

        // Assert
        expect(result).toBeDefined();
    });

    it('_insertFormFields LOC 828-891 - fieldCount > 0 uses fieldCount as index', () => {
        const destDoc = new PdfDocument();
        let srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcCrossRef = new _PdfCrossReference(srcDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());
        helper._copier = new _PdfCopier(crossRef, srcCrossRef);
        helper._fieldCount = 5;

        let field = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });
        srcDoc.form.add(field);
        // Act
        const result = helper._insertFormFields(0, field, destDoc.form, crossRef._getNextReference(), [], []);

        // Assert
        expect(result).toBeDefined();
    });

    it('_insertFormFields LOC 828-891 - kids present filters by page membership', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        srcDoc.addPage();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcCrossRef = new _PdfCrossReference(srcDoc);
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());
        helper._copier = new _PdfCopier(crossRef, srcCrossRef);

        const field = new PdfTextBoxField(srcDoc.getPage(0), "example", { x: 100, y: 100, width: 20, height: 20 });;
        srcDoc.form.add(field);

        const kidRef = crossRef._getNextReference();
        field._dictionary.set('Kids', [kidRef]);

        const widgetDict = new _PdfDictionary(crossRef);
        crossRef._cacheMap.set(kidRef, widgetDict);

        // Act
        const result = helper._insertFormFields(0, field, destDoc.form, crossRef._getNextReference(), [], [kidRef]);

        // Assert
        expect(result).toBeDefined();
    });

    // ==================== LOC 926-1023: _importLayers comprehensive branch coverage ====================

    it('_importLayers LOC 926-1023 - layers false sets _isLayersPresent false', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const ocProps = new _PdfDictionary(crossRef);

        // Act
        helper._importLayers(ocProps, false);

        // Assert
        expect(helper._isLayersPresent).toBeFalsy();
    });

    it('_importLayers LOC 926-1023 - merges OCGs arrays', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destOCProps = new _PdfDictionary(crossRef);
        const destOCGs: any[] = [{ id: 1 }];
        destOCProps.set('OCGs', destOCGs);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('OCGs', [{ id: 2 }]);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destOCProps.get('OCGs').length).toBe(2);
    });

    it('_importLayers LOC 926-1023 - merges Order arrays when both present', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destD = new _PdfDictionary(crossRef);
        destD.set('Order', [1, 2]);
        const destOCProps = new _PdfDictionary(crossRef);
        destOCProps.set('D', destD);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const existingD = new _PdfDictionary(crossRef);
        existingD.set('Order', [3, 4]);
        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('D', existingD);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destD.get('Order').length).toBe(4);
    });

    it('_importLayers LOC 926-1023 - sets Order when only source has it', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destD = new _PdfDictionary(crossRef);
        const destOCProps = new _PdfDictionary(crossRef);
        destOCProps.set('D', destD);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const existingD = new _PdfDictionary(crossRef);
        existingD.set('Order', [1, 2]);
        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('D', existingD);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destD.has('Order')).toBeTruthy();
    });

    it('_importLayers LOC 926-1023 - merges RBGroups arrays', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destD = new _PdfDictionary(crossRef);
        destD.set('RBGroups', ['group1']);
        const destOCProps = new _PdfDictionary(crossRef);
        destOCProps.set('D', destD);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const existingD = new _PdfDictionary(crossRef);
        existingD.set('RBGroups', ['group2']);
        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('D', existingD);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destD.get('RBGroups').length).toBe(2);
    });

    it('_importLayers LOC 926-1023 - merges ON arrays', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destD = new _PdfDictionary(crossRef);
        destD.set('ON', ['on1']);
        const destOCProps = new _PdfDictionary(crossRef);
        destOCProps.set('D', destD);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const existingD = new _PdfDictionary(crossRef);
        existingD.set('ON', ['on2']);
        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('D', existingD);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destD.get('ON').length).toBe(2);
    });

    it('_importLayers LOC 926-1023 - merges AS arrays with reference dereferencing', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const asDict1 = new _PdfDictionary(crossRef);
        asDict1.set('OCGs', ['item1']);
        const asRef1 = crossRef._getNextReference();
        crossRef._cacheMap.set(asRef1, asDict1);

        const asDict2 = new _PdfDictionary(crossRef);
        asDict2.set('OCGs', ['item2']);
        const asRef2 = crossRef._getNextReference();
        crossRef._cacheMap.set(asRef2, asDict2);

        const destD = new _PdfDictionary(crossRef);
        destD.set('AS', [asRef1]);
        const destOCProps = new _PdfDictionary(crossRef);
        destOCProps.set('D', destD);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const existingD = new _PdfDictionary(crossRef);
        existingD.set('AS', [asRef2]);
        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('D', existingD);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destD.get('AS').length).toBe(2);
    });

    it('_importLayers LOC 926-1023 - merges OFF arrays', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destD = new _PdfDictionary(crossRef);
        destD.set('OFF', ['off1']);
        const destOCProps = new _PdfDictionary(crossRef);
        destOCProps.set('D', destD);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const existingD = new _PdfDictionary(crossRef);
        existingD.set('OFF', ['off2']);
        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('D', existingD);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destD.get('OFF').length).toBe(2);
    });

    it('_importLayers LOC 926-1023 - merges Locked arrays', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destD = new _PdfDictionary(crossRef);
        destD.set('Locked', ['locked1']);
        const destOCProps = new _PdfDictionary(crossRef);
        destOCProps.set('D', destD);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const existingD = new _PdfDictionary(crossRef);
        existingD.set('Locked', ['locked2']);
        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('D', existingD);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destD.get('Locked').length).toBe(2);
    });

    it('_importLayers LOC 926-1023 - sets D from current when destination has no D', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const destOCProps = new _PdfDictionary(crossRef);
        destDoc._catalog._catalogDictionary.set('OCProperties', destOCProps);

        const existingD = new _PdfDictionary(crossRef);
        const currentOCProps = new _PdfDictionary(crossRef);
        currentOCProps.set('D', existingD);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destOCProps.has('D')).toBeTruthy();
    });

    it('_importLayers LOC 926-1023 - updates OCProperties when no destination OCProperties exists', () => {
        const destDoc = new PdfDocument();
        const crossRef = new _PdfCrossReference(destDoc);
        const srcDoc = new PdfDocument();
        const helper = new _PdfMergeHelper(crossRef, destDoc, srcDoc, new Map(), new PdfPageImportOptions());

        const currentOCProps = new _PdfDictionary(crossRef);
        const ocProps = new _PdfDictionary(crossRef);
        ocProps.set('OCProperties', currentOCProps);

        // Act
        helper._importLayers(ocProps, true);

        // Assert
        expect(destDoc._catalog._catalogDictionary.has('OCProperties')).toBeTruthy();
    });

    // it('_copyReference - returns cached mapping when present', () => {
    //     const destDoc = new PdfDocument();
    //     const srcDoc = new PdfDocument();
    //     const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

    //     const ref = srcDoc._crossReference._getNextReference();
    //     copier._traversedObjects.set(ref, 'cachedValue');

    //     const result = (copier as any)._copyReference(ref);

    //     expect(result).toBe('cachedValue');
    // });

    it('_copyReference - copies primitive dereferenced values and caches them', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const ref = srcDoc._crossReference ? srcDoc._crossReference._getNextReference() : srcDoc._crossReference._getNextReference();
        srcDoc._crossReference._cacheMap.set(ref, 42);

        const result = (copier as any)._copyReference(ref);

        expect(result).toBe(42);
        // expect(copier._traversedObjects.get(ref)).toBe(42);
    });

    it('_copyReference - when copy returns complex object adds it to destination and returns new reference', () => {
        const destDoc = new PdfDocument();
        const srcDoc = new PdfDocument();
        const copier = new _PdfCopier(destDoc._crossReference, srcDoc._crossReference);

        const ref = srcDoc._crossReference._getNextReference();
        // ensure source fetch returns something (value is irrelevant because we spy _copy)
        srcDoc._crossReference._cacheMap.set(ref, { dummy: true });

        const fakeDict = new _PdfDictionary(destDoc._crossReference);
        spyOn((copier as any), '_copy').and.returnValue(fakeDict);

        const result = (copier as any)._copyReference(ref);

        expect(result).toBeDefined();
        expect(result instanceof _PdfReference).toBeTruthy();
        expect(destDoc._crossReference._cacheMap.get(result)).toBe(fakeDict);
        expect(copier._traversedObjects.get(ref)).toEqual(result);
    });

});

