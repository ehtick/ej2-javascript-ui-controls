import { _FontStructure, _XfdfDocument } from '../src/pdf/core/import-export/xfdf-document';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { _PdfBaseStream } from '../src/pdf/core/base-stream';
import { PdfAnnotation, PdfPopupAnnotation, PdfRadioButtonListItem, PdfWidgetAnnotation } from '../src/pdf/core/annotations/annotation';
import { PdfForm } from '../src/pdf/core/form/form';
import {
    PdfCheckBoxField,
    PdfComboBoxField,
    PdfField,
    PdfListBoxField,
    PdfListField,
    PdfRadioButtonListField,
    PdfTextBoxField
} from '../src/pdf/core/form/field';
import { PdfAnnotationCollection } from '../src/pdf/core/annotations/annotation-collection';
import * as utils from '../src/pdf/core/utils';
import { PdfPage } from '../src/pdf/core/pdf-page';

describe('_ExportHelper / _XfdfDocument uncovered behavior coverage', () => {
    let helper: _XfdfDocument;
    let crossReference: any;
    let documentStub: any;

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }

    function defineGetter(target: any, key: string, getter: () => any): void {
        Object.defineProperty(target, key, {
            get: getter,
            configurable: true,
            enumerable: true
        });
    }

    function createReference(isNew: boolean = false): _PdfReference {
        const reference: _PdfReference = new _PdfReference(1, 0);
        defineValue(reference, '_isNew', isNew);
        return reference;
    }

    function createDictionary(initial?: Record<string, any>): _PdfDictionary {
        const dictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        if (initial) {
            Object.keys(initial).forEach((key: string) => {
                dictionary.update(key, initial[key]);
            });
        }
        return dictionary;
    }

    function createWidgetWithAppearanceState(stateName: string): PdfWidgetAnnotation {
        const widget: any = {};
        Object.setPrototypeOf(widget, PdfWidgetAnnotation.prototype);
        defineValue(widget, '_dictionary', createDictionary({
            AS: _PdfName.get(stateName)
        }));
        return widget as PdfWidgetAnnotation;
    }

    function createField<T>(ctor: Function, name: string, fieldType: string): T {
        const field: any = {};
        Object.setPrototypeOf(field, ctor.prototype);

        defineValue(field, 'name', name);
        defineValue(field, 'export', true);
        defineValue(field, 'readOnly', false);
        defineValue(field, '_defaultIndex', 0);
        defineValue(field, '_kidsCount', 0);
        defineValue(field, 'selectedIndex', -1);
        defineValue(field, 'multiLine', false);
        defineValue(field, 'checked', false);
        defineValue(field, '_options', []);

        defineValue(field, '_dictionary', createDictionary({
            FT: _PdfName.get(fieldType)
        }));

        defineValue(field, 'itemAt', jasmine.createSpy('itemAt').and.callFake((): any => undefined));
        defineValue(field, '_obtainSelectedValue', jasmine.createSpy('_obtainSelectedValue').and.callFake((): any => undefined));
        defineValue(field, '_getAppearanceStateValue', jasmine.createSpy('_getAppearanceStateValue').and.callFake((): any => undefined));

        return field as T;
    }

    function createForm(fields: PdfField[]): PdfForm {
        const form: any = {};
        Object.setPrototypeOf(form, PdfForm.prototype);

        defineGetter(form, 'count', () => fields.length);
        defineGetter(form, 'exportEmptyFields', () => false);
        defineValue(form, '_dictionary', createDictionary());

        defineValue(form, 'fieldAt', jasmine.createSpy('fieldAt').and.callFake((index: number) => fields[index]));
        defineValue(form, '_getFieldIndex', jasmine.createSpy('_getFieldIndex').and.callFake((name: string) => {
            return fields.findIndex((f: PdfField) => (f as any).name === name);
        }));

        return form as PdfForm;
    }

    function createAnnotation(annotationType?: number): PdfAnnotation {
        const annotation: any = {};
        Object.setPrototypeOf(annotation, PdfAnnotation.prototype);
        defineValue(annotation, '_dictionary', createDictionary());
        if (typeof annotationType !== 'undefined') {
            defineValue(annotation, '_type', annotationType);
        }
        return annotation as PdfAnnotation;
    }

    function createPopupAnnotationWithParent(): PdfPopupAnnotation {
        const popup: any = {};
        Object.setPrototypeOf(popup, PdfPopupAnnotation.prototype);
        defineValue(popup, '_dictionary', createDictionary({
            Parent: createDictionary()
        }));
        return popup as PdfPopupAnnotation;
    }

    function createAnnotationCollection(items: PdfAnnotation[]): PdfAnnotationCollection {
        const collection: any = {};
        Object.setPrototypeOf(collection, PdfAnnotationCollection.prototype);

        defineGetter(collection, 'count', () => items.length);
        defineValue(collection, 'at', jasmine.createSpy('at').and.callFake((index: number) => items[index]));

        return collection as PdfAnnotationCollection;
    }

    function createStream(dictionary: _PdfDictionary, raw: string, filtered?: string): _PdfBaseStream {
        const stream: any = {};
        Object.setPrototypeOf(stream, _PdfBaseStream.prototype);

        defineValue(stream, 'dictionary', dictionary);
        defineValue(stream, 'length', raw.length);
        defineValue(stream, 'getString', jasmine.createSpy('getString').and.callFake((hex?: boolean) => {
            if (hex) {
                return raw;
            }
            return typeof filtered === 'string' ? filtered : raw;
        }));

        return stream as _PdfBaseStream;
    }

    beforeEach(() => {
        crossReference = {
            _cacheMap: new Map<_PdfReference, _PdfDictionary>(),
            _fetch: jasmine.createSpy('_fetch').and.callFake((): any => undefined),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake(() => new _PdfReference(1, 0))
        };
        crossReference._root = new _PdfDictionary(crossReference);

        documentStub = {
            _crossReference: crossReference,
            pageCount: 0,
            getPage: jasmine.createSpy('getPage').and.callFake((): any => undefined),
            form: createForm([])
        };

        helper = new _XfdfDocument('sample.pdf');
        (helper as any)._crossReference = crossReference;
        (helper as any)._document = documentStub;

        spyOn(helper as any, '_getEncodedFontDictionary').and.returnValue(undefined);
        spyOn(helper as any, '_getEncodedValue').and.callFake((value: string) => `enc:${value}`);

        // IMPORTANT FIX:
        // Make mocked field dictionaries behave predictably for export APIs.
        spyOn(utils, '_getInheritableProperty').and.callFake((
            dictionary: _PdfDictionary,
            key: string,
            getArray?: boolean
        ): any => {
            if (!dictionary || typeof dictionary.has !== 'function' || !dictionary.has(key)) {
                return undefined;
            }
            return getArray ? dictionary.getArray(key) : dictionary.get(key);
        });
    });

    describe('_exportFormFieldsData', () => {
        it('should export empty text field when _exportEmptyFields is true (Tx else branch)', () => {
            const field: PdfTextBoxField = createField<PdfTextBoxField>(PdfTextBoxField, 'txtField', 'Tx');
            (helper as any)._exportEmptyFields = true;

            const result: string | string[] = (helper as any)._exportFormFieldsData(field);

            expect(result).toBe('');
            expect((helper as any)._table.get('txtField')).toBe('');
        });

        it('should export selected value from combo/list field through I entry when V is missing (Ch branch)', () => {
            const field: PdfComboBoxField = createField<PdfComboBoxField>(PdfComboBoxField, 'comboField', 'Ch');
            field._dictionary.update('I', [0]);
            (field as any)._obtainSelectedValue.and.returnValue('Choice-1');

            const result: string | string[] = (helper as any)._exportFormFieldsData(field);

            expect((field as any)._obtainSelectedValue).toHaveBeenCalled();
            expect(result).toBe('enc:Choice-1');
            expect((helper as any)._table.get('comboField')).toBe('enc:Choice-1');
        });

        it('should export array selected values for choice field (Ch array branch)', () => {
            const field: PdfListBoxField = createField<PdfListBoxField>(PdfListBoxField, 'listField', 'Ch');
            spyOn(helper as any, '_getExportValue').and.returnValue(['A', 'B']);
            field._dictionary.update('V', ['A', 'B']);

            const result: string | string[] = (helper as any)._exportFormFieldsData(field);

            expect(result).toEqual(['enc:A', 'enc:B']);
            expect((helper as any)._table.get('listField')).toEqual(['enc:A', 'enc:B']);
        });

        it('should export radio button text directly when selectedIndex is -1 even if Opt exists', () => {
            const field: PdfRadioButtonListField = createField<PdfRadioButtonListField>(PdfRadioButtonListField, 'radioField', 'Btn');
            field.selectedIndex = -1;
            field._dictionary.update('Opt', ['First', 'Second']);
            field._dictionary.update('V', _PdfName.get('OnValue'));

            spyOn(helper as any, '_getExportValue').and.returnValue('1');

            const result: string | string[] = (helper as any)._exportFormFieldsData(field);

            expect(result).toBe('enc:1');
            expect((helper as any)._table.get('radioField')).toBe('enc:1');
        });

        it('should export option text from Opt array and fallback index to 0 when Number(text) is NaN', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'btnField', 'Btn');
            field._dictionary.update('Opt', ['Zero', 'One']);
            field._dictionary.update('V', _PdfName.get('Custom'));
            spyOn(helper as any, '_getExportValue').and.returnValue('NaN-Index');

            (helper as any)._exportFormFieldsData(field);

            expect((helper as any)._table.get('btnField')).toBe('enc:Zero');
        });

        it('should export Off for checkbox/radio when value resolves to empty and _exportEmptyFields is false', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'checkField', 'Btn');
            field._dictionary.update('V', _PdfName.get('Off'));
            spyOn(helper as any, '_getExportValue').and.returnValue('');
            (helper as any)._exportEmptyFields = false;

            const result: string | string[] = (helper as any)._exportFormFieldsData(field);

            expect(result).toBe('Off');
            expect((helper as any)._table.get('checkField')).toBe('Off');
        });

        it('should export empty string from radio appearance state when V is missing and _exportEmptyFields is true', () => {
            const field: PdfRadioButtonListField = createField<PdfRadioButtonListField>(PdfRadioButtonListField, 'radioStateField', 'Btn');
            (field as any)._getAppearanceStateValue.and.returnValue('');
            (helper as any)._exportEmptyFields = true;

            const result: string | string[] = (helper as any)._exportFormFieldsData(field);

            expect(result).toBe('');
            expect((helper as any)._table.get('radioStateField')).toBe('');
        });

        it('should use field dictionary when widget is missing and export AS name', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'widgetLessField', 'Btn');
            (field as any).itemAt.and.returnValue(undefined);
            field._dictionary.update('AS', _PdfName.get('YesState'));

            const result: string | string[] = (helper as any)._exportFormFieldsData(field);

            expect(result).toBe('YesState');
            expect((helper as any)._table.get('widgetLessField')).toBe('YesState');
        });

        it('should export empty string when widget/dictionary has no AS and _exportEmptyFields is true', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'emptyASField', 'Btn');
            (field as any).itemAt.and.returnValue(undefined);
            (helper as any)._exportEmptyFields = true;

            const result: string | string[] = (helper as any)._exportFormFieldsData(field);

            expect(result).toBe('');
            expect((helper as any)._table.get('emptyASField')).toBe('');
        });
    });

    describe('_exportFormFieldData', () => {
        it('should export RV rich text and append form key when _asPerSpecification is true', () => {
            const field: PdfTextBoxField = createField<PdfTextBoxField>(PdfTextBoxField, 'richField', 'Tx');
            field._dictionary.update('RV', '<?xml version="1.0"?><body>rich</body>');
            (helper as any)._asPerSpecification = true;
            (helper as any)._key = '_FORM_KEY_';

            (helper as any)._exportFormFieldData(field);

            expect((helper as any)._formKey).toBe('_FORM_KEY_');
            expect((helper as any)._table.get('richField')).toBe('<?xml version="1.0"?><body>rich</body>_FORM_KEY_');
        });

        it('should normalize multiline text when _asPerSpecification is true and RV is absent', () => {
            const field: PdfTextBoxField = createField<PdfTextBoxField>(PdfTextBoxField, 'multiLineField', 'Tx');
            field.multiLine = true;
            field._dictionary.update('V', 'line1\nline2\rline3');
            (helper as any)._asPerSpecification = true;

            (helper as any)._exportFormFieldData(field);

            expect((helper as any)._table.get('multiLineField')).toBe('enc:line1line2\r\nline3');
        });

        it('should export array values from list field in specification mode', () => {
            const field: PdfListField = createField<PdfListField>(PdfListField, 'specList', 'Ch');
            field._dictionary.update('V', ['A', 'B']);
            (helper as any)._asPerSpecification = true;

            (helper as any)._exportFormFieldData(field);

            expect((helper as any)._table.get('specList')).toEqual(['A', 'B']);
        });

        it('should export array selected values for non-spec choice field', () => {
            const field: PdfComboBoxField = createField<PdfComboBoxField>(PdfComboBoxField, 'nonSpecCombo', 'Ch');
            field._dictionary.update('V', ['A', 'B']);
            spyOn(helper as any, '_getExportValue').and.returnValue(['One', 'Two']);

            (helper as any)._exportFormFieldData(field);

            expect((helper as any)._table.get('nonSpecCombo')).toEqual(['enc:One', 'enc:Two']);
        });

        it('should export empty value for non-spec choice field when _exportEmptyFields is true', () => {
            const field: PdfComboBoxField = createField<PdfComboBoxField>(PdfComboBoxField, 'emptyCombo', 'Ch');
            (helper as any)._exportEmptyFields = true;

            (helper as any)._exportFormFieldData(field);

            expect((helper as any)._table.get('emptyCombo')).toBe('');
        });

        it('should use radio appearance state when button V is missing and selected state is empty', () => {
            const field: PdfRadioButtonListField = createField<PdfRadioButtonListField>(PdfRadioButtonListField, 'buttonState', 'Btn');
            (field as any)._getAppearanceStateValue.and.returnValue('');
            (helper as any)._exportEmptyFields = false;

            (helper as any)._exportFormFieldData(field);

            expect((helper as any)._table.get('buttonState')).toBe('Off');
        });

        it('should use widget AS name when button V is missing and widget exists', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'widgetBtn', 'Btn');
            (field as any).itemAt.and.returnValue(createWidgetWithAppearanceState('MyAS'));

            (helper as any)._exportFormFieldData(field);

            expect((helper as any)._table.get('widgetBtn')).toBe('MyAS');
        });
    });

    describe('_replaceNotUsedCharacters', () => {
        it('should keep original character for ZapfDingbats Type1 special branch', () => {
            const structure: any = {
                differencesDictionary: new Map<string, string>([['é', 'X']]),
                _fontType: 'Type1',
                _baseFontEncoding: 'MacRomanEncoding',
                _fontEncoding: 'Encoding',
                _fontName: 'ZapfDingbats'
            };

            const result: string = (helper as any)._replaceNotUsedCharacters('é', structure);

            expect(result).toBe('é');
        });

        it('should replace with mapped difference when special branch does not apply', () => {
            const structure: any = {
                differencesDictionary: new Map<string, string>([['A', 'Z']]),
                _fontType: 'Type1',
                _baseFontEncoding: 'WinAnsiEncoding',
                _fontEncoding: 'Encoding',
                _fontName: 'Helvetica'
            };

            const result: string = (helper as any)._replaceNotUsedCharacters('A', structure);

            expect(result).toBe('Z');
        });
    });

    describe('_importField', () => {
        it('should update RV when rich text exists and then import field data', () => {
            const textField: PdfTextBoxField = createField<PdfTextBoxField>(PdfTextBoxField, 'field1', 'Tx');
            const form: PdfForm = createForm([textField]);
            documentStub.form = form;

            (helper as any)._document = documentStub;
            (helper as any)._fields = new Map<string, string[]>([['field1', ['plain-value']]]);
            (helper as any)._richTextValues = new Map<string, string>([['field1', '<body>rich-value</body>']]);

            const importSpy: jasmine.Spy = spyOn(helper as any, '_importFieldData').and.callThrough();

            (helper as any)._importField();

            expect(textField._dictionary.get('RV')).toBe('<body>rich-value</body>');
            expect(importSpy).toHaveBeenCalledWith(textField, ['plain-value']);
        });
    });

    describe('_importFieldData', () => {
        it('should split xml-import combo values and remove AP in specification mode', () => {
            const field: PdfComboBoxField = createField<PdfComboBoxField>(PdfComboBoxField, 'comboImport', 'Ch');
            (field as any)._options = [
                ['A', 'Display-A'],
                ['B', 'Display-B']
            ];
            field._dictionary.update('AP', createDictionary());
            (helper as any)._xmlImport = true;
            (helper as any)._asPerSpecification = true;

            (helper as any)._importFieldData(field, ['A,B']);

            expect(field.selectedIndex).toEqual([0, 1]);
            expect((field._dictionary as any)._map.AP).toBeUndefined();
            expect(field._dictionary._updated).toBeTruthy();
        });

        it('should set checkbox checked to true for yes/on and false otherwise', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'checkImport', 'Btn');
            spyOn(helper as any, '_containsExportValue').and.returnValue(false);

            (helper as any)._importFieldData(field, ['yes']);
            expect(field.checked).toBeTruthy();

            (helper as any)._importFieldData(field, ['off']);
            expect(field.checked).toBeFalsy();
        });

        it('should update radio selectedIndex only when matching value is found and index differs', () => {
            const field: PdfRadioButtonListField = createField<PdfRadioButtonListField>(PdfRadioButtonListField, 'radioImport', 'Btn');
            (field as any)._kidsCount = 2;
            field.selectedIndex = -1;

            const item0: any = { value: 'One' };
            const item1: any = { value: 'Two' };

            (field as any).itemAt.and.callFake((index: number) => index === 0 ? item0 : item1);

            (helper as any)._importFieldData(field, ['Two']);

            expect(field.selectedIndex).toBe(1);
        });
    });

    describe('_containsExportValue', () => {
        it('should return true and set _defaultIndex when matching child export value exists', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'childCheck', 'Btn');
            (field as any)._kidsCount = 1;
            const kid: any = { _dictionary: createDictionary() };
            (field as any).itemAt.and.returnValue(kid);

            spyOn(helper as any, '_checkSelected').and.returnValue(true);

            const result: boolean = (helper as any)._containsExportValue('Yes', field);

            expect(result).toBeTruthy();
            expect(field._defaultIndex).toBe(0);
        });

        it('should return true from Opt array when AS is Off/No in specification mode', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'specCheck', 'Btn');
            (field as any)._kidsCount = 0;
            field._dictionary.update('AS', _PdfName.get('Off'));
            field._dictionary.update('Opt', ['Export1', 'Export2']);
            (helper as any)._asPerSpecification = true;

            spyOn(helper as any, '_checkSelected').and.returnValue(false);

            const result: boolean = (helper as any)._containsExportValue('Export2', field);

            expect(result).toBeTruthy();
        });

        it('should return true when AS is not Off/No in specification mode and direct match is false', () => {
            const field: PdfCheckBoxField = createField<PdfCheckBoxField>(PdfCheckBoxField, 'asCheck', 'Btn');
            (field as any)._kidsCount = 0;
            field._dictionary.update('AS', _PdfName.get('YesState'));
            (helper as any)._asPerSpecification = true;

            spyOn(helper as any, '_checkSelected').and.returnValue(false);

            const result: boolean = (helper as any)._containsExportValue('Something', field);

            expect(result).toBeTruthy();
        });
    });

    describe('_save (annotation export filters)', () => {
        it('should skip popup annotations with Parent and export annotations when annotationTypes is empty', () => {
            const popup: PdfPopupAnnotation = createPopupAnnotationWithParent();
            const regular: PdfAnnotation = createAnnotation(10);
            const annotations: PdfAnnotationCollection = createAnnotationCollection([popup, regular]);

            const page: any = { annotations };
            documentStub.pageCount = 1;
            documentStub.getPage.and.callFake(() => page);

            (helper as any)._document = documentStub;
            (helper as any)._isAnnotationExport = true;
            (helper as any)._annotationTypes = [];

            const exportSpy: jasmine.Spy = spyOn(helper as any, '_exportAnnotationData');

            (helper as any)._save();

            expect(exportSpy).toHaveBeenCalledTimes(1);
            expect(exportSpy).toHaveBeenCalledWith(regular, jasmine.anything(), 0);
        });

        it('should export only matching annotation type when annotationTypes is provided', () => {
            const annotation: PdfAnnotation = createAnnotation(99);
            const annotations: PdfAnnotationCollection = createAnnotationCollection([annotation]);

            const page: any = { annotations };
            documentStub.pageCount = 1;
            documentStub.getPage.and.callFake(() => page);

            (helper as any)._document = documentStub;
            (helper as any)._isAnnotationExport = true;
            (helper as any)._annotationTypes = [99];

            const exportSpy: jasmine.Spy = spyOn(helper as any, '_exportAnnotationData');

            (helper as any)._save();

            expect(exportSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('_writeObject', () => {
        it('should write primitive array directly when dictionary does not contain the key (array else branch)', () => {
            const writer: any = jasmine.createSpyObj('_XmlWriter', [
                '_writeStartElement',
                '_writeAttributeString',
                '_writeEndElement'
            ]);
            const dictionary: _PdfDictionary = createDictionary();
            const arraySpy: jasmine.Spy = spyOn(helper as any, '_writeArray').and.callThrough();

            (helper as any)._writeObject(writer, ['A', 'B'], dictionary, 'MissingKey');

            expect(arraySpy).toHaveBeenCalled();
        });

        it('should write filtered DATA block for ToUnicode stream and escape angle brackets', () => {
            const writer: any = jasmine.createSpyObj('_XmlWriter', [
                '_writeStartElement',
                '_writeAttributeString',
                '_writeEndElement',
                '_writeRaw'
            ]);

            const streamDictionary: _PdfDictionary = createDictionary();
            const stream: _PdfBaseStream = createStream(streamDictionary, '4142', '<abc>');
            const appearanceDictionary: _PdfDictionary = createDictionary();

            (helper as any)._writeObject(writer, stream, appearanceDictionary, 'ToUnicode', false);

            expect((stream as any).getString).toHaveBeenCalled();
            expect(writer._writeAttributeString).toHaveBeenCalledWith('MODE', 'FILTERED');
            expect(writer._writeAttributeString).toHaveBeenCalledWith('ENCODING', 'ASCII');
            expect(writer._writeRaw).toHaveBeenCalledWith('&lt;abc&gt;');
        });

        it('should resolve reference and continue writing object content', () => {
            const writer: any = jasmine.createSpyObj('_XmlWriter', [
                '_writeStartElement',
                '_writeAttributeString',
                '_writeEndElement'
            ]);

            const reference: _PdfReference = createReference(true);
            const resolved: _PdfName = _PdfName.get('ResolvedName');

            crossReference._fetch.and.returnValue(resolved);
            (helper as any)._crossReference = crossReference;

            (helper as any)._writeObject(writer, reference, createDictionary(), 'RefKey');

            expect(crossReference._fetch).toHaveBeenCalledWith(reference);
            expect(writer._writeStartElement).toHaveBeenCalledWith('NAME');
            expect(writer._writeAttributeString).toHaveBeenCalledWith('VAL', 'ResolvedName');
        });
    });

    describe('_getFieldName (while loop)', () => {
        it('should build fully qualified field name without infinite loop', () => {
            const parser: DOMParser = new DOMParser();
            const xml: Document = parser.parseFromString(
                '<xfdf><fields><field name="parent"><field name="child"><field name="leaf" /></field></field></fields></xfdf>',
                'text/xml'
            );
            const node: Element = xml.getElementsByTagName('field')[2];

            const fieldName: string = (helper as any)._getFieldName(node);

            expect(fieldName).toBe('parent.child.leaf');
        });
    });

    describe('_addLineEndStyle', () => {
        it('should set LE with only head style when tail is missing', () => {
            const parser: DOMParser = new DOMParser();
            const xml: Document = parser.parseFromString('<line head="Square" />', 'text/xml');
            const element: Element = xml.documentElement;
            const dictionary: _PdfDictionary = createDictionary();

            (helper as any)._addLineEndStyle(dictionary, element);

            const result: _PdfName = dictionary.get('LE');
            expect(result.name).toBe('Square');
        });

        it('should set LE with only tail style when head is missing', () => {
            const parser: DOMParser = new DOMParser();
            const xml: Document = parser.parseFromString('<line tail="ClosedArrow" />', 'text/xml');
            const element: Element = xml.documentElement;
            const dictionary: _PdfDictionary = createDictionary();

            (helper as any)._addLineEndStyle(dictionary, element);

            const result: _PdfName = dictionary.get('LE');
            expect(result.name).toBe('ClosedArrow');
        });

        it('should set LE array when both head and tail are present', () => {
            const parser: DOMParser = new DOMParser();
            const xml: Document = parser.parseFromString('<line head="Square" tail="ClosedArrow" />', 'text/xml');
            const element: Element = xml.documentElement;
            const dictionary: _PdfDictionary = createDictionary();

            (helper as any)._addLineEndStyle(dictionary, element);

            const result: _PdfName[] = dictionary.getArray('LE');
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Square');
            expect(result[1].name).toBe('ClosedArrow');
        });
    });
});
``

describe('_XfdfDocument / _ExportHelper behavior coverage', () => {
    let helper: _XfdfDocument;

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            writable: true,
            value
        });
    }

    function defineGetter(target: any, key: string, getter: () => any): void {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get: getter
        });
    }

    function createDictionary(seed?: Record<string, any>): _PdfDictionary {
        const map: Record<string, any> = { ...(seed || {}) };
        const dict: any = Object.create(_PdfDictionary.prototype);

        defineValue(dict, '_map', map);
        defineValue(dict, '_updated', false);

        Object.defineProperty(dict, 'size', {
            configurable: true,
            enumerable: true,
            get: () => Object.keys(map).length
        });

        dict.has = jasmine.createSpy('has').and.callFake((key: string): boolean => {
            return Object.prototype.hasOwnProperty.call(map, key);
        });
        dict.get = jasmine.createSpy('get').and.callFake((key: string): any => map[key]);
        dict.getRaw = jasmine.createSpy('getRaw').and.callFake((key: string): any => map[key]);
        dict.getArray = jasmine.createSpy('getArray').and.callFake((key: string): any[] => map[key]);
        dict.set = jasmine.createSpy('set').and.callFake((key: string, value: any): void => {
            map[key] = value;
        });
        dict.update = jasmine.createSpy('update').and.callFake((key: string, value: any): void => {
            map[key] = value;
            dict._updated = true;
        });
        dict.forEach = jasmine.createSpy('forEach').and.callFake((callback: (key: string, value: any) => void): void => {
            Object.keys(map).forEach((key: string) => callback(key, map[key]));
        });

        return dict as _PdfDictionary;
    }

    function createReference(isNew: boolean = false): _PdfReference {
        const ref: any = Object.create(_PdfReference.prototype);
        defineValue(ref, '_isNew', isNew);
        return ref as _PdfReference;
    }

    function createCrossReference(rootSeed?: Record<string, any>): any {
        const xref: any = {
            _root: createDictionary(rootSeed || {}),
            _cacheMap: new Map<_PdfReference, any>()
        };

        xref._fetch = jasmine.createSpy('_fetch').and.callFake((reference: _PdfReference): any => {
            return xref._cacheMap.get(reference);
        });

        xref._getNextReference = jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
            return createReference(true);
        });

        return xref;
    }

    function createWriter(): any {
        return {
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeEndElement: jasmine.createSpy('_writeEndElement'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeString: jasmine.createSpy('_writeString'),
            _writeRaw: jasmine.createSpy('_writeRaw'),
            _writeElementString: jasmine.createSpy('_writeElementString')
        };
    }

    function createBaseStream(
        streamDictSeed?: Record<string, any>,
        rawData: string = '41424344',
        filteredData: string = 'stream<xml>'
    ): _PdfBaseStream {
        const stream: any = Object.create(_PdfBaseStream.prototype);

        defineValue(stream, 'dictionary', createDictionary(streamDictSeed || {}));

        Object.defineProperty(stream, 'length', {
            configurable: true,
            enumerable: true,
            get: () => rawData.length / 2
        });

        stream.getString = jasmine.createSpy('getString').and.callFake((isRaw?: boolean): string => {
            return isRaw ? rawData : filteredData;
        });

        stream.getBytes = jasmine.createSpy('getBytes').and.callFake((): Uint8Array => {
            return new Uint8Array([0x41, 0x42, 0x43, 0x44]);
        });

        return stream as _PdfBaseStream;
    }

    function createTextBoxField(name: string, value?: string, multiLine: boolean = false): PdfTextBoxField {
        const field: any = Object.create(PdfTextBoxField.prototype);
        defineGetter(field, 'name', () => name);
        defineValue(field, 'export', true);
        defineValue(field, 'readOnly', false);
        defineValue(field, 'multiLine', multiLine);
        defineValue(field, '_dictionary', createDictionary({
            FT: _PdfName.get('Tx'),
            V: value
        }));
        return field as PdfTextBoxField;
    }

    function createListField(name: string, value: any, hasI: boolean, selectedValue: string | string[]): PdfListField {
        const seed: Record<string, any> = { FT: _PdfName.get('Ch') };
        if (typeof value !== 'undefined') {
            seed.V = value;
        }
        if (hasI) {
            seed.I = [0];
        }

        const field: any = Object.create(PdfListField.prototype);
        defineGetter(field, 'name', () => name);
        defineValue(field, 'export', true);
        defineValue(field, 'readOnly', false);
        defineValue(field, '_dictionary', createDictionary(seed));
        defineValue(field, '_options', [['A', 'A'], ['B', 'B']]);
        field._obtainSelectedValue = jasmine.createSpy('_obtainSelectedValue').and.callFake(() => selectedValue);
        return field as PdfListField;
    }

    function createListBoxField(name: string, value: any, hasI: boolean, selectedValue: string | string[]): PdfListBoxField {
        const seed: Record<string, any> = { FT: _PdfName.get('Ch') };
        if (typeof value !== 'undefined') {
            seed.V = value;
        }
        if (hasI) {
            seed.I = [0];
        }

        const field: any = Object.create(PdfListBoxField.prototype);
        defineGetter(field, 'name', () => name);
        defineValue(field, 'export', true);
        defineValue(field, 'readOnly', false);
        defineValue(field, '_dictionary', createDictionary(seed));
        defineValue(field, '_options', [['A', 'A'], ['B', 'B'], ['C', 'C']]);
        field._obtainSelectedValue = jasmine.createSpy('_obtainSelectedValue').and.callFake(() => selectedValue);
        return field as PdfListBoxField;
    }

    function createComboBoxField(name: string, value: any, hasI: boolean, selectedValue: string | string[]): PdfComboBoxField {
        const seed: Record<string, any> = { FT: _PdfName.get('Ch') };
        if (typeof value !== 'undefined') {
            seed.V = value;
        }
        if (hasI) {
            seed.I = [0];
        }
        seed.AP = createDictionary({ N: createDictionary() });

        const field: any = Object.create(PdfComboBoxField.prototype);
        defineGetter(field, 'name', () => name);
        defineValue(field, 'export', true);
        defineValue(field, 'readOnly', false);
        defineValue(field, '_dictionary', createDictionary(seed));
        defineValue(field, '_options', [['A', 'A'], ['B', 'B'], ['C', 'C']]);
        field._obtainSelectedValue = jasmine.createSpy('_obtainSelectedValue').and.callFake(() => selectedValue);
        return field as PdfComboBoxField;
    }

    function createRadioField(name: string, v: any, selectedIndex: number, options?: string[]): PdfRadioButtonListField {
        const seed: Record<string, any> = {
            FT: _PdfName.get('Btn'),
            V: v
        };
        if (options) {
            seed.Opt = options;
        }

        const field: any = Object.create(PdfRadioButtonListField.prototype);
        defineGetter(field, 'name', () => name);
        defineValue(field, 'export', true);
        defineValue(field, 'readOnly', false);
        defineValue(field, 'selectedIndex', selectedIndex);
        defineValue(field, '_kidsCount', 2);
        defineValue(field, '_dictionary', createDictionary(seed));

        field.itemAt = jasmine.createSpy('itemAt').and.callFake((index: number): PdfRadioButtonListItem => {
            const item: any = Object.create(PdfRadioButtonListItem.prototype);
            defineValue(item, 'value', index === 0 ? 'Yes' : 'No');
            return item as PdfRadioButtonListItem;
        });

        field._getAppearanceStateValue = jasmine.createSpy('_getAppearanceStateValue').and.callFake(() => '');
        return field as PdfRadioButtonListField;
    }

    function createCheckBoxField(name: string): PdfCheckBoxField {
        const field: any = Object.create(PdfCheckBoxField.prototype);
        defineGetter(field, 'name', () => name);
        defineValue(field, 'export', true);
        defineValue(field, 'readOnly', false);
        defineValue(field, '_kidsCount', 0);
        defineValue(field, '_defaultIndex', 0);
        defineValue(field, '_dictionary', createDictionary({
            FT: _PdfName.get('Btn')
        }));
        return field as PdfCheckBoxField;
    }

    beforeEach(() => {
        helper = new _XfdfDocument('test.pdf');
        defineValue(helper as any, '_table', new Map<string, any>());
        defineValue(helper as any, '_fields', new Map<string, string[]>());
        defineValue(helper as any, '_richTextValues', new Map<string, string>());
        defineValue(helper as any, '_crossReference', createCrossReference());
        defineValue(helper as any, '_document', {
            _allowImportCustomData: true,
            form: {
                _dictionary: createDictionary(),
                count: 0
            }
        });
        defineValue(helper as any, '_asPerSpecification', false);
        defineValue(helper as any, '_exportEmptyFields', false);
        defineValue(helper as any, '_format', 'XFDF');

        // Mock _getInheritableProperty for field dictionary access
        spyOn(utils, '_getInheritableProperty').and.callFake((
            dictionary: _PdfDictionary,
            key: string,
            getArray?: boolean
        ): any => {
            if (!dictionary || typeof dictionary.has !== 'function' || !dictionary.has(key)) {
                return undefined;
            }
            return getArray ? dictionary.getArray(key) : dictionary.get(key);
        });
    });

    describe('_exportFormFieldData()', () => {
        it('should export Tx value in non-spec mode and encode the value', () => {
            const field = createTextBoxField('txField', 'hello');
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
            spyOn<any>(helper, '_getEncodedValue').and.callFake((value: string) => `enc:${value}`);

            (helper as any)._asPerSpecification = false;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('txField')).toBe('enc:hello');
        });

        it('should export empty Tx value in non-spec mode when exportEmptyFields is true', () => {
            const field = createTextBoxField('emptyTx', undefined);
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);

            (helper as any)._asPerSpecification = false;
            (helper as any)._exportEmptyFields = true;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('emptyTx')).toBe('');
        });

        it('should export Ch array value in spec mode for PdfListField', () => {
            const field = createListField('listArray', ['A', 'B'], false, []);
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);

            (helper as any)._asPerSpecification = true;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('listArray')).toEqual(['A', 'B']);
        });

        it('should export Ch string value in spec mode for PdfListField after encoding', () => {
            const field = createListField('listString', 'A', false, []);
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
            spyOn<any>(helper, '_getEncodedValue').and.callFake((value: string) => `enc:${value}`);

            (helper as any)._asPerSpecification = true;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('listString')).toBe('enc:A');
        });

        it('should export Ch selected values from I entry in spec mode for PdfListField', () => {
            const field = createListField('listFromIndex', undefined, true, ['A', 'B']);
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
            spyOn<any>(helper, '_getEncodedValue').and.callFake((value: string) => `enc:${value}`);

            (helper as any)._asPerSpecification = true;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('listFromIndex')).toEqual(['enc:A', 'enc:B']);
        });

        it('should export Ch selected value from I entry in non-spec mode for PdfListBoxField', () => {
            const field = createListBoxField('lb', undefined, true, 'B');
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
            spyOn<any>(helper, '_getExportValue').and.returnValue(undefined);
            spyOn<any>(helper, '_getEncodedValue').and.callFake((value: string) => `enc:${value}`);

            (helper as any)._asPerSpecification = false;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('lb')).toBe('enc:B');
        });

        it('should export Ch selected array from I entry in non-spec mode for PdfComboBoxField', () => {
            const field = createComboBoxField('cb', undefined, true, ['A', 'C']);
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
            spyOn<any>(helper, '_getExportValue').and.returnValue(undefined);
            spyOn<any>(helper, '_getEncodedValue').and.callFake((value: string) => `enc:${value}`);

            (helper as any)._asPerSpecification = false;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('cb')).toEqual(['enc:A', 'enc:C']);
        });

        it('should export empty Ch value in non-spec mode when exportEmptyFields is true', () => {
            const field = createListBoxField('emptyCh', undefined, false, '');
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
            spyOn<any>(helper, '_getExportValue').and.returnValue(undefined);

            (helper as any)._asPerSpecification = false;
            (helper as any)._exportEmptyFields = true;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('emptyCh')).toBe('');
        });

        it('should export Btn using radio selectedIndex path and fallback index=0 when Number(text) is NaN', () => {
            const field = createRadioField('radio1', 'not-a-number', 1, ['Zero', 'One']);
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
            spyOn<any>(helper, '_getExportValue').and.returnValue('not-a-number');
            spyOn<any>(helper, '_getEncodedValue').and.callFake((value: string) => `enc:${value}`);

            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('radio1')).toBe('enc:One');
        });

        it('should export Btn checkbox/radio Off when exportEmptyFields is false', () => {
            const field = createCheckBoxField('check1');
            (field as any)._dictionary.update('V', '');
            spyOn<any>(helper, '_getEncodedFontDictionary').and.returnValue(undefined);
            spyOn<any>(helper, '_getExportValue').and.returnValue('');

            (helper as any)._exportEmptyFields = false;
            helper._exportFormFieldData(field);

            expect((helper as any)._table.get('check1')).toBe('Off');
        });
    });

    describe('_getEncodedValue()', () => {
        it('should use existing _encodeDictionary and call _replaceNotUsedCharacters', () => {
            const fakeEncode = createDictionary({
                Subtype: _PdfName.get('Type1'),
                Encoding: createDictionary({ Differences: [65, _PdfName.get('A')] })
            });
            (helper as any)._encodeDictionary = fakeEncode;
            spyOn<any>(helper, '_replaceNotUsedCharacters').and.returnValue('ENCODED');

            const result = helper._getEncodedValue('A');

            expect(result).toBe('ENCODED');
            expect((helper as any)._replaceNotUsedCharacters).toHaveBeenCalled();
        });

        it('should build encode dictionary from root DR/Encoding/PDFDocEncoding/Differences and cache it', () => {
            const pdfDocEncoding = createDictionary({
                Differences: [65, _PdfName.get('A')]
            });
            const encoding = createDictionary({
                PDFDocEncoding: pdfDocEncoding
            });
            const dr = createDictionary({
                Encoding: encoding
            });
            const formDictionary = createDictionary({
                DR: dr
            });
            const xref = createCrossReference();

            (helper as any)._crossReference = xref;
            (helper as any)._document = {
                form: {
                    _dictionary: formDictionary
                }
            };

            spyOn<any>(helper, '_replaceNotUsedCharacters').and.returnValue('FROM_ROOT');

            const result = helper._getEncodedValue('A');

            expect(result).toBe('FROM_ROOT');
            expect((helper as any)._encodeDictionary).toBeDefined();
            expect(xref._cacheMap.size).toBeGreaterThan(0);
        });

        it('should resolve direct child font dictionary and invoke replacement path', () => {
            const fontDict = createDictionary({
                Subtype: _PdfName.get('Type1'),
                Encoding: createDictionary({ Differences: [65, _PdfName.get('A')] })
            });
            const fonts = createDictionary({
                F1: fontDict
            });

            spyOn<any>(helper, '_replaceNotUsedCharacters').and.returnValue('DIRECT_FONT');

            const result = helper._getEncodedValue('A', fonts);

            expect((helper as any)._replaceNotUsedCharacters).toHaveBeenCalled();
            // Current implementation falls through and returns original text after dictionary loop.
            expect(result).toBe('A');
        });

        it('should resolve referenced font dictionary and invoke replacement path', () => {
            const fontRef = createReference(false);
            const fontDict = createDictionary({
                Subtype: _PdfName.get('Type1'),
                Encoding: createDictionary({ Differences: [65, _PdfName.get('A')] })
            });

            const xref = createCrossReference();
            xref._cacheMap.set(fontRef, fontDict);
            (helper as any)._crossReference = xref;

            const fonts = createDictionary({
                F1: fontRef
            });

            spyOn<any>(helper, '_replaceNotUsedCharacters').and.returnValue('REF_FONT');

            const result = helper._getEncodedValue('A', fonts);

            expect(xref._fetch).toHaveBeenCalledWith(fontRef);
            expect((helper as any)._replaceNotUsedCharacters).toHaveBeenCalled();
            expect(result).toBe('A');
        });

        it('should return undefined from dictionary loop branch when dictionary has no usable font entry', () => {
            const fonts = createDictionary({
                F1: 123
            });

            const result = helper._getEncodedValue('A', fonts);

            expect(result as any).toBeUndefined();
        });
    });

    describe('_writeFieldName()', () => {
        it('should write normal <value> when value does not end with _formKey', () => {
            const writer = createWriter();
            const nested = new Map<any, any>();
            nested.set('child', 'plain-text');
            (helper as any)._formKey = '__FORMKEY__';

            helper._writeFieldName(nested, writer);

            expect(writer._writeStartElement).toHaveBeenCalledWith('field');
            expect(writer._writeAttributeString).toHaveBeenCalledWith('name', 'child');
            expect(writer._writeStartElement).toHaveBeenCalledWith('value');
            expect(writer._writeString).toHaveBeenCalledWith('plain-text');
        });
    });

    describe('_writeAnnotationData() / _writeDictionary()', () => {
        it('should set _skipBorderStyle when both BE and BS exist and BE.S is available', () => {
            const writer = createWriter();
            const be = createDictionary({ S: _PdfName.get('C') });
            const bs = createDictionary({ Type: _PdfName.get('Border'), S: _PdfName.get('S') });
            const annotationDict = createDictionary({
                Subtype: _PdfName.get('Square'),
                BE: be,
                BS: bs
            });

            spyOn<any>(helper, '_writeDictionary').and.callThrough();

            helper._writeAnnotationData(writer, 0, annotationDict);

            expect((helper as any)._skipBorderStyle).toBeTruthy();
            expect((helper as any)._writeDictionary).toHaveBeenCalled();
        });

        it('should write vertices, inklist, popup, DA, DS, RC and contents branches', () => {
            const writer = createWriter();
            const popup = createDictionary({
                Subtype: _PdfName.get('Popup')
            });
            const dict = createDictionary({
                Subtype: _PdfName.get('Ink'),
                Vertices: [1, 2, 3, 4],
                InkList: [[10, 20, 30, 40]],
                Popup: popup,
                DA: '/Helv 10 Tf 0 g',
                DS: 'font: Helvetica 10pt;',
                RC: '<x><body>rich text</body></x>',
                Contents: 'plain contents'
            });

            spyOn<any>(helper, '_writeAnnotationData').and.callThrough();
            spyOn<any>(helper, '_writeRawData').and.callThrough();

            helper._writeDictionary(dict, 0, writer, false);

            expect(writer._writeStartElement).toHaveBeenCalledWith('vertices');
            expect(writer._writeRaw).toHaveBeenCalledWith('1,2;3,4');
            expect(writer._writeStartElement).toHaveBeenCalledWith('inklist');
            expect(writer._writeElementString).toHaveBeenCalledWith('gesture', '10,20,30,40');
            expect((helper as any)._writeAnnotationData).toHaveBeenCalledWith(writer, 0, popup);
            expect((helper as any)._writeRawData).toHaveBeenCalledWith(writer, 'defaultappearance', '/Helv 10 Tf 0 g');
            expect((helper as any)._writeRawData).toHaveBeenCalledWith(writer, 'defaultstyle', 'font: Helvetica 10pt;');
            expect((helper as any)._writeRawData).toHaveBeenCalledWith(writer, 'contents-richtext', '<body>rich text</body></x>');
            expect(writer._writeStartElement).toHaveBeenCalledWith('contents');
            expect(writer._writeString).toHaveBeenCalledWith('plain contents');
        });
    });

    describe('_writeObject()', () => {
        it('should do nothing when primitive is undefined', () => {
            const writer = createWriter();
            const dict = createDictionary();

            helper._writeObject(writer, undefined, dict, 'K');

            expect(writer._writeStartElement).not.toHaveBeenCalled();
            expect(writer._writeAttributeString).not.toHaveBeenCalled();
        });

        it('should compress stream when new reference is used and stream is not DCTDecode/Form', () => {
            const writer = createWriter();
            const dict = createDictionary();
            const stream = createBaseStream(
                { Filter: _PdfName.get('FlateDecode') },
                '41424344',
                'plain-stream'
            );

            spyOn(utils, '_compressStream').and.returnValue('COMPRESSED_HEX');

            helper._writeObject(writer, stream, dict, 'XObject', true);

            expect(utils._compressStream).toHaveBeenCalled();
            expect(writer._writeStartElement).toHaveBeenCalledWith('STREAM');
            expect(writer._writeStartElement).toHaveBeenCalledWith('DATA');
            expect(writer._writeAttributeString).toHaveBeenCalledWith('MODE', 'RAW');
            expect(writer._writeAttributeString).toHaveBeenCalledWith('ENCODING', 'HEX');
            expect(writer._writeRaw).toHaveBeenCalledWith('COMPRESSED_HEX');
        });
    });

    describe('_checkXfdf() / _parseFormData() / _importFormNodes() / _getFieldName()', () => {
        it('should throw for invalid XFDF root element', () => {
            const xml = new DOMParser().parseFromString('<not-xfdf />', 'text/xml');

            expect(() => helper._checkXfdf(xml.documentElement as any)).toThrowError('Invalid XFDF file.');
        });

        it('should parse file name and ids and import only field child nodes', () => {
            const xml = `
                <xfdf>
                    <f href="sample.pdf"></f>
                    <ids original="" modified=""></ids>
                    <fields>
                        <field name="Parent">
                            <field name="Child">
                                <value>Text1</value>
                            </field>
                        </field>
                        <ignored />
                    </fields>
                </xfdf>
            `;
            const root = new DOMParser().parseFromString(xml, 'text/xml').documentElement;
            spyOn(helper, '_importField').and.stub();

            helper._parseFormData(root as any);

            expect((helper as any)._fileName).toBe('sample.pdf');
            expect((helper as any)._asPerSpecification).toBeTruthy();
            expect((helper as any)._fields.get('Parent.Child')).toEqual(['Text1']);
            expect(helper._importField).toHaveBeenCalled();
        });

        it('should ignore non-field node in _importFormNodes()', () => {
            const xml = `
                <fields>
                    <notfield />
                    <field name="A">
                        <value>1</value>
                    </field>
                </fields>
            `;
            const doc = new DOMParser().parseFromString(xml, 'text/xml');
            const list = Array.from(doc.documentElement.children) as Element[];

            helper._importFormNodes(list);

            expect((helper as any)._fields.get('A')).toEqual(['1']);
            expect((helper as any)._fields.has('notfield')).toBeFalsy();
        });

        it('should build field name using localName when name attribute is absent and terminate safely', () => {
            const xml = `
                <fields>
                    <field name="Parent">
                        <field>
                            <value>v</value>
                        </field>
                    </field>
                </fields>
            `;
            const doc = new DOMParser().parseFromString(xml, 'text/xml');
            const unnamedField = doc.getElementsByTagName('field')[1];

            const result = helper._getFieldName(unnamedField);

            expect(result).toBe('Parent.field');
        });

        it('should read value-richtext and preserve _richTextValues', () => {
            const xml = `
                <fields>
                    <field name="Rich">
                        <value-richtext><body><p>R1</p><p>R2</p></body></value-richtext>
                    </field>
                </fields>
            `;
            const doc = new DOMParser().parseFromString(xml, 'text/xml');
            const fields = Array.from(doc.getElementsByTagName('field')) as Element[];

            helper._importFormNodes(fields);

            expect((helper as any)._fields.get('Rich')).toEqual(['R1\rR2']);
            expect((helper as any)._richTextValues.has('Rich')).toBeTruthy();
        });
    });

    describe('_parseAnnotationData() / _getAnnotationDictionary()', () => {
        it('should add annotation popup ref and clear comments when popup exists', () => {
            const popupRef = createReference(false);
            const annotationDictionary = createDictionary({
                Popup: createDictionary({})
            });
            (annotationDictionary as any).getRaw = jasmine.createSpy('getRaw').and.callFake((key: string): any => {
                return key === 'Popup' ? popupRef : annotationDictionary.get(key);
            });

            const pageDictionary = createDictionary();

            const parsedAnnotation: any = Object.create(PdfAnnotation.prototype);

            const annotations: any = {
                _annotations: [],
                _comments: [1],
                _parsedAnnotations: new Map<number, any>(),
                _parseAnnotation: jasmine.createSpy('_parseAnnotation').and.callFake(() => parsedAnnotation)
            };

            const page: any = {
                annotations,
                _pageDictionary: pageDictionary
            };

            const xref = createCrossReference();
            const ref = createReference(false);
            xref._getNextReference.and.callFake(() => ref);

            (helper as any)._crossReference = xref;
            (helper as any)._document = {
                pageCount: 1,
                getPage: jasmine.createSpy('getPage').and.callFake(() => page)
            };

            spyOn<any>(helper, '_getAnnotationDictionary').and.returnValue(annotationDictionary);
            spyOn<any>(helper, '_handlePopup').and.stub();
            spyOn<any>(helper, '_addReferenceToGroup').and.stub();

            const xml = `<square page="0"></square>`;
            const element = new DOMParser().parseFromString(xml, 'text/xml').documentElement;

            helper._parseAnnotationData(element);

            expect(annotations._annotations.length).toBe(2);
            expect(annotations._annotations[1]).toBe(popupRef);
            expect(annotations._comments).toEqual([]);
            expect(pageDictionary.get('Annots')).toEqual(annotations._annotations);
            expect((helper as any)._handlePopup).toHaveBeenCalled();
        });

        it('should create line annotation dictionary with valid L points when start/end are present', () => {
            const page: any = {};
            const element = new DOMParser()
                .parseFromString(`<line start="1,2" end="3,4"></line>`, 'text/xml')
                .documentElement;

            spyOn<any>(helper, '_addLineEndStyle').and.stub();
            spyOn<any>(helper, '_addAnnotationData').and.callFake((_dict: _PdfDictionary) => {
                // preserve line point branch coverage and skip unrelated heavy internal work
            });

            const dict = helper._getAnnotationDictionary(page, element);

            expect(dict.get('Subtype').name).toBe('Line');
            expect(dict.get('L')).toEqual([1, 2, 3, 4]);
        });
    });

    describe('_addData() / _addSound() / _addMeasureDetails()', () => {
        it('should route Sound subtype data to _addSound()', () => {
            const dictionary = createDictionary({
                Subtype: _PdfName.get('Sound')
            });
            const parent = {} as any;
            const raw = new Uint8Array([1, 2, 3]);
            const child = new DOMParser().parseFromString('<data />', 'text/xml').documentElement;
            child.textContent = '010203';

            spyOn(utils, '_hexStringToByteArray').and.returnValue(raw);
            spyOn<any>(helper, '_addSound').and.stub();
            spyOn<any>(helper, '_addFileAttachment').and.stub();

            const addData: any = (helper as any)._addData;
            if (typeof addData === 'function') {
                addData.call(helper, child, dictionary, parent);
            } else {
                const host = new DOMParser().parseFromString(`<sound><data>010203</data></sound>`, 'text/xml').documentElement;
                (helper as any)._parseInnerElements(dictionary, host, parent);
            }

            expect((helper as any)._addSound).toHaveBeenCalled();
            expect((helper as any)._addFileAttachment).not.toHaveBeenCalled();
        });

        it('should add sound dictionary properties for bits/rate/channels/encoding/filter', () => {
            const dictionary = createDictionary();
            const element = new DOMParser().parseFromString(
                `<sound bits="16" rate="44100" channels="2" encoding="Raw" filter="FlateDecode"></sound>`,
                'text/xml'
            ).documentElement;
            const raw = new Uint8Array([1, 2, 3, 4]);

            const xref = createCrossReference();
            (helper as any)._crossReference = xref;

            (helper as any)._addSound(dictionary, element, raw);

            const soundRef = dictionary.get('Sound') as _PdfReference;
            const soundStream: any = xref._cacheMap.get(soundRef);

            expect(soundStream.dictionary.get('Type').name).toBe('Sound');
            expect(soundStream.dictionary.get('B')).toBe(16);
            expect(soundStream.dictionary.get('R')).toBe(44100);
            expect(soundStream.dictionary.get('C')).toBe(2);
            expect(soundStream.dictionary.get('E').name).toBe('Raw');
            expect(soundStream.dictionary.get('Filter').name).toBe('FlateDecode');
        });

        it('should add rt / rd / ss attributes into measurement detail dictionary', () => {
            const element = new DOMParser()
                .parseFromString(`<x rt="0.01" rd="0.01" ss="cm"></x>`, 'text/xml')
                .documentElement;

            const dict = createDictionary();

            (helper as any)._addElements(element, dict);

            expect(dict.get('RT')).toBe('0.01');
            expect(dict.get('RD')).toBe('0.01');
            expect(dict.get('SS')).toBe('cm');
        });
    });
});

