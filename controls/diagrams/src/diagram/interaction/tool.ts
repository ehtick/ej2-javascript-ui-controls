/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
import { PointModel } from '../primitives/point-model';
import { Node, DiagramShape } from '../objects/node';
import { Connector, BezierSegment, StraightSegment } from '../objects/connector';
import { NodeModel, BasicShapeModel, SwimLaneModel, PathModel } from '../objects/node-model';
import { BezierSegmentModel, ConnectorModel, StraightSegmentModel, BezierSettingsModel } from '../objects/connector-model';
import { Point } from '../primitives/point';
import { BpmnSubEvent } from '../objects/node';
import { PointPort } from '../objects/port';
import { IElement, ISizeChangeEventArgs, IDraggingEventArgs, DiagramFixedUserHandle, IElementDrawEventArgs } from '../objects/interface/IElement';
import { BlazorFixedUserHandleClickEventArgs, DiagramEventObject } from '../objects/interface/IElement';
import { IEndChangeEventArgs, FixedUserHandleClickEventArgs } from '../objects/interface/IElement';
import { IBlazorConnectionChangeEventArgs, IConnectionChangeEventArgs } from '../objects/interface/IElement';
import { IBlazorDropEventArgs } from '../objects/interface/IElement';
import { IRotationEventArgs, IDoubleClickEventArgs, IClickEventArgs, IDropEventArgs } from '../objects/interface/IElement';
import { CommandHandler } from './command-manager';
import { IBlazorDraggingEventArgs } from '../objects/interface/IElement';
import { rotatePoint, cloneObject, randomId, getBounds } from '../utility/base-util';
import { Rect } from '../primitives/rect';
import { getFreeHandPath, getPolygonPath } from '../utility/path-util';
import { canOutConnect, canInConnect, canAllowDrop, canPortInConnect, canPortOutConnect, canMove } from '../utility/constraints-util';
import { HistoryEntry } from '../diagram/history';
import { Matrix, transformPointByMatrix, rotateMatrix, identityMatrix } from '../primitives/matrix';
import { Snap } from './../objects/snapping';
import { NodeConstraints, DiagramEvent, ObjectTypes, PortConstraints, State, DiagramConstraints, DiagramAction } from './../enum/enum';
import { PointPortModel, PortModel } from './../objects/port-model';
import { ITouches } from '../objects/interface/interfaces';
import { SelectorModel } from '../objects/node-model';
import { MouseEventArgs } from './event-handlers';
import { TextElement } from '../core/elements/text-element';
import { PathElement } from '../core/elements/path-element';
import { GroupableView } from '../core/containers/container';
import { contains, Actions } from './actions';
import { ShapeAnnotation, PathAnnotation } from '../objects/annotation';
import { Selector } from '../objects/node';
import { DiagramElement } from '../core/elements/diagram-element';
import { getInOutConnectPorts, cloneBlazorObject, getObjectType, checkPort, findDistance } from '../utility/diagram-util';
import { initializeCSPTemplate, isBlazor, remove } from '@syncfusion/ej2-base';
import { NodeFixedUserHandleModel, ConnectorFixedUserHandleModel } from '../objects/fixed-user-handle-model';
import { findAngle } from '../utility/connector';
import { updateLaneBoundsWithSelector } from './container-interaction';
import { Diagram } from '../diagram';
import { AnnotationModel } from '../objects/annotation-model';


/**
 * Defines the interactive tools
 */
export class ToolBase {
    /**
     * Initializes the tool
     *
     * @param {CommandHandler} command Command that is corresponding to the current action
     * @param protectChange
     */
    constructor(command: CommandHandler, protectChange: boolean = false) {
        this.commandHandler = command;
        this.isProtectChange = protectChange;
    }

    /**
     * Command that is corresponding to the current action
     */
    protected commandHandler: CommandHandler = null;


    // protected deepDiffer: DeepDiffMapper = new DeepDiffMapper();

    /**
     * Sets/Gets whether the interaction is being done
     */
    protected inAction: boolean = false;

    /**
     * Sets/Gets which end connector is dragged
     */
    protected connectorEndPoint: string;

    /**
     * Sets/Gets the protect change
     */
    protected isProtectChange: boolean = false;

    /**
     * Sets/Gets the current mouse position
     */
    protected currentPosition: PointModel;

    /**
     * Sets/Gets the previous mouse position
     */
    public prevPosition: PointModel;

    /**
     * Sets/Gets the initial mouse position
     */
    protected startPosition: PointModel;

    /**
     * Sets/Gets the current element that is under mouse
     */
    protected currentElement: IElement = null;

    /**   @private  */
    public blocked: boolean = false;

    protected isTooltipVisible: boolean = false;

    /** @private */
    public childTable: {} = {};

    /**
     * Sets/Gets the previous object when mouse down
     */
    protected undoElement: SelectorModel = { nodes: [], connectors: [] };

    private checkProperty: boolean = true;

    protected undoParentElement: SelectorModel = { nodes: [], connectors: [] };

    protected undoContainerElement: SelectorModel = { nodes: [], connectors: [] };

    protected mouseDownElement: (NodeModel | ConnectorModel);

    protected startAction(currentElement: IElement): void {
        this.currentElement = currentElement;
        this.inAction = true;
    }

    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        this.currentElement = args.source;
        this.startPosition = this.currentPosition = this.prevPosition = args.position;
        this.isTooltipVisible = true;
        this.startAction(args.source);
        this.checkProperty = true;
        // Bug fix - EJ2-44495 -Node does not gets selected on slight movement of mouse when drag constraints disabled for node
        this.mouseDownElement = args.source;
    }

    public checkPropertyValue(): void {
        if (this.checkProperty) {
            this.commandHandler.startTransaction(this.isProtectChange);
        }
    }

    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        this.currentPosition = args.position;
        if (this.inAction) {
            this.commandHandler.startTransaction(this.isProtectChange);
            this.checkProperty = false;
        }
        //this.currentElement = currentElement;
        return !this.blocked;

    }



    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        this.currentPosition = args.position;
        // this.currentElement = currentElement;
        this.isTooltipVisible = false;
        this.commandHandler.endTransaction(this.isProtectChange);
        this.endAction();
        // Bug fix - EJ2-44495 -Node does not gets selected on slight movement of mouse when drag constraints disabled for node
        this.mouseDownElement = null;
    }

    protected endAction(): void {
        if (!this.isTooltipVisible) {
            this.commandHandler.closeTooltip();
        }
        this.commandHandler = null;
        this.currentElement = null;
        this.currentPosition = null;
        this.inAction = false;
        this.blocked = false;
    }

    /**
     * @param args
     * @private
     */
    public mouseWheel(args: MouseEventArgs): void {
        this.currentPosition = args.position;
    }

    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        this.mouseUp(args);
    }
    protected updateSize(
        shape: SelectorModel | NodeModel, startPoint: PointModel,
        endPoint: PointModel, corner: string, initialBounds: Rect, angle?: number): Rect {
        shape = this.commandHandler.renderContainerHelper(shape) as NodeModel || shape;
        const horizontalsnap: Snap = { snapped: false, offset: 0, left: false, right: false };
        const verticalsnap: Snap = { snapped: false, offset: 0, top: false, bottom: false };
        let difx: number = this.currentPosition.x - this.startPosition.x;
        let dify: number = this.currentPosition.y - this.startPosition.y;
        const snapEnabled: boolean = (!(shape instanceof TextElement)) && this.commandHandler.snappingModule
            && this.commandHandler.snappingModule.canSnap();
        const snapLine: SVGElement = snapEnabled ? this.commandHandler.snappingModule.getLayer() : null;
        const rotateAngle: number = (shape instanceof TextElement) ? angle : shape.rotateAngle;
        let matrix: Matrix;
        matrix = identityMatrix();
        rotateMatrix(matrix, -rotateAngle, 0, 0);
        let x: number = shape.offsetX; let y: number = shape.offsetY;
        const w: number = shape.width; const h: number = shape.height;
        x = x - w * shape.pivot.x; y = y - h * shape.pivot.y;
        let deltaWidth: number = 0; let deltaHeight: number = 0;
        let diff: PointModel;
        const width: number = (shape instanceof TextElement) ? shape.actualSize.width : shape.width;
        const height: number = (shape instanceof TextElement) ? shape.actualSize.height : shape.height;
        switch (corner) {
        case 'ResizeWest':
            diff = transformPointByMatrix(matrix, ({ x: difx, y: dify })); difx = diff.x; dify = diff.y;
            deltaHeight = 1;
            difx = snapEnabled ? this.commandHandler.snappingModule.snapLeft(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds) :
                difx;
            dify = 0; deltaWidth = (initialBounds.width - difx) / width; break;
        case 'ResizeEast':
            diff = transformPointByMatrix(matrix, ({ x: difx, y: dify }));
            difx = diff.x;
            dify = diff.y;
            difx = snapEnabled ? this.commandHandler.snappingModule.snapRight(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds) :
                difx;
            dify = 0;
            deltaWidth = (initialBounds.width + difx) / width;
            deltaHeight = 1;
            break;
        case 'ResizeNorth':
            deltaWidth = 1;
            diff = transformPointByMatrix(matrix, ({ x: difx, y: dify })); difx = diff.x; dify = diff.y;
            dify = snapEnabled ? this.commandHandler.snappingModule.snapTop(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds) :
                dify;
            deltaHeight = (initialBounds.height - dify) / height; break;
        case 'ResizeSouth':
            deltaWidth = 1;
            diff = transformPointByMatrix(matrix, ({ x: difx, y: dify })); difx = diff.x; dify = diff.y;
            dify = snapEnabled ? this.commandHandler.snappingModule.snapBottom(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds) :
                dify;
            deltaHeight = (initialBounds.height + dify) / height; break;
        case 'ResizeNorthEast':
            diff = transformPointByMatrix(matrix, ({ x: difx, y: dify })); difx = diff.x; dify = diff.y;
            difx = snapEnabled ? this.commandHandler.snappingModule.snapRight(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds) :
                difx;
            dify = snapEnabled ? this.commandHandler.snappingModule.snapTop(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds) :
                dify;
            deltaWidth = (initialBounds.width + difx) / width; deltaHeight = (initialBounds.height - dify) / height;
            break;
        case 'ResizeNorthWest':
            diff = transformPointByMatrix(matrix, ({ x: difx, y: dify })); difx = diff.x; dify = diff.y;
            dify = !snapEnabled ? dify : this.commandHandler.snappingModule.snapTop(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds);
            difx = !snapEnabled ? difx : this.commandHandler.snappingModule.snapLeft(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds);
            deltaWidth = (initialBounds.width - difx) / width; deltaHeight = (initialBounds.height - dify) / height;
            break;
        case 'ResizeSouthEast':
            diff = transformPointByMatrix(matrix, ({ x: difx, y: dify })); difx = diff.x; dify = diff.y;
            dify = !snapEnabled ? dify : this.commandHandler.snappingModule.snapBottom(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds);
            difx = !snapEnabled ? difx : this.commandHandler.snappingModule.snapRight(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel, endPoint === startPoint, initialBounds);
            deltaHeight = (initialBounds.height + dify) / height; deltaWidth = (initialBounds.width + difx) / width;
            break;
        case 'ResizeSouthWest':
            diff = transformPointByMatrix(matrix, ({ x: difx, y: dify })); difx = diff.x; dify = diff.y;
            dify = snapEnabled ? this.commandHandler.snappingModule.snapBottom(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel,
                endPoint === startPoint, initialBounds) : dify;
            difx = snapEnabled ? this.commandHandler.snappingModule.snapLeft(
                horizontalsnap, verticalsnap, snapLine, difx, dify, shape as SelectorModel,
                endPoint === startPoint, initialBounds) : difx;
            deltaWidth = (initialBounds.width - difx) / width; deltaHeight = (initialBounds.height + dify) / height; break;
        }
        return { width: deltaWidth, height: deltaHeight } as Rect;
    }

    protected getPivot(corner: string): PointModel {
        switch (corner) {
        case 'ResizeWest':
            return { x: 1, y: 0.5 };
        case 'ResizeEast':
            return { x: 0, y: 0.5 };
        case 'ResizeNorth':
            return { x: 0.5, y: 1 };
        case 'ResizeSouth':
            return { x: 0.5, y: 0 };
        case 'ResizeNorthEast':
            return { x: 0, y: 1 };
        case 'ResizeNorthWest':
            return { x: 1, y: 1 };
        case 'ResizeSouthEast':
            return { x: 0, y: 0 };
        case 'ResizeSouthWest':
            return { x: 1, y: 0 };
        }
        return { x: 0.5, y: 0.5 };
    }

    //method to get node shape name
    public getShapeType(): string{
        let shape: string;
        // eslint-disable-next-line no-constant-condition
        if (
            this.commandHandler.diagram.drawingObject.shape.type === 'Image' ||
            this.commandHandler.diagram.drawingObject.shape.type === 'HTML' ||
            this.commandHandler.diagram.drawingObject.shape.type === 'Native' ||
            this.commandHandler.diagram.drawingObject.shape.type === 'Path'
        ) {
            shape = this.commandHandler.diagram.drawingObject.shape.type;
        }
        else
        {
            shape = (this.commandHandler.diagram.drawingObject.shape as BasicShapeModel).shape;
        }
        return shape;
    }

    //EJ2-52203-Method to trigger ElementDraw Event when we draw node or connector with the drawing Tool
    public triggerElementDrawEvent(source: NodeModel | ConnectorModel, state: State, objectType: string, elementType: string, isMouseDownAction: boolean): void {
        let arg : IElementDrawEventArgs = {
            source: source , state: state, objectType: objectType, cancel: false, elementType: elementType
        };
        this.commandHandler.triggerEvent(DiagramEvent.elementDraw, arg);
        if (isMouseDownAction && arg.cancel){
            {
                this.commandHandler.diagram.resetTool();
                this.inAction = false;
            }
        }
    }
}

/**
 * Helps to select the objects
 */
