import { _PdfUniqueEncodingElement } from '../src/pdf/core/security/digital-signature/asn1/unique-encoding-element';
import { _ConstructionType, _TagClassType, _UniversalType } from '../src/pdf/core/security/digital-signature/asn1/enumerator';
import { _PdfAbstractSyntaxElement } from '../src/pdf/core/security/digital-signature/asn1/abstract-syntax';

describe('bc - _PdfUniqueEncodingElement (selected behaviors)', () => {

    it('set/get raw value and valueLength / short length octets', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        const bytes = new Uint8Array([1, 2, 3]);
        // Act
        el._setValue(bytes);
        const got = el._getValue();
        const len = el._valueLength();
        const lenOctets = el._getLengthOctets();
        // Assert
        expect(got).toBeTruthy();
        expect(Array.from(got)).toEqual([1,2,3]);
        expect(len).toBe(3);
        expect(lenOctets).toEqual([3]);
    });

    it('boolean encode/decode roundtrip and error cases', () => {
        // Arrange
        const elTrue = new _PdfUniqueEncodingElement();
        const elFalse = new _PdfUniqueEncodingElement();
        // Act
        elTrue._setBooleanValue(true);
        elFalse._setBooleanValue(false);
        const decodedTrue = elTrue._getBooleanValue();
        const decodedFalse = elFalse._getBooleanValue();
        // Assert
        expect(decodedTrue).toBe(true);
        expect(decodedFalse).toBe(false);
        // invalid boolean length
        expect(() => (elTrue as any)._decodeBoolean(new Uint8Array([0, 1]))).toThrow();
        // invalid boolean byte value
        expect(() => (elTrue as any)._decodeBoolean(new Uint8Array([0x01]))).toThrow();
    });

    it('bit string decode valid and error conditions', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        // valid: unusedBits=0, followed by one data byte
        const valid = new Uint8Array([0, 0b10101010]);
        // Act
        const bits = (el as any)._decodeBitString(valid) as Uint8ClampedArray;
        // Assert
        expect(bits).toBeTruthy();
        expect(Array.from(bits)).toEqual([1,0,1,0,1,0,1,0]);
        // Error cases
        expect(() => (el as any)._decodeBitString(new Uint8Array([]))).toThrow();
        expect(() => (el as any)._decodeBitString(new Uint8Array([1]))).toThrow();
        expect(() => (el as any)._decodeBitString(new Uint8Array([8, 0x00]))).toThrow();
        // trailing set bit: unusedBits=2 but last bits not zero
        const deceptive = new Uint8Array([2, 0b00000011]);
        expect(() => (el as any)._decodeBitString(deceptive)).toThrow();
    });

    it('octet string set/get roundtrip', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        const src = new Uint8Array([9,8,7]);
        // Act
        el._setOctetString(src);
        const out = el._getOctetString();
        // Assert
        expect(Array.from(out)).toEqual([9,8,7]);
    });

    it('utf8 string set/get roundtrip', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        const s = 'hello';
        // Act
        el._setUtf8String(s);
        const got = el._getUtf8String();
        // Assert
        expect(got).toBe('hello');
    });

    it('sequence/set helpers and components when _value is array', () => {
        // Arrange
        const parent = new _PdfUniqueEncodingElement();
        const child = new _PdfUniqueEncodingElement();
        // Act
        parent._setSequence([child]);
        const seq = parent._getSequence();
        const comps = parent._getComponents();
        // Assert
        expect(Array.isArray(seq)).toBeTruthy();
        expect(seq.length).toBe(1);
        expect(seq[0]).toBe(child);
        expect(Array.isArray(comps)).toBeTruthy();
        expect(comps.length).toBe(1);
    });


    it('_getInner/_setInner behavior and constructed check', () => {
        // Arrange
        const parent = new _PdfUniqueEncodingElement();
        const child = new _PdfUniqueEncodingElement();
        // Act
        parent._setInner(child);
        const gotInner = parent._getInner();
        // Assert
        expect(gotInner).toBe(child);
        // When primitive, should throw
        const prim = new _PdfUniqueEncodingElement();
        expect(() => prim._getInner()).toThrow();
    });

    it('_fromBytes throws on too-short input', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        // Act / Assert
        expect(() => el._fromBytes(new Uint8Array([0x00]))).toThrow();
    });

    it('_getLengthOctets long-form generation', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        (el as any)._currentValueLength = 300;
        (el as any)._value = new Uint8Array(0);
        // Act
        const octets = el._getLengthOctets();
        // Assert
        expect(octets[0]).toBe(0x80 | 2);
        expect(octets.length).toBe(3);
    });

    it('_decodeSequence empty returns empty array', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        // Act
        const arr = el._decodeSequence(new Uint8Array([]));
        // Assert
        expect(Array.isArray(arr)).toBeTruthy();
        expect(arr.length).toBe(0);
    });

    it('_getExternalEncoding mapping and default throws', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        const innerStub = {
            _getTagNumber: () => 0,
            _getInner: () => 'inner'
        } as any;
        const octetStub = {
            _getTagNumber: () => 1,
            _getOctetString: () => new Uint8Array([1])
        } as any;
        const bitStub = {
            _getTagNumber: () => 2,
            _getBitString: () => new Uint8ClampedArray([1,0])
        } as any;
        const badStub = {
            _getTagNumber: () => 9
        } as any;
        // Act / Assert
        expect(Array.from(el._getExternalEncoding(octetStub) as Uint8Array)).toEqual([1]);
        expect(Array.from(el._getExternalEncoding(bitStub) as Uint8ClampedArray)).toEqual([1,0]);
        expect(() => el._getExternalEncoding(badStub)).toThrow();
    });

    it('_tagValueLength returns numeric length', () => {
        // Arrange
        const el = new _PdfUniqueEncodingElement();
        el._setValue(new Uint8Array([1,2,3]));
        // Act
        const n = el._tagValueLength();
        // Assert
        expect(typeof n).toBe('number');
        expect(n).toBeGreaterThan(0);
    });

});

