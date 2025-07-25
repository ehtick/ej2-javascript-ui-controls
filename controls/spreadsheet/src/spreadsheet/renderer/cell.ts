import { Spreadsheet } from '../base/index';
import { ICellRenderer, CellRenderEventArgs, inView, CellRenderArgs, renderFilterCell, deleteNote, showNote, PreviousCellDetails } from '../common/index';
import { createHyperlinkElement, checkPrevMerge, createImageElement, IRenderer, createNoteIndicator } from '../common/index';
import { removeAllChildren, setRowEleHeight } from '../common/index';
import { getColumnHeaderText, CellStyleModel, CellFormatArgs, getRangeIndexes, getRangeAddress, ExtendedImageModel } from '../../workbook/common/index';
import { CellStyleExtendedModel, setChart, refreshChart, getCellAddress, ValidationModel, MergeArgs } from '../../workbook/common/index';
import { CellModel, SheetModel, skipDefaultValue, isHiddenRow, RangeModel, isHiddenCol, isImported } from '../../workbook/index';
import { getRowHeight, getCell, getColumnWidth, getSheet, setCell, ColumnModel, checkColumnValidation } from '../../workbook/base/index';
import { addClass, attributes, extend, compile, isNullOrUndefined, detach, append } from '@syncfusion/ej2-base';
import { getFormattedCellObject, applyCellFormat, workbookFormulaOperation, wrapEvent, applyCF } from '../../workbook/common/index';
import { getTypeFromFormat, activeCellMergedRange, updateHighlight, getCellIndexes, updateView, skipHiddenIdx } from '../../workbook/index';
import { checkIsFormula, ApplyCFArgs, NumberFormatArgs, ExtendedCellModel, calculateFormula } from '../../workbook/common/index';
import { addListValidationDropdown } from './../../workbook/common/index';
/**
 * CellRenderer class which responsible for building cell content.
 *
 * @hidden
 */
export class CellRenderer implements ICellRenderer {
    private parent: Spreadsheet;
    private element: HTMLTableCellElement;
    private th: HTMLTableCellElement;
    private tableRow: HTMLElement;
    private isFormulaCell: boolean;
    constructor(parent?: Spreadsheet) {
        this.parent = parent;
        this.element = this.parent.createElement('td') as HTMLTableCellElement;
        this.th = this.parent.createElement('th', { className: 'e-header-cell' }) as HTMLTableCellElement;
        this.tableRow = parent.createElement('tr', { className: 'e-row' });
        this.parent.on(updateView, this.updateView, this);
        this.parent.on(calculateFormula, this.calculateFormula, this);
    }

    public renderColHeader(index: number, row: Element, refChild?: Element): void {
        const headerCell: HTMLElement = this.th.cloneNode() as HTMLElement;
        const headerText: string = getColumnHeaderText(index + 1);
        headerCell.innerText = headerText;
        const sheet: SheetModel = this.parent.getActiveSheet();
        if (isHiddenCol(sheet, index + 1)) { headerCell.classList.add('e-hide-start'); }
        if (index !== 0 && isHiddenCol(sheet, index - 1)) { headerCell.classList.add('e-hide-end'); }
        if (refChild) {
            row.insertBefore(headerCell, refChild);
        } else {
            row.appendChild(headerCell);
        }
        this.parent.trigger(
            'beforeCellRender', <CellRenderEventArgs>{ cell: null, element: headerCell, address: headerText, colIndex: index });
        this.parent.notify(renderFilterCell, { td: headerCell, rowIndex: 0, colIndex: index });
        attributes(headerCell, { 'aria-colindex': (index + 1).toString(), 'tabindex': '-1' });
    }
    public renderRowHeader(index: number, row: Element, refChild?: Element): void {
        const headerCell: HTMLElement = this.element.cloneNode() as HTMLElement;
        addClass([headerCell], 'e-header-cell');
        attributes(headerCell, { 'role': 'rowheader', 'tabindex': '-1' });
        headerCell.innerText = (index + 1).toString();
        if (refChild) {
            row.insertBefore(headerCell, refChild);
        } else {
            row.appendChild(headerCell);
        }
        this.parent.trigger(
            'beforeCellRender', <CellRenderEventArgs>{ cell: null, element: headerCell, address: `${index + 1}`, rowIndex: index });
    }
    public render(args: CellRenderArgs): Element {
        const sheet: SheetModel = this.parent.getActiveSheet();
        args.td = this.element.cloneNode() as HTMLTableCellElement;
        args.td.className = 'e-cell';
        attributes(args.td, { 'aria-colindex': (args.colIdx + 1).toString(), 'tabindex': '-1' });
        if (this.checkMerged(args)) {
            this.createImageAndChart(args);
            if (args.refChild) {
                args.row.insertBefore(args.td, args.refChild);
            } else {
                args.row.appendChild(args.td);
            }
            return args.td;
        }
        args.isRefresh = false;
        args.skipFormatCheck = isImported(this.parent);
        const isTemplateCell: boolean = this.update(args);
        if (args.checkCF && args.cell && sheet.conditionalFormats && sheet.conditionalFormats.length) {
            this.parent.notify(
                applyCF, <ApplyCFArgs>{ indexes: [args.rowIdx, args.colIdx], cell: args.cell, ele: args.td, isRender: true });
        }
        if (!args.td.classList.contains('e-cell-template')) {
            this.parent.notify(renderFilterCell, { td: args.td, rowIndex: args.rowIdx, colIndex: args.colIdx });
        }
        if (args.refChild) {
            args.row.insertBefore(args.td, args.refChild);
        } else {
            args.row.appendChild(args.td);
        }
        if (this.parent.enableRtl &&
            (!args.cell.style || !args.cell.style.borderRight || args.cell.style.borderRight !== 'none')) {
            const prevCellModel: CellModel = getCell(args.rowIdx, args.colIdx - 1, sheet);
            if (prevCellModel && prevCellModel.style && prevCellModel.style.borderLeft) {
                const prevEle: HTMLTableCellElement = this.parent.getCell(args.rowIdx, args.colIdx - 1) as HTMLTableCellElement;
                const formatArgs: CellFormatArgs = Object.assign({}, <CellFormatArgs>args, {
                    cell: prevCellModel,
                    colIdx: args.colIdx - 1,
                    td: prevEle,
                    prevCell: args.td,
                    style: { borderLeft: prevCellModel.style.borderLeft }
                });
                this.parent.notify(applyCellFormat, formatArgs);
            }
        }
        const evtArgs: CellRenderEventArgs = { cell: args.cell, element: args.td, address: args.address, rowIndex: args.rowIdx, colIndex:
            args.colIdx, needHeightCheck: false, row: args.row };
        this.parent.trigger('beforeCellRender', evtArgs);
        if (!sheet.rows[args.rowIdx] || !sheet.rows[args.rowIdx].customHeight) {
            if (evtArgs.needHeightCheck || (isTemplateCell && evtArgs.element && evtArgs.element.children.length)) {
                const clonedCell: HTMLElement = evtArgs.element.cloneNode(true) as HTMLElement;
                clonedCell.style.width = getColumnWidth(sheet, args.colIdx, true) + 'px';
                this.tableRow.appendChild(clonedCell);
            }
            if (args.lastCell && this.tableRow.childElementCount) {
                const rowHeight: number = this.getRowHeightOnInit();
                if (rowHeight > getRowHeight(sheet, args.rowIdx)) {
                    setRowEleHeight(this.parent, sheet, rowHeight, args.rowIdx, args.row, args.hRow);
                }
                this.tableRow.innerText = '';
            }
        }
        this.setWrapByValue(sheet, args);
        return evtArgs.element;
    }

