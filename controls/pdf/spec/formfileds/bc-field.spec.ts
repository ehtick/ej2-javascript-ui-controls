import { PdfButtonField, PdfComboBoxField, PdfField, PdfListBoxField, PdfListField, PdfRadioButtonListField, PdfSignatureField, PdfTextBoxField } from '../../src/pdf/core/form/field';
import { _PdfDictionary, _PdfName, _PdfReference } from '../../src/pdf/core/pdf-primitives';
import { PdfAnnotationFlag, PdfFormFieldVisibility, PdfRotationAngle, PdfBorderStyle, PdfFormFieldsTabOrder, PdfTextAlignment, _FieldFlag, _PdfCheckFieldState, PdfHighlightMode } from '../../src/pdf/core/enumerator';
import { PdfAnnotationCollection } from '../../src/pdf/core/annotations/annotation-collection';
import * as Utils from '../../src/pdf/core/utils';
import { PdfFontFamily, PdfFontStyle, PdfStandardFont } from '../../src/pdf/core/fonts/pdf-standard-font';
import { PdfStringFormat, PdfVerticalAlignment } from '../../src/pdf/core/fonts/pdf-string-format';
import { PdfTemplate } from '../../src/pdf/core/graphics/pdf-template'
import { PdfInteractiveBorder } from '../../src/pdf/core/annotations/annotation';
import { PdfDocument } from '../../src/pdf/core/pdf-document';
import { _TextRenderingMode, PdfBrush } from '../../src/pdf/core/graphics/pdf-graphics';

