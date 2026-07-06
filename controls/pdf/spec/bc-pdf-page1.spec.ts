
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Adjust the relative import path according to your repo structure.
 * This spec intentionally uses actual internal types + controlled spies/mocks
 * so the highlighted branches can be covered deterministically.
 */

import * as utils from '../src/pdf/core/utils';
import * as graphicsModule from '../src/pdf/core/graphics/pdf-graphics';
import {
    PdfPage,
    PdfDestination,
    _PdfDestinationHelper
} from '../src/pdf/core/pdf-page';
import {
    _PdfDictionary,
    _PdfReference,
    _PdfName
} from '../src/pdf/core/pdf-primitives';
import {
    _PdfBaseStream,
    _PdfContentStream
} from '../src/pdf/core/base-stream';
import {
    PdfRotationAngle,
    PdfDestinationMode,
    PdfFormFieldsTabOrder,
    PdfLayoutBreakType,
    PdfLayoutType
} from '../src/pdf/core/enumerator';
import {
    PdfLayoutFormat,
    PdfLayoutResult,
    _PdfLayoutParameters
} from '../src/pdf/core/graphics/pdf-layouter';
import {
    PdfStringFormat
} from '../src/pdf/core/fonts/pdf-string-format';
import {
    _PdfStringLayouter
} from '../src/pdf/core/fonts/string-layouter';

