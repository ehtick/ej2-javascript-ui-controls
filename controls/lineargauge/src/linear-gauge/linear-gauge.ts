/* eslint-disable valid-jsdoc */
import { Component, Property, NotifyPropertyChanges, Internationalization, ModuleDeclaration, animationMode } from '@syncfusion/ej2-base';
import { EmitType, INotifyPropertyChanged, Browser } from '@syncfusion/ej2-base';
import { Event, EventHandler, Complex, Collection, isNullOrUndefined, remove, createElement, Animation, AnimationOptions } from '@syncfusion/ej2-base';
import { Border, Font, Container, Margin, Annotation, TooltipSettings } from './model/base';
import { FontModel, BorderModel, ContainerModel, MarginModel, AnnotationModel, TooltipSettingsModel } from './model/base-model';
import { AxisModel, PointerModel} from './axes/axis-model';
import { Axis, Pointer } from './axes/axis';
import { load, loaded, gaugeMouseMove, gaugeMouseLeave, gaugeMouseDown, gaugeMouseUp, resized, valueChange } from './model/constant';
import { LinearGaugeModel } from './linear-gauge-model';
import { ILoadedEventArgs, ILoadEventArgs, IAnimationCompleteEventArgs, IAnnotationRenderEventArgs } from './model/interface';
import { ITooltipRenderEventArgs, IVisiblePointer, IMouseEventArgs, IAxisLabelRenderEventArgs, IMoveCursor } from './model/interface';
import { IResizeEventArgs, IValueChangeEventArgs, IThemeStyle, IPrintEventArgs, IPointerDragEventArgs } from './model/interface';
import { Size, valueToCoefficient, calculateShapes, calculateTextPosition, removeElement, getElement, VisibleRange, getExtraWidth, stringToNumberSize } from './utils/helper';
import { measureText, Rect, TextOption, textElement, GaugeLocation, RectOption, PathOption } from './utils/helper';
import { getBox, withInRange, getPointer, convertPixelToValue, textTrim, showTooltip, removeTooltip } from './utils/helper';
import { Orientation, LinearGaugeTheme, LabelPlacement } from './utils/enum';
import { dragEnd, dragMove, dragStart } from './model/constant';
import { AxisLayoutPanel } from './axes/axis-panel';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { AxisRenderer } from './axes/axis-renderer';
import { Annotations } from './annotations/annotations';
import { GaugeTooltip } from './user-interaction/tooltip';
import { getThemeStyle } from './model/theme';
import { PdfPageOrientation } from '@syncfusion/ej2-pdf-export';
import { ExportType } from '../linear-gauge/utils/enum';
import { Print } from './model/print';
import { PdfExport } from './model/pdf-export';
import { ImageExport } from './model/image-export';
import { Gradient } from './axes/gradient';

/**
 * Represents the linear gauge control. This is used to customize the properties of the linear gauge to visualize the data in linear scale.
 * ```html
 * <div id="container"/>
 * <script>
 *   var gaugeObj = new LinearGauge({ });
 *   gaugeObj.appendTo("#container");
 * </script>
 * ```
 */
@NotifyPropertyChanges
export class LinearGauge extends Component<HTMLElement> implements INotifyPropertyChanged {
    //Module declaration for gauge
    /**
     * Specifies the module that is used to place any text or images as annotation into the linear gauge.
     *
     * @private
     */
    public annotationsModule: Annotations;

    /**
     * Specifies the module that is used to display the pointer value in tooltip.
     *
     * @private
     */
    public tooltipModule: GaugeTooltip;

    /**
     * This module enables the print functionality in linear gauge.
     *
     * @private
     */
    public printModule: Print;

    /**
     * This module enables the export to PDF functionality in linear gauge.
     *
     * @private
     */
    public pdfExportModule: PdfExport;

    /**
     * This module enables the export to image functionality in linear gauge.
     *
     * @private
     */
    public imageExportModule: ImageExport;

    /**
     * This module enables the gradient option for pointer and ranges.
     *
     * @private
     */
    public gradientModule: Gradient;

    /**
     * Specifies the gradient count of the linear gauge.
     *
     * @private
     */
    public gradientCount: number = 0;

    /**
     * Specifies the width of the linear gauge as a string in order to provide input as both like '100px' or '100%'.
     * If specified as '100%, gauge will render to the full width of its parent element.
     *
     * @default null
     */

    @Property(null)
    public width: string;

    /**
     * Enables or disables the ability of the gauge to be rendered to the complete width. The left, right, top and bottom spacing will not be considered in the gauge when this property is disabled.
     *
     * @default true
     */
    @Property(true)
    public allowMargin: boolean;

    /**
     * Specifies the height of the linear gauge as a string in order to provide input as both like '100px' or '100%'.
     * If specified as '100%, gauge will render to the full height of its parent element.
     *
     * @default null
     */

    @Property(null)
    public height: string;

    /**
     * Defines the duration of the loading animation in linear gauge, which animates the
     * axis line, ticks, axis labels, ranges, pointers, and annotations. The value of this property will be in milliseconds.
     *
     * @default 0
     */

    @Property(0)
    public animationDuration: number;

    /**
     * Specifies the orientation of the rendering of the linear gauge.
     *
     * @default Vertical
     */
    @Property('Vertical')
    public orientation: Orientation;

    /**
     * Specifies the placement of the label in linear gauge.
     *
     * @default None
     */
    @Property('None')
    public edgeLabelPlacement: LabelPlacement;

    /**
     * Enables or disables the print functionality in linear gauge.
     *
     * @default false
     */
    @Property(false)
    public allowPrint: boolean;

    /**
     * Enables or disables the export to image functionality in linear gauge.
     *
     * @default false
     */
    @Property(false)
    public allowImageExport: boolean;

    /**
     * Enables or disables the export to PDF functionality in linear gauge.
     *
     * @default false
     */
    @Property(false)
    public allowPdfExport: boolean;

    /**
     * Specifies the options to customize the margins of the linear gauge.
     */

    @Complex<MarginModel>({}, Margin)
    public margin: MarginModel;

    /**
     * Specifies the options for customizing the style properties of the border for linear gauge.
     */

    @Complex<BorderModel>({ color: '', width: 0 }, Border)
    public border: BorderModel;

    /**
     * Specifies the background color of the gauge. This property accepts value in hex code, rgba string as a valid CSS color string.
     *
     * @default 'transparent'
     */
    @Property(null)
    public background: string;

    /**
     * Specifies the title for linear gauge.
     */

    @Property('')
    public title: string;

    /**
     * Specifies the options for customizing the appearance of title for linear gauge.
     */

    @Complex<FontModel>({ size: null, color: null, fontFamily: null, fontStyle: null, fontWeight: null }, Font)
    public titleStyle: FontModel;

    /**
     * Specifies the options for customizing the container in linear gauge.
     */

    @Complex<ContainerModel>({}, Container)
    public container: ContainerModel;

    /**
     * Specifies the options for customizing the axis in linear gauge.
     */

    @Collection<AxisModel>([{}], Axis)
    public axes: AxisModel[];

    /**
     * Specifies the options for customizing the tooltip in linear gauge.
     */

    @Complex<TooltipSettingsModel>({}, TooltipSettings)
    public tooltip: TooltipSettingsModel;

    /**
     * Specifies the options for customizing the annotation of linear gauge.
     */
    @Collection<AnnotationModel>([{}], Annotation)
    public annotations: AnnotationModel[];

    /**
     * Specifies the color palette for axis ranges in linear gauge.
     *
     * @default []
     */
    @Property([])
    public rangePalettes: string[];

    /**
     * Enables or disables a grouping separator should be used for a number.
     *
     * @default false
     */
    @Property(false)
    public useGroupingSeparator: boolean;

