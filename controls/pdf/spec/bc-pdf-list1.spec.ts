
// import { PdfListMarkerAlignment, PdfLayoutType, PdfNumberStyle, PdfTextAlignment, PdfUnorderedListStyle } from '../src/pdf/core/enumerator';
// import { _PdfStringLayoutResult, _PdfStringLayouter } from '../src/pdf/core/fonts/string-layouter';
// import { PdfFont, PdfFontFamily, PdfStandardFont } from '../src/pdf/core/fonts/pdf-standard-font';
// import { PdfStringFormat } from '../src/pdf/core/fonts/pdf-string-format';
// import { PdfBrush, PdfGraphics, PdfPen } from '../src/pdf/core/graphics/pdf-graphics';
// import { PdfLayoutResult, PdfLayoutFormat, _PdfLayoutParameters } from '../src/pdf/core/graphics/pdf-layouter';
// import { PdfPage } from '../src/pdf/core/pdf-page';
// import { PdfListItem, PdfListItemCollection } from '../src/pdf/core/list/pdf-list-item';
// import { PdfDocument } from '../src/pdf/core/pdf-document';
// import { Rectangle } from '../src/pdf/core/pdf-type';
// import { PdfOrderedList, PdfUnorderedList, _PdfListInfo, _PdfListLayouter } from '../src/pdf/core/list/pdf-list';

// describe('pdf-list.ts coverage tests', () => {
//     let document: PdfDocument;
//     let page: PdfPage;
//     let graphics: PdfGraphics;

//     function createOrderedList(values?: string[]): PdfOrderedList {
//         const items: PdfListItemCollection = new PdfListItemCollection(values || ['One', 'Two', 'Three']);
//         const list: PdfOrderedList = new PdfOrderedList(items, {
//             font: new PdfStandardFont(PdfFontFamily.helvetica, 10),
//             brush: new PdfBrush({ r: 0, g: 0, b: 0 }),
//             pen: new PdfPen({ r: 0, g: 0, b: 0 }, 1)
//         });
//         return list;
//     }

//     function createUnorderedList(values?: string[]): PdfUnorderedList {
//         const items: PdfListItemCollection = new PdfListItemCollection(values || ['One', 'Two', 'Three']);
//         const list: PdfUnorderedList = new PdfUnorderedList(items, {
//             font: new PdfStandardFont(PdfFontFamily.helvetica, 10),
//             brush: new PdfBrush({ r: 0, g: 0, b: 0 }),
//             pen: new PdfPen({ r: 0, g: 0, b: 0 }, 1),
//             style: PdfUnorderedListStyle.disk
//         });
//         return list;
//     }

//     function fakeLayoutResult(
//         width: number,
//         height: number,
//         remainder?: string,
//         empty?: boolean
//     ): _PdfStringLayoutResult {
//         return {
//             _actualSize: { width, height },
//             _size: { width, height },
//             _remainder: remainder || '',
//             _empty: !!empty
//         } as unknown as _PdfStringLayoutResult;
//     }

//     function createPageResult(): any {
//         return {
//             broken: false,
//             markerWrote: false,
//             markerWidth: 0,
//             markerX: 0,
//             itemText: undefined,
//             markerText: undefined,
//             y: 0
//         };
//     }

//     beforeEach(() => {
//         document = new PdfDocument();
//         page = document.addPage();
//         graphics = page.graphics;
//     });

//     afterEach(() => {
//         if (document) {
//             document.destroy();
//         }
//     });

//     it('covers _drawItem first throw branch when available width is not enough for list layout', () => {
//         const list: PdfOrderedList = createOrderedList(['A']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._currentPage = page;
//         (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
//         (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
//         (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
//         (layouter as any)._currentFormat = new PdfStringFormat(PdfTextAlignment.left);
//         (layouter as any)._size = [0, 100];

//         expect(() => {
//             (layouter as any)._drawItem(
//                 createPageResult(),
//                 0,
//                 list,
//                 0,
//                 10,
//                 [],
//                 item,
//                 0,
//                 0
//             );
//         }).toThrowError('There is not enough space to layout list.');
//     });

//     it('covers markerResult null else branch and broken-state else assignments without unhandled failure', () => {
//         const list: PdfUnorderedList = createUnorderedList(['Marker-less item']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);
//         const pageResult: any = createPageResult();

//         pageResult.broken = true;
//         pageResult.itemText = 'Marker-less item';
//         pageResult.markerText = 'continued-marker';

//         list._size = [12, 18];

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._currentPage = page;
//         (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
//         (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
//         (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
//         (layouter as any)._currentFormat = new PdfStringFormat(PdfTextAlignment.left);
//         (layouter as any)._size = [50, 5];

//         spyOn<any>(layouter, '_createMarkerResult').and.returnValue(null);

//         const result = (layouter as any)._drawItem(
//             pageResult,
//             0,
//             list,
//             0,
//             10,
//             [],
//             item,
//             0,
//             0
//         );

//         expect(result.pageResult.broken).toBeTruthy();
//         expect(result.pageResult.itemText).toBe(item.text);
//         expect(result.pageResult.markerText).toBeUndefined();
//     });

//     it('covers second throw branch when marker width leaves no room for item text', () => {
//         const list: PdfOrderedList = createOrderedList(['A']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._currentPage = page;
//         (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
//         (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
//         (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
//         (layouter as any)._currentFormat = new PdfStringFormat(PdfTextAlignment.left);
//         (layouter as any)._size = [15, 100];
//         (layouter as any)._markerMaxWidth = 14;

//         spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(14, 8, '', false));

//         expect(() => {
//             (layouter as any)._drawItem(
//                 createPageResult(),
//                 0,
//                 list,
//                 0,
//                 10,
//                 [],
//                 item,
//                 0,
//                 0
//             );
//         }).toThrowError('Not enough space to layout the text. The marker is too long or there is not enough space to draw it.');
//     });

//     it('covers right-to-left marker path and alignment-based indent subtraction inside _drawItem', () => {
//         const list: PdfOrderedList = createOrderedList(['RTL item']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);
//         const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.center);

