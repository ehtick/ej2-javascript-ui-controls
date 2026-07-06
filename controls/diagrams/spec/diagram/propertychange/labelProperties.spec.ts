import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { AnnotationConstraints, NodeConstraints } from '../../../src/diagram/enum/enum';
import { AnnotationModel } from '../../../src/diagram/objects/annotation-model';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { NodeProperties } from '../../../src/diagram/load-utility/nodeProperties';
import { PortProperties } from '../../../src/diagram/load-utility/portProperties';
import { LabelProperties } from '../../../src/diagram/load-utility/labelProperties';

describe('LabelProperties', () => {

    describe('setLabelProperties - borderWidth and textDecoration', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let labelProperties: LabelProperties;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_labelprops_coverage' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px', height: '500px'
            });
            diagram.appendTo('#diagram_labelprops_coverage');
            labelProperties = new LabelProperties(null);
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
            labelProperties = null;
        });

        it('should apply borderWidth style when label.borderWidth is provided', (done: Function) => {
            const oldLabels: AnnotationModel[] = [
                {
                    name: 'Label_1',
                    text: 'Test Label',
                    borderWidth: 2,
                    borderColor: 'red'
                } as any
            ];
            const node: NodeModel = {};
            const result = labelProperties.setLabelProperties(oldLabels, node);
            expect(result.length).toBe(1);
            expect(result[0].style.strokeWidth).toBe(2);
            done();
        });

        it('should convert textDecoration "linethrough" to "LineThrough"', (done: Function) => {
            const oldLabels: AnnotationModel[] = [
                {
                    name: 'Label_3',
                    text: 'Test Label',
                    textDecoration: 'linethrough'
                } as any
            ];
            const node: NodeModel = {};
            const result = labelProperties.setLabelProperties(oldLabels, node);
            expect(result.length).toBe(1);
            expect(result[0].style.textDecoration).toBe('LineThrough');
            done();
        });
    });

    describe('setLabelConstraints - Individual Constraint Flags', () => {
        let labelProperties: LabelProperties;

        beforeAll((): void => {
            labelProperties = new LabelProperties(null);
        });

        afterAll((): void => {
            labelProperties = null;
        });

        it('should apply Select constraint when provided', (done: Function) => {
            const constraints: number = AnnotationConstraints.Select;
            const result = labelProperties.setLabelConstraints(constraints);
            expect(result & AnnotationConstraints.Select).toBe(AnnotationConstraints.Select);
            done();
        });

        it('should apply Drag constraint when provided', (done: Function) => {
            const constraints: number = AnnotationConstraints.Drag;
            const result = labelProperties.setLabelConstraints(constraints);
            expect(result & AnnotationConstraints.Drag).toBe(AnnotationConstraints.Drag);
            done();
        });

        it('should apply Resize constraint when provided', (done: Function) => {
            const constraints: number = AnnotationConstraints.Resize;
            const result = labelProperties.setLabelConstraints(constraints);
            expect(result & AnnotationConstraints.Resize).toBe(AnnotationConstraints.Resize);
            done();
        });

        it('should apply Rotate constraint when provided', (done: Function) => {
            const constraints: number = AnnotationConstraints.Rotate;
            const result = labelProperties.setLabelConstraints(constraints);
            expect(result & AnnotationConstraints.Rotate).toBe(AnnotationConstraints.Rotate);
            done();
        });

    });

    describe('getModuleName', () => {
        let labelProperties: LabelProperties;

        beforeAll((): void => {
            labelProperties = new LabelProperties(null);
        });

        afterAll((): void => {
            labelProperties = null;
        });

        it('should return correct module name from getModuleName', (done: Function) => {
            // Access protected method through type casting - this covers the getModuleName() function
            const moduleName: string = (labelProperties as any).getModuleName();
            expect(moduleName).toBe('LabelProperties');
            done();
        });
    });
});

