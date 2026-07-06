/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContentModel, ContentType } from '../../../src/index';
import { SegmentSync } from '../../../src/collaboration/y-blockeditor/utils/segment-sync';
import { createCollabEditor, destroyCollab, flushMicrotasks, createParagraphBlock, CollabEditorContext } from '../helpers/collab-util.spec';
import { createElement } from '@syncfusion/ej2-base';

declare const Y: any;

describe('SegmentSync - broadcastPropertiesChanges Coverage', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;
    let segmentSync: SegmentSync;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'segment-editor' });
        document.body.appendChild(editorElement);
        context = createCollabEditor('#segment-editor', [createParagraphBlock('p1', 'Test')]);
        segmentSync = (context.manager.syncBinding as any).segmentSync;
    });

    afterEach(() => {
        if (context) {
            destroyCollab(context);
        }
        if (editorElement && editorElement.parentNode) {
            document.body.removeChild(editorElement);
        }
    });

    describe('broadcastPropertiesChanges - if/else branch coverage', () => {
        it('should handle case where oldSegmentIndex < oldSegments.length and currentOffset in range', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Hello', properties: { styles: { bold: true } } as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Hello', properties: { styles: { bold: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'Hello', { bold: true });
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This path covers: if (currentOffset >= oldInfo.startOffset && currentOffset < oldInfo.endOffset)
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                expect(yText.toString()).toBe('<bold>Hello</bold>');
                done();
            });
        });

        it('should handle case where oldSegmentIndex moves to next segment (else if branch)', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-seg2');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Hi', properties: { styles: { bold: true } } as any },
                { contentType: ContentType.Text, content: 'There', properties: { styles: { italic: true } } as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Hi', properties: { styles: { bold: true } } as any },
                { contentType: ContentType.Text, content: 'There', properties: { styles: { underline: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'Hi', { bold: true });
                yText.insert(2, 'There', { italic: true });
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: else if (currentOffset >= oldInfo.endOffset) with oldSegmentIndex++
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should handle case where newSegmentIndex < newSegments.length and currentOffset in range', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-seg3');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Test', properties: {} as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Test', properties: { styles: { bold: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'Test');
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: if (currentOffset >= newInfo.startOffset && currentOffset < newInfo.endOffset)
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta[0].attributes.bold).toBe(true);
                done();
            });
        });

        it('should handle case where newSegmentIndex moves to next segment (else if branch)', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-seg4');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'ABC', properties: {} as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'A', properties: { styles: { bold: true } } as any },
                { contentType: ContentType.Text, content: 'BC', properties: { styles: { italic: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'ABC');
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: else if (currentOffset >= newInfo.endOffset) with newSegmentIndex++
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should handle case where properties differ (oldAttrsStr !== newAttrsStr)', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-prop-diff');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Text', properties: { styles: { bold: true } } as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Text', properties: { styles: { italic: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'Text', { bold: true });
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: if (oldAttrsStr !== newAttrsStr) branch
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta[0].attributes.italic).toBe(true);
                done();
            });
        });

        it('should handle case where properties match (else branch - no changes)', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-prop-match');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Same', properties: { styles: { bold: true } } as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Same', properties: { styles: { bold: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'Same', { bold: true });
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: else branch where currentOffset++
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta[0].insert).toBe('Same');
                done();
            });
        });

        it('should handle labelId in yTextAttrs (if branch with insert)', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-label');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Label', properties: {} as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Label, content: 'Label', properties: { labelId: 'label-123' } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'Label');
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: if ('labelId' in yTextAttrs || 'userId' in yTextAttrs) branch
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta.some((d: any) => d.attributes.labelId === 'label-123')).toBe(true);
                done();
            });
        });

        it('should handle userId in yTextAttrs (if branch with insert)', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-user');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'User', properties: {} as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Mention, content: 'User', properties: { userId: 'user-456' } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'User');
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This also covers: if ('labelId' in yTextAttrs || 'userId' in yTextAttrs) branch
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta.some((d: any) => d.attributes.userId === 'user-456')).toBe(true);
                done();
            });
        });

        it('should use yText.format when no labelId or userId (else branch)', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-format');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Format', properties: {} as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Format', properties: { styles: { bold: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'Format');
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: else { yText.format(...) } branch
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta[0].attributes.bold).toBe(true);
                done();
            });
        });

        it('should handle rangeEndOffset extension in while loop', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-range');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'AAABBB', properties: {} as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'AAA', properties: { styles: { bold: true } } as any },
                { contentType: ContentType.Text, content: 'BBB', properties: { styles: { bold: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'AAABBB');
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: while (rangeEndOffset < totalLength) loop with rangeEndOffset++
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta[0].attributes.bold).toBe(true);
                done();
            });
        });

        it('should break from range extension when props change', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-break');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'ABCD', properties: {} as any }
            ];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'AB', properties: { styles: { bold: true } } as any },
                { contentType: ContentType.Text, content: 'CD', properties: { styles: { italic: true } } as any }
            ];

            context.ydoc.transact(() => {
                yText.insert(0, 'ABCD');
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: if (JSON.stringify(checkNewAttrs) !== newAttrsStr) break
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                const delta = yText.toDelta();
                expect(delta.length).toBeGreaterThanOrEqual(2);
                done();
            });
        });

        it('should handle empty oldSegments array', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-empty-old');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [];
            const newSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'New', properties: { styles: { bold: true } } as any }
            ];

            context.ydoc.transact(() => {
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: oldSegmentIndex < oldSegments.length with empty old
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                expect(yText.toString()).toBe('<bold>New</bold>');
                done();
            });
        });

        it('should handle empty newSegments array', (done) => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'para-empty-new');
            const yText = new Y.XmlText();
            const oldSegments: ContentModel[] = [
                { contentType: ContentType.Text, content: 'Old', properties: {} as any }
            ];
            const newSegments: ContentModel[] = [];

            context.ydoc.transact(() => {
                yText.insert(0, 'Old');
                yElement.insert(0, [yText]);
                context.yBlocks.insert(0, [yElement]);
            });

            flushMicrotasks().then(() => {
                // This covers: newSegmentIndex < newSegments.length with empty new
                segmentSync.syncSegmentsToYText(yText, newSegments);
                
                expect(yText.toString()).toBe('');
                done();
            });
        });
    });
});