describe('PdfPage / PdfDestination / _PdfDestinationHelper uncovered branch coverage', () => {
    let refSeed: number;

    function createReference(id?: number): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        (reference as any).objectNumber = typeof id === 'number' ? id : ++refSeed;
        (reference as any).generationNumber = 0;
        return reference;
    }

    function createCrossReference(document?: any): any {
        const cacheMap: Map<any, any> = new Map();
        const fetchMap: Map<any, any> = new Map();

        return {
            _cacheMap: cacheMap,
            _document: document,
            _fetch: jasmine.createSpy('_fetch').and.callFake((ref: any) => fetchMap.get(ref)),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake(() => createReference()),
            __fetchMap: fetchMap
        };
    }

    function createDictionary(crossRef: any, values?: { [key: string]: any }): _PdfDictionary {
        const dict: _PdfDictionary = new _PdfDictionary(crossRef);
        if (values) {
            Object.keys(values).forEach((key: string) => {
                dict.set(key, values[key]);
            });
        }
        return dict;
    }

    function createFakeGraphics(size: { width: number; height: number } = { width: 100, height: 200 }): any {
        return {
            _size: size,
            _clipBounds: [0, 0, size.width, size.height],
            _cropBox: undefined,
            _mediaBoxUpperRightBound: undefined,
            save: jasmine.createSpy('save').and.returnValue({ key: 'state' }),
            restore: jasmine.createSpy('restore'),
            _initializeCoordinates: jasmine.createSpy('_initializeCoordinates'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            _clipTranslateMargins: jasmine.createSpy('_clipTranslateMargins'),
            setClip: jasmine.createSpy('setClip'),
            drawString: jasmine.createSpy('drawString'),
            _isRectangle: (value: any) =>
                value && typeof value.x === 'number' && typeof value.y === 'number' &&
                typeof value.width === 'number' && typeof value.height === 'number'
        };
    }

    function installPdfGraphicsConstructorSpy(fakeGraphicsFactory?: (size: any) => any): jasmine.Spy {
        return spyOn(graphicsModule, 'PdfGraphics' as any).and.callFake(function (
            size: any,
            stream: any,
            crossReference: any,
            page: any
        ) {
            const graphics: any = fakeGraphicsFactory ? fakeGraphicsFactory(size) : createFakeGraphics(size);
            return graphics;
        });
    }

    
function createPage(options?: {
    dictionary?: _PdfDictionary;
    crossReference?: any;
    pageIndex?: number;
    reference?: _PdfReference;
}): PdfPage {

    // ✅ Always create a document stub first
    const documentStub: any = {
        pageCount: 1,
        getPage: jasmine.createSpy('getPage'),
        addPage: jasmine.createSpy('addPage'),
        _catalog: {
            _catalogDictionary: new _PdfDictionary(null)
        }
    };

    // ✅ Avoid TS issues with ?? in older targets
    const crossRef: any = options && options.crossReference
        ? options.crossReference
        : createCrossReference(documentStub);

    // ✅ Ensure the document is always wired
    if (!crossRef._document) {
        crossRef._document = documentStub;
    }

    // ✅ Safe defaults with explicit fallbacks
    const dictionary: _PdfDictionary = options && options.dictionary
        ? options.dictionary
        : createDictionary(crossRef);

    const reference: _PdfReference = options && options.reference
        ? options.reference
        : createReference();

    const pageIndex: number = options && typeof options.pageIndex === 'number'
        ? options.pageIndex
        : 0;

    // ✅ Construct page safely
    const page: PdfPage = new PdfPage(
        crossRef,
        pageIndex,
        dictionary,
        reference
    );

    return page;
}


    beforeEach(() => {
        refSeed = 0;
    });

    describe('PdfPage.rotation', () => {
        it('should normalize a negative inherited rotation to angle270', () => {
            // Arrange
            const page: PdfPage = createPage();

            spyOn(utils, '_getInheritableProperty').and.returnValue(-90);

            // Act
            const actual: PdfRotationAngle = page.rotation;

            // Assert
            expect(actual).toBe(PdfRotationAngle.angle270);
        });

        it('should reduce rotation values >= 360 to modulo 360 in setter', () => {
            // Arrange
            const page: PdfPage = createPage();
            const updateSpy: jasmine.Spy = spyOn((page as any)._pageDictionary, 'update').and.callThrough();
            (page as any)._isNew = false;

            // Act
            page.rotation = 4 as any as PdfRotationAngle; // 4 * 90 = 360 -> 0

            // Assert
            expect(updateSpy).toHaveBeenCalledWith('Rotate', 0);
            expect((page as any)._pageDictionary.get('Rotate')).toBe(0);
        });
    });

    describe('PdfPage._addWidget', () => {
        it('should resolve Annots when raw Annots is a reference and append the new widget', () => {
            // Arrange
            const crossRef: any = createCrossReference();
            const annotsRef: _PdfReference = createReference(100);
            const existingAnnot1: _PdfReference = createReference(1);
            const existingAnnot2: _PdfReference = createReference(2);
            const newAnnot: _PdfReference = createReference(3);

            const dictionary: _PdfDictionary = createDictionary(crossRef);
            dictionary.set('Annots', annotsRef);

            const page: PdfPage = createPage({
                crossReference: crossRef,
                dictionary
            });

            spyOn(page as any, '_getProperty').and.returnValue([existingAnnot1, existingAnnot2]);

            // Act
            page._addWidget(newAnnot);

            // Assert
            const annots: _PdfReference[] = (page as any)._pageDictionary.get('Annots');
            expect(Array.isArray(annots)).toBeTruthy();
            expect(annots.length).toBe(3);
            expect(annots[0]).toBe(existingAnnot1);
            expect(annots[1]).toBe(existingAnnot2);
            expect(annots[2]).toBe(newAnnot);
            expect((page as any)._pageDictionary._updated).toBeTruthy();
        });

        it('should create Annots array when no existing annotation list is available', () => {
            // Arrange
            const page: PdfPage = createPage();
            const newAnnot: _PdfReference = createReference(50);

            // Act
            page._addWidget(newAnnot);

            // Assert
            const annots: _PdfReference[] = (page as any)._pageDictionary.get('Annots');
            expect(Array.isArray(annots)).toBeTruthy();
            expect(annots.length).toBe(1);
            expect(annots[0]).toBe(newAnnot);
            expect((page as any)._pageDictionary._updated).toBeTruthy();
        });
    });

    describe('PdfPage._getProperty', () => {
        it('should return a non-array inheritable property as-is', () => {
            // Arrange
            const page: PdfPage = createPage();
            const directValue: string = 'DirectValue';

            spyOn(utils, '_getInheritableProperty').and.returnValue(directValue);

            // Act
            const result: any = page._getProperty('Sample');

            // Assert
            expect(result).toBe(directValue);
        });

        it('should return the first element when inheritable property is a single-item array', () => {
            // Arrange
            const page: PdfPage = createPage();
            const singleRef: _PdfReference = createReference();

            spyOn(utils, '_getInheritableProperty').and.returnValue([singleRef]);

            // Act
            const result: any = page._getProperty('Sample');

            // Assert
            expect(result).toBe(singleRef);
        });

        it('should return the first element when the first item is not a dictionary', () => {
            // Arrange
            const page: PdfPage = createPage();

            spyOn(utils, '_getInheritableProperty').and.returnValue([123, 456]);

            // Act
            const result: any = page._getProperty('Sample');

            // Assert
            expect(result).toBe(123);
        });

        it('should merge dictionary arrays when multiple dictionaries are returned', () => {
            // Arrange
            const page: PdfPage = createPage();
            const dict1: _PdfDictionary = createDictionary((page as any)._crossReference, { A: 1 });
            const dict2: _PdfDictionary = createDictionary((page as any)._crossReference, { B: 2 });
            const merged: _PdfDictionary = createDictionary((page as any)._crossReference, { A: 1, B: 2 });

            spyOn(utils, '_getInheritableProperty').and.returnValue([dict1, dict2]);
            const mergeSpy: jasmine.Spy = spyOn(_PdfDictionary, 'merge').and.returnValue(merged);

            // Act
            const result: any = page._getProperty('Resources');

            // Assert
            expect(mergeSpy).toHaveBeenCalled();
            expect(result).toBe(merged);
        });
    });

    describe('PdfPage._initializeGraphics', () => {
        it('should create graphics with page size when CropBox exists but has fewer than 4 entries', () => {
            // Arrange
            const pdfGraphicsSpy: jasmine.Spy = installPdfGraphicsConstructorSpy();
            const page: PdfPage = createPage();
            (page as any)._size = { width: 100, height: 200 };
            (page as any)._mBox = [0, 0, 100, 200];
            (page as any)._cBox = [0, 0, 100];
            (page as any)._o = [1, 1];
            (page as any)._isNew = false;
            (page as any)._rotation = PdfRotationAngle.angle0;

            (page as any)._pageDictionary.set('MediaBox', [0, 0, 100, 200]);
            (page as any)._pageDictionary.set('CropBox', [0, 0, 100]);

            const stream: _PdfContentStream = new _PdfContentStream([]);

            // Act
            page._initializeGraphics(stream);

            // Assert
            expect(pdfGraphicsSpy).toHaveBeenCalled();
            const createdGraphics: any = (page as any)._g;
            expect(createdGraphics._size.width).toBe(100);
            expect(createdGraphics._size.height).toBe(200);
            expect(createdGraphics._initializeCoordinates).toHaveBeenCalled();
        });

        it('should handle negative MediaBox values and mark invalid upper-right bound', () => {
            // Arrange
            const pdfGraphicsSpy: jasmine.Spy = installPdfGraphicsConstructorSpy();
            const page: PdfPage = createPage();
            (page as any)._size = { width: 100, height: 200 };
            (page as any)._mBox = [-100, -200, -100, -200];
            (page as any)._o = [1, 1];
            (page as any)._isNew = false;
            (page as any)._rotation = PdfRotationAngle.angle0;

            (page as any)._pageDictionary.set('MediaBox', [-100, -200, -100, -200]);

            const stream: _PdfContentStream = new _PdfContentStream([]);

            // Act
            page._initializeGraphics(stream);

            // Assert
            expect(pdfGraphicsSpy).toHaveBeenCalled();
            const createdGraphics: any = (page as any)._g;
            expect(createdGraphics._size.width).toBe(100);
            expect(createdGraphics._size.height).toBe(200);
            expect(createdGraphics._mediaBoxUpperRightBound).toBe(-200);
        });

        it('should use rotation * 90 when Rotate key is absent and apply 180 degree transform', () => {
            // Arrange
            const pdfGraphicsSpy: jasmine.Spy = installPdfGraphicsConstructorSpy();
            const page: PdfPage = createPage();
            (page as any)._size = { width: 100, height: 200 };
            (page as any)._mBox = [0, 0, 100, 200];
            (page as any)._o = [1, 1];
            (page as any)._isNew = false;
            (page as any)._rotation = PdfRotationAngle.angle180;

            (page as any)._pageDictionary.set('MediaBox', [0, 0, 100, 200]);

            const stream: _PdfContentStream = new _PdfContentStream([]);

            // Act
            page._initializeGraphics(stream);

            // Assert
            const g: any = (page as any)._g;
            expect(g.translateTransform).toHaveBeenCalledWith({ x: 100, y: 200 });
            expect(g.rotateTransform).toHaveBeenCalledWith(-180);
        });

        it('should use rotation * 90 when Rotate key is absent and apply 270 degree transform', () => {
            // Arrange
            const pdfGraphicsSpy: jasmine.Spy = installPdfGraphicsConstructorSpy();
            const page: PdfPage = createPage();
            (page as any)._size = { width: 100, height: 200 };
            (page as any)._mBox = [0, 0, 100, 200];
            (page as any)._o = [1, 1];
            (page as any)._isNew = false;
            (page as any)._rotation = PdfRotationAngle.angle270;

            (page as any)._pageDictionary.set('MediaBox', [0, 0, 100, 200]);

            const stream: _PdfContentStream = new _PdfContentStream([]);

            // Act
            page._initializeGraphics(stream);

            // Assert
            const g: any = (page as any)._g;
            expect(g.translateTransform).toHaveBeenCalledWith({ x: 100, y: 0 });
            expect(g.rotateTransform).toHaveBeenCalledWith(-270);
            expect(g._clipBounds).toEqual([0, 0, 200, 100]);
        });
    });

    describe('PdfPage._fetchResources', () => {
        it('should fetch Resources when the raw object is a reference', () => {
            // Arrange
            const crossRef: any = createCrossReference();
            const resourcesRef: _PdfReference = createReference(77);
            const resourcesDict: _PdfDictionary = createDictionary(crossRef, { Font: 'F1' });
            crossRef.__fetchMap.set(resourcesRef, resourcesDict);

            const dictionary: _PdfDictionary = createDictionary(crossRef);
            dictionary.set('Resources', resourcesRef);

            const page: PdfPage = createPage({
                crossReference: crossRef,
                dictionary
            });

            // Act
            const result: _PdfDictionary = page._fetchResources();

            // Assert
            expect(crossRef._fetch).toHaveBeenCalledWith(resourcesRef);
            expect((page as any)._hasResourceReference).toBeTruthy();
            expect(result).toBe(resourcesDict);
        });

        it('should use the existing Resources dictionary directly when it is already a dictionary', () => {
            // Arrange
            const crossRef: any = createCrossReference();
            const resourcesDict: _PdfDictionary = createDictionary(crossRef, { ProcSet: [] });

            const dictionary: _PdfDictionary = createDictionary(crossRef);
            dictionary.set('Resources', resourcesDict);

            const page: PdfPage = createPage({
                crossReference: crossRef,
                dictionary
            });

            // Act
            const result: _PdfDictionary = page._fetchResources();

            // Assert
            expect(result).toBe(resourcesDict);
            expect((page as any)._hasResourceReference).not.toBeTruthy();
        });
    });

    describe('PdfPage._obtainTabOrder', () => {
        it('should resolve column tab order when Tabs is C', () => {
            // Arrange
            const page: PdfPage = createPage();
            (page as any)._pageDictionary.set('Tabs', _PdfName.get('C'));

            // Act
            const result: PdfFormFieldsTabOrder = page._obtainTabOrder();

            // Assert
            expect(result).toBe(PdfFormFieldsTabOrder.column);
        });

        it('should resolve widget tab order when Tabs is W', () => {
            // Arrange
            const page: PdfPage = createPage();
            (page as any)._pageDictionary.set('Tabs', _PdfName.get('W'));

            // Act
            const result: PdfFormFieldsTabOrder = page._obtainTabOrder();

            // Assert
            expect(result).toBe(PdfFormFieldsTabOrder.widget);
        });
    });

    describe('PdfPage._contentTemplate', () => {
        it('should use CropBox as BBox when CropBox has positive origin values', () => {
            // Arrange
            const page: PdfPage = createPage();
            const resourceDict: _PdfDictionary = createDictionary((page as any)._crossReference);
            spyOn(page, '_fetchResources').and.returnValue(resourceDict);
            spyOn(page, '_combineContent').and.returnValue(new Uint8Array([1, 2, 3]));

            (page as any)._cBox = [10, 20, 210, 420];
            (page as any)._mBox = [0, 0, 300, 500];
            (page as any)._size = { width: 300, height: 500 };

            // Act
            const template: any = (page as any)._contentTemplate;

            // Assert
            expect(template._content.dictionary.get('BBox')).toEqual([10, 20, 210, 420]);
            expect(template._size).toEqual({ width: 210, height: 420 });
        });
        it('should use CropBox as BBox when CropBox has positive origin values same', () => {
            // Arrange
            const page: PdfPage = createPage();
            const resourceDict: _PdfDictionary = createDictionary((page as any)._crossReference);
            spyOn(page, '_fetchResources').and.returnValue(resourceDict);
            spyOn(page, '_combineContent').and.returnValue(new Uint8Array([1, 2, 3]));

            (page as any)._cBox = [10, 20, 210, 420];
            (page as any)._mBox = [10, 20, 210, 420];
            (page as any)._size = { width: 300, height: 500 };

            // Act
            const template: any = (page as any)._contentTemplate;

            // Assert
            expect(template._content.dictionary.get('BBox')).toEqual([10, 20, 210, 420]);
            expect(template._size).toEqual({ width: 10, height: 20 });
        });

        it('should use MediaBox as BBox when CropBox origin is not positive and MediaBox origin is positive', () => {
            // Arrange
            const page: PdfPage = createPage();
            const resourceDict: _PdfDictionary = createDictionary((page as any)._crossReference);
            spyOn(page, '_fetchResources').and.returnValue(resourceDict);
            spyOn(page, '_combineContent').and.returnValue(new Uint8Array([1, 2, 3]));

            (page as any)._cBox = [0, 0, 210, 420];
            (page as any)._mBox = [5, 10, 300, 500];
            (page as any)._size = { width: 300, height: 500 };

            // Act
            const template: any = (page as any)._contentTemplate;

            // Assert
            expect(template._content.dictionary.get('BBox')).toEqual([5, 10, 300, 500]);
            expect(template._size).toEqual({ width: 5, height: 10 });
        });
    });

    describe('PdfPage._combineContent', () => {
        it('should combine bytes from _PdfContentStream and _PdfBaseStream in order', () => {
            // Arrange
            const crossRef: any = createCrossReference();
            const page: PdfPage = createPage({ crossReference: crossRef });
            const ref1: _PdfReference = createReference(1);
            const ref2: _PdfReference = createReference(2);

            const contentStream: _PdfContentStream = new _PdfContentStream([65, 66]); // AB
            const baseStream: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
            spyOn(baseStream, 'getBytes').and.returnValue(new Uint8Array([67, 68])); // CD

            crossRef.__fetchMap.set(ref1, contentStream);
            crossRef.__fetchMap.set(ref2, baseStream);

            spyOn(page, '_loadContents').and.callFake(() => {
                (page as any)._contents = [ref1, ref2];
            });

            // Act
            const result: Uint8Array = page._combineContent();

            // Assert
            const text: string = Array.from(result).join(',');
            expect(text).toContain('32,113,32,10'); // q
            expect(text).toContain('65,66');        // AB
            expect(text).toContain('67,68');        // CD
            expect(text).toContain('32,81,32,10'); // Q
        });
    });
    
    describe('PdfDestination._initializePrimitive / constructor behavior', () => {
        it('should initialize location destination array with page ref, XYZ, translated Y and zoom', () => {
            // Arrange
            const page: PdfPage = createPage();
            (page as any)._g = createFakeGraphics({ width: 300, height: 500 });

            const destination: PdfDestination = new PdfDestination(page, { x: 25, y: 40 }, {
                zoom: 2,
                mode: PdfDestinationMode.location
            });

            // Act
            destination._initializePrimitive();

            // Assert
            expect((destination as any)._array[0]).toBe((page as any)._ref);
            expect((destination as any)._array[1]).toBe(_PdfName.get('XYZ'));
            expect((destination as any)._array[2]).toBe(25);
            expect((destination as any)._array[3]).toBe(460);
            expect((destination as any)._array[4]).toBe(2);
        });

        it('should initialize fitR destination array with bounds', () => {
            // Arrange
            const page: PdfPage = createPage();
            (page as any)._g = createFakeGraphics({ width: 300, height: 500 });

            const destination: PdfDestination = new PdfDestination(page, {
                x: 10,
                y: 20,
                width: 100,
                height: 200
            }, {
                mode: PdfDestinationMode.fitR
            });

            // Act
            destination._initializePrimitive();

            // Assert
            expect((destination as any)._array[1]).toBe(_PdfName.get('FitR'));
            expect((destination as any)._array[2]).toBe(10);
            expect((destination as any)._array[3]).toBe(20);
            expect((destination as any)._array[4]).toBe(100);
            expect((destination as any)._array[5]).toBe(200);
        });

        it('should initialize fitH destination array with translated top position', () => {
            // Arrange
            const page: PdfPage = createPage();
            (page as any)._g = createFakeGraphics({ width: 300, height: 500 });

            const destination: PdfDestination = new PdfDestination(page, { x: 0, y: 50 }, {
                mode: PdfDestinationMode.fitH
            });

            // Act
            destination._initializePrimitive();

            // Assert
            expect((destination as any)._array[1]).toBe(_PdfName.get('FitH'));
            expect((destination as any)._array[2]).toBe(742);
        });

        it('should update parent dictionary with Dest for bookmark destinations and D otherwise', () => {
            // Arrange
            const page: PdfPage = createPage();
            (page as any)._g = createFakeGraphics({ width: 300, height: 500 });

            const bookmarkParent: any = { _dictionary: createDictionary((page as any)._crossReference) };
            const normalParent: any = { _dictionary: createDictionary((page as any)._crossReference) };

            const bookmarkDestination: PdfDestination = new PdfDestination(page, { x: 5, y: 5 }, {
                mode: PdfDestinationMode.location
            });
            (bookmarkDestination as any)._parent = bookmarkParent;
            (bookmarkDestination as any)._isBookmark = true;

            const normalDestination: PdfDestination = new PdfDestination(page, { x: 5, y: 5 }, {
                mode: PdfDestinationMode.location
            });
            (normalDestination as any)._parent = normalParent;
            (normalDestination as any)._isBookmark = false;

            // Act
            bookmarkDestination._initializePrimitive();
            normalDestination._initializePrimitive();

            // Assert
            expect(bookmarkParent._dictionary.get('Dest')).toEqual((bookmarkDestination as any)._array);
            expect(normalParent._dictionary.get('D')).toEqual((normalDestination as any)._array);
            expect(bookmarkParent._dictionary._updated).toBeTruthy();
            expect(normalParent._dictionary._updated).toBeTruthy();
        });
    });

    describe('_PdfDestinationHelper._obtainDestination', () => {
        it('should resolve a named destination when Dest is a string', () => {
            // Arrange
            const doc: any = {
                pageCount: 1,
                getPage: jasmine.createSpy('getPage')
            };

            const page: PdfPage = createPage({ pageIndex: 0 });
            (page as any)._size = { width: 100, height: 200 };
            (page as any)._g = createFakeGraphics({ width: 100, height: 200 });

            doc.getPage.and.returnValue(page);

            const crossRef: any = createCrossReference(doc);
            const dictionary: _PdfDictionary = createDictionary(crossRef);
            dictionary.set('Dest', 'NamedDest');

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(dictionary, 'Dest');
            spyOn(helper, '_getDestination').and.returnValue([0, _PdfName.get('Fit')]);

            // Act
            const result: PdfDestination = helper._obtainDestination();

            // Assert
            expect(helper._getDestination).toHaveBeenCalledWith('NamedDest', doc);
            expect(result).toBeDefined();
            expect(result.mode).toBe(PdfDestinationMode.fitToPage);
            expect(result.pageIndex).toBe(0);
        });

        it('should resolve a page when the first destination element is a page reference and apply _checkRotation for XYZ mode', () => {
            // Arrange
            const doc: any = {
                pageCount: 1,
                getPage: jasmine.createSpy('getPage')
            };

            const pageRef: _PdfReference = createReference(501);
            const pageDictRefTarget: _PdfDictionary = createDictionary(null);

            const page: PdfPage = createPage({ pageIndex: 0 });
            (page as any)._size = { width: 100, height: 200 };
            (page as any)._g = createFakeGraphics({ width: 100, height: 200 });
            (page as any)._rotation = PdfRotationAngle.angle90;

            doc.getPage.and.returnValue(page);

            const crossRef: any = createCrossReference(doc);
            crossRef.__fetchMap.set(pageRef, pageDictRefTarget);

            const dictionary: _PdfDictionary = createDictionary(crossRef);
            dictionary.set('Dest', [pageRef, _PdfName.get('XYZ'), 10, 50, 2]);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(dictionary, 'Dest');

            spyOn(utils, '_getPageIndex').and.returnValue(0);
            spyOn(utils, '_checkRotation').and.returnValue(123);

            // Act
            const result: PdfDestination = helper._obtainDestination();

            // Assert
            expect(crossRef._fetch).toHaveBeenCalledWith(pageRef);
            expect(utils._getPageIndex).toHaveBeenCalled();
            expect(utils._checkRotation).toHaveBeenCalledWith(page, 50, 10);
            expect(result.pageIndex).toBe(0);
            expect(result.zoom).toBe(2);
            expect(result.location.x).toBe(10);
            expect(result.location.y).toBe(123);
        });

        it('should parse array-only destinations without resolving a page and set zoom / XYZ members', () => {
            // Arrange
            const doc: any = {
                pageCount: 1,
                getPage: jasmine.createSpy('getPage')
            };

            const crossRef: any = createCrossReference(doc);
            const dictionary: _PdfDictionary = createDictionary(crossRef);

            // index is invalid for pageCount=1, so page stays undefined and the array-only branch runs
            dictionary.set('Dest', [99, _PdfName.get('XYZ'), 15, 25, 1.5]);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(dictionary, 'Dest');

            // Act
            const result: PdfDestination = helper._obtainDestination();

            // Assert
            expect(result).toBeDefined();
            expect(result.zoom).toBe(1.5);
            expect(result.mode).toBe(PdfDestinationMode.location);
        });

        it('should parse array-only destinations for Fit mode', () => {
            // Arrange
            const doc: any = {
                pageCount: 1,
                getPage: jasmine.createSpy('getPage')
            };

            const crossRef: any = createCrossReference(doc);
            const dictionary: _PdfDictionary = createDictionary(crossRef);

            dictionary.set('Dest', [99, _PdfName.get('Fit')]);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(dictionary, 'Dest');

            // Act
            const result: PdfDestination = helper._obtainDestination();

            // Assert
            expect(result).toBeDefined();
            expect(result.mode).toBe(PdfDestinationMode.fitToPage);
        });

        it('should parse FitR mode using destination bounds', () => {
            // Arrange
            const doc: any = {
                pageCount: 1,
                getPage: jasmine.createSpy('getPage')
            };

            const page: PdfPage = createPage({ pageIndex: 0 });
            (page as any)._size = { width: 100, height: 200 };
            (page as any)._g = createFakeGraphics({ width: 100, height: 200 });
            doc.getPage.and.returnValue(page);

            const crossRef: any = createCrossReference(doc);
            const dictionary: _PdfDictionary = createDictionary(crossRef);
            dictionary.set('Dest', [0, _PdfName.get('FitR'), 10, 20, 100, 200]);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(dictionary, 'Dest');

            // Act
            const result: PdfDestination = helper._obtainDestination();

            // Assert
            expect(result.mode).toBe(PdfDestinationMode.fitR);
            expect(result.destinationBounds).toEqual({ x: 10, y: 20, width: 100, height: 200 });
        });

        it('should parse FitH mode and invalidate the destination when top is undefined', () => {
            // Arrange
            const doc: any = {
                pageCount: 1,
                getPage: jasmine.createSpy('getPage')
            };

            const page: PdfPage = createPage({ pageIndex: 0 });
            (page as any)._size = { width: 100, height: 200 };
            (page as any)._g = createFakeGraphics({ width: 100, height: 200 });
            doc.getPage.and.returnValue(page);

            const crossRef: any = createCrossReference(doc);
            const dictionary: _PdfDictionary = createDictionary(crossRef);
            dictionary.set('Dest', [0, _PdfName.get('FitH')]);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(dictionary, 'Dest');

            // Act
            const result: PdfDestination = helper._obtainDestination();

            // Assert
            expect(result.mode).toBe(PdfDestinationMode.fitH);
            expect(result.isValid).toBeFalsy();
        });
    });

    describe('_PdfDestinationHelper._extractDestination', () => {
        it('should extract a D array from a referenced dictionary', () => {
            // Arrange
            const doc: any = {};
            const crossRef: any = createCrossReference(doc);
            doc._crossReference = crossRef;

            const destRef: _PdfReference = createReference(200);
            const targetDict: _PdfDictionary = createDictionary(crossRef);
            targetDict.set('D', [0, _PdfName.get('Fit')]);

            crossRef.__fetchMap.set(destRef, targetDict);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(createDictionary(crossRef), 'Dest');

            // Act
            const result: any[] = helper._extractDestination(destRef, doc);

            // Assert
            expect(crossRef._fetch).toHaveBeenCalledWith(destRef);
            expect(result).toEqual([0, _PdfName.get('Fit')]);
        });

        it('should return the array directly when the fetched object is already an array', () => {
            // Arrange
            const doc: any = {};
            const crossRef: any = createCrossReference(doc);
            doc._crossReference = crossRef;

            const destRef: _PdfReference = createReference(201);
            const targetArray: any[] = [0, _PdfName.get('XYZ'), 10, 20, 2];

            crossRef.__fetchMap.set(destRef, targetArray);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(createDictionary(crossRef), 'Dest');

            // Act
            const result: any[] = helper._extractDestination(destRef, doc);

            // Assert
            expect(result).toEqual(targetArray);
        });

        it('should return the original object when there is nothing to extract', () => {
            // Arrange
            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(createDictionary(createCrossReference()), 'Dest');
            const raw: any[] = [1, 2, 3];

            // Act
            const result: any[] = helper._extractDestination(raw, {} as any);

            // Assert
            expect(result).toBe(raw);
        });
    });

    describe('_PdfDestinationHelper._findName', () => {
        it('should fetch a referenced key from the Names array and return the associated reference', () => {
            // Arrange
            const crossRef: any = createCrossReference();
            const keyRef: _PdfReference = createReference(301);
            const valueRef: _PdfReference = createReference(302);

            const current: _PdfDictionary = createDictionary(crossRef);
            current.set('Names', [keyRef, valueRef]);

            crossRef.__fetchMap.set(keyRef, 'TargetName');

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(current, 'Dest');

            // Act
            const result: _PdfReference = helper._findName(current, 'TargetName');

            // Assert
            expect(crossRef._fetch).toHaveBeenCalledWith(keyRef);
            expect(result).toBe(valueRef);
        });

        it('should return undefined when Names is empty', () => {
            // Arrange
            const current: _PdfDictionary = createDictionary(createCrossReference());
            current.set('Names', []);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(current, 'Dest');

            // Act
            const result: _PdfReference = helper._findName(current, 'Missing');

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('_PdfDestinationHelper._getProperKid', () => {
        it('should iterate kids in reverse order and break when a matching Limits range is found', () => {
            // Arrange
            const crossRef: any = createCrossReference();

            const kid1: _PdfDictionary = createDictionary(crossRef);
            kid1.set('Limits', ['A', 'C']);

            const kid2: _PdfDictionary = createDictionary(crossRef);
            kid2.set('Limits', ['D', 'H']);

            const kids: _PdfDictionary = createDictionary(crossRef);
            kids.set('Kids', [kid1, kid2]);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(kids, 'Dest');

            // Act
            const result: _PdfDictionary = helper._getProperKid(kids, 'F');

            // Assert
            expect(result).toBe(kid2);
        });

        it('should return undefined when Kids array is empty', () => {
            // Arrange
            const crossRef: any = createCrossReference();
            const kids: _PdfDictionary = createDictionary(crossRef);
            kids.set('Kids', []);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(kids, 'Dest');

            // Act
            const result: _PdfDictionary = helper._getProperKid(kids, 'F');

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('_PdfDestinationHelper._getNamedObjectFromTree', () => {
        it('should traverse Kids until it reaches a Names node and return the matching reference', () => {
            // Arrange
            const crossRef: any = createCrossReference();

            const valueRef: _PdfReference = createReference(901);
            const leaf: _PdfDictionary = createDictionary(crossRef);
            leaf.set('Names', ['NodeName', valueRef]);
            leaf.set('Limits', ['NodeName', 'NodeName']);

            const root: _PdfDictionary = createDictionary(crossRef);
            root.set('Kids', [leaf]);

            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(root, 'Dest');

            // Act
            const result: _PdfReference = helper._getNamedObjectFromTree(root, 'NodeName');

            // Assert
            expect(result).toBe(valueRef);
        });
    });

    describe('_PdfDestinationHelper._checkLimits / _stringCompare', () => {
        it('should return true when result is within limits', () => {
            // Arrange
            const kid: _PdfDictionary = createDictionary(createCrossReference());
            kid.set('Limits', ['A', 'Z']);
            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(kid, 'Dest');

            // Act
            const result: boolean = helper._checkLimits(kid, 'M');

            // Assert
            expect(result).toBeTruthy();
        });

        it('should compare strings byte-wise', () => {
            // Arrange
            const helper: _PdfDestinationHelper = new _PdfDestinationHelper(createDictionary(createCrossReference()), 'Dest');

            // Act
            const equalResult: number = helper._stringCompare('ABC', 'ABC');
            const lessResult: number = helper._stringCompare('ABC', 'ABD');
            const greaterResult: number = helper._stringCompare('ABD', 'ABC');

            // Assert
            expect(equalResult).toBe(0);
            expect(lessResult).toBeLessThan(0);
            expect(greaterResult).toBeGreaterThan(0);
        });
    });
});
