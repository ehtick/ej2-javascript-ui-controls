import { PdfDocument } from '../../src/pdf/core/pdf-document';
import { PdfField, PdfTextBoxField, PdfSignatureField, PdfListField, PdfListBoxField, PdfRadioButtonListField } from '../../src/pdf/core/form/field';
import { _PdfDictionary } from '../../src/pdf/core/pdf-primitives'
import { PdfInteractiveBorder } from '../../src/pdf/core/annotations/annotation';
import * as pdfPrimitives from '../../src/pdf/core/pdf-primitives';
import { _FieldFlag, _PdfCheckFieldState, PdfBorderStyle, PdfHighlightMode, PdfRotationAngle, PdfTextAlignment } from '../../src/pdf/core/enumerator';
import * as utils from '../../src/pdf/core/utils'
import { PdfVerticalAlignment } from '../../src/pdf/core/fonts/pdf-string-format';
import { PdfTemplate } from '../../src/pdf/core/graphics/pdf-template';
import * as pdf_graphics from '../../src/pdf/core/graphics/pdf-graphics'
describe('PdfField.removeItemAt parsedItems reindex', () => {

    it('sets transparent backColor and removes BG entries when transparency requested', () => {
        // Arrange
        class TestField extends PdfField {
            constructor() { super(); }
            _doPostProcess(isFlatten?: boolean): void { /* noop */ }
            public itemAt(index: number): any { return this._parsedItems.get(index); }
            _getpage: () => {}
        }
        const field: any = new TestField();
        // mock field dictionary containing BG and MK entries
        const mockMK: any = { has: (k: string) => k === 'BG', _map: { BG: [1] } };
        const mockDict: any = {
            has: (k: string) => k === 'BG' || k === 'MK',
            _map: { BG: [1] },
            get: (k: string) => mockMK,
            _updated: false
        };
        field._dictionary = mockDict;
        field._defaultIndex = 0;
        const widget: any = { _ref: {}, backColor: null };
        field._parsedItems = new Map<number, any>();
        field._parsedItems.set(0, widget);

        // Act
        (field as any)._updateBackColor({ isTransparent: true }, true);

        // Assert
        expect(field._isTransparentBackColor).toBe(true);
        expect(mockDict._map.BG).toBeUndefined();
        expect(mockMK._map.BG).toBeUndefined();
        expect(field._dictionary._updated).toBe(true);
        expect(field._parsedItems.get(0).backColor).toEqual({ isTransparent: true });
    });

    it('removes BG entries when item missing but transparency requested', () => {
        // Arrange
        class TestField extends PdfField {
            constructor() { super(); }
            _doPostProcess(isFlatten?: boolean): void { /* noop */ }
            public itemAt(index: number): any { return this._parsedItems.get(index); }
        }
        const field: any = new TestField();
        const mockMK: any = { has: (k: string) => k === 'BG', _map: { BG: [1] } };
        const mockDict: any = {
            has: (k: string) => k === 'BG' || k === 'MK',
            _map: { BG: [1] },
            get: (k: string) => mockMK,
            _updated: false
        };
        field._dictionary = mockDict;
        field._defaultIndex = 0;
        field._parsedItems = new Map<number, any>(); // no item present

        // Act
        (field as any)._updateBackColor({ isTransparent: true }, true);

        // Assert
        expect(field._isTransparentBackColor).toBe(true);
        expect(mockDict._map.BG).toBeUndefined();
        expect(mockMK._map.BG).toBeUndefined();
        expect(field._dictionary._updated).toBe(true);
    });

});
describe('PdfField._drawCheckBox rotation/transform branches', () => {
    let field: any;
    let graphics: any;
    let parameter: any;

    beforeEach(() => {
        graphics = {
            drawString: jasmine.createSpy('drawString'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            save: jasmine.createSpy('save').and.returnValue('savedState'),
            restore: jasmine.createSpy('restore'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            _size: { width: 200, height: 300 }
        };

        field = {
            _drawBorder: jasmine.createSpy('_drawBorder'),
            _drawLeftTopShadow: jasmine.createSpy('_drawLeftTopShadow'),
            _drawRightBottomShadow: jasmine.createSpy('_drawRightBottomShadow'),
            _grayBrush: 'gray',
            _silverBrush: 'silver',
            _whiteBrush: 'white',
            _blackBrush: 'black',
            _drawCheckBox: PdfField.prototype._drawCheckBox
        };

        parameter = {
            bounds: { x: 10, y: 20, width: 30, height: 40 },
            borderPen: null,
            backBrush: 'bb',
            borderStyle: PdfBorderStyle.solid,
            borderWidth: 2,
            shadowBrush: { _color: { r: 0, g: 0, b: 0 } },
            pageRotationAngle: PdfRotationAngle.angle0,
            rotationAngle: 0,
            foreBrush: 'fb'
        };
    });

    it('does not draw when no page or local rotation', () => {
        // Arrange
        parameter.pageRotationAngle = PdfRotationAngle.angle0;
        parameter.rotationAngle = 0;

        // Act
        field._drawCheckBox(graphics, parameter, '4', _PdfCheckFieldState.checked);

        // Assert
        expect(graphics.drawString).not.toHaveBeenCalled();
        expect(graphics.save).not.toHaveBeenCalled();
    });

    it('handles pageRotationAngle 90 with local rotation 90 (both transforms + restore)', () => {
        // Arrange
        parameter.pageRotationAngle = PdfRotationAngle.angle90;
        parameter.rotationAngle = 90;

        // Act
        field._drawCheckBox(graphics, parameter, 'a', _PdfCheckFieldState.checked);

        // Assert
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: graphics._size.height, y: 0 });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(90);
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: graphics._size.height });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
        expect(graphics.drawString).toHaveBeenCalled();
        expect(graphics.restore).toHaveBeenCalledWith('savedState');
    });

    it('handles rotationAngle 90 when rectangle.width > rectangle.height (sets rectangle to bounds)', () => {
        // Arrange
        parameter.pageRotationAngle = PdfRotationAngle.angle0;
        parameter.rotationAngle = 90;
        parameter.bounds = { x: 5, y: 6, width: 80, height: 20 }; // width > height

        // Act
        field._drawCheckBox(graphics, parameter, 'b', _PdfCheckFieldState.checked);

        // Assert
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: graphics._size.height });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('handles rotationAngle 90 when rectangle.width <= rectangle.height (rotates and swaps dims)', () => {
        // Arrange
        parameter.pageRotationAngle = PdfRotationAngle.angle0;
        parameter.rotationAngle = 90;
        parameter.bounds = { x: 7, y: 8, width: 10, height: 30 }; // width <= height

        // Act
        field._drawCheckBox(graphics, parameter, 'c', _PdfCheckFieldState.checked);

        // Assert
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('handles rotationAngle 270', () => {
        // Arrange
        parameter.pageRotationAngle = PdfRotationAngle.angle0;
        parameter.rotationAngle = 270;

        // Act
        field._drawCheckBox(graphics, parameter, 'd', _PdfCheckFieldState.checked);

        // Assert
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: graphics._size.width, y: 0 });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-270);
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('handles rotationAngle 180', () => {
        // Arrange
        parameter.pageRotationAngle = PdfRotationAngle.angle0;
        parameter.rotationAngle = 180;

        // Act
        field._drawCheckBox(graphics, parameter, 'e', _PdfCheckFieldState.checked);

        // Assert
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: graphics._size.width, y: graphics._size.height });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-180);
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('handles rotationAngle 180 and page is 270', () => {
        // Arrange
        parameter.pageRotationAngle = PdfRotationAngle.angle270;
        parameter.rotationAngle = 180;

        // Act
        field._drawCheckBox(graphics, parameter, 'e', _PdfCheckFieldState.checked);

        // Assert
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: graphics._size.width, y: graphics._size.height });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-180);
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('handles pageRotationAngle 180 with no local rotation (translate+rotate then draw, no restore)', () => {
        // Arrange
        parameter.pageRotationAngle = PdfRotationAngle.angle180;
        parameter.rotationAngle = 0;

        // Act
        field._drawCheckBox(graphics, parameter, 'f', _PdfCheckFieldState.checked);

        // Assert
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: graphics._size.width, y: graphics._size.height });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-180);
        expect(graphics.drawString).toHaveBeenCalled();
        expect(graphics.restore).not.toHaveBeenCalled();
    });
});
describe('PdfField._updateBorder', () => {
    let field: any;
    let dictionary: any;
    let bsDictionary: any;

    beforeEach(() => {
        bsDictionary = jasmine.createSpyObj('_PdfDictionary', ['update']);

        dictionary = {
            _updated: false,
            has: jasmine.createSpy('has'),
            get: jasmine.createSpy('get'),
            update: jasmine.createSpy('update')
        };

        field = {
            _crossReference: {},
            _updateBorder: PdfField.prototype._updateBorder
        };

        spyOn(pdfPrimitives, '_PdfDictionary')
            .and.returnValue(bsDictionary);
        spyOn(utils, '_mapBorderStyle').and.callFake((style: any) => style);
    });

    it('should use existing BS dictionary when present', () => {
        dictionary.has.and.returnValue(true);
        dictionary.get.and.returnValue(bsDictionary);

        field._updateBorder(dictionary, { width: 2 });

        expect(dictionary.get).toHaveBeenCalled();
        expect(bsDictionary.update).toHaveBeenCalled();
        expect(dictionary._updated).toBeTruthy();
    });

    it('should create new BS dictionary when not present', () => {
        dictionary.has.and.returnValue(false);

        field._updateBorder(dictionary, {});

        expect(dictionary.update).toHaveBeenCalled();
    });

    it('should set default width to 0 when width is undefined and BS is new', () => {
        dictionary.has.and.returnValue(false);

        field._updateBorder(dictionary, {});

        expect(bsDictionary.update).toHaveBeenCalled();
    });

    it('should update width and mark dictionary as updated when width is provided', () => {
        dictionary.has.and.returnValue(false);

        field._updateBorder(dictionary, { width: 5 });

        expect(bsDictionary.update).toHaveBeenCalled();
        expect(dictionary._updated).toBeTruthy();
    });

    it('should update style when provided and mark dictionary updated', () => {
        dictionary.has.and.returnValue(false);

        field._updateBorder(dictionary, { style: 'dashed' });

        expect(utils._mapBorderStyle).toHaveBeenCalled();
        expect(bsDictionary.update).toHaveBeenCalled();
        expect(dictionary._updated).toBeTruthy();
    });

    it('should set default solid style when style is undefined and BS is new', () => {
        dictionary.has.and.returnValue(false);

        field._updateBorder(dictionary, {});

        expect(utils._mapBorderStyle)
            .toHaveBeenCalledWith(PdfBorderStyle.solid);
        expect(bsDictionary.update).toHaveBeenCalledWith(
            'S',
            PdfBorderStyle.solid
        );
    });

    it('should update dash array when provided', () => {
        dictionary.has.and.returnValue(false);

        field._updateBorder(dictionary, { dash: [3, 2] });

        expect(bsDictionary.update).toHaveBeenCalled();
        expect(dictionary._updated).toBeTruthy();
    });

    it('should not update D when dash is undefined', () => {
        dictionary.has.and.returnValue(false);

        field._updateBorder(dictionary, {});

        expect(bsDictionary.update).not.toHaveBeenCalledWith('D', jasmine.anything());
    });
});
describe('PdfField._drawRectangularControl', () => {
    let field: any;
    let graphics: any;
    let params: any;

    beforeEach(() => {
        graphics = {
            drawRectangle: jasmine.createSpy('drawRectangle')
        };

        field = {
            _grayBrush: 'gray',
            _silverBrush: 'silver',
            _whiteBrush: 'white',
            _drawBorder: jasmine.createSpy('_drawBorder'),
            _drawLeftTopShadow: jasmine.createSpy('_drawLeftTopShadow'),
            _drawRightBottomShadow: jasmine.createSpy('_drawRightBottomShadow'),
            _drawRectangularControl: PdfField.prototype._drawRectangularControl
        };

        params = {
            bounds: { x: 0, y: 0, width: 100, height: 30 },
            backBrush: 'backBrush',
            borderPen: 'pen',
            borderWidth: 2,
            shadowBrush: 'shadow',
            borderStyle: null
        };
    });

    it('should always draw rectangle and border', () => {
        params.borderStyle = PdfBorderStyle.solid;

        field._drawRectangularControl(graphics, params);

        expect(graphics.drawRectangle)
            .toHaveBeenCalledWith(params.bounds, params.backBrush);

        expect(field._drawBorder)
            .toHaveBeenCalledWith(
                graphics,
                params.bounds,
                params.borderPen,
                params.borderStyle,
                params.borderWidth
            );
    });

    it('should draw inset shadows when borderStyle is inset', () => {
        params.borderStyle = PdfBorderStyle.inset;

        field._drawRectangularControl(graphics, params);

        expect(field._drawLeftTopShadow)
            .toHaveBeenCalledWith(
                graphics,
                params.bounds,
                params.borderWidth,
                field._grayBrush
            );

        expect(field._drawRightBottomShadow)
            .toHaveBeenCalledWith(
                graphics,
                params.bounds,
                params.borderWidth,
                field._silverBrush
            );
    });

    it('should draw beveled shadows when borderStyle is beveled', () => {
        params.borderStyle = PdfBorderStyle.beveled;

        field._drawRectangularControl(graphics, params);

        expect(field._drawLeftTopShadow)
            .toHaveBeenCalledWith(
                graphics,
                params.bounds,
                params.borderWidth,
                field._whiteBrush
            );

        expect(field._drawRightBottomShadow)
            .toHaveBeenCalledWith(
                graphics,
                params.bounds,
                params.borderWidth,
                params.shadowBrush
            );
    });

    it('should not draw shadows for other border styles', () => {
        params.borderStyle = PdfBorderStyle.dashed;

        field._drawRectangularControl(graphics, params);

        expect(field._drawLeftTopShadow).not.toHaveBeenCalled();
        expect(field._drawRightBottomShadow).not.toHaveBeenCalled();
    });
});
describe('PdfField._drawRoundShadow', () => {
    let field: any;
    let graphics: any;
    let parameter: any;

    beforeEach(() => {
        graphics = {
            drawArc: jasmine.createSpy('drawArc')
        };

        field = {
            _drawRoundShadow: PdfField.prototype._drawRoundShadow
        };

        parameter = {
            bounds: { x: 10, y: 10, width: 50, height: 50 },
            borderWidth: 2,
            borderStyle: null,
            shadowBrush: {
                _color: { r: 100, g: 100, b: 100 }
            }
        };

    });

    it('should not draw anything when shadowBrush is undefined', () => {
        parameter.shadowBrush = null;

        field._drawRoundShadow(
            graphics,
            parameter,
            _PdfCheckFieldState.checked
        );

        expect(graphics.drawArc).not.toHaveBeenCalled();
    });

    it('should draw beveled shadow for pressed state', () => {
        parameter.borderStyle = PdfBorderStyle.beveled;

        field._drawRoundShadow(
            graphics,
            parameter,
            _PdfCheckFieldState.pressedChecked
        );

        expect(graphics.drawArc).toHaveBeenCalledTimes(2);

        field._drawRoundShadow(
            graphics,
            parameter,
            _PdfCheckFieldState.pressedUnchecked
        );
    });

    it('should draw beveled shadow for normal checked state', () => {
        parameter.borderStyle = PdfBorderStyle.beveled;

        field._drawRoundShadow(
            graphics,
            parameter,
            _PdfCheckFieldState.checked
        );

        expect(graphics.drawArc).toHaveBeenCalledTimes(2);

        field._drawRoundShadow(
            graphics,
            parameter,
            _PdfCheckFieldState.checked
        );
    });

    it('should draw inset shadow for pressed state', () => {
        parameter.borderStyle = PdfBorderStyle.inset;

        field._drawRoundShadow(
            graphics,
            parameter,
            _PdfCheckFieldState.pressedUnchecked
        );

        expect(graphics.drawArc).toHaveBeenCalledTimes(2);
    });

    it('should draw inset shadow for unchecked state', () => {
        parameter.borderStyle = PdfBorderStyle.inset;

        field._drawRoundShadow(
            graphics,
            parameter,
            _PdfCheckFieldState.unchecked
        );

        expect(graphics.drawArc).toHaveBeenCalledTimes(2);
    });

    it('should not draw shadow for unsupported state', () => {
        parameter.borderStyle = PdfBorderStyle.beveled;

        field._drawRoundShadow(graphics, parameter, 999);

        expect(graphics.drawArc).not.toHaveBeenCalled();
    });

    it('should use correct arc angles and bounds', () => {
        parameter.borderStyle = PdfBorderStyle.beveled;

        field._drawRoundShadow(
            graphics,
            parameter,
            _PdfCheckFieldState.checked
        );

        const call = graphics.drawArc.calls.first().args;

        expect(call[1]).toBe(135);
        expect(call[2]).toBe(180);
        expect(call[0].width).toBeLessThan(parameter.bounds.width);
    });
});
describe('PdfField._parseItems', () => {

    it('returns empty array when itemsCount is 0', () => {
        // Arrange
        class TestField extends PdfField {
            private _itemsCount = 0;
            constructor() { super(); }
            _doPostProcess(isFlatten?: boolean): void { /* noop */ }
            public get itemsCount(): number { return this._itemsCount; }
            public itemAt(index: number): any { throw new Error('should not be called'); }
        }
        const field: any = new TestField();

        // Act
        const result: any[] = field._parseItems();

        // Assert
        expect(result).toEqual([]);
    });

    it('collects items for itemsCount > 0', () => {
        // Arrange
        class TestField extends PdfField {
            private _itemsCount = 3;
            constructor() { super(); }
            _doPostProcess(isFlatten?: boolean): void { /* noop */ }
            public get itemsCount(): number { return this._itemsCount; }
            public itemAt(index: number): any { return { label: 'item' + index }; }
        }
        const field: any = new TestField();
        spyOn(field, 'itemAt').and.callThrough();

        // Act
        const result: any[] = field._parseItems();

        // Assert
        expect(result.length).toBe(3);
        expect(result[0].label).toBe('item0');
        expect(field.itemAt).toHaveBeenCalledTimes(3);
        expect(field.itemAt).toHaveBeenCalledWith(0);
        expect(field.itemAt).toHaveBeenCalledWith(1);
        expect(field.itemAt).toHaveBeenCalledWith(2);
    });

});
describe('PdfTextBoxField constructor property tests', () => {

    let page: any;
    let bounds: any;

    beforeEach(() => {
        const document = new PdfDocument();
        page = document.addPage();
        bounds = { x: 0, y: 0, width: 100, height: 50 };
    });
    it('should assign text and color when provided', () => {
        const field = new PdfTextBoxField(page, 'List1', bounds, {
            text: 'text', color: { r: 0, b: 0, g: 0 }
        });

        expect(field.text).toBe('text');
    });

    it('should assign border when provided', () => {
        const border = new PdfInteractiveBorder();

        const field = new PdfTextBoxField(page, 'List1', bounds, {
            border: border
        });

        expect(field.border).toBeDefined();
    });

    it('should assign backColor when provided', () => {
        const field = new PdfTextBoxField(page, 'List1', bounds, {
            backColor: { r: 200, g: 200, b: 200 }
        });

        expect(field.backColor).toEqual({ r: 200, g: 200, b: 200 });
    });

});
describe('PdfTextBoxField.defaultValue getter', () => {
    let field: any;

    beforeEach(() => {
        field = {
            _defaultValue: undefined,
            _dictionary: {}
        };

        Object.setPrototypeOf(field, PdfTextBoxField.prototype);

        spyOn(utils, '_getInheritableProperty');
    });

    it('should return _defaultValue directly when already defined', () => {
        field._defaultValue = 'InitialValue';

        const result = field.defaultValue;

        expect(result).toBe('InitialValue');
        expect(utils._getInheritableProperty).not.toHaveBeenCalled();
    });

    it('should retrieve default value from dictionary when _defaultValue is undefined', () => {
        (utils._getInheritableProperty as jasmine.Spy).and.returnValue('InheritedValue');

        const result = field.defaultValue;

        expect(utils._getInheritableProperty)
            .toHaveBeenCalledWith(
                field._dictionary,
                'DV',
                false,
                true,
                'Parent'
            );

        expect(result).toBe('InheritedValue');
        expect(field._defaultValue).toBe('InheritedValue');
    });

    it('should return undefined when DV property does not exist', () => {
        (utils._getInheritableProperty as jasmine.Spy).and.returnValue(undefined);

        const result = field.defaultValue;

        expect(utils._getInheritableProperty).toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should not call _getInheritableProperty again once value is cached', () => {
        (utils._getInheritableProperty as jasmine.Spy).and.returnValue('CachedValue');

        const firstCall = field.defaultValue;
        const secondCall = field.defaultValue;

        expect(firstCall).toBe('CachedValue');
        expect(secondCall).toBe('CachedValue');
        expect(utils._getInheritableProperty).toHaveBeenCalledTimes(1);
    });
});
describe('PdfTextBoxField getter/setter', () => {
    let field: any;

    beforeEach(() => {
        const document = new PdfDocument();
        field = new PdfTextBoxField(document.addPage(), 'text', { x: 0, y: 0, width: 100, height: 100 });
    });

    it('should clear multiLine flag when value is false', () => {
        // Act
        field.multiLine = false;

        // Assert: multiLine bit must be cleared
        expect(field._fieldFlags & _FieldFlag.multiLine).toBe(0);
    });

    it('should set lineAlignment to middle when multiLine is false', () => {
        // Act
        field.multiLine = false;

        // Assert
        expect(field._stringFormat.lineAlignment)
            .toBe(PdfVerticalAlignment.middle);
    });

});
describe('PdfTextBoxField.text getter – marked if/else branches', () => {
    let field: any;

    beforeEach(() => {
        field = new (PdfTextBoxField as any)();

        // Default values
        field._text = undefined;
        field._defaultIndex = 0;
        field._dictionary = {};
        field.itemAt = jasmine.createSpy('itemAt').and.returnValue(null);

        spyOn(utils, '_stringToPdfString').and.callFake(function (v: any) {
            return 'PDF(' + v + ')';
        });

        spyOn(utils, '_getInheritableProperty').and.returnValue(undefined);
    });

    it('returns empty string when field is not loaded', () => {
        field._isLoaded = false;

        const value = field.text;

        expect(value).toBe('');
        expect(field._text).toBe('');
    });

    it('uses dictionary value V when loaded and V exists', () => {
        field._isLoaded = true;

        (utils._getInheritableProperty as jasmine.Spy)
            .and.returnValue('Hello');

        const value = field.text;

        expect(value).toBe('PDF(Hello)');
        expect(field._text).toBe('PDF(Hello)');
    });

    it('uses widget value when dictionary V is missing but widget has V', () => {
        field._isLoaded = true;

        (utils._getInheritableProperty as jasmine.Spy)
            .and.returnValue(undefined);

        field.itemAt.and.returnValue({
            _dictionary: {
                get: function () {
                    return 'WidgetText';
                }
            }
        });

        const value = field.text;

        expect(value).toBe('PDF(WidgetText)');
        expect(field._text).toBe('PDF(WidgetText)');
    });

    it('returns undefined when loaded but no dictionary V and no widget', () => {
        field._isLoaded = true;

        (utils._getInheritableProperty as jasmine.Spy)
            .and.returnValue(undefined);

        field.itemAt.and.returnValue(null);

        const value = field.text;

        expect(value).toBeUndefined();
    });

    it('returns cached value when _text is already set', () => {
        field._text = 'CACHED';
        field._isLoaded = true;

        const value = field.text;

        expect(value).toBe('CACHED');
        expect(utils._getInheritableProperty).not.toHaveBeenCalled();
    });
});

