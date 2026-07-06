
import { _PdfPaddings } from '../src/pdf/core/annotations/pdf-paddings';

describe('_PdfPaddings', () => {
    it('should set 0.5 for all padding values when no arguments are provided', () => {
        // Arrange

        // Act
        const paddings: _PdfPaddings = new _PdfPaddings();

        // Assert
        expect(paddings._left).toBe(0.5);
        expect(paddings._right).toBe(0.5);
        expect(paddings._top).toBe(0.5);
        expect(paddings._bottom).toBe(0.5);
    });

    it('should set the passed left, top, right and bottom values', () => {
        // Arrange

        // Act
        const paddings: _PdfPaddings = new _PdfPaddings(10, 20, 30, 40);

        // Assert
        expect(paddings._left).toBe(10);
        expect(paddings._top).toBe(20);
        expect(paddings._right).toBe(30);
        expect(paddings._bottom).toBe(40);
    });
});
