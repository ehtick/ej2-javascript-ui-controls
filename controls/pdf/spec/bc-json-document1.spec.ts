
/* eslint-disable @typescript-eslint/no-explicit-any */

import { _JsonDocument } from '../src/pdf/core/import-export/json-document';
import { _PdfDictionary, _PdfName, _PdfReference } from '../src/pdf/core/pdf-primitives';
import { _PdfBaseStream, _PdfStream } from '../src/pdf/core/base-stream';
import { _encode, _stringToBytes } from '../src/pdf/core/utils';
import * as utils from '../src/pdf/core/utils';

describe('_JsonDocument coverage branches', () => {

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value,
            configurable: true,
            writable: true,
            enumerable: true
        });
    }

    function createReference(objectNumber: number, generationNumber: number = 0, isNew: boolean = false): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        defineValue(reference, 'objectNumber', objectNumber);
        defineValue(reference, 'generationNumber', generationNumber);
        defineValue(reference, '_isNew', isNew);
        return reference;
    }

    function createCrossReference(): any {
        let counter: number = 1;
        return {
            _cacheMap: new Map<any, any>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
                return createReference(counter++, 0, false);
            }),
            _fetch: jasmine.createSpy('_fetch').and.callFake((reference: any): any => {
                return reference._target;
            })
        };
    }

    function createDocumentForImport(page?: any): any {
        const crossReference: any = createCrossReference();
        return {
            _crossReference: crossReference,
            _allowImportCustomData: false,
            pageCount: page ? 1 : 0,
            getPage: jasmine.createSpy('getPage').and.callFake((_index: number): any => page)
        };
    }

    function createPageStub(): any {
        const crossReference: any = createCrossReference();
        const pageDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        const parsedAnnotation: any = { _isImported: false };
        const annotations: any = {
            _annotations: [],
            _comments: [{ note: 'existing comment' }],
            _parsedAnnotations: new Map<number, any>(),
            _parseAnnotation: jasmine.createSpy('_parseAnnotation').and.returnValue(parsedAnnotation),
            count: 0
        };
        return {
            _crossReference: crossReference,
            _pageDictionary: pageDictionary,
            annotations,
            parsedAnnotation
        };
    }

    function createPdfStream(byteRange?: Uint8Array): any {
        const pdfStream: any = Object.create(_PdfStream.prototype);
        defineValue(pdfStream, 'start', 0);
        defineValue(pdfStream, 'end', (byteRange && byteRange.length) ? byteRange.length : 4);
        pdfStream.getByteRange = jasmine.createSpy('getByteRange').and.returnValue(byteRange || new Uint8Array([65, 66, 67, 68]));
        return pdfStream;
    }

    function createBaseStream(dictionary: _PdfDictionary, data: string = 'ABCD', length: number = 4): any {
        const baseStream: any = Object.create(_PdfBaseStream.prototype);
        defineValue(baseStream, 'dictionary', dictionary);
        defineValue(baseStream, 'length', length);
        baseStream.getString = jasmine.createSpy('getString').and.returnValue(data);
        return baseStream;
    }

    function safeCompressStreamSpy(returnValue: string): jasmine.Spy {
        const utilObject: any = utils as any;
        if (utilObject._compressStream && typeof utilObject._compressStream.calls !== 'undefined') {
            utilObject._compressStream.and.returnValue(returnValue);
            return utilObject._compressStream;
        }
        return spyOn<any>(utilObject, '_compressStream').and.returnValue(returnValue);
    }

    it('should trim trailing invalid characters in _parseJson()', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const document: any = { _crossReference: createCrossReference() };
        const bytes: Uint8Array = _stringToBytes('{"a":1}garbage') as Uint8Array;

        const result: any = (jsonDocument as any)._parseJson(document, bytes);

        expect(result).toBeDefined();
        expect(result.a).toBe(1);
    });


    it('should cover _writeTable() array push branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const array: Map<string, string>[] = [];

        (jsonDocument as any)._writeTable('string', 'value', null, null, array);

        expect(array.length).toBe(1);
        expect(array[0].get('string')).toBe('value');
    });

    it('should cover _writeObject() array ColorSpace branch and _writeArray() string color-space branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const table: Map<string, string> = new Map<string, string>();
        const dictionary: _PdfDictionary = new _PdfDictionary(createCrossReference());

        (jsonDocument as any)._writeObject(
            table,
            ['DeviceRGB', 0.1, 0.2, 0.3],
            dictionary,
            'ColorSpace'
        );

        const value: string = table.get('ColorSpace') as string;
        expect(value).toBeDefined();
        expect(value).toContain('"array"');
    });

    it('should cover _writeObject() boolean branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const table: Map<string, string> = new Map<string, string>();

        (jsonDocument as any)._writeObject(table, true, null, 'IsVisible');

        const value: string = table.get('IsVisible') as string;
        expect(value).toBeDefined();
        expect(value).toContain('"boolean":"true"');
    });

    it('should cover _writeObject() reference fetch branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const reference: _PdfReference = createReference(10, 0, false);
        defineValue(reference as any, '_target', false);

        (jsonDocument as any)._writeObject(table, reference, null, 'FetchedBoolean');

        expect(crossReference._fetch).toHaveBeenCalledWith(reference);
        const value: string = table.get('FetchedBoolean') as string;
        expect(value).toBeDefined();
        expect(value).toContain('"boolean":"false"');
    });

    it('should cover _writeObject() new image reference with DCTDecode branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Subtype', _PdfName.get('Image'));
        streamDictionary.update('Filter', _PdfName.get('DCTDecode'));

        const baseStream: any = createBaseStream(streamDictionary, 'FFD8', 4);

        (jsonDocument as any)._writeObject(table, baseStream, null, 'ImageDCT', null, false, true);

        const serialized: string = table.get('ImageDCT') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"stream"');
        expect(serialized).toContain('"mode":"raw"');
        expect(serialized).toContain('"encoding":"hex"');
    });

    it('should cover _writeObject() new image reference with _compressStream branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const compressSpy: jasmine.Spy = safeCompressStreamSpy('ABCD');

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Subtype', _PdfName.get('Image'));

        const baseStream: any = createBaseStream(streamDictionary, 'FFFF', 4);

        (jsonDocument as any)._writeObject(table, baseStream, null, 'ImageCompressed', null, false, true);

        expect(compressSpy).toHaveBeenCalled();
        const serialized: string = table.get('ImageCompressed') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"mode":"raw"');
    });

    it('should cover _writeObject() image stream branch with baseStream.stream as _PdfStream and cipher initialized', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Subtype', _PdfName.get('Image'));

        const pdfStream: any = createPdfStream(new Uint8Array([65, 66, 67, 68]));
        const baseStream: any = createBaseStream(streamDictionary, '46474849', 4);

        defineValue(baseStream, 'stream', pdfStream);
        defineValue(baseStream, '_initialized', true);
        defineValue(baseStream, '_cipher', {});
        defineValue(baseStream, 'buffer', new Uint8Array([70, 71, 72, 73]));
        defineValue(baseStream, 'bufferLength', 4);
        baseStream.getBytes = jasmine.createSpy('getBytes');

        (jsonDocument as any)._writeObject(table, baseStream, null, 'ImageCipher', null, false, false);

        expect(baseStream.getBytes).toHaveBeenCalled();
        const serialized: string = table.get('ImageCipher') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"mode":"raw"');
    });

    it('should cover _writeObject() image stream branch with baseStream.stream as _PdfStream without cipher', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Subtype', _PdfName.get('Image'));

        const pdfStream: any = createPdfStream(new Uint8Array([49, 50, 51, 52]));
        const baseStream: any = createBaseStream(streamDictionary, '31323334', 4);

        defineValue(baseStream, 'stream', pdfStream);

        (jsonDocument as any)._writeObject(table, baseStream, null, 'ImageStream', null, false, false);

        expect(pdfStream.getByteRange).toHaveBeenCalledWith(0, 4);
        const serialized: string = table.get('ImageStream') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"mode":"raw"');
    });

    it('should cover _writeObject() flateStream branch with cipher initialized', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Subtype', _PdfName.get('Image'));

        const pdfStream: any = createPdfStream(new Uint8Array([1, 2, 3, 4]));
        const flateStream: any = {
            stream: pdfStream,
            _initialized: true,
            _cipher: {},
            buffer: new Uint8Array([1, 2, 3, 4]),
            bufferLength: 4,
            getBytes: jasmine.createSpy('getBytes'),
            getString: jasmine.createSpy('getString').and.returnValue('01020304')
        };

        const baseStream: any = createBaseStream(streamDictionary, '01020304', 4);
        defineValue(baseStream, 'stream', flateStream);

        (jsonDocument as any)._writeObject(table, baseStream, null, 'FlateCipher', null, false, false);

        expect(flateStream.getBytes).toHaveBeenCalled();
        const serialized: string = table.get('FlateCipher') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"mode":"raw"');
    });

    it('should cover _writeObject() flateStream branch with plain _PdfStream', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Subtype', _PdfName.get('Image'));

        const pdfStream: any = createPdfStream(new Uint8Array([5, 6, 7, 8]));
        const flateStream: any = {
            stream: pdfStream,
            getString: jasmine.createSpy('getString').and.returnValue('05060708')
        };

        const baseStream: any = createBaseStream(streamDictionary, '05060708', 4);
        defineValue(baseStream, 'stream', flateStream);

        (jsonDocument as any)._writeObject(table, baseStream, null, 'FlatePlain', null, false, false);

        expect(pdfStream.getByteRange).toHaveBeenCalledWith(0, 4);
        const serialized: string = table.get('FlatePlain') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"mode":"raw"');
    });

    it('should cover _writeObject() image stream fallback getString(true) branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Subtype', _PdfName.get('Image'));

        const baseStream: any = createBaseStream(streamDictionary, 'CAFEBABE', 4);

        (jsonDocument as any)._writeObject(table, baseStream, null, 'ImageFallback', null, false, false);

        expect(baseStream.getString).toHaveBeenCalledWith(true);
        const serialized: string = table.get('ImageFallback') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"mode":"raw"');
    });

    it('should cover _writeObject() filtered/ascii branch for non-image stream types', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Type', _PdfName.get('XObject'));
        streamDictionary.update('Subtype', _PdfName.get('XML'));

        const baseStream: any = createBaseStream(streamDictionary, 'ABC', 3);

        (jsonDocument as any)._writeObject(table, baseStream, null, 'FilteredStream', null, false, false);

        const serialized: string = table.get('FilteredStream') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"mode":"filtered"');
        expect(serialized).toContain('"encoding":"ascii"');
    });

    it('should cover _importFormData() array branch when this._fields.has("key") is true', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        (jsonDocument as any)._fields = new Map<string, any[]>();
        (jsonDocument as any)._fields.set('key', []);
        spyOn(jsonDocument as any, '_parseJson').and.returnValue({
            key: ['A', 'B']
        });
        spyOn(jsonDocument as any, '_importField').and.stub();

        (jsonDocument as any)._importFormData({} as any, new Uint8Array(0));

        expect((jsonDocument as any)._fields.get('key')).toEqual(['A', 'B']);
        expect((jsonDocument as any)._importField).toHaveBeenCalled();
    });

    it('should cover _importFormData() array branch when this._fields.has("key") is false', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        (jsonDocument as any)._fields = new Map<string, any[]>();
        spyOn(jsonDocument as any, '_parseJson').and.returnValue({
            field1: ['X', 'Y']
        });
        spyOn(jsonDocument as any, '_importField').and.stub();

        (jsonDocument as any)._importFormData({} as any, new Uint8Array(0));

        expect((jsonDocument as any)._fields.get('field1')).toEqual(['X', 'Y']);
        expect((jsonDocument as any)._importField).toHaveBeenCalled();
    });

    it('should cover _importFormData() scalar branch when this._fields.has("key") is true', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        (jsonDocument as any)._fields = new Map<string, any[]>();
        (jsonDocument as any)._fields.set('key', ['old']);
        spyOn(jsonDocument as any, '_parseJson').and.returnValue({
            key: 'new'
        });
        spyOn(jsonDocument as any, '_importField').and.stub();

        (jsonDocument as any)._importFormData({} as any, new Uint8Array(0));

        expect((jsonDocument as any)._fields.get('key')).toEqual(['old', 'new']);
        expect((jsonDocument as any)._importField).toHaveBeenCalled();
    });

    it('should cover _importFormData() scalar branch when this._fields.has("key") is false', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        (jsonDocument as any)._fields = new Map<string, any[]>();
        spyOn(jsonDocument as any, '_parseJson').and.returnValue({
            field2: 'single'
        });
        spyOn(jsonDocument as any, '_importField').and.stub();

        (jsonDocument as any)._importFormData({} as any, new Uint8Array(0));

        expect((jsonDocument as any)._fields.get('field2')).toEqual(['single']);
        expect((jsonDocument as any)._importField).toHaveBeenCalled();
    });

    it('should cover _addAnnotationData() beginLineStyle only branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;
        (jsonDocument as any)._document = { _allowImportCustomData: false };

        const dictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        dictionary.update('Subtype', _PdfName.get('Line'));

        const annotation: any = {
            head: 'Diamond'
        };

        (jsonDocument as any)._addAnnotationData(dictionary, annotation, Object.keys(annotation));

        expect(dictionary.get('LE')).toBe('Diamond');
    });

    it('should cover _addAnnotationData() endLineStyle only branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;
        (jsonDocument as any)._document = { _allowImportCustomData: false };

        const dictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        dictionary.update('Subtype', _PdfName.get('Line'));

        const annotation: any = {
            tail: 'Slash'
        };

        (jsonDocument as any)._addAnnotationData(dictionary, annotation, Object.keys(annotation));

        expect(dictionary.get('LE')).toBe('Slash');
    });
   

});

