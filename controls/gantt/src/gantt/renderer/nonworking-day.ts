/**
 * To render holidays and weekends in Gantt
 */
import { Gantt } from '../base/gantt';
import { createElement, formatUnit, remove, SanitizeHtmlHelper } from '@syncfusion/ej2-base';
import * as cls from '../base/css-constants';
import { isNullOrUndefined } from '@syncfusion/ej2-base';

export class NonWorkingDay {
    private parent: Gantt;
    public nonworkingContainer: HTMLElement;
    private holidayContainer: HTMLElement;
    private weekendContainer: HTMLElement;
    private weekendWidthUpdated: boolean = false;
    constructor(gantt: Gantt) {
        this.parent = gantt;
        this.nonworkingContainer = null;
        this.holidayContainer = null;
        this.weekendContainer = null;
    }
    /**
     * Method append nonworking container
     *
     * @returns {void} .
     */
    private createNonworkingContainer(): void {
        if (!this.parent.ganttChartModule.chartBodyContent.contains(this.nonworkingContainer)) {
            this.nonworkingContainer = createElement('div', {
                className: cls.nonworkingContainer
            });
            if (this.parent.enableTimelineVirtualization) {
                this.nonworkingContainer.style.height = '100%';
            }
            this.parent.ganttChartModule.chartBodyContent.insertBefore(
                this.nonworkingContainer, this.parent.ganttChartModule.chartBodyContent.firstChild);
        }
    }
    /**
     * calculation for holidays rendering.
     *
     * @returns {void} .
     * @private
     */
    public renderHolidays(): void {
        if (this.parent.holidays && this.parent.holidays.length > 0) {
            this.createNonworkingContainer();
            if (!this.nonworkingContainer.contains(this.holidayContainer)) {
                this.holidayContainer = createElement('div', {
                    className: cls.holidayContainer
                });
                if (this.parent.enableTimelineVirtualization) {
                    this.holidayContainer.style.height = '100%';
                    this.holidayContainer.style.zIndex = '-1';
                }
                this.nonworkingContainer.appendChild(this.holidayContainer);
            }
            const holidayElements: NodeList = this.getHolidaysElement().childNodes;
            this.holidayContainer.innerHTML = '';
            holidayElements.forEach((element: Node) => {
                this.holidayContainer.appendChild(element.cloneNode(true));
            });
        } else if (this.holidayContainer && this.holidayContainer.parentNode) {
            remove(this.holidayContainer);
            if (this.nonworkingContainer && this.nonworkingContainer.childNodes.length === 0) {
                remove(this.nonworkingContainer);
            }
        }
    }
    /**
     * Method to return holidays as html string
     *
     * @returns {HTMLElement} .
     */
    private getHolidaysElement(): HTMLElement {
        let fromDate: Date;
        let toDate: Date;
        const container: HTMLElement = createElement('div');
        const height: number = this.parent.contentHeight;
        let toolbarHeight: number = 0;
        if (!isNullOrUndefined(this.parent.toolbarModule) && !isNullOrUndefined(this.parent.toolbarModule.element)) {
            toolbarHeight =  this.parent.toolbarModule.element.offsetHeight;
        }
        const viewportHeight: number =
        this.parent.ganttHeight - toolbarHeight - this.parent.ganttChartModule.chartTimelineContainer.offsetHeight;
        for (let i: number = 0; i < this.parent.holidays.length; i++) {
            if (this.parent.holidays[i as number].from && this.parent.holidays[i as number].to) {
                fromDate = this.parent.dateValidationModule.getDateFromFormat(this.parent.holidays[i as number].from);
                toDate = this.parent.dateValidationModule.getDateFromFormat(this.parent.holidays[i as number].to);
                toDate.setDate(toDate.getDate() + 1);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(0, 0, 0, 0);
            } else if (this.parent.holidays[i as number].from) {
                fromDate = this.parent.dateValidationModule.getDateFromFormat(this.parent.holidays[i as number].from);
                fromDate.setHours(0, 0, 0, 0);
            } else if (this.parent.holidays[i as number].to) {
                fromDate = this.parent.dateValidationModule.getDateFromFormat(this.parent.holidays[i as number].to);
                fromDate.setHours(0, 0, 0, 0);
            }
            const width: number = (this.parent.holidays[i as number].from && this.parent.holidays[i as number].to) ?
                this.parent.dataOperation.getTaskWidth(fromDate, toDate) : this.parent.perDayWidth;
            const left: number = this.parent.dataOperation.getTaskLeft(fromDate, false, true);
            const align: string = this.parent.enableRtl ? `right:${left}px;` : `left:${left}px;`;
            const holidayDiv: HTMLElement = createElement('div', {
                className: cls.holidayElement, styles: `${align} width:${width}px; height:100%;`
            });
            const spanTop: number = (viewportHeight < height) ? viewportHeight / 2 : height / 2;
            const spanElement: HTMLElement = createElement('span', {
                className: cls.holidayLabel, styles: `top:${spanTop}px;left:${(width / 2)}px;`
            });
            const property: string = this.parent.disableHtmlEncode ? 'textContent' : 'innerHTML';
            spanElement[property as string] = this.parent.holidays[i as number].label ? this.parent.holidays[i as number].label : '';
            if (this.parent.enableHtmlSanitizer && typeof (spanElement[property as string]) === 'string') {
                spanElement[property as string] = SanitizeHtmlHelper.sanitize(spanElement[property as string]);
            }
            holidayDiv.appendChild(spanElement);
            if (this.parent.holidays[i as number].cssClass) {
                holidayDiv.classList.add(this.parent.holidays[i as number].cssClass);
            }
            container.appendChild(holidayDiv);
        }
        return container;
    }
    /**
     * @returns {void} .
     * @private
     */
    public renderWeekends(): void {
        if (this.parent.highlightWeekends && this.parent.timelineSettings.showWeekend) {
            this.createNonworkingContainer();
            if (!this.nonworkingContainer.contains(this.weekendContainer)) {
                this.weekendContainer = createElement('div', {
                    className: cls.weekendContainer
                });
                if (this.parent.enableTimelineVirtualization) {
                    this.weekendContainer.style.height = '100%';
                    this.weekendContainer.style.zIndex = '-1';
                }
                this.nonworkingContainer.appendChild(this.weekendContainer);
            }
            const weekendElements: NodeList = this.getWeekendElements().childNodes;
            this.weekendContainer.innerHTML = '';
            weekendElements.forEach((element: Node) => {
                this.weekendContainer.appendChild(element.cloneNode(true));
            });
        } else if (this.weekendContainer) {
            remove(this.weekendContainer);
            this.weekendContainer = null;
            if (this.nonworkingContainer && this.nonworkingContainer.childNodes.length === 0) {
                remove(this.nonworkingContainer);
                this.nonworkingContainer = null;
            }
        }
    }
    /**
     * Method to get weekend html string
     *
     * @returns {HTMLElement} .
     */
    private getWeekendElements(): HTMLElement {
        const container: HTMLElement = createElement('div');
        const leftValueForStartDate: number = (this.parent.enableTimelineVirtualization &&
            this.parent.ganttChartModule.scrollObject.element.scrollLeft !== 0)
            ? this.parent.ganttChartModule.scrollObject.getTimelineLeft() : null;
        const startDate: Date = (this.parent.enableTimelineVirtualization && !isNullOrUndefined(leftValueForStartDate))
            ? new Date((this.parent.timelineModule['dateByLeftValue'](leftValueForStartDate)).getTime()) :
            new Date(this.parent.timelineModule.timelineStartDate.getTime());
        const endDate: Date = this.parent.enableTimelineVirtualization ? new Date((this.parent.timelineModule.weekendEndDate).getTime()) :
            new Date(this.parent.timelineModule.timelineEndDate.getTime());
        const nonWorkingIndex: number[] = this.parent.nonWorkingDayIndex;
        let isFirstCell: boolean = true;
        let isFirstExecution: boolean = true;
        this.weekendWidthUpdated = false;
        const hasDST: boolean = this.parent.dataOperation.hasDSTTransition(startDate.getFullYear());
        do {
            if (nonWorkingIndex.indexOf(startDate.getDay()) !== -1) {
                const left: number = this.parent.dataOperation.getTaskLeft(startDate, false, true);
                let width: number = this.parent.perDayWidth;
                if (isFirstCell) {
                    const start: Date =  new Date(startDate.getTime());
                    const tempEnd: Date = new Date(start.getTime());
                    tempEnd.setDate(tempEnd.getDate() + 1);
                    tempEnd.setHours(0, 0, 0, 0);
                    width = this.parent.dataOperation.getTaskWidth(start, tempEnd);
                    isFirstCell = false;
                }
                if (!hasDST) {
                    const sDate: Date = new Date(startDate);
                    const dubDate: Date = new Date(startDate);
                    sDate.setDate(sDate.getDate() + 1);
                    const sDateOffset: number = sDate.getTimezoneOffset();
                    const dubDateOffset: number = dubDate.getTimezoneOffset();
                    if (!isFirstExecution) {
                        const isHourTimeline: boolean =
                            (this.parent.timelineModule.bottomTier === 'Hour' &&
                                this.parent.timelineModule.customTimelineSettings.bottomTier.count === 1) ||
                            (this.parent.timelineModule.bottomTier === 'Minutes' &&
                                this.parent.timelineModule.customTimelineSettings.bottomTier.count === 60) ||
                            (this.parent.timelineModule.topTier === 'Hour' &&
                                this.parent.timelineModule.customTimelineSettings.topTier.count === 1 &&
                                this.parent.timelineModule.bottomTier === 'Minutes' &&
                                (this.parent.timelineModule.customTimelineSettings.bottomTier.count === 30 ||
                                    this.parent.timelineModule.customTimelineSettings.bottomTier.count === 15));
                        if (!this.weekendWidthUpdated) {
                            if (isHourTimeline && sDateOffset < dubDateOffset) {
                                width = width - (this.parent.perDayWidth / 24);
                                this.weekendWidthUpdated = true;
                            }
                        }
                    } else {
                        isFirstExecution = false;
                    }
                }
                const align: string = this.parent.enableRtl ? `right:${left}px;` : `left:${left}px;`;
                const weekendDiv: HTMLElement = createElement('div', {
                    className: cls.weekend, styles: `${align} width:${width}px;height:100%;`
                });
                container.appendChild(weekendDiv);
            }
            startDate.setDate(startDate.getDate() + 1);
            startDate.setHours(0, 0, 0, 0);
        } while (startDate < endDate);
        return container;
    }

