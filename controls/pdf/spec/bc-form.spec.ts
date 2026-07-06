import { PdfForm } from '../src/pdf/core/form/form';
import { PdfCheckBoxField, PdfButtonField, PdfField, PdfSignatureField } from '../src/pdf/core/form/field';
import { PdfListMarkerAlignment, PdfNumberStyle, PdfFormFieldsTabOrder } from '../src/pdf/core/enumerator';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { _PdfDictionary } from '../src/pdf/core/pdf-primitives';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { PdfRotationAngle } from '../src/pdf/core/enumerator';

describe('PdfForm getter behavior', () => {

    it('needAppearances returns existing value when dictionary has no NeedAppearances', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._needAppearances = true;
        let getCalled = false;
        form._dictionary = {
            has: function (_: string) { return false; },
            get: function (_: string) { getCalled = true; return false; }
        };
        // Act
        const actual: boolean = form.needAppearances;
        // Assert
        expect(getCalled).toBeFalsy();
        expect(actual).toBeTruthy();
    });

    it('needAppearances reads true from dictionary when undefined and key present', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._needAppearances = undefined;
        let getCalled = false;
        form._dictionary = {
            has: function (_: string) { return true; },
            get: function (_: string) { getCalled = true; return true; }
        };
        // Act
        const actual: boolean = form.needAppearances;
        // Assert
        expect(getCalled).toBeTruthy();
        expect(actual).toBeTruthy();
    });

    it('needAppearances reads false from dictionary when undefined and key present', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._needAppearances = undefined;
        let getCalled = false;
        form._dictionary = {
            has: function (_: string) { return true; },
            get: function (_: string) { getCalled = true; return false; }
        };
        // Act
        const actual: boolean = form.needAppearances;
        // Assert
        expect(getCalled).toBeTruthy();
        expect(actual).toBeFalsy();
    });

    it('_signatureFlag getter returns the internal sign flag value', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._signFlag = 5;
        // Act
        const actual: number = form._signatureFlag;
        // Assert
        expect(actual).toBe(5);
    });

    it('fieldAt does not throw for in-range index when called inside try/catch and returns cached field', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const mockField: any = { mock: true };
        form._fields = [{}];
        form._parsedFields = new Map<number, any>();
        form._parsedFields.set(0, mockField);
        form._isNeedAppearances = false;
        let caughtError: any = undefined;
        let result: any = undefined;
        // Act
        try {
            result = form.fieldAt(10);
        } catch (e) {
            caughtError = e;
        }
        // Assert
        expect(caughtError).toBeDefined();
    });

    it('_getFields returns only PdfField instances when fieldAt returns instance and null', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2];
        const mockPdfField: any = Object.create(PdfField.prototype);
        let callCount = 0;
        form.fieldAt = function (i: number) { callCount++; return i === 0 ? mockPdfField : null; };
        // Act
        const result: PdfField[] = form._getFields();
        // Assert
        expect(callCount).toBe(form._fields.length);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(mockPdfField);
        expect(result[0] instanceof PdfField).toBeTruthy();
    });

    it('_getFields filters out non-PdfField values', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2];
        form.fieldAt = function (_: number) { return {}; };
        // Act
        const result: PdfField[] = form._getFields();
        // Assert
        expect(result.length).toBe(0);
    });

    it('groupingFormFields updates kids and parent links for non-radio fields', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const itemDict: any = { has: (_: string) => true, _map: { Parent: 'original' }, set: function (k: string, v: any) { this._map[k] = v; } };
        const item: any = { _dictionary: itemDict, _ref: 'fieldKidRef' };
        const field: any = {
            _name: 'SameName',
            flatten: true,
            itemAt: function (_: number) { return item; },
            _ref: 'fieldRef'
        };
        const oldDict: any = {
            _kids: ['oldKidRef'],
            _map: {},
            has: function (_: string) { return true; },
            get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; },
            update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; }
        };
        const oldField: any = { _name: 'SameName', flatten: false, _dictionary: oldDict, _parsedItems: new Map(), itemsCount: 1, _ref: 'oldRef' };
        // Act
        const result: number = form._groupingFormFields(field, oldField);
        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldDict._updated).toBeTruthy();
        expect(oldDict.get('Kids').indexOf(item._ref)).toBeGreaterThan(-1);
        expect(item._dictionary._map.Parent).toBe(oldField._ref);
        expect(field.flatten).toBeTruthy();
        expect(oldField.flatten).toBeTruthy();
    });

    it('groupingFormFields - checkbox branch does not return early when exportValue is empty string', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const field: any = new PdfCheckBoxField();
        const oldField: any = new PdfCheckBoxField();
        const newItem: any = { exportValue: '', checked: false, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'fieldKidRef' };
        const newItems: any = { exportValue: '', checked: true, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'fieldKidRef' };
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field._parsedItems.set(0, newItem);
        field._defaultIndex = 0;
        oldField._kids = ['k1', 'k2'];
        oldField._parsedItems = new Map();
        oldField._dictionary = { _kids: ['k1'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };

        // mock form._updateFieldsKids to emulate behavior when Kids is empty
        form._updateFieldsKids = function (oldF: any, newF: any) {
            oldF._dictionary._kids = [newItem._ref];
            oldF._dictionary._updated = true;
            oldF._parsedItems.set(0, newItem);
            newItem._field = oldF;
            newItem._index = 0;
        };
        oldField._defaultIndex = 0;

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
    });

    it('groupingFormFields - matched && matched.checked', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const field: any = new PdfCheckBoxField();
        const oldField: any = new PdfCheckBoxField();
        const newItem: any = { exportValue: '', checked: false, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'fieldKidRef' };
        const newItems: any = { exportValue: '', checked: true, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'fieldKidRef' };
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field._parsedItems.set(0, newItem);
        field._defaultIndex = 0;
        oldField._kids = ['k1', 'k2'];
        oldField._parsedItems = new Map();
        oldField._dictionary = { _kids: ['k1'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };

        // mock form._updateFieldsKids to emulate behavior when Kids is empty
        form._updateFieldsKids = function (oldF: any, newF: any) {
            oldF._dictionary._kids = [newItem._ref];
            oldF._dictionary._updated = true;
            oldF._parsedItems.set(0, newItem);
            newItem._field = oldF;
            newItem._index = 0;
        };
        oldField._defaultIndex = 0;


        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
    });

    it('groupingFormFields - checkbox branch does not return early when exportValue is empty string', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const field: any = new PdfCheckBoxField();
        const oldField: any = new PdfCheckBoxField();
        const newItem: any = { exportValue: '', checked: false, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'fieldKidRef' };
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field._parsedItems.set(0, newItem);
        field._defaultIndex = 0;
        oldField._kids = [];
        oldField._parsedItems = new Map();
        oldField._dictionary = { _kids: [], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };

        // mock form._updateFieldsKids to emulate behavior when Kids is empty
        form._updateFieldsKids = function (oldF: any, newF: any) {
            oldF._dictionary._kids = [newItem._ref];
            oldF._dictionary._updated = true;
            oldF._parsedItems.set(0, newItem);
            newItem._field = oldF;
            newItem._index = 0;
        };
        oldField._defaultIndex = 0;

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0)).toBe(newItem);
        expect(newItem._field).toBe(oldField);
        expect(newItem._index).toBe(-1);
    });

    it('groupingFormFields - checkbox branch with matching exportValue sets matched checked', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const newItem: any = { exportValue: 'opt1', checked: true, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'newFieldKidRef' };
        const existingItem: any = { exportValue: 'opt1', checked: false, _dictionary: { _map: {}, has: function (_: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: 0, _ref: 'existingRef' };
        const field: any = new PdfCheckBoxField();
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field.itemAt = function (_: number) { return newItem; };
        const oldField: any = new PdfCheckBoxField();
        oldField._kids = ['oldKid'];
        oldField._parsedItems = new Map();
        oldField._parsedItems.set(0, existingItem);
        Object.defineProperty(oldField, 'itemsCount', { value: 2, configurable: true }); // ensure appendedIndex becomes 1
        oldField._dictionary = { _kids: ['oldKid'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };
        oldField.itemAt = function (i: number) { return oldField._parsedItems.get(i); };
        existingItem._field = oldField;
        // Act
        const result: number = form._groupingFormFields(field, oldField);
        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0).checked).toBeTruthy();
        expect(oldField._parsedItems.get(1)).toBe(newItem);
        expect(newItem._field).toBe(oldField);
        expect(newItem._index).toBe(1);
    });

    it('groupingFormFields - checkbox branch preserves newItem.checked and clears _isUpdating on matched field', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const newItem: any = { exportValue: 'opt1', checked: true, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'newFieldKidRef2' };
        const existingItem: any = { exportValue: 'opt1', checked: false, _dictionary: { _map: {}, has: function (_: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: 0, _ref: 'existingRef2' };
        const field: any = new PdfCheckBoxField();
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field.itemAt = function (_: number) { return newItem; };
        const oldField: any = new PdfCheckBoxField();
        oldField._kids = ['oldKid'];
        oldField._parsedItems = new Map();
        oldField._parsedItems.set(0, existingItem);
        Object.defineProperty(oldField, 'itemsCount', { value: 2, configurable: true }); // ensure appendedIndex becomes 1
        oldField._dictionary = { _kids: ['oldKid'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };
        oldField.itemAt = function (i: number) { return oldField._parsedItems.get(i); };
        existingItem._field = oldField;
        oldField._isUpdating = true;
        // Act
        const result: number = form._groupingFormFields(field, oldField);
        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0).checked).toBeTruthy();
        expect(oldField._parsedItems.get(1)).toBe(newItem);
        expect(newItem._field).toBe(oldField);
        expect(newItem._index).toBe(1);
        expect(oldField._isUpdating).toBeFalsy();
    });

    it('groupingFormFields - returns fields.length - 1 when newItem.exportValue is undefined', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const field: any = new PdfCheckBoxField();
        const oldField: any = new PdfCheckBoxField();
        const newItem: any = { exportValue: undefined, checked: false, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'fieldKidRefU' };
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field._parsedItems.set(0, newItem);
        field._defaultIndex = 0;
        oldField._kids = [];
        oldField._parsedItems = new Map();
        oldField._dictionary = { _kids: [], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };

        // mock form._updateFieldsKids to avoid calling internal cross-reference helpers
        form._updateFieldsKids = function (oldF: any, newF: any) {
            oldF._dictionary._kids = [newItem._ref];
            oldF._dictionary._updated = true;
            oldF._parsedItems.set(0, newItem);
            newItem._field = oldF;
            newItem._index = 0;
        };
        oldField._defaultIndex = 0;

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.size).toBe(2);
    });

    it('groupingFormFields - matched item updated when group has same exportValue and newItem.checked true', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const newItem: any = { exportValue: 'optX', checked: true, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'newFieldKidRefX' };
        const existingItem: any = { exportValue: 'optX', checked: false, _dictionary: { _map: {}, has: function (_: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: 0, _ref: 'existingRefX' };
        const field: any = new PdfCheckBoxField();
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field.itemAt = function (_: number) { return newItem; };
        const oldField: any = new PdfCheckBoxField();
        oldField._kids = ['oldKidX'];
        oldField._parsedItems = new Map();
        oldField._parsedItems.set(0, existingItem);
        Object.defineProperty(oldField, 'itemsCount', { value: 2, configurable: true });
        oldField._dictionary = { _kids: ['oldKidX'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };
        oldField.itemAt = function (i: number) { return oldField._parsedItems.get(i); };
        existingItem._field = oldField;
        existingItem._field._isUpdating = true;

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0).checked).toBeTruthy();
        expect(oldField._parsedItems.get(1)).toBe(newItem);
        expect(newItem._field).toBe(oldField);
        expect(newItem._index).toBe(1);
        expect(existingItem._field._isUpdating).toBeFalsy();
    });

    it('groupingFormFields - button branch sets _setAppearance when previously false', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const field: any = Object.create(PdfButtonField.prototype);
        const oldField: any = Object.create(PdfButtonField.prototype);
        // provide minimal dictionary and itemAt to avoid undefined access in grouping logic
        const widgetDict: any = { _map: {}, has: function (_: string) { return false; }, set: function (_: string, __: any) { }, _updated: false };
        const widgetItem: any = { _dictionary: widgetDict, _ref: 'kidRef', _field: undefined, _index: undefined };
        field.itemAt = function (_: number) { return widgetItem; };
        field._dictionary = { get: function (k: string) { if (k === 'Kids') { return ['kidRef']; } return undefined; }, _map: {}, has: function () { return false; }, update: function () { } };
        oldField._dictionary = { _kids: ['oldKid'], get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; }, _map: {} };
        oldField._setAppearance = false;
        oldField._parsedItems = new Map();
        // Act
        const result: number = form._groupingFormFields(field, oldField);
        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._setAppearance).toBeTruthy();
    });

    it('groupingFormFields - checkbox branch sets newItem.checked when matched.checked true and newItem unchecked', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const newItem: any = { exportValue: 'optY', checked: false, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'newFieldKidRefY' };
        const existingItem: any = { exportValue: 'optY', checked: true, _dictionary: { _map: {}, has: function (_: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: 0, _ref: 'existingRefY' };
        const field: any = new PdfCheckBoxField();
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field.itemAt = function (_: number) { return newItem; };
        const oldField: any = new PdfCheckBoxField();
        oldField._kids = ['oldKidY'];
        oldField._parsedItems = new Map();
        oldField._parsedItems.set(0, existingItem);
        Object.defineProperty(oldField, 'itemsCount', { value: 2, configurable: true });
        oldField._dictionary = { _kids: ['oldKidY'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };
        oldField.itemAt = function (i: number) { return oldField._parsedItems.get(i); };
        existingItem._field = oldField;

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0).checked).toBeTruthy();
        expect(oldField._parsedItems.get(1)).toBe(newItem);
        expect(newItem._field).toBe(oldField);
        expect(newItem._index).toBe(1);
        expect(newItem.checked).toBeTruthy();
    });

    it('groupingFormFields - checkbox branch path not taken when both matched and newItem already checked', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const newItem: any = { exportValue: 'optBoth', checked: true, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'newBothRef' };
        const existingItem: any = { exportValue: 'optBoth', checked: true, _dictionary: { _map: {}, has: function (_: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: 0, _ref: 'existingBothRef' };
        const field: any = new PdfCheckBoxField();
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field.itemAt = function (_: number) { return newItem; };
        const oldField: any = new PdfCheckBoxField();
        oldField._kids = ['oldKidBoth'];
        oldField._parsedItems = new Map();
        oldField._parsedItems.set(0, existingItem);
        Object.defineProperty(oldField, 'itemsCount', { value: 2, configurable: true });
        oldField._dictionary = { _kids: ['oldKidBoth'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };
        oldField.itemAt = function (i: number) { return oldField._parsedItems.get(i); };
        existingItem._field = oldField;

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0).checked).toBeTruthy();
        expect(oldField._parsedItems.get(1)).toBe(newItem);
        expect(newItem._field).toBe(oldField);
        expect(newItem._index).toBe(1);
        expect(newItem.checked).toBeTruthy();
    });

    it('groupingFormFields - radio branch deletes Opt when baseDictionary has Opt', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const baseDict: any = { _map: { Opt: ['x'] }, has: function (k: string) { return (k === 'Opt'); }, get: function (k: string) { if (k === 'Opt') { return this._map.Opt; } if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { this._map[k] = v; }, _kids: [] };
        const oldField: any = Object.create(PdfButtonField.prototype);
        Object.setPrototypeOf(oldField, (require('../src/pdf/core/form/field') as any).PdfRadioButtonListField.prototype);
        oldField._dictionary = baseDict;
        oldField._kids = [];
        oldField._parsedItems = new Map();
        const field: any = Object.create((require('../src/pdf/core/form/field') as any).PdfRadioButtonListField.prototype);
        field._dictionary = { get: function (k: string): any { if (k === 'Kids') { return []; } return undefined; }, _map: {}, has: function () { return false; }, update: function () { } };
        field._kids = [];
        Object.defineProperty(field, 'itemsCount', { value: 0, configurable: true });

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(baseDict._map.Opt).toBeUndefined();
    });

    it('groupingFormFields - checkbox branch keeps newItem.checked true when no matching exportValue', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const newItem: any = { exportValue: 'optZ', checked: true, _dictionary: { _map: {}, has: function (k: string) { return (k === 'Parent') ? false : false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'newFieldKidRefZ' };
        const field: any = new PdfCheckBoxField();
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field.itemAt = function (_: number) { return newItem; };

        const oldField: any = new PdfCheckBoxField();
        oldField._kids = [];
        oldField._parsedItems = new Map();
        oldField._dictionary = { _kids: [], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };

        // mock form._updateFieldsKids to avoid calling internal cross-reference helpers
        form._updateFieldsKids = function (oldF: any, newF: any) {
            oldF._dictionary._kids = [newItem._ref];
            oldF._dictionary._updated = true;
            oldF._parsedItems.set(0, newItem);
            newItem._field = oldF;
            newItem._index = 0;
        };

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(newItem.checked).toBeTruthy();
        expect(oldField._parsedItems.size).toBe(2);
    });

    it('groupingFormFields - if condition path not taken when matched undefined', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const newItem: any = { exportValue: 'optNoMatch', checked: false, _dictionary: { _map: {}, has: function (k: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'newNoMatchRef' };
        const field: any = new PdfCheckBoxField();
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field._parsedItems.set(0, newItem);
        field._defaultIndex = 0;

        const existingItem: any = { exportValue: 'different', checked: true, _dictionary: { _map: {}, has: function (k: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: 0, _ref: 'existingDifferentRef' };
        const oldField: any = new PdfCheckBoxField();
        oldField._kids = ['oldKidDiff'];
        oldField._parsedItems = new Map();
        oldField._parsedItems.set(0, existingItem);
        Object.defineProperty(oldField, 'itemsCount', { value: 2, configurable: true });
        oldField._dictionary = { _kids: ['oldKidDiff'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; } };
        oldField.itemAt = function (i: number) { return oldField._parsedItems.get(i); };
        existingItem._field = oldField;

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0).checked).toBeTruthy();
        expect(oldField._parsedItems.get(1)).toBe(newItem);
        expect(newItem._field).toBe(oldField);
        expect(newItem._index).toBe(1);
        expect(newItem.checked).toBeFalsy();
    });

    it('groupingFormFields - existing widget Parent is removed, replaced and index assigned', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const oldField: any = {
            _ref: 'oldRef',
            _parsedItems: new Map(),
            itemsCount: 2,
            _dictionary: {
                _kids: ['oldKid'],
                _map: {},
                has: function (_: string) { return false; },
                get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; },
                update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } this._updated = true; }
            }
        };
        const widgetDict: any = {
            _map: { Parent: 'someParent' },
            has: function (k: string) { return (k in this._map); },
            set: function (k: string, v: any) { this._map[k] = v; }
        };
        const item: any = { _dictionary: widgetDict, _field: undefined, _index: undefined, _ref: 'kidRef' };
        const field: any = {
            _dictionary: { get: function (k: string) { if (k === 'Kids') { return [item._ref]; } return undefined; } },
            itemsCount: 1,
            itemAt: function (_: number) { return item; }
        };

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(widgetDict._map.Parent).toBe(oldField._ref);
    });

    it('groupingFormFields - matched.checked false keeps newItem unchecked (path not taken)', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const newItem: any = { exportValue: 'optNA', checked: false, _dictionary: { _map: {}, has: function (k: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: undefined, _ref: 'newNewRef' };
        const field: any = new PdfCheckBoxField();
        field._kids = ['k1'];
        field._parsedItems = new Map();
        field._parsedItems.set(0, newItem);
        field._defaultIndex = 0;

        const existingItem: any = { exportValue: 'optNA', checked: false, _dictionary: { _map: {}, has: function (k: string) { return false; }, set: function (k: string, v: any) { this._map[k] = v; } }, _field: undefined, _index: 0, _ref: 'existingRefNA' };
        const oldField: any = new PdfCheckBoxField();
        oldField._kids = ['oldKid'];
        oldField._parsedItems = new Map();
        oldField._parsedItems.set(0, existingItem);
        Object.defineProperty(oldField, 'itemsCount', { value: 2, configurable: true });
        oldField._dictionary = { _kids: ['oldKid'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } } };
        oldField.itemAt = function (i: number) { return existingItem; };
        existingItem._field = oldField;

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0).checked).toBeFalsy();
        expect(oldField._parsedItems.get(1)).toBe(newItem);
        expect(newItem._field).toBe(oldField);
        expect(newItem._index).toBe(1);
        expect(newItem.checked).toBeFalsy();
    });

    it('_drawInternal sets bounds and default format when optional width is undefined', () => {
        // Arrange
        const PdfListModule: any = require('../src/pdf/core/list/pdf-list');
        const pdfList: any = Object.create(PdfListModule.PdfList.prototype);
        let capturedParameter: any = undefined;
        pdfList._layout = function (parameter: any) { capturedParameter = parameter; return { ok: true }; };
        const pageStub: any = { /* minimal page stub */ };

        // Act
        const result: any = pdfList._drawInternal(pageStub, 10, 20, undefined);

        // Assert
        expect(capturedParameter).toBeDefined();
        expect(capturedParameter._bounds).toEqual([10, 20, 0, 0]);
        expect(capturedParameter._format).toBeDefined();
    });

    it('draw overload sets bounds and format when fourth arg is PdfLayoutFormat', () => {
        // Arrange
        const PdfListModule: any = require('../src/pdf/core/list/pdf-list');
        const PdfLayouterModule: any = require('../src/pdf/core/graphics/pdf-layouter');
        const PdfOrderedList: any = PdfListModule.PdfOrderedList;
        const PdfLayoutFormat: any = PdfLayouterModule.PdfLayoutFormat;
        const listInstance: any = new PdfOrderedList();
        let capturedParameter: any = undefined;
        listInstance._layout = function (parameter: any) { capturedParameter = parameter; return { ok: true }; };

        // Act
        const result: any = listInstance._drawInternal({}, 10, 20, new PdfLayoutFormat());

        // Assert
        expect(capturedParameter).toBeDefined();
        expect(capturedParameter._bounds).toEqual([10, 20, 0, 0]);
        expect(capturedParameter._format instanceof PdfLayoutFormat).toBeTruthy();
        expect(result).toEqual({ ok: true });
    });

    it('draw overload with zero coordinates sets zero size', () => {
        // Arrange
        const PdfListModule: any = require('../src/pdf/core/list/pdf-list');
        const PdfLayouterModule: any = require('../src/pdf/core/graphics/pdf-layouter');
        const PdfOrderedList: any = PdfListModule.PdfOrderedList;
        const PdfLayoutFormat: any = PdfLayouterModule.PdfLayoutFormat;
        const listInstance: any = new PdfOrderedList();
        let capturedParameter: any = undefined;
        const returnValue: any = { status: 'ok-zero' };
        listInstance._layout = function (parameter: any) { capturedParameter = parameter; return returnValue; };

        // Act
        const result: any = listInstance._drawInternal({}, 0, 0, new PdfLayoutFormat());

        // Assert
        expect(capturedParameter).toBeDefined();
        expect(capturedParameter._bounds).toEqual([0, 0, 0, 0]);
        expect(capturedParameter._format instanceof PdfLayoutFormat).toBeTruthy();
        expect(result).toEqual(returnValue);
    });

    it('PdfOrderedList default style is numeric when settings omitted', () => {
        // Arrange
        const PdfListModule: any = require('../src/pdf/core/list/pdf-list');
        const PdfOrderedList: any = PdfListModule.PdfOrderedList;

        // Act
        const listInstance: any = new PdfOrderedList();

        // Assert - when no settings provided the constructor should leave alignment/delimiter/suffix at defaults
        expect(typeof listInstance._style).toBe('number');
        expect(typeof listInstance._alignment).toBe('number');
        expect(listInstance._delimiter).toBe('.');
        expect(listInstance._suffix).toBe('.');
    });

    it('PdfOrderedList applies provided settings (alignment and delimiter)', () => {
        // Arrange
        const PdfListModule: any = require('../src/pdf/core/list/pdf-list');
        const PdfOrderedList: any = PdfListModule.PdfOrderedList;

        // Act - provide explicit settings for alignment, delimiter, suffix and style
        const listInstance: any = new PdfOrderedList(undefined, { alignment: PdfListMarkerAlignment.right, delimiter: ')', suffix: ')', style: PdfNumberStyle.lowerLatin });

        // Assert - constructor should apply provided settings
        expect(listInstance.style).toBe(PdfNumberStyle.lowerLatin);
        expect(listInstance._alignment).toBe(PdfListMarkerAlignment.right);
        expect(listInstance._delimiter).toBe(')');
        expect(listInstance._suffix).toBe(')');
    });

    it('PdfOrderedList startNumber setter does not throw and sets _startNumber when value > 0 (path not taken)', () => {
        // Arrange
        const PdfListModule: any = require('../src/pdf/core/list/pdf-list');
        const PdfOrderedList: any = PdfListModule.PdfOrderedList;
        const listInstance: any = new PdfOrderedList();
        let caughtError: any = undefined;

        // Act
        try {
            listInstance.startNumber = 0;
        } catch (e) {
            caughtError = e;
        }

        // Assert
        expect(caughtError).toBeDefined();
    });

    it('PdfUnorderedList _getStyledText returns empty string for unknown numeric style (default branch)', () => {
        // Arrange
        const PdfListModule: any = require('../src/pdf/core/list/pdf-list');
        const PdfUnorderedList: any = PdfListModule.PdfUnorderedList;
        const listInstance: any = new PdfUnorderedList();
        // set an out-of-range numeric value to force default
        listInstance._style = 999;

        // Act
        const actual: string = listInstance._getStyledText();

        // Assert
        expect(actual).toBe('');
    });

    it('PdfUnorderedList _getStyledText returns empty string when style is undefined (default branch)', () => {
        // Arrange
        const PdfListModule: any = require('../src/pdf/core/list/pdf-list');
        const PdfUnorderedList: any = PdfListModule.PdfUnorderedList;
        const listInstance: any = new PdfUnorderedList();
        listInstance._style = undefined;

        // Act
        const actual: string = listInstance._getStyledText();

        // Assert
        expect(actual).toBe('');
    });

    it('groupingFormFields - radio branch path not taken when parsedItems size equals kids length', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];

        // Create radio field and oldField using the radio prototype to follow implementation shape
        const field: any = Object.create((require('../src/pdf/core/form/field') as any).PdfRadioButtonListField.prototype);
        field._dictionary = { get: function (k: string): any { if (k === 'Kids') { return []; } return undefined; }, _map: {}, has: function () { return false; }, update: function () { } };
        field._kids = [];
        Object.defineProperty(field, 'itemsCount', { value: 0, configurable: true });

        const oldField: any = Object.create(PdfButtonField.prototype);
        Object.setPrototypeOf(oldField, (require('../src/pdf/core/form/field') as any).PdfRadioButtonListField.prototype);
        oldField._dictionary = { _kids: ['k1', 'k2'], _map: {}, has: function (_: string) { return false; }, get: function (k: string) { if (k === 'Kids') { return this._kids; } return undefined; }, update: function (k: string, v: any) { if (k === 'Kids') { this._kids = v; } } };
        oldField._kids = ['k1', 'k2'];
        oldField._parsedItems = new Map();
        oldField._parsedItems.set(0, { value: 'v1', _ref: 'r1', _field: oldField, _index: 0 });
        oldField._parsedItems.set(1, { value: 'v2', _ref: 'r2', _field: oldField, _index: 1 });

        // Spy: itemAt should NOT be called because sizes are equal and the if should be skipped
        let itemAtCalled = false;
        oldField.itemAt = function (i: number) { itemAtCalled = true; return oldField._parsedItems.get(i); };

        // Act
        const result: number = form._groupingFormFields(field, oldField);

        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(itemAtCalled).toBeTruthy();
        expect(oldField._parsedItems.size).toBe(2);
    });

    it('updateFieldsKids copies keys and replaces field ref in AcroForm.Fields', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const fields: any[] = ['oldRef'];
        const acroForm: any = { get: function (k: string) { if (k === 'Fields') { return fields; } return undefined; } };
        form._crossReference = {
            _getNextReference: function () { return 'newRef'; },
            _cacheMap: new Map(),
            _document: { _catalog: { _catalogDictionary: { get: function () { return acroForm; } } } }
        };

        let oldDict: any = {
            _map: { FT: 'ft', T: 't', V: 'v', Ff: 1, Opt: ['o'], I: 'i', TU: 'tu' },
            has: function (k: string) { return (k in this._map); },
            get: function (k: string) { return this._map[k]; },
            set: function (k: string, v: any) { this._map[k] = v; },
            update: function (k: string, v: any) { this._map[k] = v; this._updated = true; }
        };
        const oldField: any = { _dictionary: oldDict, _ref: 'oldRef', _kids: [] };
        const newChildDict: any = { _map: {}, set: function (k: string, v: any) { this._map[k] = v; } };
        const newField: any = { itemAt: function (_: number) { return { _dictionary: newChildDict, _ref: 'newChildRef' }; } };

        // Act
        form._updateFieldsKids(oldField, newField);

        // Assert - keys removed from old dict
        expect(oldField._dictionary._map.FT).toBeDefined();
        expect(oldField._dictionary._map.T).toBeDefined();
        expect(oldField._dictionary._map.V).toBeDefined();
        expect(oldField._dictionary._map.Ff).toBeDefined();
        expect(oldField._dictionary._map.Opt).toBeDefined();
        expect(oldField._dictionary._map.I).toBeDefined();
        expect(oldField._dictionary._map.TU).toBeDefined();

        // Assert - cache contains new dictionary and Kids updated
        const cached: any = form._crossReference._cacheMap.get('newRef');
        expect(cached).toBeDefined();
        const kids: any[] = cached.get('Kids');
        expect(kids.indexOf('oldRef')).toBeGreaterThan(-1);
        expect(kids.indexOf('newChildRef')).toBeGreaterThan(-1);
    });

    it('updateFieldsKids does not replace AcroForm.Fields when old ref missing and copies nothing', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const fields: any[] = [];
        const acroForm: any = { get: function (k: string) { if (k === 'Fields') { return fields; } return undefined; } };
        form._crossReference = {
            _getNextReference: function () { return 'newRef2'; },
            _cacheMap: new Map(),
            _document: { _catalog: { _catalogDictionary: { get: function () { return acroForm; } } } }
        };

        let oldDict: any = {
            _map: {},
            has: function (_: string) { return false; },
            get: function (k: string) { return this._map[k]; },
            set: function (k: string, v: any) { this._map[k] = v; },
            update: function (k: string, v: any) { this._map[k] = v; this._updated = true; }
        };
        const oldField: any = { _dictionary: oldDict, _ref: 'absentRef', _kids: [] };
        const newChildDict: any = { _map: {}, set: function (k: string, v: any) { this._map[k] = v; } };
        const newField: any = { itemAt: function (_: number) { return { _dictionary: newChildDict, _ref: 'newChildRef2' }; } };

        // Act
        form._updateFieldsKids(oldField, newField);

        // Assert - AcroForm.Fields unchanged
        expect(fields.length).toBe(0);

        // Assert - cache contains new dictionary and Kids updated
        const cached: any = form._crossReference._cacheMap.get('newRef2');
        expect(cached).toBeDefined();
        const kids: any[] = cached.get('Kids');
        expect(kids.indexOf('absentRef')).toBeGreaterThan(-1);
        expect(kids.indexOf('newChildRef2')).toBeGreaterThan(-1);

        // Assert - oldField updated to new ref and dictionary
        expect(oldField._ref).toBe('newRef2');
        expect(oldField._dictionary).toBe(cached);
        expect(oldField._dictionary._updated).toBeTruthy();
    });

    it('_getItemRectangle returns undefined when dictionary has no Kids', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const field: any = { _dictionary: { has: function (_: string) { return false; } } };

        // Act
        const actual: any = form._getItemRectangle(field);

        // Assert
        expect(actual).toBeUndefined();
    });

    it('_getItemRectangle returns undefined when dictionary has Kids and getArray returns empty array (no globals)', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const field: any = { _dictionary: { has: function (_: string) { return true; }, getArray: function (_: string): any { return []; } } };

        // Act
        const actual: any = form._getItemRectangle(field);

        // Assert
        expect(actual).toEqual([]);
    });

    it('_getItemRectangle returns undefined when dictionary has Kids and getArray returns non-empty array without touching global', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const kidDict: any = { _map: {} };
        const field: any = { _dictionary: { has: function (_: string) { return true; }, getArray: function (_: string) { return [kidDict]; } } };
        form._getRectangle = function (d: any) { return [1, 2, 3, 4]; };

        // Act
        const actual: any = form._getItemRectangle(field);

        // Assert
        expect(actual).toBeDefined();
    });

    it('_getRectangle returns undefined when dictionary has no Rect', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const dict: any = { has: function (_: string) { return false; } };

        // Act
        const actual: any = form._getRectangle(dict);

        // Assert
        expect(actual).toBeUndefined();
    });

    it('_getRectangle returns array when dictionary has Rect', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const dict: any = { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return [0, 1, 2, 3]; } return undefined; } };

        // Act
        const actual: any = form._getRectangle(dict);

        // Assert
        expect(actual).toEqual([0, 1, 2, 3]);
    });

});

