import { IGrid } from '../base/interface';
import { Column } from '../models/column';
import { ServiceLocator } from '../services/service-locator';
import { classList } from '@syncfusion/ej2-base';
import * as literals from '../base/string-literals';
import { InlineEditRender } from './inline-edit-renderer';

/**
 * Cell Edit Renderer
 *
 * @hidden
 */
export class CellEditRenderer {
    protected parent: IGrid;
    protected serviceLocator: ServiceLocator;
    private renderer: InlineEditRender;

    /**
     * Constructor for CellEditRenderer
     *
     * @param {IGrid} parent - returns the IGrid
     */
    constructor(parent?: IGrid) {
        this.parent = parent;
        this.renderer = new InlineEditRender(parent);
    }
    public update(elements: Element[], args: { columnObject?: Column, cell?: Element, row?: Element }): void {
        if (this.parent.isReact && args.columnObject && args.columnObject.template) {
            const parentRow: HTMLTableRowElement = args.cell.parentElement as HTMLTableRowElement;
            const newTd: HTMLTableCellElement = args.cell.cloneNode(true) as HTMLTableCellElement;
            parentRow.insertBefore(newTd, args.cell);
            newTd.focus();
            args.cell.remove();
            args.cell = newTd;
        }
        args.cell.setAttribute('aria-label', args.cell.innerHTML + this.parent.localeObj.getConstant('ColumnHeader') + args.columnObject.field);
        args.cell.innerHTML = '';
        args.cell.appendChild(this.getEditElement(elements, args));
        args.cell.classList.add('e-editedcell');
        classList(args.row, [literals.editedRow], []);
    }

    private getEditElement(elements: Object, args: { columnObject?: Column, cell?: Element, row?: Element }): Element {
        const gObj: IGrid = this.parent;
        const form: HTMLFormElement = this.parent
            .createElement('form', { id: gObj.element.id + 'EditForm', className: 'e-gridform' }) as HTMLFormElement;
        form.appendChild(elements[args.columnObject.uid]);
        if (args.columnObject.editType === 'booleanedit') {
            args.cell.classList.add('e-boolcell');
        }
        if (!args.columnObject.editType) {
            args.cell.classList.add('e-inputbox');
        }
        return form;
    }

    public addNew(elements: Object, args: { row?: Element, rowData?: Object, isScroll?: boolean }): void {
        this.renderer.addNew(elements, args);
    }
}
