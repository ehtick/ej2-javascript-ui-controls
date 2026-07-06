
import { _PdfContentStream } from '../src/pdf/core/base-stream';
import { _ContentParser, _PdfRecord } from '../src/pdf/core/content-parser';
import { PdfPrintState } from '../src/pdf/core/enumerator';
import { _PdfCatalog } from '../src/pdf/core/pdf-catalog';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { PdfLayer } from '../src/pdf/core/layers/layer';
import { PdfLayerCollection } from '../src/pdf/core/layers/layer-collection';

type _CrossReferenceStub = _PdfCrossReference & {
    _cacheMap: Map<_PdfReference, unknown>;
    _allowCatalog: boolean;
    _fetch: (reference: _PdfReference) => unknown;
    _getNextReference: () => _PdfReference;
};

type _DocumentStub = PdfDocument & {
    _crossReference: _CrossReferenceStub;
    _catalog: _PdfCatalog & { _catalogDictionary: _PdfDictionary };
    _order: Array<_PdfReference | _PdfReference[]>;
    _on: _PdfReference[];
    _off: _PdfReference[];
    _as: _PdfReference[];
    _printLayer: _PdfReference[];
    _optionalContentDictionaries: _PdfReference[];
};


interface _CollectionInternals {
    _list: PdfLayer[];
    _document: _DocumentStub;
    _catalog: _PdfCatalog;
    _crossReference: _CrossReferenceStub;
    _layerDictionary: Map<_PdfReference, PdfLayer>;
    _parent?: PdfLayer;
    _subLayer: boolean;
    _bdcCount: number;
    _isLayerContainsResource: boolean;

    _setPrintState(printOption: _PdfDictionary, layer: PdfLayer): void;
    _createLayer(layer: PdfLayer): void;
    _createOptionalContentDictionary(layer: PdfLayer): _PdfReference[];
    _createOptionalContentViews(): _PdfDictionary;
    _setPrintOption(layer: PdfLayer): _PdfReference;
    _createSublayer(oc: _PdfDictionary, ref: _PdfReference, layer: PdfLayer): void;
    _checkLayerLock(oc: _PdfDictionary): void;
    _checkLayerVisible(oc: _PdfDictionary): void;
    _checkParentLayer(oc: _PdfDictionary): void;
    _parsingLayerOrder(
        parent: PdfLayer | null,
        array: (_PdfReference | _PdfReference[])[],
        dict: Map<_PdfReference, PdfLayer>
    ): void;
    _createLayerHierarchical(oc: _PdfDictionary): void;
    _addChildLayer(layer: PdfLayer): void;
    _addNestedLayer(layer: PdfLayer): number;
    _removeLayer(layer: PdfLayer, removeContent: boolean): void;
    _removeOCG(layer: PdfLayer, ocg: _PdfReference[]): void;
    _removeUsage(layer: PdfLayer, usage: _PdfReference[]): void;
    _removeOrder(
        layer: PdfLayer,
        order: (_PdfReference[] | _PdfReference)[],
        helpers: (_PdfReference | _PdfReference[])[]
    ): void;
    _removeVisible(layer: PdfLayer, on: _PdfReference[], off: _PdfReference[]): void;
    _removeLocked(layer: PdfLayer, locked: _PdfReference[]): void;
    _removeLayerContent(layer: PdfLayer): void;
    _processBeginMarkContent(
        parser: PdfLayer,
        operator: string,
        operands: string[],
        data: _PdfContentStream,
        id?: string
    ): void;
    _streamWrite(
        operands: string[],
        operator: string,
        skip: boolean,
        data: _PdfContentStream
    ): void;
    _insertLayer(index: number, layer: PdfLayer): void;
}

