import { Spreadsheet, locale, deleteImage, createImageElement, positionAutoFillElement, showAggregate, paste, undoRedoForChartDesign, cut, copy } from '../../spreadsheet/index';
import { performUndoRedo, updateUndoRedoCollection, enableToolbarItems, ICellRenderer, completeAction, BeforeActionDataInternal, isColumnRange } from '../common/index';
import { UndoRedoEventArgs, setActionData, getBeforeActionData, updateAction } from '../common/index';
import { BeforeActionData, PreviousCellDetails, CollaborativeEditArgs, setUndoRedo, getUpdateUsingRaf } from '../common/index';
import { selectRange, clearUndoRedoCollection, setMaxHgt, getMaxHgt, setRowEleHeight } from '../common/index';
import { getRangeFromAddress, getRangeIndexes, BeforeCellFormatArgs, workbookEditOperation, SortCollectionModel, clearCFRule, isHeightCheckNeeded, RowModel, getRow, ColumnModel, getColumn, checkColumnValidation } from '../../workbook/index';
import { getSheet, Workbook, checkUniqueRange, reApplyFormula, getCellAddress, getSwapRange, setColumn } from '../../workbook/index';
import { getIndexesFromAddress, getSheetNameFromAddress, updateSortedDataOnCell, getSheetIndexFromAddress } from '../../workbook/index';
import { sortComplete, ConditionalFormatModel, ApplyCFArgs, ImageModel, isImported, cellValidation } from '../../workbook/index';
import { getCell, setCell, CellModel, BeforeSortEventArgs, getSheetIndex, wrapEvent, getSheetIndexFromId } from '../../workbook/index';
import { SheetModel, MergeArgs, setMerge, getRangeAddress, replaceAll, applyCellFormat, CellFormatArgs } from '../../workbook/index';
import { addClass, extend, isNullOrUndefined, isObject, isUndefined, L10n, select } from '@syncfusion/ej2-base';
import { CellStyleModel, TextDecoration, setCellFormat, refreshRibbonIcons, isFilterHidden, getRowHeight } from '../../workbook/index';
import { SortDescriptor, getColIndex, beginAction, ActionEventArgs, ConditionalFormat, updateCFModel, applyCF } from '../../workbook/index';
import { sheetRenameUpdate } from '../../workbook/common/index';
/**
 * UndoRedo module allows to perform undo redo functionalities.
 */
export class UndoRedo {
    private parent: Spreadsheet;
    private undoCollection: CollaborativeEditArgs[] = [];
    private redoCollection: CollaborativeEditArgs[] = [];
    private isUndo: boolean = false;
    private beforeActionData: BeforeActionDataInternal;
    private undoRedoStep: number = 100;
    constructor(parent: Spreadsheet) {
        this.parent = parent;
        this.addEventListener();
    }

    private setActionData(options: { args: CollaborativeEditArgs }): void {
        const sheet: SheetModel = this.parent.getActiveSheet();
        let address: number[];
        let cells: PreviousCellDetails[] = [];
        let cutCellDetails: PreviousCellDetails[] = [];
        const args: CollaborativeEditArgs = options.args;
        const eventArgs: UndoRedoEventArgs = args.eventArgs;
        let copiedInfo: { [key: string]: Object } = {};
        switch (args.action) {
        case 'format':
            address = getRangeIndexes((args.eventArgs as BeforeCellFormatArgs).range);
            break;
        case 'clipboard':
            copiedInfo = eventArgs.copiedInfo;
            address = getRangeIndexes(getRangeFromAddress(eventArgs.pastedRange));
            if (copiedInfo && copiedInfo.isCut) {
                cutCellDetails = this.getCellDetails(
                    copiedInfo.range as number[], getSheet(this.parent as Workbook, getSheetIndexFromId(
                        this.parent as Workbook, <number>copiedInfo.sId)), 'clipboard');
            }
            break;
        case 'beforeSort':
            address = getRangeIndexes((args.eventArgs as BeforeSortEventArgs).range);
            if (address[0] === address[2] && (address[2] - address[0]) === 0) { //if selected range is a single cell
                address[0] = 0; address[1] = 0; address[2] = sheet.usedRange.rowIndex; address[3] = sheet.usedRange.colIndex;
            }
            break;
        case 'beforeCellSave':
        case 'cellDelete':
        case 'cellSave':
        case 'addNote' :
        case 'editNote' :
        case 'deleteNote':
            address = getRangeIndexes(eventArgs.address);
            break;
        case 'beforeWrap':
        case 'beforeReplace':
        case 'chartDesign':
            address = this.parent.getAddressInfo(eventArgs.address).indices;
            break;
        case 'beforeClear':
            address = getRangeIndexes(eventArgs.range);
            break;
        case 'beforeInsertImage':
            address = getRangeIndexes(eventArgs.range);
            break;
        case 'deleteImage':
            address = getRangeIndexes(eventArgs.address);
            break;
        case 'beforeInsertChart':
            address = getRangeIndexes(eventArgs.range);
            break;
        case 'filter':
            address = getRangeIndexes(eventArgs.range);
            break;
        case 'autofill':
            address = getRangeIndexes(eventArgs.fillRange);
            break;
        case 'validation':
            if (isColumnRange(eventArgs.range.substring(eventArgs.range.lastIndexOf('!') + 1))) {
                address = getRangeIndexes(eventArgs.range);
                address[2] = sheet.usedRange.rowIndex;
            } else {
                address = getRangeIndexes(eventArgs.range);
            }
            break;
        case 'removeValidation':
            if (eventArgs.isColSelected) {
                this.beforeActionData = { cellDetails: [] };
                const rangeArr: string[] = eventArgs.range.substring(eventArgs.range.lastIndexOf('!') + 1).split(':');
                for (let start: number = getColIndex(rangeArr[0]), end: number = getColIndex(rangeArr[1]); start <= end; start++) {
                    if (sheet.columns[start as number] && sheet.columns[start as number].validation) {
                        this.beforeActionData.cellDetails.push({ colIndex: start, validation: sheet.columns[start as number].validation });
                    }
                }
            } else {
                address = getRangeIndexes(eventArgs.range);
            }
            break;
        case 'hyperlink':
        case 'removeHyperlink':
            address = getRangeIndexes(eventArgs.address);
            break;
        }
        if (args.action === 'beforeSort') {
            this.beforeActionData = { cellDetails: eventArgs.cellDetails };
            this.beforeActionData.sortedCellDetails = eventArgs.sortedCellDetails;
        } else if (address) {
            if (args.isClearAction && this.beforeActionData.cellDetails.length > 0) {
                cells = this.beforeActionData.cellDetails;
            } else {
                cells = this.getCellDetails(address, sheet, args.action);
            }
            this.beforeActionData = { cellDetails: cells, cutCellDetails: cutCellDetails };
        }
    }

    private getBeforeActionData(args: { beforeDetails: BeforeActionData }): void {
        args.beforeDetails = this.beforeActionData;
    }

