import { _PdfDefaultAppearance, PdfButtonField, PdfComboBoxField, PdfListBoxField, PdfListField, PdfTextBoxField } from '../../src/pdf/core/form/field';
import * as pdf_primitives_1 from '../../src/pdf/core/pdf-primitives'
import { PdfStandardFont, PdfFontFamily } from '../../src/pdf/core/fonts/pdf-standard-font';
import * as utils from '../../src/pdf/core/utils'
import { PdfBorderStyle, PdfRotationAngle, PdfTextAlignment } from '../../src/pdf/core/enumerator';
// describe('PdfComboBoxField _getFontHeight tests', () => {
//     let origMeasure: any;
//     let origGetLineWidth: any;

//     beforeEach(() => {
//         origMeasure = (PdfStandardFont.prototype as any).measureString;
//         origGetLineWidth = (PdfStandardFont.prototype as any).getLineWidth;
//     });

//     afterEach(() => {
//         (PdfStandardFont.prototype as any).measureString = origMeasure;
//         (PdfStandardFont.prototype as any).getLineWidth = origGetLineWidth;
//     });

//     it('returns 0 when not loaded and no values present', () => {
//         // Arrange
//         const field: any = new PdfComboBoxField();
//         field._isLoaded = false;
//         field._dictionary = { get: (_: string) => null as any, getArray: (_: string) => [] as any };
//         field.bounds = { x: 0, y: 0, width: 100, height: 20 };
//         field.border = { width: 1 };
//         // Act
//         const s: number = field._getFontHeight(PdfFontFamily.helvetica);
//         // Assert
//         expect(s).toBe(0);
//     });

//     it('returns 12 when loaded and no option widths available', () => {
//         // Arrange
//         const field: any = new PdfComboBoxField();
//         field._isLoaded = true;
//         field._dictionary = { get: (_: string) => null as any, getArray: (_: string) => [] as any };
//         field.bounds = { x: 0, y: 0, width: 80, height: 20 };
//         field.border = { width: 1 };
//         // Act
//         const s: number = field._getFontHeight(PdfFontFamily.helvetica);
//         // Assert
//         expect(s).toBe(12);
//     });

//     it('not loaded with values and zero measured width falls back to 12', () => {
//         // Arrange
//         (PdfStandardFont.prototype as any).measureString = function() { return { width: 0, height: 0 }; };
//         const field: any = new PdfComboBoxField();
//         field._isLoaded = false;
//         field._dictionary = { get: (_: string) => [0], getArray: (_: string) => [['k', 'v']] };
//         field.selectedValue = null;
//         field.bounds = { x: 0, y: 0, width: 80, height: 20 };
//         field.border = { width: 1 };
//         // Act
//         const s: number = field._getFontHeight(PdfFontFamily.helvetica);
//         // Assert
//         expect(s).toBe(12);
//     });

//     it('scales down when measured text exceeds bounds (loaded, values present)', () => {
//         // Arrange
//         // make measurement scale with font size so loops are triggered
//         (PdfStandardFont.prototype as any).measureString = function() {
//             return { width: this._size * 20, height: this._size * 2 };
//         };
//         (PdfStandardFont.prototype as any).getLineWidth = function() {
//             return this._size * 20;
//         };
//         const field: any = new PdfComboBoxField();
//         field._isLoaded = true;
//         field._dictionary = { get: (_: string) => [0], getArray: (_: string) => [['k', 'LONGTEXT']] };
//         field.selectedValue = null;
//         field.bounds = { x: 0, y: 0, width: 50, height: 10 };
//         field.border = { width: 1 };
//         // Act
//         const s: number = field._getFontHeight(PdfFontFamily.helvetica);
//         // Assert: result should be a positive scaled value within expected limits
//         expect(typeof s).toBe('number');
//         expect(s).toBeGreaterThan(0.248);
//         expect(s).toBeLessThan(12);
//     });

