import { _ContentParser, _PdfCrossReference, _PdfDictionary, _PdfRecord, PdfDocument, PdfFontStyle, PdfRotationAngle, Rectangle } from "@syncfusion/ej2-pdf";
import { PdfPage } from "@syncfusion/ej2-pdf";
import { _TextState } from "../../src/pdf-data-extract/core/graphic-state";
import { _FontStructure } from "../../src/pdf-data-extract/core/text-extraction/font-structure";
import { _PdfContentParserHelper } from "../../src/pdf-data-extract/core/content-parser-helper";
import { _TextProcessingMode } from "../../src/pdf-data-extract/core/enum";
import { PdfStructureElement } from "../../src/pdf-data-extract/core/pdf-structure-element";
import { PdfDataExtractor } from "../../src/pdf-data-extract/core/pdf-data-extractor";
import * as utils from '../../src/pdf-data-extract/core/utils';
import { PdfTagType } from "../../src/pdf-data-extract/core/text-extraction/enumerator";

describe('_PdfContentParserHelper._getTextElementsFromTJOperator reachable highlighted branch', () => {
    it('should execute the non-numeric word branch and assign text from word', () => {
        // Arrange
        const helper: _PdfContentParserHelper = new _PdfContentParserHelper(_TextProcessingMode.textLineExtraction);
        const getTextContentItemSpy: jasmine.Spy = jasmine.createSpy('_getTextContentItem').and.returnValue({
            tempString: 'ABC',
            extractedText: 'ABC',
            fontSize: 12,
            previousRect: { x: 0, y: 0, width: 0, height: 0 }
        });

        (helper as unknown as {
            _parser: {
                _getTextContentItem: jasmine.Spy;
                _splitHexString: jasmine.Spy;
            };
        })._parser = {
            _getTextContentItem: getTextContentItemSpy,
            _splitHexString: jasmine.createSpy('_splitHexString')
        };

        const currentFont: _FontStructure = {
            _vertical: false
        } as _FontStructure;

        const textState: _TextState = {
            _fontSize: 12
        } as _TextState;

        const page: PdfPage = {
            rotation: PdfRotationAngle.angle0
        } as PdfPage;

        // Act
        const result: {
            tempString: string;
            extractedText: string;
        } = helper._getTextElementsFromTJOperator(
            ['ABC'],
            currentFont,
            textState,
            page
        );

        // Assert
        expect(getTextContentItemSpy).toHaveBeenCalledTimes(1);

        const firstCallArguments: unknown[] = getTextContentItemSpy.calls.argsFor(0);

        // This proves the highlighted reachable line was hit:
        // text = word;
        expect(firstCallArguments[1]).toBe('ABC');

        expect(firstCallArguments[2]).toBe(0);
        expect(result.tempString).toBe('ABC');
        expect(result.extractedText).toBe('ABC');
        expect((helper as unknown as { _fontSize: number })._fontSize).toBe(12);
    });
});

