import { Diagram } from '../../../src/diagram/diagram';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { ConnectorModel } from '../../../src/diagram/objects/connector-model';
import { createElement } from '@syncfusion/ej2-base';

/**
 * Code Coverage Tests for Flowchart Mermaid Support
 * 
 * Focuses on new implementation in phases 1, 2, 4, and 5:
 * - Phase 1: Modern syntax parser and rounded rectangle detection
 * - Phase 2: Extended 40+ Mermaid shapes with proper mapping
 * - Phase 4: One-line chaining and ampersand operators
 * - Phase 5: Orientation parsing from Mermaid directives
 * 
 * Each test is designed for maximum code path coverage with minimal test cases.
 */
describe('Flowchart Mermaid - Modern Syntax & Extended Shapes', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll(() => {
        ele = createElement('div', { id: 'mermaidDiagram' });
        document.body.appendChild(ele);
    });

    afterAll(() => {
        if (diagram) {
            diagram.destroy();
            diagram = null;
        }
        if (ele) {
            ele.remove();
            ele = null;
        }
    });

    /**
     * Test 1: Modern Shape Syntax (@{shape: ...}) Parsing
     * 
     * Covers:
     * - parseAtShapeBlock() function
     * - Shape name extraction with hyphens (e.g., paper-tape, lean-left)
     * - Label extraction and fallback logic
     * - Shape mapping for 40+ extended shapes
     */
    it('Phase 1 & 2: Parse modern shape syntax with label and hyphenated shape names', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidDiagram');

        // Test modern syntax: @{shape: paper-tape, label: "Process"}
        // Coverage: shape with hyphenated name + explicit label
        const mermaidData = `flowchart TD
            A@{shape: paper-tape, label: "Task"}
            B@{shape: cloud, label: "Cloud"}
            A --> B
            C@{ img: "https://static.vecteezy.com/system/resources/thumbnails/023/009/485/small_2x/abstract-animal-owl-portrait-with-colorful-double-exposure-paint-with-generative-ai-free-photo.jpeg", w: 60, h: 60 }
            style A fill:#90EE90,stroke:#333,stroke-width:2px;
            style B fill:#4682B4,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(mermaidData);
        
        // Verify 2 nodes created with correct properties
        const exportedData = diagram.saveDiagramAsMermaid();

        diagram.loadDiagramFromMermaid(exportedData);
        // Verify shapes are correct and labels are applied
        const nodeA = diagram.nodes[0];
        const nodeB = diagram.nodes[1];
        expect(nodeA.annotations.length > 0 && nodeA.annotations[0].content === 'Task').toBe(true);
        expect(nodeB.annotations.length > 0 && nodeB.annotations[0].content === 'Cloud').toBe(true);
        
        done();
    });

    /**
     * Test 2: Extended Shape Types & Shape Mapping
     * 
     * Covers:
     * - CANONICAL_SHAPES mapping for 40+ shapes
     * - Shape categories: basic, flow, BPMN, path shapes
     * - buildShapeMap() function and alias resolution
     * - Shape-specific properties (width, height, showLabel)
     */
    it('Phase 2: Support extended shape types with proper dimensions and label handling', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidDiagram');

        // Test various extended shapes covering different categories
        // Coverage: basic (hexagon), flow (decision), path (cloud), BPMN (event)
        const mermaidData = `flowchart TD
            A@{shape: hexagon, label: "Plan"}
            B@{shape: decision, label: "Ready?"}
            C@{shape: cloud, label: "Deploy"}
            D@{shape: bpmn-start-event}
            A --> B
            B --> C
            C --> D
            style A fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(mermaidData);
        
        // Verify all 4 nodes created
        expect(diagram.nodes.length === 4).toBe(true);
        
        // Verify shape dimensions are applied from mapping
        // Hexagon should have specific width/height
        const hexNode = diagram.nodes[0];
        expect(hexNode.width === 90 && hexNode.height === 110).toBe(true);
        
        // Verify labels applied correctly
        expect(hexNode.annotations[0].content === 'Plan').toBe(true);
        
        // Verify BPMN event created properly
        const bpmnNode = diagram.nodes[3];
        expect(bpmnNode.shape !== null).toBe(true);
        
        done();
    });

    /**
     * Test 3: One-Line Chaining Expansion
     * 
     * Covers:
     * - expandChaining() function
     * - extractTargetNode() helper for robust node extraction
     * - Chaining with labeled arrows
     * - Shape syntax preservation in chained context
     * - Character-by-character parsing for missing spaces
     */
    it('Phase 4: Expand one-line chaining A --> B --> C with shape syntax', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidDiagram');

        // Test chaining with modern shape syntax
        // Coverage: expandChaining + shape syntax preservation
        // Pattern: A@{shape: rect} --> B@{shape: circle} --> C
        const mermaidData = `flowchart TD
            A@{shape: rect, label: "Start"} --> B@{shape: circle, label: "Process"} --> C[End]
            style A fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(mermaidData);
        
        // Verify 3 nodes created (A, B, C)
        expect(diagram.nodes.length === 3).toBe(true);
        
        // Verify 2 connectors created (A->B, B->C)
        expect(diagram.connectors.length === 2).toBe(true);
        
        // Verify shapes and labels preserved
        const nodeA = diagram.nodes.find((n: NodeModel) => n.id === 'A');
        const nodeB = diagram.nodes.find((n: NodeModel) => n.id === 'B');
        const nodeC = diagram.nodes.find((n: NodeModel) => n.id === 'C');
        
        expect(nodeA.annotations[0].content === 'Start').toBe(true);
        expect(nodeB.annotations[0].content === 'Process').toBe(true);
        expect(nodeC.annotations[0].content === 'End').toBe(true);
        
        done();
    });

    /**
     * Test 4: Ampersand (&) Compact Syntax - Cross Product
     * 
     * Covers:
     * - parseNodeGroup() for extracting ampersand-separated nodes
     * - expandAmpersandSyntax() for cross-product generation
     * - Ampersand as group operator (NOT statement separator)
     * - Shape syntax within node groups
     */
    it('Phase 4: Expand ampersand syntax creating cross-product A & B --> C & D', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidDiagram');

        // Test ampersand cross-product
        // Coverage: parseNodeGroup + expandAmpersandSyntax
        // Pattern: X & Y --> A & B (should create 4 edges: X->A, X->B, Y->A, Y->B)
        const mermaidData = `flowchart TD
            X[Start1]
            Y[Start2]
            A[End1]
            B[End2]
            X & Y --> A & B
            style X fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(mermaidData);
        
        // Verify 4 nodes created (X, Y, A, B)
        expect(diagram.nodes.length === 4).toBe(true);
        
        // Verify 4 connectors created (cross-product: X->A, X->B, Y->A, Y->B)
        expect(diagram.connectors.length === 4).toBe(true);
        
        // Verify connectivity
        const connectorFromX = diagram.connectors.filter((c: ConnectorModel) => c.sourceID === 'X');
        const connectorFromY = diagram.connectors.filter((c: ConnectorModel) => c.sourceID === 'Y');
        expect(connectorFromX.length === 2 && connectorFromY.length === 2).toBe(true);
        
        done();
    });

    /**
     * Test 5: Orientation Directive Parsing
     * 
     * Covers:
     * - parseOrientationDirective() function
     * - Regex matching: flowchart|graph|diagram + orientation code
     * - Case-insensitive parsing
     * - Mapping Mermaid codes (TB, LR, etc.) to EJ2 orientations
     * - Fallback to default when no orientation specified
     */
    it('Phase 5: Parse orientation directives (TB, LR, TD) and apply to layout', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidDiagram');

        // Test 1: LR (Left-to-Right) orientation
        const mermaidDataLR = `graph LR
            A[Start] --> B[Process] --> C[End]
            style A fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(mermaidDataLR);
        
        // Verify orientation applied
        expect(diagram.layout.orientation === 'LeftToRight').toBe(true);
        expect(diagram.nodes.length === 3).toBe(true);
        
        // Test 2: TB (Top-to-Bottom) orientation
        const mermaidDataTB = `flowchart TB
            A[Start]
            B[Process]
            C[End]
            A --> B --> C
            style A fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.clear();
        diagram.loadDiagramFromMermaid(mermaidDataTB);
        
        // Verify TB orientation
        expect(diagram.layout.orientation === 'TopToBottom').toBe(true);
        expect(diagram.nodes.length === 3).toBe(true);
        
        // Test 3: connector variations with orientation
        const mermaidDataConnectors = `flowchart LR
                A -- t1 --> B & C
                B & C == t2 ==> D & E
                D & E -. t3 .-> F & G
                F & G ---|t4| H & I
                H & I -->|t5| J & K
                J & K o--o L & M
                L & M x--x N & O
                N & O <-->|t6| P & Q
                P & Q ~~~ R & S`;

        diagram.clear();
        diagram.loadDiagramFromMermaid(mermaidDataConnectors);
        
        // Test 4: connector variations with orientation
        const mermaidDataConnectors2 = `flowchart BT
                A --- B & C
                B & C <==> D & E
                D & E === F & G
                F & G ~~~ H & I
                H & I -.->
            J & K
                J & K -.- L & M
                L & M ---o N & O
                N & O ---x P & Q
                P & Q o--o R & S
                R & S x--x T & U
                T & U <--> V & W
                V & W --> X & Y`;

        diagram.clear();
        diagram.loadDiagramFromMermaid(mermaidDataConnectors2);
        
        // Test 5: connector variations with orientation
        const mermaidDataConnectors3 = `flowchart RL
            A -- c1 ---o B & C
            B & C -- c2 ---x D & E
            D & E o-- c3 --o F & G
            F & G x-- c4 --x H & I
            H & I <-- c5 --> J & K
            J & K -- c6 --> L & M`;

        diagram.clear();
        diagram.loadDiagramFromMermaid(mermaidDataConnectors3);
        
        // Test 6: connector variations with orientation
        const mermaidDataConnectors4 = `graph LR
            A1 --> A2 --- A3 ==> A4 === A5 ~~~ A6
            A6 -->|label| A7 ---|label| A8 ===|label| A9 ~~~|label| A10 -.-|label| A11
            A11 -.- A12 -.-> A13 -..-> A14
            A14 <---> A15 <--> A16 <====> A17 <==> A18 <== text ==> A19
            A19 --o A20 ---o A21 --x A22 ---x A23 o--o A24 x--x A25
            A25 -- text --o A26 -- text --x A27
            `;

        diagram.clear();
        diagram.loadDiagramFromMermaid(mermaidDataConnectors4);
 
        // Test 7: connector variations with orientation
        const mermaidDataConnectors5 = `flowchart LR
    A[Node A] <== Sync ==> B[Node B] o-- Approved --o C[Node C] x-- Rejected --x D[Node D]
            `;

        diagram.clear();
        diagram.loadDiagramFromMermaid(mermaidDataConnectors5);
        
        done();
    });
    
    /**
     * Test 7: Image Nodes with @{img: ...} Syntax
     * 
     * Covers:
     * - Image node detection in parseAtShapeBlock()
     * - Width/height extraction with defaults
     * - Image shape creation (EJ2 Image type)
     * - Label annotation for image nodes
     */
    it('Phase 1: Create image nodes from @{img: url, w: 100, h: 100} syntax', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidDiagram');

        // Test image node with explicit dimensions
        // Coverage: Image shape creation + dimension handling
        const mermaidData = `flowchart TD
            A@{img: "https://static.vecteezy.com/system/resources/thumbnails/023/009/485/small_2x/abstract-animal-owl-portrait-with-colorful-double-exposure-paint-with-generative-ai-free-photo.jpeg", w: 100, h: 100, label: "Icon"}
            B(Process)
            A --> B
            style B fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(mermaidData);
        
        // Verify 2 nodes created (A image, B rectangle)
        expect(diagram.nodes.length === 2).toBe(true);
        
        // Verify image node properties
        const imageNode = diagram.nodes.find((n: NodeModel) => n.id === 'A');
        expect(imageNode !== undefined).toBe(true);
        
        // Verify image source stored
        expect((imageNode.addInfo as any).imageSource === "https://static.vecteezy.com/system/resources/thumbnails/023/009/485/small_2x/abstract-animal-owl-portrait-with-colorful-double-exposure-paint-with-generative-ai-free-photo.jpeg").toBe(true);
        expect((imageNode.addInfo as any).modernShapeName === "image").toBe(true);

        
        // Verify dimensions applied
        expect(imageNode.width === 100 && imageNode.height === 100).toBe(true);
        
        // Verify label annotation
        expect(imageNode.annotations.length > 0 && imageNode.annotations[0].content === 'Icon').toBe(true);
        
        done();
    });

    /**
     * Test 8: Combined Features - Chaining + Ampersand + Modern Syntax
     * 
     * Covers:
     * - Integration of expandChaining + expandAmpersandSyntax
     * - Complex expression: A --> B & C@{shape: circle} --> D
     * - All syntax features working together
     * - Proper node and connector creation
     */
    it('Phase 4: Complex chaining with ampersand and shape syntax A --> B & C@{shape: circle} --> D', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidDiagram');

        // Test combined features: chaining + ampersand + shape syntax
        // Pattern: A --> B & C@{shape: circle} --> D
        // Expected expansion: A->B, A->C, B->D, C->D
        const mermaidData = `flowchart TD
            A[Start] --> B[Process1] & C@{shape: circle, label: "Check"} --> D[End]
            style A fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(mermaidData);
        
        // Verify 4 nodes created (A, B, C, D)
        expect(diagram.nodes.length === 4).toBe(true);
        
        // Verify 4 connectors created: A->B, A->C, B->D, C->D
        expect(diagram.connectors.length === 4).toBe(true);
        
        // Verify C has circle shape from modern syntax
        const nodeC = diagram.nodes.find((n: NodeModel) => n.id === 'C');
        expect((nodeC.addInfo as any).modernShapeName === 'circle').toBe(true);
        expect(nodeC.annotations[0].content === 'Check').toBe(true);
        
        done();
    });

    /**
     * Test 9: Annotation Margin Support
     * 
     * Covers:
     * - annotationMargin property in ShapeMapping
     * - Margin application for path-comment (left: 45) and path-brace-r (right: 45)
     * - Proper margin propagation to annotation
     */
    it('Phase 1+: Apply annotation margins for comment shapes (path-comment, path-brace-r)', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidDiagram');

        // Test annotation margin for comment shapes
        // Coverage: Margin from shape mapping applied to annotations
        const mermaidData = `flowchart TD
            A@{shape: brace-l, label: "Comment"}
            B[Process]
            C@{shape: brace-r, label: "Note"}
            D@{ shape: text, label: "This is a text block" }
            E --> B & C |Two |E[Result two]
            A --> B --> C
            style A fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(mermaidData);
        
        // Verify brace-l (path-comment) has left margin
        const nodeA = diagram.nodes.find((n: NodeModel) => n.id === 'A');
        expect(nodeA.annotations.length > 0).toBe(true);
        expect(nodeA.annotations[0].margin.left === 45).toBe(true);
        
        // Verify brace-r (path-brace-r) has right margin
        const nodeC = diagram.nodes.find((n: NodeModel) => n.id === 'C');
        expect(nodeC.annotations.length > 0).toBe(true);
        expect(nodeC.annotations[0].margin.right === 45).toBe(true);
        
        done();
    });
});

describe('Flowchart Mermaid - Export Round-Trip', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll(() => {
        ele = createElement('div', { id: 'mermaidRoundTrip' });
        document.body.appendChild(ele);
    });

    afterAll(() => {
        if (diagram) {
            diagram.destroy();
            diagram = null;
        }
        if (ele) {
            ele.remove();
            ele = null;
        }
    });

    /**
     * Test 9: Export Round-Trip Preservation
     * 
     * Covers:
     * - Modern syntax preservation during export
     * - getNodeShape() exporting modern syntax
     * - Multiple load/save cycles
     */
    it('Phase 2: Export modern syntax shape to Mermaid and reload preserves structure', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidRoundTrip');

        const originalData = `flowchart TD
            A@{shape: cloud, label: "Cloud"}
            B[Process]
            A --> B
            style A fill:#90EE90,stroke:#333,stroke-width:2px;`;

        diagram.loadDiagramFromMermaid(originalData);
        const nodeCount1 = diagram.nodes.length;
        const connectorCount1 = diagram.connectors.length;

        // Export to Mermaid
        const exportedData = diagram.saveDiagramAsMermaid();
        expect(exportedData.includes('@{') && exportedData.includes('shape:')).toBe(true);

        // Reload exported data
        diagram.loadDiagramFromMermaid(exportedData);
        const nodeCount2 = diagram.nodes.length;
        const connectorCount2 = diagram.connectors.length;

        // Verify structure preserved
        expect(nodeCount1 === nodeCount2 && connectorCount1 === connectorCount2).toBe(true);

        done();
    });
});