describe('NodeProperties', () => {

    describe('convertToNode', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let nodeProperties: NodeProperties;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_nodeprops_convert' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px', height: '500px'
            });
            diagram.appendTo('#diagram_nodeprops_convert');
            nodeProperties = new NodeProperties(new LabelProperties(null), new PortProperties(null));
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
            nodeProperties = null;
        });

        it('should assign tooltip relativeMode when tooltip is provided', (done: Function) => {
            const ej1Node: any = {
                name: 'node_5',
                tooltip: {
                    relativeMode: true
                }
            };
            const result = nodeProperties.convertToNode(ej1Node);
            expect(result.tooltip).toBeDefined();
            done();
        });
    });

    describe('getChildren - Recursive Children Conversion', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let nodeProperties: NodeProperties;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_nodeprops_children' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px', height: '500px'
            });
            diagram.appendTo('#diagram_nodeprops_children');
            nodeProperties = new NodeProperties(new LabelProperties(null), new PortProperties(null));
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
            nodeProperties = null;
        });

        it('should process children array and return converted children nodes', (done: Function) => {
            // Arrange: Parent node and child nodes
            const parentNode: any = {};
            const childNode1: any = {
                name: 'child_1',
                width: 50,
                height: 50
            };
            const childNode2: any = {
                name: 'child_2',
                width: 60,
                height: 60
            };
            const parentWithChildren: any = {
                name: 'parent',
                children: [childNode1, childNode2]
            };
            const result = nodeProperties.getChildren(parentNode, parentWithChildren);
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            done();
        });

        it('should recursively process children with nested children', (done: Function) => {
            const parentNode: any = {};
            const grandchildNode: any = {
                name: 'grandchild',
                width: 30,
                height: 30
            };
            const childWithGrandchild: any = {
                name: 'child',
                width: 50,
                height: 50,
                children: [grandchildNode]
            };
            const parentWithNestedChildren: any = {
                name: 'parent',
                children: [childWithGrandchild]
            };

            const result = nodeProperties.getChildren(parentNode, parentWithNestedChildren);
            expect(result).toBeDefined();
            expect(result.length).toBe(1);
            done();
        });
    });

    describe('getImageContentAlignment - Image Alignment Conversions', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let nodeProperties: NodeProperties;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_nodeprops_imagealign' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px', height: '500px'
            });
            diagram.appendTo('#diagram_nodeprops_imagealign');
            nodeProperties = new NodeProperties(new LabelProperties(null), new PortProperties(null));
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
            nodeProperties = null;
        });
        it('should return None for none alignment option', (done: Function) => {
            const result = nodeProperties.getImageContentAlignment('none');
            expect(result).toBe('None');
            done();
        });
    });

    describe('setNodeConstraints - Constraint Flags Processing', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let nodeProperties: NodeProperties;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_nodeprops_constraints' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px', height: '500px'
            });
            diagram.appendTo('#diagram_nodeprops_constraints');
            nodeProperties = new NodeProperties(new LabelProperties(null), new PortProperties(null));
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
            nodeProperties = null;
        });

        it('should convert AspectRatio constraint', (done: Function) => {
            const ej1Constraints = NodeConstraints.AspectRatio;
            const result = nodeProperties.setNodeConstraints(ej1Constraints);
            expect(result & NodeConstraints.AspectRatio).toBe(NodeConstraints.AspectRatio);
            done();
        });

        it('should convert InheritTooltip constraint', (done: Function) => {
            const ej1Constraints = NodeConstraints.InheritTooltip;
            const result = nodeProperties.setNodeConstraints(ej1Constraints);
            expect(result & NodeConstraints.InheritTooltip).toBe(NodeConstraints.InheritTooltip);
            done();
        });
    });

    describe('getModuleName', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let nodeProperties: NodeProperties;
        let portProperties: PortProperties;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_nodeprops_modulename' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px', height: '500px'
            });
            diagram.appendTo('#diagram_nodeprops_modulename');
            nodeProperties = new NodeProperties(new LabelProperties(null), new PortProperties(null));
            portProperties = new PortProperties(null);
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
            nodeProperties = null;
            portProperties = null;
        });

        it('should return NodeProperties as module name', (done: Function) => {
            const moduleName = (nodeProperties as any).getModuleName();
            expect(moduleName).toBe('NodeProperties');
            done();
        });

        it('should return PortProperties as module name', (done: Function) => {
            const moduleName = (portProperties as any).getModuleName();
            expect(moduleName).toBe('PortProperties');
            done();
        });
    });

});
