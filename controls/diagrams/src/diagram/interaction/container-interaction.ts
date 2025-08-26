import { isBlazor } from '@syncfusion/ej2-base';
import { BpmnShapeModel, NodeModel, SwimLaneModel } from '../objects/node-model';
import { Node, SwimLane } from '../objects/node';
import { Diagram } from '../diagram';
import { ConnectorModel } from '../objects/connector-model';
import { Connector } from '../objects/connector';
import { PointModel } from '../primitives/point-model';
import { SelectorModel } from '../objects/node-model';
import { Selector } from '../objects/node';
import { Size } from '../primitives/size';
import { cloneObject } from './../utility/base-util';
import { getObjectType } from './../utility/diagram-util';
import { HistoryEntry } from '../diagram/history';
import { GridPanel, GridRow } from '../core/containers/grid';
import { Canvas } from '../core/containers/canvas';
import { Rect } from '../primitives/rect';
import { getAdornerLayerSvg } from '../utility/dom-util';
import { DiagramElement } from '../core/elements/diagram-element';
import { StackEntryObject } from '../objects/interface/IElement';
import { Actions } from './actions';
import { GroupableView } from '../core/containers/container';
import { LaneModel } from '../objects/node-model';
import { swimLaneMeasureAndArrange, checkLaneSize, checkPhaseOffset, canLaneInterchange } from '../utility/swim-lane-util';
import { updatePhaseMaxWidth, updateHeaderMaxWidth, updateConnectorsProperties } from '../utility/swim-lane-util';
import { considerSwimLanePadding } from '../utility/swim-lane-util';
import { DiagramAction, DiagramConstraints, NodeConstraints } from '../enum/enum';
import { getDiagramElement } from '../utility/dom-util';
import { LayerModel } from '../diagram/layer-model';
import { Layer } from '../diagram/layer';

/**
 * Interaction for Container
 */

//#region canvas Container interaction

/**
 * updateCanvasBounds method\
 *
 * @returns {  void }    updateCanvasBounds method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @param {PointModel} position - provide the position value.
 * @param {boolean} isBoundsUpdate - provide the isBoundsUpdate value.
 * @private
 */
export function updateCanvasBounds(
    diagram: Diagram, obj: NodeModel | ConnectorModel, position: PointModel, isBoundsUpdate: boolean): boolean {
    let container: NodeModel; const connectorList: string[] = []; let groupAction: boolean = false;
    if (checkParentAsContainer(diagram, obj, true)) {
        diagram.protectPropertyChange(true);
        container = diagram.nameTable[(obj as Node).parentId];
        const wrapper: Canvas = container.wrapper as Canvas;
        if (diagram.selectedItems.nodes.length > 1) {
            (diagram as any).multiselect = true;
        } else {
            (diagram as any).multiselect = false;
        }
        if (container && container.container.type === 'Canvas') {
            if ((isBoundsUpdate || (wrapper.bounds.x <= position.x && wrapper.bounds.right >= position.x &&
                (wrapper.bounds.y <= position.y && wrapper.bounds.bottom >= position.y) && !(diagram as any).multiselect))) {
                let parentWrapper: GridPanel;
                const y: number = wrapper.bounds.y; const x: number = wrapper.bounds.x;

                const parent: NodeModel = diagram.nameTable[(container as Node).parentId] || container;
                const shape: SwimLaneModel = parent.shape as SwimLaneModel;
                if (shape.type === 'SwimLane') {
                    groupAction = updateLaneBoundsAfterAddChild(container, parent, obj as NodeModel, diagram, true);
                } else {
                    const parent: NodeModel = diagram.nameTable[(container as Node).parentId] || container;
                    const shape: SwimLaneModel = parent.shape as SwimLaneModel;
                    parentWrapper = parent.wrapper as GridPanel;
                    if (wrapper.actualSize.width < wrapper.outerBounds.width &&
                        (!(wrapper.bounds.x > wrapper.outerBounds.x))) {
                        if (container.rowIndex !== undefined) {
                            //const columnIndex:number = parent.columns.length - 1;
                            parentWrapper.updateColumnWidth(container.columnIndex, wrapper.outerBounds.width, true);
                            if (shape.orientation === 'Horizontal' && shape.phaseSize) {
                                updatePhaseMaxWidth(parent, diagram, wrapper, container.columnIndex);
                            }
                            updateHeaderMaxWidth(diagram, parent);
                            diagram.drag(parent, x - wrapper.bounds.x, y - wrapper.bounds.y);
                        } else {
                            diagram.scale(
                                container, (1 + ((wrapper.outerBounds.width - wrapper.actualSize.width) / wrapper.actualSize.width)), 1,
                                ((wrapper.outerBounds.x < wrapper.bounds.x) ? { x: 1, y: 0.5 } : { x: 0, y: 0.5 }));
                        }
                    }
                    if (wrapper.actualSize.height < wrapper.outerBounds.height &&
                        (!(wrapper.bounds.y > wrapper.outerBounds.y))) {
                        if (container.rowIndex !== undefined) {
                            parentWrapper.updateRowHeight(container.rowIndex, wrapper.outerBounds.height, true);
                            diagram.drag(parent, x - wrapper.bounds.x, y - wrapper.bounds.y);
                        } else {
                            diagram.scale(
                                container, 1, (1 + ((wrapper.outerBounds.height - wrapper.actualSize.height) / wrapper.actualSize.height)),
                                ((wrapper.outerBounds.y < wrapper.bounds.y) ? { x: 0.5, y: 1 } : { x: 0.5, y: 0 }));
                        }
                    }
                }
            }
            diagram.select([obj as NodeModel]);
            updateConnectorsProperties(connectorList, diagram);
        }
        diagram.protectPropertyChange(false);
    }
    return groupAction;
}