export class SelectTool extends ToolBase {
    private action: Actions;
    constructor(commandHandler: CommandHandler, protectChange: boolean, action?: Actions) {
        super(commandHandler, true);
        this.action = action;
    }
    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        this.inAction = true;
        super.mouseDown(args);
    }

    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        //draw selected region
        if (this.inAction && Point.equals(this.currentPosition, this.prevPosition) === false) {
            const rect: Rect = Rect.toBounds([this.prevPosition, this.currentPosition]);
            // Bug fix - EJ2-44495 -Node does not gets selected on slight movement of mouse when drag constraints disabled for node
            if (this.mouseDownElement && !canMove(this.mouseDownElement)) {
                this.commandHandler.clearObjectSelection(this.mouseDownElement);
            } else {
                this.commandHandler.clearSelectedItems();
                this.commandHandler.drawSelectionRectangle(rect.x, rect.y, rect.width, rect.height);
            }
        }
        return !this.blocked;
    }


    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs, button?: number): void {
        this.checkPropertyValue();
        //rubber band selection
        if (!this.commandHandler.isUserHandle(this.currentPosition)) {
            if (Point.equals(this.currentPosition, this.prevPosition) === false && this.inAction) {
                const region: Rect = Rect.toBounds([this.prevPosition, this.currentPosition]);
                this.commandHandler.doRubberBandSelection(region);
            } else {
                //single selection
                const arrayNodes: (NodeModel | ConnectorModel | AnnotationModel)[] = this.commandHandler.getSelectedObject();
                if (!this.commandHandler.hasSelection() || !args.info || !args.info.ctrlKey) {
                    // 948882: Improper Selection Behavior When Node Drag Constraint is Disabled
                    if (button !== 2 || !arrayNodes.some((obj: NodeModel | ConnectorModel | AnnotationModel) => obj === args.source)) {
                        this.commandHandler.clearSelection(args.source === null ? true : false);
                        if (this.action === 'LabelSelect') {
                            this.commandHandler.labelSelect(args.source, args.sourceWrapper, arrayNodes);
                        }
                        else if (args.source) {
                            this.commandHandler.selectObjects([args.source], false, arrayNodes);
                        }
                    }
                } else {
                    //handling multiple selection
                    if (args && args.source) {
                        if (!this.commandHandler.isSelected(args.source)) {
                            this.commandHandler.selectObjects([args.source], true);
                        } else {
                            if (args.clickCount === 1) {
                                this.commandHandler.unSelect(args.source);
                                // this.commandHandler.updateBlazorSelector();
                            }
                        }
                    }
                }
            }
        }
        this.inAction = false;
        super.mouseUp(args);
    }

    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        if (this.inAction) {
            this.mouseUp(args);
        }
    }
}

export class FixedUserHandleTool extends ToolBase {
    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        this.inAction = false;
        const val: NodeModel | ConnectorModel = args.source;
        let fixedUserHandle: NodeFixedUserHandleModel | ConnectorFixedUserHandleModel;
        const iconId: string = args.sourceWrapper.id;
        for (let i: number = 0; i < val.fixedUserHandles.length; i++) {
            if (iconId.indexOf(val.fixedUserHandles[parseInt(i.toString(), 10)].id) > -1) {
                fixedUserHandle = val.fixedUserHandles[parseInt(i.toString(), 10)];
            }
        }
        const arg: FixedUserHandleClickEventArgs = {
            fixedUserHandle: fixedUserHandle,
            element: args.source
        };
        const trigger: DiagramEvent = DiagramEvent.fixedUserHandleClick;
        this.commandHandler.triggerEvent(trigger, arg);
        super.mouseUp(args);
    }
}


/**
 * Helps to edit the selected connectors
 */
export class ConnectTool extends ToolBase {

    protected endPoint: string;

    protected oldConnector: ConnectorModel;

    protected isConnected: boolean = false;

    /** @private */
    public tempArgs: IBlazorConnectionChangeEventArgs;

    /** @private */
    public canCancel: boolean;

    /**   @private  */
    public selectedSegment: BezierSegment;

    constructor(commandHandler: CommandHandler, endPoint: string) {
        super(commandHandler, true);
        this.endPoint = endPoint;
    }

    /**
     * @param args
     * @private
     */
    public async mouseDown(args: MouseEventArgs): Promise<void> {
        this.inAction = true;
        this.undoElement = undefined;
        if (!(this instanceof ConnectorDrawingTool)) {
            this.undoElement = cloneObject(args.source);
        }
        super.mouseDown(args);
        let oldValue: PointModel;
        let connectors: ConnectorModel;
        if (args.source && (args.source as SelectorModel).connectors) {
            oldValue = { x: this.prevPosition.x, y: this.prevPosition.y };
            connectors = (args.source as SelectorModel).connectors[0];
            this.oldConnector = cloneObject(connectors);
        }
        // Sets the selected segment
        if (this.endPoint === 'BezierSourceThumb' || this.endPoint === 'BezierTargetThumb') {
            for (let i: number = 0; i < connectors.segments.length; i++) {
                const segment: BezierSegment = connectors.segments[parseInt(i.toString(), 10)] as BezierSegment;
                const segmentpoint1: PointModel = !Point.isEmptyPoint(segment.point1) ? segment.point1 : segment.bezierPoint1;
                const segmentpoint2: PointModel = !Point.isEmptyPoint(segment.point2) ? segment.point2 : segment.bezierPoint2;
                //(EJ2-70650)-Unable to drag bezier control thumb, when we increase handleSize value
                //Added below code for drag the bezier control thumb while increasing handle size(For hitPadding)
                if ((this.currentElement as Selector).handleSize !== connectors.hitPadding) {
                    connectors.hitPadding = (this.currentElement as Selector).handleSize;
                }
                if (contains(this.currentPosition, segmentpoint1, connectors.hitPadding) ||
                    contains(this.currentPosition, segmentpoint2, connectors.hitPadding)) {
                    this.selectedSegment = segment;
                }
            }
        }
        this.currentPosition = args.position;
    }

    /**
     * @param args
     * @private
     */
    public async mouseUp(args: MouseEventArgs): Promise<void> {
        if (!isBlazor() && this.isConnected && (args.source as SelectorModel).connectors) {
            const connector: ConnectorModel = (args.source as SelectorModel).connectors[0];
            const nodeEndId: string = this.endPoint === 'ConnectorSourceEnd' ? 'sourceID' : 'targetID';
            const portEndId: string = this.endPoint === 'ConnectorSourceEnd' ? 'sourcePortID' : 'targetPortID';
            const arg: IConnectionChangeEventArgs | IBlazorConnectionChangeEventArgs = {
                connector: cloneBlazorObject(connector),
                oldValue: { nodeId: this.oldConnector[`${nodeEndId}`], portId: this.oldConnector[`${portEndId}`] },
                newValue: { nodeId: connector[`${nodeEndId}`], portId: connector[`${portEndId}`] }, cancel: false,
                state: 'Changed', connectorEnd: this.endPoint
            };
            //875655- ConnectionChange Event not triggered in Changed state for port change in same node
            if (connector[`${nodeEndId}`] !== this.oldConnector[`${nodeEndId}`] || connector[`${portEndId}`] !== this.oldConnector[`${portEndId}`]) {
                this.commandHandler.triggerEvent(DiagramEvent.connectionChange, arg);
                this.isConnected = false;
            }
        }
        this.checkPropertyValue();
        this.commandHandler.updateSelector();
        this.commandHandler.removeSnap();
        if ((!(this instanceof ConnectorDrawingTool)) && ((this.endPoint === 'ConnectorSourceEnd' &&
            (args.source as SelectorModel).connectors.length &&
            ((!Point.equals((args.source as SelectorModel).connectors[0].sourcePoint, this.undoElement.connectors[0].sourcePoint) ||
                ((args.source as SelectorModel).connectors[0].sourceID !== this.undoElement.connectors[0].sourceID)))) ||
            (this.endPoint === 'ConnectorTargetEnd' &&
                ((!Point.equals((args.source as SelectorModel).connectors[0].targetPoint, this.undoElement.connectors[0].targetPoint))
                    || ((args.source as SelectorModel).connectors[0].targetID !== this.undoElement.connectors[0].targetID))))) {

            let oldValues: PointModel; let newValues: PointModel; let connector: ConnectorModel;
            if (args.source && (args.source as SelectorModel).connectors && this.endPoint === 'ConnectorSourceEnd') {
                //941055: The sourcePointChange event's old and new values are the same
                oldValues = { x: this.oldConnector.sourcePoint.x, y: this.oldConnector.sourcePoint.y };
                connector = (args.source as SelectorModel).connectors[0];
                newValues = { x: connector.sourcePoint.x, y: connector.sourcePoint.y };
            }
            else if (args.source && (args.source as SelectorModel).connectors && this.endPoint === 'ConnectorTargetEnd') {
                oldValues = { x: this.oldConnector.targetPoint.x, y: this.oldConnector.targetPoint.y };
                connector = (args.source as SelectorModel).connectors[0];
                newValues = { x: connector.targetPoint.x, y: connector.targetPoint.y };
            }
            let targetPortName: string; let targetNodeNode: string;
            if (args.target) {
                const target: NodeModel | PointPortModel = this.commandHandler.findTarget(
                    args.targetWrapper, args.target, this.endPoint === 'ConnectorSourceEnd', true) as NodeModel | PointPortModel;
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                targetNodeNode = target.id;
                if (target instanceof PointPort) {
                    //941055: The target node is undefined while connected to the port
                    targetPortName = target.id;
                    targetNodeNode = (args.target as NodeModel).id;
                }
            }
            // 947614: Property Change does not log into history within connection change event completed state
            if (this.commandHandler.diagram.diagramActions & DiagramAction.ToolAction) {
                this.commandHandler.diagram.diagramActions &= ~DiagramAction.ToolAction;
            }
            let arg: IEndChangeEventArgs = {
                connector: connector, state: 'Completed', targetNode: targetNodeNode,
                oldValue: oldValues, newValue: newValues, cancel: false, targetPort: targetPortName
            };
            if (this.undoElement && args.source) {
                // eslint-disable-next-line prefer-const
                let obj: SelectorModel; obj = cloneObject(args.source);
                const entry: HistoryEntry = {
                    type: 'ConnectionChanged', redoObject: cloneObject(obj), undoObject: cloneObject(this.undoElement),
                    category: 'Internal'
                };
                this.commandHandler.addHistoryEntry(entry);
            }
            const trigger: number = this.endPoint === 'ConnectorSourceEnd' ? DiagramEvent.sourcePointChange : DiagramEvent.targetPointChange;
            this.commandHandler.triggerEvent(trigger, arg);
            this.commandHandler.removeTerminalSegment(connector as Connector, true);
        } else if (!(this instanceof ConnectorDrawingTool) &&
            (this.endPoint === 'BezierTargetThumb' || this.endPoint === 'BezierSourceThumb')) {
            if (this.undoElement && args.source) {
                const obj: SelectorModel = cloneObject(args.source);
                const entry: HistoryEntry = {
                    type: 'SegmentChanged', redoObject: obj, undoObject: this.undoElement, category: 'Internal'
                };
                this.commandHandler.addHistoryEntry(entry);
            }
        }
        // this.commandHandler.updateBlazorSelector();
        this.canCancel = undefined; this.tempArgs = undefined;
        //(EJ2-66201) - Exception occurs when mouse-hover on ports in node
        if (args.source && (args.source as SelectorModel).connectors) {
            let connector: ConnectorModel = (args.source as SelectorModel).connectors[0];
            if ((connector as Connector).isBezierEditing) {
                (connector as Connector).isBezierEditing = false;
            }
        }
        super.mouseUp(args);
    }

    /* tslint:disable */
    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        let tempArgs: IBlazorConnectionChangeEventArgs;
        if ((!(this instanceof ConnectorDrawingTool)) && ((this.endPoint === 'ConnectorSourceEnd' &&
            Point.equals((args.source as SelectorModel).connectors[0].sourcePoint, this.undoElement.connectors[0].sourcePoint)) ||
            (this.endPoint === 'ConnectorTargetEnd' &&
                Point.equals((args.source as SelectorModel).connectors[0].targetPoint, this.undoElement.connectors[0].targetPoint)))) {
            let oldValue: PointModel; let connectors: ConnectorModel;
            if (args.source && (args.source as SelectorModel).connectors) {
                oldValue = { x: this.prevPosition.x, y: this.prevPosition.y };
                connectors = (args.source as SelectorModel).connectors[0];
            }
            let targetPort: string; let targetNode: string;
            if (args.target) {
                targetNode = (args.target as NodeModel).id;
                const target: NodeModel | PointPortModel = this.commandHandler.findTarget(
                    args.targetWrapper, args.target, this.endPoint === 'ConnectorSourceEnd', true) as NodeModel | PointPortModel;
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                (target instanceof PointPort || target instanceof BpmnSubEvent) ? targetPort = target.id : targetNode = target.id;
            }
            let arg: IEndChangeEventArgs = {
                connector: connectors, state: 'Start', targetNode: targetNode,
                oldValue: oldValue, newValue: oldValue, cancel: false, targetPort: targetPort
            };
            const trigger: number = this.endPoint === 'ConnectorSourceEnd' ?
                DiagramEvent.sourcePointChange : DiagramEvent.targetPointChange;
            this.commandHandler.triggerEvent(trigger, arg);
        }
        this.currentPosition = args.position;
        if (this.currentPosition && this.prevPosition) {
            const diffX: number = this.currentPosition.x - this.prevPosition.x;
            const diffY: number = this.currentPosition.y - this.prevPosition.y;
            let newValue: PointModel; let oldValue: PointModel; let inPort: PointPortModel; let outPort: PointPortModel;
            this.currentPosition = this.commandHandler.snapConnectorEnd(this.currentPosition); let connector: ConnectorModel;
            if (args.source && (args.source as SelectorModel).connectors) {
                newValue = { x: this.currentPosition.x, y: this.currentPosition.y };
                oldValue = { x: this.prevPosition.x, y: this.prevPosition.y };
                connector = (args.source as SelectorModel).connectors[0];
            }
            let targetPortId: string; let targetNodeId: string;
            if (args.target) {
                const target: NodeModel | PointPortModel = this.commandHandler.findTarget(
                    args.targetWrapper, args.target, this.endPoint === 'ConnectorSourceEnd', true) as NodeModel | PointPortModel;
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                (target instanceof PointPort) ? targetPortId = target.id : targetNodeId = target.id;
            }
            let arg: IEndChangeEventArgs = {
                connector: connector, state: 'Progress', targetNode: targetNodeId,
                oldValue: oldValue, newValue: newValue, cancel: false, targetPort: targetPortId
            };
            if (!(this instanceof ConnectorDrawingTool)) {
                const trigger: number = this.endPoint === 'ConnectorSourceEnd' ?
                    DiagramEvent.sourcePointChange : DiagramEvent.targetPointChange;
                this.commandHandler.triggerEvent(trigger, arg);
            }
            if (args.target) {
                inPort = getInOutConnectPorts((args.target as Node), true); outPort = getInOutConnectPorts((args.target as Node), false);
            }
            if (!arg.cancel && this.inAction && this.endPoint !== undefined && diffX !== 0 || diffY !== 0) {
                // EJ2-65331 - The condition checks whether the cancel argument is true or false
                if(!arg.cancel){
                    this.blocked = !this.commandHandler.dragConnectorEnds(
                        this.endPoint, args.source, this.currentPosition, this.selectedSegment, args.target, targetPortId);
                    this.commandHandler.updateSelector();
                }
                if (args.target && ((this.endPoint === 'ConnectorSourceEnd' && (canOutConnect(args.target) || canPortOutConnect(outPort)))
                    || (this.endPoint === 'ConnectorTargetEnd' && (canInConnect(args.target) || canPortInConnect(inPort))))) {
                    if (this.commandHandler.canDisconnect(this.endPoint, args, targetPortId, targetNodeId)) {
                        tempArgs = this.commandHandler.disConnect(
                            args.source, this.endPoint, this.canCancel) as IBlazorConnectionChangeEventArgs;
                        this.isConnected = true;
                    }
                    const target: NodeModel | PointPortModel = this.commandHandler.findTarget(
                        args.targetWrapper, args.target, this.endPoint === 'ConnectorSourceEnd', true) as (NodeModel | PointPortModel);
                    if (target instanceof Node) {
                        if ((canInConnect(target) && this.endPoint === 'ConnectorTargetEnd')
                            || (canOutConnect(target) && this.endPoint === 'ConnectorSourceEnd')) {

                            tempArgs = this.commandHandler.connect(
                                this.endPoint, args, this.canCancel) as IBlazorConnectionChangeEventArgs;
                            this.isConnected = true;
                        }
                    } else {
                        const isConnect: boolean = this.checkConnect(target as PointPortModel);
                        if (isConnect) {
                            this.isConnected = true;
                            tempArgs = this.commandHandler.connect(this.endPoint, args, this.canCancel) as IBlazorConnectionChangeEventArgs;
                        }
                    }
                } else if (this.endPoint.indexOf('Bezier') === -1) {
                    this.isConnected = true;
                    tempArgs = this.commandHandler.disConnect(
                        args.source, this.endPoint, this.canCancel) as IBlazorConnectionChangeEventArgs;
                    this.commandHandler.updateSelector();
                }
            }
            if (this.commandHandler.canEnableDefaultTooltip()) {
                const content: string = this.getTooltipContent(args.position);
                const contentTemp = function() {
                    return content;
                };
                this.commandHandler.showTooltip(args.source, args.position, initializeCSPTemplate(contentTemp), 'ConnectTool', this.isTooltipVisible);
                this.isTooltipVisible = false;
            }
            if (tempArgs) {
                this.tempArgs = tempArgs as IBlazorConnectionChangeEventArgs;
            }
        }
        this.prevPosition = this.currentPosition;
        return !this.blocked;
    }
    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        this.mouseUp(args);
    }

    private getTooltipContent(position: PointModel): string {
        return 'X:' + Math.round(position.x) + ' ' + 'Y:' + Math.round(position.y);
    }

    private checkConnect(target: PointPortModel): boolean {
        if (canPortInConnect(target) && this.endPoint === 'ConnectorTargetEnd') {
            return true;
        } else if (canPortOutConnect(target) && this.endPoint === 'ConnectorSourceEnd') {
            return true;
        } else if (!(target.constraints & PortConstraints.None) && !canPortInConnect(target) && !canPortOutConnect(target)
        && (target.constraints === undefined || (target.constraints & (PortConstraints.Default & ~(PortConstraints.InConnect | PortConstraints.OutConnect))) > 0)) {
            return true;
        }
        return false;
    }

    /**   @private  */
    public endAction(): void {
        super.endAction();
        this.prevPosition = null;
        this.endPoint = null;
    }
}