//         list.alignment = PdfListMarkerAlignment.right;
//         list.textIndent = 5;
//         item.textIndent = 7;
//         item.stringFormat = format;

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._currentPage = page;
//         (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
//         (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
//         (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
//         (layouter as any)._currentFormat = format;
//         (layouter as any)._size = [120, 100];
//         (layouter as any)._markerMaxWidth = 20;

//         spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(12, 8, '', false));
//         spyOn<any>(layouter, '_drawMarker').and.returnValue(true);
//         spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(20, 10, '', false));
//         spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

//         const result = (layouter as any)._drawItem(
//             createPageResult(),
//             10,
//             list,
//             0,
//             15,
//             [],
//             item,
//             0,
//             0
//         );

//         expect(result.pageResult.broken).toBeFalsy();
//         expect(result.pageResult.markerWrote).toBeTruthy();
//     });

//     it('covers !currentPage branch that clones itemFormat and forces left alignment', () => {
//         const list: PdfOrderedList = createOrderedList(['No page']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);
//         const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);

//         item.stringFormat = format;

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._currentPage = undefined;
//         (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
//         (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
//         (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
//         (layouter as any)._currentFormat = format;
//         (layouter as any)._size = [120, 100];
//         (layouter as any)._markerMaxWidth = 20;

//         const layoutSpy = spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(18, 9, '', false));
//         spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(12, 8, '', false));
//         spyOn<any>(layouter, '_drawMarker').and.returnValue(true);
//         spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

//         (layouter as any)._drawItem(
//             createPageResult(),
//             0,
//             list,
//             0,
//             10,
//             [],
//             item,
//             0,
//             0
//         );

//         const passedFormat: PdfStringFormat = layoutSpy.calls.mostRecent().args[2];
//         expect(passedFormat.alignment).toBe(PdfTextAlignment.left);
//         expect(format.alignment).toBe(PdfTextAlignment.right);
//     });

//     it('covers broken branch when result exists and remainder equals item text', () => {
//         const list: PdfOrderedList = createOrderedList(['Repeat']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._currentPage = page;
//         (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
//         (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
//         (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
//         (layouter as any)._currentFormat = new PdfStringFormat(PdfTextAlignment.left);
//         (layouter as any)._size = [120, 6];
//         (layouter as any)._markerMaxWidth = 20;

//         spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(10, 8, '', false));
//         spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(20, 10, item.text, false));
//         spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

//         const result = (layouter as any)._drawItem(
//             createPageResult(),
//             0,
//             list,
//             0,
//             10,
//             [],
//             item,
//             0,
//             0
//         );

//         expect(result.pageResult.broken).toBeTruthy();
//         expect(result.pageResult.itemText).toBe(item.text);
//     });

//     it('covers broken branch where result is undefined and pageResult.itemText becomes undefined', () => {
//         const list: PdfOrderedList = createOrderedList(['dummy']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);
//         const pageResult: any = createPageResult();

//         item.text = '';

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._currentPage = page;
//         (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
//         (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
//         (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
//         (layouter as any)._currentFormat = new PdfStringFormat(PdfTextAlignment.left);
//         (layouter as any)._size = [100, 100];
//         (layouter as any)._markerMaxWidth = 20;

//         spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(10, 8, 'remaining-marker', false));

//         const result = (layouter as any)._drawItem(
//             pageResult,
//             0,
//             list,
//             0,
//             10,
//             [],
//             item,
//             0,
//             0
//         );

//         expect(result.pageResult.broken).toBeTruthy();
//         expect(result.pageResult.itemText).toBeUndefined();
//         expect(result.pageResult.markerText).toBe('remaining-marker');
//     });

//     it('covers result alignment switch branches for right and center', () => {
//         const list: PdfOrderedList = createOrderedList(['Aligned']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._currentPage = page;
//         (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
//         (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
//         (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
//         (layouter as any)._size = [120, 100];
//         (layouter as any)._markerMaxWidth = 20;
//         spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(10, 8, '', false));
//         spyOn<any>(layouter, '_drawMarker').and.returnValue(true);
//         spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(20, 10, '', false));
//         spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

//         item.stringFormat = new PdfStringFormat(PdfTextAlignment.right);
//         let result = (layouter as any)._drawItem(createPageResult(), 0, list, 0, 10, [], item, 0, 0);
//         expect(result.pageResult.markerWrote).toBeTruthy();

//         item.stringFormat = new PdfStringFormat(PdfTextAlignment.center);
//         result = (layouter as any)._drawItem(createPageResult(), 0, list, 0, 10, [], item, 0, 0);
//         expect(result.pageResult.markerWrote).toBeTruthy();
//     });

//     it('covers _drawMarker ordered and unordered font-size adjustment branches', () => {
//         const ordered: PdfOrderedList = createOrderedList(['A']);
//         const unordered: PdfUnorderedList = createUnorderedList(['B']);
//         const orderedItem: PdfListItem = ordered.items.at(0);
//         const unorderedItem: PdfListItem = unordered.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(ordered);

//         (layouter as any)._graphics = graphics;
//         ordered.font = new PdfStandardFont(PdfFontFamily.helvetica, 20);
//         unordered.font = new PdfStandardFont(PdfFontFamily.helvetica, 20);

//         const markerResult: _PdfStringLayoutResult = fakeLayoutResult(10, 8, '', false);

//         spyOn<any>(layouter, '_drawOrderedMarker').and.stub();
//         spyOn<any>(layouter, '_drawUnorderedMarker').and.stub();

//         (layouter as any)._drawMarker(ordered, orderedItem, markerResult, 10, 20);
//         (layouter as any)._drawMarker(unordered, unorderedItem, markerResult, 10, 20);

//         expect((layouter as any)._drawOrderedMarker).toHaveBeenCalled();
//         expect((layouter as any)._drawUnorderedMarker).toHaveBeenCalled();
//     });

//     it('covers _drawUnorderedMarker both markerResult and no-markerResult branches', () => {
//         const list: PdfUnorderedList = createUnorderedList(['A']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         (layouter as any)._graphics = graphics;