    private performUndoRedo(
        args: { isUndo: boolean, isPublic: boolean, preventEvt?: boolean, preventReSelect?: boolean, isFromUpdateAction?: boolean,
            setCollection?: boolean, undoArgs?: object, isFromAutoFillOption?: boolean }): void {
        let undoRedoArgs: CollaborativeEditArgs;
        if (args.isFromUpdateAction) {
            undoRedoArgs = args as unknown as CollaborativeEditArgs;
        } else {
            undoRedoArgs = args.isUndo ? this.undoCollection.pop() : this.redoCollection.pop();
            if (args.setCollection) {
                args.undoArgs = undoRedoArgs;
            }
        }
        this.isUndo = args.isUndo; let preventEvt: boolean;
        if (undoRedoArgs) {
            let actionArgs: ActionEventArgs;
            const undoRedoAction: string = undoRedoArgs.action;
            const replaceArgs: { replaceValue?: string, value?: string, skipFormatCheck?: boolean } = {};
            let address: string[] = [];
            let sheet: SheetModel;
            if (undoRedoArgs.action === 'autofill' || undoRedoArgs.action === 'autofillWithCF') {
                address = (undoRedoArgs.eventArgs as UndoRedoEventArgs).fillRange.split('!');
            } else if (undoRedoArgs.action === 'cellSave' || undoRedoArgs.action === 'cellDelete') {
                address = undoRedoArgs.eventArgs.address.split('!');
            } else if (undoRedoArgs.action === 'clipboard') {
                address = undoRedoArgs.eventArgs.pastedRange.split('!');
            }
            if (address.length > 0) {
                sheet = getSheet(this.parent, getSheetIndex(this.parent, address[0]));
            } else if (undoRedoArgs.action === 'clear') {
                sheet = getSheet(this.parent, undoRedoArgs.eventArgs.sheetIndex);
            }
            if (undoRedoArgs.action === 'autofillWithCF') {
                undoRedoArgs.action = 'autofill';
                const conditionalFormat: ConditionalFormatModel[] = sheet.conditionalFormats;
                if (conditionalFormat.length && conditionalFormat[conditionalFormat.length - 1].action === 'autofillWithCF'
                    && args.isUndo) {
                    if (!conditionalFormat[conditionalFormat.length - 1].value) {
                        this.parent.notify(clearCFRule, { range: conditionalFormat[conditionalFormat.length - 1].range, isAction: true });
                    } else {
                        conditionalFormat.pop();
                    }
                }
            }
            if (!args.isPublic) {
                const actionData: BeforeActionData = undoRedoArgs.eventArgs.beforeActionData;
                delete undoRedoArgs.eventArgs.beforeActionData;
                actionArgs = { action: undoRedoArgs.action, eventArgs: {} };
                extend(actionArgs.eventArgs, undoRedoArgs.eventArgs, null, true);
                if (this.parent.calculationMode === 'Manual' && (undoRedoArgs.action === 'clipboard' ||
                    undoRedoArgs.action === 'cellDelete' || undoRedoArgs.action === 'autofill' || undoRedoArgs.action === 'clear')) {
                    if (!args.isUndo) {
                        if (sheet.isSheetCalculated) {
                            (actionData.cutCellDetails.length ? actionData.cutCellDetails :
                                actionData.cellDetails).forEach((prevCell: PreviousCellDetails): void => {
                                const cellVal: string = getCell(prevCell.rowIndex, prevCell.colIndex, sheet, false, true).value;
                                if ((cellVal || <unknown>cellVal === 0) && prevCell.value !== cellVal) {
                                    prevCell.value = cellVal;
                                }
                            });
                        }
                    } else if ((undoRedoArgs.eventArgs.requestType === 'paste' && undoRedoArgs.action === 'clipboard') ||
                        undoRedoArgs.eventArgs.fillType) {
                        let undoActionName: string;
                        if (!actionData.cutCellDetails.length) {
                            undoActionName = undoRedoArgs.eventArgs.fillType ? 'autofill' : 'Copy';
                        } else if (sheet.isSheetCalculated) {
                            undoActionName = 'Cut';
                        }
                        if (undoActionName) {
                            for (let i: number = 0, cellCol: PreviousCellDetails[] = actionData.cellDetails,
                                cutCellCol: PreviousCellDetails[] = actionData.cutCellDetails; i < cellCol.length; i++) {
                                let cellValue: CellModel | string = getCell(
                                    cellCol[i as number].rowIndex, cellCol[i as number].colIndex, sheet, false, true);
                                cellValue = cellValue ? cellValue.value : '';
                                if (undoActionName === 'Copy') {
                                    cellCol[i as number].copyCellValue = cellValue;
                                } else if (undoActionName === 'autofill') {
                                    if (cellCol[i as number].value !== cellValue && cellCol[i as number].autoFillText !== cellValue) {
                                        cellCol[i as number].autoFillText = cellValue;
                                    }
                                } else if (undoActionName === 'Cut') {
                                    if (cutCellCol[i as number].value !== cellValue) {
                                        cutCellCol[i as number].value = cellValue;
                                    }
                                }
                            }
                        }
                    }
                }
                undoRedoArgs.eventArgs.beforeActionData = actionData;
                (actionArgs.eventArgs as UndoRedoEventArgs).cancel = false;
                (undoRedoArgs as unknown as { preventAction: boolean }).preventAction = actionArgs.preventAction = true;
                if (args.isUndo) {
                    actionArgs.isUndo = true;
                    if (undoRedoArgs.action === 'cellSave' && this.parent.calculationMode === 'Manual' &&
                        sheet.isSheetCalculated && actionData.cellDetails.length === 1) {
                        const cell: CellModel = getCell(actionData.cellDetails[0].rowIndex,
                                                        actionData.cellDetails[0].colIndex, sheet);
                        if (cell && undoRedoArgs.eventArgs.displayText !== cell.value) {
                            undoRedoArgs.eventArgs.displayText = cell.value;
                        }
                    }
                } else {
                    actionArgs.isRedo = true;
                }
                if (!args.isFromUpdateAction) {
                    this.parent.notify(beginAction, actionArgs);
                }
                if ((actionArgs.eventArgs as UndoRedoEventArgs).cancel) {
                    this.updateUndoRedoIcons();
                    return;
                }
                delete (actionArgs.eventArgs as UndoRedoEventArgs).cancel;
            }
            switch (undoRedoArgs.action) {
            case 'cellSave':
            case 'format':
            case 'wrap':
            case 'cellDelete':
            case 'autofill':
            case 'removeValidation':
            case 'hyperlink':
            case 'addNote' :
            case 'editNote' :
            case 'deleteNote':
            case 'removeHyperlink':
                undoRedoArgs = this.performOperation(undoRedoArgs, args.preventEvt, args.preventReSelect, args.isFromAutoFillOption);
                undoRedoArgs.action = undoRedoAction;
                break;
            case 'sorting':
                this.undoForSorting(undoRedoArgs, args.isUndo);
                break;
            case 'clipboard':
                undoRedoArgs = this.undoForClipboard(undoRedoArgs, args.isUndo, actionArgs);
                preventEvt = true;
                break;
            case 'resize':
            case 'resizeToFit':
                undoRedoArgs = this.undoForResize(undoRedoArgs);
                if (args.isUndo) {
                    const eventArgs: UndoRedoEventArgs = undoRedoArgs.eventArgs;
                    if (!(eventArgs as unknown as { isPrevCustomHeight: boolean }).isPrevCustomHeight) {
                        const sheet: SheetModel = this.parent.sheets[eventArgs.sheetIndex];
                        const row: RowModel = sheet && getRow(sheet, eventArgs.index);
                        if (row && row.customHeight) {
                            delete row.customHeight;
                        }
                    }
                }
                break;
            case 'hideShow':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'replace':
                undoRedoArgs = this.performOperation(undoRedoArgs);
                break;
            case 'replaceAll':
                (undoRedoArgs.eventArgs as unknown as { isAction: boolean }).isAction = false;
                if (args.isUndo) {
                    replaceArgs.value = (undoRedoArgs.eventArgs as unknown as { replaceValue: string}).replaceValue;
                    replaceArgs.replaceValue = undoRedoArgs.eventArgs.value;
                    replaceArgs.skipFormatCheck = isImported(this.parent);
                }
                this.parent.notify(replaceAll, { ...undoRedoArgs.eventArgs, ...replaceArgs });
                break;
            case 'insert':
            case 'filter':
                updateAction(undoRedoArgs, this.parent, !args.isUndo, null, actionArgs);
                preventEvt = undoRedoArgs.action === 'filter';
                break;
            case 'delete':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'validation':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                undoRedoArgs = this.performOperation(undoRedoArgs);
                break;
            case 'addHighlight':
            case 'removeHighlight':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'merge':
                undoRedoArgs.eventArgs.merge = (undoRedoArgs as unknown as { isFromUpdateAction: boolean }).isFromUpdateAction ?
                    undoRedoArgs.eventArgs.merge : !undoRedoArgs.eventArgs.merge;
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'clear':
                undoRedoArgs = this.performOperation(undoRedoArgs);
                if (args.isUndo && undoRedoArgs.eventArgs.cfClearActionArgs) {
                    updateAction(
                        { action: 'clearCF', eventArgs: <UndoRedoEventArgs>undoRedoArgs.eventArgs.cfClearActionArgs }, this.parent, !args.isUndo);
                }
                for (let i: number = this.undoCollection.length; i > 0; i--) {
                    if (this.undoCollection[i - 1].isClearAction) {
                        this.performUndoRedo(args);
                    } else {
                        break;
                    }
                }
                break;
            case 'conditionalFormat':
                updateAction(undoRedoArgs, this.parent, !args.isUndo, this.undoCollection);
                break;
            case 'clearCF':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'insertImage':
            case 'deleteImage':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'imageRefresh':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'insertChart':
            case 'deleteChart':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'chartRefresh':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            case 'chartDesign':
                (undoRedoArgs.eventArgs as unknown as { isUndo: boolean }).isUndo = args.isUndo;
                this.parent.notify(undoRedoForChartDesign, undoRedoArgs.eventArgs);
                break;
            case 'addDefinedName':
                updateAction(undoRedoArgs, this.parent, !args.isUndo);
                break;
            }
            if (!args.isFromUpdateAction) {
                if (args.isUndo) {
                    this.redoCollection.push(undoRedoArgs);
                } else {
                    this.undoCollection.push(undoRedoArgs);
                }
                if (this.undoCollection.length > this.undoRedoStep) {
                    this.undoCollection.splice(0, 1);
                }
                if (this.redoCollection.length > this.undoRedoStep) {
                    this.redoCollection.splice(0, 1);
                }
                this.updateUndoRedoIcons();
                if (!args.isPublic && !preventEvt) {
                    this.parent.notify(completeAction, extend({ isUndoRedo: true, isUndo: args.isUndo }, undoRedoArgs));
                }
            }
            this.parent.notify(refreshRibbonIcons, null);
        }
    }

