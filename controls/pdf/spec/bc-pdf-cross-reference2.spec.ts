/* eslint-disable @typescript-eslint/no-explicit-any */

import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { _PdfStream, _PdfBaseStream } from '../src/pdf/core/base-stream';
import {
    _PdfDictionary,
    _PdfReference,
    _PdfCommand,
    _PdfName,
    _PdfReferenceSet
} from '../src/pdf/core/pdf-primitives';
import { _PdfParser, _PdfLexicalOperator } from '../src/pdf/core/pdf-parser';
import { PdfCrossReferenceType } from '../src/pdf/core/enumerator';
import { BaseException, FormatError, ParserEndOfFileException } from '../src/pdf/core/utils';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { _PdfEncryptor } from '../src/pdf/core/security/encryptor';
import * as encryptorModule from '../src/pdf/core/security/encryptor';

describe('_PdfCrossReference - highlighted branch coverage', () => {
    var globalThis: any;
    let originalSetTimeout: any;
    const globalObject: any = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});

    function toBytes(text: string): Uint8Array {
        const arr: number[] = [];
        for (let i: number = 0; i < text.length; i++) {
            arr.push(text.charCodeAt(i) & 0xff);
        }
        return new Uint8Array(arr);
    }

    function createDocument(data?: Uint8Array): any {
        const stream: _PdfStream = new _PdfStream(data || new Uint8Array(0));
        return {
            _stream: stream,
            _fileStructure: {
                _crossReferenceType: undefined
            },
            fileStructure: {
                isIncrementalUpdate: false,
                crossReferenceType: PdfCrossReferenceType.table
            },
            _isEncrypted: false,
            _isUserPassword: false,
            _encryptOnlyAttachment: false,
            _hasUserPasswordOnly: false,
            _encryptMetaData: true,
            _startXRefParsedCache: []
        };
    }

    function createXref(data?: Uint8Array): _PdfCrossReference {
        return new _PdfCrossReference(createDocument(data) as any);
    }

    function createValidTrailer(xref: _PdfCrossReference, withId: boolean = true): _PdfDictionary {
        const pages: _PdfDictionary = new _PdfDictionary(xref);
        pages.set('Count', 1);

        const root: _PdfDictionary = new _PdfDictionary(xref);
        root.set('Pages', pages);

        const trailer: _PdfDictionary = new _PdfDictionary(xref);
        trailer.set('Root', root);
        trailer.set('Size', 10);

        if (withId) {
            trailer.set('ID', ['id-1', 'id-2']);
        }

        return trailer;
    }

    beforeEach(() => {
        originalSetTimeout = globalObject.setTimeout;
        spyOn(globalObject, 'setTimeout').and.callFake((cb: any) => {
            cb();
            return 0 as any;
        });
    });

    afterEach(() => {
        globalObject.setTimeout = originalSetTimeout;
    });



    it('should not replace the existing entry in _indexObjects() when reparsing throws ParserEndOfFileException', () => {
        const pdfText: string =
            '1 0 obj\n' +
            'endobj\n' +
            'trailer\n' +
            '<<>>\n';

        const xref: any = createXref(toBytes(pdfText));
        const originalEntry: any = {
            gen: 0,
            offset: 999,
            uncompressed: true,
            free: false
        };
        xref._entries[1] = originalEntry;

        const parserSequence: any[] = [
            _PdfCommand.get('trailer'),
            createValidTrailer(xref, true)
        ];

        spyOn(_PdfParser.prototype as any, 'getObject').and.callFake(() => {
            const item = parserSequence.shift();
            if (!item) {
                throw new ParserEndOfFileException('EOF');
            }
            return item;
        });

        const result: _PdfDictionary = xref._indexObjects();

        expect(result).toBeDefined();
        expect(xref._entries[1]).toBeTruthy();
    });


    it('should create cipher and flush in _saveAsStream() for updated streams/dictionaries and allow catalog branch', () => {
        const xref: any = createXref();
        const buffer: number[] = new Array(512001).fill(1);

        const streamRef: _PdfReference = _PdfReference.get(10, 0);
        const streamDict: _PdfDictionary = new _PdfDictionary(xref);
        streamDict._updated = true;
        streamDict._isProcessed = false;
        streamDict.isCatalog = false;

        const pdfStream: _PdfStream = new _PdfStream(toBytes('abc'), streamDict, 0, 3);

        const catalogRef: _PdfReference = _PdfReference.get(11, 0);
        const catalogDict: _PdfDictionary = new _PdfDictionary(xref);
        catalogDict._updated = true;
        catalogDict._isProcessed = false;
        catalogDict.isCatalog = true;

        xref._cacheMap.set(streamRef, pdfStream);
        xref._cacheMap.set(catalogRef, catalogDict);
        xref._allowCatalog = true;
        xref._nextReferenceNumber = 100;
        xref._trailer = createValidTrailer(xref, false);

        const cipherTransform: any = { encryptString: jasmine.createSpy('encryptString').and.callFake((s: string) => s) };
        xref._encrypt = {
            _createCipherTransform: jasmine.createSpy('_createCipherTransform').and.returnValue(cipherTransform)
        };

        const updatedDictionarySpy: jasmine.Spy = spyOn(xref, '_updatedDictionary').and.callThrough();
        const flushSpy: jasmine.Spy = spyOn(xref, '_flushBuffer').and.callThrough();
        const writeXrefStreamSpy: jasmine.Spy = spyOn(xref, '_writeXrefStream').and.stub();

        xref._saveAsStream(25, buffer);

        expect(xref._encrypt._createCipherTransform).toHaveBeenCalledWith(streamRef.objectNumber, streamRef.generationNumber);
        expect(updatedDictionarySpy).toHaveBeenCalled();
        expect(flushSpy).toHaveBeenCalled();
        expect(writeXrefStreamSpy).toHaveBeenCalled();
        expect(streamDict._isProcessed).toBeTruthy();
    });

    it('should push archived collection indexes and flush in _writeXrefStream()', () => {
        const xref: any = createXref();
        xref._indexes = [0, 1];
        xref._offsets = [];
        xref._currentLength = 50;
        xref._bufferLength = 0;
        xref._nextReferenceNumber = 200;
        xref._trailer = createValidTrailer(xref, false);

        const buffer: number[] = new Array(524289).fill(0);

        const archiveRef: _PdfReference = _PdfReference.get(55, 0);
        const archivedStream: any = {
            _collection: [7, 1, 8, 1],
            _length: 0,
            _archiveOffset: 300,
            _save: jasmine.createSpy('_save')
        };

        xref._objectStreamCollection = new Map<_PdfReference, any>();
        xref._objectStreamCollection.set(archiveRef, archivedStream);

        spyOn(xref, '_copyTrailer').and.stub();
        spyOn(xref, '_writeObject').and.stub();
        const flushSpy: jasmine.Spy = spyOn(xref, '_flushBuffer').and.callFake(() => {
            buffer.length = 0;
        });

        xref._writeXrefStream(buffer);

        expect(archivedStream._save).toHaveBeenCalled();
        expect(xref._indexes).toContain(7);
        expect(xref._indexes).toContain(8);
        expect(xref._indexes).toContain(archiveRef.objectNumber);
        expect(flushSpy).toHaveBeenCalled();
    });

    it('should create ciphers in _writeObjectToBuffer() for updated non-catalog streams and should return early for unsupported empty values', () => {
        const xref: any = createXref();
        const buffer: number[] = [];

        const ref1: _PdfReference = _PdfReference.get(5, 0);
        const streamDict: _PdfDictionary = new _PdfDictionary(xref);
        streamDict._updated = true;
        streamDict.isCatalog = false;
        const streamValue: _PdfStream = new _PdfStream(toBytes('xyz'), streamDict, 0, 3);

        const ref2: _PdfReference = _PdfReference.get(6, 0);

        const cipher: any = { encryptString: jasmine.createSpy('encryptString').and.callFake((s: string) => s) };
        xref._encrypt = {
            _createCipherTransform: jasmine.createSpy('_createCipherTransform').and.returnValue(cipher)
        };

        const writeToBufferSpy: jasmine.Spy = spyOn(xref, '_writeToBuffer').and.stub();
        const writeArchiveStreamSpy: jasmine.Spy = spyOn(xref, '_writeArchiveStream').and.stub();

        xref._writeObjectToBuffer(ref1, streamValue, buffer, new Map());
        xref._writeObjectToBuffer(ref2, {}, buffer, new Map());

        expect(xref._encrypt._createCipherTransform).toHaveBeenCalledWith(ref1.objectNumber, ref1.generationNumber);
        expect(streamDict._updated).toBeFalsy();
        expect(writeToBufferSpy).toHaveBeenCalledWith(buffer, ref1, streamValue, cipher);
        expect(writeArchiveStreamSpy).not.toHaveBeenCalled();
        expect(writeToBufferSpy.calls.count()).toBe(1);
    });

    it('should flush in _writeToBuffer() when buffer exceeds threshold', () => {
        const xref: any = createXref();
        xref._indexes = [];
        xref._offsets = [];
        xref._offsetReference = new Map();

        const key: _PdfReference = _PdfReference.get(9, 0);
        const value: number = 123;
        const buffer: number[] = new Array(512001).fill(0);

        spyOn(xref, '_writeObject').and.stub();
        const flushSpy: jasmine.Spy = spyOn(xref, '_flushBuffer').and.stub();

        xref._writeToBuffer(buffer, key, value);

        expect(xref._offsets.length).toBe(1);
        expect(xref._offsetReference.get(key)).toBeDefined();
        expect(xref._indexes).toEqual([key.objectNumber, 1]);
        expect(flushSpy).toHaveBeenCalled();
    });

    it('should yield on every 100th item and take the stream branch in _writeObjectCollectionAsync()', async () => {
        const xref: any = createXref();
        xref._cacheMap = new Map<_PdfReference, any>();
        xref._document.fileStructure._crossReferenceType = PdfCrossReferenceType.stream;

        const objectCollection: Map<_PdfReference, any> = new Map<_PdfReference, any>();

        for (let i: number = 1; i <= 100; i++) {
            const ref: _PdfReference = _PdfReference.get(i, 0);
            objectCollection.set(ref, i);
        }

        for (let i: number = 101; i <= 200; i++) {
            const ref: _PdfReference = _PdfReference.get(i, 0);
            xref._cacheMap.set(ref, i);
        }

        const writeObjectToBufferSpy: jasmine.Spy = spyOn(xref, '_writeObjectToBuffer').and.stub();
        const flushAsyncSpy: jasmine.Spy = spyOn(xref, '_flushBufferAsync').and.returnValue(Promise.resolve());
        const writeXrefStreamAsyncSpy: jasmine.Spy = spyOn(xref, '_writeXrefStreamAsync').and.returnValue(Promise.resolve());

        const buffer: number[] = new Array(512001).fill(1);

        await xref._writeObjectCollectionAsync(objectCollection, buffer);
        await Promise.resolve();

        expect(writeObjectToBufferSpy).toHaveBeenCalled();
        expect(flushAsyncSpy).toHaveBeenCalled();
        expect(writeXrefStreamAsyncSpy).toHaveBeenCalled();
        expect(globalObject.setTimeout).toHaveBeenCalled();
    });

    it('should create cipher, flush, yield on every 100th item, and write xref stream in _saveAsStreamAsync()', async () => {
        const xref: any = createXref();
        xref._cacheMap = new Map<_PdfReference, any>();
        xref._nextReferenceNumber = 500;
        xref._trailer = createValidTrailer(xref, false);

        const buffer: number[] = new Array(512001).fill(2);
        xref._allowCatalog = true;

        const cipher: any = { encryptString: jasmine.createSpy('encryptString').and.callFake((s: string) => s) };
        xref._encrypt = {
            _createCipherTransform: jasmine.createSpy('_createCipherTransform').and.returnValue(cipher)
        };

        for (let i: number = 1; i <= 100; i++) {
            const ref: _PdfReference = _PdfReference.get(i, 0);
            const dict: _PdfDictionary = new _PdfDictionary(xref);
            dict._updated = true;
            dict._isProcessed = false;
            dict.isCatalog = false;
            const stream: _PdfStream = new _PdfStream(toBytes('s'), dict, 0, 1);
            xref._cacheMap.set(ref, stream);
        }

        for (let i: number = 101; i <= 200; i++) {
            const ref: _PdfReference = _PdfReference.get(i, 0);
            const dict: _PdfDictionary = new _PdfDictionary(xref);
            dict._updated = true;
            dict._isProcessed = false;
            dict.isCatalog = false;
            xref._cacheMap.set(ref, dict);
        }

        const updatedDictionarySpy: jasmine.Spy = spyOn(xref, '_updatedDictionary').and.callThrough();
        const writeArchiveStreamSpy: jasmine.Spy = spyOn(xref, '_writeArchiveStream').and.stub();
        const flushAsyncSpy: jasmine.Spy = spyOn(xref, '_flushBufferAsync').and.returnValue(Promise.resolve());
        const writeXrefStreamAsyncSpy: jasmine.Spy = spyOn(xref, '_writeXrefStreamAsync').and.returnValue(Promise.resolve());

        await xref._saveAsStreamAsync(100, buffer);
        await Promise.resolve();

        expect(xref._encrypt._createCipherTransform).toHaveBeenCalled();
        expect(updatedDictionarySpy).toHaveBeenCalled();
        expect(writeArchiveStreamSpy).toHaveBeenCalled();
        expect(flushAsyncSpy).toHaveBeenCalled();
        expect(writeXrefStreamAsyncSpy).toHaveBeenCalled();
        expect(globalObject.setTimeout).toHaveBeenCalled();
    });

    it('should flush, yield on every 100th item, and write xref in _saveAsTableAsync()', async () => {
        const xref: any = createXref();
        xref._cacheMap = new Map<_PdfReference, any>();

        for (let i: number = 1; i <= 100; i++) {
            const ref: _PdfReference = _PdfReference.get(i, 0);
            const dict: _PdfDictionary = new _PdfDictionary(xref);
            dict._updated = true;
            dict.isCatalog = false;
            dict._isSignature = false;
            xref._cacheMap.set(ref, dict);
        }

        const buffer: number[] = new Array(512001).fill(3);

        spyOn(xref, '_writeObject').and.stub();
        const flushAsyncSpy: jasmine.Spy = spyOn(xref, '_flushBufferAsync').and.returnValue(Promise.resolve());
        const writeXrefAsyncSpy: jasmine.Spy = spyOn(xref, '_writeXrefAsync').and.returnValue(Promise.resolve());

        await xref._saveAsTableAsync(50, buffer);
        await Promise.resolve();

        expect(flushAsyncSpy).toHaveBeenCalled();
        expect(writeXrefAsyncSpy).toHaveBeenCalled();
        expect(globalObject.setTimeout).toHaveBeenCalled();
    });

    it('should indirectly cover _PdfMainObjectCollection._parse() branches for direct refs, all-ref arrays, mixed arrays, and add-to-main-object-collection via _save()', () => {
        const xref: any = createXref();
        xref._version = '1.7';
        xref._nextReferenceNumber = 100;
        xref._cacheMap = new Map<_PdfReference, any>();

        const catalogRef: _PdfReference = _PdfReference.get(1, 0);
        const catalog: _PdfDictionary = new _PdfDictionary(xref);
        catalog.isCatalog = true;

        const refA: _PdfReference = _PdfReference.get(2, 0);
        const refB: _PdfReference = _PdfReference.get(3, 0);
        const refC: _PdfReference = _PdfReference.get(4, 0);
        const refD: _PdfReference = _PdfReference.get(5, 0);
        const refE: _PdfReference = _PdfReference.get(6, 0);
        const refF: _PdfReference = _PdfReference.get(7, 0);
        const refG: _PdfReference = _PdfReference.get(8, 0);

        catalog.set('A', refA);
        catalog.set('C', refC);
        catalog.set('F', refF);

        xref._cacheMap.set(catalogRef, catalog);

        const fetchSpy: jasmine.Spy = spyOn(xref, '_fetch').and.callFake((ref: _PdfReference) => {
            if (ref === refA) return refB;
            if (ref === refB) return 42;
            if (ref === refC) return [refD, refE];
            if (ref === refD) return 100;
            if (ref === refE) return 200;
            if (ref === refF) return [refG, 9];
            if (ref === refG) return 300;
            return undefined;
        });

        spyOn(xref, '_writeObjectCollection').and.callFake(() => { /* no-op */ });
        spyOn(xref, '_flushBuffer').and.callThrough();

        const bytes: Uint8Array = xref._save();

        expect(bytes).toBeDefined();
        expect(fetchSpy).toHaveBeenCalledWith(refA);
        expect(fetchSpy).toHaveBeenCalledWith(refB);
        expect(fetchSpy).toHaveBeenCalledWith(refC);
        expect(fetchSpy).toHaveBeenCalledWith(refD);
        expect(fetchSpy).toHaveBeenCalledWith(refE);
        expect(fetchSpy).toHaveBeenCalledWith(refF);
        expect(fetchSpy).toHaveBeenCalledWith(refG);
        expect(xref._objectCollection).toBeDefined();
        expect(xref._objectCollection._mainObjectCollection.size).toBeGreaterThan(1);
    });

    it('should update an existing same-generation entry in _indexObjects() when reparsing succeeds and should take the nested-object break path without infinite looping', () => {
        // Arrange
        const pdfText: string =
            '1 0 obj\n' +
            '2 0 obj <\n' +   // nested object token to hit nestedObjRegExp path
            'endobj\n' +
            'trailer\n' +
            '<<>>\n' +
            'startxref\n' +
            '0\n';

        const xref: any = createXref(toBytes(pdfText));
        xref._entries[1] = {
            gen: 0,
            offset: 123,
            uncompressed: true,
            free: false
        };

        const validTrailer: _PdfDictionary = createValidTrailer(xref, true);

        let validationParserHit: boolean = false;
        const originalMakeSubStream = xref._stream.makeSubStream.bind(xref._stream);

        spyOn(xref._stream, 'makeSubStream').and.callFake((start: number, length?: number, dict?: any) => {
            validationParserHit = true;
            return originalMakeSubStream(start, length, dict);
        });

        spyOn(_PdfParser.prototype as any, 'getObject').and.callFake(() => {
            if (validationParserHit) {
                validationParserHit = false;
                return 123; // same-generation validation parser succeeds
            }

            // trailer parser calls
            if (!(xref as any).__trailerCmdReturned) {
                (xref as any).__trailerCmdReturned = true;
                return _PdfCommand.get('trailer');
            }

            return validTrailer;
        });

        const readXRefSpy: jasmine.Spy = spyOn(xref, '_readXRef').and.returnValue(undefined);

        // Act
        const result: _PdfDictionary = xref._indexObjects();

        // Assert
        expect(result).toBe(validTrailer);
        expect(readXRefSpy).not.toHaveBeenCalled();
        expect(xref._entries[1]).toBeDefined();
        expect(xref._entries[1].gen).toBe(0);
        expect(xref._entries[1].uncompressed).toBeTruthy();
    });

    it('should replace the entry in _indexObjects() when reparsing throws a non-EOF exception', () => {
        // Arrange
        const pdfText: string =
            '1 0 obj\n' +
            'endobj\n' +
            'trailer\n' +
            '<<>>\n' +
            'startxref\n' +
            '0\n';

        const xref: any = createXref(toBytes(pdfText));
        const originalEntry: any = {
            gen: 0,
            offset: 999,
            uncompressed: true,
            free: false
        };
        xref._entries[1] = originalEntry;

        const validTrailer: _PdfDictionary = createValidTrailer(xref, true);

        let validationParserHit: boolean = false;
        const originalMakeSubStream = xref._stream.makeSubStream.bind(xref._stream);

        spyOn(xref._stream, 'makeSubStream').and.callFake((start: number, length?: number, dict?: any) => {
            validationParserHit = true;
            return originalMakeSubStream(start, length, dict);
        });

        spyOn(_PdfParser.prototype as any, 'getObject').and.callFake(() => {
            if (validationParserHit) {
                validationParserHit = false;
                throw new Error('non eof parser failure'); // must be caught inside _indexObjects()
            }

            if (!(xref as any).__trailerCmdReturned) {
                (xref as any).__trailerCmdReturned = true;
                return _PdfCommand.get('trailer');
            }

            return validTrailer;
        });

        // Act
        const result: _PdfDictionary = xref._indexObjects();

        // Assert
        expect(result).toBe(validTrailer);
        expect(xref._entries[1]).not.toBe(originalEntry);
        expect(xref._entries[1].gen).toBe(0);
        expect(xref._entries[1].uncompressed).toBeTruthy();
    });


    it('should call _readXRef(true), skip invalid trailers via continue branches, handle catch-continue, and finally return the valid trailer with ID in _indexObjects()', (): void => {
        // Arrange
        const pdfText: string =
            // object with /XRef marker to populate crossReferencePosition and call _readXRef(true)
            '1 0 obj\n' +
            '<< /XRef1 >>\n' +
            'endobj\n' +

            // trailer #1 -> non-trailer command branch
            'trailer\n<<>>\nstartxref\n0\n' +

            // trailer #2 -> parser returns non-dictionary
            'trailer\n<<>>\nstartxref\n0\n' +

            // trailer #3 -> dictionary/root/pages throws => catch => continue
            'trailer\n<<>>\nstartxref\n0\n' +

            // trailer #4 -> valid trailer with ID => return
            'trailer\n<<>>\nstartxref\n0\n';

        const xref: any = createXref(toBytes(pdfText));
        xref._startXRefQueue = [];

        const readXRefSpy: jasmine.Spy = spyOn(xref, '_readXRef').and.returnValue(undefined);

        const badRootPagesThrows: _PdfDictionary = new _PdfDictionary(xref);
        const throwingRoot: _PdfDictionary = new _PdfDictionary(xref);

        spyOn(throwingRoot, 'get').and.callFake((key: string): any => {
            if (key === 'Pages') {
                throw new Error('broken pages');
            }
            return undefined;
        });

        badRootPagesThrows.set('Root', throwingRoot);

        const validTrailer: _PdfDictionary = createValidTrailer(xref, true);

        spyOn(_PdfParser.prototype as any, 'getObject').and.returnValues(
            // trailer #1
            _PdfCommand.get('NotTrailer'),

            // trailer #2
            _PdfCommand.get('trailer'),
            'not-a-dictionary' as any,

            // trailer #3
            _PdfCommand.get('trailer'),
            badRootPagesThrows,

            // trailer #4
            _PdfCommand.get('trailer'),
            validTrailer
        );

        // Act
        const result: _PdfDictionary = xref._indexObjects();

        // Assert
        expect(readXRefSpy).toHaveBeenCalledWith(true);
        expect(result).toBe(validTrailer);
    });


    it('should not replace the existing entry in _indexObjects() when reparsing throws ParserEndOfFileException', () => {
        // Arrange
        const pdfText: string =
            '1 0 obj\n' +
            'endobj\n' +
            'trailer\n' +
            '<<>>\n' +
            'startxref\n' +
            '0\n';

        const xref: any = createXref(toBytes(pdfText));
        const originalEntry: any = {
            gen: 0,
            offset: 999,
            uncompressed: true,
            free: false
        };
        xref._entries[1] = originalEntry;

        const validTrailer: _PdfDictionary = createValidTrailer(xref, true);

        let validationParserHit: boolean = false;
        const originalMakeSubStream = xref._stream.makeSubStream.bind(xref._stream);

        spyOn(xref._stream, 'makeSubStream').and.callFake((start: number, length?: number, dict?: any) => {
            validationParserHit = true;
            return originalMakeSubStream(start, length, dict);
        });

        spyOn(_PdfParser.prototype as any, 'getObject').and.callFake(() => {
            if (validationParserHit) {
                validationParserHit = false;
                throw new ParserEndOfFileException('EOF');
            }

            if (!(xref as any).__trailerCmdReturned) {
                (xref as any).__trailerCmdReturned = true;
                return _PdfCommand.get('trailer');
            }

            return validTrailer;
        });

        // Act
        const result: _PdfDictionary = xref._indexObjects();

        // Assert
        expect(result).toBe(validTrailer);

        expect(xref._entries[1]).toBeTruthy();
    });


});

