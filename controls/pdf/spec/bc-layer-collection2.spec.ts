import { PdfPrintState } from '../src/pdf/core/enumerator';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { _PdfDictionary, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { PdfLayer } from '../src/pdf/core/layers/layer';
import { PdfLayerCollection } from '../src/pdf/core/layers/layer-collection';

describe('PdfLayerCollection uncovered branches', () => {
    type _LayerLike = PdfLayer & {
        _child: PdfLayer[];
        _subLayer: _PdfReference[];
        _parentLayer: PdfLayer[];
        _parent?: PdfLayer;
        _referenceHolder: _PdfReference;
        _layerId: string;
        _visible: boolean;
        _pages: PdfPage[];
        _xObject: string[];
        _layerPage?: PdfPage;
        visible: boolean;
        printState: PdfPrintState;
        name: string;
    };

    type _DocumentLike = PdfDocument & {
        _order: (_PdfReference | _PdfReference[])[];
        _crossReference: _PdfCrossReference;
        _catalog: {
            _catalogDictionary: _PdfDictionary;
        };
        _optionalContentDictionaries: _PdfReference[];
        _printLayer: _PdfReference[];
        _on: _PdfReference[];
        _off: _PdfReference[];
        _as: _PdfReference[];
    };

    type _GlobalDocumentLike = Document & {
        _order?: (_PdfReference | _PdfReference[])[];
    };

    function _createReference(): _PdfReference {
        return Object.create(_PdfReference.prototype) as _PdfReference;
    }

    function _createCrossReference(
        fetcher?: (reference: _PdfReference) => unknown
    ): _PdfCrossReference {
        const crossReference: _PdfCrossReference =
            Object.create(_PdfCrossReference.prototype) as _PdfCrossReference;

        Object.defineProperty(crossReference, '_cacheMap', {
            value: new Map<_PdfReference, unknown>(),
            writable: true,
            configurable: true
        });

        Object.defineProperty(crossReference, '_getNextReference', {
            value: (): _PdfReference => _createReference(),
            writable: true,
            configurable: true
        });

        Object.defineProperty(crossReference, '_fetch', {
            value: (reference: _PdfReference): unknown => {
                if (fetcher) {
                    return fetcher(reference);
                }
                return undefined;
            },
            writable: true,
            configurable: true
        });

        Object.defineProperty(crossReference, '_allowCatalog', {
            value: false,
            writable: true,
            configurable: true
        });

        return crossReference;
    }

    function _createDocument(order?: (_PdfReference | _PdfReference[])[]): _DocumentLike {
        const catalogDictionary: _PdfDictionary = new _PdfDictionary();
        const documentObject: _DocumentLike =
            Object.create(PdfDocument.prototype) as _DocumentLike;

        Object.defineProperty(documentObject, '_crossReference', {
            value: _createCrossReference(),
            writable: true,
            configurable: true
        });

        Object.defineProperty(documentObject, '_catalog', {
            value: { _catalogDictionary: catalogDictionary },
            writable: true,
            configurable: true
        });

        Object.defineProperty(documentObject, '_order', {
            value: order || [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(documentObject, '_optionalContentDictionaries', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(documentObject, '_printLayer', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(documentObject, '_on', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(documentObject, '_off', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(documentObject, '_as', {
            value: [],
            writable: true,
            configurable: true
        });

        return documentObject;
    }

    function _createLayer(name: string, reference?: _PdfReference): _LayerLike {
        const layer: _LayerLike = Object.create(PdfLayer.prototype) as _LayerLike;

        Object.defineProperty(layer, '_child', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, '_subLayer', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, '_parentLayer', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, '_pages', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, '_xObject', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, '_referenceHolder', {
            value: reference || _createReference(),
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, '_layerId', {
            value: 'Layer_' + name,
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, '_visible', {
            value: true,
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, 'visible', {
            value: true,
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, 'printState', {
            value: PdfPrintState.printWhenVisible,
            writable: true,
            configurable: true
        });

        Object.defineProperty(layer, 'name', {
            value: name,
            writable: true,
            configurable: true
        });

        return layer;
    }

    function _createCollection(
        documentObject: _DocumentLike,
        parent?: _LayerLike
    ): PdfLayerCollection {
        const collection: PdfLayerCollection =
            Object.create(PdfLayerCollection.prototype) as PdfLayerCollection;

        Object.defineProperty(collection, '_document', {
            value: documentObject,
            writable: true,
            configurable: true
        });

        Object.defineProperty(collection, '_crossReference', {
            value: documentObject._crossReference,
            writable: true,
            configurable: true
        });

        Object.defineProperty(collection, '_catalog', {
            value: documentObject._catalog,
            writable: true,
            configurable: true
        });

        Object.defineProperty(collection, '_list', {
            value: [],
            writable: true,
            configurable: true
        });

        Object.defineProperty(collection, '_layerDictionary', {
            value: new Map<_PdfReference, PdfLayer>(),
            writable: true,
            configurable: true
        });

        Object.defineProperty(collection, '_subLayer', {
            value: !!parent,
            writable: true,
            configurable: true
        });

        if (parent) {
            Object.defineProperty(collection, '_parent', {
                value: parent,
                writable: true,
                configurable: true
            });
        }

        return collection;
    }

    function _attachLayers(layer: _LayerLike, collection: PdfLayerCollection): void {
        Object.defineProperty(layer, 'layers', {
            value: collection,
            writable: true,
            configurable: true
        });
    }

    function _createOrderDictionary(order: (_PdfReference | _PdfReference[])[]): _PdfDictionary {
        const defaultView: _PdfDictionary = new _PdfDictionary();
        defaultView.update('Order', order);

        const ocProperties: _PdfDictionary = new _PdfDictionary();
        ocProperties.update('D', defaultView);
        return ocProperties;
    }

    function _enablePdfDocumentCheckOnGlobalDocument(
        order: (_PdfReference | _PdfReference[])[]
    ): () => void {
        const globalDocumentObject: _GlobalDocumentLike = document as _GlobalDocumentLike;
        const previousOrder: (_PdfReference | _PdfReference[])[] | undefined = globalDocumentObject._order;

        Object.defineProperty(globalDocumentObject, '_order', {
            value: order,
            writable: true,
            configurable: true
        });

        const symbolContainer: { hasInstance: string } =
            (window as unknown as { Symbol: { hasInstance: string } }).Symbol;
        const hasInstanceKey: string = symbolContainer.hasInstance;

        const originalDescriptor: PropertyDescriptor | undefined =
            Object.getOwnPropertyDescriptor(PdfDocument as unknown as object, hasInstanceKey);

        Object.defineProperty(PdfDocument as unknown as object, hasInstanceKey, {
            value: (value: unknown): boolean => value === globalDocumentObject,
            configurable: true
        });

        return (): void => {
            if (originalDescriptor) {
                Object.defineProperty(PdfDocument as unknown as object, hasInstanceKey, originalDescriptor);
            } else {
                delete (PdfDocument as unknown as { [key: string]: unknown })[hasInstanceKey];
            }

            if (typeof previousOrder === 'undefined') {
                delete globalDocumentObject._order;
            } else {
                globalDocumentObject._order = previousOrder;
            }
        };
    }

    it('should cover _createSublayer deep document fallback branch with nested order array', () => {
        const parentReference: _PdfReference = _createReference();
        const childReference: _PdfReference = _createReference();

        const nestedOrder: (_PdfReference | _PdfReference[])[] = [[parentReference] as _PdfReference[]];
        const fakeDocument: _DocumentLike = _createDocument(nestedOrder);
        const parentLayer: _LayerLike = _createLayer('Parent', parentReference);
        const childLayer: _LayerLike = _createLayer('Child', childReference);

        _attachLayers(parentLayer, _createCollection(fakeDocument));
        _attachLayers(childLayer, _createCollection(fakeDocument));

        const collection: PdfLayerCollection = _createCollection(fakeDocument, parentLayer);
        const ocProperties: _PdfDictionary = _createOrderDictionary(nestedOrder);

        const restoreGlobalDocument: () => void = _enablePdfDocumentCheckOnGlobalDocument(fakeDocument._order);

        try {
            (
                collection as unknown as {
                    _createSublayer: (
                        oc: _PdfDictionary,
                        reference: _PdfReference,
                        layer: PdfLayer
                    ) => void;
                }
            )._createSublayer(ocProperties, childReference, childLayer);

            expect(fakeDocument._order).toBe(nestedOrder);
            expect(parentLayer._subLayer.length).toBe(1);
            expect(parentLayer._subLayer[0]).toBe(childReference);

            const nestedEntry: (_PdfReference | _PdfReference[])[] =
                fakeDocument._order[0] as (_PdfReference | _PdfReference[])[];
            expect(Array.isArray(nestedEntry)).toBeTruthy();
            expect(nestedEntry.length).toBe(2);
            expect(nestedEntry[0]).toBe(parentReference);
            expect(nestedEntry[1]).toBe(parentLayer._subLayer);

            expect(parentLayer._child.indexOf(childLayer)).toBeGreaterThan(-1);
            expect(childLayer._parent).toBe(parentLayer);
            expect(childLayer._parentLayer.indexOf(parentLayer)).toBeGreaterThan(-1);
        } finally {
            restoreGlobalDocument();
        }
    });

    it('should cover _parsingLayerOrder branch that pushes non-PdfLayer parent entries into child parentLayer', () => {
        const childReference: _PdfReference = _createReference();
        const fakeDocument: _DocumentLike = _createDocument();
        const collection: PdfLayerCollection = _createCollection(fakeDocument);

        const parentLayer: _LayerLike = _createLayer('Parent');
        const childLayer: _LayerLike = _createLayer('Child', childReference);
        const nonPdfLayerParent: PdfLayer = ({ marker: 'plain-object-parent' } as unknown) as PdfLayer;

        parentLayer._parentLayer.push(nonPdfLayerParent);

        const layerDictionary: Map<_PdfReference, PdfLayer> = new Map<_PdfReference, PdfLayer>();
        layerDictionary.set(childReference, childLayer);

        (
            collection as unknown as {
                _parsingLayerOrder: (
                    parent: PdfLayer,
                    array: (_PdfReference | _PdfReference[])[],
                    layerDictionary: Map<_PdfReference, PdfLayer>
                ) => void;
            }
        )._parsingLayerOrder(parentLayer, [childReference], layerDictionary);

        expect(parentLayer._child.indexOf(childLayer)).toBeGreaterThan(-1);
        expect(childLayer._parent).toBe(parentLayer);
        expect(childLayer._parentLayer.indexOf(nonPdfLayerParent)).toBeGreaterThan(-1);
        expect(childLayer._parentLayer.indexOf(parentLayer)).toBeGreaterThan(-1);
    });

    it('should cover _parsingLayerOrder recursive else branch for non-string nested subArray', () => {
        const childReference: _PdfReference = _createReference();
        const fakeDocument: _DocumentLike = _createDocument();
        const collection: PdfLayerCollection = _createCollection(fakeDocument);
        const childLayer: _LayerLike = _createLayer('Child', childReference);

        const layerDictionary: Map<_PdfReference, PdfLayer> = new Map<_PdfReference, PdfLayer>();
        layerDictionary.set(childReference, childLayer);

        const parsingSpy: jasmine.Spy = spyOn(
            collection as unknown as {
                _parsingLayerOrder: (
                    parent: PdfLayer,
                    array: (_PdfReference | _PdfReference[])[],
                    layerDictionary: Map<_PdfReference, PdfLayer>
                ) => void;
            },
            '_parsingLayerOrder'
        ).and.callThrough();

        (
            collection as unknown as {
                _parsingLayerOrder: (
                    parent: PdfLayer,
                    array: (_PdfReference | _PdfReference[])[],
                    layerDictionary: Map<_PdfReference, PdfLayer>
                ) => void;
            }
        )._parsingLayerOrder(
            null as unknown as PdfLayer,
            [[childReference] as _PdfReference[]],
            layerDictionary
        );

        expect(parsingSpy.calls.count()).toBeGreaterThan(1);
        expect(parsingSpy.calls.argsFor(1)[0]).toBeNull();
        expect(Array.isArray(parsingSpy.calls.argsFor(1)[1])).toBeTruthy();
        expect((parsingSpy.calls.argsFor(1)[1] as (_PdfReference | _PdfReference[])[])[0]).toBe(childReference);
    });

    it('should cover _removeUsage explicit _PdfDictionary branch and remove matching OCG reference', () => {
        const layerReference: _PdfReference = _createReference();
        const otherReference: _PdfReference = _createReference();
        const fakeDocument: _DocumentLike = _createDocument();

        const fetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue(undefined);
        Object.defineProperty(fakeDocument, '_crossReference', {
            value: _createCrossReference(fetchSpy as unknown as (reference: _PdfReference) => unknown),
            writable: true,
            configurable: true
        });

        const collection: PdfLayerCollection = _createCollection(fakeDocument);
        const layer: _LayerLike = _createLayer('Target', layerReference);

        const usageDictionary: _PdfDictionary = new _PdfDictionary();
        usageDictionary.update('OCGs', [otherReference, layerReference]);

        (
            collection as unknown as {
                _removeUsage: (
                    layer: PdfLayer,
                    usage: _PdfReference[]
                ) => void;
            }
        )._removeUsage(layer, [usageDictionary as unknown as _PdfReference]);

        const ocgs: _PdfReference[] = usageDictionary.get('OCGs') as _PdfReference[];

        expect(fetchSpy).not.toHaveBeenCalled();
        expect(ocgs.length).toBe(1);
        expect(ocgs[0]).toBe(otherReference);
        expect(ocgs.indexOf(layerReference)).toBe(-1);
    });
});
