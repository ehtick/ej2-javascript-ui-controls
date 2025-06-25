import { Diagram } from '../diagram';
import { ConnectorModel, OrthogonalSegmentModel } from '../objects/connector-model';
import { Connector } from '../objects/connector';
import { PointModel } from '../primitives/point-model';
import { NodeModel } from '../objects/node-model';
import { Node } from '../objects/node';
import { Rect } from '../primitives/rect';
import { findPoint, getIntersection, getOppositeDirection, getPortDirection } from '../utility/connector';
import { Direction } from '../enum/enum';
import { DiagramElement } from '../core/elements/diagram-element';
import { canEnableRouting } from '../utility/constraints-util';
import { GroupableView } from '../core/containers/container';


/**
 * Line Routing
 */

export class LineRouting {
    private size: number = 20;
    private startGrid: VirtualBoundaries;
    private noOfRows: number;
    private noOfCols: number;
    private width: number;
    private height: number;
    private diagramStartX: number;
    private diagramStartY: number;
    private intermediatePoints: PointModel[] = [];
    private gridCollection: VirtualBoundaries[][] = [];
    private startNode: NodeModel;
    private targetNode: NodeModel;
    private targetGrid: VirtualBoundaries;
    private startArray: VirtualBoundaries[] = [];
    private targetGridCollection: VirtualBoundaries[] = [];
    private sourceGridCollection: VirtualBoundaries[] = [];
    private considerWalkable: VirtualBoundaries[] = [];
    public skipObstacleCheck: boolean = false;
    // collection of non-walkable grids
    private nonWalkableGrids: VirtualBoundaries[] = [];

    /**
     * lineRouting method \
     *
     * @returns { void }     lineRouting method .\
     * @param {Diagram} diagram - provide the source value.
     *
     * @private
     */
    public lineRouting(diagram: Diagram): void {
        const length: number = diagram.connectors.length;
        this.renderVirtualRegion(diagram);
        if (length > 0) {
            for (let k: number = 0; k < length; k++) {
                const connector: ConnectorModel = diagram.connectors[parseInt(k.toString(), 10)];
                if (connector.type === 'Orthogonal' && connector.visible) {
                    this.refreshConnectorSegments(diagram, connector as Connector, true);
                }
            }
        }
    }