    private undoForSorting(args: CollaborativeEditArgs, isUndo: boolean): void {
        const sheetIndex: number = getSheetIndexFromAddress(this.parent, args.eventArgs.range);
        const range: number[] = getRangeIndexes(args.eventArgs.range);
        const updateSortIcon: Function = (idx: number, add: boolean): void => {
            if (sheetIndex === this.parent.activeSheetIndex) {
                let td: Element = this.parent.getCell(range[0] - 1, this.parent.sortCollection[idx as number].columnIndex);
                if (td) {
                    td = select('.e-filter-icon', td);
                    if (td) {
                        // Determine the class to add or remove
                        const sortClass: string = `e-sort${this.parent.sortCollection[idx as number].order === 'Ascending' ? 'asc' : 'desc'}-filter`;
                        if (add) {
                            td.classList.add(sortClass);
                        } else {
                            td.classList.remove(sortClass);
                        }
                    }
                }
            }
        };
        if (isUndo) {
            this.parent.notify(
                updateSortedDataOnCell, { result: args.eventArgs.beforeActionData.cellDetails, range: range, sheet:
                    getSheet(this.parent, sheetIndex), jsonData:
                    (args.eventArgs.beforeActionData as BeforeActionDataInternal).sortedCellDetails, isUndo: true });
            this.parent.notify(sortComplete, { range: args.eventArgs.range });
            if (this.parent.sortCollection && args.eventArgs.previousSort) {
                for (let i: number = this.parent.sortCollection.length - 1; i >= 0; i--) {
                    if (this.parent.sortCollection[i as number].sheetIndex === sheetIndex) {
                        updateSortIcon(i, false);
                        this.parent.sortCollection.splice(i, 1);
                        const prevSort: SortCollectionModel | SortCollectionModel[] = args.eventArgs.previousSort;
                        if (Array.isArray(prevSort)) {
                            for (let j: number = 0; j < prevSort.length; j++) {
                                this.parent.sortCollection.splice(j, 0, prevSort[j as number]);
                                updateSortIcon(j, true);
                            }
                        }
                        if (!this.parent.sortCollection.length) {
                            this.parent.sortCollection = undefined;
                        }
                        break;
                    }
                }
            }
        } else {
            updateAction(args, this.parent, true);
            if (args.eventArgs.previousSort) {
                let idx: number = 0;
                if (this.parent.sortCollection) {
                    for (let i: number = this.parent.sortCollection.length - 1; i >= 0; i--) {
                        if (this.parent.sortCollection[i as number].sheetIndex === sheetIndex) {
                            updateSortIcon(i, false);
                            idx = i; this.parent.sortCollection.splice(i, 1);
                        }
                    }
                } else {
                    this.parent.sortCollection = [];
                }
                this.parent.sortCollection.splice(
                    idx, 0, { sortRange: args.eventArgs.range.substring(args.eventArgs.range.lastIndexOf('!') + 1), sheetIndex: sheetIndex,
                        columnIndex: getColIndex((args.eventArgs.sortOptions.sortDescriptors as SortDescriptor).field), order:
                        (args.eventArgs.sortOptions.sortDescriptors as SortDescriptor).order });
                updateSortIcon(idx, true);
            }
        }
    }

    private updateUndoRedoCollection(options: { args: CollaborativeEditArgs, isPublic?: boolean }): void {
        const actionList: string[] = ['clipboard', 'format', 'sorting', 'cellSave', 'resize', 'resizeToFit', 'wrap', 'hideShow', 'replace',
            'validation', 'merge', 'clear', 'conditionalFormat', 'clearCF', 'insertImage', 'imageRefresh', 'insertChart', 'deleteChart',
            'chartRefresh', 'filter', 'cellDelete', 'autofill', 'autofillWithCF', 'addDefinedName', 'removeValidation', 'removeHighlight', 'addHighlight', 'hyperlink', 'removeHyperlink', 'deleteImage', 'chartDesign', 'replaceAll', 'addNote', 'editNote', 'deleteNote'];
        if ((options.args.action === 'insert' || options.args.action === 'delete') && options.args.eventArgs.modelType !== 'Sheet') {
            actionList.push(options.args.action);
        }
        const action: string = options.args.action;
        if (actionList.indexOf(action) === -1 && !options.isPublic) {
            return;
        }
        const eventArgs: UndoRedoEventArgs = options.args.eventArgs;
        if (action === 'clipboard' || action === 'sorting' || action === 'format' || action === 'cellSave' ||
            action === 'wrap' || action === 'replace' || action === 'validation' || action === 'clear' || action === 'conditionalFormat' ||
            action === 'clearCF' || action === 'insertImage' || action === 'imageRefresh' || action === 'insertChart' ||
            action === 'chartRefresh' || action === 'filter' || action === 'cellDelete' || action === 'autofill' || action === 'autofillWithCF' || action === 'removeValidation' ||
            action === 'addDefinedName' || action === 'hyperlink' || action === 'removeHyperlink' || action === 'deleteImage' || action === 'chartDesign' || action === 'addNote' || action === 'editNote' || action === 'deleteNote') {
            const beforeActionDetails: { beforeDetails: BeforeActionData } = { beforeDetails: { cellDetails: [] } };
            this.parent.notify(getBeforeActionData, beforeActionDetails);
            eventArgs.beforeActionData = beforeActionDetails.beforeDetails;
        }
        if (action === 'clipboard' && eventArgs.copiedInfo && eventArgs.copiedInfo.isExternal) {
            const addressInfo: { sheetIndex: number, indices: number[] } = this.parent.getAddressInfo(eventArgs.pastedRange);
            eventArgs.copiedInfo.cellDetails = this.getCellDetails(
                addressInfo.indices, getSheet(this.parent, addressInfo.sheetIndex), action);
        }
        if (this.redoCollection.length > 0 && this.redoCollection[this.redoCollection.length - 1].action === 'autofillWithCF' && options.args.action === 'autofill') {
            options.args.action = 'autofillWithCF';
        }
        this.undoCollection.push(options.args);
        this.redoCollection = [];
        if (this.undoCollection.length > this.undoRedoStep) {
            this.undoCollection.splice(0, 1);
        }
        this.updateUndoRedoIcons();
    }

