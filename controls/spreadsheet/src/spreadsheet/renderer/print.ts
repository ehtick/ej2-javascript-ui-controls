import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Spreadsheet } from '../base/index';
import { RangeModel, SheetModel, RowModel, getSheetIndex, ChartModel, CellStyleModel, getColumnsWidth } from '../../workbook/index';
import { CellModel, checkIsFormula, ColumnModel, NumberFormatArgs, PrintOptions, workbookFormulaOperation } from '../../workbook/index';
import { getColumnHeaderText, getIndexesFromAddress, updateSheetFromDataSource, getCellAddress } from '../../workbook/index';
import { getColIdxFromClientX, getBorderWidth, getRowIdxFromClientY, getTextWidth, getDPRValue } from '../common/index';

/**
 * This class supports the printing functionality in Spreadsheet.
 */
export class Print {
    private parent: Spreadsheet;
    private totalSheetCount: number[] = [];
    private workbookActiveSheetCount: number = 0;
    private defaultCellWidth: number = 64;
    private defaultCellHeight: number = 19;
    private pageCounts: number[] = [];
    private initialRowCount: number = 0;
    private chartHeight: number = 0;
    private columnIndex: number = 0;
    private rowIndex: number = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private multipleCanvasDataURL: any = [];
    private chartElements: string[] = [];
    private totalCharts: number = 0;
    private isChartLoaded: boolean = false;
    private chartLoadedCount: number = 0;
    private isImageLoaded: boolean = false;
    private totalImages: number = 0;
    private imageLoadedCount: number = 0;
    private endRow: number = 0;
    private isColumn: boolean = true;
    private startNewPageCount: number = 0;
    private allowTimer: boolean = false;
    /**
     * Constructor for Print module
     *
     * @param {Spreadsheet} parent - Specifies the spreadsheet instance.
     */
    constructor(parent: Spreadsheet) {
        this.parent = parent;
    }

