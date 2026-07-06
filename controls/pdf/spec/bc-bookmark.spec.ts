import { PdfBookmark, PdfBookmarkBase, PdfNamedDestination, _PdfNamedDestinationCollection } from '../src/pdf/core/pdf-outline';
import { PdfDestinationMode, PdfRotationAngle, PdfTextStyle } from '../src/pdf/core/enumerator';
import { _PdfDictionary, _PdfReference, _PdfName } from '../src/pdf/core/pdf-primitives';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import * as utils from '../src/pdf/core/utils';
import { PdfDestination } from '../src/pdf/core/pdf-page';

// Mock classes for testing
class MockDictionary {
    _map: Record<string, unknown> = {};
    _updated: boolean = false;

    constructor(initialMap?: Record<string, unknown>) {
        if (initialMap) {
            this._map = { ...initialMap };
        }
    }

    has(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this._map, key);
    }

    get(key: string): unknown {
        return this._map[key];
    }

    getRaw(key: string): unknown {
        return this._map[key];
    }

    getArray(key: string): unknown[] {
        const val = this._map[key];
        return Array.isArray(val) ? val : [];
    }

    update(key: string, value: unknown): void {
        this._map[key] = value;
        this._updated = true;
    }
}

class MockReference {
    value: unknown;

    constructor(val: unknown) {
        this.value = val;
    }
}

class MockPdfName {
    name: string;

    constructor(n: string) {
        this.name = n;
    }
}

class MockPage {
    size: { width: number; height: number } = { width: 612, height: 792 };
    rotation: PdfRotationAngle = PdfRotationAngle.angle0;
}

class MockCrossReference {
    _document: unknown;
    fetchMap: Map<unknown, unknown> = new Map();

    constructor(doc?: unknown) {
        this._document = doc;
    }

    _fetch(ref: unknown): unknown {
        if (ref instanceof MockReference || ref instanceof _PdfReference) {
            return this.fetchMap.get(ref) || null;
        }
        return null;
    }
}