//     it('returns 0 when _isNullOrUndefined returns false even if listValues present (explicit else)', () => {
//         // Arrange
//         const origIsNull: any = utils._isNullOrUndefined;
//         (utils as any)._isNullOrUndefined = () => false;
//         const field: any = new PdfComboBoxField();
//         field._listValues = ['one', 'two'];
//         field.bounds = { x: 0, y: 0, width: 80, height: 20 };
//         field.border = { width: 1 };

//         // Act
//         const s: number = field._getFontHeight(PdfFontFamily.helvetica);

//         // Assert
//         expect(s).toBe(0);

//         // Cleanup
//         (utils as any)._isNullOrUndefined = origIsNull;
//     });

//     it('computes scaled font size when _isNullOrUndefined returns true and listValues present', () => {
//         // Arrange
//         const origMeasure: any = (PdfStandardFont.prototype as any).measureString;
//         const origIsNull: any = (utils as any)._isNullOrUndefined;
//         // force the module-level null check to return true so the branch runs
//         (utils as any)._isNullOrUndefined = () => true;
//         // make measureString return a predictable large width so scaling happens
//         (PdfStandardFont.prototype as any).measureString = function() {
//             return { width: 456, height: 10 };
//         };

//         const field: any = new PdfComboBoxField();
//         field._listValues = ['LONGTEXT'];
//         field.bounds = { x: 0, y: 0, width: 80, height: 20 };
//         field.border = { width: 1 };

//         // Act
//         const s: number = field._getFontHeight(PdfFontFamily.helvetica);

//         // Expected: s = Math.min(12, (12*(width - 4*border))/max)
//         const expected = Math.min(12, (12 * (80 - 4 * 1)) / 456);

//         // Assert
//         expect(typeof s).toBe('number');
//         expect(s).toBeCloseTo(expected, 5);

//         // Cleanup
//         (PdfStandardFont.prototype as any).measureString = origMeasure;
//         (utils as any)._isNullOrUndefined = origIsNull;
//     });
// });

// describe('PdfComboBoxField _getFontHeight tests (spy-based, no prototype mutation)', () => {

//     it('returns 0 when not loaded and no values present', () => {
//         const field: any = new PdfComboBoxField();
//         field._isLoaded = false;
//         field._dictionary = {
//             get: () => null as any,
//             getArray: () => [] as any
//         };
//         field.bounds = { x: 0, y: 0, width: 100, height: 20 };
//         field.border = { width: 1 };

//         const s = field._getFontHeight(PdfFontFamily.helvetica);

//         expect(s).toBe(0);
//     });

//     it('returns 12 when loaded and no option widths available', () => {
//         const field: any = new PdfComboBoxField();
//         field._isLoaded = true;
//         field._dictionary = {
//             get: () => null as any,
//             getArray: () => [] as any
//         };
//         field.bounds = { x: 0, y: 0, width: 80, height: 20 };
//         field.border = { width: 1 };

//         const s = field._getFontHeight(PdfFontFamily.helvetica);

//         expect(s).toBe(12);
//     });

//     it('not loaded with values and zero measured width falls back to 12', () => {
//         spyOn(PdfStandardFont.prototype as any, 'measureString')
//             .and.callFake(() => ({ width: 0, height: 0 }));

//         const field: any = new PdfComboBoxField();
//         field._isLoaded = false;
//         field._dictionary = {
//             get: () => [0],
//             getArray: () => [['k', 'v']]
//         };
//         field.selectedValue = null;
//         field.bounds = { x: 0, y: 0, width: 80, height: 20 };
//         field.border = { width: 1 };

//         const s = field._getFontHeight(PdfFontFamily.helvetica);

//         expect(s).toBe(12);
//     });

//     it('scales down when measured text exceeds bounds (loaded, values present)', () => {
//         spyOn(PdfStandardFont.prototype as any, 'measureString')
//             .and.callFake(function () {
//                 return { width: this._size * 20, height: this._size * 2 };
//             });

//         spyOn(PdfStandardFont.prototype as any, 'getLineWidth')
//             .and.callFake(function () {
//                 return this._size * 20;
//             });

