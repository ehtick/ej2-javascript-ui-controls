import { Connector } from '../objects/connector';
import { Node, FlowShape, BasicShape } from '../objects/node';
import { NodeModel, BasicShapeModel, FlowShapeModel, PathModel } from '../objects/node-model';
import { ConnectorModel } from '../objects/connector-model';
import { HierarchyData, NodeData, SpaceLevel } from '../objects/interface/interfaces';
import { randomId } from '../utility/base-util';
import { Diagram } from '../diagram';

const bangShape: string = 'M0 0 a15.470625686645507,15.470625686645507 1 0,0 25.78437614440918,-3.7200001525878905 a15.470625686645507,15.470625686645507 1 0,0 25.78437614440918,0 a15.470625686645507,15.470625686645507 1 0,0 25.78437614440918,0 a15.470625686645507,15.470625686645507 1 0,0 25.78437614440918,3.7200001525878905 a15.470625686645507,15.470625686645507 1 0,0 15.470625686645507,12.276000503540038 a12.376500549316406,12.376500549316406 1 0,0 0,12.648000518798828 a15.470625686645507,15.470625686645507 1 0,0 -15.470625686645507,12.276000503540038 a15.470625686645507,15.470625686645507 1 0,0 -25.78437614440918,5.580000228881835 a15.470625686645507,15.470625686645507 1 0,0 -25.78437614440918,0 a15.470625686645507,15.470625686645507 1 0,0 -25.78437614440918,0 a15.470625686645507,15.470625686645507 1 0,0 -25.78437614440918,-5.580000228881835 a15.470625686645507,15.470625686645507 1 0,0 -10.313750457763673,-12.276000503540038 a12.376500549316406,12.376500549316406 1 0,0 0,-12.648000518798828 a15.470625686645507,15.470625686645507 1 0,0 10.313750457763673,-12.276000503540038 H0 V0 Z';
const cloudShape: string = 'M0 0 a16.18875045776367,16.18875045776367 0 0,1 26.981250762939453,-10.792500305175782 a37.77375106811523,37.77375106811523 1 0,1 43.17000122070313,-10.792500305175782 a26.981250762939453,26.981250762939453 1 0,1 37.77375106811523,21.585000610351564 a16.18875045776367,16.18875045776367 1 0,1 16.18875045776367,13.020000534057615 a21.585000610351564,21.585000610351564 1 0,1 -16.18875045776367,24.180000991821288 a26.981250762939453,16.18875045776367 1 0,1 -26.981250762939453,16.18875045776367 a37.77375106811523,37.77375106811523 1 0,1 -53.962501525878906,0 a16.18875045776367,16.18875045776367 1 0,1 -26.981250762939453,-16.18875045776367 a16.18875045776367,16.18875045776367 1 0,1 -10.792500305175782,-13.020000534057615 a21.585000610351564,21.585000610351564 1 0,1 10.792500305175782,-24.180000991821288 H0 V0 Z';

let mermaidNodeBaseCollection: NodeModel[] | ConnectorModel[] = [];

/**
 * Converts the diagram to Mermaid format and saves it.
 * If the diagram has a 'MindMap' layout, it will generate a Mermaid mind map.
 * @param {Diagram} diagram - The diagram instance.
 * @returns {string} - The Mermaid formatted string representing the diagram.
 */
export function saveMindmapDiagramInMermaidFormat(diagram: Diagram): string {
    let mermaidData: string = '';
    let dataSourceCollection: string[] = [];

    if (diagram.layout && diagram.layout.type === 'MindMap') {
        dataSourceCollection.push('mindmap');

        if (diagram.nodes.length > 0) {
            const rootNode: NodeModel = diagram.nodes.filter((node: NodeModel) => (node as Node).inEdges.length === 0)[0];
            const content: string = convertMindmapToMermaid(rootNode, 0, diagram);
            dataSourceCollection.push(content);

            const outConnectors: string[] = (rootNode as Node).outEdges;
            updateTextDataSource(dataSourceCollection, outConnectors, 1, diagram);
            dataSourceCollection = dataSourceCollection.filter((data: string) => data.trim() !== '');
            mermaidData = dataSourceCollection.join('\n');
        }
    }
    return mermaidData;
}

/**
 * Creates a text data source for sub-level children in a Mermaid diagram.
 * @param {string[]} dataSource - The data source to be updated.
 * @param {string[]} outEdges - The out edges of the current node.
 * @param {number} level - The level of the current node.
 * @param {Diagram} diagram - The diagram instance.
 * @returns {void} - Creates a text data source for sub-level children in a Mermaid diagram.
 */
