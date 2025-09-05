import { IDataSet, IFieldOptions } from '../../base/engine';
import { PivotView } from '../../pivotview/base/pivotview';
import * as events from '../../common/base/constant';
import * as cls from '../../common/base/css-constant';
import { PivotButtonArgs } from '../base/interface';
import { createElement, isNullOrUndefined, prepend } from '@syncfusion/ej2-base';
import { PivotUtil } from '../../base/util';
import { PivotButton } from '../actions/pivot-button';
import { DataManager } from '@syncfusion/ej2-data';

/**
 * Module to render Axis Fields
 */
/** @hidden */
export class AxisFields {
    /** @hidden */
    public parent: PivotView;
    private tempElements: Element[] = [];

    /** Constructor for render module
     *
     * @param {PivotView} parent - Instance.
     */
    constructor(parent: PivotView) {
        this.parent = parent;
    }
    /**
     * Initialize the grouping bar pivot button rendering
     *
     * @returns {void}
     * @private
     */
    public render(): void {
        if ((!this.parent.pivotButtonModule || (this.parent.pivotButtonModule && this.parent.pivotButtonModule.isDestroyed))) {
            new PivotButton(this.parent);
        }
        this.parent.pivotButtonModule.cleanupButtonElements();
        this.createPivotButtons();
        let pivotButtons: HTMLElement[] = [];
        pivotButtons = pivotButtons.concat([].slice.call(this.parent.groupingBarModule.rowPanel.querySelectorAll('.' + cls.PIVOT_BUTTON_WRAPPER_CLASS)));
        const vlen: number = pivotButtons.length;
        for (let j: number = 0; j < vlen; j++) {
            const indentWidth: number = 24;
            if (!this.parent.isTabular || (this.parent.isTabular && this.parent.engineModule.rowMaxLevel === 0)) {
                const indentDiv: Element = createElement('span', {
                    className: 'e-indent-div',
                    styles: 'width:' + j * indentWidth + 'px'
                });
                this.tempElements.push(indentDiv);
                prepend([indentDiv], pivotButtons[j as number]);
            }
        }
    }
    private createPivotButtons(): void {
        const fields: IFieldOptions[][] =
            [this.parent.dataSourceSettings.rows, this.parent.dataSourceSettings.columns,
                this.parent.dataSourceSettings.values, this.parent.dataSourceSettings.filters];
        const elements: Element[] = Array.prototype.slice.call(this.parent.element.querySelectorAll('.' + cls.GROUP_ALL_FIELDS_CLASS +
            ',.' + cls.GROUP_ROW_CLASS + ',.' + cls.GROUP_COLUMN_CLASS + ',.' + cls.GROUP_VALUE_CLASS + ',.' + cls.GROUP_FILTER_CLASS));
        if (isNullOrUndefined(this.parent.element.querySelector('.' + cls.GROUP_PIVOT_ROW))) {
            elements.push(this.parent.groupingBarModule.rowPanel);
        }
        for (let i: number = 0; i < elements.length; i++) {
            const element: Element = elements[i as number];
            if ((this.parent.dataSourceSettings.values.length > 0 ? !element.classList.contains(cls.GROUP_CHART_VALUE) : true) ||
                (this.parent.dataSourceSettings.columns.length > 0 ? !element.classList.contains(cls.GROUP_CHART_COLUMN) : true)) {
                element.innerHTML = '';
            }
        }
        if ((this.parent.dataType === 'pivot' && this.parent.dataSourceSettings.dataSource && (
            (!(this.parent.dataSourceSettings.dataSource instanceof DataManager) &&
                ((this.parent.dataSourceSettings.dataSource as IDataSet[]).length > 0)) ||
            (this.parent.dataSourceSettings.dataSource instanceof DataManager && this.parent.engineModule.data &&
                this.parent.engineModule.data.length > 0))) || (this.parent.dataType === 'olap' &&
                    this.parent.dataSourceSettings.url && this.parent.dataSourceSettings.url !== '') ||
            (this.parent.dataSourceSettings.mode === 'Server' && this.parent.dataSourceSettings.url &&
                this.parent.dataSourceSettings.url !== '')) {
            const axis: string[] = ['rows', 'columns', 'values', 'filters'];
            if (this.parent.dataType === 'pivot' && this.parent.groupingBarSettings.showFieldsPanel) {
                axis.push('all-fields');
                fields.push([]);
                for (const key of (this.parent.engineModule && this.parent.engineModule.fieldList ?
                    Object.keys(this.parent.engineModule.fieldList) : [])) {
                    if (this.parent.engineModule.fieldList[key as string] &&
                        !this.parent.engineModule.fieldList[key as string].isSelected) {
                        fields[fields.length - 1].push(PivotUtil.getFieldInfo(key, this.parent, true).fieldItem);
                    }
                }
            }
            for (let i: number = 0, lnt: number = fields.length; i < lnt; i++) {
                if (fields[i as number]) {
                    const args: PivotButtonArgs = {
                        field: fields[i as number],
                        axis: axis[i as number].toString()
                    };
                    this.parent.notify(events.pivotButtonUpdate, args);
                }
            }
        }
    }

    /**
     * Destroy method to clean up resources
     *
     * @returns {void}
     * @hidden
     */
    public destroy(): void {
        for (let i: number = 0; i < this.tempElements.length; i++) {
            const element: Element = this.tempElements[i as number];
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }
        this.tempElements = [];
    }
}