/**
 * Drags the selected objects
 */
export class MoveTool extends ToolBase {
    /**
     * Sets/Gets the previous mouse position
     */
    public prevPosition: PointModel;

    private initialOffset: PointModel;

    /**   @private  */
    public currentTarget:IElement = null;

    private objectType: ObjectTypes;

    private portId: string;

    private source: NodeModel | PortModel;

    private intialValue:SelectorModel;

    private isStartAction:boolean = false;

    private canCancel: boolean = false;
    private tempArgs: IDraggingEventArgs | IBlazorDraggingEventArgs;
    private canTrigger: boolean = false;
    constructor(commandHandler: CommandHandler, objType?: ObjectTypes) {
        super(commandHandler, true);
        this.objectType = objType;
    }

    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        if (args.source instanceof Node || args.source instanceof Connector) {
            const arrayNodes: (NodeModel | ConnectorModel | AnnotationModel)[] = this.commandHandler.getSelectedObject();
            this.commandHandler.selectObjects([args.source], args.info && args.info.ctrlKey, arrayNodes);
            const selectedObject: SelectorModel = { nodes: [], connectors: [] };
            if (args.source instanceof Node) {
                selectedObject.nodes.push(cloneObject(args.source) as Node);
            } else {
                selectedObject.connectors.push(cloneObject(args.source) as Connector);
            }
            this.undoElement = cloneObject(selectedObject);
            //909582-History change event args old value is undefined upon node drag
            const wrapper: GroupableView = args.source.wrapper;
            this.undoElement.offsetX = wrapper.offsetX;
            this.undoElement.offsetY = wrapper.offsetY;
        } else {
            this.undoElement = cloneObject(args.source);
        }
        //951087-Undo function doesn't retain connector segments after node move actions.
        if (this.undoElement.nodes && this.undoElement.nodes.length > 0) {
            for (const node of this.undoElement.nodes as Node[]) {
                for (const edgeId of [...node.outEdges, ...node.inEdges]) {
                    const connector: ConnectorModel = this.commandHandler.diagram.getObject(edgeId);
                    if (connector && connector.segments && connector.segments.length > 1) {
                        if (this.undoElement.connectors.indexOf(connector) === -1) {
                            this.undoElement.connectors.push(cloneObject(connector));
                        }
                    }
                }
            }
        }
        this.undoParentElement = this.commandHandler.getSubProcess(args.source);
        this.undoContainerElement = this.commandHandler.getContainer(args.source);
        if (this.objectType === 'Port') {
            this.portId = args.sourceWrapper.id;
        }
        this.commandHandler.insertBlazorConnector(args.source as Selector);
        super.mouseDown(args);
        this.initialOffset = { x: 0, y: 0 };
    }
    private getPort(args: MouseEventArgs): PointPortModel {
        let port: any;
        const sourceId = (args.source as Connector | Node).id;
        const sourcePorts = (args.source as Connector | Node).ports;
        for (let i = 0; i < sourcePorts.length; i++) {
            if (args.sourceWrapper.id === sourceId + '_' + sourcePorts[parseInt(i.toString(), 10)].id) {
                port = sourcePorts[parseInt(i.toString(), 10)];
                break;
            }
        }
        return port;
    }
    /* tslint:disable */
    /**
     * @param args
     * @param isPreventHistory
     * @param args
     * @param isPreventHistory
     * @private
     */
    public async mouseUp(args: MouseEventArgs, isPreventHistory?: boolean): Promise<void> {
        let oldValues: SelectorModel; let newValues: SelectorModel;
        this.checkPropertyValue();
        let obj: SelectorModel; let historyAdded: boolean = false; let object: NodeModel | ConnectorModel | SelectorModel;
        const redoObject: SelectorModel = { nodes: [], connectors: [] };
        if (this.objectType !== 'Port') {
            if (args.source instanceof Node || args.source instanceof Connector) {
                if (args.source instanceof Node) {
                    redoObject.nodes.push(cloneObject(args.source) as Node);
                } else {
                    redoObject.connectors.push(cloneObject(args.source) as Connector);
                }
                obj = cloneObject(redoObject); const wrapper: GroupableView = args.source.wrapper;
                obj.offsetX = wrapper.offsetX; obj.offsetY = wrapper.offsetY;
            } else {
                obj = cloneObject(args.source);
            }
            //951087-Undo funciton doesn't retain connector segments after node move actions.
            if (obj.nodes && obj.nodes.length > 0) {
                for (const node of obj.nodes as Node[]) {
                    for (const edgeId of [...node.outEdges, ...node.inEdges]) {
                        const connector: ConnectorModel = this.commandHandler.diagram.getObject(edgeId);
                        if (this.undoElement.connectors.indexOf(connector) !== -1 && obj.connectors.indexOf(connector) === -1) {
                            const connectorClone: ConnectorModel = cloneObject(connector);
                            redoObject.connectors.push(connectorClone);
                            obj.connectors.push(connectorClone);
                        }
                    }
                }
            }
            object = (this.commandHandler.renderContainerHelper(args.source as NodeModel) as Node) || args.source as Selector || (this.commandHandler.renderContainerHelper(args.source as ConnectorModel) as Connector);
            if (((object as Node).id === 'helper')|| ((object as Node).id !== 'helper')) {
                let isSubGroupSelection: boolean = false;
                if (object instanceof Selector) {
                    let currentSelection: SelectorModel = cloneObject(object);
                    // check currentSelection.selectedObjects array contains same object of this.undoElement.selectedObjects array
                    if (currentSelection.selectedObjects.length === this.undoElement.selectedObjects.length) {
                        for (let i: number = 0; i < currentSelection.selectedObjects.length; i++) {
                            if (currentSelection.selectedObjects[parseInt(i.toString(), 10)].id !==
                                this.undoElement.selectedObjects[parseInt(i.toString(), 10)].id) {
                                isSubGroupSelection = true;
                                break;
                            }
                        }
                    }
                }
                //EJ2-71257 - Position change event completed state is not fired on selecting the node first and then dragging the node while changing node width at progress state.
                // If object is instanceof selector then checked the length of selected objects is 1 or not.
                const isSelector: boolean = object instanceof Selector;
                const isSingleSelectedObject: boolean = object instanceof Selector && object.selectedObjects && object.selectedObjects.length === 1;
                const isSameSize: boolean = object instanceof Selector && Math.round(object.width) === Math.round(this.undoElement.width) && Math.round(object.height) === Math.round(this.undoElement.height);
                const isDifferentPosition: boolean = (object as NodeModel).offsetX !== this.undoElement.offsetX || (object as NodeModel).offsetY !== this.undoElement.offsetY;
                const isDifferentSourcePoint: boolean = (object as ConnectorModel).sourcePoint !== (this.undoElement as any).sourcePoint;
                const isDifferentTargetPoint: boolean = (object as ConnectorModel).targetPoint !== (this.undoElement as any).targetPoint;

                if (!isSubGroupSelection &&
                    (((isSelector && (isSameSize || isSingleSelectedObject)) || !isSelector) && (isDifferentPosition || isDifferentSourcePoint || isDifferentTargetPoint))
                    || this.isSelectionHasConnector(object)) {
                    if (args.source) {
                        newValues = { offsetX: args.source.wrapper.offsetX, offsetY: args.source.wrapper.offsetY };
                        oldValues = { offsetX: args.source.wrapper.offsetX, offsetY: args.source.wrapper.offsetY };
                    }
                    let arg: IDraggingEventArgs | IBlazorDraggingEventArgs = {
                        source: args.source, state: 'Completed', oldValue: this.intialValue, newValue: newValues,
                        target: this.currentTarget, targetPosition: this.currentPosition, allowDrop: true, cancel: false
                    };
                    arg = {
                        source: cloneBlazorObject(args.source), state: 'Completed',
                        oldValue: cloneBlazorObject(this.intialValue), newValue: cloneBlazorObject(newValues),
                        target: cloneBlazorObject(this.currentTarget), targetPosition: cloneBlazorObject(this.currentPosition),
                        allowDrop: arg.allowDrop, cancel: arg.cancel
                    };
                    // EJ2-824712 [Bug] - When selecting swimlane second time history change event is triggered with change type as positionChanged.
                    let canAddHistory: boolean = true;
                    //EJ2-69852): Position Change event trigger for clicking second time in swimlane header issue

                    if ((object as Node).id === 'helper') {
                        if (this.canTrigger) {
                            //EJ2-925499 - Undo/Redo not working after moveing multiselected nodes inside swimlane while line routing enabled
                            if ((obj.nodes.length > 1 || obj.connectors.length > 1) && (this.commandHandler.diagram.lineRoutingModule &&
                                (this.commandHandler.diagram.constraints & DiagramConstraints.LineRouting))) {
                                const nameTable: NodeModel = this.commandHandler.diagram.nameTable;
                                for (let i: number = 0; i < obj.nodes.length; i++) {
                                    if (!(nameTable[(obj as any).nodes[parseInt(i.toString(), 10)].parentId] &&
                                        nameTable[(obj as any).nodes[parseInt(i.toString(), 10)].parentId].isLane)) {
                                        canAddHistory = false;
                                        break;
                                    }
                                }
                            }
                            else {
                                canAddHistory = true;
                            }
                            this.commandHandler.triggerEvent(DiagramEvent.positionChange, arg);
                            this.connectorEndPointChangeEvent(arg);
                        }
                        else {
                            canAddHistory = false;
                        }
                    } else {
                        this.commandHandler.triggerEvent(DiagramEvent.positionChange, arg);
                        this.connectorEndPointChangeEvent(arg);
                    }

                    if (!isPreventHistory && canAddHistory) {
                        this.commandHandler.startGroupAction(); historyAdded = true;
                        const entry: HistoryEntry = {
                            type: 'PositionChanged',
                            redoObject: cloneObject(obj), undoObject: cloneObject(this.undoElement), category: 'Internal'
                        };
                        if ((obj.nodes[0] as Node) && (obj.nodes[0] as Node).processId) {
                            const entry: HistoryEntry = {
                                type: 'SizeChanged', category: 'Internal',
                                undoObject: this.undoParentElement, redoObject: this.commandHandler.getSubProcess(args.source)
                            };
                            this.commandHandler.addHistoryEntry(entry);
                        }
                        if ((obj.nodes[0] as Node) && (obj.nodes[0] as Node).parentId
                            && this.commandHandler.diagram.nameTable[(obj.nodes[0] as Node).parentId].shape.type === 'Container') {
                            const entry: HistoryEntry = {
                                type: 'SizeChanged', category: 'Internal',
                                undoObject: this.undoContainerElement, redoObject: this.commandHandler.getContainer(args.source)
                            };
                            this.commandHandler.addHistoryEntry(entry);
                        }
                        this.commandHandler.addHistoryEntry(entry);
                    }
                }
            }
            const snappedPoint: PointModel = this.commandHandler.snapPoint(this.prevPosition, this.currentPosition, 0, 0);
            this.commandHandler.removeSnap(); this.commandHandler.removeHighlighter();
            if (args.source && this.currentTarget && canAllowDrop(this.currentTarget) &&
                this.commandHandler.isDroppable(args.source, this.currentTarget)) {
                let canSplit = true;
                this.commandHandler.drop(this.currentElement, this.currentTarget, this.currentPosition);
                if (this.currentTarget && this.currentTarget instanceof Connector) {
                    if (this.commandHandler.diagram.enableConnectorSplit === true) {
                        //EJ2-894577- Restricting the connector splitting if any one edge is already connected to the node
                        if (this.currentElement && this.currentElement instanceof Node) {
                            if (this.currentElement.children !== undefined) {
                                for (let i = 0; i < this.currentElement.children.length; i++) {
                                    if (this.currentElement.children[parseInt(i.toString(), 10)] === this.currentTarget.sourceID ||
                                        this.currentElement.children[parseInt(i.toString(), 10)] === this.currentTarget.targetID) {
                                        canSplit = false;
                                    }
                                }
                            }
                            else {
                                if (this.currentElement.id === this.currentTarget.sourceID || this.currentElement.id === this.currentTarget.targetID) {
                                    canSplit = false;
                                }
                            }
                            if (canSplit) {
                                this.commandHandler.connectorSplit(this.currentElement, this.currentTarget);
                            }
                        }
                        else if (this.currentElement instanceof Selector && !(this.commandHandler.PreventConnectorSplit)) {
                            if (this.currentElement.nodes[0].children) {
                                for (let i = 0; i < this.currentElement.nodes[0].children.length; i++) {
                                    if (this.currentElement.nodes[0].children[parseInt(i.toString(), 10)] === this.currentTarget.sourceID ||
                                        this.currentElement.nodes[0].children[parseInt(i.toString(), 10)] === this.currentTarget.targetID) {
                                        canSplit = false;
                                    }
                                }
                            }
                            else {
                                if ((this.currentElement.nodes[0]).id === this.currentTarget.sourceID ||
                                    (this.currentElement.nodes[0]).id === this.currentTarget.targetID) {
                                    canSplit = false;
                                }
                            }
                            if (canSplit) {
                                this.commandHandler.connectorSplit(this.currentElement.nodes[0], this.currentTarget);
                                this.commandHandler.PreventConnectorSplit = false;
                            }
                        }
                    }
                }
                let arg: IDropEventArgs | IBlazorDropEventArgs = {
                    element: args.source, target: this.currentTarget, position: this.currentPosition, cancel: false
                };
                this.commandHandler.triggerEvent(DiagramEvent.drop, arg);
                if (!arg.cancel && args.source && this.commandHandler.isParentAsContainer(this.currentTarget) && !this.commandHandler.isTargetSubProcess(this.currentTarget)) {
                    let nodes: NodeModel[] = (args.source instanceof Selector) ? args.source.nodes : [args.source as NodeModel];
                    let isEndGroup: boolean = false;
                    let temp: boolean;
                    for (let i = 0; i < nodes.length; i++) {
                        if ((nodes[0] as Node).parentId === (nodes[parseInt(i.toString(), 10)] as Node).parentId) {
                            temp = true;
                        } else {
                            temp = false;
                            break;
                        }
                    }
                    // 902192: Diagram node resized wrongly while dragging and drop on multiple selected nodes in another lane Issue Fix
                    if (this.commandHandler.diagram.selectedItems.nodes.length !== nodes.length) {
                        nodes = this.commandHandler.diagram.selectedItems.nodes;
                    }
                    if(this.commandHandler.diagram.selectedItems.nodes.length > 1) {
                        //929543: To calculate the difference between the target lane bounds and selector bounds.
                        // We use this difference values to set the margin left and margin top for the child nodes of lane.
                        nodes = this.calculateDiff(this.commandHandler.diagram.selectedItems, this.currentTarget, this.commandHandler.diagram);
                        (this.commandHandler.diagram as any).multiselect = true;
                    } else {
                        (this.commandHandler.diagram as any).multiselect = false;
                    }
                    for (let i: number = 0; i < nodes.length; i++) {
                        if (!nodes[parseInt(i.toString(), 10)].container && !(this.commandHandler.diagram.cancelPositionChange)) {
                            isEndGroup = true;
                            this.commandHandler.updateLaneChildrenZindex(nodes[parseInt(i.toString(), 10)] as Node,this.currentTarget);
                            this.commandHandler.dropChildToContainer(this.currentTarget, nodes[parseInt(i.toString(), 10)]);
                            this.commandHandler.renderContainerHelper(nodes[parseInt(i.toString(), 10)]);
                        }
                    }
                    //929543: To update the lane size based on the dropped child nodes entire bounds.
                    if (nodes.length > 1) {
                        let helper = this.commandHandler.diagram.nameTable['helper'];
                        if (helper) {
                            updateLaneBoundsWithSelector(this.currentTarget, helper, this.commandHandler.diagram);
                        }
                    }
                    if (historyAdded && this.commandHandler.isContainer && isEndGroup) {
                        this.commandHandler.endGroupAction();
                    }
                }
            }
            if (args.source && this.currentTarget) {
                this.commandHandler.dropAnnotation(args.source, this.currentTarget);
            }
            this.commandHandler.updateSelector();
            if (historyAdded && !this.commandHandler.isContainer) {
                this.commandHandler.endGroupAction();
            }
        } else {
            redoObject.nodes.push(cloneObject(args.source) as Node);
            args.portId = this.portId;
            obj = cloneObject(redoObject);
            const entry: HistoryEntry = {
                type: 'PortPositionChanged', objectId: this.portId,
                redoObject: cloneObject(obj), undoObject: cloneObject(this.undoElement), category: 'Internal'
            };
            this.commandHandler.addHistoryEntry(entry);
            //EJ2-909578: - Position change incorrect event args value for port dragging
            //Required correction on data type
            let port = this.getPort(args);
            if (port) {
                let nodePorts = this.undoElement.nodes.length > 0 ? this.undoElement.nodes[0].ports : [];
                let connPorts = this.undoElement.connectors.length > 0 ? this.undoElement.connectors[0].ports : [];
                for (let i = 0; i < nodePorts.length; i++) {
                    if (port.id === nodePorts[parseInt(i.toString(), 10)].id) {
                        oldValues = {
                            offsetX: nodePorts[parseInt(i.toString(), 10)].offset.x,
                            offsetY: nodePorts[parseInt(i.toString(), 10)].offset.y
                        };
                        newValues = { offsetX: port.offset.x, offsetY: port.offset.y };
                        break;
                    }
                }
                for (let i = 0; i < connPorts.length; i++) {
                    if (port.id === connPorts[parseInt(i.toString(), 10)].id) {
                        (oldValues as any) = {
                            offset: connPorts[parseInt(i.toString(), 10)].offset
                        };
                        (newValues as any) = { offset: port.offset };
                        break;
                    }
                }

            }
            let arg: IDraggingEventArgs = {
                source: port as any, state: 'Completed', oldValue: oldValues, newValue: newValues,
                target: this.currentTarget, targetPosition: this.currentPosition, allowDrop: true, cancel: false
            };
            this.commandHandler.triggerEvent(DiagramEvent.positionChange, arg);
        }
        // this.commandHandler.updateBlazorSelector();
        super.mouseUp(args);
    }
    private clearDiff(nodes: NodeModel[]) {
        nodes.forEach(function (node, index) {
            delete (node as any).diffX;
            delete (node as any).diffY;
        });
    }
    private calculateDiff(selector: SelectorModel, target: NodeModel, diagram: Diagram){
        this.clearDiff(selector.nodes);
        let selectorLeft = selector.wrapper.bounds.left;
        let selectorTop = selector.wrapper.bounds.top;
        let targetLeft = target.wrapper.bounds.left;
        let targetTop = target.wrapper.bounds.top;
        let diffLeft: number;
        let diffTop: number;
        const swimlane = diagram.nameTable[(target as Node).parentId];
        if (target.columnIndex === 0 && swimlane && swimlane.shape.orientation === 'Horizontal') {
            targetLeft += 50;
        }
        if (target.rowIndex === 1 && swimlane && swimlane.shape.orientation === 'Vertical') {
            targetTop += 50;
        }
        if (selectorLeft < targetLeft) {
            diffLeft = targetLeft - selectorLeft;

        } else {
            diffLeft = 0;
        }
        if (selectorTop < targetTop) {
            diffTop = targetTop - selectorTop;

        }else {
            diffTop = 0;
        }
        let nodes = selector.nodes;
        nodes.forEach(function(node, index) {
            (node as any).diffX = diffLeft;
            (node as any).diffY = diffTop;
        });
        return nodes;
    }


    //EJ2-59309-While drag the connected node the connector endPointChange event does not get trigger
    private connectorEndPointChangeEvent(arg: any, snappedPoint?: PointModel): void {
        let selectedElement: any = arg.source;
        if (selectedElement instanceof Selector && selectedElement.nodes.length > 0) {
            for (let i: number = 0; i < selectedElement.nodes.length; i++) {
                let node: NodeModel = selectedElement.nodes[parseInt(i.toString(), 10)];
                if(node && (node as any).inEdges.length > 0) {
                    for (let j: number =0; j < (node as any).inEdges.length; j++) {
                        let connector: ConnectorModel = this.commandHandler.diagram.getObject((node as any).inEdges[parseInt(j.toString(), 10)]);
                        this.triggerEndPointEvent(connector, arg, snappedPoint, 'targetPointChange');
                    }
                }
                if(node && (node as any).outEdges.length > 0) {
                    for (let j: number =0; j < (node as any).outEdges.length; j++) {
                        let connector: ConnectorModel = this.commandHandler.diagram.getObject((node as any).outEdges[parseInt(j.toString(), 10)]);
                        this.triggerEndPointEvent(connector, arg, snappedPoint, 'sourcePointChange');
                    }
                }
            }
        }
    }

    private triggerEndPointEvent(connector: ConnectorModel, arg: any, snappedPoint: PointModel, eventName: string): void {
        let args: IEndChangeEventArgs = {
            connector: connector, state: arg.state, targetNode: connector.targetID, targetPort: connector.targetPortID,
            sourceNode: connector.sourceID, sourcePort: connector.sourcePortID, oldValue: {x: connector.targetPoint.x, y: connector.targetPoint.y},
            newValue: {x: connector.targetPoint.x + (snappedPoint?snappedPoint.x:0), y: connector.targetPoint.y + (snappedPoint?snappedPoint.y:0)}, cancel: arg.cancel
        };
        this.commandHandler.triggerEvent((eventName === 'targetPointChange')? DiagramEvent.targetPointChange: DiagramEvent.sourcePointChange, args);
    }

    private isSelectionHasConnector(args: any): boolean {
        if (args.nodes && args.connectors && args.nodes.length > 0 && args.connectors.length > 0 &&
            (args.width !== this.undoElement.width || args.height !== this.undoElement.height)) {
            return true;
        }
        return false;
    }

    // private getBlazorPositionChangeEventArgs(args: IDraggingEventArgs | IBlazorDraggingEventArgs, target: IElement): any {
    // args = {
    //     source: cloneBlazorObject(args.source), state: args.state, oldValue: args.oldValue, newValue: args.newValue,
    //     target: getObjectType(target) === Connector ? { connector: cloneBlazorObject(target) }
    //         : { node: cloneBlazorObject(target) },
    //     targetPosition: this.currentPosition, allowDrop: true, cancel: false
    // };
    // return args as IBlazorDraggingEventArgs;
    // }

    /* tslint:disable */
    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args); let isSame: boolean = false; let object: NodeModel | ConnectorModel | SelectorModel;
        object = (this.commandHandler.renderContainerHelper(args.source as NodeModel) as Node) ||
            args.source as Node | Connector | Selector;
        if (object instanceof Node || object instanceof Connector) {
            if (object instanceof Node) {
                if (object.offsetX === this.undoElement.nodes[0].offsetX &&
                    object.offsetY === this.undoElement.nodes[0].offsetY) {
                    isSame = true;
                }
            } else {
                if (Point.equals(object.sourcePoint, this.undoElement.connectors[0].sourcePoint) &&
                    Point.equals(object.targetPoint, this.undoElement.connectors[0].targetPoint)) { isSame = true; }
            }
        } else {
            if (object.wrapper.offsetX === this.undoElement.wrapper.offsetX &&
                object.wrapper.offsetY === this.undoElement.wrapper.offsetY) { isSame = true; }
        }
        let oldValues: SelectorModel;
        if (object) { oldValues = { offsetX: object.wrapper.offsetX, offsetY: object.wrapper.offsetY }; }
        let arg: IDraggingEventArgs | IBlazorDraggingEventArgs = {
            source: object as SelectorModel, state: 'Start', oldValue: oldValues, newValue: oldValues,
            target: args.target, targetPosition: args.position, allowDrop: true, cancel: false
        };
        arg = {
            source: cloneBlazorObject(object) as SelectorModel, state: 'Start', oldValue: cloneBlazorObject(oldValues),
            newValue: cloneBlazorObject(oldValues),
            target: args.target, targetPosition: args.position, allowDrop: arg.allowDrop, cancel: arg.cancel
        };
        //EJ2-909578: - Position change incorrect event args value for port dragging
        if (this.objectType === 'Port') {
            let port = this.getPort(args);
            if (port) {
                let nodePorts = this.undoElement.nodes.length > 0 ? this.undoElement.nodes[0].ports : [];
                let connPorts = this.undoElement.connectors.length > 0 ? this.undoElement.connectors[0].ports : [];
                for (let i = 0; i < nodePorts.length; i++) {
                    oldValues = { offsetX: port.offset.x, offsetY: port.offset.y };
                    if (port.offset.x !== nodePorts[parseInt(i.toString(), 10)].offset.x || port.offset.y !== nodePorts[parseInt(i.toString(), 10)].offset.y) {
                        isSame = false;
                        break;
                    }
                }
                for (let i = 0; i < connPorts.length; i++) {
                    (oldValues as any) = { offset: port.offset };
                    if (port.offset !== connPorts[parseInt(i.toString(), 10)].offset) {
                        isSame = false;
                        break;
                    }
                }
            }
            arg = {
                source: (port as any), state: 'Start', oldValue: oldValues, newValue: oldValues,
                target: args.target, targetPosition: args.position, allowDrop: true, cancel: false
            };
        }
        //(EJ2-277624)-In the positionChange event, during the completed state, old and new values remain identical.
        if (!this.isStartAction) {
            this.intialValue = { offsetX: object.wrapper.offsetX, offsetY: object.wrapper.offsetY };
            if ((this.commandHandler.diagram.lineRoutingModule &&
                (this.commandHandler.diagram.constraints & DiagramConstraints.LineRouting)
                && (this.commandHandler.diagram.layout.type !== 'ComplexHierarchicalTree'))) {
                const INFLATE_MARGIN: number = 40;
                const nodeBounds: Rect = getBounds(object.wrapper);
                nodeBounds.Inflate(INFLATE_MARGIN);
                const nearbyObjects: Array<NodeModel | ConnectorModel>= this.commandHandler.diagram.spatialSearch.findObjects(nodeBounds);
                for (const item of nearbyObjects) {
                    if (item instanceof Connector && this.commandHandler.diagram.routedConnectors.indexOf(item.id) === -1) {
                        // this.commandHandler.diagram.lineConnector.push(item.id);
                    }
                }
            }
        }
        if (isSame && !isBlazor()) {
            this.commandHandler.triggerEvent(DiagramEvent.positionChange, arg);
            this.connectorEndPointChangeEvent(arg);
            this.isStartAction = true;
        }
        this.commandHandler.diagram.cancelPositionChange = arg.cancel;
        this.currentPosition = args.position;
        if (this.objectType !== 'Port') {
            const x: number = this.currentPosition.x - this.prevPosition.x; const y: number = this.currentPosition.y - this.prevPosition.y;
            const diffX: number = this.initialOffset.x + (this.currentPosition.x - this.prevPosition.x);
            const diffY: number = this.initialOffset.y + (this.currentPosition.y - this.prevPosition.y);
            this.commandHandler.dragOverElement(args, this.currentPosition);
            this.commandHandler.disConnect(args.source);
            this.commandHandler.removeSnap();
            let oldValues: SelectorModel; let newValues: SelectorModel;
            const snappedPoint: PointModel = this.commandHandler.snapPoint(
                this.prevPosition, this.currentPosition, diffX, diffY);
            this.initialOffset.x = diffX - snappedPoint.x;
            this.initialOffset.y = diffY - snappedPoint.y;
            if (object) {
                oldValues = { offsetX: object.wrapper.offsetX, offsetY: object.wrapper.offsetY };
                newValues = {
                    offsetX: object.wrapper.offsetX + snappedPoint.x,
                    offsetY: object.wrapper.offsetY + snappedPoint.y
                };
            }
            if (this.currentTarget && args.target !== this.currentTarget) {
                this.commandHandler.removeChildFromBPmn(args.source, args.target, this.currentTarget);
            }
            this.currentTarget = args.target;
            let arg: IDraggingEventArgs | IBlazorDraggingEventArgs = {
                source: object as SelectorModel, state: 'Progress', oldValue: oldValues, newValue: newValues,
                target: args.target, targetPosition: args.position, allowDrop: true, cancel: false
            };
            this.commandHandler.triggerEvent(DiagramEvent.positionChange, arg);
            this.commandHandler.diagram.cancelPositionChange = arg.cancel;
            this.canTrigger = true;
            this.connectorEndPointChangeEvent(arg, snappedPoint);
            if (!arg.cancel && !this.canCancel) {
                this.blocked = !this.commandHandler.dragSelectedObjects(snappedPoint.x, snappedPoint.y);
                const blocked: boolean = !(this.commandHandler.mouseOver(this.currentElement, this.currentTarget, this.currentPosition));
                this.blocked = this.blocked || blocked;
            }
            this.commandHandler.removeStackHighlighter();
            this.commandHandler.renderStackHighlighter(args);
            if (this.currentTarget && (args.source !== this.currentTarget) &&
                this.commandHandler.isDroppable(args.source, this.currentTarget) && (args.source as Node).id !== 'helper') {
                let object: NodeModel = (args.source instanceof Selector) ? args.source.nodes[0] : args.source;
                if ((!this.commandHandler.isParentAsContainer(object, true))
                    && (object.shape.type !== 'SwimLane' && !(object.shape as SwimLaneModel).isPhase)) {
                    if ((this.currentTarget as Node).isLane) {
                        this.commandHandler.renderStackHighlighter(args, this.currentTarget);
                    } else {
                        this.commandHandler.drawHighlighter(this.currentTarget as IElement);
                    }
                }
            } else {
                this.commandHandler.removeHighlighter();
            }
            if (this.commandHandler.canEnableDefaultTooltip()) {
                const content: string = this.getTooltipContent(args.source as SelectorModel);
                const contentTemp = function () {
                    return content;
                };
                this.commandHandler.showTooltip(args.source, args.position, initializeCSPTemplate(contentTemp), 'MoveTool', this.isTooltipVisible);
                this.isTooltipVisible = false;
            }
        } else {
            const matrix: Matrix = identityMatrix(); const node: NodeModel = args.source as Node;
            let oldValues: SelectorModel; let newValues: SelectorModel;
            let nodePorts = this.undoElement.nodes.length > 0 ? this.undoElement.nodes[0].ports : [];
            let connPorts = this.undoElement.connectors.length > 0 ? this.undoElement.connectors[0].ports : [];
            let port = this.getPort(args);
            if (port) {
                for (let i = 0; i < nodePorts.length; i++) {
                    oldValues = { offsetX: port.offset.x, offsetY: port.offset.y };
                    break;
                }
                for (let i = 0; i < connPorts.length; i++) {
                    (oldValues as any) = { offset: port.offset };
                    break;
                }
            }
            rotateMatrix(matrix, -node.rotateAngle || -node.wrapper.rotateAngle, node.offsetX || node.wrapper.offsetX, node.offsetY || node.wrapper.offsetY);
            const prevPosition: PointModel = transformPointByMatrix(matrix, { x: this.prevPosition.x, y: this.prevPosition.y });
            const position: PointModel = transformPointByMatrix(matrix, { x: args.position.x, y: args.position.y });
            this.commandHandler.portDrag(args.source, args.sourceWrapper, position.x - prevPosition.x, position.y - prevPosition.y);
            //EJ2-909578: - Position change incorrect event args value for port dragging
            //Required correction on data type
            if (port) {
                for (let i = 0; i < nodePorts.length; i++) {
                    newValues = { offsetX: port.offset.x, offsetY: port.offset.y };
                    break;
                }
                for (let i = 0; i < connPorts.length; i++) {
                    (newValues as any) = { offset: port.offset };
                    break;
                }
            }
            let arg: IDraggingEventArgs = {
                source: port as any, state: 'Progress', oldValue: oldValues, newValue: newValues,
                target: args.target, targetPosition: args.position, allowDrop: true, cancel: false
            };
            this.commandHandler.triggerEvent(DiagramEvent.positionChange, arg);
        }
        this.prevPosition = this.currentPosition;
        return !this.blocked;
    }


    private getTooltipContent(node: SelectorModel): string {
        return 'X:' + Math.round(node.wrapper.bounds.x) + ' ' + 'Y:' + Math.round(node.wrapper.bounds.y);
    }

    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        this.mouseUp(args);
    }

    /**   @private  */
    public endAction(): void {
        super.endAction();
        this.currentTarget = null;
        this.prevPosition = null;
    }
}

