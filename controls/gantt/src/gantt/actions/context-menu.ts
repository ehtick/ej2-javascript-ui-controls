import * as cons from './../base/css-constants';
import {
    ContextMenuOpenEventArgs as CMenuOpenEventArgs, ContextMenuClickEventArgs as CMenuClickEventArgs, ActionBeginArgs
} from './../base/interface';
import { TreeGrid, ContextMenu as TreeGridContextMenu } from '@syncfusion/ej2-treegrid';
import { remove, closest, isNullOrUndefined, getValue, extend, addClass } from '@syncfusion/ej2-base';
import { Gantt } from './../base/gantt';
import { Deferred } from '@syncfusion/ej2-data';
import { ContextMenu as Menu, OpenCloseMenuEventArgs } from '@syncfusion/ej2-navigations';
import { NotifyArgs, ContextMenuItemModel } from '@syncfusion/ej2-grids';
import { ITaskData, IGanttData, IPredecessor, RowPosition, ITaskSegment, TaskType } from '../base/common';
import { TaskFieldsModel } from '../models/models';
// eslint-disable-next-line
/**
 * The ContextMenu module is used to handle the context menu items & sub-menu items.
 *
 * @returns {void} .
 */
export class ContextMenu {
    /**
     * @private
     */
    public contextMenu: Menu;
    private parent: Gantt;
    private ganttID: string;
    private element: HTMLUListElement;
    private headerMenuItems: any; // eslint-disable-line
    private contentMenuItems: ContextMenuItemModel[];
    private rowData: IGanttData;
    public segmentIndex: number = -1;
    private clickedPosition: number;
    private targetElement: Element;
    private isEdit: boolean;
    private isCntxtMenuDependencyDelete: boolean = false;
    /**
     * @private
     */
    public isOpen: boolean;
    /**
     * @private
     */
    public item: string;
    private predecessors: IPredecessor[];
    private hideItems: string[];
    private disableItems: string[];
    constructor(parent?: Gantt) {
        this.parent = parent;
        this.ganttID = parent.element.id;
        TreeGrid.Inject(TreeGridContextMenu);
        this.parent.treeGrid.contextMenuClick = this.headerContextMenuClick.bind(this);
        this.parent.treeGrid.contextMenuOpen = this.headerContextMenuOpen.bind(this);
        this.addEventListener();
        this.resetItems();
    }

