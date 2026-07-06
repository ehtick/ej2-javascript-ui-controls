/* eslint-disable @typescript-eslint/no-explicit-any */

import { YjsPosition } from '../../../src/collaboration/y-blockeditor/utils/position';
import { createCollabEditor, destroyCollab, flushMicrotasks, createParagraphBlock, CollabEditorContext } from '../helpers/collab-util.spec';
import { createElement } from '@syncfusion/ej2-base';
import { deriveCursorColors, getRelativeLuminance } from '../../../src/collaboration/y-blockeditor/utils/color';

declare const Y: any;

describe('Common Collaboration Utils', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;
    let position: YjsPosition;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'common-editor' });
        document.body.appendChild(editorElement);
        context = createCollabEditor('#common-editor', [createParagraphBlock('p1', 'Test')]);
        position = context.manager.syncBinding.yjsPosition;
    });

    afterEach(() => {
        if (context) {
            destroyCollab(context);
        }
        if (editorElement && editorElement.parentNode) {
            document.body.removeChild(editorElement);
        }
    });

    describe('Position', () => {
        describe('compareIDs', () => {

            it('should return true when both references are same', () => {
                const id = { client: 1, clock: 10 };

                expect(position['compareIDs'](id, id)).toBe(true);
            });

            it('should return false when one value is null', () => {
                expect(position['compareIDs'](null, { client: 1, clock: 10 })).toBe(false);
                expect(position['compareIDs']({ client: 1, clock: 10 }, null)).toBe(false);
            });

            it('should return false when both values are null but not same reference branch', () => {
                expect(position['compareIDs'](undefined, null)).toBe(false);
            });

            it('should return true when client and clock are equal', () => {
                const a = { client: 1, clock: 10 };
                const b = { client: 1, clock: 10 };

                expect(position['compareIDs'](a, b)).toBe(true);
            });

            it('should return false when client differs', () => {
                const a = { client: 1, clock: 10 };
                const b = { client: 2, clock: 10 };

                expect(position['compareIDs'](a, b)).toBe(false);
            });

            it('should return false when clock differs', () => {
                const a = { client: 1, clock: 10 };
                const b = { client: 1, clock: 20 };

                expect(position['compareIDs'](a, b)).toBe(false);
            });

        });

        describe('compareRelativePositions', () => {

            it('should return true when both references are same', () => {
                const pos = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                expect(position.compareRelativePositions(pos as any, pos as any)).toBe(true);
            });

            it('should return false when one value is null', () => {
                const pos = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                expect(position.compareRelativePositions(null, pos as any)).toBe(false);
                expect(position.compareRelativePositions(pos as any, null)).toBe(false);
            });

            it('should return true when all properties match', () => {
                const a = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                const b = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                expect(position.compareRelativePositions(a as any, b as any)).toBe(true);
            });

            it('should return false when tname differs', () => {
                const a = {
                    tname: 'text1',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                const b = {
                    tname: 'text2',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                expect(position.compareRelativePositions(a as any, b as any)).toBe(false);
            });

            it('should return false when item differs', () => {
                const a = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                const b = {
                    tname: 'text',
                    item: { client: 9, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                expect(position.compareRelativePositions(a as any, b as any)).toBe(false);
            });

            it('should return false when type differs', () => {
                const a = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                const b = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 5, clock: 2 },
                    assoc: 0
                };

                expect(position.compareRelativePositions(a as any, b as any)).toBe(false);
            });

            it('should return false when assoc differs', () => {
                const a = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 0
                };

                const b = {
                    tname: 'text',
                    item: { client: 1, clock: 1 },
                    type: { client: 2, clock: 2 },
                    assoc: 1
                };

                expect(position.compareRelativePositions(a as any, b as any)).toBe(false);
            });

        });
    });

    describe('Color', () => {
        describe('getRelativeLuminance', () => {

            it('should return 0 for pure black', () => {
                const result = getRelativeLuminance({
                    r: 0,
                    g: 0,
                    b: 0
                });

                expect(result).toBe(0);
            });

            it('should return high luminance for pure white', () => {
                const result = getRelativeLuminance({
                    r: 255,
                    g: 255,
                    b: 255
                });

                expect(result).toBeGreaterThan(0.9);
            });

            it('should process mixed rgb values', () => {
                const result = getRelativeLuminance({
                    r: 120,
                    g: 140,
                    b: 160
                });

                expect(result).toBeGreaterThan(0);
            });

        });

        describe('deriveCursorColors', () => {

            it('should derive colors from 6 digit hex', () => {
                const result = deriveCursorColors('#336699');

                expect(result.caret).toContain('rgb');
                expect(result.selection).toContain('rgba');
                expect(result.selection).toContain('0.15');
            });

            it('should derive colors from 3 digit hex', () => {
                const result = deriveCursorColors('#369');

                expect(result.caret).toContain('rgb');
                expect(result.selection).toContain('rgba');
            });

            it('should derive colors from rgb()', () => {
                const result = deriveCursorColors('rgb(10, 20, 30)');

                expect(result.caret).toBe('rgb(10, 20, 30)');
                expect(result.selection).toBe('rgba(10, 20, 30, 0.15)');
            });

            it('should derive colors from rgba()', () => {
                const result = deriveCursorColors('rgba(100, 150, 200, 0.5)');

                expect(result.caret).toBe('rgb(100, 150, 200)');
                expect(result.selection).toBe('rgba(100, 150, 200, 0.15)');
            });

            it('should darken caret color for very bright colors', () => {
                const result = deriveCursorColors('#ffffff');

                expect(result.caret).not.toBe('rgb(255, 255, 255)');
                expect(result.selection).toBe('rgba(255, 255, 255, 0.15)');
            });

            it('should keep caret color unchanged for darker colors', () => {
                const result = deriveCursorColors('#000000');

                expect(result.caret).toBe('rgb(0, 0, 0)');
                expect(result.selection).toBe('rgba(0, 0, 0, 0.15)');
            });

            it('should return original color when invalid hex length is provided', () => {
                const result = deriveCursorColors('#12');

                expect(result.caret).toBe('#12');
                expect(result.selection).toBe('#12');
            });

            it('should return original color when invalid string is provided', () => {
                const result = deriveCursorColors('invalid-color');

                expect(result.caret).toBe('invalid-color');
                expect(result.selection).toBe('invalid-color');
            });

        });
    })

});
