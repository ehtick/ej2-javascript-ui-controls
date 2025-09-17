import { IEventMarkerInfo, TimelineDetails } from './../base/interface';
import { PdfGanttTaskbarCollection } from './pdf-taskbar';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { PageDetail } from '../base/interface';
import { PdfLayoutResult, PointF, PdfPage, PdfGraphics, SizeF, PdfPen, PdfColor } from '@syncfusion/ej2-pdf-export';
import { Gantt } from '../base/gantt';
import { PdfTreeGrid} from './pdf-treegrid';
import { PdfExportProperties } from '../base/interface';
import { PdfTimeline } from './pdf-timeline';
import { pixelToPoint, pointToPixel } from '../base/utils';
import { Timeline } from '../renderer/timeline';
import { PdfGanttPredecessor } from './pdf-connector-line';
import { TimelineViewMode } from '../base/enum';
import {EventMarker} from './pdf-event-marker';

/**
 *
 */
export class PdfGantt extends PdfTreeGrid {
    public taskbarCollection: PdfGanttTaskbarCollection[];
    public predecessorCollection: PdfGanttPredecessor[];
    private taskbars: PdfGanttTaskbarCollection;
    private totalPages: number;
    private exportProps: PdfExportProperties = {};
    private perColumnPages: number;
    private headerDetails: TimelineDetails[];
    public pdfPageDetail: PageDetail[];
    public result: PdfLayoutResult;
    public timelineStartDate: Date;
    private startPoint: PointF;
    private startPageIndex: number;
    public borderColor: PdfColor;
    public predecessor: PdfGanttPredecessor;
    public chartHeader: PdfTimeline;
    public chartPageIndex: number;
    public eventMarker : EventMarker;
    public changeCloneProjectDates: boolean = false;
    public currentPage: number = 0;
    public parent: Gantt;

    constructor(parent: Gantt) {
        super();
        this.parent = parent;
        this.chartHeader = new PdfTimeline(this);
        this.eventMarker = new EventMarker(parent);
        this.predecessor = new PdfGanttPredecessor(parent, this);
        this.headerDetails = [];
        this.pdfPageDetail = [];
        this.taskbarCollection = [];
        this.predecessorCollection = [];
    }
    public get taskbar(): PdfGanttTaskbarCollection {
        if (isNullOrUndefined(this.taskbars)) {
            this.taskbars = new PdfGanttTaskbarCollection(this.parent);
        }
        return this.taskbars;
    }
    public drawChart(result: PdfLayoutResult): void {
        this.result = result;
        this.totalPages = this.result.page.section.count;
        this.perColumnPages = this.totalPages / this.layouter.columnRanges.length;
        this.calculateRange();
        this.drawGantttChart();
        this.drawPageBorder();
    }

