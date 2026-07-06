import { FlowShape, BasicShape } from '../objects/node';
import { NodeModel, BasicShapeModel, FlowShapeModel, BpmnShapeModel, PathModel, TextModel } from '../objects/node-model';
import { ConnectorModel } from '../objects/connector-model';
import { IGraph, ConnectorStyle, MermaidStyle } from '../objects/interface/interfaces';
import { DecoratorShapes, NodeConstraints } from '../enum/enum';
import { getConnectorArrowType } from '../utility/diagram-util';
import { FlowChartData } from '../data-binding/data-binding';
import { randomId } from '../utility/base-util';
import { Diagram } from '../diagram';
import { PointModel } from '../primitives/point-model';

/**
 * Interface for parsed @{shape} block data
 */
interface ParsedShape {
    shape: string;
    label: string;
    width?: number;
    height?: number;
    img?: string;
    pos?: string;
    constraint?: string;
}

/**
 * Interface for shape mapping data
 */
interface ShapeMapping {
    ej2Shape?: { type: string; shape: string; cornerRadius?: number };
    pathData?: string;
    showLabel?: boolean;
    bpmnEvent?: string;
    width?: number;
    height?: number;
    annotationMargin?: { left?: number; right?: number; top?: number; bottom?: number };
}

/**
 * Interface for click directive data
 */
interface ClickDirectiveData {
    nodeId: string;
    url: string;
    tooltip?: string;
    target?: string;
}

/**
 * Task 13: Interface for link style data
 */
interface LinkStyleData {
    strokeColor?: string;      // Connector stroke color (e.g., '#f00')
    strokeWidth?: number;      // Connector stroke width (e.g., 2)
    strokeDashArray?: string;  // Connector dash pattern (e.g., '5 5')
    color?: string;            // Connector annotation text color
}

/**
 * Converts the flowchart diagram to Mermaid format.
 * @param {Diagram} diagram - The diagram instance.
 * @returns {string} - The exported flowchart diagram as Mermaid data.
 */
export function saveFlowDiagramInMermaidFormat(diagram: Diagram): string {
    const existingIds: string[] = [];

    // Phase 5: Export orientation from diagram layout
    let orientationCode: string = 'TD'; // Default to Top-Down
    if (diagram.layout && diagram.layout.orientation === 'LeftToRight') {
        orientationCode = 'LR';
    }

    let mermaidCode: string = `flowchart ${orientationCode}\n`;
    const graph: IGraph = { nodes: diagram.nodes, edges: diagram.connectors };

    // Create a map of node labels for easy access
    // accumulator - The object that stores the node ID and label pairs.
    const nodeLabels: { [key: string]: string } = graph.nodes.reduce((accumulator: { [key: string]: string }, node: NodeModel) => {
        accumulator[node.id] = node.annotations.length ? node.annotations[0].content : '';
        return accumulator;
    }, {} as { [key: string]: string });

    // Iterate through edges to create connections and node definitions
    graph.edges.forEach((edge: ConnectorModel) => {
        const fromNodeId: string = edge.sourceID;
        const toNodeId: string = edge.targetID;
        const fromNodeLabel: string = nodeLabels[`${fromNodeId}`];
        const toNodeLabel: string = nodeLabels[`${toNodeId}`];
        const fromNode: NodeModel = diagram.nameTable[`${fromNodeId}`];
        const toNode: NodeModel = diagram.nameTable[`${toNodeId}`];
        let fromNodeShape: string = getNodeShape(fromNode, diagram);
        let toNodeShape: string = getNodeShape(toNode, diagram);
        const condition: string = (edge.annotations[0] && edge.annotations[0].content !== '') ? '|' + edge.annotations[0].content + '|' : '';

        if (existingIds.indexOf(fromNodeId) === -1) {
            existingIds.push(fromNodeId);
        } else {
            fromNodeShape = '';
        }
        if (existingIds.indexOf(toNodeId) === -1) {
            existingIds.push(toNodeId);
        } else {
            toNodeShape = '';
        }
        const arrow: string = arrowType(edge);
        mermaidCode += `    ${fromNodeId}${fromNodeShape} ${arrow}${condition} ${toNodeId}${toNodeShape}\n`;
    });

    // Bug Fix: Export isolated nodes (nodes without any connectors)
    // These nodes were only getting their style declarations but not their shape definitions
    graph.nodes.forEach((node: NodeModel) => {
        const nodeId: string = node.id;
        // If this node hasn't been exported yet (not involved in any connector), export it now
        if (existingIds.indexOf(nodeId) === -1) {
            const nodeShape: string = getNodeShape(node, diagram);
            mermaidCode += `    ${nodeId}${nodeShape}\n`;
            existingIds.push(nodeId);
        }
    });

    // Add styles for each node
    // Task 11 & 12: Export color and stroke-dasharray properties
    graph.nodes.forEach((node: NodeModel) => {
        const nodeId: string = node.id;
        const fill: string = node.style.fill;
        const stroke: string = node.style.strokeColor;
        const strokeWidth: string = `${node.style.strokeWidth}px`;
        let styleString: string = `    style ${nodeId} fill:${fill},stroke:${stroke},stroke-width:${strokeWidth}`;

        // Task 12: Append stroke-dasharray if present
        const strokeDashArray: string = node.style.strokeDashArray || '';
        if (strokeDashArray) {
            styleString += `,stroke-dasharray:${strokeDashArray}`;
        }

        // Task 11: Append color if annotation has color styling
        if (node.annotations && node.annotations.length > 0) {
            const annotationStyle: any = node.annotations[0].style;
            if (annotationStyle && annotationStyle.color) {
                styleString += `,color:${annotationStyle.color}`;
            }
        }

        styleString += ';\n';
        mermaidCode += styleString;
    });

    // Task 10 Extended: Export click directives for nodes with hyperlinks
    graph.nodes.forEach((node: NodeModel) => {
        if (node.annotations && node.annotations.length > 0) {
            const annotation: any = node.annotations[0];
            if (annotation.hyperlink && annotation.hyperlink.link) {
                const nodeId: string = node.id;
                const url: string = annotation.hyperlink.link;
                // Extract tooltip from node.tooltip if it exists
                const tooltip: string | undefined =
                    node.tooltip && (node.tooltip as any).content
                        ? (node.tooltip as any).content
                        : undefined;
                // Map hyperlinkOpenState to target: 'NewTab' → _blank, 'CurrentTab' → _self
                const target: string = annotation.hyperlink.hyperlinkOpenState === 'CurrentTab' ? '_self' : '_blank';

                if (tooltip) {
                    mermaidCode += `    click ${nodeId} "${url}" "${tooltip}" ${target}\n`;
                } else {
                    mermaidCode += `    click ${nodeId} "${url}" ${target}\n`;
                }
            }
        }
    });

    // Task 13: Export linkStyle directives for connectors with custom styling
    const linkStyleMap: Map<string, string[]> = new Map();  // Map from style string to list of indices
    let connIndex: number = 0;

    graph.edges.forEach((edge: ConnectorModel) => {
        const styleProps: string[] = [];

        // Collect stroke properties
        if (edge.style.strokeColor && edge.style.strokeColor !== '#000000') {
            styleProps.push(`stroke:${edge.style.strokeColor}`);
        }

        if (edge.style.strokeWidth && edge.style.strokeWidth !== 1) {
            styleProps.push(`stroke-width:${edge.style.strokeWidth}px`);
        }

        if (edge.style.strokeDashArray && edge.style.strokeDashArray !== '') {
            styleProps.push(`stroke-dasharray:${edge.style.strokeDashArray}`);
        }

        // Collect annotation color
        if (edge.annotations && edge.annotations.length > 0) {
            const annotStyle: any = edge.annotations[0].style;
            if (annotStyle && annotStyle.color) {
                styleProps.push(`color:${annotStyle.color}`);
            }
        }

        // If any custom styles exist, add to map
        if (styleProps.length > 0) {
            const styleString: string = styleProps.join(',');
            if (linkStyleMap.has(styleString)) {
                linkStyleMap.get(styleString)!.push(connIndex.toString());
            } else {
                linkStyleMap.set(styleString, [connIndex.toString()]);
            }
        }

        connIndex++;
    });

    // Export linkStyle directives
    linkStyleMap.forEach((indices: string[], styleString: string) => {
        const indexString: string = indices.join(',');
        mermaidCode += `    linkStyle ${indexString} ${styleString};\n`;
    });

    return mermaidCode;
}

/**
 * Returns the arrow type from connector
 * @param {ConnectorModel} edge - The connector edge
 * @returns {string} The arrow type
 */
function arrowType(edge: ConnectorModel): string {
    const sourceDecShape: DecoratorShapes = edge.sourceDecorator && edge.sourceDecorator.shape || 'None';
    const targetDecShape: DecoratorShapes = edge.targetDecorator && edge.targetDecorator.shape || 'None';
    const targetDecPathData: string = edge.targetDecorator && edge.targetDecorator.pathData || '';
    const sourceDecPathData: string = edge.sourceDecorator && edge.sourceDecorator.pathData || '';
    const strokeDash: string = edge.style.strokeDashArray;
    const strokeWidth: number = edge.style.strokeWidth;
    const opacity: number = edge.style.opacity;
    const crossPath: string = 'M 0,0 L 25,25 M 25,0 L 0,25';
    let arrow: string = '';

    if (opacity < 1) {
        arrow = '~~~';
    } else if (strokeDash !== '') {
        arrow = '-.->';
    // Task 6: Bidirectional patterns - check BEFORE single-end patterns
    // Both source and target decorators must be set for bidirectional arrows
    } else if (sourceDecShape === 'Arrow' && targetDecShape === 'Arrow') {
        arrow = '<-->';
    } else if (sourceDecShape === 'Circle' && targetDecShape === 'Circle') {
        arrow = 'o--o';
    } else if (sourceDecShape === 'Custom' && targetDecShape === 'Custom' &&
        sourceDecPathData === crossPath && targetDecPathData === crossPath) {
        // Both ends have cross decorator - verify pathData matches
        arrow = 'x--x';
    // Task 5: Circle and cross edge terminators - checked BEFORE the generic None / Arrow
    // branches to prevent 'Circle' from falling through to '---'.
    } else if (targetDecShape === 'Circle') {
        arrow = '--o';
    } else if (targetDecShape === 'Custom' && targetDecPathData === crossPath) {
        // Cross decorator - verify pathData matches the expected SVG path for X shape
        arrow = '--x';
    } else if (targetDecShape === 'Arrow') {
        arrow = strokeWidth > 1 ? '==>' : '-->';
    } else if (targetDecShape === 'None') {
        arrow = '---';
    } else {
        arrow = '-->';
    }

    return arrow;
}

/**
 * Returns the node shape based on the node model
 * @param {NodeModel} node - The node model
 * @param {Diagram} diagram - The diagram instance
 * @returns {string} The node shape
 */
function getNodeShape(node: NodeModel, diagram: Diagram): string {
    let label: string = '';

    // Task 10 Extended: Fallback to hyperlink content if annotation content is empty
    if (node.annotations && node.annotations.length > 0) {
        label = node.annotations[0].content || '';
        // If annotation content is empty, try to get it from hyperlink
        if (!label && node.annotations[0].hyperlink && (node.annotations[0].hyperlink as any).content) {
            label = (node.annotations[0].hyperlink as any).content;
        }
    }

    // Direct export of Image nodes by detecting shape.type === 'Image'
    // This handles both imported and programmatically-created image nodes
    if (node.shape && (node.shape as any).type === 'Image') {
        const imgSrc: string = (node.shape as any).source;
        if (imgSrc) {
            // Build dimensions part only if width or height exist
            let dimensionsPart: string = '';
            if (node.width && node.height) {
                dimensionsPart = `, w: ${node.width}, h: ${node.height}`;
            } else if (node.width) {
                dimensionsPart = `, w: ${node.width}`;
            } else if (node.height) {
                dimensionsPart = `, h: ${node.height}`;
            }

            // Build pos property only if label exists and has offset
            let posPart: string = '';
            if (label && node.annotations.length > 0) {
                const offset: PointModel | undefined = node.annotations[0].offset;
                // If offset.y < 0, label is above image → pos: t
                if (offset && offset.y < 0) {
                    posPart = ', pos: "t"';
                }
                // If offset.y > 1, it's default (below) → don't export pos explicitly
            }

            // Build label part only if label exists
            const labelPart: string = label ? `, label: "${label}"` : '';

            return `@{ img: "${imgSrc}"${dimensionsPart}${labelPart}${posPart} }`;
        }
    }

    // Enhancement 2: Export modern syntax if node was created from modern syntax
    if (node.addInfo && (node.addInfo as any).modernShapeName) {
        const modernShape: string = (node.addInfo as any).modernShapeName;
        // Support shapes with or without label
        const labelPart: string = label ? `, label: "${label}"` : '';
        return `@{ shape: ${modernShape}${labelPart} }`;
    }

    // Try to map EJ2 shape to modern syntax using reverse mapping
    // This handles dragged-and-dropped shapes (BPMN, Flow, etc.) that don't have modernShapeName
    if (node.shape && (node.shape as any).type) {
        const shapeType: string = (node.shape as any).type;
        const shapeName: string = (node.shape as any).shape || '';
        let mapKey: string = `${shapeType}|${shapeName}`;

        // For BPMN shapes, include the event type in the key to distinguish between different events
        // BPMN event is nested: shape.event.event (e.g., 'Start', 'End', 'Intermediate')
        if (shapeType === 'Bpmn' && (node.shape as any).event && (node.shape as any).event.event) {
            const bpmnEventType: string = (node.shape as any).event.event;
            mapKey = mapKey + `|${bpmnEventType}`;
        }

        const canonicalName: string | undefined = REVERSE_SHAPE_MAP.get(mapKey);

        if (canonicalName) {
            // Export as modern @{shape: ...} syntax
            // Always include label property, even if empty
            const labelPart: string = `, label: "${label}"`;
            return `@{ shape: ${canonicalName}${labelPart} }`;
        }
    }

    // Fallback for unmapped or path shapes - only reached if reverse mapping didn't find a match
    // This handles edge cases: custom shapes, legacy shapes, or path-based shapes
    if ((node.shape as PathModel).data) {
        // Handle path shapes with custom SVG data
        const data: string = (node.shape as PathModel).data;
        if (data === 'M 0 0 A 1 1 0 0 0 7 0 A 1 1 0 0 0 0 0 M -1 0 A 1 1 0 0 0 8 0 A 1 1 0 0 0 -1 0') {
            return '(((' + label + ')))';
        } else if (data === 'M 0 0 L 1 -1 L 5 -1 L 6 0 L 0 0') {
            return '[/' + label + '\\]';
        } else if (data === 'M 0 1 L 0 6 C 2 7 4 7 6 6 L 6 1 C 5 0 1 0 0 1 C 1 2 5 2 6 1') {
            return '[(' + label + ')]';
        } else if (data === 'M 0 0 L 12 0 L 14 2 L 2 2 L 0 0') {
            return '[\\' + label + '\\]';
        } else if (data === 'M 0 0 L 5 0 L 4 1 L 1 1 L 0 0') {
            return '[\\' + label + '/]';
        } else if (data === 'M 0 0 L 2 -2 L 11 -2 L 13 0 L 11 2 L 2 2 L 0 0') {
            return '{{' + label + '}}';
        } else {
            return '>' + label + ']';
        }
    }

    // Default fallback for any unmapped shapes - return simple rectangle bracket
    return '[' + label + ']';
}

/**
 * Task 7 & 8: Helper to robustly extract target node/group from line up to next arrow
 * Uses character-by-character parsing to handle:
 * - Node names with and without brackets/braces/parentheses
 * - Shape syntax like @{shape: odd}
 * - Node groups with ampersands like "b & c" or "b@{...} & c@{...}"
 * - Missing spaces before arrows like "c--> d"
 * @param {string} rightPart - Text after the first arrow
 * @returns {[string, string]} - [targetGroup, restOfLine]
 */