    private setWrapByValue(sheet: SheetModel, args: CellRenderArgs): void {
        if (args.cell && isNullOrUndefined(args.cell.wrap) && args.cell.value && args.cell.value.toString().includes('\n')) {
            setCell(args.rowIdx, args.colIdx, sheet, { wrap: true }, true);
            this.parent.notify(
                wrapEvent, { range: [args.rowIdx, args.colIdx, args.rowIdx, args.colIdx], wrap: true, initial: true, sheet: sheet,
                    td: args.td, row: args.row, hRow: args.hRow });
        }
    }

    private update(args: CellRenderArgs): boolean {
        const sheet: SheetModel = this.parent.getActiveSheet();
        let isTemplateCell: boolean;
        // In SF-425413 ticket, we suggested to add the template property in the cell model to render the template using updateCell method.
        if (!args.isRefresh || (args.cell && (args.cell as ExtendedCellModel).template)) {
            const compiledTemplate: string | Element[] = this.processTemplates(args.cell, args.rowIdx, args.colIdx);
            if (compiledTemplate) {
                if (typeof compiledTemplate === 'string') {
                    args.td.innerHTML = compiledTemplate;
                } else {
                    removeAllChildren(args.td);
                    append(compiledTemplate, args.td);
                }
                args.td.classList.add('e-cell-template');
                isTemplateCell = true;
            }
        }
        if (args.isRefresh) {
            if (args.td.rowSpan) {
                this.mergeFreezeRow(sheet, args.rowIdx, args.colIdx, args.td.rowSpan, args.row, true);
                args.td.removeAttribute('rowSpan');
            }
            if (args.td.colSpan) {
                this.mergeFreezeCol(sheet, args.rowIdx, args.colIdx, args.td.colSpan, true);
                args.td.removeAttribute('colSpan');
            }
            if (this.checkMerged(args)) {
                return false;
            }
            if (args.cell && !args.cell.hyperlink) {
                const hyperlink: Element = args.td.querySelector('.e-hyperlink');
                if (hyperlink) {
                    detach(hyperlink);
                }
            }
            if (args.cell && args.td.children.length > 0 &&
                args.td.children[args.td.childElementCount - 1].className.indexOf('e-addNoteIndicator') > -1) {
                const noteIndicator: Element = args.td.querySelector('.e-addNoteIndicator');
                if (noteIndicator) {
                    detach(noteIndicator);
                }
            }
            if ((!args.cell || !this.parent.allowWrap) && args.td.classList.contains('e-wraptext')) {
                args.td.classList.remove('e-wraptext');
            }
        }
        if (args.cell && args.cell.formula && !args.isRandomFormula && this.parent.calculationMode === 'Automatic') {
            this.calculateFormula(args);
            if (args.fillType && args.fillType === 'FillWithoutFormatting') {
                delete args.cell.format;
            }
            if (!args.isRefresh) { this.isFormulaCell = true; }
        }
        const formatArgs: NumberFormatArgs = { value: args.cell && args.cell.value,
            type: args.cell && getTypeFromFormat(args.cell.format), format: args.cell && args.cell.format,
            formattedText: args.cell && args.cell.value, isRightAlign: false, cell: args.cell, rowIndex: args.rowIdx, colIndex: args.colIdx,
            td: args.td, skipFormatCheck: args.skipFormatCheck, refresh: true };
        if (this.parent.calculationMode === 'Manual' && args.cell && !args.cell.value && args.cell.value !== '' && args.cell.formula) {
            formatArgs.value = 0;
            args.cell.value = '0';
        }
        if (args.cell) {
            this.parent.notify(getFormattedCellObject, formatArgs);
        }
        this.parent.refreshNode(args.td, formatArgs);
        let style: CellStyleModel = {};
        if (args.cell) {
            if (args.cell.style) {
                if ((args.cell.style as CellStyleExtendedModel).properties) {
                    style = skipDefaultValue(args.cell.style, true);
                } else { style = args.cell.style; }
            }
            if (formatArgs.color !== undefined) {
                style = Object.assign({}, style);
                style.color = formatArgs.color;
            }
            this.createImageAndChart(args);
            if (args.cell.hyperlink) {
                if (args.fillType === 'FillFormattingOnly') {
                    args.td.style.textDecoration = 'underline';
                    args.td.style.color = '#00e';
                } else {
                    this.parent.notify(
                        createHyperlinkElement, {
                            cell: args.cell, style: style, td: args.td, rowIdx: args.rowIdx,
                            colIdx: args.colIdx, fillType: args.fillType, action: args.action
                        });
                }
            }
            if (this.parent.allowMerge) {
                if (args.cell.rowSpan > 1) {
                    const rowSpan: number = args.rowSpan || (args.cell.rowSpan -
                        this.parent.hiddenCount(args.rowIdx, args.rowIdx + (args.cell.rowSpan - 1)));
                    if (rowSpan > 1) {
                        args.td.rowSpan = rowSpan; this.mergeFreezeRow(sheet, args.rowIdx, args.colIdx, rowSpan, args.row);
                    }
                }
                if (args.cell.colSpan > 1) {
                    const colSpan: number = args.colSpan || (args.cell.colSpan -
                        this.parent.hiddenCount(args.colIdx, args.colIdx + (args.cell.colSpan - 1), 'columns'));
                    if (colSpan > 1) {
                        args.td.colSpan = colSpan;
                        this.mergeFreezeCol(sheet, args.rowIdx, args.colIdx, colSpan);
                    }
                }
            }
            if (!isNullOrUndefined(args.cell.notes) && !args.fillType) {
                this.parent.notify(createNoteIndicator, { targetElement: args.td, rowIndex: args.rowIdx, columnIndex: args.colIdx });
            } else if (!isNullOrUndefined(args.td) && args.td.children.length > 0 && args.td.children[args.td.childElementCount - 1].className.indexOf('e-addNoteIndicator') > -1) {
                this.parent.notify(deleteNote, { rowIndex: args.rowIdx, columnIndex: args.colIdx });
            }
            if (args.cell.isNoteEditable) {
                this.parent.notify(showNote,
                                   {rowIndex: args.rowIdx, columnIndex: args.colIdx, isNoteEditable: true,
                                       isScrollWithNote: true, cellElement: args.td});
            }
        }
        if (args.isRefresh && isNullOrUndefined(args.cell) && !isNullOrUndefined(args.td) && args.td.children.length > 0 && args.td.children[args.td.childElementCount - 1].className.indexOf('e-addNoteIndicator') > -1) {
            this.parent.notify(deleteNote, {rowIndex: args.rowIdx, columnIndex: args.colIdx});
        }
        if (args.isRefresh) { this.removeStyle(args.td, args.rowIdx, args.colIdx); }
        if (args.lastCell && (this.isFormulaCell || args.isRefresh) && this.parent.chartColl && this.parent.chartColl.length) {
            this.parent.notify(refreshChart, {
                cell: args.cell, rIdx: args.rowIdx, cIdx: args.colIdx, sheetIdx: this.parent.activeSheetIndex, isSelectAll: args.isSelectAll
            });
            if (!args.isRefresh) { this.isFormulaCell = false; }
        }
        this.applyStyle(args, style);
        if (args.checkNextBorder === 'Row') {
            const borderTop: string = this.parent.getCellStyleValue(
                ['borderTop'], [Number(this.parent.getContentTable().rows[0].getAttribute('aria-rowindex')) - 1, args.colIdx]).borderTop;
            if (borderTop !== '' && (!args.cell || !args.cell.style || !(args.cell.style as CellStyleExtendedModel).bottomPriority)) {
                args.style = { borderBottom: borderTop };
                this.parent.notify(applyCellFormat, args);
            }
        }
        if (args.checkNextBorder === 'Column') {
            const borderLeft: string = this.parent.getCellStyleValue(['borderLeft'], [args.rowIdx, args.colIdx + 1]).borderLeft;
            if (borderLeft !== '' && (!args.cell || !args.cell.style || (!args.cell.style.borderRight && !args.cell.style.border))) {
                args.style = { borderRight: borderLeft };
                this.parent.notify(applyCellFormat, args);
            }
        }
        if (args.cell && !isNullOrUndefined(args.cell.wrap)) {
            this.parent.notify(wrapEvent, {
                range: [args.rowIdx, args.colIdx, args.rowIdx, args.colIdx], wrap: args.cell.wrap, sheet: sheet, initial: true, td: args.td,
                row: args.row, hRow: args.hRow, isCustomHgt: !args.isRefresh &&
                    getRowHeight(sheet, args.rowIdx) > (sheet && sheet.standardHeight ? sheet.standardHeight : 20)
            });
        }
        let validation: ValidationModel; let col: ColumnModel;
        if (args.cell && args.cell.validation) {
            validation = args.cell.validation;
            col = sheet.columns && sheet.columns[args.colIdx];
        } else {
            validation = checkColumnValidation(sheet.columns && sheet.columns[args.colIdx], args.rowIdx, args.colIdx) &&
                sheet.columns[args.colIdx].validation;
        }
        if (validation) {
            if (validation.isHighlighted) {
                args.validation = validation;
                args.col = col;
                this.parent.notify(updateHighlight, args);
            }
            if (validation.type === 'List' && !args.isRefresh && args.address === sheet.activeCell) {
                args.validation = validation;
                this.parent.notify(addListValidationDropdown, args);
            }
        }
        return isTemplateCell;
    }
    private applyStyle(args: CellRenderArgs, style: CellStyleModel): void {
        if (Object.keys(style).length || Object.keys(this.parent.commonCellStyle).length || args.lastCell) {
            args.style = extend({}, this.parent.commonCellStyle, style);
            this.parent.notify(applyCellFormat, <CellFormatArgs>args);
        }
    }
    private createImageAndChart(args: CellRenderArgs): void {
        if (args.cell.chart && args.cell.chart.length > 0) {
            this.parent.notify(
                setChart, { chart : args.cell.chart, isInitCell: true, range: getCellAddress(args.rowIdx, args.colIdx),
                    isUndoRedo: false });
        }
        if (args.cell.image && args.cell.image.length > 0) {
            for (let i: number = 0; i < args.cell.image.length; i++) {
                if (args.cell.image[i as number]) {
                    this.parent.notify(createImageElement, {
                        options: {
                            src: args.cell.image[i as number].src, id: args.cell.image[i as number].id,
                            height: args.cell.image[i as number].height, width: args.cell.image[i as number].width,
                            top: args.cell.image[i as number].top, left: args.cell.image[i as number].left,
                            preservePos: (args.cell.image[i as number] as ExtendedImageModel).preservePos
                        },
                        range: getRangeAddress([args.rowIdx, args.colIdx, args.rowIdx, args.colIdx]), isPublic: false
                    });
                }
            }
        }
    }
    private calculateFormula(args: CellRenderArgs): void {
        if (args.cell.value !== undefined && args.cell.value !== null) {
            const eventArgs: { [key: string]: string | number | boolean } = { action: 'checkFormulaAdded', added: true, address:
                args.address, sheetId: (args.sheetIndex === undefined ? this.parent.getActiveSheet() :
                getSheet(this.parent, args.sheetIndex)).id.toString() };
            this.parent.notify(workbookFormulaOperation, eventArgs);
            if (eventArgs.added) {
                return;
            }
        } else if (args.formulaRefresh) {
            args.cell.value = '';
        }
        const isFormula: boolean = checkIsFormula(args.cell.formula);
        const eventArgs: { [key: string]: string | number | boolean } = {
            action: 'refreshCalculate', value: args.cell.formula, rowIndex: args.rowIdx, colIndex: args.colIdx,
            isFormula: isFormula, sheetIndex: args.sheetIndex, isRefreshing: args.isRefreshing,
            isDependentRefresh: args.isDependentRefresh, isRandomFormula: args.isRandomFormula, fillType: args.fillType
        };
        if (this.parent.calculationMode === 'Automatic' || args.isSortAction || args.action === 'calculate' || args.isDependentRefresh) {
            this.parent.notify(workbookFormulaOperation, eventArgs);
        }
        if ((args.cell.value === undefined && this.parent.calculationMode === 'Manual' && !this.parent.getActiveSheet().isSheetCalculated)
            || (this.parent.isEdit && args.cell.value === '#CIRCULARREF!')) {
            args.cell.value = '0';
        }
        args.cell.value = getCell(
            args.rowIdx, args.colIdx, isNullOrUndefined(args.sheetIndex) ? this.parent.getActiveSheet() :
                getSheet(this.parent, args.sheetIndex)).value;
        if (isFormula && (args.cell.formula.indexOf('^+') > -1 || args.cell.formula.indexOf('&+') > -1)) {
            args.cell.formula = <string>eventArgs.value; // for correcting the formulas 5^+3=>5^3 and 5&+3=>5&3 while rendering like Excel.
        }
    }
    private checkMerged(args: CellRenderArgs): boolean {
        if (this.parent.allowMerge && args.cell && (args.cell.colSpan < 0 || args.cell.rowSpan < 0)) {
            const sheet: SheetModel = this.parent.getActiveSheet();
            if (sheet.frozenRows || sheet.frozenColumns) {
                const mergeArgs: MergeArgs = { range: [args.rowIdx, args.colIdx, args.rowIdx, args.colIdx] };
                this.parent.notify(activeCellMergedRange, mergeArgs);
                const frozenRow: number = this.parent.frozenRowCount(sheet); const frozenCol: number = this.parent.frozenColCount(sheet);
                let setDisplay: boolean; mergeArgs.range = mergeArgs.range as number[];
                if (sheet.frozenRows && sheet.frozenColumns) {
                    if (mergeArgs.range[0] < frozenRow && mergeArgs.range[1] < frozenCol) {
                        setDisplay = args.rowIdx < frozenRow && args.colIdx < frozenCol;
                    } else if (mergeArgs.range[0] < frozenRow) {
                        setDisplay = args.rowIdx < frozenRow;
                    } else if (mergeArgs.range[1] < frozenCol) {
                        setDisplay = args.colIdx < frozenCol;
                    } else {
                        setDisplay = true;
                    }
                } else {
                    setDisplay = frozenRow ? (mergeArgs.range[0] >= frozenRow || args.rowIdx < frozenRow) : (mergeArgs.range[1] >= frozenCol
                        || args.colIdx < frozenCol);
                }
                if (setDisplay) { args.td.style.display = 'none'; }
            } else {
                args.td.style.display = 'none';
            }
            args.isMerged = true;
            const rowSpan: number = args.cell.rowSpan; const colSpan: number = args.cell.colSpan;
            if (colSpan < 0 || rowSpan < 0) {
                this.parent.notify(checkPrevMerge, args);
                if (colSpan < 0 && args.cell.style && args.cell.style.borderTop) {
                    this.applyStyle(args, { borderTop: args.cell.style.borderTop });
                }
                if (rowSpan < 0 && args.cell.style && args.cell.style.borderLeft) {
                    this.applyStyle(args, { borderLeft: args.cell.style.borderLeft });
                }
            }
            return args.isMerged;
        }
        return false;
    }
    private mergeFreezeRow(sheet: SheetModel, rowIdx: number, colIdx: number, rowSpan: number, tr: Element, unMerge?: boolean): void {
        const frozenRow: number = this.parent.frozenRowCount(sheet);
        if (frozenRow && rowIdx < frozenRow && rowIdx + (rowSpan - 1) >= frozenRow) {
            let rowEle: HTMLElement; let spanRowTop: number = 0; let height: number;
            const frozenCol: number = this.parent.frozenColCount(sheet);
            const row: HTMLTableRowElement = tr as HTMLTableRowElement || this.parent.getRow(rowIdx, null, colIdx);
            const emptyRows: Element[] = [].slice.call(row.parentElement.querySelectorAll('.e-empty'));
            if (unMerge) {
                const curEmptyLength: number = rowIdx + rowSpan - frozenRow;
                if (curEmptyLength < emptyRows.length) {
                    return;
                } else {
                    let curSpan: number = 0;
                    if (curEmptyLength === emptyRows.length) {
                        let curCell: CellModel; let i: number; let len: number;
                        if (frozenCol && colIdx < frozenCol) {
                            i = getCellIndexes(sheet.topLeftCell)[1]; len = frozenCol;
                        } else {
                            i = this.parent.viewport.leftIndex + frozenCol; len = this.parent.viewport.rightIndex;
                        }
                        for (i; i < len; i++) {
                            if (i === colIdx) { continue; }
                            curCell = getCell(rowIdx, i, sheet, false, true);
                            if (curCell.rowSpan && rowIdx + curCell.rowSpan - frozenRow > curSpan) {
                                curSpan = rowIdx + curCell.rowSpan - frozenRow;
                            }
                        }
                        if (curSpan === curEmptyLength) { return; }
                    } else {
                        curSpan = curEmptyLength;
                    }
                    let lastRowIdx: number = rowIdx + (rowSpan - 1);
                    for (let i: number = curSpan, len: number = emptyRows.length; i < len; i++) {
                        spanRowTop += getRowHeight(sheet, lastRowIdx);
                        lastRowIdx--; detach(emptyRows.pop());
                    }
                    this.updateSpanTop(colIdx, frozenCol, spanRowTop, true);
                    if (!emptyRows.length) { this.updateColZIndex(colIdx, frozenCol, true); }
                    return;
                }
            }
            this.updateColZIndex(colIdx, frozenCol);
            for (let i: number = frozenRow, len: number = rowIdx + (rowSpan - 1); i <= len; i++) {
                height = getRowHeight(sheet, skipHiddenIdx(sheet, i, true), true);
                spanRowTop += -height;
                if (frozenRow + emptyRows.length > i) { continue; }
                rowEle = row.cloneNode() as HTMLElement;
                rowEle.classList.add('e-empty'); rowEle.style.visibility = 'hidden';
                rowEle.style.height = height + 'px';
                row.parentElement.appendChild(rowEle);
            }
            this.updateSpanTop(colIdx, frozenCol, spanRowTop);
        }
    }