    private clearUndoRedoCollection(): void {
        this.undoCollection = [];
        this.redoCollection = [];
        this.updateUndoRedoIcons();
    }

    private updateUndoRedoIcons(): void {
        const l10n: L10n = this.parent.serviceLocator.getService(locale);
        this.parent.notify(enableToolbarItems, [{
            tab: l10n.getConstant('Home'), items: [this.parent.element.id + '_undo']
            , enable: this.undoCollection.length > 0
        }]);
        this.parent.notify(enableToolbarItems, [{
            tab: l10n.getConstant('Home'), items: [this.parent.element.id + '_redo']
            , enable: this.redoCollection.length > 0
        }]);
    }

    private updateUndoRedoSheetReferences(args: { [key: string]: string }): void {
        const updateReference: Function = (collection: CollaborativeEditArgs[]) => {
            collection.forEach((editArgs: CollaborativeEditArgs) => {
                const eventArgs: UndoRedoEventArgs = editArgs.eventArgs;
                if (eventArgs) {
                    ['address', 'dataRange', 'fillRange'].forEach((property: string) => {
                        if (eventArgs[property as string] && eventArgs[property as string].includes(args.pName)) {
                            eventArgs[property as string] = eventArgs[property as string].replace(args.pName, args.value);
                        }
                    });
                }
            });
        };
        updateReference(this.undoCollection);
        updateReference(this.redoCollection);
    }

    private undoForClipboard(args: CollaborativeEditArgs, isUndo: boolean, actionArgs?: ActionEventArgs): CollaborativeEditArgs {
        const eventArgs: UndoRedoEventArgs = args.eventArgs;
        const address: string[] = [];
        address[0] = eventArgs.pastedRange.substring(0, eventArgs.pastedRange.lastIndexOf('!'));
        address[1] = eventArgs.pastedRange.substring(eventArgs.pastedRange.lastIndexOf('!') + 1);
        const range: number[] = getRangeIndexes(address[1]);
        const sheetIndex: number = getSheetIndex(this.parent as Workbook, address[0]);
        const sheet: SheetModel = getSheet(this.parent as Workbook, sheetIndex);
        const copiedInfo: { [key: string]: Object } = eventArgs.copiedInfo;
        const actionData: BeforeActionData = eventArgs.beforeActionData;
        const isFromUpdateAction: boolean = (args as unknown as { isFromUpdateAction: boolean }).isFromUpdateAction;
        const isRefresh: boolean = sheetIndex === this.parent.activeSheetIndex;
        let pictureElem: HTMLElement;
        if (actionArgs) {
            (actionArgs as unknown as { isUndoRedo: boolean }).isUndoRedo = true;
            (actionArgs.eventArgs as { beforeActionData: BeforeActionData }).beforeActionData = actionData;
        }
        if (args.eventArgs.requestType === 'imagePaste') {
            const copiedShapeInfo: { [key: string]: Object } = eventArgs.copiedShapeInfo;
            if (isUndo) {
                pictureElem = copiedShapeInfo.pictureElem as HTMLElement;
                if (copiedShapeInfo.isCut) {
                    this.parent.notify(deleteImage, {
                        id: pictureElem.id, sheetIdx: eventArgs.pasteSheetIndex + 1, isUndoRedo: true
                    });
                    this.parent.notify(createImageElement, {
                        options: {
                            src: pictureElem.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2'),
                            height: copiedShapeInfo.height, width: copiedShapeInfo.width, id: pictureElem.id
                        },
                        range: copiedShapeInfo.copiedRange, isPublic: false, isUndoRedo: true
                    });
                } else {
                    this.parent.notify(deleteImage, {
                        id: eventArgs.pastedPictureElement.id, sheetIdx: eventArgs.pasteSheetIndex + 1, range: eventArgs.pastedRange,
                        isUndoRedo: true
                    });
                }
            } else {
                if (copiedShapeInfo.isCut) {
                    pictureElem = copiedShapeInfo.pictureElem as HTMLElement;
                    this.parent.notify(deleteImage, {
                        id: pictureElem.id, sheetIdx: copiedShapeInfo.sId, isUndoRedo: true
                    });
                    this.parent.notify(createImageElement, {
                        options: {
                            src: pictureElem.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2'),
                            height: copiedShapeInfo.height, width: copiedShapeInfo.width, id: pictureElem.id
                        },
                        range: copiedShapeInfo.pastedRange, isPublic: false, isUndoRedo: true
                    });
                } else {
                    pictureElem = eventArgs.pastedPictureElement;
                    this.parent.notify(createImageElement, {
                        options: {
                            src: pictureElem.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2'),
                            height: copiedShapeInfo.height, width: copiedShapeInfo.width, id: pictureElem.id
                        },
                        range: eventArgs.pastedRange, isPublic: false, isUndoRedo: true
                    });
                }
            }
        } else {
            if (isUndo) {
                if (copiedInfo.isCut) {
                    const cells: PreviousCellDetails[] = actionData.cutCellDetails;
                    this.updateCellDetails(
                        cells, getSheet(this.parent as Workbook, getSheetIndexFromId(this.parent as Workbook, <number>copiedInfo.sId)),
                        getSwapRange(copiedInfo.range as number[]), isRefresh, args);
                    if (eventArgs.cfClearActionArgs) {
                        updateAction({ action: 'clearCF', eventArgs: <UndoRedoEventArgs>eventArgs.cfClearActionArgs }, this.parent, false);
                    }
                }
                if (actionData) {
                    this.updateCellDetails(actionData.cellDetails, sheet, range, isRefresh, args, null, null, actionArgs ?
                        (actionArgs as unknown as { isUndoRedo: boolean }).isUndoRedo : null);
                }
                if (eventArgs.cfActionArgs) {
                    eventArgs.cfActionArgs.cfModel.forEach((cf: ConditionalFormatModel): void => {
                        updateAction(
                            { eventArgs: <UndoRedoEventArgs>{ range: cf.range, type: cf.type, cFColor: cf.cFColor, value: cf.value,
                                sheetIdx: eventArgs.cfActionArgs.sheetIdx, cancel: true }, action: 'conditionalFormat' }, this.parent,
                            false);
                    });
                }
                setMaxHgt(sheet, range[0], range[1], getRowHeight(sheet, range[0]));
                const hgt: number = getMaxHgt(sheet, range[0]);
                setRowEleHeight(this.parent, sheet, hgt, range[0]);
                eventArgs.mergeCollection.forEach((mergeArgs: MergeArgs): void => {
                    mergeArgs.merge = !mergeArgs.merge; this.parent.notify(setMerge, mergeArgs); mergeArgs.merge = !mergeArgs.merge;
                });
                if (actionArgs && !isFromUpdateAction) {
                    this.parent.notify(completeAction, actionArgs);
                }
            } else {
                if (copiedInfo.isExternal) {
                    const addressInfo: { sheetIndex: number, indices: number[] } = this.parent.getAddressInfo(eventArgs.pastedRange);
                    this.updateCellDetails(
                        copiedInfo.cellDetails as PreviousCellDetails[], getSheet(this.parent, addressInfo.sheetIndex),
                        addressInfo.indices, true, args, null, null, actionArgs ?
                            (actionArgs as unknown as { isUndoRedo: boolean }).isUndoRedo : null);
                    if (actionArgs && !isFromUpdateAction) {
                        this.parent.notify(completeAction, actionArgs);
                    }
                } else {
                    const clipboardPromise: Promise<Object> = new Promise((resolve: Function) => { resolve((() => { /** */ })()); });
                    const addressInfo: { sheetIndex: number, indices: number[] } = this.parent.getAddressInfo(eventArgs.copiedRange);
                    this.parent.notify(eventArgs.copiedInfo.isCut ? cut : copy, {
                        range: addressInfo.indices, sId: getSheet(this.parent, addressInfo.sheetIndex).id,
                        promise: clipboardPromise, invokeCopy: true, isPublic: true, isFromUpdateAction: isFromUpdateAction
                    });
                    clipboardPromise.then(() => {
                        this.parent.notify(paste, {
                            range: address ? getIndexesFromAddress(eventArgs.pastedRange) : address,
                            sIdx: address ? getSheetIndex(this.parent, getSheetNameFromAddress(eventArgs.pastedRange)) : address,
                            type: eventArgs.type, isAction: false, isInternal: true, isFromUpdateAction: isFromUpdateAction,
                            beforeActionData: eventArgs.beforeActionData, isUndo: isUndo
                        });
                        if (actionArgs && !isFromUpdateAction) {
                            this.parent.notify(completeAction, actionArgs);
                        }
                    });
                }
            }
            if (isRefresh && !isFromUpdateAction) {
                this.parent.notify(selectRange, { address: eventArgs.selectedRange });
                this.parent.notify(positionAutoFillElement, {});
            } else {
                this.checkRefreshNeeded(sheetIndex, isFromUpdateAction);
            }
        }
        return args;
    }