/**
 * Rotates the selected objects
 */
export class RotateTool extends ToolBase {

    /** @private */
    public tempArgs: IRotationEventArgs;

    /** @private */
    public canCancel: boolean;

    /** @private */
    public rotateStart: boolean = false;

    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
    }

    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        this.undoElement = cloneObject(args.source);
        if (this.undoElement.nodes[0] && this.undoElement.nodes[0].children) {
            const objects: (NodeModel | ConnectorModel)[] = [];
            const nodes: (NodeModel | ConnectorModel)[] = this.commandHandler.getAllDescendants(this.undoElement.nodes[0], objects);
            for (let i: number = 0; i < nodes.length; i++) {
                const node: NodeModel = this.commandHandler.cloneChild(nodes[parseInt(i.toString(), 10)].id);
                this.childTable[nodes[parseInt(i.toString(), 10)].id] = cloneObject(node);
            }
        }


        super.mouseDown(args);
    }

    /**
     * @param args
     * @private
     */
    public async mouseUp(args: MouseEventArgs): Promise<void> {
        this.checkPropertyValue();
        let object: NodeModel | ConnectorModel | SelectorModel;
        object = (this.commandHandler.renderContainerHelper(args.source) as Node) || args.source as Node | Selector;
        if (this.undoElement.rotateAngle !== object.wrapper.rotateAngle) {
            //942139: Rotation change event old and new value same
            const oldValue: SelectorModel = { rotateAngle: this.undoElement.rotateAngle };
            const newValue: SelectorModel = { rotateAngle: object.wrapper.rotateAngle };
            const arg: IRotationEventArgs = {
                source: args.source, state: 'Completed', oldValue: oldValue,
                newValue: newValue, cancel: false
            };

            this.commandHandler.triggerEvent(DiagramEvent.rotateChange, arg);
            let obj: SelectorModel;
            obj = cloneObject(args.source);
            const entry: HistoryEntry = {
                type: 'RotationChanged', redoObject: cloneObject(obj), undoObject: cloneObject(this.undoElement), category: 'Internal',
                childTable: this.childTable
            };
            this.commandHandler.addHistoryEntry(entry);
            this.commandHandler.updateSelector();
            this.rotateStart =false;
        }
        // this.commandHandler.updateBlazorSelector();
        this.canCancel = undefined;
        this.tempArgs = undefined;
        super.mouseUp(args);
    }

    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        let object: NodeModel | ConnectorModel | SelectorModel;
        object = (this.commandHandler.renderContainerHelper(args.source as NodeModel) as Node) || args.source as Node | Selector;
        if (this.undoElement.rotateAngle === object.wrapper.rotateAngle && !this.rotateStart) {
            const oldValue: SelectorModel = { rotateAngle: object.wrapper.rotateAngle };

            const arg: IRotationEventArgs = {
                source: args.source, state: 'Start', oldValue: oldValue, newValue: oldValue, cancel: false
            };

            this.commandHandler.triggerEvent(DiagramEvent.rotateChange, arg);

            this.rotateStart = true;
        }

        this.currentPosition = args.position;
        const refPoint: PointModel = { x: object.wrapper.offsetX, y: object.wrapper.offsetY };
        let angle: number = Point.findAngle(refPoint, this.currentPosition) + 90;
        const snapAngle: number = this.commandHandler.snapAngle(angle);
        angle = snapAngle !== 0 ? snapAngle : angle;
        angle = (angle + 360) % 360;
        const oldValue: SelectorModel = { rotateAngle: object.wrapper.rotateAngle };
        const newValue: SelectorModel = { rotateAngle: angle };
        const arg: IRotationEventArgs = {
            source: args.source, state: 'Progress', oldValue: oldValue,
            newValue: newValue, cancel: false
        };
        const arg1: IRotationEventArgs = {
            source: cloneBlazorObject(args.source), state: 'Progress', oldValue: cloneBlazorObject(oldValue),
            newValue: cloneBlazorObject(newValue), cancel: arg.cancel
        };
        this.commandHandler.triggerEvent(DiagramEvent.rotateChange, arg1);
        if (!arg1.cancel) {
            this.blocked = !(this.commandHandler.rotateSelectedItems(angle - object.wrapper.rotateAngle));
        }
        if (this.commandHandler.canEnableDefaultTooltip()) {
            const content: string = this.getTooltipContent(args.source as SelectorModel);
            const contentTemp = function() {
                return content;
            };
            this.commandHandler.showTooltip(args.source, args.position, initializeCSPTemplate(contentTemp), 'RotateTool', this.isTooltipVisible);
            this.isTooltipVisible = false;
        }
        return !this.blocked;
    }


    private getTooltipContent(node: SelectorModel): string {
        return Math.round((node.rotateAngle % 360)).toString() + '\xB0';
    }

    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        this.mouseUp(args);
    }

    /**   @private  */
    public endAction(): void {
        super.endAction();
    }
}

