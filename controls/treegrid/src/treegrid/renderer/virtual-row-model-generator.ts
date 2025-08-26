import { VirtualInfo, VirtualRowModelGenerator } from '@syncfusion/ej2-grids';
import { NotifyArgs, Row, Column, IGrid, Grid, VirtualContentRenderer } from '@syncfusion/ej2-grids';
import { ITreeData } from '../base';
import * as events from '../base/constant';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { isCountRequired, isRemoteData } from '../utils';
/**
 * RowModelGenerator is used to generate grid data rows.
 *
 * @hidden
 */

export class TreeVirtualRowModelGenerator extends VirtualRowModelGenerator {
    private visualData: ITreeData[];
    constructor(parent: IGrid) {
        super(parent);
        this.addEventListener();
    }
    public addEventListener() : void {
        this.parent.on(events.dataListener, this.getDatas, this);
    }
    private getDatas(args: {data: ITreeData[]}): void {
        this.visualData = args.data;
    }
    private getDataInfo(): VirtualInfo{
        return super.getData();
    }
    public generateRows(data: Object[], notifyArgs?: NotifyArgs): Row<Column>[] {
        const info: VirtualInfo = this.getDataInfo();
        if (notifyArgs.requestType === 'refresh' && (notifyArgs as any).isExpandCollapse) {
            notifyArgs.virtualInfo = this['prevInfo'];
        }
        if (!isNullOrUndefined(notifyArgs.virtualInfo) && !(this.parent.root.loadChildOnDemand && isRemoteData(this.parent.root))) {
            if (notifyArgs.virtualInfo.direction !== 'right' && notifyArgs.virtualInfo.direction !== 'left') {
                if ((!isRemoteData(this.parent.root) || isCountRequired(this.parent))
                    || notifyArgs.virtualInfo.blockIndexes.length === 1) {
                    notifyArgs.virtualInfo.blockIndexes = info.blockIndexes;
                }
            } else {
                notifyArgs.virtualInfo.blockIndexes = this.getBlockIndexes(notifyArgs.virtualInfo.page);
            }
        }
        if ((this.parent.dataSource instanceof DataManager && (this.parent.dataSource as DataManager).dataSource.url !== undefined
        && !(this.parent.dataSource as DataManager).dataSource.offline && (this.parent.dataSource as DataManager).dataSource.url !== '') || isCountRequired(this.parent)) {
            return super.generateRows(data, notifyArgs);
        } else {
            if (!isNullOrUndefined(notifyArgs.requestType) && notifyArgs.requestType.toString() === 'collapseAll') {
                notifyArgs.requestType = 'refresh';
            }
            const rows: Row<Column>[] = super.generateRows(data, notifyArgs);
            if (!isNullOrUndefined(<ITreeData[]>(this.visualData))) {
                for (let r: number = 0; r < rows.length; r++) {
                    rows[parseInt(r.toString(), 10)].index
                    = (<ITreeData[]>(this.visualData)).indexOf(rows[parseInt(r.toString(), 10)].data);                }
            }
            return rows;
        }
    }
    public checkAndResetCache(action: string): boolean {
        const clear: boolean = ['paging', 'refresh', 'sorting', 'filtering', 'searching', 'reorder',
            'save', 'delete'].some((value: string) => action === value);
        if ((this.parent.dataSource instanceof DataManager && (this.parent.dataSource as DataManager).dataSource.url !== undefined
            && !(this.parent.dataSource as DataManager).dataSource.offline && (this.parent.dataSource as DataManager).dataSource.url !== '') || isCountRequired(this.parent)) {
            const model: string = 'model';
            const currentPage: number = this[`${model}`].currentPage;
            if (clear) {
                this.cache = {};
                /*this.movableCache = {};
                this.frozenRightCache = {};*/
                this.data = {};
                this.groups = {};
            } else if (action === 'virtualscroll' && this.cache[parseInt(currentPage.toString(), 10)] &&
                this.cache[parseInt(currentPage.toString(), 10)].length >
                (((this.parent as Grid).contentModule) as VirtualContentRenderer).getBlockSize()) {
                if (this.cache[parseInt(currentPage.toString(), 10)].length > (this.parent.contentModule).getBlockSize()) {
                    this.cache[parseInt(currentPage.toString(), 10)] =
                        this.cache[parseInt(currentPage.toString(), 10)].slice(0, (this.parent.contentModule).getBlockSize());
                }
            }
        } else {
            if (clear || action === 'virtualscroll') {
                this.cache = {}; this.data = {}; this.groups = {};
                /*this.movableCache = {};
                this.frozenRightCache = {};*/
            }
        }
        return clear;
    }
}