    private updateSpanTop(colIdx: number, frozenCol: number, top: number, update?: boolean): void {
        const mainPanel: HTMLElement = this.parent.serviceLocator.getService<IRenderer>('sheet').contentPanel;
        if (update) {
            if (!parseInt(mainPanel.style.top, 10)) { return; }
            top = parseInt(mainPanel.style.top, 10) + top;
        }
        if (frozenCol && colIdx < frozenCol && (update || !parseInt(mainPanel.style.top, 10) || top <
            parseInt(mainPanel.style.top, 10))) {
            mainPanel.style.top = top + 'px';
            const scroll: HTMLElement = mainPanel.nextElementSibling as HTMLElement;
            if (scroll) { scroll.style.top = top + 'px'; }
        }
    }

    private mergeFreezeCol(sheet: SheetModel, rowIdx: number, colIdx: number, colSpan: number, unMerge?: boolean): void {
        const frozenCol: number = this.parent.frozenColCount(sheet);
        if (frozenCol && colIdx < frozenCol && colIdx + (colSpan - 1) >= frozenCol) {
            let col: HTMLElement; let width: number; const frozenRow: number = this.parent.frozenRowCount(sheet);
            const colGrp: Element = (rowIdx < frozenRow ? this.parent.getSelectAllContent() : this.parent.getRowHeaderContent()).querySelector('colgroup');
            const emptyCols: Element[] = [].slice.call(colGrp.querySelectorAll('.e-empty'));
            if (unMerge) {
                const curEmptyLength: number = colIdx + colSpan - frozenCol;
                if (curEmptyLength < emptyCols.length) {
                    return;
                } else {
                    let curSpan: number = 0;
                    if (curEmptyLength === emptyCols.length) {
                        let curCell: CellModel; let len: number; let i: number;
                        if (frozenRow && rowIdx < frozenRow) {
                            len = frozenRow; i = getCellIndexes(sheet.topLeftCell)[0];
                        } else {
                            len = this.parent.viewport.bottomIndex; i = this.parent.viewport.topIndex + frozenRow;
                        }
                        for (i; i < len; i++) {
                            if (i === rowIdx) { continue; }
                            curCell = getCell(i, colIdx, sheet, false, true);
                            if (curCell.colSpan && colIdx + curCell.colSpan - frozenCol > curSpan) {
                                curSpan = colIdx + curCell.colSpan - frozenCol;
                            }
                        }
                        if (curSpan === curEmptyLength) { return; }
                    } else {
                        curSpan = curEmptyLength;
                    }
                    for (let i: number = curSpan, len: number = emptyCols.length; i < len; i++) { detach(emptyCols.pop()); }
                    this.parent.serviceLocator.getService<IRenderer>('sheet').setPanelWidth(sheet, this.parent.getRowHeaderContent());
                    if (!emptyCols.length) { this.updateRowZIndex(rowIdx, frozenRow, true); }
                    return;
                }
            }
            this.updateRowZIndex(rowIdx, frozenRow);
            for (let i: number = frozenCol, len: number = colIdx + (colSpan - 1); i <= len; i++) {
                if (frozenCol + emptyCols.length > i) { continue; }
                col = colGrp.childNodes[0].cloneNode() as HTMLElement;
                col.classList.add('e-empty'); col.style.visibility = 'hidden';
                width = getColumnWidth(sheet, skipHiddenIdx(sheet, i, true, 'columns'), null, true);
                col.style.width = width + 'px';
                colGrp.appendChild(col);
                if (i === len) {
                    this.parent.serviceLocator.getService<IRenderer>('sheet').setPanelWidth(
                        sheet, this.parent.getRowHeaderContent());
                }
            }
        }
    }

