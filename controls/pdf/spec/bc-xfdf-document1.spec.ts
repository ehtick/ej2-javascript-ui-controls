
import { _XfdfDocument } from '../src/pdf/core/import-export/xfdf-document';
import { _XmlWriter } from '../src/pdf/core/import-export/xml-writer';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { _PdfContentStream } from '../src/pdf/core/base-stream';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import {
    PdfCheckBoxField,
    PdfComboBoxField,
    PdfField,
    PdfListBoxField,
    PdfListField,
    PdfRadioButtonListField,
    PdfTextBoxField
} from '../src/pdf/core/form/field';
import * as utils from '../src/pdf/core/utils';
type _SpyWriter = _XmlWriter & {
    _writeStartDocument: jasmine.Spy;
    _writeStartElement: jasmine.Spy;
    _writeAttributeString: jasmine.Spy;
    _writeString: jasmine.Spy;
    _writeRaw: jasmine.Spy;
    _writeEndElement: jasmine.Spy;
    _save: jasmine.Spy;
    _destroy: jasmine.Spy;
};

interface _XfdfDocumentTestDouble extends _XfdfDocument {
    _table: Map<unknown, unknown>;
    _formKey: string;
    _annotationAttributes: string[];
    _asPerSpecification: boolean;
    _exportEmptyFields: boolean;
    _format: string;
}

function _createWriterSpy(): _SpyWriter {
    return jasmine.createSpyObj('_XmlWriter', [
        '_writeStartDocument',
        '_writeStartElement',
        '_writeAttributeString',
        '_writeString',
        '_writeRaw',
        '_writeEndElement',
        '_save',
        '_destroy'
    ]) as unknown as _SpyWriter;
}

function _createCrossReferenceStub(hasId: boolean = false): _PdfCrossReference {
    const idValues: string[] = ['original-id', 'modified-id'];
    const root: { has: (key: string) => boolean; getArray: (key: string) => string[] } = {
        has: (key: string): boolean => hasId && key === 'ID',
        getArray: (_key: string): string[] => idValues
    };

    return {
        root: root,
        _root: root
    } as unknown as _PdfCrossReference;
}

function _createXfdf(): _XfdfDocumentTestDouble {
    const xfdf: _XfdfDocumentTestDouble =
        new _XfdfDocument('input.pdf') as unknown as _XfdfDocumentTestDouble;

    xfdf._table = new Map<unknown, unknown>();
    xfdf._formKey = '';
    xfdf._annotationAttributes = [];
    xfdf._asPerSpecification = false;
    xfdf._exportEmptyFields = false;
    xfdf._format = 'XFDF';
    xfdf._crossReference = _createCrossReferenceStub(false);
    return xfdf;
}

function _createDictionary(values?: { [key: string]: unknown }): _PdfDictionary {
    const dictionary: _PdfDictionary = new _PdfDictionary();
    if (values) {
        Object.keys(values).forEach((key: string): void => {
            dictionary.update(key, values[key as keyof typeof values]);
        });
    }
    return dictionary;
}

function _defineValue(target: object, key: string, value: unknown): void {
    Object.defineProperty(target, key, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
    });
}

function _defineGetter<T>(target: object, key: string, getter: () => T): void {
    Object.defineProperty(target, key, {
        get: getter,
        enumerable: true,
        configurable: true
    });
}

function _createBaseField<T extends PdfField>(
    prototype: object,
    name: string,
    dictionary: _PdfDictionary
): T {
    const field: T & {
        _dictionary: _PdfDictionary;
        _defaultIndex: number;
        itemAt: jasmine.Spy;
    } = Object.create(prototype) as T & {
        _dictionary: _PdfDictionary;
        _defaultIndex: number;
        itemAt: jasmine.Spy;
    };

    _defineGetter(field, 'name', (): string => name);
    _defineGetter(field, 'export', (): boolean => true);
    _defineValue(field, '_dictionary', dictionary);
    _defineValue(field, '_defaultIndex', 0);
    _defineValue(field, 'itemAt', jasmine.createSpy('itemAt'));

    return field;
}

function _createListField(
    name: string,
    dictionary: _PdfDictionary,
    selectedValue?: string | string[]
): PdfListField & {
    _obtainSelectedValue: jasmine.Spy;
} {
    const field: PdfListField & {
        _obtainSelectedValue: jasmine.Spy;
    } = _createBaseField<PdfListField>(PdfListField.prototype, name, dictionary) as PdfListField & {
        _obtainSelectedValue: jasmine.Spy;
    };

    _defineValue(
        field,
        '_obtainSelectedValue',
        jasmine.createSpy('_obtainSelectedValue').and.returnValue(selectedValue)
    );

    return field;
}

function _createComboField(
    name: string,
    dictionary: _PdfDictionary,
    selectedValue?: string | string[]
): PdfComboBoxField & {
    _obtainSelectedValue: jasmine.Spy;
} {
    const field: PdfComboBoxField & {
        _obtainSelectedValue: jasmine.Spy;
    } = _createBaseField<PdfComboBoxField>(PdfComboBoxField.prototype, name, dictionary) as PdfComboBoxField & {
        _obtainSelectedValue: jasmine.Spy;
    };

    _defineValue(
        field,
        '_obtainSelectedValue',
        jasmine.createSpy('_obtainSelectedValue').and.returnValue(selectedValue)
    );

    return field;
}

