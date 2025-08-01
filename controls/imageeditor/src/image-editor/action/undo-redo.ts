import { isNullOrUndefined, extend } from '@syncfusion/ej2-base';
import { EditCompleteEventArgs , Adjustment, CurrentObject, FrameValue, ImageEditor, Point, SelectionPoint, Transition, ZoomSettings } from '../index';
import { Dimension } from '@syncfusion/ej2-inputs';

export class UndoRedo {
    private parent: ImageEditor;
    private lowerContext: CanvasRenderingContext2D;
    private upperContext: CanvasRenderingContext2D;
    private tempCurrSelPoint: SelectionPoint;
    private undoRedoStep: number = 0;
    private undoRedoColl: Transition[] = [];
    private appliedUndoRedoColl: Transition[] = [];
    private tempUndoRedoColl: Transition[] = [];
    private tempUndoRedoStep: number = 0;
    private tempActObj: SelectionPoint; // For text editing undo redo
    private isPreventing: boolean = false;
    private preventEditComplete: boolean = false;
    private preventApplyEditComplete: boolean = false;

    constructor(parent: ImageEditor) {
        this.parent = parent;
        this.addEventListener();
    }

    public destroy(): void {
        if (this.parent.isDestroyed) { return; }
        this.removeEventListener();
    }

    private addEventListener(): void {
        this.parent.on('undo-redo', this.undoRedo, this);
        this.parent.on('destroyed', this.destroy, this);
    }

    private removeEventListener(): void {
        this.parent.off('undo-redo', this.undoRedo);
        this.parent.off('destroyed', this.destroy);
    }

    private initializeUrPvtProp(): void {
        if (this.parent.lowerCanvas) {this.lowerContext = this.parent.lowerCanvas.getContext('2d'); }
        if (this.parent.upperCanvas) {this.upperContext = this.parent.upperCanvas.getContext('2d'); }
    }

    private undoRedo(args?: { onPropertyChange?: boolean, prop: string, value?: object }): void {
        this.initializeUrPvtProp();
        switch (args.prop) {
        case 'updateUndoRedoColl':
            this.updateUrc(args.value['operation'], args.value['previousObj'],
                           args.value['previousObjColl'], args.value['previousPointColl'], args.value['previousSelPointColl'],
                           args.value['previousCropObj'], args.value['previousText'], args.value['currentText'],
                           args.value['previousFilter'], args.value['isCircleCrop']);
            break;
        case 'refreshUrc':
            this.refreshUrc(args.value['bool']);
            break;
        case 'updateCurrUrc':
            this.updateCurrUrc(args.value['type'], args.value['isCancel']);
            break;
        case 'call-undo':
            this.callUndo();
            break;
        case 'call-redo':
            this.callRedo();
            break;
        case 'undo':
            this.undo();
            break;
        case 'redo':
            this.redo();
            break;
        case 'updateUrObj':
            this.updateUrObj(args.value['objColl'], args.value['operation']);
            break;
        case 'updateUndoRedo':
            this.updateUndoRedo(args.value ? args.value['operation'] : null);
            break;
        case 'getAppliedUndoRedoColl':
            args.value['obj']['appliedUndoRedoColl'] = this.appliedUndoRedoColl;
            break;
        case 'getUndoRedoStep':
            args.value['obj']['undoRedoStep'] = this.undoRedoStep;
            break;
        case 'setUndoRedoStep':
            this.undoRedoStep = args.value['step'];
            break;
        case 'undoDefault':
            this.undoDefault(args.value['obj']);
            break;
        case 'setPreventUR':
            this.isPreventing = args.value['bool'];
            break;
        case 'updateUndoRedoStack':
            if (args.value && args.value['isPenDraw']) {
                this.updateUndoRedoStack(args.value['isPenDraw']);
            } else {
                this.updateUndoRedoStack();
            }
            break;
        case 'reset':
            this.reset();
            break;
        case 'preventEditComplete':
            args.value['obj']['bool'] = this.preventEditComplete;
            break;
        case 'preventApplyEditComplete':
            this.preventApplyEditComplete = args.value['bool'];
            break;
        }
    }

    public getModuleName(): string {
        return 'undo-redo';
    }

    private reset(): void {
        this.tempCurrSelPoint = null; this.undoRedoStep = 0;
        this.undoRedoColl = []; this.appliedUndoRedoColl = []; this.tempActObj = null;
        this.tempUndoRedoColl = []; this.tempUndoRedoStep = 0; this.isPreventing = false;
        this.preventEditComplete = this.preventApplyEditComplete = false;
    }

    private refreshUrc(refreshToolbar?: boolean): void {
        const parent: ImageEditor = this.parent;
        if (parent.isImageUpdated) {return; }
        refreshToolbar = refreshToolbar ? refreshToolbar : false;
        if (refreshToolbar) {
            parent.notify('toolbar', { prop: 'setEnableDisableUndoRedo', value: {isPrevent: true} });
            this.tempUndoRedoColl = extend([], this.appliedUndoRedoColl, [], true) as Transition[];
            this.tempUndoRedoStep = this.undoRedoStep;
        }
        parent.notify('toolbar', { prop: 'setEnableDisableUndoRedo', value: {isPrevent: false} });
        this.undoRedoColl = this.undoRedoColl.slice(0, this.undoRedoStep);
        this.appliedUndoRedoColl = this.appliedUndoRedoColl.slice(0, this.undoRedoStep);
        parent.isUndoRedo = parent.currObjType.isUndoAction = false;
        parent.notify('toolbar', { prop: 'enable-disable-btns' });
    }