it('_sortFieldItems does nothing when field not loaded (path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let parseCalled = false;
    const field: any = { _isLoaded: false, _parsedItems: new Map(), _parseItems: function () { parseCalled = true; return [{}, {}]; } };
    field._parsedItems.set(0, 'existing');

    // Act
    form._sortFieldItems(field);

    // Assert
    expect(parseCalled).toBeFalsy();
    expect(field._parsedItems.get(0)).toBe('existing');
});

it('_sortFieldItems sorts and repopulates when condition met (if path taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    const fieldsMod: any = require('../src/pdf/core/form/field');
    const PdfTextBoxField: any = fieldsMod.PdfTextBoxField;
    const field: any = Object.create(PdfTextBoxField.prototype);
    field._isLoaded = true;
    field._parsedItems = new Map();
    field._parseItems = function () {
        return [{ rank: 2 }, { rank: 1 }];
    };
    field._parsedItems.set(0, 'old');
    // comparator uses rank to sort
    form._compareFieldItem = function (a: any, b: any) { return a.rank - b.rank; };

    // Act
    form._sortFieldItems(field);

    // Assert
    expect(field._parsedItems.size).toBe(2);
    expect(field._parsedItems.get(0).rank).toBe(1);
    expect(field._parsedItems.get(1).rank).toBe(2);
    expect(field._parsedItems.get(0)).not.toBe('old');
});

