
/**
 * Gantt virtual scroll spec
 */

import { getValue } from '@syncfusion/ej2-base';
import { Gantt, Edit, Toolbar, Selection, Filter, VirtualScroll, Sort, CriticalPath, DayMarkers } from '../../src/index';
import { virtualData, releaseVirtualData,resourceResources, virtualData2 } from '../base/data-source.spec';
import { createGantt, destroyGantt, triggerMouseEvent } from '../base/gantt-util.spec';
Gantt.Inject(Edit, Toolbar, Selection, Filter, VirtualScroll, Sort, CriticalPath, DayMarkers);
interface EJ2Instance extends HTMLElement {
    ej2_instances: Object[];
}
describe('Gantt virtual scroll', () => {
    describe('Rendering and basic actions', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: virtualData,
                    enableVirtualization: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks'
                    },
                    height: '550px',
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: false
                    },
                    allowSelection: true,
                    allowSorting: true,
                    allowFiltering: true,
                    toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
                }, done);
        });
        beforeEach((done: Function) => {
            setTimeout(done, 500);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Rendering', () => {
            expect(ganttObj.currentViewData.length).toBe(22);
            expect(ganttObj.flatData.length).toBe(450);
        });
        it('Vertical scroll syncing', () => {
            ganttObj.dataBound = () => {
                if (ganttObj.ganttChartModule.scrollElement.scrollTop === 2000) {
                    // expect(ganttObj.treeGrid.getRows()[0].getAttribute('aria-rowindex')).toBe('57');
                    // expect(ganttObj.ganttChartModule.getChartRows()[0].getAttribute('aria-rowindex')).toBe('57');
                    ganttObj.dataBound = null;
                    ganttObj.dataBind();
                }
            };
            ganttObj.ganttChartModule.scrollObject.setScrollTop(2000);
        });
        // it('Select rows', () => {
            // let row: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + 'GanttTaskTableBody > tr:nth-child(4) > td');
            // triggerMouseEvent(row, 'mouseup', 30, 30);
            // expect(ganttObj.selectionModule.getSelectedRowIndexes()[0]).toBe(58);
            // ganttObj.selectionModule.clearSelection();
        // });
        it('Filtering', () => {         
            ganttObj.filterSettings.columns = [{ field: 'TaskName', matchCase: false, operator: 'startswith', value: 'task 300' }];
            ganttObj.dataBound = () => {
                if (ganttObj.filterSettings.columns.length > 0) {
                    expect(ganttObj.currentViewData.length).toBe(3);
                    ganttObj.clearFiltering();
                    ganttObj.dataBound = null;
                    ganttObj.dataBind();
                }
            };
            ganttObj.dataBind();
        });
        it('Adding record', () => {       
            ganttObj.addRecord({}, 'Child', 3);
            expect(ganttObj.flatData.length).toBe(451);
        });
        it('Editing record', () => {        
            ganttObj.updateRecordByID({TaskID:451, TaskName:'Edited Record'})
            expect(ganttObj.flatData[4].ganttProperties.taskName).toBe('Edited Record');
        });
        it('Deleting record', () => {        
            ganttObj.deleteRecord(5);
            expect(ganttObj.flatData.length).toBe(450);
        });
        it('Sort action', () => {   
            ganttObj.actionComplete = (args: any): void => {
                if (args.requestType === 'sorting') {
                    expect(Number(ganttObj.currentViewData[0].ganttProperties.taskId)).toBe(91); 
                }
            };
            ganttObj.sortColumn('TaskName', 'Descending')   
        });
        it('Editing record after sort action', (done: Function) => {
            ganttObj.actionComplete = (args: any): void => {
                if (args.requestType === 'save') {
                    expect(ganttObj.currentViewData[3].ganttProperties.taskName).toBe("Updated");
                }
            };
            let row: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + 'GanttTaskTableBody > tr:nth-child(3) > td > div.e-left-label-container');
            triggerMouseEvent(row, 'mouseup', 10, 10);
            expect(ganttObj.selectionModule.getSelectedRecords().length).toBe(1);
            expect(ganttObj.selectionModule.getSelectedRecords()[0]['TaskID']).toBe(99);
            let editToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_edit');
            triggerMouseEvent(editToolbar, 'click');
            setTimeout(done, 500);
            let taskName: any = (<EJ2Instance>document.getElementById(ganttObj.element.id + 'TaskName')).ej2_instances[0];
            taskName.value='Updated';
            let saveRecord: HTMLElement = document.querySelectorAll('#' + ganttObj.element.id + '_dialog > div.e-footer-content > button.e-control')[1] as HTMLElement;
            triggerMouseEvent(saveRecord, 'click');
        });
        it('CollapseAll handler function', () => {       
            let collapseallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_collapseall');
            triggerMouseEvent(collapseallToolbar, 'click');
            expect(ganttObj.flatData[1].expanded).toBe(false);
            expect(ganttObj.treeGrid.getRows()[1].getAttribute('aria-expanded')).toBe("false");
        });
        it('Expand/CollapseAtLevel method', () => {
            ganttObj.ganttChartModule.collapseAtLevel(0);
            expect(ganttObj.flatData[0].expanded).toBe(false);
            ganttObj.expandAtLevel(0);
            expect(ganttObj.flatData[0].expanded).toBe(true);
        });
    });
        describe('Collapse/Expand search actions with virtualization', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: virtualData,
                    enableVirtualization: true,
                    collapseAllParentTasks: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks'
                    },
                    height: '550px',
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: false
                    },
                    allowSelection: true,
                    allowSorting: true,
                    allowFiltering: true,
                    toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Collapse/Expand search method', () => {
            let collapseallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_collapseall');
            triggerMouseEvent(collapseallToolbar, 'click');
            let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            searchbar.value = 'Task';
            let searchButton: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbutton') as HTMLElement;
            triggerMouseEvent(searchButton, 'click');
            expect(ganttObj.ganttChartModule.getChartRows().length).toBe(22);
        });
    });
    describe('Collapse/Expand search actions with virtualization shimmer effect', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: virtualData,
                    enableVirtualization: true,
                    collapseAllParentTasks: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks'
                    },
                    height: '550px',
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: false
                    },
                    allowSelection: true,
                    loadingIndicator: { indicatorType: 'Shimmer' },
                    allowSorting: true,
                    allowFiltering: true,
                    toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('search shimmer effect', () => {
            ganttObj.expanding = (args: any): void => {
                if (args.name === "collapsed") {
                    expect(document.getElementsByClassName('e-table e-masked-table').length).toBe(2);
                }
            } 
            let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            searchbar.value = 'Task';
            let searchButton: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbutton') as HTMLElement;
            triggerMouseEvent(searchButton, 'click');
        });
    });
    describe('Virtual Scrolling Shimmer effect', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: virtualData,
                    enableVirtualization: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks'
                    },
                    height: '550px',
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: false
                    },
                    allowSelection: true,
                    allowSorting: true,
                    allowFiltering: true,
                    toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
                }, done);
        });
        beforeEach((done: Function) => {
            setTimeout(done, 500);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Vertical scroll shimmer effect', () => {
            ganttObj.actionBegin = (args: any): void => {
                if (args.requestType === "scroll") {
                    expect(document.getElementsByClassName('e-table e-masked-table').length).toBe(3);
                }
            };
            ganttObj.ganttChartModule.scrollObject.setScrollTop(2000);
        });
        it('Horizontal scroll shimmer effect', () => {
            ganttObj.actionComplete = (args: any): void => {
                if (args.requestType === "scroll") {
                    expect(document.getElementsByClassName('e-table e-masked-table').length).toBe(0);
                }
            };
            ganttObj.ganttChartModule.scrollObject.setScrollLeft(2000);
        });
    });
    describe('Virtual Scrolling  with critical path', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: virtualData,
                    enableVirtualization: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks'
                    },
                    height: '550px',
                    enableCriticalPath: true,
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: false
                    },
                    allowSelection: true,
                    allowSorting: true,
                    allowFiltering: true,
                    toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Critical path with virtualization', () => {
            expect(ganttObj.criticalPathModule.criticalTasks.length).toBe(450);

        });
    });
    describe('Virtual scroll shimmer with RTL', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: virtualData,
                    enableVirtualization: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks'
                    },
                    height: '550px',
                    enableRtl: true,
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: false
                    },
                    allowSelection: true,
                    allowSorting: true,
                    enableTimelineVirtualization: true,
                    allowFiltering: true,
                    toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
                }, done);
        });
        beforeEach((done: Function) => {
            setTimeout(done, 500);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Vertical scroll shimmer effect', () => {
            ganttObj.actionBegin = (args: any): void => {
                if (args.requestType === "scroll") {
                    expect(document.getElementsByClassName('e-table e-masked-table').length).toBe(3);
                }
            };
            ganttObj.ganttChartModule.scrollObject.setScrollTop(2000);
        });
        it('Horizontal scroll shimmer effect', () => {
            ganttObj.actionComplete = (args: any): void => {
                if (args.requestType === "scroll") {
                    expect(document.getElementsByClassName('e-table e-masked-table').length).toBe(0);
                }
            };
            ganttObj.ganttChartModule.scrollObject.setScrollLeft(2000);
        });
        it('Horizontal scroll shimmer effect', () => {
            ganttObj.ganttChartModule.virtualRender.appendChildElements(ganttObj.treeGrid.element);
       });
    });
});
describe('Top value with Scale', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: virtualData,
                enableVirtualization: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks'
                },
                height: '550px',
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: false
                },
                allowSelection: true,
                allowSorting: true,
                allowFiltering: true,
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
            }, done);
    });
    it('Checking Top Value', (done:Function) => {
        let virtualTable: HTMLElement = ganttObj.ganttChartModule.scrollElement.querySelector('.e-virtualtable') as HTMLElement;
        virtualTable.style.transform = 'scale(1.5)'
        ganttObj.actionComplete = (args: any): void => {
            if (args.requestType === "scroll") {
                expect(args.scrollTop).toBe(20);
                done()
            }
        };
        ganttObj.ganttChartModule.scrollObject.setScrollTop(20);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
// describe('Update Top Position with spinner', () => {
//     let ganttObj: Gantt;
//     beforeAll((done: Function) => {
//         ganttObj = createGantt(
//             {
//                 dataSource: virtualData,
//                 enableVirtualization: true,
//                 taskFields: {
//                     id: 'TaskID',
//                     name: 'TaskName',
//                     startDate: 'StartDate',
//                     endDate: 'EndDate',
//                     duration: 'Duration',
//                     progress: 'Progress',
//                     child: 'subtasks'
//                 },
//                 height: '550px',
//                 holidays: [
//                     {
//                         from: new Date('04/04/2024'),
//                         to: new Date('04/04/2024'),
//                         label: 'Local Holiday'
//                     }
//                 ],
//                 highlightWeekends:true,
//                 eventMarkers: [
//                     {
//                         day: new Date('04/02/2024'),
//                     }
//                 ],
//                 loadingIndicator: { indicatorType: 'Spinner' },
//                 enableVirtualMaskRow:false,
//                 editSettings: {
//                     allowAdding: true,
//                     allowEditing: true,
//                     allowDeleting: true,
//                     allowTaskbarEditing: true,
//                     showDeleteConfirmDialog: false
//                 },
//                 allowSelection: true,
//                 allowSorting: true,
//                 allowFiltering: true,
//                 toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
//             }, done);
//     });
//     it('Checking Top Value', (done:Function) => {
//         ganttObj.actionComplete = (args: any): void => {
//             if (args.requestType === "scroll") {
//                 expect(args.scrollTop).toBe(500);
//                 done();
//             }
//         };
//         ganttObj.treeGrid.element.querySelector('.e-content').scrollTop = 500
//     });
//     afterAll(() => {
//         if (ganttObj) {
//             destroyGantt(ganttObj);
//         }
//     });
// });
describe('Update Left Position', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: virtualData,
                enableVirtualization: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks'
                },
                height: '550px',
                holidays: [
                    {
                        from: new Date('04/04/2024'),
                        to: new Date('04/04/2024'),
                        label: 'Local Holiday'
                    }
                ],
                highlightWeekends:true,
                eventMarkers: [
                    {
                        day: new Date('04/02/2024'),
                    }
                ],
                loadingIndicator: { indicatorType: 'Spinner' },
                enableVirtualMaskRow:true,
                enableTimelineVirtualization:true,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: false
                },
                allowSelection: true,
                allowSorting: true,
                allowFiltering: true,
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
            }, done);
    });
    it('Checking Top Value', (done:Function) => {
        ganttObj.showIndicator = null
        ganttObj.actionComplete = (args: any): void => {
            if (args.requestType === "scroll") {
                expect(args.scrollLeft).toBe(34658);
                done()
            }
        };
        ganttObj.chartPane.querySelector('.e-content').scrollLeft = 34658
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('Update Left Position with enable virtualiazation false', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: virtualData,
                enableVirtualization: false,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks'
                },
                height: '550px',
                holidays: [
                    {
                        from: new Date('04/04/2024'),
                        to: new Date('04/04/2024'),
                        label: 'Local Holiday'
                    }
                ],
                highlightWeekends:true,
                eventMarkers: [
                    {
                        day: new Date('04/02/2024'),
                    }
                ],
                loadingIndicator: { indicatorType: 'Spinner' },
                enableVirtualMaskRow:false,
                enableTimelineVirtualization:true,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: false
                },
                allowSelection: true,
                allowSorting: true,
                allowFiltering: true,
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
            }, done);
    });
    it('Checking Top Value', (done:Function) => {
        ganttObj.showIndicator = null
        ganttObj.actionComplete = (args: any): void => {
            if (args.requestType === "scroll") {
                expect(args.scrollLeft).toBe(34658);
                done()
            }
        };
        ganttObj.chartPane.querySelector('.e-content').scrollLeft = 34658
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});

