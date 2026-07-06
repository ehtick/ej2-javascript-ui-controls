import { _PdfReader, _PdfBitReader, _PdfContextCache, _PdfDecodingContext, _PdfSimpleSegmentVisitor } from '../src/pdf/core/graphics/images/jbig2-image';
import { _PdfFaxDecoder } from '../src/pdf/core/graphics/images/pdf-fax-decoder';

describe('jbig2-image helpers and fax-decoder tests', () => {
	
	it('PdfReader _readBit throws on premature end-of-input after consumption', () => {
		// Arrange
		const data = new Uint8Array([0x80]); // 10000000
		const reader = new _PdfReader(data, 0, data.length);

		// Act & Assert - read exactly 8 bits then expect an error when reading past end
		for (let i = 0; i < 8; i++) {
			const bit = reader._readBit();
			expect(bit === 0 || bit === 1).toBeTruthy();
		}
		expect(() => reader._readBit()).toThrow();
	});

	it('PdfBitReader _readBits returns 0 for length 0 and composes bits correctly', () => {
		// Arrange
		const sequence: number[] = [1, 0, 1, 1, 0];
		let callIndex = 0;
		const decoder = {
			_readBit(contexts: any, state: any) {
				return sequence[callIndex++ % sequence.length];
			}
		};
		const bitReader = new _PdfBitReader();

		// Act
		const zeroLen = (bitReader as any)._readBits(0, decoder, {});
		const fiveBits = (bitReader as any)._readBits(5, decoder, {}); // should read 1,0,1,1,0 -> 0b10110 = 22

		// Assert
		expect(zeroLen).toBe(0);
		expect(fiveBits).toBe(0b10110);
	});

	it('PdfContextCache caches and returns the same Int8Array instance for repeated ids', () => {
		// Arrange
		const cache = new _PdfContextCache();

		// Act
		const ctxA1 = cache.getContexts('A');
		const ctxA2 = cache.getContexts('A');
		const ctxB = cache.getContexts('B');

		// Assert
		expect(ctxA1).toBeDefined();
		expect(ctxA2).toBeDefined();
		expect(ctxB).toBeDefined();
		expect(ctxA1).toBe(ctxA2); // same reference for same id
		expect(ctxA1).not.toBe(ctxB);
		expect(ctxA1.length).toBeGreaterThan(0);
	});

	it('_onPageInformation allocates buffer and honors defaultPixelValue', () => {

		// Arrange
		const visitor = new (_PdfSimpleSegmentVisitor as any)();
		const info = [{ width: 8, height: 2, combinationOperator: 0 }];

		// Act (no defaultPixelValue)
		visitor._onPageInformation(info);

		// Assert
		expect(visitor._currentPageInfo).toBe(info);
		expect(visitor._buffer.length).toBe(((8 + 7) >> 3) * 2);

		// Act (with defaultPixelValue truthy)
		const visitor2 = new (_PdfSimpleSegmentVisitor as any)();
		const info2: any = [{ width: 9, height: 1, combinationOperator: 0 }];
		info2.defaultPixelValue = 1;
		visitor2._onPageInformation(info2);

		// Assert buffer filled with 0xff when defaultPixelValue is set
		expect(visitor2._buffer.every((b: number) => b === 0xff)).toBeTruthy();
	});

	it('_drawBitmap applies operator 0 (OR), operator 2 (XOR), supports override and throws on unsupported operator', () => {
		// Arrange
		const visitor = new (_PdfSimpleSegmentVisitor as any)();
		// set page info: width = 8 (one byte per row), height irrelevant here
		visitor._currentPageInfo = [{ width: 8, height: 4, combinationOperator: 0 }];
		visitor._buffer = new Uint8ClampedArray(((8 + 7) >> 3) * 4);

		const regionInfo = { x: 0, y: 0, width: 4, height: 1, combinationOperator: 0 };
		const bitmap = [new Uint8Array([1, 0, 1, 1])];

		// Act: operator 0 (OR)
		visitor._drawBitmap(regionInfo, bitmap);

		// Assert: bits set in first byte  from left MSB: bits 0..3 are 1,0,1,1 => mask 128,64,32,16 -> sum 128+32+16=176
		expect(visitor._buffer[0]).toBe(176);

		// Act: operator 2 (XOR) with same bitmap should toggle bits
		visitor._currentPageInfo[0].combinationOperator = 2;
		visitor._drawBitmap(regionInfo, bitmap);
		// After XOR with same bits, buffer should be back to 0
		expect(visitor._buffer[0]).toBe(0);

		// Act: override uses regionInfo.combinationOperator when override flag set
		visitor._currentPageInfo[0].combinationOperatorOverride = true;
		const regionInfo2 = { x: 0, y: 0, width: 2, height: 1, combinationOperator: 0 };
		visitor._drawBitmap(regionInfo2, [new Uint8Array([1, 1])]);
		expect(visitor._buffer[0] & 192).toBeGreaterThan(0); // masks 128 + 64

		// Unsupported operator should throw
		visitor._currentPageInfo[0].combinationOperatorOverride = false;
		visitor._currentPageInfo[0].combinationOperator = 99;
		expect(() => visitor._drawBitmap(regionInfo, bitmap)).toThrow();
	});

	it('PdfDecodingContext exposes decoder and contextCache getters', () => {
		// Arrange
		const data = new Uint8Array([1, 2, 3]);
		const ctx = new _PdfDecodingContext(data, 0, data.length);

		// Act
		const decoder = ctx.decoder;
		const contextCache = ctx.contextCache;

		// Assert
		expect(decoder).toBeDefined();
		expect(contextCache).toBeDefined();
		expect(typeof (contextCache as any).getContexts).toBe('function');
	});

});

