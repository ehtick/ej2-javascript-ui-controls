import * as events from '../base/constant';
import { IRichTextEditor, IRenderer } from '../base/interface';
import { NotifyArgs, IToolbarItemModel } from '../../common/interface';
import { ServiceLocator } from '../services/service-locator';
import { isNullOrUndefined, addClass, removeClass } from '@syncfusion/ej2-base';
import { MarkdownFormatter } from '../formatter/markdown-formatter';
import { RendererFactory } from '../services/renderer-factory';
import { RenderType } from '../base/enum';
import * as classes from '../base/classes';
import { MarkdownToolbarStatus } from './markdown-toolbar-status';
import { MarkdownRender } from '../renderer/markdown-renderer';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { MarkdownSelection } from './../../markdown-parser/plugin/markdown-selection';
import { RichTextEditorModel } from '../base/rich-text-editor-model';

/**
 * `MarkdownEditor` module is used to markdown editor
 */
export class MarkdownEditor {
    private parent: IRichTextEditor;
    private locator: ServiceLocator;
    private contentRenderer: IRenderer;
    private renderFactory: RendererFactory;
    private toolbarUpdate: MarkdownToolbarStatus;
    private saveSelection: MarkdownSelection;
    private mdSelection: MarkdownSelection;
    private isDestroyed: boolean;

