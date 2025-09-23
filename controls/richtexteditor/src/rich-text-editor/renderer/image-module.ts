import { addClass, Browser, closest, createElement, detach, EventHandler, formatUnit, isNullOrUndefined as isNOU, KeyboardEventArgs, L10n, MouseEventArgs, removeClass, select } from '@syncfusion/ej2-base';
import { Button, ChangeEventArgs, CheckBox } from '@syncfusion/ej2-buttons';
import { BeforeUploadEventArgs, FileInfo, InputEventArgs, MetaData, ProgressEventArgs, RemovingEventArgs, SelectedEventArgs, SuccessEventArgs, TextBox, Uploader, UploadingEventArgs } from '@syncfusion/ej2-inputs';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { BeforeCloseEventArgs, Dialog, DialogModel, Popup } from '@syncfusion/ej2-popups';
import { imageResizeFactor } from '../../common/config';
import { IImageResizeFactor, ImageDimension, ImageDropEventArgs } from '../../common/interface';
import { isIDevice, convertToBlob } from '../../common/util';
import { ImageInputSource } from '../../common/enum';
import { NodeSelection } from '../../selection/selection';
import * as classes from '../base/classes';
import * as events from '../base/constant';
import { CLS_IMG_FOCUS, CLS_RESIZE, CLS_RTE_DRAG_IMAGE } from '../../common/constant';
import { RenderType } from '../base/enum';
import { AfterImageDeleteEventArgs, ICssClassArgs, IImageNotifyArgs, IRichTextEditor, ImageFailedEventArgs, SlashMenuItemSelectArgs, IQuickToolbar, IRenderer } from '../base/interface';
import { ActionBeginEventArgs, ActionCompleteEventArgs, IDropDownItemModel, IImageCommandsArgs, ImageSuccessEventArgs, IShowPopupArgs, IToolbarItemModel, NotifyArgs, OffsetPosition, ResizeArgs } from '../../common/interface';
import { dispatchEvent, hasClass, parseHtml } from '../base/util';
import { RendererFactory } from '../services/renderer-factory';
import { ServiceLocator } from '../services/service-locator';
import { DialogRenderer } from './dialog-renderer';
import { ImageCommand } from '../../editor-manager/plugin/image';
import { PopupUploader } from './popup-uploader-renderer';
import { RichTextEditorModel } from '../base';

/**
 * `Image` module is used to handle image actions.
 */
export class Image {
    public element: HTMLElement;
    private rteID: string;
    private parent: IRichTextEditor;
    public dialogObj: Dialog;
    private popupObj: Popup;
    public uploadObj: Uploader;
    private i10n: L10n;
    private inputUrl: HTMLElement;
    private captionEle: HTMLElement;
    private checkBoxObj: CheckBox;
    private widthNum: TextBox;
    private heightNum: TextBox;
    private browseButton: Button;
    private uploadUrl: IImageCommandsArgs;
    private contentModule: IRenderer;
    private rendererFactory: RendererFactory;
    private quickToolObj: IQuickToolbar;
    private popupUploaderObj: PopupUploader;
    /**
     * @hidden
     */
    public imgResizeDiv: HTMLElement;
    private imgDupPos: { [key: string]: number | string };
    private resizeBtnStat: { [key: string]: boolean };
    private imgEle: HTMLImageElement;
    private prevSelectedImgEle: HTMLImageElement;
    private isImgUploaded: boolean = false;
    private isAllowedTypes: boolean = true;
    private pageX: number = null;
    private pageY: number = null;
    private dialogRenderObj: DialogRenderer;
    private deletedImg: Node[] = [];
    private changedWidthValue: string;
    private changedHeightValue: string;
    private inputWidthValue: string;
    private inputHeightValue: string;
    private removingImgName: string;
    private currentResizeHandler: string;
    private aspectRatio: number;
    private drop: EventListenerOrEventListenerObject;
    private drag: EventListenerOrEventListenerObject;
    private enter: EventListenerOrEventListenerObject;
    private start: EventListenerOrEventListenerObject;
    private docClick: EventListenerOrEventListenerObject
    private imageQTPopupTime: number;
    private imageDragPopupTime: number;
    private uploadCancelTime: number;
    private uploadFailureTime: number;
    private uploadSuccessTime: number;
    private showImageQTbarTime: number;
    private isDestroyed: boolean;
    private constructor(parent?: IRichTextEditor, serviceLocator?: ServiceLocator) {
        this.parent = parent;
        this.rteID = parent.element.id;
        this.i10n = serviceLocator.getService<L10n>('rteLocale');
        this.rendererFactory = serviceLocator.getService<RendererFactory>('rendererFactory');
        this.dialogRenderObj = serviceLocator.getService<DialogRenderer>('dialogRenderObject');
        this.popupUploaderObj = serviceLocator.getService<PopupUploader>('popupUploaderObject');
        this.addEventListener();
        this.drop = this.dragDrop.bind(this);
        this.drag = this.dragOver.bind(this);
        this.enter = this.dragEnter.bind(this);
        this.start = this.dragStart.bind(this);
        this.docClick = this.onDocumentClick.bind(this);
        this.isDestroyed = false;
    }

    protected addEventListener(): void {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.on(events.keyDown, this.onKeyDown, this);
        this.parent.on(events.keyUp, this.onKeyUp, this);
        this.parent.on(events.insertImage, this.insertImage, this);
        this.parent.on(events.showImageDialog, this.showDialog, this);
        this.parent.on(events.closeImageDialog, this.closeDialog, this);
        this.parent.on(events.windowResize, this.onWindowResize, this);
        this.parent.on(events.insertCompleted, this.showImageQuickToolbar, this);
        this.parent.on(events.clearDialogObj, this.clearDialogObj, this);
        this.parent.on(events.imageToolbarAction, this.onToolbarAction, this);
        this.parent.on(events.imageCaption, this.caption, this);
        this.parent.on(events.imageDelete, this.deleteImg, this);
        this.parent.on(events.imageLink, this.insertImgLink, this);
        this.parent.on(events.imageAlt, this.insertAltText, this);
        this.parent.on(events.editAreaClick, this.editAreaClickHandler, this);
        this.parent.on(events.iframeMouseDown, this.onIframeMouseDown, this);
        this.parent.on(events.imageSize, this.imageSize, this);
        this.parent.on(events.dropDownSelect, this.alignmentSelect, this);
        this.parent.on(events.initialEnd, this.afterRender, this);
        this.parent.on(events.dynamicModule, this.afterRender, this);
        this.parent.on(events.paste, this.imagePaste, this);
        this.parent.on(events.bindCssClass, this.setCssClass, this);
        this.parent.on(events.destroy, this.destroy, this);
        this.parent.on(events.bindOnEnd, this.bindOnEnd, this);
        this.parent.on(events.modelChanged, this.onPropertyChanged, this);
    }

    protected removeEventListener(): void {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off(events.keyDown, this.onKeyDown);
        this.parent.off(events.keyUp, this.onKeyUp);
        this.parent.off(events.windowResize, this.onWindowResize);
        this.parent.off(events.insertImage, this.insertImage);
        this.parent.off(events.showImageDialog, this.showDialog);
        this.parent.off(events.closeImageDialog, this.closeDialog);
        this.parent.off(events.insertCompleted, this.showImageQuickToolbar);
        this.parent.off(events.clearDialogObj, this.clearDialogObj);
        this.parent.off(events.imageCaption, this.caption);
        this.parent.off(events.imageToolbarAction, this.onToolbarAction);
        this.parent.off(events.imageDelete, this.deleteImg);
        this.parent.off(events.imageLink, this.insertImgLink);
        this.parent.off(events.imageAlt, this.insertAltText);
        this.parent.off(events.editAreaClick, this.editAreaClickHandler);
        this.parent.off(events.iframeMouseDown, this.onIframeMouseDown);
        this.parent.off(events.imageSize, this.imageSize);
        this.parent.off(events.dropDownSelect, this.alignmentSelect);
        this.parent.off(events.initialEnd, this.afterRender);
        this.parent.off(events.dynamicModule, this.afterRender);
        this.parent.off(events.paste, this.imagePaste);
        this.parent.off(events.bindCssClass, this.setCssClass);
        this.parent.off(events.destroy, this.destroy);
        this.parent.off(events.bindOnEnd, this.bindOnEnd);
        this.parent.off(events.modelChanged, this.onPropertyChanged);
        const dropElement: HTMLElement | Document = this.parent.iframeSettings.enable ? this.parent.inputElement.ownerDocument
            : this.parent.inputElement;
        dropElement.removeEventListener('drop', this.drop, true);
        dropElement.removeEventListener('dragstart', this.drag, true);
        dropElement.removeEventListener('dragenter', this.enter, true);
        dropElement.removeEventListener('dragover', this.start, true);
        this.drop = null;
        this.drag = null;
        this.enter = null;
        this.start = null;
        if (!isNOU(this.contentModule)) {
            EventHandler.remove(this.contentModule.getEditPanel(), Browser.touchEndEvent, this.imageClick);
            this.parent.formatter.editorManager.observer.off(events.checkUndo, this.undoStack);
            if (this.parent.insertImageSettings.resize) {
                EventHandler.remove(this.parent.contentModule.getEditPanel(), Browser.touchStartEvent, this.resizeStart);
                (this.parent.element.ownerDocument as Document).removeEventListener('mousedown', this.docClick);
                this.docClick = null;
                EventHandler.remove(this.contentModule.getEditPanel(), 'cut', this.onCutHandler);
                EventHandler.remove(this.contentModule.getDocument(), Browser.touchMoveEvent, this.resizing);
            }
        }
    }

    private bindOnEnd(): void {
        if (this.parent.formatter.editorManager && !this.parent.formatter.editorManager.imgObj) {
            this.parent.formatter.editorManager.imgObj = new ImageCommand(this.parent.formatter.editorManager);
        }
    }