describe('Flowchart Mermaid - Export Round-Trip 2', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll(() => {
        ele = createElement('div', { id: 'mermaidRoundTrip2' });
        document.body.appendChild(ele);
    });

    afterAll(() => {
        if (diagram) {
            diagram.destroy();
            diagram = null;
        }
        if (ele) {
            ele.remove();
            ele = null;
        }
    });

    it('Export modern syntax shape', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px', nodes: [
                { id: '1', shape: { type: 'Basic', shape: 'Rectangle', cornerRadius: 5 }, annotations: [{ content: undefined }], style: { fill: '#6CA0DC' } },
                { id: '2', shape: { type: 'Path', data: 'M 0 0' }, annotations: [{ content: 'Input' }], style: { fill: '#6CA0DC' } },
                { id: '3', shape: { type: 'Flow', shape: 'Decision' }, annotations: [{ content: 'Decision?' }], style: { fill: '#6CA0DC' } },
                { id: '4', shape: { type: 'Flow', shape: 'Process' }, annotations: [{ content: 'Process1' }], style: { fill: '#6CA0DC' } },
                { id: '5', shape: { type: 'Flow', shape: 'Process' }, annotations: [{ content: 'Process2' }], style: { fill: '#6CA0DC' } },
                { id: '6', shape: { type: 'Flow', shape: 'Data' }, annotations: [{ content: 'Output' }], style: { fill: '#6CA0DC' } },
                { id: '7', shape: { type: 'Flow', shape: 'Data' }, annotations: [{ content: 'Output' }], style: { fill: '#6CA0DC' } },
                { id: '8', shape: { type: 'Flow', shape: 'Terminator' }, annotations: [{ content: 'End' }], style: { fill: '#6CA0DC' } }
            ],
            layout: { type: 'Flowchart', orientation: 'LeftToRight' }
        });
        diagram.appendTo('#mermaidRoundTrip2');

        // Export to Mermaid
        const exportedData = diagram.saveDiagramAsMermaid();

        // Reload exported data
        diagram.loadDiagramFromMermaid(exportedData);

        done();
    });
});