describe('_JsonDocument highlighted branch coverage', () => {

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value,
            configurable: true,
            writable: true,
            enumerable: true
        });
    }

    function createReference(objectNumber: number, generationNumber: number = 0, isNew: boolean = false): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        defineValue(reference, 'objectNumber', objectNumber);
        defineValue(reference, 'generationNumber', generationNumber);
        defineValue(reference, '_isNew', isNew);
        return reference;
    }

    function createCrossReference(): any {
        let counter: number = 1;
        return {
            _cacheMap: new Map<any, any>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
                return createReference(counter++, 0, false);
            }),
            _fetch: jasmine.createSpy('_fetch')
        };
    }

    it('should cover _writeAttribute() LE branch when primitive is _PdfName', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        (jsonDocument as any)._table = new Map<string, string>();

        const dictionary: _PdfDictionary = new _PdfDictionary(createCrossReference());
        const primitive: _PdfName = _PdfName.get('ClosedArrow');

        (jsonDocument as any)._writeAttribute('LE', primitive, dictionary);

        expect((jsonDocument as any)._table.has('head')).toBe(true);
        expect((jsonDocument as any)._table.get('head')).toBe('ClosedArrow');
    });

    it('should cover _addFloatPoints() when value has items', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const dictionary: _PdfDictionary = new _PdfDictionary(createCrossReference());

        (jsonDocument as any)._addFloatPoints(dictionary, 'RD', [1, 2, 3, 4]);

        expect(dictionary.has('RD')).toBe(true);
        expect(dictionary.get('RD')).toEqual([1, 2, 3, 4]);
    });

    it('should cover _addAppearanceData() trim loop and update AP', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const dictionary: _PdfDictionary = new _PdfDictionary(crossReference);

        // Valid JSON followed by trailing junk so decoded string starts with '{' but does not end with '}'
        const malformedButRecoverable: string = '{"ap":{"N":{"name":"Yes"}}}TRAILING_TEXT';
        const encoded: string = _encode(_stringToBytes(malformedButRecoverable) as Uint8Array);

        (jsonDocument as any)._addAppearanceData(dictionary, encoded);

        expect(dictionary.has('AP')).toBe(true);

        const appearanceDictionary: _PdfDictionary = dictionary.get('AP');
        expect(appearanceDictionary).toBeDefined();
        expect(appearanceDictionary.has('N')).toBe(true);

        const normalAppearance: _PdfName = appearanceDictionary.get('N');
        expect(normalAppearance).toBeDefined();
        expect(normalAppearance.name).toBe('Yes');
    });

    it('should cover _parseAppearance() string branch when element.string is a plain string', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();

        const result: any = (jsonDocument as any)._parseAppearance({
            string: 'plain-text'
        });

        expect(result).toBe('plain-text');
    });

    it('should cover _parseAppearance() boolean branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();

        const resultTrue: any = (jsonDocument as any)._parseAppearance({
            boolean: 'true'
        });

        const resultFalse: any = (jsonDocument as any)._parseAppearance({
            boolean: 'false'
        });

        expect(resultTrue).toBe(true);
        expect(resultFalse).toBe(false);
    });

    it('should cover _parseAppearance() empty dict branch and return a new _PdfDictionary', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const result: any = (jsonDocument as any)._parseAppearance({
            dict: {}
        });

        expect(result instanceof _PdfDictionary).toBe(true);
        expect(result.size).toBe(0);
    });

    it('should cover _parseAppearance() unicodeData branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();

        // "Hello" in hex
        const result: any = (jsonDocument as any)._parseAppearance({
            unicodeData: '48656c6c6f'
        });

        expect(result).toBe('Hello');
    });

});