    private undoForResize(args: CollaborativeEditArgs): CollaborativeEditArgs {
        const eventArgs: UndoRedoEventArgs = args.eventArgs;
        if (eventArgs.hide === undefined) {
            if (eventArgs.isCol) {
                const temp: string = eventArgs.oldWidth;
                eventArgs.oldWidth = eventArgs.width;
                eventArgs.width = temp;
            } else {
                const temp: string = eventArgs.oldHeight;
                eventArgs.oldHeight = eventArgs.height;
                eventArgs.height = temp;
            }
        } else {
            eventArgs.hide = !eventArgs.hide;
        }
        updateAction(args, this.parent, false);
        const sheet: SheetModel = this.parent.getActiveSheet();
        const activeCell: number[] = getRangeIndexes(sheet.activeCell);
        const CellElem: CellModel = getCell(activeCell[0], activeCell[1], sheet);
        if (CellElem && CellElem.rowSpan) {
            const td: HTMLElement = this.parent.getCell(activeCell[0], activeCell[1]);
            (this.parent.element.querySelector('.e-active-cell') as HTMLElement).style.height = td.offsetHeight + 'px';
        } else if (CellElem && CellElem.colSpan) {
            const td: HTMLElement = this.parent.getCell(activeCell[0], activeCell[1]);
            (this.parent.element.querySelector('.e-active-cell') as HTMLElement).style.width = td.offsetWidth +  'px';
        }
        return args;
    }