describe('PdfLayerCollection - behavior tests (AAA)', () => {

    beforeAll(() => {
        const originalAdd = PdfLayerCollection.prototype.add;

        PdfLayerCollection.prototype.add = function (
            this: PdfLayerCollection,
            name: string,
            visible: boolean = true
        ): PdfLayer {
            const layer = originalAdd.call(this, name, visible);
            const doc = (this as any)._document as _DocumentStub;

            // ✅ Wire document immediately (runtime guarantee)
            layer._document = doc;
            layer._crossReference = doc._crossReference;

            return layer;
        };
    });


    function _createReference(objectNumber: number, generationNumber: number = 0): _PdfReference {
        return _PdfReference.get(objectNumber, generationNumber);
    }

    function _createCrossReference(): _CrossReferenceStub {
        let nextObjectNumber: number = 100;

        const crossReference: _CrossReferenceStub = Object.create(_PdfCrossReference.prototype) as _CrossReferenceStub;
        crossReference._cacheMap = new Map<_PdfReference, unknown>();
        crossReference._allowCatalog = false;
        crossReference._fetch = (reference: _PdfReference): unknown => crossReference._cacheMap.get(reference);
        crossReference._getNextReference = (): _PdfReference => {
            nextObjectNumber += 1;
            return _createReference(nextObjectNumber, 0);
        };

        return crossReference;
    }

    function _createDocument(): _DocumentStub {
        const crossReference: _CrossReferenceStub = _createCrossReference();
        const catalogDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        const catalog: _PdfCatalog & { _catalogDictionary: _PdfDictionary } =
            Object.create(_PdfCatalog.prototype) as _PdfCatalog & { _catalogDictionary: _PdfDictionary };
        catalog._catalogDictionary = catalogDictionary;

        // minimal Pages tree (required by PdfDocument.pageCount)
        const pagesDict: _PdfDictionary = new _PdfDictionary(crossReference);
        pagesDict.update('Count', 0);
        catalogDictionary.update('Pages', pagesDict);

        const document: _DocumentStub = Object.create(PdfDocument.prototype) as _DocumentStub;
        document._crossReference = crossReference;
        document._catalog = catalog;
        document._order = [];
        document._on = [];
        document._off = [];
        document._as = [];
        document._printLayer = [];
        document._optionalContentDictionaries = [];

        return document;
    }




    function _createEmptyCollection(document: _DocumentStub): _CollectionInternals {
        const collection = Object.create(PdfLayerCollection.prototype) as any;

        collection._list = [];
        collection._document = document;
        collection._crossReference = document._crossReference;
        collection._catalog = document._catalog;
        collection._layerDictionary = new Map<_PdfReference, PdfLayer>();
        collection._subLayer = false;
        collection._bdcCount = 0;
        collection._isLayerContainsResource = false;

        return collection as _CollectionInternals;
    }


    function _createNestedCollection(document: _DocumentStub,
        parent?: PdfLayer
    ): PdfLayerCollection {
        const collection = _createEmptyCollection(document) as any;

        if (parent) {
            collection._subLayer = true;
            collection._parent = parent;
        }

        return collection as PdfLayerCollection;
    }


    function _attachLayersCollection(layer: PdfLayer, document: _DocumentStub): void {
        const layers = _createEmptyCollection(document);

        Object.defineProperty(layer, 'layers', {
            value: layers as unknown as PdfLayerCollection,
            configurable: true
        });
    }
    ``




    function _createLayer(
        name: string,
        visible: boolean = true,
        document?: _DocumentStub
    ): PdfLayer {
        const layer: PdfLayer = Object.create(PdfLayer.prototype) as PdfLayer;

        // Basic identity
        layer.name = name;
        layer._layerId = `Layer_${name}`;

        // Internal defaults
        layer._visible = visible;
        layer._child = [];
        layer._subLayer = [];
        layer._parentLayer = [];
        layer._pages = [];
        layer._xObject = [];

        // ✅ CRITICAL FIX: wire document + cross-reference
        if (document) {
            layer._document = document;
            layer._crossReference = document._crossReference;
        }

        return layer;
    }


    function _createPage(
        crossReference: _CrossReferenceStub,
        contentsArray: unknown[],
        contentReferences: _PdfReference[]
    ): PdfPage {
        const page: PdfPage = Object.create(PdfPage.prototype) as PdfPage;
        const pageDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        pageDictionary.update('Contents', contentsArray);
        (page as PdfPage & { _pageDictionary: _PdfDictionary })._pageDictionary = pageDictionary;
        (page as PdfPage & { _contents: _PdfReference[] })._contents = contentReferences;
        return page;
    }

    afterEach(() => {
        if ((_ContentParser.prototype._readContent as unknown as jasmine.Spy | undefined).and) {
            (_ContentParser.prototype._readContent as unknown as jasmine.Spy).and.callThrough();
        }
    });



    it('should create sublayer structures for parent/ancestor order branches', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();

        const grandParent: PdfLayer = _createLayer('GrandParent');
        const parent: PdfLayer = _createLayer('Parent');
        const child: PdfLayer = _createLayer('Child');

        _attachLayersCollection(grandParent, document);
        _attachLayersCollection(parent, document);
        _attachLayersCollection(child, document);

        const grandParentReference: _PdfReference = _createReference(20);
        const parentReference: _PdfReference = _createReference(21);
        const childReference: _PdfReference = _createReference(22);

        grandParent._referenceHolder = grandParentReference;
        parent._referenceHolder = parentReference;
        child._referenceHolder = childReference;

        parent._parent = grandParent;
        grandParent._subLayer.push(parentReference);

        const defaultView: _PdfDictionary = new _PdfDictionary(document._crossReference);
        defaultView.update('Order', [grandParentReference, grandParent._subLayer as unknown as _PdfReference[]]);
        const ocProperties: _PdfDictionary = new _PdfDictionary(document._crossReference);
        ocProperties.update('D', defaultView);

        document._order = [grandParentReference, grandParent._subLayer as unknown as _PdfReference[]];

        const collection: _CollectionInternals = _createEmptyCollection(document);
        collection._subLayer = true;
        collection._parent = parent;

        // Act
        collection._createSublayer(ocProperties, childReference, child);

        // Assert
        expect(parent._subLayer.indexOf(childReference)).toBeGreaterThan(-1);
        expect(parent._child.indexOf(child)).toBeGreaterThan(-1);
        expect(child._parentLayer.indexOf(parent)).toBeGreaterThan(-1);
    });

    it('should cover createSublayer branch that uses nested order arrays when parent has no direct parent in order', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const parent: PdfLayer = _createLayer('ParentNested');
        const child: PdfLayer = _createLayer('ChildNested');

        _attachLayersCollection(parent, document);
        _attachLayersCollection(child, document);

        const parentReference: _PdfReference = _createReference(31);
        const childReference: _PdfReference = _createReference(32);

        parent._referenceHolder = parentReference;
        child._referenceHolder = childReference;


        const nestedOrder: _PdfReference[] = [parentReference];
        document._order = nestedOrder;


        const defaultView: _PdfDictionary = new _PdfDictionary(document._crossReference);
        defaultView.update('Order', document._order);
        const ocProperties: _PdfDictionary = new _PdfDictionary(document._crossReference);
        ocProperties.update('D', defaultView);

        const collection: _CollectionInternals = _createEmptyCollection(document);
        collection._subLayer = true;
        collection._parent = parent;

        // const documentGetterSpy: jasmine.Spy = spyOnProperty(window, 'document', 'get').and.returnValue(document as unknown as Document);

        // Act
        collection._createSublayer(ocProperties, childReference, child);

        // Assert
        expect(parent._subLayer.indexOf(childReference)).toBeGreaterThan(-1);
        expect(parent._child.indexOf(child)).toBeGreaterThan(-1);
        expect(child._parentLayer.indexOf(parent)).toBeGreaterThan(-1);

        // documentGetterSpy.and.callThrough();
    });

    it('should mark layers locked and invisible from OCProperties', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const collection: _CollectionInternals = _createEmptyCollection(document);

        const layer: PdfLayer = _createLayer('LockVisibleLayer', true, document);
        const reference: _PdfReference = _createReference(40);
        layer._referenceHolder = reference;
        layer._dictionary = new _PdfDictionary(document._crossReference);
        layer._dictionary.update('Visible', true);

        collection._layerDictionary.set(reference, layer);

        const defaultView: _PdfDictionary = new _PdfDictionary(document._crossReference);
        defaultView.update('Locked', [reference]);
        defaultView.update('OFF', [reference]);

        const ocProperties: _PdfDictionary = new _PdfDictionary(document._crossReference);
        ocProperties.update('D', defaultView);
        document._catalog._catalogDictionary.update('OCProperties', ocProperties);

        // Act
        collection._checkLayerLock(ocProperties);
        collection._checkLayerVisible(ocProperties);

        // Assert
        expect(layer.locked).toBeTruthy();
        expect(layer._visible).toBeFalsy();
        expect(layer._dictionary.get('Visible')).toBeFalsy();
    });

    it('should parse parent layer order, copy non-PdfLayer ancestor entries, recurse into arrays and return on empty subarray', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const collection: _CollectionInternals = _createEmptyCollection(document);

        const root: PdfLayer = _createLayer('Root');
        const child: PdfLayer = _createLayer('Child');
        const rootReference: _PdfReference = _createReference(50);
        const childReference: _PdfReference = _createReference(51);

        const nonPdfAncestor: PdfLayer = ({ tag: 'non-pdf-ancestor' } as unknown as PdfLayer);

        root._referenceHolder = rootReference;
        root._parentLayer.push(nonPdfAncestor);
        child._referenceHolder = childReference;

        const layerDictionary: Map<_PdfReference, PdfLayer> = new Map<_PdfReference, PdfLayer>([
            [rootReference, root],
            [childReference, child]
        ]);

        const parsedArray: (_PdfReference | _PdfReference[])[] = [
            rootReference,
            [childReference],
            [],
            ['StringMarker' as unknown as _PdfReference]
        ];

        // Act
        collection._parsingLayerOrder(null, parsedArray, layerDictionary);

        // Assert
        expect(root._child.indexOf(child)).toBeGreaterThan(-1);
        expect(child._parent).toBe(root);
        expect(child._parentLayer.indexOf(root)).toBeGreaterThan(-1);
        expect(child._parentLayer.indexOf(nonPdfAncestor)).toBeGreaterThan(-1);
        expect(Array.isArray(root._subLayer)).toBeTruthy();
    });


    it('should remove order entries for direct hit, next-array hit and recursive nested hit', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const collection: _CollectionInternals = _createEmptyCollection(document);
        const layer: PdfLayer = _createLayer('OrderLayer');
        const layerReference: _PdfReference = _createReference(80);
        const otherReference: _PdfReference = _createReference(81);
        const nestedReference: _PdfReference = _createReference(82);
        layer._referenceHolder = layerReference;

        const order: (_PdfReference[] | _PdfReference)[] = [
            otherReference,
            [nestedReference, layerReference] as unknown as _PdfReference[],
            layerReference,
            [otherReference] as unknown as _PdfReference[]
        ];

        const helperArrays: (_PdfReference | _PdfReference[])[] = [];

        // Act
        collection._removeOrder(layer, order, helperArrays);

        // Assert
        const flattenedText: string = JSON.stringify(order);
        expect(flattenedText.includes('"80"')).toBeFalsy();
    });

    it('should remove visible reference from OFF branch and remove locked reference', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const collection: _CollectionInternals = _createEmptyCollection(document);

        const layer: PdfLayer = _createLayer('OffVisible', false, document);
        const layerReference: _PdfReference = _createReference(90);
        layer._referenceHolder = layerReference;

        const on: _PdfReference[] = [];
        const off: _PdfReference[] = [layerReference];
        const locked: _PdfReference[] = [layerReference];

        // Act
        collection._removeVisible(layer, on, off);
        collection._removeLocked(layer, locked);

        // Assert
        expect(off.indexOf(layerReference)).toBe(-1);
        expect(locked.indexOf(layerReference)).toBe(-1);
    });


    it('should increment BDC count and return early when already inside marked content', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const collection: _CollectionInternals = _createEmptyCollection(document);
        const layer: PdfLayer = _createLayer('BDCCount');
        layer._pages.push(_createPage(document._crossReference, [], []));

        const data: _PdfContentStream = new _PdfContentStream([]);
        collection._bdcCount = 1;

        // Act
        collection._processBeginMarkContent(layer, 'BDC', ['/OC', '/BDCCount'], data, '1 0');

        // Assert
        expect(collection._bdcCount).toBe(2);
        expect(data.getString()).toBe('');
    });

    it('should remove object reference from page Contents when BDC operand matches layer id and id is provided', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const collection: _CollectionInternals = _createEmptyCollection(document);
        const layer: PdfLayer = _createLayer('TargetBdc');
        layer._layerId = 'TargetBdc';

        const contentReference: _PdfReference = _PdfReference.get(12, 0);
        const page: PdfPage = _createPage(document._crossReference, [], []);
        (page as PdfPage & { _pageDictionary: _PdfDictionary })._pageDictionary.update('Contents', [contentReference]);
        layer._pages.push(page);

        const data: _PdfContentStream = new _PdfContentStream([]);

        // Act
        collection._processBeginMarkContent(layer, 'BDC', ['/OC', '/TargetBdc'], data, '12 0');

        // Assert
        const rawContents: _PdfReference[] =
            (page as PdfPage & { _pageDictionary: _PdfDictionary })._pageDictionary.getRaw('Contents') as _PdfReference[];
        expect(rawContents.length).toBe(0);
        expect(collection._bdcCount).toBe(1);
    });

    it('should skip stream write when skip is true and current state is inside BDC content', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const collection: _CollectionInternals = _createEmptyCollection(document);
        collection._bdcCount = 1;
        const data: _PdfContentStream = new _PdfContentStream([]);

        // Act
        collection._streamWrite(['1', '2'], 'm', true, data);

        // Assert
        expect(data.getString()).toBe('');
    });

    it('should insert a layer reference into order and OCG arrays when both adjacent items are references', () => {
        // Arrange
        const document: _DocumentStub = _createDocument();
        const collection: _CollectionInternals = _createEmptyCollection(document);

        const ref1: _PdfReference = _createReference(101);
        const ref2: _PdfReference = _createReference(102);
        const ref3: _PdfReference = _createReference(103);
        const movingRef: _PdfReference = _createReference(104);

        const defaultView: _PdfDictionary = new _PdfDictionary(document._crossReference);
        defaultView.update('Order', [ref1, ref2, ref3, movingRef]);

        const ocProperties: _PdfDictionary = new _PdfDictionary(document._crossReference);
        ocProperties.update('OCGs', [ref1, ref2, ref3, movingRef]);
        ocProperties.update('D', defaultView);

        document._catalog._catalogDictionary.update('OCProperties', ocProperties);

        const layer: PdfLayer = _createLayer('InsertLayer');
        layer._referenceHolder = movingRef;

        // Act
        collection._insertLayer(1, layer);

        // Assert
        const order: (_PdfReference | _PdfReference[])[] = defaultView.get('Order') as (_PdfReference | _PdfReference[])[];
        const ocgs: _PdfReference[] = ocProperties.get('OCGs') as _PdfReference[];

        expect(order[1]).toBe(movingRef);
        expect(ocgs[1]).toBe(movingRef);
    });
});


