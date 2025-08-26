/**
 * Gantt toolbar spec
 */
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { Gantt, Edit, Toolbar, Selection, Filter, ZoomTimelineSettings, CriticalPath } from '../../src/index';
import { projectData1, projectData, projectNewData1, MT887301, hierarchyData, SelfRefData } from '../base/data-source.spec';
import { createGantt, destroyGantt, triggerMouseEvent, getKeyUpObj } from '../base/gantt-util.spec';
import { getValue } from '@syncfusion/ej2-base';
describe('Gantt toolbar support', () => {
    describe('Gantt toolbar action', () => {
        Gantt.Inject(Edit, Toolbar, Selection, Filter);
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: projectData1,
                    allowSelection: true,
                    allowFiltering: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor',
                        segments: 'Segments'
                    },
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: true
                    },
                    toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                        'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                    projectStartDate: new Date('02/01/2017'),
                    projectEndDate: new Date('12/30/2017'),
                    rowHeight: 40,
                    taskbarHeight: 30
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });

        it('Check all toolbar rendered properly', () => {
            let toolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar') as HTMLElement;
            expect(toolbar.getElementsByClassName('e-toolbar-item').length).toBe(15);
        });

        it('Ensuring proper toolbar display', () => {
            ganttObj.toolbar = ["Add", "Cancel", "CollapseAll", "Delete", "Edit", "ExpandAll", "NextTimeSpan", "PrevTimeSpan", "Search" ,"Update","ZoomIn","ZoomOut","ZoomToFit"];
            ganttObj.dataBind();
            expect(ganttObj.element.getElementsByClassName('e-hidden').length).toBe(4);
        });

        it('Add handler function', () => {
            let add: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_add') as HTMLElement;
            triggerMouseEvent(add, 'click');
            let startDate: HTMLInputElement = (<HTMLInputElement>document.querySelector('#' + ganttObj.element.id + 'StartDate'));
            if (startDate) {
                let StartDateInput: any = (document.getElementById(ganttObj.element.id + 'StartDate') as any).ej2_instances[0];
                StartDateInput.value = new Date('02/06/2017');
            }
            let save: HTMLElement = document.querySelector('#' + ganttObj.element.id + '_dialog').getElementsByClassName('e-primary')[0] as HTMLElement;
            triggerMouseEvent(save, 'click');
            expect(ganttObj.flatData.length).toBe(42);
        });

        // it('Delete handler function', () => {
        //     ganttObj.selectionModule.selectRow(2);
        //     let deleteToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_delete') as HTMLElement;
        //     triggerMouseEvent(deleteToolbar, 'click');
        //     let okElement: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_deleteConfirmDialog').getElementsByClassName('e-primary')[0] as HTMLElement;
        //     triggerMouseEvent(okElement, 'click');
        //     expect(ganttObj.flatData.length).toBe(41);
        //     ganttObj.selectionModule.clearSelection();
        // });

        it('Previous Timespan handler function', () => {
            let previoustimespanToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_prevtimespan') as HTMLElement;
            triggerMouseEvent(previoustimespanToolbar, 'click');
            expect(ganttObj.getFormatedDate(ganttObj.timelineModule.timelineStartDate, 'MM/dd/yyyy')).toBe('01/29/2017');
        });

        it('Next Timespan handler function', () => {
            let nexttimespanToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_nexttimespan') as HTMLElement;
            triggerMouseEvent(nexttimespanToolbar, 'click');
            expect(ganttObj.getFormatedDate(ganttObj.timelineModule.timelineEndDate, 'MM/dd/yyyy')).toBe('12/31/2017');
        });

        it('Edit handler function', () => {
            ganttObj.selectionModule.selectRow(2);
            expect(ganttObj.selectionModule.getSelectedRecords().length).toBe(1);
            let editToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_edit') as HTMLElement;
            triggerMouseEvent(editToolbar, 'click');
            let progress: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + 'Progress'));
            if (progress) {
                let progressInput: any = (document.getElementById(ganttObj.element.id + 'Progress') as any).ej2_instances[0];
                progressInput.value = 80;
                let save: HTMLElement = document.querySelector('#' + ganttObj.element.id + '_dialog').getElementsByClassName('e-primary')[0] as HTMLElement;
                triggerMouseEvent(save, 'click');
                // expect(getValue('Progress', ganttObj.flatData[2])).toBe(80);
            }
            ganttObj.selectionModule.clearSelection();
        });

        // it('CollapseAll handler function', () => {
        //     let collapseallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_collapseall') as HTMLElement;
        //     triggerMouseEvent(collapseallToolbar, 'click');
        //     expect(ganttObj.flatData[1].expanded).toBe(false);
        //     ganttObj.selectionModule.clearSelection();
        // });

        it('ExpandAll handler function', () => {
            let expandallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_expandall') as HTMLElement;
            triggerMouseEvent(expandallToolbar, 'click');
            expect(ganttObj.flatData[1].expanded).toBe(true);
            ganttObj.selectionModule.clearSelection();
        });

        it('Check Zoom Out action', () => {
            let zoomOut: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomout') as HTMLElement;
            triggerMouseEvent(zoomOut, 'click');
            expect(ganttObj.timelineModule.customTimelineSettings.timelineUnitSize).toBe(99);
            expect(ganttObj.currentZoomingLevel.level).toBe(10);

        });

        it('Check Zoom In action', () => {
            let zoomIn: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomin') as HTMLElement;
            triggerMouseEvent(zoomIn, 'click');
            expect(ganttObj.timelineModule.customTimelineSettings.timelineUnitSize).toBe(33);
            expect(ganttObj.timelineModule.customTimelineSettings.bottomTier.unit).toBe('Day');
            expect(ganttObj.currentZoomingLevel.level).toBe(11);
            ganttObj.fitToProject();

        });

        it('Enable toolbar on row selection', () => {
            ganttObj.selectionModule.selectRow(4);
            expect(ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar').getElementsByClassName('e-hidden').length).toBe(2);
            ganttObj.selectionModule.clearSelection();
        });

        it('Disable toolbar on row deselection', () => {
            ganttObj.selectionModule.clearSelection();
            expect(ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar').getElementsByClassName('e-hidden').length).toBe(4);
        });

        it('On celledit handler function', () => {
            let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(3) > td:nth-child(2)') as HTMLElement;
            triggerMouseEvent(taskName, 'dblclick');
            expect(ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar').getElementsByClassName('e-hidden').length).toBe(3);
            ganttObj.selectionModule.clearSelection();
        });

        it('On celleditsaved handler function', () => {
            let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(3) > td:nth-child(2)') as HTMLElement;
            triggerMouseEvent(taskName, 'dblclick');
            let taskValue: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrolTaskName'));
            taskValue.value = 'Update TaskName';
            let updateToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_update') as HTMLElement;
            triggerMouseEvent(updateToolbar, 'click');
            expect(ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar').getElementsByClassName('e-hidden').length).toBe(4);
            ganttObj.selectionModule.clearSelection();
        });

        // it('Cancel handler function', () => {
        //     let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(4) > td:nth-child(2)') as HTMLElement;
        //     triggerMouseEvent(taskName, 'dblclick');
        //     let taskValue: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrolTaskName'));
        //     if (taskValue) {
        //         taskValue.value = 'Cancel TaskName';
        //         let cancelToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_cancel') as HTMLElement;
        //         triggerMouseEvent(cancelToolbar, 'mousedown');
        //         expect(getValue('TaskName', ganttObj.flatData[3])).toBe('Plan budget');
        //         ganttObj.selectionModule.clearSelection();
        //     }
        // });

        it('Search Icon handler function', () => {
            let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            searchbar.value = '';
            let searchIcon: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbutton') as HTMLElement;
            triggerMouseEvent(searchIcon, 'click');
            expect(ganttObj.currentViewData.length).toBe(42);
            ganttObj.clearFiltering();
        });

        it('Search Enter handler function', () => {
            let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            searchbar.value = 'hai';
            (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar')).focus();
            (ganttObj.toolbarModule as any).keyUpHandler(getKeyUpObj(13, searchbar));
            expect(ganttObj.searchSettings.key).toBe('hai');
        });

        // it('Enable toolbar using public method', () => {
        //     ganttObj.toolbarModule.enableItems(['toolbarfilter'], false);
        //     expect(ganttObj.element.getElementsByClassName('e-toolbar-item e-overlay')[0].textContent).toBe('Quick Filter');
        // });

        // it('Cancel toolbar', (done: Function) => {
        //     let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(3) > td:nth-child(2)') as HTMLElement;
        //     triggerMouseEvent(taskName, 'dblclick');
        //     let cancelToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_cancel') as HTMLElement;
        //     triggerMouseEvent(cancelToolbar, 'click');
        //     ganttObj.dataBound = () => {
        //         done();
        //     }
        //     ganttObj.refresh();
        // });

        it('SearchKey and SearchValue', (done: Function) => {
            ganttObj.isAdaptive = true;
            ganttObj.dataBind();
            ganttObj.searchSettings.key = '';
            let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            searchbar.value = 'check';
            let searchButton: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbutton') as HTMLElement;
            triggerMouseEvent(searchButton, 'click');
            ganttObj.dataBound = () => {
                expect(ganttObj.searchSettings.key).toBe('check');
                done();
            }
            ganttObj.refresh();
        });

        it('Selection Mode Cell', (done: Function) => {
            ganttObj.selectionSettings.mode = 'Cell';
            ganttObj.selectionModule.selectCell({ cellIndex: 1, rowIndex: 1 });
            ganttObj.dataBound = () => {
                let deleteToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_delete') as HTMLElement;
                triggerMouseEvent(deleteToolbar, 'click');
                let okElement: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_deleteConfirmDialog').getElementsByClassName('e-primary')[0] as HTMLElement;
                triggerMouseEvent(okElement, 'click');
                done();
            }
            ganttObj.refresh();
        });

        it('Disable adding ', (done: Function) => {
            ganttObj.editSettings.allowAdding = false;
            ganttObj.dataBound = () => {
                expect(ganttObj.editSettings.allowAdding).toBe(false);
                done();
            }
            ganttObj.refresh();
        });

        it('Disable SelectionModule ', (done: Function) => {
            ganttObj.allowSelection = false;
            ganttObj.dataBind();
            expect(ganttObj.allowSelection).toBe(false);
            done();
        });

        it('Disable EditModule ', (done: Function) => {
            ganttObj.editSettings.allowEditing = false;
            ganttObj.editSettings.allowAdding = false;
            ganttObj.editSettings.allowDeleting = false;
            ganttObj.editSettings.allowTaskbarEditing = false;
            ganttObj.dataBind();
            expect(ganttObj.editSettings.allowAdding).toBe(false);
            expect(ganttObj.editSettings.allowEditing).toBe(false);
            expect(ganttObj.editSettings.allowDeleting).toBe(false);
            expect(ganttObj.editSettings.allowTaskbarEditing).toBe(false);
            done();
        });

        it('Toolbar null value check', (done: Function) => {
            ganttObj.toolbar = null;
            ganttObj.dataBound = () => {
                expect(ganttObj.toolbar).toBe(null);
                done();
            }
            ganttObj.refresh();
        });

        it('Toolbar Object', (done: Function) => {
            ganttObj.toolbar = [{ text: 'Add', tooltipText: 'Add task' }];
            ganttObj.dataBound = () => {
                expect(ganttObj.toolbar.length).toBe(1);
                done();
            }
            ganttObj.refresh();
        });
        it('CR-EJ2-46731: Maintaining additional fields in segments on zooming action', (done: Function) => {
            ganttObj.actionComplete = (args: any): void => {
                if (args.requestType === 'AfterZoomIn') {
                    expect(getValue('Segments[0].Custom', ganttObj.flatData[0].taskData)).toBe("Test");
                }
            };
            ganttObj.toolbar = ['ZoomIn', 'ZoomOut'];
            ganttObj.dataSource = [{
                TaskID: 1, TaskName: 'Plan timeline', StartDate: new Date('02/04/2017'), EndDate: new Date('02/10/2017'),
                Duration: 10, Progress: '60',
                Segments: [
                    { StartDate: new Date('02/04/2017'), Duration: 2, Custom: 'Test' },
                    { StartDate: new Date('02/05/2017'), Duration: 5, Custom: 'Test' },
                    { StartDate: new Date('02/08/2017'), Duration: 3, Custom: 'Test'  }
                  ]
            }];
            ganttObj.dataBound = () => {
                done();
            };
            ganttObj.refresh();
            let zoomIn: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomin') as HTMLElement;
            triggerMouseEvent(zoomIn, 'click');
        });
        it('Destroy method', () => {
            ganttObj.toolbarModule.destroy();
        });
    });
    describe('Zoomin action and zoomtofit action', () => {
        Gantt.Inject(Edit, Toolbar, Selection, Filter);
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: projectData1,
                    allowSelection: true,
                    allowFiltering: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor',
                        segments: 'Segments'
                    },
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: true
                    },
                    toolbar: ['ZoomIn', 'ZoomOut', 'ZoomToFit', 'Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                        'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                    projectStartDate: new Date('02/01/2017'),
                    projectEndDate: new Date('12/30/2017'),
                    rowHeight: 40,
                    taskbarHeight: 30
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Check Zoom In action', () => {
            ganttObj.actionComplete = (args: any): void => {
                if (args.requestType === 'AfterZoomToProject') {
                    expect(args.requestType).toBe('AfterZoomToProject');
                }
            };
            let zoomIn: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomin') as HTMLElement;
            triggerMouseEvent(zoomIn, 'click');
            let zoomToFit: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomtofit') as HTMLElement;
            triggerMouseEvent(zoomToFit, 'click');
        });
    });
     describe('Gantt toolbar action', () => {
        Gantt.Inject(Edit, Toolbar, Selection, Filter);
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: projectData1,
                    allowSelection: true,
                    allowFiltering: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor',
                        segments: 'Segments'
                    },
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: true
                    },
                    toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                        'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                    projectStartDate: new Date('02/01/2017'),
                    projectEndDate: new Date('12/30/2017'),
                    rowHeight: 40,
                    taskbarHeight: 30
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Update handler function', () => {
            let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(5) > td:nth-child(2)') as HTMLElement;
            triggerMouseEvent(taskName, 'dblclick');
            let taskValue: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrolTaskName'));
            if(taskValue) {
            taskValue.value = 'Update TaskName';
            let updateToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_update') as HTMLElement;
            triggerMouseEvent(updateToolbar, 'click');
            expect(getValue('TaskName', ganttObj.flatData[4])).toBe('Update TaskName');
            ganttObj.selectionModule.clearSelection();
            }
        });
        it('Destroy method', () => {
            ganttObj.toolbarModule.destroy();
        });
    });
    describe('Do indent in immutable mode ', () => {
        let ganttObj: Gantt;
        let editingData: Object[] = [
            {
              TaskID: 1,
              TaskName: 'Project initiation',
              StartDate: new Date('04/02/2019'),
              EndDate: new Date('04/21/2019'),
              subtasks: [
                {
                  TaskID: 2,
                  TaskName: 'Identify site location',
                  StartDate: new Date('04/02/2019'),
                  Duration: 0,
                  Progress: 30,
                  resources: [1],
                  info: 'Measure the total property area alloted for construction',
                },
                {
                  TaskID: 3,
                  TaskName: 'Perform soil test',
                  StartDate: new Date('04/02/2019'),
                  Duration: 4,
                  Predecessor: '2',
                  resources: [2, 3, 5],
                  info:
                    'Obtain an engineered soil test of lot where construction is planned.' +
                    'From an engineer or company specializing in soil testing',
                },
                {
                  TaskID: 4,
                  TaskName: 'Soil test approval',
                  StartDate: new Date('04/02/2019'),
                  Duration: 0,
                  Predecessor: '3',
                  Progress: 30,
                },
              ],
            },
            {
              TaskID: 5,
              TaskName: 'Project estimation',
              StartDate: new Date('04/02/2019'),
              EndDate: new Date('04/21/2019'),
              subtasks: [
                {
                  TaskID: 6,
                  TaskName: 'Develop floor plan for estimation',
                  StartDate: new Date('04/04/2019'),
                  Duration: 3,
                  Predecessor: '4',
                  Progress: 30,
                  resources: 4,
                  info: 'Develop floor plans and obtain a materials list for estimations',
                },
              ],
            },
          ];
        beforeAll((done: Function) => {
            ganttObj = createGantt({
                dataSource: editingData,
                dateFormat: 'MMM dd, y',
                enableImmutableMode: true,
                taskFields: {
                  id: 'TaskID',
                  name: 'TaskName',
                  startDate: 'StartDate',
                  endDate: 'EndDate',
                  duration: 'Duration',
                  progress: 'Progress',
                  dependency: 'Predecessor',
                  child: 'subtasks',
                  notes: 'info',
                  resourceInfo: 'resources',
                },
                editSettings: {
                  allowAdding: true,
                  allowEditing: true,
                  allowDeleting: true,
                  allowTaskbarEditing: true,
                  showDeleteConfirmDialog: true,
                },
                toolbar: ['Indent', 'Outdent'],
                allowSelection: true,
                gridLines: 'Both',
                height: '450px',
                treeColumnIndex: 0,
                resourceFields: {
                  id: 'resourceId',
                  name: 'resourceName',
                },
                highlightWeekends: true,
                timelineSettings: {
                  topTier: {
                    unit: 'Week',
                    format: 'MMM dd, y',
                  },
                  bottomTier: {
                    unit: 'Day',
                  },
                },
                columns: [
                  { field: 'TaskID' },
                  {
                    field: 'TaskName',
                    headerText: 'Job Name',
                    width: '250',
                    clipMode: 'EllipsisWithTooltip',
                  },
                  { field: 'StartDate' },
                  { field: 'Duration' },
                  { field: 'Progress' },
                  { field: 'Predecessor' },
                ],
                eventMarkers: [
                  { day: '4/17/2019', label: 'Project approval and kick-off' },
                  { day: '5/3/2019', label: 'Foundation inspection' },
                  { day: '6/7/2019', label: 'Site manager inspection' },
                  { day: '7/16/2019', label: 'Property handover and sign-off' },
                ],
                labelSettings: {
                  leftLabel: 'TaskName',
                  rightLabel: 'resources',
                },
                editDialogFields: [
                  { type: 'General', headerText: 'General' },
                  { type: 'Dependency' },
                  { type: 'Resources' },
                  { type: 'Notes' },
                ],
                splitterSettings: {
                  columnIndex: 2,
                },
                projectStartDate: new Date('03/25/2019'),
                projectEndDate: new Date('07/28/2019'),
            }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Indent for children', () => {
            ganttObj.actionComplete = (args: any): void => {
                if (args.requestType === "indented") {
                    expect(ganttObj.treeGrid.getRows()[5].getElementsByClassName('e-icons').length).toBe(4);
                }
            };
            ganttObj.selectRow(4);
            let indent: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_indent') as HTMLElement;
            triggerMouseEvent(indent, 'click');
        });
    });
    describe('Custom Zooming levels ', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt({
                dataSource: projectData,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency:'Predecessor',
                    baselineStartDate: "BaselineStartDate",
                    baselineEndDate: "BaselineEndDate",
                    child: 'subtasks',
                    indicators: 'Indicators'
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                toolbar: [ 'ZoomIn', 'ZoomOut', 'ZoomToFit'],
                load: (args?: any) => {
                    let gantt: any=(document.getElementsByClassName('e-gantt')[0] as any).ej2_instances[0];
                    const zoomingLevels: any = gantt.getZoomingLevels();
                    const zoomOutLimit: number = 4;
                    const zoomInLimit: number = 14;
                    gantt.zoomingLevels = zoomingLevels.slice(
                        zoomOutLimit,
                        zoomInLimit
                    );
                },
                actionComplete: (args?: any) => {
                    if(args.requestType == "AfterZoomOut") {
                        expect(args.timeline.level).toBe(14);
                    }
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
                height: '550px',
                projectStartDate: new Date('03/25/2019'),
                projectEndDate: new Date('05/30/2019')
            }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Zoom out', () => {
            let zoomIn: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomin') as HTMLElement;
            triggerMouseEvent(zoomIn, 'click');
            expect(ganttObj.timelineModule.topTier == 'Week');
        });
    });
    describe('Custom Zooming levels ', () => {
        let customZoomingLevels: ZoomTimelineSettings[] = [
            {
              topTier: { unit: 'Month', format: 'MMM, yy', count: 1 },
              bottomTier: { unit: 'Week', format: 'dd', count: 1 },
              timelineUnitSize: 33,
              level: 0,
              timelineViewMode: 'Month',
              weekStartDay: 0,
              updateTimescaleView: true,
              weekendBackground: null,
              showTooltip: true,
            },
            {
              topTier: { unit: 'Month', format: 'MMM, yyyy', count: 1 },
              bottomTier: { unit: 'Week', format: 'dd MMM', count: 1 },
              timelineUnitSize: 66,
              level: 1,
              timelineViewMode: 'Month',
              weekStartDay: 0,
              updateTimescaleView: true,
              weekendBackground: null,
              showTooltip: true,
            },
            {
              topTier: { unit: 'Month', format: 'MMM, yyyy', count: 1 },
              bottomTier: { unit: 'Week', format: 'dd MMM', count: 1 },
              timelineUnitSize: 99,
              level: 2,
              timelineViewMode: 'Month',
              weekStartDay: 0,
              updateTimescaleView: true,
              weekendBackground: null,
              showTooltip: true,
            },
            {
              topTier: { unit: 'Week', format: 'MMM dd, yyyy', count: 1 },
              bottomTier: { unit: 'None' },
              timelineUnitSize: 33,
              level: 3,
              timelineViewMode: 'Week',
              weekStartDay: 0,
              updateTimescaleView: true,
              weekendBackground: null,
              showTooltip: true,
            },
            {
              topTier: { unit: 'Week', format: 'MMM dd, yyyy', count: 1 },
              bottomTier: { unit: 'None' },
              timelineUnitSize: 66,
              level: 4,
              timelineViewMode: 'Week',
              weekStartDay: 0,
              updateTimescaleView: true,
              weekendBackground: null,
              showTooltip: true,
            },
            {
              topTier: { unit: 'Week', format: 'MMM dd, yyyy', count: 1 },
              bottomTier: { unit: 'None' },
              timelineUnitSize: 99,
              level: 5,
              timelineViewMode: 'Week',
              weekStartDay: 0,
              updateTimescaleView: true,
              weekendBackground: null,
              showTooltip: true,
            },
          ];
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt({
                dataSource: projectData,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency:'Predecessor',
                    baselineStartDate: "BaselineStartDate",
                    baselineEndDate: "BaselineEndDate",
                    child: 'subtasks',
                    indicators: 'Indicators'
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                toolbar: [ 'ZoomIn', 'ZoomOut', 'ZoomToFit'],
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
                height: '550px',
                projectStartDate: new Date('03/24/2019'),
                projectEndDate: new Date('04/28/2019'),
            }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Zoom out', () => {
            ganttObj.zoomingLevels = customZoomingLevels;
            let zoomIn: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomin') as HTMLElement;
            triggerMouseEvent(zoomIn, 'click');
            triggerMouseEvent(zoomIn, 'click');
            triggerMouseEvent(zoomIn, 'click');
            triggerMouseEvent(zoomIn, 'click');
            triggerMouseEvent(zoomIn, 'click');
            expect(document.getElementsByClassName('e-toolbar-item e-overlay')[0].firstElementChild['ariaDisabled']).toBe("true");
        });
    });
    describe('Perform outdent in immutable mode', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt({
                dataSource: projectData,
                allowSorting: true,
                allowReordering: true,
                enableContextMenu: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency:'Predecessor',
                    baselineStartDate: "BaselineStartDate",
                    baselineEndDate: "BaselineEndDate",
                    child: 'subtasks',
                    indicators: 'Indicators'
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                columns: [
                    { field: 'TaskID', headerText: 'Task ID' },
                    { field: 'TaskName', headerText: 'Task Name', allowReordering: true  },
                    { field: 'StartDate', headerText: 'Start Date', allowSorting: false },
                    { field: 'Duration', headerText: 'Duration', allowEditing: false },
                    { field: 'Progress', headerText: 'Progress', allowFiltering: false }, 
                    { field: 'CustomColumn', headerText: 'CustomColumn' }
                ],
                enableImmutableMode: true,
                toolbar: ['Indent','Outdent'],
                height: '550px',
                allowUnscheduledTasks: true,
                actionComplete: (args?: any) => {
                    if(args.requestType == "refresh") {
                        expect(ganttObj.currentViewData[17].level).toBe(3);
                    }
                },
              //  connectorLineBackground: "red",
              //  connectorLineWidth: 3,
                projectStartDate: new Date('03/25/2019'),
                projectEndDate: new Date('05/30/2019'),
            }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Outdent performed', () => {
            ganttObj.selectRow(15);
            let outdent: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_outdent') as HTMLElement;
            triggerMouseEvent(outdent, 'click');
        });
    });
    describe('Zoom To Fit - ', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt({
                dataSource: [
                    {TaskId: 1, TaskName: 'Task 1', StartDate: new Date('04/02/2019'),EndDate: new Date('04/21/2019'), Duration: '5', TaskType: ''},
                    {TaskId: 2, TaskName: 'Task 2', Duration: '5', TaskType: 'Task with duration only'},
                ],
                enableContextMenu: true,
                taskFields: {
                    id: 'TaskId',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                toolbar: ['ZoomIn', 'ZoomOut', 'ZoomToFit'],
                allowSelection: true,
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
                splitterSettings:{
                    columnIndex: 3
                },
                height: '550px',
                allowUnscheduledTasks: true,
                projectStartDate: new Date('03/29/2019'),
                projectEndDate: new Date('05/30/2019')
            }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Unscheduled Task', () => {
            let zoomToFit: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomtofit') as HTMLElement;
            triggerMouseEvent(zoomToFit, 'click');
            let date1 = ganttObj.getFormatedDate(ganttObj.timelineModule.timelineStartDate, 'M/d/yyyy');
            triggerMouseEvent(zoomToFit, 'click');
            let date2 = ganttObj.getFormatedDate(ganttObj.timelineModule.timelineStartDate, 'M/d/yyyy');
            expect(date1).toBe(date2);
        });
    });
     // describe('Disable indent outdent', () => {
        // let ganttObj: Gantt;
        // beforeAll((done: Function) => {
            // ganttObj = createGantt({
                // dataSource: [
                    // {TaskId: 1, TaskName: 'Task 1', StartDate: new Date('04/02/2019'),EndDate: new Date('04/21/2019'), Duration: '5', TaskType: ''},
                    // {TaskId: 2, TaskName: 'Task 2', Duration: '5', TaskType: 'Task with duration only'},
                // ],
                // enableContextMenu: true,
                // taskFields: {
                    // id: 'TaskId',
                    // name: 'TaskName',
                    // startDate: 'StartDate',
                    // endDate: 'EndDate',
                    // duration: 'Duration',
                // },
                // toolbar: ['Indent','Outdent'],
                // allowSelection: true,
                // timelineSettings: {
                    // showTooltip: true,
                    // topTier: {
                        // unit: 'Week',
                        // format: 'dd/MM/yyyy'
                    // },
                    // bottomTier: {
                        // unit: 'Day',
                        // count: 1
                    // }
                // },
                // splitterSettings:{
                    // columnIndex: 3
                // },
                // height: '550px',
                // allowUnscheduledTasks: true,
                // projectStartDate: new Date('03/29/2019'),
                // projectEndDate: new Date('05/30/2019')
            // }, done);
        // });
        // afterAll(() => {
            // if (ganttObj) {
                // destroyGantt(ganttObj);
            // }
        // });
        // beforeEach((done: Function) => {
            // setTimeout(done, 500);
        // });
        // it('editsettings not mapped', () => {
            // ganttObj.selectRow(1);
            // let toolbarItems: number = document.getElementsByClassName('e-toolbar-item e-hidden').length;
            // //expect(toolbarItems).toBe(2);
        // });
    // });
    describe('Add new record ', () => {
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt({
                dataSource: [],
                taskFields: {
                    id: 'taskID',
                    name: 'taskName',
                    startDate: 'startDate',
                    endDate: 'endDate',
                    duration: 'duration',
                    progress: 'progress',
                    dependency: 'predecessor',
                    baselineStartDate: 'baselineStartDate',
                    baselineEndDate: 'baselineEndDate',
                },
                toolbar: ['Add', 'Edit', 'Delete'],
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true,
                  },
                renderBaseline: true,
                timezone: 'UTC',
                height: '450px',
            }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Add record in UTC', () => {
            let add: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_add') as HTMLElement;
            triggerMouseEvent(add, 'click');
            let StartDateInput: any = (document.getElementById(ganttObj.element.id + 'startDate') as any).ej2_instances[0];
            StartDateInput.value = new Date('6/28/2022');
            let EndDateInput: any = (document.getElementById(ganttObj.element.id + 'endDate') as any).ej2_instances[0];
            EndDateInput.value = new Date('6/28/2022');
            let duration: any = (document.getElementById(ganttObj.element.id + 'duration') as any).ej2_instances[0];
            duration.value = '0 day';
            let BaselineStartDateInput: any = (document.getElementById(ganttObj.element.id + 'baselineStartDate') as any).ej2_instances[0];
            BaselineStartDateInput.value = new Date('6/28/2022');
            let BaselineEndDateInput: any = (document.getElementById(ganttObj.element.id + 'baselineEndDate') as any).ej2_instances[0];
            BaselineEndDateInput.value = new Date('6/28/2022');
            let save: HTMLElement = document.querySelector('#' + ganttObj.element.id + '_dialog').getElementsByClassName('e-primary')[0] as HTMLElement;
            triggerMouseEvent(save, 'click');
            expect(ganttObj.getFormatedDate(ganttObj.flatData[0].ganttProperties.startDate, 'MM/dd/yyyy HH:mm')).toBe('06/28/2022 08:00');
        });
    });
    describe('Gantt toolbar action', () => {
        Gantt.Inject(Edit, Toolbar, Selection, Filter);
        let ganttObj: Gantt;
        beforeAll((done: Function) => {
            ganttObj = createGantt(
                {
                    dataSource: projectData1,
                    allowSelection: true,
                    allowFiltering: true,
                    taskFields: {
                        id: 'TaskID',
                        name: 'TaskName',
                        startDate: 'StartDate',
                        endDate: 'EndDate',
                        duration: 'Duration',
                        progress: 'Progress',
                        child: 'subtasks',
                        dependency: 'Predecessor',
                        segments: 'Segments'
                    },
                    editSettings: {
                        allowAdding: true,
                        allowEditing: true,
                        allowDeleting: true,
                        allowTaskbarEditing: true,
                        showDeleteConfirmDialog: true
                    },
                    toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                        'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                    projectStartDate: new Date('02/01/2017'),
                    projectEndDate: new Date('12/30/2017'),
                    rowHeight: 40,
                    taskbarHeight: 30
                }, done);
        });
        afterAll(() => {
            if (ganttObj) {
                destroyGantt(ganttObj);
            }
        });
        it('Select search value and delete', () => {
            ganttObj.selectionModule.selectRow(2);
            ganttObj.isAdaptive = true;
            ganttObj.dataBind();
            ganttObj.searchSettings.key = '';
            let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
            searchbar.value = 'check';
            searchbar.focus();
            searchbar.select();
            let args: any = { action: 'delete',target:searchbar};
            ganttObj.keyboardModule.keyAction(args);
            expect (ganttObj.currentViewData.length).toBe(41)
        });
    });
});
describe('Custom Zooming levels zoomout ', () => {
    let customZoomingLevels: ZoomTimelineSettings[] = [
        {
          topTier: { unit: 'Year', format: 'yyyy', count: 1 },
          bottomTier: {
            unit: 'Month',
            // @ts-ignore
            formatter: (date: Date) => {
              //debugger;
              const month = date.getMonth();
              if (month >= 0 && month <= 5) {
                return 'H1';
              } else {
                return 'H2';
              }
            },
            count: 6,
          },
          timelineUnitSize: 33,
          level: 0,
          timelineViewMode: 'Year',
          weekStartDay: 0,
          updateTimescaleView: true,
          weekendBackground: undefined,
          showTooltip: true,
        },
        {
          topTier: {
            unit: 'Month',
            count: 3,
            // @ts-ignore
            formatter: (date: Date) => {
              const month = date.getMonth();
              if (month >= 0 && month <= 2) {
                return 'Q1';
              } else if (month >= 3 && month <= 5) {
                return 'Q2';
              } else if (month >= 6 && month <= 8) {
                return 'Q3';
              } else {
                return 'Q4';
              }
            },
          },
          bottomTier: {
            unit: 'Month',
            format: 'MMM',
          },
          timelineUnitSize: 33,
          level: 1,
          timelineViewMode: 'Year',
          weekStartDay: 0,
          updateTimescaleView: true,
          weekendBackground: undefined,
          showTooltip: true,
        },
      ];;
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt({
            dataSource: projectData,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                dependency:'Predecessor',
                baselineStartDate: "BaselineStartDate",
                baselineEndDate: "BaselineEndDate",
                child: 'subtasks',
                indicators: 'Indicators'
            },
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                showDeleteConfirmDialog: true
            },
            dataBound:()=>{
                if (ganttObj!.zoomingLevels.length > 24) {
                    ganttObj!.zoomingLevels = customZoomingLevels;
                    ganttObj!.fitToProject();
                    console.log('@sp: use customZoomingLevels and call fitToProject()');
                  }
               },
            toolbar: [ 'ZoomIn', 'ZoomOut', 'ZoomToFit'],
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
            height: '550px',
            projectStartDate: new Date('03/24/2019'),
            projectEndDate: new Date('04/28/2019'),
        }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
    it('Zoom in to zoom out ', () => {
        let zoomIn: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomin') as HTMLElement;
        triggerMouseEvent(zoomIn, 'click');
        expect((ganttObj.element.querySelector('#' + ganttObj.element.id + '_zoomin') as HTMLElement).attributes[5].value).toBe("false");
    });
});

