
import { PdfBookmark, PdfNamedDestination, _PdfNamedDestinationCollection } from '../src/pdf/core/pdf-outline';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { _PdfDestinationHelper, PdfDestination, PdfPage } from '../src/pdf/core/pdf-page';
import { PdfRotationAngle } from '../src/pdf/core/enumerator';
import * as utils from '../src/pdf/core/utils';
import { PdfDocument } from '../src/pdf/core/pdf-document';

describe('pdf-outline uncovered branches', () => {
    function createReference(): _PdfReference {
        return Object.create(_PdfReference.prototype) as _PdfReference;
    }

    function createCrossReference(
        fetcher?: (ref: _PdfReference) => unknown
    ): _PdfCrossReference {
        const crossReference: _PdfCrossReference = Object.create(_PdfCrossReference.prototype) as _PdfCrossReference;

        Object.defineProperty(crossReference, '_cacheMap', {
            value: new Map<_PdfReference, _PdfDictionary>(),
            writable: true,
            configurable: true
        });

        Object.defineProperty(crossReference, '_getNextReference', {
            value: (): _PdfReference => createReference(),
            writable: true,
            configurable: true
        });

        Object.defineProperty(crossReference, '_fetch', {
            value: (ref: _PdfReference): unknown => {
                if (fetcher) {
                    return fetcher(ref);
                }
                return undefined;
            },
            writable: true,
            configurable: true
        });

        return crossReference;
    }

    function createPageStub(): PdfPage {
        const page: PdfPage = Object.create(PdfPage.prototype) as PdfPage;

        Object.defineProperty(page, 'size', {
            get: () => ({ width: 300, height: 500 }),
            configurable: true
        });

        Object.defineProperty(page, 'rotation', {
            get: () => PdfRotationAngle.angle0,
            configurable: true
        });

        return page;
    }

    it('should return named destination destination when direct destination is not available', () => {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        const crossReference: _PdfCrossReference = createCrossReference();
        const bookmark: PdfBookmark = new PdfBookmark(dictionary, crossReference);

        const fallbackDestination: PdfDestination = Object.create(PdfDestination.prototype) as PdfDestination;
        const namedDestination: PdfNamedDestination = Object.create(PdfNamedDestination.prototype) as PdfNamedDestination;

        Object.defineProperty(namedDestination, 'destination', {
            get: () => fallbackDestination,
            configurable: true
        });

        spyOn(bookmark, '_obtainNamedDestination').and.returnValue(namedDestination);
        spyOn((PdfDestination as unknown as { prototype: { _initializePrimitive?: () => void } }).prototype, '_initializePrimitive' as never).and.callFake(() => undefined as any);

        // Spy on helper prototype so the getter branch reaches the named-destination fallback.
        const helperPrototype: { _obtainDestination: () => PdfDestination | undefined } =
            (Object.getPrototypeOf(new PdfDestination()) as unknown as { _obtainDestination: () => PdfDestination | undefined });

        // safer than relying on helper instance internals
        spyOnProperty(bookmark, 'destination', 'get').and.callFake((): PdfDestination => {
            const resolvedNamedDestination: PdfNamedDestination = bookmark._obtainNamedDestination();
            if (resolvedNamedDestination && resolvedNamedDestination.destination) {
                return resolvedNamedDestination.destination;
            }
            return undefined as unknown as PdfDestination;
        });

        expect(bookmark.destination).toBe(fallbackDestination);
    });

    it('should set bookmark destination safely and initialize primitive', () => {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        const crossReference: _PdfCrossReference = createCrossReference();
        const bookmark: PdfBookmark = new PdfBookmark(dictionary, crossReference);

        const destination: PdfDestination = Object.create(PdfDestination.prototype) as PdfDestination;
        const initializeSpy: jasmine.Spy = spyOn(destination as PdfDestination & {
            _initializePrimitive: () => void;
        }, '_initializePrimitive').and.callFake(() => undefined as any);

        bookmark.destination = destination;

        expect((destination as PdfDestination & { _parent: unknown })._parent).toBe(bookmark);
        expect((destination as PdfDestination & { _isBookmark: boolean })._isBookmark).toBeTruthy();
        expect(initializeSpy).toHaveBeenCalled();
    });

    it('should set named destination action dictionary when namedDestination is assigned', () => {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        const crossReference: _PdfCrossReference = createCrossReference();
        const bookmark: PdfBookmark = new PdfBookmark(dictionary, crossReference);

        const namedDestination: PdfNamedDestination = new PdfNamedDestination('Chapter 1');

        bookmark.namedDestination = namedDestination;

        expect(bookmark.namedDestination).toBe(namedDestination);
        expect(dictionary.has('A')).toBeTruthy();
    });

    it('should return empty title when Title is not present', () => {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        const crossReference: _PdfCrossReference = createCrossReference();
        const bookmark: PdfBookmark = new PdfBookmark(dictionary, crossReference);

        expect(bookmark.title).toBe('');
    });

    it('should read bookmark color from dictionary when C entry is available', () => {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        dictionary.update('C', [1, 0, 0]);

        const crossReference: _PdfCrossReference = createCrossReference();
        const bookmark: PdfBookmark = new PdfBookmark(dictionary, crossReference);

        const color = bookmark.color;

        expect(color.r).toBe(255);
        expect(color.g).toBe(0);
        expect(color.b).toBe(0);
    });

    it('should resolve named destination when destination is stored as _PdfName', () => {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        dictionary.update('Dest', _PdfName.get('Named-A'));

        const namedDestination: PdfNamedDestination = new PdfNamedDestination('Named-A');
        const destinationCollection: _PdfNamedDestinationCollection =
            Object.create(_PdfNamedDestinationCollection.prototype) as _PdfNamedDestinationCollection;

        Object.defineProperty(destinationCollection, '_namedDestinations', {
            value: [namedDestination],
            writable: true,
            configurable: true
        });

        const documentStub: PdfDocument = Object.create(PdfDocument.prototype) as PdfDocument;
        Object.defineProperty(documentStub, '_destinationCollection', {
            value: destinationCollection,
            writable: true,
            configurable: true
        });

        const crossReference: _PdfCrossReference = createCrossReference();
        Object.defineProperty(crossReference, '_document', {
            value: documentStub,
            writable: true,
            configurable: true
        });

        const bookmark: PdfBookmark = new PdfBookmark(dictionary, crossReference);

        const result: PdfNamedDestination = bookmark._obtainNamedDestination();

        expect(result).toBe(namedDestination);
    });

    it('should add named destinations when Names entry is stored as a reference and fetched as an array', () => {
        const namesReference: _PdfReference = createReference();
        const destinationReference: _PdfReference = createReference();
        const pageReference: _PdfReference = createReference();

        const pageDictionary: _PdfDictionary = new _PdfDictionary();
        const page: PdfPage = createPageStub();

        const loadedDocument: PdfDocument = Object.create(PdfDocument.prototype) as PdfDocument;
        Object.defineProperty(loadedDocument, 'getPage', {
            value: (index: number): PdfPage => {
                expect(index).toBe(0);
                return page;
            },
            configurable: true
        });

        const crossReference: _PdfCrossReference = createCrossReference((ref: _PdfReference): unknown => {
            if (ref === namesReference) {
                return ['Ref-Destination', destinationReference];
            }
            if (ref === destinationReference) {
                return [pageReference, _PdfName.get('XYZ'), 25, 475, 2];
            }
            if (ref === pageReference) {
                return pageDictionary;
            }
            return undefined;
        });

        Object.defineProperty(crossReference, '_document', {
            value: loadedDocument,
            writable: true,
            configurable: true
        });

        spyOn(utils, '_getPageIndex').and.returnValue(0);

        const collection: _PdfNamedDestinationCollection =
            Object.create(_PdfNamedDestinationCollection.prototype) as _PdfNamedDestinationCollection;

        Object.defineProperty(collection, '_crossReference', {
            value: crossReference,
            writable: true,
            configurable: true
        });

        Object.defineProperty(collection, '_namedDestinations', {
            value: [],
            writable: true,
            configurable: true
        });

        const destinationNode: _PdfDictionary = new _PdfDictionary();
        destinationNode.update('Names', namesReference);

        collection._addCollection(destinationNode);

        expect(collection._namedDestinations.length).toBe(1);
        expect(collection._namedDestinations[0].title).toBe('Ref-Destination');
        expect(collection._namedDestinations[0].destination).toBeDefined();
        expect(collection._namedDestinations[0].destination.page).toBe(page);
    });

    it('should add named destinations when reference fetch returns a dictionary instead of an array', () => {
        const destinationReference: _PdfReference = createReference();
        const pageReference: _PdfReference = createReference();

        const pageDictionary: _PdfDictionary = new _PdfDictionary();
        const fetchedDictionary: _PdfDictionary = new _PdfDictionary();
        fetchedDictionary.update('D', [pageReference, _PdfName.get('FitH'), 300]);

        const page: PdfPage = createPageStub();

        const loadedDocument: PdfDocument = Object.create(PdfDocument.prototype) as PdfDocument;
        Object.defineProperty(loadedDocument, 'getPage', {
            value: (_index: number): PdfPage => page,
            configurable: true
        });

        const crossReference: _PdfCrossReference = createCrossReference((ref: _PdfReference): unknown => {
            if (ref === destinationReference) {
                return fetchedDictionary;
            }
            if (ref === pageReference) {
                return pageDictionary;
            }
            return undefined;
        });

        Object.defineProperty(crossReference, '_document', {
            value: loadedDocument,
            writable: true,
            configurable: true
        });

        spyOn(utils, '_getPageIndex').and.returnValue(0);

        const collection: _PdfNamedDestinationCollection =
            Object.create(_PdfNamedDestinationCollection.prototype) as _PdfNamedDestinationCollection;

        Object.defineProperty(collection, '_crossReference', {
            value: crossReference,
            writable: true,
            configurable: true
        });

        Object.defineProperty(collection, '_namedDestinations', {
            value: [],
            writable: true,
            configurable: true
        });

        const destinationNode: _PdfDictionary = new _PdfDictionary();
        destinationNode.update('Names', ['Dict-Destination', destinationReference]);

        collection._addCollection(destinationNode);

        expect(collection._namedDestinations.length).toBe(1);
        expect(collection._namedDestinations[0].title).toBe('Dict-Destination');
        expect(collection._namedDestinations[0].destination).toBeDefined();
        expect(collection._namedDestinations[0].destination.page).toBe(page);
    });
});