    private updateColZIndex(colIdx: number, frozenCol: number, remove?: boolean): void {
        if (colIdx < frozenCol) {
            this.updateSelectAllZIndex(remove);
        } else {
            this.parent.getColumnHeaderContent().style.zIndex = remove ? '' : '2';
            this.updatedHeaderZIndex(remove);
        }
    }

    private updateSelectAllZIndex(remove: boolean): void {
        const frozenRowEle: HTMLElement = this.parent.element.querySelector('.e-frozen-row');
        const frozenColEle: HTMLElement = this.parent.element.querySelector('.e-frozen-column');
        if (remove) {
            this.parent.getSelectAllContent().style.zIndex = '';
            if (frozenRowEle) { frozenRowEle.style.zIndex = ''; }
            if (frozenColEle) { frozenColEle.style.zIndex = ''; }
        } else {
            const rowHeader: HTMLElement = this.parent.getRowHeaderContent();
            const colHeader: HTMLElement = this.parent.getColumnHeaderContent();
            if (rowHeader.style.zIndex || colHeader.style.zIndex) {
                this.parent.getSelectAllContent().style.zIndex = '3';
                if (frozenRowEle) { frozenRowEle.style.zIndex = '4'; }
                if (frozenColEle) { frozenColEle.style.zIndex = '4'; }
                const rowHdrSelection: HTMLElement = rowHeader.querySelector('.e-selection');
                if (rowHdrSelection) {
                    rowHdrSelection.style.zIndex = '3';
                }
                const colHdrSelection: HTMLElement = colHeader.querySelector('.e-selection');
                if (colHdrSelection) {
                    colHdrSelection.style.zIndex = '3';
                }
            } else {
                this.parent.getSelectAllContent().style.zIndex = '2';
            }
        }
    }