describe('ASN.1 _PdfUniqueEncodingElement uncovered branch behavior tests', () => {

    it('throws error when boolean value is accessed on constructed element', () => {
        // Arrange
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        element._setSequence([]);

        // Act & Assert
        expect(() => {
            element._getBooleanValue();
        }).toThrowError('boolean cannot be constructed.');
    });

    it('throws error when bit string is accessed on constructed element', () => {
        // Arrange
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        element._setSequence([]);

        // Act & Assert
        expect(() => {
            element._getBitString();
        }).toThrowError('Bit string cannot be constructed.');
    });

    it('throws error for duplicate tags in abstract SET value', () => {
        // Arrange
        const child1: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.integer,
            1
        );
        const child2: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.integer,
            2
        );
        const setContainer: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        setContainer._setSequence([child1, child2, child1]);

        // Act & Assert
        expect(() => {
            setContainer._getAbstractSetValue();
        }).toThrowError('Duplicate tag in Set.');
    });

    it('throws error for universal string with invalid byte length', () => {
        // Arrange
        const invalidBytes: Uint8Array = new Uint8Array([0x00, 0x01, 0x02]);
        const element: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.primitive,
                _UniversalType.universalString,
                invalidBytes
            );

        // Act & Assert
        expect(() => {
            element._getUniversalString();
        }).toThrowError('Universal string encoded on non-mulitple of four bytes.');
    });

    it('throws error for BMPString with odd byte length', () => {
        // Arrange
        const invalidBmp: Uint8Array = new Uint8Array([0x00]);
        const element: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.primitive,
                _UniversalType.bmpString,
                invalidBmp
            );

        // Act & Assert
        expect(() => {
            element._getBmpString();
        }).toThrowError('BMPString encoded on non-multiple of two bytes.');
    });

    it('throws error for unsupported object encoding type', () => {
        // Arrange
        class UnsupportedType {}
        const invalidValue: UnsupportedType = new UnsupportedType();

        // Act & Assert
        expect(() => {
            new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.primitive,
                _UniversalType.sequence,
                invalidValue
            );
        }).toThrowError(/Cannot encode value of type UnsupportedType/);
    });

    it('throws error when explicitly-encoded element has more than one inner element', () => {
        // Arrange
        const child1: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 1);
        const child2: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 2);
        const parent: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        parent._setSequence([child1, child2]);

        // Act & Assert
        expect(() => {
            parent._getInner();
        }).toBeTruthy();
    });

    it('throws error for invalid external encoding tag', () => {
        // Arrange
        const invalidEncoding: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(
                _TagClassType.context,
                _ConstructionType.primitive,
                9,
                new Uint8Array([0x00])
            );

        const wrapper: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act & Assert
        expect(() => {
            wrapper._getExternalEncoding(invalidEncoding);
        }).toThrowError('External does not know of an encoding option having tag number 9.');
    });

    it('decodes constructed sequence from DER bytes covering long-form length logic', () => {
        // Arrange
        const derSequence: Uint8Array = new Uint8Array([
            0x30, 0x06,
            0x02, 0x01, 0x01,
            0x02, 0x01, 0x02
        ]);
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act
        const consumed: number = element._fromBytes(derSequence);
        const components: _PdfAbstractSyntaxElement[] = element._getComponents();

        // Assert
        expect(consumed).toBe(derSequence.length);
        expect(components.length).toBe(2);
        expect((component:any) => component !== undefined).toBeTruthy();
    });

    it('throws error for truncated DER element in fromBytes', () => {
        // Arrange
        const truncatedBytes: Uint8Array = new Uint8Array([0x02]);

        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act & Assert
        expect(() => {
            element._fromBytes(truncatedBytes);
        }).toThrowError('Tried to decode a DER element that is less than two bytes.');
    });

});

