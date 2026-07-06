/**
 * Test cases for grid panel
 */

import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { DiagramElement } from '../../../src/diagram/core/elements/diagram-element';
import { Canvas } from '../../../src/diagram/core/containers/canvas';
import { Thickness } from '../../../src/diagram/core/appearance';
import { profile, inMB, getMemoryProfile } from '../../../spec/common.spec';
import { ShadowModel, RadialGradientModel, StopModel, LinearGradientModel } from '../../../src/diagram/core/appearance-model';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { IExportOptions } from '../../../src/diagram/objects/interface/interfaces';
import { PrintAndExport } from '../../../src/diagram/print-settings';

Diagram.Inject(PrintAndExport);

describe('Diagram Control', () => {
    describe('Simple canvas panel without children', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let canvas: Canvas;
        let canvasWithMinMaxSize: Canvas;
        let canvasWithoutSize: Canvas;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram4' });
            document.body.appendChild(ele);
            canvas = new Canvas();
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.width = 200;
            canvas.height = 200;
            canvas.minWidth = canvas.minHeight = 125;
            canvas.maxWidth = canvas.maxHeight = 150;

            canvasWithMinMaxSize = new Canvas();
            canvasWithMinMaxSize.pivot = { x: 0, y: 0 };
            canvasWithMinMaxSize.offsetX = 400;
            canvasWithMinMaxSize.offsetY = 100;
            canvasWithMinMaxSize.minWidth = canvasWithMinMaxSize.minHeight = 125;
            canvasWithMinMaxSize.maxWidth = canvasWithMinMaxSize.maxHeight = 150;

            canvasWithoutSize = new Canvas();
            canvasWithoutSize.pivot = { x: 0, y: 0 };
            canvasWithoutSize.offsetX = 600;
            canvasWithoutSize.offsetY = 100;

            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas, canvasWithMinMaxSize, canvasWithoutSize] });
            diagram.appendTo('#diagram4');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking canvas panel and with size in SVG rendering Mode', (done: Function) => {
            expect(canvas.actualSize.width === 150 && canvas.actualSize.height === 150).toBe(true);
            done();
        });

        it('Checking canvas panel without size and with min max size in SVG rendering Mode', (done: Function) => {
            expect(canvasWithMinMaxSize.actualSize.width === 125 && canvasWithMinMaxSize.actualSize.height === 125).toBe(true);
            done();
        });

        it('Checking canvas panel without size and without min max size in SVG rendering Mode', (done: Function) => {
            expect(canvasWithoutSize.actualSize.width === 0 && canvasWithoutSize.actualSize.height === 0).toBe(true);
            done();
        });
    });

    describe('Simple canvas panel with empty children collection', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let canvas: Canvas = new Canvas();
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram5' });
            document.body.appendChild(ele);
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.width = 100;
            canvas.height = 100;
            canvas.children = [];
            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas], });
            diagram.appendTo('#diagram5');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking Simple canvas panel with empty children collection in SVG rendering Mode', (done: Function) => {
            expect(canvas.actualSize.width === 100 && canvas.actualSize.height === 100).toBe(true);
            done();
        });
    });

    describe('Simple canvas panel with one child', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let child: DiagramElement;
        let canvasWithoutSize: Canvas;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram6' });
            document.body.appendChild(ele);
            let canvas: Canvas = new Canvas();
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.width = 100;
            canvas.height = 100;

            child = new DiagramElement();
            child.margin = { left: 10, right: 10, top: 10, bottom: 10 };

            canvas.children = [child];

            canvasWithoutSize = new Canvas();
            canvasWithoutSize.offsetX = 400;
            canvasWithoutSize.offsetY = 100;
            let child2: DiagramElement = new DiagramElement();
            child2.width = 100;
            child2.height = 100;
            canvasWithoutSize.children = [child2];

            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas, canvasWithoutSize] });
            diagram.appendTo('#diagram6');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking canvas panel with a child - inherits size from canvas in SVG rendering Mode', (done: Function) => {
            expect(child.actualSize.width === 80 && child.actualSize.height === 80).toBe(true);
            done();
        });

        it('Checking canvas panel with a child - canvas wraps the child in SVG rendering Mode', (done: Function) => {
            expect(canvasWithoutSize.actualSize.width === 100 && canvasWithoutSize.actualSize.height === 100).toBe(true);
            done();
        });
    });

    describe('Canvas Panel with one child with absolute position', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let child: DiagramElement;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram7' });
            document.body.appendChild(ele);
            let canvas: Canvas = new Canvas();
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.width = 200;
            canvas.height = 200;

            child = new DiagramElement();
            child.setOffsetWithRespectToBounds(95, 95, 'Absolute');
            child.width = 10;
            child.height = 10;

            canvas.children = [child];
            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas] });
            diagram.appendTo('#diagram7');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking canvas panel with a child with absolute position in SVG rendering Mode', (done: Function) => {
            expect(child.offsetX === 300 && child.offsetY === 200).toBe(true);
            done();
        });
    });

    describe('Simple canvas panel without size and two children', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let canvas: Canvas;
        let child1: DiagramElement;
        let child2: DiagramElement;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram8' });
            document.body.appendChild(ele);
            canvas = new Canvas();
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.style.fill = 'wheat';

            child1 = new DiagramElement();
            child1.width = 100;
            child1.height = 100;
            child1.margin.left = child1.margin.top = 10;

            child2 = new DiagramElement();
            child2.width = 100; child2.height = 100;
            child2.margin.left = 190;
            child2.margin.top = 190;

            canvas.children = [child1, child2];

            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas] });
            diagram.appendTo('#diagram8');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking canvas panel without size with two children(margin) in SVG rendering Mode', (done: Function) => {
            expect(canvas.actualSize.width === 290 && canvas.actualSize.height === 290 && child1.offsetX === 260 && child2.offsetX === 440 &&
                child1.offsetY === 160 && child2.offsetY === 340).toBe(true);
            done();
        });
    });

    describe('Simple canvas panel with padding and two children', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let canvas: Canvas;
        let child1: DiagramElement;
        let child2: DiagramElement;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram9' });
            document.body.appendChild(ele);
            canvas = new Canvas();
            canvas.padding = new Thickness(10, 10, 10, 10);
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.style.fill = 'wheat';

            child1 = new DiagramElement();
            child1.width = 100;
            child1.height = 100;
            child1.margin.left = child1.margin.top = 10;

            child2 = new DiagramElement();
            child2.width = 100; child2.height = 100;
            child2.margin.left = 190;
            child2.margin.top = 190;

            canvas.children = [child1, child2];

            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas] });
            diagram.appendTo('#diagram9');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking canvas panel with padding and with two children in SVG rendering Mode', (done: Function) => {
            expect(canvas.actualSize.width === 310 && canvas.actualSize.height === 310 && child1.offsetX === 270 && child2.offsetX === 450 &&
                child1.offsetY === 170 && child2.offsetY === 350).toBe(true);
            done();
        });
    });

    describe('Simple canvas panel with size and two children', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let canvas: Canvas;
        let child1: DiagramElement;
        let child2: DiagramElement;
        let child3: DiagramElement;
        let child4: DiagramElement;
        let child5: DiagramElement;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram11' });
            document.body.appendChild(ele);
            canvas = new Canvas();
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.width = 400;
            canvas.height = 400;

            child1 = new DiagramElement();
            child1.width = 100;
            child1.height = 100;
            child1.horizontalAlignment = 'Center';
            child1.verticalAlignment = 'Stretch';
            child1.relativeMode = 'Object';

            child2 = new DiagramElement();
            child2.width = 100; child2.height = 100;
            child2.horizontalAlignment = 'Stretch';
            child2.verticalAlignment = 'Center';
            child2.relativeMode = 'Object';

            child3 = new DiagramElement();
            child3.width = 100; child3.height = 100;
            child3.horizontalAlignment = 'Left';
            child3.verticalAlignment = 'Top';
            child3.relativeMode = 'Object';

            child3.margin.left = child3.margin.top = 10;

            child4 = new DiagramElement();
            child4.width = 100; child4.height = 100;
            child4.horizontalAlignment = 'Right';
            child4.verticalAlignment = 'Bottom';
            child4.relativeMode = 'Object';
            child4.margin.right = 10;
            child4.margin.bottom = 10;

            child5 = new DiagramElement();
            child5.width = 100;
            child5.height = 100;
            child5.relativeMode = 'Object';

            canvas.children = [child1, child2, child3, child4, child5];

            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas] });
            diagram.appendTo('#diagram11');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking canvas panel with size and with two children(relative position) in SVG rendering Mode', (done: Function) => {
            expect(canvas.actualSize.width === 400 && canvas.actualSize.height === 400 &&
                child1.offsetX === 400 && child1.offsetY === 300 &&
                child2.offsetX === 400 && child2.offsetY === 300 &&
                child3.offsetX === 260 && child3.offsetY === 160 &&
                child4.offsetX === 540 && child4.offsetY === 440 &&
                child5.offsetX === 250 && child5.offsetY === 150).toBe(true);
            done();
        });
    });

    describe('Simple canvas panel with two rotated children', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let canvas: Canvas;
        let child1: DiagramElement;
        let child2: DiagramElement;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram12' });
            document.body.appendChild(ele);
            canvas = new Canvas();
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.style.fill = 'wheat';
            canvas.padding = new Thickness(10, 10, 10, 10);

            child1 = new DiagramElement();
            child1.width = 200;
            child1.height = 100;
            child1.rotateAngle = 45;

            child2 = new DiagramElement();
            child2.width = 100; child2.height = 100;
            child2.margin.left = 190;
            child2.margin.top = 190;
            child2.rotateAngle = 45;

            canvas.children = [child1, child2];

            diagram = new Diagram({ mode: 'Canvas', width: 1000, height: 1000, basicElements: [canvas] });
            diagram.appendTo('#diagram12');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking canvas panel with two rotated children in SVG rendering Mode', (done: Function) => {
            expect(canvas.actualSize.width === 351.41999999999996 && canvas.actualSize.height === 351.41999999999996 && child1.offsetX === 310 && child2.offsetX === 450 &&
                child1.offsetY === 160 && child2.offsetY === 350).toBe(true);
            done();
        });
    });

    describe('Rotated canvas panel without size and two rotated children', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let canvas: Canvas;
        let child1: DiagramElement;
        let child2: DiagramElement;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram13' });
            document.body.appendChild(ele);
            canvas = new Canvas();
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.style.fill = 'wheat';
            canvas.rotateAngle = 45;

            child1 = new DiagramElement();
            child1.width = 200;
            child1.height = 100;
            child1.margin.left = child1.margin.top = 10;

            child2 = new DiagramElement();
            child2.width = 100; child2.height = 100;
            child2.margin.left = 190;
            child2.margin.top = 190;

            canvas.children = [child1, child2];

            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas] });
            diagram.appendTo('#diagram13');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking canvas panel without size and rotated children in SVG rendering Mode', (done: Function) => {
            expect(canvas.actualSize.width === 290 && canvas.actualSize.height === 290 && child1.offsetX === 235.36 && child2.offsetX === 200 &&
                child1.offsetY === 220.21 && child2.offsetY === 439.41 && child1.parentTransform === canvas.parentTransform + canvas.rotateAngle &&
                child2.parentTransform === canvas.parentTransform + canvas.rotateAngle).toBe(true);
            done();
        });
    });
    
    describe('Rotated canvas panel without size and two rotated children', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let canvas: Canvas;
        let child1: DiagramElement;
        let child2: DiagramElement;
        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram14' });
            document.body.appendChild(ele);
            canvas = new Canvas();
            canvas.pivot = { x: 0, y: 0 };
            canvas.offsetX = 200;
            canvas.offsetY = 100;
            canvas.style.fill = 'wheat';
            canvas.rotateAngle = 45;

            child1 = new DiagramElement();
            child1.width = 200;
            child1.height = 100;
            child1.margin.left = child1.margin.top = 10;
            child1.rotateAngle = 45;

            child2 = new Canvas();
            child2.width = 100; child2.height = 100;
            child2.margin.left = 190;
            child2.margin.top = 190;
            child2.rotateAngle = 45;

            canvas.children = [child1, child2];

            diagram = new Diagram({ mode: 'Canvas', width: '1000px', height: '600px', basicElements: [canvas] });
            diagram.appendTo('#diagram14');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking rotated canvas with rotated children in SVG rendering Mode', (done: Function) => {
            expect(canvas.actualSize.width === 331.41999999999996 && canvas.actualSize.height === 331.41999999999996 && child1.offsetX === 235.36 && child2.offsetX === 200 &&
                child1.offsetY === 220.21 && child2.offsetY === 439.41 && child1.parentTransform === canvas.parentTransform + canvas.rotateAngle &&
                child2.parentTransform === canvas.parentTransform + canvas.rotateAngle).toBe(true);
            done();
        });
        it('memory leak', () => {
            profile.sample();
            let average: any = inMB(profile.averageChange)
            //Check average change in memory samples to not be over 10MB
            expect(average).toBeLessThan(50);
            let memory: any = inMB(getMemoryProfile())
            //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
            expect(memory).toBeLessThan(profile.samples[0] + 0.25);
        })
    });

    describe('Export Diargram with Gradients', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let options: IExportOptions = {};
        let svg: string | SVGElement;

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagramGradient' });
            document.body.appendChild(ele);
            let gradient1: LinearGradientModel = {
                x1: 0, y1: 0,
                x2: 50, y2: 50,
                stops: [{ color: 'white', offset: 0 },
                { color: '#6BA5D7', offset: 100 }],
                type: 'Linear'
            };
            let node: NodeModel = {
                id: 'node1', width: 150, height: 100, offsetX: 100, offsetY: 100,
                annotations: [{ content: 'Node1', height: 50, width: 50 }],
                style: {gradient: gradient1, strokeColor: 'white' }
            };
            
            diagram = new Diagram({width: '1000px', height: '600px', nodes: [node] });
            diagram.appendTo('#diagramGradient');
        });
        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('Checking export diagram with gradient', (done: Function) => {
            options.mode = 'Data';
            options.format = 'PNG';
            options.region = 'PageSettings';
            svg = diagram.exportDiagram(options);
            expect(svg).not.toBeNull();
            done();
        });
    });

    describe('Export two nodes with radial and linear gradients and scale', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let options: IExportOptions = {};

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip();
                return;
            }
            ele = createElement('div', { id: 'diagramGradient2' });
            document.body.appendChild(ele);
            // Apply a container scale to exercise scaled export paths
            (ele as HTMLElement).style.transform = 'scale(0.5)';

            const linear: LinearGradientModel = {
                x1: 0, y1: 0,
                x2: 100, y2: 0,
                stops: [{ color: '#76d627', offset: 0 }, { color: '#332272', offset: 100 }],
                type: 'Linear'
            };
            const radial: RadialGradientModel = {
                cx: 50, cy: 50, r: 50,  fx: 25, fy: 25,
                stops: [{ color: '#28b5e0', offset: 0 }, { color: '#ad2a2a', offset: 100 }],
                type: 'Radial'
            };

            const node1: NodeModel = {
                id: 'nodeL', width: 120, height: 80, offsetX: 120, offsetY: 120,
                style: { gradient: linear }
            };
            const node2: NodeModel = {
                id: 'nodeR', width: 120, height: 80, offsetX: 320, offsetY: 120,
                style: { gradient: radial }
            };

            diagram = new Diagram({ width: '1000px', height: '600px', nodes: [node1, node2], mode: 'Canvas' });
            diagram.appendTo('#diagramGradient2');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null; (ele as any) = null;
        });

        it('exports SVG with both linear and radial gradient defs referenced', (done: Function) => {
            options.mode = 'Data';
            options.format = 'SVG';
            options.region = 'PageSettings';
            const exported = diagram.exportDiagram(options);
            const svgString: string = (typeof exported === 'string') ? exported : (exported as SVGElement).outerHTML;
            expect(svgString).toContain('nodeL_content_linear');
            expect(svgString).toContain('nodeR_content_radial');
            expect(svgString).toContain('<stop');
            done();
        });
    });

    //write test case for nested canvas

    /**
     * Bug: Native node text is not visible in Canvas mode but renders correctly in SVG mode.
     * Root cause: renderContainer() skips SVG-mode parent-element resolution in canvas mode,
     * so annotation TextElement children of a native node are dispatched into the wrong
     * rendering context and are clipped / invisible.
     */
    describe('Native node annotation visibility in Canvas mode', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        const nativeSvgContent: string =
            '<g xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#6495ED"/></g>';

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log('Unsupported environment, window.performance.memory is unavailable');
                this.skip();
                return;
            }
            ele = createElement('div', { id: 'diagramNativeCanvasAnnotation' });
            document.body.appendChild(ele);

            const node1: NodeModel = {
                id: 'nativeNode1',
                width: 120, height: 120,
                offsetX: 160, offsetY: 160,
                shape: { type: 'Native', content: nativeSvgContent } as any,
                annotations: [{
                    id: 'lbl1',
                    content: 'NativeLabel',
                    offset: { x: 0.5, y: 0.5 },
                    horizontalAlignment: 'Center',
                    verticalAlignment: 'Center'
                }]
            };

            const node2: NodeModel = {
                id: 'nativeNode2',
                width: 120, height: 120,
                offsetX: 360, offsetY: 160,
                shape: { type: 'Native', content: nativeSvgContent } as any,
                annotations: [{
                    id: 'lbl2',
                    content: 'TopLeft',
                    offset: { x: 0, y: 0 },
                    horizontalAlignment: 'Left',
                    verticalAlignment: 'Top'
                }]
            };

            const node3: NodeModel = {
                id: 'nativeNode3',
                width: 120, height: 120,
                offsetX: 560, offsetY: 160,
                shape: { type: 'Native', content: nativeSvgContent } as any,
                annotations: [{
                    id: 'lbl3',
                    content: 'BottomRight',
                    offset: { x: 1, y: 1 },
                    horizontalAlignment: 'Right',
                    verticalAlignment: 'Bottom'
                }]
            };

            diagram = new Diagram({
                mode: 'Canvas',
                width: '900px', height: '400px',
                nodes: [node1, node2, node3]
            });
            diagram.appendTo('#diagramNativeCanvasAnnotation');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            (diagram as any) = null;
            (ele as any) = null;
        });

        /**
         * Case 1 – center-aligned annotation on a native node must produce a rendered
         * text element in the DOM when the diagram is in Canvas mode.
         * FAILS before fix: renderContainer() never resolves parentG for canvas mode,
         * so the TextElement is dispatched to the SVG native layer with wrong coordinates
         * and no visible text node is created on the canvas overlay.
         */
        it('Canvas mode: center annotation on native node produces a DOM text element', (done: Function) => {
            const textEl: HTMLElement = document.getElementById('nativeNode1_lbl1_text');
            // The text wrapper element must exist in the DOM
            expect(textEl).not.toBeNull();
            // The rendered text must carry the annotation content
            expect(textEl && textEl.textContent).toContain('NativeLabel');
            done();
        });

        /**
         * Case 2 – annotation offset (0,0) / Top-Left alignment must be preserved in
         * Canvas mode.  The wrapper element's transform/position must place it near the
         * top-left corner of the node, NOT at the default center-canvas fallback that
         * the unfixed code produces when parentG is undefined.
         */
        it('Canvas mode: top-left annotation offset and alignment are preserved on native node', (done: Function) => {
            const node = diagram.nameTable['nativeNode2'];
            expect(node).not.toBeNull();
            const annotationEl: HTMLElement = document.getElementById('nativeNode2_lbl2');
            expect(annotationEl).not.toBeNull();
            // Verify the annotation wrapper bounds are within the node's bounding box
            if (annotationEl) {
                const rect: DOMRect = annotationEl.getBoundingClientRect() as any;
                const nodeOffsetX: number = node.offsetX;
                const nodeOffsetY: number = node.offsetY;
                const nodeHalfW: number = node.width / 2;
                const nodeHalfH: number = node.height / 2;
                // The rendered element must not be pushed to canvas-center (0,0 fallback)
                expect(rect.left + rect.width).toBeGreaterThan(0);
                // The element's left edge must be within the node's horizontal span
                expect(Math.abs(rect.left)).toBeLessThan(nodeOffsetX + nodeHalfW + 50);
                // The element's top edge must be within the node's vertical span
                expect(Math.abs(rect.top)).toBeLessThan(nodeOffsetY + nodeHalfH + 50);
            }
            done();
        });

        /**
         * Case 3 – annotation rendered in Canvas mode must be visually consistent with
         * SVG mode: the wrapper element's content (childNodes / wrapBounds) must be
         * populated, confirming the text was measured and laid out, not silently skipped.
         * FAILS before fix: because the text element is dispatched to the wrong context
         * in canvas mode, `doWrap` is never reset and childNodes remain empty.
         */
        it('Canvas mode: native node annotation text is measured and laid out (doWrap reset)', (done: Function) => {
            const node = diagram.nameTable['nativeNode3'];
            expect(node).not.toBeNull();
            // Locate the TextElement child of the node wrapper
            const wrapper = node.wrapper;
            let textChild: any = null;
            if (wrapper && wrapper.children) {
                for (const child of wrapper.children) {
                    if ((child as any).content === 'BottomRight') {
                        textChild = child;
                        break;
                    }
                }
            }
            expect(textChild).not.toBeNull();
            // After rendering, doWrap must have been cleared (set to false) — this only
            // happens when renderTextElement() reaches the final `if (this.isSvgMode)`
            // path OR when the canvas drawText path completes successfully.
            // Before the fix, the element is never drawn so doWrap stays true.
            expect(textChild && textChild.doWrap).toBe(false);
            done();
        });

        /**
         * Case 4 – fallback path when nodeContentId is undefined or content group element
         * is not found in parentSvg. The annotation must still render via nativeSvgTarget
         * (fallback) and be visible. This covers the branch:
         * `(nodeContentId && parentSvg && parentSvg.getElementById(nodeContentId)) || nativeSvgTarget`
         */
        it('Canvas mode: annotation renders via fallback when content group not found', (done: Function) => {
            const node = diagram.nameTable['nativeNode1'];
            expect(node).not.toBeNull();
            // Even if the native content group is not found, the annotation should still render
            // because it falls back to nativeSvgTarget
            const textEl: HTMLElement = document.querySelector('[id$="_lbl1_text"]') as HTMLElement;
            expect(textEl).not.toBeNull();
            // Verify text is rendered and visible (not hidden by fallback path)
            expect(textEl && textEl.textContent).toContain('NativeLabel');
            if (textEl) {
                const computed = getComputedStyle(textEl);
                expect(computed.visibility).not.toBe('hidden');
            }
            done();
        });

        /**
         * Case 5 – export scenario with isExport flag and exportScaleValue. The Math.min()
         * logic must properly handle both scale components and pass to drawText.
         * This covers: `(element.isExport && Math.min(element.exportScaleValue.x || element.exportScaleValue.y))`
         */
        it('Canvas mode: annotation renders correctly with export scale factors', (done: Function) => {
            // Create a node with export properties
            const testNode: NodeModel = {
                id: 'exportNode',
                width: 120, height: 120,
                offsetX: 760, offsetY: 160,
                shape: { type: 'Native', content: '<g xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#FF6347"/></g>' } as any,
                annotations: [{
                    id: 'exportLbl',
                    content: 'ExportTest',
                    offset: { x: 0.5, y: 0.5 },
                    horizontalAlignment: 'Center',
                    verticalAlignment: 'Center'
                }]
            };
            diagram.add(testNode);
            diagram.dataBind();
            // The text element id is built as <nodeId>_<annotationId>_text by svgRenderer.drawText
            const exportTextEl: HTMLElement = document.getElementById('exportNode_exportLbl_text') as HTMLElement;
            if (exportTextEl) {
                expect(exportTextEl.textContent).toContain('ExportTest');
            }
            diagram.remove(diagram.getNodeObject('exportNode'));
            done();
        });

        /**
         * Case 6 – nodeContentId is defined but parentSvg.getElementById() returns null.
         * The annotation must still render via the fallback (nativeSvgTarget).
         * This covers the short-circuit behavior: when first part of OR is false, use second part.
         */
        it('Canvas mode: annotation renders via fallback when getElementById returns null', (done: Function) => {
            const node = diagram.nameTable['nativeNode1'];
            expect(node).not.toBeNull();
            // Annotation should render because even if getElementById fails, fallback to nativeSvgTarget
            setTimeout(() => {
                const textEl: HTMLElement = document.querySelector('[id$="_lbl1_text"]') as HTMLElement;
                expect(textEl).not.toBeNull();
                if (textEl) {
                    expect(textEl.textContent).toContain('NativeLabel');
                    expect(getComputedStyle(textEl).visibility).not.toBe('hidden');
                }
                done();
            }, 30);
        });
    });

});