// Invalid case due to cyclic dependency 

// describe('Indent and outdent issue ', () => {
//     let ganttObj: Gantt;
//     beforeAll((done: Function) => {
//         ganttObj = createGantt({
//             dataSource: [
//                 {
//                     TaskID: 1,
//                     TaskName: 'Project initiation',
//                     StartDate: new Date('04/02/2019'),
//                     EndDate: new Date('04/21/2019'),
//                     subtasks: [
//                         {
//                             TaskID: 2, TaskName: 'Identify site location', StartDate: new Date('04/02/2019'), Duration: 0,
//                             Progress: 30, resources: [1], info: 'Measure the total property area alloted for construction'
//                         },
//                         {
//                             TaskID: 3, TaskName: 'Perform soil test', StartDate: new Date('04/02/2019'), Duration: 4, Predecessor: '2',
//                             resources: [2, 3, 5], info: 'Obtain an engineered soil test of lot where construction is planned.' +
//                                 'From an engineer or company specializing in soil testing'
//                         },
//                         { TaskID: 4, TaskName: 'Soil test approval', StartDate: new Date('04/02/2019'), Duration: 0, Predecessor: '3', Progress: 30 },
//                     ]
//                 },
//             ],
//             dateFormat: 'MMM dd, y',
//             taskFields: {
//                 id: 'TaskID',
//                 name: 'TaskName',
//                 startDate: 'StartDate',
//                 endDate: 'EndDate',
//                 duration: 'Duration',
//                 progress: 'Progress',
//                 dependency: 'Predecessor',
//                 child: 'subtasks',
//                 notes: 'info',
//                 resourceInfo: 'resources'
//             },
//             editSettings: {
//                 allowAdding: true,
//                 allowEditing: true,
//                 allowDeleting: true,
//                 allowTaskbarEditing: true,
//                 showDeleteConfirmDialog: true
//             },
//             toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Indent', 'Outdent'],
//             allowSelection: true,
//             gridLines: 'Both',
//             height: '450px',
//             treeColumnIndex: 1,
//             resourceFields: {
//                 id: 'resourceId',
//                 name: 'resourceName'
//             },
//             resources: [
//                 { resourceId: 1, resourceName: 'Martin Tamer' },
//                 { resourceId: 2, resourceName: 'Rose Fuller' },
//                 { resourceId: 3, resourceName: 'Margaret Buchanan' },
//                 { resourceId: 4, resourceName: 'Fuller King' },
//                 { resourceId: 5, resourceName: 'Davolio Fuller' },
//                 { resourceId: 6, resourceName: 'Van Jack' },
//                 { resourceId: 7, resourceName: 'Fuller Buchanan' },
//                 { resourceId: 8, resourceName: 'Jack Davolio' },
//                 { resourceId: 9, resourceName: 'Tamer Vinet' },
//                 { resourceId: 10, resourceName: 'Vinet Fuller' },
//                 { resourceId: 11, resourceName: 'Bergs Anton' },
//                 { resourceId: 12, resourceName: 'Construction Supervisor' }
//             ],
//             highlightWeekends: true,
//             timelineSettings: {
//                 topTier: {
//                     unit: 'Week',
//                     format: 'MMM dd, y',
//                 },
//                 bottomTier: {
//                     unit: 'Day',
//                 },
//             },
//             columns: [
//                 { field: 'TaskID', width: 80 },
//                 { field: 'TaskName', headerText: 'Job Name', width: '250', clipMode: 'EllipsisWithTooltip' },
//                 { field: 'StartDate' },
//                 { field: 'Duration' },
//                 { field: 'Progress' },
//                 { field: 'Predecessor' }
//             ],
//             eventMarkers: [
//                 { day: '4/17/2019', label: 'Project approval and kick-off' },
//                 { day: '5/3/2019', label: 'Foundation inspection' },
//                 { day: '6/7/2019', label: 'Site manager inspection' },
//                 { day: '7/16/2019', label: 'Property handover and sign-off' },
//             ],
//             labelSettings: {
//                 leftLabel: 'TaskName',
//                 rightLabel: 'resources'
//             },
//             splitterSettings : {
//                 position: "35%"
//             },
//             editDialogFields: [
//                 { type: 'General', headerText: 'General'},
//                 { type: 'Dependency' },
//                 { type: 'Resources' },
//                 { type: 'Notes' },
//             ],
//             projectStartDate: new Date('03/25/2019'),
//             projectEndDate: new Date('07/28/2019'),
//         }, done);
//     });
//     beforeEach((done: Function) => {
//         setTimeout(done, 500);
//     });
//     it('Outdent ', () => {
//         ganttObj.selectRow(2);
//         let outdent: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_outdent') as HTMLElement;
//         triggerMouseEvent(outdent, 'click');
//     });
//     it('Indent ', () => {
//         ganttObj.selectRow(2);
//         let indent: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_indent') as HTMLElement;
//         triggerMouseEvent(indent, 'click');
//     });
//     it('Editing Task Name', () => {
//         ganttObj.selectRow(2);
//         ganttObj.dataBind();
//         let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(3) > td:nth-child(2)') as HTMLElement;
//         triggerMouseEvent(taskName, 'dblclick');
//         let input: any = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrolTaskName') as HTMLElement;
//         input.value = 'TaskName updated';
//         let element: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(4) > td:nth-child(2)') as HTMLElement;
//         triggerMouseEvent(element, 'click');
//         expect((ganttObj.currentViewData[2] as any).StartDate.toDateString()).toBe("Thu Apr 11 2019");
//     });
//     afterAll(() => {
//         if (ganttObj) {
//             destroyGantt(ganttObj);
//         }
//     });
// });