    private updatedHeaderZIndex(remove: boolean): void {
        if (!remove && this.parent.getSelectAllContent().style.zIndex === '2') {
            this.parent.getSelectAllContent().style.zIndex = '3';
            const frozenRowEle: HTMLElement = this.parent.element.querySelector('.e-frozen-row');
            const frozenColEle: HTMLElement = this.parent.element.querySelector('.e-frozen-column');
            if (frozenColEle) { frozenColEle.style.zIndex = '4'; }
            if (frozenRowEle) { frozenRowEle.style.zIndex = '4'; }
            const rowHdrSelection: HTMLElement = this.parent.getRowHeaderContent().querySelector('.e-selection');
            if (rowHdrSelection) {
                rowHdrSelection.style.zIndex = '3';
            }
            const colHdrSelection: HTMLElement = this.parent.getColumnHeaderContent().querySelector('.e-selection');
            if (colHdrSelection) {
                colHdrSelection.style.zIndex = '3';
            }
        }
    }

    private updateRowZIndex(rowIdx: number, frozenRow: number, remove?: boolean): void {
        if (rowIdx < frozenRow) {
            this.updateSelectAllZIndex(remove);
        } else {
            this.parent.getRowHeaderContent().style.zIndex = remove ? '' : '2';
            this.updatedHeaderZIndex(remove);
        }
    }

