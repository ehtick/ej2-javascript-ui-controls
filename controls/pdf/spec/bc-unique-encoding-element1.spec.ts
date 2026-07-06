
import { _PdfUniqueEncodingElement } from '../src/pdf/core/security/digital-signature/asn1/unique-encoding-element';
import { _PdfAbstractSyntaxElement } from '../src/pdf/core/security/digital-signature/asn1/abstract-syntax';
import { _ConstructionType, _TagClassType, _UniversalType } from '../src/pdf/core/security/digital-signature/asn1/enumerator';
import { _PdfCharacterString } from '../src/pdf/core/security/digital-signature/asn1/character-string';
import { _PdfObjectIdentifier } from '../src/pdf/core/security/digital-signature/asn1/identifier-mapping';
import * as ej2Utils from '../src/pdf/core/utils';

describe('_PdfUniqueEncodingElement - uncovered behaviour coverage', () => {
    function concatBytes(buffers: Uint8Array[]): Uint8Array {
        const total: number = buffers.reduce((sum: number, buf: Uint8Array) => sum + buf.length, 0);
        const out: Uint8Array = new Uint8Array(total);
        let offset: number = 0;
        for (const buf of buffers) {
            out.set(buf, offset);
            offset += buf.length;
        }
        return out;
    }

    function serializeElement(element: _PdfUniqueEncodingElement): Uint8Array {
        return concatBytes(element._toBuffers());
    }

    function primitiveOctet(value: number[]): _PdfUniqueEncodingElement {
        return new _PdfUniqueEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString,
            new Uint8Array(value)
        );
    }

    function setInternalValue(
        element: _PdfUniqueEncodingElement,
        value: Uint8Array | _PdfAbstractSyntaxElement[]
    ): void {
        (element as unknown as { _value: Uint8Array | _PdfAbstractSyntaxElement[] })._value = value;
    }

    function setInternalConstruction(
        element: _PdfUniqueEncodingElement,
        construction: _ConstructionType
    ): void {
        (element as unknown as { _construction: _ConstructionType })._construction = construction;
    }

    function setInternalCurrentValueLength(
        element: _PdfUniqueEncodingElement,
        value: number | undefined
    ): void {
        (element as unknown as { _currentValueLength: number | undefined })._currentValueLength = value;
    }

    describe('_getValue', () => {
        it('should replace internal primitive value when explicit conversion returns a different Uint8Array', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            const original: Uint8Array = new Uint8Array([1, 2, 3]);
            const converted: Uint8Array = new Uint8Array([9, 8, 7]);

            element._setValue(original);
            spyOn(ej2Utils, '_handleExplicitConversion').and.returnValue(converted);

            // Act
            const result: Uint8Array = element._getValue();

            // Assert
            expect(Array.from(result)).toEqual([9, 8, 7]);
            expect(Array.from((element as unknown as { _value: Uint8Array })._value)).toEqual([9, 8, 7]);
            expect(element._valueLength()).toBe(3);
        });

        it('should return encoded sequence bytes when value is an array', () => {
            // Arrange
            const child1: _PdfUniqueEncodingElement = primitiveOctet([1]);
            const child2: _PdfUniqueEncodingElement = primitiveOctet([2, 3]);
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.constructed,
                _UniversalType.sequence
            );
            setInternalValue(element, [child1, child2]);

            // Act
            const result: Uint8Array = element._getValue();

            // Assert
            expect(result.length).toBeGreaterThan(0);
            expect(element._valueLength()).toBe(result.length);
        });
    });

    describe('_getSequenceOf / _getAbstractSetOf / _setNumericString / _getNumericString', () => {
        it('should decode sequence-of from raw encoded bytes when internal value is not an array', () => {
            // Arrange
            const child1: _PdfUniqueEncodingElement = primitiveOctet([10]);
            const child2: _PdfUniqueEncodingElement = primitiveOctet([20]);
            const raw: Uint8Array = concatBytes([serializeElement(child1), serializeElement(child2)]);

            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.constructed,
                _UniversalType.sequence
            );
            setInternalValue(element, raw);
            setInternalConstruction(element, _ConstructionType.constructed);

            // Act
            const result: _PdfAbstractSyntaxElement[] = element._getSequenceOf();

            // Assert
            expect(result.length).toBe(2);
        });

        it('should return array value directly from _getSequenceOf when already constructed with array value', () => {
            // Arrange
            const child: _PdfUniqueEncodingElement = primitiveOctet([5]);
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.constructed,
                _UniversalType.sequence
            );
            setInternalValue(element, [child]);
            setInternalConstruction(element, _ConstructionType.constructed);

            // Act
            const result: _PdfAbstractSyntaxElement[] = element._getSequenceOf();

            // Assert
            expect(result.length).toBe(1);
            expect(result[0]).toBe(child);
        });


        it('should delegate _getAbstractSetOf to _getSequence', () => {
            // Arrange
            const expected: _PdfAbstractSyntaxElement[] = [primitiveOctet([1])];
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.constructed,
                _UniversalType.abstractSyntaxSet
            );
            const sequenceSpy = spyOn(element, '_getSequence').and.returnValue(expected);

            // Act
            const result: _PdfAbstractSyntaxElement[] = element._getAbstractSetOf();

            // Assert
            expect(sequenceSpy).toHaveBeenCalled();
            expect(result).toBe(expected);
        });

        it('should throw for _getNumericString when constructed', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.constructed);

            // Act / Assert
            expect((): string => element._getNumericString())
                .toThrowError('Numeric string cannot be constructed.');
        });

        it('should decode numeric string when primitive', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.primitive);
            spyOn(element, '_decodeNumericString').and.returnValue('12345');
            element._setValue(new Uint8Array([0x31, 0x32, 0x33]));

            // Act
            const result: string = element._getNumericString();

            // Assert
            expect(result).toBe('12345');
        });

        it('should encode numeric string through _setNumericString', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            spyOn(element, '_encodeNumericString').and.returnValue(new Uint8Array([0x31, 0x32]));

            // Act
            element._setNumericString('12');

            // Assert
            expect(Array.from(element._getValue())).toEqual([0x31, 0x32]);
        });
    });

    describe('_getUniversalString / _setUniversalString', () => {
        it('should throw when universal string is constructed', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.constructed);
            element._setValue(new Uint8Array([0, 0, 0, 65]));

            // Act / Assert
            expect((): string => element._getUniversalString())
                .toThrowError('Universal string cannot be constructed.');
        });

        it('should throw when universal string length is not a multiple of four', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.primitive);
            element._setValue(new Uint8Array([0, 0, 65]));

            // Act / Assert
            expect((): string => element._getUniversalString())
                .toThrowError('Universal string encoded on non-mulitple of four bytes.');
        });

        it('should encode and decode universal string through looped four-byte chunks', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.primitive);

            // Act
            element._setUniversalString('AB');
            const result: string = element._getUniversalString();

            // Assert
            expect(result).toBe('AB');
            expect(Array.from(element._getValue())).toEqual([
                0x00, 0x00, 0x00, 0x41,
                0x00, 0x00, 0x00, 0x42
            ]);
        });
    });

    describe('_getBmpString / _setBmpString', () => {
        it('should decode BMP string through manual fallback branch when TextDecoder is unavailable', () => {
            // Arrange
            const hostGlobal: any = Function('return this')();
            const originalTextDecoder: typeof TextDecoder | undefined = hostGlobal.TextDecoder;

            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.primitive);
            element._setValue(new Uint8Array([0x00, 0x41, 0x00, 0x42])); // "AB" in UTF-16BE

            // Act
            try {
                // remove TextDecoder to force manual decoding branch without referencing global/globalThis
                // @ts-ignore
                delete hostGlobal.TextDecoder;
                const result: string = element._getBmpString();

                // Assert
                expect(result).toBe('AB');
            } finally {
                hostGlobal.TextDecoder = originalTextDecoder;
            }
        });

        it('should encode BMP string as UTF-16BE bytes in _setBmpString', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            element._setBmpString('AB');

            // Assert
            expect(Array.from(element._getValue())).toEqual([0x00, 0x41, 0x00, 0x42]);
        });

        it('should throw when BMP string is constructed', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.constructed);
            element._setValue(new Uint8Array([0x00, 0x41]));

            // Act / Assert
            expect((): string => element._getBmpString())
                .toThrowError('BMPString cannot be constructed.');
        });

        it('should throw when BMP string has odd byte length', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.primitive);
            element._setValue(new Uint8Array([0x00, 0x41, 0x00]));

            // Act / Assert
            expect((): string => element._getBmpString())
                .toThrowError('BMPString encoded on non-multiple of two bytes.');
        });
    });

    describe('_encode', () => {
        it('should encode boolean values and set boolean universal tag', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            element._encode(true);

            // Assert
            expect(element._getTagNumber()).toBe(_UniversalType.abstractSyntaxBoolean);
            expect(element._getBooleanValue()).toBeTruthy();
        });

        it('should encode null object as ASN.1 null with empty value', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            element._encode(null);

            // Assert
            expect(element._getTagNumber()).toBe(_UniversalType.nullValue);
            expect(element._getValue().length).toBe(0);
        });

        it('should throw for unsupported non-object types (default branch)', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act / Assert
            expect((): void => element._encode(function unsupported(): void { }))
                .toThrowError('Cannot encode value of type function.');
        });

        it('should encode Uint8ClampedArray as bit string', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            element._encode(new Uint8ClampedArray([1, 0, 1, 0, 1, 0, 1, 0]));

            // Assert
            expect(element._getTagNumber()).toBe(_UniversalType.bitString);
            expect(Array.from(element._getBitString())).toEqual([1, 0, 1, 0, 1, 0, 1, 0]);
        });

        it('should encode another abstract syntax element as a one-item constructed sequence', () => {
            // Arrange
            const child: _PdfUniqueEncodingElement = primitiveOctet([7]);
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            element._encode(child);

            // Assert
            expect(element._getSequence().length).toBe(1);
            expect(element._getSequence()[0]).toBe(child);
        });

        it('should encode arrays by mapping each sub-value into child unique encoding elements', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            element._encode([true, 'A', new Uint8Array([1, 2])]);

            // Assert
            const children: _PdfAbstractSyntaxElement[] = element._getSequence();
            expect(element._getTagNumber()).toBe(_UniversalType.sequence);
            expect(children.length).toBe(3);
        });

        it('should encode _PdfObjectIdentifier as objectIdentifier tag and preserve OID value', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            const oid: _PdfObjectIdentifier = new _PdfObjectIdentifier()._fromString('1.2.3');

            // Act
            element._encode(oid);

            // Assert
            expect(element._getTagNumber()).toBe(_UniversalType.objectIdentifier);
            expect(element._getObjectIdentifier().toString()).toBe('0.1.2.3');
        });

        it('should throw for unsupported object types in object branch', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act / Assert
            expect((): void => element._encode({ unsupported: true }))
                .toThrowError('Cannot encode value of type Object.');
        });
    });

    describe('_getInner', () => {
        it('should throw when explicitly encoded element is primitive', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.primitive);

            // Act / Assert
            expect((): _PdfAbstractSyntaxElement => element._getInner())
                .toThrowError('An explicitly-encoded element cannot be encoded using primitive construction.');
        });

        it('should throw when array-backed constructed element contains more than one inner element', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.constructed);
            setInternalValue(element, [primitiveOctet([1]), primitiveOctet([2])]);

            // Act / Assert
            expect((): _PdfAbstractSyntaxElement => element._getInner())
                .toThrowError('An explicitly-encoding element contained 2 encoded elements.');
        });

        it('should decode and return the only inner element from raw bytes', () => {
            // Arrange
            const inner: _PdfUniqueEncodingElement = primitiveOctet([9]);
            const raw: Uint8Array = serializeElement(inner);

            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.constructed);
            setInternalValue(element, raw);

            // Act
            const result: _PdfAbstractSyntaxElement = element._getInner();

            // Assert
            expect(result instanceof _PdfUniqueEncodingElement).toBeTruthy();
            expect((result as _PdfUniqueEncodingElement)._getOctetString()).toEqual(new Uint8Array([9]));
        });

        it('should throw when raw bytes for explicit inner element contain more than one encoded element', () => {
            // Arrange
            const first: Uint8Array = serializeElement(primitiveOctet([1]));
            const second: Uint8Array = serializeElement(primitiveOctet([2]));
            const raw: Uint8Array = concatBytes([first, second]);

            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            setInternalConstruction(element, _ConstructionType.constructed);
            setInternalValue(element, raw);

            // Act / Assert
            expect((): _PdfAbstractSyntaxElement => element._getInner())
                .toThrowError('An explicitly-encoding element contained more than one single ');
        });
    });

    describe('_fromBytes long-tag and length branches', () => {
        it('should throw for leading padding byte in long tag number encoding', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            const bytes: Uint8Array = new Uint8Array([0x1f, 0x80]);

            // Act / Assert
            expect((): number => element._fromBytes(bytes))
                .toThrowError('Leading padding byte on long tag number encoding.');
        });

        it('should throw truncated error for long tag number when all available tag bytes have continuation bit', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            const bytes: Uint8Array = new Uint8Array([0x1f, 0x81, 0x81, 0x81, 0x81]);

            // Act / Assert
            expect((): number => element._fromBytes(bytes))
                .toThrowError('ASN1 tag number appears to have been truncated.');
        });

        it('should throw too-large error for long tag number when tag exceeds supported size', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            const bytes: Uint8Array = new Uint8Array([0x1f, 0x81, 0x81, 0x81, 0x81, 0x00]);

            // Act / Assert
            expect((): number => element._fromBytes(bytes))
                .toThrowError('ASN1 tag number too large.');
        });

        it('should throw when long tag number could have been encoded in short form', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            const bytes: Uint8Array = new Uint8Array([0x1f, 0x1e, 0x00]);

            // Act / Assert
            expect((): number => element._fromBytes(bytes))
                .toThrowError('ASN1 tag number could have been encoded in short form.');
        });

        it('should throw ASN1 element too large when long-form length overflows signed integer arithmetic', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            const bytes: Uint8Array = new Uint8Array([
                0x04,       // OCTET STRING tag
                0x84,       // 4 length octets
                0x80, 0x00, 0x00, 0x00,
                0x00
            ]);

            // Act / Assert
            expect((): number => element._fromBytes(bytes))
                .toThrowError('ASN1 element too large.');
        });

        it('should throw when DER long-form length uses more octets than necessary', () => {
            // Arrange
            const contentLength: number = 127;
            const content: Uint8Array = new Uint8Array(contentLength);
            const bytes: Uint8Array = new Uint8Array(1 + 1 + 2 + contentLength);

            bytes[0] = 0x04; // OCTET STRING
            bytes[1] = 0x82; // length encoded in 2 octets
            bytes[2] = 0x00;
            bytes[3] = 0x7f;
            bytes.set(content, 4);

            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act / Assert
            expect((): number => element._fromBytes(bytes))
                .toThrowError('DER-encoded long-form length encoded on more octets than necessary');
        });
    });

    describe('_encodeCharacterString / _decodeSequence / _getExternalEncoding', () => {
        it('should encode character-string as a two-item sequence', () => {
            // Arrange
            const identification: _PdfUniqueEncodingElement = primitiveOctet([0xaa]);
            const value: _PdfCharacterString = {
                _identification: identification,
                _stringValue: new Uint8Array([0x41, 0x42])
            } as unknown as _PdfCharacterString;

            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            const encoded: Uint8Array = element._encodeCharacterString(value);
            const decoded: _PdfUniqueEncodingElement[] = element._decodeSequence(encoded);

            // Assert
            expect(decoded.length).toBe(2);
            expect(decoded[1]._getOctetString()).toEqual(new Uint8Array([0x41, 0x42]));
        });

        it('should return empty array from _decodeSequence for empty input', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            const result: _PdfUniqueEncodingElement[] = element._decodeSequence(new Uint8Array(0));

            // Assert
            expect(result).toEqual([]);
        });

        it('should return inner element from _getExternalEncoding when tag number is 0', () => {
            // Arrange
            const inner: _PdfUniqueEncodingElement = primitiveOctet([3]);
            const wrapper: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            spyOn(wrapper, '_getTagNumber').and.returnValue(0);
            spyOn(wrapper, '_getInner').and.returnValue(inner);

            const host: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            const result: _PdfAbstractSyntaxElement | Uint8Array | Uint8ClampedArray =
                host._getExternalEncoding(wrapper);

            // Assert
            expect(result).toBe(inner);
        });
    });

    describe('_valueLength / _lengthLength', () => {
        it('should compute _valueLength through _getValue when value is not an array and current length is undefined', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            element._setValue(new Uint8Array([1, 2, 3, 4]));
            setInternalCurrentValueLength(element, undefined);
            // Act
            const length: number = element._valueLength();
            // Assert
            expect(length).toBe(4);
            expect((element as unknown as { _currentValueLength: number })._currentValueLength).toBe(4);
        });
        it('should compute _lengthLength by calling _valueLength when argument is not provided', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            const valueLengthSpy: jasmine.Spy = spyOn(element, '_valueLength').and.returnValue(130);

            // Act
            const result: number = element._lengthLength();

            // Assert
            expect(valueLengthSpy).toHaveBeenCalled();
            expect(result).toBe(2);
        });
        it('should return cached _currentValueLength for primitive value', () => {
            // Arrange
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();
            element._setValue(new Uint8Array([1, 2, 3]));
            setInternalCurrentValueLength(element, 3);

            // Act
            const result: number = element._valueLength();

            // Assert
            expect(result).toBe(3);
        });

        it('should sum child tag-value lengths when value is an array', () => {
            // Arrange
            const child1: _PdfUniqueEncodingElement = primitiveOctet([1]);
            const child2: _PdfUniqueEncodingElement = primitiveOctet([2, 3]);
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.constructed,
                _UniversalType.sequence
            );

            setInternalValue(element, [child1, child2]);
            setInternalCurrentValueLength(element, undefined);

            // Act
            const result: number = element._valueLength();

            // Assert
            expect(result).toBe(child1._tagValueLength() + child2._tagValueLength());
        });
    });

    describe('safety checks for bounded loops', () => {
        it('should decode two finite elements from _getComponents without timeout', () => {
            // Arrange
            const child1: _PdfUniqueEncodingElement = primitiveOctet([0x11]);
            const child2: _PdfUniqueEncodingElement = primitiveOctet([0x22]);
            const bytes: Uint8Array = concatBytes([serializeElement(child1), serializeElement(child2)]);

            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement(
                _TagClassType.universal,
                _ConstructionType.constructed,
                _UniversalType.sequence
            );
            setInternalValue(element, bytes);

            // Act
            const result: _PdfAbstractSyntaxElement[] = element._getComponents();

            // Assert
            expect(result.length).toBe(2);
        });

        it('should decode a finite sequence from raw bytes without timeout', () => {
            // Arrange
            const first: _PdfUniqueEncodingElement = primitiveOctet([1]);
            const second: _PdfUniqueEncodingElement = primitiveOctet([2]);
            const encoded: Uint8Array = concatBytes([serializeElement(first), serializeElement(second)]);
            const element: _PdfUniqueEncodingElement = new _PdfUniqueEncodingElement();

            // Act
            const result: _PdfUniqueEncodingElement[] = element._decodeSequence(encoded);

            // Assert
            expect(result.length).toBe(2);
        });
    });
});