    private addEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.parent.on('initiate-contextMenu', this.render, this);
        this.parent.on('reRender-contextMenu', this.reRenderContextMenu, this);
        this.parent.on('contextMenuClick', this.contextMenuItemClick, this);
        this.parent.on('contextMenuOpen', this.contextMenuBeforeOpen, this);
    }

    private reRenderContextMenu(e: NotifyArgs): void {
        if (e.module === this.getModuleName() && e.enable) {
            if (this.contextMenu) {
                this.contextMenu.destroy();
                remove(this.element);
            }
            this.resetItems();
            this.render();
        }
    }

    private render(): void {
        this.element = this.parent.createElement('ul', {
            id: this.ganttID + '_contextmenu', className: cons.focusCell
        }) as HTMLUListElement;
        this.parent.element.appendChild(this.element);
        const target: string = '#' + this.ganttID;

        this.contextMenu = new Menu({
            items: this.getMenuItems(),
            locale: this.parent.locale,
            enableRtl: this.parent.enableRtl,
            target: target,
            animationSettings: { effect: 'None' },
            select: this.contextMenuItemClick.bind(this),
            beforeOpen: this.contextMenuBeforeOpen.bind(this),
            onOpen: this.contextMenuOpen.bind(this),
            onClose: this.contextMenuOnClose.bind(this),
            cssClass: 'e-gantt'
        });
        this.contextMenu.appendTo(this.element);
        this.parent.treeGrid.contextMenuItems = this.headerMenuItems;
    }


    private contextMenuItemClick(args: CMenuClickEventArgs): void {
        this.item = this.getKeyFromId(args.item.id);
        let position: RowPosition;
        let data: Object; let taskfields: TaskFieldsModel;
        const parentItem: ContextMenuItemModel = getValue('parentObj', args.item);
        let index: number = -1;
        args.type = 'Content';
        args.rowData = this.rowData;
        this.parent.trigger('contextMenuClick', args);
        if (parentItem && !isNullOrUndefined(parentItem.id) && this.getKeyFromId(parentItem.id) === 'DeleteDependency') {
            index = parentItem.items.indexOf(args.item);
        }
        if (this.parent.isAdaptive) {
            if (this.item === 'TaskInformation' || this.item === 'Above' || this.item === 'Below'
                || this.item === 'Child' || this.item === 'DeleteTask') {
                if (this.parent.selectionModule && this.parent.selectionSettings.type === 'Multiple') {
                    this.parent.selectionModule.hidePopUp();
                    (<HTMLElement>document.getElementsByClassName('e-gridpopup')[0]).style.display = 'none';
                }
            }
        }
        switch (this.item) {
        case 'TaskInformation':
            if (!isNullOrUndefined(this.rowData)) {
                if (typeof this.rowData.ganttProperties.taskId === 'string') {
                    this.parent.openEditDialog(this.rowData.ganttProperties.rowUniqueID);
                } else {
                    this.parent.openEditDialog(Number(this.rowData.ganttProperties.rowUniqueID));
                }
            }
            break;
        case 'Above':
        case 'Below':
        case 'Child':
            if (!isNullOrUndefined(this.rowData)) {
                position = this.item;
                data = extend({}, {}, this.rowData.taskData, true);
                taskfields = this.parent.taskFields;
                if (data[taskfields.startDate]) {
                    this.parent.setRecordValue(taskfields.startDate, this.rowData.ganttProperties.startDate, data, true);
                }
                if (data[taskfields.endDate]) {
                    this.parent.setRecordValue(taskfields.endDate, this.rowData.ganttProperties.endDate, data, true);
                }
                if (!isNullOrUndefined(taskfields.dependency)) {
                    data[taskfields.dependency] = null;
                }
                if (!isNullOrUndefined(taskfields.child) && data[taskfields.child]) {
                    delete data[taskfields.child];
                }
                if (!isNullOrUndefined(taskfields.parentID) && data[taskfields.parentID]) {
                    data[taskfields.parentID] = null;
                }
                if (this.rowData) {
                    if (this.parent.viewType === 'ResourceView' && this.rowData.parentItem
                        && data[this.parent.taskFields.resourceInfo as string]) {
                        const parentItem: IGanttData = this.parent.getParentTask(this.rowData.parentItem);
                        const resourceFieldId: string = this.parent.resourceFields.id;
                        const taskResources: object[] = this.rowData.taskData[this.parent.taskFields.resourceInfo as string];
                        const matchingResource: object = taskResources.find((resource: object) =>
                            resource[resourceFieldId as string] === parentItem.ganttProperties.taskId
                        );
                        data[this.parent.taskFields.resourceInfo as string] = matchingResource ? [matchingResource] : [];
                    }
                    const rowIndex: number = this.parent.updatedRecords.indexOf(this.rowData);
                    this.parent.addRecord(data, position, rowIndex);
                }
            }
            else if (this.parent.flatData.length === 0) {
                this.parent.addRecord();
            }
            break;
        case 'Milestone':
        case 'ToMilestone':
            if (!isNullOrUndefined(this.rowData)) {
                this.parent.convertToMilestone(this.rowData.ganttProperties.rowUniqueID);
            }
            else if (this.parent.flatData.length === 0 && this.item === 'Milestone') {
                const data: IGanttData = this.parent.editModule.createNewRecord();
                const taskSettings: TaskFieldsModel = this.parent.taskFields;
                if (this.parent.taskFields['duration']) {
                    data[taskSettings['duration']] = 0;
                }
                if (this.parent.taskFields['milestone']) {
                    data[taskSettings['milestone']] = true;
                }
                this.parent.addRecord(data);
            }
            break;
        case 'DeleteTask':
            if ((this.parent.selectionSettings.mode !== 'Cell' && this.parent.selectionModule.selectedRowIndexes.length > 1)
                    || (this.parent.selectionSettings.mode === 'Cell' && this.parent.selectionModule.getSelectedRowCellIndexes().length)) {
                this.parent.editModule.startDeleteAction();
            }
            else{
                this.parent.editModule.deleteRecord(this.rowData);
            }
            break;
        case 'ToTask':
            if (!isNullOrUndefined(this.rowData)) {
                data = extend({}, {}, this.rowData.taskData, true);
                taskfields = this.parent.taskFields;
                if (!isNullOrUndefined(taskfields.duration)) {
                    const duration: number = parseInt(data[taskfields.duration], 10) <= 0 ? 1 : data[taskfields.duration];
                    data[taskfields.duration] = duration;
                    this.parent.setRecordValue('duration', duration, this.rowData.ganttProperties, true);
                } else {
                    data[taskfields.startDate] = new Date(this.rowData.taskData[taskfields.startDate]);
                    const endDate: Date = new Date(this.rowData.taskData[taskfields.startDate]);
                    endDate.setDate(endDate.getDate() + 1);
                    data[taskfields.endDate] = endDate;
                }
                if (!isNullOrUndefined(data[taskfields.milestone])) {
                    if (data[taskfields.milestone] === true) {
                        data[taskfields.milestone] = false;
                    }
                }
                const taskType: TaskType = !isNullOrUndefined(this.rowData.ganttProperties.taskType) ? this.rowData.ganttProperties.taskType
                    : this.parent.taskType;
                if (taskType === 'FixedWork' || taskType === 'FixedUnit') {
                    this.parent.dataOperation.updateWorkWithDuration(this.rowData);
                    if (!isNullOrUndefined(data[taskfields.work])) {
                        data[taskfields.work] = this.rowData.ganttProperties.work;
                    }
                }
                if (data[taskfields.startDate]) {
                    this.parent.setRecordValue(taskfields.startDate, this.rowData.ganttProperties.startDate, data, true);
                }
                this.parent.updateRecordByID(data);
            }
            break;
        case 'Cancel':
            this.parent.cancelEdit();
            break;
        case 'Save':
            this.parent.editModule.cellEditModule.isCellEdit = false;
            this.parent.treeGrid.grid.saveCell();
            break;
        case 'Dependency' + index:
            this.isCntxtMenuDependencyDelete = true;
            this.parent.connectorLineEditModule.removePredecessorByIndex(this.rowData, index);
            break;
        case 'Auto':
        case 'Manual':
            this.parent.changeTaskMode(this.rowData);
            break;
        case 'Indent':
            this.parent.indent();
            break;
        case 'Outdent':
            this.parent.outdent();
            break;
        case 'Left':
        case 'Right':
            this.mergeCall(this.item);
            break;
        case 'SplitTask':
            this.splitTaskCall(args);
            break;
        }
    }

    private splitTaskCall(args: CMenuClickEventArgs): void {
        this.isEdit = true;
        const taskSettings: TaskFieldsModel = this.parent.taskFields;
        const currentClickedDate: Date = this.getClickedDate(args.element as HTMLElement);
        if (isNullOrUndefined(this.parent.timelineSettings.bottomTier) && this.parent.timelineSettings.bottomTier.unit !== 'Hour') {
            currentClickedDate.setHours(0, 0, 0, 0);
        }
        const eventArgs: ActionBeginArgs = {
            rowData: this.rowData as IGanttData,
            requestType: 'splitTaskbar',
            splitDate: currentClickedDate,
            cancel: false,
            target: this.targetElement
        };
        // eslint-disable-next-line
        this.parent.trigger('actionBegin', eventArgs, (eventArgs: ActionBeginArgs) => {
            if (!eventArgs.cancel) {
                this.parent['showLoadingIndicator']();
                this.parent.chartRowsModule.splitTask(this.rowData[taskSettings.id], currentClickedDate);
                this.parent.chartRowsModule.updateSegment(this.rowData.ganttProperties.segments, this.rowData.ganttProperties.taskId);
            }
        });
    }
    private mergeCall(item: string): void {
        this.isEdit = true;
        const taskSettings: TaskFieldsModel = this.parent.taskFields;
        const segments: ITaskSegment[] = this.rowData.ganttProperties.segments;
        const firstSegment: number = item === 'Right' ? this.segmentIndex : segments[this.segmentIndex - 1].segmentIndex;
        const secondSegment: number = item === 'Left' ? this.segmentIndex : segments[this.segmentIndex + 1].segmentIndex;
        const segmentIndexes: { firstSegmentIndex: number, secondSegmentIndex: number }[] = [
            { 'firstSegmentIndex': firstSegment, 'secondSegmentIndex': secondSegment }
        ];
        const eventArgs: ActionBeginArgs = {
            rowData: this.rowData as IGanttData,
            mergeSegmentIndexes: segmentIndexes,
            requestType: 'mergeSegment',
            cancel: false,
            target: this.targetElement
        };
        this.parent.trigger('actionBegin', eventArgs, (eventArgs: ActionBeginArgs) => {
            if (eventArgs.cancel === false) {
                if (!isNullOrUndefined(this.parent.loadingIndicator) && this.parent.loadingIndicator.indicatorType === 'Shimmer') {
                    this.parent.showMaskRow();
                } else {
                    this.parent.showSpinner();
                }
                this.parent.chartRowsModule.mergeTask(this.rowData[taskSettings.id], segmentIndexes);
            }
        });
    }
    /**
     * Calculates the date based on the clicked position on the Gantt chart's context menu.
     *
     * @param {HTMLElement} element - The HTML element used for determining the click position within the Gantt chart.
     * @returns {Date} - Returns the calculated date based on the clicked position on the chart.
     *
     * The function determines the Gantt element's left position for both RTL and LTR layouts.
     * It calculates the left position of the task and the click's position difference, adjusts the split task duration,
     * and computes the final click date.
     */
    private getClickedDate(element: HTMLElement): Date {
        // context menu click position
        let ganttElementPositionLeft: number ;
        // task left position
        if (this.parent.enableRtl) {
            const box: ClientRect = this.parent.element.getBoundingClientRect();
            const scrollLeft: number = window.pageXOffset || document.documentElement.scrollLeft ||
            document.body.scrollLeft;
            const clientLeft: number = document.documentElement.clientLeft || document.body.clientLeft || 0;
            ganttElementPositionLeft = box.left + scrollLeft - clientLeft;
        }
        else {
            ganttElementPositionLeft = this.parent.getOffsetRect(this.parent.element).left;
        }
        let pageLeft: number;
        let currentTaskDifference: number;
        if (this.parent.enableRtl) {
            pageLeft = Math.abs(ganttElementPositionLeft + this.parent.ganttChartModule.chartElement.offsetWidth -
                 this.rowData.ganttProperties.left - this.parent.ganttChartModule.scrollElement.scrollLeft);
            currentTaskDifference = Math.abs(this.clickedPosition - pageLeft);
        }
        else {
            pageLeft = ganttElementPositionLeft + this.parent.ganttChartModule.chartElement.offsetLeft +
                this.rowData.ganttProperties.left - this.parent.ganttChartModule.scrollElement.scrollLeft;
            currentTaskDifference = this.clickedPosition - pageLeft;
        }
        let splitTaskDuration: number = Math.ceil(currentTaskDifference / this.parent.perDayWidth);
        if (!this.parent.timelineSettings.showWeekend) {
            const calculatedDate: Date = new Date(this.rowData.ganttProperties.startDate);
            const milliSecondsPerPixel: number = (24 * 60 * 60 * 1000) / this.parent.perDayWidth;
            const milliSecondsPerDay: number = (24 * 60 * 60 * 1000);
            if (!this.parent.timelineSettings.showWeekend) {
                const totalDays: number = Math.floor(currentTaskDifference * milliSecondsPerPixel / milliSecondsPerDay);
                const totalDaysPerWeek: number = 7;
                const workingDaysPerWeek: number = totalDaysPerWeek - this.parent.nonWorkingDayIndex.length;
                // Calculate the number of complete weeks between two dates
                const fullWeeks: number = Math.floor(totalDays / workingDaysPerWeek);
                const extraDays: number = totalDays % workingDaysPerWeek;
                // Adjust calculatedDate by adding the full weeks
                calculatedDate.setDate(calculatedDate.getDate() + fullWeeks * totalDaysPerWeek);
                // Add remaining days, skipping non-working days
                let daysAdded: number = 0;
                while (daysAdded < extraDays) {
                    calculatedDate.setDate(calculatedDate.getDate() + 1);
                    if (this.parent.nonWorkingDayIndex.indexOf(calculatedDate.getDay()) === -1) {
                        daysAdded++;
                    }
                }
                const endDate: Date = calculatedDate;
                const durationBetweendays: number = this.parent.timelineModule.calculateNonWorkingDaysBetweenDates(
                    new Date(this.rowData.ganttProperties.startDate), endDate);
                splitTaskDuration += durationBetweendays;
            }
        }
        const startDate: Date = this.rowData.ganttProperties.startDate;
        if (!isNullOrUndefined(this.parent.timelineSettings.bottomTier) && this.parent.timelineSettings.bottomTier.unit === 'Hour') {
            splitTaskDuration = Math.ceil(currentTaskDifference / this.parent.timelineSettings.timelineUnitSize);
            splitTaskDuration -= 1;
        }
        let contextMenuClickDate: Date;
        if (!isNullOrUndefined(this.parent.timelineSettings.bottomTier) && (this.parent.timelineSettings.bottomTier.unit === 'Minutes' || this.parent.timelineSettings.bottomTier.unit === 'Hour')) {
            splitTaskDuration = Math.ceil(currentTaskDifference / this.parent.timelineSettings.timelineUnitSize);
            splitTaskDuration -= 1;
            contextMenuClickDate = this.parent.dataOperation.getEndDate(
                startDate, splitTaskDuration, this.parent.timelineSettings.bottomTier.unit.toLocaleLowerCase()
                , this.rowData, false);
        }
        else {
            contextMenuClickDate =
                this.parent.dataOperation.getEndDate(startDate, splitTaskDuration, this.rowData.ganttProperties.duration > 1 ?
                    this.rowData.ganttProperties.durationUnit : (this.parent.timelineSettings.bottomTier.unit !== 'None') ?
                        this.parent.timelineSettings.bottomTier.unit.toLocaleLowerCase() :
                        this.parent.timelineSettings.topTier.unit.toLocaleLowerCase(), this.rowData, false);
        }
        return contextMenuClickDate;
    }
    private contextMenuBeforeOpen(args: CMenuOpenEventArgs): void | Deferred {
        const target: Element = args.event ? args.event.target as Element :
            !this.parent.focusModule ? this.parent.focusModule.getActiveElement() :
                this.parent.ganttChartModule.targetElement;
        // Closed edited cell before opening context menu
        if (!isNullOrUndefined(this.parent.editModule) && this.parent.editModule.cellEditModule &&
            this.parent.editModule.cellEditModule.isCellEdit && (target.parentElement.classList.contains('e-row') ||
            target.parentElement.classList.contains('e-treecolumn-container'))) {
            this.parent.treeGrid.endEdit();
        }
        if (!isNullOrUndefined(args.element) && args.element.id === this.parent.element.id + '_contextmenu') {
            this.clickedPosition = getValue('event', args).clientX;
        }
        const targetElement: Element = closest(target, '.e-gantt-child-taskbar');
        if (targetElement) {
            this.targetElement = args.target = targetElement;
        }
        args.gridRow = closest(target, '.e-row');
        args.chartRow = closest(target, '.e-chart-row');
        const menuElement: Element = closest(target, '.e-gantt');
        const editForm: Element = closest(target, cons.editForm);
        if (!editForm && this.parent.editModule && this.parent.editModule.cellEditModule
            && this.parent.editModule.cellEditModule.isCellEdit && this.parent.editModule.dialogModule.dialogObj
            && !this.parent.editModule.dialogModule.dialogObj.open) {
            this.parent.treeGrid.grid.saveCell();
            this.parent.editModule.cellEditModule.isCellEdit = false;
        }
        if (this.parent.readOnly) {
            this.contextMenu.enableItems(
                ['Add', 'Save', 'Convert', 'Delete Dependency', 'Delete Task', 'TaskMode', 'Indent', 'Outdent', 'SplitTask', 'MergeTask'],
                false
            );
        }
        if ((isNullOrUndefined(args.gridRow) && isNullOrUndefined(args.chartRow)) || this.contentMenuItems.length === 0) {
            if (!isNullOrUndefined(args.parentItem) && !isNullOrUndefined(menuElement) || ! isNullOrUndefined(closest(target, '.e-content')) ) {
                args.cancel = false;
            } else {
                args.cancel = true;
            }
        }
        if (!args.cancel) {
            let rowIndex: number = -1;
            if (args.gridRow) {
                // eslint-disable-next-line
                rowIndex = parseInt(args.gridRow.getAttribute('aria-rowindex'), 0) - 1;
            } else if (args.chartRow) {
                // eslint-disable-next-line
                rowIndex = parseInt(args.chartRow.getAttribute('aria-rowindex'), 0) - 1;
            }
            if (this.parent.selectionModule && this.parent.allowSelection && !args.parentItem && !isNullOrUndefined(args.chartRow)) {
                this.parent.selectionModule.selectRow(rowIndex);
            }
            if (!args.parentItem) {
                this.rowData = this.parent.ganttChartModule.getRecordByTarget((args['event'] as PointerEvent));
            }
            for (const item of args.items) {
                // let target: EventTarget = target;
                if (!item.separator) {
                    let isInvalidSegmentSplit: boolean = false;
                    let isSingleDayTask: boolean = false;
                    if (item.text === this.getLocale('splitTask') && this.rowData) {
                        const ganttProp: ITaskData = this.rowData.ganttProperties;
                        if (this.parent.editModule && this.parent.editModule.taskbarEditModule) {
                            const segmentIndex: number = this.parent.editModule.taskbarEditModule.segmentIndex;
                            isInvalidSegmentSplit = ganttProp && ganttProp.segments &&
                                ganttProp.segments.length > 1 && segmentIndex === -1;
                            if (ganttProp.segments && segmentIndex !== -1 && ganttProp.segments[segmentIndex as number]) {
                                const isMultiSegment: boolean = ganttProp.segments.length > 1;
                                const isWiderThanUnit: boolean = ganttProp.segments[segmentIndex as number].width >
                                    this.parent.timelineSettings.timelineUnitSize;
                                isSingleDayTask = !(isMultiSegment && isWiderThanUnit);
                            }
                        }
                    }
                    if (((target.classList.contains('e-gantt-unscheduled-taskbar')) && ((item.text === this.getLocale('splitTask')) ||
                        (item.text === this.getLocale('mergeTask')))) || (isInvalidSegmentSplit || isSingleDayTask)) {
                        this.hideItems.push(item.text);
                    }
                    else {
                        this.updateItemStatus(item, target, rowIndex);
                    }
                }
            }
            args.rowData = this.rowData;
            args.type = 'Content';
            args.disableItems = this.disableItems;
            args.hideItems = this.hideItems;
            args.hideChildItems = [];
            if (!isNullOrUndefined(args.rowData) && args.rowData.level === 0 && this.parent.viewType === 'ResourceView') {
                args.cancel = true;
                return;
            }
            const callBackPromise: Deferred = new Deferred();
            this.parent.trigger('contextMenuOpen', args, (arg: CMenuOpenEventArgs) => {
                callBackPromise.resolve(arg);
                this.hideItems = arg.hideItems;
                this.disableItems = arg.disableItems;
                if (!arg.parentItem && arg.hideItems.length === arg.items.length) {
                    this.revertItemStatus();
                    arg.cancel = true;
                }
                if (this.hideItems.length > 0) {
                    this.contextMenu.hideItems(this.hideItems);
                }
                if (this.disableItems.length > 0) {
                    this.contextMenu.enableItems(this.disableItems, false);
                }
                if (args.hideChildItems.length > 0) {
                    this.contextMenu.hideItems(args.hideChildItems);
                }
            });
            return callBackPromise;
        }
    }

    private updateItemStatus(item: ContextMenuItemModel, target: EventTarget, rowIndex: number): void {
        const key: string = this.getKeyFromId(item.id);
        const editForm: Element = closest(target as Element, cons.editForm);
        const subMenu: ContextMenuItemModel[] = [];
        const taskbarElement: Element = closest(target as Element, '.e-gantt-child-taskbar') ||
        closest(target as Element, 'e-taskbar-right-resizer') || closest(target as Element, 'e-taskbar-left-resizer');
        if (editForm) {
            if (!(key === 'Save' || key === 'Cancel')) {
                this.hideItems.push(item.text);
            }
        } else {
            switch (key) {
            case 'TaskInformation':
                if (!this.parent.editSettings.allowEditing || !this.parent.editModule) {
                    this.updateItemVisibility(item.text);
                }
                if (this.parent.flatData.length === 0) {
                    this.hideItems.push(item.text);
                }
                break;
            case 'Add':
                if (!this.parent.editSettings.allowAdding || !this.parent.editModule) {
                    this.updateItemVisibility(item.text);
                }
                break;
            case 'Save':
            case 'Cancel':
                this.hideItems.push(item.text);
                break;
            case 'Convert':
                if (!isNullOrUndefined(this.rowData) && this.rowData.hasChildRecords) {
                    this.hideItems.push(item.text);
                } else if (!this.parent.editSettings.allowEditing || !this.parent.editModule) {
                    this.updateItemVisibility(item.text);
                } else {
                    if ( !isNullOrUndefined(this.rowData) && !this.rowData.ganttProperties.isMilestone) {
                        subMenu.push(
                            this.createItemModel(cons.content, 'ToMilestone', this.getLocale('toMilestone')));
                    } else {
                        subMenu.push(
                            this.createItemModel(cons.content, 'ToTask', this.getLocale('toTask')));
                    }
                    item.items = subMenu;
                }
                if (this.parent.flatData.length === 0) {
                    this.hideItems.push(item.text);
                }
                break;
            case 'DeleteDependency':
            {
                const items: ContextMenuItemModel[] = this.getPredecessorsItems();
                if (!isNullOrUndefined(this.rowData) && this.rowData.hasChildRecords && !this.parent.allowParentDependency) {
                    this.hideItems.push(item.text);
                } else if (!this.parent.editSettings.allowDeleting || items.length === 0 || !this.parent.editModule) {
                    this.updateItemVisibility(item.text);
                } else if (items.length > 0) {
                    item.items = items;
                }
                break;
            }
            case 'DeleteTask':
                if (!this.parent.editSettings.allowDeleting || !this.parent.editModule) {
                    this.updateItemVisibility(item.text);
                }
                if (this.parent.flatData.length === 0) {
                    this.hideItems.push(item.text);
                }
                break;
            case 'TaskMode':
                if (this.parent.taskMode !== 'Custom') {
                    this.updateItemVisibility(item.text);
                } else {
                    if (this.rowData.ganttProperties.isAutoSchedule) {
                        subMenu.push(
                            this.createItemModel(cons.content, 'Manual', this.getLocale('manual')));
                    } else {
                        subMenu.push(
                            this.createItemModel(cons.content, 'Auto', this.getLocale('auto')));
                    }
                    item.items = subMenu;
                }
                break;
            case 'Indent':
            {
                if (!this.parent.allowSelection || !this.parent.editModule || !this.parent.editSettings) {
                    this.hideItems.push(item.text);
                } else {
                    const index: number = this.parent.selectedRowIndex;
                    const isSelected: boolean = this.parent.selectionModule ? this.parent.selectionModule.selectedRowIndexes.length === 1 ||
                        this.parent.selectionModule.getSelectedRowCellIndexes().length === 1 ? true : false : false;
                    const prevRecord: IGanttData = this.parent.updatedRecords[this.parent.selectionModule.getSelectedRowIndexes()[0] - 1];
                    if (!this.parent.editSettings.allowEditing || index === 0 || index === -1 || !isSelected ||
                        this.parent.viewType === 'ResourceView' ||
                        this.parent.updatedRecords[parseInt(index.toString(), 10)].level - prevRecord.level === 1) {
                        this.updateItemVisibility(item.text);
                    }
                }
                break;
            }
            case 'Outdent':
            {
                if (!this.parent.allowSelection || !this.parent.editModule || !this.parent.editSettings) {
                    this.hideItems.push(item.text);
                } else {
                    const ind: number = this.parent.selectionModule.getSelectedRowIndexes()[0];
                    const isSelect: boolean = this.parent.selectionModule ? this.parent.selectionModule.selectedRowIndexes.length === 1 ||
                        this.parent.selectionModule.getSelectedRowCellIndexes().length === 1 ? true : false : false;
                    if (!this.parent.editSettings.allowEditing || ind === -1 || ind === 0 || !isSelect ||
                        this.parent.viewType === 'ResourceView' || this.parent.updatedRecords[parseInt(ind.toString(), 10)].level === 0) {
                        this.updateItemVisibility(item.text);
                    }
                }
                break;
            }
            case 'SplitTask':
            {
                let isBottomTierMinute: boolean = false;
                let isBottomTierHour: boolean = false;
                const taskSettings: TaskFieldsModel = this.parent.taskFields;
                if (!isNullOrUndefined(this.parent.timelineSettings.bottomTier)) {
                    isBottomTierMinute = this.parent.timelineSettings.bottomTier.unit === 'Minutes';
                    isBottomTierHour = this.parent.timelineSettings.bottomTier.unit === 'Hour';
                }
                if (this.parent.readOnly || !taskbarElement || isNullOrUndefined(taskSettings.segments) ||
                    this.parent.updatedRecords[Number(rowIndex)].hasChildRecords ||
                    (this.parent.updatedRecords[Number(rowIndex)].ganttProperties.duration < 2
                     && !(isBottomTierMinute || isBottomTierHour))) {
                    this.updateItemVisibility(item.text);
                }
                break;
            }
            case 'MergeTask':
                if (this.parent.readOnly || !taskbarElement) {
                    this.updateItemVisibility(item.text);
                } else {
                    this.mergeItemVisiblity(target as HTMLElement, item);
                }
                break;
            }
        }
    }
    private mergeItemVisiblity(target: HTMLElement, item: ContextMenuItemModel): void {
        const subMenu: ContextMenuItemModel[] = [];
        const taskfields: TaskFieldsModel = this.parent.taskFields;
        const currentClickedDate: Date = this.getClickedDate(target as HTMLElement);
        this.segmentIndex = this.parent.chartRowsModule.getSegmentIndex(currentClickedDate, this.rowData);
        const segments: ITaskSegment[] = this.rowData.ganttProperties.segments;
        if (!isNullOrUndefined(segments) && segments.length > 0) {
            if (isNullOrUndefined(taskfields.segments) && this.segmentIndex === -1) {
                this.updateItemVisibility(item.text);
            } else {
                if (this.segmentIndex === 0) {
                    subMenu.push(this.createItemModel(cons.content, 'Right', this.getLocale('right')));
                } else if (this.segmentIndex === segments.length - 1) {
                    subMenu.push(this.createItemModel(cons.content, 'Left', this.getLocale('left')));
                } else {
                    subMenu.push(this.createItemModel(cons.content, 'Right', this.getLocale('right')));
                    subMenu.push(this.createItemModel(cons.content, 'Left', this.getLocale('left')));
                }
                item.items = subMenu;
            }
        } else {
            this.hideItems.push(item.text);
        }
    }
    private updateItemVisibility(text: string): void {
        const isDefaultItem: boolean = !isNullOrUndefined(this.parent.contextMenuItems) ? false : true;
        if (isDefaultItem) {
            this.hideItems.push(text);
        } else {
            this.disableItems.push(text);
        }
    }
    private contextMenuOpen(args: CMenuOpenEventArgs): void {
        this.isOpen = true;
        const firstMenuItem: Element = this.parent['args'] = args.element.querySelectorAll('li:not(.e-menu-hide):not(.e-disabled)')[0];
        if (!isNullOrUndefined(firstMenuItem)) {
            addClass([firstMenuItem], 'e-focused');
        }
    }

    private getMenuItems(): ContextMenuItemModel[] {
        const menuItems: ContextMenuItemModel[] = !isNullOrUndefined(this.parent.contextMenuItems) ?
            this.parent.contextMenuItems as ContextMenuItemModel[] : this.getDefaultItems() as ContextMenuItemModel[];
        for (const item of menuItems) {
            if (typeof item === 'string' && this.getDefaultItems().indexOf(item) !== -1) {
                this.buildDefaultItems(item);
            } else if (typeof item !== 'string') {
                if (this.getDefaultItems().indexOf(item.text) !== -1) {
                    this.buildDefaultItems(item.text, item.iconCss);
                } else if (item.target === cons.columnHeader) {
                    this.headerMenuItems.push(item);
                } else {
                    this.contentMenuItems.push(item);
                }
            }
        }
        return this.contentMenuItems;
    }
    private createItemModel(target: string, item: string, text: string, iconCss?: string): ContextMenuItemModel {
        const itemModel: ContextMenuItemModel = {
            text: text,
            id: this.generateID(item),
            target: target,
            iconCss: iconCss ? 'e-icons ' + iconCss : null
        };
        return itemModel;
    }

    private getLocale(text: string): string {
        const localeText: string = this.parent.localeObj.getConstant(text);
        return localeText;
    }

    private buildDefaultItems(item: string, iconCSS?: string): void {
        let contentMenuItem: ContextMenuItemModel;
        switch (item) {
        case 'AutoFitAll':
        case 'AutoFit':
        case 'SortAscending':
        case 'SortDescending':
            this.headerMenuItems.push(item);
            break;
        case 'TaskInformation':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('taskInformation'), this.getIconCSS(cons.editIcon, iconCSS));
            break;
        case 'Indent':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('indent'), this.getIconCSS(cons.indentIcon, iconCSS));
            break;
        case 'Outdent':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('outdent'), this.getIconCSS(cons.outdentIcon, iconCSS));
            break;
        case 'Save':
            contentMenuItem = this.createItemModel(
                cons.editIcon, item, this.getLocale('save'), this.getIconCSS(cons.saveIcon, iconCSS));
            break;
        case 'Cancel':
            contentMenuItem = this.createItemModel(
                cons.editIcon, item, this.getLocale('cancel'), this.getIconCSS(cons.cancelIcon, iconCSS));
            break;
        case 'Add':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('add'), this.getIconCSS(cons.addIcon, iconCSS));
            //Sub item menu
            contentMenuItem.items = [];
            contentMenuItem.items.push(
                this.createItemModel(cons.content, 'Above', this.getLocale('above'), this.getIconCSS(cons.addAboveIcon, iconCSS)));
            contentMenuItem.items.push(
                this.createItemModel(cons.content, 'Below', this.getLocale('below'), this.getIconCSS(cons.addBelowIcon, iconCSS)));
            if (this.parent.viewType !== 'ResourceView') {
                contentMenuItem.items.push(
                    this.createItemModel(cons.content, 'Child', this.getLocale('child')));
            }
            contentMenuItem.items.push(this.createItemModel(
                cons.content, 'Milestone',
                this.getLocale('milestone')));
            break;
        case 'DeleteTask':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('deleteTask'),
                this.getIconCSS(cons.deleteIcon, iconCSS));
            break;
        case 'DeleteDependency':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('deleteDependency'));
            contentMenuItem.items = [];
            contentMenuItem.items.push({});
            break;
        case 'Convert':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('convert'));
            contentMenuItem.items = [];
            contentMenuItem.items.push({});
            break;
        case 'TaskMode':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('changeScheduleMode'));
            contentMenuItem.items = [];
            contentMenuItem.items.push({});
            break;
        case 'SplitTask':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('splitTask'));
            break;
        case 'MergeTask':
            contentMenuItem = this.createItemModel(
                cons.content, item, this.getLocale('mergeTask'));
            contentMenuItem.items = [];
            contentMenuItem.items.push({});
        }
        if (contentMenuItem) {
            this.contentMenuItems.push(contentMenuItem);
        }
    }

    private getIconCSS(menuClass: string, iconString?: string): string {
        return isNullOrUndefined(iconString) ? menuClass : iconString;
    }

    private getPredecessorsItems(): ContextMenuItemModel[] {
        this.predecessors = this.parent.predecessorModule.getValidPredecessor(this.rowData);
        const items: ContextMenuItemModel[] = []; let itemModel: ContextMenuItemModel;
        let increment: number = 0;
        for (const predecessor of this.predecessors) {
            const ganttData: IGanttData = this.parent.connectorLineModule.getRecordByID(predecessor.from);
            const ganttProp: ITaskData = ganttData.ganttProperties;
            const text: string = ganttProp.rowUniqueID + ' - ' + ganttProp.taskName;
            const id: string = 'Dependency' + increment++;
            itemModel = this.createItemModel(cons.content, id, text);
            items.push(itemModel);
        }
        return items;
    }

    private headerContextMenuClick = (args: CMenuClickEventArgs): void => {
        const gridRow: Element = closest(args.event.target as Element, '.e-row');
        const chartRow: Element = closest(args.event.target as Element, '.e-chart-row');
        if (isNullOrUndefined(gridRow) && isNullOrUndefined(chartRow)) {
            args.type = 'Header';
            this.parent.trigger('contextMenuClick', args);
        }
    }
    private headerContextMenuOpen = (args: CMenuOpenEventArgs): void => {
        const gridRow: Element = closest(args.event.target as Element, '.e-row');
        const chartRow: Element = closest(args.event.target as Element, '.e-chart-row');
        if (isNullOrUndefined(gridRow) && isNullOrUndefined(chartRow)) {
            args.type = 'Header';
            this.parent.trigger('contextMenuOpen', args);
        } else {
            args.cancel = true;
        }
    }

    private getDefaultItems(): string[] {
        return ['AutoFitAll', 'AutoFit',
            'TaskInformation', 'DeleteTask', 'Save', 'Cancel',
            'SortAscending', 'SortDescending', 'Add',
            'DeleteDependency', 'Convert', 'TaskMode', 'Indent', 'Outdent', 'SplitTask', 'MergeTask'
        ];
    }
    /**
     * To get ContextMenu module name.
     *
     * @returns {string} .
     */
    public getModuleName(): string {
        return 'contextMenu';
    }

    private removeEventListener(): void {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('initiate-contextMenu', this.render);
        this.parent.off('reRender-contextMenu', this.reRenderContextMenu);
        this.parent.off('contextMenuClick', this.contextMenuItemClick);
        this.parent.off('contextMenuOpen', this.contextMenuOpen);
    }

    private contextMenuOnClose(args: OpenCloseMenuEventArgs): void {
        const parent: string = 'parentObj';
        if (args.items.length > 0 && args.items[0][`${parent}`] instanceof Menu) {
            this.revertItemStatus();
        }
    }

    private revertItemStatus(): void {
        this.contextMenu.showItems(this.hideItems);
        this.contextMenu.enableItems(this.disableItems);
        this.hideItems = [];
        this.disableItems = [];
        this.isOpen = false;
    }
    private resetItems(): void {
        this.hideItems = [];
        this.disableItems = [];
        this.headerMenuItems = [];
        this.contentMenuItems = [];
        this.item = null;
    }

    private generateID(item: string): string {
        return this.ganttID + '_contextMenu_' + item;
    }
    private getKeyFromId(id: string): string {
        const idPrefix: string = this.ganttID + '_contextMenu_';
        if (id.indexOf(idPrefix) > -1) {
            return id.replace(idPrefix, '');
        } else {
            return 'Custom';
        }
    }
    /**
     * To destroy the contextmenu module.
     *
     * @returns {void} .
     * @private
     */
    public destroy(): void {
        this.contextMenu.destroy();
        remove(this.element);
        this.removeEventListener();
        this.contextMenu = null;
        this.element = null;
    }
}