    //Calcualte the header range for each pdf page based on schedule start and end date.
    private calculateRange(): void {
        const lastColumnRange: number[] = this.layouter.columnRanges[this.layouter.columnRanges.length - 1];
        let totalColumnWidth: number = 0;
        let isPageFinished: boolean = true;
        let pageWidth: number = 0;
        let remainWidth: number = 0;
        let point: number = 0;
        const headerWidth: number = pixelToPoint(this.chartHeader.width);
        const timelineSettings: Timeline = this.parent.timelineModule;

        for (let index: number = lastColumnRange[0]; index <= lastColumnRange[1]; index++) {
            totalColumnWidth += this.layouter.treegrid.columns.getColumn(index).width;
        }
        totalColumnWidth += 0.5;
        if (totalColumnWidth + 100 < this.result.page.getClientSize().width) {
            remainWidth = this.result.page.getClientSize().width - totalColumnWidth;
            this.chartPageIndex = this.startPageIndex = this.totalPages - this.perColumnPages;
            isPageFinished = false;
            this.startPoint = new PointF(totalColumnWidth, 0);
        } else {
            this.result.page.section.add();
            this.chartPageIndex = this.startPageIndex = this.totalPages;
            isPageFinished = true;
            this.startPoint = new PointF(point, 0);
        }
        while (Math.round(point) < Math.round(headerWidth)) {
            if (isPageFinished) {
                pageWidth = this.result.page.getClientSize().width;
            } else {
                pageWidth = remainWidth;
                isPageFinished = true;
            }
            const detail: TimelineDetails = {};
            const range: number[] = [];
            const convertedWidth: number = pixelToPoint(this.chartHeader.bottomTierCellWidth);
            let width: number = 0;
            if (this.chartHeader.bottomTierCellWidth !== 0) {
                width = (Math.floor(pageWidth / convertedWidth) * convertedWidth);
            }
            range[0] = point;
            if (headerWidth - point <= width) {
                range[1] = headerWidth;
                detail.totalWidth = pointToPixel(headerWidth - point);
            } else {
                range[1] = point + width;
                detail.totalWidth = pointToPixel(width);
            }
            detail.startPoint = range[0];
            detail.endPoint = range[1];
            if (this.parent.cloneProjectStartDate.getHours() === 0 && this.parent.cloneProjectStartDate.getMinutes() === 0
            && this.parent.cloneProjectStartDate.getSeconds() === 0 ) {
                this.changeCloneProjectDates = true;
                this.parent.cloneProjectStartDate.setHours(8);
            }
            const timelineStartDate: Date = this.parent.dataOperation.getDateFromFormat(this.parent.timelineModule.timelineStartDate);
            const count: number = isNullOrUndefined(timelineSettings.customTimelineSettings.bottomTier.count) ?
                timelineSettings.customTimelineSettings.topTier.count : timelineSettings.customTimelineSettings.bottomTier.count;
            const scheduleType: TimelineViewMode = timelineSettings.customTimelineSettings.bottomTier.unit === 'None' ?
                timelineSettings.customTimelineSettings.topTier.unit : timelineSettings.customTimelineSettings.bottomTier.unit;
            switch (scheduleType) {
            case 'Minutes':
            {
                detail.startDate = new Date(timelineStartDate.getTime());
                const sDays: number = Math.floor(pointToPixel(detail.startPoint) / (this.chartHeader.bottomTierCellWidth));
                detail.startDate.setMinutes(detail.startDate.getMinutes() + sDays * count);
                detail.startDate.setSeconds(detail.startDate.getSeconds() + 1);
                detail.endDate = new Date(detail.startDate.getTime());
                const eDays: number = Math.floor(pointToPixel(detail.endPoint - detail.startPoint)
                    / (this.chartHeader.bottomTierCellWidth));
                detail.endDate.setMinutes(detail.endDate.getMinutes() + eDays * count);
                break;
            }
            case 'Hour':
            {
                detail.startDate = new Date(timelineStartDate.getTime());
                const startHours: number = Math.floor(pointToPixel(detail.startPoint) / (this.chartHeader.bottomTierCellWidth));
                let currentDate: Date = new Date(detail.startDate.getTime());

                if (!this.parent.timelineSettings.showWeekend) {
                    currentDate = this.calculateHoursWithoutNonworkingDays(currentDate, startHours, count);
                    detail.startDate = new Date(currentDate.getTime());
                } else {
                    detail.startDate.setHours(detail.startDate.getHours() + startHours * count);
                    detail.startDate.setMinutes(detail.startDate.getMinutes() + 1);
                }

                const endHours: number = Math.floor((detail.endPoint - detail.startPoint)
                    / pointToPixel(this.chartHeader.bottomTierCellWidth));
                currentDate = new Date(detail.startDate.getTime());
                if (!this.parent.timelineSettings.showWeekend) {
                    currentDate = this.calculateHoursWithoutNonworkingDays(currentDate, endHours, count);
                } else {
                    currentDate.setHours(currentDate.getHours() + endHours * count);
                }
                detail.endDate = new Date(currentDate.getTime());
                break;
            }
            case 'Day':
            {
                detail.startDate = new Date(timelineStartDate.getTime());
                const startDays: number = Math.round(detail.startPoint / pixelToPoint(this.chartHeader.bottomTierCellWidth));
                let currentDate: Date = new Date(detail.startDate.getTime());
                if (!this.parent.timelineSettings.showWeekend) {
                    detail.startDate = this.calculateDaysWithoutNonworkingDays(detail.startDate, startDays * count);
                }
                else {
                    detail.startDate.setDate(detail.startDate.getDate() + startDays * count);
                }
                const endDays: number = Math.round((detail.endPoint - detail.startPoint)
                    / pixelToPoint(this.chartHeader.bottomTierCellWidth)) - 1;
                const startdate: Date = detail.startDate;
                startdate.setHours(0, 0, 0, 0);
                currentDate = new Date(detail.startDate.getTime());
                if (!this.parent.timelineSettings.showWeekend) {
                    currentDate = this.calculateDaysWithoutNonworkingDays(currentDate, endDays * count);
                }
                else {
                    currentDate.setDate(currentDate.getDate() + endDays * count);
                }
                const secondsToAdd: number = this.parent.workingTimeRanges[this.parent.workingTimeRanges.length - 1].to * 1000;
                detail.endDate = new Date(currentDate.getTime());
                detail.endDate.setTime(detail.endDate.getTime() + secondsToAdd);
                break;
            }
            case 'Week':
            {
                detail.startDate = new Date(timelineStartDate.getTime());
                const startDays1: number = (detail.startPoint / pixelToPoint(this.chartHeader.bottomTierCellWidth) * 7);
                if (!this.parent.timelineSettings.showWeekend) {
                    detail.startDate = this.calculateDaysWithoutNonworkingDays(detail.startDate, startDays1 * count);
                }
                else {
                    detail.startDate.setDate(detail.startDate.getDate() + startDays1 * count);
                }
                const endDays1: number = Math.round((detail.endPoint - detail.startPoint)
                    / pixelToPoint(this.chartHeader.bottomTierCellWidth)) * 7 - 1;
                detail.endDate = new Date(detail.startDate.getTime());
                if (!this.parent.timelineSettings.showWeekend){
                    detail.endDate = this.calculateDaysWithoutNonworkingDays(detail.endDate, endDays1 * count);
                }
                else {
                    detail.endDate.setDate(detail.startDate.getDate() + endDays1 * count);
                }
                break;
            }
            case 'Month':
            {
                detail.startDate = new Date(timelineStartDate.getTime());
                const startDays2: number = (detail.startPoint / pixelToPoint(this.chartHeader.bottomTierCellWidth) * 31);
                detail.startDate.setDate(detail.startDate.getDate() + startDays2 * count);
                const endDays2: number = Math.round((detail.endPoint - detail.startPoint)
                    / pixelToPoint(this.chartHeader.bottomTierCellWidth)) * 31 - 1;
                detail.endDate = new Date(detail.startDate.getTime());
                detail.endDate.setDate(detail.startDate.getDate() + endDays2 * count);
                break;
            }
            case 'Year':
            {
                detail.startDate = new Date(timelineStartDate.getTime());
                const startDays3: number = (detail.startPoint / pixelToPoint(this.chartHeader.bottomTierCellWidth) * 365);
                detail.startDate.setDate(detail.startDate.getDate() + startDays3 * count);
                const endDays3: number = Math.round((detail.endPoint - detail.startPoint)
                    / pixelToPoint(this.chartHeader.bottomTierCellWidth)) * 365 - 1;
                detail.endDate = new Date(detail.startDate.getTime());
                detail.endDate.setDate(detail.startDate.getDate() + endDays3 * count);
                break;
            }
            }
            this.headerDetails.push(detail);
            point += width;
        }
    }
    /**
     * Calculates the end date by adding the specified number of working hours to the current date,
     * excluding any non-working days as specified in the nonWorkingDayIndex.
     *
     * @param {Date} currentDate - The starting date from which to begin adding working hours.
     * @param {number} startHours - The number of hours to add to the current date.
     * @param {number} count - A multiplier to apply to the startHours, typically representing a scaling factor.
     * @returns {Date} - A new Date object representing the calculated date/time after working hours have been added.
     *
     */
    private calculateHoursWithoutNonworkingDays(currentDate: Date, startHours: number, count: number): Date {
        let totalHours: number = 0;
        while (totalHours < startHours * count) {
            currentDate.setHours(currentDate.getHours() + 1);
            if (this.parent.nonWorkingDayIndex.indexOf(currentDate.getDay()) === -1) {
                totalHours++;
            }
            if (this.parent.nonWorkingDayIndex.indexOf(currentDate.getDay()) !== -1) {
                currentDate.setHours(24, 0, 0, 0);
            }
        }
        return currentDate;
    }
    /**
     * Calculates the end date by adding the specified number of working days to the current date,
     * excluding any non-working days as defined in the nonWorkingDayIndex.
     *
     * @param {Date} startDate - The starting date from which to begin adding working days.
     * @param {number} daysToAdd - The number of days to add to the current date.
     * @param {number} count - A multiplier applied to daysToAdd, typically representing the number of units.
     * @returns {Date} - A new Date object representing the calculated date after working days have been added.
     *
     */
    private calculateDaysWithoutNonworkingDays(startDate: Date, daysToAdd: number): Date {
        const result: Date = new Date(startDate.getTime());
        const nonWorkingDays: number = this.parent.nonWorkingDayIndex.length;
        const workingDaysInWeek: number = 7 - nonWorkingDays;
        const fullWeeks: number = Math.floor(daysToAdd / workingDaysInWeek);
        let remainingDays: number = daysToAdd % workingDaysInWeek;
        result.setDate(result.getDate() + fullWeeks * 7);
        // Process remaining days
        while (remainingDays > 0) {
            result.setDate(result.getDate() + 1);
            if (this.parent.nonWorkingDayIndex.indexOf(result.getDay()) === -1) {
                remainingDays--;
            }
        }
        return result;
    }