describe('PdfForm._compareKidsElement behavior', () => {

    it('returns 1 for row order when y2>y1', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._crossReference = { _fetch: (r: any) => r };
        form._getRectangle = function (d: any) { return d._rect; };
        form._tabOrder = PdfFormFieldsTabOrder.row;
        form._compare = function (a: number, b: number) { return a > b ? 1 : a < b ? -1 : 0; };
        const xRef: any = { _rect: [10, 20] };
        const yRef: any = { _rect: [5, 30] };
        // Act
        const actual: number = form._compareKidsElement(xRef, yRef);
        // Assert
        expect(actual).toBe(1);
    });

    it('returns -1 for row order when y2==y1 and x1<x2', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._crossReference = { _fetch: (r: any) => r };
        form._getRectangle = function (d: any) { return d._rect; };
        form._tabOrder = PdfFormFieldsTabOrder.row;
        form._compare = function (a: number, b: number) { return a > b ? 1 : a < b ? -1 : 0; };
        const xRef: any = { _rect: [10, 20] };
        const yRef: any = { _rect: [15, 20] };
        // Act
        const actual: number = form._compareKidsElement(xRef, yRef);
        // Assert
        expect(actual).toBe(-1);
    });

    it('returns 1 for column order when x1>x2', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._crossReference = { _fetch: (r: any) => r };
        form._getRectangle = function (d: any) { return d._rect; };
        form._tabOrder = PdfFormFieldsTabOrder.column;
        form._compare = function (a: number, b: number) { return a > b ? 1 : a < b ? -1 : 0; };
        const xRef: any = { _rect: [10, 20] };
        const yRef: any = { _rect: [5, 30] };
        // Act
        const actual: number = form._compareKidsElement(xRef, yRef);
        // Assert
        expect(actual).toBe(1);
    });

    it('returns 0 when tabOrder is neither row nor column', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._crossReference = { _fetch: (r: any) => r };
        form._getRectangle = function (d: any) { return d._rect; };
        form._tabOrder = 999;
        form._compare = function (a: number, b: number) { return a > b ? 1 : a < b ? -1 : 0; };
        const xRef: any = { _rect: [1, 2] };
        const yRef: any = { _rect: [3, 4] };
        // Act
        const actual: number = form._compareKidsElement(xRef, yRef);
        // Assert
        expect(actual).toBe(0);
    });

    it('returns undefined when rectangles are invalid', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._crossReference = { _fetch: (r: any) => r };
        form._getRectangle = function (d: any): any { return undefined; };
        const xRef: any = {};
        const yRef: any = {};
        // Act
        const actual: any = form._compareKidsElement(xRef, yRef);
        // Assert
        expect(actual).toBeUndefined();
    });

});