describe('_FontStructure differences dictionary behavior', () => {
    function createDictionary(seed?: Record<string, any>): _PdfDictionary {
        const map: Record<string, any> = { ...(seed || {}) };
        const dict: any = Object.create(_PdfDictionary.prototype);
        dict._map = map;
        dict._updated = false;
        Object.defineProperty(dict, 'size', {
            configurable: true,
            enumerable: true,
            get: () => Object.keys(map).length
        });
        dict.has = jasmine.createSpy('has').and.callFake((key: string): boolean => {
            return Object.prototype.hasOwnProperty.call(map, key);
        });
        dict.get = jasmine.createSpy('get').and.callFake((key: string): any => map[key]);
        dict.getArray = jasmine.createSpy('getArray').and.callFake((key: string): any[] => map[key]);
        dict.set = jasmine.createSpy('set').and.callFake((key: string, value: any): void => {
            map[key] = value;
        });
        dict.update = jasmine.createSpy('update').and.callFake((key: string, value: any): void => {
            map[key] = value;
        });
        dict.forEach = jasmine.createSpy('forEach').and.callFake((callback: (key: string, value: any) => void): void => {
            Object.keys(map).forEach((key: string) => callback(key, map[key]));
        });
        return dict as _PdfDictionary;
    }

    it('should cover Type1 + .notdef branch in differences dictionary creation', () => {
        const encoding = createDictionary({
            Differences: [65, _PdfName.get('.notdef')]
        });
        const fontDict = createDictionary({
            Subtype: _PdfName.get('Type1'),
            Encoding: encoding
        });

        const structure = new _FontStructure(fontDict);

        expect(structure.differencesDictionary.has('65')).toBeTruthy();
    });
});