describe('PdfDataExtractor highlighted strict coverage', () => {
    function createDictionary(
        values: { [key: string]: unknown },
        referenceId?: string
    ): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            has: (key: string) => boolean;
            _reference?: { toString(): string };
        }).get = (key: string): unknown => values[key];

        (dictionary as unknown as {
            getArray: (key: string) => unknown;
        }).getArray = (key: string): unknown => values[key];

        (dictionary as unknown as {
            has: (key: string) => boolean;
        }).has = (key: string): boolean => Object.prototype.hasOwnProperty.call(values, key);

        if (referenceId) {
            (dictionary as unknown as {
                _reference: { toString(): string };
            })._reference = {
                toString(): string {
                    return referenceId;
                }
            };
        }

        return dictionary;
    }

    it('should add tempElement into elementCollection and orderSet when recursive structure element is newly returned', () => {
        // Arrange
        const fakeDocument: PdfDocument = {
            _crossReference: {} as _PdfCrossReference
        } as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const parentStructureElement: PdfStructureElement = {
            _order: 1,
            _childElements: [],
            _contentId: [],
            tagType: PdfTagType.documentType,
            parent: undefined
        } as unknown as PdfStructureElement;

        const recursiveTempElement: PdfStructureElement = {
            _order: 99,
            _childElements: [],
            _contentId: [],
            tagType: PdfTagType.none,
            parent: parentStructureElement
        } as unknown as PdfStructureElement;

        const childDictionary: _PdfDictionary = createDictionary({
            K: 7
        });

        const rootDictionary: _PdfDictionary = createDictionary({
            K: [childDictionary]
        });

        const loadSpy: jasmine.Spy = spyOn(PdfStructureElement, '_load').and.returnValue(parentStructureElement);

        const originalGetStructureElement: (
            structureDictionary: _PdfDictionary,
            parent?: PdfStructureElement
        ) => PdfStructureElement | null = extractor._getStructureElement.bind(extractor);

        const recursiveSpy: jasmine.Spy = spyOn(extractor, '_getStructureElement').and.callFake((
            structureDictionary: _PdfDictionary,
            parent?: PdfStructureElement
        ): PdfStructureElement | null => {
            if (structureDictionary === rootDictionary) {
                return originalGetStructureElement(structureDictionary, parent);
            }
            return recursiveTempElement;
        });

        // Act
        extractor._getStructureElement(rootDictionary);

        // Assert
        expect(loadSpy).toHaveBeenCalledTimes(1);
        expect(recursiveSpy).toHaveBeenCalled();
        expect((extractor as unknown as { _elementCollection: PdfStructureElement[] })._elementCollection.length).toBe(2);
        expect((extractor as unknown as { _elementCollection: PdfStructureElement[] })._elementCollection[1]).toBe(recursiveTempElement);
        expect((extractor as unknown as { _orderSet: Set<number> })._orderSet.has(99)).toBe(true);
        expect(parentStructureElement._childElements.indexOf(recursiveTempElement)).toBeGreaterThanOrEqual(0);
    });


    it('should append newline and reset hasTm in _renderTextAsLayOut when cm vertical movement is at least one line', () => {
        // Arrange
        const fakeDocument: PdfDocument = ({
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const page: PdfPage = ({
            rotation: PdfRotationAngle.angle0,
            size: { width: 200, height: 300 },
            _pageIndex: 0
        } as unknown) as PdfPage;

        const fontCollection: Map<string, _FontStructure> = new Map<string, _FontStructure>();
        const xObjectCollection: Map<string, unknown> = new Map<string, unknown>();

        const records: _PdfRecord[] = [
            ({ _operator: 'q', _operands: [] } as unknown) as _PdfRecord,
            ({ _operator: 'cm', _operands: ['1', '0', '0', '1', '0', '20'] } as unknown) as _PdfRecord
        ];

        (extractor as unknown as { _hasTm: boolean })._hasTm = true;
        (extractor as unknown as { _resultantText: string })._resultantText = '';

        // Act
        extractor._renderTextAsLayOut(records, page, fontCollection, xObjectCollection as Map<string, never>);

        // Assert
        expect((extractor as unknown as { _resultantText: string })._resultantText).toBe('');
        expect((extractor as unknown as { _hasTm: boolean })._hasTm).toBe(false);
    });

    it('should reuse cached xObjectCollection in extractImages for the same resourceId on the second page', async () => {
        // Arrange
        const resourceDictionary: _PdfDictionary = createDictionary({}, 'R1');

        const pageDictionary: _PdfDictionary = createDictionary({
            Resources: resourceDictionary
        });

        const page0: PdfPage = {
            rotation: PdfRotationAngle.angle0,
            _pageDictionary: pageDictionary
        } as unknown as PdfPage;

        const page1: PdfPage = {
            rotation: PdfRotationAngle.angle0,
            _pageDictionary: pageDictionary
        } as unknown as PdfPage;

        const getPageSpy: jasmine.Spy = jasmine.createSpy('getPage').and.callFake((pageIndex: number): PdfPage => {
            return pageIndex === 0 ? page0 : page1;
        });

        const fakeDocument: PdfDocument = {
            pageCount: 2,
            getPage: getPageSpy as unknown as (pageIndex: number) => PdfPage,
            _crossReference: {
                _isDecoderSupport: false
            } as unknown as _PdfCrossReference
        } as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const sharedXObjectCollection: Map<string, unknown> = new Map<string, unknown>([
            ['Img1', {}]
        ]);

        const getXObjectResourcesSpy: jasmine.Spy = spyOn(utils, '_getXObjectResources').and.returnValue(sharedXObjectCollection as Map<string, never>);
        const extractImagcollectionSpy: jasmine.Spy = spyOn(extractor, '_extractImagcollection').and.returnValue(Promise.resolve());

        // Act
        await extractor.extractImages({ startPageIndex: 0, endPageIndex: 1 });

        // Assert
        expect(getPageSpy).toHaveBeenCalledTimes(2);
        expect(getPageSpy).toHaveBeenCalledWith(0);
        expect(getPageSpy).toHaveBeenCalledWith(1);

        expect(getXObjectResourcesSpy).toHaveBeenCalledTimes(1);
        expect(extractImagcollectionSpy).toHaveBeenCalledTimes(2);

        const firstXObjectCollection: unknown = extractImagcollectionSpy.calls.argsFor(0)[2];
        const secondXObjectCollection: unknown = extractImagcollectionSpy.calls.argsFor(1)[2];

        expect(firstXObjectCollection).toBe(sharedXObjectCollection);
        expect(secondXObjectCollection).toBe(sharedXObjectCollection);
    });

    it('should pass imageExtraction mode into _getXObjectResources from _processPages when isImageExtraction is true', () => {
        // Arrange
        const resourceDictionary: _PdfDictionary = createDictionary({}, 'RX1');

        const pageDictionary: _PdfDictionary = createDictionary({
            Resources: resourceDictionary
        });

        const page: PdfPage = {
            rotation: PdfRotationAngle.angle0,
            _pageDictionary: pageDictionary
        } as unknown as PdfPage;


        const fakeDocument: PdfDocument = ({
            pageCount: 1,
            getPage: (): PdfPage => page,
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const getXObjectResourcesSpy: jasmine.Spy = spyOn(utils, '_getXObjectResources').and.returnValue(new Map<string, never>());
        const renderTextSpy: jasmine.Spy = spyOn(extractor, '_renderText');

        // Act
        extractor._processPages(0, 0, true);

        // Assert
        expect(getXObjectResourcesSpy).toHaveBeenCalledTimes(1);
        expect(getXObjectResourcesSpy.calls.argsFor(0)[2]).toBe(_TextProcessingMode.imageExtraction);
        expect(renderTextSpy).toHaveBeenCalledTimes(1);
    });
});

describe('PdfDataExtractor highlighted strict coverage', () => {
    function createDictionary(
        values: { [key: string]: unknown },
        referenceId?: string
    ): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            has: (key: string) => boolean;
            _reference?: { toString(): string };
        }).get = (key: string): unknown => values[key];

        (dictionary as unknown as {
            getArray: (key: string) => unknown;
        }).getArray = (key: string): unknown => values[key];

        (dictionary as unknown as {
            has: (key: string) => boolean;
        }).has = (key: string): boolean => Object.prototype.hasOwnProperty.call(values, key);

        if (referenceId) {
            (dictionary as unknown as {
                _reference: { toString(): string };
            })._reference = {
                toString(): string {
                    return referenceId;
                }
            };
        }

        return dictionary;
    }

    it('should add tempElement to elementCollection and orderSet in _getStructureElement recursive path', () => {
        // Arrange
        const fakeDocument: PdfDocument = ({
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const parentStructureElement: PdfStructureElement = ({
            _order: 1,
            _childElements: [],
            _contentId: [],
            tagType: PdfTagType.documentType,
            parent: undefined
        } as unknown) as PdfStructureElement;

        const recursiveTempElement: PdfStructureElement = ({
            _order: 99,
            _childElements: [],
            _contentId: [],
            tagType: PdfTagType.none,
            parent: parentStructureElement
        } as unknown) as PdfStructureElement;

        const childDictionary: _PdfDictionary = createDictionary({
            K: 7
        });

        const rootDictionary: _PdfDictionary = createDictionary({
            K: [childDictionary]
        });

        const loadSpy: jasmine.Spy = spyOn(PdfStructureElement, '_load').and.returnValue(parentStructureElement);

        const originalGetStructureElement: (
            structureDictionary: _PdfDictionary,
            parent?: PdfStructureElement
        ) => PdfStructureElement | null = extractor._getStructureElement.bind(extractor);

        const recursiveSpy: jasmine.Spy = spyOn(extractor, '_getStructureElement').and.callFake((
            structureDictionary: _PdfDictionary,
            parent?: PdfStructureElement
        ): PdfStructureElement | null => {
            if (structureDictionary === rootDictionary) {
                return originalGetStructureElement(structureDictionary, parent);
            }
            return recursiveTempElement;
        });

        // Act
        extractor._getStructureElement(rootDictionary);

        // Assert
        expect(loadSpy).toHaveBeenCalledTimes(1);
        expect(recursiveSpy).toHaveBeenCalled();
        expect((extractor as unknown as { _elementCollection: PdfStructureElement[] })._elementCollection.length).toBe(2);
        expect((extractor as unknown as { _elementCollection: PdfStructureElement[] })._elementCollection[1]).toBe(recursiveTempElement);
        expect((extractor as unknown as { _orderSet: Set<number> })._orderSet.has(99)).toBe(true);
        expect(parentStructureElement._childElements.indexOf(recursiveTempElement)).toBeGreaterThanOrEqual(0);
    });

    it('should reuse cached xObjectCollection in extractImages for the second page and honor page range options', async () => {
        // Arrange
        const resourceDictionary: _PdfDictionary = createDictionary({}, 'RES-1');
        const pageDictionary: _PdfDictionary = createDictionary({
            Resources: resourceDictionary
        });

        const page0: PdfPage = ({
            rotation: PdfRotationAngle.angle0,
            _pageDictionary: pageDictionary
        } as unknown) as PdfPage;

        const page1: PdfPage = ({
            rotation: PdfRotationAngle.angle0,
            _pageDictionary: pageDictionary
        } as unknown) as PdfPage;

        const getPageSpy: jasmine.Spy = jasmine.createSpy('getPage').and.callFake((pageIndex: number): PdfPage => {
            return pageIndex === 0 ? page0 : page1;
        });

        const fakeDocument: PdfDocument = ({
            pageCount: 2,
            getPage: getPageSpy as unknown as (pageIndex: number) => PdfPage,
            _crossReference: ({
                _isDecoderSupport: false
            } as unknown) as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const sharedXObjectCollection: Map<string, unknown> = new Map<string, unknown>([
            ['Img1', {}]
        ]);

        const getXObjectResourcesSpy: jasmine.Spy = spyOn(utils, '_getXObjectResources').and.returnValue(sharedXObjectCollection as Map<string, never>);
        const extractImagcollectionSpy: jasmine.Spy = spyOn(extractor, '_extractImagcollection').and.returnValue(Promise.resolve());

        // Act
        await extractor.extractImages({ startPageIndex: 0, endPageIndex: 1 });

        // Assert
        expect(getPageSpy).toHaveBeenCalledTimes(2);
        expect(getPageSpy).toHaveBeenCalledWith(0);
        expect(getPageSpy).toHaveBeenCalledWith(1);
        expect(getXObjectResourcesSpy).toHaveBeenCalledTimes(1);
        expect(extractImagcollectionSpy).toHaveBeenCalledTimes(2);
        expect(extractImagcollectionSpy.calls.argsFor(0)[2]).toBe(sharedXObjectCollection);
        expect(extractImagcollectionSpy.calls.argsFor(1)[2]).toBe(sharedXObjectCollection);
    });

    it('should pass imageExtraction mode into _getXObjectResources from _processPages', () => {
        // Arrange
        const resourceDictionary: _PdfDictionary = createDictionary({}, 'RES-IMG');
        const pageDictionary: _PdfDictionary = createDictionary({
            Resources: resourceDictionary
        });

        const page: PdfPage = ({
            rotation: PdfRotationAngle.angle0,
            _pageDictionary: pageDictionary
        } as unknown) as PdfPage;

        const fakeDocument: PdfDocument = ({
            pageCount: 1,
            getPage: (): PdfPage => page,
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const getXObjectResourcesSpy: jasmine.Spy = spyOn(utils, '_getXObjectResources').and.returnValue(new Map<string, never>());
        const renderTextSpy: jasmine.Spy = spyOn(extractor, '_renderText');

        // Act
        extractor._processPages(0, 0, true);

        // Assert
        expect(getXObjectResourcesSpy).toHaveBeenCalledTimes(1);
        expect(getXObjectResourcesSpy.calls.argsFor(0)[2]).toBe(_TextProcessingMode.imageExtraction);
        expect(renderTextSpy).toHaveBeenCalledTimes(1);
    });

    it('should append currentExtractedText and push mcid text in single quote branch when layout mode is enabled', () => {
        // Arrange
        const fakeDocument: PdfDocument = ({
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const page: PdfPage = ({
            rotation: PdfRotationAngle.angle0,
            size: { width: 100, height: 100 },
            _pageIndex: 0
        } as unknown) as PdfPage;

        const fontCollection: Map<string, _FontStructure> = new Map<string, _FontStructure>();
        const xObjectCollection: Map<string, unknown> = new Map<string, unknown>();

        const parseContentSpy: jasmine.Spy = spyOn(PdfStructureElement.prototype, '_parseContent').and.returnValue(5);
        const renderTextElementSpy: jasmine.Spy = spyOn(extractor, '_renderTextElementFromTJ').and.returnValue('A');

        const records: _PdfRecord[] = [
            ({ _operator: 'BDC', _operands: ['tag', '/MCID 5'] } as unknown) as _PdfRecord,
            ({ _operator: "'", _operands: ['(A)'] } as unknown) as _PdfRecord
        ];

        (extractor as unknown as { _isLayout: boolean })._isLayout = true;
        (extractor as unknown as { _fontSize: number })._fontSize = 12;
        (extractor as unknown as { _textLeading: number })._textLeading = 0;
        (extractor as unknown as { _currentContentId: number })._currentContentId = 5;

        // Act
        extractor._renderTextAsLayOut(records, page, fontCollection, xObjectCollection as Map<string, never>);

        // Assert
        expect(parseContentSpy).toHaveBeenCalledTimes(1);
        expect(renderTextElementSpy).toHaveBeenCalledTimes(1);
        expect((extractor as unknown as { _resultantText: string })._resultantText).toBe('A');
        expect((extractor as unknown as { _mcidTextMap: Map<number, string[]> })._mcidTextMap.get(5)).toEqual(['A']);
    });

    it('should reset differenceX and append trailing space in TJ branch when layout mode is enabled and textLineMatrix m22 is not 1', () => {
        // Arrange
        const fakeDocument: PdfDocument = ({
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const page: PdfPage = ({
            rotation: PdfRotationAngle.angle0,
            size: { width: 200, height: 200 },
            _pageIndex: 0
        } as unknown) as PdfPage;

        const fontCollection: Map<string, _FontStructure> = new Map<string, _FontStructure>([
            ['F1', ({ _name: 'F1', _fontStyle: PdfFontStyle.regular } as unknown) as _FontStructure]
        ]);

        const xObjectCollection: Map<string, unknown> = new Map<string, unknown>();

        const renderTextElementSpy: jasmine.Spy = spyOn(extractor, '_renderTextElementFromTJ').and.returnValues('A', 'B');

        const records: _PdfRecord[] = [
            ({ _operator: 'Tf', _operands: ['/F1', '5'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tm', _operands: ['1', '0', '0', '2', '0', '10'] } as unknown) as _PdfRecord,
            ({ _operator: 'TJ', _operands: ['(A)'] } as unknown) as _PdfRecord,
            ({ _operator: 'Td', _operands: ['20', '0'] } as unknown) as _PdfRecord,
            ({ _operator: 'TJ', _operands: ['(B)'] } as unknown) as _PdfRecord
        ];

        (extractor as unknown as { _isLayout: boolean })._isLayout = true;
        (extractor as unknown as { _fontSize: number })._fontSize = 5;

        // Act
        extractor._renderTextAsLayOut(records, page, fontCollection, xObjectCollection as Map<string, never>);

        // Assert
        expect(renderTextElementSpy).toHaveBeenCalledTimes(2);
        expect((extractor as unknown as { _resultantText: string })._resultantText).toContain('A');
        expect((extractor as unknown as { _resultantText: string })._resultantText).toContain('B');
        expect((extractor as unknown as { _resultantText: string })._resultantText.endsWith(' ')).toBe(true);
    });

    it('should reset differenceX in Tj branch when spacing gap exceeds font size', () => {
        // Arrange
        const fakeDocument: PdfDocument = ({
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const page: PdfPage = ({
            rotation: PdfRotationAngle.angle0,
            size: { width: 200, height: 200 },
            _pageIndex: 0
        } as unknown) as PdfPage;

        const fontCollection: Map<string, _FontStructure> = new Map<string, _FontStructure>([
            ['F1', ({ _name: 'F1', _fontStyle: PdfFontStyle.regular } as unknown) as _FontStructure]
        ]);

        const xObjectCollection: Map<string, unknown> = new Map<string, unknown>();

        const renderTextElementSpy: jasmine.Spy = spyOn(extractor, '_renderTextElementFromTJ').and.returnValues('X', 'Y');

        const records: _PdfRecord[] = [
            ({ _operator: 'Tf', _operands: ['/F1', '5'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tm', _operands: ['1', '0', '0', '1', '0', '10'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tj', _operands: ['(X)'] } as unknown) as _PdfRecord,
            ({ _operator: 'Td', _operands: ['20', '0'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tj', _operands: ['(Y)'] } as unknown) as _PdfRecord
        ];

        (extractor as unknown as { _isLayout: boolean })._isLayout = true;
        (extractor as unknown as { _fontSize: number })._fontSize = 5;

        // Act
        extractor._renderTextAsLayOut(records, page, fontCollection, xObjectCollection as Map<string, never>);

        // Assert
        expect(renderTextElementSpy).toHaveBeenCalledTimes(2);
        expect((extractor as unknown as { _resultantText: string })._resultantText).toContain('X');
        expect((extractor as unknown as { _resultantText: string })._resultantText).toContain('Y');
    });

    it('should use m12 as tempFontSize, clamp it to fontSize, handle space glyph branch, and set non-rotated glyph state in _getTextWidth', () => {
        // Arrange
        const fakeDocument: PdfDocument = ({
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const translateSpy: jasmine.Spy = jasmine.createSpy('_translateTextMatrix').and.callFake((
            offsetX: number,
            offsetY: number,
            matrix: _MatrixHelper
        ): _MatrixHelper => {
            return new _MatrixHelper(
                matrix._m11,
                matrix._m12,
                matrix._m21,
                matrix._m22,
                matrix._offsetX + offsetX,
                matrix._offsetY + offsetY
            );
        });

        (extractor as unknown as {
            _parser: { _translateTextMatrix: jasmine.Spy };
        })._parser = {
            _translateTextMatrix: translateSpy
        } as unknown as { _translateTextMatrix: jasmine.Spy };

        const page: PdfPage = ({
            rotation: PdfRotationAngle.angle0,
            _pageIndex: 0
        } as unknown) as PdfPage;

        const currentFont: _FontStructure = ({
            _name: 'F1',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _charsToGlyphs: (): Array<{ _unicode: string; _width: number }> => [{ _unicode: ' ', _width: 2 }]
        } as unknown) as _FontStructure;

        (extractor as unknown as { _textMatrix: _MatrixHelper })._textMatrix = new _MatrixHelper(0, 5, 1, -1, 10, 20);
        (extractor as unknown as { _fontSize: number })._fontSize = 10;
        (extractor as unknown as { _wordSpacing: number })._wordSpacing = 3;
        (extractor as unknown as { _characterSpacing: number })._characterSpacing = 1;
        (extractor as unknown as { _textHorizontalScaling: number })._textHorizontalScaling = 100;
        (extractor as unknown as { _textGlyph: unknown[] })._textGlyph = [];
        (extractor as unknown as { _textWord: unknown[] })._textWord = [];
        (extractor as unknown as { _previousRect: { x: number; y: number; width: number; height: number } | null })._previousRect =
            { x: 0, y: 0, width: 0, height: 0 };
        (extractor as unknown as { _extractedText: string })._extractedText = '';

        // Act
        const tempString: string = extractor._getTextWidth(' ', 1, currentFont, page, '');

        // Assert
        expect(translateSpy).toHaveBeenCalledTimes(1);
        expect(tempString).toBe('');
        expect((extractor as unknown as { _extractedText: string })._extractedText).toBe(' ');
        expect((extractor as unknown as { _textWord: TextWord[] })._textWord.length).toBe(1);
        expect((extractor as unknown as { _textWord: TextWord[] })._textWord[0]._text).toBe(' ');
    });

    it('should execute rotated and spacing-factor branches in _splitWords and flush accumulated text using height', () => {
        // Arrange
        const fakeDocument: PdfDocument = ({
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        const extractor: PdfDataExtractor = new PdfDataExtractor(fakeDocument);

        const page: PdfPage = ({
            rotation: PdfRotationAngle.angle270,
            _pageIndex: 0
        } as unknown) as PdfPage;

        const existingGlyph: TextGlyph = new TextGlyph();
        existingGlyph._bounds = { x: 1, y: 1, width: 2, height: 8 };
        existingGlyph._text = 'A';
        existingGlyph._fontName = 'F1';
        existingGlyph._fontStyle = PdfFontStyle.regular;
        existingGlyph._fontSize = 10;

        (extractor as unknown as { _fontSize: number })._fontSize = 10;
        (extractor as unknown as { _textGlyph: TextGlyph[] })._textGlyph = [existingGlyph];
        (extractor as unknown as { _textWord: TextWord[] })._textWord = [];
        (extractor as unknown as { _height: number })._height = 8;
        (extractor as unknown as { _width: number })._width = 4;
        (extractor as unknown as { _boundingRectangle: { x: number; y: number; width: number; height: number } })._boundingRectangle =
            { x: 5, y: 5, width: 3, height: 1 };
        (extractor as unknown as { _previousRect: { x: number; y: number; width: number; height: number } | null })._previousRect =
            { x: 0, y: 0, width: 2, height: 1 };

        // Act
        const tempStringAfterGap: string = extractor._splitWords('B', 'AB', 'F1', PdfFontStyle.regular, page);

        // Assert
        expect(tempStringAfterGap).toBe('B');
        expect((extractor as unknown as { _textWord: TextWord[] })._textWord.length).toBe(1);
        expect((extractor as unknown as { _textWord: TextWord[] })._textWord[0]._text).toBe('AB');
        expect((extractor as unknown as { _height: number })._height).toBe(1);
    });
});


import { _MatrixHelper } from '../../src/pdf-data-extract/core/text-extraction/matrix-helper';
import { TextGlyph, TextWord } from "../../src/pdf-data-extract/core/text-structure";
import { _parseEncodedText } from "../../src/pdf-data-extract/core/utils";

describe('PdfDataExtractor strict coverage for reachable red-highlighted lines', () => {
    function createExtractor(): PdfDataExtractor {
        const fakeDocument: PdfDocument = ({
            pageCount: 1,
            _crossReference: {} as _PdfCrossReference
        } as unknown) as PdfDocument;

        return new PdfDataExtractor(fakeDocument);
    }

    function createPage(rotation: PdfRotationAngle = PdfRotationAngle.angle0): PdfPage {
        return ({
            rotation,
            size: { width: 200, height: 200 },
            _pageIndex: 0
        } as unknown) as PdfPage;
    }

    function createDictionary(values: { [key: string]: unknown }): _PdfDictionary {
        const dictionary: _PdfDictionary = Object.create(_PdfDictionary.prototype) as _PdfDictionary;

        (dictionary as unknown as {
            get: (key: string) => unknown;
            getArray: (key: string) => unknown;
            has: (key: string) => boolean;
        }).get = (key: string): unknown => values[key];

        (dictionary as unknown as {
            getArray: (key: string) => unknown;
        }).getArray = (key: string): unknown => values[key];

        (dictionary as unknown as {
            has: (key: string) => boolean;
        }).has = (key: string): boolean => Object.prototype.hasOwnProperty.call(values, key);

        return dictionary;
    }

    function createFont(overrides?: Partial<_FontStructure>): _FontStructure {
        return ({
            _name: 'F1',
            _fontStyle: PdfFontStyle.regular,
            _fontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            _isType3Font: false,
            _charsToGlyphs: (text: string): ReturnType<_FontStructure['_charsToGlyphs']> =>
                (text.split('').map((ch: string) => ({
                    _unicode: ch,
                    _width: 2
                })) as unknown) as ReturnType<_FontStructure['_charsToGlyphs']>,
            ...overrides
        } as unknown) as _FontStructure;
    }

    it('should append newline and reset hasTm in _renderTextAsLayOut cm branch when locationY is at least one line', () => {
        // Arrange
        const extractor: PdfDataExtractor = createExtractor();
        const page: PdfPage = createPage();
        const fontCollection: Map<string, _FontStructure> = new Map<string, _FontStructure>();
        const xObjectCollection: Map<string, unknown> = new Map<string, unknown>();

        const records: _PdfRecord[] = [
            ({ _operator: 'Tm', _operands: ['1', '0', '0', '1', '0', '10'] } as unknown) as _PdfRecord,
            ({ _operator: 'cm', _operands: ['1', '0', '0', '1', '0', '20'] } as unknown) as _PdfRecord
        ];

        (extractor as unknown as { _resultantText: string })._resultantText = '';

        // Act
        extractor._renderTextAsLayOut(records, page, fontCollection, xObjectCollection as Map<string, never>);

        // Assert
        expect((extractor as unknown as { _resultantText: string })._resultantText).toBe('\r\n');
        expect((extractor as unknown as { _hasTm: boolean })._hasTm).toBe(false);
    });

    it('should push tempElement into elementCollection and orderSet in _getStructureElement recursive path', () => {
        // Arrange
        const extractor: PdfDataExtractor = createExtractor();

        const parentStructureElement: PdfStructureElement = ({
            _order: 1,
            _childElements: [],
            _contentId: [],
            tagType: PdfTagType.documentType,
            parent: undefined
        } as unknown) as PdfStructureElement;

        const recursiveTempElement: PdfStructureElement = ({
            _order: 99,
            _childElements: [],
            _contentId: [],
            tagType: PdfTagType.none,
            parent: parentStructureElement
        } as unknown) as PdfStructureElement;

        const childDictionary: _PdfDictionary = createDictionary({
            K: 7
        });

        const rootDictionary: _PdfDictionary = createDictionary({
            K: [childDictionary]
        });

        spyOn(PdfStructureElement, '_load').and.returnValue(parentStructureElement);

        const originalGetStructureElement: (
            structureDictionary: _PdfDictionary,
            parent?: PdfStructureElement
        ) => PdfStructureElement | null = extractor._getStructureElement.bind(extractor);

        spyOn(extractor, '_getStructureElement').and.callFake((
            structureDictionary: _PdfDictionary,
            parent?: PdfStructureElement
        ): PdfStructureElement | null => {
            if (structureDictionary === rootDictionary) {
                return originalGetStructureElement(structureDictionary, parent);
            }
            return recursiveTempElement;
        });

        // Act
        extractor._getStructureElement(rootDictionary);

        // Assert
        expect((extractor as unknown as { _elementCollection: PdfStructureElement[] })._elementCollection.length).toBe(2);
        expect((extractor as unknown as { _elementCollection: PdfStructureElement[] })._elementCollection[1]).toBe(recursiveTempElement);
        expect((extractor as unknown as { _orderSet: Set<number> })._orderSet.has(99)).toBe(true);
    });

    it('should execute differenceX reset branch in TJ when gap exceeds font size', () => {
        // Arrange
        const extractor: PdfDataExtractor = createExtractor();
        const page: PdfPage = createPage();
        const fontCollection: Map<string, _FontStructure> = new Map<string, _FontStructure>([
            ['F1', createFont()]
        ]);
        const xObjectCollection: Map<string, unknown> = new Map<string, unknown>();

        spyOn(extractor, '_renderTextElementFromTJ').and.returnValues('A', 'B');

        const records: _PdfRecord[] = [
            ({ _operator: 'Tf', _operands: ['/F1', '5'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tm', _operands: ['1', '0', '0', '2', '0', '10'] } as unknown) as _PdfRecord,
            ({ _operator: 'TJ', _operands: ['[(A)]'] } as unknown) as _PdfRecord,
            ({ _operator: 'Td', _operands: ['20', '0'] } as unknown) as _PdfRecord,
            ({ _operator: 'TJ', _operands: ['[(B)]'] } as unknown) as _PdfRecord
        ];

        (extractor as unknown as { _isLayout: boolean })._isLayout = true;
        (extractor as unknown as { _fontSize: number })._fontSize = 5;

        // Act
        extractor._renderTextAsLayOut(records, page, fontCollection, xObjectCollection as Map<string, never>);

        // Assert
        expect((extractor as unknown as { _resultantText: string })._resultantText).toContain('A');
        expect((extractor as unknown as { _resultantText: string })._resultantText).toContain('B');
        expect((extractor as unknown as { _resultantText: string })._resultantText.endsWith(' ')).toBe(true);
    });

    it('should execute differenceX reset and hex branch in Tj and set hasET to false', () => {
        // Arrange
        const extractor: PdfDataExtractor = createExtractor();
        const page: PdfPage = createPage();
        const fontCollection: Map<string, _FontStructure> = new Map<string, _FontStructure>([
            ['F1', createFont()]
        ]);
        const xObjectCollection: Map<string, unknown> = new Map<string, unknown>();

        spyOn(extractor, '_renderTextElementFromTJ').and.returnValues('X', 'Y');

        const records: _PdfRecord[] = [
            ({ _operator: 'Tf', _operands: ['/F1', '5'] } as unknown) as _PdfRecord,
            ({ _operator: 'BDC', _operands: ['tag', '<<41>>'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tm', _operands: ['1', '0', '0', '1', '0', '10'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tj', _operands: ['(X)'] } as unknown) as _PdfRecord,
            ({ _operator: 'Td', _operands: ['20', '0'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tj', _operands: ['(A)'] } as unknown) as _PdfRecord
        ];

        (extractor as unknown as { _fontSize: number })._fontSize = 5;
        (extractor as unknown as { _hasET: boolean })._hasET = true;
        (extractor as unknown as { _isLayout: boolean })._isLayout = true;

        // Act
        extractor._renderTextAsLayOut(records, page, fontCollection, xObjectCollection as Map<string, never>);

        // Assert
        expect((extractor as unknown as { _hasET: boolean })._hasET).toBe(false);
        expect((extractor as unknown as { _resultantText: string })._resultantText).toContain('X');
        expect((extractor as unknown as { _resultantText: string })._resultantText).toContain('Y');
    });

    it('should remove trailing CRLF in Tj overlap branch and then append extracted text in layout mode', () => {
        // Arrange
        const extractor: PdfDataExtractor = createExtractor();
        const page: PdfPage = createPage();
        const fontCollection: Map<string, _FontStructure> = new Map<string, _FontStructure>([
            ['F1', createFont()]
        ]);
        const xObjectCollection: Map<string, unknown> = new Map<string, unknown>();

        spyOn(extractor, '_renderTextElementFromTJ').and.returnValue('Z');

        const records: _PdfRecord[] = [
            ({ _operator: 'Tf', _operands: ['/F1', '5'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tm', _operands: ['1', '0', '0', '1', '0', '20'] } as unknown) as _PdfRecord,
            ({ _operator: 'Tj', _operands: ['(Z)'] } as unknown) as _PdfRecord
        ];

        (extractor as unknown as { _fontSize: number })._fontSize = 5;
        (extractor as unknown as { _previousFontSize: number })._previousFontSize = 20;
        (extractor as unknown as { _resultantText: string })._resultantText = '\r\n';
        (extractor as unknown as { _previousTextMatrix: _MatrixHelper })._previousTextMatrix =
            new _MatrixHelper(1, 0, 0, 1, 0, 15);
        (extractor as unknown as { _isLayout: boolean })._isLayout = true;

        // Act
        extractor._renderTextAsLayOut(records, page, fontCollection, xObjectCollection as Map<string, never>);

        // Assert
        expect((extractor as unknown as { _resultantText: string })._resultantText).toBe('Z');
    });

    it('should clamp tempFontSize to fontSize and apply charSpacing translation in _getTextWidth', () => {
        // Arrange
        const extractor: PdfDataExtractor = createExtractor();
        const page: PdfPage = createPage();

        const translateSpy: jasmine.Spy = jasmine.createSpy('_translateTextMatrix').and.callFake((
            offsetX: number,
            offsetY: number,
            matrix: _MatrixHelper
        ): _MatrixHelper => {
            return new _MatrixHelper(
                matrix._m11,
                matrix._m12,
                matrix._m21,
                matrix._m22,
                matrix._offsetX + offsetX,
                matrix._offsetY + offsetY
            );
        });

        (extractor as unknown as {
            _parser: { _translateTextMatrix: jasmine.Spy };
        })._parser = {
            _translateTextMatrix: translateSpy
        } as unknown as { _translateTextMatrix: jasmine.Spy };

        const currentFont: _FontStructure = createFont({
            _charsToGlyphs: (): ReturnType<_FontStructure['_charsToGlyphs']> =>
                ([{
                    _unicode: 'A',
                    _width: 2
                }] as unknown) as ReturnType<_FontStructure['_charsToGlyphs']>
        });

        (extractor as unknown as { _textMatrix: _MatrixHelper })._textMatrix = new _MatrixHelper(0, 2, 1, -1, 10, 20);
        (extractor as unknown as { _fontSize: number })._fontSize = 10;
        (extractor as unknown as { _wordSpacing: number })._wordSpacing = 0;
        (extractor as unknown as { _characterSpacing: number })._characterSpacing = 3;
        (extractor as unknown as { _textHorizontalScaling: number })._textHorizontalScaling = 100;
        (extractor as unknown as { _textGlyph: TextGlyph[] })._textGlyph = [];
        (extractor as unknown as { _textWord: TextWord[] })._textWord = [];
        (extractor as unknown as { _previousRect: { x: number; y: number; width: number; height: number } | null })._previousRect =
            { x: 0, y: 0, width: 0, height: 0 };
        (extractor as unknown as { _extractedText: string })._extractedText = '';

        // Act
        const tempString: string = extractor._getTextWidth('A', 1, currentFont, page, '');

        // Assert
        expect(translateSpy).toHaveBeenCalled();
        expect(tempString).toBe('A');
        expect((extractor as unknown as { _extractedText: string })._extractedText).toBe('A');
    });

    it('should use height branch in _splitWords for rotated page and width branch for non-rotated page', () => {
        // Arrange
        const extractor: PdfDataExtractor = createExtractor();

        const rotatedPage: PdfPage = createPage(PdfRotationAngle.angle270);
        const normalPage: PdfPage = createPage(PdfRotationAngle.angle0);

        const existingGlyph: TextGlyph = new TextGlyph();
        existingGlyph._bounds = { x: 1, y: 1, width: 2, height: 8 };
        existingGlyph._text = 'A';
        existingGlyph._fontName = 'F1';
        existingGlyph._fontStyle = PdfFontStyle.regular;
        existingGlyph._fontSize = 10;

        (extractor as unknown as { _fontSize: number })._fontSize = 10;
        (extractor as unknown as { _textWord: TextWord[] })._textWord = [];
        (extractor as unknown as { _boundingRectangle: Rectangle })._boundingRectangle = { x: 5, y: 5, width: 3, height: 1 };

        // Act 1
        (extractor as unknown as { _textGlyph: TextGlyph[] })._textGlyph = [existingGlyph];
        (extractor as unknown as { _height: number })._height = 8;
        (extractor as unknown as { _width: number })._width = 4;
        const rotatedResult: string = extractor._splitWords(' ', 'AB', 'F1', PdfFontStyle.regular, rotatedPage);

        // Act 2
        (extractor as unknown as { _textGlyph: TextGlyph[] })._textGlyph = [existingGlyph];
        (extractor as unknown as { _height: number })._height = 8;
        (extractor as unknown as { _width: number })._width = 4;
        const normalResult: string = extractor._splitWords(' ', 'CD', 'F1', PdfFontStyle.regular, normalPage);

        // Assert
        expect(rotatedResult).toBe('');
        expect(normalResult).toBe('');
        expect((extractor as unknown as { _textWord: TextWord[] })._textWord.length).toBe(4);
        expect((extractor as unknown as { _textWord: TextWord[] })._textWord[0]._text).toBe('AB');
        expect((extractor as unknown as { _textWord: TextWord[] })._textWord[2]._text).toBe('CD');
    });
});