    private updateCurrUrc(type: string, isCancel?: boolean): void {
        const parent: ImageEditor = this.parent;
        if (parent.isResize || this.isPreventing || parent.noPushUndo) {return; }
        parent.notify('toolbar', { prop: 'setEnableDisableUndoRedo', value: {isPrevent: false} });
        if (type === 'ok') {
            parent.notify('draw', { prop: 'setShapeTextInsert', onPropertyChange: false, value: {bool: false } });
            const collection: Transition[] = this.tempUndoRedoColl.length > 0 ?
                extend([], this.tempUndoRedoColl, [], true) as Transition[] :
                extend([], this.undoRedoColl, [], true) as Transition[];
            const prevObj: Transition = this.undoRedoColl[this.undoRedoColl.length - 1];
            const appliedURColl: Transition = this.appliedUndoRedoColl[this.appliedUndoRedoColl.length - 1];
            const prevTransform: CurrentObject = prevObj ? extend({}, prevObj.previousObj, {}, true) as CurrentObject
                : null;
            if (isNullOrUndefined(appliedURColl)) {
                if (this.undoRedoColl[0]) {
                    prevObj.previousCropObj = collection[0].previousCropObj;
                    prevObj.previousObj = collection[0].previousObj;
                    prevObj.previousObjColl = collection[0].previousObjColl;
                    prevObj.previousPointColl = collection[0].previousPointColl;
                    prevObj.previousText = collection[0].previousText;
                }
            } else if (prevObj.operation !== 'imageHFlip' && prevObj.operation !== 'imageVFlip') {
                prevObj.previousCropObj = appliedURColl.currentCropObj;
                prevObj.previousObj = appliedURColl.currentObj;
                prevObj.previousObjColl = appliedURColl.currentObjColl;
                prevObj.previousPointColl = appliedURColl.currentPointColl;
                prevObj.previousText = appliedURColl.currentText;
                if (prevObj.operation === 'frame' && prevObj.previousObj && prevTransform) {
                    prevObj.previousObj.defaultZoom = prevTransform.defaultZoom;
                    prevObj.previousObj.zoomFactor = prevTransform.zoomFactor;
                    prevObj.previousObj.cropZoom = prevTransform.cropZoom;
                }
            }
            if (prevObj) {
                if (prevObj.operation !== 'imageHFlip' && prevObj.operation !== 'imageVFlip') {
                    const obj: Object = this.getZeroZoomObjPointValue(prevObj.currentObjColl, prevObj.currentPointColl);
                    prevObj.currentObjColl = obj['obj'];
                    prevObj.currentPointColl = obj['point'];
                    const adjObj: Object = {adjustmentLevel: null  };
                    parent.notify('filter', { prop: 'getAdjustmentLevel', onPropertyChange: false, value: {obj: adjObj }});
                    prevObj.currentObj.adjustmentLevel = extend({}, adjObj['adjustmentLevel'], {}, true) as Adjustment;
                    parent.notify('filter', { prop: 'setTempAdjVal' });
                    prevObj.currentObj.currentFilter = parent.currentFilter;
                }
                this.appliedUndoRedoColl.push(prevObj);
                if (!isCancel) {
                    this.triggerActionCompletedEvent(prevObj.operation);
                }
            }
            this.tempUndoRedoColl = []; this.tempUndoRedoStep = 0;
        } else if (this.tempUndoRedoColl.length > 0) {
            this.appliedUndoRedoColl = extend([], this.tempUndoRedoColl, [], true) as Transition[];
            this.undoRedoStep = this.tempUndoRedoStep;
            this.tempUndoRedoColl = []; this.tempUndoRedoStep = 0;
        }
        let lastObj: Transition = this.appliedUndoRedoColl[this.appliedUndoRedoColl.length - 1];
        let lastPrevObj: Transition = this.appliedUndoRedoColl[this.appliedUndoRedoColl.length - 2];
        if (this.appliedUndoRedoColl.length > 16) {
            this.appliedUndoRedoColl.splice(0, 1);
        } else if (!isCancel && lastObj && lastPrevObj) {
            if ((((lastObj.operation === 'shapeTransform' && lastPrevObj.operation === 'shapeTransform') ||
                    (lastObj.operation === 'shapeInsert' && lastPrevObj.operation === 'shapeInsert')) &&
                    JSON.stringify(lastObj.currentObjColl) === JSON.stringify(lastPrevObj.currentObjColl)) ||
                (lastObj.operation === 'freehand-draw' && lastPrevObj.operation === 'freehand-draw' &&
                    JSON.stringify(lastObj.currentPointColl) === JSON.stringify(lastPrevObj.currentPointColl)) ||
                (lastObj.operation === 'freehanddrawCustomized' && lastPrevObj.operation === 'freehanddrawCustomized' &&
                    JSON.stringify(lastObj.currentPointColl) === JSON.stringify(lastPrevObj.currentPointColl))) {
                this.appliedUndoRedoColl.splice(this.appliedUndoRedoColl.length - 1, 1);
            } else if (this.undoRedoStep !== this.appliedUndoRedoColl.length - 1) {
                lastObj = this.appliedUndoRedoColl[this.appliedUndoRedoColl.length - 1];
                lastPrevObj = this.appliedUndoRedoColl[this.undoRedoStep];
                if (lastObj && lastPrevObj && lastObj.operation === 'shapeTransform' &&
                    lastPrevObj.operation === 'shapeTransform' &&
                    JSON.stringify(lastObj.currentObjColl) === JSON.stringify(lastPrevObj.previousObjColl)) {
                    this.appliedUndoRedoColl.splice(this.appliedUndoRedoColl.length - 1, 1);
                    this.undoRedoColl = [];
                    this.undoRedoColl = extend([], this.appliedUndoRedoColl, [], true) as Transition[];
                    return;
                }
            }
        }
        this.undoRedoColl = [];
        this.undoRedoColl = extend([], this.appliedUndoRedoColl, [], true) as Transition[];
        if (type === 'ok') {
            this.undoRedoStep = this.undoRedoColl.length;
            parent.notify('toolbar', { prop: 'enable-disable-btns' });
        }
        if (parent.transform.zoomFactor > 0) {
            parent.togglePan = true;
            parent.notify('selection', {prop: 'setDragCanvas', value: {bool: true }});
        }
    }

    private triggerActionCompletedEvent(action: string): void {
        const parent: ImageEditor = this.parent;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const actionMap: any = {'brightness': 'fine-tune', 'contrast': 'fine-tune', 'hue': 'fine-tune',
            'saturation': 'fine-tune', 'opacity': 'fine-tune', 'blur': 'fine-tune', 'exposure': 'fine-tune',
            'default': 'filter', 'chrome': 'filter', 'cold': 'filter', 'warm': 'filter',
            'grayscale': 'filter', 'sepia': 'filter', 'invert': 'filter',
            'deleteObj': 'shape-delete', 'deleteFreehandDrawing': 'freehand-draw-delete',
            'shapeInsert': 'shape-insert', 'shapeTransform': 'shape-customize',
            'freehanddrawCustomized': 'freehand-draw-customize'
        };
        const actionResult: string = actionMap[action as string] || action;
        const actionArgs: EditCompleteEventArgs  = { action: actionResult, actionEventArgs: parent.editCompleteArgs };
        parent.triggerEditCompleteEvent(actionArgs);
    }

    private getUndoRedoAction(action: string): string {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const actionMap: any = {'brightness': 'fine-tune', 'contrast': 'fine-tune', 'hue': 'fine-tune',
            'saturation': 'fine-tune', 'opacity': 'fine-tune', 'blur': 'fine-tune', 'exposure': 'fine-tune',
            'default': 'filter', 'chrome': 'filter', 'cold': 'filter', 'warm': 'filter',
            'grayscale': 'filter', 'sepia': 'filter', 'invert': 'filter',
            'deleteObj': 'shape-delete', 'deleteFreehandDrawing': 'freehand-drawing-delete',
            'shapeInsert': 'shape-insert', 'shapeTransform': 'shape-customize', 'imageRotate': 'shape-customize',
            'freehanddraw': 'freehand-draw', 'freehanddrawCustomized': 'freehand-draw-customize',
            'textAreaCustomization': 'text-area-customization', 'imageHFlip': 'shape-customize',
            'imageVFlip': 'shape-customize', 'bgColor': 'background-color', 'updateImage': 'image-update'
        };
        return actionMap[action as string] || action;
    }

    private cancelCropSelection(): void {
        const parent: ImageEditor = this.parent;
        let isCropSelection: boolean = false;
        let splitWords: string[];
        if (parent.activeObj.shape) {splitWords = parent.activeObj.shape.split('-'); }
        if (parent.currObjType.isCustomCrop || (splitWords && splitWords[0] === 'crop')) {
            isCropSelection = true;
        }
        if (isCropSelection) {
            parent.notify('draw', {prop: 'performCancel', value: {isContextualToolbar: null }});
        }
        if (this.tempUndoRedoColl.length !== 0 || this.tempUndoRedoStep !== 0) {
            this.appliedUndoRedoColl = extend([], this.tempUndoRedoColl, [], true) as Transition[];
            this.undoRedoColl = extend([], this.tempUndoRedoColl, [], true) as Transition[];
            this.undoRedoStep = this.tempUndoRedoStep;
            this.tempUndoRedoColl = []; this.tempUndoRedoStep = 0;
            parent.notify('toolbar', { prop: 'setEnableDisableUndoRedo', value: {isPrevent: false} });
        }
    }

    private refreshToolbarActions(): void {
        const parent: ImageEditor = this.parent;
        if (parent.activeObj.shape) {
            parent.notify('toolbar', { prop: 'refresh-toolbar', onPropertyChange: false, value: {type: 'shapes',
                isApplyBtn: null, isCropping: null, isZooming: null, cType: null}});
            parent.notify('toolbar', { prop: 'update-toolbar-items', onPropertyChange: false});
        } else {
            parent.notify('toolbar', { prop: 'refresh-main-toolbar', onPropertyChange: false});
        }
    }

    private applyCurrentChanges(): void {
        const parent: ImageEditor = this.parent;
        parent.currObjType.isFiltered = false;
        if (parent.transform.zoomFactor === 0) {
            parent.togglePan = false;
            parent.notify('selection', {prop: 'setDragCanvas', value: {bool: false }});
        }
        if (parent.element.querySelector('.e-contextual-toolbar-wrapper')) {
            parent.element.querySelector('.e-contextual-toolbar-wrapper').classList.add('e-hide');
        }
        if (parent.togglePen) {
            parent.togglePen = false;
            parent.upperCanvas.style.cursor = parent.cursor = 'default';
            this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
        }
        if (this.appliedUndoRedoColl.length > 0) {
            this.undoRedoColl = extend([], this.appliedUndoRedoColl, [], true) as Transition[];
        }
    }

