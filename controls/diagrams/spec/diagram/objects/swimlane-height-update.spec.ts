/**
 * Test cases for swimlane height update bug fix
 * Bug: 963133 - Swimlane: Height not updated on programmatic decrease; selector updates but lane visuals remain unchanged
 */

import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { NodeModel, SwimLaneModel } from '../../../src/diagram/objects/node-model';
import { Node, SwimLane } from '../../../src/diagram/objects/node';
import { GridPanel, RowDefinition } from '../../../src/diagram/core/containers/grid';
import { UndoRedo } from '../../../src/diagram/objects/undo-redo';

Diagram.Inject(UndoRedo);

xdescribe('Bug 963133 - Swimlane height programmatic update', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll((): void => {
        ele = createElement('div', { id: 'diagramSwimlaneHeightBug' });
        document.body.appendChild(ele);
        let nodes: NodeModel[] = [
            {
                id: 'swimlane1',
                offsetX: 400,
                offsetY: 300,
                width: 600,
                height: 400,
                shape: {
                    type: 'SwimLane',
                    orientation: 'Horizontal',
                    header: {
                        annotation: { content: 'Swimlane Header' },
                        height: 50
                    },
                    lanes: [
                        {
                            id: 'lane1',
                            header: {
                                annotation: { content: 'Lane 1' },
                                width: 50
                            },
                            height: 150,
                            children: [
                                {
                                    id: 'node1',
                                    width: 70,
                                    height: 50,
                                    margin: { left: 70, top: 50 }
                                }
                            ]
                        },
                        {
                            id: 'lane2',
                            header: {
                                annotation: { content: 'Lane 2' },
                                width: 50
                            },
                            height: 150,
                        }
                    ]
                } as SwimLaneModel
            }
        ];
        diagram = new Diagram({
            width: '1000px',
            height: '800px',
            nodes: nodes
        });
        diagram.appendTo('#diagramSwimlaneHeightBug');
    });

    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });

    it('Swimlane height should update correctly when programmatically decreased', (done: Function) => {
        
        let swimlaneNode = diagram.nodes[0] as Node;
        let initialHeight = swimlaneNode.height;
        
        // Store initial row heights
        let grid = swimlaneNode.wrapper.children[0] as GridPanel;
        let initialRowDefs = grid.rowDefinitions();
        let lastRowIndex = initialRowDefs.length - 1;
        let initialLastRowHeight = initialRowDefs[lastRowIndex].height;

        // Programmatically decrease height by 100
        let newHeight = initialHeight - 100;
        swimlaneNode.height = newHeight;
        diagram.dataBind();

        // Verify node height is updated
        expect(swimlaneNode.height).toBe(newHeight);
        
        // Verify wrapper height is updated (main fix validation)
        expect(swimlaneNode.wrapper.height).toBe(newHeight);
        
        // Verify grid height is updated
        let updatedGrid = swimlaneNode.wrapper.children[0] as GridPanel;
        expect(updatedGrid.desiredSize.height).toBe(newHeight);
        
        // Verify last row height is adjusted correctly
        let updatedRowDefs = updatedGrid.rowDefinitions();
        let updatedLastRowHeight = updatedRowDefs[lastRowIndex].height;
        expect(updatedLastRowHeight).toBe(initialLastRowHeight - 100);
        
        done();
    });

    it('Swimlane height should update correctly when programmatically increased', (done: Function) => {
        let swimlaneNode = diagram.nodes[0] as Node;
        let currentHeight = swimlaneNode.height;
        
        // Store current row heights
        let grid = swimlaneNode.wrapper.children[0] as GridPanel;
        let currentRowDefs = grid.rowDefinitions();
        let lastRowIndex = currentRowDefs.length - 1;
        let currentLastRowHeight = currentRowDefs[lastRowIndex].height;

        // Programmatically increase height by 150
        let newHeight = currentHeight + 150;
        swimlaneNode.height = newHeight;
        diagram.dataBind();

        // Verify node height is updated
        expect(swimlaneNode.height).toBe(newHeight);
        
        // Verify wrapper height is updated
        expect(swimlaneNode.wrapper.height).toBe(newHeight);
        
        // Verify grid height is updated
        let updatedGrid = swimlaneNode.wrapper.children[0] as GridPanel;
        expect(updatedGrid.desiredSize.height).toBe(newHeight);
        
        // Verify last row height is adjusted correctly
        let updatedRowDefs = updatedGrid.rowDefinitions();
        let updatedLastRowHeight = updatedRowDefs[lastRowIndex].height;
        expect(updatedLastRowHeight).toBe(currentLastRowHeight + 150);
        
        done();
    });
});

xdescribe('Bug 963133 - Swimlane height update with undo/redo', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll((): void => {
        ele = createElement('div', { id: 'diagramSwimlaneHeightUndoRedo' });
        document.body.appendChild(ele);
        let nodes: NodeModel[] = [
            {
                id: 'swimlane2',
                offsetX: 400,
                offsetY: 300,
                width: 600,
                height: 500,
                shape: {
                    type: 'SwimLane',
                    orientation: 'Horizontal',
                    header: {
                        annotation: { content: 'Test Swimlane' },
                        height: 50
                    },
                    lanes: [
                        {
                            id: 'testlane1',
                            header: {
                                annotation: { content: 'Lane 1' },
                                width: 50
                            },
                            height: 200,
                            children: []
                        },
                        {
                            id: 'testlane2',
                            header: {
                                annotation: { content: 'Lane 2' },
                                width: 50
                            },
                            height: 200,
                            children: []
                        }
                    ]
                } as SwimLaneModel
            }
        ];
        diagram = new Diagram({
            width: '1000px',
            height: '800px',
            nodes: nodes
        });
        diagram.appendTo('#diagramSwimlaneHeightUndoRedo');
    });

    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });

    it('Swimlane height should maintain consistency during undo/redo operations', (done: Function) => {
        let swimlaneNode = diagram.nodes[0] as Node;
        let initialHeight = swimlaneNode.height;
        let initialWrapperHeight = swimlaneNode.wrapper.height;
        
        // Decrease height programmatically
        let decreasedHeight = initialHeight - 150;
        swimlaneNode.height = decreasedHeight;
        diagram.dataBind();

        // Verify decreased height
        expect(swimlaneNode.height).toBe(decreasedHeight);
        expect(swimlaneNode.wrapper.height).toBe(decreasedHeight);
        
        // Perform undo
        diagram.undo();
        
        // Verify height is restored to initial
        expect(swimlaneNode.height).toBe(initialHeight);
        expect(swimlaneNode.wrapper.height).toBe(initialWrapperHeight);
        
        // Verify grid wrapper height matches
        let grid = swimlaneNode.wrapper.children[0] as GridPanel;
        expect(grid.desiredSize.height).toBe(initialHeight);
        
        // Perform redo
        diagram.redo();
        
        // Verify height is back to decreased value
        expect(swimlaneNode.height).toBe(decreasedHeight);
        expect(swimlaneNode.wrapper.height).toBe(decreasedHeight);
        
        // Verify grid wrapper height after redo
        let updatedGrid = swimlaneNode.wrapper.children[0] as GridPanel;
        expect(updatedGrid.desiredSize.height).toBe(decreasedHeight);
        
        done();
    });
});