    private performOperation(
        args: CollaborativeEditArgs, preventEvt?: boolean, preventReSelect?: boolean,
        isFromAutoFillOption?: boolean): CollaborativeEditArgs {
        const eventArgs: UndoRedoEventArgs = args.eventArgs;
        const address: string[] = [];
        const undoRange: string = (args.action === 'cellSave' || args.action === 'wrap' || args.action === 'replace'
            || args.action === 'cellDelete' || args.action === 'hyperlink' || args.action === 'addNote' || args.action === 'editNote'
            || args.action === 'deleteNote' || args.action === 'removeHyperlink') ? eventArgs.address : eventArgs.range;
        if (args.action === 'autofill') {
            address[0] = eventArgs.fillRange.substring(0, eventArgs.fillRange.lastIndexOf('!'));
            address[1] = eventArgs.fillRange.substring(eventArgs.fillRange.lastIndexOf('!') + 1);
        } else {
            address[0] = undoRange.substring(0, undoRange.lastIndexOf('!'));
            address[1] = undoRange.substring(undoRange.lastIndexOf('!') + 1);
        }
        const sheetIndex: number = getSheetIndex(this.parent as Workbook, address[0]);
        const sheet: SheetModel = getSheet(this.parent as Workbook, sheetIndex);
        let range: number[];
        if (eventArgs.isColSelected) {
            const rangeArr: string[] = address[1].split(':');
            range = [0, getColIndex(rangeArr[0]), sheet.rowCount - 1, getColIndex(rangeArr[1])];
        } else {
            range = getSwapRange(getRangeIndexes(address[1]));
        }
        const indexes: number[] = range;
        const actionData: BeforeActionData = eventArgs.beforeActionData;
        const isFromUpdateAction: boolean = (args as unknown as { isFromUpdateAction: boolean }).isFromUpdateAction;
        const isRefresh: boolean = this.checkRefreshNeeded(sheetIndex, isFromUpdateAction);
        const uniqueArgs: { cellIdx: number[], isUnique: boolean, uniqueRange: string } = { cellIdx: [range[0], range[1]], isUnique: false , uniqueRange: ''};
        if (!eventArgs.isColSelected) {
            this.parent.notify(checkUniqueRange, uniqueArgs);
        }
        if (this.isUndo) {
            if (uniqueArgs.isUnique && eventArgs.formula && eventArgs.formula.indexOf('UNIQUE') > - 1) {
                const rangeIdx: number[] = getRangeIndexes(uniqueArgs.uniqueRange);
                if (getCell(rangeIdx[0], rangeIdx[1], this.parent.getActiveSheet()).value !== '#SPILL!') {
                    for (let j: number = rangeIdx[0]; j <= rangeIdx[2]; j++) {
                        for (let k: number = rangeIdx[1]; k <= rangeIdx[3]; k++) {
                            if (j === rangeIdx[0] && k === rangeIdx[1]) {
                                k = k + 1;
                            }
                            this.parent.updateCellInfo({value: ''}, getRangeAddress([j, k]), true);
                        }
                    }
                }
            }
            this.updateCellDetails(actionData.cellDetails, sheet, range, isRefresh, args, preventEvt,
                                   eventArgs.isColSelected, true, isFromAutoFillOption);
            if (uniqueArgs.isUnique && args.action === 'cellDelete' && eventArgs.isSpill) {
                const rangeIdx: number[] = getRangeIndexes(uniqueArgs.uniqueRange);
                const cell: CellModel = getCell(rangeIdx[0], rangeIdx[1], this.parent.getActiveSheet());
                for (let i: number = rangeIdx[0]; i <= rangeIdx[2]; i++) {
                    for (let j: number = rangeIdx[1]; j <= rangeIdx[3]; j++) {
                        for (let k: number = range[0]; k <= range[2]; k++) {
                            for (let l: number = range[1]; l <= range[3]; l++) {
                                if (i !== k || j !== l) {
                                    this.parent.updateCellInfo({value: ''}, getCellAddress(i, j), true);
                                }
                            }
                        }
                    }
                }
                cell.value = '#SPILL!';
                this.parent.updateCellInfo(cell, getCellAddress(rangeIdx[0], rangeIdx[1]), true);
            }
            if (!eventArgs.isSpill && uniqueArgs.uniqueRange !== '') {
                const indexes: number[] = getRangeIndexes(uniqueArgs.uniqueRange);
                for (let j: number = indexes[0]; j <= indexes[2]; j++) {
                    for (let k: number = indexes[1]; k <= indexes[3]; k++) {
                        if (j === indexes[0] && k === indexes[1]) {
                            k = k + 1;
                        }
                        this.parent.updateCellInfo({value: ''}, getRangeAddress([j, k]), true);
                    }
                }
                this.parent.notify(reApplyFormula, null);
            }
        } else {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const argsEventArgs: any = args.eventArgs;
            let activeCellIndexes: number[] = getRangeIndexes(sheet.activeCell);
            const startRange: string[] = address[1] ? address[1].split(':') : [];
            if (indexes[0] !== activeCellIndexes[0] && indexes[1] !== activeCellIndexes[1] &&
                args.action === 'hyperlink' && startRange.length > 0) {
                sheet.activeCell = startRange[0];
                activeCellIndexes = getRangeIndexes(sheet.activeCell);
            }
            let cellValue: TextDecoration = this.parent.getCellStyleValue(['textDecoration'], activeCellIndexes).textDecoration;
            if (argsEventArgs && argsEventArgs.style && (argsEventArgs.style as CellStyleModel).textDecoration ) {
                const value: TextDecoration = (argsEventArgs.style as CellStyleModel).textDecoration;
                let changedValue: TextDecoration = value;
                let changedStyle: CellStyleModel;
                let removeProp: boolean = false;
                if (cellValue === 'underline') {
                    changedValue = value === 'underline' ? 'none' : 'underline line-through';
                } else if (cellValue === 'line-through') {
                    changedValue = value === 'line-through' ? 'none' : 'underline line-through';
                } else if (cellValue === 'underline line-through') {
                    changedValue = value === 'underline' ? 'line-through' : 'underline'; removeProp = true;
                }
                if (changedValue === 'none') { removeProp = true; }
                (argsEventArgs.style as CellStyleModel).textDecoration = changedValue;
                args.eventArgs = argsEventArgs as UndoRedoEventArgs;
                for (let i: number = indexes[0]; i <= indexes[2]; i++) {
                    for (let j: number = indexes[1]; j <= indexes[3]; j++) {
                        changedStyle = {};
                        cellValue = this.parent.getCellStyleValue(['textDecoration'], [i, j]).textDecoration;
                        if (cellValue === 'none') {
                            if (removeProp) { continue; }
                            changedStyle.textDecoration = value;
                        } else if (cellValue === 'underline' || cellValue === 'line-through') {
                            if (removeProp) {
                                if (value === cellValue) {
                                    changedStyle.textDecoration = 'none';
                                } else {
                                    continue;
                                }
                            } else {
                                changedStyle.textDecoration = value !== cellValue ? 'underline line-through' : value;
                            }
                        } else if (cellValue === 'underline line-through') {
                            if (removeProp) {
                                changedStyle.textDecoration = value === 'underline' ? 'line-through' : 'underline';
                            } else {
                                continue;
                            }
                        }
                        this.parent.notify(setCellFormat, {
                            style: { textDecoration: changedStyle.textDecoration }, range: [i, j, i, j], refreshRibbon: true,
                            onActionUpdate: true
                        });
                    }
                }
                (argsEventArgs.style as CellStyleModel).textDecoration = value;
                args.eventArgs = argsEventArgs as UndoRedoEventArgs;
            } else {
                if (!isNullOrUndefined(eventArgs.oldValue) && eventArgs.oldValue !== eventArgs.value && uniqueArgs.isUnique) {
                    const indexes: number[] = getRangeIndexes(uniqueArgs.uniqueRange);
                    if (getCell(indexes[0], indexes[1], this.parent.getActiveSheet()).value !== '#SPILL!') {
                        for (let j: number = indexes[0]; j <= indexes[2]; j++) {
                            for (let k: number = indexes[1]; k <= indexes[3]; k++) {
                                if (j === indexes[0] && k === indexes[1]) {
                                    this.parent.updateCellInfo({value: '#SPILL!'}, getRangeAddress([indexes[0], indexes[1]]), true);
                                    k = k + 1;
                                }
                                this.parent.updateCellInfo({value: ''}, getRangeAddress([j, k]), true);
                            }
                        }
                    }
                }
                updateAction(args, this.parent, true);
                if (uniqueArgs.isUnique && args.action === 'cellDelete' && eventArgs.isSpill) {
                    const indexes: number[] = getRangeIndexes(uniqueArgs.uniqueRange); let Skip: boolean = false;
                    for (let i: number = indexes[0]; i <= indexes[1]; i++) {
                        for (let j: number = indexes[1]; j <= indexes[3]; j++) {
                            if (i === indexes[0] && j === indexes[1]) {
                                j++;
                            }
                            if (getCell(i, j, sheet) && !isNullOrUndefined(getCell(i, j, sheet).value)
                            && getCell(i, j, sheet).value !== '') {
                                Skip = true;
                            }
                        }
                    }
                    if (!Skip) {
                        const cell: CellModel = getCell(indexes[0], indexes[1], this.parent.getActiveSheet());
                        cell.value = '';
                        this.parent.updateCellInfo(cell, getCellAddress(indexes[0], indexes[1]), true);
                        this.parent.notify(reApplyFormula, null);
                    }
                }
            }
        }
        if (args.action === 'autofill') {
            address[1] = this.isUndo ? args.eventArgs.dataRange : args.eventArgs.selectedRange;
        }
        if (isRefresh && !preventReSelect && !isFromUpdateAction) {
            if (eventArgs.isColSelected) {
                address[1] = sheet.selectedRange;
            }
            this.parent.notify(selectRange, { address: address[1] });
        }
        if (this.parent.showAggregate) {
            this.parent.notify(showAggregate, {});
        }
        return args;
    }
    private getCellDetails(address: number[], sheet: SheetModel, action: string): PreviousCellDetails[] {
        const cells: PreviousCellDetails[] = [];
        let cell: CellModel; const filterCheck: boolean = action === 'cellDelete';
        const processedColumns: { [key: number]: boolean } = {};
        address = getSwapRange(address);
        const updateCellProps: Function = (rowIdx: number, colIdx: number): void => {
            const currentCell: PreviousCellDetails = {
                rowIndex: rowIdx, colIndex: colIdx, value: cell ? cell.value : '',
                formula: cell ? cell.formula : ''
            };
            const rowHeight: number = getRowHeight(sheet, rowIdx);
            if (cell) {
                if (cell.format) { currentCell.format = cell.format; }
                if (!isNullOrUndefined(cell.isLocked)) { currentCell.isLocked = cell.isLocked; }
                if (cell.style) { currentCell.style = Object.assign({}, cell.style); }
                if (cell.wrap) { currentCell.wrap = cell.wrap; }
                if (cell.rowSpan) { currentCell.rowSpan = cell.rowSpan; }
                if (cell.colSpan) { currentCell.colSpan = cell.colSpan; }
                if (cell.image) { currentCell.image = cell.image; }
                if (cell.chart) { currentCell.chart = JSON.parse(JSON.stringify(cell.chart)); }
                if (cell.validation) { currentCell.validation = Object.assign({}, cell.validation); }
                if (cell.notes) { currentCell.notes = cell.notes; }
                if (cell.isReadOnly) { currentCell.isReadOnly = cell.isReadOnly; }
                if (cell.formattedText) { currentCell.formattedText = cell.formattedText; }
                if (cell.hyperlink) {
                    currentCell.hyperlink = (isObject(cell.hyperlink) ? extend({}, cell.hyperlink) : cell.hyperlink);
                }
                if (sheet.standardHeight ? rowHeight !== sheet.standardHeight : rowHeight !== 20) {
                    cell.rowHeight = currentCell.rowHeight = rowHeight;
                }
                const editModule: { editCellData?: { value?: string, prevFormulaValue?: string } } =
                    (this.parent as unknown as { editModule?: Object }).editModule;
                currentCell.value = cell && editModule && cell.formula === editModule.editCellData.value &&
                    (!isNullOrUndefined(editModule.editCellData.prevFormulaValue)) ?
                    editModule.editCellData.prevFormulaValue : currentCell.value;
            }
            cells.push(currentCell);
        };
        if (action === 'validation' || action === 'removeValidation') {
            for (let colIdx: number = address[1]; colIdx <= address[3]; colIdx++) {
                const column: ColumnModel = getColumn(sheet, colIdx);
                for (let rowIdx: number = address[0]; rowIdx <= address[2]; rowIdx++) {
                    if (!processedColumns[colIdx as number] && checkColumnValidation(column, rowIdx, colIdx)) {
                        cells.push({ colIndex: colIdx, validation: Object.assign({}, column.validation) });
                        processedColumns[colIdx as number] = true;
                    }
                    cell = getCell(rowIdx, colIdx, sheet);
                    if (cell && !cell.validation) { continue; }
                    updateCellProps(rowIdx, colIdx);
                }
            }
        } else {
            for (let i: number = address[0]; i <= address[2]; i++) {
                if (filterCheck && isFilterHidden(sheet, i)) { continue; }
                for (let j: number = address[1]; j <= address[3]; j++) {
                    cell = getCell(i, j, sheet);
                    updateCellProps(i, j);
                }
            }
        }
        return cells;
    }