function extractTargetNode(rightPart: string): [string, string] {
    let target: string = '';
    let i: number = 0;
    let bracketLevel: number = 0;
    let bracketType: string = '';

    while (i < rightPart.length) {
        const char: string = rightPart[parseInt(i.toString(), 10)];
        const nextChar: string = i + 1 < rightPart.length ? rightPart[i + 1] : '';

        // Check if we're hitting an arrow (but not if it's a label separator |)
        const substring: string = rightPart.substring(i);
        if (substring.match(/^(o--\s*.*?\s*--o|x--\s*.*?\s*--x|-->|---|===|==>|~~~|\.->|-\.->|<-->|<===|<==|o--o|o--x|x--x|--o|--x|---o|---x|<--)/)) {
            // Found the next arrow, stop here
            break;
        }

        // Handle shape syntax @{...}
        if (char === '@' && nextChar === '{') {
            target += '@{';
            i += 2;
            let shapeLevel: number = 1;
            while (i < rightPart.length && shapeLevel > 0) {
                if (rightPart[parseInt(i.toString(), 10)] === '{') {
                    shapeLevel++;
                } else if (rightPart[parseInt(i.toString(), 10)] === '}') {
                    shapeLevel--;
                }
                target += rightPart[parseInt(i.toString(), 10)];
                i++;
            }
        }
        // Handle bracket/brace/paren context
        else if ((char === '[' || char === '{' || char === '(' || char === '>') && bracketLevel === 0) {
            bracketType = char;
            bracketLevel++;
            target += char;
            i++;
        } else if (char === '[' || char === '{' || char === '(') {
            // Nested opening bracket - just add it (increase depth handling)
            target += char;
            if (char === bracketType) {
                bracketLevel++;  // Another opening bracket of the same type
            }
            i++;
        }
        else if ((char === ']' && bracketType === '[') ||
                 (char === '}' && bracketType === '{') ||
                 (char === ')' && bracketType === '(') ||
                 (char === ']' && bracketType === '>')) {
            // Closing bracket for current context
            target += char;
            bracketLevel--;
            if (bracketLevel === 0) {
                bracketType = '';
            }
            i++;
        } else if (bracketLevel > 0) {
            // Inside brackets - add everything
            target += char;
            i++;
        }
        // Handle inline label syntax |...|
        else if (char === '|') {
            // Skip over the entire |label| block and continue to extract the node after it
            i++;  // Skip the opening |
            while (i < rightPart.length && rightPart[parseInt(i.toString(), 10)] !== '|') {
                i++;  // Skip label content
            }
            if (i < rightPart.length && rightPart[parseInt(i.toString(), 10)] === '|') {
                i++;  // Skip the closing |
            }
            // Continue to extract the actual node (will parse next iteration)
        }
        // Handle regular characters and spaces (including underscore, alphanumeric)
        else if (char === ' ' || char === '&' || /[a-zA-Z0-9_]/.test(char)) {
            target += char;
            i++;
        }
        else {
            // Unexpected character, stop
            break;
        }
    }

    const restOfLine: string = rightPart.substring(i).trim();
    return [target.trim(), restOfLine];
}

/**
 * Task 7: Expand one-line chaining syntax into individual connections
 * Detects patterns like `A --> B --> C` and expands into `A --> B` and `B --> C`
 * Handles labeled arrows: `A -- text --> B -- text2 --> C`
 * Handles ampersand groups: `a --> b & c --> d` → `a --> b`, `a --> c`, `b --> d`, `c --> d`
 * Supports all arrow types and node shapes including modern syntax `@{shape: odd}`
 * @param {string} line - The line containing potential chaining
 * @returns {string[]} Array of expanded lines (single line if no chaining detected)
 */
function expandChaining(line: string): string[] {
    const expandedLines: string[] = [];
    let currentLine: string = line;
    let iterationCount: number = 0;
    const maxIterations: number = 100; // Prevent infinite loops

    while (currentLine && iterationCount < maxIterations) {
        iterationCount++;

        // Split current line into: [leftNode, rightPart, arrowName, arrowLabel]
        const split: string[] = getLineSplitting(currentLine);
        const leftNode: string = split[0];
        const rightPart: string = split[1];
        const arrowName: string = split[2];
        const arrowLabel: string = split[3];

        // No arrow found - we're done
        if (!arrowName || !rightPart) {
            break;
        }

        // Use robust character-by-character extraction to handle shape syntax and missing spaces
        const [targetGroup, restOfLine] = extractTargetNode(rightPart);

        if (!targetGroup) {
            break;
        }

        // Reconstruct the arrow, including label if present
        let edgeArrow: string = '-->';  // default simple arrow
        if (arrowLabel) {
            // Use formats that the main regex will recognize with embedded labels
            // Main regex patterns: --\s*.*?\s*-->, ==\s*.*?\s*==>, \s*-\.\s*.*?\s*\.\s*->, etc.
            // IMPORTANT: For arrows without arrow heads (---, -.- , ~~~), preserve pipe-delimited format
            // so labels are extracted correctly on subsequent passes
            switch (arrowName) {
            case 'single-line-arrow':
                edgeArrow = `-- ${arrowLabel} -->`;
                break;
            case 'double-line-arrow':
                edgeArrow = `== ${arrowLabel} ==>`;
                break;
            case 'bidirectional-double-arrow':
                edgeArrow = `<== ${arrowLabel} ==>`;
                break;
            case 'dotted-arrow':
                edgeArrow = `-. ${arrowLabel} .->`;
                break;
            case 'single-line':
                // Use pipe-delimited format so regex recognizes it on next pass
                edgeArrow = `---|${arrowLabel}|`;
                break;
            case 'double-line':
                // Use pipe-delimited format for consistency
                edgeArrow = `===|${arrowLabel}|`;
                break;
            case 'wiggly-arrow':
                // Use pipe-delimited format so regex recognizes it on next pass
                edgeArrow = `~~~|${arrowLabel}|`;
                break;
            case 'dotted':
                // Use pipe-delimited format so regex recognizes it on next pass
                edgeArrow = `-.-|${arrowLabel}|`;
                break;
            case 'circle-endpoint':
                // Use 2-dash format to match regex pattern --\s*.*?\s*--o
                edgeArrow = `-- ${arrowLabel} --o`;
                break;
            case 'cross-endpoint':
                // Use 2-dash format to match regex pattern --\s*.*?\s*--x
                edgeArrow = `-- ${arrowLabel} --x`;
                break;
            case 'double-circle-endpoint':
                // Use double-dash format for double-line with circle decorator
                edgeArrow = `== ${arrowLabel} ==o`;
                break;
            case 'double-cross-endpoint':
                // Use double-dash format for double-line with cross decorator
                edgeArrow = `== ${arrowLabel} ==x`;
                break;
            case 'circle-endpoints':
                edgeArrow = `o-- ${arrowLabel} --o`;
                break;
            case 'cross-endpoints':
                edgeArrow = `x-- ${arrowLabel} --x`;
                break;
            case 'bidirectional':
                edgeArrow = `<-- ${arrowLabel} -->`;
                break;
            default:
                edgeArrow = `-- ${arrowLabel} -->`;
            }
        } else {
            // Unlabeled - map arrowName to symbol
            if (arrowName === 'single-line') {
                edgeArrow = '---';
            } else if (arrowName === 'double-line-arrow') {
                edgeArrow = '==>';
            } else if (arrowName === 'double-line') {
                edgeArrow = '===';
            } else if (arrowName === 'bidirectional-double-arrow') {
                edgeArrow = '<==>';
            } else if (arrowName === 'wiggly-arrow') {
                edgeArrow = '~~~';
            } else if (arrowName === 'dotted-arrow') {
                edgeArrow = '-.->';
            } else if (arrowName === 'dotted') {
                edgeArrow = '-.-';
            } else if (arrowName === 'circle-endpoint') {
                edgeArrow = '---o';
            } else if (arrowName === 'cross-endpoint') {
                edgeArrow = '---x';
            } else if (arrowName === 'double-circle-endpoint') {
                edgeArrow = '===o';
            } else if (arrowName === 'double-cross-endpoint') {
                edgeArrow = '===x';
            } else if (arrowName === 'circle-endpoints') {
                edgeArrow = 'o--o';
            } else if (arrowName === 'cross-endpoints') {
                edgeArrow = 'x--x';
            } else if (arrowName === 'bidirectional') {
                edgeArrow = '<-->';
            } else {
                edgeArrow = '-->';  // default fallback
            }
        }

        // Check if targetGroup contains ampersands (group)
        if (targetGroup.includes('&')) {
            // Parse the group and create edges to each node in the group
            const groupNodes: string[] = parseNodeGroup(targetGroup);
            for (let g: number = 0; g < groupNodes.length; g++) {
                const expandedLine: string = `${leftNode} ${edgeArrow} ${groupNodes[parseInt(g.toString(), 10)]}`;
                expandedLines.push(expandedLine);
            }
        } else {
            // Single target node
            const expandedLine: string = `${leftNode} ${edgeArrow} ${targetGroup}`;
            expandedLines.push(expandedLine);
        }

        // If no more content, stop
        if (!restOfLine) {
            break;
        }

        // Continue processing with: targetGroup + restOfLine
        // This ensures we process the next edge with the correct continuation
        currentLine = `${targetGroup} ${restOfLine}`;
    }

    const result: string[] = expandedLines.length > 0 ? expandedLines : [line];
    return result;
}

/**
 * Task 8: Extract node list from expression
 * Parses comma or ampersand-separated node identifiers
 * Handles bracketed nodes like `[Input]` or `{Decision}`
 * IMPORTANT: Ampersand is only a separator if it has spaces around it ( & )
 *            Without spaces (a&b), it's part of the node ID
 * Example: `A & B` → `["A", "B"]`, `a&b` → `["a&b"]`, `[Node1] & [Node2]` → `["[Node1]", "[Node2]"]`
 * @param {string} expr - The node group expression
 * @returns {string[]} Array of individual node identifiers
 */
function parseNodeGroup(expr: string): string[] {
    const nodes: string[] = [];
    let current: string = '';
    let bracketLevel: number = 0;
    let bracket: string = '';

    for (let i: number = 0; i < expr.length; i++) {
        const char: string = expr[parseInt(i.toString(), 10)];
        const prevChar: string = i > 0 ? expr[i - 1] : '';
        const nextChar: string = i + 1 < expr.length ? expr[i + 1] : '';

        // Check for shape syntax @{...} - skip it entirely
        if (char === '@' && nextChar === '{') {
            current += '@{';
            i += 2;  // Skip @ and {
            let shapeLevel: number = 1;
            while (i < expr.length && shapeLevel > 0) {
                if (expr[parseInt(i.toString(), 10)] === '{') {
                    shapeLevel++;
                } else if (expr[parseInt(i.toString(), 10)] === '}') {
                    shapeLevel--;
                }
                current += expr[parseInt(i.toString(), 10)];
                i++;
            }
            continue;  // Continue from after the closing }
        }

        if (char === '[' || char === '{' || char === '(') {
            bracket = char;
            bracketLevel++;
            current += char;
        } else if ((char === ']' && bracket === '[') ||
                   (char === '}' && bracket === '{') ||
                   (char === ')' && bracket === '(')) {
            bracketLevel--;
            current += char;
            if (bracketLevel === 0) {
                bracket = '';
            }
        } else if (bracketLevel === 0) {
            // Handle separators only at top level
            if (char === ' ' || char === ',') {
                // Space or comma is always a separator
                const trimmed: string = current.trim();
                if (trimmed) {
                    nodes.push(trimmed);
                }
                current = '';
            } else if (char === '&') {
                // Ampersand is a separator ONLY if surrounded by spaces (or at boundaries with spaces)
                // Check if & has space before or after it
                const spaceBefore: boolean = prevChar === ' ' || prevChar === '';
                const spaceAfter: boolean = nextChar === ' ' || nextChar === '';

                if (spaceBefore && spaceAfter) {
                    // & with spaces = group operator separator
                    const trimmed: string = current.trim();
                    if (trimmed) {
                        nodes.push(trimmed);
                    }
                    current = '';
                } else {
                    // & without spaces = part of node ID
                    current += char;
                }
            } else {
                current += char;
            }
        } else {
            // Inside brackets - add everything
            current += char;
        }
    }

    const trimmed: string = current.trim();
    if (trimmed) {
        nodes.push(trimmed);
    }

    return nodes.length > 0 ? nodes : [expr];
}

/**
 * Task 8: Handle ampersand expansion in a line with potential labels
 * Detects pattern: `nodeGroup & nodeGroup --> nodeGroup & nodeGroup`
 * Only handles SINGLE-arrow lines. Multi-arrow lines should be pre-processed via expandChaining.
 * Returns expanded lines, or original line if no ampersand detected
 * @param {string} line - The line to process (should contain at most one arrow)
 * @returns {string[]} Array of expanded or original line
 */
function expandAmpersandSyntax(line: string): string[] {
    // Check if line contains ampersand with spaces ( & ) outside brackets (and outside @{...} shape syntax)
    // Ampersands without spaces (a&b) are NOT group operators, they're part of node IDs
    let bracketLevel: number = 0;
    let hasTopLevelAmpersand: boolean = false;

    for (let i: number = 0; i < line.length; i++) {
        const char: string = line[parseInt(i.toString(), 10)];
        const prevChar: string = i > 0 ? line[i - 1] : '';
        const nextChar: string = i + 1 < line.length ? line[i + 1] : '';

        // Check for shape syntax @{...} - these braces are NOT bracket context
        if (char === '@' && nextChar === '{') {
            // Skip the @{...} entirely - find the closing brace
            i += 2;  // Skip @ and {
            let shapeLevel: number = 1;
            while (i < line.length && shapeLevel > 0) {
                if (line[parseInt(i.toString(), 10)] === '{') {
                    shapeLevel++;
                } else if (line[parseInt(i.toString(), 10)] === '}') {
                    shapeLevel--;
                }
                i++;
            }
            i--;  // Back up one since the loop will increment
            continue;
        }

        if (char === '[' || char === '{' || char === '(') {
            bracketLevel++;
        } else if (char === ']' || char === '}' || char === ')') {
            bracketLevel--;
        } else if (char === '&' && bracketLevel === 0) {
            // Ampersand is a group operator ONLY if it has spaces around it
            const spaceBefore: boolean = prevChar === ' ';
            const spaceAfter: boolean = nextChar === ' ';
            if (spaceBefore && spaceAfter) {
                hasTopLevelAmpersand = true;
                break;
            }
        }
    }

    if (!hasTopLevelAmpersand) {
        return [line];
    }

    // Use getLineSplitting to properly extract arrow with labels
    const split: string[] = getLineSplitting(line);
    const leftSide: string = split[0];
    const rightSide: string = split[1];
    const arrowName: string = split[2];
    const arrowLabel: string = split[3];

    if (!arrowName || !rightSide) {
        return [line];
    }

    // Reconstruct the full arrow string with label if present
    let fullArrow: string = '';
    if (arrowLabel) {
        // Reconstruct labeled arrow based on arrow type
        // IMPORTANT: For arrows without arrow heads (---, -.- , ~~~), preserve pipe-delimited format
        // so labels are extracted correctly on subsequent parses
        if (arrowName === 'single-line-arrow') {
            fullArrow = `-- ${arrowLabel} -->`;
        } else if (arrowName === 'double-line-arrow') {
            fullArrow = `== ${arrowLabel} ==>`;
        } else if (arrowName === 'bidirectional-double-arrow') {
            fullArrow = `<== ${arrowLabel} ==>`;
        } else if (arrowName === 'dotted-arrow') {
            fullArrow = `-. ${arrowLabel} .->`;
        } else if (arrowName === 'single-line') {
            // Use pipe-delimited format for consistency
            fullArrow = `---|${arrowLabel}|`;
        } else if (arrowName === 'double-line') {
            // Use pipe-delimited format for consistency
            fullArrow = `===|${arrowLabel}|`;
        } else if (arrowName === 'wiggly-arrow') {
            // Use pipe-delimited format
            fullArrow = `~~~|${arrowLabel}|`;
        } else if (arrowName === 'dotted') {
            // Use pipe-delimited format
            fullArrow = `-.-|${arrowLabel}|`;
        } else if (arrowName === 'circle-endpoint' || arrowName === 'circle-endpoints') {
            fullArrow = `-- ${arrowLabel} --o`;  // Preserve arrow type format with label
        } else if (arrowName === 'cross-endpoint' || arrowName === 'cross-endpoints') {
            fullArrow = `-- ${arrowLabel} --x`;  // Preserve arrow type format with label
        } else if (arrowName === 'double-circle-endpoint') {
            fullArrow = `== ${arrowLabel} ==o`;  // Preserve double-line format with circle
        } else if (arrowName === 'double-cross-endpoint') {
            fullArrow = `== ${arrowLabel} ==x`;  // Preserve double-line format with cross
        } else if (arrowName === 'bidirectional') {
            fullArrow = `<-- ${arrowLabel} -->`;
        } else {
            fullArrow = `-- ${arrowLabel} -->`;  // Default: use standard format
        }
    } else {
        // Unlabeled - map arrowName to symbol
        if (arrowName === 'single-line') {
            fullArrow = '---';
        } else if (arrowName === 'double-line-arrow') {
            fullArrow = '==>';
        } else if (arrowName === 'double-line') {
            fullArrow = '===';
        } else if (arrowName === 'bidirectional-double-arrow') {
            fullArrow = '<==>';
        } else if (arrowName === 'wiggly-arrow') {
            fullArrow = '~~~';
        } else if (arrowName === 'dotted-arrow') {
            fullArrow = '-.->';
        } else if (arrowName === 'dotted') {
            fullArrow = '-.-';
        } else if (arrowName === 'circle-endpoint') {
            fullArrow = '---o';
        } else if (arrowName === 'cross-endpoint') {
            fullArrow = '---x';
        } else if (arrowName === 'double-circle-endpoint') {
            fullArrow = '===o';
        } else if (arrowName === 'double-cross-endpoint') {
            fullArrow = '===x';
        } else if (arrowName === 'circle-endpoints') {
            fullArrow = 'o--o';
        } else if (arrowName === 'cross-endpoints') {
            fullArrow = 'x--x';
        } else if (arrowName === 'bidirectional') {
            fullArrow = '<-->';
        } else {
            fullArrow = '-->';  // Default
        }
    }

    // Parse node groups on both sides
    const lhsNodes: string[] = parseNodeGroup(leftSide);
    const rhsNodes: string[] = parseNodeGroup(rightSide);

    // Generate cross product
    const expanded: string[] = [];
    for (let i: number = 0; i < lhsNodes.length; i++) {
        for (let j: number = 0; j < rhsNodes.length; j++) {
            expanded.push(`${lhsNodes[parseInt(i.toString(), 10)]} ${fullArrow} ${rhsNodes[parseInt(j.toString(), 10)]}`);
        }
    }
    return expanded;
}

