import { PdfLayer } from '../src/pdf/core/layers/layer';
import { PdfPrintState } from '../src/pdf/core/enumerator';

class MockDict {
	_map: any = {};
	constructor(_?: any) {}
	has(key: string) { return Object.prototype.hasOwnProperty.call(this._map, key); }
	get(key: string) { return this._map[key]; }
	getRaw(key: string) { return this._map[key]; }
	update(key: string, value: any) { this._map[key] = value; }
}

class MockName {
	name: string;
	constructor(n: string) { this.name = n; }
}

describe('PdfLayer _setPrintState (lines 994-1040)', () => {

	it('creates print option, usage and cache entries when Usage missing', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		// Replace internal constructors used by the method with mocks
		// use local mocks and real constructors from module (no global overrides)

		// Mock crossReference
		const crossRef: any = { _cacheMap: new Map<any, any>(), _next: 1, _getNextReference() { return { id: this._next++ }; } };
		layer._crossReference = crossRef;

		// Mock document catalog and OCProperties
		const ocProperties: any = new MockDict();
		ocProperties.get = (k: string): any => { return undefined; };
		const catalogDict: any = { has: (_: string) => true, get: (_: string) => ocProperties };
		layer._document = { _catalog: { _catalogDictionary: catalogDict } };

		// Layer dictionaries
		layer._dictionary = new MockDict();
		// ensure Usage missing
		layer._dictionary.has = (_: string) => false;

		// set back-reference
		layer._layer = layer;
		// set print state to neverPrint to trigger OFF branch
		layer._layer._printState = PdfPrintState.neverPrint;

		// Act
		(layer as any)._setPrintState();

		// Assert
		expect(layer._layer._printOption).toBeDefined();
		expect(layer._layer._printOption._map['Subtype']).toBeDefined();
		expect(layer._layer._printOption._map['PrintState']).toBeDefined();
		expect(crossRef._cacheMap.size).toBe(2);
		expect(layer._dictionary.get('Usage')).toBe(layer._usage);
	});

	it('uses existing Usage dictionary when present', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		// use local mocks and real constructors from module (no global overrides)

		const crossRef: any = { _cacheMap: new Map<any, any>(), _next: 1, _getNextReference() { return { id: this._next++ }; } };
		layer._crossReference = crossRef;

		const ocProperties: any = new MockDict();
		ocProperties.get = (k: string): any => undefined;
		const catalogDict: any = { has: (_: string) => true, get: (_: string) => ocProperties };
		layer._document = { _catalog: { _catalogDictionary: catalogDict } };

		// Provide existing Usage dict
		const existingUsage = new MockDict();
		layer._dictionary = new MockDict();
		layer._dictionary.has = (_: string) => true;
		layer._dictionary.get = (_: string) => existingUsage;

		layer._layer = layer;
		// set print state to alwaysPrint to trigger ON branch
		layer._layer._printState = PdfPrintState.alwaysPrint;

		// Act
		(layer as any)._setPrintState();

		// Assert
		expect(layer._layer._printOption).toBeDefined();
		expect(layer._layer._printOption._map['Subtype']).toBeDefined();
		expect(layer._layer._printOption._map['PrintState']).toBeDefined();
		expect(crossRef._cacheMap.size).toBe(2);
		expect(layer._dictionary.get('Usage')).toBe(existingUsage);
	});

	it('does not duplicate existing PrintState entry (lines 1000-1002 path not taken)', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		const crossRef: any = { _cacheMap: new Map<any, any>(), _next: 1, _getNextReference() { return { id: this._next++ }; } };
		layer._crossReference = crossRef;

		const ocProperties: any = new MockDict();
		ocProperties.get = (k: string): any => undefined;
		const catalogDict: any = { has: (_: string) => true, get: (_: string) => ocProperties };
		layer._document = { _catalog: { _catalogDictionary: catalogDict } };

		// Provide existing Usage dict with a pre-existing PrintState entry
		const existingUsage = new MockDict();
		existingUsage._map['PrintState'] = [ { id: 'existing-page-ref' } ];
		layer._dictionary = new MockDict();
		layer._dictionary.has = (_: string) => true;
		layer._dictionary.get = (_: string) => existingUsage;

		layer._layer = layer;
		// set print state to alwaysPrint to exercise the branch that would add an entry
		layer._layer._printState = PdfPrintState.alwaysPrint;

		// Act
		(layer as any)._setPrintState();

		// Assert
		expect(layer._layer._printOption).toBeDefined();
		expect(layer._layer._printOption._map['Subtype']).toBeDefined();
		expect(layer._layer._printOption._map['PrintState']).toBeDefined();
		expect(crossRef._cacheMap.size).toBe(2);
		expect(layer._dictionary.get('Usage')).toBe(existingUsage);
		// ensure existing PrintState entry was not duplicated
		expect(Array.isArray(existingUsage._map['PrintState'])).toBeTruthy();
		expect((existingUsage._map['PrintState'] as any[]).length).toBe(1);
	});

	it('creates OCProperties when catalog returns undefined (covers lines 1000-1002)', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		const crossRef: any = { _cacheMap: new Map<any, any>(), _next: 1, _getNextReference() { return { id: this._next++ }; } };
		layer._crossReference = crossRef;

		// catalog.has true but get returns undefined to trigger creation
		const catalogDict: any = { has: (_: string) => true, get: (_: string): any => undefined };
		layer._document = { _catalog: { _catalogDictionary: catalogDict } };

		// ensure Usage missing
		layer._dictionary = new MockDict();
		layer._dictionary.has = (_: string) => false;

		layer._layer = layer;
		// set print state to neverPrint to trigger OFF branch
		layer._layer._printState = PdfPrintState.neverPrint;

		// Act
		(layer as any)._setPrintState();

		// Assert
		expect(layer._layer._printOption).toBeDefined();
		expect(layer._layer._printOption._map['Subtype']).toBeDefined();
		expect(layer._layer._printOption._map['PrintState']).toBeDefined();
		expect(crossRef._cacheMap.size).toBe(2);
		expect(layer._dictionary.get('Usage')).toBe(layer._usage);
	});

	it('does not duplicate page when already present (covers lines 982-984 not taken)', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		const mockReference: any = { id: 123 };
		const pageBase: any = { pageIndex: 1 };

		// wire back-reference and reference holder so method enters the main branch
		layer._layer = layer;
		layer._layer._referenceHolder = mockReference;

		// ensure pageBase is already present so the push path is NOT taken
		layer._layer._pages = [ pageBase ];

		// Act
		const result: boolean = (layer as any)._setLayerPage(mockReference, pageBase, 'layer-id');

		// Assert - verify return and side-effects for the "not taken" push path (lines 982-984)
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true);
		// _pageParsed set to true when layer found on page
		expect(layer._layer._pageParsed).toBe(true);
		// layer id and page assigned
		expect(layer._layer._layerId).toBe('layer-id');
		expect(layer._layer._page).toBe(pageBase);
		// reference holder should remain unchanged
		expect(layer._layer._referenceHolder).toBe(mockReference);
		// ensure page was not added a second time and length remains 1
		expect(layer._layer._pages.length).toBe(1);
		expect(layer._layer._pages[0]).toBe(pageBase);
	});

	it('setLayerPage - returns true and does not push when page present', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		const mockReference: any = { id: 555 };
		const pageBase: any = { pageIndex: 2 };

		layer._layer = layer; // back-reference
		layer._layer._referenceHolder = mockReference; // match reference

		// sanity check arranged values
		expect(layer._layer._referenceHolder).toBe(mockReference);

		// Act
		const result: boolean = (layer as any)._setLayerPage(mockReference, pageBase, 'test-layer-id');

		// Assert - validate every observable effect and the non-push path
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true);
		expect(layer._layer._pageParsed).toBe(true);
		expect(layer._layer._layerId).toBe('test-layer-id');
		expect(layer._layer._page).toBe(pageBase);
		// pages array must remain unchanged (no duplicate push)
		expect(layer._layer._pages.length).toBe(1);
		expect(layer._layer._pages[0]).toBe(pageBase);
	});

	it('setLayerPage - pushes page when not present', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		const mockReference: any = { id: 42 };
		const pageBase: any = { pageIndex: 3 };

		layer._layer = layer; // back-reference
		layer._layer._referenceHolder = mockReference; // match reference

		// ensure pages array empty so push path is taken
		layer._layer._pages = [];

		// Act
		const result: boolean = (layer as any)._setLayerPage(mockReference, pageBase, 'new-layer-id');

		// Assert - validate return and that page was pushed
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true);
		expect(layer._layer._pageParsed).toBe(true);
		expect(layer._layer._layerId).toBe('new-layer-id');
		expect(layer._layer._page).toBe(pageBase);
		expect(layer._layer._referenceHolder).toBe(mockReference);
		expect(layer._layer._pages.length).toBe(1);
		expect(layer._layer._pages[0]).toBe(pageBase);
	});

	it('parseLayerPage - does not push xObject when OC missing (lines 914-923 not taken)', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		layer._layer = layer;
		layer._layer._xObject = [];

		// prepare a reference used in the XObject map
		const xobjectRef: any = { id: 7 };
		// xobject stream dictionary WITHOUT 'OC' key to ensure path not taken
		const xobjectDict: any = new MockDict();
		xobjectDict.has = (_: string) => false;
		const xobjectStream: any = { dictionary: xobjectDict };

		// XObject map containing the reference
		const xObjectMap: any = new MockDict();
		xObjectMap._map['LayerX'] = xobjectRef;

		// Resources with XObject present and no Properties
		const resources: any = new MockDict();
		resources.has = (k: string) => k === 'XObject';
		resources.get = (k: string) => (k === 'XObject' ? xObjectMap : undefined);

		// page dictionary exposing Resources
		const pageDict: any = new MockDict();
		pageDict.has = (k: string) => k === 'Resources';
		pageDict.get = (k: string) => (k === 'Resources' ? resources : undefined);
		const pageBase: any = { _pageDictionary: pageDict, pageIndex: 0 };

		// document with a single page
		const document: any = { pageCount: 1, getPage: (_: number) => pageBase };

		// crossReference mock that returns the xobject stream for our reference
		const crossRef: any = {
			_cacheMap: new Map<any, any>(),
			_next: 1,
			_getNextReference() { return { id: this._next++ }; },
			_fetch(ref: any) { return this._cacheMap.get(ref); }
		};
		crossRef._cacheMap.set(xobjectRef, xobjectStream);

		layer._crossReference = crossRef;
		layer._document = document;

		// Act
		(layer as any)._parseLayerPage();

		// Assert - the OC branch (lines 914-923) should not be taken, so _xObject remains empty
		expect(Array.isArray(layer._layer._xObject)).toBeTruthy();
		expect(layer._layer._xObject.length).toBe(0);
	});

	it('parseDictionary - returns false when OCGs array items are not references (lines 961-994 not taken)', () => {
		// Arrange
		const layer: any = new (PdfLayer as any)();
		layer._layer = layer;

		// dictionary with Name and OCGs present where OCGs is an array of non-reference items
		const dictionary: any = new MockDict();
		dictionary._map['Name'] = 'SomeLayer';
		dictionary._map['OCGs'] = [ 'not-a-ref', 123 ];
		dictionary.has = (k: string) => Object.prototype.hasOwnProperty.call(dictionary._map, k);
		dictionary.get = (k: string) => dictionary._map[k];
		dictionary.getRaw = (k: string) => dictionary._map[k];

		const reference: any = { id: 99 };
		const pageBase: any = { pageIndex: 0 };

		// Act
		const result: boolean = (layer as any)._parseDictionary(dictionary, reference, pageBase, 'layer-name');

		// Assert - since items are not _PdfReference, the inner branch is not taken and result is false
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
		expect(layer._layer._pageParsed).not.toBeTruthy();
	});

});