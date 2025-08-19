import { RectOption, ChartLocation, appendChildElement, getElement, appendClipElement, withInBounds } from '../../common/utils/helper';
import { findlElement, drawSymbol, markerAnimate, CircleOption } from '../../common/utils/helper';
import { PathOption, Rect, Size, SvgRenderer, BaseAttibutes, CanvasRenderer } from '@syncfusion/ej2-svg-base';
import { Chart } from '../chart';
import { animationMode, isNullOrUndefined } from '@syncfusion/ej2-base';
import { BorderModel } from '../../common/model/base-model';
import { MarkerSettingsModel } from '../series/chart-series-model';
import { Series, Points } from './chart-series';
import { IPointRenderEventArgs } from '../../chart/model/chart-interface';
import { pointRender } from '../../common/model/constants';
import { MarkerExplode } from './marker-explode';
import { getSaturationColor } from '../../common/utils/helper';
import { ChartShape } from '../utils/enum';

export const markerShapes: ChartShape[] = ['Circle', 'Triangle', 'Diamond', 'Rectangle', 'Pentagon', 'InvertedTriangle', 'VerticalLine', 'Cross', 'Plus', 'HorizontalLine', 'Star'];
/**
 * The `Marker` module is used to render markers for line-type series.
 */
export class Marker extends MarkerExplode {

    /**
     * Constructor for the marker module.
     *
     * @private
     */

    constructor(chart: Chart) {
        super(chart);
        this.addEventListener();
    }


    /**
     * Render the marker for series.
     *
     * @returns {void}
     * @private
     */

    public render(series: Series): void {
        const redraw: boolean = series.chart.redraw;
        this.createElement(series, redraw);
        for (const point of series.points) {
            if (point.visible && point.symbolLocations && point.symbolLocations.length) {
                point.symbolLocations.map((location: ChartLocation, index: number) => {
                    if (series.marker.shape !== 'None') {
                        this.renderMarker(series, point, location, index, redraw);
                    }
                });
            }
        }
    }