/**
 * Scales the selected objects
 */
export class ResizeTool extends ToolBase {
    /**
     * Sets/Gets the previous mouse position
     */
    public prevPosition: PointModel;

    /** @private */
    public corner: string;

    /**   @private  */
    public initialOffset: PointModel;

    /** @private */
    public resizeStart: boolean = false;

    /** @private */
    public startValues:SelectorModel;

    /**   @private  */
    public initialBounds: Rect = new Rect();

    private canCancel: boolean = false;
    private tempArgs: ISizeChangeEventArgs;

    constructor(commandHandler: CommandHandler, corner: string) {
        super(commandHandler, true);
        this.corner = corner;
    }

    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        let oldValues: SelectorModel;
        this.undoElement = cloneObject(args.source);
        this.undoParentElement = this.commandHandler.getSubProcess(args.source);
        this.undoContainerElement = this.commandHandler.getContainer(args.source);
        super.mouseDown(args);
        if (this.undoElement.nodes[0] && this.undoElement.nodes[0].children) {
            const elements: (NodeModel | ConnectorModel)[] = [];
            const nodes: (NodeModel | ConnectorModel)[] = this.commandHandler.getAllDescendants(this.undoElement.nodes[0], elements);
            for (let i: number = 0; i < nodes.length; i++) {
                const node: NodeModel = this.commandHandler.cloneChild(nodes[parseInt(i.toString(), 10)].id);
                this.childTable[nodes[parseInt(i.toString(), 10)].id] = cloneObject(node);
            }
        }
        this.commandHandler.checkSelection((args.source as Selector), this.corner);
        super.mouseDown(args);
        this.initialBounds.x = args.source.wrapper.offsetX;
        this.initialBounds.y = args.source.wrapper.offsetY;
        this.initialBounds.height = args.source.wrapper.actualSize.height;
        this.initialBounds.width = args.source.wrapper.actualSize.width;

    }

    /**
     * @param args
     * @param isPreventHistory
     * @param args
     * @param isPreventHistory
     * @private
     */
    public async mouseUp(args: MouseEventArgs, isPreventHistory?: boolean): Promise<boolean> {
        this.checkPropertyValue();
        this.commandHandler.removeSnap();
        let object: NodeModel | ConnectorModel | SelectorModel;
        this.commandHandler.updateSelector();
        object = (this.commandHandler.renderContainerHelper(args.source as NodeModel) as Node) || args.source as Node | Selector;
        if ((this.undoElement.offsetX !== object.wrapper.offsetX || this.undoElement.offsetY !== object.wrapper.offsetY ||
            this.undoElement.width !== object.wrapper.bounds.width || this.undoElement.height !== object.wrapper.bounds.height)) {

            const deltaValues: Rect = this.updateSize(args.source, this.currentPosition, this.prevPosition, this.corner, this.initialBounds);
            this.blocked = this.scaleObjects(
                deltaValues.width, deltaValues.height, this.corner, this.currentPosition, this.prevPosition, object);
            const oldValue: SelectorModel = {
                width: args.source.wrapper.actualSize.width, height: args.source.wrapper.actualSize.height
            };
            const arg: ISizeChangeEventArgs = {
                source: cloneBlazorObject(args.source), state: 'Completed',
                oldValue: this.startValues, newValue: oldValue, cancel: false
            };
            this.commandHandler.triggerEvent(DiagramEvent.sizeChange, arg);

            const obj: SelectorModel = cloneObject(args.source);
            const entry: HistoryEntry = {
                type: 'SizeChanged', redoObject: cloneObject(obj), undoObject: cloneObject(this.undoElement), category: 'Internal',
                childTable: this.childTable
            };
            this.resizeStart = false;
            if (!isPreventHistory) {
                this.commandHandler.startGroupAction();
                if ((obj.nodes[0] as Node) && (obj.nodes[0] as Node).processId) {
                    const entry: HistoryEntry = {
                        type: 'SizeChanged', redoObject: this.commandHandler.getSubProcess(args.source),
                        undoObject: this.undoParentElement, category: 'Internal'
                    };
                    this.commandHandler.addHistoryEntry(entry);
                }
                if ((obj.nodes[0] as Node) && (obj.nodes[0] as Node).parentId
                && this.commandHandler.diagram.nameTable[(obj.nodes[0] as Node).parentId].shape.type === 'Container') {
                    const entry: HistoryEntry = {
                        type: 'SizeChanged', redoObject: this.commandHandler.getContainer(args.source),
                        undoObject: this.undoContainerElement, category: 'Internal'
                    };
                    this.commandHandler.addHistoryEntry(entry);
                }
                //EJ2-934129 : Position of the subprocess changed during undo and redo operations
                this.commandHandler.addHistoryEntry(entry);
                this.commandHandler.endGroupAction();
            }
        }
        // this.commandHandler.updateBlazorSelector();
        super.mouseUp(args);
        return !this.blocked;
    }

    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        let object: NodeModel | ConnectorModel | SelectorModel;
        object = (this.commandHandler.renderContainerHelper(args.source as NodeModel) as Node) || args.source as Node | Selector;
        if (this.undoElement.offsetX === object.wrapper.offsetX && this.undoElement.offsetY === object.wrapper.offsetY && !this.resizeStart) {
            const oldValue: SelectorModel = {
                width: args.source.wrapper.actualSize.width, height: args.source.wrapper.actualSize.height
            };
            //EJ2-866122 - Need to enhance the sizeChange Event
            this.startValues = oldValue;
            const arg: ISizeChangeEventArgs = {
                source: args.source, state: 'Start', oldValue: oldValue, newValue: this.currentElement, cancel: false
            };

            this.commandHandler.triggerEvent(DiagramEvent.sizeChange, arg);

            this.resizeStart = true;
        }
        this.currentPosition = args.position;
        const x: number = this.currentPosition.x - this.startPosition.x;
        const y: number = this.currentPosition.y - this.startPosition.y;
        let changes: PointModel = { x: x, y: y };
        changes = rotatePoint(-this.currentElement.wrapper.rotateAngle, undefined, undefined, changes);
        const sx: number = (this.currentElement.wrapper.actualSize.width + changes.x) / this.currentElement.wrapper.actualSize.width;
        const sy: number = (this.currentElement.wrapper.actualSize.height + changes.y) / this.currentElement.wrapper.actualSize.height;
        changes = this.getChanges(changes);
        this.commandHandler.removeSnap();
        const deltaValues: Rect = this.updateSize(args.source, this.startPosition, this.currentPosition, this.corner, this.initialBounds);
        this.blocked = !(this.scaleObjects(
            deltaValues.width, deltaValues.height, this.corner, this.startPosition, this.currentPosition, object));
        if (this.commandHandler.canEnableDefaultTooltip()) {
            const content: string = this.getTooltipContent(args.source as SelectorModel);
            //Task 834121: Content-Security-Policy support for diagram
            const contentTemp = function() {
                return content;
            };
            this.commandHandler.showTooltip(args.source, args.position, initializeCSPTemplate(contentTemp), 'ResizeTool', this.isTooltipVisible);
            this.isTooltipVisible = false;
        }
        this.prevPosition = this.currentPosition;
        return !this.blocked;
    }
    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        this.mouseUp(args);
    }
    private getTooltipContent(node: SelectorModel): string {
        return 'W:' + Math.round(node.wrapper.bounds.width) + ' ' + 'H:' + Math.round(node.wrapper.bounds.height);
    }

    private getChanges(change: PointModel): PointModel {
        switch (this.corner) {
        case 'ResizeEast':
            return { x: change.x, y: 0 };
        case 'ResizeSouthEast':
            return change;
        case 'ResizeSouth':
            return { x: 0, y: change.y };
        case 'ResizeNorth':
            return { x: 0, y: -change.y };
        case 'ResizeNorthEast':
            return { x: change.x, y: -change.y };
        case 'ResizeNorthWest':
            return { x: -change.x, y: -change.y };
        case 'ResizeWest':
            return { x: - change.x, y: 0 };
        case 'ResizeSouthWest':
            return { x: - change.x, y: change.y };
        }
        return change;
    }
    /**
     * Updates the size with delta width and delta height using scaling.
     */

    /**
     * Aspect ratio used to resize the width or height based on resizing the height or width
     *
     * @param deltaWidth
     * @param deltaHeight
     * @param corner
     * @param startPoint
     * @param endPoint
     * @param source
     * @param deltaWidth
     * @param deltaHeight
     * @param corner
     * @param startPoint
     * @param endPoint
     * @param source
     * @param deltaWidth
     * @param deltaHeight
     * @param corner
     * @param startPoint
     * @param endPoint
     * @param source
     * @param deltaWidth
     * @param deltaHeight
     * @param corner
     * @param startPoint
     * @param endPoint
     * @param source
     * @param deltaWidth
     * @param deltaHeight
     * @param corner
     * @param startPoint
     * @param endPoint
     * @param source
     * @param deltaWidth
     * @param deltaHeight
     * @param corner
     * @param startPoint
     * @param endPoint
     * @param source
     */
    private scaleObjects(
        deltaWidth: number, deltaHeight: number, corner: string, startPoint: PointModel, endPoint: PointModel,
        source?: SelectorModel | NodeModel)
        : boolean {
        const selectedItem = this.commandHandler.diagram.selectedItems;
        if ((source instanceof Selector && source.nodes.length === 1 && source.nodes[0].constraints & NodeConstraints.AspectRatio) || (source instanceof Node && source.id === 'helper' && selectedItem.nodes.length === 1 && selectedItem.nodes[0].constraints & NodeConstraints.AspectRatio)) {
            if (corner === 'ResizeWest' || corner === 'ResizeEast' || corner === 'ResizeNorth' || corner === 'ResizeSouth') {
                if (!(deltaHeight === 1 && deltaWidth === 1)) {
                    deltaHeight = deltaWidth = Math.max(deltaHeight === 1 ? 0 : deltaHeight, deltaWidth === 1 ? 0 : deltaWidth);
                }
            } else {
                deltaHeight = deltaWidth = Math.max(deltaHeight, deltaWidth);
            }
        }
        const oldValue: SelectorModel = {
            width: source.width, height: source.height
        };
        this.blocked = this.commandHandler.scaleSelectedItems(deltaWidth, deltaHeight, this.getPivot(this.corner));
        const newValue: SelectorModel = {
            width: source.width, height: source.height
        };
        let arg: ISizeChangeEventArgs;
        arg = { source: source as Selector, state: 'Progress', oldValue: oldValue, newValue: newValue, cancel: false };
        let arg1: ISizeChangeEventArgs;
        arg1 = {
            source: cloneBlazorObject(source) as Selector, state: 'Progress',
            oldValue: cloneBlazorObject(oldValue), newValue: cloneBlazorObject(newValue), cancel: arg.cancel
        };

        this.commandHandler.triggerEvent(DiagramEvent.sizeChange, arg1);

        if (arg1.cancel || this.canCancel) {
            this.commandHandler.scaleSelectedItems(1 / deltaWidth, 1 / deltaHeight, this.getPivot(this.corner));
        }
        return this.blocked;
    }


}