    /**
     * Sets and gets the information about gauge for assistive technology.
     *
     * @default null
     */
    @Property(null)
    public description: string;

    /**
     * Specifies the tab index value for the linear gauge.
     *
     * @default 0
     */
    @Property(0)
    public tabIndex: number;

    /**
     * Specifies the format to apply for internationalization in linear gauge.
     *
     * @default null
     */
    @Property(null)
    public format: string;

    /**
     * Sets and gets the theme styles supported for linear gauge. When the theme is set, the styles associated with the theme will be set in the gauge.
     *
     * @default Material
     */
    @Property('Material')
    public theme: LinearGaugeTheme;

    /**
     * Triggers after the gauge gets rendered.
     *
     * @event loaded
     */
    @Event()
    public loaded: EmitType<ILoadedEventArgs>;

    /**
     * Triggers before the gauge gets rendered.
     *
     * @event load
     */
    @Event()
    public load: EmitType<ILoadEventArgs>;

    /**
     * Triggers after completing the animation for pointer.
     *
     * @event animationComplete
     */
    @Event()
    public animationComplete: EmitType<IAnimationCompleteEventArgs>;

    /**
     * Triggers before each axis label gets rendered.
     *
     * @event axisLabelRender
     */
    @Event()
    public axisLabelRender: EmitType<IAxisLabelRenderEventArgs>;

    /**
     * Triggers before the pointer is dragged.
     *
     * @event dragStart
     */

    @Event()
    public dragStart: EmitType<IPointerDragEventArgs>;

    /**
     * Triggers while dragging the pointers.
     *
     * @event dragMove
     */

    @Event()
    public dragMove: EmitType<IPointerDragEventArgs>;

    /**
     * Triggers after the pointer is dragged.
     *
     * @event dragEnd
     */
    @Event()
    public dragEnd: EmitType<IPointerDragEventArgs>;

    /**
     * Triggers before each annotation gets rendered.
     *
     * @event annotationRender
     */
    @Event()
    public annotationRender: EmitType<IAnnotationRenderEventArgs>;

    /**
     * Triggers before the tooltip get rendered.
     *
     * @event tooltipRender
     * @deprecated
     */

    @Event()
    public tooltipRender: EmitType<ITooltipRenderEventArgs>;

    /**
     * Triggers when performing the mouse move operation on gauge area.
     *
     * @event gaugeMouseMove
     */

    @Event()
    public gaugeMouseMove: EmitType<IMouseEventArgs>;


    /**
     * Triggers when performing the mouse leave operation from the gauge area.
     *
     * @event gaugeMouseLeave
     */

    @Event()
    public gaugeMouseLeave: EmitType<IMouseEventArgs>;

    /**
     * Triggers when performing the mouse down operation on gauge area.
     *
     * @event gaugeMouseDown
     */

    @Event()
    public gaugeMouseDown: EmitType<IMouseEventArgs>;

    /**
     * Triggers when performing mouse up operation on gauge area.
     *
     * @event gaugeMouseUp
     */

    @Event()
    public gaugeMouseUp: EmitType<IMouseEventArgs>;

    /**
     * Triggers while changing the value of the pointer by UI interaction.
     *
     * @event valueChange
     */

    @Event()
    public valueChange: EmitType<IValueChangeEventArgs>;

    /**
     * Triggers to notify the resize of the linear gauge when the window is resized.
     *
     * @event resized
     */

    @Event()
    public resized: EmitType<IResizeEventArgs>;

    /**
     * Triggers before the print functionality gets started.
     *
     * @event beforePrint
     */

    @Event()
    public beforePrint: EmitType<IPrintEventArgs>;

    /** @private */
    public activePointer: Pointer;
    /** @private */
    public activeAxis: Axis;
    /** @private */
    public renderer: SvgRenderer;
    /** @private */
    public svgObject: Element;
    /** @private */
    public availableSize: Size;
    /** @private */
    public actualRect: Rect;
    /** @private */
    public intl: Internationalization;
    /** @private* */
    public containerBounds: Rect;
    /** @private */
    public isTouch: boolean;
    /** @private */
    public isDrag: boolean = false;
    /** @private */
    public tooltipTimeout: number;
    /** @private */
    public splitUpCount: number = 0;
    /** @private */
    public isPropertyChange: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private resizeEvent: any;
    /**
     * remove the animation style.
     */
    private styleRemove: number;
    /**
     * Calculate the axes bounds for gauge.
     *
     * @private
     * @hidden
     */
    public gaugeAxisLayoutPanel: AxisLayoutPanel;
    /**
     * Render the axis elements for gauge.
     *
     * @private
     * @hidden
     */
    public axisRenderer: AxisRenderer;

    /** @private */
    private resizeTo: number;

    /** @private */
    public allowLoadingAnimation: boolean = false;

    /** @private */
    public isPointerAnimationInProgress: boolean = false;

    /** @private */
    public isOverAllAnimationComplete: boolean = false;

    /** @private */
    public containerObject: Element;

    /** @private */
    public pointerDrag: boolean = false;

    private isTouchPointer: boolean = false;

    /** @private */
    public isCheckPointerDrag: boolean = false;

    /** @private */
    public mouseX: number = 0;

    /** @private */
    public mouseY: number = 0;

    /** @private */
    public mouseElement: Element;

    /** @private */
    public gaugeResized: boolean = false;

    /** @private */
    public nearSizes: number[];

    /** @private */
    public farSizes: number[];

    /**
     * @private
     */
    public themeStyle: IThemeStyle;

    /**
     * Constructor for creating the widget
     *
     * @private
     * @hidden
     */

    constructor(options?: LinearGaugeModel, element?: string | HTMLElement) {
        super(options, element);
    }

    /**
     * Initialize the preRender method.
     */

    protected preRender(): void {
        this.unWireEvents();
        this.isPointerAnimationInProgress = false;
        this.trigger(load, { gauge: this });
        this.initPrivateVariable();
        this.setCulture();
        this.createSvg();
        this.wireEvents();

    }
    private setTheme(): void {

        this.themeStyle = getThemeStyle(this.theme);

    }

    private initPrivateVariable(): void {
        if (this.element.id === '') {
            const collection: number = document.getElementsByClassName('e-lineargauge').length;
            this.element.id = 'lineargauge_' + 'control_' + collection;
        }
        this.renderer = new SvgRenderer(this.element.id);
        this.gaugeAxisLayoutPanel = new AxisLayoutPanel(this);
        this.axisRenderer = new AxisRenderer(this);
    }

    /**
     * Method to set culture for chart
     */
    private setCulture(): void {
        this.intl = new Internationalization();
    }

    /**
     * Methods to create svg element
     */
    private createSvg(): void {
        this.removeSvg();
        this.calculateSize();
        if (isNullOrUndefined(this.renderer)) {
            this.renderer = new SvgRenderer(this.element.id);
        }
        if (isNullOrUndefined(this.gaugeAxisLayoutPanel)) {
            this.gaugeAxisLayoutPanel = new AxisLayoutPanel(this);
        }
        if (isNullOrUndefined(this.axisRenderer)) {
            this.axisRenderer = new AxisRenderer(this);
        }
        this.svgObject = this.renderer.createSvg({
            id: this.element.id + '_svg',
            width: this.availableSize.width,
            height: this.availableSize.height
        });
    }

    /**
     * To Remove the SVG.
     *
     * @return {boolean}
     * @private
     */

    public removeSvg(): void {
        removeElement(this.element.id + '_Secondary_Element');
        if (!(isNullOrUndefined(this.svgObject)) && !isNullOrUndefined(this.svgObject.parentNode)) {
            remove(this.svgObject);
        }
        this.clearTemplate();
    }

