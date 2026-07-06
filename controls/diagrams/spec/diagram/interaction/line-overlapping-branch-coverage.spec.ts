import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { Connector } from '../../../src/diagram/objects/connector';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { ConnectorModel } from '../../../src/diagram/objects/connector-model';
import { AvoidLineOverlapping } from '../../../src/diagram/interaction/line-overlapping';
import { OrthogonalSegmentModel } from '../../../src/diagram/objects/connector-model';
import { DiagramConstraints } from '../../../src/diagram/enum/enum';
import { LineRouting } from '../../../src/diagram/interaction/line-routing';
Diagram.Inject(AvoidLineOverlapping, LineRouting);

describe('Line Overlapping - Branch Coverage', () => {

    describe('Line Overlapping - Initial Connector Overlaps-layoutStyleDemo', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        beforeAll(() => {
            ele = createElement('div', { id: 'layoutStyleDemo' });
            document.body.appendChild(ele);

            let nodes: NodeModel[] = [
                {
                    id: 'top1', offsetX: 50, offsetY: 245, width: 30, height: 100,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },
                {
                    id: 'center1', offsetX: 50, offsetY: 380, width: 30, height: 30,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },
                {
                    id: 'bottom1', offsetX: 50, offsetY: 550, width: 30, height: 30,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },
                {
                    id: 'top2', offsetX: 220, offsetY: 40, width: 110, height: 60,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },

                {
                    id: 'bottom2', offsetX: 220, offsetY: 550, width: 110, height: 60,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },

                {
                    id: 'center31', offsetX: 380, offsetY: 300, width: 30, height: 30,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },
                {
                    id: 'center32', offsetX: 380, offsetY: 400, width: 30, height: 30,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },
                {
                    id: 'bottom3', offsetX: 380, offsetY: 550, width: 30, height: 30,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },

                {
                    id: 'bottom4', offsetX: 550, offsetY: 550, width: 30, height: 30,
                    style: { fill: '#41f5e7', strokeWidth: 2, strokeColor: '#02aab0' },
                },
            ];
            let connectors: ConnectorModel[] = [
                { id: '1top-3bottom1', sourceID: 'top1', targetID: 'bottom3', type: 'Orthogonal' },
                { id: '1top-3bottom2', sourceID: 'top1', targetID: 'bottom3', type: 'Orthogonal' },
                { id: '1top-3bottom3', sourceID: 'top1', targetID: 'bottom3', type: 'Orthogonal' },
                { id: '1top-3bottom4', sourceID: 'top1', targetID: 'bottom3', type: 'Orthogonal' },
                { id: '1top-3bottom5', sourceID: 'top1', targetID: 'bottom3', type: 'Orthogonal' },
                { id: '1top-4bottom1', sourceID: 'top1', targetID: 'bottom4', type: 'Orthogonal' },
                { id: '1top-4bottom2', sourceID: 'top1', targetID: 'bottom4', type: 'Orthogonal' },
                { id: '1top-4bottom3', sourceID: 'top1', targetID: 'bottom4', type: 'Orthogonal' },
                { id: '1top-4bottom4', sourceID: 'top1', targetID: 'bottom4', type: 'Orthogonal' },
                { id: '1top-4bottom5', sourceID: 'top1', targetID: 'bottom4', type: 'Orthogonal' },
            ];
            diagram = new Diagram({
                width: '1400px', height: '800px', nodes: nodes, connectors: connectors,
                constraints: DiagramConstraints.Default | DiagramConstraints.LineRouting | DiagramConstraints.AvoidLineOverlapping
            });

            diagram.appendTo('#layoutStyleDemo');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
        });

        it('check segment overlaps', (done: Function) => {
            let overlapFound = false;
            for (const connector of diagram.connectors) {
                const lineSegments: any[] = (diagram.avoidLineOverlappingModule as any).segmentMappings.get(connector);
                if (lineSegments && lineSegments.length !== 0) {
                    for (const segment of lineSegments) {
                        if (segment.previous && segment.next) {
                            const overlaps = (diagram.avoidLineOverlappingModule as any).segmentTree.findOverlappingSegments(segment);
                            if (overlaps.length !== 0) {
                                overlapFound = true;
                                break;
                            }
                        }
                    }
                }
                if (overlapFound) {
                    break;
                }
            }
            expect(overlapFound).toBe(false);
            done();
        });
    });

    describe('AvoidLineOverlapping - removeConnectors method', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'diagram_removeConnectors_branch' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px', height: '500px',
                nodes: [
                    { id: 'node1', offsetX: 100, offsetY: 100, width: 50, height: 50 },
                    { id: 'node2', offsetX: 300, offsetY: 100, width: 50, height: 50 }
                ],
                connectors: [
                    {
                        id: 'connector1',
                        sourceID: 'node1',
                        targetID: 'node2',
                        type: 'Orthogonal',
                        segments: [{ type: 'Orthogonal', direction: 'Right', length: 50 }]
                    }
                ],
                constraints: DiagramConstraints.Default | DiagramConstraints.AvoidLineOverlapping,
            });
            diagram.appendTo('#diagram_removeConnectors_branch');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
        });

        it('should remove connector by string reference name', (done: Function) => {
            const connector: ConnectorModel = diagram.connectors[0];
            (diagram as any).nameTable['test_connector'] = connector;
            
            diagram.avoidLineOverlappingModule.addConnector(connector as Connector);
            
            // Remove connector by string name
            diagram.avoidLineOverlappingModule.removeConnectors(['test_connector']);
            
            expect(diagram.connectors.length === 1).toBe(true);
            done();
        });

        it('should remove connector by Connector instance reference', (done: Function) => {
            const connector: ConnectorModel = diagram.connectors[0];
            
            diagram.avoidLineOverlappingModule.addConnector(connector as Connector);
            
            // Remove connector by instance
            diagram.avoidLineOverlappingModule.removeConnectors([connector]);

            expect(diagram.connectors.length === 1).toBe(true);
            done();
        });

    });

});
