
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    PdfButtonField,
    PdfCheckBoxField,
    PdfComboBoxField,
    PdfField,
    PdfListField,
    PdfRadioButtonListField,
    PdfSignatureField,
    PdfTextBoxField
} from '../src/pdf/core/form/field';

import {
    PdfListFieldItem,
    PdfRadioButtonListItem,
    PdfStateItem,
    PdfWidgetAnnotation
} from '../src/pdf/core/annotations/annotation';

import { PdfPageOrientation } from '../src/pdf/core/enumerator';
import {
    PdfFont,
    PdfFontFamily,
    PdfFontStyle,
    PdfStandardFont
} from '../src/pdf/core/fonts/pdf-standard-font';

import { PdfForm } from '../src/pdf/core/form/form';
import { PdfTemplate } from '../src/pdf/core/graphics/pdf-template';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { PdfDocument, PdfPageSettings } from '../src/pdf/core/pdf-document';
import { PdfBookmarkBase, PdfNamedDestination } from '../src/pdf/core/pdf-outline';
import { PdfDestination, PdfPage } from '../src/pdf/core/pdf-page';
import { PdfPageImportOptions } from '../src/pdf/core/pdf-page-import-options';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { _PdfBaseStream, _PdfContentStream, _PdfStream } from '../src/pdf/core/base-stream';
import { PdfAnnotationCollection } from '../src/pdf/core/annotations/annotation-collection';
import { _PdfCopier, _PdfMergeHelper } from '../src/pdf/core/pdf-merge';