    private renderAnimation(): void {
        if (this.allowLoadingAnimation) {
            const element: Element = document.getElementById(this.element.id + '_RangesGroup_0');
            this.axisElementAnimate(element);
            if (this.styleRemove) {
                clearTimeout(this.styleRemove);
            }
            this.styleRemove = setTimeout((): void => {
                const styleElement: NodeListOf<HTMLStyleElement> = document.querySelectorAll('style.' + this.element.id + 'animation');
                if (styleElement.length > 0) { styleElement[0].remove(); }
            }, (this.animationDuration === 0 && animationMode === 'Enable') ? 1000 : this.animationDuration);
        }
    }
    private axisElementAnimate(element: Element): void {
        let tempOpacity: number = 0;
        const opacity: number = 1;
        const elements: NodeListOf<HTMLStyleElement> = document.querySelectorAll('style.' + this.element.id + 'animation');
        new Animation({}).animate(<HTMLElement>element, {
            duration: (this.animationDuration === 0 && animationMode === 'Enable') ? 1000 : this.animationDuration > 0 ?
                this.animationDuration / this.splitUpCount : 0,
            progress: (args: AnimationOptions): void => {
                if (args.timeStamp > args.delay) {
                    tempOpacity = ((args.timeStamp - args.delay) / args.duration);
                    elements[0].style.cssText = `opacity: ${opacity * tempOpacity};`;
                }
            },
            end: (): void => {
                if (!isNullOrUndefined(elements) && elements.length !== 0) {
                    elements[0].style.cssText = 'opacity: 1;';
                }
                for (let i: number = 0; i < this.axes.length; i++) {
                    this.axisRenderer.pointerAnimation(<Axis>this.axes[i as number], i);
                    if ((this.axes.length - 1) === 0 && this.axes[i as number].pointers.length === 0) {
                        this.isOverAllAnimationComplete = true;
                    }
                }
            }
        });
    }

    /**
     * Method to calculate the size of the gauge
     */
    private calculateSize(): void {
        if (!isNullOrUndefined(this.height)) {
            this.element.style.height = this.height;
        }
        if (!isNullOrUndefined(this.width)) {
            this.element.style.width = this.width;
        }
        const width: number = stringToNumberSize(this.width, this.element.offsetWidth) || this.element.offsetWidth || 600;
        const height: number = stringToNumberSize(this.height, this.element.offsetHeight) || this.element.offsetHeight || 450;
        this.availableSize = new Size(width, height);
    }

    private renderElements(): void {
        this.setTheme();
        this.renderGaugeElements();
        this.calculateBounds();
        this.renderAxisElements();
        this.renderAnimation();
        this.renderComplete();
    }

    /**
     * To Initialize the control rendering
     */
    protected render(): void {
        this.isPropertyChange = false;
        this.isCheckPointerDrag = false;
        this.allowLoadingAnimation = ((this.animationDuration === 0 && animationMode === 'Enable') || this.animationDuration > 0)
            && !this.isOverAllAnimationComplete;
        if (this.allowLoadingAnimation) {
            const styleClass: HTMLCollection = document.getElementsByClassName(this.element.id + 'animation');
            if (styleClass.length === 0) {
                const styleClass: Element = createElement('style', {
                    className: this.element.id + 'animation'
                });
                (styleClass as HTMLElement).style.cssText = '.' + this.element.id + 'animation' + '{opacity: 0}';
                document.body.appendChild(styleClass);
            }
        }
        this.renderElements();
    }

    /**
     * To render the gauge elements
     *
     * @private
     */

    public renderGaugeElements(): void {
        this.appendSecondaryElement();
        this.renderBorder();
        this.renderTitle();
        this.renderContainer();
    }

    private appendSecondaryElement(): void {
        if (isNullOrUndefined(getElement(this.element.id + '_Secondary_Element'))) {
            const secondaryElement: Element = createElement('div');
            secondaryElement.id = this.element.id + '_Secondary_Element';
            (secondaryElement as HTMLElement).style.position = 'relative';
            this.element.appendChild(secondaryElement);
        }
    }

    /**
     * To calculate axes bounds
     *
     * @private
     */

    public calculateBounds(): void {
        this.gaugeAxisLayoutPanel.calculateAxesBounds();
    }

    /**
     * To render axis elements
     *
     * @private
     */
    public renderAxisElements(): void {
        this.axisRenderer.renderAxes();
        this.element.appendChild(this.svgObject);
        if (this.annotationsModule) {
            this.annotationsModule.renderAnnotationElements(this);
        }
        if (!this.isCheckPointerDrag) {
            this.trigger(loaded, { gauge: this });
        }
        removeElement('gauge-measuretext');
    }

    private renderBorder(): void {
        const width: number = this.border.width;
        if (width > 0 || (this.background || this.themeStyle.backgroundColor)) {
            const rect: RectOption = new RectOption(
                this.element.id + '_LinearGaugeBorder', this.background || this.themeStyle.backgroundColor, this.border, 1,
                new Rect(width / 2, width / 2, this.availableSize.width - width, this.availableSize.height - width));
            this.svgObject.appendChild(this.renderer.drawRectangle(rect) as HTMLElement);
        }
    }

    private renderTitle(): void {
        const width: number = (this.availableSize.width - this.margin.left - this.margin.right);
        const style: FontModel = {
            size: this.titleStyle.size || this.themeStyle.titleFontSize,
            color: this.titleStyle.color,
            fontFamily: this.titleStyle.fontFamily || this.themeStyle.fontFamily,
            fontWeight: this.titleStyle.fontWeight || this.themeStyle.titleFontWeight,
            fontStyle: this.titleStyle.fontStyle || this.themeStyle.titleFontStyle,
            opacity: this.titleStyle.opacity
        };
        const trimmedTitle: string = textTrim(width, this.title, style);
        const size: Size = measureText(trimmedTitle, style);
        const options: TextOption = new TextOption(
            this.element.id + '_LinearGaugeTitle',
            this.availableSize.width / 2,
            this.margin.top + (size.height / 2),
            'middle', trimmedTitle
        );
        const titleBounds: Rect = {
            x: options.x - (size.width / 2),
            y: options.y,
            width: size.width,
            height: size.height
        };
        const x: number = this.margin.left;
        const y: number = titleBounds.y;
        const height: number = (this.availableSize.height - y - this.margin.bottom);
        this.actualRect = { x: x, y: y, width: width, height: height };
        if (this.title) {
            const element: Element = textElement(
                options, style, style.color || this.themeStyle.titleFontColor, null, this.svgObject
            );
            element.setAttribute('aria-label', this.description || this.title);
            element.setAttribute('role', 'region');
            element.setAttribute('tabindex', this.tabIndex.toString());
        }
    }

    /*
     * Method to unbind the gauge events
     */
    private unWireEvents(): void {
        EventHandler.remove(this.element, Browser.touchStartEvent, this.gaugeOnMouseDown);
        EventHandler.remove(this.element, Browser.touchMoveEvent, this.mouseMove);
        EventHandler.remove(this.element, Browser.touchEndEvent, this.mouseEnd);
        EventHandler.remove(this.element, 'contextmenu', this.gaugeRightClick);
        EventHandler.remove(
            this.element, (Browser.isPointer ? 'pointerleave' : 'mouseleave'),
            this.mouseLeave
        );
        window.removeEventListener((Browser.isTouch && ('orientation' in window && 'onorientationchange' in window)) ? 'orientationchange' : 'resize',
                                   this.resizeEvent);
    }

    /*
     * Method to bind the gauge events
     */

