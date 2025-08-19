import { Chart } from '../../chart/chart';
import { AccumulationChart } from '../../accumulation-chart/accumulation';
import { ChartAnnotationSettings } from '../../chart/model/chart-base';
import { createTemplate, measureElementRect, logBase, removeElement } from '../utils/helper';
import { ChartLocation, stringToNumber, appendElement, withIn } from '../utils/helper';
import { Rect } from '@syncfusion/ej2-svg-base';
import { Alignment, Position } from '../utils/enum';
import { AccPoints, AccumulationSeries, AccumulationAnnotationSettings } from '../../accumulation-chart/model/acc-base';
import { getPoint } from '../utils/helper';
import { Axis } from '../../chart/axis/axis';
import { DateFormatOptions, createElement, updateBlazorTemplate } from '@syncfusion/ej2-base';
import { IAnnotationRenderEventArgs } from '../../chart/model/chart-interface';
import { annotationRender } from '../model/constants';
import { DataUtil } from '@syncfusion/ej2-data';
import { StockChart } from '../../stock-chart';


/**
 * Annotation module handles the annotation for chart and accumulation series.
 */
export class AnnotationBase {

    private control: Chart | AccumulationChart;
    private annotation: AccumulationAnnotationSettings | ChartAnnotationSettings;
    private isChart: boolean;

    /**
     * Constructor for chart and accumulation annotation
     *
     * @param control
     */

    constructor(control: Chart | AccumulationChart) {
        this.control = control;
    }

    /**
     * Method to render the annotation for chart and accumulation series.
     *
     * @private
     * @param annotation
     * @param index
     */

    public render(annotation: AccumulationAnnotationSettings | ChartAnnotationSettings, index: number): HTMLElement {
        this.isChart = this.control.getModuleName() === 'chart';
        this.annotation = annotation;
        const childElement: HTMLElement = createTemplate(
            createElement('div', {
                id: this.control.element.id + '_Annotation_' + index,
                styles: 'position: absolute; z-index: 1'  //by default z-index set for annotation elements
            }),
            index, (this.control as Chart | AccumulationChart).enableHtmlSanitizer ?
                (this.control as Chart | AccumulationChart).sanitize(annotation.content) :
                annotation.content, this.control);
        return childElement;
    }

    /**
     * Method to calculate the location for annotation - coordinate unit as pixel.
     *
     * @private
     * @param location
     */

    public setAnnotationPixelValue(location: ChartLocation): boolean {
        const rect: Rect = this.annotation.region === 'Chart' ?
            new Rect(0, 0, this.control.availableSize.width, this.control.availableSize.height) :
            this.isChart ?
                (<Chart>this.control).chartAxisLayoutPanel.seriesClipRect :
                (<AccumulationSeries>this.control.series[0]).accumulationBound;
        location.x = ((typeof this.annotation.x !== 'string') ?
            ((typeof this.annotation.x === 'number') ? this.annotation.x : 0) :
            stringToNumber(this.annotation.x, rect.width)) + rect.x;
        location.y = ((typeof this.annotation.y === 'number') ? this.annotation.y :
            stringToNumber(this.annotation.y, rect.height)) + rect.y;
        return true;
    }

    /**
     * Method to calculate the location for annotation - coordinate unit as point.
     *
     * @private
     * @param location
     */

    public setAnnotationPointValue(location: ChartLocation): boolean {
        let symbolLocation: ChartLocation = new ChartLocation(0, 0);
        if (this.isChart) {
            const chart: Chart = <Chart>this.control;
            const annotation: ChartAnnotationSettings = <ChartAnnotationSettings>this.annotation;
            const xAxisName: string = annotation.xAxisName;
            const yAxisName: string = annotation.yAxisName;
            const isInverted: boolean = chart.requireInvertedAxis;
            const stockChart: StockChart = (this.control as Chart).stockChart;
            let xAxis: Axis; let yAxis: Axis;
            let xValue: number;
            for (const axis of chart.axisCollections) {
                if (xAxisName === axis.name || (xAxisName == null && axis.name === 'primaryXAxis')) {
                    xAxis = axis;
                    if (xAxis.isIndexed) {
                        xValue = Number(annotation.x);
                    }
                    else if (xAxis.valueType.indexOf('Category') > -1) {
                        const xAnnotation: string =  xAxis.valueType === 'DateTimeCategory' ? ((annotation.x as Date).getTime()).toString() :
                                                                                            <string>annotation.x;
                        if (typeof xAnnotation === 'object') {
                            for (let i: number = 0; i < xAxis.labels.length; i++) {
                                if (xAxis.labels[i as number].toString() === annotation.x.toString()) {
                                    xValue = i;
                                }
                            }
                        }
                        if (xAxis.labels.indexOf(xAnnotation) < 0) {
                            return false;
                        } else {
                            xValue = xAxis.labels.indexOf(xAnnotation);
                        }
                    } else if (xAxis.valueType === 'DateTime') {
                        const option: DateFormatOptions = { skeleton: 'full', type: 'dateTime' };
                        xValue = (typeof this.annotation.x === 'object' || typeof new Date(this.annotation.x) === 'object') ?
                            Date.parse(chart.intl.getDateParser(option)(
                                chart.intl.getDateFormat(option)(new Date(
                                    DataUtil.parse.parseJson({ val: annotation.x }).val
                                ))
                            )) : 0;
                    } else {
                        xValue = +annotation.x;
                    }
                } else if (yAxisName === axis.name || (yAxisName == null && axis.name === 'primaryYAxis')) {
                    yAxis = axis;
                }
            }
            if (xAxis && yAxis && withIn(
                xAxis.valueType === 'Logarithmic' ? logBase(xValue, xAxis.logBase) : xValue, xAxis.visibleRange
            ) && withIn(
                yAxis.valueType === 'Logarithmic' ? logBase(+annotation.y, yAxis.logBase) : +annotation.y, yAxis.visibleRange
            )) {
                symbolLocation = getPoint(
                    xValue, +annotation.y, xAxis, yAxis, isInverted
                );
                location.x = symbolLocation.x + (isInverted ? yAxis.rect.x : xAxis.rect.x);
                // for stockchart, stockchart's toolbar height and title size is added for annotation content
                location.y = symbolLocation.y + (isInverted ? xAxis.rect.y : yAxis.rect.y) +
                             ((stockChart && stockChart.enablePeriodSelector) ? stockChart.toolbarHeight + stockChart.titleSize.height : 0);
            } else {
                return false;
            }
            return true;
        } else {
            return this.setAccumulationPointValue(location);
        }
    }