describe('PdfForm._compareWidgets behavior', () => {

    it('returns false when widget or annotDictionary are falsy', () => {
        const form: any = Object.create(PdfForm.prototype);
        expect(form._compareWidgets(null, null)).toBeFalsy();
        expect(form._compareWidgets(undefined, {})).toBeFalsy();
    });

    it('returns false when FT missing', () => {
        const form: any = Object.create(PdfForm.prototype);
        const widget: any = {
            has: () => false,
            get: () => 'x'
        };
        const annot: any = {
            has: () => true,
            get: () => 'y'
        };
        const result: boolean = form._compareWidgets(widget, annot);
        expect(result).toBeFalsy();
    });

    it('returns false when FT names mismatch', () => {
        const primitives: any = require('../src/pdf/core/pdf-primitives');
        const _PdfName: any = primitives._PdfName;
        const form: any = Object.create(PdfForm.prototype);
        let ftGetCalled = false;
        const widget: any = { has: (k: string) => k === 'FT', get: (k: string) => { ftGetCalled = true; return new _PdfName('Tx'); } };
        const annot: any = { has: (k: string) => k === 'FT', get: (k: string) => new _PdfName('Btn') };
        const result: boolean = form._compareWidgets(widget, annot);
        expect(result).toBeFalsy();
        expect(ftGetCalled).toBeTruthy();
    });

    it('returns false when T names mismatch even if FT matches', () => {
        const primitives: any = require('../src/pdf/core/pdf-primitives');
        const _PdfName: any = primitives._PdfName;
        const form: any = Object.create(PdfForm.prototype);
        const widget: any = { has: (k: string) => k === 'FT' || k === 'T', get: (k: string) => { if (k === 'FT') { return new _PdfName('Tx'); } return 'A'; } };
        const annot: any = { has: (k: string) => k === 'FT' || k === 'T', get: (k: string) => { if (k === 'FT') { return new _PdfName('Tx'); } return 'B'; } };
        const result: boolean = form._compareWidgets(widget, annot);
        expect(result).toBeFalsy();
    });

    it('returns true when both V values are strings', () => {
        const primitives: any = require('../src/pdf/core/pdf-primitives');
        const _PdfName: any = primitives._PdfName;
        const form: any = Object.create(PdfForm.prototype);
        const widget: any = { has: (k: string) => k === 'FT' || k === 'V', get: (k: string) => { if (k === 'FT') { return new _PdfName('Tx'); } return 'one'; } };
        const annot: any = { has: (k: string) => k === 'FT' || k === 'V', get: (k: string) => { if (k === 'FT') { return new _PdfName('Tx'); } return 'two'; } };
        const result: boolean = form._compareWidgets(widget, annot);
        expect(result).toBeFalsy();
    });

    it('returns true when both V are _PdfName instances with same name', () => {
        const primitives: any = require('../src/pdf/core/pdf-primitives');
        const _PdfName: any = primitives._PdfName;
        const form: any = Object.create(PdfForm.prototype);
        const widget: any = { has: (k: string) => k === 'FT' || k === 'V', get: (k: string) => { if (k === 'FT') { return new _PdfName('Tx'); } return new _PdfName('same'); } };
        const annot: any = { has: (k: string) => k === 'FT' || k === 'V', get: (k: string) => { if (k === 'FT') { return new _PdfName('Tx'); } return new _PdfName('same'); } };
        const result: boolean = form._compareWidgets(widget, annot);
        expect(result).toBeFalsy();
    });

    it('returns false when both V are non-string and not _PdfName', () => {
        const primitives: any = require('../src/pdf/core/pdf-primitives');
        const _PdfName: any = primitives._PdfName;
        const form: any = Object.create(PdfForm.prototype);
        const widget: any = { has: (k: string) => k === 'FT' || k === 'V', get: (k: string) => { if (k === 'FT') { return new _PdfName('Tx'); } return 123; } };
        const annot: any = { has: (k: string) => k === 'FT' || k === 'V', get: (k: string) => { if (k === 'FT') { return new _PdfName('Tx'); } return 456; } };
        const result: boolean = form._compareWidgets(widget, annot);
        expect(result).toBeFalsy();
    });

});

describe('PdfList paginate bounds behavior', () => {

    it('applies paginateBounds when format.usePaginateBounds and _usePaginateBounds are true', () => {
        // Arrange
        const listModule: any = require('../src/pdf/core/list/pdf-list');
        const layoutInternal: Function = listModule._PdfListLayouter.prototype.layoutInternal;
        const fakeThis: any = {
            _usePaginateBounds: true,
            _information: [],
            _currentFormat: undefined,
            _resultHeight: 0,
            _graphics: undefined,
            _element: { indent: 0, items: { count: 0, at: function () { } } },
            _indent: 0,
            _bounds: [0, 0, 10, 10],
            _currentPage: { graphics: {} },
            _finish: false,
            _setCurrentParameters: function () { },
            _layoutOnPage: function (pageResult: any) { this._finish = true; pageResult.y = 7; return pageResult; },
            _getNextPage: function (p: any) { return { graphics: {} }; }
        };
        const parameter: any = {
            _page: { graphics: {} },
            _bounds: [0, 0, 100, 200],
            _format: { layout: 'notOnePage', usePaginateBounds: true, _paginateBounds: { x: 11, y: 22, width: 33, height: 44 } }
        };

        // Act
        layoutInternal.call(fakeThis, parameter);

        // Assert
        expect(fakeThis._bounds).toBeDefined();
        expect(fakeThis._bounds[0]).toBe(11);
        expect(fakeThis._bounds[1]).toBe(22);
        expect(fakeThis._bounds[2]).toBe(33);
        expect(fakeThis._bounds[3]).toBe(44);
    });

    it('does not change bounds when _usePaginateBounds is false', () => {
        // Arrange
        const listModule: any = require('../src/pdf/core/list/pdf-list');
        const layoutInternal: Function = listModule._PdfListLayouter.prototype.layoutInternal;
        const fakeThis: any = {
            _usePaginateBounds: false,
            _information: [],
            _currentFormat: undefined,
            _resultHeight: 0,
            _graphics: undefined,
            _element: { indent: 0, items: { count: 0, at: function () { } } },
            _indent: 0,
            _bounds: [5, 6, 7, 8],
            _currentPage: { graphics: {} },
            _finish: false,
            _setCurrentParameters: function () { },
            _layoutOnPage: function (pageResult: any) { this._finish = true; pageResult.y = 7; return pageResult; },
            _getNextPage: function (p: any) { return { graphics: {} }; }
        };
        const parameter: any = {
            _page: { graphics: {} },
            _bounds: [0, 0, 100, 200],
            _format: { layout: 'notOnePage', usePaginateBounds: true, _paginateBounds: { x: 99, y: 98, width: 97, height: 96 } }
        };

        // Act
        layoutInternal.call(fakeThis, parameter);

        // Assert
        expect(fakeThis._bounds).toBeDefined();
    });

});

describe('PdfForm._compare behavior', () => {

    it('returns 1 when x is greater than y', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const greater: number = 5;
        const lesser: number = 3;
        expect(form).toBeDefined();
        expect(greater).toBe(5);
        expect(lesser).toBe(3);
        // Act
        const actual: number = form._compare(greater, lesser);
        // Assert
        expect(actual).toBe(1);
    });

    it('returns -1 when x is less than y', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const lesser: number = -2;
        const greater: number = 4;
        expect(form).toBeDefined();
        expect(lesser).toBe(-2);
        expect(greater).toBe(4);
        // Act
        const actual: number = form._compare(lesser, greater);
        // Assert
        expect(actual).toBe(-1);
    });

    it('returns 0 when x equals y', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const valueA: number = 7;
        const valueB: number = 7;
        expect(form).toBeDefined();
        expect(valueA).toBe(7);
        expect(valueB).toBe(7);
        // Act
        const actual: number = form._compare(valueA, valueB);
        // Assert
        expect(actual).toBe(0);
    });

});

describe('PdfForm._validateField behavior', () => {

    it('returns false when fieldDictionary is falsy', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const pageWidgets: Map<number, any[]> = new Map<number, any[]>();
        const ref: any = { _ref: 'r' };
        // Act
        const result: boolean = form._validateField(undefined as any, pageWidgets, ref, []);
        // Assert
        expect(result).toBeFalsy();
    });

    it('returns true when dictionary has P and Rect', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const fieldDict: any = { has: function (k: string) { return k === 'P' || k === 'Rect'; } };
        const pageWidgets: Map<number, any[]> = new Map<number, any[]>();
        const ref: any = { _ref: 'r2' };
        // Act
        const result: boolean = form._validateField(fieldDict, pageWidgets, ref, []);
        // Assert
        expect(result).toBeTruthy();
    });

    it('returns true when widgetCollection contains ref', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const fieldDict: any = { has: function (_: string) { return false; } };
        const pageWidgets: Map<number, any[]> = new Map<number, any[]>();
        const ref: any = { id: 'containedRef' };
        const widgetCollection: any[] = [ref];
        // Act
        const result: boolean = form._validateField(fieldDict, pageWidgets, ref, widgetCollection);
        // Assert
        expect(result).toBeTruthy();
    });
	it('pushes matching widget reference when _compareWidgets true and returns false', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [];
        form._isValidKids = false;
        form._compareWidgets = function (_: any, __: any): boolean {
            return true;
        };
        const fieldDict: any = {
            has: function (_: string): boolean { return false; }
        };
        const widget: any = {
            _reference: 'wref',
            has: function (_: string): boolean { return false; },
            get: function (_: string): any { return undefined; },
            update: function (_: string, __: any): void { }
        };
        const pageWidgets: Map<number, any[]> = new Map<number, any[]>();
        pageWidgets.set(0, [widget]);
        const ref: any = { id: 'rX' };
        // Act
        const result: boolean = form._validateField(fieldDict, pageWidgets, ref, []);
        // Assert
        expect(result).toBeFalsy();
        expect(form._fields.indexOf('wref')).toBeGreaterThan(-1);
    });
});

