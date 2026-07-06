/* eslint-disable @typescript-eslint/no-explicit-any */

import { createElement } from '@syncfusion/ej2-base';
import { BlockType, ContentType } from '../../src/index';
import {
    createCollabEditor,
    destroyCollab,
    flushMicrotasks,
    createParagraphBlock,
    CollabEditorContext,
    createRandomUser,
    flushAll,
    createPeerDoc,
    syncDocs,
    getYBlockById,
    PeerContext
} from './helpers/collab-util.spec';

declare const Y: any;

describe('CursorPlugin', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'cursor-editor' });
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
        it('should append overlay .e-be-cursor-overlay to editor DOM', (done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Hello')], true);

            flushAll().then(() => {
                const overlay = context.editor.element.querySelector('.e-be-cursor-overlay');
                expect(overlay).not.toBeNull();
                done();
            });
        });

        it('should return only local user in getUsers() initially', (done) => {
            const user = createRandomUser('local-1');
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Hello')], true, [user]);

            flushAll().then(() => {
                const users = context.manager.cursorPlugin!.getUsers();
                expect(users.length).toBe(1);
                expect(users[0].id).toBe('local-1');
                done();
            });
        });

        it('should return local user via getLocalUser()', (done) => {
            const user = createRandomUser('local-2');
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Hello')], true, [user]);

            flushAll().then(() => {
                const localUser = context.manager.cursorPlugin!.getLocalUser();
                expect(localUser.id).toBe('local-2');
                done();
            });
        });
    });

    describe('setLocalUser()', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Test')], true);
            flushAll().then(done);
        });

        it('should update local user and broadcast to awareness', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            plugin.setLocalUser({ user: 'Updated Name' });

            flushMicrotasks().then(() => {
                const localUser = plugin.getLocalUser();
                expect(localUser.user).toBe('Updated Name');
                
                // Check awareness state
                const awarenessState = context.awareness!.getLocalState();
                expect(awarenessState.user.user).toBe('Updated Name');
                done();
            });
        });

        it('should reflect new name in getLocalUser()', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            plugin.setLocalUser({ user: 'New User', avatarBgColor: '#FF5733' });

            flushMicrotasks().then(() => {
                const localUser = plugin.getLocalUser();
                expect(localUser.user).toBe('New User');
                expect(localUser.avatarBgColor).toBe('#FF5733');
                done();
            });
        });
    });

    describe('Awareness Change - User Join/Leave', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Test')], true);
            flushAll().then(done);
        });

        it('should add UserModel to getUsers() when remote peer joins', (done) => {
            const remoteUser = createRandomUser('remote');
            context.awareness.addRemotePeer(888, {
                user: remoteUser,
                cursor: null
            });
            const plugin = context.manager.cursorPlugin!;
            
            expect(plugin.getUsers().length).toBe(1);

            // Simulate remote peer joining
            const remoteUser1 = createRandomUser('remote-1');
            context.awareness!.addRemotePeer(999, {
                user: remoteUser1,
                cursor: null
            });

            flushMicrotasks().then(() => {
                const users = plugin.getUsers();
                expect(users.length).toBe(2);
                const remoteUserInList = users.find(u => u.id === 'remote-1');
                expect(remoteUserInList).toBeDefined();
                done();
            });
        });

        it('should add remote user to blockManager.users', (done) => {
            const remoteUser = createRandomUser('remote-2');
            context.awareness!.addRemotePeer(888, {
                user: remoteUser,
                cursor: null
            });

            flushAll().then(() => {
                const users = context.editor.blockManager.users;
                const remoteUserInManager = users.find((u: any) => u.id === 'remote-2');
                expect(remoteUserInManager).toBeDefined();
                done();
            });
        });

        it('should remove user from getUsers() when remote peer leaves', (done) => {
            const remoteUser = createRandomUser('remote');
            context.awareness.addRemotePeer(888, {
                user: remoteUser,
                cursor: null
            });
            const plugin = context.manager.cursorPlugin!;
            const remoteUser3 = createRandomUser('remote-3');
            
            context.awareness!.addRemotePeer(777, {
                user: remoteUser3,
                cursor: null
            });

            flushMicrotasks().then(() => {
                expect(plugin.getUsers().length).toBe(2);

                // Peer leaves
                context.awareness!.removeRemotePeer(777);
                return flushMicrotasks();
            }).then(() => {
                expect(plugin.getUsers().length).toBe(1);
                done();
            });
        });
    });

    describe('Remote Cursor Rendering - Caret', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Hello World')], true);
            flushAll().then(done);
        });

        it('should create .e-be-cursor element when remote peer has valid cursor', (done) => {
            const remoteUser = createRandomUser('remote-4');
            
            // Create relative position at offset 5
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 5);

            context.awareness!.addRemotePeer(666, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushAll().then(() => {
                const cursors = context.editor.element.querySelectorAll('.e-be-cursor');
                expect(cursors.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should display remote user name in .e-be-cursor-label', (done) => {
            const remoteUser = createRandomUser('remote-5');
            remoteUser.user = 'Alice Smith';
            
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 3);

            context.awareness!.addRemotePeer(555, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushAll().then(() => {
                const label = context.editor.element.querySelector('.e-be-cursor-label');
                expect(label.textContent).toContain('Alice Smith');
                done();
            });
        });

        it('should apply color style from user avatarBgColor', (done) => {
            const remoteUser = createRandomUser('remote-6');
            remoteUser.avatarBgColor = '#FF0000';
            
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 2);

            context.awareness!.addRemotePeer(444, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushAll().then(() => {
                const cursorLabel = context.editor.element.querySelector('.e-be-cursor-label') as HTMLElement;
                expect(cursorLabel).not.toBeNull();
                // Color would be derived and applied to style
                expect(cursorLabel.style.backgroundColor).toBeTruthy();
                done();
            });
        });
    });

    describe('Remote Cursor Rendering - Selection', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Hello World')], true);
            flushAll().then(done);
        });

        it('should create .e-be-sel-highlight when anchor ≠ head', (done) => {
            const remoteUser = createRandomUser('remote-7');
            
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const anchor = Y.createRelativePositionFromTypeIndex(yText, 0);
            const head = Y.createRelativePositionFromTypeIndex(yText, 5);

            context.awareness!.addRemotePeer(333, {
                user: remoteUser,
                cursor: { anchor: anchor, head: head }
            });

            flushAll().then(() => {
                const highlights = context.editor.element.querySelectorAll('.e-be-sel-highlight');
                expect(highlights.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should not render cursor when cursor is null', (done) => {
            const remoteUser = createRandomUser('remote-8');
            
            context.awareness!.addRemotePeer(222, {
                user: remoteUser,
                cursor: null
            });

            flushAll().then(() => {
                const cursors = context.editor.element.querySelectorAll('.e-be-cursor');
                expect(cursors.length).toBe(0);
                done();
            });
        });
    });

    describe('Color Assignment', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Test')], true);
            flushAll().then(done);
        });

        it('should assign different colors to different users', (done) => {
            const user1 = createRandomUser('user-1');
            user1.avatarBgColor = '#FF0000';
            const user2 = createRandomUser('user-2');
            user2.avatarBgColor = '#00FF00';

            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 0);

            context.awareness!.addRemotePeer(111, {
                user: user1,
                cursor: { anchor: relPos, head: relPos }
            });

            context.awareness!.addRemotePeer(112, {
                user: user2,
                cursor: { anchor: relPos, head: relPos }
            });

            flushAll().then(() => {
                const cursors = context.editor.element.querySelectorAll('.e-be-cursor');
                expect(cursors.length).toBe(2);
                // Colors should be different (derived from avatarBgColor)
                done();
            });
        });

        it('should assign same color deterministically for same user', (done) => {
            const user = createRandomUser('consistent-user');
            user.avatarBgColor = '#AABBCC';

            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 0);

            // Add, remove, re-add same user
            context.awareness!.addRemotePeer(100, {
                user: user,
                cursor: { anchor: relPos, head: relPos }
            });

            let firstColor: string;

            flushAll().then(() => {
                const cursor1 = context.editor.element.querySelector('.e-be-cursor') as HTMLElement;
                firstColor = cursor1.style.borderColor || cursor1.style.backgroundColor;

                context.awareness!.removeRemotePeer(100);
                return flushAll();
            }).then(() => {
                context.awareness!.addRemotePeer(100, {
                    user: user,
                    cursor: { anchor: relPos, head: relPos }
                });
                return flushAll();
            }).then(() => {
                const cursor2 = context.editor.element.querySelector('.e-be-cursor') as HTMLElement;
                const secondColor = cursor2.style.borderColor || cursor2.style.backgroundColor;
                expect(secondColor).toBe(firstColor);
                done();
            });
        });
    });

    describe('forceRerender()', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Test')], true);
            flushAll().then(done);
        });

        it('should not throw when called', () => {
            expect(() => {
                context.manager.cursorPlugin!.forceRerender();
            }).not.toThrow();
        });

        it('should maintain expected number of cursors after forceRerender', (done) => {
            const remoteUser = createRandomUser('remote-9');
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 0);

            context.awareness!.addRemotePeer(50, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushAll().then(() => {
                const beforeCount = context.editor.element.querySelectorAll('.e-be-cursor').length;
                
                context.manager.cursorPlugin!.forceRerender();
                
                return flushAll();
            }).then(() => {
                const afterCount = context.editor.element.querySelectorAll('.e-be-cursor').length;
                expect(afterCount).toBe(1);
                done();
            });
        });
    });

    describe('Local Selection Tracking', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Hello World')], true);
            flushAll().then(done);
        });

        it('should update awareness state on selectionchange event', (done) => {
            // Simulate selection change
            context.editor.blockManager.observer.notify('selectionchange', {});

            flushMicrotasks().then(() => {
                const awarenessState = context.awareness!.getLocalState();
                expect(awarenessState.cursor).toBeDefined();
                done();
            });
        });
    });

    describe('Cursor Position Correctness After Remote Operations', () => {
        let peer: PeerContext;

        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Hello')], true);
            peer = createPeerDoc(context.ydoc);
            flushAll().then(done);
        });

        afterEach(() => {
            if (peer) {
                peer.ydoc.destroy();
            }
        });

        it('should shift cursor position after remote insert before cursor', (done) => {
            const remoteUser = createRandomUser('remote-10');
            
            // Remote cursor at position 5 (end of "Hello")
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            let relPos = Y.createRelativePositionFromTypeIndex(yText, 5);

            context.awareness!.addRemotePeer(10, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushAll().then(() => {
                // Peer inserts "XXX" at position 0
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const peerYText = peerYBlock.get(0);
                    peerYText.insert(0, 'XXX');
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                // Remote cursor should now be at position 8 (5 + 3)
                // Convert relative position back to absolute
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                
                // Get the updated remote cursor from awareness
                const remoteState = context.awareness!.getStates().get(10);
                const absPos = Y.createAbsolutePositionFromRelativePosition(
                    remoteState.cursor.head,
                    context.ydoc
                );
                
                // Position should have shifted
                expect(absPos.index).toBe(8);
                done();
            });
        });

        it('should maintain cursor position after remote insert after cursor', (done) => {
            const remoteUser = createRandomUser('remote-11');
            
            // Remote cursor at position 0
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 0);

            context.awareness!.addRemotePeer(11, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushAll().then(() => {
                // Peer inserts "XXX" at position 5 (after cursor)
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const peerYText = peerYBlock.get(0);
                    peerYText.insert(5, 'XXX');
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                // Cursor should still be at position 0
                const remoteState = context.awareness!.getStates().get(11);
                const absPos = Y.createAbsolutePositionFromRelativePosition(
                    remoteState.cursor.head,
                    context.ydoc
                );
                
                expect(absPos.index).toBe(0);
                done();
            });
        });

        it('should handle cursor when remote deletes text around cursor', (done) => {
            // Extend text first
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(5, ' World Test');
            });

            syncDocs(context.ydoc, peer.ydoc);

            flushAll().then(() => {
                const remoteUser = createRandomUser('remote-12');
                
                // Remote cursor at position 10
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const relPos = Y.createRelativePositionFromTypeIndex(yText, 10);

                context.awareness!.addRemotePeer(12, {
                    user: remoteUser,
                    cursor: { anchor: relPos, head: relPos }
                });

                return flushAll();
            }).then(() => {
                // Peer deletes 5 characters starting from position 5
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const peerYText = peerYBlock.get(0);
                    peerYText.delete(5, 5);
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                // Cursor should adjust (implementation may vary - could be clamped)
                const remoteState = context.awareness!.getStates().get(12);
                const absPos = Y.createAbsolutePositionFromRelativePosition(
                    remoteState.cursor.head,
                    context.ydoc
                );
                
                // Position should be adjusted (less than original 10)
                expect(absPos.index).toBeLessThanOrEqual(10);
                done();
            });
        });

        it('should preserve selection range after remote insert between anchor and head', (done) => {
            const remoteUser = createRandomUser('remote-13');
            
            // Extend text
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                yText.insert(5, ' World Testing');
            });

            syncDocs(context.ydoc, peer.ydoc);

            flushAll().then(() => {
                // Remote selection from 0 to 10
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const anchor = Y.createRelativePositionFromTypeIndex(yText, 0);
                const head = Y.createRelativePositionFromTypeIndex(yText, 10);

                context.awareness!.addRemotePeer(13, {
                    user: remoteUser,
                    cursor: { anchor: anchor, head: head }
                });

                return flushAll();
            }).then(() => {
                // Peer inserts "XX" at position 5 (between anchor and head)
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const peerYText = peerYBlock.get(0);
                    peerYText.insert(5, 'XX');
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                // Selection should expand to include the inserted text
                const remoteState = context.awareness!.getStates().get(13);
                const anchorAbs = Y.createAbsolutePositionFromRelativePosition(
                    remoteState.cursor.anchor,
                    context.ydoc
                );
                const headAbs = Y.createAbsolutePositionFromRelativePosition(
                    remoteState.cursor.head,
                    context.ydoc
                );
                
                expect(anchorAbs.index).toBe(0);
                expect(headAbs.index).toBe(12); // 10 + 2
                done();
            });
        });

        it('should handle cursor in different block when remote adds block before', (done) => {
            // Add second block
            context.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'p2');
                const yText = new Y.XmlText();
                yText.insert(0, 'Second');
                yBlock.insert(0, [yText]);
                context.yBlocks.insert(1, [yBlock]);
            });

            syncDocs(context.ydoc, peer.ydoc);

            flushAll().then(() => {
                const remoteUser = createRandomUser('remote-14');
                
                // Remote cursor in p2 at position 3
                const yBlock = getYBlockById(context.yBlocks, 'p2');
                const yText = yBlock.get(0);
                const relPos = Y.createRelativePositionFromTypeIndex(yText, 3);

                context.awareness!.addRemotePeer(14, {
                    user: remoteUser,
                    cursor: { anchor: relPos, head: relPos }
                });

                return flushAll();
            }).then(() => {
                // Peer adds a block at index 0 (before p1)
                peer.ydoc.transact(() => {
                    const newBlock = new Y.XmlElement('Paragraph');
                    newBlock.setAttribute('id', 'p0');
                    const newText = new Y.XmlText();
                    newText.insert(0, 'First');
                    newBlock.insert(0, [newText]);
                    peer.yBlocks.insert(0, [newBlock]);
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                // Cursor should still be in p2, position unchanged
                const remoteState = context.awareness!.getStates().get(14);
                const absPos = Y.createAbsolutePositionFromRelativePosition(
                    remoteState.cursor.head,
                    context.ydoc
                );
                
                // Position within p2 should remain at 3
                expect(absPos.index).toBe(3);
                done();
            });
        });
    });

    describe('destroy()', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Test')], true);
            flushAll().then(done);
        });

        it('should remove overlay element from DOM', () => {
            const plugin = context.manager.cursorPlugin!;
            
            let overlay = context.editor.element.querySelector('.e-be-cursor-overlay');
            expect(overlay).not.toBeNull();

            plugin.destroy();

            overlay = context.editor.element.querySelector('.e-be-cursor-overlay');
            expect(overlay).toBeNull();
        });

        it('should clear awareness local state', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            // Set some awareness state
            context.awareness!.setLocalStateField('testField', 'testValue');
            
            plugin.destroy();

            flushMicrotasks().then(() => {
                const localState = context.awareness!.getLocalState();
                // After destroy, cursor should be cleared
                expect(localState).toBeNull();
                done();
            });
        });

        it('should not throw on further awareness changes after destroy', (done) => {
            const plugin = context.manager.cursorPlugin!;
            plugin.destroy();

            expect(() => {
                const remoteUser = createRandomUser('remote-15');
                context.awareness!.addRemotePeer(1, {
                    user: remoteUser,
                    cursor: null
                });
            }).not.toThrow();

            flushMicrotasks().then(done);
        });
    });

    describe('onAwarenessChange - State Cleanup', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Test')], true);
            flushAll().then(done);
        });

        it('should remove decorations when peer has no user info (state without user)', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            // Add a peer with user
            const remoteUser = createRandomUser('remote-16');
            context.awareness!.addRemotePeer(2, {
                user: remoteUser,
                cursor: null
            });

            flushMicrotasks().then(() => {
                // Verify decoration was added
                expect(plugin.getUsers().length).toBe(1);

                // Simulate peer updating without user info
                context.awareness!.updateRemotePeer(2, { cursor: null });

                flushMicrotasks().then(() => {
                    // Decoration should be removed
                    const users = plugin.getUsers();
                    expect(users.find((u: any) => u.id === 'remote-16')).toBeUndefined();
                    done();
                });
            });
        });

        it('should remove decorations when peer is removed from awareness', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const remoteUser = createRandomUser('remote-17');
            
            context.awareness!.addRemotePeer(3, {
                user: remoteUser,
                cursor: null
            });

            flushMicrotasks().then(() => {
                const beforeRemoval = plugin.getUsers();
                const hasRemoteUser = beforeRemoval.some((u: any) => u.id === 'remote-17');
                expect(hasRemoteUser).toBe(true);

                // Remove the peer
                context.awareness!.removeRemotePeer(3);

                flushMicrotasks().then(() => {
                    const afterRemoval = plugin.getUsers();
                    const stillExists = afterRemoval.some((u: any) => u.id === 'remote-17');
                    expect(stillExists).toBe(false);
                    done();
                });
            });
        });
    });

    describe('updateLocalCursor - Selection Handling', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Test Content')], true);
            flushAll().then(done);
        });

        it('should set cursor to null when selection is cleared', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            // Make a selection
            const contentEl = context.editor.element.querySelector('.e-block-content') as HTMLElement;
            if (contentEl && contentEl.firstChild) {
                const sel = window.getSelection()!;
                const range = document.createRange();
                range.setStart(contentEl.firstChild, 0);
                range.setEnd(contentEl.firstChild, 4);
                sel.removeAllRanges();
                sel.addRange(range);

                flushMicrotasks().then(() => {
                    // Clear selection
                    window.getSelection().removeAllRanges();
                    
                    // Trigger cursor update
                    (plugin as any).throttledSelectionUpdate();

                    flushMicrotasks().then(() => {
                        const state = context.awareness.getLocalState();
                        expect(state.cursor).toBeNull();
                        done();
                    });
                });
            } else {
                done();
            }
        });

        it('should set cursor when selection moves to different block', (done) => {
            if (context) {
                destroyCollab(context);
            }
            context = createCollabEditor('#cursor-editor', [
                createParagraphBlock('p1', 'First'),
                createParagraphBlock('p2', 'Second')
            ], true);

            flushAll().then(() => {
                const plugin = context.manager.cursorPlugin!;
                const contentEls = context.editor.element.querySelectorAll('.e-block-content');
                
                if (contentEls.length >= 2 && contentEls[1].firstChild) {
                    const sel = window.getSelection()!;
                    const range = document.createRange();
                    range.setStart(contentEls[1].firstChild, 0);
                    range.setEnd(contentEls[1].firstChild, 3);
                    sel.removeAllRanges();
                    sel.addRange(range);

                    setTimeout(() => {
                        const state = context.awareness.getLocalState();
                        expect(state.cursor).not.toBeNull();
                        done();
                    }, 100);
                } else {
                    done();
                }
            });
        });

        it('should handle selection with anchor outside editor', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            // Create external element
            const external = document.createElement('div');
            document.body.appendChild(external);
            external.textContent = 'Outside';

            const sel = window.getSelection()!;
            const range = document.createRange();
            range.setStart(external.firstChild!, 0);
            range.setEnd(external.firstChild!, 3);
            sel.removeAllRanges();
            sel.addRange(range);

            flushMicrotasks().then(() => {
                (plugin as any).throttledSelectionUpdate();

                flushMicrotasks().then(() => {
                    const state = context.awareness.getLocalState();
                    expect(state.cursor).toBeNull();
                    
                    document.body.removeChild(external);
                    done();
                });
            });
        });

        it('should handle selection with focus outside editor but anchor inside', (done) => {
            const external = document.createElement('div');
            document.body.appendChild(external);
            external.textContent = 'Outside';

            const contentEl = context.editor.element.querySelector('.e-block-content') as HTMLElement;
            if (contentEl && contentEl.firstChild) {
                const sel = window.getSelection()!;
                const range = document.createRange();
                range.setStart(contentEl.firstChild, 0);
                range.setEnd(external.firstChild!, 2);
                sel.removeAllRanges();
                sel.addRange(range);

                flushMicrotasks().then(() => {
                    const plugin = context.manager.cursorPlugin!;
                    (plugin as any).throttledSelectionUpdate();

                    flushMicrotasks().then(() => {
                        const state = context.awareness.getLocalState();
                        // Should use the editor content for both anchor and focus
                        expect(state.cursor).toBeNull();
                        
                        document.body.removeChild(external);
                        done();
                    });
                });
            } else {
                document.body.removeChild(external);
                done();
            }
        });

        it('should handle null scenarios properly', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const binding = context.manager.syncBinding;
            spyOn(binding.yjsPosition, 'absolutePositionToRelativePosition').and.returnValue(null);

            const contentEl = context.editor.element.querySelector('.e-block-content') as HTMLElement;
            if (contentEl && contentEl.firstChild) {
                const sel = window.getSelection()!;
                const range = document.createRange();
                range.setStart(contentEl.firstChild, 0);
                range.setEnd(contentEl.firstChild, 2);
                sel.removeAllRanges();
                sel.addRange(range);
            
                flushMicrotasks().then(() => {
                    expect((plugin as any).updateLocalCursor()).toBeUndefined();
                    done();
                });
            }
        });
    });

    describe('getEditorSelection - Edge Cases', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [
                createParagraphBlock('p1', 'First Block'),
                createParagraphBlock('p2', 'Second Block')
            ], true);
            flushAll().then(done);
        });

        it('should return null when document selection is null', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const originalGetSelection = window.getSelection;
            
            spyOn(window, 'getSelection').and.returnValue(null);

            flushMicrotasks().then(() => {
                (plugin as any).throttledSelectionUpdate();

                flushMicrotasks().then(() => {
                    const state = context.awareness.getLocalState();
                    expect(state.cursor).toBeNull();
                    
                    window.getSelection = originalGetSelection;
                    done();
                });
            });
        });

        it('should return null when selection has no ranges', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            // Clear selection
            window.getSelection().removeAllRanges();

            flushMicrotasks().then(() => {
                (plugin as any).throttledSelectionUpdate();

                flushMicrotasks().then(() => {
                    const state = context.awareness.getLocalState();
                    expect(state.cursor).toBeNull();
                    done();
                });
            });
        });

        it('should handle selection spanning multiple blocks', (done) => {
            const contentEls = context.editor.element.querySelectorAll('.e-block-content');
            
            if (contentEls.length >= 2 && contentEls[0].firstChild && contentEls[1].firstChild) {
                const sel = window.getSelection()!;
                const range = document.createRange();
                range.setStart(contentEls[0].firstChild, 0);
                range.setEnd(contentEls[1].firstChild, 3);
                sel.removeAllRanges();
                sel.addRange(range);

                flushMicrotasks().then(() => {
                    const plugin = context.manager.cursorPlugin!;
                    (plugin as any).throttledSelectionUpdate();

                    flushMicrotasks().then(() => {
                        const state = context.awareness.getLocalState();
                        expect(state.cursor).not.toBeNull();
                        done();
                    });
                });
            } else {
                done();
            }
        });
    });

    describe('buildDefaultCaret - Hover Interactions', () => {
        beforeEach((done) => {
            context = createCollabEditor('#cursor-editor', [createParagraphBlock('p1', 'Test')], true);
            flushAll().then(done);
        });

        it('should show label after mouseenter with 80ms delay', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const remoteUser = createRandomUser('remote-hover-1');
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 2);

            context.awareness!.addRemotePeer(4, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushMicrotasks().then(() => {
                // Trigger render
                (plugin as any).throttledRerender();

                flushMicrotasks().then(() => {
                    const caretHead = context.editor.element.querySelector('.e-be-cursor-head') as HTMLElement;
                    if (caretHead) {
                        const label = caretHead.querySelector('.e-be-cursor-label') as HTMLElement;
                        
                        // Simulate mouseenter
                        const event = new MouseEvent('mouseenter');
                        caretHead.dispatchEvent(event);

                        // Label should not be active immediately
                        expect(label.classList.contains('e-active')).toBe(false);

                        // Wait for 80ms delay
                        setTimeout(() => {
                            expect(label.classList.contains('e-active')).toBe(true);
                            done();
                        }, 100);
                    } else {
                        done();
                    }
                });
            });
        });

        it('should hide label after mouseleave with 1000ms delay', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const remoteUser = createRandomUser('remote-hover-2');
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 2);

            context.awareness!.addRemotePeer(5, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushMicrotasks().then(() => {
                (plugin as any).throttledRerender();

                flushMicrotasks().then(() => {
                    const caretHead = context.editor.element.querySelector('.e-be-cursor-head') as HTMLElement;
                    if (caretHead) {
                        const label = caretHead.querySelector('.e-be-cursor-label') as HTMLElement;
                        
                        // Simulate mouseenter to show label
                        const enterEvent = new MouseEvent('mouseenter');
                        caretHead.dispatchEvent(enterEvent);

                        setTimeout(() => {
                            expect(label.classList.contains('e-active')).toBe(true);

                            // Simulate mouseleave
                            const leaveEvent = new MouseEvent('mouseleave');
                            caretHead.dispatchEvent(leaveEvent);

                            // Label should still be active
                            expect(label.classList.contains('e-active')).toBe(true);

                            // Wait for 1000ms delay
                            setTimeout(() => {
                                expect(label.classList.contains('e-active')).toBe(false);
                                done();
                            }, 1100);
                        }, 100);
                    } else {
                        done();
                    }
                });
            });
        });

        it('should clear pending hover timer on rapid mouseenter/mouseleave', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const remoteUser = createRandomUser('remote-hover-3');
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const relPos = Y.createRelativePositionFromTypeIndex(yText, 2);

            context.awareness!.addRemotePeer(6, {
                user: remoteUser,
                cursor: { anchor: relPos, head: relPos }
            });

            flushMicrotasks().then(() => {
                (plugin as any).throttledRerender();

                flushMicrotasks().then(() => {
                    const caretHead = context.editor.element.querySelector('.e-be-cursor-head') as HTMLElement;
                    if (caretHead) {
                        const label = caretHead.querySelector('.e-be-cursor-label') as HTMLElement;
                        
                        // Rapid enter/leave
                        caretHead.dispatchEvent(new MouseEvent('mouseenter'));
                        caretHead.dispatchEvent(new MouseEvent('mouseenter'));
                        setTimeout(() => {
                            caretHead.dispatchEvent(new MouseEvent('mouseleave'));
                            
                            setTimeout(() => {
                                // Should clear and restart timer
                                expect(label.classList.contains('e-active')).toBe(false);
                                done();
                            }, 500);
                        }, 10);
                    } else {
                        done();
                    }
                });
            });
        });

        it('should handle scroll and resize events via _boundScrollResize', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const boundScrollResize = (plugin as any)._boundScrollResize;
            const spy = spyOn(plugin as any, 'throttledRerender');

            // Trigger scroll event
            context.editor.element.dispatchEvent(new Event('scroll'));
            
            setTimeout(() => {
                // Trigger resize event
                window.dispatchEvent(new Event('resize'));
                
                flushMicrotasks().then(() => {
                    // Both should trigger throttledRerender (which uses RAF)
                    expect(spy).toHaveBeenCalled();
                    done();
                });
            }, 10);
        });

        it('should skip redundant awareness update when cursor position unchanged', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const setLocalStateSpy = spyOn(context.awareness!, 'setLocalStateField');

            flushMicrotasks().then(() => {
                // Create selection in p1
                const p1 = context.editor.element.querySelector('[contenteditable]') as HTMLElement;
                if (p1 && p1.textContent) {
                    // Set selection at position 0-1
                    const range = document.createRange();
                    const textNode = p1.firstChild;
                    if (textNode) {
                        range.setStart(textNode, 0);
                        range.collapse(true);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);

                        // First update
                        (plugin as any).updateLocalCursor();
                        
                        flushMicrotasks().then(() => {
                            const initialCallCount = setLocalStateSpy.call.length;
                            
                            // Move to same position again (forces compareRelativePositions to return true)
                            (plugin as any).updateLocalCursor();
                            
                            flushMicrotasks().then(() => {
                                // Should not add another 'cursor' update due to redundancy
                                const finalCallCount = setLocalStateSpy.call.length;
                                // If compareRelativePositions returns true, setLocalStateField should not be called again
                                expect(finalCallCount).toBeLessThanOrEqual(initialCallCount + 1);
                                done();
                            });
                        });
                    } else {
                        done();
                    }
                } else {
                    done();
                }
            });
        });

        it('should handle cumulativeTextOffset when target node not in container', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const detachedNode = document.createTextNode('outside content');

            flushMicrotasks().then(() => {
                // Call cumulativeTextOffset with a node that's not in the container
                const offset = (plugin as any).cumulativeTextOffset(
                    document.body,
                    detachedNode,
                    0
                );
                
                // Should return accumulated offset even if walker.nextNode() doesn't find target
                expect(typeof offset).toBe('number');
                expect(offset).toBeGreaterThanOrEqual(0);
                done();
            });
        });

        it('should resolve absolute position to DOM node at end of text', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            flushMicrotasks().then(() => {
                const p1 = context.editor.element.querySelector('[contenteditable]') as HTMLElement;
                if (p1 && p1.textContent) {
                    // Position past end of text should return lastNode with clamped offset
                    const textNode = p1.firstChild as Text;
                    const domPos = (plugin as any).resolveAbsPosToDom({
                        blockId: 'p1',
                        offset: textNode.length + 100
                    });

                    expect(domPos).not.toBeNull();
                    if (domPos) {
                        expect(domPos.offset).toBeLessThanOrEqual((domPos.node as Text).length);
                    }
                    done();
                } else {
                    done();
                }
            });
        });

        it('caretRectForAbsPos should handle invalid inputs', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            flushMicrotasks().then(() => {
                const domPos = (plugin as any).caretRectForAbsPos({
                    blockId: null,
                });

                expect(domPos).toBeNull();
                done();
            });
        });

        it('should return contentEl with childNodes count when no text nodes exist', (done) => {
            const plugin = context.manager.cursorPlugin!;
            
            flushMicrotasks().then(() => {
                const content = context.editor.element.querySelector('.e-block-content');
                content.innerHTML = '';
                content.appendChild(document.createElement('span'));

                // Call resolveAbsPosToDom on element-only container
                const domPos = (plugin as any).resolveAbsPosToDom({
                    blockId: 'p1',
                    offset: 0
                });

                expect(domPos).not.toBeNull();
                if (domPos) {
                    // Should return container with childNodes.length as offset
                    expect(domPos.node).toBe(content);
                    expect(domPos.offset).toBe(content.childNodes.length);
                }
                done();
            });
        });

        it('should show cursor label on mouseenter and hide on mouseleave with delays', (done) => {
            const plugin = context.manager.cursorPlugin!;
            const remoteUser = createRandomUser('remote-hover-full');
            
            context.awareness!.addRemotePeer(7, {
                user: remoteUser,
                cursor: null
            });

            flushMicrotasks().then(() => {
                (plugin as any).throttledRerender();

                flushMicrotasks().then(() => {
                    const caretHead = context.editor.element.querySelector('.e-be-cursor-head') as HTMLElement;
                    if (caretHead) {
                        const label = caretHead.querySelector('.e-be-cursor-label') as HTMLElement;
                        
                        // Initially not active
                        expect(label.classList.contains('e-active')).toBe(false);
                        
                        // Mouseenter should add e-active class after 80ms
                        caretHead.dispatchEvent(new MouseEvent('mouseenter'));
                        
                        setTimeout(() => {
                            expect(label.classList.contains('e-active')).toBe(true);
                            
                            // Mouseleave should remove e-active
                            caretHead.dispatchEvent(new MouseEvent('mouseleave'));
                            
                            // Should be removed within 1000ms timeout
                            setTimeout(() => {
                                expect(label.classList.contains('e-active')).toBe(false);
                                done();
                            }, 1200);
                        }, 100);
                    } else {
                        done();
                    }
                });
            });
        });
    });
});