/**
 * Draws a node that is defined by the user
 */
export class NodeDrawingTool extends ToolBase {
    /** @private */
    public drawingObject: Node | Connector;
    /** @private */
    public sourceObject: Node | Connector;

    constructor(commandHandler: CommandHandler, sourceObject: Node | Connector) {
        super(commandHandler, true);
        this.sourceObject = sourceObject;
    }

    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        super.mouseDown(args);
        this.inAction = true;
        this.commandHandler.setFocus();
        this.triggerElementDrawEvent(args.source,'Start','Node',this.getShapeType(),true);
    }
    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        let checkBoundaryConstraints: boolean;
        const node: NodeModel = {
            offsetX: this.currentPosition.x, width: 3, height: 3,
            offsetY: this.currentPosition.y
        };
        if (!this.drawingObject) {
            this.drawingObject = this.commandHandler.drawObject(node as Node);
        }
        this.triggerElementDrawEvent(this.drawingObject,'Progress','Node',this.getShapeType(),false);
        if (this.inAction && Point.equals(this.currentPosition, this.prevPosition) === false) {
            const rect: Rect = Rect.toBounds([this.prevPosition, this.currentPosition]);
            checkBoundaryConstraints = this.commandHandler.checkBoundaryConstraints(undefined, undefined, rect);
            if (checkBoundaryConstraints) {
                this.commandHandler.updateNodeDimension(this.drawingObject, rect);
            }
        }
        return checkBoundaryConstraints;
    }

    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        let checkBoundaryConstraints: boolean;
        const rect: Rect = Rect.toBounds([this.prevPosition, this.currentPosition]);
        checkBoundaryConstraints = this.commandHandler.checkBoundaryConstraints(undefined, undefined, rect);
        if (this.drawingObject && this.drawingObject instanceof Node) {
            this.commandHandler.addObjectToDiagram(this.drawingObject);
            this.triggerElementDrawEvent(this.drawingObject,'Completed','Node',this.getShapeType(),false);
            this.drawingObject = null;
        }
        // this.commandHandler.updateBlazorSelector();
        super.mouseUp(args);
        this.inAction = false;
    }

    /**   @private  */
    public endAction(): void {
        super.endAction();
    }

    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        if (this.inAction) {
            this.mouseUp(args);
        }
    }

}
/**
 * Draws a connector that is defined by the user
 */
export class ConnectorDrawingTool extends ConnectTool {
    /** @private */
    public drawingObject: Node | Connector;
    /** @private */
    public sourceObject: Node | Connector;

    constructor(commandHandler: CommandHandler, endPoint: string, sourceObject: Node | Connector) {
        super(commandHandler, endPoint);
        this.sourceObject = sourceObject;
    }

    /**
     * @param args
     * @private
     */
    public async mouseDown(args: MouseEventArgs): Promise<void> {
        super.mouseDown(args);
        this.inAction = true;
        this.commandHandler.setFocus();
        this.triggerElementDrawEvent(args.source,'Start','Connector',(this.commandHandler.diagram.drawingObject as ConnectorModel).type,true);
    }
    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        this.commandHandler.enableServerDataBinding(false);
        if (this.inAction) {
            const connector: ConnectorModel = {
                sourcePoint: this.currentPosition, targetPoint: this.currentPosition
            };
            if (!this.drawingObject) {
                this.drawingObject = this.commandHandler.drawObject(connector as Connector);
            }
            args.source = this.drawingObject;
            this.triggerElementDrawEvent(args.source,'Progress','Connector',(this.drawingObject as ConnectorModel).type,false);
            //Bug 874781: Port Draw Connection is not proper with group node.
            if(args.actualObject && ((args.actualObject as Node).parentId || (args.actualObject as Node).children) && (this.drawingObject as ConnectorModel).sourceID === ''){
                this.setTarget(args);
            }
            if (((args.target && args.target instanceof Node) || (args.actualObject && args.sourceWrapper && checkPort(args.actualObject, args.sourceWrapper)))
                && (this.endPoint !== 'ConnectorTargetEnd' || (canInConnect(args.target as NodeModel)))) {
                this.commandHandler.connect(this.endPoint, args);
            }
            this.endPoint = 'ConnectorTargetEnd';
        }
        if (!this.inAction) {
            this.commandHandler.updateSelector();
            //EJ2-899368 : Highlighters for Connector Element Draw with userhandle updated wrongly
            if (args.source && !(args.source as SwimLaneModel).isLane && args.sourceWrapper) {
                this.commandHandler.renderHighlighter(args, true);
            }
        }
        super.mouseMove(args);
        this.commandHandler.enableServerDataBinding(true);
        return !this.blocked;

    }
    // Sets the target while drawing connector from the group node port or its children port.
    private setTarget(args: MouseEventArgs){
        if(args.target){
            if(!args.sourceWrapper.id.includes((args.target  as NodeModel).id)){
                if((args.target as Node).parentId && args.sourceWrapper.id.includes((args.target as Node).parentId)){
                    args.target = this.commandHandler.diagram.nameTable[(args.target as Node).parentId];
                }
            }
        }else{
            if(!args.sourceWrapper.id.includes((args.actualObject  as NodeModel).id)){
                if((args.actualObject  as Node).parentId && args.sourceWrapper.id.includes((args.actualObject  as Node).parentId)){
                    args.target = this.commandHandler.diagram.nameTable[(args.actualObject  as Node).parentId];
                }
            }else{
                args.target = args.actualObject;
            }
        }
    }

    /**
     * @param args
     * @private
     */
    public async mouseUp(args: MouseEventArgs): Promise<void> {

        this.commandHandler.enableServerDataBinding(false);
        this.checkPropertyValue();
        if (this.drawingObject && this.drawingObject instanceof Connector) {
            this.commandHandler.addObjectToDiagram(this.drawingObject);
            this.triggerElementDrawEvent(this.drawingObject,'Completed','Connector',(this.drawingObject as ConnectorModel).type,false);
            this.drawingObject = null;
        }
        // this.commandHandler.updateBlazorSelector();
        this.inAction = false;
        this.commandHandler.enableServerDataBinding(true);
        super.mouseUp(args);
    }

    /**   @private  */
    public endAction(): void {
        super.endAction();
    }

    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        if (this.inAction) {
            this.mouseUp(args);
        }
    }

}

export class TextDrawingTool extends ToolBase {


    /**   @private  */
    public drawingNode: Node | Connector;

    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
    }
    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        super.mouseDown(args);
        this.commandHandler.clearSelection();
        const node: NodeModel = {
            shape: { type: 'Text' },
            offsetX: this.currentPosition.x,
            offsetY: this.currentPosition.y
        };
        if (!args.source) {
            this.drawingNode = this.commandHandler.drawObject(node as Node);
        }
    }

    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        if (!this.drawingNode) {
            const node: NodeModel = {
                shape: { type: 'Text' }, offsetX: this.currentPosition.x, width: 30, height: 30,
                // EJ2-42640-Text size is different if Text Node is created over another diagram commited by sivakumar sekar
                // commanded style property and added it after the object is drawn
                // style: { strokeDashArray: '2 2', fill: 'transparent' },
                offsetY: this.currentPosition.y
            };
            this.drawingNode = this.commandHandler.drawObject(node as Node);
            this.drawingNode.style.strokeDashArray = '2 2';
            this.drawingNode.style.fill = 'transparent';
        } else {
            this.drawingNode.style.strokeColor = 'black';
            this.drawingNode.style.strokeDashArray = '2 2';
            this.drawingNode.style.fill = 'transparent';
        }
        if (this.inAction && Point.equals(this.currentPosition, this.prevPosition) === false) {
            const rect: Rect = Rect.toBounds([this.prevPosition, this.currentPosition]);
            this.commandHandler.updateNodeDimension(this.drawingNode, rect);
        }
        return !this.blocked;
    }

    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        if (this.drawingNode) {
            this.drawingNode.style.strokeColor = 'none';
            this.drawingNode.style.fill = 'none';
        } else {
            this.drawingNode = args.source as Node;
        }
        if (this.drawingNode && (this.drawingNode instanceof Node)) {
            this.commandHandler.addText(this.drawingNode, this.currentPosition);
        }
        super.mouseUp(args);
        this.inAction = false;
    }

    /**   @private  */
    public endAction(): void {
        super.endAction();
    }

}


/**
 * Pans the diagram control on drag
 */