    private callUndo(): void {
        this.applyCurrentChanges();
        this.undo();
    }

    private callRedo(): void {
        this.applyCurrentChanges();
        this.redo();
    }

    private undo(): void {
        const parent: ImageEditor = this.parent;
        this.cancelCropSelection();
        parent.notify('draw', { prop: 'resetFrameZoom', onPropertyChange: false, value: {isOk: false }});
        if (!parent.disabled && parent.isImageLoaded) {
            if (this.undoRedoStep > 0) {
                this.refreshToolbarActions();
                if (parent.activeObj.activePoint && parent.activeObj.activePoint.width !== 0) {
                    this.tempActObj = parent.activeObj;
                }
                parent.notify('shape', { prop: 'refreshActiveObj', onPropertyChange: false});
                this.undoRedoStep--;
                parent.notify('toolbar', {prop: 'enable-disable-btns'});
                if (parent.element.querySelector('.e-contextual-toolbar-wrapper')) {
                    parent.element.querySelector('.e-contextual-toolbar-wrapper').classList.add('e-hide');
                }
                parent.isUndoRedo = true;
                const obj: Transition = this.undoRedoColl[this.undoRedoStep];
                if (this.undoRedoColl.length === this.undoRedoStep) { parent.currObjType.isUndoAction = false; }
                else { parent.currObjType.isUndoAction = true; }
                if (obj.operation !== 'textAreaCustomization' &&
                    (parent.textArea.style.display === 'block' || parent.textArea.style.display === 'inline-block')) {
                    parent.textArea.style.display = 'none';
                }
                parent.notify('draw', { prop: 'setCancelAction', onPropertyChange: false, value: {bool: true }});
                let activeObj: SelectionPoint;
                parent.cropObj = extend({}, obj.previousCropObj, {}, true) as CurrentObject;
                parent.afterCropActions = obj.previousObj.afterCropActions;
                this.lowerContext.filter = obj.previousObj.filter;
                parent.notify('filter', { prop: 'setAdjustmentLevel', onPropertyChange: false, value: { adjustmentLevel: obj.previousObj.adjustmentLevel }});
                parent.notify('filter', { prop: 'setTempAdjVal' });
                parent.currentFilter = obj.previousObj.currentFilter;
                parent.notify('filter', { prop: 'setTempFilVal' });
                parent.canvasFilter = this.lowerContext.filter;
                parent.initialAdjustmentValue = this.lowerContext.filter;
                parent.notify('filter', { prop: 'setBevelFilter', onPropertyChange: false, value: { bevelFilter: this.lowerContext.filter }});
                const editCompleteArgs: object = {action: this.getUndoRedoAction(obj.operation) };
                switch (obj.operation) {
                case 'shapeTransform':
                case 'brightness':
                case 'contrast':
                case 'hue':
                case 'saturation':
                case 'opacity':
                case 'blur':
                case 'exposure':
                case 'default':
                case 'chrome':
                case 'cold':
                case 'warm':
                case 'grayscale':
                case 'blackandwhite':
                case 'sepia':
                case 'invert':
                case 'sharpen':
                case 'imageRotate':
                case 'shapeInsert':
                    this.shapeTransform(obj.previousObjColl, obj.previousPointColl);
                    break;
                case 'freehanddraw':
                case 'freehand-draw':
                    this.updateFreehandDraw(obj.previousPointColl, obj.previousSelPointColl);
                    parent.notify('freehand-draw', {prop: 'setCurrentFreehandDrawIndex',
                        value: {value: parent.pointColl.length}});
                    break;
                case 'freehanddrawCustomized':
                    this.updateFreehandDrawCustomized(obj.previousObjColl, obj.previousPointColl);
                    break;
                case 'deleteFreehandDrawing':
                case 'deleteObj':
                    this.updateDelete(obj.operation, obj.previousObjColl, obj.previousPointColl, obj.previousSelPointColl);
                    break;
                case 'textAreaCustomization':
                    this.shapeTransform(obj.previousObjColl, obj.previousPointColl);
                    this.updateTextAreaCustomization(activeObj, obj.previousObjColl);
                    break;
                case 'text':
                    this.updateText(obj.previousObjColl, true);
                    break;
                case 'frame':
                    parent.transform.zoomFactor = parent.transform.defaultZoomFactor = obj.previousObj.defaultZoom;
                    parent.setProperties({zoomSettings: { zoomFactor: obj.previousObj.zoomFactor}}, true);
                    parent.notify('transform', { prop: 'setPreviousZoomValue', onPropertyChange: false,
                        value: { previousZoomValue: parent.zoomSettings.zoomFactor } });
                    extend(parent.frameObj, obj.previousObj.frameObj);
                    parent.notify('draw', {prop: 'render-image', value: {isMouseWheel: true, isPreventClearRect: null, isFrame: true } });
                    break;
                case 'imageHFlip':
                    this.imageFlip('horizontal', obj.previousObjColl);
                    break;
                case 'imageVFlip':
                    this.imageFlip('vertical', obj.previousObjColl);
                    break;
                case 'bgColor':
                    parent.notify('draw', { prop: 'imageBackgroundColor', onPropertyChange: false, value: {color: obj.previousObj.bgColor }});
                    parent.notify('draw', { prop: 'render-image', value: { isMouseWheel: false } });
                    break;
                case 'updateImage':
                    parent.isImageUpdated = true;
                    parent.baseImg.src = obj.previousObj.imageSource;
                    setTimeout(() => {
                        if (parent.cropObj.straighten !== 0) {
                            parent.notify('toolbar', { prop: 'performCropTransformClick', value: { shape: 'crop-' + 'custom' } });
                            parent.noPushUndo = true;
                            parent.crop();
                            parent.noPushUndo = false;
                        } else {
                            parent.notify('draw', { prop: 'render-image', value: { isMouseWheel: false } });
                        }
                        parent.isImageUpdated = false;
                    });
                    break;
                default:
                    this.undoDefault(obj, true);
                    parent.notify('filter', { prop: 'set-adjustment', value: {operation: obj.operation}});
                    parent.notify('filter', { prop: 'update-filter', value: {operation: obj.operation, filter: obj.filter}});
                    break;
                }
                if (obj.operation === 'crop') {
                    if (obj.previousObj.currSelectionPoint) {
                        parent.currSelectionPoint = extend({}, obj.previousObj.currSelectionPoint, {}, true) as SelectionPoint;
                        if (parent.currSelectionPoint && isNullOrUndefined(parent.currSelectionPoint.shape)) {
                            parent.currSelectionPoint = null;
                        }
                    }
                    parent.updateCropTransformItems();
                    parent.notify('draw', { prop: 'select', onPropertyChange: false,
                        value: {type: 'custom', startX: null, startY: null, width: null, height: null}});
                    if (parent.isCircleCrop) {
                        parent.isCircleCrop = false;
                        this.tempCurrSelPoint = extend({}, parent.currSelectionPoint, {}, true) as SelectionPoint;
                        parent.currSelectionPoint = null;
                    }
                    const tempCircleCrop: boolean = parent.cancelCropSelection.isCircleCrop;
                    parent.cancelCropSelection.isCircleCrop = false;
                    parent.notify('draw', {prop: 'performCancel', value: {isContextualToolbar: null, isUndoRedo: true }});
                    parent.cancelCropSelection.isCircleCrop = tempCircleCrop;
                    parent.currObjType.isActiveObj = false;
                    if (parent.transform.straighten !== 0) {
                        parent.notify('draw', { prop: 'setStraightenActObj', value: {activeObj: null }});
                    }
                } else if (obj.operation === 'resize' && parent.cropObj && parent.cropObj.activeObj) {
                    parent.currSelectionPoint = extend({}, parent.cropObj.activeObj, {}, true) as SelectionPoint;
                }
                if ((this.undoRedoColl[this.undoRedoStep - 1]
                    && this.undoRedoColl[this.undoRedoStep - 1].isCircleCrop)) {
                    parent.isCircleCrop = true;
                    parent.notify('crop', { prop: 'cropCircle', onPropertyChange: false,
                        value: {context: this.lowerContext, isSave: null, isFlip: null}});
                }
                this.endUndoRedo(obj.operation, true);
                const action: EditCompleteEventArgs  = { action: 'undo', actionEventArgs: editCompleteArgs };
                parent.triggerEditCompleteEvent(action);
            }
        }
    }