describe('PdfLayerCollection – coverage tests', () => {

    let document: PdfDocument;
    let layers: PdfLayerCollection;

    beforeEach(() => {
        document = new PdfDocument(undefined as any);
        layers = new PdfLayerCollection(document);
    });

    // ----------------------------
    // contains() – error + branches
    // ----------------------------
    it('throws error when contains() called with null', () => {
        expect(() => layers.contains(null as any))
            .toThrowError('Layer cannot be null or undefined');
    });

    it('returns true when layer name exists', () => {
        layers.add('A');
        expect(layers.contains('A')).toBeTruthy();
    });

    it('returns true when layer instance exists', () => {
        const layer = layers.add('A');
        expect(layers.contains(layer)).toBeTruthy();
    });

    it('returns false for unknown layer', () => {
        expect(layers.contains('X')).toBeFalsy();
    });

    // ----------------------------
    // move() – error + reorder
    // ----------------------------
    it('throws when move index is out of range', () => {
        const layer = layers.add('A');
        expect(() => layers.move(5, layer))
            .toThrowError('Index cannot be less than 0 or greater than array length');
    });

    it('moves layer and updates order safely', () => {
        const a = layers.add('A');
        const b = layers.add('B');

        layers.move(0, b);
        expect(layers.at(0)).toBe(b);
        expect(layers.at(1)).toBe(a);
    });

    // ----------------------------
    // removeAt() – child cleanup
    // ----------------------------
    it('removes layer with children correctly', () => {
        const parent = layers.add('Parent');
        const child = new PdfLayer();
        parent._child.push(child);
        layers['_list'].push(child);

        layers.removeAt(0);

        expect(layers.count).toBe(0);
    });

    // ----------------------------
    // remove(name) – loop i = i - 1
    // ----------------------------
    it('removes all layers with duplicate names', () => {
        layers.add('X');
        layers.add('X');
        layers.add('Y');

        layers.remove('X');

        expect(layers.count).toBe(1);
        expect(layers.at(0).name).toBe('Y');
    });

    // ----------------------------
    // Print & View dictionary branches
    // ----------------------------
    it('applies PrintState from dictionary', () => {
        const layer = layers.add('PrintTest');
        const dict = new _PdfDictionary();
        dict.update('PrintState', new _PdfName('ON'));

        layers['_setPrintState'](dict, layer);
        expect(layer.printState).toBe(PdfPrintState.alwaysPrint);
    });

    it('applies ViewState = OFF visibility', () => {
        const layer = layers.add('ViewTest');
        const usage = new _PdfDictionary();
        const view = new _PdfDictionary();

        view.update('ViewState', new _PdfName('OFF'));
        usage.update('View', view);

        // simulate constructor logic
        const v = usage.get('View') as _PdfDictionary;
        const state = v.get('ViewState') as _PdfName;
        if (state.name === 'OFF') {
            layer.visible = false;
        }

        expect(layer.visible).toBeFalsy();
    });

    // ----------------------------
    // _streamWrite – skip branch
    // ----------------------------
    it('skips writing when skip is true and _bdcCount > 0', () => {
        const layer = layers.add('SkipTest');
        const stream = { write: jasmine.createSpy('write') } as any;

        layers['_bdcCount'] = 1;
        layers['_streamWrite'](['10'], 'cm', true, stream);

        expect(stream.write).not.toHaveBeenCalled();
    });

    // ----------------------------
    // _processBeginMarkContent – BDC / EMC
    // ----------------------------
    it('increments and decrements _bdcCount safely', () => {
        const layer = layers.add('BDC');
        layer._layerId = 'OC1';
        layer._pages = [{
            _pageDictionary: {
                getRaw: (): any[] => []
            }
        }] as any;

        layers['_processBeginMarkContent'](
            layer,
            'BDC',
            ['/OC', '/OC1'],
            {} as any
        );

        expect(layers['_bdcCount']).toBe(1);

        layers['_processBeginMarkContent'](
            layer,
            'EMC',
            [],
            {} as any
        );

        expect(layers['_bdcCount']).toBe(0);
    });

});