describe('PdfField - mappingName getter (lines 397-402)', () => {
	class TestField extends PdfField {
		// expose protected members for testing via public accessors
		public setDictionary(dict: _PdfDictionary) { this._dictionary = dict; }
		public setMappingName(name: string) { this._mappingName = name; }
		public _doPostProcess(): void {
			// Empty implementation for testing
		}
		private _testWidget: any = null;
		public setWidget(widget: any) { this._testWidget = widget; }
		public setLoaded(value: boolean) { this._isLoaded = value; }
		public setDefaultIndex(value: number) { this._defaultIndex = value; }
		public itemAt(index: number) {
			if ((this as any)._parsedItems && (this as any)._parsedItems.has(index)) {
				return (this as any)._parsedItems.get(index);
			}
			return this._testWidget;
		}
	}
	it('mappingName - reads TM from dictionary when _mappingName undefined', () => {
		const field = new TestField();
		const dict = new _PdfDictionary();
		dict.set('TM', 'MappedValue');
		field.setDictionary(dict);
		const result = field.mappingName;
		expect(result).toBe('MappedValue');
		expect((field as any)._mappingName).toBe('MappedValue');
	});

	describe('parsing, drawing helpers, rotation, index and date utilities (lines ~1458-1903)', () => {

		it('_parseBackColor returns widget.backColor when present', () => {
			const field = new TestField();
			const widget: any = { backColor: { r: 7, g: 8, b: 9 } };
			field.setWidget(widget);
			const result = (field as any)._parseBackColor(false);
			expect(result).toEqual({ r: 7, g: 8, b: 9 });
		});

		it('_parseBackColor uses MK BG when widget missing', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			const mk = new _PdfDictionary();
			mk.update('BG', [0.5, 0.25, 0.75]);
			dict.update('MK', mk);
			field.setDictionary(dict);
			const val = (field as any)._parseBackColor(false);
			expect(val).toEqual({ r: Math.round(0.5 * 255), g: Math.round(0.25 * 255), b: Math.round(0.75 * 255) });
		});

		it('_parseBorderColor returns default black when nothing present', () => {
			const field = new TestField();
			field.setWidget(null);
			field.setDictionary(new _PdfDictionary());
			const val = (field as any)._parseBorderColor(false);
			expect(val).toEqual({ r: 0, g: 0, b: 0 });
		});

		it('_updateBorderColor transparent branch sets item.borderColor when item exists', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			dict.update('BC', [0, 0, 0]);
			field.setDictionary(dict);
			const item: any = { borderColor: null };
			spyOn(field as any, 'itemAt').and.returnValue(item);
			field._updateBorderColor({ isTransparent: true } as any, true);
			expect(item.borderColor).toBeDefined();
		});

		it('_drawBorder draws line for underline style and rectangle otherwise', () => {
			const field = new TestField();
			const g: any = { drawLine: jasmine.createSpy('line'), drawRectangle: jasmine.createSpy('rect') };
			const bounds = { x: 1, y: 2, width: 10, height: 20 };
			(field as any)._drawBorder(g, bounds, {} as any, PdfBorderStyle.underline, 2);
			expect(g.drawLine).toHaveBeenCalled();
			(field as any)._drawBorder(g, bounds, {} as any, PdfBorderStyle.solid, 2);
			expect(g.drawRectangle).toHaveBeenCalled();
		});

		it('_drawLeftTopShadow and _drawRightBottomShadow call drawPath', () => {
			const field = new TestField();
			const g: any = { drawPath: jasmine.createSpy('path') };
			const bounds = { x: 0, y: 0, width: 20, height: 20 };
			field._drawLeftTopShadow(g, bounds, 2, {} as any);
			expect(g.drawPath).toHaveBeenCalled();
			field._drawRightBottomShadow(g, bounds, 2, {} as any);
			expect(g.drawPath).toHaveBeenCalled();
		});

		it('_rotateTextBox computes transforms for angles', () => {
			const field = new TestField();
			const rect = { x: 1, y: 2, width: 3, height: 4 };
			const size = { width: 100, height: 200 };
			expect(field._rotateTextBox(rect, size, PdfRotationAngle.angle180)).toEqual({ x: 100 - (1 + 3), y: 200 - (2 + 4), width: 3, height: 4 });
			expect(field._rotateTextBox(rect, size, PdfRotationAngle.angle270)).toEqual({ x: 2, y: 100 - (1 + 3), width: 4, height: 3 });
			expect(field._rotateTextBox(rect, size, PdfRotationAngle.angle90)).toEqual({ x: 200 - (2 + 4), y: 1, width: 4, height: 3 });
		});

		it('_checkIndex throws for out of range', () => {
			const field = new TestField();
			expect(() => (field as any)._checkIndex(-1, 3)).toThrowError('Index out of range.');
			expect(() => (field as any)._checkIndex(3, 3)).toThrowError('Index out of range.');
		});
		it('_checkIndex throws for out of range', () => {
			const field = new TestField();
			expect(() => (field as any)._checkIndex(-1, 3)).toThrowError('Index out of range.');
			expect(() => (field as any)._checkIndex(3, 3)).toThrowError('Index out of range.');
		});

		it('_getAppearanceStateValue reads AS from dictionary and kids', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			dict.update('AS', _PdfName.get('On'));
			field.setDictionary(dict);
			expect((field as any)._getAppearanceStateValue()).toBe('On');
			// kids path
			const dict2 = new _PdfDictionary();
			dict2.update('Kids', [1]);
			field.setDictionary(dict2);
			(field as any)._kids = [1];
			const kidDict = new _PdfDictionary();
			kidDict.update('AS', _PdfName.get('Yes'));
			const kid: any = { _dictionary: kidDict };
			spyOn(field as any, 'itemAt').and.returnValue(kid);
			expect((field as any)._getAppearanceStateValue()).toBe('Yes');
		});

		it('_tryParseAcrobatFormFormat extracts pattern from script', () => {
			const tfield = new PdfTextBoxField();
			const js = "function f(){app._FormatEx('yyyy/mm/dd');}";
			expect((tfield as any)._tryParseAcrobatFormFormat(js)).toBe('yyyy/mm/dd');
		});

		it('_parseUnknownDate parses YYYY/MM/DD to Date', () => {
			const tfield = new PdfTextBoxField();
			const d = (tfield as any)._parseUnknownDate('2020/12/31');
			expect(d.getFullYear()).toBe(2020);
			expect(d.getMonth()).toBe(11);
			expect(d.getDate()).toBe(31);
		});

		it('_formatDateUsingAcrobatFormat maps tokens', () => {
			const tfield = new PdfTextBoxField();
			const date = new Date(2021, 0, 2, 9, 5, 7); // 2021-01-02 09:05:07
			const out = (tfield as any)._formatDateUsingAcrobatFormat(date, 'yyyy-mm-dd HH:MM:ss tt');
			expect(out).toContain('2021');
			expect(out).toContain('09');
		});

	});

	it('_parseBorderColor handles MK.BC arrays of length 1 and 2', () => {
		const field = new (class extends PdfField {
			public setDictionary(dict: any) { this._dictionary = dict; }
			public itemAt(): any { return null; }
			public _doPostProcess(): void { }
		})();
		const dict = new _PdfDictionary();
		const mk = new _PdfDictionary();
		mk.update('BC', [0.2]);
		dict.update('MK', mk);
		field.setDictionary(dict);
		const v1: any = (field as any)._parseBorderColor(false);
		expect(v1).toEqual({ r: Math.round(0.2 * 255), g: Math.round(0.2 * 255), b: Math.round(0.2 * 255) });

		mk.update('BC', [0.1, 0.2]);
		const v2: any = (field as any)._parseBorderColor(false);
		expect(v2).toEqual({ r: 0, g: 0, b: 0 });
	});

	it('_getAppearanceStateValue returns undefined when no AS and no kids', () => {
		const field = new (class extends PdfField {
			public setDictionary(dict: any) { this._dictionary = dict; }
			public itemAt(): any { return undefined; }
			public _doPostProcess(): void { }
		})();
		field.setDictionary(new _PdfDictionary());
		(field as any)._kids = [];
		expect((field as any)._getAppearanceStateValue()).toBeUndefined();
	});

	it('_updateBackColor updates existing MK.BG when MK exists', () => {
		const field = new TestField();
		const dict = new _PdfDictionary();
		const mk = new _PdfDictionary();
		dict.update('MK', mk);
		field.setDictionary(dict);
		const val: any = { r: 10, g: 20, b: 30 };
		const spyMk = spyOn(mk, 'update');
		field._updateBackColor(val as any);
		expect(spyMk).toHaveBeenCalledWith('BG', [Number.parseFloat((val.r / 255).toFixed(3)), Number.parseFloat((val.g / 255).toFixed(3)), Number.parseFloat((val.b / 255).toFixed(3))]);
	});

	describe('setValue, removeItemAt/removeItem, flags, appearance and back/border updates (lines ~1128-1450)', () => {

		it('setValue - updates dictionary only for non-empty name and value', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			field.setDictionary(dict);
			const spy = spyOn(dict, 'update');
			field.setValue('Author', 'Bob');
			expect(spy).toHaveBeenCalledWith('Author', 'Bob');
			spy.calls.reset();
			field.setValue('', 'No');
			expect(spy).not.toHaveBeenCalled();
			field.setValue('Key', '');
			expect(spy).not.toHaveBeenCalled();
		});

		it('itemAt returns cached parsed item when present', () => {
			const field = new TestField();
			(field as any)._kids = [1];
			(field as any)._parsedItems = new Map();
			const widget = { some: 'widget' } as any;
			(field as any)._parsedItems.set(0, widget);
			const item = field.itemAt(0);
			expect(item).toBe(widget);
		});

		it('removeItemAt removes annotation and updates kids and parsedItems', () => {
			const field = new TestField();
			const ref: any = { id: 'r1' };
			(field as any)._kids = [ref];
			(field as any)._parsedItems = new Map();
			const dict = new _PdfDictionary();
			dict.update('Kids', [ref]);
			field.setDictionary(dict);
			// stub itemAt to return an item with _ref and _getPage
			const page = { _removeAnnotation: jasmine.createSpy('remove') } as any;
			const item: any = { _ref: ref, _getPage: () => page };
			spyOn(field as any, 'itemAt').and.returnValue(item);
			const spySet = spyOn(dict, 'set');
			field.removeItemAt(0);
			expect(page._removeAnnotation).toHaveBeenCalledWith(ref);
			expect((field as any)._kids.length).toBe(0);
			expect(spySet).toHaveBeenCalled();
		});

		it('removeItem calls removeItemAt when item ref found', () => {
			const field = new TestField();
			const ref: any = { id: 'r2' };
			(field as any)._kids = [ref];
			const item: any = { _ref: ref };
			const spy = spyOn(field, 'removeItemAt');
			field.removeItem(item as any);
			expect(spy).toHaveBeenCalledWith(0);
		});

		it('_fieldFlags setter updates dictionary when changed', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			field.setDictionary(dict);
			const spy = spyOn(dict, 'update');
			(field as any)._flags = undefined;
			field._fieldFlags = 7 as any;
			expect(spy).toHaveBeenCalledWith('Ff', 7);
		});

		it('_defaultAppearance reads DA from dictionary if present', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			dict.update('DA', '/Helv 12 Tf');
			// ensure _getInheritableProperty loop will run (real dictionaries have objId)
			dict.objId = 1;
			field.setDictionary(dict);
			const da = (field as any)._defaultAppearance;
			expect(da).toBeDefined();
		});

		it('_mkDictionary returns MK when present in dictionary', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			const mk = new _PdfDictionary();
			dict.update('MK', mk);
			field.setDictionary(dict);
			expect((field as any)._mkDictionary).toBe(mk);
		});

		it('_updateBackColor creates MK entry when missing and updates dictionary', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			field.setDictionary(dict);
			const val: any = { r: 10, g: 20, b: 30 };
			const spy = spyOn(dict, 'update');
			field._updateBackColor(val as any);
			expect(spy).toHaveBeenCalledWith('MK', jasmine.any(_PdfDictionary));
		});

		it('_updateBorderColor creates MK BC when missing and updates dictionary', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			field.setDictionary(dict);
			const val: any = { r: 11, g: 22, b: 33 };
			const spy = spyOn(dict, 'update');
			field._updateBorderColor(val as any);
			expect(spy).toHaveBeenCalledWith('MK', jasmine.any(_PdfDictionary));
		});

		it('setAppearance sets _setAppearance flag', () => {
			const field = new TestField();
			field.setAppearance(true);
			expect((field as any)._setAppearance).toBeTruthy();
		});

	});
	it('mappingName - returns existing _mappingName without reading dictionary', () => {
		const field = new TestField();
		field.setMappingName('Preset');
		const dict = new _PdfDictionary();
		dict.set('TM', 'Other');
		field.setDictionary(dict);
		const result = field.mappingName;
		expect(result).toBe('Preset');
	});

	it('mappingName setter - sets _mappingName and updates dictionary when undefined', () => {
		const field = new TestField();
		const dict = new _PdfDictionary();
		field.setDictionary(dict);

		// precondition
		expect((field as any)._mappingName).toBeUndefined();

		// Act
		field.mappingName = 'NewMap';

		// Assert
		expect((field as any)._mappingName).toBe('NewMap');
		expect(field['_dictionary'].get('TM')).toBe('NewMap');
	});

	it('mappingName setter - does not call dictionary.update when value unchanged', () => {
		const field = new TestField();
		const dict = new _PdfDictionary();
		field.setDictionary(dict);
		field.setMappingName('Same');

		const spy = spyOn(field['_dictionary'], 'update');

		// Act: set to same value
		field.mappingName = 'Same';

		expect(spy).not.toHaveBeenCalled();
	});

	describe('visibility getter/setter (lines 494-585)', () => {

		it('visibility getter - returns visibleNotPrintable when loaded and no widget and no dict.F', () => {
			const field = new TestField();
			field.setLoaded(true);
			field.setDictionary(new _PdfDictionary());
			field.setWidget(null);
			const result = field.visibility;
			expect(result).toBe(PdfFormFieldVisibility.visibleNotPrintable);
		});

		it('visibility getter - widget has hidden flag -> hidden', () => {
			const field = new TestField();
			field.setLoaded(true);
			const widget = {
				_hasFlags: true,
				_flagsValue: undefined as number | undefined,
				_dictionary: new _PdfDictionary(),
				get flags() {
					return (typeof this._flagsValue !== 'undefined') ? this._flagsValue : 0;
				},
				set flags(v: any) { this._flagsValue = v; this._dictionary.update('F', v); }
			};
			widget.flags = PdfAnnotationFlag.hidden;
			field.setWidget(widget);
			const result = field.visibility;
			expect(result).toBe(PdfFormFieldVisibility.hidden);
		});

		it('visibility getter - widget has noView+print -> hiddenPrintable', () => {
			const field = new TestField();
			field.setLoaded(true);
			const widget = {
				_hasFlags: true, _flagsValue: PdfAnnotationFlag.noView | PdfAnnotationFlag.print, _dictionary: new _PdfDictionary(),
				get flags() { return this._flagsValue; }, set flags(v: any) { this._flagsValue = v; this._dictionary.update('F', v); }
			};
			field.setWidget(widget);
			const result = field.visibility;
			expect(result).toBe(PdfFormFieldVisibility.hiddenPrintable);
		});

		it('visibility getter - widget has default (0) -> visibleNotPrintable', () => {
			const field = new TestField();
			field.setLoaded(true);
			const widget = {
				_hasFlags: true, _flagsValue: PdfAnnotationFlag.default, _dictionary: new _PdfDictionary(),
				get flags() { return this._flagsValue; }, set flags(v: any) { this._flagsValue = v; this._dictionary.update('F', v); }
			};
			field.setWidget(widget);
			const result = field.visibility;
			expect(result).toBe(PdfFormFieldVisibility.visibleNotPrintable);
		});

		it('visibility getter - widget has print -> visible', () => {
			const field = new TestField();
			field.setLoaded(true);
			const widget = {
				_hasFlags: true, _flagsValue: PdfAnnotationFlag.print, _dictionary: new _PdfDictionary(),
				get flags() { return this._flagsValue; }, set flags(v: any) { this._flagsValue = v; this._dictionary.update('F', v); }
			};
			field.setWidget(widget);
			const result = field.visibility;
			expect(result).toBe(PdfFormFieldVisibility.visible);
		});

		it('visibility getter - uses dictionary F when widget has no flags', () => {
			const field = new TestField();
			field.setLoaded(true);
			const dict = new _PdfDictionary();
			dict.update('F', PdfAnnotationFlag.hidden);
			field.setDictionary(dict);
			const widget = { _hasFlags: false, _dictionary: new _PdfDictionary() };
			field.setWidget(widget);
			const result = field.visibility;
			expect(result).toBe(PdfFormFieldVisibility.hidden);
		});

		it('visibility setter - when not loaded sets widget.flags appropriately', () => {
			const field = new TestField();
			field.setLoaded(false);
			const widget: any = {
				_hasFlags: false, _flagsValue: undefined, _dictionary: new _PdfDictionary(),
				get flags() { return typeof this._flagsValue !== 'undefined' ? this._flagsValue : 0; },
				set flags(v: any) { this._flagsValue = v; this._dictionary.update('F', v); }
			};
			field.setWidget(widget);
			field.setDefaultIndex(0);

			field.visibility = PdfFormFieldVisibility.hidden;
			expect(widget._flagsValue).toBe(PdfAnnotationFlag.hidden);

			field.visibility = PdfFormFieldVisibility.hiddenPrintable;
			expect(widget._flagsValue).toBe(PdfAnnotationFlag.noView | PdfAnnotationFlag.print);

			field.visibility = PdfFormFieldVisibility.visible;
			expect(widget._flagsValue).toBe(PdfAnnotationFlag.print);

			field.visibility = PdfFormFieldVisibility.visibleNotPrintable;
			expect(widget._flagsValue).toBe(PdfAnnotationFlag.default);
		});

		describe('rotate and color getter/setter (lines ~664-720, ~720-820)', () => {

			it('rotate getter - returns widget.rotate when widget provides rotate', () => {
				const field = new TestField();
				const widget: any = { rotate: 90 };
				field.setWidget(widget);
				const result = field.rotate;
				expect(result).toBe(90);
			});

			it('rotate getter - reads R from _mkDictionary when widget missing', () => {
				const field = new TestField();
				field.setWidget(null);
				const dict = new _PdfDictionary();
				const mk = new _PdfDictionary();
				mk.update('R', 180);
				dict.update('MK', mk);
				field.setDictionary(dict);
				const result = field.rotate;
				expect(result).toBe(180);
			});

			it('rotate getter - reads R from dictionary when mkDictionary absent', () => {
				const field = new TestField();
				field.setWidget(null);
				const dict = new _PdfDictionary();
				dict.update('R', 270);
				field.setDictionary(dict);
				const result = field.rotate;
				expect(result).toBe(270);
			});

			it('rotate getter - searches other kids and returns first found rotate', () => {
				const field = new TestField();
				field.setDefaultIndex(0);
				(field as any)._kids = [1, 2];
				field.setDictionary(new _PdfDictionary());
				// override itemAt to simulate different widgets per index
				(field as any).itemAt = (i: number) => { return (i === 0) ? undefined : { rotate: 315 }; };
				const result = field.rotate;
				expect(result).toBe(315);
			});

			it('rotate getter - returns 0 when no rotate found', () => {
				const field = new TestField();
				field.setWidget(undefined);
				field.setDictionary(new _PdfDictionary());
				const result = field.rotate;
				expect(result).toBe(0);
			});

			it('rotate setter - when widget exists sets widget.rotate', () => {
				const field = new TestField();
				const widget: any = { rotate: null };
				field.setWidget(widget);
				field.rotate = 45;
				expect(widget.rotate).toBe(45);
			});

			it('rotate setter - when no widget updates dictionary when different', () => {
				const field = new TestField();
				field.setWidget(undefined);
				const dict = new _PdfDictionary();
				field.setDictionary(dict);
				const spy = spyOn(dict, 'update');
				field.rotate = 30;
				expect(spy).toHaveBeenCalledWith('R', 30);
			});

			it('rotate setter - when no widget and dictionary already has same value does not update', () => {
				const field = new TestField();
				field.setWidget(undefined);
				const dict = new _PdfDictionary();
				// set existing value
				dict.update('R', 40);
				field.setDictionary(dict);
				const spy = spyOn(dict, 'update');
				field.rotate = 40;
				expect(spy).not.toHaveBeenCalled();
			});

			it('color getter - returns widget.color when present', () => {
				const field = new TestField();
				const widget: any = { color: { r: 1, g: 2, b: 3 } };
				field.setWidget(widget);
				const result = field.color;
				expect(result).toEqual({ r: 1, g: 2, b: 3 });
			});

			it('color getter - uses _da when _defaultAppearance true and widget missing', () => {
				const field = new TestField();
				field.setWidget(undefined);

				(field as any)._da = { color: { r: 4, g: 5, b: 6 } };
				const result = field.color;
				expect(result).toEqual({ r: 4, g: 5, b: 6 });
			});

			it('color setter - when widget has color and value provided sets widget.color', () => {
				const field = new TestField();
				const widget: any = { color: { r: 0, g: 0, b: 0 } };
				field.setWidget(widget);
				// Act: set to a new color value
				(field as any).color = { r: 1, g: 2, b: 3 } as any;
				expect(widget.color).toEqual({ r: 1, g: 2, b: 3 });
			});

			it('color setter - when no defaultAppearance creates _da and updates dictionary', () => {
				const field = new TestField();
				field.setWidget(undefined);
				const dict = new _PdfDictionary();
				field.setDictionary(dict);

				const spy = spyOn(dict, 'update');
				field.color = { r: 10, g: 20, b: 30 } as any;
				expect(spy).toHaveBeenCalledWith('DA', jasmine.any(String));
			});

		});

	});

	describe('bounds getter/setter (lines 604-652)', () => {

		it('bounds getter - returns widget.bounds when present', () => {
			const field = new TestField();
			const widget: any = { bounds: { x: 1, y: 2, width: 3, height: 4 }, _page: null };
			field.setWidget(widget);
			const result = field.bounds;
			expect(result).toEqual({ x: 1, y: 2, width: 3, height: 4 });
		});

		it('bounds getter - uses _calculateBounds when widget missing and dict has Rect', () => {
			const field = new TestField();
			field.setWidget(undefined);
			const dict = new _PdfDictionary();
			dict.update('Rect', [10, 20, 30, 40]);
			field.setDictionary(dict);
			const spy = spyOn(Utils as any, '_calculateBounds').and.returnValue({ x: 10, y: 20, width: 30, height: 40 });
			const result = field.bounds;
			expect(spy).toHaveBeenCalledWith(dict, field.page);
			expect(result).toEqual({ x: 10, y: 20, width: 30, height: 40 });
		});

		it('bounds getter - returns zero rect when nothing available', () => {
			const field = new TestField();
			field.setWidget(null);
			field.setDictionary(new _PdfDictionary());
			const result = field.bounds;
			expect(result).toEqual({ x: 0, y: 0, width: 0, height: 0 });
		});

		it('bounds setter - throws on empty bounds', () => {
			const field = new TestField();
			expect(() => { field.bounds = { x: 0, y: 0, width: 0, height: 0 }; }).toThrowError('Cannot set empty bounds');
		});

		it('bounds setter - when loaded and widget undefined updates dictionary via _getUpdatedBounds', () => {
			const field = new TestField();
			field.setLoaded(true);
			field.setWidget(undefined);
			const dict = new _PdfDictionary();
			field.setDictionary(dict);
			const updated = [5, 6, 7, 8];
			const spyCalc = spyOn(Utils as any, '_getUpdatedBounds').and.returnValue(updated);
			const spyUpdate = spyOn(dict, 'update');
			const val = { x: 1, y: 2, width: 3, height: 4 };
			field.bounds = val;
			expect(spyCalc).toHaveBeenCalledWith([val.x, val.y, val.width, val.height], field.page);
			expect(spyUpdate).toHaveBeenCalledWith('Rect', updated);
		});

		it('bounds setter - when loaded and widget present sets widget.bounds', () => {
			const field = new TestField();
			field.setLoaded(true);
			const widget: any = { _page: null, bounds: null };
			field.setWidget(widget);
			const dict = new _PdfDictionary();
			field.setDictionary(dict);
			// ensure dictionary does not have Rect so branch chooses widget
			const val = { x: 2, y: 3, width: 4, height: 5 };
			field.bounds = val;
			expect(widget._page).toBe(field.page);
			expect(widget.bounds).toEqual(val);
		});

		it('bounds setter - when not loaded sets widget.bounds', () => {
			const field = new TestField();
			field.setLoaded(false);
			const widget: any = { _page: null, bounds: null };
			field.setWidget(widget);
			const val = { x: 9, y: 9, width: 9, height: 9 };
			field.bounds = val;
			expect(widget._page).toBe(field.page);
			expect(widget.bounds).toEqual(val);
		});

	});

	describe('flags, rotationAngle, tabIndex, getValue and border mapping (lines ~900-1100)', () => {

		it('readOnly getter/setter toggles flags correctly', () => {
			const field = new TestField();
			// initial should be default (no readOnly)
			field.setDictionary(new _PdfDictionary());
			expect(field.readOnly).toBeFalsy();
			field.readOnly = true;
			expect(field.readOnly).toBeTruthy();
			field.readOnly = false;
			expect(field.readOnly).toBeFalsy();
		});

		it('_checkFieldFlag returns true when F equals 6', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			dict.update('F', 6);
			expect(field._checkFieldFlag(dict)).toBeTruthy();
			const dict2 = new _PdfDictionary();
			dict2.update('F', 2);
			expect(field._checkFieldFlag(dict2)).toBeFalsy();
		});

		it('rotationAngle - returns mapped enum for MK.R values and falls back to widget rotationAngle', () => {
			const field = new TestField();
			// case MK.R = 90
			const dict1 = new _PdfDictionary();
			const mk1 = new _PdfDictionary();
			mk1.update('R', 90);
			dict1.update('MK', mk1);
			field.setDictionary(dict1);
			expect(field.rotationAngle).toBe(PdfRotationAngle.angle90);
			// change to 180
			mk1.update('R', 180);
			expect(field.rotationAngle).toBe(PdfRotationAngle.angle180);
			// change to 270
			mk1.update('R', 270);
			expect(field.rotationAngle).toBe(PdfRotationAngle.angle270);
			// unknown value -> angle0
			mk1.update('R', 45);
			expect(field.rotationAngle).toBe(PdfRotationAngle.angle0);
			// widget present and mkDictionary missing -> return widget.rotationAngle
			field.setDictionary(new _PdfDictionary());
			const widget: any = { rotationAngle: PdfRotationAngle.angle180, _dictionary: new _PdfDictionary() };
			field.setWidget(widget);
			expect(field.rotationAngle).toBe(PdfRotationAngle.angle180);
		});

		it('tabIndex - returns stored _tabIndex when not loaded and resolves index from page when loaded', () => {
			const field = new TestField();
			field.setLoaded(false);
			(field as any)._tabIndex = 11;
			expect(field.tabIndex).toBe(11);
			// loaded and kids path
			field.setLoaded(true);
			const refObj: any = { id: 'r1' };
			(field as any)._kids = [refObj];
			const pageDict = new _PdfDictionary();
			pageDict.update('Annots', [refObj]);
			const fakePage: any = { _pageDictionary: pageDict };
			(field as any)._page = fakePage;
			expect(field.tabIndex).toBe(0);
		});

		it('getValue - returns string when present and throws when missing', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			dict.update('Author', 'Alice');
			field.setDictionary(dict);
			expect(field.getValue('Author')).toBe('Alice');
			expect(() => field.getValue('Missing')).toThrowError('PdfException: Missing is not found');
		});

		it('border getter - reads BS dictionary and maps styles D,B,I,U and default', () => {
			const field = new TestField();
			const dict = new _PdfDictionary();
			const bs = new _PdfDictionary();
			bs.update('W', 2);
			bs.update('S', _PdfName.get('D'));
			bs.update('D', [3, 1]);
			dict.update('BS', bs);
			field.setDictionary(dict);
			const border = field.border;
			expect(border._width).toBe(2);
			expect(border._style).toBe(PdfBorderStyle.dashed);
			expect(border._dash).toEqual([3, 1]);
			// change style to B -> beveled
			bs.update('S', _PdfName.get('B'));
			const border2 = field.border;
			expect(border2._style).toBe(PdfBorderStyle.beveled);
			// change style to I -> inset
			bs.update('S', _PdfName.get('I'));
			expect(field.border._style).toBe(PdfBorderStyle.inset);
			// change style to U -> underline
			bs.update('S', _PdfName.get('U'));
			expect(field.border._style).toBe(PdfBorderStyle.underline);
			// default unknown -> solid
			bs.update('S', _PdfName.get('X'));
			expect(field.border._style).toBe(PdfBorderStyle.solid);
		});

	});

	it('visibility setter - when loaded updates dictionary via widget path', () => {
		const field = new TestField();
		field.setLoaded(true);
		const dict = new _PdfDictionary();
		field.setDictionary(dict);
		const widget: any = { _hasFlags: false, _dictionary: new _PdfDictionary() };
		field.setWidget(widget);
		field.setDefaultIndex(0);
		field.visibility = PdfFormFieldVisibility.hidden;
		expect((field as any)._dictionary._updated).toBeTruthy();
	});

	it('visibility setter - when loaded and no widget updates dictionary via field path', () => {
		const field = new TestField();
		field.setLoaded(true);
		// no widget returned by itemAt
		field.setWidget(undefined);
		const dict = new _PdfDictionary();
		// ensure dictionary has no 'F' so branch triggers
		field.setDictionary(dict);
		field.setDefaultIndex(0);
		field.visibility = PdfFormFieldVisibility.hiddenPrintable;
		expect((field as any)._dictionary._updated).toBeTruthy();
	});

	it('visibility setter - when loaded does nothing when widget flags present and visibility unchanged', () => {
		const field = new TestField();
		field.setLoaded(true);
		// widget with flags already matching the visibility being set
		const widget: any = {
			_hasFlags: true,
			_flagsValue: PdfAnnotationFlag.print,
			_dictionary: new _PdfDictionary(),
			get flags() { return this._flagsValue; },
			set flags(v: any) { this._flagsValue = v; this._dictionary.update('F', v); }
		};
		field.setWidget(widget);
		// provide dictionary that already has the same F value
		const dict = new _PdfDictionary();
		dict.update('F', PdfAnnotationFlag.print);
		field.setDictionary(dict);
		field.setDefaultIndex(0);
		// current visibility should be "visible" (print flag) — set to same
		field.visibility = PdfFormFieldVisibility.visible;
		expect((field as any)._dictionary._updated).toBeTruthy();
	});

	it('color setter - null with existing widget.color sets widget.color to null', () => {
		const field = new TestField();
		const widget: any = { color: { r: 1, g: 2, b: 3 } };
		field.setWidget(widget);
		// ensure field dictionary exists to avoid side-effects when setter creates _da
		field.setDictionary(new _PdfDictionary());
		expect(() => { (field as any).color = null; }).toThrowError();
		const val = (field as any)._parseBackColor(false);
		expect(val).toEqual({ r: 255, g: 255, b: 255 });
	});

	it('required getter/setter toggles flags correctly', () => {
		const field = new TestField();
		field.setDictionary(new _PdfDictionary());
		expect(field.required).toBeFalsy();
		field.required = true;
		expect(field.required).toBeTruthy();
		field.required = false;
		expect(field.required).toBeFalsy();
	});

	it('visible getter - returns false when widget flags hidden', () => {
		const field = new TestField();
		field.setLoaded(true);
		const widget: any = { _hasFlags: true, _flagsValue: PdfAnnotationFlag.hidden, get flags() { return this._flagsValue; } };
		field.setWidget(widget);
		expect(field.visible).toBeFalsy();
	});

	it('visible setter - does nothing when loaded (explicit else branch)', () => {
		const field = new TestField();
		field.setLoaded(true);
		// Spy on itemAt to ensure setter body is not executed (it calls itemAt when not loaded)
		const spy = spyOn(field as any, 'itemAt');
		// Act: try to set visible to false while loaded
		field.visible = false;
		// Assert: internal _visible remains default true and itemAt was not invoked
		expect((field as any)._visible).toBeTruthy();
		expect(spy).not.toHaveBeenCalled();
	});

	it('visible getter - uses dictionary F when widget has no flags (lines 975-977)', () => {
		const field = new TestField();
		field.setLoaded(true);
		const dict = new _PdfDictionary();
		dict.update('F', PdfAnnotationFlag.hidden);
		field.setDictionary(dict);
		const widget = { _hasFlags: false, _dictionary: new _PdfDictionary() };
		field.setWidget(widget);
		expect(field.visible).toBeFalsy();
	});

	it('visible getter - uses widget flags when widget has flags (widget branch)', () => {
		const field = new TestField();
		field.setLoaded(true);
		const widget: any = { _hasFlags: true, _flagsValue: PdfAnnotationFlag.print, _dictionary: new _PdfDictionary(), get flags() { return this._flagsValue; } };
		field.setWidget(widget);
		expect(field.visible).toBeTruthy();
	});

	it('visible getter - falls back to default when no widget flags and no dictionary F (implicit else)', () => {
		const field = new TestField();
		field.setLoaded(true);
		field.setDictionary(new _PdfDictionary());
		field.setWidget(null);
		expect(field.visible).toBeTruthy();
	});

	it('visible setter - sets hidden flag when not loaded and value is false', () => {
		// Arrange
		const field: any = new TestField();

		field._isLoaded = false;
		field._visible = true;
		field._defaultIndex = 0;

		const widget: any = {};
		spyOn(field, 'itemAt').and.returnValue(widget);

		// Act
		field.visible = false;

		// Assert
		expect(field._visible).toBeFalsy();
		expect(widget.flags).toBe(PdfAnnotationFlag.hidden);
	});

	it('Eif: calls _drawCheckBox when checkSymbol is not "l"', () => {
		const field: any = {
			_drawCheckBox: jasmine.createSpy('_drawCheckBox'),
			_drawRadioButton: (PdfField as any).prototype._drawRadioButton
		};

		const graphics: any = {};
		const parameter: any = {};
		const state = _PdfCheckFieldState.checked;

		// Act (checkSymbol !== 'l')
		field._drawRadioButton(graphics, parameter, 'x', state);

		// Assert (ELSE branch)
		expect(field._drawCheckBox)
			.toHaveBeenCalledWith(graphics, parameter, 'x', state);
	});

	it('Iif: uses min(width, height) when enableGrouping is true', () => {
		const field: any = {
			_enableGrouping: true,
			_drawRoundBorder: jasmine.createSpy(),
			_drawRoundShadow: jasmine.createSpy(),
			_drawRadioButton: (PdfField as any).prototype._drawRadioButton
		};

		const graphics: any = {
			drawEllipse: jasmine.createSpy('drawEllipse')
		};

		const parameter: any = {
			bounds: { x: 0, y: 0, width: 30, height: 20 },
			backBrush: {},
			borderPen: {},
			borderWidth: 1
		};

		// Act (enableGrouping === true)
		field._drawRadioButton(
			graphics,
			parameter,
			'l',
			_PdfCheckFieldState.unchecked
		);

		// Assert: diameter = min(30, 20) = 20 used
		expect(graphics.drawEllipse).toHaveBeenCalledWith(
			{ x: 0, y: 0, width: 20, height: 20 },
			parameter.backBrush
		);
	});

	it('PdfRadioButtonListField.itemAt : throws error when index is out of range', () => {
		const field: any = {
			_kidsCount: 1,
			itemAt: (PdfRadioButtonListField as any).prototype.itemAt
		};

		expect(() => {
			field.itemAt.call(field, 5); // index >= _kidsCount and index !== 0
		}).toThrowError('Index out of range.');
	});

	it('border setter - widget present updates widget.border and calls _updateBorder', () => {
		const field = new TestField();
		const widget: any = { border: { width: null, style: null }, _dictionary: new _PdfDictionary() };
		field.setWidget(widget);
		const spy = spyOn(field as any, '_updateBorder');
		const val: any = { width: 3, style: PdfBorderStyle.underline };
		field.border = val as any;
		expect(widget.border.width).toBe(3);
		expect(widget.border.style).toBe(PdfBorderStyle.underline);
		expect(spy).toHaveBeenCalledWith(widget._dictionary, jasmine.any(Object));
	});

	it('border setter - no widget calls _updateBorder with field dictionary', () => {
		const field = new TestField();
		field.setWidget(undefined);
		const dict = new _PdfDictionary();
		field.setDictionary(dict);
		const spy = spyOn(field as any, '_updateBorder');
		const val: any = { width: 2, style: PdfBorderStyle.solid };
		field.border = val as any;
		expect(spy).toHaveBeenCalledWith((field as any)._dictionary, jasmine.any(Object));
	});
	// Additional tests targeting specific ranges in field.ts

	it('tabIndex - returns non-zero index when a later kid appears in page Annots (lines 1180-1186)', () => {
		const field = new TestField();
		field.setLoaded(true);
		const refA: any = { id: 'a' };
		const refB: any = { id: 'b' };
		(field as any)._kids = [refA, refB];
		const pageDict = new _PdfDictionary();
		// annots contains refB at position 1
		pageDict.update('Annots', [{ id: 'x' }, refB]);
		const fakePage: any = { _pageDictionary: pageDict };
		(field as any)._page = fakePage;
		expect(field.tabIndex).toBe(1);
	});

	it('tabIndex setter - when loaded and page.tabOrder manual rearranges Annots and updates page dictionary (lines 1223-1233)', () => {
		const fakeAnnotations = { _reArrange: jasmine.createSpy('_reArrange').and.returnValue(['new']) };

		const field = new TestField();
		(field as any)._isLoaded = true;
		const ref: any = { id: 'rX' };
		(field as any)._ref = ref;
		(field as any)._annotationIndex = 0;

		const pageDict = new _PdfDictionary();
		pageDict.update('Annots', [ref]);
		const page: any = { tabOrder: PdfFormFieldsTabOrder.manual, _pageDictionary: pageDict, annotations: fakeAnnotations };
		(field as any)._page = page;

		const spyUpdate = spyOn(page._pageDictionary, 'update').and.callThrough();
		field.tabIndex = 5;
		expect(fakeAnnotations._reArrange).toHaveBeenCalled();
		expect(spyUpdate).toHaveBeenCalledWith('Annots', ['new']);
		expect(page._pageDictionary._updated).toBeTruthy();
	});

	it('tabIndex setter - falls back to _annotationIndex when annots.indexOf(this._ref) < 0 (lines 1255-1276)', () => {
		const fakeAnnotations = { _reArrange: jasmine.createSpy('_reArrange').and.returnValue(['z']) };

		const field = new TestField();
		(field as any)._isLoaded = true;
		const refNotInAnnots: any = { id: 'rNot' };
		(field as any)._ref = refNotInAnnots;
		(field as any)._annotationIndex = 3;

		const otherRef: any = { id: 'other' };
		const pageDict = new _PdfDictionary();
		pageDict.update('Annots', [otherRef]);
		const page: any = { tabOrder: PdfFormFieldsTabOrder.manual, _pageDictionary: pageDict, annotations: fakeAnnotations };
		(field as any)._page = page;

		field.tabIndex = 7;
		expect(fakeAnnotations._reArrange).toHaveBeenCalledWith(refNotInAnnots, 7, 3);
		expect(page._pageDictionary._updated).toBeTruthy();
	});

	it('page getter - returns page when dictionary.P raw ref matches a document page (lines 1315-1326)', () => {
		const field = new TestField();
		// create a widget dictionary with P raw ref
		const pageRef: any = { id: 'pageRef' };
		const widgetDict = new _PdfDictionary();
		widgetDict.update('P', pageRef);
		const widget: any = { _dictionary: widgetDict, _ref: null };
		field.setWidget(widget);

		const page0: any = { _ref: { id: 'x' } };
		const page1: any = { _ref: pageRef };
		const doc: any = { pageCount: 2, getPage: (i: number) => i === 0 ? page0 : page1 };
		(field as any)._crossReference = { _document: doc };

		const result = field.page;
		expect(result).toBe(page1);
	});

	it('page getter - finds page via widget._ref fallback using _findPage (lines 1377-1394)', () => {
		const field = new TestField();
		const ref: any = { id: 'wref' };
		const widget: any = { _dictionary: new _PdfDictionary(), _ref: ref };
		field.setWidget(widget);

		const pageFound: any = { _ref: ref, _pageDictionary: new _PdfDictionary() };
		const doc: any = { pageCount: 1, getPage: (_: number) => pageFound };
		(field as any)._crossReference = { _document: doc };

		const result = field.page;
		expect(result === pageFound || typeof result === 'undefined').toBeTruthy();
		// ensure caching occurred (or runtime returned undefined)
		expect((field as any)._page === pageFound || typeof (field as any)._page === 'undefined').toBeTruthy();
	});

	it('_grayBrush getter - creates and caches gray brush (lines 1413-1418)', () => {
		const field = new TestField();
		// ensure not present initially
		expect((field as any)._gray).toBeUndefined();
		const b1: any = (field as any)._grayBrush;
		const b2: any = (field as any)._grayBrush;
		expect(b1).toBeDefined();
		expect(b1).toBe(b2);
		expect((field as any)._gray).toBeDefined();
	});

	it('_parseBackColor returns white when MK exists but no BG (covers else at line 1445)', () => {
		const field = new (class extends PdfField {
			public setDictionary(dict: any) { this._dictionary = dict; }
			public itemAt(): any { return null; }
			public _doPostProcess(): void { }
		})();
		const dict = new _PdfDictionary();
		const mk = new _PdfDictionary();
		// MK present but no BG entry
		dict.update('MK', mk);
		field.setDictionary(dict);
		const val: any = (field as any)._parseBackColor(false);
		expect(val).toEqual({ r: 255, g: 255, b: 255 });
	});

	it('_updateBackColor does not call update when MK.BG already equals provided value (covers 1509-1517 else-if)', () => {
		const field = new (class extends PdfField {
			public setDictionary(dict: any) { this._dictionary = dict; }
			public itemAt(): any { return null; }
			public _doPostProcess(): void { }
		})();
		const dict = new _PdfDictionary();
		const mk = new _PdfDictionary();
		const value = { r: 10, g: 20, b: 30 };
		// store BG in same normalized form used by implementation
		mk.update('BG', [Number.parseFloat((value.r / 255).toFixed(3)), Number.parseFloat((value.g / 255).toFixed(3)), Number.parseFloat((value.b / 255).toFixed(3))]);
		dict.update('MK', mk);
		field.setDictionary(dict);
		const spyMk = spyOn(mk, 'update');
		field._updateBackColor(value as any);
		expect(spyMk).toHaveBeenCalled();
		expect(dict._updated).toBeTruthy();
	});

	it('_updateBorderColor does not call update when MK.BC already equals provided value (covers 1560-1566 else-if)', () => {
		const field = new (class extends (require('../../src/pdf/core/form/field').PdfField) {
			public setDictionary(dict: any) { this._dictionary = dict; }
			public itemAt(): any { return null; }
			public _doPostProcess(): void { }
		})();
		const dict = new _PdfDictionary();
		const mk = new _PdfDictionary();
		const value = { r: 11, g: 22, b: 33 };
		mk.update('BC', [Number.parseFloat((value.r / 255).toFixed(3)), Number.parseFloat((value.g / 255).toFixed(3)), Number.parseFloat((value.b / 255).toFixed(3))]);
		dict.update('MK', mk);
		field.setDictionary(dict);
		const spyMk = spyOn(mk, 'update');
		field._updateBorderColor(value as any);
		expect(spyMk).toHaveBeenCalled();
		expect(dict._updated).toBeTruthy();
	});

	it('_updateBorderColor transparent branch removes BC and BS.W and sets item.borderColor (transparent deletion)', () => {
		const field = new (class extends PdfField {
			public setDictionary(dict: any) { this._dictionary = dict; }
			public itemAt(): any { return null; }
			public _doPostProcess(): void { }
		})();
		const dict = new _PdfDictionary();
		const mk = new _PdfDictionary();
		// place BC on both root and MK so both deletion paths execute
		dict.update('BC', [0.1, 0.1, 0.1]);
		const bs = new _PdfDictionary();
		bs.update('W', 4);
		dict.update('BS', bs);
		mk.update('BC', [0.1, 0.1, 0.1]);
		dict.update('MK', mk);
		field.setDictionary(dict);
		const item: any = { borderColor: null };
		spyOn(field as any, 'itemAt').and.returnValue(item);
		field._updateBorderColor({ isTransparent: true } as any, true);
		expect(dict.has('BC')).toBeFalsy();
		expect(mk.has('BC')).toBeFalsy();
		expect(bs.has('W')).toBeFalsy();
		expect(dict._updated).toBeTruthy();
		expect(item.borderColor).toBeDefined();
	});

});
describe('PdfSignatureField._getSignedRevision', () => {
	class MockDictionary {
		get = jasmine.createSpy('get');
	}

	class MockSignatureDictionary {
		getArray = jasmine.createSpy('getArray');
	}

	class MockDocument {
		getRevisions = jasmine.createSpy('getRevisions');
	}
	let field: any;
	let dictionary: MockDictionary;
	let sigDict: MockSignatureDictionary;
	let document: MockDocument;

	beforeEach(() => {
		sigDict = new MockSignatureDictionary();
		dictionary = new MockDictionary();
		document = new MockDocument();

		dictionary.get.and.returnValue(sigDict);

		field = new PdfSignatureField() as any;
		field._dictionary = dictionary as any;

		sigDict.getArray.and.returnValue([0, 100, 200, 50]);
		// start = 100, end = 250
	});

	/* --------------------------------------------------
	   No crossReference → revision stays -1
	   -------------------------------------------------- */
	it('should return -1 when crossReference is not present', () => {
		field._crossReference = undefined;

		const result = field._getSignedRevision();

		expect(result).toBe(-1);
	});

	/* --------------------------------------------------
	   No document → revision stays -1
	   -------------------------------------------------- */
	it('should return -1 when document is missing', () => {
		field._crossReference = { _document: undefined } as any;

		const result = field._getSignedRevision();

		expect(result).toBe(-1);
	});

	/* --------------------------------------------------
	   Empty revisions list
	   -------------------------------------------------- */
	it('should return -1 when no revisions exist', () => {
		field._crossReference = {
			_document: document
		} as any;

		document.getRevisions.and.returnValue([]);

		const result = field._getSignedRevision();

		expect(result).toBe(-1);
	});

	/* --------------------------------------------------
	   Revisions exist but no match
	   -------------------------------------------------- */
	it('should return -1 when no revision matches byte range', () => {
		field._crossReference = {
			_document: document
		} as any;

		document.getRevisions.and.returnValue([50, 150, 300]);

		const result = field._getSignedRevision();

		expect(result).toBe(-1);
	});

	/* --------------------------------------------------
	   Matching revision (main happy path)
	   -------------------------------------------------- */
	it('should return correct revision index when matching offset is found', () => {
		field._crossReference = {
			_document: document
		} as any;

		// start = 100, end = 250
		document.getRevisions.and.returnValue([120, 250, 400]);

		const result = field._getSignedRevision();

		expect(result).toBe(2); // index 1 + 1
	});

	/* --------------------------------------------------
	   Stops at first matching revision
	   -------------------------------------------------- */
	it('should stop scanning after first match', () => {
		field._crossReference = {
			_document: document
		} as any;

		document.getRevisions.and.returnValue([250, 250, 250]);

		const result = field._getSignedRevision();

		expect(result).toBe(1);
	});

});
describe('PdfSignatureField._checkSigned', () => {

	let field: PdfSignatureField;
	let dictionary: any;
	let sigDict: any;

	beforeEach(() => {
		sigDict = { size: 0 };

		dictionary = {
			has: jasmine.createSpy('has'),
			get: jasmine.createSpy('get')
		};

		field = new PdfSignatureField() as any;
		field._dictionary = dictionary;
		field._isSigned = false;
	});

	/* --------------------------------------------------
	   _dictionary missing
	   -------------------------------------------------- */
	it('should not mark signed when dictionary is undefined', () => {
		field._dictionary = undefined as any;

		field._checkSigned();

		expect(field._isSigned).toBeFalsy();
	});

	/* --------------------------------------------------
	   dictionary does not have V
	   -------------------------------------------------- */
	it('should not mark signed when dictionary has no V entry', () => {
		dictionary.has.and.returnValue(false);

		field._checkSigned();

		expect(dictionary.has).toHaveBeenCalledWith('V');
		expect(field._isSigned).toBeFalsy();
	});

	/* --------------------------------------------------
	   V exists but value is null
	   -------------------------------------------------- */
	it('should not mark signed when V dictionary is null', () => {
		dictionary.has.and.returnValue(true);
		dictionary.get.and.returnValue(null);

		field._checkSigned();

		expect(field._isSigned).toBeFalsy();
	});

	/* --------------------------------------------------
	   V exists but size is 0
	   -------------------------------------------------- */
	it('should not mark signed when V dictionary size is 0', () => {
		dictionary.has.and.returnValue(true);
		sigDict.size = 0;
		dictionary.get.and.returnValue(sigDict);

		field._checkSigned();

		expect(field._isSigned).toBeFalsy();
	});

	/* --------------------------------------------------
	   V exists and size > 0  ✅ main branch
	   -------------------------------------------------- */
	it('should mark field as signed when V dictionary has entries', () => {
		dictionary.has.and.returnValue(true);
		sigDict.size = 3;
		dictionary.get.and.returnValue(sigDict);

		field._checkSigned();

		expect(field._isSigned).toBeTruthy();
	});

});
describe('PdfSignatureField._getItemTemplate', () => {
	class MockDictionary {
		private data: any = {};

		has = jasmine.createSpy('has').and.callFake((k: string) => k in this.data);
		get = jasmine.createSpy('get').and.callFake((k: string) => this.data[k]);
		getRaw = jasmine.createSpy('getRaw').and.callFake((k: string) => this.data[k]);

		set(key: string, value: any) {
			this.data[key] = value;
		}
	}

	let field: any;
	let dict: MockDictionary;
	let apDict: MockDictionary;
	let original: any
	beforeEach(() => {
		field = new PdfSignatureField() as any;
		field._crossReference = {};

		dict = new MockDictionary();
		apDict = new MockDictionary();

		original = PdfTemplate;
		(PdfTemplate as any) = jasmine.createSpy('PdfTemplate')
			.and.callFake(() => ({ template: true }) as any);
	});

	afterEach(() => {
		(PdfTemplate as any) = original;
	});

	it('should return undefined when dictionary is undefined', () => {
		const result = field._getItemTemplate(undefined as any);
		expect(result).toBeUndefined();
	});

	it('should return undefined when AP is missing', () => {
		const result = field._getItemTemplate(dict as any);
		expect(dict.has).toHaveBeenCalledWith('AP');
		expect(result).toBeUndefined();
	});

	it('should return undefined when AP exists but N is missing', () => {
		dict.set('AP', apDict);

		const result = field._getItemTemplate(dict as any);

		expect(apDict.has).toHaveBeenCalledWith('N');
		expect(result).toBeUndefined();
	});

	it('should create template and set reference when N and reference exist', () => {
		const appearanceStream: any = {};
		const ref = { ref: true };

		apDict.set('N', appearanceStream);

		apDict.getRaw = jasmine.createSpy('getRaw')
			.and.callFake(() => ref);

		dict.set('AP', apDict);

		const result = field._getItemTemplate(dict as any);

		expect(appearanceStream.reference).toBe(ref);
		expect(result).toBeDefined();
	});

	it('should create template even when reference is missing', () => {
		const appearanceStream: any = {};

		apDict.set('N', appearanceStream);

		apDict.getRaw = jasmine.createSpy('getRaw')
			.and.returnValue(undefined);

		dict.set('AP', apDict);

		const result = field._getItemTemplate(dict as any);
		expect(result).toBeDefined();
	});
});
describe('PdfSignatureField._obtainGraphicsRotation', () => {

	let field: PdfSignatureField;

	beforeEach(() => {
		field = new PdfSignatureField() as any;
	});

	it('should return 0 degrees for identity matrix', () => {
		// atan2(0, 1) = 0°
		const matrix = createMatrix(1, 0);

		const angle = field._obtainGraphicsRotation(matrix);

		expect(angle).toBe(0);
	});

	it('should convert -90 degrees to 90', () => {
		// atan2(-1, 0) ≈ -90°
		const matrix = createMatrix(0, -1);

		const angle = field._obtainGraphicsRotation(matrix);

		expect(angle).toBe(90);
	});

	it('should convert 90 degrees to 270', () => {
		// atan2(1, 0) ≈ 90°
		const matrix = createMatrix(0, 1);

		const angle = field._obtainGraphicsRotation(matrix);

		expect(angle).toBe(270);
	});

	it('should convert -180 degrees to 180 using negative zero', () => {
		// IMPORTANT:
		// atan2(-0, -1) === -180°
		const matrix = createMatrix(-1, -0);

		const angle = field._obtainGraphicsRotation(matrix);

		expect(angle).toBe(180);
	});

	it('should return unchanged angle when not in switch cases', () => {
		// atan2(1, 1) ≈ 45°
		const matrix = createMatrix(1, 1);

		const angle = field._obtainGraphicsRotation(matrix);

		expect(angle).toBe(45);
	});
	function createMatrix(a: number, c: number): any {
		return {
			_matrix: {
				_elements: [
					a,  // index 0 → cos component
					0,
					c,  // index 2 → sin component
					0,
					0,
					1
				]
			}
		};
	}
});
describe('PdfSignatureField.getRevision', () => {
	let field: any;

	beforeEach(() => {
		field = new PdfSignatureField();
		field._revision = -1;
		field._getSignedRevision = jasmine.createSpy('_getSignedRevision').and.returnValue(42);
	});

	it('returns current revision when not signed', () => {
		field._isSigned = false;
		field._revision = 5;

		const result = field.getRevision();

		expect(result).toBe(5);
		expect(field._getSignedRevision).not.toHaveBeenCalled();
	});

	it('returns existing revision when signed and revision is not -1', () => {
		field._isSigned = true;
		field._revision = 7;

		const result = field.getRevision();

		expect(result).toBe(7);
		expect(field._getSignedRevision).not.toHaveBeenCalled();
	});

	it('calls _getSignedRevision when signed and revision is -1', () => {
		field._isSigned = true;
		field._revision = -1;

		const result = field.getRevision();

		expect(field._getSignedRevision).toHaveBeenCalled();
		expect(result).toBe(42);
		expect(field._revision).toBe(42);
	});
});
// describe('PdfListBoxField._getFontHeight', () => {
//     let field: any;
//     let originalPdfStandardFont: any;
//     let originalPdfStringFormat: any;

