import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { ConnectorModel } from '../../../src/diagram/objects/connector-model';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { PointModel } from '../../../src/diagram/primitives/point-model';
import { UndoRedo } from '../../../src/diagram/objects/undo-redo';
import { DiagramConstraints } from '../../../src/diagram/enum/enum';

Diagram.Inject(UndoRedo);

/**
 * Unsaved Changes Detection Specification
 */
describe('Diagram - Unsaved Changes Detection', () => {

    describe('UCD-000: Dirty State Fundamentals', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_ucd000' });
            document.body.appendChild(ele);
            
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 100 };
            diagram = new Diagram({
                width: '600px', height: '530px', nodes: [node]
            });
            diagram.appendTo('#diagram_ucd000');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Diagram is modified when node exists', () => {
            expect(diagram.isModified).toBe(true);
        });
        it('UI gestures alone do not mark dirty', () => {
            diagram.clearHistory();
            const diagramCanvas: HTMLElement | null = document.getElementById(diagram.element.id + 'content');
            expect(diagram.isModified).toBe(false);
        });
    });

    describe('UCD-001: Dirty-Causing Mutations', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_ucd001' });
            document.body.appendChild(ele);
            
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 100 };
            let connector: ConnectorModel = { id: 'connector1', sourcePoint: { x: 200, y: 200 }, targetPoint: { x: 300, y: 300 } };
            
            diagram = new Diagram({
                width: '600px', height: '530px', nodes: [node], connectors: [connector]
            });
            diagram.appendTo('#diagram_ucd001');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Dirty after node addition', () => {
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);
            
            let newNode: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 200, offsetY: 200 };
            diagram.add(newNode);
            
            expect(diagram.isModified).toBe(true);
        });

        it('Dirty after node deletion', () => {
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);

            diagram.select([diagram.nodes[1]]);
            diagram.remove();
            
            expect(diagram.isModified).toBe(true);
        });

        it('Dirty after connector addition', () => {
            diagram.clearHistory();
            diagram.add({ id: 'node3', width: 100, height: 100, offsetX: 300, offsetY: 300 });
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);
            
            let newConnector: ConnectorModel = { id: 'connector2', sourceID: 'node2', targetID: 'node3' };
            diagram.add(newConnector);
            
            expect(diagram.isModified).toBe(true);
        });

        it('Dirty after node move', () => {
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);
            
            let node: NodeModel = diagram.nodes[0];
            node.offsetX = 150;
            diagram.dataBind();
            
            // Property change should mark dirty
            expect(diagram.isModified).toBe(true);
        });

        it('Dirty after node property change', () => {
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);
            
            let node: NodeModel = diagram.nodes[0];
            node.style = { fill: 'red' };
            diagram.dataBind();
            
            // Property change should mark dirty
            expect(diagram.isModified).toBe(true);
        });

        it('No-op mutation does not mark dirty', () => {
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);
            
            let node: NodeModel = diagram.nodes[0];
            const currentOffsetX = node.offsetX;
            node.offsetX = currentOffsetX;
            diagram.dataBind();
            
            expect(diagram.isModified).toBe(false);
        });
    });

    describe('UCD-002: Mark As Clean', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_ucd002' });
            document.body.appendChild(ele);
            
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 100 };
            diagram = new Diagram({
                width: '600px', height: '530px', nodes: [node]
            });
            diagram.appendTo('#diagram_ucd002');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Clean after explicit save', () => {
            diagram.clearHistory();
            
            let newNode: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 200, offsetY: 200 };
            diagram.add(newNode);
            expect(diagram.isModified).toBe(true);
            
            diagram.saveDiagram();
            expect(diagram.isModified).toBe(false);
        });

        it('Clean after diagram load', () => {
            diagram.clearHistory();
            
            let newNode: NodeModel = { id: 'node3', width: 100, height: 100, offsetX: 300, offsetY: 300 };
            diagram.add(newNode);
            expect(diagram.isModified).toBe(true);
            
            const diagramData = diagram.saveDiagram();
            diagram.loadDiagram(diagramData);
            
            expect(diagram.isModified).toBe(false);
        });

        it('Clean after history clear', () => {
            diagram.clearHistory();
            
            let newNode: NodeModel = { id: 'node4', width: 100, height: 100, offsetX: 400, offsetY: 400 };
            diagram.add(newNode);
            expect(diagram.isModified).toBe(true);
            
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);
        });

        it('MarkAsClean when already clean is a no-op', () => {
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);
            
            diagram.saveDiagram();
            expect(diagram.isModified).toBe(false);
        });
    });

    describe('UCD-003: Undo/Redo Dirty State Integration', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_ucd003' });
            document.body.appendChild(ele);
            
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 100 };
            diagram = new Diagram({
                width: '600px', height: '530px', nodes: [node]
            });
            diagram.appendTo('#diagram_ucd003');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Undo to baseline restores clean', () => {
            diagram.clearHistory();
            diagram.saveDiagram();
            expect(diagram.isModified).toBe(false);
            
            let newNode: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 200, offsetY: 200 };
            diagram.add(newNode);
            expect(diagram.isModified).toBe(true);
            
            diagram.undo();
            expect(diagram.isModified).toBe(false);
        });

        it('Undo to intermediate state remains dirty', () => {
            diagram.clearHistory();
            diagram.saveDiagram();
            
            let newNode1: NodeModel = { id: 'node3', width: 100, height: 100, offsetX: 300, offsetY: 300 };
            let newNode2: NodeModel = { id: 'node4', width: 100, height: 100, offsetX: 400, offsetY: 400 };
            
            diagram.add(newNode1);
            diagram.add(newNode2);
            expect(diagram.isModified).toBe(true);
            
            diagram.undo(); // Undo one change, but still above baseline
            expect(diagram.isModified).toBe(true);
        });

        it('Redo away from baseline restores dirty', () => {
            diagram.redo(); // Redo the change after undo
            expect(diagram.isModified).toBe(true);
        });
    });

    describe('UCD-006: Clear History Integration', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_ucd006' });
            document.body.appendChild(ele);
            
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 100 };
            diagram = new Diagram({
                width: '600px', height: '530px', nodes: [node]
            });
            diagram.appendTo('#diagram_ucd006');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Clear history resets dirty state and baseline', () => {
            let newNode: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 200, offsetY: 200 };
            diagram.add(newNode);
            expect(diagram.isModified).toBe(true);
            
            diagram.clearHistory();
            expect(diagram.isModified).toBe(false);
        });
    });

    describe('UCD-021: Architectural Constraints', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_ucd021' });
            document.body.appendChild(ele);
            
            let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 100 };
            diagram = new Diagram({
                width: '600px', height: '530px', nodes: [node]
            });
            diagram.appendTo('#diagram_ucd021');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('isModified is not serialized in save output', () => {
            diagram.clearHistory();
            
            let newNode: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 200, offsetY: 200 };
            diagram.add(newNode);
            
            const saved = diagram.saveDiagram();
            expect(saved).not.toContain('isModified');
        });

        it('Serialization does not include dirty state metadata', () => {
            const saved = diagram.saveDiagram();
            const parsed = JSON.parse(saved);
            
            expect(parsed.isModified).toBeUndefined();
            expect(parsed._isModified).toBeUndefined();
            expect(parsed._cleanHistoryIndex).toBeUndefined();
        });
    });
});