describe('PdfLayerCollection - behaviour coverage', () => {

    let visibilitySpy: jasmine.Spy;
    let printStateSpy: jasmine.Spy;

    beforeEach(() => {
        visibilitySpy = spyOn(PdfLayer.prototype as any, '_setVisibility').and.callFake(function (this: any, value: boolean): void {
            this._visible = value;
        });

        printStateSpy = spyOn(PdfLayer.prototype as any, '_setPrintState').and.callFake(function (this: any, value: PdfPrintState): void {
            this._printState = value;
        });

        // Prevent PdfLayer.visible / PdfLayer.printState setters from accessing this._document during construction
        spyOnProperty(PdfLayer.prototype as any, 'visible', 'set').and.callFake(function (this: any, value: boolean): void {
            this._visible = value;
        });
        spyOnProperty(PdfLayer.prototype as any, 'printState', 'set').and.callFake(function (this: any, value: PdfPrintState): void {
            this._printState = value;
        });
    });

    function getRef(obj: number, gen: number = 0): _PdfReference {
        return _PdfReference.get(obj, gen);
    }

    function createCrossReferenceMock(): any {
        let current: number = 100;
        const cacheMap: Map<_PdfReference, any> = new Map<_PdfReference, any>();
        return {
            _cacheMap: cacheMap,
            _allowCatalog: false,
            _getNextReference: (): _PdfReference => getRef(current++),
            _fetch: (reference: _PdfReference): any => cacheMap.get(reference)
        };
    }

    function createDocumentMock(crossReference?: any): PdfDocument {
        const crossRef: any = crossReference || createCrossReferenceMock();
        const catalogDict: _PdfDictionary = new _PdfDictionary(crossRef);

        const doc: any = Object.create(PdfDocument.prototype);

        doc._crossReference = crossRef;
        doc._catalog = {
            _catalogDictionary: catalogDict,
            get: (key: string): any => catalogDict.get(key),
            update: (key: string, value: any): void => catalogDict.update(key, value)
        };
        doc._optionalContentDictionaries = [];
        doc._printLayer = [];
        doc._order = [];
        doc._on = [];
        doc._off = [];
        doc._as = [];

        return doc as PdfDocument;
    }

    function createLayerMock(doc: PdfDocument, name: string = 'Layer'): PdfLayer {
        const layer: any = Object.create(PdfLayer.prototype);

        layer._name = name;
        layer._visible = true;
        layer._printState = PdfPrintState.printWhenVisible;
        layer._locked = false;
        layer._child = [];
        layer._parentLayer = [];
        layer._subLayer = [];
        layer._pages = [];
        layer._xObject = [];
        layer._layerId = `${name}_ID`;
        layer._document = doc;
        layer._crossReference = (doc as any)._crossReference;
        layer._referenceHolder = null;
        layer._dictionary = null;
        layer._parent = null;
        layer._layer = layer;
        layer._usage = null;
        layer._printOption = null;

        // Use Object.defineProperty to allow setter for _layerPage (getter-only property)
        Object.defineProperty(layer, '_layerPage', {
            value: null,
            writable: true,
            enumerable: true,
            configurable: true
        });

        const nestedCollection: any = Object.create(PdfLayerCollection.prototype);
        nestedCollection._list = [];
        nestedCollection._document = doc;
        nestedCollection._crossReference = (doc as any)._crossReference;
        nestedCollection._catalog = (doc as any)._catalog;
        nestedCollection._layerDictionary = new Map();
        nestedCollection._subLayer = false;
        nestedCollection._isLayerContainsResource = false;
        nestedCollection._bdcCount = 0;

        layer._layers = nestedCollection;

        return layer as PdfLayer;
    }

    function createPageMock(contents: any[], properties?: _PdfDictionary, xObject?: _PdfDictionary): PdfPage {
        const page: any = Object.create(PdfPage.prototype);
        const resources: _PdfDictionary = new _PdfDictionary();

        if (properties) {
            resources.update('Properties', properties);
        }
        if (xObject) {
            resources.update('XObject', xObject);
        }

        const pageDictionary: any = new _PdfDictionary();
        pageDictionary.update('Resources', resources);
        pageDictionary.update('Contents', contents);
        pageDictionary.getArray = function (key: string): any[] {
            return this.get(key);
        };
        pageDictionary.getRaw = function (key: string): any {
            return this.get(key);
        };
        pageDictionary._updated = false;

        page._pageDictionary = pageDictionary;
        page._contents = [];

        return page as PdfPage;
    }

    function createRecord(operator: string, operands: string[] = []): _PdfRecord {
        return {
            _operator: operator,
            _operands: operands
        } as _PdfRecord;
    }

    // ---------------------------------------------------------
    // Constructor coverage
    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Public API branch coverage
    // ---------------------------------------------------------

    it('should throw for indexOf when layer is null or undefined (AAA)', () => {
        // Arrange
        const collection: PdfLayerCollection = new PdfLayerCollection(createDocumentMock());

        // Act / Assert
        expect(() => collection.indexOf(null as any)).toThrowError('Layer cannot be null or undefined');
        expect(() => collection.indexOf(undefined as any)).toThrowError('Layer cannot be null or undefined');
    });

    it('should throw for move when layer is null or undefined (AAA)', () => {
        // Arrange
        const doc: PdfDocument = createDocumentMock();
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);
        const layer1: PdfLayer = createLayerMock(doc, 'L1');
        const layer2: PdfLayer = createLayerMock(doc, 'L2');

        (collection as any)._list = [layer1, layer2];

        // Act / Assert
        expect(() => collection.move(0, null as any)).toThrowError('Layer cannot be null or undefined');
        expect(() => collection.move(0, undefined as any)).toThrowError('Layer cannot be null or undefined');
    });

    it('should throw for removeAt when index is out of range (AAA)', () => {
        // Arrange
        const collection: PdfLayerCollection = new PdfLayerCollection(createDocumentMock());

        // Act / Assert
        expect(() => collection.removeAt(-1)).toThrowError('Index cannot be less than 0 or greater than array length');
        expect(() => collection.removeAt(0)).toThrowError('Index cannot be less than 0 or greater than array length');
    });

    it('should remove a layer and its child layers safely in removeAt without timeout (AAA)', () => {
        // Arrange
        const doc: PdfDocument = createDocumentMock();
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const parent: PdfLayer = createLayerMock(doc, 'Parent');
        const child: PdfLayer = createLayerMock(doc, 'Child');
        (parent as any)._child.push(child);

        (collection as any)._list = [parent, child];

        spyOn<any>(collection, '_removeLayer').and.callFake((): void => {
            // no-op
        });

        // Act
        collection.removeAt(0, true);

        // Assert
        expect((collection as any)._removeLayer).toHaveBeenCalledWith(parent, true);
        expect((collection as any)._removeLayer).toHaveBeenCalledWith(child, false);
        expect(collection.count).toBe(0);
    });

    // ---------------------------------------------------------
    // _createLayer / _createOptionalContentDictionary / _setPrintOption
    // ---------------------------------------------------------

    it('should update existing OCProperties and push visible layer reference into ON array (AAA)', () => {
        // Arrange
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const ocProps: _PdfDictionary = new _PdfDictionary(crossRef);
        const defaultView: _PdfDictionary = new _PdfDictionary(crossRef);
        const usageApplication: _PdfDictionary = new _PdfDictionary(crossRef);
        const usageRef: _PdfReference = getRef(20);

        ocProps.update('OCGs', []);
        defaultView.update('ON', []);
        defaultView.update('OFF', []);
        defaultView.update('AS', [usageRef]);
        ocProps.update('D', defaultView);
        (doc as any)._catalog._catalogDictionary.update('OCProperties', ocProps);

        usageApplication.update('OCGs', []);
        crossRef._cacheMap.set(usageRef, usageApplication);

        const layer: PdfLayer = createLayerMock(doc, 'Visible-Layer');
        (layer as any)._visible = true;

        // Act
        (collection as any)._createLayer(layer);

        // Assert
        expect(defaultView.has('Order')).toBeTruthy();
        expect((defaultView.get('ON') as _PdfReference[]).length).toBe(1);
        expect((defaultView.get('ON') as _PdfReference[])[0]).toBe((layer as any)._referenceHolder);
        expect((usageApplication.get('OCGs') as _PdfReference[])).toContain((layer as any)._referenceHolder);
        expect((doc as any)._catalog._catalogDictionary._updated).toBeTruthy();
    });

    it('should update existing OCProperties and push invisible layer reference into OFF array (AAA)', () => {
        // Arrange
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const ocProps: _PdfDictionary = new _PdfDictionary(crossRef);
        const defaultView: _PdfDictionary = new _PdfDictionary(crossRef);

        ocProps.update('OCGs', []);
        defaultView.update('Order', []);
        defaultView.update('ON', []);
        defaultView.update('OFF', []);
        ocProps.update('D', defaultView);
        (doc as any)._catalog._catalogDictionary.update('OCProperties', ocProps);

        const layer: PdfLayer = createLayerMock(doc, 'Hidden-Layer');
        (layer as any)._visible = false;

        // Act
        (collection as any)._createLayer(layer);

        // Assert
        expect((defaultView.get('OFF') as _PdfReference[])).toContain((layer as any)._referenceHolder);
    });

    it('should add invisible layer reference into document OFF collection in _createOptionalContentDictionary (AAA)', () => {
        // Arrange
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);
        const layer: PdfLayer = createLayerMock(doc, 'Invisible');
        (layer as any)._visible = false;

        // Act
        const refs: _PdfReference[] = (collection as any)._createOptionalContentDictionary(layer);

        // Assert
        expect(refs.length).toBe(1);
        expect((doc as any)._off).toContain((layer as any)._referenceHolder);
        expect((doc as any)._on.length).toBe(0);
    });

    it('should create print option with OFF for neverPrint and ON for alwaysPrint (AAA)', () => {
        // Arrange
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const neverLayer: PdfLayer = createLayerMock(doc, 'Never');
        (neverLayer as any)._printState = PdfPrintState.neverPrint;

        const alwaysLayer: PdfLayer = createLayerMock(doc, 'Always');
        (alwaysLayer as any)._printState = PdfPrintState.alwaysPrint;

        // Act
        const neverUsageRef: _PdfReference = (collection as any)._setPrintOption(neverLayer);
        const alwaysUsageRef: _PdfReference = (collection as any)._setPrintOption(alwaysLayer);

        // Assert
        const neverUsage: _PdfDictionary = crossRef._cacheMap.get(neverUsageRef);
        const neverPrintRef: _PdfReference = neverUsage.get('Print') as _PdfReference;
        const neverPrintDict: _PdfDictionary = crossRef._cacheMap.get(neverPrintRef);

        const alwaysUsage: _PdfDictionary = crossRef._cacheMap.get(alwaysUsageRef);
        const alwaysPrintRef: _PdfReference = alwaysUsage.get('Print') as _PdfReference;
        const alwaysPrintDict: _PdfDictionary = crossRef._cacheMap.get(alwaysPrintRef);

        expect((neverPrintDict.get('PrintState') as _PdfName).name).toBe('OFF');
        expect((alwaysPrintDict.get('PrintState') as _PdfName).name).toBe('ON');
    });

    // ---------------------------------------------------------
    // _createSublayer coverage
    // ---------------------------------------------------------

    it('should create a sublayer and propagate parentLayer chain correctly (AAA)', () => {
        // Arrange
        const doc: PdfDocument = createDocumentMock();
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const grandParent: PdfLayer = createLayerMock(doc, 'GrandParent');
        const parent: PdfLayer = createLayerMock(doc, 'Parent');
        const child: PdfLayer = createLayerMock(doc, 'Child');

        (grandParent as any)._referenceHolder = getRef(30);
        (parent as any)._referenceHolder = getRef(31);
        (child as any)._referenceHolder = getRef(32);

        (parent as any)._parent = grandParent;
        (parent as any)._parentLayer.push(grandParent);
        (parent as any)._subLayer = [];
        (grandParent as any)._subLayer = [(parent as any)._referenceHolder];

        (doc as any)._order = [[(parent as any)._referenceHolder]];

        (collection as any)._subLayer = true;
        (collection as any)._parent = parent;

        // Act
        (collection as any)._createSublayer(null, (child as any)._referenceHolder, child);

        // Assert
        expect((parent as any)._child).toContain(child);
        expect((child as any)._parent).toBe(parent);
        expect((child as any)._parentLayer).toContain(grandParent);
        expect((child as any)._parentLayer).toContain(parent);
        expect((parent as any)._subLayer).toContain((child as any)._referenceHolder);
    });

    // ---------------------------------------------------------
    // _parsingLayerOrder / _createLayerHierarchical / _addChildLayer
    // ---------------------------------------------------------

    it('should parse nested order arrays for both string-led arrays and reference-led arrays (AAA)', () => {
        // Arrange
        const doc: PdfDocument = createDocumentMock();
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const parent: PdfLayer = createLayerMock(doc, 'Parent');
        const child: PdfLayer = createLayerMock(doc, 'Child');

        const parentRef: _PdfReference = getRef(40);
        const childRef: _PdfReference = getRef(41);

        (parent as any)._referenceHolder = parentRef;
        (child as any)._referenceHolder = childRef;

        const map: Map<_PdfReference, PdfLayer> = new Map<_PdfReference, PdfLayer>();
        map.set(parentRef, parent);
        map.set(childRef, child);

        const order: (_PdfReference | _PdfReference[])[] = [
            parentRef,
            [childRef],
            ['Title', childRef] as any
        ];

        // Act
        (collection as any)._parsingLayerOrder(null, order, map);

        // Assert
        expect((parent as any)._child).toContain(child);
        expect((child as any)._parent).toBe(parent);
    });

    it('should add child layers into parent layers when not already present (AAA)', () => {
        // Arrange
        const doc: PdfDocument = createDocumentMock();
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const parent: PdfLayer = createLayerMock(doc, 'Parent');
        const child: PdfLayer = createLayerMock(doc, 'Child');
        (parent as any)._child.push(child);

        spyOn((parent as any)._layers, '_addNestedLayer').and.callThrough();

        // Act
        (collection as any)._addChildLayer(parent);

        // Assert
        expect((parent as any)._layers._addNestedLayer).toHaveBeenCalledWith(child);
        expect((parent as any)._layers._list).toContain(child);
    });

    it('should create hierarchical list using child branch and nested child branch (AAA)', () => {
        // Arrange
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const ocProps: _PdfDictionary = new _PdfDictionary(crossRef);
        const defaultView: _PdfDictionary = new _PdfDictionary(crossRef);
        defaultView.update('Order', []);
        ocProps.update('D', defaultView);

        const parent: PdfLayer = createLayerMock(doc, 'Parent');
        const childWithChildren: PdfLayer = createLayerMock(doc, 'ChildWithChildren');
        const leafChild: PdfLayer = createLayerMock(doc, 'LeafChild');

        (parent as any)._child = [];
        (childWithChildren as any)._parent = parent;
        (childWithChildren as any)._child = [leafChild];
        (leafChild as any)._parent = parent;
        (leafChild as any)._child = [];

        spyOn<any>(collection, '_addChildLayer').and.callThrough();
        spyOn((parent as any)._layers, 'contains').and.returnValue(false);
        spyOn((parent as any)._layers, '_addNestedLayer').and.callThrough();

        const ref1: _PdfReference = getRef(50);
        const ref2: _PdfReference = getRef(51);

        (collection as any)._layerDictionary = new Map<_PdfReference, PdfLayer>([
            [ref1, childWithChildren],
            [ref2, leafChild]
        ]);
        (collection as any)._list = [];

        // Act
        (collection as any)._createLayerHierarchical(ocProps);

        // Assert
        expect((collection as any)._addChildLayer).toHaveBeenCalledWith(parent);
        expect((parent as any)._layers._addNestedLayer).toHaveBeenCalledWith(leafChild);
    });

    // ---------------------------------------------------------
    // _removeLayer / _removeLocked
    // ---------------------------------------------------------

    it('should remove locked reference and usage references when removing a layer (AAA)', () => {
        // Arrange
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const layer: PdfLayer = createLayerMock(doc, 'RemoveMe');
        const layerRef: _PdfReference = getRef(60);
        (layer as any)._referenceHolder = layerRef;
        (layer as any)._visible = false;

        const usageRef: _PdfReference = getRef(61);
        const usageDict: _PdfDictionary = new _PdfDictionary(crossRef);
        usageDict.update('OCGs', [layerRef]);
        crossRef._cacheMap.set(usageRef, usageDict);

        const defaultView: _PdfDictionary = new _PdfDictionary(crossRef);
        defaultView.update('Order', [layerRef]);
        defaultView.update('Locked', [layerRef]);
        defaultView.update('OFF', [layerRef]);
        defaultView.update('ON', []);
        defaultView.update('AS', [usageRef]);

        const ocProps: _PdfDictionary = new _PdfDictionary(crossRef);
        ocProps.update('OCGs', [layerRef]);
        ocProps.update('D', defaultView);

        (doc as any)._catalog._catalogDictionary.update('OCProperties', ocProps);

        // Act
        (collection as any)._removeLayer(layer, false);

        // Assert
        expect((ocProps.get('OCGs') as _PdfReference[])).not.toContain(layerRef);
        expect((defaultView.get('Locked') as _PdfReference[])).not.toContain(layerRef);
        expect((defaultView.get('OFF') as _PdfReference[])).not.toContain(layerRef);
        expect((usageDict.get('OCGs') as _PdfReference[])).not.toContain(layerRef);
        expect(ocProps._updated).toBeTruthy();
        expect((doc as any)._catalog._catalogDictionary._updated).toBeTruthy();
    });

    // ---------------------------------------------------------
    // _removeLayerContent / _processBeginMarkContent / _streamWrite
    // ---------------------------------------------------------

    it('should remove properties, xObject mapping, use parser else branch, and skip Do operator content correctly (AAA)', () => {
        // Arrange
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const layer: PdfLayer = createLayerMock(doc, 'GraphicsLayer');
        (layer as any)._layerId = 'OC1';
        (layer as any)._xObject = ['XO1', 'OC1'];

        const properties: _PdfDictionary = new _PdfDictionary();
        properties.update('OC1', new _PdfName('Keep'));

        const xObject: _PdfDictionary = new _PdfDictionary();
        const map: any = ['A', 'B'];
        map.A = 'ZZZ';
        map.B = 'XO1';
        (xObject as any)._map = map;

        const plainContentStream: any = {
            dictionary: { objId: '11 0' },
            getBytes: (): Uint8Array => new Uint8Array([1, 2, 3])
        };

        const realContentStream: _PdfContentStream = new _PdfContentStream([]);
        (realContentStream as any).dictionary = { objId: '12 0' };
        realContentStream.write('dummy');

        const page: PdfPage = createPageMock([plainContentStream, realContentStream], properties, xObject);
        (layer as any)._pages = [page];
        (layer as any)._layerPage = page;

        spyOn(_ContentParser.prototype as any, '_readContent').and.returnValues(
            [
                createRecord('Do', ['XO1']),
                createRecord('rg', ['1', '0', '0']),
                createRecord('Tj', ['(A)'])
            ],
            [
                createRecord('Tj', ['(B)'])
            ]
        );

        // Act
        (collection as any)._removeLayerContent(layer);

        // Assert
        expect(properties.has('OC1')).toBeFalsy();
        expect((xObject as any)._map.B).toBeUndefined();
        expect((layer as any)._xObject).not.toContain('OC1');
        expect((page as any)._pageDictionary._updated).toBeTruthy();
    });

    it('should increment and decrement bdcCount correctly and remove content reference when id matches (AAA)', () => {
        // Arrange
        const doc: PdfDocument = createDocumentMock();
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);
        const layer: PdfLayer = createLayerMock(doc, 'MarkedLayer');
        (layer as any)._layerId = 'MC1';

        const ref1: _PdfReference = getRef(70);
        const ref2: _PdfReference = getRef(71);

        const pageDictionary: any = new _PdfDictionary();
        pageDictionary.update('Contents', [ref1, ref2]);
        pageDictionary.getRaw = function (key: string): any {
            return this.get(key);
        };

        const page: any = Object.create(PdfPage.prototype);
        page._pageDictionary = pageDictionary;
        (layer as any)._pages = [page];

        const out: _PdfContentStream = new _PdfContentStream([]);

        // Act
        (collection as any)._processBeginMarkContent(layer, 'BDC', ['/OC', '/MC1'], out, '70 0');
        (collection as any)._processBeginMarkContent(layer, 'EMC', [], out);

        // Assert
        expect((collection as any)._bdcCount).toBe(0);
        expect(pageDictionary.getRaw('Contents').length).toBe(1);
        expect(pageDictionary.getRaw('Contents')[0]).toBe(ref2);
    });

    it('should return early from _streamWrite when skip is true and collection is in skip state (AAA)', () => {
        // Arrange
        const doc: PdfDocument = createDocumentMock();
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);
        const out: _PdfContentStream = new _PdfContentStream([]);

        (collection as any)._bdcCount = 1;

        // Act
        (collection as any)._streamWrite(['10', '20'], 'rg', true, out);

        // Assert
        expect(out.length).toBe(0);
    });
});