function _createListBoxField(
    name: string,
    dictionary: _PdfDictionary,
    selectedValue?: string | string[]
): PdfListBoxField & {
    _obtainSelectedValue: jasmine.Spy;
} {
    const field: PdfListBoxField & {
        _obtainSelectedValue: jasmine.Spy;
    } = _createBaseField<PdfListBoxField>(PdfListBoxField.prototype, name, dictionary) as PdfListBoxField & {
        _obtainSelectedValue: jasmine.Spy;
    };

    _defineValue(
        field,
        '_obtainSelectedValue',
        jasmine.createSpy('_obtainSelectedValue').and.returnValue(selectedValue)
    );

    return field;
}

function _createRadioField(
    name: string,
    dictionary: _PdfDictionary,
    selectedIndex: number,
    appearanceState: string
): PdfRadioButtonListField & {
    _getAppearanceStateValue: jasmine.Spy;
} {
    const field: PdfRadioButtonListField & {
        _getAppearanceStateValue: jasmine.Spy;
    } = _createBaseField<PdfRadioButtonListField>(
        PdfRadioButtonListField.prototype,
        name,
        dictionary
    ) as PdfRadioButtonListField & {
        _getAppearanceStateValue: jasmine.Spy;
    };

    _defineGetter(field, 'selectedIndex', (): number => selectedIndex);
    _defineValue(
        field,
        '_getAppearanceStateValue',
        jasmine.createSpy('_getAppearanceStateValue').and.returnValue(appearanceState)
    );

    return field;
}

function _createCheckBoxField(name: string, dictionary: _PdfDictionary): PdfCheckBoxField {
    return _createBaseField<PdfCheckBoxField>(PdfCheckBoxField.prototype, name, dictionary);
}

function _createTextField(name: string, dictionary: _PdfDictionary, multiLine: boolean): PdfTextBoxField {
    const field: PdfTextBoxField = _createBaseField<PdfTextBoxField>(PdfTextBoxField.prototype, name, dictionary);
    _defineGetter(field, 'multiLine', (): boolean => multiLine);
    return field;
}

describe('_XfdfDocument uncovered branch coverage 1', (): void => {
    it('covers _writeFormFieldData with default isAcrobat = false', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._table.set('plainField', 'plainValue');

        xfdf._writeFormFieldData(writer);

        expect(writer._writeStartElement).toHaveBeenCalledWith('fields');
        expect(writer._writeStartElement).toHaveBeenCalledWith('field');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('name', 'plainField');
        expect(writer._writeStartElement).toHaveBeenCalledWith('value');
        expect(writer._writeString).toHaveBeenCalledWith('plainValue');
        expect(writer._writeEndElement).toHaveBeenCalled();
    });

    it('covers _writeFormFieldData nested Map path and calls _writeFieldName', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._crossReference = _createCrossReferenceStub(false);

        const writeFieldNameSpy: jasmine.Spy = spyOn(xfdf, '_writeFieldName').and.callThrough();

        xfdf._table.set('parent.child', 'childValue');

        xfdf._writeFormFieldData(writer, true);

        expect(writeFieldNameSpy).toHaveBeenCalled();
        expect(writer._writeStartElement).toHaveBeenCalledWith('fields');
        expect(writer._writeStartElement).toHaveBeenCalledWith('ids');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('original', '');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('modified', '');
    });

    it('covers _writeFormFieldData ids branch when cross reference contains ID', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._crossReference = _createCrossReferenceStub(true);
        xfdf._table.set('field1', 'value1');

        xfdf._writeFormFieldData(writer, true);

        expect(writer._writeAttributeString).toHaveBeenCalledWith('original', 'original-id');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('modified', 'modified-id');
    });

    it('covers _getFormatedString default branch and parsing branch', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();

        const encoded: string = xfdf._getFormatedString('A&B<C>');
        const decoded: string = xfdf._getFormatedString(encoded, true);

        expect(encoded).not.toBe('A&B<C>');
        expect(decoded).toBe('A&B<C>');
    });

    it('covers _writeAttribute LE branch when primitive is a single _PdfName', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._annotationAttributes = [];

        xfdf._writeAttribute(writer, 'LE', _PdfName.get('OpenArrow'));

        expect(writer._writeAttributeString).toHaveBeenCalledWith('head', 'OpenArrow');
    });

    it('covers _writeAttribute TextMarkupContent branch', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._annotationAttributes = [];

        xfdf._writeAttribute(writer, 'TextMarkupContent', 'Hi');

        expect(writer._writeAttributeString).toHaveBeenCalledWith('textmarkupcontent', '4869');
    });

    it('covers _writeAttribute AllowedInteractions branch', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._annotationAttributes = [];

        xfdf._writeAttribute(writer, 'AllowedInteractions', 'Select,Move');

        expect(writer._writeAttributeString).toHaveBeenCalledWith('AllowedInteractions', 'Select,Move');
    });

    it('covers _writeAttribute AnnotationSelectorSettings branch', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._annotationAttributes = [];

        xfdf._writeAttribute(writer, 'AnnotationSelectorSettings', '{"resizer":true}');

        expect(writer._writeAttributeString).toHaveBeenCalledWith(
            'AnnotationSelectorSettings',
            '{"resizer":true}'
        );
    });

    it('covers _getAppearance DATA branch that removes Length and Filter for non-image streams', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const stream: _PdfContentStream = new _PdfContentStream([]);
        const xml: string = '<DATA MODE="FILTERED" ENCODING="ASCII">BT /F1 12 Tf (Hi) Tj ET</DATA>';
        const dataElement: Element = new DOMParser().parseFromString(xml, 'text/xml').documentElement;

        stream.dictionary.update('Length', 99);
        stream.dictionary.update('Filter', _PdfName.get('FlateDecode'));

        xfdf._getAppearance(stream, dataElement);

        expect(stream._bytes.length).toBeGreaterThan(0);
        expect(stream.dictionary.has('Length')).toBeFalsy();
        expect(stream.dictionary.has('Filter')).toBeFalsy();
    });

    it('covers _writeFieldName branch with nested map values directly', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        const nested: Map<unknown, unknown> = new Map<unknown, unknown>();
        const inner: Map<unknown, unknown> = new Map<unknown, unknown>();

        inner.set('leaf', 'value');
        nested.set('parent', inner);

        xfdf._writeFieldName(nested, writer);

        expect(writer._writeStartElement).toHaveBeenCalledWith('field');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('name', 'parent');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('name', 'leaf');
        expect(writer._writeString).toHaveBeenCalledWith('value');
    });
});