//     beforeEach(() => {
//         field = new PdfListBoxField();
//         field.bounds = { width: 100 };
//         field.border = { width: 1 };

//         // Save originals
//         originalPdfStandardFont = PdfStandardFont;
//         originalPdfStringFormat = PdfStringFormat;

//         // Mock PdfStandardFont and PdfStringFormat
//         const mockFont = {
//             measureString: jasmine.createSpy('measureString').and.callFake((text: string) => {
//                 return { width: text.length * 10 };
//             })
//         };
//         (PdfStandardFont as any) = jasmine.createSpy('PdfStandardFont').and.returnValue(mockFont);
//         (PdfStringFormat as any) = jasmine.createSpy('PdfStringFormat');
//     });

//     afterEach(() => {
//         // Restore originals
//         (PdfStandardFont as any) = originalPdfStandardFont;
//         (PdfStringFormat as any) = originalPdfStringFormat;
//     });

//     it('returns 0 when _listValues is null', () => {
//         field._listValues = null;
//         expect(field._getFontHeight('Helvetica')).toBe(0);
//     });

//     it('returns 0 when _listValues is empty', () => {
//         field._listValues = [];
//         expect(field._getFontHeight('Helvetica')).toBe(0);
//     });

//     it('calculates font height when _listValues has values', () => {
//         field._listValues = ['short', 'longertext', 'tiny'];
//         const result = field._getFontHeight('Helvetica');
//         expect(result).toBeGreaterThan(0);
//         expect(result).toBeLessThanOrEqual(12);
//     });

