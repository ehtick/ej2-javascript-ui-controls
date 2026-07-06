/* eslint-disable @typescript-eslint/no-explicit-any */

import { BaseChildrenProp, BlockModel, BlockType, ContentModel, ContentType } from '../../../src/index';
import { Conversion } from '../../../src/collaboration/y-blockeditor/utils/conversion';
import { YjsAdapter } from '../../../src/models/interface';
import { createParagraphBlock } from '../helpers/collab-util.spec';
import { InternalYRuntime } from '../../../src/collaboration/y-blockeditor/base/interface';

declare const Y: any;

describe('Conversion Utility', () => {
    let conversion: Conversion;
    let ydoc: any;
    let adapter: YjsAdapter;
    let manager: any;

    beforeEach(() => {
        ydoc = new Y.Doc()
        adapter = {
            yRuntime: Y,
            yXmlFragment: ydoc.getXmlFragment('blockeditor')
        };
        manager = {
            getYRuntime: () => {
                return adapter.yRuntime as InternalYRuntime
            }
        };
        conversion = new Conversion(manager);
    });

    afterEach(() => {
        ydoc.destroy();
    });

    describe('blockModelToYElement', () => {
        it('should produce Y.XmlElement with correct tag name equal to blockType', () => {
            const block = createParagraphBlock('p1', 'Test');
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.nodeName).toBe('Paragraph');
        });

        it('should set id attribute on the element', () => {
            const block = createParagraphBlock('test-id-123', 'Content');
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.getAttribute('id')).toBe('test-id-123');
        });

        it('should set indent attribute when present', () => {
            const block: BlockModel = {
                id: 'p1',
                blockType: BlockType.Paragraph,
                indent: 2,
                content: []
            };
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.getAttribute('indent')).toBe('2');
        });

        it('should recursively convert nested callout children', () => {
            const block = {
                id: 'callout1',
                blockType: BlockType.Callout,
                properties: {
                    children: [
                        createParagraphBlock('child1', 'Child 1'),
                        createParagraphBlock('child2', 'Child 2')
                    ]
                },
                content: [] as any
            };
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.nodeName).toBe('Callout');
            expect(yElement.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('contentToYXmlText', () => {
        it('should produce Y.XmlText with matching plain text content', () => {
            const content = [
                { contentType: ContentType.Text, content: 'Hello World' }
            ];
            const yText = conversion.contentToYXmlText(content);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yText]);
            });

            expect(yText.toString()).toBe('Hello World');
        });

        it('should handle empty content array', () => {
            const content: any[] = [];
            const yText = conversion.contentToYXmlText(content);

            expect(yText.toString()).toBe('');
        });

        it('should preserve formatted text attributes', () => {
            const content: ContentModel[] = [
                {
                    contentType: ContentType.Text,
                    content: 'Bold Text',
                    properties: { styles: { bold: true } } as any
                }
            ];
            const yText = conversion.contentToYXmlText(content);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yText]);
            });

            const delta = yText.toDelta();

            expect(delta[0].attributes.bold).toBe(true);
        });
    });

    describe('yElementToBlockModel', () => {
        it('should reconstruct blockType from element tag name', () => {
            const yElement = new Y.XmlElement('Heading');
            yElement.setAttribute('id', 'h1');
            yElement.setAttribute('level', 1);
            const yText = new Y.XmlText();
            yText.insert(0, 'Title');
            yElement.insert(0, [yText]);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            const block = conversion.yElementToBlockModel(yElement);

            expect(block.blockType).toBe(BlockType.Heading);
        });

        it('should reconstruct block id', () => {
            const yElement = new Y.XmlElement('Paragraph');
            yElement.setAttribute('id', 'unique-123');
            const yText = new Y.XmlText();
            yText.insert(0, 'Content');
            yElement.insert(0, [yText]);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            const block = conversion.yElementToBlockModel(yElement);

            expect(block.id).toBe('unique-123');
        });

        it('should reconstruct nested children for callout', () => {
            const yCallout = new Y.XmlElement('Callout');
            yCallout.setAttribute('id', 'callout1');

            const yChild = new Y.XmlElement('Paragraph');
            yChild.setAttribute('id', 'child1');
            const yText = new Y.XmlText();
            yText.insert(0, 'Child content');
            yChild.insert(0, [yText]);

            yCallout.insert(0, [yChild]);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yCallout]);
            });

            const block = conversion.yElementToBlockModel(yCallout);

            expect((block.properties as any).children).toBeDefined();
        });

        it('should reconstruct Table from Y.XmlElement', () => {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table1');

            // Add columns
            const yCol1 = new Y.XmlElement('tableColumn');
            yCol1.setAttribute('id', 'col1');
            yCol1.setAttribute('type', 'Text');
            yCol1.setAttribute('headerText', 'Column 1');
            yCol1.setAttribute('width', '100px');

            const yCol2 = new Y.XmlElement('tableColumn');
            yCol2.setAttribute('id', 'col2');
            yCol2.setAttribute('type', 'Number');
            yCol2.setAttribute('headerText', 'Column 2');
            yCol2.setAttribute('width', '150px');

            // Add row with cells
            const yRow = new Y.XmlElement('tableRow');
            yRow.setAttribute('id', 'row1');

            const yCell1 = new Y.XmlElement('tableCell');
            yCell1.setAttribute('id', 'cell1');
            yCell1.setAttribute('columnId', 'col1');

            const yCellBlock = new Y.XmlElement('Paragraph');
            yCellBlock.setAttribute('id', 'cellp1');
            const yText = new Y.XmlText();
            yText.insert(0, 'Cell content');
            yCellBlock.insert(0, [yText]);
            yCell1.insert(0, [yCellBlock]);

            const yCell2 = new Y.XmlElement('tableCell');
            yCell2.setAttribute('id', 'cell2');
            yCell2.setAttribute('columnId', 'col2');

            yRow.insert(0, [yCell1, yCell2]);
            yTable.insert(0, [yCol1, yCol2, yRow]);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yTable]);
            });

            // Convert to BlockModel
            const block = conversion.yElementToBlockModel(yTable);

            expect(block.blockType).toBe(BlockType.Table);
            expect((block.properties as any).columns).toBeDefined();
            expect((block.properties as any).columns.length).toBe(2);
            expect((block.properties as any).columns[0].id).toBe('col1');
            expect((block.properties as any).columns[0].headerText).toBe('Column 1');
            expect((block.properties as any).columns[0].width).toBe('100px');
            expect((block.properties as any).rows).toBeDefined();
            expect((block.properties as any).rows.length).toBe(1);
            expect((block.properties as any).rows[0].cells.length).toBe(2);
            expect((block.properties as any).rows[0].cells[0].blocks.length).toBe(1);
            expect((block.properties as any).rows[0].cells[0].blocks[0].content[0].content).toBe('Cell content');
        });

        it('should reconstruct Table from Y.XmlElement with limited props', function () {
            const yTable = new Y.XmlElement('Table');
            yTable.setAttribute('id', 'table1');
            const yCol1 = new Y.XmlElement('tableColumn');
            const yCol2 = new Y.XmlElement('tableColumn');
            const yRow = new Y.XmlElement('tableRow');
            const yCell1 = new Y.XmlElement('tableCell');
            const yCellBlock = new Y.XmlElement('Paragraph');
            yCellBlock.setAttribute('id', 'cellp1');
            const yText = new Y.XmlText();
            yText.insert(0, 'Cell content');
            yCellBlock.insert(0, [yText]);
            yCell1.insert(0, [yCellBlock]);
            const yCell2 = new Y.XmlElement('tableCell');
            yRow.insert(0, [yCell1, yCell2]);
            yTable.insert(0, [yCol1, yCol2, yRow]);
            ydoc.transact(function () {
                ydoc.getXmlFragment('test').insert(0, [yTable]);
            });
            const block = conversion.yElementToBlockModel(yTable);
            expect(block.blockType).toBe(BlockType.Table);
            expect(block.properties.columns).toBeDefined();
            expect(block.properties.columns.length).toBe(2);
            expect(block.properties.columns[0].id).toBeUndefined();
            expect(block.properties.columns[0].headerText).toBeUndefined();
            expect(block.properties.columns[0].width).toBeUndefined();
            expect(block.properties.rows).toBeDefined();
            expect(block.properties.rows.length).toBe(1);
            expect(block.properties.rows[0].cells.length).toBe(2);
            expect(block.properties.rows[0].cells[0].blocks.length).toBe(1);
            expect(block.properties.rows[0].cells[0].blocks[0].content[0].content).toBe('Cell content');
        });

        it('should reconstruct block content and nested children for collapsible', () => {
            const yCollapsible = new Y.XmlElement('CollapsibleParagraph');
            yCollapsible.setAttribute('id', 'collapse-1');

            const yTextContent = new Y.XmlText();
            yTextContent.insert(0, 'Click here to expand');
            yCollapsible.insert(0, [yTextContent]);

            const yChild = new Y.XmlElement('Paragraph');
            yChild.setAttribute('id', 'child1');
            const yText = new Y.XmlText();
            yText.insert(0, 'Child content');
            yChild.insert(0, [yText]);

            yCollapsible.insert(1, [yChild]);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yCollapsible]);
            });

            const block = conversion.yElementToBlockModel(yCollapsible);

            expect(block.content[0].content).toBe('Click here to expand');
            expect((block.properties as BaseChildrenProp).children).toBeDefined();
            expect((block.properties as BaseChildrenProp).children.length).toBe(1);
        });
    });

    describe('yTextToContentModel', () => {
        it('should return ContentModel[] with matching text', () => {
            const yText = new Y.XmlText();
            yText.insert(0, 'Test Content');

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yText]);
            });

            const content = conversion.yTextToContentModel(yText);

            expect(content.length).toBeGreaterThan(0);
            expect(content[0].content).toBe('Test Content');
        });

        it('should set contentType label when labelId attribute present', () => {
            const yText = new Y.XmlText();
            yText.insert(0, '@label', { labelId: 'label-123' });

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yText]);
            });

            const content = conversion.yTextToContentModel(yText);

            expect(content[0].contentType).toBe(ContentType.Label);
        });

        it('should set contentType mention when userId attribute present', () => {
            const yText = new Y.XmlText();
            yText.insert(0, '@user', { userId: 'user-123' });

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yText]);
            });

            const content = conversion.yTextToContentModel(yText);

            expect(content[0].contentType).toBe(ContentType.Mention);
        });

        it('should handle empty Y.XmlText', () => {
            const yText = new Y.XmlText();

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yText]);
            });

            const content = conversion.yTextToContentModel(yText);

            expect(content.length).toBe(0);
        });
    });

    describe('yFragmentToBlocks', () => {
        it('should return all top-level blocks in correct order', () => {
            const yFragment = ydoc.getXmlFragment('test');

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

            yFragment.insert(0, [yBlock1, yBlock2]);

            const blocks = conversion.yFragmentToBlocks(yFragment);

            expect(blocks.length).toBe(2);
            expect(blocks[0].id).toBe('p1');
            expect(blocks[1].id).toBe('p2');
        });

        it('should return empty array for empty fragment', () => {
            const yFragment = ydoc.getXmlFragment('empty');

            const blocks = conversion.yFragmentToBlocks(yFragment);

            expect(blocks.length).toBe(0);
        });
    });

    describe('Structural block detection', () => {
        it('should handle callout block conversion', () => {
            const block: BlockModel = {
                id: 'callout1',
                blockType: BlockType.Callout,
                content: [] as any,
                properties: {
                    children: [createParagraphBlock('p1', 'Test')]
                }
            };
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.nodeName).toBe('Callout');
        });

        it('should handle table block conversion', () => {
            const block: BlockModel = {
                id: 'table_block',
                blockType: BlockType.Table,
                properties: {
                    columns: [{ id: 'col1', headerText: 'Col 1', width: 100 }, { id: 'col2', headerText: 'Col 2', width: 100 }],
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
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.nodeName).toBe('Table');
        });

        it('should handle quote block conversion', () => {
            const block: BlockModel = {
                id: 'quote1',
                blockType: BlockType.Quote,
                properties: {},
                content: [] as any
            };
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.nodeName).toBe('Quote');
        });

        it('should handle paragraph block conversion', () => {
            const block = createParagraphBlock('p1', 'Content');
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.nodeName).toBe('Paragraph');
        });

        it('should handle heading block conversion', () => {
            const block: BlockModel = {
                id: 'h1',
                blockType: BlockType.Heading,
                properties: { level: 1 },
                content: [] as any
            };
            const yElement = conversion.blockModelToYElement(block);

            // Add to doc to ensure valid state
            ydoc.transact(() => {
                ydoc.getXmlFragment('test').insert(0, [yElement]);
            });

            expect(yElement.nodeName).toBe('Heading');
        });
    });
});
