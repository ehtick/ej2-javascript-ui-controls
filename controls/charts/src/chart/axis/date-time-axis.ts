import { DateFormatOptions } from '@syncfusion/ej2-base';
import { Axis, VisibleLabels } from '../axis/axis';
import { isZoomSet, setRange, triggerLabelRender } from '../../common/utils/helper';
import { Size } from '@syncfusion/ej2-svg-base';
import { RangeIntervalType } from '../../common/utils/enum';
import { DoubleRange } from '../utils/double-range';
import { IntervalType, ChartRangePadding } from '../../common/utils/enum';
import { withIn, firstToLowerCase } from '../../common/utils/helper';
import { Chart } from '../chart';
import { DataUtil } from '@syncfusion/ej2-data';
import { NiceInterval } from '../axis/axis-helper';
import { extend, getValue, isNullOrUndefined } from '@syncfusion/ej2-base';
import { Font } from '../../common/model/base';
import { RangeNavigator } from '../../range-navigator/index';


/**
 * The `DateTime` module is used to render the datetime axis in charts.
 *
 * @private
 */

export class DateTime extends NiceInterval {

    public min: number;
    public max: number;
    public startValue: number;

    /**
     * Constructor for the dateTime module.
     *
     * @private
     * @param {Chart} chart - Specifies the chart.
     */
    constructor(chart?: Chart) {
        super(chart);
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
     * Actual Range for the axis.
     *
     * @private
     * @param {Axis} axis - The axis for which the actual range is calculated.
     * @param {Size} size - The size used for calculation.
     * @returns {void}
     */
    public getActualRange(axis: Axis, size: Size): void {
        const option: DateFormatOptions = {
            skeleton: 'full',
            type: 'dateTime'
        };
        const dateParser: Function = this.chart.intl.getDateParser(option);
        const dateFormatter: Function = this.chart.intl.getDateFormat(option);
        // Axis min
        if ((axis.minimum) !== null) {
            this.min = this.chart.isBlazor ? Date.parse(axis.minimum.toString()) : Date.parse(dateParser(dateFormatter(new Date(
                DataUtil.parse.parseJson({ val: axis.minimum }).val
            ))));
        } else if (this.min === null || this.min === Number.POSITIVE_INFINITY) {
            this.min = Date.parse(dateParser(dateFormatter(new Date(1970, 1, 1))));
        }
        // Axis Max
        if ((axis.maximum) !== null) {
            this.max = this.chart.isBlazor ? Date.parse(axis.maximum.toString()) : Date.parse(dateParser(dateFormatter(new Date(
                DataUtil.parse.parseJson({ val: axis.maximum }).val
            ))));
        } else if (this.max === null || this.max === Number.NEGATIVE_INFINITY) {
            this.max = Date.parse(dateParser(dateFormatter(new Date(1970, 5, 1))));
        }

        if (this.min === this.max) {
            this.max = <number>this.max + 2592000000;
            this.min = <number>this.min - 2592000000;
        }
        axis.actualRange = {};
        axis.doubleRange = new DoubleRange(<number>this.min, <number>this.max);
        const datetimeInterval: number = this.calculateDateTimeNiceInterval(axis, size, axis.doubleRange.start, axis.doubleRange.end);

        if (!axis.interval) {
            axis.actualRange.interval = datetimeInterval;
        } else {
            axis.actualRange.interval = axis.interval;
        }
        axis.actualRange.min = axis.doubleRange.start;
        axis.actualRange.max = axis.doubleRange.end;
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
        this.min = (axis.actualRange.min); this.max = (axis.actualRange.max);
        let minimum: Date; let maximum: Date;
        const interval: number = axis.actualRange.interval;
        if (!setRange(axis)) {
            const rangePadding: string = axis.getRangePadding(this.chart);
            minimum = new Date(this.min); maximum = new Date(this.max);
            const intervalType: IntervalType = axis.actualIntervalType;
            if (rangePadding === 'None') {
                this.min = minimum.getTime();
                this.max = maximum.getTime();
            } else if (rangePadding === 'Additional' || rangePadding === 'Round') {
                switch (intervalType) {
                case 'Years':
                    this.getYear(minimum, maximum, rangePadding, interval);
                    break;
                case 'Months':
                    this.getMonth(minimum, maximum, rangePadding, interval);
                    break;
                case 'Days':
                    this.getDay(minimum, maximum, rangePadding, interval);
                    break;
                case 'Hours':
                    this.getHour(minimum, maximum, rangePadding, interval);
                    break;
                case 'Minutes': {
                    const minute: number = (minimum.getMinutes() / interval) * interval;
                    const endMinute: number = maximum.getMinutes() + (minimum.getMinutes() - minute);
                    if (rangePadding === 'Round') {
                        this.min = (
                            new Date(
                                minimum.getFullYear(), minimum.getMonth(), minimum.getDate(),
                                minimum.getHours(), minute, 0
                            )
                        ).getTime();
                        this.max = (
                            new Date(
                                maximum.getFullYear(), maximum.getMonth(), maximum.getDate(),
                                maximum.getHours(), endMinute, 59
                            )
                        ).getTime();
                    } else {
                        this.min = (
                            new Date(
                                minimum.getFullYear(), minimum.getMonth(), minimum.getDate(),
                                minimum.getHours(), minute + (-interval), 0
                            )
                        ).getTime();
                        this.max = (
                            new Date(
                                maximum.getFullYear(), maximum.getMonth(),
                                maximum.getDate(), maximum.getHours(), endMinute + (interval), 0
                            )
                        ).getTime();
                    }
                    break;
                }
                case 'Seconds': {
                    const second: number = (minimum.getSeconds() / interval) * interval;
                    const endSecond: number = maximum.getSeconds() + (minimum.getSeconds() - second);
                    if (rangePadding === 'Round') {
                        this.min = (
                            new Date(
                                minimum.getFullYear(), minimum.getMonth(), minimum.getDate(),
                                minimum.getHours(), minimum.getMinutes(), second, 0
                            )
                        ).getTime();
                        this.max = (
                            new Date(
                                maximum.getFullYear(), maximum.getMonth(), maximum.getDate(),
                                maximum.getHours(), maximum.getMinutes(), endSecond, 0
                            )
                        ).getTime();
                    } else {
                        this.min = (
                            new Date(
                                minimum.getFullYear(), minimum.getMonth(), minimum.getDate(),
                                minimum.getHours(), minimum.getMinutes(), second + (-interval), 0
                            )
                        ).getTime();
                        this.max = (
                            new Date(
                                maximum.getFullYear(), maximum.getMonth(), maximum.getDate(),
                                maximum.getHours(), maximum.getMinutes(), endSecond + (interval), 0
                            )).getTime();
                    }
                    break;
                }
                }
            }
        }
        axis.actualRange.min = (axis.minimum != null) ? <number>this.min : this.min;
        axis.actualRange.max = (axis.maximum != null) ? <number>this.max : this.max;
        axis.actualRange.delta = (axis.actualRange.max - axis.actualRange.min);
        axis.doubleRange = new DoubleRange(axis.actualRange.min, axis.actualRange.max);
        this.calculateVisibleRange(size, axis);
    }

    private getYear(minimum: Date, maximum: Date, rangePadding: ChartRangePadding, interval: number): void {
        const startYear: number = minimum.getFullYear();
        const endYear: number = maximum.getFullYear();
        if (rangePadding === 'Additional') {
            this.min = (new Date(startYear - interval, 1, 1, 0, 0, 0)).getTime();
            this.max = (new Date(endYear + interval, 1, 1, 0, 0, 0)).getTime();
        } else {
            this.min = new Date(startYear, 0, 0, 0, 0, 0).getTime();
            this.max = new Date(endYear, 11, 30, 23, 59, 59).getTime();
        }
    }
    private getMonth(minimum: Date, maximum: Date, rangePadding: ChartRangePadding, interval: number): void {
        const month: number = minimum.getMonth();
        const endMonth: number = maximum.getMonth();
        if (rangePadding === 'Round') {
            this.min = (new Date(minimum.getFullYear(), month, 0, 0, 0, 0)).getTime();
            this.max = (
                new Date(
                    maximum.getFullYear(), endMonth,
                    new Date(maximum.getFullYear(), maximum.getMonth(), 0).getDate(), 23, 59, 59
                )
            ).getTime();
        } else {
            this.min = (new Date(minimum.getFullYear(), month + (-interval), 1, 0, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), endMonth + (interval), endMonth === 2 ? 28 : 30, 0, 0, 0)).getTime();
        }
    }
    private getDay(minimum: Date, maximum: Date, rangePadding: ChartRangePadding, interval: number): void {
        const day: number = minimum.getDate();
        const endDay: number = maximum.getDate();
        if (rangePadding === 'Round') {
            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), day, 0, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), endDay, 23, 59, 59)).getTime();
        } else {
            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), day + (-interval), 0, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), endDay + (interval), 0, 0, 0)).getTime();
        }
    }
    private getHour(minimum: Date, maximum: Date, rangePadding: ChartRangePadding, interval: number): void {
        const hour: number = (minimum.getHours() / interval) * interval;
        const endHour: number = maximum.getHours() + (minimum.getHours() - hour);
        if (rangePadding === 'Round') {
            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate(), hour, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), maximum.getDate(), endHour, 59, 59)).getTime();
        } else {
            this.min = (new Date(
                minimum.getFullYear(), minimum.getMonth(), minimum.getDate(),
                hour + (-interval), 0, 0
            )).getTime();
            this.max = (new Date(
                maximum.getFullYear(), maximum.getMonth(), maximum.getDate(),
                endHour + (interval), 0, 0
            )).getTime();
        }
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
            min: axis.actualRange.min,
            max: axis.actualRange.max,
            interval: axis.actualRange.interval,
            delta: axis.actualRange.delta
        };
        const isLazyLoad : boolean = isNullOrUndefined(axis.zoomingScrollBar) ? false : axis.zoomingScrollBar.isLazyLoad;
        if ((isZoomSet(axis)) && !isLazyLoad) {
            axis.calculateVisibleRangeOnZooming();
            axis.visibleRange.interval = (axis.enableAutoIntervalOnZooming) ?
                this.calculateDateTimeNiceInterval(axis, size, axis.visibleRange.min, axis.visibleRange.max)
                : axis.visibleRange.interval;
        }
        axis.dateTimeInterval = this.increaseDateTimeInterval(axis, axis.visibleRange.min, axis.visibleRange.interval).getTime()
            - axis.visibleRange.min;
        axis.triggerRangeRender(this.chart, axis.visibleRange.min, axis.visibleRange.max, axis.visibleRange.interval);
    }

    /**
     * Calculate visible labels for the axis.
     *
     * @param {Axis} axis axis
     * @param {Chart | RangeNavigator} chart chart
     * @returns {void}
     * @private
     */
    public calculateVisibleLabels(axis: Axis, chart: Chart | RangeNavigator): void {
        axis.visibleLabels = [];
        let tempInterval: number = axis.visibleRange.min;
        let labelStyle: Font;
        let previousValue: number;
        const isBlazor: boolean = chart.getModuleName () === 'chart' ? (chart as Chart).isBlazor : false;
        const axisLabels: VisibleLabels[] = axis.visibleLabels;
        if (axis.minimum === null) {
            tempInterval = this.alignRangeStart(axis, tempInterval, axis.visibleRange.interval).getTime();
        }
        if (this.startValue && this.startValue < tempInterval && (chart as Chart).zoomModule && (chart as Chart).zoomModule.isPanning){
            tempInterval = this.startValue;
        }
        else {
            this.startValue = tempInterval;
        }
        while (tempInterval <= axis.visibleRange.max) {
            labelStyle = <Font>(extend({}, getValue('properties', axis.labelStyle), null, true));
            previousValue = axisLabels.length ? axis.visibleLabels[axisLabels.length - 1].value : tempInterval;
            axis.format = chart.intl.getDateFormat({
                format: this.findCustomFormats(axis) || this.blazorCustomFormat(axis),
                type: firstToLowerCase(axis.skeletonType),
                skeleton: this.getSkeleton(axis, tempInterval, previousValue, isBlazor)
            });
            axis.startLabel = axis.format(new Date(axis.visibleRange.min));
            axis.endLabel = axis.format(new Date(axis.visibleRange.max));
            if (withIn(tempInterval, axis.visibleRange)) {
                const interval: number = this.increaseDateTimeInterval(axis, tempInterval, axis.visibleRange.interval).getTime();
                if (interval > axis.visibleRange.max) {
                    axis.endLabel = axis.format(new Date(tempInterval));
                }
                triggerLabelRender(chart, tempInterval, axis.format(new Date(tempInterval)), labelStyle, axis);
            }
            const actualInterval: number = tempInterval;
            tempInterval = this.increaseDateTimeInterval(axis, tempInterval, axis.visibleRange.interval).getTime();
            if (actualInterval === tempInterval) {
                break;
            }
        }
        //tooltip and crosshair formats for 'Months' and 'Days' interval types
        if ((axis.actualIntervalType === 'Months' || axis.actualIntervalType === 'Days') && axis.isChart) {
            axis.format = chart.intl.getDateFormat({
                format: axis.labelFormat || (axis.actualIntervalType === 'Months' && !axis.skeleton ? 'y MMM' : ''),
                type: firstToLowerCase(axis.skeletonType), skeleton: axis.skeleton || (axis.actualIntervalType === 'Days' ? 'MMMd' : '')
            });
        }
        if (axis.getMaxLabelWidth) {
            axis.getMaxLabelWidth(this.chart);
        }

    }

    /**
     * Calculate the Blazor custom format for axis.
     *
     * @param {Axis} axis - The axis for which the custom format is calculated.
     * @returns {string} - The custom format string.
     * @private
     */
    private blazorCustomFormat(axis: Axis): string {
        if (this.chart.isBlazor) {
            return axis.actualIntervalType === 'Years' ? (axis.isIntervalInDecimal ? 'yyyy' : 'MMM y') :
                (axis.actualIntervalType === 'Days' && !axis.isIntervalInDecimal) ? 'ddd HH tt' : '';
        } else {
            return '';
        }
    }

    /**
     * Increase the date-time interval.
     *
     * @param {Axis} axis - The axis for which the interval is increased.
     * @param {number} value - The value of the interval.
     * @param {number} interval - The interval to increase.
     * @returns {Date} - The increased date-time interval.
     * @private
     */
    public increaseDateTimeInterval(axis: Axis, value: number, interval: number): Date {
        let result: Date = new Date(value);
        if (axis.interval) {
            axis.isIntervalInDecimal = (interval % 1) === 0;
            axis.visibleRange.interval = interval;
        } else {
            interval = Math.ceil(interval);
            axis.visibleRange.interval = interval;
        }
        const intervalType: RangeIntervalType = axis.actualIntervalType as RangeIntervalType;
        if (axis.isIntervalInDecimal) {
            switch (intervalType) {
            case 'Years':
                result.setFullYear(result.getFullYear() + interval);
                return result;
            case 'Quarter':
                result.setMonth(result.getMonth() + (3 * interval));
                return result;
            case 'Months':
                result.setMonth(result.getMonth() + interval);
                return result;
            case 'Weeks':
                result.setDate(result.getDate() + (interval * 7));
                return result;
            case 'Days':
                result.setDate(result.getDate() + interval);
                return result;
            case 'Hours':
                result.setHours(result.getHours() + interval);
                return result;
            case 'Minutes':
                result.setMinutes(result.getMinutes() + interval);
                return result;
            case 'Seconds':
                result.setSeconds(result.getSeconds() + interval);
                return result;
            }
        } else {
            result = this.getDecimalInterval(result, interval, intervalType);
        }
        return result;
    }
    private alignRangeStart(axis: Axis, sDate: number, intervalSize: number): Date {
        let sResult: Date = new Date(sDate);
        switch (axis.actualIntervalType) {
        case 'Years': {
            const year: number = Math.floor(Math.floor(sResult.getFullYear() / intervalSize) * intervalSize);
            sResult = new Date(year, sResult.getMonth(), sResult.getDate(), 0, 0, 0);
            return sResult;
        }
        case 'Months': {
            const month: number = Math.floor(Math.floor((sResult.getMonth()) / intervalSize) * intervalSize);
            sResult = new Date(sResult.getFullYear(), month, sResult.getDate(), 0, 0, 0);
            return sResult;
        }
        case 'Days': {
            const day: number = Math.floor(Math.floor((sResult.getDate()) / intervalSize) * intervalSize);
            sResult = new Date(sResult.getFullYear(), sResult.getMonth(), day, 0, 0, 0);
            return sResult;
        }
        case 'Hours': {
            const hour: number = Math.floor(Math.floor((sResult.getHours()) / intervalSize) * intervalSize);
            sResult = new Date(sResult.getFullYear(), sResult.getMonth(), sResult.getDate(), hour, 0, 0);
            return sResult;
        }
        case 'Minutes': {
            const minutes: number = Math.floor(Math.floor((sResult.getMinutes()) / intervalSize) * intervalSize);
            sResult = new Date(sResult.getFullYear(), sResult.getMonth(), sResult.getDate(), sResult.getHours(), minutes, 0, 0);
            return sResult;
        }
        case 'Seconds': {
            const seconds: number = Math.floor(Math.floor((sResult.getSeconds()) / intervalSize) * intervalSize);
            sResult = new Date(
                sResult.getFullYear(), sResult.getMonth(), sResult.getDate(),
                sResult.getHours(), sResult.getMinutes(), seconds, 0
            );
            return sResult;
        }
        }
        return sResult;
    }

    private getDecimalInterval(result: Date, interval: number, intervalType: RangeIntervalType): Date {
        const roundValue: number = Math.floor(interval);
        const decimalValue: number = interval - roundValue;
        switch (intervalType) {
        case 'Years': {
            const month: number = Math.round(12 * decimalValue);
            result.setFullYear(result.getFullYear() + roundValue);
            result.setMonth(result.getMonth() + month);
            return result;
        }
        case 'Quarter':
            result.setMonth(result.getMonth() + (3 * interval));
            return result;
        case 'Months': {
            const days: number = Math.round(30 * decimalValue);
            result.setMonth(result.getMonth() + roundValue);
            result.setDate(result.getDate() + days);
            return result;
        }
        case 'Weeks':
            result.setDate(result.getDate() + (interval * 7));
            return result;
        case 'Days': {
            const hour: number = Math.round(24 * decimalValue);
            result.setDate(result.getDate() + roundValue);
            result.setHours(result.getHours() + hour);
            return result;
        }
        case 'Hours': {
            const min: number = Math.round(60 * decimalValue);
            result.setHours(result.getHours() + roundValue);
            result.setMinutes(result.getMinutes() + min);
            return result;
        }
        case 'Minutes': {
            const sec: number = Math.round(60 * decimalValue);
            result.setMinutes(result.getMinutes() + roundValue);
            result.setSeconds(result.getSeconds() + sec);
            return result;
        }
        case 'Seconds': {
            const milliSec: number = Math.round(1000 * decimalValue);
            result.setSeconds(result.getSeconds() + roundValue);
            result.setMilliseconds(result.getMilliseconds() + milliSec);
            return result;
        }
        }
        return result;
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
        return 'DateTime';
    }
    /**
     * To destroy the category axis.
     *
     * @returns {void}
     * @private
     */
    public destroy(): void {
        /**
         * Destroy method performed here
         */
    }
}
