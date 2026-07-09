
import { extend, removeClass, setValue, select } from '@syncfusion/ej2-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { IGrid, NotifyArgs, SaveEventArgs } from '../base/interface';
import { CellEditArgs, CellSaveArgs } from '../base/interface';
import { parentsUntil, getObject, addRemoveEventListener } from '../base/util';
import * as events from '../base/constant';
import { EditRender } from '../renderer/edit-renderer';
import { Row } from '../models/row';
import { ServiceLocator } from '../services/service-locator';
import { Column } from '../models/column';
import * as literals from '../base/string-literals';
import { BatchEdit } from './batch-edit';
import { Data } from './data';
import { NormalEdit } from './normal-edit';

/**
 * `CellEdit` module is used to handle single-cell editing with keyboard navigation.
 *
 * @hidden
 */
export class CellEdit extends BatchEdit {
    public renderer: EditRender;
    private cellEditModule: NormalEdit;
    public data: Data;

    constructor(parent: IGrid, serviceLocator: ServiceLocator, renderer?: EditRender) {
        super(parent, serviceLocator, renderer);
        this.data = new Data(parent, serviceLocator);
        this.renderer = renderer;
        this.cellEditModule = new NormalEdit(parent, serviceLocator, renderer);
        this.addEventListener();
    }