/**
 * Split a line by statement-level ampersands
 * Only splits if ampersands appear to separate DISTINCT arrows, not if they're between arrows
 * Example statement-level: `a --> b & c --> d` where & is BETWEEN two statements should be:
 *   a --> (b & c) --> d (group operator, NOT statement split)
 * True statement-level would be: `a --> b & y --> z` where b and y are unrelated
 *
 * Decision: Keep ampersands as group operators in chained expressions.
 * Only split when we have consecutive non-chained statements like `a --> b; c --> d`
 *
 * For now, return the line as-is since ampersands are handled by expandAmpersandSyntax
 * @param {string} line - The line to analyze
 * @returns {string[]} Array of statement clauses (or single line)
 */
function splitStatementLevelAmpersands(line: string): string[] {
    // Don't split by ampersand - it's a group operator, not a statement separator
    // The expandChaining + expandAmpersandSyntax pipeline will handle it correctly
    return [line];
}

/**
 * Join multiline statements into single lines.
 * Handles line breaks within connector syntax: A --> \n B, A \n --> B, etc.
 * Also handles chaining breaks: A --> B --> \n C
 * Preserves directives, comments, and empty lines as boundaries.
 * @param {string[]} lines - Array of lines to join
 * @returns {string[]} Array with multiline statements joined
 */
function joinMultilineStatements(lines: string[]): string[] {
    const joinedLines: string[] = [];
    let i: number = 0;
    const directivePrefixes: string[] = ['%', 'style', 'linkStyle', 'click', 'subgraph', 'graph', 'flowchart', 'diagram', 'end', 'End'];

    while (i < lines.length) {
        let currentLine: string = lines[parseInt(i.toString(), 10)].trim();

        // Keep directives, comments, and empty lines as boundaries
        if (currentLine === '' || directivePrefixes.some((prefix: string) => currentLine.startsWith(prefix))) {
            joinedLines.push(currentLine);
            i++;
            continue;
        }

        // Try joining with subsequent lines
        while (i + 1 < lines.length) {
            const nextLine: string = lines[i + 1].trim();

            // Stop joining at directives, comments, or empty lines
            if (nextLine === '' || directivePrefixes.some((prefix: string) => nextLine.startsWith(prefix))) {
                break;
            }

            // Join if current line ends with arrow-like char OR next line starts with arrow-like char
            // Arrow characters: - = ~ | > < and decorators: x o
            const currentEndsWithArrow: boolean = /[-=~|>xo]$/.test(currentLine);
            const nextStartsWithArrow: boolean = /^[-=~|<>xo]/.test(nextLine);

            if (currentEndsWithArrow || nextStartsWithArrow) {
                currentLine = currentLine + ' ' + nextLine;
                i++;
            } else {
                break;
            }
        }

        joinedLines.push(currentLine);
        i++;
    }

    return joinedLines;
}

/**
 * Bug Fix: Quote-aware version of `data.replace(/;(?!\s*[\n\r])/g, ';\n')`.
 *
 * The previous regex blindly inserted a newline after every `;` that wasn't already
 * followed by whitespace+newline. That broke labels containing semicolons inside
 * double-quoted strings, e.g.:
 *   A["A double quote:#quot;"] --> B["A dec char:#9829;"]
 * was rewritten as:
 *   A["A double quote:#quot;
 *   "] --> B["A dec char:#9829;
 *   "]
 * which created spurious empty nodes and broke the connector.
 *
 * This implementation walks the string while tracking whether we are inside a
 * double-quoted label. Only semicolons OUTSIDE of quotes are treated as statement
 * terminators and get a newline appended.
 *
 * @param {string} input - The raw Mermaid source text.
 * @returns {string} Source with a newline inserted after each statement-terminating semicolon.
 */
function insertNewlineAfterStatementSemicolons(input: string): string {
    let result: string = '';
    let inQuotes: boolean = false;
    for (let i: number = 0; i < input.length; i++) {
        const ch: string = input[parseInt(i.toString(), 10)];
        // Toggle quote state on unescaped double quotes
        if (ch === '"' && (i === 0 || input[i - 1] !== '\\')) {
            inQuotes = !inQuotes;
            result += ch;
            continue;
        }
        if (ch === ';' && !inQuotes) {
            result += ';';
            // Look ahead: if the next non-space char is not already a newline, insert one
            let j: number = i + 1;
            while (j < input.length && (input[parseInt(j.toString(), 10)] === ' ' || input[parseInt(j.toString(), 10)] === '\t')) {
                j++;
            }
            const nextCh: string = j < input.length ? input[parseInt(j.toString(), 10)] : '';
            if (nextCh !== '\n' && nextCh !== '\r' && nextCh !== '') {
                result += '\n';
            }
            continue;
        }
        result += ch;
    }
    return result;
}

/**
 * To convert the Mermaid data to flowchart diagram
 * @param {string} data - The Mermaid data to be converted to a flowchart diagram.
 * @param {Diagram} diagram - The diagram instance.
 * @returns {void}
 */
export function convertMermaidToFlowChart(data: string, diagram: Diagram): void {
    let dataCollection: FlowChartData[] = [];
    diagram.clear();
    //95490: Error while loading Mermaid diagram
    //Ensure every statement ends with a semicolon and newline, unless it's already followed by a newline.
    // Bug Fix: Quote-aware semicolon-newline insertion. Do NOT insert a newline after a `;`
    // that appears inside a double-quoted label like ["...:#quot;"] or ["...:#9829;"], because
    // those semicolons are part of HTML entities / label content, not statement terminators.
    data = insertNewlineAfterStatementSemicolons(data);
    const lines: string[] = data.trim().split('\n');

    // Join multiline statements to handle line breaks in connectors
    const joinedLines: string[] = joinMultilineStatements(lines);

    // Phase 5: Parse orientation from first line (e.g., 'flowchart TB', 'graph LR')
    let orientation: string | null = null;
    for (let i: number = 0; i < joinedLines.length; i++) {
        const trimmedLine: string = joinedLines[parseInt(i.toString(), 10)].trim();
        // Skip comment lines and empty lines
        if (trimmedLine.startsWith('%') || trimmedLine === '') {
            continue;
        }
        // Try to parse orientation from this line
        orientation = parseOrientationDirective(trimmedLine);
        // If we found orientation or hit non-directive content, stop searching
        if (orientation !== null || (!trimmedLine.startsWith('flowchart') && !trimmedLine.startsWith('graph') && !trimmedLine.startsWith('diagram'))) {
            break;
        }
    }

    for (let i: number = 0; i < joinedLines.length; i++) {
        let line: string = joinedLines[parseInt(i.toString(), 10)];
        line = line.trim();
        //Remove trailing semicolon if the line does not start with "style" to avoid showing it as a node annotation.
        if (line.endsWith(';') && !line.startsWith('style')) {
            line = line.slice(0, -1).trim();
        }
        // Skip lines that start with specific prefixes
        // "%" - comment line, "end/End" - end of a subgraph/graph
        // "subgraph", "graph", "flowchart" - Not supported by diagram
        // "linkStyle", "style", "click" - Directives (handled separately)
        // IMPORTANT: Use word-boundary matching for keywords to allow them as node IDs
        // e.g., end@{...} should NOT be skipped, but 'end' alone or 'end;' should be
        const isSkipDirective: (lineToCheck: string) => boolean = (lineToCheck: string) => {
            // '%' - comment line (special character, no word boundary needed)
            if (lineToCheck.startsWith('%')) {
                return true;
            }
            // Keywords that need word boundary: only skip if followed by whitespace, semicolon, or end-of-line
            // This allows keywords to be used as node IDs when followed by node syntax like @{...}
            // Bug 5 Fix: Added classDef to skip class definition directives
            const keywordPattern: RegExp = /^(subgraph|graph|flowchart|end|End|classDef)(?:\s|;|$)/;
            return keywordPattern.test(lineToCheck);
        };
        if (line !== '' && !isSkipDirective(line)) {
            if (line.startsWith('style')) {
                parseStyle(line, dataCollection);
            } else if (line.startsWith('linkStyle')) {
                // Task 13: linkStyle directives are already parsed above, skip here
                // to avoid creating unwanted nodes
                continue;
            } else if (line.match(/^e\d*@\s*\{.*\}\s*;?\s*$/)) {
                // Bug 3 Fix: Skip edge style directives on separate lines like "e1@{ curve: linear }"
                // These unsupported directives should not create nodes
                continue;
            } else if (line.match(/^e\d+@/)) {
                // Bug 3 Fix: Skip standalone edge ID directives like "e1@" (with no content after)
                // These are unsupported syntax that should not create nodes
                continue;
            } else if (line.startsWith('click')) {
                // Task 10: Parse click directive for clickable nodes with URLs
                const clickData: ClickDirectiveData | null = parseClickDirective(line);
                if (clickData) {
                    // Find the node in dataCollection and apply click data
                    const targetNode: FlowChartData | undefined =
                        dataCollection.find((data: FlowChartData) => data.id === clickData.nodeId);
                    if (targetNode) {
                        targetNode.clickUrl = clickData.url;
                        targetNode.clickTooltip = clickData.tooltip;
                        targetNode.clickTarget = clickData.target || '_self';  // Default to _self if not specified
                    }
                }
            } else {
                // Task 8: First split by statement-level ampersands (e.g., `a --> b & c --> d` → `[a --> b, c --> d]`)
                const statementClauses: string[] = splitStatementLevelAmpersands(line);

                // Task 7 & 8: For each statement, expand chaining and then ampersand syntax
                for (let k: number = 0; k < statementClauses.length; k++) {
                    const expandedLines: string[] = expandChaining(statementClauses[parseInt(k.toString(), 10)]);
                    const allExpanded: string[] = [];

                    // For each chaining-expanded line, apply ampersand expansion (node-group operators)
                    for (let j: number = 0; j < expandedLines.length; j++) {
                        const ampExpanded: string[] = expandAmpersandSyntax(expandedLines[parseInt(j.toString(), 10)]);
                        allExpanded.push(...ampExpanded);
                    }

                    // Process all expanded lines
                    for (let j: number = 0; j < allExpanded.length; j++) {
                        let lineToProcess: string = allExpanded[parseInt(j.toString(), 10)];
                        // Bug 3 Fix: Strip edge IDs (e.g., "A e1@--> B" → "A --> B")
                        // Edge IDs like e1@, e2@ are unsupported syntax - remove them before processing
                        // Pattern: word followed by @ before arrow characters
                        lineToProcess = lineToProcess.replace(/(\w+)\s*e\d*@\s*(-->|---|<-->|<==>|=+>+|~+>+|-+>+|\.+-+>)/g, '$1 $2');
                        // Bug 5 Fix: Strip class association syntax :::classname from edges
                        // e.g., "A:::someclass --> B" → "A --> B"
                        lineToProcess = lineToProcess.replace(/:::\w+\s*(-->|---|<-->|<==>|=+>+|~+>+|-+>+|\.+-+>)/g, ' $1');
                        lineToProcess = lineToProcess.replace(/:::\w+/g, '');
                        const lineSplit: string[] = getLineSplitting(lineToProcess);
                        const parts: string[] = [lineSplit[0], lineSplit[1]];
                        const expandedData: FlowChartData[] = getNodeData(parts, dataCollection, lineSplit[2], diagram);
                        const sourceId: string = lineSplit[0];
                        const targetId: string = lineSplit[1];
                        const connectorLabel: string = lineSplit[3];

                        // Extract just the node ID from targetId (remove brackets/braces/parens)
                        // e.g., "D[Laptop]" -> "D", "X{Decision}" -> "X", "Y(Process)" -> "Y"
                        const targetIdParts: string[] = splitNested(targetId);
                        const actualTargetId: string | null = targetIdParts.length > 0 && targetIdParts[0] !== undefined
                            ? targetIdParts[0].trim()
                            : null;

                        // Set arrow type on newly created nodes
                        if (expandedData && expandedData.length > 0) {
                            // NEW nodes were created - search for target using actualTargetId (without brackets)
                            const targetData: FlowChartData | undefined =
                                (expandedData && expandedData.find((d: FlowChartData) => d.id === actualTargetId)) ||
                                dataCollection.find((d: FlowChartData) => d.id === actualTargetId);

                            if (targetData) {
                                targetData.arrowType = lineSplit[2];
                            }
                        } else {
                            // Both source and target already exist - set arrow type on target
                            const targetNode: FlowChartData | undefined = dataCollection.find(
                                (data: FlowChartData) => data.id === actualTargetId
                            );
                            if (targetNode) {
                                targetNode.arrowType = lineSplit[2];
                            }
                        }

                        // Apply connector label to the TARGET node (works for both new and existing nodes)
                        // Remove any surrounding double quotes from connector label
                        const cleanLabel: string = connectorLabel.replace(/^"|"$/g, '');
                        if (cleanLabel !== '') {
                            // Find target node using actualTargetId (extracted ID without brackets)
                            let targetNode: FlowChartData | undefined = dataCollection.find(
                                (data: FlowChartData) => data.id === actualTargetId
                            );
                            if (!targetNode && expandedData && expandedData.length > 0) {
                                targetNode = expandedData.find((data: FlowChartData) => data.id === actualTargetId);
                            }

                            if (targetNode) {
                                // Find the index of THIS source in the parentId array
                                const parentIdArray: string[] = targetNode.parentId as string[];
                                let parentIndex: number = parentIdArray.indexOf(sourceId);
                                // If source not found by index search, use the last position
                                if (parentIndex < 0 && parentIdArray.length > 0) {
                                    parentIndex = parentIdArray.length - 1;
                                }
                                if (parentIndex >= 0) {
                                    if (Array.isArray(targetNode.label)) {
                                        (targetNode.label as string[])[parseInt(parentIndex.toString(), 10)] = cleanLabel;
                                    }
                                }
                            }
                        }

                        // Add newly created nodes to dataCollection
                        if (expandedData && expandedData.length > 0) {
                            expandedData.filter((flowData: FlowChartData) =>
                                flowData.parentId && flowData.parentId.length === 0).forEach((node: FlowChartData): void => {
                                node.parentId = null;
                            });
                            dataCollection = dataCollection.concat(expandedData);
                        }
                    }
                }
            }
        }
    }
    // Task 13: Create a map to store link styles indexed by connector appearance order
    // Keys: 'default' for all connectors, numeric indices for specific connectors, or '-' for last connector
    // Values: LinkStyleData with stroke, width, dash, color properties
    const linkStyles: Map<string, LinkStyleData> = new Map();

    // Parse linkStyle directives and populate the map
    for (let i: number = 0; i < joinedLines.length; i++) {
        let line: string = joinedLines[parseInt(i.toString(), 10)];
        line = line.trim();
        if (line.startsWith('linkStyle')) {
            parseLinkStyle(line, linkStyles);
        }
    }

    createFlowChart(dataCollection, diagram, orientation, linkStyles);
    diagram.doLayout();
    diagram.clearHistory();
}