    private onPropertyChanged(e: { [key: string]: RichTextEditorModel }): void {
        for (const prop of Object.keys(e.newProp)) {
            if (prop === 'insertImageSettings') {
                switch (Object.keys(e.newProp.insertImageSettings)[0]) {
                case 'resize':
                    if (this.parent.insertImageSettings.resize === false) {
                        EventHandler.remove(this.parent.contentModule.getEditPanel(), Browser.touchStartEvent, this.resizeStart);
                        EventHandler.remove(this.contentModule.getEditPanel(), 'cut', this.onCutHandler);
                        this.cancelResizeAction();
                    } else {
                        this.addresizeHandler();
                    }
                    break;
                }
            }
        }
    }
    private updateCss(currentObj: CheckBox | TextBox | Uploader | Dialog, e: ICssClassArgs): void {
        if (currentObj && e.cssClass) {
            if (isNOU(e.oldCssClass)) {
                currentObj.setProperties({ cssClass: (currentObj.cssClass + ' ' + e.cssClass).trim() });
            } else {
                currentObj.setProperties({ cssClass: (currentObj.cssClass.replace(e.oldCssClass, '').trim() + ' ' + e.cssClass).trim() });
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/tslint/config
    private setCssClass(e: ICssClassArgs) {
        if (this.popupObj && e.cssClass) {
            if (isNOU(e.oldCssClass)) {
                addClass([this.popupObj.element], e.cssClass);
            } else {
                removeClass([this.popupObj.element], e.oldCssClass);
                addClass([this.popupObj.element], e.cssClass);
            }
        }
        this.updateCss(this.checkBoxObj, e);
        this.updateCss(this.widthNum, e);
        this.updateCss(this.heightNum, e);
        this.updateCss(this.uploadObj, e);
        this.updateCss(this.dialogObj, e);
    }
    private onIframeMouseDown(e: MouseEvent): void {
        const target: HTMLElement = <HTMLElement>e.target;
        if (this.dialogObj) {
            this.dialogObj.hide({ returnValue: true } as Event);
        }
        if (!(!isNOU(this.parent.currentTarget) && this.parent.currentTarget.nodeName === 'IMG') && (this.imgEle && this.imgResizeDiv && this.contentModule.getEditPanel().contains(this.imgResizeDiv))) {
            this.cancelResizeAction();
        }
        if (this.contentModule.getEditPanel().querySelector('.e-img-resize') && (this.parent.currentTarget.nodeName === 'IMG')) {
            if (!isNOU(this.prevSelectedImgEle) && this.prevSelectedImgEle !== target) {
                this.prevSelectedImgEle.style.outline = '';
            }
        }
    }

    private addresizeHandler(): void {
        EventHandler.add(this.parent.contentModule.getEditPanel(), Browser.touchStartEvent, this.resizeStart, this);
        (this.parent.element.ownerDocument as Document).addEventListener('mousedown', this.docClick);
        EventHandler.add(this.contentModule.getEditPanel(), 'cut', this.onCutHandler, this);
    }
    private afterRender(): void {
        this.contentModule = this.rendererFactory.getRenderer(RenderType.Content);
        EventHandler.add(this.contentModule.getEditPanel(), Browser.touchEndEvent, this.imageClick, this);
        if (this.parent.insertImageSettings.resize) {
            this.addresizeHandler();
        }
        const dropElement: HTMLElement | Document = this.parent.iframeSettings.enable ? this.parent.inputElement.ownerDocument :
            this.parent.inputElement;
        dropElement.addEventListener('drop', this.drop, true);
        dropElement.addEventListener('dragstart', this.drag, true);
        dropElement.addEventListener('dragenter', this.enter, true);
        dropElement.addEventListener('dragover', this.start, true);
    }

    private undoStack(args?: { [key: string]: string }): void {
        if ((args.subCommand.toLowerCase() === 'undo' || args.subCommand.toLowerCase() === 'redo') && this.parent.editorMode === 'HTML') {
            for (let i: number = 0; i < this.parent.formatter.getUndoRedoStack().length; i++) {
                const temp: Element = this.parent.createElement('div');
                const contentElem: DocumentFragment = this.parent.formatter.getUndoRedoStack()[i as number].text as DocumentFragment;
                temp.appendChild(contentElem.cloneNode(true));
                const img: NodeListOf<HTMLElement> = temp.querySelectorAll('img');
                if (temp.querySelector('.e-img-resize') && img.length > 0) {
                    for (let j: number = 0; j < img.length; j++) {
                        img[j as number].style.outline = '';
                    }
                    detach(temp.querySelector('.e-img-resize'));
                    const clonedElement: HTMLElement = temp.cloneNode(true) as HTMLElement;
                    const fragment: DocumentFragment = document.createDocumentFragment();
                    while (clonedElement.firstChild) {
                        fragment.appendChild(clonedElement.firstChild);
                    }
                    this.parent.formatter.getUndoRedoStack()[i as number].text = fragment;
                }
            }
        }
    }

    private resizeEnd(e: PointerEvent | TouchEvent): void {
        this.resizeBtnInit();
        if (this.imgEle.parentElement) {
            this.imgEle.parentElement.style.cursor = 'auto';
        }
        if (Browser.isDevice) {
            removeClass([(e.target as HTMLElement).parentElement], 'e-mob-span');
        }
        const args: ResizeArgs = { event: e, requestType: 'images' };
        this.parent.trigger(events.resizeStop, args);
        this.parent.formatter.editorManager.observer.on(events.checkUndo, this.undoStack, this);
        this.parent.formatter.saveData();
        EventHandler.remove(this.contentModule.getDocument(), Browser.touchMoveEvent, this.resizing);
        EventHandler.remove(this.contentModule.getDocument(), Browser.touchEndEvent, this.resizeEnd);
    }

    private resizeStart(e: PointerEvent | TouchEvent, ele?: Element): void {
        if (this.parent.readonly) {
            return;
        }
        const target: HTMLElement = ele ? ele as HTMLElement : e.target as HTMLElement;
        this.prevSelectedImgEle = this.imgEle;
        if ((target as HTMLElement).tagName === 'IMG') {
            this.parent.preventDefaultResize(e as MouseEvent);
            const img: HTMLImageElement = target as HTMLImageElement;
            if (this.imgResizeDiv && this.contentModule.getEditPanel().contains(this.imgResizeDiv)) {
                detach(this.imgResizeDiv);
            }
            this.imageResize(img);
        }
        if ((target as HTMLElement).classList.contains('e-rte-imageboxmark')) {
            if (this.parent.formatter.getUndoRedoStack().length === 0) {
                this.parent.formatter.saveData();
            }
            this.pageX = this.getPointX(e);
            this.pageY = this.getPointY(e);
            e.preventDefault();
            e.stopImmediatePropagation();
            this.resizeBtnInit();
            if (this.quickToolObj) {
                this.quickToolObj.imageQTBar.hidePopup();
            }
            const handlers: string[] = ['topLeft', 'topRight', 'botLeft', 'botRight'];
            for (let i: number = 0; i < handlers.length; i++) {
                const handler: string = handlers[i as number];
                if ((target as HTMLElement).classList.contains('e-rte-' + handler)) {
                    this.resizeBtnStat[handler as string] = true;
                    this.currentResizeHandler = handler;
                    this.aspectRatio = this.findAspectRatio(this.imgEle);
                    break; // Exit the loop once a match is found
                }
            }
            if (Browser.isDevice && this.contentModule.getEditPanel().contains(this.imgResizeDiv) &&
                !this.imgResizeDiv.classList.contains('e-mob-span')) {
                addClass([this.imgResizeDiv], 'e-mob-span');
            } else {
                const args: ResizeArgs = { event: e, requestType: 'images' };
                this.parent.trigger(events.resizeStart, args, (resizeStartArgs: ResizeArgs) => {
                    if (resizeStartArgs.cancel) {
                        this.cancelResizeAction();
                    }
                });
            }
            EventHandler.add(this.contentModule.getDocument(), Browser.touchMoveEvent, this.resizing, this);
            EventHandler.add(this.contentModule.getDocument(), Browser.touchEndEvent, this.resizeEnd, this);
        }
    }
    private imageClick(e: MouseEvent): void {
        if (Browser.isDevice) {
            if (((e.target as HTMLElement).tagName === 'IMG' &&
                (e.target as HTMLElement).parentElement.tagName === 'A') ||
                ((e.target as Element).tagName === 'IMG')) {
                this.contentModule.getEditPanel().setAttribute('contenteditable', 'false');
                (e.target as HTMLElement).focus();
            } else {
                if (!this.parent.readonly) {
                    this.contentModule.getEditPanel().setAttribute('contenteditable', 'true');
                }
            }
        }
        if ((e.target as HTMLElement).tagName === 'IMG' &&
            (e.target as HTMLElement).parentElement.tagName === 'A') {
            e.preventDefault();
        }
    }

    private onCutHandler(): void {
        if (this.imgResizeDiv && this.contentModule.getEditPanel().contains(this.imgResizeDiv)) {
            this.cancelResizeAction();
        }
    }

    private imageResize(e: HTMLImageElement): void {
        this.resizeBtnInit();
        this.imgEle = e;
        addClass([this.imgEle], 'e-resize');
        this.imgResizeDiv = this.parent.createElement('span', { className: 'e-img-resize' + this.parent.getCssClass(true), id: this.rteID + '_imgResize' });
        this.imgResizeDiv.appendChild(this.parent.createElement('span', {
            className: 'e-rte-imageboxmark e-rte-topLeft' + this.parent.getCssClass(true), styles: 'cursor: nwse-resize'
        }));
        this.imgResizeDiv.appendChild(this.parent.createElement('span', {
            className: 'e-rte-imageboxmark e-rte-topRight' + this.parent.getCssClass(true), styles: 'cursor: nesw-resize'
        }));
        this.imgResizeDiv.appendChild(this.parent.createElement('span', {
            className: 'e-rte-imageboxmark e-rte-botLeft' + this.parent.getCssClass(true), styles: 'cursor: nesw-resize'
        }));
        this.imgResizeDiv.appendChild(this.parent.createElement('span', {
            className: 'e-rte-imageboxmark e-rte-botRight' + this.parent.getCssClass(true), styles: 'cursor: nwse-resize'
        }));
        if (Browser.isDevice) {
            addClass([this.imgResizeDiv], 'e-mob-rte');
        }
        e.style.outline = '2px solid #4a90e2';
        this.imgResizePos(e, this.imgResizeDiv);
        this.resizeImgDupPos(e);
        this.contentModule.getEditPanel().appendChild(this.imgResizeDiv);
        if (this.parent.element.style.height === 'auto') {
            this.imgResizePos(e, this.imgResizeDiv);
        }
    }

    private getPointX(e: PointerEvent | TouchEvent): number {
        if (this.parent.iframeSettings.enable) {
            if ((e as TouchEvent).touches && (e as TouchEvent).touches.length) {
                return (e as TouchEvent).touches[0].screenX;
            } else {
                return (e as PointerEvent).screenX;
            }
        } else {
            if ((e as TouchEvent).touches && (e as TouchEvent).touches.length) {
                return (e as TouchEvent).touches[0].pageX;
            } else {
                return (e as PointerEvent).pageX;
            }
        }
    }

    private getPointY(e: PointerEvent | TouchEvent): number {
        if (this.parent.iframeSettings.enable) {
            if ((e as TouchEvent).touches && (e as TouchEvent).touches.length) {
                return (e as TouchEvent).touches[0].screenY;
            } else {
                return (e as PointerEvent).screenY;
            }
        } else {
            if ((e as TouchEvent).touches && (e as TouchEvent).touches.length) {
                return (e as TouchEvent).touches[0].pageY;
            } else {
                return (e as PointerEvent).pageY;
            }
        }
    }

    private imgResizePos(e: HTMLImageElement, imgResizeDiv: HTMLElement): void {
        const pos: OffsetPosition = this.calcPos(e);
        const top: number = pos.top;
        const left: number = pos.left;
        const imgWid: number = e.getBoundingClientRect().width;
        const imgHgt: number = e.getBoundingClientRect().height;
        const borWid: number = (Browser.isDevice) ? (4 * parseInt((e.style.outline.slice(-3)), 10)) + 2 :
            (2 * parseInt((e.style.outline.slice(-3)), 10)) + 2; //span border width + image outline width
        const devWid: number = ((Browser.isDevice) ? 0 : 2); // span border width
        (imgResizeDiv.querySelector('.e-rte-botLeft') as HTMLElement).style.left = (left - borWid) + 'px';
        (imgResizeDiv.querySelector('.e-rte-botLeft') as HTMLElement).style.top = ((imgHgt - borWid) + top) + 'px';
        (imgResizeDiv.querySelector('.e-rte-botRight') as HTMLElement).style.left = ((imgWid - (borWid - devWid)) + left) + 'px';
        (imgResizeDiv.querySelector('.e-rte-botRight') as HTMLElement).style.top = ((imgHgt - borWid) + top) + 'px';
        (imgResizeDiv.querySelector('.e-rte-topRight') as HTMLElement).style.left = ((imgWid - (borWid - devWid)) + left) + 'px';
        (imgResizeDiv.querySelector('.e-rte-topRight') as HTMLElement).style.top = (top - (borWid)) + 'px';
        (imgResizeDiv.querySelector('.e-rte-topLeft') as HTMLElement).style.left = (left - borWid) + 'px';
        (imgResizeDiv.querySelector('.e-rte-topLeft') as HTMLElement).style.top = (top - borWid) + 'px';
    }

    private calcPos(elem: HTMLElement): OffsetPosition {
        const ignoreOffset: string[] = ['TD', 'TH', 'TABLE', 'A'];
        let parentOffset: OffsetPosition = { top: 0, left: 0 };
        let elementOffset: OffsetPosition;
        const doc: Document = elem.ownerDocument;
        let offsetParent: Node = ((elem.offsetParent && (elem.offsetParent.classList.contains('e-img-caption') ||
            ignoreOffset.indexOf(elem.offsetParent.tagName) > -1)) ?
            closest(elem, '#' + this.parent.getID() + '_rte-edit-view') : elem.offsetParent) || doc.documentElement;
        while (offsetParent &&
            (offsetParent === doc.body || offsetParent === doc.documentElement) &&
            (<HTMLElement>offsetParent).style.position === 'static') {
            offsetParent = offsetParent.parentNode;
        }
        if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
            parentOffset = (<HTMLElement>offsetParent).getBoundingClientRect();
        }
        if (elem.offsetParent && (elem.offsetParent.classList.contains('e-img-caption'))) {
            elementOffset = elem.getBoundingClientRect();
            return {
                top: elementOffset.top - parentOffset.top,
                left: elementOffset.left - parentOffset.left
            };
        } else {
            return {
                top: elem.offsetTop,
                left: elem.offsetLeft
            };
        }
    }
    private setAspectRatio(img: HTMLImageElement, expectedX: number, expectedY: number): void {
        if (isNOU(img.width)) {
            return;
        }
        const width: number = img.width;
        const height: number = img.height;
        const sameHeightWidth: boolean = (width === height);
        const factor: string = this.parent.insertImageSettings.resizeByPercent ? '%' : 'px';
        const emptyStyleDimension: boolean = (img.style.width === '' && img.style.height === '');
        if (!sameHeightWidth && !emptyStyleDimension) {
            if (img.style.width !== '' && img.style.height !== '') {
                if (this.parent.insertImageSettings.resizeByPercent) {
                    this.setImageWidth(img, expectedX, factor);
                    this.removeImageHeight(img);
                } else {
                    this.setImageWidth(img, expectedX, factor);
                    this.setImageHeight(img, expectedY, factor);
                }
            } else if (img.style.width !== '') {
                if (this.parent.insertImageSettings.resizeByPercent) {
                    this.setImageWidth(img, expectedX, factor);
                    this.removeImageHeight(img);
                } else {
                    this.setImageWidth(img, expectedX, factor);
                }
            } else if (img.style.height !== '') {
                if (this.parent.insertImageSettings.resizeByPercent) {
                    this.setImageWidth(img, expectedX, factor);
                    this.removeImageHeight(img);
                } else {
                    this.setImageHeight(img, expectedY, factor);
                }
            }
        } else {
            this.setImageWidth(img, expectedX, factor);
            if (this.parent.insertImageSettings.resizeByPercent) {
                this.removeImageHeight(img);
            } else {
                this.setImageHeight(img, expectedY, factor);
            }
        }
    }

    private setImageWidth(img: HTMLImageElement, value: number, suffix: string): void {
        img.style.width = this.getImageDimension(value, img) + suffix;
        if (!this.parent.insertImageSettings.resizeByPercent) {
            img.setAttribute('width', value.toString());
        }
    }

    private setImageHeight(img: HTMLImageElement, value: number, suffix: string): void {
        img.style.height = this.getImageDimension(value, img) + suffix;
        if (!this.parent.insertImageSettings.resizeByPercent) {
            img.setAttribute('height', value.toString());
        }
    }

    private removeImageHeight(img: HTMLImageElement): void {
        img.style.height = '';
        img.removeAttribute('height');
    }

    private getImageDimension(value: number, img: HTMLImageElement): number {
        if (this.parent.insertImageSettings.resizeByPercent) {
            const rootElem: Element = img.parentElement;
            return this.pixToPerc(value, rootElem);
        } else {
            return value;
        }
    }

    private adjustDimensionsByAspectRatio(width: number, height: number, aspectRatio: number): ImageDimension {
        height = Math.round(width / aspectRatio);
        width = Math.round(height * aspectRatio);
        return { width: width, height: height };
    }

    private pixToPerc(expected: number, parentEle: Element): number {
        return expected / parseFloat(getComputedStyle(parentEle).width) * 100;
    }
    private imgDupMouseMove(width: string, height: string, e: PointerEvent | TouchEvent): void {
        const args: ResizeArgs = { event: e, requestType: 'images' };
        this.parent.trigger(events.onResize, args, (resizingArgs: ResizeArgs) => {
            if (resizingArgs.cancel) {
                this.cancelResizeAction();
            } else {
                if ((parseInt(this.parent.insertImageSettings.minWidth as string, 10) >= parseInt(width, 10) ||
                    (parseInt(this.parent.getInsertImgMaxWidth() as string, 10) <= parseInt(width, 10) &&
                        isNOU(this.imgEle.style.width)))) {
                    return;
                }
                if (!this.parent.insertImageSettings.resizeByPercent &&
                    (parseInt(this.parent.insertImageSettings.minHeight as string, 10) >= parseInt(height, 10) ||
                        parseInt(this.parent.insertImageSettings.maxHeight as string, 10) <= parseInt(height, 10))) {
                    return;
                }
                this.imgEle.parentElement.style.cursor = 'pointer';
                this.setAspectRatio(this.imgEle, parseInt(width, 10), parseInt(height, 10));
                this.resizeImgDupPos(this.imgEle);
                this.imgResizePos(this.imgEle, this.imgResizeDiv);
            }
        });
    }
    private resizing(e: PointerEvent | TouchEvent): void {
        if (!this.parent) { this.cancelResizeAction(); return; }
        if (this.resizeBtnStat.botRight || this.resizeBtnStat.botLeft || this.resizeBtnStat.topRight || this.resizeBtnStat.topLeft) {
            if (this.parent.iframeSettings.enable) {
                const resizeFactor: number[] = this.getResizeFactor(this.currentResizeHandler);
                const currentScreenX: number = this.getPointX(e);
                const currentScreenY: number = this.getPointY(e);
                const currentWidth: number = this.imgEle.clientWidth;
                const currentHeight: number = this.imgEle.clientHeight;
                const deltaX: number = currentScreenX - this.pageX;
                const deltaY: number = currentScreenY - this.pageY;
                const width: number = deltaX * resizeFactor[0] + currentWidth;
                const height: number = deltaY * resizeFactor[1] + currentHeight;
                const dimensions: ImageDimension = this.adjustDimensions(width, height, deltaX, deltaY, this.aspectRatio);
                this.pageX = currentScreenX;
                this.pageY = currentScreenY;
                this.imgDupMouseMove(dimensions.width + 'px', dimensions.height + 'px', e);
                this.parent.autoResize();
            } else {
                const pageX: number = this.getPointX(e);
                const pageY: number = this.getPointY(e);
                const resizeFactor: number[] = this.getResizeFactor(this.currentResizeHandler);
                const diffX: number = (pageX - this.pageX);
                const diffY: number = (pageY - this.pageY);
                const currentWidth: number = this.imgEle.clientWidth;
                const currentHeight: number = this.imgEle.clientHeight;
                const width: number = diffX * resizeFactor[0] + currentWidth;
                const height: number = diffY * resizeFactor[1] + currentHeight;
                const dimensions: ImageDimension = this.adjustDimensions(width, height, diffX, diffY, this.aspectRatio);
                this.pageX = pageX;
                this.pageY = pageY;
                this.imgDupMouseMove(dimensions.width + 'px', dimensions.height + 'px', e);
            }
        }
    }

    private adjustDimensions(width: number, height: number, diffX: number, diffY: number, aspectRatio: number): ImageDimension {
        width = (width < 16) ? 16 : width;
        height = (height < 16) ? 16 : height;
        const dimensions: { width: number, height: number } = this.adjustDimensionsByAspectRatio(width, height, aspectRatio);
        return dimensions;
    }

    private getResizeFactor(value: string): number[] {
        return imageResizeFactor[value as keyof IImageResizeFactor];
    }

    private findAspectRatio(image: HTMLImageElement): number {
        return image.clientWidth / image.clientHeight;
    }

    public cancelResizeAction(): void {
        EventHandler.remove(this.contentModule.getDocument(), Browser.touchMoveEvent, this.resizing);
        EventHandler.remove(this.contentModule.getDocument(), Browser.touchEndEvent, this.resizeEnd);
        if (this.imgEle && this.imgResizeDiv && this.contentModule.getEditPanel().contains(this.imgResizeDiv)) {
            detach(this.imgResizeDiv);
            (this.imgEle as HTMLElement).style.outline = '';
            this.imgResizeDiv = null;
            this.pageX = null;
            this.pageY = null;
            this.currentResizeHandler = null;
            this.aspectRatio = null;
        }
    }
    private resizeImgDupPos(e: HTMLImageElement): void {
        this.imgDupPos = {
            width: (e.style.width !== '' && (this.parent.insertImageSettings &&
                !this.parent.insertImageSettings.resizeByPercent)) ? this.imgEle.style.width : e.width + 'px',
            height: (e.style.height !== '') ? this.imgEle.style.height : e.height + 'px'
        };
    }

    private resizeBtnInit(): { [key: string]: boolean } {
        this.aspectRatio = null;
        this.currentResizeHandler = null;
        return this.resizeBtnStat = { botLeft: false, botRight: false, topRight: false, topLeft: false };
    }
    private onToolbarAction(args: NotifyArgs): void {
        if (isIDevice()) {
            this.parent.notify(events.selectionRestore, {});
        }
        const item: IToolbarItemModel = (args.args as ClickEventArgs).item as IToolbarItemModel;
        switch (item.subCommand) {
        case 'Replace':
            if (this.parent.fileManagerSettings.enable) {
                this.parent.notify(events.renderFileManager, args);
            } else { this.parent.notify(events.insertImage, args); }
            break;
        case 'Caption':
            this.parent.notify(events.imageCaption, args);
            break;
        case 'InsertLink':
            this.parent.notify(events.imageLink, args);
            break;
        case 'AltText':
            this.parent.notify(events.imageAlt, args);
            break;
        case 'Remove':
            this.parent.notify(events.imageDelete, args);
            break;
        case 'Dimension':
            this.parent.notify(events.imageSize, args);
            break;
        case 'OpenImageLink':
            this.openImgLink(args);
            break;
        case 'EditImageLink':
            this.editImgLink(args);
            break;
        case 'RemoveImageLink':
            this.removeImgLink(args);
            break;
        }
    }

    private openImgLink(e: NotifyArgs): void {
        const sanitizedHTML: string = this.parent.htmlEditorModule.sanitizeHelper(
            (e.selectParent[0].parentNode as HTMLAnchorElement).outerHTML);
        const tempEle: HTMLElement = document.createElement('div');
        tempEle.innerHTML = sanitizedHTML;
        const target: string = (e.selectParent[0].parentNode as HTMLAnchorElement).target === '' ? '_self' : '_blank';
        this.parent.formatter.process(
            this.parent, e.args, e.args,
            {
                url: (tempEle.firstChild as HTMLAnchorElement).href, target: target, selectNode: e.selectNode,
                subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand
            });
        tempEle.remove();
    }

    private editImgLink(e: NotifyArgs): void {
        const selectParentEle: HTMLElement = e.selectParent[0].parentNode as HTMLElement;
        const linkUpdate: string = this.i10n.getConstant('dialogUpdate');
        const inputDetails: { [key: string]: string } = {
            url: (selectParentEle as HTMLAnchorElement).href, target: (selectParentEle as HTMLAnchorElement).target,
            header: 'Edit Link', btnText: linkUpdate
        };
        this.insertImgLink(e, inputDetails);
    }
    private removeImgLink(e: NotifyArgs): void {
        if (Browser.isIE) {
            (this.contentModule.getEditPanel() as HTMLElement).focus();
        }
        e.selection.restore();
        const isCapLink: boolean = (this.contentModule.getEditPanel().contains(this.captionEle) && select('a', this.captionEle)) ?
            true : false;
        const selectParent: Node[] = isCapLink ? [this.captionEle] : [e.selectNode[0].parentElement];
        this.parent.formatter.process(
            this.parent, e.args, e.args,
            {
                insertElement: e.selectNode[0] as HTMLElement, selectParent: selectParent, selection: e.selection,
                subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand
            });
        if (this.quickToolObj && document.body.contains(this.quickToolObj.imageQTBar.element)) {
            this.quickToolObj.imageQTBar.hidePopup();
            if (!isNOU(e.selectParent as Node[])) {
                removeClass([e.selectParent[0] as HTMLElement], 'e-img-focus');
            }
        }
        if (isCapLink) {
            (select('.e-img-inner', this.captionEle) as HTMLElement).focus();
        }
    }
    private onKeyDown(event: NotifyArgs): void {
        const originalEvent: KeyboardEventArgs = event.args as KeyboardEventArgs;
        let range: Range;
        let save: NodeSelection;
        let selectNodeEle: Node[];
        let selectParentEle: Node[];
        this.deletedImg = [];
        let isCursor: boolean;
        const keyCodeValues: number[] = [27, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123,
            44, 45, 9, 16, 17, 18, 19, 20, 33, 34, 35, 36, 37, 38, 39, 40, 91, 92, 93, 144, 145, 182, 183];
        if (this.parent.editorMode === 'HTML') {
            range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
            isCursor = range.startContainer === range.endContainer && range.startOffset === range.endOffset;
        }
        if (!isCursor && this.parent.editorMode === 'HTML' && keyCodeValues.indexOf(originalEvent.which) < 0) {
            const nodes: Node[] = this.parent.formatter.editorManager.nodeSelection.getNodeCollection(range);
            for (let i: number = 0; i < nodes.length; i++) {
                if (nodes[i as number].nodeName === 'IMG') {
                    this.deletedImg.push(nodes[i as number]);
                }
            }
        }
        if (this.parent.editorMode === 'HTML' && ((originalEvent.which === 8 && originalEvent.code === 'Backspace') ||
            (originalEvent.which === 46 && originalEvent.code === 'Delete'))) {
            const isCursor: boolean = range.startContainer === range.endContainer && range.startOffset === range.endOffset;
            if ((originalEvent.which === 8 && originalEvent.code === 'Backspace' && isCursor)) {
                this.checkImageBack(range);
            } else if ((originalEvent.which === 46 && originalEvent.code === 'Delete' && isCursor)) {
                this.checkImageDel(range);
            }
        }
        if (!isNOU(this.parent.formatter.editorManager.nodeSelection) &&
            originalEvent.code !== 'KeyK') {
            range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
            selectNodeEle = this.parent.formatter.editorManager.nodeSelection.getNodeCollection(range);
            selectParentEle = this.parent.formatter.editorManager.nodeSelection.getParentNodeCollection(range);
            if (!originalEvent.ctrlKey && originalEvent.key && (originalEvent.key.length === 1 || originalEvent.action === 'enter') &&
                (!isNOU(selectParentEle[0]) && (selectParentEle[0] as HTMLElement).tagName === 'IMG') && (selectParentEle[0] as HTMLElement).parentElement) {
                if (this.contentModule.getEditPanel().querySelector('.e-img-resize')) {
                    this.removeResizeEle();
                }
                removeClass([selectParentEle[0] as HTMLElement], 'e-img-focus');
                if (this.quickToolObj && this.quickToolObj.imageQTBar) {
                    this.quickToolObj.imageQTBar.hidePopup();
                }
            }
        }
        if (originalEvent.ctrlKey && (originalEvent.keyCode === 89 || originalEvent.keyCode === 90)) {
            if (this.parent.editorMode !== 'Markdown') {
                this.undoStack({ subCommand: (originalEvent.keyCode === 90 ? 'undo' : 'redo') });
            }
        }
        if (originalEvent.keyCode === 8 || originalEvent.keyCode === 46) {
            if (selectNodeEle && selectNodeEle[0] && selectNodeEle[0].nodeName === 'IMG' && selectNodeEle.length < 1) {
                // eslint-disable-next-line max-len
                if (!isNOU(this.parent.formatter.editorManager.nodeSelection)) { save = this.parent.formatter.editorManager.nodeSelection.save(range, this.parent.contentModule.getDocument()); }
                originalEvent.preventDefault();
                const event: IImageNotifyArgs = {
                    selectNode: selectNodeEle, selection: save, selectParent: selectParentEle,
                    args: {
                        item: { command: 'Images', subCommand: 'Remove' } as IToolbarItemModel,
                        originalEvent: originalEvent
                    }
                };
                this.deleteImg(event, originalEvent.keyCode);
            }
            if (this.parent.contentModule.getEditPanel().querySelector('.e-img-resize')) {
                this.removeResizeEle();
            }
        }
        if (originalEvent.code === 'Backspace') {
            originalEvent.action = 'backspace';
        }
        switch (originalEvent.action) {
        case 'escape':
            if (!isNOU(this.dialogObj)) {
                this.dialogObj.close();
            }
            break;
        case 'backspace':
        case 'delete':
            if (this.parent.editorMode !== 'Markdown') {
                if (range.startContainer.nodeType === 3) {
                    if (originalEvent.code === 'Backspace') {
                        if ((range.startContainer as HTMLElement).previousElementSibling && range.startOffset === 0 &&
                                (range.startContainer as HTMLElement).previousElementSibling.classList.contains(classes.CLS_CAPTION) &&
                                (range.startContainer as HTMLElement).previousElementSibling.classList.contains(classes.CLS_CAPINLINE)) {
                            detach((range.startContainer as HTMLElement).previousElementSibling);
                        }
                    } else {
                        if ((range.startContainer as HTMLElement).nextElementSibling &&
                                range.endContainer.textContent.length === range.endOffset &&
                                (range.startContainer as HTMLElement).nextElementSibling.classList.contains(classes.CLS_CAPTION) &&
                                (range.startContainer as HTMLElement).nextElementSibling.classList.contains(classes.CLS_CAPINLINE)) {
                            detach((range.startContainer as HTMLElement).nextElementSibling);
                        }
                    }
                } else if (range.startContainer.nodeType === 1) {
                    if ((range.startContainer as HTMLElement).querySelector('.' + classes.CLS_CAPTION + '.' + classes.CLS_CAPINLINE)) {
                        detach((range.startContainer as HTMLElement).querySelector('.' + classes.CLS_CAPTION + '.' + classes.CLS_CAPINLINE));
                    } else if ((range.startContainer as HTMLElement).querySelector('.' + classes.CLS_CAPTION + '.' + classes.CLS_IMGBREAK)) {
                        detach((range.startContainer as HTMLElement).querySelector('.' + classes.CLS_CAPTION + '.' + classes.CLS_IMGBREAK));
                    } else if ((range.startContainer as HTMLElement).classList.contains('e-img-wrap') && closest((range.startContainer as HTMLElement), '.' + classes.CLS_CAPTION)) {
                        const parentElem: HTMLElement = (range.startContainer as HTMLElement).parentElement.parentElement;
                        detach(closest((range.startContainer as HTMLElement), '.' + classes.CLS_CAPTION));
                        if (parentElem && parentElem.textContent.trim() === '') {
                            const brElem: HTMLElement = this.parent.createElement('br');
                            brElem.classList.add('e-rte-image-remove-focus');
                            parentElem.appendChild(brElem);
                        }
                    }
                }
            }
            break;
        case 'insert-image':
            // eslint-disable-next-line max-len
            if (!isNOU(this.parent.formatter.editorManager.nodeSelection)) { save = this.parent.formatter.editorManager.nodeSelection.save(range, this.parent.contentModule.getDocument()); }
            this.openDialog(true, originalEvent, save, selectNodeEle, selectParentEle);
            originalEvent.preventDefault();
            break;
        }
        if (originalEvent.ctrlKey && originalEvent.key === 'a') {
            this.handleSelectAll();
        }
    }

    private handleSelectAll(): void {
        this.cancelResizeAction();
        const imgFocusNodes: NodeListOf<Element> = this.parent.inputElement.querySelectorAll('.' + CLS_IMG_FOCUS);
        removeClass(imgFocusNodes, CLS_IMG_FOCUS);
    }

    private openDialog(
        isInternal?: boolean,
        event?: KeyboardEventArgs | MouseEventArgs,
        selection?: NodeSelection, ele?: Node[], parentEle?: Node[]
    ): void {
        let range: Range;
        let save: NodeSelection;
        let selectNodeEle: Node[];
        let selectParentEle: Node[];
        if (!isInternal && !isNOU(this.parent.formatter.editorManager.nodeSelection)) {
            range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
            save = this.parent.formatter.editorManager.nodeSelection.save(
                range, this.parent.contentModule.getDocument());
            selectNodeEle = this.parent.formatter.editorManager.nodeSelection.getNodeCollection(range);
            selectParentEle = this.parent.formatter.editorManager.nodeSelection.getParentNodeCollection(range);
        } else {
            save = selection;
            selectNodeEle = ele;
            selectParentEle = parentEle;
        }
        if (this.parent.editorMode === 'HTML') {
            this.insertImage({
                args: {
                    item: { command: 'Images', subCommand: 'Image' } as IToolbarItemModel,
                    originalEvent: event,
                    name: !isInternal ? 'showDialog' : null
                },
                selectNode: selectNodeEle,
                selection: save,
                selectParent: selectParentEle
            });
        } else {
            this.insertImage({
                args: {
                    item: { command: 'Images', subCommand: 'Image' } as IToolbarItemModel,
                    originalEvent: event,
                    name: !isInternal ? 'showDialog' : null
                },
                member: 'image',
                text: this.parent.formatter.editorManager.markdownSelection.getSelectedText(
                    this.parent.contentModule.getEditPanel() as HTMLTextAreaElement),
                module: 'Markdown',
                name: 'insertImage'
            });
        }
    }
    private showDialog(args?: SlashMenuItemSelectArgs): void {
        if (!isNOU(args.originalEvent)) {
            this.openDialog(false, args.originalEvent as MouseEventArgs);
        } else {
            this.openDialog(false);
        }
        this.setCssClass({ cssClass: this.parent.getCssClass() });
    }
    private closeDialog(): void {
        if (this.dialogObj) { this.dialogObj.hide({ returnValue: true } as Event); }
    }
    private onKeyUp(): void {
        if (!isNOU(this.deletedImg) && this.deletedImg.length > 0) {
            const deleteImages: Node[] = Array.from(this.deletedImg);
            for (let i: number = deleteImages.length - 1; i >= 0; i--) {
                const args: AfterImageDeleteEventArgs = {
                    element: this.deletedImg[i as number],
                    src: (this.deletedImg[i as number] as HTMLElement).getAttribute('src')
                };
                this.parent.trigger(events.afterImageDelete, args);
                this.deletedImg.splice(i as number, 1);
            }
        }
    }
    private checkImageBack(range: Range): void {
        if (range.startContainer.nodeName === '#text' && range.startOffset === 0 &&
            !isNOU(range.startContainer.previousSibling) && range.startContainer.previousSibling.nodeName === 'IMG') {
            this.deletedImg.push(range.startContainer.previousSibling);
        } else if (range.startContainer.nodeName !== '#text' && !isNOU(range.startContainer.childNodes[range.startOffset - 1]) &&
            range.startContainer.childNodes[range.startOffset - 1].nodeName === 'IMG') {
            this.deletedImg.push(range.startContainer.childNodes[range.startOffset - 1]);
        }
    }
    private checkImageDel(range: Range): void {
        if (range.startContainer.nodeName === '#text' && range.startOffset === range.startContainer.textContent.length &&
            !isNOU(range.startContainer.nextSibling) && range.startContainer.nextSibling.nodeName === 'IMG') {
            this.deletedImg.push(range.startContainer.nextSibling);
        } else if (range.startContainer.nodeName !== '#text' && !isNOU(range.startContainer.childNodes[range.startOffset]) &&
            range.startContainer.childNodes[range.startOffset].nodeName === 'IMG') {
            this.deletedImg.push(range.startContainer.childNodes[range.startOffset]);
        }
    }
    private alignmentSelect(e: ClickEventArgs): void {
        const item: IDropDownItemModel = e.item as IDropDownItemModel;
        if (!document.body.contains(document.body.querySelector('.e-rte-quick-toolbar')) || item.command !== 'Images') {
            return;
        }
        const range: Range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
        let selectNodeEle: Node[] = this.parent.formatter.editorManager.nodeSelection.getNodeCollection(range);
        selectNodeEle = (selectNodeEle[0].nodeName === 'IMG') ? selectNodeEle : [this.imgEle];
        const args: IImageNotifyArgs = { args: e, selectNode: selectNodeEle };
        if (this.parent.formatter.getUndoRedoStack().length === 0) {
            this.parent.formatter.saveData();
        }
        switch (item.subCommand) {
        case 'JustifyLeft':
            this.alignImage(args);
            break;
        case 'JustifyCenter':
            this.alignImage(args);
            break;
        case 'JustifyRight':
            this.alignImage(args);
            break;
        case 'Inline':
            this.inline(args);
            break;
        case 'Break':
            this.break(args);
            break;
        }
        if (this.quickToolObj && document.body.contains(this.quickToolObj.imageQTBar.element)) {
            this.quickToolObj.imageQTBar.hidePopup();
            removeClass([selectNodeEle[0] as HTMLElement], 'e-img-focus');
        }
        this.cancelResizeAction();
    }

    private showImageQuickToolbar(e: IShowPopupArgs): void {
        if ((e.type !== 'Images' && e.type !== 'Replace') || isNOU(this.parent.quickToolbarModule)
            || isNOU(this.parent.quickToolbarModule.imageQTBar) || isNOU(e.args)) {
            return;
        }
        this.quickToolObj = this.parent.quickToolbarModule;
        let target: HTMLElement = e.elements as HTMLElement;
        [].forEach.call(e.elements, (element: Element, index: number) => {
            if (index === 0) {
                target = <HTMLElement>element;
            }
        });
        const imageQuickToolbarElem: HTMLElement = this.quickToolObj.imageQTBar.quickTBarObj.toolbarObj.element;
        if (!isNOU(imageQuickToolbarElem.querySelector('.e-insert-link'))) {
            if (target.closest('a')) {
                imageQuickToolbarElem.classList.add('e-link-enabled');
            } else if (imageQuickToolbarElem.classList.contains('e-link-enabled')) {
                imageQuickToolbarElem.classList.remove('e-link-enabled');
            }
        }
        if (target.nodeName === 'IMG') {
            addClass([target], ['e-img-focus']);
        }
        if (this.parent.quickToolbarModule.imageQTBar) {
            if (e.isNotify) {
                this.imageQTPopupTime = setTimeout(() => {
                    this.parent.formatter.editorManager.nodeSelection.Clear(this.contentModule.getDocument());
                    this.parent.formatter.editorManager.nodeSelection.setSelectionContents(this.contentModule.getDocument(), target);
                    this.quickToolObj.imageQTBar.showPopup(target as Element, e.args as MouseEvent);
                    if (this.parent.insertImageSettings.resize === true) {
                        this.resizeStart(e.args as PointerEvent, target);
                    }
                }, this.parent.element.dataset.rteUnitTesting === 'true' ? 0 : 400);
            } else {
                this.quickToolObj.imageQTBar.showPopup(target as Element, e.args as MouseEvent);
            }
        }
    }

    private hideImageQuickToolbar(): void {
        if (!isNOU(this.contentModule.getEditPanel().querySelector('.e-img-focus'))) {
            removeClass([this.contentModule.getEditPanel().querySelector('.e-img-focus')], 'e-img-focus');
            if (this.quickToolObj && this.quickToolObj.imageQTBar && document.body.contains(this.quickToolObj.imageQTBar.element)) {
                this.quickToolObj.imageQTBar.hidePopup();
            }
        }
    }

    private editAreaClickHandler(e: IImageNotifyArgs): void {
        if (this.parent.readonly) {
            this.hideImageQuickToolbar();
            return;
        }
        const args: MouseEvent = e.args as MouseEvent;
        const showOnRightClick: boolean = this.parent.quickToolbarSettings.showOnRightClick;
        if (args.which === 2 || (showOnRightClick && args.which === 1) || (!showOnRightClick && args.which === 3)) {
            if ((showOnRightClick && args.which === 1) && !isNOU((args.target as HTMLElement)) &&
                (args.target as HTMLElement).tagName === 'IMG') {
                this.parent.formatter.editorManager.nodeSelection.Clear(this.contentModule.getDocument());
                this.parent.formatter.editorManager.nodeSelection.setSelectionContents(
                    this.contentModule.getDocument(), args.target as Node);
            }
            return;
        }
        if (this.parent.editorMode === 'HTML' && this.parent.quickToolbarModule && this.parent.quickToolbarModule.imageQTBar) {
            this.quickToolObj = this.parent.quickToolbarModule;
            const target: HTMLElement = args.target as HTMLElement;
            this.contentModule = this.rendererFactory.getRenderer(RenderType.Content);
            if (target.nodeName === 'IMG' && this.parent.quickToolbarModule) {
                this.parent.formatter.editorManager.nodeSelection.Clear(this.contentModule.getDocument());
                this.parent.formatter.editorManager.nodeSelection.setSelectionContents(this.contentModule.getDocument(), target);
                if (isIDevice()) {
                    this.parent.notify(events.selectionSave, e);
                }
                addClass([target], 'e-img-focus');
                this.showImageQuickToolbar({ args: args, type: 'Images', elements: [args.target as Element] } as IShowPopupArgs);
            } else {
                this.hideImageQuickToolbar();
            }
        }
    }

    private insertImgLink(e: IImageNotifyArgs, inputDetails?: { [key: string]: string }): void {
        if (e.selectNode[0].nodeName !== 'IMG') {
            return;
        }
        this.imagDialog(e);
        if (!isNOU(this.dialogObj)) {
            const linkWrap: HTMLElement = this.parent.createElement('div', { className: 'e-img-linkwrap' + this.parent.getCssClass(true) });
            const linkUrl: string = this.i10n.getConstant('linkurl');
            const content: string = '<div class="e-rte-field' + this.parent.getCssClass(true) + '">' +
                '<input type="text" data-role ="none" class="e-input e-img-link' + this.parent.getCssClass(true) + '" spellcheck="false" placeholder="' + linkUrl + '"/></div>' +
                '<div class="e-rte-label"></div>' + '<div class="e-rte-field">' +
                '<input type="checkbox" class="e-rte-linkTarget' + this.parent.getCssClass(true) + '"  data-role ="none"></div>';
            const contentElem: DocumentFragment = parseHtml(content);
            linkWrap.appendChild(contentElem);
            const linkTarget: HTMLInputElement = linkWrap.querySelector('.e-rte-linkTarget') as HTMLInputElement;
            const inputLink: HTMLElement = linkWrap.querySelector('.e-img-link') as HTMLElement;
            const linkOpenLabel: string = this.i10n.getConstant('linkOpenInNewWindow');
            this.checkBoxObj = new CheckBox({
                label: linkOpenLabel, checked: true, enableRtl: this.parent.enableRtl, cssClass: this.parent.getCssClass(),
                change: (e: ChangeEventArgs) => {
                    if (e.checked) {
                        target = '_blank';
                    } else {
                        target = null;
                    }
                }
            });
            this.checkBoxObj.isStringTemplate = true;
            this.checkBoxObj.createElement = this.parent.createElement;
            this.checkBoxObj.appendTo(linkTarget);
            let target: string = '_blank';
            const imageLabel: string | null = this.i10n.getConstant('imageLinkAriaLabel');
            const linkUpdate: string = this.i10n.getConstant('dialogUpdate');
            const linkargs: IImageNotifyArgs = {
                args: e.args,
                selfImage: this, selection: e.selection,
                selectNode: e.selectNode, selectParent: e.selectParent, link: inputLink, target: target, ariaLabel: imageLabel
            };
            this.dialogObj.setProperties({
                width: '290px',
                header: this.parent.localeObj.getConstant('imageInsertLinkHeader'),
                content: linkWrap,
                buttons: [{
                    // eslint-disable-next-line
                    click: (e: MouseEvent) => {
                        this.insertlink(linkargs);
                    },
                    buttonModel: {
                        content: linkUpdate, cssClass: 'e-flat e-update-link' + this.parent.getCssClass(true), isPrimary: true
                    }
                }],
                cssClass: this.dialogObj.cssClass + ' e-rte-img-link-dialog'
            });
            if (!isNOU(this.parent.cssClass)) {
                this.dialogObj.setProperties({ cssClass: this.parent.cssClass });
            }
            if (!isNOU(inputDetails)) {
                (inputLink as HTMLInputElement).value = inputDetails.url;
                this.checkBoxObj.checked = (inputDetails.target) ? true : false;
                this.dialogObj.header = inputDetails.header;
            }
            this.dialogObj.element.style.maxHeight = 'inherit';
            (this.dialogObj.content as HTMLElement).querySelector('input').focus();
        }
    }

    private insertAltText(e: IImageNotifyArgs): void {
        if (e.selectNode[0].nodeName !== 'IMG') {
            return;
        }
        this.imagDialog(e);
        const altText: string = this.i10n.getConstant('altText');
        if (!isNOU(this.dialogObj)) {
            const altWrap: HTMLElement = this.parent.createElement('div', { className: 'e-img-altwrap' + this.parent.getCssClass(true) });
            const altHeader: string = this.i10n.getConstant('alternateHeader');
            const linkUpdate: string = this.i10n.getConstant('dialogUpdate');
            const getAlt: string = ((e.selectNode[0] as HTMLElement).getAttribute('alt') === null) ? '' :
                (e.selectNode[0] as HTMLElement).getAttribute('alt');
            const content: string = '<div class="e-rte-field' + this.parent.getCssClass(true) + '">' +
                '<input type="text" spellcheck="false"  class="e-input e-img-alt' + this.parent.getCssClass(true) + '" placeholder="' + altText + '"/>' +
                '</div>';
            const contentElem: DocumentFragment = parseHtml(content);
            contentElem.querySelector('input').setAttribute('value', getAlt);
            altWrap.appendChild(contentElem);
            const inputAlt: HTMLElement = altWrap.querySelector('.e-img-alt') as HTMLElement;
            const altArgs: IImageNotifyArgs = {
                args: e.args, selfImage: this, selection: e.selection, selectNode: e.selectNode,
                alt: inputAlt
            };
            this.dialogObj.setProperties({
                width: '290px', header: altHeader, content: altWrap,
                buttons: [{
                    // eslint-disable-next-line
                    click: (e: MouseEvent) => {
                        this.insertAlt(altArgs);
                    },
                    buttonModel: {
                        content: linkUpdate, cssClass: 'e-flat e-update-alt' + this.parent.getCssClass(true), isPrimary: true
                    }
                }],
                cssClass: this.dialogObj.cssClass + ' e-rte-img-alt-dialog'
            });
            if (!isNOU(this.parent.cssClass)) {
                this.dialogObj.setProperties({ cssClass: this.parent.cssClass });
            }
            this.dialogObj.element.style.maxHeight = 'inherit';
            (this.dialogObj.content as HTMLElement).querySelector('input').focus();
        }
    }

    private insertAlt(e: IImageNotifyArgs): void {
        if (!isNOU(e.alt)) {
            e.selection.restore();
            if (this.parent.formatter.getUndoRedoStack().length === 0) {
                this.parent.formatter.saveData();
            }
            const altText: string = (e.alt as HTMLInputElement).value;
            this.parent.formatter.process(
                this.parent, e.args, e.args,
                {
                    altText: altText, selectNode: e.selectNode,
                    subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand
                });
            this.dialogObj.hide({ returnValue: false } as Event);
            if (this.parent.iframeSettings.enable) {
                this.parent.inputElement.focus({ preventScroll: true });
            }
            else {
                (e.selectNode[0] as HTMLElement).focus({ preventScroll: true });
            }
            e.selection.restore();
        }
    }
    private handleKeyDown(): void {
        const linkelem: HTMLElement = this.parent.element.querySelector('#' + this.rteID + '_image_dialog-content');
        const linkUrl: HTMLElement = linkelem.querySelector('.e-img-link');
        if (linkUrl.classList.contains('e-error') && ((linkUrl as HTMLInputElement).value.length >= 1 && (linkUrl as HTMLInputElement).value.trim() !== ' ')) {
            removeClass([linkUrl], 'e-error');
        }
    }
    private insertlink(e: IImageNotifyArgs): void {
        if (e.selectNode[0].nodeName !== 'IMG') {
            return;
        }
        let url: string = (e.link as HTMLInputElement).value;
        if (url.trim() === '') {
            addClass([e.link], 'e-error');
            (e.link as HTMLInputElement).setSelectionRange(0, url.length);
            (e.link as HTMLInputElement).focus();
            EventHandler.add(e.link, 'input', this.handleKeyDown, this);
            return;
        } else {
            EventHandler.remove(e.link, 'input', this.handleKeyDown);
            removeClass([e.link], 'e-error');
        }
        if (!this.isUrl(url)) {
            if (!this.parent.enableAutoUrl) {
                url = url.indexOf('http') > -1 ? url : 'http://' + url;
            }
        } else {
            removeClass([e.link], 'e-error');
        }
        const proxy: Image = e.selfImage;
        if (proxy.parent.editorMode === 'HTML') {
            e.selection.restore();
        }
        if (proxy.parent.formatter.getUndoRedoStack().length === 0) {
            proxy.parent.formatter.saveData();
        }
        if (e.selectNode[0].parentElement.nodeName === 'A') {
            proxy.parent.formatter.process(
                proxy.parent, e.args, e.args,
                {
                    url: url, target: proxy.checkBoxObj.checked ? '_blank' : null, ariaLabel: proxy.checkBoxObj.checked ? this.i10n.getConstant('imageLinkAriaLabel') : null, selectNode: e.selectNode,
                    subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand
                });
            proxy.dialogObj.hide({ returnValue: true } as Event);
            return;
        }
        proxy.parent.formatter.process(
            proxy.parent, e.args, e.args,
            {
                url: url, target: proxy.checkBoxObj.checked ? '_blank' : null, ariaLabel: proxy.checkBoxObj.checked ? this.i10n.getConstant('imageLinkAriaLabel') : null, selectNode: e.selectNode,
                subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand, selection: e.selection
            });
        const captionEle: Element = closest(e.selectNode[0], '.e-img-caption');
        if (captionEle) {
            const captionSpan: Element = select('.' + classes.CLS_IMG_INNER, captionEle);
            if (captionEle) {
                (captionSpan as HTMLElement).focus();
            }
        }
        proxy.dialogObj.hide({ returnValue: false } as Event);
    }
    private isUrl(url: string): boolean {
        const regExp: RegExpConstructor = RegExp;
        const regexp: RegExp = new regExp('(ftp|http|https)://(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(/|/([\\w#!:.?+=&%@\\-\\/]))?', 'gi');
        return regexp.test(url);
    }
    private deleteImg(e: IImageNotifyArgs, keyCode?: number): void {
        if (e.selectNode[0].nodeName !== 'IMG') { return; }
        const args: AfterImageDeleteEventArgs = {
            element: e.selectNode[0],
            src: (e.selectNode[0] as HTMLElement).getAttribute('src')
        };
        if (this.parent.formatter.getUndoRedoStack().length === 0) {
            this.parent.formatter.saveData();
        }
        let restoreStartElement: Node = e.selection.range.startContainer;
        if (e.selection.range.startContainer.nodeName === 'SPAN' &&
            (restoreStartElement as HTMLElement).classList.contains('e-img-wrap') &&
            (restoreStartElement as HTMLElement).parentElement.classList.contains('e-img-caption')) {
            restoreStartElement = (restoreStartElement as HTMLElement).parentElement;
            if (!isNOU(restoreStartElement.previousSibling)) {
                let lastNode: Node = restoreStartElement.previousSibling;
                while (lastNode.nodeName !== '#text' && lastNode.nodeName !== 'BR') {
                    lastNode = lastNode.lastChild;
                }
                this.parent.formatter.editorManager.nodeSelection.setCursorPoint(
                    this.contentModule.getDocument(), lastNode as Element,
                    lastNode.nodeName !== 'BR' ? lastNode.textContent.length : 0);
            } else if (!isNOU(restoreStartElement.nextSibling)) {
                let firstNode: Node = restoreStartElement.nextSibling;
                while (firstNode.nodeName !== '#text' && firstNode.nodeName !== 'BR') {
                    firstNode = firstNode.firstChild;
                }
                this.parent.formatter.editorManager.nodeSelection.setCursorPoint(
                    this.contentModule.getDocument(), firstNode as Element, 0);
            }
        } else {
            e.selection.restore();
        }
        if (this.contentModule.getEditPanel().querySelector('.e-img-resize')) {
            this.removeResizeEle();
        }
        this.parent.formatter.process(
            this.parent, e.args, e.args,
            {
                selectNode: e.selectNode,
                captionClass: classes.CLS_CAPTION,
                subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand
            });
        if (this.quickToolObj && document.body.contains(this.quickToolObj.imageQTBar.element)) {
            this.quickToolObj.imageQTBar.hidePopup();
        }
        this.cancelResizeAction();
        if (isNOU(keyCode)) {
            this.parent.trigger(events.afterImageDelete, args);
        }
    }

    private caption(e: IImageNotifyArgs): void {
        const selectNode: HTMLElement = e.selectNode[0] as HTMLElement;
        if (selectNode.nodeName !== 'IMG') {
            return;
        }
        e.selection.restore();
        if (this.parent.formatter.getUndoRedoStack().length === 0) {
            this.parent.formatter.saveData();
        }
        this.cancelResizeAction();
        addClass([selectNode], 'e-rte-image');
        const subCommand: string = ((e.args as ClickEventArgs).item) ?
            ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand : 'Caption';
        if (!isNOU(closest(selectNode, '.' + classes.CLS_CAPTION))) {
            detach(closest(selectNode, '.' + classes.CLS_CAPTION));
            if (Browser.isIE) {
                (this.contentModule.getEditPanel() as HTMLElement).focus();
                e.selection.restore();
            }
            if (selectNode.parentElement.tagName === 'A') {
                this.parent.formatter.process(
                    this.parent, e.args, e.args,
                    { insertElement: selectNode.parentElement, selectNode: e.selectNode, subCommand: subCommand });
            } else {
                this.parent.formatter.process(
                    this.parent, e.args, e.args, { insertElement: selectNode, selectNode: e.selectNode, subCommand: subCommand });
            }
        } else {
            this.captionEle = this.parent.createElement('span', {
                className: classes.CLS_CAPTION + ' ' + classes.CLS_RTE_CAPTION + this.parent.getCssClass(true),
                attrs: { contenteditable: 'false', draggable: 'false', style: 'width:' + this.parent.insertImageSettings.width }
            });
            const imgWrap: HTMLElement = this.parent.createElement('span', { className: 'e-img-wrap' + this.parent.getCssClass(true) });
            const imgInner: HTMLElement = this.parent.createElement('span', {
                className: 'e-img-inner' + this.parent.getCssClass(true),
                attrs: { contenteditable: 'true' }
            });
            const parent: HTMLElement = e.selectNode[0].parentElement;
            if (parent.tagName === 'A') {
                parent.setAttribute('contenteditable', 'true');
            }
            imgWrap.appendChild(parent.tagName === 'A' ? parent : e.selectNode[0]);
            imgWrap.appendChild(imgInner);
            const imgCaption: string = this.i10n.getConstant('imageCaption');
            imgInner.innerHTML = imgCaption;
            this.captionEle.appendChild(imgWrap);
            if (selectNode.classList.contains(classes.CLS_IMGINLINE)) {
                addClass([this.captionEle], classes.CLS_CAPINLINE);
            }
            if (selectNode.classList.contains(classes.CLS_IMGBREAK)) {
                addClass([this.captionEle], classes.CLS_IMGBREAK);
            }
            if (selectNode.classList.contains(classes.CLS_IMGLEFT)) {
                addClass([this.captionEle], classes.CLS_IMGLEFT);
            }
            if (selectNode.classList.contains(classes.CLS_IMGRIGHT)) {
                addClass([this.captionEle], classes.CLS_IMGRIGHT);
            }
            if (selectNode.classList.contains(classes.CLS_IMGCENTER)) {
                addClass([this.captionEle], classes.CLS_IMGCENTER);
            }
            this.parent.formatter.process(
                this.parent, e.args, e.args, { insertElement: this.captionEle, selectNode: e.selectNode, subCommand: subCommand });
            this.parent.formatter.editorManager.nodeSelection.setSelectionText(
                this.contentModule.getDocument(),
                imgInner.childNodes[0], imgInner.childNodes[0], 0, imgInner.childNodes[0].textContent.length);
        }
        if (this.quickToolObj && document.body.contains(this.quickToolObj.imageQTBar.element)) {
            this.quickToolObj.imageQTBar.hidePopup();
            removeClass([selectNode as HTMLElement], 'e-img-focus');
        }
    }
    private imageSize(e: IImageNotifyArgs): void {
        if (e.selectNode[0].nodeName !== 'IMG') {
            return;
        }
        this.imagDialog(e);
        if (!isNOU(this.dialogObj)) {
            const imgSizeHeader: string = this.i10n.getConstant('imageSizeHeader');
            const linkUpdate: string = this.i10n.getConstant('dialogUpdate');
            this.changedHeightValue = null;
            this.changedWidthValue = null;
            const dialogContent: HTMLElement = this.imgsizeInput(e);
            const selectObj: IImageNotifyArgs = { args: e.args, selfImage: this, selection: e.selection, selectNode: e.selectNode };
            this.dialogObj.setProperties({
                width: '290px', header: imgSizeHeader, content: dialogContent,
                buttons: [{
                    // eslint-disable-next-line
                    click: (e: MouseEvent) => {
                        this.insertSize(selectObj);
                    },
                    buttonModel: {
                        content: linkUpdate, cssClass: 'e-flat e-update-size' + this.parent.getCssClass(true), isPrimary: true
                    }
                }],
                cssClass: this.dialogObj.cssClass + ' e-rte-img-size-dialog'
            });
            if (!isNOU(this.parent.cssClass)) {
                this.dialogObj.setProperties({ cssClass: this.parent.cssClass });
            }
            this.dialogObj.element.style.maxHeight = 'inherit';
            (this.dialogObj.content as HTMLElement).querySelector('input').focus();
        }
    }
    private break(e: IImageNotifyArgs): void {
        if (e.selectNode[0].nodeName !== 'IMG') {
            return;
        }
        const subCommand: string = ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand;
        this.parent.formatter.process(this.parent, e.args, e.args, { selectNode: e.selectNode, subCommand: subCommand });
    }
    private inline(e: IImageNotifyArgs): void {
        if (e.selectNode[0].nodeName !== 'IMG') {
            return;
        }
        const subCommand: string = ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand;
        this.parent.formatter.process(this.parent, e.args, e.args, { selectNode: e.selectNode, subCommand: subCommand });
    }
    private alignImage(e: IImageNotifyArgs): void {
        const subCommand: string = ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand;
        this.parent.formatter.process(this.parent, e.args, e.args, { selectNode: e.selectNode, subCommand: subCommand });
    }
    private clearDialogObj(): void {
        if (this.uploadObj && !this.uploadObj.isDestroyed) {
            this.uploadObj.destroy();
            detach(this.uploadObj.element);
            this.uploadObj = null;
        }
        if (this.checkBoxObj && !this.checkBoxObj.isDestroyed) {
            this.checkBoxObj.destroy();
            detach(this.checkBoxObj.element);
            this.checkBoxObj = null;
        }
        if (this.popupObj && !this.popupObj.isDestroyed) {
            this.popupObj.destroy();
            detach(this.popupObj.element);
            this.popupObj = null;
        }
        if (this.widthNum && !this.widthNum.isDestroyed) {
            this.widthNum.destroy();
            detach(this.widthNum.element);
            this.widthNum = null;
        }
        if (this.heightNum && !this.heightNum.isDestroyed) {
            this.heightNum.destroy();
            detach(this.heightNum.element);
            this.heightNum = null;
        }
        if (this.browseButton && !this.browseButton.isDestroyed) {
            this.browseButton.destroy();
            detach(this.browseButton.element);
            this.browseButton = null;
        }
        if (this.dialogObj && !this.dialogObj.isDestroyed) {
            if ((this.dialogObj.element && this.dialogObj.element.querySelector('.e-img-link') && this.dialogObj.element.querySelector('.e-img-link') !== null)) {
                EventHandler.remove(this.dialogObj.element.querySelector('.e-img-link'), 'input', this.handleKeyDown);
            }
            this.dialogObj.destroy();
            detach(this.dialogObj.element);
            this.dialogObj = null;
        }
    }
    private imagDialog(e: IImageNotifyArgs): void {
        if (this.dialogObj) {
            this.dialogObj.hide({ returnValue: true } as Event);
            return;
        }
        const imgDialog: HTMLElement = this.parent.createElement('div', { className: 'e-rte-img-dialog' + this.parent.getCssClass(true), id: this.rteID + '_image' });
        this.parent.rootContainer.appendChild(imgDialog);
        const imgInsert: string = this.i10n.getConstant('dialogInsert');
        const imglinkCancel: string = this.i10n.getConstant('dialogCancel');
        const imgHeader: string = this.i10n.getConstant('imageHeader');
        const selection: NodeSelection = e.selection;
        const selectObj: IImageNotifyArgs = { selfImage: this, selection: e.selection, args: e.args, selectParent: e.selectParent };
        const dialogModel: DialogModel = {
            header: imgHeader,
            cssClass: classes.CLS_RTE_ELEMENTS + this.parent.getCssClass(true),
            enableRtl: this.parent.enableRtl,
            locale: this.parent.locale,
            showCloseIcon: true, closeOnEscape: true, width: (Browser.isDevice) ? '290px' : '340px',
            isModal: (Browser.isDevice as boolean),
            position: { X: 'center', Y: (Browser.isDevice) ? 'center' : 'top' },
            buttons: [{
                click: this.insertImageUrl.bind(selectObj),
                buttonModel: { content: imgInsert, cssClass: 'e-flat e-insertImage' + this.parent.getCssClass(true), isPrimary: true, disabled: this.parent.editorMode === 'Markdown' ? false : true }
            },
            {
                click: this.cancelDialog.bind(this),
                buttonModel: { cssClass: 'e-flat e-cancel' + this.parent.getCssClass(true), content: imglinkCancel }
            }],
            target: (Browser.isDevice) ? document.body : this.parent.element,
            animationSettings: { effect: 'None' },
            close: (event: BeforeCloseEventArgs) => {
                if (event && event.closedBy !== 'user action' && this.uploadObj && this.uploadObj.filesData.length > 0) {
                    this.uploadObj.remove();
                }
                this.parent.isBlur = false;
                if (event && !isNOU(event.event) && event.event.returnValue) {
                    if (this.parent.editorMode === 'HTML') {
                        selection.restore();
                    } else {
                        this.parent.formatter.editorManager.markdownSelection.restore(
                            this.parent.contentModule.getEditPanel() as HTMLTextAreaElement);
                    }
                }
                this.clearDialogObj();
                this.dialogRenderObj.close(event);
            }
        };
        const dialogContent: HTMLElement = this.parent.createElement('div', { className: 'e-img-content' + this.parent.getCssClass(true) });
        if ((!isNOU(this.parent.insertImageSettings.path) && this.parent.editorMode === 'Markdown')
            || this.parent.editorMode === 'HTML') {
            dialogContent.appendChild(this.imgUpload(e));
        }
        const linkHeader: HTMLElement = this.parent.createElement('div', { className: 'e-linkheader' + this.parent.getCssClass(true) });
        const linkHeaderText: string = this.i10n.getConstant('imageLinkHeader');
        if (this.parent.editorMode === 'HTML') {
            linkHeader.innerHTML = linkHeaderText;
        } else {
            linkHeader.innerHTML = this.i10n.getConstant('mdimageLink');
        }
        dialogContent.appendChild(linkHeader);
        dialogContent.appendChild(this.imageUrlPopup(e));
        if (e.selectNode && e.selectNode[0].nodeName === 'IMG') {
            dialogModel.header = this.parent.localeObj.getConstant('editImageHeader');
            dialogModel.content = dialogContent;
            dialogModel.buttons[0].buttonModel.cssClass = dialogModel.buttons[0].buttonModel.cssClass + ' e-updateImage';
        } else {
            dialogModel.content = dialogContent;
        }
        this.dialogObj = this.dialogRenderObj.render(dialogModel);
        this.dialogObj.createElement = this.parent.createElement;
        this.dialogObj.appendTo(imgDialog);
        if (isNOU(this.dialogObj)) { return; }
        if (e.selectNode && e.selectNode[0].nodeName === 'IMG' && (e.name === 'insertImage')) {
            this.dialogObj.element.querySelector('.e-insertImage').textContent = this.parent.localeObj.getConstant('dialogUpdate');
        }
        imgDialog.style.maxHeight = 'inherit';
        if (this.quickToolObj) {
            if (this.quickToolObj.imageQTBar && document.body.contains(this.quickToolObj.imageQTBar.element)) {
                this.quickToolObj.imageQTBar.hidePopup();
                if (!isNOU(e.selectParent as Node[])) {
                    removeClass([e.selectParent[0] as HTMLElement], 'e-img-focus');
                }
            }
            if (this.quickToolObj.inlineQTBar && document.body.contains(this.quickToolObj.inlineQTBar.element)) {
                this.quickToolObj.inlineQTBar.hidePopup();
            }
            if (this.quickToolObj.textQTBar && this.parent.element.ownerDocument.body.contains(this.quickToolObj.textQTBar.element)) {
                this.quickToolObj.textQTBar.hidePopup();
            }
        }
    }

    private cancelDialog(): void {
        this.parent.isBlur = false;
        if (!isNOU(this.uploadObj) && this.uploadObj.filesData.length > 0) {
            this.uploadObj.remove();
        }
        this.dialogObj.hide({ returnValue: true } as Event);
    }

    private onDocumentClick(e: MouseEvent): void {
        const target: HTMLElement = <HTMLElement>e.target;
        if (isNOU(this.contentModule.getEditPanel())) {
            return;
        }
        if (target.nodeName === 'IMG') {
            this.imgEle = target as HTMLImageElement;
        }
        if (!this.parent) { return; }
        if (target.nodeName !== '#document') {
            this.parent.currentTarget = <HTMLElement>e.target;
        }
        if (!isNOU(this.dialogObj) && ((
            // eslint-disable-next-line
            !closest(target, '[id=' + "'" + this.dialogObj.element.id + "'" + ']') && this.parent.toolbarSettings.enable && this.parent.getToolbarElement() &&
            !this.parent.getToolbarElement().contains(e.target as Node)) ||
            (this.parent.getToolbarElement() && this.parent.getToolbarElement().contains(e.target as Node) &&
                !closest(target, '#' + this.parent.getID() + '_toolbar_Image') &&
                !target.querySelector('#' + this.parent.getID() + '_toolbar_Image')))
        ) {
            /* eslint-disable */
            if (e.offsetX > (e.target as HTMLImageElement).clientWidth || e.offsetY > (e.target as HTMLImageElement).clientHeight) {
            } else {
                this.parent.notify(events.documentClickClosedBy, { closedBy: "outside click" });
                this.dialogObj.hide({ returnValue: true } as Event);
                this.parent.isBlur = true;
                dispatchEvent(this.parent.element, 'focusout');
            }
            /* eslint-enable */
        }
        if (!(this.parent.iframeSettings.enable && !isNOU(this.parent.currentTarget) && this.parent.currentTarget.nodeName === 'IMG') &&
            (e.target as HTMLElement).tagName !== 'IMG' && this.imgResizeDiv && !(this.quickToolObj &&
                this.quickToolObj.imageQTBar && this.quickToolObj.imageQTBar.element.contains(e.target as HTMLElement)) &&
            this.contentModule.getEditPanel().contains(this.imgResizeDiv)) {
            this.cancelResizeAction();
        }
        if (this.contentModule.getEditPanel().querySelector('.e-img-resize') && !(this.parent.iframeSettings.enable && this.parent.currentTarget.nodeName === 'IMG')) {
            if (target.tagName !== 'IMG') { this.removeResizeEle(); }
            if (target.tagName !== 'IMG' && !isNOU(this.imgEle)) {
                this.imgEle.style.outline = '';
            } else if (!isNOU(this.prevSelectedImgEle) && this.prevSelectedImgEle !== target) {
                this.prevSelectedImgEle.style.outline = '';
            }
        }
        if (target.tagName !== 'IMG') {
            const items: NodeListOf<HTMLElement> = this.contentModule.getEditPanel().querySelectorAll('img');
            for (let i: number = 0; i < items.length; i++) {
                removeClass([items[i as number]], 'e-img-focus');
                removeClass([items[i as number]], 'e-resize');
            }
        }
        if (this.parent.inlineMode.enable && target && this.dialogObj && !closest(target, '#' + this.dialogObj.element.id)) {
            this.dialogObj.hide();
        }
    }

    private removeResizeEle(): void {
        EventHandler.remove(this.contentModule.getDocument(), Browser.touchMoveEvent, this.resizing);
        EventHandler.remove(this.contentModule.getDocument(), Browser.touchEndEvent, this.resizeEnd);
        detach(this.contentModule.getEditPanel().querySelector('.e-img-resize'));
    }

    private onWindowResize(): void {
        if (!isNOU(this.contentModule) && !isNOU(this.contentModule.getEditPanel().querySelector('.e-img-resize'))) {
            this.cancelResizeAction();
        }
    }

    private imageUrlPopup(e: IImageNotifyArgs): HTMLElement {
        const imgUrl: HTMLElement = this.parent.createElement('div', { className: 'imgUrl' + this.parent.getCssClass(true) });
        const placeUrl: string = this.i10n.getConstant('imageUrl');
        this.inputUrl = this.parent.createElement('input', {
            className: 'e-input e-img-url' + this.parent.getCssClass(true),
            attrs: { placeholder: placeUrl, spellcheck: 'false', 'aria-label': this.i10n.getConstant('imageLinkHeader') }
        });
        this.inputUrl.addEventListener('input', () => {
            if (!isNOU(this.inputUrl)) {
                if ((this.inputUrl as HTMLInputElement).value.length === 0) {
                    (this.dialogObj.getButtons(0) as Button).element.disabled = true;
                } else {
                    (this.dialogObj.getButtons(0) as Button).element.removeAttribute('disabled');
                }
            }
        });
        if (e.selectNode && e.selectNode[0].nodeName === 'IMG') {
            const regex: RegExp = new RegExp(/([^\S]|^)(((https?:\/\/)|(www\.))(\S+))/gi);
            (this.inputUrl as HTMLInputElement).value = (e.selectNode[0] as HTMLImageElement).src.match(regex) ? (e.selectNode[0] as HTMLImageElement).src : '';
        }
        imgUrl.appendChild(this.inputUrl);
        return imgUrl;
    }

    private insertImageUrl(e: MouseEvent): void {
        const proxy: Image = (this as IImageNotifyArgs).selfImage;
        proxy.isImgUploaded = false;
        let url: string = (proxy.inputUrl as HTMLInputElement).value;
        if (e.target && (e.target as HTMLElement).nodeName === 'BUTTON' && (e.target as HTMLElement).classList.contains('e-updateImage')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const element: HTMLElement = (this as any).selectNode && (this as any).selectNode[0] && (this as any).selectNode[0].nodeName === 'IMG' ?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this as any).selectNode[0] as HTMLElement : null;
            const args: AfterImageDeleteEventArgs = {
                element: element,
                src: url
            };
            proxy.parent.trigger(events.afterImageDelete, args);
        }
        if (proxy.parent.editorMode === 'Markdown' && url === '') {
            url = 'http://';
        }
        if (proxy.parent.formatter.getUndoRedoStack().length === 0) {
            proxy.parent.formatter.saveData();
        }
        const previousSubCommand: string = ((this as IImageNotifyArgs).args as ActionBeginEventArgs).item.subCommand;
        ((this as IImageNotifyArgs).args as ActionBeginEventArgs).item.subCommand = (e.target as HTMLElement).innerHTML === 'Update' ? 'Replace' : ((this as IImageNotifyArgs).args as ActionBeginEventArgs).item.subCommand;
        if (!isNOU(proxy.uploadUrl) && proxy.uploadUrl.url !== '') {
            proxy.uploadUrl.cssClass = (((this as IImageNotifyArgs).selectParent && ((this as IImageNotifyArgs).selectParent[0] as HTMLElement).classList && ((this as IImageNotifyArgs).selectParent[0] as HTMLElement).classList.contains('e-imgbreak') === true)) ? classes.CLS_IMGBREAK : (proxy.parent.insertImageSettings.display === 'inline' ?
                classes.CLS_IMGINLINE : classes.CLS_IMGBREAK);
            proxy.dialogObj.hide({ returnValue: false } as Event);
            if (proxy.dialogObj !== null) {
                return;
            }
            proxy.parent.formatter.process(
                proxy.parent, (this as IImageNotifyArgs).args,
                ((this as IImageNotifyArgs).args as ClickEventArgs).originalEvent, proxy.uploadUrl);
            proxy.uploadUrl.url = '';
            if (proxy.contentModule.getEditPanel().querySelector('.e-img-resize')) {
                (proxy.imgEle as HTMLElement).style.outline = '';
                proxy.removeResizeEle();
            }
        } else if (url !== '') {
            if (proxy.parent.editorMode === 'HTML' && isNOU(
                closest(
                    // eslint-disable-next-line
                    (this as IImageNotifyArgs).selection.range.startContainer.parentNode, '[id=' + "'" + proxy.contentModule.getPanel().id + "'" + ']'))) {
                if (proxy.contentModule.getPanel().tagName === 'IFRAME' && ((this as IImageNotifyArgs).args as ActionBeginEventArgs).item.subCommand === 'Replace') {
                    (proxy.contentModule.getPanel() as HTMLElement);
                } else {
                    (proxy.contentModule.getEditPanel() as HTMLElement);
                }
                const range: Range = proxy.parent.formatter.editorManager.nodeSelection.getRange(proxy.contentModule.getDocument());
                (this as IImageNotifyArgs).selection = proxy.parent.formatter.editorManager.nodeSelection.save(
                    range, proxy.contentModule.getDocument());
                (this as IImageNotifyArgs).selectParent = proxy.parent.formatter.editorManager.nodeSelection.getParentNodeCollection(range);
            }
            const regex: RegExp = /[\w-]+.(jpg|png|jpeg|gif)/g;
            const matchUrl: string = (!isNOU(url.match(regex)) && proxy.parent.editorMode === 'HTML') ? url.match(regex)[0] : '';
            const value: IImageCommandsArgs = {
                cssClass: (((this as IImageNotifyArgs).selectParent && ((this as IImageNotifyArgs).selectParent[0] as HTMLElement).classList && ((this as IImageNotifyArgs).selectParent[0] as HTMLElement).classList.contains('e-imgbreak') === true)) ? classes.CLS_IMGBREAK : (proxy.parent.insertImageSettings.display === 'inline' ? classes.CLS_IMGINLINE : classes.CLS_IMGBREAK),
                url: url, selection: (this as IImageNotifyArgs).selection, altText: matchUrl,
                selectParent: (this as IImageNotifyArgs).selectParent, width: {
                    width: proxy.parent.insertImageSettings.width, minWidth: proxy.parent.insertImageSettings.minWidth,
                    maxWidth: proxy.parent.getInsertImgMaxWidth()
                },
                height: {
                    height: proxy.parent.insertImageSettings.height, minHeight: proxy.parent.insertImageSettings.minHeight,
                    maxHeight: proxy.parent.insertImageSettings.maxHeight
                }
            };
            proxy.dialogObj.hide({ returnValue: false } as Event);
            if (proxy.dialogObj !== null) {
                return;
            }
            proxy.parent.formatter.process(
                proxy.parent, (this as IImageNotifyArgs).args, ((this as IImageNotifyArgs).args as ClickEventArgs).originalEvent, value);
        }
        ((this as IImageNotifyArgs).args as ActionBeginEventArgs).item.subCommand = previousSubCommand;
    }

    private imgsizeInput(e: IImageNotifyArgs): HTMLElement {
        const selectNode: HTMLImageElement = (e as IImageNotifyArgs).selectNode[0] as HTMLImageElement;
        const imgHeight: string = this.i10n.getConstant('imageHeight');
        const imgWidth: string = this.i10n.getConstant('imageWidth');
        const imgSizeWrap: HTMLElement = this.parent.createElement('div', { className: 'e-img-sizewrap' + this.parent.getCssClass(true) });
        let widthVal: string = isNOU(this.changedWidthValue) && (selectNode.style.width.toString() === 'auto' ||
            selectNode.style.width !== '') ? selectNode.style.width : !isNOU(this.changedWidthValue) ?
                this.changedWidthValue : (parseInt(selectNode.getClientRects()[0].width.toString(), 10)).toString();
        let heightVal: string = isNOU(this.changedHeightValue) && (selectNode.style.height.toString() === 'auto' ||
                        selectNode.style.height !== '') ? selectNode.style.height : !isNOU(this.changedHeightValue) ?
                this.changedHeightValue : (parseInt(selectNode.getClientRects()[0].height.toString(), 10)).toString();
        if (selectNode.style.width === '' && widthVal === '') {
            widthVal = 'auto';
        }
        if (selectNode.style.height === '' && heightVal === '') {
            heightVal = 'auto';
        }
        this.changedWidthValue = null;
        this.changedHeightValue = null;
        const content: string = '<div class="e-rte-label' + this.parent.getCssClass(true) + '"><label>' + imgWidth +
            '</label></div><div class="e-rte-field' + this.parent.getCssClass(true) + '"><input type="text" id="imgwidth" class="e-img-width' + this.parent.getCssClass(true) + '"/></div>' +
            '<div class="e-rte-label' + this.parent.getCssClass(true) + '">' + '<label>' + imgHeight + '</label></div><div class="e-rte-field' + this.parent.getCssClass(true) + '"> ' +
            '<input type="text" id="imgheight" class="e-img-height' + this.parent.getCssClass(true) + '"/></div>';
        const contentElem: DocumentFragment = parseHtml(content);
        contentElem.getElementById('imgwidth').setAttribute('value', widthVal);
        contentElem.getElementById('imgheight').setAttribute('value', heightVal);
        imgSizeWrap.appendChild(contentElem);
        this.widthNum = new TextBox({
            value: formatUnit(widthVal as string),
            enableRtl: this.parent.enableRtl,
            cssClass: this.parent.getCssClass(),
            input: (e: InputEventArgs) => {
                this.inputWidthValue = formatUnit(this.inputValue(e.value));
            }
        });
        this.widthNum.createElement = this.parent.createElement;
        this.widthNum.appendTo(imgSizeWrap.querySelector('#imgwidth') as HTMLElement);
        this.heightNum = new TextBox({
            value: formatUnit(heightVal as string),
            enableRtl: this.parent.enableRtl,
            cssClass: this.parent.getCssClass(),
            input: (e: InputEventArgs) => {
                this.inputHeightValue = formatUnit(this.inputValue(e.value));
            }
        });
        this.heightNum.createElement = this.parent.createElement;
        this.heightNum.appendTo(imgSizeWrap.querySelector('#imgheight') as HTMLElement);
        return imgSizeWrap;
    }

    private inputValue(value: string): string {
        if (value === 'auto' || value.indexOf('%') !== -1 || value.indexOf('px') !== -1
            || value.match(/(\d+)/)) {
            return value;
        }
        else {
            return 'auto';
        }
    }

    private insertSize(e: IImageNotifyArgs): void {
        e.selection.restore();
        const proxy: Image = e.selfImage;
        if (proxy.parent.formatter.getUndoRedoStack().length === 0) {
            proxy.parent.formatter.saveData();
        }
        const dialogEle: Element = proxy.dialogObj.element;
        this.changedWidthValue = this.inputWidthValue;
        this.changedHeightValue = this.inputHeightValue;
        const width: string = (dialogEle.querySelector('.e-img-width') as HTMLInputElement).value;
        const height: string = (dialogEle.parentElement.querySelector('.e-img-height') as HTMLInputElement).value;
        proxy.parent.formatter.process(
            this.parent, e.args, e.args,
            {
                width: width, height: height, selectNode: e.selectNode,
                subCommand: ((e.args as ClickEventArgs).item as IDropDownItemModel).subCommand
            });
        if (this.imgResizeDiv) {
            proxy.imgResizePos(e.selectNode[0] as HTMLImageElement, this.imgResizeDiv);
        }
        proxy.dialogObj.hide({ returnValue: true } as Event);
        proxy.parent.inputElement.focus({ preventScroll: true });
    }

    private insertImage(e: IImageNotifyArgs): void {
        this.imagDialog(e);
        if (!isNOU(this.dialogObj)) {
            this.dialogObj.element.style.maxHeight = 'inherit';
            const dialogContent: HTMLElement = this.dialogObj.element.querySelector('.e-img-content');
            if (((!isNOU(this.parent.insertImageSettings.path) && this.parent.editorMode === 'Markdown')
                || this.parent.editorMode === 'HTML')) {
                (document.getElementById(this.rteID + '_insertImage') as HTMLElement).focus();
            } else {
                (dialogContent.querySelector('.e-img-url') as HTMLElement).focus();
            }
        }
    }

    private imgUpload(e: IImageNotifyArgs): HTMLElement {
        let save: NodeSelection;
        let selectParent: Node[];
        // eslint-disable-next-line
        const proxy: this = this;
        const iframe: boolean = proxy.parent.iframeSettings.enable;
        if (proxy.parent.editorMode === 'HTML' && (!iframe && isNOU(closest(e.selection.range.startContainer.parentNode, '[id='
            // eslint-disable-next-line
            + "'" + this.parent.contentModule.getPanel().id + "'" + ']'))
            || (iframe && !hasClass(e.selection.range.startContainer.parentNode.ownerDocument.querySelector('body'), 'e-lib')))) {
            (this.contentModule.getEditPanel() as HTMLElement).focus();
            const range: Range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
            save = this.parent.formatter.editorManager.nodeSelection.save(
                range, this.parent.contentModule.getDocument());
            selectParent = this.parent.formatter.editorManager.nodeSelection.getParentNodeCollection(range);
        } else {
            save = e.selection; selectParent = e.selectParent;
        }
        const uploadParentEle: HTMLElement = this.parent.createElement('div', { className: 'e-img-uploadwrap e-droparea' + this.parent.getCssClass(true) });
        const deviceImgUpMsg: string = this.i10n.getConstant('imageDeviceUploadMessage');
        const imgUpMsg: string = this.i10n.getConstant('imageUploadMessage');
        const span: HTMLElement = this.parent.createElement('span', { className: 'e-droptext' + this.parent.getCssClass(true) });
        const spanMsg: HTMLElement = this.parent.createElement('span', {
            className: 'e-rte-upload-text' + this.parent.getCssClass(true), innerHTML: ((Browser.isDevice) ? deviceImgUpMsg : imgUpMsg)
        });
        span.appendChild(spanMsg);
        const btnEle: HTMLElement = this.parent.createElement('button', {
            className: 'e-browsebtn' + this.parent.getCssClass(true), id: this.rteID + '_insertImage', attrs: { autofocus: 'true', type: 'button' }
        });
        span.appendChild(btnEle); uploadParentEle.appendChild(span);
        const browserMsg: string = this.i10n.getConstant('browse');
        this.browseButton = new Button({ content: browserMsg, enableRtl: this.parent.enableRtl });
        this.browseButton.isStringTemplate = true; this.browseButton.createElement = this.parent.createElement;
        this.browseButton.appendTo(btnEle);
        const btnClick: HTMLElement = (Browser.isDevice) ? span : btnEle;
        EventHandler.add(btnClick, 'click', this.fileSelect, this);
        const uploadEle: HTMLInputElement | HTMLElement = this.parent.createElement('input', {
            id: this.rteID + '_upload', attrs: { type: 'File', name: 'UploadFiles' }, className: this.parent.getCssClass()
        });
        uploadParentEle.appendChild(uploadEle);
        let altText: string;
        let selectArgs: SelectedEventArgs;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let filesData: FileInfo[];
        let previousFileInfo: FileInfo | null = null;
        this.uploadObj = new Uploader({
            asyncSettings: { saveUrl: this.parent.insertImageSettings.saveUrl, removeUrl: this.parent.insertImageSettings.removeUrl },
            dropArea: span, multiple: false, enableRtl: this.parent.enableRtl, cssClass: this.parent.getCssClass(),
            allowedExtensions: this.parent.insertImageSettings.allowedTypes.toString(),
            maxFileSize: this.parent.insertImageSettings.maxFileSize,
            selected: (e: SelectedEventArgs) => {
                proxy.isImgUploaded = true;
                selectArgs = e;
                filesData = e.filesData;
                this.parent.trigger(events.imageSelected, selectArgs, (selectArgs: SelectedEventArgs) => {
                    if (!selectArgs.cancel) {
                        if (isNOU(selectArgs.filesData[0])) {
                            return;
                        }
                        this.checkExtension(selectArgs.filesData[0]);
                        altText = selectArgs.filesData[0].name.replace(/\.[a-zA-Z0-9]+$/, '');
                        if (this.parent.editorMode === 'HTML' && isNOU(this.parent.insertImageSettings.path)) {
                            const reader: FileReader = new FileReader();
                            // eslint-disable-next-line
                            reader.addEventListener('load', (e: MouseEvent) => {
                                const url: string = this.parent.insertImageSettings.saveFormat === 'Base64' ? reader.result as string :
                                    URL.createObjectURL(convertToBlob(reader.result as string));
                                proxy.uploadUrl = {
                                    url: url, selection: save, altText: altText,
                                    selectParent: selectParent,
                                    width: {
                                        width: proxy.parent.insertImageSettings.width, minWidth: proxy.parent.insertImageSettings.minWidth,
                                        maxWidth: proxy.parent.getInsertImgMaxWidth()
                                    }, height: {
                                        height: proxy.parent.insertImageSettings.height,
                                        minHeight: proxy.parent.insertImageSettings.minHeight,
                                        maxHeight: proxy.parent.insertImageSettings.maxHeight
                                    }
                                };
                                proxy.inputUrl.setAttribute('disabled', 'true');
                                if (!isNOU(this.dialogObj)) {
                                    const button: Button = this.dialogObj.getButtons(0) as Button;
                                    if (!isNOU(button)) {
                                        if (isNOU(proxy.parent.insertImageSettings.saveUrl) && this.isAllowedTypes
                                            && selectArgs.filesData[0].size <= this.uploadObj.maxFileSize) {
                                            button.element.removeAttribute('disabled');
                                        } else {
                                            button.element.setAttribute('disabled', 'true');
                                        }
                                    }
                                }
                            });
                            reader.readAsDataURL(selectArgs.filesData[0].rawFile as Blob);
                        }
                    }
                });
            },
            beforeUpload: (args: BeforeUploadEventArgs) => {
                this.parent.trigger(events.beforeImageUpload, args);
            },
            uploading: (e: UploadingEventArgs) => {
                if (!this.parent.isServerRendered) {
                    this.parent.trigger(events.imageUploading, e);
                }
            },
            success: (e: ImageSuccessEventArgs) => {
                e.detectImageSource = ImageInputSource.Uploaded;
                this.parent.trigger(events.imageUploadSuccess, e, (e: ImageSuccessEventArgs) => {
                    let isReplaceWithoutRemovalAction: boolean = false;
                    if (!isNOU(previousFileInfo) && previousFileInfo.name !== e.file.name && e.operation.toLocaleLowerCase() === 'remove') {
                        isReplaceWithoutRemovalAction = true;
                    }
                    if (!isNOU(this.parent.insertImageSettings.path) && !isReplaceWithoutRemovalAction) {
                        const url: string = this.parent.insertImageSettings.path + (e).file.name;
                        // Update the URL of the previously uploaded image
                        if (!isNOU(previousFileInfo) && (e as SuccessEventArgs).operation === 'upload') {
                            this.uploadObj.remove(previousFileInfo);
                        }
                        // eslint-disable-next-line
                        const value: IImageCommandsArgs = { url: url, selection: save };
                        proxy.uploadUrl = {
                            url: url, selection: save, altText: altText, selectParent: selectParent,
                            width: {
                                width: proxy.parent.insertImageSettings.width, minWidth: proxy.parent.insertImageSettings.minWidth,
                                maxWidth: proxy.parent.getInsertImgMaxWidth()
                            }, height: {
                                height: proxy.parent.insertImageSettings.height, minHeight: proxy.parent.insertImageSettings.minHeight,
                                maxHeight: proxy.parent.insertImageSettings.maxHeight
                            }
                        };
                        if (e && e.operation && e.operation.toLocaleUpperCase() !== 'REMOVE') {
                            proxy.inputUrl.setAttribute('disabled', 'true');
                        }
                        previousFileInfo = e.file;
                    }
                    if ((e as ProgressEventArgs).operation === 'upload' && !isNOU(this.dialogObj)) {
                        (this.dialogObj.getButtons(0) as Button).element.removeAttribute('disabled');
                    }
                });
            },
            failure: (e: ImageFailedEventArgs) => {
                this.parent.trigger(events.imageUploadFailed, e);
            },
            removing: (removeEventArgs: object) => {
                // eslint-disable-next-line
                this.parent.trigger(events.imageRemoving, removeEventArgs, (e: RemovingEventArgs) => {
                    proxy.isImgUploaded = false;
                    (this.dialogObj.getButtons(0) as Button).element.disabled = true;
                    proxy.inputUrl.removeAttribute('disabled'); if (proxy.uploadUrl) {
                        proxy.uploadUrl.url = '';
                    }
                });
            }
        });
        this.uploadObj.isStringTemplate = true; this.uploadObj.createElement = this.parent.createElement;
        this.uploadObj.appendTo(uploadEle); return uploadParentEle;
    }
    private checkExtension(e: FileInfo): void {
        if (this.uploadObj.allowedExtensions) {
            if (e.type) {
                if (this.uploadObj.allowedExtensions.toLocaleLowerCase().indexOf(('.' + e.type).toLocaleLowerCase()) === -1) {
                    (this.dialogObj.getButtons(0) as Button).element.setAttribute('disabled', 'disabled');
                    this.isAllowedTypes = false;
                } else {
                    this.isAllowedTypes = true;
                }
            }
        }
    }
    private fileSelect(): boolean {
        this.dialogObj.element.getElementsByClassName('e-file-select-wrap')[0].querySelector('button').click();
        return false;
    }
    private dragStart(e: DragEvent): void | boolean {
        if ((e.target as HTMLElement).nodeName === 'IMG') {
            e.dataTransfer.effectAllowed = 'copyMove';
            (e.target as HTMLElement).classList.add(CLS_RTE_DRAG_IMAGE);
        } else {
            return true;
        }
    }

    private dragEnter(e?: DragEvent): void {
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }
    private dragOver(e?: DragEvent): void | boolean {
        if ((Browser.info.name === 'edge' && e.dataTransfer.items[0].type.split('/')[0].indexOf('image') > -1) ||
            (Browser.isIE && e.dataTransfer.types[0] === 'Files')) {
            e.preventDefault();
        } else {
            return true;
        }
    }

    /**
     * Used to set range When drop an image
     *
     * @param {ImageDropEventArgs} args - specifies the image arguments.
     * @returns {void}
     */
    private dragDrop(args: ImageDropEventArgs): void {
        this.parent.trigger(events.beforeImageDrop, args, (e: ImageDropEventArgs) => {
            const imgElement: HTMLElement = this.parent.inputElement.ownerDocument.querySelector('.' + CLS_RTE_DRAG_IMAGE);
            const isImgOrFileDrop: boolean = (imgElement && imgElement.tagName === 'IMG') || e.dataTransfer.files.length > 0;
            if (!e.cancel && isImgOrFileDrop) {
                if (closest((e.target as HTMLElement), '#' + this.parent.getID() + '_toolbar') ||
                    this.parent.inputElement.contentEditable === 'false') {
                    e.preventDefault();
                    return;
                }
                if (this.parent.element.querySelector('.' + classes.CLS_IMG_RESIZE)) {
                    detach(this.imgResizeDiv);
                }
                e.preventDefault();
                let range: Range;
                if (this.contentModule.getDocument().caretRangeFromPoint) { //For chrome
                    range = this.contentModule.getDocument().caretRangeFromPoint(e.clientX, e.clientY);
                } else if ((e.rangeParent)) { //For mozilla firefox
                    range = this.contentModule.getDocument().createRange();
                    range.setStart(e.rangeParent, e.rangeOffset);
                } else {
                    range = this.getDropRange(e.clientX, e.clientY); //For internet explorer
                }
                this.parent.notify(events.selectRange, { range: range });
                const uploadArea: HTMLElement = this.parent.element.querySelector('.' + classes.CLS_DROPAREA) as HTMLElement;
                if (uploadArea) {
                    return;
                }
                this.insertDragImage(e as DragEvent);
            } else {
                if (isImgOrFileDrop) {
                    e.preventDefault();
                }
            }
        });
    }

    /**
     * Used to calculate range on internet explorer
     *
     * @param {number} x - specifies the x range.
     * @param {number} y - specifies the y range.
     * @returns {void}
     */
    private getDropRange(x: number, y: number): Range {
        const startRange: Range = this.contentModule.getDocument().createRange();
        this.parent.formatter.editorManager.nodeSelection.setRange(this.contentModule.getDocument(), startRange);
        const elem: Element = this.contentModule.getDocument().elementFromPoint(x, y);
        const startNode: Node = (elem.childNodes.length > 0 ? elem.childNodes[0] : elem);
        let startCharIndexCharacter: number = 0;
        if ((this.parent.inputElement.firstChild as HTMLElement).innerHTML === '<br>') {
            startRange.setStart(startNode, startCharIndexCharacter);
            startRange.setEnd(startNode, startCharIndexCharacter);
        } else {
            let rangeRect: ClientRect;
            do {
                startCharIndexCharacter++;
                startRange.setStart(startNode, startCharIndexCharacter);
                startRange.setEnd(startNode, startCharIndexCharacter + 1);
                rangeRect = startRange.getBoundingClientRect();
            } while (rangeRect.left < x && startCharIndexCharacter < (startNode as Text).length - 1);
        }
        return startRange;
    }

    private insertDragImage(e: DragEvent): void {
        e.preventDefault();
        const activePopupElement: HTMLElement = this.parent.element.querySelector('' + classes.CLS_POPUP_OPEN);
        this.parent.notify(events.drop, { args: e });
        if (activePopupElement) {
            activePopupElement.classList.add(classes.CLS_HIDE);
        }
        const imgElement: HTMLElement = this.parent.inputElement.ownerDocument.querySelector('.' + CLS_RTE_DRAG_IMAGE);
        const actionBeginArgs: ActionBeginEventArgs = {
            requestType: 'Images',
            name: 'ImageDragAndDrop',
            cancel: false,
            originalEvent: e
        };
        if (e.dataTransfer.files.length > 0 && imgElement === null) { //For external image drag and drop
            if (e.dataTransfer.files.length > 1) {
                return;
            }
            const imgFiles: FileList = e.dataTransfer.files;
            const fileName: string = imgFiles[0].name;
            const imgType: string = fileName.substring(fileName.lastIndexOf('.'));
            const allowedTypes: string[] = this.parent.insertImageSettings.allowedTypes;
            for (let i: number = 0; i < allowedTypes.length; i++) {
                if (imgType.toLocaleLowerCase() === allowedTypes[i as number].toLowerCase()) {
                    if (this.parent.insertImageSettings.saveUrl) {
                        this.onSelect(e);
                    } else {
                        this.parent.trigger(events.actionBegin, actionBeginArgs, (actionBeginArgs: ActionBeginEventArgs) => {
                            if (!actionBeginArgs.cancel) {
                                const args: NotifyArgs = { args: e, text: '', file: imgFiles[0] };
                                e.preventDefault();
                                this.imagePaste(args);
                            } else {
                                actionBeginArgs.originalEvent.preventDefault();
                            }
                        });
                    }
                }
            }
        } else { //For internal image drag and drop
            this.parent.trigger(events.actionBegin, actionBeginArgs, (actionBeginArgs: ActionBeginEventArgs) => {
                if (!actionBeginArgs.cancel) {
                    const range: Range = this.parent.formatter.editorManager.nodeSelection.getRange(
                        this.parent.contentModule.getDocument());
                    if (imgElement && imgElement.tagName === 'IMG') {
                        const imgCaption: Element = imgElement.closest('.e-rte-img-caption');
                        if (!isNOU(imgCaption)) {
                            range.insertNode(imgCaption);
                        } else {
                            const anchorElement: HTMLElement = imgElement.closest('a');
                            //To check if the anchor has only one image element
                            const isAnchorValid: boolean = anchorElement && anchorElement.tagName === 'A' &&
                                this.hasOnlyImage(anchorElement);
                            if (isAnchorValid) {
                                range.insertNode(anchorElement);
                            } else {
                                if (imgElement.parentNode) {
                                    imgElement.parentNode.removeChild(imgElement);
                                    range.insertNode(imgElement);
                                }
                            }
                        }
                        imgElement.classList.remove(CLS_RTE_DRAG_IMAGE);
                        const imgArgs: ActionCompleteEventArgs = { elements: [imgElement] };
                        imgElement.addEventListener('load', () => {
                            this.parent.trigger(events.actionComplete, imgArgs);
                        });
                        this.parent.formatter.editorManager.nodeSelection.Clear(this.contentModule.getDocument());
                        const args: MouseEvent = e as MouseEvent;
                        if (this.parent.insertImageSettings.resize) {
                            this.resizeStart(args as PointerEvent, imgElement);
                        }
                        this.hideImageQuickToolbar();
                    }
                } else {
                    actionBeginArgs.originalEvent.preventDefault();
                }
            });
        }
    }

    private hasOnlyImage(anchor: HTMLElement): boolean {
        let imageFound: boolean = false;
        for (let i: number = 0; i < anchor.childNodes.length; i++) {
            const currentNode: Node = anchor.childNodes[i as number];
            if (currentNode.nodeType === Node.TEXT_NODE) {
                const text: string = currentNode.textContent.replace(/[\u200B\u200C\u200D]/g, '').trim(); // Remove zero-width spaces
                if (text !== '') {
                    return false; // Found non-empty text node, so it's invalid
                }
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                if ((currentNode as HTMLElement).tagName === 'IMG') {
                    if (imageFound) {
                        return false; // Found more than one image, so it's invalid
                    }
                    imageFound = true;
                } else {
                    return false; // Found a non-image element, so it's invalid
                }
            }
        }
        return imageFound; // Return true only if exactly one img was found
    }

    private onSelect(args: DragEvent): void {
        // eslint-disable-next-line
        const proxy: Image = this;
        const range: Range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
        const parentElement: HTMLElement = this.parent.createElement('ul', { className: classes.CLS_UPLOAD_FILES });
        this.parent.rootContainer.appendChild(parentElement);
        const validFiles: FileInfo = {
            name: args.dataTransfer.files[0].name,
            size: args.dataTransfer.files[0].size,
            status: '',
            statusCode: '',
            type: args.dataTransfer.files[0].type,
            rawFile: args.dataTransfer.files[0],
            validationMessages: {}
        };
        let isUrlPassed: boolean;
        const imageTag: HTMLImageElement = <HTMLImageElement>this.parent.createElement('IMG');
        imageTag.style.opacity = '0.5';
        imageTag.classList.add(classes.CLS_RTE_IMAGE);
        imageTag.classList.add(classes.CLS_IMGINLINE);
        imageTag.classList.add(CLS_RESIZE);
        const file: File = validFiles.rawFile as File;
        const reader: FileReader = new FileReader();
        reader.addEventListener('load', () => {
            const url: string = URL.createObjectURL(convertToBlob(reader.result as string));
            if (isNOU(proxy.parent.insertImageSettings.path) && !isUrlPassed) {
                imageTag.src = proxy.parent.insertImageSettings.saveFormat === 'Blob' ? url : reader.result as string;
            }
        });
        if (file) {
            reader.readAsDataURL(file);
        }
        const selection: NodeSelection = this.parent.formatter.editorManager.nodeSelection.save(
            range, this.parent.contentModule.getDocument());
        const imageCommand: IImageCommandsArgs = {
            cssClass: (this.parent.insertImageSettings.display === 'inline' ? classes.CLS_IMGINLINE : classes.CLS_IMGBREAK),
            url: !isNOU(proxy.parent.insertImageSettings.path) ? this.parent.insertImageSettings.path + file.name : '',
            selection: selection,
            altText: file.name.replace(/\.[a-zA-Z0-9]+$/, ''),
            width: {
                width: this.parent.insertImageSettings.width, minWidth: this.parent.insertImageSettings.minWidth,
                maxWidth: this.parent.getInsertImgMaxWidth()
            },
            height: {
                height: this.parent.insertImageSettings.height, minHeight: this.parent.insertImageSettings.minHeight,
                maxHeight: this.parent.insertImageSettings.maxHeight
            }
        };
        const actionBeginArgs: ActionBeginEventArgs = {
            requestType: 'Image',
            name: 'ImageDragAndDrop',
            cancel: false,
            originalEvent: args,
            itemCollection: imageCommand
        };
        this.parent.trigger(events.actionBegin, actionBeginArgs, (actionBeginArgs: ActionBeginEventArgs) => {
            if (!actionBeginArgs.cancel) {
                const command: IImageCommandsArgs = actionBeginArgs.itemCollection as IImageCommandsArgs;
                isUrlPassed = command.url !== '';
                imageTag.className = command.cssClass;
                imageTag.alt = command.altText;
                imageTag.src = command.url;
                imageTag.classList.add(classes.CLS_RTE_IMAGE);
                imageTag.classList.add(CLS_RESIZE);
                range.insertNode(imageTag);
                this.uploadMethod(args, imageTag);
                imageTag.addEventListener('load', (e: Event) => {
                    const actionCompleteArgs: ActionCompleteEventArgs = {
                        requestType: 'Image',
                        name: 'InsertDropImage',
                        elements: [imageTag],
                        event: e as KeyboardEventArgs,
                        editorMode: 'HTML'
                    };
                    this.parent.trigger(events.actionComplete, actionCompleteArgs);
                });
                detach(parentElement);
            } else {
                actionBeginArgs.originalEvent.preventDefault();
            }
        });
    }

    /**
     * Rendering uploader and popup for drag and drop
     *
     * @param {DragEvent} dragEvent - specifies the event.
     * @param {HTMLImageElement} imageElement - specifies the element.
     * @returns {void}
     */
    private uploadMethod(dragEvent: DragEvent, imageElement: HTMLImageElement): void {
        this.popupObj = this.popupUploaderObj.renderPopup('Images', imageElement);
        const range: Range = this.parent.formatter.editorManager.nodeSelection.getRange(this.parent.contentModule.getDocument());
        const timeOut: number = dragEvent.dataTransfer.files[0].size > 1000000 ? 300 : 100;
        this.imageDragPopupTime = setTimeout(() => {
            this.popupUploaderObj.refreshPopup(imageElement);
        }, timeOut);
        this.uploadObj = this.popupUploaderObj.createUploader('Images', dragEvent, imageElement, this.popupObj.element.childNodes[0] as HTMLElement);
        (this.popupObj.element.querySelector('.e-rte-dialog-upload .e-file-select-wrap') as HTMLElement).style.display = 'none';
        range.selectNodeContents(imageElement);
        this.parent.formatter.editorManager.nodeSelection.setRange(this.contentModule.getDocument(), range);
    }

    private imagePaste(args: NotifyArgs): void {
        if (args.text.length === 0 && !isNOU((args as NotifyArgs).file)) {
            // eslint-disable-next-line
            const proxy: Image = this;
            const reader: FileReader = new FileReader();
            (args.args as KeyboardEvent).preventDefault();
            // eslint-disable-next-line
            reader.addEventListener('load', (e: MouseEvent) => {
                const url: IImageCommandsArgs = {
                    cssClass: (proxy.parent.insertImageSettings.display === 'inline' ? classes.CLS_IMGINLINE : classes.CLS_IMGBREAK),
                    url: this.parent.insertImageSettings.saveFormat === 'Base64' || !isNOU(args.callBack) ?
                        reader.result as string : URL.createObjectURL(convertToBlob(reader.result as string)),
                    width: {
                        width: proxy.parent.insertImageSettings.width, minWidth: proxy.parent.insertImageSettings.minWidth,
                        maxWidth: proxy.parent.getInsertImgMaxWidth()
                    },
                    height: {
                        height: proxy.parent.insertImageSettings.height, minHeight: proxy.parent.insertImageSettings.minHeight,
                        maxHeight: proxy.parent.insertImageSettings.maxHeight
                    }
                };
                if (!isNOU(args.callBack)) {
                    args.callBack(url);
                    return;
                } else {
                    proxy.parent.formatter.process(proxy.parent, { item: { command: 'Images', subCommand: 'Image' } }, args.args, url);
                    this.showPopupToolBar(args, url);
                }
            });
            reader.readAsDataURL((args as NotifyArgs).file);
        }
    }

    private showPopupToolBar(e: NotifyArgs, url: IImageCommandsArgs): void {
        const imageSrc: string = 'img[src="' + url.url + '"]';
        const imageElement: Element = this.parent.inputElement.querySelector(imageSrc);
        this.parent.quickToolbarModule.createQTBar('Image', 'MultiRow', this.parent.quickToolbarSettings.image, RenderType.ImageToolbar);
        const args: IShowPopupArgs = {
            args: e.args as MouseEvent,
            type: 'Images',
            isNotify: undefined,
            elements: imageElement
        };
        if (imageElement) {
            this.showImageQTbarTime = setTimeout(() => {
                this.showImageQuickToolbar(args);
                if (this.parent.insertImageSettings.resize) {
                    this.resizeStart(e.args as PointerEvent, imageElement);
                }
            }, 0);
        }
    }

    /* eslint-disable */
    /**
     * Destroys the ToolBar.
     * 
     * @method destroy
     * @returns {void}
     * @hidden
     * @deprecated
     */
    /* eslint-enable */
    public destroy(): void {
        if (this.isDestroyed) { return; }
        this.prevSelectedImgEle = undefined;
        if (!isNOU(this.imageQTPopupTime)) {
            clearTimeout(this.imageQTPopupTime);
            this.imageQTPopupTime = null;
        }
        if (!isNOU(this.imageDragPopupTime)) {
            clearTimeout(this.imageDragPopupTime);
            this.imageDragPopupTime = null;
        }
        if (!isNOU(this.uploadCancelTime)) {
            clearTimeout(this.uploadCancelTime);
            this.uploadCancelTime = null;
        }
        if (!isNOU(this.uploadFailureTime)) {
            clearTimeout(this.uploadFailureTime);
            this.uploadFailureTime = null;
        }
        if (!isNOU(this.showImageQTbarTime)) {
            clearTimeout(this.showImageQTbarTime);
            this.showImageQTbarTime = null;
        }
        if (!isNOU(this.uploadSuccessTime)) {
            clearTimeout(this.uploadSuccessTime);
            this.uploadSuccessTime = null;
        }
        this.removeEventListener();
        this.clearDialogObj();
        this.cancelResizeAction();
        this.isDestroyed = true;
    }

    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     */
    private getModuleName(): string {
        return 'image';
    }
}