describe('PdfTextBoxField._postProcess (lines 3586-3631)', () => {

    it('uses _createAppearance and flattens onto page (rotation 90)', () => {
        // Arrange
        const field: any = new (PdfTextBoxField as any)();
        const template: any = { _size: { width: 11, height: 22 } };
        field._createAppearance = jasmine.createSpy('_createAppearance').and.returnValue(template);

        const graphics: any = {
            save: jasmine.createSpy('save').and.returnValue('savedState'),
            restore: jasmine.createSpy('restore'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform'),
            drawTemplate: jasmine.createSpy('drawTemplate'),
            _size: { width: 400, height: 800 }
        };

        const widget: any = {
            _setAppearance: true,
            _enableGrouping: true,
            page: { graphics: graphics, rotation: PdfRotationAngle.angle90 },
            bounds: { x: 5, y: 6, width: 7, height: 8 },
            _dictionary: { _updated: true }
        };

        // Act
        field._postProcess(true, widget);

        // Assert
        expect(field._createAppearance).toHaveBeenCalledWith(true, widget);
        expect(graphics.translateTransform).toHaveBeenCalledWith({ x: graphics._size.width, y: graphics._size.height });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(90);
        expect(graphics.drawTemplate).toHaveBeenCalledWith(template, { x: widget.bounds.x, y: widget.bounds.y, width: template._size.width, height: template._size.height });
        expect(widget._dictionary._updated).toBe(false);
        expect(graphics.restore).toHaveBeenCalled();
    });

    it('calls _addAppearance when not flattening', () => {
        // Arrange
        const field: any = new (PdfTextBoxField as any)();
        const template: any = { _size: { width: 15, height: 25 } };
        field._createAppearance = jasmine.createSpy('_createAppearance').and.returnValue(template);
        spyOn(field, '_addAppearance').and.callFake(() => { });

        const widget: any = {
            _setAppearance: true,
            _enableGrouping: true,
            _dictionary: {},
            bounds: { x: 1, y: 2, width: 3, height: 4 }
        };

        // Act
        field._postProcess(false, widget);

        // Assert
        expect(field._createAppearance).toHaveBeenCalledWith(false, widget);
        expect(field._addAppearance).toHaveBeenCalledWith(widget._dictionary, template, 'N');
    });

});

describe('PdfTextBoxField.highlightMode - getter and setter branches', () => {
    let field: any;
    let widget: any;

    beforeEach(() => {
        field = new (PdfTextBoxField as any)();
        field._defaultIndex = 0;

        widget = null;

        field.itemAt = jasmine.createSpy('itemAt').and.callFake(function () {
            return widget;
        });

        field._dictionary = {
            has: function (k: string) {
                return this._data && typeof this._data[k] !== 'undefined';
            },
            get: function (k: string) {
                return this._data[k];
            },
            update: function (k: string, v: any) {
                this._data[k] = v;
            },
            _data: {}
        };

        spyOn(utils, '_mapHighlightMode').and.callFake(function (n: string) {
            return n;
        });

        spyOn(utils, '_reverseMapHighlightMode').and.callFake(function (v: any) {
            return { name: v };
        });
    });

    /* ===================== GETTER TESTS ===================== */

    it('getter uses widget highlightMode when available', () => {
        widget = { highlightMode: PdfHighlightMode.invert };

        const value = field.highlightMode;

        expect(value).toBe(PdfHighlightMode.invert);
    });

    it('getter uses dictionary H when widget is missing', () => {
        widget = null;
        field._dictionary._data['H'] = { name: PdfHighlightMode.outline };

        const value = field.highlightMode;

        expect(utils._mapHighlightMode).toHaveBeenCalledWith(
            PdfHighlightMode.outline
        );
        expect(value).toBe(PdfHighlightMode.outline);
    });

    it('getter returns noHighlighting when neither widget nor dictionary has value', () => {
        widget = null;

        const value = field.highlightMode;

        expect(value).toBe(PdfHighlightMode.noHighlighting);
    });

    /* ===================== SETTER TESTS ===================== */

    it('setter updates widget highlightMode when widget exists and value differs', () => {
        widget = { highlightMode: PdfHighlightMode.invert };

        field.highlightMode = PdfHighlightMode.push;

        expect(widget.highlightMode).toBe(PdfHighlightMode.push);
    });

    it('setter updates dictionary when no widget present', () => {
        widget = null;

        field.highlightMode = PdfHighlightMode.push;

        expect(field._dictionary._data['H'].name)
            .toBe(PdfHighlightMode.push);
    });
});
describe('PdfSignatureField._createAppearance - marked if coverage', () => {
    let field: any;
    let widget: any;
    let original: any;
    function mockTemplate() {
        return {
            graphics: {
                save: jasmine.createSpy('save'),
                restore: jasmine.createSpy('restore'),
                _initializeCoordinates: jasmine.createSpy('_initializeCoordinates')
            },
            _writeTransformation: true
        };
    }

    beforeEach(() => {
        original = PdfTemplate;
        field = new (PdfSignatureField as any)();
        field._crossReference = {};

        spyOn(utils, '_setMatrix').and.stub();
        spyOn(field, '_drawRectangularControl').and.stub();

        (PdfTemplate as any) = jasmine.createSpy('PdfTemplate')
            .and.callFake(() => mockTemplate());

        widget = {
            bounds: { width: 100, height: 50 },
            backColor: { r: 200, g: 200, b: 200, isTransparent: false },
            color: { r: 0, g: 0, b: 0 },
            border: { width: 2, style: PdfBorderStyle.solid },
            borderColor: { r: 10, g: 10, b: 10 },
            rotate: 0
        };
    });

    afterEach(() => {
        (PdfTemplate as any) = original;
    });

    it('creates backBrush when isFlatten=true and backcolor is not transparent', () => {
        const template = field._createAppearance(widget, true);

        const graphics = (template as any).graphics;
        expect(field._drawRectangularControl).toHaveBeenCalled();
    });

    it('does NOT create backBrush when isFlatten=false', () => {
        const template = field._createAppearance(widget, false);

        expect(field._drawRectangularControl).toHaveBeenCalled();
    });

    it('creates borderPen when widget.borderColor exists', () => {
        field._createAppearance(widget, true);

        expect(field._drawRectangularControl).toHaveBeenCalled();
    });

    it('skips borderPen when widget.borderColor is missing', () => {
        widget.borderColor = null;

        field._createAppearance(widget, true);

        expect(field._drawRectangularControl).toHaveBeenCalled();
    });

    it('creates shadowBrush when backcolor exists', () => {
        field._createAppearance(widget, true);

        expect(field._drawRectangularControl).toHaveBeenCalled();
    });

    it('skips shadowBrush when backcolor is null', () => {
        widget.backColor = null;

        field._createAppearance(widget, true);

        expect(field._drawRectangularControl).toHaveBeenCalled();
    });
});

describe('PdfField._calculateTemplateBounds and _obtainGraphicsRotation (lines 9535-9583)', () => {

    it('returns original bounds when graphics rotation is 0 (no transforms)', () => {
        // Arrange
        const field: any = Object.create(PdfSignatureField.prototype);
        const bounds = { x: 5, y: 6, width: 30, height: 40 };
        const page: any = {
            _size: { width: 200, height: 300 },
            graphics: {
                _matrix: { _matrix: { _elements: [1, 0, 0, 1] } },
                translateTransform: jasmine.createSpy('translateTransform'),
                rotateTransform: jasmine.createSpy('rotateTransform')
            }
        };
        const template: any = { _size: { width: 10, height: 20 } };

        // Act
        const result = PdfSignatureField.prototype._calculateTemplateBounds.call(field, bounds, page, template, page.graphics);

        // Assert
        expect(result).toEqual(bounds);
        expect(page.graphics.translateTransform).not.toHaveBeenCalled();
        expect(page.graphics.rotateTransform).not.toHaveBeenCalled();
    });

    it('applies transforms for graphics rotation 90', () => {
        // Arrange
        const field: any = Object.create(PdfSignatureField.prototype);
        const bounds = { x: 2, y: 3, width: 10, height: 15 };
        const template: any = { _size: { width: 7, height: 11 } };
        const page: any = {
            _size: { width: 400, height: 500 },
            graphics: {
                _matrix: { _matrix: { _elements: [0, 0, -1, 0] } },
                translateTransform: jasmine.createSpy('translateTransform'),
                rotateTransform: jasmine.createSpy('rotateTransform')
            }
        };

        // Act
        const res = PdfSignatureField.prototype._calculateTemplateBounds.call(field, bounds, page, template, page.graphics);

        // Assert: translation by template._size.height and rotation 90
        expect(page.graphics.translateTransform).toHaveBeenCalledWith({ x: template._size.height, y: 0 });
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(90);
        expect(res.x).toBe(bounds.x);
        expect(res.y).toBe(-(page._size.height - bounds.y - bounds.height));
        expect(res.width).toBe(bounds.width);
        expect(res.height).toBe(bounds.height);
    });

    it('applies transforms for graphics rotation 180', () => {
        // Arrange
        const field: any = Object.create(PdfSignatureField.prototype);
        const bounds = { x: 4, y: 5, width: 12, height: 18 };
        const template: any = { _size: { width: 9, height: 14 } };
        const page: any = {
            _size: { width: 300, height: 250 },
            graphics: {
                _matrix: { _matrix: { _elements: [-1, 0, 0, 1] } },
                translateTransform: jasmine.createSpy('translateTransform'),
                rotateTransform: jasmine.createSpy('rotateTransform')
            }
        };

        // Act
        const out = PdfSignatureField.prototype._calculateTemplateBounds.call(field, bounds, page, template, page.graphics);

        // Assert
        expect(page.graphics.translateTransform).toHaveBeenCalledWith({ x: template._size.width, y: template._size.height });
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(180);
        expect(out.x).toBe(-(page._size.width - (bounds.x + template._size.width)));
        expect(out.y).toBe(-(page._size.height - bounds.y - template._size.height));
        expect(out.width).toBe(bounds.width);
        expect(out.height).toBe(bounds.height);
    });

    it('handles rotation 270 with template Matrix matching (matrix[1]==-1 && matrix[2]==1)', () => {
        // Arrange
        const field: any = Object.create(PdfSignatureField.prototype);
        const bounds = { x: 10, y: 20, width: 30, height: 40 };
        const template: any = {
            _size: { width: 6, height: 8 },
            size: { width: 6, height: 8 },
            _content: { dictionary: { has: (k: string) => k === 'Matrix', get: (k: string) => [0, -1, 1, 0] } }
        };
        const page: any = {
            _size: { width: 600, height: 200 }, // width > height to hit matrix branch
            graphics: {
                _matrix: { _matrix: { _elements: [0, 0, 1, 0] } },
                translateTransform: jasmine.createSpy('translateTransform'),
                rotateTransform: jasmine.createSpy('rotateTransform')
            }
        };

        // Act
        const out = PdfSignatureField.prototype._calculateTemplateBounds.call(field, bounds, page, template, page.graphics);

        // Assert: translate by {x:0,y:template._size.width} and rotate 270
        expect(page.graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: template._size.width });
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(270);
        expect(out.x).toBe(-(page._size.width - bounds.x - template.size.width));
        expect(out.y).toBe(bounds.y - bounds.height);
        expect(out.width).toBe(bounds.width);
        expect(out.height).toBe(bounds.height);
    });

    it('handles rotation 270 with Matrix present but not matching => returns swapped dims', () => {
        // Arrange
        const field: any = Object.create(PdfSignatureField.prototype);
        const bounds = { x: 7, y: 8, width: 20, height: 10 };
        const template: any = {
            _size: { width: 5, height: 9 },
            size: { width: 5, height: 9 },
            _content: { dictionary: { has: (k: string) => k === 'Matrix', get: (k: string) => [0, 0, 0, 0] } }
        };
        const page: any = {
            _size: { width: 400, height: 100 }, // width > height
            graphics: {
                _matrix: { _matrix: { _elements: [0, 0, 1, 0] } },
                translateTransform: jasmine.createSpy('translateTransform'),
                rotateTransform: jasmine.createSpy('rotateTransform')
            }
        };

        // Act
        const out = PdfSignatureField.prototype._calculateTemplateBounds.call(field, bounds, page, template, page.graphics);

        // Assert: should return swapped width/height and that transforms were applied
        expect(page.graphics.translateTransform).toHaveBeenCalledWith({ x: 0, y: template._size.width });
        expect(page.graphics.rotateTransform).toHaveBeenCalledWith(270);
        expect(out.width).toBe(bounds.height);
        expect(out.height).toBe(bounds.width);
    });

});