    private drawPageBorder(): void {
        const pages: PdfPage[] = this.result.page.section.getPages() as PdfPage[];
        for (let index: number = 0; index < pages.length; index++) {
            const page: PdfPage = pages[index as number];
            const graphics: PdfGraphics = page.graphics;
            const pageSize: SizeF = page.getClientSize();
            const pen: PdfPen = new PdfPen(new PdfColor(this.ganttStyle.chartGridLineColor));
            graphics.drawRectangle(pen, 0, 0, pageSize.width, pageSize.height);
        }
    }
    //Draw the gantt chart side
    private drawGantttChart(): void {
        let taskbarPoint: PointF = this.startPoint;
        const pagePoint: PointF = new PointF();
        let pageStartX: number = 0;
        let cumulativeWidth: number = 0;
        let cumulativeHeight: number = 0;
        let pageData: PageDetail;
        this.headerDetails.forEach((detail: TimelineDetails, index: number): void => {
            this.currentPage = 0;
            const page: PdfPage = this.result.page.section.getPages()[this.startPageIndex] as PdfPage;
            page['contentWidth'] = (this.parent.pdfExportModule.gantt.taskbar.isAutoFit()) ? pointToPixel(this.headerDetails[index as number].endPoint - this.headerDetails[index as number].startPoint) : this.headerDetails[index as number].endPoint - this.headerDetails[index as number].startPoint;
            this.chartHeader.drawTimeline(page, this.startPoint, detail, 0);
            taskbarPoint.y = taskbarPoint.y + pixelToPoint(this.parent.timelineModule.isSingleTier ? 45 : 60); // headerHeight
            pageStartX = taskbarPoint.x;
            cumulativeHeight = pixelToPoint(this.parent.timelineModule.isSingleTier ? 45 : 60); // headerHeight
            this.headerDetails[this.headerDetails.indexOf(detail)].startIndex = this.startPageIndex;
            this.headerDetails[this.headerDetails.indexOf(detail)].pageStartPoint = taskbarPoint;
            for (let i: number = 0; i < this.taskbarCollection.length; i++) {
                const task: PdfGanttTaskbarCollection = this.taskbarCollection[i as number];
                const rowHeight: number = this.rows.getRow(i + 1).height;
                const pdfPage: PdfPage = this.result.page.section.getPages()[this.startPageIndex] as PdfPage;
                const graphics: PdfGraphics = pdfPage.graphics;
                const pen: PdfPen = new PdfPen(new PdfColor(this.ganttStyle.chartGridLineColor));
                let lineWidth: number;
                if (page['contentWidth'] && (this.parent.gridLines === 'Both' || this.parent.gridLines === 'Horizontal')) {
                    lineWidth = this.chartHeader.timelineWidth;
                    graphics.drawRectangle(pen, pageStartX, taskbarPoint.y, page['contentWidth'] + 0.5 , rowHeight);
                }
                const isNextPage: boolean = task.drawTaskbar(
                    pdfPage, taskbarPoint, detail, cumulativeWidth, rowHeight,
                    this.taskbarCollection[parseInt(i.toString(), 10)], lineWidth, index);
                if (isNextPage) {
                    if (this.enableHeader) {
                        taskbarPoint.y = pixelToPoint(this.parent.timelineModule.isSingleTier ? 45 : 60);
                    } else {
                        taskbarPoint.y = 0;
                    }
                    this.startPageIndex++;
                    pageData = {};
                    pageData.height = cumulativeHeight;
                    pageData.pageStartX = pageStartX;
                    pageData.startPoint = { ...pagePoint };
                    if (this.parent.pdfExportModule.gantt.taskbar.isAutoFit()) {
                        pageData.width = (detail.totalWidth);
                    }
                    else {
                        pageData.width = (detail.totalWidth);
                    }
                    this.pdfPageDetail.push(pageData);
                    pagePoint.y += pageData.height;
                    if (this.enableHeader) {
                        cumulativeHeight = this.chartHeader.height;
                    } else {
                        taskbarPoint.y = 0;
                        cumulativeHeight = 0;
                    }
                }
                taskbarPoint.y += rowHeight;
                cumulativeHeight += rowHeight;
                this.eventMarker.renderHeight = this.layouter.pageHeightCollection[this.currentPage].totalHeight;
                this.parent.eventMarkerColloction.map((eventMarker: IEventMarkerInfo) => {
                    const timelimeHeight: number = pixelToPoint(this.parent.timelineModule.isSingleTier ? 45 : 60);
                    if (this.currentPage !== 0) {
                        this.eventMarker.renderHeight = this.layouter.pageHeightCollection[this.currentPage].totalHeight + timelimeHeight;
                    }
                    const pdfPage: PdfPage = this.result.page.section.getPages()[this.startPageIndex] as PdfPage;
                    this.eventMarker.drawEventMarker(pdfPage, taskbarPoint, cumulativeWidth, detail, eventMarker, timelimeHeight,
                                                     this.ganttStyle);
                });
            }

            this.headerDetails[index as number].endIndex = this.startPageIndex;
            cumulativeWidth += detail.totalWidth;
            pageData = {};
            pageData.height = cumulativeHeight;
            pageData.pageStartX = pageStartX;
            pageData.startPoint = { ...pagePoint };
            if (this.parent.pdfExportModule.gantt.taskbar.isAutoFit()) {
                pageData.width = (detail.totalWidth);
            }
            else {
                pageData.width = pixelToPoint(detail.totalWidth);
            }
            this.pdfPageDetail.push(pageData);
            pagePoint.x += pageData.width;
            pagePoint.y = 0;
            if (this.enableHeader) {
                cumulativeHeight = this.chartHeader.height;
            } else {
                taskbarPoint.y = 0;
            }
            if (this.headerDetails.indexOf(detail) !== this.headerDetails.length - 1) {
                this.result.page.section.add();
                this.startPageIndex = this.result.page.section.count - 1;
                taskbarPoint = this.startPoint = new PointF(0, 0);
            }
        });
        // Draw predecessor line.
        for (let i: number = 0; i < this.predecessorCollection.length; i++) {
            const predecessor: PdfGanttPredecessor = this.predecessorCollection[i as number];
            predecessor.drawPredecessor(this);
        }
    }
}