describe('Gantt toolbar action with adaptive', () => {
    Gantt.Inject(Edit, Toolbar, Selection, Filter,CriticalPath);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectData1,
                allowSelection: true,
                allowFiltering: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks',
                    dependency: 'Predecessor',
                    segments: 'Segments'
                },
                loadingIndicator: { indicatorType: 'Shimmer' },
                enableCriticalPath:true,
                selectionSettings: {
                    mode: 'Row',
                    type: 'Multiple',
                    enableToggle: false
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                load: function() {
                    this.isAdaptive = true;
                },
                toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                    'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                projectStartDate: new Date('02/01/2017'),
                projectEndDate: new Date('12/30/2017'),
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
    it('Search Icon handler function with adaptive', () => {
        let searchbar: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbar'));
        searchbar.value = '';
        let searchIcon: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_searchbutton') as HTMLElement;
        triggerMouseEvent(searchIcon, 'click');
        expect(ganttObj.currentViewData.length).toBe(41);
        ganttObj.clearFiltering();
        ganttObj.toolbarModule['addReactToolbarPortals'];
        ganttObj.toolbarModule['getSearchBarElement'];
        ganttObj.toolbarModule.refreshToolbarItems();
        ganttObj.toolbarModule.destroy();
    });
});
describe('Gantt toolbar action with adaptive', () => {
    Gantt.Inject(Edit, Toolbar, Selection, Filter);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectData1,
                allowSelection: true,
                allowFiltering: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks',
                    dependency: 'Predecessor',
                    segments: 'Segments'
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                load: function() {
                    this.isAdaptive = true;
                    this.isReact = true;
                },
                readOnly:true,
                toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                projectStartDate: new Date('02/01/2017'),
                projectEndDate: new Date('12/30/2017'),
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
    it('Check all toolbar rendered properly', () => {
        let toolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar') as HTMLElement;
        expect(toolbar.getElementsByClassName('e-toolbar-item').length).toBe(15);
    });
});
describe('Gantt toolbar action', () => {
    Gantt.Inject(Edit, Toolbar, Selection, Filter,CriticalPath);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectData1,
                allowSelection: true,
                allowFiltering: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks',
                    dependency: 'Predecessor',
                    segments: 'Segments'
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                loadingIndicator: { indicatorType: 'Shimmer' },
                toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                    'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                projectStartDate: new Date('02/01/2017'),
                projectEndDate: new Date('12/30/2017'),
                toolbarClick: (args: ClickEventArgs) => {
                    if (args.item.text === 'update') {
                        let projectData: any = []
                        ganttObj.dataSource = projectData; 
                    }
                },
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });

    it('Add handler function', () => {
        let add: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_add') as HTMLElement;
        triggerMouseEvent(add, 'click');
        let startDate: HTMLInputElement = (<HTMLInputElement>document.querySelector('#' + ganttObj.element.id + 'StartDate'));
        if (startDate) {
            let StartDateInput: any = (document.getElementById(ganttObj.element.id + 'StartDate') as any).ej2_instances[0];
            StartDateInput.value = new Date('02/06/2017');
        }
        let save: HTMLElement = document.querySelector('#' + ganttObj.element.id + '_dialog').getElementsByClassName('e-primary')[0] as HTMLElement;
        triggerMouseEvent(save, 'click');
        expect(ganttObj.flatData.length).toBe(42);
        ganttObj.toolbarModule['toolbarClickHandler'];
    });
});
describe('Gantt toolbar action', () => {
    Gantt.Inject(Edit, Toolbar, Selection, Filter);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectData1,
                allowSelection: true,
                allowFiltering: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks',
                    dependency: 'Predecessor',
                    segments: 'Segments'
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                    'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                projectStartDate: new Date('02/01/2017'),
                projectEndDate: new Date('12/30/2017'),
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
    it('Cancel handler function', () => {
        let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(4) > td:nth-child(2)') as HTMLElement;
        triggerMouseEvent(taskName, 'dblclick');
        let taskValue: HTMLInputElement = (<HTMLInputElement>ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrolTaskName'));
        if (taskValue) {
            taskValue.value = 'Cancel TaskName';
            let cancelToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_cancel') as HTMLElement;
            triggerMouseEvent(cancelToolbar, 'mousedown');
            expect(getValue('TaskName', ganttObj.flatData[3])).toBe('Plan budget');
            ganttObj.selectionModule.clearSelection();
        }
    });
    it('Cancel toolbar', (done: Function) => {
            let taskName: HTMLElement = ganttObj.element.querySelector('#treeGrid' + ganttObj.element.id + '_gridcontrol_content_table > tbody > tr:nth-child(3) > td:nth-child(2)') as HTMLElement;
            triggerMouseEvent(taskName, 'dblclick');
            let cancelToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_cancel') as HTMLElement;
            triggerMouseEvent(cancelToolbar, 'click');
            ganttObj.dataBound = () => {
                done();
            }
            ganttObj.refresh();
        });
});
describe('Gantt toolbar action with adaptive', () => {
    Gantt.Inject(Edit, Toolbar, Selection, Filter);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectData1,
                allowSelection: true,
                allowFiltering: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks',
                    dependency: 'Predecessor',
                    segments: 'Segments'
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                load: function() {
                    this.isAdaptive = true;
                    this.isReact = true;
                },
                readOnly:true,
                toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                'PrevTimeSpan', 'NextTimeSpan', 'Custom', { text: 'Quick Filter', tooltipText: 'Quick Filter', id: 'toolbarfilter' },],
                projectStartDate: new Date('02/01/2017'),
                projectEndDate: new Date('12/30/2017'),
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
    it('Check all toolbar rendered properly', () => {
        let toolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_Gantt_Toolbar') as HTMLElement;
        expect(toolbar.getElementsByClassName('e-toolbar-item').length).toBe(15);
    });
});
describe('Gantt with crtical path', () => {
    Gantt.Inject(Edit, Toolbar, Selection, Filter,CriticalPath);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectData1,
                allowSelection: true,
                allowFiltering: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks',
                    dependency: 'Predecessor',
                    segments: 'Segments'
                },
                loadingIndicator: { indicatorType: 'Shimmer' },
                enableCriticalPath:false,
                selectionSettings: {
                    mode: 'Row',
                    type: 'Multiple',
                    enableToggle: false
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                load: function() {
                    this.isAdaptive = true;
                },
                toolbar: ['ZoomIn','ZoomOut','ZoomToFit','Add', 'Edit', 'Update', 'Delete', 'Cancel', 'CriticalPath'],
                projectStartDate: new Date('02/01/2017'),
                projectEndDate: new Date('12/30/2017'),
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
    it('gantt with critical path', () => {
        let toolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_critical-path') as HTMLElement;
        triggerMouseEvent(toolbar, 'click');
    });
});
describe('CR:890397-When adding a record via dialog, if the startDate is set to a Friday, the endDate and duration become empty', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectNewData1,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    duration: 'Duration',
                    endDate: 'EndDate',
                    progress: 'Progress',
                    dependency: 'Predecessor',
                    child: 'subtasks'
                },
                editSettings: {
                    allowAdding: true
                },
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                    'PrevTimeSpan'],
                height: '550px',
                dayWorkingTime : [{ from: 0, to: 24 }],
                projectStartDate: new Date('03/25/2019'),
                projectEndDate: new Date('05/30/2019')
            }, done);
    });
    it('Adding startDate near to weekend through dialog field', () => {
        let add: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_add') as HTMLElement;
        triggerMouseEvent(add, 'click');
        let startDate: HTMLInputElement = (<HTMLInputElement>document.querySelector('#' + ganttObj.element.id + 'StartDate'));
        if (startDate) {
            let StartDateInput: any = (document.getElementById(ganttObj.element.id + 'StartDate') as any).ej2_instances[0];
            StartDateInput.value = new Date('04/05/2019');
        }
        let save: HTMLElement = document.querySelector('#' + ganttObj.element.id + '_dialog').getElementsByClassName('e-primary')[0] as HTMLElement;
        triggerMouseEvent(save, 'click');
        expect(ganttObj.getFormatedDate(ganttObj.currentViewData[0].ganttProperties.startDate, 'MM/dd/yyyy')).toBe('04/05/2019');
        expect(ganttObj.getFormatedDate(ganttObj.currentViewData[0].ganttProperties.endDate, 'MM/dd/yyyy')).toBe('04/06/2019');
        expect(ganttObj.currentViewData[0].ganttProperties.duration).toBe(1);
    });
    it('enable toolbar items', () => {
        ganttObj.enableItems(['PrevTimeSpan'],true);
        ganttObj.selectRows([2]);
        ganttObj.selectCells([{ cellIndexes: [1,2], rowIndex: 2 }]);
        ganttObj['updateRowHeightInConnectorLine'](ganttObj.updatedConnectorLineCollection);
        ganttObj.getCriticalTasks();
        expect(ganttObj.isUnscheduledTask(ganttObj.currentViewData[1].ganttProperties)).toBe(false);
        expect(ganttObj.treeGridModule['objectEqualityChecker'](ganttObj.flatData[0], ganttObj.flatData[0])).toBe(true);
    });
    afterAll(() => {
        destroyGantt(ganttObj);
    });
});
describe('B900782-Taskbar render in incorrect postion after zoom to fit', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectNewData1,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    duration: 'Duration',
                    endDate: 'EndDate',
                    progress: 'Progress',
                    dependency: 'Predecessor',
                    child: 'subtasks'
                },
                editSettings: {
                    allowAdding: true
                },
                   toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                    'PrevTimeSpan', 'NextTimeSpan','ZoomToFit'],
                height: '550px',
                dayWorkingTime : [{ from: 0, to: 24 }],
                projectStartDate: new Date('03/25/2019'),
                projectEndDate: new Date('05/30/2019')
            }, done);
    });
    it('Performing zoom to fit action', (done:Function) => {
        ganttObj.actionComplete = function (args: any): void {
            if (args.requestType === "AfterZoomToProject") {
                expect(ganttObj.flatData[0].ganttProperties.startDate.getHours()).toBe(0)
                done();
            }
        };
        ganttObj.fitToProject()
    });
    afterAll(() => {
        destroyGantt(ganttObj);
    });
});
describe('Issue fix for show case sample', () => {        
    let ganttObj: Gantt;
    let resource1 = [
        {
            TaskID: 5,
            TaskName: 'Project estimation', StartDate: new Date('03/29/2024'), EndDate: new Date('04/21/2024'),
            subtasks: [
                {
                    TaskID: 6, TaskName: 'Develop floor plan for estimation', StartDate: new Date('03/29/2024'),
                    Duration: 3, Progress: 30, resources: [{ resourceId: 2, resourceUnit: 70 },4], Predecessor: '3FS+2', work: 30
                },
                {
                    TaskID: 7, TaskName: 'List materials', StartDate: new Date('04/08/2024'), Duration: 12,
                    resources: [{ resourceId: 6, resourceUnit: 40 }], Progress: 30, work: 40
                },
                {
                    TaskID: 8, TaskName: 'Estimation approval', StartDate: new Date('04/03/2024'),
                    Duration: 10, resources: [{ resourceId: 5, resourceUnit: 75 }], Progress: 30, work: 60,
                },
                {
                    TaskID: 9, TaskName: 'Excavate for foundations', StartDate: new Date('04/01/2024'),
                    Duration: 4, Progress: 30, resources: [{ resourceId: 4, resourceUnit: 100 }], work: 32
                },
                {
                    TaskID: 10, TaskName: 'Install plumbing grounds', StartDate: new Date('04/08/2024'), Duration: 4,
                    Progress: 30, Predecessor: '9SS', resources: [{ resourceId: 3, resourceUnit: 100 }], work: 32
                },
                {
                    TaskID: 11, TaskName: 'Dig footer', StartDate: new Date('04/08/2024'),
                    Duration: 3, resources: [{ resourceId: 2, resourceUnit: 100 }], work: 24
                },
                {
                    TaskID: 12, TaskName: 'Electrical utilities', StartDate: new Date('04/03/2024'),
                    Duration: 4, Progress: 30, resources: [{ resourceId: 3, resourceUnit: 100 }], work: 32
                }
            ]
        },
        {
            TaskID: 13, TaskName: 'Sign contract', StartDate: new Date('04/04/2024'), Duration: 2,
            Progress: 30,
        }
    ];
    let resourceCollection1 = [   
        { resourceId: 4, resourceName: 'Fuller King', resourceGroup: 'Development Team' },
        { resourceId: 5, resourceName: 'Davolio Fuller', resourceGroup: 'Approval Team' },
        { resourceId: 6, resourceName: 'Van Jack', resourceGroup: 'Development Team' }
    ];
    beforeAll((done: Function) => {
        ganttObj = createGantt({
            dataSource: resource1,
        resources: resourceCollection1,
        viewType: 'ResourceView',
        showOverAllocation: true,
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
        taskType: 'FixedWork',
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
        },
        columns: [
            { field: 'TaskID', visible: false },
            { field: 'TaskName', headerText: 'Name', width: 250 },
            { field: 'work', headerText: 'Work' },
            { field: 'Progress' },
            { field: 'resourceGroup', headerText: 'Group' },
            { field: 'StartDate' },
            { field: 'Duration' },
        ],
        toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll',
            { text: 'Show/Hide Overallocation', tooltipText: 'Show/Hide Overallocation', id: 'showhidebar' }],
        labelSettings: {
            rightLabel: 'resources',
            taskLabel: 'Progress'
        },
        splitterSettings: {
            columnIndex: 3
        },
        selectedRowIndex:1,
        allowResizing: true,
        allowSelection: true,
        highlightWeekends: true,
        treeColumnIndex: 1,
        height: '450px',
        projectStartDate: new Date('03/28/2024'),
        projectEndDate: new Date('05/18/2024')
        }, done);
    });
    it('Delete Resource and check for select index', () => {
        ganttObj.deleteRecord(ganttObj.selectionModule.getSelectedRecords()[0])
        expect(ganttObj.selectedRowIndex).toBe(1);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('Gantt with set toolbar visible false ', () => {
    Gantt.Inject(Edit, Toolbar, Selection, Filter);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: projectData1,
                allowSelection: true,
                allowFiltering: true,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    endDate: 'EndDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    child: 'subtasks',
                    dependency: 'Predecessor',
                    segments: 'Segments'
                },
                selectionSettings: {
                    mode: 'Row',
                    type: 'Multiple',
                    enableToggle: false
                },
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                toolbar:[  'Add',
                    {
                      text: 'Quick Filter',
                      tooltipText: '',
                      id: 'x',
                      visible: false,
                    },
                    {
                      text: 'Quick Filter3',
                      tooltipText: '',
                      id: 'y',
                      visible: false,
                    }, 
                ],
                projectStartDate: new Date('02/01/2017'),
                projectEndDate: new Date('12/30/2017'),
                rowHeight: 40,
                taskbarHeight: 30
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
    it('check  toolbar set visible false  ', () => {
        const elementVisible : boolean = ganttObj.toolbarModule.toolbar['tbarEle'][2].classList.contains("e-hidden");
        expect(elementVisible).toBe(true);
    });
});
describe('MT:887301-Issue in Multi taskbar in project view samples', () => {
    Gantt.Inject(Edit, Toolbar, Selection, Filter);
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt(
            {
                dataSource: MT887301,
                taskFields: {
                    id: 'TaskID',
                    name: 'TaskName',
                    startDate: 'StartDate',
                    duration: 'Duration',
                    progress: 'Progress',
                    dependency:'Predecessor',
                    child: 'subtasks'
                },
                enableMultiTaskbar: true,
                allowTaskbarOverlap: false,
                showOverAllocation: true,
                editSettings: {
                    allowAdding:true,
                    allowEditing: true,
                    allowDeleting: true,
                    allowTaskbarEditing: true,
                    showDeleteConfirmDialog: true
                },
                toolbar:['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
                'PrevTimeSpan', 'NextTimeSpan','ZoomIn', 'ZoomOut', 'ZoomToFit'],
                allowSelection: true,
                gridLines: "Both",
                highlightWeekends: true,
                timelineSettings: {
                    topTier: {
                        unit: 'Week',
                        format: 'dd/MM/yyyy'
                    },
                    bottomTier: {
                        unit: 'Day',
                        count: 1
                    }
                },
                labelSettings: {
                    leftLabel: 'TaskName',
                    taskLabel: 'Progress'
                },
                height: '550px',
                allowUnscheduledTasks: true,
                projectStartDate: new Date('03/25/2019'),
                projectEndDate: new Date('05/30/2019')
            }, done);
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
    it('Checking rangerContainer line while perform toolbar CollapseAll in multitaskbar mode', () => {
        let collapseallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_collapseall') as HTMLElement;
        triggerMouseEvent(collapseallToolbar, 'click');
        let rangeContainer: any = ganttObj.element.querySelectorAll('.e-rangecontainer')[0].childNodes[0].childNodes;
        if (rangeContainer) {
            expect(rangeContainer.length).toBe(2);
            expect(rangeContainer[0].classList.contains('e-leftarc')).toBe(true);
            expect(rangeContainer[1].classList.contains('e-rightarc')).toBe(true);
        }
    });
});
describe('MT:887301-Issue in Multi taskbar in project view sample-hierarchy data', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt ({
            dataSource: hierarchyData,
            allowReordering: true,
            allowTaskbarOverlap: false,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                dependency:'Predecessor',
                child: 'subtasks'
            },
            enableMultiTaskbar: true,
            showOverAllocation: true,
            editSettings: {
                allowAdding:true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                showDeleteConfirmDialog: true
            },
            toolbar:['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search',
            'PrevTimeSpan', 'NextTimeSpan','ZoomIn', 'ZoomOut', 'ZoomToFit'],
            allowSelection: true,
            gridLines: "Both",
            highlightWeekends: true,
            timelineSettings: {
                topTier: {
                    unit: 'Week',
                    format: 'dd/MM/yyyy'
                },
                bottomTier: {
                    unit: 'Day',
                    count: 1
                }
            },
            labelSettings: {
                leftLabel: 'TaskName',
                taskLabel: 'Progress'
            },
            height: '550px',
            allowUnscheduledTasks: true,
            projectStartDate: new Date('03/25/2019'),
            projectEndDate: new Date('05/30/2019')
        }, done);
    });
    it('Checking rangerContainer height with Hierarchy collapseAll action', () => {
        let collapseallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_collapseall') as HTMLElement;
        triggerMouseEvent(collapseallToolbar, 'click');
        const rangeContainer: any = ganttObj.element.querySelectorAll('.e-rangecontainer')[0].childNodes[0].childNodes;
        if (rangeContainer) {
            expect(rangeContainer[0].style.height).toBe('59px');
            expect(rangeContainer[1].style.height).toBe('59px');
        }
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('MT:887301-Issue in Multi taskbar in project view samples- Self reference data', () => {
    let ganttObj: Gantt;
    beforeAll((done: Function) => {
        ganttObj = createGantt ({
            dataSource: SelfRefData,
            allowTaskbarOverlap: false,
            highlightWeekends: true,
            allowSelection: true,
            treeColumnIndex: 1,
            enableMultiTaskbar: true,
            showOverAllocation: true,
            taskFields: {
                id: 'taskID',
                name: 'taskName',
                startDate: 'startDate',
                endDate: 'endDate',
                duration: 'duration',
                progress: 'progress',
                dependency: 'predecessor',
                parentID: 'parentID'
            },
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                showDeleteConfirmDialog: true
            },
            columns: [
                { field: 'taskID', width: 60 },
                { field: 'taskName', width: 250 },
                { field: 'startDate' },
                { field: 'endDate' },
                { field: 'duration' },
                { field: 'predecessor' },
                { field: 'progress' },
            ],
            sortSettings: {
                columns: [{ field: 'taskID', direction: 'Ascending' }, 
                { field: 'taskName', direction: 'Ascending' }]
            },
            toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 
            'PrevTimeSpan', 'NextTimeSpan','ExcelExport', 'CsvExport', 'PdfExport',],
            gridLines: "Both",
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
            taskbarHeight: 20,
            rowHeight: 40,
            allowUnscheduledTasks: true,
            projectStartDate: new Date('01/28/2019'),
            projectEndDate: new Date('03/10/2019')
        }, done);
    });
    it('Checking rangerContainer height with Self-reference collapseAll action', () => {
        let collapseallToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_collapseall') as HTMLElement;
        triggerMouseEvent(collapseallToolbar, 'click');
        const rangeContainer: any = ganttObj.element.querySelectorAll('.e-rangecontainer')[0].childNodes[0].childNodes;
        if (rangeContainer) {
            expect(rangeContainer[0].style.height).toBe('21px');
            expect(rangeContainer[1].style.height).toBe('21px');
        }
    });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('previous timespan action without non working days', () => {
    let ganttObj: Gantt;
    let data = [
        {
            TaskID: 1,
            TaskName: 'Product Concept',
            StartDate: new Date('04/02/2019'),
            EndDate: new Date('04/21/2019'),
            subtasks: [
                { TaskID: 2, TaskName: 'Defining the product  and its usage', BaselineStartDate: new Date('04/02/2019'), BaselineEndDate: new Date('04/06/2019'), StartDate: new Date('04/02/2019'), Duration: 3,Progress: 30 },
                { TaskID: 3, TaskName: 'Defining target audience', StartDate: new Date('04/02/2019'), Duration: 3, 
                Indicators: [
                    {
                        'date': '04/10/2019',
                        'iconClass': 'e-btn-icon e-notes-info e-icons e-icon-left e-gantt e-notes-info::before',
                        'name': 'Indicator title',
                        'tooltip': 'tooltip'
                    }
                ] 
            },
                { TaskID: 4, TaskName: 'Prepare product sketch and notes', StartDate: new Date('04/02/2019'), Duration: 3, Predecessor: "2" ,Progress: 30},
            ]
        }]
    beforeAll((done: Function) => {
        ganttObj = createGantt ({
            dataSource: data,
           treeColumnIndex: 1,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                dependency:'Predecessor',
                baselineStartDate: "BaselineStartDate",
                baselineEndDate: "BaselineEndDate",
                child: 'subtasks',
                indicators: 'Indicators'
            },
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                showDeleteConfirmDialog: true
            },
            columns: [
                { field: 'taskID', width: 60 },
                { field: 'taskName', width: 250 },
                { field: 'startDate' },
                { field: 'endDate' },
                { field: 'duration' },
                { field: 'predecessor' },
                { field: 'progress' },
            ],
            toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 
            'PrevTimeSpan', 'NextTimeSpan','ExcelExport', 'CsvExport', 'PdfExport',],
            gridLines: "Both",
            timelineSettings: {
                showTooltip: true,
                showWeekend: false,
                topTier: {
                    unit: 'Week',
                    format: 'dd/MM/yyyy'
                },
                bottomTier: {
                    unit: 'Day',
                    count: 1
                }
            },
            taskbarHeight: 20,
            rowHeight: 40,
            allowUnscheduledTasks: true,
            projectStartDate: new Date('03/25/2019'),
            projectEndDate: new Date('05/30/2019'),
        }, done);
    });
    it('Previous Timespan handler function', () => {
        let previoustimespanToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_prevtimespan') as HTMLElement;
        triggerMouseEvent(previoustimespanToolbar, 'click');
        expect(ganttObj.getFormatedDate(ganttObj.timelineModule.timelineStartDate, 'MM/dd/yyyy')).toBe('03/18/2019');
     });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('previous timespan action without non working days with timelinesetting as days', () => {
    let ganttObj: Gantt;
    let data = [
        {
            TaskID: 1,
            TaskName: 'Product Concept',
            StartDate: new Date('04/02/2019'),
            EndDate: new Date('04/21/2019'),
            subtasks: [
                { TaskID: 2, TaskName: 'Defining the product  and its usage', BaselineStartDate: new Date('04/02/2019'), BaselineEndDate: new Date('04/06/2019'), StartDate: new Date('04/02/2019'), Duration: 3,Progress: 30 },
                { TaskID: 3, TaskName: 'Defining target audience', StartDate: new Date('04/02/2019'), Duration: 3, 
                Indicators: [
                    {
                        'date': '04/10/2019',
                        'iconClass': 'e-btn-icon e-notes-info e-icons e-icon-left e-gantt e-notes-info::before',
                        'name': 'Indicator title',
                        'tooltip': 'tooltip'
                    }
                ] 
            },
                { TaskID: 4, TaskName: 'Prepare product sketch and notes', StartDate: new Date('04/02/2019'), Duration: 3, Predecessor: "2" ,Progress: 30},
            ]
        }]
    beforeAll((done: Function) => {
        ganttObj = createGantt ({
            dataSource: data,
           treeColumnIndex: 1,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                dependency:'Predecessor',
                baselineStartDate: "BaselineStartDate",
                baselineEndDate: "BaselineEndDate",
                child: 'subtasks',
                indicators: 'Indicators'
            },
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                showDeleteConfirmDialog: true
            },
            columns: [
                { field: 'taskID', width: 60 },
                { field: 'taskName', width: 250 },
                { field: 'startDate' },
                { field: 'endDate' },
                { field: 'duration' },
                { field: 'predecessor' },
                { field: 'progress' },
            ],
            toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 
            'PrevTimeSpan', 'NextTimeSpan','ExcelExport', 'CsvExport', 'PdfExport',],
            gridLines: "Both",
            timelineSettings: {
                showTooltip: true,
                showWeekend: false,
                topTier: {
                    unit: 'Day',
                    format: 'dd/MM/yyyy'
                },
                bottomTier: {
                    unit: 'Hour',
                    count: 1
                }
            },
            taskbarHeight: 20,
            rowHeight: 40,
            allowUnscheduledTasks: true,
            projectStartDate: new Date('03/25/2019'),
            projectEndDate: new Date('05/30/2019'),
        }, done);
    });
    it('Previous Timespan handler function', () => {
        let previoustimespanToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_prevtimespan') as HTMLElement;
        triggerMouseEvent(previoustimespanToolbar, 'click');
        expect(ganttObj.getFormatedDate(ganttObj.timelineModule.timelineStartDate, 'MM/dd/yyyy')).toBe('03/22/2019');
     });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('previous timespan action without non working days with  weekStartDay', () => {
    let ganttObj: Gantt;
    let data = [
        {
            TaskID: 1,
            TaskName: 'Product Concept',
            StartDate: new Date('04/02/2019'),
            EndDate: new Date('04/21/2019'),
            subtasks: [
                { TaskID: 2, TaskName: 'Defining the product  and its usage', BaselineStartDate: new Date('04/02/2019'), BaselineEndDate: new Date('04/06/2019'), StartDate: new Date('04/02/2019'), Duration: 3,Progress: 30 },
                { TaskID: 3, TaskName: 'Defining target audience', StartDate: new Date('04/02/2019'), Duration: 3, 
                Indicators: [
                    {
                        'date': '04/10/2019',
                        'iconClass': 'e-btn-icon e-notes-info e-icons e-icon-left e-gantt e-notes-info::before',
                        'name': 'Indicator title',
                        'tooltip': 'tooltip'
                    }
                ] 
            },
                { TaskID: 4, TaskName: 'Prepare product sketch and notes', StartDate: new Date('04/02/2019'), Duration: 3, Predecessor: "2" ,Progress: 30},
            ]
        }]
    beforeAll((done: Function) => {
        ganttObj = createGantt ({
            dataSource: data,
           treeColumnIndex: 1,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                dependency:'Predecessor',
                baselineStartDate: "BaselineStartDate",
                baselineEndDate: "BaselineEndDate",
                child: 'subtasks',
                indicators: 'Indicators'
            },
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                showDeleteConfirmDialog: true
            },
            columns: [
                { field: 'taskID', width: 60 },
                { field: 'taskName', width: 250 },
                { field: 'startDate' },
                { field: 'endDate' },
                { field: 'duration' },
                { field: 'predecessor' },
                { field: 'progress' },
            ],
            toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 
            'PrevTimeSpan', 'NextTimeSpan','ExcelExport', 'CsvExport', 'PdfExport',],
            gridLines: "Both",
            timelineSettings: {
                showTooltip: true,
                showWeekend: false,
                 weekStartDay:5,
                topTier: {
                    unit: 'Week',
                    format: 'dd/MM/yyyy'
                },
                bottomTier: {
                    unit: 'Day',
                    count: 1
                }
            },
            taskbarHeight: 20,
            rowHeight: 40,
            allowUnscheduledTasks: true,
            projectStartDate: new Date('03/25/2019'),
            projectEndDate: new Date('05/30/2019'),
        }, done);
    });
    it('Previous Timespan handler function with  weekStartDay', () => {
        let previoustimespanToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_prevtimespan') as HTMLElement;
        triggerMouseEvent(previoustimespanToolbar, 'click');
        expect(ganttObj.getFormatedDate(ganttObj.timelineModule.timelineStartDate, 'MM/dd/yyyy')).toBe('03/22/2019');
     });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});
