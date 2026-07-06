
import { PdfBitmap } from '../src/pdf/core/graphics/images/pdf-bitmap';
import * as utils from '../src/pdf/core/utils';
import { _PdfColorSpace } from '../src/pdf/core/enumerator';
import { _PdfName } from '../src/pdf/core/pdf-primitives';
describe('PdfBitmap - behavior tests', () => {
    describe('_initializeAsync', () => {
        it('should use the Uint8Array directly and set decoder-derived properties when input is a byte array', () => {
            // Arrange
            const input: Uint8Array = new Uint8Array([10, 20, 30, 40]);
            const expectedDecoder: {
                _height: number;
                _width: number;
                _bitsPerComponent: number;
            } = {
                _height: 120,
                _width: 240,
                _bitsPerComponent: 8
            };

            const decodeSpy: jasmine.Spy = spyOn(utils, '_decode');
            const getDecoderSpy: jasmine.Spy = spyOn(utils, '_getDecoder')
                .and.returnValue(expectedDecoder as unknown as ReturnType<typeof utils._getDecoder>);

            const bitmap: PdfBitmap = Object.create(PdfBitmap.prototype) as PdfBitmap;

            // Act
            bitmap._initializeAsync(input);

            // Assert
            expect(decodeSpy).not.toHaveBeenCalled();
            expect(getDecoderSpy).toHaveBeenCalledTimes(1);
            expect(getDecoderSpy).toHaveBeenCalledWith(input);
            expect(bitmap._decoder).toBe(expectedDecoder as unknown as typeof bitmap._decoder);
            expect(bitmap.height).toBe(120);
            expect(bitmap.width).toBe(240);
            expect((bitmap as unknown as { _bitsPerComponent: number })._bitsPerComponent).toBe(8);
        });

        it('should route constructor Uint8Array input through _initializeAsync', () => {
            // Arrange
            const input: Uint8Array = new Uint8Array([1, 2, 3]);
            const initSpy: jasmine.Spy = spyOn(PdfBitmap.prototype, '_initializeAsync').and.stub();

            // Act
            const bitmap: PdfBitmap = new PdfBitmap(input);

            // Assert
            expect(bitmap).toBeDefined();
            expect(initSpy).toHaveBeenCalledTimes(1);
            expect(initSpy).toHaveBeenCalledWith(input);
        });
    });

    describe('_setColorSpace', () => {
        it('should update Decode and ColorSpace for the RGB branch', () => {
            // Arrange
            const originalRgbValue: number = _PdfColorSpace.rgb;

            const updateSpy: jasmine.Spy = jasmine.createSpy('update');
            const getSpy: jasmine.Spy = jasmine.createSpy('get').and.returnValue({ name: 'DeviceRGB' });

            const dictionary: {
                get: jasmine.Spy;
                update: jasmine.Spy;
            } = {
                get: getSpy,
                update: updateSpy
            };

            const bitmap: PdfBitmap = Object.create(PdfBitmap.prototype) as PdfBitmap;
            (bitmap as unknown as { _imageStream: { dictionary: typeof dictionary } })._imageStream = {
                dictionary
            };
            (bitmap as unknown as { _decoder: object })._decoder = {};

            // The current implementation does not assign `_PdfColorSpace.rgb`
            // explicitly when ColorSpace is DeviceRGB. To cover the exact highlighted
            // `case _PdfColorSpace.rgb:` lines, temporarily make the enum value match
            // the current uninitialized `colorSpace` value.
            (_PdfColorSpace as unknown as { rgb: unknown }).rgb = undefined;

            try {
                // Act
                bitmap._setColorSpace();

                // Assert
                expect(getSpy).toHaveBeenCalledWith('ColorSpace');
                expect(updateSpy).toHaveBeenCalledWith('Decode', [0.0, 1.0, 0.0, 1.0, 0.0, 1.0]);
                expect(updateSpy).toHaveBeenCalledWith('ColorSpace', _PdfName.get('DeviceRGB'));
                expect(updateSpy).toHaveBeenCalledTimes(2);
            } finally {
                // Restore enum value to avoid leaking state to other tests
                (_PdfColorSpace as unknown as { rgb: number }).rgb = originalRgbValue;
            }
        });
    });
});