    private wireEvents(): void {
        /*! Bind the Event handler */
        EventHandler.add(this.element, Browser.touchStartEvent, this.gaugeOnMouseDown, this);
        EventHandler.add(this.element, Browser.touchMoveEvent, this.mouseMove, this);
        EventHandler.add(this.element, Browser.touchEndEvent, this.mouseEnd, this);
        EventHandler.add(this.element, 'contextmenu', this.gaugeRightClick, this);
        EventHandler.add(
            this.element,
            (Browser.isPointer ? 'pointerleave' : 'mouseleave'), this.mouseLeave, this
        );
        this.resizeEvent = this.gaugeResize.bind(this);
        EventHandler.add(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window as any,
            (Browser.isTouch && ('orientation' in window && 'onorientationchange' in window)) ? 'orientationchange' : 'resize',
            this.resizeEvent
        );
        this.setStyle(<HTMLElement>this.element);
    }

    private setStyle(element: HTMLElement): void {
        element.style.touchAction = 'element';
        element.style.msTouchAction = 'element';
        element.style.msContentZooming = 'none';
        element.style.msUserSelect = 'none';
        element.style.webkitUserSelect = 'none';
        element.style.position = 'relative';
    }

    /**
     * Handles the gauge resize.
     *
     * @return {boolean} check whether the Linear Gauge is resized or not.
     * @private
     */

    public gaugeResize(): boolean {
        if (!this.isDestroyed) {
            const args: IResizeEventArgs = {
                gauge: this,
                previousSize: new Size(
                    this.availableSize.width,
                    this.availableSize.height
                ),
                name: resized,
                currentSize: new Size(0, 0),
                cancel: false
            };
            const currentSize: ClientRect = this.element.getBoundingClientRect();
            args.currentSize = new Size(currentSize.width, currentSize.height);
            this.trigger(resized, args);
            if (!args.cancel) {
                if (this.resizeTo) {
                    clearTimeout(this.resizeTo);
                }
                if (!isNullOrUndefined(this.element) && this.element.classList.contains('e-lineargauge')) {
                    this.resizeTo = window.setTimeout(
                        (): void => {
                            this.gaugeResized = true;
                            this.createSvg();
                            this.allowLoadingAnimation = false;
                            this.renderElements();
                        },
                        500);
                }
            }
        }
        return false;
    }

    /**
     * This method destroys the linear gauge. This method removes the events associated with the linear gauge and disposes the objects created for rendering and updating the linear gauge.
     */
    public destroy(): void {
        this.unWireEvents();
        super.destroy();
        if (!isNullOrUndefined(this.gaugeAxisLayoutPanel)) {
            this.gaugeAxisLayoutPanel.destroy();
        }
        if (!isNullOrUndefined(this.axisRenderer)) {
            this.axisRenderer.destroy();
        }
        this.gaugeAxisLayoutPanel = null;
        this.axisRenderer = null;
        this.activePointer = null;
        this.activeAxis = null;
        this.actualRect = null;
        this.containerObject = null;
        this.containerBounds = null;
        this.availableSize = null;
        this.mouseElement = null;
        this.nearSizes = [];
        this.farSizes = [];
        this.themeStyle = null;
        this.intl = null;
        this.removeSvg();
        this.resizeEvent = null;
        this.svgObject = null;
        this.renderer = null;
    }

    /**
     * To render the gauge container
     *
     * @private
     */

    public renderContainer(): void {
        let width: number; let height: number; let x: number; let y: number;
        let options: PathOption;
        const labelPadding: number = 20;
        const extraPadding: number = 30;
        let path: string = '';
        const fill: string = (this.container.backgroundColor !== 'transparent'
            || (this.theme !== 'Bootstrap4' && this.theme !== 'Material' && this.theme !== 'Material3' && this.theme !== 'Material3Dark'
                && this.theme !== 'Fluent2' && this.theme !== 'Fluent2Dark' && this.theme !== 'Bootstrap5' && this.theme !== 'Bootstrap5Dark'
                && this.theme !== 'Tailwind' && this.theme !== 'TailwindDark' && this.theme !== 'Tailwind3' && this.theme !== 'Tailwind3Dark'))
            ? this.container.backgroundColor : this.themeStyle.containerBackground;
        let rect: RectOption;
        const radius: number = this.container.width;
        const bottomRadius: number = radius + ((radius / 2) / Math.PI);
        const topRadius: number = radius / 2;
        let allowContainerRender: boolean = false;
        for (let i: number = 0; i < this.axes.length; i++) {
            if (this.axes[i as number].minimum !== this.axes[i as number].maximum) {
                allowContainerRender = true;
                break;
            }
        }
        if (this.orientation === 'Vertical') {
            if (this.allowMargin) {
                height = this.actualRect.height;
                height = (this.container.height > 0) ? this.container.height :
                    ((height / 2) - ((height / 2) / 4)) * 2;
                height = (this.container.type === 'Thermometer') ? height - (bottomRadius * 2) - topRadius : height;
            } else {
                height = this.actualRect.height - labelPadding - extraPadding;
                height = (this.container.type === 'Thermometer') ? (radius !== 0) ? (this.actualRect.height - (bottomRadius * 2) - topRadius - extraPadding) : height : height;
            }
            width = this.container.width;
            x = (this.actualRect.x + ((this.actualRect.width / 2) - (this.container.width / 2))) + this.container.offset;
            y = this.actualRect.y + ((this.actualRect.height / 2) - ((this.container.type === 'Thermometer') ?
                ((height + (bottomRadius * 2) - topRadius)) / 2 : height / 2));
        } else {
            if (this.allowMargin) {
                width = (this.container.height > 0) ? this.container.height :
                    ((this.actualRect.width / 2) - ((this.actualRect.width / 2) / 4)) * 2;
                width = (this.container.type === 'Thermometer') ? width - (bottomRadius * 2) - topRadius : width;
            } else {
                width = this.actualRect.width - labelPadding;
                width = (this.container.type === 'Thermometer') ? (this.actualRect.width - (bottomRadius * 2) - topRadius) : width;
            }
            x = this.actualRect.x + ((this.actualRect.width / 2) - ((this.container.type === 'Thermometer') ?
                (width - (bottomRadius * 2) + topRadius) / 2 : width / 2));
            y = (this.actualRect.y + ((this.actualRect.height / 2) - (this.container.width / 2))) + this.container.offset;
            height = this.container.width;
        }
        this.containerBounds = (!allowContainerRender) ? { x: 0, y: 0, width: 0, height: 0 } : { x: x, y: y, width: width, height: height };
        if ((this.containerBounds.width > 0 && this.orientation === 'Vertical') || (this.containerBounds.height > 0 && this.orientation === 'Horizontal')) {
            this.containerObject = this.renderer.createGroup({ id: this.element.id + '_Container_Group', transform: 'translate( 0, 0)' });
            if (this.container.type === 'Normal') {
                const containerBorder: BorderModel = { color: this.container.border.color || this.themeStyle.containerBorderColor,
                    width: this.container.border.width, dashArray: this.container.border.dashArray };
                rect = new RectOption(
                    this.element.id + '_' + this.container.type + '_Layout', fill, containerBorder, 1,
                    new Rect(x, y, width, height));
                this.containerObject.appendChild(this.renderer.drawRectangle(rect));
                if (this.allowLoadingAnimation) {
                    this.containerObject.classList.add(this.element.id + 'animation');
                }
            } else {
                path = getBox(
                    this.containerBounds, this.container.type, this.orientation,
                    new Size(this.container.height, this.container.width), 'container', null, null, this.container.roundedCornerRadius);
                options = new PathOption(
                    this.element.id + '_' + this.container.type + '_Layout', fill,
                    this.container.border.width, this.container.border.color || this.themeStyle.containerBorderColor,
                    1, this.container.border.dashArray, path);
                this.containerObject.appendChild(this.renderer.drawPath(options) as SVGAElement);
                if (this.allowLoadingAnimation) {
                    this.containerObject.classList.add(this.element.id + 'animation');
                }
            }
            this.svgObject.appendChild(this.containerObject);
        }
    }

    /**
     * Method to set mouse x, y from events
     */