/**
 * removeChildInContainer method\
 *
 * @returns {  void }    removeChildInContainer method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @param {PointModel} position - provide the position value.
 * @param {boolean} isBoundsUpdate - provide the isBoundsUpdate value.
 * @private
 */
export function removeChildInContainer(
    diagram: Diagram, obj: NodeModel | ConnectorModel, position: PointModel, isBoundsUpdate: boolean): void {
    let container: NodeModel; //let connectorList: string[] = [];
    if (checkParentAsContainer(diagram, obj, true) && !(diagram.cancelPositionChange)) {
        const isProtectedOnChange: string = 'isProtectedOnChange';
        const propertyChangeValue: boolean = diagram[`${isProtectedOnChange}`];
        diagram.protectPropertyChange(true);
        container = diagram.nameTable[(obj as Node).parentId];
        const wrapper: Canvas = container.wrapper as Canvas;
        if (container && container.container.type === 'Canvas') {
            if ((!isBoundsUpdate && (!(wrapper.bounds.x <= position.x && wrapper.bounds.right >= position.x &&
                (wrapper.bounds.y <= position.y && wrapper.bounds.bottom >= position.y))))) {
                if (!(obj.constraints & NodeConstraints.AllowMovingOutsideLane)) {
                    const undoObj: NodeModel = cloneObject(obj);
                    diagram.clearSelection();
                    removeChildrenInLane(diagram, obj as Node);
                    (obj as Node).parentId = '';
                    //EJ2-65676 - Exception throws on updating node annotation after drag and drop from swimlane to diagram canvas.
                    (obj as LaneChildrenState).parentObj = diagram;
                    (obj as LaneChildrenState).propName = 'nodes';
                    const entry: HistoryEntry = {
                        type: 'ChildCollectionChanged', category: 'Internal',
                        undoObject: undoObj, redoObject: cloneObject(obj)
                    };
                    diagram.addHistoryEntry(entry);
                    if (diagram.commandHandler.isContainer) {
                        diagram.commandHandler.isContainer = false;
                        diagram.endGroupAction();
                    }
                    moveSwinLaneChild(obj, diagram);
                }
            }
        }
        diagram.protectPropertyChange(propertyChangeValue);
    }
}


/**
 * findBounds method\
 *
 * @returns {  NodeModel | ConnectorModel  }    findBounds method .\
 * @param {NodeModel} obj - provide the diagram value.
 * @param {number} columnIndex - provide the isVertical value.
 * @param {boolean} isHeader - provide the isVertical value.
 * @private
 */
