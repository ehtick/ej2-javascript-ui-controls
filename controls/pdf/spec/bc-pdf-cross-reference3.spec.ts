
/* eslint-disable @typescript-eslint/no-explicit-any */

import { _PdfStream } from '../src/pdf/core/base-stream';
import { _PdfCrossReference } from '../src/pdf/core/pdf-cross-reference';
import { _PdfDictionary, _PdfReference, _PdfCommand } from '../src/pdf/core/pdf-primitives';
import { _PdfParser } from '../src/pdf/core/pdf-parser';
import { ParserEndOfFileException } from '../src/pdf/core/utils';
import { PdfCrossReferenceType } from '../src/pdf/core/enumerator';
import { _CipherTransform } from '../src/pdf/core/security/encryptors/cipher-tranform';

class TestPdfStream {
    bytes: Uint8Array;
    position: number;
    start: number;
    end: number;
    dictionary: any;

    constructor(bytes: number[] = [], dictionary?: any) {
        this.bytes = new Uint8Array(bytes);
        this.position = 0;
        this.start = 0;
        this.end = this.bytes.length;
        this.dictionary = dictionary;
    }

    get length(): number {
        return this.bytes.length;
    }

    getByte(): number {
        if (this.position >= this.bytes.length) {
            this.position = this.bytes.length;
            return -1;
        }
        return this.bytes[this.position++];
    }

    peekByte(): number {
        if (this.position >= this.bytes.length) {
            return -1;
        }
        return this.bytes[this.position];
    }

    skip(n: number = 1): void {
        this.position += n;
        if (this.position < 0) {
            this.position = 0;
        }
        if (this.position > this.bytes.length) {
            this.position = this.bytes.length;
        }
    }

    getBytes(length?: number): Uint8Array {
        if (typeof length === 'undefined') {
            const remaining: Uint8Array = this.bytes.slice(this.position);
            this.position = this.bytes.length;
            return remaining;
        }
        const chunk: Uint8Array = this.bytes.slice(this.position, this.position + length);
        this.position += length;
        if (this.position > this.bytes.length) {
            this.position = this.bytes.length;
        }
        return chunk;
    }

    peekBytes(length: number): Uint8Array {
        return this.bytes.slice(this.position, this.position + length);
    }

    getUnsignedInteger16(): number {
        const high: number = this.getByte();
        const low: number = this.getByte();
        if (high < 0 || low < 0) {
            return 0;
        }
        return (high << 8) | low;
    }

    makeSubStream(start: number, length?: number, dictionary?: any): TestPdfStream {
        const end: number = typeof length === 'undefined' ? this.bytes.length : start + length;
        return new TestPdfStream(Array.from(this.bytes.slice(start, end)), dictionary);
    }

    reset(): void {
        this.position = 0;
    }
}

function bytesFromAscii(value: string): number[] {
    return value.split('').map((ch: string) => ch.charCodeAt(0));
}

function createCrossReference(streamBytes: string = ''): _PdfCrossReference {
    const fileStructure: any = {
        isIncrementalUpdate: false,
        crossReferenceType: PdfCrossReferenceType.table,
        _crossReferenceType: PdfCrossReferenceType.table
    };
    const document: any = {
        _stream: new TestPdfStream(bytesFromAscii(streamBytes)),
        _fileStructure: fileStructure,
        fileStructure,
        _startXRefParsedCache: [],
        _isEncrypted: false
    };
    const xref: _PdfCrossReference = new _PdfCrossReference(document);
    xref._version = '1.7';
    xref._startXRefQueue = [];
    return xref;
}

function createCipherTransformStub(): _CipherTransform {
    const cipher: _CipherTransform = Object.create(_CipherTransform.prototype) as _CipherTransform;
    (cipher as any).encryptString = jasmine.createSpy('encryptString').and.callFake((value: string) => value);
    (cipher as any).decryptString = jasmine.createSpy('decryptString').and.callFake((value: string) => value);
    (cipher as any).createStream = jasmine.createSpy('createStream').and.callFake((stream: any) => stream);
    return cipher;
}