describe('next timespan action without non working days with timelinesetting as days', () => {
    let ganttObj: Gantt;
    let data = [
        {
            TaskID: 1,
            TaskName: 'Product Concept',
            StartDate: new Date('04/02/2019'),
            EndDate: new Date('04/21/2019'),
            subtasks: [
                { TaskID: 2, TaskName: 'Defining the product  and its usage', BaselineStartDate: new Date('04/02/2019'), BaselineEndDate: new Date('04/06/2019'), StartDate: new Date('04/02/2019'), Duration: 3,Progress: 30 },
                { TaskID: 3, TaskName: 'Defining target audience', StartDate: new Date('04/02/2019'), Duration: 3, 
                Indicators: [
                    {
                        'date': '04/10/2019',
                        'iconClass': 'e-btn-icon e-notes-info e-icons e-icon-left e-gantt e-notes-info::before',
                        'name': 'Indicator title',
                        'tooltip': 'tooltip'
                    }
                ] 
            },
                { TaskID: 4, TaskName: 'Prepare product sketch and notes', StartDate: new Date('04/02/2019'), Duration: 3, Predecessor: "2" ,Progress: 30},
            ]
        }]
    beforeAll((done: Function) => {
        ganttObj = createGantt ({
            dataSource: data,
           treeColumnIndex: 1,
            taskFields: {
                id: 'TaskID',
                name: 'TaskName',
                startDate: 'StartDate',
                duration: 'Duration',
                progress: 'Progress',
                dependency:'Predecessor',
                baselineStartDate: "BaselineStartDate",
                baselineEndDate: "BaselineEndDate",
                child: 'subtasks',
                indicators: 'Indicators'
            },
            editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                allowTaskbarEditing: true,
                showDeleteConfirmDialog: true
            },
            columns: [
                { field: 'taskID', width: 60 },
                { field: 'taskName', width: 250 },
                { field: 'startDate' },
                { field: 'endDate' },
                { field: 'duration' },
                { field: 'predecessor' },
                { field: 'progress' },
            ],
            toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search', 'ZoomIn', 'ZoomOut', 'ZoomToFit', 
            'PrevTimeSpan', 'NextTimeSpan','ExcelExport', 'CsvExport', 'PdfExport',],
            gridLines: "Both",
            timelineSettings: {
                showTooltip: true,
                showWeekend: false,
                topTier: {
                    unit: 'Day',
                    format: 'dd/MM/yyyy'
                },
                bottomTier: {
                    unit: 'Hour',
                    count: 1
                }
            },
            taskbarHeight: 20,
            rowHeight: 40,
            allowUnscheduledTasks: true,
            projectStartDate: new Date('03/25/2019'),
            projectEndDate: new Date('05/30/2019'),
        }, done);
    });
    it('Previous Timespan handler function', () => {
        let previoustimespanToolbar: HTMLElement = ganttObj.element.querySelector('#' + ganttObj.element.id + '_nexttimespan') as HTMLElement;
        triggerMouseEvent(previoustimespanToolbar, 'click');
        expect(ganttObj.getFormatedDate(ganttObj.timelineModule.timelineStartDate, 'MM/dd/yyyy')).toBe('03/25/2019');
     });
    afterAll(() => {
        if (ganttObj) {
            destroyGantt(ganttObj);
        }
    });
});