export function findBounds(obj: NodeModel, columnIndex: number, isHeader: boolean): Rect {
    const rect: Rect = new Rect();
    const rows: GridRow[] = ((obj as Node).shape.type === 'SwimLane') ?
        (obj.wrapper.children[0] as GridPanel).rows : (obj.wrapper as GridPanel).rows;
    for (let i: number = ((isHeader) ? 1 : 0); i < rows.length; i++) {
        rect.uniteRect(rows[parseInt(i.toString(), 10)].cells[parseInt(columnIndex.toString(), 10)].bounds);
    }
    return rect;
}

/**
 * createHelper method\
 *
 * @returns {  NodeModel | ConnectorModel  }    createHelper method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @private
 */
export function createHelper(diagram: Diagram, obj: Node): Node {
    let newObj: Node;
    const cloneObject: Node | Connector = {} as Node | Connector;
    for (const prop of Object.keys(obj)) {
        cloneObject[`${prop}`] = obj[`${prop}`];
    }
    if (getObjectType(obj) === Node) {
        newObj = new Node(diagram, 'nodes', cloneObject, true);
        newObj.id = obj.id;
        diagram.initObject(newObj as Node);
    }
    diagram.updateDiagramObject(newObj);
    return newObj;
}

/**
 * renderContainerHelper method\
 *
 * @returns {  NodeModel | ConnectorModel  }    renderContainerHelper method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @private
 */
export function renderContainerHelper(diagram: Diagram, obj: SelectorModel | NodeModel | ConnectorModel): NodeModel | ConnectorModel {
    diagram.enableServerDataBinding(false);
    let object: NodeModel | ConnectorModel; let container: Canvas;
    let nodes: NodeModel;
    if (!isBlazor()) {
        if (diagram.selectedObject.helperObject) {
            nodes = diagram.selectedObject.helperObject;
        } else if (diagram.selectedItems.nodes.length > 0 || diagram.selectedItems.connectors.length > 0) {
            if (obj instanceof Selector && obj.nodes.length + obj.connectors.length === 1) {
                object = (obj.nodes.length > 0) ? obj.nodes[0] : obj.connectors[0];
                container = diagram.selectedItems.wrapper.children[0] as Canvas;
            } else {
                object = obj as NodeModel;
                //Removed isBlazor code
                container = diagram.selectedItems.wrapper as Canvas;
            }
            diagram.selectedObject.actualObject = object as NodeModel;
            // Added below code to render helper object for multiselected nodes inside swimlane to avoid interaction related issues.
            const dragObject: NodeModel | ConnectorModel = object instanceof Selector
                ? ((object as Selector).nodes.length > 0 ? (object as Selector).nodes[0] : object) : object;
            diagram.selectedObject.actualObject = object as NodeModel;
            if ((!diagram.currentSymbol) && ((((dragObject as Node).isLane && canLaneInterchange(dragObject as Node, diagram) &&
                checkParentAsContainer(diagram, dragObject))
                || ((!(dragObject as Node).isLane) && checkParentAsContainer(diagram, dragObject))) ||
                ((diagram.constraints & DiagramConstraints.LineRouting) && diagram.selectedItems.nodes.length > 0))) {
                const node: NodeModel = {
                    id: 'helper',
                    rotateAngle: container.rotateAngle,
                    offsetX: container.offsetX, offsetY: container.offsetY,
                    minWidth: container.minWidth, minHeight: container.minHeight,
                    maxWidth: container.maxWidth, maxHeight: container.maxHeight,
                    width: container.actualSize.width,
                    height: container.actualSize.height,
                    style: { strokeDashArray: '2 2', fill: 'transparent', strokeColor: '#7D7D7D', strokeWidth: 2 }
                };
                nodes = createHelper(diagram, node as Node) as NodeModel;
                diagram.selectedObject.helperObject = nodes;
            }
        }
    }
    diagram.enableServerDataBinding(true);
    return nodes;
}