//         spyOn(list as any, '_draw').and.stub();

//         (layouter as any)._drawUnorderedMarker(list, fakeLayoutResult(9, 7, '', false), item, 30, 40);
//         (layouter as any)._drawUnorderedMarker(list, null, item, 30, 40);

//         expect((list as any)._draw).toHaveBeenCalledTimes(2);
//     });

//     it('covers _drawOrderedMarker and marker string format creation', () => {
//         const list: PdfOrderedList = createOrderedList(['A']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         (layouter as any)._graphics = graphics;
//         (layouter as any)._markerMaxWidth = 25;

//         spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

//         (layouter as any)._drawOrderedMarker(list, fakeLayoutResult(8, 6, '', false), item, 50, 60);

//         expect((graphics as any)._drawStringLayoutResult).toHaveBeenCalled();
//     });

//     it('covers _setCurrentParameters for list item and PdfList (including _isList flag)', () => {
//         const list: PdfOrderedList = createOrderedList(['A']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         const itemBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
//         const itemPen = new PdfPen({ r: 0, g: 0, b: 255 }, 1);
//         const itemFont = new PdfStandardFont(PdfFontFamily.helvetica, 11);
//         const itemFormat = new PdfStringFormat(PdfTextAlignment.center);

//         item.brush = itemBrush;
//         item.pen = itemPen;
//         item.font = itemFont;
//         item.stringFormat = itemFormat;

//         (layouter as any)._setCurrentParameters(item);
//         expect((layouter as any)._currentBrush).toBe(itemBrush);
//         expect((layouter as any)._currentPen).toBe(itemPen);
//         expect((layouter as any)._currentFont).toBe(itemFont);
//         expect((layouter as any)._currentFormat).toBe(itemFormat);

//         const listFormat = new PdfStringFormat(PdfTextAlignment.right);
//         list.stringFormat = listFormat;

//         (layouter as any)._setCurrentParameters(list);
//         expect((layouter as any)._currentFormat).toBe(listFormat);
//         expect((layouter as any)._currentFormat._isList).toBeTruthy();
//     });

//     it('covers _getMarkerMaxWidth loop and max selection', () => {
//         const list: PdfOrderedList = createOrderedList(['A', 'B', 'C']);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         const spy = spyOn<any>(layouter, '_createOrderedMarkerResult').and.returnValues(
//             fakeLayoutResult(8, 5, '', false),
//             fakeLayoutResult(15, 5, '', false),
//             fakeLayoutResult(10, 5, '', false)
//         );

//         const width: number = (layouter as any)._getMarkerMaxWidth(list, []);

//         expect(spy).toHaveBeenCalledTimes(3);
//         expect(width).toBe(15);
//     });

//     it('covers _createUnorderedMarkerResult and pen-width size expansion branch', () => {
//         const list: PdfUnorderedList = createUnorderedList(['A']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         (layouter as any)._size = [100, 100];

//         const result: _PdfStringLayoutResult = (layouter as any)._createUnorderedMarkerResult(list, item);

//         expect(result).toBeDefined();
//         expect(result._size.width).toBeGreaterThan(result._actualSize.width);
//         expect(result._size.height).toBeGreaterThan(result._actualSize.height);
//     });

//     it('covers _createOrderedMarkerResult with style none', () => {
//         const list: PdfOrderedList = createOrderedList(['A']);
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         list.style = PdfNumberStyle.none;

//         const layoutSpy = spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(0, 0, '', false));

//         (layouter as any)._createOrderedMarkerResult(list, item, 0, [], false);

//         expect(layoutSpy.calls.mostRecent().args[0]).toBe('');
//     });

//     it('covers _createOrderedMarkerResult hierarchy building and break branches', () => {
//         const parent: PdfOrderedList = createOrderedList(['P1']);
//         const child: PdfOrderedList = createOrderedList(['C1']);
//         const item: PdfListItem = child.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(child);

//         parent.enableHierarchy = true;
//         parent.delimiter = '.';
//         parent.style = PdfNumberStyle.numeric;

//         child.enableHierarchy = true;
//         child.style = PdfNumberStyle.numeric;
//         child.suffix = '.';

//         const info1: _PdfListInfo = new _PdfListInfo(parent, 0, '1');
//         const layoutSpy = spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(20, 10, '', false));

//         (layouter as any)._createOrderedMarkerResult(child, item, 0, [info1], false);
//         expect(layoutSpy.calls.mostRecent().args[0]).toContain('1.');

//         const breakParent: PdfOrderedList = createOrderedList(['P2']);
//         breakParent.style = PdfNumberStyle.none;
//         breakParent.enableHierarchy = true;
//         const info2: _PdfListInfo = new _PdfListInfo(breakParent, 0, 'X');

//         (layouter as any)._createOrderedMarkerResult(child, item, 0, [info2], false);
//         expect(layoutSpy.calls.mostRecent().args[0]).not.toContain('X');

//         const stopParent: PdfOrderedList = createOrderedList(['P3']);
//         stopParent.style = PdfNumberStyle.numeric;
//         stopParent.enableHierarchy = false;
//         const info3: _PdfListInfo = new _PdfListInfo(stopParent, 0, '2');

//         (layouter as any)._createOrderedMarkerResult(child, item, 0, [info3], false);
//         expect(layoutSpy.calls.mostRecent().args[0]).toContain('2.');
//     });

//     it('covers _setMarkerStringFormat with existing format clone and right-to-left override', () => {
//         const list: PdfOrderedList = createOrderedList(['A']);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.center);
//         list.stringFormat = undefined;
//         list.alignment = PdfListMarkerAlignment.right;

//         const result: PdfStringFormat = (layouter as any)._setMarkerStringFormat(list, format);

//         expect(result).not.toBe(format);
//         expect(result.alignment).toBe(PdfTextAlignment.left);
//         expect(format.alignment).toBe(PdfTextAlignment.center);
//     });