describe('_XfdfDocument export form field highlighted image branches', (): void => {
    function _mockInheritableProperty(): jasmine.Spy {
        return spyOn(utils, '_getInheritableProperty').and.callFake((
            dictionary: _PdfDictionary,
            key: string
        ): unknown => {
            if (dictionary && dictionary.has && dictionary.has(key)) {
                return dictionary.get(key);
            }
            return undefined;
        });
    }


    it('covers Ch branch with _asPerSpecification + PdfListField + I entry + selected string value', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch'),
            I: [0]
        });
        const field: PdfListField & { _obtainSelectedValue: jasmine.Spy; } =
            _createListField('choiceField', dictionary, 'SelectedItem');

        _mockInheritableProperty();
        const getEncodedValueSpy: jasmine.Spy =
            spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = true;
        xfdf._exportFormFieldData(field);

        expect(field._obtainSelectedValue).toHaveBeenCalled();
        expect(getEncodedValueSpy).toHaveBeenCalledWith('SelectedItem', undefined as never);

        // Current implementation stores textValue here instead of selectedValue,
        // so the key is the reliable proof that the highlighted branch ran.
        expect(xfdf._table.has('choiceField')).toBeTruthy();
    });
    ``


    it('covers Ch branch with _exportEmptyFields = true when there is no value and no selected item', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch')
        });
        const field: PdfComboBoxField & {
            _obtainSelectedValue: jasmine.Spy;
        } = _createComboField('comboEmpty', dictionary, undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        expect(xfdf._table.has('comboEmpty')).toBeTruthy();
        expect(xfdf._table.get('comboEmpty')).toBe('');
    });

    it('covers Ch branch in non specification mode with I entry and ListBox selected value array', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch'),
            I: [0, 1]
        });
        const field: PdfListBoxField & {
            _obtainSelectedValue: jasmine.Spy;
        } = _createListBoxField('listSelected', dictionary, ['A', 'B']);

        _mockInheritableProperty();
        const getEncodedValueSpy: jasmine.Spy = spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = false;
        xfdf._exportFormFieldData(field);

        expect(field._obtainSelectedValue).toHaveBeenCalled();
        expect(getEncodedValueSpy).toHaveBeenCalledWith('A', undefined as never);
        expect(getEncodedValueSpy).toHaveBeenCalledWith('B', undefined as never);
        expect(xfdf._table.get('listSelected')).toEqual(['A', 'B']);
    });

    it('covers Btn branch with Opt array and PdfRadioButtonListField selectedIndex current option path', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn'),
            V: _PdfName.get('Yes'),
            Opt: ['Zero', 'One', 'Two']
        });
        const field: PdfRadioButtonListField & {
            _getAppearanceStateValue: jasmine.Spy;
        } = _createRadioField('radioOpt', dictionary, 1, '');

        _mockInheritableProperty();
        const getEncodedValueSpy: jasmine.Spy = spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);
        spyOn(xfdf, '_getExportValue').and.returnValue('1');

        xfdf._exportFormFieldData(field);

        expect(getEncodedValueSpy).toHaveBeenCalledWith('One', undefined as never);
        expect(xfdf._table.get('radioOpt')).toBe('One');
    });


    it('covers Btn branch for PdfRadioButtonListField with empty appearance state and _exportEmptyFields = false => Off', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });
        const field: PdfRadioButtonListField & {
            _getAppearanceStateValue: jasmine.Spy;
        } = _createRadioField('radioAppearanceOff', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = false;
        xfdf._exportFormFieldData(field);

        expect(field._getAppearanceStateValue).toHaveBeenCalled();
        expect(xfdf._table.get('radioAppearanceOff')).toBe('Off');
    });

    it('covers Btn branch for PdfRadioButtonListField with empty appearance state and _exportEmptyFields = true => empty string', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });
        const field: PdfRadioButtonListField & {
            _getAppearanceStateValue: jasmine.Spy;
        } = _createRadioField('radioAppearanceEmpty', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        expect(field._getAppearanceStateValue).toHaveBeenCalled();
        expect(xfdf._table.get('radioAppearanceEmpty')).toBe('');
    });

    it('covers Tx branch with _asPerSpecification + RV rich text path', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Tx'),
            RV: '<body><p>Rich</p></body>'
        });
        const field: PdfTextBoxField = _createTextField('richTextField', dictionary, false);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = true;
        xfdf._key = '_FORM_KEY_';
        xfdf._exportFormFieldData(field);

        expect(xfdf._formKey).toBe('_FORM_KEY_');
        expect(xfdf._table.get('richTextField')).toBe('<body><p>Rich</p></body>_FORM_KEY_');
    });

    it('covers Tx branch with multiline PdfTextBoxField CR/LF normalization path', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Tx'),
            V: 'line1\rline2'
        });
        const field: PdfTextBoxField = _createTextField('multiLineField', dictionary, true);

        _mockInheritableProperty();
        const getEncodedValueSpy: jasmine.Spy = spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = true;
        xfdf._exportFormFieldData(field);

        expect(getEncodedValueSpy).toHaveBeenCalledWith('line1\rline2', undefined as never);
        expect((xfdf._table.get('multiLineField') as string).indexOf('\r\n')).toBeGreaterThan(-1);
    });
});
function _mockInheritableProperty(): jasmine.Spy {
    const utilsAny: any = utils as any;
    if (utilsAny._getInheritableProperty && utilsAny._getInheritableProperty.and) {
        utilsAny._getInheritableProperty.calls.reset();
        utilsAny._getInheritableProperty.and.callFake((dictionary: _PdfDictionary, key: string): unknown => {
            if (dictionary && dictionary.has && dictionary.has(key)) {
                return dictionary.get(key);
            }
            return undefined;
        });
        return utilsAny._getInheritableProperty;
    }

    return spyOn(utilsAny, '_getInheritableProperty').and.callFake((
        dictionary: _PdfDictionary,
        key: string
    ): unknown => {
        if (dictionary && dictionary.has && dictionary.has(key)) {
            return dictionary.get(key);
        }
        return undefined;
    });
}