    private processTemplates(cell: CellModel, rowIdx: number, colIdx: number): string | Element[] {
        const sheet: SheetModel = this.parent.getActiveSheet();
        const ranges: RangeModel[] = sheet.ranges;
        let range: number[];
        for (let j: number = 0, len: number = ranges.length; j < len; j++) {
            if (ranges[j as number].template) {
                range = getRangeIndexes(ranges[j as number].address.length ? ranges[j as number].address : ranges[j as number].startCell);
                if (range[0] <= rowIdx && range[1] <= colIdx && range[2] >= rowIdx && range[3] >= colIdx) {
                    if (cell) {
                        return this.compileCellTemplate(
                            ranges[j as number].template, Object.assign({ rowIndex: rowIdx, colIndex: colIdx }, cell));
                    } else {
                        if (!getCell(rowIdx, colIdx, sheet, true)) {
                            return this.compileCellTemplate(
                                ranges[j as number].template,
                                Object.assign({ rowIndex: rowIdx, colIndex: colIdx }, getCell(rowIdx, colIdx, sheet, null, true)));
                        }
                    }
                }
            }
        }
        return '';
    }

    private compileCellTemplate(template: string | Function, cell: CellModel): string | Element[] {
        let compiledStr: Function;
        if (typeof template === 'string') {
            let templateString: string;
            if (template.trim().indexOf('#') === 0) {
                templateString = document.querySelector(template).innerHTML.trim();
            } else {
                templateString = template;
            }
            compiledStr = compile(templateString);
            if (!(this.parent).isVue || this.isSelector(template)) {
                return (compiledStr(cell, this.parent, 'ranges', '', true)[0] as HTMLElement).outerHTML;
            } else {
                return compiledStr(cell, this.parent, 'ranges', '');
            }
        } else {
            compiledStr = compile(template);
            const compiledTemplate: Element | Element[] = compiledStr(cell, this.parent, 'ranges', '');
            return (<Element[]>compiledTemplate)[0] ? <Element[]>compiledTemplate : [<Element>compiledTemplate];
        }
    }

