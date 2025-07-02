import { _PdfDictionary, _PdfName, _PdfReference } from './../pdf-primitives';
import { _PdfCrossReference } from './../pdf-cross-reference';
import { PdfField, PdfTextBoxField, PdfButtonField, PdfCheckBoxField, PdfRadioButtonListField, PdfComboBoxField, PdfListBoxField, PdfSignatureField } from './field';
import { _getInheritableProperty, _getPageIndex, _isNullOrUndefined } from './../utils';
import { PdfFormFieldsTabOrder, _FieldFlag, _SignatureFlag } from './../enumerator';
import { PdfPage } from './../pdf-page';
import { PdfAnnotationCollection } from './../annotations/annotation-collection';
import { PdfWidgetAnnotation } from './../annotations/annotation';
import { PdfDocument } from '../pdf-document';
import { _PdfCatalog } from '../pdf-catalog';
/**
 * Represents a PDF form.
 * ```typescript
 * // Load an existing PDF document
 * let document: PdfDocument = new PdfDocument(data, password);
 * // Access the form of the PDF document
 * let form: PdfForm = document.form;
 * // Save the document
 * document.save('output.pdf');
 * // Destroy the document
 * document.destroy();
 * ```
 */
export class PdfForm {
    _crossReference: _PdfCrossReference;
    _dictionary: _PdfDictionary;
    _fields: Array<_PdfReference>;
    _widgetReferences: Array<_PdfReference>;
    _parsedFields: Map<number, PdfField>;
    _needAppearances: boolean;
    _isDefaultAppearance: boolean = false;
    _hasKids: boolean = false;
    _setAppearance: boolean = false;
    _exportEmptyFields: boolean = false;
    _fieldNames: Array<string>;
    _indexedFieldNames: Array<string>;
    _actualFieldNames: Array<string>;
    _indexedActualFieldNames: Array<string>;
    _tabOrder: PdfFormFieldsTabOrder;
    _fieldCollection: PdfField[] = [];
    _tabCollection: Map<number, PdfFormFieldsTabOrder>;
    _signFlag: _SignatureFlag = _SignatureFlag.none;
    _isNeedAppearances: boolean = false;
    _formNames: Array<string> = [];
    /**
     * Represents a loaded from the PDF document.
     *
     * @private
     * @param {_PdfDictionary} dictionary Form dictionary.
     * @param {_PdfCrossReference} crossReference Cross reference object.
     */
    constructor(dictionary: _PdfDictionary, crossReference: _PdfCrossReference) {
        this._dictionary = dictionary;
        this._crossReference = crossReference;
        this._parsedFields = new Map();
        this._fields = [];
        this._createFields();
    }
    /**
     * Gets the fields count (Read only).
     *
     * @returns {number} Fields count.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access loaded form
     * let form: PdfForm = document.form;
     * // Gets the fields count
     * let count: number = form.count;
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get count(): number {
        return this._fields.length;
    }
    /**
     *  Gets a value indicating whether need appearances (Read only).
     *
     * @returns {boolean} Need appearances.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access loaded form
     * let form: PdfForm = document.form;
     * // Gets the boolean flag indicating need appearances
     * let needAppearances: number = form.needAppearances;
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get needAppearances(): boolean {
        if (this._dictionary.has('NeedAppearances')) {
            this._needAppearances = this._dictionary.get('NeedAppearances');
        }
        return this._needAppearances;
    }
    /**
     *  Gets a value indicating whether allow to export empty fields or not.
     *
     * @returns {boolean} Export empty fields.
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access loaded form
     * let form: PdfForm = document.form;
     * // Gets a value indicating whether allow to export empty fields or not.
     * let exportEmptyFields: boolean = form.exportEmptyFields;
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get exportEmptyFields(): boolean {
        return this._exportEmptyFields;
    }
    /**
     *  Sets a value indicating whether allow to export empty fields or not.
     *
     * @param {boolean} value Export empty fields.
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access loaded form
     * let form: PdfForm = document.form;
     * // Sets a value indicating whether allow to export empty fields or not.
     * form.exportEmptyFields = false;
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    set exportEmptyFields(value: boolean) {
        this._exportEmptyFields = value;
    }
    get _signatureFlag(): _SignatureFlag {
        return this._signFlag;
    }
    set _signatureFlag(value: _SignatureFlag) {
        if (value !== this._signFlag) {
            this._signFlag = value;
            this._dictionary.update('SigFlags', value);
        }
    }
    /**
     * Gets the `PdfField` at the specified index.
     *
     * @param {number} index Field index.
     * @returns {PdfField} Loaded PDF form field at the specified index.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the loaded form field
     * let field: PdfField = document.form.fieldAt(0);
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    fieldAt(index: number): PdfField {
        if (index < 0 || index >= this._fields.length) {
            throw Error('Index out of range.');
        }
        let field: PdfField;
        if (this._parsedFields.has(index)) {
            field = this._parsedFields.get(index);
            this._isNeedAppearances = true;
        } else {
            let dictionary: _PdfDictionary;
            const ref: _PdfReference = this._fields[index]; // eslint-disable-line
            if (ref && ref instanceof _PdfReference) {
                dictionary = this._crossReference._fetch(ref);
            }
            if (dictionary) {
                field = this._parseFields(dictionary, ref);
                this._parsedFields.set(index, field);
                if (field && field instanceof PdfField) {
                    field._annotationIndex = index;
                }
            }
        }
        return field;
    }
    _parseFields(dictionary: _PdfDictionary, reference: _PdfReference): PdfField {
        let field: PdfField;
        if (dictionary) {
            const key: _PdfName = _getInheritableProperty(dictionary, 'FT', false, true, 'Parent');
            let fieldFlags: number = 0;
            const flag: number = _getInheritableProperty(dictionary, 'Ff', false, true, 'Parent');
            if (typeof flag !== 'undefined') {
                fieldFlags = flag;
            }
            if (key) {
                switch (key.name.toLowerCase()) {
                case 'tx':
                    field = PdfTextBoxField._load(this, dictionary, this._crossReference, reference);
                    break;
                case 'btn':
                    if ((fieldFlags & _FieldFlag.pushButton) !== 0) {
                        field = PdfButtonField._load(this, dictionary, this._crossReference, reference);
                    } else if ((fieldFlags & _FieldFlag.radio) !== 0) {
                        field = PdfRadioButtonListField._load(this, dictionary, this._crossReference, reference);
                    } else {
                        field = PdfCheckBoxField._load(this, dictionary, this._crossReference, reference);
                    }
                    break;
                case 'ch':
                    if ((fieldFlags & _FieldFlag.combo) !== 0) {
                        field = PdfComboBoxField._load(this, dictionary, this._crossReference, reference);
                    } else {
                        field = PdfListBoxField._load(this, dictionary, this._crossReference, reference);
                    }
                    break;
                case 'sig':
                    field = PdfSignatureField._load(this, dictionary, this._crossReference, reference);
                    break;
                }
            }
        }
        return field;
    }
    /**
     * Add a new `PdfField`.
     *
     * @param {PdfField} field Field object to add.
     * @returns {number} Field index.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Add a new form field
     * let index: number = document.form.add(field);
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    add(field: PdfField): number {
        this._fields.push(field._ref);
        this._dictionary.update('Fields', this._fields);
        this._parsedFields.set(this._fields.length - 1, field);
        field._form = this;
        this._crossReference._root._updated = true;
        if (field instanceof PdfSignatureField) {
            field._form._signatureFlag = _SignatureFlag.signatureExists | _SignatureFlag.appendOnly;
        }
        this._isNeedAppearances = true;
        return (this._fields.length - 1);
    }
    /**
     * Remove the specified PDF form field.
     *
     * @param {PdfField} field Field object to remove.
     * @returns {void} Nothing.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the loaded form field
     * let field: PdfField = document.form.fieldAt(3);
     * // Remove the form field
     * document.form.removeField(field);
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    removeField(field: PdfField): void {
        const index: number = this._fields.indexOf(field._ref);
        if (index >= 0) {
            this.removeFieldAt(index);
        }
    }
    /**
     * Remove the PDF form field from specified index.
     *
     * @param {number} index Field index to remove.
     * @returns {void} Nothing.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Remove the form field from the specified index
     * document.form.removeFieldAt(3);
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    removeFieldAt(index: number): void {
        const field: PdfField = this.fieldAt(index);
        if (field) {
            if (field._kidsCount > 0) {
                for (let i: number = field._kidsCount - 1; i >= 0; i--) {
                    const item: PdfWidgetAnnotation = field.itemAt(i);
                    let page: PdfPage;
                    if (item) {
                        page = item._getPage();
                        if (page) {
                            page._removeAnnotation(item._ref);
                        }
                    }
                }
            } else if (field._dictionary.has('Subtype') && field._dictionary.get('Subtype').name === 'Widget') {
                const page: PdfPage = field.page;
                if (page) {
                    page._removeAnnotation(field._ref);
                }
            }
            this._parsedFields.delete(index);
            this._reorderParsedAnnotations(index);
        }
        this._fields.splice(index, 1);
        const document: PdfDocument = this._crossReference._document;
        const catalog: _PdfCatalog = document._catalog;
        if (this._fields.length === 0 && document && catalog && catalog._catalogDictionary) {
            catalog._catalogDictionary._updated = true;
            this._crossReference._allowCatalog = true;
        }
        this._dictionary.set('Fields', this._fields);
        this._dictionary._updated = true;
    }
    _reorderParsedAnnotations(index: number): void {
        const result: Map<number, PdfField> = new Map<number, PdfField>();
        this._parsedFields.forEach((value: PdfField, key: number) => {
            if (key > index) {
                result.set(key - 1, value);
            } else {
                result.set(key, value);
            }
        });
        this._parsedFields = result;
    }
    /**
     * Sets the flag to indicate the new appearance creation
     * If true, appearance will not be created. Default appearance has been considered.
     * If false, new appearance stream has been created from field values and updated as normal appearance.
     *
     * @param {boolean} value Set default appearance.
     * @returns {void} Nothing.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Set boolean flag to create a new appearance stream for form fields.
     * document.form.setDefaultAppearance(false);
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    setDefaultAppearance(value: boolean): void {
        this._setAppearance = !value;
        this._needAppearances = value;
        this._isDefaultAppearance = value;
    }
    /**
     * Order the form fields.
     *
     * @returns {void}
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Order the form fields.
     * document.form.orderFormFields();
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    orderFormFields(): void
    /**
     * Order the form fields based on page tab order.
     *
     * @param {PdfFormFieldsTabOrder} tabOrder tab order types for form fields.
     * @returns {void}
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Order the form fields based on page tab order.
     * document.form.orderFormFields(PdfFormFieldsTabOrder.row);
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    orderFormFields(tabOrder: PdfFormFieldsTabOrder): void
    /**
     * Order the form fields based on tab collection.
     *
     * @param {Map<number, PdfFormFieldsTabOrder>} tabCollection collection of tab order with page index.
     * @returns {void}
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * //Set the tab collection to order the form fields.
     * let values: Map<number, PdfFormFieldsTabOrder> = new Map<number, PdfFormFieldsTabOrder>();
     * // Set the tab order for the page index 1.
     * values.set(1, PdfFormFieldsTabOrder.column);
     * // Set the tab order for the page index 2.
     * values.set(2, PdfFormFieldsTabOrder.row);
     * // Order the form fields based on tab collection.
     * document.form.orderFormFields(values);
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    orderFormFields(tabCollection: Map<number, PdfFormFieldsTabOrder>): void
    orderFormFields(tabOrder?: PdfFormFieldsTabOrder | Map<number, PdfFormFieldsTabOrder>): void {
        if (tabOrder === null || typeof tabOrder === 'undefined') {
            this.orderFormFields(new Map<number, PdfFormFieldsTabOrder>());
        } else {
            let tab: _PdfName;
            const document: PdfDocument = this._crossReference._document;
            let value: PdfField[];
            if (tabOrder && tabOrder instanceof Map) {
                let setTabOrder: boolean = true;
                if (tabOrder.size > 0) {
                    this._tabCollection = tabOrder;
                } else {
                    setTabOrder = false;
                    this._tabCollection = tabOrder;
                }
                const fieldCollection: Map<number, PdfField[]> = new Map<number, PdfField[]>();
                this._fieldCollection = this._getFields();
                if (_isNullOrUndefined(this._fieldCollection) && this._fieldCollection.length > 0) {
                    const page: PdfPage = this._fieldCollection[0].page;
                    if (page && document) {
                        this._fieldCollection.forEach((field: PdfField) => {
                            if (field.page) {
                                const index: number = _getPageIndex(document, this._sortItemByPageIndex(field, true)._pageDictionary);
                                if (index >= 0) {
                                    if (fieldCollection.has(index)) {
                                        value = fieldCollection.get(index);
                                        value.push(field);
                                    } else {
                                        value = [];
                                        value.push(field);
                                        fieldCollection.set(index, value);
                                    }
                                    const page: PdfPage = document.getPage(index);
                                    if (!this._tabCollection.has(index)) {
                                        this._tabCollection.set(index, page.tabOrder);
                                    }
                                    if (setTabOrder) {
                                        page.tabOrder = this._tabCollection.get(index);
                                    }
                                }
                            }
                        });
                        let fieldsCount: number = 0;
                        fieldCollection.forEach((value: PdfField[], key: number) => {
                            this._tabOrder = this._tabCollection.get(key);
                            if (this._tabOrder !== PdfFormFieldsTabOrder.structure) {
                                const fields: PdfField[] = value;
                                fields.sort((pdfField1: object, pdfField2: object) => {
                                    return this._compareFields(pdfField1, pdfField2);
                                });
                                fields.forEach((field: PdfField, j: number) => {
                                    const fieldIndex: number = this._fieldCollection.indexOf(field);
                                    if (fieldIndex !== -1 && fieldIndex !== fieldsCount + j) {
                                        const fieldToMove: PdfField = this._fieldCollection[<number>fieldIndex];
                                        this._fieldCollection.splice(fieldIndex, 1);
                                        this._fieldCollection.splice(fieldsCount + j, 0, fieldToMove);
                                    }
                                });
                            }
                            fieldsCount += value.length;
                        });
                    }
                }
            } else {
                this._tabOrder = tabOrder as PdfFormFieldsTabOrder;
                tab = this._getOrder(this._tabOrder);
                this._fieldCollection = this._getFields();
                this._fieldCollection.sort((pdfField1: object, pdfField2: object) => {
                    return this._compareFields(pdfField1, pdfField2);
                });
            }
            this._parsedFields.clear();
            this._fieldCollection.forEach((field: PdfField, i: number) => {
                this._parsedFields.set(i, field);
                this._fields[<number>i] = field._ref;
                if (tab) {
                    field.page._pageDictionary.update('Tabs', tab);
                }
            });
            this._dictionary.update('Fields', this._fields);
        }
    }
    _createFields(): void {
        let fields: Array<any>; // eslint-disable-line
        const fieldsMap: Map<_PdfDictionary, _PdfReference> = new Map<_PdfDictionary, _PdfReference>();
        if (this._dictionary && this._dictionary.has('Fields')) {
            fields = this._dictionary.get('Fields');
        }
        let count: number = 0;
        const nodes: any[] = []; // eslint-disable-line
        const terminalFields: _PdfDictionary[] = [];
        while (fields && fields.length > 0) {
            for (; count < fields.length; count++) {
                const ref: _PdfReference = fields[count]; // eslint-disable-line
                let fieldDictionary: _PdfDictionary;
                if (ref && ref instanceof _PdfReference) {
                    fieldDictionary = this._crossReference._fetch(ref);
                    if (fieldDictionary) {
                        fieldsMap.set(fieldDictionary, ref);
                    }
                }
                let fieldKids: [];
                if (fieldDictionary && fieldDictionary.has('Kids')) {
                    fieldKids = fieldDictionary.get('Kids');
                    if (fieldKids && fieldKids.length > 0) {
                        fieldKids.forEach((reference: _PdfReference) => {
                            if (reference instanceof _PdfReference) {
                                const kidsDict: _PdfDictionary = this._crossReference._fetch(reference);
                                if (kidsDict) {
                                    fieldsMap.set(kidsDict, reference);
                                    if (!kidsDict.has('Parent')) {
                                        kidsDict.update('Parent', ref);
                                    }
                                }
                            }
                        });
                    }
                }
                if (!fieldKids) {
                    if (fieldDictionary) {
                        if (terminalFields.indexOf(fieldDictionary) === -1) {
                            terminalFields.push(fieldDictionary);
                            if (fieldDictionary.has('T')) {
                                const fieldName: string = fieldDictionary.get('T');
                                if (this._formNames.indexOf(fieldName) === -1) {
                                    this._formNames.push(fieldName);
                                }
                            }
                        }
                    }
                } else {
                    const isNode: boolean = (!fieldDictionary.has('FT')) || this._isNode(fieldKids);
                    if (isNode) {
                        nodes.push({ fields, count });
                        this._hasKids = true;
                        count = -1;
                        fields = fieldKids;
                    } else {
                        terminalFields.push(fieldDictionary);
                        if (fieldDictionary.has('T')) {
                            const fieldName: string = fieldDictionary.get('T');
                            if (this._formNames.indexOf(fieldName) === -1) {
                                this._formNames.push(fieldName);
                            }
                        }
                    }
                }
            }
            if (nodes.length === 0) {
                break;
            }
            const entry: any = nodes.pop(); // eslint-disable-line
            fields = entry.fields;
            count = entry.count + 1;
        }
        this._createFieldCollection(terminalFields, fieldsMap);
    }
    private _createFieldCollection(terminalFields: _PdfDictionary[], fieldsMap: Map<_PdfDictionary, _PdfReference>): void {
        const pageWidgets: Map<number, _PdfDictionary[]> = new Map();
        const document: PdfDocument = this._crossReference._document;
        const widgetCollection: _PdfReference[] = [];
        if (document) {
            for (let i: number = 0; i < document.pageCount; i++) {
                const page: PdfPage = document.getPage(i);
                if (!page || !page._pageDictionary) {
                    continue;
                }
                const pageDictionary: _PdfDictionary = page._pageDictionary;
                let widgetAnnots: _PdfReference[] = [];
                if (pageDictionary && pageDictionary.has('Annots')) {
                    widgetAnnots = pageDictionary.getRaw('Annots');
                    if (widgetAnnots instanceof _PdfReference) {
                        widgetAnnots = this._crossReference._fetch(widgetAnnots);
                    }
                }
                const widgets: _PdfDictionary[] = [];
                for (let j: number = 0; j < widgetAnnots.length; j++) {
                    const ref: _PdfReference = widgetAnnots[<number>j];
                    if (ref && ref instanceof _PdfReference) {
                        widgetCollection.push(ref);
                        const annotDictionary: _PdfDictionary = this._crossReference._fetch(ref);
                        if (annotDictionary && annotDictionary.has('Subtype') &&
                            annotDictionary.get('Subtype').name === 'Widget') {
                            annotDictionary._reference = ref;
                            widgets.push(annotDictionary);
                        }
                    }
                }
                pageWidgets.set(i, widgets);
            }
        }
        for (let i: number = 0; i < terminalFields.length; i++) {
            const fieldDictionary: _PdfDictionary = terminalFields[<number>i];
            const fieldRef: _PdfReference = fieldsMap.get(fieldDictionary);
            if (fieldRef && this._removeInvalidFields(fieldDictionary, pageWidgets, fieldRef, widgetCollection)) {
                if (this._fields.indexOf(fieldRef) === -1) {
                    this._fields.push(fieldRef);
                }
            }
        }
        if (terminalFields.length > 0) {
            this._processRemainingWidgets();
        }
    }
    private _processRemainingWidgets(): void {
        const document: PdfDocument = this._crossReference._document;
        for (let i: number = 0; i < document.pageCount; i++) {
            const page: PdfPage = document.getPage(i);
            if (!page || !page._pageDictionary) {
                continue;
            }
            const pageDictionary: _PdfDictionary = page._pageDictionary;
            let widgetAnnots: _PdfReference[] = [];
            if (pageDictionary.has('Annots')) {
                widgetAnnots = pageDictionary.getRaw('Annots');
                if (widgetAnnots instanceof _PdfReference) {
                    widgetAnnots = this._crossReference._fetch(widgetAnnots);
                }
            }
            for (let j: number = 0; j < widgetAnnots.length; j++) {
                const ref: _PdfReference = widgetAnnots[<number>j];
                if (ref && ref instanceof _PdfReference && this._fields.indexOf(ref) === -1) {
                    const annotDictionary: _PdfDictionary = this._crossReference._fetch(ref);
                    if (annotDictionary &&
                        annotDictionary.has('FT') &&
                        annotDictionary.has('Subtype') &&
                        annotDictionary.get('Subtype').name === 'Widget' &&
                        annotDictionary.has('T') && annotDictionary.has('P') &&
                        this._formNames.indexOf(annotDictionary.get('T')) === -1) {
                        this._fields.push(ref);
                    }
                }
            }
        }
    }
    _hasValidKids(dictionary: _PdfDictionary): boolean {
        const kidsArray: any[] = dictionary.get('Kids'); // eslint-disable-line
        return kidsArray && kidsArray.length > 0;
    }
    _removeInvalidFields(dictionary: _PdfDictionary, pageWidgets: Map<number, _PdfDictionary[]>, ref: _PdfReference,
                         widgetCollection: _PdfReference[]): boolean {
        if (!dictionary) {
            return false;
        }
        if (dictionary.has('Kids') && this._hasValidKids(dictionary)) {
            const kidsArray: any[] = dictionary.get('Kids'); // eslint-disable-line
            const invalidKids: number[] = [];
            let hasValidChild: boolean = false;
            for (let i: number = 0; i < kidsArray.length; i++) {
                let childDictionary: _PdfDictionary;
                const kidRef: any = kidsArray[<number>i]; // eslint-disable-line
                if (kidRef instanceof _PdfReference) {
                    childDictionary = this._crossReference._fetch(kidRef);
                } else if (kidRef instanceof _PdfDictionary) {
                    childDictionary = kidRef;
                }
                if (childDictionary) {
                    if (childDictionary.has('P')) {
                        const pageRef: any = childDictionary.get('P'); // eslint-disable-line
                        let pageDictionary: _PdfDictionary;
                        if (pageRef instanceof _PdfReference) {
                            pageDictionary = this._crossReference._fetch(pageRef);
                        } else if (pageRef instanceof _PdfDictionary) {
                            pageDictionary = pageRef;
                        }
                        if (pageDictionary && pageDictionary.has('Annots')) {
                            let annots: any = pageDictionary.get('Annots'); // eslint-disable-line
                            if (annots instanceof _PdfReference) {
                                annots = this._crossReference._fetch(annots);
                            }
                            if (annots && Array.isArray(annots)) {
                                const kidExists: boolean = annots.indexOf(kidRef) !== -1;
                                if (!kidExists) {
                                    invalidKids.push(i);
                                    continue;
                                }
                            }
                        }
                    }
                    const isChildValid: boolean = this._removeInvalidFields(childDictionary, pageWidgets, kidRef, widgetCollection);
                    if (isChildValid) {
                        hasValidChild = true;
                    } else {
                        invalidKids.push(i);
                    }
                } else {
                    invalidKids.push(i);
                }
            }
            for (let i: number = invalidKids.length - 1; i >= 0; i--) {
                kidsArray.splice(invalidKids[<number>i], 1);
            }
            if (kidsArray.length > 0 && hasValidChild) {
                dictionary.update('Kids', kidsArray);
                return true;
            }
            return false;
        } else {
            return this._validateField(dictionary, pageWidgets, ref, widgetCollection);
        }
    }
    _validateField(fieldDictionary: _PdfDictionary, pageWidgets: Map<number, _PdfDictionary[]>, ref: _PdfReference,
                   widgetCollection: _PdfReference[]): boolean {
        if (!fieldDictionary || !pageWidgets) {
            return false;
        }
        if (fieldDictionary.has('P') && fieldDictionary.has('Rect')) {
            return true;
        }
        if (widgetCollection && widgetCollection.indexOf(ref) !== -1) {
            return true;
        }
        pageWidgets.forEach((widgets: _PdfDictionary[], pageIndex: number) => {
            if (widgets && widgets.length > 0) {
                for (let j: number = 0; j < widgets.length; j++) {
                    const widget: _PdfDictionary = widgets[<number>j];
                    if (widget && this._compareWidgets(widget, fieldDictionary)) {
                        if (this._fields.indexOf(widget._reference) === -1) {
                            this._fields.push(widget._reference);
                        }
                        return;
                    }
                }
            }
        });
        return false;
    }
    _compareWidgets(widget: _PdfDictionary, annotDictionary: _PdfDictionary): boolean {
        if (!widget || !annotDictionary) {
            return false;
        }
        if (!(widget.has('FT') && annotDictionary.has('FT'))) {
            return false;
        }
        const widgetType: _PdfName = widget.get('FT');
        const annotType: _PdfName = annotDictionary.get('FT');
        if (widgetType && annotType && widgetType.name !== annotType.name) {
            return false;
        }
        let widgetName: string;
        let annotName: string;
        if (widget.has('T')) {
            widgetName = widget.get('T');
        }
        if (annotDictionary.has('T')) {
            annotName = annotDictionary.get('T');
        }
        if (widgetName && annotName && widgetName !== annotName) {
            return false;
        }
        let widgetValue: any; // eslint-disable-line
        let annotValue: any; // eslint-disable-line
        if (widget.has('V')) {
            widgetValue = widget.get('V');
        }
        if (annotDictionary.has('V')) {
            annotValue = annotDictionary.get('V');
        }
        if (typeof widgetValue === 'string' && typeof annotValue === 'string') {
            return true;
        } else if (widgetValue instanceof _PdfName && annotValue instanceof _PdfName && widgetValue.name === annotValue.name) {
            return true;
        }
        return false;
    }
    _isNode(kids: Array<any>) : boolean { // eslint-disable-line
        let isNode: boolean = false;
        if (_isNullOrUndefined(kids) && kids.length > 0) {
            const entry: any = kids[0]; // eslint-disable-line
            let dictionary: _PdfDictionary;
            if (_isNullOrUndefined(entry)) {
                if (entry instanceof _PdfDictionary) {
                    dictionary = entry;
                } else if (entry instanceof _PdfReference) {
                    dictionary = this._crossReference._fetch(entry);
                }
            }
            if (dictionary && dictionary.has('Subtype')) {
                const subtype: _PdfName = dictionary.get('Subtype');
                if (subtype && subtype.name !== 'Widget') {
                    isNode = true;
                }
            }
        }
        return isNode;
    }
    _parseWidgetReferences(): Array<_PdfReference> {
        if (typeof this._widgetReferences === 'undefined' && this.count > 0) {
            this._widgetReferences = [];
            this._fields.forEach((fieldReference: _PdfReference) => {
                const dictionary: _PdfDictionary = this._crossReference._fetch(fieldReference);
                if (dictionary) {
                    if (dictionary.has('Kids')) {
                        const fieldKids: [] = dictionary.get('Kids');
                        if (fieldKids && fieldKids.length > 0) {
                            fieldKids.forEach((kidReference: any) => { // eslint-disable-line
                                let kidDictionary: _PdfDictionary;
                                if (kidReference && kidReference instanceof _PdfDictionary) {
                                    kidDictionary = kidReference;
                                } else if (kidReference && kidReference instanceof _PdfReference) {
                                    kidDictionary = this._crossReference._fetch(kidReference);
                                }
                                if (kidDictionary && kidDictionary.has('Subtype')) {
                                    const subtype: _PdfName = kidDictionary.get('Subtype');
                                    if (subtype && subtype.name === 'Widget') {
                                        this._widgetReferences.push(kidReference);
                                    }
                                }
                            });
                        }
                    } else {
                        this._widgetReferences.push(fieldReference);
                    }
                }
            });
        }
        return this._widgetReferences;
    }
    _doPostProcess(isFlatten: boolean, pageToImport?: PdfPage): void {
        for (let i: number = this.count - 1; i >= 0; i--) {
            const field: PdfField = this.fieldAt(i);
            if (field && !field._isLoaded && typeof field._tabIndex !== 'undefined' && field._tabIndex >= 0) {
                const page: PdfPage = field._page;
                if (page &&
                    page._pageDictionary.has('Annots') &&
                    (page.tabOrder === PdfFormFieldsTabOrder.manual ||  this._tabOrder === PdfFormFieldsTabOrder.manual)) {
                    const annots: _PdfReference[] = page._pageDictionary.get('Annots');
                    const annotationCollection: PdfAnnotationCollection = new PdfAnnotationCollection(annots, this._crossReference, page);
                    page._annotations = annotationCollection;
                    for (let i: number = 0; i < field.itemsCount; i++) {
                        const item: PdfWidgetAnnotation = field.itemAt(i);
                        if (item && item instanceof PdfWidgetAnnotation) {
                            let index: number = annots.indexOf(item._ref);
                            if (index < 0) {
                                index = field._annotationIndex;
                            }
                            if (index >= 0) {
                                const annotations: _PdfReference[] = page.annotations._reArrange(field._ref, field._tabIndex, index);
                                page._pageDictionary.update('Annots', annotations);
                                page._pageDictionary._updated = true;
                            }
                        }
                    }
                }
            }
            if (field && ((pageToImport && field.page === pageToImport) || !pageToImport)) {
                if (pageToImport) {
                    field._isImport = true;
                }
                field._doPostProcess(isFlatten || field.flatten);
                if (!isFlatten && field.flatten || (isFlatten && pageToImport && field.page === pageToImport)) {
                    this.removeFieldAt(i);
                }
            }
        }
    }
    _getFieldIndex(name: string): number {
        let index: number = -1;
        if (this.count > 0) {
            if (!this._fieldNames) {
                this._fieldNames = [];
            }
            if (!this._indexedFieldNames) {
                this._indexedFieldNames = [];
            }
            if (!this._actualFieldNames) {
                this._actualFieldNames = [];
            }
            if (!this._indexedActualFieldNames) {
                this._indexedActualFieldNames = [];
            }
            for (let i: number = 0; i < this.count; i++) {
                const field: PdfField = this.fieldAt(i);
                if (field) {
                    const fieldName: string = field.name;
                    if (fieldName) {
                        this._fieldNames.push(fieldName);
                        this._indexedFieldNames.push(fieldName.split('[')[0]);
                    }
                    const actualName: string = field.actualName;
                    if (actualName) {
                        this._actualFieldNames.push(actualName);
                        this._indexedActualFieldNames.push(actualName.split('[')[0]);
                    }
                }
            }
            let nameIndex: number = this._fieldNames.indexOf(name);
            if (nameIndex !== -1) {
                index = nameIndex;
            } else {
                nameIndex = this._indexedFieldNames.indexOf(name);
                if (nameIndex !== -1) {
                    index = nameIndex;
                } else {
                    nameIndex = this._actualFieldNames.indexOf(name);
                    if (nameIndex !== -1) {
                        index = nameIndex;
                    } else {
                        nameIndex = this._indexedActualFieldNames.indexOf(name);
                        if (nameIndex !== -1) {
                            index = nameIndex;
                        }
                    }
                }
            }
        }
        return index;
    }
    _getFields(): PdfField[] {
        const fields: PdfField[] = [];
        for (let i: number = 0; i < this._fields.length; i++) {
            const field: PdfField = this.fieldAt(i);
            if (field && field instanceof PdfField) {
                fields.push(field);
            }
        }
        return fields;
    }
    _getOrder(tabOrder: PdfFormFieldsTabOrder): _PdfName {
        if (tabOrder !== PdfFormFieldsTabOrder.none) {
            let tabs: string = '';
            if (tabOrder === PdfFormFieldsTabOrder.row) {
                tabs = 'R';
            } else if (tabOrder === PdfFormFieldsTabOrder.column) {
                tabs = 'C';
            } else if (tabOrder === PdfFormFieldsTabOrder.structure) {
                tabs = 'S';
            }
            return _PdfName.get(tabs);
        }
        return null;
    }
    _compareFields(field1: any, field2: any): number { // eslint-disable-line
        let result: number = 0;
        let xdiff: number;
        let index: number;
        const page1: PdfPage = field1.page;
        const page2: PdfPage = field2.page;
        if (page1 && !page1._isNew && page1 instanceof PdfPage && page2 && !page2._isNew && page2 instanceof PdfPage) {
            const page1Index: number = this._sortItemByPageIndex(field1, false)._pageIndex;
            const page2Index: number = this._sortItemByPageIndex(field2, false)._pageIndex;
            let rectangle1: number[];
            if (field1._dictionary.has('Kids')) {
                rectangle1 = this._getItemRectangle(field1);
            } else {
                rectangle1 = this._getRectangle(field1._dictionary);
            }
            let rectangle2: number[];
            if (field2._dictionary.has('Kids')) {
                rectangle2 = this._getItemRectangle(field2);
            } else {
                rectangle2 = this._getRectangle(field2._dictionary);
            }
            const firstHeight: number = rectangle1[3] - rectangle1[1];
            const secondHeight: number = rectangle2[3] - rectangle2[1];
            if (rectangle1 && rectangle1.length >= 2 && rectangle2 && rectangle2.length >= 2) {
                const x1: number = rectangle1[0];
                const y1: number = rectangle1[1];
                const x2: number = rectangle2[0];
                const y2: number = rectangle2[1];
                if (typeof x1 === 'number' && typeof x2 === 'number' &&
                    typeof y1 === 'number' && typeof y2 === 'number') {
                    index = page1Index - page2Index;
                    if (this._tabOrder === PdfFormFieldsTabOrder.row) {
                        xdiff = this._compare(y2, y1);
                        if (xdiff !== 0) {
                            let isValid: boolean = xdiff === -1 && y1 > y2 && (y1 - firstHeight / 2) < y2;
                            isValid = isValid || (xdiff === 1 && y2 > y1 && (y2 - secondHeight / 2) < y1);
                            if (isValid) {
                                xdiff = 0;
                            }
                        }
                        if (index !== 0) {
                            result = index;
                        } else if (xdiff !== 0) {
                            result = xdiff;
                        } else {
                            result = this._compare(x1, x2);
                        }
                    } else if (this._tabOrder === PdfFormFieldsTabOrder.column) {
                        xdiff = this._compare(x1, x2);
                        if (index !== 0) {
                            result = index;
                        } else if (xdiff !== 0) {
                            result = xdiff;
                        } else {
                            result = this._compare(y2, y1);
                        }
                    } else if (this._tabOrder === PdfFormFieldsTabOrder.manual ||
                            this._tabOrder === PdfFormFieldsTabOrder.none ||
                            this._tabOrder === PdfFormFieldsTabOrder.structure ||
                            this._tabOrder === PdfFormFieldsTabOrder.widget) {
                        if (field1 instanceof PdfField && field2 instanceof PdfField) {
                            const field1Index: number = field1.tabIndex;
                            const field2Index: number = field2.tabIndex;
                            xdiff = this._compare(field1Index, field2Index);
                            if (index !== 0) {
                                result = index;
                            } else {
                                result = xdiff;
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
    _getRectangle(dictionary: _PdfDictionary): number[] {
        let rect: number[];
        if (dictionary && dictionary.has('Rect')) {
            rect = dictionary.getArray('Rect');
        }
        return rect;
    }
    _getItemRectangle(field: PdfField): number[] {
        let result: number[];
        const dictionary: _PdfDictionary = field._dictionary;
        if (dictionary.has('Kids')) {
            const kids: _PdfDictionary[] = dictionary.getArray('Kids');
            if (_isNullOrUndefined(kids) && kids.length >= 1) {
                if (kids.length === 1) {
                    result = this._getRectangle(kids[0]);
                } else {
                    if (field && field.itemsCount > 1) {
                        result = this._getRectangle(field.itemAt(0)._dictionary);
                    } else {
                        result = this._getRectangle(kids[0]);
                    }
                }
            }
        }
        return result;
    }
    _compare(x: number, y: number): number {
        if (x > y) {
            return 1;
        } else if (x < y) {
            return -1;
        } else {
            return 0;
        }
    }
    _compareKidsElement(x: _PdfReference, y: _PdfReference): number {
        const xDictionary: _PdfDictionary = this._crossReference._fetch(x);
        const yDictionary: _PdfDictionary = this._crossReference._fetch(y);
        const xRect: number[] = this._getRectangle(xDictionary);
        const yRect: number[] = this._getRectangle(yDictionary);
        let result: number;
        if (xRect && xRect.length >= 2 && yRect && yRect.length >= 2) {
            const x1: number = xRect[0];
            const y1: number = xRect[1];
            const x2: number = yRect[0];
            const y2: number = yRect[1];
            if (typeof x1 === 'number' && typeof x2 === 'number' &&
                typeof y1 === 'number' && typeof y2 === 'number') {
                let xdiff: number;
                if (this._tabOrder === PdfFormFieldsTabOrder.row) {
                    xdiff = this._compare(y2, y1);
                    if (xdiff !== 0) {
                        result = xdiff;
                    } else {
                        result = this._compare(x1, x2);
                    }
                } else if (this._tabOrder === PdfFormFieldsTabOrder.column) {
                    xdiff = this._compare(x1, x2);
                    if (xdiff !== 0) {
                        result = xdiff;
                    } else {
                        result = this._compare(y2, y1);
                    }
                } else {
                    result = 0;
                }
                return result;
            }
        }
        return result;
    }
    _sortItemByPageIndex(field: PdfField, hasPageTabOrder: boolean): PdfPage {
        let page: PdfPage = field.page;
        const tabOrder: PdfFormFieldsTabOrder = this._tabOrder;
        this._tabOrder = hasPageTabOrder ? field.page.tabOrder : tabOrder;
        this._sortFieldItems(field);
        if (field._isLoaded && field._kidsCount > 1) {
            page = field.itemAt(0).page;
        }
        this._tabOrder = tabOrder;
        if (typeof page === 'undefined') {
            page = field.page;
        }
        return page;
    }
    _sortFieldItems(field: PdfField): void {
        if (field._isLoaded && (field instanceof PdfTextBoxField ||
            field instanceof PdfListBoxField ||
            field instanceof PdfCheckBoxField ||
            field instanceof PdfRadioButtonListField)) {
            const collection: any[] = field._parseItems(); // eslint-disable-line
            collection.sort((item1: any, item2: any) => { // eslint-disable-line
                return this._compareFieldItem(item1, item2);
            });
            field._parsedItems.clear();
            collection.forEach((item: any, i: number) => { // eslint-disable-line
                field._parsedItems.set(i, item);
            });
        }
    }
    _compareFieldItem(item1: any, item2: any): number { // eslint-disable-line
        let result: number = 0;
        if (typeof item1 !== 'undefined' && typeof item2 !== 'undefined') {
            const page1: PdfPage = item1.page;
            const page2: PdfPage = item2.page;
            const array1: number[] = this._getRectangle(item1._dictionary);
            const array2: number[] = this._getRectangle(item2._dictionary);
            if (array1 && array2) {
                const x1: number = array1[0];
                const y1: number = array1[1];
                const x2: number = array2[0];
                const y2: number = array2[1];
                let xdiff: number;
                if (this._tabOrder === PdfFormFieldsTabOrder.row) {
                    xdiff = this._compare(page1._pageIndex, page2._pageIndex);
                    if (xdiff !== 0) {
                        result = xdiff;
                    } else {
                        xdiff = this._compare(y2, y1);
                        if (xdiff !== 0) {
                            result = xdiff;
                        } else {
                            result = this._compare(x1, x2);
                        }
                    }
                } else if (this._tabOrder === PdfFormFieldsTabOrder.column) {
                    xdiff = this._compare(page1._pageIndex, page2._pageIndex);
                    if (xdiff !== 0) {
                        result = xdiff;
                    } else {
                        xdiff = this._compare(x1, x2);
                        if (xdiff !== 0) {
                            result = xdiff;
                        } else {
                            result = this._compare(y2, y1);
                        }
                    }
                }
            }
        }
        return result;
    }
    _clear(): void {
        this._fields = [];
        this._parsedFields = new Map();
    }
}
