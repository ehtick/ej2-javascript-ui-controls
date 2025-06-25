import { EventHandler, Browser, isNullOrUndefined, detach } from '@syncfusion/ej2-base';
import * as events from '../base/constant';
import * as classes from '../base/classes';
import { IRichTextEditor } from '../base/interface';
import { ResizeArgs } from '../../common/interface';

/**
 * `Resize` module is used to resize the editor
 */
export class Resize {
    protected parent: IRichTextEditor;
    protected resizer: HTMLElement;
    protected touchStartEvent: string;
    protected touchMoveEvent: string;
    protected touchEndEvent: string;
    private isDestroyed: boolean;
    private isResizing: boolean;
    private iframeElement: NodeListOf<HTMLIFrameElement>;
    private iframeMouseUpBoundFn: () => void;

    private constructor(parent?: IRichTextEditor) {
        this.parent = parent;
        this.addEventListener();
        this.isDestroyed = false;
        this.isResizing = false;
        this.iframeMouseUpBoundFn = this.iframeMouseUp.bind(this);
    }

    private addEventListener(): void {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on(events.initialEnd, this.renderResizable, this);
        this.parent.on(events.destroy, this.destroy, this);
    }

    private renderResizable(): void {
        const enableRtlClass : string = (this.parent.enableRtl) ? classes.CLS_RTE_RES_WEST : classes.CLS_RTE_RES_EAST;
        this.resizer = this.parent.createElement('div', {
            id: this.parent.getID() + '-resizable', className: 'e-icons'
                + ' ' + classes.CLS_RTE_RES_HANDLE + ' ' + enableRtlClass
        });
        this.parent.element.classList.add(classes.CLS_RTE_RES_CNT);
        this.parent.rootContainer.appendChild(this.resizer);
        this.parent.rootContainer.classList.add('e-resize-enabled');
        if (this.parent.iframeSettings.enable) {
            this.parent.inputElement.classList.add('e-resize-enabled');
            this.parent.contentModule.getDocument().addEventListener('mouseup', this.iframeMouseUpBoundFn);
        }
        this.iframeElement = this.parent.contentModule.getDocument().querySelectorAll('iframe');
        if (!isNullOrUndefined(this.iframeElement)) {
            this.iframeElement.forEach((iframe: HTMLIFrameElement) => {
                EventHandler.add(iframe, 'load', this.onIFrameLoad, this);
            });
        }
        this.touchStartEvent = (Browser.info.name === 'msie') ? 'pointerdown' : 'touchstart';
        EventHandler.add(this.resizer, 'mousedown', this.resizeStart, this);
        EventHandler.add(this.resizer, this.touchStartEvent, this.resizeStart, this);
    }

    private onIFrameLoad(e: Event): void {
        const iframe: HTMLIFrameElement = e.target as HTMLIFrameElement;
        if (iframe.nodeName === 'IFRAME' && iframe.contentDocument) {
            EventHandler.add(iframe.contentDocument, 'mouseup', this.stopResize, this);
        }
    }

    private removeMouseUpEventListener(iframe: HTMLIFrameElement): void {
        if (iframe.contentDocument) {
            EventHandler.remove(iframe.contentDocument, 'mouseup', this.stopResize);
        }
    }
    private resizeStart(e?: MouseEvent | TouchEvent | PointerEvent): void {
        this.isResizing = false;
        if (e.cancelable) {
            e.preventDefault();
        }
        this.wireResizeEvents();
        this.parent.notify(events.resizeInitialized, {});
        const args: ResizeArgs = { event: e, requestType: 'editor' };
        this.parent.trigger(events.resizeStart, args, (resizeStartArgs: ResizeArgs) => {
            if (resizeStartArgs.cancel) {
                this.unwireResizeEvents();
            }
        });
    }