    /**
     * To process the annotation for accumulation chart.
     *
     * @private
     * @param annotation
     * @param index
     * @param parentElement
     */

    public processAnnotation(
        annotation: ChartAnnotationSettings | AccumulationAnnotationSettings,
        index: number, parentElement: HTMLElement
    ): void {
        const chart: Chart = this.control as Chart;
        const location: ChartLocation = new ChartLocation(0, 0);
        const annotationElement: HTMLElement = this.render(annotation, index);
        const annotationRendered: Function = () => {
            annotationElement.style.transform = 'translate(-50%, -50%)';
        };
        annotationRendered.bind(location, this);
        if (this['setAnnotation' + annotation.coordinateUnits + 'Value'](location)) {
            this.setElementStyle(location, annotationElement, parentElement);
        } else if (this.control.redraw) {
            removeElement(annotationElement.id);
        }

        updateBlazorTemplate((this.control.element.id + 'Annotation' + index).replace(/[^a-zA-Z0-9]/g, ''), 'ContentTemplate',
                             chart.stockChart ? chart.stockChart.annotations[index as number] : this.control.annotations[index as number],
                             undefined, annotationRendered);

    }

    /**
     * Method to calculate the location for annotation - coordinate unit as point in accumulation chart.
     *
     * @private
     * @param location
     */

    public setAccumulationPointValue(location: ChartLocation): boolean {
        const accumulation: AccumulationChart = <AccumulationChart>this.control;
        let point: AccPoints;
        for (const accPoint of accumulation.visibleSeries[0].points) {
            if (typeof accPoint.x === 'object') {
                if (Date.parse(accPoint.x as string) === Date.parse(this.annotation.x as string) &&
                    accPoint.y === this.annotation.y) {
                    point = accPoint;
                    break;
                }
            } else {
                if (accPoint.x === this.annotation.x && accPoint.y === this.annotation.y) {
                    point = accPoint;
                    break;
                }
            }
        }
        if (point && point.visible) {
            location.x = point.symbolLocation.x;
            location.y = point.symbolLocation.y;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Method to set the element style for accumulation / chart annotation.
     *
     * @private
     * @param location
     * @param element
     * @param parentElement
     */

    public setElementStyle(
        location: ChartLocation, element: HTMLElement, parentElement: HTMLElement
    ): void {
        const elementRect: ClientRect = measureElementRect(element, this.control.redraw);
        const argsData: IAnnotationRenderEventArgs = {
            cancel: false, name: annotationRender, content: element,
            location: location
        };
        const chart: Chart = this.control as Chart;
        this.control.trigger(annotationRender, argsData);
        if (!argsData.cancel) {
            argsData.content.style.left = this.setAlignmentValue(
                this.annotation.horizontalAlignment, elementRect.width, argsData.location.x
            ) + 'px';
            argsData.content.style.top = this.setAlignmentValue(
                this.annotation.verticalAlignment, elementRect.height, argsData.location.y
            ) + 'px';
            const annotation: ChartAnnotationSettings = chart.annotationModule.annotation as ChartAnnotationSettings;
            if (chart.getModuleName() === 'chart' && annotation && annotation.accessibility) {
                argsData.content.setAttribute('aria-label', annotation.accessibility.accessibilityDescription ? annotation.accessibility.accessibilityDescription : 'Annotation');
                argsData.content.setAttribute('role', annotation.accessibility.accessibilityRole ? annotation.accessibility.accessibilityRole : 'img');
                argsData.content.setAttribute('tabindex', annotation.accessibility.focusable ? String(annotation.accessibility.tabIndex) : '-1');
                if (annotation.accessibility.focusable) { (argsData.content as HTMLElement).style.outline = 'none'; }
            }
            else {
                argsData.content.setAttribute('aria-label', this.annotation.description || 'Annotation');
                argsData.content.setAttribute('role', 'img');
            }
            appendElement(argsData.content, parentElement, this.control.redraw, true, 'left', 'top', this.control.duration);
        }
    }

    /**
     * Method to calculate the alignment value for annotation.
     *
     * @private
     * @param alignment
     * @param size
     * @param value
     */

    public setAlignmentValue(alignment: Alignment | Position, size: number, value: number): number {
        switch (alignment) {
        case 'Top': case 'Near': value -= size; break;
        case 'Bottom': case 'Far': value += 0; break;
        case 'Middle': case 'Center': value -= (size / 2); break;
        }
        return value;
    }
}
