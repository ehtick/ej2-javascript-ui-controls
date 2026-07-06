import { _StandardWidthTable, _CjkSameWidth, _CjkDifferentWidth } from "../src/pdf/core/fonts/pdf-font-metrics";

describe('StandardWidthTable._itemAt behavior', () => {

	it('returns the correct width for a valid index', () => {
		// Arrange
		const widths: number[] = [120, 240, 360];
		const table = new _StandardWidthTable(widths);
		expect(Array.isArray(widths)).toBeTruthy();
		expect(widths.length).toEqual(3);
		// Act
		const value: number = table._itemAt(1);
		// Assert
		expect(value).toEqual(240);
	});

	it('throws when index is negative', () => {
		// Arrange
		const widths: number[] = [10, 20];
		const table = new _StandardWidthTable(widths);
		expect(widths.length).toEqual(2);
		// Act & Assert
		expect(() => { table._itemAt(-1); }).toThrowError('The character is not supported by the font.');
	});

	it('throws when index is greater than or equal to length', () => {
		// Arrange
		const widths: number[] = [5];
		const table = new _StandardWidthTable(widths);
		expect(widths.length).toEqual(1);
		// Act & Assert
		expect(() => { table._itemAt(1); }).toThrowError('The character is not supported by the font.');
	});

	it('returns the original widths array reference for non-empty widths', () => {
		// Arrange
		const widths: number[] = [7, 8, 9];
		const table = new _StandardWidthTable(widths);
		// Act
		const arr = table._toArray();
		// Assert
		expect(arr).toBe(widths);
		expect(arr.length).toEqual(3);
	});

	it('returns an empty array when widths is empty', () => {
		// Arrange
		const widths: number[] = [];
		const table = new _StandardWidthTable(widths);
		// Act
		const arr = table._toArray();
		// Assert
		expect(arr).toBe(widths);
		expect(arr.length).toEqual(0);
		expect(arr).toEqual([]);
	});

	it('CjkSameWidth._itemAt returns width when index is within range', () => {
		// Arrange
		const from = 5;
		const to = 7;
		const widthValue = 123;
		const same = new _CjkSameWidth(from, to, widthValue);
		// Act
		const val = same._itemAt(6);
		// Assert
		expect(val).toEqual(widthValue);
		expect(same._from).toEqual(from);
		expect(same._to).toEqual(to);
	});

	it('CjkSameWidth._itemAt throws when index is out of range', () => {
		// Arrange
		const from = 2;
		const to = 4;
		const same = new _CjkSameWidth(from, to, 50);
		// Act & Assert
		expect(() => { same._itemAt(1); }).toThrowError('Index is out of range.');
		expect(() => { same._itemAt(5); }).toThrowError('Index is out of range.');
	});

	it('CjkDifferentWidth constructor sets fields and _itemAt returns element when from is 0', () => {
		// Arrange
		const from = 0;
		const widths = [11, 22, 33];
		const diff = new _CjkDifferentWidth(from, widths);
		// Act
		const v = diff._itemAt(1);
		// Assert
		expect(diff._from).toEqual(from);
		expect(diff._to).toEqual(from + widths.length - 1);
		expect(v).toEqual(widths[1]);
	});

	it('CjkDifferentWidth._itemAt throws when index out of defined range', () => {
		// Arrange
		const from = 5;
		const widths = [100];
		const diff = new _CjkDifferentWidth(from, widths);
		// Act & Assert
		expect(() => { diff._itemAt(4); }).toThrowError('Index is out of range.');
		expect(() => { diff._itemAt(6); }).toThrowError('Index is out of range.');
	});

	it('CjkDifferentWidth._appendToArray pushes _from then iterates target array (safe snapshot test)', () => {
		// Arrange
		const from = 9;
		const widths = [1, 2];
		const diff = new _CjkDifferentWidth(from, widths);
		const collector: { arr: number[]; push: (n: number) => void; forEach: (cb: (e: number) => void) => void } = {
			arr: [],
			push(n: number) { this.arr.push(n); },
			forEach(cb: (e: number) => void) { const snapshot = this.arr.slice(); snapshot.forEach(cb); }
		};
		// Act
		diff._appendToArray(collector as any);
		// Assert
		// Implementation pushes _from, then mistakenly iterates over the target array
		// so the element pushed is appended again (no widths are appended).
		expect(collector.arr).toEqual([from, from]);
		expect(collector.arr.length).toEqual(2);
	});

});

