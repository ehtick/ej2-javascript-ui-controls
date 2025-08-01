import { BlockAction } from '../../actions';
import { BlockEditor, BlockType } from '../../base/index';
import { BlockModel } from '../../models/index';
import { appendDocumentNodes, handleExistingContentElement } from './block-utils';


export class ListRenderer {
    private editor: BlockEditor;
    private parent: BlockAction;

    constructor(editor: BlockEditor, parent: BlockAction) {
        this.editor = editor;
        this.parent = parent;
    }

    /**
     * Renders a list item block
     *
     * This method creates and transforms list item elements based on the block type.
     * It handles both numbered and checklist types.
     *
     * @param {BlockModel} block - Specifies the block model containing data to render.
     * @param {HTMLElement} blockElement - The parent element that contains all block elements.
     * @param {HTMLElement} existingContentElement - An optional existing list element to transform.
     * @returns {HTMLElement} - Returns the created or updated list container element.
     * @hidden
     */
    public renderListItem(block: BlockModel, blockElement: HTMLElement, existingContentElement?: HTMLElement | Node): HTMLElement {
        const isNumberedList: boolean = block.type === BlockType.NumberedList;
        const isChecklist: boolean = block.type === BlockType.CheckList;
        const listType: string = isNumberedList ? 'ol' : 'ul';
        const listContainer: HTMLElement = this.editor.createElement(listType, {});
        const listItem: HTMLElement = this.editor.createElement('li', {
            attrs: {
                contenteditable: 'true',
                placeholder: this.editor.getPlaceholderValue(block.type, block.placeholder)
            }
        });

        listContainer.appendChild(listItem);

        if (existingContentElement) {
            handleExistingContentElement(block, blockElement, listItem, existingContentElement);
        } else {
            this.parent.contentRenderer.renderContent(block, listItem);
        }

        if (isChecklist) {
            const checkmark: HTMLElement = this.editor.createElement('span', {
                className: 'e-checkmark e-icons',
                attrs: { contenteditable: 'false' }
            });
            blockElement.prepend(checkmark);
            checkmark.addEventListener('click', (event: MouseEvent) => {
                event.stopPropagation();
                this.toggleCheckedState(block, !block.isChecked);
                /* eslint-disable @typescript-eslint/no-explicit-any */
                const prevOnChange: boolean = (this.editor as any).isProtectedOnChange;
                (this.editor as any).isProtectedOnChange = true;
                block.isChecked = !block.isChecked;
                (this.editor as any).isProtectedOnChange = prevOnChange;
                /* eslint-enable @typescript-eslint/no-explicit-any */
            });
        }
        return listContainer;
    }

    toggleCheckedState(block: BlockModel, isChecked: boolean): void {
        const blockElement: HTMLElement = this.editor.getBlockElementById(block.id);
        const listItem: HTMLElement = blockElement.querySelector('li');
        if (listItem && listItem.textContent.trim() !== '') {
            listItem.classList.toggle('e-checked', isChecked);
            const checkmark: HTMLElement = blockElement.querySelector('.e-checkmark');
            checkmark.classList.toggle('e-checkmark-checked', isChecked);
            if (listItem.classList.contains('e-checked')) {
                checkmark.classList.add('ripple-animate');
                setTimeout(() => {
                    checkmark.classList.remove('ripple-animate');
                }, 400);
            }
        }
    }
}