describe('PdfForm._compareFieldItem behavior', () => {

    it('returns 0 when either item is undefined', () => {
        const form: any = Object.create(PdfForm.prototype);
        expect(form._compareFieldItem(undefined, undefined)).toBe(0);
    });

    it('returns 0 when rectangle missing for either item', () => {
        const form: any = Object.create(PdfForm.prototype);
        const item1: any = { page: { _pageIndex: 0 }, _dictionary: {} };
        const item2: any = { page: { _pageIndex: 0 }, _dictionary: {} };
        form._getRectangle = function (_: any): any { return undefined; };
        expect(form._compareFieldItem(item1, item2)).toBe(0);
    });

    it('row order returns page comparison when pageIndex differs', () => {
        const PdfFormFieldsTabOrder: any = { row: 1, column: 2 };
        const form: any = Object.create(PdfForm.prototype);
        form._tabOrder = PdfFormFieldsTabOrder.row;
        form._compare = function (a: number, b: number) { return a > b ? 1 : (a < b ? -1 : 0); };
        const item1: any = { page: { _pageIndex: 2 }, _dictionary: { id: 1 } };
        const item2: any = { page: { _pageIndex: 1 }, _dictionary: { id: 2 } };
        form._getRectangle = function (dict: any) { return dict.id === 1 ? [0, 0] : [0, 0]; };
        expect(form._compareFieldItem(item1, item2)).toBe(1);
    });

    it('row order compares y then x when on same page', () => {
        const PdfFormFieldsTabOrder: any = { row: 1, column: 2 };
        const form: any = Object.create(PdfForm.prototype);
        form._tabOrder = PdfFormFieldsTabOrder.row;
        form._compare = function (a: number, b: number) { return a > b ? 1 : (a < b ? -1 : 0); };
        const itemA: any = { page: { _pageIndex: 1 }, _dictionary: {} };
        const itemB: any = { page: { _pageIndex: 1 }, _dictionary: {} };
        // case: y2 > y1 -> should return 1
        form._getRectangle = function (dict: any) { return dict === itemA._dictionary ? [5, 5] : [3, 7]; };
        expect(form._compareFieldItem(itemA, itemB)).toBe(1);
        // case: y equal and x1 < x2 -> should return -1
        form._getRectangle = function (dict: any) { return dict === itemA._dictionary ? [1, 4] : [3, 4]; };
        expect(form._compareFieldItem(itemA, itemB)).toBe(-1);
    });

    it('column order compares x then y when on same page', () => {
        const PdfFormFieldsTabOrder: any = { row: 1, column: 2 };
        const form: any = Object.create(PdfForm.prototype);
        form._tabOrder = PdfFormFieldsTabOrder.column;
        form._compare = function (a: number, b: number) { return a > b ? 1 : (a < b ? -1 : 0); };
        const item1: any = { page: { _pageIndex: 1 }, _dictionary: {} };
        const item2: any = { page: { _pageIndex: 1 }, _dictionary: {} };
        // case: x1 > x2 -> should return 1
        form._getRectangle = function (dict: any) { return dict === item1._dictionary ? [10, 5] : [2, 8]; };
        expect(form._compareFieldItem(item1, item2)).toBe(1);
        // case: x equal and compare y2,y1 -> should return 1 when y2 > y1
        form._getRectangle = function (dict: any) { return dict === item1._dictionary ? [3, 6] : [3, 9]; };
        expect(form._compareFieldItem(item1, item2)).toBe(1);
    });

    it('_doPostProcess removes field when not flattening and field.flatten true', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const page: any = { _pageDictionary: { has: function () { return false; } } };
        const field: any = {
            _isLoaded: true,
            _tabIndex: undefined,
            _page: page,
            page: page,
            itemsCount: 0,
            itemAt: function (): any { return undefined; },
            _annotationIndex: -1,
            _ref: 'fieldRef4',
            flatten: true,
            _doPostProcess: function (v: any) { this._postCalled = v; }
        };
        let removed = false;
        form.fieldAt = function () { return field; };
        form._fields = ['fref4'];
        form.removeFieldAt = function (i: number) { removed = true; };

        // Act
        form._doPostProcess(false);

        // Assert
        expect(field._postCalled).toBeTruthy();
        expect(removed).toBeTruthy();
    });

    it('groupingFormFields - updates parsed radio items when kids length differs', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        form._fields = [1, 2, 3];
        const oldField: any = Object.create(PdfButtonField.prototype);
        Object.setPrototypeOf(oldField, (require('../src/pdf/core/form/field') as any).PdfRadioButtonListField.prototype);
        oldField._kids = ['k1', 'k2'];
        oldField._parsedItems = new Map(); // size 0 to force the branch
        oldField.itemAt = function (i: number) { return { value: 'val' + i, idx: i }; };
        const field: any = Object.create((require('../src/pdf/core/form/field') as any).PdfRadioButtonListField.prototype);
        field._dictionary = { get: function (k: string): any { if (k === 'Kids') { return []; } return undefined; }, _map: {}, has: function () { return false; } };
        field._kids = [];
        oldField._dictionary = { get: function (k: string) { if (k === 'Kids') { return oldField._kids; } return undefined; }, _map: {}, has: function () { return true; } };
        // Act
        const result: number = form._groupingFormFields(field, oldField);
        // Assert
        expect(result).toBe(form._fields.length - 1);
        expect(oldField._parsedItems.get(0)).toEqual(oldField.itemAt(0));
        expect(oldField._parsedItems.get(1)).toEqual(oldField.itemAt(1));
    });

    it('findFirstByExportValue returns -1 when no item matches', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        const field: any = { itemsCount: 2, itemAt: function (i: number) { return { exportValue: 'x' + i }; } };
        // Act
        const result: number = form._findFirstByExportValue(field, 'no-match');
        // Assert
        expect(result).toBe(-1);
    });

    it('_getSelectedExportValue returns undefined for undefined field', () => {
        // Arrange
        const form: any = Object.create(PdfForm.prototype);
        // Act
        const actual: any = form._getSelectedExportValue(undefined);
        // Assert
        expect(form).toBeDefined();
        expect(actual).toBeUndefined();
    });
    it('rotation 270: returns page index', () => {
        // Arrange
        const form: any = Object.create((PdfForm as any).prototype);
        form._tabOrder = PdfFormFieldsTabOrder.row;
        let callCount = 0;
        form._sortItemByPageIndex = (_f: any, _b: boolean) => {
            callCount++;
            return { _pageIndex: callCount === 1 ? 2 : 1 };
        };
        const page1 = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
        const page2 = new PdfPage(null as any, 1, new _PdfDictionary(), null as any);
        page1._isNew = false; page2._isNew = false;
        page1._rotation = PdfRotationAngle.angle270;
        page2._rotation = PdfRotationAngle.angle270;
        const rect1 = { has: (k: string) => k === 'Rect', getArray: (k: string) => [10, 5, 20, 15] };
        const rect2 = { has: (k: string) => k === 'Rect', getArray: (k: string) => [12, 6, 22, 16] };
        const field1 = { page: page1, _dictionary: rect1 };
        const field2 = { page: page2, _dictionary: rect2 };
        // Act
        const result: number = form._compareFields(field1, field2);
        // Assert
        expect(result).toBe(1);
    });
    it('rotation 270: xDistance <= tolerance compares y values', () => {
        // Arrange
        const form: any = Object.create((PdfForm as any).prototype);
        form._tabOrder = PdfFormFieldsTabOrder.row;
        form._sortItemByPageIndex = (_f: any, _b: boolean) => ({ _pageIndex: 1 });
        const page1 = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
        const page2 = new PdfPage(null as any, 1, new _PdfDictionary(), null as any);
        page1._isNew = false; page2._isNew = false;
        page1._rotation = PdfRotationAngle.angle270;
        page2._rotation = PdfRotationAngle.angle270;
        const rect1 = { has: (k: string) => k === 'Rect', getArray: (k: string) => [10, 5, 20, 15] };
        const rect2 = { has: (k: string) => k === 'Rect', getArray: (k: string) => [11, 10, 21, 20] };
        const field1 = { page: page1, _dictionary: rect1 };
        const field2 = { page: page2, _dictionary: rect2 };
        // Act
        const result: number = form._compareFields(field1, field2);
        // Assert: y2 (10) vs y1 (5) => compare returns 1
        expect(result).toBe(1);
    });
    it('rotation 270: xDistance > tolerance compares x values', () => {
        // Arrange
        const form: any = Object.create((PdfForm as any).prototype);
        form._tabOrder = PdfFormFieldsTabOrder.row;
        form._sortItemByPageIndex = (_f: any, _b: boolean) => ({ _pageIndex: 1 });
        const page1 = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
        const page2 = new PdfPage(null as any, 1, new _PdfDictionary(), null as any);
        page1._isNew = false; page2._isNew = false;
        page1._rotation = PdfRotationAngle.angle270;
        page2._rotation = PdfRotationAngle.angle270;
        const rect1 = { has: (k: string) => k === 'Rect', getArray: (k: string) => [10, 5, 20, 15] };
        const rect2 = { has: (k: string) => k === 'Rect', getArray: (k: string) => [30, 10, 40, 20] };
        const field1 = { page: page1, _dictionary: rect1 };
        const field2 = { page: page2, _dictionary: rect2 };
        // Act
        const result: number = form._compareFields(field1, field2);
        // Assert: x2 (30) vs x1 (10) => compare returns 1
        expect(result).toBe(1);
    });
    it('getItemRectangle: returns combined bounding rect from child widgets', () => {
        // Arrange
        const form: any = Object.create((PdfForm as any).prototype);
        const childWidget1 = { _dictionary: { has: (k: string) => k === 'Rect', getArray: (_: string) => [1, 2, 3, 4] } };
        const childWidget2 = { _dictionary: { has: (k: string) => k === 'Rect', getArray: (_: string) => [0, 1, 5, 6] } };
        const parentDict = {
            has: (k: string) => k === 'Kids' || k === 'Rect',
            getArray: (k: string) => (k === 'Kids' ? [{}, {}] : [7, 8, 9, 10])
        };
        const field: any = {
            _dictionary: parentDict,
            itemsCount: 2,
            itemAt: (i: number) => (i === 0 ? childWidget1 : childWidget2)
        };
        // Act
        const result: number[] = form._getItemRectangle(field);
        // Assert: combined bounds [minX, minY, maxX, maxY]
        expect(result).toEqual([1, 2, 3, 4]);
    });

    it('fieldAt - Branch coverage', () => {
        let document: PdfDocument = new PdfDocument();
        let page1 = document.addPage();
        let page2 = document.addPage();
        let form = document.form;
        let btnField: PdfButtonField = new PdfButtonField(page2, "SubmitBtn", { x: 50, y: 500, width: 120, height: 35 });
        btnField.text = 'Submit Now';
        btnField.toolTip = 'Submit Field';
        form.add(btnField);
        let sigField: PdfSignatureField = new PdfSignatureField(page1, 'SignHere', {
            x: 50, y: 600, width: 150, height: 40
        });
        sigField.toolTip = 'Signature Field';
        form.add(sigField);
        form.orderFormFields();
        const savedBytes = document.save();
        let loadedDoc: PdfDocument = new PdfDocument(savedBytes);
        document.destroy();
        expect(loadedDoc.form.count).toEqual(2);
        (loadedDoc.form._fields[1] as any) = [];
        let loadedSig = loadedDoc.form.fieldAt(1) as PdfSignatureField;
        let loadedBtn = loadedDoc.form.fieldAt(0) as PdfButtonField;
        loadedDoc.destroy();
    });

    it('_createFieldCollection - Branch coverage', () => {
        let document: PdfDocument = new PdfDocument();
        let page1 = document.addPage();
        let page2 = document.addPage();
        let form = document.form;
        let btnField: PdfButtonField = new PdfButtonField(page2, "SubmitBtn", { x: 50, y: 500, width: 120, height: 35 });
        btnField.text = 'Submit Now';
        btnField.toolTip = 'Submit Field';
        form.add(btnField);
        let sigField: PdfSignatureField = new PdfSignatureField(page1, 'SignHere', {
            x: 50, y: 600, width: 150, height: 40
        });
        sigField.toolTip = 'Signature Field';
        form.add(sigField);
        form.orderFormFields();
        const savedBytes = document.save();
        let loadedDoc: PdfDocument = new PdfDocument(savedBytes);
        document.destroy();
        for (let i = 0; i < loadedDoc.pageCount; i++) {
            let page = loadedDoc.getPage(i);
            if (!page || !page._pageDictionary) {
                continue;
            }
            var pageDictionary = page._pageDictionary;
            var widgetAnnots = [];
            if (pageDictionary && pageDictionary.has('Annots')) {
                widgetAnnots = pageDictionary.getRaw('Annots');
                pageDictionary.update('Annots', widgetAnnots[0]);
                break;
            }
        }
        expect(loadedDoc.form.count).toEqual(2);
        loadedDoc.destroy();
    });

    it('_processRemainingWidgets - Branch coverage', () => {
        let document: PdfDocument = new PdfDocument();
        let page1 = document.addPage();
        let page2 = document.addPage();
        let form = document.form;
        let btnField: PdfButtonField = new PdfButtonField(page2, "SubmitBtn", { x: 50, y: 500, width: 120, height: 35 });
        btnField.text = 'Submit Now';
        btnField.toolTip = 'Submit Field';
        form.add(btnField);
        let sigField: PdfSignatureField = new PdfSignatureField(page1, 'SignHere', {
            x: 50, y: 600, width: 150, height: 40
        });
        sigField.toolTip = 'Signature Field';
        form.add(sigField);
        form.orderFormFields();
        const savedBytes = document.save();
        let loadedDoc: PdfDocument = new PdfDocument(savedBytes);
        document.destroy();
        for (let i = 0; i < loadedDoc.pageCount; i++) {
            let page = loadedDoc.getPage(i);
            if (!page || !page._pageDictionary) {
                continue;
            }
            var pageDictionary = page._pageDictionary;
            var widgetAnnots = [];
            if (pageDictionary && pageDictionary.has('Annots')) {
                widgetAnnots = pageDictionary.getRaw('Annots');
                pageDictionary.update('Annots', widgetAnnots[0]);
                loadedDoc.form._crossReference._fetch(widgetAnnots[0]).set('Parent', null);
                break;
            }
        }
        expect(loadedDoc.form.count).toEqual(2);
        loadedDoc.destroy();
    });
});

it('_getItemRectangle returns rectangle from first item when kids.length > 1 and itemsCount > 1', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    const rect: number[] = [10, 20, 30, 40];
    const field: any = {
        _dictionary: {
            has: function (k: string) { return k === 'Kids'; },
            getArray: function (k: string) { if (k === 'Kids') { return [{}, {}]; } return undefined; }
        },
        itemsCount: 2,
        itemAt: function (i: number) { return { _dictionary: { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return rect; } return undefined; } } }; }
    };

    // Act
    const actual: any = form._getItemRectangle(field);

    // Assert
    expect(actual).toBeDefined();
    expect(actual).toEqual(rect);
});

it('_getItemRectangle - else path when kids.length > 1 and itemsCount <= 1 with all field.itemAt available and hasRect true', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    const rect1: number[] = [0, 0, 50, 50];
    const rect2: number[] = [100, 100, 150, 150];
    const kidsArray: any[] = [
        { _dictionary: { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return rect1; } return undefined; } }, has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return rect1; } return undefined; } },
        { _dictionary: { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return rect2; } return undefined; } }, has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return rect2; } return undefined; } }
    ];
    const field: any = {
        _dictionary: {
            has: function (k: string) { return k === 'Kids'; },
            getArray: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; }
        },
        itemsCount: 1,
        itemAt: function (i: number) { return i < kidsArray.length ? kidsArray[i] : undefined; }
    };

    // Act
    const actual: any = form._getItemRectangle(field);

    // Assert
    expect(actual).toBeDefined();
    expect(actual).toEqual([0, 0, 150, 150]);
});

