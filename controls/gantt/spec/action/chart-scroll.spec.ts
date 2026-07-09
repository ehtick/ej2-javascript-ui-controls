/**
 * Gantt chart-scroll spec
 */
import { doesImplementInterface } from '@syncfusion/ej2-grids';
import { Gantt, Selection, Toolbar, DayMarkers, Edit, Filter, Reorder, Resize, ColumnMenu, VirtualScroll, Sort, RowDD, ContextMenu, ExcelExport, PdfExport } from '../../src/index';
import { projectData1, virtualData, exportData1, projectNewData } from '../base/data-source.spec';
import { createGantt, destroyGantt, triggerScrollEvent } from '../base/gantt-util.spec';
Gantt.Inject(Selection, Toolbar, DayMarkers, Edit, Filter, Reorder, Resize, ColumnMenu, VirtualScroll, Sort, RowDD, ContextMenu, ExcelExport, PdfExport);
interface EJ2Instance extends HTMLElement {
    ej2_instances: Object[];
}
describe('Next time span in timeline virtualization', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: exportData1,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks',
                    dependency: 'Predecessor'
                },
                eventMarkers: [
                    {
                        day: '04/10/2019',
                        cssClass: 'e-custom-event-marker',
                        label: 'Project approval and kick-off'
                    }
                ],
                holidays: [{
                    from: "04/04/2019",
                    to: "04/05/2019",
                    label: " Public holidays",
                    cssClass: "e-custom-holiday"

                },
                {
                    from: "04/12/2019",
                    to: "04/12/2019",
                    label: " Public holiday",
                    cssClass: "e-custom-holiday"

                }],
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search', 'ZoomIn', 'ZoomOut', 'ZoomToFit',
                    'PrevTimeSpan', 'NextTimeSpan', 'ExcelExport', 'CsvExport', 'PdfExport'],
                gridLines: 'Vertical',
                highlightWeekends: true,
                enableTimelineVirtualization:true,
                projectStartDate: new Date('03/25/2019'),
                projectEndDate: new Date('05/30/2024'),
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    beforeEach((done) => {
        setTimeout(done, 100);
    });
    it('Moving next time span', () => {
        ganttObj.actionComplete = function (args: any): void {
            if (args.requestType === "nextTimeSpan") {
                let chartLeft = ganttObj.chartPane.querySelector('.e-content').scrollLeft
                let currentCount: number = Math.round(chartLeft / ganttObj.element.offsetWidth);
                ganttObj.ganttChartModule.scrollObject.previousCount = currentCount
            }
            if (args.requestType === "scroll") {
                expect(ganttObj.chartPane.querySelector('.e-content').scrollLeft > 0).toBe(true)
            }
        };
        ganttObj.nextTimeSpan()
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('Gantt chart-scroll support', () => {
    describe('Gantt chart-scroll action', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: exportData1,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor'
                    },
                    eventMarkers: [
                        {
                            day: '04/10/2019',
                            cssClass: 'e-custom-event-marker',
                            label: 'Project approval and kick-off'
                        }
                    ],
                    holidays: [{
                        from: "04/04/2019",
                        to: "04/05/2019",
                        label: " Public holidays",
                        cssClass: "e-custom-holiday"

                    },
                    {
                        from: "04/12/2019",
                        to: "04/12/2019",
                        label: " Public holiday",
                        cssClass: "e-custom-holiday"

                    }],
                    gridLines: 'Vertical',
                    highlightWeekends: true,
                    projectStartDate: new Date('03/25/2019'),
                    projectEndDate: new Date('05/30/2019'),
                    rowHeight: 40,
                    taskbarHeight: 30
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });

        it('Set scrollTop using public method', () => {
            ganttObj.ganttChartModule.scrollObject.setScrollTop(300);
            expect(ganttObj.ganttChartModule.scrollElement.scrollTop).toBe(300);
        });

        it('Set ChartScroll Width using public method', () => {
            ganttObj.ganttChartModule.scrollObject.setWidth(400);
            expect(ganttObj.ganttChartModule.scrollElement.style.width).toBe('400px');
        });

        it('Set scroll left for scroll container using public method', () => {
            ganttObj.ganttChartModule.scrollObject.setScrollLeft(500);
            expect(ganttObj.ganttChartModule.scrollElement.scrollLeft).toBe(500);
        });

        it('Chart scroll Function', () => {
            let chartscroll: HTMLElement = ganttObj.element.querySelector('.e-chart-scroll-container') as HTMLElement;
            triggerScrollEvent(chartscroll, 500, 700);
            expect(ganttObj.ganttChartModule.scrollElement.scrollTop).toBe(500);
            expect(ganttObj.ganttChartModule.scrollElement.scrollLeft).toBe(700);
        });

        it('Treegrid scroll Function', () => {
            let gridscroll: HTMLElement = ganttObj.treeGrid.element.querySelector('.e-content') as HTMLElement;
            triggerScrollEvent(gridscroll, 50);
            expect(ganttObj.ganttChartModule.scrollElement.scrollTop).toBe(50);
        });

        it('Update Chart Scroll Value by public method', () => {
            ganttObj.updateChartScrollOffset(400, 700);
            expect(ganttObj.ganttChartModule.scrollElement.scrollTop).toBe(700);
            expect(ganttObj.ganttChartModule.scrollElement.scrollLeft).toBe(400);
        });
    });
});
describe('Gantt chart-scroll action in resource view', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: [
                    {
                        TaskID: 1,
                        TaskName: 'Project initiation',
                        StartDate: new Date('03/29/2019'),
                        EndDate: new Date('04/21/2019'),
                        subtasks: [
                            {
                                TaskID: 2, TaskName: 'Identify site location', StartDate: new Date('03/29/2019'), Duration: 3,
                                Progress: 30, work: 10, resources: [{ resourceId: 1, resourceUnit: 50 }]
                            },
                            {
                                TaskID: 3, TaskName: 'Perform soil test', StartDate: new Date('03/29/2019'), Duration: 4,
                                resources: [{ resourceId: 2, resourceUnit: 70 }], Progress: 30, work: 20
                            },
                            {
                                TaskID: 4, TaskName: 'Soil test approval', StartDate: new Date('03/29/2019'), Duration: 4,
                                resources: [{ resourceId: 1, resourceUnit: 75 }], Predecessor: 2, Progress: 30, work: 10,
                            },
                        ]
                    }],
                resources: [{ resourceId: 1, resourceName: 'Martin Tamer', resourceGroup: 'Planning Team' },
                { resourceId: 2, resourceName: 'Rose Fuller', resourceGroup: 'Testing Team' }],
                viewType: 'ResourceView',
                showOverAllocation: true,
                allowTaskbarOverlap: false,
                enableRtl: true,
                enableContextMenu: true,
                allowSorting: true,
                allowReordering: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency: 'Predecessor',
                    resourceInfo: 'resources',
                    work: 'work',
                    child: 'subtasks'
                },
                resourceFields: {
                    id: 'resourceId',
                    name: 'resourceName',
                    unit: 'resourceUnit',
                    group: 'resourceGroup'
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                labelSettings: {
                    rightLabel: 'resources',
                    taskLabel: 'Progress'
                },
                eventMarkers: [
                    {
                        day: '04/17/2019',
                        cssClass: 'e-custom-event-marker',
                        label: 'Project approval and kick-off'
                    }
                ],
                holidays: [{
                    from: "04/04/2019",
                    to: "04/05/2019",
                    label: " Public holidays",
                    cssClass: "e-custom-holiday"
                }],
                readOnly: false,
                allowRowDragAndDrop: true,
                projectStartDate: new Date('03/28/2019'),
                projectEndDate: new Date('05/18/2019')
            }, done);
    });
    it('Set scrollTop using public method in resource view', () => {
        ganttObj.ganttChartModule.scrollObject.setScrollTop(300);
    });
    it('Chart scroll Function', () => {
        let chartscroll: HTMLElement = ganttObj.element.querySelector('.e-chart-scroll-container') as HTMLElement;
        triggerScrollEvent(chartscroll, 500, 700);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('Gantt get timeline left', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: [
                    {
                        TaskID: 1,
                        TaskName: 'Product Concept',
                        StartDate: new Date('04/02/2019'),
                        EndDate: new Date('04/21/2019')
                    }],
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency: 'Predecessor',
                    baselineStartDate: "BaselineStartDate",
                    baselineEndDate: "BaselineEndDate",
                    child: 'subtasks',
                    indicators: 'Indicators'
                },
                eventMarkers: [
                    {
                        day: '04/10/2019',
                        cssClass: 'e-custom-event-marker',
                        label: 'Project approval and kick-off'
                    }
                ],
                holidays: [{
                    from: "04/04/2019",
                    to: "04/05/2019",
                    label: " Public holidays",
                    cssClass: "e-custom-holiday"

                },
                {
                    from: "04/12/2019",
                    to: "04/12/2019",
                    label: " Public holiday",
                    cssClass: "e-custom-holiday"

                }],
                gridLines: 'Vertical',
                highlightWeekends: true,
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });

    it('Set scrollTop using public method with getTimelineLeft', () => {
        ganttObj.ganttChartModule.scrollObject.getTimelineLeft();
    });
});
    describe('Gantt chart-scroll action', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: exportData1,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor'
                    },
                    eventMarkers: [
                        {
                            day: '04/10/2019',
                            cssClass: 'e-custom-event-marker',
                            label: 'Project approval and kick-off'
                        }
                    ],
                    holidays: [{
                        from: "04/04/2019",
                        to: "04/05/2019",
                        label: " Public holidays",
                        cssClass: "e-custom-holiday"

                    },
                    {
                        from: "04/12/2019",
                        to: "04/12/2019",
                        label: " Public holiday",
                        cssClass: "e-custom-holiday"

                    }],
                    gridLines: 'Vertical',
                    highlightWeekends: true,
                    projectStartDate: new Date('03/25/2019'),
                    projectEndDate: new Date('05/30/2019'),
                    rowHeight: 40,
                    enableRtl: true,
                    taskbarHeight: 30
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        beforeEach(function (done) {
            setTimeout(done, 500);
        });
        it('timelineleft method', () => {
            expect(ganttObj.ganttChartModule.scrollObject.getTimelineLeft()).toBe(0);
            ganttObj.timelineModule.wholeTimelineWidth = 10000;
            expect(ganttObj.ganttChartModule.scrollObject.getTimelineLeft()).toBe(0);
        });
    });
    describe('Improve Coverage in Gantt component', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: exportData1,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor'
                    },
                    eventMarkers: [
                        {
                            day: '04/10/2019',
                            cssClass: 'e-custom-event-marker',
                            label: 'Project approval and kick-off'
                        }
                    ],
                    holidays: [{
                        from: "04/04/2019",
                        to: "04/05/2019",
                        label: " Public holidays",
                        cssClass: "e-custom-holiday"

                    },
                    {
                        from: "04/12/2019",
                        to: "04/12/2019",
                        label: " Public holiday",
                        cssClass: "e-custom-holiday"

                    }],
                    gridLines: 'Vertical',
                    highlightWeekends: true,
                    projectStartDate: new Date('03/25/2019'),
                    projectEndDate: new Date('05/30/2019'),
                    rowHeight: 40,
                    enableRtl: true,
                    taskbarHeight: 30
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('updateContent method', () => {
            ganttObj.timelineModule.isZoomingAction = true;
            ganttObj.isReact = true;
            ganttObj.isLoad = false;
            ganttObj.ganttChartModule.scrollObject.updateContent();
        });
        it('onScroll method', () => {
            ganttObj.enableTimelineVirtualization = true;
            ganttObj.ganttChartModule.scrollObject.previousScroll.left = 30;
            ganttObj.timelineModule.wholeTimelineWidth = 1000;
            ganttObj.ganttChartModule.scrollObject['onScroll']();
        });
    });