export class ZoomPanTool extends ToolBase {
    private zooming: boolean;
    constructor(commandHandler: CommandHandler, zoom: boolean) {
        super(commandHandler);
        this.zooming = zoom;
    }

    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        super.mouseDown(args);
        this.inAction = true;
        this.commandHandler.setBlazorDiagramProps(true);
    }

    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        if (this.inAction) {
            if (!this.zooming && Point.equals(this.currentPosition, this.prevPosition) === false) {
                const difX: number = this.currentPosition.x - this.prevPosition.x;
                const difY: number = this.currentPosition.y - this.prevPosition.y;
                this.commandHandler.scroll(difX, difY, this.currentPosition);
            } else if (args.moveTouches && args.moveTouches.length && args.moveTouches.length >= 2) {
                const startTouch0: ITouches = args.startTouches[0];
                const startTouch1: ITouches = args.startTouches[1];
                const moveTouch0: ITouches = args.moveTouches[0];
                const moveTouch1: ITouches = args.moveTouches[1];
                const scale: number = this.getDistance(moveTouch0, moveTouch1) / this.getDistance(startTouch0, startTouch1);
                const focusPoint: PointModel = args.position;
                // 927527: Diagram flickers while performing pinch zoom
                if (scale !== 1) {
                    this.commandHandler.zoom(scale, 0, 0, focusPoint);
                }
                this.updateTouch(startTouch0, moveTouch0);
                this.updateTouch(startTouch1, moveTouch1);
            }
        }
        this.commandHandler.dataBinding();
        return !this.blocked;
    }

    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.commandHandler.setBlazorDiagramProps(false);
        this.checkPropertyValue();
        this.commandHandler.updatePanState(false);
        super.mouseUp(args);
        this.inAction = false;
    }

    /**   @private  */
    public endAction(): void {
        super.endAction();
    }

    private getDistance(touch1: ITouches, touch2: ITouches): number {
        const x: number = touch2.pageX - touch1.pageX;
        const y: number = touch2.pageY - touch1.pageY;
        return Math.sqrt((x * x) + (y * y));
    }

    private updateTouch(startTouch: ITouches, moveTouch: ITouches): void {
        startTouch.pageX = moveTouch.pageX;
        startTouch.pageY = moveTouch.pageY;
    }
}

/**
 * Animate the layout during expand and collapse
 */
export class ExpandTool extends ToolBase {
    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
    }

    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        this.commandHandler.initExpand(args);
        super.mouseUp(args);
    }

}

/**
 * Opens the annotation hypeLink at mouse up
 */
export class LabelTool extends ToolBase {
    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
    }

    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        let tab : string='_blank';
        let windowOption:string = '';
        let windowHeight = window.innerHeight;
        let windowWidth = window.innerWidth;
        let screenTop = window.screenTop;
        let screenLeft = window.screenLeft;
        if((args.sourceWrapper as TextElement).hyperlink.hyperlinkOpenState === 'CurrentTab')
        {
            tab='_self';
        }
        else if((args.sourceWrapper as TextElement).hyperlink.hyperlinkOpenState === 'NewWindow')
        {
            windowOption = 'height='+windowHeight+',width='+windowWidth+',top='+screenTop+',left='+screenLeft;
        }
        const win: Window = window.open((args.sourceWrapper as TextElement).hyperlink.link,tab,windowOption);
        win.focus();
        super.mouseUp(args);
    }
}

/**
 * Draws a Polygon shape node dynamically using polygon Tool
 */
export class PolygonDrawingTool extends ToolBase {
    /** @private */
    public drawingObject: Node | Connector;
    public startPoint: PointModel;
    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
    }
    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        super.mouseDown(args);
        this.inAction = true;
        if (!this.drawingObject) {
            this.startPoint = { x: this.startPosition.x, y: this.startPosition.y };
            const node: NodeModel = {
                offsetX: this.currentPosition.x,
                offsetY: this.currentPosition.y,
                width: 5, height: 5,
                // 916722: Apply custom style to polygon shape by removing the default style during polygon drawing.
                shape: {
                    type: 'Basic',
                    shape: 'Polygon',
                    points:
                        [{ x: this.startPoint.x, y: this.startPoint.y }, { x: this.currentPosition.x, y: this.currentPosition.y }]
                }
            };
            // 920152: elementDraw event not triggered for Polygon Drawing tool
            this.triggerElementDrawEvent(args.source, 'Start', 'Node', this.getShapeType(), true);
            this.drawingObject = this.commandHandler.drawObject(node as Node);
        } else {
            let pt: PointModel;
            const obj: BasicShapeModel = (this.drawingObject.shape as BasicShapeModel);
            pt = obj.points[obj.points.length - 1];
            pt = { x: pt.x, y: pt.y };
            (this.drawingObject.shape as BasicShapeModel).points.push(pt);
        }
    }

    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        if (this.inAction) {
            const obj: BasicShapeModel = (this.drawingObject.shape as BasicShapeModel);
            obj.points[obj.points.length - 1].x = this.currentPosition.x;
            obj.points[obj.points.length - 1].y = this.currentPosition.y;
            (this.drawingObject.wrapper.children[0] as PathElement).data = getPolygonPath(
                (this.drawingObject.shape as BasicShapeModel).points);
            // 920152: elementDraw event not triggered for Polygon Drawing tool
            this.triggerElementDrawEvent(this.drawingObject, 'Progress', 'Node', this.getShapeType(), false);
            if (this.inAction && Point.equals(this.currentPosition, this.prevPosition) === false) {
                const region: Rect = Rect.toBounds((this.drawingObject.shape as BasicShapeModel).points);
                this.commandHandler.updateNodeDimension(this.drawingObject, region);
            }
        }
        return true;
    }

    /**
     * @param args
     * @param dblClickArgs
     * @param args
     * @param dblClickArgs
     * @private
     */
    public mouseUp(args: MouseEventArgs, dblClickArgs?: IDoubleClickEventArgs | IClickEventArgs): void {
        this.checkPropertyValue();
        super.mouseMove(args);
        if (this.inAction) {
            this.inAction = false;
            this.commandHandler.addObjectToDiagram(this.drawingObject);
            // 920152: elementDraw event not triggered for Polygon Drawing tool
            this.triggerElementDrawEvent(this.drawingObject, 'Completed', 'Node', this.getShapeType(), false);
        }
        this.endAction();
    }

    /**
     * @param args
     * @private
     */
    public mouseWheel(args: MouseEventArgs): void {
        super.mouseWheel(args);
        this.mouseMove(args as MouseEventArgs);
    }

    /**   @private  */
    public endAction(): void {
        this.inAction = false;
        this.drawingObject = null;
    }
}
/**
 * Draws a PolyLine Connector dynamically using PolyLine Drawing Tool
 */
export class PolyLineDrawingTool extends ToolBase {
    /** @private */
    public drawingObject: Node | Connector;
    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
        this.connectorEndPoint = 'ConnectorSourceEnd';
    }
    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        let canConnect: boolean = false;
        if (this.inAction) {
            const obj: Connector = (this.drawingObject as Connector);
            obj.targetPoint = this.currentPosition;
            // 920152: elementDraw event not triggered for Polyline Drawing tool
            // 927554: ElementDraw Arguments updated wrongly for Polyline drawing
            this.triggerElementDrawEvent(this.drawingObject, 'Progress', 'Connector', (this.commandHandler.diagram.drawingObject as ConnectorModel).type, false);
            this.commandHandler.updateConnectorPoints(obj);
            // 962382: Drawing polyLine from port and node
            args.source = this.drawingObject;
            if (args.target && !(args.target as SwimLaneModel).isLane && args.targetWrapper) {
                canConnect = this.canConnect(args.targetWrapper, args.target, this.connectorEndPoint, 'In');
                if (canConnect) {
                    this.commandHandler.renderHighlighter(args, this.connectorEndPoint === 'ConnectorSourceEnd');
                }
            }
            if (this.connectorEndPoint === 'ConnectorSourceEnd' && (args.actualObject && args.actualObject instanceof Node && args.sourceWrapper )) {
                if ((args.source as any).sourceID === '' || (args.source as any).sourceID !== (args.source as any).targetID) {
                    this.commandHandler.connect(this.connectorEndPoint, args);
                }
            }
            this.connectorEndPoint = 'ConnectorTargetEnd';
        }
        if (!this.inAction) {
            this.commandHandler.updateSelector();
            if (args.source && !(args.source as SwimLaneModel).isLane && args.sourceWrapper) {
                canConnect = this.canConnect(args.sourceWrapper, args.source, this.connectorEndPoint, 'Out');
                if (canConnect) {
                    this.commandHandler.renderHighlighter(args, true);
                }
            }
        }
        return true;
    }
    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        super.mouseDown(args);
        this.inAction = true;
        if (!this.drawingObject) {
            const connector: ConnectorModel = {
                id: 'Connector',
                type: 'Straight',
                sourcePoint: this.currentPosition,
                targetPoint: this.currentPosition
            };
            // 920152: elementDraw event not triggered for Polyline Drawing tool
            this.triggerElementDrawEvent(args.source, 'Start', 'Connector', (this.commandHandler.diagram.drawingObject as ConnectorModel).type, true);
            if (this.inAction) {
                this.drawingObject = this.commandHandler.drawObject(connector as Connector);
            }
        } else {
            const drawObject: Connector = this.drawingObject as Connector;
            let segment: StraightSegmentModel;
            segment = new StraightSegment(drawObject, 'segments', { type: 'Straight' }, true);
            segment.point = this.currentPosition;
            drawObject.segments[drawObject.segments.length - 1] = segment;
        }
    }
    /**
     * @param args
     * @private
     */
    public mouseWheel(args: MouseEventArgs): void {
        super.mouseWheel(args); this.mouseMove(args as MouseEventArgs);
    }
    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        super.mouseMove(args);
        if (this.inAction) {
            if (this.drawingObject) {
                // 962382: Drawing polyLine from port and node
                if (this.connectorEndPoint === 'ConnectorTargetEnd') {
                    const eventhandler: any = (this.commandHandler.diagram as any).eventHandler;
                    let hoverObject: any = eventhandler.hoverElement;
                    if (hoverObject) {
                        hoverObject = hoverObject instanceof Node ? hoverObject : hoverObject.parentObj;
                        const padding: number = eventhandler.getConnectorPadding(args);
                        /* eslint-disable max-len */
                        let wrapper: any = this.commandHandler.diagram.findElementUnderMouse(hoverObject, this.currentPosition, this.commandHandler.diagram, padding);
                        const isMouseAboveObject: boolean = wrapper && wrapper.bounds.containsPoint(this.currentPosition, padding);
                        if (isMouseAboveObject) {
                            args.actualObject = hoverObject;
                            args.target = hoverObject;
                            args.targetWrapper = wrapper;
                            if ((this.drawingObject as any).sourceID !== (args.target as any).id) {
                                this.commandHandler.connect(this.connectorEndPoint, args);
                            }
                        }
                    }
                }
                const drawObject: ConnectorModel = this.drawingObject as ConnectorModel;
                (drawObject.segments[drawObject.segments.length - 1] as StraightSegment).point = { x: 0, y: 0 };
                this.commandHandler.addObjectToDiagram(this.drawingObject);
                // 920152: elementDraw event not triggered for Polyline Drawing tool
                // 927554: ElementDraw Arguments updated wrongly for Polyline drawing
                this.triggerElementDrawEvent(this.drawingObject, 'Completed', 'Connector', (this.commandHandler.diagram.drawingObject as ConnectorModel).type, false);
            }
        }
        this.endAction();
    }
    /**   @private  */
    public endAction(): void {
        this.drawingObject = null;
        this.inAction = false;
    }
    /**   @private  */
    public canConnect(wrapper: any, object: any, endpoint: string, connectionType: string): boolean {
        let canConnect: boolean = false;
        const targetObject = this.commandHandler.findTarget(wrapper, object, endpoint === 'ConnectorSourceEnd', true);
        if (targetObject instanceof PointPort) {
            canConnect = Boolean(connectionType === 'In' ?
                (this.connectorEndPoint === 'ConnectorTargetEnd' && canPortInConnect(targetObject)) :
                (this.connectorEndPoint === 'ConnectorSourceEnd' && canPortOutConnect(targetObject)));
        } else if (targetObject instanceof Node) {
            canConnect = Boolean(connectionType === 'In' ?
                (this.connectorEndPoint === 'ConnectorTargetEnd' && canInConnect(targetObject)) :
                (this.connectorEndPoint === 'ConnectorSourceEnd' && canOutConnect(targetObject)));
        }
        return canConnect;
    }
}