function createPdfStreamWithDictionary(updated: boolean = true, isCatalog: boolean = false): _PdfStream {
    const dictionary: _PdfDictionary = new _PdfDictionary(null as any);
    (dictionary as any)._updated = updated;
    (dictionary as any)._isProcessed = false;
    Object.defineProperty(dictionary, 'isCatalog', {
        value: isCatalog,
        writable: true,
        configurable: true
    });
    return new _PdfStream(new Uint8Array([65, 66, 67]), dictionary, 0, 3);
}

function createParserEndOfFileException(message: string): ParserEndOfFileException {
    const error: ParserEndOfFileException = Object.create(ParserEndOfFileException.prototype) as ParserEndOfFileException;
    (error as any).message = message;
    return error;
}

function expectThrownMessage(action: () => void, expected: RegExp): void {
    let thrown: any; // eslint-disable-line
    try {
        action();
    } catch (error) {
        thrown = error;
    }
    expect(thrown).toBeDefined();
    const message: string = thrown && thrown.message ? thrown.message : String(thrown);
    expect(message).toMatch(expected);
}

describe('_PdfCrossReference highlighted and uncovered branches', () => {
    it('1. covers _parse catch(e) branch when trailerDictionary.get("Root") throws', () => {
        const xref: _PdfCrossReference = createCrossReference();
        const trailerDictionary: any = {
            assignXref: jasmine.createSpy('assignXref'),
            get: jasmine.createSpy('get').and.callFake((key: string) => {
                if (key === 'Size') {
                    return 1;
                }
                if (key === 'Encrypt') {
                    return undefined;
                }
                if (key === 'Root') {
                    throw new Error('forced root read failure');
                }
                return undefined;
            })
        };

        spyOn(xref, '_readXRef').and.returnValue(trailerDictionary);

        expectThrownMessage(() => {
            xref._parse(false);
        }, /Invalid cross reference/);
    });

    it('3. covers _indexObjects branch: if (!(pagesDict instanceof _PdfDictionary)) { continue; }', () => {
        const xref: _PdfCrossReference = createCrossReference('trailer\nstartxref');
        const fallbackTopDictionary: _PdfDictionary = new _PdfDictionary(xref);
        xref._topDictionary = fallbackTopDictionary;

        const trailerDictionary: _PdfDictionary = new _PdfDictionary(xref);
        const rootDictionary: _PdfDictionary = new _PdfDictionary(xref);
        rootDictionary.set('Pages', 123 as any);
        trailerDictionary.set('Root', rootDictionary);

        const getObjectSpy: jasmine.Spy = spyOn(_PdfParser.prototype, 'getObject').and.returnValues(
            _PdfCommand.get('trailer'),
            trailerDictionary
        );

        const result: _PdfDictionary = xref._indexObjects();

        expect(result).toBe(fallbackTopDictionary);
        expect(getObjectSpy).toHaveBeenCalled();
    });

    it('4. covers _indexObjects branch: if (typeof pagesCount === "undefined" || !Number.isInteger(pagesCount)) { continue; }', () => {
        const xref: _PdfCrossReference = createCrossReference('trailer\nstartxref');
        const fallbackTopDictionary: _PdfDictionary = new _PdfDictionary(xref);
        xref._topDictionary = fallbackTopDictionary;

        const trailerDictionary: _PdfDictionary = new _PdfDictionary(xref);
        const rootDictionary: _PdfDictionary = new _PdfDictionary(xref);
        const pagesDictionary: _PdfDictionary = new _PdfDictionary(xref);
        pagesDictionary.set('Count', 'NaN' as any);
        rootDictionary.set('Pages', pagesDictionary);
        trailerDictionary.set('Root', rootDictionary);

        spyOn(_PdfParser.prototype, 'getObject').and.returnValues(
            _PdfCommand.get('trailer'),
            trailerDictionary
        );

        const result: _PdfDictionary = xref._indexObjects();

        expect(result).toBe(fallbackTopDictionary);
    });

    it('5. covers highlighted _indexObjects try path when existing entry has same generation and parser.getObject() succeeds', () => {
        const xref: _PdfCrossReference = createCrossReference('1 0 obj\nendobj\n');
        const fallbackTopDictionary: _PdfDictionary = new _PdfDictionary(xref);
        xref._topDictionary = fallbackTopDictionary;

        (xref as any)._entries[1] = {
            gen: 0,
            offset: 999,
            uncompressed: false
        };

        spyOn(_PdfParser.prototype, 'getObject').and.returnValue(1);

        const result: _PdfDictionary = xref._indexObjects();

        expect(result).toBe(fallbackTopDictionary);
        expect((xref as any)._entries[1]).toBeDefined();
        expect((xref as any)._entries[1].uncompressed).toBeTruthy();
        expect((xref as any)._entries[1].gen).toBe(0);
    });

    it('7. covers highlighted _saveAsync branch where buffer.length > 0 after _writeObjectCollectionAsync', async () => {
        const xref: _PdfCrossReference = createCrossReference();

        const flushSpy: jasmine.Spy = spyOn(xref, '_flushBufferAsync').and.callFake(async (data: number[]) => {
            if (data.length === 0) {
                return;
            }
            const chunk: Uint8Array = new Uint8Array(data.slice());
            xref._uint8Chunks.push(chunk);
            xref._bufferLength += chunk.length;
            data.length = 0;
        });

        spyOn(xref, '_writeObjectCollectionAsync').and.callFake(async (_collection: Map<_PdfReference, any>, buffer: number[]) => {
            buffer.push(10, 20, 30);
        });

        const result: Uint8Array = await xref._saveAsync();

        expect(result instanceof Uint8Array).toBeTruthy();
        expect(flushSpy).toHaveBeenCalled();
        expect(result.length).toBeGreaterThan(0);
    });

    it('8. covers _saveAsTableAsync highlighted branch: if (!(buffer.length > 0)) return [3, 4]; with true path causing _flushBufferAsync', async () => {
        const xref: _PdfCrossReference = createCrossReference();

        const flushSpy: jasmine.Spy = spyOn(xref, '_flushBufferAsync').and.callFake(async (data: number[]) => {
            if (data.length === 0) {
                return;
            }
            const chunk: Uint8Array = new Uint8Array(data.slice());
            xref._uint8Chunks.push(chunk);
            xref._bufferLength += chunk.length;
            data.length = 0;
        });

        spyOn(xref, '_writeXrefAsync').and.callFake(async (buffer: number[]) => {
            buffer.push(55);
        });

        const buffer: number[] = [];
        await xref._saveAsTableAsync(0, buffer);

        expect(flushSpy).toHaveBeenCalled();
    });

    it('9. covers highlighted _saveAsStreamAsync first forEach branch for _PdfBaseStream with updated dictionary and cipher creation', async () => {
        const xref: _PdfCrossReference = createCrossReference();
        const ref: _PdfReference = _PdfReference.get(10, 0);
        const streamValue: _PdfStream = createPdfStreamWithDictionary(true, false);
        const cipher: _CipherTransform = createCipherTransformStub();

        const fakeCacheMap: any = {
            forEach: jasmine.createSpy('forEach').and.callFake((callback: (value: any, key: _PdfReference) => void) => {
                callback(streamValue, ref);
            })
        };

        (xref as any)._cacheMap = fakeCacheMap;
        (xref as any)._encrypt = {
            _createCipherTransform: jasmine.createSpy('_createCipherTransform').and.returnValue(cipher)
        };

        const updatedSpy: jasmine.Spy = spyOn(xref as any, '_updatedDictionary').and.callFake((
            _currentLength: number,
            _key: _PdfReference,
            buffer: number[],
            _value: any,
            _cipher?: _CipherTransform
        ) => {
            buffer.push(1);
        });

        spyOn(xref, '_writeXrefStreamAsync').and.returnValue(Promise.resolve());
        spyOn(xref, '_flushBufferAsync').and.returnValue(Promise.resolve());

        await xref._saveAsStreamAsync(0, []);
        await Promise.resolve();

        expect((xref as any)._encrypt._createCipherTransform).toHaveBeenCalledWith(10, 0);
        expect(updatedSpy).toHaveBeenCalled();
        expect((streamValue.dictionary as any)._isProcessed).toBeTruthy();
    });

    it('10. covers highlighted _saveAsStreamAsync second forEach branch: else if (value instanceof _PdfBaseStream)', async () => {
        const xref: _PdfCrossReference = createCrossReference();
        const ref: _PdfReference = _PdfReference.get(11, 0);
        const streamValue: _PdfStream = createPdfStreamWithDictionary(true, false);

        let forEachCallCount: number = 0;
        const fakeCacheMap: any = {
            forEach: jasmine.createSpy('forEach').and.callFake((callback: (value: any, key: _PdfReference) => void) => {
                forEachCallCount++;
                if (forEachCallCount === 2) {
                    callback(streamValue, ref);
                }
            })
        };

        (xref as any)._cacheMap = fakeCacheMap;
        (xref as any)._encrypt = undefined;

        const updatedSpy: jasmine.Spy = spyOn(xref as any, '_updatedDictionary').and.callFake((
            _currentLength: number,
            _key: _PdfReference,
            buffer: number[],
            _value: any
        ) => {
            buffer.push(2);
        });

        spyOn(xref, '_writeXrefStreamAsync').and.returnValue(Promise.resolve());
        spyOn(xref, '_flushBufferAsync').and.returnValue(Promise.resolve());

        await xref._saveAsStreamAsync(0, []);
        await Promise.resolve();

        expect(updatedSpy).toHaveBeenCalled();
        expect(updatedSpy.calls.mostRecent().args[1]).toBe(ref);
        expect(updatedSpy.calls.mostRecent().args[3]).toBe(streamValue);
    });
});