/**
 * To convert the dataCollection into flowchart nodes and connectors
 * @param { FlowChartData[] } dataCollection - The data collection to be converted to flowchart nodes and connectors.
 * @param { Diagram } diagram - The diagram instance.
 * @param { string | null } orientation - The orientation of the flowchart (optional).
 * @param { Map<string, LinkStyleData> } linkStyles - Map of link styles indexed by target (optional).
 * @returns {void}
 */
function createFlowChart(
    dataCollection: FlowChartData[],
    diagram: Diagram,
    orientation?: string | null,
    linkStyles?: Map<string, LinkStyleData>
): void {
    // Phase 5: Apply orientation to diagram layout
    if (orientation) {
        if (diagram.layout) {
            diagram.layout.orientation = orientation === 'LR' ? 'LeftToRight' : 'TopToBottom';
        }
    }

    const flowchartNodesAndConnectors: NodeModel[] | ConnectorModel[] = [];
    for (let n: number = 0; n < dataCollection.length; n++) {
        const data: FlowChartData = dataCollection[parseInt(n.toString(), 10)];

        // Check if this is a Text node
        const isTextNode: boolean | '' = data.shape && (data.shape as any).type === 'Text';

        // Phase 2: For text nodes, put label in content; for others use annotations
        let nodeShape: any = data.shape as BasicShapeModel | FlowShapeModel | BpmnShapeModel | TextModel;
        let annotations: any[] = [];
        let node: NodeModel;

        if (isTextNode && data.showLabel !== false) {
            // For text nodes, set content directly in shape
            nodeShape = { type: 'Text', content: data.name };
        } else if (data.showLabel !== false) {
            // For other nodes, use annotations
            annotations = [{ content: data.name, margin: data.annotationMargin }];
        }
        if (data.imageSource) {
            // Initial width / height from Mermaid syntax
            let imgW: number | undefined =
                data.imageWidth !== undefined ? data.imageWidth : undefined;
            const imgH: number | undefined =
                data.imageHeight !== undefined ? data.imageHeight : undefined;

            // Apply image constraint rules
            if (data.imageConstraint === 'on') {
                if (imgW !== undefined && imgH !== undefined) {
                    imgW = imgH;
                } else if (imgH !== undefined) {
                    imgW = imgH;
                }
            }
            // Task 4 Extended: Apply annotation offset based on label position
            if (annotations.length > 0) {
                if (data.imageLabelPos === 't') {
                    // pos: t → label above image
                    annotations[0].offset = { x: 0.5, y: -0.2 };
                } else {
                    // pos: b or undefined → label below image (default)
                    annotations[0].offset = { x: 0.5, y: 1.2 };
                }
            }
            node = {
                id: data.id,
                shape: { type: 'Image', source: data.imageSource, scale: 'None' } as any,
                width: imgW,
                height: imgH,
                annotations: annotations,
                style: { fill: 'transparent', strokeColor: data.stroke, strokeWidth: data.strokeWidth, strokeDashArray: data.strokeDashArray || '' },
                addInfo: { modernShapeName: data.modernShapeName || 'image', imageSource: data.imageSource }
            };
        } else {
            node = {
                id: data.id,
                shape: nodeShape,
                annotations: annotations,
                style: { fill: data.color, strokeColor: data.stroke, strokeWidth: data.strokeWidth, strokeDashArray: data.strokeDashArray || '' },
                addInfo: data.modernShapeName ? { modernShapeName: data.modernShapeName } : undefined
            };
            // Apply shape dimensions from mapping if available
            if (data.width !== undefined) {
                node.width = data.width;
            }
            if (data.height !== undefined) {
                node.height = data.height;
            }
            // Apply corner radius if available
            if (data.cornerRadius !== undefined && nodeShape && typeof nodeShape === 'object') {
                (nodeShape as any).cornerRadius = data.cornerRadius;
            }
        }

        // Task 11: Apply text color to annotation if specified
        if (data.textColor && annotations.length > 0) {
            annotations[0].style = annotations[0].style || {};
            annotations[0].style.color = data.textColor;
        }

        // Task 10: Apply click directive data (URL and tooltip)
        if (data.clickUrl) {
            // Set hyperlink on annotation with proper display content (node label/id, not the URL)
            if (annotations.length > 0) {
                const hyperlinkOpenState: string = data.clickTarget === '_self' ? 'CurrentTab' : 'NewTab';
                annotations[0].hyperlink = {
                    link: data.clickUrl,
                    content: data.name || data.id,  // Display the node name/id, not the URL
                    textDecoration: 'Underline',
                    hyperlinkOpenState: hyperlinkOpenState  // EJ2 property: 'CurrentTab' or 'NewTab'
                };
            }

            // Add Tooltip constraint to enable tooltip display
            if (!node.constraints) {
                node.constraints = NodeConstraints.Default | NodeConstraints.Tooltip;
            } else {
                node.constraints = node.constraints | NodeConstraints.Tooltip;
            }
        }

        // Set tooltip on node if clickTooltip is provided
        if (data.clickTooltip) {
            node.tooltip = {
                content: data.clickTooltip
            };

            // Ensure Tooltip constraint is set for tooltip display
            if (!node.constraints) {
                node.constraints = NodeConstraints.Default | NodeConstraints.Tooltip;
            } else {
                node.constraints = node.constraints | NodeConstraints.Tooltip;
            }
        }

        (flowchartNodesAndConnectors as NodeModel[]).push(node);
    }

    // Task 13: Track connector index for link style application
    let connectorIndex: number = 0;
    let lastConnectorRef: ConnectorModel | null = null;

    for (let c: number = 0; c < dataCollection.length; c++) {
        const data: FlowChartData = dataCollection[parseInt(c.toString(), 10)];
        const connectorStyle: ConnectorStyle = getConnectorArrowType(data) as ConnectorStyle;
        if (data.parentId && data.parentId.length > 1) {
            for (let i: number = 0; i < data.parentId.length; i++) {
                const connector: ConnectorModel = {
                    id: randomId(),
                    sourceID: data.parentId[parseInt(i.toString(), 10)] as string,
                    targetID: data.id,
                    annotations: [{ content: data.label ? data.label[parseInt(i.toString(), 10)] : '' }],
                    style: {
                        strokeWidth: connectorStyle.strokeWidth ? connectorStyle.strokeWidth : 1,
                        strokeDashArray: connectorStyle.strokeDashArray ? connectorStyle.strokeDashArray : '',
                        opacity: connectorStyle.opacity !== undefined ? connectorStyle.opacity : 1
                    }

                };
                // Task 6: Apply decorators for THIS SPECIFIC parent (index i)
                // Each parent can have different decorators stored in arrays
                if (data.sourceDecorators && data.sourceDecorators[parseInt(i.toString(), 10)]) {
                    const sourceDecShape: DecoratorShapes = data.sourceDecorators[parseInt(i.toString(), 10)] === 'Arrow' ? 'Arrow' :
                        data.sourceDecorators[parseInt(i.toString(), 10)] === 'Circle' ? 'Circle' : 'Custom';
                    connector.sourceDecorator = {
                        shape: sourceDecShape,
                        pathData: data.sourceDecoratorPathDatas && data.sourceDecoratorPathDatas[parseInt(i.toString(), 10)]
                    };
                }
                // Apply target decorator from array (only if it differs from default)
                if (data.targetDecorators && data.targetDecorators[parseInt(i.toString(), 10)]) {
                    const targetDecShape: DecoratorShapes = data.targetDecorators[parseInt(i.toString(), 10)] === 'Arrow' ? 'Arrow' :
                        data.targetDecorators[parseInt(i.toString(), 10)] === 'Circle' ? 'Circle' : 'Custom';
                    connector.targetDecorator = {
                        shape: targetDecShape,
                        pathData:
                            data.targetDecoratorPathDatas &&
                            data.targetDecoratorPathDatas[parseInt(i.toString(), 10)]
                    };
                }

                // Task 13: Apply link styles to connector
                applyLinkStyle(connector, connectorIndex, linkStyles);
                connectorIndex++;
                lastConnectorRef = connector;

                (flowchartNodesAndConnectors as ConnectorModel[]).push(connector);
            }
        } else if (data.parentId && data.parentId.length === 1) {
            const connector: ConnectorModel = {
                id: randomId(),
                sourceID: data.parentId[0] as string,
                targetID: data.id,
                annotations: [{ content: data.label ? data.label[0] : '' }],
                style: {
                    strokeWidth: connectorStyle.strokeWidth ? connectorStyle.strokeWidth : 1,
                    strokeDashArray: connectorStyle.strokeDashArray ? connectorStyle.strokeDashArray : '',
                    opacity: connectorStyle.opacity !== undefined ? connectorStyle.opacity : 1
                }
            };
            // Task 6: Apply decorators from index 0 (only parent)
            if (data.sourceDecorators && data.sourceDecorators[0]) {
                const sourceDecShape: DecoratorShapes = data.sourceDecorators[0] === 'Arrow' ? 'Arrow' :
                    data.sourceDecorators[0] === 'Circle' ? 'Circle' : 'Custom';
                connector.sourceDecorator = {
                    shape: sourceDecShape,
                    pathData: data.sourceDecoratorPathDatas && data.sourceDecoratorPathDatas[0]
                };
            }
            // Apply target decorator from array index 0
            if (data.targetDecorators && data.targetDecorators[0]) {
                const targetDecShape: DecoratorShapes = data.targetDecorators[0] === 'Arrow' ? 'Arrow' :
                    data.targetDecorators[0] === 'Circle' ? 'Circle' : 'Custom';
                connector.targetDecorator = {
                    shape: targetDecShape,
                    pathData: data.targetDecoratorPathDatas && data.targetDecoratorPathDatas[0]
                };
            }

            // Task 13: Apply link styles to connector
            applyLinkStyle(connector, connectorIndex, linkStyles);
            connectorIndex++;
            lastConnectorRef = connector;

            (flowchartNodesAndConnectors as ConnectorModel[]).push(connector);
        }
    }

    // Task 13: Handle '-' (dash) target: apply to last connector if specified
    if (lastConnectorRef && linkStyles && linkStyles.has('-')) {
        const lastStyle: LinkStyleData | undefined = linkStyles.get('-');
        if (lastStyle) {
            applyLinkStyle(lastConnectorRef, -1, linkStyles, lastStyle);  // Pass the style directly
        }
    }

    diagram.addElements(flowchartNodesAndConnectors);
}

/**
 * Phase 5: Parse orientation directive from first line of Mermaid diagram
 * @param {string} firstLine - The first line of the Mermaid diagram
 * @returns {string | null} - The normalized orientation ('TB', 'LR') or null if not found
 */
function parseOrientationDirective(firstLine: string): string | null {
    // Regex to match: flowchart/graph/diagram followed by orientation code (case-insensitive)
    const regex: RegExp = /^(?:flowchart|graph|diagram)\s+([A-Za-z]{2})\s*$/i;
    const match: RegExpMatchArray | null = firstLine.trim().match(regex);

    if (match) {
        const orientationCode: string = match[1].toUpperCase();

        // Map Mermaid orientation codes to EJ2 layout orientation values
        // TB (Top-to-Bottom) and TD (Top-Down) map to 'TB'
        // BT (Bottom-to-Top) maps to 'TB' with console warning
        // LR (Left-to-Right) maps to 'LR'
        // RL (Right-to-Left) maps to 'LR' with console warning

        if (orientationCode === 'TB' || orientationCode === 'TD') {
            return 'TB';
        } else if (orientationCode === 'BT') {
            // console.warn('[WARNING] :: BT (Bottom-to-Top) orientation is not supported in EJ2 Flowchart Layout. Falling back to TB (Top-to-Bottom).');
            return 'TB';
        } else if (orientationCode === 'LR') {
            return 'LR';
        } else if (orientationCode === 'RL') {
            // console.warn('[WARNING] :: RL (Right-to-Left) orientation is not supported in EJ2 Flowchart Layout. Falling back to LR (Left-to-Right).');
            return 'LR';
        }
    }

    // If no valid orientation found, return null (will default to TB in createFlowChart)
    return null;
}

/**
 * Splits the line based on arrow
 * @param { string } line - line to split
 * @returns { string[] } - Splitted line
 */