/**
 * checkParentAsContainer method\
 *
 * @returns {  void  }    checkParentAsContainer method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel | ConnectorModel} obj - provide the isVertical value.
 * @param {boolean} isChild - provide the isChild value.
 * @private
 */
export function checkParentAsContainer(diagram: Diagram, obj: NodeModel | ConnectorModel, isChild?: boolean): boolean {
    const parentNode: NodeModel = (isChild) ? diagram.nameTable[(obj as Node).parentId] :
        (diagram.nameTable[(obj as Node).parentId] || obj as Node);
    if (parentNode && parentNode.container) {
        return true;
    }
    return false;
}

/**
 * checkChildNodeInContainer method\
 *
 * @returns {  void  }    checkChildNodeInContainer method .\
 * @param {Diagram} diagram - provide the diagram value.
 * @param {NodeModel} obj - provide the isVertical value.
 * @private
 */
export function checkChildNodeInContainer(diagram: Diagram, obj: NodeModel): void {
    const parentNode: NodeModel = diagram.nameTable[(obj as Node).parentId];
    (obj as any).laneMargin = { left: obj.margin.left, right: obj.margin.right, top: obj.margin.top, bottom: obj.margin.bottom };
    //To handle the resize of bpmn node which has text annotation inside swimlane
    if ((obj as any).hasTextAnnotation) {
        for (let i: number = 0; i < (obj as Node).outEdges.length; i++) {
            const connector: ConnectorModel = diagram.nameTable[(obj as Node).outEdges[parseInt(i.toString(), 10)]];
            if ((connector as any).isBpmnAnnotationConnector) {
                const textNode: Node = diagram.nameTable[connector.targetID];
                const oldObject: any = {width: obj.wrapper.actualSize.width, height: obj.wrapper.actualSize.height,
                    offsetX: obj.wrapper.offsetX, offsetY: obj.wrapper.offsetY};
                const oldX: number = obj.wrapper.offsetX; const oldY: number = obj.wrapper.offsetY;
                const offset: PointModel =  diagram.getTextAnnotationOffset(obj as Node, textNode, oldObject, oldX, oldY);
                const difX: number = offset.x - oldX;
                const difY: number = offset.y - oldY;
                if (difX || difY || obj.width !== obj.wrapper.actualSize.width || obj.height !== obj.wrapper.actualSize.height) {
                    (obj as any).isResized = true;
                    if (!(obj as any).resizeDif) {
                        (obj as any).resizeDif = [];
                    }
                    (obj as any).resizeDif[textNode.id] = {x: difX, y: difY};
                }
            }
        }
    }
    if (parentNode && parentNode.container.type === 'Canvas') {
        obj.margin.left = (obj.offsetX - parentNode.wrapper.bounds.x - (obj.width / 2));
        obj.margin.top = (obj.offsetY - parentNode.wrapper.bounds.y - (obj.height / 2));
    }
    diagram.nodePropertyChange(obj as Node, {} as Node, {
        width: obj.width, height: obj.height,
        offsetX: obj.offsetX, offsetY: obj.offsetY,
        margin: {
            left: obj.margin.left,
            right: obj.margin.right, top: obj.margin.top,
            bottom: obj.margin.bottom
        }, rotateAngle: obj.rotateAngle
    } as Node);
    //EJ2-913789 - Lane size gets varied upon undo redo the node drop
    if (diagram.undoRedoModule && parentNode && (parentNode as Node).isLane && diagram.undoRedoModule.checkRedo &&
        (obj.margin.left < 0 || obj.margin.top < 0)) {
        removeChildrenInLane(diagram, obj);
    }
    if (parentNode && !(parentNode as Node).isLane) {
        parentNode.wrapper.measure(new Size());
        parentNode.wrapper.arrange(parentNode.wrapper.desiredSize);
    }
}