    private isSelector(template: string): boolean {
        try {
            return !!document.querySelector(template);
        } catch (err) {
            return false;
        }
    }

    private getRowHeightOnInit(): number {
        const tTable: HTMLElement = this.parent.createElement('table', { className: 'e-table e-test-table' });
        const tBody: HTMLElement = tTable.appendChild(this.parent.createElement('tbody'));
        tBody.appendChild(this.tableRow);
        this.parent.element.appendChild(tTable);
        const height: number = this.tableRow.getBoundingClientRect().height;
        this.parent.element.removeChild(tTable);
        return height < 20 ? 20 : height;
    }

    private removeStyle(element: HTMLElement, rowIdx: number, colIdx: number): void {
        let cellStyle: CellStyleModel;
        if (element.style.length) {
            cellStyle = this.parent.getCellStyleValue(['borderLeft', 'border'], [rowIdx, colIdx + 1]);
            const rightBorder: string = cellStyle.borderLeft || cellStyle.border;
            cellStyle = this.parent.getCellStyleValue(['borderTop', 'border'], [rowIdx + 1, colIdx]);
            const bottomBorder: string = cellStyle.borderTop || cellStyle.border;
            if (rightBorder || bottomBorder) {
                [].slice.call(element.style).forEach((style: string) => {
                    if (rightBorder && bottomBorder) {
                        if (!style.includes('border-right') && !style.includes('border-bottom')) {
                            element.style.removeProperty(style);
                        }
                    } else if ((rightBorder && !(style.indexOf('border-right') > -1) && (!bottomBorder || bottomBorder === 'none')) ||
                        (bottomBorder && !(style.indexOf('border-bottom') > -1) && (!rightBorder || rightBorder === 'none'))) {
                        element.style.removeProperty(style);
                    }
                });
            } else {
                element.removeAttribute('style');
            }
        }
        const prevRowCell: HTMLElement = this.parent.getCell(rowIdx - 1, colIdx);
        if (prevRowCell && prevRowCell.style.borderBottom) {
            const prevRowIdx: number = Number(prevRowCell.parentElement.getAttribute('aria-rowindex')) - 1;
            cellStyle = this.parent.getCellStyleValue(['borderBottom', 'border'], [prevRowIdx, colIdx]);
            if (!(cellStyle.borderBottom || cellStyle.border)) { prevRowCell.style.borderBottom = ''; }
        }
        const prevColCell: HTMLElement = <HTMLElement>element.previousElementSibling;
        if (prevColCell && prevColCell.style.borderRight) {
            colIdx = Number(prevColCell.getAttribute('aria-colindex')) - 1;
            cellStyle = this.parent.getCellStyleValue(['borderRight', 'border'], [rowIdx, colIdx]);
            if (!(cellStyle.borderRight || cellStyle.border)) { prevColCell.style.borderRight = ''; }
        }
    }
    /**
     * @hidden
     * @param {number[]} range - Specifies the range.
     * @param {boolean} refreshing - Specifies the refresh.
     * @param {boolean} checkWrap - Specifies the range.
     * @param {boolean} checkHeight - Specifies the checkHeight.
     * @param {boolean} checkCF - Specifies the check for conditional format.
     * @param {boolean} skipFormatCheck - Specifies whether to skip the format checking while applying the number format.
     * @param {boolean} checkFormulaAdded - Specifies whether to check the formula added or not.
     * @param {boolean} isFromAutoFillOption - Specifies whether the value is from auto fill option or not.
     * @param {boolean} isHeightCheckNeeded - Specifies whether the refreshing is from undo-redo with format action.
     * @param {boolean} isSortAction - Specifies whether to check the sort action performed or not.
     * @param {boolean} isSelectAll - Specifies the all sheet cells selected or not.
     * @param {PreviousCellDetails[]} cells - Specifies the undo redo cell collections.
     * @returns {void}
     */
    public refreshRange(
        range: number[], refreshing?: boolean, checkWrap?: boolean, checkHeight?: boolean, checkCF?: boolean,
        skipFormatCheck?: boolean, checkFormulaAdded?: boolean, isFromAutoFillOption?: boolean,
        isHeightCheckNeeded: boolean = true, isSortAction?: boolean, isSelectAll?: boolean, cells?: PreviousCellDetails[]): void {
        const sheet: SheetModel = this.parent.getActiveSheet();
        const cRange: number[] = range.slice(); let args: CellRenderArgs; let cell: HTMLTableCellElement;
        if (inView(this.parent, cRange, true)) {
            let cellIdx: number = 0;
            for (let i: number = cRange[0]; i <= cRange[2]; i++) {
                if (isHiddenRow(sheet, i)) { continue; }
                for (let j: number = cRange[1]; j <= cRange[3]; j++) {
                    if (isHiddenCol(sheet, j)) { continue; }
                    cell = this.parent.getCell(i, j) as HTMLTableCellElement;
                    if (cell) {
                        args = {
                            rowIdx: i, colIdx: j, td: cell, cell: getCell(i, j, sheet), isRefreshing: refreshing,
                            lastCell: j === cRange[3], isRefresh: true, isHeightCheckNeeded: isHeightCheckNeeded,
                            manualUpdate: true, first: '', onActionUpdate: checkHeight, skipFormatCheck: skipFormatCheck,
                            isFromAutoFillOption: isFromAutoFillOption, isSelectAll: isSelectAll,
                            rowHeight: cells && cells[cellIdx as number] && cells[cellIdx as number].rowHeight
                        };
                        cellIdx++;
                        if (checkFormulaAdded) {
                            args.address = getCellAddress(i, j);
                        }
                        this.update(args);
                        if (checkCF && sheet.conditionalFormats && sheet.conditionalFormats.length) {
                            this.parent.notify(applyCF, <ApplyCFArgs>{ indexes: [i, j], isAction: true });
                        }
                        this.parent.notify(renderFilterCell, { td: cell, rowIndex: i, colIndex: j });
                        if (checkWrap) {
                            this.setWrapByValue(sheet, args);
                        }
                    }
                    if (this.parent.calculationMode === 'Manual' && isSortAction) {
                        if (!cell) {
                            args = {
                                rowIdx: i, colIdx: j, td: cell, cell: getCell(i, j, sheet), isRefreshing: refreshing, lastCell: j ===
                                    cRange[3], isRefresh: true, isHeightCheckNeeded: isHeightCheckNeeded, manualUpdate: true, first: '',
                                onActionUpdate: checkHeight, skipFormatCheck: skipFormatCheck, isFromAutoFillOption: isFromAutoFillOption,
                                isSortAction: isSortAction
                            };
                        } else {
                            args.isSortAction = isSortAction;
                        }
                        if (args.cell && args.cell.formula && sheet.isSheetCalculated) {
                            this.calculateFormula(args);
                        }
                    }
                }
            }
        }
    }