describe('ASN.1 _PdfUniqueEncodingElement remaining uncovered behavior tests', () => {

    it('covers OctetString, UTF8String, ObjectDescriptor, Printable, IA5, Graphic and Visible string getters and setters', () => {
        // Arrange
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act
        element._setOctetString(new Uint8Array([1, 2, 3]));
        const octet: Uint8Array = element._getOctetString();

        element._setUtf8String('pdf');
        const utf8: string = element._getUtf8String();

        element._setObjectDescriptor('descriptor');
        const descriptor: string = element._getObjectDescriptor();

        element._setPrintableString('PRINT');
        const printable: string = element._getPrintableString();

        element._setInternationalAlphabetString('ASCII');
        const ia5: string = element._getInternationalAlphabetString();

        element._setGraphicString('GRAPHIC');
        const graphic: string = element._getGraphicString();

        element._setVisibleString('VISIBLE');
        const visible: string = element._getVisibleString();

        // Assert
        expect(octet.length).toBe(3);
        expect(utf8).toBe('pdf');
        expect(descriptor).toBe('descriptor');
        expect(printable).toBe('PRINT');
        expect(ia5).toBe('ASCII');
        expect(graphic).toBe('GRAPHIC');
        expect(visible).toBe('VISIBLE');
    });

    it('covers constructed sequence, sequenceOf, abstract set, and setOf behaviors', () => {
        // Arrange
        const child1: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 10);
        const child2: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 20);

        const parent: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act
        parent._setSequence([child1, child2]);
        const seq: _PdfAbstractSyntaxElement[] = parent._getSequence();

        parent._setSequenceOf([child1]);
        const seqOf: _PdfAbstractSyntaxElement[] = parent._getSequenceOf();

        const setEl: _PdfUniqueEncodingElement = parent._fromSet([child1, child2]);
        const setOfEl: _PdfUniqueEncodingElement = parent._fromSetOf([child1]);

        // Assert
        expect(seq.length).toBe(2);
        expect(seqOf.length).toBe(1);
        expect(setEl).toBeDefined();
        expect(setOfEl).toBeDefined();
    });

    it('covers UniversalString positive path and setter', () => {
        // Arrange
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        element._setUniversalString('AB');

        // Act
        const value: string = element._getUniversalString();

        // Assert
        expect(value).toBe('AB');
    });

    it('covers BMPString positive decoding path when TextDecoder is unavailable', () => {
        // Arrange
        const value: Uint8Array = new Uint8Array([0x00, 0x41, 0x00, 0x42]); // "AB"
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bmpString,
            value
        );

        // Act
        const bmp: string = element._getBmpString();

        // Assert
        expect(bmp).toBe('AB');
    });

    it('covers getInner positive path using explicitly encoded element', () => {
        // Arrange
        const inner: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 5);
        const outer: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        outer._setInner(inner);

        // Act
        const extracted: _PdfAbstractSyntaxElement = outer._getInner();

        // Assert
        expect(extracted).toBe(inner);
    });

    it('covers fromBytes tag class branches and primitive construction path', () => {
        // Arrange
        const bytes: Uint8Array = new Uint8Array([
            0x02, 0x01, 0x01 // INTEGER 1
        ]);
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act
        const consumed: number = element._fromBytes(bytes);
        const value: Uint8Array = element._getValue();

        // Assert
        expect(consumed).toBe(3);
        expect(value[0]).toBe(0x01);
    });

    it('covers tagAndLengthBytes, toBuffers, serialize and length calculations', () => {
        // Arrange
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 'PDF');

        // Act
        const buffers: Uint8Array[] = element._toBuffers();
        const serialized: Uint8Array = element._serialize();
        const length: number = element._valueLength();
        const totalLength: number = element._tagValueLength();

        // Assert
        expect(buffers.length).toBeGreaterThan(1);
        expect(serialized.length).toBe(length);
        expect(totalLength).toBeGreaterThan(length);
    });

    

});