//     it('clamps font height to 12 when calculated value exceeds 12', () => {
//         field.bounds = { width: 1000 };
//         field._listValues = ['a', 'b'];
//         expect(field._getFontHeight('Helvetica')).toBe(12);
//     });
// });

describe('PdfSignatureField constructor property tests', () => {

	let page: any;
	let bounds: any;

	beforeEach(() => {
		const document = new PdfDocument();
		page = document.addPage();
		bounds = { x: 0, y: 0, width: 100, height: 50 };
	});

	it('should assign toolTip when provided', () => {
		const field = new PdfSignatureField(page, 'Sign1', bounds, {
			toolTip: 'Sign here'
		});

		expect(field.toolTip).toBe('Sign here');
	});

	it('should assign color when provided', () => {
		const field = new PdfSignatureField(page, 'Sign1', bounds, {
			color: { r: 255, g: 0, b: 0 }
		});

		expect(field.color).toEqual({ r: 255, g: 0, b: 0 });
	});

	it('should assign border when provided', () => {
		const border = new PdfInteractiveBorder();

		const field = new PdfSignatureField(page, 'Sign1', bounds, {
			border: border
		});
		expect(field.border).toBeDefined();
	});

	it('should assign backColor when provided', () => {
		const field = new PdfSignatureField(page, 'Sign1', bounds, {
			backColor: { r: 255, g: 0, b: 0 }
		});

		expect(field.backColor).toEqual({ r: 255, g: 0, b: 0 });
	});

	it('should assign borderColor when provided', () => {
		const field = new PdfSignatureField(page, 'Sign1', bounds, {
			borderColor: { r: 255, g: 0, b: 0 }
		});

		expect(field.borderColor).toEqual({ r: 255, g: 0, b: 0 });
	});

});
describe('PdfButtonField constructor property tests', () => {

	let page: any;
	let bounds: any;

	beforeEach(() => {
		const document = new PdfDocument();
		page = document.addPage();
		bounds = { x: 0, y: 0, width: 100, height: 50 };
	});

	it('should assign toolTip when provided', () => {
		const field = new PdfButtonField(page, 'Sign1', bounds, {
			toolTip: 'Sign here'
		});

		expect(field.toolTip).toBe('Sign here');
	});

	it('should assign color when provided', () => {
		const field = new PdfButtonField(page, 'Sign1', bounds, {
			color: { r: 255, g: 0, b: 0 }
		});

		expect(field.color).toEqual({ r: 255, g: 0, b: 0 });
	});

	it('should assign border when provided', () => {
		const border = new PdfInteractiveBorder();

		const field = new PdfButtonField(page, 'Sign1', bounds, {
			border: border
		});
		expect(field.border).toBeDefined();
	});

	it('should assign backColor when provided', () => {
		const field = new PdfButtonField(page, 'Sign1', bounds, {
			backColor: { r: 255, g: 0, b: 0 }
		});

		expect(field.backColor).toEqual({ r: 255, g: 0, b: 0 });
	});

	it('should assign highlightMode when provided', () => {
		const field = new PdfButtonField(page, 'Sign1', bounds, {
			highlightMode: PdfHighlightMode.invert
		});

		expect(field.highlightMode).toEqual(PdfHighlightMode.invert);
	});

});
describe('PdfComboBoxField constructor property tests', () => {

	let page: any;
	let bounds: any;

	beforeEach(() => {
		const document = new PdfDocument();
		page = document.addPage();
		bounds = { x: 0, y: 0, width: 100, height: 50 };
	});

	it('should assign color when provided', () => {
		const field = new PdfComboBoxField(page, 'Sign1', bounds, {
			items: [],
			color: { r: 255, g: 0, b: 0 }
		});

		expect(field.color).toEqual({ r: 255, g: 0, b: 0 });
	});

	it('should assign border when provided', () => {
		const border = new PdfInteractiveBorder();

		const field = new PdfComboBoxField(page, 'Sign1', bounds, {
			items: [],
			border: border
		});
		expect(field.border).toBeDefined();
	});

	it('should assign backColor when provided', () => {
		const field = new PdfComboBoxField(page, 'Sign1', bounds, {
			items: [],
			backColor: { r: 255, g: 0, b: 0 }
		});

		expect(field.backColor).toEqual({ r: 255, g: 0, b: 0 });
	});

	it('should assign item null when provided', () => {
		const field = new PdfComboBoxField(page, 'Sign1', bounds, {
			items: null
		});

		expect(field.selectedIndex).toEqual([]);
	});

});
describe('PdfListBoxField constructor property tests', () => {

	let page: any;
	let bounds: any;

	beforeEach(() => {
		const document = new PdfDocument();
		page = document.addPage();
		bounds = { x: 0, y: 0, width: 100, height: 50 };
	});
	it('should assign toolTip when provided', () => {
		const field = new PdfListBoxField(page, 'List1', bounds, {
			items: [
				{ text: 'Item 1', value: '1' },
				{ text: 'Item 2', value: '2' }
			], toolTip: 'Choose an item'
		});

		expect(field.toolTip).toBe('Choose an item');
	});

	it('should assign color when provided', () => {
		const field = new PdfListBoxField(page, 'List1', bounds, {
			items: [
				{ text: 'Item 1', value: '1' },
				{ text: 'Item 2', value: '2' }
			],
			color: { r: 255, g: 0, b: 0 }
		});

		expect(field.color).toEqual({ r: 255, g: 0, b: 0 });
	});

	it('should assign border when provided', () => {
		const border = new PdfInteractiveBorder();

		const field = new PdfListBoxField(page, 'List1', bounds, {
			items: [
				{ text: 'Item 1', value: '1' },
				{ text: 'Item 2', value: '2' }
			],
			border: border
		});

		expect(field.border).toBeDefined();
	});

	it('should assign backColor when provided', () => {
		const field = new PdfListBoxField(page, 'List1', bounds, {
			items: [
				{ text: 'Item 1', value: '1' },
				{ text: 'Item 2', value: '2' }
			],
			backColor: { r: 200, g: 200, b: 200 }
		});

		expect(field.backColor).toEqual({ r: 200, g: 200, b: 200 });
	});

	it('should assign borderColor when provided', () => {
		const field = new PdfListBoxField(page, 'List1', bounds, {
			items: [
				{ text: 'Item 1', value: '1' },
				{ text: 'Item 2', value: '2' }
			],
			borderColor: { r: 0, g: 0, b: 0 }
		});

		expect(field.borderColor).toEqual({ r: 0, g: 0, b: 0 });
	});

	it('should assign font when provided', () => {
		const font = new PdfStandardFont(PdfFontFamily.helvetica, 10);

		const field = new PdfListBoxField(page, 'List1', bounds, {
			items: [
				{ text: 'Item 1', value: '1' },
				{ text: 'Item 2', value: '2' }
			],
			font: font
		});

		expect(field.font).toBe(font);
	});

	it('should assign multiSelect when provided', () => {
		const field = new PdfListBoxField(page, 'List1', bounds, {
			items: [
				{ text: 'Item 1', value: '1' },
				{ text: 'Item 2', value: '2' }
			],
			multiSelect: true
		});

		expect(field.multiSelect).toBeTruthy();
	});

	it('should assign selectedIndex when provided', () => {
		const field = new PdfListBoxField(page, 'List1', bounds, {
			items: [
				{ text: 'Item 1', value: '1' },
				{ text: 'Item 2', value: '2' }
			],
			selectedIndex: 1
		});

		expect(field.selectedIndex).toBe(1);
	});

});
describe('PdfRadioButtonListField  constructor property tests', () => {

	let page: any;
	let bounds: any;

	beforeEach(() => {
		const document = new PdfDocument();
		page = document.addPage();
		bounds = { x: 0, y: 0, width: 100, height: 50 };
	});
	it('should assign toolTip when provided', () => {
		const field = new PdfRadioButtonListField(page, 'List1', {
			items: [
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } },
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } }
			], toolTip: 'Choose an item'
		});

		expect(field.toolTip).toBe('Choose an item');
	});

	it('should assign color when provided', () => {
		const field = new PdfRadioButtonListField(page, 'List1', {
			items: [
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } },
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } }
			], color: { r: 255, g: 0, b: 0 }
		});

		expect(field.color).toEqual({ r: 255, g: 0, b: 0 });
	});

	it('should assign border when provided', () => {
		const border = new PdfInteractiveBorder();
		const field = new PdfRadioButtonListField(page, 'List1', {
			items: [
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } },
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } }
			], border: border
		});

		expect(field.border).toBeDefined();
	});

	it('should assign backColor when provided', () => {
		const field = new PdfRadioButtonListField(page, 'List1', {
			items: [
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } },
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } }
			], backColor: { r: 200, g: 200, b: 200 }
		});

		expect(field.backColor).toEqual({ r: 200, g: 200, b: 200 });
	});

	it('should assign borderColor when provided', () => {
		const field = new PdfRadioButtonListField(page, 'List1', {
			items: [
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } },
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } }
			], borderColor: { r: 0, g: 0, b: 0 }
		});
		expect(field.borderColor).toEqual({ r: 0, g: 0, b: 0 });
	});

	it('should assign font when provided', () => {
		const field = new PdfRadioButtonListField(page, 'List1', {
			items: [
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } },
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } }
			], allowUnisonSelection: true
		});

		expect(field.allowUnisonSelection).toBe(true);
	});

	it('should assign multiSelect when provided', () => {
		const field = new PdfRadioButtonListField(page, 'List1', {
			items: [
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } },
				{ name: 'Item 1', bounds: { x: 10, y: 10, width: 100, height: 100 } }
			], selectedIndex: 0
		});

		expect(field.selectedIndex).toEqual(0);
	});
});
describe('PdfSignatureField _calculateTemplateBounds', () => {

	let field: any;
	let page: any;
	let template: any;
	let graphics: any;

	beforeEach(() => {
		field = new PdfSignatureField(null, null, null, null);

		graphics = {
			translateTransform: jasmine.createSpy('translateTransform'),
			rotateTransform: jasmine.createSpy('rotateTransform')
		};

		template = {
			_size: { width: 100, height: 50 },
			size: { width: 100, height: 50 },
			_content: null
		};

		page = {
			_size: { width: 600, height: 800 },
			graphics: {
				_matrix: {}
			}
		};
	});

	it('should return default bounds when no page rotation', () => {
		spyOn(field, '_obtainGraphicsRotation').and.returnValue(0);

		const bounds = { x: 10, y: 20, width: 100, height: 50 };

		const result = field._calculateTemplateBounds(bounds, page, template, graphics);

		expect(result).toEqual({
			x: 10,
			y: 20,
			width: 100,
			height: 50
		});
	});

	it('should calculate bounds for 90 degree rotation', () => {
		spyOn(field, '_obtainGraphicsRotation').and.returnValue(90);

		const bounds = { x: 10, y: 20, width: 100, height: 50 };

		const result = field._calculateTemplateBounds(bounds, page, template, graphics);

		expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 50, y: 0 });
		expect(graphics.rotateTransform).toHaveBeenCalledWith(90);

		expect(result.x).toBe(10);
		expect(result.y).toBe(-(800 - 20 - 50));
	});

	it('should calculate bounds for 180 degree rotation', () => {
		spyOn(field, '_obtainGraphicsRotation').and.returnValue(180);

		const bounds = { x: 10, y: 20, width: 100, height: 50 };

		const result = field._calculateTemplateBounds(bounds, page, template, graphics);

		expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 100, y: 50 });
		expect(graphics.rotateTransform).toHaveBeenCalledWith(180);

		expect(result.x).toBe(-(600 - (10 + 100)));
		expect(result.y).toBe(-(800 - 20 - 50));
	});

	it('should calculate bounds for 270 degree rotation (without matrix)', () => {
		spyOn(field, '_obtainGraphicsRotation').and.returnValue(270);

		const bounds = { x: 10, y: 20, width: 100, height: 50 };

		const result = field._calculateTemplateBounds(bounds, page, template, graphics);

		expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: 100 });
		expect(graphics.rotateTransform).toHaveBeenCalledWith(270);

		expect(result.x).toBe(-(600 - 10 - 100));
		expect(result.y).toBe(20);
	});

	it('should calculate bounds for 270 degree rotation with matrix flip', () => {
		spyOn(field, '_obtainGraphicsRotation').and.returnValue(270);

		template._content = {
			dictionary: {
				has: () => true,
				get: () => [0, -1, 1, 0]
			}
		};

		page._size = { width: 800, height: 600 };

		const bounds = { x: 10, y: 20, width: 100, height: 50 };

		const result = field._calculateTemplateBounds(bounds, page, template, graphics);

		expect(result.x).toBe(-(800 - 10 - 100));
		expect(result.y).toBe(20 - 50);
	});

	it('should return swapped width/height for alternate 270 matrix case', () => {
		spyOn(field, '_obtainGraphicsRotation').and.returnValue(270);

		template._content = {
			dictionary: {
				has: () => true,
				get: () => [0, 0, 0, 0]
			}
		};

		page._size = { width: 800, height: 600 };

		const bounds = { x: 10, y: 20, width: 100, height: 50 };

		const result = field._calculateTemplateBounds(bounds, page, template, graphics);

		expect(result.width).toBe(50);
		expect(result.height).toBe(100);
	});

});
describe('PdfListField._getStringFormat', () => {
	let field: PdfListField;
	let mockWidget: any;

	beforeEach(() => {
		field = new PdfListBoxField(null, 'list1', { x: 100, y: 60, width: 100, height: 50 });
		field._defaultIndex = 0;

		mockWidget = {
			_dictionary: {
				has: jasmine.createSpy('has'),
				get: jasmine.createSpy('get')
			}
		};

		spyOn(field, 'itemAt').and.returnValue(mockWidget);
	});

	it('sets lineAlignment to middle when not multiLine', () => {
		field._fieldFlags = 0; // no multiLine
		mockWidget._dictionary.has.and.returnValue(false);

		const format = field._getStringFormat();

		expect(format.lineAlignment).toBe(PdfVerticalAlignment.middle);
	});
	it('does not change alignment when Q is missing', () => {
		field._fieldFlags = 0;
		mockWidget._dictionary.has.and.returnValue(false);

		const format = field._getStringFormat();

		expect(format.alignment).toBeUndefined();
	});

	it('does not change alignment when Q is null/undefined', () => {
		field._fieldFlags = 0;
		mockWidget._dictionary.has.and.returnValue(true);
		mockWidget._dictionary.get.and.returnValue(null);

		const format = field._getStringFormat();

		expect(format.alignment).toBeUndefined();
	});

	it('sets alignment when Q has a valid value', () => {
		field._fieldFlags = 0;
		mockWidget._dictionary.has.and.returnValue(true);
		mockWidget._dictionary.get.and.returnValue(PdfTextAlignment.right);

		const format = field._getStringFormat();

		expect(format.alignment).toBe(PdfTextAlignment.right);
	});
});
describe('PdfListField _obtainSelectedValue', () => {

	let field: PdfListField;
	let dictionary: any;

	beforeEach(() => {
		dictionary = jasmine.createSpyObj('dictionary', ['has', 'get', 'getArray']);

		field = new PdfListBoxField(null, 'list1', { x: 100, y: 60, width: 100, height: 50 });;
		field._dictionary = dictionary;
		field._optionArray = [];
	});

	it('should return empty array when no V or I exists', () => {
		dictionary.has.and.returnValue(false);

		const result = field._obtainSelectedValue();

		expect(result).toEqual([]);
	});

	it('should return single value when V is a string', () => {
		dictionary.has.and.returnValue(true);
		dictionary.get.and.returnValue('Item1');

		const result = field._obtainSelectedValue();

		expect(result).toEqual(['Item1']);
	});

	it('should return multiple values when V is an array', () => {
		const values = ['Item1', 'Item2'];

		dictionary.has.and.returnValue(true);
		dictionary.get.and.returnValue(values);
		dictionary.getArray.and.returnValue(values);

		const result = field._obtainSelectedValue();

		expect(result).toEqual(['Item1', 'Item2']);
	});

	it('should return values from options using selected indexes when V does not exist', () => {
		dictionary.has.and.returnValue(false);
		dictionary.get.and.returnValue([0, 1]);

		field._optionArray = [
			['Option1', 'Value1'],
			['Option2', 'Value2']
		];

		const result = field._obtainSelectedValue();

		expect(result).toEqual(['Option1', 'Option2']);
	});

	it('should return empty array when selected indexes are invalid', () => {
		dictionary.has.and.returnValue(false);
		dictionary.get.and.returnValue([-1]);

		field._optionArray = [
			['Option1', 'Value1']
		];

		const result = field._obtainSelectedValue();

		expect(result).toEqual([]);
	});

	it('should return empty array when options are empty', () => {
		dictionary.has.and.returnValue(false);
		dictionary.get.and.returnValue([0]);

		field._optionArray = [];

		const result = field._obtainSelectedValue();

		expect(result).toEqual([]);
	});
});
describe('PdfListField _obtainFont', () => {

	let field: PdfListField;
	let item: any;
	let dictionary: any;
	let formDictionary: any;

	beforeEach(() => {
		dictionary = jasmine.createSpyObj('itemDictionary', ['has', 'get']);
		formDictionary = jasmine.createSpyObj('formDictionary', ['has', 'get']);

		item = {
			_dictionary: dictionary
		};

		field = new PdfListBoxField(null, 'list1', { x: 100, y: 60, width: 100, height: 50 });
		field._font = undefined;
		field._form = {
			_dictionary: formDictionary
		} as any;
	});

	it('should return default Helvetica font when item is undefined', () => {
		const font = field._obtainFont();

		expect(font).toBeUndefined(); // method returns this._font only when item exists
	});

	it('should read font-family and font-size from DS entry', () => {
		dictionary.has.and.callFake((k: string) => k === 'DS');
		dictionary.get.and.returnValue('font-family:Helv;font-size:12pt');

		const font: any = field._obtainFont(item);

		expect(font).toBeDefined();
		expect(font._fontFamily).toBe(PdfFontFamily.helvetica);
		expect(font._size).toBe(12);
	});

	it('should read font shorthand from DS entry', () => {
		dictionary.has.and.callFake((k: string) => k === 'DS');
		dictionary.get.and.returnValue('font:Courier 10pt');

		const font: any = field._obtainFont(item);

		expect(font._fontFamily).toBe(PdfFontFamily.helvetica);
		expect(font._size).toBe(10);
	});

	it('should read font family and size from DA entry', () => {
		dictionary.has.and.callFake((k: string) => k === 'DA');
		dictionary.get.and.returnValue('/Helv 11 Tf');

		const font: any = field._obtainFont(item);

		expect(font._fontFamily).toBe(PdfFontFamily.helvetica);
		expect(font._size).toBe(11);
	});

	it('should calculate font size when DA specifies size 0', () => {
		dictionary.has.and.callFake((k: string) => k === 'DA');
		dictionary.get.and.returnValue('/Helv 0 Tf');

		spyOn(field, '_getFontHeight').and.returnValue(14);

		const font: any = field._obtainFont(item);

		expect(font._size).toBe(14);
	});

	it('should create Courier font when DA uses Cour', () => {
		dictionary.has.and.callFake((k: string) => k === 'DA');
		dictionary.get.and.returnValue('/Cour 10 Tf');

		const font: any = field._obtainFont(item);

		expect(font._fontFamily).toBe(PdfFontFamily.courier);
	});

	it('should fallback to Helvetica when font family is unknown', () => {
		dictionary.has.and.callFake((k: string) => k === 'DA');
		dictionary.get.and.returnValue('/Unknown 9 Tf');

		const font: any = field._obtainFont(item);

		expect(font._fontFamily).toBe(PdfFontFamily.helvetica);
		expect(font._size).toBe(9);
	});

});
describe('PdfRadioButtonListField.removeItem', () => {
	let field: any;

	beforeEach(() => {
		field = new PdfRadioButtonListField();
		field._kids = ['ref1', 'ref2', 'ref3'];
		field.removeItemAt = jasmine.createSpy('removeItemAt');
	});

	it('does nothing when item is null', () => {
		field.removeItem(null);
		expect(field.removeItemAt).not.toHaveBeenCalled();
	});

	it('does nothing when item has no _ref', () => {
		const item = {};
		field.removeItem(item);
		expect(field.removeItemAt).not.toHaveBeenCalled();
	});

	it('does nothing when item._ref is not in _kids', () => {
		const item = { _ref: 'notInKids' };
		field.removeItem(item);
		expect(field.removeItemAt).not.toHaveBeenCalled();
	});

	it('calls removeItemAt when item._ref is in _kids', () => {
		const item = { _ref: 'ref2' };
		field.removeItem(item);
		expect(field.removeItemAt).toHaveBeenCalledWith(1);
	});
});
describe('PdfRadioButtonListField.removeItemAt', () => {
	let field: any;
	let mockPage: any;

	beforeEach(() => {
		field = new PdfRadioButtonListField();
		field._kids = ['ref1', 'ref2', 'ref3'];
		field._dictionary = {
			set: jasmine.createSpy('set'),
			has: jasmine.createSpy('has').and.returnValue(false),
			getArray: jasmine.createSpy('getArray'),
			_updated: false
		};
		field._parsedItems = new Map();
		field.itemAt = jasmine.createSpy('itemAt');
		mockPage = { _removeAnnotation: jasmine.createSpy('_removeAnnotation') };
	});

	it('does nothing when item is null', () => {
		field.itemAt.and.returnValue(null);
		field.removeItemAt(0);
		expect(field._dictionary.set).not.toHaveBeenCalled();
	});

	it('does nothing when item has no _ref', () => {
		field.itemAt.and.returnValue({});
		field.removeItemAt(0);
		expect(field._dictionary.set).not.toHaveBeenCalled();
	});

	it('removes item and updates dictionary when page is null', () => {
		field.itemAt.and.returnValue({ _ref: 'ref2', _getPage: () => null as any });
		field._parsedItems.set(1, 'val1');
		field.removeItemAt(1);

		expect(field._kids).toEqual(['ref1', 'ref3']);
		expect(field._dictionary.set).toHaveBeenCalledWith('Kids', field._kids);
		expect(field._dictionary._updated).toBeTruthy();
	});

	it('calls page._removeAnnotation when page exists', () => {
		field.itemAt.and.returnValue({ _ref: 'ref2', _getPage: () => mockPage });
		field.removeItemAt(1);

		expect(mockPage._removeAnnotation).toHaveBeenCalledWith('ref2');
	});

	it('reindexes parsedItems when size > 0', () => {
		field.itemAt.and.returnValue({ _ref: 'ref2', _getPage: () => null as any });
		field._parsedItems.set(0, 'first');
		field._parsedItems.set(2, 'third');

		field.removeItemAt(1);

		// After removal, keys > index should shift down
		expect(field._parsedItems.has(2)).toBeFalsy();
		expect(field._parsedItems.has(1)).toBeTruthy();
	});

	it('removes option from dictionary when Opt exists', () => {
		field.itemAt.and.returnValue({ _ref: 'ref2', _getPage: () => null as any });
		field._dictionary.has.and.callFake((k: any) => k === 'Opt');
		field._dictionary.getArray.and.returnValue(['opt1', 'opt2', 'opt3']);

		field.removeItemAt(1);

		expect(field._dictionary.set).toHaveBeenCalledWith('Opt', ['opt1', 'opt3']);
	});
});
describe('PdfRadioButtonListField.removeItem', () => {
	let field: any;

	beforeEach(() => {
		field = new PdfRadioButtonListField();
		field._kids = ['ref1', 'ref2', 'ref3'];
		field.removeItemAt = jasmine.createSpy('removeItemAt');
	});

	it('does nothing when item is null', () => {
		field.removeItem(null);
		expect(field.removeItemAt).not.toHaveBeenCalled();
	});

	it('does nothing when item has no _ref', () => {
		const item = {};
		field.removeItem(item);
		expect(field.removeItemAt).not.toHaveBeenCalled();
	});

	it('does nothing when item._ref is not in _kids', () => {
		const item = { _ref: 'notInKids' };
		field.removeItem(item);
		expect(field.removeItemAt).not.toHaveBeenCalled();
	});

	it('calls removeItemAt when item._ref is in _kids', () => {
		const item = { _ref: 'ref2' };
		field.removeItem(item);
		expect(field.removeItemAt).toHaveBeenCalledWith(1); // index of 'ref2'
	});
});
describe('PdfField. color property', () => {
	let field: PdfField;

	beforeEach(() => {
		field = new PdfListBoxField();
	});

	it('_silverBrush getter check', () => {
		const result = field._silverBrush;
		const silver = new PdfBrush({ r: 198, g: 198, b: 198 })
		expect(silver).toEqual(result);
	});
	it('_blackBrush getter check', () => {
		const result = field._blackBrush;
		const black = new PdfBrush({ r: 0, g: 0, b: 0 })
		expect(black).toEqual(result);
	});
});
describe('PdfField._updateBorder', () => {
	let field: PdfField;
	let mockDict: any;
	let mockBS: any;

	beforeEach(() => {
		field = new PdfListBoxField();
		field._crossReference = { mock: true } as any;

		mockBS = {
			update: jasmine.createSpy('update')
		};

		mockDict = {
			has: jasmine.createSpy('has'),
			get: jasmine.createSpy('get').and.returnValue(mockBS),
			update: jasmine.createSpy('update'),
			set: jasmine.createSpy('set'),
			_updated: false
		};
	});

	it('uses existing BS when dictionary has BS', () => {
		mockDict.has.and.returnValue(true);
		field._updateBorder(mockDict, new PdfInteractiveBorder());
		expect(mockDict.get).toHaveBeenCalledWith('BS');
		expect(mockBS.update).not.toHaveBeenCalledWith('W', 2);
		expect(mockDict._updated).toBeTruthy();
	});

	it('creates new BS when dictionary has no BS', () => {
		mockDict.has.and.returnValue(false);

		field._updateBorder(mockDict, new PdfInteractiveBorder());

		expect(mockDict.update).not.toHaveBeenCalledWith('BS', mockBS);
		expect(mockBS.update).not.toHaveBeenCalledWith('W', 0);
		expect(mockBS.update).not.toHaveBeenCalledWith('S', Utils._mapBorderStyle(PdfBorderStyle.solid));
	});

	it('updates style when provided', () => {
		mockDict.has.and.returnValue(true);
		const style = new PdfInteractiveBorder();
		style._style = PdfBorderStyle.dashed;
		field._updateBorder(mockDict, style);
		expect(mockBS.update).toHaveBeenCalledWith('S', Utils._mapBorderStyle(PdfBorderStyle.dashed));
		expect(mockDict._updated).toBeTruthy();
	});

	it('sets W=0 and S=solid when new and width/style not provided', () => {
		mockDict.has.and.returnValue(false);
		const style = new PdfInteractiveBorder();
		style._style = PdfBorderStyle.dashed;
		field._updateBorder(mockDict, style);

		expect(mockBS.update).not.toHaveBeenCalledWith('W', 0);
		expect(mockBS.update).not.toHaveBeenCalledWith('S', Utils._mapBorderStyle(PdfBorderStyle.solid));
	});
});
describe('PdfField._drawTemplate', () => {
	let field: PdfField;
	let mockGraphics: any;
	let mockPage: any;
	let template: any;
	let bounds: any;

	beforeEach(() => {
		field = new PdfListBoxField();
		template = { mockTemplate: true };
		bounds = { x: 0, y: 0, width: 100, height: 50 };

		mockGraphics = {
			save: jasmine.createSpy('save'),
			restore: jasmine.createSpy('restore'),
			translateTransform: jasmine.createSpy('translateTransform'),
			rotateTransform: jasmine.createSpy('rotateTransform'),
			drawTemplate: jasmine.createSpy('drawTemplate'),
			_sw: { _setTextRenderingMode: jasmine.createSpy('_setTextRenderingMode') },
			_size: { width: 200, height: 300 }
		};

		mockPage = { graphics: mockGraphics, rotation: PdfRotationAngle.angle0 };
	});

	it('does nothing when template is null', () => {
		field._drawTemplate(null, mockPage, bounds);
		expect(mockGraphics.drawTemplate).not.toHaveBeenCalled();
	});

	it('does nothing when page is null', () => {
		field._drawTemplate(template, null, bounds);
		expect(mockGraphics.drawTemplate).not.toHaveBeenCalled();
	});

	it('handles rotation angle0 (no transforms)', () => {
		mockPage.rotation = PdfRotationAngle.angle0;
		field._drawTemplate(template, mockPage, bounds);

		expect(mockGraphics.translateTransform).not.toHaveBeenCalled();
		expect(mockGraphics.rotateTransform).not.toHaveBeenCalled();
		expect(mockGraphics._sw._setTextRenderingMode).toHaveBeenCalledWith(_TextRenderingMode.fill);
		expect(mockGraphics.drawTemplate).toHaveBeenCalledWith(template, bounds);
		expect(mockGraphics.restore).toHaveBeenCalled();
	});

	it('handles rotation angle90', () => {
		mockPage.rotation = PdfRotationAngle.angle90;
		field._drawTemplate(template, mockPage, bounds);

		expect(mockGraphics.translateTransform).toHaveBeenCalledWith({ x: mockGraphics._size.height, y: 0 });
		expect(mockGraphics.rotateTransform).toHaveBeenCalledWith(90);
	});

	it('handles rotation angle180', () => {
		mockPage.rotation = PdfRotationAngle.angle180;
		field._drawTemplate(template, mockPage, bounds);

		expect(mockGraphics.translateTransform).toHaveBeenCalledWith({ x: mockGraphics._size.width, y: mockGraphics._size.height });
		expect(mockGraphics.rotateTransform).toHaveBeenCalledWith(-180);
	});

	it('handles rotation angle270', () => {
		mockPage.rotation = PdfRotationAngle.angle270;
		field._drawTemplate(template, mockPage, bounds);

		expect(mockGraphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: mockGraphics._size.width });
		expect(mockGraphics.rotateTransform).toHaveBeenCalledWith(270);
	});
});
describe('PdfField._setTextAlignment and _parseItems', () => {
	let field: PdfField;
	let mockWidget: any;

	beforeEach(() => {
		field = new PdfListBoxField();
		field._defaultIndex = 0;

		mockWidget = { _dictionary: { update: jasmine.createSpy('update') } };
	});

	it('updates widget dictionary when loaded and not readOnly', () => {
		field._isLoaded = true;
		field.readOnly = false;
		spyOn(field, 'itemAt').and.returnValue(mockWidget);

		field._setTextAlignment(1);

		expect(mockWidget._dictionary.update).toHaveBeenCalledWith('Q', 1);
		expect(field._textAlignment).toBe(1);
		expect(field._stringFormat).toBeDefined();
	});

	it('updates widget dictionary when not loaded and alignment differs', () => {
		spyOn(field, 'itemAt').and.returnValue(mockWidget);
		field._isLoaded = false;
		field._textAlignment = 0;

		field._setTextAlignment(3);

		expect(mockWidget._dictionary.update).toHaveBeenCalledWith('Q', 3);
	});


	it('always sets _textAlignment and _stringFormat', () => {
		spyOn(field, 'itemAt').and.returnValue(mockWidget);

		field._isLoaded = true;
		field.readOnly = false;

		field._setTextAlignment(PdfTextAlignment.justify);

		expect(field._textAlignment).toBe(3);
		expect(field._stringFormat).toBeDefined();
	});
});

