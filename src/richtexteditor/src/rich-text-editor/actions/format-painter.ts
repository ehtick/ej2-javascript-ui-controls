import { addClass, isNullOrUndefined as isNOU, KeyboardEventArgs, removeClass } from '@syncfusion/ej2-base';
import {  IRichTextEditor } from '../base/interface';
import { ActionBeginEventArgs, IExecutionGroup, IFormatPainter, IFormatPainterArgs, IToolbarItemModel, NotifyArgs, ToolbarClickEventArgs } from '../../common/interface';
import * as events from '../base/constant';
import { ClickEventArgs } from '@syncfusion/ej2-buttons';
import { FormatPainterActions } from '../../editor-manager/plugin/format-painter-actions';

export class FormatPainter implements IFormatPainter {
    private parent: IRichTextEditor;
    private isSticky: boolean = false;
    private isActive: boolean = false;
    public previousAction: string;
    private isDestroyed: boolean;
    public constructor(parent?: IRichTextEditor) {
        this.parent = parent;
        this.addEventListener();
        this.isDestroyed = false;
    }

    private addEventListener(): void {
        this.parent.on(events.formatPainterClick, this.toolbarClick, this);
        this.parent.on(events.formatPainterDoubleClick, this.toolbarDoubleClick, this);
        this.parent.on(events.editAreaClick, this.editAreaClick, this);
        this.parent.on(events.keyDown, this.onKeyDown, this);
        this.parent.on(events.destroy, this.destroy, this);
        this.parent.on(events.bindOnEnd, this.bindOnEnd, this);
    }

    private bindOnEnd(): void {
        if (!this.parent.formatter.editorManager.formatPainterObj) {
            this.parent.formatter.editorManager.formatPainterObj =
            new FormatPainterActions(this.parent.formatter.editorManager, this.parent.formatPainterSettings);
        }
    }

    private toolbarClick(clickargs: NotifyArgs): void {
        this.parent.focusIn();
        if (!this.isSticky) {
            this.isActive = true;
            this.actionHandler(clickargs, 'click');
        } else {
            // Handling the format painter double click toolbar esape action
            (clickargs.args as KeyboardEventArgs).action = 'escape';
            this.actionHandler(clickargs, 'keyBoard');
        }
        if (this.parent.quickToolbarModule && !isNOU(this.parent.quickToolbarSettings.text) &&
            this.parent.quickToolbarModule.textQTBar &&
            this.parent.element.ownerDocument.contains(this.parent.quickToolbarModule.textQTBar.element)){
            this.parent.quickToolbarModule.textQTBar.hidePopup();
        }
    }

    private toolbarDoubleClick(args: NotifyArgs): void {
        this.isActive = true;
        this.isSticky = true;
        this.parent.focusIn();
        this.actionHandler(args, 'dbClick');
    }

    private onKeyDown(event: NotifyArgs): void {
        const originalEvent: KeyboardEventArgs = event.args as KeyboardEventArgs;
        if (!isNOU(originalEvent) && !isNOU(originalEvent.action) && (originalEvent.action === 'format-copy' ||  originalEvent.action === 'format-paste')
            || (originalEvent.action === 'escape' && (this.previousAction === 'format-copy' || this.previousAction === 'format-paste' ))) {
            if ((originalEvent.action === 'format-copy' ||  originalEvent.action === 'format-paste')) {
                originalEvent.stopPropagation();
            }
            if (this.parent.userAgentData.getBrowser() === 'Firefox' || this.parent.userAgentData.getBrowser() === 'Safari') {
                originalEvent.preventDefault();
            }
            this.actionHandler(event, 'keyBoard');
        }
    }

    private actionHandler(event: NotifyArgs, type: string): void {
        let action: string;
        let isKeyboard: boolean = false;
        let originalEvent: MouseEvent | KeyboardEvent | PointerEvent;
        let args: ToolbarClickEventArgs | NotifyArgs | IExecutionGroup;
        let item: IToolbarItemModel;
        switch (type){
        case 'dbClick':
            args = event.args as ToolbarClickEventArgs;
            item = (args as ToolbarClickEventArgs).item;
            originalEvent = (event.args as ToolbarClickEventArgs).originalEvent;
            action = 'format-copy';
            break;
        case 'keyBoard':
            args = null;
            originalEvent = event.args as KeyboardEventArgs;
            isKeyboard = true;
            action = (event.args as KeyboardEventArgs).action;
            if (action === 'escape') {
                this.isSticky = false;
                this.isActive = false;
            }
            break;
        case 'click':
            args = event.args as ToolbarClickEventArgs;
            item = (args as ToolbarClickEventArgs).item;
            originalEvent = (event.args as ToolbarClickEventArgs).originalEvent;
            action = 'format-copy';
            break;
        case 'docClick':
            originalEvent = event as unknown as PointerEvent;
            action = 'format-paste';
            break;
        }
        if (isNOU(item)) {
            item = {
                command: 'FormatPainter',
                subCommand: 'FormatPainter'
            } as IToolbarItemModel;
        }
        const actionBeginArgs: ActionBeginEventArgs = {
            requestType: 'FormatPainter', originalEvent: originalEvent, name: action, item: item
        };
        const value: IFormatPainterArgs = {
            formatPainterAction: action
        };
        this.parent.formatter.process(this.parent, actionBeginArgs, originalEvent, value);
        if (!actionBeginArgs.cancel) {
            this.updateCursor(isKeyboard);
            const enable: boolean = type === 'docClick' || action === 'escape' ? false : true;
            this.updateToolbarBtn(enable);
        }
        this.previousAction = action;
    }

    private updateCursor(isKeyboard: boolean): void {
        if (!this.parent.inputElement.classList.contains('e-rte-cursor-brush') && !isKeyboard){
            addClass([this.parent.inputElement], 'e-rte-cursor-brush');
        } else if (!this.isSticky) {
            removeClass([this.parent.inputElement], 'e-rte-cursor-brush');
        }
    }

    private updateToolbarBtn(enable: boolean): void  {
        if (!isNOU(this.parent.element.querySelector('.e-rte-format-painter'))){
            const toolbarBtn: HTMLElement = this.parent.element.querySelector('.e-rte-format-painter').parentElement.parentElement;
            if (enable) {
                addClass([toolbarBtn], 'e-active');
            } else if (!this.isSticky) {
                removeClass([toolbarBtn], 'e-active');
            }
        }
    }

    private editAreaClick(args: ClickEventArgs): void{
        if (this.isActive) {
            if (!this.isSticky) {
                this.isActive = false;
            }
            this.actionHandler(args, 'docClick');
            this.updateToolbarBtn(false);
        }
    }

    public destroy(): void {
        if (this.isDestroyed) { return; }
        this.parent.off(events.formatPainterClick, this.toolbarClick);
        this.parent.off(events.editAreaClick, this.editAreaClick);
        this.parent.off(events.formatPainterDoubleClick, this.toolbarDoubleClick);
        this.parent.off(events.keyDown, this.onKeyDown);
        this.parent.off(events.destroy, this.destroy);
        this.parent.off(events.bindOnEnd, this.bindOnEnd);
        this.parent = null;
        this.isSticky = null;
        this.isActive = null;
        this.previousAction = null;
        this.isDestroyed = true;
    }

    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     * @hidden
     */
    private getModuleName(): string {
        return 'formatPainter';
    }
}