    /**
     * Register event listeners for cell edit mode.
     *
     * @returns {void}
     * @hidden
     */
    public addEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.evtHandlers = [
            { event: events.click, handler: this.clickHandler },
            { event: events.dblclick, handler: this.dblClickHandler },
            { event: events.cellFocused, handler: super.onCellFocused },
            { event: events.destroy, handler: this.destroy },
            { event: events.deleteComplete, handler: this.editComplete },
            { event: events.saveComplete, handler: this.editComplete }
        ];
        addRemoveEventListener(this.parent, this.evtHandlers, true, this);
    }

    /**
     * Remove event listeners (called during destroy).
     *
     * @returns {void}
     * @hidden
     */
    public removeEventListener(): void {
        if (this.parent.isDestroyed) {
            return;
        }
        addRemoveEventListener(this.parent, this.evtHandlers, false);
    }

    protected clickHandler(e: MouseEvent): void {
        const target: Element = e.target as Element;
        if (!parentsUntil(target as Element, this.parent.element.id + '_add', true)) {
            if (parentsUntil(target, literals.gridContent) &&
                parentsUntil(parentsUntil(target, literals.gridContent), 'e-grid').id === this.parent.element.id
                && !parentsUntil(target, 'e-unboundcelldiv')) {
                if (this.parent.isEdit) {
                    this.endEdit();
                }
            }
        }
    }

    protected dblClickHandler(e: MouseEvent): void {
        const target: Element = parentsUntil(e.target as Element, literals.rowCell);
        const tr: Element = parentsUntil(e.target as Element, literals.row);
        const rowIndex: number = tr && parseInt(tr.getAttribute(literals.ariaRowIndex), 10) - 1;
        const colIndex: number = target && parseInt(target.getAttribute(literals.ariaColIndex), 10) - 1;
        if (!isNullOrUndefined(target) && !isNullOrUndefined(rowIndex) && !isNaN(colIndex)
            && !target.parentElement.classList.contains(literals.editedRow) &&
            (this.parent.getColumns()[parseInt(colIndex.toString(), 10)] as Column).allowEditing) {
            this.editCell(
                rowIndex, (this.parent.getColumns()[parseInt(colIndex.toString(), 10)] as Column).field);
        }
    }

    /**
     * Enter edit mode for specified cell.
     *
     * @param {number} rowIndex - Row index to edit
     * @param {string} field - Column field to edit
     * @returns {void}
     */
    public editCell(rowIndex: number, field: string): void {
        super.editCell(rowIndex, field);
    }

    public editCellExtend(rowIndex: number, field: string): void {
        const gObj: IGrid = this.parent;
        const column: Column = gObj.getColumnByField(field);
        const keys: string[] = gObj.getPrimaryKeyFieldNames();
        if (gObj.isEdit) {
            return;
        }

        const rowData: Object = extend({}, {}, this.getDataByIndex(rowIndex), true);
        const row: Element = gObj.getRowByIndex(rowIndex);
        if (keys[0] === column.field || column.columns ||
            (column.isPrimaryKey && column.isIdentity) || column.commands) {
            this.parent.isLastCellPrimaryKey = true;
            return;
        }
        this.parent.isLastCellPrimaryKey = false;
        this.parent.element.classList.add('e-editing');
        const rowObj: Row<Column> = gObj.getRowObjectFromUID(row.getAttribute('data-uid'));
        const cells: Element[] = [].slice.apply((row as HTMLTableRowElement).cells);
        const args: CellEditArgs = {
            columnName: column.field, isForeignKey: !isNullOrUndefined(column.foreignKeyValue),
            primaryKey: keys, rowData: rowData,
            validationRules: extend({}, column.validationRules ? column.validationRules : {}),
            value: getObject(column.field, rowData), requestType: 'beginEdit',
            type: 'edit', cancel: false,
            foreignKeyData: rowObj && rowObj.foreignKeyData
        };
        args.cell = cells[this.getColIndex(cells, this.getCellIdx(column.uid))];
        args.row = row;
        args.columnObject = column;
        gObj.trigger(events.actionBegin, args, (cellEditArgs: CellEditArgs) => {
            if (cellEditArgs.cancel) { return; }
            cellEditArgs.cell = cellEditArgs.cell ? cellEditArgs.cell : cells[this.getColIndex(cells, this.getCellIdx(column.uid))];
            cellEditArgs.row = cellEditArgs.row ? cellEditArgs.row : row;
            cellEditArgs.columnObject = cellEditArgs.columnObject ? cellEditArgs.columnObject : column;
            this.cellDetails = {
                rowData: rowData, column: column, value: cellEditArgs.value, isForeignKey: cellEditArgs.isForeignKey, rowIndex: rowIndex,
                cellIndex: parseInt((cellEditArgs.cell as HTMLTableCellElement).getAttribute(literals.ariaColIndex), 10) - 1,
                foreignKeyData: cellEditArgs.foreignKeyData
            };
            gObj.isEdit = true;
            const checkSelect: boolean = !isNullOrUndefined(cellEditArgs.row.querySelector('.e-selectionbackground')) ? true : false;
            gObj.clearSelection();
            if ((!gObj.isCheckBoxSelection || !gObj.isPersistSelection) && (checkSelect || !gObj.selectionSettings.checkboxOnly)) {
                gObj.selectRow(this.cellDetails.rowIndex, true);
            }
            this.renderer.update(cellEditArgs);
            this.parent.notify(events.batchEditFormRendered, cellEditArgs);
            this.form = select('#' + gObj.element.id + 'EditForm', gObj.element);
            this.args = cellEditArgs;
            gObj.editModule.applyFormValidation([column]);
            (this.parent.element.querySelector('.e-gridpopup') as HTMLElement).style.display = 'none';
            this.parent.notify(events.toolbarRefresh, {});
            gObj.trigger(events.actionComplete, cellEditArgs);
        });
    }

    public updateCell(rowIndex: number, field: string, value: string | number | boolean | Date): void {
        const rowElement: Element | null = this.parent.getRowByIndex(rowIndex);
        const args: SaveEventArgs = {
            requestType: 'save', action: 'edit', type: events.actionBegin, cancel: false,
            rowData: this.parent.getCurrentViewRecords()[parseInt(rowIndex.toString(), 10)], row: rowElement
        };
        this.parent.trigger(events.actionBegin, args, (updateCellArgs: SaveEventArgs) => {
            if (updateCellArgs.cancel) {
                return;
            }
            super.updateCell(rowIndex, field, value);
            const rowObj: Row<Column> = this.parent.getRowObjectFromUID(rowElement.getAttribute('data-uid'));
            if (rowObj && 'changes' in rowObj) {
                delete rowObj.changes;
            }
            setValue(field, value, args.rowData);
            this.parent.notify(events.updateData, args);
            args.type = events.actionComplete;
            this.parent.trigger(events.actionComplete, args);
        });
    }

    /**
     * Save current cell edit.
     *
     * @returns {void}
     */
    public saveCell(): void {
        const gObj: IGrid = this.parent;
        if (this.parent.isEdit && this.validateFormObj()) {
            return;
        }
        const cellSaveArgs: CellSaveArgs = super.generateCellArgs();
        const rowIndex: number = this.cellDetails.rowIndex;
        const columnName: string = cellSaveArgs.columnName;
        const saveArgs: SaveEventArgs = extend({}, {
            requestType: 'save',
            type: events.actionBegin,
            data: cellSaveArgs.rowData,
            cancel: false,
            previousData: cellSaveArgs.rowData,
            selectedRow: gObj.selectedRowIndex,
            action: 'edit',
            cell: cellSaveArgs.cell,
            columnName: columnName,
            foreignKeyData: {},
            rowIndex: rowIndex,
            index: rowIndex
        });
        gObj.trigger(events.actionBegin, saveArgs, (updateArgs: SaveEventArgs) => {
            if (updateArgs.cancel) {
                return;
            }
            setValue(columnName, cellSaveArgs.value, cellSaveArgs.rowData);
            gObj.isEdit = false;
            gObj.element.classList.remove('e-editing');
            const rowElement: Element | null = cellSaveArgs.cell.parentElement;
            const column: Column = this.cellDetails.column;
            if (rowElement) {
                const cellElement: Element = cellSaveArgs.cell;
                if (!isNullOrUndefined(cellElement)) {
                    cellElement.innerHTML = '';
                    const displayValue: string = String(cellSaveArgs.value || '');
                    cellElement.textContent = displayValue;
                    removeClass([rowElement], [literals.editedRow]);
                    removeClass([cellElement], ['e-editedcell', 'e-boolcell']);
                }
            }
            gObj.notify(events.updateData, updateArgs);
            gObj.editModule.destroyWidgets([column]);
            gObj.editModule.destroyForm();
            const rowObj: Row<Column> = gObj.getRowObjectFromUID(rowElement.getAttribute('data-uid'));
            this.refreshTD(cellSaveArgs.cell, column, rowObj, cellSaveArgs.value);
            const isReactChild: boolean = this.parent.parentDetails && this.parent.parentDetails.parentInstObj &&
                this.parent.parentDetails.parentInstObj.isReact;
            if (((this.parent.isReact && this.parent.requireTemplateRef) || (isReactChild &&
                this.parent.parentDetails.parentInstObj.requireTemplateRef)) && column.template) {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const thisRef: CellEdit = this;
                const newReactTd: Element = this.newReactTd;
                thisRef.parent.renderTemplates(function(): void {
                    thisRef.parent.trigger(events.queryCellInfo, {
                        cell: newReactTd || cellSaveArgs.cell, column: column, data: cellSaveArgs.rowData
                    });
                });
            } else if ((this.parent.isReact || isReactChild) && column.template) {
                this.parent.renderTemplates();
                this.parent.trigger(events.queryCellInfo, {
                    cell: this.newReactTd || cellSaveArgs.cell, column: column, data: cellSaveArgs.rowData
                });
            }
            if (!this.parent.groupSettings.enableLazyLoading && this.parent.aggregates.length &&
                (this.parent.enableInfiniteScrolling || this.parent.enableVirtualization ||
                (this.parent.allowPaging && this.parent.groupSettings.disablePageWiseAggregates))) {
                this.parent.notify(events.modelChanged, {requestType: 'refresh-aggregate-on-save', action: 'update'});
            } else if (this.parent.aggregates.length) {
                this.parent.aggregateModule.refresh(cellSaveArgs.rowData,
                                                    this.parent.groupSettings.enableLazyLoading ? rowElement : undefined);
            }
            saveArgs.type = events.actionComplete;
            gObj.trigger(events.actionComplete, saveArgs);
        });

        this.preventSaveCell = false;
        if (this.editNext) {
            this.editNext = false;
            if (this.cellDetails.rowIndex === this.index && this.cellDetails.column.field === this.field && this.prevEditedBatchCell) {
                return;
            }
            const column: Column = gObj.getColumnByField(this.field);
            if (column && column.allowEditing) {
                this.editCellExtend(this.index, this.field);
            }
        }
    }

    public endEdit(): void {
        if (this.parent.isEdit && this.validateFormObj()) {
            return;
        }
        if ([].slice.call(this.parent.element.getElementsByClassName(literals.addedRow)).length) {
            this.cellEditModule.endEdit();
        } else {
            this.saveCell();
        }
    }

    public closeEdit(): void {
        if ([].slice.call(this.parent.element.getElementsByClassName(literals.addedRow)).length) {
            this.cellEditModule.closeEdit();
        } else {
            this.closeCellEdit();
        }
    }

    /**
     * Close edit mode and cleanup.
     *
     * @returns {void}
     * @hidden
     */
    public closeCellEdit(): void {
        const gObj: IGrid = this.parent;
        const args: { data: Object, requestType: string, cancel: boolean, selectedRow: number, type: string } = extend(this.args, {
            requestType: 'cancel', type: events.actionBegin, cancel: false, data: this.cellDetails.rowData, selectedRow: gObj.selectedRowIndex
        }) as { data: Object, requestType: string, cancel: boolean, selectedRow: number, type: string };
        gObj.notify(events.virtualScrollEditCancel, args);
        gObj.trigger(events.actionBegin, args,
                     (closeEditArgs: { cancel: boolean, data: Object, requestType: string, selectedRow: number, type: string }) => {
                         if (closeEditArgs.cancel) {
                             return;
                         }
                         closeEditArgs.type = events.actionComplete;
                         const rowObj: Row<Column> = this.parent.getRowObjectFromUID(this.args.row.getAttribute('data-uid'));
                         this.removeBatchElementChanges(rowObj, true);
                         this.refreshRowIdx();
                         gObj.isEdit = false;
                         gObj.trigger(events.actionComplete, closeEditArgs);
                     });
    }

    /**
     * In Cell edit mode, add creates a new row and immediately enters edit mode on first cell.
     *
     * @param {Object} [data] - optional default data for new record
     * @param {number} [index] - optional index for new record
     * @returns {void}
     */
    public addRecord(data?: Object, index?: number): void {
        this.cellEditModule.addRecord(data, index);
    }

    /**
     * In Cell edit mode, delete removes the row immediately from grid.
     *
     * @param {string} [fieldname] - optional field name for specific record
     * @param {Object} [data] - optional data object to delete
     * @returns {void}
     */
    public deleteRecord(fieldname?: string, data?: Object): void {
        this.cellEditModule.deleteRecord(fieldname, data);
    }

    /**
     * Handle delete complete event - cleanup after row deletion.
     *
     * @param {NotifyArgs} e - NotifyArgs event
     * @returns {void}
     */
    public editComplete(e: NotifyArgs): void {
        this.cellEditModule.editComplete(e);
    }

    /**
     * Destroy cell edit module.
     *
     * @returns {void}
     * @hidden
     */
    public destroy(): void {
        this.removeEventListener();
    }
}