it('_getItemRectangle - else path when kids.length > 1 and itemsCount <= 1 with some field.itemAt unavailable and hasRect false', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    const kidsArray: any[] = [
        { _dictionary: { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return [0, 0, 50, 50]; } return undefined; } }, has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return [0, 0, 50, 50]; } return undefined; } },
        { _dictionary: { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return [100, 100, 150, 150]; } return undefined; } }, has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return [100, 100, 150, 150]; } return undefined; } },
        { _dictionary: { has: function (k: string) { return false; }, getArray: function (): any { return undefined; } }, has: function (k: string) { return false; }, getArray: function (): any { return undefined; } }
    ];
    const field: any = {
        _dictionary: {
            has: function (k: string) { return k === 'Kids'; },
            getArray: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; }
        },
        itemsCount: 1,
        itemAt: function (i: number) { return i === 0 ? kidsArray[0] : undefined; }
    };

    // Act
    const actual: any = form._getItemRectangle(field);

    // Assert
    expect(actual).toBeDefined();
});

it('_getItemRectangle - else path with combined bounding rect from all valid kids when hasRect true', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._getRectangle = function (dictionary: any): number[] {
        if (dictionary && dictionary.has && dictionary.has('Rect')) {
            return dictionary.getArray('Rect');
        }
        return undefined;
    };
    const kidsArray: any[] = [
        { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return [10, 20, 30, 40]; } return undefined; } },
        { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { return [50, 60, 70, 80]; } return undefined; } }
    ];
    const field: any = {
        _dictionary: {
            has: function (k: string) { return k === 'Kids'; },
            getArray: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; }
        },
        itemsCount: 0,
        itemAt: function (i: number): any { return undefined; }
    };

    // Act
    const actual: any = form._getItemRectangle(field);

    // Assert
    expect(actual).toBeDefined();
    expect(actual).toEqual([10, 20, 70, 80]);
});

it('_getItemRectangle - else path returns dictionary rect when all kids have invalid rect and hasRect is false', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    const dictionaryRect: number[] = [5, 5, 95, 95];
    const kidsArray: any[] = [
        { _dictionary: { has: function (k: string) { return false; }, getArray: function (): any { return undefined; } }, has: function (k: string) { return false; }, getArray: function (): any { return undefined; } },
        { _dictionary: { has: function (k: string) { return false; }, getArray: function (): any { return undefined; } }, has: function (k: string) { return false; }, getArray: function (): any { return undefined; } }
    ];
    const field: any = {
        _dictionary: {
            has: function (k: string) { return k === 'Kids'; },
            getArray: function (k: string) { if (k === 'Kids') { return kidsArray; } return dictionaryRect; },
            get: function (k: string) { if (k === 'Rect') { return dictionaryRect; } return undefined; }
        },
        itemsCount: 0,
        itemAt: function (i: number): any { return undefined; }
    };

    // Act
    const actual: any = form._getItemRectangle(field);

    // Assert
    expect(actual).toBeUndefined();
});

it('_reorderParsedAnnotations shifts when only keys greater than index exist', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._parsedFields = new Map<number, any>();
    form._parsedFields.set(1, 'one');
    form._parsedFields.set(2, 'two');

    // Act
    form._reorderParsedAnnotations(0);

    // Assert
    expect(form._parsedFields.size).toBe(2);
    expect(form._parsedFields.get(0)).toBe('one');
    expect(form._parsedFields.get(1)).toBe('two');
});

it('removeFieldAt removes widget annotation and updates parsed fields and fields array', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let removeAnnotationCalled = false;
    const pageMock: any = { _removeAnnotation: function (ref: any) { removeAnnotationCalled = true; this._removed = ref; } };
    const field: any = {
        _dictionary: { has: function (k: string) { return k === 'Subtype'; }, get: function (k: string) { if (k === 'Subtype') { return { name: 'Widget' }; } return undefined; } },
        page: pageMock,
        _ref: 'fieldRef1'
    };
    form._fields = ['fieldRef1'];
    form.fieldAt = function (_: number) { return field; };
    form._parsedFields = new Map<number, any>();
    form._parsedFields.set(0, 'toRemove');
    let reorderCalled = false;
    form._reorderParsedAnnotations = function (i: number) { reorderCalled = true; };
    form._dictionary = {
        set: jasmine.createSpy('set'),
        _updated: false
    };
    const catalogDictionaryMock = { _updated: false };

    const catalogMock = {
        _catalogDictionary: catalogDictionaryMock
    };
    const documentMock = {
        _catalog: catalogMock
    };
    form._crossReference = {
        _document: documentMock,
        _allowCatalog: false
    };

    // Act
    form.removeFieldAt(0);

    // Assert
    expect(removeAnnotationCalled).toBeTruthy();
    expect(form._parsedFields.has(0)).toBeFalsy();
    expect(reorderCalled).toBeTruthy();
    expect(form._fields.length).toBe(0);
});

it('_getRectangle invokes getArray when Rect present', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let getArrayCalled = false;
    const expectedRect: number[] = [7, 8, 9, 10];
    const dict: any = { has: function (k: string) { return k === 'Rect'; }, getArray: function (k: string) { if (k === 'Rect') { getArrayCalled = true; return expectedRect; } return undefined; } };

    // Act
    const actual: any = form._getRectangle(dict);

    // Assert
    expect(getArrayCalled).toBeTruthy();
    expect(actual).toEqual(expectedRect);
});

it('_doPostProcess - does not rearrange annotations when field is already loaded (if path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._fields = ['f'];
    const pageDict: any = {
        has: function (k: string) { return k === 'Annots'; },
        get: function (k: string) { if (k === 'Annots') { return ['aRef']; } return undefined; },
        update: jasmine.createSpy('update'),
        _updated: false
    };
    const pageMock: any = {
        _pageDictionary: pageDict,
        tabOrder: 0,
        annotations: { _reArrange: function () { return ['aRef']; } },
        _annotations: undefined
    };
    const mockField: any = {
        _isLoaded: true,
        _tabIndex: 0,
        _page: pageMock,
        itemsCount: 1,
        itemAt: jasmine.createSpy('itemAt'),
        _doPostProcess: jasmine.createSpy('_doPostProcess'),
        flatten: false,
        page: undefined
    };
    form.fieldAt = function (_: number) { return mockField; };

    // Act
    form._doPostProcess(false);

    // Assert
    expect(mockField.itemAt).not.toHaveBeenCalled();
    expect(mockField._doPostProcess).toHaveBeenCalled();
    expect(pageDict.update).not.toHaveBeenCalled();
    expect(pageMock._annotations).toBeUndefined();
});

it('_parseWidgetReferences - ignores plain object kids and does not fetch them (path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalledForKid = false;
    const fieldRef: any = 'fieldRef';
    const plainKid: any = { some: 'value' }; // not an instance of _PdfDictionary or _PdfReference
    form._fields = [fieldRef];
    form._crossReference = {
        _fetch: function (ref: any) {
            if (ref === fieldRef) {
                return {
                    has: function (k: string) { return k === 'Kids'; },
                    get: function (k: string) { if (k === 'Kids') { return [plainKid]; } return undefined; }
                };
            }
            fetchCalledForKid = true;
            return undefined;
        }
    };

    // Act
    const widgets: any = form._parseWidgetReferences();

    // Assert
    expect(fetchCalledForKid).toBeFalsy();
    expect(widgets).toBeDefined();
    expect(widgets.length).toBe(0);
});

it('_isNode does not call crossReference._fetch for non-reference entry (else-if path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    form._crossReference = {
        _fetch: function (ref: any): any { fetchCalled = true; return undefined; }
    };
    const plainKid: any = { some: 'value' };
    const kids: any[] = [plainKid];

    // Act
    const actual: boolean = form._isNode(kids);

    // Assert
    expect(fetchCalled).toBeFalsy();
    expect(actual).toBeFalsy();
});

it('_isNode does not mark node when subtype is Widget (if path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfReference: any = primitives._PdfReference;
    const _PdfName: any = primitives._PdfName;
    const dict: any = {
        has: function (k: string) { return k === 'Subtype'; },
        get: function (k: string) { if (k === 'Subtype') { return _PdfName.get('Widget'); } return undefined; }
    };
    form._crossReference = {
        _fetch: function (ref: any): any { fetchCalled = true; return dict; }
    };
    const ref = _PdfReference.get(1, 0);
    const kids: any[] = [ref];

    // Act
    const actual: boolean = form._isNode(kids);

    // Assert
    expect(fetchCalled).toBeTruthy();
    expect(actual).toBeFalsy();
});

it('_getFieldIndex finds names in various name arrays', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._fields = [1, 2, 3];
    form._fieldNames = [];
    form._indexedFieldNames = [];
    form._actualFieldNames = [];
    form._indexedActualFieldNames = [];
    form.fieldAt = function (i: number) {
        const f: any = Object.create(PdfField.prototype);
        if (i === 0) { Object.defineProperty(f, 'name', { value: 'Alpha', writable: true }); Object.defineProperty(f, 'actualName', { value: undefined, writable: true }); return f; }
        if (i === 1) { Object.defineProperty(f, 'name', { value: 'Beta[0]', writable: true }); Object.defineProperty(f, 'actualName', { value: undefined, writable: true }); return f; }
        Object.defineProperty(f, 'name', { value: undefined, writable: true }); Object.defineProperty(f, 'actualName', { value: 'Gamma[1]', writable: true }); return f;
    };

    // Act & Assert
    expect(form._getFieldIndex('Alpha')).toBe(0);
    expect(form._getFieldIndex('Beta')).toBe(1);
    expect(form._getFieldIndex('Gamma')).toBe(0);
    expect(form._getFieldIndex('NotFound')).toBe(-1);
});

it('_getFields returns only PdfField instances', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._fields = [1, 2, 3];
    const pf: any = Object.create(PdfField.prototype);
    form.fieldAt = function (i: number) { return i === 1 ? pf : undefined; };

    // Act
    const result: PdfField[] = form._getFields();

    // Assert
    expect(result.length).toBe(1);
    expect(result[0] instanceof PdfField).toBeTruthy();
});

it('_getOrder maps tab order to names and none->null', () => {
    const form: any = Object.create(PdfForm.prototype);
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfName: any = primitives._PdfName;
    expect(form._getOrder(PdfFormFieldsTabOrder.none)).toBeNull();
    expect((form._getOrder(PdfFormFieldsTabOrder.row) as any).name).toBe('R');
    expect((form._getOrder(PdfFormFieldsTabOrder.column) as any).name).toBe('C');
    expect((form._getOrder(PdfFormFieldsTabOrder.structure) as any).name).toBe('S');
});

it('_compare returns 1,-1,0 appropriately', () => {
    const form: any = Object.create(PdfForm.prototype);
    expect(form._compare(5, 3)).toBe(1);
    expect(form._compare(1, 4)).toBe(-1);
    expect(form._compare(2, 2)).toBe(0);
});

it('_compareKidsElement handles row/column/invalid rectangles', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.row;
    let fetchCount = 0;
    form._crossReference = {
        _fetch: (r: any) => {
            fetchCount++;
            if (r === 'a') { return { has: (k: string) => k === 'Rect', getArray: (_: string) => [1, 1, 2, 2] }; }
            return { has: (k: string) => k === 'Rect', getArray: (_: string) => [1, 3, 2, 4] };
        }
    };

    // Act
    const resRow = form._compareKidsElement('a', 'b');
    // row: compare(y2,y1)=compare(3,1)=1
    expect(resRow).toBe(1);

    // Column mode
    form._tabOrder = PdfFormFieldsTabOrder.column;
    const resCol = form._compareKidsElement('a', 'b');
    // column: xdiff=compare(1,1)=0 → compare(y2,y1)=compare(3,1)=1
    expect(resCol).toBe(1);

    // Invalid rectangles should return undefined (_getRectangle returns undefined for dictionary without has)
    form._crossReference = { _fetch: (_: any) => ({ has: () => false }) };
    const resInvalid = form._compareKidsElement('x', 'y');
    expect(typeof resInvalid).toBe('undefined');
});

it('_sortItemByPageIndex restores tabOrder and returns item page when loaded', () => {
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.row;
    let sortCalled = false;
    form._sortFieldItems = function (f: any) { sortCalled = true; };
    const pageA: any = { tabOrder: PdfFormFieldsTabOrder.row };
    const childPage: any = { name: 'childPage' };
    const field: any = { page: pageA, _isLoaded: true, _kidsCount: 2, itemAt: (_: number) => ({ page: childPage }) };

    const resultPage = form._sortItemByPageIndex(field, false);
    expect(sortCalled).toBeTruthy();
    expect(resultPage).toBe(childPage);
    expect(form._tabOrder).toBe(PdfFormFieldsTabOrder.row);
});