    public renderMarker(
        series: Series, point: Points,
        location: ChartLocation, index: number, redraw: boolean
    ): void {
        const seriesIndex: number | string = series.index === undefined ? series.category : series.index;
        const marker: MarkerSettingsModel = series.marker;
        series.marker.shape = series.marker.shape ? series.marker.shape : markerShapes[seriesIndex as number % 10];
        const border: BorderModel = {
            color: marker.border.color,
            width: marker.border.width
        };
        const borderColor: string = marker.border.color;
        let previousLocation: ChartLocation;
        let previousPath: string;
        let circlePath: string;
        let shapeOption: PathOption;
        location.x = location.x + marker.offset.x;
        location.y = location.y - marker.offset.y;
        const isBoxPlot: boolean = series.type === 'BoxAndWhisker';
        const fill: string = marker.fill || ((isBoxPlot || series.marker.isFilled) ? point.interior || series.interior : '#ffffff');
        let markerElement: Element;
        const parentElement: Element = isBoxPlot && !this.chart.enableCanvas ?
            findlElement(series.seriesElement.childNodes, 'Series_' + series.index + '_Point_' + point.index)
            : series.symbolElement;
        border.color = borderColor || series.setPointColor(point, series.interior);
        const symbolId: string = this.elementId + '_Series_' + seriesIndex + '_Point_' + ((series.removedPointIndex !== null && series.removedPointIndex <= point.index) || this.chart.pointsAdded ?
            (point.index + 1) : point.index) + '_Symbol' + (index ? index : '');
        const argsData: IPointRenderEventArgs = {
            cancel: false, name: pointRender, series: series, point: point,
            fill: point.isEmpty ? (series.emptyPointSettings.fill || fill) : fill,
            border: {
                color: series.type === 'BoxAndWhisker' ?
                    (!isNullOrUndefined(borderColor) && borderColor !== 'transparent') ? borderColor :
                        getSaturationColor(fill, -0.6)
                    : border.color,
                width: border.width
            },
            height: marker.height, width: marker.width, shape: marker.shape
        };
        argsData.border = series.setBorderColor(point, { width: argsData.border.width, color: argsData.border.color });
        if (!series.isRectSeries || series.type === 'BoxAndWhisker') {
            this.chart.trigger(pointRender, argsData);
            point.color = argsData.fill;
        }
        if (!argsData.cancel) {
            let y: Object;
            if (series.type === 'RangeArea' || series.type === 'RangeColumn' || series.drawType === 'RangeColumn'
            || series.type === 'SplineRangeArea' || series.type === 'RangeStepArea') {
                y = index ? point.low : point.high;
            } else if (isBoxPlot) {
                y = point.outliers[index as number];
            } else {
                y = point.y;
            }
            const markerFill: string = argsData.point.marker.fill || argsData.fill;
            let markerBorder: BorderModel;
            if (!isNullOrUndefined(argsData.point.marker.border)) {
                markerBorder = {
                    color: argsData.point.marker.border.color || argsData.border.color,
                    width: argsData.point.marker.border.width || argsData.border.width
                };
            } else {
                markerBorder = { color: argsData.border.color, width: argsData.border.width };
            }
            const markerWidth: number = argsData.point.marker.width || argsData.width;
            const markerHeight: number = argsData.point.marker.height || argsData.height;
            const markerOpacity: number = argsData.point.marker.opacity || marker.opacity;
            const markerShape: ChartShape = argsData.point.marker.shape || argsData.shape;
            const imageURL : string = argsData.point.marker.imageUrl || marker.imageUrl;
            shapeOption = new PathOption(
                symbolId, markerFill, markerBorder.width, markerBorder.color, markerOpacity, series.marker.border.dashArray
            );
            if ((parentElement !== undefined && parentElement !== null) || this.chart.enableCanvas) {
                if (redraw && getElement(shapeOption.id)) {
                    markerElement = getElement(shapeOption.id);
                    circlePath = markerShape === 'Circle' ? 'c' : '';
                    previousLocation = {
                        x: +markerElement.getAttribute(circlePath + 'x'), y: +markerElement.getAttribute(circlePath + 'y')
                    };
                    previousPath = markerElement.getAttribute('d');
                }
                markerElement = drawSymbol(
                    location, markerShape,
                    new Size(markerWidth, markerHeight),
                    imageURL, shapeOption,
                    point.x.toString() + ':' + y.toString(), this.chart.renderer, series.clipRect
                );
                if (markerElement) {
                    markerElement.setAttribute('role', 'img');
                    if (series.category === 'TrendLine' && (shapeOption.id === this.elementId + '_Series_0_Point_0_Symbol')) {
                        markerElement.setAttribute('tabindex', '0');
                        markerElement.setAttribute('class', 'e-chart-focused');
                    }
                    markerElement.setAttribute('aria-label', series.accessibility.accessibilityDescriptionFormat ? series.formatAccessibilityDescription(point, series) : (point.x + ': ' + point.y + ', ' + series.name));
                }
                appendChildElement(
                    this.chart.enableCanvas, parentElement, markerElement, redraw, true, circlePath + 'x', circlePath + 'y',
                    previousLocation, previousPath, false, false, null, series.chart.duration
                );
                if ((series.removedPointIndex !== null && series.removedPointIndex <= point.index)) {
                    (parentElement.lastChild as HTMLElement).id = this.elementId + '_Series_' + seriesIndex + '_Point_' + point.index + '_Symbol' + (index ? index : '');
                }
            }
            point.marker = {
                border: markerBorder, fill: markerFill, height: markerHeight,
                visible: true, shape: markerShape, width: markerWidth, imageUrl: imageURL
            };
        } else {
            location = null;
            point.marker = {
                visible: false
            };
        }
    }

    public createElement(series: Series, redraw: boolean): void {
        let markerClipRect: Element;
        const marker: MarkerSettingsModel = series.marker;
        // 8 for extend border value 5 for extend size value
        const explodeValue: number = marker.border.width + (this.chart.zoomModule &&
            this.chart.zoomModule.isAxisZoomed(this.chart.axisCollections) ? 0 : 8 + 5);
        const render: SvgRenderer | CanvasRenderer = series.chart.svgRenderer;
        const index: number | string = series.index === undefined ? series.category : series.index;
        let options: RectOption | CircleOption | BaseAttibutes;
        const transform: string = series.chart.chartAreaType === 'Cartesian' ? 'translate(' + series.clipRect.x + ',' + (series.clipRect.y) + ')' : '';
        if (marker.visible) {
            const markerHeight: number = (marker.height + explodeValue) / 2;
            const markerWidth: number = (marker.width + explodeValue) / 2;
            if (series.chart.chartAreaType === 'Cartesian') {
                options = new RectOption(this.elementId + '_ChartMarkerClipRect_' + index, 'transparent', { width: 1, color: 'Gray' }, 1, {
                    x: -markerWidth, y: -markerHeight,
                    width: series.clipRect.width + (markerWidth * 2),
                    height: series.clipRect.height + markerHeight * 2
                }, 0, 0, '', series.marker.border.dashArray);
                markerClipRect = appendClipElement(redraw, options, render as SvgRenderer);
            } else {
                options = new CircleOption(
                    this.elementId + '_ChartMarkerClipRect_' + index, 'transparent', { width: 1, color: 'Gray' }, 1,
                    series.clipRect.width / 2 + series.clipRect.x, series.clipRect.height / 2 + series.clipRect.y,
                    series.chart.radius + Math.max(markerHeight, markerWidth)
                );
                markerClipRect = appendClipElement(redraw, options, render as SvgRenderer, 'drawCircularClipPath');
            }
            options = {
                'id': this.elementId + 'SymbolGroup' + index,
                'transform': transform,
                'clip-path': 'url(#' + this.elementId + '_ChartMarkerClipRect_' + index + ')'
            };
            series.symbolElement = render.createGroup(options);
            series.symbolElement.appendChild(markerClipRect);
            if (this.chart.enableCanvas) {
                const element: HTMLElement = document.getElementById(this.chart.element.id + '_tooltip_svg');
                element.appendChild(series.symbolElement);
            }
        }
    }