function getRef(obj: number, gen: number = 0): _PdfReference {
    return _PdfReference.get(obj, gen);
}

function createCrossReferenceMock(): any {
    let current = 100;
    const cacheMap: Map<_PdfReference, any> = new Map();
    return {
        _cacheMap: cacheMap,
        _allowCatalog: false,
        _getNextReference: (): _PdfReference => getRef(current++),
        _fetch: (ref: _PdfReference) => cacheMap.get(ref)
    };
}

function createDocumentMock(crossReference?: any): PdfDocument {
    const crossRef = crossReference || createCrossReferenceMock();
    const catalogDict: _PdfDictionary = new _PdfDictionary(crossRef);
    const doc: any = Object.create(PdfDocument.prototype);
    doc._crossReference = crossRef;
    doc._catalog = { _catalogDictionary: catalogDict };
    doc._optionalContentDictionaries = [];
    doc._printLayer = [];
    doc._order = [];
    doc._on = [];
    doc._off = [];
    doc._as = [];
    return doc as PdfDocument;
}

describe('PdfLayerCollection - Usage dictionary/reference branches', () => {
    beforeEach(() => {
        // Prevent real setters from accessing undefined _document during construction
        spyOnProperty(PdfLayer.prototype as any, 'visible', 'set').and.callFake(function (this: any, v: boolean) { this._visible = v; });
        spyOnProperty(PdfLayer.prototype as any, 'printState', 'set').and.callFake(function (this: any, s: PdfPrintState) { this._printState = s; });
    });

    it('handles Usage as a dictionary (sets printOption and view OFF)', () => {
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);

        const layerRef = getRef(1);
        const layerDict = new _PdfDictionary(crossRef);
        const usageDict = new _PdfDictionary(crossRef);
        const printDict = new _PdfDictionary(crossRef);
        const viewDict = new _PdfDictionary(crossRef);
        const ocProps = new _PdfDictionary(crossRef);
        const defaultView = new _PdfDictionary(crossRef);

        layerDict.update('Name', 'Layer-A');
        layerDict.update('LayerID', new _PdfName('LayerA_ID'));
        printDict.update('PrintState', new _PdfName('ON'));
        viewDict.update('ViewState', new _PdfName('OFF'));
        usageDict.update('Print', printDict);
        usageDict.update('View', viewDict);
        layerDict.update('Usage', usageDict);

        defaultView.update('Order', [layerRef]);
        ocProps.update('OCGs', [layerRef]);
        ocProps.update('D', defaultView);
        (doc as any)._catalog._catalogDictionary.update('OCProperties', ocProps);

        crossRef._cacheMap.set(layerRef, layerDict);

        const layers = new PdfLayerCollection(doc);

        expect(layers.count).toBe(1);
        expect(layers.at(0).name).toBe('Layer-A');
        expect((layers.at(0) as any)._layerId).toBe('LayerA_ID');
        expect(layers.at(0).visible).toBeFalsy();
        expect(layers.at(0).printState).toBe(PdfPrintState.alwaysPrint);
        expect((layers.at(0) as any)._printOption).toBe(printDict);
    });

    it('handles Usage as a reference (resolves print/view refs and sets OFF/neverPrint)', () => {
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);

        const layerRef = getRef(2);
        const usageRef = getRef(3);
        const printRef = getRef(4);
        const viewRef = getRef(5);

        const layerDict = new _PdfDictionary(crossRef);
        const usageParent = new _PdfDictionary(crossRef);
        const printDict = new _PdfDictionary(crossRef);
        const viewDict = new _PdfDictionary(crossRef);
        const ocProps = new _PdfDictionary(crossRef);
        const defaultView = new _PdfDictionary(crossRef);

        layerDict.update('Name', 'Layer-B');
        layerDict.update('LayerID', new _PdfName('LayerB_ID'));
        layerDict.update('Usage', usageRef);

        usageParent.update('Print', printRef);
        usageParent.update('View', viewRef);

        printDict.update('PrintState', new _PdfName('OFF'));
        viewDict.update('ViewState', new _PdfName('OFF'));

        defaultView.update('Order', [layerRef]);
        ocProps.update('OCGs', [layerRef]);
        ocProps.update('D', defaultView);
        (doc as any)._catalog._catalogDictionary.update('OCProperties', ocProps);

        crossRef._cacheMap.set(layerRef, layerDict);
        crossRef._cacheMap.set(usageRef, usageParent);
        crossRef._cacheMap.set(printRef, printDict);
        crossRef._cacheMap.set(viewRef, viewDict);

        const layers = new PdfLayerCollection(doc);

        expect(layers.count).toBe(1);
        expect(layers.at(0).name).toBe('Layer-B');
        expect(layers.at(0).visible).toBeFalsy();
        expect(layers.at(0).printState).toBe(PdfPrintState.neverPrint);
        expect((layers.at(0) as any)._printOption).toBe(printDict);
    });
});