function getLineSplitting(line: string): string[] {
    let leftPart: string;
    let rightPart: string | null;
    let arrowName: string = '';
    let arrowText: string = '';
    // RegEx to split the line based on arrow
    // IMPORTANT: More specific patterns (longer/complete patterns like <==>, <--->)  must come BEFORE generic patterns (like ==>)
    // Pattern order matters: longer patterns first to avoid partial matches
    // Mermaid arrow patterns: <--> (bidi single), <==>(bidi double), <--->(bidi 5-char), <===>(bidi 5-char double)
    // UPDATED: Added patterns for labeled bidirectional endpoints: x--label--x, o--label--o, <--label-->
    // UPDATED: These bidirectional patterns are in Group 2 for highest priority
    const regex: RegExp = new RegExp(
        '^(.*?)\\s*(?:' +
        '(<--->|<-->|<====>|<==>|<==\\s*.*?\\s*==>|x--\\s*.*?\\s*--x|o--\\s*.*?\\s*--o|<--\\s*.*?\\s*-->)' +
        '|(o--o|x--x|---o|--o|---x|--x|-->|---|===|~~~|==>|===|==\\s*.*?\\s*==>)' +
        '|(--\\s*.*?\\s*---(?!>)|==\\s*.*?\\s*===(?!>)|==\\s*.*?\\s*==o|==\\s*.*?\\s*==x|===\\|[^|]*\\||---\\|[^|]*\\||~~~\\|[^|]*\\||-\\.-\\|[^|]*\\||--\\s*.*?\\s*--o|--\\s*.*?\\s*--x|--\\s*.*?\\s*-->|-\\.\\s*->|-\\.\\s*-|-\\.\\s*.*?\\.\\s*->|-\\..*?\\.\\s*->)' +
    ')(.*)$'
    );
    const match: RegExpMatchArray | null = line.match(regex);
    if (match) {
        leftPart = match[1].trim();
        const arrow: string = (match[2] || match[3] || match[4] || '').trim();
        rightPart = (match[5] || '').trim();

        // First, check if arrow contains pipe-delimited label (===|label|, ---|label|, etc.)
        // and extract it from the arrow itself
        let embeddedLabel: string = '';
        if (arrow.match(/^(===|---|~~~|-\.-)(\|[^|]*\|)$/)) {
            const labelMatch: RegExpMatchArray | null = arrow.match(/^(===|---|~~~|-\.-)(\|([^|]*)\|)$/);
            if (labelMatch) {
                // Remove surrounding double quotes from embedded label if present
                embeddedLabel = labelMatch[3].replace(/^"|"$/g, '');
            }
        }

        // Detect and extract arrow text
        // First try patterns with labeled bidirectional endpoints: <== label ==>, <-- label -->, o-- label --o, x-- label --x
        // IMPORTANT: Check bidirectional patterns FIRST before generic standard label pattern
        let arrowDetails: any;
        let arrowType: string = '';

        // Task 6 Extended: Handle labeled bidirectional-double arrows: <== label ==>
        const labeledBidirectionalDoubleMatch: RegExpMatchArray | null = arrow.match(/^(<==)\s*(.*?)\s*(==>)$/);
        if (labeledBidirectionalDoubleMatch) {
            // Pattern: <==label==> (bidirectional double arrow with label)
            arrowType = '<====>';
            arrowDetails = {
                text: labeledBidirectionalDoubleMatch[2].trim().replace(/^"|"$/g, ''),
                arrowType: arrowType
            };
        } else {
            // Task 6 Extended: Handle labeled bidirectional arrows: <-- label -->
            const labeledBidirectionalMatch: RegExpMatchArray | null = arrow.match(/^(<--)\s*(.*?)\s*(-->)$/);
            if (labeledBidirectionalMatch) {
                // Pattern: <--label--> (bidirectional arrow with label)
                arrowType = '<---->';
                arrowDetails = {
                    text: labeledBidirectionalMatch[2].trim().replace(/^"|"$/g, ''),
                    arrowType: arrowType
                };
            } else {
                // Task 6 Extended: Handle labeled bidirectional circle endpoints: o-- label --o
                const labeledCircleEndpointMatch: RegExpMatchArray | null = arrow.match(/^(o--)\s*(.*?)\s*(--o)$/);
                if (labeledCircleEndpointMatch) {
                    // Pattern: o--label--o (bidirectional circle endpoints with label)
                    arrowType = 'o--o';
                    arrowDetails = {
                        text: labeledCircleEndpointMatch[2].trim().replace(/^"|"$/g, ''),
                        arrowType: arrowType
                    };
                } else {
                    // Task 6 Extended: Handle labeled bidirectional cross endpoints: x-- label --x
                    const labeledCrossEndpointMatch: RegExpMatchArray | null = arrow.match(/^(x--)\s*(.*?)\s*(--x)$/);
                    if (labeledCrossEndpointMatch) {
                        // Pattern: x--label--x (bidirectional cross endpoints with label)
                        arrowType = 'x--x';
                        arrowDetails = {
                            text: labeledCrossEndpointMatch[2].trim().replace(/^"|"$/g, ''),
                            arrowType: arrowType
                        };
                    } else {
                        // Handle single-end circle/cross endpoints: --label--o, --label--x
                        const circleEndpointMatch: RegExpMatchArray | null = arrow.match(/^(--)\s*(.*?)\s*(--o)$/);
                        if (circleEndpointMatch) {
                            // Pattern: --label--o
                            arrowType = '--o';
                            arrowDetails = {
                                text: circleEndpointMatch[2].trim().replace(/^"|"$/g, ''),
                                arrowType: arrowType
                            };
                        } else {
                            const crossEndpointMatch: RegExpMatchArray | null = arrow.match(/^(--)\s*(.*?)\s*(--x)$/);
                            if (crossEndpointMatch) {
                                // Pattern: --label--x
                                arrowType = '--x';
                                arrowDetails = {
                                    text: crossEndpointMatch[2].trim().replace(/^"|"$/g, ''),
                                    arrowType: arrowType
                                };
                            } else {
                                // NEW: Handle labeled single-line without terminator: -- text ---
                                const labeledSingleLineMatch: RegExpMatchArray | null = arrow.match(/^(--)\s*(.*?)\s*(-{3})$/);
                                if (labeledSingleLineMatch) {
                                    // Pattern: -- text --- (single line with label, exactly 3 dashes, no arrow terminator)
                                    arrowType = '---';
                                    arrowDetails = {
                                        text: labeledSingleLineMatch[2].trim().replace(/^"|"$/g, ''),
                                        arrowType: arrowType
                                    };
                                } else {
                                    // NEW: Handle labeled double-line without terminator: == text ===
                                    const labeledDoubleLineMatch: RegExpMatchArray | null = arrow.match(/^(==)\s*(.*?)\s*(={3})$/);
                                    if (labeledDoubleLineMatch) {
                                        // Pattern: == text === (double line with label, exactly 3 equals, no arrow terminator)
                                        arrowType = '===';
                                        arrowDetails = {
                                            text: labeledDoubleLineMatch[2].trim().replace(/^"|"$/g, ''),
                                            arrowType: arrowType
                                        };
                                    } else {
                                        // NEW: Handle labeled double-line with circle decorator: == text ==o
                                        const labeledDoubleCircleMatch: RegExpMatchArray | null = arrow.match(/^(==)\s*(.*?)\s*(==o)$/);
                                        if (labeledDoubleCircleMatch) {
                                            // Pattern: == text ==o (double line with circle decorator)
                                            arrowType = '==o';
                                            arrowDetails = {
                                                text: labeledDoubleCircleMatch[2].trim().replace(/^"|"$/g, ''),
                                                arrowType: arrowType
                                            };
                                        } else {
                                            // NEW: Handle labeled double-line with cross decorator: == text ==x
                                            const labeledDoubleCrossMatch: RegExpMatchArray | null = arrow.match(/^(==)\s*(.*?)\s*(==x)$/);
                                            if (labeledDoubleCrossMatch) {
                                                // Pattern: == text ==x (double line with cross decorator)
                                                arrowType = '==x';
                                                arrowDetails = {
                                                    text: labeledDoubleCrossMatch[2].trim().replace(/^"|"$/g, ''),
                                                    arrowType: arrowType
                                                };
                                            } else {
                                                // Try standard label patterns (e.g., --text-- or ==text==)
                                                const arrowRegex: RegExp = /(-\.|\\-\\-|==|--|~~)(.*?)(\1>|\.->|==>|\\->|~~>)/;
                                                const arrowTextMatch: RegExpMatchArray | null = arrow.match(arrowRegex);
                                                if (arrowTextMatch) {
                                                    const text: string = arrowTextMatch[2].trim().replace(/^"|"$/g, '');
                                                    arrowType = arrowTextMatch[1] + arrowTextMatch[3];
                                                    arrowDetails = {
                                                        text: text,
                                                        arrowType: arrowType
                                                    };
                                                } else {
                                                    arrowDetails = {
                                                        text: embeddedLabel || null,
                                                        arrowType: arrow
                                                    };
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // If no label found in arrow pattern and no embedded label, check if rightPart starts with pipe-delimited label
        // Format: |label| or |"label"|
        if (!arrowDetails.text && !embeddedLabel && rightPart && rightPart.startsWith('|')) {
            const labelMatch: RegExpMatchArray | null = rightPart.match(/^\|([^|]*)\|\s*(.*)/);
            if (labelMatch) {
                arrowDetails.text = labelMatch[1].trim().replace(/^"|"$/g, ''); // Remove surrounding quotes if present
                rightPart = labelMatch[2].trim(); // Update rightPart to remove the label
            }
        }

        arrowText = arrowDetails.text !== null ? arrowDetails.text : '';
        arrowType = arrowDetails.arrowType;

        // Identify arrow type
        // Check for pipe-delimited labels first (===|label|, ---|label|, ~~~|label|, -.-|label|)
        if (arrowType.match(/^===\|[^|]*\|$/)) {
            arrowName = 'double-line';
        } else if (arrowType.match(/^---\|[^|]*\|$/)) {
            arrowName = 'single-line';
        } else if (arrowType.match(/^~~~\|[^|]*\|$/)) {
            arrowName = 'wiggly-arrow';
        } else if (arrowType.match(/^-\.-\|[^|]*\|$/)) {
            arrowName = 'dotted';
        // Task 6 Extended: Check labeled bidirectional patterns that were extracted above
        // Consolidated: <====>, <==>, <---->, <-->, <--->, <-->, <=> all map to bidirectional variants
        } else if (arrowType === '<====>' || arrowType === '<====' || arrowType === '<==>') {
            arrowName = 'bidirectional-double-arrow';
        } else if (arrowType === '<---->' || arrowType === '<-->' || arrowType === '<--->') {
            arrowName = 'bidirectional';
        } else if (arrowType === 'o--o') {
            arrowName = 'circle-endpoints';
        } else if (arrowType === 'x--x') {
            arrowName = 'cross-endpoints';
        // Task 5: Circle/cross patterns are checked BEFORE the generic -->  /  --- tests
        // because those substring checks would incorrectly match ---o / ---x.
        } else if (arrowType === '--o' || arrowType === '---o') {
            arrowName = 'circle-endpoint';
        } else if (arrowType === '--x' || arrowType === '---x') {
            arrowName = 'cross-endpoint';
        } else if (arrowType === '==o') {
            // Double-line with circle decorator
            arrowName = 'double-circle-endpoint';
        } else if (arrowType === '==x') {
            // Double-line with cross decorator
            arrowName = 'double-cross-endpoint';
        } else if (arrowType.includes('-->')) {
            arrowName = 'single-line-arrow';
        } else if (arrowType.includes('---')) {
            arrowName = 'single-line';
        } else if (arrowType.includes('==>')) {
            arrowName = 'double-line-arrow';
        } else if (arrowType.includes('==')) {
            arrowName = 'double-line';
        } else if (arrowType.includes('~~~')) {
            arrowName = 'wiggly-arrow';
        } else if (arrowType.includes('-.->') || arrowType.includes('.->')) {
            arrowName = 'dotted-arrow';
        } else if (arrowType.includes('-.-') || arrowType.includes('.-')) {
            arrowName = 'dotted';
        } else {
            arrowName = 'single-line-arrow';
        }
    } else {
        //consider single node Data
        leftPart = line.trim();
        rightPart = null;
        arrowName = '';
    }
    const result: string[] = [leftPart, rightPart || '', arrowName, arrowText];
    return result;
}

/**
 * To parse the style of the node
 * @param { string } line - line to parse
 * @param { FlowChartData[] } dataCollection - data collection
 * @returns { void }
 */
function parseStyle(line: string, dataCollection: FlowChartData[]): void {
    // Task 11 & 12: Updated regex to:
    // - Capture basic properties: fill, stroke, stroke-width
    // - Capture optional color property
    // - Capture optional stroke-dasharray property
    // - Make trailing semicolon optional to fix the "missing semicolon" issue
    const styleRegex: RegExp =
        /^style\s+(\w+)\s+fill:([^,]+),stroke:([^,]+),stroke-width:(\d+)px(.*)$/;
    if (line.startsWith('style')) {
        const match: RegExpMatchArray | null = line.match(styleRegex);

        if (match) {
            const id: string = match[1];
            const fill: string = match[2];
            const stroke: string = match[3];
            const strokeWidth: number = parseInt(match[4], 10);
            const remainingProps: string = match[5] || '';

            // Task 11: Parse optional color property from remainder
            let textColor: string | undefined;
            const colorMatch: RegExpMatchArray | null = remainingProps.match(/,color:([^,;]+)/);
            if (colorMatch) {
                textColor = colorMatch[1].trim();
            }

            // Task 12: Parse optional stroke-dasharray property from remainder
            let strokeDashArray: string | undefined;
            const dashMatch: RegExpMatchArray | null = remainingProps.match(/,stroke-dasharray:([^,;]+)/);
            if (dashMatch) {
                // Trim and store the dash array value (handles multiple values like "5 7 18 9")
                strokeDashArray = dashMatch[1].trim();
            }

            const data: MermaidStyle = {
                id: id,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth
            };
            const matchData: FlowChartData[] = dataCollection.filter((x: FlowChartData) => x.id === data.id);
            if (matchData.length > 0) {
                matchData[0].color = data.fill;
                matchData[0].stroke = data.stroke;
                matchData[0].strokeWidth = data.strokeWidth;
                // Task 11: Store text color if found
                if (textColor) {
                    matchData[0].textColor = textColor;
                }
                // Task 12: Store stroke dash array if found
                if (strokeDashArray) {
                    matchData[0].strokeDashArray = strokeDashArray;
                }
            }
        }
    }
}

/**
 * Parse click directive for clickable nodes.
 * Supports `click` and `href` formats.
 * @param {string} line - Directive line
 * @returns {ClickDirectiveData | null} Parsed directive object or null
 */
function parseClickDirective(line: string): ClickDirectiveData | null {
    // Check for unsupported callback/call syntax and warn
    if (line.match(/click\s+\w+\s+(callback|call\s+\w+)/i)) {
        // console.warn('[WARNING] :: Callback syntax is not supported in EJ2 Diagram. Click directive ignored.');
        return null;
    }

    // Pattern 1: click <nodeId> href "<url>" <tooltip?> <target?>
    // Pattern 2: click <nodeId> "<url>" <tooltip?> <target?>
    // This regex handles both href and non-href versions
    const regex: RegExp = new RegExp(
        '^click\\s+(\\w+)\\s+' +                // "click" followed by a word
        '(?:href\\s+)?' +                       // optional "href"
        '"([^"]*)"' +                           // first quoted string
        '\\s*' +
        '(?:"([^"]*)"\\s*)?' +                  // optional second quoted string
        '([^\\s]*)?' +                          // optional non-space sequence
        '\\s*$'                                 // trailing spaces till end
    );
    const match: RegExpMatchArray | null = line.match(regex);

    if (match) {
        const nodeId: string = match[1];
        const url: string = match[2];
        const tooltip: string | undefined = match[3] ? match[3] : undefined;
        const target: string | undefined = match[4] ? match[4] : undefined;

        // Validate target attribute
        if (target && ['_self', '_blank', '_parent', '_top'].indexOf(target) === -1) {
            console.warn(`[WARNING] :: Target attribute '${target}' is not valid. Supported values: _self, _blank, _parent, _top`);
        }

        // Warn if target is _parent or _top (frame-based, not supported in EJ2)
        if (target === '_parent' || target === '_top') {
            console.warn(`[WARNING] :: Target '${target}' is for frame-based navigation, not supported in EJ2 Diagram. Will be treated as _self.`);
        }

        return {
            nodeId: nodeId,
            url: url,
            tooltip: tooltip,
            target: target
        };
    }

    return null;
}

/**
 * Task 13: Parse linkStyle directive for connector styling.
 * Supports syntax: linkStyle <target> <styleDeclarations> ;
 * Target types: 'default' (all), single index, comma-list, or '-' (last)
 * Style declarations: stroke:color, stroke-width:px, stroke-dasharray:pattern, color:textcolor
 * @param {string} line - Directive line
 * @param {Map<string, LinkStyleData>} linkStyles - Map to store parsed styles
 * @returns {void}
 */
function parseLinkStyle(line: string, linkStyles: Map<string, LinkStyleData>): void {
    // Remove leading/trailing whitespace and optional trailing semicolon
    line = line.trim().replace(/;$/, '');

    // Pattern: linkStyle <target> <style declarations>
    // Target: 'default' | number | 'N,M,K' (comma-list) | '-' (last)
    // Styles: stroke:color,stroke-width:Npx,stroke-dasharray:pattern,color:textcolor
    const regex: RegExp = /^linkStyle\s+(\S+)\s+(.+)$/;
    const match: RegExpMatchArray | null = line.match(regex);

    if (match) {
        const target: string = match[1].trim();         // 'default', '0', '1,2,3', or '-'
        const styleString: string = match[2].trim();    // Remaining style declarations

        // Parse style declarations: key:value pairs separated by commas
        const styleDecl: LinkStyleData = {};

        // Parse stroke color: stroke:#color or stroke:colorname
        const strokeMatch: RegExpMatchArray | null = styleString.match(/stroke:([^,;]+)/);
        if (strokeMatch) {
            styleDecl.strokeColor = strokeMatch[1].trim();
        }

        // Parse stroke width: stroke-width:Npx
        const widthMatch: RegExpMatchArray | null = styleString.match(/stroke-width:(\d+)px/);
        if (widthMatch) {
            styleDecl.strokeWidth = parseInt(widthMatch[1], 10);
        }

        // Parse stroke dash array: stroke-dasharray:pattern (e.g., "5 5" or "5 7 18 9")
        const dashMatch: RegExpMatchArray | null = styleString.match(/stroke-dasharray:([^,;]+)/);
        if (dashMatch) {
            styleDecl.strokeDashArray = dashMatch[1].trim();
        }

        // Parse text color: color:#color or color:colorname
        const colorMatch: RegExpMatchArray | null = styleString.match(/color:([^,;]+)/);
        if (colorMatch) {
            styleDecl.color = colorMatch[1].trim();
        }

        // Store in linkStyles map
        // Handle different target types:
        if (target === 'default' || target === '-') {
            // 'default' applies to all connectors; '-' applies to last connector
            linkStyles.set(target, styleDecl);
        } else if (target.includes(',')) {
            // Comma-separated list: linkStyle 0,1,2 stroke:red
            const indices: string[] = target.split(',');
            indices.forEach((index: string) => {
                linkStyles.set(index.trim(), styleDecl);
            });
        } else {
            // Single index
            linkStyles.set(target, styleDecl);
        }
    }
}

/**
 * Task 13: Apply link styles to a connector based on index and linkStyles map
 * Handles 'default' (all connectors), specific indices, and '-' (last connector)
 * @param {ConnectorModel} connector - The connector to apply styles to
 * @param {number} index - The 0-based index of the connector
 * @param {Map<string, LinkStyleData>} linkStyles - Map of link styles
 * @param {LinkStyleData} overrideStyle - Optional override style (used for '-' target)
 * @returns {void}
 */
function applyLinkStyle(
    connector: ConnectorModel,
    index: number,
    linkStyles?: Map<string, LinkStyleData>,
    overrideStyle?: LinkStyleData
): void {
    if (!linkStyles) {
        return;
    }

    // Determine which style to apply:
    // 1. Specific index style (highest priority)
    // 2. Default style (applied to all)
    // 3. Override style (used for '-' target)
    let styleToApply: LinkStyleData | undefined = overrideStyle;

    if (!styleToApply) {
        // Check for specific index style first
        styleToApply = linkStyles.get(index.toString());

        // If no specific index, check for 'default' style
        if (!styleToApply) {
            styleToApply = linkStyles.get('default');
        }
    }

    if (!styleToApply) {
        return;
    }

    // Apply stroke color
    if (styleToApply.strokeColor) {
        connector.style = connector.style || {};
        connector.style.strokeColor = styleToApply.strokeColor;
    }

    // Apply stroke width
    if (styleToApply.strokeWidth) {
        connector.style = connector.style || {};
        connector.style.strokeWidth = styleToApply.strokeWidth;
    }

    // Apply stroke dash array
    if (styleToApply.strokeDashArray) {
        connector.style = connector.style || {};
        connector.style.strokeDashArray = styleToApply.strokeDashArray;
    }

    // Apply text color to annotation if present
    if (styleToApply.color && connector.annotations && connector.annotations.length > 0) {
        connector.annotations[0].style = connector.annotations[0].style || {};
        connector.annotations[0].style.color = styleToApply.color;
    }
}

/**
 * @param {string[]} lines - The lines to be processed.
 * @param {FlowChartData[]} dataCollection - The data collection to be updated.
 * @param {string} arrowType - The type of arrow.
 * @param {Diagram} diagram - The diagram instance.
 * @returns { void }
 */
function getNodeData(lines: string[], dataCollection: FlowChartData[], arrowType: string, diagram: Diagram): FlowChartData[] {
    const dataArray: FlowChartData[] = [];
    let firstId: string | null = null;
    let secondId: string | null = null;
    let isExistCount: number = 0;
    let connectorLabel: string = '';
    for (let i: number = 0; i < lines.length; i++) {
        const line1: string = lines[parseInt(i.toString(), 10)];
        if (line1) {
            const text: string[] = splitNested(line1);
            if (text && text[0].includes('|')) {
                // Extract content outside the '|'
                const match: RegExpMatchArray | null = text[0].match(/\|([^|]*)\|/);
                if (match) {
                    // Remove surrounding double quotes from label if present
                    connectorLabel = match[1].replace(/^"|"$/g, '');
                }
                const parts: string[] = text[0].split('|');
                if (parts.length >= 3) {
                    text[0] = parts[2].trim();
                }
            }
            //Extract and clean up the first text item by trimming and removing any semicolon at the end
            const id: string = text[0].trim().replace(/;$/, '');
            if (i === 0) {
                firstId = id;
            } else {
                secondId = id;
            }
            const exsist: FlowChartData | undefined = dataCollection.find((data: FlowChartData) => data.id === id);
            if (!exsist) {
                const labelShape: string = text.length > 1 ? text[1] : text[0];
                let shape: BasicShapeModel | FlowShapeModel | PathModel;
                let label: string = '';

                // Enhancement 2: Check for modern @{...} syntax (at start or anywhere in the label)
                let modernShapeName: string | null = null; // Track if modern syntax was used
                let showLabel: boolean = true; // Phase 2: Default to showing label
                let bpmnEvent: string | undefined; // Phase 2: BPMN event type
                // Task 4: Image node fields
                let imageSource: string | undefined;
                let imageWidth: number | undefined;
                let imageHeight: number | undefined;
                let imageConstraint: string | undefined;
                let imageLabelPos: string | undefined; // Task 4 Extended: Label position for image nodes
                let shapeWidth: number | undefined;
                let shapeHeight: number | undefined;
                let annotationMargin: { left?: number; right?: number; top?: number; bottom?: number } | undefined;
                let shapeCornerRadius: number | undefined;

                // First, check if shape syntax exists anywhere in the label (e.g., "d@{shape: odd}" or "@{shape: odd}")
                let shapeBlock: string = '';
                let nodeNamePart: string = labelShape;

                // Extract @{...} from labelShape if present
                const atShapeMatch: RegExpMatchArray | null = labelShape.match(/@\{[^}]*\}/);
                if (atShapeMatch) {
                    shapeBlock = atShapeMatch[0];
                    // Remove the shape block from labelShape to get just the node name
                    nodeNamePart = labelShape.replace(/@\{[^}]*\}/, '').trim();
                }

                if (shapeBlock) {
                    // We have shape syntax - parse it
                    const parsed: ParsedShape | null = parseAtShapeBlock(shapeBlock);
                    if (parsed) {
                        // Fallback chain: parsed.label (if non-empty) → nodeNamePart → id
                        if (parsed.label && parsed.label.trim().length > 0) {
                            // Remove surrounding double quotes from parsed label
                            label = parsed.label.replace(/^"|"$/g, '');
                        } else if (nodeNamePart && nodeNamePart.trim().length > 0) {
                            // Remove surrounding double quotes from node name part
                            label = nodeNamePart.replace(/^"|"$/g, '');
                        } else {
                            // Final fallback: use the node ID
                            label = id;
                        }
                        modernShapeName = parsed.shape; // Store for export

                        // Task 4: Detect image node - @{ img: "url" ... }
                        if (parsed && parsed.img) {
                            // Image node: use EJ2 Image shape; dimensions default to undefined if omitted
                            imageSource = parsed.img;
                            imageWidth = parsed.width !== undefined ? parsed.width : undefined;
                            imageHeight = parsed.height !== undefined ? parsed.height : undefined;
                            imageConstraint = parsed.constraint;
                            imageLabelPos = parsed.pos; // Task 4 Extended: Store label position (t or b)
                            shape = { type: 'Basic', shape: 'Rectangle' }; // placeholder; node is sized by image
                            showLabel = label.length > 0; // show annotation only if label provided
                        } else {
                            // Map modern shape to EJ2 shape and get the mapping
                            const shapeMapping: ShapeMapping = mapModernShapeToLegacy(parsed.shape);
                            showLabel = shapeMapping.showLabel !== false; // Phase 2: Use showLabel from mapping
                            bpmnEvent = shapeMapping.bpmnEvent; // Phase 2: Store BPMN event type
                            shapeWidth = shapeMapping.width; // Capture width from shape mapping
                            shapeHeight = shapeMapping.height; // Capture height from shape mapping
                            annotationMargin = shapeMapping.annotationMargin; // Capture annotation margin from shape mapping
                            shapeCornerRadius = shapeMapping.ej2Shape ? shapeMapping.ej2Shape.cornerRadius : undefined; // Capture corner radius from shape mapping
                            // If EJ2 shape exists, use it; otherwise use path data
                            if (shapeMapping.ej2Shape) {
                                // Phase 2: Create EJ2 shape directly
                                if (shapeMapping.ej2Shape.type === 'Bpmn' && bpmnEvent) {
                                    // For BPMN events, create shape with event property as an object
                                    shape = { type: 'Bpmn', shape: 'Event', event: { event: bpmnEvent } } as BpmnShapeModel;
                                } else {
                                    shape = shapeMapping.ej2Shape as BasicShapeModel | FlowShapeModel | BpmnShapeModel;
                                }
                            } else if (shapeMapping.pathData) {
                                // Create path-based shape
                                shape = { type: 'Path', data: shapeMapping.pathData };
                            } else {
                                // Fallback to rectangle if no mapping
                                shape = { type: 'Basic', shape: 'Rectangle' };
                            }
                        }
                    } else {
                        // Fallback if shape block parsing fails - treat nodeNamePart as legacy
                        shape = getShape(nodeNamePart);
                        // Bug 1, 2 & 4 Fix: Use quote-aware label extraction so parentheses
                        // inside quoted labels (e.g., ["text (with) parens"]) are preserved,
                        // and backslashes used as shape delimiters are stripped.
                        label = extractLabelFromShape(nodeNamePart);
                    }
                } else {
                    // No shape syntax - use existing logic with the full labelShape
                    shape = getShape(labelShape);
                    // Bug 1 & 2 Fix: Also remove backslash (\) for escape sequences like [\text\]
                    // Bug 4 Fix: Preserve parentheses inside quoted strings like ["text (with) parens"]
                    // Extract quoted content first to preserve it, then remove shape delimiters
                    label = extractLabelFromShape(labelShape);
                }

                const data: FlowChartData = {
                    id: id,
                    name: label,
                    shape: shape,
                    color: 'white',
                    parentId: [] as string[],
                    label: '',
                    arrowType: '',
                    stroke: 'black',
                    strokeWidth: 1,
                    modernShapeName: modernShapeName, // Store modern shape name for export
                    showLabel: showLabel, // Phase 2: Track whether to display annotation
                    bpmnEvent: bpmnEvent, // Phase 2: Store BPMN event type for BPMN Event shapes
                    // Task 4: Image node fields (undefined when not an image node)
                    imageSource: imageSource,
                    imageWidth: imageWidth,
                    imageHeight: imageHeight,
                    imageConstraint: imageConstraint,
                    imageLabelPos: imageLabelPos, // Task 4 Extended: Label position for image nodes
                    width: shapeWidth,
                    height: shapeHeight,
                    annotationMargin: annotationMargin,
                    cornerRadius: shapeCornerRadius
                } as FlowChartData;
                dataArray.push(data);
            } else {
                isExistCount++;
            }
        }
    }
    if (dataArray.length) {
        const lastItem: FlowChartData = dataArray[dataArray.length - 1];
        if (lastItem.id !== firstId) {
            (lastItem.parentId as string[]).push(firstId);
            if (lastItem.label) {
                (lastItem.label as string[]).push(connectorLabel);
            } else {
                lastItem.label = [connectorLabel];
            }
        } else {
            const data: FlowChartData | undefined = dataCollection.find((data: FlowChartData) => data.id === secondId);
            if (data) {
                if (data.parentId) {
                    (data.parentId as string[]).push(firstId);
                } else {
                    data.parentId = [firstId];
                }
                if (data.label) {
                    (data.label as string[]).push(connectorLabel);
                } else {
                    data.label = [connectorLabel];
                }
            }
        }
    } else if (isExistCount === 2) {
        const [filteredData]: FlowChartData[] = dataCollection.filter((flowData: FlowChartData) => flowData.id === secondId);
        filteredData.parentId = filteredData.parentId || [];
        (filteredData.parentId as string[]).push(firstId);

        filteredData.label = filteredData.label || [];
        (filteredData.label as string[])[filteredData.parentId.length - 1] = connectorLabel;
    }
    if (arrowType) {
        let filteredData: FlowChartData | undefined =
            dataArray.find(function (flowData: FlowChartData): boolean {
                return flowData.id === secondId;
            });

        if (!filteredData) {
            filteredData = dataCollection.find(function (flowData: FlowChartData): boolean {
                return flowData.id === secondId;
            });
        }
        if (filteredData) {
            // Task 6: Set source and target decorators PER PARENT
            // Initialize arrays if not exist (for first connection)
            if (!filteredData.sourceDecorators) {
                filteredData.sourceDecorators = [];
                filteredData.targetDecorators = [];
                filteredData.sourceDecoratorPathDatas = [];
                filteredData.targetDecoratorPathDatas = [];
            }

            // Get the index for this parent (which position in parentId array)
            const parentIndex: number = (filteredData.parentId as string[]).length - 1;

            // Set decorators based on arrow type for THIS specific parent connection
            // Bidirectional patterns have decorators on both ends
            if (arrowType === 'bidirectional') {
                // <--> or <----> : Arrow on both ends
                filteredData.sourceDecorators[parseInt(parentIndex.toString(), 10)] = 'Arrow';
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Arrow';
            } else if (arrowType === 'bidirectional-double-arrow') {
                // <===> or <===> : Double arrow on both ends (same as bidirectional for decorator purposes)
                filteredData.sourceDecorators[parseInt(parentIndex.toString(), 10)] = 'Arrow';
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Arrow';
            } else if (arrowType === 'circle-endpoints') {
                // o--o : Circle on both ends
                filteredData.sourceDecorators[parseInt(parentIndex.toString(), 10)] = 'Circle';
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Circle';
            } else if (arrowType === 'cross-endpoints') {
                // x--x : Cross (Custom shape) on both ends
                // SVG path for X shape
                const crossPath: string = 'M 0,0 L 25,25 M 25,0 L 0,25';
                filteredData.sourceDecorators[parseInt(parentIndex.toString(), 10)] = 'Custom';
                filteredData.sourceDecoratorPathDatas[parseInt(parentIndex.toString(), 10)] = crossPath;
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Custom';
                filteredData.targetDecoratorPathDatas[parseInt(parentIndex.toString(), 10)] = crossPath;
            } else if (arrowType === 'single-line-arrow') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Arrow';
            } else if (arrowType === 'double-line-arrow') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Arrow';
            } else if (arrowType === 'dotted-arrow') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Arrow';
            } else if (arrowType === 'single-line') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'None';
            } else if (arrowType === 'double-line') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'None';
            } else if (arrowType === 'dotted') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'None';
            } else if (arrowType === 'wiggly-arrow') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'None';
            } else if (arrowType === 'circle-endpoint') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Circle';
            } else if (arrowType === 'cross-endpoint') {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Custom';
                filteredData.targetDecoratorPathDatas[parseInt(parentIndex.toString(), 10)] = 'M 0,0 L 25,25 M 25,0 L 0,25';
            } else if (arrowType === 'double-circle-endpoint') {
                // Double-line with circle endpoint
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Circle';
            } else if (arrowType === 'double-cross-endpoint') {
                // Double-line with cross endpoint
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Custom';
                filteredData.targetDecoratorPathDatas[parseInt(parentIndex.toString(), 10)] = 'M 0,0 L 25,25 M 25,0 L 0,25';
            } else {
                filteredData.targetDecorators[parseInt(parentIndex.toString(), 10)] = 'Arrow';
            }
            // For single-end decorators (circle-endpoint, cross-endpoint), arrowType is stored
            // but only targetDecorator is set (handled in getConnectorArrowType())
        }
    }
    return dataArray;
}

/**
 * Extract label from shape syntax, preserving content inside quotes
 * e.g., '["This is the (text) in the box"]' returns 'This is the (text) in the box'
 * e.g., '[label]' returns 'label'
 * @param {string} text - The shape text like ["text"] or [label]
 * @returns {string} The extracted label
 */
function extractLabelFromShape(text: string): string {
    // Check if text starts with a quote delimiter like [" or ['
    const quoteMatch: RegExpMatchArray | null = text.match(/^[[({<]?\s*["'](.*)["']\s*[\])}>]?\s*$/);
    if (quoteMatch) {
        // Return content between quotes, preserving special chars like ()
        return quoteMatch[1];
    }
    // No quotes - strip shape delimiters only
    return text.replace(/\[/g, '').replace(/\]/g, '').replace(/\(/g, '').replace(/\)/g, '')
        .replace(/\{/g, '').replace(/\}/g, '').replace(/\//g, '').replace(/>/g, '').replace(/^"|"$/g, '')
        .replace(/\\/g, '');
}

/**
 * To split the text based on the nested brackets
 * Enhancement 2: Also handles @{...} modern syntax blocks
 * @param {string} text - The text to be split based on nested brackets.
 * @returns {string[]} An array of strings split based on the nested brackets.
 */
function splitNested(text: string): string[] {
    const result: string[] = [];
    let current: string = '';
    let level: number = 0;
    let delimiter: string = '';
    let i: number = 0;
    let inQuotes: boolean = false; // Track if we're inside a double-quoted string

    while (i < text.length) {
        const char: string = text[parseInt(i.toString(), 10)];

        // Bug 4 Fix: Track double-quoted strings to preserve parentheses and brackets inside them
        if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
            inQuotes = !inQuotes;
            current += char;
            i++;
            continue;
        }

        // Enhancement 2: Handle @{...} modern syntax blocks
        if (char === '@' && i + 1 < text.length && text[i + 1] === '{') {
            if (level === 0 && current.trim().length > 0) {
                result.push(current.trim());
                current = '';
            }
            // Capture entire @{...} block as a single token
            let atBlock: string = '';
            let braceLevel: number = 0;
            while (i < text.length) {
                atBlock += text[parseInt(i.toString(), 10)];
                if (text[parseInt(i.toString(), 10)] === '{') {
                    braceLevel++;
                } else if (text[parseInt(i.toString(), 10)] === '}') {
                    braceLevel--;
                    if (braceLevel === 0) {
                        i++;
                        break;
                    }
                }
                i++;
            }
            result.push(atBlock);
            continue;
        }

        // Bug 4 Fix: Don't treat brackets/parens as delimiters when inside quoted strings
        if (!inQuotes) {
            if (char === '[' || char === '{' || char === '(' || char === '>') {
                if (level === 0) {
                    if (current.trim().length > 0) {
                        result.push(current.trim());
                    }
                    current = char; // Include the delimiter in the current part
                    delimiter = char;
                    level++;
                } else {
                    current += char;
                    level++;
                }
            } else if (char === ']' || char === '}' || char === ')') {
                if (level === 1 && ((char === ']' && delimiter === '[') || (char === '}' && delimiter === '{') || (char === ')' && delimiter === '('))) {
                    current += char; // Include the delimiter in the current part
                    result.push(current.trim());
                    current = '';
                    level--;
                } else if (level > 1) {
                    current += char;
                    level--;
                } else {
                    current += char;
                }
            } else {
                current += char;
            }
        } else {
            current += char;
        }
        i++;
    }

    if (current.trim().length > 0) {
        result.push(current.trim());
    }

    return result;
}

/**
 * Enhancement 2: Parse modern Mermaid node syntax @{ shape: ..., label: ... }
 * Task 4: Extended to also support @{ img: "url", w: 60, h: 60 } image-node syntax.
 * Task 4 Extended: Support pos property for image label positioning (t=top, b=bottom)
 *
 * Accepts two forms:
 *   (a) @{ shape: <name>, label: "text" [, w: N] [, h: N] }
 *   (b) @{ img: "url" [, label: "text"] [, w: N] [, h: N] [, pos: t|b] [, constraint: on|off] }   ← image node (no shape required)
 *
 * @param {string} text - The @{...} block to parse
 * @returns {ParsedShape | null} Parsed shape data with all properties, or null if parsing fails
 */
function parseAtShapeBlock(text: string): ParsedShape | null {
    if (!text.startsWith('@{') || !text.endsWith('}')) {
        return null;
    }

    // --- Check for image-first blocks (Task 4) ---
    // @{ img: "url" [, ...] }
    const imgMatch: RegExpMatchArray | null = text.match(/img:\s*"([^"]*)"/);
    if (imgMatch) {
        const labelMatch: RegExpMatchArray | null = text.match(/label:\s*"([^"]*)"/);
        const wMatch: RegExpMatchArray | null = text.match(/w:\s*(\d+)/);
        const hMatch: RegExpMatchArray | null = text.match(/h:\s*(\d+)/);
        const posMatch: RegExpMatchArray | null = text.match(/pos:\s*"?([tb])"?/);
        const constraintMatch: RegExpMatchArray | null = text.match(/constraint:\s*"?([a-zA-Z]+)"?/i);
        return {
            shape: 'image',                                           // sentinel shape name for image nodes
            label: labelMatch ? labelMatch[1] : '',
            width: wMatch ? parseInt(wMatch[1], 10) : undefined,
            height: hMatch ? parseInt(hMatch[1], 10) : undefined,
            img: imgMatch[1],
            pos: posMatch ? posMatch[1] : undefined,                  // pos property for label positioning
            constraint: constraintMatch ? constraintMatch[1].toLowerCase() : undefined
        };
    }

    // --- Check for shape-first blocks ---
    // Support shapes with hyphens: @{ shape: paper-tape, label: "..." }
    // Support shapes without label: @{ shape: paper-tape }
    const shapeMatch: RegExpMatchArray | null = text.match(/shape:\s*([\w-]+)/);
    if (shapeMatch) {
        // Found a shape property
        const shapeName: string = shapeMatch[1];
        const labelMatch: RegExpMatchArray | null = text.match(/label:\s*"([^"]*)"/);
        const wMatch: RegExpMatchArray | null = text.match(/w:\s*(\d+)/);
        const hMatch: RegExpMatchArray | null = text.match(/h:\s*(\d+)/);

        return {
            shape: shapeName,
            label: labelMatch ? labelMatch[1] : '', // Empty string if no label
            width: wMatch ? parseInt(wMatch[1], 10) : undefined,
            height: hMatch ? parseInt(hMatch[1], 10) : undefined,
            img: undefined
        };
    }

    return null;
}

/**
 * Canonical shape definitions - each shape defined once
 * Maps to canonical name to avoid duplication
 * Includes width/height for consistent shape sizing:
 *   - Default width: 90, height: 90 for most shapes
 *   - Process/Rectangle shapes: width 90, height 45 (for better process node appearance)
 */
const CANONICAL_SHAPES: { [key: string]: ShapeMapping } = {
    // Basic Shapes
    'basic-rect': { ej2Shape: { type: 'Basic', shape: 'Rectangle' }, showLabel: true, width: 90, height: 45 },
    'basic-rounded-rect': { ej2Shape: { type: 'Basic', shape: 'Rectangle', cornerRadius: 5 }, showLabel: true, width: 90, height: 45 },
    'basic-ellipse': { ej2Shape: { type: 'Basic', shape: 'Ellipse' }, showLabel: true, width: 90, height: 90 },
    'basic-small-ellipse': { ej2Shape: { type: 'Basic', shape: 'Ellipse' }, showLabel: true, width: 60, height: 60 },
    'basic-hexagon': { ej2Shape: { type: 'Basic', shape: 'Hexagon' }, showLabel: true, width: 90, height: 110 },
    'basic-cylinder': { ej2Shape: { type: 'Basic', shape: 'Cylinder' }, showLabel: true, width: 90, height: 90 },
    'basic-trapezoid': { ej2Shape: { type: 'Basic', shape: 'Trapezoid' }, showLabel: true, width: 90, height: 45 },
    'basic-parallelogram': { ej2Shape: { type: 'Basic', shape: 'Parallelogram' }, showLabel: true, width: 90, height: 45 },
    'basic-triangle': { ej2Shape: { type: 'Basic', shape: 'Triangle' }, showLabel: true, width: 90, height: 90 },

    // Flow Shapes - Process shapes use reduced height for better appearance
    'flow-process': { ej2Shape: { type: 'Flow', shape: 'Process' }, showLabel: true, width: 90, height: 45 },
    'flow-terminator': { ej2Shape: { type: 'Flow', shape: 'Terminator' }, showLabel: true, width: 90, height: 45 },
    'flow-decision': { ej2Shape: { type: 'Flow', shape: 'Decision' }, showLabel: true, width: 90, height: 90 },
    'flow-document': { ej2Shape: { type: 'Flow', shape: 'Document' }, showLabel: true, width: 90, height: 90 },
    'flow-predefined': { ej2Shape: { type: 'Flow', shape: 'PreDefinedProcess' }, showLabel: true, width: 90, height: 45 },
    'flow-delay': { ej2Shape: { type: 'Flow', shape: 'Delay' }, showLabel: true, width: 90, height: 45 },
    'flow-display': { ej2Shape: { type: 'Flow', shape: 'Display' }, showLabel: true, width: 90, height: 45 },
    'flow-directdata': { ej2Shape: { type: 'Flow', shape: 'DirectData' }, showLabel: true, width: 90, height: 90 },
    'flow-storeddata': { ej2Shape: { type: 'Flow', shape: 'StoredData' }, showLabel: true, width: 90, height: 45 },
    'flow-internal-storage': { ej2Shape: { type: 'Flow', shape: 'InternalStorage' }, showLabel: true, width: 90, height: 90 },
    'flow-card': { ej2Shape: { type: 'Flow', shape: 'Card' }, showLabel: true, width: 90, height: 80 },
    'flow-collate': { ej2Shape: { type: 'Flow', shape: 'Collate' }, showLabel: false, width: 60, height: 60 },
    'flow-loop-limit': { ej2Shape: { type: 'Flow', shape: 'LoopLimit' }, showLabel: true, width: 90, height: 45 },
    'flow-merge': { ej2Shape: { type: 'Flow', shape: 'Merge' }, showLabel: true, width: 90, height: 90 },
    'flow-manual-input': { ej2Shape: { type: 'Flow', shape: 'ManualInput' }, showLabel: true, width: 90, height: 90 },
    'flow-multi-document': { ej2Shape: { type: 'Flow', shape: 'MultiDocument' }, showLabel: true, width: 90, height: 90 },
    'flow-summing-junction': { ej2Shape: { type: 'Flow', shape: 'SummingJunction' }, showLabel: false, width: 60, height: 60 },
    'flow-paper-tape': { ej2Shape: { type: 'Flow', shape: 'PaperTap' }, showLabel: true, width: 90, height: 45 },
    'flow-fork-join': { ej2Shape: { type: 'Flow', shape: 'Process' }, showLabel: false, width: 90, height: 20 },

    // BPMN Shapes
    'bpmn-start-event': { ej2Shape: { type: 'Bpmn', shape: 'Event' }, bpmnEvent: 'Start', showLabel: false, width: 90, height: 90 },
    'bpmn-small-start-event': { ej2Shape: { type: 'Bpmn', shape: 'Event' }, bpmnEvent: 'Start', showLabel: false, width: 45, height: 45 },
    'bpmn-intermediate-event': { ej2Shape: { type: 'Bpmn', shape: 'Event' }, bpmnEvent: 'Intermediate', showLabel: true, width: 90, height: 90 },
    'bpmn-end-event': { ej2Shape: { type: 'Bpmn', shape: 'Event' }, bpmnEvent: 'End', showLabel: false, width: 45, height: 45 },
    'bpmn-datasource': { ej2Shape: { type: 'Bpmn', shape: 'DataSource' }, showLabel: true, width: 90, height: 90 },

    // Path Shapes - grouped by path data to reduce duplication
    'path-cloud': { pathData: 'M0 0 a16.18875045776367,16.18875045776367 0 0,1 26.981250762939453,-10.792500305175782 a37.77375106811523,37.77375106811523 1 0,1 43.17000122070313,-10.792500305175782 a26.981250762939453,26.981250762939453 1 0,1 37.77375106811523,21.585000610351564 a16.18875045776367,16.18875045776367 1 0,1 16.18875045776367,13.020000534057615 a21.585000610351564,21.585000610351564 1 0,1 -16.18875045776367,24.180000991821288 a26.981250762939453,16.18875045776367 1 0,1 -26.981250762939453,16.18875045776367 a37.77375106811523,37.77375106811523 1 0,1 -53.962501525878906,0 a16.18875045776367,16.18875045776367 1 0,1 -26.981250762939453,-16.18875045776367 a16.18875045776367,16.18875045776367 1 0,1 -10.792500305175782,-13.020000534057615 a21.585000610351564,21.585000610351564 1 0,1 10.792500305175782,-24.180000991821288 H0 V0 Z', showLabel: true, width: 120, height: 80 },
    'path-bang': { pathData: 'M0 0 a15.470625686645507,15.470625686645507 1 0,0 25.78437614440918,-3.7200001525878905 a15.470625686645507,15.470625686645507 1 0,0 25.78437614440918,0 a15.470625686645507,15.470625686645507 1 0,0 25.78437614440918,0 a15.470625686645507,15.470625686645507 1 0,0 25.78437614440918,3.7200001525878905 a15.470625686645507,15.470625686645507 1 0,0 15.470625686645507,12.276000503540038 a12.376500549316406,12.376500549316406 1 0,0 0,12.648000518798828 a15.470625686645507,15.470625686645507 1 0,0 -15.470625686645507,12.276000503540038 a15.470625686645507,15.470625686645507 1 0,0 -25.78437614440918,5.580000228881835 a15.470625686645507,15.470625686645507 1 0,0 -25.78437614440918,0 a15.470625686645507,15.470625686645507 1 0,0 -25.78437614440918,0 a15.470625686645507,15.470625686645507 1 0,0 -25.78437614440918,-5.580000228881835 a15.470625686645507,15.470625686645507 1 0,0 -10.313750457763673,-12.276000503540038 a12.376500549316406,12.376500549316406 1 0,0 0,-12.648000518798828 a15.470625686645507,15.470625686645507 1 0,0 10.313750457763673,-12.276000503540038 H0 V0 Z', showLabel: true, width: 120, height: 80 },
    'path-bolt': { pathData: 'M7 17.5L22.5 1.5L14.5 13.5H24.5L7.5 30.5L16.5 17.5H7Z', showLabel: false, width: 90, height: 90 },
    'path-comment': { pathData: 'M15 27.5V20.4766C15 18.931 13.9862 17.5682 12.5059 17.124L10.3564 16.4785C10.145 16.4151 10 16.2208 10 16C10 15.7792 10.145 15.5849 10.3564 15.5215L12.5059 14.876C13.9862 14.4318 15 13.069 15 11.5234V4.5C15 2.567 16.567 1 18.5 1H21.5C21.7761 1 22 1.22386 22 1.5C22 1.77614 21.7761 2 21.5 2H18.5C17.1193 2 16 3.11929 16 4.5V11.5234C16 13.5107 14.6964 15.263 12.793 15.834L12.2393 16L12.793 16.166C14.6964 16.737 16 18.4893 16 20.4766V27.5C16 28.8807 17.1193 30 18.5 30H21.5C21.7761 30 22 30.2239 22 30.5C22 30.7761 21.7761 31 21.5 31H18.5C16.567 31 15 29.433 15 27.5Z', showLabel: true, width: 45, height: 90, annotationMargin: { left: 45 } },
    'path-brace-r': { pathData: 'M16 27.5V20.4766C16 18.4893 17.3036 16.737 19.207 16.166L19.7598 16L19.207 15.834C17.3036 15.263 16 13.5107 16 11.5234V4.5C16 3.11929 14.8807 2 13.5 2H10.5C10.2239 2 10 1.77614 10 1.5C10 1.22386 10.2239 1 10.5 1H13.5C15.433 1 17 2.567 17 4.5V11.5234C17 13.069 18.0138 14.4318 19.4941 14.876L21.6436 15.5215C21.855 15.5849 22 15.7792 22 16C22 16.2208 21.855 16.4151 21.6436 16.4785L19.4941 17.124C18.0138 17.5682 17 18.931 17 20.4766V27.5C17 29.433 15.433 31 13.5 31H10.5C10.2239 31 10 30.7761 10 30.5C10 30.2239 10.2239 30 10.5 30H13.5C14.8807 30 16 28.8807 16 27.5Z', showLabel: true, width: 45, height: 90, annotationMargin: { right: 45 } },
    'path-braces': { pathData: 'M6 27.5V20.4766C6 18.931 4.98619 17.5682 3.50586 17.124L1.35645 16.4785C1.14495 16.4151 1 16.2208 1 16C1 15.7792 1.14495 15.5849 1.35645 15.5215L3.50586 14.876C4.98619 14.4318 6 13.069 6 11.5234V4.5C6 2.567 7.567 1 9.5 1H11.5C11.7761 1 12 1.22386 12 1.5C12 1.77614 11.7761 2 11.5 2H9.5C8.11929 2 7 3.11929 7 4.5V11.5234C7 13.5107 5.6964 15.263 3.79297 15.834L3.23926 16L3.79297 16.166C5.6964 16.737 7 18.4893 7 20.4766V27.5C7 28.8807 8.11929 30 9.5 30H11.5C11.7761 30 12 30.2239 12 30.5C12 30.7761 11.7761 31 11.5 31H9.5C7.567 31 6 29.433 6 27.5ZM25 27.5V20.4766C25 18.4893 26.3036 16.737 28.207 16.166L28.7598 16L28.207 15.834C26.3036 15.263 25 13.5107 25 11.5234V4.5C25 3.11929 23.8807 2 22.5 2H20.5C20.2239 2 20 1.77614 20 1.5C20 1.22386 20.2239 1 20.5 1H22.5C24.433 1 26 2.567 26 4.5V11.5234C26 13.069 27.0138 14.4318 28.4941 14.876L30.6436 15.5215C30.855 15.5849 31 15.7792 31 16C31 16.2208 30.855 16.4151 30.6436 16.4785L28.4941 17.124C27.0138 17.5682 26 18.931 26 20.4766V27.5C26 29.433 24.433 31 22.5 31H20.5C20.2239 31 20 30.7761 20 30.5C20 30.2239 20.2239 30 20.5 30H22.5C23.8807 30 25 28.8807 25 27.5Z', showLabel: true, width: 90, height: 90 },
    'path-divided': { pathData: 'M2.5 9.5V28.5H29.5V9.5M2.5 9.5V3.5H29.5V9.5M2.5 9.5H29.5', showLabel: true, width: 90, height: 90 },
    'path-lined-doc': { pathData: 'M4.5 3.5H1.5L1.5 24.5C2.56431 25.2707 3.56128 25.9067 4.5 26.4253M4.5 3.5H30.5V24.5C18.9175 20.7936 16.3502 32.971 4.5 26.4253M4.5 3.5V26.4253', showLabel: true, width: 90, height: 90 },
    'path-lined-rect': { pathData: 'M6.5 4.5H1.5V27.5H6.5M6.5 4.5H30.5V27.5H6.5M6.5 4.5V27.5', showLabel: true, width: 90, height: 90 },
    'path-tagged-doc': { pathData: 'M30.5 15.5V3.5H1.5L1.5 24.5C12.794 32.6784 16.5045 25.6898 23.5 24.0898M30.5 15.5V24.5C27.7362 23.6156 25.4858 23.6356 23.5 24.0898M30.5 15.5L23.5 24.0898', showLabel: true, width: 90, height: 90 },
    'path-tagged-rect': { pathData: 'M23.5 27.5H30.5V20.5M23.5 27.5H1.5V4.5H30.5V20.5M23.5 27.5L30.5 20.5', showLabel: true, width: 90, height: 90 },
    'path-stacked': { pathData: 'M4.5 9.5V6.5H27.5V25.5H24.5M7.5 6.5V3.5H30.5V22.5H27.5M1.5 28.5V9.5H24.5V28.5H1.5Z', showLabel: true, width: 90, height: 90 },
    'path-odd': { pathData: 'M 0 0 L 8 0 L 8 2 L 0 2 L 2 1 L 0 0', showLabel: true, width: 90, height: 45 },
    'path-trapezoid-alt': { pathData: 'M 0 0 L 5 0 L 4 1 L 1 1 L 0 0', showLabel: true, width: 90, height: 45 },
    'path-trapezoid-bottom': { pathData: 'M 0 1 L 5 1 L 4 0 L 1 0 L 0 1', showLabel: true, width: 90, height: 45 },
    'path-parallelogram-alt': { pathData: 'M 0 0 L 12 0 L 14 2 L 2 2 L 0 0', showLabel: true, width: 90, height: 45 },

    // Text
    'text': { ej2Shape: { type: 'Text', shape: 'Text' }, showLabel: true, width: 90, height: 45 }
};

/**
 * Alias map - maps all shape aliases to their canonical shape names
 * Supports multiple aliases for the same shape
 * Format: 'alias-name' => 'canonical-shape-name'
 *
 * NOTE: Some names appear in both flowShapes and pathShapes in the original code.
 * In those cases, the path version is canonical (since it's merged last in the original).
 */
const SHAPE_ALIASES: { [key: string]: string } = {
    // Basic Shapes Aliases
    'rect': 'basic-rect',
    'rectangle': 'basic-rect',
    'rounded': 'basic-rounded-rect',
    'event': 'basic-rounded-rect',

    'junction': 'basic-small-ellipse',
    'f-circ': 'basic-ellipse',
    'filled-circle': 'basic-ellipse',
    'circ': 'basic-ellipse',
    'circle': 'basic-ellipse',
    'ellipse': 'basic-ellipse',

    'hexagon': 'basic-hexagon',
    'hex': 'basic-hexagon',
    'prepare': 'basic-hexagon',

    'cylinder': 'basic-cylinder',
    'cyl': 'basic-cylinder',

    'trapezoid': 'basic-trapezoid',
    'trap-t': 'basic-trapezoid',
    'inv-trapezoid': 'basic-trapezoid',
    'manual': 'basic-trapezoid',
    'trapezoid-top': 'basic-trapezoid',

    'trapezoid-alt': 'path-trapezoid-alt',
    'trap-b': 'path-trapezoid-bottom',
    'priority': 'path-trapezoid-bottom',
    'trapezoid-bottom': 'path-trapezoid-bottom',

    'lean-r': 'basic-parallelogram',
    'lean-right': 'basic-parallelogram',
    'in-out': 'basic-parallelogram',

    'lean-l': 'path-parallelogram-alt',
    'lean-left': 'path-parallelogram-alt',
    'out-in': 'path-parallelogram-alt',

    'triangle': 'basic-triangle',
    'tri': 'basic-triangle',
    'extract': 'basic-triangle',

    // Flow Shapes Aliases
    'process': 'flow-process',
    'proc': 'flow-process',

    'terminal': 'flow-terminator',
    'stadium': 'flow-terminator',
    'pill': 'flow-terminator',

    'decision': 'flow-decision',
    'diam': 'flow-decision',
    'diamond': 'flow-decision',
    'question': 'flow-decision',

    'document': 'flow-document',
    'doc': 'flow-document',

    'subroutine': 'flow-predefined',
    'fr-rect': 'flow-predefined',
    'framed-rectangle': 'flow-predefined',
    'subproc': 'flow-predefined',
    'subprocess': 'flow-predefined',

    'delay': 'flow-delay',
    'half-rounded-rectangle': 'flow-delay',

    'display': 'flow-display',
    'curv-trap': 'flow-display',
    'curved-trapezoid': 'flow-display',

    'h-cyl': 'flow-directdata',
    'das': 'flow-directdata',
    'horizontal-cylinder': 'flow-directdata',

    'stored-data': 'flow-storeddata',
    'bow-rect': 'flow-storeddata',
    'bow-tie-rectangle': 'flow-storeddata',

    'internal-storage': 'flow-internal-storage',
    'win-pane': 'flow-internal-storage',
    'window-pane': 'flow-internal-storage',

    'card': 'flow-card',
    'notch-rect': 'flow-card',
    'notched-rectangle': 'flow-card',

    'collate': 'flow-collate',
    'hourglass': 'flow-collate',

    'loop-limit': 'flow-loop-limit',
    'notch-pent': 'flow-loop-limit',
    'notched-pentagon': 'flow-loop-limit',

    'merge': 'flow-merge',
    'flip-tri': 'flow-merge',
    'flipped-triangle': 'flow-merge',
    'manual-file': 'flow-merge',

    'manual-input': 'flow-manual-input',
    'sl-rect': 'flow-manual-input',
    'sloped-rectangle': 'flow-manual-input',

    'multi-document': 'flow-multi-document',
    'docs': 'flow-multi-document',
    'documents': 'flow-multi-document',
    'st-doc': 'flow-multi-document',
    'stacked-document': 'flow-multi-document',

    'summing-junction': 'flow-summing-junction',
    'cross-circ': 'flow-summing-junction',
    'crossed-circle': 'flow-summing-junction',
    'summary': 'flow-summing-junction',

    'paper-tape': 'flow-paper-tape',
    'flag': 'flow-paper-tape',

    'fork': 'flow-fork-join',
    'join': 'flow-fork-join',

    // BPMN Shapes Aliases
    'sm-circ': 'bpmn-small-start-event',
    'small-circle': 'bpmn-small-start-event',
    'start': 'bpmn-start-event',

    'dbl-circ': 'bpmn-intermediate-event',
    'double-circle': 'bpmn-intermediate-event',
    'doublecircle': 'bpmn-intermediate-event',

    'fr-circ': 'bpmn-end-event',
    'framed-circle': 'bpmn-end-event',
    'stop': 'bpmn-end-event',

    'database': 'bpmn-datasource',
    'db': 'bpmn-datasource',
    'lin-cyl': 'bpmn-datasource',
    'disk': 'bpmn-datasource',
    'lined-cylinder': 'bpmn-datasource',

    // Path Shapes Aliases
    'cloud': 'path-cloud',

    'bang': 'path-bang',

    'com-link': 'path-bolt',
    'bolt': 'path-bolt',
    'lightning-bolt': 'path-bolt',

    'comment': 'path-comment',
    'brace': 'path-comment',
    'brace-l': 'path-comment',

    'brace-r': 'path-brace-r',

    'braces': 'path-braces',

    'divided-process': 'path-divided',
    'div-rect': 'path-divided',
    'div-proc': 'path-divided',
    'divided-rectangle': 'path-divided',

    // NOTE: These appear in both flowShapes and pathShapes in original code
    // The path versions (with path data) are canonical since they're merged last
    'lin-doc': 'path-lined-doc',
    'lined-document': 'path-lined-doc',

    'lin-rect': 'path-lined-rect',
    'lin-proc': 'path-lined-rect',
    'lined-process': 'path-lined-rect',
    'lined-rectangle': 'path-lined-rect',
    'shaded-process': 'path-lined-rect',

    'tag-doc': 'path-tagged-doc',
    'tagged-document': 'path-tagged-doc',

    'tag-rect': 'path-tagged-rect',
    'tag-proc': 'path-tagged-rect',
    'tagged-process': 'path-tagged-rect',
    'tagged-rectangle': 'path-tagged-rect',

    'st-rect': 'path-stacked',
    'processes': 'path-stacked',
    'procs': 'path-stacked',
    'stacked-rectangle': 'path-stacked',

    'odd': 'path-odd',

    'text': 'text'
};

/**
 * Build shape map from canonical shapes and aliases
 * This eliminates code repetition - each shape is defined once
 * All aliases resolve to their canonical definitions
 * Width and height properties are included for all shapes
 *
 * @returns {Record<string, ShapeMapping>} A mapping of all shape names (including aliases) to their shape definitions
 */
function buildShapeMap(): { [key: string]: ShapeMapping } {
    const shapeMap: { [key: string]: ShapeMapping } = {};

    // First, add all canonical shapes
    const canonicalKeys: string[] = Object.keys(CANONICAL_SHAPES);
    for (let i: number = 0; i < canonicalKeys.length; i++) {
        const canonicalName: string = canonicalKeys[parseInt(i.toString(), 10)];
        const canonicalDef: ShapeMapping = CANONICAL_SHAPES[`${canonicalName}`];
        shapeMap[`${canonicalName}`] = {
            ej2Shape: canonicalDef.ej2Shape,
            pathData: canonicalDef.pathData,
            showLabel: canonicalDef.showLabel,
            bpmnEvent: canonicalDef.bpmnEvent,
            width: canonicalDef.width,
            height: canonicalDef.height,
            annotationMargin: canonicalDef.annotationMargin
        };
    }

    // Then, add all aliases pointing to their canonical definitions
    const aliasKeys: string[] = Object.keys(SHAPE_ALIASES);
    for (let i: number = 0; i < aliasKeys.length; i++) {
        const aliasName: string = aliasKeys[parseInt(i.toString(), 10)];
        const canonicalName: string = SHAPE_ALIASES[`${aliasName}`];
        const canonicalDef: ShapeMapping = CANONICAL_SHAPES[`${canonicalName}`];
        if (canonicalDef) {
            shapeMap[`${aliasName}`] = {
                ej2Shape: canonicalDef.ej2Shape,
                pathData: canonicalDef.pathData,
                showLabel: canonicalDef.showLabel,
                bpmnEvent: canonicalDef.bpmnEvent,
                width: canonicalDef.width,
                height: canonicalDef.height,
                annotationMargin: canonicalDef.annotationMargin
            };
        }
    }

    return shapeMap;
}

/**
 * Builds a reverse mapping from EJ2 shape (type, shape) to alias shape name for export
 * Prefers shorter alias names over canonical names for cleaner Mermaid output
 * This enables exporting any EJ2 shape as modern @{shape: name} syntax
 * @returns {Map<string, string>} Map from "Type|ShapeName" to preferred alias or canonical shape name
 */
function buildReverseShapeMap(): Map<string, string> {
    const reverseMap: Map<string, string> = new Map();

    // First, build a map from canonical name to its aliases (sorted by length for preference)
    const canonicalToAliases: { [key: string]: string[] } = {};
    const aliasKeys: string[] = Object.keys(SHAPE_ALIASES);
    for (let i: number = 0; i < aliasKeys.length; i++) {
        const aliasName: string = aliasKeys[parseInt(i.toString(), 10)];
        const canonicalName: string = SHAPE_ALIASES[`${aliasName}`];
        if (!canonicalToAliases[`${canonicalName}`]) {
            canonicalToAliases[`${canonicalName}`] = [];
        }
        canonicalToAliases[`${canonicalName}`].push(aliasName);
    }

    // Sort aliases by length (shorter ones first) for better export readability
    const canonicalNameKeys: string[] = Object.keys(canonicalToAliases);
    for (let i: number = 0; i < canonicalNameKeys.length; i++) {
        const canonicalName: string = canonicalNameKeys[parseInt(i.toString(), 10)];
        const aliases: string[] = canonicalToAliases[`${canonicalName}`];
        aliases.sort((a: string, b: string) => a.length - b.length);
    }

    // Now add canonical shapes, preferring their shortest alias
    const canonicalKeys: string[] = Object.keys(CANONICAL_SHAPES);
    for (let i: number = 0; i < canonicalKeys.length; i++) {
        const canonicalName: string = canonicalKeys[parseInt(i.toString(), 10)];
        const shapeMapping: ShapeMapping = CANONICAL_SHAPES[`${canonicalName}`];
        if (shapeMapping.ej2Shape) {
            // Create key from type, shape, and BPMN event (if present)
            // For BPMN shapes: "Bpmn|Event|End" to distinguish End vs Start vs Intermediate
            // For others: "Flow|Decision" as before
            let key: string = `${shapeMapping.ej2Shape.type}|${shapeMapping.ej2Shape.shape}`;
            if (shapeMapping.bpmnEvent) {
                key = key + `|${shapeMapping.bpmnEvent}`;
            }
            // Only set if not already present (first occurrence wins)
            if (!reverseMap.has(key)) {
                // Prefer a shorter alias if available, otherwise use canonical name
                const aliases: string[] = canonicalToAliases[`${canonicalName}`] || [];
                const exportName: string = aliases.length > 0 ? aliases[0] : canonicalName;
                reverseMap.set(key, exportName);
            }
        }
    }

    return reverseMap;
}

// Cached reverse map for shape export
const REVERSE_SHAPE_MAP: Map<string, string> = buildReverseShapeMap();

/**
 * Enhancement 2: Map modern Mermaid shape names to EJ2 shapes
 * Phase 2: Extended Mermaid JS Shapes - Support 40+ additional Mermaid shape types
 * Maps Mermaid shape names to available EJ2 shapes (BasicShape, FlowShape, BpmnShape) or path data
 * Includes width and height for consistent shape sizing
 * @param {string} modernShape - Modern shape name (rect, rounded, circle, bang, cloud, etc.)
 * @returns {ShapeMapping} EJ2 shape config, optional path data, label visibility, BPMN event type, and dimensions
 */
function mapModernShapeToLegacy(modernShape: string): ShapeMapping {
    const shapeMap: { [key: string]: ShapeMapping } = buildShapeMap();
    return shapeMap[`${modernShape}`] || { ej2Shape: { type: 'Basic', shape: 'Rectangle' }, showLabel: true, width: 90, height: 90 }; // Default to rectangle (90x90) if unknown
}

/**
 * Get shape based on the bracket
 * @param {string} text - The text to determine shape from
 * @returns {BasicShapeModel | FlowShapeModel | PathModel} The shape model
 */
function getShape(text: string): BasicShapeModel | FlowShapeModel | PathModel {
    let shape: FlowShapeModel | PathModel | BasicShapeModel = {};
    if (text.startsWith('(((')) {
        // Double circle Shape
        shape = { type: 'Path', data: 'M 0 0 A 1 1 0 0 0 7 0 A 1 1 0 0 0 0 0 M -1 0 A 1 1 0 0 0 8 0 A 1 1 0 0 0 -1 0' };
    } else if (text.startsWith('((')) {
        // Ellipse
        shape = { shape: 'Ellipse', type: 'Basic' };
    } else if (text.startsWith('([')) {
        // Stadium/Terminator Shape
        shape = { type: 'Flow', shape: 'Terminator' };
    } else if (text.startsWith('(')) {
        // Rounded rectangle Shape
        shape = { type: 'Basic', shape: 'Rectangle', cornerRadius: 5 };
    } else if (text.startsWith('[[')) {
        // Subprocess/Subroutine Shape
        shape = { type: 'Flow', shape: 'PreDefinedProcess' };
    } else if (text.startsWith('[/')) {
        if (text.endsWith('/]')) {
            // Parallelogram Shape
            shape = { type: 'Basic', shape: 'Parallelogram' };
        } else {
            // Trapezoid Shape
            shape = { type: 'Path', data: 'M 0 0 L 1 -1 L 5 -1 L 6 0 L 0 0' };
        }
    } else if (text.startsWith('[(')) {
        // Database/Cylinder Shape
        shape = { type: 'Path', data: 'M 0 1 L 0 6 C 2 7 4 7 6 6 L 6 1 C 5 0 1 0 0 1 C 1 2 5 2 6 1' };
    } else if (text.startsWith('[\\')) {
        if (text.endsWith('\\]')) {
            // Parallelogram Alt Shape
            shape = { type: 'Path', data: 'M 0 0 L 12 0 L 14 2 L 2 2 L 0 0' };
        } else {
            shape = { type: 'Path', data: 'M 0 0 L 5 0 L 4 1 L 1 1 L 0 0' };
        }
    } else if (text.startsWith('[')) {
        // Rectangle Shape
        shape = { type: 'Basic', shape: 'Rectangle' };
    } else if (text.startsWith('{{')) {
        // Hexagon Shape
        shape = { type: 'Path', data: 'M 0 0 L 2 -2 L 11 -2 L 13 0 L 11 2 L 2 2 L 0 0' };
    } else if (text.startsWith('{')) {
        // Rhombus/Diamond/Decision Shape
        shape = { type: 'Flow', shape: 'Decision' };
    } else if (text.startsWith('>')) {
        // Asymmetric Shape
        shape = { type: 'Path', data: 'M 0 0 L 8 0 L 8 2 L 0 2 L 2 1 L 0 0' };
    }
    return shape;
}