//         const field: any = new PdfComboBoxField();
//         field._isLoaded = true;
//         field._dictionary = {
//             get: () => [0],
//             getArray: () => [['k', 'LONGTEXT']]
//         };
//         field.selectedValue = null;
//         field.bounds = { x: 0, y: 0, width: 50, height: 10 };
//         field.border = { width: 1 };

//         const s = field._getFontHeight(PdfFontFamily.helvetica);

//         expect(typeof s).toBe('number');
//         expect(s).toBeGreaterThan(0.248);
//         expect(s).toBeLessThan(12);
//     });

//     it('returns 0 when _isNullOrUndefined returns false even if listValues present (explicit else)', () => {
//         spyOn(utils as any, '_isNullOrUndefined')
//             .and.returnValue(false);

//         const field: any = new PdfComboBoxField();
//         field._listValues = ['one', 'two'];
//         field.bounds = { x: 0, y: 0, width: 80, height: 20 };
//         field.border = { width: 1 };

//         const s = field._getFontHeight(PdfFontFamily.helvetica);

//         expect(s).toBe(0);
//     });

//     it('computes scaled font size when _isNullOrUndefined returns true and listValues present', () => {
//         spyOn(utils as any, '_isNullOrUndefined')
//             .and.returnValue(true);

//         spyOn(PdfStandardFont.prototype as any, 'measureString')
//             .and.callFake(() => ({ width: 456, height: 10 }));

//         const field: any = new PdfComboBoxField();
//         field._listValues = ['LONGTEXT'];
//         field.bounds = { x: 0, y: 0, width: 80, height: 20 };
//         field.border = { width: 1 };

//         const s = field._getFontHeight(PdfFontFamily.helvetica);
//         const expected = Math.min(12, (12 * (80 - 4)) / 456);

//         expect(typeof s).toBe('number');
//         expect(s).toBeCloseTo(expected, 5);
//     });