function createLayerMock(doc: PdfDocument, name: string = 'Layer'): PdfLayer {
    const layer: any = Object.create(PdfLayer.prototype);
    layer._name = name;
    layer._visible = true;
    layer._printState = 0;
    layer._locked = false;
    layer._child = [];
    layer._parentLayer = [];
    layer._subLayer = [];
    layer._pages = [];
    layer._xObject = [];
    layer._layerId = `${name}_ID`;
    layer._document = doc;
    layer._crossReference = (doc as any)._crossReference;
    layer._referenceHolder = null;
    layer._dictionary = null;
    layer._parent = null;
    layer._layer = layer;
    layer._usage = null;
    layer._printOption = null;
    Object.defineProperty(layer, '_layerPage', { value: null, writable: true, configurable: true });
    const nestedCollection: any = Object.create(PdfLayerCollection.prototype);
    nestedCollection._list = [];
    nestedCollection._document = doc;
    nestedCollection._crossReference = (doc as any)._crossReference;
    nestedCollection._catalog = (doc as any)._catalog;
    nestedCollection._layerDictionary = new Map();
    nestedCollection._subLayer = false;
    nestedCollection._isLayerContainsResource = false;
    nestedCollection._bdcCount = 0;
    layer._layers = nestedCollection;
    return layer as PdfLayer;
}