function removeChildrenInLane(diagram: Diagram, node: NodeModel): void {
    if ((node as Node).parentId && (node as Node).parentId !== '') {
        const prevParentNode: Node = (diagram.nameTable[(node as Node).parentId] as Node);
        if (prevParentNode.isLane && prevParentNode.parentId) {
            const swimlane: NodeModel = diagram.nameTable[prevParentNode.parentId];
            const canvasId: string = (prevParentNode.id.slice(swimlane.id.length));
            const prevParentId: string = canvasId.substring(0, canvasId.length - 1);
            const lanes: LaneModel[] = (swimlane.shape as SwimLaneModel).lanes; let lane: LaneModel;
            for (let i: number = 0; i < lanes.length; i++) {
                lane = lanes[parseInt(i.toString(), 10)];
                if (prevParentId === lane.id) {
                    for (let j: number = 0; j < lane.children.length; j++) {
                        if (lane.children[parseInt(j.toString(), 10)].id === node.id) {
                            lane.children.splice(j, 1);
                            j--;
                        }
                    }
                }
            }
        }
        diagram.deleteChild(node);
    }
}
/**
 *
 * @param { NodeModel | ConnectorModel} obj - Provide the obj value.
 * @param { NodeModel } swimlane  - Provide the swimlane value.
 * @param { Diagram } diagram - Provide the diagram value.
 * @returns { void } updateZindex method .\
 * @private
 */
export function updateZindex(obj: NodeModel | ConnectorModel, swimlane: NodeModel, diagram: Diagram): void {
    const objLayer: LayerModel = diagram.commandHandler.getObjectLayer(obj.id);
    const zIndexTable: {} = (objLayer as Layer).zIndexTable;
    let targetZIndex: number = swimlane.zIndex + 1;
    // Find a unique zIndex
    while (zIndexTable[parseInt(targetZIndex.toString(), 10)] !== undefined) {
        targetZIndex++;
    }
    // Assign the unique zIndex to the node
    delete (objLayer as Layer).zIndexTable[obj.zIndex];
    obj.zIndex = targetZIndex;
    (objLayer as Layer).zIndexTable[parseInt(targetZIndex.toString(), 10)] = obj.id;
}

/**
 * addChildToContainer method\
 *
 * @returns {  void  }    addChildToContainer method .\
 * @param {DiagramElement} diagram - provide the element value.
 * @param {boolean} parent - provide the isVertical value.
 * @param {PointModel} node - provide the node value.
 * @param {Diagram} isUndo - provide the isUndo value.
 * @param {boolean} historyAction - provide the historyAction value.
 * @param {boolean} canUpdateZindex - provide the canUpdateZindex value.
 * @private
 */
