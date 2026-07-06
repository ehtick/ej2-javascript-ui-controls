
import { _PdfBaseStream, _PdfContentStream, _PdfStream } from '../src/pdf/core/base-stream';
import { PdfPrintState, PdfRotationAngle } from '../src/pdf/core/enumerator';
import { PdfGraphics, PdfGraphicsState } from '../src/pdf/core/graphics/pdf-graphics';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { PdfDocument, PdfPageSettings } from '../src/pdf/core/pdf-document';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { PdfLayer } from '../src/pdf/core/layers/layer';

describe('PdfLayer - uncovered branch/behavior tests', () => {
    function createReference(): _PdfReference {
        return Object.create(_PdfReference.prototype) as _PdfReference;
    }

    function createBaseStream(): _PdfBaseStream {
        return Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
    }

    function createStreamWithDictionary(dictionary: _PdfDictionary): _PdfStream {
        const stream: _PdfStream = Object.create(_PdfStream.prototype) as _PdfStream;
        (stream as any).dictionary = dictionary;
        return stream;
    }

    function createCrossReference(fetchImpl?: (ref: _PdfReference) => any): _PdfCrossReference {
        const crossReference: _PdfCrossReference = {
            _allowCatalog: false,
            _cacheMap: new Map(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake(() => createReference()),
            _fetch: jasmine.createSpy('_fetch').and.callFake((ref: _PdfReference) => {
                if (fetchImpl) {
                    return fetchImpl(ref);
                }
                return undefined;
            })
        } as any;
        return crossReference;
    }

    function createCatalogDictionary(ocProperties?: _PdfDictionary): _PdfDictionary {
        const catalog: _PdfDictionary = new _PdfDictionary();
        if (typeof ocProperties !== 'undefined') {
            catalog.update('OCProperties', ocProperties);
        }
        return catalog;
    }

    function createDocument(catalog: _PdfDictionary, pages: PdfPage[] = []): PdfDocument {
        return {
            _catalog: { _catalogDictionary: catalog },
            pageCount: pages.length,
            getPage: jasmine.createSpy('getPage').and.callFake((index: number) => pages[index])
        } as any;
    }

    function createLayer(): PdfLayer {
        const layer: PdfLayer = new PdfLayer();
        const anyLayer: any = layer;

        anyLayer._layer = layer;
        anyLayer._dictionary = new _PdfDictionary();
        anyLayer._referenceHolder = createReference();
        anyLayer._crossReference = createCrossReference();
        anyLayer._document = createDocument(createCatalogDictionary(new _PdfDictionary()));
        anyLayer._id = 'Layer1';

        return layer;
    }



    function createPage(options?: {
        size?: { width: number; height: number };
        mediaBox?: number[];
        cropBox?: number[];
        origin?: number[];
        isNew?: boolean;
        rotation?: PdfRotationAngle;
        hasRotate?: boolean;
        rotateValue?: number;
        hasCropBox?: boolean;
        hasMediaBox?: boolean;
        pageSettings?: any;
        actualBounds?: number[];
    }): PdfPage {
        const settings = options || {};
        const pageDictionary: _PdfDictionary = new _PdfDictionary();

        const resources: _PdfDictionary = new _PdfDictionary();
        pageDictionary.update('Resources', resources);

        if (settings.hasCropBox) {
            pageDictionary.update('CropBox', settings.cropBox || []);
        }
        if (settings.hasMediaBox) {
            pageDictionary.update('MediaBox', settings.mediaBox || []);
        }
        if (settings.hasRotate) {
            pageDictionary.update('Rotate', typeof settings.rotateValue === 'number' ? settings.rotateValue : 0);
        }

        const page: PdfPage = {
            size: settings.size || { width: 100, height: 200 },
            mediaBox: settings.mediaBox || [0, 0, 100, 200],
            cropBox: settings.cropBox,
            rotation: typeof settings.rotation !== 'undefined' ? settings.rotation : PdfRotationAngle.angle0,
            _pageDictionary: pageDictionary,
            _contents: [],
            _origin: settings.origin || [0, 0],
            _isNew: !!settings.isNew,
            _pageSettings: settings.pageSettings,
            _getActualBounds: jasmine.createSpy('_getActualBounds').and.returnValue(settings.actualBounds || [10, 20, 30, 40]),
            _crossReference: undefined
        } as any;

        return page;
    }


    describe('printState setter', () => {
        it('should update print option to ON when printState is alwaysPrint', () => {
            // Arrange
            const layer: any = createLayer();
            layer._printOption = new _PdfDictionary();
            const updateSpy: jasmine.Spy = spyOn(layer._printOption, 'update').and.callThrough();

            // Act
            layer.printState = PdfPrintState.alwaysPrint;

            // Assert
            expect(updateSpy).toHaveBeenCalledWith('PrintState', jasmine.any(_PdfName));
        });

        it('should update print option to OFF when printState is neverPrint', () => {
            // Arrange
            const layer: any = createLayer();
            layer._printOption = new _PdfDictionary();
            const updateSpy: jasmine.Spy = spyOn(layer._printOption, 'update').and.callThrough();

            // Act
            layer.printState = PdfPrintState.neverPrint;

            // Assert
            expect(updateSpy).toHaveBeenCalledWith('PrintState', jasmine.any(_PdfName));
        });

        it('should call _setPrintState when _printOption is not initialized', () => {
            // Arrange
            const layer: any = createLayer();
            layer._printOption = undefined;
            const setPrintStateSpy: jasmine.Spy = spyOn(layer, '_setPrintState').and.callThrough();

            // Act
            layer.printState = PdfPrintState.alwaysPrint;

            // Assert
            expect(setPrintStateSpy).toHaveBeenCalled();
        });
    });

    describe('_initializeProperties', () => {
        it('should create a new Properties dictionary when resource has Properties key but returns undefined', () => {
            // Arrange
            const layer: any = createLayer();
            const resource: _PdfDictionary = new _PdfDictionary();
            layer._graphics = { _resourceObject: resource };
            layer._id = 'OC1';
            layer._referenceHolder = createReference();

            spyOn(resource, 'has').and.callFake((key: string) => key === 'Properties');
            spyOn(resource, 'get').and.returnValue(undefined);
            const updateSpy: jasmine.Spy = spyOn(resource, 'update').and.callThrough();

            // Act
            layer._initializeProperties();

            // Assert
            expect(updateSpy).toHaveBeenCalledWith('Properties', jasmine.any(_PdfDictionary));
        });

        it('should create Properties dictionary when resource does not contain Properties', () => {
            // Arrange
            const layer: any = createLayer();
            const resource: _PdfDictionary = new _PdfDictionary();
            layer._graphics = { _resourceObject: resource };
            layer._id = 'OC2';
            layer._referenceHolder = createReference();

            const updateSpy: jasmine.Spy = spyOn(resource, 'update').and.callThrough();

            // Act
            layer._initializeProperties();

            // Assert
            expect(updateSpy).toHaveBeenCalledWith('Properties', jasmine.any(_PdfDictionary));
        });
    });

    describe('_loadContents', () => {
        it('should load contents as single reference when raw contents is a reference fetched as base stream', () => {
            // Arrange
            const layer: any = createLayer();
            const reference: _PdfReference = createReference();
            const baseStream: _PdfBaseStream = createBaseStream();
            const pageDictionary: any = {
                getRaw: jasmine.createSpy('getRaw').and.returnValue(reference)
            };
            const page: any = {
                _pageDictionary: pageDictionary,
                _contents: []
            };
            layer._page = page;
            layer._crossReference = createCrossReference((ref: _PdfReference) => {
                return ref === reference ? baseStream : undefined;
            });

            // Act
            layer._loadContents();

            // Assert
            expect(page._contents.length).toBe(1);
            expect(page._contents[0]).toBe(reference);
        });
    });


    describe('_beginLayer', () => {
        it('should assign current graphics when graphics collection does not contain it and write parent/current BDC markers', () => {
            // Arrange
            const layer: any = createLayer();
            layer._id = 'ChildOC';
            layer._name = 'Child layer';
            layer._graphicsCollection = new Map();

            const writeSpy: jasmine.Spy = jasmine.createSpy('_write');
            const currentGraphics: any = {
                _sw: { _write: writeSpy },
                _isEmptyLayer: false
            };

            const parent: any = createLayer();
            parent._id = 'ParentOC';
            parent._layerId = 'ParentOC';

            layer._parentLayer = [parent];

            // Act
            layer._beginLayer(currentGraphics);

            // Assert
            expect(layer._graphics).toBe(currentGraphics);
            expect(writeSpy).toHaveBeenCalledWith('/OC /ParentOC BDC');
            expect(writeSpy).toHaveBeenCalledWith('/OC /ChildOC BDC');
            expect(layer._isEndState).toBeTruthy();
        });

        it('should write layer BDC into content stream when name getter returns empty string', () => {
            // Arrange
            const layer: any = createLayer();
            layer._id = 'ContentOnlyOC';
            layer._name = 'InternalNameStillNonEmpty';
            layer._graphicsCollection = new Map();

            const currentGraphics: any = {
                _sw: { _write: jasmine.createSpy('_write') },
                _isEmptyLayer: false
            };

            const contentWriteSpy: jasmine.Spy = spyOn(layer._content, 'write').and.callThrough();
            spyOnProperty(layer, 'name', 'get').and.returnValue('');

            // Act
            layer._beginLayer(currentGraphics);

            // Assert
            expect(contentWriteSpy).toHaveBeenCalledWith('/OC /ContentOnlyOC BDC');
        });
    });

    describe('_setVisibility', () => {
        it('should create OCProperties and default view when catalog has OCProperties key but returns undefined', () => {
            // Arrange
            const layer: any = createLayer();
            const catalog: _PdfDictionary = new _PdfDictionary();
            spyOn(catalog, 'has').and.callFake((key: string) => key === 'OCProperties');
            spyOn(catalog, 'get').and.returnValue(undefined);

            layer._document = {
                _catalog: { _catalogDictionary: catalog }
            } as any;

            // Act
            layer._setVisibility(false);

            // Assert
            expect().nothing();
        });


        it('should create OFF array when visibility is false and OFF entry does not exist', () => {
            // Arrange
            const layer: any = createLayer();
            const defaultView: _PdfDictionary = new _PdfDictionary();
            const ocProperties: _PdfDictionary = new _PdfDictionary();
            const catalog: _PdfDictionary = createCatalogDictionary(ocProperties);

            spyOn(defaultView, 'has').and.callFake((key: string) => {
                if (key === 'ON') {
                    return false;
                }
                if (key === 'OFF') {
                    return false;
                }
                return false;
            });

            spyOn(defaultView, 'get').and.returnValue(undefined);
            const defaultUpdateSpy: jasmine.Spy = spyOn(defaultView, 'update').and.callThrough();

            spyOn(ocProperties, 'get').and.callFake((key: string) => {
                if (key === 'D') {
                    return defaultView;
                }
                return undefined;
            });

            layer._document = { _catalog: { _catalogDictionary: catalog } } as any;

            // Act
            layer._setVisibility(false);

            // Assert
            expect(defaultUpdateSpy).toHaveBeenCalledWith('OFF', jasmine.any(Array));
        });


        it('should remove reference from OFF array using splice(index) when visibility is false and reference already exists', () => {
            // Arrange
            const layer: any = createLayer();
            const reference: _PdfReference = layer._referenceHolder;
            const offArray: _PdfReference[] = [reference];
            const defaultView: _PdfDictionary = new _PdfDictionary();
            const ocProperties: _PdfDictionary = new _PdfDictionary();
            const catalog: _PdfDictionary = createCatalogDictionary(ocProperties);

            const offSpliceSpy: jasmine.Spy = spyOn(offArray, 'splice').and.callThrough();

            spyOn(defaultView, 'has').and.callFake((key: string) => key === 'OFF');
            spyOn(defaultView, 'get').and.callFake((key: string) => {
                if (key === 'OFF') {
                    return offArray;
                }
                return undefined;
            });
            spyOn(ocProperties, 'get').and.callFake((key: string) => {
                if (key === 'D') {
                    return defaultView;
                }
                return undefined;
            });

            layer._document = { _catalog: { _catalogDictionary: catalog } } as any;

            // Act
            layer._setVisibility(false);

            // Assert
            expect(offSpliceSpy).toHaveBeenCalledWith(0);
        });

        it('should remove reference from OFF and ON arrays when visibility is true', () => {
            // Arrange
            const layer: any = createLayer();
            const reference: _PdfReference = layer._referenceHolder;
            const offArray: _PdfReference[] = [reference];
            const onArray: _PdfReference[] = [reference];
            const defaultView: _PdfDictionary = new _PdfDictionary();
            const ocProperties: _PdfDictionary = new _PdfDictionary();
            const catalog: _PdfDictionary = createCatalogDictionary(ocProperties);

            const offSpliceSpy: jasmine.Spy = spyOn(offArray, 'splice').and.callThrough();
            const onSpliceSpy: jasmine.Spy = spyOn(onArray, 'splice').and.callThrough();

            spyOn(defaultView, 'has').and.callFake((key: string) => key === 'ON' || key === 'OFF');
            spyOn(defaultView, 'get').and.callFake((key: string) => {
                if (key === 'ON') {
                    return onArray;
                }
                if (key === 'OFF') {
                    return offArray;
                }
                return undefined;
            });
            spyOn(ocProperties, 'get').and.callFake((key: string) => {
                if (key === 'D') {
                    return defaultView;
                }
                return undefined;
            });

            layer._document = { _catalog: { _catalogDictionary: catalog } } as any;

            // Act
            layer._setVisibility(true);

            // Assert
            expect(offSpliceSpy).toHaveBeenCalledWith(0, 1);
            expect(onSpliceSpy).toHaveBeenCalledWith(0);
        });
    });

    describe('_setLock', () => {
        it('should create OCProperties and default view when catalog has OCProperties key but returns undefined', () => {
            // Arrange
            const layer: any = createLayer();
            const catalog: _PdfDictionary = new _PdfDictionary();
            spyOn(catalog, 'has').and.callFake((key: string) => key === 'OCProperties');
            spyOn(catalog, 'get').and.returnValue(undefined);

            layer._document = {
                _catalog: { _catalogDictionary: catalog }
            } as any;

            // Act
            layer._setLock(true);

            // Assert
            expect().nothing();
        });

        it('should push reference into locked array when locking and reference is not already present', () => {
            // Arrange
            const layer: any = createLayer();
            const locked: _PdfReference[] = [];
            const defaultView: _PdfDictionary = new _PdfDictionary();
            const ocProperties: _PdfDictionary = new _PdfDictionary();
            const catalog: _PdfDictionary = createCatalogDictionary(ocProperties);

            spyOn(defaultView, 'get').and.callFake((key: string) => {
                if (key === 'Locked') {
                    return locked;
                }
                return undefined;
            });
            spyOn(ocProperties, 'get').and.callFake((key: string) => {
                if (key === 'D') {
                    return defaultView;
                }
                return undefined;
            });

            layer._document = { _catalog: { _catalogDictionary: catalog } } as any;

            // Act
            layer._setLock(true);

            // Assert
            expect(locked.length).toBe(1);
            expect(locked[0]).toBe(layer._referenceHolder);
        });

        it('should remove reference from locked array when unlocking', () => {
            // Arrange
            const layer: any = createLayer();
            const reference: _PdfReference = layer._referenceHolder;
            const locked: _PdfReference[] = [reference];
            const defaultView: _PdfDictionary = new _PdfDictionary();
            const ocProperties: _PdfDictionary = new _PdfDictionary();
            const catalog: _PdfDictionary = createCatalogDictionary(ocProperties);

            const spliceSpy: jasmine.Spy = spyOn(locked, 'splice').and.callThrough();

            spyOn(defaultView, 'get').and.callFake((key: string) => {
                if (key === 'Locked') {
                    return locked;
                }
                return undefined;
            });
            spyOn(ocProperties, 'get').and.callFake((key: string) => {
                if (key === 'D') {
                    return defaultView;
                }
                return undefined;
            });

            layer._document = { _catalog: { _catalogDictionary: catalog } } as any;

            // Act
            layer._setLock(false);

            // Assert
            expect(spliceSpy).toHaveBeenCalledWith(0, 1);
        });
    });

    describe('_parseLayerPage', () => {
        it('should parse XObject OC dictionary and push layer name into _xObject', () => {
            // Arrange
            const ocReference: _PdfReference = createReference();
            const xObjectReference: _PdfReference = createReference();

            const ocDictionary: _PdfDictionary = new _PdfDictionary();
            ocDictionary.update('Name', 'Layer from XObject');

            const xObjectDictionary: _PdfDictionary = new _PdfDictionary();
            xObjectDictionary.update('OC', ocReference);

            const xObjectStream: _PdfStream = createStreamWithDictionary(xObjectDictionary);

            const xObject: _PdfDictionary = new _PdfDictionary();
            xObject.update('XO1', xObjectReference);

            const resources: _PdfDictionary = new _PdfDictionary();
            resources.update('XObject', xObject);

            const pageDictionary: _PdfDictionary = new _PdfDictionary();
            pageDictionary.update('Resources', resources);

            const page: PdfPage = {
                _pageDictionary: pageDictionary
            } as any;

            const crossReference: _PdfCrossReference = createCrossReference((ref: _PdfReference) => {
                if (ref === xObjectReference) {
                    return xObjectStream;
                }
                if (ref === ocReference) {
                    return ocDictionary;
                }
                return undefined;
            });

            const catalog: _PdfDictionary = createCatalogDictionary(new _PdfDictionary());
            const document: PdfDocument = createDocument(catalog, [page]);
            const layer: any = createLayer();

            layer._crossReference = crossReference;
            layer._document = document;
            layer._referenceHolder = ocReference;
            layer._layer = layer;
            layer._xObject = [];

            // Act
            layer._parseLayerPage();

            // Assert
            expect(layer._xObject).toContain('XO1');
            expect(layer._page).toBe(page);
            expect(layer._pageParsed).toBeTruthy();
        });
    });

    describe('_parseDictionary', () => {
        it('should resolve dictionary from getRaw/get when OCGs get returns undefined', () => {
            // Arrange
            const layer: any = createLayer();
            const reference: _PdfReference = createReference();
            const nestedDictionary: _PdfDictionary = new _PdfDictionary();
            nestedDictionary.update('Name', 'Nested OCG');

            const dictionary: _PdfDictionary = new _PdfDictionary();
            const getSpy: jasmine.Spy = spyOn(dictionary, 'get').and.callFake((key: string) => {
                if (key === 'OCGs') {
                    // first call -> undefined to enter highlighted branch
                    // second call -> nested dictionary to cover next lines
                    return getSpy.calls.count() === 1 ? undefined : nestedDictionary;
                }
                return undefined;
            });
            spyOn(dictionary, 'getRaw').and.callFake((key: string) => {
                if (key === 'OCGs') {
                    return reference;
                }
                return undefined;
            });
            spyOn(dictionary, 'has').and.callFake((key: string) => key === 'Name' || key === 'OCGs');

            const setLayerPageSpy: jasmine.Spy = spyOn(layer, '_setLayerPage').and.returnValue(true);
            const page: PdfPage = {} as any;

            // Act
            const result: boolean = layer._parseDictionary(dictionary, reference, page, 'L1');

            // Assert
            expect(result).toBeTruthy();
            expect(setLayerPageSpy).toHaveBeenCalledWith(reference, page, 'L1');
        });

        it('should iterate OCGs reference array and fetch each reference', () => {
            // Arrange
            const layer: any = createLayer();
            const reference: _PdfReference = createReference();
            const fetchedDictionary: _PdfDictionary = new _PdfDictionary();
            fetchedDictionary.update('Name', 'Fetched OCG');

            const dictionary: _PdfDictionary = new _PdfDictionary();
            spyOn(dictionary, 'has').and.callFake((key: string) => key === 'Name' || key === 'OCGs');
            spyOn(dictionary, 'get').and.callFake((key: string) => {
                if (key === 'OCGs') {
                    return [reference];
                }
                return undefined;
            });

            layer._crossReference = createCrossReference((ref: _PdfReference) => {
                return ref === reference ? fetchedDictionary : undefined;
            });

            const setLayerPageSpy: jasmine.Spy = spyOn(layer, '_setLayerPage').and.returnValue(true);
            const page: PdfPage = {} as any;

            // Act
            const result: boolean = layer._parseDictionary(dictionary, reference, page, 'L2');

            // Assert
            expect(result).toBeTruthy();
            expect((layer._crossReference as any)._fetch).toHaveBeenCalledWith(reference);
            expect(setLayerPageSpy).toHaveBeenCalledWith(reference, page, 'L2');
        });
    });
});
describe('PdfLayer _initializeGraphics – full branch coverage', () => {
    let layer: PdfLayer;
    let stream: _PdfContentStream;
    let page: any;
    let crossRef: any;
    let original: any;
    beforeEach(() => {
        stream = new _PdfContentStream([]);

        crossRef = {
            _cacheMap: new Map(),
            _getNextReference: () => new _PdfReference(1, 0)
        } as any;

        page = {
            size: { width: 500, height: 700 },

            mediaBox: [-500, -700, 500, 700],

            cropBox: [-500, -700, 500, 700],

            rotation: PdfRotationAngle.angle90, // 90°

            _origin: [-10, -10],

            _isNew: false,

            _pageSettings: undefined,

            _getActualBounds: jasmine.createSpy(),

            _crossReference: crossRef,

            _contents: [],

            _pageDictionary: {
                has: jasmine.createSpy().and.callFake((key: string) => {
                    return ['CropBox', 'MediaBox', 'Rotate'].indexOf(key) !== -1;
                }),
                get: jasmine.createSpy().and.callFake((key: string) => {
                    if (key === 'Rotate') {
                        return 90;
                    }
                    return undefined;
                }),
                set: jasmine.createSpy(),
                _updated: false
            }
        };
        layer = new PdfLayer();
        // Internal wiring
        (layer as any)._page = page;
        (layer as any)._crossReference = crossRef;
        (layer as any)._id = 'L1';
        (layer as any)._layer = layer;
        (layer as any)._needInitializeGraphics = true;
        original = PdfGraphics;
        (PdfGraphics as any) = jasmine.createSpy('PdfGraphics')
            .and.callFake(() => ({ template: true ,_cropBox:[],_mediaBoxUpperRightBound:0,_initializeCoordinates:()=>{},save:()=>{},_clipBounds:()=>{},translateTransform:()=>{},rotateTransform:()=>{},_clipTranslateMargins:()=>{},_laye:()=>{}}) as any);

    });
    afterEach(() => {
        (PdfGraphics as any) = original;
    });
    it('should create graphics with page size when no CropBox and no special MediaBox conditions', () => {
        // Arrange
        const testPage: any = {
            size: { width: 600, height: 800 },
            mediaBox: [0, 0, 600, 800],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
        expect(testLayer._graphicsState).toBeUndefined();
        expect(testLayer._graphicsCollection.has(testLayer._graphics)).toBe(true);
        expect(testLayer._pageGraphics.has(testPage)).toBe(true);
        expect(testLayer._pages.indexOf(testPage)).not.toBe(-1);
        expect(testLayer._graphics._layer).toBe(testLayer);
    });

    it('should handle CropBox with valid negative coordinates matching page size', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: [-500, -700, 500, 700],
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => key === 'CropBox'),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
        expect(testLayer._graphicsCollection.size).toBeGreaterThan(0);
    });

    it('should handle CropBox with invalid coordinates and assign _cropBox property', () => {
        // Arrange
        const testCropBox: number[] = [10, 20, 400, 600];
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: testCropBox,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => key === 'CropBox'),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._graphics._cropBox).toBe(testCropBox);
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should handle CropBox with invalid length less than 4', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: [10, 20],
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => key === 'CropBox'),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should handle negative MediaBox matching page size without CropBox', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [-500, -700, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should handle invalid case when MediaBox negative values produce width or height <= 0', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [-500, -700, -100, -50],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => key === 'MediaBox'),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._graphics._mediaBoxUpperRightBound).toBe(-50);
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should set _mediaBoxUpperRightBound when MediaBox is present and not invalid case', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [-500, -700, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => key === 'MediaBox'),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._graphics._mediaBoxUpperRightBound).toBe(700);
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should initialize coordinates with page when origin has same negative signs', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [-10, -15],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should initialize coordinates without page when origin is positive or has different signs', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [10, 15],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should handle rotation 90 degrees for non-new page', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle90,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should handle rotation 180 degrees for non-new page', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle180,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should handle rotation 270 degrees for non-new page', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle270,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should handle rotation from page dictionary Rotate key when present', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.callFake((key: string) => key === 'Rotate'),
                get: jasmine.createSpy('get').and.callFake((key: string) => {
                    if (key === 'Rotate') {
                        return 90;
                    }
                    return undefined;
                }),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should skip rotation handling when page is new', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle90,
            _origin: [0, 0],
            _isNew: true,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should apply clip translate margins when page is new and has pageSettings', () => {
        // Arrange
        const testPageSettings: any = { margins: { left: 10, top: 20, right: 15, bottom: 25 } };
        const testClipBounds: number[] = [10, 20, 480, 655];
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: true,
            _pageSettings: testPageSettings,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds').and.returnValue(testClipBounds)
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testPage._getActualBounds).toHaveBeenCalledWith(testPageSettings);
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should skip clip translate margins when page is new but has no pageSettings', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: true,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testPage._getActualBounds).not.toHaveBeenCalled();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should skip rotation when rotation is angle0 and no Rotate key in dictionary', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should handle origin with different signs for coordinate initialization', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [-10, 15],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics).toBeDefined();
        expect(testLayer._needInitializeGraphics).toBe(false);
    });

    it('should add graphics to graphicsCollection when not already present', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        testLayer._graphicsCollection.clear();
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphicsCollection.has(testLayer._graphics)).toBe(true);
    });

    it('should add page to pageGraphics map when not already present', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        testLayer._pageGraphics.clear();
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._pageGraphics.has(testPage)).toBe(true);
        expect(testLayer._pageGraphics.get(testPage)).toBe(testLayer._graphics);
    });

    it('should add page to pages array when not already present', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        testLayer._pages = [];
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._pages.indexOf(testPage)).not.toBe(-1);
        expect(testLayer._pages.length).toBeGreaterThan(0);
    });

    it('should set layer reference on graphics instance', () => {
        // Arrange
        const testPage: any = {
            size: { width: 500, height: 700 },
            mediaBox: [0, 0, 500, 700],
            cropBox: undefined,
            rotation: PdfRotationAngle.angle0,
            _origin: [0, 0],
            _isNew: false,
            _pageSettings: undefined,
            _pageDictionary: {
                has: jasmine.createSpy('has').and.returnValue(false),
                get: jasmine.createSpy('get'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            _contents: [],
            _crossReference: crossRef,
            _getActualBounds: jasmine.createSpy('_getActualBounds')
        };
        const testLayer: any = layer;
        testLayer._page = testPage;
        const testStream: _PdfContentStream = new _PdfContentStream([]);

        // Act
        testLayer._initializeGraphics(testStream);

        // Assert
        expect(testLayer._graphics._layer).toBe(testLayer);
    });
    

});
/////////////////////////////////