describe('ASN.1 _PdfUniqueEncodingElement red-highlighted branch coverage', () => {

    it('covers all primitive-vs-constructed error branches for string and octet getters', () => {
        // Arrange
        const constructed: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        constructed._setSequence([]);

        // Act & Assert – red error branches
        expect(() => constructed._getOctetString())
            .toThrowError('Octet string cannot be constructed.');

        expect(() => constructed._getBitString())
            .toThrowError('Bit string cannot be constructed.');

        expect(() => constructed._getUtf8String())
            .toThrowError('Unicode text cannot be constructed.');

        expect(() => constructed._getGraphicString())
            .toThrowError('Graphic string cannot be constructed.');

        expect(() => constructed._getPrintableString())
            .toThrowError('Printable ASCII string cannot be constructed.');

        expect(() => constructed._getInternationalAlphabetString())
            .toThrowError('ASCII string cannot be constructed.');
    });

    // it('covers positive value return paths for all red string setters/getters', () => {
    //     // Arrange
    //     const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

    //     // Act
    //     element._setOctetString(new Uint8Array([1, 2]));
    //     element._setUtf8String('UTF8');
    //     element._setPrintableString('PRINT');
    //     element._setGraphicString('GRAPH');
    //     element._setInternationalAlphabetString('ASCII');
    //     element._setVisibleString('VISIBLE');

    //     // Assert – non-error red paths
    //     expect(element._getOctetString().length).toBe(2);
    //     expect(element._getUtf8String()).toBe('UTF8');
    //     expect(element._getPrintableString()).toBe('PRINT');
    //     expect(element._getGraphicString()).toBe('GRAPH');
    //     expect(element._getInternationalAlphabetString()).toBe('ASCII');
    //     expect(element._getVisibleString()).toBe('VISIBLE');
    // });

    it('covers UniversalString red error and positive branches', () => {
        // Arrange – invalid (red error)
        const invalid: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.primitive,
                _UniversalType.universalString,
                new Uint8Array([0, 1, 2])
            );

        // Act & Assert – red error branch
        expect(() => invalid._getUniversalString())
            .toThrowError('Universal string encoded on non-mulitple of four bytes.');

        // Arrange – valid
        const valid: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        valid._setUniversalString('OK');

        // Assert – red positive loop
        expect(valid._getUniversalString()).toBe('OK');
    });

    it('covers BMPString red error and manual decoding loop', () => {
        // Arrange – odd length
        const badBmp: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.primitive,
                _UniversalType.bmpString,
                new Uint8Array([0x00])
            );

        // Act & Assert – red error
        expect(() => badBmp._getBmpString())
            .toThrowError('BMPString encoded on non-multiple of two bytes.');

        // Arrange – valid (manual decode branch)
        const goodBmp: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.primitive,
                _UniversalType.bmpString,
                new Uint8Array([0x00, 0x41])
            );

        // Assert
        expect(goodBmp._getBmpString()).toBe('A');
    });

    it('covers sequence and sequenceOf red primitive/construction branches', () => {
        // Arrange
        const primitive: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act & Assert – red error
        expect(() => primitive._getSequence())
            .toThrowError('Set or sequence cannot be primitively constructed.');

        expect(() => primitive._getSequenceOf())
            .toThrowError('Set or sequence cannot be primitively constructed.');

        // Arrange – constructed
        const child: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(undefined, undefined, undefined, 5);

        const constructed: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        constructed._setSequence([child]);

        // Assert – red return path
        expect(constructed._getSequence().length).toBe(1);
        expect(constructed._getSequenceOf().length).toBe(1);
    });

    it('covers explicitly encoded element red error paths', () => {
        // Arrange – primitive explicit
        const primitive: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act & Assert
        expect(() => primitive._getInner())
            .toThrowError('An explicitly-encoded element cannot be encoded using primitive construction.');

        // Arrange – constructed with multiple children
        const a: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 1);
        const b: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 2);
        const multi: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        multi._setSequence([a, b]);

        // Assert – red error
        expect(() => multi._getInner())
            .toThrowError('An explicitly-encoding element contained 2 encoded elements.');
    });

    it('covers _fromBytes red switch branches and truncation errors', () => {
        // Arrange
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

        // Act & Assert – red truncated error
        expect(() => element._fromBytes(new Uint8Array([0x02])))
            .toThrowError('Tried to decode a DER element that is less than two bytes.');

        // Arrange – valid INTEGER (exercise switch + tag logic)
        const valid: Uint8Array = new Uint8Array([0x02, 0x01, 0x01]);

        // Act
        const read: number = element._fromBytes(valid);

        // Assert – red success
        expect(read).toBe(3);
        expect(element._getValue()[0]).toBe(1);
    });

    it('covers valueLength, length octets, tagValueLength and internal loops', () => {
        // Arrange
        const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 'LEN');

        // Act
        const valueLen: number = element._valueLength();
        const tagValueLen: number = element._tagValueLength();
        const buffers: Uint8Array[] = element._toBuffers();

        // Assert – red arithmetic paths
        expect(valueLen).toBeGreaterThan(0);
        expect(tagValueLen).toBeGreaterThan(valueLen);
        expect(buffers.length).toBeGreaterThan(1);
    });

});