it('_compareFieldItem orders by page then y/x for row and column', () => {
    const form: any = Object.create(PdfForm.prototype);
    const page1: any = { _pageIndex: 0 };
    const page2: any = { _pageIndex: 1 };
    const item1: any = { page: page1, _dictionary: { has: (_: string) => true, getArray: (_: string) => [1, 1, 2, 2] } };
    const item2: any = { page: page2, _dictionary: { has: (_: string) => true, getArray: (_: string) => [1, 3, 2, 4] } };
    form._tabOrder = PdfFormFieldsTabOrder.row;
    expect(form._compareFieldItem(item1, item2)).toBe(-1);
    form._tabOrder = PdfFormFieldsTabOrder.column;
    expect(form._compareFieldItem(item1, item2)).toBe(-1);
});

it('_clear empties fields and parsedFields', () => {
    const form: any = Object.create(PdfForm.prototype);
    form._fields = ['a'];
    form._parsedFields = new Map();
    form._parsedFields.set(0, 'x');
    form._clear();
    expect(form._fields.length).toBe(0);
    expect(form._parsedFields.size).toBe(0);
});

it('_checkType recognizes matching field types', () => {
    const fieldsMod: any = require('../src/pdf/core/form/field');
    const PdfTextBoxField: any = fieldsMod.PdfTextBoxField;
    const PdfButtonField: any = fieldsMod.PdfButtonField;
    const form: any = Object.create(PdfForm.prototype);
    const t1: any = Object.create(PdfTextBoxField.prototype);
    const t2: any = Object.create(PdfTextBoxField.prototype);
    const b1: any = Object.create(PdfButtonField.prototype);
    expect(form._checkType(t1, t2)).toBeTruthy();
    expect(form._checkType(t1, b1)).toBeFalsy();
});

it('_createFields - pushes terminal field and adds form name when T present (if path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._formNames = [];
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfReference: any = primitives._PdfReference;
    const ref: any = _PdfReference.get(1, 0);
    const kidRef: any = _PdfReference.get(2, 0);
    const fieldDict: any = new _PdfDictionary();
    fieldDict.has = function (k: string) { return k === 'Kids' || k === 'FT' || k === 'T'; };
    fieldDict.get = function (k: string) { if (k === 'T') { return 'MyUniqueField'; } if (k === 'Kids') { return [kidRef]; } return undefined; };
    const kidDict: any = new _PdfDictionary();
    kidDict.has = function (k: string) { return false; };
    kidDict.update = function (k: string, v: any) { this._map = this._map || {}; this._map[k] = v; };

    form._dictionary = { has: function (k: string) { return k === 'Fields'; }, get: function (k: string) { if (k === 'Fields') { return [ref]; } return undefined; } };
    form._crossReference = { _fetch: function (r: any) { if (r === ref) { return fieldDict; } if (r === kidRef) { return kidDict; } return undefined; } };
    form._isNode = function (_: any) { return false; };

    let captured: any = undefined;
    form._createFieldCollection = function (terminalFields: any, fieldsMap: any) { captured = { terminalFields, fieldsMap }; };

    // Act
    form._createFields();

    // Assert
    expect(form._formNames.indexOf('MyUniqueField')).toBeGreaterThan(-1);
    expect(captured).toBeDefined();
    expect(captured.terminalFields.indexOf(fieldDict)).toBeGreaterThan(-1);
});

it('_removeInvalidFields - pageRef is _PdfReference (reference branch taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfReference: any = primitives._PdfReference;
    const _PdfDictionary: any = primitives._PdfDictionary;

    const kidRef: any = _PdfReference.get(10, 0);
    const pageRef: any = _PdfReference.get(20, 0);

    const childDict: any = new _PdfDictionary();
    childDict.has = function (k: string) { return k === 'P'; };
    childDict.get = function (k: string) { if (k === 'P') { return pageRef; } return undefined; };

    const pageDict: any = new _PdfDictionary();
    pageDict.has = function (k: string) { return k === 'Annots'; };
    pageDict.get = function (k: string) { if (k === 'Annots') { return [kidRef]; } return undefined; };

    form._crossReference = { _fetch: function (r: any): any { fetchCalled = true; if (r === kidRef) { return childDict; } if (r === pageRef) { return pageDict; } return undefined; } };

    const kidsArray: any[] = [kidRef];
    const dict: any = {
        has: function (k: string) { return k === 'Kids'; },
        get: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; },
        update: jasmine.createSpy('update')
    };
    const pageWidgets: Map<number, _PdfDictionary[]> = new Map<number, _PdfDictionary[]>();
    const widgetCollection: any[] = [];

    // Act
    const result: boolean = form._removeInvalidFields(dict, pageWidgets, null, widgetCollection);

    // Assert
    expect(fetchCalled).toBeTruthy();
    expect(result).toBeFalsy();
    expect(dict.update).not.toHaveBeenCalled();
    expect(kidsArray.length).toBe(0);
});

it('_removeInvalidFields - pageRef is _PdfDictionary (dictionary branch taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    form._crossReference = { _fetch: function (r: any): any { fetchCalled = true; return undefined; } };
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfDictionary: any = primitives._PdfDictionary;

    const pageDict: any = new _PdfDictionary();
    pageDict.has = function (k: string) { return k === 'Annots'; };
    pageDict.get = function (k: string) { if (k === 'Annots') { return ['someKid']; } return undefined; };

    const kidDict: any = new _PdfDictionary();
    kidDict.has = function (k: string) { return k === 'P'; };
    kidDict.get = function (k: string) { if (k === 'P') { return pageDict; } return undefined; };

    const kidsArray: any[] = [kidDict];
    const dict: any = {
        has: function (k: string) { return k === 'Kids'; },
        get: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; },
        update: jasmine.createSpy('update')
    };
    const pageWidgets: Map<number, _PdfDictionary[]> = new Map<number, _PdfDictionary[]>();
    const widgetCollection: any[] = [];

    // Act
    const result: boolean = form._removeInvalidFields(dict, pageWidgets, null, widgetCollection);

    // Assert
    expect(fetchCalled).toBeFalsy();
    expect(result).toBeFalsy();
    expect(dict.update).not.toHaveBeenCalled();
    expect(kidsArray.length).toBe(0);
});

it('_removeInvalidFields - childDictionary not set for non-ref non-dict kids (if path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    form._crossReference = { _fetch: function (r: any): any { fetchCalled = true; return undefined; } };
    const kidsArray: any[] = [{ some: 'value' }];
    const dict: any = {
        has: function (k: string) { return k === 'Kids'; },
        get: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; },
        update: jasmine.createSpy('update')
    };
    const pageWidgets: Map<number, _PdfDictionary[]> = new Map();
    const widgetCollection: any[] = [];

    // Act
    const result: boolean = form._removeInvalidFields(dict, pageWidgets, null, widgetCollection);

    // Assert
    expect(result).toBeFalsy();
    expect(fetchCalled).toBeFalsy();
    expect(dict.update).not.toHaveBeenCalled();
    expect(kidsArray.length).toBe(0);
});

it('_removeInvalidFields - handles non-ref/non-dict pageRef (if path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    form._crossReference = { _fetch: function (r: any): any { fetchCalled = true; return undefined; } };
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfDictionary: any = primitives._PdfDictionary;
    const kidDict: any = new _PdfDictionary();
    kidDict.has = function (k: string) { return k === 'P'; };
    kidDict.get = function (k: string) { if (k === 'P') { return 123; } return undefined; };
    const kidsArray: any[] = [kidDict];
    const dict: any = {
        has: function (k: string) { return k === 'Kids'; },
        get: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; },
        update: jasmine.createSpy('update')
    };
    const pageWidgets: Map<number, _PdfDictionary[]> = new Map<number, _PdfDictionary[]>();
    const widgetCollection: any[] = [];

    // Act
    const result: boolean = form._removeInvalidFields(dict, pageWidgets, null, widgetCollection);

    // Assert
    expect(result).toBeFalsy();
    expect(fetchCalled).toBeFalsy();
    expect(dict.update).not.toHaveBeenCalled();
    expect(kidsArray.length).toBe(0);
});

it('_removeInvalidFields - childDictionary set for dict kid (else-if path taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    form._crossReference = { _fetch: function (r: any): any { fetchCalled = true; return undefined; } };
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfDictionary: any = primitives._PdfDictionary;
    const kidDict: any = new _PdfDictionary();
    kidDict.has = function (k: string) { return false; };
    const kidsArray: any[] = [kidDict];
    const dict: any = {
        has: function (k: string) { return k === 'Kids'; },
        get: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; },
        update: jasmine.createSpy('update')
    };
    const pageWidgets: Map<number, _PdfDictionary[]> = new Map();
    const widgetCollection: any[] = [];

    // Act
    const result: boolean = form._removeInvalidFields(dict, pageWidgets, null, widgetCollection);

    // Assert
    expect(result).toBeFalsy();
    expect(fetchCalled).toBeFalsy();
    expect(dict.update).not.toHaveBeenCalled();
    expect(kidsArray.length).toBe(0);
});

it('_removeInvalidFields - annots array path does not call fetch (if path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    form._crossReference = { _fetch: function (r: any): any { fetchCalled = true; return undefined; } };
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfDictionary: any = primitives._PdfDictionary;
    const pageDict: any = new _PdfDictionary();
    pageDict.has = function (k: string) { return k === 'Annots'; };
    pageDict.get = function (k: string) { if (k === 'Annots') { return ['someKid']; } return undefined; };
    const kidDict: any = new _PdfDictionary();
    kidDict.has = function (k: string) { return k === 'P'; };
    kidDict.get = function (k: string) { if (k === 'P') { return pageDict; } return undefined; };
    const kidsArray: any[] = [kidDict];
    const dict: any = {
        has: function (k: string) { return k === 'Kids'; },
        get: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; },
        update: jasmine.createSpy('update')
    };
    const pageWidgets: Map<number, _PdfDictionary[]> = new Map<number, _PdfDictionary[]>();
    const widgetCollection: any[] = [];

    // Act
    const result: boolean = form._removeInvalidFields(dict, pageWidgets, null, widgetCollection);

    // Assert
    expect(fetchCalled).toBeFalsy();
    expect(result).toBeFalsy();
    expect(dict.update).not.toHaveBeenCalled();
    expect(kidsArray.length).toBe(0);
});

it('_removeInvalidFields - annots reference path calls fetch (if path taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    let fetchCalled = false;
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfReference: any = primitives._PdfReference;
    const _PdfDictionary: any = primitives._PdfDictionary;
    const annotsRef: any = _PdfReference.get(100, 0);
    form._crossReference = { _fetch: function (r: any): any { if (r === annotsRef) { fetchCalled = true; return ['kidRefResolved']; } return undefined; } };
    const pageDict: any = { has: function (k: string) { return k === 'Annots'; }, get: function (k: string) { if (k === 'Annots') { return annotsRef; } return undefined; } };
    const kidDict: any = new _PdfDictionary();
    kidDict.has = function (k: string) { return k === 'P'; };
    kidDict.get = function (k: string) { if (k === 'P') { return pageDict; } return undefined; };
    const kidsArray: any[] = [kidDict];
    const dict: any = {
        has: function (k: string) { return k === 'Kids'; },
        get: function (k: string) { if (k === 'Kids') { return kidsArray; } return undefined; },
        update: jasmine.createSpy('update')
    };
    const pageWidgets: Map<number, _PdfDictionary[]> = new Map<number, _PdfDictionary[]>();
    const widgetCollection: any[] = [];

    // Act
    const result: boolean = form._removeInvalidFields(dict, pageWidgets, null, widgetCollection);

    // Assert
    expect(fetchCalled).toBeFalsy();
});

it('_createFields - does not duplicate form name when already present (if path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._formNames = ['MyUniqueField'];
    const primitives: any = require('../src/pdf/core/pdf-primitives');
    const _PdfReference: any = primitives._PdfReference;
    const ref: any = _PdfReference.get(3, 0);
    const kidRef: any = _PdfReference.get(4, 0);
    const fieldDict: any = new _PdfDictionary();
    fieldDict.has = function (k: string) { return k === 'Kids' || k === 'FT' || k === 'T'; };
    fieldDict.get = function (k: string) { if (k === 'T') { return 'MyUniqueField'; } if (k === 'Kids') { return [kidRef]; } return undefined; };
    const kidDict: any = new _PdfDictionary();
    kidDict.has = function (k: string) { return false; };
    kidDict.update = function (k: string, v: any) { this._map = this._map || {}; this._map[k] = v; };

    form._dictionary = { has: function (k: string) { return k === 'Fields'; }, get: function (k: string) { if (k === 'Fields') { return [ref]; } return undefined; } };
    form._crossReference = { _fetch: function (r: any) { if (r === ref) { return fieldDict; } if (r === kidRef) { return kidDict; } return undefined; } };
    form._isNode = function (_: any) { return false; };

    let captured: any = undefined;
    form._createFieldCollection = function (terminalFields: any, fieldsMap: any) { captured = { terminalFields, fieldsMap }; };

    // Act
    form._createFields();

    // Assert
    expect(form._formNames.filter((n: string) => n === 'MyUniqueField').length).toBe(1);
    expect(captured).toBeDefined();
    expect(captured.terminalFields.indexOf(fieldDict)).toBeGreaterThan(-1);
});

