/**
 * Auto scroll
 */
import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { BpmnDiagrams } from '../../../src/diagram/objects/bpmn';
import { PointModel } from '../../../src/diagram/primitives/point-model';
import { DiagramContextMenu } from '../../../src/diagram/objects/context-menu';
import { MouseEvents } from './mouseevents.spec';
import { UndoRedo } from '../../../src/diagram/objects/undo-redo';
import { SnapConstraints, BasicShapeModel, DiagramConstraints, ConnectorModel } from '../../../src/diagram/index';
import { profile, inMB, getMemoryProfile } from '../../../spec/common.spec';
Diagram.Inject(BpmnDiagrams, DiagramContextMenu, UndoRedo);
describe('Diagram Control', () => {
    describe('Auto Scroll left and right', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let node1: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 50, offsetY: 150 };
            let node2: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 950, offsetY: 350 };
            let node3: NodeModel = { id: 'node3', width: 100, height: 100, offsetX: 500, offsetY: 50 };
            let node4: NodeModel = { id: 'node4', width: 100, height: 100, offsetX: 500, offsetY: 550 };
            diagram = new Diagram({
                width: '1000px', height: '600px',
                nodes: [node1, node2, node3, node4],
                scrollSettings: { canAutoScroll: true, scrollLimit: 'Infinity', autoScrollFrequency: 9 },
                snapSettings: { constraints: SnapConstraints.None }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking Autoscroll Left', (done: Function) => {
            let dgm: Diagram = diagram;
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            let center: PointModel = (diagram.nodes[0] as NodeModel).wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50, center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25, center.y - 50 - 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25 - 10, center.y - 50 - 25 - 10);
            setTimeout(() => {
                expect(dgm.scroller.horizontalOffset == 10).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x - 50 - 25 - 10, center.y - 50 - 25 - 10);
            }, 110);
        });
        it('Checking Autoscroll right', (done: Function) => {
            let dgm: Diagram = diagram;
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            let center: PointModel = (diagram.nodes[1] as NodeModel).wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50, center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25, center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25 + 10, center.y + 50 + 25 + 10);

            setTimeout(() => {
                expect(dgm.scroller.horizontalOffset == 20 || dgm.scroller.horizontalOffset == 30).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x + 50 + 25 + 10 + 10, center.y + 50 + 25 + 10 + 10);
            }, 110);
        });
    });

    describe('Auto Scroll top and bottom', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let node1: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 50, offsetY: 150 };
            let node2: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 950, offsetY: 350 };
            let node3: NodeModel = { id: 'node3', width: 100, height: 100, offsetX: 500, offsetY: 50 };
            let node4: NodeModel = { id: 'node4', width: 100, height: 100, offsetX: 500, offsetY: 550 };
            diagram = new Diagram({
                width: '1000px', height: '600px',
                nodes: [node1, node2, node3, node4], scrollSettings: { canAutoScroll: true, scrollLimit: 'Infinity' },
                snapSettings: { constraints: SnapConstraints.None }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking Autoscroll top', (done: Function) => {
            let dgm: Diagram = diagram;
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            let center: PointModel = (diagram.nodes[2] as NodeModel).wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50, center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25, center.y - 50 - 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25 - 10, center.y - 50 - 25 - 10);
            setTimeout(() => {
                expect(dgm.scroller.verticalOffset === 10).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x - 50 - 25 - 10, center.y - 50 - 25 - 10);
            }, 110);
        });
        it('Checking Autoscroll bottom', (done: Function) => {
            let dgm: Diagram = diagram;
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            let center: PointModel = (diagram.nodes[3] as NodeModel).wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50, center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25, center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25 + 10, center.y + 50 + 25 + 10);
            setTimeout(() => {
                expect(dgm.scroller.verticalOffset === 20 || dgm.scroller.verticalOffset === 30).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x + 50 + 25 + 10 + 10, center.y + 50 + 25 + 10 + 10);
            }, 110);
        });
    })

    describe('Auto Scroll top and bottom with enabled ruler', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let node1: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 50, offsetY: 150 };
            let node2: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 950, offsetY: 350 };
            let node3: NodeModel = { id: 'node3', width: 100, height: 100, offsetX: 500, offsetY: 50 };
            let node4: NodeModel = { id: 'node4', width: 100, height: 100, offsetX: 500, offsetY: 550 };
            diagram = new Diagram({
                width: '1000px', height: '600px',
                nodes: [node1, node2, node3, node4], scrollSettings: { canAutoScroll: true, scrollLimit: 'Infinity' },
                snapSettings: { constraints: SnapConstraints.None },
                rulerSettings: { showRulers: true },
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking Autoscroll right', (done: Function) => {
            let dgm: Diagram = diagram;
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            let center: PointModel = (diagram.nodes[1] as NodeModel).wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50, center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25, center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25 + 10, center.y + 50 + 25 + 10);
            setTimeout(() => {
                console.log(dgm.scroller.horizontalOffset);
                expect(dgm.scroller.horizontalOffset == -10 || dgm.scroller.horizontalOffset == 30).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x + 50 + 25 + 10 + 10, center.y + 50 + 25 + 10 + 10);
            }, 110);
        });
        it('Checking Autoscroll bottom', (done: Function) => {
            let dgm: Diagram = diagram;
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            let center: PointModel = (diagram.nodes[3] as NodeModel).wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50, center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25, center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25 + 10, center.y + 50 + 25 + 10);
            setTimeout(() => {
                console.log(dgm.scroller.verticalOffset);
                expect(dgm.scroller.verticalOffset === 0 || dgm.scroller.verticalOffset === 30).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x + 50 + 25 + 10 + 10, center.y + 50 + 25 + 10 + 10);
            }, 110);
        });
    });
    describe('Auto Scroll top and bottom with enabled ruler - Check Horizontal offset and vertical offset', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '400px', height: '400px',
                connectors: [{
                    id: 'connector1',
                    type: 'Straight',
                    sourcePoint: { x: 200, y: 200 },
                    targetPoint: { x: 300, y: 300 },
                },
                {
                    id: 'connector2',
                    type: 'Orthogonal',
                    sourcePoint: { x: 300, y: 100 },
                    targetPoint: { x: 400, y: 200 },
                }],
                nodes: [{ id: 'node1', width: 100, height: 100, offsetX: 50, offsetY: 150 }],
                scrollSettings: { canAutoScroll: true, scrollLimit: 'Infinity' },
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking Autoscroll top and check the zoom is consider the viewport center point', (done: Function) => {
            let dgm: Diagram = diagram;
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            let center: PointModel = (diagram.nodes[0] as NodeModel).wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50, center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 100, center.y - 150 - 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 120 - 10, center.y - 50 - 150 - 10);
            setTimeout(function () {
                mouseEvents.mouseUpEvent(diagramCanvas, center.x - 50 - 120 - 10, center.y - 50 - 150 - 10);
                console.log('dgm.scroller.horizontalOffset'+ dgm.scroller.horizontalOffset);
                expect(dgm.scroller.horizontalOffset === 10).toBe(true);
                diagram.zoom(2);
                console.log('dgm.scroller.horizontalOffset'+ dgm.scroller.horizontalOffset);
                expect(dgm.scroller.horizontalOffset === -180).toBe(true);
                done();
            }, 110);
        });
    });
    describe('Virtualization in Canvas mode', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let shape: BasicShapeModel = { type: 'Basic', shape: 'Rectangle', cornerRadius: 10 };
            let node1: NodeModel = { id: 'node', offsetX: 100, offsetY: 100, width: 50, height: 50, shape: shape, borderColor: "red" };
            let shape2: BasicShapeModel = { type: 'Basic', shape: 'Ellipse' };
            let node2: NodeModel = { id: 'node2', offsetX: 400, offsetY: 100, shape: shape2 };
            let shape3: BasicShapeModel = { type: 'Basic', shape: 'Hexagon' };
            let node3: NodeModel = { id: 'node3', offsetX: 600, offsetY: 100, shape: shape3 };
            let shape4: BasicShapeModel = { type: 'Basic', shape: 'Parallelogram' };
            let node4: NodeModel = { id: 'node4', offsetX: 900, offsetY: 100, shape: shape4 };
            let shape5: BasicShapeModel = { type: 'Basic', shape: 'Triangle' };
            let node5: NodeModel = { id: 'node5', offsetX: 1200, offsetY: 100, shape: shape5 };
            let shape6: BasicShapeModel = { type: 'Basic', shape: 'Plus' };
            let node6: NodeModel = { id: 'node6', offsetX: 100, offsetY: 300, shape: shape6 };
            let shape7: BasicShapeModel = { type: 'Basic', shape: 'Star' };
            let node7: NodeModel = { id: 'node7', offsetX: 300, offsetY: 300, shape: shape7 };
            let shape8: BasicShapeModel = { type: 'Basic', shape: 'Pentagon' };
            let node8: NodeModel = { id: 'node8', offsetX: 600, offsetY: 300, shape: shape8 };
            let shape9: BasicShapeModel = { type: 'Basic', shape: 'Heptagon' };
            let node9: NodeModel = { id: 'node9', offsetX: 900, offsetY: 300, shape: shape9 };
            let shape10: BasicShapeModel = { type: 'Basic', shape: 'Octagon' };
            let node10: NodeModel = { id: 'node10', offsetX: 1200, offsetY: 300, shape: shape10 };
            let shape11: BasicShapeModel = { type: 'Basic', shape: 'Trapezoid' };
            let node11: NodeModel = { id: 'node11', offsetX: 100, offsetY: 500, shape: shape11 };
            let shape12: BasicShapeModel = { type: 'Basic', shape: 'Decagon' };
            let node12: NodeModel = { id: 'node12', offsetX: 300, offsetY: 500, shape: shape12 };
            let shape13: BasicShapeModel = { type: 'Basic', shape: 'RightTriangle' };
            let node13: NodeModel = { id: 'node13', offsetX: 600, offsetY: 500, shape: shape13 };
            let shape14: BasicShapeModel = { type: 'Basic', shape: 'Cylinder' };
            let node14: NodeModel = { id: 'node14', offsetX: 900, offsetY: 500, shape: shape14 };
            let shape15: BasicShapeModel = { type: 'Basic', shape: 'Diamond', };
            let node15: NodeModel = { id: 'node15', offsetX: 1200, offsetY: 500, shape: shape15 };
            diagram = new Diagram({
                width: 500, height: 500,
                constraints: DiagramConstraints.Default | DiagramConstraints.Virtualization,
                scrollSettings: { canAutoScroll: true, scrollLimit: 'Infinity' },
                mode: 'Canvas',
                nodes: [node1, node2, node3, node4, node5, node6, node7,
                    node8, node9, node10, node11, node12, node13, node14, node15]
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('checking initial rendering and zooming', (done: Function) => {
            let element = document.getElementById('diagram_diagram');
            let width = element.getAttribute("width");
            let height = element.getAttribute("height");
            expect(width === '750' && height === '750').toBe(true);
            done();

        });
        it('Checking Autoscroll canvas diagram', (done: Function) => {
            let diagramCanvas = document.getElementById(diagram.element.id + 'content');
            let mouseEvents = new MouseEvents();
            let center = diagram.nodes[1].wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50, center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25, center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25 + 10, center.y + 50 + 25 + 10);
            setTimeout(() => {
                mouseEvents.mouseUpEvent(diagramCanvas, center.x + 50 + 25 + 10 + 10, center.y + 50 + 25 + 10 + 10);
                let element = document.getElementById('diagram_diagram');
                let value = element.getAttribute("style");
                console.log(value);
                console.log("position: absolute; left: 20px; top: 0px; transform: scale(0.666667); transform-origin: 0px 0px 0px;");
                expect(((value === 'position: absolute; left: 20px; top: 0px; transform: scale(0.666667); transform-origin: 0px 0px;') ||
                    (value === "position: absolute; left: 20px; top: 0px; transform: scale(0.666667); transform-origin: 0px 0px 0px;")
                )).toBe(true);
                done();
            }, 250);

        });
        it('zoom in zoom out node selection', (done: Function) => {
            let node = diagram.nameTable['node'];
            diagram.select([node]);
            var selecelement = document.getElementById('borderRect');
            let oldxvalue = selecelement.getAttribute("x");
            let oldyvalue = selecelement.getAttribute("y");
            diagram.zoom(1.8);
            let selecelement1 = document.getElementById('borderRect');
            let xvalue = selecelement1.getAttribute("x");
            let yvalue = selecelement1.getAttribute("y");
            expect(oldxvalue === '75' && oldyvalue === '75' && xvalue === '135' && yvalue === '135').toBe(true);
            diagram.zoom(.5);
            var selecelement2 = document.getElementById('borderRect');
            var xvalue2 = selecelement2.getAttribute("x");
            var yvalue2 = selecelement2.getAttribute("y");
            done();
        });
    });
    describe('Virtualization in SVG mode', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let shape: BasicShapeModel = { type: 'Basic', shape: 'Rectangle', cornerRadius: 10 };
            let node1: NodeModel = { id: 'node', offsetX: 100, offsetY: 100, width: 50, height: 50, shape: shape, borderColor: "red" };
            let shape2: BasicShapeModel = { type: 'Basic', shape: 'Ellipse' };
            let node2: NodeModel = { id: 'node2', offsetX: 400, offsetY: 100, shape: shape2 };
            let shape3: BasicShapeModel = { type: 'Basic', shape: 'Hexagon' };
            let node3: NodeModel = { id: 'node3', offsetX: 600, offsetY: 100, shape: shape3 };
            let shape4: BasicShapeModel = { type: 'Basic', shape: 'Parallelogram' };
            let node4: NodeModel = { id: 'node4', offsetX: 900, offsetY: 100, shape: shape4 };
            let shape5: BasicShapeModel = { type: 'Basic', shape: 'Triangle' };
            let node5: NodeModel = { id: 'node5', offsetX: 1200, offsetY: 100, shape: shape5 };
            let shape6: BasicShapeModel = { type: 'Basic', shape: 'Plus' };
            let node6: NodeModel = { id: 'node6', offsetX: 100, offsetY: 300, shape: shape6 };
            let shape7: BasicShapeModel = { type: 'Basic', shape: 'Star' };
            let node7: NodeModel = { id: 'node7', offsetX: 300, offsetY: 300, shape: shape7 };
            let shape8: BasicShapeModel = { type: 'Basic', shape: 'Pentagon' };
            let node8: NodeModel = { id: 'node8', offsetX: 600, offsetY: 300, shape: shape8 };
            let shape9: BasicShapeModel = { type: 'Basic', shape: 'Heptagon' };
            let node9: NodeModel = { id: 'node9', offsetX: 900, offsetY: 300, shape: shape9 };
            let shape10: BasicShapeModel = { type: 'Basic', shape: 'Octagon' };
            let node10: NodeModel = { id: 'node10', offsetX: 1200, offsetY: 300, shape: shape10 };
            let shape11: BasicShapeModel = { type: 'Basic', shape: 'Trapezoid' };
            let node11: NodeModel = { id: 'node11', offsetX: 100, offsetY: 500, shape: shape11 };
            let shape12: BasicShapeModel = { type: 'Basic', shape: 'Decagon' };
            let node12: NodeModel = { id: 'node12', offsetX: 300, offsetY: 500, shape: shape12 };
            let shape13: BasicShapeModel = { type: 'Basic', shape: 'RightTriangle' };
            let node13: NodeModel = { id: 'node13', offsetX: 600, offsetY: 500, shape: shape13 };
            let shape14: BasicShapeModel = { type: 'Basic', shape: 'Cylinder' };
            let node14: NodeModel = { id: 'node14', offsetX: 900, offsetY: 500, shape: shape14 };
            let shape15: BasicShapeModel = { type: 'Basic', shape: 'Diamond', };
            let node15: NodeModel = { id: 'node15', offsetX: 1200, offsetY: 500, shape: shape15 };
            diagram = new Diagram({
                width: 500, height: 500,
                mode: 'SVG',
                constraints: DiagramConstraints.Default | DiagramConstraints.Virtualization,
                scrollSettings: { canAutoScroll: true, scrollLimit: 'Infinity' },
                nodes: [node1, node2, node3, node4, node5, node6, node7,
                    node8, node9, node10, node11, node12, node13, node14, node15]
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('checking initial rendering and zooming', (done: Function) => {
            let nodes = document.getElementById('diagram_diagramLayer');
            expect(nodes.childNodes.length === 6).toBe(true);
            diagram.zoom(1.5);
            setTimeout(function () {
                let nodes1 = document.getElementById('diagram_diagramLayer');
                expect(nodes1.childNodes.length === 4).toBe(true);

                done();
            }, 100);
            setTimeout(function () {
                diagram.zoom(.5);
                let nodes1 = document.getElementById('diagram_diagramLayer');
                expect(nodes1.childNodes.length === 9).toBe(true);
                done();
            }, 120);


        });
        it('Checking Autoscroll right', (done: Function) => {
            var diagramCanvas = document.getElementById(diagram.element.id + 'content');
            var mouseEvents = new MouseEvents();
            var center = diagram.nodes[1].wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50, center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25, center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25 + 10, center.y + 50 + 25 + 10);
            setTimeout(function () {
                mouseEvents.mouseUpEvent(diagramCanvas, center.x + 50 + 25 + 10 + 10, center.y + 50 + 25 + 10 + 10);
                var element = document.getElementById('diagram_diagramLayer');
                expect(element.childNodes.length === 9).toBe(true);
                done();
            }, 850);

        });
        it('Checking autoscroll left', (done: Function) => {
            var mouseEvents = new MouseEvents();
            var diagramCanvas = document.getElementById(diagram.element.id + 'content');
            var center = diagram.nodes[0].wrapper.bounds.center;
            mouseEvents.clickEvent(diagramCanvas, center.x, center.x);
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50, center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25, center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25 - 10, center.y - 50 - 25 - 10);
            setTimeout(function () {
                mouseEvents.mouseUpEvent(diagramCanvas, center.x - 50 - 25 - 10, center.y - 50 - 25 - 10);

                setTimeout(function () {
                    var element = document.getElementById('diagram_diagramLayer');

                    expect(element.childNodes.length === 6).toBe(true);
                    done();
                }, 200)
            }, 1550);
        });
        it('memory leak', () => {
            profile.sample();
            let average: any = inMB(profile.averageChange)
            //Check average change in memory samples to not be over 10MB
            expect(average).toBeLessThan(10);
            let memory: any = inMB(getMemoryProfile())
            //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
            expect(memory).toBeLessThan(profile.samples[0] + 0.25);
        })

    });
    describe('Virtualization in SVG mode', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let shape: BasicShapeModel = { type: 'Basic', shape: 'Rectangle', cornerRadius: 10 };
            let node1: NodeModel = { id: 'node', offsetX: 100, offsetY: 100, width: 50, height: 50, shape: shape, borderColor: "red" };
            diagram = new Diagram({
                width: 500, height: 500,
                mode: 'SVG',
                constraints: DiagramConstraints.Default | DiagramConstraints.Virtualization,
                nodes: [node1]
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('addnode  at runtime', (done: Function) => {
            let node: NodeModel = {
                id: 'node11virtual', width: 100, height: 100, offsetX: 100, offsetY: 200,
                style: { fill: 'green' },
                shape: {
                    type: 'Basic', shape: 'Rectangle',
                }, annotations: [{ content: 'text' }]
            };
            diagram.add(node);
            diagram.dataBind();
            expect(diagram.nodes.length === 2).toBe(true)
            done();
        });
    });

    describe('AutoScroll Node resizing - Bottom', () => {
        let diagram: Diagram;
        let mouseEvents: MouseEvents = new MouseEvents();
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 200, y: 180 }, annotations: [{ content: 'Connector' }]
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: -220, offsetY: -240, annotations: [{ content: 'Node1' }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 150, height: 100, offsetX: 290, offsetY: -240, annotations: [{ content: 'Node2' }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 150, height: 100, offsetX: -220, offsetY: 140, annotations: [{ content: 'Node3' }]
            };
            let node4: NodeModel = {
                id: 'node4', width: 150, height: 100, offsetX: 290, offsetY: 140, annotations: [{ content: 'Node4' }]
            };
            diagram = new Diagram({
                width: '700px', height: '500px', nodes: [node, node2, node3, node4],
                connectors: [connector],
                scrollSettings: { horizontalOffset: 300, verticalOffset: 300, viewPortHeight: 400, viewPortWidth: 400, scrollLimit: 'Infinity', canAutoScroll: true }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Check node resizing at bottom', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[3]]);
            let bounds: any = document.getElementById('resizeSouthEast').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50 + 25 + 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 290).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x , center.y + 50 + 25 + 10 + 10);
                }, 110);
        });
        it('Check node resizing at bottom', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[3]]);
            let bounds: any = document.getElementById('resizeSouthWest').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50 + 25 + 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 280).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x , center.y + 50 + 25 + 10 + 10);
                }, 110);
        });
    });

    describe('AutoScroll Node resizing - Top', () => {
        let diagram: Diagram;
        let mouseEvents: MouseEvents = new MouseEvents();
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 200, y: 180 }, annotations: [{ content: 'Connector' }]
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: -220, offsetY: -240, annotations: [{ content: 'Node1' }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 150, height: 100, offsetX: 290, offsetY: -240, annotations: [{ content: 'Node2' }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 150, height: 100, offsetX: -220, offsetY: 140, annotations: [{ content: 'Node3' }]
            };
            let node4: NodeModel = {
                id: 'node4', width: 150, height: 100, offsetX: 290, offsetY: 140, annotations: [{ content: 'Node4' }]
            };
            diagram = new Diagram({
                width: '700px', height: '500px', nodes: [node, node2, node3, node4],
                connectors: [connector],
                scrollSettings: { horizontalOffset: 300, verticalOffset: 300, viewPortHeight: 400, viewPortWidth: 400, scrollLimit: 'Infinity', canAutoScroll: true }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Check node resizing at top', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[1]]);
            let bounds: any = document.getElementById('resizeNorthEast').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y - 50 - 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y - 50 - 25 - 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 310).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x , center.y - 50 - 25 - 10 - 10);
            }, 110);
        });
        it('Check node resizing at top', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[1]]);
            let bounds: any = document.getElementById('resizeNorthWest').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y - 50 - 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y - 50 - 25 - 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 320).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x , center.y - 50 - 25 - 10 - 10);
            }, 110);
        });
    });
    describe('AutoScroll Node resizing - Left NorthWest', () => {
        let diagram: Diagram;
        let mouseEvents: MouseEvents = new MouseEvents();
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 200, y: 180 }, annotations: [{ content: 'Connector' }]
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: -220, offsetY: -240, annotations: [{ content: 'Node1' }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 150, height: 100, offsetX: 290, offsetY: -240, annotations: [{ content: 'Node2' }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 150, height: 100, offsetX: -220, offsetY: 140, annotations: [{ content: 'Node3' }]
            };
            let node4: NodeModel = {
                id: 'node4', width: 150, height: 100, offsetX: 290, offsetY: 140, annotations: [{ content: 'Node4' }]
            };
            diagram = new Diagram({
                width: '700px', height: '500px', nodes: [node, node2, node3, node4],
                connectors: [connector],
                scrollSettings: { horizontalOffset: 300, verticalOffset: 300, viewPortHeight: 400, viewPortWidth: 400, scrollLimit: 'Infinity', canAutoScroll: true }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Check node resizing at Left NorthWest', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            let bounds: any = document.getElementById('resizeNorthWest').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50, center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25, center.y - 50 - 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25 - 10, center.y - 50 - 25 - 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 310).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x - 50 - 25 - 10 - 10, center.y - 50 - 25 - 10 - 10);
            }, 110);
        });
    });
    describe('AutoScroll Node resizing - Left SouthWest', () => {
        let diagram: Diagram;
        let mouseEvents: MouseEvents = new MouseEvents();
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 200, y: 180 }, annotations: [{ content: 'Connector' }]
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: -220, offsetY: -240, annotations: [{ content: 'Node1' }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 150, height: 100, offsetX: 290, offsetY: -240, annotations: [{ content: 'Node2' }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 150, height: 100, offsetX: -220, offsetY: 140, annotations: [{ content: 'Node3' }]
            };
            let node4: NodeModel = {
                id: 'node4', width: 150, height: 100, offsetX: 290, offsetY: 140, annotations: [{ content: 'Node4' }]
            };
            diagram = new Diagram({
                width: '700px', height: '500px', nodes: [node, node2, node3, node4],
                connectors: [connector],
                scrollSettings: { horizontalOffset: 300, verticalOffset: 300, viewPortHeight: 400, viewPortWidth: 400, scrollLimit: 'Infinity', canAutoScroll: true }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Check node resizing at Left SouthWest', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[2]]);
            let bounds: any = document.getElementById('resizeSouthWest').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50, center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25, center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x - 50 - 25 - 10, center.y + 50 + 25 + 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 290).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x - 50 - 25 - 10 - 10, center.y + 50 + 25 + 10 + 10);
            }, 110);
        });
    });
    describe('AutoScroll Node resizing - Right SouthEast', () => {
        let diagram: Diagram;
        let mouseEvents: MouseEvents = new MouseEvents();
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 200, y: 180 }, annotations: [{ content: 'Connector' }]
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: -220, offsetY: -240, annotations: [{ content: 'Node1' }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 150, height: 100, offsetX: 290, offsetY: -240, annotations: [{ content: 'Node2' }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 150, height: 100, offsetX: -220, offsetY: 140, annotations: [{ content: 'Node3' }]
            };
            let node4: NodeModel = {
                id: 'node4', width: 150, height: 100, offsetX: 290, offsetY: 140, annotations: [{ content: 'Node4' }]
            };
            diagram = new Diagram({
                width: '700px', height: '500px', nodes: [node, node2, node3, node4],
                connectors: [connector],
                scrollSettings: { horizontalOffset: 300, verticalOffset: 300, viewPortHeight: 400, viewPortWidth: 400, scrollLimit: 'Infinity', canAutoScroll: true }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Check node resizing at Right SouthEast', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[3]]);
            let bounds: any = document.getElementById('resizeSouthEast').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50, center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25, center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25 + 10, center.y + 50 + 25 + 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 290).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x + 50 + 25 + 10 + 10, center.y + 50 + 25 + 10 + 10);
            }, 110);
        });
    });
    describe('AutoScroll Node resizing - Right NorthEast', () => {
        let diagram: Diagram;
        let mouseEvents: MouseEvents = new MouseEvents();
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 200, y: 180 }, annotations: [{ content: 'Connector' }]
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: -220, offsetY: -240, annotations: [{ content: 'Node1' }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 150, height: 100, offsetX: 290, offsetY: -240, annotations: [{ content: 'Node2' }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 150, height: 100, offsetX: -220, offsetY: 140, annotations: [{ content: 'Node3' }]
            };
            let node4: NodeModel = {
                id: 'node4', width: 150, height: 100, offsetX: 290, offsetY: 140, annotations: [{ content: 'Node4' }]
            };
            diagram = new Diagram({
                width: '700px', height: '500px', nodes: [node, node2, node3, node4],
                connectors: [connector],
                scrollSettings: { horizontalOffset: 300, verticalOffset: 300, viewPortHeight: 400, viewPortWidth: 400, scrollLimit: 'Infinity', canAutoScroll: true }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Check node resizing at Right NorthEast', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[1]]);
            let bounds: any = document.getElementById('resizeNorthEast').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50, center.y - 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25, center.y - 50 - 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x + 50 + 25 + 10, center.y - 50 - 25 - 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 310).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x - 50 - 25 - 10 - 10, center.y - 50 - 25 - 10 - 10);
            }, 110);
        });
    });
    describe('AutoScroll Connector end point dragging', () => {
        let diagram: Diagram;
        let mouseEvents: MouseEvents = new MouseEvents();
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 0, y: 0 }, targetPoint: { x: 200, y: 180 }, annotations: [{ content: 'Connector' }]
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: -220, offsetY: -240, annotations: [{ content: 'Node1' }]
            };
            let node2: NodeModel = {
                id: 'node2', width: 150, height: 100, offsetX: 290, offsetY: -240, annotations: [{ content: 'Node2' }]
            };
            let node3: NodeModel = {
                id: 'node3', width: 150, height: 100, offsetX: -220, offsetY: 140, annotations: [{ content: 'Node3' }]
            };
            let node4: NodeModel = {
                id: 'node4', width: 150, height: 100, offsetX: 290, offsetY: 140, annotations: [{ content: 'Node4' }]
            };
            diagram = new Diagram({
                width: '700px', height: '500px', nodes: [node, node2, node3, node4],
                connectors: [connector],
                scrollSettings: { horizontalOffset: 300, verticalOffset: 300, viewPortHeight: 400, viewPortWidth: 400, scrollLimit: 'Infinity', canAutoScroll: true }
            });
            diagram.appendTo('#diagram');
        });
        afterAll(() => {
            diagram.destroy();
            ele.remove();
        });
        it('Check connector end point dragging', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.connectors[0]]);
            let bounds: any = document.getElementById('connectorTargetThumb').getBoundingClientRect();
            let center: PointModel = { x: bounds.x, y: bounds.y };
            mouseEvents.mouseDownEvent(diagramCanvas, center.x, center.y);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50 + 25);
            mouseEvents.mouseMoveEvent(diagramCanvas, center.x , center.y + 50 + 25 + 10);
            setTimeout(() => {
                expect(Math.ceil(diagram.scroller.verticalOffset) === 290).toBe(true);
                done();
                mouseEvents.mouseUpEvent(diagramCanvas, center.x , center.y + 50 + 25 + 10 + 10);
            }, 110);
        });
    });
});