describe('_PdfMergeHelper - uncovered branch behavior tests', () => {
    let targetXref: any;
    let sourceXref: any;
    let destinationDocument: any;
    let sourceDocument: any;
    let pageReference: Map<_PdfDictionary, PdfPage>;
    let options: PdfPageImportOptions;
    let helper: any;

    function createReference(id: number): _PdfReference {
        const ref: any = Object.create((_PdfReference as any).prototype);
        ref.objectNumber = id;
        ref.generationNumber = 0;
        ref.toString = () => `${id} 0`;
        return ref as _PdfReference;
    }

    function createCrossReference(): any {
        let counter: number = 0;
        const xref: any = {
            _cacheMap: new Map<any, any>(),
            _allowCatalog: false,
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake(() => {
                counter += 1;
                return createReference(counter);
            }),
            _fetch: jasmine.createSpy('_fetch').and.callFake((ref: _PdfReference) => {
                return xref._cacheMap.get(ref);
            })
        };
        return xref;
    }

    function createDictionary(entries?: { [key: string]: any }, xref?: any): _PdfDictionary {
        const dict: _PdfDictionary = new _PdfDictionary(xref);
        if (entries) {
            Object.keys(entries).forEach((key: string) => {
                dict.update(key, entries[key]);
            });
        }
        return dict;
    }

    function createPage(index: number, xref: any): any {
        const pageRef: _PdfReference = createReference(1000 + index);
        const resources: _PdfDictionary = createDictionary({
            XObject: createDictionary({}, xref)
        }, xref);

        const pageDictionary: _PdfDictionary = createDictionary({
            Resources: resources
        }, xref);

        return {
            _pageIndex: index,
            _ref: pageRef,
            _pageDictionary: pageDictionary,
            rotation: 1,
            size: { width: 100, height: 200 },
            graphics: {
                drawTemplate: jasmine.createSpy('drawTemplate')
            },
            _contentTemplate: {
                _size: { width: 100, height: 200 },
                _content: {
                    dictionary: createDictionary({}, xref)
                }
            },
            annotations: {
                _annotations: []
            }
        } as any;
    }

    function createFormStub(): any {
        return {
            count: 0,
            _dictionary: createDictionary({}, targetXref),
            _fields: [],
            _parsedFields: new Map<number, any>(),
            fieldAt: jasmine.createSpy('fieldAt'),
            _parseFields: jasmine.createSpy('_parseFields').and.callFake((dict: _PdfDictionary, ref: _PdfReference) => {
                return {
                    _dictionary: dict,
                    _ref: ref,
                    _kids: [] as any,
                    _annotationIndex: -1,
                    _name: dict.has('T') ? dict.get('T') : 'Field',
                    get name(): string {
                        return this._name;
                    }
                };
            })
        };
    }

    function createBookmarkNode(title: string, count: number = 0): any {
        const node: any = {
            title,
            color: [0, 0, 0],
            textStyle: 0,
            count,
            destination: null,
            namedDestination: null,
            _dictionary: createDictionary({}, targetXref),
            _bookMarkList: [],
            add: jasmine.createSpy('add').and.callFake((childTitle: string) => {
                const child: any = createBookmarkNode(childTitle, 0);
                node._bookMarkList.push(child);
                node.count = node._bookMarkList.length;
                return child;
            })
        };
        return node;
    }

    beforeEach(() => {
        targetXref = createCrossReference();
        sourceXref = createCrossReference();
        pageReference = new Map<_PdfDictionary, PdfPage>();
        options = new PdfPageImportOptions();

        destinationDocument = {
            _crossReference: targetXref,
            _catalog: {
                _catalogDictionary: createDictionary({}, targetXref)
            },
            _form: {
                _widgetReferences: [1, 2, 3]
            },
            form: createFormStub(),
            addPage: jasmine.createSpy('addPage').and.callFake((arg1: any, arg2?: any) => {
                const settings: any = typeof arg2 !== 'undefined' ? arg2 : arg1;
                const idx: number = typeof arg2 !== 'undefined' ? arg1 : 0;
                const page: any = createPage(idx, targetXref);
                page._pageDictionary = createDictionary({}, targetXref);
                page.size = settings.size;
                page.rotation = settings.rotation;
                return page;
            }),
            getPage: jasmine.createSpy('getPage').and.callFake((idx: number) => {
                const page: any = createPage(idx, targetXref);
                page._pageIndex = idx;
                return page;
            }),
            bookmarks: createBookmarkNode('root', 0),
            pageCount: 1
        };

        sourceDocument = {
            _crossReference: sourceXref,
            _catalog: {
                _catalogDictionary: createDictionary({}, sourceXref)
            },
            form: createFormStub(),
            _parseBookmarkDestination: jasmine.createSpy('_parseBookmarkDestination').and.returnValue(new Map())
        };

        helper = new _PdfMergeHelper(
            targetXref as _PdfCrossReference,
            destinationDocument as PdfDocument,
            sourceDocument as PdfDocument,
            pageReference,
            options
        ) as any;

        // Make copier deterministic but still valid
        helper._copier = {
            _copy: jasmine.createSpy('_copy').and.callFake((v: any) => v),
            _copyDictionary: jasmine.createSpy('_copyDictionary').and.callFake((dict: _PdfDictionary) => {
                const clone: _PdfDictionary = createDictionary({}, targetXref);
                if (dict && typeof dict.forEach === 'function') {
                    dict.forEach((key: string, value: any) => {
                        clone.update(key, value);
                    });
                }
                clone._updated = true;
                return clone;
            })
        };
    });


    it('should cover _importPages Contents array branch without missing loop completion', () => {
        // Arrange
        const page: any = createPage(1, sourceXref);
        const c1: _PdfReference = createReference(301);
        const c2: _PdfReference = createReference(302);
        const insertedPage: any = createPage(2, targetXref);
        options.optimizeResources = true;

        page._pageDictionary = createDictionary({
            Contents: [c1, c2],
            Resources: createDictionary({ ProcSet: ['PDF'] }, sourceXref)
        }, sourceXref);

        spyOn(helper, '_insertNewPage').and.returnValue(insertedPage);

        // Act
        helper._importPages(page, 0, false, false, options, true);

        // Assert
        expect(helper._insertNewPage).toHaveBeenCalledWith(page, 0);
        expect(insertedPage._pageDictionary.get('Contents')).toEqual([c1, c2]);
    });

    it('should cover _formFieldsGroupingSupport else branch by inserting a non-duplicate field', () => {
        // Arrange
        const oldPage: any = createPage(0, sourceXref);
        const newPage: any = createPage(1, targetXref);
        const kidsOnPage: _PdfReference[] = [createReference(11)];
        oldPage._pageDictionary.update('Annots', kidsOnPage);
        newPage._pageDictionary.update('Annots', []);

        const fieldDictionary: _PdfDictionary = createDictionary({}, sourceXref);
        const field: any = {
            name: 'UniqueField',
            _dictionary: fieldDictionary
        };

        const form: any = {
            count: 1,
            _dictionary: createDictionary({}, sourceXref),
            fieldAt: jasmine.createSpy('fieldAt').and.returnValue(field)
        };

        spyOn(helper, '_insertFormFields').and.returnValue([createReference(900)]);

        // Act
        helper._formFieldsGroupingSupport(form as PdfForm, oldPage, newPage);

        // Assert
        expect(helper._insertFormFields).toHaveBeenCalledWith(0, field, form, newPage._ref, [], kidsOnPage);
        expect(newPage._pageDictionary.get('Annots').length).toBe(1);
    });

    it('should cover _groupFormFieldsKids branch: field has Kids and destination has no Kids', () => {
        // Arrange
        const destinationField: any = Object.create((PdfTextBoxField as any).prototype);
        destinationField._dictionary = createDictionary({ T: 'DestField' }, targetXref);
        destinationField._ref = createReference(700);
        destinationField._crossReference = targetXref;

        const sourceField: any = Object.create((PdfTextBoxField as any).prototype);
        sourceField._dictionary = createDictionary({ Kids: [createReference(710)] }, sourceXref);
        sourceField._ref = createReference(701);
        sourceField._crossReference = sourceXref;

        const oldKidDict: _PdfDictionary = createDictionary({ AS: _PdfName.get('Yes') }, sourceXref);
        sourceXref._cacheMap.set(sourceField._dictionary.get('Kids')[0], oldKidDict);

        spyOn(helper, '_updateFieldsWithKids').and.stub();

        // Act
        helper._groupFormFieldsKids(
            destinationField,
            sourceField,
            [],
            [],
            sourceField._dictionary.get('Kids'),
            createReference(800),
            [],
            0,
            0,
            createDictionary({}, targetXref),
            undefined
        );

        // Assert
        expect(helper._updateFieldsWithKids).toHaveBeenCalled();
    });

    it('should cover _groupFormFieldsKids branch: source has no Kids and destination has Kids', () => {
        // Arrange
        const destinationField: any = Object.create((PdfTextBoxField as any).prototype);
        destinationField._dictionary = createDictionary({ Kids: [createReference(1)] }, targetXref);
        destinationField._ref = createReference(1001);

        const sourceField: any = Object.create((PdfTextBoxField as any).prototype);
        sourceField._dictionary = createDictionary({ AS: _PdfName.get('Off') }, sourceXref);
        sourceField._ref = createReference(1002);

        const array: _PdfReference[] = [];
        const destKids: _PdfReference[] = [];
        spyOn(helper, '_createAppearance').and.stub();

        // Act
        helper._groupFormFieldsKids(
            destinationField,
            sourceField,
            [],
            destKids,
            [],
            createReference(1003),
            array,
            0,
            0,
            createDictionary({}, targetXref),
            undefined
        );

        // Assert
        expect(array.length).toBe(1);
        expect(destKids.length).toBe(1);
        expect(helper._createAppearance).toHaveBeenCalled();
    });

    it('should cover _groupFormFieldsKids final branch: both source and destination without Kids', () => {
        // Arrange
        const destinationField: any = Object.create((PdfTextBoxField as any).prototype);
        destinationField._dictionary = createDictionary({ T: 'Dest' }, targetXref);
        destinationField._ref = createReference(1100);

        const sourceField: any = Object.create((PdfTextBoxField as any).prototype);
        sourceField._dictionary = createDictionary({ T: 'Src', FT: _PdfName.get('Tx') }, sourceXref);
        sourceField._ref = createReference(1101);

        spyOn(helper, '_updateFieldsWithKids').and.stub();

        // Act
        helper._groupFormFieldsKids(
            destinationField,
            sourceField,
            [],
            [],
            [],
            createReference(1102),
            [],
            0,
            0,
            createDictionary({}, targetXref),
            undefined
        );

        // Assert
        expect(helper._updateFieldsWithKids).toHaveBeenCalled();
    });

    it('should cover _updateFieldsWithKids branch with oldKids[index] and AS removal for textbox/button/combobox', () => {
        // Arrange
        const destinationField: any = Object.create((PdfTextBoxField as any).prototype);
        destinationField._dictionary = createDictionary({ T: 'Dest' }, targetXref);
        destinationField._ref = createReference(1200);

        const sourceField: any = Object.create((PdfTextBoxField as any).prototype);
        sourceField._dictionary = createDictionary({}, sourceXref);
        sourceField._crossReference = sourceXref;

        const oldKidRef: _PdfReference = createReference(1201);
        const oldKidDict: _PdfDictionary = createDictionary({ AS: _PdfName.get('On') }, sourceXref);
        sourceXref._cacheMap.set(oldKidRef, oldKidDict);

        destinationDocument.form._parseFields.and.callFake((dict: _PdfDictionary, ref: _PdfReference) => {
            return {
                _dictionary: dict,
                _ref: ref,
                _kids: [] as any,
                _annotationIndex: 0,
                _name: 'ParsedField',
                get name(): string { return this._name; }
            };
        });

        spyOn(helper, '_createAppearance').and.stub();

        const array: _PdfReference[] = [];
        const fieldDictionary: _PdfDictionary = createDictionary({ T: 'ParentField' }, targetXref);

        // Act
        helper._updateFieldsWithKids(
            destinationField,
            sourceField,
            fieldDictionary,
            0,
            5,
            createReference(1202),
            [oldKidRef],
            array,
            createDictionary({}, targetXref)
        );

        // Assert
        expect(array.length).toBe(1);
        const pushedRef: _PdfReference = array[0];
        const copiedDict: _PdfDictionary = targetXref._cacheMap.get(pushedRef);
        expect(copiedDict.has('AS')).toBeFalsy();
        expect(helper._createAppearance).toHaveBeenCalled();
    });

   

    it('should cover _obtainFont DS parsing branch including finite while loop trimming and comma split', () => {
        // Arrange
        const item: _PdfDictionary = createDictionary({
            DS: 'font: Helvetica,Arial 12pt;'
        }, sourceXref);

        const helvFontDict: _PdfDictionary = createDictionary({
            BaseFont: _PdfName.get('Helvetica-Bold')
        }, sourceXref);

        const formDictionary: _PdfDictionary = createDictionary({
            Font: createDictionary({
                Helvetica: helvFontDict
            }, sourceXref)
        }, sourceXref);

        spyOn(helper, '_getFontStyle').and.callThrough();

        // Act
        const font: PdfFont = helper._obtainFont(item, formDictionary);

        // Assert
        expect(helper._getFontStyle).toHaveBeenCalledWith('Helvetica-Bold');
        expect(font instanceof PdfStandardFont).toBeTruthy();
    });

    it('should cover _obtainFont DA branch with Tf and zero font size fallback to 8', () => {
        // Arrange
        const item: _PdfDictionary = createDictionary({
            DA: '/Cour 0 Tf'
        }, sourceXref);

        const formDictionary: _PdfDictionary = createDictionary({}, sourceXref);

        // Act
        const font: any = helper._obtainFont(item, formDictionary);

        // Assert
        expect(font instanceof PdfStandardFont).toBeTruthy();
    });


    it('should cover _importLayers set branches for RBGroups, ON, AS, OFF and Locked when current view misses them', () => {
        // Arrange
        const currentASRef: _PdfReference = createReference(2100);
        const existingASRef: _PdfReference = createReference(2101);

        const currentASDict: _PdfDictionary = createDictionary({ OCGs: [1] }, sourceXref);
        const existingASDict: _PdfDictionary = createDictionary({ OCGs: [2] }, sourceXref);
        targetXref._cacheMap.set(currentASRef, currentASDict);
        targetXref._cacheMap.set(existingASRef, existingASDict);

        const currentD: _PdfDictionary = createDictionary({}, targetXref);
        const existingD: _PdfDictionary = createDictionary({
            RBGroups: [1],
            ON: [2],
            AS: [existingASRef],
            OFF: [3],
            Locked: [4]
        }, sourceXref);

        const destinationOCProperties: _PdfDictionary = createDictionary({
            OCGs: [10],
            D: currentD
        }, targetXref);

        const sourceOCPropertiesInner: _PdfDictionary = createDictionary({
            OCGs: [11],
            D: existingD
        }, sourceXref);

        destinationDocument._catalog._catalogDictionary.update('OCProperties', destinationOCProperties);

        const sourceCatalogLike: _PdfDictionary = createDictionary({
            OCProperties: sourceOCPropertiesInner
        }, sourceXref);

        // Act
        helper._importLayers(sourceCatalogLike, true);

        // Assert
        expect(currentD.get('RBGroups')).toEqual([1]);
        expect(currentD.get('ON')).toEqual([2]);
        expect(currentD.get('AS')).toEqual([existingASRef]);
        expect(currentD.get('OFF')).toEqual([3]);
        expect(currentD.get('Locked')).toEqual([4]);
        expect(targetXref._allowCatalog).toBeTruthy();
    });

  

    it('should cover _writeObject for reference dereference path and null/undefined path', () => {
        // Arrange
        const doc: any = {
            _crossReference: {
                _fetch: jasmine.createSpy('_fetch').and.callFake((ref: _PdfReference) => {
                    return createDictionary({ K: 'V' }, targetXref);
                })
            }
        };

        const table: _PdfDictionary = createDictionary({}, targetXref);
        const ref: _PdfReference = createReference(3000);

        spyOn(helper, '_writeDictionary').and.callThrough();
        spyOn(helper, '_writePropertiesDictionary').and.callThrough();

        // Act - reference path
        helper._writeObject(doc, table, ref, createDictionary({}, targetXref), 'Child', []);

        // Act - undefined path
        helper._writeObject(doc, table, undefined, createDictionary({}, targetXref), 'Nothing', []);

        // Assert
        expect(doc._crossReference._fetch).toHaveBeenCalledWith(ref);
        expect(table.get('Child') instanceof _PdfDictionary).toBeTruthy();
        expect(table.get('Nothing')).toBe('null');
    });

    it('should cover _writePropertiesDictionary with reference value using dictionary.get(key)', () => {
        // Arrange
        const dict: _PdfDictionary = createDictionary({}, targetXref);
        const valueRef: _PdfReference = createReference(3100);
        const resolved: _PdfDictionary = createDictionary({ Name: 'Resolved' }, targetXref);

        dict.update('Child', valueRef);
        spyOn(dict, 'get').and.callFake((key: string) => {
            if (key === 'Child') {
                return resolved;
            }
            return undefined as any;
        });

        const table: _PdfDictionary = createDictionary({}, targetXref);
        const doc: any = { _crossReference: targetXref };

        // Act
        helper._writePropertiesDictionary(doc, table, dict);

        // Assert
        expect((dict.get as any)).toHaveBeenCalledWith('Child');
        expect(table.get('Child') instanceof _PdfDictionary).toBeTruthy();
    });

    it('should cover _fixDestinations for both remap-to-page-ref and null destination branches', () => {
        // Arrange
        const sourcePageDict1: _PdfDictionary = createDictionary({}, sourceXref);
        const sourcePageDict2: _PdfDictionary = createDictionary({}, sourceXref);

        const newPage1: any = createPage(0, targetXref);
        pageReference.set(sourcePageDict1, newPage1);
        pageReference.set(sourcePageDict2 as any, null as any);

        const ref1: _PdfReference = createReference(3200);
        const ref2: _PdfReference = createReference(3201);

        const doc: any = {
            _crossReference: {
                _fetch: jasmine.createSpy('_fetch').and.callFake((ref: _PdfReference) => {
                    if (ref === ref1) {
                        return sourcePageDict1;
                    }
                    return sourcePageDict2;
                })
            }
        };

        const dest1: any[] = [ref1, _PdfName.get('XYZ')];
        const dest2: any[] = [ref2, _PdfName.get('XYZ')];
        helper._destination = [dest1, dest2];

        // Act
        helper._fixDestinations(doc);

        // Assert
        expect(dest1[0]).toBe(newPage1._ref);
        expect(dest2[0]).toBeNull();
    });

    it('should cover _insertNewPage rotation else branch using page.rotation and modulo normalization', () => {
        // Arrange
        const page: any = createPage(0, sourceXref);
        page.rotation = 5; // 5 * 90 = 450 -> 450 % 360 = 90
        page.size = { width: 500, height: 200 }; // landscape
        page._pageDictionary.update('Rotate', 450);
        page._pageDictionary.update('MediaBox', [0, 0, 500, 200]);
        page._pageDictionary.update('CropBox', [0, 0, 400, 150]);

        helper._options = new PdfPageImportOptions(); // keep rotation undefined

        // Act
        const newPage: any = helper._insertNewPage(page);

        // Assert
        expect(destinationDocument.addPage).toHaveBeenCalled();
        expect(newPage._pageDictionary.get('Rotate')).toBe(90);
        expect(newPage._pageDictionary.get('MediaBox')).toEqual([0, 0, 500, 200]);
        expect(newPage._pageDictionary.get('CropBox')).toEqual([0, 0, 400, 150]);
    });

    it('should cover _objectDispose widget reference clearing branch', () => {
        // Arrange
        helper._bookmarkHashTable = new Map([[{} as any, []]]);
        helper._namedDestinations = ['A'];
        helper._bookmarks = ['B'];
        helper._pageReference = new Map([[createDictionary({}, targetXref), createPage(0, targetXref)]]);
        helper._bookmarksPageLinkReference.set(createReference(1), 0);
        helper._destination = [[1, 2]];
        helper._newList.set(createReference(2), createReference(3));
        helper._annotationLayer.set(0, createReference(4));
        helper._fieldNames = ['Field-1'];
        destinationDocument._form._widgetReferences = [10, 20, 30];

        // Act
        helper._objectDispose();

        // Assert
        expect(helper._namedDestinations).toEqual([]);
        expect(helper._bookmarks).toEqual([]);
        expect(helper._destination).toEqual([]);
        expect(helper._fieldNames).toEqual([]);
        expect(destinationDocument._form._widgetReferences).toEqual([]);
    });

    it('should cover _PdfCopier._copyStream image branch with baseStream.stream as _PdfStream (non-cipher) and no timeout', () => {
        // Arrange
        const copier: any = new _PdfCopier(targetXref, sourceXref);

        const innerStream: any = Object.create((_PdfStream as any).prototype);
        innerStream.start = 0;
        innerStream.end = 3;
        innerStream.getByteRange = jasmine.createSpy('getByteRange').and.returnValue(new Uint8Array([1, 2, 3]));

        const originalStream: any = Object.create((_PdfBaseStream as any).prototype);
        originalStream.dictionary = createDictionary({
            Subtype: _PdfName.get('Image')
        }, sourceXref);
        originalStream.stream = innerStream;

        // Act
        const copied: any = copier._copyStream(originalStream);

        // Assert
        expect(innerStream.getByteRange).toHaveBeenCalledWith(0, 3);
        expect(copied._isImage).toBeTruthy();
        expect(copied.dictionary._updated).toBeTruthy();
    });

    it('should cover _PdfCopier._copyStream non-image branch using _PdfContentStream._bytes when getBytes returns empty', () => {
        // Arrange
        const copier: any = new _PdfCopier(targetXref, sourceXref);

        const originalStream: any = Object.create((_PdfContentStream as any).prototype);
        originalStream.dictionary = createDictionary({}, sourceXref);
        originalStream.getBytes = jasmine.createSpy('getBytes').and.returnValue([]);
        originalStream._bytes = [9, 8, 7];

        // Act
        const copied: any = copier._copyStream(originalStream);

        // Assert
        expect(originalStream.getBytes).toHaveBeenCalled();
        expect(copied._bytes || copied.getBytes()).toBeDefined();
        expect(copied.dictionary._updated).toBeTruthy();
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('_PdfMergeHelper / _PdfCopier - exact uncovered line coverage', () => {
    let targetXref: any;
    let sourceXref: any;
    let destinationDocument: any;
    let sourceDocument: any;
    let helper: any;

    function createReference(id: number): _PdfReference {
        const ref: any = Object.create((_PdfReference as any).prototype);
        ref.objectNumber = id;
        ref.generationNumber = 0;
        ref.toString = (): string => `${id} 0`;
        return ref as _PdfReference;
    }

    function createCrossReference(): any {
        let id: number = 0;
        const xref: any = {
            _cacheMap: new Map<_PdfReference, any>(),
            _allowCatalog: false,
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake(() => {
                id += 1;
                return createReference(id);
            }),
            _fetch: jasmine.createSpy('_fetch').and.callFake((ref: _PdfReference) => xref._cacheMap.get(ref))
        };
        return xref;
    }

    function dict(entries?: { [key: string]: any }, xref?: any): _PdfDictionary {
        const d: _PdfDictionary = new _PdfDictionary(xref);
        if (entries) {
            Object.keys(entries).forEach((key: string) => {
                d.update(key, entries[`${key}`]);
            });
        }
        return d;
    }

    function createPage(index: number, xref: any): any {
        const pageRef: _PdfReference = createReference(1000 + index);
        const pageDictionary: _PdfDictionary = dict({}, xref);
        return {
            _pageIndex: index,
            _ref: pageRef,
            rotation: 1,
            size: { width: 100, height: 200 },
            _pageDictionary: pageDictionary,
            _contentTemplate: {
                _size: { width: 100, height: 200 },
                _content: { dictionary: dict({}, xref) }
            },
            graphics: {
                drawTemplate: jasmine.createSpy('drawTemplate')
            },
            annotations: {
                _annotations: []
            }
        };
    }

    beforeEach(() => {
        targetXref = createCrossReference();
        sourceXref = createCrossReference();

        destinationDocument = {
            _crossReference: targetXref,
            _catalog: {
                _catalogDictionary: dict({}, targetXref)
            },
            form: {
                count: 0,
                _dictionary: dict({}, targetXref),
                _fields: [],
                _parsedFields: new Map<number, any>()
            },
            bookmarks: {
                _bookMarkList: [],
                add: jasmine.createSpy('add')
            },
            getPage: jasmine.createSpy('getPage'),
            addPage: jasmine.createSpy('addPage')
        };

        sourceDocument = {
            _crossReference: sourceXref,
            _catalog: {
                _catalogDictionary: dict({}, sourceXref)
            },
            form: {
                count: 0,
                _dictionary: dict({}, sourceXref)
            },
            _parseBookmarkDestination: jasmine.createSpy('_parseBookmarkDestination').and.returnValue(new Map())
        };

        helper = new _PdfMergeHelper(
            targetXref as _PdfCrossReference,
            destinationDocument as PdfDocument,
            sourceDocument as PdfDocument,
            new Map(),
            new PdfPageImportOptions()
        ) as any;

        helper._copier = {
            _copy: jasmine.createSpy('_copy').and.callFake((value: any) => value),
            _copyDictionary: jasmine.createSpy('_copyDictionary').and.callFake((input: _PdfDictionary) => {
                const cloned: _PdfDictionary = dict({}, targetXref);
                input.forEach((key: string, value: any) => {
                    cloned.update(key, value);
                });
                cloned._updated = true;
                return cloned;
            })
        };
    });

    it('should cover _importPages duplicate-page path with Contents reference and Resources copy branch', () => {
        // Arrange
        const page: any = createPage(2, sourceXref);
        const newPage: any = createPage(3, targetXref);
        const contentRef: _PdfReference = createReference(200);
        const resources: _PdfDictionary = dict({ Font: dict({}, sourceXref) }, sourceXref);

        page._pageDictionary = dict({
            Contents: contentRef,
            Resources: resources,
            CustomKey: 'retain-me'
        }, sourceXref);

        helper._options.optimizeResources = true;
        spyOn(helper, '_insertNewPage').and.returnValue(newPage);
        
        // Mock copier to properly copy the dictionary
        helper._copier._copyDictionary = jasmine.createSpy('_copyDictionary').and.callFake((source: _PdfDictionary) => {
            const copied: _PdfDictionary = dict({}, targetXref);
            if (source.has('Contents')) {
                copied.update('Contents', source.get('Contents'));
            }
            if (source.has('Resources')) {
                copied.update('Resources', source.get('Resources'));
            }
            if (source.has('CustomKey')) {
                copied.update('CustomKey', source.get('CustomKey'));
            }
            return copied;
        });

        // Act
        helper._importPages(page, undefined as any, false, true, undefined, false);

        // Assert
        expect(helper._insertNewPage).toHaveBeenCalledWith(page, page._pageIndex + 1);
        expect(newPage._pageDictionary.get('Contents')).toBeUndefined();
        expect(newPage._pageDictionary.get('Resources')).toBe(resources);
        expect(newPage._pageDictionary.get('CustomKey')).toBe('retain-me');
    });

    it('should cover _importPages Contents array branch and Resources direct-value branch', () => {
        // Arrange
        const page: any = createPage(5, sourceXref);
        const newPage: any = createPage(6, targetXref);
        const c1: _PdfReference = createReference(301);
        const c2: _PdfReference = createReference(302);
        const resources: _PdfDictionary = dict({ ProcSet: ['PDF'] }, sourceXref);

        page._pageDictionary = dict({
            Contents: [c1, c2],
            Resources: resources
        }, sourceXref);

        helper._options.optimizeResources = true;
        spyOn(helper, '_insertNewPage').and.returnValue(newPage);

        // Act
        helper._importPages(page, undefined as any, false, true, undefined, false);

        // Assert
        expect(helper._insertNewPage).toHaveBeenCalledWith(page, page._pageIndex + 1);
        expect(newPage._pageDictionary.get('Contents')).toEqual([c1, c2]);
        expect(newPage._pageDictionary.get('Resources')).toBe(resources);
    });

    it('should cover _createAppearance radio-button branch when widget item has AS', () => {
        // Arrange
        const field: any = Object.create((PdfRadioButtonListField as any).prototype);
        field._enableGrouping = false;
        field._drawAppearance = jasmine.createSpy('_drawAppearance');
        
        // Mock _kidsCount as read-only property
        Object.defineProperty(field, '_kidsCount', {
            get: jasmine.createSpy('_kidsCount').and.returnValue(1),
            configurable: true
        });

        const item: any = Object.create((PdfRadioButtonListItem as any).prototype);
        item._dictionary = dict({
            AS: _PdfName.get('Yes')
        }, targetXref);
        item._postProcess = jasmine.createSpy('_postProcess');

        field.itemAt = jasmine.createSpy('itemAt').and.returnValue(item);

        // Act
        helper._createAppearance(
            field,
            field,
            dict({}, sourceXref),
            dict({}, targetXref),
            dict({}, targetXref)
        );

        // Assert
        expect(field.itemAt).toHaveBeenCalledWith(0);
        expect(item._styleText).toBe('l');
        expect(item._postProcess).toHaveBeenCalledWith('Yes');
        expect(item._enableGrouping).toBeTruthy();
        expect(field._enableGrouping).toBeTruthy();
        expect(field._drawAppearance).toHaveBeenCalledWith(item);
    });

    it('should cover _createAppearance radio-button branch when widget item has no AS and uses Off', () => {
        // Arrange
        const field: any = Object.create((PdfRadioButtonListField as any).prototype);
        field._enableGrouping = false;
        field._drawAppearance = jasmine.createSpy('_drawAppearance');
        
        // Mock _kidsCount as read-only property
        Object.defineProperty(field, '_kidsCount', {
            get: jasmine.createSpy('_kidsCount').and.returnValue(1),
            configurable: true
        });

        const item: any = Object.create((PdfRadioButtonListItem as any).prototype);
        item._dictionary = dict({}, targetXref);
        item._postProcess = jasmine.createSpy('_postProcess');

        field.itemAt = jasmine.createSpy('itemAt').and.returnValue(item);

        // Act
        helper._createAppearance(
            field,
            field,
            dict({}, sourceXref),
            dict({}, targetXref),
            dict({}, targetXref)
        );

        // Assert
        expect(field.itemAt).toHaveBeenCalledWith(0);
        expect(item._styleText).toBe('l');
        expect(item._postProcess).toHaveBeenCalledWith('Off');
        expect(item._enableGrouping).toBeTruthy();
        expect(field._enableGrouping).toBeTruthy();
        expect(field._drawAppearance).toHaveBeenCalledWith(item);
    });

    it('should cover _createAppearance signature direct-widget branch', () => {
        // Arrange
        const signatureField: any = Object.create((PdfSignatureField as any).prototype);
        signatureField._createAppearance = jasmine.createSpy('_createAppearance');
        
        // Mock _kidsCount as read-only property
        Object.defineProperty(signatureField, '_kidsCount', {
            get: jasmine.createSpy('_kidsCount').and.returnValue(1),
            configurable: true
        });
        
        const widget: any = {
            rotationAngle: 90,
            _dictionary: dict({ DA: '/Helv 12 Tf' }, sourceXref)
        };

        // Act
        helper._createAppearance(
            signatureField,
            signatureField,
            dict({}, sourceXref),
            dict({}, targetXref),
            dict({}, targetXref),
            widget
        );

        // Assert
        expect(signatureField._createAppearance).toHaveBeenCalledWith(widget, false);
    });

    it('should cover _exportBookmarks same-pageCount branch with action copy and named destination mapping', () => {
        // Arrange
        const oldPage: any = createPage(0, sourceXref);
        const mappedNewPage: any = createPage(10, targetXref);

        helper._bookmarksPageLinkReference.set(oldPage._ref, 10);
        helper._bookmarks = [{}]; // only needs length > 0

        destinationDocument.pageCount = 3;
        destinationDocument.getPage.and.returnValue(mappedNewPage);

        const bookmarkRoot: any = {
            _bookMarkList: [],
            add: jasmine.createSpy('add')
        };

        const createdBookmark: any = {
            _dictionary: dict({ C: [255, 0, 0] }, targetXref),
            textStyle: null,
            color: null,
            namedDestination: null
        };
        bookmarkRoot.add.and.returnValue(createdBookmark);

        const sourceBookmark: any = {
            title: 'bookmark-1',
            count: 0,
            textStyle: 1,
            color: [0, 0, 255],
            destination: null,
            namedDestination: {
                title: 'named-1',
                _destination: {
                    page: oldPage
                },
                destination: {
                    page: oldPage
                }
            },
            _dictionary: dict({
                A: dict({ S: _PdfName.get('GoTo') }, sourceXref)
            }, sourceXref),
            _bookMarkList: []
        };

        bookmarkRoot._bookMarkList.push(sourceBookmark);

        destinationDocument.bookmarks = bookmarkRoot;

        const createdNamedDest: any = {
            _title: 'named-1',
            _dictionary: dict({ D: [mappedNewPage._ref] }, targetXref)
        };

        spyOn(helper, '_getNamedDestination').and.returnValue(createdNamedDest);

        // Act
        helper._exportBookmarks(destinationDocument as PdfDocument, 3);

        // Assert
        expect(bookmarkRoot.add).toHaveBeenCalledWith('bookmark-1');
        expect(createdBookmark._dictionary.get('A')).toBe(sourceBookmark._dictionary.get('A'));
        expect(helper._getNamedDestination).toHaveBeenCalledWith(sourceBookmark.namedDestination, mappedNewPage);
        expect(createdBookmark.namedDestination).toBe(createdNamedDest);
        expect(helper._namedDestinations[0]).toBe('named-1');
        expect(helper._namedDestinations.length).toBe(2);
        expect(targetXref._cacheMap.size).toBeGreaterThan(0);
    });

    it('should cover _PdfCopier._copyStream image branch final else and _PdfContentStream._bytes fallback', () => {
        // Arrange
        const copier: any = new _PdfCopier(targetXref, sourceXref);

        const originalStream: any = Object.create((_PdfContentStream as any).prototype);
        originalStream.dictionary = dict({
            Subtype: _PdfName.get('Image')
        }, sourceXref);

        // force execution into the final else inside image block:
        // - not _PdfStream
        // - no baseStream.stream
        // - no nested stream
        originalStream.stream = undefined;

        originalStream.getBytes = jasmine.createSpy('getBytes').and.returnValue([]);
        originalStream._bytes = [9, 8, 7, 6];

        // Act
        const copied: any = copier._copyStream(originalStream);

        // Assert
        expect(originalStream.getBytes).toHaveBeenCalled();
        expect(copied._isImage).toBeTruthy();
        expect(copied.dictionary._updated).toBeTruthy();

        // copied content is created from Array.from(bytes), where bytes falls back to originalStream._bytes
        const copiedBytes: number[] = copied._bytes ? copied._bytes : copied.getBytes();
        expect(copiedBytes.length).toBe(4);
        expect(copiedBytes[0]).toBe(9);
        expect(copiedBytes[1]).toBe(8);
        expect(copiedBytes[2]).toBe(7);
        expect(copiedBytes[3]).toBe(6);
    });
});
