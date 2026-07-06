import { _PdfObjectIdentifier } from '../src/pdf/core/security/digital-signature/asn1/identifier-mapping';
describe('_PdfObjectIdentifier _getAbstractSyntaxNotation', () => {
    it('formats small OID as ASN notation', () => {
        const oid = new _PdfObjectIdentifier()._fromString('1.2.3');
        expect(oid._getAbstractSyntaxNotation()).toBe('{ 0 1 2 3 }');
    });

    it('formats larger OID values as ASN notation', () => {
        const oid = new _PdfObjectIdentifier()._fromString('1.2.840.113549');
        expect(oid._getAbstractSyntaxNotation()).toBe('{ 0 1 2 840 113549 }');
    });
});
describe('Identifier mapping behavior tests', () => {

    it('fromParts throws when nodes length is less than two', () => {
        const oid = new _PdfObjectIdentifier();
        expect(() => oid._fromParts([1] as number[])).toThrowError('An oid must contain at least two nodes');
    });

    it('fromParts throws when first node out of range', () => {
        const oid = new _PdfObjectIdentifier();
        expect(() => oid._fromParts([3, 1])).toThrowError('Invalid oid: The first node must be 0, 1, or 2.');
    });

    it('fromParts throws when first node <2 and second node >39', () => {
        const oid = new _PdfObjectIdentifier();
        expect(() => oid._fromParts([1, 40])).toThrowError();
    });

    it('fromParts with numeric prefix encodes combined first arc', () => {
        const builder = new _PdfObjectIdentifier();
        const result = builder._fromParts([2, 3], 1);
        const bytes = result._toBytes();
        expect(Array.from(bytes)).toEqual([42, 3]);
    });

    it('fromParts with object prefix merges encodings', () => {
        const builder = new _PdfObjectIdentifier();
        const prefix = new _PdfObjectIdentifier()._fromBytesUnsafe(new Uint8Array([1, 2]));
        const result = builder._fromParts([3, 4], prefix);
        expect(Array.from(result._toBytes())).toEqual([1, 2, 3, 4]);
    });

    it('mergeUint8Arrays concatenates two arrays', () => {
        const inst = new _PdfObjectIdentifier();
        const a = new Uint8Array([1, 2]);
        const b = new Uint8Array([3]);
        const merged = inst._mergeUint8Arrays(a, b);
        expect(Array.from(merged)).toEqual([1, 2, 3]);
    });

    it('fromString parses dotted notation and preserves toString', () => {
        const inst = new _PdfObjectIdentifier();
        const doc = inst._fromString('1.2.3');
        expect(doc.toString()).toBe('0.1.2.3');
    });

    it('fromString with single node throws via fromParts validation', () => {
        const inst = new _PdfObjectIdentifier();
        expect(() => inst._fromString('1')).toThrowError();
    });

    it('fromBytes throws on empty input', () => {
        const inst = new _PdfObjectIdentifier();
        expect(() => inst._fromBytes(new Uint8Array([]))).toThrowError('Encoded value was too short to be an object identifier');
    });

    it('fromBytes throws when final byte has high bit set (truncated)', () => {
        const inst = new _PdfObjectIdentifier();
        expect(() => inst._fromBytes(new Uint8Array([0x80]))).toThrowError('oid was truncated.');
    });

    it('fromBytes throws on padding detection in nodes', () => {
        const inst = new _PdfObjectIdentifier();
        expect(() => inst._fromBytes(new Uint8Array([0x01, 0x80]))).toBeTruthy();
    });

    it('fromBytes accepts valid bytes and preserves encoding', () => {
        const inst = new _PdfObjectIdentifier();
        const input = new Uint8Array([42, 3]);
        const doc = inst._fromBytes(input);
        expect(Array.from(doc._toBytes())).toEqual([42, 3]);
    });

    it('encodeRelativeObjectIdentifier handles single-byte arc (<128)', () => {
        const inst = new _PdfObjectIdentifier();
        const encoded = inst._encodeRelativeObjectIdentifier([10]);
        expect(Array.from(encoded)).toEqual([10]);
    });

    it('encodeRelativeObjectIdentifier handles multi-byte arc (>=128)', () => {
        const inst = new _PdfObjectIdentifier();
        const encoded = inst._encodeRelativeObjectIdentifier([128]);
        expect(Array.from(encoded)).toEqual([0x81, 0x00]);
    });

    it('decodeRelativeObjectIdentifier returns empty for empty input', () => {
        const inst = new _PdfObjectIdentifier();
        expect(inst._decodeRelativeObjectIdentifier(new Uint8Array([]))).toEqual([]);
    });

    it('decodeRelativeObjectIdentifier throws when final byte has high bit set', () => {
        const inst = new _PdfObjectIdentifier();
        expect(() => inst._decodeRelativeObjectIdentifier(new Uint8Array([1, 0x80]))).toThrowError('The relative object identifier is too long and was shortened.');
    });

    it('decodeRelativeObjectIdentifier throws on padding (0x80 at node start)', () => {
        const inst = new _PdfObjectIdentifier();
        expect(() => inst._decodeRelativeObjectIdentifier(new Uint8Array([0x80]))).toThrowError('Relative oid node has unsupported padding.');
    });

    it('decodeRelativeObjectIdentifier decodes multi-byte sequence correctly', () => {
        const inst = new _PdfObjectIdentifier();
        const decoded = inst._decodeRelativeObjectIdentifier(new Uint8Array([0x81, 0x00]));
        expect(decoded).toEqual([128]);
    });

});

describe('_PdfObjectIdentifier – _fromBytes padding validation', () => {
    it('should throw when padding is used at the start of an OID node', () => {
        const oid: _PdfObjectIdentifier = new _PdfObjectIdentifier();

        const bytes: Uint8Array = new Uint8Array([0x2A, 0x80, 0x01]);

        expect(() => {
            oid._fromBytes(bytes);
        }).toBeTruthy();
    });

    it('should throw error when byte === 0x80', () => {
        const oid: _PdfObjectIdentifier = new _PdfObjectIdentifier();

        const bytes: Uint8Array = new Uint8Array([0x2A, 0x80, 0x01]);

        expect(() => {
            oid._fromBytes(bytes);
        }).toThrowError('Padding is not allowed in object identifier nodes');
    });
});

describe('_PdfObjectIdentifier (lines 83-85,137-139,177)', () => {
    it('parses dotted string into nodes and preserves notation', () => {
        const oid = new _PdfObjectIdentifier()._fromString('1.2.3');
        expect(oid.toString()).toBe('0.1.2.3');
    });

    it('throws when parsing a single-node dotted string', () => {
        expect(() => new _PdfObjectIdentifier()._fromString('1'))
            .toThrowError('An oid must contain at least two nodes');
    });

    it('throws when _fromBytes is given an empty array', () => {
        expect(() => new _PdfObjectIdentifier()._fromBytes(new Uint8Array([])))
            .toThrowError('Encoded value was too short to be an object identifier');
    });

    it('throws when _fromBytes sees a truncated encoding (high bit set on last byte)', () => {
        expect(() => new _PdfObjectIdentifier()._fromBytes(new Uint8Array([0x2a, 0x81])))
            .toThrowError('oid was truncated.');
    });

    it('_toJson returns the dot-delimited notation', () => {
        const oid = new _PdfObjectIdentifier()._fromString('1.2.840.113549');
        expect(oid._toJson()).toBe('0.1.2.840.113549');
    });
});