export function addChildToContainer(diagram: Diagram, parent: NodeModel, node: NodeModel, isUndo?: boolean,
                                    historyAction?: boolean, canUpdateZindex?: boolean): void {
    if (!diagram.currentSymbol) {
        diagram.protectPropertyChange(true);
        let swimlane: NodeModel = diagram.nameTable[(parent as Node).parentId];
        node = diagram.getObject(node.id) || node;
        //Bug 909155: Issue in connecting nodes with ports.
        //When we add child nodes at runtime and perform undo redo, the child node is not selectable as the zIndex of swimlane is higher than child node.
        //Added below code to update the zIndex of the child node.
        if (swimlane && swimlane.zIndex > node.zIndex && canUpdateZindex) {
            updateZindex(node, swimlane, diagram);
        }
        const child: string | NodeModel = (diagram.nodes.indexOf(node) !== -1) ? node.id : node;
        if (parent.container.type === 'Canvas' && !historyAction) {
            const left: number = (node.wrapper.offsetX - node.wrapper.actualSize.width / 2) -
                (parent.wrapper.offsetX - parent.wrapper.actualSize.width / 2);
            const top: number = (node.wrapper.offsetY - node.wrapper.actualSize.height / 2) -
                (parent.wrapper.offsetY - parent.wrapper.actualSize.height / 2);
            node.margin.left = left; node.margin.top = top;
        } else if (swimlane) {
            const swimLaneBounds: Rect = swimlane.wrapper.bounds;
            const parentBounds: Rect = parent.wrapper.bounds;
            if ((swimlane.shape as SwimLane).orientation === 'Horizontal') {
                node.margin.left -= parentBounds.x - swimLaneBounds.x;
            } else {
                const laneHeaderId: string = (parent as Node).parentId + (swimlane.shape as SwimLane).lanes[0].id + '_0_header';
                node.margin.top -= parentBounds.y - swimLaneBounds.y - diagram.nameTable[`${laneHeaderId}`].wrapper.bounds.height;
            }
        }
        const container: NodeModel = diagram.nameTable[parent.id];
        if (!container.children) { container.children = []; }
        if (container.children.indexOf(node.id) === -1) {
            removeChildrenInLane(diagram, node);

            if (diagram.getObject(node.id)) {
                diagram.removeElements(node);
            }
            const undoObj: NodeModel = cloneObject(node);
            diagram.addChild(container, child);
            node = diagram.getObject(node.id);
            if ((container as Node).isLane && (container as Node).parentId) {
                swimlane = diagram.nameTable[(container as Node).parentId];
                const lanes: LaneModel[] = (swimlane.shape as SwimLaneModel).lanes;
                const canvasId: string = (container.id.slice(swimlane.id.length));
                const currentParentId: string = canvasId.substring(0, canvasId.length - 1);
                for (let i: number = 0; i < lanes.length; i++) {
                    if ((container as Node).isLane && currentParentId === lanes[parseInt(i.toString(), 10)].id) {
                        // eslint-disable-next-line
                        if (!((node as any).parentObj instanceof Diagram)) {
                            // eslint-disable-next-line
                            (node as any).parentObj = lanes[parseInt(i.toString(), 10)];
                        }
                        // 878719: Resolve ESLint errors
                        // eslint-disable-next-line no-prototype-builtins
                        if (!diagram.nameTable.hasOwnProperty(node.id)) {
                            lanes[parseInt(i.toString(), 10)].children.push(node);
                        }
                    }
                }
            }
            diagram.updateDiagramObject(node);
            moveSwinLaneChild(node, diagram);
            if (!(container as Node).parentId) {
                diagram.updateDiagramObject(container);
            } else if (!isUndo) {
                if (!(diagram as any).multiselect) {
                    updateLaneBoundsAfterAddChild(container, swimlane, node, diagram);
                } else {
                    considerSwimLanePadding(diagram, node, 20);
                    diagram.updateDiagramElementQuad();
                }
            }
            if (!(diagram.diagramActions & DiagramAction.UndoRedo)) {
                const entry: HistoryEntry = {
                    type: 'ChildCollectionChanged', category: 'Internal',
                    undoObject: undoObj, redoObject: cloneObject(node), historyAction: historyAction ? 'AddNodeToLane' : undefined
                };
                diagram.addHistoryEntry(entry);
            }
        }
        else if (!isUndo && (diagram as any).multiselect) {
            considerSwimLanePadding(diagram, node, 20);
            diagram.updateDiagramElementQuad();
        }
        diagram.protectPropertyChange(false);
    }
}