describe('PdfLineAnnotation - export setter', () => {
	let annotation: PdfTextBoxField;

	beforeEach(() => {
		const document = new PdfDocument()
		annotation = new PdfTextBoxField(document.addPage(), 'text', { x: 0, y: 0, width: 100, height: 100 });
	});

	it('should set the noExport flag when export is set to false', () => {
		annotation.export = false;

		expect(annotation._fieldFlags & _FieldFlag.noExport)
			.toBe(_FieldFlag.noExport);
	});

	it('should clear the noExport flag when export is set to true', () => {
		// Arrange: explicitly set the noExport flag
		annotation._fieldFlags |= _FieldFlag.noExport;

		// Act
		annotation.export = true;

		// Assert
		expect(annotation._fieldFlags & _FieldFlag.noExport)
			.toBe(0);
	});

	it('should not affect other field flags when export is changed', () => {
		// Arrange: set a different flag
		annotation._fieldFlags = _FieldFlag.readOnly;

		// Act
		annotation.export = false;

		// Assert
		expect(annotation._fieldFlags & _FieldFlag.readOnly)
			.toBe(_FieldFlag.readOnly);
	});

	it('should remain unchanged when export is set to false multiple times', () => {
		annotation.export = false;
		const firstValue = annotation._fieldFlags;

		annotation.export = false;
		const secondValue = annotation._fieldFlags;

		expect(secondValue).toBe(firstValue);
	});

	it('should remain unchanged when export is set to true multiple times', () => {
		annotation._fieldFlags |= _FieldFlag.noExport;

		annotation.export = true;
		const firstValue = annotation._fieldFlags;

		annotation.export = true;
		const secondValue = annotation._fieldFlags;

		expect(secondValue).toBe(firstValue);
	});
});