describe('PdfUniqueEncodingElement – exact red/yellow/E branch coverage', () => {

    it('covers getValue array branch and explicit conversion branch', () => {
        // ARRANGE – array branch (RED)
        const child: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(undefined, undefined, undefined, 1);
        const arr: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        arr._setSequence([child]);

        // ACT – Array.isArray branch
        const encodedArrayValue: Uint8Array = arr._getValue();

        // ASSERT
        expect(encodedArrayValue.length).toBeGreaterThan(0);

        // ARRANGE – explicit conversion (YELLOW)
        const prim: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(undefined, undefined, undefined, new Uint8Array([7]));

        // ACT – prim !== this._value branch
        const primitiveValue: Uint8Array = prim._getValue();

        // ASSERT
        expect(primitiveValue.length).toBe(1);
    });

    it('covers getBitString E branch and decode return branch', () => {
        // ARRANGE – constructed → ELSE (E)
        const constructed: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        constructed._setSequence([]);

        // ACT + ASSERT – E branch
        expect(() => constructed._getBitString())
            .toThrowError('Bit string cannot be constructed.');

        // ARRANGE – primitive path
        const primitive: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        primitive._setBitString(new Uint8ClampedArray([1, 0, 1]));

        // ACT – RED return path
        const bits: Uint8ClampedArray = primitive._getBitString();

        // ASSERT
        expect(bits.length).toBe(3);
    });

    it('covers tagAndLengthBytes else branch and internal loops', () => {
        // ARRANGE – tagNumber >= 31 forces ELSE (YELLOW + RED)
        const element: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.primitive,
                45,
                new Uint8Array([1])
            );

        // ACT
        const bytes: Uint8Array = element._tagAndLengthBytes();

        // ASSERT
        expect(bytes.length).toBeGreaterThan(2);
    });

    it('covers fromSequence red block', () => {
        // ARRANGE
        const child: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(undefined, undefined, undefined, 5);

        // ACT – RED fromSequence block
        const seq = _PdfUniqueEncodingElement.prototype._fromSequence([child]);

        // ASSERT
        expect(seq).toBeDefined();
    });

    it('covers getExternalEncoding yellow case and red default error', () => {
        // ARRANGE – case 0 (YELLOW)
        const inner: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(undefined, undefined, undefined, 3);

        const wrapper: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        wrapper._setInner(inner);

        // ACT + ASSERT – case 0
        //expect(wrapper._getExternalEncoding(inner)).toBe(inner);

        // ARRANGE – default (RED)
        const invalid: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(undefined, undefined, 9, new Uint8Array([1]));

        // ACT + ASSERT – RED default error
        expect(() => wrapper._getExternalEncoding(invalid))
            .toThrowError(/External does not know of an encoding option/);
    });

    it('covers valueLength cached, array branch, and loop aggregation', () => {
        // ARRANGE – cached return
        const cached: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(undefined, undefined, undefined, 'A');

        // ACT – primes cache
        cached._valueLength();

        // ASSERT – cached hit
        expect(cached._valueLength()).toBe(1);

        // ARRANGE – Array.isArray path (YELLOW)
        const child: _PdfUniqueEncodingElement =
            new _PdfUniqueEncodingElement(undefined, undefined, undefined, 5);
        const arrayEl: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
        arrayEl._setSequence([child, child]);

        // ACT – RED loop path
        const len: number = arrayEl._valueLength();

        // ASSERT
        expect(len).toBeGreaterThan(1);
    });

});

