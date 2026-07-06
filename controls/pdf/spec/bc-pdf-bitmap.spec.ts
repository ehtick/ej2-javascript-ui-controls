import { PdfBitmap } from '../src/pdf/core/graphics/images/pdf-bitmap';
import * as utils from '../src/pdf/core/utils';
import { _PngDecoder } from '../src/pdf/core/graphics/images/png-decoder';
import { PdfImage } from '../src/pdf/core/graphics/images/pdf-image';

describe('PdfBitmap behavior tests', () => {

    it('initializes from base64 string and sets dimensions', () => {
        // Arrange
        const decodeSpy = spyOn(utils, '_decode').and.returnValue(new Uint8Array([1, 2, 3]));
        const mockDecoder: any = { _height: 11, _width: 22, _bitsPerComponent: 8 };
        const getDecoderSpy = spyOn(utils, '_getDecoder').and.returnValue(mockDecoder);

        // Act
        const bmp = new PdfBitmap('AAA');

        // Assert
        expect(decodeSpy).toBeDefined();
        expect(getDecoderSpy).toHaveBeenCalled();
        expect((bmp as any).height).toBe(11);
        expect((bmp as any).width).toBe(22);
        expect((bmp as any)._bitsPerComponent).toBe(8);
    });

    it('initializes from Uint8Array and sets dimensions', () => {
        // Arrange
        const array = new Uint8Array([1, 2, 3, 4]);
        const mockDecoder: any = { _height: 5, _width: 6, _bitsPerComponent: 4 };
        spyOn(utils, '_getDecoder').and.returnValue(mockDecoder);

        // Act
        const bmp = new PdfBitmap(array);

        // Assert
        expect((bmp as any).height).toBe(5);
        expect((bmp as any).width).toBe(6);
        expect((bmp as any)._bitsPerComponent).toBe(4);
    });

    it('save() with non-PNG decoder applies CMYK and Gray branches', () => {
        // Arrange
        const updates: any[] = [];
        const dict: any = {
            get: (k: string) => ({ name: 'DeviceCMYK' }),
            update: (k: string, v: any) => updates.push({ k, v })
        };
        const stream: any = { dictionary: dict };
        const decoder: any = { _getImageDictionary: () => stream };
        const bmp: any = Object.create(PdfBitmap.prototype);
        bmp._decoder = decoder;

        // Act
        PdfBitmap.prototype._save.call(bmp);

        // Assert CMYK
        expect(updates.length).toBeGreaterThan(0);
        expect(updates.some(u => u.k === 'ColorSpace')).toBeTruthy();

        // Now test DeviceGray
        updates.length = 0;
        dict.get = () => ({ name: 'DeviceGray' });
        PdfBitmap.prototype._setColorSpace.call(bmp);
        expect(updates.some(u => u.k === 'ColorSpace')).toBeTruthy();
    });

    it('save() with PNG decoder uses maskStream and indexed color-space when present', () => {
        // Arrange
        const updates: any[] = [];
        const dict: any = {
            get: (k: string) => ({ name: 'Some' }),
            update: (k: string, v: any) => updates.push({ k, v })
        };
        const stream: any = { dictionary: dict };
        const pngMock: any = Object.create(_PngDecoder.prototype);
        pngMock._getImageDictionary = () => stream;
        pngMock._maskStream = { masked: true };
        pngMock._isDecode = true;
        pngMock._colorSpace = ['IndexedCS'];

        const bmp: any = Object.create(PdfBitmap.prototype);
        bmp._decoder = pngMock;

        // Act
        PdfBitmap.prototype._save.call(bmp);

        // Assert
        expect((bmp as any)._maskStream).toBeDefined();
        expect(updates.some(u => u.k === 'ColorSpace')).toBeTruthy();
    });

    it('save() with PNG decoder and _isDecode true but no _colorSpace does not set indexed', () => {
        // Arrange
        const updates: any[] = [];
        const dict: any = {
            get: (k: string) => ({ name: 'Some' }),
            update: (k: string, v: any) => updates.push({ k, v })
        };
        const stream: any = { dictionary: dict };
        const pngMock: any = Object.create(_PngDecoder.prototype);
        pngMock._getImageDictionary = () => stream;
        pngMock._maskStream = { masked: true };
        pngMock._isDecode = true;
        pngMock._colorSpace = undefined;

        const bmp: any = Object.create(PdfBitmap.prototype);
        bmp._decoder = pngMock;

        // Act
        PdfBitmap.prototype._save.call(bmp);

        // Assert
        expect((bmp as any)._maskStream).toBeDefined();
        expect(updates.some(u => u.k === 'ColorSpace')).toBeFalsy();
    });
    

});
// ...existing code...

