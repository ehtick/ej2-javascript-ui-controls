import {
    PdfAnnotation,
    PdfButtonField,
    PdfCheckBoxField,
    PdfComboBoxField,
    PdfDocument,
    PdfListBoxField,
    PdfListFieldItem,
    PdfPage,
    PdfRadioButtonListField,
    PdfRotationAngle,
    PdfSignatureField,
    PdfTextBoxField,
    PdfWidgetAnnotation,
    Rectangle,
    _PdfDictionary
} from '@syncfusion/ej2-pdf';
import * as ej2Pdf from '@syncfusion/ej2-pdf';
import { PdfDataExtractor } from '../../src/pdf-data-extract/core/pdf-data-extractor';
import { PdfStructureElement } from '../../src/pdf-data-extract/core/pdf-structure-element';
import { PdfTagType } from '../../src/pdf-data-extract/core/text-extraction/enumerator';
import * as utils from '../../src/pdf-data-extract/core/utils';

describe('PdfStructureElement strict AAA behavior coverage', () => {
    function createDictionary(map: { [key: string]: unknown }): _PdfDictionary {
        return {
            has: function (key: string): boolean {
                return Object.prototype.hasOwnProperty.call(map, key);
            },
            get: function (key: string): unknown {
                return map[key];
            }
        } as unknown as _PdfDictionary;
    }

    function createPage(
        pageIndex: number,
        rotation: PdfRotationAngle,
        resourcesDictionary?: _PdfDictionary
    ): PdfPage {
        const pageDictionary: _PdfDictionary = createDictionary(
            typeof resourcesDictionary === 'undefined'
                ? {}
                : { Resources: resourcesDictionary }
        );

        return {
            _pageIndex: pageIndex,
            rotation: rotation,
            size: { width: 200, height: 300 },
            _pageDictionary: pageDictionary,
            graphics: {
                drawRectangle: jasmine.createSpy('drawRectangle')
            },
            annotations: {
                count: 0,
                at: jasmine.createSpy('at')
            }
        } as unknown as PdfPage;
    }

    function createTextLine(
        text: string,
        bounds: Rectangle
    ): { text: string; bounds: Rectangle } {
        return {
            text: text,
            bounds: bounds
        };
    }

    function createDocument(page: PdfPage, fields: unknown[]): PdfDocument {
        return {
            _crossReference: {},
            getPage: jasmine.createSpy('getPage').and.returnValue(page),
            form: {
                count: fields.length,
                fieldAt: function (index: number): unknown {
                    return fields[index];
                }
            }
        } as unknown as PdfDocument;
    }

    function createWidgetItem(
        dictionary: _PdfDictionary,
        bounds: Rectangle
    ): PdfWidgetAnnotation {
        return {
            _dictionary: dictionary,
            bounds: bounds
        } as unknown as PdfWidgetAnnotation;
    }

    function createListFieldItem(
        dictionary: _PdfDictionary,
        bounds: Rectangle
    ): PdfListFieldItem {
        return {
            _dictionary: dictionary,
            bounds: bounds
        } as unknown as PdfListFieldItem;
    }

    function createAnnotation(
        dictionary: _PdfDictionary,
        bounds: Rectangle
    ): PdfAnnotation {
        return {
            _dictionary: dictionary,
            bounds: bounds
        } as unknown as PdfAnnotation;
    }

    function createBaseElement(document: PdfDocument, page: PdfPage): PdfStructureElement {
        const element: PdfStructureElement = PdfStructureElement._load(
            document,
            createDictionary({}),
            0,
            undefined as unknown as PdfStructureElement
        );
        element._page = page;
        element._contentId = [];
        element._childElements = [];
        return element;
    }

    function createFormParent(): PdfStructureElement {
        const parent: PdfStructureElement = PdfStructureElement._load(
            undefined as unknown as PdfDocument,
            createDictionary({}),
            0,
            undefined as unknown as PdfStructureElement
        );
        parent._tagType = PdfTagType.form;
        return parent;
    }

    function assignFieldBase<T>(field: T, dictionary: _PdfDictionary): T {
        Object.defineProperty(field, '_dictionary', {
            value: dictionary,
            writable: true,
            configurable: true
        });
        Object.defineProperty(field, '_kids', {
            value: [{}],
            writable: true,
            configurable: true
        });
        return field;
    }

    it('should load defaults and resolve page from parent fallback child path in page getter', () => {
        // Arrange
        const childPage: PdfPage = createPage(9, PdfRotationAngle.angle0);
        const element: PdfStructureElement = PdfStructureElement._load(
            undefined as unknown as PdfDocument,
            createDictionary({}),
            5,
            PdfStructureElement._load(undefined as unknown as PdfDocument, createDictionary({}), 1, undefined as unknown as PdfStructureElement)
        );

        const getPageFromElementSpy: jasmine.Spy = spyOn(element, '_getPageFromElement').and.returnValues(
            undefined,
            undefined
        );
        const getChildPageSpy: jasmine.Spy = spyOn(element, '_getChildPage').and.returnValue(childPage);

        // Act
        const resolvedPage: PdfPage = element.page;

        // Assert
        expect(element._document).toBeUndefined();
        expect(element._dictionary.has('missing')).toBeFalsy();
        expect(element._parent).toBeDefined();
        expect(element._order).toBe(5);
        expect(element._childElements).toEqual([]);
        expect(element._bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 });
        expect(element._language).toBe('');
        expect(getPageFromElementSpy.calls.count()).toBe(2);
        expect(getPageFromElementSpy.calls.argsFor(0)[0]).toBe(element);
        expect(getPageFromElementSpy.calls.argsFor(1)[0]).toBe(element.parent);
        expect(getChildPageSpy).toHaveBeenCalled();
        expect(resolvedPage).toBe(childPage);
        expect(element.page).toBe(childPage);
    });

    it('should resolve page from page dictionary using _getPageIndex and document.getPage', () => {
        // Arrange
        const resolvedPage: PdfPage = createPage(2, PdfRotationAngle.angle90);
        const document: PdfDocument = createDocument(resolvedPage, []);
        const pageDictionary: _PdfDictionary = createDictionary({ Type: 'Page' });
        const element: PdfStructureElement = PdfStructureElement._load(document, createDictionary({}), 0, undefined as unknown as PdfStructureElement);
        element._pageDictionary = pageDictionary;

        const getPageIndexSpy: jasmine.Spy = spyOn(ej2Pdf, '_getPageIndex').and.returnValue(2);

        // Act
        const page: PdfPage = element._getPageFromElement(element);

        // Assert
        expect(getPageIndexSpy).toHaveBeenCalledWith(document, pageDictionary);
        expect((document.getPage as jasmine.Spy)).toHaveBeenCalledWith(2);
        expect(page).toBe(resolvedPage);
        expect(element._page).toBe(resolvedPage);
    });

    it('should resolve page recursively from child elements in _getChildPage', () => {
        // Arrange
        const document: PdfDocument = createDocument(createPage(0, PdfRotationAngle.angle0), []);
        const parent: PdfStructureElement = PdfStructureElement._load(document, createDictionary({}), 0, undefined as unknown as PdfStructureElement);
        const childOne: PdfStructureElement = PdfStructureElement._load(document, createDictionary({}), 0, parent);
        const childTwo: PdfStructureElement = PdfStructureElement._load(document, createDictionary({}), 1, parent);
        const recursivePage: PdfPage = createPage(7, PdfRotationAngle.angle180);

        parent._childElements = [childOne, childTwo];

        const parentGetPageSpy: jasmine.Spy = spyOn(parent, '_getPageFromElement').and.returnValues(
            undefined,
            undefined
        );
        const childOneChildPageSpy: jasmine.Spy = spyOn(childOne, '_getChildPage').and.returnValue(undefined);
        const childTwoChildPageSpy: jasmine.Spy = spyOn(childTwo, '_getChildPage').and.returnValue(recursivePage);

        // Act
        const page: PdfPage = parent._getChildPage();

        // Assert
        expect(parentGetPageSpy.calls.count()).toBe(2);
        expect(parentGetPageSpy.calls.argsFor(0)[0]).toBe(childOne);
        expect(parentGetPageSpy.calls.argsFor(1)[0]).toBe(childTwo);
        expect(childOneChildPageSpy).toHaveBeenCalled();
        expect(childTwoChildPageSpy).toHaveBeenCalled();
        expect(page).toBe(recursivePage);
    });

    it('should extract tagged text with resources, cache page lines, set metadata and draw rectangle once per page', () => {
        // Arrange
        const resourcesDictionary: _PdfDictionary = createDictionary({ Font: {}, XObject: {} });
        const page: PdfPage = createPage(1, PdfRotationAngle.angle0, resourcesDictionary);
        const document: PdfDocument = createDocument(page, []);
        const dictionary: _PdfDictionary = createDictionary({
            ActualText: 'Actual sample',
            Alt: 'Alternate sample',
            Lang: 'en-US',
            T: '  Sample Title  '
        });

        const firstElement: PdfStructureElement = createBaseElement(document, page);
        firstElement._dictionary = dictionary;
        firstElement._contentId = [10];
        firstElement._tagType = PdfTagType.paragraph;

        const secondElement: PdfStructureElement = createBaseElement(document, page);
        secondElement._dictionary = createDictionary({});
        secondElement._contentId = [11];
        secondElement._tagType = PdfTagType.paragraph;

        const addFontResourcesSpy: jasmine.Spy = spyOn(utils, '_addFontResources').and.returnValue(new Map<string, unknown>());
        const getXObjectResourcesSpy: jasmine.Spy = spyOn(utils, '_getXObjectResources').and.returnValue(new Map<string, unknown>());

        const renderTextSpy: jasmine.Spy = spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [
                createTextLine('Alpha', { x: 10, y: 20, width: 30, height: 5 }),
                createTextLine('Beta', { x: 50, y: 40, width: 25, height: 8 })
            ];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>([
                [10, [' Alpha ']],
                [11, ['Beta']]
            ]);
        });

        const elements: PdfStructureElement[] = [firstElement, secondElement];
        const owner: PdfStructureElement = createBaseElement(document, page);

        // Act
        owner._getTaggedContent(elements);

        // Assert
        expect(addFontResourcesSpy).toHaveBeenCalledWith(resourcesDictionary, (document as unknown as { _crossReference: object })._crossReference);
        expect(getXObjectResourcesSpy).toHaveBeenCalledWith(resourcesDictionary, (document as unknown as { _crossReference: object })._crossReference);
        expect(renderTextSpy.calls.count()).toBe(1);
        expect(firstElement._text).toBe(' Alpha ');
        expect(firstElement._bounds).toEqual({ x: 10, y: 20, width: 30, height: 5 });
        expect(secondElement._text).toBe('Beta');
        expect(secondElement._bounds).toEqual({ x: 50, y: 40, width: 25, height: 8 });
        expect((page.graphics.drawRectangle as jasmine.Spy).calls.count()).toBe(2);
        expect(firstElement._actualText).toBe('Actual sample');
        expect(firstElement._alternateText).toBe('Alternate sample');
        expect(firstElement._language).toBe('en-US');
        expect(firstElement._title).toBe('Sample Title');
    });

    it('should assign annotation bounds through _calculateBounds when parent tag type is annotation', () => {
        // Arrange
        const page: PdfPage = createPage(2, PdfRotationAngle.angle90);
        const annotationDictionary: _PdfDictionary = createDictionary({ Name: 'AnnotRef' });
        (page.annotations as unknown as { count: number; at: jasmine.Spy }).count = 1;
        (page.annotations as unknown as { count: number; at: jasmine.Spy }).at.and.returnValue(
            createAnnotation(annotationDictionary, { x: 11, y: 22, width: 33, height: 44 })
        );

        const document: PdfDocument = createDocument(page, []);
        const parent: PdfStructureElement = PdfStructureElement._load(document, createDictionary({}), 0, undefined as unknown as PdfStructureElement);
        parent._tagType = PdfTagType.annotation;

        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: annotationDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });

        const calculateBoundsSpy: jasmine.Spy = spyOn(element, '_calculateBounds').and.returnValue({
            x: 100,
            y: 200,
            width: 50,
            height: 60
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect((page.annotations as unknown as { count: number; at: jasmine.Spy }).at).toHaveBeenCalledWith(0);
        expect(calculateBoundsSpy).toHaveBeenCalledWith(element, { x: 11, y: 22, width: 33, height: 44 });
        expect(element._bounds).toEqual({ x: 100, y: 200, width: 50, height: 60 });
    });

    it('should assign direct form field bounds and then rotate them through _calculateBounds', () => {
        // Arrange
        const page: PdfPage = createPage(3, PdfRotationAngle.angle270);
        const fieldDictionary: _PdfDictionary = createDictionary({ Name: 'FieldRef' });

        const directField: {
            _dictionary: _PdfDictionary;
            bounds: Rectangle;
        } = {
            _dictionary: fieldDictionary,
            bounds: { x: 15, y: 25, width: 35, height: 45 }
        };

        const document: PdfDocument = createDocument(page, [directField]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: fieldDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });

        const calculateBoundsSpy: jasmine.Spy = spyOn(element, '_calculateBounds').and.returnValue({
            x: 3,
            y: 4,
            width: 5,
            height: 6
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(calculateBoundsSpy).toHaveBeenCalledWith(element, { x: 15, y: 25, width: 35, height: 45 });
        expect(element._bounds).toEqual({ x: 3, y: 4, width: 5, height: 6 });
    });

    it('should assign text box widget item bounds in form branch', () => {
        // Arrange
        const page: PdfPage = createPage(4, PdfRotationAngle.angle0);
        const itemDictionary: _PdfDictionary = createDictionary({ Item: 'TextBoxItem' });
        const field: PdfTextBoxField = assignFieldBase(Object.create(PdfTextBoxField.prototype) as PdfTextBoxField, createDictionary({ Root: 'TextBoxField' }));
        Object.defineProperty(field, 'itemsCount', {
            value: 1,
            writable: true,
            configurable: true
        });
        Object.defineProperty(field, 'itemAt', {
            value: function (): PdfWidgetAnnotation {
                return createWidgetItem(itemDictionary, { x: 1, y: 2, width: 3, height: 4 });
            },
            writable: true,
            configurable: true
        });

        const document: PdfDocument = createDocument(page, [field]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: itemDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(element, '_calculateBounds').and.callFake(function (_owner: PdfStructureElement, bounds: Rectangle): Rectangle {
            return bounds;
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    });

    it('should assign combo box item bounds in form branch', () => {
        // Arrange
        const page: PdfPage = createPage(5, PdfRotationAngle.angle0);
        const itemDictionary: _PdfDictionary = createDictionary({ Item: 'ComboItem' });
        const field: PdfComboBoxField = assignFieldBase(Object.create(PdfComboBoxField.prototype) as PdfComboBoxField, createDictionary({ Root: 'ComboField' }));
        Object.defineProperty(field, 'itemsCount', {
            value: 1,
            writable: true,
            configurable: true
        });
        Object.defineProperty(field, 'itemAt', {
            value: function (): PdfListFieldItem {
                return createListFieldItem(itemDictionary, { x: 5, y: 6, width: 7, height: 8 });
            },
            writable: true,
            configurable: true
        });

        const document: PdfDocument = createDocument(page, [field]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: itemDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(element, '_calculateBounds').and.callFake(function (_owner: PdfStructureElement, bounds: Rectangle): Rectangle {
            return bounds;
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 5, y: 6, width: 7, height: 8 });
    });

    it('should assign list box item bounds in form branch', () => {
        // Arrange
        const page: PdfPage = createPage(6, PdfRotationAngle.angle0);
        const itemDictionary: _PdfDictionary = createDictionary({ Item: 'ListBoxItem' });
        const field: PdfListBoxField = assignFieldBase(Object.create(PdfListBoxField.prototype) as PdfListBoxField, createDictionary({ Root: 'ListBoxField' }));
        Object.defineProperty(field, 'itemsCount', {
            value: 1,
            writable: true,
            configurable: true
        });
        Object.defineProperty(field, 'itemAt', {
            value: function (): PdfListFieldItem {
                return createListFieldItem(itemDictionary, { x: 9, y: 10, width: 11, height: 12 });
            },
            writable: true,
            configurable: true
        });

        const document: PdfDocument = createDocument(page, [field]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: itemDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(element, '_calculateBounds').and.callFake(function (_owner: PdfStructureElement, bounds: Rectangle): Rectangle {
            return bounds;
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 9, y: 10, width: 11, height: 12 });
    });

    it('should assign button field item bounds in form branch', () => {
        // Arrange
        const page: PdfPage = createPage(7, PdfRotationAngle.angle0);
        const itemDictionary: _PdfDictionary = createDictionary({ Item: 'ButtonItem' });
        const field: PdfButtonField = assignFieldBase(Object.create(PdfButtonField.prototype) as PdfButtonField, createDictionary({ Root: 'ButtonField' }));
        Object.defineProperty(field, 'itemsCount', {
            value: 1,
            writable: true,
            configurable: true
        });
        Object.defineProperty(field, 'itemAt', {
            value: function (): PdfWidgetAnnotation {
                return createWidgetItem(itemDictionary, { x: 13, y: 14, width: 15, height: 16 });
            },
            writable: true,
            configurable: true
        });

        const document: PdfDocument = createDocument(page, [field]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: itemDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(element, '_calculateBounds').and.callFake(function (_owner: PdfStructureElement, bounds: Rectangle): Rectangle {
            return bounds;
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 13, y: 14, width: 15, height: 16 });
    });

    it('should assign checkbox field item bounds in form branch', () => {
        // Arrange
        const page: PdfPage = createPage(8, PdfRotationAngle.angle0);
        const itemDictionary: _PdfDictionary = createDictionary({ Item: 'CheckItem' });
        const field: PdfCheckBoxField = assignFieldBase(Object.create(PdfCheckBoxField.prototype) as PdfCheckBoxField, createDictionary({ Root: 'CheckField' }));
        Object.defineProperty(field, 'itemsCount', {
            value: 1,
            writable: true,
            configurable: true
        });
        Object.defineProperty(field, 'itemAt', {
            value: function (): PdfWidgetAnnotation {
                return createWidgetItem(itemDictionary, { x: 17, y: 18, width: 19, height: 20 });
            },
            writable: true,
            configurable: true
        });

        const document: PdfDocument = createDocument(page, [field]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: itemDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(element, '_calculateBounds').and.callFake(function (_owner: PdfStructureElement, bounds: Rectangle): Rectangle {
            return bounds;
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 17, y: 18, width: 19, height: 20 });
    });

    it('should assign radio button list field item bounds in form branch', () => {
        // Arrange
        const page: PdfPage = createPage(9, PdfRotationAngle.angle0);
        const itemDictionary: _PdfDictionary = createDictionary({ Item: 'RadioItem' });
        const field: PdfRadioButtonListField = assignFieldBase(Object.create(PdfRadioButtonListField.prototype) as PdfRadioButtonListField, createDictionary({ Root: 'RadioField' }));
        Object.defineProperty(field, 'itemsCount', {
            value: 1,
            writable: true,
            configurable: true
        });
        Object.defineProperty(field, 'itemAt', {
            value: function (): PdfWidgetAnnotation {
                return createWidgetItem(itemDictionary, { x: 21, y: 22, width: 23, height: 24 });
            },
            writable: true,
            configurable: true
        });

        const document: PdfDocument = createDocument(page, [field]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: itemDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(element, '_calculateBounds').and.callFake(function (_owner: PdfStructureElement, bounds: Rectangle): Rectangle {
            return bounds;
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 21, y: 22, width: 23, height: 24 });
    });

    it('should assign signature field item bounds in form branch', () => {
        // Arrange
        const page: PdfPage = createPage(10, PdfRotationAngle.angle0);
        const itemDictionary: _PdfDictionary = createDictionary({ Item: 'SignItem' });
        const field: PdfSignatureField = assignFieldBase(Object.create(PdfSignatureField.prototype) as PdfSignatureField, createDictionary({ Root: 'SignatureField' }));
        Object.defineProperty(field, 'itemsCount', {
            value: 1,
            writable: true,
            configurable: true
        });
        Object.defineProperty(field, 'itemAt', {
            value: function (): PdfWidgetAnnotation {
                return createWidgetItem(itemDictionary, { x: 25, y: 26, width: 27, height: 28 });
            },
            writable: true,
            configurable: true
        });

        const document: PdfDocument = createDocument(page, [field]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: itemDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(element, '_calculateBounds').and.callFake(function (_owner: PdfStructureElement, bounds: Rectangle): Rectangle {
            return bounds;
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 25, y: 26, width: 27, height: 28 });
    });

    it('should assign form field bounds from dict parent when child dictionary contains Parent', () => {
        // Arrange
        const page: PdfPage = createPage(11, PdfRotationAngle.angle180);
        const parentDictionary: _PdfDictionary = createDictionary({ ParentName: 'ParentDict' });
        const childDictionary: _PdfDictionary = createDictionary({ Parent: parentDictionary });

        const field: {
            _dictionary: _PdfDictionary;
            bounds: Rectangle;
        } = {
            _dictionary: parentDictionary,
            bounds: { x: 30, y: 31, width: 32, height: 33 }
        };

        const document: PdfDocument = createDocument(page, [field]);
        const parent: PdfStructureElement = createFormParent();
        const element: PdfStructureElement = createBaseElement(document, page);
        element._parent = parent;
        element._dictionary = createDictionary({ Obj: childDictionary });

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        const calculateBoundsSpy: jasmine.Spy = spyOn(element, '_calculateBounds').and.returnValue({
            x: 101,
            y: 102,
            width: 103,
            height: 104
        });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(calculateBoundsSpy).toHaveBeenCalledWith(element, { x: 30, y: 31, width: 32, height: 33 });
        expect(element._bounds).toEqual({ x: 101, y: 102, width: 103, height: 104 });
    });

    it('should set zero bounds for figure when extractor does not return bounds', () => {
        // Arrange
        const page: PdfPage = createPage(12, PdfRotationAngle.angle0);
        const document: PdfDocument = createDocument(page, []);
        const element: PdfStructureElement = createBaseElement(document, page);
        element._tagType = PdfTagType.figure;
        element._dictionary = createDictionary({});

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(PdfDataExtractor.prototype, '_getFigureBounds').and.returnValue(undefined);

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should apply figure bbox adjustment for angle0', () => {
        // Arrange
        const page: PdfPage = createPage(13, PdfRotationAngle.angle0);
        const bboxDictionary: _PdfDictionary = createDictionary({ BBox: [0, 0, 40, 20] });
        const dictionaryA: _PdfDictionary = createDictionary({ BBox: [0, 0, 40, 20] });
        const elementDictionary: _PdfDictionary = createDictionary({ A: dictionaryA });
        const document: PdfDocument = createDocument(page, []);
        const element: PdfStructureElement = createBaseElement(document, page);
        element._tagType = PdfTagType.figure;
        element._dictionary = elementDictionary;

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(PdfDataExtractor.prototype, '_getFigureBounds').and.returnValue({ x: 70, y: 80, width: 5, height: 6 });
        spyOn(ej2Pdf, '_toRectangle').and.returnValue({ x: 0, y: 0, width: 40, height: 20 });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(bboxDictionary.has('BBox')).toBeTruthy();
        expect(element._bounds).toEqual({ x: 70, y: 60, width: 40, height: 20 });
    });

    it('should apply figure bbox adjustment for angle90', () => {
        // Arrange
        const page: PdfPage = createPage(14, PdfRotationAngle.angle90);
        const dictionaryA: _PdfDictionary = createDictionary({ BBox: [0, 0, 40, 20] });
        const elementDictionary: _PdfDictionary = createDictionary({ A: dictionaryA });
        const document: PdfDocument = createDocument(page, []);
        const element: PdfStructureElement = createBaseElement(document, page);
        element._tagType = PdfTagType.figure;
        element._dictionary = elementDictionary;

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(PdfDataExtractor.prototype, '_getFigureBounds').and.returnValue({ x: 90, y: 100, width: 5, height: 6 });
        spyOn(ej2Pdf, '_toRectangle').and.returnValue({ x: 0, y: 0, width: 40, height: 20 });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 90, y: 100, width: 20, height: 40 });
    });

    it('should apply figure bbox adjustment for angle180', () => {
        // Arrange
        const page: PdfPage = createPage(15, PdfRotationAngle.angle180);
        const dictionaryA: _PdfDictionary = createDictionary({ BBox: [0, 0, 40, 20] });
        const elementDictionary: _PdfDictionary = createDictionary({ A: dictionaryA });
        const document: PdfDocument = createDocument(page, []);
        const element: PdfStructureElement = createBaseElement(document, page);
        element._tagType = PdfTagType.figure;
        element._dictionary = elementDictionary;

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(PdfDataExtractor.prototype, '_getFigureBounds').and.returnValue({ x: 120, y: 130, width: 5, height: 6 });
        spyOn(ej2Pdf, '_toRectangle').and.returnValue({ x: 0, y: 0, width: 40, height: 20 });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 80, y: 130, width: 40, height: 20 });
    });

    it('should apply figure bbox adjustment for angle270', () => {
        // Arrange
        const page: PdfPage = createPage(16, PdfRotationAngle.angle270);
        const dictionaryA: _PdfDictionary = createDictionary({ BBox: [0, 0, 40, 20] });
        const elementDictionary: _PdfDictionary = createDictionary({ A: dictionaryA });
        const document: PdfDocument = createDocument(page, []);
        const element: PdfStructureElement = createBaseElement(document, page);
        element._tagType = PdfTagType.figure;
        element._dictionary = elementDictionary;

        spyOn(PdfDataExtractor.prototype, '_renderText').and.callFake(function (): void {
            (this as unknown as { _textLine: { text: string; bounds: Rectangle }[] })._textLine = [];
            (this as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap = new Map<number, string[]>();
        });
        spyOn(PdfDataExtractor.prototype, '_getFigureBounds').and.returnValue({ x: 150, y: 160, width: 5, height: 6 });
        spyOn(ej2Pdf, '_toRectangle').and.returnValue({ x: 0, y: 0, width: 40, height: 20 });

        // Act
        element._getTaggedContent([element]);

        // Assert
        expect(element._bounds).toEqual({ x: 130, y: 120, width: 20, height: 40 });
    });
});