describe('_JsonDocument highlighted lines from 2 images', () => {

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value,
            configurable: true,
            writable: true,
            enumerable: true
        });
    }

    function createReference(objectNumber: number, generationNumber: number = 0, isNew: boolean = false): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        defineValue(reference, 'objectNumber', objectNumber);
        defineValue(reference, 'generationNumber', generationNumber);
        defineValue(reference, '_isNew', isNew);
        return reference;
    }

    function createCrossReference(): any {
        let counter: number = 1;
        return {
            _cacheMap: new Map<any, any>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
                return createReference(counter++, 0, false);
            }),
            _fetch: jasmine.createSpy('_fetch').and.callFake((reference: any): any => {
                return reference._target;
            })
        };
    }

    function createPageStub(): any {
        const crossReference: any = createCrossReference();
        const pageDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        const parsedAnnotation: any = { _isImported: false };
        const annotations: any = {
            _annotations: [],
            _comments: [{ text: 'existing comment' }],
            _parsedAnnotations: new Map<number, any>(),
            _parseAnnotation: jasmine.createSpy('_parseAnnotation').and.returnValue(parsedAnnotation),
            count: 0
        };
        return {
            _crossReference: crossReference,
            _pageDictionary: pageDictionary,
            annotations,
            parsedAnnotation
        };
    }

    it('should cover _writeObject() image stream inner fallback branch using value.getString(true)', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const table: Map<string, string> = new Map<string, string>();
        const streamDictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        streamDictionary.update('Subtype', _PdfName.get('Image'));

        const baseStream: any = Object.create(_PdfBaseStream.prototype);
        defineValue(baseStream, 'dictionary', streamDictionary);
        defineValue(baseStream, 'stream', {}); // truthy, but not _PdfStream and no .stream property
        defineValue(baseStream, 'length', 4);
        baseStream.getString = jasmine.createSpy('getString').and.returnValue('ABCD');

        (jsonDocument as any)._writeObject(table, baseStream, null, 'ImageFallbackFromInnerElse', null, false, false);

        expect(baseStream.getString).toHaveBeenCalledWith(true);

        const serialized: string = table.get('ImageFallbackFromInnerElse') as string;
        expect(serialized).toBeDefined();
        expect(serialized).toContain('"stream"');
        expect(serialized).toContain('"mode":"raw"');
    });

    it('should cover _writeTable() array push branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const array: Map<string, string>[] = [];

        (jsonDocument as any)._writeTable('string', 'value', null, null, array);

        expect(array.length).toBe(1);
        expect(array[0].get('string')).toBe('value');
    });

    it('should cover _writeArray() ColorSpace string branch and set _isColorSpace to true', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const destination: Map<string, string>[] = [];
        const dictionary: _PdfDictionary = new _PdfDictionary(createCrossReference());

        spyOn(jsonDocument as any, '_writeObject').and.stub();

        (jsonDocument as any)._writeArray(destination, ['DeviceRGB', 0.2, 0.4, 0.8], dictionary, true);

        expect((jsonDocument as any)._isColorSpace).toBe(true);
        expect((jsonDocument as any)._writeObject).toHaveBeenCalled();
    });

    it('should cover _convertToJson() leading-space trim branch', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const table: Map<string, string> = new Map<string, string>();

        table.set('dictEntry', ' {"x":"10"}');
        table.set('arrayEntry', ' [1,2,3]');

        const result: string = (jsonDocument as any)._convertToJson(table);

        // This branch trims the leading space, but still keeps the value inside quotes
        expect(result).toContain('"dictEntry":"{"x":"10"}"');
        expect(result).toContain('"arrayEntry":"[1,2,3]"');
    });

    it('should cover _importAnnotations() comments reset branch', () => {
        const pageStub: any = createPageStub();
        const document: any = {
            _crossReference: pageStub._crossReference,
            _allowImportCustomData: false,
            pageCount: 1,
            getPage: jasmine.createSpy('getPage').and.returnValue(pageStub)
        };

        const jsonDocument: _JsonDocument = new _JsonDocument();
        (jsonDocument as any)._document = document;
        (jsonDocument as any)._crossReference = document._crossReference;
        (jsonDocument as any)._groupHolders = [];
        (jsonDocument as any)._groupReferences = new Map<string, _PdfReference>();

        spyOn(jsonDocument as any, '_parseJson').and.returnValue({
            pdfAnnotation: {
                '0': {
                    shapeAnnotation: [
                        {
                            type: 'line',
                            start: '0,0',
                            end: '100,100',
                            head: 'None',
                            tail: 'OpenArrow'
                        }
                    ]
                }
            }
        });

        spyOn(jsonDocument as any, '_handlePopup').and.stub();
        spyOn(jsonDocument as any, '_addReferenceToGroup').and.stub();

        (jsonDocument as any)._importAnnotations(document, new Uint8Array(0));

        expect(pageStub.annotations._parseAnnotation).toHaveBeenCalled();
        expect(pageStub.parsedAnnotation._isImported).toBe(true);
        expect(pageStub.annotations._annotations.length).toBe(1);
        expect(pageStub.annotations._comments.length).toBe(0);
        expect(pageStub._pageDictionary.get('Annots')).toBe(pageStub.annotations._annotations);
        expect(pageStub._pageDictionary._updated).toBe(true);
        expect(pageStub.annotations._parsedAnnotations.get(0)).toBe(pageStub.parsedAnnotation);
        expect((jsonDocument as any)._handlePopup).toHaveBeenCalled();
    });

});
describe('_JsonDocument remaining highlighted measure dictionary branches', () => {

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value,
            configurable: true,
            writable: true,
            enumerable: true
        });
    }

    function createReference(objectNumber: number, generationNumber: number = 0, isNew: boolean = false): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        defineValue(reference, 'objectNumber', objectNumber);
        defineValue(reference, 'generationNumber', generationNumber);
        defineValue(reference, '_isNew', isNew);
        return reference;
    }

    function createCrossReference(): any {
        let counter: number = 1;
        return {
            _cacheMap: new Map<any, any>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
                return createReference(counter++, 0, false);
            }),
            _fetch: jasmine.createSpy('_fetch')
        };
    }

    it('should cover _addFloatPoints() when value length is greater than zero', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const dictionary: _PdfDictionary = new _PdfDictionary(createCrossReference());

        (jsonDocument as any)._addFloatPoints(dictionary, 'RD', [10, 20, 30, 40]);

        expect(dictionary.has('RD')).toBe(true);
        expect(dictionary.get('RD')).toEqual([10, 20, 30, 40]);
    });


});


