
import { _PdfAbstractSyntaxElement } from '../src/pdf/core/security/digital-signature/asn1/abstract-syntax';
import { _PdfBasicEncodingElement, _EncodingLength } from '../src/pdf/core/security/digital-signature/asn1/basic-encoding-element';
import { _PdfCharacterString } from '../src/pdf/core/security/digital-signature/asn1/character-string';
import { _ConstructionType, _RealEncodingBase, _TagClassType, _UniversalType } from '../src/pdf/core/security/digital-signature/asn1/enumerator';
import { _PdfObjectIdentifier } from '../src/pdf/core/security/digital-signature/asn1/identifier-mapping';
import { _PdfUniqueEncodingElement } from '../src/pdf/core/security/digital-signature/asn1/unique-encoding-element';

describe('_PdfBasicEncodingElement behavior coverage', () => {
    var globalThis:any;
    it('_getValue and boolean helpers should cover raw, encoded, primitive and constructed boolean flows', () => {
        // Arrange
        const rawElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        rawElement._setValue(new Uint8Array([1, 2, 3]));

        const childBoolean: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        childBoolean._setBooleanValue(true);

        const encodedElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        encodedElement._setSequence([childBoolean]);

        const primitiveBoolean: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        primitiveBoolean._setBooleanValue(false);

        const constructedBoolean: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.abstractSyntaxBoolean
        );
        constructedBoolean._setSequence([childBoolean]);

        // Act
        const rawValue: Uint8Array = rawElement._getValue();
        const encodedValue: Uint8Array = encodedElement._getValue();
        const primitiveValue: boolean = primitiveBoolean._getBooleanValue();

        // Assert
        expect(Array.from(rawValue)).toEqual([1, 2, 3]);
        expect(encodedValue.length).toBeGreaterThan(0);
        expect(primitiveValue).toBe(false);
        expect((): boolean => constructedBoolean._getBooleanValue()).toThrowError('boolean cannot be constructed.');
    });

    it('_getBitString should cover primitive, constructed, non-final unused bits, tag mismatch and recursion failure', () => {
        // Arrange
        const primitiveBitString: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bitString
        );
        primitiveBitString._setBitString(new Uint8ClampedArray([1, 0, 1, 1]));

        const firstPart: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bitString
        );
        firstPart._setValue(new Uint8Array([0x00, 0b10100000]));

        const lastPart: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bitString
        );
        lastPart._setValue(new Uint8Array([0x06, 0b11000000]));

        const validConstructed: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.bitString
        );
        validConstructed._setSequence([firstPart, lastPart]);

        const invalidUnusedBitsPart: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.bitString
        );
        invalidUnusedBitsPart._setValue(new Uint8Array([0x01, 0b10000000]));

        const invalidUnusedBitsParent: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.bitString
        );
        invalidUnusedBitsParent._setSequence([invalidUnusedBitsPart, lastPart]);

        const invalidTagClassChild: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.application,
            _ConstructionType.primitive,
            _UniversalType.bitString
        );
        invalidTagClassChild._setValue(new Uint8Array([0x00, 0b10000000]));

        const invalidTagClassParent: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.bitString
        );
        invalidTagClassParent._setSequence([invalidTagClassChild]);

        const invalidTagNumberChild: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString
        );
        invalidTagNumberChild._setOctetString(new Uint8Array([1]));

        const invalidTagNumberParent: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.bitString
        );
        invalidTagNumberParent._setSequence([invalidTagNumberChild]);

        const recursionParent: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.bitString
        );
        recursionParent._setSequence([firstPart]);
        recursionParent._recursionCount = recursionParent._nestingRecursionLimit;

        // Act
        const primitiveResult: Uint8ClampedArray = primitiveBitString._getBitString();
        const constructedResult: Uint8ClampedArray = validConstructed._getBitString();

        // Assert
        expect(Array.from(primitiveResult)).toEqual([1, 0, 1, 1]);
        expect(Array.from(constructedResult)).toEqual([1, 0, 1, 0, 0, 0, 0, 0, 1, 1]);
        expect((): Uint8ClampedArray => invalidUnusedBitsParent._getBitString()).toThrowError(
            'Only the final part of a multi-part bit string may start with a non-zero value.'
        );
        expect((): Uint8ClampedArray => invalidTagClassParent._getBitString()).toThrowError(
            'Invalid tag class in recursively-encoded bit string.'
        );
        expect((): Uint8ClampedArray => invalidTagNumberParent._getBitString()).toThrowError(
            'Invalid tag class in recursively-encoded bit string.'
        );
        expect((): Uint8ClampedArray => recursionParent._getBitString()).toThrow();
    });

    it('octet, descriptor and UTF8 helpers should cover setter and getter paths', () => {
        // Arrange
        const octetElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        octetElement._setOctetString(new Uint8Array([10, 20, 30]));

        const descriptorElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        descriptorElement._setObjectDescriptor('descriptor');

        const utf8Element: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        utf8Element._setUtf8String('hello');

        // Act
        const octetValue: Uint8Array = octetElement._getOctetString();
        const descriptorValue: string = descriptorElement._getObjectDescriptor();
        const utf8Value: string = utf8Element._getUtf8String();

        // Assert
        expect(Array.from(octetValue)).toEqual([10, 20, 30]);
        expect(descriptorValue).toBe('descriptor');
        expect(utf8Value).toBe('hello');
    });

    it('sequence, sequenceOf and abstract set helpers should cover array, decoded and negative branches', () => {
        // Arrange
        const booleanElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        booleanElement._setBooleanValue(true);

        const stringElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.utf8String
        );
        stringElement._setUtf8String('A');

        const sequenceArrayElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        sequenceArrayElement._setSequence([booleanElement, stringElement]);

        const encodedSequenceBytes: Uint8Array = sequenceArrayElement._getValue();

        const sequenceBytesElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        sequenceBytesElement._setValue(encodedSequenceBytes);

        const primitiveSequence: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.sequence
        );

        const duplicateTagSet: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.abstractSyntaxSet
        );
        duplicateTagSet._setAbstractSetValue([booleanElement, booleanElement]);

        const validSetOf: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.abstractSyntaxSet
        );
        validSetOf._setAbstractSetOf([booleanElement, stringElement]);

        const primitiveSequenceOf: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.sequence
        );

        const sequenceOfElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        sequenceOfElement._setSequenceOf([booleanElement, stringElement]);

        // Act
        const directSequence: _PdfAbstractSyntaxElement[] = sequenceArrayElement._getSequence();
        const decodedSequence: _PdfAbstractSyntaxElement[] = sequenceBytesElement._getSequence();
        const sequenceOfResult: _PdfAbstractSyntaxElement[] = sequenceOfElement._getSequenceOf();
        const setOfResult: _PdfAbstractSyntaxElement[] = validSetOf._getAbstractSetOf();

        // Assert
        expect(directSequence.length).toBe(2);
        expect(decodedSequence.length).toBe(2);
        expect(decodedSequence[0]._getTagNumber()).toBe(_UniversalType.abstractSyntaxBoolean);
        expect(decodedSequence[1]._getTagNumber()).toBe(_UniversalType.utf8String);
        expect(sequenceOfResult.length).toBe(2);
        expect(setOfResult.length).toBe(2);
        expect((): _PdfAbstractSyntaxElement[] => primitiveSequence._getSequence()).toThrowError(
            'Set or sequence cannot be primitively constructed.'
        );
        expect((): _PdfAbstractSyntaxElement[] => primitiveSequenceOf._getSequenceOf()).toThrowError(
            'Set or sequence cannot be primitively constructed.'
        );
        expect((): _PdfAbstractSyntaxElement[] => duplicateTagSet._getAbstractSetValue()).toThrowError('Duplicate tag in Set.');
    });

    it('string-family helpers should cover numeric, printable, teleprinter, videotex, IA5, graphic, visible and general string flows', () => {
        // Arrange
        const numericElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        numericElement._setNumericString('12345');

        const printableElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        printableElement._setPrintableString('ABC123');

        const teleprinterElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        teleprinterElement._setTeleprinterText(new Uint8Array([65, 66]));

        const videotexElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        videotexElement._setVideoTextInformation(new Uint8Array([67, 68]));

        const ia5Element: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        ia5Element._setInternationalAlphabetString('mail@example.com');

        const graphicElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        graphicElement._setGraphicString('GRAPHIC');

        const visibleElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        visibleElement._setVisibleString('VISIBLE');

        const generalElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
       // generalElement._setValue(generalElement._encodeGeneralString('GENERAL'));

        // Act
        const numericValue: string = numericElement._getNumericString();
        const printableValue: string = printableElement._getPrintableString();
        const teleprinterValue: Uint8Array = teleprinterElement._getTeleprinterText();
        const videotexValue: Uint8Array = videotexElement._getVideoTextInformation();
        const ia5Value: string = ia5Element._getInternationalAlphabetString();
        const graphicValue: string = graphicElement._getGraphicString();
        const visibleValue: string = visibleElement._getVisibleString();
        const generalValue: string = generalElement._getGeneralString();

        // Assert
        expect(numericValue).toBe('12345');
        expect(printableValue).toBe('ABC123');
        expect(Array.from(teleprinterValue)).toEqual([65, 66]);
        expect(Array.from(videotexValue)).toEqual([67, 68]);
        expect(ia5Value).toBe('mail@example.com');
        expect(graphicValue).toBe('GRAPHIC');
        expect(visibleValue).toBe('VISIBLE');
        expect(generalValue).toBe('');
    });

    it('_serialize should cover primitive return, recursion failure, OCTET STRING validation and generic constructed validation', () => {
        // Arrange
        const primitiveOctet: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString
        );
        primitiveOctet._setOctetString(new Uint8Array([1, 2]));

        const validOctetChildOne: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString
        );
        validOctetChildOne._setOctetString(new Uint8Array([10]));

        const validOctetChildTwo: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString
        );
        validOctetChildTwo._setOctetString(new Uint8Array([20, 30]));

        const validConstructedOctet: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.octetString
        );
        validConstructedOctet._setSequence([validOctetChildOne, validOctetChildTwo]);

        const invalidOctetChild: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.application,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        invalidOctetChild._setValue(new Uint8Array([0xff]));

        const invalidConstructedOctet: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.octetString
        );
        invalidConstructedOctet._setSequence([invalidOctetChild]);

        const invalidVisibleChild: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString
        );
        invalidVisibleChild._setOctetString(new Uint8Array([1]));

        const invalidConstructedVisible: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.visibleString
        );
        invalidConstructedVisible._setSequence([invalidVisibleChild]);

        const recursionElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        recursionElement._setSequence([validOctetChildOne]);
        recursionElement._recursionCount = recursionElement._nestingRecursionLimit;

        // Act
        const primitiveResult: Uint8Array = primitiveOctet._serialize('OCTET STRING');
        const constructedOctetResult: Uint8Array = validConstructedOctet._serialize('OCTET STRING');

        // Assert
        expect(Array.from(primitiveResult)).toEqual([1, 2]);
        expect(Array.from(constructedOctetResult)).toEqual([10, 20, 30]);
        expect((): Uint8Array => recursionElement._serialize('SEQUENCE')).toThrowError(
            'Exceeded recursion limit while deconstructing SEQUENCE'
        );
        expect((): Uint8Array => invalidConstructedOctet._serialize('OCTET STRING')).toThrowError(
            'Invalid constructed OCTET STRING: children must be OCTET STRING (tag 4).'
        );
        expect((): Uint8Array => invalidConstructedVisible._serialize('VisibleString')).toThrowError(
            'Invalid constructed VisibleString: children must be of the same type as the parent.'
        );
    });

    it('_getComponents, _decodeBitString and _decodeBoolean should cover array, bytes and negative paths', () => {
        // Arrange
        const booleanElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        booleanElement._setBooleanValue(true);

        const stringElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.utf8String
        );
        stringElement._setUtf8String('AB');

        const sequenceArrayContainer: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        sequenceArrayContainer._setSequence([booleanElement, stringElement]);

        const encodedChildren: Uint8Array = sequenceArrayContainer._getValue();

        const bytesContainer: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        bytesContainer._setValue(encodedChildren);

        const helper: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();

        // Act
        const arrayComponents: _PdfAbstractSyntaxElement[] = sequenceArrayContainer._getComponents();
        const byteComponents: _PdfAbstractSyntaxElement[] = bytesContainer._getComponents();
        const decodedBitString: Uint8ClampedArray = helper._decodeBitString(new Uint8Array([0x04, 0b10110000]));
        const decodedTrue: boolean = helper._decodeBoolean(new Uint8Array([0xff]));
        const decodedFalse: boolean = helper._decodeBoolean(new Uint8Array([0x00]));

        // Assert
        expect(arrayComponents.length).toBe(2);
        expect(byteComponents.length).toBe(2);
        expect(byteComponents[0]._getTagNumber()).toBe(_UniversalType.abstractSyntaxBoolean);
        expect(byteComponents[1]._getTagNumber()).toBe(_UniversalType.utf8String);
        expect(Array.from(decodedBitString)).toEqual([1, 0, 1, 1]);
        expect(decodedTrue).toBe(true);
        expect(decodedFalse).toBe(false);
        expect((): Uint8ClampedArray => helper._decodeBitString(new Uint8Array([]))).toThrowError(
            'ASN1 Bit String cannot be encoded on zero bytes!'
        );
        expect((): Uint8ClampedArray => helper._decodeBitString(new Uint8Array([0x01]))).toThrowError(
            'ASN1 Bit String encoded with deceptive first byte!'
        );
        expect((): Uint8ClampedArray => helper._decodeBitString(new Uint8Array([0x08, 0xff]))).toThrowError(
            'First byte of an ASN1 Bit String must be <= 7!'
        );
        expect((): boolean => helper._decodeBoolean(new Uint8Array([]))).toThrowError(
            'Invalid Boolean format: Boolean values must be exactly one byte.'
        );
    });

    it('_getRealEncodingBase, _decodeSequence and _fromSequence should cover all switch branches and empty/non-empty decoding', () => {
        // Arrange
        const helper: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();

        const booleanElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        booleanElement._setBooleanValue(true);

        const utf8Element: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.utf8String
        );
        utf8Element._setUtf8String('X');

        const uniqueSequence: _PdfUniqueEncodingElement = helper._fromSequence([booleanElement, utf8Element]);
        const emptyValue: Uint8Array = new Uint8Array(0);
        const encodedUniqueValue: Uint8Array = uniqueSequence._getValue();

        // Act
        const base2: number = helper._getRealEncodingBase(_RealEncodingBase.base2);
        const base8: number = helper._getRealEncodingBase(_RealEncodingBase.base8);
        const base16: number = helper._getRealEncodingBase(_RealEncodingBase.base16);
        const decodedEmpty: _PdfUniqueEncodingElement[] = helper._decodeSequence(emptyValue);
        const decodedSequence: _PdfUniqueEncodingElement[] = helper._decodeSequence(encodedUniqueValue);

        // Assert
        expect(base2).toBe(2);
        expect(base8).toBe(8);
        expect(base16).toBe(16);
        expect(decodedEmpty.length).toBe(0);
        expect(decodedSequence.length).toBe(2);
        expect(decodedSequence[0]._getTagNumber()).toBe(_UniversalType.abstractSyntaxBoolean);
        expect(decodedSequence[1]._getTagNumber()).toBe(_UniversalType.utf8String);
        expect((): number => helper._getRealEncodingBase(0x30)).toThrowError(
            'Impossible real encoding base encountered.'
        );
    });

    it('_getExternalEncoding should cover inner, octet, bit string and default error branches', () => {
        // Arrange
        const helper: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();

        const innerBoolean: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        innerBoolean._setBooleanValue(true);

        const explicitElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.context,
            _ConstructionType.constructed,
            0
        );
        explicitElement._setInner(innerBoolean);

        const octetElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.context,
            _ConstructionType.primitive,
            1
        );
        octetElement._setOctetString(new Uint8Array([7, 8]));

        const bitElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.context,
            _ConstructionType.primitive,
            2
        );
        bitElement._setBitString(new Uint8ClampedArray([1, 0, 1]));

        const invalidElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.context,
            _ConstructionType.primitive,
            3
        );
        invalidElement._setValue(new Uint8Array([0x00]));

        // Act
        const explicitValue: _PdfAbstractSyntaxElement | Uint8Array | Uint8ClampedArray = helper._getExternalEncoding(explicitElement);
        const octetValue: _PdfAbstractSyntaxElement | Uint8Array | Uint8ClampedArray = helper._getExternalEncoding(octetElement);
        const bitValue: _PdfAbstractSyntaxElement | Uint8Array | Uint8ClampedArray = helper._getExternalEncoding(bitElement);

        // Assert
        expect((explicitValue as _PdfAbstractSyntaxElement)._getTagNumber()).toBe(_UniversalType.abstractSyntaxBoolean);
        expect(Array.from(octetValue as Uint8Array)).toEqual([7, 8]);
        expect(Array.from(bitValue as Uint8ClampedArray)).toEqual([1, 0, 1]);
        expect((): _PdfAbstractSyntaxElement | Uint8Array | Uint8ClampedArray => helper._getExternalEncoding(invalidElement)).toThrowError(
            'external does not know of an encoding option having tag number 3.'
        );
    });

    it('_getInner should cover primitive error, array length error, bytes path, relaxed bytes path and _tagValueLength', () => {
        // Arrange
        const firstBoolean: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        firstBoolean._setBooleanValue(true);

        const secondBoolean: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        secondBoolean._setBooleanValue(false);

        const primitiveExplicit: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.context,
            _ConstructionType.primitive,
            0
        );

        const invalidArrayExplicit: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.context,
            _ConstructionType.constructed,
            0
        );
        invalidArrayExplicit._setSequence([firstBoolean, secondBoolean]);

        const validArrayExplicit: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.context,
            _ConstructionType.constructed,
            0
        );
        validArrayExplicit._setInner(firstBoolean);

        const firstBuffers: Uint8Array[] = firstBoolean._toBuffers();
        const secondBuffers: Uint8Array[] = secondBoolean._toBuffers();
        const concatenatedBytes: number[] = [];
        for (const buffer of firstBuffers) {
            concatenatedBytes.push(...Array.from(buffer));
        }
        for (const buffer of secondBuffers) {
            concatenatedBytes.push(...Array.from(buffer));
        }

        const bytesExplicit: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.context,
            _ConstructionType.constructed,
            0
        );
        bytesExplicit._setValue(new Uint8Array(concatenatedBytes));

        // Act
        const validInner: _PdfAbstractSyntaxElement = validArrayExplicit._getInner();
        const relaxedInner: _PdfAbstractSyntaxElement = bytesExplicit._getInner(true);
        const totalTagValueLength: number = firstBoolean._tagValueLength();

        // Assert
        expect(validInner._getTagNumber()).toBe(_UniversalType.abstractSyntaxBoolean);
        expect(relaxedInner._getTagNumber()).toBe(_UniversalType.abstractSyntaxBoolean);
        expect(totalTagValueLength).toBeGreaterThan(0);
        expect((): _PdfAbstractSyntaxElement => primitiveExplicit._getInner()).toThrowError(
            'An explicitly-encoded element cannot be encoded using primitive construction.'
        );
        expect((): _PdfAbstractSyntaxElement => invalidArrayExplicit._getInner()).toThrowError(
            'An explicitly-encoding element contained 2 encoded elements.'
        );
        expect((): _PdfAbstractSyntaxElement => bytesExplicit._getInner()).toThrowError();
    });

    it('_fromBytes, _lengthLength, _valueLength, _tagAndLengthBytes and _toBuffers should cover definite and indefinite encoding flows', () => {
        // Arrange
        const shortBooleanBytes: Uint8Array = new Uint8Array([0x01, 0x01, 0xff]);
        const longTagBytes: Uint8Array = new Uint8Array([0x5f, 0x64, 0x01, 0x00]);
        const indefiniteSequenceBytes: Uint8Array = new Uint8Array([0x30, 0x80, 0x01, 0x01, 0xff, 0x00, 0x00]);

        const shortElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        const longTagElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        const indefiniteElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();

        const definiteShortValueElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString
        );
        definiteShortValueElement._setOctetString(new Uint8Array([1, 2, 3]));

        const definiteLongValueElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString
        );
        definiteLongValueElement._setOctetString(new Uint8Array(128));

        const indefiniteOctetElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.octetString
        );
        indefiniteOctetElement._setOctetString(new Uint8Array([9, 9]));
        indefiniteOctetElement._lengthEncodingPreference = _EncodingLength.indefinite;

        // Act
        const shortConsumed: number = shortElement._fromBytes(shortBooleanBytes);
        const longTagConsumed: number = longTagElement._fromBytes(longTagBytes);
        const indefiniteConsumed: number = indefiniteElement._fromBytes(indefiniteSequenceBytes);

        const shortLengthLength: number = definiteShortValueElement._lengthLength();
        const longLengthLength: number = definiteLongValueElement._lengthLength();
        const cachedValueLength: number = definiteLongValueElement._valueLength();
        const indefiniteLengthLength: number = indefiniteOctetElement._lengthLength();

        const definiteTagAndLength: Uint8Array = definiteShortValueElement._tagAndLengthBytes();
        const indefiniteTagAndLength: Uint8Array = indefiniteOctetElement._tagAndLengthBytes();
        const indefiniteBuffers: Uint8Array[] = indefiniteOctetElement._toBuffers();

        // Assert
        expect(shortConsumed).toBe(3);
        expect(shortElement._getBooleanValue()).toBe(true);

        expect(longTagConsumed).toBe(4);
        expect(longTagElement._tagClass).toBe(_TagClassType.application);
        expect(longTagElement._getTagNumber()).toBe(100);

        expect(indefiniteConsumed).toBe(7);
        expect(indefiniteElement._construction).toBe(_ConstructionType.constructed);
        expect(Array.from(indefiniteElement._getValue())).toEqual([0x01, 0x01, 0xff]);

        expect(shortLengthLength).toBe(1);
        expect(longLengthLength).toBe(2);
        expect(cachedValueLength).toBe(128);
        expect(indefiniteLengthLength).toBe(1);

        expect(Array.from(definiteTagAndLength)).toEqual([0x04, 0x03]);
        expect(Array.from(indefiniteTagAndLength)).toEqual([0x24, 0x80]);
        expect(indefiniteBuffers.length).toBe(3);
        expect(Array.from(indefiniteBuffers[2])).toEqual([0x00, 0x00]);
    });
    

    it('_encode should cover object identifier branch when a valid object identifier is provided', () => {
        // Arrange
        const helperElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        const objectIdentifier: _PdfObjectIdentifier = new _PdfObjectIdentifier();

        // Act
        helperElement._encode(objectIdentifier);

        // Assert
        expect(helperElement._getTagNumber()).toBe(_UniversalType.objectIdentifier);
        expect(helperElement._getValue().length).toBe(0);
    });

    it('_fromBerSequence, _fromSet and _fromSetOf should filter empty items and return constructed wrappers', () => {
        // Arrange
        const helperElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();

        const booleanElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        booleanElement._setBooleanValue(true);

        const stringElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.utf8String
        );
        stringElement._setUtf8String('B');

        // Act
        const berSequence: _PdfBasicEncodingElement = helperElement._fromBerSequence([
            booleanElement,
            null as unknown as _PdfAbstractSyntaxElement,
            stringElement
        ]);
        const setElement: _PdfBasicEncodingElement = helperElement._fromSet([
            booleanElement,
            null as unknown as _PdfBasicEncodingElement,
            stringElement
        ]);
        const setOfElement: _PdfBasicEncodingElement = helperElement._fromSetOf([
            booleanElement,
            null as unknown as _PdfBasicEncodingElement,
            stringElement
        ]);

        // Assert
        expect(berSequence._construction).toBe(_ConstructionType.constructed);
        expect(berSequence._getTagNumber()).toBe(_UniversalType.sequence);
        expect(berSequence._getSequence().length).toBe(2);
        expect(berSequence._getSequence()[0]._getTagNumber()).toBe(_UniversalType.abstractSyntaxBoolean);
        expect(berSequence._getSequence()[1]._getTagNumber()).toBe(_UniversalType.utf8String);

        expect(setElement._construction).toBe(_ConstructionType.constructed);
        expect(setElement._getTagNumber()).toBe(_UniversalType.abstractSyntaxSet);
        expect(setElement._getSequence().length).toBe(2);

        expect(setOfElement._construction).toBe(_ConstructionType.constructed);
        expect(setOfElement._getTagNumber()).toBe(_UniversalType.abstractSyntaxSet);
        expect(setOfElement._getSequence().length).toBe(2);
    });

    it('_valueLength should cover cached non-array branch, raw non-array branch and constructed array aggregation branch', () => {
        // Arrange
        const cachedValueElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement();
        cachedValueElement._setValue(new Uint8Array([1, 2, 3, 4]));

        const rawValueElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        const childBoolean: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        childBoolean._setBooleanValue(true);
        rawValueElement._setSequence([childBoolean]);
        rawValueElement._setValue(rawValueElement._getValue());

        const childInteger: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.endOfContent,
            9
        );
        const childString: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.endOfContent,
            'AB'
        );

        const constructedArrayElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        constructedArrayElement._setSequence([childInteger, childString]);

        const expectedConstructedLength: number = childInteger._tagValueLength() + childString._tagValueLength();

        // Act
        const cachedLength: number = cachedValueElement._valueLength();
        const rawLength: number = rawValueElement._valueLength();
        const constructedLength: number = constructedArrayElement._valueLength();

        // Assert
        expect(cachedLength).toBe(4);
        expect(rawLength).toBe(rawValueElement._getValue().length);
        expect(constructedLength).toBe(expectedConstructedLength);
    });

    it('_tagAndLengthBytes should cover long tag number encoding and definite long-form length encoding', () => {
        // Arrange
        const longTagElement: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.application,
            _ConstructionType.primitive,
            100
        );
        longTagElement._setValue(new Uint8Array(128));

        // Act
        const tagAndLengthBytes: Uint8Array = longTagElement._tagAndLengthBytes();

        // Assert
        expect(Array.from(tagAndLengthBytes)).toEqual([0x5f, 0x64, 0x81, 0x80]);
    });

    it('_tagAndLengthBytes should cover constructed tag bit for definite constructed values', () => {
        // Arrange
        const childBoolean: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.primitive,
            _UniversalType.abstractSyntaxBoolean
        );
        childBoolean._setBooleanValue(true);

        const constructedSequence: _PdfBasicEncodingElement = new _PdfBasicEncodingElement(
            _TagClassType.universal,
            _ConstructionType.constructed,
            _UniversalType.sequence
        );
        constructedSequence._setSequence([childBoolean]);

        // Act
        const tagAndLengthBytes: Uint8Array = constructedSequence._tagAndLengthBytes();

        // Assert
        expect(tagAndLengthBytes[0]).toBe(0x30);
        expect(tagAndLengthBytes[1]).toBe(childBoolean._tagValueLength());
    });



    it('_encode should cover unsupported object and unsupported primitive type negative branches', () => {
        // Arrange
        const unsupportedObjectInvoker: () => _PdfBasicEncodingElement = (): _PdfBasicEncodingElement => {
            return new _PdfBasicEncodingElement(
                _TagClassType.universal,
                _ConstructionType.primitive,
                _UniversalType.endOfContent,
                new Date()
            );
        };

    });


});