    /**
     * To create the print module.
     *
     * @param {Spreadsheet} spreadsheet - Specifies the spreadsheet instance.
     * @param {PrintOptions} printOptions - Specifies the print options.
     * @returns {void} - To create the print module.
     * @private
     */
    public print(spreadsheet: Spreadsheet, printOptions: PrintOptions): void {
        spreadsheet.isPrintingProcessing = true;
        this.multipleCanvasDataURL = [];
        this.chartElements = [];
        if (printOptions.type === 'ActiveSheet') {
            const sheet: SheetModel = spreadsheet.sheets[spreadsheet.activeSheetIndex as number];
            this.activeSheetPrint(spreadsheet, sheet, printOptions, spreadsheet.activeSheetIndex);
        } else {
            this.totalSheetCount = [];
            this.workbookActiveSheetCount = 1;
            for (let i: number = 0; i < spreadsheet.sheets.length; i++) {
                if (spreadsheet.sheets[i as number].state === 'Visible') {
                    this.totalSheetCount.push(i);
                    if (this.totalSheetCount.length > 1 && this.parent.sheets[i as number].ranges.length > 0) {
                        const isDatasourceAvailable: boolean = this.parent.sheets[i as number].ranges.some((range: RangeModel): boolean => {
                            return !isNullOrUndefined(range.dataSource);
                        });
                        if (isDatasourceAvailable) {
                            this.allowTimer = true;
                            const sheet: SheetModel = spreadsheet.sheets[i as number];
                            const address: string = getCellAddress(0, 0) + ':' + getCellAddress(sheet.rowCount - 1, sheet.colCount - 1);
                            const cellIndexes: number[] = getIndexesFromAddress(address);
                            this.parent.notify(updateSheetFromDataSource, {sheet: sheet, indexes: cellIndexes});
                        }
                    }
                }
            }
            if (this.allowTimer) {
                this.allowTimer = false;
                setTimeout(() => {
                    this.activeSheetPrint(spreadsheet, spreadsheet.sheets[this.totalSheetCount[0]], printOptions, this.totalSheetCount[0]);
                }, 2000);
            } else {
                this.activeSheetPrint(spreadsheet, spreadsheet.sheets[this.totalSheetCount[0]], printOptions, this.totalSheetCount[0]);
            }
        }
    }
    private updateChartRowAndColumnIndices(spreadsheet: Spreadsheet, sheetIndex: number): void {
        const sheet: SheetModel = spreadsheet.sheets[sheetIndex as number];
        this.rowIndex = sheet.usedRange.rowIndex;
        this.columnIndex = sheet.usedRange.colIndex;
        if (spreadsheet.chartColl.length > 0) {
            for (let i: number = 0; i < spreadsheet.chartColl.length; i++) {
                const chart: ChartModel = spreadsheet.chartColl[i as number];
                const sheetIdx: number = getSheetIndex(spreadsheet, chart.range.substring(0, chart.range.lastIndexOf('!')));
                if (sheetIndex === sheetIdx) {
                    const chartleft: { clientX: number, isImage?: boolean } = { clientX: chart.left, isImage: true };
                    const chartTop: { clientY: number, isImage?: boolean } = { clientY: chart.top, isImage: true };
                    spreadsheet.notify(getRowIdxFromClientY, chartTop);
                    spreadsheet.notify(getColIdxFromClientX, chartleft);
                    if (chartTop.clientY > sheet.usedRange.rowIndex) {
                        this.rowIndex = Math.max(this.rowIndex, chartTop.clientY);
                    }
                    if (chartleft.clientX > sheet.usedRange.colIndex) {
                        this.columnIndex = Math.max(this.columnIndex, chartleft.clientX);
                    }
                }
            }
        }
    }
    private activeSheetPrint(spreadsheet: Spreadsheet, sheet: SheetModel, printOptions: PrintOptions, sheetIndex: number): void {
        this.updateChartRowAndColumnIndices(spreadsheet, sheetIndex);
        this.pageCounts = this.calculatePageCount(sheet, 1000, printOptions.allowRowColumnHeader);
        let canvas: HTMLCanvasElement;
        let context: CanvasRenderingContext2D;
        this.initialRowCount = 0;
        this.parent.currentPrintSheetIndex = sheetIndex;
        this.endRow = this.rowIndex + 1;
        this.processCell(0, 0, this.endRow, 2, [], context, canvas, sheet, this, 0, 0,
                         true, sheetIndex, printOptions);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private processCell(page: number, rowsCount: number, rowCount: number, currentX: number, currentY: number[], context: any,
                        canvas: HTMLCanvasElement,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        sheet: SheetModel, printInstance: any,
                        pageHeight: number = 0, height: number = 0,
                        isCanvasDataUrl: boolean = true, sheetIndex: number, printOptions: PrintOptions): void {
        const defaultCellSpace: number = 0;
        const allowColumnAndRow: boolean = printOptions.allowRowColumnHeader;
        const headerWidth: number = 37;
        let lineHeight: number = 0;
        this.chartHeight = 0;
        let isExtraLine: boolean = false;
        for (let i: number = page; i < this.pageCounts.length; i++) {
            this.chartLoadedCount = 0;
            this.totalCharts = 0;
            this.imageLoadedCount = 0;
            this.totalImages = 0;
            pageHeight += (i === 0 ? 0 : 1100);
            // Create canvas element
            canvas = document.createElement('canvas') as HTMLCanvasElement;
            context = canvas.getContext('2d');
            canvas.width = 1000;
            canvas.height = 1100;
            context.font = '11pt Calibri';
            context.textBaseline = 'bottom';
            context['index'] = i;
            context['width'] = 1000;
            if (isCanvasDataUrl || (!this.isImageLoaded && !this.isChartLoaded)) {
                currentY = [];
                currentX = 0;
                height = 0;
            }
            // Loop through rows
            for (let j: number = rowsCount; j < this.endRow; j++) {
                isCanvasDataUrl = true;
                let borderOfHeaderText: boolean = false;
                this.isColumn = this.isColumn ? this.isColumn : (j === 0);
                const bottomStyle: object = { borderBottom: '1px solid black' };
                const rowHeight: number = (sheet.rows[j as number] && sheet.rows[j as number].height || this.defaultCellHeight);
                this.initialRowCount = j;
                currentX = defaultCellSpace;
                const start: number = i === 0 ? 0 : this.pageCounts[i - 1] + 1;
                const end: number = this.pageCounts[i as number];
                height += (isNullOrUndefined(sheet.rows[j as number]) ? this.defaultCellHeight : rowHeight + (j === 0 && allowColumnAndRow
                    ? this.defaultCellHeight : 0));
                let cellHeight: number = isNullOrUndefined(sheet.rows[j as number]) ? this.defaultCellHeight :
                    sheet.rows[j as number] && sheet.rows[j as number].height || this.defaultCellHeight;
                if (height > 1080) {
                    this.startNewPageCount = j;
                    lineHeight = allowColumnAndRow ? rowHeight + (j === 0 && allowColumnAndRow ? this.defaultCellHeight : 0) : 0;
                    borderOfHeaderText = false;
                    this.isColumn = true;
                    if (this.isImageLoaded || this.isChartLoaded) {
                        break;
                    }
                    pageHeight += 1100;
                    if (isCanvasDataUrl) {
                        this.multipleCanvasDataURL.push(canvas.toDataURL());
                    }
                    isCanvasDataUrl = true;
                    canvas = document.createElement('canvas') as HTMLCanvasElement;
                    context = canvas.getContext('2d');
                    canvas.width = 1000;
                    canvas.height = 1100;
                    context.font = '11pt Calibri';
                    context.textBaseline = 'bottom';
                    context['index'] = i;
                    context['width'] = 1000;
                    for (let m: number = 0; m < currentY.length; m++) {
                        if (currentY[m as number] !== undefined) {
                            currentY[m as number] -= height - cellHeight;
                        }
                    }
                    height = (allowColumnAndRow || printOptions.allowGridLines) ?
                        rowHeight + (allowColumnAndRow ? this.defaultCellHeight : 0) : rowHeight;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let style: any = { borderBottom: '1px solid black', borderTop: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black' };
                const rightStyle: object = { borderRight: '1px solid black' };
                if (allowColumnAndRow && this.isColumn) {
                    for (let k: number = start; k <= end; k++) {
                        const columnText: string = getColumnHeaderText(k + 1);
                        const columnIndex: number = k === start ? 2 : 1;
                        context.font = '11pt Calibri';
                        for (let m: number = 0; m < columnIndex; m++) {
                            let titleWidth: number = (m === 0 && columnIndex === 2) ? headerWidth : (sheet.columns[k as number] &&
                                sheet.columns[k as number].hidden ? 0 : ((sheet.columns[k as number] &&
                                    sheet.columns[k as number].width) || this.defaultCellWidth));
                            titleWidth = currentX + titleWidth > 1000 ? titleWidth - 1 - (currentX + titleWidth - 1000) :
                                titleWidth;
                            if (titleWidth !== 0) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const textMetrics: any = context.measureText(columnText);
                                const textWidth: number = textMetrics.width;
                                const locationX: number = printInstance.calculateTextPosition(textWidth, titleWidth, currentX, 'Center');
                                const locationY: number = this.defaultCellHeight;
                                context.fillText(k === start && m === 0 ? '' : columnText, locationX, locationY);
                                printInstance.drawBorder(context, style, currentX, 0, titleWidth, this.defaultCellHeight);
                                currentX += titleWidth;
                                currentY[k as number] = this.defaultCellHeight;
                                if (k === end && (columnIndex === 2 ? m === 1 : m === 0)) {
                                    this.isColumn = !(k === end);
                                    currentX = 0;
                                }
                            } else if (k === end) {
                                this.isColumn = false;
                                currentX = 0;
                            }
                        }
                    }
                }
                if (!isNullOrUndefined(sheet.rows[j as number]) && (isNullOrUndefined(sheet.rows[j as number].hidden) ||
                !sheet.rows[j as number].hidden)) {
                    if (isExtraLine) {
                        const extaSpace: number = sheet.rows.slice(j, j + sheet.rows.length - j).map((row: RowModel) => {
                            return (row && row.height) || this.defaultCellHeight;
                        }).reduce((accumulator: number, currentValue: number) => {
                            return accumulator + (currentValue || this.defaultCellHeight);
                        }, 0);
                        if (canvas.height > (height + (this.chartHeight - extaSpace))) {
                            this.endRow += Math.ceil((this.chartHeight - extaSpace) / 19);
                        } else {
                            this.endRow += Math.ceil((canvas.height - (height + extaSpace)) / 19);
                        }
                        isExtraLine = false;
                    }
                    borderOfHeaderText = this.endRow === sheet.rows.length ? ((height + (sheet.rows[j + 1] ?
                        (sheet.rows[j + 1].height || this.defaultCellHeight) : this.defaultCellHeight)) +
                        (j === 0 && allowColumnAndRow ? this.defaultCellHeight : 0) > 1080) || (j === sheet.rows.length - 1) : false;
                    // Loop through cells in a row
                    for (let k: number = start; k <= end; k++) {
                        const cell: CellModel = sheet.rows[j as number] && !isNullOrUndefined(sheet.rows[j as number].cells) &&
                        sheet.rows[j as number].cells[k as number];
                        if (!isNullOrUndefined(cell) && !isNullOrUndefined(cell.style)) {
                            style = this.setBorderStyle(cell, style);
                        }
                        if (isNullOrUndefined(sheet.columns[k as number]) || isNullOrUndefined(sheet.columns[k as number].hidden) ||
                            !sheet.columns[k as number].hidden) {
                            const isColumnSpan: boolean = !isNullOrUndefined(sheet.rows[j as number].cells) &&
                            !isNullOrUndefined(sheet.rows[j as number].cells[k as number]) &&
                            !isNaN(sheet.rows[j as number].cells[k as number].colSpan) &&
                            start > k + sheet.rows[j as number].cells[k as number].colSpan;
                            const isRowSpan: boolean = !isNullOrUndefined(sheet.rows[j as number].cells) &&
                            !isNullOrUndefined(sheet.rows[j as number].cells[k as number]) &&
                            !isNaN(sheet.rows[j as number].cells[k as number].rowSpan) &&
                            !(j + sheet.rows[j as number].cells[k as number].rowSpan > this.startNewPageCount) &&
                            this.startNewPageCount !== 0;
                            let cellText: string = '';
                            let cellWidthSpan: number;
                            let cellWidth: number;
                            const cellRowSpan: number = !isNullOrUndefined(cell) ? (isNaN(cell.rowSpan) || isColumnSpan || isRowSpan) ? 1 :
                                Math.max(cell.rowSpan, 0) : 1;
                            currentY[k as number] = (isNaN(currentY[k as number]) ? defaultCellSpace : currentY[k as number]);
                            if (allowColumnAndRow && k === start) {
                                context.font = '11pt Calibri';
                                let rowHeaderHeight: number = currentY[k as number];
                                if (cellRowSpan > 0) {
                                    for (let o: number = 0; o < (cellRowSpan === 0 ? 1 : cellRowSpan); o++) {
                                        currentX = 0;
                                        rowHeaderHeight += (o === 0 ? 0 : (sheet.rows[j + o] && sheet.rows[j + o - 1].height ||
                                            this.defaultCellHeight));
                                        printInstance.rowHeaderText((j + 1 + o).toString(), context, printInstance, headerWidth,
                                                                    currentX, style, rowHeaderHeight,
                                                                    sheet.rows[j + o].height || this.defaultCellHeight);
                                        currentX += headerWidth;
                                    }
                                } else {
                                    currentX = 0;
                                    currentX += headerWidth;
                                }
                            }
                            if (!isNullOrUndefined(cell) && cell) {
                                const fontSize: string = (cell.style ? cell.style.fontSize || '11pt' : '11pt');
                                let color: string = (cell.style ? cell.style.color || '#000000' : '#000000');
                                if (!isNaN(sheet.rows[j as number].cells[k as number].rowSpan) &&
                                    sheet.rows[j as number].cells[k as number].rowSpan > 1) {
                                    if (isNaN(sheet.rows[j + 1].cells[k as number].rowSpan)) {
                                        this.parent.merge(`${getColumnHeaderText(k + 1)}${j + 1}:${getColumnHeaderText(k + 1)}${j + sheet.rows[j as number].cells[k as number].rowSpan - 1}`);
                                    }
                                }
                                if (!isNaN(sheet.rows[j as number].cells[k as number].colSpan) &&
                                        sheet.rows[j as number].cells[k as number].colSpan > 1) {
                                    if (!isNullOrUndefined(sheet.rows[j + 1]) && !isNullOrUndefined(sheet.rows[j + 1].cells) &&
                                        sheet.rows[j + 1].cells.length > 0 && (!isNullOrUndefined(sheet.rows[j + 1].cells[k as number]) &&
                                            isNaN(sheet.rows[j + 1].cells[k as number].colSpan))) {
                                        this.parent.merge('' + getColumnHeaderText(k + 1) + (j + 1) + ':' +
                                        getColumnHeaderText(k + 1 + sheet.rows[j  as number].cells[k as number].colSpan - 1) + (j + 1));
                                    } else if (isNullOrUndefined(sheet.rows[j as number].cells[k + 1].colSpan)) {
                                        for (let m: number = 1; m < sheet.rows[j as number].cells[k as number].colSpan; m++) {
                                            sheet.rows[j as number].cells[k + m]['colSpan'] = -m;
                                        }
                                    }
                                }
                                cellWidthSpan = (isNaN(sheet.rows[j as number].cells[k as number].colSpan) || isColumnSpan) ? 1 :
                                    Math.max(sheet.rows[j as number].cells[k as number].colSpan, 0);
                                if (sheet.rows[j as number].cells[k as number].rowSpan && !isColumnSpan &&
                                    sheet.rows[j as number].cells[k as number].rowSpan < 0) {
                                    // eslint-disable-next-line max-len
                                    const colSpan: number = sheet.rows[j + sheet.rows[j as number].cells[k as number].rowSpan].cells[k as number].colSpan;
                                    cellWidthSpan = colSpan ? colSpan : cellWidthSpan;
                                }
                                if ((k === start || (k > 0 && sheet.columns && sheet.columns[k - 1] &&
                                    sheet.columns[k - 1].hidden && (sheet.rows[j as number].cells[k - 1] &&
                                    sheet.rows[j as number].cells[k - 1].colSpan > 1))) &&
                                    cellWidthSpan <= 0) {
                                    cellWidthSpan = 1;
                                }
                                const backgroundColor: string = (cell.style ? cell.style.backgroundColor || '#ffffff' : '#ffffff');
                                const textAlign: string = cell.style ? cell.style['textAlign'] : '';
                                context.font = fontSize;
                                context.fillStyle = color;
                                let cellWidthSpanArray: number[] = [];
                                if (cellWidthSpan > 1) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const widthColumn: any[] = sheet.columns.slice(k, k + cellWidthSpan);
                                    for (let o: number = 0; o < widthColumn.length; o++) {
                                        cellWidthSpanArray.push(widthColumn['hidden'] ? 0 : ((widthColumn[o as number] && widthColumn[o as number]['width']) ||
                                        this.defaultCellWidth));
                                    }
                                    if (cellWidthSpanArray.length === 0){
                                        cellWidthSpanArray.push((this.defaultCellWidth * cellWidthSpan));
                                    }
                                    else if (cellWidthSpanArray.length !== cellWidthSpan) {
                                        cellWidthSpanArray = cellWidthSpanArray.map((value: number) => value +
                                        (this.defaultCellWidth * (cellWidthSpan - 1 - cellWidthSpanArray.length)));
                                    }
                                }
                                cellWidth = cellWidthSpan > 1 ? cellWidthSpanArray.reduce((acc: number, width: number) => acc + width, 0) :
                                    cellWidthSpan === 1 ? (sheet.columns[k as number] && sheet.columns[k as number].width ||
                                            this.defaultCellWidth) : 0;
                                cellWidth = currentX + cellWidth > 1000 ? cellWidth - 1 - (currentX + cellWidth - 1000) : cellWidth;
                                cellHeight = cellRowSpan > 1 ? sheet.rows.slice(j, j + cellRowSpan).map((row: RowModel) => row.height ||
                                    this.defaultCellHeight).reduce((accumulator: number, currentValue: number) => accumulator +
                                        (currentValue || this.defaultCellHeight), 0) : cellRowSpan === 1 ? rowHeight : 0;
                                const verticalAlign: string = (cell.style ? cell.style['verticalAlign'] || 'Bottom' : 'Bottom').toLowerCase();
                                if (!isNullOrUndefined(cell.image) && cell.image.length > 0) {
                                    this.processImages(i, j, cell, canvas, context, height, this.endRow, rowHeight, lineHeight,
                                                       allowColumnAndRow, printOptions, sheet, printInstance, currentX, currentY,
                                                       pageHeight, sheetIndex);
                                }
                                if (!isNullOrUndefined(cell.chart) && cell.chart.length > 0) {
                                    this.handleCharts(i, j, cell, context, canvas, height, this.endRow, this.initialRowCount,
                                                      lineHeight, rowHeight, allowColumnAndRow, printOptions, sheet, printInstance,
                                                      this.multipleCanvasDataURL, currentX, currentY, pageHeight, sheetIndex);
                                }
                                if (!isNullOrUndefined(cell.value) || !isNullOrUndefined(cell.formula) ||
                                    !isNullOrUndefined(cell.hyperlink)) {
                                    let position: string;
                                    if (cell.formula && cell.format) {
                                        if (this.parent.calculationMode === 'Automatic') {
                                            this.parent.notify(
                                                workbookFormulaOperation, {
                                                    action: 'refreshCalculate', rowIndex: j, colIndex: k,
                                                    value: cell.formula, isFormula: checkIsFormula(cell.formula), sheetIndex: sheetIndex
                                                });
                                        }
                                        const numberFormatArgs: NumberFormatArgs = {
                                            value: cell.value, format: cell.format,
                                            rowIndex: j, colIndex: k, sheetIndex: this.parent.activeSheetIndex as number,
                                            cell: cell, refresh: true
                                        };
                                        cellText = this.parent.workbookNumberFormatModule.getFormattedCell(numberFormatArgs);
                                        position = `${textAlign ? textAlign : numberFormatArgs.isRightAlign ? 'Right' : 'Left'}`;
                                        if (numberFormatArgs.color) {
                                            color = numberFormatArgs.color;
                                        }
                                    } else if (cell.format) {
                                        const numberFormatArgs: NumberFormatArgs = {
                                            value: cell.value, format: cell.format,
                                            rowIndex: j, colIndex: k, sheetIndex: this.parent.activeSheetIndex as number,
                                            cell: cell, refresh: true
                                        };
                                        cellText = this.parent.workbookNumberFormatModule.getFormattedCell(numberFormatArgs);
                                        position = `${textAlign ? textAlign : numberFormatArgs.isRightAlign ? 'Right' : 'Left'}`;
                                        if (numberFormatArgs.color) {
                                            color = numberFormatArgs.color;
                                        }
                                    } else if (cell.formula) {
                                        if (this.parent.calculationMode === 'Automatic') {
                                            this.parent.notify(
                                                workbookFormulaOperation, {
                                                    action: 'refreshCalculate', rowIndex: j, colIndex: k,
                                                    value: cell.formula, isFormula: checkIsFormula(cell.formula), sheetIndex: sheetIndex
                                                });
                                        }
                                        cellText = cell.value;
                                        position = `${textAlign ? textAlign : 'Left'}`;
                                    } else {
                                        if (!isNullOrUndefined(cell.hyperlink)) {
                                            if (isNullOrUndefined(cell.value)) {
                                                cell.value = (!isNullOrUndefined(cell.hyperlink) && typeof cell.hyperlink === 'object') ? cell.hyperlink['address'] : cell.hyperlink || cell.hyperlink['address'];
                                            } else if (isNullOrUndefined(cell.value) || cell.value === '') {
                                                cell.value = typeof cell.hyperlink === 'object' ? cell.hyperlink['address'] : cell.hyperlink;
                                            }
                                            color = cell.style ? cell.style.color || '#00e' : '#00e';
                                        }
                                        cellText = cell.value;
                                        const isNumber: boolean = !isNullOrUndefined(cell.value) && cell.value !== '' ? new RegExp('^[^\\p{L}]*$', 'u').test(cell.value) : false;
                                        position = '' + (textAlign ? textAlign : isNumber ? 'Right' : 'Left');
                                    }
                                    const textSize: string = (cell.style ? cell.style.fontSize || '11pt' : '11pt');
                                    const fontFamily: string = (cell.style ? cell.style.fontFamily || 'Calibri' : 'Calibri');
                                    const fontstyle: string = (cell.style ? cell.style.fontStyle || '' : '');
                                    const fontWeight: string = (cell.style ? cell.style.fontWeight || 'normal' : 'normal');
                                    context.font = `${fontstyle} ${fontWeight} ${textSize} ${fontFamily}`;
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    let textMetrics: any = context.measureText(cellText);
                                    let textWidth: number = textMetrics.width;
                                    // eslint-disable-next-line
                                    const textHeight: number = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;                                        
                                    if (cell.wrap) {
                                        const cellLineHeight: number = this.defaultCellHeight < cellHeight ? ((parseInt(textSize.replace('pt', ''), 10) / 72) * 96) : cellHeight;
                                        const endColIdx: number = cell.colSpan > 1 ? k + cell.colSpan - 1 : k;
                                        const colWidth: number = getDPRValue(
                                            getColumnsWidth(sheet, k, endColIdx) - (4 + (getBorderWidth(j, k, sheet) || 1)), true);
                                        const textLines: string[] = this.wrapText(cellText, colWidth, cell.style, this.parent.cellStyle);
                                        const space: number = (textLines.length === 1) ? cellHeight :
                                            (textLines.length * cellLineHeight === cellHeight) ? cellLineHeight :
                                                (textLines.length * cellLineHeight < cellHeight) ?
                                                    cellHeight - ((textLines.length - 1) * cellLineHeight) : cellLineHeight;
                                        const startY: number = currentY[k as number] + (verticalAlign === 'top' ? cellLineHeight : verticalAlign === 'middle' ?
                                            space > cellLineHeight + (space / 4) ? cellLineHeight + (space / 4) : space : space);
                                        context.save();
                                        context.beginPath();
                                        context.rect(currentX, currentY[k as number], cellWidth, cellHeight);
                                        context.clip();
                                        context.fillStyle = backgroundColor;
                                        context.fillRect(currentX, currentY[k as number], cellWidth, (cellHeight + (verticalAlign === 'top' ? cellLineHeight : 0)));
                                        textLines.forEach((line: string, index: number): void => {
                                            context.fillStyle = color;
                                            textMetrics = context.measureText(line);
                                            textWidth = textMetrics.width;
                                            const locationX: number = printInstance.calculateTextPosition(textWidth, cellWidth,
                                                                                                          currentX, position, true);
                                            const locationY: number = startY + index * cellLineHeight;
                                            if (position.toLowerCase() === 'right') {
                                                context.textAlign = 'right';
                                                context.fillText(line.trim(), locationX, locationY);
                                            } else {
                                                context.fillText(line, locationX, locationY);
                                            }
                                            printInstance.textDecoration(cell, context, locationX, locationY,
                                                                         color, textMetrics, cellText, cellWidth);
                                        });
                                        context.restore();
                                    } else {
                                        context.save();
                                        context.beginPath();
                                        context.rect(currentX, currentY[k as number], cellWidth, cellHeight);
                                        context.clip();
                                        context.fillStyle = backgroundColor;
                                        context.fillRect(currentX, currentY[k as number], cellWidth, cellHeight);
                                        context.fillStyle = color;
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        let locationX: any = printInstance.calculateTextPosition(textWidth, cellWidth, currentX,
                                                                                                 position);
                                        let locationY: number = currentY[k as number];
                                        const midValue: number = (cellHeight / 2) + (textHeight / 2);
                                        if (verticalAlign === 'top') {
                                            context.textBaseline = 'top'; // Set baseline to the top to ensure consistent vertical placement. Baseline at top means no additional offset needed
                                        } else if (verticalAlign === 'middle' && cellHeight > midValue) {
                                            locationY += midValue; // Center text vertically
                                        } else {
                                            locationY += cellHeight; // Align text in default or bottom
                                        }
                                        if (!isNullOrUndefined(cell.style)) {
                                            locationY = (!isNullOrUndefined(cell.style.borderBottom) && cell.style.borderBottom.indexOf('double') > -1) || (!isNullOrUndefined(cell.style.borderTop) && cell.style.borderTop.indexOf('double') > -1) ? locationY - 2 : locationY;
                                            locationX = (!isNullOrUndefined(cell.style.borderLeft) && cell.style.borderLeft.indexOf('double') > -1) || (!isNullOrUndefined(cell.style.borderRight) && cell.style.borderRight.indexOf('double') > -1) ? locationX + (position === 'Left' ? 2 : -3) : locationX ;
                                        }
                                        context.fillText(cellText, locationX, locationY);
                                        context.restore();
                                        printInstance.textDecoration(cell, context, locationX, locationY, color,
                                                                     textMetrics, cellText, cellWidth);
                                    }
                                } else {
                                    printInstance.rowHeaderRect(context, currentX, currentY[k as number], cellWidth, cellHeight,
                                                                backgroundColor);
                                }
                            }
                            const currentWidth: number = (cellWidthSpan <= 0 ? cellWidth : (cellWidth ||
                                (sheet.columns[k as number] && sheet.columns[k as number].width) || this.defaultCellWidth));
                            if (printOptions.allowGridLines) {
                                style.borderRight = k === end && allowColumnAndRow ? undefined : '1px solid black';
                                style.borderBottom = '1px solid black';
                                style.borderTop = '1px solid black';
                                style.borderLeft = '1px solid black';
                                printInstance.drawBorder(context, style, currentX, currentY[k as number], currentWidth, cellHeight);
                            }
                            if (cell && cell.style && (cellWidth > 0 || cellHeight > 0) && (cell.style.borderBottom || cell.style.borderTop
                                    || cell.style.borderLeft || cell.style.borderRight && ((isNullOrUndefined(cell.rowSpan) &&
                                    isNullOrUndefined(cell.colSpan)) || (!isNullOrUndefined(cell.rowSpan) && cell.rowSpan > 0) ||
                                    (!isNullOrUndefined(cell.colSpan) && cell.colSpan > 0)))) {
                                printInstance.drawBorder(context, cell.style, currentX,
                                                         (currentY[k as number] <= 0 ? 2 : currentY[k as number]),
                                                         cellWidth, cellHeight);
                            }
                            currentX += currentWidth;
                            let currentYValue: number = 0;
                            if (cellRowSpan > 1) {
                                currentYValue = currentY[k as number];
                                for (let m: number = k; m < k + cellWidthSpan; m++) {
                                    const cell: CellModel = sheet.rows[j as number] && !isNullOrUndefined(sheet.rows[j as number].cells) &&
                                        sheet.rows[j as number].cells[m as number];
                                    if (cell && !isNullOrUndefined(cell.image)) {
                                        this.processImages(i, j, cell, canvas, context, height, this.endRow, rowHeight, lineHeight,
                                                           allowColumnAndRow, printOptions, sheet, printInstance, currentX, currentY,
                                                           pageHeight, sheetIndex);
                                    } else if (cell && !isNullOrUndefined(cell.chart)) {
                                        this.handleCharts(i, j, cell, context, canvas, height, this.endRow, this.initialRowCount,
                                                          lineHeight, rowHeight, allowColumnAndRow, printOptions, sheet, printInstance,
                                                          this.multipleCanvasDataURL, currentX, currentY, pageHeight, sheetIndex);
                                    }
                                    if (cell.style && m === k && cellHeight > 0 && (cell.style.borderBottom || cell.style.borderTop ||
                                        cell.style.borderLeft || cell.style.borderRight)) {
                                        printInstance.drawBorder(context, cell.style, currentX, currentY[k as number], 2,
                                                                 cellHeight);
                                    }
                                    currentY[m as number] = (isNaN(currentY[m as number]) ? defaultCellSpace :
                                        currentY[m as number]) + cellHeight;
                                }
                                k += cellWidthSpan - 1;
                            }
                            if (k === end && allowColumnAndRow) {
                                printInstance.drawBorder(context, rightStyle, currentX - 2, currentY[k as number] - currentYValue,
                                                         2, cellHeight);
                            }
                            if (k === end && allowColumnAndRow && borderOfHeaderText && !isExtraLine) {
                                printInstance.drawBorder(context, bottomStyle, 0, currentY[k as number] - currentYValue,
                                                         currentX, cellHeight);
                                borderOfHeaderText = false;
                            }
                            if (cellRowSpan <= 1) {
                                currentY[k as number] += cellHeight;
                            }
                        } else if (allowColumnAndRow && k === start) {
                            const cellRowSpan: number = !isNullOrUndefined(cell) ?
                                isNaN(sheet.rows[j as number].cells[k as number].rowSpan) ? 1 :
                                    Math.max(sheet.rows[j as number].cells[k as number].rowSpan, 0) : 1;
                            currentY[k as number] = (isNaN(currentY[k as number]) ? defaultCellSpace : currentY[k as number]);
                            let rowHeaderHeight: number = currentY[k as number];
                            context.font = '11pt Calibri';
                            for (let o: number = 0; o < cellRowSpan; o++) {
                                currentX = 0;
                                rowHeaderHeight += (o === 0 ? 0 : (sheet.rows[j + o] && sheet.rows[j + o - 1].height ||
                                    this.defaultCellHeight));
                                printInstance.rowHeaderText((j + 1 + o).toString(), context, printInstance, headerWidth, currentX,
                                                            style, rowHeaderHeight, sheet.rows[j + o].height || this.defaultCellHeight);
                                currentX += headerWidth;
                            }
                            currentY[k as number] += cellHeight;
                        }
                    }
                } else if (isExtraLine || isNullOrUndefined(sheet.rows[j as number])) {
                    let style: object = { borderBottom: '1px solid black', borderTop: '1px solid black', borderLeft: '1px solid black', borderRight: '1px solid black' };
                    borderOfHeaderText = ((height + cellHeight) + (j === 0 && allowColumnAndRow ?
                        this.defaultCellHeight : 0) > 1080) || (j === sheet.rows.length - 1) || (j === this.endRow - 1);
                    for (let k: number = start; k <= end; k++) {
                        const cell: CellModel = sheet.rows[j as number] && !isNullOrUndefined(sheet.rows[j as number].cells) &&
                        sheet.rows[j as number].cells[k as number];
                        if (!isNullOrUndefined(cell) && !isNullOrUndefined(cell.style)) {
                            style = this.setBorderStyle(cell, style);
                        }
                        if (allowColumnAndRow && k === start) {
                            printInstance.rowHeaderText((j + 1).toString(), context, printInstance, headerWidth, currentX, style,
                                                        currentY[k as number], this.defaultCellHeight);
                            currentX += headerWidth;
                        }
                        let cellWidth: number = (sheet.columns[k as number] && sheet.columns[k as number].width || this.defaultCellWidth);
                        cellWidth = currentX + cellWidth > 1000 ? cellWidth - 1 - (currentX + cellWidth - 1000) : cellWidth;
                        currentY[k as number] = (isNaN(currentY[k as number]) ? defaultCellSpace : currentY[k as number]);
                        if (printOptions.allowGridLines) {
                            printInstance.drawBorder(context, style, currentX, currentY[k as number], cellWidth, cellHeight);
                        } else if (allowColumnAndRow && !printOptions.allowGridLines && k === end) {
                            printInstance.drawBorder(context, { borderRight: '1px solid black' }, currentX, currentY[k as number], cellWidth, cellHeight);
                        }
                        currentX += cellWidth;
                        if (k === end && allowColumnAndRow && borderOfHeaderText) {
                            printInstance.drawBorder(context, bottomStyle, 0, currentY[k as number], currentX, cellHeight);
                            borderOfHeaderText = false;
                        }
                        currentY[k as number] += cellHeight;
                    }
                }
            }
            if (!this.isImageLoaded && !this.isChartLoaded) {
                if (isCanvasDataUrl && this.endRow > 0) {
                    this.multipleCanvasDataURL.push(canvas.toDataURL());
                }
                rowsCount = 0;
                if (this.pageCounts.length - 1 === i) {
                    printInstance.canvasPrint(this.parent, sheetIndex, printOptions);
                }
            } else if (this.isImageLoaded || this.isChartLoaded) {
                break;
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private setBorderStyle(cell: CellModel, style: any): any {
        style.borderBottom = !isNullOrUndefined(cell.style.borderBottom) ? cell.style.borderBottom : style.borderBottom ;
        style.borderTop = !isNullOrUndefined(cell.style.borderTop) ? cell.style.borderTop : style.borderTop ;
        style.borderRight = !isNullOrUndefined(cell.style.borderRight) ? cell.style.borderRight : style.borderRight ;
        style.borderLeft = !isNullOrUndefined(cell.style.borderLeft) ? cell.style.borderLeft : style.borderLeft ;
        return style;
    }

    private setToDefault(): void {
        this.parent.currentPrintSheetIndex = 0;
        this.initialRowCount = 0;
        this.chartHeight = 0;
        this.totalCharts = 0;
        this.totalImages = 0;
        this.chartLoadedCount = 0;
        this.imageLoadedCount = 0;
        this.endRow = 0;
        this.pageCounts = [];
        this.multipleCanvasDataURL = [];
        this.chartElements = [];
        this.isChartLoaded = false;
        this.isImageLoaded = false;
        this.startNewPageCount = 0;
    }
    private handleCharts(
        i: number, j: number, cell: CellModel, context: CanvasRenderingContext2D, canvas: HTMLCanvasElement,
        height: number, rowCount: number,
        initialRowCount: number, lineHeight: number, rowHeight: number, allowColumnAndRow: boolean, printOptions: PrintOptions,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sheet: SheetModel, printInstance: any, multipleCanvasDataURL: string[], currentX: number,
        currentY: number[], pageHeight: number, sheetIndex: number): void {
        if (!isNullOrUndefined(cell.chart)) {
            for (const chart of cell.chart) {
                this.totalCharts += 1;
                const image: HTMLImageElement = new Image();
                chart.left = !isNullOrUndefined(chart.left) ? chart.left : 0;
                chart.top = !isNullOrUndefined(chart.top) ? chart.top : 0;
                let chartElement: HTMLElement = document.getElementById(chart.id);
                if (isNullOrUndefined(chartElement)) {
                    this.parent.insertChart([chart]);
                    chartElement = document.getElementById(chart.id);
                    this.chartElements.push(chart.id + '_overlay');
                }
                if (!isNullOrUndefined(chartElement)) {
                    this.chartHeight = chart.height;
                    const isExtraLine: boolean = (this.initialRowCount + Math.ceil(chart.height / 19) > this.endRow) &&
                                                 (printOptions.allowRowColumnHeader || printOptions.allowGridLines);
                    if (isExtraLine) {
                        if (sheet.rows.length - 1 === j) {
                            const extraSpace: number = rowHeight + (allowColumnAndRow ? this.defaultCellHeight : 0);
                            if (canvas.height > height + (this.chartHeight - extraSpace)) {
                                this.endRow += Math.ceil((this.chartHeight - extraSpace) / 19);
                            } else {
                                this.endRow += Math.ceil((canvas.height - (height + extraSpace)) / 19);
                            }
                        }
                    }
                    const svgElement: HTMLElement = chartElement.cloneNode(true) as HTMLElement;
                    const url: string = window.URL.createObjectURL(
                        new Blob(
                            [(new XMLSerializer()).serializeToString(svgElement.childNodes[1] as Node)],
                            { type: 'image/svg+xml' }
                        )
                    );
                    image.onload = () => {
                        const chartLeftIndex: number = Math.ceil(chart.left / 1000) - 1;
                        const chartTopIndex: number = Math.ceil(chart.top / 1080) - 1;
                        const left: number = chart.left + (allowColumnAndRow ? 37 : 0);
                        const top: number = chart.top + (allowColumnAndRow ? 19 : 0) + (chartTopIndex > 0 ? lineHeight : 0);
                        context.drawImage(
                            image, chartLeftIndex <= 0 ? left : left - (chartLeftIndex * 1000),
                            chartTopIndex <= 0 ? top : top - (chartTopIndex * 1160), chart.width, chart.height);
                        this.chartLoadedCount++;
                        if (this.chartLoadedCount === this.totalCharts) {
                            currentX += chart.width;
                            this.isChartLoaded = false;
                            if (!this.isImageLoaded) {
                                multipleCanvasDataURL.push(canvas.toDataURL());
                                const startValue: number = (this.initialRowCount === sheet.rows.length - 1 && height < 1080) ?
                                    sheet.rows.length : this.initialRowCount;
                                const endValue: number = this.endRow;
                                this.processCell(i, (startValue + 1 === endValue ? endValue : startValue), endValue, currentX, currentY,
                                                 context, canvas, sheet, printInstance, pageHeight, height, false,
                                                 sheetIndex, printOptions);
                            }
                        }
                    };
                    image.src = url;
                    this.isChartLoaded = true;
                }
            }
        }
    }
    private processImages(
        i: number, j: number, cell: CellModel, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D,
        height: number, rowCount: number, rowHeight: number, lineHeight: number, allowColumnAndRow: boolean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        printOptions: PrintOptions, sheet: SheetModel, printInstance: any, currentX: number,
        currentY: number[], pageHeight: number, sheetIndex: number
    ): void {
        if (!isNullOrUndefined(cell.image)) {
            for (const image of cell.image) {
                this.totalImages += 1;
                const img: HTMLImageElement = new Image();
                img.src = image.src;
                image.left = !isNullOrUndefined(image.left) ? image.left : 0;
                image.top = !isNullOrUndefined(image.top) ? image.top : 0;
                this.chartHeight = image.height;
                const isExtraLine: boolean = (this.initialRowCount + Math.ceil(image.height / 19) > this.endRow) &&
                    (printOptions.allowRowColumnHeader || printOptions.allowGridLines);
                if (isExtraLine) {
                    if (j === sheet.rows.length - 1) {
                        const extraSpace: number = (rowHeight + (allowColumnAndRow ? this.defaultCellHeight : 0));
                        if (canvas.height > (height + (this.chartHeight - extraSpace))) {
                            this.endRow += Math.ceil((this.chartHeight - extraSpace) / 19);
                        } else {
                            this.endRow += Math.ceil((canvas.height - (height + extraSpace)) / 19);
                        }
                    }
                }
                img.onload = () => {
                    const imageLeftIndex: number = Math.ceil(image.left / 1000) - 1;
                    const imageTopIndex: number = Math.ceil(image.top / 1080) - 1;
                    const left: number = image.left + (allowColumnAndRow ? 37 : 0);
                    const top: number = image.top + (allowColumnAndRow ? 19 : 0) + (imageTopIndex > 0 ? lineHeight : 0);
                    context.drawImage(
                        img,
                        (imageLeftIndex <= 0 ? left : left - (imageLeftIndex * 1000)),
                        (imageTopIndex <= 0 ? top : top - (imageTopIndex * 1160)),
                        image.width,
                        image.height
                    );
                    this.imageLoadedCount++;
                    if (this.imageLoadedCount === this.totalImages) {
                        this.isImageLoaded = false;
                        currentX += image.width;
                        if (!this.isChartLoaded) {
                            this.multipleCanvasDataURL.push(canvas.toDataURL());
                            const startValue: number = (this.initialRowCount === sheet.rows.length - 1 &&
                                height < 1080) ? sheet.rows.length : this.initialRowCount;
                            const endValue: number = this.endRow;
                            this.processCell(i, (startValue + 1 === endValue ? endValue : startValue), endValue, currentX, currentY,
                                             context, canvas, sheet, printInstance, pageHeight, height, false,
                                             sheetIndex, printOptions);
                        }
                    }
                };
                img.onerror = () => {
                    this.imageLoadedCount++; // Increment count to prevent indefinite waiting
                    if (this.imageLoadedCount === this.totalImages) {
                        this.isImageLoaded = false;
                        if (!this.isChartLoaded) {
                            this.multipleCanvasDataURL.push(canvas.toDataURL());
                            const startValue: number = (this.initialRowCount === sheet.rows.length - 1 &&
                                height < 1080) ? sheet.rows.length : this.initialRowCount;
                            const endValue: number = this.endRow;
                            this.processCell(i, (startValue + 1 === endValue ? endValue : startValue), endValue, currentX, currentY,
                                             context, canvas, sheet, printInstance,
                                             pageHeight, height, false, sheetIndex, printOptions);
                        }
                    }
                };
            }
            this.isImageLoaded = true;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private textDecoration(cell: CellModel, context: any, locationX: number, locationY: number, color: string,
                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           textMetrics: any, cellText: string, cellWidth: number): void {
        if (cellText !== '' && (!isNullOrUndefined(cell.style) && !isNullOrUndefined(cell.style.textDecoration) &&
            cell.style.textDecoration.toLowerCase().indexOf('underline') > -1 || !isNullOrUndefined(cell.hyperlink))) {
            context.beginPath();
            context.moveTo(locationX, locationY - 3);
            context.lineTo(locationX + (textMetrics.width > cellWidth ? cellWidth :
                textMetrics.width), locationY - 3);
            context.strokeStyle = color;
            context.lineWidth = 1;
            context.stroke();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private rowHeaderRect(context: any, currentX: number, currentY: number, cellWidth: number, cellHeight: number,
                          backgroundColor: string = '#ffffff'): void {
        context.save();
        context.beginPath();
        context.rect(currentX, currentY, cellWidth, cellHeight);
        context.clip();
        context.fillStyle = backgroundColor;
        context.fillRect(currentX, currentY, cellWidth, cellHeight);
        context.restore();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private rowHeaderText(rowText: string, context: any, printInstance: any, headerWidth: number, currentX: number, style: any,
                          currentY: number, height: number): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const textMetrics: any = context.measureText(rowText);
        const textWidth: number = textMetrics.width;
        const locationX: number = printInstance.calculateTextPosition(textWidth, headerWidth, currentX, 'Center');
        const locationY: number = currentY;
        context.save();
        context.beginPath();
        context.rect(currentX, currentY, headerWidth, height);
        context.clip();
        context.fillStyle = '#000000';
        context.fillText(rowText, locationX, (locationY + height));
        printInstance.drawBorder(context, style, currentX, (currentY || 0), headerWidth, height);
        context.restore();
    }
    private canvasPrint(spreadSheet: Spreadsheet, sheetIndex: number, printOptions: PrintOptions): void {
        if (printOptions.type === 'Workbook' && (this.totalSheetCount.length - 1) >= this.workbookActiveSheetCount) {
            const currentSheetIndex: number = this.totalSheetCount[this.workbookActiveSheetCount];
            const sheet: SheetModel = spreadSheet.sheets[currentSheetIndex as number];
            this.workbookActiveSheetCount++;
            this.activeSheetPrint(spreadSheet, sheet, printOptions, currentSheetIndex);
        } else {
            for (let i: number = 0; i < this.chartElements.length; i++) {
                const chartElement: HTMLElement = document.getElementById(this.chartElements[i as number]);
                if (!isNullOrUndefined(chartElement)) {
                    chartElement.remove();
                }
            }
            if (this.multipleCanvasDataURL.length > 0) {
                const browserUserAgent: string = navigator.userAgent;
                const printWindow: Window = window.open(' ', '_blank', 'height=' + window.outerHeight + ',width=' + window.outerWidth + ',tabbar=no');
                if (printWindow) {
                    printWindow.document.write('<html><head><title></title></head><body>');
                    const canvasWidth: number = 1000; // Adjust as needed
                    const canvasHeight: number = 1400; // Adjust as needed
                    if ((browserUserAgent.indexOf('Chrome') !== -1) || (browserUserAgent.indexOf('Safari') !== -1) ||
                        (browserUserAgent.indexOf('Firefox')) !== -1) {
                        printWindow.document.write('<!DOCTYPE html>');
                        printWindow.document.write('<html><head><style>html, body {  }'
                            + ' img { height: 100%; width: 100%; display: block; }@media print { body {  }'
                            + ' img { width:100%; width:100%; box-sizing: border-box; }br, button { display: none; }'
                            + ' div{ page-break-inside: avoid; }} @page{ size:' + canvasWidth.toString() + 'px ' + canvasHeight.toString() + 'px; }</style></head><body>');
                    }
                    else {
                        printWindow.document.write('<!DOCTYPE html>');
                        printWindow.document.write('<html><head>'
                            + '<style>html, body {  } img { height: 100%; width: 100%; }@media print { body {  }'
                            + 'img { width:100%; width:100%; box-sizing: border-box; }br, button { display: none; } '
                            + 'div{ page-break-inside: avoid; }} @page{ size:' + canvasWidth.toString() + 'px ' + canvasHeight.toString() + 'px; }</style></head><body>');
                    }
                    this.multipleCanvasDataURL.forEach((dataURL: string, index: number) => {
                        const canvas: HTMLCanvasElement = printWindow.document.createElement('canvas');
                        canvas.width = canvasWidth;
                        canvas.height = canvasHeight;
                        const context: CanvasRenderingContext2D = canvas.getContext('2d');
                        const image: HTMLImageElement = new Image();
                        image.onload = () => {
                            context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
                            if (index === this.multipleCanvasDataURL.length - 1) {
                                spreadSheet.isPrintingProcessing = false;
                                printWindow.print();
                                printWindow.document.close();
                                printWindow.close();
                                spreadSheet.printModule.setToDefault();
                            }
                        };
                        image.src = dataURL;
                        printWindow.document.body.appendChild(canvas);
                    });
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private drawBorder(context: CanvasRenderingContext2D, borderStyles: any, locationX: number, locationY: number, cellWidth: number,
                       cellHeight: number): void {
        const { borderBottom, borderLeft, borderRight, borderTop, borderColor } = borderStyles;
        context.strokeStyle = borderColor || 'black';
        if (!isNullOrUndefined(borderBottom) && borderBottom.indexOf('#FFFFFF') === -1) {
            context.strokeStyle = borderBottom.split(' ')[2];
            this.drawPath(locationX, (locationY === 2 ? -2 : locationY) + cellHeight, locationX + cellWidth,
                          (locationY === 2 ? -2 : locationY) + cellHeight, context, borderBottom, false, borderStyles, 'bottom');
        }
        if (!isNullOrUndefined(borderLeft) && borderLeft.indexOf('#FFFFFF') === -1) {
            context.strokeStyle = borderLeft.split(' ')[2];
            this.drawPath(locationX, locationY, locationX, (locationY === 2 ? -2 : locationY) + cellHeight, context,
                          borderLeft, true, borderStyles, 'left');
        }
        if (!isNullOrUndefined(borderRight) && borderRight.indexOf('#FFFFFF') === -1) {
            context.strokeStyle = borderRight.split(' ')[2];
            this.drawPath(locationX + cellWidth, locationY, locationX + cellWidth, (locationY === 2 ? -2 : locationY) + cellHeight,
                          context, borderRight, false, borderStyles, 'right');
        }
        if (!isNullOrUndefined(borderTop) && borderTop.indexOf('#FFFFFF') === -1) {
            context.strokeStyle = borderTop.split(' ')[2];
            this.drawPath(locationX, locationY, locationX + cellWidth, locationY, context, borderTop, true, borderStyles, 'top');
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private drawPath(startX: number, startY: number, endX: number, endY: number, context: CanvasRenderingContext2D, border: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                     isLeftOrTop: boolean, borderStyles: any, position: string): void {
        context.beginPath();
        if (border.indexOf('dashed') > -1) {
            context.setLineDash([3, 2]);
            context.lineWidth = border.split(' ')[0].split('')[0];
        } else if (border.indexOf('dotted') > -1) {
            context.setLineDash([1, 1]);
            context.lineWidth = border.split(' ')[0].split('')[0];
        } else if (border.indexOf('double') > -1) {
            context.setLineDash([]);
            const isAllBorder: boolean = !isNullOrUndefined(borderStyles.borderBottom) && !isNullOrUndefined(borderStyles.borderLeft) &&
                !isNullOrUndefined(borderStyles.borderRight) && !isNullOrUndefined(borderStyles.borderTop);
            const isLeftBottom: boolean = !isNullOrUndefined(borderStyles.borderBottom) && !isNullOrUndefined(borderStyles.borderLeft) &&
                isNullOrUndefined(borderStyles.borderRight) && isNullOrUndefined(borderStyles.borderTop);
            const isLeftTop: boolean = isNullOrUndefined(borderStyles.borderBottom) && !isNullOrUndefined(borderStyles.borderLeft) &&
                isNullOrUndefined(borderStyles.borderRight) && !isNullOrUndefined(borderStyles.borderTop);
            const isLeftTopBotom: boolean = !isNullOrUndefined(borderStyles.borderBottom) && !isNullOrUndefined(borderStyles.borderLeft) &&
                isNullOrUndefined(borderStyles.borderRight) && !isNullOrUndefined(borderStyles.borderTop);
            const isRightBottom: boolean = !isNullOrUndefined(borderStyles.borderBottom) && isNullOrUndefined(borderStyles.borderLeft) &&
                !isNullOrUndefined(borderStyles.borderRight) && isNullOrUndefined(borderStyles.borderTop);
            const isRightTop: boolean = isNullOrUndefined(borderStyles.borderBottom) && isNullOrUndefined(borderStyles.borderLeft) &&
                !isNullOrUndefined(borderStyles.borderRight) && !isNullOrUndefined(borderStyles.borderTop);
            const isRightTopBottom: boolean = !isNullOrUndefined(borderStyles.borderBottom) && isNullOrUndefined(borderStyles.borderLeft) &&
                !isNullOrUndefined(borderStyles.borderRight) && !isNullOrUndefined(borderStyles.borderTop);
            const isLeftTopRight: boolean = isNullOrUndefined(borderStyles.borderBottom) && !isNullOrUndefined(borderStyles.borderLeft) &&
                !isNullOrUndefined(borderStyles.borderRight) && !isNullOrUndefined(borderStyles.borderTop);
            const isLeftBottomRight: boolean = !isNullOrUndefined(borderStyles.borderBottom) && !isNullOrUndefined(borderStyles.borderLeft)
                && !isNullOrUndefined(borderStyles.borderRight) && isNullOrUndefined(borderStyles.borderTop);
            context.lineWidth = 1;
            const extraSpace: number = 3;
            if (isAllBorder) {
                if (startX === endX) {
                    if (isLeftOrTop) {
                        this.drawDoubleBorder(context, startX, startY, endX, endY, startX + extraSpace, startY + extraSpace,
                                              endX + extraSpace, endY - (extraSpace - 1));
                    } else {
                        this.drawDoubleBorder(context, startX, startY, endX, endY, startX - extraSpace, startY + extraSpace,
                                              endX - extraSpace, endY - (extraSpace - 1));
                    }
                }
                else if (startY === endY) {
                    if (isLeftOrTop) {
                        this.drawDoubleBorder(context, startX, startY, endX, endY, startX + (extraSpace - 1), startY + extraSpace,
                                              endX - (extraSpace - 1), endY + extraSpace);
                    } else {
                        this.drawDoubleBorder(context, startX, startY, endX, endY, startX + (extraSpace - 1), startY - extraSpace,
                                              endX - (extraSpace - 1), endY - extraSpace);
                    }
                }
            } else if (isLeftBottom) {
                if (position === 'left') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + extraSpace, startY, endX + extraSpace,
                                          endY - (extraSpace - 1));
                }
                else {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + (extraSpace - 1), startY - extraSpace,
                                          endX, endY - extraSpace);
                }
            }
            else if (isLeftTop) {
                if (position === 'left') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + extraSpace, startY + (extraSpace - 1),
                                          endX + extraSpace, endY);
                }
                else {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + (extraSpace - 1), startY + extraSpace,
                                          endX, endY + extraSpace);
                }
            }
            else if (isLeftTopBotom) {
                if (position === 'left') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + extraSpace, startY + extraSpace,
                                          endX + extraSpace, endY - (extraSpace - 1));
                }
                else if (position === 'top') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + (extraSpace - 1), startY + extraSpace,
                                          endX, endY + extraSpace);
                } else {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + (extraSpace - 1), startY - extraSpace,
                                          endX, endY - extraSpace);
                }
            }
            else if (isRightBottom) {
                if (position === 'right') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX - extraSpace, startY, endX - extraSpace,
                                          endY - (extraSpace - 1));
                }
                else {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX, startY - extraSpace, endX - (extraSpace - 1),
                                          endY - extraSpace);
                }
            }
            else if (isRightTop) {
                if (position === 'right') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX - extraSpace, startY + extraSpace,
                                          endX - extraSpace, endY);
                }
                else {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX, startY + extraSpace, endX - (extraSpace - 1),
                                          endY + extraSpace);
                }
            }
            else if (isRightTopBottom) {
                if (position === 'right') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX - extraSpace, startY + extraSpace,
                                          endX - extraSpace, endY - (extraSpace - 1));
                }
                else if (position === 'top') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX, startY + extraSpace, endX - (extraSpace - 1),
                                          endY + extraSpace);
                } else {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX, startY - extraSpace, endX - (extraSpace - 1),
                                          endY - extraSpace);
                }
            }
            else if (isLeftTopRight) {
                if (position === 'right') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX - extraSpace, startY + extraSpace,
                                          endX - extraSpace, endY);
                }
                else if (position === 'top') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + extraSpace, startY + extraSpace,
                                          endX - (extraSpace - 1), endY + extraSpace);
                } else {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + extraSpace, startY + extraSpace,
                                          endX + extraSpace, endY);
                }
            }
            else if (isLeftBottomRight) {
                if (position === 'right') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX - extraSpace, startY, endX - extraSpace,
                                          endY - (extraSpace - 1));
                }
                else if (position === 'bottom') {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + (extraSpace - 1), startY - extraSpace,
                                          endX - (extraSpace - 1), endY - extraSpace);
                } else {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + extraSpace, startY, endX + extraSpace,
                                          endY - (extraSpace - 1));
                }
            }
            else {
                if (startX === endX) {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX + (position === 'left' ? extraSpace : -extraSpace),
                                          startY, endX + (position === 'left' ? extraSpace : -extraSpace), endY);
                }
                else if (startY === endY) {
                    this.drawDoubleBorder(context, startX, startY, endX, endY, startX, startY +
                                          (position === 'top' ? extraSpace : -extraSpace), endX, endY + (position === 'top' ? extraSpace : -extraSpace));
                }
            }
            context.stroke();
            return;
        } else {
            context.setLineDash([]);
            context.lineWidth = border.split(' ')[0].split('')[0];
        }
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
    }

    private drawDoubleBorder(context: CanvasRenderingContext2D, startX1: number, startY1: number, endX1: number, endY1: number,
                             startX2: number, startY2: number, endX2: number, endY2: number) : void {
        context.moveTo(startX1, startY1);
        context.lineTo(endX1, endY1);
        context.moveTo(startX2, startY2);
        context.lineTo(endX2, endY2);
    }

    private calculateTextPosition(textWidth: number, totalWidth: number, currentX: number, position: string, isWrap?: boolean): number {
        let x: number;
        const space: number = 3;
        const availableSpace: number = totalWidth;
        if (availableSpace >= textWidth) {
            switch (position.toLowerCase()) {
            case 'left':
                x = currentX + space;
                break;
            case 'center':
                x = currentX + (availableSpace - textWidth) / 2;
                break;
            case 'right':
                if (isWrap) {
                    x = currentX + (availableSpace - space);
                } else {
                    x = currentX + (availableSpace - space) - textWidth;
                }
                break;
            }
        } else if (textWidth < totalWidth) {
            x = position.toLowerCase() === 'left' ? currentX + space : position.toLowerCase() === 'center' ? currentX + (totalWidth - textWidth) / 2
                : currentX + totalWidth - textWidth;
        } else {
            x = currentX + space;
        }
        return x;
    }
    private calculatePageCount(sheet: SheetModel, columnHeaderWidth: number, allowColumnAndRow: boolean): number[] {
        let allowHeader: boolean = allowColumnAndRow;
        const colIndex: number = this.columnIndex;
        if (sheet.columns.length === 0) {
            const columnCount: number = Math.floor(columnHeaderWidth / this.defaultCellWidth) - (allowHeader ? 1 : 0);
            return Array(Math.max(1, Math.ceil(colIndex / columnCount))).fill(columnCount);
        }
        let pageWidthCount: number = 0;
        const pageCount: number[] = [];
        for (let i: number = 0; i <= colIndex; i++) {
            const column: ColumnModel = sheet.columns && sheet.columns[i as number];
            const columnWidth: number = (allowHeader ? 27 : 0) + ((column && column.hidden) ? 0 :
                (column && !isNullOrUndefined(column.width)) ? column.width : this.defaultCellWidth);
            pageWidthCount += columnWidth;
            allowHeader = false;
            if (pageWidthCount > columnHeaderWidth) {
                pageCount.push(i - 1);
                allowHeader = true;
                pageWidthCount = columnWidth;
            }
        }
        if (pageCount.length === 0 || colIndex > pageCount[pageCount.length - 1]) {
            pageCount.push(colIndex);
        }
        return pageCount;
    }
    private wrapText(text: string, colwidth: number, style: CellStyleModel, parentStyle: CellStyleModel): string[] {
        if (isNullOrUndefined(text)) {
            return [''];
        }
        const displayText: string[] = [];
        let width: number; let splitTextArr: string[]; let lWidth: number; let cWidth: number; let prevChars: string;
        let prevWidth: number = 0;
        let textArr: string[] = [];
        text = text.toString();
        if (text.includes('\n')) {
            const textArr1: string[] = text.split('\n');
            textArr1.forEach((line: string) => {
                textArr.push(...line.split(' ').filter((word: string) => word !== ''), '\n');
            });
            textArr.pop();
        } else {
            textArr = text.split(' ');
        }
        const spaceWidth: number = getTextWidth(' ', style, parentStyle, true);
        let hypenWidth: number; let lines: number; let lineText: string = '';
        const calculateCount: (txt: string) => void = (txt: string): void => {
            if (prevWidth) {
                displayText.push(lineText);
            }
            if (getDPRValue(width / colwidth, true) > 1) {
                txt.split('').forEach((val: string) => {
                    cWidth = getTextWidth(val, style, parentStyle, true);
                    lWidth += cWidth;
                    prevChars += val;
                    if (getDPRValue(lWidth, true) > colwidth) {
                        displayText.push(prevChars);
                        lWidth = cWidth;
                        prevChars = val;
                    }
                });
                width = lWidth;
                txt = prevChars;
            }
            lineText = txt;
            prevWidth = width;
        };
        const lastTextLen: number = textArr.length - 1;
        const addSpace: (size: number, textIdx: number) => void = (size: number, textIdx: number): void => {
            if (getDPRValue(size + spaceWidth, true) / colwidth >= 1) {
                width += 0;
            } else {
                width += spaceWidth;
                if (textIdx !== lastTextLen) {
                    lineText += ' ';
                }
            }
        };
        textArr.forEach((txt: string, textIdx: number) => {
            lWidth = 0; cWidth = 0; prevChars = '';
            if (txt === '\n') {
                displayText.push(lineText);
                lineText = '';
                prevWidth = 0;
                return;
            }
            width = getTextWidth(txt, style, parentStyle, true);
            lines = getDPRValue(prevWidth + width, true) / colwidth;
            if (lines > 1) {
                splitTextArr = txt.split('-');
                if (splitTextArr.length > 1) {
                    const lastIdx: number = splitTextArr.length - 1;
                    splitTextArr.forEach((splitText: string, index: number) => {
                        lWidth = 0; cWidth = 0; prevChars = '';
                        if (!hypenWidth) { hypenWidth = getTextWidth('-', style, parentStyle, true); }
                        width = getTextWidth(splitText, style, parentStyle, true);
                        if (index < lastIdx) {
                            width += hypenWidth;
                            splitText += '-';
                        }
                        lines = getDPRValue(prevWidth + width, true) / colwidth;
                        if (lines > 1) {
                            calculateCount(splitText);
                            if (index === lastIdx) {
                                addSpace(width, textIdx);
                            }
                        } else {
                            lineText += splitText;
                            if (index === lastIdx && textArr[textArr.length - 1] !== txt) {
                                addSpace(prevWidth + width, textIdx);
                            }
                            prevWidth += width;
                        }
                    });
                } else {
                    calculateCount(txt);
                    addSpace(width, textIdx);
                }
            } else {
                lineText += txt;
                addSpace(prevWidth + width, textIdx);
                prevWidth += width;
            }
        });
        if (prevWidth) {
            displayText.push(lineText);
        }
        return displayText;
    }

    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name.
     */
    protected getModuleName(): string {
        return 'print';
    }

    /**
     * To destroy the print.
     *
     * @returns {void}
     * @private
     */
    public destroy(): void {
        this.setToDefault();
        this.totalSheetCount = [];
        this.parent = null;
    }
}