    private setMouseXY(e: PointerEvent): void {
        let pageX: number;
        let pageY: number;
        const svgRect: ClientRect = getElement(this.element.id + '_svg').getBoundingClientRect();
        const rect: ClientRect = this.element.getBoundingClientRect();
        if (e.type.indexOf('touch') > -1) {
            this.isTouch = true;
            const touchArg: TouchEvent = <TouchEvent & PointerEvent>e;
            pageY = touchArg.changedTouches[0].clientY;
            pageX = touchArg.changedTouches[0].clientX;
        } else {
            this.isTouch = e.pointerType === 'touch' || e.pointerType === '2';
            pageX = e.clientX;
            pageY = e.clientY;
        }
        this.mouseY = (pageY - rect.top) - Math.max(svgRect.top - rect.top, 0);
        this.mouseX = (pageX - rect.left) - Math.max(svgRect.left - rect.left, 0);
    }
    /**
     * Handles the mouse down on gauge.
     *
     * @param {PointerEvent} e - Specifies the event argument.
     * @return {boolean}
     * @private
     */

    public gaugeOnMouseDown(e: PointerEvent): boolean {
        let current: IMoveCursor;
        let currentPointer: IVisiblePointer;
        this.setMouseXY(e);
        const args: IMouseEventArgs = this.getMouseArgs(e, 'touchstart', gaugeMouseDown);
        this.trigger(gaugeMouseDown, args, () => {
            this.mouseX = args.x;
            this.mouseY = args.y;
            if (this.isTouch) {
                e.preventDefault();
                this.isTouchPointer = true;
            }
            if (args.target) {
                if (!args.cancel && ((args.target.id.indexOf('MarkerPointer') > -1) || (args.target.id.indexOf('BarPointer') > -1))) {
                    this.isOverAllAnimationComplete = true;
                    current = this.moveOnPointer(args.target as HTMLElement);
                    currentPointer = getPointer(args.target as HTMLElement, this);
                    this.activeAxis = <Axis>this.axes[currentPointer.axisIndex];
                    this.activePointer = <Pointer>this.activeAxis.pointers[currentPointer.pointerIndex];
                    if (isNullOrUndefined(this.activePointer.pathElement)) {
                        this.activePointer.pathElement = [e.target as Element];
                    }
                    const pointInd: number = parseInt(this.activePointer.pathElement[0].id.slice(-1), 10);
                    const axisInd: number = parseInt(this.activePointer.pathElement[0].id.match(/\d/g)[0], 10);
                    if (currentPointer.pointer.enableDrag) {
                        this.trigger(dragStart, {
                            axis: this.activeAxis,
                            name: dragStart,
                            pointer: this.activePointer,
                            currentValue: this.activePointer.currentValue,
                            pointerIndex: pointInd,
                            axisIndex: axisInd
                        } as IPointerDragEventArgs);
                    }
                    if (!isNullOrUndefined(current) && current.pointer) {
                        this.pointerDrag = true;
                        this.mouseElement = args.target;
                    }
                }
            }
        });
        return false;
    }

    /**
     * Handles the mouse move.
     *
     * @return {boolean}
     * @private
     */

    public mouseMove(e: PointerEvent): boolean {
        let current: IMoveCursor;
        this.setMouseXY(e);
        const args: IMouseEventArgs = this.getMouseArgs(e, 'touchmove', gaugeMouseMove);
        this.trigger(gaugeMouseMove, args, () => {
            this.mouseX = args.x;
            this.mouseY = args.y;
            let dragArgs: IPointerDragEventArgs;
            if (args.target && !args.cancel) {
                if (this.pointerDrag && this.activePointer) {
                    if (!isNullOrUndefined(this.activePointer.pathElement)) {
                        if (this.isTouch) {
                            this.isTouchPointer = true;
                            e.preventDefault();
                        }
                        const pointerIndex: number = parseInt(this.activePointer.pathElement[0].id.slice(-1), 10);
                        const axisIndex: number = parseInt(this.activePointer.pathElement[0].id.split('AxisIndex_')[1].match(/\d/g)[0], 10);
                        if (this.axes[axisIndex as number].pointers[pointerIndex as number].enableDrag) {
                            current = this.moveOnPointer(this.activePointer.pathElement[0] as HTMLElement);
                            if (!(isNullOrUndefined(current)) && current.pointer) {
                                this.element.style.cursor = current.style;
                            }
                            this.isDrag = this.isCheckPointerDrag = true;
                            dragArgs = {
                                axis: this.activeAxis,
                                pointer: this.activePointer,
                                previousValue: this.activePointer.currentValue,
                                name: dragMove,
                                currentValue: null,
                                axisIndex: axisIndex,
                                pointerIndex: pointerIndex
                            };
                            if (this.activePointer.pathElement[0].id.indexOf('MarkerPointer') > -1) {
                                this.markerDrag(this.activeAxis, (this.activeAxis.pointers[pointerIndex as number]) as Pointer);
                            } else {
                                this.barDrag(this.activeAxis, (this.activeAxis.pointers[pointerIndex as number]) as Pointer);
                            }
                            dragArgs.currentValue = this.activePointer.currentValue;
                            this.trigger(dragMove, dragArgs);
                        }
                    }
                } else {
                    if (args.target.id.indexOf('Pointer') > -1 && isNullOrUndefined(this.activePointer)) {
                        const pointerIndex: number = parseInt(args.target.id.split('Pointer_')[1], 10);
                        const axisIndex: number = parseInt(args.target.id.split('AxisIndex_')[1].match(/\d/g)[0], 10);
                        if (this.axes[axisIndex as number].pointers[pointerIndex as number].enableDrag) {
                            this.element.style.cursor = 'pointer';
                        }
                    }
                    else {
                        this.element.style.cursor = (this.pointerDrag) ? this.element.style.cursor : 'auto';
                    }
                }
                this.gaugeOnMouseMove();
            }
        });
        this.notify(Browser.touchMoveEvent, e);
        if ((!isNullOrUndefined(args.target) && args.target.id === (this.element.id + '_LinearGaugeTitle')) || document.getElementById(this.element.id + '_EJ2_Title_Tooltip')) {
            this.titleTooltip(e, false);
        }
        return false;
    }

    private titleTooltip(event: Event, isTitleTouch: boolean): void {
        const targetId: string = (<HTMLElement>event.target).id;
        if ((targetId === (this.element.id + '_LinearGaugeTitle')) && ((<HTMLElement>event.target).textContent.indexOf('...') > -1)) {
            clearTimeout(this.tooltipTimeout);
            showTooltip(this.title, this);
            if (isTitleTouch) {
                this.tooltipTimeout = setTimeout(removeTooltip.bind(this), 2000);
            }
        } else {
            removeElement(this.element.id + '_EJ2_Title_Tooltip');
        }
    }

    /**
     * To find the mouse move on pointer.
     *
     * @param element
     */

    private moveOnPointer(element: HTMLElement): IMoveCursor {
        const clientRect: ClientRect = this.element.getBoundingClientRect();
        let isPointer: boolean = false;
        let top: number; let left: number;
        const pointerElement: Element = getElement(element.id);
        const svgPath: SVGPathElement = <SVGPathElement>pointerElement;
        let cursorStyle: string;
        let process: IMoveCursor;
        const current: IVisiblePointer = getPointer(element as HTMLElement, this);
        const axis: Axis = current.axis;
        const pointer: Pointer = current.pointer;
        if (pointer.enableDrag) {
            if (pointer.type === 'Bar') {
                if (this.orientation === 'Vertical') {
                    top = pointerElement.getBoundingClientRect().top - clientRect.top;
                    top = (!axis.isInversed) ? top : top + svgPath.getBBox().height;
                    isPointer = !axis.isInversed ? (this.mouseY < (top + 10) && this.mouseY >= top) :
                        (this.mouseY <= top && this.mouseY > (top - 10));
                    cursorStyle = 'grabbing';
                } else {
                    left = pointerElement.getBoundingClientRect().left - clientRect.left;
                    left = (!axis.isInversed) ? left + svgPath.getBBox().width : left;
                    isPointer = !axis.isInversed ? (this.mouseX > (left - 10) && this.mouseX <= left) :
                        (this.mouseX >= left && this.mouseX < (left + 10));
                    cursorStyle = 'grabbing';
                }
            } else {
                isPointer = true;
                cursorStyle = 'grabbing';
            }
        }
        if (isPointer) {
            process = { pointer: isPointer, style: cursorStyle };
        }
        return process;
    }