describe('_JsonDocument _addMeasureDictionary exact highlighted lines', () => {

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value,
            configurable: true,
            writable: true,
            enumerable: true
        });
    }

    function createReference(objectNumber: number, generationNumber: number = 0, isNew: boolean = false): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        defineValue(reference, 'objectNumber', objectNumber);
        defineValue(reference, 'generationNumber', generationNumber);
        defineValue(reference, '_isNew', isNew);
        return reference;
    }

    function createCrossReference(): any {
        let counter: number = 1;
        return {
            _cacheMap: new Map<any, any>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
                return createReference(counter++, 0, false);
            }),
            _fetch: jasmine.createSpy('_fetch')
        };
    }

    it('should cover subtype line in _addMeasureDictionary()', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const annotationDictionary: any = {
            update: jasmine.createSpy('update')
        };

        const addStringSpy: jasmine.Spy = spyOn<any>(jsonDocument, '_addString').and.callFake(
            (dictionary: _PdfDictionary, key: string, value: string): void => {
                dictionary.set(key, value);
            }
        );

        const annotation: any = {
            type1: 'Measure',
            subtype: 'RL'
        };
        const annotationKeys: string[] = ['type1', 'subtype'];

        (jsonDocument as any)._addMeasureDictionary(annotationDictionary, annotation, annotationKeys);

        expect(addStringSpy).toHaveBeenCalledWith(jasmine.any(_PdfDictionary), 'Subtype', 'RL');
        expect(annotationDictionary.update).toHaveBeenCalled();

        const cachedValues: any[] = Array.from(crossReference._cacheMap.values());
        expect(cachedValues.length).toBe(1);

        const measureDictionary: any = cachedValues[0];
        expect(measureDictionary).toBeDefined();
        expect(measureDictionary._map.Subtype).toBe('RL');
    });

    it('should cover targetunitconversion line in _addMeasureDictionary()', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const annotationDictionary: any = {
            update: jasmine.createSpy('update')
        };

        const addStringSpy: jasmine.Spy = spyOn<any>(jsonDocument, '_addString').and.callFake(
            (dictionary: _PdfDictionary, key: string, value: string): void => {
                dictionary.set(key, value);
            }
        );

        const annotation: any = {
            type1: 'Measure',
            targetunitconversion: '0.25'
        };
        const annotationKeys: string[] = ['type1', 'targetunitconversion'];

        (jsonDocument as any)._addMeasureDictionary(annotationDictionary, annotation, annotationKeys);

        expect(addStringSpy).toHaveBeenCalledWith(
            jasmine.any(_PdfDictionary),
            'TargetUnitConversion',
            '0.25'
        );
        expect(annotationDictionary.update).toHaveBeenCalled();

        const cachedValues: any[] = Array.from(crossReference._cacheMap.values());
        expect(cachedValues.length).toBe(1);

        const measureDictionary: any = cachedValues[0];
        expect(measureDictionary).toBeDefined();
        expect(measureDictionary._map.TargetUnitConversion).toBe('0.25');
    });

    it('should cover tformat line in _addMeasureDictionary()', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const annotationDictionary: any = {
            update: jasmine.createSpy('update')
        };

        const readDictionaryElementsSpy: jasmine.Spy = spyOn<any>(jsonDocument, '_readDictionaryElements').and.callThrough();

        const tformatValue: any = {
            c: '1',
            d: '2',
            f: 'F',
            rd: 'roundT',
            u: 'cm'
        };

        const annotation: any = {
            type1: 'Measure',
            tformat: tformatValue
        };
        const annotationKeys: string[] = ['type1', 'tformat'];

        (jsonDocument as any)._addMeasureDictionary(annotationDictionary, annotation, annotationKeys);

        expect(readDictionaryElementsSpy).toHaveBeenCalledWith(tformatValue);
        expect(annotationDictionary.update).toHaveBeenCalled();

        const cachedValues: any[] = Array.from(crossReference._cacheMap.values());
        expect(cachedValues.length).toBe(1);

        const measureDictionary: any = cachedValues[0];
        expect(measureDictionary).toBeDefined();

        const tArray: any[] = measureDictionary._map.T;
        expect(Array.isArray(tArray)).toBe(true);
        expect(tArray.length).toBe(1);
        expect(tArray[0] instanceof _PdfDictionary).toBe(true);
        expect(tArray[0]._map.C).toBe(1);
        expect(tArray[0]._map.D).toBe(2);
        expect((tArray[0]._map.F as _PdfName).name).toBe('F');
        expect(tArray[0]._map.RD).toBe('roundT');
        expect(tArray[0]._map.U).toBe('cm');
    });

    it('should cover vformat line in _addMeasureDictionary()', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();
        (jsonDocument as any)._crossReference = crossReference;

        const annotationDictionary: any = {
            update: jasmine.createSpy('update')
        };

        const readDictionaryElementsSpy: jasmine.Spy = spyOn<any>(jsonDocument, '_readDictionaryElements').and.callThrough();

        const vformatValue: any = {
            c: '3',
            d: '4',
            f: 'F',
            rd: 'roundV',
            u: 'mm'
        };

        const annotation: any = {
            type1: 'Measure',
            vformat: vformatValue
        };
        const annotationKeys: string[] = ['type1', 'vformat'];

        (jsonDocument as any)._addMeasureDictionary(annotationDictionary, annotation, annotationKeys);

        expect(readDictionaryElementsSpy).toHaveBeenCalledWith(vformatValue);
        expect(annotationDictionary.update).toHaveBeenCalled();

        const cachedValues: any[] = Array.from(crossReference._cacheMap.values());
        expect(cachedValues.length).toBe(1);

        const measureDictionary: any = cachedValues[0];
        expect(measureDictionary).toBeDefined();

        const vArray: any[] = measureDictionary._map.V;
        expect(Array.isArray(vArray)).toBe(true);
        expect(vArray.length).toBe(1);
        expect(vArray[0] instanceof _PdfDictionary).toBe(true);
        expect(vArray[0]._map.C).toBe(3);
        expect(vArray[0]._map.D).toBe(4);
        expect((vArray[0]._map.F as _PdfName).name).toBe('F');
        expect(vArray[0]._map.RD).toBe('roundV');
        expect(vArray[0]._map.U).toBe('mm');
    });

});