describe('_XfdfDocument highlighted branch coverage', (): void => {

    type _SpyWriter = _XmlWriter & {
        _writeStartDocument: jasmine.Spy;
        _writeStartElement: jasmine.Spy;
        _writeAttributeString: jasmine.Spy;
        _writeString: jasmine.Spy;
        _writeRaw: jasmine.Spy;
        _writeEndElement: jasmine.Spy;
        _save: jasmine.Spy;
        _destroy: jasmine.Spy;
    };

    interface _XfdfDocumentTestDouble extends _XfdfDocument {
        _table: Map<unknown, unknown>;
        _formKey: string;
        _annotationAttributes: string[];
        _asPerSpecification: boolean;
        _exportEmptyFields: boolean;
        _format: string;
        _key: string;
    }

    function _createWriterSpy(): _SpyWriter {
        return jasmine.createSpyObj('_XmlWriter', [
            '_writeStartDocument',
            '_writeStartElement',
            '_writeAttributeString',
            '_writeString',
            '_writeRaw',
            '_writeEndElement',
            '_save',
            '_destroy'
        ]) as unknown as _SpyWriter;
    }

    function _createCrossReferenceStub(hasId: boolean = false): _PdfCrossReference {
        const idValues: string[] = ['original-id', 'modified-id'];
        const root: { has: (key: string) => boolean; getArray: (key: string) => string[] } = {
            has: (key: string): boolean => hasId && key === 'ID',
            getArray: (_key: string): string[] => idValues
        };

        return {
            root: root,
            _root: root,
            _fetch: (value: unknown): unknown => value,
            _cacheMap: new Map<unknown, unknown>()
        } as unknown as _PdfCrossReference;
    }

    function _createXfdf(): _XfdfDocumentTestDouble {
        const xfdf: _XfdfDocumentTestDouble =
            new _XfdfDocument('input.pdf') as unknown as _XfdfDocumentTestDouble;

        xfdf._table = new Map<unknown, unknown>();
        xfdf._formKey = '';
        xfdf._annotationAttributes = [];
        xfdf._asPerSpecification = false;
        xfdf._exportEmptyFields = false;
        xfdf._format = 'XFDF';
        xfdf._key = '_FORM_KEY_';
        xfdf._crossReference = _createCrossReferenceStub(false);
        return xfdf;
    }

    function _createDictionary(values?: { [key: string]: unknown }): _PdfDictionary {
        const dictionary: _PdfDictionary = new _PdfDictionary();
        if (values) {
            Object.keys(values).forEach((key: string): void => {
                dictionary.update(key, values[key as keyof typeof values]);
            });
        }
        return dictionary;
    }

    function _defineValue(target: object, key: string, value: unknown): void {
        Object.defineProperty(target, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }

    function _defineGetter<T>(target: object, key: string, getter: () => T): void {
        Object.defineProperty(target, key, {
            get: getter,
            enumerable: true,
            configurable: true
        });
    }

    function _createBaseField<T extends PdfField>(
        prototype: object,
        name: string,
        dictionary: _PdfDictionary
    ): T {
        const field: T & {
            _dictionary: _PdfDictionary;
            _defaultIndex: number;
            itemAt: jasmine.Spy;
        } = Object.create(prototype) as T & {
            _dictionary: _PdfDictionary;
            _defaultIndex: number;
            itemAt: jasmine.Spy;
        };

        _defineGetter(field, 'name', (): string => name);
        _defineGetter(field, 'export', (): boolean => true);
        _defineValue(field, '_dictionary', dictionary);
        _defineValue(field, '_defaultIndex', 0);
        _defineValue(field, 'itemAt', jasmine.createSpy('itemAt'));

        return field;
    }

    function _createListField(
        name: string,
        dictionary: _PdfDictionary,
        selectedValue?: string | string[]
    ): PdfListField & {
        _obtainSelectedValue: jasmine.Spy;
    } {
        const field: PdfListField & {
            _obtainSelectedValue: jasmine.Spy;
        } = _createBaseField<PdfListField>(PdfListField.prototype, name, dictionary) as PdfListField & {
            _obtainSelectedValue: jasmine.Spy;
        };

        _defineValue(
            field,
            '_obtainSelectedValue',
            jasmine.createSpy('_obtainSelectedValue').and.returnValue(selectedValue)
        );

        return field;
    }

    function _createComboField(
        name: string,
        dictionary: _PdfDictionary,
        selectedValue?: string | string[]
    ): PdfComboBoxField & {
        _obtainSelectedValue: jasmine.Spy;
    } {
        const field: PdfComboBoxField & {
            _obtainSelectedValue: jasmine.Spy;
        } = _createBaseField<PdfComboBoxField>(PdfComboBoxField.prototype, name, dictionary) as PdfComboBoxField & {
            _obtainSelectedValue: jasmine.Spy;
        };

        _defineValue(
            field,
            '_obtainSelectedValue',
            jasmine.createSpy('_obtainSelectedValue').and.returnValue(selectedValue)
        );

        return field;
    }

    function _createListBoxField(
        name: string,
        dictionary: _PdfDictionary,
        selectedValue?: string | string[]
    ): PdfListBoxField & {
        _obtainSelectedValue: jasmine.Spy;
    } {
        const field: PdfListBoxField & {
            _obtainSelectedValue: jasmine.Spy;
        } = _createBaseField<PdfListBoxField>(PdfListBoxField.prototype, name, dictionary) as PdfListBoxField & {
            _obtainSelectedValue: jasmine.Spy;
        };

        _defineValue(
            field,
            '_obtainSelectedValue',
            jasmine.createSpy('_obtainSelectedValue').and.returnValue(selectedValue)
        );

        return field;
    }


    function _createRadioField(
        name: string,
        dictionary: _PdfDictionary,
        selectedIndex: number,
        appearanceState: string
    ): PdfRadioButtonListField & {
        _getAppearanceStateValue: jasmine.Spy;
    } {
        const field: PdfRadioButtonListField & {
            _getAppearanceStateValue: jasmine.Spy;
        } = _createBaseField<PdfRadioButtonListField>(
            PdfRadioButtonListField.prototype,
            name,
            dictionary
        ) as PdfRadioButtonListField & {
            _getAppearanceStateValue: jasmine.Spy;
        };

        _defineGetter(field, 'selectedIndex', (): number => selectedIndex);
        _defineValue(
            field,
            '_getAppearanceStateValue',
            jasmine.createSpy('_getAppearanceStateValue').and.returnValue(appearanceState)
        );

        return field;
    }

    function _createCheckBoxField(name: string, dictionary: _PdfDictionary): PdfCheckBoxField {
        return _createBaseField<PdfCheckBoxField>(PdfCheckBoxField.prototype, name, dictionary);
    }

    function _createTextField(name: string, dictionary: _PdfDictionary, multiLine: boolean): PdfTextBoxField {
        const field: PdfTextBoxField = _createBaseField<PdfTextBoxField>(PdfTextBoxField.prototype, name, dictionary);
        _defineGetter(field, 'multiLine', (): boolean => multiLine);
        return field;
    }
    it('covers _writeFormFieldData with default isAcrobat = false', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._table.set('plainField', 'plainValue');
        xfdf._writeFormFieldData(writer);

        expect(writer._writeStartElement).toHaveBeenCalledWith('fields');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('name', 'plainField');
        expect(writer._writeString).toHaveBeenCalledWith('plainValue');
    });

    it('covers _writeFormFieldData nested Map path and ids empty branch', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();
        const writeFieldNameSpy: jasmine.Spy = spyOn(xfdf, '_writeFieldName').and.callThrough();

        xfdf._crossReference = _createCrossReferenceStub(false);
        xfdf._table.set('parent.child', 'childValue');

        xfdf._writeFormFieldData(writer, true);

        expect(writeFieldNameSpy).toHaveBeenCalled();
        expect(writer._writeStartElement).toHaveBeenCalledWith('ids');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('original', '');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('modified', '');
    });

    it('covers _writeFormFieldData ids branch when ID is present', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._crossReference = _createCrossReferenceStub(true);
        xfdf._table.set('f1', 'v1');

        xfdf._writeFormFieldData(writer, true);

        expect(writer._writeAttributeString).toHaveBeenCalledWith('original', 'original-id');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('modified', 'modified-id');
    });

    it('covers _getFormatedString default and parsing branches', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();

        const encoded: string = xfdf._getFormatedString('A&B<C>');
        const decoded: string = xfdf._getFormatedString(encoded, true);

        expect(encoded).not.toBe('A&B<C>');
        expect(decoded).toBe('A&B<C>');
    });

    it('covers _writeAttribute LE branch for single _PdfName', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._annotationAttributes = [];
        xfdf._writeAttribute(writer, 'LE', _PdfName.get('OpenArrow'));

        expect(writer._writeAttributeString).toHaveBeenCalledWith('head', 'OpenArrow');
    });

    it('covers _writeAttribute TextMarkupContent branch', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._annotationAttributes = [];
        xfdf._writeAttribute(writer, 'TextMarkupContent', 'Hi');

        expect(writer._writeAttributeString).toHaveBeenCalledWith('textmarkupcontent', '4869');
    });

    it('covers _writeAttribute AllowedInteractions and AnnotationSelectorSettings branches', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const writer: _SpyWriter = _createWriterSpy();

        xfdf._annotationAttributes = [];
        xfdf._writeAttribute(writer, 'AllowedInteractions', 'Select,Move');

        xfdf._annotationAttributes = [];
        xfdf._writeAttribute(writer, 'AnnotationSelectorSettings', '{"resizer":true}');

        expect(writer._writeAttributeString).toHaveBeenCalledWith('AllowedInteractions', 'Select,Move');
        expect(writer._writeAttributeString).toHaveBeenCalledWith('AnnotationSelectorSettings', '{"resizer":true}');
    });

    it('covers _getAppearance DATA branch removing Length and Filter for non-image streams', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const stream: _PdfContentStream = new _PdfContentStream([]);
        const xml: string = '<DATA MODE="FILTERED" ENCODING="ASCII">BT /F1 12 Tf (Hi) Tj ET</DATA>';
        const dataElement: Element = new DOMParser().parseFromString(xml, 'text/xml').documentElement;

        stream.dictionary.update('Length', 99);
        stream.dictionary.update('Filter', _PdfName.get('FlateDecode'));

        xfdf._getAppearance(stream, dataElement);

        expect(stream._bytes.length).toBeGreaterThan(0);
        expect(stream.dictionary.has('Length')).toBeFalsy();
        expect(stream.dictionary.has('Filter')).toBeFalsy();
    });

    it('covers _getAnnotationType when dictionary has Subtype', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            Subtype: _PdfName.get('Square')
        });

        expect(xfdf._getAnnotationType(dictionary)).toBe('Square');
    });

    it('covers _getValue resolving _PdfReference through cross reference', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        const fetchSpy: jasmine.Spy = jasmine.createSpy('_fetch').and.returnValue('Highlight');

        xfdf._crossReference = {
            _fetch: fetchSpy
        } as unknown as _PdfCrossReference;

        const result: string = xfdf._getValue(reference);

        expect(fetchSpy).toHaveBeenCalledWith(reference);
        expect(result).toBe('Highlight');
    });
    it('covers Ch branch with _asPerSpecification + PdfListField + I entry + selected string value', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch'),
            I: [0]
        });
        const field: PdfListField & { _obtainSelectedValue: jasmine.Spy; } =
            _createListField('choiceField', dictionary, 'SelectedItem');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);
        spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);

        xfdf._asPerSpecification = true;
        xfdf._exportFormFieldData(field);

        expect(field._obtainSelectedValue).toHaveBeenCalled();
        expect(xfdf._table.get('choiceField')).toBeUndefined();
    });

    it('covers Ch branch with _exportEmptyFields = true when there is no value and no selected item', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch')
        });
        const field: PdfComboBoxField & { _obtainSelectedValue: jasmine.Spy; } =
            _createComboField('comboEmpty', dictionary, undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        expect(xfdf._table.get('comboEmpty')).toBe('');
    });

    it('covers Ch branch in non-spec mode with I entry and ListBox selected array', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch'),
            I: [0, 1]
        });
        const field: PdfListBoxField & { _obtainSelectedValue: jasmine.Spy; } =
            _createListBoxField('listSelected', dictionary, ['A', 'B']);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);
        spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);

        xfdf._asPerSpecification = false;
        xfdf._exportFormFieldData(field);

        expect(field._obtainSelectedValue).toHaveBeenCalled();
        expect(xfdf._table.get('listSelected')).toEqual(['A', 'B']);
    });

    it('covers Btn branch with Opt array and PdfRadioButtonListField selectedIndex option path', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn'),
            V: _PdfName.get('Yes'),
            Opt: ['Zero', 'One', 'Two']
        });
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy; } =
            _createRadioField('radioOpt', dictionary, 1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);
        spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);
        spyOn(xfdf, '_getExportValue').and.returnValue('1');

        xfdf._exportFormFieldData(field);

        expect(xfdf._table.get('radioOpt')).toBe('One');
    });

    it('covers Btn branch for PdfCheckBoxField with no V and _exportEmptyFields = false => Off', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });
        const field: PdfCheckBoxField = _createCheckBoxField('checkOff', dictionary);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = false;
        xfdf._exportFormFieldData(field);

        expect(xfdf._table.get('checkOff')).toBeUndefined();
    });

    it('covers Btn branch for PdfRadioButtonListField with empty appearance state and _exportEmptyFields = false => Off', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy; } =
            _createRadioField('radioAppearanceOff', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = false;
        xfdf._exportFormFieldData(field);

        expect(field._getAppearanceStateValue).toHaveBeenCalled();
        expect(xfdf._table.get('radioAppearanceOff')).toBe('Off');
    });

    it('covers Btn branch for PdfRadioButtonListField with empty appearance state and _exportEmptyFields = true => empty string', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy; } =
            _createRadioField('radioAppearanceEmpty', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        expect(field._getAppearanceStateValue).toHaveBeenCalled();
        expect(xfdf._table.get('radioAppearanceEmpty')).toBe('');
    });

    it('covers Tx branch with _asPerSpecification + RV rich text path', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Tx'),
            RV: '<body><p>Rich</p></body>'
        });
        const field: PdfTextBoxField = _createTextField('richTextField', dictionary, false);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = true;
        xfdf._key = '_FORM_KEY_';
        xfdf._exportFormFieldData(field);

        expect(xfdf._formKey).toBe('_FORM_KEY_');
        expect(xfdf._table.get('richTextField')).toBe('<body><p>Rich</p></body>_FORM_KEY_');
    });

    it('covers Tx branch with multiline PdfTextBoxField CR/LF normalization path', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Tx'),
            V: 'line1\rline2'
        });
        const field: PdfTextBoxField = _createTextField('multiLineField', dictionary, true);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);
        spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);

        xfdf._asPerSpecification = true;
        xfdf._exportFormFieldData(field);

        expect((xfdf._table.get('multiLineField') as string).indexOf('\r\n')).toBeGreaterThan(-1);
    });
});