function updateTextDataSource(dataSource: string[], outEdges: string[], level: number, diagram: Diagram): void {
    let count: number = 0;
    while (count < outEdges.length) {
        const connector: ConnectorModel = diagram.getObject(outEdges[parseInt(count.toString(), 10)]) as Connector;
        const targetNode: NodeModel = diagram.getObject(connector.targetID);
        const content: string = convertMindmapToMermaid(targetNode, level, diagram);
        dataSource.push(content);

        const childOutConnectors: string[] = (targetNode as Node).outEdges;
        if (childOutConnectors.length > 0) {
            updateTextDataSource(dataSource, childOutConnectors, level + 1, diagram);
        }
        count++;
    }
}

/**
 * Returns the text data source for the specified node in Mermaid format.
 * @param {NodeModel} node - The node for which the Mermaid data is to be generated.
 * @param {number} level - The level of the node in the diagram.
 * @param {Diagram} diagram - The diagram instance.
 * @returns {string} - The text data source for the specified node in Mermaid format.
 */
function convertMindmapToMermaid(node: NodeModel, level: number, diagram: Diagram): string {
    const nodeId: string = node.id;
    const spaceCount: number = (level + 1) * 2;
    const spaces: string = ' '.repeat(spaceCount);
    const annotationContent: string = node.annotations.length > 0
        ? node.annotations[0].content
        : '';
    let content: string = spaces + annotationContent;
    const spaceWithNodeId: string = spaces + nodeId;

    if (node.shape && node.shape.type === 'Basic') {
        const basicShape: BasicShapeModel = node.shape as BasicShape;
        if (basicShape.shape === 'Rectangle') {
            content = spaceWithNodeId + '[' + annotationContent + ']';
        } else if (basicShape.shape === 'Ellipse') {
            content = spaceWithNodeId + '((' + annotationContent + '))';
        } else if (basicShape.shape === 'Hexagon') {
            content = spaceWithNodeId + '{{' + annotationContent + '}}';
        }
    } else if (node.shape && node.shape.type === 'Flow') {
        const flowShape: FlowShapeModel = node.shape as FlowShape;
        if (flowShape.shape === 'Terminator') {
            content = spaceWithNodeId + '(' + annotationContent + ')';
        }
    } else if (node.shape && node.shape.type === 'Path') {
        const pathShape: PathModel = node.shape as PathModel;
        if (pathShape.data === bangShape) {
            content = spaceWithNodeId + '))' + annotationContent + '((';
        } else if (pathShape.data === cloudShape) {
            content = spaceWithNodeId + ')' + annotationContent + '(';
        }
    }

    return content;
}

/**
 * Counts the number of leading spaces in the specified string.
 * @param {string} word The string to check for leading spaces.
 * @returns { number } The number of leading spaces.
 */
function countLeadingSpaces(word: string): number {
    let i: number = 0;
    const length: number = word.length;

    // Loop through the string to count leading spaces
    while (i < length && word.charAt(i) === ' ') {
        i++;
    }

    // Return the number of leading spaces
    return i;
}

/**
 * Converts Mermaid data to Mindmap diagram
 * @param {string} data - The Mermaid data to be converted to a mindmap diagram.
 * @param {Diagram} diagram - The diagram instance.
 * @returns {void}
 */
