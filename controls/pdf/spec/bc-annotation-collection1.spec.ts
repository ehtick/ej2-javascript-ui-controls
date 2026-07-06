import { PdfAnnotation, PdfComment, PdfDocumentLinkAnnotation, PdfPopupAnnotation, PdfRectangleAnnotation, PdfSquareAnnotation, PdfUriAnnotation } from "../src/pdf/core/annotations/annotation";
import { PdfAnnotationCollection, PdfPopupAnnotationCollection } from "../src/pdf/core/annotations/annotation-collection";
import { _PdfCrossReference } from "../src/pdf/core/pdf-cross-reference";
import { PdfPage } from "../src/pdf/core/pdf-page";
import { _PdfDictionary, _PdfName, _PdfReference } from "../src/pdf/core/pdf-primitives";
import * as utils from '../src/pdf/core/utils'

describe('PdfAnnotationCollection / PdfPopupAnnotationCollection - uncovered behavior tests', () => {
    type DictStore = Map<string, unknown>;

    function createReference(id: string): _PdfReference {
        const ref: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        Object.defineProperty(ref, '_id', {
            value: id,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return ref;
    }

    function createName(name: string): _PdfName {
        const pdfName: _PdfName = Object.create(_PdfName.prototype) as _PdfName;
        Object.defineProperty(pdfName, 'name', {
            value: name,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return pdfName;
    }

    function createDictionary(initial?: Record<string, unknown>): _PdfDictionary {
        const store: DictStore = new Map<string, unknown>();
        if (initial) {
            Object.keys(initial).forEach((key: string) => {
                store.set(key, initial[key]);
            });
        }

        const dict: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary & {
            _store: DictStore;
            _updated: boolean;
            has: (key: string) => boolean;
            get: (key: string) => unknown;
            _get: (key: string) => unknown;
            getRaw: (key: string) => unknown;
            getArray: (key: string) => number[];
            set: jasmine.Spy;
            update: jasmine.Spy;
        };

        (dict as any)._store = store;
        dict._updated = false;

        dict.has = (key: string): boolean => store.has(key);
        dict.get = (key: string): unknown => store.get(key);
        dict._get = (key: string): unknown => store.get(key);
        dict.getRaw = (key: string): unknown => store.get(key);
        dict.getArray = (key: string): number[] => store.get(key) as number[];

        dict.set = jasmine.createSpy('set').and.callFake((key: string, value: unknown): void => {
            store.set(key, value);
            dict._updated = true;
        });

        dict.update = jasmine.createSpy('update').and.callFake((key: string, value: unknown): void => {
            store.set(key, value);
            dict._updated = true;
        });

        return dict as _PdfDictionary;
    }

    function createPage(annots: _PdfReference[] = []): PdfPage {
        const pageDictionary: {
            _updated: boolean;
            _store: Map<string, unknown>;
            has: (key: string) => boolean;
            get: (key: string) => unknown;
            set: jasmine.Spy;
        } = {
            _updated: false,
            _store: new Map<string, unknown>([['Annots', annots]]),
            has: (key: string): boolean => pageDictionary._store.has(key),
            get: (key: string): unknown => pageDictionary._store.get(key),
            set: jasmine.createSpy('pageDictionary.set').and.callFake((key: string, value: unknown): void => {
                pageDictionary._store.set(key, value);
                pageDictionary._updated = true;
            })
        };

        const page: PdfPage = {
            _pageDictionary: pageDictionary,
            _crossReference: {
                _cacheMap: new Map<_PdfReference, unknown>()
            } as unknown as _PdfCrossReference,
            _getProperty: (key: string): unknown => pageDictionary.get(key)
        } as unknown as PdfPage;

        return page;
    }

    function createXref(fetchResult?: _PdfDictionary): _PdfCrossReference {
        const xref: _PdfCrossReference = {
            _cacheMap: new Map<_PdfReference, unknown>(),
            _fetch: jasmine.createSpy('_fetch').and.callFake((): _PdfDictionary | undefined => fetchResult),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => createReference('next'))
        } as unknown as _PdfCrossReference;

        return xref;
    }

    function createPopup(ref: _PdfReference, dictionary?: _PdfDictionary): PdfPopupAnnotation {
        const popup: PdfPopupAnnotation = Object.create(PdfPopupAnnotation.prototype) as PdfPopupAnnotation & {
            _dictionary: _PdfDictionary;
            _ref: _PdfReference;
            _isReview: boolean;
            _isComment: boolean;
            reviewHistory: PdfPopupAnnotationCollection;
        };
        popup._ref = ref;
        popup._dictionary = dictionary || createDictionary();
        popup._isReview = false;
        popup._isComment = false;
        Object.defineProperty(popup, 'reviewHistory', {
            value: { _collection: [] } as PdfPopupAnnotationCollection,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return popup;
    }

    function createBaseAnnotation(ref: _PdfReference, dictionary?: _PdfDictionary): PdfAnnotation {
        const annot: PdfAnnotation = Object.create(PdfAnnotation.prototype) as PdfAnnotation & {
            _ref: _PdfReference;
            _dictionary: _PdfDictionary;
            flatten: boolean;
            _isExport: boolean;
            _doPostProcess: jasmine.Spy;
        };
        annot._ref = ref;
        annot._dictionary = dictionary || createDictionary();
        annot.flatten = false;
        annot._isExport = false;
        annot._doPostProcess = jasmine.createSpy('_doPostProcess');
        return annot;
    }

    function createCommentLikeAnnotation(ref: _PdfReference, dictionary?: _PdfDictionary): PdfComment {
        const annot: PdfComment = Object.create(PdfComment.prototype) as PdfComment & {
            _ref: _PdfReference;
            _dictionary: _PdfDictionary;
            comments: PdfPopupAnnotationCollection;
            reviewHistory: PdfPopupAnnotationCollection;
        };
        annot._ref = ref;
        annot._dictionary = dictionary || createDictionary();
        Object.defineProperty(annot, 'comments', {
            value: { _collection: [], count: 0, _isReview: false } as PdfPopupAnnotationCollection,
            configurable: true,
            enumerable: true,
            writable: true
        });
        Object.defineProperty(annot, 'reviewHistory', {
            value: { _collection: [], count: 0, _isReview: true } as PdfPopupAnnotationCollection,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return annot;
    }

    it('removeAt should fetch and parse annotation when parsed cache does not contain the index, remove popup reference and main reference, and clear xref cache', () => {
        // Arrange
        const mainRef: _PdfReference = createReference('main');
        const popupRef: _PdfReference = createReference('popup');
        const pageRefArray: _PdfReference[] = [popupRef, mainRef];
        const page: PdfPage = createPage(pageRefArray);
        const parsedDict: _PdfDictionary = createDictionary({ Popup: popupRef });
        const xref: _PdfCrossReference = createXref(parsedDict);

        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);
        sut._annotations = [mainRef];

        const parsedAnnotation: PdfComment = createCommentLikeAnnotation(mainRef, parsedDict);
        (parsedAnnotation as any).comments = {
            _collection: [],
            count: 0,
            _isReview: false
        } as PdfPopupAnnotationCollection;
        (parsedAnnotation as any).reviewHistory = {
            _collection: [],
            count: 0,
            _isReview: true
        } as PdfPopupAnnotationCollection;

        spyOn(sut, '_parseAnnotation').and.returnValue(parsedAnnotation);
        spyOn(sut, '_processAnnotations').and.callThrough();
        page._crossReference._cacheMap.set(mainRef, parsedDict);

        // Act
        sut.removeAt(0);

        // Assert
        expect((xref._fetch as jasmine.Spy)).toHaveBeenCalledWith(mainRef);
        expect(sut._parseAnnotation).toHaveBeenCalledWith(parsedDict);
        expect(parsedAnnotation._ref).toBe(mainRef);
        expect(pageRefArray.indexOf(popupRef)).toBe(-1);
        expect(pageRefArray.indexOf(mainRef)).toBe(-1);
        expect(page._pageDictionary.set).toHaveBeenCalledWith('Annots', pageRefArray);
        expect(page._pageDictionary._updated).toBeTruthy();
        expect(sut._annotations.length).toBe(0);
        expect(page._crossReference._cacheMap.has(mainRef)).toBeFalsy();
    });

    it('removeAt should reorder parsed annotations when cached entry is removed', () => {
        // Arrange
        const ref0: _PdfReference = createReference('r0');
        const ref1: _PdfReference = createReference('r1');
        const pageRefs: _PdfReference[] = [ref0, ref1];
        const page: PdfPage = createPage(pageRefs);
        const xref: _PdfCrossReference = createXref(createDictionary());

        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);
        sut._annotations = [ref0, ref1];

        const annot0: PdfAnnotation = createBaseAnnotation(ref0);
        const annot1: PdfAnnotation = createBaseAnnotation(ref1);
        sut._parsedAnnotations.set(0, annot0);
        sut._parsedAnnotations.set(1, annot1);

        // Act
        sut.removeAt(0);

        // Assert
        expect(sut._parsedAnnotations.has(0)).toBeTruthy();
        expect(sut._parsedAnnotations.get(0)).toBe(annot1);
    });

    it('_processReferences should remove matching references from page array, internal annotations and cache', () => {
        // Arrange
        const refA: _PdfReference = createReference('A');
        const refB: _PdfReference = createReference('B');
        const page: PdfPage = createPage([refA, refB]);
        const xref: _PdfCrossReference = createXref();
        page._crossReference._cacheMap.set(refA, {});

        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);
        sut._annotations = [refA, refB];

        // Act
        sut._processReferences([refA], page._getProperty('Annots') as _PdfReference[]);

        // Assert
        const annotsArray: _PdfReference[] = page._getProperty('Annots') as _PdfReference[];
        expect(annotsArray).toEqual([refB]);
        expect(sut._annotations).toEqual([refB]);
        expect(page._crossReference._cacheMap.has(refA)).toBeFalsy();
    });

    it('_processAnnotations should include popup ref and all reviewHistory refs before delegating to _processReferences', () => {
        // Arrange
        const popupRef: _PdfReference = createReference('popup');
        const reviewRef: _PdfReference = createReference('review');
        const page: PdfPage = createPage([popupRef, reviewRef]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const popup: PdfPopupAnnotation = createPopup(popupRef);
        (popup as any).reviewHistory = {
            _collection: [createPopup(reviewRef)],
            count: 1
        } as PdfPopupAnnotationCollection;

        const popupCollection: PdfPopupAnnotationCollection = {
            _collection: [popup],
            count: 1
        } as PdfPopupAnnotationCollection;

        const processReferencesSpy: jasmine.Spy = spyOn(sut, '_processReferences').and.callThrough();

        // Act
        sut._processAnnotations(popupCollection, page._getProperty('Annots') as _PdfReference[]);

        // Assert
        expect(processReferencesSpy).toHaveBeenCalled();
        const firstCallArgs: unknown[] = processReferencesSpy.calls.mostRecent().args;
        expect(firstCallArgs[0] as _PdfReference[]).toEqual([popupRef, reviewRef]);
    });

    it('_updateChildReference should set IRT to previous review item for subsequent review entries and add children', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const parentRef: _PdfReference = createReference('parent');
        const parent: PdfComment = createCommentLikeAnnotation(parentRef, createDictionary());

        const child0Ref: _PdfReference = createReference('child0');
        const child1Ref: _PdfReference = createReference('child1');

        const child0Dict: _PdfDictionary = createDictionary();
        const child1Dict: _PdfDictionary = createDictionary();

        const child0: PdfPopupAnnotation = createPopup(child0Ref, child0Dict);
        const child1: PdfPopupAnnotation = createPopup(child1Ref, child1Dict);

        const reviewCollection: PdfPopupAnnotationCollection = {
            _collection: [child0, child1],
            count: 2,
            _isReview: true
        } as PdfPopupAnnotationCollection;

        const addSpy: jasmine.Spy = spyOn(sut, 'add').and.returnValue(0);

        // Act
        sut._updateChildReference(parent, reviewCollection, 28);

        // Assert
        expect(child0Dict.update).toHaveBeenCalledWith('IRT', parentRef);
        expect(child1Dict.update).toHaveBeenCalledWith('IRT', child0Ref);
        expect((child0 as PdfPopupAnnotation & { _isReview: boolean })._isReview).toBeTruthy();
        expect((child1 as PdfPopupAnnotation & { _isReview: boolean })._isReview).toBeTruthy();
        expect(addSpy.calls.count()).toBe(2);
    });

    it('_updateChildReference should throw when trying to add comments/reviews to a review flag=30', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const parentRef: _PdfReference = createReference('parent');
        const parent: PdfComment = createCommentLikeAnnotation(parentRef, createDictionary());

        const child: PdfPopupAnnotation = createPopup(createReference('child'));
        const reviewCollection: PdfPopupAnnotationCollection = {
            _collection: [child],
            count: 1,
            _isReview: true
        } as PdfPopupAnnotationCollection;

        // Act / Assert
        expect((): void => {
            sut._updateChildReference(parent, reviewCollection, 30);
        }).toThrowError('Could not add comments/reviews to the review');
    });

    it('_getAnnotations should decrement index safely when parse returns undefined for popup with external parent, without causing timeout', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();

        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const popupParentDict: _PdfDictionary = createDictionary({
            Subtype: createName('Popup'),
            Parent: createReference('externalParent')
        });
        const squareDict: _PdfDictionary = createDictionary({
            Subtype: createName('Square'),
            Rect: [0, 0, 10, 10]
        });

        sut._annotations = [popupParentDict as unknown as _PdfReference, squareDict as unknown as _PdfReference];

        const parsedSquare: PdfAnnotation = createBaseAnnotation(createReference('squareRef'));

        let firstCall: boolean = true;
        spyOn(sut, '_isPopupWithExternalParent').and.callFake((dict: _PdfDictionary): boolean => {
            return dict === popupParentDict;
        });
        spyOn(sut, '_parseAnnotation').and.callFake((dict: _PdfDictionary, index?: number): PdfAnnotation | undefined => {
            if (firstCall && dict === popupParentDict) {
                firstCall = false;
                sut._annotations.splice(index as number, 1);
                return undefined;
            }
            return parsedSquare;
        });

        // Act
        sut._getAnnotations();

        // Assert
        expect(sut._parsedAnnotations.size).toBe(1);
        expect(sut._parsedAnnotations.get(0)).toBe(parsedSquare);
    });

    it('_isPopupWithExternalParent should return true only for Popup subtype with Parent entry', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const popupDict: _PdfDictionary = createDictionary({
            Subtype: createName('Popup'),
            Parent: createReference('parent')
        });

        // Act
        const result: boolean = sut._isPopupWithExternalParent(popupDict);

        // Assert
        expect(result).toBeTruthy();
    });

    it('_parseAnnotation should load PdfSquareAnnotation when Square rect satisfies size[2] === size[3]', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const dict: _PdfDictionary = createDictionary({
            Subtype: createName('Square'),
            Rect: [2, 1, 10, 10]
        });

        const squareAnnot: PdfAnnotation = createBaseAnnotation(createReference('square'));
        const squareSpy: jasmine.Spy = spyOn(PdfSquareAnnotation, '_load').and.returnValue(squareAnnot as unknown as PdfSquareAnnotation);
        const rectangleSpy: jasmine.Spy = spyOn(PdfRectangleAnnotation, '_load').and.returnValue(createBaseAnnotation(createReference('rect')) as unknown as PdfRectangleAnnotation);

        // Act
        const result: PdfAnnotation = sut._parseAnnotation(dict) as PdfAnnotation;

        // Assert
        expect(squareSpy).toHaveBeenCalledWith(page, dict);
        expect(rectangleSpy).not.toHaveBeenCalled();
        expect(result).toBe(squareAnnot);
    });

    it('_parseAnnotation should remove external-parent popup from annotations when index is provided', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const popupRef0: _PdfReference = createReference('p0');
        const popupRef1: _PdfReference = createReference('p1');
        sut._annotations = [popupRef0, popupRef1];

        const dict: _PdfDictionary = createDictionary({
            Subtype: createName('Popup'),
            Parent: createReference('parent')
        });

        // Act
        const result: PdfAnnotation = sut._parseAnnotation(dict, 0) as PdfAnnotation;

        // Assert
        expect(result).toBeUndefined();
        expect(sut._annotations).toEqual([popupRef1]);
    });

    it('_parseAnnotation should load PdfDocumentLinkAnnotation when subtype is Link and A is absent', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const dict: _PdfDictionary = createDictionary({
            Subtype: createName('Link'),
            Rect: [0, 0, 20, 20]
        });

        const linkAnnot: PdfAnnotation = createBaseAnnotation(createReference('docLink'));
        const documentLinkSpy: jasmine.Spy = spyOn(PdfDocumentLinkAnnotation, '_load')
            .and.returnValue(linkAnnot as unknown as PdfDocumentLinkAnnotation);

        // Act
        const result: PdfAnnotation = sut._parseAnnotation(dict) as PdfAnnotation;

        // Assert
        expect(documentLinkSpy).toHaveBeenCalledWith(page, dict);
        expect(result).toBe(linkAnnot);
    });

    it('_getLinkAnnotation should default to PdfUriAnnotation when A entry is absent', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        const dict: _PdfDictionary = createDictionary();
        const uriAnnot: PdfUriAnnotation = createBaseAnnotation(createReference('uri')) as unknown as PdfUriAnnotation;
        const uriSpy: jasmine.Spy = spyOn(PdfUriAnnotation, '_load').and.returnValue(uriAnnot);

        // Act
        const result: PdfUriAnnotation = sut._getLinkAnnotation(dict) as PdfUriAnnotation;

        // Assert
        expect(uriSpy).toHaveBeenCalledWith(page, dict);
        expect(result).toBe(uriAnnot);
    });

    it('_hasValidBorder should ignore undefined/null values inside border array and return true when no positive value exists', () => {
        // Arrange
        const page: PdfPage = createPage([]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        // Act
        const result: boolean = sut._hasValidBorder([0, undefined as unknown as number, null as unknown as number, 0]);

        // Assert
        expect(result).toBeTruthy();
    });

    it('_doPostProcess should increment index when flatten is true and annotation ref is no longer present, and should not loop forever', () => {
        // Arrange
        const existingRef: _PdfReference = createReference('existing');
        const annotationRef: _PdfReference = createReference('missing');
        const page: PdfPage = createPage([existingRef]);
        const xref: _PdfCrossReference = createXref();
        const sut: PdfAnnotationCollection = new PdfAnnotationCollection([], xref, page);

        sut._annotations = [existingRef];

        const annotation: PdfAnnotation = createBaseAnnotation(annotationRef);
        annotation.flatten = true;

        spyOn(sut, 'at').and.returnValue(annotation);

        // Act
        sut._doPostProcess(false);

        // Assert
        expect(annotation._doPostProcess).toHaveBeenCalledWith(true);
        expect((sut.at as jasmine.Spy).calls.count()).toBe(1);
    });

    it('PdfPopupAnnotationCollection._parseReview should add matching review replies from page.annotations iteration path and cache unrelated items', () => {
        // Arrange
        const parentRef: _PdfReference = createReference('parent');
        const page: PdfPage = createPage([]);
        const parentAnnotation: PdfAnnotation = Object.create(PdfAnnotation.prototype) as PdfAnnotation & {
            _ref: _PdfReference;
            _dictionary: _PdfDictionary;
            _isLoaded: boolean;
            _page: PdfPage;
        };
        parentAnnotation._ref = parentRef;
        parentAnnotation._dictionary = createDictionary();
        parentAnnotation._isLoaded = false;
        parentAnnotation._page = page;

        const reviewPopupDict: _PdfDictionary = createDictionary({ IRT: parentRef });
        const reviewPopup: PdfPopupAnnotation = createPopup(createReference('review-1'), reviewPopupDict);
        (reviewPopup as PdfPopupAnnotation & { _isReview: boolean })._isReview = true;

        const unrelatedDict: _PdfDictionary = createDictionary({ IRT: createReference('other') });
        const unrelatedPopup: PdfPopupAnnotation = createPopup(createReference('review-2'), unrelatedDict);
        (unrelatedPopup as PdfPopupAnnotation & { _isReview: boolean })._isReview = true;

        const pageAnnotations: PdfAnnotationCollection = {
            _comments: [],
            count: 2,
            at: (index: number): PdfAnnotation => index === 0 ? reviewPopup : unrelatedPopup
        } as unknown as PdfAnnotationCollection;

        (page as any).annotations = pageAnnotations;

        const sut: PdfPopupAnnotationCollection = new PdfPopupAnnotationCollection(parentAnnotation, true);

        // Act
        sut._parseReview();

        // Assert
        expect(sut.count).toBe(1);
        expect(sut.at(0)).toBe(reviewPopup);
        expect(pageAnnotations._comments).toEqual([unrelatedPopup]);
    });

    it('PdfPopupAnnotationCollection._parseComments should empty collection._comments when all cached comments belong to current annotation and are not reviews', () => {
        // Arrange
        const parentRef: _PdfReference = createReference('parent');
        const page: PdfPage = createPage([]);
        const parentAnnotation: PdfAnnotation = Object.create(PdfAnnotation.prototype) as PdfAnnotation & {
            _ref: _PdfReference;
            _dictionary: _PdfDictionary;
            _isLoaded: boolean;
            _page: PdfPage;
        };
        parentAnnotation._ref = parentRef;
        parentAnnotation._dictionary = createDictionary();
        parentAnnotation._isLoaded = false;
        parentAnnotation._page = page;

        const commentDict1: _PdfDictionary = createDictionary({ IRT: parentRef });
        const comment1: PdfPopupAnnotation = createPopup(createReference('c1'), commentDict1);

        const commentDict2: _PdfDictionary = createDictionary({ IRT: parentRef });
        const comment2: PdfPopupAnnotation = createPopup(createReference('c2'), commentDict2);

        const pageAnnotations: PdfAnnotationCollection = {
            _comments: [comment1, comment2],
            count: 0,
            at: (): PdfAnnotation => undefined as unknown as PdfAnnotation
        } as unknown as PdfAnnotationCollection;

        (page as any).annotations = pageAnnotations;

        const checkReviewSpy: jasmine.Spy = spyOn(utils, '_checkReview').and.returnValue(false);
        const sut: PdfPopupAnnotationCollection = new PdfPopupAnnotationCollection(parentAnnotation, false);

        // Act
        sut._parseComments();

        // Assert
        expect(checkReviewSpy.calls.count()).toBe(2);
        expect(sut.count).toBe(2);
        expect(pageAnnotations._comments).toEqual([]);
    });
});
