import { PdfField, PdfTextBoxField } from "../src/pdf/core/form/field";
import { _PdfName, _PdfReference, _PdfDictionary } from "../src/pdf/core/pdf-primitives";
import { PdfTrueTypeFont } from "../src/pdf/core/fonts/pdf-standard-font";
import { _FieldFlag, _PdfCheckFieldState, PdfBorderStyle, PdfRotationAngle, PdfTextAlignment } from "../src/pdf/core/enumerator";

describe('PdfField page getter coverage', () => {

	it('getValue throws when dictionary has key but value is invalid type', () => {
		// Arrange
		const dict: any = { has: (_: string) => true, get: (_: string) => 123 };
		const field: any = Object.create(PdfTextBoxField.prototype);
		field._dictionary = dict;

		// Act & Assert
		expect(() => field.getValue('X')).toThrowError('PdfException: X is not found');
	});

	it('getValue throws when key not present in dictionary', () => {
		// Arrange
		const dict: any = { has: (_: string) => false };
		const field: any = Object.create(PdfTextBoxField.prototype);
		field._dictionary = dict;

		// Act & Assert
		expect(() => field.getValue('Missing')).toThrowError('PdfException: Missing is not found');
	});

	it('page getter returns undefined when no document/crossReference present (loop not entered)', () => {
		// Arrange
		const field: any = new PdfTextBoxField();
		field._page = undefined;
		field._dictionary = { has: (_: string) => false };
		field._crossReference = undefined; // no document -> inner branch skipped
		field._kids = undefined;

		// Act
		const result = field.page;

		// Assert
		expect(result).toBeUndefined();
	});

	it('page getter returns undefined when document exists but no widget/_ref and no kids (loop not entered)', () => {
		// Arrange
		const fakeDocument: any = { pageCount: 0, getPage: (_: number): any => undefined };
		const field: any = new PdfTextBoxField();
		field._page = undefined;
		field._dictionary = { has: (_: string) => false };
		field._crossReference = { _document: fakeDocument };
		field._ref = undefined;
		field._kids = [];

		// Act
		const result = field.page;

		// Assert
		expect(result).toBeUndefined();
	});

    it('page getter returns undefined when document exists but no widget/_ref and few kids (loop entered)', () => {
		// Arrange
		const fakeDocument: any = { pageCount: 0, getPage: (_: number): any => undefined };
		const field: any = Object.create(PdfField.prototype);
		field._page = undefined;
		field._dictionary = { has: (_: string) => false };
		field._crossReference = { _document: fakeDocument };
		field._ref = undefined;
		field._kids = ['k1', 'k2'];

		// Act
		const result = field.page;

		// Assert
		expect(field._kids.length).toBe(2);
	});

	it('page getter returns stored page when _page already set (outer if not entered)', () => {
		// Arrange
		const storedPage: any = { id: 'stored' };
		const fakeDocument: any = { pageCount: 0 };
		const field: any = Object.create(PdfField.prototype);
		field._page = storedPage; // pre-set page should skip kid search
		field._dictionary = { has: (_: string) => false };
		field._crossReference = { _document: fakeDocument };
		field._ref = undefined;
		field._kids = ['k1'];

		// Act
		const result = field.page;

		// Assert
		expect(result).toBe(storedPage);
		expect(field._kids.length).toBe(1);
	});

	it('removeItemAt leaves _parsedItems empty when it was empty (no reindex)', () => {
		// Arrange
		const dict: any = { has: (_: string) => true, set: (_: string, v: any) => { dict._last = v; }, _updated: false };
		const field: any = Object.create(PdfField.prototype);
		field._dictionary = dict;
		field._kids = ['kid0', 'kid1'];
		field._parsedItems = new Map<number, any>();
		field.itemAt = (_: number) => ({ _ref: {}, _getPage: (): any => undefined });

		// Act
		field.removeItemAt(0);

		// Assert
		expect(field._parsedItems.size).toBe(0);
		expect(field._kids.length).toBe(1);
		expect(field._dictionary._updated).toBe(true);
	});

	it('removeItemAt reindexes _parsedItems shifting keys > index down by 1', () => {
		// Arrange
		const dict: any = { has: (_: string) => true, set: (_: string, v: any) => { dict._last = v; }, _updated: false };
		const field: any = Object.create(PdfField.prototype);
		field._dictionary = dict;
		field._kids = ['k0', 'k1', 'k2', 'k3'];
		const v0 = { id: 'v0' };
		const v2 = { id: 'v2' };
		const v3 = { id: 'v3' };
		field._parsedItems = new Map<number, any>([[0, v0], [2, v2], [3, v3]]);
		field.itemAt = (_: number) => ({ _ref: {}, _getPage: (): any => undefined });

		// Act
		field.removeItemAt(2);

		// Assert
		expect(field._parsedItems.size).toBe(2);
		expect(field._parsedItems.has(0)).toBe(true);
		expect(field._parsedItems.get(0)).toBe(v0);
		expect(field._parsedItems.has(2)).toBe(true);
		expect(field._parsedItems.get(2)).toBe(v3);
		expect(field._kids).toEqual(['k0', 'k1', 'k3']);
		expect(field._dictionary._updated).toBe(true);
	});

	it('initializeFont uses crossReference._fetch when Font is a reference', () => {
		// Arrange
		const field: any = new PdfTextBoxField();
		const pdfRef = new _PdfReference(1, 0);
		const resource = new _PdfDictionary();
		resource.set('Font', pdfRef);
		const fontDict = new _PdfDictionary();
		const formDictObj: any = { has: (_: string) => true, get: (_: string) => resource, update: (_: string, v: any) => { formDictObj._updated = true; }, _updated: false };
		const fakeDocument: any = { form: { _dictionary: formDictObj } };
		field._crossReference = { _document: fakeDocument, _fetch: jasmine.createSpy('_fetch').and.returnValue(fontDict), _getNextReference: () => new _PdfReference(99, 0), _cacheMap: new Map() };
		const font: any = { _key: null, _reference: null, _size: 12, _dictionary: undefined };
		field._dictionary = new _PdfDictionary();

		// Act
		field._initializeFont(font);

		// Assert
		expect(field._font).toBe(font);
		expect(field._crossReference._fetch).toHaveBeenCalledWith(pdfRef);
		expect(resource._updated).toBe(true);
	});

	it('initializeFont assigns fontDict when Font is a dictionary', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		const dictObj = new _PdfDictionary();
		const resource = new _PdfDictionary();
		resource.set('Font', dictObj);
		const formDictObj: any = { has: (_: string) => true, get: (_: string) => resource, update: (_: string, v: any) => { formDictObj._updated = true; }, _updated: false };
		const fakeDocument: any = { form: { _dictionary: formDictObj } };
		const mockFetch = jasmine.createSpy('mockFetch');
		field._crossReference = { _document: fakeDocument, _fetch: mockFetch, _getNextReference: () => new _PdfReference(99, 0), _cacheMap: new Map() };
		const font: any = { _key: null, _reference: null, _size: 10 };
		field._dictionary = new _PdfDictionary();

		// Act
		field._initializeFont(font);

		// Assert
		expect(field._font).toBe(font);
		expect(mockFetch).not.toHaveBeenCalled();
		expect(field._fontName).toBeDefined();
	});

	it('initializeFont creates new Font dict when Font is primitive', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		const resource = new _PdfDictionary();
		resource.set('Font', 123);
		const formDictObj: any = { has: (_: string) => true, get: (_: string) => resource, update: (_: string, v: any) => { formDictObj._updated = true; }, _updated: false };
		const fakeDocument: any = { form: { _dictionary: formDictObj } };
		const mockFetch = jasmine.createSpy('mockFetch');
		field._crossReference = { _document: fakeDocument, _fetch: mockFetch, _getNextReference: () => new _PdfReference(99, 0), _cacheMap: new Map() };
		const font: any = { _key: null, _reference: null, _size: 9 };
		field._dictionary = new _PdfDictionary();

		// Act
		field._initializeFont(font);

		// Assert
		expect(field._font).toBe(font);
		expect(mockFetch).not.toHaveBeenCalled();
		expect(resource.getRaw('Font') instanceof _PdfDictionary).toBe(true);
		expect(resource._updated).toBe(true);
	});

	it('initializeFont caches internals and sets reference for TrueType fonts', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		const pdfRef = new _PdfReference(1, 0);
		const resource = new _PdfDictionary();
		resource.set('Font', pdfRef);
		const fontDict = new _PdfDictionary();
		const fakeDocument: any = { form: { _dictionary: { has: (_: string) => true, get: (_: string) => resource, update: (_: string, v: any) => {}, _updated: false } } };
		const nextRef = new _PdfReference(99, 0);
		const cache = new Map();
		field._crossReference = { _document: fakeDocument, _fetch: jasmine.createSpy('_fetch').and.returnValue(fontDict), _getNextReference: () => nextRef, _cacheMap: cache };
		// create a fake PdfTrueTypeFont instance (instanceof must pass)
		const trueTypeFont: any = Object.create(PdfTrueTypeFont.prototype);
		trueTypeFont._pdfFontInternals = { intern: 'data' };
		trueTypeFont._reference = null;

		field._dictionary = new _PdfDictionary();

		// Act
		field._initializeFont(trueTypeFont);

		// Assert
		expect(field._font).toBe(trueTypeFont);
		expect(field._crossReference._cacheMap.get(nextRef)).toBe(trueTypeFont._pdfFontInternals);
		expect(trueTypeFont._reference).toBe(nextRef);
		expect(resource._updated).toBe(true);
		expect((fakeDocument.form._dictionary as any)._updated).toBe(true);
		expect(field._fontName).toBeDefined();
	});

	it('initializeFont does not update field DA when no Kids or Subtype and isReference false', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		const resource = new _PdfDictionary();
		resource.set('Font', new _PdfDictionary()); // not a reference -> isReference = false
		const formDict = new _PdfDictionary();
		formDict.set('DR', resource);
		const fakeDocument: any = { form: { _dictionary: formDict } };
		const mockFetch = jasmine.createSpy('mockFetch');
		field._crossReference = { _document: fakeDocument, _fetch: mockFetch, _getNextReference: () => new _PdfReference(99, 0), _cacheMap: new Map() };
		const font: any = { _key: null, _reference: null, _size: 11 };
		field._dictionary = { has: (_: string) => false, update: jasmine.createSpy('update') };

		// Act
		field._initializeFont(font);

		// Assert
		expect(field._dictionary.update).not.toHaveBeenCalled();
		expect(resource._updated).toBe(true);
	});

	it('initializeFont does not update field DA when no Kids or Subtype and isReference true', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		const pdfRef = new _PdfReference(5, 0);
		const resource = new _PdfDictionary();
		resource.set('Font', pdfRef); // reference -> isReference = true
		const fontDict = new _PdfDictionary();
		const formDict = new _PdfDictionary();
		formDict.set('DR', resource);
		const fakeDocument: any = { form: { _dictionary: formDict } };
		field._crossReference = { _document: fakeDocument, _fetch: jasmine.createSpy('_fetch').and.returnValue(fontDict), _getNextReference: () => new _PdfReference(99, 0), _cacheMap: new Map() };
		const font: any = { _key: null, _reference: null, _size: 13 };
		field._dictionary = { has: (_: string) => false, update: jasmine.createSpy('update') };

		// Act
		field._initializeFont(font);

		// Assert
		expect(field._dictionary.update).not.toHaveBeenCalled();
		expect(field._crossReference._fetch).toHaveBeenCalledWith(pdfRef);
		expect(resource._updated).toBe(true);
	});

	it('initializeFont updates DA when Subtype is Widget', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		const resource = new _PdfDictionary();
		resource.set('Font', new _PdfDictionary());
		const formDict = new _PdfDictionary();
		formDict.set('DR', resource);
		const fakeDocument: any = { form: { _dictionary: formDict } };
		const mockFetch = jasmine.createSpy('mockFetch');
		field._crossReference = { _document: fakeDocument, _fetch: mockFetch, _getNextReference: () => new _PdfReference(99, 0), _cacheMap: new Map() };
		const font: any = { _key: null, _reference: null, _size: 14 };
		// use a real _PdfDictionary so Subtype is an actual _PdfName instance
		const dict = new _PdfDictionary();
		dict.update('Subtype', _PdfName.get('Widget'));
		// replace update with a spy after inserting Subtype so we can observe DA updates
		dict.update = jasmine.createSpy('update');
		field._dictionary = dict;

		// Act
		field._initializeFont(font);

		// Assert
		expect(field._dictionary.update).toHaveBeenCalledWith('DA', jasmine.any(String));
	});

	it('initializeFont does not update DA when Subtype is not Widget', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		const resource = new _PdfDictionary();
		resource.set('Font', new _PdfDictionary());
		const formDict = new _PdfDictionary();
		formDict.set('DR', resource);
		const fakeDocument: any = { form: { _dictionary: formDict } };
		const mockFetch = jasmine.createSpy('mockFetch');
		field._crossReference = { _document: fakeDocument, _fetch: mockFetch, _getNextReference: () => new _PdfReference(99, 0), _cacheMap: new Map() };
		const font: any = { _key: null, _reference: null, _size: 14 };
		field._dictionary = { has: (_: string) => true, get: (_: string) => ({ name: 'NotWidget' }), update: jasmine.createSpy('update'), getArray: (_: string): any => [] };

		// Act
		field._initializeFont(font);

		// Assert
		expect(field._dictionary.update).not.toHaveBeenCalled();
	});

	it('drawCheckBox uses shadowBrush when not beveled/underline and shadow present', () => {
		// Arrange
		let field: any = Object.create(PdfField.prototype);
		// stub out border/shadow helpers called later so they don't throw
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		const drawRectangleSpy = jasmine.createSpy('drawRectangle');
		const graphics: any = { drawRectangle: drawRectangleSpy, drawString: jasmine.createSpy('drawString'), save: jasmine.createSpy('save'), restore: jasmine.createSpy('restore') };
		const shadowBrush = { _color: { r: 10, g: 20, b: 30 } };
		const parameter: any = {
			borderStyle: PdfBorderStyle.solid, // not beveled/underline
			backBrush: null,
			borderPen: null,
			shadowBrush: shadowBrush,
			bounds: { x: 1, y: 2, width: 3, height: 4 },
			borderWidth: 1
		};
		// Act: use pressedChecked which hits the pressed branch
		field._drawCheckBox(graphics, parameter, 'a', _PdfCheckFieldState.pressedChecked);
		field = new PdfTextBoxField();
		// Assert: the else-if path should draw rectangle with the shadow brush
		expect(drawRectangleSpy).toHaveBeenCalledWith(parameter.bounds, shadowBrush);
	});

	it('drawCheckBox draws backBrush when beveled and backBrush present (inner-if true)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		const drawRectangleSpy = jasmine.createSpy('drawRectangle');
		const graphics: any = { drawRectangle: drawRectangleSpy, drawString: jasmine.createSpy('drawString'), save: jasmine.createSpy('save'), restore: jasmine.createSpy('restore') };
		const backBrush = { _color: { r: 1, g: 2, b: 3 } };
		const parameter: any = {
			borderStyle: PdfBorderStyle.beveled,
			backBrush: backBrush,
			borderPen: null,
			shadowBrush: null,
			bounds: { x: 0, y: 0, width: 10, height: 10 },
			borderWidth: 1
		};

		// Act
		field._drawCheckBox(graphics, parameter, 'x', _PdfCheckFieldState.pressedUnchecked);

		// Assert
		expect(drawRectangleSpy).toHaveBeenCalledWith(parameter.bounds, backBrush);
	});

	it('drawCheckBox does not draw when beveled but no borderPen/backBrush (implicit else)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		const drawRectangleSpy = jasmine.createSpy('drawRectangle');
		const graphics: any = { drawRectangle: drawRectangleSpy, drawString: jasmine.createSpy('drawString'), save: jasmine.createSpy('save'), restore: jasmine.createSpy('restore') };
		const parameter: any = {
			borderStyle: PdfBorderStyle.beveled,
			backBrush: null,
			borderPen: null,
			shadowBrush: { _color: { r: 9, g: 9, b: 9 } }, // would draw if outer if were false
			bounds: { x: 5, y: 5, width: 2, height: 2 },
			borderWidth: 1
		};

		// Act
		field._drawCheckBox(graphics, parameter, 'y', _PdfCheckFieldState.pressedChecked);

		// Assert: since outer condition is true but inner is false, nothing should be drawn here
		expect(drawRectangleSpy).not.toHaveBeenCalled();
	});

	it('drawCheckBox draws inset shadows with black/white when pressed', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		Object.defineProperty(field, '_blackBrush', { value: { name: 'black' }, writable: true });
		Object.defineProperty(field, '_whiteBrush', { value: { name: 'white' }, writable: true });
		const drawRectangleSpy = jasmine.createSpy('drawRectangle');
		const graphics: any = { drawRectangle: drawRectangleSpy, drawString: jasmine.createSpy('drawString'), save: jasmine.createSpy('save'), restore: jasmine.createSpy('restore') };
		const parameter: any = {
			borderStyle: PdfBorderStyle.inset,
			backBrush: null,
			borderPen: null,
			shadowBrush: null,
			bounds: { x: 2, y: 3, width: 4, height: 5 },
			borderWidth: 2
		};

		// Act
		field._drawCheckBox(graphics, parameter, 'z', _PdfCheckFieldState.pressedChecked);

		// Assert
		expect(field._drawLeftTopShadow).toHaveBeenCalledWith(graphics, parameter.bounds, parameter.borderWidth, field._blackBrush);
		expect(field._drawRightBottomShadow).toHaveBeenCalledWith(graphics, parameter.bounds, parameter.borderWidth, field._whiteBrush);
	});

	it('drawCheckBox draws inset shadows with gray/silver when not pressed', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		Object.defineProperty(field, '_grayBrush', { value: { name: 'gray' }, writable: true });
		Object.defineProperty(field, '_silverBrush', { value: { name: 'silver' }, writable: true });
		const drawRectangleSpy = jasmine.createSpy('drawRectangle');
		const graphics: any = { drawRectangle: drawRectangleSpy, drawString: jasmine.createSpy('drawString'), save: jasmine.createSpy('save'), restore: jasmine.createSpy('restore') };
		const parameter: any = {
			borderStyle: PdfBorderStyle.inset,
			backBrush: null,
			borderPen: null,
			shadowBrush: null,
			bounds: { x: 2, y: 2, width: 6, height: 6 },
			borderWidth: 1
		};

		// Act (non-pressed checked state should take the else branch)
		field._drawCheckBox(graphics, parameter, 'n', _PdfCheckFieldState.checked);

		// Assert
		expect(field._drawLeftTopShadow).toHaveBeenCalledWith(graphics, parameter.bounds, parameter.borderWidth, field._grayBrush);
		expect(field._drawRightBottomShadow).toHaveBeenCalledWith(graphics, parameter.bounds, parameter.borderWidth, field._silverBrush);
	});

	it('drawCheckBox executes rotation transforms when pageRotationAngle is angle90 (else-font & size=0 paths)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		// existing font forces the else branch where a new PdfStandardFont would be created from font._size
		field._font = { _size: 7, _getHeight: () => 3 };
		const translateSpy = jasmine.createSpy('translateTransform');
		const rotateSpy = jasmine.createSpy('rotateTransform');
		const saveSpy = jasmine.createSpy('save').and.returnValue({});
		const graphics: any = {
			drawRectangle: jasmine.createSpy('drawRectangle'),
			drawString: jasmine.createSpy('drawString'),
			save: saveSpy,
			restore: jasmine.createSpy('restore'),
			translateTransform: translateSpy,
			rotateTransform: rotateSpy,
			_size: { width: 200, height: 400 }
		};
		const parameter: any = {
			borderStyle: PdfBorderStyle.solid,
			backBrush: null,
			borderPen: null,
			shadowBrush: null,
			bounds: { x: 10, y: 20, width: 30, height: 40 },
			borderWidth: 1,
			pageRotationAngle: (PdfRotationAngle as any).angle90,
			rotationAngle: 0
		};

		// Act
		field._drawCheckBox(graphics, parameter, 't', _PdfCheckFieldState.checked);

		// Assert: rotation-related graphics methods were invoked
		expect(saveSpy).toHaveBeenCalled();
		expect(translateSpy).toHaveBeenCalled();
		expect(rotateSpy).toHaveBeenCalled();
	});

	it('drawCheckBox does not perform rotation when angles are zero (no transforms)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		field._font = { _size: 9, _getHeight: () => 4 };
		const translateSpy = jasmine.createSpy('translateTransform');
		const rotateSpy = jasmine.createSpy('rotateTransform');
		const saveSpy = jasmine.createSpy('save');
		const graphics: any = {
			drawRectangle: jasmine.createSpy('drawRectangle'),
			drawString: jasmine.createSpy('drawString'),
			save: saveSpy,
			restore: jasmine.createSpy('restore'),
			translateTransform: translateSpy,
			rotateTransform: rotateSpy,
			_size: { width: 100, height: 100 }
		};
		const parameter: any = {
			borderStyle: PdfBorderStyle.solid,
			backBrush: null,
			borderPen: null,
			shadowBrush: null,
			bounds: { x: 1, y: 1, width: 2, height: 2 },
			borderWidth: 1,
			pageRotationAngle: (PdfRotationAngle as any).angle0,
			rotationAngle: 0
		};

		// Act
		field._drawCheckBox(graphics, parameter, 'u', _PdfCheckFieldState.checked);

		// Assert: no rotation transforms performed
		expect(saveSpy).not.toHaveBeenCalled();
		expect(translateSpy).not.toHaveBeenCalled();
		expect(rotateSpy).not.toHaveBeenCalled();
	});

	it('addToOptions does not call _initializeFont when item._isFont is true', () => {
		// Arrange
		const host: any = Object.create(PdfField.prototype);
		host._initializeFont = jasmine.createSpy('_initializeFont');
		const item: any = { _isFont: true, _pdfFont: { name: 'X' }, _text: 't', _value: 'v' };
		const dict: any = { set: (_: string, v: any) => { dict._last = v; }, _updated: false };
		const targetField: any = { _options: [], _dictionary: dict };

		// Act
		host._addToOptions(item, targetField);

		// Assert
		expect(targetField._options.length).toBe(1);
		expect(targetField._dictionary._updated).toBe(true);
		expect(host._initializeFont).not.toHaveBeenCalled();
	});

	it('addToOptions calls _initializeFont when item._isFont is false and _pdfFont present', () => {
		// Arrange
		const host: any = Object.create(PdfField.prototype);
		host._initializeFont = jasmine.createSpy('_initializeFont');
		const pdfFontObj: any = { family: 'helvetica' };
		const item: any = { _isFont: false, _pdfFont: pdfFontObj, _text: 't2', _value: 'v2' };
		const dict: any = { set: (_: string, v: any) => { dict._last = v; }, _updated: false };
		const targetField: any = { _options: [], _dictionary: dict };

		// Act
		host._addToOptions(item, targetField);

		// Assert
		expect(targetField._options.length).toBe(1);
		expect(targetField._dictionary._updated).toBe(true);
		expect(host._initializeFont).toHaveBeenCalledWith(pdfFontObj);
	});

	it('addToOptions does not call _initializeFont when item._isFont is false but _pdfFont missing', () => {
		// Arrange
		const host: any = Object.create(PdfField.prototype);
		host._initializeFont = jasmine.createSpy('_initializeFont');
		const item: any = { _isFont: false, _pdfFont: null, _text: 'tx', _value: 'vx' };
		const dict: any = { set: (_: string, v: any) => { dict._last = v; }, _updated: false };
		const targetField: any = { _options: [], _dictionary: dict };

		// Act
		host._addToOptions(item, targetField);

		// Assert
		expect(targetField._options.length).toBe(1);
		expect(targetField._dictionary._updated).toBe(true);
		expect(host._initializeFont).not.toHaveBeenCalled();
	});

	it('drawCheckBox computes font size when no font argument provided (size !== 0 path)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		const translateSpy = jasmine.createSpy('translateTransform');
		const rotateSpy = jasmine.createSpy('rotateTransform');
		const saveSpy = jasmine.createSpy('save').and.returnValue({});
		const drawStringSpy = jasmine.createSpy('drawString');
		const graphics: any = {
			drawRectangle: jasmine.createSpy('drawRectangle'),
			drawString: drawStringSpy,
			save: saveSpy,
			restore: jasmine.createSpy('restore'),
			translateTransform: translateSpy,
			rotateTransform: rotateSpy,
			_size: { width: 200, height: 400 }
		};
		const parameter: any = {
			borderStyle: PdfBorderStyle.solid,
			backBrush: null,
			borderPen: null,
			shadowBrush: null,
			bounds: { x: 0, y: 0, width: 10, height: 6 },
			borderWidth: 1,
			pageRotationAngle: (PdfRotationAngle as any).angle90,
			rotationAngle: 0,
			foreBrush: null
		};

		// Act: do not pass a font argument so the computed-size branch runs
		field._drawCheckBox(graphics, parameter, 'g', _PdfCheckFieldState.checked);

		// Assert: drawString called and the font passed has expected computed size (fontSize = min(width,height) - 2*xOffset => 6 - 2*1 = 4)
		expect(drawStringSpy).toHaveBeenCalled();
		const passedFont: any = drawStringSpy.calls.mostRecent().args[1];
		expect(passedFont).toBeDefined();
		expect(passedFont._size).toBe(4);
		expect(saveSpy).toHaveBeenCalled();
		expect(translateSpy).toHaveBeenCalled();
		expect(rotateSpy).toHaveBeenCalled();
	});

	it('drawCheckBox uses provided font size when font argument is given (size === 0 path)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._drawBorder = jasmine.createSpy('_drawBorder');
		field._drawLeftTopShadow = jasmine.createSpy('_drawLeftTopShadow');
		field._drawRightBottomShadow = jasmine.createSpy('_drawRightBottomShadow');
		const translateSpy = jasmine.createSpy('translateTransform');
		const rotateSpy = jasmine.createSpy('rotateTransform');
		const saveSpy = jasmine.createSpy('save').and.returnValue({});
		const drawStringSpy = jasmine.createSpy('drawString');
		const graphics: any = {
			drawRectangle: jasmine.createSpy('drawRectangle'),
			drawString: drawStringSpy,
			save: saveSpy,
			restore: jasmine.createSpy('restore'),
			translateTransform: translateSpy,
			rotateTransform: rotateSpy,
			_size: { width: 200, height: 400 }
		};
		const parameter: any = {
			borderStyle: PdfBorderStyle.solid,
			backBrush: null,
			borderPen: null,
			shadowBrush: null,
			bounds: { x: 0, y: 0, width: 8, height: 5 },
			borderWidth: 1,
			pageRotationAngle: (PdfRotationAngle as any).angle90,
			rotationAngle: 0,
			foreBrush: null
		};
		const providedFont: any = { _size: 7, _getHeight: () => 3 };

		// Act: pass a font argument so the else branch (uses font._size) runs
		field._drawCheckBox(graphics, parameter, 'h', _PdfCheckFieldState.checked, providedFont);

		// Assert: drawString called and the font passed has the provided size
		expect(drawStringSpy).toHaveBeenCalled();
		const passedFont: any = drawStringSpy.calls.mostRecent().args[1];
		expect(passedFont).toBeDefined();
		expect(passedFont._size).toBe(7);
		expect(saveSpy).toHaveBeenCalled();
		expect(translateSpy).toHaveBeenCalled();
		expect(rotateSpy).toHaveBeenCalled();
	});

	it('getTextAlignment uses field dictionary when widget lacks Q', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._textAlignment = undefined;
		field._isLoaded = true;
		field._defaultIndex = 0;
		const widget: any = { _dictionary: { has: jasmine.createSpy('has').and.returnValue(false) } };
		field.itemAt = jasmine.createSpy('itemAt').and.returnValue(widget);
		field._dictionary = { has: jasmine.createSpy('dictHas').and.returnValue(true), get: jasmine.createSpy('dictGet').and.returnValue(PdfTextAlignment.center) };

		// Act
		const result = field._getTextAlignment();

		// Assert
		expect(field.itemAt).toHaveBeenCalledWith(0);
		expect(widget._dictionary.has).toHaveBeenCalledWith('Q');
		expect(field._dictionary.get).toHaveBeenCalledWith('Q');
		expect(result).toBe(PdfTextAlignment.center);
		expect(field._textAlignment).toBe(PdfTextAlignment.center);
	});

	// added tests for _setTextAlignment
	it('_setTextAlignment uses widget dictionary update when widget present (else path not taken)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._isLoaded = true;
		field.readOnly = false; // override any prototype getter
		field._defaultIndex = 0;
		const widgetDict: any = { update: jasmine.createSpy('update') };
		const widget: any = { _dictionary: widgetDict };
		field.itemAt = (_: number) => widget;
		field._dictionary = { update: jasmine.createSpy('fieldUpdate') };
		field._textAlignment = PdfTextAlignment.left;

		// Act
		field._setTextAlignment(PdfTextAlignment.center);

		// Assert
		expect(widgetDict.update).toHaveBeenCalledWith('Q', PdfTextAlignment.center);
		expect(field._dictionary.update).not.toHaveBeenCalled();
		expect(field._textAlignment).toBe(PdfTextAlignment.center);
		expect(field._stringFormat).toBeDefined();
	});

	it('_setTextAlignment updates field dictionary when widget missing (else path executed)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._isLoaded = true;
		field.readOnly = false;
		field._defaultIndex = 0;
		field.itemAt = (_: number): any => undefined; // simulate no widget
		const fieldDict: any = { update: jasmine.createSpy('update') };
		field._dictionary = fieldDict;
		field._textAlignment = PdfTextAlignment.left;

		// Act
		field._setTextAlignment(PdfTextAlignment.right);

		// Assert
		expect(fieldDict.update).toHaveBeenCalledWith('Q', PdfTextAlignment.right);
		expect(field._textAlignment).toBe(PdfTextAlignment.right);
		expect(field._stringFormat).toBeDefined();
	});

	it('_setTextAlignment does not call dictionary.update when not loaded and no widget/dictionary (else-if not taken)', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._isLoaded = false; // not loaded -> follow the second branch
		field._defaultIndex = 0;
		field._textAlignment = PdfTextAlignment.left; // different than new value
		field._dictionary = undefined; // ensure else-if condition is falsy
		field.itemAt = (_: number): any => undefined; // no widget

		// Act
		field._setTextAlignment(PdfTextAlignment.center);

		// Assert
		expect(field._textAlignment).toBe(PdfTextAlignment.center);
		expect(field._stringFormat).toBeDefined();
	});

    it('_setTextAlignment this_dictionary is not undefined', () => {
		// Arrange
		const field: any = Object.create(PdfField.prototype);
		field._isLoaded = false; // not loaded -> follow the second branch
		field._defaultIndex = 0;
		field._textAlignment = PdfTextAlignment.left; // different than new value
		const fieldDict: any = { update: jasmine.createSpy('update') };
		field._dictionary = fieldDict;
		field.itemAt = (_: number): any => undefined; // no widget

		// Act
		field._setTextAlignment(PdfTextAlignment.center);

		// Assert
		expect(field._textAlignment).toBe(PdfTextAlignment.center);
		expect(field._stringFormat).toBeDefined();
	});

	it('password setter sets flag via OR when value is true (path taken)', () => {
		// Arrange
		const field: any = Object.create(PdfTextBoxField.prototype);
		field._fieldFlags = 0;
		field._dictionary = { update: jasmine.createSpy('update') };
		// Act
		field.password = true;
		// Assert
		expect(field._fieldFlags & _FieldFlag.password).toBe(_FieldFlag.password);
	});

	it('password setter clears flag via AND NOT when value is false (path not taken)', () => {
		// Arrange
		const field: any = Object.create(PdfTextBoxField.prototype);
		field._dictionary = { update: jasmine.createSpy('update') };
		field._fieldFlags = _FieldFlag.password; // pre-set the password flag
		// Act
		field.password = false;
		// Assert
		expect(field._fieldFlags & _FieldFlag.password).toBe(0);
	});

	it('scrollable setter sets doNotScroll flag when value is true (if branch)', () => {
		// Arrange
		const field: any = Object.create(PdfTextBoxField.prototype);
        field._dictionary = { update: jasmine.createSpy('update') };
		field._fieldFlags = 0; // clear all flags

		// Act
		field.scrollable = true;

		// Assert: false -> else branch executed, doNotScroll flag set
		expect(field._fieldFlags & _FieldFlag.doNotScroll).toBe(0);
	});

	it('spellCheck setter clears doNotSpellCheck flag when value is true (if path taken)', () => {
		// Arrange
		const field: any = Object.create(PdfTextBoxField.prototype);
		field._dictionary = { update: jasmine.createSpy('update') };
		field._fieldFlags = _FieldFlag.doNotSpellCheck; // pre-set the doNotSpellCheck flag

		// Act
		field.spellCheck = true;

		// Assert: true -> if branch executed, doNotSpellCheck flag cleared
		expect(field._fieldFlags & _FieldFlag.doNotSpellCheck).toBe(0);
	});

	it('spellCheck setter sets doNotSpellCheck flag when value is false (else path not taken)', () => {
		// Arrange
		const field: any = Object.create(PdfTextBoxField.prototype);
		field._dictionary = { update: jasmine.createSpy('update') };
		field._fieldFlags = 0; // clear all flags

		// Act
		field.spellCheck = false;

		// Assert: false -> else branch executed, doNotSpellCheck flag set
		expect(field._fieldFlags & _FieldFlag.doNotSpellCheck).toBe(_FieldFlag.doNotSpellCheck);
	});

	it('insertSpaces setter sets comb flag when value is true (if branch taken, else not taken)', () => {
		// Arrange
		const field: any = Object.create(PdfTextBoxField.prototype);
		field._dictionary = { update: jasmine.createSpy('update') };
		field._fieldFlags = 0; // clear all flags

		// Act
		field.insertSpaces = undefined;

		// Assert: true -> if branch executed, comb flag set
		expect(field._fieldFlags & _FieldFlag.comb).toBe(0);
	});

	// Tests for _doPostProcess coverage (lines ~3541-3577)
	it('_doPostProcess calls _postProcess for each loaded kid when _kidsCount > 0', () => {
		// Arrange
		const field: any = new PdfTextBoxField();
		field._isLoaded = true;
		Object.defineProperty(field, '_kidsCount', { value: 2, writable: true });
		field.itemAt = jasmine.createSpy('itemAt').and.callFake((i: number) => ({ idx: i }));
		field._postProcess = jasmine.createSpy('_postProcess');
		field._setAppearance = true;
		field._form = { _setAppearance: false };

		// Act
		field._doPostProcess(false);

		// Assert
		expect(field.itemAt).toHaveBeenCalledTimes(2);
		expect(field._postProcess).toHaveBeenCalledTimes(2);
		expect(field._postProcess.calls.argsFor(0)).toEqual([false, { idx: 0 }]);
		expect(field._postProcess.calls.argsFor(1)).toEqual([false, { idx: 1 }]);
	});

	it('_doPostProcess with loaded but no kids calls _postProcess once when flags set and checkFieldFlag false', () => {
		// Arrange
		const field: any = new PdfTextBoxField();
		field._isLoaded = true;
		Object.defineProperty(field, '_kidsCount', { value: 0, writable: true });
		field._checkFieldFlag = jasmine.createSpy('_checkFieldFlag').and.returnValue(false);
		field._postProcess = jasmine.createSpy('_postProcess');
		field._setAppearance = true; // ensures outer condition is true
		field._form = { _setAppearance: false };

		// Act
		field._doPostProcess(false);

		// Assert
		expect(field._checkFieldFlag).toHaveBeenCalledWith(field._dictionary);
		expect(field._postProcess).toHaveBeenCalledWith(false);
	});

	it('_doPostProcess (unloaded, non-flatten) creates appearance and adds it to widget dictionary', () => {
		// Arrange
		const field: any = new PdfTextBoxField();
		field._isLoaded = false;
		Object.defineProperty(field, '_kidsCount', { value: 1, writable: true });
		const itemDict: any = { _updated: false };
		const item: any = { _dictionary: itemDict, _page: { id: 'p' }, bounds: { x: 3, y: 4 } };
		field.itemAt = jasmine.createSpy('itemAt').and.returnValue(item);
		field._checkFieldFlag = jasmine.createSpy('_checkFieldFlag').and.returnValue(false);
		const template: any = { _size: { width: 7, height: 8 } };
		field._createAppearance = jasmine.createSpy('_createAppearance').and.returnValue(template);
		field._addAppearance = jasmine.createSpy('_addAppearance');
		field._form = { _setAppearance: true };

		// Act
		field._doPostProcess(false);

		// Assert
		expect(field._createAppearance).toHaveBeenCalledWith(false, item);
		expect(field._addAppearance).toHaveBeenCalledWith(itemDict, template, 'N');
		expect(itemDict._updated).toBe(true);
	});

	it('_doPostProcess (flatten) draws template and clears update flags', () => {
		// Arrange
		const field: any = new PdfTextBoxField();
		field._isLoaded = false;
		Object.defineProperty(field, '_kidsCount', { value: 1, writable: true });
		const itemDict: any = { _updated: true };
		const item: any = { _dictionary: itemDict, _page: { id: 'paged' }, bounds: { x: 10, y: 11 } };
		field.itemAt = jasmine.createSpy('itemAt').and.returnValue(item);
		field._checkFieldFlag = jasmine.createSpy('_checkFieldFlag').and.returnValue(false);
		const template: any = { _size: { width: 15, height: 16 } };
		field._createAppearance = jasmine.createSpy('_createAppearance').and.returnValue(template);
		field._drawTemplate = jasmine.createSpy('_drawTemplate');
		field._form = { _setAppearance: false };
		field._dictionary = { _updated: true };

		// Act
		field._doPostProcess(true);

		// Assert: drawTemplate called with computed bounds
		expect(field._drawTemplate).toHaveBeenCalledWith(template, item._page, { x: item.bounds.x, y: item.bounds.y, width: template._size.width, height: template._size.height });
		expect(itemDict._updated).toBe(false);
		expect(field._dictionary._updated).toBe(false);
	});

});
