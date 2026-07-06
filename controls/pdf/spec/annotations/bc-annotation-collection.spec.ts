import { PdfDocument } from "../../src/pdf/core/pdf-document";
import { _PdfDictionary, _PdfName, _PdfReference } from '../../src/pdf/core/pdf-primitives'
import { Pdf3DAnnotation, PdfDocumentLinkAnnotation, PdfFileLinkAnnotation, PdfPopupAnnotation, PdfRectangleAnnotation, PdfSoundAnnotation, PdfSquareAnnotation, PdfTextMarkupAnnotation, PdfTextWebLinkAnnotation, PdfUriAnnotation } from "../../src/pdf/core/annotations/annotation";
import { PdfAnnotationCollection, PdfPopupAnnotationCollection } from "../../src/pdf/core/annotations/annotation-collection";
import { PdfAnnotationFlag } from "../../src/pdf/core/enumerator";
import { PdfTemplate } from "../../src/pdf/core/graphics/pdf-template";
import { PdfPage } from "../../src/pdf/core/pdf-page";
describe('PdfPopupAnnotationCollection - behaviour test scripts', () => {
    it('at methods coverage', () => {
        //Arrange
        const annot = new PdfPopupAnnotation();
        const collection = new PdfPopupAnnotationCollection(annot, true);
        // Act 
        collection.add(annot);
        const result = collection.at(0);

        //Assert
        expect(result).toEqual(annot);

        try {
            const result = collection.at(999);
            fail('Failed toThrow index out range error ')
        } catch (error) {
            expect(error.message).toEqual('Index out of range.');
        }
    });
    it('add method coverage - throw error', () => {
        //Arrange
        const annot = new PdfPopupAnnotation();
        const collection = new PdfPopupAnnotationCollection(annot, true);
        collection._annotation._dictionary.set('F', 30);
        // Act 
        try {
            collection.add(annot);
            fail('Failed toThrow Could not add comments/reviews to the review Error');
        } catch (error) {
            expect(error.message).toEqual('Could not add comments/reviews to the review');
        }
    });
    it('add - parent locked sets F=128, IRT to parent ref and marks as comment', () => {
        // Arrange
        const parent: any = new PdfPopupAnnotation();
        parent._dictionary.set('F', 0);
        parent.flags = PdfAnnotationFlag.locked;
        parent._ref = { id: 'p_locked' } as any;
        parent._page = {
            annotations: { add: jasmine.createSpy('add'), remove: jasmine.createSpy('remove') },
            _pageDictionary: { set: () => { }, _updated: false },
            _crossReference: { _cache_map: new Map() },
            _getProperty: () => [] as any
        } as any;
        const collection = new PdfPopupAnnotationCollection(parent, false);
        const child: any = new PdfPopupAnnotation();
        child._dictionary.set('F', 0);

        // Act
        collection.add(child);

        // Assert
        expect(child._dictionary.get('F')).toEqual(128);
        expect(child._dictionary.get('IRT')).toEqual(parent._ref);
        expect(child._isComment).toBeTruthy();
        expect(collection.count).toEqual(1);
    });
    it('add - review mode with existing collection sets IRT to last collection ref and marks as review', () => {
        // Arrange
        const parent: any = new PdfPopupAnnotation();
        parent._dictionary.set('F', 0);
        parent.flags = 0; // not locked
        parent._ref = { id: 'p_review' } as any;
        parent._page = {
            annotations: { add: jasmine.createSpy('add'), remove: jasmine.createSpy('remove') },
            _pageDictionary: { set: () => { }, _updated: false },
            _crossReference: { _cache_map: new Map() },
            _getProperty: () => [] as any
        } as any;
        const collection = new PdfPopupAnnotationCollection(parent, true);
        const existing: any = new PdfPopupAnnotation();
        existing._ref = { id: 'existing_ref' } as any;
        collection._collection.push(existing);
        const child: any = new PdfPopupAnnotation();
        child._dictionary.set('F', 0);

        // Act
        collection.add(child);

        // Assert
        expect(child._dictionary.get('F')).toEqual(30);
        expect(child._dictionary.get('IRT')).toEqual(existing._ref);
        expect(child._isReview).toBeTruthy();
        expect(collection._collection.indexOf(child)).toBeGreaterThan(-1);
    });
    it('add - non-review and not locked sets F=28 and IRT to parent ref', () => {
        // Arrange
        const parent: any = new PdfPopupAnnotation();
        parent._dictionary.set('F', 0);
        parent.flags = 0; // not locked
        parent._ref = { id: 'p_comment' } as any;
        parent._page = {
            annotations: { add: jasmine.createSpy('add'), remove: jasmine.createSpy('remove') },
            _pageDictionary: { set: () => { }, _updated: false },
            _crossReference: { _cache_map: new Map() },
            _getProperty: () => [] as any
        } as any;
        const collection = new PdfPopupAnnotationCollection(parent, false);
        const child: any = new PdfPopupAnnotation();
        child._dictionary.set('F', 0);

        // Act
        collection.add(child);

        // Assert
        expect(child._dictionary.get('F')).toEqual(28);
        expect(child._dictionary.get('IRT')).toEqual(parent._ref);
        expect(child._isComment).toBeTruthy();
        expect(collection.count).toEqual(1);
    });
    it('removeAt - review mode updates next IRT and calls page.remove', () => {
        // Arrange
        const parent: any = new PdfPopupAnnotation();
        const collection = new PdfPopupAnnotationCollection(parent, true);
        const prevRef: any = { id: 'prev_ref' } as any;
        const a1: any = new PdfPopupAnnotation();
        a1._dictionary = { _get: (key: string) => key === 'IRT' ? prevRef : undefined } as any;
        a1._ref = { id: 'a1' } as any;
        const a2: any = new PdfPopupAnnotation();
        a2._dictionary = { set: jasmine.createSpy('set'), _updated: false } as any;
        a2._ref = { id: 'a2' } as any;
        collection._collection.push(a1);
        collection._collection.push(a2);
        collection._page = { annotations: { remove: jasmine.createSpy('remove') } } as any;

        // Act
        collection.removeAt(0);

        // Assert
        expect(a2._dictionary.set).toHaveBeenCalledWith('IRT', prevRef);
        expect(a2._dictionary._updated).toBeTruthy();
        expect(collection._collection.indexOf(a1)).toEqual(-1);
        expect(collection._page.annotations.remove).toHaveBeenCalledWith(a1);
    });

    it('removeAt - non-review last element removes without IRT update', () => {
        // Arrange
        const parent: any = new PdfPopupAnnotation();
        const collection = new PdfPopupAnnotationCollection(parent, false);
        const a1: any = new PdfPopupAnnotation();
        a1._dictionary = {} as any;
        a1._ref = { id: 'only' } as any;
        collection._collection.push(a1);
        collection._page = { annotations: { remove: jasmine.createSpy('remove') } } as any;

        // Act
        collection.removeAt(0);

        // Assert
        expect(collection._collection.length).toEqual(0);
        expect(collection._page.annotations.remove).toHaveBeenCalledWith(a1);
    });

    it('removeAt - throws error when index out of range', () => {
        // Arrange
        const parent: any = new PdfPopupAnnotation();
        const collection = new PdfPopupAnnotationCollection(parent, false);

        // Act & Assert
        try {
            collection.removeAt(0);
            fail('Expected to throw index out of range error');
        } catch (error) {
            expect(error.message).toEqual('Index out of range.');
        }
    });

    it('remove - valid annotation and invalid annotaion', () => {
        const parent: any = new PdfPopupAnnotation();
        const collection = new PdfPopupAnnotationCollection(parent, false);
        const child1 = new PdfPopupAnnotation({ author: 'child' });
        child1._dictionary = {} as any;
        child1._ref = { id: 'only' } as any;
        collection._page = { annotations: { remove: jasmine.createSpy('remove') } } as any;
        collection._collection.push(child1);
        const annot = new PdfPopupAnnotation();
        expect(collection.count).toBe(1);

        // remove invalid annot
        collection.remove(annot)
        expect(collection.count).toBe(1);
        //remove valid annot}
        collection.remove(child1)
        expect(collection.count).toBe(0);
        expect(collection._page.annotations.remove).toHaveBeenCalledWith(child1);
    });

    it('_parseReview - explicit else', () => {
        const parent: any = new PdfPopupAnnotation();
        const collection = new PdfPopupAnnotationCollection(parent, false);
        const child1 = new PdfPopupAnnotation();
        collection._page = null;

        collection._parseReview();

        expect(collection.count).toEqual(0);
    });
    it('_parseComments - explicit else', () => {
        const parent: any = new PdfPopupAnnotation();
        const collection = new PdfPopupAnnotationCollection(parent, false);
        const child1 = new PdfPopupAnnotation();
        collection._page = null;

        collection._parseComments();

        expect(collection.count).toEqual(0);
    });
});

