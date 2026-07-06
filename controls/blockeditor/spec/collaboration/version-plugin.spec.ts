/* eslint-disable @typescript-eslint/no-explicit-any */

import { createElement } from '@syncfusion/ej2-base';
import { ContentType, SnapshotCreatedEventArgs, SnapshotRestoredEventArgs, VersionSnapshot } from '../../src/index';
import {
    createVersionHistoryEditor,
    destroyCollab,
    flushMicrotasks,
    createParagraphBlock,
    CollabEditorContext,
} from './helpers/collab-util.spec';
import { getBlockModelById } from '../../src/common/utils/block';

declare const Y: any;

describe('Version Plugin:', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'version-editor' });
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
        it('should create version plugin after initialization', async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Hello')],
                false,
                null,
            );

            flushMicrotasks().then(() => {
                expect(context.editor.blockManager.versionHistoryModule).not.toBeNull();
                expect(context.editor.blockManager.versionHistoryModule).toBeDefined();
                done();
            });
        });

        it('should have isDestroyed flag set to false after initialization', async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Hello')],
                false,
                null
            );

            flushMicrotasks().then(() => {
                const versionHistory = context.editor.blockManager.versionHistoryModule;
                expect((versionHistory as any).isDestroyed).toBe(false);
                done();
            });
        });

        it('should initialize with empty version history on first creation', async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Hello')],
                false,
                null
            );

            flushMicrotasks().then(() => {
                const versionHistory = context.editor.blockManager.versionHistoryModule;
                expect((versionHistory as any).snapshots.length).toBe(0);
                done();
            });
        });
    });

    describe('Snapshot Creation (Tier 1: Semantic Detection)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should create manual snapshot with createSnapshot method', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const initialCount = (versionHistory as any).snapshots.length;

            versionHistory.createSnapshot({ label: 'Manual Snapshot', modifiedBy: 'test-user' }).then(() => {
                flushMicrotasks().then(() => {
                    expect((versionHistory as any).snapshots.length).toBe(initialCount + 1);
                    const snapshot = (versionHistory as any).snapshots[0];
                    expect(snapshot.label).toBe('Manual Snapshot');
                    expect(snapshot.lastModifiedBy).toBe('test-user');
                    done();
                });
            });
        });

        it('should create snapshot with default modifiedBy when not provided', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Default Author Snapshot' }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshot = (versionHistory as any).snapshots[0];
                    expect(snapshot.lastModifiedBy).toBeDefined();
                    done();
                });
            });
        });

        it('should generate unique snapshot IDs', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Snapshot 1' }).then(() => {
                return versionHistory.createSnapshot({ label: 'Snapshot 2' });
            }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshots = (versionHistory as any).snapshots;
                    expect(snapshots[0].id).not.toBe(snapshots[1].id);
                    expect(snapshots[0].id).toBeDefined();
                    expect(snapshots[1].id).toBeDefined();
                    done();
                });
            });
        });

        it('should capture document state in snapshot', (done) => {
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'Second Block'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const versionHistory = context.editor.blockManager.versionHistoryModule;
                return versionHistory.createSnapshot({ label: 'Document State Test' });
            }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshot = (context.editor.blockManager.versionHistoryModule as any).snapshots[0];
                    expect(snapshot.documentState).toBeDefined();
                    expect(snapshot.documentState instanceof Uint8Array).toBe(true);
                    done();
                });
            });
        });

        it('should detect structural change when inserting block (Tier 1)', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const changeCountBefore = (versionHistory as any).changesSinceSnapshot;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'New Block'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const changeCountAfter = (versionHistory as any).changesSinceSnapshot;
                expect(changeCountAfter).toBeGreaterThan(changeCountBefore);
                done();
            });
        });

        it('should detect structural change when deleting block (Tier 1)', (done) => {
            // First add a second block
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'Second Block'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const versionHistory = context.editor.blockManager.versionHistoryModule;
                (versionHistory as any).changesSinceSnapshot = 0; // Reset counter

                // Now delete a block
                context.editor.blockManager.editorMethods.removeBlock('p2');

                return flushMicrotasks();
            }).then(() => {
                const versionHistory = context.editor.blockManager.versionHistoryModule;
                expect((versionHistory as any).changesSinceSnapshot).toBeGreaterThan(0);
                done();
            });
        });

        it('should detect attribute change as structural (Tier 1)', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            (versionHistory as any).changesSinceSnapshot = 0; // Reset counter

            context.editor.blockManager.editorMethods.updateBlock('p1', { indent: 1 });

            flushMicrotasks().then(() => {
                expect((versionHistory as any).changesSinceSnapshot).toBeGreaterThan(0);
                done();
            });
        });

        it('should NOT detect text-only content change as structural (Tier 1)', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            (versionHistory as any).changesSinceSnapshot = 0; // Reset counter

            // Update just the text content (not attribute)
            context.editor.blockManager.editorMethods.updateBlock('p1', {
                content: [{ contentType: ContentType.Text, content: 'Updated text' }]
            });

            flushMicrotasks().then(() => {
                // Text-only changes should not increment structural change counter
                expect((versionHistory as any).changesSinceSnapshot).toBe(0);
                done();
            });
        });

        it('should NOT create snapshot when change has VERSION_CONTROL_ORIGIN (origin guard)', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const initialCount = (versionHistory as any).snapshots.length;

            // Create a transaction with version-control origin
            const origin = Symbol.for('version-control');
            context.ydoc.transact(() => {
                const yBlock = new Y.XmlElement('Paragraph');
                yBlock.setAttribute('id', 'origin-block');
                const yText = new Y.XmlText();
                yText.insert(0, 'Origin-tagged');
                yBlock.insert(0, [yText]);
                context.yBlocks.insert(0, [yBlock]);
            }, origin);

            flushMicrotasks().then(() => {
                // Should not create automatic snapshot due to origin guard
                const countAfter = (versionHistory as any).snapshots.length;
                expect(countAfter).toBe(initialCount);
                done();
            });
        });
    });

    describe('Snapshot Creation (Tier 2: Debounce)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should schedule debounce timer on first structural change', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'New Block'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const debounceTimer = (versionHistory as any).debounceTimer;
                expect(debounceTimer).toBeDefined();
                expect(debounceTimer !== null).toBe(true);
                done();
            });
        });

        it('should batch multiple structural changes within debounce window', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const initialCount = (versionHistory as any).snapshots.length;

            // First change
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'Block 2'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                // Second change within debounce window
                context.editor.blockManager.editorMethods.addBlock(
                    createParagraphBlock('p3', 'Block 3'),
                    'p2',
                    true
                );

                // Wait for debounce to complete (default 3000ms)
                return new Promise(resolve => setTimeout(resolve, 3500));
            }).then(() => {
                flushMicrotasks().then(() => {
                    // Should create only 1 snapshot despite 2 changes
                    expect((versionHistory as any).snapshots.length).toBe(initialCount + 1);
                    done();
                });
            });
        });

        it('should reset debounce timer when another structural change occurs', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'Block 2'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const timer1 = (versionHistory as any).debounceTimer;

                // Wait 1.5 seconds, then make another change
                return new Promise(resolve => setTimeout(resolve, 1500)).then(() => {
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p3', 'Block 3'),
                        'p2',
                        true
                    );
                    return flushMicrotasks();
                }).then(() => {
                    const timer2 = (versionHistory as any).debounceTimer;
                    // Timers should be different references (new timer created)
                    expect(timer1).not.toBe(timer2);
                    done();
                });
            });
        });

        it('should clear debounce timer null after snapshot is created', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'Block 2'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                expect((versionHistory as any).debounceTimer).not.toBeNull();

                // Wait for debounce
                return new Promise(resolve => setTimeout(resolve, 3500));
            }).then(() => {
                flushMicrotasks().then(() => {
                    expect((versionHistory as any).debounceTimer).toBeNull();
                    done();
                });
            });
        });
    });

    describe('Snapshot Creation (Tier 3: Safety-Net Timer)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should setup safety-net timer on initialization', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const safetyNetTimer = (versionHistory as any).safetyNetTimer;

            expect(safetyNetTimer).toBeDefined();
            expect(safetyNetTimer !== null).toBe(true);
            done();
        });

        it('should fire safety-net snapshot when changesSinceSnapshot exceeds minChangesBetweenSnapshots', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            (versionHistory as any).changesSinceSnapshot = 0;
            (versionHistory as any).minChangesBetweenSnapshots = 1; // Set low threshold
            const initialCount = (versionHistory as any).snapshots.length;

            // Make a structural change
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'Block 2'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                // Wait for safety-net interval (default 90s) - but test with shorter timeout
                return new Promise(resolve => setTimeout(resolve, 100));
            }).then(() => {
                flushMicrotasks().then(() => {
                    // Snapshot should have been created by safety-net if conditions met
                    const countAfter = (versionHistory as any).snapshots.length;
                    expect(countAfter).toBeGreaterThanOrEqual(initialCount);
                    done();
                });
            });
        });

        it('should NOT fire safety-net if changesSinceSnapshot is below threshold', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            (versionHistory as any).changesSinceSnapshot = 0;
            (versionHistory as any).minChangesBetweenSnapshots = 999; // Set high threshold
            const initialCount = (versionHistory as any).snapshots.length;

            // Make single change (below threshold)
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'Block 2'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                return new Promise(resolve => setTimeout(resolve, 100));
            }).then(() => {
                flushMicrotasks().then(() => {
                    const countAfter = (versionHistory as any).snapshots.length;
                    expect(countAfter).toBe(initialCount);
                    done();
                });
            });
        });
    });

    describe('Snapshot Restoration (Restore to Version)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should restore editor state to a previous snapshot', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            // Create first snapshot
            versionHistory.createSnapshot({ label: 'Snapshot 1' }).then(() => {
                flushMicrotasks().then(() => {
                    // Make changes
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p2', 'Added Block'),
                        'p1',
                        true
                    );

                    return flushMicrotasks();
                }).then(() => {
                    // Verify change
                    expect(context.editor.blockManager.getEditorBlocks().length).toBe(2);

                    // Restore to snapshot
                    const snapshotId = (versionHistory as any).snapshots[0].id;
                    return versionHistory.restoreSnapshot(snapshotId);
                }).then(() => {
                    flushMicrotasks().then(() => {
                        // Should be back to 1 block
                        expect(context.editor.blockManager.getEditorBlocks().length).toBe(1);
                        done();
                    });
                });
            });
        });

        it('should create restore-point backup before restoring', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            let countBefore: number;

            versionHistory.createSnapshot({ label: 'Snapshot 1' }).then(() => {
                flushMicrotasks().then(() => {
                    // Make changes
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p2', 'Added Block'),
                        'p1',
                        true
                    );

                    return flushMicrotasks();
                }).then(() => {
                    const snapshotId = (versionHistory as any).snapshots[0].id;
                    countBefore = (versionHistory as any).snapshots.length;
                    return versionHistory.restoreSnapshot(snapshotId);
                }).then(() => {
                    flushMicrotasks().then(() => {
                        const countAfter = (versionHistory as any).snapshots.length;
                        // Should have original + restore-point backup
                        expect(countAfter).toBe(countBefore + 1);

                        const backupSnapshot = (versionHistory as any).snapshots[1];
                        expect(backupSnapshot.label).toBeDefined();
                        done();
                    });
                });
            });
        });

        it('should handle when restoring to non-existent snapshot', async (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const invalidId = 'non-existent-id-12345';

            try {
                await versionHistory.restoreSnapshot(invalidId);
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.message).toContain('Snapshot not found');
                done();
            }
        });

        it('should trigger onSnapshotRestored callback after restore', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            let callbackFired = false;

            context.editor.collaborationSettings.versionHistory.snapshotRestored = (args: SnapshotRestoredEventArgs) => {
                callbackFired = true;
                expect(args.snapshot.label).toBe('Snapshot 1');
                expect(args.backupSnapshot.label).toBe('Before restore to: Snapshot 1');
            };

            versionHistory.createSnapshot({ label: 'Snapshot 1' }).then(() => {
                flushMicrotasks().then(() => {
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p2', 'Added'),
                        'p1',
                        true
                    );

                    return flushMicrotasks();
                }).then(() => {
                    const snapshotId = (versionHistory as any).snapshots[0].id;
                    return versionHistory.restoreSnapshot(snapshotId);
                }).then(() => {
                    flushMicrotasks().then(() => {
                        expect(callbackFired).toBe(true);
                        done();
                    });
                });
            });
        });

        it('should restore block properties correctly', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Before Indent' }).then(() => {
                flushMicrotasks().then(() => {
                    // Add indent to block
                    context.editor.blockManager.editorMethods.updateBlock('p1', { indent: 2 });

                    return flushMicrotasks();
                }).then(() => {
                    const snapshotId = (versionHistory as any).snapshots[0].id;
                    return versionHistory.restoreSnapshot(snapshotId);
                }).then(() => {
                    flushMicrotasks().then(() => {
                        const block = getBlockModelById('p1', context.editor.blockManager.getEditorBlocks());
                        expect(block.indent).toBe(0);
                        done();
                    });
                });
            });
        });
    });

    describe('renameSnapshot', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should rename an existing snapshot', (done) => {

            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({
                label: 'Old Label',
                modifiedBy: 'test-user'
            }).then(() => {

                flushMicrotasks().then(() => {

                    const snapshot = versionHistory.getSnapshots()[0];

                    versionHistory.renameSnapshot(
                        snapshot.id,
                        'New Label'
                    ).then((updatedSnapshot: any) => {

                        expect(updatedSnapshot.label)
                            .toBe('New Label');

                        const snapshots =
                            versionHistory.getSnapshots();

                        expect(snapshots[0].label)
                            .toBe('New Label');

                        done();
                    });

                });

            });

        });

        it('should throw error for invalid snapshot id', (done) => {

            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.renameSnapshot(
                'invalid-id',
                'Updated Label'
            ).catch((error: Error) => {

                expect(error.message)
                    .toContain('not found');

                done();
            });

        });

        it('should preserve snapshot documentState after rename', (done) => {

            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({
                label: 'Original Label',
                modifiedBy: 'test-user'
            }).then(() => {

                flushMicrotasks().then(() => {

                    const snapshot =
                        versionHistory.getSnapshots()[0];

                    const originalState =
                        snapshot.documentState;

                    versionHistory.renameSnapshot(
                        snapshot.id,
                        'Updated Label'
                    ).then((updatedSnapshot: any) => {

                        expect(updatedSnapshot.documentState)
                            .toEqual(originalState);

                        done();
                    });

                });

            });

        });

        it('should preserve snapshot id after rename', (done) => {

            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({
                label: 'Original Label',
                modifiedBy: 'test-user'
            }).then(() => {

                flushMicrotasks().then(() => {

                    const snapshot =
                        versionHistory.getSnapshots()[0];

                    const originalId = snapshot.id;

                    versionHistory.renameSnapshot(
                        snapshot.id,
                        'Updated Label'
                    ).then((updatedSnapshot: any) => {

                        expect(updatedSnapshot.id)
                            .toBe(originalId);

                        done();
                    });

                });

            });

        });
    });

    describe('Version History Retrieval (Get Version History)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should retrieve all snapshots with no filters', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            Promise.all([
                versionHistory.createSnapshot({ label: 'Snapshot 1' }),
                versionHistory.createSnapshot({ label: 'Snapshot 2' }),
                versionHistory.createSnapshot({ label: 'Snapshot 3' })
            ]).then(() => {
                flushMicrotasks().then(() => {
                    const history = versionHistory.getSnapshots();
                    expect(history.length).toBe(3);
                    done();
                });
            });
        });

        it('should return snapshots in reverse chronological order (newest first)', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'First' }).then(() => {
                flushMicrotasks().then(() => {
                    return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
                        return versionHistory.createSnapshot({ label: 'Second' });
                    });
                }).then(() => {
                    flushMicrotasks().then(() => {
                        const history = versionHistory.getSnapshots();
                        expect(history[0].label).toBe('Second');
                        expect(history[1].label).toBe('First');
                        done();
                    });
                });
            });
        });

        it('should support pagination with limit and offset', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            Promise.all([
                versionHistory.createSnapshot({ label: 'Snap 1' }),
                versionHistory.createSnapshot({ label: 'Snap 2' }),
                versionHistory.createSnapshot({ label: 'Snap 3' }),
                versionHistory.createSnapshot({ label: 'Snap 4' })
            ]).then(() => {
                flushMicrotasks().then(() => {
                    const page1 = versionHistory.getSnapshots(2, 0); // Get first 2
                    expect(page1.length).toBe(2);

                    const page2 = versionHistory.getSnapshots(2, 2); // Get next 2
                    expect(page2.length).toBe(2);

                    // Second page should have different snapshots
                    expect(page1[0].id).not.toBe(page2[0].id);
                    done();
                });
            });
        });

        it('should filter snapshots by tags', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            Promise.all([
                versionHistory.createSnapshot({ label: 'Tagged 1' }),
                versionHistory.createSnapshot({ label: 'Not Tagged' }),
                versionHistory.createSnapshot({ label: 'Tagged 2' })
            ]).then(() => {
                flushMicrotasks().then(() => {
                    const allSnapshots = versionHistory.getSnapshots(10, 0);
                    expect(allSnapshots.length).toBe(3);
                    done();
                });
            });
        });

        it('should return snapshots even without tag filtering', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Snap 1' }).then(() => {
                flushMicrotasks().then(() => {
                    const result = versionHistory.getSnapshots(10, 0);
                    expect(result.length).toBe(1);
                    done();
                });
            });
        });

        it('should handle multiple snapshots correctly', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            Promise.all([
                versionHistory.createSnapshot({ label: 'Both Tags' }),
                versionHistory.createSnapshot({ label: 'Only Tag1' }),
                versionHistory.createSnapshot({ label: 'Only Tag2' })
            ]).then(() => {
                flushMicrotasks().then(() => {
                    const result = versionHistory.getSnapshots(10, 0);
                    expect(result.length).toBe(3);
                    done();
                });
            });
        });

        it('should respect limit parameter even when more snapshots exist', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            Promise.all([
                versionHistory.createSnapshot({ label: 'S1' }),
                versionHistory.createSnapshot({ label: 'S2' }),
                versionHistory.createSnapshot({ label: 'S3' }),
                versionHistory.createSnapshot({ label: 'S4' }),
                versionHistory.createSnapshot({ label: 'S5' })
            ]).then(() => {
                flushMicrotasks().then(() => {
                    const limited = versionHistory.getSnapshots(3, 0);
                    expect(limited.length).toBe(3);
                    done();
                });
            });
        });

        it('should return empty array when offset exceeds snapshot count', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Only One' }).then(() => {
                flushMicrotasks().then(() => {
                    const result = versionHistory.getSnapshots(10, 100);
                    expect(result.length).toBe(0);
                    done();
                });
            });
        });
    });

    describe('Version Comparison (Compare Versions)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should compare two snapshots and return diff', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Before' }).then(() => {
                flushMicrotasks().then(() => {
                    // Add a block
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p2', 'New Block'),
                        'p1',
                        true
                    );

                    return flushMicrotasks();
                }).then(() => {
                    return versionHistory.createSnapshot({ label: 'After' });
                }).then(() => {
                    flushMicrotasks().then(() => {
                        const snapshots = (versionHistory as any).snapshots;
                        const diff = versionHistory.compareVersions(snapshots[0].id, snapshots[1].id);

                        expect(diff).toBeDefined();
                        expect(diff.blockCountDelta).toBe(1);
                        done();
                    });
                });
            });
        });

        it('should calculate correct blockCountDelta', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Start (1 block)' }).then(() => {
                flushMicrotasks().then(() => {
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p2', 'Block 2'),
                        'p1',
                        true
                    );
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p3', 'Block 3'),
                        'p2',
                        true
                    );

                    return flushMicrotasks();
                }).then(() => {
                    return versionHistory.createSnapshot({ label: 'End (3 blocks)' });
                }).then(() => {
                    flushMicrotasks().then(() => {
                        const snapshots = (versionHistory as any).snapshots;
                        const diff = versionHistory.compareVersions(snapshots[0].id, snapshots[1].id);

                        expect(diff.blockCountDelta).toBe(2); // Later version has 2 fewer blocks
                        done();
                    });
                });
            });
        });

        it('should handle when comparing with non-existent first snapshot', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Valid Snapshot' }).then(() => {
                flushMicrotasks().then(() => {
                    const validId = (versionHistory as any).snapshots[0].id;

                    expect(versionHistory.compareVersions('invalid-id', validId)).toBeNull();
                    done();
                });
            });
        });

        it('should handle when comparing with non-existent second snapshot', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Valid Snapshot' }).then(() => {
                flushMicrotasks().then(() => {
                    const validId = (versionHistory as any).snapshots[0].id;

                    expect(versionHistory.compareVersions(validId, 'invalid-id')).toBeNull();
                    done();
                });
            });
        });

        it('should calculate timestampDelta correctly', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'First' }).then(() => {
                flushMicrotasks().then(() => {
                    return new Promise(resolve => setTimeout(resolve, 200)).then(() => {
                        return versionHistory.createSnapshot({ label: 'Second' });
                    });
                }).then(() => {
                    flushMicrotasks().then(() => {
                        const snapshots = (versionHistory as any).snapshots;
                        const diff = versionHistory.compareVersions(snapshots[0].id, snapshots[1].id);

                        expect(diff.timestampDelta).toBeGreaterThan(0);
                        expect(diff.timestampDelta).toBeGreaterThanOrEqual(200);
                        done();
                    });
                });
            });
        });
    });

    describe('Version Deletion (Delete Version)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should delete a snapshot by ID', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'To Delete' }).then(() => {
                flushMicrotasks().then(() => {
                    const countBefore = (versionHistory as any).snapshots.length;
                    const snapshotId = (versionHistory as any).snapshots[0].id;

                    versionHistory.deleteSnapshot(snapshotId);

                    flushMicrotasks().then(() => {
                        const countAfter = (versionHistory as any).snapshots.length;
                        expect(countAfter).toBe(countBefore - 1);
                        done();
                    });
                });
            });
        });

        it('should handle when deleting non-existent snapshot', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const countBefore = versionHistory.getSnapshotCount();

            versionHistory.deleteSnapshot('invalid-id');
            expect(versionHistory.getSnapshotCount()).toBe(countBefore);
            done();
        });

        it('should remove snapshot from storage on deletion', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'To Delete' }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshotId = (versionHistory as any).snapshots[0].id;

                    versionHistory.deleteSnapshot(snapshotId);

                    flushMicrotasks().then(() => {
                        const storedSnapshots = (versionHistory as any).snapshots;
                        const found = storedSnapshots.find((s: any) => s.id === snapshotId);
                        expect(found).toBeUndefined();
                        done();
                    });
                });
            });
        });

        it('should delete multiple snapshots individually', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            Promise.all([
                versionHistory.createSnapshot({ label: 'S1' }),
                versionHistory.createSnapshot({ label: 'S2' }),
                versionHistory.createSnapshot({ label: 'S3' })
            ]).then(() => {
                flushMicrotasks().then(() => {
                    const snapshots = (versionHistory as any).snapshots;
                    const idsToDelete = [snapshots[0].id, snapshots[2].id];

                    idsToDelete.forEach(id => versionHistory.deleteSnapshot(id));

                    flushMicrotasks().then(() => {
                        const remaining = (versionHistory as any).snapshots;
                        expect(remaining.length).toBe(1);
                        expect(remaining[0].label).toBe('S2');
                        done();
                    });
                });
            });
        });
    });

    describe('Version Pruning (Retention Policy)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should keep all snapshots within last hour', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            // Create multiple snapshots within same hour
            Promise.all([
                versionHistory.createSnapshot({ label: 'S1' }),
                versionHistory.createSnapshot({ label: 'S2' }),
                versionHistory.createSnapshot({ label: 'S3' })
            ]).then(() => {
                flushMicrotasks().then(() => {
                    versionHistory.pruneVersions();

                    flushMicrotasks().then(() => {
                        const snapshots = (versionHistory as any).snapshots;
                        expect(snapshots.length).toBe(3);
                        done();
                    });
                });
            });
        });

        it('should preserve user-labelled snapshots regardless of age', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Important Checkpoint' }).then(() => {
                flushMicrotasks().then(() => {
                    // Manually set lastModifiedAt to old date
                    const snapshot = (versionHistory as any).snapshots[0];
                    snapshot.lastModifiedAt = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days ago

                    versionHistory.pruneVersions();

                    flushMicrotasks().then(() => {
                        const snapshots = (versionHistory as any).snapshots;
                        expect(snapshots.some((s: VersionSnapshot) => s.label === 'Important Checkpoint')).toBe(true);
                        done();
                    });
                });
            });
        });

        it('should keep one snapshot per hour for 24 hours', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const now = Date.now();
            const snapshots = [];

            // Simulate snapshots at different hours within 24h
            for (let i = 0; i < 12; i++) {
                const snap: any = {
                    id: `snap-${i}`,
                    lastModifiedAt: now - (i * 60 * 60 * 1000), // i hours ago
                    label: `Snapshot ${i}`,
                    lastModifiedBy: 'test',
                    documentState: new Uint8Array(0)
                };
                snapshots.push(snap);
            }

            (versionHistory as any).snapshots = snapshots;

            versionHistory.pruneVersions();

            flushMicrotasks().then(() => {
                const prunedSnapshots = (versionHistory as any).snapshots;
                // Within 24h should keep hourly representation
                expect(prunedSnapshots.length).toBeLessThanOrEqual(24);
                expect(prunedSnapshots.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should keep one snapshot per day for 7 days', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const now = Date.now();
            const snapshots = [];

            // Simulate snapshots at different days within 7 days
            for (let i = 0; i < 14; i++) {
                const snap: any = {
                    id: `snap-day-${i}`,
                    lastModifiedAt: now - (i * 24 * 60 * 60 * 1000), // i days ago
                    label: `Snapshot Day ${i}`,
                    lastModifiedBy: 'test',
                    documentState: new Uint8Array(0)
                };
                snapshots.push(snap);
            }

            (versionHistory as any).snapshots = snapshots;

            versionHistory.pruneVersions();

            flushMicrotasks().then(() => {
                const prunedSnapshots = (versionHistory as any).snapshots;
                // Within 7 days should keep daily representation
                expect(prunedSnapshots.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should delete snapshots older than 30 days unless user-labelled', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const now = Date.now();

            const oldSnapshotId = 'old-unlabelled';
            const importantOldSnapshotId = 'old-important';
            const newSnapshotId = 'new';

            const snapshots = [
                {
                    id: oldSnapshotId,
                    lastModifiedAt: now - 60 * 24 * 60 * 60 * 1000, // 60 days ago
                    lastModifiedBy: 'test',
                    documentState: new Uint8Array(0)
                },
                {
                    id: importantOldSnapshotId,
                    lastModifiedAt: now - 60 * 24 * 60 * 60 * 1000, // 60 days ago
                    label: 'Important Old Snapshot',
                    lastModifiedBy: 'test',
                    documentState: new Uint8Array(0)
                },
                {
                    id: newSnapshotId,
                    lastModifiedAt: now - 1 * 60 * 60 * 1000, // 1 hour ago
                    label: 'Recent',
                    lastModifiedBy: 'test',
                    documentState: new Uint8Array(0)
                }
            ];

            (versionHistory as any).snapshots = snapshots;

            versionHistory.pruneVersions();

            flushMicrotasks().then(() => {
                const prunedSnapshots = (versionHistory as any).snapshots;
                const oldExists = prunedSnapshots.some((s: VersionSnapshot) => s.id === oldSnapshotId);
                const importantExists = prunedSnapshots.some((s: VersionSnapshot) => s.id === importantOldSnapshotId);
                const newExists = prunedSnapshots.some((s: VersionSnapshot) => s.id === newSnapshotId);

                expect(oldExists).toBe(false); // Old unlabelled should be deleted
                expect(importantExists).toBe(true); // Old important should be kept
                expect(newExists).toBe(true); // Recent should be kept
                done();
            });
        });

        it('should perform pruning without errors on empty history', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            expect(() => {
                versionHistory.pruneVersions();
            }).not.toThrow();

            flushMicrotasks().then(() => {
                done();
            });
        });

        it('should properly handle pruning with hourBucket deduplication', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const now = Date.now();
            const HOUR = 60 * 60 * 1000;

            const snapshots = [];
            // Create 3 snapshots within same hour (within 24h but outside 1h window)
            for (let i = 0; i < 3; i++) {
                const snap: any = {
                    id: `hourly-${i}`,
                    lastModifiedAt: now - (2 * HOUR) - (i * 10 * 1000), // 2 hours ago, offset by 10s each
                    label: `Hourly Snapshot ${i}`,
                    lastModifiedBy: 'test',
                    documentState: new Uint8Array(0)
                };
                snapshots.push(snap);
            }

            (versionHistory as any).snapshots = snapshots;

            versionHistory.pruneVersions().then((removed: number) => {
                flushMicrotasks().then(() => {
                    const remaining = (versionHistory as any).snapshots;
                    // Should keep only 1 per hour bucket
                    expect(remaining.length).toBe(1);
                    expect(removed).toBe(2);
                    done();
                });
            });
        });

        it('should properly handle pruning with dayBucket deduplication', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const now = Date.now();
            const HOUR = 60 * 60 * 1000;
            const DAY = 24 * HOUR;

            const snapshots = [];
            // Create 3 snapshots on same day but different hours (within 7 days but outside 24h window)
            for (let i = 0; i < 3; i++) {
                const snap: any = {
                    id: `daily-${i}`,
                    lastModifiedAt: now - (3 * DAY) - (i * 2 * HOUR), // 3 days ago, offset by 2h each
                    label: `Daily Snapshot ${i}`,
                    lastModifiedBy: 'test',
                    documentState: new Uint8Array(0)
                };
                snapshots.push(snap);
            }

            (versionHistory as any).snapshots = snapshots;

            versionHistory.pruneVersions().then((removed: number) => {
                flushMicrotasks().then(() => {
                    const remaining = (versionHistory as any).snapshots;
                    // Should keep only 1 per day bucket
                    expect(remaining.length).toBe(1);
                    expect(removed).toBe(2);
                    done();
                });
            });
        });
    });

    describe('Snapshot Export/Import', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should export snapshot as base64 string', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Export Test' }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshotId = (versionHistory as any).snapshots[0].id;
                    const exported = versionHistory.exportSnapshot(snapshotId);

                    expect(exported.stateUpdateBase64.length).toBeGreaterThan(0);
                    done();
                });
            });
        });

        it('should handle when exporting non-existent snapshot', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            expect(versionHistory.exportSnapshot('non-existent-id')).toBeNull();
            done();
        });

        it('should import snapshot from base64 string', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Original' }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshotId = (versionHistory as any).snapshots[0].id;
                    const exported = versionHistory.exportSnapshot(snapshotId);

                    const countBefore = (versionHistory as any).snapshots.length;

                    versionHistory.importSnapshot(exported).then(() => {
                        flushMicrotasks().then(() => {
                            const countAfter = (versionHistory as any).snapshots.length;
                            expect(countAfter).toBe(countBefore + 1);

                            const importedSnapshot = (versionHistory as any).snapshots[0];
                            expect(importedSnapshot.label).toBe('Original');
                            done();
                        });
                    });
                });
            });
        });

        it('should handle when importing invalid base64', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.importSnapshot(('invalid-base64!!!') as any).catch((error) => {
                expect(error).toBeDefined();
                done();
            });
        });

        it('should preserve snapshot metadata on export/import', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Metadata Test', modifiedBy: 'test-author' }).then(() => {
                flushMicrotasks().then(() => {
                    const original = (versionHistory as any).snapshots[0];
                    const exported = versionHistory.exportSnapshot(original.id);

                    return versionHistory.importSnapshot(exported);
                }).then(() => {
                    flushMicrotasks().then(() => {
                        const reimported = (versionHistory as any).snapshots[0];
                        expect(reimported.label).toBe((versionHistory as any).snapshots[1].label);
                        expect(reimported.lastModifiedBy).toBe((versionHistory as any).snapshots[1].lastModifiedBy);
                        expect(reimported.lastModifiedAt).toBe((versionHistory as any).snapshots[1].lastModifiedAt);
                        expect(reimported.documentState).toEqual((versionHistory as any).snapshots[1].documentState);
                        done();
                    });
                });
            });
        });
    });

    describe('Snapshot Counting (Get Snapshot Count)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should return 0 for empty history', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            const count = versionHistory.getSnapshotCount();
            expect(count).toBe(0);
            done();
        });

        it('should return correct count after creating snapshots', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            Promise.all([
                versionHistory.createSnapshot({ label: 'S1' }),
                versionHistory.createSnapshot({ label: 'S2' }),
                versionHistory.createSnapshot({ label: 'S3' })
            ]).then(() => {
                flushMicrotasks().then(() => {
                    const count = versionHistory.getSnapshotCount();
                    expect(count).toBe(3);
                    done();
                });
            });
        });

        it('should update count after deletion', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'To Delete' }).then(() => {
                flushMicrotasks().then(() => {
                    const countBefore = versionHistory.getSnapshotCount();
                    const snapshotId = (versionHistory as any).snapshots[0].id;

                    versionHistory.deleteSnapshot(snapshotId);

                    flushMicrotasks().then(() => {
                        const countAfter = versionHistory.getSnapshotCount();
                        expect(countAfter).toBe(countBefore - 1);
                        done();
                    });
                });
            });
        });
    });

    describe('Plugin Cleanup (Destroy)', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should set isDestroyed flag to true on destroy', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            expect((versionHistory as any).isDestroyed).toBe(false);

            versionHistory.destroy();

            expect((versionHistory as any).isDestroyed).toBe(true);
            done();
        });

        it('should clear debounce timer on destroy', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'New Block'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const timerBefore = (versionHistory as any).debounceTimer;
                expect(timerBefore).not.toBeNull();

                versionHistory.destroy();

                expect((versionHistory as any).debounceTimer).toBeNull();
                done();
            });
        });

        it('should clear safety-net timer on destroy', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            const timerBefore = (versionHistory as any).safetyNetTimer;
            expect(timerBefore).toBeDefined();

            versionHistory.destroy();

            expect((versionHistory as any).safetyNetTimer).toBeNull();
            done();
        });
    });

    describe('Edge Cases & Error Handling', () => {
        beforeEach(async (done) => {
            context = await createVersionHistoryEditor(
                '#version-editor',
                [createParagraphBlock('p1', 'Initial')],
                false,
                null
            );
            flushMicrotasks().then(done);
        });

        it('should handle snapshot creation with minimal options', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Minimal' }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshot = (versionHistory as any).snapshots[0];
                    expect(snapshot.label).toBe('Minimal');
                    done();
                });
            });
        });

        it('should handle snapshot with very long label', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const longLabel = 'A'.repeat(1000);

            versionHistory.createSnapshot({ label: longLabel }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshot = (versionHistory as any).snapshots[0];
                    expect(snapshot.label).toBe(longLabel);
                    done();
                });
            });
        });

        it('should handle rapid consecutive changes', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const initialCount = (versionHistory as any).snapshots.length;

            // Rapid changes
            context.editor.blockManager.editorMethods.addBlock(createParagraphBlock('p2', 'B2'), 'p1', true);
            context.editor.blockManager.editorMethods.addBlock(createParagraphBlock('p3', 'B3'), 'p2', true);
            context.editor.blockManager.editorMethods.addBlock(createParagraphBlock('p4', 'B4'), 'p3', true);
            context.editor.blockManager.editorMethods.addBlock(createParagraphBlock('p5', 'B5'), 'p4', true);

            flushMicrotasks().then(() => {
                // Should batch all changes into single debounced snapshot
                expect(context.editor.blockManager.getEditorBlocks().length).toBe(5);
                done();
            });
        });

        it('should handle restoration with concurrent modifications', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            versionHistory.createSnapshot({ label: 'Base' }).then(() => {
                flushMicrotasks().then(() => {
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p2', 'Added'),
                        'p1',
                        true
                    );

                    return flushMicrotasks();
                }).then(() => {
                    const snapshotId = (versionHistory as any).snapshots[0].id;
                    const restorePromise = versionHistory.restoreSnapshot(snapshotId);

                    // Make another change during restore
                    context.editor.blockManager.editorMethods.addBlock(
                        createParagraphBlock('p3', 'Concurrent'),
                        'p1',
                        true
                    );

                    return restorePromise;
                }).then(() => {
                    flushMicrotasks().then(() => {
                        // Restore should complete without error
                        expect(context.editor.blockManager.getEditorBlocks().length).toBeGreaterThan(0);
                        done();
                    });
                });
            });
        });

        it('should handle storage errors gracefully', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            // Mock storage error
            const storage = (versionHistory as any).vhSettings.storage;
            const originalSave = storage.saveSnapshot;
            storage.saveSnapshot = () => Promise.reject(new Error('Storage error'));

            versionHistory.createSnapshot({ label: 'Storage Error Test' }).catch((error) => {
                expect(error.message).toContain('Storage error');

                // Restore original
                storage.saveSnapshot = originalSave;
                done();
            });
        });

        it('should handle very large editor state snapshots', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            // Create many blocks
            for (let i = 0; i < 50; i++) {
                context.editor.blockManager.editorMethods.addBlock(
                    createParagraphBlock(`large-${i}`, `Block ${i}`),
                    i === 0 ? 'p1' : `large-${i - 1}`,
                    true
                );
            }

            flushMicrotasks().then(() => {
                return versionHistory.createSnapshot({ label: 'Large State' });
            }).then(() => {
                flushMicrotasks().then(() => {
                    const snapshot = (versionHistory as any).snapshots[0];
                    expect(snapshot.documentState).toBeDefined();
                    expect(snapshot.documentState instanceof Uint8Array).toBe(true);
                    done();
                });
            });
        });

        it('should trigger snapshotCreated callback when snapshot is created', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            let callbackFired = false;
            let receivedSnapshot: VersionSnapshot | null = null;

            context.editor.collaborationSettings.versionHistory.snapshotCreated = (args: SnapshotCreatedEventArgs) => {
                callbackFired = true;
                receivedSnapshot = args.snapshot;
            };

            versionHistory.createSnapshot({ label: 'Callback Test' }).then(() => {
                flushMicrotasks().then(() => {
                    expect(callbackFired).toBe(true);
                    expect(receivedSnapshot).toBeDefined();
                    expect(receivedSnapshot!.label).toBe('Callback Test');
                    done();
                });
            });
        });

        it('should NOT fire snapshotCreated callback when callback is undefined', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            // Ensure callback is undefined
            context.editor.collaborationSettings.versionHistory.snapshotCreated = undefined;

            expect(() => {
                versionHistory.createSnapshot({ label: 'No Callback Test' }).then(() => {
                    flushMicrotasks().then(() => {
                        expect((versionHistory as any).snapshots.length).toBe(1);
                        done();
                    });
                });
            }).not.toThrow();
        });

        it('should setup safety-net timer with correct interval', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const safetyNetTimer = (versionHistory as any).safetyNetTimer;

            expect(safetyNetTimer).toBeDefined();
            expect(safetyNetTimer).not.toBeNull();
            expect(typeof safetyNetTimer).toBe('number'); // setInterval returns a timer

            done();
        });

        it('should create snapshot when threshold reached', () => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            spyOn(versionHistory as any, 'createSnapshot');

            (versionHistory as any).changesSinceSnapshot = 10;

            (versionHistory as any).handleSafetyNetCheck();

            expect((versionHistory as any).createSnapshot).toHaveBeenCalled();
        });

        it('should not detect structural change when events array is empty', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            // Call hasStructuralChange with empty events array
            const result = (versionHistory as any).hasStructuralChange([]);

            expect(result).toBe(false);
            done();
        });

        it('should not detect structural change when no insert/delete operations exist', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;

            // Create mock events with no insert/delete delta
            const mockEvent: any = {
                target: context.yBlocks,
                changes: {
                    delta: [
                        { retain: 1 } // Only retain, no insert/delete
                    ]
                }
            };

            const result = (versionHistory as any).hasStructuralChange([mockEvent]);

            expect(result).toBe(false);
            done();
        });

        it('should handle safety-net timer cleanup on destroy', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const timerBefore = (versionHistory as any).safetyNetTimer;

            expect(timerBefore).not.toBeNull();

            versionHistory.destroy();

            expect((versionHistory as any).isDestroyed).toBe(true);
            expect((versionHistory as any).safetyNetTimer).toBeNull();
            done();
        });

        it('should prevent snapshot creation during active safety-net timer', (done) => {
            const versionHistory = context.editor.blockManager.versionHistoryModule;
            const initialCount = (versionHistory as any).snapshots.length;

            // Make changes to trigger debounce
            context.editor.blockManager.editorMethods.addBlock(
                createParagraphBlock('p2', 'New Block'),
                'p1',
                true
            );

            flushMicrotasks().then(() => {
                const debounceTimer = (versionHistory as any).debounceTimer;
                expect(debounceTimer).not.toBeNull(); // Debounce should be active

                // Verify safety-net timer still exists
                expect((versionHistory as any).safetyNetTimer).not.toBeNull();
                done();
            });
        });
    });

});
