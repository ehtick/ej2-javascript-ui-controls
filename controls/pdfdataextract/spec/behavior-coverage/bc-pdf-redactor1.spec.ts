
import * as ej2Pdf from '@syncfusion/ej2-pdf';
import * as utilsModule from '../../src/pdf-data-extract/core/utils';
import { _TextProcessingMode } from '../../src/pdf-data-extract/core/enum';
import { PdfRedactor } from '../../src/pdf-data-extract/core/redaction/pdf-redactor';
import { PdfRedactionRegion } from '../../src/pdf-data-extract/core/redaction/pdf-redaction-region';

describe('PdfRedactor targeted coverage', () => {
    function _setPrivate(target: unknown, key: string, value: unknown): void {
        (target as { [key: string]: unknown })[key] = value;
    }

    function _createRedactorShell(): PdfRedactor {
        const redactor: PdfRedactor = Object.create(PdfRedactor.prototype) as PdfRedactor;
        _setPrivate(redactor, '_isHex', false);
        _setPrivate(redactor, '_redactionRegion', []);
        _setPrivate(redactor, '_redaction', new Map<number, PdfRedactionRegion[]>());
        return redactor;
    }

    function _createPage(index: number, annotationCount: number, resource?: unknown): any { // eslint-disable-line
        const annotationsItems: unknown[] = new Array(annotationCount).fill({});

        const annotations: any = { // eslint-disable-line
            at: (i: number): unknown => annotationsItems[i],
            removeAt: jasmine.createSpy('removeAt').and.callFake((i: number): void => {
                annotationsItems.splice(i, 1);
            })
        };

        Object.defineProperty(annotations, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => annotationsItems.length
        });

        return {
            _pageIndex: index,
            rotation: (ej2Pdf as any).PdfRotationAngle.angle0, // eslint-disable-line
            size: { width: 500, height: 700 },
            _needInitializeGraphics: false,
            _pageDictionary: {
                _crossReference: { _xrefId: 1 },
                get: jasmine.createSpy('get').and.callFake((key: string): unknown => {
                    if (key === 'Resources') {
                        return resource;
                    }
                    return undefined;
                })
            },
            annotations
        };
    }

    it('should cover redactSync highlighted lines including applyRedaction, resources branch, processRecordCollection and updateContentStream', () => {
        // Arrange
        const redactor: PdfRedactor = _createRedactorShell();

        const resource: any = { _resource: true }; // eslint-disable-line
        const page0: any = _createPage(0, 1, resource); // eslint-disable-line
        const page1: any = _createPage(1, 0, undefined); // eslint-disable-line

        const document: any = { // eslint-disable-line
            pageCount: 2,
            getPage: jasmine.createSpy('getPage').and.callFake((index: number): unknown => {
                return index === 0 ? page0 : page1;
            }),
            fileStructure: { isIncrementalUpdate: true },
            _crossReference: {}
        };

        const parser: any = { // eslint-disable-line
            _getPageRecordCollection: jasmine.createSpy('_getPageRecordCollection').and.returnValue([{ _id: 1 }]),
            _processRecordCollection: jasmine.createSpy('_processRecordCollection').and.returnValue({ _stream: true })
        };

        const updateObject: any = { // eslint-disable-line
            _updateContentStream: jasmine.createSpy('_updateContentStream')
        };

        _setPrivate(redactor, '_document', document);
        _setPrivate(redactor, '_crossReference', document._crossReference);
        _setPrivate(redactor, '_parser', parser);
        _setPrivate(redactor, '_object', updateObject);

        const region: PdfRedactionRegion = {
            pageIndex: 0,
            bounds: { x: 10, y: 10, width: 20, height: 20 }
        } as unknown as PdfRedactionRegion;

        const redactionMap: Map<number, PdfRedactionRegion[]> = new Map<number, PdfRedactionRegion[]>();
        redactionMap.set(0, [region]);
        _setPrivate(redactor, '_redaction', redactionMap);

        const applySpy: jasmine.Spy = spyOn(
            redactor as unknown as { _applyRedaction(page: unknown): void },
            '_applyRedaction'
        ).and.callFake((): void => {
            return;
        });

        const combineSpy: jasmine.Spy = spyOn(
            redactor as unknown as { _combineBounds(options: PdfRedactionRegion[]): void },
            '_combineBounds'
        ).and.callThrough();

        const addFontSpy: jasmine.Spy = spyOn(utilsModule, '_addFontResources').and.returnValue(new Map<string, unknown>());
        const getXObjectSpy: jasmine.Spy = spyOn(utilsModule, '_getXObjectResources').and.returnValue(new Map<string, unknown>());

        // Act
        redactor.redactSync();

        // Assert
        expect(applySpy).toHaveBeenCalledWith(page0);
        expect(applySpy).not.toHaveBeenCalledWith(page1);

        expect(combineSpy).toHaveBeenCalledWith([region]);
        expect(parser._getPageRecordCollection).toHaveBeenCalledWith(page0);
        expect(addFontSpy).toHaveBeenCalledWith(resource, page0._pageDictionary._crossReference);
        expect(getXObjectSpy).toHaveBeenCalledWith(resource, page0._pageDictionary._crossReference);
        expect(parser._processRecordCollection).toHaveBeenCalled();
        expect(page0._needInitializeGraphics).toBeTruthy();
        expect(updateObject._updateContentStream).toHaveBeenCalledWith(
            page0,
            { _stream: true },
            [region],
            document
        );
    });

    it('should cover redact highlighted lines including callback canvas validation, decoder support, image record processing and updateContentStream', async () => {
        // Arrange
        const redactor: PdfRedactor = _createRedactorShell();

        const resource: any = { _resource: true }; // eslint-disable-line
        const page0: any = _createPage(0, 1, resource); // eslint-disable-line

        const crossReference: any = { _isDecoderSupport: false }; // eslint-disable-line
        const document: any = { // eslint-disable-line
            pageCount: 1,
            getPage: jasmine.createSpy('getPage').and.returnValue(page0),
            fileStructure: { isIncrementalUpdate: true },
            _crossReference: crossReference
        };

        const parser: any = { // eslint-disable-line
            _getPageRecordCollection: jasmine.createSpy('_getPageRecordCollection').and.returnValue([{ _id: 2 }]),
            _processImageRecordCollection: jasmine.createSpy('_processImageRecordCollection').and.returnValue(
                Promise.resolve({ _imageStream: true })
            )
        };

        const updateObject: any = { // eslint-disable-line
            _updateContentStream: jasmine.createSpy('_updateContentStream')
        };

        _setPrivate(redactor, '_document', document);
        _setPrivate(redactor, '_crossReference', crossReference);
        _setPrivate(redactor, '_parser', parser);
        _setPrivate(redactor, '_object', updateObject);

        const region: PdfRedactionRegion = {
            pageIndex: 0,
            bounds: { x: 100, y: 100, width: 50, height: 50 }
        } as unknown as PdfRedactionRegion;

        const redactionMap: Map<number, PdfRedactionRegion[]> = new Map<number, PdfRedactionRegion[]>();
        redactionMap.set(0, [region]);
        _setPrivate(redactor, '_redaction', redactionMap);

        const applySpy: jasmine.Spy = spyOn(
            redactor as unknown as { _applyRedaction(page: unknown): void },
            '_applyRedaction'
        ).and.callFake((): void => {
            return;
        });

        const combineSpy: jasmine.Spy = spyOn(
            redactor as unknown as { _combineBounds(options: PdfRedactionRegion[]): void },
            '_combineBounds'
        ).and.callThrough();

        const addFontSpy: jasmine.Spy = spyOn(utilsModule, '_addFontResources').and.returnValue(new Map<string, unknown>());
        const getXObjectSpy: jasmine.Spy = spyOn(utilsModule, '_getXObjectResources').and.returnValue(new Map<string, unknown>());

        const callback = (): { canvas: unknown; applicationPlatform: string } => {
            return { canvas: {}, applicationPlatform: 'typescript' };
        };

        // Act
        await redactor.redact(callback as any);

        // Assert
        expect(document.fileStructure.isIncrementalUpdate).toBeFalsy();
        expect(applySpy).toHaveBeenCalledWith(page0);
        expect(combineSpy).toHaveBeenCalledWith([region]);
        expect(crossReference._isDecoderSupport).toBeTruthy();
        expect(parser._getPageRecordCollection).toHaveBeenCalledWith(page0);

        expect(addFontSpy).toHaveBeenCalledWith(resource, page0._pageDictionary._crossReference);
        expect(getXObjectSpy).toHaveBeenCalledWith(
            resource,
            crossReference,
            _TextProcessingMode.imageRedaction,
            page0
        );

        expect(parser._processImageRecordCollection).toHaveBeenCalled();
        const args: unknown[] = parser._processImageRecordCollection.calls.argsFor(0);
        expect(args[5]).toEqual({ canvas: {}, applicationPlatform: 'typescript' });
        expect(args[6]).toBe(_TextProcessingMode.imageRedaction);
        expect(args[8]).toBeTruthy();

        expect(page0._needInitializeGraphics).toBeTruthy();
        expect(updateObject._updateContentStream).toHaveBeenCalledWith(
            page0,
            { _imageStream: true },
            [region],
            document
        );
    });

    it('should cover _applyRedaction highlighted lines for multi-bounds and single-bounds branches and concatenation into existing map entry', () => {
        // Arrange
        const redactor: PdfRedactor = _createRedactorShell();

        const existingRegion: PdfRedactionRegion = {
            pageIndex: 5,
            bounds: { x: 1, y: 1, width: 2, height: 2 }
        } as unknown as PdfRedactionRegion;

        const redactionMap: Map<number, PdfRedactionRegion[]> = new Map<number, PdfRedactionRegion[]>();
        redactionMap.set(5, [existingRegion]);
        _setPrivate(redactor, '_redaction', redactionMap);

        const multiRedactionAnnotation: any = Object.create((ej2Pdf as any).PdfRedactionAnnotation.prototype); // eslint-disable-line
        Object.defineProperty(multiRedactionAnnotation, 'flatten', {
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(multiRedactionAnnotation, 'boundsCollection', {
            configurable: true,
            writable: true,
            value: [
                { x: 10, y: 10, width: 20, height: 20 },
                { x: 30, y: 30, width: 40, height: 40 }
            ]
        });
        Object.defineProperty(multiRedactionAnnotation, '_createNormalAppearance', {
            configurable: true,
            writable: true,
            value: jasmine.createSpy('_createNormalAppearance').and.callFake((index: number): unknown => {
                return { _appearanceIndex: index };
            })
        });

        const singleRedactionAnnotation: any = Object.create((ej2Pdf as any).PdfRedactionAnnotation.prototype); // eslint-disable-line
        Object.defineProperty(singleRedactionAnnotation, 'flatten', {
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(singleRedactionAnnotation, 'boundsCollection', {
            configurable: true,
            writable: true,
            value: [{ x: 50, y: 50, width: 60, height: 60 }]
        });
        Object.defineProperty(singleRedactionAnnotation, 'bounds', {
            configurable: true,
            writable: true,
            value: { x: 50, y: 50, width: 60, height: 60 }
        });
        Object.defineProperty(singleRedactionAnnotation, '_createNormalAppearance', {
            configurable: true,
            writable: true,
            value: jasmine.createSpy('_createNormalAppearance').and.callFake((index: number | undefined): unknown => {
                return { _appearanceIndex: index };
            })
        });

        const items: any[] = [multiRedactionAnnotation, singleRedactionAnnotation]; // eslint-disable-line
        const annotations: any = { // eslint-disable-line
            at: (index: number): unknown => items[index],
            removeAt: jasmine.createSpy('removeAt').and.callFake((index: number): void => {
                items.splice(index, 1);
            })
        };

        Object.defineProperty(annotations, 'count', {
            configurable: true,
            enumerable: true,
            get: (): number => items.length
        });

        const page: any = { // eslint-disable-line
            _pageIndex: 5,
            rotation: (ej2Pdf as any).PdfRotationAngle.angle0,
            annotations
        };

        const calculateSpy: jasmine.Spy = spyOn(
            redactor as unknown as {
                _calculateRotatedBounds(pageArg: unknown, bounds: ej2Pdf.Rectangle): ej2Pdf.Rectangle;
            },
            '_calculateRotatedBounds'
        ).and.callFake((_pageArg: unknown, bounds: ej2Pdf.Rectangle): ej2Pdf.Rectangle => {
            return bounds;
        });

        // Act
        (redactor as unknown as { _applyRedaction(pageArg: unknown): void })._applyRedaction(page);

        // Assert
        expect(multiRedactionAnnotation.flatten).toBeTruthy();
        expect(singleRedactionAnnotation.flatten).toBeTruthy();

        expect(calculateSpy).toHaveBeenCalled();
        expect(multiRedactionAnnotation._createNormalAppearance).toHaveBeenCalledTimes(2);
        expect(singleRedactionAnnotation._createNormalAppearance).toHaveBeenCalledWith(
            undefined,
            singleRedactionAnnotation.bounds,
            page.rotation
        );

        expect(annotations.removeAt).toHaveBeenCalled();

        const finalRegions: PdfRedactionRegion[] | undefined = (redactor as unknown as {
            _redaction: Map<number, PdfRedactionRegion[]>;
        })._redaction.get(5);

        expect(finalRegions).toBeDefined();
        expect(finalRegions!.length).toBe(4);
    });

    it('should cover _optimizeContent ID branch lines for slash-slash, slash-next and default builder cases', () => {
        // Arrange
        const redactor: PdfRedactor = _createRedactorShell();

        const stream: { write: jasmine.Spy } = {
            write: jasmine.createSpy('write')
        };

        const recordCollection: any[] = [ // eslint-disable-line
            {
                _operands: ['/A', '/B', '/C', '123', 'hello'],
                _operator: 'ID'
            }
        ];

        // Act
        (redactor as unknown as {
            _optimizeContent(
                recordCollection: any[], // eslint-disable-line
                index: number,
                updatedText: string,
                streamArg: { write: (value: unknown) => void }
            ): void;
        })._optimizeContent(recordCollection, 0, '', stream);

        // Assert
        const expectedText: string = '/A /B\r\n/C 123\r\nhello ';
        const expectedBytes: number[] = expectedText.split('').map((ch: string): number => ch.charCodeAt(0));

        expect(stream.write.calls.argsFor(0)[0]).toEqual(expectedBytes);
        expect(stream.write.calls.argsFor(1)[0]).toBe('ID');
        expect(stream.write.calls.argsFor(2)[0]).toBe('\n');
    });

    it('should cover _mapString highlighted lines for subString branch and continue branch', () => {
        // Arrange
        const redactor: PdfRedactor = _createRedactorShell();

        const glyphs: any[] = [ // eslint-disable-line
            { _glyph: 'g1' },
            { _glyph: 'g2' },
            { _glyph: 'g3' }
        ];

        const mainTextCollection: string[] = [
            '(AB)',
            '(',
            'XYZ'
        ];

        // Act
        const result: any[] = (redactor as unknown as { // eslint-disable-line
            _mapString(mainTextCollectionArg: string[], glyphArg: any[]): any[]; // eslint-disable-line
        })._mapString(mainTextCollection, glyphs);

        // Assert
        expect(result.length).toBe(2);

        expect(result[0].glyph.length).toBe(2);
        expect(result[0].glyph[0]).toBe(glyphs[0]);
        expect(result[0].glyph[1]).toBe(glyphs[1]);

        expect(result[1].text).toBe('XYZ');
    });
});
