import { Axis } from '../axis/axis';
import { getMinPointsDelta, getActualDesiredIntervalsCount, setRange, triggerLabelRender, logWithIn } from '../../common/utils/helper';
import { Size } from '@syncfusion/ej2-svg-base';
import { DoubleRange } from '../utils/double-range';
import { Chart } from '../chart';
import { Points, Series } from '../series/chart-series';
import { withIn, logBase } from '../../common/utils/helper';
import { RangeNavigator } from '../../range-navigator';
import { isNullOrUndefined, extend, getValue } from '@syncfusion/ej2-base';
import { Font } from '../../common/model/base';


/**
 * The `Double` module is used to render the numeric axis in charts.
 */

export class Double {
    /** @private */
    public chart: Chart;
    /** @private */
    public min: Object;
    /** @private */
    public max: Object;
    private isDrag: boolean;
    private interval: number;
    private paddingInterval: number;
    private isColumn: number = 0;
    private isStacking: boolean = false;
    /**
     * Constructor for the dateTime module.
     *
     * @private
     * @param {Chart} chart - Specifies the chart.
     */
    constructor(chart?: Chart) {
        this.chart = chart;
    }

    /**
     * Numeric Nice Interval for the axis.
     *
     * @private
     * @param {Axis} axis - The axis.
     * @param {number} delta - The delta value.
     * @param {Size} size - The size.
     * @returns {number} - The calculated nice interval.
     */
    protected calculateNumericNiceInterval(axis: Axis, delta: number, size: Size): number {
        const actualDesiredIntervalsCount: number = getActualDesiredIntervalsCount(size, axis);
        let niceInterval: number = delta / actualDesiredIntervalsCount;
        if (!isNullOrUndefined(axis.desiredIntervals)) {
            if (this.isAutoIntervalOnBothAxis(axis)) {
                return niceInterval;
            }
        }

        const minInterval: number = Math.pow(10, Math.floor(logBase(niceInterval, 10)));
        for (const interval of axis.intervalDivs) {
            const currentInterval: number = minInterval * interval;
            if (actualDesiredIntervalsCount < (delta / currentInterval)) {
                break;
            }
            niceInterval = currentInterval;
        }
        return niceInterval;
    }

    /**
     * Determines whether auto interval is enabled on both axes.
     *
     * @private
     * @param {Axis} axis - The axis.
     * @returns {boolean} - The boolean value indicating if auto interval is enabled on both axes.
     */
    public isAutoIntervalOnBothAxis(axis: Axis): boolean {
        if (((axis.zoomFactor < 1 || axis.zoomPosition > 0) && axis.enableAutoIntervalOnZooming)) {
            return false;
        }
        else {
            return true;
        }
    }

    public getActualRange(axis: Axis, size: Size): void {
        this.initializeDoubleRange(axis);
        if ((!axis.startFromZero) && (this.isColumn > 0)) {
            axis.actualRange.interval = axis.interval || this.calculateNumericNiceInterval(axis, axis.doubleRange.delta, size);
            axis.actualRange.max = axis.doubleRange.end + axis.actualRange.interval;
            if ((axis.doubleRange.start - axis.actualRange.interval < 0 && axis.doubleRange.start > 0)) {
                axis.actualRange.min = 0;
            } else {
                axis.actualRange.min = axis.doubleRange.start - (this.isStacking ? 0 : axis.actualRange.interval);
            }
        } else {
            axis.actualRange.interval = axis.interval || this.calculateNumericNiceInterval(axis, axis.doubleRange.delta, size);
            axis.actualRange.min = axis.doubleRange.start;
            axis.actualRange.max = axis.doubleRange.end;
        }
    }

    /**
     * Range for the axis.
     *
     * @private
     * @param {Axis} axis - The axis.
     * @returns {void}
     */
    public initializeDoubleRange(axis: Axis): void {
        //Axis Min
        if ((<number>axis.minimum) !== null) {
            this.min = <number>axis.minimum;
        } else if (this.min === null || this.min === Number.POSITIVE_INFINITY) {
            this.min = 0;
        }
        // Axis Max
        if ((<number>axis.maximum) !== null) {
            this.max = <number>axis.maximum;
        } else if (this.max === null || this.max === Number.NEGATIVE_INFINITY) {
            this.max = 5;
        }
        if (this.min === this.max) {
            this.max = axis.valueType.indexOf('Category') > -1 ? this.max : <number>this.min + 1;
        }
        axis.doubleRange = new DoubleRange(<number>this.min, <number>this.max);
        axis.actualRange = {};
    }