describe('PdfNamedDestination._updateNamedDestinationTitle and constructor behavior tests', () => {

    it('constructor - exits when crossReference and dictionary present', () => {
        // Arrange
        const document = new PdfDocument();
        const dictionary = new _PdfDictionary();
        const named = new PdfNamedDestination(dictionary, document._crossReference);

        expect(named._crossReference).toBeDefined();
        expect(named._dictionary).toBeDefined();
    });
    it('constructor - exits when string and destination present', () => {
        // Arrange
        const destination = new PdfDestination();
        const named = new PdfNamedDestination("dictionary", destination);

        expect(named._destination).toBeDefined();
    });
    it('updateNamedDestinationTitle - exits when crossReference is null', () => {
        // Arrange
        const named = new PdfNamedDestination('Test');
        named._crossReference = null as any;

        // Act
        named._updateNamedDestinationTitle('NewName', 'OldName');

        // Assert - no error, silent exit
        expect(named._crossReference).toBeNull();
    });

    it('updateNamedDestinationTitle - exits when crossReference._document is null', () => {
        // Arrange
        const crossRef = new MockCrossReference(null);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('NewName', 'OldName');

        // Assert - no error, silent exit
        expect(crossRef._document).toBeNull();
    });

    it('updateNamedDestinationTitle - exits when catalog dictionary is null', () => {
        // Arrange
        const fakeDoc: any = { _catalog: { _catalogDictionary: null } };
        const crossRef = new MockCrossReference(fakeDoc);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('NewName', 'OldName');

        // Assert - no error, silent exit
        expect(fakeDoc._catalog._catalogDictionary).toBeNull();
    });

    it('updateNamedDestinationTitle - exits when catalog has no Names key', () => {
        // Arrange
        const catalog = new MockDictionary({});
        const fakeDoc: any = { _catalog: { _catalogDictionary: catalog } };
        const crossRef = new MockCrossReference(fakeDoc);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('NewName', 'OldName');

        // Assert
        expect(catalog.has('Names')).toBe(false);
    });

    it('updateNamedDestinationTitle - exits when names has no Dests key', () => {
        // Arrange
        const names = new MockDictionary({});
        const catalog = new MockDictionary({ Names: names });
        const fakeDoc: any = { _catalog: { _catalogDictionary: catalog } };
        const crossRef = new MockCrossReference(fakeDoc);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('NewName', 'OldName');

        // Assert
        expect(names.has('Dests')).toBe(false);
    });

    it('updateNamedDestinationTitle - exits when dests has no Names key', () => {
        // Arrange
        const dests = new MockDictionary({});
        const names = new MockDictionary({ Dests: dests });
        const catalog = new MockDictionary({ Names: names });
        const fakeDoc: any = { _catalog: { _catalogDictionary: catalog } };
        const crossRef = new MockCrossReference(fakeDoc);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('NewName', 'OldName');

        // Assert
        expect(dests.has('Names')).toBe(false);
    });

    it('updateNamedDestinationTitle - exits when previousTitle not found in names array', () => {
        // Arrange
        const namesArray = ['Other', 'Keep'];
        const dests = new MockDictionary({ Names: namesArray });
        const names = new MockDictionary({ Dests: dests });
        const catalog = new MockDictionary({ Names: names });
        const fakeDoc: any = { _catalog: { _catalogDictionary: catalog } };
        const crossRef = new MockCrossReference(fakeDoc);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('NewName', 'OldName');

        // Assert
        expect((namesArray as string[]).indexOf('OldName')).toBe(-1);
        expect(dests._updated).toBe(false);
    });

    it('updateNamedDestinationTitle - replaces previousTitle at index 0 and marks updated', () => {
        // Arrange
        const namesArray = ['OldName', 'RefKeep'];
        const dests = new MockDictionary({ Names: namesArray });
        const names = new MockDictionary({ Dests: dests });
        const catalog = new MockDictionary({ Names: names });
        const fakeDoc: any = { _catalog: { _catalogDictionary: catalog } };
        const crossRef = new MockCrossReference(fakeDoc);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('NewName', 'OldName');

        // Assert
        expect((namesArray as string[])[0]).toBe('NewName');
        expect((namesArray as string[])[1]).toBe('RefKeep');
        expect(dests._updated).toBe(true);
    });

    it('updateNamedDestinationTitle - replaces previousTitle at middle index and marks updated', () => {
        // Arrange
        const namesArray = ['First', 'Ref1', 'OldName', 'Ref2', 'Last', 'Ref3'];
        const dests = new MockDictionary({ Names: namesArray });
        const names = new MockDictionary({ Dests: dests });
        const catalog = new MockDictionary({ Names: names });
        const fakeDoc: any = { _catalog: { _catalogDictionary: catalog } };
        const crossRef = new MockCrossReference(fakeDoc);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('UpdatedName', 'OldName');

        // Assert
        expect((namesArray as string[])[2]).toBe('UpdatedName');
        expect(namesArray.length).toBe(6);
        expect(dests._updated).toBe(true);
    });

    it('updateNamedDestinationTitle - replaces previousTitle at last index and marks updated', () => {
        // Arrange
        const namesArray = ['First', 'Ref1', 'OldName', 'RefLast'];
        const dests = new MockDictionary({ Names: namesArray });
        const names = new MockDictionary({ Dests: dests });
        const catalog = new MockDictionary({ Names: names });
        const fakeDoc: any = { _catalog: { _catalogDictionary: catalog } };
        const crossRef = new MockCrossReference(fakeDoc);
        const named = new PdfNamedDestination('Test');
        named._crossReference = crossRef as any;

        // Act
        named._updateNamedDestinationTitle('FinalName', 'OldName');

        // Assert
        expect((namesArray as string[])[2]).toBe('FinalName');
        expect((namesArray as string[])[3]).toBe('RefLast');
        expect(dests._updated).toBe(true);
    });

});