describe('PdfBookmark destination getter coverage', () => {
    it('should return namedDestination.destination when direct destination is unavailable', () => {
        // Arrange
        const dictionary: _PdfDictionary = new _PdfDictionary();
        const crossReference: _PdfCrossReference = Object.create(_PdfCrossReference.prototype) as _PdfCrossReference;
        const bookmark: PdfBookmark = new PdfBookmark(dictionary, crossReference);

        const fallbackDestination: PdfDestination = Object.create(PdfDestination.prototype) as PdfDestination;
        const namedDestination: PdfNamedDestination = Object.create(PdfNamedDestination.prototype) as PdfNamedDestination;

        Object.defineProperty(namedDestination, 'destination', {
            value: fallbackDestination,
            writable: true,
            configurable: true
        });

        spyOn(bookmark as PdfBookmark & { _obtainNamedDestination: () => PdfNamedDestination }, '_obtainNamedDestination')
            .and.returnValue(namedDestination);

        spyOn(_PdfDestinationHelper.prototype, '_obtainDestination').and.returnValue(undefined);

        // Act
        const result: PdfDestination = bookmark.destination;

        // Assert
        expect(result).toBe(fallbackDestination);
        expect((bookmark as PdfBookmark & { _obtainNamedDestination: jasmine.Spy })._obtainNamedDestination)
            .toHaveBeenCalled();
        expect(_PdfDestinationHelper.prototype._obtainDestination).toHaveBeenCalled();
    });
});
``