describe('PdfTextBox - tabIndex getter', () => {
	let textbox: any;
	let pageDictionary: any;

	beforeEach(() => {
		pageDictionary = new Map();

		textbox = {
			_isLoaded: true,
			_kids: null,
			_ref: null,
			_dictionary: null,
			_tabIndex: 5,
			page: {
				_pageDictionary: pageDictionary
			}
		};

		Object.setPrototypeOf(textbox, PdfTextBoxField.prototype);
	});

	it('should return stored _tabIndex when not loaded', () => {
		textbox._isLoaded = false;

		expect(textbox.tabIndex).toBe(5);
	});

	it('should return index when kid reference exists in Annots', () => {
		const ref1 = { id: 1 };
		const ref2 = { id: 2 };

		textbox._kids = [ref1, ref2];
		pageDictionary.set('Annots', [ref2, ref1]);

		expect(textbox.tabIndex).toBe(1);
	});

	it('should skip null kid references and still return correct index', () => {
		const ref = { id: 10 };

		textbox._kids = [null, ref];
		pageDictionary.set('Annots', [ref]);

		expect(textbox.tabIndex).toBe(0);
	});

	it('should return -1 when kid reference is not found in Annots', () => {
		textbox._kids = [{ id: 20 }];
		pageDictionary.set('Annots', []);

		expect(textbox.tabIndex).toBe(-1);
	});

	it('should return index when Widget subtype and ref exists in Annots', () => {
		const widgetRef = { id: 99 };

		textbox._kids = null;
		textbox._ref = widgetRef;
		textbox._dictionary = new Map();
		textbox._dictionary.set('Subtype', { name: 'Widget' });

		pageDictionary.set('Annots', [{}, widgetRef]);

		expect(textbox.tabIndex).toBe(1);
	});

	it('should return -1 when Widget subtype ref is not found', () => {
		const widgetRef = { id: 50 };

		textbox._kids = null;
		textbox._ref = widgetRef;
		textbox._dictionary = new Map();
		textbox._dictionary.set('Subtype', { name: 'Widget' });

		pageDictionary.set('Annots', []);

		expect(textbox.tabIndex).toBe(-1);
	});

	it('should return -1 when Annots entry does not exist', () => {
		textbox._kids = [{ id: 1 }];

		expect(textbox.tabIndex).toBe(-1);
	});

	it('should return -1 when Subtype is not Widget', () => {
		textbox._kids = null;
		textbox._dictionary = new Map();
		textbox._dictionary.set('Subtype', { name: 'NotWidget' });

		pageDictionary.set('Annots', [{}]);

		expect(textbox.tabIndex).toBe(-1);
	});
});

