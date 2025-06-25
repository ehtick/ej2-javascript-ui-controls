import { createElement, EventHandler, removeClass, addClass, Droppable } from '@syncfusion/ej2-base';
import { PivotFieldList } from '../base/field-list';
import * as cls from '../../common/base/css-constant';

/**
 * Module to render Axis Field Table
 */
/** @hidden */
export class AxisTableRenderer {
    /** @hidden */
    public parent: PivotFieldList;
    /** @hidden */
    public axisTable: Element;

    private leftAxisPanel: HTMLElement;
    private rightAxisPanel: HTMLElement;
    private droppableInstances: Droppable[] = [];

    /** Constructor for render module */

    constructor(parent: PivotFieldList) {
        this.parent = parent;
    }

    /**
     * Initialize the axis table rendering
     *
     * @returns {void}
     * @private
     */
    public render(): void {
        if (!this.parent.isAdaptive) {
            const axisTable: Element = createElement('div', {
                className: cls.AXIS_TABLE_CLASS + ' ' + (this.parent.dataType === 'olap' ? cls.OLAP_AXIS_TABLE_CLASS : '')
            });
            this.leftAxisPanel = createElement('div', { className: cls.LEFT_AXIS_PANEL_CLASS });
            this.rightAxisPanel = createElement('div', { className: cls.RIGHT_AXIS_PANEL_CLASS });
            this.parent.dialogRenderer.parentElement.appendChild(axisTable);
            axisTable.appendChild(this.leftAxisPanel);
            axisTable.appendChild(this.rightAxisPanel);
            this.axisTable = axisTable;
            this.renderAxisTable();
        }
        this.parent.axisFieldModule.render();
    }
    private renderAxisTable(): void {
        const fieldLabels: string[] = ['filters', 'rows', 'columns', 'values'];
        for (let len: number = 0, lnt: number = fieldLabels.length; len < lnt; len++) {
            const axis: HTMLElement = createElement('div', {
                className: cls.FIELD_LIST_CLASS + '-' + fieldLabels[len as number]
            });
            const axisTitleWrapper: HTMLElement = createElement('div', {
                className: cls.AXIS_ICON_CLASS + '-container'
            });
            const axisTitle: HTMLElement = createElement('div', {
                className: cls.AXIS_HEADER_CLASS,
                attrs: { title: this.parent.localeObj.getConstant(fieldLabels[len as number]) }
            });
            axisTitle.innerText = this.parent.localeObj.getConstant(fieldLabels[len as number]);
            axisTitleWrapper.appendChild(this.getIconupdate(fieldLabels[len as number]));
            axisTitleWrapper.appendChild(axisTitle);
            const axisContent: HTMLElement = createElement('div', { className: cls.AXIS_CONTENT_CLASS + ' ' + 'e-' + fieldLabels[len as number] });
            let localePrompt: string;
            if (fieldLabels[len as number] === 'rows') {
                localePrompt = this.parent.localeObj.getConstant('dropRowPrompt');
            } else if (fieldLabels[len as number] === 'columns') {
                localePrompt = this.parent.localeObj.getConstant('dropColPrompt');
            } else if (fieldLabels[len as number] === 'values') {
                localePrompt = this.parent.localeObj.getConstant('dropValPrompt');
            } else {
                localePrompt = this.parent.localeObj.getConstant('dropFilterPrompt');
            }
            const axisPrompt: HTMLElement = createElement('span', {
                className: cls.AXIS_PROMPT_CLASS
            });
            axisPrompt.innerText = localePrompt;
            const droppable: Droppable = new Droppable(axisContent, {});
            this.droppableInstances.push(droppable);
            axis.appendChild(axisTitleWrapper);
            axis.appendChild(axisContent);
            axis.appendChild(axisPrompt);
            if (len <= 1) {
                this.leftAxisPanel.appendChild(axis);
            } else {
                this.rightAxisPanel.appendChild(axis);
            }
            this.unWireEvent(axisContent);
            this.wireEvent(axisContent);
        }
    }
    private getIconupdate(axis: string): HTMLElement {
        const axisWrapper: HTMLElement = createElement('span', {
            attrs: { 'tabindex': '-1', 'aria-disabled': 'false' },
            className: cls.AXIS_ICON_CLASS + '-icon-container'
        });
        const axisElement: HTMLElement = createElement('span', {
            attrs: {
                'tabindex': '-1', 'aria-disabled': 'false'
            },
            className: cls.ICON + ' ' + cls.AXIS_ICON_CLASS + '-' + axis
        });
        axisWrapper.appendChild(axisElement);
        return axisWrapper;
    }
    private wireEvent(element: Element): void {
        EventHandler.add(element, 'mouseover', this.updateDropIndicator, this);
        EventHandler.add(element, 'mouseleave', this.updateDropIndicator, this);
    }
    private unWireEvent(element: Element): void {
        EventHandler.remove(element, 'mouseover', this.updateDropIndicator);
        EventHandler.remove(element, 'mouseleave', this.updateDropIndicator);
    }
    private updateDropIndicator(e: MouseEvent): void {
        const parentElement: HTMLElement = this.parent.dialogRenderer.parentElement;
        if (this.parent.isDragging && (e.target as HTMLElement).classList.contains(cls.AXIS_CONTENT_CLASS) && e.type === 'mouseover') {
            removeClass([].slice.call(parentElement.querySelectorAll('.' + cls.DROP_INDICATOR_CLASS)), cls.INDICATOR_HOVER_CLASS);
            removeClass([].slice.call(parentElement.querySelectorAll('.' + cls.DROP_INDICATOR_CLASS + '-last')), cls.INDICATOR_HOVER_CLASS);
            const element: HTMLElement[] =
                [].slice.call((e.target as HTMLElement).querySelectorAll('.' + cls.PIVOT_BUTTON_WRAPPER_CLASS));
            if (element.length > 0) {
                addClass([element[element.length - 1].querySelector('.' + cls.DROP_INDICATOR_CLASS + '-last')], cls.INDICATOR_HOVER_CLASS);
            }
        } else if (!this.parent.isDragging || (!(e.target as HTMLElement).classList.contains(cls.DROPPABLE_CLASS) && e.type === 'mouseleave')) {
            removeClass([].slice.call(parentElement.querySelectorAll('.' + cls.DROP_INDICATOR_CLASS)), cls.INDICATOR_HOVER_CLASS);
            removeClass([].slice.call(parentElement.querySelectorAll('.' + cls.DROP_INDICATOR_CLASS + '-last')), cls.INDICATOR_HOVER_CLASS);
        }
    }

    /**
     * Destroys the AxisTableRenderer instance
     *
     * @returns {void}
     * @hidden
     */
    public destroy(): void {
        if (this.axisTable) {
            const axisContentElements: NodeListOf<Element> = this.axisTable.querySelectorAll('.' + cls.AXIS_CONTENT_CLASS);
            for (let i: number = 0; i < axisContentElements.length; i++) {
                this.unWireEvent(axisContentElements[i as number]);
            }
        }
        for (let i: number = 0; i < this.droppableInstances.length; i++) {
            if (this.droppableInstances[i as number] && !this.droppableInstances[i as number].isDestroyed) {
                this.droppableInstances[i as number].destroy();
            }
        }
        this.droppableInstances = [];
        if (this.axisTable && this.axisTable.parentNode) {
            this.axisTable.parentNode.removeChild(this.axisTable);
        }
        this.axisTable = null;
        this.leftAxisPanel = null;
        this.rightAxisPanel = null;
    }
}
