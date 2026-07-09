import { IGrid, IAction } from '../base/interface';
import { initialLoad, destroy } from '../base/constant';
import { RenderType } from '../base/enum';
import { ServiceLocator } from '../services/service-locator';
import { RendererFactory } from '../services/renderer-factory';
import { DomVirtualContentRenderer } from '../renderer/dom-virtual-content-renderer';

/**
 * @hidden
 */
export class DomVirtualization implements IAction {
    private parent: IGrid;
    private locator: ServiceLocator;

    constructor(parent: IGrid, locator?: ServiceLocator) {
        this.parent = parent;
        this.locator = locator as ServiceLocator;
        this.addEventListener();
    }

    public getModuleName(): string {
        return 'domVirtualization';
    }

    private instantiateRenderer(): void {
        const renderer: RendererFactory = this.locator.getService<RendererFactory>('rendererFactory');
        renderer.addRenderer(RenderType.Content, new DomVirtualContentRenderer(this.parent, this.locator));
    }

    public addEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.parent.on(initialLoad, this.instantiateRenderer, this);
        this.parent.on(destroy, this.destroy, this);
    }

    public removeEventListener(): void {
        if (this.parent.isDestroyed) { return; }
        this.parent.off(initialLoad, this.instantiateRenderer);
        this.parent.off(destroy, this.destroy);
    }

    public destroy(): void {
        this.removeEventListener();
        if (this.parent.contentModule && (this.parent.contentModule as DomVirtualContentRenderer).destroy) {
            (this.parent.contentModule as DomVirtualContentRenderer).destroy();
        }
    }
}