    /**
     * The function to calculate the range and labels for the axis.
     *
     * @returns {void}
     * @private
     */

    public calculateRangeAndInterval(size: Size, axis: Axis): void {

        this.calculateRange(axis);

        this.getActualRange(axis, size);

        this.applyRangePadding(axis, size);

        this.calculateVisibleLabels(axis, this.chart);
    }


    /**
     * Calculate Range for the axis.
     *
     * @private
     */

    protected calculateRange(axis: Axis): void {
        /** Generate axis range */
        this.min = null; this.max = null;
        if (!setRange(axis)) {
            for (const series of axis.series) {
                if (!series.visible) {
                    continue;
                }
                this.paddingInterval = 0;
                if (!isNullOrUndefined(series.points)) {
                    axis.maxPointLength = series.points.length;
                }
                axis.maxPointLength = series.points.length;
                if (((series.type.indexOf('Column') > -1 || series.type.indexOf('Histogram') > -1) && axis.orientation === 'Horizontal')
                    || (series.type.indexOf('Bar') > -1 && axis.orientation === 'Vertical')) {
                    if ((series.xAxis.valueType === 'Double' || series.xAxis.valueType === 'DateTime')
                        && series.xAxis.rangePadding === 'Auto') {
                        this.paddingInterval = getMinPointsDelta(series.xAxis, axis.series) * 0.5;
                    }
                }
                //For xRange
                if (axis.orientation === 'Horizontal') {
                    if (this.chart.requireInvertedAxis) {
                        this.yAxisRange(axis, series);
                    } else {
                        this.findMinMax(<number>series.xMin - this.paddingInterval, <number>series.xMax + this.paddingInterval);
                    }
                }
                // For yRange
                if (axis.orientation === 'Vertical') {
                    this.isColumn += (series.type.indexOf('Column') !== -1 || series.type.indexOf('Bar') !== -1 || series.drawType === 'Column') ? 1 : 0;
                    this.isStacking = series.type.indexOf('Stacking') !== -1;
                    if (this.chart.requireInvertedAxis) {
                        this.findMinMax(<number>series.xMin - this.paddingInterval, <number>series.xMax + this.paddingInterval);
                    } else {
                        this.yAxisRange(axis, series);
                    }
                }
            }
        }
    }
    private yAxisRange(axis: Axis, series: Series): void {
        if (series.dragSettings.enable && this.chart.dragY) {
            if (this.chart.dragY >= axis.visibleRange.max) {
                series.yMax = this.chart.dragY + axis.visibleRange.interval;
            }
            if (this.chart.dragY <= axis.visibleRange.min) {
                series.yMin = this.chart.dragY - axis.visibleRange.interval;
            }
        }
        if (series.type === 'Waterfall') {
            let cumulativeMax: number = 0;
            let cumulativeValue: number = 0;
            for (let i: number = 0; i < series.yData.length; i++) {
                if (!(series.intermediateSumIndexes && series.intermediateSumIndexes.indexOf(i as number) !== -1) &&
                    !(series.sumIndexes && series.sumIndexes.indexOf(i as number) !== -1)) {
                    cumulativeValue += series.yData[i as number];
                }
                if (cumulativeValue > cumulativeMax) {
                    cumulativeMax = cumulativeValue;
                }
            }
            this.findMinMax(series.yMin, cumulativeMax);
        } else {
            this.findMinMax(series.yMin, series.yMax);
        }
    }
    private findMinMax(min: Object, max: Object): void {
        if (this.min === null || this.min > min) {
            this.min = <number>min;
        }
        if (this.max === null || this.max < max) {
            this.max = <number>max;
        }
        if ((this.max === this.min) && this.max < 0 && this.min < 0) { // max == min
            this.max = 0;
        }
    }
    /**
     * Apply padding for the range.
     *
     * @private
     * @param {Axis} axis - The axis for which padding is applied.
     * @param {Size} size - The size used for padding calculation.
     * @returns {void}
     */
    public applyRangePadding(axis: Axis, size: Size): void {
        const start: number = axis.actualRange.min;
        const end: number = axis.actualRange.max;
        if (!setRange(axis)) {
            const interval: number = axis.actualRange.interval;
            const padding: string = axis.getRangePadding(this.chart);
            if (padding === 'Additional' || padding === 'Round') {
                this.findAdditional(axis, start, end, interval, size);
            } else if (padding === 'Normal' ) {
                this.findNormal(axis, start, end, interval, size);
            } else {
                this.updateActualRange(axis, start, end, interval);
            }
        }
        axis.actualRange.delta = axis.actualRange.max - axis.actualRange.min;

        this.calculateVisibleRange(size, axis);
    }