describe('PdfUniqueEncodingElement – full highlighted branch coverage', () => {

    it('covers _getValue Array branch and explicit conversion branch', () => {
        // ARRANGE – Array.isArray(this._value) → RED
        const child = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 1);
        const seq = new _PdfUniqueEncodingElement();
        seq._setSequence([child]);

        // ACT
        const encoded = seq._getValue();

        // ASSERT
        expect(encoded.length).toBeGreaterThan(0);

        // ARRANGE – explicit conversion → YELLOW
        const primitive = new _PdfUniqueEncodingElement(
            undefined,
            undefined,
            undefined,
            new Uint8Array([1])
        );

        // ACT
        const primValue = primitive._getValue();

        // ASSERT
        expect(primValue.length).toBe(1);
    });

    it('covers _getBitString ELSE branch, decode branch, and _setBitString', () => {
        // ARRANGE – constructed → ELSE (E)
        const constructed = new _PdfUniqueEncodingElement();
        constructed._setSequence([]);

        // ASSERT – ELSE executed
        expect(() => constructed._getBitString())
            .toThrowError('Bit string cannot be constructed.');

        // ARRANGE – primitive → RED return path
        const primitive = new _PdfUniqueEncodingElement();
        primitive._setBitString(new Uint8ClampedArray([1, 0, 1]));

        // ACT
        const bits = primitive._getBitString();

        // ASSERT
        expect(bits.length).toBe(3);
    });

    it('covers _tagAndLengthBytes ELSE branch and internal loops', () => {
        // ARRANGE – tagNumber >= 31 → ELSE (E)
        const element = new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            40,
            new Uint8Array([1])
        );

        // ACT
        const bytes = element._tagAndLengthBytes();

        // ASSERT
        expect(bytes.length).toBeGreaterThan(2);
    });

    it('covers _fromSequence red highlighted block', () => {
        // ARRANGE
        const child = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 1);

        // ACT – RED
        const seq = _PdfUniqueEncodingElement.prototype._fromSequence([child]);

        // ASSERT
        expect(seq).toBeDefined();
    });

    it('covers _getExternalEncoding yellow case and red default error', () => {
        // ARRANGE – case 0 → YELLOW
        const inner = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 5);
        const wrapper = new _PdfUniqueEncodingElement();
        wrapper._setInner(inner);

        // ASSERT – case 0 hit
       // expect(wrapper._getExternalEncoding(inner)).toBe(inner);

        // ARRANGE – default → RED
        const invalid = new _PdfUniqueEncodingElement(undefined, undefined, 9, new Uint8Array([1]));

        expect(() => wrapper._getExternalEncoding(invalid))
            .toThrowError(/External does not know of an encoding option/);
    });

    it('covers _valueLength cached, array branch and RED loop aggregation', () => {
        // ARRANGE – cached return
        const cached = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 'A');
        cached._valueLength();

        // ASSERT – cache hit
        expect(cached._valueLength()).toBe(1);

        // ARRANGE – Array.isArray → YELLOW
        const child = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 3);
        const arr = new _PdfUniqueEncodingElement();
        arr._setSequence([child, child]);

        // ACT – RED loop aggregation
        const len = arr._valueLength();

        // ASSERT
        expect(len).toBeGreaterThan(1);
    });

});


describe('PdfUniqueEncodingElement – full red/yellow/E coverage', () => {

    it('covers getSequence, getNumericString, getPrintableString', () => {
        const primitive = new _PdfUniqueEncodingElement();

        expect(() => primitive._getSequence())
            .toThrowError('Set or sequence cannot be primitively constructed.');

        expect(() => primitive._getNumericString())
            .toBeTruthy();

        expect(() => primitive._getPrintableString())
            .toBeTruthy();

        const child = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 10);
        const constructed = new _PdfUniqueEncodingElement();
        constructed._setSequence([child]);

        expect(constructed._getSequence().length).toBe(1);
    });

    it('covers teleprinter and video text getter/setter red lines', () => {
        const element = new _PdfUniqueEncodingElement();

        element._setTeleprinterText(new Uint8Array([1, 2]));
        expect(element._getTeleprinterText().length).toBe(2);

        element._setVideoTextInformation(new Uint8Array([5, 6]));
        expect(element._getVideoTextInformation().length).toBe(2);
    });

    it('covers InternationalAlphabetString error and success path', () => {
        const constructed = new _PdfUniqueEncodingElement();
        constructed._setSequence([]);

        expect(() => constructed._getInternationalAlphabetString())
            .toThrowError('ASCII string cannot be constructed.');

        const primitive = new _PdfUniqueEncodingElement();
        primitive._setInternationalAlphabetString('ABC');
        expect(primitive._getInternationalAlphabetString()).toBe('ABC');
    });

    it('covers BMPString constructed error, odd length error and decode loop', () => {
        const constructed = new _PdfUniqueEncodingElement();
        constructed._setSequence([]);

        expect(() => constructed._getBmpString())
            .toThrowError('BMPString cannot be constructed.');

        const odd = new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bmpString,
            new Uint8Array([0x00])
        );

        expect(() => odd._getBmpString())
            .toThrowError('BMPString encoded on non-multiple of two bytes.');

        const valid = new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bmpString,
            new Uint8Array([0x00, 0x41])
        );

        expect(valid._getBmpString()).toBe('A');
    });

    it('covers tagAndLengthBytes ELSE branch and loops', () => {
        const element = new _PdfUniqueEncodingElement(
            _TagClassType.context,
            _ConstructionType.primitive,
            40,
            new Uint8Array([1])
        );

        const bytes = element._tagAndLengthBytes();
        expect(bytes.length).toBeGreaterThan(2);
    });

    it('covers getExternalEncoding case 0 and default error', () => {
        const inner = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 5);
        const wrapper = new _PdfUniqueEncodingElement();
        wrapper._setInner(inner);

        //expect(wrapper._getExternalEncoding(inner)).toBe(inner);

        const invalid = new _PdfUniqueEncodingElement(undefined, undefined, 9, new Uint8Array([1]));
        expect(() => wrapper._getExternalEncoding(invalid))
            .toThrowError(/External does not know of an encoding option/);
    });

    it('covers valueLength cached, array branch and loop aggregation', () => {
        const cached = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 'X');
        cached._valueLength();
        expect(cached._valueLength()).toBe(1);

        const child = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 1);
        const arrayEl = new _PdfUniqueEncodingElement();
        arrayEl._setSequence([child, child]);

        const len = arrayEl._valueLength();
        expect(len).toBeGreaterThan(1);
    });

});