// });
describe('PdfComboBoxField._drawComboBox - marked if coverage', () => {
    let field: any;
    let graphics: any;
    let parameter: any;
    let font: any;
    let stringFormat: any;

    function mockGraphics() {
        return {
            _isTemplateGraphics: false,
            _size: { width: 200, height: 300 },
            _sw: {
                _beginMarkupSequence: jasmine.createSpy('_beginMarkupSequence'),
                _endMarkupSequence: jasmine.createSpy('_endMarkupSequence')
            },
            save: jasmine.createSpy('save').and.returnValue('state'),
            restore: jasmine.createSpy('restore'),
            _initializeCoordinates: jasmine.createSpy('_initializeCoordinates'),
            drawString: jasmine.createSpy('drawString'),
            setClip: jasmine.createSpy('setClip'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform')
        };
    }
    function createField() {
        return {
            color: null,
            _options: [[0, 'One'], [1, 'Two']],
            _dictionary: { get: jasmine.createSpy('get') },
            _drawRectangularControl: jasmine.createSpy('_drawRectangularControl'),
            _drawComboBox:
                (PdfComboBoxField as any).prototype._drawComboBox
        } as any;
    }
    beforeEach(() => {
        graphics = mockGraphics();
        field = createField();

        font = { _getHeight: () => 10 } as any;
        stringFormat = {} as any;

        parameter = {
            bounds: { x: 0, y: 0, width: 100, height: 20 },
            borderWidth: 2,
            borderStyle: PdfBorderStyle.solid,
            required: false,
            foreBrush: {},
            rotationAngle: 0
        };
    });

    it('enters and exits markup sequence when template graphics and required', () => {
        graphics._isTemplateGraphics = true;
        parameter.required = true;
        field._dictionary.get.and.returnValue([0]);

        field._drawComboBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.save).toHaveBeenCalled();
        expect(graphics._sw._beginMarkupSequence).toHaveBeenCalledWith('Tx');
        expect(graphics._sw._endMarkupSequence).toHaveBeenCalled();
        expect(graphics.restore).toHaveBeenCalled();
    });

    it('draws selected option when index is valid', () => {
        field._dictionary.get.and.returnValue([1]); // selects "Two"

        field._drawComboBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.drawString).toHaveBeenCalledWith(
            'Two',
            font,
            jasmine.any(Object),
            null,
            jasmine.anything(),
            stringFormat
        );
    });

    it('applies padding for inset/beveled border styles', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.borderStyle = PdfBorderStyle.inset;

        field._drawComboBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.setClip).toHaveBeenCalled();
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('handles rotationAngle 90', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.rotationAngle = 90;

        field._drawComboBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.save).toHaveBeenCalled();
        expect(graphics.translateTransform).toHaveBeenCalledWith({
            x: 0,
            y: graphics._size.height
        });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
        expect(graphics.restore).toHaveBeenCalled();
    });

    it('handles rotationAngle 180', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.rotationAngle = 180;

        field._drawComboBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.translateTransform).toHaveBeenCalledWith({
            x: graphics._size.width,
            y: graphics._size.height
        });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-180);
    });

    it('handles rotationAngle 270', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.rotationAngle = 270;

        field._drawComboBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.translateTransform).toHaveBeenCalledWith({
            x: graphics._size.width,
            y: 0
        });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-270);
    });

    it('does not rotate when rotationAngle is 0', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.rotationAngle = 0;

        field._drawComboBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.rotateTransform).not.toHaveBeenCalled();
        expect(graphics.translateTransform).not.toHaveBeenCalled();
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('does nothing when no selected index exists', () => {
        field._dictionary.get.and.returnValue(null);

        field._drawComboBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.drawString).not.toHaveBeenCalled();
    });
});
describe('PdfListField._obtainFont - coverage for lines 7679-7740', () => {
    let fieldModule: any;
    let origStd: any;
    let origCreateFontStream: any;
    let origGetFontFromDescriptor: any;
    let origEncode: any;
    let origDecode: any;

    beforeEach(() => {
        fieldModule = require('../../src/pdf/core/form/field');
        origStd = fieldModule.PdfStandardFont;
        origCreateFontStream = fieldModule._createFontStream;
        origGetFontFromDescriptor = fieldModule._getFontFromDescriptor;
        origEncode = fieldModule._encode;
        origDecode = fieldModule._decodeFontFamily;
    });

    afterEach(() => {
        fieldModule.PdfStandardFont = origStd;
        fieldModule._createFontStream = origCreateFontStream;
        fieldModule._getFontFromDescriptor = origGetFontFromDescriptor;
        fieldModule._encode = origEncode;
        fieldModule._decodeFontFamily = origDecode;
    });

});
describe('PdfListBoxField._drawListBox - marked if coverage', () => {
    let field: any;
    let graphics: any;
    let parameter: any;
    let font: any;
    let stringFormat: any;

    function mockGraphics() {
        return {
            _isTemplateGraphics: false,
            _size: { width: 200, height: 300 },
            _sw: {
                _beginMarkupSequence: jasmine.createSpy('_beginMarkupSequence'),
                _endMarkupSequence: jasmine.createSpy('_endMarkupSequence')
            },
            save: jasmine.createSpy('save').and.returnValue('state'),
            restore: jasmine.createSpy('restore'),
            _initializeCoordinates: jasmine.createSpy('_initializeCoordinates'),
            drawString: jasmine.createSpy('drawString'),
            drawRectangle: jasmine.createSpy('drawRectangle'),
            setClip: jasmine.createSpy('setClip'),
            translateTransform: jasmine.createSpy('translateTransform'),
            rotateTransform: jasmine.createSpy('rotateTransform')
        };
    }

    function createField() {
        return {
            color: null,
            _options: ['One', ['v1', 'Two']],
            _dictionary: { get: jasmine.createSpy('get') },
            _drawRectangularControl: jasmine.createSpy('_drawRectangularControl'),
            _drawListBox:
                (PdfListBoxField as any).prototype._drawListBox
        } as any;
    }

    beforeEach(() => {
        graphics = mockGraphics();
        field = createField();

        font = { _getHeight: () => 10 } as any;
        stringFormat = {} as any;

        parameter = {
            bounds: { x: 0, y: 0, width: 100, height: 40 },
            borderWidth: 2,
            borderStyle: PdfBorderStyle.solid,
            required: false,
            foreBrush: {},
            rotationAngle: 0
        };
    });

    it('enters and exits markup sequence when template graphics and required', () => {
        graphics._isTemplateGraphics = true;
        parameter.required = true;
        field._dictionary.get.and.returnValue([0]);

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.save).toHaveBeenCalled();
        expect(graphics._sw._beginMarkupSequence).toHaveBeenCalledWith('Tx');
        expect(graphics._sw._endMarkupSequence).toHaveBeenCalled();
        expect(graphics.restore).toHaveBeenCalled();
    });

    it('draws selection background when selected and no rotation', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.rotationAngle = 0;

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.drawRectangle).toHaveBeenCalled();
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('applies padding when borderStyle is inset', () => {
        field._dictionary.get.and.returnValue([1]);
        parameter.borderStyle = PdfBorderStyle.inset;

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.setClip).toHaveBeenCalled();
        expect(graphics.drawString).toHaveBeenCalled();
    });

    it('handles string option item', () => {
        field._dictionary.get.and.returnValue([0]);

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.drawString).toHaveBeenCalledWith(
            'One',
            font,
            jasmine.any(Object),
            null,
            jasmine.anything(),
            stringFormat
        );
    });

    it('handles array option item', () => {
        field._dictionary.get.and.returnValue([1]);

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.drawString).toHaveBeenCalledWith(
            'Two',
            font,
            jasmine.any(Object),
            null,
            jasmine.anything(),
            stringFormat
        );
    });

    it('handles rotationAngle 90', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.rotationAngle = 90;

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.save).toHaveBeenCalled();
        expect(graphics.translateTransform).toHaveBeenCalledWith({
            x: 0,
            y: graphics._size.height
        });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
        expect(graphics.restore).toHaveBeenCalled();
    });

    it('handles rotationAngle 180', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.rotationAngle = 180;

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.translateTransform).toHaveBeenCalledWith({
            x: graphics._size.width,
            y: graphics._size.height
        });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-180);
    });

    it('handles rotationAngle 270', () => {
        field._dictionary.get.and.returnValue([0]);
        parameter.rotationAngle = 270;

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.translateTransform).toHaveBeenCalledWith({
            x: graphics._size.width,
            y: 0
        });
        expect(graphics.rotateTransform).toHaveBeenCalledWith(-270);
    });

    it('does nothing when no selected indexes', () => {
        field._dictionary.get.and.returnValue(null);

        field._drawListBox.call(field, graphics, parameter, font, stringFormat);

        expect(graphics.drawRectangle).not.toHaveBeenCalled();
    });
});
describe('PdfListField.removeItemAt and removeItem', () => {
    let field: any;

    beforeEach(() => {
        field = {
            _parsedItems: new Map<number, any>(),
            _options: [],
            _optionArray: null,
            _dictionary: {
                has: jasmine.createSpy('has'),
                set: jasmine.createSpy('set'),
                _updated: false
            },
            itemsCount: 0,
            itemAt: jasmine.createSpy('itemAt'),

            // bind real implementations
            removeItemAt: (PdfListField as any).prototype.removeItemAt,
            removeItem: (PdfListField as any).prototype.removeItem
        };
    });

    /* ===========================
       removeItemAt
    ============================ */

    it('removes item, reindexes parsed items, and updates option dictionary', () => {
        const item = { _ref: true };
        field.itemAt.and.returnValue(item);

        field._parsedItems.set(0, 'A');
        field._parsedItems.set(1, 'B');

        field._options = ['opt1', 'opt2'];
        field._dictionary.has.and.returnValue(true);

        field.removeItemAt(0);

        expect(field._parsedItems.size).toBe(1);
        expect(field._parsedItems.get(0)).toBe('B');

        expect(field._options).toEqual(['opt2']);
        expect(field._optionArray).toEqual(['opt2']);
        expect(field._dictionary.set).toHaveBeenCalledWith('Opt', ['opt2']);
        expect(field._dictionary._updated).toBeTruthy();
    });

    it('does nothing when item does not exist or has no _ref', () => {
        field.itemAt.and.returnValue({});
        field._parsedItems.set(0, 'A');

        field.removeItemAt(0);

        expect(field._parsedItems.size).toBe(1);
        expect(field._dictionary.set).not.toHaveBeenCalled();
    });

    it('skips option update when dictionary has no Opt entry', () => {
        field.itemAt.and.returnValue({ _ref: true });
        field._parsedItems.set(0, 'A');

        field._options = ['opt1'];
        field._dictionary.has.and.returnValue(false);

        field.removeItemAt(0);

        expect(field._parsedItems.size).toBe(0);
        expect(field._dictionary.set).not.toHaveBeenCalled();
    });

    /* ===========================
       removeItem
    ============================ */

    it('finds matching item and calls removeItemAt', () => {
        const item1 = { text: 'A' };
        const item2 = { text: 'B' };

        field.itemsCount = 2;
        field.itemAt.and.callFake((i: number) => (i === 0 ? item1 : item2));

        spyOn(field, 'removeItemAt').and.stub();

        field.removeItem(item2);

        expect(field.removeItemAt).toHaveBeenCalledWith(1);
    });

    it('does nothing if item has no text', () => {
        spyOn(field, 'removeItemAt').and.stub();

        field.removeItem({});

        expect(field.removeItemAt).not.toHaveBeenCalled();
    });

    it('does nothing if matching item is not found', () => {
        field.itemsCount = 1;
        field.itemAt.and.returnValue({ text: 'X' });

        spyOn(field, 'removeItemAt').and.stub();

        field.removeItem({ text: 'Y' });

    });
});
describe('PdfListField.bounds setter', () => {
  let field: PdfListField;
  let widgetSpy: any;

  beforeEach(() => {
    field = new PdfListBoxField();

    // Fake internal state
    field._defaultIndex = 0;
    field._page = {} as any;

    widgetSpy = {
      _page: null,
      bounds: null
    };

    spyOn(field, 'itemAt').and.returnValue(widgetSpy);

    (field as any)._dictionary = {
      has: jasmine.createSpy('has').and.returnValue(false),
      update: jasmine.createSpy('update')
    };
  });

  it('should throw error when empty bounds are set', () => {
    const emptyBounds = { x: 0, y: 0, width: 0, height: 0 };

    expect(() => {
      field.bounds = emptyBounds;
    }).toThrowError('Cannot set empty bounds');
  });

//   it('should update dictionary when field is loaded and Rect exists', () => {
//     (field as any)._isLoaded = true;
//     (field as any)._dictionary.has.and.returnValue(true);

//     const bounds = { x: 10, y: 10, width: 100, height: 50 };

//     field.bounds = bounds;

//     expect((field as any)._dictionary.update).toHaveBeenCalled();
//   });

  it('should update widget bounds when field is loaded and Rect does not exist', () => {
    (field as any)._isLoaded = true;
    (field as any)._dictionary.has.and.returnValue(false);

    const bounds = { x: 5, y: 5, width: 50, height: 20 };

    field.bounds = bounds;

    expect(widgetSpy._page).toBe(field.page);
    expect(widgetSpy.bounds).toEqual(bounds);
  });

  it('should set widget bounds when field is not loaded and widget exists', () => {
    (field as any)._isLoaded = false;

    const bounds = { x: 20, y: 30, width: 200, height: 80 };

    field.bounds = bounds;

    expect(widgetSpy._page).toBe(field.page);
    expect(widgetSpy.bounds).toEqual(bounds);
  });

});