    private updateHolidayLabelHeight(): void {
        const height: number = this.parent.getContentHeight();
        const gantttable: HTMLElement = document.getElementById(this.parent.element.id);
        let toolbarHeight: number = 0;
        if (!isNullOrUndefined(this.parent.toolbarModule) && !isNullOrUndefined(this.parent.toolbarModule.element)) {
            toolbarHeight =  this.parent.toolbarModule.element.offsetHeight;
        }
        const viewportHeight: number = (this.parent.height === 'auto') ? gantttable.offsetHeight - toolbarHeight - this.parent.ganttChartModule.chartTimelineContainer.offsetHeight :
            this.parent.ganttHeight - toolbarHeight - this.parent.ganttChartModule.chartTimelineContainer.offsetHeight;
        const top: number = (viewportHeight < height) ? viewportHeight / 2 : height / 2;
        const labels: NodeList = this.holidayContainer.querySelectorAll('.' + cls.holidayLabel);
        for (let i: number = 0; i < labels.length; i++) {
            (labels[i as number] as HTMLElement).style.top = formatUnit(top);
        }
    }
    /**
     * Method to update height for all internal containers
     *
     * @returns {void} .
     * @private
     */
    public updateContainerHeight(): void {
        const height: number = this.parent.getContentHeight();
        if (this.holidayContainer) {
            this.holidayContainer.style.height = formatUnit(height);
            this.updateHolidayLabelHeight();
        }
        if (this.weekendContainer) {
            this.weekendContainer.style.height = formatUnit(height);
        }
    }
    /**
     * Method to remove containers of holiday and weekend
     *
     * @returns {void} .
     */
    public removeContainers(): void {
        if (this.holidayContainer) {
            remove(this.holidayContainer);
        }
        if (this.weekendContainer) {
            remove(this.weekendContainer);
            this.weekendContainer = null;
        }
        if (this.nonworkingContainer) {
            remove(this.nonworkingContainer);
            this.nonworkingContainer = null;
        }
    }
}