//     it('covers _setMarkerStringFormat new-format creation and !currentPage forcing left alignment', () => {
//         const list: PdfOrderedList = createOrderedList(['A']);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         list.stringFormat = undefined;
//         list.alignment = PdfListMarkerAlignment.left;
//         (layouter as any)._currentPage = undefined;

//         const result: PdfStringFormat = (layouter as any)._setMarkerStringFormat(list, undefined);

//         expect(result).toBeDefined();
//         expect(result.alignment).toBe(PdfTextAlignment.left);
//     });

//     it('covers _getMarkerFont, _getMarkerFormat, _getMarkerPen and _getMarkerBrush fallback chains', () => {
//         const list: PdfOrderedList = new PdfOrderedList(new PdfListItemCollection(['A']));
//         const item: PdfListItem = list.items.at(0);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         const fallbackBrush = new PdfBrush({ r: 1, g: 2, b: 3 });
//         const fallbackPen = new PdfPen({ r: 3, g: 2, b: 1 }, 1);
//         const fallbackFont = new PdfStandardFont(PdfFontFamily.helvetica, 9);
//         const fallbackFormat = new PdfStringFormat(PdfTextAlignment.center);

//         (layouter as any)._currentBrush = fallbackBrush;
//         (layouter as any)._currentPen = fallbackPen;
//         (layouter as any)._currentFont = fallbackFont;
//         (layouter as any)._currentFormat = fallbackFormat;

//         expect((layouter as any)._getMarkerFont(list, item)).toBe(fallbackFont);
//         expect((layouter as any)._getMarkerFormat(list, item)).toBe(fallbackFormat);
//         expect((layouter as any)._getMarkerPen(list, item)).toBe(fallbackPen);
//         expect((layouter as any)._getMarkerBrush(list, item)).toBe(fallbackBrush);
//         expect(list.font).toBe(fallbackFont);
//     });

//     it('covers draw overload path for PdfGraphics and PdfPage existing-page branch', () => {
//         const list: PdfOrderedList = createOrderedList(['One']);

//         const layoutSpy = spyOn(_PdfListLayouter.prototype as any, 'layout').and.stub();

//         list.draw(graphics, { x: 10, y: 20 });
//         expect(layoutSpy).toHaveBeenCalled();

//         const result = list.draw(page, { x: 15, y: 25 });
//         expect(result).toBeUndefined();
//     });

//     it('covers _drawInternal branches: undefined arg4, numeric arg4, and PdfLayoutFormat arg4', () => {
//         const list: PdfOrderedList = createOrderedList(['One']);
//         const layoutSpy = spyOn<any>(list, '_layout').and.callFake((param: _PdfLayoutParameters) => {
//             return new PdfLayoutResult(page, {
//                 x: param._bounds[0],
//                 y: param._bounds[1],
//                 width: param._bounds[2],
//                 height: param._bounds[3]
//             });
//         });

//         let result: PdfLayoutResult = (list as any)._drawInternal(page, 10, 20);
//         expect(result.bounds.x).toBe(10);
//         expect(result.bounds.y).toBe(20);

//         result = (list as any)._drawInternal(page, 10, 20, 100, 200);
//         expect(result.bounds.width).toBe(100);
//         expect(result.bounds.height).toBe(200);

//         const format: PdfLayoutFormat = new PdfLayoutFormat();
//         result = (list as any)._drawInternal(page, 10, 20, format);
//         expect(layoutSpy).toHaveBeenCalled();
//         expect(result.bounds.x).toBe(10);
//     });
//     it('covers layoutInternal paginate bounds branch and final _isList reset', () => {
//         const list: PdfOrderedList = createOrderedList(['One']);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);
//         const format: PdfLayoutFormat = new PdfLayoutFormat();
//         format.layout = PdfLayoutType.onePage;
//         Object.defineProperty(format, 'usePaginateBounds', {
//             value: true,
//             configurable: true
//         });
//         (format as any)._paginateBounds = { x: 5, y: 6, width: 100, height: 120 } as Rectangle;

//         list.stringFormat = new PdfStringFormat(PdfTextAlignment.left);

//         const parameter: _PdfLayoutParameters = new _PdfLayoutParameters();
//         parameter._page = page;
//         parameter._bounds = [0, 0, 0, 0];
//         parameter._format = format;

//         spyOn<any>(layouter, '_layoutOnPage').and.callFake((pageResult: any) => {
//             pageResult.broken = false;
//             pageResult.y = 12;
//             (layouter as any)._finish = true;
//             (layouter as any)._resultHeight = 20;
//             return pageResult;
//         });

//         const result: PdfLayoutResult = layouter.layoutInternal(parameter);
//         expect(result).toBeDefined();
//         expect(list.stringFormat._isList).toBeFalsy();
//     });

//     it('covers _getNextPage branch for existing next page and addPage branch', () => {
//         const first: PdfPage = document.addPage();
//         const second: PdfPage = document.addPage();
//         const list: PdfOrderedList = createOrderedList(['One']);
//         const layouter: _PdfListLayouter = new _PdfListLayouter(list);

//         const next1: PdfPage = (layouter as any)._getNextPage(first);
//         expect(next1).toBe(second);

//         const last: PdfPage = document.getPage(document.pageCount - 1);
//         const countBefore: number = document.pageCount;
//         const next2: PdfPage = (layouter as any)._getNextPage(last);
//         expect(document.pageCount).toBe(countBefore + 1);
//         expect(next2).toBe(document.getPage(document.pageCount - 1));
//     });

//     it('covers PdfOrderedList.startNumber validation and _getNumber', () => {
//         const list: PdfOrderedList = createOrderedList(['One']);
//         list.startNumber = 5;
//         (list as any)._currentIndex = 0;
//         expect((list as any)._getNumber()).toBeDefined();

//         expect(() => {
//             list.startNumber = 0;
//         }).toThrowError('Start number should be greater than 0.');
//     });

//     it('covers PdfUnorderedList._getStyledText switch cases', () => {
//         const list: PdfUnorderedList = createUnorderedList(['A']);

//         list.style = PdfUnorderedListStyle.disk;
//         expect((list as any)._getStyledText()).toBe('\x6C');