    private updateCellDetails(
        cells: PreviousCellDetails[], sheet: SheetModel, range: number[], isRefresh: boolean, args?: CollaborativeEditArgs,
        preventEvt?: boolean, isColSelected?: boolean, isUndoRedo?: boolean, isFromAutoFillOption?: boolean): void {
        const len: number = cells.length;
        const triggerEvt: boolean = args && !preventEvt && (args.action === 'cellSave' || args.action === 'cellDelete' ||
            args.action === 'autofill' || args.action === 'clipboard');
        let cellElem: HTMLElement; let prevCell: CellModel; let select: boolean;
        const cf: ConditionalFormat[] = args && !args.eventArgs.cfClearActionArgs && sheet.conditionalFormats &&
            sheet.conditionalFormats.length && [].slice.call(sheet.conditionalFormats);
        const cfRule: ConditionalFormatModel[] = []; let cfRefreshAll: boolean;
        let evtArgs: { [key: string]: string | boolean | number[] | number };
        let isDelete: boolean; let deletedRange: number[];
        if (args.action === 'cellDelete') {
            isDelete = false;
            deletedRange = range;
        }
        for (let i: number = 0; i < len; i++) {
            if (isColSelected || isUndefined(cells[i as number].rowIndex)) {
                setColumn(sheet, cells[i as number].colIndex, { validation: cells[i as number].validation });
                continue;
            }
            prevCell = getCell(cells[i as number].rowIndex, cells[i as number].colIndex, sheet, false, true);
            if (prevCell.style && args && (args.action === 'format' || args.action === 'clipboard')) {
                if (prevCell.style.borderTop && (!cells[i as number].style || !(cells[i as number].style as CellStyleModel).borderTop)) {
                    this.parent.setBorder(
                        { borderTop: '' }, sheet.name + '!' + getCellAddress(cells[i as number].rowIndex, cells[i as number].colIndex), null, isUndoRedo);
                }
                if (prevCell.style.borderLeft && (!cells[i as number].style || !(cells[i as number].style as CellStyleModel).borderLeft)) {
                    this.parent.setBorder(
                        { borderLeft: '' }, sheet.name + '!' + getCellAddress(cells[i as number].rowIndex, cells[i as number].colIndex), null, isUndoRedo);
                }
                if (prevCell.style.borderRight && (!cells[i as number].style ||
                    !(cells[i as number].style as CellStyleModel).borderRight)) {
                    this.parent.setBorder(
                        { borderRight: '' }, sheet.name + '!' + getCellAddress(cells[i as number].rowIndex, cells[i as number].colIndex), null, isUndoRedo);
                }
                if (prevCell.style.fontSize && (!cells[i as number].style || !(cells[i as number].style as CellStyleModel).fontSize)) {
                    prevCell.style.fontSize = '11pt'; select = true;
                    this.parent.notify(
                        applyCellFormat, <CellFormatArgs>{ style: { fontSize: '11pt' }, rowIdx: cells[i as number].rowIndex, colIdx:
                        cells[i as number].colIndex, lastCell: true, isHeightCheckNeeded: true, manualUpdate: true, onActionUpdate: true });
                }
                if (prevCell.style.fontFamily && (!cells[i as number].style || !(cells[i as number].style as CellStyleModel).fontFamily)) {
                    select = true; prevCell.style.fontFamily = 'Calibri';
                    this.parent.notify(
                        applyCellFormat, <CellFormatArgs>{ style: { fontFamily: 'Calibri' }, rowIdx: cells[i as number].rowIndex, colIdx:
                        cells[i as number].colIndex, lastCell: true, isHeightCheckNeeded: true, manualUpdate: true, onActionUpdate: true });
                }
            }
            if (prevCell.image && args && args.action === 'clipboard') {
                prevCell.image.forEach((image: ImageModel): void => {
                    this.parent.notify(
                        deleteImage, { id: image.id, sheet: sheet, preventEventTrigger: true, rowIdx: cells[i as number].rowIndex,
                            colIdx: cells[i as number].colIndex });
                });
            }
            const currentCell: PreviousCellDetails = {
                value: (
                    cells[i as number].formula && cells[i as number].formula.toUpperCase().includes('UNIQUE')
                ) ? null : cells[i as number].value, formula: cells[i as number].formula
            };
            if (cells[i as number].format) { currentCell.format = cells[i as number].format; }
            if (!isNullOrUndefined(cells[i as number].isLocked)) {
                currentCell.isLocked = prevCell.isLocked ? prevCell.isLocked : cells[i as number].isLocked;
            }
            if (cells[i as number].style) { currentCell.style = Object.assign({}, cells[i as number].style); }
            if (cells[i as number].wrap) { currentCell.wrap = cells[i as number].wrap; }
            if (cells[i as number].rowSpan) { currentCell.rowSpan = cells[i as number].rowSpan; }
            if (cells[i as number].colSpan) { currentCell.colSpan = cells[i as number].colSpan; }
            if (cells[i as number].hyperlink) { currentCell.hyperlink = cells[i as number].hyperlink; }
            if (cells[i as number].image) { currentCell.image = cells[i as number].image; }
            if (cells[i as number].notes) { currentCell.notes = cells[i as number].notes; }
            if (cells[i as number].isReadOnly) { currentCell.isReadOnly = cells[i as number].isReadOnly; }
            if (cells[i as number].formattedText) { currentCell.formattedText = cells[i as number].formattedText; }
            setCell(cells[i as number].rowIndex, cells[i as number].colIndex, sheet, currentCell);
            evtArgs = {
                action: 'updateCellValue', address: [cells[i as number].rowIndex, cells[i as number].colIndex,
                    cells[i as number].rowIndex, cells[i as number].colIndex], notes: cells[i as number].notes,
                value: cells[i as number].formula ? cells[i as number].formula : cells[i as number].value,
                sheetIndex: getSheetIndex(this.parent, sheet.name), skipFormatCheck: isImported(this.parent),
                isDelete: isDelete, deletedRange: deletedRange, actionName: args.action
            };
            this.parent.notify(workbookEditOperation, evtArgs);
            if (cf && !cfRefreshAll) {
                cfRefreshAll = <boolean>evtArgs.isFormulaDependent;
            }
            if (args && args.action === 'format' && args.eventArgs.requestType === 'NumberFormat' && currentCell.wrap &&
                currentCell.format !== prevCell.format && !getRow(sheet, cells[i as number].rowIndex).customHeight) {
                this.parent.notify(wrapEvent, {
                    range: [cells[i as number].rowIndex, cells[i as number].colIndex, cells[i as number].rowIndex,
                        cells[i as number].colIndex], wrap: true, sheet: sheet, initial: true, isOtherAction: true });
            } else if ((args && args.action === 'wrap' && args.eventArgs.wrap) || (prevCell.wrap && !cells[i as number].wrap)) {
                this.parent.notify(wrapEvent, {
                    range: [cells[i as number].rowIndex, cells[i as number].colIndex, cells[i as number].rowIndex,
                        cells[i as number].colIndex], wrap: false, sheet: sheet, initial: true
                });
            } else if (args && args.action === 'cellSave' && (prevCell.wrap && cells[i as number].wrap && prevCell.value &&
                prevCell.value.toString().includes('\n') && cells[i as number].value && !cells[i as number].value.toString().includes('\n'))) {
                this.parent.notify(wrapEvent, {
                    range: [cells[i as number].rowIndex, cells[i as number].colIndex, cells[i as number].rowIndex,
                        cells[i as number].colIndex], wrap: true, sheet: sheet, initial: true, isOtherAction: true
                });
            }
            if (args && cells[i as number].hyperlink && args.action === 'clear') {
                const hyperlinkRange: string = sheet.name + '!' + getRangeAddress(
                    [cells[i as number].rowIndex, cells[i as number].colIndex, cells[i as number].rowIndex, cells[i as number].colIndex]);
                cellElem = this.parent.getCell(cells[i as number].rowIndex, cells[i as number].colIndex);
                if (args.eventArgs.type === 'Clear All' || args.eventArgs.type === 'Clear Hyperlinks') {
                    this.parent.addHyperlink(cells[i as number].hyperlink, hyperlinkRange, cells[i as number].value);
                } else if (args.eventArgs.type === 'Clear Formats' && cellElem) {
                    addClass(cellElem.querySelectorAll('.e-hyperlink'), 'e-hyperlink-style');
                }
            }
            if (cells[i as number].validation) {
                this.parent.notify(
                    cellValidation, { rules: cells[i as number].validation,
                        range: `${sheet.name}!${getCellAddress(cells[i as number].rowIndex, cells[i as number].colIndex)}` });
            }
            if (triggerEvt && cells[i as number].value !== prevCell.value) {
                this.parent.trigger(
                    'cellSave', { element: null, value: cells[i as number].value, oldValue: prevCell.value, formula:
                        cells[i as number].formula, cancel: false,
                    address: `${sheet.name}!${getCellAddress(cells[i as number].rowIndex, cells[i as number].colIndex)}`,
                    displayText: this.parent.getDisplayText(cells[i as number]) });
            }
            if (cf && !cfRefreshAll) {
                updateCFModel(cf, cfRule, cells[i as number].rowIndex, cells[i as number].colIndex);
            }
        }
        if (isRefresh) {
            if (range[0] === range[2] && range[1] === range[3]) {
                const cell: CellModel = getCell(range[0], range[1], sheet);
                if (cell.rowSpan > 1) {
                    range[2] = range[0] + cell.rowSpan - 1;
                }
                if (cell.colSpan > 1) {
                    range[3] = range[1] + cell.colSpan - 1;
                }
            }
            let isHeightCheckFromUndo: boolean = false;
            if (args.action === 'autofill' || args.action === 'clipboard' || args.action === 'wrap') {
                isHeightCheckFromUndo = true;
            } else if (args.action === 'format' && args.eventArgs.requestType === 'CellFormat') {
                isHeightCheckFromUndo = isHeightCheckNeeded(args.eventArgs.style, true);
            }
            this.parent.serviceLocator.getService<ICellRenderer>('cell').refreshRange(
                range, false, false, true, false, isImported(this.parent), null, isFromAutoFillOption,
                isHeightCheckFromUndo, null, null, cells);
            if (cfRule.length || cfRefreshAll) {
                this.parent.notify(applyCF, <ApplyCFArgs>{ cfModel: !cfRefreshAll && cfRule, refreshAll: cfRefreshAll, isAction: true });
            }
            if (select) { getUpdateUsingRaf((): void => this.parent.selectRange(sheet.selectedRange)); }
        }
    }