    /**
     * Handle the right click
     *
     * @param {PointerEvent | TouchEvent} event - Specifies the pointer event argument.
     * @returns {boolean} - Specifies whether right click is performed on the Linear Gauge.
     * @private
     *
     */

    public gaugeRightClick(event: MouseEvent | PointerEvent): boolean {
        if (event.buttons === 2 || (<PointerEvent>event).pointerType === 'touch') {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        return true;
    }


    /**
     * Handles the mouse leave.
     *
     * @return {boolean}
     * @private
     */

    public mouseLeave(e: PointerEvent): boolean {
        this.activeAxis = null;
        this.activePointer = null;
        const args: IMouseEventArgs = this.getMouseArgs(e, 'touchmove', gaugeMouseLeave);
        this.trigger(gaugeMouseLeave, args);
        if (!isNullOrUndefined(this.mouseElement)) {
            this.mouseElement = null;
            this.pointerDrag = false;
        }
        return false;
    }

    /**
     * Handles the mouse move on gauge.
     *
     * @param {PointerEvent | TouchEvent} e - Specifies the pointer event argument.
     * @return {boolean}
     * @private
     */

    public gaugeOnMouseMove(): boolean {
        let current: IVisiblePointer;
        if (this.pointerDrag) {
            current = getPointer(this.mouseElement as HTMLElement, this);
            if (current.pointer.enableDrag && current.pointer.animationComplete) {
                this[current.pointer.type.toLowerCase() + 'Drag'](current.axis, current.pointer);
            }
        }
        return true;
    }

    /**
     * Handles the mouse up.
     *
     * @return {boolean}
     * @private
     */

    public mouseEnd(e: PointerEvent): boolean {
        this.isTouchPointer = false;
        this.setMouseXY(e);
        const isImage: boolean = isNullOrUndefined(this.activePointer) ? false : this.activePointer.markerType === 'Image';
        const args: IMouseEventArgs = this.getMouseArgs(e, 'touchend', gaugeMouseUp);
        this.trigger(gaugeMouseUp, args);
        if (this.activeAxis && this.activePointer) {
            const pointerInd: number = parseInt(this.activePointer.pathElement[0].id.slice(-1), 10);
            const axisInd: number = parseInt(this.activePointer.pathElement[0].id.split('_AxisIndex_')[1], 10);
            if (this.activePointer.enableDrag) {
                this.trigger(dragEnd, {
                    name: dragEnd,
                    axis: this.activeAxis,
                    pointer: this.activePointer,
                    currentValue: this.activePointer.currentValue,
                    axisIndex: axisInd,
                    pointerIndex: pointerInd
                } as IPointerDragEventArgs);
                this.axes[axisInd as number].pointers[pointerInd as number].value = this.activePointer.currentValue;
                this.activeAxis = null;
                this.activePointer = null;
                this.isDrag = false;
                if (!isNullOrUndefined(this.mouseElement && !isImage)) {
                    this.triggerDragEvent(this.mouseElement);
                }
            }
        }
        if (!isNullOrUndefined(this.mouseElement)) {
            this.mouseElement = null;
            this.pointerDrag = false;
        }
        this.element.style.cursor = 'auto';
        this.notify(Browser.touchEndEvent, e);
        if (args.target.id === (this.element.id + '_LinearGaugeTitle') || document.getElementById(this.element.id + '_EJ2_Title_Tooltip')) {
            this.titleTooltip(e, true);
        }
        return true;
    }

    /**
     * This method handles the print functionality for linear gauge.
     *
     * @param id - Specifies the element to print the linear gauge.
     */

    public print(id?: string[] | string | Element): void {
        if ((this.allowPrint) && (this.printModule)) {
            this.printModule.print(this, id);
        }
    }
    /**
     * This method handles the export functionality for linear gauge.
     *
     * @param {ExportType} type - Specifies the extension type of the exported document.
     * @param {string} fileName - Specifies file name for exporting the rendered Linear Gauge.
     * @param {PdfPageOrientation} orientation - Specifies the orientation of the PDF document.
     * @param {boolean} allowDownload - Specifies whether the exported file should be downloaded or not.
     * @returns {string} - Specifies the base64 string of the exported image which is returned when the allowDownload is set to false.
     */

    public export(type: ExportType, fileName: string, orientation?: PdfPageOrientation, allowDownload?: boolean): Promise<string> {
        if (isNullOrUndefined(allowDownload)) {
            allowDownload = true;
        }
        if ((type !== 'PDF') && (this.allowImageExport) && (this.imageExportModule)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            return new Promise((resolve: any, reject: any) => {
                resolve(this.imageExportModule.export(this, type, fileName, allowDownload));
            });
        } else if ((this.allowPdfExport) && (this.pdfExportModule)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
            return new Promise((resolve: any, reject: any) => {
                resolve(this.pdfExportModule.export(this, type, fileName, orientation, allowDownload));
            });
        }
        return null;
    }

    /**
     * Handles the mouse event arguments.
     *
     * @return {IMouseEventArgs}
     * @private
     */

    private getMouseArgs(e: PointerEvent, type: string, name: string): IMouseEventArgs {
        const rect: ClientRect = this.element.getBoundingClientRect();
        const location: GaugeLocation = new GaugeLocation(-rect.left, -rect.top);
        const isTouch: boolean = (e.type === type);
        location.x += isTouch ? (<TouchEvent & PointerEvent>e).changedTouches[0].clientX : e.clientX;
        location.y += isTouch ? (<TouchEvent & PointerEvent>e).changedTouches[0].clientY : e.clientY;
        return {
            cancel: false, name: name,
            model: this,
            x: location.x, y: location.y,
            target: isTouch ? <Element>(<TouchEvent & PointerEvent>e).target : <Element>e.target
        };
    }

    /**
     * @private
     * @param axis
     * @param pointer
     */

    public markerDrag(axis: Axis, pointer: Pointer): void {
        let options: PathOption;
        let textOptions: TextOption;
        let x: number; let y: number;
        const value: number = convertPixelToValue(
            this.element, this.mouseElement, this.orientation, axis, 'drag', new GaugeLocation(this.mouseX, this.mouseY));
        if (withInRange(value, null, null, axis.visibleRange.max, axis.visibleRange.min, 'pointer')) {
            options = new PathOption(
                'pointerID', pointer.color || this.themeStyle.pointerColor,
                pointer.border.width, pointer.border.color, pointer.opacity, pointer.border.dashArray, null, '');
            if (this.orientation === 'Vertical') {
                pointer.bounds.y = this.mouseY;
            } else {
                pointer.bounds.x = this.mouseX + getExtraWidth(this.element);
            }
            pointer.currentValue = this.isTouch ? (pointer.startValue = value) : (pointer.value = value);
            if (pointer.markerType === 'Text') {
                textOptions = new TextOption('pointerID', x, y, 'middle', pointer.text, null, 'auto');
                textOptions = calculateTextPosition(pointer.bounds, pointer.markerType,
                                                    textOptions, this.orientation, axis, pointer);
            }
            options = calculateShapes(pointer.bounds, pointer.markerType, new Size(pointer.width, pointer.height),
                                      pointer.imageUrl, options, this.orientation, axis, pointer);
            if (pointer.markerType === 'Image' || pointer.markerType === 'Text') {
                this.mouseElement.setAttribute('x', (pointer.markerType === 'Text' ? textOptions.x : pointer.bounds.x - (pointer.bounds.width / 2)).toString());
                this.mouseElement.setAttribute('y', (pointer.markerType === 'Text' ? textOptions.y : pointer.bounds.y - (pointer.bounds.height / 2)).toString());
            } else if (pointer.markerType === 'Circle') {
                this.mouseElement.setAttribute('cx', (options.cx).toString());
                this.mouseElement.setAttribute('cy', (options.cy).toString());
                this.mouseElement.setAttribute('r', (options.r).toString());
            } else {
                this.mouseElement.setAttribute('d', options.d);
            }
        }
    }

    /**
     * @private
     * @param axis
     * @param pointer
     */

    public barDrag(axis: Axis, pointer: Pointer): void {
        const line: Rect = axis.lineBounds;
        const range: VisibleRange = axis.visibleRange;
        let isDrag: boolean;
        const lineHeight: number = (this.orientation === 'Vertical') ? line.height : line.width;
        const lineY: number = (this.orientation === 'Vertical') ? line.y : line.x;
        let path: string;
        const value1: number = ((valueToCoefficient(range.min, axis, this.orientation, range) * lineHeight) + lineY);
        const value2: number = ((valueToCoefficient(range.max, axis, this.orientation, range) * lineHeight) + lineY);
        if (this.orientation === 'Vertical') {
            isDrag = (!axis.isInversed) ? (this.mouseY > value2 && this.mouseY < value1) : (this.mouseY > value1 && this.mouseY < value2);
            if (isDrag) {
                if ((this.container.type === 'Normal' || this.container.width === 0) && !isNullOrUndefined(this.mouseElement)) {
                    if (!axis.isInversed) {
                        this.mouseElement.setAttribute('y', this.mouseY.toString());
                    }
                    this.mouseElement.setAttribute('height', Math.abs(value1 - this.mouseY).toString());
                } else {
                    if (!axis.isInversed) {
                        pointer.bounds.y = this.mouseY;
                    }
                    pointer.bounds.height = Math.abs(value1 - this.mouseY);
                }
            }
        } else {
            const extraWidth: number = getExtraWidth(this.element);
            isDrag = (!axis.isInversed) ? (this.mouseX + extraWidth > value1 && this.mouseX + extraWidth < value2) :
                (this.mouseX + extraWidth > value2 && this.mouseX + extraWidth < value1);
            if (isDrag) {
                if ((this.container.type === 'Normal' || this.container.width === 0) && !isNullOrUndefined(this.mouseElement)) {
                    if (axis.isInversed) {
                        this.mouseElement.setAttribute('x', (this.mouseX + extraWidth).toString());
                    }
                    this.mouseElement.setAttribute('width', Math.abs(value1 - (this.mouseX + extraWidth)).toString());
                } else {
                    if (axis.isInversed) {
                        pointer.bounds.x = this.mouseX + extraWidth;
                    }
                    pointer.bounds.width = Math.abs(value1 - (this.mouseX + extraWidth));
                }
            }
        }
        if (!isNullOrUndefined(this.mouseElement)) {
            const value: number = convertPixelToValue(this.element, this.mouseElement, this.orientation, axis, 'drag', new GaugeLocation(this.mouseX, this.mouseY));
            pointer.currentValue = this.isTouch ? (pointer.startValue = value) : (pointer.value = value);
        }
        if (isDrag && !isNullOrUndefined(this.mouseElement) && this.mouseElement.tagName === 'path') {
            path = getBox(
                pointer.bounds, this.container.type, this.orientation,
                new Size(pointer.bounds.width, pointer.bounds.height), 'bar', this.container.width, axis, pointer.roundedCornerRadius);
            this.mouseElement.setAttribute('d', path);
        }
    }

    /**
     * Triggers when drag the pointer
     *
     * @param activeElement
     */

    private triggerDragEvent(activeElement: Element): void {
        const active: IVisiblePointer = getPointer(activeElement as HTMLElement, this);
        const value: number = convertPixelToValue(
            this.element, activeElement, this.orientation, active.axis, 'tooltip', null);
        const dragArgs: IValueChangeEventArgs = {
            name: 'valueChange',
            gauge: this,
            element: activeElement,
            axisIndex: active.axisIndex,
            axis: active.axis,
            pointerIndex: active.pointerIndex,
            pointer: active.pointer,
            value: value
        };
        this.trigger(valueChange, dragArgs, (pointerArgs : IValueChangeEventArgs) => {
            if (value !== pointerArgs.value) {
                this.setPointerValue(pointerArgs.axisIndex, pointerArgs.pointerIndex, pointerArgs.value);
            }
        });
    }

    /**
     * This method is used to set the pointer value in the linear gauge.
     *
     * @param {number} axisIndex - Specifies the index of the axis.
     * @param {number} pointerIndex - Specifies the index of the pointer.
     * @param {number} value - Specifies the pointer value.
     */

    public setPointerValue(axisIndex: number, pointerIndex: number, value: number): void {
        if (!this.isDestroyed) {
            const axis: Axis = <Axis>this.axes[axisIndex as number];
            const pointer: Pointer = <Pointer>axis.pointers[pointerIndex as number];
            this.gaugeResized = false;
            if (this.allowLoadingAnimation) {
                this.allowLoadingAnimation = false;
                this.createSvg();
                this.renderGaugeElements();
                this.calculateBounds();
                this.renderAxisElements();
            }
            if (pointer.startValue !== value) {
                this.isPointerAnimationInProgress = false;
                const id: string = this.element.id + '_AxisIndex_' + axisIndex + '_' + pointer.type + 'Pointer_' + pointerIndex;
                const pointerElement: Element = getElement(id);
                value = (value < axis.visibleRange.min) ? axis.visibleRange.min : ((value > axis.visibleRange.max) ?
                    axis.visibleRange.max : value);
                pointer.currentValue = value;
                pointer.isPointerAnimation = true;
                this.isPropertyChange = true;
                if (
                    (pointerElement !== null) && withInRange(
                        pointer.currentValue, null, null, axis.visibleRange.max, axis.visibleRange.min, 'pointer'
                    )
                ) {
                    pointer.value = this.pointerDrag ? this.isTouch ? pointer.startValue : value : pointer.value;
                    this.gaugeAxisLayoutPanel['calculate' + pointer.type + 'Bounds'](axis, pointer);
                    this.axisRenderer['draw' + pointer.type + 'Pointer'](axis, axisIndex, pointer, pointerIndex, pointerElement.parentElement);
                }
                this.isProtectedOnChange = true;
                pointer.startValue = pointer.currentValue;
                pointer.currentValue = value;
                pointer.value = value;
                this.isProtectedOnChange = false;
            }
        }
    }

    /**
     * This method is used to set the annotation value in the linear gauge.
     *
     * @param {number} annotationIndex - Specifies the index value for the annotation in linear gauge.
     * @param {string | Function} content - Specifies the content for the annotation in linear gauge.
     * @param {number} axisValue - Specifies the axis value to which the annotation must be positioned.
     */

    public setAnnotationValue(annotationIndex: number, content: string | Function, axisValue?: number): void {
        if (!this.isDestroyed) {
            const elementExist: boolean = getElement(this.element.id + '_Annotation_' + annotationIndex) === null;
            const element: HTMLElement = <HTMLElement>getElement(this.element.id + '_AnnotationsGroup') ||
                createElement('div', {
                    id: this.element.id + '_AnnotationsGroup'
                });
            const annotation: Annotation = <Annotation>this.annotations[annotationIndex as number];
            if (content !== null) {
                removeElement(this.element.id + '_Annotation_' + annotationIndex);
                annotation.content = content;
                annotation.axisValue = !isNullOrUndefined(axisValue) ? axisValue : annotation.axisValue;
                this.annotationsModule.createAnnotationTemplate(element, annotationIndex, this);
                if (!isNullOrUndefined(annotation.axisIndex)) {
                    const axis: Axis = <Axis>this.axes[annotation.axisIndex];
                    const range: VisibleRange = axis.visibleRange;
                    const annotationElement: HTMLElement = getElement(this.element.id + '_Annotation_' + annotationIndex);
                    if (!elementExist && annotation.axisValue >= range.min && annotation.axisValue <= range.max
                        && !isNullOrUndefined(annotationElement) && typeof (annotationElement) === 'object') {
                        element.appendChild(annotationElement);
                    }
                } else if (!elementExist) {
                    const annotationElement: HTMLElement = getElement(this.element.id + '_Annotation_' + annotationIndex);
                    if (!isNullOrUndefined(annotationElement) && typeof (annotationElement) === 'object') {
                        element.appendChild(annotationElement);
                    }
                }
            }
        }
    }

    private isGradientVisible(): boolean {
        let isVisible: boolean = false;
        for (const axis of this.axes) {
            for (const pointer of axis.pointers) {
                if (!isNullOrUndefined(pointer.linearGradient) || !isNullOrUndefined(pointer.radialGradient)) {
                    isVisible = true;
                    break;
                }
            }
            for (const range of axis.ranges) {
                if (!isNullOrUndefined(range.linearGradient) || !isNullOrUndefined(range.radialGradient)) {
                    isVisible = true;
                    break;
                }
            }
        }
        return isVisible;
    }

    /**
     * To provide the array of modules needed for control rendering
     *
     * @return {ModuleDeclaration[]}
     * @private
     */

    public requiredModules(): ModuleDeclaration[] {
        const modules: ModuleDeclaration[] = [];
        let annotationEnable: boolean = false;
        this.annotations.map((annotation: Annotation) => {
            if (!annotationEnable) {
                annotationEnable = ((!isNullOrUndefined(annotation.content) && annotation.content.length !== 0) || typeof(annotation.content) === 'function');
            }
        });
        if (annotationEnable) {
            modules.push({
                member: 'Annotations',
                args: [this, Annotations],
                name: 'Annotations'
            });
        }
        if (this.tooltip.enable) {
            modules.push({
                member: 'Tooltip',
                args: [this, GaugeTooltip],
                name: 'GaugeTooltip'
            });
        }
        if (this.allowPrint) {
            modules.push({
                member: 'Print',
                args: [this],
                name: 'Print'
            });
        }
        if (this.allowImageExport) {
            modules.push({
                member: 'ImageExport',
                args: [this],
                name: 'ImageExport'
            });
        }
        if (this.allowPdfExport) {
            modules.push({
                member: 'PdfExport',
                args: [this],
                name: 'PdfExport'
            });
        }
        if (this.isGradientVisible()) {
            modules.push({
                member: 'Gradient',
                args: [this, Gradient],
                name: 'Gradient'
            });
        }
        return modules;
    }

    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @private
     */

    public getPersistData(): string {
        const keyEntity: string[] = ['loaded'];
        return this.addOnPersist(keyEntity);
    }

    /**
     * Get component name
     *
     * @private
     */

    public getModuleName(): string {
        return 'lineargauge';
    }

    /**
     * Called internally if any of the property value changed.
     *
     * @private
     */

    public onPropertyChanged(newProp: LinearGaugeModel, oldProp: LinearGaugeModel): void {
        if (!this.isDestroyed) {
            let renderer: boolean = false;
            let refreshBounds: boolean = false;
            this.allowLoadingAnimation = this.animationDuration > 0 && !this.isOverAllAnimationComplete ? true : false;
            this.isPropertyChange = this.animationDuration > 0 && !this.isOverAllAnimationComplete ? false : true;
            this.gaugeResized = false;
            for (const prop of Object.keys(newProp)) {
                switch (prop) {
                case 'height':
                case 'width':
                case 'margin':
                    this.createSvg();
                    refreshBounds = true;
                    break;
                case 'title':
                    refreshBounds = (newProp.title === '' || oldProp.title === '');
                    renderer = !(newProp.title === '' || oldProp.title === '');
                    break;
                case 'titleStyle':
                    if (newProp.titleStyle && newProp.titleStyle.size) {
                        refreshBounds = true;
                    } else {
                        renderer = true;
                    }
                    break;
                case 'border':
                    renderer = true;
                    break;
                case 'background':
                    renderer = true;
                    break;
                case 'container':
                    refreshBounds = true;
                    break;
                case 'orientation':
                    this.isOverAllAnimationComplete = true;
                    this.isPointerAnimationInProgress = this.allowLoadingAnimation = false;
                    for (let i: number = 0; i < this.axes.length; i++) {
                        for (let j: number = 0; j < this.axes[i as number].pointers.length; j++) {
                            this.axes[i as number].pointers[j as number]['startValue'] = this.axes[i as number].minimum;
                            this.axes[i as number].pointers[j as number]['isPointerAnimation'] = true;
                        }
                    }
                    refreshBounds = true;
                    break;
                case 'axes':
                    for (let x: number = 0; x < this.axes.length; x++) {
                        if (!isNullOrUndefined(newProp.axes[x as number])) {
                            const collection: string[] = Object.keys(newProp.axes[x as number]);
                            for (const collectionProp of collection) {
                                if (collectionProp === 'pointers') {
                                    const pointerPropertyLength: number = Object.keys(newProp.axes[x as number].pointers).length;
                                    for (let y: number = 0; y < pointerPropertyLength; y++) {
                                        const index: number = parseInt(Object.keys(newProp.axes[x as number].pointers)[y as number], 10);
                                        if (!isNaN(index) &&
                                            !isNullOrUndefined(Object.keys(newProp.axes[x as number].pointers[index as number]))) {
                                            this.allowLoadingAnimation = false;
                                            this.isPointerAnimationInProgress = false;
                                            this.axes[x as number].pointers[index as number]['startValue'] = this.axes[x as number].pointers[index as number]['currentValue'];
                                            this.axes[x as number].pointers[index as number]['isPointerAnimation'] = Object.keys(newProp.axes[x as number].pointers[index as number]).indexOf('value') > -1;
                                            if (this.pointerDrag) {
                                                this.axes[x as number].pointers[index as number]['isPointerAnimation'] = false;
                                                if (this.isTouchPointer &&
                                                    newProp.axes[x as number].pointers[index as number].text
                                                    !== oldProp.axes[x as number].pointers[index as number].text) {
                                                    const currentPointer: PointerModel = this.axes[x as number].pointers[index as number];
                                                    const pointerId: string = this.element.id + '_AxisIndex_' + x + '_' + currentPointer.type + 'Pointer' + '_' + index;
                                                    this.axisRenderer.updateTextPointer(pointerId, <Pointer>currentPointer,
                                                                                        <Axis>this.axes[x as number]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    refreshBounds = true;
                    break;
                }
            }
            if (!this.isTouchPointer && isNullOrUndefined(this.activePointer)) {
                if (!refreshBounds && renderer) {
                    this.removeSvg();
                    this.renderGaugeElements();
                    this.renderAxisElements();
                }
                if (refreshBounds || this.allowLoadingAnimation) {
                    this.createSvg();
                    this.renderGaugeElements();
                    this.calculateBounds();
                    this.renderAxisElements();
                    if (this.allowLoadingAnimation) {
                        this.allowLoadingAnimation = this.animationDuration > 0 && !this.isOverAllAnimationComplete ? true : false;
                        this.renderAnimation();
                    }
                }
            }
        }
    }
}