//         list.style = PdfUnorderedListStyle.square;
//         expect((list as any)._getStyledText()).toBe('\x6E');

//         list.style = PdfUnorderedListStyle.asterisk;
//         expect((list as any)._getStyledText()).toBe('\x5D');

//         list.style = PdfUnorderedListStyle.circle;
//         expect((list as any)._getStyledText()).toBe('\x6D');
//     });
// });
// ``

import { PdfListMarkerAlignment, PdfLayoutType, PdfNumberStyle, PdfTextAlignment, PdfUnorderedListStyle } from '../src/pdf/core/enumerator';
import { _PdfStringLayoutResult, _PdfStringLayouter } from '../src/pdf/core/fonts/string-layouter';
import { PdfFontFamily, PdfStandardFont } from '../src/pdf/core/fonts/pdf-standard-font';
import { PdfStringFormat } from '../src/pdf/core/fonts/pdf-string-format';
import { PdfBrush, PdfGraphics, PdfPen } from '../src/pdf/core/graphics/pdf-graphics';
import { PdfLayoutResult, PdfLayoutFormat, _PdfLayoutParameters } from '../src/pdf/core/graphics/pdf-layouter';
import { PdfPage } from '../src/pdf/core/pdf-page';
import { PdfListItem, PdfListItemCollection } from '../src/pdf/core/list/pdf-list-item';
import { PdfDocument } from '../src/pdf/core/pdf-document';
import { Rectangle } from '../src/pdf/core/pdf-type';
import { PdfOrderedList, PdfUnorderedList, _PdfListInfo, _PdfListLayouter } from '../src/pdf/core/list/pdf-list';