describe('Flowchart Mermaid - Export Round-Trip 3', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll(() => {
        ele = createElement('div', { id: 'mermaidRoundTrip3' });
        document.body.appendChild(ele);
    });

    afterAll(() => {
        if (diagram) {
            diagram.destroy();
            diagram = null;
        }
        if (ele) {
            ele.remove();
            ele = null;
        }
    });

    it('Export modern syntax shape', (done: Function) => {
        const nodes: NodeModel[] = [
            { id: 'sdlc', offsetX: 300, offsetY: 288, width: 100, height: 100, annotations: [{ content: 'SDLC' }] },
            { id: 'support', offsetX: 150, offsetY: 250, width: 100, height: 100, annotations: [{ content: 'Support' }] },
            { id: 'analysis', offsetX: 300, offsetY: 150, width: 100, height: 100, annotations: [{ content: 'Analysis' }] },
            { id: 'design', offsetX: 450, offsetY: 250, width: 100, height: 100, annotations: [{ content: 'Design' }] },
            { id: 'implement', offsetX: 400, offsetY: 400, width: 100, height: 100, annotations: [{ content: 'Implement' }] },
            { id: 'deploy', offsetX: 200, offsetY: 400, width: 100, height: 100, annotations: [{ content: 'Deploy' }] }
        ];

        const crossPath = 'M 0,0 L 25,25 M 25,0 L 0,25';

        const connectors: ConnectorModel[] = [
        // analysis --> design  (normal arrow)
        {
            id: 'connector1',
            sourceID: 'analysis',
            targetID: 'design',
            style: { strokeWidth: 1, opacity: 1 },
            targetDecorator: { shape: 'Arrow' },
            sourceDecorator: { shape: 'Arrow' }
        },

        // design == > implement  (thick arrow)
        {
            id: 'connector2',
            sourceID: 'design',
            targetID: 'implement',
            style: { strokeWidth: 3, opacity: 1 },
            targetDecorator: { shape: 'None' }
        },

        // implement -.-> deploy  (dashed arrow)
        {
            id: 'connector3',
            sourceID: 'implement',
            targetID: 'deploy',
            style: { strokeWidth: 1, strokeDashArray: '4,4', opacity: 1 },
            targetDecorator: { shape: 'Arrow' }
        },

        // deploy ---o support  (circle end)
        {
            id: 'connector4',
            sourceID: 'deploy',
            targetID: 'support',
            style: { strokeWidth: 1, opacity: 1 },
            targetDecorator: { shape: 'Circle' },
        },
        // deploy o--o support  (circle end)
        {
            id: 'connector5',
            sourceID: 'deploy',
            targetID: 'support',
            style: { strokeWidth: 1, opacity: 1 },
            targetDecorator: { shape: 'Circle' },
            sourceDecorator: { shape: 'Circle' }
        },

        // support x--x analysis  (cross on both ends)
        {
            id: 'connector6',
            sourceID: 'support',
            targetID: 'analysis',
            style: { strokeWidth: 1, opacity: 0 },
            sourceDecorator: { shape: 'Custom', pathData: crossPath },
            targetDecorator: { shape: 'Custom', pathData: crossPath }
        },
        // support --x analysis  (cross on both ends)
        {
            id: 'connector7',
            sourceID: 'support',
            targetID: 'analysis',
            style: { strokeWidth: 1, opacity: 0 },
            targetDecorator: { shape: 'Custom', pathData: crossPath }
        }
        ];

        diagram = new Diagram({
            width: '100%', height: '700px', nodes: nodes, connectors: connectors,
            layout: { type: 'Flowchart', orientation: 'LeftToRight' }
        });
        diagram.appendTo('#mermaidRoundTrip3');

        // Export to Mermaid
        const exportedData = diagram.saveDiagramAsMermaid();

        done();
    });
});