    public updateActualRange(axis: Axis, minimum: number, maximum: number, interval: number): void {
        axis.actualRange = {
            min: axis.minimum != null ? <number>axis.minimum : minimum,
            max: axis.maximum != null ? <number>axis.maximum : maximum,
            interval: axis.interval != null ? axis.interval : interval,
            delta: axis.actualRange.delta
        };
    }

    private findAdditional(axis: Axis, start: number, end: number, interval: number, size: Size): void {
        let minimum: number; let maximum: number;
        minimum = Math.floor(start / interval) * interval;
        maximum = Math.ceil(end / interval) * interval;
        if (axis.rangePadding === 'Additional') {
            minimum -= interval;
            maximum += interval;
        }

        if (!isNullOrUndefined(axis.desiredIntervals)) {
            const delta: number = maximum - minimum;
            interval = this.calculateNumericNiceInterval(axis, delta, size);
        }

        this.updateActualRange(axis, minimum, maximum, interval);
    }

    private findNormal(axis: Axis, start: number, end: number, interval: number, size: Size): void {
        let remaining: number; let minimum: number; let maximum: number;
        let startValue: number = start;
        if (start < 0) {
            startValue = 0;
            minimum = start + (start * 0.05);
            remaining = interval + (minimum % interval);
            if ((0.365 * interval) >= remaining) {
                minimum -= interval;
            }
            if (minimum % interval < 0) {
                minimum = (minimum - interval) - (minimum % interval);
            }
        } else {
            minimum = start < ((5.0 / 6.0) * end) ? 0 : (start - (end - start) * 0.5);
            if (minimum % interval > 0) {
                minimum -= (minimum % interval);
            }
        }

        maximum = (end > 0) ? (end + (end - startValue) * 0.05) : (end - (end - startValue) * 0.05);
        remaining = interval - (maximum % interval);
        if ((0.365 * interval) >= remaining) {
            maximum += interval;
        }
        if (maximum % interval > 0) {
            maximum = (maximum + interval) - (maximum % interval);
        }
        axis.doubleRange = new DoubleRange(minimum, maximum);
        if (minimum === 0 || (minimum < 0 && maximum < 0)) {
            interval = this.calculateNumericNiceInterval(axis, axis.doubleRange.delta, size);
            maximum = Math.ceil(maximum / interval) * interval;
        }
        this.updateActualRange(axis, minimum, maximum, interval);
    }


    /**
     * Calculate visible range for axis.
     *
     * @private
     * @param {Size} size - The size used for calculation.
     * @param {Axis} axis - The axis for which the visible range is calculated.
     * @returns {void}
     */
    protected calculateVisibleRange(size: Size, axis: Axis): void {
        axis.visibleRange = {
            max: axis.actualRange.max, min: axis.actualRange.min,
            delta: axis.actualRange.delta, interval: axis.actualRange.interval
        };
        if (this.chart.chartAreaType === 'Cartesian') {
            const isLazyLoad : boolean = isNullOrUndefined(axis.zoomingScrollBar) ? false : axis.zoomingScrollBar.isLazyLoad;
            if ((axis.zoomFactor < 1 || axis.zoomPosition > 0) && !isLazyLoad) {
                axis.calculateVisibleRangeOnZooming();
                axis.visibleRange.interval = (axis.enableAutoIntervalOnZooming) ?
                    this.calculateNumericNiceInterval(axis, axis.doubleRange.delta, size)
                    : axis.visibleRange.interval;
            }
        }
        const rangeDifference: number = (axis.visibleRange.max - axis.visibleRange.min) % axis.visibleRange.interval;
        if (rangeDifference !== 0 && !isNaN(rangeDifference) && axis.valueType === 'Double' &&
            axis.orientation === 'Vertical' && axis.rangePadding === 'Auto') {
            let duplicateTempInterval: number;
            let tempInterval: number = axis.visibleRange.min;
            for (; (tempInterval <= axis.visibleRange.max) && (duplicateTempInterval !== tempInterval);
                tempInterval += axis.visibleRange.interval) {
                duplicateTempInterval = tempInterval;
            }
            if (duplicateTempInterval < axis.visibleRange.max) {
                axis.visibleRange.max = duplicateTempInterval + axis.visibleRange.interval;
            }
        }
        axis.triggerRangeRender(this.chart, axis.visibleRange.min, axis.visibleRange.max, axis.visibleRange.interval);
    }


