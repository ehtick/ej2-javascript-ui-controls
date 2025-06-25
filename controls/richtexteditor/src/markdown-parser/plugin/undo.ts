import { debounce, KeyboardEventArgs, isNullOrUndefined } from '@syncfusion/ej2-base';
import { MarkdownParser } from './../base/markdown-parser';
import { IMarkdownSubCommands, IMDKeyboardEvent, MarkdownUndoRedoData } from './../base/interface';
import { MarkdownSelection } from './markdown-selection';
import * as EVENTS from './../../common/constant';
import { IUndoCallBack } from '../../common/interface';
/**
 * `Undo` module is used to handle undo actions.
 */

export class UndoRedoCommands {

    public steps: number;
    public undoRedoStack: MarkdownUndoRedoData[] = [];
    private parent: MarkdownParser;
    private selection: MarkdownSelection;
    private currentAction: string;
    public undoRedoSteps: number;
    public undoRedoTimer: number;
    public constructor(parent?: MarkdownParser, options?: { [key: string]: number }) {
        this.parent = parent;
        this.undoRedoSteps = !isNullOrUndefined(options) ? options.undoRedoSteps : 30;
        this.undoRedoTimer = !isNullOrUndefined(options) ? options.undoRedoTimer : 300;
        this.selection = this.parent.markdownSelection;
        this.addEventListener();
    }
    protected addEventListener(): void {
        const debounceListener: Function = debounce(this.keyUp, this.undoRedoTimer);
        this.parent.observer.on(EVENTS.KEY_UP_HANDLER, debounceListener, this);
        this.parent.observer.on(EVENTS.KEY_DOWN_HANDLER, this.keyDown, this);
        this.parent.observer.on(EVENTS.ACTION, this.onAction, this);
        this.parent.observer.on(EVENTS.MODEL_CHANGED_PLUGIN, this.onPropertyChanged, this);
        this.parent.observer.on(EVENTS.INTERNAL_DESTROY, this.destroy, this);
    }
    private onPropertyChanged(props: { [key: string]: Object }): void {
        for (const prop of Object.keys(props.newProp)) {
            switch (prop) {
            case 'undoRedoSteps':
                this.undoRedoSteps = (props.newProp as { [key: string]: number }).undoRedoSteps;
                break;
            case 'undoRedoTimer':
                this.undoRedoTimer = (props.newProp as { [key: string]: number }).undoRedoTimer;
                break;
            }
        }
    }
    protected removeEventListener(): void {
        const debounceListener: Function = debounce(this.keyUp, 300);
        this.parent.observer.off(EVENTS.KEY_UP_HANDLER, debounceListener);
        this.parent.observer.off(EVENTS.KEY_DOWN_HANDLER, this.keyDown);
        this.parent.observer.off(EVENTS.ACTION, this.onAction);
        this.parent.observer.off(EVENTS.MODEL_CHANGED_PLUGIN, this.onPropertyChanged);
        this.parent.observer.off(EVENTS.INTERNAL_DESTROY, this.destroy);
    }
    /**
     * Destroys the ToolBar.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public destroy(): void {
        this.removeEventListener();
    }

    /**
     * onAction method
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public onAction(e: IMarkdownSubCommands): void {
        if (e.subCommand === 'Undo') {
            this.undo(e);
        } else {
            this.redo(e);
        }
    }
    private keyDown(e: IMDKeyboardEvent): void {
        const event: KeyboardEvent = e.event as KeyboardEvent;
        // eslint-disable-next-line
        const proxy: this = this;
        switch ((event as KeyboardEventArgs).action) {
        case 'undo':
            event.preventDefault();
            proxy.undo(e);
            break;
        case 'redo':
            event.preventDefault();
            proxy.redo(e);
            break;
        }
    }
    private keyUp(e: IMDKeyboardEvent): void {
        if ((e.event as KeyboardEvent).keyCode !== 17 && !(e.event as KeyboardEvent).ctrlKey) {
            this.saveData(e);
        }
    }
    /**
     * MD collection stored string format.
     *
     * @param {KeyboardEvent} e - specifies the key board event
     * @function saveData
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public saveData(e?: KeyboardEvent | MouseEvent | IUndoCallBack): void {
        const textArea: HTMLTextAreaElement = this.parent.element as HTMLTextAreaElement;
        this.selection.save(textArea.selectionStart, textArea.selectionEnd);
        const start: number = textArea.selectionStart;
        const end: number = textArea.selectionEnd;
        const textValue: string = (this.parent.element as HTMLTextAreaElement).value;
        const changEle: { [key: string]: string | Object } = { text: textValue, start: start, end: end};
        if (this.undoRedoStack.length >= this.steps) {
            this.undoRedoStack = this.undoRedoStack.slice(0, this.steps + 1);
        }
        if (this.undoRedoStack.length > 1 && (this.undoRedoStack[this.undoRedoStack.length - 1].start === start) &&
            (this.undoRedoStack[this.undoRedoStack.length - 1].end === end)) {
            return;
        }
        this.undoRedoStack.push(changEle);
        this.steps = this.undoRedoStack.length - 1;
        if (this.steps > this.undoRedoSteps) {
            this.undoRedoStack.shift();
            this.steps--;
        }
        if (e && (e as IUndoCallBack).callBack) {
            (e as IUndoCallBack).callBack();
        }
    }
    /**
     * Undo the editable text.
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @function undo
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public undo(e?: IMarkdownSubCommands | IMDKeyboardEvent): void {
        if (this.steps > 0) {
            this.currentAction = 'Undo';
            const start: number = this.undoRedoStack[this.steps - 1].start;
            const end: number = this.undoRedoStack[this.steps - 1].end;
            const removedContent: string = this.undoRedoStack[this.steps - 1].text as string;
            (this.parent.element as HTMLTextAreaElement).value = removedContent;
            (this.parent.element as HTMLTextAreaElement).focus();
            this.steps--;
            this.restore(this.parent.element as HTMLTextAreaElement, start, end, e);
        }
    }
    /**
     * Redo the editable text.
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @function redo
     * @returns {void}
     * @hidden
     * @deprecated
     */
    public redo(e?: IMarkdownSubCommands | IMDKeyboardEvent): void {
        if (this.undoRedoStack[this.steps + 1] != null) {
            this.currentAction = 'Redo';
            const start: number = this.undoRedoStack[this.steps + 1].start;
            const end: number = this.undoRedoStack[this.steps + 1].end;
            (this.parent.element as HTMLTextAreaElement).value = this.undoRedoStack[this.steps + 1].text as string;
            (this.parent.element as HTMLTextAreaElement).focus();
            this.steps++;
            this.restore(this.parent.element as HTMLTextAreaElement, start, end, e);
        }
    }
    private restore(textArea: HTMLTextAreaElement, start: number, end: number, event?: IMarkdownSubCommands | IMDKeyboardEvent): void {
        this.selection.save(start, end);
        this.selection.restore(textArea);
        if (event && event.callBack) {
            event.callBack({
                requestType: this.currentAction,
                selectedText: this.selection.getSelectedText(textArea),
                editorMode: 'Markdown',
                event: event.event
            });
        }
    }
    /**
     * getUndoStatus method
     *
     * @returns {boolean} - returns the boolean value
     * @hidden
     * @deprecated
     */
    public getUndoStatus(): { [key: string]: boolean } {
        const status: { [key: string]: boolean } = { undo: false, redo: false };
        if (this.steps > 0) {
            status.undo = true;
        }
        if (this.undoRedoStack[this.steps + 1] != null) {
            status.redo = true;
        }
        return status;
    }
    public getCurrentStackIndex(): number {
        return this.steps;
    }


    /**
     * Clears the undo and redo stacks and reset the steps to null..
     *
     * @returns {void}
     * @public
     */
    public clear(): void {
        this.undoRedoStack = [];
        this.steps = null;
    }
}