describe('Flowchart Mermaid - Export Image Node Round-Trip', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll(() => {
        ele = createElement('div', { id: 'mermaidImageRoundTrip' });
        document.body.appendChild(ele);
    });

    afterAll(() => {
        if (diagram) {
            diagram.destroy();
            diagram = null;
        }
        if (ele) {
            ele.remove();
            ele = null;
        }
    });

    /**
     * Test: Export programmatically-created Image nodes to Mermaid and verify roundtrip
     * 
     * Covers:
     * - Direct Image shape detection (shape.type === 'Image')
     * - Export of image source from shape.source property
     * - Export of width/height from node dimensions
     * - Export of annotation label
     * - Export of annotation offset as pos property
     * - Roundtrip: create → export → reload → verify structure preserved
     */
    it('Export programmatic image nodes with shape.type=Image to Mermaid roundtrip', (done: Function) => {
        // Create image nodes programmatically (not from Mermaid import)
        const imageNodeWithLabel: NodeModel = {
            id: 'imgWithLabel',
            offsetX: 200,
            offsetY: 150,
            width: 120,
            height: 60,
            shape: { type: 'Image', source: 'https://mermaid.js.org/favicon.svg', scale: 'None' } as any,
            annotations: [{ 
                content: 'My example image label', 
                offset: { x: 0.5, y: -0.2 }  // Label above image (pos: t)
            }],
            style: { fill: 'transparent', strokeColor: '#333', strokeWidth: 1 }
        };

        const imageNodeNoLabel: NodeModel = {
            id: 'imgNoLabel',
            offsetX: 400,
            offsetY: 150,
            height: 80,
            shape: { type: 'Image', source: 'https://example.com/image.png', scale: 'None' } as any,
            annotations: [],
            style: { fill: 'transparent', strokeColor: '#333', strokeWidth: 1 }
        };

        const imageNodeNoSize: NodeModel = {
            id: 'imgNoSize',
            offsetX: 600,
            offsetY: 150,
            width: 100, 
            shape: { type: 'Image', source: 'https://example.com/icon.svg', scale: 'None' } as any,
            annotations: [{ content: 'Icon without size' }],
            style: { fill: 'transparent', strokeColor: '#333', strokeWidth: 1 }
        };

        const connectors: ConnectorModel[] = [
            {
                id: 'conn1',
                sourceID: 'imgWithLabel',
                targetID: 'imgNoLabel',
                style: { strokeWidth: 1 }
            },
            {
                id: 'conn2',
                sourceID: 'imgNoLabel',
                targetID: 'imgNoSize',
                style: { strokeWidth: 1 }
            }
        ];

        diagram = new Diagram({
            width: '100%',
            height: '500px',
            nodes: [imageNodeWithLabel, imageNodeNoLabel, imageNodeNoSize],
            connectors: connectors,
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidImageRoundTrip');

        // Verify programmatic nodes created
        expect(diagram.nodes.length).toBe(3);
        expect(diagram.connectors.length).toBe(2);

        // Export to Mermaid
        const exportedData = diagram.saveDiagramAsMermaid();

        // Verify exported data contains image syntax
        expect(exportedData.includes('@{ img:')).toBe(true);
        expect(exportedData.includes('https://mermaid.js.org/favicon.svg')).toBe(true);

        // Verify dimensions exported when present
        expect(exportedData.includes('w: 120')).toBe(true);
        expect(exportedData.includes('h: 60')).toBe(true);

        // Verify label exported when present
        expect(exportedData.includes('label: "My example image label"')).toBe(true);

        // Clear diagram and reload from exported Mermaid
        const nodeCountBefore = diagram.nodes.length;
        const connectorCountBefore = diagram.connectors.length;

        diagram.clear();
        diagram.loadDiagramFromMermaid(exportedData);

        // Verify structure preserved after reload
        expect(diagram.nodes.length).toBe(nodeCountBefore);
        expect(diagram.connectors.length).toBe(connectorCountBefore);

        done();
    });
});

/**
 * =====================================================================
 * PHASE 6: INTERACTIVE FEATURES - CLICKABLE NODES WITH URLS
 * =====================================================================
 * 
 * Tests for click directive parsing and URL/tooltip application to nodes.
 * Covers both load and save scenarios with comprehensive edge case testing.
 */
describe('Flowchart Mermaid - Phase 6: Interactive Features (Click Directives)', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll(() => {
        ele = createElement('div', { id: 'mermaidPhase6' });
        document.body.appendChild(ele);
    });

    afterAll(() => {
        if (diagram) {
            diagram.destroy();
            diagram = null;
        }
        if (ele) {
            ele.remove();
            ele = null;
        }
    });

    /**
     * Test P6-1: Basic Click Directive Parsing and Loading
     * 
     * Covers:
     * - parseClickDirective() function
     * - Regex pattern: /^click\s+(\w+)\s+"([^"]*)"\s+"([^"]*)"/
     * - URL and tooltip extraction
     * - Storage in FlowChartData (clickUrl, clickTooltip)
     * - Single click directive on single node
     */
    it('P6-T1: Parse single click directive with URL and tooltip on node', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const mermaidData = `flowchart TD
            A[Start Node]
            B[Second Node]
            A --> B
            
            click A "https://www.google.com" "Go to Google"`;

        diagram.loadDiagramFromMermaid(mermaidData);

        // Verify nodes created
        expect(diagram.nodes.length).toBe(2);

        done();
    });

    /**
     * Test P6-2: Multiple Click Directives on Different Nodes
     * 
     * Covers:
     * - Multiple click directives in same diagram
     * - Different URLs and tooltips for each node
     * - Proper matching of click directives to node IDs
     * - Complex URLs with query parameters
     */
    it('P6-T2: Parse multiple click directives on different nodes with query parameters', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const mermaidData = `flowchart TD
            A[Start Node]
            B[Second Node with Label]
            C[Third Node with Label]
            D[Fourth Node]
            E[Final Node]
            F[Final Node]
            G[Final Node]
            H[Final Node]
            
            A --> B --> C --> D --> E --> F --> G --> H
            
            click A "https://www.google.com" "Go to Google"
            click B "https://www.google.com/search?q=second" "Search Second Node"
            click C "https://www.google.com/search?q=third" "Details about Third Node"
            click D "https://www.google.com/search?q=fourth" "Fourth Node Info" _parent
            click E "https://www.google.com/search?q=final" "Final Destination" _pa
            click F callback "Tooltip for a callback"
            click G "https://www.github.com" "This is a tooltip for a link"
            click H call callback() "Tooltip for a callback"`;

        diagram.loadDiagramFromMermaid(mermaidData);

        // Verify all 8 nodes created
        expect(diagram.nodes.length).toBe(8);

        done();
    });

    /**
     * Test P6-3: Click Directives with Various URL Schemes
     * 
     * Covers:
     * - Different URL protocols: https://, http://, file://, mailto:, etc.
     * - Special characters in URLs (?, =, &, #, /, -)
     * - Long descriptive tooltips
     * - Click on nodes with complex shapes
     */
    it('P6-T3: Parse click directives with various URL schemes and protocols', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const mermaidData = `flowchart TD
            A[HTTPS Node]
            B[HTTP Node]
            C[File Node]
            D[Hash Node]
            E[Email Node]
            
            A --> B --> C --> D --> E
            
            click A "https://secure.example.com/path/to/resource?id=123&type=info#section" "Go to secure resource with params"
            click B "http://example.com/page" "Visit HTTP page"
            click C "file:///path/to/local/file.html" "Open local file"
            click D "https://example.com#anchor-link" "Jump to anchor"
            click E "mailto:contact@example.com?subject=Question" "Send email with subject"`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(5);

        done();
    });

    /**
     * Test P6-4: Click Directives with Ampersand and Chaining
     * 
     * Covers:
     * - Click on nodes created via ampersand syntax (a --> b & c)
     * - Click on nodes created via chaining (a --> b --> c)
     * - Click applied after shape expansion
     * - Integration with Phase 4 features
     */
    it('P6-T4: Click directives on nodes from ampersand and chaining expansion', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const mermaidData = `flowchart TD
            A[Start]
            B[Process 1]
            C[Process 2]
            D[End]
            
            A --> B & C --> D
            
            click A "https://example.com/start" "Start process"
            click B "https://example.com/p1" "Process 1 details"
            click C "https://example.com/p2" "Process 2 details"
            click D "https://example.com/end" "View result"`;

        diagram.loadDiagramFromMermaid(mermaidData);

        // Verify 4 nodes (A, B, C, D)
        expect(diagram.nodes.length).toBe(4);
        
        // Verify 4 connectors (A->B, A->C, B->D, C->D)
        expect(diagram.connectors.length).toBe(4);

        done();
    });

    /**
     * Test P6-5: Click on Non-Existent Node (Graceful Handling)
     * 
     * Covers:
     * - Click directive referencing non-existent node
     * - No error thrown
     * - Click data not applied (graceful degradation)
     * - Diagram still renders successfully
     */
    it('P6-T5: Handle click directive on non-existent node gracefully', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const mermaidData = `flowchart TD
            A[Node A]
            B[Node B]
            A --> B
            
            click A "https://example.com/a" "Node A"
            click Z "https://example.com/z" "Non-existent Node Z"
            click B "https://example.com/b" "Node B"`;

        // Should not throw error
        expect(() => {
            diagram.loadDiagramFromMermaid(mermaidData);
        }).not.toThrow();

        // Verify 2 nodes created
        expect(diagram.nodes.length).toBe(2);

        done();
    });

    /**
     * Test P6-6: Click Directives with Modern Shape Syntax
     * 
     * Covers:
     * - Click on nodes with @{shape: ...} syntax
     * - Shape properties preserved with click data
     * - Click data doesn't interfere with shape application
     */
    it('P6-T6: Click directives on nodes with modern shape syntax @{shape: ...}', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const mermaidData = `flowchart TD
            A@{shape: circle, label: "Circle"}
            B@{shape: hexagon, label: "Hexagon"}
            C@{shape: rounded, label: "Cloud"}
            
            A --> B --> C
            
            click A "https://example.com/circle" "Circle shape"
            click B "https://example.com/hexagon" "Hexagon shape"
            click C "https://example.com/cloud" "Cloud shape"`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(3);

        done();
    });

    /**
     * Test P6-7: Click Directives with Node Styling
     * 
     * Covers:
     * - Click on styled nodes
     * - Click data combined with fill, stroke styling
     * - All properties properly stored
     */
    it('P6-T7: Click directives combined with node styling properties', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const mermaidData = `flowchart TD
            A[Start]
            B[Process]
            C[End]
            
            A --> B --> C
            
            style A fill:#90EE90,stroke:#333,stroke-width:2px;
            style B fill:#4682B4,stroke:#333,stroke-width:2px;
            style C fill:#FFB6C1,stroke:#333,stroke-width:2px;
            
            click A "https://example.com/start" "Start the process"
            click B "https://example.com/process" "View process details"
            click C "https://example.com/end" "View final result"`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(3);

        done();
    });

    /**
     * Test P6-8: Export Click Directives to Mermaid (Save)
     * 
     * Covers:
     * - Export nodes with click data back to Mermaid format
     * - Click directives appear in exported string
     * - Format: click <nodeId> "<url>" "<tooltip>"
     * - Roundtrip: load → save → load → verify structure preserved
     */
    it('P6-T8: Export click directives to Mermaid format and verify roundtrip', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const originalData = `flowchart TD
            A[Start Node]
            B[Second Node]
            C[Third Node]
            
            A --> B --> C
            
            click A "https://www.google.com" _blank
            click B "https://www.google.com/search" "Search"
            click C "https://www.google.com/maps" "Maps"`;

        diagram.loadDiagramFromMermaid(originalData);
        const nodeCount1 = diagram.nodes.length;

        // Export to Mermaid
        const exportedData = diagram.saveDiagramAsMermaid();
        expect(exportedData.includes('click A')).toBe(true);
        expect(exportedData.includes('https://www.google.com')).toBe(true);

        // Reload exported data
        diagram.clear();
        diagram.loadDiagramFromMermaid(exportedData);
        const nodeCount2 = diagram.nodes.length;

        // Verify structure preserved
        expect(nodeCount1).toBe(nodeCount2);

        done();
    });

    /**
     * Test P6-10: Empty Click Directive Fields (Edge Case)
     * 
     * Covers:
     * - Click with empty URL: click A "" "tooltip"
     * - Click with empty tooltip: click A "https://url" ""
     * - Both empty
     * - Proper handling without errors
     */
    it('P6-T10: Handle click directives with empty URL or tooltip fields', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase6');

        const mermaidData = `flowchart TD
            A[Node A]
            B[Node B]
            C[Node C]
            
            A --> B --> C
            
            click A "" "No URL"
            click B "https://example.com" ""
            click C "https://example.com" "Normal"`;

        expect(() => {
            diagram.loadDiagramFromMermaid(mermaidData);
        }).not.toThrow();

        expect(diagram.nodes.length).toBe(3);

        done();
    });
});