describe('PdfTextBoxField._drawTextBox - rotation coverage', () => {
  let field: any;
  let graphics: any;
  let parameter: any;
  let font: any;
  let format: any;

  function mockGraphics() {
    return {
      _isTemplateGraphics: false,
      _size: { width: 200, height: 300 },
      _page: { rotation: PdfRotationAngle.angle0 },
      _sw: {
        _beginMarkupSequence: jasmine.createSpy('_beginMarkupSequence'),
        _endMarkupSequence: jasmine.createSpy('_endMarkupSequence')
      },
      save: jasmine.createSpy('save').and.returnValue('state'),
      restore: jasmine.createSpy('restore'),
      _initializeCoordinates: jasmine.createSpy('_initializeCoordinates'),
      drawString: jasmine.createSpy('drawString'),
      drawRectangle: jasmine.createSpy('drawRectangle'),
      drawLine: jasmine.createSpy('drawLine'),
      translateTransform: jasmine.createSpy('translateTransform'),
      rotateTransform: jasmine.createSpy('rotateTransform')
    };
  }

  function createField() {
    return {
      rotate: null,
      _drawRectangularControl: jasmine.createSpy('_drawRectangularControl'),
      _drawTextBox:
        (PdfTextBoxField as any).prototype._drawTextBox
    } as any;
  }

  beforeEach(() => {
    graphics = mockGraphics();
    field = createField();

    font = {
      _getHeight: () => 10,
      _getAscent: () => 7
    } as any;

    format = {
      alignment: PdfTextAlignment.left,
      lineSpacing: 0
    };

    parameter = {
      bounds: { x: 10, y: 10, width: 100, height: 30 },
      borderWidth: 2,
      borderStyle: PdfBorderStyle.solid,
      required: false,
      foreBrush: {},
      insertSpaces: false,
      rotationAngle: 0,
      pageRotationAngle: PdfRotationAngle.angle0,
      isAutoFontSize: false
    };
  });

  it('adjusts rectangle when field.rotate is 90', () => {
    field.rotate = 90;

    field._drawTextBox.call(field, graphics, parameter, 'Rotate', font, format, false, false);

    expect(parameter.bounds.y).toBe(50);
    expect(graphics.drawString).toHaveBeenCalled();
  });

  it('handles rotationAngle 90', () => {
    parameter.rotationAngle = 90;

    field._drawTextBox.call(field, graphics, parameter, 'Text', font, format, false, false);

    expect(graphics.save).toHaveBeenCalled();
    expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
    expect(graphics.drawString).toHaveBeenCalled();
    expect(graphics.restore).toHaveBeenCalled();
  });

  it('handles rotationAngle 180', () => {
    parameter.rotationAngle = 180;

    field._drawTextBox.call(field, graphics, parameter, 'Text', font, format, false, false);

    expect(graphics.translateTransform).toHaveBeenCalledWith({
      x: graphics._size.width,
      y: graphics._size.height
    });
    expect(graphics.rotateTransform).toHaveBeenCalledWith(-180);
    expect(graphics.drawString).toHaveBeenCalled();
  });

  it('handles rotationAngle 270', () => {
    parameter.rotationAngle = 270;

    field._drawTextBox.call(field, graphics, parameter, 'Text', font, format, false, false);

    expect(graphics.translateTransform).toHaveBeenCalledWith({
      x: graphics._size.width,
      y: 0
    });
    expect(graphics.rotateTransform).toHaveBeenCalledWith(-270);
    expect(graphics.drawString).toHaveBeenCalled();
  });

  it('handles pageRotationAngle 90', () => {
    graphics._page.rotation = PdfRotationAngle.angle90;
    parameter.pageRotationAngle = PdfRotationAngle.angle90;

    field._drawTextBox.call(field, graphics, parameter, 'Page90', font, format, false, false);

    expect(graphics.translateTransform).toHaveBeenCalled();
    expect(graphics.rotateTransform).toHaveBeenCalled();
    expect(graphics.drawString).toHaveBeenCalled();
  });

  it('handles pageRotationAngle 180', () => {
    graphics._page.rotation = PdfRotationAngle.angle180;
    parameter.pageRotationAngle = PdfRotationAngle.angle180;

    field._drawTextBox.call(field, graphics, parameter, 'Page180', font, format, false, false);

    expect(graphics.translateTransform).toHaveBeenCalledWith({
      x: graphics._size.width,
      y: graphics._size.height
    });
    expect(graphics.rotateTransform).toHaveBeenCalledWith(-180);
    expect(graphics.drawString).toHaveBeenCalled();
  });

  it('handles pageRotationAngle 270', () => {
    graphics._page.rotation = PdfRotationAngle.angle270;
    parameter.pageRotationAngle = PdfRotationAngle.angle270;

    field._drawTextBox.call(field, graphics, parameter, 'Page270', font, format, false, false);

    expect(graphics.translateTransform).toHaveBeenCalledWith({
      x: 0,
      y: graphics._size.width
    });
    expect(graphics.rotateTransform).toHaveBeenCalledWith(270);
    expect(graphics.drawString).toHaveBeenCalled();
  });

  it('handles pageRotationAngle 90 combined with rotationAngle 90', () => {
    graphics._page.rotation = PdfRotationAngle.angle90;
    parameter.pageRotationAngle = PdfRotationAngle.angle90;
    parameter.rotationAngle = 90;

    field._drawTextBox.call(field, graphics, parameter, 'Combo', font, format, false, false);

    expect(graphics.translateTransform).toHaveBeenCalled();
    expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
    expect(graphics.drawString).toHaveBeenCalled();
  });

  it('handles rotationAngle 90 when rectangle width > height', () => {
    parameter.rotationAngle = 90;
    parameter.bounds.width = 200;
    parameter.bounds.height = 50;

    field._drawTextBox.call(field, graphics, parameter, 'Wide', font, format, false, false);

    expect(graphics.translateTransform).toHaveBeenCalledWith({
      x: 0,
      y: graphics._size.height
    });
    expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
  });

  it('handles rotationAngle 90 when rectangle width <= height', () => {
    parameter.rotationAngle = 90;
    parameter.bounds.width = 30;
    parameter.bounds.height = 100;

    field._drawTextBox.call(field, graphics, parameter, 'Tall', font, format, false, false);

    expect(graphics.rotateTransform).toHaveBeenCalledWith(-90);
    expect(graphics.drawString).toHaveBeenCalled();
  });

  it('does not rotate when rotationAngle and pageRotationAngle are zero', () => {
    parameter.rotationAngle = 0;
    parameter.pageRotationAngle = PdfRotationAngle.angle0;

    field._drawTextBox.call(field, graphics, parameter, 'Normal', font, format, false, false);

    expect(graphics.rotateTransform).not.toHaveBeenCalled();
    expect(graphics.translateTransform).not.toHaveBeenCalled();
    expect(graphics.drawString).toHaveBeenCalled();
  });
});
describe('PdfButtonField.font getter/setter', () => {
  let field: any;
  let mockFont: any;

  beforeEach(() => {
    field = new PdfButtonField();

    field._defaultIndex = 0;
    field._form = {};

    spyOn(field, 'itemAt').and.callFake(() => {
      return {};
    });

    spyOn(utils, '_obtainFontDetails').and.callFake(() => {
      return mockFont;
    });

    spyOn(field, '_initializeFont');
  });

  describe('font getter', () => {
    it('returns existing _font when already set', () => {
      field._font = mockFont;

      const result = field.font;

      expect(result).toBe(mockFont);
    });

    it('obtains and caches font when _font is not set', () => {
      field._font = null;
      mockFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);

      const result = field.font;

      expect(field.itemAt).toHaveBeenCalledWith(0);
      expect(utils._obtainFontDetails).toHaveBeenCalledWith(
        field._form,
        jasmine.anything(),
        field
      );
      expect(field._font).toBe(mockFont);
      expect(result).toBe(mockFont);
    });
  });

  describe('font setter', () => {
    beforeEach(() => {
      mockFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
    });

    it('sets _font and initializes font when value is PdfFont instance', () => {
      field.font = mockFont;

      expect(field._font).toBe(mockFont);
      expect(field._initializeFont).toHaveBeenCalledWith(mockFont);
    });

    it('does nothing when value is not a PdfFont', () => {
      field.font = {} as any;

      expect(field._font).toBeUndefined();
      expect(field._initializeFont).not.toHaveBeenCalled();
    });

    it('does nothing when value is null or undefined', () => {
      field.font = null;
      field.font = undefined;

      expect(field._font).toBeUndefined();
      expect(field._initializeFont).not.toHaveBeenCalled();
    });
  });
});