describe('PdfSignatureField._flattenSignature – marked if/else coverage', () => {
    let field: any;
    let dictionary: any;
    let appearanceDict: any;
    let appearanceStream: any;
    let signatureTemplate: any;
    let bounds: any;
    let original: any;
    function mockGraphics() {
        return {
            _size: { width: 200, height: 200 },
            _sw: { _stream: {} },
            _crossReference: {},
            save: jasmine.createSpy('save').and.returnValue({}),
            restore: jasmine.createSpy('restore'),
            drawTemplate: jasmine.createSpy('drawTemplate')
        };
    }

    function mockPage(rotation: any) {
        return {
            rotation: rotation,
            graphics: mockGraphics()
        };
    }
    beforeEach(() => {
        original = PdfTemplate;
        field = new (PdfSignatureField as any)();
        field._crossReference = {};
        field._isSigned = false;

        bounds = { x: 0, y: 0, width: 100, height: 50 };

        spyOn(field, '_calculateTemplateBounds').and.callFake(
            (_b: any) => _b
        );
        (PdfTemplate as any) = jasmine.createSpy('PdfTemplate')
            .and.callFake(() => ({ _isSignature: false }));
    });

    afterEach(() => {
        (PdfTemplate as any) = original;
    });

    it('uses appearance stream and creates new template when AP and N exist', () => {
        appearanceStream = {};
        appearanceDict = {
            has: (k: string) => k === 'N',
            get: () => appearanceStream,
            getRaw: () => ({ ref: true })
        };

        dictionary = {
            has: (k: string) => k === 'AP',
            get: () => appearanceDict
        };

        const page = mockPage(PdfRotationAngle.angle0);

        field._flattenSignature(dictionary, page, bounds, null);

        expect(PdfTemplate).toHaveBeenCalled();
        expect(page.graphics.drawTemplate).toHaveBeenCalledWith(
            jasmine.anything(),
            bounds
        );
    });

    it('uses provided signatureTemplate instead of creating new one', () => {
        appearanceStream = {};
        appearanceDict = {
            has: () => true,
            get: () => appearanceStream,
            getRaw: () => ({})
        };

        dictionary = {
            has: () => true,
            get: () => appearanceDict
        };

        signatureTemplate = { _isSignature: false };
        const page = mockPage(PdfRotationAngle.angle0);

        field._flattenSignature(dictionary, page, bounds, signatureTemplate);

        expect(PdfTemplate).not.toHaveBeenCalled();
        expect(page.graphics.drawTemplate).toHaveBeenCalled();
    });

    it('marks template as signature when field is signed', () => {
        field._isSigned = true;

        appearanceDict = {
            has: () => true,
            get: () => ({}),
            getRaw: () => ({})
        };

        dictionary = {
            has: () => true,
            get: () => appearanceDict
        };

        const page = mockPage(PdfRotationAngle.angle0);
        signatureTemplate = {};

        field._flattenSignature(dictionary, page, bounds, signatureTemplate);

        expect(signatureTemplate._isSignature).toBeTruthy();
    });

    it('uses rotated graphics path when page rotation is not angle0', () => {
        appearanceDict = {
            has: () => true,
            get: () => ({}),
            getRaw: () => ({})
        };

        dictionary = {
            has: () => true,
            get: () => appearanceDict
        };

        const page = mockPage(PdfRotationAngle.angle90);


        spyOn(pdf_graphics as any, 'PdfGraphics')
            .and.callFake(() => ({
                drawTemplate: jasmine.createSpy('drawTemplate')
            }));

        field._flattenSignature(dictionary, page, bounds, null);

        expect(field._calculateTemplateBounds).toHaveBeenCalled();
    });

    it('falls back to signatureTemplate when AP is missing', () => {
        dictionary = {
            has: () => false
        };

        signatureTemplate = {};
        const page = mockPage(PdfRotationAngle.angle0);

        field._flattenSignature(dictionary, page, bounds, signatureTemplate);

        expect(page.graphics.drawTemplate).toHaveBeenCalledWith(
            signatureTemplate,
            bounds
        );
    });

    it('handles fallback rotated drawing when AP is missing and page is rotated', () => {
        dictionary = {
            has: () => false
        };

        signatureTemplate = {};
        const page = mockPage(PdfRotationAngle.angle180);

        spyOn(pdf_graphics as any, 'PdfGraphics')
            .and.callFake(() => ({
                drawTemplate: jasmine.createSpy('drawTemplate')
            }));

        field._flattenSignature(dictionary, page, bounds, signatureTemplate);

        expect(field._calculateTemplateBounds).toHaveBeenCalled();
    });
});
describe('PdfSignatureField getAppearance', () => {
    it('return null', () => {
        const field = new PdfSignatureField();
        field._isLoaded = true;
        const result = field.getAppearance();
        expect(result).toEqual(null);
    });
});