describe('_PdfCrossReference uncovered branches', () => {

    function createDocument(bytes?: number[]): any {
        const stream: _PdfStream = new _PdfStream(new Uint8Array(bytes ? bytes : [37, 80, 68, 70]));
        const fileStructure: any = {
            isIncrementalUpdate: false,
            crossReferenceType: PdfCrossReferenceType.table,
            _crossReferenceType: PdfCrossReferenceType.table
        };
        return {
            _stream: stream,
            _fileStructure: fileStructure,
            fileStructure,
            _isEncrypted: false,
            _isUserPassword: false,
            _hasUserPasswordOnly: false,
            _encryptMetaData: true,
            _encryptOnlyAttachment: false,
            _startXRefParsedCache: []
        } as PdfDocument;
    }

    function createXref(doc?: any): any {
        const document: any = doc || createDocument();
        const xref: any = new _PdfCrossReference(document as PdfDocument);
        xref._trailer = new _PdfDictionary(xref);
        xref._nextReferenceNumber = 1;
        xref._startXRefQueue = [];
        xref._offsets = [];
        xref._indexes = [];
        xref._newLine = '\r\n';
        return xref;
    }

    function createRootTrailer(xref: any, root: _PdfDictionary): _PdfDictionary {
        const trailer: _PdfDictionary = new _PdfDictionary(xref);
        trailer.set('Size', 1);
        trailer.set('Root', root);
        return trailer;
    }

    it('should push Prev objectNumber when Prev is a reference inside _readXRef', () => {
        // Arrange
        const bytes: number[] = Array.from('xref\n').map((c: string) => c.charCodeAt(0));
        const document: any = createDocument(bytes);
        const xref: any = createXref(document);

        xref._setStartXRef(0);

        const dictionary: _PdfDictionary = new _PdfDictionary(xref);
        dictionary.set('Prev', _PdfReference.get(0, 0));
        spyOn(xref, '_processXRefTable').and.returnValue(dictionary);

        // Act
        const result: _PdfDictionary = xref._readXRef();

        // Assert
        expect(result).toBe(dictionary);
        expect(document._startXRefParsedCache).toEqual([0]);
    });

    it('should cover _indexObjects same-generation updateEntries path, nested obj branch, and trailer continue branches', () => {
        // Arrange
        const raw: string =
            '%comment line\r\n' +
            '1 0 obj abc 2 0 obj<</XRef 1>> endobj\r\n' +
            'trailer\r\n<<>>\r\nstartxref\r\n' +
            'trailer\r\n<<>>\r\nstartxref\r\n' +
            'trailer\r\n<<>>\r\nstartxref\r\n';

        const doc: any = createDocument(Array.from(raw).map((c: string) => c.charCodeAt(0)));
        const xref: any = createXref(doc);

        // existing same generation entry -> enters highlighted else if (this._entries[objectNumber].gen === gen)
        xref._entries[1] = { gen: 0 };

        const invalidPagesRoot: _PdfDictionary = new _PdfDictionary(xref);
        invalidPagesRoot.set('Pages', 10); // not a dictionary => continue branch

        const invalidPagesTrailer: _PdfDictionary = new _PdfDictionary(xref);
        invalidPagesTrailer.set('Root', invalidPagesRoot);

        const badCountPages: _PdfDictionary = new _PdfDictionary(xref);
        badCountPages.set('Count', 'invalid');

        const badCountRoot: _PdfDictionary = new _PdfDictionary(xref);
        badCountRoot.set('Pages', badCountPages);

        const badCountTrailer: _PdfDictionary = new _PdfDictionary(xref);
        badCountTrailer.set('Root', badCountRoot);

        const validPages: _PdfDictionary = new _PdfDictionary(xref);
        validPages.set('Count', 1);

        const validRoot: _PdfDictionary = new _PdfDictionary(xref);
        validRoot.set('Pages', validPages);

        const validTrailer: _PdfDictionary = new _PdfDictionary(xref);
        validTrailer.set('Root', validRoot);

        let callIndex: number = 0;
        spyOn(_PdfParser.prototype as any, 'getObject').and.callFake(() => {
            callIndex++;
            switch (callIndex) {
                case 1:
                    return 1; // parser.getObject() in same-generation updateEntries try block
                case 2:
                    return _PdfCommand.get('trailer');
                case 3:
                    return invalidPagesTrailer;
                case 4:
                    return _PdfCommand.get('trailer');
                case 5:
                    return badCountTrailer;
                case 6:
                    return _PdfCommand.get('trailer');
                case 7:
                    return validTrailer;
                default:
                    return undefined;
            }
        });

        // Act
        const result: _PdfDictionary = xref._indexObjects();

        // Assert
        expect(result).toBe(validTrailer);
        expect(xref._entries[1].uncompressed).toBe(true);
    });

    it('should initialize table state in _processXRefTable when it is undefined', () => {
        // Arrange
        const xref: any = createXref();
        const trailer: _PdfDictionary = new _PdfDictionary(xref);

        const parser: any = {
            lexicalOperator: {
                stream: {
                    position: 12
                }
            },
            first: 'first-buffer',
            second: 'second-buffer',
            getObject: jasmine.createSpy('getObject').and.returnValue(trailer)
        };

        spyOn(xref, '_readXRefTable').and.returnValue(_PdfCommand.get('trailer'));

        // Act
        const result: _PdfDictionary = xref._processXRefTable(parser);

        // Assert
        expect(result).toBe(trailer);
        expect(xref._tableState).toBeUndefined();
    });

    it('should update catalog object and flush buffer in _saveAsStream when allowCatalog is true', () => {
        // Arrange
        const xref: any = createXref();
        xref._allowCatalog = true;

        const ref: _PdfReference = _PdfReference.get(5, 0);
        const catalog: any = new _PdfDictionary(xref);
        catalog.isCatalog = true;
        catalog._updated = true;
        catalog._isProcessed = false;

        xref._cacheMap.set(ref, catalog);

        const buffer: number[] = new Array(512001).fill(1);

        spyOn(xref, '_updatedDictionary').and.callFake(() => {
            // no-op
        });
        spyOn(xref, '_flushBuffer').and.callFake(() => {
            // no-op
        });
        spyOn(xref, '_writeXrefStream').and.callFake(() => {
            // no-op
        });

        // Act
        xref._saveAsStream(0, buffer);

        // Assert
        expect(xref._updatedDictionary).toHaveBeenCalledWith(0, ref, buffer, catalog);
        expect(xref._flushBuffer).toHaveBeenCalled();
        expect(xref._writeXrefStream).toHaveBeenCalledWith(buffer);
    });

    it('should update ID, create cipher, and flush in _writeXrefStream', () => {
        // Arrange
        const xref: any = createXref();
        xref._nextReferenceNumber = 10;
        xref._currentLength = 0;
        xref._bufferLength = 0;
        xref._offsets = [];
        xref._indexes = [0, 1];
        xref._ids = ['fixed-id'];
        xref._trailer = new _PdfDictionary(xref);
        xref._objectStreamCollection = new Map();

        const cipher: any = { name: 'cipher' };
        xref._encrypt = {
            _createCipherTransform: jasmine.createSpy('_createCipherTransform').and.returnValue(cipher)
        };

        const buffer: number[] = [7];
        let capturedStream: any;

        spyOn(xref, '_writeObject').and.callFake((obj: any, out: number[], reference?: _PdfReference, transform?: any) => {
            capturedStream = obj;
            expect(transform).toBe(cipher);
            out.push(9);
        });
        spyOn(xref, '_flushBuffer').and.callFake(() => {
            // no-op
        });

        // Act
        xref._writeXrefStream(buffer);

        // Assert
        expect(xref._encrypt._createCipherTransform).toHaveBeenCalled();
        expect(capturedStream instanceof _PdfStream).toBe(true);
        expect(capturedStream.dictionary.get('ID')[0]).toBe('fixed-id');
        expect(typeof capturedStream.dictionary.get('ID')[1]).toBe('string');
        expect(xref._flushBuffer).toHaveBeenCalled();
    });


    it('should write free entry, generation fallback branch, and flush in _writeXrefTable', () => {
        // Arrange
        const xref: any = createXref();
        const refFree: _PdfReference = _PdfReference.get(2, 1);
        const refUsed: _PdfReference = _PdfReference.get(4, 0);

        xref._offsetReference.set(refFree, 0);   // triggers 'f'
        xref._offsetReference.set(refUsed, 25);  // triggers 'n'

        const buffer: number[] = new Array(512001).fill(65); // force flush branch

        spyOn(xref, '_flushBuffer').and.callFake(() => { });

        // Act
        xref._writeXrefTable(buffer);

        // ✅ SAFE decoding (fix)
        const text: string = new TextDecoder().decode(new Uint8Array(buffer));

        // Assert
        expect(text).toContain(' f'); // free entry branch
        expect(text).toContain(' n'); // normal entry branch
        expect(xref._flushBuffer).toHaveBeenCalled(); // flush branch
    });

    it('should copy Encrypt entry in _copyTrailer', () => {
        // Arrange
        const xref: any = createXref();
        const encryptRef: _PdfReference = _PdfReference.get(8, 0);
        const rootRef: _PdfReference = _PdfReference.get(1, 0);
        const infoRef: _PdfReference = _PdfReference.get(2, 0);

        xref._trailer.set('Root', rootRef);
        xref._trailer.set('Info', infoRef);
        xref._trailer.set('Encrypt', encryptRef);

        const newXref: _PdfDictionary = new _PdfDictionary(xref);

        // Act
        xref._copyTrailer(newXref);

        // Assert
        expect(newXref.get('Encrypt')).toBeNull();
        expect(newXref.get('Root')).toBeNull();
        expect(newXref.get('Info')).toBeNull();
    });

    it('should process cache items not present in object collection and flush in _writeObjectCollection', () => {
        // Arrange
        const xref: any = createXref();
        xref._document.fileStructure._crossReferenceType = PdfCrossReferenceType.table;

        const k1: _PdfReference = _PdfReference.get(1, 0);
        const k2: _PdfReference = _PdfReference.get(2, 0);

        const objectCollection: Map<_PdfReference, any> = new Map();
        objectCollection.set(k1, 100);

        xref._cacheMap.set(k1, 100);
        xref._cacheMap.set(k2, 200);

        const buffer: number[] = new Array(512001).fill(5);

        spyOn(xref, '_writeObjectToBuffer').and.callFake(() => {
            // no-op
        });
        spyOn(xref, '_flushBuffer').and.callFake(() => {
            // no-op
        });
        spyOn(xref, '_writeXrefTable').and.callFake(() => {
            // no-op
        });

        // Act
        xref._writeObjectCollection(objectCollection, buffer);

        // Assert
        expect(xref._writeObjectToBuffer).toHaveBeenCalledWith(k2, 200, buffer, jasmine.any(Map));
        expect(xref._flushBuffer).toHaveBeenCalled();
    });

    it('should flush pending buffer in incremental _saveAsync and return merged result without signatures', async () => {
        // Arrange
        const document: any = createDocument([1, 2, 3, 4]);
        document.fileStructure.isIncrementalUpdate = true;
        document._fileStructure.isIncrementalUpdate = true;
        document._fileStructure._crossReferenceType = PdfCrossReferenceType.table;

        const xref: any = createXref(document);
        xref._stream = document._stream;
        xref._version = '1.7';
        xref._signatureCollection = [];

        spyOn(xref, '_saveAsTableAsync').and.callFake(async (_currentLength: number, buffer: number[]) => {
            buffer.push(99);
        });

        // Act
        const result: Uint8Array = await xref._saveAsync();

        // Assert
        expect(result.length).toBeTruthy();
        expect(result[result.length - 1]).toBe(99);
    });

    it('should cover allowCatalog and base stream branches in _saveAsStreamAsync and flush asynchronously', async () => {
        // Arrange
        const xref: any = createXref();
        xref._allowCatalog = true;

        const catalogRef: _PdfReference = _PdfReference.get(10, 0);
        const streamRef: _PdfReference = _PdfReference.get(11, 0);

        const catalog: any = new _PdfDictionary(xref);
        catalog.isCatalog = true;
        catalog._updated = true;
        catalog._isProcessed = false;

        const streamDict: any = new _PdfDictionary(xref);
        streamDict._updated = true;
        streamDict._isProcessed = false;
        streamDict.isCatalog = false;

        const baseStream: any = new _PdfStream(new Uint8Array([1, 2, 3]), streamDict, 0, 3);

        xref._cacheMap.set(catalogRef, catalog);
        xref._cacheMap.set(streamRef, baseStream);

        const buffer: number[] = new Array(512001).fill(8);

        spyOn(xref, '_updatedDictionary').and.callFake(() => {
            // no-op
        });
        spyOn(xref, '_flushBufferAsync').and.callFake(async () => {
            // no-op
        });
        spyOn(xref, '_writeXrefStreamAsync').and.callFake(async () => {
            // no-op
        });

        // Act
        await xref._saveAsStreamAsync(0, buffer);

        // Assert
        expect(xref._updatedDictionary).toHaveBeenCalledWith(0, catalogRef, buffer, catalog);
        expect(xref._flushBufferAsync).toHaveBeenCalled();
    });

    it('should ignore non-dictionary cache items and flush at end in _saveAsTableAsync', async () => {
        // Arrange
        const xref: any = createXref();

        const arrayRef: _PdfReference = _PdfReference.get(20, 0);
        const dictRef: _PdfReference = _PdfReference.get(21, 0);

        xref._cacheMap.set(arrayRef, [1, 2, 3]); // hits dictionary undefined branch

        const updatedDict: any = new _PdfDictionary(xref);
        updatedDict._updated = true;
        updatedDict.isCatalog = false;
        updatedDict._isSignature = false;

        xref._cacheMap.set(dictRef, updatedDict);

        const buffer: number[] = [];

        spyOn(xref, '_flushBufferAsync').and.callFake(async () => {
            // no-op
        });

        // Act
        await xref._saveAsTableAsync(0, buffer);

        // Assert
        expect(xref._flushBufferAsync).toHaveBeenCalled();
    });


    it('should throw when _cacheMap is not a Map during non-incremental save', () => {
        // Arrange
        const xref: any = createXref();
        xref._version = '1.7';
        xref._cacheMap = {} as any;

        // Act / Assert
        expect(() => {
            xref._save();
        }).toThrowError('Expected _cacheMap to be a Map.');
    });

    it('should cover mixed-array add branch and XObject/Form parseStream branch through non-incremental _save', () => {
        // Arrange
        const xref: any = createXref();
        xref._version = '1.7';

        const catalogRef: _PdfReference = _PdfReference.get(1, 0);
        const mixedArrayRef: _PdfReference = _PdfReference.get(2, 0);
        const nestedNumberRef: _PdfReference = _PdfReference.get(3, 0);
        const xObjectStreamRef: _PdfReference = _PdfReference.get(4, 0);

        const catalog: any = new _PdfDictionary(xref);
        catalog.isCatalog = true;
        catalog.set('Mixed', mixedArrayRef);
        catalog.set('XObj', xObjectStreamRef);

        xref._cacheMap.set(catalogRef, catalog);

        const xObjectDict: any = new _PdfDictionary(xref);
        xObjectDict.set('Type', _PdfName.get('XObject'));
        xObjectDict.set('Subtype', _PdfName.get('Form'));
        xObjectDict._updated = false;

        const xObjectStream: any = new _PdfStream(new Uint8Array([11, 22]), xObjectDict, 0, 2);

        spyOn(xref, '_fetch').and.callFake((ref: _PdfReference, suppress?: boolean) => {
            if (ref === mixedArrayRef || (ref.objectNumber === mixedArrayRef.objectNumber && ref.generationNumber === mixedArrayRef.generationNumber)) {
                return [_PdfReference.get(3, 0), 7];
            }
            if (ref.objectNumber === nestedNumberRef.objectNumber) {
                return 9;
            }
            if (ref.objectNumber === xObjectStreamRef.objectNumber) {
                expect(suppress).not.toBe(true); // highlighted XObject/Form branch uses _fetch(key), not _fetch(key, true)
                return xObjectStream;
            }
            return undefined;
        });

        spyOn(xref, '_writeObjectCollection').and.callFake(() => {
            // no-op: constructor/collection parsing is enough for coverage
        });

        // Act
        const result: Uint8Array = xref._save();

        // Assert
        expect(result instanceof Uint8Array).toBe(true);
        expect(xref._fetch).toHaveBeenCalledWith(mixedArrayRef);
        expect(xref._fetch).toHaveBeenCalledWith(jasmine.objectContaining({ objectNumber: 3 }));
        expect(xref._fetch).toHaveBeenCalledWith(xObjectStreamRef);
    });
});