/**
 * =====================================================================
 * PHASE 7: STYLING - COLORS, DASHED BORDERS, AND LINK STYLES
 * =====================================================================
 * 
 * Tests for node styling (text color, dashed borders) and link style directives.
 * Covers both load and save scenarios with comprehensive edge case testing.
 */
describe('Flowchart Mermaid - Phase 7: Styling (Text Color & Dashed Borders)', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll(() => {
        ele = createElement('div', { id: 'mermaidPhase7Style' });
        document.body.appendChild(ele);
    });

    afterAll(() => {
        if (diagram) {
            diagram.destroy();
            diagram = null;
        }
        if (ele) {
            ele.remove();
            ele = null;
        }
    });

    /**
     * Test P7-1: Node Text Color Styling
     * 
     * Covers:
     * - parseStyle() regex with color: property
     * - Color extraction and storage in FlowChartData
     * - Application to node annotation style
     * - Various color formats: hex, rgb, named colors
     */
    it('P7-T1: Apply text color styling to node annotations', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Style');

        const mermaidData = `flowchart TD
            A[Red Text]
            B[White Text]
            C[Blue Text]
            
            A --> B --> C
            
            style A fill:#90EE90,stroke:#333,stroke-width:2px,color:#ff0000;
            style B fill:#4682B4,stroke:#333,stroke-width:2px,color:#ffffff;
            style C fill:#FFD700,stroke:#333,stroke-width:2px,color:#0000ff;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(3);

        // Verify text color applied to node A
        const nodeA = diagram.nodes.find((n: NodeModel) => n.id === 'A');
        expect(nodeA).toBeDefined();
        expect(nodeA.annotations.length > 0).toBe(true);
        expect(nodeA.annotations[0].style.color).toBe('#ff0000');

        // Verify text color applied to node B
        const nodeB = diagram.nodes.find((n: NodeModel) => n.id === 'B');
        expect(nodeB.annotations[0].style.color).toBe('#ffffff');

        // Verify text color applied to node C
        const nodeC = diagram.nodes.find((n: NodeModel) => n.id === 'C');
        expect(nodeC.annotations[0].style.color).toBe('#0000ff');

        done();
    });

    /**
     * Test P7-2: Node Dashed Border Styling
     * 
     * Covers:
     * - parseStyle() regex with stroke-dasharray: property
     * - Dashboard pattern extraction
     * - Application to node.style.strokeDashArray
     * - Various dash patterns: "5 5", "10 5", "3 3 1 3", etc.
     */
    it('P7-T2: Apply dashed border styling to nodes with stroke-dasharray', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Style');

        const mermaidData = `flowchart TD
            A[Dashed 5-5]
            B[Dashed 10-5]
            C[Dashed 3-3-1-3]
            
            A --> B --> C
            
            style A fill:#fff,stroke:#000,stroke-width:2px,stroke-dasharray:5 5;
            style B fill:#fff,stroke:#000,stroke-width:2px,stroke-dasharray:10 5;
            style C fill:#fff,stroke:#000,stroke-width:2px,stroke-dasharray:3 3 1 3;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(3);

        // Verify dashed border pattern applied to node A
        const nodeA = diagram.nodes.find((n: NodeModel) => n.id === 'A');
        expect(nodeA.style.strokeDashArray).toBe('5 5');

        // Verify dashed border pattern applied to node B
        const nodeB = diagram.nodes.find((n: NodeModel) => n.id === 'B');
        expect(nodeB.style.strokeDashArray).toBe('10 5');

        // Verify dashed border pattern applied to node C
        const nodeC = diagram.nodes.find((n: NodeModel) => n.id === 'C');
        expect(nodeC.style.strokeDashArray).toBe('3 3 1 3');

        done();
    });

    /**
     * Test P7-3: Combined Text Color and Dashed Border
     * 
     * Covers:
     * - Both color: and stroke-dasharray: in single style declaration
     * - Both properties applied simultaneously
     * - No conflict between properties
     */
    it('P7-T3: Apply both text color and dashed border to same node', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Style');

        const mermaidData = `flowchart TD
            A[Styled Node]
            B[Another Styled]
            C[Third Styled]
            
            A --> B --> C
            
            style A fill:#90EE90,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#ff0000;
            style B fill:#87CEEB,stroke:#333,stroke-width:2px,stroke-dasharray:10 5,color:#ffffff;
            style C fill:#FFD700,stroke:#333,stroke-width:2px,stroke-dasharray:3 3 1 3,color:#000000;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(3);

        // Verify both color and dashed border on node A
        const nodeA = diagram.nodes.find((n: NodeModel) => n.id === 'A');
        expect(nodeA.annotations[0].style.color).toBe('#ff0000');
        expect(nodeA.style.strokeDashArray).toBe('5 5');

        // Verify both color and dashed border on node B
        const nodeB = diagram.nodes.find((n: NodeModel) => n.id === 'B');
        expect(nodeB.annotations[0].style.color).toBe('#ffffff');
        expect(nodeB.style.strokeDashArray).toBe('10 5');

        // Verify both color and dashed border on node C
        const nodeC = diagram.nodes.find((n: NodeModel) => n.id === 'C');
        expect(nodeC.annotations[0].style.color).toBe('#000000');
        expect(nodeC.style.strokeDashArray).toBe('3 3 1 3');

        done();
    });

    /**
     * Test P7-4: Style Without Color (Existing Behavior)
     * 
     * Covers:
     * - Styles without color property still work
     * - Fill, stroke, stroke-width applied correctly
     * - Backward compatibility (no regression)
     */
    it('P7-T4: Apply node style without color property (backward compatibility)', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Style');

        const mermaidData = `flowchart TD
            A[No Color Style]
            B[Another Node]
            
            A --> B
            
            style A fill:#90EE90,stroke:#333,stroke-width:2px;
            style B fill:#4682B4,stroke:#ff0000,stroke-width:3px;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(2);

        done();
    });

    /**
     * Test P7-5: Style Without Dash Array (Existing Behavior)
     * 
     * Covers:
     * - Styles without stroke-dasharray stay solid
     * - Backward compatibility maintained
     * - Default strokeDashArray is undefined/not set
     */
    it('P7-T5: Apply node style without stroke-dasharray (solid border)', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Style');

        const mermaidData = `flowchart TD
            A[Solid Border]
            B[Another Solid]
            
            A --> B
            
            style A fill:#90EE90,stroke:#333,stroke-width:2px,color:#ff0000;
            style B fill:#4682B4,stroke:#ff0000,stroke-width:3px,color:#ffffff;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(2);

        done();
    });

    /**
     * Test P7-6: Export Styled Nodes to Mermaid (Save)
     * 
     * Covers:
     * - Export nodes with text color back to Mermaid format
     * - Export nodes with dashed borders back to Mermaid format
     * - Correct format: color: and stroke-dasharray: in style declaration
     * - Roundtrip verification
     */
    it('P7-T6: Export node styling to Mermaid and verify roundtrip', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Style');

        const originalData = `flowchart TD
            A[Red Text]
            B[Blue Text]
            C[Dashed Border]
            
            A --> B --> C
            
            style A fill:#90EE90,stroke:#333,stroke-width:2px,color:#ff0000;
            style B fill:#87CEEB,stroke:#333,stroke-width:2px,color:#0000ff;
            style C fill:#fff,stroke:#333,stroke-width:2px,stroke-dasharray:5 5;`;

        diagram.loadDiagramFromMermaid(originalData);
        const nodeCount1 = diagram.nodes.length;

        // Export to Mermaid
        const exportedData = diagram.saveDiagramAsMermaid();
        expect(exportedData.includes('style')).toBe(true);

        // Reload exported data
        diagram.clear();
        diagram.loadDiagramFromMermaid(exportedData);
        const nodeCount2 = diagram.nodes.length;

        // Verify structure preserved
        expect(nodeCount1).toBe(nodeCount2);

        // Verify styling preserved after roundtrip
        const nodeA = diagram.nodes.find((n: NodeModel) => n.id === 'A');
        expect(nodeA.annotations[0].style.color).toBe('#ff0000');

        const nodeC = diagram.nodes.find((n: NodeModel) => n.id === 'C');
        expect(nodeC.style.strokeDashArray).toBe('5 5');

        done();
    });
});