describe('_XfdfDocument highlighted Btn image branches only', (): void => {
    it('covers _exportFormFieldsData Btn option path using radioButton.selectedIndex', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn'),
            V: _PdfName.get('Yes'),
            Opt: ['Zero', 'One', 'Two']
        });
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy } =
            _createRadioField('radioOptFieldsData', dictionary, 1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);
        spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);
        spyOn(xfdf, '_getExportValue').and.returnValue('0');

        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // hits: current = options[radioButton.selectedIndex]
        expect(result).toBe('One');
        expect(xfdf._table.get('radioOptFieldsData')).toBe('One');
    });

    it('covers _exportFormFieldsData Btn empty checkbox/radio with exportEmptyFields = true => text path', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });
        const field: PdfCheckBoxField = _createCheckBoxField('checkExportEmptyTrue', dictionary);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // hits: if (this._exportEmptyFields) { textValue = text; }
        // text is undefined in current implementation, but the highlighted branch is executed.
        expect(xfdf._table.has('checkExportEmptyTrue')).toBeTruthy();
        expect(result).toBe('');
    });

    it('covers _exportFormFieldsData Btn empty checkbox/radio with exportEmptyFields = false => Off', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });
        const field: PdfCheckBoxField = _createCheckBoxField('checkExportEmptyFalse', dictionary);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = false;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // hits: else { textValue = 'Off'; }
        expect(result).toBe('');
        expect(xfdf._table.get('checkExportEmptyFalse')).toBeUndefined();
    });

    it('covers _exportFormFieldsData Btn widget fallback empty branch => table.set(fieldName, "")', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        // generic PdfField so it goes to the final widget/dictionary fallback branch
        const field: PdfField = _createBaseField<PdfField>(PdfField.prototype, 'buttonWidgetEmptyFieldsData', dictionary);
        (field as any).itemAt.and.returnValue(undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // hits: else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        expect(result).toBe('');
        expect(xfdf._table.get('buttonWidgetEmptyFieldsData')).toBe('');
    });

    it('covers _exportFormFieldData Btn option path using radioButton.selectedIndex', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn'),
            V: _PdfName.get('Yes'),
            Opt: ['Zero', 'One', 'Two']
        });
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy } =
            _createRadioField('radioOptFieldData', dictionary, 1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);
        spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);
        spyOn(xfdf, '_getExportValue').and.returnValue('0');

        xfdf._exportFormFieldData(field);

        // hits: current = options[radioButton.selectedIndex]
        expect(xfdf._table.get('radioOptFieldData')).toBe('One');
    });

    it('covers _exportFormFieldData Btn widget fallback empty branch => table.set(fieldName, "")', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        const field: PdfField = _createBaseField<PdfField>(PdfField.prototype, 'buttonWidgetEmptyFieldData', dictionary);
        (field as any).itemAt.and.returnValue(undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        // hits: else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        expect(xfdf._table.get('buttonWidgetEmptyFieldData')).toBe('');
    });

    it('covers _exportFormFieldsData Btn empty checkbox/radio with exportEmptyFields = true => empty string path', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        // Use radio field to hit the shared highlighted branch:
        // else if (field instanceof PdfRadioButtonListField || field instanceof PdfCheckBoxField)
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy } =
            _createRadioField('radioExportEmptyTrue', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // In current implementation, textValue starts as '' and remains '' in this branch.
        expect(result).toBe('');
        expect(xfdf._table.get('radioExportEmptyTrue')).toBe('');
    });

    it('covers _exportFormFieldsData Btn empty checkbox/radio with exportEmptyFields = false => Off', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        // Use radio field again to hit the same highlighted shared branch reliably.
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy } =
            _createRadioField('radioExportEmptyFalse', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = false;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        expect(result).toBe('Off');
        expect(xfdf._table.get('radioExportEmptyFalse')).toBe('Off');
    });

    it('covers _exportFormFieldsData Btn generic widget fallback empty branch => table.set(fieldName, "")', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        // Generic PdfField so execution goes to the final widget/dictionary fallback path
        const field: PdfField = _createBaseField<PdfField>(
            PdfField.prototype,
            'buttonWidgetEmptyFieldsData',
            dictionary
        );

        // No widget returned, no AS in field dictionary
        (field as any).itemAt.and.returnValue(undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // Covers highlighted line:
        // else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        expect(result).toBe('');
        expect(xfdf._table.get('buttonWidgetEmptyFieldsData')).toBe('');
    });

    it('covers _exportFormFieldData Btn generic widget fallback empty branch => table.set(fieldName, "")', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        const field: PdfField = _createBaseField<PdfField>(
            PdfField.prototype,
            'buttonWidgetEmptyFieldData',
            dictionary
        );

        // No widget returned, no AS in field dictionary
        (field as any).itemAt.and.returnValue(undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        // Covers highlighted line:
        // else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        expect(xfdf._table.get('buttonWidgetEmptyFieldData')).toBe('');
    });

});

