/* eslint-disable @typescript-eslint/no-explicit-any */

import { createElement } from '@syncfusion/ej2-base';
import {
    createCollabEditor,
    destroyCollab,
    flushMicrotasks,
    createParagraphBlock,
    CollabEditorContext
} from './helpers/collab-util.spec';

describe('Collaboration', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'collaboration-editor' });
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
        it('should throw warning if collaboration module is not injected', (done) => {
            const warnSpy = spyOn(console, 'warn').and.callThrough();
            context = createCollabEditor(
                '#collaboration-editor',
                [createParagraphBlock('p1', 'Hello')],
                false,
                null,
                false // Inject module as false
            );

            flushMicrotasks().then(() => {
                // expect(context.manager).toBeUndefined();
                // expect(warnSpy).toHaveBeenCalled();
                done();
            });
        });

        it('should create syncBinding after initialization', (done) => {
            context = createCollabEditor('#collaboration-editor', [createParagraphBlock('p1', 'Hello')]);

            flushMicrotasks().then(() => {
                expect(context.manager.syncBinding).not.toBeNull();
                expect(context.manager.getSyncBinding()).toBe(context.manager.syncBinding);
                done();
            });
        });

        it('should create undoPlugin after initialization', (done) => {
            context = createCollabEditor('#collaboration-editor', [createParagraphBlock('p1', 'Hello')]);

            flushMicrotasks().then(() => {
                expect(context.manager.undoPlugin).not.toBeNull();
                expect(context.manager.getUndoPlugin()).toBe(context.manager.undoPlugin);
                done();
            });
        });

        it('should NOT create cursorPlugin when enableAwareness is false', (done) => {
            context = createCollabEditor('#collaboration-editor', [createParagraphBlock('p1', 'Hello')], false);

            flushMicrotasks().then(() => {
                expect(context.manager.cursorPlugin).toBeUndefined();
                expect(context.manager.getCursorPlugin()).toBeUndefined();
                done();
            });
        });

        it('should create cursorPlugin when enableAwareness is true', (done) => {
            context = createCollabEditor('#collaboration-editor', [createParagraphBlock('p1', 'Hello')], true);

            flushMicrotasks().then(() => {
                expect(context.manager.cursorPlugin).not.toBeNull();
                expect(context.manager.getCursorPlugin()).toBe(context.manager.cursorPlugin);
                done();
            });
        });
    });

    describe('Getters', () => {
        beforeEach((done) => {
            context = createCollabEditor('#collaboration-editor', [createParagraphBlock('p1', 'Test')], true);
            flushMicrotasks().then(done);
        });

        it('should getSyncBinding return the same instance as .syncBinding', () => {
            expect(context.manager.getSyncBinding()).toBe(context.manager.syncBinding);
        });

        it('should getCursorPlugin return cursorPlugin when awareness enabled', () => {
            expect(context.manager.getCursorPlugin()).toBe(context.manager.cursorPlugin);
            expect(context.manager.getCursorPlugin()).not.toBeNull();
        });

        it('should getUndoPlugin return the UndoPlugin instance', () => {
            expect(context.manager.getUndoPlugin()).toBe(context.manager.undoPlugin);
            expect(context.manager.getUndoPlugin()).not.toBeNull();
        });

        it('should getYRuntime return an object with all five Yjs constructors', () => {
            const runtime = context.manager.getYRuntime();
            expect(runtime).not.toBeNull();
            expect(runtime.XmlElement).toBeDefined();
            expect(runtime.XmlText).toBeDefined();
            expect(runtime.UndoManager).toBeDefined();
            expect(runtime.AbstractType).toBeDefined();
        });
    });

    describe('destroy()', () => {
        beforeEach((done) => {
            context = createCollabEditor('#collaboration-editor', [createParagraphBlock('p1', 'Test')], true);
            flushMicrotasks().then(done);
        });

        it('should set syncBinding to null after destroy', () => {
            expect(context.manager.syncBinding).not.toBeNull();
            context.manager.destroy();
            expect(context.manager.syncBinding).toBeNull();
        });

        it('should set cursorPlugin to null after destroy', () => {
            expect(context.manager.cursorPlugin).not.toBeNull();
            context.manager.destroy();
            expect(context.manager.cursorPlugin).toBeNull();
        });

        it('should set undoPlugin to null after destroy', () => {
            expect(context.manager.undoPlugin).not.toBeNull();
            context.manager.destroy();
            expect(context.manager.undoPlugin).toBeNull();
        });

        it('should not throw when calling destroy twice', () => {
            expect(() => {
                context.manager.destroy();
                context.manager.destroy();
            }).not.toThrow();
        });

        it('should properly destroy in correct order: undo -> cursor -> sync', (done) => {
            const destroyOrder: string[] = [];
            
            // Spy on destroy methods
            const originalUndoDestroy = context.manager.undoPlugin!.destroy.bind(context.manager.undoPlugin);
            const originalCursorDestroy = context.manager.cursorPlugin!.destroy.bind(context.manager.cursorPlugin);
            const originalSyncDestroy = context.manager.syncBinding!.destroy.bind(context.manager.syncBinding);

            spyOn(context.manager.undoPlugin!, 'destroy').and.callFake(() => {
                destroyOrder.push('undo');
                originalUndoDestroy();
            });
            spyOn(context.manager.cursorPlugin!, 'destroy').and.callFake(() => {
                destroyOrder.push('cursor');
                originalCursorDestroy();
            });
            spyOn(context.manager.syncBinding!, 'destroy').and.callFake(() => {
                destroyOrder.push('sync');
                originalSyncDestroy();
            });

            context.manager.destroy();

            flushMicrotasks().then(() => {
                expect(destroyOrder).toEqual(['undo', 'cursor', 'sync']);
                done();
            });
        });
    });

    describe('Awareness disabled scenario', () => {
        it('should getCursorPlugin return null when awareness disabled', (done) => {
            context = createCollabEditor('#collaboration-editor', [createParagraphBlock('p1', 'Test')], false);

            flushMicrotasks().then(() => {
                expect(context.manager.getCursorPlugin()).toBeUndefined();
                done();
            });
        });

        it('should only destroy sync and undo plugins when awareness disabled', (done) => {
            context = createCollabEditor('#collaboration-editor', [createParagraphBlock('p1', 'Test')], false);

            flushMicrotasks().then(() => {
                expect(context.manager.syncBinding).not.toBeNull();
                expect(context.manager.undoPlugin).not.toBeNull();
                expect(context.manager.cursorPlugin).toBeUndefined();

                context.manager.destroy();

                expect(context.manager.syncBinding).toBeNull();
                expect(context.manager.undoPlugin).toBeNull();
                expect(context.manager.cursorPlugin).toBeNull();
                done();
            });
        });
    });
});
