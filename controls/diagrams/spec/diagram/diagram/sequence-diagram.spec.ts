import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';

describe('SequenceDiagram', () => {

    describe('MermaidUmlParser - parseActivation', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'seqDiagram_parseActivation' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px',
                height: '600px'
            });
            diagram.appendTo('#seqDiagram_parseActivation');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
        });

        it('should handle activate keyword', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                Alice->>Bob: Hello
                activate Bob
                Bob->>Alice: Hi
                deactivate Bob`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.nodes.length > 0).toBe(true);
            done();
        });

        it('should handle plus symbol for activation', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                Alice->>+Bob: Hello
                Bob->>-Alice: Hi`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.connectors.length >= 2).toBe(true);
            done();
        });

        it('should handle nested activations', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                participant Carol
                Alice->>+Bob: First
                Bob->>+Carol: Second
                Carol->>-Bob: Response
                Bob->>-Alice: Done`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.nodes.length >= 3).toBe(true);
            done();
        });

        it('should handle deactivate without previous activate', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                deactivate Bob`;
            
            // This should not throw and should handle gracefully
            expect(() => {
                diagram.loadDiagramFromMermaid(mermaidText);
            }).not.toThrow();
            done();
        });

        it('should handle activation with comments', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                %% Comment line
                Alice->>+Bob: Hello
                %% Another comment
                Bob->>-Alice: Hi`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.connectors.length >= 2).toBe(true);
            done();
        });
    });

    describe('MermaidUmlParser - parseFragment', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'seqDiagram_parseFragment' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px',
                height: '600px'
            });
            diagram.appendTo('#seqDiagram_parseFragment');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
        });

        it('should handle alt fragment with multiple conditions', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                alt Success
                    Alice->>Bob: Success
                else Failure
                    Alice->>Bob: Failure
                end`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.nodes.length > 2).toBe(true);
            done();
        });

        it('should handle nested fragments', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                participant Carol
                alt Outer
                    Alice->>Bob: First
                    alt Inner
                        Bob->>Carol: Second
                    end
                end`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.nodes.length >= 3).toBe(true);
            done();
        });

        it('should handle loop fragment', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                loop Daily Check
                    Alice->>Bob: Check
                    Bob->>Alice: Report
                end`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.nodes.length > 0).toBe(true);
            done();
        });

        it('should handle else if conditions in alt', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                alt If
                    Alice->>Bob: If
                else if Second
                    Alice->>Bob: Else if
                else
                    Alice->>Bob: Else
                end`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.nodes.length > 0).toBe(true);
            done();
        });
    });

    describe('MermaidUmlParser - removeActivationSymbols', () => {
        let diagram: Diagram;
        let ele: HTMLElement;

        beforeAll((): void => {
            ele = createElement('div', { id: 'seqDiagram_removeActivation' });
            document.body.appendChild(ele);
            diagram = new Diagram({
                width: '1000px',
                height: '600px'
            });
            diagram.appendTo('#seqDiagram_removeActivation');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
            diagram = null;
            ele = null;
        });

        it('should remove plus symbol from activation syntax', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                Alice->>+Bob: Activate`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.connectors.length > 0).toBe(true);
            done();
        });

        it('should remove minus symbol from deactivation syntax', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                Alice->>-Bob: Deactivate`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.connectors.length > 0).toBe(true);
            done();
        });

        it('should handle multiple symbol removals in sequence', (done: Function) => {
            const mermaidText: string = `sequenceDiagram
                participant Alice
                participant Bob
                participant Carol
                Alice->>+Bob: Act1
                Bob->>+Carol: Act2
                Carol->>-Bob: Deact2
                Bob->>-Alice: Deact1`;
            
            diagram.loadDiagramFromMermaid(mermaidText);
            expect(diagram.connectors.length >= 4).toBe(true);
            done();
        });
    });

});