    private getRangeLowPoint(region: Rect, series: Series): ChartLocation {
        let x: number = region.x;
        let y: number = region.y;
        if (series.chart.requireInvertedAxis) {
            y += region.height / 2;
            x += series.yAxis.isAxisInverse ? region.width : 0;
        } else {
            y += series.yAxis.isAxisInverse ? 0 : region.height;
            x += region.width / 2;
        }
        return { x: x, y: y };
    }

    /**
     * Calculates the distance between two points in a chart.
     *
     * @param {ChartLocation} startPoint - The starting point with x and y coordinates.
     * @param {ChartLocation} endPoint - The ending point with x and y coordinates.
     * @returns {number} - The distance between the startPoint and endPoint.
     */
    private calculateDistance(startPoint: ChartLocation, endPoint: ChartLocation): number {
        const dx: number = endPoint.x - startPoint.x;
        const dy: number = endPoint.y - startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Perform marker animation for the given series.
     *
     * @param {Series} series - The series for which marker animation needs to be performed.
     * @returns {void}
     * @private
     */
    public doMarkerAnimation(series: Series): void {
        if (!(series.type === 'Scatter' || series.type === 'Bubble' || series.type === 'Candle' || series.type === 'Hilo' ||
            series.type === 'HiloOpenClose' || (series.chart.chartAreaType === 'PolarRadar' && (series.drawType === 'Scatter')))) {
            const markerElements: NodeList = series.symbolElement.childNodes;
            const delay: number = series.animation.delay + (series.animation.duration === 0 && animationMode === 'Enable' ? 1000 : series.animation.duration);
            let duration: number = series.chart.animated ? series.chart.duration : 200;
            let markerDelay: number = delay;
            const pathLength: number = <SVGPathElement>series.pathElement ? (<SVGPathElement>series.pathElement).getTotalLength() : 0;
            const distances: number[] = [];
            for (let i: number = 1; (series.type === 'Line' && i < series.points.length); i++) {
                if (series.points[i - 1 as number].symbolLocations[0] && series.points[i as number].symbolLocations[0])
                {
                    const distance: number = this.calculateDistance(series.points[i - 1 as number].symbolLocations[0],
                                                                    series.points[i as number].symbolLocations[0]);
                    distances.push(distance);
                }
            }
            let j: number = 1;
            const incFactor: number = (series.type === 'RangeArea' || series.type === 'RangeColumn' || series.type === 'SplineRangeArea' || series.type === 'RangeStepArea') ? 2 : 1;
            for (let i: number = 0; i < series.points.length; i++) {
                if (series.points[i as number].symbolLocations) {
                    if (!series.points[i as number].symbolLocations.length || !markerElements[j as number]) {
                        continue;
                    }
                    if (series.type === 'Line') {
                        if (i === 0) { markerDelay = 0; }
                        if (i > 0) {
                            markerDelay += (distances[i - 1] / pathLength) * delay;
                            duration = 0;
                        }
                    }
                    markerAnimate(markerElements[j as number] as HTMLElement, markerDelay, duration, series,
                                  i, series.points[i as number].symbolLocations[0], false);
                    if (incFactor === 2) {
                        const lowPoint: ChartLocation = this.getRangeLowPoint(series.points[i as number].regions[0], series);
                        markerAnimate(markerElements[j + 1] as HTMLElement, markerDelay, duration, series, i, lowPoint, false);
                    }
                    j += incFactor;
                }
            }
        }
    }
}
