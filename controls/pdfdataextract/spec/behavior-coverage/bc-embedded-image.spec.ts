
import { Rectangle, Size } from '@syncfusion/ej2-pdf';
import { ImageFormat } from '../../src/pdf-data-extract/core/enum';
import { PdfEmbeddedImage } from '../../src/pdf-data-extract/core/image-extraction/pdf-embedded-image';

describe('PdfEmbeddedImage', () => {
    it('should cover default _data initialization and data getter', () => {
        // Arrange
        const imageInfo: PdfEmbeddedImage = new PdfEmbeddedImage();

        // Act
        const data: Uint8Array = imageInfo.data;

        // Assert
        expect(data instanceof Uint8Array).toBeTruthy();
        expect(data.length).toBe(0);
        expect(imageInfo._data instanceof Uint8Array).toBeTruthy();
        expect(imageInfo._data.length).toBe(0);
    });

    it('should cover all getters by returning the assigned internal fields', () => {
        // Arrange
        const imageInfo: PdfEmbeddedImage = new PdfEmbeddedImage();

        const expectedData: Uint8Array = new Uint8Array([10, 20, 30, 40]);
        const expectedType: ImageFormat = ImageFormat.png;
        const expectedResourceName: string = 'Im1';
        const expectedPhysicalDimension: Size = { width: 640, height: 480 } as Size;
        const expectedPageIndex: number = 3;
        const expectedIndex: number = 7;
        const expectedBounds: Rectangle = { x: 10, y: 20, width: 200, height: 100 } as Rectangle;
        const expectedIsImageInterpolated: boolean = true;
        const expectedIsImageMasked: boolean = true;
        const expectedIsSoftMasked: boolean = false;

        imageInfo._data = expectedData;
        imageInfo._type = expectedType;
        imageInfo._resourceName = expectedResourceName;
        imageInfo._physicalDimension = expectedPhysicalDimension;
        imageInfo._pageIndex = expectedPageIndex;
        imageInfo._index = expectedIndex;
        imageInfo._bounds = expectedBounds;
        imageInfo._isImageInterpolated = expectedIsImageInterpolated;
        imageInfo._isImageMasked = expectedIsImageMasked;
        imageInfo._isSoftMasked = expectedIsSoftMasked;

        // Act
        const actualData: Uint8Array = imageInfo.data;
        const actualType: ImageFormat = imageInfo.type;
        const actualResourceName: string = imageInfo.resourceName;
        const actualPhysicalDimension: Size = imageInfo.physicalDimension;
        const actualPageIndex: number = imageInfo.pageIndex;
        const actualIndex: number = imageInfo.index;
        const actualBounds: Rectangle = imageInfo.bounds;
        const actualIsImageInterpolated: boolean = imageInfo.isImageInterpolated;
        const actualIsImageMasked: boolean = imageInfo.isImageMasked;
        const actualIsSoftMasked: boolean = imageInfo.isSoftMasked;

        // Assert
        expect(actualData).toBe(expectedData);
        expect(actualData).toEqual(new Uint8Array([10, 20, 30, 40]));

        expect(actualType).toBe(expectedType);

        expect(actualResourceName).toBe(expectedResourceName);

        expect(actualPhysicalDimension).toBe(expectedPhysicalDimension);
        expect(actualPhysicalDimension.width).toBe(640);
        expect(actualPhysicalDimension.height).toBe(480);

        expect(actualPageIndex).toBe(expectedPageIndex);
        expect(actualIndex).toBe(expectedIndex);

        expect(actualBounds).toBe(expectedBounds);
        expect(actualBounds.x).toBe(10);
        expect(actualBounds.y).toBe(20);
        expect(actualBounds.width).toBe(200);
        expect(actualBounds.height).toBe(100);

        expect(actualIsImageInterpolated).toBeTruthy();
        expect(actualIsImageMasked).toBeTruthy();
        expect(actualIsSoftMasked).toBeFalsy();
    });
});