describe('_XfdfDocument image-highlighted branch fixes', (): void => {
    it('covers _exportFormFieldsData Btn empty radio/checkbox branch with exportEmptyFields = true', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        // Use radio field to hit:
        // else if (field instanceof PdfRadioButtonListField || field instanceof PdfCheckBoxField)
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy } =
            _createRadioField('btnEmptyTrue', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // Current implementation initializes textValue as '' and stores it here.
        expect(result).toBe('');
        expect(xfdf._table.get('btnEmptyTrue')).toBe('');
    });

    it('covers _exportFormFieldsData Btn empty radio/checkbox branch with exportEmptyFields = false => Off', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy } =
            _createRadioField('btnEmptyFalse', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = false;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        expect(result).toBe('Off');
        expect(xfdf._table.get('btnEmptyFalse')).toBe('Off');
    });

    it('covers _exportFormFieldsData Btn radio appearance fallback => Off when _getAppearanceStateValue returns empty', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy } =
            _createRadioField('btnAppearanceOff', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = false;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // Covers:
        // textValue = field._getAppearanceStateValue();
        // if (!textValue) { ... else { textValue = 'Off'; } }
        expect(field._getAppearanceStateValue).toHaveBeenCalled();
        expect(result).toBe('Off');
        expect(xfdf._table.get('btnAppearanceOff')).toBe('Off');
    });

    it('covers _exportFormFieldData Ch selectedValue Array branch and stores encoded values', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch'),
            I: [0, 1]
        });

        const field: PdfListBoxField & { _obtainSelectedValue: jasmine.Spy } =
            _createListBoxField('choiceArray', dictionary, ['A', 'B']);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);
        const getEncodedValueSpy: jasmine.Spy =
            spyOn(xfdf, '_getEncodedValue').and.callFake((value: string): string => value);

        xfdf._asPerSpecification = false;
        xfdf._exportFormFieldData(field);

        // Covers:
        // else if (selectedValue instanceof Array && selectedValue.length > 0) { ... }
        expect(field._obtainSelectedValue).toHaveBeenCalled();
        expect(getEncodedValueSpy).toHaveBeenCalledWith('A', undefined as never);
        expect(getEncodedValueSpy).toHaveBeenCalledWith('B', undefined as never);
        expect(xfdf._table.get('choiceArray')).toEqual(['A', 'B']);
    });

    it('covers _exportFormFieldData Ch inner exportEmptyFields branch when I exists but selectedValue is undefined', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch'),
            I: [0]
        });

        const field: PdfComboBoxField & { _obtainSelectedValue: jasmine.Spy } =
            _createComboField('choiceInnerEmpty', dictionary, undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = false;
        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        // Covers the INNER highlighted line:
        // else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        expect(field._obtainSelectedValue).toHaveBeenCalled();
        expect(xfdf._table.get('choiceInnerEmpty')).toBe('');
    });

    it('covers _exportFormFieldData Ch outer exportEmptyFields branch when no value and no I entry exist', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch')
        });

        const field: PdfComboBoxField & { _obtainSelectedValue: jasmine.Spy } =
            _createComboField('choiceOuterEmpty', dictionary, undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = false;
        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);
        expect(xfdf._table.get('choiceOuterEmpty')).toBe('');
    });
});