describe('Top value with Scale', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: virtualData,
                enableVirtualization: true,
                enableVirtualMaskRow: false,
                loadingIndicator: { indicatorType: 'Shimmer' },
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks'
                },
                height: '550px',
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: false
                },
                allowSelection: true,
                allowSorting: true,
                allowFiltering: true,
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
            }, done);
    });
    it('Virtualization with shimmer', (done:Function) => {
        let virtualTable: HTMLElement = ganttObj.ganttChartModule.scrollElement.querySelector('.e-virtualtable') as HTMLElement;
        virtualTable.style.transform = 'scale(1.5)'
        ganttObj.actionComplete = (args: any): void => {
            if (args.requestType === "scroll") {
                expect(args.scrollTop).toBe(20);
                done()
            }
        };
        ganttObj.ganttChartModule.scrollObject.setScrollTop(20);
    });
    it('updatecontent', () => {
        ganttObj.updateContentHeight();
    });
    it('Virtualization with shimmer', () => {
        ganttObj.isVirtualScroll = true;
        ganttObj.treeGrid.dataBound();
    });
    it('Virtualization with shimmer', () => {
        ganttObj.enableVirtualization = false;
        ganttObj.isVirtualScroll = true;
        ganttObj.treeGrid.dataBound();
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
// describe('CR:911375-Scroll jumps when delete random parent record with virtualization', () => {
//     Gantt.Inject(Selection, Toolbar, DayMarkers, Edit, Filter, VirtualScroll, Sort);
//     let ganttObj: Gantt;
//     beforeAll((done: Function) => {
//         ganttObj = createGantt(
//         {
//             dataSource: releaseVirtualData,
//             treeColumnIndex: 1,
//             taskFields: {
//                 id: 'TaskID',
//                 name: 'TaskName',
//                 startDate: 'StartDate',
//                 duration: 'Duration',
//                 progress: 'Progress',
//                 parentID: 'parentID'
//             },
//             enableVirtualization: true,
//             enableTimelineVirtualization: true,
//             editSettings: {
//                 allowAdding: true,
//                 allowEditing: true,
//                 allowDeleting: true,
//                 allowTaskbarEditing: true
//             },
//             allowReordering: true,
//             enableContextMenu: true,
//             columns: [
//                 { field: 'TaskID' },
//                 { field: 'TaskName' },
//                 { field: 'StartDate' },
//                 { field: 'Duration' },
//                 { field: 'Progress' },
//             ],
//             toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search'],
//             allowSelection: true,
//             allowRowDragAndDrop: true,
//             highlightWeekends: true,
//             allowFiltering: true,
//             gridLines: 'Both',
//             height: '550px',
//             timelineSettings: {
//                 showTooltip: true,
//                 topTier: {
//                     unit: 'Week',
//                     format: 'dd/MM/yyyy'
//                 },
//                 bottomTier: {
//                     unit: 'Day',
//                     count: 1
//                 }
//             },
//             allowResizing: true,
//             splitterSettings: {
//                 columnIndex: 3
//             },
//         }, done);
//     });
//     beforeEach((done: Function) => {
//         setTimeout(done, 500);
//     });
//     it('Delete a random parent record in virtual mode', (done: Function) => {
//         ganttObj.rowSelected = (args: any) => {
//             if (args.name === "rowSelected" && args.rowIndex === 47) {
//                 // Except selected record TaskID after delete action
//                 expect(ganttObj.selectedRowIndex).toBe(47);
//                 expect(getValue('TaskID', ganttObj.flatData[ganttObj.selectedRowIndex])).toBe(55);
//                 done();
//             }
//         };
//         ganttObj.editModule.deleteRecord(48);
//     });
//     afterAll(() => {
//         if (ganttObj) {
//             destroyGantt(ganttObj);
//         }
//     });
// });
// describe('CR:911375-Scroll jumps when delete last parent record with virtualization', () => {
//     Gantt.Inject(Selection, Toolbar, DayMarkers, Edit, Filter, VirtualScroll, Sort);
//     let ganttObj: Gantt;
//     beforeAll((done: Function) => {
//         ganttObj = createGantt(
//         {
//             dataSource: releaseVirtualData,
//             treeColumnIndex: 1,
//             taskFields: {
//                 id: 'TaskID',
//                 name: 'TaskName',
//                 startDate: 'StartDate',
//                 duration: 'Duration',
//                 progress: 'Progress',
//                 parentID: 'parentID'
//             },
//             enableVirtualization: true,
//             enableTimelineVirtualization: true,
//             editSettings: {
//                 allowAdding: true,
//                 allowEditing: true,
//                 allowDeleting: true,
//                 allowTaskbarEditing: true
//             },
//             allowReordering: true,
//             enableContextMenu: true,
//             columns: [
//                 { field: 'TaskID' },
//                 { field: 'TaskName' },
//                 { field: 'StartDate' },
//                 { field: 'Duration' },
//                 { field: 'Progress' },
//             ],
//             toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search'],
//             allowSelection: true,
//             allowRowDragAndDrop: true,
//             highlightWeekends: true,
//             allowFiltering: true,
//             gridLines: 'Both',
//             height: '550px',
//             timelineSettings: {
//                 showTooltip: true,
//                 topTier: {
//                     unit: 'Week',
//                     format: 'dd/MM/yyyy'
//                 },
//                 bottomTier: {
//                     unit: 'Day',
//                     count: 1
//                 }
//             },
//             allowResizing: true,
//             splitterSettings: {
//                 columnIndex: 3
//             },
//         }, done);
//     });
//     beforeEach((done: Function) => {
//         setTimeout(done, 500);
//     });
//     it('Delete a last parent record in virtual mode', () => {
//         ganttObj.rowSelected = (args: any) => {
//             if (args.name === "rowSelected" && args.rowIndex === 0) {
//                 // Except selected record TaskID after delete action
//                 expect(ganttObj.selectedRowIndex).toBe(0);
//                 expect(getValue('TaskID', ganttObj.flatData[ganttObj.selectedRowIndex])).toBe(1);
//             }
//         };
//         ganttObj.editModule.deleteRecord(2048);
//     });
//     afterAll(() => {
//         if (ganttObj) {
//             destroyGantt(ganttObj);
//         }
//     });
// });
describe('Adding new record while newRowPosition is Bottom in virtual mode', () => {
    Gantt.Inject(Selection, Toolbar, DayMarkers, Edit, Filter, VirtualScroll, Sort);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
        {
            dataSource: releaseVirtualData,
            treeColumnIndex: 1,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                parentID: 'parentID'
            },
            enableVirtualization: true,
            enableTimelineVirtualization: true,
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                newRowPosition: 'Bottom'
            },
            allowReordering: true,
            enableContextMenu: true,
            columns: [
                { field: 'TaskID' },
                { field: 'TaskName' },
                { field: 'StartDate' },
                { field: 'Duration' },
                { field: 'Progress' },
            ],
            toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search'],
            allowSelection: true,
            allowRowDragAndDrop: true,
            highlightWeekends: true,
            allowFiltering: true,
            gridLines: 'Both',
            height: '550px',
            timelineSettings: {
                showTooltip: true,
                topTier: {
                    unit: 'Week',
                    format: 'dd/MM/yyyy'
                },
                bottomTier: {
                    unit: 'Day',
                    count: 1
                }
            },
            allowResizing: true,
            splitterSettings: {
                columnIndex: 3
            },
        }, done);
    });
    beforeEach((done: Function) => {
        setTimeout(done, 500);
    });
    it('Checking selectedRowIndex value while newRowPosition is Bottom in virtual mode', (done: Function) => {
        ganttObj.rowSelected = (args: any) => {
            if (args.name === "rowSelected" && args.rowIndex === 2050) {
                // Except selected record TaskID after toolbar add action
                expect(ganttObj.selectedRowIndex).toBe(2050);
                expect(getValue('TaskID', ganttObj.flatData[ganttObj.selectedRowIndex])).toBe(2051);
                done();
            }
        };
        let add: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_add') as HTMLElement;
        triggerMouseEvent(add, 'click');
        let save: HTMLElement = document.querySelector('#' + ganttObj.element.id + '_dialog').getElementsByClassName('e-primary')[0] as HTMLElement;
        triggerMouseEvent(save, 'click');
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('console error click fit to project in virtual mode', () => {
    Gantt.Inject(Selection, Toolbar, DayMarkers, Edit, Filter, VirtualScroll, Sort);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
        {
            dataSource: releaseVirtualData,
            treeColumnIndex: 1,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                parentID: 'parentID'
            },
            enableVirtualization: true,
            enableTimelineVirtualization: true,
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                newRowPosition: 'Bottom'
            },
            allowReordering: true,
            enableContextMenu: true,
            columns: [
                { field: 'TaskID' },
                { field: 'TaskName' },
                { field: 'StartDate' },
                { field: 'Duration' },
                { field: 'Progress' },
            ],
            toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search'],
            allowSelection: true,
            allowRowDragAndDrop: true,
            highlightWeekends: true,
            allowFiltering: true,
            gridLines: 'Both',
            height: '550px',
            timelineSettings: {
                showTooltip: true,
                topTier: {
                    unit: 'Week',
                    format: 'dd/MM/yyyy'
                },
                bottomTier: {
                    unit: 'Day',
                    count: 1
                }
            },
            allowResizing: true,
            splitterSettings: {
                columnIndex: 3
            },
        }, done);
    });
    it('console error click fit to project', () => {
        ganttObj.toolbarModule.zoomToFit();
        ganttObj.toolbarModule.zoomToFit();
        expect(ganttObj.currentViewData.length).toBe(22);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('Selection Row index dynamically changed', () => {
    Gantt.Inject(Selection, Toolbar, DayMarkers, Edit, Filter, VirtualScroll, Sort);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
        {
            dataSource: releaseVirtualData,
            treeColumnIndex: 1,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                parentID: 'parentID'
            },
            enableVirtualization: true,
            enableTimelineVirtualization: true,
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                newRowPosition: 'Bottom'
            },
            allowReordering: true,
            enableContextMenu: true,
            columns: [
                { field: 'TaskID' },
                { field: 'TaskName' },
                { field: 'StartDate' },
                { field: 'Duration' },
                { field: 'Progress' },
            ],
            toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search'],
            allowSelection: true,
            allowRowDragAndDrop: true,
            highlightWeekends: true,
            allowFiltering: true,
            gridLines: 'Both',
            height: '550px',
            timelineSettings: {
                showTooltip: true,
                topTier: {
                    unit: 'Week',
                    format: 'dd/MM/yyyy'
                },
                bottomTier: {
                    unit: 'Day',
                    count: 1
                }
            },
            allowResizing: true,
            splitterSettings: {
                columnIndex: 3
            },
        }, done);
    });
    it('Checking the select Row Index', () => {
        ganttObj.selectedRowIndex = 50;
        expect(ganttObj.selectedRowIndex).toBe(50)
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('Collapse by id method for virtual data', () => {
    Gantt.Inject(Selection, Toolbar, DayMarkers, Edit, Filter, VirtualScroll, Sort);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
        {
            dataSource: virtualData,
                    enableVirtualization: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks'
                    },
                    height: '550px',
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: false
                    },
                    allowSelection: true,
                    allowSorting: true,
                    allowFiltering: true,
                    toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search']
        }, done);
    });
    it('Collapse the record in last page', () => {
        ganttObj.collapseByID(33);
        expect(ganttObj.flatData[32].expanded).toBe(false)
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('Customizing milestone with multitaskbar enabled', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: virtualData2,
                resources: resourceResources,
                viewType: 'ResourceView',
                showOverAllocation: true,
                allowSorting: true,
                treeColumnIndex: 1,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency: 'Predecessor',
                    resourceInfo: 'resources',
                    work: 'work',
                    parentID: 'parentID'
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
                enableVirtualization: true,
                allowReordering: true,
                enableContextMenu: true,
                collapseAllParentTasks: true,
                enableMultiTaskbar: true,
                queryTaskbarInfo(args) {
                    args.milestoneColor = "#f98700"; //orange
                },
                columns: [
                    { field: 'TaskID', visible: true },
                    { field: 'TaskName', headerText: 'Name', width: 250 },
                    { field: 'work', headerText: 'Work' },
                    { field: 'Progress' },
                    { field: 'resourceGroup', headerText: 'Group' },
                    { field: 'StartDate' },
                    { field: 'Duration' },
                ],
                allowExcelExport: true,
                allowPdfExport: true,
                sortSettings: {
                    columns: [{ field: 'TaskID', direction: 'Ascending' },
                        { field: 'TaskName', direction: 'Ascending' }]
                },
                allowSelection: true,
                allowRowDragAndDrop: true,
                highlightWeekends: true,
                allowFiltering: true,
                gridLines: 'Both',
                height: '550px',
                labelSettings: {
                    rightLabel: 'resources',
                    taskLabel: 'Progress'
                },
                timelineSettings: {
                    showTooltip: true,
                    topTier: {
                        unit: 'Week',
                        format: 'dd/MM/yyyy'
                    },
                    bottomTier: {
                        unit: 'Day',
                        count: 1
                    }
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
                allowResizing: true,
                selectionSettings: {
                    mode: 'Row',
                    type: 'Single',
                    enableToggle: false
                },
                tooltipSettings: {
                    showTooltip: true
                },
                taskbarHeight: 20,
                rowHeight: 40,
                splitterSettings: {
                    columnIndex: 3
                },
            }, done);
    });
    it('Check milestone color customization', () => {       
        expect(ganttObj.getRowByIndex(0).querySelectorAll('.e-gantt-milestone')[0]['style'].backgroundColor).toBe('rgb(249, 135, 0)');
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