export function convertMermaidToMindmap(data: string, diagram: Diagram): void {
    if (data && diagram.layout && diagram.layout.type === 'MindMap' && diagram.mindMapChartModule) {

        // Pre-process data to accumulate lines based on bracket depth
        const allLines: string[] = data.split(/\r?\n/);
        const processedLines: Array<{ line: string, leadingSpace: number }> = [];
        let bracketDepth: number = 0;
        let accumulatedLine: string = '';
        let accumulatedLeadingSpace: number = 0;

        for (let i: number = 0; i < allLines.length; i++) {
            const line: string = allLines[parseInt(i.toString(), 10)];
            const trimmedLine: string = line.trim();

            if (trimmedLine.length === 0) {
                continue;
            }

            // Count leading spaces only on first accumulated line
            if (accumulatedLine === '') {
                accumulatedLeadingSpace = countLeadingSpaces(line);
            }

            // Count bracket depth changes
            for (let j: number = 0; j < line.length; j++) {
                const char: string = line.charAt(j);
                if ('([{'.indexOf(char) !== -1) {
                    bracketDepth++;
                } else if (')]}'.indexOf(char) !== -1) {
                    bracketDepth--;
                }
            }

            accumulatedLine += (accumulatedLine ? '\n' : '') + line;

            // Process when bracket depth returns to 0
            if (bracketDepth === 0 && accumulatedLine.trim().length > 0) {
                processedLines.push({ line: accumulatedLine, leadingSpace: accumulatedLeadingSpace });
                accumulatedLine = '';
            }
        }

        // Process any remaining accumulated line
        if (accumulatedLine.trim().length > 0) {
            processedLines.push({ line: accumulatedLine, leadingSpace: accumulatedLeadingSpace });
        }
        diagram.clear();
        mermaidNodeBaseCollection = [];

        const dataStack: HierarchyData[] = [];
        let root: HierarchyData = null;
        let previousItem: HierarchyData = { text: '', children: [], currentLevel: 0, branch: 'Left' };
        const spaceAndItsLevels: SpaceLevel[] = [];
        const startLevel: number = 1;
        let haveBackticks: boolean = false;
        let isEndBackticks: boolean = false;
        let canCreateMindMap: boolean = false;
        if (processedLines.length > 0) {
            for (let index: number = 0; index < processedLines.length; index++) {
                const processedItem: { line: string; leadingSpace: number } = processedLines[parseInt(index.toString(), 10)];
                const word: string = processedItem.line;
                let level: number = 0;
                let text: string = '';
                let levelChar: string = ' ';
                const leadingWhiteSpace: number = processedItem.leadingSpace;
                const isStartBackticks: boolean = word.includes('"`');
                isEndBackticks = word.includes('`"');
                haveBackticks = isStartBackticks ? true : haveBackticks;
                canCreateMindMap = (!haveBackticks && !canCreateMindMap) ? leadingWhiteSpace === 0 && index > 0 : canCreateMindMap;

                if (haveBackticks && isEndBackticks && !isStartBackticks) {
                    previousItem.text += '\n' + word;
                    haveBackticks = false;
                    continue;
                }

                if (!isStartBackticks && haveBackticks) {
                    previousItem.text += '\n' + word;
                    continue;
                }

                haveBackticks = isEndBackticks ? false : haveBackticks;
                if (word.length > 0 && ((/\s/.test(word[0]) && index > 0) || (leadingWhiteSpace === 0))) {
                    const spaceIndex: number = spaceAndItsLevels.findIndex((space: SpaceLevel) =>
                        space.space === leadingWhiteSpace.toString());

                    if (spaceIndex !== -1) {
                        for (let i: number = spaceAndItsLevels.length - 1; i >= 0; i--) {
                            const currentSpace: SpaceLevel = spaceAndItsLevels[parseInt(i.toString(), 10)];
                            const currentKey: number = parseFloat(currentSpace.space);

                            if (currentKey > leadingWhiteSpace) {
                                spaceAndItsLevels.splice(i, 1); // Remove the element at index i
                            } else if (currentKey < leadingWhiteSpace) {
                                spaceAndItsLevels.push({ space: leadingWhiteSpace.toString(), level: currentSpace.level + 1 });
                                level = currentSpace.level + 1;
                                break;
                            } else if (currentKey === leadingWhiteSpace) {
                                level = currentSpace.level;
                                break;
                            }
                        }
                    }
                    else {
                        if (spaceAndItsLevels.length === 0) {
                            spaceAndItsLevels.push({ space: leadingWhiteSpace.toString(), level: startLevel });
                            level = startLevel;
                        } else {
                            for (let i: number = spaceAndItsLevels.length - 1; i >= 0; i--) {
                                const currentElement: SpaceLevel = spaceAndItsLevels[parseInt(i.toString(), 10)];
                                const currentKey: number = parseFloat(currentElement.space);

                                if (currentKey > leadingWhiteSpace) {
                                    spaceAndItsLevels.splice(i, 1); // Remove the element at index i
                                } else {
                                    const lastElement: SpaceLevel = spaceAndItsLevels[spaceAndItsLevels.length - 1];
                                    spaceAndItsLevels.push({ space: leadingWhiteSpace.toString(), level: lastElement.level + 1 });
                                    break;
                                }
                            }
                            level = spaceAndItsLevels[spaceAndItsLevels.length - 1].level;
                        }
                    }

                    text = word.trim().replace(/^[+-]/, '');
                    levelChar = ' ';
                }
                const currentItem: HierarchyData = {
                    text: text,
                    branch: undefined,
                    children: [],
                    currentLevel: index === 0 ? 0 : level - 1
                };

                if (dataStack.length > 0) {
                    while (dataStack.length >= level) {
                        if (dataStack.length === 0) { break; }
                        dataStack.pop();
                    }

                    if (dataStack.length > 0) {
                        dataStack[dataStack.length - 1].children.push(currentItem);
                    }
                } else {
                    root = currentItem;
                }

                dataStack.push(currentItem);
                previousItem = currentItem;

            }
            // Create dataSource
            const hierarchyDataSource: HierarchyData = dataStack[0];

            if (hierarchyDataSource.text === 'mindmap' || canCreateMindMap) {
                if (canCreateMindMap) {
                    const nodeDetails: NodeData = getNodeDetails(hierarchyDataSource);
                    const nodeObj: NodeModel = {
                        id: nodeDetails.nodeId,
                        shape: nodeDetails.nodeShapeData,
                        annotations: [
                            { content: nodeDetails.annotationContent }
                        ]
                    };
                    (mermaidNodeBaseCollection as NodeModel[]).push(nodeObj);
                    createDataSource(hierarchyDataSource.children, hierarchyDataSource, nodeObj.id, diagram);
                } else {
                    const hierarchyData: HierarchyData = hierarchyDataSource.children[0];
                    const nodeData: NodeData = getNodeDetails(hierarchyData);
                    const node: NodeModel = {
                        id: nodeData.nodeId,
                        shape: nodeData.nodeShapeData,
                        annotations: [
                            { content: nodeData.annotationContent }
                        ]
                    };
                    (mermaidNodeBaseCollection as NodeModel[]).push(node);
                    createDataSource(hierarchyData.children, hierarchyData, node.id, diagram);
                }
                diagram.addElements(mermaidNodeBaseCollection);
                diagram.doLayout();
            }
        }
    }
}

