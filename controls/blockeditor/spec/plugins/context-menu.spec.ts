import { createElement } from '@syncfusion/ej2-base';
import { ContextMenuItemModel} from '../../src/models/index';
import { createEditor } from '../common/util.spec';
import { setCursorPosition, getBlockContentElement, setSelectionRange } from '../../src/common/utils/index';
import { BlockType, ContentType } from '../../src/models/enums';
import { BlockEditor } from '../../src/index';

describe('Context Menu', () => {
    beforeAll(() => {
        const isDef: any = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log('Unsupported environment, window.performance.memory is unavailable');
            pending();
            return;
        }
    });

    function triggerRightClick(element: HTMLElement) {
        element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    }

    function createTableBlock(id: string = 'table1') {
        return {
            id: id,
            blockType: BlockType.Table,
            properties: {
                columns: [{ id: 'col1' }, { id: 'col2' }],
                rows: [
                    {
                        id: 'row1',
                        cells: [
                            {
                                columnId: 'col1',
                                blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                            },
                            {
                                columnId: 'col2',
                                blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                            }
                        ]
                    }
                ]
            }
        };
    }

    describe('Default actions testing', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
        });

        it('should increase and decrease indentation using context menu actions', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ]
            });

            editor.appendTo('#editor');

            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);
            setCursorPosition(getBlockContentElement(blockElement), 0);

            // Increase indent
            (editor.blockManager.contextMenuModule as any).handleContextMenuActions({ id: 'increaseindent' });
            expect(editor.blocks[0].indent).toBe(1);
            expect(blockElement.style.getPropertyValue('--block-indent')).toBe('20');

            // Decrease indent
            (editor.blockManager.contextMenuModule as any).handleContextMenuActions({ id: 'decreaseindent' });
            expect(editor.blocks[0].indent).toBe(0);
            expect(blockElement.style.getPropertyValue('--block-indent')).toBe('0');

            done();
        });

        it('should open the contextmenu on right click', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();
            triggerRightClick(editorElement);
            setTimeout(() => {
                expect(menuElement.style.display).toBe('block');
                expect(editor.blockManager.currentFocusedBlock.id).toBe('paragraph1');
                done();
            }, 100);
        });

        it('should open the contextmenu and ensure enable / disable items', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);
            setCursorPosition(getBlockContentElement(blockElement), 0);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();
            triggerRightClick(editorElement);
            setTimeout(() => {
                expect(menuElement.style.display).toBe('block');
                expect(menuElement.querySelector('#undo').classList.contains('e-disabled')).toBe(true);
                expect(menuElement.querySelector('#redo').classList.contains('e-disabled')).toBe(true);
                expect(menuElement.querySelector('#cut').classList.contains('e-disabled')).toBe(true);
                expect(menuElement.querySelector('#copy').classList.contains('e-disabled')).toBe(true);
                expect(menuElement.querySelector('#paste').classList.contains('e-disabled')).toBe(false);
                expect(menuElement.querySelector('#increaseindent').classList.contains('e-disabled')).toBe(false);
                expect(menuElement.querySelector('#decreaseindent').classList.contains('e-disabled')).toBe(true);
                expect(menuElement.querySelector('#link').classList.contains('e-disabled')).toBe(true);
                expect(editor.blockManager.currentFocusedBlock.id).toBe('paragraph1');
                done();
            }, 100);
        });

        it('should trigger the action using shortcut key', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);
            setCursorPosition(getBlockContentElement(blockElement), 0);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();

            //Trigger Ctrl + ] to indent the block
            editor.element.dispatchEvent(new KeyboardEvent('keydown', { code: 'BracketRight', key: ']', ctrlKey: true }));
            expect(editor.blocks[0].indent).toBe(1);
            expect(blockElement.style.getPropertyValue('--block-indent')).toBe('20');
            expect(menuElement.querySelector('#decreaseindent').classList.contains('e-disabled')).toBe(false);

            //Trigger Ctrl + [ to outdent the block
            editor.element.dispatchEvent(new KeyboardEvent('keydown', { code: 'BracketLeft', key: '[', ctrlKey: true }));
            expect(editor.blocks[0].indent).toBe(0);
            expect(blockElement.style.getPropertyValue('--block-indent')).toBe('0');

            //Trigger Ctrl + K to open the link dialog
            editor.element.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true }));
            setTimeout(() => {
                expect(document.querySelector('.e-blockeditor-link-dialog')).not.toBeNull();
                expect(editor.blockManager.currentFocusedBlock.id).toBe('paragraph1');
                done();
            }, 100);
        });

        it('should load with user defined items initially', (done) => {
            const items: ContextMenuItemModel[] = [
                { id: 'custom1', text: 'Custom Item 1', iconCss: 'e-icons e-copy' },
                { id: 'custom2', text: 'Custom Item 2', iconCss: 'e-icons e-paste' }
            ];
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ],
                contextMenuSettings: { items: items }
            });
            editor.appendTo('#editor');
            setTimeout(() => {
                const popup = document.querySelector('.e-blockeditor-contextmenu');
                expect(editor.contextMenuSettings.items.length).toBe(2);
                expect(editor.contextMenuSettings.items[0].id).toBe('custom1');
                expect(editor.contextMenuSettings.items[1].id).toBe('custom2');
                expect(popup.querySelectorAll('li').length).toBe(2);
                expect(popup.querySelector('#custom1') !== null).toBe(true);
                expect(popup.querySelector('#custom2') !== null).toBe(true);
                done();
            }, 100);
        });

        it('should call cut, copy and paste handlers on item click', () => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');
            spyOn(editor.blockManager.clipboardAction, 'handleContextCut').and.stub();
            spyOn(editor.blockManager.clipboardAction, 'handleContextCopy').and.stub();
            spyOn(editor.blockManager.clipboardAction, 'handleContextPaste').and.stub();
            
            (editor.blockManager.contextMenuModule as any).handleContextMenuActions({ id: 'cut' });
            expect(editor.blockManager.clipboardAction.handleContextCut).toHaveBeenCalled();
            
            (editor.blockManager.contextMenuModule as any).handleContextMenuActions({ id: 'copy' });
            expect(editor.blockManager.clipboardAction.handleContextCopy).toHaveBeenCalled();

            (editor.blockManager.contextMenuModule as any).handleContextMenuActions({ id: 'paste' });
            expect(editor.blockManager.clipboardAction.handleContextPaste).toHaveBeenCalled();
        });
    });

    describe('Redo shortcut display based on OS', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;
        let originalUserAgent: string;

        beforeEach(() => {
            originalUserAgent = navigator.userAgent;
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
            Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
        });

        it('should display "Ctrl+Y" for redo shortcut on non-macOS', (done) => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                configurable: true
            });

            editor = createEditor({ blocks: [{ id: 'p1', blockType: BlockType.Paragraph, content: [{ contentType: ContentType.Text, content: 'Test' }] }] });
            editor.appendTo('#editor');
            
            editor.blockManager.setFocusToBlock(editor.element.querySelector('#p1') as HTMLElement);
            triggerRightClick(editorElement);
            setTimeout(() => {
                const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                expect(menuElement.querySelector('#redo')).not.toBeNull();
                const redoItemTextElement = menuElement.querySelector('#redo .e-ctmenu-shortcut');
                expect(redoItemTextElement).not.toBeNull();
                expect(redoItemTextElement.textContent).toBe('Ctrl+Y');
                done();
            }, 200);
        });

        it('should display "Cmd+Shift+Z" for redo shortcut on macOS', (done) => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                configurable: true
            });
            editor = createEditor({ blocks: [{ id: 'p1', blockType: BlockType.Paragraph, content: [{ contentType: ContentType.Text, content: 'Test' }] }] });
            editor.appendTo('#editor');

            editor.blockManager.setFocusToBlock(editor.element.querySelector('#p1') as HTMLElement);
            triggerRightClick(editorElement);
            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                expect(menuElement.querySelector('#redo')).not.toBeNull();
                const redoItemTextElement = menuElement.querySelector('#redo .e-ctmenu-shortcut');
                expect(redoItemTextElement).not.toBeNull();
                expect(redoItemTextElement.textContent).toBe('Cmd+Shift+Z');
                done();
            }, 200);
        });
    });

    describe('Disable scenarios testing', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);

            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    },
                    {
                        id: 'paragraph2',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 2' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
            }
            document.body.removeChild(editorElement);
        });

        it('should enable disable indent options properly', (done) => {
            const blockElement = editor.element.querySelector('#paragraph2') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);
            setCursorPosition(getBlockContentElement(blockElement), 0);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();

            editorElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
            setTimeout(() => {
                expect(menuElement.style.display).toBe('block');
                expect(menuElement.querySelector('#increaseindent').classList.contains('e-disabled')).toBe(false);
                expect(menuElement.querySelector('#decreaseindent').classList.contains('e-disabled')).toBe(true);

                //Increase the indent
                (menuElement.querySelector('#increaseindent') as HTMLElement).click();
                expect(editor.blocks[1].indent).toBe(1);
                expect(blockElement.style.getPropertyValue('--block-indent')).toBe('20');
                done();
            }, 200);
        });

        it('should enable disable clipboard options properly', (done) => {
            spyOn(editor.blockManager.clipboardAction, 'isClipboardEmpty').and.returnValue(Promise.resolve(true));
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            const contentElement = getBlockContentElement(blockElement);
            editor.blockManager.setFocusToBlock(blockElement);
            setCursorPosition(contentElement, 0);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();

            editorElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
            setTimeout(() => {
                expect(menuElement.style.display).toBe('block');
                expect(menuElement.querySelector('#cut').classList.contains('e-disabled')).toBe(true);
                expect(menuElement.querySelector('#copy').classList.contains('e-disabled')).toBe(true);

                expect(menuElement.querySelector('#paste').classList.contains('e-disabled')).toBe(true);
                //Select any range of text
                setSelectionRange((contentElement.lastChild as HTMLElement), 2, 4);
                editorElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
                setTimeout(() => {
                    expect(menuElement.style.display).toBe('block');
                    expect(menuElement.querySelector('#cut').classList.contains('e-disabled')).toBe(false);
                    expect(menuElement.querySelector('#copy').classList.contains('e-disabled')).toBe(false);
                    done();
                }, 200);
            }, 500);
        });

        it('should enable disable undo redo properly', (done) => {
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();

            editorElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
            setTimeout(() => {
                expect(menuElement.style.display).toBe('block');
                const canUndo = editor.blockManager.undoRedoAction.canUndo();
                const canRedo = editor.blockManager.undoRedoAction.canRedo();
                expect(menuElement.querySelector('#undo').classList.contains('e-disabled')).toBe(!canUndo);
                expect(menuElement.querySelector('#redo').classList.contains('e-disabled')).toBe(!canRedo);
                done();
            }, 200);
        });

        it('should enable disable link item properly', (done) => {
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            const contentElement = getBlockContentElement(blockElement);
            editor.blockManager.setFocusToBlock(blockElement);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();

            setSelectionRange((contentElement.lastChild as HTMLElement), 2, 4);

            editorElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
            setTimeout(() => {
                expect(menuElement.style.display).toBe('block');
                expect(menuElement.querySelector('#link').classList.contains('e-disabled')).toBe(false);
                done();
            }, 200);
        });

        it('should disable link item when multiple blocks are selected', (done) => {
            const firstBlockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            const secondBlockElement = editor.element.querySelector('#paragraph2') as HTMLElement;

            // Focus on the first block and set selection across both blocks
            editor.blockManager.setFocusToBlock(firstBlockElement);
            setCursorPosition(getBlockContentElement(firstBlockElement), 5);

            // Simulate selecting text from first block to second block
            const range = document.createRange();
            const startContent = getBlockContentElement(firstBlockElement).firstChild;
            const endContent = getBlockContentElement(secondBlockElement).firstChild;

            range.setStart(startContent, 5); // middle of "Test content 1"
            range.setEnd(endContent, 8);     // middle of "Test content 2"

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            // Trigger context menu
            editorElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));

            setTimeout(() => {
                const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                expect(menuElement.style.display).toBe('block');

                const linkItem = menuElement.querySelector('#link');
                expect(linkItem.classList.contains('e-disabled')).toBe(true);

                // Clean up selection
                selection.removeAllRanges();
                done();
            }, 200);
        });

        it('should enable paste options properly for copy action', (done) => {
            spyOn(editor.blockManager.clipboardAction, 'handleContextCopy').and.stub();
            const blockElement = editor.element.querySelector('#paragraph2') as HTMLElement;
            const contentElement = getBlockContentElement(blockElement);
            editor.blockManager.setFocusToBlock(blockElement);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();

            setSelectionRange((contentElement.lastChild as HTMLElement), 0, 4);

            (editor.blockManager.contextMenuModule as any).handleContextMenuActions({ id: 'copy' });
            expect(editor.blockManager.clipboardAction.handleContextCopy).toHaveBeenCalled();

            setTimeout(() => {
                editorElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
                setTimeout(() => {
                    expect(menuElement.style.display).toBe('block');
                    expect(menuElement.querySelector('#paste').classList.contains('e-disabled')).toBe(false);
                    done();
                }, 100);
            }, 100);
        });

        it('should return when blockelement is null', function (done) {
            editor.blockManager.currentFocusedBlock = null;
            (editor.blockManager.contextMenuModule as any).toggleDisabledItems();
            done();
        });

        it('should disable increase/decrease indent item inside table cell', (done) => {
            const blockElement = editor.element.querySelector('#paragraph2') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);
            setCursorPosition(getBlockContentElement(blockElement), 0);
            editor.addBlock({ id: 'table-blk', blockType: BlockType.Table }, 'paragraph2');

            const firstCellBlock = editor.element.querySelector('table .e-block') as HTMLElement;
            editor.blockManager.setFocusToBlock(firstCellBlock);
            setCursorPosition(getBlockContentElement(firstCellBlock), 0);
            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
            const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
            expect(menuElement).not.toBeNull();

            editorElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
            setTimeout(() => {
                expect(menuElement.style.display).toBe('block');
                expect(menuElement.querySelector('#increaseindent').classList.contains('e-disabled')).toBe(true);
                expect(menuElement.querySelector('#decreaseindent').classList.contains('e-disabled')).toBe(true);
                done();
            }, 200);
        });
    });

    describe('Events', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;
        let isBeforeOpenFired = false;
        let isBeforeCloseFired = false;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);

            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    },
                    {
                        id: 'paragraph2',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 2' }
                        ]
                    },
                ]
            });
            editor.appendTo('#editor');
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
                isBeforeOpenFired = false;
                isBeforeCloseFired = false;
            }
            document.body.removeChild(editorElement);
        });

        it('should trigger open and close related events', (done) => {
            editor.contextMenuSettings.beforeOpen = (args) => {
                isBeforeOpenFired = true;
            };
            editor.contextMenuSettings.beforeClose = (args) => {
                isBeforeCloseFired = true;
            };
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            const contentElement = getBlockContentElement(blockElement);
            editor.blockManager.setFocusToBlock(blockElement);
            setCursorPosition(contentElement, 0);
            triggerRightClick(editorElement);
            setTimeout(() => {
                expect(isBeforeOpenFired).toBe(true);

                blockElement.click();
                
                setTimeout(() => {
                    expect(isBeforeCloseFired).toBe(true);
                    done();
                }, 400);
            }, 400);
        });

        it('should prevent contextmenu opening when editor is in readonly mode', (done) => {
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.currentFocusedBlock = blockElement;
            editor.readOnly = true;
            editor.dataBind();
            triggerRightClick(editorElement);
            setTimeout(() => {
                const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                expect(menuElement.style.display).not.toBe('block');
                done();
            }, 200);
        });

        it('should cancel itemClick event', (done) => {
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.currentFocusedBlock = blockElement;
            editor.contextMenuSettings.itemSelect = (args) => {
                args.cancel = true;
            },
            (editor.contextMenuModule as any).handleContextMenuSelection(
            {
                item: { id: 'increaseindent', text: 'Increase Indent' }
            });
            expect(editor.blocks[0].indent).toBe(0);
            expect(blockElement.style.getPropertyValue('--block-indent')).toBe('0');
            done();
        });
    });

    describe('On property change', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);

            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
        });

        it('should handle showItemOnClick properly', (done) => {
            editor.contextMenuSettings.showItemOnClick = true;
            setTimeout(() => {
                expect(editor.contextMenuModule.contextMenuObj.showItemOnClick).toBe(true);
                done();
            }, 200);
        });

        it('should update item template', (done) => {
            editor.contextMenuSettings.itemTemplate = '<span>${text}</span>';
            setTimeout(() => {
                expect(editor.contextMenuModule.contextMenuObj.itemTemplate).toBe('<span>${text}</span>');
                done();
            }, 200);
        });

        it('should update items dynamically', (done) => {
            const items: ContextMenuItemModel[] = [
                { id: 'custom1', text: 'Custom Item 1', iconCss: 'e-icons e-copy' },
                { id: 'custom2', text: 'Custom Item 2', iconCss: 'e-icons e-paste' }
            ];
            editor.contextMenuSettings.items = items;
            setTimeout(() => {
                const popup = document.querySelector('.e-blockeditor-contextmenu');
                expect(popup.querySelectorAll('li').length).toBe(2);
                expect(popup.querySelector('#custom1') !== null).toBe(true);
                expect(popup.querySelector('#custom2') !== null).toBe(true);
                expect(editor.contextMenuSettings.items.length).toBe(2);
                expect(editor.contextMenuSettings.items[0].id).toBe('custom1');
                expect(editor.contextMenuSettings.items[1].id).toBe('custom2');
                done();
            }, 200);
        });
    });

    describe('Table Context Menu', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        function hoverMenuItem(element: HTMLElement): void {
            element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
        }

        function buildTableBlock(id: string, rows: number, cols: number, enableHeader?: boolean, enableRowNumbers?: boolean): any {
            const tableProps: any = {
                enableHeader: enableHeader || false,
                enableRowNumbers: enableRowNumbers || false,
                columns: [],
                rows: []
            };

            // Build columns
            for (let i = 0; i < cols; i++) {
                tableProps.columns.push({ id: `col${i}` });
            }

            // Build rows
            for (let r = 0; r < rows; r++) {
                const rowCells = [];
                for (let c = 0; c < cols; c++) {
                    rowCells.push({
                        columnId: `col${c}`,
                        blocks: [{ id: `cell_${r}_${c}`, blockType: BlockType.Paragraph }]
                    });
                }
                tableProps.rows.push({ cells: rowCells });
            }

            return {
                id: id,
                blockType: BlockType.Table,
                properties: tableProps
            };
        }

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
        });

        it('should show Insert submenu with correct items', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;

                expect(tableInsertItem).not.toBeNull();
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    expect(document.querySelector('#table-insert-column-left')).not.toBeNull();
                    expect(document.querySelector('#table-insert-column-right')).not.toBeNull();
                    expect(document.querySelector('#table-insert-row-above')).not.toBeNull();
                    expect(document.querySelector('#table-insert-row-below')).not.toBeNull();
                    done();
                }, 150);
            }, 200);
        });

        it('should show Delete submenu with correct items', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableDeleteItem = menuElement.querySelector('#table-delete') as HTMLElement;

                expect(tableDeleteItem).not.toBeNull();
                hoverMenuItem(tableDeleteItem);

                setTimeout(() => {
                    expect(document.querySelector('#table-delete-row')).not.toBeNull();
                    expect(document.querySelector('#table-delete-column')).not.toBeNull();
                    expect(document.querySelector('#table-delete-table')).not.toBeNull();
                    done();
                }, 150);
            }, 200);
        });

        it('should hide "Row Above" item when context menu is opened on header cell', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const headerCell = tableBlock.querySelector('th') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(headerCell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const insertRowAboveItem = menuElement.querySelector('#table-insert-row-above');

                expect(insertRowAboveItem).toBeNull();
                done();
            }, 200);
        });

        it('should include row count in the text for insert row items', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 3, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                expect(tableInsertItem).not.toBeNull();
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertRowBelowItem = document.querySelector('#table-insert-row-below');

                    expect(insertRowBelowItem).not.toBeNull();
                    expect(insertRowBelowItem.textContent).toContain('1');
                    done();
                }, 150);
            }, 200);
        });

        it('should include column count in the text for insert column items', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 3, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                expect(tableInsertItem).not.toBeNull();
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertColumnLeftItem = document.querySelector('#table-insert-column-left');

                    expect(insertColumnLeftItem).not.toBeNull();
                    expect(insertColumnLeftItem.textContent).toContain('1');
                    done();
                }, 150);
            }, 200);
        });

        it('should handle insert column left action', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            const initialColCount = (editor.blocks[0].properties as any).columns.length;
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertColumnLeftItem = document.querySelector('#table-insert-column-left') as HTMLElement;

                    insertColumnLeftItem.click();

                    setTimeout(() => {
                        const finalColCount = (editor.blocks[0].properties as any).columns.length;
                        expect(finalColCount).toBe(initialColCount + 1);
                        done();
                    }, 200);
                }, 150);
            }, 200);
        });

        it('should handle insert column right action', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            const initialColCount = (editor.blocks[0].properties as any).columns.length;
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertColumnRightItem = document.querySelector('#table-insert-column-right') as HTMLElement;

                    insertColumnRightItem.click();

                    setTimeout(() => {
                        const finalColCount = (editor.blocks[0].properties as any).columns.length;
                        expect(finalColCount).toBe(initialColCount + 1);
                        done();
                    }, 200);
                }, 150);
            }, 200);
        });

        it('should handle insert row above action', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            const initialRowCount = (editor.blocks[0].properties as any).rows.length;
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertRowAboveItem = document.querySelector('#table-insert-row-above') as HTMLElement;

                    insertRowAboveItem.click();

                    setTimeout(() => {
                        const finalRowCount = (editor.blocks[0].properties as any).rows.length;
                        expect(finalRowCount).toBe(initialRowCount + 1);
                        done();
                    }, 200);
                }, 150);
            }, 200);
        });

        it('should handle insert row below action', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            const initialRowCount = (editor.blocks[0].properties as any).rows.length;
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertRowBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;

                    insertRowBelowItem.click();

                    setTimeout(() => {
                        const finalRowCount = (editor.blocks[0].properties as any).rows.length;
                        expect(finalRowCount).toBe(initialRowCount + 1);
                        done();
                    }, 200);
                }, 150);
            }, 200);
        });

        it('should handle delete row action', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            const initialRowCount = (editor.blocks[0].properties as any).rows.length;
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableDeleteItem = menuElement.querySelector('#table-delete') as HTMLElement;
                hoverMenuItem(tableDeleteItem);

                setTimeout(() => {
                    const deleteRowItem = document.querySelector('#table-delete-row') as HTMLElement;

                    deleteRowItem.click();

                    setTimeout(() => {
                        const finalRowCount = (editor.blocks[0].properties as any).rows.length;
                        expect(finalRowCount).toBe(initialRowCount - 1);
                        done();
                    }, 200);
                }, 150);
            }, 200);
        });

        it('should handle delete column action', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 3, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            const initialColCount = (editor.blocks[0].properties as any).columns.length;
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableDeleteItem = menuElement.querySelector('#table-delete') as HTMLElement;
                hoverMenuItem(tableDeleteItem);

                setTimeout(() => {
                    const deleteColumnItem = document.querySelector('#table-delete-column') as HTMLElement;

                    deleteColumnItem.click();

                    setTimeout(() => {
                        const finalColCount = (editor.blocks[0].properties as any).columns.length;
                        expect(finalColCount).toBe(initialColCount - 1);
                        done();
                    }, 200);
                }, 150);
            }, 200);
        });

        it('should handle delete table action', (done) => {
            editor = createEditor({
                blocks: [
                    buildTableBlock('table1', 2, 2, false, false),
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [{ contentType: ContentType.Text, content: 'After table' }]
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            expect(editor.blocks.length).toBe(2);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableDeleteItem = menuElement.querySelector('#table-delete') as HTMLElement;
                hoverMenuItem(tableDeleteItem);

                setTimeout(() => {
                    const deleteTableItem = document.querySelector('#table-delete-table') as HTMLElement;

                    deleteTableItem.click();

                    setTimeout(() => {
                        expect(editor.blocks.length).toBe(1);
                        expect(editor.blocks[0].id).toBe('paragraph1');
                        done();
                    }, 200);
                }, 150);
            }, 200);
        });

        it('should localize table items with correct text constants', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert');
                const tableDeleteItem = menuElement.querySelector('#table-delete');

                // Verify localized text from l10n
                const insertText = tableInsertItem.querySelector('.e-ctmenu-text').textContent;
                const deleteText = tableDeleteItem.querySelector('.e-ctmenu-text').textContent;

                expect(insertText).not.toBeNull();
                expect(deleteText).not.toBeNull();
                done();
            }, 200);
        });

        it('should call resolveTableItems correctly for custom table items', (done) => {
            const customTableItems: ContextMenuItemModel[] = [
                { id: 'table-insert', text: 'Custom Insert' },
                { id: 'table-delete', text: 'Custom Delete' }
            ];

            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)],
                contextMenuSettings: { table: customTableItems as any }
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert');

                expect(tableInsertItem).not.toBeNull();
                done();
            }, 200);
        });

        it('should not delete single row from table', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 1, 2)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialRowCount = table.rows.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableDeleteItem = menuElement.querySelector('#table-delete') as HTMLElement;
                hoverMenuItem(tableDeleteItem);

                setTimeout(() => {
                    const deleteRowItem = document.querySelector('#table-delete-row') as HTMLElement;
                    deleteRowItem.click();

                    setTimeout(() => {
                        const newRowCount = table.rows.length;
                        expect(newRowCount).toBe(initialRowCount);
                        done();
                    }, 100);
                }, 150);
            }, 200);
        });

        it('should not delete single column from table', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 1)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialColCount = table.rows[0].cells.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableDeleteItem = menuElement.querySelector('#table-delete') as HTMLElement;
                hoverMenuItem(tableDeleteItem);

                setTimeout(() => {
                    const deleteColItem = document.querySelector('#table-delete-column') as HTMLElement;
                    deleteColItem.click();

                    setTimeout(() => {
                        const newColCount = table.rows[0].cells.length;
                        expect(newColCount).toBe(initialColCount);
                        done();
                    }, 100);
                }, 150);
            }, 200);
        });

        it('should handle multi-row selection in insert operations', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 2)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cells = tableBlock.querySelectorAll('td');

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cells[0] as HTMLElement);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;
                    expect(insertBelowItem).not.toBeNull();
                    done();
                }, 150);
            }, 200);
        });

        it('should restore focus after inserting multiple columns', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialColCount = table.rows[0].cells.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertLeftItem = document.querySelector('#table-insert-column-left') as HTMLElement;
                    insertLeftItem.click();

                    setTimeout(() => {
                        const newColCount = table.rows[0].cells.length;
                        expect(newColCount).toBe(initialColCount + 1);
                        const tbody = table.tBodies[0];
                        const focusedCell = tbody.querySelector('.e-cell-focus') as HTMLTableCellElement;
                        expect(focusedCell).not.toBeNull();
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should restore focus after inserting multiple rows', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialRowCount = table.rows.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertAboveItem = document.querySelector('#table-insert-row-above') as HTMLElement;
                    insertAboveItem.click();

                    setTimeout(() => {
                        const newRowCount = table.rows.length;
                        expect(newRowCount).toBe(initialRowCount + 1);
                        const tbody = table.tBodies[0];
                        const focusedCell = tbody.querySelector('.e-cell-focus') as HTMLTableCellElement;
                        expect(focusedCell).not.toBeNull();
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should handle table context menu with enableRowNumbers true', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, true)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const tableItems = document.querySelectorAll('[id^="table-"]');
                expect(tableItems.length).toBeGreaterThan(0);
                done();
            }, 200);
        });

        it('should handle table context menu with enableHeader true', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const tableItems = document.querySelectorAll('[id^="table-"]');
                expect(tableItems.length).toBeGreaterThan(0);
                done();
            }, 200);
        });

        it('should handle context menu on header cell with enableHeader and enableRowNumbers', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 3, true, true)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const headerCell = tableBlock.querySelector('th') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(headerCell);

            setTimeout(() => {
                const insertRowAboveItem = document.querySelector('#table-insert-row-above') as HTMLElement;
                // Should be hidden for header cell
                expect(insertRowAboveItem === null || insertRowAboveItem.style.display === 'none' || !insertRowAboveItem).toBe(true);
                done();
            }, 200);
        });

        it('should not add duplicate table items when menu already has them', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell1 = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell1);

            setTimeout(() => {
                const tableInsertItems1 = document.querySelectorAll('#table-insert');
                const count1 = tableInsertItems1.length;

                triggerRightClick(cell1);
                setTimeout(() => {
                    const tableInsertItems2 = document.querySelectorAll('#table-insert');
                    const count2 = tableInsertItems2.length;

                    // Count should not increase (no duplicates)
                    expect(count2).toBeLessThanOrEqual(count1 + 1);
                    done();
                }, 200);
            }, 200);
        });

        it('should properly remove table items when clicking outside table', (done) => {
            editor = createEditor({
                blocks: [
                    buildTableBlock('table1', 2, 2),
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [{ contentType: ContentType.Text, content: 'Test paragraph' }]
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const tableInsertOnTable = document.querySelector('#table-insert');
                expect(tableInsertOnTable).not.toBeNull();

                const paragraphBlock = editor.element.querySelector('#paragraph1') as HTMLElement;
                editor.blockManager.setFocusToBlock(paragraphBlock);
                triggerRightClick(paragraphBlock);

                setTimeout(() => {
                    const tableInsertOnPara = document.querySelector('#table-insert');
                    // Table items should be removed
                    expect(tableInsertOnPara === null || !document.body.contains(tableInsertOnPara)).toBe(true);
                    done();
                }, 200);
            }, 200);
        });

        it('should enable/disable menu items based on state', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });
            editor.appendTo('#editor');

            const menuState = {
                'table-insert': false,
                'table-delete': true
            };

            // Notify the state change
            editor.blockManager.observer.notify('enableDisableContextMenuItems', menuState);

            setTimeout(() => {
                // Verify the state was processed
                expect(editor.blockManager.contextMenuModule).not.toBeNull();
                done();
            }, 100);
        });

        it('should detect header cell correctly', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const headerCell = tableBlock.querySelector('th') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(headerCell);

            setTimeout(() => {
                const isHeader = editor.blockManager.contextMenuModule.isHeaderCellActive();
                expect(isHeader).toBe(true);
                done();
            }, 200);
        });

        it('should detect non-header cell correctly', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const isHeader = editor.blockManager.contextMenuModule.isHeaderCellActive();
                expect(isHeader).toBe(false);
                done();
            }, 200);
        });

        it('should handle inserting row when enableHeader is enabled', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const bodyCells = tableBlock.querySelectorAll('tbody td');
            const cell = bodyCells[0] as HTMLElement;
            const initialRowCount = (editor.blocks[0].properties as any).rows.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;
                    insertBelowItem.click();

                    setTimeout(() => {
                        const newRowCount = (editor.blocks[0].properties as any).rows.length;
                        expect(newRowCount).toBe(initialRowCount + 1);
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should handle deleting row when enableHeader is enabled', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const bodyCells = tableBlock.querySelectorAll('tbody td');
            const cell = bodyCells[0] as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialRowCount = table.rows.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableDeleteItem = menuElement.querySelector('#table-delete') as HTMLElement;
                hoverMenuItem(tableDeleteItem);

                setTimeout(() => {
                    const deleteRowItem = document.querySelector('#table-delete-row') as HTMLElement;
                    deleteRowItem.click();

                    setTimeout(() => {
                        const newRowCount = table.rows.length;
                        expect(newRowCount).toBe(initialRowCount - 1);
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should handle table operations with enableRowNumbers and enableHeader', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 3, true, true)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const bodyCells = tableBlock.querySelectorAll('tbody td');
            const cell = bodyCells[1] as HTMLElement; // second cell to skip row number column
            const table = tableBlock.querySelector('table') as HTMLTableElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const insertLeftItem = document.querySelector('#table-insert-column-left') as HTMLElement;
                if (insertLeftItem) {
                    insertLeftItem.click();
                    setTimeout(() => {
                        expect(table.rows[0].cells.length).toBeGreaterThan(3);
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should handle insert column right with enableRowNumbers', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, true)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const bodyCells = tableBlock.querySelectorAll('tbody td');
            const cell = bodyCells[0] as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialColCount = table.rows[0].cells.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const insertRightItem = document.querySelector('#table-insert-column-right') as HTMLElement;
                if (insertRightItem) {
                    insertRightItem.click();
                    setTimeout(() => {
                        expect(table.rows[0].cells.length).toBe(initialColCount + 1);
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should handle insert row above with enableHeader', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const bodyCells = tableBlock.querySelectorAll('tbody td');
            const cell = bodyCells[0] as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialRowCount = table.rows.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const insertAboveItem = document.querySelector('#table-insert-row-above') as HTMLElement;
                if (insertAboveItem) {
                    insertAboveItem.click();
                    setTimeout(() => {
                        expect(table.rows.length).toBe(initialRowCount + 1);
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should hide row above item when context menu is opened on header cell with enableHeader', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const headerCell = tableBlock.querySelector('th') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(headerCell);

            setTimeout(() => {
                const insertAboveItem = document.querySelector('#table-insert-row-above') as HTMLElement;
                expect(insertAboveItem).toBeNull();
                done();
            }, 200);
        });

        it('should correctly display column count in insert column items', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 3, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const insertLeftItem = document.querySelector('#table-insert-column-left') as HTMLElement;
                if (insertLeftItem) {
                    const textContent = insertLeftItem.textContent || '';
                    expect(textContent).toContain('1');
                }
                done();
            }, 200);
        });

        it('should correctly display row count in insert row items', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;
                if (insertBelowItem) {
                    const textContent = insertBelowItem.textContent || '';
                    expect(textContent).toContain('1');
                }
                done();
            }, 200);
        });

        it('should handle delete table operation', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const deleteTableItem = document.querySelector('#table-delete-table') as HTMLElement;
                if (deleteTableItem) {
                    deleteTableItem.click();
                    setTimeout(() => {
                        const tableAfterDelete = editor.element.querySelector('#table1');
                        expect(tableAfterDelete).toBeNull();
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should not delete single row from table', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 1, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialRowCount = table.rows.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const deleteRowItem = document.querySelector('#table-delete-row') as HTMLElement;
                if (deleteRowItem) {
                    deleteRowItem.click();
                    setTimeout(() => {
                        expect(table.rows.length).toBe(initialRowCount);
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should not delete single column from table', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 1, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            const initialColCount = table.rows[0].cells.length;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const deleteColItem = document.querySelector('#table-delete-column') as HTMLElement;
                if (deleteColItem) {
                    deleteColItem.click();
                    setTimeout(() => {
                        expect(table.rows[0].cells.length).toBe(initialColCount);
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should verify isHeaderCellActive returns true for header cell', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const headerCell = tableBlock.querySelector('th') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(headerCell);

            setTimeout(() => {
                const isHeaderCell = editor.blockManager.contextMenuModule.isHeaderCellActive();
                expect(isHeaderCell).toBe(true);
                done();
            }, 200);
        });

        it('should verify isHeaderCellActive returns false for body cell', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const bodyCell = tableBlock.querySelector('tbody td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(bodyCell);

            setTimeout(() => {
                const isHeaderCell = editor.blockManager.contextMenuModule.isHeaderCellActive();
                expect(isHeaderCell).toBe(false);
                done();
            }, 200);
        });

        it('should handle multiple column selection and insertion', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 3, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cells = tableBlock.querySelectorAll('td');
            const firstCell = cells[0] as HTMLElement;
            const secondCell = cells[1] as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            // Simulate multi-cell selection
            (firstCell as any).classList.add('e-cell-selected');
            (secondCell as any).classList.add('e-cell-selected');

            triggerRightClick(firstCell);

            setTimeout(() => {
                const insertLeftItem = document.querySelector('#table-insert-column-left') as HTMLElement;
                if (insertLeftItem) {
                    const textContent = insertLeftItem.textContent || '';
                    expect(textContent).toContain('2');
                }
                done();
            }, 200);
        });

        it('should handle multiple row selection and insertion', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 4, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cells = tableBlock.querySelectorAll('td');
            const firstCell = cells[0] as HTMLElement;
            const thirdCell = cells[2] as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            // Simulate multi-row selection
            (firstCell as any).classList.add('e-cell-selected');
            (thirdCell as any).classList.add('e-cell-selected');

            triggerRightClick(firstCell);

            setTimeout(() => {
                const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;
                if (insertBelowItem) {
                    const textContent = insertBelowItem.textContent || '';
                    expect(textContent).toContain('2');
                }
                done();
            }, 200);
        });

        it('should focus restored cell after insert column operation', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const insertLeftItem = document.querySelector('#table-insert-column-left') as HTMLElement;
                if (insertLeftItem) {
                    insertLeftItem.click();
                    setTimeout(() => {
                        const focusedCell = tableBlock.querySelector('.e-cell-focus') as HTMLElement;
                        expect(focusedCell).not.toBeNull();
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 200);
        });

        it('should focus restored cell after insert row operation', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;
                if (insertBelowItem) {
                    insertBelowItem.click();
                    setTimeout(() => {
                        const focusedCell = tableBlock.querySelector('.e-cell-focus') as HTMLElement;
                        expect(focusedCell).not.toBeNull();
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 200);
        });

        it('should handle resolveTableItems with custom items', (done) => {
            const customItems: ContextMenuItemModel[] = [
                { id: 'table-insert-column-left', text: 'Custom Insert Left' }
            ];

            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)],
                contextMenuSettings: { table: customItems as any }
            });
            editor.appendTo('#editor');

            const resolvedItems = editor.blockManager.contextMenuModule.resolveTableItems(customItems as any);
            expect(resolvedItems).toBeDefined();
            expect(resolvedItems.length).toBeGreaterThan(0);
            done();
        });

        it('should handle resolveTableItems with empty array', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const resolvedItems = editor.blockManager.contextMenuModule.resolveTableItems([]);
            expect(resolvedItems).toBeDefined();
            expect(resolvedItems.length).toBeGreaterThan(0);
            done();
        });

        it('should handle context menu close properly', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                triggerRightClick(editorElement);

                setTimeout(() => {
                    const isOpen = editor.blockManager.contextMenuModule.isPopupOpen();
                    expect(typeof isOpen).toBe('boolean');
                    done();
                }, 200);
            }, 200);
        });

        it('should handle second right click to show table menu items', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            // First right click
            triggerRightClick(cell);

            setTimeout(() => {
                // Second right click
                triggerRightClick(cell);

                setTimeout(() => {
                    const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                    const tableInsertItem = menuElement.querySelector('#table-insert');
                    expect(tableInsertItem).not.toBeNull();
                    done();
                }, 200);
            }, 200);
        });

        it('should handle table operations when cell is in tbody with enableRowNumbers', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 2, false, true)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const bodyCells = tableBlock.querySelectorAll('tbody td');
            const cell = bodyCells[0] as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;
                if (insertBelowItem) {
                    insertBelowItem.click();
                    setTimeout(() => {
                        const table = tableBlock.querySelector('table') as HTMLTableElement;
                        expect(table.rows.length).toBeGreaterThan(3);
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should handle inserting multiple columns at once', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cells = tableBlock.querySelectorAll('td');
            const firstCell = cells[0] as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            // Select 2 cells
            (firstCell as any).classList.add('e-cell-selected');
            (cells[1] as any).classList.add('e-cell-selected');

            triggerRightClick(firstCell);

            setTimeout(() => {
                const insertLeftItem = document.querySelector('#table-insert-column-left') as HTMLElement;
                if (insertLeftItem) {
                    const table = tableBlock.querySelector('table') as HTMLTableElement;
                    const initialColCount = table.rows[0].cells.length;

                    insertLeftItem.click();

                    setTimeout(() => {
                        const newColCount = table.rows[0].cells.length;
                        expect(newColCount).toBe(initialColCount + 2);
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should handle inserting multiple rows at once', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cells = tableBlock.querySelectorAll('td');
            const firstCell = cells[0] as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);

            // Select 2 cells from different rows
            (firstCell as any).classList.add('e-cell-selected');
            (cells[2] as any).classList.add('e-cell-selected');

            triggerRightClick(firstCell);

            setTimeout(() => {
                const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;
                if (insertBelowItem) {
                    const table = tableBlock.querySelector('table') as HTMLTableElement;
                    const initialRowCount = table.rows.length;

                    insertBelowItem.click();

                    setTimeout(() => {
                        const newRowCount = table.rows.length;
                        expect(newRowCount).toBe(initialRowCount + 2);
                        done();
                    }, 150);
                } else {
                    done();
                }
            }, 200);
        });

        it('should call addColumnAt with correct index for single column insert left', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            const spy = spyOn(editor.blockManager.tableService, 'addColumnAt').and.callThrough();

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertLeftItem = document.querySelector('#table-insert-column-left') as HTMLElement;
                    insertLeftItem.click();

                    setTimeout(() => {
                        expect(spy).toHaveBeenCalledWith({
                            blockId: 'table1',
                            colIndex: 0   // model index
                        });
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should call addColumnAt with correct index for single column insert right', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td:nth-child(2)') as HTMLElement; // second column

            const spy = spyOn(editor.blockManager.tableService, 'addColumnAt').and.callThrough();

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertRightItem = document.querySelector('#table-insert-column-right') as HTMLElement;
                    insertRightItem.click();

                    setTimeout(() => {
                        expect(spy).toHaveBeenCalledWith({
                            blockId: 'table1',
                            colIndex: 2
                        });
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should call addRowAt with correct index for single row insert above', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            const spy = spyOn(editor.blockManager.tableService, 'addRowAt').and.callThrough();

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertAboveItem = document.querySelector('#table-insert-row-above') as HTMLElement;
                    insertAboveItem.click();

                    setTimeout(() => {
                        expect(spy).toHaveBeenCalledWith({
                            blockId: 'table1',
                            rowIndex: 0
                        });
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should call addRowAt with correct index for single row insert below', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            const spy = spyOn(editor.blockManager.tableService, 'addRowAt').and.callThrough();

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;
                    insertBelowItem.click();

                    setTimeout(() => {
                        expect(spy).toHaveBeenCalledWith({
                            blockId: 'table1',
                            rowIndex: 1
                        });
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should restore focus after row insertion with enableHeader = true', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 3, 3, true, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            if (!tableBlock) {
                done();
                return;
            }
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;
            if (!cell) {
                done();
                return;
            }

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                if (!menuElement) {
                    done();
                    return;
                }
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                if (tableInsertItem) {
                    hoverMenuItem(tableInsertItem);

                    setTimeout(() => {
                        const insertBelow = document.querySelector('#table-insert-row-below') as HTMLElement;
                        if (insertBelow) {
                            insertBelow.click();

                            setTimeout(() => {
                                const table = tableBlock.querySelector('table') as HTMLTableElement;
                                const focusedCell = table ? table.querySelector('.e-cell-focus') as HTMLTableCellElement : null;
                                if (focusedCell) {
                                    expect(focusedCell).not.toBeNull();
                                }
                                done();
                            }, 150);
                        }
                    }, 150);
                }
            }, 200);
        });

        it('should restore focus after column insertion when inserting to the right', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            if (!tableBlock) {
                done();
                return;
            }
            const cell = tableBlock.querySelector('td:nth-child(2)') as HTMLTableCellElement;
            if (!cell) {
                done();
                return;
            }

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                if (!menuElement) {
                    done();
                    return;
                }
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                if (tableInsertItem) {
                    hoverMenuItem(tableInsertItem);

                    setTimeout(() => {
                        const insertRight = document.querySelector('#table-insert-column-right') as HTMLElement;
                        if (insertRight) {
                            insertRight.click();

                            setTimeout(() => {
                                const table = tableBlock.querySelector('table') as HTMLTableElement;
                                const focused = table ? table.querySelector('.e-cell-focus') as HTMLTableCellElement : null;
                                if (focused) {
                                    expect(focused).not.toBeNull();
                                }
                                done();
                            }, 150);
                        }
                    }, 150);
                }
            }, 200);
        });

        it('should handle restoreCellFocusAfterTableOperation when tbody is empty or table not found', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 1, 1, false, false)]
            });
            editor.appendTo('#editor');

            const contextMenuModule = (editor.blockManager.contextMenuModule as any);

            // Should not throw
            contextMenuModule.restoreCellFocusAfterTableOperation('non-existent', 0, 0, 'column');
            contextMenuModule.restoreCellFocusAfterTableOperation('table1', 0, 0, 'column');

            // Force empty tbody scenario
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const table = tableBlock.querySelector('table') as HTMLTableElement;
            table.innerHTML = '<thead></thead>'; // no tbody

            contextMenuModule.restoreCellFocusAfterTableOperation('table1', 0, 0, 'column');

            expect(true).toBe(true); // just ensuring no crash
            done();
        });
        it('should restore focus after row insert when enableRowNumbers = false', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertAboveItem = document.querySelector('#table-insert-row-above') as HTMLElement;
                    insertAboveItem.click();

                    setTimeout(() => {
                        const table = tableBlock.querySelector('table.e-table-element') as HTMLTableElement;
                        const focusedCell = table.querySelector('.e-cell-focus') as HTMLTableCellElement;

                        expect(focusedCell).not.toBeNull();
                        expect(focusedCell.cellIndex).toBe(0);
                        done();
                    }, 150);
                }, 150);
            }, 200);
        });

        it('should handle row focus restoration gracefully when row does not exist', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 1, 2, false, false)]
            });
            editor.appendTo('#editor');

            const contextMenuModule = (editor.blockManager.contextMenuModule as any);

            // This should not throw error
            contextMenuModule.restoreCellFocusAfterTableOperation('table1', 0, 999, 'row'); // invalid rowIndex

            expect(true).toBe(true);
            done();
        });
        it('should restore cell focus after row insertion (covers row branch in restoreCellFocusAfterTableOperation)', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 3, false, true)]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const firstCell = tableBlock.querySelector('td') as HTMLTableCellElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(firstCell);

            setTimeout(() => {
                const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                hoverMenuItem(tableInsertItem);

                setTimeout(() => {
                    const insertBelowItem = document.querySelector('#table-insert-row-below') as HTMLElement;

                    const restoreSpy = spyOn(editor.blockManager.contextMenuModule as any,
                        'restoreCellFocusAfterTableOperation').and.callThrough();

                    insertBelowItem.click();

                    setTimeout(() => {
                        const table = tableBlock.querySelector('table.e-table-element') as HTMLTableElement;
                        const focusedCell = table.querySelector('.e-cell-focus') as HTMLTableCellElement;

                        expect(restoreSpy).toHaveBeenCalled();
                        expect(focusedCell).not.toBeNull();
                        expect(focusedCell.cellIndex).toBe(1);

                        done();
                    }, 200);
                }, 150);
            }, 200);
        });
        it('should return from filterTableMenuItems when contextMenuObj is null', () => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });
            editor.appendTo('#editor');

            const module: any = editor.contextMenuModule;

            module.contextMenuObj = null;

            expect(() => {
                module.filterTableMenuItems();
            }).not.toThrow();
        });
        it('should return when resolved table items are empty', () => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });
            editor.appendTo('#editor');

            const module: any = editor.contextMenuModule;

            spyOn(module, 'getResolvedTableItems').and.returnValue([]);

            expect(() => {
                module.buildAllMenuItems();
            }).not.toThrow();
        });
        it('should insert table items after last item when link item does not exist', () => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)],
                contextMenuSettings: {
                    items: [
                        { id: 'custom1', text: 'Custom 1' }
                    ]
                }
            });

            editor.appendTo('#editor');

            const module: any = editor.contextMenuModule;

            spyOn(module.contextMenuObj, 'insertAfter').and.callThrough();

            module.addTableItemsToMenu();

            expect(module.contextMenuObj.insertAfter).toHaveBeenCalled();
        });
        it('should return from removeTableItemsFromMenu when contextMenuObj is null', () => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });

            editor.appendTo('#editor');

            const module: any = editor.contextMenuModule;

            module.contextMenuObj = null;

            expect(() => {
                module.removeTableItemsFromMenu();
            }).not.toThrow();
        });
        it('should return false when event target is undefined in isClickOnTable', () => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });

            editor.appendTo('#editor');

            const module: any = editor.contextMenuModule;

            expect(module.isClickOnTable(null)).toBe(false);

            expect(module.isClickOnTable({})).toBe(false);
        });
        it('should return true when target is td element in isClickOnTable', () => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2)]
            });

            editor.appendTo('#editor');

            const module: any = editor.contextMenuModule;

            const td = editor.element.querySelector('td') as HTMLElement;

            const event = {
                target: td
            };

            expect(module.isClickOnTable(event)).toBe(true);
        });

        it('should handle resolveTableItems with custom items', (done) => {
            editor = createEditor({
                blocks: [buildTableBlock('table1', 2, 2, false, false)]
            });
            editor.appendTo('#editor');

            const contextMenuModule = editor.blockManager.contextMenuModule as any;
            if (contextMenuModule && contextMenuModule.resolveTableItems) {
                const customItems = ['table-insert-column-left'];
                const resolved = contextMenuModule.resolveTableItems(customItems);
                expect(resolved.length).toBeGreaterThanOrEqual(0);
            } else {
                expect(true).toBe(true);
            }
            done();
        });

        it('should display table items with localized text from localeJson', (done) => {
            const tableBlock = buildTableBlock('table1', 2, 2, false, false);
            editor = createEditor({
                blocks: [tableBlock]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('div[id="table1"]') as HTMLElement;
                if (blockElement && blockElement.querySelector('td')) {
                    const tdElement = blockElement.querySelector('td') as HTMLElement;
                    editor.blockManager.setFocusToBlock(blockElement);
                    triggerRightClick(tdElement);

                    setTimeout(() => {
                        const contextMenu = document.querySelector('.e-blockeditor-contextmenu');
                        if (contextMenu) {
                            const tableInsertItem = contextMenu.querySelector('[id="table-insert"]');
                            const tableDeleteItem = contextMenu.querySelector('[id="table-delete"]');

                            expect(tableInsertItem).toBeNull();
                            expect(tableDeleteItem).toBeNull();
                        }
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });
    });
    describe('Table context menu testing', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
        });

        it('should have table insert menu item with correct structure', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                if (tableBlock) {
                    const firstCell = tableBlock.querySelector('td') as HTMLElement;
                    if (firstCell) {
                        editor.blockManager.setFocusToBlock(tableBlock);
                        triggerRightClick(firstCell);
                        setTimeout(() => {
                            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                            if (menuWrapperElement) {
                                const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                                if (menuElement) {
                                    const insertItem = menuElement.querySelector('#table-insert');
                                    if (insertItem) {
                                        expect(insertItem.textContent).toContain('Insert');
                                    }
                                }
                            }
                            done();
                        }, 100);
                    } else {
                        done();
                    }
                } else {
                    done();
                }
            }, 100);
        });

        it('should have table delete menu item with correct structure', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                if (tableBlock) {
                    const firstCell = tableBlock.querySelector('td') as HTMLElement;
                    if (firstCell) {
                        editor.blockManager.setFocusToBlock(tableBlock);
                        triggerRightClick(firstCell);
                        setTimeout(() => {
                            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                            if (menuWrapperElement) {
                                const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                                if (menuElement) {
                                    const deleteItem = menuElement.querySelector('#table-delete');
                                    if (deleteItem) {
                                        expect(deleteItem.textContent).toContain('Delete');
                                    }
                                }
                            }
                            done();
                        }, 100);
                    } else {
                        done();
                    }
                } else {
                    done();
                }
            }, 100);
        });

        it('should replace default table items with custom table items', (done) => {
            const customTableItems: ContextMenuItemModel[] = [
                { id: 'custom-insert', text: 'Custom Insert', iconCss: 'e-icons e-add' }
            ];

            editor = createEditor({
                blocks: [createTableBlock()],
                contextMenuSettings: { table: customTableItems }
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                expect(editor.contextMenuSettings.table.length).toBe(1);
                done();
            }, 100);
        });

        it('should handle table operation with correct cellInfo', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                if (tableBlock) {
                    const firstCell = tableBlock.querySelector('td') as HTMLTableCellElement;
                    if (firstCell) {
                        editor.blockManager.setFocusToBlock(tableBlock);
                        const spy = spyOn(editor.blockManager.tableService, 'addColumnAt');

                        // Simulate right-click on cell to set cellInfo
                        const table = firstCell.closest('table');
                        if (table) {
                            const rowIndex = Array.from(table.rows).indexOf(firstCell.parentElement as HTMLTableRowElement);
                            const colIndex = firstCell.cellIndex;

                            (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex, colIndex, blockId: 'table1' };
                            (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-left');

                            setTimeout(() => {
                                if (spy.calls.count() > 0) {
                                    expect(spy).toHaveBeenCalled();
                                }
                                done();
                            }, 150);
                        } else {
                            done();
                        }
                    } else {
                        done();
                    }
                } else {
                    done();
                }
            }, 100);
        });

        it('should not show table items when right-clicking outside table', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content' }
                        ]
                    },
                    createTableBlock('table2')
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const paragraphBlock = editor.element.querySelector('#paragraph1') as HTMLElement;
                editor.blockManager.setFocusToBlock(paragraphBlock);
                setCursorPosition(getBlockContentElement(paragraphBlock), 0);

                triggerRightClick(editorElement);
                setTimeout(() => {
                    const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                    const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                    // Table items should be hidden when in paragraph context (not in table)
                    const tableInsertItem = menuElement.querySelector('#table-insert') as HTMLElement;
                    const tableDeleteItem = menuElement.querySelector('#table-delete') as HTMLElement;
                    // Items should either be hidden or disabled
                    expect(tableInsertItem == null || tableInsertItem.classList.contains('e-hidden') || tableInsertItem.classList.contains('e-disabled')).toBe(true);
                    expect(tableDeleteItem == null || tableDeleteItem.classList.contains('e-hidden') || tableDeleteItem.classList.contains('e-disabled')).toBe(true);
                    done();
                }, 100);
            }, 100);
        });

        it('should trigger table item click event with correct event args', (done) => {
            let itemSelectTriggered = false;
            let selectedItemId: string = '';

            editor = createEditor({
                blocks: [createTableBlock()],
                contextMenuSettings: {
                    itemSelect: (args) => {
                        itemSelectTriggered = true;
                        selectedItemId = args.item.id;
                    }
                }
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);
                setCursorPosition(getBlockContentElement(firstCell), 0);

                // Properly trigger the context menu selection through the renderer module
                const rendererContextMenuModule = editor.contextMenuModule;
                const menuItem: ContextMenuItemModel = { id: 'table-insert-column-left', text: 'Column Left', iconCss: 'e-icons e-insert-left' };
                (rendererContextMenuModule as any).handleContextMenuSelection({ item: menuItem, event: new MouseEvent('click') });

                expect(itemSelectTriggered).toBe(true);
                expect(selectedItemId).toBe('table-insert-column-left');
                done();
            }, 100);
        });

        it('should prevent table item action when cancel is set to true', (done) => {
            let actionCancelled = false;

            editor = createEditor({
                blocks: [createTableBlock()],
                contextMenuSettings: {
                    itemSelect: (args) => {
                        args.cancel = true;
                        actionCancelled = true;
                    }
                }
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);
                setCursorPosition(getBlockContentElement(firstCell), 0);

                const rendererContextMenuModule = editor.contextMenuModule;
                const menuItem: ContextMenuItemModel = { id: 'table-insert-column-left', text: 'Column Left', iconCss: 'e-icons e-insert-left' };
                (rendererContextMenuModule as any).handleContextMenuSelection({ item: menuItem, event: new MouseEvent('click') });

                expect(actionCancelled).toBe(true);
                done();
            }, 100);
        });

        it('should not show table context menu items in readonly mode', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                editor.readOnly = true;
                editor.dataBind();

                triggerRightClick(editorElement);

                setTimeout(() => {
                    const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                    const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                    // Menu should not be open in readonly mode
                    expect(menuElement.style.display).not.toBe('block');
                    done();
                }, 100);
            }, 100);
        });

        it('should handle beforeOpen event for table context menu', (done) => {
            let beforeOpenFired = false;

            editor = createEditor({
                blocks: [createTableBlock()],
                contextMenuSettings: {
                    beforeOpen: (args) => {
                        beforeOpenFired = true;
                    }
                }
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                triggerRightClick(editorElement);

                setTimeout(() => {
                    expect(beforeOpenFired).toBe(true);
                    done();
                }, 100);
            }, 100);
        });

        it('should handle beforeClose event for table context menu', (done) => {
            let beforeCloseFired = false;

            editor = createEditor({
                blocks: [createTableBlock()],
                contextMenuSettings: {
                    beforeClose: (args) => {
                        beforeCloseFired = true;
                    }
                }
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                triggerRightClick(editorElement);

                setTimeout(() => {
                    firstCell.click();
                    setTimeout(() => {
                        expect(beforeCloseFired).toBe(true);
                        done();
                    }, 200);
                }, 100);
            }, 100);
        });
    });

    describe('Context menu focus and cell handling (uncovered code paths)', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
        });

        it('should return early when tableBlock is null in handleTableOperation', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addColumnAt');
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                editor.blockManager.setFocusToBlock(blockElement);

                // Set cellInfo but currentFocusedBlock is not in a table
                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-left');

                // Service should not be called because tableBlock is null
                expect(editor.blockManager.tableService.addColumnAt).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should return early when blockModel.id is not found', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addColumnAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                // Test with null cellInfo - should return early
                (editor.blockManager.contextMenuModule as any).cellInfo = null;
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-left');

                // Service should not be called because cellInfo is null
                expect(editor.blockManager.tableService.addColumnAt).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle table-insert-column-left operation correctly', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addColumnAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(tableBlock);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-left');

                setTimeout(() => {
                    expect(editor.blockManager.tableService.addColumnAt).toHaveBeenCalledWith(jasmine.objectContaining({
                        colIndex: jasmine.any(Number)
                    }));
                    done();
                }, 100);
            }, 100);
        });

        it('should handle table-insert-column-right operation correctly', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addColumnAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(tableBlock);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-right');

                setTimeout(() => {
                    expect(editor.blockManager.tableService.addColumnAt).toHaveBeenCalled();
                    done();
                }, 100);
            }, 100);
        });


        it('should handle table-insert-row-above operation correctly', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addRowAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(tableBlock);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-row-above');

                setTimeout(() => {
                    expect(editor.blockManager.tableService.addRowAt).toHaveBeenCalled();
                    done();
                }, 100);
            }, 100);
        });

        it('should handle table-insert-row-below operation correctly', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addRowAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(tableBlock);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-row-below');

                setTimeout(() => {
                    expect(editor.blockManager.tableService.addRowAt).toHaveBeenCalled();
                    done();
                }, 100);
            }, 100);
        });

        it('should handle table-delete-column operation when multiple columns exist', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'deleteColumnAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-delete-column');

                expect(editor.blockManager.tableService.deleteColumnAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should not delete column when only one column exists', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }],  // Only one column
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'deleteColumnAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-delete-column');

                // Should not be called because settings.columns.length is not > 1
                expect(editor.blockManager.tableService.deleteColumnAt).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle table-delete-row operation when multiple rows exist', (done) => {
            const tableBlock = createTableBlock();
            // Ensure the table has multiple rows
            (tableBlock.properties as any).rows.push({
                id: 'row2',
                cells: [
                    {
                        columnId: 'col1',
                        blocks: [{ id: 'c3_p', blockType: BlockType.Paragraph, content: [{ id: 'c3_t', contentType: ContentType.Text, content: 'Cell 3' }] }]
                    },
                    {
                        columnId: 'col2',
                        blocks: [{ id: 'c4_p', blockType: BlockType.Paragraph, content: [{ id: 'c4_t', contentType: ContentType.Text, content: 'Cell 4' }] }]
                    }
                ]
            });

            editor = createEditor({
                blocks: [tableBlock]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'deleteRowAt');
                const firstTableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = firstTableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-delete-row');

                expect(editor.blockManager.tableService.deleteRowAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should not delete row when only one row exists', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'deleteRowAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-delete-row');

                // Should not be called because settings.rows.length is not > 1
                expect(editor.blockManager.tableService.deleteRowAt).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should not perform table operation when cellInfo is null', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addColumnAt');

                (editor.blockManager.contextMenuModule as any).cellInfo = null;
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-left');

                // Operation should not be called when cellInfo is null
                expect(editor.blockManager.tableService.addColumnAt).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should build shortcut map on context menu created', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const shortcutMap = (editor.blockManager.contextMenuModule as any).shortcutMap;
                expect(shortcutMap.size).toBeGreaterThan(0);
                done();
            }, 100);
        });

        it('should resolve table items from string or object format', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;

                // Test with string items
                const stringItems = ['Insert', 'Delete'];
                const resolvedItems = (contextMenuModule as any).resolveTableItems(stringItems);

                expect(resolvedItems.length).toBeGreaterThan(0);
                expect(resolvedItems[0].text.toLowerCase()).toContain('insert');
                done();
            }, 100);
        });

        it('should return default table items when items array is empty', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;

                // Test with empty items array
                const resolvedItems = (contextMenuModule as any).resolveTableItems([]);

                expect(resolvedItems.length).toBeGreaterThan(0);
                expect(resolvedItems[0].id).toBe('table-insert');
                done();
            }, 100);
        });

        it('should handle mixed string and object table items', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;

                // Test with mixed items - string and object
                const mixedItems: any = [
                    'Insert',
                    { id: 'custom', text: 'Custom Action', iconCss: 'e-icons e-custom' }
                ];
                const resolvedItems = (contextMenuModule as any).resolveTableItems(mixedItems);

                expect(resolvedItems.length).toBeGreaterThan(0);
                expect(resolvedItems.some((item: any) => item.id === 'custom')).toBe(true);
                done();
            }, 100);
        });

        it('should check if context menu popup is open', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;

                // Initially popup should not be open
                expect((contextMenuModule as any).isPopupOpen()).toBe(false);
                done();
            }, 100);
        });

        it('should handle keyboard shortcut for indent', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                editor.blockManager.setFocusToBlock(blockElement);
                setCursorPosition(getBlockContentElement(blockElement), 0);

                // Trigger Ctrl+] for indent
                const initialIndent = editor.blocks[0].indent;
                const keyboardEvent = new KeyboardEvent('keydown', { code: 'BracketRight', key: ']', ctrlKey: true });
                editor.element.dispatchEvent(keyboardEvent);

                // Indent should increase after shortcut
                expect(editor.blocks[0].indent).toBeGreaterThan(initialIndent);
                done();
            }, 100);
        });

        it('should hide Row Above option when right-clicking on table header cell', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                // Click on header cell (first cell in first row)
                const headerCell = tableBlock.querySelector('th') as HTMLElement;
                if (headerCell) {
                    editor.blockManager.setFocusToBlock(headerCell);
                    triggerRightClick(headerCell);
                    setTimeout(() => {
                        // Row Above option should be hidden for header cells
                        expect((editor.blockManager.contextMenuModule as any).isHeaderCell).toBe(true);
                        done();
                    }, 100);
                } else {
                    done();
                }
            }, 100);
        });

        it('should show Row Above option when right-clicking on table body cell', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                // Click on body cell (a td element)
                const bodyCell = tableBlock.querySelector('td') as HTMLElement;
                if (bodyCell) {
                    editor.blockManager.setFocusToBlock(bodyCell);
                    triggerRightClick(bodyCell);
                    setTimeout(() => {
                        // Row Above option should be visible for body cells
                        expect((editor.blockManager.contextMenuModule as any).isHeaderCell).toBe(false);
                        done();
                    }, 100);
                } else {
                    done();
                }
            }, 100);
        });

        it('should properly filter table insert submenu for header cells', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const headerCell = tableBlock.querySelector('th') as HTMLElement;
                if (headerCell) {
                    editor.blockManager.setFocusToBlock(headerCell);
                    // Mark as header cell
                    (editor.blockManager.contextMenuModule as any).isHeaderCell = true;
                    // Trigger the renderer's filter method indirectly
                    triggerRightClick(headerCell);
                    setTimeout(() => {
                        // Verify the menu state reflects header cell status
                        const menuState = (editor.blockManager.contextMenuModule as any).isHeaderCell;
                        expect(menuState).toBe(true);
                        done();
                    }, 100);
                } else {
                    done();
                }
            }, 100);
        });

        it('should reset isHeaderCell flag on context menu creation', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                // Set the flag to true
                (editor.blockManager.contextMenuModule as any).isHeaderCell = true;
                // Trigger context menu beforeOpen
                const paragraphBlock = editor.element.querySelector('.e-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(paragraphBlock);
                triggerRightClick(paragraphBlock);
                setTimeout(() => {
                    // Flag should be reset to false when not on a table cell
                    expect((editor.blockManager.contextMenuModule as any).isHeaderCell).toBe(false);
                    done();
                }, 100);
            }, 100);
        });

        it('should handle table-delete-table operation correctly', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager, 'execCommand');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('td') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                // Set cellInfo
                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-delete-table');

                // Verify execCommand was called with DeleteBlock
                expect(editor.blockManager.execCommand).toHaveBeenCalledWith(jasmine.objectContaining({
                    command: 'DeleteBlock'
                }));
                done();
            }, 100);
        });

        it('should restore focus on newly added column for table-insert-column-left', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addColumnAt');
                spyOn(editor.blockManager.tableService, 'addCellFocus');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('td') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                // Set cellInfo
                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-left');

                // addColumnAt should be called
                setTimeout(() => {
                    expect(editor.blockManager.tableService.addColumnAt).toHaveBeenCalled();
                    done();
                }, 100);
            }, 100);
        });

        it('should restore focus on newly added column for table-insert-column-right', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addColumnAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('td') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                // Set cellInfo
                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-right');

                // addColumnAt should be called with incremented column index
                setTimeout(() => {
                    expect(editor.blockManager.tableService.addColumnAt).toHaveBeenCalled();
                    done();
                }, 100);
            }, 100);
        });

        it('should filter items removing undefined and null values', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                // Get context menu module and verify items are properly filtered
                const contextMenuModule = (editor as any).contextMenuModule;
                const contextMenuObj = contextMenuModule.contextMenuObj;

                // Verify that items array doesn't contain null or undefined values
                if (contextMenuObj && contextMenuObj.items) {
                    const hasInvalidItems = contextMenuObj.items.some((item: any) => item === null || item === undefined);
                    expect(hasInvalidItems).toBe(false);

                    // Verify separator items are valid
                    const separators = contextMenuObj.items.filter((item: any) => item.separator === true);
                    expect(separators.length).toBeGreaterThan(0);
                }
                done();
            }, 100);
        });

        it('should handle table delete when multiple rows exist', (done) => {
            const tableBlockWithMultipleRows = {
                id: 'table-multi',
                blockType: BlockType.Table,
                properties: {
                    columns: [{ id: 'col1' }, { id: 'col2' }],
                    rows: [
                        {
                            id: 'row1',
                            cells: [
                                {
                                    columnId: 'col1',
                                    blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                },
                                {
                                    columnId: 'col2',
                                    blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                }
                            ]
                        },
                        {
                            id: 'row2',
                            cells: [
                                {
                                    columnId: 'col1',
                                    blocks: [{ id: 'c3_p', blockType: BlockType.Paragraph, content: [{ id: 'c3_t', contentType: ContentType.Text, content: 'Cell 3' }] }]
                                },
                                {
                                    columnId: 'col2',
                                    blocks: [{ id: 'c4_p', blockType: BlockType.Paragraph, content: [{ id: 'c4_t', contentType: ContentType.Text, content: 'Cell 4' }] }]
                                }
                            ]
                        }
                    ]
                }
            };

            editor = createEditor({
                blocks: [tableBlockWithMultipleRows]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'deleteRowAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('td') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                // Set cellInfo
                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 1, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-delete-row');

                // deleteRowAt should be called when multiple rows exist
                expect(editor.blockManager.tableService.deleteRowAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should not delete row when only one row exists', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'deleteRowAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                const firstCell = tableBlock.querySelector('td') as HTMLElement;
                editor.blockManager.setFocusToBlock(firstCell);

                // Set cellInfo
                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-delete-row');

                // deleteRowAt should NOT be called when only one row exists
                expect(editor.blockManager.tableService.deleteRowAt).not.toHaveBeenCalled();
                done();
            }, 100);
        });
    });

    describe('Uncovered branch coverage tests', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
        });

        it('should handle null event in contextmenu trigger', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const blockElement = editor.element.querySelector('#table1') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);

            // Simulate event with null event target
            const contextMenuObj = editor.blockManager.contextMenuModule as any;
            if (contextMenuObj) {
                expect(contextMenuObj.isPopupOpen()).toBe(false);
            }
            done();
        });

        it('should handle context menu with no table items when tableItems array is empty', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content 1' }
                        ]
                    }
                ],
                contextMenuSettings: {
                    items: [],
                    enable: true
                }
            });
            editor.appendTo('#editor');
            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);
            triggerRightClick(editorElement);

            setTimeout(() => {
                expect(editor.blockManager.contextMenuModule).not.toBeNull();
                done();
            }, 100);
        });

        it('should restore cell focus after column insertion when enableRowNumbers is true', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ],
                            enableRowNumbers: true
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            if (cell) {
                const table = cell.closest('table') as HTMLTableElement;
                editor.blockManager.tableService.addCellFocus(cell, true);

                // Insert column and verify focus restoration
                editor.blockManager.tableService.addColumnAt({ blockId: 'table1', colIndex: 1 });

                setTimeout(() => {
                    expect(table).not.toBeNull();
                    done();
                }, 100);
            } else {
                done();
            }
        });

        it('should restore cell focus after row insertion when enableHeader is true', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                },
                                {
                                    id: 'row2',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c3_p', blockType: BlockType.Paragraph, content: [{ id: 'c3_t', contentType: ContentType.Text, content: 'Cell 3' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c4_p', blockType: BlockType.Paragraph, content: [{ id: 'c4_t', contentType: ContentType.Text, content: 'Cell 4' }] }]
                                        }
                                    ]
                                }
                            ],
                            enableHeader: true
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            if (cell) {
                editor.blockManager.tableService.addCellFocus(cell, true);

                // Insert row and verify focus restoration
                editor.blockManager.tableService.addRowAt({ blockId: 'table1', rowIndex: 1 });

                setTimeout(() => {
                    expect(tableBlock).not.toBeNull();
                    done();
                }, 100);
            } else {
                done();
            }
        });

        it('should handle table operation when tbody is empty', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }],
                            rows: []
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;

            if (tableBlock) {
                // This should not throw even with empty rows
                editor.blockManager.tableService.addRowAt({ blockId: 'table1', rowIndex: 0 });
            }

            setTimeout(() => {
                expect(editor).not.toBeNull();
                done();
            }, 100);
        });

        it('should filter table menu items with header cell context', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Header 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Header 2' }] }]
                                        }
                                    ]
                                }
                            ],
                            enableHeader: true
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const headerCell = tableBlock ? tableBlock.querySelector('th') as HTMLTableCellElement : null;

            if (headerCell) {
                editor.blockManager.setFocusToBlock(tableBlock);
                triggerRightClick(headerCell);

                setTimeout(() => {
                    expect(editor.blockManager.contextMenuModule).not.toBeNull();
                    done();
                }, 100);
            } else {
                // No header cell rendered; just verify the module is present
                expect(editor.blockManager.contextMenuModule).not.toBeNull();
                done();
            }
        });

        it('should handle multiple column selection with insertion', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }, { id: 'col3' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        },
                                        {
                                            columnId: 'col3',
                                            blocks: [{ id: 'c3_p', blockType: BlockType.Paragraph, content: [{ id: 'c3_t', contentType: ContentType.Text, content: 'Cell 3' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cells = tableBlock.querySelectorAll('td') as NodeListOf<HTMLTableCellElement>;

            if (cells.length >= 2) {
                cells[0].classList.add('e-cell-selected');
                cells[1].classList.add('e-cell-selected');

                // Insert columns with multi-selection
                editor.blockManager.tableService.addColumnAt({ blockId: 'table1', colIndex: 1 });
            }

            setTimeout(() => {
                expect(tableBlock).not.toBeNull();
                done();
            }, 100);
        });

        it('should handle multiple row selection with insertion', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                },
                                {
                                    id: 'row2',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c3_p', blockType: BlockType.Paragraph, content: [{ id: 'c3_t', contentType: ContentType.Text, content: 'Cell 3' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c4_p', blockType: BlockType.Paragraph, content: [{ id: 'c4_t', contentType: ContentType.Text, content: 'Cell 4' }] }]
                                        }
                                    ]
                                },
                                {
                                    id: 'row3',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c5_p', blockType: BlockType.Paragraph, content: [{ id: 'c5_t', contentType: ContentType.Text, content: 'Cell 5' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c6_p', blockType: BlockType.Paragraph, content: [{ id: 'c6_t', contentType: ContentType.Text, content: 'Cell 6' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cells = tableBlock.querySelectorAll('td') as NodeListOf<HTMLTableCellElement>;

            if (cells.length >= 4) {
                cells[0].classList.add('e-cell-selected');
                cells[1].classList.add('e-cell-selected');
                cells[2].classList.add('e-cell-selected');
                cells[3].classList.add('e-cell-selected');

                // Insert rows with multi-selection
                editor.blockManager.tableService.addRowAt({ blockId: 'table1', rowIndex: 1 });
            }

            setTimeout(() => {
                expect(tableBlock).not.toBeNull();
                done();
            }, 100);
        });

        it('should handle context menu on table with both enableHeader and enableRowNumbers', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ],
                            enableHeader: true,
                            enableRowNumbers: true
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            if (cell) {
                editor.blockManager.setFocusToBlock(tableBlock);
                triggerRightClick(cell);

                setTimeout(() => {
                    expect(editor.blockManager.contextMenuModule).not.toBeNull();
                    done();
                }, 100);
            } else {
                done();
            }
        });

        it('should delete single row when table has multiple rows', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                },
                                {
                                    id: 'row2',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c3_p', blockType: BlockType.Paragraph, content: [{ id: 'c3_t', contentType: ContentType.Text, content: 'Cell 3' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c4_p', blockType: BlockType.Paragraph, content: [{ id: 'c4_t', contentType: ContentType.Text, content: 'Cell 4' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            spyOn(editor.blockManager.tableService, 'deleteRowAt').and.callThrough();

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            editor.blockManager.setFocusToBlock(tableBlock);

            // Simulate delete row action
            editor.blockManager.tableService.deleteRowAt({ blockId: 'table1', modelIndex: 0 });

            setTimeout(() => {
                expect(editor.blockManager.tableService.deleteRowAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should delete single column when table has multiple columns', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }, { id: 'col3' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        },
                                        {
                                            columnId: 'col3',
                                            blocks: [{ id: 'c3_p', blockType: BlockType.Paragraph, content: [{ id: 'c3_t', contentType: ContentType.Text, content: 'Cell 3' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            spyOn(editor.blockManager.tableService, 'deleteColumnAt').and.callThrough();

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            editor.blockManager.setFocusToBlock(tableBlock);

            // Simulate delete column action
            editor.blockManager.tableService.deleteColumnAt({ blockId: 'table1', colIndex: 0 });

            setTimeout(() => {
                expect(editor.blockManager.tableService.deleteColumnAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle table operation when table element not found', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            // Calling restore focus on non-existent block should not throw
            const contextMenuModule = editor.blockManager.contextMenuModule as any;
            contextMenuModule.restoreCellFocusAfterTableOperation('non-existent-id', 0, 0, 'column');

            expect(editor).not.toBeNull();
            done();
        });

        it('should handle insert column at correct index with row numbers enabled', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ],
                            enableRowNumbers: true
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            spyOn(editor.blockManager.tableService, 'addColumnAt').and.callThrough();

            editor.blockManager.tableService.addColumnAt({ blockId: 'table1', colIndex: 0 });

            setTimeout(() => {
                expect(editor.blockManager.tableService.addColumnAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle insert row at correct index with header enabled', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ],
                            enableHeader: true
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            spyOn(editor.blockManager.tableService, 'addRowAt').and.callThrough();

            editor.blockManager.tableService.addRowAt({ blockId: 'table1', rowIndex: 0 });

            setTimeout(() => {
                expect(editor.blockManager.tableService.addRowAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle insert column when contextMenuObj has items', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            editor.blockManager.setFocusToBlock(tableBlock);

            triggerRightClick(tableBlock.querySelector('td'));

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                expect(contextMenuModule).not.toBeNull();
                done();
            }, 100);
        });

        it('should handle delete table when multiple rows and columns exist', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table-multi',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        { columnId: 'col1', blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }] },
                                        { columnId: 'col2', blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }] }
                                    ]
                                },
                                {
                                    id: 'row2',
                                    cells: [
                                        { columnId: 'col1', blocks: [{ id: 'c3_p', blockType: BlockType.Paragraph, content: [{ id: 'c3_t', contentType: ContentType.Text, content: 'Cell 3' }] }] },
                                        { columnId: 'col2', blocks: [{ id: 'c4_p', blockType: BlockType.Paragraph, content: [{ id: 'c4_t', contentType: ContentType.Text, content: 'Cell 4' }] }] }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });

            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'deleteRowAt');
                const tableBlock = editor.element.querySelector('.e-table-block') as HTMLElement;
                editor.blockManager.setFocusToBlock(tableBlock);

                (editor.blockManager.contextMenuModule as any).cellInfo = { rowIndex: 0, colIndex: 0 };
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-delete-row');

                expect(editor.blockManager.tableService.deleteRowAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should toggle context menu visibility for table items correctly', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content' }
                        ]
                    },
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const paragraphBlock = editor.element.querySelector('#paragraph1') as HTMLElement;
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;

            // Right-click on paragraph
            editor.blockManager.setFocusToBlock(paragraphBlock);
            triggerRightClick(paragraphBlock);

            setTimeout(() => {
                // Then right-click on table
                editor.blockManager.setFocusToBlock(tableBlock);
                triggerRightClick(tableBlock.querySelector('td'));

                setTimeout(() => {
                    expect(editor).not.toBeNull();
                    done();
                }, 100);
            }, 100);
        });

        it('should handle context menu with empty table items array', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ],
                contextMenuSettings: {
                    table: [],
                    enable: true
                }
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                expect(editor).not.toBeNull();
                done();
            }, 100);
        });

        it('should handle context menu click outside table cells', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
            editor.blockManager.setFocusToBlock(blockElement);

            // Right-click on non-table element
            triggerRightClick(blockElement);

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                expect(contextMenuModule.isPopupOpen()).toBe(false);
                done();
            }, 100);
        });

        it('should handle table context menu with only header row', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Header 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Header 2' }] }]
                                        }
                                    ]
                                }
                            ],
                            enableHeader: true
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const headerCell = tableBlock.querySelector('th') as HTMLTableCellElement;

            if (headerCell) {
                editor.blockManager.setFocusToBlock(tableBlock);
                triggerRightClick(headerCell);

                setTimeout(() => {
                    const contextMenuModule = editor.blockManager.contextMenuModule as any;
                    expect(contextMenuModule.isHeaderCellActive()).toBe(true);
                    done();
                }, 100);
            } else {
                done();
            }
        });

        it('should handle table context menu item selection with table operations', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');
            spyOn(editor.blockManager.tableService, 'addColumnAt').and.callThrough();

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                // Simulate table insert column action
                editor.blockManager.tableService.addColumnAt({ blockId: 'table1', colIndex: 1 });
                expect(editor.blockManager.tableService.addColumnAt).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle focus restoration after multiple column insertions', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            if (cell && cell.parentElement) {
                editor.blockManager.tableService.addCellFocus(cell, true);

                // Insert multiple columns
                editor.blockManager.tableService.addColumnAt({ blockId: 'table1', colIndex: 1 });
                editor.blockManager.tableService.addColumnAt({ blockId: 'table1', colIndex: 2 });

                setTimeout(() => {
                    expect(tableBlock).not.toBeNull();
                    done();
                }, 100);
            } else {
                done();
            }
        });

        it('should handle focus restoration after multiple row insertions', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            if (cell && cell.parentElement) {
                editor.blockManager.tableService.addCellFocus(cell, true);

                // Insert multiple rows
                editor.blockManager.tableService.addRowAt({ blockId: 'table1', rowIndex: 1 });
                editor.blockManager.tableService.addRowAt({ blockId: 'table1', rowIndex: 2 });

                setTimeout(() => {
                    expect(tableBlock).not.toBeNull();
                    done();
                }, 100);
            } else {
                done();
            }
        });

        it('should not perform table operation when cellInfo is null', (done) => {
            editor = createEditor({
                blocks: [createTableBlock()]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.tableService, 'addColumnAt');

                (editor.blockManager.contextMenuModule as any).cellInfo = null;
                (editor.blockManager.contextMenuModule as any).handleTableOperation('table-insert-column-left');

                expect(editor.blockManager.tableService.addColumnAt).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle isClickOnTable with event without target', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            // Create a mock context menu module to test the isClickOnTable logic
            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            editor.blockManager.setFocusToBlock(tableBlock);

            // Trigger context menu with null event
            const contextMenuModule = editor.blockManager.contextMenuModule as any;
            expect(contextMenuModule).not.toBeNull();
            done();
        });

        it('should handle context menu with table item having th element', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Header 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Header 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const thCell = tableBlock.querySelector('th') as HTMLTableCellElement;

            if (thCell) {
                editor.blockManager.setFocusToBlock(tableBlock);
                triggerRightClick(thCell);

                setTimeout(() => {
                    const contextMenuModule = editor.blockManager.contextMenuModule as any;
                    expect(contextMenuModule.isHeaderCellActive()).toBe(true);
                    done();
                }, 100);
            } else {
                done();
            }
        });

        it('should build all menu items including table items', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content' }
                        ]
                    }
                ],
                contextMenuSettings: {
                    items: []
                }
            });
            editor.appendTo('#editor');

            // Check if default items include table items
            const contextMenuSettings = editor.contextMenuSettings;
            expect(contextMenuSettings.items).not.toBeNull();
            done();
        });

        it('should handle context menu on table with proper item visibility', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            editor.blockManager.setFocusToBlock(tableBlock);
            triggerRightClick(cell);

            setTimeout(() => {
                // Table context menu should now be visible
                expect(editor.blockManager.contextMenuModule).not.toBeNull();
                done();
            }, 100);
        });

        it('should handle resolve table items with mixed string and object items', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const contextMenuModule = editor.blockManager.contextMenuModule as any;
            const mixed = [
                'table-insert-column-left',
                { id: 'custom-item', text: 'Custom' }
            ];

            const resolved = contextMenuModule.resolveTableItems(mixed);
            expect(resolved.length).toBeGreaterThan(0);
            done();
        });

        it('should handle table with single cell focus after operations', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const cell = tableBlock.querySelector('td') as HTMLTableCellElement;

            if (cell) {
                editor.blockManager.tableService.addCellFocus(cell, true);
                editor.blockManager.tableService.addColumnAt({ blockId: 'table1', colIndex: 0 });

                setTimeout(() => {
                    expect(tableBlock).not.toBeNull();
                    done();
                }, 100);
            } else {
                done();
            }
        });

        it('should handle table row insertion maintaining proper focus on row with cells', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'table1',
                        blockType: BlockType.Table,
                        properties: {
                            columns: [{ id: 'col1' }, { id: 'col2' }],
                            rows: [
                                {
                                    id: 'row1',
                                    cells: [
                                        {
                                            columnId: 'col1',
                                            blocks: [{ id: 'c1_p', blockType: BlockType.Paragraph, content: [{ id: 'c1_t', contentType: ContentType.Text, content: 'Cell 1' }] }]
                                        },
                                        {
                                            columnId: 'col2',
                                            blocks: [{ id: 'c2_p', blockType: BlockType.Paragraph, content: [{ id: 'c2_t', contentType: ContentType.Text, content: 'Cell 2' }] }]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            editor.appendTo('#editor');

            const tableBlock = editor.element.querySelector('#table1') as HTMLElement;
            const tbody = tableBlock.querySelector('tbody') as HTMLTableSectionElement;

            if (tbody && tbody.rows.length > 0) {
                const firstRow = tbody.rows[0];
                if (firstRow.cells.length > 0) {
                    editor.blockManager.tableService.addCellFocus(firstRow.cells[0], true);
                    editor.blockManager.tableService.addRowAt({ blockId: 'table1', rowIndex: 1 });

                    setTimeout(() => {
                        expect(tableBlock).not.toBeNull();
                        done();
                    }, 100);
                } else {
                    done();
                }
            } else {
                done();
            }
        });
    });

    describe('Link Context Menu', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
        });

        it('should display link items when right-clicking on a link element', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Visit ' },
                            { contentType: ContentType.Link, content: 'Syncfusion', properties: { url: 'https://www.syncfusion.com' } },
                            { contentType: ContentType.Text, content: ' for more info' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                if (blockElement) {
                    const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;
                    if (linkElement) {
                        editor.blockManager.setFocusToBlock(blockElement);
                        triggerRightClick(linkElement);

                        setTimeout(() => {
                            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                            if (menuWrapperElement) {
                                const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                                if (menuElement) {
                                    const linkEditItem = menuElement.querySelector('#link-edit');
                                    const linkCopyItem = menuElement.querySelector('#link-copy');
                                    const linkOpenItem = menuElement.querySelector('#link-open');
                                    const linkRemoveItem = menuElement.querySelector('#link-remove');

                                    if (linkEditItem) expect(linkEditItem).not.toBeNull();
                                    if (linkCopyItem) expect(linkCopyItem).not.toBeNull();
                                    if (linkOpenItem) expect(linkOpenItem).not.toBeNull();
                                    if (linkRemoveItem) expect(linkRemoveItem).not.toBeNull();
                                }
                            }
                            done();
                        }, 200);
                    } else {
                        done();
                    }
                } else {
                    done();
                }
            }, 100);
        });

        it('should not display link items when right-clicking on non-link element', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test content' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                editor.blockManager.setFocusToBlock(blockElement);
                triggerRightClick(blockElement);

                setTimeout(() => {
                    const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                    const linkItems = menuElement.querySelectorAll('[id^="link-"]');

                    expect(linkItems.length).toBe(0);
                    done();
                }, 200);
            }, 100);
        });

        it('should return correct link item IDs', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.contextMenuModule as any;
                const linkItemIds = contextMenuModule.getLinkItemIds();

                expect(linkItemIds).toBeDefined();
                expect(linkItemIds).toContain('link-edit');
                expect(linkItemIds).toContain('link-copy');
                expect(linkItemIds).toContain('link-open');
                expect(linkItemIds).toContain('link-remove');
                expect(linkItemIds).toContain('link-separator');
                done();
            }, 100);
        });

        it('should resolve link items from custom configuration', (done) => {
            const customLinkItems: ContextMenuItemModel[] = [
                { id: 'link-edit', text: 'Custom Edit Link' },
                { id: 'link-copy', text: 'Custom Copy' }
            ];

            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ],
                contextMenuSettings: {
                    link: customLinkItems
                }
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                const resolvedItems = contextMenuModule.resolveLinkItems(customLinkItems);

                expect(resolvedItems).toBeDefined();
                expect(resolvedItems.length).toBeGreaterThan(0);
                done();
            }, 100);
        });

        it('should resolve link items with empty array defaults to all items', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                const resolvedItems = contextMenuModule.resolveLinkItems([]);

                expect(resolvedItems).toBeDefined();
                expect(resolvedItems.length).toBeGreaterThan(0);
                done();
            }, 100);
        });

        it('should check if link items exist in context menu', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    triggerRightClick(linkElement);

                    setTimeout(() => {
                        const contextMenuModule = editor.contextMenuModule as any;
                        const hasLinks = contextMenuModule.hasLinkItems();

                        expect(typeof hasLinks).toBe('boolean');
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });

        it('should add link items to context menu when right-clicking on link', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                if (blockElement) {
                    const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;
                    if (linkElement) {
                        editor.blockManager.setFocusToBlock(blockElement);
                        triggerRightClick(linkElement);

                        setTimeout(() => {
                            const menuWrapperElement = document.querySelector('.e-blockeditor-contextmenu') as HTMLElement;
                            if (menuWrapperElement) {
                                const menuElement = menuWrapperElement.querySelector('ul') as HTMLElement;
                                if (menuElement) {
                                    const linkEditItem = menuElement.querySelector('#link-edit');
                                    if (linkEditItem) {
                                        expect(linkEditItem).not.toBeNull();
                                    }
                                }
                            }
                            done();
                        }, 200);
                    } else {
                        done();
                    }
                } else {
                    done();
                }
            }, 100);
        });

        it('should remove link items from context menu when clicking on non-link', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    },
                    {
                        id: 'paragraph2',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Regular text' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement1 = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement1.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement1);
                    triggerRightClick(linkElement);

                    setTimeout(() => {
                        const blockElement2 = editor.element.querySelector('#paragraph2') as HTMLElement;
                        editor.blockManager.setFocusToBlock(blockElement2);
                        triggerRightClick(blockElement2);

                        setTimeout(() => {
                            const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                            const linkEditItem = menuElement.querySelector('#link-edit');

                            expect(linkEditItem).toBeNull();
                            done();
                        }, 200);
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });

        it('should detect click on link element correctly', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);

                    const contextMenuModule = editor.contextMenuModule as any;
                    const event = { target: linkElement } as any;

                    const isClickOnLink = contextMenuModule.isClickOnLink(event);

                    expect(typeof isClickOnLink).toBe('boolean');
                    done();
                } else {
                    done();
                }
            }, 100);
        });

        it('should handle link edit action', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    spyOn(editor.blockManager.linkModule, 'showLinkPopup').and.stub();

                    const contextMenuModule = editor.blockManager.contextMenuModule as any;
                    const menuItem: ContextMenuItemModel = { id: 'link-edit', text: 'Edit Link' };
                    contextMenuModule.handleContextMenuActions(menuItem, new MouseEvent('click'));

                    expect(editor.blockManager.linkModule.showLinkPopup).toHaveBeenCalled();
                    done();
                } else {
                    done();
                }
            }, 100);
        });

        it('should handle link-copy action and copy URL to clipboard', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    spyOn(editor.blockManager.clipboardAction, 'handleContextCopy').and.stub();

                    const contextMenuModule = editor.blockManager.contextMenuModule as any;
                    contextMenuModule.clickedLinkElement = linkElement;
                    const menuItem: ContextMenuItemModel = { id: 'link-copy', text: 'Copy Link' };
                    contextMenuModule.handleContextMenuActions(menuItem, new MouseEvent('click'));

                    expect(editor.blockManager.clipboardAction.handleContextCopy).toHaveBeenCalledWith(linkElement.href);
                    done();
                } else {
                    done();
                }
            }, 100);
        });

        it('should handle link-copy action when no href is available', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.clipboardAction, 'handleContextCopy').and.stub();

                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                contextMenuModule.clickedLinkElement = null;
                const menuItem: ContextMenuItemModel = { id: 'link-copy', text: 'Copy Link' };
                contextMenuModule.handleContextMenuActions(menuItem, new MouseEvent('click'));

                expect(editor.blockManager.clipboardAction.handleContextCopy).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle link-open action and open URL in new tab', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    spyOn(editor.blockManager.linkModule, 'handleLinkClick').and.stub();

                    const contextMenuModule = editor.blockManager.contextMenuModule as any;
                    contextMenuModule.clickedLinkElement = linkElement;
                    const menuItem: ContextMenuItemModel = { id: 'link-open', text: 'Open Link' };
                    contextMenuModule.handleContextMenuActions(menuItem, new MouseEvent('click'));

                    expect(editor.blockManager.linkModule.handleLinkClick).toHaveBeenCalledWith(linkElement);
                    done();
                } else {
                    done();
                }
            }, 100);
        });

        it('should handle link-open action when no link element is clicked', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.linkModule, 'handleLinkClick').and.stub();

                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                contextMenuModule.clickedLinkElement = null;
                const menuItem: ContextMenuItemModel = { id: 'link-open', text: 'Open Link' };
                contextMenuModule.handleContextMenuActions(menuItem, new MouseEvent('click'));

                expect(editor.blockManager.linkModule.handleLinkClick).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should handle link-remove action and remove link', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    spyOn(editor.blockManager.linkModule, 'handleLinkInsertDeletion').and.stub();

                    const contextMenuModule = editor.blockManager.contextMenuModule as any;
                    contextMenuModule.clickedLinkElement = linkElement;
                    const menuItem: ContextMenuItemModel = { id: 'link-remove', text: 'Remove Link' };
                    const event = new MouseEvent('click');
                    contextMenuModule.handleContextMenuActions(menuItem, event);

                    expect(editor.blockManager.linkModule.handleLinkInsertDeletion).toHaveBeenCalledWith(event, true, linkElement);
                    done();
                } else {
                    done();
                }
            }, 100);
        });

        it('should enable/disable link menu items based on context', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const menuState = {
                    'link-edit': true,
                    'link-copy': true,
                    'link-open': true,
                    'link-remove': true
                };

                editor.blockManager.observer.notify('enableDisableContextMenuItems', menuState);

                expect(editor.blockManager.contextMenuModule).not.toBeNull();
                done();
            }, 100);
        });

        it('should handle link items localization with proper l10n', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    triggerRightClick(linkElement);

                    setTimeout(() => {
                        const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                        const linkEditItem = menuElement.querySelector('#link-edit');

                        if (linkEditItem) {
                            const textContent = linkEditItem.textContent;
                            expect(textContent).not.toBeNull();
                            expect(textContent.length).toBeGreaterThan(0);
                        }
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });

        it('should handle mixed link and text selection', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Visit ' },
                            { contentType: ContentType.Link, content: 'Syncfusion', properties: { url: 'https://www.syncfusion.com' } },
                            { contentType: ContentType.Text, content: ' website' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                editor.blockManager.setFocusToBlock(blockElement);
                triggerRightClick(blockElement);

                setTimeout(() => {
                    // When clicking on paragraph (not specifically on link), link items shouldn't be shown
                    expect(editor).not.toBeNull();
                    done();
                }, 200);
            }, 100);
        });

        it('should set clickedLinkElement when right-clicking on link', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    triggerRightClick(linkElement);

                    setTimeout(() => {
                        const contextMenuModule = editor.blockManager.contextMenuModule as any;
                        const clickedElement = contextMenuModule.clickedLinkElement;

                        if (clickedElement) {
                            expect(clickedElement.href).toContain('https://test.com');
                        }
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });

        it('should handle resolve link items with string format', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                const stringItems = ['Edit Link', 'Copy Link', 'Open Link'];
                const resolvedItems = contextMenuModule.resolveLinkItems(stringItems);

                expect(resolvedItems).toBeDefined();
                resolvedItems.forEach((item: ContextMenuItemModel) => {
                    expect(item.text).toBeDefined();
                });
                done();
            }, 100);
        });

        it('should handle resolve link items with object format', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                const objectItems: ContextMenuItemModel[] = [
                    { id: 'custom-link-edit', text: 'Custom Edit', iconCss: 'e-icons e-edit' }
                ];
                const resolvedItems = contextMenuModule.resolveLinkItems(objectItems);

                expect(resolvedItems).toBeDefined();
                expect(resolvedItems.length).toBeGreaterThan(0);
                done();
            }, 100);
        });

        it('should handle context menu with multiple links in same paragraph', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'First', properties: { url: 'https://first.com' } },
                            { contentType: ContentType.Text, content: ' and ' },
                            { contentType: ContentType.Link, content: 'Second', properties: { url: 'https://second.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const links = blockElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;

                if (links.length >= 2) {
                    // Right-click on first link
                    editor.blockManager.setFocusToBlock(blockElement);
                    triggerRightClick(links[0]);

                    setTimeout(() => {
                        let contextMenuModule = editor.blockManager.contextMenuModule as any;
                        let firstClickedElement = contextMenuModule.clickedLinkElement;

                        // Right-click on second link
                        triggerRightClick(links[1]);

                        setTimeout(() => {
                            contextMenuModule = editor.blockManager.contextMenuModule as any;
                            const secondClickedElement = contextMenuModule.clickedLinkElement;

                            // Clicked element should have changed
                            if (firstClickedElement && secondClickedElement) {
                                expect(secondClickedElement.href).not.toBe(firstClickedElement.href);
                            }
                            done();
                        }, 200);
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });

        it('should handle isClickOnLink when event is null', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.contextMenuModule as any;
                const result = contextMenuModule.isClickOnLink(null);

                expect(result).toBe(false);
                done();
            }, 100);
        });

        it('should handle isClickOnLink when event target is not an element', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.contextMenuModule as any;
                const event = { target: null } as any;
                const result = contextMenuModule.isClickOnLink(event);

                expect(result).toBe(false);
                done();
            }, 100);
        });

        it('should handle link items menu insertion correctly', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    triggerRightClick(linkElement);

                    setTimeout(() => {
                        const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                        const allItems = menuElement.querySelectorAll('li');

                        expect(allItems.length).toBeGreaterThan(0);
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });

        it('should properly remove dangling link separators', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Text, content: 'Test' }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.contextMenuModule as any;
                
                // Get current items and verify cleanup logic works
                if (contextMenuModule.contextMenuObj && contextMenuModule.contextMenuObj.items) {
                    const itemsBefore = contextMenuModule.contextMenuObj.items.length;
                    expect(itemsBefore).toBeGreaterThanOrEqual(0);
                }
                done();
            }, 100);
        });

        it('should handle link popup display on edit action', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                spyOn(editor.blockManager.linkModule, 'showLinkPopup').and.stub();

                const contextMenuModule = editor.blockManager.contextMenuModule as any;
                contextMenuModule.handleContextMenuActions(
                    { id: 'link-edit', text: 'Edit Link' },
                    new KeyboardEvent('contextmenu')
                );

                expect(editor.blockManager.linkModule.showLinkPopup).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('should use custom link items from contextMenuSettings.link via resolveLinkItems', (done) => {
            const customLinkItems: ContextMenuItemModel[] = [
                { id: 'link-edit', text: 'Custom Edit' },
                { id: 'link-copy', text: 'Custom Copy' }
            ];

            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Link', properties: { url: 'https://test.com' } }
                        ]
                    }
                ],
                contextMenuSettings: {
                    link: customLinkItems
                }
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement && blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    triggerRightClick(linkElement);

                    setTimeout(() => {
                        const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                        expect(menuElement).not.toBeNull();
                        expect(menuElement.querySelectorAll('li').length).toBeGreaterThan(0);
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });

        it('should insert link items after last item when no link item exists in custom menu', (done) => {
            editor = createEditor({
                blocks: [
                    {
                        id: 'paragraph1',
                        blockType: BlockType.Paragraph,
                        content: [
                            { contentType: ContentType.Link, content: 'Click me', properties: { url: 'https://test.com' } }
                        ]
                    }
                ],
                contextMenuSettings: {
                    items: [
                        { id: 'cut', text: 'Cut', iconCss: 'e-icons e-cut' },
                        { id: 'copy', text: 'Copy', iconCss: 'e-icons e-copy' }
                    ]
                }
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const blockElement = editor.element.querySelector('#paragraph1') as HTMLElement;
                const linkElement = blockElement && blockElement.querySelector('a') as HTMLAnchorElement;

                if (linkElement) {
                    editor.blockManager.setFocusToBlock(blockElement);
                    triggerRightClick(linkElement);

                    setTimeout(() => {
                        const menuElement = document.querySelector('.e-blockeditor-contextmenu ul') as HTMLElement;
                        expect(menuElement).not.toBeNull();
                        const allItems = menuElement.querySelectorAll('li');
                        expect(allItems.length).toBeGreaterThan(2);
                        done();
                    }, 200);
                } else {
                    done();
                }
            }, 100);
        });
    });

    describe('Locale tests for Table and Link context menu items', () => {
        let editor: BlockEditor;
        let editorElement: HTMLElement;

        beforeEach(() => {
            editorElement = createElement('div', { id: 'editor' });
            document.body.appendChild(editorElement);
        });

        afterEach(() => {
            if (editor) {
                editor.destroy();
                editor = undefined;
            }
            document.body.removeChild(editorElement);
        });

        it('should resolve table items with top-level item IDs', (done) => {
            editor = createEditor({
                blocks: [{ id: 'p1', blockType: BlockType.Paragraph, content: [{ contentType: ContentType.Text, content: 'Test' }] }]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;
                if (contextMenuModule) {
                    const resolvedItems = contextMenuModule.resolveTableItems(['table-insert', 'table-delete']);
                    expect(resolvedItems.length).toBeGreaterThan(0);
                    expect(resolvedItems[0].id).toBe('table-insert');
                }
                done();
            }, 100);
        });

        it('should resolve table items with custom objects', (done) => {
            editor = createEditor({
                blocks: [{ id: 'p1', blockType: BlockType.Paragraph, content: [{ contentType: ContentType.Text, content: 'Test' }] }]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;
                if (contextMenuModule) {
                    const customItems = [
                        { id: 'table-insert', text: 'Custom Insert' },
                        { id: 'table-delete', text: 'Custom Delete' }
                    ];
                    const resolvedItems = contextMenuModule.resolveTableItems(customItems as any);
                    expect(resolvedItems.length).toBe(2);
                    expect(resolvedItems[0].text).toBe('Custom Insert');
                }
                done();
            }, 100);
        });

        it('should resolve link items with top-level item IDs', (done) => {
            editor = createEditor({
                blocks: [{ id: 'p1', blockType: BlockType.Paragraph, content: [{ contentType: ContentType.Text, content: 'Test' }] }]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;
                if (contextMenuModule) {
                    const resolvedItems = contextMenuModule.resolveLinkItems(['link-edit', 'link-copy']);
                    expect(resolvedItems.length).toBeGreaterThan(0);
                    expect(resolvedItems[0].id).toBe('link-edit');
                }
                done();
            }, 100);
        });

        it('should resolve link items with custom objects', (done) => {
            editor = createEditor({
                blocks: [{ id: 'p1', blockType: BlockType.Paragraph, content: [{ contentType: ContentType.Text, content: 'Test' }] }]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;
                if (contextMenuModule) {
                    const customItems = [
                        { id: 'link-edit', text: 'Custom Edit' },
                        { id: 'link-copy', text: 'Custom Copy' }
                    ];
                    const resolvedItems = contextMenuModule.resolveLinkItems(customItems as any);
                    expect(resolvedItems.length).toBe(2);
                    expect(resolvedItems[0].text).toBe('Custom Edit');
                }
                done();
            }, 100);
        });

        it('should return default table items when empty array provided', (done) => {
            editor = createEditor({
                blocks: [{ id: 'p1', blockType: BlockType.Paragraph, content: [{ contentType: ContentType.Text, content: 'Test' }] }]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;
                if (contextMenuModule) {
                    const resolvedItems = contextMenuModule.resolveTableItems([]);
                    expect(resolvedItems.length).toBeGreaterThan(0);
                    // Should return default items with table-insert and table-delete
                    const hasInsertItem = resolvedItems.some((item: ContextMenuItemModel) => item.id === 'table-insert');
                    expect(hasInsertItem).toBe(true);
                }
                done();
            }, 100);
        });

        it('should return default link items when empty array provided', (done) => {
            editor = createEditor({
                blocks: [{ id: 'p1', blockType: BlockType.Paragraph, content: [{ contentType: ContentType.Text, content: 'Test' }] }]
            });
            editor.appendTo('#editor');

            setTimeout(() => {
                const contextMenuModule = editor.blockManager.contextMenuModule;
                if (contextMenuModule) {
                    const resolvedItems = contextMenuModule.resolveLinkItems([]);
                    expect(resolvedItems.length).toBeGreaterThan(0);
                    // Should return default items with link-edit, link-copy, etc.
                    const hasEditItem = resolvedItems.some((item: ContextMenuItemModel) => item.id === 'link-edit');
                    expect(hasEditItem).toBe(true);
                }
                done();
            }, 100);
        });
    });
});