function moveSwinLaneChild(node: NodeModel | ConnectorModel, diagram: Diagram): void {
    const sourceNode: HTMLElement = getDiagramElement(node.id + '_groupElement', diagram.element.id);
    const targetId: string = ((node as Node).parentId ) ? (node as Node).parentId + '_groupElement' : diagram.element.id + '_diagramLayer';
    const targetNode: HTMLElement = getDiagramElement(targetId , diagram.element.id);
    if (sourceNode && targetNode) {
        targetNode.appendChild(sourceNode);
    }
}
export function updateLaneBoundsWithSelector(container: NodeModel, selector: SelectorModel,
                                             diagram: Diagram, isBoundsUpdate?: boolean): void {
    const swimLane: NodeModel = diagram.nameTable[(container as Node).parentId];
    const isSelector: boolean = true;
    updateLaneBoundsAfterAddChild(container, swimLane, selector, diagram, isBoundsUpdate, isSelector);
}
export function updateLaneBoundsAfterAddChild(
    container: NodeModel, swimLane: NodeModel, node: NodeModel | SelectorModel, diagram: Diagram, isBoundsUpdate?: boolean,
    isSelector?: boolean): boolean {
    const undoObject: NodeModel = cloneObject(container);
    let isUpdateRow: boolean;  let isUpdateColumn: boolean; let isGroupAction: boolean = false;
    const padding: number = (swimLane.shape as SwimLane).padding;
    const containerBounds: Rect = container.wrapper.bounds;
    const containerOuterBounds: Rect = container.wrapper.outerBounds;
    const nodeBounds: Rect = node.wrapper.bounds;
    if (swimLane && swimLane.shape.type === 'SwimLane' &&
        (containerBounds.right < nodeBounds.right + padding ||
        containerBounds.bottom < nodeBounds.bottom + padding || (isSelector && containerBounds.top > nodeBounds.top + padding))) {
        const grid: GridPanel = swimLane.wrapper.children[0] as GridPanel;
        const x: number = grid.bounds.x; const y: number = grid.bounds.y;
        let size: number;
        let headerSize: number;
        // EJ2-913788 Drag and drop a node with more size than lane height and width
        const isHeader: DiagramElement = container.wrapper.children.find((child: { id: string; }) => child.id.includes('header'));
        const isHorizontal: boolean = ((swimLane.shape as SwimLane).orientation === 'Horizontal');
        if (containerBounds.right < nodeBounds.right + padding &&
            containerOuterBounds.x <= containerBounds.x) {
            if (isHorizontal && isHeader) {
                headerSize = isHeader ? isHeader.width : 0;
                size = (nodeBounds.right - containerBounds.right) + (containerBounds.left - nodeBounds.left) +
                    headerSize + padding * 2;
            }
            else {
                size = (nodeBounds.right - containerBounds.right) + (containerBounds.left - nodeBounds.left) + padding * 2;
            }
            // size = nodeBounds.right - containerBounds.right;
            isUpdateColumn = true;
            grid.updateColumnWidth(container.columnIndex, containerBounds.width + size, true, padding);
        }
        if (containerBounds.bottom < nodeBounds.bottom + padding &&
            containerOuterBounds.y <= containerBounds.y) {
            if (!isHorizontal && isHeader) {
                headerSize = isHeader ? isHeader.height : 0;
                size = (nodeBounds.bottom - containerBounds.bottom) + (containerBounds.top - nodeBounds.top) +
                    headerSize + padding * 2;
            }
            else {
                size = (nodeBounds.bottom - containerBounds.bottom) + (containerBounds.top - nodeBounds.top) + padding * 2;
            }
            // size = nodeBounds.bottom - containerBounds.bottom;
            isUpdateRow = true;
            grid.updateRowHeight(container.rowIndex, containerBounds.height + size, true, padding);
        }
        if (isSelector && containerBounds.top > nodeBounds.top - padding &&
            containerOuterBounds.y <= containerBounds.y) {
            if (!isHorizontal && isHeader) {
                headerSize = isHeader ? isHeader.height : 0;
                size = (containerBounds.top - nodeBounds.top) + (nodeBounds.bottom - containerBounds.bottom) +
                    headerSize + padding * 2;
            } else {
                size = (containerBounds.top - nodeBounds.top) + (nodeBounds.bottom - containerBounds.bottom) + padding * 2;
            }
            // Adjust the size based on the top boundary difference
            if (size > 0) {
                isUpdateRow = true;
                grid.updateRowHeight(container.rowIndex, containerBounds.height + size, true, padding);
            }
        }
        diagram.isRowHeightUpdate = isUpdateRow;
        if (!(diagram.diagramActions & DiagramAction.UndoRedo)) {
            if (isBoundsUpdate) {
                diagram.startGroupAction();
                isGroupAction = true;
            }
            if (isUpdateRow) {
                const entry: HistoryEntry = {
                    category: 'Internal',
                    type: 'RowHeightChanged',
                    undoObject: undoObject, redoObject: cloneObject(container)
                };
                diagram.addHistoryEntry(entry);
            }
            if (isUpdateColumn) {
                const entry: HistoryEntry = {
                    category: 'Internal',
                    type: 'ColumnWidthChanged',
                    undoObject: undoObject, redoObject: cloneObject(container)
                };
                diagram.addHistoryEntry(entry);
            }
        }
        swimLane.width = swimLane.wrapper.width = grid.width;
        swimLane.height = swimLane.wrapper.height = grid.height;
        swimLaneMeasureAndArrange(swimLane);
        if ((swimLane.shape as SwimLaneModel).orientation === 'Horizontal') {
            updatePhaseMaxWidth(swimLane, diagram, container.wrapper as Canvas, container.columnIndex);
        }
        updateHeaderMaxWidth(diagram, swimLane);
        diagram.drag(swimLane, x - grid.bounds.x, y - grid.bounds.y);
        checkPhaseOffset(swimLane, diagram);
        checkLaneSize(swimLane);
    }
    if (!isSelector) {
        considerSwimLanePadding(diagram, node as NodeModel, padding);
    }
    diagram.updateDiagramElementQuad();
    return isGroupAction;
}


