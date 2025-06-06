/**
 * Command Manager - Test Cases
 */
import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { Path} from '../../../src/diagram/objects/node';
import { HtmlModel, NodeModel } from '../../../src/diagram/objects/node-model';
import { MouseEvents } from '../interaction/mouseevents.spec';
import { UndoRedo } from '../../../src/diagram/objects/undo-redo';
import { DiagramTools, FlipDirection, KeyModifiers, Keys } from '../../../src/diagram/enum/enum';
import { CommandManager } from '../../../src/diagram/diagram/keyboard-commands';
import { CommandManagerModel, CommandModel } from '../../../src/diagram/diagram/keyboard-commands-model';
import { ConnectorModel } from '../../../src/diagram/objects/connector-model';
import { profile, inMB, getMemoryProfile } from '../../../spec/common.spec';
import { BpmnSubProcessModel } from '../../../src/diagram/objects/node-model';
import { ShapeStyleModel, ShadowModel } from '../../../src/diagram/core/appearance-model';
import { NodeConstraints } from '../../../src/diagram/enum/enum';
Diagram.Inject(UndoRedo);

describe('Diagram Control', () => {
    describe('Testing the Commands - Command Manager', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_command2' });
            document.body.appendChild(ele);
            let selArray: (NodeModel)[] = [];
            let node: NodeModel = {
                id: 'node5',
                width: 100, height: 100,
                offsetX: 100, offsetY: 100, style: { fill: 'green' },
                shape: {
                    type: 'Basic',
                    shape: 'Rectangle'
                }
            };
            let node2: NodeModel = {
                id: 'node2',
                width: 100, height: 100,
                offsetX: 400, offsetY: 100, style: { fill: 'blue' },
                shape: {
                    type: 'Basic',
                    shape: 'Rectangle'
                },
                annotations: [{ content: 'Annotation' }]
            };

            let connector: ConnectorModel = {
                id: 'connector2',
                type: 'Orthogonal',
                sourcePoint: { x: 600, y: 100 },
                targetPoint: { x: 700, y: 200 },
            }

            diagram = new Diagram({
                width: '900px', height: '700px', nodes: [node, node2], connectors: [connector],
                commandManager: {
                    commands: [
                        {
                            name: 'clone',
                            canExecute: function () {
                                if (diagram.selectedItems.nodes.length > 0 || diagram.selectedItems.connectors.length > 0) {
                                    return true;
                                }
                                return false;
                            },

                            execute: function () {
                                diagram.copy();
                                diagram.paste();
                            },

                            //Defines that the clone command has to be executed on the recognition of Shift+C key press.
                            gesture: {
                                key: Keys.Z,
                                keyModifiers: KeyModifiers.Control
                            }
                        },
                        {
                            name: 'copy',
                            canExecute: function () {
                                if (diagram.selectedItems.nodes.length > 0 || diagram.selectedItems.connectors.length > 0) {
                                    return true;
                                }
                                return false;
                            }
                        },
                        {
                            name: 'undo',
                            gesture: {
                                key: Keys.G,
                                keyModifiers: KeyModifiers.Control
                            },
                            canExecute: function () {
                                return true;
                            },
                            execute: function () {
                                diagram.undo();
                            },
                        }

                    ]
                }
            });
            diagram.appendTo('#diagram_command2');
            selArray.push(diagram.nodes[0]);
            diagram.select(selArray);
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Checking custom commands - clone', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            mouseEvents.keyDownEvent(diagramCanvas, 'Z', true, false);
            expect(diagram.nodes.length === 3).toBe(true);
            done();
        });
        it('Checking commands - copy and paste', (done: Function) => {
            diagram.clearSelection();
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            mouseEvents.keyDownEvent(diagramCanvas, 'C', true);
            mouseEvents.keyDownEvent(diagramCanvas, 'V', true);
            expect(diagram.nodes.length === 4).toBe(true);
            done();
        });
        it('Checking commands - cut', (done: Function) => {
            diagram.clearSelection();
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 80, 100);
            mouseEvents.keyDownEvent(diagramCanvas, 'X', true);
            expect(diagram.nodes.length === 3).toBe(true);
            done();
        });
        it('Checking commands - undo', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.keyDownEvent(diagramCanvas, 'G', true, false, false);
            expect(diagram.nodes.length === 4).toBe(true);
            done();
        });
        it('Checking commands - redo', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.keyDownEvent(diagramCanvas, 'Y', true);
            expect(diagram.nodes.length === 3).toBe(true);
            done();
        });
        it('Checking commands - Select All', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.keyDownEvent(diagramCanvas, 'A', true);
            expect(diagram.selectedItems.nodes.length === diagram.nodes.length).toBe(true);
            done();
        });
        it('Checking commands - delete', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.keyDownEvent(diagramCanvas, 'Delete');
            expect(diagram.nodes.length === 0).toBe(true);
            done();
        });
        it('Checking commands - nudge commands', (done: Function) => {
            diagram.undo();
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.clearSelection();
            mouseEvents.clickEvent(diagramCanvas, 400, 100);
            mouseEvents.keyDownEvent(diagramCanvas, 'Up');
            expect(diagram.selectedItems.nodes[0].offsetY == 99).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Down');
            expect(diagram.selectedItems.nodes[0].offsetY == 100).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Left');
            expect(diagram.selectedItems.nodes[0].offsetX == 399).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Right');
            expect(diagram.selectedItems.nodes[0].offsetX == 400).toBe(true);
            done();
        });
        it('Checking commands - annotation edit', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 400, 100);
            mouseEvents.keyDownEvent(diagramCanvas, 'F2');
            let editBox = document.getElementById(diagram.element.id + '_editBox');
            expect(editBox != undefined).toBe(true);
            done();
        });
        it('Checking commands - end annotation edit', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            let editBox = document.getElementById(diagram.element.id + '_editBox');
            expect(editBox !== undefined).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Escape');
            editBox = document.getElementById(diagram.element.id + '_editBox');
            expect(editBox == undefined).toBe(true);
            done();
        });
        it('Checking commands - start text edit (connector)', (done: Function) => {

            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            mouseEvents.keyDownEvent(diagramCanvas, 'Enter');
            let editBox = document.getElementById(diagram.element.id + '_editBox');
            (editBox as HTMLInputElement).value = "Node";
            mouseEvents.keyDownEvent(diagramCanvas, 'Escape');
            expect((diagram.selectedItems.nodes[0] as NodeModel).annotations[0].content == "Node").toBe(true);
            done();
        });
        it('Checking commands - start text edit (node)', (done: Function) => {

            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 600 + diagram.element.offsetLeft, 100 + diagram.element.offsetTop);
            mouseEvents.keyDownEvent(diagramCanvas, 'Enter');
            let editBox = document.getElementById(diagram.element.id + '_editBox');
            (editBox as HTMLInputElement).value = "Connector";
            mouseEvents.keyDownEvent(diagramCanvas, 'Escape');
            expect((diagram.connectors[0] as ConnectorModel).annotations[0].content == "Connector").toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Delete');
            expect(diagram.connectors.length === 0).toBe(true);
            done();
        });
        it('Checking select all delete undo select all paste index ', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.keyDownEvent(diagramCanvas, 'A', true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Delete');
            mouseEvents.keyDownEvent(diagramCanvas, 'G', true, false, false);
            mouseEvents.keyDownEvent(diagramCanvas, 'A', true);
            mouseEvents.keyDownEvent(diagramCanvas, 'C', true);
            mouseEvents.keyDownEvent(diagramCanvas, 'V', true);
            expect(diagram.nodes.length === 6).toBe(true);
            done();
        });
    });
});
describe('Diagram Control', () => {
    let diagram: Diagram;
    let ele: HTMLElement;
    let mouseEvents: MouseEvents = new MouseEvents();
    beforeAll((): void => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
        ele = createElement('div', { id: 'diagram_command3' });
        document.body.appendChild(ele);
        let selArray: (NodeModel)[] = [];
        let node: NodeModel = {
            id: 'node55',
            width: 100, height: 100,
            offsetX: 100, offsetY: 100, style: { fill: 'green' },
            shape: {
                type: 'Basic',
                shape: 'Rectangle'
            }
        };
        diagram = new Diagram({
            width: '900px', height: '700px', nodes: [node],
            commandManager: {
                commands: [
                    {
                        name: 'clone1',
                        //Defines that the clone command has to be executed on the recognition of Shift+C key press.
                        gesture: {
                            key: Keys.G,
                            keyModifiers: KeyModifiers.Shift
                        }
                    },
                ]
            }
        });
        diagram.appendTo('#diagram_command3');
        selArray.push(diagram.nodes[0]);
        diagram.select(selArray);
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('Breakage issue if we dont specify the can execute commands', (done: Function) => {
        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        mouseEvents.clickEvent(diagramCanvas, 100, 100);
        expect(diagram.selectedItems.nodes.length > 0).toBe(true);
        mouseEvents.keyDownEvent(diagramCanvas, 'G', false, true);
        expect(diagram.nodes.length === 1).toBe(true);

        done();
    });
    it('Breakage issue if we dont specify the execute commands', (done: Function) => {
        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        mouseEvents.clickEvent(diagramCanvas, 100, 100);
        expect(diagram.selectedItems.nodes.length > 0).toBe(true);
        mouseEvents.keyDownEvent(diagramCanvas, 'G', false, true);
        expect(diagram.nodes.length === 1).toBe(true);

        done();
    });
    it('add commands at run time', (done: Function) => {
        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        diagram.commandManager = {
            commands: []
        }
        diagram.dataBind();
        expect(diagram.commandManager.commands.length === 0).toBe(true);

        done();
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
describe('SendToBack ordercommands', () => {
    let diagram: Diagram;
    let ele: HTMLElement;
    beforeAll((): void => {
        ele = createElement('div', { id: 'diagram_div' });
        document.body.appendChild(ele);
        var nodes:NodeModel[] = [
            {
              id: 'node1',
              width: 90,
              height: 70,
              offsetX: 120,
              offsetY: 100,
              style: {
                fill: '#6BA5D7',
                strokeColor: 'white',
                strokeWidth: 1,
              },
            },
            {
              id: 'node2',
              width: 90,
              height: 70,
              offsetX: 150,
              offsetY: 120,
              style: {
                fill: '#6BA5D7',
                strokeColor: 'white',
                strokeWidth: 1,
              },
            },
            {
              id: 'node3',
              width: 90,
              height: 70,
              offsetX: 170,
              offsetY: 150,
              style: {
                fill: '#6BA5D7',
                strokeColor: 'white',
                strokeWidth: 1,
              },
            },
          ];
        diagram = new Diagram({
            width: '1500px',
            height: '600px',
            nodes: nodes,
        });
        diagram.appendTo("#diagram_div");
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('Undo after sendtoback the selected node ', (done: Function) => {
        diagram.select([diagram.nodes[2]]);
        diagram.sendToBack();
        diagram.undo();
        expect(diagram.nodes.length!==0).toBe(true);
        done();
    });
});
describe('SendToBack exception', () => {
    let diagram: Diagram;
    let ele: HTMLElement;
    let zIndexBeforeCall: number;
    let zIndexAfterCall : number;
    beforeAll((): void => {
        ele = createElement('div', { id: 'diagram_div' });
        document.body.appendChild(ele);
        let nodes: NodeModel[] = [
            {
                id: "rectangle1",
                offsetX: 100,
                offsetY: 100,
                width: 100,
                height: 100,
                annotations: [{
                    content: 'rectangle1'
                }]
            }, {
                id: "rectangle2",
                offsetX: 200,
                offsetY: 200,
                width: 100,
                height: 100,
                annotations: [{
                    content: 'rectangle2'
                }]
            },
            {
                id: 'group',
                children: ['rectangle1', 'rectangle2']
            },
            {
                id: "rectangle3",
                offsetX: 300,
                offsetY: 300,
                width: 100,
                height: 100,
                annotations: [{
                    content: 'rectangle3'
                }]
            },
        
        ];
        
        diagram = new Diagram({
            width: '1500px',
            height: '600px',
            nodes: nodes,
        });
        diagram.appendTo("#diagram_div");
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('Exception occurs when sendToBack method is called', (done: Function) => {
        zIndexBeforeCall = diagram.nodes[2].zIndex;
        diagram.select([diagram.nodes[2]]);
        diagram.sendToBack();
        zIndexAfterCall = diagram.nodes[2].zIndex;
        expect(zIndexBeforeCall === zIndexAfterCall).toBe(true);
        done();
    });
    it('Exception occurs when bringToFront method is called', (done: Function) => {
        zIndexBeforeCall = diagram.nodes[3].zIndex;
        diagram.select([diagram.nodes[3]]);
        diagram.bringToFront();
        zIndexAfterCall = diagram.nodes[3].zIndex;
        expect(zIndexBeforeCall === zIndexAfterCall).toBe(true);
        done();
    });
    it('Chekcking z-index on property change event when bringToFront method is called', (done: Function) => {
        diagram.select([diagram.nodes[3]]);
        let oldZindex: number = diagram.nodes[3].zIndex;
        diagram.bringToFront();
        diagram.propertyChange = function (args) {
            if (args.element instanceof Node && args.newValue) {
                console.log('zindex =' + args.oldValue.zindex);
                expect(args.oldValue.zindex === oldZindex).toBe(true);
            }
        }
        done();
    });
    it('Chekcking z-index on property change event when sendToBack method is called', (done: Function) => {
        diagram.select([diagram.nodes[3]]);
        let oldZindex: number = diagram.nodes[3].zIndex;
        diagram.sendToBack();
        diagram.propertyChange = function (args) {
            if (args.element instanceof Node && args.newValue) {
                console.log('zindex =' + args.oldValue.zindex);
                expect(args.oldValue.zindex === oldZindex).toBe(true);
            }
        }
        done();
    });
    it('Chekcking z-index on property change event when sendBackward method is called', (done: Function) => {
        diagram.select([diagram.nodes[3]]);
        let oldZindex: number = diagram.nodes[3].zIndex;
        diagram.sendBackward();
        diagram.propertyChange = function (args) {
            if (args.element instanceof Node && args.newValue) {
                console.log('zindex =' + args.oldValue.zindex);
                expect(args.oldValue.zindex === oldZindex).toBe(true);
            }
        }
        done();
    });
    it('Chekcking z-index on property change event when moveForward method is called', (done: Function) => {
        diagram.select([diagram.nodes[3]]);
        let oldZindex: number = diagram.nodes[3].zIndex;
        diagram.moveForward();
        diagram.propertyChange = function (args) {
            if (args.element instanceof Node && args.newValue) {
                console.log('zindex =' + args.oldValue.zindex);
                expect(args.oldValue.zindex === oldZindex).toBe(true);
            }
        }
        done();
    });
});
describe('Default Template tooltip', () => {
    var diagram: Diagram;
    let ele: HTMLElement;
    let mouseEvents: MouseEvents = new MouseEvents();
    beforeAll((): void => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
        ele = createElement('div', { id: 'tooltipCheck' });
        document.body.appendChild(ele);
        let connector: ConnectorModel = {
            id: 'connector1', sourcePoint: { x: 300, y: 100 }, targetPoint: { x: 400, y: 200 }
        };
        let node: NodeModel = {
            id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 450, annotations: [{ content: 'Node1' }]
        };
        let node2: NodeModel = {
            id: 'node2', width: 100, height: 100, offsetX: 550, offsetY: 450, annotations: [{ content: 'Node1' }],
            tooltip: { openOn: 'Custom' }
        };
        diagram = new Diagram({
            width: '1000px', height: '500px',
            nodes: [node, node2],
            connectors: [connector],
        });
        diagram.appendTo('#tooltipCheck');
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('Checking custom tooltip template with default template', (done: Function) => {
        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        diagram.showTooltip(diagram.nodes[1]);
        setTimeout(() => { done(); }, 50);
    });
    it('Checking tooltip on mouse enter of custom object', (done: Function) => {
        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        mouseEvents.mouseMoveEvent(diagramCanvas, 320, 320);
        let tooltipElement: HTMLElement = document.getElementsByClassName('e-tooltip-wrap e-popup e-control e-popup-open')[0] as HTMLElement;
        expect(tooltipElement !== null).toBe(true);
        // expect(tooltipElement.offsetTop).toEqual(516);
        done();
    });
});

describe('Check the bringToFront and sendToBack functionality', () => {
    var diagram: Diagram;
    let ele: HTMLElement;
    beforeAll((): void => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            this.skip(); //Skips test (in Chai)
            return;
        }
        ele = createElement('div', { id: 'bringToFront1' });
        document.body.appendChild(ele);
        let connector1: ConnectorModel = {
            id: 'connector1', sourcePoint: { x: 300, y: 100 }, targetPoint: { x: 400, y: 200 }
        };
        let connector2: ConnectorModel = {
            id: 'connector2', sourcePoint: { x: 250, y: 150 }, targetPoint: { x: 350, y: 250 }
        };
        let node: NodeModel = {
            id: 'node1', width: 100, height: 100, offsetX: 100, offsetY: 450, annotations: [{ content: 'Node1' }]
        };
        let node2: NodeModel = {
            id: 'node2', width: 100, height: 100, offsetX: 550, offsetY: 450, annotations: [{ content: 'Node1' }],
        };
        diagram = new Diagram({
            width: '1000px', height: '500px',
            nodes: [node, node2],
            connectors: [connector1, connector2],
        });
        diagram.appendTo('#bringToFront1');
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('Checking the before calling the bringToFront function', (done: Function) => {
        expect((diagram.activeLayer as any).zIndexTable[0]).toBe('node1');
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[2]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector2');
        diagram.select([diagram.nodes[0]]);
        diagram.bringToFront();
        done();
    });
    it('Checking the after calling the bringToFront function', (done: Function) => {
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[2]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector2');
        expect((diagram.activeLayer as any).zIndexTable[4]).toBe('node1');
        diagram.select([diagram.nodes[1]]);
        diagram.sendToBack();
        done();
    });
    it('Checking the after calling the sendToBack function', (done: Function) => {
        expect((diagram.activeLayer as any).zIndexTable[4]).toBe('node1');
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[2]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector2');
        done();
    });
});

describe('Check the bringToFront and sendToBack functionality in native node rendering', () => {
    var diagram: Diagram;
    let ele: HTMLElement;
    beforeAll((): void => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            this.skip(); //Skips test (in Chai)
            return;
        }
        ele = createElement('div', { id: 'bringToFront2' });
        document.body.appendChild(ele);
        let newconnectors: ConnectorModel = {
            id: "connector1",
            style: {
                strokeColor: '#6BA5D7',
                fill: '#6BA5D7',
                strokeWidth: 2
            },
            targetDecorator: {
                style: {
                    fill: '#6BA5D7',
                    strokeColor: '#6BA5D7'
                }
            },
            sourcePoint: {
                x: 100,
                y: 100
            },
            targetPoint: {
                x: 200,
                y: 200
            }
        }
        let newNode: NodeModel = {
            id: 'node4', width: 150, height: 100, offsetX: 100, offsetY: 300, style: { fill: 'none' },
            annotations: [{ content: 'Start \n Text Editing' }],
            shape: {
                type: 'Native', content: '<g xmlns="http://www.w3.org/2000/svg">	<g transform="translate(1 1)">		<g>			<path style="fill:#61443C;" d="M61.979,435.057c2.645-0.512,5.291-0.853,7.936-1.109c-2.01,1.33-4.472,1.791-6.827,1.28     C62.726,435.13,62.354,435.072,61.979,435.057z"/>			<path style="fill:#61443C;" d="M502.469,502.471h-25.6c0.163-30.757-20.173-57.861-49.749-66.304     c-5.784-1.581-11.753-2.385-17.749-2.389c-2.425-0.028-4.849,0.114-7.253,0.427c1.831-7.63,2.747-15.45,2.731-23.296     c0.377-47.729-34.52-88.418-81.749-95.317c4.274-0.545,8.577-0.83,12.885-0.853c25.285,0.211,49.448,10.466,67.167,28.504     c17.719,18.039,27.539,42.382,27.297,67.666c0.017,7.846-0.9,15.666-2.731,23.296c2.405-0.312,4.829-0.455,7.253-0.427     C472.572,434.123,502.783,464.869,502.469,502.471z"/>		</g>		<path style="fill:#8B685A;" d="M476.869,502.471H7.536c-0.191-32.558,22.574-60.747,54.443-67.413    c0.375,0.015,0.747,0.072,1.109,0.171c2.355,0.511,4.817,0.05,6.827-1.28c1.707-0.085,3.413-0.171,5.12-0.171    c4.59,0,9.166,0.486,13.653,1.451c2.324,0.559,4.775,0.147,6.787-1.141c2.013-1.288,3.414-3.341,3.879-5.685    c7.68-39.706,39.605-70.228,79.616-76.117c4.325-0.616,8.687-0.929,13.056-0.939c13.281-0.016,26.409,2.837,38.485,8.363    c3.917,1.823,7.708,3.904,11.349,6.229c2.039,1.304,4.527,1.705,6.872,1.106c2.345-0.598,4.337-2.142,5.502-4.264    c14.373-25.502,39.733-42.923,68.693-47.189h0.171c47.229,6.899,82.127,47.588,81.749,95.317c0.017,7.846-0.9,15.666-2.731,23.296    c2.405-0.312,4.829-0.455,7.253-0.427c5.996,0.005,11.965,0.808,17.749,2.389C456.696,444.61,477.033,471.713,476.869,502.471    L476.869,502.471z"/>		<path style="fill:#66993E;" d="M502.469,7.537c0,0-6.997,264.96-192.512,252.245c-20.217-1.549-40.166-5.59-59.392-12.032    c-1.365-0.341-2.731-0.853-4.096-1.28c0,0-0.597-2.219-1.451-6.144c-6.656-34.048-25.088-198.997,231.765-230.144    C485.061,9.159,493.595,8.22,502.469,7.537z"/>		<path style="fill:#9ACA5C;" d="M476.784,10.183c-1.28,26.197-16.213,238.165-166.827,249.6    c-20.217-1.549-40.166-5.59-59.392-12.032c-1.365-0.341-2.731-0.853-4.096-1.28c0,0-0.597-2.219-1.451-6.144    C238.363,206.279,219.931,41.329,476.784,10.183z"/>		<path style="fill:#66993E;" d="M206.192,246.727c-0.768,3.925-1.365,6.144-1.365,6.144c-1.365,0.427-2.731,0.939-4.096,1.28    c-21.505,7.427-44.293,10.417-66.987,8.789C21.104,252.103,8.816,94.236,7.621,71.452c-0.085-1.792-0.085-2.731-0.085-2.731    C222.747,86.129,211.653,216.689,206.192,246.727z"/>		<path style="fill:#9ACA5C;" d="M180.336,246.727c-0.768,3.925-1.365,6.144-1.365,6.144c-1.365,0.427-2.731,0.939-4.096,1.28    c-13.351,4.412-27.142,7.359-41.131,8.789C21.104,252.103,8.816,94.236,7.621,71.452    C195.952,96.881,185.541,217.969,180.336,246.727z"/>	</g>	<g>		<path d="M162.136,426.671c3.451-0.001,6.562-2.08,7.882-5.268s0.591-6.858-1.849-9.298l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    C157.701,425.773,159.872,426.673,162.136,426.671L162.136,426.671z"/>		<path d="M292.636,398.57c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054s-3.335,8.671-0.054,12.012L292.636,398.57z"/>		<path d="M296.169,454.771c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012L296.169,454.771z"/>		<path d="M386.503,475.37c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012L386.503,475.37z"/>		<path d="M204.803,409.604c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C198.241,407.524,201.352,409.603,204.803,409.604z"/>		<path d="M332.803,443.737c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C326.241,441.658,329.352,443.737,332.803,443.737z"/>		<path d="M341.336,366.937c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C334.774,364.858,337.885,366.937,341.336,366.937z"/>		<path d="M164.636,454.771l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C173.337,451.515,167.977,451.49,164.636,454.771L164.636,454.771z"/>		<path d="M232.903,429.171l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C241.604,425.915,236.243,425.89,232.903,429.171L232.903,429.171z"/>		<path d="M384.003,409.604c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C377.441,407.524,380.552,409.603,384.003,409.604z"/>		<path d="M70.77,463.304l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271s3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C79.47,460.048,74.11,460.024,70.77,463.304L70.77,463.304z"/>		<path d="M121.97,446.238l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C130.67,442.981,125.31,442.957,121.97,446.238L121.97,446.238z"/>		<path d="M202.302,420.638c-1.6-1.601-3.77-2.5-6.033-2.5c-2.263,0-4.433,0.899-6.033,2.5l-8.533,8.533    c-2.178,2.151-3.037,5.304-2.251,8.262c0.786,2.958,3.097,5.269,6.055,6.055c2.958,0.786,6.111-0.073,8.262-2.251l8.533-8.533    c1.601-1.6,2.5-3.77,2.5-6.033C204.802,424.408,203.903,422.237,202.302,420.638L202.302,420.638z"/>		<path d="M210.836,463.304c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    c2.149,2.188,5.307,3.055,8.271,2.27c2.965-0.785,5.28-3.1,6.065-6.065c0.785-2.965-0.082-6.122-2.27-8.271L210.836,463.304z"/>		<path d="M343.836,454.771l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C352.537,451.515,347.177,451.49,343.836,454.771L343.836,454.771z"/>		<path d="M429.17,483.904c3.341,3.281,8.701,3.256,12.012-0.054s3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012L429.17,483.904z"/>		<path d="M341.336,401.071c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    s-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.441-3.169,6.11-1.849,9.298C334.774,398.991,337.885,401.07,341.336,401.071z"/>		<path d="M273.069,435.204c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    s-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298C266.508,433.124,269.618,435.203,273.069,435.204z"/>		<path d="M253.318,258.138c22.738,7.382,46.448,11.338,70.351,11.737c31.602,0.543,62.581-8.828,88.583-26.796    c94.225-65.725,99.567-227.462,99.75-234.317c0.059-2.421-0.91-4.754-2.667-6.421c-1.751-1.679-4.141-2.52-6.558-2.308    C387.311,9.396,307.586,44.542,265.819,104.5c-28.443,42.151-38.198,94.184-26.956,143.776c-3.411,8.366-6.04,17.03-7.852,25.881    c-4.581-7.691-9.996-14.854-16.147-21.358c8.023-38.158,0.241-77.939-21.57-110.261C160.753,95.829,98.828,68.458,9.228,61.196    c-2.417-0.214-4.808,0.628-6.558,2.308c-1.757,1.667-2.726,4-2.667,6.421c0.142,5.321,4.292,130.929,77.717,182.142    c20.358,14.081,44.617,21.428,69.367,21.008c18.624-0.309,37.097-3.388,54.814-9.138c11.69,12.508,20.523,27.407,25.889,43.665    c0.149,15.133,2.158,30.19,5.982,44.832c-12.842-5.666-26.723-8.595-40.759-8.6c-49.449,0.497-91.788,35.567-101.483,84.058    c-5.094-1.093-10.29-1.641-15.5-1.638c-42.295,0.38-76.303,34.921-76.025,77.217c-0.001,2.263,0.898,4.434,2.499,6.035    c1.6,1.6,3.771,2.499,6.035,2.499h494.933c2.263,0.001,4.434-0.898,6.035-2.499c1.6-1.6,2.499-3.771,2.499-6.035    c0.249-41.103-31.914-75.112-72.967-77.154c0.65-4.78,0.975-9.598,0.975-14.421c0.914-45.674-28.469-86.455-72.083-100.045    c-43.615-13.59-90.962,3.282-116.154,41.391C242.252,322.17,242.793,288.884,253.318,258.138L253.318,258.138z M87.519,238.092    c-55.35-38.567-67.358-129.25-69.833-158.996c78.8,7.921,133.092,32.454,161.458,72.992    c15.333,22.503,22.859,49.414,21.423,76.606c-23.253-35.362-77.83-105.726-162.473-140.577c-2.82-1.165-6.048-0.736-8.466,1.125    s-3.658,4.873-3.252,7.897c0.406,3.024,2.395,5.602,5.218,6.761c89.261,36.751,144.772,117.776,161.392,144.874    C150.795,260.908,115.29,257.451,87.519,238.092z M279.969,114.046c37.6-53.788,109.708-86.113,214.408-96.138    c-2.65,35.375-17.158,159.05-91.892,211.175c-37.438,26.116-85.311,30.57-142.305,13.433    c19.284-32.09,92.484-142.574,212.405-191.954c2.819-1.161,4.805-3.738,5.209-6.76c0.404-3.022-0.835-6.031-3.25-7.892    c-2.415-1.861-5.64-2.292-8.459-1.131C351.388,82.01,279.465,179.805,252.231,222.711    C248.573,184.367,258.381,145.945,279.969,114.046L279.969,114.046z M262.694,368.017c15.097-26.883,43.468-43.587,74.3-43.746    c47.906,0.521,86.353,39.717,85.95,87.625c-0.001,7.188-0.857,14.351-2.55,21.337c-0.67,2.763,0.08,5.677,1.999,7.774    c1.919,2.097,4.757,3.1,7.568,2.676c1.994-0.272,4.005-0.393,6.017-0.362c29.59,0.283,54.467,22.284,58.367,51.617H17.661    c3.899-29.333,28.777-51.334,58.367-51.617c4-0.004,7.989,0.416,11.9,1.254c4.622,0.985,9.447,0.098,13.417-2.467    c3.858-2.519,6.531-6.493,7.408-11.017c7.793-40.473,43.043-69.838,84.258-70.192c16.045-0.002,31.757,4.582,45.283,13.212    c4.01,2.561,8.897,3.358,13.512,2.205C256.422,375.165,260.36,372.163,262.694,368.017L262.694,368.017z"/>	</g></g>',
            }
        }
        let nodes: NodeModel[] = [{
            id: 'node1', width: 150, height: 100, offsetX: 300, offsetY: 100, style: { fill: 'none' },
            annotations: [{ content: 'Start \n Text Editing' }],
            shape: {
                type: 'Native', content: '<g xmlns="http://www.w3.org/2000/svg">	<g transform="translate(1 1)">		<g>			<path style="fill:#61443C;" d="M61.979,435.057c2.645-0.512,5.291-0.853,7.936-1.109c-2.01,1.33-4.472,1.791-6.827,1.28     C62.726,435.13,62.354,435.072,61.979,435.057z"/>			<path style="fill:#61443C;" d="M502.469,502.471h-25.6c0.163-30.757-20.173-57.861-49.749-66.304     c-5.784-1.581-11.753-2.385-17.749-2.389c-2.425-0.028-4.849,0.114-7.253,0.427c1.831-7.63,2.747-15.45,2.731-23.296     c0.377-47.729-34.52-88.418-81.749-95.317c4.274-0.545,8.577-0.83,12.885-0.853c25.285,0.211,49.448,10.466,67.167,28.504     c17.719,18.039,27.539,42.382,27.297,67.666c0.017,7.846-0.9,15.666-2.731,23.296c2.405-0.312,4.829-0.455,7.253-0.427     C472.572,434.123,502.783,464.869,502.469,502.471z"/>		</g>		<path style="fill:#8B685A;" d="M476.869,502.471H7.536c-0.191-32.558,22.574-60.747,54.443-67.413    c0.375,0.015,0.747,0.072,1.109,0.171c2.355,0.511,4.817,0.05,6.827-1.28c1.707-0.085,3.413-0.171,5.12-0.171    c4.59,0,9.166,0.486,13.653,1.451c2.324,0.559,4.775,0.147,6.787-1.141c2.013-1.288,3.414-3.341,3.879-5.685    c7.68-39.706,39.605-70.228,79.616-76.117c4.325-0.616,8.687-0.929,13.056-0.939c13.281-0.016,26.409,2.837,38.485,8.363    c3.917,1.823,7.708,3.904,11.349,6.229c2.039,1.304,4.527,1.705,6.872,1.106c2.345-0.598,4.337-2.142,5.502-4.264    c14.373-25.502,39.733-42.923,68.693-47.189h0.171c47.229,6.899,82.127,47.588,81.749,95.317c0.017,7.846-0.9,15.666-2.731,23.296    c2.405-0.312,4.829-0.455,7.253-0.427c5.996,0.005,11.965,0.808,17.749,2.389C456.696,444.61,477.033,471.713,476.869,502.471    L476.869,502.471z"/>		<path style="fill:#66993E;" d="M502.469,7.537c0,0-6.997,264.96-192.512,252.245c-20.217-1.549-40.166-5.59-59.392-12.032    c-1.365-0.341-2.731-0.853-4.096-1.28c0,0-0.597-2.219-1.451-6.144c-6.656-34.048-25.088-198.997,231.765-230.144    C485.061,9.159,493.595,8.22,502.469,7.537z"/>		<path style="fill:#9ACA5C;" d="M476.784,10.183c-1.28,26.197-16.213,238.165-166.827,249.6    c-20.217-1.549-40.166-5.59-59.392-12.032c-1.365-0.341-2.731-0.853-4.096-1.28c0,0-0.597-2.219-1.451-6.144    C238.363,206.279,219.931,41.329,476.784,10.183z"/>		<path style="fill:#66993E;" d="M206.192,246.727c-0.768,3.925-1.365,6.144-1.365,6.144c-1.365,0.427-2.731,0.939-4.096,1.28    c-21.505,7.427-44.293,10.417-66.987,8.789C21.104,252.103,8.816,94.236,7.621,71.452c-0.085-1.792-0.085-2.731-0.085-2.731    C222.747,86.129,211.653,216.689,206.192,246.727z"/>		<path style="fill:#9ACA5C;" d="M180.336,246.727c-0.768,3.925-1.365,6.144-1.365,6.144c-1.365,0.427-2.731,0.939-4.096,1.28    c-13.351,4.412-27.142,7.359-41.131,8.789C21.104,252.103,8.816,94.236,7.621,71.452    C195.952,96.881,185.541,217.969,180.336,246.727z"/>	</g>	<g>		<path d="M162.136,426.671c3.451-0.001,6.562-2.08,7.882-5.268s0.591-6.858-1.849-9.298l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    C157.701,425.773,159.872,426.673,162.136,426.671L162.136,426.671z"/>		<path d="M292.636,398.57c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054s-3.335,8.671-0.054,12.012L292.636,398.57z"/>		<path d="M296.169,454.771c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012L296.169,454.771z"/>		<path d="M386.503,475.37c3.341,3.281,8.701,3.256,12.012-0.054c3.311-3.311,3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012L386.503,475.37z"/>		<path d="M204.803,409.604c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C198.241,407.524,201.352,409.603,204.803,409.604z"/>		<path d="M332.803,443.737c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C326.241,441.658,329.352,443.737,332.803,443.737z"/>		<path d="M341.336,366.937c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C334.774,364.858,337.885,366.937,341.336,366.937z"/>		<path d="M164.636,454.771l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C173.337,451.515,167.977,451.49,164.636,454.771L164.636,454.771z"/>		<path d="M232.903,429.171l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C241.604,425.915,236.243,425.89,232.903,429.171L232.903,429.171z"/>		<path d="M384.003,409.604c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    c-3.311-3.311-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298    C377.441,407.524,380.552,409.603,384.003,409.604z"/>		<path d="M70.77,463.304l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271s3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C79.47,460.048,74.11,460.024,70.77,463.304L70.77,463.304z"/>		<path d="M121.97,446.238l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C130.67,442.981,125.31,442.957,121.97,446.238L121.97,446.238z"/>		<path d="M202.302,420.638c-1.6-1.601-3.77-2.5-6.033-2.5c-2.263,0-4.433,0.899-6.033,2.5l-8.533,8.533    c-2.178,2.151-3.037,5.304-2.251,8.262c0.786,2.958,3.097,5.269,6.055,6.055c2.958,0.786,6.111-0.073,8.262-2.251l8.533-8.533    c1.601-1.6,2.5-3.77,2.5-6.033C204.802,424.408,203.903,422.237,202.302,420.638L202.302,420.638z"/>		<path d="M210.836,463.304c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012l8.533,8.533    c2.149,2.188,5.307,3.055,8.271,2.27c2.965-0.785,5.28-3.1,6.065-6.065c0.785-2.965-0.082-6.122-2.27-8.271L210.836,463.304z"/>		<path d="M343.836,454.771l-8.533,8.533c-2.188,2.149-3.055,5.307-2.27,8.271c0.785,2.965,3.1,5.28,6.065,6.065    c2.965,0.785,6.122-0.082,8.271-2.27l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    C352.537,451.515,347.177,451.49,343.836,454.771L343.836,454.771z"/>		<path d="M429.17,483.904c3.341,3.281,8.701,3.256,12.012-0.054s3.335-8.671,0.054-12.012l-8.533-8.533    c-3.341-3.281-8.701-3.256-12.012,0.054c-3.311,3.311-3.335,8.671-0.054,12.012L429.17,483.904z"/>		<path d="M341.336,401.071c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    s-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.441-3.169,6.11-1.849,9.298C334.774,398.991,337.885,401.07,341.336,401.071z"/>		<path d="M273.069,435.204c2.264,0.003,4.435-0.897,6.033-2.5l8.533-8.533c3.281-3.341,3.256-8.701-0.054-12.012    s-8.671-3.335-12.012-0.054l-8.533,8.533c-2.44,2.44-3.169,6.11-1.849,9.298C266.508,433.124,269.618,435.203,273.069,435.204z"/>		<path d="M253.318,258.138c22.738,7.382,46.448,11.338,70.351,11.737c31.602,0.543,62.581-8.828,88.583-26.796    c94.225-65.725,99.567-227.462,99.75-234.317c0.059-2.421-0.91-4.754-2.667-6.421c-1.751-1.679-4.141-2.52-6.558-2.308    C387.311,9.396,307.586,44.542,265.819,104.5c-28.443,42.151-38.198,94.184-26.956,143.776c-3.411,8.366-6.04,17.03-7.852,25.881    c-4.581-7.691-9.996-14.854-16.147-21.358c8.023-38.158,0.241-77.939-21.57-110.261C160.753,95.829,98.828,68.458,9.228,61.196    c-2.417-0.214-4.808,0.628-6.558,2.308c-1.757,1.667-2.726,4-2.667,6.421c0.142,5.321,4.292,130.929,77.717,182.142    c20.358,14.081,44.617,21.428,69.367,21.008c18.624-0.309,37.097-3.388,54.814-9.138c11.69,12.508,20.523,27.407,25.889,43.665    c0.149,15.133,2.158,30.19,5.982,44.832c-12.842-5.666-26.723-8.595-40.759-8.6c-49.449,0.497-91.788,35.567-101.483,84.058    c-5.094-1.093-10.29-1.641-15.5-1.638c-42.295,0.38-76.303,34.921-76.025,77.217c-0.001,2.263,0.898,4.434,2.499,6.035    c1.6,1.6,3.771,2.499,6.035,2.499h494.933c2.263,0.001,4.434-0.898,6.035-2.499c1.6-1.6,2.499-3.771,2.499-6.035    c0.249-41.103-31.914-75.112-72.967-77.154c0.65-4.78,0.975-9.598,0.975-14.421c0.914-45.674-28.469-86.455-72.083-100.045    c-43.615-13.59-90.962,3.282-116.154,41.391C242.252,322.17,242.793,288.884,253.318,258.138L253.318,258.138z M87.519,238.092    c-55.35-38.567-67.358-129.25-69.833-158.996c78.8,7.921,133.092,32.454,161.458,72.992    c15.333,22.503,22.859,49.414,21.423,76.606c-23.253-35.362-77.83-105.726-162.473-140.577c-2.82-1.165-6.048-0.736-8.466,1.125    s-3.658,4.873-3.252,7.897c0.406,3.024,2.395,5.602,5.218,6.761c89.261,36.751,144.772,117.776,161.392,144.874    C150.795,260.908,115.29,257.451,87.519,238.092z M279.969,114.046c37.6-53.788,109.708-86.113,214.408-96.138    c-2.65,35.375-17.158,159.05-91.892,211.175c-37.438,26.116-85.311,30.57-142.305,13.433    c19.284-32.09,92.484-142.574,212.405-191.954c2.819-1.161,4.805-3.738,5.209-6.76c0.404-3.022-0.835-6.031-3.25-7.892    c-2.415-1.861-5.64-2.292-8.459-1.131C351.388,82.01,279.465,179.805,252.231,222.711    C248.573,184.367,258.381,145.945,279.969,114.046L279.969,114.046z M262.694,368.017c15.097-26.883,43.468-43.587,74.3-43.746    c47.906,0.521,86.353,39.717,85.95,87.625c-0.001,7.188-0.857,14.351-2.55,21.337c-0.67,2.763,0.08,5.677,1.999,7.774    c1.919,2.097,4.757,3.1,7.568,2.676c1.994-0.272,4.005-0.393,6.017-0.362c29.59,0.283,54.467,22.284,58.367,51.617H17.661    c3.899-29.333,28.777-51.334,58.367-51.617c4-0.004,7.989,0.416,11.9,1.254c4.622,0.985,9.447,0.098,13.417-2.467    c3.858-2.519,6.531-6.493,7.408-11.017c7.793-40.473,43.043-69.838,84.258-70.192c16.045-0.002,31.757,4.582,45.283,13.212    c4.01,2.561,8.897,3.358,13.512,2.205C256.422,375.165,260.36,372.163,262.694,368.017L262.694,368.017z"/>	</g></g>',
            }
        },

        {
            id: 'node2', width: 150, height: 100, offsetX: 500, offsetY: 100, style: { fill: 'none' },
            annotations: [{ content: 'Check all causes' }],
            shape: {
                type: 'Native', content: '<g xmlns="http://www.w3.org/2000/svg">	<g transform="translate(1 1)">		<path style="fill:#FDDC42;" d="M417.219,379.501c5.745,13.691,10.675,27.71,14.763,41.984c0.983,2.981,0.203,6.261-2.016,8.48    c-2.219,2.219-5.499,2.999-8.48,2.016c-14.282-4.063-28.302-8.993-41.984-14.763l-46.336,26.624v0.085    c-1.824,14.741-4.531,29.359-8.107,43.776c-0.638,3.073-2.953,5.524-5.985,6.336c-3.032,0.812-6.262-0.154-8.351-2.496    c-10.342-10.73-20.03-22.072-29.013-33.963l-53.333,0.085c-9.013,11.865-18.73,23.177-29.099,33.877    c-2.089,2.343-5.319,3.308-8.351,2.496c-3.032-0.812-5.347-3.263-5.985-6.336c-3.583-14.415-6.29-29.034-8.107-43.776v-0.085    l-46.336-26.624c-13.691,5.745-27.71,10.675-41.984,14.763c-2.981,0.983-6.261,0.203-8.48-2.016s-2.999-5.499-2.016-8.48    c4.063-14.282,8.993-28.302,14.763-41.984l-26.624-46.336h-0.085c-14.741-1.824-29.359-4.531-43.776-8.107    c-3.073-0.638-5.524-2.953-6.336-5.985c-0.812-3.032,0.154-6.262,2.496-8.351c10.73-10.342,22.072-20.03,33.963-29.013    l-0.085-53.333c-11.865-9.013-23.177-18.73-33.877-29.099c-2.343-2.089-3.308-5.319-2.496-8.351    c0.812-3.032,3.263-5.347,6.336-5.985c14.415-3.583,29.034-6.29,43.776-8.107h0.085l26.624-46.336    c-5.745-13.691-10.675-27.71-14.763-41.984c-0.983-2.981-0.203-6.261,2.016-8.48s5.499-2.999,8.48-2.016    c14.282,4.063,28.303,8.993,41.984,14.763l46.336-26.624v-0.085c1.824-14.741,4.531-29.359,8.107-43.776    c0.638-3.073,2.953-5.524,5.985-6.336c3.032-0.812,6.262,0.154,8.351,2.496c10.342,10.73,20.03,22.072,29.013,33.963l53.333-0.085    c9.013-11.865,18.73-23.177,29.099-33.877c2.089-2.343,5.319-3.308,8.351-2.496c3.032,0.812,5.347,3.263,5.985,6.336    c3.583,14.415,6.29,29.034,8.107,43.776v0.085l46.336,26.624c13.691-5.745,27.71-10.675,41.984-14.763    c2.981-0.983,6.261-0.203,8.48,2.016c2.219,2.219,2.999,5.499,2.016,8.48c-4.063,14.282-8.993,28.303-14.763,41.984l26.624,46.336    h0.085c14.741,1.824,29.359,4.531,43.776,8.107c3.073,0.638,5.524,2.953,6.336,5.985c0.812,3.032-0.154,6.262-2.496,8.351    c-10.73,10.342-22.072,20.03-33.963,29.013l0.085,53.333c11.865,9.013,23.177,18.73,33.877,29.099    c2.343,2.089,3.308,5.319,2.496,8.351c-0.812,3.032-3.263,5.347-6.336,5.985c-14.415,3.583-29.034,6.29-43.776,8.107h-0.085"/>		<path style="fill:#FFEB49;" d="M497.892,247.574c-17.69-9.664-48.938-25.315-66.996-26.486c-1.624-8.324-3.842-16.52-6.637-24.527    c15.052-10.044,34.319-39.362,44.805-56.575c1.723-2.626,1.819-5.999,0.249-8.718c-1.57-2.72-4.539-4.323-7.675-4.144    c-20.158,0.476-55.2,2.502-71.417,10.524c-5.53-6.366-11.501-12.337-17.867-17.868c8.021-16.217,10.048-51.258,10.523-71.417    c0.179-3.136-1.424-6.105-4.144-7.675c-2.72-1.57-6.093-1.474-8.719,0.249c-17.212,10.487-46.531,29.752-56.575,44.805    c-8.007-2.795-16.203-5.013-24.527-6.636c-1.171-18.058-16.823-49.307-26.486-66.997c-1.413-2.805-4.285-4.575-7.426-4.575    s-6.013,1.77-7.426,4.575c-9.664,17.69-25.316,48.939-26.486,66.997c-8.324,1.623-16.521,3.841-24.527,6.636    c-10.044-15.053-39.362-34.318-56.575-44.805c-2.626-1.723-5.999-1.819-8.719-0.249c-2.72,1.57-4.323,4.539-4.144,7.675    c0.475,20.158,2.502,55.199,10.523,71.417c-6.366,5.531-12.336,11.501-17.867,17.868c-16.217-8.022-51.258-10.048-71.417-10.524    c-3.136-0.179-6.104,1.424-7.675,4.144c-1.57,2.72-1.474,6.092,0.249,8.718c10.486,17.214,29.753,46.531,44.805,56.576    c-2.795,8.007-5.013,16.203-6.637,24.527c-18.058,1.171-49.306,16.822-66.996,26.486c-2.805,1.412-4.575,4.285-4.575,7.426    s1.77,6.013,4.575,7.426c17.69,9.665,48.938,25.316,66.996,26.487c1.624,8.324,3.842,16.52,6.637,24.527    c-15.053,10.044-34.319,39.362-44.805,56.576c-1.723,2.626-1.819,5.998-0.249,8.718s4.539,4.323,7.675,4.143    c20.158-0.475,55.2-2.502,71.417-10.523c5.53,6.366,11.501,12.337,17.867,17.867c-8.021,16.218-10.048,51.259-10.523,71.417    c-0.179,3.136,1.424,6.105,4.144,7.675c2.72,1.57,6.093,1.474,8.719-0.249c17.213-10.486,46.53-29.751,56.575-44.805    c8.007,2.795,16.203,5.013,24.527,6.637c1.171,18.059,16.823,49.307,26.486,66.996c1.413,2.805,4.285,4.575,7.426,4.575    s6.013-1.77,7.426-4.575c9.664-17.689,25.316-48.938,26.486-66.996c8.324-1.624,16.52-3.841,24.527-6.637    c10.045,15.054,39.363,34.318,56.575,44.805c2.626,1.723,5.999,1.82,8.719,0.249s4.323-4.539,4.144-7.675    c-0.475-20.158-2.502-55.2-10.523-71.417c6.366-5.531,12.336-11.501,17.867-17.867c16.217,8.022,51.258,10.048,71.417,10.523    c3.135,0.179,6.104-1.423,7.675-4.143s1.474-6.092-0.249-8.718c-10.486-17.214-29.752-46.532-44.805-56.576    c2.796-8.007,5.014-16.203,6.637-24.527c18.058-1.171,49.306-16.822,66.996-26.487c2.805-1.412,4.575-4.285,4.575-7.426    C502.467,251.859,500.697,248.986,497.892,247.574z"/>		<circle style="fill:#E15919;" cx="255" cy="255" r="179.2"/>		<ellipse style="fill:#FF6E2C;" cx="242.2" cy="255" rx="166.4" ry="179.2"/>		<circle style="fill:#FFBE00;" cx="255" cy="255" r="145.067"/>		<ellipse style="fill:#FFC900;" cx="242.2" cy="255" rx="132.267" ry="145.067"/>	</g>	<g>		<path d="M502.983,241.087c-8.414-4.598-18.054-9.542-27.801-13.988c8.831-7.271,17.128-14.827,23.234-20.633    c4.61-4.239,6.486-10.688,4.869-16.738c-1.617-6.051-6.459-10.704-12.569-12.079c-6.766-1.643-18.167-4.224-30.405-6.256    c6.194-8.708,12.055-17.792,17.039-25.969c3.346-5.29,3.484-11.998,0.358-17.421c-3.169-5.387-9.028-8.613-15.275-8.408    c-9.558,0.224-20.335,0.757-30.956,1.762c4.002-10.73,7.347-21.391,9.69-29.433c1.863-5.973,0.261-12.486-4.16-16.914    c-4.421-4.427-10.931-6.039-16.907-4.186c-6.646,1.935-17.787,5.367-29.458,9.715c1.006-10.626,1.54-21.409,1.766-30.973    c0.249-6.255-2.988-12.134-8.408-15.267c-5.433-3.086-12.12-2.952-17.425,0.35c-8.175,4.979-17.254,10.837-25.959,17.026    c-1.885-11.384-4.295-22.281-6.266-30.38c-1.367-6.103-6.005-10.945-12.044-12.573c-6.039-1.627-12.482,0.228-16.731,4.819    c-4.799,4.991-12.752,13.532-20.721,23.168c-4.433-9.711-9.359-19.311-13.938-27.693C268.006,3.473,262.261,0,256,0    s-12.006,3.473-14.917,9.017c-4.594,8.41-9.537,18.049-13.983,27.795c-7.28-8.844-14.831-17.137-20.634-23.233    c-4.241-4.609-10.689-6.483-16.739-4.865c-6.05,1.618-10.703,6.46-12.078,12.57c-1.644,6.762-4.223,18.162-6.256,30.398    c-8.708-6.192-17.79-12.051-25.968-17.032c-5.305-3.302-11.992-3.436-17.425-0.35c-5.419,3.132-8.657,9.008-8.408,15.263    c0.227,9.56,0.759,20.337,1.765,30.958c-10.748-4.011-21.4-7.351-29.423-9.687c-5.975-1.865-12.491-0.264-16.92,4.158    c-4.43,4.422-6.043,10.935-4.188,16.913c1.945,6.665,5.382,17.82,9.717,29.456c-10.625-1.007-21.406-1.539-30.967-1.764    c-6.25-0.21-12.115,3.016-15.283,8.408c-3.125,5.423-2.987,12.131,0.358,17.421c4.981,8.174,10.84,17.254,17.031,25.959    c-11.388,1.886-22.283,4.297-30.373,6.262c-6.108,1.364-10.956,6.004-12.584,12.048s0.23,12.491,4.826,16.74    c4.996,4.798,13.54,12.749,23.167,20.712c-9.712,4.434-19.316,9.36-27.7,13.942C3.473,243.996,0,249.739,0,256    c0,6.26,3.473,12.004,9.017,14.912c8.415,4.598,18.054,9.543,27.8,13.989c-8.831,7.271-17.127,14.826-23.233,20.632    c-4.61,4.239-6.486,10.688-4.869,16.738c1.617,6.051,6.459,10.704,12.569,12.079c6.766,1.643,18.167,4.224,30.406,6.256    c-6.194,8.708-12.056,17.791-17.04,25.969c-3.346,5.29-3.484,11.998-0.358,17.421c3.193,5.362,9.036,8.578,15.275,8.408    c9.558-0.224,20.335-0.757,30.956-1.762c-4.002,10.73-7.347,21.391-9.69,29.433c-1.816,5.982-0.214,12.477,4.175,16.929    c3.175,3.149,7.47,4.909,11.942,4.892c1.676-0.001,3.343-0.244,4.95-0.721c6.646-1.935,17.787-5.367,29.458-9.715    c-1.006,10.626-1.54,21.409-1.766,30.973c-0.249,6.255,2.988,12.134,8.408,15.267c5.436,3.078,12.117,2.944,17.425-0.35    c8.175-4.979,17.255-10.836,25.96-17.026c1.885,11.383,4.294,22.281,6.265,30.38c1.412,6.095,6.051,10.926,12.083,12.583    c1.395,0.371,2.832,0.559,4.275,0.558c4.702-0.018,9.191-1.966,12.417-5.387c4.799-4.991,12.752-13.532,20.721-23.168    c4.433,9.711,9.359,19.311,13.938,27.693c2.91,5.544,8.655,9.017,14.917,9.017c6.262,0,12.006-3.473,14.917-9.017    c4.594-8.41,9.537-18.049,13.983-27.795c7.28,8.844,14.831,17.137,20.634,23.233c3.237,3.44,7.743,5.401,12.467,5.425    c1.44,0,2.875-0.188,4.267-0.558c6.029-1.656,10.667-6.481,12.083-12.571c1.644-6.762,4.223-18.162,6.256-30.398    c8.708,6.192,17.791,12.051,25.969,17.032c5.308,3.294,11.99,3.428,17.425,0.35c5.419-3.132,8.657-9.008,8.408-15.263    c-0.227-9.56-0.759-20.338-1.765-30.958c10.748,4.011,21.4,7.352,29.423,9.688c1.618,0.479,3.296,0.724,4.983,0.725    c4.472,0.022,8.768-1.737,11.941-4.888c4.385-4.445,5.989-10.931,4.183-16.908c-1.945-6.665-5.382-17.82-9.717-29.456    c10.625,1.007,21.406,1.539,30.967,1.764l0.433,0.009c6.098,0.049,11.759-3.159,14.85-8.417    c3.125-5.423,2.987-12.131-0.358-17.421c-4.981-8.175-10.842-17.254-17.031-25.959c11.386-1.886,22.283-4.297,30.373-6.262    c6.108-1.364,10.956-6.004,12.584-12.048c1.629-6.043-0.23-12.491-4.826-16.74c-4.996-4.798-13.538-12.748-23.165-20.711    c9.71-4.434,19.312-9.36,27.698-13.943C508.527,268.004,512,262.261,512,256C512,249.74,508.527,243.996,502.983,241.087    L502.983,241.087z M486.658,194.096c-9.414,9.008-19.277,17.536-29.55,25.551c-5.876-2.215-11.918-3.96-18.071-5.217    c-1.067-4.698-2.264-9.347-3.676-13.905c4.711-4.198,9.082-8.763,13.072-13.652C463.298,188.831,478.505,192.236,486.658,194.096z     M381.048,371.756c-2.971,3.208-6.051,6.289-9.24,9.244c-17.465,16.225-38.136,28.61-60.681,36.356    c-3.219,1.099-6.344,2.039-9.444,2.917c-1.848,0.515-3.711,0.986-5.583,1.44c-2.558,0.629-5.122,1.285-7.657,1.773    c-21.421,4.242-43.465,4.242-64.885,0c-2.535-0.489-5.099-1.145-7.657-1.773c-1.872-0.454-3.735-0.925-5.583-1.44    c-3.1-0.878-6.225-1.817-9.444-2.917c-22.545-7.746-43.216-20.13-60.681-36.356c-3.19-2.957-6.27-6.039-9.239-9.244    c-16.187-17.438-28.547-38.07-36.285-60.57c-1.105-3.213-2.044-6.342-2.926-9.452c-0.524-1.877-1.001-3.77-1.461-5.671    c-0.625-2.547-1.279-5.096-1.766-7.63c-4.239-21.414-4.239-43.451,0-64.865c0.492-2.55,1.152-5.131,1.786-7.709    c0.448-1.847,0.912-3.685,1.42-5.508c0.877-3.102,1.817-6.232,2.918-9.456c7.738-22.53,20.109-43.19,36.315-60.65    c2.971-3.208,6.051-6.289,9.24-9.244c17.465-16.225,38.136-28.61,60.681-36.356c3.219-1.1,6.344-2.039,9.444-2.917    c1.848-0.515,3.711-0.986,5.583-1.44c2.558-0.629,5.122-1.285,7.657-1.773c21.421-4.242,43.465-4.242,64.885,0    c2.535,0.489,5.099,1.145,7.657,1.773c1.872,0.454,3.735,0.925,5.583,1.44c3.1,0.878,6.225,1.817,9.444,2.917    c22.545,7.746,43.216,20.13,60.681,36.356c3.19,2.957,6.269,6.039,9.24,9.244c16.207,17.459,28.578,38.12,36.316,60.65    c1.101,3.224,2.041,6.354,2.918,9.456c0.507,1.823,0.972,3.661,1.42,5.508c0.634,2.578,1.295,5.16,1.786,7.709    c4.239,21.414,4.239,43.451,0,64.865c-0.488,2.534-1.142,5.083-1.766,7.63c-0.461,1.901-0.937,3.795-1.461,5.671    c-0.882,3.11-1.821,6.239-2.926,9.452C409.595,333.686,397.235,354.317,381.048,371.756z M462.783,136.542    c-9.639,16.632-20.961,32.231-33.787,46.55c-6.106-14.401-13.987-27.983-23.46-40.43    C424.361,138.686,443.543,136.636,462.783,136.542L462.783,136.542z M424.792,87.129c-3.599,12.468-7.836,24.743-12.694,36.777    c-6.285,1.015-12.478,2.533-18.521,4.539c-3.214-3.466-6.556-6.807-10.024-10.024c2.012-6.056,3.533-12.264,4.549-18.563    C402.048,94.135,416.844,89.536,424.792,87.129L424.792,87.129z M375.342,49.162c-0.023,19.256-2.037,38.457-6.008,57.299    c-12.447-9.473-26.028-17.353-40.429-23.458C343.2,70.183,358.759,58.845,375.342,49.162L375.342,49.162z M317.767,25.308    c3.109,12.615,5.567,25.381,7.364,38.248c-4.894,3.991-9.462,8.365-13.663,13.081c-4.554-1.411-9.2-2.607-13.894-3.673    c-1.27-6.21-3.035-12.308-5.279-18.236C301.564,42.74,312.089,31.379,317.767,25.308z M255.933,17.2    c9.596,16.661,17.427,34.277,23.364,52.564c-15.468-1.997-31.129-1.997-46.598,0.001C238.623,51.493,246.408,33.879,255.933,17.2    L255.933,17.2z M194.092,25.337c9.01,9.414,17.538,19.278,25.552,29.554c-2.216,5.876-3.961,11.92-5.219,18.073    c-4.693,1.066-9.34,2.261-13.894,3.673c-4.199-4.713-8.766-9.086-13.657-13.077C188.834,48.702,192.232,33.493,194.092,25.337    L194.092,25.337z M183.094,83.004c-14.401,6.105-27.982,13.986-40.429,23.458c-3.977-18.822-6.028-38-6.123-57.237    C153.176,58.858,168.776,70.178,183.094,83.004L183.094,83.004z M87.133,87.208c12.467,3.596,24.74,7.832,36.772,12.691    c1.015,6.286,2.534,12.48,4.542,18.522c-3.466,3.215-6.807,6.556-10.024,10.024c-6.059-2.01-12.269-3.531-18.571-4.547    C94.156,110.016,89.547,95.186,87.133,87.208L87.133,87.208z M106.464,142.663c-9.474,12.447-17.355,26.029-23.46,40.431    c-12.819-14.297-24.156-29.856-33.837-46.44C68.422,136.68,87.623,138.693,106.464,142.663L106.464,142.663z M25.317,194.233    c12.613-3.113,25.379-5.572,38.247-7.366c3.99,4.891,8.362,9.458,13.075,13.657c-1.413,4.558-2.609,9.207-3.676,13.905    c-6.209,1.27-12.306,3.034-18.233,5.277C42.756,210.445,31.386,199.918,25.317,194.233z M69.764,232.703    c-1.997,15.468-1.997,31.128,0,46.596c-18.272-5.923-35.886-13.709-52.565-23.236C33.861,246.468,51.478,238.639,69.764,232.703z     M25.342,317.904c9.414-9.008,19.276-17.535,29.549-25.549c5.876,2.216,11.919,3.96,18.072,5.216    c1.067,4.696,2.263,9.343,3.675,13.899c-4.711,4.2-9.082,8.767-13.071,13.658C48.701,323.169,33.494,319.764,25.342,317.904z     M49.217,375.458c9.639-16.633,20.961-32.232,33.787-46.552c6.106,14.402,13.987,27.984,23.46,40.432    C87.639,373.313,68.457,375.364,49.217,375.458L49.217,375.458z M87.208,424.871c3.599-12.468,7.836-24.744,12.694-36.778    c6.285-1.015,12.478-2.533,18.521-4.538c3.215,3.466,6.556,6.807,10.024,10.024c-2.012,6.056-3.533,12.264-4.549,18.564    C109.952,417.865,95.156,422.464,87.208,424.871L87.208,424.871z M136.658,462.837c0.023-19.256,2.037-38.457,6.008-57.299    c12.447,9.473,26.028,17.353,40.429,23.458C168.8,441.817,153.241,453.155,136.658,462.837L136.658,462.837z M194.233,486.691    c-3.11-12.606-5.581-25.361-7.404-38.216c4.907-4.001,9.489-8.386,13.702-13.113c4.554,1.411,9.2,2.607,13.894,3.673    c1.27,6.21,3.035,12.308,5.279,18.236C210.435,469.259,199.91,480.621,194.233,486.691L194.233,486.691z M256.066,494.8    c-9.596-16.661-17.427-34.277-23.364-52.564c15.468,1.997,31.129,1.997,46.598-0.001    C273.377,460.506,265.591,478.121,256.066,494.8L256.066,494.8z M317.908,486.662c-9.01-9.414-17.538-19.278-25.552-29.554    c2.216-5.876,3.961-11.92,5.219-18.073c4.693-1.066,9.34-2.261,13.894-3.673c4.2,4.713,8.766,9.085,13.657,13.076    C323.166,463.297,319.768,478.507,317.908,486.662L317.908,486.662z M328.906,428.996c14.401-6.105,27.982-13.986,40.429-23.458    c3.977,18.822,6.028,38,6.123,57.238C358.823,453.142,343.224,441.823,328.906,428.996L328.906,428.996z M424.866,424.792    c-12.466-3.597-24.74-7.833-36.771-12.691c-1.016-6.286-2.535-12.479-4.543-18.522c3.466-3.215,6.807-6.556,10.024-10.024    c6.059,2.01,12.269,3.531,18.571,4.547C417.844,401.984,422.453,416.814,424.866,424.792L424.866,424.792z M405.535,369.337    c9.475-12.447,17.356-26.03,23.461-40.432c12.819,14.298,24.155,29.858,33.836,46.441    C443.578,375.32,424.377,373.307,405.535,369.337L405.535,369.337z M486.683,317.767c-12.613,3.113-25.379,5.571-38.246,7.365    c-3.99-4.893-8.363-9.461-13.075-13.663c1.413-4.556,2.608-9.203,3.675-13.899c6.209-1.269,12.307-3.034,18.234-5.276    C469.245,301.556,480.613,312.082,486.683,317.767L486.683,317.767z M442.235,279.297c1.997-15.467,1.997-31.127,0-46.594    c18.245,5.922,35.822,13.73,52.448,23.297C478.057,265.567,460.48,273.375,442.235,279.297z"/>		<path d="M256,102.4c-84.831,0-153.6,68.769-153.6,153.6S171.169,409.6,256,409.6S409.6,340.831,409.6,256    C409.503,171.209,340.791,102.497,256,102.4z M256,392.533c-75.405,0-136.533-61.128-136.533-136.533S180.595,119.466,256,119.466    S392.533,180.595,392.533,256C392.447,331.369,331.369,392.447,256,392.533z"/>	</g></g>',
            },
        },
        {
            id: 'node3', width: 150, height: 100, offsetX: 400, offsetY: 300, style: { fill: 'none' },
            annotations: [{ content: 'Check all causes' }],
            shape: {
                type: 'Native', content: '<g xmlns="http://www.w3.org/2000/svg">	<g transform="translate(1 1)">		<path style="fill:#FDDC42;" d="M417.219,379.501c5.745,13.691,10.675,27.71,14.763,41.984c0.983,2.981,0.203,6.261-2.016,8.48    c-2.219,2.219-5.499,2.999-8.48,2.016c-14.282-4.063-28.302-8.993-41.984-14.763l-46.336,26.624v0.085    c-1.824,14.741-4.531,29.359-8.107,43.776c-0.638,3.073-2.953,5.524-5.985,6.336c-3.032,0.812-6.262-0.154-8.351-2.496    c-10.342-10.73-20.03-22.072-29.013-33.963l-53.333,0.085c-9.013,11.865-18.73,23.177-29.099,33.877    c-2.089,2.343-5.319,3.308-8.351,2.496c-3.032-0.812-5.347-3.263-5.985-6.336c-3.583-14.415-6.29-29.034-8.107-43.776v-0.085    l-46.336-26.624c-13.691,5.745-27.71,10.675-41.984,14.763c-2.981,0.983-6.261,0.203-8.48-2.016s-2.999-5.499-2.016-8.48    c4.063-14.282,8.993-28.302,14.763-41.984l-26.624-46.336h-0.085c-14.741-1.824-29.359-4.531-43.776-8.107    c-3.073-0.638-5.524-2.953-6.336-5.985c-0.812-3.032,0.154-6.262,2.496-8.351c10.73-10.342,22.072-20.03,33.963-29.013    l-0.085-53.333c-11.865-9.013-23.177-18.73-33.877-29.099c-2.343-2.089-3.308-5.319-2.496-8.351    c0.812-3.032,3.263-5.347,6.336-5.985c14.415-3.583,29.034-6.29,43.776-8.107h0.085l26.624-46.336    c-5.745-13.691-10.675-27.71-14.763-41.984c-0.983-2.981-0.203-6.261,2.016-8.48s5.499-2.999,8.48-2.016    c14.282,4.063,28.303,8.993,41.984,14.763l46.336-26.624v-0.085c1.824-14.741,4.531-29.359,8.107-43.776    c0.638-3.073,2.953-5.524,5.985-6.336c3.032-0.812,6.262,0.154,8.351,2.496c10.342,10.73,20.03,22.072,29.013,33.963l53.333-0.085    c9.013-11.865,18.73-23.177,29.099-33.877c2.089-2.343,5.319-3.308,8.351-2.496c3.032,0.812,5.347,3.263,5.985,6.336    c3.583,14.415,6.29,29.034,8.107,43.776v0.085l46.336,26.624c13.691-5.745,27.71-10.675,41.984-14.763    c2.981-0.983,6.261-0.203,8.48,2.016c2.219,2.219,2.999,5.499,2.016,8.48c-4.063,14.282-8.993,28.303-14.763,41.984l26.624,46.336    h0.085c14.741,1.824,29.359,4.531,43.776,8.107c3.073,0.638,5.524,2.953,6.336,5.985c0.812,3.032-0.154,6.262-2.496,8.351    c-10.73,10.342-22.072,20.03-33.963,29.013l0.085,53.333c11.865,9.013,23.177,18.73,33.877,29.099    c2.343,2.089,3.308,5.319,2.496,8.351c-0.812,3.032-3.263,5.347-6.336,5.985c-14.415,3.583-29.034,6.29-43.776,8.107h-0.085"/>		<path style="fill:#FFEB49;" d="M497.892,247.574c-17.69-9.664-48.938-25.315-66.996-26.486c-1.624-8.324-3.842-16.52-6.637-24.527    c15.052-10.044,34.319-39.362,44.805-56.575c1.723-2.626,1.819-5.999,0.249-8.718c-1.57-2.72-4.539-4.323-7.675-4.144    c-20.158,0.476-55.2,2.502-71.417,10.524c-5.53-6.366-11.501-12.337-17.867-17.868c8.021-16.217,10.048-51.258,10.523-71.417    c0.179-3.136-1.424-6.105-4.144-7.675c-2.72-1.57-6.093-1.474-8.719,0.249c-17.212,10.487-46.531,29.752-56.575,44.805    c-8.007-2.795-16.203-5.013-24.527-6.636c-1.171-18.058-16.823-49.307-26.486-66.997c-1.413-2.805-4.285-4.575-7.426-4.575    s-6.013,1.77-7.426,4.575c-9.664,17.69-25.316,48.939-26.486,66.997c-8.324,1.623-16.521,3.841-24.527,6.636    c-10.044-15.053-39.362-34.318-56.575-44.805c-2.626-1.723-5.999-1.819-8.719-0.249c-2.72,1.57-4.323,4.539-4.144,7.675    c0.475,20.158,2.502,55.199,10.523,71.417c-6.366,5.531-12.336,11.501-17.867,17.868c-16.217-8.022-51.258-10.048-71.417-10.524    c-3.136-0.179-6.104,1.424-7.675,4.144c-1.57,2.72-1.474,6.092,0.249,8.718c10.486,17.214,29.753,46.531,44.805,56.576    c-2.795,8.007-5.013,16.203-6.637,24.527c-18.058,1.171-49.306,16.822-66.996,26.486c-2.805,1.412-4.575,4.285-4.575,7.426    s1.77,6.013,4.575,7.426c17.69,9.665,48.938,25.316,66.996,26.487c1.624,8.324,3.842,16.52,6.637,24.527    c-15.053,10.044-34.319,39.362-44.805,56.576c-1.723,2.626-1.819,5.998-0.249,8.718s4.539,4.323,7.675,4.143    c20.158-0.475,55.2-2.502,71.417-10.523c5.53,6.366,11.501,12.337,17.867,17.867c-8.021,16.218-10.048,51.259-10.523,71.417    c-0.179,3.136,1.424,6.105,4.144,7.675c2.72,1.57,6.093,1.474,8.719-0.249c17.213-10.486,46.53-29.751,56.575-44.805    c8.007,2.795,16.203,5.013,24.527,6.637c1.171,18.059,16.823,49.307,26.486,66.996c1.413,2.805,4.285,4.575,7.426,4.575    s6.013-1.77,7.426-4.575c9.664-17.689,25.316-48.938,26.486-66.996c8.324-1.624,16.52-3.841,24.527-6.637    c10.045,15.054,39.363,34.318,56.575,44.805c2.626,1.723,5.999,1.82,8.719,0.249s4.323-4.539,4.144-7.675    c-0.475-20.158-2.502-55.2-10.523-71.417c6.366-5.531,12.336-11.501,17.867-17.867c16.217,8.022,51.258,10.048,71.417,10.523    c3.135,0.179,6.104-1.423,7.675-4.143s1.474-6.092-0.249-8.718c-10.486-17.214-29.752-46.532-44.805-56.576    c2.796-8.007,5.014-16.203,6.637-24.527c18.058-1.171,49.306-16.822,66.996-26.487c2.805-1.412,4.575-4.285,4.575-7.426    C502.467,251.859,500.697,248.986,497.892,247.574z"/>		<circle style="fill:#E15919;" cx="255" cy="255" r="179.2"/>		<ellipse style="fill:#FF6E2C;" cx="242.2" cy="255" rx="166.4" ry="179.2"/>		<circle style="fill:#FFBE00;" cx="255" cy="255" r="145.067"/>		<ellipse style="fill:#FFC900;" cx="242.2" cy="255" rx="132.267" ry="145.067"/>	</g>	<g>		<path d="M502.983,241.087c-8.414-4.598-18.054-9.542-27.801-13.988c8.831-7.271,17.128-14.827,23.234-20.633    c4.61-4.239,6.486-10.688,4.869-16.738c-1.617-6.051-6.459-10.704-12.569-12.079c-6.766-1.643-18.167-4.224-30.405-6.256    c6.194-8.708,12.055-17.792,17.039-25.969c3.346-5.29,3.484-11.998,0.358-17.421c-3.169-5.387-9.028-8.613-15.275-8.408    c-9.558,0.224-20.335,0.757-30.956,1.762c4.002-10.73,7.347-21.391,9.69-29.433c1.863-5.973,0.261-12.486-4.16-16.914    c-4.421-4.427-10.931-6.039-16.907-4.186c-6.646,1.935-17.787,5.367-29.458,9.715c1.006-10.626,1.54-21.409,1.766-30.973    c0.249-6.255-2.988-12.134-8.408-15.267c-5.433-3.086-12.12-2.952-17.425,0.35c-8.175,4.979-17.254,10.837-25.959,17.026    c-1.885-11.384-4.295-22.281-6.266-30.38c-1.367-6.103-6.005-10.945-12.044-12.573c-6.039-1.627-12.482,0.228-16.731,4.819    c-4.799,4.991-12.752,13.532-20.721,23.168c-4.433-9.711-9.359-19.311-13.938-27.693C268.006,3.473,262.261,0,256,0    s-12.006,3.473-14.917,9.017c-4.594,8.41-9.537,18.049-13.983,27.795c-7.28-8.844-14.831-17.137-20.634-23.233    c-4.241-4.609-10.689-6.483-16.739-4.865c-6.05,1.618-10.703,6.46-12.078,12.57c-1.644,6.762-4.223,18.162-6.256,30.398    c-8.708-6.192-17.79-12.051-25.968-17.032c-5.305-3.302-11.992-3.436-17.425-0.35c-5.419,3.132-8.657,9.008-8.408,15.263    c0.227,9.56,0.759,20.337,1.765,30.958c-10.748-4.011-21.4-7.351-29.423-9.687c-5.975-1.865-12.491-0.264-16.92,4.158    c-4.43,4.422-6.043,10.935-4.188,16.913c1.945,6.665,5.382,17.82,9.717,29.456c-10.625-1.007-21.406-1.539-30.967-1.764    c-6.25-0.21-12.115,3.016-15.283,8.408c-3.125,5.423-2.987,12.131,0.358,17.421c4.981,8.174,10.84,17.254,17.031,25.959    c-11.388,1.886-22.283,4.297-30.373,6.262c-6.108,1.364-10.956,6.004-12.584,12.048s0.23,12.491,4.826,16.74    c4.996,4.798,13.54,12.749,23.167,20.712c-9.712,4.434-19.316,9.36-27.7,13.942C3.473,243.996,0,249.739,0,256    c0,6.26,3.473,12.004,9.017,14.912c8.415,4.598,18.054,9.543,27.8,13.989c-8.831,7.271-17.127,14.826-23.233,20.632    c-4.61,4.239-6.486,10.688-4.869,16.738c1.617,6.051,6.459,10.704,12.569,12.079c6.766,1.643,18.167,4.224,30.406,6.256    c-6.194,8.708-12.056,17.791-17.04,25.969c-3.346,5.29-3.484,11.998-0.358,17.421c3.193,5.362,9.036,8.578,15.275,8.408    c9.558-0.224,20.335-0.757,30.956-1.762c-4.002,10.73-7.347,21.391-9.69,29.433c-1.816,5.982-0.214,12.477,4.175,16.929    c3.175,3.149,7.47,4.909,11.942,4.892c1.676-0.001,3.343-0.244,4.95-0.721c6.646-1.935,17.787-5.367,29.458-9.715    c-1.006,10.626-1.54,21.409-1.766,30.973c-0.249,6.255,2.988,12.134,8.408,15.267c5.436,3.078,12.117,2.944,17.425-0.35    c8.175-4.979,17.255-10.836,25.96-17.026c1.885,11.383,4.294,22.281,6.265,30.38c1.412,6.095,6.051,10.926,12.083,12.583    c1.395,0.371,2.832,0.559,4.275,0.558c4.702-0.018,9.191-1.966,12.417-5.387c4.799-4.991,12.752-13.532,20.721-23.168    c4.433,9.711,9.359,19.311,13.938,27.693c2.91,5.544,8.655,9.017,14.917,9.017c6.262,0,12.006-3.473,14.917-9.017    c4.594-8.41,9.537-18.049,13.983-27.795c7.28,8.844,14.831,17.137,20.634,23.233c3.237,3.44,7.743,5.401,12.467,5.425    c1.44,0,2.875-0.188,4.267-0.558c6.029-1.656,10.667-6.481,12.083-12.571c1.644-6.762,4.223-18.162,6.256-30.398    c8.708,6.192,17.791,12.051,25.969,17.032c5.308,3.294,11.99,3.428,17.425,0.35c5.419-3.132,8.657-9.008,8.408-15.263    c-0.227-9.56-0.759-20.338-1.765-30.958c10.748,4.011,21.4,7.352,29.423,9.688c1.618,0.479,3.296,0.724,4.983,0.725    c4.472,0.022,8.768-1.737,11.941-4.888c4.385-4.445,5.989-10.931,4.183-16.908c-1.945-6.665-5.382-17.82-9.717-29.456    c10.625,1.007,21.406,1.539,30.967,1.764l0.433,0.009c6.098,0.049,11.759-3.159,14.85-8.417    c3.125-5.423,2.987-12.131-0.358-17.421c-4.981-8.175-10.842-17.254-17.031-25.959c11.386-1.886,22.283-4.297,30.373-6.262    c6.108-1.364,10.956-6.004,12.584-12.048c1.629-6.043-0.23-12.491-4.826-16.74c-4.996-4.798-13.538-12.748-23.165-20.711    c9.71-4.434,19.312-9.36,27.698-13.943C508.527,268.004,512,262.261,512,256C512,249.74,508.527,243.996,502.983,241.087    L502.983,241.087z M486.658,194.096c-9.414,9.008-19.277,17.536-29.55,25.551c-5.876-2.215-11.918-3.96-18.071-5.217    c-1.067-4.698-2.264-9.347-3.676-13.905c4.711-4.198,9.082-8.763,13.072-13.652C463.298,188.831,478.505,192.236,486.658,194.096z     M381.048,371.756c-2.971,3.208-6.051,6.289-9.24,9.244c-17.465,16.225-38.136,28.61-60.681,36.356    c-3.219,1.099-6.344,2.039-9.444,2.917c-1.848,0.515-3.711,0.986-5.583,1.44c-2.558,0.629-5.122,1.285-7.657,1.773    c-21.421,4.242-43.465,4.242-64.885,0c-2.535-0.489-5.099-1.145-7.657-1.773c-1.872-0.454-3.735-0.925-5.583-1.44    c-3.1-0.878-6.225-1.817-9.444-2.917c-22.545-7.746-43.216-20.13-60.681-36.356c-3.19-2.957-6.27-6.039-9.239-9.244    c-16.187-17.438-28.547-38.07-36.285-60.57c-1.105-3.213-2.044-6.342-2.926-9.452c-0.524-1.877-1.001-3.77-1.461-5.671    c-0.625-2.547-1.279-5.096-1.766-7.63c-4.239-21.414-4.239-43.451,0-64.865c0.492-2.55,1.152-5.131,1.786-7.709    c0.448-1.847,0.912-3.685,1.42-5.508c0.877-3.102,1.817-6.232,2.918-9.456c7.738-22.53,20.109-43.19,36.315-60.65    c2.971-3.208,6.051-6.289,9.24-9.244c17.465-16.225,38.136-28.61,60.681-36.356c3.219-1.1,6.344-2.039,9.444-2.917    c1.848-0.515,3.711-0.986,5.583-1.44c2.558-0.629,5.122-1.285,7.657-1.773c21.421-4.242,43.465-4.242,64.885,0    c2.535,0.489,5.099,1.145,7.657,1.773c1.872,0.454,3.735,0.925,5.583,1.44c3.1,0.878,6.225,1.817,9.444,2.917    c22.545,7.746,43.216,20.13,60.681,36.356c3.19,2.957,6.269,6.039,9.24,9.244c16.207,17.459,28.578,38.12,36.316,60.65    c1.101,3.224,2.041,6.354,2.918,9.456c0.507,1.823,0.972,3.661,1.42,5.508c0.634,2.578,1.295,5.16,1.786,7.709    c4.239,21.414,4.239,43.451,0,64.865c-0.488,2.534-1.142,5.083-1.766,7.63c-0.461,1.901-0.937,3.795-1.461,5.671    c-0.882,3.11-1.821,6.239-2.926,9.452C409.595,333.686,397.235,354.317,381.048,371.756z M462.783,136.542    c-9.639,16.632-20.961,32.231-33.787,46.55c-6.106-14.401-13.987-27.983-23.46-40.43    C424.361,138.686,443.543,136.636,462.783,136.542L462.783,136.542z M424.792,87.129c-3.599,12.468-7.836,24.743-12.694,36.777    c-6.285,1.015-12.478,2.533-18.521,4.539c-3.214-3.466-6.556-6.807-10.024-10.024c2.012-6.056,3.533-12.264,4.549-18.563    C402.048,94.135,416.844,89.536,424.792,87.129L424.792,87.129z M375.342,49.162c-0.023,19.256-2.037,38.457-6.008,57.299    c-12.447-9.473-26.028-17.353-40.429-23.458C343.2,70.183,358.759,58.845,375.342,49.162L375.342,49.162z M317.767,25.308    c3.109,12.615,5.567,25.381,7.364,38.248c-4.894,3.991-9.462,8.365-13.663,13.081c-4.554-1.411-9.2-2.607-13.894-3.673    c-1.27-6.21-3.035-12.308-5.279-18.236C301.564,42.74,312.089,31.379,317.767,25.308z M255.933,17.2    c9.596,16.661,17.427,34.277,23.364,52.564c-15.468-1.997-31.129-1.997-46.598,0.001C238.623,51.493,246.408,33.879,255.933,17.2    L255.933,17.2z M194.092,25.337c9.01,9.414,17.538,19.278,25.552,29.554c-2.216,5.876-3.961,11.92-5.219,18.073    c-4.693,1.066-9.34,2.261-13.894,3.673c-4.199-4.713-8.766-9.086-13.657-13.077C188.834,48.702,192.232,33.493,194.092,25.337    L194.092,25.337z M183.094,83.004c-14.401,6.105-27.982,13.986-40.429,23.458c-3.977-18.822-6.028-38-6.123-57.237    C153.176,58.858,168.776,70.178,183.094,83.004L183.094,83.004z M87.133,87.208c12.467,3.596,24.74,7.832,36.772,12.691    c1.015,6.286,2.534,12.48,4.542,18.522c-3.466,3.215-6.807,6.556-10.024,10.024c-6.059-2.01-12.269-3.531-18.571-4.547    C94.156,110.016,89.547,95.186,87.133,87.208L87.133,87.208z M106.464,142.663c-9.474,12.447-17.355,26.029-23.46,40.431    c-12.819-14.297-24.156-29.856-33.837-46.44C68.422,136.68,87.623,138.693,106.464,142.663L106.464,142.663z M25.317,194.233    c12.613-3.113,25.379-5.572,38.247-7.366c3.99,4.891,8.362,9.458,13.075,13.657c-1.413,4.558-2.609,9.207-3.676,13.905    c-6.209,1.27-12.306,3.034-18.233,5.277C42.756,210.445,31.386,199.918,25.317,194.233z M69.764,232.703    c-1.997,15.468-1.997,31.128,0,46.596c-18.272-5.923-35.886-13.709-52.565-23.236C33.861,246.468,51.478,238.639,69.764,232.703z     M25.342,317.904c9.414-9.008,19.276-17.535,29.549-25.549c5.876,2.216,11.919,3.96,18.072,5.216    c1.067,4.696,2.263,9.343,3.675,13.899c-4.711,4.2-9.082,8.767-13.071,13.658C48.701,323.169,33.494,319.764,25.342,317.904z     M49.217,375.458c9.639-16.633,20.961-32.232,33.787-46.552c6.106,14.402,13.987,27.984,23.46,40.432    C87.639,373.313,68.457,375.364,49.217,375.458L49.217,375.458z M87.208,424.871c3.599-12.468,7.836-24.744,12.694-36.778    c6.285-1.015,12.478-2.533,18.521-4.538c3.215,3.466,6.556,6.807,10.024,10.024c-2.012,6.056-3.533,12.264-4.549,18.564    C109.952,417.865,95.156,422.464,87.208,424.871L87.208,424.871z M136.658,462.837c0.023-19.256,2.037-38.457,6.008-57.299    c12.447,9.473,26.028,17.353,40.429,23.458C168.8,441.817,153.241,453.155,136.658,462.837L136.658,462.837z M194.233,486.691    c-3.11-12.606-5.581-25.361-7.404-38.216c4.907-4.001,9.489-8.386,13.702-13.113c4.554,1.411,9.2,2.607,13.894,3.673    c1.27,6.21,3.035,12.308,5.279,18.236C210.435,469.259,199.91,480.621,194.233,486.691L194.233,486.691z M256.066,494.8    c-9.596-16.661-17.427-34.277-23.364-52.564c15.468,1.997,31.129,1.997,46.598-0.001    C273.377,460.506,265.591,478.121,256.066,494.8L256.066,494.8z M317.908,486.662c-9.01-9.414-17.538-19.278-25.552-29.554    c2.216-5.876,3.961-11.92,5.219-18.073c4.693-1.066,9.34-2.261,13.894-3.673c4.2,4.713,8.766,9.085,13.657,13.076    C323.166,463.297,319.768,478.507,317.908,486.662L317.908,486.662z M328.906,428.996c14.401-6.105,27.982-13.986,40.429-23.458    c3.977,18.822,6.028,38,6.123,57.238C358.823,453.142,343.224,441.823,328.906,428.996L328.906,428.996z M424.866,424.792    c-12.466-3.597-24.74-7.833-36.771-12.691c-1.016-6.286-2.535-12.479-4.543-18.522c3.466-3.215,6.807-6.556,10.024-10.024    c6.059,2.01,12.269,3.531,18.571,4.547C417.844,401.984,422.453,416.814,424.866,424.792L424.866,424.792z M405.535,369.337    c9.475-12.447,17.356-26.03,23.461-40.432c12.819,14.298,24.155,29.858,33.836,46.441    C443.578,375.32,424.377,373.307,405.535,369.337L405.535,369.337z M486.683,317.767c-12.613,3.113-25.379,5.571-38.246,7.365    c-3.99-4.893-8.363-9.461-13.075-13.663c1.413-4.556,2.608-9.203,3.675-13.899c6.209-1.269,12.307-3.034,18.234-5.276    C469.245,301.556,480.613,312.082,486.683,317.767L486.683,317.767z M442.235,279.297c1.997-15.467,1.997-31.127,0-46.594    c18.245,5.922,35.822,13.73,52.448,23.297C478.057,265.567,460.48,273.375,442.235,279.297z"/>		<path d="M256,102.4c-84.831,0-153.6,68.769-153.6,153.6S171.169,409.6,256,409.6S409.6,340.831,409.6,256    C409.503,171.209,340.791,102.497,256,102.4z M256,392.533c-75.405,0-136.533-61.128-136.533-136.533S180.595,119.466,256,119.466    S392.533,180.595,392.533,256C392.447,331.369,331.369,392.447,256,392.533z"/>	</g></g>',
            },
        }];
        diagram = new Diagram({
            width: '1000px', height: '500px',
            nodes: nodes
        });
        diagram.appendTo('#bringToFront2');
        diagram.add(newconnectors);
        diagram.dataBind();
        diagram.add(newNode);
        diagram.dataBind();
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('Checking the before calling the bringToFront function in native node', (done: Function) => {
        expect((diagram.connectors[0] as any).parentId).toEqual('');
        expect((diagram.nodes[3] as any).parentId).toEqual('');
        expect((diagram.activeLayer as any).zIndexTable[0]).toBe('node1');
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[2]).toBe('node3');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[4]).toBe('node4');
        diagram.select([diagram.nodes[0]]);
        diagram.bringToFront();
        done();
    });
    it('Checking the after calling the bringToFront function in native node', (done: Function) => {
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[2]).toBe('node3');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[4]).toBe('node4');
        expect((diagram.activeLayer as any).zIndexTable[5]).toBe('node1');
        diagram.select([diagram.nodes[2]]);
        diagram.sendToBack();
        done();
    });
    it('Checking the after calling the sendToBack function in native node', (done: Function) => {
        expect((diagram.activeLayer as any).zIndexTable[0]).toBe('node3');
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[4]).toBe('node4');
        expect((diagram.activeLayer as any).zIndexTable[5]).toBe('node1');
        done();
    });
});

describe('Check the bringToFront and sendToBack functionality in HTML node rendering', () => {
    var diagram: Diagram;
    let ele: HTMLElement;
    beforeAll((): void => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            this.skip(); //Skips test (in Chai)
            return;
        }
        ele = createElement('div', { id: 'bringToFront3' });
        document.body.appendChild(ele);
        let newconnectors: ConnectorModel = {
            id: "connector1",
            style: {
                strokeColor: '#6BA5D7',
                fill: '#6BA5D7',
                strokeWidth: 2
            },
            targetDecorator: {
                style: {
                    fill: '#6BA5D7',
                    strokeColor: '#6BA5D7'
                }
            },
            sourcePoint: {
                x: 100,
                y: 100
            },
            targetPoint: {
                x: 200,
                y: 200
            }
        }

        let shape1: HtmlModel = { type: 'HTML', content: '<div style="background:red;height:100%;width:100%;"><input type="button" value="{{:value}}" /></div>' }
        let node1: NodeModel = {
            id: 'node1', width: 75, height: 50, offsetX: 300, offsetY: 300,
            shape: shape1
        };

        let htmlcontent: string = '<div id="list" style="height:100px; width:100%; overflow:hidden;"> </div>';
        let shape2: HtmlModel = { type: 'HTML', content: htmlcontent }
        let node2: NodeModel = {
            id: 'node2', width: 300, height: 50, offsetX: 200, offsetY: 200,
            shape: shape2
        };

        let shape3: HtmlModel = { type: 'HTML', content: '<div style="background:red;height:100%;width:100%;"><input type="button" value="{{:value}}" /></div>' }
        let node3: NodeModel = {
            id: 'node3', width: 300, height: 50, offsetX: 200, offsetY: 400,
            shape: shape3
        };
        let shape4: HtmlModel = { type: 'HTML', content: '<div style="background:red;height:100%;width:100%;"><input type="button" value="{{:value}}" /></div>' }
        let node4: NodeModel = {
            id: 'node4', offsetX: 200, offsetY: 400,
            shape: shape4
        };

        diagram = new Diagram({
            width: '1000px', height: '500px',
            nodes: [node1, node2, node3],
        });
        diagram.appendTo('#bringToFront3');
        diagram.add(newconnectors);
        diagram.dataBind();
        diagram.add(node4);
        diagram.dataBind();
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('Checking the before calling the bringToFront function in HTML Node', (done: Function) => {
        expect((diagram.connectors[0] as any).parentId).toEqual('');
        expect((diagram.nodes[3] as any).parentId).toEqual('');
        expect((diagram.activeLayer as any).zIndexTable[0]).toBe('node1');
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[2]).toBe('node3');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[4]).toBe('node4');
        diagram.select([diagram.nodes[0]]);
        diagram.bringToFront();
        done();
    });
    it('Checking the after calling the bringToFront function in HTML Node', (done: Function) => {
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[2]).toBe('node3');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[4]).toBe('node4');
        expect((diagram.activeLayer as any).zIndexTable[5]).toBe('node1');
        diagram.select([diagram.nodes[2]]);
        diagram.sendToBack();
        done();
    });
    it('Checking the after calling the sendToBack function in HTML Node', (done: Function) => {
        expect((diagram.activeLayer as any).zIndexTable[0]).toBe('node3');
        expect((diagram.activeLayer as any).zIndexTable[1]).toBe('node2');
        expect((diagram.activeLayer as any).zIndexTable[3]).toBe('connector1');
        expect((diagram.activeLayer as any).zIndexTable[4]).toBe('node4');
        expect((diagram.activeLayer as any).zIndexTable[5]).toBe('node1');
        done();
    });
});
describe('Diagram keyboard commands', () => {
    describe('Testing the Commands', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_command2' });
            document.body.appendChild(ele);
            let node: NodeModel = {
                id: 'node1', width: 100, height: 100, offsetX: 100,
                offsetY: 100,annotations:[{content:"node1"}]
            };
            let node2: NodeModel = {
                id: 'node2', width: 100, height: 100, offsetX: 250,
                offsetY: 100,annotations:[{content:"node2"}]
            };
            let node3: NodeModel = {
                id: 'node3', width: 100, height: 100, offsetX: 700,
                offsetY: 400, annotations: [{content:"node3"}]
            };
            let node4: NodeModel = {
                    id: 'node4', width: 100, height: 100, offsetX:850,
                    offsetY: 400, annotations: [{content:"node4"}]
            };
            let group: NodeModel = 
                { id: 'group1', children: ['node3', 'node4'], annotations: [{content:"group1"}] };
            let connector1: ConnectorModel = {
                id: 'connector1', sourcePoint: { x: 760, y: 100 }, targetPoint: { x: 850, y: 200 },annotations:[{content:"connector1"}]
            };
            let connector2: ConnectorModel = {
                id: 'connector2', sourcePoint: { x: 300, y: 300 }, targetPoint: { x: 400, y: 400 },type:"Orthogonal",annotations:[{content:"connector2"}]
            };
            diagram = new Diagram({
                width: '900px', height: '700px', nodes: [node, node2, node3, node4, group], connectors: [connector1, connector2],
            });
            diagram.appendTo('#diagram_command2');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking duplicate commands - clone', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'D', true);
            expect(diagram.nodes.length === 6 && diagram.nodes[5].offsetX === 110 &&
                diagram.nodes[5].offsetY === 110 && diagram.nodes[0].offsetX === 100).toBe(true);

            done();
        });
        it('Checking zoomIn commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.keyDownEvent(diagramCanvas, 'Plus', true);
            expect(diagram.scrollSettings.currentZoom>1).toBe(true);
            done();
        });
        it('Checking zoomOut commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.keyDownEvent(diagramCanvas, 'Minus', true);
            expect(diagram.scrollSettings.currentZoom== 1).toBe(true);
            done();
        });
        it('Checking rotate clockwise commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'R', true);
            expect(diagram.selectedItems.nodes[0].rotateAngle==90).toBe(true);
            done();
        });
        it('Checking rotate anti-clockwise commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'L', true);
            expect(diagram.selectedItems.nodes[0].rotateAngle==0).toBe(true);
            done();
        });
        it('Checking flip horizontal commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'H', true);
            expect(diagram.selectedItems.nodes[0].flip==FlipDirection.Horizontal).toBe(true);
            done();
        });
        it('Checking flip vertical commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'J', true);
            expect(diagram.selectedItems.nodes[0].flip==FlipDirection.Vertical).toBe(true);
            done();
        });
        it('Checking group commands', (done: Function) => {
            diagram.remove();
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0] , diagram.nodes[1]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'G', true);
            expect(diagram.selectedItems.nodes[0].children.length > 0).toBe(true);
            done();
        });
        it('Checking ungroup commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'U', true, true);
            diagram.select([diagram.nodes[0] , diagram.nodes[1]]);
            expect(diagram.selectedItems.nodes[0].children == undefined).toBe(true);
            done();
        });
        it('Checking move to next elements on tab commands', function (done) {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 100);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Tab');
            expect(diagram.selectedItems.nodes[0].zIndex==12).toBe(true);
            done();
        });
        it('Checking move to previous element commands', function (done) {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Tab',false,true);
            expect(diagram.selectedItems.nodes[0].zIndex==11).toBe(true);
            done();
        });
        it('Checking tab commands-connectors', function (done) {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.connectors[0]]);
            expect(diagram.selectedItems.connectors.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Tab');
            expect(diagram.selectedItems.connectors[0].zIndex == 8).toBe(true);
            done();
        });
        it('Checking shift + tab commands-connectors', function (done) {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            expect(diagram.selectedItems.connectors.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Tab', false, true);
            expect(diagram.selectedItems.connectors[0].zIndex == 7).toBe(true);
            done();
        });
        it('Checking text tool', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.clearSelection();
            mouseEvents.keyDownEvent(diagramCanvas, '2', true );
            mouseEvents.mouseMoveEvent(diagramCanvas, 400, 400);
            expect( diagramCanvas.style.cursor =="crosshair").toBe(true);
            done();
        });
        it('Checking Connector tool', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.clearSelection();
            mouseEvents.keyDownEvent(diagramCanvas, '3', true );
            mouseEvents.mouseMoveEvent(diagramCanvas, 400, 400);
            expect( diagramCanvas.style.cursor =="crosshair").toBe(true);
            done();
        });
        it('Checking freeform tool', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.clearSelection();
            mouseEvents.keyDownEvent(diagramCanvas, '5', true );
            mouseEvents.mouseMoveEvent(diagramCanvas, 400, 400);
            expect( diagramCanvas.style.cursor =="crosshair").toBe(true);
            done();
        });
        it('Checking polyline tool', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.clearSelection();
            mouseEvents.keyDownEvent(diagramCanvas, '6', true );
            mouseEvents.mouseMoveEvent(diagramCanvas, 400, 400);
            expect( diagramCanvas.style.cursor =="crosshair").toBe(true);
            done();
        });
        it('Checking commands - move elements 5 pixel commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.clearSelection();
            diagram.select([diagram.nodes[0]])
            expect(diagram.selectedItems.nodes.length > 0 || diagram.selectedItems.connectors.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Up',false, true);
            expect(diagram.selectedItems.nodes[0].offsetY == 95).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Down',false, true);
            expect(diagram.selectedItems.nodes[0].offsetY == 100).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Left',false, true);
            expect(diagram.selectedItems.nodes[0].offsetX == 95).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'Right',false, true);
            expect(diagram.selectedItems.nodes[0].offsetX == 100).toBe(true);
            done();
        });
        it('Checking bold commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'B', true);
            expect(diagram.selectedItems.nodes[0].annotations[0].style.bold==true).toBe(true);
            done();
        });
        it('Checking italic commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'I', true);
            expect(diagram.selectedItems.nodes[0].annotations[0].style.italic==true).toBe(true);
            done();
        });
        it('Checking underline commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'U', true);
            expect(diagram.selectedItems.nodes[0].annotations[0].style.textDecoration=="Underline").toBe(true);
            done();
        });
        it('Checking text align left', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'L', true, true);
            expect(diagram.selectedItems.nodes[0].annotations[0].horizontalAlignment=="Right").toBe(true);
            done();
        });
        it('Checking text align center', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'C', true, true);
            expect(diagram.selectedItems.nodes[0].annotations[0].horizontalAlignment=="Center").toBe(true);
            done();
        });
        it('Checking text align right', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'R', true, true);
            expect(diagram.selectedItems.nodes[0].annotations[0].horizontalAlignment=="Left").toBe(true);
            done();
        });
        it('Checking text align top', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'E', true, true);
            expect(diagram.selectedItems.nodes[0].annotations[0].verticalAlignment=="Top").toBe(true);
            done();
        });
        it('Checking text align vertical center', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'M', true, true);
            expect(diagram.selectedItems.nodes[0].annotations[0].verticalAlignment=="Center").toBe(true);
            done();
        });
        it('Checking text align bottom', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[0]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'V', true, true);
            expect(diagram.selectedItems.nodes[0].annotations[0].verticalAlignment=="Bottom").toBe(true);
            done();
        });
    });
});
describe(' keyboard commands', () => {
    describe('Testing the order Commands', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let zIndexBeforeCall: number;
        let zIndexAfterCall : number;
        let mouseEvents: MouseEvents = new MouseEvents();
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_command2' });
            document.body.appendChild(ele);
            let node: NodeModel = {
                id: 'node1', width: 100, height: 100, offsetX: 266,
                offsetY: 141,annotations:[{content:"node1"}]
            };
            let node2: NodeModel = {
                id: 'node2', width: 100, height: 100, offsetX: 240,
                offsetY: 113,annotations:[{content:"node2"}]
            };
            let node3: NodeModel = {
                id: 'node3', width: 100, height: 100, offsetX: 202,
                offsetY: 81, annotations: [{content:"node3"}]
            };
            diagram = new Diagram({
                width: '900px', height: '700px', nodes: [node, node2, node3],
            });
            diagram.appendTo('#diagram_command2');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking sendbackward commands', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 266, 141);
            zIndexBeforeCall = diagram.nodes[0].zIndex;
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'BracketLeft', true);
            zIndexAfterCall = diagram.nodes[1].zIndex;
            expect(zIndexBeforeCall === 0 && zIndexAfterCall === -1).toBe(true);
            done();
        });
        it('Checking send to back', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.select([diagram.nodes[2]]);
            zIndexBeforeCall = diagram.nodes[1].zIndex;
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'B', true, true);
            zIndexAfterCall = diagram.nodes[2].zIndex;
            expect(zIndexBeforeCall === -1 && zIndexAfterCall === -2).toBe(true);
            done();
        });
        it('Checking bring forward', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            zIndexBeforeCall = diagram.nodes[1].zIndex;
            diagram.select([diagram.nodes[2]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'BracketRight', true);
            zIndexAfterCall = diagram.nodes[2].zIndex;
            expect(zIndexBeforeCall !== zIndexAfterCall).toBe(true);
            done();
        });
        it('Checking bring to front', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.clearSelection();
            zIndexBeforeCall = diagram.nodes[0].zIndex;
            diagram.select([diagram.nodes[1]]);
            expect(diagram.selectedItems.nodes.length > 0).toBe(true);
            mouseEvents.keyDownEvent(diagramCanvas, 'F', true, true);
            zIndexAfterCall = diagram.nodes[1].zIndex;
            expect(zIndexBeforeCall ===1  && zIndexAfterCall===2).toBe(true);
            done();
        });
    });
});
describe('connection change events', () => {
    let diagram: Diagram;
    let ele: HTMLElement;
    let mouseEvents: MouseEvents = new MouseEvents();
    beforeAll((): void => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
        ele = createElement('div', { id: 'connChange' });
        document.body.appendChild(ele);
        let selArray: (NodeModel | ConnectorModel)[] = [];
        let node: NodeModel = { id: 'node1', width: 100, height: 100, offsetX: 500, offsetY: 300,
            ports: [{ id: 'n1p1', offset: { x: 1, y: 0.5 } }, { id: 'n1p2', offset: { x: 0.5, y: 1 } }]
         };
        let node1: NodeModel = { id: 'node2', width: 100, height: 100, offsetX: 100, offsetY: 300,
            ports: [{ id: 'n2p1', offset: { x: 1, y: 0.5 } }, { id: 'n2p2', offset: { x: 0.5, y: 1 } }]
         };
        let connector: ConnectorModel = { id: 'connector1', type: 'Orthogonal',
            sourceID: 'node1', targetID: 'node2', sourcePortID: 'n1p1', targetPortID: 'n2p2'
        };
        diagram = new Diagram({
            width: 800, height: 500, nodes: [node, node1],
            connectors: [connector],
            connectionChange: function (args) {
                if (args.state) {
                    args.cancel = true;
                }
            }
        });
        diagram.appendTo('#connChange');
        
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('Checking connector connect event ', (done: Function) => {
       
        var diagramCanvas = document.getElementById(diagram.element.id + 'content');
        diagram.select([diagram.connectors[0]]);
        mouseEvents.mouseDownEvent(diagramCanvas, 105, 360);
        mouseEvents.mouseMoveEvent(diagramCanvas, 110, 360);
        mouseEvents.mouseUpEvent(diagramCanvas, 150, 150);
        done();
    });
    it('Checking connector disconnect event ', (done: Function) => {
       
        var diagramCanvas = document.getElementById(diagram.element.id + 'content');
        diagram.select([diagram.connectors[0]]);
        mouseEvents.mouseDownEvent(diagramCanvas, 150, 360);
        mouseEvents.mouseMoveEvent(diagramCanvas, 150, 365);
        mouseEvents.mouseUpEvent(diagramCanvas, 150, 365);
        done();
    });
 });
 describe('BPMN sub process Shape render highlighter', () => {
    let diagram: Diagram;
    let ele: HTMLElement;
    let events: MouseEvents = new MouseEvents();
    beforeAll((): void => {
        const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
        ele = createElement('div', { id: 'subprocessTrans' });
        document.body.appendChild(ele);
        let shadow: ShadowModel = { distance: 10, opacity: 0.5 };
        let nodes: NodeModel[] = [
            {
                id: 'processesStart', width: 30, height: 30, shape: {
                    type: 'Bpmn', shape: 'Event',
                    event: { event: 'Start' }
                }, margin: { left: 40, top: 80 }
            },{
                id: 'nodea', maxHeight: 600, maxWidth: 600, minWidth: 300, minHeight: 300,
                constraints: NodeConstraints.Default | NodeConstraints.AllowDrop,
                offsetX: 200, offsetY: 200,
                shape: {
                    type: 'Bpmn', shape: 'Activity', activity: {
                        activity: 'SubProcess',
                        subProcess: {
                            collapsed: false, type: 'Transaction',
                            transaction: {
                            success: {
                                id: 'success',
                                event: 'Start',
                                trigger: 'None',
                            },
                            failure: {
                                id: 'failure',
                                event: 'ThrowingIntermediate',
                                trigger: 'Error',
                            },
                            cancel: {
                                id: 'cancel',
                                event: 'End',
                                trigger: 'Cancel',
                            },
                            }
                        } as BpmnSubProcessModel
                    },
                },
        }]
        let connectors: ConnectorModel[] = [
            {id:'connector1', sourcePoint:{x:400,y:200}, targetPoint:{x:600,y:200}},
            {id:'connector2', sourcePoint:{x:125,y:400}, targetPoint:{x:125,y:600}},
            {id:'connector3', sourcePoint:{x:275,y:400}, targetPoint:{x:275,y:600}},
        ]
        diagram = new Diagram({
            width: 1000, height: 500, nodes: nodes, connectors: connectors
        });
        diagram.appendTo('#subprocessTrans');
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('check highlighter for sub process when connetor dock', (done: Function) => {
       
        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        diagram.select([diagram.connectors[0]]);
        let decorator = document.getElementById('connectorSourceThumb');
        let bounds: any = decorator.getBoundingClientRect();
        events.mouseDownEvent(diagramCanvas, bounds.x, bounds.y, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x, bounds.y, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x - 50, bounds.y, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x - 100, bounds.y, false, false);
        events.mouseUpEvent(diagramCanvas, bounds.x - 100, bounds.y, false, false);
        done();
    });
    it('check highlighter for sub process when connetor dock', (done: Function) => {
       
        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        diagram.select([diagram.connectors[1]]);
        let decorator = document.getElementById('connectorSourceThumb');
        let bounds: any = decorator.getBoundingClientRect();
        events.mouseDownEvent(diagramCanvas, bounds.x, bounds.y, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x, bounds.y, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x, bounds.y - 50, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x, bounds.y - 100, false, false);
        events.mouseUpEvent(diagramCanvas, bounds.x, bounds.y - 100, false, false);
        done();
    });
    it('check highlighter for sub process when connetor dock', (done: Function) => {
       
        let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
        diagram.select([diagram.connectors[2]]);
        let decorator = document.getElementById('connectorSourceThumb');
        let bounds: any = decorator.getBoundingClientRect();
        events.mouseDownEvent(diagramCanvas, bounds.x, bounds.y, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x, bounds.y, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x, bounds.y - 50, false, false);
        events.mouseMoveEvent(diagramCanvas, bounds.x, bounds.y - 100, false, false);
        events.mouseUpEvent(diagramCanvas, bounds.x, bounds.y - 100, false, false);
        done();
    });
});
describe('Diagram Control', () => {
    let diagram: Diagram;
    let ele: HTMLElement;
    let mouseEvents: MouseEvents = new MouseEvents();
    beforeAll((): void => {
        ele = createElement('div', { id: 'diagram_command3' });
        document.body.appendChild(ele);
        let selArray: (NodeModel)[] = [];
        let nodes: NodeModel[] = [
            {
                id: 'subProcess1',
                width: 200,
                height: 100,
                offsetX: 150,
                offsetY: 100,
                constraints: NodeConstraints.Default | NodeConstraints.AllowDrop,
                shape: {
                    shape: 'Activity',
                    type: 'Bpmn',
                    activity: {
                        activity: 'SubProcess',
                        subProcess: {
                            collapsed: false,
                            processes: ['A', 'B'],
                        },
                    },
                },
            },
            {
                id: 'A',
                width: 50,
                height: 50,
                offsetX: 100,
                offsetY: 100,
                shape: { type: 'Bpmn', shape: 'Event' },
               
            },
            {
                id: 'B',
                width: 50,
                height: 50,
                offsetX: 200,
                offsetY: 100,
                shape: { type: 'Bpmn', shape: 'Event' },
               
            },
            {
                id: 'subProcess2',
                width: 200,
                height: 100,
                offsetX: 350,
                offsetY: 100,
                constraints: NodeConstraints.Default | NodeConstraints.AllowDrop,
                shape: {
                    shape: 'Activity',
                    type: 'Bpmn',
                    activity: {
                        activity: 'SubProcess',
                        subProcess: {
                            collapsed: false,
                            processes: ['C', 'D'],
                        },
                    },
                },
            },
            {
                id: 'C',
                width: 50,
                height: 50,
                offsetX: 300,
                offsetY: 100,
                shape: { type: 'Bpmn', shape: 'Event' },
               
            },
            {
                id: 'D',
                width: 50,
                height: 50,
                offsetX: 400,
                offsetY: 100,
                shape: { type: 'Bpmn', shape: 'Event' },
               
            }
        ];
        let connectors: ConnectorModel[] = [
            {
                id: 'connector1',
                type: 'Straight',
                sourceID: 'A',
                targetID: 'C',
            }
        ];
        diagram = new Diagram({
            width: '900px', height: '700px', nodes: nodes, connectors: connectors
        });
 
        diagram.appendTo('#diagram_command3');
        selArray.push(diagram.nodes[0]);
        diagram.select(selArray);
    });
    afterAll((): void => {
        diagram.destroy();
        ele.remove();
    });
    it('selection change in BPMNSubProcess', (done: Function) => {
        diagram.select([diagram.nodes[3]]);
        diagram.select([diagram.connectors[0]]);
        expect(diagram.nodes.length>0).toBe(true);
        done();
    });
    it('selection change in BPMNSubProcess', (done: Function) => {
        diagram.select([diagram.nodes[3]]);
        diagram.select([diagram.connectors[4]]);
        expect(diagram.nodes.length>0).toBe(true);
        done();
    });
});
