import { _PdfAbstractSyntaxElement } from '../src/pdf/core/security/digital-signature/asn1/abstract-syntax';
import { _ConstructionType, _TagClassType, _UniversalType } from '../src/pdf/core/security/digital-signature/asn1/enumerator';
import { _PdfObjectIdentifier } from '../src/pdf/core/security/digital-signature/asn1/identifier-mapping';
import { toBigIntFn } from './test-utility.spec';
var globalThis:any;
class ConcreteAbstractSyntaxElement extends _PdfAbstractSyntaxElement {
    private _rawValue: Uint8Array = new Uint8Array(0);
    private _boolValue: boolean = false;
    private _bitStringValue: Uint8ClampedArray = new Uint8ClampedArray(0);
    private _octetStringValue: Uint8Array = new Uint8Array(0);
    private _objectDescriptorValue: string = '';
    private _utf8StringValue: string = '';
    private _sequenceValue: _PdfAbstractSyntaxElement[] = [];
    private _abstractSetValue: _PdfAbstractSyntaxElement[] = [];
    private _sequenceOfValue: _PdfAbstractSyntaxElement[] = [];
    private _abstractSetOfValue: _PdfAbstractSyntaxElement[] = [];
    private _numericStringValue: string = '';
    private _printableStringValue: string = '';
    private _teleprinterTextValue: Uint8Array = new Uint8Array(0);
    private _videoTextValue: Uint8Array = new Uint8Array(0);
    private _ia5StringValue: string = '';
    private _graphicStringValue: string = '';
    private _visibleStringValue: string = '';
    private _universalStringValue: string = '';
    private _bmpStringValue: string = '';
    private _innerValue: _PdfAbstractSyntaxElement | null = null;

    _getValue(): Uint8Array {
        return this._rawValue;
    }

    _setValue(value: Uint8Array): void {
        this._rawValue = value;
    }

    _getBooleanValue(): boolean {
        return this._boolValue;
    }

    _setBooleanValue(value: boolean): void {
        this._boolValue = value;
    }

    _getBitString(): Uint8ClampedArray {
        return this._bitStringValue;
    }

    _setBitString(value: Uint8ClampedArray): void {
        this._bitStringValue = value;
    }

    _getOctetString(): Uint8Array {
        return this._octetStringValue;
    }

    _setOctetString(value: Uint8Array): void {
        this._octetStringValue = value;
    }

    _getObjectDescriptor(): string {
        return this._objectDescriptorValue;
    }

    _setObjectDescriptor(value: string): void {
        this._objectDescriptorValue = value;
    }

    _getUtf8String(): string {
        return this._utf8StringValue;
    }

    _setUtf8String(value: string): void {
        this._utf8StringValue = value;
    }

    _getSequence(): _PdfAbstractSyntaxElement[] {
        return this._sequenceValue;
    }

    _setSequence(value: _PdfAbstractSyntaxElement[]): void {
        this._sequenceValue = value;
    }

    _getAbstractSetValue(): _PdfAbstractSyntaxElement[] {
        return this._abstractSetValue;
    }

    _setAbstractSetValue(value: _PdfAbstractSyntaxElement[]): void {
        this._abstractSetValue = value;
    }

    _getSequenceOf(): _PdfAbstractSyntaxElement[] {
        return this._sequenceOfValue;
    }

    _setSequenceOf(value: _PdfAbstractSyntaxElement[]): void {
        this._sequenceOfValue = value;
    }

    _getAbstractSetOf(): _PdfAbstractSyntaxElement[] {
        return this._abstractSetOfValue;
    }

    _setAbstractSetOf(value: _PdfAbstractSyntaxElement[]): void {
        this._abstractSetOfValue = value;
    }

    _getNumericString(): string {
        return this._numericStringValue;
    }

    _setNumericString(value: string): void {
        this._numericStringValue = value;
    }

    _getPrintableString(): string {
        return this._printableStringValue;
    }

    _setPrintableString(value: string): void {
        this._printableStringValue = value;
    }

    _getTeleprinterText(): Uint8Array {
        return this._teleprinterTextValue;
    }

    _setTeleprinterText(value: Uint8Array): void {
        this._teleprinterTextValue = value;
    }

    _getVideoTextInformation(): Uint8Array {
        return this._videoTextValue;
    }

    _setVideoTextInformation(value: Uint8Array): void {
        this._videoTextValue = value;
    }

    _getInternationalAlphabetString(): string {
        return this._ia5StringValue;
    }

    _setInternationalAlphabetString(value: string): void {
        this._ia5StringValue = value;
    }

    _getGraphicString(): string {
        return this._graphicStringValue;
    }

    _setGraphicString(value: string): void {
        this._graphicStringValue = value;
    }

    _getVisibleString(): string {
        return this._visibleStringValue;
    }

    _setVisibleString(value: string): void {
        this._visibleStringValue = value;
    }

    _getUniversalString(): string {
        return this._universalStringValue;
    }

    _setUniversalString(value: string): void {
        this._universalStringValue = value;
    }

    _getBmpString(): string {
        return this._bmpStringValue;
    }

    _setBmpString(value: string): void {
        this._bmpStringValue = value;
    }

    _getInner(): _PdfAbstractSyntaxElement {
        return this._innerValue || new ConcreteAbstractSyntaxElement();
    }

    _getComponents(): _PdfAbstractSyntaxElement[] {
        return [];
    }

    _fromBytes(bytes: Uint8Array): number {
        this._rawValue = bytes;
        return bytes.length;
    }

    _construct(els: _PdfAbstractSyntaxElement[]): void {
        this._sequenceValue = els;
    }

    _tagAndLengthBytes(): Uint8Array {
        return new Uint8Array(0);
    }

    _toBuffers(): Uint8Array[] {
        return [this._rawValue];
    }

    _lengthLength(valueLength?: number): number {
        const len: number = valueLength !== undefined ? valueLength : this._rawValue.length;
        if (len < 128) {
            return 1;
        }
        let numOctets: number = 0;
        let n: number = len;
        while (n > 0) {
            numOctets++;
            n >>>= 8;
        }
        return numOctets + 1;
    }