/**
 * Creates a data source for the Mermaid diagram based on the provided hierarchy data.
 * @param { HierarchyData[] } data The list of hierarchy data to process.
 * @param { HierarchyData } parent The parent hierarchy data.
 * @param { string } parentId The ID of the parent node.
 * @param { Diagram } diagram - The diagram instance.
 * @returns { void }
 */
function createDataSource(data: HierarchyData[], parent: HierarchyData, parentId: string, diagram: Diagram): void {
    let index: number = 0;

    while (index < data.length) {
        const child: HierarchyData = data[parseInt(index.toString(), 10)];
        const nodeData: NodeData = getNodeDetails(child);

        const node: NodeModel = {
            id: nodeData.nodeId,
            shape: nodeData.nodeShapeData,
            annotations: [
                { content: nodeData.annotationContent }
            ]
        };

        const connector: ConnectorModel = {
            sourceID: parentId,
            targetID: node.id
        };

        (mermaidNodeBaseCollection as NodeModel[]).push(node);
        (mermaidNodeBaseCollection as ConnectorModel[]).push(connector);

        createDataSource(child.children, child, node.id, diagram);
        index++;
    }
}

/**
 * Retrieves the node details based on the provided hierarchy data for a mermaid diagram.
 * @param { HierarchyData } hierarchyData The hierarchy data.
 * @returns { NodeData } The node details.
 */
function getNodeDetails(hierarchyData: HierarchyData): NodeData {
    const pattern: RegExp = /^(.*?)\s*([\\[\\(\\{][\s\S]*?[\]\\)\\}]|[)\\(][\s\S]*|[)\\{][\s\S]*|[)\\(][^{}()\\[\]]*$)/;
    const annotationContent: string = hierarchyData.text;
    const match: RegExpMatchArray = annotationContent.match(pattern);
    let nodeId: string = randomId();
    let annotationText: string = hierarchyData.text;
    let shape: BasicShapeModel | FlowShapeModel | PathModel = { type: 'Basic', shape: 'Rectangle' };

    if (match) {
        nodeId = match[1] ? match[1] : nodeId;
        const content: string = match[2].trim().replace(/["`]/g, '');
        const firstCharacter: string = content.charAt(0);

        if (firstCharacter === '[') {
            annotationText = content.slice(1, -1);
        } else if (firstCharacter === '(') {
            if (content.startsWith('((')) {
                annotationText = content.slice(2, -1);
            } else {
                annotationText = content.slice(1, -1);
            }
            shape = content.startsWith('((') ?
                { type: 'Basic', shape: 'Ellipse' } :
                { type: 'Flow', shape: 'Terminator' };
        }
        else if (firstCharacter === ')') {
            if (content.startsWith('))')) {
                annotationText = content.slice(2, -2);
            } else {
                annotationText = content.slice(1, -1);
            }
            shape = content.startsWith('))') ?
                { type: 'Path', data: bangShape } :
                { type: 'Path', data: cloudShape };
        } else if (firstCharacter === '{') {
            annotationText = content.slice(2, -1);
            shape = { type: 'Basic', shape: 'Hexagon' };
        }
    }

    return {
        nodeId: nodeId,
        annotationContent: annotationText,
        nodeShapeData: shape
    };
}
