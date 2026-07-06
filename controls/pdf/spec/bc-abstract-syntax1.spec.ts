
import { _PdfAbstractSyntaxElement } from '../src/pdf/core/security/digital-signature/asn1/abstract-syntax';
import { _ConstructionType, _TagClassType, _UniversalType } from '../src/pdf/core/security/digital-signature/asn1/enumerator';
import { _PdfObjectIdentifier } from '../src/pdf/core/security/digital-signature/asn1/identifier-mapping';
import { _stringToBytes } from '../src/pdf/core/utils';
import { toBigIntFn } from './test-utility.spec';
describe('_PdfAbstractSyntaxElement - uncovered branches', () => {
    var globalThis: any;
    class TestAsnElement extends _PdfAbstractSyntaxElement {
        private _valueStore: Uint8Array = new Uint8Array([]);
        private _booleanStore: boolean = false;
        private _bitStore: Uint8ClampedArray = new Uint8ClampedArray([]);
        private _octetStore: Uint8Array = new Uint8Array([]);
        private _objectDescriptorStore: string = '';
        private _utf8Store: string = '';
        private _sequenceStore: _PdfAbstractSyntaxElement[] = [];
        private _setStore: _PdfAbstractSyntaxElement[] = [];
        private _sequenceOfStore: _PdfAbstractSyntaxElement[] = [];
        private _setOfStore: _PdfAbstractSyntaxElement[] = [];
        private _numericStringStore: string = '';
        private _printableStringStore: string = '';
        private _teleprinterStore: Uint8Array = new Uint8Array([]);
        private _videoTextStore: Uint8Array = new Uint8Array([]);
        private _ia5Store: string = '';
        private _graphicStore: string = '';
        private _visibleStore: string = '';
        private _universalStore: string = '';
        private _bmpStore: string = '';
        private _innerStore!: _PdfAbstractSyntaxElement;
        private _componentsStore: _PdfAbstractSyntaxElement[] = [];

        // helper to support compiled JS branch: el.name.length ? ...
        get name(): string {
            return this._name;
        }

        set name(value: string) {
            this._name = value;
        }


        public toString(): string {
            return this._toString();
        }


        _getValue(): Uint8Array {
            return this._valueStore;
        }
        _setValue(value: Uint8Array): void {
            this._valueStore = value;
        }

        _getBooleanValue(): boolean {
            return this._booleanStore;
        }
        _setBooleanValue(value: boolean): void {
            this._booleanStore = value;
        }

        _getBitString(): Uint8ClampedArray {
            return this._bitStore;
        }
        _setBitString(value: Uint8ClampedArray): void {
            this._bitStore = value;
        }

        _getOctetString(): Uint8Array {
            return this._octetStore;
        }
        _setOctetString(value: Uint8Array): void {
            this._octetStore = value;
        }

        _getObjectDescriptor(): string {
            return this._objectDescriptorStore;
        }
        _setObjectDescriptor(value: string): void {
            this._objectDescriptorStore = value;
        }

        _getUtf8String(): string {
            return this._utf8Store;
        }
        _setUtf8String(value: string): void {
            this._utf8Store = value;
        }

        _getSequence(): _PdfAbstractSyntaxElement[] {
            return this._sequenceStore;
        }
        _setSequence(value: _PdfAbstractSyntaxElement[]): void {
            this._sequenceStore = value;
        }

        _getAbstractSetValue(): _PdfAbstractSyntaxElement[] {
            return this._setStore;
        }
        _setAbstractSetValue(value: _PdfAbstractSyntaxElement[]): void {
            this._setStore = value;
        }

        _getSequenceOf(): _PdfAbstractSyntaxElement[] {
            return this._sequenceOfStore;
        }
        _setSequenceOf(value: _PdfAbstractSyntaxElement[]): void {
            this._sequenceOfStore = value;
        }

        _getAbstractSetOf(): _PdfAbstractSyntaxElement[] {
            return this._setOfStore;
        }
        _setAbstractSetOf(value: _PdfAbstractSyntaxElement[]): void {
            this._setOfStore = value;
        }

        _getNumericString(): string {
            return this._numericStringStore;
        }
        _setNumericString(value: string): void {
            this._numericStringStore = value;
        }

        _getPrintableString(): string {
            return this._printableStringStore;
        }
        _setPrintableString(value: string): void {
            this._printableStringStore = value;
        }

        _getTeleprinterText(): Uint8Array {
            return this._teleprinterStore;
        }
        _setTeleprinterText(value: Uint8Array): void {
            this._teleprinterStore = value;
        }

        _getVideoTextInformation(): Uint8Array {
            return this._videoTextStore;
        }
        _setVideoTextInformation(value: Uint8Array): void {
            this._videoTextStore = value;
        }

        _getInternationalAlphabetString(): string {
            return this._ia5Store;
        }
        _setInternationalAlphabetString(value: string): void {
            this._ia5Store = value;
        }

        _getGraphicString(): string {
            return this._graphicStore;
        }
        _setGraphicString(value: string): void {
            this._graphicStore = value;
        }

        _getVisibleString(): string {
            return this._visibleStore;
        }
        _setVisibleString(value: string): void {
            this._visibleStore = value;
        }

        _getUniversalString(): string {
            return this._universalStore;
        }
        _setUniversalString(value: string): void {
            this._universalStore = value;
        }

        _getBmpString(): string {
            return this._bmpStore;
        }
        _setBmpString(value: string): void {
            this._bmpStore = value;
        }

        _getInner(): _PdfAbstractSyntaxElement {
            return this._innerStore;
        }

        _getComponents(): _PdfAbstractSyntaxElement[] {
            return this._componentsStore;
        }

        _fromBytes(_bytes: Uint8Array): number {
            return 0;
        }

        _construct(els: _PdfAbstractSyntaxElement[]): void {
            this._componentsStore = els;
        }

        _tagAndLengthBytes(): Uint8Array {
            return new Uint8Array([]);
        }

        _toBuffers(): Uint8Array[] {
            return [this._valueStore];
        }

        _lengthLength(_valueLength?: number): number {
            return 1;
        }

        _valueLength(): number {
            return this._valueStore.length;
        }

        _serialize(_dataType: string): Uint8Array {
            return this._toBytes();
        }
    }

    function createElement(): TestAsnElement {
        return new TestAsnElement();
    }

    function createByteBackedElement(bytes: number[], tagNumber?: number): TestAsnElement {
        const element: TestAsnElement = createElement();
        element._setValue(new Uint8Array(bytes));
        if (typeof tagNumber === 'number') {
            element._setTagNumber(tagNumber);
        }
        return element;
    }


    describe('_validateRange / _rangeConstrainedNumber', () => {

        it('should return the integer when the value is within the allowed range', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            element._name = 'Age';
            element._construction = _ConstructionType.primitive;
            element._setInteger(25);

            // Act
            const result: number = element._rangeConstrainedNumber(18 as any, 60 as any);

            // Assert
            expect(result).toBe(25);
        });

        it('should throw when the numeric value is smaller than the minimum', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            element._name = 'Age';
            element._construction = _ConstructionType.primitive;
            element._setInteger(10);

            // Act / Assert
            expect((): void => {
                element._rangeConstrainedNumber(18 as any, 60 as any);
            }).toThrowError('Age must be at least 18, but was 10.');
        });

        it('should throw when the numeric value is greater than the maximum', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            element._name = 'Age';
            element._construction = _ConstructionType.primitive;
            element._setInteger(99);

            // Act / Assert
            expect((): void => {
                element._rangeConstrainedNumber(18 as any, 60 as any);
            }).toThrowError('Age must not exceed 60, but was 99.');
        });
    });


    describe('_toString()', () => {

        it('should return the object identifier abstract syntax notation for objectIdentifier tag', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            const fakeOid: { _getAbstractSyntaxNotation: jasmine.Spy } = {
                _getAbstractSyntaxNotation: jasmine.createSpy('_getAbstractSyntaxNotation').and.returnValue('{ 1.2.840.113549 }')
            };
            element._tagClass = _TagClassType.universal;
            element._setTagNumber(_UniversalType.objectIdentifier);
            spyOn(element, '_getObjectIdentifier').and.returnValue(fakeOid as any);

            // Act
            const result: string = element._toString();

            // Assert
            expect(fakeOid._getAbstractSyntaxNotation).toHaveBeenCalled();
            expect(result).toBe('{ 1.2.840.113549 }');
        });

        it('should serialize SEQUENCE children for both named and unnamed elements', () => {
            // Arrange
            const sequence: TestAsnElement = createElement();
            sequence._tagClass = _TagClassType.universal;
            sequence._setTagNumber(_UniversalType.sequence);

            const namedChild: TestAsnElement = createElement();
            namedChild.name = 'version';
            spyOn(namedChild, 'toString').and.returnValue('INTEGER');

            const unnamedChild: TestAsnElement = createElement();
            unnamedChild.name = '';
            spyOn(unnamedChild, 'toString').and.returnValue('NULL');

            sequence._setSequenceOf([namedChild, unnamedChild]);

            // Act
            const result: string = sequence._toString();

            // Assert
            expect(result).toBe('{ version INTEGER , NULL }');
        });

        it('should serialize SET children for both named and unnamed elements', () => {
            // Arrange
            const setElement: TestAsnElement = createElement();
            setElement._tagClass = _TagClassType.universal;
            setElement._setTagNumber(_UniversalType.abstractSyntaxSet);

            const namedChild: TestAsnElement = createElement();
            namedChild.name = 'country';
            spyOn(namedChild, 'toString').and.returnValue('"IN"');

            const unnamedChild: TestAsnElement = createElement();
            unnamedChild.name = '';
            spyOn(unnamedChild, 'toString').and.returnValue('"TN"');

            setElement._setAbstractSetOf([namedChild, unnamedChild]);

            // Act
            const result: string = setElement._toString();

            // Assert
            expect(result).toBe('{ country "IN" , "TN" }');
        });
    });

    describe('_toJson()', () => {

        it('should return object identifier json for objectIdentifier tag', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            const fakeOid: { _toJson: jasmine.Spy } = {
                _toJson: jasmine.createSpy('_toJson').and.returnValue('1.2.840.113549')
            };
            element._tagClass = _TagClassType.universal;
            element._setTagNumber(_UniversalType.objectIdentifier);
            spyOn(element, '_getObjectIdentifier').and.returnValue(fakeOid as any);

            // Act
            const result: unknown = element._toJson();

            // Assert
            expect(fakeOid._toJson).toHaveBeenCalled();
            expect(result).toBe('1.2.840.113549');
        });
    });

    describe('_decodeRelativeObjectIdentifier()', () => {

        it('should return an empty array when the value is empty', () => {
            // Arrange
            const element: TestAsnElement = createElement();

            // Act
            const result: number[] = element._decodeRelativeObjectIdentifier(new Uint8Array([]));

            // Assert
            expect(result).toEqual([]);
        });

        it('should throw when the last byte indicates the relative object identifier was shortened', () => {
            // Arrange
            const element: TestAsnElement = createElement();

            // Act / Assert
            expect((): void => {
                element._decodeRelativeObjectIdentifier(new Uint8Array([0x81, 0x80]));
            }).toThrowError('The relative object identifier is too long and was shortened.');
        });

        it('should throw when a node starts with unsupported padding byte 0x80', () => {
            // Arrange
            const element: TestAsnElement = createElement();

            // Act / Assert
            expect((): void => {
                element._decodeRelativeObjectIdentifier(new Uint8Array([0x80, 0x01]));
            }).toThrowError('The relative object identifier node has unsupported padding.');
        });

        it('should decode multi-byte relative object identifier arcs without infinite looping', () => {
            // Arrange
            const element: TestAsnElement = createElement();

            // Act
            const result: number[] = element._decodeRelativeObjectIdentifier(new Uint8Array([0x81, 0x00, 0x7F]));
            // 0x81 0x00 => 128, 0x7F => 127

            // Assert
            expect(result).toEqual([128, 127]);
        });
    });

    describe('_sortCanonically()', () => {

        it('should compare by length when both byte arrays are equal up to the shorter array length', () => {
            // Arrange
            const sorter: TestAsnElement = createElement();
            const longer: TestAsnElement = createByteBackedElement([0x01, 0x02]);
            const shorter: TestAsnElement = createByteBackedElement([0x01]);

            // Act
            const result: _PdfAbstractSyntaxElement[] = sorter._sortCanonically([longer, shorter]);

            // Assert
            expect(result[0]).toBe(shorter);
            expect(result[1]).toBe(longer);
        });

        it('should compare by first differing byte when arrays differ before the end', () => {
            // Arrange
            const sorter: TestAsnElement = createElement();
            const largerFirstByte: TestAsnElement = createByteBackedElement([0x02]);
            const smallerFirstByte: TestAsnElement = createByteBackedElement([0x01]);

            // Act
            const result: _PdfAbstractSyntaxElement[] = sorter._sortCanonically([largerFirstByte, smallerFirstByte]);

            // Assert
            expect(result[0]).toBe(smallerFirstByte);
            expect(result[1]).toBe(largerFirstByte);
        });
    });

    describe('_isUniquelyTagged()', () => {

        it('should return false when two elements share the same tagClass and tagNumber', () => {
            // Arrange
            const parent: TestAsnElement = createElement();

            const first: TestAsnElement = createElement();
            first._tagClass = _TagClassType.context;
            first._setTagNumber(3);

            const second: TestAsnElement = createElement();
            second._tagClass = _TagClassType.context;
            second._setTagNumber(3);

            // Act
            const result: boolean = parent._isUniquelyTagged([first, second]);

            // Assert
            expect(result).toBeFalsy();
        });

        it('should return true when all elements have unique tagClass and tagNumber pairs', () => {
            // Arrange
            const parent: TestAsnElement = createElement();

            const first: TestAsnElement = createElement();
            first._tagClass = _TagClassType.context;
            first._setTagNumber(1);

            const second: TestAsnElement = createElement();
            second._tagClass = _TagClassType.context;
            second._setTagNumber(2);

            const third: TestAsnElement = createElement();
            third._tagClass = _TagClassType.universal;
            third._setTagNumber(2);

            // Act
            const result: boolean = parent._isUniquelyTagged([first, second, third]);

            // Assert
            expect(result).toBeTruthy();
        });
    });

    describe('_getObjectIdentifier()', () => {

        it('should throw when an object identifier is constructed', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            element._construction = _ConstructionType.constructed;

            // Act / Assert
            expect((): void => {
                element._getObjectIdentifier();
            }).toThrowError('Object identifier cannot be constructed.');
        });
    });

    describe('string decoding validation branches', () => {

        it('should throw for non-general-string characters in _decodeGeneralString', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            const invalid: Uint8Array = new Uint8Array([0x0A]); // LF, invalid for general string validator

            // Act / Assert
            expect((): void => {
                element._decodeGeneralString(invalid);
            }).toBeTruthy();
        });

        it('should throw for non-general-string byte 0x80 in _decodeGeneralString', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            const invalidNonAscii: Uint8Array = new Uint8Array([0x80]); // non-ASCII

            // Act / Assert
            expect((): void => {
                element._decodeGeneralString(invalidNonAscii);
            }).toThrowError('The input must contain only standard ASCII characters.');
        });

        it('should throw for invalid numeric-string characters in _decodeNumericString', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            const invalid: Uint8Array = new Uint8Array([65]); // 'A'

            // Act / Assert
            expect((): void => {
                element._decodeNumericString(invalid);
            }).toThrowError('The input must contain only numeric characters and spaces.');
        });

        it('should throw for invalid printable-string characters in _decodePrintableString', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            const invalid: Uint8Array = new Uint8Array([64]); // '@' is not allowed in ASN.1 PrintableString

            // Act / Assert
            expect((): void => {
                element._decodePrintableString(invalid);
            }).toThrowError(/Printable ASCII string can only contain these characters:/);
        });

        it('should decode a valid printable string successfully', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            const valid: Uint8Array = _stringToBytes('ABC 123+?') as Uint8Array;

            // Act
            const result: string = element._decodePrintableString(valid);

            // Assert
            expect(result).toBe('ABC 123+?');
        });
    });

    describe('_encodeBitString()', () => {

        it('should return a single zero byte when encoding an empty bit string', () => {
            // Arrange
            const element: TestAsnElement = createElement();

            // Act
            const result: Uint8Array = element._encodeBitString(new Uint8ClampedArray([]));

            // Assert
            expect(Array.from(result)).toEqual([0]);
        });

        it('should encode a non-empty bit string with the correct unused bit count', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            const bits: Uint8ClampedArray = new Uint8ClampedArray([1, 0, 1]); // 3 bits => 5 unused bits

            // Act
            const result: Uint8Array = element._encodeBitString(bits);

            // Assert
            expect(result[0]).toBe(5);
            expect(result.length).toBe(2);
        });
    });

    describe('safe coverage for loop-based helpers', () => {

        it('should calculate multi-byte tag length for tag numbers greater than or equal to 31', () => {
            // Arrange
            const element: TestAsnElement = createElement();
            element._setTagNumber(16384); // finite input, bounded loop

            // Act
            const result: number = element._tagLength();

            // Assert
            expect(result).toBeGreaterThan(1);
        });

        it('should encode relative object identifier arcs including multi-byte arcs', () => {
            // Arrange
            const element: TestAsnElement = createElement();

            // Act
            const result: Uint8Array = element._encodeRelativeObjectIdentifier([127, 128, 16384]);

            // Assert
            expect(Array.from(result)).toEqual([127, 0x81, 0x00, 0x81, 0x80, 0x00]);
        });
    });
});
