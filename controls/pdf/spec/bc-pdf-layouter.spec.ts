import { PdfLayoutFormat } from '../src/pdf/core/graphics/pdf-layouter';
import { PdfLayoutType, PdfLayoutBreakType } from '../src/pdf/core/enumerator';
import { PdfLayoutResult } from '../src/pdf/core/graphics/pdf-layouter';
import { Rectangle } from '../src/pdf/core/pdf-type';
import { PdfPage } from '../src/pdf/core/pdf-page';

describe('PdfLayoutFormat constructor behavior', () => {

	it('constructor without format sets default layout, break and bound flag', () => {
		// Arrange
		const format: PdfLayoutFormat = new PdfLayoutFormat();

		// Act
		const layoutValue = format.layout;
		const breakValue = format.break;
		const usePaginate = format.usePaginateBounds;

		// Assert
		expect(layoutValue).toEqual(PdfLayoutType.paginate);
		expect(breakValue).toEqual(PdfLayoutBreakType.fitPage);
		expect(usePaginate).toBeFalsy();
	});

	it('constructor with format copies provided properties and sets paginate bounds flag', () => {
		// Arrange
		const mockFormat: any = {
			layout: PdfLayoutType.onePage,
			break: PdfLayoutBreakType.fitElement,
			paginateBounds: { x: 1, y: 2, width: 3, height: 4 },
			_boundSet: true
		};

		// Act
		const format: PdfLayoutFormat = new PdfLayoutFormat(mockFormat as PdfLayoutFormat);

		// Assert
		expect(format.layout).toEqual(PdfLayoutType.onePage);
		expect(format.break).toEqual(PdfLayoutBreakType.fitElement);
		expect(format.paginateBounds).toEqual({ x: 1, y: 2, width: 3, height: 4 });
		expect(format.usePaginateBounds).toBeTruthy();
	});

});


describe('PdfLayoutResult - else branch for remainingText (line 365)', () => {
    const bounds: Rectangle = { x: 0, y: 0, width: 100, height: 100 };

    it('should NOT set _remainingText when remainingText is null', () => {
        const page = null as unknown as PdfPage;
        const result = new PdfLayoutResult(page, bounds, undefined, null);
        expect((result as any)._remainingText).toBeUndefined();
    });

    it('should NOT set _remainingText when remainingText is the string "undefined"', () => {
        const page = null as unknown as PdfPage;
        const result = new PdfLayoutResult(page, bounds, undefined, 'undefined');
        expect((result as any)._remainingText).toBeUndefined();
    });
});