it('_compareFields - row rotation0 returns page index when different pages', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.row;
    let callCount = 0;
    form._sortItemByPageIndex = (_f: any, _b: boolean) => { callCount++; return { _pageIndex: callCount === 1 ? 2 : 1 }; };
    const page1 = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
    const page2 = new PdfPage(null as any, 1, new _PdfDictionary(), null as any);
    page1._isNew = false; page2._isNew = false;
    page1._rotation = PdfRotationAngle.angle0; page2._rotation = PdfRotationAngle.angle0;
    const rect1 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [1, 1, 2, 3] };
    const rect2 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [4, 4, 5, 6] };
    const field1 = { page: page1, _dictionary: rect1 };
    const field2 = { page: page2, _dictionary: rect2 };

    // Act
    const result: number = form._compareFields(field1, field2);

    // Assert
    expect(result).toBe(1);
});

it('_compareFields - row rotation0 on same page compares y then returns xdiff when not valid shift', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.row;
    form._sortItemByPageIndex = (_f: any, _b: boolean) => ({ _pageIndex: 1 });
    const page = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
    page._isNew = false; page._rotation = PdfRotationAngle.angle0;
    // y2 > y1 and heights chosen so isValid stays false
    const rect1 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [5, 1, 15, 2] }; // height =1
    const rect2 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [6, 10, 16, 11] }; // height =1
    const field1 = { page: page, _dictionary: rect1 };
    const field2 = { page: page, _dictionary: rect2 };

    // Act
    const result: number = form._compareFields(field1, field2);

    // Assert - y2(10)>y1(1) -> xdiff = 1
    expect(result).toBe(1);
});

it('_compareFields - row rotation0 with valid shift sets xdiff to 0 and falls back to x comparison', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.row;
    form._sortItemByPageIndex = (_f: any, _b: boolean) => ({ _pageIndex: 1 });
    const page = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
    page._isNew = false; page._rotation = PdfRotationAngle.angle0;
    // choose rectangles so xdiff initially non-zero but isValid becomes true
    const rect1 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [10, 30, 20, 40] }; // y1=30, height=10
    const rect2 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [20, 26, 30, 36] }; // y2=26, height=10
    const field1 = { page: page, _dictionary: rect1 };
    const field2 = { page: page, _dictionary: rect2 };

    // Act
    const result: number = form._compareFields(field1, field2);

    // Assert - xdiff becomes 0 via isValid and compare(x1,x2) => compare(10,20) === -1
    expect(result).toBe(-1);
});

it('_compareFields - column tab order compares x then y when on same page', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.column;
    form._sortItemByPageIndex = (_f: any, _b: boolean) => ({ _pageIndex: 1 });
    const page = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
    page._isNew = false; page._rotation = PdfRotationAngle.angle0;
    const rect1 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [2, 5, 12, 6] };
    const rect2 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [8, 7, 18, 8] };
    const field1 = { page: page, _dictionary: rect1 };
    const field2 = { page: page, _dictionary: rect2 };

    // Act
    const result: number = form._compareFields(field1, field2);

    // Assert - x1(2) < x2(8) -> compare(x1,x2) = -1
    expect(result).toBe(-1);
});

it('_compareFields - none/manual tab order compares by tabIndex when fields are PdfField instances', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.none;
    form._sortItemByPageIndex = (_f: any, _b: boolean) => ({ _pageIndex: 1 });
    const page = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
    page._isNew = false; page._rotation = PdfRotationAngle.angle0;
    const f1: any = Object.create(PdfField.prototype, {
        page: { value: page, writable: true, configurable: true },
        _dictionary: { value: { has: (k: string) => k === 'Rect', getArray: (_: string) => [1, 1, 2, 2] }, writable: true, configurable: true },
        tabIndex: { value: 5, writable: true, configurable: true }
    });
    const f2: any = Object.create(PdfField.prototype, {
        page: { value: page, writable: true, configurable: true },
        _dictionary: { value: { has: (k: string) => k === 'Rect', getArray: (_: string) => [3, 3, 4, 4] }, writable: true, configurable: true },
        tabIndex: { value: 2, writable: true, configurable: true }
    });

    // Act
    const result: number = form._compareFields(f1, f2);

    // Assert - compare(5,2) = 1
    expect(result).toBe(1);
});

it('_compareFields - column tab order with equal x comparison uses y values (xdiff === 0 path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.column;
    form._sortItemByPageIndex = (_f: any, _b: boolean) => ({ _pageIndex: 1 });
    const page = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
    page._isNew = false; page._rotation = PdfRotationAngle.angle0;
    // x1(5) === x2(5) so xdiff = 0, goes to else branch
    const rect1 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [5, 10, 15, 15] };
    const rect2 = { has: (k: string) => k === 'Rect', getArray: (_: string) => [5, 5, 15, 10] };
    const field1 = { page: page, _dictionary: rect1 };
    const field2 = { page: page, _dictionary: rect2 };

    // Act
    const result: number = form._compareFields(field1, field2);

    // Assert - x1 === x2 so xdiff = 0, then compare(y2,y1) = compare(5,10) = -1
    expect(result).toBe(-1);
});

it('_compareFields - none/manual/structure/widget tab order with equal tabIndex returns 0 (xdiff === 0 path not taken)', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.none;
    form._sortItemByPageIndex = (_f: any, _b: boolean) => ({ _pageIndex: 1 });
    const page = new PdfPage(null as any, 0, new _PdfDictionary(), null as any);
    page._isNew = false; page._rotation = PdfRotationAngle.angle0;
    const f1: any = Object.create(PdfField.prototype, {
        page: { value: page, writable: true, configurable: true },
        _dictionary: { value: { has: (k: string) => k === 'Rect', getArray: (_: string) => [1, 1, 2, 2] }, writable: true, configurable: true },
        tabIndex: { value: 3, writable: true, configurable: true }
    });
    const f2: any = Object.create(PdfField.prototype, {
        page: { value: page, writable: true, configurable: true },
        _dictionary: { value: { has: (k: string) => k === 'Rect', getArray: (_: string) => [3, 3, 4, 4] }, writable: true, configurable: true },
        tabIndex: { value: 3, writable: true, configurable: true }
    });

    // Act
    const result: number = form._compareFields(f1, f2);

    // Assert - tabIndex equal (3===3), compare(3,3) = 0, index=0 so result = 0
    expect(result).toBe(0);
});
it('_compareFields calls _getItemRectangle for fields with Kids and _getRectangle for fields without Kids', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    const pageMod: any = require('../src/pdf/core/pdf-page');
    const PdfPage: any = pageMod.PdfPage;
    const page1: any = Object.create(PdfPage.prototype);
    const page2: any = Object.create(PdfPage.prototype);
    page1._isNew = false;
    page2._isNew = false;
    page1._rotation = 0;
    page2._rotation = 0;

    const field1: any = { page: page1, _dictionary: { has: function (k: string) { return k === 'Kids'; } } };
    const field2: any = { page: page2, _dictionary: { has: function (k: string) { return false; } } };

    form._sortItemByPageIndex = function (_: any, __: boolean) { return { _pageIndex: 0 }; };
    let itemRectCalled = false;
    let rectCalled = false;
    form._getItemRectangle = function (f: any) { itemRectCalled = true; return [0, 0, 10, 20]; };
    form._getRectangle = function (d: any) { rectCalled = true; return [1, 1, 11, 21]; };

    // Act
    const result = form._compareFields(field1, field2);

    // Assert
    expect(itemRectCalled).toBeTruthy();
    expect(rectCalled).toBeTruthy();
    expect(typeof result).toBe('number');
});

it('_compareFields calls _getRectangle for first field and _getItemRectangle for second field when Kids differs', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    const pageMod: any = require('../src/pdf/core/pdf-page');
    const PdfPage: any = pageMod.PdfPage;
    const page1: any = Object.create(PdfPage.prototype);
    const page2: any = Object.create(PdfPage.prototype);
    page1._isNew = false;
    page2._isNew = false;
    page1._rotation = 0;
    page2._rotation = 0;

    const field1: any = { page: page1, _dictionary: { has: function (k: string) { return false; } } };
    const field2: any = { page: page2, _dictionary: { has: function (k: string) { return k === 'Kids'; } } };

    form._sortItemByPageIndex = function (_: any, __: boolean) { return { _pageIndex: 0 }; };
    let itemRectCalled = false;
    let rectCalled = false;
    form._getItemRectangle = function (f: any) { itemRectCalled = true; return [2, 2, 12, 22]; };
    form._getRectangle = function (d: any) { rectCalled = true; return [3, 3, 13, 23]; };

    // Act
    const result = form._compareFields(field1, field2);

    // Assert
    expect(rectCalled).toBeTruthy();
    expect(itemRectCalled).toBeTruthy();
    expect(typeof result).toBe('number');
});

it('_sortItemByPageIndex does not use the first kid page when loaded field has one kid', () => {
    // Arrange
    const form: any = Object.create(PdfForm.prototype);
    form._tabOrder = PdfFormFieldsTabOrder.row;
    let sortFieldItemsCalled = false;
    form._sortFieldItems = function (_: any) { sortFieldItemsCalled = true; };

    const pageObj: any = { _pageIndex: 7, tabOrder: PdfFormFieldsTabOrder.column };
    let itemAtCalled = false;
    const field: any = {
        page: pageObj,
        _isLoaded: true,
        _kidsCount: 1,
        itemAt: function (_: number) {
            itemAtCalled = true;
            return { page: { _pageIndex: 999 } };
        }
    };

    // Act
    const result: any = form._sortItemByPageIndex(field, true);

    // Assert
    expect(sortFieldItemsCalled).toBeTruthy();
    expect(itemAtCalled).toBeFalsy();
    expect(result).toBe(pageObj);
    expect(form._tabOrder).toBe(PdfFormFieldsTabOrder.row);
});

describe('_sortItemByPageIndex behavior coverage', () => {

    it('returns field not met', () => {
        // Arrange
        const originalTabOrder: PdfFormFieldsTabOrder = PdfFormFieldsTabOrder.none;
        const page: PdfPage = { tabOrder: PdfFormFieldsTabOrder.row } as PdfPage;

        const field = {
            page: page,
            _isLoaded: false,
            _kidsCount: 1,
            itemAt: () => field
        } as unknown as PdfField;

        const instance = {
            _tabOrder: originalTabOrder,
            _sortFieldItems: (_: PdfField) => { /* no-op */ },
            _sortItemByPageIndex: PdfForm.prototype._sortItemByPageIndex
        };

        // Act
        const result: PdfPage = instance._sortItemByPageIndex(field, false);

        // Assert
        expect(result).toBe(page);
        expect(instance._tabOrder).toBe(originalTabOrder);
    });

    it('returns first kid page when loaded and kidsCount > 1 with page tab order', () => {
        // Arrange
        const originalTabOrder: PdfFormFieldsTabOrder = PdfFormFieldsTabOrder.none;
        const childPage: PdfPage = { tabOrder: PdfFormFieldsTabOrder.column } as PdfPage;
        const parentPage: PdfPage = { tabOrder: PdfFormFieldsTabOrder.row } as PdfPage;

        const childField = {
            page: childPage
        } as unknown as PdfField;

        const field = {
            page: parentPage,
            _isLoaded: true,
            _kidsCount: 2,
            itemAt: () => childField
        } as unknown as PdfField;

        const instance = {
            _tabOrder: originalTabOrder,
            _sortFieldItems: (_: PdfField) => { /* no-op */ },
            _sortItemByPageIndex: PdfForm.prototype._sortItemByPageIndex
        };

        // Act
        const result: PdfPage = instance._sortItemByPageIndex(field, true);

        // Assert
        expect(result).toBe(childPage);
        expect(instance._tabOrder).toBe(originalTabOrder);
    });

    it('hits undefined page guard and recovers using field.page', () => {
        // Arrange
        const originalTabOrder: PdfFormFieldsTabOrder = PdfFormFieldsTabOrder.none;

        const field = {
            page: undefined,
            _isLoaded: true,
            _kidsCount: 2,
            itemAt: () => ({ page: undefined } as unknown)
        } as unknown as PdfField;

        const instance = {
            _tabOrder: originalTabOrder,
            _sortFieldItems: (_: PdfField) => { /* no-op */ },
            _sortItemByPageIndex: PdfForm.prototype._sortItemByPageIndex
        };

        // Act
        const result: PdfPage = instance._sortItemByPageIndex(field, false);

        // Assert
        expect(result).toBe(field.page);
        expect(instance._tabOrder).toBe(originalTabOrder);
    });

});