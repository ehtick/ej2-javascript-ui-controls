
import { PdfPage } from '@syncfusion/ej2-pdf/src/pdf/core/pdf-page';
import { _ImageStructure } from '../../src/pdf-data-extract/core/image-extraction/image-structure';
import { ImageFormat } from '../../src/pdf-data-extract/core/enum';
import { _PdfDictionary, _PdfReference } from '@syncfusion/ej2-pdf/src/pdf/core/pdf-primitives';
import { _PdfBaseStream, _PdfCrossReference } from '@syncfusion/ej2-pdf';



describe('_ImageStructure', () => {
    class _MockDictionary {
        private _values: Map<string, unknown>;
        private _rawValues: Map<string, unknown>;


        constructor(values: Record<string, unknown>, rawValues?: Record<string, unknown>) {
            this._values = new Map<string, unknown>();
            this._rawValues = new Map<string, unknown>();

            for (const key in values) {
                if (Object.prototype.hasOwnProperty.call(values, key)) {
                    this._values.set(key, values[key]);
                }
            }

            const actualRawValues: Record<string, unknown> = rawValues ? rawValues : values;
            for (const key in actualRawValues) {
                if (Object.prototype.hasOwnProperty.call(actualRawValues, key)) {
                    this._rawValues.set(key, actualRawValues[key]);
                }
            }
        }

        has(key: string): boolean {
            return this._values.has(key);
        }

        get(key: string): unknown {
            return this._values.get(key);
        }

        getRaw(key: string): unknown {
            return this._rawValues.get(key);
        }
    }
    it('should initialize width, height, mask flags, interpolate flag, references and png format when mask-related keys are present', () => {
        // Arrange
        const maskReference: _PdfReference = { objectNumber: 11, generationNumber: 0 } as _PdfReference;
        const softMaskReference: _PdfReference = { objectNumber: 22, generationNumber: 0 } as _PdfReference;

        const hardMaskValue: { name: string } = { name: 'HardMaskValue' };
        const softMaskValue: { name: string } = { name: 'SoftMaskValue' };

        const dictionary: _PdfDictionary = new _MockDictionary(
            {
                Width: 640,
                Height: 480,
                Mask: hardMaskValue,
                ImageMask: true,
                SMask: softMaskValue,
                isImageInterpolate: true
            },
            {
                Mask: maskReference,
                SMask: softMaskReference
            }
        ) as unknown as _PdfDictionary;

        const stream: _PdfBaseStream = {
            dictionary
        } as _PdfBaseStream;

        const crossReference: _PdfCrossReference = {} as _PdfCrossReference;
        const page: PdfPage = {
            _pageIndex: 3
        } as PdfPage;

        // Act
        const imageStructure: _ImageStructure = new _ImageStructure(stream, crossReference, page);

        // Assert
        expect(imageStructure._stream).toBe(stream);
        expect(imageStructure._crossReference).toBe(crossReference);
        expect(imageStructure._pageIndex).toBe(3);

        expect(imageStructure._width).toBe(640);
        expect(imageStructure._height).toBe(480);

        expect(imageStructure._isImageMasked).toBeTruthy();
        expect(imageStructure._isSoftMasked).toBeTruthy();
        expect(imageStructure._isImageMask).toBeTruthy();
        expect(imageStructure._isImageInterpolated).toBeTruthy();

        expect(imageStructure._maskReference).toBe(maskReference);
        expect(imageStructure._smaskReference).toBe(softMaskReference);

        // The implementation stores Mask into _smask first, then overwrites _smask with SMask.
        expect(imageStructure._smask).toBe(softMaskValue);

        expect(imageStructure._imageFormat).toBe(ImageFormat.png);
    });

    it('should initialize jpeg format and keep optional properties undefined when mask-related keys are absent', () => {
        // Arrange
        const dictionary: _PdfDictionary = new _MockDictionary({}) as unknown as _PdfDictionary;

        const stream: _PdfBaseStream = {
            dictionary
        } as _PdfBaseStream;

        const crossReference: _PdfCrossReference = {} as _PdfCrossReference;
        const page: PdfPage = {
            _pageIndex: 0
        } as PdfPage;

        // Act
        const imageStructure: _ImageStructure = new _ImageStructure(stream, crossReference, page);

        // Assert
        expect(imageStructure._stream).toBe(stream);
        expect(imageStructure._crossReference).toBe(crossReference);
        expect(imageStructure._pageIndex).toBe(0);

        expect(imageStructure._width).toBeUndefined();
        expect(imageStructure._height).toBeUndefined();

        expect(imageStructure._isImageMasked).toBeFalsy();
        expect(imageStructure._isSoftMasked).toBeFalsy();
        expect(imageStructure._isImageMask).toBeFalsy();
        expect(imageStructure._isImageInterpolated).toBeFalsy();

        expect(imageStructure._smask).toBeUndefined();
        expect(imageStructure._maskReference).toBeUndefined();
        expect(imageStructure._smaskReference).toBeUndefined();

        expect(imageStructure._imageFormat).toBe(ImageFormat.jpeg);
    });
});