describe('pdf-list.ts coverage tests', () => {
    let document: PdfDocument;
    let page: PdfPage;
    let graphics: PdfGraphics;

    function createOrderedList(values?: string[]): PdfOrderedList {
        const items: PdfListItemCollection = new PdfListItemCollection(values || ['One', 'Two', 'Three']);
        return new PdfOrderedList(items, {
            font: new PdfStandardFont(PdfFontFamily.helvetica, 10),
            brush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            pen: new PdfPen({ r: 0, g: 0, b: 0 }, 1)
        });
    }

    function createUnorderedList(values?: string[]): PdfUnorderedList {
        const items: PdfListItemCollection = new PdfListItemCollection(values || ['One', 'Two', 'Three']);
        return new PdfUnorderedList(items, {
            font: new PdfStandardFont(PdfFontFamily.helvetica, 10),
            brush: new PdfBrush({ r: 0, g: 0, b: 0 }),
            pen: new PdfPen({ r: 0, g: 0, b: 0 }, 1),
            style: PdfUnorderedListStyle.disk
        });
    }

    function fakeLayoutResult(
        width: number,
        height: number,
        remainder?: string,
        empty?: boolean
    ): _PdfStringLayoutResult {
        return {
            _actualSize: { width, height },
            _size: { width, height },
            _remainder: remainder || '',
            _empty: !!empty
        } as unknown as _PdfStringLayoutResult;
    }

    function createPageResult(): any {
        return {
            broken: false,
            markerWrote: false,
            markerWidth: 0,
            markerX: 0,
            itemText: undefined,
            markerText: undefined,
            y: 0
        };
    }

    function setupLayouterState(
        layouter: _PdfListLayouter,
        size: number[],
        currentPage?: PdfPage,
        format?: PdfStringFormat
    ): void {
        (layouter as any)._graphics = graphics;
        (layouter as any)._currentPage = currentPage;
        (layouter as any)._currentBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
        (layouter as any)._currentPen = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        (layouter as any)._currentFont = new PdfStandardFont(PdfFontFamily.helvetica, 10);
        (layouter as any)._currentFormat = format || new PdfStringFormat(PdfTextAlignment.left);
        (layouter as any)._size = size.slice();
        (layouter as any)._bounds = [0, 0, 200, 200];
    }

    beforeEach(() => {
        document = new PdfDocument();
        page = document.addPage();
        graphics = page.graphics;
    });

    afterEach(() => {
        if (document) {
            document.destroy();
        }
    });

    it('covers _drawItem first throw branch when available width is not enough for list layout', () => {
        const list: PdfOrderedList = createOrderedList(['A']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        setupLayouterState(layouter, [0, 100], page);

        expect(() => {
            (layouter as any)._drawItem(
                createPageResult(),
                0,
                list,
                0,
                10,
                [],
                item,
                0,
                0
            );
        }).toThrowError('There is not enough space to layout list.');
    });

    it('covers markerResult null else branch and broken-state else assignments without unhandled failure', () => {
        const list: PdfUnorderedList = createUnorderedList(['Marker-less item']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);
        const pageResult: any = createPageResult();

        pageResult.broken = true;
        pageResult.itemText = 'Marker-less item';
        pageResult.markerText = 'continued-marker';

        list._size = [12, 18];

        setupLayouterState(layouter, [50, 5], page);

        spyOn<any>(layouter, '_createMarkerResult').and.returnValue(null);

        const result = (layouter as any)._drawItem(
            pageResult,
            0,
            list,
            0,
            10,
            [],
            item,
            0,
            0
        );

        expect(result.pageResult.broken).toBeTruthy();
        expect(result.pageResult.itemText).toBe(item.text);
        expect(result.pageResult.markerText).toBeUndefined();
    });

    it('covers second throw branch when marker width leaves no room for item text', () => {
        const list: PdfOrderedList = createOrderedList(['A']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        setupLayouterState(layouter, [15, 100], page);
        (layouter as any)._markerMaxWidth = 14;

        spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(14, 8, '', false));

        expect(() => {
            (layouter as any)._drawItem(
                createPageResult(),
                0,
                list,
                0,
                10,
                [],
                item,
                0,
                0
            );
        }).toThrowError('Not enough space to layout the text. The marker is too long or there is not enough space to draw it.');
    });

    it('covers right-to-left marker path and alignment-based indent subtraction inside _drawItem', () => {
        const list: PdfOrderedList = createOrderedList(['RTL item']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);
        const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.center);

        list.alignment = PdfListMarkerAlignment.right;
        list.textIndent = 5;
        item.textIndent = 7;
        item.stringFormat = format;

        setupLayouterState(layouter, [120, 100], page, format);
        (layouter as any)._markerMaxWidth = 20;

        spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(12, 8, '', false));
        spyOn<any>(layouter, '_drawMarker').and.returnValue(true);
        spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(20, 10, '', false));
        spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

        const result = (layouter as any)._drawItem(
            createPageResult(),
            10,
            list,
            0,
            15,
            [],
            item,
            0,
            0
        );

        expect(result.pageResult.broken).toBeFalsy();
        expect(result.pageResult.markerWrote).toBeTruthy();
    });

    it('covers !currentPage branch that clones itemFormat and forces left alignment', () => {
        const list: PdfOrderedList = createOrderedList(['No page']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);
        const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.right);

        item.stringFormat = format;

        setupLayouterState(layouter, [120, 100], undefined, format);
        (layouter as any)._markerMaxWidth = 20;

        const layoutSpy = spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(18, 9, '', false));
        spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(12, 8, '', false));
        spyOn<any>(layouter, '_drawMarker').and.returnValue(true);
        spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

        (layouter as any)._drawItem(
            createPageResult(),
            0,
            list,
            0,
            10,
            [],
            item,
            0,
            0
        );

        const passedFormat: PdfStringFormat = layoutSpy.calls.mostRecent().args[2];
        expect(passedFormat.alignment).toBe(PdfTextAlignment.left);
        expect(format.alignment).toBe(PdfTextAlignment.right);
    });

    it('covers broken branch when result exists and remainder equals item text', () => {
        const list: PdfOrderedList = createOrderedList(['Repeat']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        setupLayouterState(layouter, [120, 6], page);
        (layouter as any)._markerMaxWidth = 20;

        spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(10, 8, '', false));
        spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(20, 10, item.text, false));
        spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

        const result = (layouter as any)._drawItem(
            createPageResult(),
            0,
            list,
            0,
            10,
            [],
            item,
            0,
            0
        );

        expect(result.pageResult.broken).toBeTruthy();
        expect(result.pageResult.itemText).toBe(item.text);
    });


    it('covers broken branch where result is undefined and pageResult.itemText becomes undefined', () => {
        const list: PdfOrderedList = createOrderedList(['dummy']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);
        const pageResult: any = createPageResult();

        item.text = '';

        setupLayouterState(layouter, [100, 100], page);
        (layouter as any)._markerMaxWidth = 20;

        spyOn<any>(layouter, '_createMarkerResult').and.returnValue(
            fakeLayoutResult(10, 8, 'remaining-marker', false)
        );

        // Prevent real marker rendering path from calling PdfGraphics internals
        spyOn<any>(layouter, '_drawMarker').and.returnValue(true);

        const result = (layouter as any)._drawItem(
            pageResult,
            0,
            list,
            0,
            10,
            [],
            item,
            0,
            0
        );

        expect(result.pageResult.broken).toBeTruthy();
        expect(result.pageResult.itemText).toBeUndefined();
        expect(result.pageResult.markerText).toBe('remaining-marker');
    });
    it('covers result alignment switch branches for right and center', () => {
        const list: PdfOrderedList = createOrderedList(['Aligned']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        setupLayouterState(layouter, [120, 100], page);
        (layouter as any)._markerMaxWidth = 20;

        spyOn<any>(layouter, '_createMarkerResult').and.returnValue(fakeLayoutResult(10, 8, '', false));
        spyOn<any>(layouter, '_drawMarker').and.returnValue(true);
        spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(20, 10, '', false));
        spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

        item.stringFormat = new PdfStringFormat(PdfTextAlignment.right);
        let result = (layouter as any)._drawItem(createPageResult(), 0, list, 0, 10, [], item, 0, 0);
        expect(result.pageResult.markerWrote).toBeTruthy();

        item.stringFormat = new PdfStringFormat(PdfTextAlignment.center);
        result = (layouter as any)._drawItem(createPageResult(), 0, list, 0, 10, [], item, 0, 0);
        expect(result.pageResult.markerWrote).toBeTruthy();
    });

    it('covers _drawMarker ordered and unordered font-size adjustment branches', () => {
        const ordered: PdfOrderedList = createOrderedList(['A']);
        const unordered: PdfUnorderedList = createUnorderedList(['B']);
        const orderedItem: PdfListItem = ordered.items.at(0);
        const unorderedItem: PdfListItem = unordered.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(ordered);

        (layouter as any)._graphics = graphics;
        ordered.font = new PdfStandardFont(PdfFontFamily.helvetica, 20);
        unordered.font = new PdfStandardFont(PdfFontFamily.helvetica, 20);

        const markerResult: _PdfStringLayoutResult = fakeLayoutResult(10, 8, '', false);

        spyOn<any>(layouter, '_drawOrderedMarker').and.stub();
        spyOn<any>(layouter, '_drawUnorderedMarker').and.stub();

        (layouter as any)._drawMarker(ordered, orderedItem, markerResult, 10, 20);
        (layouter as any)._drawMarker(unordered, unorderedItem, markerResult, 10, 20);

        expect((layouter as any)._drawOrderedMarker).toHaveBeenCalled();
        expect((layouter as any)._drawUnorderedMarker).toHaveBeenCalled();
    });

    it('covers _drawUnorderedMarker both markerResult and no-markerResult branches', () => {
        const list: PdfUnorderedList = createUnorderedList(['A']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        (layouter as any)._graphics = graphics;

        spyOn(list as any, '_draw').and.stub();

        (layouter as any)._drawUnorderedMarker(list, fakeLayoutResult(9, 7, '', false), item, 30, 40);
        (layouter as any)._drawUnorderedMarker(list, null, item, 30, 40);

        expect((list as any)._draw).toHaveBeenCalledTimes(2);
    });

    it('covers _drawOrderedMarker and marker string format creation', () => {
        const list: PdfOrderedList = createOrderedList(['A']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        (layouter as any)._graphics = graphics;
        (layouter as any)._markerMaxWidth = 25;

        spyOn<any>(graphics, '_drawStringLayoutResult').and.stub();

        (layouter as any)._drawOrderedMarker(list, fakeLayoutResult(8, 6, '', false), item, 50, 60);

        expect((graphics as any)._drawStringLayoutResult).toHaveBeenCalled();
    });

    it('covers _setCurrentParameters for list item and PdfList (including _isList flag)', () => {
        const list: PdfOrderedList = createOrderedList(['A']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        const itemBrush = new PdfBrush({ r: 255, g: 0, b: 0 });
        const itemPen = new PdfPen({ r: 0, g: 0, b: 255 }, 1);
        const itemFont = new PdfStandardFont(PdfFontFamily.helvetica, 11);
        const itemFormat = new PdfStringFormat(PdfTextAlignment.center);

        item.brush = itemBrush;
        item.pen = itemPen;
        item.font = itemFont;
        item.stringFormat = itemFormat;

        (layouter as any)._setCurrentParameters(item);
        expect((layouter as any)._currentBrush).toBe(itemBrush);
        expect((layouter as any)._currentPen).toBe(itemPen);
        expect((layouter as any)._currentFont).toBe(itemFont);
        expect((layouter as any)._currentFormat).toBe(itemFormat);

        const listFormat = new PdfStringFormat(PdfTextAlignment.right);
        list.stringFormat = listFormat;

        (layouter as any)._setCurrentParameters(list);
        expect((layouter as any)._currentFormat).toBe(listFormat);
        expect((layouter as any)._currentFormat._isList).toBeTruthy();
    });

    it('covers _getMarkerMaxWidth loop and max selection', () => {
        const list: PdfOrderedList = createOrderedList(['A', 'B', 'C']);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        const spy = spyOn<any>(layouter, '_createOrderedMarkerResult').and.returnValues(
            fakeLayoutResult(8, 5, '', false),
            fakeLayoutResult(15, 5, '', false),
            fakeLayoutResult(10, 5, '', false)
        );

        const width: number = (layouter as any)._getMarkerMaxWidth(list, []);

        expect(spy).toHaveBeenCalledTimes(3);
        expect(width).toBe(15);
    });

    it('covers _createUnorderedMarkerResult and pen-width size expansion branch', () => {
        const list: PdfUnorderedList = createUnorderedList(['A']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        (layouter as any)._size = [100, 100];

        Object.defineProperty(list, 'pen', {
            get: (): PdfPen => new PdfPen({ r: 0, g: 0, b: 0 }, 3),
            configurable: true
        });

        const result: _PdfStringLayoutResult = (layouter as any)._createUnorderedMarkerResult(list, item);

        expect(result).toBeDefined();
        expect(result._size.width).toBe(result._actualSize.width);
        expect(result._size.height).toBe(result._actualSize.height);
    });

    it('covers _createOrderedMarkerResult with style none', () => {
        const list: PdfOrderedList = createOrderedList(['A']);
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        list.style = PdfNumberStyle.none;

        const layoutSpy = spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(0, 0, '', false));

        (layouter as any)._createOrderedMarkerResult(list, item, 0, [], false);

        expect(layoutSpy.calls.mostRecent().args[0]).toBe('');
    });

    it('covers _createOrderedMarkerResult hierarchy building and break branches', () => {
        const parent: PdfOrderedList = createOrderedList(['P1']);
        const child: PdfOrderedList = createOrderedList(['C1']);
        const item: PdfListItem = child.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(child);

        parent.enableHierarchy = true;
        parent.delimiter = '.';
        parent.style = PdfNumberStyle.numeric;

        child.enableHierarchy = true;
        child.style = PdfNumberStyle.numeric;
        child.suffix = '.';

        const info1: _PdfListInfo = new _PdfListInfo(parent, 0, '1');
        const layoutSpy = spyOn(_PdfStringLayouter.prototype as any, '_layout').and.returnValue(fakeLayoutResult(20, 10, '', false));

        (layouter as any)._createOrderedMarkerResult(child, item, 0, [info1], false);
        expect(layoutSpy.calls.mostRecent().args[0]).toContain('1.');

        const breakParent: PdfOrderedList = createOrderedList(['P2']);
        breakParent.style = PdfNumberStyle.none;
        breakParent.enableHierarchy = true;
        const info2: _PdfListInfo = new _PdfListInfo(breakParent, 0, 'X');

        (layouter as any)._createOrderedMarkerResult(child, item, 0, [info2], false);
        expect(layoutSpy.calls.mostRecent().args[0]).not.toContain('X');

        const stopParent: PdfOrderedList = createOrderedList(['P3']);
        stopParent.style = PdfNumberStyle.numeric;
        stopParent.enableHierarchy = false;
        const info3: _PdfListInfo = new _PdfListInfo(stopParent, 0, '2');

        (layouter as any)._createOrderedMarkerResult(child, item, 0, [info3], false);
        expect(layoutSpy.calls.mostRecent().args[0]).toContain('2.');
    });

    it('covers _setMarkerStringFormat with existing format clone and right-to-left override', () => {
        const list: PdfOrderedList = createOrderedList(['A']);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        const format: PdfStringFormat = new PdfStringFormat(PdfTextAlignment.center);
        list.stringFormat = undefined;
        list.alignment = PdfListMarkerAlignment.right;

        const result: PdfStringFormat = (layouter as any)._setMarkerStringFormat(list, format);

        expect(result).not.toBe(format);
        expect(result.alignment).toBe(PdfTextAlignment.left);
        expect(format.alignment).toBe(PdfTextAlignment.center);
    });

    it('covers _setMarkerStringFormat new-format creation and !currentPage forcing left alignment', () => {
        const list: PdfOrderedList = createOrderedList(['A']);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        list.stringFormat = undefined;
        list.alignment = PdfListMarkerAlignment.left;
        (layouter as any)._currentPage = undefined;

        const result: PdfStringFormat = (layouter as any)._setMarkerStringFormat(list, undefined);

        expect(result).toBeDefined();
        expect(result.alignment).toBe(PdfTextAlignment.left);
    });

    it('covers _getMarkerFont, _getMarkerFormat, _getMarkerPen and _getMarkerBrush fallback chains', () => {
        const list: PdfOrderedList = new PdfOrderedList(new PdfListItemCollection(['A']));
        const item: PdfListItem = list.items.at(0);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        const fallbackBrush = new PdfBrush({ r: 1, g: 2, b: 3 });
        const fallbackPen = new PdfPen({ r: 3, g: 2, b: 1 }, 1);
        const fallbackFont = new PdfStandardFont(PdfFontFamily.helvetica, 9);
        const fallbackFormat = new PdfStringFormat(PdfTextAlignment.center);

        (layouter as any)._currentBrush = fallbackBrush;
        (layouter as any)._currentPen = fallbackPen;
        (layouter as any)._currentFont = fallbackFont;
        (layouter as any)._currentFormat = fallbackFormat;

        expect((layouter as any)._getMarkerFont(list, item)).toBe(fallbackFont);
        expect((layouter as any)._getMarkerFormat(list, item)).toBe(fallbackFormat);
        expect((layouter as any)._getMarkerPen(list, item)).toBe(fallbackPen);
        expect((layouter as any)._getMarkerBrush(list, item)).toBe(fallbackBrush);
        expect(list.font).toBe(fallbackFont);
    });

    it('covers draw overload path for PdfGraphics and PdfPage existing-page branch', () => {
        const list: PdfOrderedList = createOrderedList(['One']);

        const layoutSpy = spyOn(_PdfListLayouter.prototype as any, 'layout').and.stub();

        list.draw(graphics, { x: 10, y: 20 });
        expect(layoutSpy).toHaveBeenCalled();

        Object.defineProperty(page, '_isNew', {
            value: false,
            configurable: true
        });

        const result = list.draw(page, { x: 15, y: 25 });
        expect(result).toBeUndefined();
        expect(layoutSpy.calls.count()).toBe(2);
    });

    it('covers _drawInternal branches: undefined arg4, numeric arg4, and PdfLayoutFormat arg4', () => {
        const list: PdfOrderedList = createOrderedList(['One']);
        const layoutSpy = spyOn<any>(list, '_layout').and.callFake((param: _PdfLayoutParameters) => {
            return new PdfLayoutResult(page, {
                x: param._bounds[0],
                y: param._bounds[1],
                width: param._bounds[2],
                height: param._bounds[3]
            });
        });

        let result: PdfLayoutResult = (list as any)._drawInternal(page, 10, 20);
        expect(result.bounds.x).toBe(10);
        expect(result.bounds.y).toBe(20);

        result = (list as any)._drawInternal(page, 10, 20, 100, 200);
        expect(result.bounds.width).toBe(100);
        expect(result.bounds.height).toBe(200);

        const format: PdfLayoutFormat = new PdfLayoutFormat();
        result = (list as any)._drawInternal(page, 10, 20, format);
        expect(layoutSpy).toHaveBeenCalled();
        expect(result.bounds.x).toBe(10);
    });

    it('covers layoutInternal paginate bounds branch and final _isList reset', () => {
        const list: PdfOrderedList = createOrderedList(['One']);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);
        const format: PdfLayoutFormat = new PdfLayoutFormat();

        format.layout = PdfLayoutType.paginate;
        Object.defineProperty(format, 'usePaginateBounds', {
            value: true,
            configurable: true
        });
        (format as any)._paginateBounds = { x: 5, y: 6, width: 100, height: 120 } as Rectangle;

        list.stringFormat = new PdfStringFormat(PdfTextAlignment.left);

        const parameter: _PdfLayoutParameters = new _PdfLayoutParameters();
        parameter._page = page;
        parameter._bounds = [0, 0, 0, 0];
        parameter._format = format;

        let callCount: number = 0;
        spyOn<any>(layouter, '_layoutOnPage').and.callFake((pageResult: any) => {
            callCount++;
            pageResult.broken = false;
            pageResult.y = 12;
            if (callCount === 1) {
                (layouter as any)._finish = false;
            } else {
                (layouter as any)._finish = true;
            }
            (layouter as any)._resultHeight = 20;
            return pageResult;
        });

        const result: PdfLayoutResult = layouter.layoutInternal(parameter);
        expect(result).toBeDefined();
        expect(list.stringFormat._isList).toBeFalsy();
    });

    it('covers _getNextPage branch for existing next page and addPage branch', () => {
        const first: PdfPage = document.addPage();
        const second: PdfPage = document.addPage();
        const list: PdfOrderedList = createOrderedList(['One']);
        const layouter: _PdfListLayouter = new _PdfListLayouter(list);

        const next1: PdfPage = (layouter as any)._getNextPage(first);
        expect(next1).toBe(second);

        const last: PdfPage = document.getPage(document.pageCount - 1);
        const countBefore: number = document.pageCount;
        const next2: PdfPage = (layouter as any)._getNextPage(last);
        expect(document.pageCount).toBe(countBefore + 1);
        expect(next2).toBe(document.getPage(document.pageCount - 1));
    });

    it('covers PdfOrderedList.startNumber validation and _getNumber', () => {
        const list: PdfOrderedList = createOrderedList(['One']);
        list.startNumber = 5;
        (list as any)._currentIndex = 0;
        expect((list as any)._getNumber()).toBeDefined();

        expect(() => {
            list.startNumber = 0;
        }).toThrowError('Start number should be greater than 0.');
    });

    it('covers PdfUnorderedList._getStyledText switch cases', () => {
        const list: PdfUnorderedList = createUnorderedList(['A']);

        list.style = PdfUnorderedListStyle.disk;
        expect((list as any)._getStyledText()).toBe('\x6C');

        list.style = PdfUnorderedListStyle.square;
        expect((list as any)._getStyledText()).toBe('\x6E');

        list.style = PdfUnorderedListStyle.asterisk;
        expect((list as any)._getStyledText()).toBe('\x5D');

        list.style = PdfUnorderedListStyle.circle;
        expect((list as any)._getStyledText()).toBe('\x6D');
    });
});
