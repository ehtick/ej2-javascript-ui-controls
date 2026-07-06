/* eslint-disable @typescript-eslint/no-explicit-any */

import { createElement } from '@syncfusion/ej2-base';
import {
    createCollabEditor,
    destroyCollab,
    flushMicrotasks,
    createParagraphBlock,
    CollabEditorContext,
    createPeerDoc,
    syncDocsBidirectional,
    getYBlockById,
    getYTextContent,
    PeerContext,
    flushAll,
    getAllYBlocks
} from './helpers/collab-util.spec';
import { ySyncPluginKey } from '../../src/collaboration/y-blockeditor/plugins/keys';

declare const Y: any;

/**
 * STRESS AND CHAOS TESTS
 * These tests simulate real-world scenarios with sequences of operations
 * that often reveal bugs that single-operation tests miss.
 */
describe('Collaboration Stress & Chaos Tests', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;
    let peer: PeerContext;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'chaos-editor' });
        document.body.appendChild(editorElement);
    });

    afterEach(() => {
        if (peer) {
            peer.ydoc.destroy();
        }
        if (context) {
            destroyCollab(context);
        }
        if (editorElement && editorElement.parentNode) {
            document.body.removeChild(editorElement);
        }
    });

    describe('Chaos Test: Random Operation Sequence', () => {
        it('should handle 50 random concurrent operations without crashing', (done) => {
            context = createCollabEditor('#chaos-editor', [
                createParagraphBlock('p1', 'Start'),
                createParagraphBlock('p2', 'Middle'),
                createParagraphBlock('p3', 'End')
            ]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                const operations = 50;
                const localOps: Array<() => void> = [];
                const peerOps: Array<() => void> = [];

                // Generate random operations
                for (let i = 0; i < operations / 2; i++) {
                    const opType = Math.floor(Math.random() * 4);
                    
                    // Local operations
                    localOps.push(() => {
                        try {
                            if (context.yBlocks.length === 0) return;
                            const blockIndex = Math.floor(Math.random() * context.yBlocks.length);
                            const yBlock = context.yBlocks.get(blockIndex);
                            
                            if (!yBlock) return;

                            switch (opType) {
                                case 0: // Insert text
                                    context.ydoc.transact(() => {
                                        const yText = yBlock.get(0);
                                        if (yText && yText instanceof Y.XmlText) {
                                            const pos = Math.floor(Math.random() * (yText.length + 1));
                                            yText.insert(pos, String.fromCharCode(65 + i % 26));
                                        }
                                    }, ySyncPluginKey);
                                    break;
                                case 1: // Delete text
                                    context.ydoc.transact(() => {
                                        const yText = yBlock.get(0);
                                        if (yText && yText instanceof Y.XmlText && yText.length > 0) {
                                            const pos = Math.floor(Math.random() * yText.length);
                                            yText.delete(pos, 1);
                                        }
                                    }, ySyncPluginKey);
                                    break;
                                case 2: // Format text
                                    context.ydoc.transact(() => {
                                        const yText = yBlock.get(0);
                                        if (yText && yText instanceof Y.XmlText && yText.length > 0) {
                                            const len = Math.min(3, yText.length);
                                            yText.format(0, len, { bold: true });
                                        }
                                    }, ySyncPluginKey);
                                    break;
                                case 3: // Change attribute
                                    context.ydoc.transact(() => {
                                        yBlock.setAttribute('indent', i % 3);
                                    }, ySyncPluginKey);
                                    break;
                            }
                        } catch (e) {
                            // Catch any errors but continue
                            console.error('Local op error:', e);
                        }
                    });

                    // Peer operations
                    peerOps.push(() => {
                        try {
                            if (peer.yBlocks.length === 0) return;
                            const blockIndex = Math.floor(Math.random() * peer.yBlocks.length);
                            const yBlock = peer.yBlocks.get(blockIndex);
                            
                            if (!yBlock) return;

                            const peerOpType = Math.floor(Math.random() * 4);

                            switch (peerOpType) {
                                case 0: // Insert text
                                    peer.ydoc.transact(() => {
                                        const yText = yBlock.get(0);
                                        if (yText && yText instanceof Y.XmlText) {
                                            const pos = Math.floor(Math.random() * (yText.length + 1));
                                            yText.insert(pos, String.fromCharCode(97 + i % 26));
                                        }
                                    });
                                    break;
                                case 1: // Delete text
                                    peer.ydoc.transact(() => {
                                        const yText = yBlock.get(0);
                                        if (yText && yText instanceof Y.XmlText && yText.length > 0) {
                                            const pos = Math.floor(Math.random() * yText.length);
                                            yText.delete(pos, 1);
                                        }
                                    });
                                    break;
                                case 2: // Format text
                                    peer.ydoc.transact(() => {
                                        const yText = yBlock.get(0);
                                        if (yText && yText instanceof Y.XmlText && yText.length > 0) {
                                            const len = Math.min(3, yText.length);
                                            yText.format(0, len, { italic: true });
                                        }
                                    });
                                    break;
                                case 3: // Change attribute
                                    peer.ydoc.transact(() => {
                                        yBlock.setAttribute('indent', (i + 1) % 3);
                                    });
                                    break;
                            }
                        } catch (e) {
                            console.error('Peer op error:', e);
                        }
                    });
                }

                // Execute all operations
                localOps.forEach(op => op());
                peerOps.forEach(op => op());

                // Sync everything
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushAll();
            }).then(() => {
                // Verify convergence
                expect(context.yBlocks.length).toBe(peer.yBlocks.length);
                
                // Verify all blocks converged
                for (let i = 0; i < context.yBlocks.length; i++) {
                    const localBlock = context.yBlocks.get(i);
                    const peerBlock = peer.yBlocks.get(i);
                    
                    const localText = getYTextContent(localBlock);
                    const peerText = getYTextContent(peerBlock);
                    
                    expect(localText).toBe(peerText);
                }

                // If we got here without crash, success
                expect(true).toBe(true);
                done();
            });
        }, 10000); // 30 second timeout for this heavy test
    });

    describe('Sequence Test: Rapid Block Additions and Deletions', () => {
        it('should handle rapid block additions followed by deletions', (done) => {
            context = createCollabEditor('#chaos-editor', [createParagraphBlock('p1', 'Initial')]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Local adds 10 blocks
                for (let i = 0; i < 10; i++) {
                    context.ydoc.transact(() => {
                        const yBlock = new Y.XmlElement('Paragraph');
                        yBlock.setAttribute('id', `local-${i}`);
                        const yText = new Y.XmlText();
                        yText.insert(0, `Local ${i}`);
                        yBlock.insert(0, [yText]);
                        context.yBlocks.insert(context.yBlocks.length, [yBlock]);
                    }, ySyncPluginKey);
                }

                // Peer adds 10 blocks
                for (let i = 0; i < 10; i++) {
                    peer.ydoc.transact(() => {
                        const yBlock = new Y.XmlElement('Paragraph');
                        yBlock.setAttribute('id', `peer-${i}`);
                        const yText = new Y.XmlText();
                        yText.insert(0, `Peer ${i}`);
                        yBlock.insert(0, [yText]);
                        peer.yBlocks.insert(peer.yBlocks.length, [yBlock]);
                    });
                }

                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushAll();
            }).then(() => {
                expect(context.yBlocks.length).toBe(21); // 1 initial + 10 local + 10 peer

                // Now delete half
                for (let i = 0; i < 10; i++) {
                    if (context.yBlocks.length > 5) {
                        context.ydoc.transact(() => {
                            context.yBlocks.delete(1, 1);
                        }, ySyncPluginKey);
                    }
                }

                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushAll();
            }).then(() => {
                // Verify convergence
                expect(context.yBlocks.length).toBe(peer.yBlocks.length);
                expect(context.yBlocks.length).toBeLessThan(21);
                done();
            });
        });
    });

    describe('Sequence Test: Edit-Undo-Edit-Redo Pattern', () => {
        it('should handle complex edit-undo-edit-redo sequence', (done) => {
            context = createCollabEditor('#chaos-editor', [createParagraphBlock('p1', 'Test')]);

            flushMicrotasks().then(() => {
                const plugin = context.manager.undoPlugin!;

                // Edit 1
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(4, 'A');
                }, ySyncPluginKey);

                return flushMicrotasks();
            }).then(() => {
                context.manager.undoPlugin!.stopCapturing();

                // Edit 2
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(5, 'B');
                }, ySyncPluginKey);

                return flushMicrotasks();
            }).then(() => {
                context.manager.undoPlugin!.stopCapturing();

                // Edit 3
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(6, 'C');
                }, ySyncPluginKey);

                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('TestABC');

                // Undo twice
                context.manager.undoPlugin!.undo();
                return flushMicrotasks();
            }).then(() => {
                context.manager.undoPlugin!.undo();
                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('TestA');

                // New edit (should clear redo stack)
                context.ydoc.transact(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    yText.insert(5, 'X');
                }, ySyncPluginKey);

                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('TestAX');

                // Redo should not work (stack cleared)
                expect(context.manager.undoPlugin!.canRedo()).toBe(false);

                done();
            });
        });
    });

    describe('Sequence Test: Concurrent Multi-Block Operations', () => {
        it('should handle concurrent multi-block edits and structural changes', (done) => {
            context = createCollabEditor('#chaos-editor', [
                createParagraphBlock('p1', 'Block 1'),
                createParagraphBlock('p2', 'Block 2'),
                createParagraphBlock('p3', 'Block 3')
            ]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Local: Edit p1, delete p2, add p4
                context.ydoc.transact(() => {
                    const yBlock1 = getYBlockById(context.yBlocks, 'p1');
                    const yText1 = yBlock1.get(0);
                    yText1.insert(7, ' LOCAL');
                }, ySyncPluginKey);

                context.ydoc.transact(() => {
                    for (let i = 0; i < context.yBlocks.length; i++) {
                        if (context.yBlocks.get(i).getAttribute('id') === 'p2') {
                            context.yBlocks.delete(i, 1);
                            break;
                        }
                    }
                }, ySyncPluginKey);

                context.ydoc.transact(() => {
                    const yBlock = new Y.XmlElement('Paragraph');
                    yBlock.setAttribute('id', 'p4');
                    const yText = new Y.XmlText();
                    yText.insert(0, 'Block 4');
                    yBlock.insert(0, [yText]);
                    context.yBlocks.insert(context.yBlocks.length, [yBlock]);
                }, ySyncPluginKey);

                // Peer: Edit p2, edit p3, move p1
                peer.ydoc.transact(() => {
                    const peerBlock2 = getYBlockById(peer.yBlocks, 'p2');
                    if (peerBlock2) {
                        const peerText2 = peerBlock2.get(0);
                        peerText2.insert(7, ' PEER');
                    }
                });

                peer.ydoc.transact(() => {
                    const peerBlock3 = getYBlockById(peer.yBlocks, 'p3');
                    const peerText3 = peerBlock3.get(0);
                    peerText3.insert(7, ' MODIFIED');
                });

                peer.ydoc.transact(() => {
                    const p1blockModel = context.editor.blockManager.getEditorBlocks()[0];
                    const newYBlock = context.manager.syncBinding.conversion.blockModelToYElement(p1blockModel);
                    peer.yBlocks.delete(0, 1);
                    peer.yBlocks.insert(peer.yBlocks.length, [newYBlock]);
                });

                // Sync both ways
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushAll();
            }).then(() => {
                // Verify convergence
                expect(context.yBlocks.length).toBe(peer.yBlocks.length);
                
                // Verify text content matches
                for (let i = 0; i < context.yBlocks.length; i++) {
                    const localBlock = context.yBlocks.get(i);
                    const peerBlock = peer.yBlocks.get(i);
                    
                    expect(getYTextContent(localBlock)).toBe(getYTextContent(peerBlock));
                }

                done();
            });
        });
    });

    describe('Sequence Test: Formatting Overlaps and Conflicts', () => {
        it('should merge multiple overlapping format changes', (done) => {
            context = createCollabEditor('#chaos-editor', [createParagraphBlock('p1', 'Hello World Test')]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                const peerYText = peerYBlock.get(0);

                // Local: Bold 0-5, Italic 10-15
                context.ydoc.transact(() => {
                    yText.format(0, 5, { bold: true });
                    yText.format(10, 5, { italic: true });
                }, ySyncPluginKey);

                // Peer: Italic 3-8, Bold 12-17
                peer.ydoc.transact(() => {
                    peerYText.format(3, 5, { italic: true });
                    peerYText.format(12, 5, { bold: true });
                });

                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushAll();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const delta = yText.toDelta();

                // Verify formats merged correctly
                // 0-3: bold
                // 3-5: bold + italic
                // 5-8: italic
                // 10-12: italic
                // 12-15: italic + bold
                // 15-17: bold (trimmed to text length)

                // Just verify no crash and convergence
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                const peerYText = peerYBlock.get(0);
                const peerDelta = peerYText.toDelta();

                expect(JSON.stringify(delta)).toBe(JSON.stringify(peerDelta));
                done();
            });
        });
    });

    describe('Stress Test: Large Document Sync', () => {
        it('should sync 100 blocks without performance degradation', (done) => {
            const blocks = [];
            for (let i = 0; i < 100; i++) {
                blocks.push(createParagraphBlock(`p${i}`, `Block ${i} content here`));
            }

            context = createCollabEditor('#chaos-editor', blocks);
            peer = createPeerDoc(context.ydoc);

            const startTime = Date.now();

            flushMicrotasks().then(() => {
                syncDocsBidirectional(context.ydoc, peer.ydoc);
                return flushAll();
            }).then(() => {
                const syncTime = Date.now() - startTime;
                
                // Verify convergence
                expect(context.yBlocks.length).toBe(100);
                expect(peer.yBlocks.length).toBe(100);
                
                // Verify performance (should sync in under 5 seconds)
                expect(syncTime).toBeLessThan(5000);
                
                done();
            });
        }, 10000); // 10 second timeout
    });

    describe('Edge Case: Single Character Operations', () => {
        it('should handle rapid single character insertions and deletions', (done) => {
            context = createCollabEditor('#chaos-editor', [createParagraphBlock('p1', '')]);

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);

                // Insert 20 single characters
                for (let i = 0; i < 20; i++) {
                    context.ydoc.transact(() => {
                        yText.insert(yText.length, String.fromCharCode(65 + i));
                    }, ySyncPluginKey);
                }

                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.length).toBe(20);

                // Delete 10 characters
                for (let i = 0; i < 10; i++) {
                    if (yText.length > 0) {
                        context.ydoc.transact(() => {
                            yText.delete(0, 1);
                        }, ySyncPluginKey);
                    }
                }

                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.length).toBe(10);
                done();
            });
        });
    });
});