    public constructor(parent?: IRichTextEditor, serviceLocator?: ServiceLocator) {
        this.parent = parent;
        this.locator = serviceLocator;
        this.renderFactory = this.locator.getService<RendererFactory>('rendererFactory');
        this.addEventListener();
        this.isDestroyed = false;
    }
    /**
     * Destroys the Markdown.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public destroy(): void {
        if (this.isDestroyed) { return; }
        this.removeEventListener();
        this.isDestroyed = true;
    }

    private addEventListener(): void {
        if (this.parent.isDestroyed) {
            return;
        }
        this.saveSelection = new MarkdownSelection();
        this.parent.on(events.initialLoad, this.instantiateRenderer, this);
        this.parent.on(events.initialEnd, this.render, this);
        this.parent.on(events.modelChanged, this.onPropertyChanged, this);
        this.parent.on(events.markdownToolbarClick, this.onToolbarClick, this);
        this.parent.on(events.destroy, this.destroy, this);
        this.parent.on(events.selectAll, this.selectAll, this);
        this.parent.on(events.getSelectedHtml, this.getSelectedHtml, this);
        this.parent.on(events.selectionSave, this.onSelectionSave, this);
        this.parent.on(events.selectionRestore, this.onSelectionRestore, this);
        this.parent.on(events.readOnlyMode, this.updateReadOnly, this);
    }
    private updateReadOnly(): void {
        if (this.parent.readonly) {
            this.parent.contentModule.getEditPanel().setAttribute('readonly', 'readonly');
            addClass([this.parent.element], classes.CLS_RTE_READONLY);
        } else {
            this.parent.contentModule.getEditPanel().removeAttribute('readonly');
            removeClass([this.parent.element], classes.CLS_RTE_READONLY);
        }
    }

    private onSelectionSave(): void {
        const textArea: HTMLTextAreaElement = this.parent.contentModule.getEditPanel() as HTMLTextAreaElement;
        this.saveSelection.save(textArea.selectionStart, textArea.selectionEnd);
    }

    // eslint-disable-next-line
    private onSelectionRestore(e: NotifyArgs): void {
        (this.contentRenderer.getEditPanel() as HTMLElement).focus();
        const textArea: HTMLTextAreaElement = this.parent.contentModule.getEditPanel() as HTMLTextAreaElement;
        this.saveSelection.restore(textArea);
    }

    private onToolbarClick(args: ClickEventArgs): void {
        const item: IToolbarItemModel = args.item as IToolbarItemModel;
        const textArea: HTMLTextAreaElement = (this.parent.contentModule.getEditPanel() as HTMLTextAreaElement);
        if (item.command !== 'Formats') {
            textArea.focus();
        }
        const startOffset: number = textArea.selectionStart;
        const endOffset: number = textArea.selectionEnd;
        const text: string = textArea.value.substring(startOffset, endOffset);
        switch (item.subCommand) {
        case 'Maximize':
            this.parent.notify(events.enableFullScreen, { args: args });
            break;
        case 'Minimize':
            this.parent.notify(events.disableFullScreen, { args: args });
            break;
        case 'CreateLink':
            this.parent.notify(events.insertLink, { member: 'link', args: args, text: text, module: 'Markdown' });
            break;
        case 'Image':
            this.parent.notify(events.insertImage, { member: 'image', args: args, text: text, module: 'Markdown' });
            break;
        case 'CreateTable': {
            const tableConstant: {} = {
                'headingText': this.parent.localeObj.getConstant('TableHeadingText'),
                'colText': this.parent.localeObj.getConstant('TableColText')
            };
            this.parent.formatter.process(this.parent, args, args.originalEvent, tableConstant);
            break; }
        default:
            this.parent.formatter.process(this.parent, args, args.originalEvent, null);
            break;
        }
    }
    private instantiateRenderer(): void {
        this.renderFactory.addRenderer(RenderType.Content, new MarkdownRender(this.parent));
    }
    private removeEventListener(): void {
        this.parent.off(events.initialEnd, this.render);
        this.parent.off(events.modelChanged, this.onPropertyChanged);
        this.parent.off(events.destroy, this.destroy);
        this.parent.off(events.markdownToolbarClick, this.onToolbarClick);
        this.parent.off(events.initialLoad, this.instantiateRenderer);
        this.parent.off(events.selectAll, this.selectAll);
        this.parent.off(events.getSelectedHtml, this.getSelectedHtml);
        this.parent.off(events.selectionSave, this.onSelectionSave);
        this.parent.off(events.selectionRestore, this.onSelectionRestore);
        this.parent.off(events.readOnlyMode, this.updateReadOnly);
    }

    private render(): void {
        this.contentRenderer = this.renderFactory.getRenderer(RenderType.Content);
        const editElement: HTMLTextAreaElement = this.contentRenderer.getEditPanel() as HTMLTextAreaElement;
        const option: { [key: string]: number } = { undoRedoSteps: this.parent.undoRedoSteps, undoRedoTimer: this.parent.undoRedoTimer };
        if (isNullOrUndefined(this.parent.formatter)) {
            this.parent.formatter = new MarkdownFormatter({
                element: editElement,
                options: option
            });
        } else {
            this.parent.formatter.updateFormatter(editElement, this.contentRenderer.getDocument(), option);
        }
        if (this.parent.toolbarSettings.enable) {
            this.toolbarUpdate = new MarkdownToolbarStatus(this.parent);
        }
        this.parent.notify(events.bindOnEnd, {});
    }

    /**
     * Called internally if any of the property value changed.
     *
     * @param {RichTextEditorModel} e - specifies the editor model
     * @returns {void}
     * @hidden
     * @deprecated
     */
    protected onPropertyChanged(e: { [key: string]: RichTextEditorModel }): void {
        // On property code change here
        if (!isNullOrUndefined(e.newProp.formatter)) {
            const editElement: HTMLTextAreaElement = this.contentRenderer.getEditPanel() as HTMLTextAreaElement;
            const option: { [key: string]: number } = { undoRedoSteps: this.parent.undoRedoSteps,
                undoRedoTimer: this.parent.undoRedoTimer };
            this.parent.formatter.updateFormatter(editElement, this.contentRenderer.getDocument(), option);
        }
    }

    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     */
    private getModuleName(): string {
        return 'markdownEditor';
    }

    /**
     * For selecting all content in RTE
     *
     * @returns {void}
     * @private
     */
    private selectAll(): void {
        this.parent.formatter.editorManager.markdownSelection.setSelection(
            this.parent.contentModule.getEditPanel() as HTMLTextAreaElement,
            0,
            (this.parent.contentModule.getEditPanel() as HTMLTextAreaElement).value.length);
    }
    /**
     * For get a selected text in RTE
     *
     * @param {NotifyArgs} e - specifies the arguments.
     * @returns {void}
     * @private
     */
    private getSelectedHtml(e: NotifyArgs): void {
        e.callBack(
            this.parent.formatter.editorManager.markdownSelection.getSelectedText(
                this.parent.contentModule.getEditPanel() as HTMLTextAreaElement
            )
        );
    }
}