export class LabelDragTool extends ToolBase {
    private annotationId: string;
    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
    }
    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        this.inAction = true;
        this.undoElement = cloneObject(args.source);
        this.annotationId = args.sourceWrapper.id;
        super.mouseDown(args);
    }
    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        let difx: number = this.currentPosition.x - this.prevPosition.x;
        let dify: number = this.currentPosition.y - this.prevPosition.y;
        const node: NodeModel = args.source;
        if (node instanceof Node) {
            const matrix: Matrix = identityMatrix();
            rotateMatrix(matrix, -node.rotateAngle, 0, 0);
            const diff: PointModel = transformPointByMatrix(matrix, { x: difx, y: dify });
            difx = diff.x; dify = diff.y;
        }
        if (this.inAction) {
            this.commandHandler.labelDrag(args.source, args.sourceWrapper, difx, dify);
            this.commandHandler.updateSelector();
        }
        this.prevPosition = this.currentPosition;
        return !this.blocked;
    }
    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        const redoValue: NodeModel | ConnectorModel = args.source;
        this.inAction = false;
        const entryValue: HistoryEntry = {
            type: 'AnnotationPropertyChanged',
            objectId: this.annotationId, undoObject: cloneObject(this.undoElement),
            category: 'Internal', redoObject: cloneObject(redoValue)
        };
        this.commandHandler.addHistoryEntry(entryValue);
        super.mouseUp(args);
    }
    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        this.mouseUp(args);
    }
}
export class LabelResizeTool extends ToolBase {
    private corner: Actions;
    private annotationId: string;
    private initialBounds: Rect;
    constructor(commandHandler: CommandHandler, corner: Actions) {
        super(commandHandler, true);
        this.corner = corner;
    }
    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        this.inAction = true;
        const object: NodeModel | ConnectorModel = ((args.source as Selector).nodes.length) ?
            (args.source as Selector).nodes[0] : (args.source as Selector).connectors[0];
        this.annotationId = args.source.wrapper.children[0].id;
        this.undoElement = cloneObject(object);
        const annotation: DiagramElement = args.source.wrapper.children[0];
        this.initialBounds = {
            x: annotation.offsetX,
            y: annotation.offsetY,
            width: annotation.actualSize.width,
            height: annotation.actualSize.height
        } as Rect;
        super.mouseDown(args);
    }
    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        if (this.inAction) {
            this.resizeObject(args);
        }
        return !this.blocked;
    }
    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        const redoObject: NodeModel | ConnectorModel = ((args.source as Selector).nodes.length) ?
            (args.source as Selector).nodes[0] : (args.source as Selector).connectors[0];
        this.inAction = false;
        const entry: HistoryEntry = {
            type: 'AnnotationPropertyChanged', objectId: this.annotationId,
            redoObject: cloneObject(redoObject), undoObject: cloneObject(this.undoElement), category: 'Internal'
        };
        this.commandHandler.addHistoryEntry(entry);
        super.mouseUp(args);
    }
    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        this.mouseUp(args);
    }
    /**
     * @param args
     * @private
     */
    public resizeObject(args: MouseEventArgs): void {
        let object: NodeModel | ConnectorModel;
        object = ((args.source as Selector).nodes.length) ? (args.source as Selector).nodes[0] : (args.source as Selector).connectors[0];
        const textElement: DiagramElement = args.source.wrapper.children[0];
        let deltaWidth: number; let deltaHeight: number;
        const center: PointModel = { x: textElement.offsetX, y: textElement.offsetY };
        let rotateAngle: number = textElement.rotateAngle;
        rotateAngle += (object instanceof Node) ? object.rotateAngle : 0; rotateAngle = (rotateAngle + 360) % 360;
        const trans: Matrix = identityMatrix();
        rotateMatrix(trans, rotateAngle, center.x, center.y);
        const corner: string = (this.corner as string).slice(5);
        const pivot: Rect = this.updateSize(textElement, this.startPosition, this.currentPosition, corner, this.initialBounds, rotateAngle);
        const x: number = textElement.offsetX - textElement.actualSize.width * textElement.pivot.x;
        const y: number = textElement.offsetY - textElement.actualSize.height * textElement.pivot.y;
        let pivotPoint: PointModel = this.getPivot(corner);
        pivotPoint = { x: x + textElement.actualSize.width * pivotPoint.x, y: y + textElement.actualSize.height * pivotPoint.y };
        const point: PointModel = transformPointByMatrix(trans, pivotPoint);
        pivot.x = point.x; pivot.y = point.y;
        deltaWidth = pivot.width; deltaHeight = pivot.height;
        deltaWidth = (deltaWidth < 0) ? 1 : deltaWidth;
        deltaHeight = (deltaHeight < 0) ? 1 : deltaHeight;
        this.commandHandler.labelResize(
            object, (args.source as Selector).annotation as ShapeAnnotation, deltaWidth, deltaHeight, pivot, args.source as Selector);
        this.commandHandler.updateSelector();
    }
}
export class LabelRotateTool extends ToolBase {
    private annotationId: string;
    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
    }
    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        this.inAction = true;
        this.annotationId = args.source.wrapper.children[0].id;
        const object: NodeModel | ConnectorModel = ((args.source as Selector).nodes.length) ?
            (args.source as Selector).nodes[0] : (args.source as Selector).connectors[0];
        this.undoElement = cloneObject(object);
        super.mouseDown(args);
    }
    /**
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        if (args.source) {
            if (this.inAction) {
                const object: NodeModel | ConnectorModel = (args.source as Selector).nodes[0] ? (args.source as Selector).nodes[0] :
                    (args.source as Selector).connectors[0];
                let annotation: ShapeAnnotation | PathAnnotation;
                annotation = ((args.source as Selector).annotation) as ShapeAnnotation | PathAnnotation;
                this.commandHandler.labelRotate(
                    object, annotation, this.currentPosition, args.source as Selector);
                this.commandHandler.updateSelector();
            }
        }
        this.prevPosition = this.currentPosition;
        return !this.blocked;
    }

    /**
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        this.inAction = false;
        const redoEntry: NodeModel | ConnectorModel = ((args.source as Selector).nodes.length) ?
            (args.source as Selector).nodes[0] : (args.source as Selector).connectors[0];
        const entryObject: HistoryEntry = {
            type: 'AnnotationPropertyChanged', objectId: this.annotationId,
            redoObject: cloneObject(redoEntry),
            undoObject: cloneObject(this.undoElement), category: 'Internal'
        };
        this.commandHandler.addHistoryEntry(entryObject);
        super.mouseUp(args);
    }
    /**
     * @param args
     * @private
     */
    public mouseLeave(args: MouseEventArgs): void {
        this.mouseUp(args);
    }
}

/**
 * EJ2-33302 - Freehand drawing support in diagram control.
 */
export class FreeHandTool extends ToolBase {
    /** @private */
    public drawingObject: Node | Connector;
    public startPoint: PointModel;
    constructor(commandHandler: CommandHandler) {
        super(commandHandler, true);
    }
    /**
     * mouseMove - Collect the points using current mouse position and convert it into pathData.
     * @param args
     * @private
     */
    public mouseMove(args: MouseEventArgs): boolean {
        super.mouseMove(args);
        if (this.inAction) {
            const obj: PathModel = (this.drawingObject.shape as PathModel);
            let pt: PointModel = this.currentPosition as PointModel;
            (obj as BasicShapeModel).points.push(pt);
            (this.drawingObject.wrapper.children[0] as PathElement).data = getFreeHandPath(
                (this.drawingObject.shape as BasicShapeModel).points);
            (obj as PathModel).data = getFreeHandPath((obj as BasicShapeModel).points);
            // 920152: elementDraw event not triggered for Freehand Drawing tool
            this.triggerElementDrawEvent(args.source, 'Progress', 'Connector', (this.drawingObject as any).type, false);
            if (this.inAction && Point.equals(this.currentPosition, this.prevPosition) === false) {
                const region: Rect = Rect.toBounds((this.drawingObject.shape as BasicShapeModel).points);
                this.commandHandler.updateNodeDimension(this.drawingObject, region);
            }
        }
        return true;
    }
    /**
     * @param args
     * @private
     */
    public mouseDown(args: MouseEventArgs): void {
        super.mouseDown(args);
        this.inAction = true;
        this.startPoint = { x: this.startPosition.x, y: this.startPosition.y };
        const node: NodeModel = {
            offsetX: this.currentPosition.x,
            offsetY: this.currentPosition.y,
            width: 5, height: 5,
            style: { strokeColor: 'black', strokeWidth: 1, fill: 'transparent' },
            shape: {
                type: 'Path',
                points:
                    [{ x: this.startPoint.x, y: this.startPoint.y }, { x: this.currentPosition.x, y: this.currentPosition.y }]
            }
        };
        // 920152: elementDraw event not triggered for Freehand Drawing tool
        this.triggerElementDrawEvent(args.source, 'Start', 'Connector', (this.commandHandler.diagram.drawingObject as any).type, true);
        this.drawingObject = this.commandHandler.drawObject(node as Node);
    }
    /**
     * mouseUp - Remove the drawn object. Reduce and smoothen the collected points and create
     * a bezier connector using the smoothened points.
     * @param args
     * @private
     */
    public mouseUp(args: MouseEventArgs): void {
        this.checkPropertyValue();
        let tolerance: number = 10;
        let smoothValue: number = 0.5;
        if (this.inAction) {
            this.inAction = false;
            let obj: PathModel = (this.drawingObject.shape as PathModel);
            let points = (obj as BasicShapeModel).points;
            this.commandHandler.addObjectToDiagram(this.drawingObject);
            let prevId: string = this.drawingObject.id;
            let prevObj = this.commandHandler.diagram.nameTable[`${prevId}`];
            this.commandHandler.diagram.remove(prevObj);
            points = this.pointReduction(points, tolerance);
            // 927557: controlPointsVisibility Property values not considered in Freehand drawing
            let bezierSettings: BezierSettingsModel = {};
            if ((this.commandHandler.diagram.drawingObject as ConnectorModel).bezierSettings) {
                bezierSettings = (this.commandHandler.diagram.drawingObject as ConnectorModel).bezierSettings;
            }
            if (bezierSettings.allowSegmentsReset === undefined) {
                bezierSettings.allowSegmentsReset = false;
            }
            //EJ2-69816 - Added below code to set the allow segment reset as false to avoid the unwanted segment reset.
            const newObj: ConnectorModel = {
                id: 'newConnector' + randomId(), type: 'Bezier',
                sourcePoint: { x: points[0].x, y: points[0].y }, targetPoint: { x: points[points.length - 1].x, y: points[points.length - 1].y },
                //EJ2-873504[BUG]- Source and target decorator for free hand connector is not rendered.
                segments: [], bezierSettings: bezierSettings
            };
            this.drawingObject = this.commandHandler.drawObject(newObj as Connector);
            this.drawingObject = this.bezierCurveSmoothness(points, smoothValue, this.drawingObject, obj);
            this.commandHandler.updateConnectorPoints(this.drawingObject);
            this.commandHandler.addObjectToDiagram(this.drawingObject);
            // 920152: elementDraw event not triggered for Freehand Drawing tool
            // 927554: ElementDraw Arguments updated wrongly for Freehand drawing
            this.triggerElementDrawEvent(this.drawingObject, 'Completed', 'Connector', (this.commandHandler.diagram.drawingObject as any).type, false);
            //(EJ2-70838)- Added code to resolve style property not added dynamically for freehand connector
            // Added code to resolve style property not added dynamically for freehand connector
            super.mouseUp(args);
        }
    }
    /**
     * Reduce the collected points based on tolerance value.
     * @param points
     * @param tolerance
     * @returns points
     */
    public pointReduction(points: PointModel[], tolerance: number) {
        if (points === null || points.length < 3) {
            return points;
        }
        let firstPoint: number = 0;
        let lastPoint: number = points.length - 1;
        let pointIndex: number[] = [];
        pointIndex.push(firstPoint);
        pointIndex.push(lastPoint);

        while (points[parseInt(firstPoint.toString(), 10)] === (points[parseInt(lastPoint.toString(), 10)])) {
            lastPoint--;
        }
        this.reduction(points, firstPoint, lastPoint, tolerance, pointIndex);
        let returnedPoints: PointModel[] = [];
        pointIndex.sort(function (a, b) { return a - b; });
        pointIndex.forEach(element => {
            returnedPoints.push(points[parseInt(element.toString(), 10)]);
        });
        return returnedPoints;
    }

    public reduction(points:PointModel[], firstPoint:number, lastPoint:number, tolerance:number, pointIndex:number[])
    {
        let maxDistance:number = 0;
        let largestPointIndex:number = 0;
        for(let i:number = firstPoint; i < lastPoint; i++)
        {
            let distance:number = this.perpendicularDistance(points[parseInt(firstPoint.toString(), 10)] as Point,points[parseInt(lastPoint.toString(), 10)] as Point,points[parseInt(i.toString(), 10)] as Point);
            if (distance > maxDistance)
            {
                maxDistance = distance;
                largestPointIndex = i;
            }
        }
        if (maxDistance > tolerance && largestPointIndex !== 0)
        {
            pointIndex.push(largestPointIndex);
            this.reduction(points, firstPoint, largestPointIndex, tolerance, pointIndex);
            this.reduction(points, largestPointIndex, lastPoint, tolerance,  pointIndex);
        }
    }
    /**
     * Calculate the perpendicular distance of each point with first and last points
     * @param point1
     * @param point2
     * @param point3
     * @returns
     */
    public perpendicularDistance(point1:Point, point2:Point, point3:Point):number
    {
        let area:number = Math.abs(.5 * ((point1.x * point2.y - point2.x * point1.y) +
                (point2.x * point3.y - point3.x * point2.y) + (point3.x * point1.y - point1.x * point3.y)));
        let base = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        let height = area / base * 2;
        return height;
    }
    /**
     * Smoothen the bezier curve based on the points and smoothValue.
     * @param points
     * @param smoothValue
     * @param drawingObject
     * @param obj
     * @returns drawingObject
     */
    private bezierCurveSmoothness(points:PointModel[],smoothValue:number,drawingObject:Connector | Node,obj:PathModel): Node | Connector
    {
        if(points.length < 3)
        {
            return drawingObject;
        }
        for(let i:number = 0; i<points.length - 1 ; i++)
        {
            let pointx1:number = points[parseInt(i.toString(), 10)].x;
            let pointy1:number = points[parseInt(i.toString(), 10)].y;
            let pointx2:number = points[i + 1].x;
            let pointy2:number = points[i + 1].y;
            let pointx0:number;
            let pointy0:number;
            if (i === 0)
            {
                let previousPoint = points[parseInt(i.toString(), 10)];
                pointx0 = previousPoint.x;
                pointy0 = previousPoint.y;
            }
            else
            {
                pointx0 = points[i - 1].x;
                pointy0 = points[i - 1].y;
            }
            let pointx3: number; let pointy3: number;
            if (i === points.length - 2)
            {
                let nextPoint = points[i + 1];
                pointx3 = nextPoint.x;
                pointy3 = nextPoint.y;
            }
            else
            {
                pointx3 = points[i + 2].x;
                pointy3 = points[i + 2].y;
            }
            let xc1:number = (pointx0 + pointx1) / 2.0;
            let yc1:number = (pointy0 + pointy1) / 2.0;
            let xc2:number = (pointx1 + pointx2) / 2.0;
            let yc2:number = (pointy1 + pointy2) / 2.0;
            let xc3:number = (pointx2 + pointx3) / 2.0;
            let yc3:number = (pointy2 + pointy3) / 2.0;
            let point0:PointModel={}; let point1:PointModel={}; let point2:PointModel={};let point3:PointModel={};
            point0.x = pointx0; point0.y = pointy0;
            point1.x = pointx1; point1.y = pointy1;
            point2.x = pointx2; point2.y = pointy2;
            point3.x = pointx3; point3.y = pointy3;
            let len1:number = Point.findLength(point0,point1);
            let len2:number = Point.findLength(point1,point2);
            let len3:number = Point.findLength(point2,point3);
            let k1:number = len1 / (len1 + len2);
            let k2:number = len2 / (len2 + len3);
            let xm1:number = xc1 + (xc2 - xc1) * k1;
            let ym1:number = yc1 + (yc2 - yc1) * k1;
            let xm2:number = xc2 + (xc3 - xc2) * k2;
            let ym2:number = yc2 + (yc3 - yc2) * k2;
            let Controlpointx1:number = xm1 + (xc2 - xm1) * smoothValue + pointx1 - xm1;
            let Controlpointy1:number = ym1 + (yc2 - ym1) * smoothValue + pointy1 - ym1;
            let Controlpointx2:number = xm2 + (xc2 - xm2) * smoothValue + pointx2 - xm2;
            let Controlpointy2:number = ym2 + (yc2 - ym2) * smoothValue + pointy2 - ym2;

            let segment = new BezierSegment(obj, 'segments', { type: 'Bezier' }, true);
            let cnPt1:PointModel = {x:Controlpointx1,y:Controlpointy1};
            let cnPt2:PointModel = {x:Controlpointx2,y:Controlpointy2};
            let segSourcePoint:PointModel = {x:pointx1,y:pointy1};
            let segTargetPoint:PointModel = {x:pointx2,y:pointy2};

            segment.type = 'Bezier';
            (drawingObject as Connector).segments[parseInt(i.toString(), 10)] = segment;
            if(i=== 0){
                cnPt1 = {x:pointx1,y:pointy1};
            }
            if(i === points.length-2){
                cnPt2 = {x:pointx2,y:pointy2};
            }
            ((drawingObject as Connector).segments[parseInt(i.toString(), 10)] as BezierSegment).vector1 = {angle:findAngle(segSourcePoint,cnPt1),distance:Point.findLength(segSourcePoint,cnPt1)};
            ((drawingObject as Connector).segments[parseInt(i.toString(), 10)] as BezierSegment).vector2 = {angle:findAngle(segTargetPoint,cnPt2),distance:Point.findLength(segTargetPoint,cnPt2)};
            ((drawingObject as Connector).segments[parseInt(i.toString(), 10)] as BezierSegment).point = segTargetPoint;
        }
        return drawingObject;
    }
}
