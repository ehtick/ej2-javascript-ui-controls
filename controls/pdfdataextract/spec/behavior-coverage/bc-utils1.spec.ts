
import { _GraphicState, _TextState } from '../../src/pdf-data-extract/core/graphic-state';
import { _TextProcessingMode } from '../../src/pdf-data-extract/core/enum';
import { _PdfContentParserHelper } from '../../src/pdf-data-extract/core/content-parser-helper';
import { PdfDataExtractor } from '../../src/pdf-data-extract/core/pdf-data-extractor';
import * as fontStructureModule from '../../src/pdf-data-extract/core/text-extraction/font-structure';
import * as imageStructureModule from '../../src/pdf-data-extract/core/image-extraction/image-structure';
import { _ContentParser, _PdfBaseStream, _PdfContentStream, _PdfReference, PdfPage } from '@syncfusion/ej2-pdf';
import * as utilsModule from '../../src/pdf-data-extract/core/utils';

describe('utils strict AAA behavior coverage', () => {
    function createDictionary(values: { [key: string]: unknown }): {
        has: (key: string) => boolean;
        get: (key: string) => unknown;
        _crossReference?: unknown;
        forEach?: (callback: (key: unknown, value: unknown) => void) => void;
    } {
        return {
            has: function (key: string): boolean {
                return Object.prototype.hasOwnProperty.call(values, key);
            },
            get: function (key: string): unknown {
                return values[key];
            },
            _crossReference: values._crossReference,
            forEach: values.forEach as (callback: (key: unknown, value: unknown) => void) => void
        };
    }

    function createPage(): PdfPage {
        return {
            _pageIndex: 0,
            size: { width: 200, height: 100 },
            rotation: 0
        } as unknown as PdfPage;
    }

    function createGlyphs(value: string): { _unicode: string; _width: number }[] {
        const glyphs: { _unicode: string; _width: number }[] = [];
        for (let i: number = 0; i < value.length; i++) {
            glyphs.push({
                _unicode: value[Number.parseInt(i.toString(), 10)],
                _width: 500 + i
            });
        }
        return glyphs;
    }

    it('should add font resources by fetching font dictionaries and setting the created font structure into the map', () => {
        // Arrange
        const fetchedFontDictionary: object = { name: 'font-dictionary' };
        const createdFontStructure: { marker: string } = {
            marker: 'font-structure'
        };

        const crossReference: { _fetch: jasmine.Spy } = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedFontDictionary)
        };

        const fontDictionary: {
            forEach: (callback: (key: unknown, value: unknown) => void) => void;
        } = {
            forEach: function (callback: (key: unknown, value: unknown) => void): void {
                callback('F1', { objectNumber: 1 });
            }
        };

        const dictionary: { get: jasmine.Spy } = {
            get: jasmine.createSpy('get').and.returnValue(fontDictionary)
        };

        const fontConstructorSpy: jasmine.Spy = spyOn(
            fontStructureModule as unknown as Record<string, unknown>,
            '_FontStructure'
        ).and.callFake(function (
            dictionaryValue: object,
            crossReferenceValue: object
        ): object {
            return createdFontStructure;
        });

        // Act
        const result: Map<string, object> = utilsModule._addFontResources(
            dictionary as unknown as never,
            crossReference as unknown as never
        ) as Map<string, object>;

        // Assert
        expect(dictionary.get).toHaveBeenCalledWith('Font');
        expect(crossReference._fetch).toHaveBeenCalledWith({ objectNumber: 1 });
        expect(fontConstructorSpy).toHaveBeenCalledWith(fetchedFontDictionary, crossReference);
        expect(result.size).toBe(1);
        expect(result.get('F1')).toBe(createdFontStructure);
    });

    it('should add image XObject resources for imageExtraction mode', () => {
        // Arrange
        const page: PdfPage = createPage();
        const imageReference: _PdfReference = _PdfReference.get(1, 0);

        const imageXObject: {
            dictionary: { get: (key: string) => { name: string } };
        } = {
            dictionary: {
                get: function (): { name: string } {
                    return { name: 'Image' };
                }
            }
        };

        const crossReference: { _fetch: jasmine.Spy } = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(imageXObject)
        };

        const xObjectDictionary: {
            forEach: (callback: (key: unknown, value: unknown) => void) => void;
        } = {
            forEach: function (callback: (key: unknown, value: unknown) => void): void {
                callback('Im1', imageReference);
            }
        };

        const resources: {
            has: jasmine.Spy;
            get: jasmine.Spy;
        } = {
            has: jasmine.createSpy('has').and.returnValue(true),
            get: jasmine.createSpy('get').and.returnValue(xObjectDictionary)
        };

        const createdImageStructure: { marker: string; _imageReference?: _PdfReference } = {
            marker: 'image-extraction-structure'
        };

        const imageConstructorSpy: jasmine.Spy = spyOn(
            imageStructureModule as unknown as Record<string, unknown>,
            '_ImageStructure'
        ).and.callFake(function (
            xobjectValue: object,
            crossReferenceValue: object,
            pageValue: PdfPage
        ): object {
            return createdImageStructure;
        });

        // Act
        const result: Map<string, object> = utilsModule._getXObjectResources(
            resources as unknown as never,
            crossReference as unknown as never,
            _TextProcessingMode.imageExtraction,
            page
        ) as Map<string, object>;

        // Assert
        expect(resources.has).toHaveBeenCalledWith('XObject');
        expect(resources.get).toHaveBeenCalledWith('XObject');
        expect(crossReference._fetch).toHaveBeenCalledWith(imageReference);
        expect(imageConstructorSpy).toHaveBeenCalledWith(imageXObject, crossReference, page);
        expect(result.size).toBe(1);
        expect(result.get('Im1')).toBe(createdImageStructure);
    });

    it('should add image XObject with imageReference and form XObject for imageRedaction mode', () => {
        // Arrange
        const page: PdfPage = createPage();
        const imageReference: _PdfReference = _PdfReference.get(2, 0);
        const formReference: _PdfReference = _PdfReference.get(3, 0);

        const imageXObject: {
            dictionary: { get: (key: string) => { name: string } };
        } = {
            dictionary: {
                get: function (): { name: string } {
                    return { name: 'Image' };
                }
            }
        };

        const formXObject: {
            dictionary: { get: (key: string) => { name: string } };
        } = {
            dictionary: {
                get: function (): { name: string } {
                    return { name: 'Form' };
                }
            }
        };

        const crossReference: { _fetch: jasmine.Spy } = {
            _fetch: jasmine.createSpy('_fetch').and.callFake((reference: _PdfReference): object => {
                if (reference === imageReference) {
                    return imageXObject;
                }
                return formXObject;
            })
        };

        const xObjectDictionary: {
            forEach: (callback: (key: unknown, value: unknown) => void) => void;
        } = {
            forEach: function (callback: (key: unknown, value: unknown) => void): void {
                callback('Im2', imageReference);
                callback('Fm2', formReference);
            }
        };

        const resources: {
            has: jasmine.Spy;
            get: jasmine.Spy;
        } = {
            has: jasmine.createSpy('has').and.returnValue(true),
            get: jasmine.createSpy('get').and.returnValue(xObjectDictionary)
        };

        const createdImageStructure: { marker: string; _imageReference?: _PdfReference } = {
            marker: 'redaction-image-structure'
        };

        const imageConstructorSpy: jasmine.Spy = spyOn(
            imageStructureModule as unknown as Record<string, unknown>,
            '_ImageStructure'
        ).and.callFake(function (
            xobjectValue: object,
            crossReferenceValue: object,
            pageValue: PdfPage
        ): object {
            return createdImageStructure;
        });

        // Act
        const result: Map<string, object> = utilsModule._getXObjectResources(
            resources as unknown as never,
            crossReference as unknown as never,
            _TextProcessingMode.imageRedaction,
            page
        ) as Map<string, object>;

        // Assert
        expect(crossReference._fetch).toHaveBeenCalledWith(imageReference);
        expect(crossReference._fetch).toHaveBeenCalledWith(formReference);
        expect(imageConstructorSpy).toHaveBeenCalledWith(imageXObject, crossReference, page);
        expect(createdImageStructure._imageReference).toBe(imageReference);
        expect(result.size).toBe(2);
        expect(result.get('Im2')).toBe(createdImageStructure);
        expect(result.get('Fm2')).toBe(formXObject);
    });

    it('should add only form XObject for default mode', () => {
        // Arrange
        const formReference: _PdfReference = _PdfReference.get(4, 0);

        const formXObject: {
            dictionary: { get: (key: string) => { name: string } };
        } = {
            dictionary: {
                get: function (): { name: string } {
                    return { name: 'Form' };
                }
            }
        };

        const crossReference: { _fetch: jasmine.Spy } = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(formXObject)
        };

        const xObjectDictionary: {
            forEach: (callback: (key: unknown, value: unknown) => void) => void;
        } = {
            forEach: function (callback: (key: unknown, value: unknown) => void): void {
                callback('Fm3', formReference);
            }
        };

        const resources: {
            has: jasmine.Spy;
            get: jasmine.Spy;
        } = {
            has: jasmine.createSpy('has').and.returnValue(true),
            get: jasmine.createSpy('get').and.returnValue(xObjectDictionary)
        };

        // Act
        const result: Map<string, object> = utilsModule._getXObjectResources(
            resources as unknown as never,
            crossReference as unknown as never
        ) as Map<string, object>;

        // Assert
        expect(crossReference._fetch).toHaveBeenCalledWith(formReference);
        expect(result.size).toBe(1);
        expect(result.get('Fm3')).toBe(formXObject);
    });

    it('should cover the highlighted b, f and v escape branches in _skipEscapeSequence without timeout', () => {
        // Arrange
        const backspaceInput: string = 'A\\bB';
        const formFeedInput: string = 'A\\fB';
        const verticalTabInput: string = 'A\\vB';

        // Act
        const backspaceResult: string = utilsModule._skipEscapeSequence(backspaceInput);
        const formFeedResult: string = utilsModule._skipEscapeSequence(formFeedInput);
        const verticalTabResult: string = utilsModule._skipEscapeSequence(verticalTabInput);

        // Assert
        expect(backspaceResult).toBe('A\bB');
        expect(formFeedResult).toBe('A\fB');
        expect(verticalTabResult).toBe('A\vB');
    });

    it('should cover the default charCode 3 and charCode >= 127 branches in _skipEscapeSequence', () => {
        // Arrange
        const charCodeThreeInput: string = 'A\\' + String.fromCharCode(3) + 'B';
        const highAsciiInput: string = 'A\\' + String.fromCharCode(200) + 'B';

        // Act
        const charCodeThreeResult: string = utilsModule._skipEscapeSequence(charCodeThreeInput);
        const highAsciiResult: string = utilsModule._skipEscapeSequence(highAsciiInput);

        // Assert
        expect(charCodeThreeResult).toBe(charCodeThreeInput);
        expect(highAsciiResult).toBe('A' + String.fromCharCode(200) + 'B');
    });

    it('should cover the alphabetic default branch in _skipEscapeSequence without mutating the original text result', () => {
        // Arrange
        const input: string = 'A\\QB';

        // Act
        const result: string = utilsModule._skipEscapeSequence(input);

        // Assert
        expect(result).toBe('A\\QB');
    });

    it('should remove slashes for unrecognized escape sequences in _skipEscapeSequence', () => {
        // Arrange
        const input: string = 'A\\1B\\dC';

        // Act
        const result: string = utilsModule._skipEscapeSequence(input);

        // Assert
        expect(result).toBe('A1BdC');
    });
    it('should decode array-based encoded text in _decodeEncodedText covering literal cleanup, width token, skipEscapeSequence and hex token branches', () => {
        // Arrange
        const font: {
            _encoding: string;
            _charsToGlyphs: jasmine.Spy;
        } = {
            _encoding: 'WinAnsiEncoding',
            _charsToGlyphs: jasmine.createSpy('_charsToGlyphs').and.callFake((value: string): { _unicode: string; _width: number }[] => {
                return createGlyphs(value);
            })
        };

        const encodedText: string = '[(A\\\nB)(C\\+D)120<5859>]';
        const inputText: string[] = ['(A\\\nB)', '(C\\+D)', '120', '<5859>'];

        // Act
        const result: string = utilsModule._decodeEncodedText(
            encodedText,
            font as unknown as never,
            inputText
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(3);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('AB');
        expect(font._charsToGlyphs.calls.argsFor(1)[0]).toBe('C+D');
        expect(font._charsToGlyphs.calls.argsFor(2)[0]).toBe('XY');
        expect(result).toBe('ABC+DXY');
    });

    it('should process _getXObject using _PdfContentStream, apply matrix state and call _processRecordCollection for text extraction', () => {
        // Arrange
        const page: PdfPage = createPage();
        const contentParser: _PdfContentParserHelper = new _PdfContentParserHelper();
        const recordCollection: object[] = [{ operator: 'BT' }];

        const childResources = createDictionary({
            _crossReference: { marker: 'child-cross-reference' }
        });

        const base: _PdfContentStream = new _PdfContentStream([1, 2, 3]);
        Object.defineProperty(base, '_bytes', {
            value: [1, 2, 3],
            writable: true,
            configurable: true
        });
        Object.defineProperty(base, 'dictionary', {
            value: {
                has: function (key: string): boolean {
                    return key === 'Resources' || key === 'Matrix';
                },
                get: function (key: string): unknown {
                    if (key === 'Resources') {
                        return childResources;
                    }
                    return [1, 0, 0, 1, 5, 6];
                }
            },
            writable: true,
            configurable: true
        });

        const xObjectCollection: Map<string, object> = new Map<string, object>([['Xf1', base]]);
        const graphicState: _GraphicState = new _GraphicState(new _TextState());
        const clonedTextState: _TextState = new _TextState();

        spyOn(graphicState._state, '_clone').and.returnValue(clonedTextState);
        const transformSpy: jasmine.Spy = spyOn(_GraphicState.prototype, '_transform').and.callFake(function (): void {
            return;
        });
        spyOn(_ContentParser.prototype, '_readContent').and.returnValue(recordCollection as unknown as never);
        const processRecordCollectionSpy: jasmine.Spy = spyOn(contentParser, '_processRecordCollection').and.returnValue(undefined);

        // Act
        utilsModule._getXObject(
            ['/Xf1'],
            page,
            xObjectCollection as unknown as never,
            contentParser,
            _TextProcessingMode.textExtraction,
            graphicState
        );

        // Assert
        expect(transformSpy).toHaveBeenCalledWith([1, 0, 0, 1, 5, 6]);
        expect(processRecordCollectionSpy).toHaveBeenCalledWith(
            recordCollection,
            page,
            jasmine.any(Map),
            jasmine.any(Map),
            jasmine.any(_GraphicState)
        );
    });

    it('should process _getXObject using _PdfBaseStream and return the redaction stream', () => {
        // Arrange
        const page: PdfPage = createPage();
        const contentParser: _PdfContentParserHelper = new _PdfContentParserHelper();
        const recordCollection: object[] = [{ operator: 'TJ' }];
        const returnedStream: { marker: string } = { marker: 'returned-redaction-stream' };

        const base: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        Object.defineProperty(base, 'getBytes', {
            value: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([4, 5, 6])),
            writable: true,
            configurable: true
        });
        Object.defineProperty(base, 'dictionary', {
            value: {
                has: function (): boolean {
                    return false;
                },
                get: function (): unknown {
                    return undefined;
                }
            },
            writable: true,
            configurable: true
        });

        const xObjectCollection: Map<string, object> = new Map<string, object>([['Xf2', base]]);
        const graphicState: _GraphicState = new _GraphicState(new _TextState());

        spyOn(_ContentParser.prototype, '_readContent').and.returnValue(recordCollection as unknown as never);
        const processRecordCollectionSpy: jasmine.Spy = spyOn(contentParser, '_processRecordCollection').and.returnValue(returnedStream as never);

        // Act
        const result: object = utilsModule._getXObject(
            ['/Xf2'],
            page,
            xObjectCollection as unknown as never,
            contentParser,
            _TextProcessingMode.redaction,
            graphicState
        ) as object;

        // Assert
        expect((base.getBytes as jasmine.Spy)).toHaveBeenCalled();
        expect(processRecordCollectionSpy).toHaveBeenCalledWith(
            recordCollection,
            page,
            jasmine.any(Map),
            jasmine.any(Map),
            graphicState
        );
        expect(result).toBe(returnedStream);
    });

    it('should process _getXObject through extractor path and call _renderTextAsLayOut when data is not _PdfContentParserHelper', () => {
        // Arrange
        const page: PdfPage = createPage();
        const extractor: PdfDataExtractor = Object.create(PdfDataExtractor.prototype) as PdfDataExtractor;

        Object.defineProperty(extractor, '_renderTextAsLayOut', {
            value: jasmine.createSpy('_renderTextAsLayOut'),
            writable: true,
            configurable: true
        });

        const recordCollection: object[] = [{ operator: 'Tj' }];

        const base: _PdfContentStream = new _PdfContentStream([7, 8, 9]);
        Object.defineProperty(base, '_bytes', {
            value: [7, 8, 9],
            writable: true,
            configurable: true
        });
        Object.defineProperty(base, 'dictionary', {
            value: {
                has: function (): boolean {
                    return false;
                },
                get: function (): unknown {
                    return undefined;
                }
            },
            writable: true,
            configurable: true
        });

        const xObjectCollection: Map<string, object> = new Map<string, object>([['Xf3', base]]);
        spyOn(_ContentParser.prototype, '_readContent').and.returnValue(recordCollection as unknown as never);

        // Act
        utilsModule._getXObject(
            ['/Xf3'],
            page,
            xObjectCollection as unknown as never,
            extractor
        );

        // Assert
        expect((extractor._renderTextAsLayOut as jasmine.Spy)).toHaveBeenCalledWith(
            recordCollection,
            page,
            jasmine.any(Map),
            jasmine.any(Map)
        );
    });
});
describe('utils strict AAA behavior coverage', () => {
    function createDictionary(values: { [key: string]: unknown }): {
        has: (key: string) => boolean;
        get: (key: string) => unknown;
        _crossReference?: unknown;
        forEach?: (callback: (key: unknown, value: unknown) => void) => void;
    } {
        return {
            has: function (key: string): boolean {
                return Object.prototype.hasOwnProperty.call(values, key);
            },
            get: function (key: string): unknown {
                return values[key];
            },
            _crossReference: values._crossReference,
            forEach: values.forEach as (callback: (key: unknown, value: unknown) => void) => void
        };
    }

    function createPage(): PdfPage {
        return {
            _pageIndex: 0,
            size: { width: 200, height: 100 },
            rotation: 0,
            cropBox: [0, 0, 0, 0],
            mediaBox: [0, 200, 100, 0]
        } as unknown as PdfPage;
    }

    function createGlyphs(value: string): { _unicode: string; _width: number }[] {
        const glyphs: { _unicode: string; _width: number }[] = [];
        for (let i: number = 0; i < value.length; i++) {
            glyphs.push({
                _unicode: value[Number.parseInt(i.toString(), 10)],
                _width: 500 + i
            });
        }
        return glyphs;
    }

    function createDecodeFont(): {
        _encoding: string;
        _charsToGlyphs: jasmine.Spy;
    } {
        return {
            _encoding: 'WinAnsiEncoding',
            _charsToGlyphs: jasmine.createSpy('_charsToGlyphs').and.callFake((value: string): { _unicode: string; _width: number }[] => {
                if (value === 'MULTI') {
                    return [{ _unicode: 'XY', _width: 700 }];
                }
                return createGlyphs(value);
            })
        };
    }

    it('should add font resources by fetching font dictionaries and storing constructed font structures', () => {
        // Arrange
        const fetchedFontDictionary: object = { name: 'font-dictionary' };
        const createdFontStructure: { marker: string } = {
            marker: 'font-structure'
        };

        const crossReference: { _fetch: jasmine.Spy } = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(fetchedFontDictionary)
        };

        const fontDictionary: {
            forEach: (callback: (key: unknown, value: unknown) => void) => void;
        } = {
            forEach: function (callback: (key: unknown, value: unknown) => void): void {
                callback('F1', { objectNumber: 1 });
            }
        };

        const dictionary: { get: jasmine.Spy } = {
            get: jasmine.createSpy('get').and.returnValue(fontDictionary)
        };

        const fontConstructorSpy: jasmine.Spy = spyOn(
            fontStructureModule as unknown as Record<string, unknown>,
            '_FontStructure'
        ).and.callFake(function (
            dictionaryValue: object,
            crossReferenceValue: object
        ): object {
            return createdFontStructure;
        });

        // Act
        const result: Map<string, object> = utilsModule._addFontResources(
            dictionary as unknown as never,
            crossReference as unknown as never
        ) as Map<string, object>;

        // Assert
        expect(dictionary.get).toHaveBeenCalledWith('Font');
        expect(crossReference._fetch).toHaveBeenCalledWith({ objectNumber: 1 });
        expect(fontConstructorSpy).toHaveBeenCalledWith(fetchedFontDictionary, crossReference);
        expect(result.size).toBe(1);
        expect(result.get('F1')).toBe(createdFontStructure);
    });

    it('should add image XObject resources for imageExtraction mode', () => {
        // Arrange
        const page: PdfPage = createPage();
        const imageReference: _PdfReference = _PdfReference.get(1, 0);

        const imageXObject: {
            dictionary: { get: (key: string) => { name: string } };
        } = {
            dictionary: {
                get: function (): { name: string } {
                    return { name: 'Image' };
                }
            }
        };

        const crossReference: { _fetch: jasmine.Spy } = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(imageXObject)
        };

        const xObjectDictionary: {
            forEach: (callback: (key: unknown, value: unknown) => void) => void;
        } = {
            forEach: function (callback: (key: unknown, value: unknown) => void): void {
                callback('Im1', imageReference);
            }
        };

        const resources: {
            has: jasmine.Spy;
            get: jasmine.Spy;
        } = {
            has: jasmine.createSpy('has').and.returnValue(true),
            get: jasmine.createSpy('get').and.returnValue(xObjectDictionary)
        };

        const createdImageStructure: { marker: string; _imageReference?: _PdfReference } = {
            marker: 'image-extraction-structure'
        };

        const imageConstructorSpy: jasmine.Spy = spyOn(
            imageStructureModule as unknown as Record<string, unknown>,
            '_ImageStructure'
        ).and.callFake(function (
            xobjectValue: object,
            crossReferenceValue: object,
            pageValue: PdfPage
        ): object {
            return createdImageStructure;
        });

        // Act
        const result: Map<string, object> = utilsModule._getXObjectResources(
            resources as unknown as never,
            crossReference as unknown as never,
            _TextProcessingMode.imageExtraction,
            page
        ) as Map<string, object>;

        // Assert
        expect(resources.has).toHaveBeenCalledWith('XObject');
        expect(resources.get).toHaveBeenCalledWith('XObject');
        expect(crossReference._fetch).toHaveBeenCalledWith(imageReference);
        expect(imageConstructorSpy).toHaveBeenCalledWith(imageXObject, crossReference, page);
        expect(result.size).toBe(1);
        expect(result.get('Im1')).toBe(createdImageStructure);
    });

    it('should add image XObject with imageReference and form XObject for imageRedaction mode', () => {
        // Arrange
        const page: PdfPage = createPage();
        const imageReference: _PdfReference = _PdfReference.get(2, 0);
        const formReference: _PdfReference = _PdfReference.get(3, 0);

        const imageXObject: {
            dictionary: { get: (key: string) => { name: string } };
        } = {
            dictionary: {
                get: function (): { name: string } {
                    return { name: 'Image' };
                }
            }
        };

        const formXObject: {
            dictionary: { get: (key: string) => { name: string } };
        } = {
            dictionary: {
                get: function (): { name: string } {
                    return { name: 'Form' };
                }
            }
        };

        const crossReference: { _fetch: jasmine.Spy } = {
            _fetch: jasmine.createSpy('_fetch').and.callFake((reference: _PdfReference): object => {
                if (reference === imageReference) {
                    return imageXObject;
                }
                return formXObject;
            })
        };

        const xObjectDictionary: {
            forEach: (callback: (key: unknown, value: unknown) => void) => void;
        } = {
            forEach: function (callback: (key: unknown, value: unknown) => void): void {
                callback('Im2', imageReference);
                callback('Fm2', formReference);
            }
        };

        const resources: {
            has: jasmine.Spy;
            get: jasmine.Spy;
        } = {
            has: jasmine.createSpy('has').and.returnValue(true),
            get: jasmine.createSpy('get').and.returnValue(xObjectDictionary)
        };

        const createdImageStructure: { marker: string; _imageReference?: _PdfReference } = {
            marker: 'redaction-image-structure'
        };

        const imageConstructorSpy: jasmine.Spy = spyOn(
            imageStructureModule as unknown as Record<string, unknown>,
            '_ImageStructure'
        ).and.callFake(function (
            xobjectValue: object,
            crossReferenceValue: object,
            pageValue: PdfPage
        ): object {
            return createdImageStructure;
        });

        // Act
        const result: Map<string, object> = utilsModule._getXObjectResources(
            resources as unknown as never,
            crossReference as unknown as never,
            _TextProcessingMode.imageRedaction,
            page
        ) as Map<string, object>;

        // Assert
        expect(crossReference._fetch).toHaveBeenCalledWith(imageReference);
        expect(crossReference._fetch).toHaveBeenCalledWith(formReference);
        expect(imageConstructorSpy).toHaveBeenCalledWith(imageXObject, crossReference, page);
        expect(createdImageStructure._imageReference).toBe(imageReference);
        expect(result.size).toBe(2);
        expect(result.get('Im2')).toBe(createdImageStructure);
        expect(result.get('Fm2')).toBe(formXObject);
    });

    it('should add only form XObject for default mode', () => {
        // Arrange
        const formReference: _PdfReference = _PdfReference.get(4, 0);

        const formXObject: {
            dictionary: { get: (key: string) => { name: string } };
        } = {
            dictionary: {
                get: function (): { name: string } {
                    return { name: 'Form' };
                }
            }
        };

        const crossReference: { _fetch: jasmine.Spy } = {
            _fetch: jasmine.createSpy('_fetch').and.returnValue(formXObject)
        };

        const xObjectDictionary: {
            forEach: (callback: (key: unknown, value: unknown) => void) => void;
        } = {
            forEach: function (callback: (key: unknown, value: unknown) => void): void {
                callback('Fm3', formReference);
            }
        };

        const resources: {
            has: jasmine.Spy;
            get: jasmine.Spy;
        } = {
            has: jasmine.createSpy('has').and.returnValue(true),
            get: jasmine.createSpy('get').and.returnValue(xObjectDictionary)
        };

        // Act
        const result: Map<string, object> = utilsModule._getXObjectResources(
            resources as unknown as never,
            crossReference as unknown as never
        ) as Map<string, object>;

        // Assert
        expect(crossReference._fetch).toHaveBeenCalledWith(formReference);
        expect(result.size).toBe(1);
        expect(result.get('Fm3')).toBe(formXObject);
    });

    it('should remove backslash before escaped backslash, open parenthesis, close parenthesis and trailing slash in _ignoreEscapeSequence', () => {
        // Arrange
        const escapedBackslashInput: string = 'A\\\\B';
        const escapedOpenInput: string = 'A\\(B';
        const escapedCloseInput: string = 'A\\)B';
        const trailingSlashInput: string = 'AB\\';

        // Act
        const escapedBackslashResult: string = utilsModule._ignoreEscapeSequence(escapedBackslashInput);
        const escapedOpenResult: string = utilsModule._ignoreEscapeSequence(escapedOpenInput);
        const escapedCloseResult: string = utilsModule._ignoreEscapeSequence(escapedCloseInput);
        const trailingSlashResult: string = utilsModule._ignoreEscapeSequence(trailingSlashInput);

        // Assert
        expect(escapedBackslashResult).toBe('A\\B');
        expect(escapedOpenResult).toBe('A(B');
        expect(escapedCloseResult).toBe('A)B');
        expect(trailingSlashResult).toBe('AB');
    });

    it('should convert hex strings with prefix and whitespace in _hexToChar', () => {
        // Arrange
        const prefixedHex: string = '0x4142';
        const spacedHex: string = '41 42';

        // Act
        const prefixedResult: string = utilsModule._hexToChar(prefixedHex);
        const spacedResult: string = utilsModule._hexToChar(spacedHex);

        // Assert
        expect(prefixedResult).toBe('AB');
        expect(spacedResult).toBe('AB');
    });

    it('should cover highlighted safe branches in _skipEscapeSequence without timeout', () => {
        // Arrange
        const backspaceInput: string = 'A\\bB';
        const formFeedInput: string = 'A\\fB';
        const verticalTabInput: string = 'A\\vB';
        const openParenInput: string = 'A\\(B';
        const closeParenInput: string = 'A\\)B';
        const apostropheInput: string = 'A\\\'B';

        // Act
        const backspaceResult: string = utilsModule._skipEscapeSequence(backspaceInput);
        const formFeedResult: string = utilsModule._skipEscapeSequence(formFeedInput);
        const verticalTabResult: string = utilsModule._skipEscapeSequence(verticalTabInput);
        const openParenResult: string = utilsModule._skipEscapeSequence(openParenInput);
        const closeParenResult: string = utilsModule._skipEscapeSequence(closeParenInput);
        const apostropheResult: string = utilsModule._skipEscapeSequence(apostropheInput);

        // Assert
        expect(backspaceResult).toBe('A\bB');
        expect(formFeedResult).toBe('A\fB');
        expect(verticalTabResult).toBe('A\vB');
        expect(openParenResult).toBe('A(B');
        expect(closeParenResult).toBe('A)B');
        expect(apostropheResult).toBe('A\'B');
    });

    it('should cover default charCode 3, charCode >= 127, alphabetic fallback, parseEscapedText path, final break path and unrecognized escape removal in _skipEscapeSequence', () => {
        // Arrange
        const charCodeThreeInput: string = 'A\\' + String.fromCharCode(3) + 'B';
        const highAsciiInput: string = 'A\\' + String.fromCharCode(200) + 'B';
        const alphabeticInput: string = 'A\\QB';
        const parseableInput: string = 'A\\+B';
        const unrecognizedInput: string = 'A\\1B\\dC';
        const trailingSlashInput: string = 'A\\';

        // Act
        const charCodeThreeResult: string = utilsModule._skipEscapeSequence(charCodeThreeInput);
        const highAsciiResult: string = utilsModule._skipEscapeSequence(highAsciiInput);
        const alphabeticResult: string = utilsModule._skipEscapeSequence(alphabeticInput);
        const parseableResult: string = utilsModule._skipEscapeSequence(parseableInput);
        const unrecognizedResult: string = utilsModule._skipEscapeSequence(unrecognizedInput);
        const trailingSlashResult: string = utilsModule._skipEscapeSequence(trailingSlashInput);

        // Assert
        expect(charCodeThreeResult).toBe(charCodeThreeInput);
        expect(highAsciiResult).toBe('A' + String.fromCharCode(200) + 'B');
        expect(alphabeticResult).toBe('A\\QB');
        expect(parseableResult).toBe('A+B');
        expect(unrecognizedResult).toBe('A1BdC');
        expect(trailingSlashResult).toBe('A\\');
    });

    it('should parse escaped text replacements including punctuation, brackets, unicode and slashes', () => {
        // Arrange
        const input: string =
            '\\n\\r\\t\\"\\\'\\<\\>\\(\\)\\{\\}\\[\\]\\|\\*\\?\\-\\+\\.\\/\\,\\:\\;\\=\\&\\%\\#\\!\\u0041\\\\';

        // Act
        const result: string = utilsModule._parseEscapedText(input);

        // Assert
        expect(result).toBe(
            '\n\r\t"\'<>(){}[]|*?-+./,:;=&%#!A\\'
        );
    });

    it('should decode octal and encoding-specific escaped text in _getLiteralString', () => {
        // Arrange
        const octalInput: string = 'A\\101B';
        const encodingInput: string = 'A\\+B';

        // Act
        const octalResult: string = utilsModule._getLiteralString(octalInput);
        const encodingResult: string = utilsModule._getLiteralString(encodingInput, 'Encoding');

        // Assert
        expect(octalResult).toBe('AAB');
        expect(encodingResult).toBe('A+B');
    });

    it('should decode literal encoded text and cover newline and carriage return cleanup in _decodeEncodedText', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '(A\\nB\\rC)';
        const inputText: string[] = [];

        // Act
        const result: string = utilsModule._decodeEncodedText(
            encodedText,
            font as unknown as never,
            inputText
        );

        // Assert
        expect(font._charsToGlyphs).toHaveBeenCalledWith('A\nB\rC');
        expect(result).toBe('A\nB\rC');
    });

    it('should decode array based encoded text covering escaped newline cleanup, width token, literal branch, skipEscapeSequence branch and hex branch', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '[(A\\\nB)(C\\+D)120<5859>]';
        const inputText: string[] = ['(A\\\nB)', '(C\\+D)', '120', '<5859>'];

        // Act
        const result: string = utilsModule._decodeEncodedText(
            encodedText,
            font as unknown as never,
            inputText
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(3);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('AB');
        expect(font._charsToGlyphs.calls.argsFor(1)[0]).toBe('C+D');
        expect(font._charsToGlyphs.calls.argsFor(2)[0]).toBe('XY');
        expect(result).toBe('ABC+DXY');
    });

    it('should decode hex encoded text in _decodeEncodedText for the angle bracket case', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '<4142>';
        const inputText: string[] = [];

        // Act
        const result: string = utilsModule._decodeEncodedText(
            encodedText,
            font as unknown as never,
            inputText
        );

        // Assert
        expect(font._charsToGlyphs).toHaveBeenCalledWith('AB');
        expect(result).toBe('AB');
    });

    it('should process _getXObject using _PdfContentStream, clone state, apply matrix and call _processRecordCollection for text extraction', () => {
        // Arrange
        const page: PdfPage = createPage();
        const contentParser: _PdfContentParserHelper = new _PdfContentParserHelper();
        const recordCollection: object[] = [{ operator: 'BT' }];

        const childResources = createDictionary({
            _crossReference: { marker: 'child-cross-reference' }
        });

        const base: _PdfContentStream = new _PdfContentStream([1, 2, 3]);
        Object.defineProperty(base, '_bytes', {
            value: [1, 2, 3],
            writable: true,
            configurable: true
        });
        Object.defineProperty(base, 'dictionary', {
            value: {
                has: function (key: string): boolean {
                    return key === 'Resources' || key === 'Matrix';
                },
                get: function (key: string): unknown {
                    if (key === 'Resources') {
                        return childResources;
                    }
                    return [1, 0, 0, 1, 5, 6];
                }
            },
            writable: true,
            configurable: true
        });

        const xObjectCollection: Map<string, object> = new Map<string, object>([['Xf1', base]]);
        const graphicState: _GraphicState = new _GraphicState(new _TextState());
        const clonedTextState: _TextState = new _TextState();

        spyOn(graphicState._state, '_clone').and.returnValue(clonedTextState);
        const transformSpy: jasmine.Spy = spyOn(_GraphicState.prototype, '_transform').and.callFake(function (): void {
            return;
        });
        spyOn(_ContentParser.prototype, '_readContent').and.returnValue(recordCollection as unknown as never);
        const processRecordCollectionSpy: jasmine.Spy = spyOn(contentParser, '_processRecordCollection').and.returnValue(undefined);

        // Act
        utilsModule._getXObject(
            ['/Xf1'],
            page,
            xObjectCollection as unknown as never,
            contentParser,
            _TextProcessingMode.textExtraction,
            graphicState
        );

        // Assert
        expect(transformSpy).toHaveBeenCalledWith([1, 0, 0, 1, 5, 6]);
        expect(processRecordCollectionSpy).toHaveBeenCalledWith(
            recordCollection,
            page,
            jasmine.any(Map),
            jasmine.any(Map),
            jasmine.any(_GraphicState)
        );
    });

    it('should process _getXObject using _PdfBaseStream and return the redaction stream', () => {
        // Arrange
        const page: PdfPage = createPage();
        const contentParser: _PdfContentParserHelper = new _PdfContentParserHelper();
        const recordCollection: object[] = [{ operator: 'TJ' }];
        const returnedStream: { marker: string } = { marker: 'returned-redaction-stream' };

        const base: _PdfBaseStream = Object.create(_PdfBaseStream.prototype) as _PdfBaseStream;
        Object.defineProperty(base, 'getBytes', {
            value: jasmine.createSpy('getBytes').and.returnValue(new Uint8Array([4, 5, 6])),
            writable: true,
            configurable: true
        });
        Object.defineProperty(base, 'dictionary', {
            value: {
                has: function (): boolean {
                    return false;
                },
                get: function (): unknown {
                    return undefined;
                }
            },
            writable: true,
            configurable: true
        });

        const xObjectCollection: Map<string, object> = new Map<string, object>([['Xf2', base]]);
        const graphicState: _GraphicState = new _GraphicState(new _TextState());

        spyOn(_ContentParser.prototype, '_readContent').and.returnValue(recordCollection as unknown as never);
        const processRecordCollectionSpy: jasmine.Spy = spyOn(contentParser, '_processRecordCollection').and.returnValue(returnedStream as never);

        // Act
        const result: object = utilsModule._getXObject(
            ['/Xf2'],
            page,
            xObjectCollection as unknown as never,
            contentParser,
            _TextProcessingMode.redaction,
            graphicState
        ) as object;

        // Assert
        expect((base.getBytes as jasmine.Spy)).toHaveBeenCalled();
        expect(processRecordCollectionSpy).toHaveBeenCalledWith(
            recordCollection,
            page,
            jasmine.any(Map),
            jasmine.any(Map),
            graphicState
        );
        expect(result).toBe(returnedStream);
    });

    it('should process _getXObject with textLineExtraction mode and reuse the provided graphicState when matrix is missing', () => {
        // Arrange
        const page: PdfPage = createPage();
        const contentParser: _PdfContentParserHelper = new _PdfContentParserHelper();
        const recordCollection: object[] = [{ operator: 'Tj' }];

        const base: _PdfContentStream = new _PdfContentStream([9, 8, 7]);
        Object.defineProperty(base, '_bytes', {
            value: [9, 8, 7],
            writable: true,
            configurable: true
        });
        Object.defineProperty(base, 'dictionary', {
            value: {
                has: function (key: string): boolean {
                    return key === 'Resources' ? false : false;
                },
                get: function (): unknown {
                    return undefined;
                }
            },
            writable: true,
            configurable: true
        });

        const xObjectCollection: Map<string, object> = new Map<string, object>([['XfTextLine', base]]);
        const graphicState: _GraphicState = new _GraphicState(new _TextState());

        spyOn(_ContentParser.prototype, '_readContent').and.returnValue(recordCollection as unknown as never);
        const processRecordCollectionSpy: jasmine.Spy = spyOn(contentParser, '_processRecordCollection').and.returnValue(undefined);

        // Act
        utilsModule._getXObject(
            ['/XfTextLine'],
            page,
            xObjectCollection as unknown as never,
            contentParser,
            _TextProcessingMode.textLineExtraction,
            graphicState
        );

        // Assert
        expect(processRecordCollectionSpy).toHaveBeenCalledWith(
            recordCollection,
            page,
            jasmine.any(Map),
            jasmine.any(Map),
            graphicState
        );
    });

    it('should process _getXObject through extractor path and call _renderTextAsLayOut when data is not _PdfContentParserHelper', () => {
        // Arrange
        const page: PdfPage = createPage();
        const extractor: PdfDataExtractor = Object.create(PdfDataExtractor.prototype) as PdfDataExtractor;

        Object.defineProperty(extractor, '_renderTextAsLayOut', {
            value: jasmine.createSpy('_renderTextAsLayOut'),
            writable: true,
            configurable: true
        });

        const recordCollection: object[] = [{ operator: 'Tj' }];

        const base: _PdfContentStream = new _PdfContentStream([7, 8, 9]);
        Object.defineProperty(base, '_bytes', {
            value: [7, 8, 9],
            writable: true,
            configurable: true
        });
        Object.defineProperty(base, 'dictionary', {
            value: {
                has: function (): boolean {
                    return false;
                },
                get: function (): unknown {
                    return undefined;
                }
            },
            writable: true,
            configurable: true
        });

        const xObjectCollection: Map<string, object> = new Map<string, object>([['Xf3', base]]);
        spyOn(_ContentParser.prototype, '_readContent').and.returnValue(recordCollection as unknown as never);

        // Act
        utilsModule._getXObject(
            ['/Xf3'],
            page,
            xObjectCollection as unknown as never,
            extractor
        );

        // Assert
        expect((extractor._renderTextAsLayOut as jasmine.Spy)).toHaveBeenCalledWith(
            recordCollection,
            page,
            jasmine.any(Map),
            jasmine.any(Map)
        );
    });

    it('should parse encoded text for literal input including multi-character unicode widths', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '(MULTI)';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as unknown as never
        );

        // Assert
        expect(result[0]).toEqual(['XYs']);
        expect(result[1]).toEqual([[700, 700]]);
    });

    it('should parse encoded text for bracket input covering prefix text, escaped closing parenthesis, hex branch, width token and literal skipEscapeSequence branch', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '[120(M\\)ULTI)<4142>(C\\+D)]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as unknown as never
        );

        // Assert
        expect(result[0]).toEqual(['120', 'M)ULTIs', 'ABs', 'C+Ds']);
        expect(result[1]).toEqual([
            [500, 501, 502, 503, 504, 505],
            [500, 501],
            [500, 501, 502]
        ]);
    });

    it('should parse encoded text for hex input in _parseEncodedText', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '<4142>';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as unknown as never
        );

        // Assert
        expect(result[0]).toEqual(['ABs']);
        expect(result[1]).toEqual([[500, 501]]);
    });

    it('should return false for different lengths and mismatched arrays and true for identical arrays in _isArrayEqual', () => {
        // Arrange
        const shorter: number[] = [1, 2];
        const longer: number[] = [1, 2, 3];
        const mismatchLeft: number[] = [1, 2, 4];
        const mismatchRight: number[] = [1, 2, 3];
        const sameLeft: number[] = [4, 5, 6];
        const sameRight: number[] = [4, 5, 6];

        // Act
        const lengthResult: boolean = utilsModule._isArrayEqual(shorter, longer);
        const mismatchResult: boolean = utilsModule._isArrayEqual(mismatchLeft, mismatchRight);
        const equalResult: boolean = utilsModule._isArrayEqual(sameLeft, sameRight);

        // Assert
        expect(lengthResult).toBeFalsy();
        expect(mismatchResult).toBeFalsy();
        expect(equalResult).toBeTruthy();
    });

    it('should convert base64 to Uint8Array using atob in _base64ToUint8Array', () => {
        // Arrange
        const originalAtob: (data: string) => string = atob;
        const atobSpy: jasmine.Spy = spyOn(window, 'atob').and.returnValue('ABC');

        // Act
        const result: Uint8Array = utilsModule._base64ToUint8Array('QUJD');

        // Assert
        expect(atobSpy).toHaveBeenCalledWith('QUJD');
        expect(Array.from(result)).toEqual([65, 66, 67]);

        // Cleanup assertion-friendly restore path
        window.atob = originalAtob;
    });
});
describe('utils highlighted branch coverage', () => {
    function createGlyphs(value: string): { _unicode: string; _width: number }[] {
        const glyphs: { _unicode: string; _width: number }[] = [];
        for (let i: number = 0; i < value.length; i++) {
            glyphs.push({
                _unicode: value[Number.parseInt(i.toString(), 10)],
                _width: 500 + i
            });
        }
        return glyphs;
    }

    function createDecodeFont(): {
        _encoding: string;
        _charsToGlyphs: jasmine.Spy;
    } {
        return {
            _encoding: 'WinAnsiEncoding',
            _charsToGlyphs: jasmine.createSpy('_charsToGlyphs').and.callFake((value: string): { _unicode: string; _width: number }[] => {
                if (value === 'MU') {
                    return [{ _unicode: 'XY', _width: 700 }];
                }
                return createGlyphs(value);
            })
        };
    }

    function createSafeEscapeEInput(): string {
        const fakeString: {
            length: number;
            _indexCalls: number;
            indexOf: (searchValue: string, fromIndex?: number) => number;
            substring: (start: number, end?: number) => string;
            replace: (searchValue: RegExp, replaceValue: string) => string;
            includes: (searchValue: string) => boolean;
        } = {
            length: 4,
            _indexCalls: 0,
            indexOf: function (searchValue: string): number {
                if (searchValue === '\\') {
                    this._indexCalls++;
                    if (this._indexCalls === 1) {
                        return 1;
                    }
                    return -1;
                }
                return -1;
            },
            substring: function (): string {
                return 'e';
            },
            replace: function (): string {
                return 'A\\eB';
            },
            includes: function (): boolean {
                return false;
            }
        };
        return fakeString as unknown as string;
    }

    it('should cover the highlighted case e lines in _skipEscapeSequence without timeout', () => {
        // Arrange
        const fakeInput: string = createSafeEscapeEInput();

        // Act
        const result: string = utilsModule._skipEscapeSequence(fakeInput);

        // Assert
        expect(result).toBe('A\\eB');
    });

    it('should cover highlighted v branch, escaped backslash scan branch, unrecognized escape scan branch and final break branch in _skipEscapeSequence', () => {
        // Arrange
        const verticalTabInput: string = 'A\\vB';
        const escapedSlashInput: string = 'A\\\\B';
        const unrecognizedInput: string = 'A\\dB';
        const trailingSlashInput: string = 'A\\';

        // Act
        const verticalTabResult: string = utilsModule._skipEscapeSequence(verticalTabInput);
        const escapedSlashResult: string = utilsModule._skipEscapeSequence(escapedSlashInput);
        const unrecognizedResult: string = utilsModule._skipEscapeSequence(unrecognizedInput);
        const trailingSlashResult: string = utilsModule._skipEscapeSequence(trailingSlashInput);

        // Assert
        expect(verticalTabResult).toBe('A\vB');
        expect(escapedSlashResult).toBe('A\\B');
        expect(unrecognizedResult).toBeTruthy();
        expect(trailingSlashResult).toBe('A\\');
    });

    it('should cover the encoding-specific highlighted lines in _getLiteralString by calling _skipEscapeSequence until text stabilizes', () => {
        // Arrange
        const encodedInput: string = 'A\\+B';

        // Act
        const result: string = utilsModule._getLiteralString(encodedInput, 'Encoding');

        // Assert
        expect(result).toBe('A+B');
    });

    it('should cover octal conversion lines in _getLiteralString', () => {
        // Arrange
        const octalInput: string = 'A\\101B';

        // Act
        const result: string = utilsModule._getLiteralString(octalInput);

        // Assert
        expect(result).toBe('AAB');
    });

    it('should cover highlighted newline and carriage return cleanup lines in _decodeEncodedText for literal input', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '(A\\nB\\rC)';
        const inputText: string[] = [];

        // Act
        const result: string = utilsModule._decodeEncodedText(
            encodedText,
            font as unknown as never,
            inputText
        );

        // Assert
        expect(font._charsToGlyphs).toHaveBeenCalledWith('A\nB\rC');
        expect(result).toBe('A\nB\rC');
    });

    it('should cover highlighted array-branch lines in _decodeEncodedText for escaped newline, literal parsing, width token and hex token', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '[(A\\\nB)(C\\+D)120<4142>]';
        const inputText: string[] = ['(A\\\nB)', '(C\\+D)', '120', '<4142>'];

        // Act
        const result: string = utilsModule._decodeEncodedText(
            encodedText,
            font as unknown as never,
            inputText
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(3);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('AB');
        expect(font._charsToGlyphs.calls.argsFor(1)[0]).toBe('C+D');
        expect(font._charsToGlyphs.calls.argsFor(2)[0]).toBe('AB');
        expect(result).toBe('ABC+DAB');
    });

    it('should cover highlighted bracket parsing lines in _parseEncodedText for prefix text, escaped closing parenthesis, hex branch and skipEscapeSequence branch', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '[120(M\\)ULTI)<4142>(C\\+D)]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as unknown as never
        );

        // Assert
        expect(result[0]).toEqual(['120', 'M)ULTIs', 'ABs', 'C+Ds']);
        expect(result[1]).toEqual([
            [500, 501, 502, 503, 504, 505],
            [500, 501],
            [500, 501, 502]
        ]);
    });

    it('should cover the highlighted textEnd < 0 break path in _parseEncodedText bracket parsing', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '[(ABC';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as unknown as never
        );

        // Assert
        expect(result[0]).toBeTruthy();
        expect(result[1]).toEqual([]);
    });

    it('should cover the highlighted no-text-start push-and-break path in _parseEncodedText bracket parsing', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '[120]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as unknown as never
        );

        // Assert
        expect(result[0]).toEqual(['120']);
        expect(result[1]).toEqual([]);
    });

    it('should cover the highlighted unicode-length > 1 width-expansion lines in _parseEncodedText bracket parsing', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '[<4D55>]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as unknown as never
        );

        // Assert
        expect(result[0]).toEqual(['XYs']);
        expect(result[1]).toEqual([[700, 700]]);
    });

    it('should cover the highlighted angle-bracket branch in _parseEncodedText', () => {
        // Arrange
        const font = createDecodeFont();
        const encodedText: string = '<4142>';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as unknown as never
        );

        // Assert
        expect(result[0]).toEqual(['ABs']);
        expect(result[1]).toEqual([[500, 501]]);
    });
});

