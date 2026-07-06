import { _ContentParser, _PdfDictionary, PdfDocument, PdfPage, PdfRotationAngle } from "@syncfusion/ej2-pdf";
import { PdfDataExtractor } from "../../src/pdf-data-extract/core/pdf-data-extractor";
import { PdfStructureElement } from "../../src/pdf-data-extract/core/pdf-structure-element";
import { PdfTagType } from "../../src/pdf-data-extract/core/text-extraction/enumerator";
import { _MatrixHelper } from "../../src/pdf-data-extract/core/text-extraction/matrix-helper";

describe('PdfDataExtractor reachable highlighted branches', () => {
    function createDictionary(seed?: { [key: string]: unknown }): _PdfDictionary {
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: _PdfDictionary = Object.create((_PdfDictionary as any).prototype) as _PdfDictionary; // eslint-disable-line

        (dict as unknown as {
            has: (key: string) => boolean;
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            set: (key: string, value: unknown) => void;
        }).has = (key: string): boolean => raw.has(key);

        (dict as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => raw.get(key);
        (dict as unknown as { getArray: (key: string) => unknown }).getArray = (key: string): unknown => raw.get(key);
        (dict as unknown as { set: (key: string, value: unknown) => void }).set = (key: string, value: unknown): void => {
            raw.set(key, value);
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function createDocument(): PdfDocument {
        return ({
            _crossReference: {},
            _catalog: {
                _catalogDictionary: createDictionary()
            }
        } as unknown) as PdfDocument;
    }

    it('should cover newline append and hasTm reset branch in _getFigureBounds cm handling', () => {
        // Arrange
        const extractor: PdfDataExtractor = new PdfDataExtractor(createDocument());
        const page: PdfPage = ({
            _combineContent: (): Uint8Array => new Uint8Array([1, 2, 3]),
            size: { width: 200, height: 300 },
            rotation: PdfRotationAngle.angle0
        } as unknown) as PdfPage;

        const structElement: PdfStructureElement = ({
            _contentId: [1],
            _parseContent: jasmine.createSpy('_parseContent').and.returnValue(1)
        } as unknown) as PdfStructureElement;

        extractor._resultantText = '';
        extractor._objects = [new _MatrixHelper(1, 0, 0, 1, 0, 0)];
        extractor._ctm = extractor._objects[0];

        // Force _hasTm to stay truthy even though _getFigureBounds assigns false at the start.
        Object.defineProperty(extractor, '_hasTm', {
            configurable: true,
            enumerable: true,
            get: (): boolean => true,
            set: (): void => {
                // Intentionally ignore writes from _getFigureBounds
            }
        });

        const readContentSpy: jasmine.Spy = spyOn(_ContentParser.prototype as any, '_readContent').and.returnValue([ // eslint-disable-line
            {
                _operator: 'cm',
                _operands: ['1', '0', '0', '1', '0', '20']
            }
        ]);

        try {
            // Act
            extractor._getFigureBounds(structElement, page);

            // Assert
            expect(readContentSpy).toHaveBeenCalled();
            expect(extractor._resultantText).toBe('\r\n');
        } finally {
            readContentSpy.and.callThrough();

            // Cleanup: restore a normal writable property so other tests are unaffected.
            delete (extractor as unknown as { _hasTm?: boolean })._hasTm;
            extractor._hasTm = false;
        }
    });
    ``

    it('should cover numeric child branch in _getStructureElement and push contentId into parent', () => {
        // Arrange
        const extractor: PdfDataExtractor = new PdfDataExtractor(createDocument());

        const structureDictionary: _PdfDictionary = createDictionary({
            K: [5]
        });

        const parent: PdfStructureElement = ({
            _contentId: [],
            _childElements: []
        } as unknown) as PdfStructureElement;

        // Act
        const result: PdfStructureElement = extractor._getStructureElement(structureDictionary, parent);

        // Assert
        expect(result).toBeNull();
        expect(parent._contentId).toEqual([5]);
    });

    it('should cover tempElement insertion into _elementCollection and _orderSet in _getStructureElement', () => {
        // Arrange
        const extractor: PdfDataExtractor = new PdfDataExtractor(createDocument());

        const grandChildDictionary: _PdfDictionary = createDictionary();
        const childDictionary: _PdfDictionary = createDictionary({
            K: grandChildDictionary
        });
        const rootDictionary: _PdfDictionary = createDictionary({
            K: childDictionary
        });

        const loadSpy: jasmine.Spy = spyOn(PdfStructureElement as any, '_load').and.callFake(( // eslint-disable-line
            _document: PdfDocument,
            _dictionary: _PdfDictionary,
            order: number,
            parent?: PdfStructureElement
        ): PdfStructureElement => {
            return ({
                _order: order,
                _childElements: [],
                _contentId: [],
                _pageDictionary: null,
                parent: parent || null,
                tagType: PdfTagType.none,
                _tagType: PdfTagType.none,
                _getTagType: jasmine.createSpy('_getTagType').and.returnValue(PdfTagType.none)
            } as unknown) as PdfStructureElement;
        });

        try {
            // Act
            const result: PdfStructureElement = extractor._getStructureElement(rootDictionary);

            // Assert
            expect(loadSpy).toHaveBeenCalled();
            expect(result).toBeTruthy();
            expect(extractor._elementCollection.length).toBeGreaterThan(1);
            expect(extractor._orderSet.size).toBeGreaterThan(1);
        } finally {
            loadSpy.and.callThrough();
        }
    });
});
describe('PdfDataExtractor _getStructureElement exact highlighted 2 lines', () => {
    function createDictionary(seed?: { [key: string]: unknown }): _PdfDictionary {
        const raw: Map<string, unknown> = new Map<string, unknown>();

        const dict: _PdfDictionary = Object.create((_PdfDictionary as any).prototype) as _PdfDictionary; // eslint-disable-line

        (dict as unknown as {
            has: (key: string) => boolean;
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            set: (key: string, value: unknown) => void;
        }).has = (key: string): boolean => raw.has(key);

        (dict as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => raw.get(key);
        (dict as unknown as { getArray: (key: string) => unknown }).getArray = (key: string): unknown => raw.get(key);
        (dict as unknown as { set: (key: string, value: unknown) => void }).set = (key: string, value: unknown): void => {
            raw.set(key, value);
        };

        if (seed) {
            Object.keys(seed).forEach((key: string) => {
                raw.set(key, seed[key]);
            });
        }

        return dict;
    }

    function createDocument(): PdfDocument {
        return ({
            _crossReference: {},
            _catalog: {
                _catalogDictionary: createDictionary()
            }
        } as unknown) as PdfDocument;
    }

    it('should cover _elementCollection.push(tempElement) and _orderSet.add(tempElement._order) in dictionary K branch', () => {
        // Arrange
        const extractor: PdfDataExtractor = new PdfDataExtractor(createDocument());

        // Root dictionary has K = child dictionary
        // Child dictionary only needs has('K') === true so outer branch calls recursive _getStructureElement(...)
        const childDictionary: _PdfDictionary = createDictionary({
            K: createDictionary({})
        });

        const rootDictionary: _PdfDictionary = createDictionary({
            K: childDictionary
        });

        const loadedRootElement: PdfStructureElement = ({
            _order: 0,
            _childElements: [],
            _contentId: [],
            _pageDictionary: null,
            parent: null,
            tagType: PdfTagType.none,
            _tagType: PdfTagType.none,
            _getTagType: jasmine.createSpy('_getTagType').and.returnValue(PdfTagType.none)
        } as unknown) as PdfStructureElement;

        const tempElement: PdfStructureElement = ({
            _order: 99,
            _childElements: [],
            _contentId: [],
            _pageDictionary: null,
            parent: loadedRootElement,
            tagType: PdfTagType.none,
            _tagType: PdfTagType.none,
            _getTagType: jasmine.createSpy('_getTagType').and.returnValue(PdfTagType.none)
        } as unknown) as PdfStructureElement;

        const loadSpy: jasmine.Spy = spyOn(PdfStructureElement as any, '_load').and.returnValue(loadedRootElement); // eslint-disable-line

        const originalGetStructureElement: (dictionary: _PdfDictionary, parent?: PdfStructureElement) => PdfStructureElement =
            extractor._getStructureElement.bind(extractor);

        let firstCall: boolean = true;

        const getStructureElementSpy: jasmine.Spy = spyOn(extractor, '_getStructureElement').and.callFake( // eslint-disable-line
            (dictionary: _PdfDictionary, parent?: PdfStructureElement): PdfStructureElement => {
                if (firstCall) {
                    firstCall = false;
                    return originalGetStructureElement(dictionary, parent);
                }

                // Intercept only the recursive call and return a tempElement
                // that is NOT yet in _orderSet, so the highlighted lines execute.
                return tempElement;
            }
        );

        // Act
        const result: PdfStructureElement = extractor._getStructureElement(rootDictionary);
        // Assert
        expect(loadSpy).toHaveBeenCalled();
        expect(getStructureElementSpy).toHaveBeenCalledTimes(2);
        expect(result).toBe(loadedRootElement);
        expect(loadedRootElement._childElements.indexOf(tempElement)).toBeGreaterThan(-1);
        expect(extractor._elementCollection.indexOf(tempElement)).toBeGreaterThan(-1);
        expect(extractor._orderSet.has(tempElement._order)).toBe(true);
    });
});