    /**
     * Calculate label for the axis.
     *
     * @private
     */

    public calculateVisibleLabels(axis: Axis, chart: Chart | RangeNavigator): void {
        /** Generate axis labels */
        axis.visibleLabels = [];
        let tempInterval: number = axis.visibleRange.min;
        let labelStyle: Font;
        const controlName: string = chart.getModuleName();
        const isPolarRadar: boolean = controlName === 'chart' && (chart as Chart).chartAreaType === 'PolarRadar';
        if (!isPolarRadar && (axis.zoomFactor < 1 || axis.zoomPosition > 0 || this.paddingInterval)) {
            tempInterval = axis.visibleRange.min - (axis.visibleRange.min % axis.visibleRange.interval);
        }
        const format: string = this.getFormat(axis);
        const isCustom: boolean = format.match('{value}') !== null;
        let intervalDigits: number = 0;
        let formatDigits: number = 0;
        if (axis.labelFormat && axis.labelFormat.indexOf('n') > -1 ) {
            formatDigits = parseInt(axis.labelFormat.substring(1, axis.labelFormat.length), 10);
        }
        axis.format = chart.intl.getNumberFormat({
            format: isCustom ? '' : format,
            useGrouping: chart.useGroupingSeparator
        });
        axis.startLabel = axis.format(axis.visibleRange.min);
        axis.endLabel = axis.format(axis.visibleRange.max);
        if (axis.visibleRange.interval && (axis.visibleRange.interval + '').indexOf('.') >= 0) {
            intervalDigits = (axis.visibleRange.interval + '').split('.')[1].length;
        }
        let duplicateTempInterval: number;
        for (; (tempInterval <= axis.visibleRange.max) && (duplicateTempInterval !== tempInterval);
            tempInterval += axis.visibleRange.interval) {
            duplicateTempInterval = tempInterval;
            labelStyle = <Font>(extend({}, getValue('properties', axis.labelStyle), null, true));
            if (withIn(tempInterval, axis.visibleRange)) {
                triggerLabelRender(chart, tempInterval, this.formatValue(axis, isCustom, format, tempInterval), labelStyle, axis);
            }
        }
        if (tempInterval && (tempInterval + '').indexOf('.') >= 0 && (tempInterval + '').split('.')[1].length > 10) {
            tempInterval = (tempInterval + '').split('.')[1].length > (formatDigits || intervalDigits) ?
                +tempInterval.toFixed(formatDigits || intervalDigits) : tempInterval;
            if (tempInterval <= axis.visibleRange.max) {
                triggerLabelRender(chart, tempInterval, this.formatValue(axis, isCustom, format, tempInterval), labelStyle, axis);
            }
        }
        if (axis.getMaxLabelWidth) {
            axis.getMaxLabelWidth(this.chart);
        }
    }

    /**
     * Format of the axis label.
     *
     * @private
     */

    protected getFormat(axis: Axis): string {
        if (axis.labelFormat) {
            if (axis.labelFormat.indexOf('p') === 0 && axis.labelFormat.indexOf('{value}') === -1 && axis.isStack100) {
                return '{value}%';
            }
            return axis.labelFormat;
        }
        return axis.isStack100 ? '{value}%' : '';
    }

    /**
     * Formatted the axis label.
     *
     * @private
     */

    public formatValue(axis: Axis, isCustom: boolean, format: string, tempInterval: number): string {
        /*The toLocaleString method is used to adjust the decimal points for this ticket, specifically for ticket numbers I481747 and I541484.*/
        const labelValue: number = !(tempInterval % 1) ? tempInterval : Number(tempInterval.toLocaleString('en-US').split(',').join(''));
        return isCustom ? format.replace('{value}', axis.format(labelValue))
            : format ? axis.format(tempInterval) : axis.format(labelValue);
    }

    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name.
     */
    protected getModuleName(): string {
        /**
         * Returns the module name
         */
        return 'Double';
    }

    /**
     * To destroy the double axis.
     *
     * @returns {void}
     * @private
     */
    public destroy(): void {
        /**
         * Destroy method performed here.
         */
    }
}