    public refresh(
        rowIdx: number, colIdx: number, lastCell?: boolean, element?: Element, checkCF?: boolean, checkWrap?: boolean,
        skipFormatCheck?: boolean, isRandomFormula?: boolean, fillType?: string): void {
        const sheet: SheetModel = this.parent.getActiveSheet();
        if (!element && (isHiddenRow(sheet, rowIdx) || isHiddenCol(sheet, colIdx))) {
            return;
        }
        if (element || !this.parent.scrollSettings.enableVirtualization || this.parent.insideViewport(rowIdx, colIdx)) {
            const cell: HTMLTableCellElement = <HTMLTableCellElement>(element || this.parent.getCell(rowIdx, colIdx));
            if (!cell) {
                return;
            }
            const args: CellRenderArgs = { rowIdx: rowIdx, colIdx: colIdx, td: cell, cell: getCell(rowIdx, colIdx, sheet), isRefresh: true,
                lastCell: lastCell, isHeightCheckNeeded: true, manualUpdate: true, first: '', skipFormatCheck: skipFormatCheck,
                isRandomFormula: isRandomFormula, fillType: fillType };
            this.update(args);
            if (checkCF && sheet.conditionalFormats && sheet.conditionalFormats.length) {
                this.parent.notify(applyCF, <ApplyCFArgs>{ indexes: [rowIdx, colIdx], isAction: true });
            }
            this.parent.notify(renderFilterCell, { td: cell, rowIndex: rowIdx, colIndex: colIdx });
            if (checkWrap) {
                this.setWrapByValue(sheet, args);
            }
        }
    }

    private updateView(
        args: { indexes: number[], sheetIndex?: number, refreshing?: boolean, checkWrap?: boolean, checkCF?: boolean }): void {
        if (isNullOrUndefined(args.sheetIndex) || (args.sheetIndex === this.parent.activeSheetIndex)) {
            if (!args.indexes) {
                const sheet: SheetModel = this.parent.getActiveSheet();
                const frozenRow: number = this.parent.frozenRowCount(sheet);
                const frozenCol: number = this.parent.frozenColCount(sheet);
                const topLeftCell: number[] = getRangeIndexes(sheet.topLeftCell);
                if (frozenRow && frozenCol) {
                    this.refreshRange(
                        [topLeftCell[0], topLeftCell[1], frozenRow - 1, frozenCol - 1], args.refreshing, args.checkWrap,
                        false, args.checkCF);
                }
                if (frozenRow) {
                    this.refreshRange(
                        [topLeftCell[0], this.parent.viewport.leftIndex + frozenCol, frozenRow - 1, this.parent.viewport.rightIndex],
                        args.refreshing, args.checkWrap, false, args.checkCF);
                }
                if (frozenCol) {
                    this.refreshRange(
                        [this.parent.viewport.topIndex + frozenRow, topLeftCell[1], this.parent.viewport.bottomIndex, frozenCol - 1],
                        args.refreshing, args.checkWrap, false, args.checkCF);
                }
                args.indexes = [this.parent.viewport.topIndex + frozenRow, this.parent.viewport.leftIndex + frozenCol,
                    this.parent.viewport.bottomIndex, this.parent.viewport.rightIndex];
            }
            this.refreshRange(args.indexes, args.refreshing, args.checkWrap, false, args.checkCF);
        } else if (args.refreshing) {
            this.calculateFormula(
                { cell: getCell(args.indexes[0], args.indexes[1], getSheet(this.parent, args.sheetIndex), true, true),
                    rowIdx: args.indexes[0], colIdx: args.indexes[1], sheetIndex: args.sheetIndex });
        }
    }

    /**
     * Removes the added event handlers and clears the internal properties of CellRenderer module.
     *
     * @returns {void}
     */
    public destroy(): void {
        this.parent.off(updateView, this.updateView);
        this.parent.off(calculateFormula, this.calculateFormula);
        if (this.element) { this.element.remove(); } this.element = null;
        if (this.th) { this.th.remove(); } this.th = null;
        if (this.tableRow) { this.tableRow.remove(); } this.tableRow = null;
        this.parent = null;
    }
}