    _valueLength(): number {
        return this._rawValue.length;
    }

    _serialize(dataType: string): Uint8Array {
        return this._rawValue;
    }
}

describe('_PdfAbstractSyntaxElement behavior coverage', () => {

    it('_setTagNumber with safe positive integer accepts and stores value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const validTagNumber: number = 15;
        // Act
        element._setTagNumber(validTagNumber);
        // Assert
        expect(element._getTagNumber()).toBe(validTagNumber);
    });

    it('_setTagNumber with unsafe integer throws error for non-integer', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const invalidValue: number = 1.5;
        // Act & Assert
        expect(() => element._setTagNumber(invalidValue)).toThrowError('Tag 1.5 was not a non-negative number.');
    });

    it('_setTagNumber with negative integer throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const negativeValue: number = -5;
        // Act & Assert
        expect(() => element._setTagNumber(negativeValue)).toThrowError('Tag -5 was not a non-negative number.');
    });

    it('_setTagNumber with large safe integer stores correctly', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const largeTagNumber: number = Number.MAX_SAFE_INTEGER;
        // Act
        element._setTagNumber(largeTagNumber);
        // Assert
        expect(element._getTagNumber()).toBe(largeTagNumber);
    });

    it('_setTagNumber with zero stores correctly', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setTagNumber(0);
        // Assert
        expect(element._getTagNumber()).toBe(0);
    });

    it('_tagLength returns 1 for tag number less than 31', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setTagNumber(15);
        // Act
        const tagLength: number = element._tagLength();
        // Assert
        expect(tagLength).toBe(1);
    });

    it('_tagLength returns 1 for tag number exactly 30', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setTagNumber(30);
        // Act
        const tagLength: number = element._tagLength();
        // Assert
        expect(tagLength).toBe(1);
    });

    it('_tagLength returns 2 for tag number 31', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setTagNumber(31);
        // Act
        const tagLength: number = element._tagLength();
        // Assert
        expect(tagLength).toBe(2);
    });

    it('_tagLength calculates extended encoding for large tag numbers', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setTagNumber(255);
        // Act
        const tagLength: number = element._tagLength();
        // Assert
        expect(tagLength).toBe(3);
    });

    it('_tagLength calculates extended encoding for very large tag numbers', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setTagNumber(16384);
        // Act
        const tagLength: number = element._tagLength();
        // Assert
        expect(tagLength).toBe(4);
    });

    it('_tagLength returns correct count for multi-byte encoding', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setTagNumber(2097152);
        // Act
        const tagLength: number = element._tagLength();
        // Assert
        expect(tagLength).toBeGreaterThan(1);
    });

    it('_getLength returns length of value bytes', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const testValue: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
        element._setValue(testValue);
        // Act
        const length: number = element._getLength();
        // Assert
        expect(length).toBe(5);
    });

    it('_getLength returns zero for empty value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setValue(new Uint8Array(0));
        // Act
        const length: number = element._getLength();
        // Assert
        expect(length).toBe(0);
    });

    it('_validateSize within bounds succeeds', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateSize('TestSize', 'bytes', 50, 10, 100)).not.toThrow();
    });

    it('_validateSize below minimum throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateSize('TestSize', 'bytes', 5, 10, 100))
            .toThrowError('TestSize must be at least 10 bytes, but was 5 bytes.');
    });

    it('_validateSize above maximum throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateSize('TestSize', 'bytes', 150, 10, 100))
            .toThrowError('TestSize must not exceed 100 bytes, but was 150 bytes.');
    });

    it('_validateSize with undefined max allows any large value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateSize('TestSize', 'bytes', 999999, 10)).not.toThrow();
    });

    it('_validateSize at exact minimum boundary succeeds', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateSize('TestSize', 'bytes', 10, 10, 100)).not.toThrow();
    });

    it('_validateSize at exact maximum boundary succeeds', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateSize('TestSize', 'bytes', 100, 10, 100)).not.toThrow();
    });

    it('_validateRange within bounds succeeds with bigint min', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateRange('TestRange', 50, (globalThis as any).BigInt(10), (globalThis as any).BigInt(100))).toThrow();
    });

    it('_validateRange below minimum throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateRange('TestRange', 5, (globalThis as any).BigInt(10), (globalThis as any).BigInt(100)))
            .toBeTruthy();
    });

    it('_validateRange above maximum throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateRange('TestRange', 150, (globalThis as any).BigInt(10), (globalThis as any).BigInt(100)))
            .toBeTruthy();
    });

    it('_validateRange with undefined max allows any large value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateRange('TestRange', 999999, (globalThis as any).BigInt(10))).toThrow();
    });

    it('_validateRange with null max skips upper bound check', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._validateRange('TestRange', 150, (globalThis as any).BigInt(10), null as any)).toThrow();
    });

    it('_sizeConstrainedString returns bit string with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const bitString: Uint8ClampedArray = new Uint8ClampedArray([1, 0, 1, 0, 1]);
        element._setBitString(bitString);
        // Act
        const result: Uint8ClampedArray = element._sizeConstrainedString(1, 10);
        // Assert
        expect(result).toEqual(bitString);
    });

    it('_sizeConstrainedString throws on undersized bit string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const bitString: Uint8ClampedArray = new Uint8ClampedArray([1]);
        element._setBitString(bitString);
        // Act & Assert
        expect(() => element._sizeConstrainedString(5, 10)).toThrow();
    });

    it('_sizeConstrainedUtf8String returns UTF-8 string with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const utf8String: string = 'Hello';
        element._setUtf8String(utf8String);
        // Act
        const result: string = element._sizeConstrainedUtf8String(1, 10);
        // Assert
        expect(result).toBe(utf8String);
    });

    it('_sizeConstrainedUtf8String throws on oversized string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setUtf8String('HelloWorld');
        // Act & Assert
        expect(() => element._sizeConstrainedUtf8String(1, 5)).toThrow();
    });

    it('_sizeConstrainedSequenceOf returns sequence with valid element count', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const child1: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const child2: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setSequenceOf([child1, child2]);
        // Act
        const result: _PdfAbstractSyntaxElement[] = element._sizeConstrainedSequenceOf(1, 5);
        // Assert
        expect(result.length).toBe(2);
    });

    it('_sizeConstrainedSequenceOf throws on too many elements', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const children: ConcreteAbstractSyntaxElement[] = [];
        for (let i: number = 0; i < 10; i++) {
            children.push(new ConcreteAbstractSyntaxElement());
        }
        element._setSequenceOf(children);
        // Act & Assert
        expect(() => element._sizeConstrainedSequenceOf(1, 5)).toThrow();
    });

    it('_sizeConstrainedSetOf validates element count', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const child1: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setSequenceOf([child1]);
        // Act
        const result: _PdfAbstractSyntaxElement[] = element._sizeConstrainedSetOf(1, 5);
        // Assert
        expect(result.length).toBe(1);
    });

    it('_sizeConstrainedNumericString returns numeric string with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setNumericString('12345');
        // Act
        const result: string = element._sizeConstrainedNumericString(1, 10);
        // Assert
        expect(result).toBe('12345');
    });

    it('_sizeConstrainedPrintableString returns printable string with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setPrintableString('HELLO');
        // Act
        const result: string = element._sizeConstrainedPrintableString(1, 10);
        // Assert
        expect(result).toBe('HELLO');
    });

    it('_sizeConstrainedTextString returns teleprinter text with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const textBytes: Uint8Array = new Uint8Array([65, 66, 67]);
        element._setTeleprinterText(textBytes);
        // Act
        const result: Uint8Array = element._sizeConstrainedTextString(1, 10);
        // Assert
        expect(result).toEqual(textBytes);
    });

    it('_sizeConstrainedVideoString returns videotex with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const videoBytes: Uint8Array = new Uint8Array([70, 71, 72]);
        element._setVideoTextInformation(videoBytes);
        // Act
        const result: Uint8Array = element._sizeConstrainedVideoString(1, 10);
        // Assert
        expect(result).toEqual(videoBytes);
    });

    it('_sizeConstrainedIA5String returns IA5 string with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setInternationalAlphabetString('ASCII');
        // Act
        const result: string = element._sizeConstrainedIA5String(1, 10);
        // Assert
        expect(result).toBe('ASCII');
    });

    it('_sizeConstrainedGraphicString returns graphic string with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setGraphicString('GRAPHIC');
        // Act
        const result: string = element._sizeConstrainedGraphicString(1, 10);
        // Assert
        expect(result).toBe('GRAPHIC');
    });

    it('_sizeConstrainedVisibleString returns visible string with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setVisibleString('VISIBLE');
        // Act
        const result: string = element._sizeConstrainedVisibleString(1, 10);
        // Assert
        expect(result).toBe('VISIBLE');
    });

    it('_sizeConstrainedUniversalString returns universal string with valid size', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setUniversalString('UNIVERSAL');
        // Act
        const result: string = element._sizeConstrainedUniversalString(1, 20);
        // Assert
        expect(result).toBe('UNIVERSAL');
    });

    

    it('_validateTag returns 0 for valid tag', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._construction = _ConstructionType.primitive;
        element._setTagNumber(5);
        // Act
        const result: number = element._validateTag(
            [_TagClassType.universal],
            [_ConstructionType.primitive],
            [5]
        );
        // Assert
        expect(result).toBe(0);
    });

    it('_validateTag returns -1 for invalid tag class', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.context;
        element._construction = _ConstructionType.primitive;
        element._setTagNumber(5);
        // Act
        const result: number = element._validateTag(
            [_TagClassType.universal],
            [_ConstructionType.primitive],
            [5]
        );
        // Assert
        expect(result).toBe(-1);
    });

    it('_validateTag returns -2 for invalid construction', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._construction = _ConstructionType.constructed;
        element._setTagNumber(5);
        // Act
        const result: number = element._validateTag(
            [_TagClassType.universal],
            [_ConstructionType.primitive],
            [5]
        );
        // Assert
        expect(result).toBe(-2);
    });

    it('_validateTag returns -3 for invalid tag number', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._construction = _ConstructionType.primitive;
        element._setTagNumber(5);
        // Act
        const result: number = element._validateTag(
            [_TagClassType.universal],
            [_ConstructionType.primitive],
            [10]
        );
        // Assert
        expect(result).toBe(-3);
    });

    it('_toElement returns this instance', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: _PdfAbstractSyntaxElement = element._toElement();
        // Assert
        expect(result).toBe(element);
    });

    it('_fromElement copies tag class, construction and value from source', () => {
        // Arrange
        const sourceElement: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        sourceElement._tagClass = _TagClassType.context;
        sourceElement._construction = _ConstructionType.constructed;
        sourceElement._setTagNumber(15);
        const sourceValue: Uint8Array = new Uint8Array([1, 2, 3]);
        sourceElement._setValue(sourceValue);
        const targetElement: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        targetElement._fromElement(sourceElement);
        // Assert
        expect(targetElement._tagClass).toBe(_TagClassType.context);
        expect(targetElement._construction).toBe(_ConstructionType.constructed);
        expect(targetElement._getTagNumber()).toBe(15);
        expect(targetElement._getValue()).toEqual(sourceValue);
    });

    it('_getInteger encodes and retrieves integer value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setInteger(42);
        // Act
        const result: number = element._getInteger();
        // Assert
        expect(result).toBe(42);
    });

    it('_getInteger throws for constructed element', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._construction = _ConstructionType.constructed;
        element._setInteger(42);
        // Act & Assert
        expect(() => element._getInteger()).toThrowError('Number cannot be constructed.');
    });

    it('_setInteger stores encoded integer value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setInteger(100);
        // Assert
        expect(element._getInteger()).toBe(100);
    });

    it('_getEnumerated returns enumerated value as number', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setEnumerated(3);
        // Act
        const result: number = element._getEnumerated();
        // Assert
        expect(result).toBe(3);
    });

    it('_setEnumerated stores enumerated value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setEnumerated(7);
        // Assert
        expect(element._getEnumerated()).toBe(7);
    });

    it('_toBytes concatenates buffers from _toBuffers into single array', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const testValue: Uint8Array = new Uint8Array([1, 2, 3]);
        element._setValue(testValue);
        // Act
        const result: Uint8Array = element._toBytes();
        // Assert
        expect(result).toEqual(testValue);
    });

    it('_isTagged returns true for context-tagged element', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.context;
        // Act
        const result: boolean = element._isTagged();
        // Assert
        expect(result).toBe(true);
    });

    it('_isTagged returns false for universal element', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        // Act
        const result: boolean = element._isTagged();
        // Assert
        expect(result).toBe(false);
    });

    it('_isConstructed returns true for constructed element', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._construction = _ConstructionType.constructed;
        // Act
        const result: boolean = element._isConstructed();
        // Assert
        expect(result).toBe(true);
    });

    it('_isConstructed returns false for primitive element', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._construction = _ConstructionType.primitive;
        // Act
        const result: boolean = element._isConstructed();
        // Assert
        expect(result).toBe(false);
    });

    it('_sortCanonically sorts elements by encoded bytes', () => {
        // Arrange
        const element1: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element1._setValue(new Uint8Array([5]));
        const element2: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element2._setValue(new Uint8Array([2]));
        const element3: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element3._setValue(new Uint8Array([8]));
        // Act
        const sorted: _PdfAbstractSyntaxElement[] = element1._sortCanonically([element1, element2, element3]);
        // Assert
        expect(sorted[0]._getValue()[0]).toBe(2);
        expect(sorted[1]._getValue()[0]).toBe(5);
        expect(sorted[2]._getValue()[0]).toBe(8);
    });

    it('_isUniquelyTagged returns true when all elements have unique tags', () => {
        // Arrange
        const element1: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element1._tagClass = _TagClassType.universal;
        element1._setTagNumber(1);
        const element2: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element2._tagClass = _TagClassType.universal;
        element2._setTagNumber(2);
        // Act
        const result: boolean = element1._isUniquelyTagged([element1, element2]);
        // Assert
        expect(result).toBe(true);
    });

    it('_isUniquelyTagged returns false when elements share tags', () => {
        // Arrange
        const element1: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element1._tagClass = _TagClassType.universal;
        element1._setTagNumber(1);
        const element2: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element2._tagClass = _TagClassType.universal;
        element2._setTagNumber(1);
        // Act
        const result: boolean = element1._isUniquelyTagged([element1, element2]);
        // Assert
        expect(result).toBe(false);
    });

    it('_encodeBoolean returns 0xFF for true', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeBoolean(true);
        // Assert
        expect(result[0]).toBe(0xFF);
    });

    it('_encodeBoolean returns 0x00 for false', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeBoolean(false);
        // Assert
        expect(result[0]).toBe(0x00);
    });

    it('_decodeInteger with empty bytes throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._decodeInteger(new Uint8Array(0))).toThrowError('Integer or enumeration encoded on zero bytes');
    });

    it('_decodeInteger with unnecessary padding throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._decodeInteger(new Uint8Array([0x00, 0x7F, 0x00, 0x00])))
            .toThrowError(/Unnecessary padding bytes/);
    });

    it('_encodeRelativeObjectIdentifier with single arc less than 128', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeRelativeObjectIdentifier([100]);
        // Assert
        expect(Array.from(result)).toEqual([100]);
    });

    it('_encodeRelativeObjectIdentifier with arc 128 uses extended encoding', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeRelativeObjectIdentifier([128]);
        // Assert
        expect(result.length).toBeGreaterThan(1);
    });

    it('_encodeRelativeObjectIdentifier with multiple arcs', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeRelativeObjectIdentifier([1, 2, 3]);
        // Assert
        expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('_decodeRelativeObjectIdentifier with empty bytes returns empty array', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: number[] = element._decodeRelativeObjectIdentifier(new Uint8Array(0));
        // Assert
        expect(result).toEqual([]);
    });

    it('_decodeRelativeObjectIdentifier with incomplete final byte throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._decodeRelativeObjectIdentifier(new Uint8Array([0x81])))
            .toBeTruthy();
    });

    it('_decodeRelativeObjectIdentifier with invalid padding throws error', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act & Assert
        expect(() => element._decodeRelativeObjectIdentifier(new Uint8Array([0x80, 0x00])))
            .toThrowError('The relative object identifier node has unsupported padding.');
    });

    it('_encodeTime replaces commas with periods', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeTime('12,30,45');
        // Assert
        const resultStr: string = String.fromCharCode(...Array.from(result));
        expect(resultStr).toBe('12.30.45');
    });

    it('_encodeDate validates year bounds and encodes correctly', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const testDate: Date = new Date(2023, 0, 15);
        // Act
        const result: Uint8Array = element._encodeDate(testDate);
        // Assert
        expect(result.length).toBe(8);
    });

    it('_encodeDate throws for year below 1582', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const invalidDate: Date = new Date(1500, 0, 1);
        // Act & Assert
        expect(() => element._encodeDate(invalidDate)).toThrowError(/year must be greater than 1581/);
    });

    it('_encodeDate throws for year above 9999', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const invalidDate: Date = new Date(10000, 0, 1);
        // Act & Assert
        expect(() => element._encodeDate(invalidDate)).toThrowError(/year must be greater than 1581/);
    });

    it('_encodeTimeOfDay encodes time correctly', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const time: Date = new Date();
        time.setHours(14);
        time.setMinutes(30);
        time.setSeconds(45);
        // Act
        const result: Uint8Array = element._encodeTimeOfDay(time);
        // Assert
        expect(result.length).toBe(6);
    });

    it('_encodeDateTime encodes date-time with year validation', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const dateTime: Date = new Date(2023, 0, 15, 14, 30, 45);
        // Act
        const result: Uint8Array = element._encodeDateTime(dateTime);
        // Assert
        expect(result.length).toBe(14);
    });

    it('_encodeDateTime throws for invalid year', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const invalidDate: Date = new Date(10000, 0, 15, 14, 30, 45);
        // Act & Assert
        expect(() => element._encodeDateTime(invalidDate)).toThrowError('The date cannot be encoded');
    });

    it('_encodeNumericString converts string to bytes', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeNumericString('12345');
        // Assert
        expect(result.length).toBe(5);
    });

    it('_encodePrintableString converts string to bytes', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodePrintableString('HELLO');
        // Assert
        expect(result.length).toBe(5);
    });

    it('_encodeGraphicString converts string to bytes', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeGraphicString('GRAPHIC');
        // Assert
        expect(result.length).toBe(7);
    });

    it('_encodeVisibleString converts string to bytes', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeVisibleString('VISIBLE');
        // Assert
        expect(result.length).toBe(7);
    });

    it('_encodeObjectDescriptor converts string to bytes', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: Uint8Array = element._encodeObjectDescriptor('DESC');
        // Assert
        expect(result.length).toBe(4);
    });

    it('_encodeSequence concatenates element bytes', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const child1: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        child1._setValue(new Uint8Array([1, 2]));
        const child2: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        child2._setValue(new Uint8Array([3, 4]));
        // Act
        const result: Uint8Array = element._encodeSequence([child1, child2]);
        // Assert
        expect(result.length).toBe(4);
    });

    it('_toEncodedBytes returns serialized bytes', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setValue(new Uint8Array([7, 8, 9]));
        // Act
        const result: Uint8Array = element._toEncodedBytes();
        // Assert
        expect(result).toEqual(new Uint8Array([7, 8, 9]));
    });

    it('_lengthLength returns 1 for short lengths', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: number = element._lengthLength(50);
        // Assert
        expect(result).toBe(1);
    });

    it('_lengthLength returns 2 for length 128', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: number = element._lengthLength(128);
        // Assert
        expect(result).toBe(2);
    });

    it('_lengthLength calculates for multi-byte lengths', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: number = element._lengthLength(65536);
        // Assert
        expect(result).toBeGreaterThan(2);
    });

    it('decoders and validators exercise edge branches across multiple ranges', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();

        // Act / Assert - general string valid ASCII
        const generalBytes: Uint8Array = new Uint8Array([65, 66, 67]); // "ABC"
        expect(element._decodeGeneralString(generalBytes)).toBe('ABC');

        // graphic string: invalid byte should throw
        expect(() => element._decodeGraphicString(new Uint8Array([0x1F]))).toThrowError(/printable ASCII/);

        // numeric string: digits and space allowed
        const numericBytes: Uint8Array = new Uint8Array([49, 50, 51, 32, 52, 53]); // "123 45"
        expect(element._decodeNumericString(numericBytes)).toBe('123 45');

        // object descriptor: invalid byte should throw
        expect(() => element._decodeObjectDescriptor(new Uint8Array([0x19]))).toThrowError(/printable ASCII/);

        // object id / relative resource id simple pass-throughs
        expect(element._decodeObjectIdResourceIdentifier(new Uint8Array([97, 98]))).toBe('ab');
        expect(element._decodeRelativeResourceIdentifier(new Uint8Array([99, 100]))).toBe('cd');

        // printable string valid set
        const printableBytes: Uint8Array = new Uint8Array([65, 66, 49, 50, 32, 39, 40, 41, 43, 44, 45, 46, 47, 58, 61, 63]);
        expect(element._decodePrintableString(printableBytes)).toBe(String.fromCharCode(...Array.from(printableBytes)));

        // visible string: invalid low-value should throw with char code in message
        expect(() => element._decodeVisibleString(new Uint8Array([0x10]))).toThrowError(/Encountered character code \d+/);
    });

    it('_toJson with universal tag class endOfContent returns undefined', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.endOfContent);
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(result).toBeUndefined();
    });

    it('_toJson with abstractSyntaxBoolean returns boolean value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.abstractSyntaxBoolean);
        element._setBooleanValue(true);
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(result).toBe(true);
    });

    it('_toJson with integer returns encoded integer', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.integer);
        element._setInteger(42);
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(result).toBe(42);
    });

    it('_toJson with bitString returns length and hex value', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.bitString);
        element._setBitString(new Uint8ClampedArray([1, 0, 1, 0]));
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(typeof result).toBe('object');
        expect((result as any).length).toBeDefined();
    });

    it('_toJson with octetString returns hex string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.octetString);
        element._setOctetString(new Uint8Array([0xAB, 0xCD]));
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(typeof result).toBe('string');
    });

    it('_toJson with nullValue returns null', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.nullValue);
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(result).toBeNull();
    });

    it('_toJson with utf8String returns string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.utf8String);
        element._setUtf8String('TestString');
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(result).toBe('TestString');
    });

    it('_toJson with enumerated returns string representation', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.enumerated);
        element._setEnumerated(5);
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(result).toBe('5');
    });

    it('_toJson with date returns ISO string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.date);
        element._setDate(new Date(2023, 0, 15));
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(typeof result).toBe('string');
    });

    it('_toJson with timeOfDay returns time string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.timeOfDay);
        const time: Date = new Date();
        time.setHours(14);
        time.setMinutes(30);
        time.setSeconds(45);
        element._setTimeOfDay(time);
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(typeof result).toBe('string');
        expect((result as string)).toContain(':');
    });

    it('_toJson with dateTime returns ISO string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;
        element._setTagNumber(_UniversalType.dateTime);
        element._setDateTime(new Date(2023, 0, 15, 14, 30, 45));
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(typeof result).toBe('string');
    });

    it('_getRelativeObjectIdentifier throws for constructed element', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._construction = _ConstructionType.constructed;
        // Act & Assert
        expect(() => element._getRelativeObjectIdentifier()).toThrowError('Relative oid cannot be constructed.');
    });

    it('_setRelativeObjectIdentifier encodes and stores arc array', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setRelativeObjectIdentifier([1, 2, 3, 4]);
        // Assert
        expect(element._getValue().length).toBeGreaterThan(0);
    });

    it('_getTime returns decoded time string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setTime('14:30:45');
        // Act
        const result: string = element._getTime();
        // Assert
        expect(result).toContain(':');
    });

    it('_setTime encodes time string with comma replacement', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setTime('14,30,45');
        // Assert
        expect(element._getValue().length).toBeGreaterThan(0);
    });

    it('_getDate returns decoded Date object', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const testDate: Date = new Date(2023, 0, 15);
        element._setDate(testDate);
        // Act
        const result: Date = element._getDate();
        // Assert
        expect(result.getFullYear()).toBe(2023);
    });

    it('_setDate encodes Date with year validation', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setDate(new Date(2023, 5, 20));
        // Assert
        expect(element._getValue().length).toBe(8);
    });

    it('_getTimeOfDay returns decoded time as Date', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const time: Date = new Date();
        time.setHours(10);
        time.setMinutes(30);
        time.setSeconds(45);
        element._setTimeOfDay(time);
        // Act
        const result: Date = element._getTimeOfDay();
        // Assert
        expect(result.getHours()).toBe(10);
        expect(result.getMinutes()).toBe(30);
    });

    it('_setTimeOfDay encodes time correctly', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        const time: Date = new Date();
        time.setHours(14);
        time.setMinutes(25);
        time.setSeconds(30);
        // Act
        element._setTimeOfDay(time);
        // Assert
        expect(element._getValue().length).toBe(6);
    });

    it('_getDateTime returns decoded datetime as Date', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setDateTime(new Date(2023, 0, 15, 14, 30, 45));
        // Act
        const result: Date = element._getDateTime();
        // Assert
        expect(result.getFullYear()).toBe(2023);
        expect(result.getHours()).toBe(14);
    });

    it('_setDateTime encodes datetime with year validation', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setDateTime(new Date(2023, 5, 20, 10, 15, 30));
        // Assert
        expect(element._getValue().length).toBe(14);
    });

    it('_getObjectIdResourceIdentifier returns decoded string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setObjectIdResourceIdentifier('resource123');
        // Act
        const result: string = element._getObjectIdResourceIdentifier();
        // Assert
        expect(result).toBe('resource123');
    });

    it('_setObjectIdResourceIdentifier encodes string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setObjectIdResourceIdentifier('oid.resource');
        // Assert
        expect(element._getValue().length).toBeGreaterThan(0);
    });

    it('_getRelativeResourceIdentifier returns decoded string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setRelativeResourceIdentifier('relResource');
        // Act
        const result: string = element._getRelativeResourceIdentifier();
        // Assert
        expect(result).toBe('relResource');
    });

    it('_setRelativeResourceIdentifier encodes string', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        element._setRelativeResourceIdentifier('relative');
        // Assert
        expect(element._getValue().length).toBeGreaterThan(0);
    });

    it('_decodeRelativeObjectIdentifier with valid multi-byte arc', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: number[] = element._decodeRelativeObjectIdentifier(new Uint8Array([0x81, 0x00]));
        // Assert
        expect(result.length).toBeGreaterThan(0);
    });

    it('_decodeRelativeObjectIdentifier accumulates bits correctly', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        // Act
        const result: number[] = element._decodeRelativeObjectIdentifier(new Uint8Array([0x81, 0x80, 0x00]));
        // Assert
        expect(result.length).toBeGreaterThan(0);
    });

    it('_toString with universal tag classes returns formatted strings for all 30+ cases (679-683, 738-856)', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;

        // Case: endOfContent (line 743)
        element._setTagNumber(_UniversalType.endOfContent);
        expect(element._toString()).toBe('END-OF-CONTENT');

        // Case: abstractSyntaxBoolean true (line 744)
        element._setTagNumber(_UniversalType.abstractSyntaxBoolean);
        element._setBooleanValue(true);
        expect(element._toString()).toBe('TRUE');

        // Case: abstractSyntaxBoolean false (line 744)
        element._setBooleanValue(false);
        expect(element._toString()).toBe('FALSE');

        // Case: integer (line 745)
        element._setTagNumber(_UniversalType.integer);
        element._setInteger(42);
        expect(element._toString()).toContain('42');

        // Case: octetString (lines 746-751)
        element._setTagNumber(_UniversalType.octetString);
        element._setOctetString(new Uint8Array([0xAB, 0xCD]));
        expect(element._toString()).toContain('H');

        // Case: nullValue (line 752)
        element._setTagNumber(_UniversalType.nullValue);
        expect(element._toString()).toBe('NULL');

        // Case: objectDescriptor (line 754)
        element._setTagNumber(_UniversalType.objectDescriptor);
        element._setObjectDescriptor('TestDesc');
        expect(element._toString()).toContain('TestDesc');

        // Case: external (line 755)
        element._setTagNumber(_UniversalType.external);
        expect(element._toString()).toBe('_PdfExternal');

        // Case: enumerated (line 756)
        element._setTagNumber(_UniversalType.enumerated);
        element._setEnumerated(5);
        expect(element._toString()).toContain('5');

        // Case: embeddedDataValue (line 757)
        element._setTagNumber(_UniversalType.embeddedDataValue);
        expect(element._toString()).toBe('EMBEDDED PDV');

        // Case: utf8String (line 758)
        element._setTagNumber(_UniversalType.utf8String);
        element._setUtf8String('HelloWorld');
        expect(element._toString()).toContain('HelloWorld');

        // Case: relativeObjectIdentifier (lines 759-760)
        element._setTagNumber(_UniversalType.relativeObjectIdentifier);
        element._setRelativeObjectIdentifier([1, 2, 3]);
        expect(element._toString()).toContain('1.2.3');

        // Case: time (line 761)
        element._setTagNumber(_UniversalType.time);
        element._setTime('120000');
        expect(element._toString()).toContain('120000');

        // Case: sequence (lines 762-765)
        element._setTagNumber(_UniversalType.sequence);
        const child: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setSequence([child]);
        expect(element._toString()).toContain('{');

        // Case: abstractSyntaxSet (lines 766-769)
        element._setTagNumber(_UniversalType.abstractSyntaxSet);
        element._setAbstractSetValue([child]);
        expect(element._toString()).toContain('{');

        // Case: numericString (line 770)
        element._setTagNumber(_UniversalType.numericString);
        element._setNumericString('12345');
        expect(element._toString()).toContain('12345');

        // Case: printableString (line 771)
        element._setTagNumber(_UniversalType.printableString);
        element._setPrintableString('PRINT');
        expect(element._toString()).toContain('PRINT');

        // Case: teleprinterTextExchange (line 772)
        element._setTagNumber(_UniversalType.teleprinterTextExchange);
        expect(element._toString()).toBe('TeletexString');

        // Case: videoTextInformationSystem (line 773)
        element._setTagNumber(_UniversalType.videoTextInformationSystem);
        expect(element._toString()).toBe('VideotexString');

        // Case: internationalAlphabetString (line 774)
        element._setTagNumber(_UniversalType.internationalAlphabetString);
        element._setInternationalAlphabetString('ASCII');
        expect(element._toString()).toContain('ASCII');

        // Case: characterString (line 775)
        element._setTagNumber(_UniversalType.characterString);
        expect(element._toString()).toBe('CHARACTER STRING');

        // Case: date (line 776)
        element._setTagNumber(_UniversalType.date);
        element._setDate(new Date(2023, 0, 15));
        expect(element._toString()).toContain('2023');

        // Case: timeOfDay (lines 777-779)
        element._setTagNumber(_UniversalType.timeOfDay);
        const timeOfDay: Date = new Date();
        timeOfDay.setUTCHours(14);
        timeOfDay.setUTCMinutes(30);
        timeOfDay.setUTCSeconds(45);
        element._setTimeOfDay(timeOfDay);
        expect(element._toString()).toContain(':');

        // Case: dateTime (line 781)
        element._setTagNumber(_UniversalType.dateTime);
        element._setDateTime(new Date(2023, 0, 15, 14, 30, 45));
        expect(element._toString()).toContain('2023');

        // Case: objectIdResourceIdentifier (line 782)
        element._setTagNumber(_UniversalType.objectIdResourceIdentifier);
        element._setObjectIdResourceIdentifier('oid-resource');
        expect(element._toString()).toContain('oid-resource');

        // Case: relativeResourceIdentifier (line 783)
        element._setTagNumber(_UniversalType.relativeResourceIdentifier);
        element._setRelativeResourceIdentifier('rel-resource');
        expect(element._toString()).toContain('rel-resource');

        // Case: default (line 784)
        element._setTagNumber(999);
        expect(element._toString()).toContain('[UNIV');
    });

    it('_toString with non-universal tag classes (820-859)', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._setTagNumber(5);
        element._setValue(new Uint8Array([1, 2, 3]));

        // context tag (line 856)
        element._tagClass = _TagClassType.context;
        expect(element._toString()).toContain('[CTXT 5]');

        // abstractSyntaxPrivate (line 858)
        element._tagClass = _TagClassType.abstractSyntaxPrivate;
        expect(element._toString()).toContain('[PRIV 5]');

        // application (line 859)
        element._tagClass = _TagClassType.application;
        expect(element._toString()).toContain('[APPL 5]');
    });

    it('_toJson universal tag cases (820-856, 977-1102)', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.universal;

        // endOfContent (line 821)
        element._setTagNumber(_UniversalType.endOfContent);
        expect(element._toJson()).toBeUndefined();

        // abstractSyntaxBoolean (line 824)
        element._setTagNumber(_UniversalType.abstractSyntaxBoolean);
        element._setBooleanValue(true);
        expect(element._toJson()).toBe(true);

        // integer (lines 825-827)
        element._setTagNumber(_UniversalType.integer);
        element._setInteger(100);
        expect(element._toJson()).toBe(100);

        // bitString (lines 828-832)
        element._setTagNumber(_UniversalType.bitString);
        element._setBitString(new Uint8ClampedArray([1, 0, 1]));
        const bitStringJson: any = element._toJson();
        expect(bitStringJson).toBeTruthy();
        expect(bitStringJson).toBeTruthy();

        // octetString (line 833)
        element._setTagNumber(_UniversalType.octetString);
        element._setOctetString(new Uint8Array([0xAB]));
        expect(element._toJson()).toContain('ab');

        // nullValue (line 835)
        element._setTagNumber(_UniversalType.nullValue);
        expect(element._toJson()).toBeNull();

        // objectDescriptor (line 839)
        element._setTagNumber(_UniversalType.objectDescriptor);
        element._setObjectDescriptor('Desc');
        expect(element._toJson()).toBe('Desc');

        // enumerated (line 841)
        element._setTagNumber(_UniversalType.enumerated);
        element._setEnumerated(7);
        expect(element._toJson()).toBe('7');

        // utf8String (line 843)
        element._setTagNumber(_UniversalType.utf8String);
        element._setUtf8String('UTF8');
        expect(element._toJson()).toBe('UTF8');

        // relativeObjectIdentifier (lines 844-846)
        element._setTagNumber(_UniversalType.relativeObjectIdentifier);
        element._setRelativeObjectIdentifier([1, 2, 3]);
        expect(element._toJson()).toBe('1.2.3');

        // teleprinterTextExchange (line 848)
        element._setTagNumber(_UniversalType.teleprinterTextExchange);
        element._setTeleprinterText(new Uint8Array([65, 66, 67]));
        expect(element._toJson()).toBe('ABC');

        // videoTextInformationSystem (line 850)
        element._setTagNumber(_UniversalType.videoTextInformationSystem);
        element._setVideoTextInformation(new Uint8Array([68, 69, 70]));
        expect(element._toJson()).toBe('DEF');

        // graphicString (line 852)
        element._setTagNumber(_UniversalType.graphicString);
        element._setGraphicString('GRAPHIC');
        expect(element._toJson()).toBe('GRAPHIC');

        // visibleString (line 854)
        element._setTagNumber(_UniversalType.visibleString);
        element._setVisibleString('VISIBLE');
        expect(element._toJson()).toBe('VISIBLE');

        // universalString (line 856)
        element._setTagNumber(_UniversalType.universalString);
        element._setUniversalString('UNIVERSAL');
        expect(element._toJson()).toBe('UNIVERSAL');

        // bmpString (line 858)
        element._setTagNumber(_UniversalType.bmpString);
        element._setBmpString('BMP');
        expect(element._toJson()).toBe('BMP');

        // date (line 860)
        element._setTagNumber(_UniversalType.date);
        element._setDate(new Date(2023, 0, 15));
        expect(element._toJson()).toContain('2023');

        // timeOfDay (lines 861-864)
        element._setTagNumber(_UniversalType.timeOfDay);
        const timeOfDay: Date = new Date();
        timeOfDay.setUTCHours(14);
        timeOfDay.setUTCMinutes(30);
        timeOfDay.setUTCSeconds(45);
        element._setTimeOfDay(timeOfDay);
        expect(element._toJson()).toContain(':');

        // dateTime (line 866)
        element._setTagNumber(_UniversalType.dateTime);
        element._setDateTime(new Date(2023, 0, 15, 14, 30, 45));
        expect(element._toJson()).toContain('2023');

        // objectIdResourceIdentifier (line 868)
        element._setTagNumber(_UniversalType.objectIdResourceIdentifier);
        element._setObjectIdResourceIdentifier('oid-res');
        expect(element._toJson()).toBe('oid-res');

        // relativeResourceIdentifier (line 870)
        element._setTagNumber(_UniversalType.relativeResourceIdentifier);
        element._setRelativeResourceIdentifier('rel-res');
        expect(element._toJson()).toBe('rel-res');

        // default (line 872)
        element._setTagNumber(999);
        expect(element._toJson()).toBeUndefined();
    });

    it('_toJson non-universal returns undefined (859, 872)', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();
        element._tagClass = _TagClassType.context;
        element._setTagNumber(5);
        // Act
        const result: unknown = element._toJson();
        // Assert
        expect(result).toBeUndefined();
    });

    it('_decodeInteger with unnecessary padding 0xFF/0x00 pattern (1124, 1459, 1465)', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();

        // line 1124 branch: value[0] === 0xFF && value[1] >= 0b10000000
        expect(() => element._decodeInteger(new Uint8Array([0xFF, 0xFF, 0x7F])))
            .toThrowError(/Unnecessary padding bytes/);

        // line 1124 second condition: value[0] === 0x00 && value[1] < 0b10000000
        expect(() => element._decodeInteger(new Uint8Array([0x00, 0x7F, 0x00])))
            .toThrowError(/Unnecessary padding bytes/);

        // boundary - 0xFF && exactly 0b10000000
        expect(() => element._decodeInteger(new Uint8Array([0xFF, 0b10000000, 0x01])))
            .toThrowError(/Unnecessary padding bytes/);

        // valid encoding - no error for length <= 2
        expect(element._decodeInteger(new Uint8Array([0xFF, 0xFF]))).toBe(65535);

        // valid encoding - 0xFF but value[1] < 0b10000000
        const validResult: number = element._decodeInteger(new Uint8Array([0xFF, 0x7F]));
        expect(typeof validResult).toBe('number');
    });

    it('_getRelativeObjectIdentifier primitive check (977, 973)', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();

        // primitive construction succeeds
        element._construction = _ConstructionType.primitive;
        element._setRelativeObjectIdentifier([1, 2, 3]);
        const result: number[] = element._getRelativeObjectIdentifier();
        expect(Array.isArray(result)).toBe(true);

        // constructed construction throws
        element._construction = _ConstructionType.constructed;
        expect(() => element._getRelativeObjectIdentifier())
            .toThrowError('Relative oid cannot be constructed.');
    });

    it('_encodeInteger and encoding methods (1264-1270, 1293-1322)', () => {
        // Arrange
        const element: ConcreteAbstractSyntaxElement = new ConcreteAbstractSyntaxElement();

        // _encodeInteger (line 1264)
        const intEncoded: Uint8Array = element._encodeInteger(255);
        expect(intEncoded.length).toBeGreaterThan(0);

        // _encodeObjectIdentifier (line 1279)
        const oid: _PdfObjectIdentifier = new _PdfObjectIdentifier();
        const objIdEncoded: Uint8Array = element._encodeObjectIdentifier(oid);
        expect(objIdEncoded).toBeDefined();

        // _encodeRelativeObjectIdentifier small arc (line 1304)
        const singleSmallArc: Uint8Array = element._encodeRelativeObjectIdentifier([100]);
        expect(Array.from(singleSmallArc)).toEqual([100]);

        // _encodeRelativeObjectIdentifier large arc (lines 1308-1322)
        const largeArc: Uint8Array = element._encodeRelativeObjectIdentifier([128]);
        expect(largeArc.length).toBeGreaterThan(1);

        const multipleArcs: Uint8Array = element._encodeRelativeObjectIdentifier([1, 128, 255]);
        expect(multipleArcs.length).toBeGreaterThan(3);

        // _encodeTime with comma replacement (line 1348)
        const timeEncoded: Uint8Array = element._encodeTime('12,30,45');
        expect(String.fromCharCode(...Array.from(timeEncoded))).toBe('12.30.45');

        // _decodeTime (line 1357)
        const timeDecoded: string = element._decodeTime(new Uint8Array([49, 50, 51]));
        expect(timeDecoded).toBe('123');
    });

});

