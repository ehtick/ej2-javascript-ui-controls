
import { IRenderer, IGrid, NotifyArgs } from '../base/interface';
import { refreshVirtualBlock, colGroupRefresh, columnWidthChanged, columnVisibilityChanged, refreshFooterRenderer } from '../base/constant';
import { ServiceLocator } from '../services/service-locator';
import { FooterRenderer } from './footer-renderer';
import { VirtualElementHandler } from './virtual-content-renderer';
import { VirtualRowModelGenerator } from '../services/virtual-row-model-generator';
import { addRemoveEventListener } from '../base/util';

/**
 * Provides virtual footer rendering with column virtualization.
 *
 * @hidden
 */
export class VirtualFooterRenderer extends FooterRenderer implements IRenderer {
    /** @hidden */
    public virtualElement: VirtualElementHandler = new VirtualElementHandler();
    /** @hidden */
    public rowModelGenerator: VirtualRowModelGenerator;

    /**
     * Initializes the VirtualFooterRenderer with the parent grid and required services.
     *
     * @param {IGrid} parent - Parent grid module
     * @param {ServiceLocator} serviceLocator - Service locator for dependency injection
     */
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator) {
        super(parent, serviceLocator);
        this.rowModelGenerator = new VirtualRowModelGenerator(this.parent);
        this.parent.on(refreshVirtualBlock, (e?: NotifyArgs) => e.virtualInfo.sentinelInfo.axis === 'X' ? this.refresh() : null, this);
    }

    /**
     * Creates the virtual footer panel structure.
     *
     * @returns {void}
     * @hidden
     */
    public renderPanel(): void {
        super.renderPanel();
    }

    /**
     * Create virtual footer table.
     *
     * @returns {void}
     * @hidden
     */
    public renderTable(): void {
        this.rowModelGenerator.refreshColOffsets();
        const contentElement: HTMLElement = <HTMLElement>this.getPanel().querySelector('.e-summarycontent');
        if (contentElement) {
            this.parent.setColumnIndexesInView(this.rowModelGenerator.getColumnIndexes(contentElement));
            super.renderTable();
            const footerTable: HTMLElement = <HTMLElement>this.getTable();
            this.virtualElement.table = footerTable;
            this.virtualElement.content = contentElement;
            this.virtualElement.content.style.position = 'relative';
            this.virtualElement.renderWrapper();
            this.virtualElement.renderPlaceHolder('absolute');
        }
    }

    /**
     * Refreshes the virtual footer when aggregate or column data changes.
     *
     * @param {Object} [e] - Aggregate data object
     * @param {Object} [e.aggregates] - Aggregate values used to render summary rows
     * @returns {void}
     * @hidden
     */
    public refresh(e?: { aggregates?: Object }): void {
        this.rowModelGenerator.refreshColOffsets();
        const contentElement: HTMLElement = <HTMLElement>this.getPanel().querySelector('.e-summarycontent');
        if (contentElement) {
            this.parent.setColumnIndexesInView(this.rowModelGenerator.getColumnIndexes(contentElement));
            super.refresh(e);
        }
    }

    private updateColGroup(): void {
        if (this.getColGroup()) {
            const colGroup: Element = this.getHeaderColGroup();
            this.getTable().replaceChild(colGroup, this.getColGroup());
            this.setColGroup(colGroup);
        }
    }

    /**
     * Registers required event listeners for virtual footer rendering and updates
     *
     * @returns {void}
     */
    public addEventListener(): void {
        this.evtHandlers = [
            { event: columnWidthChanged, handler: super.onWidthChange },
            { event: columnVisibilityChanged, handler: super.columnVisibilityChanged },
            { event: refreshFooterRenderer, handler: super.refreshFooterRenderer },
            { event: colGroupRefresh, handler: this.updateColGroup }
        ];
        addRemoveEventListener(this.parent, this.evtHandlers, true, this);
    }

    /**
     * Removes all event listeners associated with the virtual footer renderer.
     *
     * @returns {void}
     */
    public removeEventListener(): void {
        addRemoveEventListener(this.parent, this.evtHandlers, false);
    }
}
