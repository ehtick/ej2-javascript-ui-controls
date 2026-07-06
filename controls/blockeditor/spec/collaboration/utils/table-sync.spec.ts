/* eslint-disable @typescript-eslint/no-explicit-any */

import { BlockType, ContentType } from '../../../src/index';
import { TableAction } from '../../../src/collaboration/y-blockeditor/utils/table-sync';
import { createCollabEditor, destroyCollab, flushMicrotasks, createParagraphBlock, CollabEditorContext } from '../helpers/collab-util.spec';
import { createElement } from '@syncfusion/ej2-base';

declare const Y: any;

describe('TableAction - reconstructCellModel and reconstructRowModel', () => {
    let editorElement: HTMLElement;
    let context: CollabEditorContext;
    let tableAction: TableAction;

    beforeEach(() => {
        editorElement = createElement('div', { id: 'table-editor' });
        document.body.appendChild(editorElement);
        context = createCollabEditor('#table-editor', [createParagraphBlock('p1', 'Test')]);
        tableAction = (context.manager.syncBinding as any).tableAction;
    });

    afterEach(() => {
        if (context) {
            destroyCollab(context);
        }
        if (editorElement && editorElement.parentNode) {
            document.body.removeChild(editorElement);
        }
    });

    describe('reconstructCellModel', () => {
        it('should reconstruct TableCellModel from Y.XmlElement with id and columnId', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-test');

            const yCell = new Y.XmlElement('tableCell');
            yCell.setAttribute('id', 'cell-123');
            yCell.setAttribute('columnId', 'col-456');

            const yCellBlock = new Y.XmlElement('Paragraph');
            yCellBlock.setAttribute('id', 'cellp1');
            const yText = new Y.XmlText();
            yText.insert(0, 'Cell content');
            yCellBlock.insert(0, [yText]);

            yCell.insert(0, [yCellBlock]);
            yTable.insert(0, [yCell]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const cellModel = tableAction.reconstructCellModel(yCell);

                expect(cellModel.id).toBe('cell-123');
                expect(cellModel.columnId).toBe('col-456');
                expect(cellModel.blocks).toBeDefined();
                expect(cellModel.blocks!.length).toBe(1);
                expect(cellModel.blocks![0].blockType).toBe(BlockType.Paragraph);
                done();
            });
        });

        it('should handle cell without id attribute', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-no-id');

            const yCell = new Y.XmlElement('tableCell');
            yCell.setAttribute('columnId', 'col-789');

            const yCellBlock = new Y.XmlElement('Paragraph');
            yCellBlock.setAttribute('id', 'cellp2');
            const yText = new Y.XmlText();
            yText.insert(0, 'No ID cell');
            yCellBlock.insert(0, [yText]);

            yCell.insert(0, [yCellBlock]);
            yTable.insert(0, [yCell]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const cellModel = tableAction.reconstructCellModel(yCell);

                expect(cellModel.id).toBeUndefined();
                expect(cellModel.columnId).toBe('col-789');
                expect(cellModel.blocks!.length).toBe(1);
                done();
            });
        });

        it('should handle cell without columnId attribute', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-no-col');

            const yCell = new Y.XmlElement('tableCell');
            yCell.setAttribute('id', 'cell-no-col');

            const yCellBlock = new Y.XmlElement('Paragraph');
            yCellBlock.setAttribute('id', 'cellp3');
            const yText = new Y.XmlText();
            yText.insert(0, 'No column');
            yCellBlock.insert(0, [yText]);

            yCell.insert(0, [yCellBlock]);
            yTable.insert(0, [yCell]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const cellModel = tableAction.reconstructCellModel(yCell);

                expect(cellModel.id).toBe('cell-no-col');
                expect(cellModel.columnId).toBeUndefined();
                expect(cellModel.blocks!.length).toBe(1);
                done();
            });
        });

        it('should handle cell with multiple blocks', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-multi');

            const yCell = new Y.XmlElement('tableCell');
            yCell.setAttribute('id', 'cell-multi');
            yCell.setAttribute('columnId', 'col-multi');

            const yBlock1 = new Y.XmlElement('Paragraph');
            yBlock1.setAttribute('id', 'p1');
            const yText1 = new Y.XmlText();
            yText1.insert(0, 'First');
            yBlock1.insert(0, [yText1]);

            const yBlock2 = new Y.XmlElement('Paragraph');
            yBlock2.setAttribute('id', 'p2');
            const yText2 = new Y.XmlText();
            yText2.insert(0, 'Second');
            yBlock2.insert(0, [yText2]);

            yCell.insert(0, [yBlock1, yBlock2]);
            yTable.insert(0, [yCell]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const cellModel = tableAction.reconstructCellModel(yCell);

                expect(cellModel.blocks!.length).toBe(2);
                done();
            });
        });

        it('should handle cell with empty blocks array', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-empty');

            const yCell = new Y.XmlElement('tableCell');
            yCell.setAttribute('id', 'cell-empty');
            yCell.setAttribute('columnId', 'col-empty');

            yTable.insert(0, [yCell]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const cellModel = tableAction.reconstructCellModel(yCell);

                expect(cellModel.id).toBe('cell-empty');
                expect(cellModel.blocks!.length).toBe(0);
                done();
            });
        });
    });

    describe('reconstructRowModel', () => {
        it('should reconstruct TableRowModel from Y.XmlElement with id and cells', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-row-test');

            const yRow = new Y.XmlElement('tableRow');
            yRow.setAttribute('id', 'row-123');

            const yCell1 = new Y.XmlElement('tableCell');
            yCell1.setAttribute('id', 'cell1');
            yCell1.setAttribute('columnId', 'col1');

            const yBlock1 = new Y.XmlElement('Paragraph');
            yBlock1.setAttribute('id', 'p1');
            const yText1 = new Y.XmlText();
            yText1.insert(0, 'Cell 1');
            yBlock1.insert(0, [yText1]);
            yCell1.insert(0, [yBlock1]);

            const yCell2 = new Y.XmlElement('tableCell');
            yCell2.setAttribute('id', 'cell2');
            yCell2.setAttribute('columnId', 'col2');

            const yBlock2 = new Y.XmlElement('Paragraph');
            yBlock2.setAttribute('id', 'p2');
            const yText2 = new Y.XmlText();
            yText2.insert(0, 'Cell 2');
            yBlock2.insert(0, [yText2]);
            yCell2.insert(0, [yBlock2]);

            yRow.insert(0, [yCell1, yCell2]);
            yTable.insert(0, [yRow]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const rowModel = tableAction.reconstructRowModel(yRow);

                expect(rowModel.id).toBe('row-123');
                expect(rowModel.cells).toBeDefined();
                expect(rowModel.cells!.length).toBe(2);
                expect(rowModel.cells![0].id).toBe('cell1');
                expect(rowModel.cells![1].id).toBe('cell2');
                done();
            });
        });

        it('should handle row without id attribute', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-row-noid');

            const yRow = new Y.XmlElement('tableRow');

            const yCell = new Y.XmlElement('tableCell');
            yCell.setAttribute('id', 'cell-no-row-id');
            yCell.setAttribute('columnId', 'col-no-row');

            const yBlock = new Y.XmlElement('Paragraph');
            yBlock.setAttribute('id', 'p');
            const yText = new Y.XmlText();
            yText.insert(0, 'Content');
            yBlock.insert(0, [yText]);
            yCell.insert(0, [yBlock]);

            yRow.insert(0, [yCell]);
            yTable.insert(0, [yRow]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const rowModel = tableAction.reconstructRowModel(yRow);

                expect(rowModel.id).toBeUndefined();
                expect(rowModel.cells!.length).toBe(1);
                done();
            });
        });

        it('should handle row with empty cells', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-row-empty-cells');

            const yRow = new Y.XmlElement('tableRow');
            yRow.setAttribute('id', 'row-empty');

            yTable.insert(0, [yRow]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const rowModel = tableAction.reconstructRowModel(yRow);

                expect(rowModel.id).toBe('row-empty');
                expect(rowModel.cells!.length).toBe(0);
                done();
            });
        });

        it('should handle row with single cell containing different block types', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-row-single');

            const yRow = new Y.XmlElement('tableRow');
            yRow.setAttribute('id', 'row-single');

            const yCell = new Y.XmlElement('tableCell');
            yCell.setAttribute('id', 'cell-single');
            yCell.setAttribute('columnId', 'col-single');

            const yBlock = new Y.XmlElement('Heading');
            yBlock.setAttribute('id', 'h1');
            yBlock.setAttribute('level', '1');
            const yText = new Y.XmlText();
            yText.insert(0, 'Heading');
            yBlock.insert(0, [yText]);
            yCell.insert(0, [yBlock]);

            yRow.insert(0, [yCell]);
            yTable.insert(0, [yRow]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const rowModel = tableAction.reconstructRowModel(yRow);

                expect(rowModel.cells!.length).toBe(1);
                expect(rowModel.cells![0].blocks![0].blockType).toBe(BlockType.Heading);
                done();
            });
        });

        it('should handle row with multiple cells containing different block types', (done) => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-row-multi-types');

            const yRow = new Y.XmlElement('tableRow');
            yRow.setAttribute('id', 'row-multi-types');

            // Cell 1: Paragraph
            const yCell1 = new Y.XmlElement('tableCell');
            yCell1.setAttribute('id', 'cell-para');
            yCell1.setAttribute('columnId', 'col1');
            const yBlock1 = new Y.XmlElement('Paragraph');
            yBlock1.setAttribute('id', 'p1');
            const yText1 = new Y.XmlText();
            yText1.insert(0, 'Para');
            yBlock1.insert(0, [yText1]);
            yCell1.insert(0, [yBlock1]);

            // Cell 2: Heading
            const yCell2 = new Y.XmlElement('tableCell');
            yCell2.setAttribute('id', 'cell-heading');
            yCell2.setAttribute('columnId', 'col2');
            const yBlock2 = new Y.XmlElement('Heading');
            yBlock2.setAttribute('id', 'h1');
            yBlock2.setAttribute('level', '2');
            const yText2 = new Y.XmlText();
            yText2.insert(0, 'Head');
            yBlock2.insert(0, [yText2]);
            yCell2.insert(0, [yBlock2]);

            // Cell 3: BulletList
            const yCell3 = new Y.XmlElement('tableCell');
            yCell3.setAttribute('id', 'cell-list');
            yCell3.setAttribute('columnId', 'col3');
            const yBlock3 = new Y.XmlElement('BulletList');
            yBlock3.setAttribute('id', 'ul1');
            const yText3 = new Y.XmlText();
            yText3.insert(0, 'Item');
            yBlock3.insert(0, [yText3]);
            yCell3.insert(0, [yBlock3]);

            yRow.insert(0, [yCell1, yCell2, yCell3]);
            yTable.insert(0, [yRow]);

            context.ydoc.transact(() => {
                context.yBlocks.insert(0, [yTable]);
            });

            flushMicrotasks().then(() => {
                const rowModel = tableAction.reconstructRowModel(yRow);

                expect(rowModel.cells!.length).toBe(3);
                expect(rowModel.cells![0].blocks![0].blockType).toBe(BlockType.Paragraph);
                expect(rowModel.cells![1].blocks![0].blockType).toBe(BlockType.Heading);
                expect(rowModel.cells![2].blocks![0].blockType).toBe(BlockType.BulletList);
                done();
            });
        });
    });

    describe('_reconstructColModel', () => {
        it('should reconstruct TableColModel from Y.XmlElement with id and columnId', function (done) {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-test');
            const yColumn = new Y.XmlElement('tableColumn');
            yColumn.setAttribute('id', 'col-1');
            yColumn.setAttribute('headerText', 'Column 1');
            yColumn.setAttribute('width', '100');
            yColumn.setAttribute('type', 'Text');

            yTable.insert(0, [yColumn]);
            context.ydoc.transact(function () {
                context.yBlocks.insert(0, [yTable]);
            }, 'y-sync-plugin');

            flushMicrotasks().then(function () {
                const cellModel = tableAction.reconstructColumnModel(yColumn);
                expect(cellModel.id).toBe('col-1');
                expect(cellModel.headerText).toBe('Column 1');
                expect(cellModel.width).toBe('100');
                expect(cellModel.type).toBe('Text');

                done();
            });
        });
        it('should reconstruct TableColModel from Y.XmlElement without id and other props', function (done) {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table-test');
            const yColumn = new Y.XmlElement('tableColumn');
            yColumn.setAttribute('id', 'col-1');
            yTable.insert(0, [yColumn]);

            context.ydoc.transact(function () {
                context.yBlocks.insert(0, [yTable]);
            }, 'y-sync-plugin');
            flushMicrotasks().then(function () {
                const cellModel = tableAction.reconstructColumnModel(yColumn);
                expect(cellModel.id).toBe('col-1');
                expect(cellModel.headerText).toBeUndefined();
                expect(cellModel.width).toBeUndefined();
                expect(cellModel.type).toBeUndefined();

                done();
            });
        });
    });
});