describe('_JsonDocument _importAnnotations highlighted group holder lines', () => {

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value,
            configurable: true,
            writable: true,
            enumerable: true
        });
    }

    function createReference(objectNumber: number, generationNumber: number = 0, isNew: boolean = false): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        defineValue(reference, 'objectNumber', objectNumber);
        defineValue(reference, 'generationNumber', generationNumber);
        defineValue(reference, '_isNew', isNew);
        return reference;
    }

    function createCrossReference(): any {
        let counter: number = 1;
        return {
            _cacheMap: new Map<any, any>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
                return createReference(counter++, 0, false);
            }),
            _fetch: jasmine.createSpy('_fetch')
        };
    }

    it('should cover group holder update and delete branches in _importAnnotations()', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();

        const crossReference: any = createCrossReference();
        const document: any = {
            _crossReference: crossReference,
            _allowImportCustomData: false,
            pageCount: 0,
            getPage: jasmine.createSpy('getPage')
        };

        (jsonDocument as any)._document = document;
        (jsonDocument as any)._crossReference = crossReference;

        const holderWithMatch: any = {
            _map: { IRT: 'reply-1' },
            get: jasmine.createSpy('get').and.callFake((key: string): any => {
                return holderWithMatch._map[key];
            }),
            update: jasmine.createSpy('update').and.callFake((key: string, value: any): void => {
                holderWithMatch._map[key] = value;
            })
        };

        const holderWithoutMatch: any = {
            _map: { IRT: 'reply-2' },
            get: jasmine.createSpy('get').and.callFake((key: string): any => {
                return holderWithoutMatch._map[key];
            }),
            update: jasmine.createSpy('update')
        };

        const holderWithEmptyValue: any = {
            _map: { IRT: '' },
            get: jasmine.createSpy('get').and.callFake((key: string): any => {
                return holderWithEmptyValue._map[key];
            }),
            update: jasmine.createSpy('update')
        };

        const matchedReference: _PdfReference = createReference(99, 0, false);

        (jsonDocument as any)._groupHolders = [
            holderWithMatch,
            holderWithoutMatch,
            holderWithEmptyValue
        ];

        (jsonDocument as any)._groupReferences = new Map<string, _PdfReference>([
            ['reply-1', matchedReference]
        ]);

        spyOn(jsonDocument as any, '_parseJson').and.returnValue({
            pdfAnnotation: {}
        });

        (jsonDocument as any)._importAnnotations(document, new Uint8Array(0));

        // match branch
        expect(holderWithMatch.get).toHaveBeenCalledWith('IRT');
        expect(holderWithMatch.update).toHaveBeenCalledWith('IRT', matchedReference);
        expect(holderWithMatch._map.IRT).toBe(matchedReference);

        // delete branch
        expect(holderWithoutMatch.get).toHaveBeenCalledWith('IRT');
        expect(holderWithoutMatch._map.IRT).toBeUndefined();

        // empty guard branch
        expect(holderWithEmptyValue.get).toHaveBeenCalledWith('IRT');
        expect(holderWithEmptyValue._map.IRT).toBe('');

        // cleanup
        expect((jsonDocument as any)._groupHolders.length).toBe(0);
        expect((jsonDocument as any)._groupReferences.size).toBe(0);
    });

});