describe('_PdfMainObjectCollection highlighted and uncovered branches', () => {
    function createCollectionFromSave(): any {
        const xref: _PdfCrossReference = createCrossReference();
        const catalogRef: _PdfReference = _PdfReference.get(1, 0);
        const catalogDictionary: _PdfDictionary = new _PdfDictionary(xref);
        Object.defineProperty(catalogDictionary, 'isCatalog', {
            value: true,
            writable: true,
            configurable: true
        });

        xref._cacheMap.set(catalogRef, catalogDictionary);

        spyOn(xref as any, '_writeObjectCollection').and.stub();

        xref._save();

        return {
            xref,
            collection: (xref as any)._objectCollection
        };
    }

    it('11. covers _PdfMainObjectCollection._parse branch: else if (value instanceof _PdfReference) { this._parseFetchValue(value); }', () => {
        const context: any = createCollectionFromSave();
        const collection: any = context.collection;
        const key: _PdfReference = _PdfReference.get(2, 0);
        const value: _PdfReference = _PdfReference.get(3, 0);

        const parseFetchSpy: jasmine.Spy = spyOn(collection, '_parseFetchValue').and.stub();

        collection._parse(key, value);

        expect(parseFetchSpy).toHaveBeenCalledWith(value);
    });

    it('12. covers _PdfMainObjectCollection._parse array branch that adds key/value into main object collection', () => {
        const context: any = createCollectionFromSave();
        const collection: any = context.collection;
        const key: _PdfReference = _PdfReference.get(4, 0);
        const value: any[] = [1, 'A', true];

        collection._parse(key, value);

        expect(collection._mainObjectCollection.has(key)).toBeTruthy();
        expect(collection._mainObjectCollection.get(key)).toBe(value);
    });

    it('13. covers _PdfMainObjectCollection._parse number branch that adds numeric value into main object collection', () => {
        const context: any = createCollectionFromSave();
        const collection: any = context.collection;
        const key: _PdfReference = _PdfReference.get(5, 0);
        const value: number = 123;

        collection._parse(key, value);

        expect(collection._mainObjectCollection.has(key)).toBeTruthy();
        expect(collection._mainObjectCollection.get(key)).toBe(123);
    });
});
describe('_PdfCrossReference remaining highlighted coverage', () => {
    class TestPdfStream {
        bytes: Uint8Array;
        position: number;
        start: number;
        end: number;
        dictionary: any;
        constructor(bytes: number[] = [], dictionary?: any) {
            this.bytes = new Uint8Array(bytes);
            this.position = 0;
            this.start = 0;
            this.end = this.bytes.length;
            this.dictionary = dictionary;
        }

        get length(): number {
            return this.bytes.length;
        }

        getByte(): number {
            if (this.position >= this.bytes.length) {
                this.position = this.bytes.length;
                return -1;
            }
            return this.bytes[this.position++];
        }

        peekByte(): number {
            if (this.position >= this.bytes.length) {
                return -1;
            }
            return this.bytes[this.position];
        }

        skip(n: number = 1): void {
            this.position += n;
            if (this.position < 0) {
                this.position = 0;
            }
            if (this.position > this.bytes.length) {
                this.position = this.bytes.length;
            }
        }

        getBytes(length?: number): Uint8Array {
            if (typeof length === 'undefined') {
                const remaining: Uint8Array = this.bytes.slice(this.position);
                this.position = this.bytes.length;
                return remaining;
            }
            const chunk: Uint8Array = this.bytes.slice(this.position, this.position + length);
            this.position += length;
            if (this.position > this.bytes.length) {
                this.position = this.bytes.length;
            }
            return chunk;
        }

        peekBytes(length: number): Uint8Array {
            return this.bytes.slice(this.position, this.position + length);
        }

        getUnsignedInteger16(): number {
            const high: number = this.getByte();
            const low: number = this.getByte();
            if (high < 0 || low < 0) {
                return 0;
            }
            return (high << 8) | low;
        }

        makeSubStream(start: number, length?: number, dictionary?: any): TestPdfStream {
            const end: number = typeof length === 'undefined' ? this.bytes.length : start + length;
            return new TestPdfStream(Array.from(this.bytes.slice(start, end)), dictionary);
        }

        reset(): void {
            this.position = 0;
        }
    }

    function bytesFromAscii(value: string): number[] {
        return value.split('').map((ch: string) => ch.charCodeAt(0));
    }

    function createCrossReference(streamBytes: string = ''): _PdfCrossReference {
        const fileStructure: any = {
            isIncrementalUpdate: false,
            crossReferenceType: PdfCrossReferenceType.table,
            _crossReferenceType: PdfCrossReferenceType.table
        };
        const document: any = {
            _stream: new TestPdfStream(bytesFromAscii(streamBytes)),
            _fileStructure: fileStructure,
            fileStructure,
            _startXRefParsedCache: [],
            _isEncrypted: false
        };
        const xref: _PdfCrossReference = new _PdfCrossReference(document);
        xref._version = '1.7';
        xref._startXRefQueue = [];
        xref._crossReferencePosition = Object.create(null);
        return xref;
    }

    function createEntriesBag(entry: any): any {
        const entries: any = {
            length: typeof entry === 'undefined' ? 0 : 2
        };
        if (typeof entry !== 'undefined') {
            entries[1] = entry;
        }
        return entries;
    }

    function createPdfStreamWithDictionary(updated: boolean, isCatalog: boolean, isProcessed: boolean = false): _PdfStream {
        const dictionary: _PdfDictionary = new _PdfDictionary(null as any);
        (dictionary as any)._updated = updated;
        (dictionary as any)._isProcessed = isProcessed;

        Object.defineProperty(dictionary, 'isCatalog', {
            value: isCatalog,
            writable: true,
            configurable: true
        });

        return new _PdfStream(new Uint8Array([65, 66, 67]), dictionary, 0, 3);
    }

    function createParserEndOfFileException(message: string): ParserEndOfFileException {
        const error: ParserEndOfFileException = Object.create(ParserEndOfFileException.prototype) as ParserEndOfFileException;
        (error as any).message = message;
        return error;
    }

    it('1. covers _readXRef XRefStm integer branch and pushes unseen cross-reference position', () => {
        const xref: _PdfCrossReference = createCrossReference();
        const trailerDictionary: any = {
            get: jasmine.createSpy('get').and.callFake((key: string) => {
                if (key === 'XRefStm') {
                    return 12;
                }
                if (key === 'Prev') {
                    return undefined;
                }
                return undefined;
            })
        };

        xref._startXRefQueue = [0];
        const pushSpy: jasmine.Spy = spyOn(xref._startXRefQueue, 'push').and.callThrough();

        spyOn(_PdfParser.prototype, 'getObject').and.returnValue(_PdfCommand.get('xref'));
        spyOn(xref as any, '_processXRefTable').and.returnValue(trailerDictionary);

        const result: any = xref._readXRef();

        expect(result).toBe(trailerDictionary);
        expect(pushSpy).toHaveBeenCalledWith(12);
        expect((xref as any)._crossReferencePosition[12]).toBe(1);
    });

    it('2. covers _readXRef branch: else if (obj instanceof _PdfReference) { this._startXRefQueue.push(obj.objectNumber); }', () => {
        const xref: _PdfCrossReference = createCrossReference();
        const ref: _PdfReference = _PdfReference.get(5, 0);
        const trailerDictionary: any = {
            get: jasmine.createSpy('get').and.callFake((key: string) => {
                if (key === 'XRefStm') {
                    return undefined;
                }
                if (key === 'Prev') {
                    return ref;
                }
                return undefined;
            })
        };

        xref._startXRefQueue = [0];
        const pushSpy: jasmine.Spy = spyOn(xref._startXRefQueue, 'push').and.callThrough();

        spyOn(_PdfParser.prototype, 'getObject').and.returnValue(_PdfCommand.get('xref'));
        spyOn(xref as any, '_processXRefTable').and.returnValue(trailerDictionary);

        const result: any = xref._readXRef();

        expect(result).toBe(trailerDictionary);
        expect(pushSpy).toHaveBeenCalledWith(5);
    });

    it('3. covers _indexObjects highlighted try path when existing entry has same generation and parser.getObject() succeeds', () => {
        const xref: _PdfCrossReference = createCrossReference('1 0 obj\nendobj\n');
        const fallbackTopDictionary: _PdfDictionary = new _PdfDictionary(xref);
        xref._topDictionary = fallbackTopDictionary;

        (xref as any)._entries = createEntriesBag({
            gen: 0,
            offset: 999,
            uncompressed: false
        });

        (xref as any)._cacheMap = {
            clear: jasmine.createSpy('clear')
        };

        const getObjectSpy: jasmine.Spy = spyOn(_PdfParser.prototype, 'getObject').and.returnValue(1);

        const result: _PdfDictionary = xref._indexObjects();

        expect(result).toBe(fallbackTopDictionary);
        expect(getObjectSpy).toHaveBeenCalled();
        expect((xref as any)._entries[1]).toBeDefined();
        expect((xref as any)._entries[1].gen).toBe(0);
        expect((xref as any)._entries[1].offset).toBe(0);
        expect((xref as any)._entries[1].uncompressed).toBeTruthy();
    });

    it('4. covers _indexObjects highlighted catch path with normal Error so updateEntries becomes true', () => {
        const xref: _PdfCrossReference = createCrossReference('1 0 obj\nendobj\n');
        const fallbackTopDictionary: _PdfDictionary = new _PdfDictionary(xref);
        xref._topDictionary = fallbackTopDictionary;

        (xref as any)._entries = createEntriesBag({
            gen: 0,
            offset: 333,
            uncompressed: false
        });

        (xref as any)._cacheMap = {
            clear: jasmine.createSpy('clear')
        };

        spyOn(_PdfParser.prototype, 'getObject').and.callFake(() => {
            throw new Error('forced generic error');
        });

        const result: _PdfDictionary = xref._indexObjects();

        expect(result).toBe(fallbackTopDictionary);
        expect((xref as any)._entries[1]).toBeDefined();
        expect((xref as any)._entries[1].gen).toBe(0);
        expect((xref as any)._entries[1].offset).toBe(0);
        expect((xref as any)._entries[1].uncompressed).toBeTruthy();
    });

    it('5. covers _indexObjects highlighted catch path: updateEntries = !(ex instanceof ParserEndOfFileException)', () => {
        const xref: _PdfCrossReference = createCrossReference('1 0 obj\nendobj\n');
        const fallbackTopDictionary: _PdfDictionary = new _PdfDictionary(xref);
        xref._topDictionary = fallbackTopDictionary;

        (xref as any)._entries = createEntriesBag({
            gen: 0,
            offset: 777,
            uncompressed: false
        });

        (xref as any)._cacheMap = {
            clear: jasmine.createSpy('clear')
        };

        spyOn(_PdfParser.prototype, 'getObject').and.callFake(() => {
            throw createParserEndOfFileException('forced eof');
        });

        const result: _PdfDictionary = xref._indexObjects();

        expect(result).toBe(fallbackTopDictionary);
        expect((xref as any)._entries[1].offset).toBe(777);
        expect((xref as any)._entries[1].uncompressed).toBeFalsy();
    });

    it('6. covers _saveAsStreamAsync highlighted _PdfBaseStream second-loop branch and awaited flushBufferAsync path', async () => {
        const xref: _PdfCrossReference = createCrossReference();
        xref._allowCatalog = true;

        const ref: _PdfReference = _PdfReference.get(20, 0);
        const streamValue: _PdfStream = createPdfStreamWithDictionary(true, true, false);

        let forEachCallCount: number = 0;
        const fakeCacheMap: any = {
            forEach: jasmine.createSpy('forEach').and.callFake((callback: (value: any, key: _PdfReference) => void) => {
                forEachCallCount++;
                if (forEachCallCount === 2) {
                    callback(streamValue, ref);
                }
            })
        };

        (xref as any)._cacheMap = fakeCacheMap;

        const flushSpy: jasmine.Spy = spyOn(xref, '_flushBufferAsync').and.callFake(async (buffer: number[]) => {
            buffer.length = 0;
        });

        const updatedSpy: jasmine.Spy = spyOn(xref as any, '_updatedDictionary').and.callFake((
            _currentLength: number,
            _key: _PdfReference,
            buffer: number[],
            _value: any
        ) => {
            for (let i: number = 0; i < 512001; i++) {
                buffer.push(1);
            }
        });

        spyOn(xref, '_writeXrefStreamAsync').and.returnValue(Promise.resolve());

        const buffer: number[] = [];
        await xref._saveAsStreamAsync(0, buffer);
        await Promise.resolve();
        await Promise.resolve();

        expect(updatedSpy).toHaveBeenCalled();
        expect(updatedSpy.calls.mostRecent().args[1]).toBe(ref);
        expect(updatedSpy.calls.mostRecent().args[3]).toBe(streamValue);
        expect(flushSpy).toHaveBeenCalled();
    });

    it('7. covers _saveAsStreamAsync highlighted _PdfBaseStream second-loop branch without allowCatalog when stream is not catalog', async () => {
        const xref: _PdfCrossReference = createCrossReference();
        xref._allowCatalog = false;

        const ref: _PdfReference = _PdfReference.get(21, 0);
        const streamValue: _PdfStream = createPdfStreamWithDictionary(true, false, false);

        let forEachCallCount: number = 0;
        const fakeCacheMap: any = {
            forEach: jasmine.createSpy('forEach').and.callFake((callback: (value: any, key: _PdfReference) => void) => {
                forEachCallCount++;
                if (forEachCallCount === 2) {
                    callback(streamValue, ref);
                }
            })
        };

        (xref as any)._cacheMap = fakeCacheMap;

        const updatedSpy: jasmine.Spy = spyOn(xref as any, '_updatedDictionary').and.callFake((
            _currentLength: number,
            _key: _PdfReference,
            buffer: number[],
            _value: any
        ) => {
            buffer.push(2);
        });

        const flushSpy: jasmine.Spy = spyOn(xref, '_flushBufferAsync').and.callFake(async (_buffer: number[]) => {
            // no-op
        });

        spyOn(xref, '_writeXrefStreamAsync').and.returnValue(Promise.resolve());

        await xref._saveAsStreamAsync(0, []);
        await Promise.resolve();
        await Promise.resolve();

        expect(updatedSpy).toHaveBeenCalled();
        expect(updatedSpy.calls.mostRecent().args[1]).toBe(ref);
        expect(updatedSpy.calls.mostRecent().args[3]).toBe(streamValue);
        expect(flushSpy).not.toHaveBeenCalled();
    });
});