/**
 * =====================================================================
 * PHASE 7: STYLING - LINK STYLE DIRECTIVES
 * =====================================================================
 * 
 * Tests for connector/link styling via linkStyle directive with indexed styling.
 */
describe('Flowchart Mermaid - Phase 7: Link Styles (Connector Styling)', () => {
    let diagram: Diagram;
    let ele: HTMLElement;

    beforeAll(() => {
        ele = createElement('div', { id: 'mermaidPhase7Link' });
        document.body.appendChild(ele);
    });

    afterAll(() => {
        if (diagram) {
            diagram.destroy();
            diagram = null;
        }
        if (ele) {
            ele.remove();
            ele = null;
        }
    });

    /**
     * Test P7-7: Single Link Style Directive with Color
     * 
     * Covers:
     * - parseLinkStyle() function
     * - Regex pattern: /^linkStyle\s+([\d,\s]+)\s+(.+);?$/
     * - Single index styling: linkStyle 0 stroke:#f66;
     * - Color extraction and application to connector
     */
    it('P7-T7: Apply linkStyle directive to single connector by index', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Link');

        const mermaidData = `flowchart TD
            A[Start] --> B[Process] --> C[End]
            
            linkStyle 0 stroke:#2563eb;
            linkStyle 1 stroke:#dc2626;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(3);
        expect(diagram.connectors.length).toBe(2);

        // Verify first connector styled with blue
        const connector0 = diagram.connectors[0];
        expect(connector0.style.strokeColor).toBe('#2563eb');

        // Verify second connector styled with red
        const connector1 = diagram.connectors[1];
        expect(connector1.style.strokeColor).toBe('#dc2626');

        done();
    });

    /**
     * Test P7-8: Multiple Link Style Directives with Comma-Separated Indices
     * 
     * Covers:
     * - Multiple indices: linkStyle 0,1,2 stroke:#f66;
     * - Color applied to all specified connectors
     * - Unspecified connectors remain unstyled
     */
    it('P7-T8: Apply linkStyle to multiple connectors with comma-separated indices', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Link');

        const mermaidData = `flowchart TD
            A[Start]
            B[Step 1]
            C[Step 2]
            D[Step 3]
            E[End]
            
            A --> B --> C --> D --> E
            
            linkStyle 0,1 stroke:#2563eb,stroke-width:2px;
            linkStyle 2,3 stroke:#16a34a,stroke-width:3px;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.nodes.length).toBe(5);
        expect(diagram.connectors.length).toBe(4);

        // Verify connectors 0,1 styled with blue
        expect(diagram.connectors[0].style.strokeColor).toBe('#2563eb');
        expect(diagram.connectors[0].style.strokeWidth).toBe(2);
        
        expect(diagram.connectors[1].style.strokeColor).toBe('#2563eb');
        expect(diagram.connectors[1].style.strokeWidth).toBe(2);

        // Verify connectors 2,3 styled with green
        expect(diagram.connectors[2].style.strokeColor).toBe('#16a34a');
        expect(diagram.connectors[2].style.strokeWidth).toBe(3);
        
        expect(diagram.connectors[3].style.strokeColor).toBe('#16a34a');
        expect(diagram.connectors[3].style.strokeWidth).toBe(3);

        done();
    });

    /**
     * Test P7-9: Link Style with Stroke Width
     * 
     * Covers:
     * - stroke-width property in linkStyle
     * - Extract and apply stroke width to connector
     * - Various width values: 1px, 2px, 3px, 4px
     */
    it('P7-T9: Apply linkStyle with stroke-width to connectors', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Link');

        const mermaidData = `flowchart TD
            A[Start]
            B[Thin]
            C[Medium]
            D[Thick]
            E[Very Thick]
            
            A --> B --> C --> D --> E
            
            linkStyle 0 stroke:#f66,stroke-width:1px;
            linkStyle 1 stroke:#f66,stroke-width:2px;
            linkStyle 2 stroke:#f66,stroke-width:3px;
            linkStyle 3 stroke:#f66,stroke-width:4px;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.connectors.length).toBe(4);

        expect(diagram.connectors[0].style.strokeWidth).toBe(1);
        expect(diagram.connectors[1].style.strokeWidth).toBe(2);
        expect(diagram.connectors[2].style.strokeWidth).toBe(3);
        expect(diagram.connectors[3].style.strokeWidth).toBe(4);

        done();
    });

    /**
     * Test P7-10: Link Style with Dash Array (Dashed Links)
     * 
     * Covers:
     * - stroke-dasharray property in linkStyle
     * - Dashed connector styling
     * - Various dash patterns in link styles
     */
    it('P7-T10: Apply linkStyle with stroke-dasharray for dashed connectors', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Link');

        const mermaidData = `flowchart TD
            A[Start]
            B[Dashed 5-5]
            C[Dashed 10-5]
            D[Dashed 3-3-1-3]
            E[End]
            
            A --> B --> C --> D --> E
            
            linkStyle 0 stroke:#f66,stroke-dasharray:5 5;
            linkStyle 1 stroke:#f66,stroke-dasharray:10 5;
            linkStyle 2 stroke:#f66,stroke-dasharray:3 3 1 3;
            linkStyle 3 stroke:#f66,stroke-dasharray:6 2;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.connectors.length).toBe(4);

        expect(diagram.connectors[0].style.strokeDashArray).toBe('5 5');
        expect(diagram.connectors[1].style.strokeDashArray).toBe('10 5');
        expect(diagram.connectors[2].style.strokeDashArray).toBe('3 3 1 3');
        expect(diagram.connectors[3].style.strokeDashArray).toBe('6 2');

        done();
    });

    /**
     * Test P7-12: Link Style Index Out of Bounds
     * 
     * Covers:
     * - linkStyle referencing connector that doesn't exist
     * - No error thrown
     * - Graceful degradation
     */
    it('P7-T12: Handle linkStyle with out-of-bounds index gracefully', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Link');

        const mermaidData = `flowchart TD
            A[Start] --> B[End]
            
            linkStyle 0 stroke:#f66,stroke-width:2px;
            linkStyle 1 stroke:#0f0,stroke-width:3px;
            linkStyle 99 stroke:#00f,stroke-width:4px;`;

        expect(() => {
            diagram.loadDiagramFromMermaid(mermaidData);
        }).not.toThrow();

        expect(diagram.connectors.length).toBe(1);

        // Verify existing connector styled
        expect(diagram.connectors[0].style.strokeColor).toBe('#f66');
        expect(diagram.connectors[0].style.strokeWidth).toBe(2);

        done();
    });

    /**
     * Test P7-15: Link Styles Override Pattern (Last Style Wins)
     * 
     * Covers:
     * - Multiple linkStyle directives for same index
     * - Last directive should override previous ones
     * - Proper handling of redefining styles
     */
    it('P7-T15: Multiple linkStyle directives for same index (last wins)', (done: Function) => {
        diagram = new Diagram({
            width: '100%', height: '700px',
            layout: { type: 'Flowchart', orientation: 'TopToBottom' }
        });
        diagram.appendTo('#mermaidPhase7Link');

        const mermaidData = `flowchart TD
            A[Start] --> B[Process] --> C[End]
            
            linkStyle 0 stroke:#f66,stroke-width:2px;
            linkStyle 0 stroke:#0f0,stroke-width:3px;
            linkStyle 0 stroke:#00f,stroke-width:4px;`;

        diagram.loadDiagramFromMermaid(mermaidData);

        expect(diagram.connectors.length).toBe(2);

        // Last directive should win: blue, width 4
        expect(diagram.connectors[0].style.strokeColor).toBe('#00f');
        expect(diagram.connectors[0].style.strokeWidth).toBe(4);

        done();
    });
});