describe('PdfSignatureField._doPostProcess - if/else coverage', () => {
    let field: any;

    beforeEach(() => {
        field = new (PdfSignatureField as any)();

        // Common stubs
        field._form = { _setAppearance: false };
        field._setAppearance = false;
        field._appearance = null;

        field._crossReference = {
            _getNextReference: jasmine.createSpy().and.returnValue('R1'),
            _cacheMap: new Map()
        };

        field._widgetAnnot = {
            _getRotationAngle: jasmine.createSpy().and.returnValue(0),
            _dictionary: { set: jasmine.createSpy('set') }
        };

        spyOn(utils, '_setMatrix').and.stub();
        spyOn(field, '_createAppearance').and.returnValue({ tpl: true });
        spyOn(field, '_addAppearance').and.stub();
        spyOn(field, '_flattenSignature').and.stub();
        spyOn(field, '_getItemTemplate').and.returnValue({ t: 'first' });

        // Children handling
        field._kids = [];
        field.itemAt = jasmine.createSpy('itemAt');
    });

    function makeItem(hasAP = true, hasPage = true) {
        return {
            _dictionary: {
                has: (k: string) => k === 'AP' ? hasAP : false,
                set: jasmine.createSpy('set')
            },
            page: hasPage ? { id: 1 } : null,
            bounds: { x: 0, y: 0, width: 10, height: 10 }
        };
    }

    it('locks signature when locked, not certified, and not signed', () => {
        const lockSpy = jasmine.createSpy('_lockSignature');
        field._signature = {
            _isLocked: true,
            _certify: false,
            _signed: false,
            _lockSignature: lockSpy
        };

        field._doPostProcess();

        expect(lockSpy).toHaveBeenCalled();
    });

    it('creates appearance for kids when needAppearance=true', () => {
        field._setAppearance = true;
        field._kids = [new pdfPrimitives._PdfReference(4, 0)];
        field.itemAt.and.returnValue(makeItem(false, true));

        field._doPostProcess(false);

        expect(field._createAppearance).toHaveBeenCalled();
        expect(field._addAppearance).toHaveBeenCalled();
    });

    it('creates appearance when flattening and item has no AP', () => {
        field._kids = [new pdfPrimitives._PdfReference(4, 0)];
        field.itemAt.and.returnValue(makeItem(false, true));

        field._doPostProcess(true);

        expect(field._createAppearance).toHaveBeenCalled();
        expect(field._addAppearance).toHaveBeenCalled();
    });

    it('flattens each kid when isFlatten=true and kids exist', () => {
        field._kids = [new pdfPrimitives._PdfReference(4, 0), new pdfPrimitives._PdfReference(5, 0)];
        field.itemAt.and.callFake((i: number) => makeItem(true, true));

        field._doPostProcess(true);

        expect(field._flattenSignature).toHaveBeenCalled();
    });

    it('uses first item template when flattening kids', () => {
        field._kids = [new pdfPrimitives._PdfReference(4, 0)];

        field.itemAt.and.returnValue(makeItem(true, true));

        field._doPostProcess(true);

        expect(field._getItemTemplate).toHaveBeenCalled();
    });

});
describe('PdfRadioButtonListField.checked getter', () => {
    let field: PdfRadioButtonListField;

    beforeEach(() => {
        field = new PdfRadioButtonListField();

        spyOn(field, 'itemAt').and.callFake(() => {
            return true;
        });
    });

    it('returns child checked value when kids exist', () => {
        field._kids = [new pdfPrimitives._PdfReference(4,0)];

        const result = field.checked;

        expect(result).toBeUndefined();
    });

    it('returns false when there are no kids', () => {
        field._kids = [];

        const result = field.checked;

        expect(result).toBeFalsy();
    });
});