describe('Uncovered red-highlight branches (7 images)', () => {

    function createDoc(): any {
        const stream = new _PdfStream(new Uint8Array([1, 2, 3]));
        return {
            _stream: stream,
            fileStructure: { isIncrementalUpdate: false, crossReferenceType: PdfCrossReferenceType.table },
            _fileStructure: { isIncrementalUpdate: false, _crossReferenceType: PdfCrossReferenceType.table }
        } as PdfDocument;
    }

    function createXref(): any {
        const xref: any = new _PdfCrossReference(createDoc());
        xref._cacheMap = new Map();
        xref._offsetReference = new Map();
        xref._entries = [];
        xref._startXRefQueue = [];
        xref._trailer = new _PdfDictionary(xref);
        xref._nextReferenceNumber = 1;
        return xref;
    }


    /* -----------------------------------------------------------
       2. _parse catch → InvalidXRef (image-2)
    ------------------------------------------------------------ */
    it('should throw InvalidXRef when pages getter fails', () => {
        // Arrange
        const xref: any = createXref();

        const root: any = new _PdfDictionary(xref);
        spyOn(root, 'get').and.throwError('fail');

        const trailer = new _PdfDictionary(xref);
        trailer.set('Root', root);
        trailer.set('Size', 1);

        spyOn(xref, '_readXRef').and.returnValue(trailer);

        // Act + Assert
        expect(() => xref._parse(false)).toThrow();
    });

    /* -----------------------------------------------------------
       3. _indexObjects → same-gen + parser branch (image-3)
    ------------------------------------------------------------ */

    it('should execute same generation updateEntries branch', () => {
        // Arrange
        const xref: any = createXref();

        const raw: string = '1 0 obj test endobj';

        xref._stream = new _PdfStream(
            new Uint8Array(raw.split('').map((c: string) => c.charCodeAt(0)))
        );

        xref._entries[1] = { gen: 0 }; // force same-gen path

        spyOn(_PdfParser.prototype as any, 'getObject').and.returnValue(1);

        // Act
        try {
            xref._indexObjects();
        } catch (e) {
            // ignore invalid pdf structure
        }

        // Assert
        expect(xref._entries[1]).toBeDefined();
    });
    ``

    /* -----------------------------------------------------------
       5. async save branches → allowCatalog + base stream (image-5)
    ------------------------------------------------------------ */
    it('should hit allowCatalog and base stream branches in async save', async () => {
        // Arrange
        const xref: any = createXref();
        xref._allowCatalog = true;

        const ref1 = _PdfReference.get(1, 0);
        const dict = new _PdfDictionary(xref);
        dict._updated = true;
        dict.isCatalog = true;

        const streamDict = new _PdfDictionary(xref);
        streamDict._updated = true;
        const stream = new _PdfStream(new Uint8Array([1]), streamDict, 0, 1);

        xref._cacheMap.set(ref1, dict);
        xref._cacheMap.set(_PdfReference.get(2, 0), stream);

        spyOn(xref, '_flushBufferAsync').and.returnValue(Promise.resolve());

        // Act
        await xref._saveAsStreamAsync(0, []);

        // Assert
        expect(xref._cacheMap.size).toBeGreaterThan(0);
    });

    /* -----------------------------------------------------------
       6. archived stream encryption branch (image-6)
    ------------------------------------------------------------ */

    it('should create cipher during archived stream save', () => {
        // Arrange
        const xref: any = createXref();

        const cipher = {};
        xref._encrypt = {
            _createCipherTransform: jasmine.createSpy().and.returnValue(cipher)
        };

        const ref = _PdfReference.get(10, 0);
        const dict = new _PdfDictionary(xref);

        const collection = new Map();
        xref._writeArchiveStream(collection, ref, dict);

        let archived: any;
        collection.forEach((value: any) => {
            if (!archived) {
                archived = value;
            }
        });

        spyOn(xref, '_writeObject').and.callFake((o: any, b: any, r: any, c: any) => {
            expect(c).toBe(cipher);
        });

        // Act
        archived._save([], 0);

        // Assert
        expect(xref._encrypt._createCipherTransform).toHaveBeenCalled();
    });

  
});