describe('ChartScroll startHold Method - Branch and Statement Coverage', () => {
    let ganttObj: Gantt;
    const testData: Object[] = [
        {
            TaskID: 1,
            TaskName: 'Planning',
            StartDate: new Date('2024-01-10'),
            EndDate: new Date('2024-01-20'),
            Duration: 10,
            Progress: 30,
            Predecessor: null,
            ResourceID: [1]
        },
        {
            TaskID: 2,
            TaskName: 'Design',
            StartDate: new Date('2024-01-21'),
            EndDate: new Date('2024-02-10'),
            Duration: 20,
            Progress: 50,
            Predecessor: 1,
            ResourceID: [2]
        },
        {
            TaskID: 3,
            TaskName: 'Development',
            StartDate: new Date('2024-02-11'),
            EndDate: new Date('2024-03-30'),
            Duration: 48,
            Progress: 0,
            Predecessor: 2,
            ResourceID: [3]
        },
        {
            TaskID: 4,
            TaskName: 'Testing',
            StartDate: new Date('2024-03-31'),
            EndDate: new Date('2024-04-15'),
            Duration: 15,
            Progress: 0,
            Predecessor: 3,
            ResourceID: [1, 2]
        },
        {
            TaskID: 5,
            TaskName: 'Release',
            StartDate: new Date('2024-04-16'),
            EndDate: new Date('2024-04-20'),
            Duration: 4,
            Progress: 0,
            Predecessor: 4,
            ResourceID: [1]
        }
    ];

    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: testData,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency: 'Predecessor',
                },
                enableInfiniteTimelineScroll: true,
                enableTimelineVirtualization: true,
                enableVirtualization: true,
                projectStartDate: new Date('2024-01-01'),
                projectEndDate: new Date('2024-12-31'),
                height: '500px',
                width: '100%',
                rowHeight: 40,
                taskbarHeight: 25,
                timelineSettings: {
                    timelineUnitSize: 60,
                    timelineViewMode: 'Month'
                }
            },
            done
        );
    });

    afterAll(() => {
        destroyGantt(ganttObj);
    });

    describe('Branch 1: enableInfiniteTimelineScroll is false', () => {
        it('should return early when enableInfiniteTimelineScroll is disabled', (done: Function) => {
            ganttObj.enableInfiniteTimelineScroll = false;
            const scrollElement = ganttObj.ganttChartModule.scrollElement;
            const clientX = scrollElement.getBoundingClientRect().left + 15;
            const clientY = scrollElement.getBoundingClientRect().bottom - 8;
            const mouseEvent = new MouseEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: clientX,
                clientY: clientY
            });
            scrollElement.dispatchEvent(mouseEvent);
            ganttObj.enableInfiniteTimelineScroll = true;
            done();
        });
    });

    describe('Branch 2: No horizontal scrollbar exists', () => {
        it('should return early when offsetWidth equals clientWidth', (done: Function) => {
            ganttObj.enableInfiniteTimelineScroll = true;
            const scrollElement = ganttObj.ganttChartModule.scrollElement;
            scrollElement.style.overflow = 'hidden';
            const clientX = scrollElement.getBoundingClientRect().left + 15;
            const clientY = scrollElement.getBoundingClientRect().bottom - 8;
            const mouseEvent = new MouseEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: clientX,
                clientY: clientY
            });
            scrollElement.dispatchEvent(mouseEvent);
            scrollElement.style.overflow = 'auto';
            done();
        });
    });

    describe('Branch 3: Click not on horizontal scrollbar area', () => {
        it('should not trigger scroll when click is above scrollbar position', (done: Function) => {
            ganttObj.enableInfiniteTimelineScroll = true;
            ganttObj.ganttChartModule.scrollObject['extendContinuousScrolling']('left');
            ganttObj.ganttChartModule.scrollObject['extendContinuousScrolling']('right');
            ganttObj.enableRtl = true
            ganttObj.ganttChartModule.scrollObject['extendContinuousScrolling']('left');
            ganttObj.ganttChartModule.scrollObject['extendContinuousScrolling']('right');
            ganttObj.enableRtl = false;
            done();
        });
    });

    describe('Branch 4: Click on horizontal scrollbar - left arrow area', () => {
        it('should trigger startContinuousScroll when clicking left arrow', (done: Function) => {
            ganttObj.enableInfiniteTimelineScroll = true;
            const scrollElement = ganttObj.ganttChartModule.scrollElement;
            const rect = scrollElement.getBoundingClientRect();
            const scrollbarHeight = 16;
            const scrollbarTop = scrollElement.offsetHeight - scrollbarHeight;
            const clientX = rect.left + 15;
            const clientY = rect.top + scrollbarTop + 8;
            const mouseEvent = new MouseEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: clientX,
                clientY: clientY
            });
            scrollElement.dispatchEvent(mouseEvent);
            ganttObj.ganttChartModule.scrollObject['isScrollArrowPressed'] = true;
            ganttObj.ganttChartModule.scrollObject['scrollArrowInterval'] =10
            ganttObj.ganttChartModule.scrollObject['stopHold'](mouseEvent);
            done();
        });
    });
    describe('Branch 4: Click on horizontal scrollbar - left arrow area', () => {
        it('should trigger startContinuousScroll when clicking left arrow', (done: Function) => {
            ganttObj.enableInfiniteTimelineScroll = true;
            const scrollElement = ganttObj.ganttChartModule.scrollElement;
            const rect = scrollElement.getBoundingClientRect();
            const scrollbarHeight = 16;
            const scrollbarTop = scrollElement.offsetHeight - scrollbarHeight;
            const clientX = rect.left + 15;
            const clientY = rect.top + scrollbarTop + 8;
            const mouseEvent = new MouseEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: clientX,
                clientY: clientY
            });
            scrollElement.dispatchEvent(mouseEvent);
            ganttObj.ganttChartModule.scrollObject['isScrollArrowPressed'] = true;
            ganttObj.ganttChartModule.scrollObject['scrollArrowInterval'] =10
            ganttObj.ganttChartModule.scrollObject.isBackwardScrolled = true;
            ganttObj.ganttChartModule.scrollObject['stopHold'](mouseEvent);
            done();
        });
    });

    describe('Branch 5: starthold', () => {
        it('should return early when offsetWidth equals clientWidth', (done: Function) => {
            ganttObj.enableInfiniteTimelineScroll = true;
            const scrollElement = ganttObj.ganttChartModule.scrollElement;
            scrollElement.style.overflow = 'hidden';
            const clientX = scrollElement.getBoundingClientRect().left + 15;
            const clientY = scrollElement.getBoundingClientRect().bottom - 8;
            const mouseEvent = new MouseEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: clientX,
                clientY: clientY
            });
            scrollElement.dispatchEvent(mouseEvent);
            spyOn((ganttObj as any).ganttChartModule.scrollObject, 'startContinuousScroll').and.callFake(() => {});
            ganttObj.ganttChartModule.scrollObject['extendStartHold'](true, mouseEvent, scrollElement)
            scrollElement.style.overflow = 'auto';
            done();
        });

        describe('Branch 6: starthold', () => {
        it('should return early when offsetWidth equals clientWidth', (done: Function) => {
            ganttObj.enableInfiniteTimelineScroll = true;
            const scrollElement = ganttObj.ganttChartModule.scrollElement;
            scrollElement.style.overflow = 'hidden';
            const clientX = scrollElement.getBoundingClientRect().left + 2000;
            const clientY = scrollElement.getBoundingClientRect().bottom - 8;
            const mouseEvent = new MouseEvent('pointerdown', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: clientX,
                clientY: clientY
            });
            scrollElement.dispatchEvent(mouseEvent);
            spyOn((ganttObj as any).ganttChartModule.scrollObject, 'startContinuousScroll').and.callFake(() => {});
            ganttObj.ganttChartModule.scrollObject['extendStartHold'](true, mouseEvent, scrollElement)
            scrollElement.style.overflow = 'auto';
            done();
        });
    });
    });

});

