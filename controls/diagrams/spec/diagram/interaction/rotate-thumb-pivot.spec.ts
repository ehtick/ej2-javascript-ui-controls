import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { PointModel } from '../../../src/diagram/primitives/point-model';
import { Rect } from '../../../src/diagram/primitives/rect';
import { Matrix, transformPointByMatrix, identityMatrix, rotateMatrix } from '../../../src/diagram/primitives/matrix';
import { MouseEvents } from './mouseevents.spec';

/**
 * Rotate Thumb Position Calculation Test for Custom Pivot Point (1, 1)
 * Tests the fix for pivot handle interaction failure at edge positions
 * Verifies that user interaction (rotation) works correctly with custom pivot
 */
describe('Rotate Thumb Interaction - Custom Pivot (1, 1)', () => {
    let diagram: Diagram;
    let ele: HTMLElement;
    let mouseEvents: MouseEvents;

    beforeAll((): void => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip();
            return;
        }
        ele = createElement('div', { id: 'diagram_rotate_pivot_edge' });
        document.body.appendChild(ele);
        mouseEvents = new MouseEvents();
    });

    afterAll((): void => {
        if (diagram) {
            diagram.destroy();
        }
        ele.remove();
    });

    it('Should rotate node successfully with pivot at (1, 1) via rotate thumb interaction', (done: Function) => {
        // Setup: Create node with pivot at (1, 1) - bottom-right corner
        let node: NodeModel = {
            id: 'node_pivot_1_1',
            offsetX: 300,
            offsetY: 300,
            width: 200,
            height: 100,
            pivot: { x: 1, y: 1 },
            style: {
                fill: '#6BA5D7',
                strokeColor: 'white'
            }
        };

        diagram = new Diagram({
            width: 600,
            height: 600,
            nodes: [node]
        });
        diagram.appendTo('#diagram_rotate_pivot_edge');

        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        
        // Step 1: Select the node by clicking on it
        mouseEvents.clickEvent(diagramCanvas, 300, 300);
        expect(diagram.selectedItems.nodes.length).toBe(1);
        
        // Step 2: Locate the rotate thumb DOM element
        let rotateThumbElement: SVGElement = document.querySelector('[id*="rotateThumb"]') as SVGElement;
        expect(rotateThumbElement).toBeDefined();
        
        // Step 3: Get the bounding rectangle of the rotate thumb element
        let thumbRect: any = rotateThumbElement.getBoundingClientRect();
        let thumbCenterX: number = thumbRect.left + thumbRect.width / 2;
        let thumbCenterY: number = thumbRect.top + thumbRect.height / 2;
        
        // Step 4: Calculate rotation endpoint (simulate 45 degree rotation)
        let endX: number = thumbCenterX + 50;
        let endY: number = thumbCenterY - 50;
        
        let initialAngle: number = diagram.nodes[0].rotateAngle || 0;
        
        // Step 5: Perform mouse events to simulate rotation interaction
        // Move mouse to rotate thumb position
        mouseEvents.mouseMoveEvent(diagramCanvas, thumbCenterX - diagram.element.offsetLeft, thumbCenterY - diagram.element.offsetTop);
        // Trigger mouse down at rotate thumb
        mouseEvents.mouseDownEvent(diagramCanvas, thumbCenterX - diagram.element.offsetLeft, thumbCenterY - diagram.element.offsetTop);
        // Move mouse to simulate rotation
        mouseEvents.mouseMoveEvent(diagramCanvas, endX - diagram.element.offsetLeft, endY - diagram.element.offsetTop);
        // Release mouse
        mouseEvents.mouseUpEvent(diagramCanvas, endX - diagram.element.offsetLeft, endY - diagram.element.offsetTop);
        
        // Expected Outcome: Verify node rotates successfully
        let finalAngle: number = diagram.nodes[0].rotateAngle || 0;
        
        // The node should have rotated (angle should be different from initial)
        expect(finalAngle).not.toBe(initialAngle);
        
        done();
    });
});