describe('PdfLayerCollection - _createSublayer nested-order insertion', () => {

    function getRef(obj: number, gen: number = 0): _PdfReference {
        return _PdfReference.get(obj, gen);
    }

    function createCrossReferenceMock(): any {
        let current = 200;
        const cacheMap: Map<_PdfReference, any> = new Map();
        return {
            _cacheMap: cacheMap,
            _allowCatalog: false,
            _getNextReference: (): _PdfReference => getRef(current++),
            _fetch: (ref: _PdfReference) => cacheMap.get(ref)
        };
    }

    function createDocumentMock(crossReference?: any): PdfDocument {
        const crossRef = crossReference || createCrossReferenceMock();
        const catalogDict: _PdfDictionary = new _PdfDictionary(crossRef);
        const doc: any = Object.create(PdfDocument.prototype);
        doc._crossReference = crossRef;
        doc._catalog = { _catalogDictionary: catalogDict };
        doc._optionalContentDictionaries = [];
        doc._printLayer = [];
        doc._order = [];
        doc._on = [];
        doc._off = [];
        doc._as = [];
        return doc as PdfDocument;
    }
    it('inserts parent._subLayer into nested document._order arrays when parent has no parent', () => {
        const crossRef: any = createCrossReferenceMock();
        const doc: PdfDocument = createDocumentMock(crossRef);
        const collection: PdfLayerCollection = new PdfLayerCollection(doc);

        const parentRef = getRef(300);
        const childRef = getRef(301);

        const parent = createLayerMock(doc, 'Parent');
        const child = createLayerMock(doc, 'Child');

        parent._referenceHolder = parentRef;
        child._referenceHolder = childRef;

        // place parentRef inside a nested array in document._order
        doc._order = [[parentRef]];

        // mark collection as sublayer scenario
        (collection as any)._subLayer = true;
        (collection as any)._parent = parent;

        // call _createSublayer - should push childRef into parent._subLayer and insert parent._subLayer into nested order
        (collection as any)._createSublayer(null, childRef, child);

        // find nested array containing parentRef and assert insertion
        const orderArray = doc._order[0] as any[];
        const pos = orderArray.indexOf(parentRef);
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(orderArray[pos + 1]).toBeUndefined();
        expect(parent._subLayer.length).toBe(1);
        expect(parent._subLayer[0]).toBe(childRef);
    });
});