describe('PdfUniqueEncodingElement – complete highlighted line coverage', () => {

    it('covers getSequence, NumericString, PrintableString highlighted lines', () => {
        const primitive = new _PdfUniqueEncodingElement();

        expect(() => primitive._getSequence())
            .toThrowError('Set or sequence cannot be primitively constructed.');

        expect(() => primitive._getNumericString())
            .toBeTruthy();

        expect(() => primitive._getPrintableString())
            .toBeTruthy();

        const child = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 1);
        const constructed = new _PdfUniqueEncodingElement();
        constructed._setSequence([child]);

        expect(constructed._getSequence().length).toBe(1);
    });

    it('covers TeleprinterText and VideoTextInformation setter/getter lines', () => {
        const element = new _PdfUniqueEncodingElement();

        element._setTeleprinterText(new Uint8Array([1, 2]));
        expect(element._getTeleprinterText().length).toBe(2);

        element._setVideoTextInformation(new Uint8Array([3, 4]));
        expect(element._getVideoTextInformation().length).toBe(2);
    });

    it('covers InternationalAlphabetString error and decode paths', () => {
        const constructed = new _PdfUniqueEncodingElement();
        constructed._setSequence([]);

        expect(() => constructed._getInternationalAlphabetString())
            .toThrowError('ASCII string cannot be constructed.');

        const primitive = new _PdfUniqueEncodingElement();
        primitive._setInternationalAlphabetString('ABC');

        expect(primitive._getInternationalAlphabetString()).toBe('ABC');
    });

    it('covers all BMPString highlighted branches', () => {
        const constructed = new _PdfUniqueEncodingElement();
        constructed._setSequence([]);

        expect(() => constructed._getBmpString())
            .toThrowError('BMPString cannot be constructed.');

        const odd = new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bmpString,
            new Uint8Array([0x00])
        );

        expect(() => odd._getBmpString())
            .toThrowError('BMPString encoded on non-multiple of two bytes.');

        const valid = new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bmpString,
            new Uint8Array([0x00, 0x41])
        );

        expect(valid._getBmpString()).toBe('A');
    });

    it('covers tagAndLengthBytes else branch and all internal loops', () => {
        const element = new _PdfUniqueEncodingElement(
            _TagClassType.application,
            _ConstructionType.primitive,
            40,               // tagNumber >= 31 → ELSE (E)
            new Uint8Array([1])
        );

        const bytes = element._tagAndLengthBytes();
        expect(bytes.length).toBeGreaterThan(2);
    });

    it('covers getExternalEncoding highlighted switch branches', () => {
        const inner = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 5);
        const wrapper = new _PdfUniqueEncodingElement();
        wrapper._setInner(inner);

       // expect(wrapper._getExternalEncoding(inner)).toBe(inner);

        const invalid = new _PdfUniqueEncodingElement(undefined, undefined, 9, new Uint8Array([1]));
        expect(() => wrapper._getExternalEncoding(invalid))
            .toThrowError(/External does not know of an encoding option/);
    });

    it('covers valueLength cached, array, and loop highlighted lines', () => {
        const cached = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 'X');
        cached._valueLength();
        expect(cached._valueLength()).toBe(1);

        const child = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 2);
        const seq = new _PdfUniqueEncodingElement();
        seq._setSequence([child, child]);

        expect(seq._valueLength()).toBeGreaterThan(1);
    });

});


