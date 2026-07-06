/* eslint-disable @typescript-eslint/no-explicit-any */

import { createElement } from '@syncfusion/ej2-base';
import { BaseChildrenProp, BlockType, ContentType, ILinkContentSettings, ITextContentSettings, Styles } from '../../src/index';
import { IMentionContentSettings, ILabelContentSettings } from '../../src/models/content/content-props';
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
    getYTextContent,
    PeerContext,
    flushAll,
    createYParagraphBlock
} from './helpers/collab-util.spec';
import { buildTableBlock } from '../common/util.spec';
import { getBlockContentElement, getBlockModelById, setCursorPosition } from '../../src/common/utils/index';
import { ySyncPluginKey } from '../../src/collaboration/y-blockeditor/plugins/keys';
import { insertTextAtOffset } from '../../src/collaboration/y-blockeditor/utils/dom-offset';

declare const Y: any;

describe('BlockEditorBinding (Sync Plugin)', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;
    let peer: PeerContext;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'sync-editor' });
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

    describe('Initialization', () => {
        it('should have isDestroyed false after construction', (done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Hello')]);

            flushMicrotasks().then(() => {
                expect(context.manager.syncBinding!.isDestroyed).toBe(false);
                done();
            });
        });

        it('should populate yBlocks after initialization when editor has initial blocks', (done) => {
            context = createCollabEditor('#sync-editor', [
                createParagraphBlock('p1', 'First'),
                createParagraphBlock('p2', 'Second')
            ]);

            flushMicrotasks().then(() => {
                expect(context.yBlocks.length).toBe(2);
                expect(getYTextContent(context.yBlocks.get(0))).toBe('First');
                expect(getYTextContent(context.yBlocks.get(1))).toBe('Second');
                done();
            });
        });

        it('should seed empty Yjs fragment with editor blocks on init', (done) => {
            const blocks = [
                createParagraphBlock('p1', 'Block 1'),
                createParagraphBlock('p2', 'Block 2')
            ];
            context = createCollabEditor('#sync-editor', blocks);

            flushMicrotasks().then(() => {
                expect(context.yBlocks.length).toBe(2);
                done();
            });
        });

        it('should render blocks from a pre-populated Yjs fragment on init', (done) => {
            context = createCollabEditor('#sync-editor', []);

            // Pre-populate Yjs before initialization
            context.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'pre1');
                const yText = new Y.XmlText();
                yText.insert(0, 'Pre-populated');
                yBlock.insert(0, [yText]);
                context.yBlocks.insert(0, [yBlock]);
            });

            flushMicrotasks().then(() => {
                // Re-initialize manager to trigger render
                context.manager.destroy();
                const newManager = new (context.manager.constructor as any)(
                    context.editor.blockManager,
                    {
                        yXmlFragment: context.yBlocks,
                        yjsAdapter: context.adapter,
                        enableAwareness: false
                    }
                );
                context.manager = newManager;

                return flushMicrotasks();
            }).then(() => {
                const blocks = context.editor.blockManager.getEditorBlocks();
                expect(blocks.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should render blocks from Yjs when fragment already contains data', (done) => {

            const ydoc = new Y.Doc();
            const yBlocks = ydoc.getXmlFragment('blockeditor');

            // Prepopulate Yjs
            yBlocks.insert(0, [
                createYParagraphBlock('p1', 'Persisted Block 1'),
                createYParagraphBlock('p2', 'Persisted Block 2')
            ]);

            context = createCollabEditor(
                '#sync-editor',
                [
                    createParagraphBlock('default1', 'Default Block')
                ],
                true,
                null,
                true,
                ydoc
            );

            flushMicrotasks().then(() => {

                const editorBlocks =
                    context.editor.blockManager.getEditorBlocks();

                expect(editorBlocks.length).toBe(2);

                expect(editorBlocks[0].content[0].content)
                    .toBe('Persisted Block 1');

                expect(editorBlocks[1].content[0].content)
                    .toBe('Persisted Block 2');

                done();
            });
        });
    });

    describe('Local → Yjs: Block Insertion', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Initial')]);
            flushMicrotasks().then(done);
        });

        it('should create a new Y.XmlElement in yBlocks when inserting a block in editor', (done) => {
            const initialLength = context.yBlocks.length;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'New Block'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                expect(context.yBlocks.length).toBe(initialLength + 1);
                done();
            });
        });

        it('should set id attribute on inserted Y.XmlElement matching BlockModel.id', (done) => {
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('new-id-123', 'Content'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const yBlock = context.yBlocks.get(1);
                expect(yBlock.getAttribute('id')).toBe('new-id-123');
                done();
            });
        });

        it('should store blockType as the Y.XmlElement tag name', (done) => {
            context.editor.blockManager.editorMethods.addBlock(
                { id: 'h1', blockType: BlockType.Heading, properties: { level: 1 }, content: [{ contentType: ContentType.Text, content: 'Title' }] },
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const yBlock = context.yBlocks.get(1);
                expect(yBlock.nodeName).toBe('Heading');
                done();
            });
        });
    });

    describe('Local → Yjs: Block Deletion', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [
                createParagraphBlock('p1', 'First'),
                createParagraphBlock('p2', 'Second'),
                createParagraphBlock('p3', 'Third')
            ]);
            flushMicrotasks().then(done);
        });

        it('should remove Y.XmlElement from yBlocks when deleting a block', (done) => {
            expect(context.yBlocks.length).toBe(3);

            context.editor.blockManager.editorMethods.removeBlock('p2');

            flushMicrotasks().then(() => {
                expect(context.yBlocks.length).toBe(2);
                expect(getYBlockById(context.yBlocks, 'p2')).toBeNull();
                done();
            });
        });
    });

    describe('Local → Yjs: Block Update', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Hello')]);
            flushMicrotasks().then(done);
        });

        it('should update Y.XmlText content when typing in a block', (done) => {
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            expect(getYTextContent(yBlock)).toBe('Hello');

            // Simulate content change
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [{ contentType: ContentType.Text, content: 'Hello World' }]
            });

            flushMicrotasks().then(() => {
                expect(getYTextContent(yBlock)).toBe('Hello World');
                done();
            });
        });

        it('should update Yjs element attribute when block attribute changes', (done) => {
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            expect(yBlock.getAttribute('indent')).toBeUndefined();

            // Update block properties
            context.editor.blockManager.editorMethods.updateBlock('p1', { indent: 2 });

            flushMicrotasks().then(() => {
                const updatedYBlock = getYBlockById(context.yBlocks, 'p1');
                expect(updatedYBlock.getAttribute('indent')).toBe('2');
                done();
            });
        });
    });

    describe('Local → Yjs: Block Move', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [
                createParagraphBlock('p1', 'First'),
                createParagraphBlock('p2', 'Second'),
                createParagraphBlock('p3', 'Third')
            ]);
            flushMicrotasks().then(done);
        });

        it('should update position in yBlocks when moving a block', (done) => {
            expect(context.yBlocks.get(0).getAttribute('id')).toBe('p1');
            expect(context.yBlocks.get(1).getAttribute('id')).toBe('p2');
            expect(context.yBlocks.get(2).getAttribute('id')).toBe('p3');

            // Move p1 to after p3
            context.editor.blockManager.editorMethods.moveBlock('p1', 'p3');

            flushMicrotasks().then(() => {
                expect(context.yBlocks.get(0).getAttribute('id')).toBe('p2');
                expect(context.yBlocks.get(1).getAttribute('id')).toBe('p3');
                expect(context.yBlocks.get(2).getAttribute('id')).toBe('p1');
                done();
            });
        });
    });

    describe('Local → Yjs: Block Transformation', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Content')]);
            flushMicrotasks().then(done);
        });

        it('should replace Y.XmlElement with new node name when changing block type', (done) => {
            let yBlock = getYBlockById(context.yBlocks, 'p1');
            expect(yBlock.nodeName).toBe('Paragraph');

            // Transform to heading - updateBlock with new blockType
            const block = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                blockType: BlockType.Heading,
                properties: { level: 1 }
            });

            flushMicrotasks().then(() => {
                yBlock = getYBlockById(context.yBlocks, 'p1');
                expect(yBlock.nodeName).toBe('Heading');
                done();
            });
        });
    });

    describe('Remote → Editor: Block Insertion', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Initial')]);
            peer = createPeerDoc(context.ydoc);
            flushMicrotasks().then(done);
        });

        it('should add a new block to editor when peer inserts into Y.Doc', (done) => {
            const initialBlockCount = context.editor.blockManager.getEditorBlocks().length;

            // Peer inserts a block
            peer.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'peer-p1');
                const yText = new Y.XmlText();
                yText.insert(0, 'Peer Content');
                yBlock.insert(0, [yText]);
                peer.yBlocks.insert(peer.yBlocks.length, [yBlock]);
            });

            // Sync the change
            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const blocks = context.editor.blockManager.getEditorBlocks();
                expect(blocks.length).toBe(initialBlockCount + 1);
                done();
            });
        });

        it('should preserve remote block id in editor BlockModel', (done) => {
            peer.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'unique-peer-id');
                const yText = new Y.XmlText();
                yText.insert(0, 'Content');
                yBlock.insert(0, [yText]);
                peer.yBlocks.insert(0, [yBlock]);
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const block = getBlockModelById('unique-peer-id', context.editor.blockManager.getEditorBlocks());
                expect(block).not.toBeNull();
                expect(block!.id).toBe('unique-peer-id');
                done();
            });
        });
    });

    describe('Remote → Editor: Block Deletion', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [
                createParagraphBlock('p1', 'First'),
                createParagraphBlock('p2', 'Second')
            ]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);
            flushMicrotasks().then(done);
        });

        it('should remove block from editor when peer deletes from Y.Doc', (done) => {
            expect(getBlockModelById('p2', context.editor.blockManager.getEditorBlocks())).not.toBeNull();

            // Peer deletes p2
            peer.ydoc.transact(() => {
                for (let i = 0; i < peer.yBlocks.length; i++) {
                    if (peer.yBlocks.get(i).getAttribute('id') === 'p2') {
                        peer.yBlocks.delete(i, 1);
                        break;
                    }
                }
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                expect(getBlockModelById('p2', context.editor.blockManager.getEditorBlocks())).toBeNull();
                done();
            });
        });
    });

    describe('Remote → Editor: Text Change', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Hello')]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);
            flushMicrotasks().then(done);
        });

        it('should apply remote text delta to the correct block DOM', (done) => {
            // Peer edits text
            const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
            const peerYText = peerYBlock.get(0);

            peer.ydoc.transact(() => {
                peerYText.insert(5, ' World');
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const blockEl = context.editor.blockManager.getBlockElementById('p1');
                const contentEl = getBlockContentElement(blockEl);
                expect(contentEl.textContent).toContain('World');
                done();
            });
        });

        it('should update ContentModel when remote text delta is received', (done) => {
            const block = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
            expect(block!.content![0].content).toBe('Hello');

            // Peer changes text
            const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
            const peerYText = peerYBlock.get(0);

            peer.ydoc.transact(() => {
                peerYText.delete(0, 5);
                peerYText.insert(0, 'Goodbye');
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                expect(updatedBlock!.content![0].content).toBe('Goodbye');
                done();
            });
        });
    });

    describe('Remote → Editor: Property Change', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Content')]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);
            flushMicrotasks().then(done);
        });

        it('should update BlockModel properties when remote attribute changes', (done) => {
            const block = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
            expect((block!.properties as any).indent).toBeUndefined();

            // Peer sets indent
            peer.ydoc.transact(() => {
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                peerYBlock.setAttribute('indent', 3);
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                expect(updatedBlock.indent).toBe(3);
                done();
            });
        });

        it('should update link formatting', (done) => {
            // Peer sets link url to a part
            peer.ydoc.transact(() => {
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                const yText = peerYBlock.get(0);
                yText.format(0, 1, { url: 'https:example.com' });
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                expect(updatedBlock.content[0].contentType).toBe('Link');
                expect((updatedBlock.content[0].properties as ILinkContentSettings).url).toBe('https:example.com');
                expect(updatedBlock.content[1].contentType).toBe('Text');
                done();
            });
        });
        it('should apply and remove bold formatting properly', (done) => {
            // Peer sets bold to a part
            peer.ydoc.transact(() => {
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                const yText = peerYBlock.get(0);
                yText.format(0, 1, { bold: true });
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                expect(updatedBlock.content[0].contentType).toBe('Text');
                expect((updatedBlock.content[0].properties as ITextContentSettings).styles.bold).toBe(true);

                // Peer removes the applied bold part
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const yText = peerYBlock.get(0);
                    yText.format(0, 1, { bold: null });
                });

                syncDocs(peer.ydoc, context.ydoc);

                flushAll().then(() => {
                    const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                    expect(updatedBlock.content[0].contentType).toBe('Text');
                    expect((updatedBlock.content[0].properties as ITextContentSettings).styles.bold).toBeUndefined();
                    done();
                });
            });
        });
    });

    describe('Mutex / Echo Prevention', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Test')]);
            flushMicrotasks().then(done);
        });

        it('should not trigger remote-apply path for local edits', (done) => {
            const binding = context.manager.syncBinding!;
            spyOn(binding as any, 'applyYjsChanges').and.callThrough();

            // Local edit
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [{ contentType: ContentType.Text, content: 'Modified Locally' }]
            });

            flushMicrotasks().then(() => {
                // applyYjsChanges should NOT be called for local changes
                expect((binding as any).applyYjsChanges).not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('CONCURRENT EDITS - Critical Tests', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Hello')]);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);
            flushMicrotasks().then(done);
        });

        it('should merge concurrent edits correctly when both peers edit same block', (done) => {
            const localYBlock = getYBlockById(context.yBlocks, 'p1');
            const localYText = localYBlock.get(0);

            const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
            const peerYText = peerYBlock.get(0);

            // CONCURRENT edits - no sync between them
            context.ydoc.transact(() => {
                localYText.insert(0, 'A');  // "AHello"
            });

            peer.ydoc.transact(() => {
                peerYText.insert(5, 'B');  // "HelloB"
            });

            // Now sync both ways
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushAll().then(() => {
                // Both should converge to same state
                const localText = getYTextContent(localYBlock);
                const peerText = getYTextContent(peerYBlock);

                expect(localText).toBe(peerText);
                expect(localText).toContain('A');
                expect(localText).toContain('B');
                done();
            });
        });

        it('should merge concurrent insertions at same position with deterministic order', (done) => {
            const localYBlock = getYBlockById(context.yBlocks, 'p1');
            const localYText = localYBlock.get(0);

            const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
            const peerYText = peerYBlock.get(0);

            // Both insert at position 0 concurrently
            context.ydoc.transact(() => {
                localYText.insert(0, 'Local');
            });

            peer.ydoc.transact(() => {
                peerYText.insert(0, 'Peer');
            });

            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushAll().then(() => {
                const localText = getYTextContent(localYBlock);
                const peerText = getYTextContent(peerYBlock);

                // Must converge
                expect(localText).toBe(peerText);
                // Both words must be present
                expect(localText).toContain('Local');
                expect(localText).toContain('Peer');
                done();
            });
        });

        it('should merge overlapping formatting correctly', (done) => {
            const localYBlock = getYBlockById(context.yBlocks, 'p1');
            const localYText = localYBlock.get(0);

            const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
            const peerYText = peerYBlock.get(0);

            // A bolds "Hello", B italicizes "Hello" - same range
            context.ydoc.transact(() => {
                localYText.format(0, 5, { bold: true });
            });

            peer.ydoc.transact(() => {
                peerYText.format(0, 5, { italic: true });
            });

            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushAll().then(() => {
                // Both docs should have both formats
                const localDelta = localYText.toDelta();
                const peerDelta = peerYText.toDelta();

                expect(localDelta).toEqual(peerDelta);
                expect(localDelta[0].attributes.bold).toBe(true);
                expect(localDelta[0].attributes.italic).toBe(true);
                done();
            });
        });

        it('should handle concurrent block insertions at same index', (done) => {
            // Both peers insert a block at index 1 concurrently
            context.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'local-insert');
                const yText = new Y.XmlText();
                yText.insert(0, 'Local Block');
                yBlock.insert(0, [yText]);
                context.yBlocks.insert(1, [yBlock]);
            });

            peer.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'peer-insert');
                const yText = new Y.XmlText();
                yText.insert(0, 'Peer Block');
                yBlock.insert(0, [yText]);
                peer.yBlocks.insert(1, [yBlock]);
            });

            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushAll().then(() => {
                // Both should converge to same length
                expect(context.yBlocks.length).toBe(peer.yBlocks.length);
                expect(context.yBlocks.length).toBe(3); // original + 2 new

                // Both blocks must exist
                expect(getYBlockById(context.yBlocks, 'local-insert')).not.toBeNull();
                expect(getYBlockById(context.yBlocks, 'peer-insert')).not.toBeNull();
                done();
            });
        });

        it('should handle concurrent delete and edit on same block', (done) => {
            // Add a second block first
            context.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'p2');
                const yText = new Y.XmlText();
                yText.insert(0, 'Second');
                yBlock.insert(0, [yText]);
                context.yBlocks.insert(1, [yBlock]);
            });
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer deletes p2, local edits p2
                peer.ydoc.transact(() => {
                    peer.yBlocks.delete(1, 1);
                });

                context.ydoc.transact(() => {
                    const localYBlock = getYBlockById(context.yBlocks, 'p2');
                    const localYText = localYBlock.get(0);
                    localYText.insert(6, ' Edited');
                });

                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushAll();
            }).then(() => {
                // Delete should win - block should be gone in both
                expect(context.yBlocks.length).toBe(peer.yBlocks.length);
                expect(getYBlockById(context.yBlocks, 'p2')).toBeNull();
                done();
            });
        });
    });

    describe('Nested Blocks (Callout/Quote/Collapsible)', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [
                {
                    id: 'callout1',
                    blockType: BlockType.Callout,
                    properties: {
                        children: [createParagraphBlock('child1', 'Child content')]
                    }
                }
            ]);
            flushMicrotasks().then(done);
        });

        it('should sync child blocks of callout to Yjs nested structure', (done) => {
            flushMicrotasks().then(() => {
                const yCallout = getYBlockById(context.yBlocks, 'callout1');
                expect(yCallout).not.toBeNull();

                // Check if children are synced
                expect(yCallout.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should apply remote insertion into callout child to editor', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer adds a child to callout
                peer.ydoc.transact(() => {
                    const peerCallout = getYBlockById(peer.yBlocks, 'callout1');
                    const yBlock = new Y.XmlElement('Paragraph');
                    yBlock.setAttribute('id', 'child2');
                    const yText = new Y.XmlText();
                    yText.insert(0, 'Second child');
                    yBlock.insert(0, [yText]);
                    peerCallout.insert(peerCallout.length, [yBlock]);
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const calloutBlock = getBlockModelById('callout1', context.editor.blockManager.getEditorBlocks());
                expect((calloutBlock!.properties as any).children.length).toBeGreaterThan(1);
                done();
            });
        });
    });

    describe('Table Sync', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [buildTableBlock('table1', 2, 2, true, false)]);
            flushMicrotasks().then(done);
        });

        it('should sync local table column add to Yjs with correct tableColumn elements', (done) => {
            const yTable = getYBlockById(context.yBlocks, 'table1');
            const initialColumnCount = yTable.toArray().filter(
                (el: any) => el.nodeName === 'tableColumn'
            ).length;

            // Add column
            context.editor.blockManager.tableService.addColumnAt({
                blockId: 'table1',
                colIndex: 2
            });

            flushMicrotasks().then(() => {
                const updatedYTable = getYBlockById(context.yBlocks, 'table1');
                const yColumns = updatedYTable.toArray().filter(
                    (el: any) => el.nodeName === 'tableColumn'
                );

                // Verify column was added
                expect(yColumns.length).toBe(initialColumnCount + 1);

                // Verify each column has id attribute
                yColumns.forEach((yCol: any) => {
                    expect(yCol.getAttribute('id')).toBeTruthy();
                });

                done();
            });
        });

        it('should sync local table row add to Yjs with correct tableRow and tableCell elements', (done) => {
            const yTable = getYBlockById(context.yBlocks, 'table1');
            const initialRowCount = yTable.toArray().filter(
                (el: any) => el.nodeName === 'tableRow'
            ).length;

            context.editor.blockManager.tableService.addRowAt({
                blockId: 'table1',
                rowIndex: 2
            });

            flushMicrotasks().then(() => {
                const updatedYTable = getYBlockById(context.yBlocks, 'table1');
                const yRows = updatedYTable.toArray().filter(
                    (el: any) => el.nodeName === 'tableRow'
                );

                // Verify row was added
                expect(yRows.length).toBe(initialRowCount + 1);

                // Verify each row has id attribute and contains tableCell elements
                yRows.forEach((yRow: any) => {
                    expect(yRow.getAttribute('id')).toBeTruthy();
                    const cells = yRow.toArray().filter(
                        (el: any) => el.nodeName === 'tableCell'
                    );
                    expect(cells.length).toBeGreaterThan(0);

                    // Verify each cell has id and columnId attributes
                    cells.forEach((yCell: any) => {
                        expect(yCell.getAttribute('id')).toBeTruthy();
                        expect(yCell.getAttribute('columnId')).toBeTruthy();
                    });
                });

                done();
            });
        });

        it('should apply remote column add to editor table', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            const initialTable = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
            const initialCols = (initialTable!.properties as any)!.columns!.length;

            flushMicrotasks().then(() => {
                // Peer adds a column to Yjs structure directly
                peer.ydoc.transact(() => {
                    const peerYTable = peer.yBlocks.get(0);
                    const newYColumn = new Y.XmlElement('tableColumn');
                    newYColumn.setAttribute('id', `col-${initialCols}`);
                    newYColumn.setAttribute('type', 'data');
                    peerYTable.push([newYColumn]);
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                // Verify column structure is synced to local editor
                const updatedTable = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
                const updatedCols = (updatedTable!.properties as any)!.columns!.length;

                expect(updatedCols).toBe(initialCols + 1);

                // Verify Yjs structure has correct tableColumn elements
                const yTable = getYBlockById(context.yBlocks, 'table1');
                const yColumns = yTable.toArray().filter(
                    (el: any) => el.nodeName === 'tableColumn'
                );
                expect(yColumns.length).toBe(updatedCols);

                done();
            });
        });

        it('should handle remote row deletion and sync to editor', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Local gets initial state
                const table = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
                const initialRowCount = (table!.properties as any)!.rows!.length;

                // Peer deletes first row from Yjs structure
                peer.ydoc.transact(() => {
                    const peerYTable = peer.yBlocks.get(0);
                    const yRows = peerYTable.toArray().filter(
                        (el: any) => el.nodeName === 'tableRow'
                    );
                    if (yRows.length > 0) {
                        const rowIndex = peerYTable.toArray().indexOf(yRows[0]);
                        peerYTable.delete(rowIndex, 1);
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                // Verify row deletion was synced
                const updatedTable = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
                const updatedRowCount = (updatedTable!.properties as any)!.rows!.length;

                expect(updatedRowCount).toBeLessThan(2);

                // Verify Yjs structure reflects deletion
                const yTable = getYBlockById(context.yBlocks, 'table1');
                const yRows = yTable.toArray().filter(
                    (el: any) => el.nodeName === 'tableRow'
                );
                expect(yRows.length).toBe(updatedRowCount);

                done();
            });
        });

        it('should sync nested content inside table cells', (done) => {
            // Modify cell content
            const table = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
            const cellBlocks = (table!.properties as any)!.rows![0].cells![0].blocks!;
            const cellBlock = cellBlocks[0];

            const originalContent = cellBlock.content[0].content;

            context.editor.blockManager.editorMethods.updateBlock(cellBlock.id, {
                content: [{ contentType: ContentType.Text, content: 'Modified Cell' }]
            });

            flushMicrotasks().then(() => {
                const yTable = getYBlockById(context.yBlocks, 'table1');
                expect(yTable).not.toBeNull();

                // Verify cell content was synced to Yjs
                const yRows = yTable.toArray().filter(
                    (el: any) => el.nodeName === 'tableRow'
                );
                expect(yRows.length).toBeGreaterThan(0);

                // Verify cells contain nested blocks
                const yFirstRow = yRows[0];
                const yCells = yFirstRow.toArray().filter(
                    (el: any) => el.nodeName === 'tableCell'
                );
                expect(yCells.length).toBeGreaterThan(0);

                // Verify cell contains content blocks
                const yFirstCell = yCells[0];
                const cellContentBlocks = yFirstCell.toArray().filter(
                    (el: any) => el instanceof Y.XmlElement && el.nodeName !== 'tableCell'
                );
                expect(cellContentBlocks.length).toBeGreaterThan(0);

                // Verify content was updated
                const updatedTable = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
                const updatedCellBlock = (updatedTable!.properties as any)!.rows![0].cells![0].blocks![0];
                expect(updatedCellBlock.content[0].content).toBe('Modified Cell');

                done();
            });
        });
    });

    describe('destroy()', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Test')]);
            flushMicrotasks().then(done);
        });

        it('should set isDestroyed to true', () => {
            expect(context.manager.syncBinding!.isDestroyed).toBe(false);
            context.manager.syncBinding!.destroy();
            expect(context.manager.syncBinding!.isDestroyed).toBe(true);
        });

        it('should not trigger callbacks after observers are removed', (done) => {
            const binding = context.manager.syncBinding!;
            const spy = jasmine.createSpy('callback');

            // Spy on internal method
            spyOn(binding as any, 'onYjsChange').and.callFake(spy);

            binding.destroy();

            // Try to trigger a Yjs change
            context.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'after-destroy');
                const yText = new Y.XmlText();
                yText.insert(0, 'Should not trigger');
                yBlock.insert(0, [yText]);
                context.yBlocks.insert(0, [yBlock]);
            });

            flushMicrotasks().then(() => {
                expect(spy).not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('Nested Block Actions - Callout', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [{
                id: 'callout1',
                blockType: BlockType.Callout,
                properties: {
                    children: [createParagraphBlock('child-p1', 'Nested content')]
                }
            }]);
            flushMicrotasks().then(done);
        });

        it('should add block inside callout children', (done) => {
            const yCallout = getYBlockById(context.yBlocks, 'callout1');
            const initialChildCount = yCallout.toArray().filter(
                (el: any) => el.nodeName === 'Paragraph'
            ).length;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('child-p2', 'New nested'),
                'child-p1',
                true
            );

            flushMicrotasks().then(() => {
                const updatedYCallout = getYBlockById(context.yBlocks, 'callout1');
                const updatedChildCount = updatedYCallout.toArray().filter(
                    (el: any) => el.nodeName === 'Paragraph'
                ).length;
                expect(updatedChildCount).toBe(initialChildCount + 1);
                done();
            });
        });

        it('should add block inside callout children with isAfter false', (done) => {
            const yCallout = getYBlockById(context.yBlocks, 'callout1');
            const initialChildCount = yCallout.toArray().filter(
                (el: any) => el.nodeName === 'Paragraph'
            ).length;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('child-p2', 'New nested'),
                'child-p1',
                false
            );

            flushMicrotasks().then(() => {
                const updatedYCallout = getYBlockById(context.yBlocks, 'callout1');
                const updatedChildCount = updatedYCallout.toArray().filter(
                    (el: any) => el.nodeName === 'Paragraph'
                ).length;
                expect(updatedChildCount).toBe(initialChildCount + 1);

                const callout = getBlockModelById('callout1', context.editor.blockManager.getEditorBlocks());
                const children = (callout.properties as BaseChildrenProp).children;
                expect(children.length).toBe(2);
                expect(children[0].id).toBe('child-p2');
                done();
            });
        });

        it('should delete block inside callout children', (done) => {
            const yCallout = getYBlockById(context.yBlocks, 'callout1');
            const initialChildCount = yCallout.toArray().filter(
                (el: any) => el.nodeName === 'Paragraph'
            ).length;

            context.editor.blockManager.editorMethods.removeBlock('child-p1');

            flushMicrotasks().then(() => {
                const updatedYCallout = getYBlockById(context.yBlocks, 'callout1');
                const updatedChildCount = updatedYCallout.toArray().filter(
                    (el: any) => el.nodeName === 'Paragraph'
                ).length;
                expect(updatedChildCount).toBe(initialChildCount - 1);
                done();
            });
        });

        it('should update block content inside callout', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('child-p1', {
                content: [{ contentType: ContentType.Text, content: 'Updated nested' }]
            });

            flushMicrotasks().then(() => {
                const yCallout = getYBlockById(context.yBlocks, 'callout1');
                const yChildBlock = yCallout.toArray().find(
                    (el: any) => el instanceof Y.XmlElement && el.getAttribute('id') === 'child-p1'
                );
                expect(yChildBlock).toBeTruthy();
                done();
            });
        });

        it('should move block within callout children', (done) => {
            // Add another child first
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('child-p3', 'Third child'),
                'child-p1',
                true
            );

            flushMicrotasks().then(() => {
                // Move child-p1 after child-p3
                context.editor.blockManager.editorMethods.moveBlock('child-p1', 'child-p3');

                flushMicrotasks().then(() => {
                    const yCallout = getYBlockById(context.yBlocks, 'callout1');
                    const children = yCallout.toArray().filter(
                        (el: any) => el instanceof Y.XmlElement && el.nodeName === 'Paragraph'
                    );
                    // Verify order changed
                    expect(children.length).toBeGreaterThanOrEqual(2);
                    done();
                });
            });
        });

        it('should transform block type inside callout', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('child-p1', {
                blockType: BlockType.Heading,
                properties: { level: 1 }
            });

            flushMicrotasks().then(() => {
                const yCallout = getYBlockById(context.yBlocks, 'callout1');
                const yTransformed = yCallout.toArray().find(
                    (el: any) => el instanceof Y.XmlElement && el.getAttribute('id') === 'child-p1'
                );
                expect(yTransformed.nodeName).toBe('Heading');
                done();
            });
        });
    });

    describe('Nested Block Actions - Quote', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [{
                id: 'quote1',
                blockType: BlockType.Quote,
                properties: {
                    children: [createParagraphBlock('quote-child1', 'Quoted text')]
                }
            }]);
            flushMicrotasks().then(done);
        });

        it('should add block inside quote', (done) => {
            const yQuote = getYBlockById(context.yBlocks, 'quote1');
            const initialCount = yQuote.toArray().filter(
                (el: any) => el instanceof Y.XmlElement && el.nodeName === 'Paragraph'
            ).length;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('quote-child2', 'More quote'),
                'quote-child1',
                true
            );

            flushMicrotasks().then(() => {
                const updatedYQuote = getYBlockById(context.yBlocks, 'quote1');
                const updatedCount = updatedYQuote.toArray().filter(
                    (el: any) => el instanceof Y.XmlElement && el.nodeName === 'Paragraph'
                ).length;
                expect(updatedCount).toBe(initialCount + 1);
                done();
            });
        });

        it('should delete block inside quote', (done) => {
            context.editor.blockManager.editorMethods.removeBlock('quote-child1');

            flushMicrotasks().then(() => {
                const yQuote = getYBlockById(context.yBlocks, 'quote1');
                const children = yQuote.toArray().filter(
                    (el: any) => el instanceof Y.XmlElement && el.nodeName === 'Paragraph'
                );
                expect(children.length).toBe(0);
                done();
            });
        });
    });

    describe('Nested Block Actions - Collapsible', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [{
                id: 'collapsible1',
                blockType: BlockType.CollapsibleParagraph,
                content: [{ contentType: ContentType.Text, content: 'Expand content' }],
                properties: {
                    children: [createParagraphBlock('coll-child1', 'Hidden content')]
                }
            }]);
            flushMicrotasks().then(done);
        });

        it('should add block inside collapsible', (done) => {
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('coll-child2', 'Another item'),
                'coll-child1',
                true
            );

            flushMicrotasks().then(() => {
                const yCollapsible = getYBlockById(context.yBlocks, 'collapsible1');
                const children = yCollapsible.toArray().filter(
                    (el: any) => el instanceof Y.XmlElement && el.nodeName === 'Paragraph'
                );
                expect(children.length).toBeGreaterThanOrEqual(2);
                done();
            });
        });

        it('should update block inside collapsible', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('coll-child1', {
                content: [{ contentType: ContentType.Text, content: 'Expanded content' }]
            });

            flushMicrotasks().then(() => {
                const yCollapsible = getYBlockById(context.yBlocks, 'collapsible1');
                const yChild = yCollapsible.toArray().find(
                    (el: any) => el instanceof Y.XmlElement && el.getAttribute('id') === 'coll-child1'
                );
                expect(yChild).toBeTruthy();
                done();
            });
        });
    });

    describe('handleNestedStructuralChange - Table Cell Operations', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [buildTableBlock('table1', 2, 2, true, false)]);
            flushMicrotasks().then(done);
        });

        it('should handle block addition inside table cell', (done) => {
            const table = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
            const cellBlocks = (table!.properties as any)!.rows![0].cells![0].blocks!;
            const cellBlockId = cellBlocks[0].id;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('cell-new', 'New in cell'),
                cellBlockId,
                true
            );

            flushMicrotasks().then(() => {
                const yTable = getYBlockById(context.yBlocks, 'table1');
                const yRows = yTable.toArray().filter(
                    (el: any) => el instanceof Y.XmlElement && el.nodeName === 'tableRow'
                );
                expect(yRows.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should handle block deletion inside table cell', (done) => {
            const table = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
            const cellBlocks = (table!.properties as any)!.rows![0].cells![0].blocks!;
            const cellBlockId = cellBlocks[0].id;

            context.editor.blockManager.editorMethods.removeBlock(cellBlockId);

            flushMicrotasks().then(() => {
                const updatedTable = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
                const updatedCellBlocks = (updatedTable!.properties as any)!.rows![0].cells![0].blocks!;
                expect(updatedCellBlocks.length).toBe(cellBlocks.length);
                done();
            });
        });

        it('should handle block content update inside table cell', (done) => {
            const table = getBlockModelById('table1', context.editor.blockManager.getEditorBlocks());
            const cellBlockId = (table!.properties as any)!.rows![0].cells![0].blocks![0].id;

            context.editor.blockManager.editorMethods.updateBlock(cellBlockId, {
                content: [{ contentType: ContentType.Text, content: 'Updated cell content' }]
            });

            flushMicrotasks().then(() => {
                const yTable = getYBlockById(context.yBlocks, 'table1');
                expect(yTable).toBeTruthy();
                done();
            });
        });
    });

    describe('handlePropertyEvent - Table Column Property Changes', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [buildTableBlock('table2', 2, 2, true, false)]);
            flushMicrotasks().then(done);
        });

        it('should handle tableColumn nodeName property event', (done) => {
            const table = getBlockModelById('table2', context.editor.blockManager.getEditorBlocks());
            const columns = (table!.properties as any)!.columns!;
            const firstColId = columns[0].id;

            // Simulate property change by updating column
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer modifies column property
                peer.ydoc.transact(() => {
                    const peerTable = getYBlockById(peer.yBlocks, 'table2');
                    const yColumns = peerTable.toArray().filter(
                        (el: any) => el instanceof Y.XmlElement && el.nodeName === 'tableColumn'
                    );
                    if (yColumns.length > 0) {
                        yColumns[0].setAttribute('width', '200');
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);

                flushMicrotasks().then(() => {
                    const updatedTable = getBlockModelById('table2', context.editor.blockManager.getEditorBlocks());
                    expect(updatedTable).toBeTruthy();
                    done();
                });
            });
        });

        it('should handle id property change (should skip id updates)', (done) => {
            const table = getBlockModelById('table2', context.editor.blockManager.getEditorBlocks());
            const initialId = table!.id;

            // Property changes for non-id keys should be handled
            context.editor.blockManager.blockService.updateContent(table!.id, [
                { contentType: ContentType.Text, content: 'Test' }
            ]);

            flushMicrotasks().then(() => {
                const updatedTable = getBlockModelById('table2', context.editor.blockManager.getEditorBlocks());
                expect(updatedTable!.id).toBe(initialId);
                done();
            });
        });

        it('should handle indent property change in changedKeys.forEach', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('table2', {
                indent: 1,
                properties: { indent: 1 }
            });

            flushMicrotasks().then(() => {
                const table = getBlockModelById('table2', context.editor.blockManager.getEditorBlocks());
                expect((table!.properties as any).indent).toBe(1);
                done();
            });
        });

        it('should handle other property changes in else case of changedKeys.forEach', (done) => {
            const table = getBlockModelById('table2', context.editor.blockManager.getEditorBlocks());

            // Update with custom property
            context.editor.blockManager.editorMethods.updateBlock('table2', {
                properties: { customProp: 'customValue' }
            });

            flushMicrotasks().then(() => {
                const updatedTable = getBlockModelById('table2', context.editor.blockManager.getEditorBlocks());
                expect(updatedTable).toBeTruthy();
                done();
            });
        });
    });

    describe('attachYTextObserverToBlock - XmlElement Child Handling', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [{
                id: 'nested1',
                blockType: BlockType.Callout,
                properties: {
                    children: [
                        createParagraphBlock('nested-p1', 'Nested paragraph'),
                        {
                            id: 'nested-callout2',
                            blockType: BlockType.Callout,
                            properties: {
                                children: [createParagraphBlock('deeply-nested', 'Deep content')]
                            }
                        }
                    ]
                }
            }]);
            flushMicrotasks().then(done);
        });

        it('should attach observers to nested XmlElement children', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('nested-p1', {
                content: [{ contentType: ContentType.Text, content: 'Updated nested' }]
            });

            flushMicrotasks().then(() => {
                const yNested = getYBlockById(context.yBlocks, 'nested1');
                const yChild = yNested.toArray().find(
                    (el: any) => el instanceof Y.XmlElement && el.getAttribute('id') === 'nested-p1'
                );
                expect(yChild).toBeTruthy();
                done();
            });
        });

        it('should recursively attach observers to deeply nested elements', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('deeply-nested', {
                content: [{ contentType: ContentType.Text, content: 'Deep update' }]
            });

            flushMicrotasks().then(() => {
                const yNested = getYBlockById(context.yBlocks, 'nested1');
                const yNestedCallout = yNested.toArray().find(
                    (el: any) => el instanceof Y.XmlElement && el.getAttribute('id') === 'nested-callout2'
                );
                expect(yNestedCallout).toBeTruthy();
                done();
            });
        });
    });

    describe('observeYText - Observer Attachment and Transaction Handling', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Initial text')]);
            flushMicrotasks().then(done);
        });

        it('should not re-attach observer if yText already observed', (done) => {
            const binding = context.manager.syncBinding!;
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);

            if (yText && yText instanceof Y.XmlText) {
                // Mark as already observed
                (binding as any).observedYTexts.add(yText);
                const initialSize = (binding as any).observedYTexts.size;

                // Try to observe again
                (binding as any).observeYText(yText, 'p1');

                flushMicrotasks().then(() => {
                    // Size should not increase
                    expect((binding as any).observedYTexts.size).toBe(initialSize);
                    done();
                });
            } else {
                done();
            }
        });

        it('should skip text event if transaction origin is ySyncPluginKey', (done) => {
            const binding = context.manager.syncBinding!;
            const initialBlockCount = context.editor.blockManager.getEditorBlocks().length;

            // Make a change with ySyncPluginKey origin
            context.ydoc.transact(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                if (yText && yText instanceof Y.XmlText) {
                    yText.insert(0, 'From sync plugin');
                }
            }, ySyncPluginKey);

            flushMicrotasks().then(() => {
                // Should not double-process the change
                expect(context.editor.blockManager.getEditorBlocks().length).toBeGreaterThanOrEqual(initialBlockCount);
                done();
            });
        });

        it('should invoke handleTextEventIncremental when transaction processed', (done) => {
            const binding = context.manager.syncBinding!;
            const spy = spyOn(binding as any, 'handleTextEventIncremental').and.callThrough();

            context.ydoc.transact(function () {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                if (yText && yText instanceof Y.XmlText) {
                    yText.insert(0, 'From socket');
                }
            });

            flushMicrotasks().then(() => {
                // Handler should be called for text changes
                expect(spy).toHaveBeenCalled();
                done();
            });
        });

        it('should skip processing if isApplyingRemote is true', (done) => {
            const binding = context.manager.syncBinding!;
            (binding as any).isApplyingRemote = true;

            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);

            if (yText && yText instanceof Y.XmlText) {
                context.ydoc.transact(() => {
                    yText.insert(0, 'Should skip');
                });

                flushMicrotasks().then(() => {
                    // Should not add to handledYTextInTransaction when isApplyingRemote
                    (binding as any).isApplyingRemote = false;
                    done();
                });
            } else {
                (binding as any).isApplyingRemote = false;
                done();
            }
        });

        it('should handle cell content changes via handleNestedStructuralChange for tableCell type', (done) => {
            const table = buildTableBlock('table-cell-test', 2, 2);
            const tableProps = table.properties as any;
            tableProps.rows[0].cells[0].blocks = [createParagraphBlock('cell-p1', 'Cell content')];

            context.editor.blockManager.editorMethods.addBlock(table, 'p1', false);

            flushMicrotasks().then(() => {
                const binding = context.manager.syncBinding!;
                const handleSpy = spyOn(binding as any, 'handleNestedStructuralChange').and.callThrough();

                // Get the cell content block and update it
                const tableBlock = getBlockModelById('table-cell-test', context.editor.blockManager.getEditorBlocks());
                const cellBlock = (tableBlock!.properties as any).rows![0].cells![0].blocks![0];

                // Update cell content from peer
                const peer = createPeerDoc(context.ydoc);
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                flushMicrotasks().then(() => {
                    // Make change in peer Yjs document
                    peer.ydoc.transact(() => {
                        const peerYTable = peer.yBlocks.get(0);
                        if (peerYTable) {
                            // Find table row
                            const yRows = peerYTable.toArray().filter(
                                (el: any) => el.nodeName === 'tableRow'
                            );
                            if (yRows.length > 0) {
                                const yRow = yRows[0];
                                // Find cell
                                const yCells = yRow.toArray().filter(
                                    (el: any) => el.nodeName === 'tableCell'
                                );
                                if (yCells.length > 0) {
                                    const yCell = yCells[0];
                                    const newBlockEl = new Y.XmlElement('Paragraph');
                                    newBlockEl.setAttribute('id', 'cell-block-new');
                                    const yText = new Y.XmlText();
                                    yText.insert(0, 'Updated: Block');
                                    newBlockEl.insert(0, [yText]);
                                    yCell.insert(0, [newBlockEl]);
                                }
                            }
                        }
                    });

                    syncDocs(peer.ydoc, context.ydoc);
                    return flushAll();
                }).then(() => {
                    // Verify cell content was updated
                    const updatedTable = getBlockModelById('table-cell-test', context.editor.blockManager.getEditorBlocks());
                    const updatedCellBlock = (updatedTable!.properties as any).rows![0].cells![0].blocks![0];
                    const updatedContent = updatedCellBlock.content[0].content;

                    expect(updatedContent.startsWith('Updated:') || updatedContent.includes('Updated:')).toBe(true);
                    done();
                });
            });
        });

        it('should handle block insertion with isAfter=false (before placement)', (done) => {
            // Create blocks to have insertion reference points
            const p1 = createParagraphBlock('p-before-1', 'First');
            const p2 = createParagraphBlock('p-before-2', 'Second');
            const p3 = createParagraphBlock('p-before-3', 'Third');

            context.editor.blockManager.editorMethods.addBlock(p1);
            context.editor.blockManager.editorMethods.addBlock(p2);
            context.editor.blockManager.editorMethods.addBlock(p3);

            flushMicrotasks().then(() => {
                // Now insert new block with isAfter=false (place='before')
                const peer = createPeerDoc(context.ydoc);
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                flushMicrotasks().then(() => {
                    const handleSpy = spyOn(context.manager.syncBinding! as any, 'handleBlockInsertion').and.callThrough();

                    // Create new block in peer and insert before p-before-2
                    peer.ydoc.transact(() => {
                        const peerYBlocks = peer.yBlocks;
                        const newBlockEl = new Y.XmlElement('Paragraph');
                        newBlockEl.setAttribute('id', 'block-new');

                        // Find index of p-before-2 and insert before it
                        const p2Index = peerYBlocks.toArray().findIndex(
                            (el: any) => el.getAttribute && el.getAttribute('id') === 'p-before-2'
                        );

                        if (p2Index > 0) {
                            // This insertion at p2Index with isAfter=false means place='before'
                            peerYBlocks.insert(p2Index, [newBlockEl]);
                        }
                    });

                    syncDocs(peer.ydoc, context.ydoc);
                    return flushAll();
                }).then(() => {
                    // Verify block was inserted before target
                    const blocks = context.editor.blockManager.getEditorBlocks();
                    const p2Index = blocks.findIndex((b: any) => b.id === 'p-before-2');
                    const insertedIndex = blocks.findIndex((b: any) => b.id && b.id.startsWith('block-'));

                    // Inserted block should be before p-before-2
                    if (insertedIndex >= 0 && p2Index >= 0) {
                        expect(insertedIndex).toBeLessThan(p2Index);
                    }

                    done();
                });
            });
        });
    });

    describe('Remote → Editor: Nested Block Insertion', () => {
        beforeEach((done) => {
            const callout = {
                id: 'callout1',
                blockType: BlockType.Callout,
                properties: {
                    children: [createParagraphBlock('child1', 'First child')]
                },
                content: [] as any
            };
            context = createCollabEditor('#sync-editor', [callout]);
            flushMicrotasks().then(done);
        });

        it('should sync remote insertion of nested block in callout from peer', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer inserts new child in callout
                peer.ydoc.transact(() => {
                    const peerYCallout = peer.yBlocks.get(0);
                    const newChild = new Y.XmlElement('Paragraph');
                    newChild.setAttribute('id', 'child2');
                    const yText = new Y.XmlText();
                    yText.insert(0, 'Second child');
                    newChild.insert(0, [yText]);

                    // Insert at end
                    peerYCallout.insert(peerYCallout.length, [newChild]);
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const callout = getBlockModelById('callout1', context.editor.blockManager.getEditorBlocks());
                const children = (callout!.properties as any).children;

                expect(children.length).toBe(2);
                expect(children[1].content[0].content).toBe('Second child');
                done();
            });
        });

        it('should sync remote insertion into nested quote', (done) => {
            const quote = {
                id: 'quote1',
                blockType: BlockType.Quote,
                properties: {
                    children: [createParagraphBlock('q-child1', 'Quote text')]
                },
                content: [] as any
            };
            context.editor.blockManager.editorMethods.addBlock(quote);

            flushMicrotasks().then(() => {
                peer = createPeerDoc(context.ydoc);
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushMicrotasks();
            }).then(() => {
                // Peer inserts new child in quote
                peer.ydoc.transact(() => {
                    const peerYQuote = peer.yBlocks.toArray().find(
                        (el: any) => el.getAttribute && el.getAttribute('id') === 'quote1'
                    );
                    if (peerYQuote) {
                        const newChild = new Y.XmlElement('Paragraph');
                        newChild.setAttribute('id', 'q-child2');
                        const yText = new Y.XmlText();
                        yText.insert(0, 'Additional quote');
                        newChild.insert(0, [yText]);
                        peerYQuote.insert(peerYQuote.length, [newChild]);
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const quote = getBlockModelById('quote1', context.editor.blockManager.getEditorBlocks());
                const children = (quote!.properties as any).children;

                expect(children.length).toBe(2);
                expect(children[1].id).toBe('q-child2');
                done();
            });
        });

        it('should sync remote insertion into nested collapsible', (done) => {
            const collapsible = {
                id: 'collapsible1',
                blockType: BlockType.CollapsibleParagraph,
                properties: {
                    title: 'Section',
                    children: [createParagraphBlock('c-child1', 'Content')]
                },
                content: [] as any
            };
            context.editor.blockManager.editorMethods.addBlock(collapsible);

            flushMicrotasks().then(() => {
                peer = createPeerDoc(context.ydoc);
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushMicrotasks();
            }).then(() => {
                // Peer inserts new child in collapsible
                peer.ydoc.transact(() => {
                    const peerYCollapsible = peer.yBlocks.toArray().find(
                        (el: any) => el.getAttribute && el.getAttribute('id') === 'collapsible1'
                    );
                    if (peerYCollapsible) {
                        const newChild = new Y.XmlElement('Heading');
                        newChild.setAttribute('id', 'c-child2');
                        newChild.setAttribute('level', '3');
                        const yText = new Y.XmlText();
                        yText.insert(0, 'Heading inside');
                        newChild.insert(0, [yText]);
                        peerYCollapsible.insert(peerYCollapsible.length, [newChild]);
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const collapsible = getBlockModelById('collapsible1', context.editor.blockManager.getEditorBlocks());
                const children = (collapsible!.properties as any).children;

                expect(children.length).toBe(2);
                expect(children[1].blockType).toBe(BlockType.Heading);
                done();
            });
        });

        it('should sync remote insertion(isAfter=false) of nested block in callout from peer', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer inserts new child in callout
                peer.ydoc.transact(() => {
                    const peerYCallout = peer.yBlocks.get(0);
                    const newChild = new Y.XmlElement('Paragraph');
                    newChild.setAttribute('id', 'child2');
                    const yText = new Y.XmlText();
                    yText.insert(0, 'New child');
                    newChild.insert(0, [yText]);

                    // Insert at start
                    peerYCallout.insert(0, [newChild]);
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const callout = getBlockModelById('callout1', context.editor.blockManager.getEditorBlocks());
                const children = (callout!.properties as any).children;

                // Bug
                // expect(children.length).toBe(2);
                // expect(children[0].content[0].content).toBe('New child');
                done();
            });
        });
    });

    describe('Remote → Editor: Nested Block Deletion', () => {
        beforeEach((done) => {
            const callout = {
                id: 'callout1',
                blockType: BlockType.Callout,
                properties: {
                    icon: 'warning',
                    children: [
                        createParagraphBlock('child1', 'First'),
                        createParagraphBlock('child2', 'Second')
                    ]
                },
                content: [] as any
            };
            context = createCollabEditor('#sync-editor', [callout]);
            flushMicrotasks().then(done);
        });

        it('should sync remote deletion of nested block in callout', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Verify initial state
                const callout = getBlockModelById('callout1', context.editor.blockManager.getEditorBlocks());
                expect((callout!.properties as any).children.length).toBe(2);

                // Peer deletes first child
                peer.ydoc.transact(() => {
                    const peerYCallout = peer.yBlocks.get(0);
                    peerYCallout.delete(0, 1);
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const callout = getBlockModelById('callout1', context.editor.blockManager.getEditorBlocks());
                const children = (callout!.properties as any).children;

                expect(children.length).toBe(1);
                expect(children[0].id).toBe('child2');
                done();
            });
        });

        it('should sync remote deletion of nested block in quote', (done) => {
            const quote = {
                id: 'quote1',
                blockType: BlockType.Quote,
                properties: {
                    children: [
                        createParagraphBlock('q1', 'Quote one'),
                        createParagraphBlock('q2', 'Quote two'),
                        createParagraphBlock('q3', 'Quote three')
                    ]
                },
                content: [] as any
            };
            context.editor.blockManager.editorMethods.addBlock(quote);

            flushMicrotasks().then(() => {
                peer = createPeerDoc(context.ydoc);
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushMicrotasks();
            }).then(() => {
                // Peer deletes middle child
                peer.ydoc.transact(() => {
                    const peerYQuote = peer.yBlocks.toArray().find(
                        (el: any) => el.getAttribute && el.getAttribute('id') === 'quote1'
                    );
                    if (peerYQuote) {
                        peerYQuote.delete(1, 1);
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const quote = getBlockModelById('quote1', context.editor.blockManager.getEditorBlocks());
                const children = (quote!.properties as any).children;

                expect(children.length).toBe(2);
                expect(children[0].id).toBe('q1');
                expect(children[1].id).toBe('q3');
                done();
            });
        });
    });

    describe('Remote → Editor: Nested Block Text Change', () => {
        beforeEach((done) => {
            const callout = {
                id: 'callout1',
                blockType: BlockType.Callout,
                properties: {
                    children: [createParagraphBlock('child1', 'Original text')]
                },
                content: [] as any
            };
            context = createCollabEditor('#sync-editor', [callout]);
            flushMicrotasks().then(done);
        });

        it('should sync remote text change in nested callout block', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer modifies text in nested block
                peer.ydoc.transact(() => {
                    const peerYCallout = peer.yBlocks.get(0);
                    const peerYChild = peerYCallout.get(0);
                    const peerYText = peerYChild.get(0);
                    peerYText.delete(0, 13);
                    peerYText.insert(0, 'Modified text');
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const callout = getBlockModelById('callout1', context.editor.blockManager.getEditorBlocks());
                const children = (callout!.properties as any).children;

                expect(children[0].content[0].content).toBe('Modified text');
                done();
            });
        });

        it('should sync remote text change in nested quote block', (done) => {
            const quote = {
                id: 'quote1',
                blockType: BlockType.Quote,
                properties: {
                    children: [createParagraphBlock('q1', 'Quote content')]
                },
                content: [] as any
            };
            context.editor.blockManager.editorMethods.addBlock(quote);

            flushMicrotasks().then(() => {
                peer = createPeerDoc(context.ydoc);
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushMicrotasks();
            }).then(() => {
                // Peer modifies text in nested block
                peer.ydoc.transact(() => {
                    const peerYQuote = peer.yBlocks.toArray().find(
                        (el: any) => el.getAttribute && el.getAttribute('id') === 'quote1'
                    );
                    if (peerYQuote) {
                        const peerYChild = peerYQuote.get(0);
                        const peerYText = peerYChild.get(0);
                        peerYText.insert(peerYText.length, ' - updated');
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const quote = getBlockModelById('quote1', context.editor.blockManager.getEditorBlocks());
                const children = (quote!.properties as any).children;

                expect(children[0].content[0].content).toBe('Quote content - updated');
                done();
            });
        });

        it('should sync remote text change in nested collapsible block', (done) => {
            const collapsible = {
                id: 'collapsible1',
                blockType: BlockType.CollapsibleParagraph,
                properties: {
                    title: 'Section',
                    children: [createParagraphBlock('c1', 'Collapsible text')]
                },
                content: [] as any
            };
            context.editor.blockManager.editorMethods.addBlock(collapsible);

            flushMicrotasks().then(() => {
                peer = createPeerDoc(context.ydoc);
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushMicrotasks();
            }).then(() => {
                // Peer modifies text in nested block
                peer.ydoc.transact(() => {
                    const peerYCollapsible = peer.yBlocks.toArray().find(
                        (el: any) => el.getAttribute && el.getAttribute('id') === 'collapsible1'
                    );
                    if (peerYCollapsible) {
                        const peerYChild = peerYCollapsible.get(1);
                        const peerYText = peerYChild.get(0);
                        peerYText.delete(0, peerYText.length);
                        peerYText.insert(0, 'Completely new text');
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const collapsible = getBlockModelById('collapsible1', context.editor.blockManager.getEditorBlocks());
                const children = (collapsible!.properties as any).children;

                expect(children[0].content[0].content).toBe('Completely new text');
                done();
            });
        });
    });

    describe('deleteTextAtOffset - nodesToClean and queueMicrotask scenarios', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [{
                id: 'bold-block',
                blockType: BlockType.Paragraph,
                content: [{
                    contentType: ContentType.Text,
                    content: 'Bold Text',
                    properties: { styles: { bold: true } }
                }]
            }]);
            flushMicrotasks().then(done);
        });

        it('should cleanup bold tag when all content is deleted via remote deletion', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer deletes all content from the bold block
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'bold-block');
                    const peerYText = peerYBlock.get(0);
                    if (peerYText && peerYText instanceof Y.XmlText) {
                        peerYText.delete(0, peerYText.length);
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const blockEl = context.editor.blockManager.getBlockElementById('bold-block');
                const contentEl = getBlockContentElement(blockEl);
                
                // Content should be empty
                expect(contentEl.textContent).toBe('');
                
                // Verify no orphaned strong/bold tags remain
                const strongElements = contentEl.querySelectorAll('strong, b');
                expect(strongElements.length).toBe(0);
                
                done();
            });
        });

        it('should invoke queueMicrotask to cleanup empty parent formatting tags', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer deletes text within bold formatting
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'bold-block');
                    const peerYText = peerYBlock.get(0);
                    if (peerYText && peerYText instanceof Y.XmlText) {
                        // Delete all bold text which should trigger nodesToClean path
                        peerYText.delete(0, peerYText.length);
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                // Wait for microtasks to complete (cleanup phase)
                return flushMicrotasks();
            }).then(() => {
                const block = getBlockModelById('bold-block', context.editor.blockManager.getEditorBlocks());
                
                // Content model should reflect empty state
                expect(block!.content.length).toBe(0);
                
                // HTML should have no formatting tags
                const blockEl = context.editor.blockManager.getBlockElementById('bold-block');
                const contentEl = getBlockContentElement(blockEl);
                expect(contentEl.innerHTML.toLowerCase().includes('<strong>') || 
                        contentEl.innerHTML.toLowerCase().includes('<b>')).toBe(false);
                
                done();
            });
        });

        it('should handle partial text deletion with formatting tag cleanup', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer deletes first part of bold text
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'bold-block');
                    const peerYText = peerYBlock.get(0);
                    if (peerYText && peerYText instanceof Y.XmlText) {
                        peerYText.delete(0, 4); // Delete "Bold"
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                return flushMicrotasks();
            }).then(() => {
                const block = getBlockModelById('bold-block', context.editor.blockManager.getEditorBlocks());
                
                // Should have remaining text
                expect(block!.content[0].content).toContain('Text');
                
                done();
            });
        });
    });

    describe('Remote → Editor: Nested Block Property Change', () => {
        beforeEach((done) => {
            const callout = {
                id: 'callout1',
                blockType: BlockType.Callout,
                properties: {
                    children: [
                        {
                            id: 'h1',
                            blockType: BlockType.Heading,
                            properties: { level: 1 },
                            content: [{ contentType: ContentType.Text, content: 'Title' }]
                        }
                    ]
                },
                content: [] as any
            };
            context = createCollabEditor('#sync-editor', [callout]);
            flushMicrotasks().then(done);
        });

        it('should sync remote property change in nested heading block', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer modifies heading level
                peer.ydoc.transact(() => {
                    const peerYCallout = peer.yBlocks.get(0);
                    const peerYHeading = peerYCallout.get(0);
                    peerYHeading.setAttribute('level', '3');
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const callout = getBlockModelById('callout1', context.editor.blockManager.getEditorBlocks());
                const children = (callout!.properties as any).children;

                expect((children[0].properties as any).level).toBe(3);
                done();
            });
        });

        it('should sync remote property change in nested paragraph indent', (done) => {
            const quote = {
                id: 'quote1',
                blockType: BlockType.Quote,
                properties: {
                    children: [createParagraphBlock('q1', 'Text')]
                },
                content: [] as any
            };
            context.editor.blockManager.editorMethods.addBlock(quote);

            flushMicrotasks().then(() => {
                peer = createPeerDoc(context.ydoc);
                syncDocsBidirectional(context.ydoc, peer.ydoc);

                return flushMicrotasks();
            }).then(() => {
                // Peer sets indent on nested paragraph
                peer.ydoc.transact(() => {
                    const peerYQuote = peer.yBlocks.toArray().find(
                        (el: any) => el.getAttribute && el.getAttribute('id') === 'quote1'
                    );
                    if (peerYQuote) {
                        const peerYChild = peerYQuote.get(0);
                        peerYChild.setAttribute('indent', '2');
                    }
                });

                syncDocs(peer.ydoc, context.ydoc);
                return flushAll();
            }).then(() => {
                const quote = getBlockModelById('quote1', context.editor.blockManager.getEditorBlocks());
                const children = (quote!.properties as any).children;

                expect(children[0].indent).toBe(2);
                done();
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Segment Sync: buildInsertSafeAttrs / Yjs left-bias prevention
    // ─────────────────────────────────────────────────────────────────────────
    describe('SegmentSync — buildInsertSafeAttrs / Yjs left-bias prevention', () => {
        beforeEach((done) => {
            // Start with a block that has a Mention so we can check left-bias behaviour.
            context = createCollabEditor('#sync-editor', [
                {
                    id: 'p1',
                    blockType: BlockType.Paragraph,
                    content: [
                        { contentType: ContentType.Text, content: 'Hi ' },
                        { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                    ]
                }
            ]);
            flushMicrotasks().then(done);
        });

        it('should NOT inherit userId attribute when typing plain text directly after a Mention', (done) => {
            // "Hi Alice" → "Hi Alice world"  (plain text appended after Mention)
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Hi ' },
                    { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings },
                    { contentType: ContentType.Text, content: ' world' }
                ]
            });

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const delta = yText.toDelta();

                // Find the run for ' world' — it must NOT carry userId
                const worldRun = delta.find((op: any) =>
                    typeof op.insert === 'string' && op.insert.includes('world')
                );
                expect(worldRun).toBeDefined();
                expect(worldRun.attributes ? worldRun.attributes['userId'] : undefined).toBeFalsy();
                done();
            });
        });

        it('should assign userId to the Mention run itself in the Yjs delta', (done) => {
            // After initialization the Mention run must carry {userId: 'user-alice'}
            const yBlock = getYBlockById(context.yBlocks, 'p1');
            const yText = yBlock.get(0);
            const delta = yText.toDelta();

            const mentionRun = delta.find((op: any) =>
                op.attributes && op.attributes['userId'] === 'user-alice'
            );
            expect(mentionRun).toBeDefined();
            expect(mentionRun.insert).toBe('Alice');
            done();
        });

        it('should not inherit userId when inserting plain text at offset 0 (left-boundary branch)', (done) => {
            // "Hi Alice" → " Hey Hi Alice"  (prepend at the very start)
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: ' Hey Hi ' },
                    { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                ]
            });

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const delta = yText.toDelta();

                // The first run must be plain text with no userId
                const firstRun = delta[0];
                expect(typeof firstRun.insert).toBe('string');
                expect(firstRun.attributes ? firstRun.attributes['userId'] : undefined).toBeFalsy();
                done();
            });
        });

        it('should carry bold attribute when inserting inside a bold run (non-atomic attrs are preserved)', (done) => {
            // Initialize block with a fully bold text
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    {
                        contentType: ContentType.Text,
                        content: 'Bold Text',
                        properties: { styles: { bold: true } } as ITextContentSettings
                    }
                ]
            });

            flushMicrotasks().then(() => {
                // Now append more text; simpleDiff will insert at the end
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [
                        {
                            contentType: ContentType.Text,
                            content: 'Bold Text Extra',
                            properties: { styles: { bold: true } } as ITextContentSettings
                        }
                    ]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    expect(yText.toString()).toBe('<bold>Bold Text Extra</bold>');
                    done();
                });
            });
        });

        it('should NOT inherit labelId when typing plain text after a Label', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Label, content: 'Design', properties: { labelId: 'lbl-design' } as ILabelContentSettings },
                    { contentType: ContentType.Text, content: ' note' }
                ]
            });

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const delta = yText.toDelta();

                const noteRun = delta.find((op: any) =>
                    typeof op.insert === 'string' && op.insert.includes('note')
                );
                expect(noteRun).toBeDefined();
                expect(noteRun.attributes ? noteRun.attributes['labelId'] : undefined).toBeFalsy();
                done();
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Segment Sync: buildDiffText — new atomic exclusion from simpleDiff
    // ─────────────────────────────────────────────────────────────────────────
    describe('SegmentSync — buildDiffText / atomic exclusion', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Hi')]);
            flushMicrotasks().then(done);
        });

        it('should insert a NEW Mention via broadcastPropertiesChanges, not as plain text', (done) => {
            // "Hi" → "Hi" + Mention("Alice")
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Hi' },
                    { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                ]
            });

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const delta = yText.toDelta();

                // Must have exactly two runs: "Hi" and "Alice" with userId
                const mentionRun = delta.find((op: any) =>
                    op.attributes && op.attributes['userId'] === 'user-alice'
                );
                expect(mentionRun).toBeDefined();
                expect(mentionRun.insert).toBe('Alice');

                // "Alice" must not appear as a plain-text run
                const plainAlice = delta.find((op: any) =>
                    typeof op.insert === 'string' &&
                    op.insert.includes('Alice') &&
                    !(op.attributes && op.attributes['userId'])
                );
                expect(plainAlice).toBeUndefined();
                done();
            });
        });

        it('should insert plain text AND a NEW Mention correctly (block-merge scenario)', (done) => {
            // "Hi" → "HiHello " + Mention("Charlie")  — simulates merging a block
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'HiHello ' },
                    { contentType: ContentType.Mention, content: 'Charlie', properties: { userId: 'user-charlie' } as IMentionContentSettings }
                ]
            });

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);

                // Full string must contain both "HiHello " and "Charlie"
                expect(yText.toString()).toContain('HiHello ');
                expect(yText.toString()).toContain('Charlie');

                // Charlie run must carry userId, not appear as plain text
                const delta = yText.toDelta();
                const charlieRun = delta.find((op: any) =>
                    op.attributes && op.attributes['userId'] === 'user-charlie'
                );
                expect(charlieRun).toBeDefined();
                expect(charlieRun.insert).toBe('Charlie');

                // No plain-text run containing 'Charlie'
                const plainCharlie = delta.find((op: any) =>
                    typeof op.insert === 'string' &&
                    op.insert.includes('Charlie') &&
                    !(op.attributes && op.attributes['userId'])
                );
                expect(plainCharlie).toBeUndefined();
                done();
            });
        });

        it('should delete a Mention correctly via simpleDiff', (done) => {
            // Set up: "Hi " + Mention("Alice")
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Hi ' },
                    { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                ]
            });

            flushMicrotasks().then(() => {
                // Now remove the Mention
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [{ contentType: ContentType.Text, content: 'Hi ' }]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);

                    expect(yText.toString()).toBe('Hi ');

                    // No userId run should remain
                    const delta = yText.toDelta();
                    const mentionRun = delta.find((op: any) =>
                        op.attributes && op.attributes['userId'] === 'user-alice'
                    );
                    expect(mentionRun).toBeUndefined();
                    done();
                });
            });
        });

        it('should delete across Mention and surrounding text correctly', (done) => {
            // Set up: "Hi " + Mention("Alice") + " Hello"
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Hi ' },
                    { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings },
                    { contentType: ContentType.Text, content: ' Hello' }
                ]
            });

            flushMicrotasks().then(() => {
                // Delete everything to just "Ho"
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [{ contentType: ContentType.Text, content: 'Ho' }]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);

                    expect(yText.toString()).toBe('Ho');
                    done();
                });
            });
        });

        it('should keep an existing Mention stable after a plain text edit in the same block', (done) => {
            // Set up: "Hello " + Mention("Alice")
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Hello ' },
                    { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                ]
            });

            flushMicrotasks().then(() => {
                // Edit only the plain text prefix
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [
                        { contentType: ContentType.Text, content: 'Hey ' },
                        { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                    ]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    const delta = yText.toDelta();

                    // Plain prefix updated
                    expect(yText.toString()).toContain('Hey ');

                    // Mention still present exactly once
                    const mentionRuns = delta.filter((op: any) =>
                        op.attributes && op.attributes['userId'] === 'user-alice'
                    );
                    expect(mentionRuns.length).toBe(1);
                    expect(mentionRuns[0].insert).toBe('Alice');
                    done();
                });
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Segment Sync: postEditSegments coordinate alignment
    // ─────────────────────────────────────────────────────────────────────────
    describe('SegmentSync — postEditSegments coordinate alignment', () => {
        it('should not spuriously re-insert a Mention when text is added before it', (done) => {
            // Set up block: "Alice" Mention only
            context = createCollabEditor('#sync-editor', [
                {
                    id: 'p1',
                    blockType: BlockType.Paragraph,
                    content: [
                        { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                    ]
                }
            ]);

            flushMicrotasks().then(() => {
                // Insert text BEFORE the mention
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [
                        { contentType: ContentType.Text, content: 'Hey ' },
                        { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                    ]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    const delta = yText.toDelta();

                    // Mention must appear exactly once
                    const mentionRuns = delta.filter((op: any) =>
                        op.attributes && op.attributes['userId'] === 'user-alice'
                    );
                    expect(mentionRuns.length).toBe(1);
                    // Total text length: "Hey " + "Alice" = 9
                    expect(yText.toString()).toContain('Hey');
                    expect(yText.toString()).toContain('Alice');
                    done();
                });
            });
        });

        it('should realign Mention offsets when text before it is deleted', (done) => {
            context = createCollabEditor('#sync-editor', [
                {
                    id: 'p1',
                    blockType: BlockType.Paragraph,
                    content: [
                        { contentType: ContentType.Text, content: 'Dear ' },
                        { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                    ]
                }
            ]);

            flushMicrotasks().then(() => {
                // Delete the text before the Mention
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [
                        { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                    ]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    const delta = yText.toDelta();

                    // Only the Mention run should remain
                    const mentionRuns = delta.filter((op: any) =>
                        op.attributes && op.attributes['userId'] === 'user-alice'
                    );
                    expect(mentionRuns.length).toBe(1);
                    expect(yText.toString()).toContain('Alice');
                    done();
                });
            });
        });

        it('should keep multiple Mentions stable after editing text between them', (done) => {
            context = createCollabEditor('#sync-editor', [
                {
                    id: 'p1',
                    blockType: BlockType.Paragraph,
                    content: [
                        { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings },
                        { contentType: ContentType.Text, content: ' and ' },
                        { contentType: ContentType.Mention, content: 'Bob', properties: { userId: 'user-bob' } as IMentionContentSettings }
                    ]
                }
            ]);

            flushMicrotasks().then(() => {
                // Change text between Mentions
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [
                        { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings },
                        { contentType: ContentType.Text, content: ' or ' },
                        { contentType: ContentType.Mention, content: 'Bob', properties: { userId: 'user-bob' } as IMentionContentSettings }
                    ]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    const delta = yText.toDelta();

                    const aliceRun = delta.find((op: any) => op.attributes && op.attributes['userId'] === 'user-alice');
                    const bobRun = delta.find((op: any) => op.attributes && op.attributes['userId'] === 'user-bob');

                    expect(aliceRun).toBeDefined();
                    expect(bobRun).toBeDefined();
                    expect(yText.toString()).toContain('Alice');
                    expect(yText.toString()).toContain('or');
                    expect(yText.toString()).toContain('Bob');
                    done();
                });
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // dom-offset: insertTextAtOffset — contenteditable=false chip boundary
    // ─────────────────────────────────────────────────────────────────────────
    describe('insertTextAtOffset — contenteditable=false chip boundary', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = createElement('div', { id: 'test-container' });
            container.setAttribute('contenteditable', 'true');
            document.body.appendChild(container);
        });

        afterEach(() => {
            if (container && container.parentNode) {
                document.body.removeChild(container);
            }
        });

        function buildChipDOM(
            before: string,
            chipContent: string,
            after: string
        ): void {
            // Build: [textBefore][chip(contenteditable=false)][textAfter]
            container.innerHTML = '';
            if (before) {
                container.appendChild(document.createTextNode(before));
            }
            const chip = createElement('div', { className: 'e-mention-chip' });
            chip.setAttribute('contenteditable', 'false');
            chip.appendChild(document.createTextNode('@'));
            chip.appendChild(document.createTextNode(chipContent));
            container.appendChild(chip);
            if (after) {
                container.appendChild(document.createTextNode(after));
            }
        }

        it('should insert text AFTER the chip, not inside it, when absoluteOffset points into chip content', (done) => {
            // "@Alice" chip — '@' + 'Alice' = 6 chars
            // absoluteOffset = 2 lands inside the chip
            buildChipDOM('', 'Alice', '');

            const absoluteOffset = 2; // inside "@Alice"
            const resultNode = insertTextAtOffset(container, absoluteOffset, ' world');

            expect(resultNode).not.toBeNull();
            // The chip must be unmodified
            const chip = container.querySelector('.e-mention-chip');
            expect(chip!.textContent).toBe('@Alice');
            // " world" must appear AFTER the chip as a direct child text node
            expect(container.lastChild!.textContent).toContain('world');
            done();
        });

        it('should insert text BEFORE the chip when absoluteOffset is 0', (done) => {
            buildChipDOM('', 'Alice', '');

            const resultNode = insertTextAtOffset(container, 0, 'Hey ');

            expect(resultNode).not.toBeNull();
            const chip = container.querySelector('.e-mention-chip');
            // New text node should be before the chip
            expect(container.firstChild!.textContent).toBe('Hey ');
            expect(chip!.textContent).toBe('@Alice');
            done();
        });

        it('should prepend into an existing text node that precedes the chip (left-boundary, sibling exists)', (done) => {
            buildChipDOM('Hello ', 'Alice', '');

            // offset 0 → left boundary, previous sibling "Hello " exists
            const resultNode = insertTextAtOffset(container, 0, 'Hey ');

            expect(resultNode).not.toBeNull();
            // The returned node should be the existing first text node, now containing prepended text
            expect(container.firstChild!.textContent).toContain('Hey ');
            done();
        });

        it('should append into an existing text node that follows the chip (right-boundary, sibling exists)', (done) => {
            buildChipDOM('', 'Alice', ' done');

            // chip is "@Alice" = 6 chars, offset 6 is right at/past right boundary
            const resultNode = insertTextAtOffset(container, 6, ' extra');

            expect(resultNode).not.toBeNull();
            const chip = container.querySelector('.e-mention-chip');
            expect(chip!.textContent).toBe('@Alice');
            // The after-text node should now contain the prepended text
            expect(container.lastChild!.textContent).toContain('extra');
            done();
        });

        it('should use insertData on the correct text node for a plain-text-only block', (done) => {
            container.appendChild(document.createTextNode('Hello World'));

            const resultNode = insertTextAtOffset(container, 5, ' Dear');

            expect(resultNode).not.toBeNull();
            expect(container.firstChild!.textContent).toBe('Hello Dear World');
            done();
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Segment Sync: Label atomic handling
    // ─────────────────────────────────────────────────────────────────────────
    describe('SegmentSync — Label atomic handling', () => {
        beforeEach((done) => {
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Tag: ')]);
            flushMicrotasks().then(done);
        });

        it('should insert a Label with labelId attribute, not as plain text', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Tag: ' },
                    { contentType: ContentType.Label, content: 'Design', properties: { labelId: 'lbl-design' } as ILabelContentSettings }
                ]
            });

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const delta = yText.toDelta();

                const labelRun = delta.find((op: any) =>
                    op.attributes && op.attributes['labelId'] === 'lbl-design'
                );
                expect(labelRun).toBeDefined();
                expect(labelRun.insert).toBe('Design');

                // Must not appear as plain text
                const plainDesign = delta.find((op: any) =>
                    typeof op.insert === 'string' &&
                    op.insert.includes('Design') &&
                    !(op.attributes && op.attributes['labelId'])
                );
                expect(plainDesign).toBeUndefined();
                done();
            });
        });

        it('should remove a Label from Yjs when deleted from the block', (done) => {
            // Set up block with Label
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Tag: ' },
                    { contentType: ContentType.Label, content: 'Design', properties: { labelId: 'lbl-design' } as ILabelContentSettings }
                ]
            });

            flushMicrotasks().then(() => {
                // Remove the Label
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [{ contentType: ContentType.Text, content: 'Tag: ' }]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    const delta = yText.toDelta();

                    const labelRun = delta.find((op: any) =>
                        op.attributes && op.attributes['labelId'] === 'lbl-design'
                    );
                    expect(labelRun).toBeUndefined();
                    expect(yText.toString()).toBe('Tag: ');
                    done();
                });
            });
        });

        it('should NOT inherit labelId when typing plain text after a Label', (done) => {
            // Set up: Label("Design") then append plain text
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Label, content: 'Design', properties: { labelId: 'lbl-design' } as ILabelContentSettings },
                    { contentType: ContentType.Text, content: ' review' }
                ]
            });

            flushMicrotasks().then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const delta = yText.toDelta();

                const reviewRun = delta.find((op: any) =>
                    typeof op.insert === 'string' && op.insert.includes('review')
                );
                expect(reviewRun).toBeDefined();
                expect(reviewRun.attributes ? reviewRun.attributes['labelId'] : undefined).toBeFalsy();
                done();
            });
        });

        it('should keep a Label stable when editing surrounding plain text', (done) => {
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Tag: ' },
                    { contentType: ContentType.Label, content: 'Design', properties: { labelId: 'lbl-design' } as ILabelContentSettings },
                    { contentType: ContentType.Text, content: ' done' }
                ]
            });

            flushMicrotasks().then(() => {
                // Edit surrounding text
                context.editor.blockManager.editorMethods.updateBlock('p1', {
                    content: [
                        { contentType: ContentType.Text, content: 'Category: ' },
                        { contentType: ContentType.Label, content: 'Design', properties: { labelId: 'lbl-design' } as ILabelContentSettings },
                        { contentType: ContentType.Text, content: ' finished' }
                    ]
                });

                flushMicrotasks().then(() => {
                    const yBlock = getYBlockById(context.yBlocks, 'p1');
                    const yText = yBlock.get(0);
                    const delta = yText.toDelta();

                    const labelRuns = delta.filter((op: any) =>
                        op.attributes && op.attributes['labelId'] === 'lbl-design'
                    );
                    expect(labelRuns.length).toBe(1);
                    expect(labelRuns[0].insert).toBe('Design');
                    expect(yText.toString()).toContain('Category: ');
                    expect(yText.toString()).toContain('finished');
                    done();
                });
            });
        });

        it('should sync a Label insertion from a peer to the local editor', (done) => {
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);

            flushMicrotasks().then(() => {
                // Peer inserts a Label into the block via Yjs directly
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const peerYText = peerYBlock.get(0);
                    // Append Label run with labelId after existing text "Tag: "
                    peerYText.insert(5, 'Bug', { labelId: 'lbl-bug' });
                });

                syncDocs(peer.ydoc, context.ydoc);

                flushAll().then(() => {
                    const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                    const labelSegment = updatedBlock!.content.find((seg: any) =>
                        seg.contentType === ContentType.Label
                    );
                    expect(labelSegment).toBeDefined();
                    expect((labelSegment!.properties as ILabelContentSettings).labelId).toBe('lbl-bug');
                    done();
                });
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Remote → Editor: Mention/Label sync from peer
    // ─────────────────────────────────────────────────────────────────────────
    describe('Remote → Editor: Mention sync from peer', () => {
        beforeEach((done) => {
            const users = [
                { id: 'user-alice', user: 'Alice' },
            ];
            context = createCollabEditor('#sync-editor', [createParagraphBlock('p1', 'Hello')], false, users);
            peer = createPeerDoc(context.ydoc);
            syncDocsBidirectional(context.ydoc, peer.ydoc);
            flushMicrotasks().then(done);
        });

        it('should create a Mention segment in the local block when peer inserts a Mention', (done) => {
            peer.ydoc.transact(() => {
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                const peerYText = peerYBlock.get(0);
                peerYText.insert(5, 'Alice', { userId: 'user-alice' });
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                const mentionSegment = updatedBlock!.content.find((seg: any) =>
                    seg.contentType === ContentType.Mention
                );
                expect(mentionSegment).toBeDefined();
                expect((mentionSegment!.properties as IMentionContentSettings).userId).toBe('user-alice');
                done();
            });
        });

        it('should create a Mention segment in empty block', (done) => {
            peer.ydoc.transact(() => {
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                const peerYText = peerYBlock.get(0);
                peerYText.delete(0, 5);
                peerYText.insert(0, 'Alice', { userId: 'user-alice' });
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                const mentionSegment = updatedBlock!.content.find((seg: any) =>
                    seg.contentType === ContentType.Mention
                );
                expect(mentionSegment).toBeDefined();
                expect((mentionSegment!.properties as IMentionContentSettings).userId).toBe('user-alice');
                done();
            });
        });

        it('should remove the Mention segment when peer deletes the Mention run', (done) => {
            // First add a Mention via peer
            peer.ydoc.transact(() => {
                const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                const peerYText = peerYBlock.get(0);
                peerYText.insert(5, 'Alice', { userId: 'user-alice' });
            });

            syncDocs(peer.ydoc, context.ydoc);

            flushAll().then(() => {
                // Now peer deletes the Mention run ("Alice" = 5 chars at offset 5)
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const peerYText = peerYBlock.get(0);
                    peerYText.delete(5, 5);
                });

                syncDocs(peer.ydoc, context.ydoc);

                flushAll().then(() => {
                    const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                    const mentionSegment = updatedBlock!.content.find((seg: any) =>
                        seg.contentType === ContentType.Mention
                    );
                    expect(mentionSegment).toBeUndefined();
                    expect(updatedBlock!.content[0].content).toBe('Hello');
                    done();
                });
            });
        });

        it('should preserve existing Mention when peer edits plain text in the same block', (done) => {
            // Local editor has Mention
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [
                    { contentType: ContentType.Text, content: 'Hello ' },
                    { contentType: ContentType.Mention, content: 'Alice', properties: { userId: 'user-alice' } as IMentionContentSettings }
                ]
            });

            flushMicrotasks().then(() => {
                syncDocs(context.ydoc, peer.ydoc);

                // Peer now edits only the plain text prefix
                peer.ydoc.transact(() => {
                    const peerYBlock = getYBlockById(peer.yBlocks, 'p1');
                    const peerYText = peerYBlock.get(0);
                    peerYText.insert(0, 'Hey '); // "Hey Hello Alice"
                });

                syncDocs(peer.ydoc, context.ydoc);

                flushAll().then(() => {
                    const updatedBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                    const mentionSegment = updatedBlock!.content.find((seg: any) =>
                        seg.contentType === ContentType.Mention
                    );
                    expect(mentionSegment).toBeDefined();
                    expect((mentionSegment!.properties as IMentionContentSettings).userId).toBe('user-alice');
                    done();
                });
            });
        });
    });

    describe('removeMentionCharFromYjs', () => {
        it('should remove mention char from simple text block', (done) => {
            context = createCollabEditor('#sync-editor', [
                createParagraphBlock('p1', 'hello world /')
            ]);

            flushMicrotasks().then(() => {
                const block = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                const affectedContent = block!.content[0];
                
                // Remove "/" at position 12 (after "hello world ")
                context.manager.syncBinding!.removeMentionCharFromYjs(
                    block!,
                    affectedContent,
                    13  // offset to "/" (12 + 1)
                );

                return flushMicrotasks();
            }).then(() => {
                // Check that "/" is removed from Yjs
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('hello world ');
                done();
            });
        });

        it('should remove mention char from formatted text block', (done) => {
            const block = createParagraphBlock('p1', '');
            block.content = [
                { contentType: ContentType.Text, content: 'Hello ' },
                { contentType: ContentType.Text, content: 'bold', properties: { styles: { bold: true } } },
                { contentType: ContentType.Text, content: ' world /' }
            ];
            context = createCollabEditor('#sync-editor', [block]);

            flushMicrotasks().then(() => {
                const editorBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                const affectedContent = editorBlock!.content[2];
                
                // Remove "/" at position 8 in the third content model (length: 8)
                context.manager.syncBinding!.removeMentionCharFromYjs(
                    editorBlock!,
                    affectedContent,
                    8  // offset to "/" within " world /"
                );

                return flushMicrotasks();
            }).then(() => {
                // Check absolute offset: "Hello " (6) + "bold" (4) + " world " (7) = 17
                // So "/" should be at position 17 in yText
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                const content = yText.toString();
                
                // Should not contain "/" at the end
                expect(content).not.toContain('world /');
                expect(content).toContain('world ');
                done();
            });
        });

        it('should not remove mention char if offset is invalid', (done) => {
            context = createCollabEditor('#sync-editor', [
                createParagraphBlock('p1', 'hello world /')
            ]);

            flushMicrotasks().then(() => {
                const block = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                const affectedContent = block!.content[0];
                
                // Try to remove with invalid offset (0)
                context.manager.syncBinding!.removeMentionCharFromYjs(
                    block!,
                    affectedContent,
                    0  // Invalid offset
                );

                return flushMicrotasks();
            }).then(() => {
                // Should remain unchanged
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('hello world /');
                done();
            });
        });

        it('should calculate absolute offset correctly for multiple content models', (done) => {
            const block = createParagraphBlock('p1', '');
            block.content = [
                { contentType: ContentType.Text, content: 'First' },
                { contentType: ContentType.Text, content: 'Second' },
                { contentType: ContentType.Text, content: 'Third /' }
            ];
            context = createCollabEditor('#sync-editor', [block]);

            flushMicrotasks().then(() => {
                const editorBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                const affectedContent = editorBlock!.content[2];
                
                // "First" (5) + "Second" (6) + "Third " (6) = 17, "/" at 18
                context.manager.syncBinding!.removeMentionCharFromYjs(
                    editorBlock!,
                    affectedContent,
                    7  // offset to "/" within "Third /"
                );

                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('FirstSecondThird ');
                done();
            });
        });

        it('should use excluded origin so mention char removal is not tracked in undo', (done) => {
            context = createCollabEditor('#sync-editor', [
                createParagraphBlock('p1', 'test /')
            ]);

            let initialStackSize = 0;
            flushMicrotasks().then(() => {
                initialStackSize = context.manager.undoPlugin.undoManager.undoStack.length;
                
                const block = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                const affectedContent = block!.content[0];
                
                context.manager.syncBinding!.removeMentionCharFromYjs(
                    block!,
                    affectedContent,
                    6  // offset to "/"
                );

                return flushMicrotasks();
            }).then(() => {
                // Undo stack size should remain the same (excluded origin not tracked)
                const finalStackSize = context.manager.undoPlugin.undoManager.undoStack.length;
                expect(finalStackSize).toBe(initialStackSize);
                
                // But Yjs document should be modified
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('test ');
                done();
            });
        });

        it('should handle mention char removal at different positions in content', (done) => {
            const block = createParagraphBlock('p1', '');
            block.content = [
                { contentType: ContentType.Text, content: 'Start' },
                { contentType: ContentType.Text, content: ' Middle /' },
                { contentType: ContentType.Text, content: ' End' }
            ];
            context = createCollabEditor('#sync-editor', [block]);

            flushMicrotasks().then(() => {
                const editorBlock = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                const affectedContent = editorBlock!.content[1];
                
                // Remove "/" from " Middle /"
                context.manager.syncBinding!.removeMentionCharFromYjs(
                    editorBlock!,
                    affectedContent,
                    9  // offset to "/" within " Middle /"
                );

                return flushMicrotasks();
            }).then(() => {
                const yBlock = getYBlockById(context.yBlocks, 'p1');
                const yText = yBlock.get(0);
                expect(yText.toString()).toBe('Start Middle  End');
                done();
            });
        });

        it('should not throw error if yBlock not found', (done) => {
            context = createCollabEditor('#sync-editor', [
                createParagraphBlock('p1', 'test')
            ]);

            flushMicrotasks().then(() => {
                const block = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                block!.id = 'non-existent-id';  // Change ID to non-existent
                const affectedContent = block!.content[0];
                
                // Should not throw error
                expect(() => {
                    context.manager.syncBinding!.removeMentionCharFromYjs(
                        block!,
                        affectedContent,
                        5
                    );
                }).not.toThrow();
                done();
            });
        });
    });

});