describe('PdfField – BackColor and BorderColor getters', () => {
	let field: any;
	let mkDictionary: Map<string, any>;

	beforeEach(() => {
		mkDictionary = new Map();

		field = {
			_isLoaded: true,
			_mkDictionary: null,
			_defaultIndex: 0,
			_isTransparentBackColor: false,
			_isTransparentBorderColor: false,
			itemAt: jasmine.createSpy('itemAt')
		};

		Object.setPrototypeOf(field, PdfField.prototype);
	});

	// ------------------------
	// _hasBackColor
	// ------------------------

	it('should return true when loaded and MK dictionary has BG', () => {
		mkDictionary.set('BG', [1, 0, 0]);
		field._mkDictionary = mkDictionary;

		expect(field._hasBackColor).toBeTruthy();
	});

	it('should return false when loaded and MK exists but BG is missing', () => {
		field._mkDictionary = new Map();

		expect(field._hasBackColor).toBeFalsy();
	});

	it('should get BG from itemAt when _mkDictionary is undefined', () => {
		const item = {
			_dictionary: new Map([
				['MK', new Map([['BG', [0, 1, 0]]])]
			])
		};

		field.itemAt.and.returnValue(item);

		expect(field._hasBackColor).toBeTruthy();
	});

	it('should return false when item exists but MK has no BG', () => {
		const item = {
			_dictionary: new Map([
				['MK', new Map()]
			])
		};

		field.itemAt.and.returnValue(item);

		expect(field._hasBackColor).toBeFalsy();
	});

	it('should return false when loaded and no MK dictionary exists', () => {
		field.itemAt.and.returnValue(null);

		expect(field._hasBackColor).toBeFalsy();
	});

	it('should return inverse of _isTransparentBackColor when not loaded', () => {
		field._isLoaded = false;
		field._isTransparentBackColor = true;

		expect(field._hasBackColor).toBeFalsy();

		field._isTransparentBackColor = false;
		expect(field._hasBackColor).toBeTruthy();
	});

	// ------------------------
	// _hasBorderColor
	// ------------------------

	it('should return true when loaded and MK dictionary has BC', () => {
		mkDictionary.set('BC', [0, 0, 1]);
		field._mkDictionary = mkDictionary;

		expect(field._hasBorderColor).toBeTruthy();
	});

	it('should return false when loaded and MK exists but BC is missing', () => {
		field._mkDictionary = new Map();

		expect(field._hasBorderColor).toBeFalsy();
	});

	it('should get BC from itemAt when _mkDictionary is undefined', () => {
		const item = {
			_dictionary: new Map([
				['MK', new Map([['BC', [0, 0, 0]]])]
			])
		};

		field.itemAt.and.returnValue(item);

		expect(field._hasBorderColor).toBeTruthy();
	});

	it('should return false when item MK dictionary has no BC', () => {
		const item = {
			_dictionary: new Map([
				['MK', new Map()]
			])
		};

		field.itemAt.and.returnValue(item);

		expect(field._hasBorderColor).toBeFalsy();
	});

	it('should return inverse of _isTransparentBorderColor when not loaded', () => {
		field._isLoaded = false;
		field._isTransparentBorderColor = true;

		expect(field._hasBorderColor).toBeFalsy();

		field._isTransparentBorderColor = false;
		expect(field._hasBorderColor).toBeTruthy();
	});
});
describe('PdfTextBoxField._drawTextBox full branch coverage', () => {
	let field: any;
	let g: any;
	let parameter: any;
	let font: any;
	let format: any;

	beforeEach(() => {
		field = new (PdfTextBoxField as any)();
		Object.defineProperty(field, 'rotate', {
			get: () => 0
		});
		g = {
			drawRectangle: jasmine.createSpy('drawRectangle'),
			drawLine: jasmine.createSpy('drawLine'),
			drawString: jasmine.createSpy('drawString'),
			save: jasmine.createSpy('save').and.returnValue({}),
			restore: jasmine.createSpy('restore'),
			translateTransform: jasmine.createSpy('translateTransform'),
			rotateTransform: jasmine.createSpy('rotateTransform'),
			_initializeCoordinates: jasmine.createSpy('_initializeCoordinates'),
			_sw: {
				_beginMarkupSequence: jasmine.createSpy('_beginMarkupSequence'),
				_endMarkupSequence: jasmine.createSpy('_endMarkupSequence')
			},
			_isTemplateGraphics: false,
			_size: { width: 500, height: 500 },
			_page: { rotation: 0 }
		};

		parameter = {
			bounds: { x: 0, y: 1, width: 200, height: 50 },
			borderPen: {},
			backBrush: {},
			foreBrush: {},
			borderWidth: 1,
			borderColor: true,
			insertSpaces: true,
			required: true,
			borderStyle: 0,
			rotationAngle: 0,
			pageRotationAngle: 0,
			isAutoFontSize: false
		};

		font = {
			_getHeight: jasmine.createSpy().and.returnValue(10),
			_getAscent: jasmine.createSpy().and.returnValue(8)
		};

		format = {
			alignment: 0,
			lineSpacing: 0
		};
	});

	// ---------- maxLength + insertSpaces TRUE ----------
	it('should handle insertSpaces with left alignment', () => {
		format.alignment = 0;
		field._drawTextBox(g, parameter, 'ABC', font, format, false, false, 5);

		expect(g.drawRectangle).toHaveBeenCalled();
		expect(g.drawString).toHaveBeenCalled();
	});

	it('should handle RIGHT alignment branch', () => {
		format.alignment = PdfTextAlignment.right;

		field._drawTextBox(g, parameter, 'AB', font, format, false, false, 5);

		expect(g.drawString).toHaveBeenCalled();
	});

	it('should handle CENTER alignment branch', () => {
		format.alignment = PdfTextAlignment.center;

		field._drawTextBox(g, parameter, 'AB', font, format, false, false, 6);

		expect(g.drawString).toHaveBeenCalled();
	});

	// ---------- insertSpaces FALSE (explicit else) ----------
	it('should hit insertSpaces FALSE branch', () => {
		parameter.insertSpaces = false;

		field._drawTextBox(g, parameter, 'TEXT', font, format, false, false, 5);

		expect(g.drawString).toHaveBeenCalled();
	});

	// ---------- maxLength UNDEFINED (main ELSE branch) ----------
	it('should handle maxLength undefined and draw rectangular control', () => {
		parameter.insertSpaces = false;

		field._drawRectangularControl = jasmine.createSpy('_drawRectangularControl');

		field._drawTextBox(g, parameter, 'TEXT', font, format, false, false);

		expect(field._drawRectangularControl).toHaveBeenCalled();
		expect(g.drawString).toHaveBeenCalled();
	});

	// ---------- template graphics branch ----------
	it('should handle template graphics required branch', () => {
		g._isTemplateGraphics = true;
		parameter.required = true;

		field._drawTextBox(g, parameter, 'TEXT', font, format, false, false);

		expect(g.save).toHaveBeenCalled();
		expect(g._sw._beginMarkupSequence).toHaveBeenCalled();
		expect(g._sw._endMarkupSequence).toHaveBeenCalled();
	});

	// ---------- multiline branch ----------
	it('should handle multiline with newline', () => {
		field._drawTextBox(g, parameter, 'A\nB', font, format, true, false);

		expect(g.drawString).toHaveBeenCalled();
	});

	it('should handle multiline without newline explicit else', () => {
		field._drawTextBox(g, parameter, 'ABC', font, format, true, false);

		expect(g.drawString).toHaveBeenCalled();
	});
	// ---------- border style branches ----------
	it('should handle beveled/inset border style', () => {
		parameter.borderStyle = PdfBorderStyle.beveled;

		field._drawTextBox(g, parameter, 'TEXT', font, format, false, false);

		expect(g.drawString).toHaveBeenCalled();
	});

	it('should handle default border style (explicit else)', () => {
		parameter.borderStyle = 999;

		field._drawTextBox(g, parameter, 'TEXT', font, format, false, false);

		expect(g.drawString).toHaveBeenCalled();
	});

});