    /** @private */
    /**
     * renderVirtualRegion method \
     *
     * @returns { void }     renderVirtualRegion method .\
     * @param {Diagram} diagram - provide the source value.
     * @param {boolean} isUpdate - provide the target value.
     *
     * @private
     */
    public renderVirtualRegion(diagram: Diagram, isUpdate?: boolean): void {
        /* tslint:disable */
        let extraBounds: number = this.size;
        if (diagram.spatialSearch['pageTop'] < 0 || diagram.spatialSearch['pageLeft'] < 0) {
            extraBounds = this.size + (this.size / 2);
        }
        const right: number = diagram.spatialSearch['pageRight'] + extraBounds;
        const bottom: number = diagram.spatialSearch['pageBottom'] + extraBounds;
        let left: number = diagram.spatialSearch['pageLeft'] - extraBounds;
        let top: number = diagram.spatialSearch['pageTop'] - extraBounds;
        left = left < 0 ? left - 20 : 0;
        top = top < 0 ? top - 20 : 0;
        /* tslint:enable */
        if ((isUpdate && (this.width !== (right - left) || this.height !== (bottom - top) ||
            this.diagramStartX !== left || this.diagramStartY !== top)) || isUpdate === undefined) {
            this.width = right - left; this.height = bottom - top;
            this.diagramStartX = left; this.diagramStartY = top;
            this.gridCollection = [];
            this.noOfRows = this.width / this.size;
            this.noOfCols = this.height / this.size;
            const size: number = this.size;
            let x: number = this.diagramStartX < 0 ? this.diagramStartX : 0;
            let y: number = this.diagramStartY < 0 ? this.diagramStartY : 0;
            for (let i: number = 0; i < this.noOfCols; i++) {
                for (let j: number = 0; j < this.noOfRows; j++) {
                    if (i === 0) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.gridCollection.push([0] as any);
                    }
                    const grid: VirtualBoundaries = {
                        x: x, y: y, width: size, height: size, gridX: j,
                        gridY: i, walkable: true, tested: undefined, nodeId: []
                    };
                    this.gridCollection[parseInt(j.toString(), 10)][parseInt(i.toString(), 10)] = grid;
                    x += size;
                }
                x = this.diagramStartX < 0 ? this.diagramStartX : 0;
                y += size;
            }
            // Clear the non-walkable grid collection
            if (this.nonWalkableGrids.length !== 0) {
                this.nonWalkableGrids.length = 0;
            }
        }
        const nodes: NodeModel[] = this.findNodes(diagram.nodes);
        this.updateNodesInVirtualRegion(nodes);
    }

    private findNodes(nodes: NodeModel[]): NodeModel[] {
        const objects: NodeModel[] = []; let node: Node;
        for (let i: number = 0; i < nodes.length; i++) {
            node = nodes[parseInt(i.toString(), 10)] as Node;
            if (node.shape.type !== 'SwimLane' && !node.isLane && !node.isPhase && !node.isHeader && node.visible) {
                objects.push(node);
            }
        }
        return objects;
    }

    private updateNodesInVirtualRegion(diagramNodes: NodeModel[]): void {
        const size: number = this.size;
        // Make non-walkable grids again walkable
        for (const grid of this.nonWalkableGrids) {
            grid.walkable = true;
            grid.tested = undefined;
            grid.nodeId = [];
            grid.parentNodeId = '';
        }
        // Clear the non-walkable grid collection
        if (this.nonWalkableGrids.length !== 0) {
            this.nonWalkableGrids.length = 0;
        }
        // Mark the grids that are occupied by nodes as non-walkable
        for (let i: number = 0; i < diagramNodes.length; i++) {
            const node: Node = diagramNodes[parseInt(i.toString(), 10)] as Node;
            const bounds: Rect = node.wrapper.bounds;
            if (bounds) {
                // Get grid that intersects with node bounds
                const grids: VirtualBoundaries[] = this.getGridsIntersectBounds(bounds);
                for (const grid of grids) {
                    const rectangle: Rect = new Rect(grid.x, grid.y, size, size);
                    // check whether node bounds intersects with grid bounds
                    const isContains: boolean = this.intersectRect(rectangle, bounds);
                    if (isContains) {
                        grid.nodeId.push(node.id);
                        grid.walkable = false;
                        this.nonWalkableGrids.push(grid);
                        if (node.parentId !== '') {
                            grid.parentNodeId = node.parentId;
                        }
                    }
                }
            }
        }
    }

    /**
     * Gets the grids that intersect with the node bounds.
     * @param {Rect} bounds - The starting point of the line segment.
     * @returns {VirtualBoundaries[]} An array of VirtualBoundaries that intersect with the line segment.
     * @private
     */
    public getGridsIntersectBounds(bounds: Rect): VirtualBoundaries[] {
        const grids: VirtualBoundaries[] = [];
        const minX: number = bounds.topLeft.x;
        const maxX: number = bounds.bottomRight.x;
        const minY: number = bounds.topLeft.y;
        const maxY: number = bounds.bottomRight.y;
        const gridSize: number = this.size;
        const minGridX: number = Math.floor((minX - this.diagramStartX) / gridSize);
        const minGridY: number = Math.floor((minY - this.diagramStartY) / gridSize);
        const maxGridX: number = Math.floor((maxX - this.diagramStartX) / gridSize);
        const maxGridY: number = Math.floor((maxY - this.diagramStartY) / gridSize);
        for (let x: number = minGridX; x <= maxGridX; x++) {
            for (let y: number = minGridY; y <= maxGridY; y++) {
                const gridRow: VirtualBoundaries[] = this.gridCollection[parseInt(x.toString(), 10)];
                if (gridRow) {
                    const grid: VirtualBoundaries = gridRow[parseInt(y.toString(), 10)];
                    if (grid && grids.indexOf(grid) === -1) {
                        grids.push(grid);
                    }
                }
            }
        }
        return grids;
    }

    private intersectRect(r1: Rect, r2: Rect): boolean {
        return !(r2.left >= r1.right || r2.right <= r1.left ||
            r2.top >= r1.bottom || r2.bottom <= r1.top);
    }

    private findEndPoint(connector: Connector, isSource: boolean, isPortBounds?: boolean): PointModel {
        let endPoint: PointModel; let portDirection: Direction;
        // EJ2-65876 - Exception occurs on line routing injection module
        if ((isSource && connector.sourcePortID !== '' && connector.sourcePortWrapper) || (!isSource && connector.targetPortID !== '' && connector.targetPortWrapper)) {
            endPoint = (isSource) ? { x: connector.sourcePortWrapper.offsetX, y: connector.sourcePortWrapper.offsetY } :
                { x: connector.targetPortWrapper.offsetX, y: connector.targetPortWrapper.offsetY };
            portDirection = getPortDirection(
                endPoint, undefined, (isSource) ? connector.sourceWrapper.bounds : connector.targetWrapper.bounds, false);
            const bounds: Rect = (isSource) ? connector.sourcePortWrapper.bounds : connector.targetPortWrapper.bounds;
            if (isPortBounds) {
                if (portDirection === 'Top') {
                    endPoint = { x: bounds.topCenter.x, y: bounds.topCenter.y };
                } else if (portDirection === 'Left') {
                    endPoint = { x: bounds.middleLeft.x, y: bounds.middleLeft.y };
                } else if (portDirection === 'Right') {
                    endPoint = { x: bounds.middleRight.x, y: bounds.middleRight.y };
                } else {
                    endPoint = { x: bounds.bottomCenter.x, y: bounds.bottomCenter.y };
                }
            } else {
                endPoint = { x: bounds.center.x, y: bounds.center.y };
            }
        }
        else {
            if ((isSource && this.startNode) || (!isSource && this.targetNode)) {
                endPoint = (isSource) ? { x: this.startNode.wrapper.offsetX, y: this.startNode.wrapper.offsetY } :
                    { x: this.targetNode.wrapper.offsetX, y: this.targetNode.wrapper.offsetY };
            } else {
                endPoint = (isSource) ? { x: connector.sourcePoint.x, y: connector.sourcePoint.y } :
                    { x: connector.targetPoint.x, y: connector.targetPoint.y };
            }
        }
        return endPoint;
    }


    /**
     * Gets the grids that intersect with the line segment defined by the start and end points.
     * @param {PointModel} startPoint - The starting point of the line segment.
     * @param {PointModel} endPoint - The ending point of the line segment.
     * @returns {VirtualBoundaries[]} An array of VirtualBoundaries that intersect with the line segment.
     * @private
     */
    public getGridsIntersect(startPoint: PointModel, endPoint: PointModel): VirtualBoundaries[] {
        const grids: VirtualBoundaries[] = [];
        const minX: number = Math.min(startPoint.x, endPoint.x);
        const minY: number = Math.min(startPoint.y, endPoint.y);
        const maxX: number = Math.max(startPoint.x, endPoint.x);
        const maxY: number = Math.max(startPoint.y, endPoint.y);
        const gridSize: number = this.size;
        const minGridX: number = Math.floor((minX - this.diagramStartX) / gridSize);
        const minGridY: number = Math.floor((minY - this.diagramStartY) / gridSize);
        const maxGridX: number = Math.floor((maxX - this.diagramStartX) / gridSize);
        const maxGridY: number = Math.floor((maxY - this.diagramStartY) / gridSize);
        const isHorizontal: boolean = maxX - minX > maxY - minY;
        if (isHorizontal) {
            for (let x: number = minGridX; x <= maxGridX; x++) {
                const gridRow: VirtualBoundaries[] = this.gridCollection[parseInt(x.toString(), 10)];
                if (gridRow) {
                    const grid: VirtualBoundaries = gridRow[parseInt(minGridY.toString(), 10)];
                    if (grid && grids.indexOf(grid) === -1) {
                        grids.push(grid);
                    }
                }
            }
        }
        else {
            for (let y: number = minGridY; y <= maxGridY; y++) {
                const gridRow: VirtualBoundaries[] = this.gridCollection[parseInt(minGridX.toString(), 10)];
                if (gridRow) {
                    const grid: VirtualBoundaries = gridRow[parseInt(y.toString(), 10)];
                    if (grid && grids.indexOf(grid) === -1) {
                        grids.push(grid);
                    }
                }
            }
        }

        return grids;
    }

    /**
     * Checks if the path between the start and end points is walkable.
     * @param {PointModel} startPoint - The starting point of the path.
     * @param {PointModel} endPoint - The ending point of the path.
     * @param {Diagram} diagram - The diagram instance.
     * @param {Connector} [connector] - The connector to check for obstacles.
     * @returns {boolean} True if the path is walkable, otherwise false.
     * @private
     */
    public isPathWalkable(startPoint: PointModel, endPoint: PointModel, diagram: Diagram, connector?: Connector): boolean {
        const minX: number = Math.min(startPoint.x, endPoint.x);
        const minY: number = Math.min(startPoint.y, endPoint.y);
        const maxX: number = Math.max(startPoint.x, endPoint.x);
        const maxY: number = Math.max(startPoint.y, endPoint.y);
        const grids: VirtualBoundaries[] = this.getGridsIntersect(startPoint, endPoint);
        for (let i: number = 0; i < grids.length; i++) {
            const grid: VirtualBoundaries = grids[parseInt(i.toString(), 10)];
            // Exclude grids that contain the source or target node
            if (connector && (grid.nodeId.indexOf(connector.sourceID) !== -1 || grid.nodeId.indexOf(connector.targetID) !== -1)) {
                continue;
            }
            if (!grid.walkable) {
                const isHorizontal: boolean = maxX - minX > maxY - minY;
                for (const nodeId of grid.nodeId) {
                    const node: NodeModel = diagram.nameTable[`${nodeId}`];
                    if (node) {
                        const bounds: Rect = node.wrapper.bounds;
                        const padding: number = 5;
                        if (isHorizontal) {
                            if (bounds.top - padding < minY && bounds.bottom + padding > maxY) {
                                return false;
                            }
                        } else {
                            if (bounds.left - padding < minX && bounds.right + padding > maxX) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    private checkObstaclesIntersect(segmentPoints: PointModel[], connector: Connector, diagram: Diagram): boolean {
        for (let i: number = 1; i < segmentPoints.length; i++) {
            const start: PointModel = segmentPoints[i - 1];
            const end: PointModel = segmentPoints[parseInt(i.toString(), 10)];
            if (!this.isPathWalkable(start, end, diagram, connector)) {
                return false;
            }
        }
        return true;
    }

    /**
     * refreshConnectorSegments method \
     *
     * @returns { void }     refreshConnectorSegments method .\
     * @param {Diagram} diagram - provide the diagram value.
     * @param {Connector} connector - provide the connector value.
     * @param {boolean} isUpdate - provide the diagram value.
     * @param {boolean} isEnableRouting - provide enableRouting value.
     *
     * @private
     */
    public refreshConnectorSegments(
        diagram: Diagram, connector: Connector, isUpdate: boolean, isEnableRouting?: boolean): void {
        if (!connector.sourceID || !connector.targetID || connector.sourceID === connector.targetID) {
            return;
        }
        if (!this.skipObstacleCheck && connector.segments && connector.segments.length < 2 && connector.intermediatePoints
            && this.checkObstaclesIntersect(connector.intermediatePoints, connector, diagram)) {
            if (diagram.avoidLineOverlappingModule && isUpdate) {
                diagram.avoidLineOverlappingModule.addConnector(connector);
                diagram.avoidLineOverlappingModule.refreshModifiedConnectors(diagram);
            }
            return;
        }
        const sourceId: string = connector.sourceID; const targetId: string = connector.targetID;
        const sourcePortID: string = connector.sourcePortID; const targetPortID: string = connector.targetPortID;
        let startPoint: PointModel; let targetPoint: PointModel; let sourcePortDirection: string; let targetPortDirection: string;
        let grid: VirtualBoundaries; let sourceTop: VirtualBoundaries; let sourceBottom: VirtualBoundaries; let isBreak: boolean;
        let sourceLeft: VirtualBoundaries; let sourceRight: VirtualBoundaries; let targetRight: VirtualBoundaries;
        let targetTop: VirtualBoundaries; let targetBottom: VirtualBoundaries; let targetLeft: VirtualBoundaries;
        if (canEnableRouting(connector, diagram) || isEnableRouting) {
            this.startNode = diagram.nameTable[`${sourceId}`]; this.targetNode = diagram.nameTable[`${targetId}`];
            this.intermediatePoints = []; this.startArray = []; this.targetGridCollection = []; this.sourceGridCollection = [];
            this.startGrid = undefined; this.targetGrid = undefined;
            for (let i: number = 0; i < this.noOfCols; i++) {
                for (let j: number = 0; j < this.noOfRows; j++) {
                    this.gridCollection[parseInt(j.toString(), 10)][parseInt(i.toString(), 10)].tested
                        = this.gridCollection[parseInt(j.toString(), 10)][parseInt(i.toString(), 10)].parent = undefined;
                    this.gridCollection[parseInt(j.toString(), 10)][parseInt(i.toString(), 10)].previousDistance
                        = this.gridCollection[parseInt(j.toString(), 10)][parseInt(i.toString(), 10)].afterDistance = undefined;
                    this.gridCollection[parseInt(j.toString(), 10)][parseInt(i.toString(), 10)].totalDistance = undefined;
                }
            }
            // Set the source point and target point
            startPoint = this.findEndPoint(connector, true); targetPoint = this.findEndPoint(connector, false);
            // Find the start grid and target grid
            for (let i: number = 0; i < this.noOfRows; i++) {
                for (let j: number = 0; j < this.noOfCols; j++) {
                    grid = this.gridCollection[parseInt(i.toString(), 10)][parseInt(j.toString(), 10)];
                    const rectangle: Rect = new Rect(grid.x, grid.y, grid.width, grid.height);
                    if (rectangle.containsPoint(startPoint) && !this.startGrid &&
                        (grid.nodeId.indexOf(sourceId) !== -1 || sourceId === '')) {
                        this.startGrid = (sourcePortID && this.startGrid &&
                            (sourcePortDirection === 'Left' || sourcePortDirection === 'Top')) ? this.startGrid : grid;
                    }
                    if (rectangle.containsPoint(targetPoint) && !this.targetGrid &&
                        (grid.nodeId.indexOf(targetId) !== -1 || targetId === '')) {
                        this.targetGrid = (targetPortID && this.targetGrid &&
                            (targetPortDirection === 'Left' || targetPortDirection === 'Top')) ? this.targetGrid : grid;
                    }
                    if (!sourcePortID && this.startNode) {
                        const bounds: Rect = this.startNode.wrapper.bounds;
                        if (rectangle.containsPoint(bounds.topCenter) && !sourceTop) { sourceTop = grid; }
                        if (rectangle.containsPoint(bounds.middleLeft) && !sourceLeft) { sourceLeft = grid; }
                        if (rectangle.containsPoint(bounds.middleRight) && !sourceRight) { sourceRight = grid; }
                        if (rectangle.containsPoint(bounds.bottomCenter) && !sourceBottom) {
                            sourceBottom = grid;
                        }
                    }
                    if (!targetPortID && this.targetNode) {
                        const bounds: Rect = this.targetNode.wrapper.bounds;
                        if (rectangle.containsPoint(bounds.topCenter) && !targetTop) { targetTop = grid; }
                        if (rectangle.containsPoint(bounds.middleLeft) && !targetLeft) { targetLeft = grid; }
                        if (rectangle.containsPoint(bounds.middleRight) && !targetRight) { targetRight = grid; }
                        if (rectangle.containsPoint({ x: bounds.bottomCenter.x, y: bounds.bottomCenter.y }) && !targetBottom) {
                            targetBottom = grid;
                        }
                    }
                }
            }
            this.findEdgeBoundary(sourcePortID, sourceLeft, sourceRight, sourceTop, sourceBottom, true);
            this.findEdgeBoundary(targetPortID, targetLeft, targetRight, targetTop, targetBottom, false);
            this.startGrid.totalDistance = 0; this.startGrid.previousDistance = 0;
            this.intermediatePoints.push({ x: this.startGrid.gridX, y: this.startGrid.gridY }); this.startArray.push(this.startGrid);
            if (connector && targetLeft && targetRight && targetTop && targetBottom) {
                this.checkObstacles(connector, diagram, targetLeft, targetRight, targetTop, targetBottom);
            }
            // eslint-disable-next-line no-labels
            renderPathElement: while (this.startArray.length > 0) {
                let startGridNode: VirtualBoundaries = this.startArray.pop();
                //890444:Exception thrown while drag and drop shapes on top of each other repeatedly with Line Routing
                if (startGridNode) {
                    for (let i: number = 0; i < this.targetGridCollection.length; i++) {
                        const target: VirtualBoundaries = this.targetGridCollection[parseInt(i.toString(), 10)];
                        if (startGridNode) {
                            if (startGridNode.gridX === target.gridX && startGridNode.gridY === target.gridY) {
                                this.getIntermediatePoints(startGridNode);
                                this.optimizeIntermediatePoints();
                                if (startGridNode.nodeId && startGridNode.nodeId.length > 1) {
                                    connector.segments = [];
                                }
                                isBreak = this.updateConnectorSegments(diagram, this.intermediatePoints,
                                                                       this.gridCollection, connector, isUpdate);
                                if (!isBreak) {
                                    this.targetGridCollection.splice(this.targetGridCollection.indexOf(target), 1);
                                    startGridNode = this.startArray.pop();
                                } else {
                                    this.considerWalkable = [];
                                    // eslint-disable-next-line no-labels
                                    break renderPathElement;
                                }
                            }
                        }
                    }
                    if (startGridNode) {
                        this.findPath(startGridNode);
                    }
                }
            }
        }
    }

    private checkChildNodes(grid: VirtualBoundaries, isSource: boolean): boolean {
        let check: boolean = false;
        let reject: boolean = false;
        if (grid.nodeId.length >= 1 && !isSource) {
            for (let i: number = 0; i < grid.nodeId.length; i++) {
                const id: string = grid.nodeId[parseInt(i.toString(), 10)];
                for (let j: number = 0; j < grid.nodeId.length; j++) {
                    if ((this.targetNode as Node).parentId === grid.nodeId[parseInt(j.toString(), 10)]) {
                        reject = true;
                    }
                }
                if (!reject && this.targetNode.id === id) {
                    check = true;
                } else {
                    check = false;
                }
            }
        } else {
            if (grid.nodeId.length === 1) {
                check = true;
            }
        }
        return check;
    }

    private findEdgeBoundary(
        portID: string, left: VirtualBoundaries, right: VirtualBoundaries,
        top: VirtualBoundaries, bottom: VirtualBoundaries, isSource?: boolean): void {

        let grid: VirtualBoundaries;
        const collection: VirtualBoundaries[] = (isSource) ? this.sourceGridCollection : this.targetGridCollection;
        if (!portID && ((isSource) ? this.startNode : this.targetNode)) {
            for (let i: number = left.gridX; i <= right.gridX; i++) {
                grid = this.gridCollection[parseInt(i.toString(), 10)][left.gridY];
                if ((this.checkChildNodes(grid, isSource) && (i === left.gridX || i === right.gridX)) ||
                    (i !== left.gridX && i !== right.gridX)) {
                    collection.push(grid);
                }
            }
            for (let i: number = top.gridY; i <= bottom.gridY; i++) {
                grid = this.gridCollection[top.gridX][parseInt(i.toString(), 10)];
                if (((this.checkChildNodes(grid, isSource) && (i === top.gridY || i === bottom.gridY)) ||
                    (i !== top.gridY && i !== bottom.gridY)) && collection.indexOf(grid) === -1) {
                    collection.push(grid);
                }
            }
        } else {
            collection.push((isSource) ? this.startGrid : this.targetGrid);
        }
    }

    private checkObstacles(
        connector: Connector, diagram: Diagram, targetLeft: VirtualBoundaries,
        targetRight: VirtualBoundaries, targetTop: VirtualBoundaries, targetBottom: VirtualBoundaries):
        void {
        let neigbours: VirtualBoundaries[] = this.findNearestNeigbours(this.startGrid, this.gridCollection, true);
        if (neigbours.length === 0) {
            if (connector.sourcePortID !== '') {
                const endPoint: PointModel = { x: connector.sourcePortWrapper.offsetX, y: connector.sourcePortWrapper.offsetY };
                const portDirection: Direction = getPortDirection(endPoint, undefined, connector.sourceWrapper.bounds, false);
                if (portDirection === 'Top') {
                    this.resetGridColl(this.startGrid, 'top', true);
                } else if (portDirection === 'Right') {
                    this.resetGridColl(this.startGrid, 'right', true);
                } else if (portDirection === 'Bottom') {
                    this.resetGridColl(this.startGrid, 'bottom', true);
                } else {
                    this.resetGridColl(this.startGrid, 'left', true);
                }
            } else {
                this.resetGridColl(this.startGrid, 'top', true);
                this.resetGridColl(this.startGrid, 'right', true);
                this.resetGridColl(this.startGrid, 'bottom', true);
                this.resetGridColl(this.startGrid, 'left', true);
            }
        }
        neigbours = this.findNearestNeigbours(this.targetGrid, this.gridCollection, false);
        if (neigbours.length === 0) {
            if (connector.targetPortID !== '') {
                const endPoint: PointModel = { x: connector.targetPortWrapper.offsetX, y: connector.targetPortWrapper.offsetY };
                const portDirection: Direction = getPortDirection(endPoint, undefined, connector.targetWrapper.bounds, false);
                if (portDirection === 'Top') {
                    this.resetGridColl(this.targetGrid, 'top', true);
                } else if (portDirection === 'Right') {
                    this.resetGridColl(this.targetGrid, 'right', true);
                } else if (portDirection === 'Bottom') {
                    this.resetGridColl(this.targetGrid, 'bottom', true);
                } else {
                    this.resetGridColl(this.targetGrid, 'left', true);
                }
            } else {
                this.resetGridColl(this.targetGrid, 'top', false);
                this.resetGridColl(this.targetGrid, 'right', false);
                this.resetGridColl(this.targetGrid, 'bottom', false);
                this.resetGridColl(this.targetGrid, 'left', false);
            }
        }
        if (this.targetGridCollection.length > 1 && this.targetGridCollection[0].nodeId.length > 1) {
            for (let i: number = 0; i <= 1; i++) {
                const gridX: number = this.targetGridCollection[parseInt(i.toString(), 10)].gridX;
                const gridY: number = this.targetGridCollection[parseInt(i.toString(), 10)].gridY;
                const gridNodes: string[] = this.targetGridCollection[parseInt(i.toString(), 10)].nodeId;
                let targetNode: string;
                for (let k: number = 0; k < gridNodes.length; k++) {
                    if (this.targetNode.id !== gridNodes[parseInt(k.toString(), 10)]) {
                        targetNode = gridNodes[parseInt(k.toString(), 10)];
                        break;
                    }
                }
                let targetNodewrapper: GroupableView;
                let overLapNode: GroupableView;
                let contains: boolean;
                if (diagram.nameTable[this.targetNode.id]) {
                    targetNodewrapper = diagram.nameTable[this.targetNode.id].wrapper;
                }
                if (diagram.nameTable[`${targetNode}`]) {
                    overLapNode = diagram.nameTable[`${targetNode}`].wrapper;
                }
                if (targetNodewrapper && overLapNode) {
                    contains = this.contains(overLapNode.bounds, targetNodewrapper.bounds);
                }
                let reject: boolean;
                for (let j: number = 0; j < gridNodes.length; j++) {
                    if ((this.targetNode as Node).parentId === gridNodes[parseInt(j.toString(), 10)]) {
                        reject = true;
                    }
                }
                if (!this.gridCollection[parseInt(gridX.toString(), 10)][parseInt(gridY.toString(), 10)].walkable && contains && !reject) {
                    let grid: VirtualBoundaries;
                    let diff: number;
                    grid = this.getEndvalue(targetLeft, 'left');
                    diff = targetLeft.gridX - grid.gridX;
                    this.changeValue(targetLeft, diff, 'left');

                    grid = this.getEndvalue(targetRight, 'right');
                    diff = grid.gridX - targetRight.gridX;
                    this.changeValue(targetRight, diff, 'right');

                    grid = this.getEndvalue(targetTop, 'top');
                    diff = targetTop.gridY - grid.gridY;
                    this.changeValue(targetTop, diff, 'top');

                    grid = this.getEndvalue(targetBottom, 'bottom');
                    diff = targetBottom.gridY - grid.gridY;
                    this.changeValue(targetBottom, diff, 'top');


                }
            }
        }
    }
    private contains(rect1: Rect, rect2: Rect): boolean {
        return rect1.left <= rect2.left && rect1.right >= rect2.right && rect1.top <= rect2.top && rect1.bottom >= rect2.bottom;
    }
    private getEndvalue(target: VirtualBoundaries, direction: string): VirtualBoundaries {
        if (!this.gridCollection[target.gridX][target.gridY].walkable) {
            if (direction === 'left') {
                return this.getEndvalue(this.gridCollection[target.gridX - 1][target.gridY], direction);
            }
            if (direction === 'right') {
                return this.getEndvalue(this.gridCollection[target.gridX + 1][target.gridY], direction);
            }
            if (direction === 'top') {
                return this.getEndvalue(this.gridCollection[target.gridX][target.gridY - 1], direction);
            }
            if (direction === 'bottom') {
                return this.getEndvalue(this.gridCollection[target.gridX][target.gridY + 1], direction);
            }

        } else {
            return target;
        }
        return target;
    }
    private changeValue(targetLeft: VirtualBoundaries, diff: number, direction: string): void {
        if (!targetLeft.walkable) {
            this.considerWalkable.push(targetLeft);
        }
        let grid: VirtualBoundaries;
        for (let i: number = 0; i <= diff; i++) {
            if (direction === 'left') {
                grid = this.gridCollection[targetLeft.gridX - i][targetLeft.gridY];
            } else if (direction === 'right') {
                grid = this.gridCollection[targetLeft.gridX + i][targetLeft.gridY];
            } else if (direction === 'top') {
                grid = this.gridCollection[targetLeft.gridX][targetLeft.gridY - i];
            } else if (direction === 'bottom') {
                grid = this.gridCollection[targetLeft.gridX][targetLeft.gridY + i];
            }
            if (!grid.walkable) {
                this.considerWalkable.push(grid);
            }
        }
    }

    // Get all the intermediated points from target grid
    private getIntermediatePoints(target: VirtualBoundaries): void {
        let distance: number; this.intermediatePoints = [];
        while (target) {
            this.intermediatePoints.push({ x: target.gridX, y: target.gridY });
            target = target.parent;
        }
        this.intermediatePoints.reverse();
        //890444: Exception thrown while drag and drop shapes on top of each other repeatedly with Line Routing
        if (this.intermediatePoints.length >= 1 && this.intermediatePoints[0] !== undefined
            && this.intermediatePoints[1] !== undefined) {
            if (this.intermediatePoints[0].x === this.intermediatePoints[1].x) {
                if (this.intermediatePoints[0].y < this.intermediatePoints[1].y) {
                    distance = this.neigbour(this.startGrid, 'bottom', undefined, true);
                    this.intermediatePoints[0].y += distance - 1;
                } else {
                    distance = this.neigbour(this.startGrid, 'top', undefined, true);
                    this.intermediatePoints[0].y -= distance - 1;
                }
            } else {
                if (this.intermediatePoints[0].x < this.intermediatePoints[1].x) {
                    distance = this.neigbour(this.startGrid, 'right', undefined, true);
                    this.intermediatePoints[0].x += distance - 1;
                } else {
                    distance = this.neigbour(this.startGrid, 'left', undefined, true);
                    this.intermediatePoints[0].x -= distance - 1;
                }
            }
        }
    }

    private optimizeIntermediatePoints(): void {
        this.intermediatePoints = this.removePointsInSameLine(this.intermediatePoints);
        this.intermediatePoints = this.getValidPoints(this.intermediatePoints);
    }

    private removePointsInSameLine(points: PointModel[]): PointModel[] {
        if (points.length < 3) {
            return points;
        }
        const result: PointModel[] = [points[0]];
        for (let i: number = 1; i < points.length - 1; i++) {
            const prevPoint: PointModel = result[result.length - 1];
            const currentPoint: PointModel = points[parseInt(i.toString(), 10)];
            const nextPoint: PointModel = points[i + 1];
            if (!this.arePointsInSameLine(prevPoint, currentPoint, nextPoint)) {
                result.push(currentPoint);
            }
        }
        result.push(points[points.length - 1]);
        return result;
    }

    private arePointsInSameLine(point1: PointModel, point2: PointModel, point3: PointModel): boolean {
        return (point2.x - point1.x) * (point3.y - point1.y) === (point3.x - point1.x) * (point2.y - point1.y);
    }

    private getValidPoints(points: PointModel[]): PointModel[] {
        if (points.length < 4) {
            return points;
        }
        let i: number = 1;
        while (i < points.length - 3) {
            const lineStart1: PointModel = points[parseInt(i.toString(), 10)];
            const lineEnd1: PointModel = points[i + 1];
            const lineStart2: PointModel = points[i + 2];
            const lineEnd2: PointModel = points[i + 3];
            if (lineStart1.x === lineEnd1.x) {
                if ((lineEnd1.y < lineStart1.y && lineEnd2.y < lineStart2.y)
                    || (lineEnd1.y > lineStart1.y && lineEnd2.y > lineStart2.y)) {
                    const dx: number = lineStart1.x < lineStart2.x ? 1 : -1;
                    const dy: number = lineEnd1.y < lineStart1.y ? -1 : 1;
                    let neigbourGridX: number = lineStart1.x + dx;
                    let neigbourGridY: number = lineStart1.y;
                    let isValid: boolean = false;
                    while (neigbourGridX !== lineEnd2.x || neigbourGridY !== lineEnd2.y) {
                        if (!this.isWalkable(neigbourGridX, neigbourGridY)) {
                            isValid = false;
                            break;
                        } else {
                            isValid = true;
                        }
                        if (neigbourGridX !== lineStart2.x) {
                            neigbourGridX += dx;
                        } else {
                            neigbourGridY += dy;
                        }
                    }
                    if (isValid) {
                        lineStart1.x = lineStart2.x;
                        points.splice(i + 1, 2);
                        continue;
                    }
                }
            } else if (lineStart1.y === lineEnd1.y) {
                if ((lineEnd1.x < lineStart1.x && lineEnd2.x < lineStart2.x)
                    || (lineEnd1.x > lineStart1.x && lineEnd2.x > lineStart2.x)) {
                    const dy1: number = lineStart1.y < lineStart2.y ? 1 : -1;
                    const dx1: number = lineEnd1.x < lineStart1.x ? -1 : 1;
                    let neigbourGridY1: number = lineStart1.y + dy1;
                    let neigbourGridX1: number = lineStart1.x;
                    let isValid1: boolean = false;
                    while (neigbourGridX1 !== lineEnd2.x || neigbourGridY1 !== lineEnd2.y) {
                        if (!this.isWalkable(neigbourGridX1, neigbourGridY1)) {
                            isValid1 = false;
                            break;
                        } else {
                            isValid1 = true;
                        }
                        if (neigbourGridY1 !== lineStart2.y) {
                            neigbourGridY1 += dy1;
                        } else {
                            neigbourGridX1 += dx1;
                        }
                    }
                    if (isValid1) {
                        lineStart1.y = lineStart2.y;
                        points.splice(i + 1, 2);
                        continue;
                    }
                }
            }
            i++;
        }
        return points;
    }

    // Connector rendering
    /* tslint:disable */
    private updateConnectorSegments(
        diagram: Diagram, intermediatePoints: PointModel[], gridCollection: VirtualBoundaries[][],
        connector: Connector, isUpdate: boolean): boolean {

        let segments: OrthogonalSegmentModel[] = []; let seg: OrthogonalSegmentModel; let targetPoint: PointModel;
        let pointX: number; let pointY: number; let node: VirtualBoundaries; const points: PointModel[] = [];
        let direction: Direction; let length: number; let currentdirection: Direction; let prevDirection: Direction;
        const targetWrapper: DiagramElement = connector.targetWrapper; const sourceWrapper: DiagramElement = connector.sourceWrapper;
        let sourcePoint: PointModel = this.findEndPoint(connector, true);

        if (connector.targetPortID !== '' || !connector.targetWrapper) {
            targetPoint = this.findEndPoint(connector, false, true);
        }

        for (let i: number = 0; i < intermediatePoints.length; i++) {
            node = gridCollection[intermediatePoints[parseInt(i.toString(), 10)].x][intermediatePoints[parseInt(i.toString(), 10)].y];
            if (node) {
                pointX = node.x + node.width / 2; pointY = node.y + node.height / 2;
                points.push({ x: pointX, y: pointY });
                if (i >= 1 && points.length > 1) {
                    if (points[points.length - 2].x !== points[points.length - 1].x) {
                        currentdirection = (points[points.length - 2].x > points[points.length - 1].x) ? 'Left' : 'Right';
                    } else {
                        currentdirection = (points[points.length - 2].y > points[points.length - 1].y) ? 'Top' : 'Bottom';
                    }
                }
                if (i >= 2 && prevDirection === currentdirection && points.length > 1) {
                    points.splice(points.length - 2, 1);
                }
                prevDirection = currentdirection;
            }
        }

        if (points && points.length > 1) {
            for (let j: number = 0; j < points.length - 1; j++) {
                const currentPoint: PointModel = points[parseInt(j.toString(), 10)];
                const nextPoint: PointModel = points[j + 1];

                if (currentPoint.x !== nextPoint.x) {
                    if (j === 0 && connector.sourcePortID === '' && sourceWrapper) {
                        sourcePoint = (currentPoint.x > nextPoint.x)
                            ? sourceWrapper.bounds.middleLeft : sourceWrapper.bounds.middleRight;
                    }
                    if (j === points.length - 2 && connector.targetPortID === '' && targetWrapper) {
                        targetPoint = (currentPoint.x > nextPoint.x)
                            ? targetWrapper.bounds.middleRight : targetWrapper.bounds.middleLeft;
                    }
                    if (j === 0 && sourcePoint) {
                        currentPoint.x = sourcePoint.x;
                        currentPoint.y = nextPoint.y = sourcePoint.y;
                        //Bug:849859 -set node bounds as source point if intersected point exists inside the node
                        if (connector.sourcePortID === '') {
                            const newDirection: string = currentPoint.x > nextPoint.x ? 'Left' : 'Right';
                            const refPoint: PointModel = findPoint(sourceWrapper.bounds, getOppositeDirection(newDirection));
                            sourcePoint = getIntersection(connector, sourceWrapper, sourcePoint, refPoint, false);
                        }
                        currentPoint.x = sourcePoint.x;
                    }
                    if (j === points.length - 2 && targetPoint) {
                        if (j > 0 && connector.targetDecorator &&
                            ((targetPoint.x - nextPoint.x) < 0) &&
                            (Math.abs(targetPoint.x - currentPoint.x) < connector.targetDecorator.width + 1)) {
                            currentPoint.x = points[j - 1].x -= this.size / 2;
                        }
                        if (j > 0 && connector.targetDecorator &&
                            ((targetPoint.x - nextPoint.x) > 0) &&
                            (Math.abs(targetPoint.x - currentPoint.x) < connector.targetDecorator.width + 1)) {
                            currentPoint.x = points[j - 1].x += this.size / 2;
                        }
                        nextPoint.x = targetPoint.x;
                        currentPoint.y = nextPoint.y = targetPoint.y;
                    }
                } else {
                    //EJ2-855805 - Connector target decorator is not proper in complexhierarchical layout when we call doLayout with line-routing
                    if (j === 0 && connector.sourcePortID === '' && sourceWrapper) {
                        sourcePoint = (currentPoint.y > nextPoint.y)
                            ? sourceWrapper.bounds.topCenter : sourceWrapper.bounds.bottomCenter;
                    }
                    if (j === points.length - 2 && connector.targetPortID === '' && targetWrapper) {
                        targetPoint = (currentPoint.y > nextPoint.y)
                            ? targetWrapper.bounds.bottomCenter : targetWrapper.bounds.topCenter;
                    }
                    if (j === 0 && sourcePoint) {
                        currentPoint.y = sourcePoint.y;
                        currentPoint.x = nextPoint.x = sourcePoint.x;
                        //Bug:849859 -set node bounds as source point if intersected point exists inside the node
                        if (connector.sourcePortID === '') {
                            const newDirection1: string = currentPoint.y > nextPoint.y ? 'Top' : 'Bottom';
                            const refPoint: PointModel = findPoint(sourceWrapper.bounds, getOppositeDirection(newDirection1));
                            sourcePoint = getIntersection(connector, sourceWrapper, sourcePoint, refPoint, false);
                        }
                        currentPoint.y = sourcePoint.y;
                    }
                    if (j === points.length - 2 && targetPoint) {
                        if (j > 0 && connector.targetDecorator &&
                            ((targetPoint.y - nextPoint.y) < 0) &&
                            (Math.abs(targetPoint.y - currentPoint.y) < connector.targetDecorator.height + 1)) {
                            currentPoint.y = points[j - 1].y -= this.size / 2;
                        }
                        if (j > 0 && connector.targetDecorator &&
                            ((targetPoint.y - nextPoint.y) > 0) &&
                            (Math.abs(targetPoint.y - currentPoint.y) < connector.targetDecorator.height + 1)) {
                            currentPoint.y = points[j - 1].y += this.size / 2;
                        }
                        nextPoint.y = targetPoint.y;
                        currentPoint.x = nextPoint.x = targetPoint.x;
                    }
                }
            }

            if (diagram.avoidLineOverlappingModule && isUpdate) {
                diagram.avoidLineOverlappingModule.addConnector(connector, points);
                const modifiedConnectors = diagram.avoidLineOverlappingModule.getModifiedConnector();
                if (modifiedConnectors.has(connector)) {
                    segments = diagram.avoidLineOverlappingModule.getModifiedConnectorSegments(connector);
                    modifiedConnectors.delete(connector);
                }

                if (modifiedConnectors.size > 0) {
                    diagram.avoidLineOverlappingModule.refreshModifiedConnectors(diagram);
                }
            }

            if (segments.length === 0) {
                for (let j: number = 0; j < points.length - 1; j++) {
                    const currentPoint: PointModel = points[parseInt(j.toString(), 10)];
                    const nextPoint: PointModel = points[j + 1];

                    if (currentPoint.x !== nextPoint.x) {
                        if (currentPoint.x > nextPoint.x) {
                            direction = 'Left'; length = currentPoint.x - nextPoint.x;
                        } else {
                            direction = 'Right'; length = nextPoint.x - currentPoint.x;
                        }
                    } else {
                        if (currentPoint.y > nextPoint.y) {
                            direction = 'Top'; length = currentPoint.y - nextPoint.y;
                        } else {
                            direction = 'Bottom'; length = nextPoint.y - currentPoint.y;
                        }
                    }
                    seg = { type: 'Orthogonal', length: length, direction: direction };
                    segments.push(seg);
                }
            }
        }

        if (segments && segments.length > 0) {
            let lastSeg: OrthogonalSegmentModel = segments[segments.length - 1];
            if (segments.length === 1) { lastSeg.length -= 20; }
            if (lastSeg.length < 10 && segments.length === 2) {
                segments.pop();
                if (segments.length > 0) {
                    segments[0].length -= 20;
                    lastSeg = segments[0];
                }
            }
            if (connector.targetDecorator &&
                ((lastSeg.direction === 'Top' || lastSeg.direction === 'Bottom') && lastSeg.length > connector.targetDecorator.height + 1) ||
                ((lastSeg.direction === 'Right' || lastSeg.direction === 'Left') && lastSeg.length > connector.targetDecorator.width + 1)) {
                if (isUpdate || !diagram.avoidLineOverlappingModule) {
                    connector.segments = segments;
                }
                if (isUpdate) {
                    diagram.connectorPropertyChange(
                        connector as Connector, {} as Connector, { type: 'Orthogonal', segments: segments } as Connector);
                }
                return true;
            }
        }

        return false;
    }
    /* tslint:enable */

    // Shortest path
    private findPath(startGrid: VirtualBoundaries): void {
        let intermediatePoint: PointModel; const collection: PointModel[] = [];
        const neigbours: VirtualBoundaries[] = this.findNearestNeigbours(startGrid, this.gridCollection, true);
        for (let i: number = 0; i < neigbours.length; i++) {
            intermediatePoint = this.findIntermediatePoints(
                neigbours[parseInt(i.toString(), 10)].gridX, neigbours[parseInt(i.toString(), 10)].gridY,
                startGrid.gridX, startGrid.gridY, this.targetGrid.gridX, this.targetGrid.gridY);
            if (intermediatePoint !== null) {
                const grid: VirtualBoundaries = this.gridCollection[intermediatePoint.x][intermediatePoint.y];
                let h: number = this.octile(
                    Math.abs(intermediatePoint.x - startGrid.gridX), Math.abs(intermediatePoint.y - startGrid.gridY));
                if (startGrid.parent && startGrid.parent.parent) {
                    if (grid.gridX !== startGrid.parent.gridX && grid.gridY !== startGrid.parent.gridY) {
                        h += 0.1;
                    }
                }
                const l: number = startGrid.previousDistance + h;
                if ((!grid.previousDistance || grid.previousDistance > l) &&
                    (!(intermediatePoint.x === startGrid.gridX && intermediatePoint.y === startGrid.gridY))) {
                    collection.push(intermediatePoint);
                    grid.previousDistance = l;
                    grid.afterDistance = grid.afterDistance || this.manhattan(
                        Math.abs(intermediatePoint.x - this.targetGrid.gridX), Math.abs(intermediatePoint.y - this.targetGrid.gridY));
                    grid.totalDistance = grid.previousDistance + grid.afterDistance;
                    grid.parent = startGrid;
                }
            }

        }
        if (collection.length > 0) {
            for (let i: number = 0; i < collection.length; i++) {
                const grid: VirtualBoundaries
                    = this.gridCollection[collection[parseInt(i.toString(), 10)].x][collection[parseInt(i.toString(), 10)].y];
                if (this.startArray.indexOf(grid) === -1) {
                    this.startArray.push(grid);
                }
            }
        }
        this.sorting(this.startArray);
    }

    // sorting the array based on total distance between source and target node
    private sorting(array: VirtualBoundaries[]): VirtualBoundaries[] {
        return array.sort((a: VirtualBoundaries, b: VirtualBoundaries) => b.totalDistance - a.totalDistance);
    }

    private octile(t: number, e: number): number {
        const r: number = Math.SQRT2 - 1;
        return e > t ? r * t + e : r * e + t;
    }
    private manhattan(t: number, e: number): number {
        return t + e;
    }

    // Find the nearest neigbour from the current boundaries, the neigbour is use to find next intermdiate point.
    private findNearestNeigbours(
        startGrid: VirtualBoundaries, gridCollection: VirtualBoundaries[][], isSource: boolean): VirtualBoundaries[] {
        const neigbours: VirtualBoundaries[] = []; const parent: VirtualBoundaries = startGrid.parent;
        if (parent) {
            const dx: number = (startGrid.gridX - parent.gridX) / Math.max(Math.abs(startGrid.gridX - parent.gridX), 1);
            const dy: number = (startGrid.gridY - parent.gridY) / Math.max(Math.abs(startGrid.gridY - parent.gridY), 1);
            if (dx !== 0) {
                if (this.isWalkable(startGrid.gridX, startGrid.gridY - 1, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX][startGrid.gridY - 1]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX][startGrid.gridY - 1]);
                }
                if (this.isWalkable(startGrid.gridX, startGrid.gridY + 1, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX][startGrid.gridY + 1])) {
                    neigbours.push(gridCollection[startGrid.gridX][startGrid.gridY + 1]);
                }
                if (this.isWalkable(startGrid.gridX + dx, startGrid.gridY, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX + dx][startGrid.gridY]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX + dx][startGrid.gridY]);
                }
            } else if (dy !== 0) {
                if (this.isWalkable(startGrid.gridX - 1, startGrid.gridY, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX - 1][startGrid.gridY]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX - 1][startGrid.gridY]);
                }
                if (this.isWalkable(startGrid.gridX + 1, startGrid.gridY, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX + 1][startGrid.gridY]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX + 1][startGrid.gridY]);
                }
                if (this.isWalkable(startGrid.gridX, startGrid.gridY + dy, true) &&
                    this.sourceGridCollection.indexOf(gridCollection[startGrid.gridX][startGrid.gridY + dy]) === -1) {
                    neigbours.push(gridCollection[startGrid.gridX][startGrid.gridY + dy]);
                }
            }
        } else {
            this.neigbour(startGrid, 'top', neigbours, isSource);
            this.neigbour(startGrid, 'right', neigbours, isSource);
            this.neigbour(startGrid, 'bottom', neigbours, isSource);
            this.neigbour(startGrid, 'left', neigbours, isSource);
        }
        return neigbours;
    }
    private neigbour(startGrid: VirtualBoundaries, direction: string, neigbours: VirtualBoundaries[], isSource: boolean): number {
        let i: number = 1; let nearGrid: VirtualBoundaries;
        while (i > 0) {
            const x: number = (direction === 'top' || direction === 'bottom') ?
                (startGrid.gridX) : ((direction === 'left') ? startGrid.gridX - i : startGrid.gridX + i);
            const y: number = (direction === 'right' || direction === 'left') ?
                (startGrid.gridY) : ((direction === 'top') ? startGrid.gridY - i : startGrid.gridY + i);
            nearGrid = this.gridCollection[parseInt(x.toString(), 10)][parseInt(y.toString(), 10)];
            if (nearGrid && ((isSource && this.sourceGridCollection.indexOf(nearGrid) === -1)
                || (!isSource && this.targetGridCollection.indexOf(nearGrid) === -1))) {
                if (neigbours && this.isWalkable(x, y)) {
                    neigbours.push(nearGrid);
                }
                return i;
            }
            if (x > 0 && y > 0) {
                i++;
            } else {
                break;
            }
        }
        return null;
    }

    private resetGridColl(grid: VirtualBoundaries, direction: string, isSource: boolean): number {
        let i: number = 1; let nearGrid: VirtualBoundaries;
        while (i > 0) {
            const x: number = (direction === 'top' || direction === 'bottom') ?
                (grid.gridX) : ((direction === 'left') ? grid.gridX - i : grid.gridX + i);
            const y: number = (direction === 'right' || direction === 'left') ?
                (grid.gridY) : ((direction === 'top') ? grid.gridY - i : grid.gridY + i);
            nearGrid = this.gridCollection[parseInt(x.toString(), 10)][parseInt(y.toString(), 10)];
            if (nearGrid && ((isSource && this.sourceGridCollection.indexOf(nearGrid) === -1) ||
                (!isSource && this.targetGridCollection.indexOf(nearGrid) === -1))) {
                if (this.isWalkable(x, y)) {
                    break;
                } else {
                    const grid: VirtualBoundaries = this.gridCollection[parseInt(x.toString(), 10)][parseInt(y.toString(), 10)];
                    this.considerWalkable.push(grid);
                }
            }
            if (x > 0 && y > 0) {
                if (direction === 'top' || direction === 'left') {
                    i--;
                } else {
                    i++;
                }
            } else {
                break;
            }
        }
        return null;
    }

    private isWalkable(x: number, y: number, isparent?: boolean): boolean {
        if (x >= 0 && x < this.noOfRows && y >= 0 && y < this.noOfCols) {
            const grid: VirtualBoundaries = this.gridCollection[parseInt(x.toString(), 10)][parseInt(y.toString(), 10)];
            if (grid && (grid.walkable || ((grid.nodeId.length === 1 || (grid.nodeId.length === 2 && grid.parentNodeId
                || (this.considerWalkable.indexOf(grid) !== -1))) &&
                (this.sourceGridCollection.indexOf(grid) !== -1 || this.targetGridCollection.indexOf(grid) !== -1 ||
                    this.considerWalkable.indexOf(grid) !== -1)))) {
                if ((isparent && !grid.parent) || !isparent) {
                    return true;
                }
            }
        }
        return false;
    }

    private findIntermediatePoints(
        neigbourGridX: number, neigbourGridY: number, startGridX: number, startGridY: number,
        endGridX: number, endGridY: number): PointModel {
        let dx: number = neigbourGridX - startGridX;
        let dy: number = neigbourGridY - startGridY;
        const gridX: number = neigbourGridX; const gridY: number = neigbourGridY;

        for (let i: number = 0; i < this.targetGridCollection.length; i++) {
            if (neigbourGridX === this.targetGridCollection[parseInt(i.toString(), 10)].gridX
                && neigbourGridY === this.targetGridCollection[parseInt(i.toString(), 10)].gridY) {
                return { x: neigbourGridX, y: neigbourGridY };
            }
        }

        if (!this.isWalkable(neigbourGridX, neigbourGridY)) {
            return null;
        }

        const neigbourGrid: VirtualBoundaries
            = this.gridCollection[parseInt(neigbourGridX.toString(), 10)][parseInt(neigbourGridY.toString(), 10)];

        if (neigbourGrid.tested) {
            return { x: neigbourGridX, y: neigbourGridY };
        }
        neigbourGrid.tested = true;
        if (dx !== 0) {
            dx = (dx > 0) ? 1 : -1;
            if ((this.isWalkable(gridX, gridY - 1) && !this.isWalkable(gridX - dx, gridY - 1)) ||
                (this.isWalkable(gridX, gridY + 1) && !this.isWalkable(gridX - dx, gridY + 1))) {
                return { x: neigbourGridX, y: neigbourGridY };
            }
        }
        if (dy !== 0) {
            dy = (dy > 0) ? 1 : -1;
            if ((this.isWalkable(gridX - 1, gridY) && !this.isWalkable(gridX - 1, gridY - dy)) ||
                (this.isWalkable(gridX + 1, gridY) && !this.isWalkable(gridX + 1, gridY - dy))) {
                return { x: neigbourGridX, y: neigbourGridY };
            }
            if (this.findIntermediatePoints(gridX + 1, gridY, gridX, gridY, endGridX, endGridY) ||
                this.findIntermediatePoints(gridX - 1, gridY, gridX, gridY, endGridX, endGridY)) {
                return { x: neigbourGridX, y: neigbourGridY };
            }
        }
        return this.findIntermediatePoints(gridX + dx, gridY + dy, gridX, gridY, endGridX, endGridY);
    }

    /**
     * Constructor for the line routing module
     *
     * @private
     */

    constructor() {
        //constructs the line routing module
    }

    /**
     *To destroy the line routing
     *
     * @returns {void} To destroy the line routing
     */

    public destroy(): void {
        /**
         * Destroys the line routing module
         */
    }


    /**
     * Core method to return the component name.
     *
     * @returns {string}  Core method to return the component name.
     * @private
     */
    protected getModuleName(): string {
        /**
         * Returns the module name
         */
        return 'LineRouting';
    }

}

/** @private */
export interface VirtualBoundaries {
    x: number;
    y: number;
    width: number;
    height: number;
    gridX: number;
    gridY: number;
    walkable: boolean;
    tested: boolean;
    nodeId: string[];
    previousDistance?: number;
    afterDistance?: number;
    totalDistance?: number;
    parent?: VirtualBoundaries;
    parentNodeId?: string;
}