    private redo(): void {
        const parent: ImageEditor = this.parent;
        this.cancelCropSelection();
        parent.notify('draw', { prop: 'resetFrameZoom', onPropertyChange: false, value: {isOk: false }});
        if (!parent.disabled && parent.isImageLoaded) {
            if (this.undoRedoStep < this.appliedUndoRedoColl.length) {
                this.refreshToolbarActions();
                this.undoRedoStep++;
                parent.notify('toolbar', {prop: 'enable-disable-btns'});
                parent.isUndoRedo = true;
                const obj: Transition = this.undoRedoColl[this.undoRedoStep - 1];
                if (this.undoRedoColl.length === this.undoRedoStep) { parent.currObjType.isUndoAction = false; }
                else { parent.currObjType.isUndoAction = true; }
                if (obj.operation !== 'textAreaCustomization' &&
                    (parent.textArea.style.display === 'block' || parent.textArea.style.display === 'inline-block')) {
                    parent.textArea.style.display = 'none';
                }
                parent.notify('draw', { prop: 'setCancelAction', onPropertyChange: false, value: {bool: true }});
                parent.cropObj = extend({}, obj.currentCropObj, {}, true) as CurrentObject;
                parent.afterCropActions = obj.currentObj.afterCropActions;
                this.lowerContext.filter = obj.currentObj.filter;
                if (parent.element.querySelector('.e-contextual-toolbar-wrapper')) {
                    parent.element.querySelector('.e-contextual-toolbar-wrapper').classList.add('e-hide');
                }
                parent.notify('filter', { prop: 'setAdjustmentLevel', onPropertyChange: false, value: { adjustmentLevel: obj.currentObj.adjustmentLevel }});
                parent.notify('filter', { prop: 'setTempAdjVal' });
                parent.currentFilter = obj.currentObj.currentFilter;
                parent.notify('filter', { prop: 'setTempFilVal' });
                parent.canvasFilter = this.lowerContext.filter;
                parent.initialAdjustmentValue = this.lowerContext.filter;
                parent.notify('filter', { prop: 'setBevelFilter', onPropertyChange: false, value: { bevelFilter: this.lowerContext.filter }});
                let activeObj: SelectionPoint;
                const editCompleteArgs: object = {action: this.getUndoRedoAction(obj.operation) };
                switch (obj.operation) {
                case 'shapeTransform':
                case 'brightness':
                case 'contrast':
                case 'hue':
                case 'saturation':
                case 'opacity':
                case 'blur':
                case 'exposure':
                case 'default':
                case 'chrome':
                case 'cold':
                case 'warm':
                case 'grayscale':
                case 'blackandwhite':
                case 'sepia':
                case 'invert':
                case 'sharpen':
                case 'imageRotate':
                case 'shapeInsert':
                    this.shapeTransform(obj.currentObjColl, obj.currentPointColl);
                    break;
                case 'freehanddraw':
                case 'freehand-draw':
                    this.updateFreehandDraw(obj.currentPointColl, obj.currentSelPointColl);
                    parent.notify('freehand-draw', {prop: 'setCurrentFreehandDrawIndex',
                        value: {value: parent.pointColl.length}});
                    break;
                case 'freehanddrawCustomized':
                    this.updateFreehandDrawCustomized(obj.currentObjColl, obj.currentPointColl);
                    break;
                case 'deleteFreehandDrawing':
                case 'deleteObj':
                    this.updateDelete(obj.operation, obj.currentObjColl, obj.currentPointColl, obj.currentSelPointColl);
                    break;
                case 'textAreaCustomization':
                    this.shapeTransform(obj.currentObjColl, obj.currentPointColl);
                    this.updateTextAreaCustomization(activeObj, obj.currentObjColl);
                    break;
                case 'text':
                    this.updateText(obj.currentObjColl, false);
                    break;
                case 'frame':
                    extend(parent.frameObj, obj.currentObj.frameObj);
                    parent.notify('draw', {prop: 'render-image', value: {isMouseWheel: true, isPreventClearRect: null, isFrame: true } });
                    break;
                case 'imageHFlip':
                    this.imageFlip('horizontal', obj.currentObjColl);
                    break;
                case 'imageVFlip':
                    this.imageFlip('vertical', obj.currentObjColl);
                    break;
                case 'bgColor':
                    parent.notify('draw', { prop: 'imageBackgroundColor', onPropertyChange: false, value: {color: obj.currentObj.bgColor }});
                    parent.notify('draw', { prop: 'render-image', value: { isMouseWheel: false } });
                    break;
                case 'updateImage':
                    parent.isImageUpdated = true;
                    parent.baseImg.src = obj.currentObj.imageSource;
                    setTimeout(() => {
                        if (parent.cropObj.straighten !== 0) {
                            parent.notify('toolbar', { prop: 'performCropTransformClick', value: { shape: 'crop-' + 'custom' } });
                            parent.noPushUndo = true;
                            parent.crop();
                            parent.noPushUndo = false;
                        } else {
                            parent.notify('draw', { prop: 'render-image', value: { isMouseWheel: false } });
                        }
                        parent.isImageUpdated = false;
                    });
                    break;
                default:
                    parent.objColl = []; parent.pointColl = []; parent.freehandCounter = 0;
                    parent.notify('freehand-draw', { prop: 'setSelPointColl', onPropertyChange: false,
                        value: {obj: {selPointColl: [] }}});
                    parent.notify('draw', { prop: 'setCurrentObj', onPropertyChange: false, value: {obj: obj.currentObj, isUndoRedo: true }});
                    parent.img.destLeft = obj.currentObj.destPoints.startX;
                    parent.img.destTop = obj.currentObj.destPoints.startY;
                    activeObj = extend({}, parent.activeObj, {}, true) as SelectionPoint;
                    parent.objColl = extend([], obj.currentObjColl, [], true) as SelectionPoint[];
                    parent.pointColl = extend([], obj.currentPointColl, [], true) as Point[];
                    parent.freehandCounter = parent.pointColl.length;
                    parent.notify('freehand-draw', { prop: 'setSelPointColl', onPropertyChange: false,
                        value: {obj: {selPointColl: extend([], obj.currentSelPointColl, [], true) as Point[] } }});
                    parent.transform.straighten = 0;
                    this.lowerContext.filter = 'none';
                    parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
                        value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: null }});
                    this.lowerContext.filter = obj.currentObj.filter;
                    parent.prevStraightenedDegree = parent.transform.straighten;
                    parent.activeObj = activeObj;
                    this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
                    if (parent.activeObj.activePoint.width !== 0 && parent.activeObj.activePoint.height !== 0) {
                        parent.notify('draw', { prop: 'drawObject', onPropertyChange: false, value: {canvas: 'duplicate'}});
                    }
                    parent.notify('filter', { prop: 'set-adjustment', value: {operation: obj.operation}});
                    parent.notify('filter', { prop: 'update-filter', value: {operation: obj.operation }});
                    break;
                }
                if (obj.operation === 'crop' && obj.isCircleCrop) {
                    parent.isCircleCrop = true;
                    parent.currSelectionPoint = extend({}, this.tempCurrSelPoint, {}, true) as SelectionPoint;
                    this.tempCurrSelPoint = null;
                }
                if (obj.operation === 'crop' && !obj.isCircleCrop) {
                    parent.isCircleCrop = false;
                }
                if (obj.operation === 'crop' && obj.currentObj.currSelectionPoint) {
                    parent.currSelectionPoint = extend({}, obj.currentObj.currSelectionPoint, {}, true) as SelectionPoint;
                    parent.notify('draw', { prop: 'setStraightenActObj', value: {activeObj: parent.currSelectionPoint }});
                }
                if (parent.currSelectionPoint && isNullOrUndefined(parent.currSelectionPoint.shape)) {
                    parent.currSelectionPoint = null;
                }
                if (obj.operation === 'resize' && parent.cropObj && parent.cropObj.activeObj) {
                    parent.currSelectionPoint = extend({}, parent.cropObj.activeObj, {}, true) as SelectionPoint;
                }
                this.endUndoRedo(obj.operation, false);
                const action: EditCompleteEventArgs  = { action: 'redo', actionEventArgs: editCompleteArgs };
                parent.triggerEditCompleteEvent(action);
            }
        }
    }

    private imageFlip(type: string, objColl: SelectionPoint[]): void {
        const parent: ImageEditor = this.parent;
        this.shapeTransform(objColl, null);
        parent.activeObj = extend({}, parent.objColl[parent.objColl.length - 1], {}, true) as SelectionPoint;
        const { shape, isHorImageFlip, isVerImageFlip } = parent.activeObj;
        parent.objColl.pop();
        if (shape && shape === 'image') {
            if (type === 'horizontal') {
                if (isNullOrUndefined(isHorImageFlip) && isVerImageFlip) {
                    parent.activeObj.isHorImageFlip = true; parent.activeObj.isVerImageFlip = null;
                    parent.horizontalFlip(this.upperContext, true);
                } else {
                    if (isNullOrUndefined(isHorImageFlip) || !isHorImageFlip) {
                        parent.activeObj.isHorImageFlip = true;
                    } else {
                        parent.activeObj.isHorImageFlip = null;
                    }
                    parent.horizontalFlip(this.upperContext, true);
                }
            } else if (type === 'vertical') {
                if (isNullOrUndefined(isVerImageFlip) && isHorImageFlip) {
                    parent.activeObj.isVerImageFlip = true; parent.activeObj.isHorImageFlip = null;
                    parent.verticalFlip(this.upperContext, true);
                } else {
                    if (isNullOrUndefined(isVerImageFlip) || !isVerImageFlip) {
                        parent.activeObj.isVerImageFlip = true;
                    } else {
                        parent.activeObj.isVerImageFlip = null;
                    }
                    parent.verticalFlip(this.upperContext, true);
                }
            }
            parent.notify('shape', { prop: 'applyActObj', onPropertyChange: false, value: {isMouseDown: true }});
        } else {
            parent.notify('draw', { prop: 'render-image', value: { isMouseWheel: true } });
        }
    }

    private shapeTransform(objColl: SelectionPoint[], pointColl: Point[]): void {
        const parent: ImageEditor = this.parent;
        parent.objColl = extend([], objColl, [], true) as SelectionPoint[];
        if (pointColl) {
            parent.pointColl = extend([], pointColl, [], true) as Point[];
            parent.freehandCounter = parent.pointColl.length;
        }
        parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
            value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: null }});
        this.lowerContext.clearRect(0, 0, parent.lowerCanvas.width, parent.lowerCanvas.height);
        this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
        parent.isUndoRedo = true; parent.notify('draw', { prop: 'redrawImgWithObj', onPropertyChange: false});
        parent.notify('shape', { prop: 'refreshActiveObj', onPropertyChange: false});
    }

    private updateFreehandDraw(pointColl: Point[], selPointColl: Point[]): void {
        const parent: ImageEditor = this.parent;
        parent.pointColl = pointColl;
        parent.notify('freehand-draw', { prop: 'setSelPointColl', onPropertyChange: false,
            value: {obj: {selPointColl: selPointColl }}});
        parent.freehandCounter = parent.pointColl.length;
        parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
            value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: null }});
        this.lowerContext.clearRect(0, 0, parent.lowerCanvas.width, parent.lowerCanvas.height);
        this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
        parent.isUndoRedo = true; parent.notify('draw', { prop: 'redrawImgWithObj', onPropertyChange: false});
    }

    private updateFreehandDrawCustomized(objColl: SelectionPoint[], pointColl: Point[]): void {
        const parent: ImageEditor = this.parent;
        parent.objColl = extend([], objColl, [], true) as SelectionPoint[];
        parent.pointColl = pointColl;
        parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
            value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: null }});
        this.lowerContext.clearRect(0, 0, parent.lowerCanvas.width, parent.lowerCanvas.height);
        this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
        parent.isUndoRedo = true; parent.notify('draw', { prop: 'redrawImgWithObj', onPropertyChange: false});
    }

    private updateDelete(operation: string, objColl: SelectionPoint[], pointColl: Point[], selPointColl: Point[]): void {
        const parent: ImageEditor = this.parent;
        if (operation === 'deleteFreehandDrawing') {
            parent.pointColl = pointColl;
            parent.freehandCounter = parent.pointColl.length;
            parent.notify('freehand-draw', { prop: 'setSelPointColl', onPropertyChange: false,
                value: {obj: {selPointColl: selPointColl } }});
            parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
                value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: null }});
        } else if (operation === 'deleteObj') {
            parent.objColl = objColl as SelectionPoint[];
            parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
                value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: null }});
        }
        this.lowerContext.clearRect(0, 0, parent.lowerCanvas.width, parent.lowerCanvas.height);
        this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
        parent.isUndoRedo = true; parent.notify('draw', { prop: 'redrawImgWithObj', onPropertyChange: false});
    }

    private updateTextAreaCustomization(activeObj: SelectionPoint, objColl: SelectionPoint[]): void {
        const parent: ImageEditor = this.parent;
        parent.objColl = extend([], objColl, [], true) as SelectionPoint[];
        parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
            value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: null }});
        this.lowerContext.clearRect(0, 0, parent.lowerCanvas.width, parent.lowerCanvas.height);
        parent.isUndoRedo = true; parent.notify('draw', { prop: 'redrawImgWithObj', onPropertyChange: false});
        for (let i: number = 0, len: number = (objColl as SelectionPoint[]).length; i < len; i++) {
            if (this.tempActObj) {
                if (this.tempActObj.currIndex === (objColl as SelectionPoint[])[i as number].currIndex) {
                    activeObj = extend({}, objColl[i as number], {}, true) as SelectionPoint;
                    parent.objColl.splice(i, 1);
                    break;
                }
            } else {
                activeObj = extend({}, objColl[objColl.length - 1], {}, true) as SelectionPoint;
                parent.objColl.splice(i, 1);
                break;
            }
        }
        if (activeObj) { this.updateTextBox(activeObj); }
        if (parent.textArea.style.display === 'block' || parent.textArea.style.display === 'inline-block') {
            parent.notify('shape', { prop: 'redrawActObj', onPropertyChange: false,
                value: {x: null, y: null, isMouseDown: null}});
        }
    }

    private updateText(objColl: SelectionPoint[], allowActiveObj: boolean): void {
        const parent: ImageEditor = this.parent;
        if (this.tempActObj) {
            parent.activeObj = extend({}, this.tempActObj, {}, true) as SelectionPoint;
        }
        if (objColl.length === 0 && parent.objColl.length === 1) {
            this.tempActObj = extend({}, parent.objColl[0], {}, true) as SelectionPoint;
        } else {
            for (let i: number = 0, iLen: number = parent.objColl.length; i < iLen; i++) {
                if (parent.objColl[i as number] && isNullOrUndefined(objColl[i as number])) {
                    this.tempActObj = extend({}, parent.objColl[i as number], {}, true) as SelectionPoint;
                    break;
                }
                if (objColl[i as number].currIndex !== parent.objColl[i as number].currIndex) {
                    this.tempActObj = extend({}, parent.objColl[i as number], {}, true) as SelectionPoint;
                    break;
                }
            }
        }
        if (allowActiveObj) {parent.activeObj = extend({}, this.tempActObj, {}, true) as SelectionPoint; }
        parent.objColl = extend([], objColl, [], true) as SelectionPoint[];
        parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
            value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: true }});
        this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
        this.lowerContext.clearRect(0, 0, parent.lowerCanvas.width, parent.lowerCanvas.height);
        parent.isUndoRedo = true; parent.notify('draw', { prop: 'redrawImgWithObj', onPropertyChange: false});
        parent.notify('shape', { prop: 'refreshActiveObj', onPropertyChange: false});
    }

    private updateTextBox(obj: SelectionPoint): void {
        const parent: ImageEditor = this.parent;
        this.upperContext.clearRect(0, 0, parent.lowerCanvas.width, parent.lowerCanvas.height);
        this.lowerContext.clearRect(0, 0, parent.lowerCanvas.width, parent.lowerCanvas.height);
        parent.notify('draw', { prop: 'redrawImgWithObj', onPropertyChange: false});
        parent.notify('toolbar', { prop: 'destroy-qa-toolbar', onPropertyChange: false});
        const textArea: HTMLInputElement = parent.textArea;
        textArea.style.display = 'block';
        textArea.style.fontFamily = obj.textSettings.fontFamily;
        textArea.style.fontSize = obj.textSettings.fontSize + 'px';
        textArea.style.color = obj.strokeSettings.strokeColor;
        textArea.style.fontWeight = obj.textSettings.bold ? 'bold' : 'normal';
        textArea.style.fontStyle = obj.textSettings.italic ? 'italic' : 'normal';
        textArea.style.textDecoration = (obj.textSettings.underline && obj.textSettings.strikethrough) ? 'underline line-through' :
            (obj.textSettings.underline) ? 'underline' :
                (obj.textSettings.strikethrough) ? 'line-through' :
                    'none';
        textArea.style.border = '2px solid ' + parent.themeColl[parent.theme]['primaryColor'];
        textArea.value = obj.keyHistory;
        parent.activeObj = extend({}, obj, {}, true) as SelectionPoint;
        parent.notify('shape', { prop: 'updateFontStyles', onPropertyChange: false,
            value: { isTextBox: null}});
        parent.textArea.style.width = parent.activeObj.activePoint.width + 'px';
    }

    private undoDefault(obj: Transition, isUndoRedo?: boolean): void {
        this.lowerContext.filter = obj.previousObj.filter;
        const parent: ImageEditor = this.parent;
        parent.objColl = []; parent.pointColl = []; parent.freehandCounter = 0;
        parent.notify('freehand-draw', { prop: 'setSelPointColl', onPropertyChange: false,
            value: {obj: {selPointColl: [] } }});
        const isCircleCrop: boolean = !isUndoRedo ? obj.isCircleCrop : false;
        parent.notify('draw', { prop: 'setCurrentObj', onPropertyChange: false, value: {obj: obj.previousObj, isUndoRedo: isUndoRedo, isCircleCrop: isCircleCrop }});
        parent.prevStraightenedDegree = parent.transform.straighten;
        this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
        parent.notify('shape', { prop: 'refreshActiveObj', onPropertyChange: false});
        parent.img.destLeft = obj.previousObj.destPoints.startX;
        parent.img.destTop = obj.previousObj.destPoints.startY;
        const activeObj: SelectionPoint = extend({}, parent.activeObj, {}, true) as SelectionPoint;
        parent.objColl = extend([], obj.previousObjColl, [], true) as SelectionPoint[];
        parent.pointColl = extend([], obj.previousPointColl, [], true) as Point[];
        parent.freehandCounter = parent.pointColl.length;
        parent.notify('freehand-draw', { prop: 'setSelPointColl', onPropertyChange: false,
            value: {obj: {selPointColl: extend([], obj.previousSelPointColl, [], true) as Point[] } }});
        parent.transform.straighten = 0;
        this.lowerContext.filter = 'none';
        parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
            value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: null }});
        this.lowerContext.filter = obj.previousObj.filter;
        parent.activeObj = activeObj;
        this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
        if (parent.activeObj.activePoint.width !== 0 && parent.activeObj.activePoint.height !== 0) {
            parent.notify('draw', { prop: 'drawObject', onPropertyChange: false, value: {canvas: 'duplicate'}});
        }
    }

    private endUndoRedo(operation: string, isUndo: boolean): void {
        const parent: ImageEditor = this.parent;
        const frameObj: FrameValue = {type: 'none', color: '#fff', size: 20, inset: 20, offset: 20, radius: 0, amount: 1, border: 'solid', gradientColor: '' };
        if (((parent.currSelectionPoint && parent.currSelectionPoint.shape === 'crop-circle') || parent.isCircleCrop) &&
            JSON.stringify(parent.frameObj) !== JSON.stringify(frameObj)) {
            parent.notify('draw', {prop: 'render-image', value: {isMouseWheel: true } });
        }
        parent.notify('draw', { prop: 'clearOuterCanvas', onPropertyChange: false, value: {context: this.lowerContext}});
        if (parent.isCircleCrop && ((isUndo && operation !== 'crop') || !isUndo)) {
            parent.notify('crop', { prop: 'cropCircle', onPropertyChange: false,
                value: {context: this.lowerContext, isSave: null, isFlip: null}});
        }
        if (parent.transform.zoomFactor > 0) {
            parent.notify('selection', {prop: 'setDragCanvas', value: {bool: true }});
        }
        parent.notify('draw', { prop: 'setCancelAction', onPropertyChange: false, value: {bool: false }});
        if (parent.activeObj.shape && parent.activeObj.shape.split('-')[0] === 'crop') {
            parent.notify('toolbar', { prop: 'refresh-toolbar', onPropertyChange: false, value: {type: 'main',
                isApplyBtn: true, isCropping: true, isZooming: null, cType: null}});
        } else {
            parent.notify('toolbar', { prop: 'refresh-main-toolbar', onPropertyChange: false});
        }
        parent.notify('toolbar', {prop: 'enable-disable-btns'});
        if (document.getElementById(parent.element.id + '_quickAccessToolbarArea')) {
            document.getElementById(parent.element.id + '_quickAccessToolbarArea').style.display = 'none';
        }
        parent.notify('toolbar', {prop: 'enable-disable-btns'});
        if (parent.transform.degree !== 0) {
            parent.notify('transform', { prop: 'drawPannedImage', onPropertyChange: false,
                value: {xDiff: 0, yDiff: 0 }});
        }
        parent.notify('filter', { prop: 'setAdjustmentValue', onPropertyChange: false, value: {adjustmentValue: this.lowerContext.filter }});
        parent.currObjType.isCustomCrop = false;
    }

    private updateUrc(operation: string, previousObj: CurrentObject, previousObjColl: SelectionPoint[],
                      previousPointColl: Point[], previousSelPointColl: Point[],
                      previousCropObj: CurrentObject, previousText?: string,
                      currentText?: string, previousFilter?: string, isCircleCrop?: boolean): void {
        const parent: ImageEditor = this.parent;
        if (parent.isResize || this.isPreventing) {return; }
        const obj: Object = {isInitialLoaded: false };
        if (parent.currObjType.isUndoAction) { this.refreshUrc(true); }
        parent.notify('draw', { prop: 'isInitialLoaded', onPropertyChange: false, value: {object: obj }});
        if (!obj['isInitialLoaded'] && parent.allowUndoRedo) {
            const object: Object = {currObj: {} as CurrentObject };
            parent.notify('filter', { prop: 'getCurrentObj', onPropertyChange: false, value: {object: object }});
            const currentObj: CurrentObject = object['currObj'];
            currentObj.objColl = extend([], parent.objColl, [], true) as SelectionPoint[];
            currentObj.pointColl = extend([], parent.pointColl, [], true) as Point[];
            currentObj.afterCropActions = extend([], parent.afterCropActions, [], true) as string[];
            const selPointCollObj: Object = {selPointColl: null };
            parent.notify('freehand-draw', { prop: 'getSelPointColl', onPropertyChange: false,
                value: {obj: selPointCollObj }});
            currentObj.selPointColl = extend([], selPointCollObj['selPointColl'], [], true) as Point[];
            if (operation === 'crop') {
                currentObj.currSelectionPoint = extend({}, parent.currSelectionPoint, {}, true) as SelectionPoint;
            } else if (operation === 'frame') {
                previousObj.destPoints = {startX: parent.frameDestPoints.destLeft, startY: parent.frameDestPoints.destTop,
                    width: parent.frameDestPoints.destWidth, height: parent.frameDestPoints.destHeight };
                currentObj.destPoints = {startX: parent.frameDestPoints.destLeft, startY: parent.frameDestPoints.destTop,
                    width: parent.frameDestPoints.destWidth, height: parent.frameDestPoints.destHeight };
                if (!isNullOrUndefined(parent.tempFrameZoomLevel)) {
                    previousObj.defaultZoom = currentObj.defaultZoom = parent.tempFrameZoomLevel;
                }
            } else if ((operation === 'imageHFlip' || operation === 'imageVFlip') && this.appliedUndoRedoColl.length > 0) {
                const index: string = previousObjColl[previousObjColl.length - 1].currIndex;
                previousObjColl = this.appliedUndoRedoColl[this.appliedUndoRedoColl.length - 1].currentObjColl;
                if (index) {
                    for (let i: number = 0, len: number = previousObjColl.length; i < len; i++) {
                        if (previousObjColl[i as number].currIndex === index) {
                            const actObj: SelectionPoint = extend({}, previousObjColl[i as number], {}, true) as SelectionPoint;
                            previousObjColl.splice(i, 1);
                            previousObjColl.push(actObj);
                            break;
                        }
                    }
                }
            }
            this.undoRedoColl.push({operation: operation, previousObj: previousObj, currentObj: currentObj,
                previousObjColl: previousObjColl, currentObjColl: currentObj.objColl,
                previousPointColl: previousPointColl, currentPointColl: currentObj.pointColl,
                previousSelPointColl: previousSelPointColl, currentSelPointColl: currentObj.selPointColl,
                previousCropObj: previousCropObj, currentCropObj: extend({}, parent.cropObj, {}, true) as CurrentObject,
                previousText: previousText, currentText: currentText, filter: previousFilter, isCircleCrop: isCircleCrop });
            parent.notify('toolbar', { prop: 'enable-disable-btns', onPropertyChange: false});
        }
    }

    private updateUrObj(objColl: SelectionPoint[], operation?: string): void {
        const parent: ImageEditor = this.parent;
        if (parent.allowUndoRedo) {
            if (parent.currObjType.isUndoAction && !parent.isShapeDrawing) { this.refreshUrc(true); }
            if (isNullOrUndefined(parent.activeObj.imageRatio)) {
                parent.notify('shape', { prop: 'updImgRatioForActObj', onPropertyChange: false});
            }
            parent.objColl.push(parent.activeObj);
            const cropObj: CurrentObject = extend({}, parent.cropObj, {}, true) as CurrentObject;
            const object: Object = {currObj: {} as CurrentObject };
            parent.notify('filter', { prop: 'getCurrentObj', onPropertyChange: false, value: {object: object }});
            const obj: CurrentObject = object['currObj'];
            obj.objColl = extend([], parent.objColl, [], true) as SelectionPoint[];
            obj.pointColl = extend([], parent.pointColl, [], true) as Point[];
            obj.afterCropActions = extend([], parent.afterCropActions, [], true) as string[];
            const selPointCollObj: Object = {selPointColl: null };
            parent.notify('freehand-draw', { prop: 'getSelPointColl', onPropertyChange: false,
                value: {obj: selPointCollObj }});
            obj.selPointColl = extend([], selPointCollObj['selPointColl'], [], true) as Point[];
            const oper: string = operation ? operation : 'shapeTransform';
            this.undoRedoColl.push({operation: oper, previousObj: obj, currentObj: obj,
                previousObjColl: objColl, currentObjColl: obj.objColl,
                previousPointColl: obj.pointColl, currentPointColl: obj.pointColl,
                previousSelPointColl: obj.selPointColl, currentSelPointColl: obj.selPointColl,
                previousCropObj: cropObj, currentCropObj: cropObj});
            parent.notify('selection', { prop: 'redrawShape', onPropertyChange: false,
                value: {obj: parent.objColl[parent.objColl.length - 1]}});
        }
    }

    private updateUndoRedo(operation?: string): void {
        const parent: ImageEditor = this.parent;
        const prevCropObj: CurrentObject = extend({}, parent.cropObj, {}, true) as CurrentObject;
        const object: Object = {currObj: {} as CurrentObject };
        parent.notify('filter', { prop: 'getCurrentObj', onPropertyChange: false, value: {object: object }});
        const prevObj: CurrentObject = object['currObj'];
        prevObj.objColl = extend([], parent.objColl, [], true) as SelectionPoint[];
        prevObj.pointColl = extend([], parent.pointColl, [], true) as Point[];
        prevObj.afterCropActions = extend([], parent.afterCropActions, [], true) as string[];
        const selPointCollObj: Object = {selPointColl: null };
        parent.notify('freehand-draw', { prop: 'getSelPointColl', onPropertyChange: false,
            value: {obj: selPointCollObj }});
        prevObj.selPointColl = extend([], selPointCollObj['selPointColl'], [], true) as Point[];
        if (isNullOrUndefined(parent.activeObj.imageRatio)) {
            parent.notify('shape', { prop: 'updImgRatioForActObj', onPropertyChange: false});
        }
        parent.objColl.push(parent.activeObj);
        const oper: string = operation ? operation : 'shapeTransform';
        this.updateUrc(oper, prevObj, prevObj.objColl, prevObj.pointColl, prevObj.selPointColl, prevCropObj);
        parent.objColl.pop();
        parent.notify('shape', { prop: 'applyActObj', onPropertyChange: false, value: {isMouseDown: null}});
        parent.notify('shape', { prop: 'refreshActiveObj', onPropertyChange: false});
        parent.notify('toolbar', { prop: 'refresh-toolbar', onPropertyChange: false, value: { type: 'shapes',
            isApplyBtn: null, isCropping: null, isZooming: null, cType: null } });
        parent.notify('toolbar', { prop: 'refresh-toolbar', onPropertyChange: false, value: { type: 'main',
            isApplyBtn: null, isCropping: null, isZooming: null, cType: null } });
    }

    private getZeroZoomObjPointValue(obj: SelectionPoint[], point: Point[]): Object {
        const parent: ImageEditor = this.parent;
        this.updateObjColl();
        const object: Object = {currObj: {} as CurrentObject };
        parent.notify('filter', { prop: 'getCurrentObj', onPropertyChange: false, value: {object: object }});
        const currentObj: CurrentObject = object['currObj'];
        currentObj.objColl = extend([], parent.objColl, [], true) as SelectionPoint[];
        currentObj.pointColl = extend([], parent.pointColl, [], true) as Point[];
        currentObj.afterCropActions = extend([], parent.afterCropActions, [], true) as string[];
        const selPointCollObj: Object = {selPointColl: null };
        parent.notify('freehand-draw', { prop: 'getSelPointColl', onPropertyChange: false,
            value: {obj: selPointCollObj }});
        currentObj.selPointColl = extend([], selPointCollObj['selPointColl'], [], true) as Point[];
        const cropDimensionObj: Object = {cropDimension: null };
        parent.notify('transform', { prop: 'getCropDimension', onPropertyChange: false, value: {obj: cropDimensionObj }});
        let getZeroZoomObjColl: SelectionPoint[] = extend([], parent.objColl, [], true) as SelectionPoint[];
        let getZeroZoomPointColl: Point[] = extend([], parent.pointColl, [], true) as Point[];
        const arrowObj: Object = {arrowDimension: null };
        this.parent.notify('draw', { prop: 'getArrowDimension', onPropertyChange: false, value: {obj: arrowObj }});
        const tempArrowObj: Object = extend({}, arrowObj['arrowDimension'], {}, true) as Object;
        if (parent.transform.zoomFactor > 0 && (obj.length > 0 || point.length > 0)) {
            if (obj.length > 0) {
                for (let i: number = 0; i < obj.length; i++) {
                    if (obj[i as number].currIndex) {
                        continue;
                    } else {
                        obj[i as number].currIndex = 'shape_' + (i + 1);
                    }
                }
            }
            parent.objColl = obj; parent.pointColl = point;
            const isUndoRedo: boolean = parent.isUndoRedo;
            const isCropTab: boolean = parent.isCropTab;
            if (parent.transform.zoomFactor !== 0) {
                parent.isUndoRedo = true;
                parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
                    value: {ctx: this.lowerContext, shape: 'zoom', pen: 'zoom', isPreventApply: true }});
                parent.notify('freehand-draw', { prop: 'updateFHDColl', onPropertyChange: false});
                parent.isCropTab = true;
                const zoomSettings: ZoomSettings = extend({}, parent.zoomSettings, null, true) as ZoomSettings;
                if (parent.transform.zoomFactor > 0) {
                    parent.notify('transform', { prop: 'zoomAction', onPropertyChange: false,
                        value: {zoomFactor: -parent.transform.zoomFactor, zoomPoint: null, isResize: null }});
                } else {
                    parent.notify('transform', { prop: 'zoomAction', onPropertyChange: false,
                        value: {zoomFactor: Math.abs(parent.transform.zoomFactor), zoomPoint: null, isResize: null }});
                }
                parent.zoomSettings = zoomSettings; parent.isCropTab = isCropTab; parent.isUndoRedo = isUndoRedo;
                getZeroZoomObjColl = extend([], parent.objColl, [], true) as SelectionPoint[];
                getZeroZoomPointColl = extend([], parent.pointColl, [], true) as Point[];
                parent.objColl = []; parent.pointColl = []; parent.freehandCounter = 0;
                parent.notify('freehand-draw', { prop: 'setSelPointColl', onPropertyChange: false,
                    value: {obj: {selPointColl: [] } }});
                parent.notify('transform', { prop: 'setCropDimension', onPropertyChange: false,
                    value: {width: cropDimensionObj['cropDimension']['width'], height: cropDimensionObj['cropDimension']['height']}});
                const maxDimension: Dimension = {width: cropDimensionObj['cropDimension']['width'], height: cropDimensionObj['cropDimension']['height'] };
                maxDimension.width += (maxDimension.width * currentObj.defaultZoom);
                maxDimension.height += (maxDimension.height * currentObj.defaultZoom);
                parent.notify('draw', {prop: 'setZoomCropWidth', value: {width: maxDimension.width, height: maxDimension.height }});
                parent.notify('draw', { prop: 'setCurrentObj', onPropertyChange: false, value: {obj: currentObj}});
                parent.img.destLeft = currentObj.destPoints.startX; parent.img.destTop = currentObj.destPoints.startY;
                parent.panPoint.totalPannedPoint = currentObj.totalPannedPoint;
                parent.panPoint.totalPannedClientPoint = currentObj.totalPannedClientPoint;
                parent.panPoint.totalPannedInternalPoint = currentObj.totalPannedInternalPoint;
                parent.objColl = extend([], currentObj.objColl, [], true) as SelectionPoint[];
                parent.pointColl = extend([], currentObj.pointColl, [], true) as Point[];
                parent.freehandCounter = parent.pointColl.length;
                parent.notify('draw', { prop: 'setArrowDimension', onPropertyChange: false, value: {arrowDimension: tempArrowObj }});
                parent.notify('freehand-draw', { prop: 'setSelPointColl', onPropertyChange: false,
                    value: {obj: {selPointColl: extend([], currentObj.selPointColl, [], true) as Point[] } }});
                this.lowerContext.filter = 'none';
                parent.transform.straighten = 0;
                this.applyImgTranform();
                parent.notify('shape', { prop: 'drawAnnotations', onPropertyChange: false,
                    value: {ctx: this.lowerContext, shape: 'iterate', pen: 'iterate', isPreventApply: null }});
                parent.notify('freehand-draw', { prop: 'updateFHDCurPts', onPropertyChange: false});
                this.lowerContext.filter = currentObj.filter;
                if (parent.transform.degree !== 0) {
                    parent.notify('transform', { prop: 'drawPannedImage', onPropertyChange: false,
                        value: {xDiff: 0, yDiff: 0 }});
                }
                parent.notify('draw', { prop: 'clearOuterCanvas', onPropertyChange: false, value: {context: this.lowerContext}});
                if (parent.isCircleCrop || (parent.currSelectionPoint && parent.currSelectionPoint.shape === 'crop-circle')) {
                    parent.notify('crop', { prop: 'cropCircle', onPropertyChange: false,
                        value: {context: this.lowerContext, isSave: null, isFlip: null}});
                }
            }
        }
        return {obj: getZeroZoomObjColl, point: getZeroZoomPointColl };
    }

    private updateObjColl(): void {
        const parent: ImageEditor = this.parent;
        for (let i: number = 0; i < parent.objColl.length; i++) {
            let obj: SelectionPoint = parent.objColl[i as number];
            let isUpdated: boolean = false;
            if (obj.shape === 'line' || obj.shape === 'arrow') {
                if (obj.activePoint.width < 0) {
                    obj.activePoint.width = Math.abs(obj.activePoint.width);
                    isUpdated = true;
                }
                if (obj.activePoint.height < 0) {
                    obj.activePoint.height = Math.abs(obj.activePoint.height);
                    isUpdated = true;
                }
                if (isUpdated) {
                    const activeObj: SelectionPoint = extend({}, parent.activeObj, {}, true) as SelectionPoint;
                    parent.activeObj = obj;
                    parent.notify('shape', { prop: 'updImgRatioForActObj', onPropertyChange: false });
                    obj = parent.activeObj;
                    parent.activeObj = activeObj;
                }
            }
        }
    }

    private applyImgTranform(): void {
        const parent: ImageEditor = this.parent;
        const obj: SelectionPoint = extend({}, parent.activeObj, {}, true) as SelectionPoint;
        for (let i: number = 0, len: number = parent.objColl.length; i < len; i++) {
            if (parent.objColl[i as number].shape === 'image') {
                parent.activeObj = extend({}, parent.objColl[i as number], {}, true) as SelectionPoint;
                const ctx: CanvasRenderingContext2D = parent.objColl[i as number].imageCanvas.getContext('2d');
                parent.notify('selection', { prop: 'applyTransformToImg', onPropertyChange: false, value: {ctx: ctx }});
                this.upperContext.clearRect(0, 0, parent.upperCanvas.width, parent.upperCanvas.height);
                parent.notify('selection', { prop: 'setImageClarity', onPropertyChange: false, value: {bool: true }});
            }
        }
        parent.activeObj = obj;
    }

    private updateUndoRedoStack(isPenDraw?: boolean): void {
        const parent: ImageEditor = this.parent;
        if ((parent.activeObj.currIndex && parent.activeObj.activePoint.width !== 0 ||
            parent.activeObj.activePoint.height !== 0 || (parent.activeObj.pointColl &&
            parent.activeObj.pointColl.length > 0)) || isPenDraw) {
            const isTextArea: boolean = parent.textArea.style.display === 'none' ? false : true;
            const temp: boolean = parent.noPushUndo;
            parent.noPushUndo = false; parent.isUndoRedoStack = true;
            this.preventEditComplete = true;
            if (isPenDraw) {
                const tempTogglePen: boolean = parent.togglePen;
                const obj: Object = {freehandDrawSelectedId: null };
                parent.notify('freehand-draw', { prop: 'getFreehandDrawSelectedId', onPropertyChange: false, value: {obj: obj }});
                parent.okBtn();
                parent.noPushUndo = temp;
                if (obj['freehandDrawSelectedId']){
                    parent.noRedact = true;
                    parent.selectShape(obj['freehandDrawSelectedId']);
                } else {
                    parent.freeHandDraw(true);
                }
                parent.togglePen = tempTogglePen;
            } else if (parent.activeObj.currIndex) {
                const shapeId: string = parent.activeObj.currIndex;
                parent.okBtn();
                parent.noPushUndo = temp;
                parent.noRedact = true;
                parent.selectShape(shapeId);
                if (parent.drawingShape) {
                    parent.notify('selection', { prop: 'setCurrentDrawingShape', onPropertyChange: false, value: {value: parent.drawingShape.toLowerCase() }});
                }
                if (isTextArea) {
                    parent.enableTextEditing();
                }
            }
            if (this.preventEditComplete) {
                parent.isUndoRedoStack = this.preventEditComplete = false;
                if (!this.preventApplyEditComplete) {
                    this.triggerActionCompletedEvent('shape-customize');
                }
                this.triggerActionCompletedEvent('shape-select');
            }
            parent.isUndoRedoStack = this.preventEditComplete = false;
        }
    }
}