//#endregion

//# reginon stack panel interaction

/**
 * renderStackHighlighter method\
 *
 * @returns {  void  }    renderStackHighlighter method .\
 * @param {DiagramElement} element - provide the element value.
 * @param {boolean} isVertical - provide the isVertical value.
 * @param {PointModel} position - provide the position value.
 * @param {Diagram} diagram - provide the diagram value.
 * @param {boolean} isUml - provide the isUml value.
 * @param {boolean} isSwimlane - provide the isSwimlane value.
 * @private
 */
export function renderStackHighlighter(
    element: DiagramElement, isVertical: boolean, position: PointModel, diagram: Diagram, isUml?: boolean, isSwimlane?: boolean): void {
    const adornerSvg: SVGElement = getAdornerLayerSvg(diagram.element.id);
    diagram.diagramRenderer.renderStackHighlighter(
        element, adornerSvg, diagram.scroller.transform, isVertical, position, isUml, isSwimlane);
}

/**
 * moveChildInStack method\
 *
 * @returns {  void }    moveChildInStack method .\
 * @param {Node} sourceNode - provide the sourceNode value.
 * @param {Node} target - provide the target value.
 * @param {Diagram} diagram - provide the diagram value.
 * @param {Actions} action - provide the action value.
 * @private
 */
export function moveChildInStack(sourceNode: Node, target: Node, diagram: Diagram, action: Actions): void {
    const obj: Node = sourceNode;
    const parent: Node = diagram.nameTable[(obj as Node).parentId];
    const sourceParent: Node = diagram.nameTable[(obj as Node).parentId];
    if (target && sourceParent && sourceParent.container && sourceParent.container.type === 'Stack' &&
        target.container && target.container.type === 'Stack' && (sourceParent.id !== target.parentId)) {
        const value: number = sourceParent.wrapper.children.indexOf(obj.wrapper);
        if (value > -1) {
            diagram.nameTable[obj.id].parentId = target.id;
            sourceParent.wrapper.children.splice(value, 1);
        }
    }
    if (target && target.parentId && (obj as Node).parentId && action === 'Drag' &&
        sourceParent.container && sourceParent.container.type === 'Stack') {
        const targetIndex: number = parent.wrapper.children.indexOf(target.wrapper);
        const sourceIndex: number = parent.wrapper.children.indexOf(obj.wrapper);
        const undoElement: StackEntryObject = {
            targetIndex: targetIndex, target: target,
            sourceIndex: sourceIndex, source: sourceNode
        };
        parent.wrapper.children.splice(sourceIndex, 1);
        parent.wrapper.children.splice(targetIndex, 0, obj.wrapper);
        const redoElement: StackEntryObject = {
            targetIndex: sourceIndex, target: target,
            sourceIndex: targetIndex, source: sourceNode
        };
        const entry: HistoryEntry = {
            type: 'StackChildPositionChanged', redoObject: redoElement as NodeModel,
            undoObject: undoElement as NodeModel, category: 'Internal'
        };
        diagram.commandHandler.addHistoryEntry(entry);
    }
}
// To set the parentObj and propName while removing child from lane.
/** @private */
export interface LaneChildrenState {
    parentObj: object;
    propName: string;
}
//#end region

//# region Swimlane rendering


//#end region