    private checkRefreshNeeded(sheetIndex: number, isFromUpdateAction?: boolean): boolean {
        let isRefresh: boolean = true;
        if (sheetIndex !== this.parent.activeSheetIndex) {
            if (!isFromUpdateAction) {
                this.parent.activeSheetIndex = sheetIndex;
                this.parent.dataBind();
            }
            isRefresh = false;
        }
        return isRefresh;
    }
    private addEventListener(): void {
        this.parent.on(performUndoRedo, this.performUndoRedo, this);
        this.parent.on(updateUndoRedoCollection, this.updateUndoRedoCollection, this);
        this.parent.on(setActionData, this.setActionData, this);
        this.parent.on(getBeforeActionData, this.getBeforeActionData, this);
        this.parent.on(clearUndoRedoCollection, this.clearUndoRedoCollection, this);
        this.parent.on(setUndoRedo, this.updateUndoRedoIcons, this);
        this.parent.on(sheetRenameUpdate, this.updateUndoRedoSheetReferences, this);
    }

    private removeEventListener(): void {
        if (!this.parent.isDestroyed) {
            this.parent.off(performUndoRedo, this.performUndoRedo);
            this.parent.off(updateUndoRedoCollection, this.updateUndoRedoCollection);
            this.parent.off(setActionData, this.setActionData);
            this.parent.off(getBeforeActionData, this.getBeforeActionData);
            this.parent.off(clearUndoRedoCollection, this.clearUndoRedoCollection);
            this.parent.off(setUndoRedo, this.updateUndoRedoIcons);
            this.parent.off(sheetRenameUpdate, this.updateUndoRedoSheetReferences);
        }
    }

    /**
     * Destroy undo redo module.
     *
     * @returns {void} - Destroy undo redo module.
     */

    public destroy(): void {
        this.removeEventListener();
        if (this.undoCollection.length > 0) { this.undoCollection = []; }
        if (this.redoCollection.length > 0) { this.redoCollection = []; }
        if (this.beforeActionData && this.beforeActionData.cellDetails) { this.beforeActionData.cellDetails = []; }
        this.parent = null;
    }
    /**
     * Get the undo redo module name.
     *
     * @returns {string} - Get the undo redo module name.
     */
    public getModuleName(): string {
        return 'undoredo';
    }
}