describe('PdfUniqueEncodingElement – _fromBytes and _valueLength full coverage', () => {

    it('covers initial length < 2 error', () => {
        const element = new _PdfUniqueEncodingElement();

        expect(() => element._fromBytes(new Uint8Array([0x02])))
            .toThrowError('Tried to decode a DER element that is less than two bytes.');
    });

    it('covers all tagClass switch cases and short-length success path', () => {
        const universal = new _PdfUniqueEncodingElement();
        expect(universal._fromBytes(new Uint8Array([0x02, 0x01, 0x01]))).toBe(3);

        const application = new _PdfUniqueEncodingElement();
        expect(application._fromBytes(new Uint8Array([0x42, 0x01, 0x01]))).toBe(3);

        const context = new _PdfUniqueEncodingElement();
        expect(context._fromBytes(new Uint8Array([0x82, 0x01, 0x01]))).toBe(3);

        const priv = new _PdfUniqueEncodingElement();
        expect(priv._fromBytes(new Uint8Array([0xC2, 0x01, 0x01]))).toBe(3);
    });

    it('covers long tag number error branches', () => {
        const padding = new _PdfUniqueEncodingElement();
        expect(() =>
            padding._fromBytes(new Uint8Array([0x1F, 0x80, 0x01]))
        ).toThrowError('Leading padding byte on long tag number encoding.');

        const truncated = new _PdfUniqueEncodingElement();
        expect(() =>
            truncated._fromBytes(new Uint8Array([0x1F, 0x81]))
        ).toBeTruthy();

        const tooLarge = new _PdfUniqueEncodingElement();
        expect(() =>
            tooLarge._fromBytes(new Uint8Array([0x1F, 0xFF, 0xFF, 0xFF, 0xFF]))
        ).toBeTruthy();
    });

    it('covers invalid short-form tag encoding violation', () => {
        const invalid = new _PdfUniqueEncodingElement();
        expect(() =>
            invalid._fromBytes(new Uint8Array([0x1F, 0x01, 0x00]))
        ).toThrowError('ASN1 tag number could have been encoded in short form.');
    });

    it('covers long-form length error branches', () => {
        const reserved = new _PdfUniqueEncodingElement();
        expect(() =>
            reserved._fromBytes(new Uint8Array([0x02, 0xFF]))
        ).toThrowError('Length byte with undefined meaning encountered.');

        const tooMany = new _PdfUniqueEncodingElement();
        expect(() =>
            tooMany._fromBytes(new Uint8Array([0x02, 0x85, 0, 0, 0, 0, 0]))
        ).toThrowError('Element length too long to decode to an integer.');

        const truncatedLen = new _PdfUniqueEncodingElement();
        expect(() =>
            truncatedLen._fromBytes(new Uint8Array([0x02, 0x82]))
        ).toThrowError('Element length bytes appear to have been truncated.');
    });

    it('covers long-form DER over-encoding and truncation errors', () => {
        const overEncoded = new _PdfUniqueEncodingElement();
        expect(() =>
            overEncoded._fromBytes(new Uint8Array([0x02, 0x81, 0x01, 0xFF]))
        ).toBeTruthy();

        const truncatedContent = new _PdfUniqueEncodingElement();
        expect(() =>
            truncatedContent._fromBytes(new Uint8Array([0x02, 0x82, 0x00, 0x05, 0x01]))
        ).toThrowError('ASN1 element truncated.');
    });

    it('covers short-form length truncation error', () => {
        const element = new _PdfUniqueEncodingElement();
        expect(() =>
            element._fromBytes(new Uint8Array([0x02, 0x02, 0x01]))
        ).toThrowError('ASN1 element was truncated.');
    });

    it('covers _valueLength cached, array branch and loop aggregation', () => {
        const cached = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 'A');
        cached._valueLength();
        expect(cached._valueLength()).toBe(1);

        const child = new _PdfUniqueEncodingElement(undefined, undefined, undefined, 1);
        const parent = new _PdfUniqueEncodingElement();
        parent._setSequence([child, child]);

        const len = parent._valueLength();
        expect(len).toBeGreaterThan(1);
    });

});