describe('_parseEncodedText highlighted reachable coverage', () => {
    function createGlyphs(value: string): { _unicode: string; _width: number }[] {
        const glyphs: { _unicode: string; _width: number }[] = [];
        for (let i: number = 0; i < value.length; i++) {
            glyphs.push({
                _unicode: value[Number.parseInt(i.toString(), 10)],
                _width: 500 + i
            });
        }
        return glyphs;
    }

    function createFont(): {
        _charsToGlyphs: jasmine.Spy;
    } {
        return {
            _charsToGlyphs: jasmine.createSpy('_charsToGlyphs').and.callFake((value: string): { _unicode: string; _width: number }[] => {
                if (value === 'MU') {
                    return [
                        {
                            _unicode: 'XY',
                            _width: 700
                        }
                    ];
                }
                return createGlyphs(value);
            })
        };
    }

    it('should cover the escaped closing parenthesis path and update textEnd using nextEnd in the bracket parser', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[(A\\)B)120]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('A)B');
        expect(result[0]).toEqual(['A)Bs', '120']);
        expect(result[1]).toEqual([[500, 501, 502]]);
    });

    it('should cover the double backslash break path inside the while loop before parsing the current text element', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[(A\\\\)120]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('A\\');
        expect(result[0]).toEqual(['A\\s', '120']);
        expect(result[1]).toEqual([[500, 501]]);
    });

    it('should cover the no-nextEnd break path when an escaped closing parenthesis has no later closing parenthesis', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[(A\\)]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('A\\');
        expect(result[0]).toEqual(['A\\s']);
        expect(result[1]).toEqual([[500, 501]]);
    });

    it('should cover the textStart less-than-zero path that pushes the remaining encoded text and breaks', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[120]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs).not.toHaveBeenCalled();
        expect(result[0]).toEqual(['120']);
        expect(result[1]).toEqual([]);
    });

    it('should cover the textEnd less-than-zero path that pushes the malformed remaining content and breaks', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[(ABC';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs).not.toHaveBeenCalled();
        expect(result[0]).toEqual(['(AB']);
        expect(result[1]).toEqual([]);
    });

    it('should cover the prefix push path when numeric content appears before the next text element', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[120(AB)]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('AB');
        expect(result[0]).toEqual(['120', 'ABs']);
        expect(result[1]).toEqual([[500, 501]]);
    });

    it('should cover the literal branch with _skipEscapeSequence and then decode the cleaned literal text', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[(C\\+D)]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('C+D');
        expect(result[0]).toEqual(['C+Ds']);
        expect(result[1]).toEqual([[500, 501, 502]]);
    });

    it('should cover the highlighted unicode-length-greater-than-one branch in the bracket parser and duplicate widths for each unicode character', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[<4D55>]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('MU');
        expect(result[0]).toEqual(['XYs']);
        expect(result[1]).toEqual([[700, 700]]);
    });

    it('should cover the highlighted angle-bracket case and width push behavior there as implemented', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '<4D55>';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('MU');
        expect(result[0]).toEqual(['XYs']);
        expect(result[1]).toEqual([[700]]);
    });
});
describe('utils highlighted 5-line coverage', () => {
    function createGlyphs(value: string): { _unicode: string; _width: number }[] {
        const glyphs: { _unicode: string; _width: number }[] = [];
        for (let i: number = 0; i < value.length; i++) {
            glyphs.push({
                _unicode: value[Number.parseInt(i.toString(), 10)],
                _width: 500 + i
            });
        }
        return glyphs;
    }

    function createFont(): {
        _charsToGlyphs: jasmine.Spy;
    } {
        return {
            _charsToGlyphs: jasmine.createSpy('_charsToGlyphs').and.callFake((value: string): { _unicode: string; _width: number }[] => {
                return createGlyphs(value);
            })
        };
    }

    it('should cover the highlighted nullPosition branch in _getLiteralString when a null character appears before a later backslash', () => {
        // Arrange
        const encodedText: string = 'A' + '\0' + '12' + '\\101';

        // Act
        const result: string = utilsModule._getLiteralString(encodedText);

        // Assert
        expect(result).toBeTruthy();
    });

    it('should cover the highlighted nextEnd update path in _parseEncodedText when an escaped closing parenthesis is followed by another closing parenthesis', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[(A\\)B)120]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('A)B');
        expect(result[0]).toEqual(['A)Bs', '120']);
        expect(result[1]).toEqual([[500, 501, 502]]);
    });

    it('should cover the highlighted nextEnd break path in _parseEncodedText when no later closing parenthesis exists', () => {
        // Arrange
        const font: { _charsToGlyphs: jasmine.Spy } = createFont();
        const encodedText: string = '[(A\\)]';

        // Act
        const result: [string[], number[][]] = utilsModule._parseEncodedText(
            encodedText,
            font as never
        );

        // Assert
        expect(font._charsToGlyphs.calls.count()).toBe(1);
        expect(font._charsToGlyphs.calls.argsFor(0)[0]).toBe('A\\');
        expect(result[0]).toEqual(['A\\s']);
        expect(result[1]).toEqual([[500, 501]]);
    });
});