describe('Improve Coverage in onScroll method', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: exportData1,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor'
                    },
                    eventMarkers: [
                        {
                            day: '04/10/2019',
                            cssClass: 'e-custom-event-marker',
                            label: 'Project approval and kick-off'
                        }
                    ],
                    enableVirtualMaskRow: false,
                    enableVirtualization: true,
                    loadingIndicator: {
                        indicatorType: 'Spinner',
                    },
                    holidays: [{
                        from: "04/04/2019",
                        to: "04/05/2019",
                        label: " Public holidays",
                        cssClass: "e-custom-holiday"

                    },
                    {
                        from: "04/12/2019",
                        to: "04/12/2019",
                        label: " Public holiday",
                        cssClass: "e-custom-holiday"

                    }],
                    gridLines: 'Vertical',
                    highlightWeekends: true,
                    projectStartDate: new Date('03/25/2019'),
                    projectEndDate: new Date('05/30/2019'),
                    rowHeight: 40,
                    enableRtl: true,
                    taskbarHeight: 30,
                    enableInfiniteTimelineScroll : true
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('onScroll method', () => {
            ganttObj.showIndicator = true;
            ganttObj.ganttChartModule.scrollObject.previousScroll.left = 30;
            ganttObj.ganttChartModule.scrollObject['onScroll']();
        });
        it('deleteTableElements method', () => {
            const div = document.createElement('div');
            div.id = 'ganttContainerline-container';
            ganttObj.element.appendChild(div);
            ganttObj.ganttChartModule.scrollObject['deleteTableElements']();
        });
        it('updateContent method', () => {
            ganttObj.ganttChartModule.scrollObject.previousCount = 0;
            ganttObj.ganttChartModule.scrollObject.updateContent();
        });
    });
describe('chart scroll coverage', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt({
            dataSource: [{
                TaskID: 1,
                TaskName: 'Task 1',
                StartDate: '2020-01-01T00:00:00',
                EndDate: '2020-01-02T00:00:00',
                Duration: 1,
                BaselineStartDate: '2020-01-01T00:00:00',
                BaselineEndDate: '2020-01-03T00:00:00'
            }],
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                endDate: 'EndDate',
                duration: 'Duration',
                baselineStartDate: 'BaselineStartDate',
                baselineEndDate: 'BaselineEndDate'
            },
            timelineSettings: {
                topTier: {
                    unit: 'Day',
                },
            },
            timelineTemplate: '<div class="e-header-cell-label e-gantt-top-cell-text">${date}</div>',
            tooltipSettings: {
                showTooltip: true,
                timeline: '01-Jan-2020'
            },
            editSettings: { allowEditing: true }
        }, done);
    });

    afterAll(() => {
        destroyGantt(ganttObj);
    });

    it('updateContent coverage', () => {
        ganttObj.isLoad = false;
        ganttObj.isReact = true;
        ganttObj.ganttChartModule.scrollObject.updateContent();
    });
});