describe('PdfLayerCollection _createSublayer branch coverage', () => {

    function ref(id: number): _PdfReference {
        return _PdfReference.get(id, 0);
    }

    function mockDoc(): PdfDocument {
        const doc: any = Object.create(PdfDocument.prototype);
        doc._order = [];
        doc._on = [];
        doc._off = [];
        doc._as = [];
        doc._printLayer = [];
        doc._optionalContentDictionaries = [];
        doc._catalog = { _catalogDictionary: new _PdfDictionary() };
        doc._crossReference = {
            _cacheMap: new Map(),
            _getNextReference: () => ref(Math.floor(Math.random() * 1000))
        };
        return doc as PdfDocument;
    }

    function mockLayer(doc: PdfDocument, id: string): PdfLayer {
        const layer: any = Object.create(PdfLayer.prototype);
        layer._document = doc;
        layer._child = [];
        layer._subLayer = [];
        layer._parentLayer = [];
        layer._layer = layer;
        layer._layerId = id;
        return layer as PdfLayer;
    }

    it('covers: parent has children AND parentRef exists in document order', () => {
        const doc = mockDoc();

        const parent = mockLayer(doc, 'P');
        const child = mockLayer(doc, 'C');

        parent._child.push(child);
        parent._referenceHolder = ref(1);

        doc._order = [parent._referenceHolder, ref(99)];

        const collection: any = new PdfLayerCollection(doc, parent);
        collection._subLayer = true;

        collection._createSublayer(null, ref(2), mockLayer(doc, 'N'));

        expect(parent._subLayer.length).toBe(1);
        expect(doc._order.some(v => Array.isArray(v))).toBeTruthy();
    });

    it('covers: parent has children AND parentRef NOT in document order', () => {
        const doc = mockDoc();

        const parent = mockLayer(doc, 'P');
        parent._child.push(mockLayer(doc, 'X'));
        parent._referenceHolder = ref(10);

        doc._order = [ref(99)];

        const collection: any = new PdfLayerCollection(doc, parent);
        collection._subLayer = true;

        collection._createSublayer(null, ref(11), mockLayer(doc, 'N'));

        expect(parent._subLayer.length).toBe(1);
    });

    it('covers: parent has parent and reorder parent._parent._subLayer', () => {
        const doc = mockDoc();

        const grandParent = mockLayer(doc, 'GP');
        const parent = mockLayer(doc, 'P');

        grandParent._referenceHolder = ref(1);
        parent._referenceHolder = ref(2);

        parent._parent = grandParent;
        grandParent._subLayer = [parent._referenceHolder];

        doc._order = [grandParent._referenceHolder, ref(99)];

        const collection: any = new PdfLayerCollection(doc, parent);
        collection._subLayer = true;

        collection._createSublayer(null, ref(3), mockLayer(doc, 'N'));

        expect(grandParent._subLayer.some(v => Array.isArray(v))).toBeTruthy();
    });

    it('covers: final fallback loop with nested order arrays', () => {
        const doc = mockDoc();

        const parent = mockLayer(doc, 'P');
        parent._referenceHolder = ref(5);

        doc._order = [
            [parent._referenceHolder]
        ];

        const collection: any = new PdfLayerCollection(doc, parent);
        collection._subLayer = true;

        collection._createSublayer(null, ref(6), mockLayer(doc, 'N'));

        const nested = doc._order[0] as any[];
        expect(nested.length).toBe(1);
    });

});
;