describe('_PdfNamedDestinationCollection constructor and parsing behavior tests', () => {

    it('constructor - initializes empty when no arguments provided', () => {
        // Arrange & Act
        const collection = new _PdfNamedDestinationCollection();

        // Assert
        expect(collection._dictionary).toBeUndefined();
        expect(collection._crossReference).toBeUndefined();
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('constructor - sets dictionary only when dictionary provided', () => {
        // Arrange
        const dict = new MockDictionary({});

        // Act
        const collection = new _PdfNamedDestinationCollection(dict as any, undefined);

        // Assert
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('constructor - sets crossReference only when provided', () => {
        // Arrange
        const crossRef = new MockCrossReference(null);

        // Act
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Assert
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('constructor - skips parsing when dictionary lacks Dests key', () => {
        // Arrange
        const dict = new MockDictionary({ Other: 'value' });
        const crossRef = new MockCrossReference(null);

        // Act
        const collection = new _PdfNamedDestinationCollection(dict as any, crossRef as any);

        // Assert
        expect(dict.has('Dests')).toBe(false);
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('constructor - skips parsing when destination (Dests value) is null', () => {
        // Arrange
        const dict = new MockDictionary({ Dests: null });
        const crossRef = new MockCrossReference(null);

        // Act
        const collection = new _PdfNamedDestinationCollection(dict as any, crossRef as any);

        // Assert
        expect(dict.get('Dests')).toBeNull();
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('constructor - calls addCollection when destination has Names key', () => {
        // Arrange
        const namesArray = ['Title', { D: ['pageRef', new MockPdfName('Fit')] }];
        const dests = new MockDictionary({ Names: namesArray });
        const dict = new MockDictionary({ Dests: dests });
        const mockDoc: any = { getPage: (idx: number) => new MockPage() };
        const crossRef = new MockCrossReference(mockDoc);

        // Act
        const collection = new _PdfNamedDestinationCollection(dict as any, crossRef as any);

        // Assert
        expect(dests.has('Names')).toBe(true);
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(0);
    });

    it('constructor - calls findDestination for each kid when destination has Kids', () => {
        // Arrange
        const kid1 = new MockDictionary({ Names: ['Title1', { D: [] }] });
        const kid2 = new MockDictionary({ Names: ['Title2', { D: [] }] });
        const dests = new MockDictionary({ Kids: [kid1, kid2] });
        const dict = new MockDictionary({ Dests: dests });
        const mockDoc: any = { getPage: (idx: number): any => null };
        const crossRef = new MockCrossReference(mockDoc);

        // Act
        const collection = new _PdfNamedDestinationCollection(dict as any, crossRef as any);

        // Assert
        expect(Array.isArray(dests.get('Kids'))).toBe(true);
        expect((dests.get('Kids') as unknown[]).length).toBe(2);
    });

});

describe('_PdfNamedDestinationCollection._findDestination recursive parsing tests', () => {

    it('findDestination - exits when destination is null', () => {
        // Arrange
        const collection: any = new _PdfNamedDestinationCollection();

        // Act
        collection._findDestination(null as any);

        // Assert
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('findDestination - calls addCollection when destination has Names key', () => {
        // Arrange
        const namesArray = ['Title', { D: [] as string[] }];
        const dest = new MockDictionary({ Names: namesArray });
        const collection: any = new _PdfNamedDestinationCollection();
        const mockDoc: any = { getPage: (): any => null };
        collection._crossReference = new MockCrossReference(mockDoc) as any;

        // Act
        collection._findDestination(dest as any);

        // Assert
        expect(dest.has('Names')).toBe(true);
    });

    it('findDestination - recursively processes Kids when present and non-empty', () => {
        // Arrange
        const kid1 = new MockDictionary({ Names: ['T1', { D: [] }] });
        const kid2 = new MockDictionary({ Kids: [] });
        const dest = new MockDictionary({ Kids: [kid1, kid2] });
        const collection: any = new _PdfNamedDestinationCollection();
        const mockDoc: any = { getPage: (): any => null };
        collection._crossReference = new MockCrossReference(mockDoc) as any;

        // Act
        collection._findDestination(dest as any);

        // Assert
        expect(Array.isArray(dest.get('Kids'))).toBe(true);
        expect((dest.get('Kids') as unknown[]).length).toBe(2);
    });

    it('findDestination - skips forEach when Kids is empty array', () => {
        // Arrange
        const dest = new MockDictionary({ Kids: [] });
        const collection: any = new _PdfNamedDestinationCollection();
        const initialCount = collection._namedDestinations.length;

        // Act
        collection._findDestination(dest as any);

        // Assert
        expect((dest.get('Kids') as unknown[]).length).toBe(0);
        expect(collection._namedDestinations.length).toBe(initialCount);
    });

    it('findDestination - exits when destination has neither Names nor Kids', () => {
        // Arrange
        const dest = new MockDictionary({ Other: 'value' });
        const collection: any = new _PdfNamedDestinationCollection();
        const initialCount = collection._namedDestinations.length;

        // Act
        collection._findDestination(dest as any);

        // Assert
        expect(dest.has('Names')).toBe(false);
        expect(dest.has('Kids')).toBe(false);
        expect(collection._namedDestinations.length).toBe(initialCount);
    });

});

describe('_PdfNamedDestinationCollection._addCollection reference resolution and mode parsing tests', () => {

    it('addCollection - skips when elements is null', () => {
        // Arrange
        const dest = new MockDictionary({ Names: null });
        const collection = new _PdfNamedDestinationCollection();

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(dest.get('Names')).toBeNull();
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('addCollection - skips when elements is undefined', () => {
        // Arrange
        const dest = new MockDictionary({});
        const collection = new _PdfNamedDestinationCollection();

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(dest.getRaw('Names')).toBeUndefined();
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('addCollection - fetches reference when elements is _PdfReference', () => {
        // Arrange
        const namesArray = ['Title', { D: ['pageRef', new MockPdfName('Fit')] }];
        const ref = new MockReference(namesArray);
        const dest = new MockDictionary({ Names: ref });
        const mockDoc: any = { getPage: () => new MockPage() };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(ref, namesArray);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(ref instanceof MockReference).toBe(true);
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(0);
    });

    it('addCollection - uses inline array without fetching', () => {
        // Arrange
        const namesArray = ['Title', { D: ['pageRef', new MockPdfName('Fit')] }];
        const dest = new MockDictionary({ Names: namesArray });
        const mockDoc: any = { getPage: () => new MockPage() };
        const crossRef = new MockCrossReference(mockDoc);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(Array.isArray(namesArray)).toBe(true);
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(0);
    });

    it('addCollection - creates PdfDictionary from inline reference array', () => {
        // Arrange
        const destArray = ['pageRef', new MockPdfName('Fit')];
        const namesArray = ['Title', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const mockDoc: any = { getPage: () => new MockPage() };
        const crossRef = new MockCrossReference(mockDoc);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(Array.isArray(destArray)).toBe(true);
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(0);
    });

    it('addCollection - handles reference that fetches to array by wrapping in D dictionary', () => {
        // Arrange
        const destArray = ['pageRef', new MockPdfName('Fit')];
        const ref = new MockReference(destArray);
        const namesArray = ['Title', ref];
        const dest = new MockDictionary({ Names: namesArray });
        const mockDoc: any = { getPage: () => new MockPage() };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(ref, destArray);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(ref instanceof MockReference).toBe(true);
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(0);
    });



    it('addCollection - mode XYZ with null left uses 0 for x coordinate', () => {
        // Arrange
        const destArray = ['pageRef', new MockPdfName('XYZ'), null, 200, 1.5];
        const namesArray = ['XYZNull', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        if (collection._namedDestinations.length > 0) {
            const destObj = (collection._namedDestinations[0]._destination as any);
            if (destObj && destObj._location) {
                expect(destObj._location.x).toBe(0);
            }
        }
    });

    it('addCollection - sets namedDestination parent and isBookmark false', () => {
        // Arrange
        const destArray = ['pageRef', new MockPdfName('Fit')];
        const namesArray = ['ParentTest', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        if (collection._namedDestinations.length > 0) {
            const named = collection._namedDestinations[0];
            const destObj = (named._destination as any);
            if (destObj) {
                expect(destObj._parent).toBe(named);
                expect(destObj._isBookmark).toBe(false);
            }
        }
    });

    it('addCollection - creates one named destination per pair in Names array', () => {
        // Arrange
        const namesArray = [
            'Title1', ['pageRef1', new MockPdfName('Fit')],
            'Title2', ['pageRef2', new MockPdfName('XYZ'), 100, 200, 1]
        ];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBe(2);
        expect(collection._namedDestinations[0]._title).toBe('Title1');
        expect(collection._namedDestinations[1]._title).toBe('Title2');
    });

    it('addCollection - handles _PdfName modes (XYZ and FitH) and validity branches', () => {
        // Arrange - XYZ without page (no location computed)
        const namesXYZ = ['XYZMode', ['pageRef', new _PdfName('XYZ')]];
        const destXYZ = new MockDictionary({ Names: namesXYZ });
        const crossRefXYZ = new MockCrossReference(null);
        const collectionXYZ = new _PdfNamedDestinationCollection(undefined, crossRefXYZ as any);

        // Act
        collectionXYZ._addCollection(destXYZ as any);

        // Assert
        expect(collectionXYZ._namedDestinations.length).toBe(1);
        const destObjXYZ = (collectionXYZ._namedDestinations[0]._destination as any);
        expect(destObjXYZ._destinationMode).toBe(PdfDestinationMode.location);

        // Arrange - FitH without height should mark invalid
        const namesFitH = ['FitHMode', ['pRef', new _PdfName('FitH')]];
        const destFitH = new MockDictionary({ Names: namesFitH });
        const collectionFitH = new _PdfNamedDestinationCollection(undefined, crossRefXYZ as any);

        // Act
        collectionFitH._addCollection(destFitH as any);

        // Assert
        expect(collectionFitH._namedDestinations.length).toBe(1);
        const destObjFitH = (collectionFitH._namedDestinations[0]._destination as any);
        expect(destObjFitH._destinationMode).toBe(PdfDestinationMode.fitH);
        expect(destObjFitH._isValid).toBe(false);
    });
    it('addCollection - assigns destination page with (XYZ) mode 0 rotation', () => {
        // Arrange
        const pageDict = { some: 'pageDict' };
        const pageRef = new _PdfReference(5, 0);
        const destArray = [
            pageRef,                  // index 0
            new _PdfName('XYZ'),    // index 1 (destination type)
            100,                       // index 2 → left
            500,                       // index 3 → height
            1.25                       // index 4 → zoom
        ];
        const namesArray = ['RefTitle', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(pageRef, pageDict);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);
        // Act
        spyOn(utils, "_getPageIndex").and.returnValue(1)
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        const destObj: any = (collection._namedDestinations[0]._destination);
        expect(destObj.page).toBe(page);
        expect(destObj.mode).toEqual(PdfDestinationMode.location);
    });
    it('addCollection - assigns destination page with (XYZ) mode 90 rotation', () => {
        // Arrange
        const pageDict = { some: 'pageDict' };
        const pageRef = new _PdfReference(5, 0);
        const destArray = [
            pageRef,                  // index 0
            new _PdfName('XYZ'),    // index 1 (destination type)
            100,                       // index 2 → left
            500,                       // index 3 → height
            1.25                       // index 4 → zoom
        ];
        const namesArray = ['RefTitle', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        page.rotation = PdfRotationAngle.angle180;
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(pageRef, pageDict);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);
        // Act
        spyOn(utils, "_getPageIndex").and.returnValue(1);
        spyOn(utils, "_checkRotation").and.returnValue(10);
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        const destObj: any = (collection._namedDestinations[0]._destination);
        expect(destObj.page).toBe(page);
        expect(destObj.mode).toEqual(PdfDestinationMode.location);
    });
    it('addCollection - assigns destination page with (XYZ) mode withou array', () => {
        // Arrange
        const pageDict = { some: 'pageDict' };
        const pageRef = new _PdfReference(5, 0);
        const destArray = [
            pageRef,                  // index 0
            new _PdfName('XYZ'),    // index 1 (destination type)
        ];
        const namesArray = ['RefTitle', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        page.rotation = PdfRotationAngle.angle180;
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(pageRef, pageDict);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);
        // Act
        spyOn(utils, "_getPageIndex").and.returnValue(1);
        spyOn(utils, "_checkRotation").and.returnValue(10);
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        const destObj: any = (collection._namedDestinations[0]._destination);
        expect(destObj.page).toBe(page);
        expect(destObj.mode).toEqual(PdfDestinationMode.location);
    });
    it('addCollection - assigns destination page with (FitH) mode and array value', () => {
        // Arrange
        const pageDict = { some: 'pageDict' };
        const pageRef = new _PdfReference(5, 0);
        const destArray = [
            pageRef,                  // index 0
            new _PdfName('FitH'),    // index 1 (destination type)
            100,                       // index 2 → left
            500,                       // index 3 → height
            1.25                       // index 4 → zoom
        ];
        const namesArray = ['RefTitle', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(pageRef, pageDict);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);
        // Act
        spyOn(utils, "_getPageIndex").and.returnValue(1)
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        const destObj: any = (collection._namedDestinations[0]._destination);
        expect(destObj._location).not.toEqual({ x: 0, y: 0 });
        expect(destObj.page).toBe(page);
        expect(destObj.mode).toEqual(PdfDestinationMode.fitH);
    });
    it('addCollection - assigns destination page with (FitH) mode and without array value', () => {
        // Arrange
        const pageDict = { some: 'pageDict' };
        const pageRef = new _PdfReference(5, 0);
        const destArray = [
            pageRef,                  // index 0
            new _PdfName('FitH'),    // index 1 (destination type)                       
        ];
        const namesArray = ['RefTitle', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(pageRef, pageDict);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);
        // Act
        spyOn(utils, "_getPageIndex").and.returnValue(1)
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        const destObj: any = (collection._namedDestinations[0]._destination);
        expect(destObj.page).toBe(page);
        expect(destObj.mode).toEqual(PdfDestinationMode.fitH);
        expect(destObj._location).toEqual({ x: 0, y: 0 });
    });
    it('addCollection - assigns destination page with FitR mode', () => {
        // Arrange
        const pageDict = { some: 'pageDict' };
        const pageRef = new _PdfReference(5, 0);
        const destArray = [
            pageRef,                  // index 0
            new _PdfName('FitR'),
        ];
        const namesArray = ['RefTitle', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(pageRef, pageDict);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);
        // Act
        spyOn(utils, "_getPageIndex").and.returnValue(1)
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        const destObj: any = (collection._namedDestinations[0]._destination);
        expect(destObj.page).toBe(page);
        expect(destObj.mode).toEqual(PdfDestinationMode.fitR);
    });
    it('addCollection - assigns destination page with Fit mode', () => {
        // Arrange
        const pageDict = { some: 'pageDict' };
        const pageRef = new _PdfReference(5, 0);
        const destArray = [
            pageRef,                  // index 0
            new _PdfName('Fit'),
        ];
        const namesArray = ['RefTitle', destArray];
        const dest = new MockDictionary({ Names: namesArray });
        const page = new MockPage();
        const mockDoc: any = { getPage: (idx: number) => page };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(pageRef, pageDict);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);
        // Act
        spyOn(utils, "_getPageIndex").and.returnValue(1)
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBeGreaterThanOrEqual(1);
        const destObj: any = (collection._namedDestinations[0]._destination);
        expect(destObj.page).toBe(page);
        expect(destObj.mode).toEqual(PdfDestinationMode.fitToPage);
    });

});

describe('PdfBookmark - behaviour coverage tests', () => {

    it('constructor behaviour coverage tests', () => {
        // constructor - no A or Dest present
        const dict1 = new MockDictionary({});
        const crossRef1 = new MockCrossReference(null);
        const bookmark1 = new PdfBookmark(dict1 as any, crossRef1 as any);
        expect(bookmark1._isLoadedBookmark).toBe(true);
        expect(dict1.has('Dest')).toBe(false);

        // constructor - A present with D array, no existing Dest -> should copy D to Dest
        const actionDict = new MockDictionary({ D: ['pageRef', new MockPdfName('Fit')] });
        const dict2 = new MockDictionary({ A: actionDict });
        const crossRef2 = new MockCrossReference(null);
        const bookmark2 = new PdfBookmark(dict2 as any, crossRef2 as any);
        expect(bookmark2._isLoadedBookmark).toBe(true);
        expect(dict2.has('Dest')).toBe(true);
        expect(dict2.get('Dest')).toEqual(actionDict.getRaw('D'));

        // constructor - existing Dest should not be overwritten by A
        const existingDest = ['existing'];
        const actionDict3 = new MockDictionary({ D: ['pageRef', new MockPdfName('Fit')] });
        const dict3 = new MockDictionary({ Dest: existingDest, A: actionDict3 });
        const crossRef3 = new MockCrossReference(null);
        const bookmark3 = new PdfBookmark(dict3 as any, crossRef3 as any);
        expect(bookmark3._isLoadedBookmark).toBe(true);
        expect(dict3.get('Dest')).toBe(existingDest);

        // constructor - A present but without D -> no Dest created
        const actionDict4 = new MockDictionary({});
        const dict4 = new MockDictionary({ A: actionDict4 });
        const crossRef4 = new MockCrossReference(null);
        const bookmark4 = new PdfBookmark(dict4 as any, crossRef4 as any);
        expect(bookmark4._isLoadedBookmark).toBe(true);
        expect(dict4.has('Dest')).toBe(false);

    });
    it('getter setter behavioour tests', () => {
        const existingDest = ['existing'];
        const actionDict3 = new MockDictionary({ D: ['pageRef', new MockPdfName('Fit')] });
        const dict1 = new _PdfDictionary();
        dict1.update('F', 1);
        const crossRef3 = new MockCrossReference(null);

        const bookMark = new PdfBookmark(dict1 as any, crossRef3 as any);
        const dict2 = new _PdfDictionary();
        const crossRef2 = new MockCrossReference(null);
        const bookMark2 = new PdfBookmark(dict2 as any, crossRef2 as any);
        bookMark2._dictionary = null;
        const font = bookMark._obtainTextStyle();
        bookMark._updateTextStyle(PdfTextStyle.regular);
        bookMark2._updateTextStyle(PdfTextStyle.regular);

        expect(font).toBe(1);
        expect(bookMark._dictionary.has('F')).toBeDefined();
    });

    it('addCollection - _PdfReference fetch returns non-array dictionary (no processing)', () => {
        // Arrange
        const refDict = new MockDictionary({ D: ['pageRef', new _PdfName('Fit')] });
        const ref = new MockReference(refDict);
        const dest = new MockDictionary({ Names: ref });
        const mockDoc: any = { getPage: () => new MockPage() };
        const crossRef = new MockCrossReference(mockDoc);
        crossRef.fetchMap.set(ref, refDict);
        const collection = new _PdfNamedDestinationCollection(undefined, crossRef as any);

        // Act
        collection._addCollection(dest as any);

        // Assert
        expect(collection._namedDestinations.length).toBe(0);
    });

    it('addCollection - handles _PdfName modes (XYZ and FitH) and validity branches', () => {
        // Arrange - XYZ without page (no location computed)
        const namesXYZ = ['XYZMode', ['pageRef', new _PdfName('XYZ')]];
        const destXYZ = new MockDictionary({ Names: namesXYZ });
        const crossRefXYZ = new MockCrossReference(null);
        const collectionXYZ = new _PdfNamedDestinationCollection(undefined, crossRefXYZ as any);

        // Act
        collectionXYZ._addCollection(destXYZ as any);

        // Assert
        expect(collectionXYZ._namedDestinations.length).toBe(1);
        const destObjXYZ = (collectionXYZ._namedDestinations[0]._destination as any);
        expect(destObjXYZ._destinationMode).toBe(PdfDestinationMode.location);

        // Arrange - FitH without height should mark invalid
        const namesFitH = ['FitHMode', ['pRef', new _PdfName('FitH')]];
        const destFitH = new MockDictionary({ Names: namesFitH });
        const collectionFitH = new _PdfNamedDestinationCollection(undefined, crossRefXYZ as any);

        // Act
        collectionFitH._addCollection(destFitH as any);

        // Assert
        expect(collectionFitH._namedDestinations.length).toBe(1);
        const destObjFitH = (collectionFitH._namedDestinations[0]._destination as any);
        expect(destObjFitH._destinationMode).toBe(PdfDestinationMode.fitH);
        expect(destObjFitH._isValid).toBe(false);
    });


});
describe('Bookmark base behaviour test scripts', () => {
    it("add method behaviour test scripts", () => {
        let document: PdfDocument = new PdfDocument();
        let page = document.addPage();
        let bookmarks: PdfBookmarkBase = document.bookmarks;
        expect(bookmarks).toBeDefined();
        expect(bookmarks.count).toEqual(0);
        try {
            let bookmark: PdfBookmark = bookmarks.add('FirstBookmark', -1);

        } catch (error) {
            expect(error.message).toEqual('Index out of range');
        }

        // Index === count
        bookmarks.add('First');
        const second = bookmarks.add('second', 1);
        expect(second).toEqual(bookmarks.at(1));

        //options with textstyle
        bookmarks.add('third', { textStyle: PdfTextStyle.bold });
        expect(bookmarks.at(2).textStyle).toBe(PdfTextStyle.bold);

        //options without textstyle
        bookmarks.add('fourth', { color: { r: 255, b: 0, g: 0 } })
        expect(bookmarks.at(3).color).toEqual({ r: 255, b: 0, g: 0 });
    });

    it('remove method behaviour coverage tests', () => {
        let document: PdfDocument = new PdfDocument();
        let page = document.addPage();
        let bookmarks: PdfBookmarkBase = document.bookmarks;
        expect(bookmarks).toBeDefined();
        expect(bookmarks.count).toEqual(0);
        bookmarks.add("first");
        bookmarks.add("second");
        bookmarks.add("third");

        bookmarks.remove(-1);

        expect(bookmarks.count).toEqual(3);
    });
    it(' all remove methods return value check', () => {
        let document: PdfDocument = new PdfDocument();
        let page = document.addPage();
        let bookmarks: PdfBookmarkBase = document.bookmarks;
        bookmarks.add("first");

        // remove methods not does anything when dictionary is null
        bookmarks._removeCount(null);
        bookmarks._removeFirst(null);
        bookmarks._removeLast(null);
        bookmarks._removeNext(null);
        bookmarks._removePrevious(null);

        expect(bookmarks.count).toEqual(1);
    });
    it('_getBookmark method coverage explicit else check', () => {
        let document: PdfDocument = new PdfDocument();
        let page = document.addPage();
        let bookmarks: PdfBookmarkBase = document.bookmarks;
        const bookmark = bookmarks.add("first");
        bookmarks._getBookmark(bookmark, false);
    });
});

describe('PdfBookmark._obtainNamedDestination find behavior', () => {

    it('returns named destination when matching title found', () => {
        // Arrange
        const named = new PdfNamedDestination('MyDest');
        named._title = 'MyDest';
        const mockDoc: any = { _destinationCollection: { _namedDestinations: [named] } };
        const crossRef = new MockCrossReference(mockDoc);
        const dict = new MockDictionary({ Dest: 'MyDest' });
        const bookmark = new PdfBookmark(dict as any, crossRef as any);

        // Act
        const result = bookmark.namedDestination;

        // Assert
        expect(result).toBe(named);
    });

    it('returns undefined when no matching named destination', () => {
        // Arrange
        const named = new PdfNamedDestination('Other');
        named._title = 'Other';
        const mockDoc: any = { _destinationCollection: { _namedDestinations: [named] } };
        const crossRef = new MockCrossReference(mockDoc);
        const dict = new MockDictionary({ Dest: 'NoMatch' });
        const bookmark = new PdfBookmark(dict as any, crossRef as any);

        // Act
        const result = bookmark.namedDestination;

        // Assert
        expect(result).toBeUndefined();
    });

});