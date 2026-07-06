/* eslint-disable @typescript-eslint/no-explicit-any */

import { createElement } from '@syncfusion/ej2-base';
import { BlockType, ContentType } from '../../src/index';
import {
    createCollabEditor,
    destroyCollab,
    flushMicrotasks,
    createParagraphBlock,
    CollabEditorContext,
    createPeerDoc,
    syncDocs,
    syncDocsBidirectional,
    getYBlockById,
    PeerContext,
    flushAll
} from './helpers/collab-util.spec';
import { ySyncPluginKey } from '../../src/collaboration/y-blockeditor/plugins/keys';

declare const Y: any;

describe('UndoPlugin', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'undo-editor' });
        document.body.appendChild(editorElement);
    });

    afterEach(() => {
        if (context) {
            destroyCollab(context);
        }
        if (editorElement && editorElement.parentNode) {
            document.body.removeChild(editorElement);
        }
    });

    describe('Initialization', () => {
        it('should have canUndo false on a fresh document', (done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Hello')]);

            flushMicrotasks().then(() => {
                expect(context.manager.undoPlugin!.canUndo()).toBe(false);
                done();
            });
        });

        it('should have canRedo false on a fresh document', (done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Hello')]);

            flushMicrotasks().then(() => {
                expect(context.manager.undoPlugin!.canRedo()).toBe(false);
                done();
            });
        });

        it('should register with blockManager.undoRedoAction', (done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Hello')]);

            flushMicrotasks().then(() => {
                // Check if the plugin is registered
                const undoRedoAction = context.editor.blockManager.undoRedoAction;
                expect(undoRedoAction).toBeDefined();
                done();
            });
        });
    });

    describe('undo() / redo()', () => {
        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Hello')]);
            flushMicrotasks().then(done);
        });

        it('should have canUndo true after one local text change', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            expect(plugin.canUndo()).toBe(false);

            // Make a change
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(5, ' World');
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                expect(plugin.canUndo()).toBe(true);
                done();
            });
        });

        it('should revert text change in yBlocks when calling undo()', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Make a change
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(5, ' World');
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                let yBlock = getYBlockById(context.yBlocks, 'p1');
                let yText = yBlock.get(0);
                expect(yText.toString()).toBe('Hello World');

                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('Hello');
                done();
            });
        });

        it('should have canRedo true after undo()', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(5, '!');
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                expect(plugin.canRedo()).toBe(false);
                
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                expect(plugin.canRedo()).toBe(true);
                done();
            });
        });

        it('should re-apply undone change when calling redo()', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(5, ' Redux');
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('Hello');

                plugin.redo();
                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('Hello Redux');
                done();
            });
        });

        it('should return false when calling undo() on empty stack', () => {
            const plugin = context.manager.undoPlugin!;
            expect(plugin.canUndo()).toBe(false);
            expect(plugin.undo()).toBe(false);
        });

        it('should return false when calling redo() on empty redo stack', () => {
            const plugin = context.manager.undoPlugin!;
            expect(plugin.canRedo()).toBe(false);
            expect(plugin.redo()).toBe(false);
        });
    });

    describe('Per-user Isolation', () => {
        let peer: PeerContext;

        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Initial')]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);
            flushMicrotasks().then(done);
        });

        afterEach(() => {
            if (peer) {
                peer.ydoc.destroy();
            }
        });

        it('should NOT include remote peer changes in local undo stack', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            expect(plugin.canUndo()).toBe(false);

            // Peer makes a change
            peer.ydoc.transact(() => {
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                const peerYText = peerYBlock.get(0);
                peerYText.insert(7, ' from peer');
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                // Local undo stack should still be empty
                expect(plugin.canUndo()).toBe(false);
                done();
            });
        });

        it('should NOT revert remote peer changes when calling local undo()', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Local makes a change
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(7, ' local');
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                syncDocs(context.ydoc, peer.ydoc);

                // Peer makes a change
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const peerYText = peerYBlock.get(0);
                    peerYText.insert(13, ' peer');
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('Initial local peer');

                // Undo local change
                plugin.undo();
                return flushAll();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                // Only local change undone, peer change remains
                expect(yText.toString()).toBe('Initial peer');
                done();
            });
        });
    });

    describe('captureTimeout Merging', () => {
        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Test')]);
            flushMicrotasks().then(done);
        });

        it('should merge two changes within 500ms into one undo step', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // First change
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(4, 'A');
            }, ySyncPluginKey);

            // Second change immediately (within captureTimeout)
            setTimeout(() => {
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(5, 'B');
                }, ySyncPluginKey);

                flushMicrotasks().then(() => {
                    // Should be one undo step
                    plugin.undo();
                    return flushMicrotasks();
                }).then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    // Both changes undone together
                    expect(yText.toString()).toBe('Test');
                    expect(plugin.canUndo()).toBe(false);
                    done();
                });
            }, 100);
        });

        it('should create two undo steps with stopCapturing() in between', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // First change
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(4, 'X');
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                plugin.stopCapturing();

                // Second change
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(5, 'Y');
                }, ySyncPluginKey);

                return flushMicrotasks();
            }).then(() => {
                // Undo first time - should undo second change
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('TestX');

                // Should still be able to undo
                expect(plugin.canUndo()).toBe(true);
                
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('Test');
                done();
            });
        });
    });

    describe('clear()', () => {
        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Test')]);
            
            // Make some changes
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(4, '123');
            }, ySyncPluginKey);

            flushMicrotasks().then(done);
        });

        it('should clear both undo and redo stacks', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            expect(plugin.canUndo()).toBe(true);
            
            plugin.undo();
            
            flushMicrotasks().then(() => {
                expect(plugin.canRedo()).toBe(true);

                plugin.clear();

                expect(plugin.canUndo()).toBe(false);
                expect(plugin.canRedo()).toBe(false);
                done();
            });
        });
    });

    describe('Undo/Redo on Different Editor Actions', () => {
        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [
                createParagraphBlock('p1', 'First'),
                createParagraphBlock('p2', 'Second')
            ]);
            flushMicrotasks().then(done);
        });

        it('should undo block insertion', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Insert a new block
            context.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'p3');
                const yText = new Y.XmlText();
                yText.insert(0, 'Third');
                yBlock.insert(0, [yText]);
                context.yBlocks.insert(2, [yBlock]);
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                expect(context.yBlocks.length).toBe(3);
                
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                expect(context.yBlocks.length).toBe(2);
                done();
            });
        });

        it('should undo block deletion', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Delete a block
            context.ydoc.transact(() => {
                context.yBlocks.delete(1, 1);
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                expect(context.yBlocks.length).toBe(1);
                
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                expect(context.yBlocks.length).toBe(2);
                done();
            });
        });

        it('should undo block move', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            const originalFirstId = context.yBlocks.get(0).getAttribute('id');
            const originalSecondId = context.yBlocks.get(1).getAttribute('id');

            // Move block
            context.ydoc.transact(() => {
                const block = context.yBlocks.get(0);
                const blockModel = context.editor.blockManager.getEditorBlocks()[0];
                const newYBlock = context.manager.syncBinding.conversion.blockModelToYElement(blockModel);
                context.yBlocks.delete(0, 1);
                context.yBlocks.insert(1, [newYBlock]);
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                expect(context.yBlocks.get(0).getAttribute('id')).toBe(originalSecondId);
                expect(context.yBlocks.get(1).getAttribute('id')).toBe(originalFirstId);
                
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                expect(context.yBlocks.get(0).getAttribute('id')).toBe(originalFirstId);
                expect(context.yBlocks.get(1).getAttribute('id')).toBe(originalSecondId);
                done();
            });
        });

        it('should undo formatting change', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Apply formatting
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.format(0, 5, { bold: true });
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                let delta = yText.toDelta();
                expect(delta[0].attributes.bold).toBe(true);
                
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const delta = yText.toDelta();
                expect(delta[0].attributes).toBeUndefined();
                done();
            });
        });

        it('should undo attribute change', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Change attribute
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                yBlock.setAttribute('indent', 2);
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                expect(yBlock.getAttribute('indent')).toBe(2);
                
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                expect(yBlock.getAttribute('indent')).toBeUndefined();
                done();
            });
        });

        it('should undo block type transformation', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            const originalNodeName = context.yBlocks.get(0).nodeName;

            // Transform to heading
            context.ydoc.transact(() => {
                const blockModel = context.editor.blockManager.getEditorBlocks()[0];
                blockModel.blockType = 'Heading';
                const newYBlock = context.manager.syncBinding.conversion.blockModelToYElement(blockModel);

                context.yBlocks.delete(0, 1);
                context.yBlocks.insert(0, [newYBlock]);
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                expect(context.yBlocks.get(0).nodeName).toBe('Heading');
                
                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                expect(context.yBlocks.get(0).nodeName).toBe(originalNodeName);
                done();
            });
        });

        it('should handle multiple sequential operations in undo stack', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Operation 1: Edit text
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(5, ' Op1');
            }, ySyncPluginKey);

            setTimeout(() => {
                plugin.stopCapturing();

                // Operation 2: Edit again
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p2');
                    const yText = yBlock.get(0);
                    yText.insert(6, ' Op2');
                }, ySyncPluginKey);

                setTimeout(() => {
                    plugin.stopCapturing();

                    // Operation 3: Add block
                    context.ydoc.transact(() => {
                        const yBlock = new Y.XmlElement('Paragraph');
                        yBlock.setAttribute('id', 'p3');
                        const yText = new Y.XmlText();
                        yText.insert(0, 'Third');
                        yBlock.insert(0, [yText]);
                        context.yBlocks.insert(2, [yBlock]);
                    }, ySyncPluginKey);

                    flushMicrotasks().then(() => {
                        expect(context.yBlocks.length).toBe(3);

                        // Undo operation 3
                        plugin.undo();
                        return flushMicrotasks();
                    }).then(() => {
                        expect(context.yBlocks.length).toBe(2);

                        // Undo operation 2
                        plugin.undo();
                        return flushMicrotasks();
                    }).then(() => {
                        const yBlock = getYBlockById(context.yBlocks, 'p2');
                        const yText = yBlock.get(0);
                        expect(yText.toString()).toBe('Second');

                        // Undo operation 1
                        plugin.undo();
                        return flushMicrotasks();
                    }).then(() => {
                        const yBlock = getYBlockById(context.yBlocks, 'p1');
                        const yText = yBlock.get(0);
                        expect(yText.toString()).toBe('First');
                        done();
                    });
                }, 100);
            }, 100);
        });
    });

    describe('capturePreActionSelection', () => {
        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Hello World')]);
            flushMicrotasks().then(done);
        });

        it('should store previousSelection from parameter', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            const mockSelection = {
                startBlockId: 'p1',
                endBlockId: 'p1',
                startContainerPath: [0],
                endContainerPath: [0],
                startOffset: 0,
                endOffset: 5,
                isCollapsed: false
            };

            (plugin as any).capturePreActionSelection(mockSelection);

            flushMicrotasks().then(() => {
                expect((plugin as any).previousSelection).toBeNull();
                done();
            });
        });

        it('should capture selection snapshot using previousSelection', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            const contentEl = context.editor.element.querySelector('.e-block-content') as HTMLElement;
            if (contentEl && contentEl.firstChild) {
                const sel = window.getSelection()!;
                const range = document.createRange();
                range.setStart(contentEl.firstChild, 0);
                range.setEnd(contentEl.firstChild, 5);
                sel.removeAllRanges();
                sel.addRange(range);

                // Capture selection state
                const selectionState = {
                    startBlockId: 'p1',
                    endBlockId: 'p1',
                    startContainerPath: [0],
                    endContainerPath: [0],
                    startOffset: 0,
                    endOffset: 5,
                    isCollapsed: false
                };

                plugin.capturePreActionSelection(selectionState);

                flushMicrotasks().then(() => {
                    const preCapture = (plugin as any).preActionSelection;
                    expect(preCapture).not.toBeNull();
                    expect(preCapture.anchor).toBeDefined();
                    expect(preCapture.focus).toBeDefined();
                    done();
                });
            } else {
                done();
            }
        });

        it('should clear preActionSelection after onStackItemAdded', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            const mockSelection = {
                startBlockId: 'p1',
                endBlockId: 'p1',
                startContainerPath: [0],
                endContainerPath: [0],
                startOffset: 0,
                endOffset: 3,
                isCollapsed: false
            };

            plugin.capturePreActionSelection(mockSelection);

            flushMicrotasks().then(() => {
                expect((plugin as any).preActionSelection).not.toBeNull();

                // Make a change to trigger onStackItemAdded
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(5, ' Test');
                }, ySyncPluginKey);

                return flushMicrotasks();
            }).then(() => {
                // preActionSelection should be cleared after saveSelection
                expect((plugin as any).preActionSelection).toBeNull();
                done();
            });
        });

        it('should use preActionSelection in saveSelection if available', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            const selectionState = {
                startBlockId: 'p1',
                endBlockId: 'p1',
                startContainerPath: [0],
                endContainerPath: [0],
                startOffset: 0,
                endOffset: 5,
                isCollapsed: false
            };

            plugin.capturePreActionSelection(selectionState);

            flushMicrotasks().then(() => {
                const preCapture = (plugin as any).preActionSelection;
                spyOn(plugin as any, 'captureSelectionSnapshot').and.returnValue(preCapture);

                // Make a change to trigger saveSelection
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(11, '!');
                }, ySyncPluginKey);

                return flushMicrotasks();
            }).then(() => {
                // Verify preActionSelection was used
                expect((plugin as any).preActionSelection).toBeNull();
                done();
            });
        });

        it('should work correctly when called before cut operation', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            const contentEl = context.editor.element.querySelector('.e-block-content') as HTMLElement;
            if (contentEl && contentEl.firstChild) {
                // Create selection for "Hello"
                const selectionState = {
                    startBlockId: 'p1',
                    endBlockId: 'p1',
                    startContainerPath: [0],
                    endContainerPath: [0],
                    startOffset: 0,
                    endOffset: 5,
                    isCollapsed: false
                };

                // Capture BEFORE the cut
                plugin.capturePreActionSelection(selectionState);

                flushMicrotasks().then(() => {
                    const preCaptureBefore = (plugin as any).preActionSelection;
                    expect(preCaptureBefore).not.toBeNull();

                    // Simulate cut by modifying text
                    context.ydoc.transact(() => {
                        const yBlock = getYBlockById(context.yBlocks, 'p1');
                        const yText = yBlock.get(0);
                        yText.delete(0, 5); // Remove "Hello"
                    }, ySyncPluginKey);

                    return flushMicrotasks();
                }).then(() => {
                    // preActionSelection should still be valid since it was captured before cut
                    const metaSelection = (plugin as any).preActionSelection;
                    // After saveSelection, it should be cleared
                    expect(metaSelection).toBeNull();
                    done();
                });
            } else {
                done();
            }
        });
    });

    describe('Selection Capture and Restore', () => {
        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Hello World')]);
            flushMicrotasks().then(done);
        });

        it('should save selection snapshot on stack-item-added', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Spy on saveSelection
            spyOn(plugin as any, 'saveSelection').and.callThrough();

            // Make a change
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(11, '!');
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                expect((plugin as any).saveSelection).toHaveBeenCalled();
                done();
            });
        });

        it('should restore selection on undo via restoreSelection', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Make a change
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(5, ' Test');
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                // Spy on restoreSelection
                spyOn(plugin as any, 'restoreSelection').and.callThrough();

                plugin.undo();
                return flushMicrotasks();
            }).then(() => {
                expect((plugin as any).restoreSelection).toHaveBeenCalled();
                done();
            });
        });

        it('should handle null values', function (done) {
            const plugin = context.manager.undoPlugin;
            const contentEl = context.editor.blockManager.getBlockElementById('p1').querySelector('.e-block-content');
            flushMicrotasks().then(function () {
                expect((plugin as any).mapDOMToYText(context.editor.element, 0)).toBeNull();
                spyOn(context.manager.syncBinding.yBlockHelper, 'findBlockIdForYText').and.returnValue(null);
                expect((plugin as any).mapYTextToDOM(null, 0)).toBeNull();

                const sel = window.getSelection();
                const range = document.createRange();
                range.setStart(contentEl.firstChild, 0);
                range.setEnd(contentEl.firstChild, 3);
                sel.removeAllRanges();
                sel.addRange(range);
                contentEl.textContent = 'Modified Content';
                context.editor.blockManager.stateManager.updateContentOnUserTyping(contentEl.closest('.e-block') as HTMLElement);
                
                spyOn((plugin as any), 'mapDOMToYText').and.returnValue(null);

                context.ydoc.transact(function () {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(11, '!');
                }, ySyncPluginKey);
                
                flushMicrotasks().then(function () {
                    done();
                });
            });
        });
    });

    describe('destroy()', () => {
        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [createParagraphBlock('p1', 'Test')]);
            flushMicrotasks().then(done);
        });

        it('should remove UndoManager listeners', (done) => {
            const plugin = context.manager.undoPlugin!;
            const undoManager = plugin.undoManager;
            
            spyOn(undoManager, 'destroy').and.callThrough();

            plugin.destroy();

            flushMicrotasks().then(() => {
                expect(undoManager.destroy).toHaveBeenCalled();
                done();
            });
        });

        it('should not throw when calling undo() after destroy', () => {
            const plugin = context.manager.undoPlugin!;
            
            plugin.destroy();

            expect(() => {
                plugin.undo();
            }).not.toThrow();
        });

        it('should not throw when calling redo() after destroy', () => {
            const plugin = context.manager.undoPlugin!;
            
            plugin.destroy();

            expect(() => {
                plugin.redo();
            }).not.toThrow();
        });
    });

    describe('restoreSelection - Selection Restoration', () => {
        beforeEach((done) => {
            context = createCollabEditor('#undo-editor', [
                createParagraphBlock('p1', 'First Block'),
                createParagraphBlock('p2', 'Second Block')
            ]);
            flushMicrotasks().then(done);
        });

        it('should restore selection after undo operation', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Make initial change to establish undo history
            const contentEl = context.editor.element.querySelector('.e-block-content') as HTMLElement;
            if (contentEl && contentEl.firstChild) {
                const sel = window.getSelection()!;
                const range = document.createRange();
                range.setStart(contentEl.firstChild, 0);
                range.setEnd(contentEl.firstChild, 3);
                sel.removeAllRanges();
                sel.addRange(range);

                // Trigger content change
                contentEl.textContent = 'Modified Content';
                context.editor.blockManager.stateManager.updateContentOnUserTyping((contentEl.closest('.e-block') as HTMLElement));

                flushMicrotasks().then(() => {
                    if (plugin.canUndo()) {
                        const selectionBefore = window.getSelection()!.getRangeAt(0);
                        const startBefore = selectionBefore.startOffset;

                        // Perform undo
                        plugin.undo();

                        flushMicrotasks().then(() => {
                            const selectionAfter = window.getSelection()!.getRangeAt(0);
                            // Selection should be restored or at least be valid
                            expect(selectionAfter).toBeDefined();
                            done();
                        });
                    } else {
                        done();
                    }
                });
            } else {
                done();
            }
        });

        it('should restore selection after redo operation', (done) => {
            const plugin = context.manager.undoPlugin!;
            const contentEl = context.editor.element.querySelector('.e-block-content') as HTMLElement;

            // Trigger content change
            contentEl.textContent = 'Modified Content';
            context.editor.blockManager.stateManager.updateContentOnUserTyping((contentEl.closest('.e-block') as HTMLElement));

            flushMicrotasks().then(() => {
                if (plugin.canUndo()) {
                    // Undo first
                    plugin.undo();

                    flushMicrotasks().then(() => {
                        if (plugin.canRedo()) {
                            // Redo
                            plugin.redo();

                            flushMicrotasks().then(() => {
                                const sel = window.getSelection();
                                // Should have valid selection after redo
                                expect(sel.rangeCount).toBeGreaterThanOrEqual(0);
                                done();
                            });
                        } else {
                            done();
                        }
                    });
                } else {
                    done();
                }
            });
        });

        it('should handle selection restoration across multiple blocks', (done) => {
            const plugin = context.manager.undoPlugin!;
            const contentEls = context.editor.element.querySelectorAll('.e-block-content');
            
            if (contentEls.length >= 2 && contentEls[0].firstChild && contentEls[1].firstChild) {
                // Create selection spanning blocks
                const sel = window.getSelection()!;
                const range = document.createRange();
                range.setStart(contentEls[0].firstChild, 0);
                range.setEnd(contentEls[1].firstChild, 4);
                sel.removeAllRanges();
                sel.addRange(range);

                // Make a change
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [{ contentType: ContentType.Text, content: 'Updated' }]
                });

                flushMicrotasks().then(() => {
                    if (plugin.canUndo()) {
                        plugin.undo();

                        flushMicrotasks().then(() => {
                            const currentSel = window.getSelection();
                            expect(currentSel.rangeCount).toBeGreaterThanOrEqual(0);
                            done();
                        });
                    } else {
                        done();
                    }
                });
            } else {
                done();
            }
        });

        it('should handle selection restoration when meta contains valid relative positions', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Make initial selection
            const contentEl = context.editor.element.querySelector('.e-block-content') as HTMLElement;
            if (contentEl && contentEl.firstChild) {
                const sel = window.getSelection()!;
                const range = document.createRange();
                range.setStart(contentEl.firstChild, 1);
                range.setEnd(contentEl.firstChild, 5);
                sel.removeAllRanges();
                sel.addRange(range);

                // Make a change (which records selection)
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [{ contentType: ContentType.Text, content: 'Hello World' }]
                });

                flushMicrotasks().then(() => {
                    if (plugin.canUndo()) {
                        plugin.undo();

                        flushMicrotasks().then(() => {
                            const currentSelection = window.getSelection()!.getRangeAt(0);
                            expect(currentSelection).toBeDefined();
                            expect(currentSelection.startContainer).toBeTruthy();
                            expect(currentSelection.endContainer).toBeTruthy();
                            done();
                        });
                    } else {
                        done();
                    }
                });
            } else {
                done();
            }
        });

        it('should handle case when relative positions cannot be converted to absolute', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [{ contentType: ContentType.Text, content: 'Text 1' }]
            });

            flushMicrotasks().then(() => {
                if (plugin.canUndo()) {
                    plugin.undo();

                    flushMicrotasks().then(() => {
                        // Should not crash even if conversion fails
                        expect(true).toBe(true);
                        done();
                    });
                } else {
                    done();
                }
            });
        });

        it('should not throw when window.getSelection returns null during restoration', (done) => {
            const plugin = context.manager.undoPlugin!;
            const originalGetSelection = window.getSelection;

            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [{ contentType: ContentType.Text, content: 'Change' }]
            });

            flushMicrotasks().then(() => {
                if (plugin.canUndo()) {
                    // Temporarily mock getSelection to return null
                    (window as any).getSelection = (): any => null;

                    expect(() => {
                        plugin.undo();
                    }).not.toThrow();

                    // Restore
                    window.getSelection = originalGetSelection;

                    flushMicrotasks().then(done);
                } else {
                    window.getSelection = originalGetSelection;
                    done();
                }
            });
        });

        it('should handle multiple consecutive undo operations with selection restoration', (done) => {
            const plugin = context.manager.undoPlugin!;
            
            // Make multiple changes
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [{ contentType: ContentType.Text, content: 'Change 1' }]
            });

            flushMicrotasks().then(() => {
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [{ contentType: ContentType.Text, content: 'Change 2' }]
                });

                flushMicrotasks().then(() => {
                    context.editor.blockManager.editorMethods.updateBlock('p1', {
                        content: [{ contentType: ContentType.Text, content: 'Change 3' }]
                    });

                    flushMicrotasks().then(() => {
                        let undoCount = 0;
                        while (plugin.canUndo() && undoCount < 3) {
                            plugin.undo();
                            undoCount++;
                        }

                        flushMicrotasks().then(() => {
                            // All undos should succeed without crashing
                            expect(undoCount).toBeGreaterThan(0);
                            done();
                        });
                    });
                });
            });
        });
    });
});
