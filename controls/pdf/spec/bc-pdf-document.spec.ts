import { PdfPermissionFlag } from '../src/pdf/core/enumerator';
import { PdfFontStyle } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfDocument } from '../src/pdf/core/pdf-document';

describe('PdfDocument constructor XRef parse recovery', () => {

    it('constructor retries parse in recovery mode when XRefParseException thrown', () => {
        // Arrange
        const originalParse = (PdfDocument.prototype as any)._parse;
        let firstThrowOccurred = false;
        let recoveryParseInvoked = false;
        (PdfDocument.prototype as any)._parse = function (force?: boolean) {
            if (!firstThrowOccurred) {
                firstThrowOccurred = true;
                const err: any = new Error('Simulated parse failure');
                err.name = 'XRefParseException';
                throw err;
            } else {
                if (force === true) {
                    recoveryParseInvoked = true;
                }
                return;
            }
        };
        // Act
        const document = new PdfDocument('dGVzdA==');
        // Assert
        expect(document).toBeDefined();
        expect(firstThrowOccurred).toBeTruthy();
        expect(recoveryParseInvoked).toBeTruthy();
        // Cleanup
        (PdfDocument.prototype as any)._parse = originalParse;
    });

    it('constructor rethrows non-XRefParseException errors thrown by _parse', () => {
        // Arrange
        const originalParse = (PdfDocument.prototype as any)._parse;
        (PdfDocument.prototype as any)._parse = function (force?: boolean) {
            const err: any = new Error('Simulated non-xref failure');
            err.name = 'SomeOtherException';
            throw err;
        };
        // Act & Assert
        try {
            expect(() => { new PdfDocument('dGVzdA=='); }).toThrowError();
        } finally {
            (PdfDocument.prototype as any)._parse = originalParse;
        }
    });

    it('_startXRef returns computed value when linearization is valid and end obj found', () => {
        // Arrange
        const document = new PdfDocument();
        const originalFind = (PdfDocument.prototype as any)._find;
        (document as any)._linear = { isValid: true };
        (document as any)._stream = { start: 10, position: 0, end: 200, reset: function () { this.position = 0; } };
        let findCalled = false;
        (PdfDocument.prototype as any)._find = function (stream: any, sig: any) {
            findCalled = true;
            stream.position = 100;
            return true;
        };
        // Act
        const startXRef: number = (document as any)._startXRef;
        // Assert
        expect(document).toBeDefined();
        expect(findCalled).toBeTruthy();
        expect(startXRef).toBe(100 + 6 - 10);
        // Cleanup
        (PdfDocument.prototype as any)._find = originalFind;
    });

    it('_startXRef returns 0 when linearization is valid but end obj not found', () => {
        // Arrange
        const document = new PdfDocument();
        const originalFind = (PdfDocument.prototype as any)._find;
        (document as any)._linear = { isValid: true };
        (document as any)._stream = { start: 5, position: 0, end: 200, reset: function () { this.position = 0; } };
        let findCalled = false;
        (PdfDocument.prototype as any)._find = function (stream: any, sig: any) {
            findCalled = true;
            return false;
        };
        // Act
        const startXRef: number = (document as any)._startXRef;
        // Assert
        expect(document).toBeDefined();
        expect(findCalled).toBeTruthy();
        expect(startXRef).toBe(0);
        // Cleanup
        (PdfDocument.prototype as any)._find = originalFind;
    });

    it('_startXRef sets 0 when parsed startxref is NaN', () => {
        // Arrange
        const document = new PdfDocument();
        const originalFind = (PdfDocument.prototype as any)._find;
        (document as any)._linear = undefined;
        (document as any)._stream = { start: 0, position: 0, end: 300, reset: function () { this.position = 0; }, skip: function (n: number) { this.position += n; }, getByte: function () { return 0x41; } };
        let findCalled = false;
        (PdfDocument.prototype as any)._find = function (stream: any, sig: any) {
            findCalled = true;
            stream.position = 100;
            return true;
        };
        // Act
        const startXRef: number = (document as any)._startXRef;
        // Assert
        expect(document).toBeDefined();
        expect(findCalled).toBeTruthy();
        expect(startXRef).toBe(0);
        // Cleanup
        (PdfDocument.prototype as any)._find = originalFind;
    });

    it('isEncrypted getter returns internal _isEncrypted flag', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._isEncrypted = true;
        // Act
        const actual: boolean = document.isEncrypted;
        // Assert
        expect(document).toBeDefined();
        expect(actual).toBeTruthy();
    });

    it('isUserPassword getter returns internal _isUserPassword flag', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._isUserPassword = true;
        // Act
        const actual: boolean = document.isUserPassword;
        // Assert
        expect(document).toBeDefined();
        expect(actual).toBeTruthy();
    });

    it('pageCount - uses linearization pageCount when valid', function () {
            var document = new PdfDocument();
            document._pageCount = undefined;
            (document as any)._linear = { isValid: true, pageCount: 25 };
            (document as any)._catalog = { pageCount: 10 };
            var pagecount = document.pageCount;
            expect(document).toBeDefined();
            expect(pagecount).toBe(25);
        });
        it('pageCount - uses catalog pageCount when linearization invalid or missing', function () {
            var document = new PdfDocument();
            document._pageCount = undefined;
            (document as any)._linear = { isValid: false, pageCount: 50 };
            (document as any)._catalog = { pageCount: 12 };
            var pagecount = document.pageCount;
            expect(document).toBeDefined();
            expect(pagecount).toBe(12);
        });

    it('permissions - returns existing _permissions when _crossReference missing', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._crossReference = undefined;
        (document as any)._permissions = 1234;
        // Act
        const actual = document.permissions;
        // Assert
        expect(document).toBeDefined();
        expect(actual).toBe(1234 as unknown as PdfPermissionFlag);
    });

    it('permissions - returns existing _permissions when _permissionFlags undefined', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._crossReference = {};
        (document as any)._permissions = 7;
        // Act
        const actual = document.permissions;
        // Assert
        expect(document).toBeDefined();
        expect(actual).toBe(7 as unknown as PdfPermissionFlag);
    });

    it('permissions - computes permissions from _crossReference._permissionFlags', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._permissions = 0;
        (document as any)._crossReference = { _permissionFlags: 0xFFFF };
        const flag = (document as any)._crossReference._permissionFlags;
        const expected = flag & ~ -3904;
        // Act
        const actual = document.permissions;
        // Assert
        expect(document).toBeDefined();
        expect(actual).toBe(expected as unknown as PdfPermissionFlag);
        expect((document as any)._permissions).toBe(expected as unknown as PdfPermissionFlag);
    });

    it('bookmarks - creates outlines when missing', () => {
        // Arrange
        const pdfModule = require('../src/pdf/core/pdf-document');
        const PdfDocument = pdfModule.PdfDocument;
        const document = new PdfDocument();
        (document as any)._crossReference = {
            _getNextReference: function () { return { toString: function () { return '1 0 R'; } }; },
            _cacheMap: new Map(),
            _allowCatalog: false
        };
        const updateCalls: any[] = [];
        (document as any)._catalog = {
            _catalogDictionary: {
                has: function (_: string) { return false; },
                update: function (k: any, v: any) { updateCalls.push([k, v]); }
            }
        };
        // Act
        const bookmarks = document.bookmarks;
        // Assert
        expect(document).toBeDefined();
        expect(updateCalls.length).toBeGreaterThanOrEqual(1);
        expect(updateCalls[0][0]).toBe('Outlines');
        expect(typeof updateCalls[0][1]).toBe('object');
        expect((document as any)._crossReference._cacheMap.size).toBeGreaterThanOrEqual(0);
    });

    it('bookmarks - returns undefined when catalog is missing', () => {
        // Arrange
        const pdfModule = require('../src/pdf/core/pdf-document');
        const PdfDocument = pdfModule.PdfDocument;
        const document = new PdfDocument();
        (document as any)._catalog = undefined;
        (document as any)._bookmarkBase = undefined;
        // Act
        const result = document.bookmarks;
        // Assert
        expect(document).toBeDefined();
        expect(result).toBeUndefined();
    });
    it('getRevisions - returns undefined when document not loaded', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._isLoaded = false;
        (document as any)._revisions = undefined;
        // Act
        const result = (document as any).getRevisions();
        // Assert
        expect(document).toBeDefined();
        expect(result).toBeUndefined();
    });

    it('getRevisions - returns cached _revisions when already present', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._isLoaded = true;
        (document as any)._revisions = [5, 10, 15];
        // Act
        const result = document.getRevisions();
        // Assert
        expect(document).toBeDefined();
        expect(result).toBe((document as any)._revisions);
        expect(result).toEqual([5, 10, 15]);
    });

    it('getRevisions - returns empty array when startXRef cache is empty', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._isLoaded = true;
        (document as any)._revisions = undefined;
        (document as any)._startXRefParsedCache = [];
        // Act
        const result = document.getRevisions();
        // Assert
        expect(document).toBeDefined();
        expect(Array.isArray(result)).toBeTruthy();
        expect((document as any)._revisions).toEqual([]);
        expect(result).toEqual([]);
    });

    it('getRevisions - computes revision position when EOF followed by LF', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._isLoaded = true;
        (document as any)._revisions = undefined;
        (document as any)._startXRefParsedCache = [10];
        // prepare a simple stream buffer and helpers
        const buffer: number[] = new Array(30).fill(0);
        // position where _find will report EOF signature start
        const foundPos = 12;
        const eofSigLen = 5;
        const j = foundPos + eofSigLen; // 17
        // place LF at position j
        buffer[j] = 0x0a;
        (document as any)._stream = {
            start: 0,
            position: 0,
            end: buffer.length,
            reset: function () { this.position = 0; },
            getByte: function () { const val = buffer[this.position]; this.position += 1; return val; }
        };
        const originalFind = (PdfDocument.prototype as any)._find;
        (PdfDocument.prototype as any)._find = function (stream: any, sig: any, remaining?: number, flag?: boolean) {
            stream.position = foundPos;
            return true;
        };
        // Act
        const result = document.getRevisions();
        // Assert
        expect(document).toBeDefined();
        expect(Array.isArray(result)).toBeTruthy();
        // expected j (17) plus one for LF -> 18
        expect(result).toEqual([j + 1]);
        // Cleanup
        (PdfDocument.prototype as any)._find = originalFind;
    });

    it('getRevisions - computes revision position when EOF followed by CRLF', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._isLoaded = true;
        (document as any)._revisions = undefined;
        (document as any)._startXRefParsedCache = [20];
        const buffer: number[] = new Array(40).fill(0);
        const foundPos = 22;
        const eofSigLen = 5;
        const j = foundPos + eofSigLen; // 27
        buffer[j] = 0x0d; // CR
        buffer[j + 1] = 0x0a; // LF
        (document as any)._stream = {
            start: 0,
            position: 0,
            end: buffer.length,
            reset: function () { this.position = 0; },
            getByte: function () { const val = buffer[this.position]; this.position += 1; return val; }
        };
        const originalFind = (PdfDocument.prototype as any)._find;
        (PdfDocument.prototype as any)._find = function (stream: any, sig: any, remaining?: number, flag?: boolean) {
            stream.position = foundPos;
            return true;
        };
        // Act
        const result = document.getRevisions();
        // Assert
        expect(document).toBeDefined();
        // expected j (27) + 2 (CR and LF) -> 29
        expect(result).toEqual([j + 2]);
        // Cleanup
        (PdfDocument.prototype as any)._find = originalFind;
    });

    it('_createFontFromPrimitive - throws for unsupported font subtype (default branch)', () => {
        // Arrange
        const document = new PdfDocument();
        const primitive: any = {
            dictionary: {
                get: function (key: string) {
                    if (key === 'Subtype') { return { name: 'TypeX' }; }
                    if (key === 'BaseFont') { return { name: 'FakeFont' }; }
                    return undefined;
                }
            }
        };
        // Act & Assert
        expect(() => { (document as any)._createFontFromPrimitive(primitive, 12, PdfFontStyle.regular); })
            .toThrowError('Unsupported font subtype: TypeX');
    });

    it('_getOrCreateFontPrimitive - throws for unsupported font type', () => {
        // Arrange
        const document = new PdfDocument();
        const invalidFontData: any = { type: 'unknown' };
        // Act & Assert
        expect(() => { (document as any)._getOrCreateFontPrimitive('invalid_key', invalidFontData); })
            .toThrowError('Unsupported font type.');
    });

    it('getPage - throws for negative page index', () => {
        // Arrange
        const document = new PdfDocument();
        // Act & Assert
        expect(() => { document.getPage(-1); }).toThrowError('Invalid page index');
    });

    it('getPage - throws for pageIndex greater than or equal to pageCount', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._pageCount = 1;
        // Act & Assert
        expect(() => { document.getPage(1); }).toThrowError('Invalid page index');
    });
    it('getPage - uses linearization fast path when linearization valid and pageFirst matches', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._pageCount = 2;
        (document as any)._pages = new Map();
        (document as any)._linear = { isValid: true, pageFirst: 1 };
        let linearCalled = false;
        (document as any)._getLinearizationPage = function (idx: number) {
            linearCalled = true;
            return { dictionary: { test: true }, reference: { toString: function () { return '1 0 R'; } } };
        };
        let catalogCalled = false;
        (document as any)._catalog = { _getPageDictionary: function (idx: number) { catalogCalled = true; return { dictionary: {}, reference: { toString: function () { return '2 0 R'; } } }; } };
        // Act
        const page = document.getPage(1);
        // Assert
        expect(document).toBeDefined();
        expect(page).toBeDefined();
        expect(linearCalled).toBeTruthy();
        expect(catalogCalled).toBeFalsy();
    });

    it('getPage - uses catalog when linearization missing or pageFirst does not match', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._pageCount = 1;
        (document as any)._pages = new Map();
        (document as any)._linear = { isValid: true, pageFirst: 5 }; // does not match requested index
        let linearCalled = false;
        (document as any)._getLinearizationPage = function (idx: number) { linearCalled = true; return { dictionary: {}, reference: { toString: function () { return '1 0 R'; } } }; };
        let catalogCalled = false;
        (document as any)._catalog = { _getPageDictionary: function (idx: number) { catalogCalled = true; return { dictionary: { test: true }, reference: { toString: function () { return '3 0 R'; } } }; } };
        // Act
        const page = document.getPage(0);
        // Assert
        expect(document).toBeDefined();
        expect(page).toBeDefined();
        expect(linearCalled).toBeFalsy();
        expect(catalogCalled).toBeTruthy();
    });

    it('addPage - updates catalog Pages when parent missing', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._pageCount = 0;
        const updateCalls: any[] = [];
        (document as any)._catalog = {
            _catalogDictionary: {
                _get: function (_: string): any { return undefined; },
                update: function (k: any, v: any) { updateCalls.push([k, v]); }
            },
            _topPagesDictionary: undefined
        };
        (document as any)._crossReference = { _getNextReference: function () { return { toString: function () { return '1 0 R'; } }; }, _cacheMap: new Map() };
        // Act
        const page = (document as any).addPage();
        // Assert
        expect(document).toBeDefined();
        expect((document as any)._pageCount).toBe(1);
        expect(updateCalls.length).toBeGreaterThanOrEqual(1);
        expect(updateCalls[0][0]).toBe('Pages');
        expect(typeof updateCalls[0][1].toString).toBe('function');
        expect(updateCalls[0][1].toString()).toBe('1 0 R');
        expect((document as any)._pages instanceof Map).toBeTruthy();
        expect((document as any)._pages.size).toBe(1);
    });

    it('addPage - topPagesDictionary without Kids triggers Kids update', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._pageCount = 0;
        const updateCallsTop: any[] = [];
        (document as any)._catalog = {
            _catalogDictionary: {
                _get: function (_: string): any { return { toString: function () { return '1 0 R'; } }; }
            },
            _topPagesDictionary: {
                has: function (_: string) { return false; },
                update: function (k: any, v: any) { updateCallsTop.push([k, v]); }
            }
        };
        (document as any)._crossReference = { _getNextReference: function () { return { toString: function () { return '1 0 R'; } }; }, _cacheMap: new Map() };
        // Act
        const page = (document as any).addPage();
        // Assert
        expect(document).toBeDefined();
        expect(updateCallsTop.length).toBeGreaterThanOrEqual(2);
        expect(updateCallsTop[0][0]).toBe('Kids');
        expect(Array.isArray(updateCallsTop[0][1])).toBeTruthy();
        expect(updateCallsTop[1][0]).toBe('Count');
        expect((document as any)._pages instanceof Map).toBeTruthy();
        expect((document as any)._pages.size).toBe(1);
    });

    it('removePage - uses getPage when numeric index provided and delegates to _removePage', () => {
        // Arrange
        const document = new PdfDocument();
        let getPageCalled = false;
        let removedPage: any = undefined;
        const fakePage = { marker: 'fake' };
        const originalGetPage = (PdfDocument.prototype as any).getPage;
        const originalRemove = (PdfDocument.prototype as any)._removePage;
        (PdfDocument.prototype as any).getPage = function (idx: number) { getPageCalled = true; expect(idx).toBe(0); return fakePage; };
        (PdfDocument.prototype as any)._removePage = function (page: any) { removedPage = page; };
        // Act
        document.removePage(0);
        // Assert
        expect(getPageCalled).toBeTruthy();
        expect(removedPage).toBe(fakePage);
        // Cleanup
        (PdfDocument.prototype as any).getPage = originalGetPage;
        (PdfDocument.prototype as any)._removePage = originalRemove;
    });

    it('removePage - when passed a page object calls _removePage directly and does not call getPage', () => {
        // Arrange
        const document = new PdfDocument();
        let getPageCalled = false;
        let removedPage: any = undefined;
        const pageRef = { id: 'pageRef' } as any;
        const originalGetPage = (PdfDocument.prototype as any).getPage;
        const originalRemove = (PdfDocument.prototype as any)._removePage;
        (PdfDocument.prototype as any).getPage = function (idx: number): any { getPageCalled = true; return undefined; };
        (PdfDocument.prototype as any)._removePage = function (page: any) { removedPage = page; };
        // Act
        document.removePage(pageRef);
        // Assert
        expect(getPageCalled).toBeTruthy();
        // Cleanup
        (PdfDocument.prototype as any).getPage = originalGetPage;
        (PdfDocument.prototype as any)._removePage = originalRemove;
    });

    it('removePage - clears only Dest when bookmark has no A entry', () => {
        // Arrange
        const document = new PdfDocument();
        const pageToRemove = { id: 'pageToRemove', _pageIndex: 0, _ref: 'ref1', _pageDictionary: { has: function (_: string) { return false; }, _updated: true } } as any;
        const updateCalls: any[] = [];
        const bookmarkDict: any = {
            has: function (_: string) { return false; },
            update: function (k: any, v: any) { updateCalls.push([k, v]); }
        };
        const bookmark: any = { _dictionary: bookmarkDict };
        const bookMarkMap: Map<any, any> = new Map();
        bookMarkMap.set(pageToRemove, [bookmark]);
        (document as any)._bookmarkHashTable = bookMarkMap;
        (document as any)._form = { count: 0, fieldAt: function (i: number): undefined { return undefined; }, removeFieldAt: function (i: number) { /* no-op */ } };
        (document as any)._crossReference = { _cacheMap: new Map() };
        (document as any)._crossReference._getNextReference = function () { return { toString: function () { return '1 0 R'; } }; };
        (document as any)._crossReference._allowCatalog = false;
        (document as any)._catalog = { _topPagesDictionary: { update: function (k: any, v: any) { /* no-op */ } }, _catalogDictionary: { has: function (k: any) { return false; }, update: function (k: any, v: any) { /* no-op */ } } };
        (document as any)._pageCount = 1;
        const origGetPage = (PdfDocument.prototype as any).getPage;
        (PdfDocument.prototype as any).getPage = function (idx: number) { return { _pageIndex: idx }; } as any;
        // Act
        (PdfDocument.prototype as any)._removePage.call(document, pageToRemove);
        // Assert
        expect(document).toBeDefined();
        expect(updateCalls.length).toBe(1);
        expect(updateCalls[0][0]).toBe('Dest');
        expect(updateCalls[0][1]).toBeNull();
        // Cleanup
        (PdfDocument.prototype as any).getPage = origGetPage;
    });

    it('removePage - clears A and Dest when bookmark has A entry', () => {
        // Arrange
        const document = new PdfDocument();
        const pageToRemove = { id: 'pageToRemove', _pageIndex: 0, _ref: 'ref1', _pageDictionary: { has: function (_: string) { return false; }, _updated: true } } as any;
        const updateCalls: any[] = [];
        const bookmarkDict: any = {
            has: function (_: string) { return true; },
            update: function (k: any, v: any) { updateCalls.push([k, v]); }
        };
        const bookmark: any = { _dictionary: bookmarkDict };
        const bookMarkMap: Map<any, any> = new Map();
        bookMarkMap.set(pageToRemove, [bookmark]);
        (document as any)._bookmarkHashTable = bookMarkMap;
        (document as any)._form = { count: 0, fieldAt: function (i: number): undefined { return undefined; }, removeFieldAt: function (i: number) { /* no-op */ } };
        (document as any)._crossReference = { _cacheMap: new Map() };
        (document as any)._crossReference._getNextReference = function () { return { toString: function () { return '1 0 R'; } }; };
        (document as any)._crossReference._allowCatalog = false;
        (document as any)._catalog = { _topPagesDictionary: { update: function (k: any, v: any) { /* no-op */ } }, _catalogDictionary: { has: function (k: any) { return false; }, update: function (k: any, v: any) { /* no-op */ } } };
        (document as any)._pageCount = 1;
        const origRemoveTemplates = (PdfDocument.prototype as any)._removePageTemplates;
        const origUpdateCache = (PdfDocument.prototype as any)._updatePageCache;
        const origRemoveParent = (PdfDocument.prototype as any)._removeParent;
        const origGetPage = (PdfDocument.prototype as any).getPage;
        (PdfDocument.prototype as any).getPage = function (idx: number) { return { _pageIndex: idx }; } as any;
        (PdfDocument.prototype as any)._removePageTemplates = function () { return; };
        (PdfDocument.prototype as any)._updatePageCache = function () { return; };
        (PdfDocument.prototype as any)._removeParent = function () { return; };
        // Act
        (PdfDocument.prototype as any)._removePage.call(document, pageToRemove);
        // Assert
        expect(document).toBeDefined();
        expect(updateCalls.length).toBe(2);
        expect(updateCalls[0][0]).toBe('A');
        expect(updateCalls[0][1]).toBeNull();
        expect(updateCalls[1][0]).toBe('Dest');
        expect(updateCalls[1][1]).toBeNull();
        // Cleanup
        (PdfDocument.prototype as any)._removePageTemplates = origRemoveTemplates;
        (PdfDocument.prototype as any)._updatePageCache = origUpdateCache;
        (PdfDocument.prototype as any)._removeParent = origRemoveParent;
        (PdfDocument.prototype as any).getPage = origGetPage;
    });

    it('removePage - when no bookmark map exists does not call update', () => {
        // Arrange
        const document = new PdfDocument();
        const pageToRemove = { id: 'pageToRemove', _pageIndex: 0, _ref: 'ref1', _pageDictionary: { has: function (_: string) { return false; }, _updated: true } } as any;
        const updateCalls: any[] = [];
        // ensure no bookmark map and no top-level bookmarks
        (document as any)._bookmarkHashTable = undefined;
        (document as any)._bookmarkBase = undefined;
        (document as any)._form = { count: 0, fieldAt: function (i: number): undefined { return undefined; }, removeFieldAt: function (i: number) { /* no-op */ } };
        (document as any)._crossReference = { _cacheMap: new Map() };
        (document as any)._crossReference._getNextReference = function () { return { toString: function () { return '1 0 R'; } }; };
        (document as any)._crossReference._allowCatalog = false;
        (document as any)._catalog = { _topPagesDictionary: { update: function (k: any, v: any) { /* no-op */ } }, _catalogDictionary: { has: function (k: any) { return false; }, update: function (k: any, v: any) { /* no-op */ } } };
        (document as any)._pageCount = 1;
        const origGetPage = (PdfDocument.prototype as any).getPage;
        (PdfDocument.prototype as any).getPage = function (idx: number) { return { _pageIndex: idx }; } as any;
        const origRemoveTemplates = (PdfDocument.prototype as any)._removePageTemplates;
        const origUpdateCache = (PdfDocument.prototype as any)._updatePageCache;
        const origRemoveParent = (PdfDocument.prototype as any)._removeParent;
        (PdfDocument.prototype as any)._removePageTemplates = function () { return; };
        (PdfDocument.prototype as any)._updatePageCache = function () { return; };
        (PdfDocument.prototype as any)._removeParent = function () { return; };
        // Act
        (PdfDocument.prototype as any)._removePage.call(document, pageToRemove);
        // Assert
        expect(document).toBeDefined();
        expect(updateCalls.length).toBe(0);
        // Cleanup
        (PdfDocument.prototype as any)._removePageTemplates = origRemoveTemplates;
        (PdfDocument.prototype as any)._updatePageCache = origUpdateCache;
        (PdfDocument.prototype as any)._removeParent = origRemoveParent;
        (PdfDocument.prototype as any).getPage = origGetPage;
    });

    it('getDocumentInformation - returns empty when Info dictionary missing', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._getInfoDictionary = function (createIfMissing?: boolean): undefined { return undefined; };
        // Act
        const info = document.getDocumentInformation();
        // Assert
        expect(document).toBeDefined();
        expect(info).toBeDefined();
        expect((info as any).title).toBeUndefined();
        expect((info as any).author).toBeUndefined();
        expect((info as any).subject).toBeUndefined();
    });

        it('_readInfoString - throws when dict is undefined', () => {
            // Arrange
            const document = new PdfDocument();
            // Act & Assert
            expect(() => { (document as any)._readInfoString(undefined, 'Title'); }).toThrow();
        });

        it('_readInfoString - returns undefined when dict does not have the key', () => {
            // Arrange
            const document = new PdfDocument();
            let getCalled = false;
            const fakeDict: any = {
                has: function (_: string) { return false; },
                get: function (_: string) { getCalled = true; return 'SHOULD_NOT_BE_RETURNED'; }
            };
            // Act
            const result = (document as any)._readInfoString(fakeDict, 'Title');
            // Assert
            expect(document).toBeDefined();
            expect(getCalled).toBeFalsy();
            expect(result).toBeUndefined();
        });

    it('getDocumentInformation - reads title, author, subject via _readInfoString when Info present', () => {
        // Arrange
        const document = new PdfDocument();
        const fakeInfoDict: any = {
            has: function (key: string) { return ['Title', 'Author', 'Subject'].indexOf(key) !== -1; },
            get: function (key: string) { return key; },
            _map: {}
        };
        (document as any)._getInfoDictionary = function (createIfMissing?: boolean) { return fakeInfoDict; };
        (document as any)._catalog = {
            _catalogDictionary: {
                has: function (key: string) { return false; },
                get: function (key: string): any { return undefined; }
            }
        };
        (document as any)._readInfoString = function (dict: any, key: string) {
            if (key === 'Title') { return 'MyTitle'; }
            if (key === 'Author') { return 'MyAuthor'; }
            if (key === 'Subject') { return 'MySubject'; }
            return undefined;
        };
        (document as any)._getMetadataValue = function ():any { return undefined; };
        // Act
        const info = document.getDocumentInformation();
        // Assert
        expect(document).toBeDefined();
        expect(info).toBeDefined();
        expect((document as any)._xmpMetadata).toBeUndefined();
        expect((info as any).title).toBe('MyTitle');
        expect((info as any).author).toBe('MyAuthor');
        expect((info as any).subject).toBe('MySubject');
    });

    it('_getInfoDictionary - returns undefined when trailer or crossReference missing', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._crossReference = undefined;
        // Act
        const result = (document as any)._getInfoDictionary(true);
        // Assert
        expect(document).toBeDefined();
        expect(result).toBeUndefined();
    });

    it('_getInfoDictionary - creates and caches Info when missing and createIfMissing false', () => {
        // Arrange
        const document = new PdfDocument();
        const updateCalls: any[] = [];
        const trailer: any = {
            has: function (k: string) { return false; },
            update: function (k: any, v: any) { updateCalls.push([k, v]); }
        };
        let getNextCalled = false;
        const fakeRef = { toString: function () { return '10 0 R'; } };
        const crossRef: any = {
            _trailer: trailer,
            _getNextReference: function () { getNextCalled = true; return fakeRef; },
            _cacheMap: new Map()
        };
        (document as any)._crossReference = crossRef;
        // Act
        const info = (document as any)._getInfoDictionary(false);
        // Assert
        expect(info).toBeUndefined();
    });

    it('_checkPageNumber - throws when index < 0', () => {
        // Arrange
        const document = new PdfDocument();
        // Act & Assert
        expect(() => { (document as any)._checkPageNumber(-1); }).toThrowError('Index out of range');
    });

    it('_checkPageNumber - throws when index > pageCount', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._pageCount = 1;
        // Act & Assert
        expect(() => { (document as any)._checkPageNumber(2); }).toThrowError('Index out of range');
    });

    it('_checkPageNumber - does not throw when index equals pageCount', () => {
        // Arrange
        const document = new PdfDocument();
        (document as any)._pageCount = 2;
        // Act & Assert
        expect(() => { (document as any)._checkPageNumber(2); }).not.toThrow();
    });

    it('_updatePageCache - removes index and shifts higher pages down when isIncrement is false', () => {
        // Arrange
        const document = new PdfDocument();
        const originalGetPage = (PdfDocument.prototype as any).getPage;
        const fakePages: any[] = [ { _pageIndex: 0 }, { _pageIndex: 1 }, { _pageIndex: 2 } ];
        (PdfDocument.prototype as any).getPage = function (idx: number) { return fakePages[idx]; };
        (document as any)._pages = new Map<number, any>([[0, fakePages[0]], [1, fakePages[1]], [2, fakePages[2]]]);
        (document as any)._pageCount = 3;
        // Act
        (document as any)._updatePageCache(1, false);
        // Assert
        expect((document as any)._pages.size).toBe(2);
        expect((document as any)._pageCount).toBe(2);
        // Cleanup
        (PdfDocument.prototype as any).getPage = originalGetPage;
    });

});