describe("PdfAnnotationCollection - behaviour test scripts", () => {
    it('constructor behaviour test scripts', () => {
        const collection = new PdfAnnotationCollection(null, null, null);

        expect(collection._annotations).toEqual([]);
    });
    it('at methods coverage', () => {
        //Arrange
        const annot = new PdfPopupAnnotation();
        const document = new PdfDocument();
        const page = document.addPage();
        const collection = new PdfAnnotationCollection([], document._crossReference, page);
        // Act 
        collection.add(annot);
        const result = collection.at(0);

        //Assert
        expect(result).toEqual(annot);

        try {
            const result = collection.at(999);
            fail('Failed toThrow index out range error ')
        } catch (error) {
            expect(error.message).toEqual('Index out of range.');
        }
    });
    it('at - parsed annotations behaviour check', () => {
        const annot = new PdfPopupAnnotation();
        const document = new PdfDocument();
        const annotDict: any = annot._dictionary;
        const page = document.addPage();
        const collection = new PdfAnnotationCollection([], document._crossReference, page);
        collection._annotations = [annotDict];
        // Act 
        const result = collection.at(0);
    });

    it('add - method coverage improvement', () => {
        const annot = new PdfPopupAnnotation();
        const document = new PdfDocument();
        const page = document.addPage();
        const collection = new PdfAnnotationCollection([], document._crossReference, page);
        // null annotation
        try {
            collection.add(null);
        } catch (error) {
            expect(error.message).toEqual("annotation cannot be null or undefined");
        }

        //loaded annotation
        annot._isLoaded = true;
        try {
            collection.add(annot);
        } catch (error) {
            expect(error.message).toEqual("cannot add an existing annotation");
        }

        // reference check
        annot._isLoaded = false;
        annot._ref = new _PdfReference(4, 0);
        annot._ref._isNew = true;
        const template = new PdfTemplate();
        annot._customTemplate.set('temp', template);
        const update = spyOn(template, '_updatePendingResource').and.returnValue({});
        collection.add(annot);

        expect(update).toHaveBeenCalled();
        expect(collection.count).toEqual(1);
    });
    it('remove at index out range error', () => {
        const annot = new PdfPopupAnnotation();
        const document = new PdfDocument();
        const page = document.addPage();
        const collection = new PdfAnnotationCollection([], document._crossReference, page);
        try {
            collection.removeAt(-1);
        } catch (error) {
            expect(error.message).toEqual('Index out of range.');
        }
    });

    describe('PdfAnnotationCollection._parseAnnotation – clean subtype coverage', () => {

        let document: PdfDocument;
        let page: PdfPage;
        let collection: PdfAnnotationCollection;

        beforeEach(() => {
            document = new PdfDocument();
            page = document.addPage();
            collection = new PdfAnnotationCollection([], document._crossReference, page);
        });
        it('handles Square subtype dictionary', () => {
            const square = new PdfSquareAnnotation();
            square.bounds = { x: 10, y: 10, width: 100, height: 100 };

            square._dictionary.set('Subtype', new _PdfName('Square'));

            const result = collection._parseAnnotation(square._dictionary, 0);

            expect(result).toBeDefined();
            expect(result instanceof PdfRectangleAnnotation).toBeTruthy();
        });
        it('handles Popup subtype without parent', () => {
            const popup = new PdfPopupAnnotation();
            popup._dictionary.set('Subtype', new _PdfName('Popup'));

            const result = collection._parseAnnotation(popup._dictionary, 0);

            expect(result).toBeDefined();
            expect(result instanceof PdfPopupAnnotation).toBeTruthy();
        });
        it('handles 3D subtype', () => {
            const threeD = new _PdfDictionary();
            threeD.set('Subtype', new _PdfName('3D'));

            const result = collection._parseAnnotation(threeD, 0);

            expect(result).toBeDefined();
            expect(result instanceof Pdf3DAnnotation).toBeTruthy();
        });
        it('returns undefined for Sound subtype', () => {
            const sound = new _PdfDictionary();
            sound.set('Subtype', new _PdfName('Sound'));

            const result = collection._parseAnnotation(sound, 0);

            expect(result instanceof PdfSoundAnnotation).toBeTruthy();
        });
        it('handles Caret subtype', () => {
            const caret = new PdfTextMarkupAnnotation();
            caret._dictionary.set('Subtype', new _PdfName('Caret'));

            const result = collection._parseAnnotation(caret._dictionary, 0);

            expect(result).toBeDefined();
            expect(result instanceof PdfTextMarkupAnnotation).toBeTruthy();
        });

        it('returns undefined for unknown subtype', () => {
            const dict = new _PdfDictionary();
            dict.set('Subtype', new _PdfName('UnknownSubtype'));

            const result = collection._parseAnnotation(dict, 0);

            expect(result).toBeUndefined();
        });
        it('handles Link subtype with all action types (URI, launch)', () => {

            const testCases: Array<{
                actionType: string;
                expectedClass: any;
            }> = [
                    { actionType: 'URI', expectedClass: PdfUriAnnotation },
                    { actionType: 'Launch', expectedClass: PdfFileLinkAnnotation },
                ];

            testCases.forEach(test => {

                const dict = new _PdfDictionary();
                dict.set('Subtype', new _PdfName('Link'));

                // Create Action dictionary
                const action = new _PdfDictionary();
                action.set('S', new _PdfName(test.actionType));

                // Required by parser: dictionary.has('A')
                dict.set('A', action);

                // Needed for URI path to resolve as TextWebLink
                dict.set('Border', [0, 0, 1]);

                const result = collection._parseAnnotation(dict, 0);

                expect(result).toBeDefined();
                expect(result instanceof test.expectedClass).toBeTruthy();
            });
        });
        it('handles Link subtype with all action types (GoTO, GoToR)', () => {

            const testCases: Array<{
                actionType: string;
                expectedClass: any;
            }> = [
                    { actionType: 'GoToR', expectedClass: PdfFileLinkAnnotation },
                    { actionType: 'GoTo', expectedClass: PdfDocumentLinkAnnotation }

                ];

            testCases.forEach(test => {

                const dict = new _PdfDictionary();
                dict.set('Subtype', new _PdfName('Link'));

                // Create Action dictionary
                const action = new _PdfDictionary();
                action.set('S', new _PdfName(test.actionType));
                action.set('F', 'sample.pdf');
                // Required by parser: dictionary.has('A')
                dict.set('A', action);

                // Needed for URI path to resolve as TextWebLink
                dict.set('Border', [0, 0, 1]);

                const result = collection._parseAnnotation(dict, 0);

                expect(result).toBeDefined();
                expect(result instanceof test.expectedClass).toBeTruthy();
            });
        });
    });

    describe('PdfAnnotationCollection._reArrange - full branch coverage', () => {

        let document: PdfDocument;
        let page: PdfPage;
        let collection: any;
        let ref1: any;
        let ref2: any;

        beforeEach(() => {
            document = new PdfDocument();
            page = document.addPage();
            collection = new PdfAnnotationCollection([], document._crossReference, page);

            ref1 = {};
            ref2 = {};

            collection._annotations = [ref1, ref2];

            spyOn(collection._crossReference, '_fetch');
        });
        it('returns undefined when annotations is undefined', () => {
            collection._annotations = undefined as any;

            const result = collection._reArrange(ref1, 0, 0);

            expect(result).toBeUndefined();
        });

        it('resets tabIndex to 0 when tabIndex exceeds length', () => {
            const dict = new _PdfDictionary();
            dict.set('Parent', ref1);

            (collection._crossReference._fetch as jasmine.Spy)
                .and.returnValue(dict);

            const result = collection._reArrange(ref1, 5, 0);

            expect(result[0]).toBe(ref1);
        });

        it('resolves index using indexOf when index exceeds length', () => {
            const dict = new _PdfDictionary();
            dict.set('Parent', ref1);

            (collection._crossReference._fetch as jasmine.Spy)
                .and.returnValue(dict);

            const result = collection._reArrange(ref1, 1, 10);

            expect(result[1]).toBe(ref1);
        });

        it('does not rearrange when fetched dictionary is undefined', () => {
            (collection._crossReference._fetch as jasmine.Spy)
                .and.returnValue(undefined);

            const result = collection._reArrange(ref1, 1, 0);

            expect(result).toEqual([ref1, ref2]);
        });

        it('does not rearrange when dictionary has no Parent', () => {
            const dict = new _PdfDictionary();

            (collection._crossReference._fetch as jasmine.Spy)
                .and.returnValue(dict);

            const result = collection._reArrange(ref1, 1, 0);

            expect(result).toEqual([ref1, ref2]);
        });
        it('swaps annotations when parentReference equals ref', () => {
            const dict = new _PdfDictionary();
            dict.set('Parent', ref1);

            (collection._crossReference._fetch as jasmine.Spy)
                .and.returnValue(dict);

            const result = collection._reArrange(ref1, 1, 0);

            expect(result[0]).toBe(ref2);
            expect(result[1]).toBe(ref1);
        });

        it('swaps annotations when ref equals annotations[index]', () => {
            const dict = new _PdfDictionary();
            dict.set('Parent', {}); // different object

            (collection._crossReference._fetch as jasmine.Spy)
                .and.returnValue(dict);

            const result = collection._reArrange(ref1, 1, 0);

            expect(result[0]).toBe(ref2);
            expect(result[1]).toBe(ref1);
        });
        it('does not swap when parentReference does not match ref', () => {
            const otherRef = {};
            const dict = new _PdfDictionary();
            dict.set('Parent', otherRef);

            (collection._crossReference._fetch as jasmine.Spy)
                .and.returnValue(dict);

            const result = collection._reArrange(ref1, 1, 0);

            expect(result).toEqual([ref1, ref2]);
        });
    });

});