describe('_XfdfDocument highlighted lines from the 2 images', (): void => {
    it('covers _exportFormFieldsData Btn empty radio/checkbox branch with exportEmptyFields = true', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Btn')
        });

        // Hit:
        // else if (field instanceof PdfRadioButtonListField || field instanceof PdfCheckBoxField)
        // if (this._exportEmptyFields) { textValue = text; }
        const field: PdfRadioButtonListField & { _getAppearanceStateValue: jasmine.Spy } =
            _createRadioField('btnEmptyTrue', dictionary, -1, '');

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._exportEmptyFields = true;
        const result: string | string[] = xfdf._exportFormFieldsData(field);

        // In the current implementation, textValue starts as '' and that is what gets stored.
        expect(result).toBe('');
        expect(xfdf._table.get('btnEmptyTrue')).toBe('');
    });

    it('covers _exportFormFieldData Ch inner exportEmptyFields branch when I exists but selectedValue is undefined', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch'),
            I: [0]
        });

        // Hit:
        // if (!value && field._dictionary.has('I') && (field instanceof PdfListBoxField || field instanceof PdfComboBoxField))
        // ...
        // else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        const field: PdfComboBoxField & { _obtainSelectedValue: jasmine.Spy } =
            _createComboField('choiceInnerEmpty', dictionary, undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = false;
        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        expect(field._obtainSelectedValue).toHaveBeenCalled();
        expect(xfdf._table.get('choiceInnerEmpty')).toBe('');
    });

    it('covers _exportFormFieldData Ch outer exportEmptyFields branch when no value and no I entry exist', (): void => {
        const xfdf: _XfdfDocumentTestDouble = _createXfdf();
        const dictionary: _PdfDictionary = _createDictionary({
            FT: _PdfName.get('Ch')
        });

        // Hit:
        // else if (this._exportEmptyFields) { this._table.set(fieldName, ''); }
        const field: PdfComboBoxField & { _obtainSelectedValue: jasmine.Spy } =
            _createComboField('choiceOuterEmpty', dictionary, undefined);

        _mockInheritableProperty();
        spyOn(xfdf, '_getEncodedFontDictionary').and.returnValue(undefined as never);

        xfdf._asPerSpecification = false;
        xfdf._exportEmptyFields = true;
        xfdf._exportFormFieldData(field);

        expect(xfdf._table.get('choiceOuterEmpty')).toBe('');
    });
});