describe('_JsonDocument _addAnnotationData color array highlighted line', () => {

    function defineValue(target: any, key: string, value: any): void {
        Object.defineProperty(target, key, {
            value,
            configurable: true,
            writable: true,
            enumerable: true
        });
    }

    function createReference(objectNumber: number, generationNumber: number = 0, isNew: boolean = false): _PdfReference {
        const reference: _PdfReference = Object.create(_PdfReference.prototype) as _PdfReference;
        defineValue(reference, 'objectNumber', objectNumber);
        defineValue(reference, 'generationNumber', generationNumber);
        defineValue(reference, '_isNew', isNew);
        return reference;
    }

    function createCrossReference(): any {
        let counter: number = 1;
        return {
            _cacheMap: new Map<any, any>(),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake((): _PdfReference => {
                return createReference(counter++, 0, false);
            }),
            _fetch: jasmine.createSpy('_fetch')
        };
    }

    it('should cover the color array branch and update C with normalized RGB values', () => {
        const jsonDocument: _JsonDocument = new _JsonDocument();
        const crossReference: any = createCrossReference();

        // keep instance state safe
        (jsonDocument as any)._crossReference = crossReference;
        (jsonDocument as any)._document = { _allowImportCustomData: false };

        const dictionary: _PdfDictionary = new _PdfDictionary(crossReference);
        dictionary.set('Subtype', _PdfName.get('Square'));

        // stabilize update() so written values definitely persist in test
        spyOn(dictionary as any, 'update').and.callFake((key: string, value: any): void => {
            dictionary.set(key, value);
        });

        // isolate this exact highlighted branch
        spyOn(utils as any, '_convertToColor').and.returnValue([255, 128, 64]);

        // avoid unrelated side effects from the tail of _addAnnotationData()
        spyOn(jsonDocument as any, '_addMeasureDictionary').and.stub();
        spyOn(jsonDocument as any, '_addStreamData').and.stub();

        const annotation: any = {
            color: '#ff8040'
        };
        const annotationKeys: string[] = ['color'];

        (jsonDocument as any)._addAnnotationData(dictionary, annotation, annotationKeys);

        expect((utils as any)._convertToColor).toHaveBeenCalledWith('#ff8040');
        expect((dictionary as any).update).toHaveBeenCalledWith('C', [1, 128 / 255, 64 / 255]);

        // optional final state assertion
        expect(dictionary.get('C')).toEqual([1, 128 / 255, 64 / 255]);
    });

});