    private performResize(e?: MouseEvent | TouchEvent | PointerEvent): void {
        this.isResizing = true;
        const args: ResizeArgs = { event: e, requestType: 'editor' };
        this.parent.trigger(events.onResize, args, (resizingArgs: ResizeArgs) => {
            if (resizingArgs.cancel) {
                this.unwireResizeEvents();
            }
        });
        const boundRect: ClientRect = this.parent.element.getBoundingClientRect();
        if (this.isMouseEvent(e)) {
            this.parent.element.style.height = (<MouseEvent>e).clientY - boundRect.top + 'px';
            this.parent.element.style.width = (!this.parent.enableRtl) ? (<MouseEvent>e).clientX - boundRect.left + 'px' :
                boundRect.right - (<MouseEvent>e).clientX + 'px';
            if (this.parent.toolbarModule) {
                const toolBarEle: HTMLElement = this.parent.toolbarModule.getToolbarElement() as HTMLElement;
                if (!isNullOrUndefined(toolBarEle) && !isNullOrUndefined(toolBarEle.parentElement)) {
                    if (toolBarEle.parentElement.classList.contains(classes.CLS_TB_FLOAT) && this.parent.toolbarSettings.enableFloating &&
                    this.parent.getToolbar() && !this.parent.inlineMode.enable) {
                        const sourceViewPanel: HTMLElement = this.parent.element.querySelector('#' + this.parent.getID() + '_source-view') as HTMLElement;
                        const defaultContentPanel: HTMLElement = this.parent.contentModule.getPanel() as HTMLElement;
                        let isCodeViewEnabled: boolean = false;
                        if (sourceViewPanel && this.parent.element.querySelector('.e-source-code-enabled')) {
                            isCodeViewEnabled =  true;
                        }
                        const targetPanelWidth: number = isCodeViewEnabled
                            ? sourceViewPanel.getBoundingClientRect().width
                            : defaultContentPanel.getBoundingClientRect().width;
                        toolBarEle.style.width = targetPanelWidth + 'px';
                    }
                }
            }
        } else {
            const eventType: MouseEvent | Touch = Browser.info.name !== 'msie' ? (<TouchEvent>e).touches[0] : (<MouseEvent>e);
            this.parent.element.style.height = eventType.clientY - boundRect.top + 'px';
            this.parent.element.style.width = (!this.parent.enableRtl) ? eventType.clientX - boundRect.left + 'px' : boundRect.right - eventType.clientX + 'px';
        }
        const rteContent: HTMLElement = this.parent.element.querySelector('#' + this.parent.getID() + '_source-view') as HTMLElement;
        if (!isNullOrUndefined(rteContent)) {
            rteContent.style.height = this.parent.element.style.height;
        }
        this.parent.refreshUI();
    }

    private stopResize(e?: MouseEvent | TouchEvent | PointerEvent): void {
        this.isResizing = false;
        this.parent.refreshUI();
        this.unwireResizeEvents();
        const args: ResizeArgs = { event: e, requestType: 'editor' };
        this.parent.trigger(events.resizeStop, args);
    }

    private getEventType(e: string): string {
        return (e.indexOf('mouse') > -1) ? 'mouse' : 'touch';
    }

    private isMouseEvent(e: MouseEvent | TouchEvent | PointerEvent): boolean {
        let isMouse: boolean = false;
        if (this.getEventType(e.type) === 'mouse' || (!isNullOrUndefined((<PointerEvent>e).pointerType) &&
            this.getEventType((<PointerEvent>e).pointerType) === 'mouse')) {
            isMouse = true;
        }
        return isMouse;
    }

    private wireResizeEvents(): void {
        EventHandler.add(document, 'mousemove', this.performResize, this);
        EventHandler.add(document, 'mouseup', this.stopResize, this);
        this.touchMoveEvent = (Browser.info.name === 'msie') ? 'pointermove' : 'touchmove';
        this.touchEndEvent = (Browser.info.name === 'msie') ? 'pointerup' : 'touchend';
        EventHandler.add(document, this.touchMoveEvent, this.performResize, this);
        EventHandler.add(document, this.touchEndEvent, this.stopResize, this);
    }

    private unwireResizeEvents(): void {
        EventHandler.remove(document, 'mousemove', this.performResize);
        EventHandler.remove(document, 'mouseup', this.stopResize);
        EventHandler.remove(document, this.touchMoveEvent, this.performResize);
        EventHandler.remove(document, this.touchEndEvent, this.stopResize);
    }

    private destroy(): void {
        if (this.isDestroyed) { return; }
        this.removeEventListener();
        if (this.resizer) {
            detach(this.resizer);
            this.resizer = null;
        }
        this.isDestroyed = true;
    }

    private removeEventListener(): void {
        this.parent.off(events.initialEnd, this.renderResizable);
        this.parent.element.classList.remove(classes.CLS_RTE_RES_CNT);
        if (this.parent && this.parent.rootContainer && this.parent.rootContainer.classList.contains('e-resize-enabled')) {
            this.parent.rootContainer.classList.remove('e-resize-enabled');
        }
        if (this.parent.iframeSettings.enable && !isNullOrUndefined(this.parent.inputElement)) {
            this.parent.inputElement.classList.remove('e-resize-enabled');
            this.parent.contentModule.getDocument().removeEventListener('mouseup', this.iframeMouseUpBoundFn);
        }
        if (!isNullOrUndefined(this.iframeElement)) {
            this.iframeElement.forEach((iframe: HTMLIFrameElement) => {
                this.removeMouseUpEventListener(iframe);
                EventHandler.remove(iframe, 'load', this.onIFrameLoad);
            });
        }
        if (this.resizer) {
            EventHandler.remove(this.resizer, 'mousedown', this.resizeStart);
            EventHandler.remove(this.resizer, this.touchStartEvent, this.resizeStart);
            detach(this.resizer);
        }
        this.parent.off(events.destroy, this.destroy);
        this.iframeMouseUpBoundFn = null;
    }

    private iframeMouseUp(e: MouseEvent): void {
        if (this.isResizing) {
            this.stopResize(e);
        }
        else {
            return;
        }
    }

    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     * @hidden
     */
    private getModuleName(): string {
        return 'resize';
    }
}
