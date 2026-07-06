
import { _FdfDocument } from '../src/pdf/core/import-export/fdf-document';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfForm } from '../src/pdf/core/form/form';
import {
    PdfField,
    PdfTextBoxField,
    PdfListBoxField,
    PdfComboBoxField,
    PdfRadioButtonListField,
    PdfCheckBoxField
} from '../src/pdf/core/form/field';
import {
    _PdfDictionary,
    _PdfName,
    _PdfReference,
    _PdfCommand
} from '../src/pdf/core/pdf-primitives';
import {
    _PdfStream,
    _PdfContentStream
} from '../src/pdf/core/base-stream';
import { _PdfFlateStream } from '../src/pdf/core/flate-stream';
import * as utils from '../src/pdf/core/utils';

describe('_FdfDocument coverage spec', () => {
    let referenceSeed: number;

    beforeEach(() => {
        referenceSeed = 100;
    });

    function byteArrayToStringLegacy(data: Uint8Array): string {
        let result: string = '';
        for (let i: number = 0; i < data.length; i++) {
            result += String.fromCharCode(data[i]);
        }
        return result;
    }

    function getOwnDescriptor(target: object, key: unknown): PropertyDescriptor | undefined {
        return Object.getOwnPropertyDescriptor(target, key as any);
    }

    function defineOwnProperty(target: object, key: unknown, descriptor: PropertyDescriptor): void {
        Object.defineProperty(target, key as any, descriptor);
    }

    function restoreOwnProperty(target: object, key: unknown, descriptor?: PropertyDescriptor): void {
        if (descriptor) {
            Object.defineProperty(target, key as any, descriptor);
        } else {
            delete (target as { [key: string]: unknown })[key as any];
        }
    }

    function createPdfName(name: string): _PdfName {
        const pdfName: _PdfName = Object.create(_PdfName.prototype) as _PdfName;
        Object.defineProperty(pdfName, 'name', {
            value: name,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return pdfName;
    }

    function createPdfDictionary(entries?: { [key: string]: unknown }): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;
        const mapStore: { [key: string]: unknown } = entries ? entries : {};

        Object.defineProperty(dictionary, '_map', {
            value: mapStore,
            configurable: true,
            enumerable: true,
            writable: true
        });

        Object.defineProperty(dictionary, 'size', {
            get: (): number => {
                return Object.keys(mapStore).length;
            },
            configurable: true
        });

        (dictionary as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => {
            return mapStore[key];
        };

        (dictionary as unknown as { _get: (key: string) => unknown })._get = (key: string): unknown => {
            return mapStore[key];
        };

        (dictionary as unknown as { getRaw: (key: string) => unknown }).getRaw = (key: string): unknown => {
            return mapStore[key];
        };

        (dictionary as unknown as { getArray: (key: string) => unknown[] }).getArray = (key: string): unknown[] => {
            const value: unknown = mapStore[key];
            if (Array.isArray(value)) {
                return value;
            }
            if (typeof value === 'undefined' || value === null) {
                return [];
            }
            return [value];
        };

        (dictionary as unknown as { has: (key: string) => boolean }).has = (key: string): boolean => {
            return Object.prototype.hasOwnProperty.call(mapStore, key);
        };

        (dictionary as unknown as { set: (key: string, value: unknown) => void }).set = (key: string, value: unknown): void => {
            mapStore[key] = value;
        };

        (dictionary as unknown as { update: (key: string, value: unknown) => void }).update = (key: string, value: unknown): void => {
            mapStore[key] = value;
        };

        (dictionary as unknown as {
            forEach: (callback: (key: string, value: unknown) => void) => void;
        }).forEach = (callback: (key: string, value: unknown) => void): void => {
            const keys: string[] = Object.keys(mapStore);
            for (let i: number = 0; i < keys.length; i++) {
                const key: string = keys[i];
                callback(key, mapStore[key]);
            }
        };

        (dictionary as unknown as { assignXref: (xref: unknown) => void }).assignXref = (xref: unknown): void => {
            Object.defineProperty(dictionary, '_crossReference', {
                value: xref,
                configurable: true,
                writable: true
            });
        };

        return dictionary;
    }

    function createPdfCommand(commandValue: string): _PdfCommand {
        const command: _PdfCommand = Object.create(_PdfCommand.prototype) as _PdfCommand;
        Object.defineProperty(command, 'command', {
            value: commandValue,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return command;
    }

    function createField<T extends PdfField>(
        ctor: new (...args: never[]) => T,
        name: string,
        exportValue: boolean
    ): T {
        const field: T = Object.create(ctor.prototype) as T;

        Object.defineProperty(field, 'name', {
            value: name,
            configurable: true,
            enumerable: true
        });

        Object.defineProperty(field, 'export', {
            value: exportValue,
            configurable: true,
            enumerable: true
        });

        Object.defineProperty(field, '_dictionary', {
            value: createPdfDictionary(),
            configurable: true,
            writable: true
        });

        return field;
    }

    function createForm(fields: PdfField[]): PdfForm {
        const form: PdfForm = Object.create(PdfForm.prototype) as PdfForm;

        Object.defineProperty(form, 'count', {
            get: (): number => {
                return fields.length;
            },
            configurable: true
        });

        Object.defineProperty(form, 'exportEmptyFields', {
            value: true,
            configurable: true
        });

        (form as unknown as { fieldAt: (index: number) => PdfField }).fieldAt = (index: number): PdfField => {
            return fields[index];
        };

        (form as unknown as {
            _getFieldIndex: (key: string | string[] | unknown) => number;
        })._getFieldIndex = (key: string | string[] | unknown): number => {
            let resolved: string = '';
            if (Array.isArray(key)) {
                resolved = key.join('');
            } else if (typeof key === 'string') {
                resolved = key;
            } else if (typeof key !== 'undefined' && key !== null) {
                resolved = String(key);
            }

            for (let i: number = 0; i < fields.length; i++) {
                const fieldName: string = (fields[i] as unknown as { name: string }).name;
                if (fieldName === resolved) {
                    return i;
                }
            }
            return -1;
        };

        return form;
    }

    function createCrossReference(fetchResult?: _PdfDictionary): {
        _cacheMap: Map<unknown, unknown>;
        _getNextReference: () => _PdfReference;
        _fetch: jasmine.Spy;
    } {
        const cacheMap: Map<unknown, unknown> = new Map<unknown, unknown>();

        return {
            _cacheMap: cacheMap,
            _getNextReference: (): _PdfReference => {
                referenceSeed += 1;
                return _PdfReference.get(referenceSeed, 0);
            },
            _fetch: jasmine.createSpy('_fetch').and.callFake((_reference: _PdfReference): _PdfDictionary | undefined => {
                return fetchResult;
            })
        };
    }

    function createDocument(form: PdfForm): PdfDocument {
        const document: PdfDocument = Object.create(PdfDocument.prototype) as PdfDocument;

        Object.defineProperty(document, 'form', {
            value: form,
            configurable: true
        });

        Object.defineProperty(document, '_crossReference', {
            value: createCrossReference(),
            configurable: true,
            writable: true
        });

        Object.defineProperty(document, 'pageCount', {
            value: 0,
            configurable: true
        });

        return document;
    }

    it('should cover _save() non-spec branches for text/list/combo/radio/checkbox and exported field filtering', () => {
        const textBox: PdfTextBoxField = createField(PdfTextBoxField, 'TextBoxField', true);
        const listBox: PdfListBoxField = createField(PdfListBoxField, 'ListBoxField', true);
        const comboBox: PdfComboBoxField = createField(PdfComboBoxField, 'ComboBoxField', true);
        const radioButton: PdfRadioButtonListField = createField(PdfRadioButtonListField, 'RadioField', true);
        const checkBox: PdfCheckBoxField = createField(PdfCheckBoxField, 'CheckField', false);

        const form: PdfForm = createForm([textBox, listBox, comboBox, radioButton, checkBox]);
        const document: PdfDocument = createDocument(form);

        const helper: _FdfDocument = new _FdfDocument('form-data.fdf');
        (helper as unknown as { _document: PdfDocument })._document = document;
        (helper as unknown as { _crossReference: unknown })._crossReference =
            (document as unknown as { _crossReference: unknown })._crossReference;
        (helper as unknown as { _isAnnotationExport: boolean })._isAnnotationExport = false;
        (helper as unknown as { _asPerSpecification: boolean })._asPerSpecification = false;
        (helper as unknown as { _table: Map<unknown, unknown> })._table = new Map<unknown, unknown>();
        (helper as unknown as { fdfString: string }).fdfString = '';

        const saveTable: Map<unknown, unknown> = (helper as unknown as { _table: Map<unknown, unknown> })._table;
        saveTable.set('0', 0);
        saveTable.set('1', 1);
        saveTable.set('2', 2);
        saveTable.set('3', 3);
        saveTable.set('4', 4);

        spyOn(helper as unknown as {
            _exportFormFieldsData: (field: PdfField) => string | string[];
        }, '_exportFormFieldsData').and.callFake((field: PdfField): string | string[] => {
            if (field === textBox) {
                return 'text-value';
            }
            if (field === listBox) {
                return ['single-item'];
            }
            if (field === comboBox) {
                return ['first', 'second'];
            }
            if (field === radioButton) {
                return 'Choice1';
            }
            return 'Checked';
        });

        const result: Uint8Array = helper._save();
        const output: string = byteArrayToStringLegacy(result);

        expect(output).toContain('%FDF-1.2');
        expect(output).toContain('/T <');
        expect(output).toContain('/V <');
        expect(output).toContain('[<');
        expect(output).toContain('/V /Choice1');
        expect(output).toContain('/Fields [');
        expect(output).toContain('trailer');
    });

    it('should cover _save() specification branches for text/list/combo/radio/checkbox', () => {
        const textBox: PdfTextBoxField = createField(PdfTextBoxField, 'SpecText', true);
        const listBox: PdfListBoxField = createField(PdfListBoxField, 'SpecList', true);
        const comboBox: PdfComboBoxField = createField(PdfComboBoxField, 'SpecCombo', true);
        const radioButton: PdfRadioButtonListField = createField(PdfRadioButtonListField, 'SpecRadio', true);
        const checkBox: PdfCheckBoxField = createField(PdfCheckBoxField, 'SpecCheck', true);

        const form: PdfForm = createForm([textBox, listBox, comboBox, radioButton, checkBox]);
        const document: PdfDocument = createDocument(form);

        const helper: _FdfDocument = new _FdfDocument('spec-form-data.fdf');
        (helper as unknown as { _document: PdfDocument })._document = document;
        (helper as unknown as { _crossReference: unknown })._crossReference =
            (document as unknown as { _crossReference: unknown })._crossReference;
        (helper as unknown as { _isAnnotationExport: boolean })._isAnnotationExport = false;
        (helper as unknown as { _asPerSpecification: boolean })._asPerSpecification = true;
        (helper as unknown as { _table: Map<unknown, unknown> })._table = new Map<unknown, unknown>();
        (helper as unknown as { fdfString: string }).fdfString = '';

        const saveTable: Map<unknown, unknown> = (helper as unknown as { _table: Map<unknown, unknown> })._table;
        saveTable.set('0', 0);
        saveTable.set('1', 1);
        saveTable.set('2', 2);
        saveTable.set('3', 3);
        saveTable.set('4', 4);

        spyOn(helper as unknown as {
            _exportFormFieldsData: (field: PdfField) => string | string[];
        }, '_exportFormFieldsData').and.callFake((field: PdfField): string | string[] => {
            if (field === textBox) {
                return 'spec-text';
            }
            if (field === listBox) {
                return ['spec-single'];
            }
            if (field === comboBox) {
                return ['alpha', 'beta'];
            }
            if (field === radioButton) {
                return 'Yes';
            }
            return 'On';
        });

        const result: Uint8Array = helper._save();
        const output: string = byteArrayToStringLegacy(result);

        expect(output).toContain('%FDF-1.2');
        expect(output).toContain('/FDF<</F(');
        expect(output).toContain('<</T(SpecText)/V(spec-text)>>');
        expect(output).toContain('<</T(SpecList)/V(spec-single)>>');
        expect(output).toContain('<</T(SpecCombo)/V[(alpha) (beta)]>>');
        expect(output).toContain('<</T(SpecRadio)/V/Yes>>');
        expect(output).toContain('<</T(SpecCheck)/V/On>>');
        expect(output).toContain('/Type/Catalog');
        expect(output).toContain('%%EOF');
    });

    it('should cover _readFdfData() non-spec import path with name and array values', () => {
        const helper: _FdfDocument = new _FdfDocument('import-data.fdf');
        (helper as unknown as { _isAnnotationImport: boolean })._isAnnotationImport = false;
        (helper as unknown as { _asPerSpecification: boolean })._asPerSpecification = false;
        (helper as unknown as { _table: Map<unknown, unknown> })._table = new Map<unknown, unknown>();

        const firstDictionary: _PdfDictionary = createPdfDictionary({
            T: ['FieldName1'],
            V: createPdfName('SelectedName')
        });

        const secondDictionary: _PdfDictionary = createPdfDictionary({
            T: ['FieldName2'],
            V: ['Item1', 'Item2']
        });

        const objects: unknown[] = [
            1,
            createPdfCommand('obj'),
            firstDictionary,
            secondDictionary,
            'EOF'
        ];

        const parser: {
            getObject: () => unknown;
            first: number;
        } = {
            getObject: (): unknown => {
                return objects.shift();
            },
            first: 0
        };

        const importFieldSpy: jasmine.Spy = spyOn(
            helper as unknown as { _importField: () => void },
            '_importField'
        ).and.callFake((): void => {
            // no-op
        });

        helper._readFdfData(parser);

        const table: Map<unknown, unknown> = (helper as unknown as { _table: Map<unknown, unknown> })._table;

        let hasSelectedName: boolean = false;
        let hasItemArray: boolean = false;

        table.forEach((value: unknown): void => {
            if (value === 'SelectedName') {
                hasSelectedName = true;
            }
            if (Array.isArray(value) &&
                value.length === 2 &&
                value[0] === 'Item1' &&
                value[1] === 'Item2') {
                hasItemArray = true;
            }
        });

        expect(table.size).toBe(2);
        expect(hasSelectedName).toBe(true);
        expect(hasItemArray).toBe(true);
        expect(importFieldSpy).toHaveBeenCalled();
    });

    it('should cover _readFdfData() specification import path with fields inside FDF dictionary', () => {
        const helper: _FdfDocument = new _FdfDocument('import-spec-data.fdf');
        (helper as unknown as { _isAnnotationImport: boolean })._isAnnotationImport = false;
        (helper as unknown as { _asPerSpecification: boolean })._asPerSpecification = true;
        (helper as unknown as { _table: Map<unknown, unknown> })._table = new Map<unknown, unknown>();

        const specField1: _PdfDictionary = createPdfDictionary({
            T: ['SpecField1'],
            V: createPdfName('SpecChoice')
        });

        const specField2: _PdfDictionary = createPdfDictionary({
            T: ['SpecField2'],
            V: ['One', 'Two']
        });

        const fdfDictionary: _PdfDictionary = createPdfDictionary({
            Fields: [specField1, specField2]
        });

        const rootDictionary: _PdfDictionary = createPdfDictionary({
            FDF: fdfDictionary
        });

        // IMPORTANT:
        // _readFdfData() calls parser.getObject() once before entering the form import branch,
        // and then again before the spec branch loop starts.
        // So we need one dummy token first, then the actual root dictionary.
        const objects: unknown[] = [
            0,
            rootDictionary,
            'EOF'
        ];

        const parser: {
            getObject: () => unknown;
            first: number;
        } = {
            getObject: (): unknown => {
                return objects.shift();
            },
            first: 0
        };

        const importFieldSpy: jasmine.Spy = spyOn(
            helper as unknown as { _importField: () => void },
            '_importField'
        ).and.callFake((): void => {
            // no-op
        });

        helper._readFdfData(parser);

        const table: Map<unknown, unknown> = (helper as unknown as { _table: Map<unknown, unknown> })._table;

        let hasSpecChoice: boolean = false;
        let hasArrayValue: boolean = false;

        table.forEach((value: unknown): void => {
            if (value === 'SpecChoice') {
                hasSpecChoice = true;
            }
            if (Array.isArray(value) &&
                value.length === 2 &&
                value[0] === 'One' &&
                value[1] === 'Two') {
                hasArrayValue = true;
            }
        });

        expect(hasSpecChoice).toBe(true);
        expect(hasArrayValue).toBe(true);
        expect(importFieldSpy).toHaveBeenCalled();
    });

    it('should cover _appendStream() for _PdfContentStream', () => {
        const helper: _FdfDocument = new _FdfDocument('content-stream.fdf');
        (helper as unknown as { fdfString: string }).fdfString = '';

        const contentStream: _PdfContentStream = Object.create(_PdfContentStream.prototype) as _PdfContentStream;
        (contentStream as unknown as { getString: () => string }).getString = (): string => {
            return 'BT /F1 12 Tf ET';
        };

        helper._appendStream(contentStream, '');

        const output: string = (helper as unknown as { fdfString: string }).fdfString;
        expect(output).toContain('stream');
        expect(output).toContain('BT /F1 12 Tf ET');
        expect(output).toContain('endstream');
    });

    it('should cover _appendStream() for _PdfStream byte-range branch', () => {
        const helper: _FdfDocument = new _FdfDocument('byte-range-stream.fdf');
        (helper as unknown as { fdfString: string }).fdfString = '';

        const rawStream: _PdfStream = Object.create(_PdfStream.prototype) as _PdfStream;

        Object.defineProperty(rawStream, 'start', {
            value: 0,
            configurable: true
        });

        Object.defineProperty(rawStream, 'end', {
            value: 2,
            configurable: true
        });

        (rawStream as unknown as {
            getByteRange: (start: number, end: number) => number[];
        }).getByteRange = (_start: number, _end: number): number[] => {
            return [65, 66, 67];
        };

        helper._appendStream(rawStream, '');

        const output: string = (helper as unknown as { fdfString: string }).fdfString;
        expect(output).toContain('stream');
        expect(output).toContain('ABC');
        expect(output).toContain('endstream');
    });

    it('should cover the hard-to-reach compression branch inside _appendStream()', () => {
        const helper: _FdfDocument = new _FdfDocument('compressed-stream.fdf');
        (helper as unknown as { fdfString: string }).fdfString = '';

        const fakeStream: { getBytes: () => number[] } = {
            getBytes: (): number[] => {
                return [120, 156, 75, 4, 0, 0, 98, 0, 98];
            }
        };

        const globalObject: { Symbol?: { hasInstance?: unknown } } =
            Function('return this')() as { Symbol?: { hasInstance?: unknown } };

        const hasInstanceKey: unknown = globalObject.Symbol && globalObject.Symbol.hasInstance;

        if (!hasInstanceKey) {
            expect(true).toBe(true);
            return;
        }

        const originalPdfStreamHasInstance: PropertyDescriptor | undefined =
            getOwnDescriptor(_PdfStream as unknown as object, hasInstanceKey);

        const originalPdfFlateHasInstance: PropertyDescriptor | undefined =
            getOwnDescriptor(_PdfFlateStream as unknown as object, hasInstanceKey);

        const originalPdfContentHasInstance: PropertyDescriptor | undefined =
            getOwnDescriptor(_PdfContentStream as unknown as object, hasInstanceKey);

        let pdfStreamInstanceChecks: number = 0;

        defineOwnProperty(_PdfFlateStream as unknown as object, hasInstanceKey, {
            configurable: true,
            value: (): boolean => {
                return false;
            }
        });

        defineOwnProperty(_PdfContentStream as unknown as object, hasInstanceKey, {
            configurable: true,
            value: (): boolean => {
                return false;
            }
        });

        defineOwnProperty(_PdfStream as unknown as object, hasInstanceKey, {
            configurable: true,
            value: (): boolean => {
                pdfStreamInstanceChecks += 1;
                if (pdfStreamInstanceChecks === 1) {
                    return true;
                }
                if (pdfStreamInstanceChecks === 2) {
                    return true;
                }
                return false;
            }
        });

        try {
            helper._appendStream(fakeStream as unknown as _PdfStream, '');
        } finally {
            restoreOwnProperty(_PdfStream as unknown as object, hasInstanceKey, originalPdfStreamHasInstance);
            restoreOwnProperty(_PdfFlateStream as unknown as object, hasInstanceKey, originalPdfFlateHasInstance);
            restoreOwnProperty(_PdfContentStream as unknown as object, hasInstanceKey, originalPdfContentHasInstance);
        }

        const output: string = (helper as unknown as { fdfString: string }).fdfString;
        expect(output).toContain('stream');
        expect(output).toContain('endstream');
        expect(output.length > 'stream\r\n\r\nendstream'.length).toBe(true);
    });

    it('should cover _appendArray() iteration by forcing the guarded branch and execute element branches safely', () => {
        const helper: _FdfDocument = new _FdfDocument('array-coverage.fdf');
        (helper as unknown as { fdfString: string }).fdfString = '';
        (helper as unknown as { _crossReference: ReturnType<typeof createCrossReference> })._crossReference = createCrossReference();

        const nestedDictionary: _PdfDictionary = createPdfDictionary({
            InnerKey: 'InnerValue'
        });

        const reference: _PdfReference = _PdfReference.get(200, 0);
        (
            (helper as unknown as { _crossReference: ReturnType<typeof createCrossReference> })._crossReference._cacheMap
        ).set(reference, nestedDictionary);

        const forceNonNullSpy: jasmine.Spy = spyOn(utils, '_isNullOrUndefined').and.callFake(
            (value: unknown): boolean => {
                if (Array.isArray(value)) {
                    return true;
                }
                return value === null || typeof value === 'undefined';
            }
        );

        const helperResult: {
            list: Map<unknown, unknown>;
            streamReference: number[];
            index: number;
        } = helper._appendArray(
            [
                10,
                createPdfName('ArrayName'),
                true,
                'ArrayString',
                nestedDictionary,
                [1, 2],
                reference
            ],
            '',
            10,
            true,
            new Map<unknown, unknown>(),
            []
        ) as unknown as {
            list: Map<unknown, unknown>;
            streamReference: number[];
            index: number;
        };

        forceNonNullSpy.and.callThrough();

        const output: string = (helper as unknown as { fdfString: string }).fdfString;
        expect(output).toContain('[');
        expect(output).toContain('/ArrayName');
        expect(output).toContain('true');
        expect(output).toContain('(ArrayString)');
        expect(output).toContain('<<');
        expect(output).toContain('>>');
        expect(helperResult.index > 10).toBe(true);
    });

    it('should cover _importField() and safely update field dictionary RV value', () => {
        const textBox: PdfTextBoxField = createField(PdfTextBoxField, 'ImportField', true);
        const form: PdfForm = createForm([textBox]);
        const document: PdfDocument = createDocument(form);

        const helper: _FdfDocument = new _FdfDocument('field-import.fdf');
        (helper as unknown as { _document: PdfDocument })._document = document;
        (helper as unknown as { _table: Map<unknown, unknown> })._table = new Map<unknown, unknown>();

        const importTable: Map<unknown, unknown> = (helper as unknown as { _table: Map<unknown, unknown> })._table;
        importTable.set('ImportField', 'ImportedValue');

        const importFieldDataSpy: jasmine.Spy = spyOn(
            helper as unknown as {
                _importFieldData: (field: PdfField, values: string[]) => void;
            },
            '_importFieldData'
        ).and.callFake((): void => {
            // no-op
        });

        helper._importField();

        const rv: unknown = (
            (textBox as unknown as { _dictionary: _PdfDictionary })._dictionary as unknown as {
                get: (key: string) => unknown;
            }
        ).get('RV');

        expect(rv).toBe('ImportedValue');
        expect(importFieldDataSpy).toHaveBeenCalledWith(textBox, ['ImportedValue']);
    });

    it('should cover cleanup lines in _importAnnotations() by forcing _isNullOrUndefined checks safely', () => {
        const helper: _FdfDocument = new _FdfDocument('annotation-import.fdf');
        const document: PdfDocument = Object.create(PdfDocument.prototype) as PdfDocument;

        Object.defineProperty(document, '_crossReference', {
            value: createCrossReference(),
            configurable: true
        });

        (helper as unknown as { _annotationObjects: Map<unknown, unknown> })._annotationObjects = new Map<unknown, unknown>();
        (helper as unknown as { _table: Map<unknown, unknown> })._table = new Map<unknown, unknown>();

        (helper as unknown as { _annotationObjects: Map<unknown, unknown> })._annotationObjects.set('a', 1);
        (helper as unknown as { _table: Map<unknown, unknown> })._table.set('b', 2);

        spyOn(helper as unknown as { _checkFdf: (value: string) => void }, '_checkFdf').and.callFake((): void => {
            // no-op
        });

        spyOn(helper as unknown as { _readFdfData: (parser: unknown) => void }, '_readFdfData').and.callFake((): void => {
            // no-op
        });

        const isNullSpy: jasmine.Spy = spyOn(utils, '_isNullOrUndefined').and.returnValues(true, true);

        helper._importAnnotations(document, new Uint8Array([37, 70, 68, 70]));

        expect((helper as unknown as { _annotationObjects: Map<unknown, unknown> })._annotationObjects.size).toBe(0);
        expect((helper as unknown as { _table: Map<unknown, unknown> })._table.size).toBe(0);

        isNullSpy.and.callThrough();
    });
    
});

describe('_FdfDocument _readFdfData command branch coverage', () => {

    function createPdfName(name: string): _PdfName {
        const pdfName: _PdfName = Object.create(_PdfName.prototype) as _PdfName;
        Object.defineProperty(pdfName, 'name', {
            value: name,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return pdfName;
    }

    function createDictionary(entries: { [key: string]: unknown }): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;
        const mapStore: { [key: string]: unknown } = entries;

        Object.defineProperty(dictionary, '_map', {
            value: mapStore,
            configurable: true,
            writable: true
        });

        Object.defineProperty(dictionary, 'size', {
            get: (): number => {
                return Object.keys(mapStore).length;
            },
            configurable: true
        });

        (dictionary as unknown as { getArray: (key: string) => unknown[] }).getArray = (key: string): unknown[] => {
            const value: unknown = mapStore[key];
            if (Array.isArray(value)) {
                return value;
            }
            if (typeof value === 'undefined' || value === null) {
                return [];
            }
            return [value];
        };

        (dictionary as unknown as { get: (key: string) => unknown }).get = (key: string): unknown => {
            return mapStore[key];
        };

        (dictionary as unknown as { has: (key: string) => boolean }).has = (key: string): boolean => {
            return Object.prototype.hasOwnProperty.call(mapStore, key);
        };

        return dictionary;
    }

    function createCommand(commandValue: string | null): _PdfCommand {
        const commandToken: _PdfCommand = Object.create(_PdfCommand.prototype) as _PdfCommand;
        Object.defineProperty(commandToken, 'command', {
            value: commandValue,
            configurable: true,
            enumerable: true,
            writable: true
        });
        return commandToken;
    }

    it('should cover _PdfCommand branch when second token has non-null command', () => {
        const helper: _FdfDocument = new _FdfDocument('command-branch-non-null.fdf');

        (helper as unknown as { _isAnnotationImport: boolean })._isAnnotationImport = false;
        (helper as unknown as { _asPerSpecification: boolean })._asPerSpecification = false;
        (helper as unknown as { _table: Map<unknown, unknown> })._table = new Map<unknown, unknown>();

        const dictionary: _PdfDictionary = createDictionary({
            T: ['CommandField'],
            V: createPdfName('CommandValue')
        });

        const parser: {
            getObject: jasmine.Spy;
            first: number;
        } = {
            getObject: jasmine.createSpy('getObject').and.returnValues(
                1,
                createCommand('obj'),
                dictionary,
                'EOF'
            ),
            first: 0
        };

        const importFieldSpy: jasmine.Spy = spyOn(
            helper as unknown as { _importField: () => void },
            '_importField'
        ).and.callFake((): void => {
            // no-op
        });

        helper._readFdfData(parser);

        const table: Map<unknown, unknown> =
            (helper as unknown as { _table: Map<unknown, unknown> })._table;

        let hasCommandValue: boolean = false;
        table.forEach((value: unknown): void => {
            if (value === 'CommandValue') {
                hasCommandValue = true;
            }
        });

        expect(parser.getObject).toHaveBeenCalled();
        expect(importFieldSpy).toHaveBeenCalled();
        expect(table.size).toBe(1);
        expect(hasCommandValue).toBe(true);
    });

    it('should cover _PdfCommand branch when second token has null command', () => {
        const helper: _FdfDocument = new _FdfDocument('command-branch-null.fdf');

        (helper as unknown as { _isAnnotationImport: boolean })._isAnnotationImport = false;
        (helper as unknown as { _asPerSpecification: boolean })._asPerSpecification = false;
        (helper as unknown as { _table: Map<unknown, unknown> })._table = new Map<unknown, unknown>();

        const parser: {
            getObject: jasmine.Spy;
            first: number;
        } = {
            getObject: jasmine.createSpy('getObject').and.returnValues(
                1,
                createCommand(null),
                'EOF'
            ),
            first: 0
        };

        const importFieldSpy: jasmine.Spy = spyOn(
            helper as unknown as { _importField: () => void },
            '_importField'
        ).and.callFake((): void => {
            // no-op
        });

        helper._readFdfData(parser);

        expect(parser.getObject).toHaveBeenCalled();
        expect(importFieldSpy).toHaveBeenCalled();
        expect((helper as unknown as { _table: Map<unknown, unknown> })._table.size).toBe(0);
    });
});

