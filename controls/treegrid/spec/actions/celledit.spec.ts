import { TreeGrid } from '../../src/treegrid/base/treegrid';
import { createGrid, destroy } from '../base/treegridutil.spec';
import { sampleData, projectData2 } from '../base/datasource.spec';
import { Edit } from '../../src/treegrid/actions/edit';
import { Toolbar } from '../../src/treegrid/actions/toolbar';
import { SaveEventArgs, CellEditArgs } from '@syncfusion/ej2-grids';
import { profile, inMB, getMemoryProfile } from '../common.spec';
import { Sort } from '../../src/treegrid/actions/sort';
import { RowDD } from '../../src/treegrid/actions/rowdragdrop';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { VirtualScroll } from '../../src/treegrid/actions/virtual-scroll';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { select } from '@syncfusion/ej2-base';

/**
 * Grid Cell Edit spec
 */
TreeGrid.Inject(Edit, Toolbar, Sort, RowDD, VirtualScroll);
describe('Cell Edit module', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log('Unsupported environment, window.performance.memory is unavailable');
            pending(); //Skips test (in Chai)
            return;
        }
    });
    describe('Hirarchy editing', () => {
        let gridObj: TreeGrid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: sampleData,
                    childMapping: 'subtasks',
                    editSettings: { allowEditing: true, mode: 'Cell', allowDeleting: true, allowAdding: true, newRowPosition: 'Top' },

                    treeColumnIndex: 1,
                    toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll'],
                    columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                        { field: 'taskName', headerText: 'Task Name' },
                        { field: 'progress', headerText: 'Progress' },
                        { field: 'startDate', headerText: 'Start Date' }
                    ]
                },
                done
            );
        });
        it('record double click', (done: Function) => {
            gridObj.cellEdit = (args?: CellEditArgs): void => {
                expect(args.columnName).toBe('taskName');
                done();
            };
            const event: MouseEvent = new MouseEvent('dblclick', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
        });
        it('save record', (done: Function) => {
            gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'test';
            gridObj.actionComplete = (args?: any): void => {
                expect(gridObj.dataSource[0].subtasks[1].taskName).toBe('test');
                done();
            };
            (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        });
        afterAll(() => {
            destroy(gridObj);
        });
    });
    it('memory leak', () => {
        profile.sample();
        const average: any = inMB(profile.averageChange);
        //Check average change in memory samples to not be over 10MB
        expect(average).toBeLessThan(10);
        const memory: any = inMB(getMemoryProfile());
        //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });
});

describe('Cell Editing - cell alone refresh', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, newRowPosition: 'Top' },

                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'startDate', headerText: 'Start Date' }
                ]
            },
            done
        );
    });
    it('cell refresh', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        (gridObj.getCellFromIndex(1, 1) as HTMLElement).style.background = 'red';
        gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
        gridObj.actionComplete = (args?: SaveEventArgs): void => {
            expect(args.target.textContent).toBe('test');
            expect((gridObj.getCellFromIndex(1, 1) as HTMLElement).style.background).toBe('red');
        };
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'test';
        gridObj.getRows()[0].click();
    });
    it('cell refresh by toolbar update', (done: Function) => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        (gridObj.getCellFromIndex(1, 1) as HTMLElement).style.background = 'blue';
        gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
        gridObj.actionComplete = (args?: SaveEventArgs): void => {
            expect(args.target.textContent).toBe('test2');
            expect((gridObj.getCellFromIndex(1, 1) as HTMLElement).style.background).toBe('blue');
            done();
        };
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'test2';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Cell Editing With scroller', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                width: 600, height: 400,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, newRowPosition: 'Top' },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [
                    {
                        field: 'taskID', headerText: 'Task ID', isPrimaryKey: true, textAlign: 'Right',
                        validationRules: { required: true, number: true }, width: 190
                    },
                    { field: 'taskName', headerText: 'Task Name', editType: 'stringedit', width: 220, validationRules: { required: true } },
                    { field: 'startDate', headerText: 'Start Date', textAlign: 'Right', width: 230, editType: 'datepickeredit',
                        format: 'yMd', validationRules: { date: true } },
                    {
                        field: 'duration', headerText: 'Duration', textAlign: 'Right', width: 200, editType: 'numericedit',
                        validationRules: { number: true, min: 0 }, edit: { params: { format: 'n' } }
                    }
                ]
            },
            done
        );
    });
    it('cell edit', () => {
        expect((<HTMLElement>gridObj.grid.element).style.width).toBe('600px');
        expect((<HTMLElement>gridObj.getContent().firstChild).classList.contains('e-content')).toBeTruthy();
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        const scrollPosition: number = gridObj.getContent().firstElementChild.scrollLeft;
        gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
        expect(gridObj.getContent().firstElementChild.scrollLeft).toEqual(scrollPosition);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        expect(gridObj.getContent().firstElementChild.scrollLeft).toEqual(scrollPosition);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-63809 - Cursor Icon for resizing disappears when we double click on the cell', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 2,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell'
                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [
                    { field: 'taskID', headerText: 'Order ID', isPrimaryKey: true, width: 120 },
                    { field: 'taskName', headerText: 'Customer ID', width: 150 },
                    { field: 'duration', headerText: 'Freight', type: 'number', width: 150 },
                    { field: 'progress', headerText: 'Ship Name', width: 150 }
                ]
            },
            done
        );
    });

    it('Double click on primary key column', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(1, 0).dispatchEvent(event);
        expect(gridObj.grid.element.classList.contains('.e-editing')).toBe(false);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Sorting and update cell', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                allowSorting: true,
                treeColumnIndex: 1,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell',
                    newRowPosition: 'Below'

                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'startDate', headerText: 'Start Date'},
                    { field: 'duration', headerText: 'duration' }
                ]
            },
            done
        );
    });
    it('double click parent cell edit and update', (done: Function) => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        actionComplete = (args?: any): void => {
            if (args.type === 'save'){
                expect((gridObj.getRows()[0].getElementsByClassName('e-treecell')[0] as HTMLElement).innerText === 'Planned').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        gridObj.getCellFromIndex(0, 1).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'Planned';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        gridObj.getCellFromIndex(1, 1).dispatchEvent(event);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_cancel' } });
    });
    it('double click on child cell edit and update', (done: Function) => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        actionComplete = (args?: any): void => {
            if (args.type === 'save'){
                expect((gridObj.getRows()[1].getElementsByClassName('e-treecell')[0] as HTMLElement).innerText === 'Planning completed').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        gridObj.getCellFromIndex(1, 1).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'Planning completed';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_cancel' } });
    });
    it('Sorting the column,edit and update the parent cell', (done: Function) => {
        actionComplete = (args?: Object): void => {
            expect(gridObj.getRows()[0].getElementsByClassName('e-rowcell')[1].querySelector('div>.e-treecell').innerHTML === 'Design').toBe(true);
            expect(gridObj.getRows()[1].getElementsByClassName('e-rowcell')[1].querySelector('div>.e-treecell').innerHTML === 'Design complete').toBe(true);
            expect(gridObj.getRows()[2].getElementsByClassName('e-rowcell')[1].querySelector('div>.e-treecell').innerHTML === 'Design Documentation').toBe(true);
            expect(gridObj.getRows()[3].getElementsByClassName('e-rowcell')[1].querySelector('div>.e-treecell').innerHTML === 'Develop prototype').toBe(true);
            expect(gridObj.getRows()[4].getElementsByClassName('e-rowcell')[1].querySelector('div>.e-treecell').innerHTML === 'Get approval from customer').toBe(true);
            expect(gridObj.getRows()[5].getElementsByClassName('e-rowcell')[1].querySelector('div>.e-treecell').innerHTML === 'Software Specification').toBe(true);
            done();
        };
        gridObj.sortByColumn('taskName', 'Ascending', true);
        gridObj.grid.actionComplete = actionComplete;
    });
    it('double click on sorted parent cell edit and update', (done: Function) => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        actionComplete = (args?: any): void => {
            if (args.type === 'save'){
                expect((gridObj.getRows()[0].getElementsByClassName('e-treecell')[0] as HTMLElement).innerText === 'Designs').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        gridObj.getCellFromIndex(0, 1).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'Designs';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        gridObj.getCellFromIndex(1, 1).dispatchEvent(event);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_cancel' } });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Check the expanding state of record after delete operation', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell',
                    newRowPosition: 'Below'

                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'startDate', headerText: 'Start Date'},
                    { field: 'duration', headerText: 'duration' }
                ]
            },
            done
        );
    });
    it('Check expand state of record after deletion of another record', (done: Function) => {
        (<HTMLElement>gridObj.getRows()[5].querySelectorAll('.e-treegridexpand')[0]).click();
        (<HTMLElement>gridObj.getRows()[11].querySelectorAll('.e-treegridexpand')[0]).click();
        gridObj.selectRow(2);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_delete' } });
        gridObj.actionComplete = (args?: Object): void => {
            (<HTMLElement>gridObj.getRows()[10].querySelectorAll('.e-treegridcollapse')[0]).click();
            expect(gridObj.getRows()[11].getElementsByClassName('e-treecolumn-container')[0].children[1].classList.contains('e-treegridexpand')).toBe(true);
            expect(gridObj.getRows()[12].getElementsByClassName('e-treecolumn-container')[0].children[2].classList.contains('e-treegridexpand')).toBe(true);
            done();
        };
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Cell edit and cancel when selection mode is set as Cell', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                allowSelection: true,
                selectionSettings: {mode: 'Cell'},
                treeColumnIndex: 1,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell'
                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'startDate', headerText: 'Start Date'},
                    { field: 'duration', headerText: 'duration' }
                ]
            },
            done
        );
    });
    it('double click on a record, cell edit and cancel', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(1, 1).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'Planning completed';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_cancel' } });
        expect((gridObj.getRows()[1].getElementsByClassName('e-treecell')[0] as HTMLElement).innerText === 'Plan timeline').toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Expand/Collpase icon testing at the time of cell edit cancel', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                allowSelection: true,
                selectionSettings: {mode: 'Cell'},
                treeColumnIndex: 1,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell'
                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', template: '<span>test</span>', headerText: 'Task Name' },
                    { field: 'startDate', headerText: 'Start Date'},
                    { field: 'duration', headerText: 'duration' }
                ]
            },
            done
        );
    });
    it('double click on a record, cell edit and cancel', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(0, 1).dispatchEvent(event);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_cancel' } });
        expect(gridObj.getRows()[0].getElementsByClassName('e-treecell').length).toBe(1);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-26550 - Edit cell through method', () => {
    let gridObj: TreeGrid;
    let cellEdit: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, mode: 'Cell', allowDeleting: true, allowAdding: true },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll'],
                columns: [{field: 'taskID', headerText: 'Task ID', isPrimaryKey: true},
                    {field: 'taskName', headerText: 'Task Name'},
                    {field: 'startDate', headerText: 'Start Date'},
                    {field: 'progress', headerText: 'Progress'}]
            },
            done
        );
    });
    it('Edit Cell', () => {
        cellEdit = (args?: any): void => {
            setTimeout(() => {
                expect(gridObj.grid.editModule.formObj.element.getElementsByTagName('input').length).toBe(1);
            }, 0);
        };
        gridObj.cellEdit = cellEdit;
        gridObj.editCell(2, 'progress');
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-61461 - Parent Icon disappears when we delete multiple records', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: projectData2,
                height: 400,
                idMapping: 'TaskID',
                parentIdMapping: 'parentID',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, mode: 'Cell', newRowPosition: 'Below' },
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                allowPaging: true,
                treeColumnIndex: 1,
                columns: [
                    { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 140, isPrimaryKey: true },
                    { field: 'TaskName', headerText: 'Task Name', width: 160 },
                    { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120, format: { skeleton: 'yMd', type: 'date' }},
                    { field: 'EndDate', headerText: 'End Date', textAlign: 'Right', width: 120, format: { skeleton: 'yMd', type: 'date' }}
                ]
            },
            done
        );
    });
    it('Delete multiple records ', () => {
        gridObj.selectRow(3);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_delete' } });
        gridObj.selectRow(1);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_delete' } });
        expect(gridObj.grid.getRows()[0].getElementsByClassName('e-treegridexpand').length).toBe(1);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-22751: Events not triggered', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell'

                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'startDate', headerText: 'Start Date'},
                    { field: 'duration', headerText: 'duration' }
                ]
            },
            done
        );
    });
    it('Check editing events', (done: Function) => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.actionBegin = (args?: Object) : void => {
            expect(args['columnName'] === 'taskName').toBe(true);
            expect(args['type'] === 'edit').toBe(true);
            done();
        };
        /*gridObj.actionComplete = (args?: Object): void => {
      expect(args['type'] === 'edit').toBe(true);
      done();
    }*/
        gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
    });

    it('Check saving events', (done: Function) => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.actionBegin = (args?: Object) : void => {
            expect(args['type'] === 'save').toBe(true);
        };
        gridObj.actionComplete = (args?: Object) : void => {
            expect(args['type'] === 'save').toBe(true);
            expect(args['target'].cellIndex === 1).toBe(true);
            done();
        };
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });

    });

    it('Check editing events again', (done: Function) => {

        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        gridObj.actionBegin = (args?: Object) : void => {
            expect(args['columnName'] === 'taskName').toBe(true);
            expect(args['type'] === 'edit').toBe(true);
            done();
        };
        /*gridObj.actionComplete = (args?: Object): void => {
    expect(args['type'] === 'edit').toBe(true);
    done();
  }*/
        gridObj.getCellFromIndex(3, 1).dispatchEvent(event);
    });

    it('Check cancelling events', (done: Function) => {
        gridObj.actionComplete = (args?: Object) : void => {
            expect(args['name'] === 'actionComplete').toBe(true);
            done();
        };
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_cancel' } });
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('allowEditOnDblClick - Cell Editing', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, mode: 'Cell', newRowPosition: 'Below', allowEditOnDblClick: false },

                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'startDate', headerText: 'Start Date' }
                ]
            },
            done
        );
    });
    it('allowEditOnDblClick - Cell Editing', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
        expect(isNullOrUndefined(gridObj.grid.editModule.formObj)).toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-32160 - DataSource not refreshed after cancelling the edit action on cellEditing', () => {
    let gridObj: TreeGrid;
    let cellEdit: () => void;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, mode: 'Cell', newRowPosition: 'Below' },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'startDate', headerText: 'Start Date' }
                ]
            },
            done
        );
    });
    it('DataSource not refreshed after cancelling the edit action on cellEditing', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        cellEdit = (args?: any): void => {
            args.cancel = true;
        };
        actionComplete = (args?: any): void => {
            expect(isNullOrUndefined(args.rowData.taskID)).toBe(true);
        };
        gridObj.cellEdit = cellEdit;
        gridObj.actionComplete = actionComplete;
        gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_add' } });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-32869 - Clicking on Expand icon while in edit state', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, mode: 'Cell', newRowPosition: 'Below' },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'startDate', headerText: 'Start Date' }
                ]
            },
            done
        );
    });
    it('Clicking on expand icon in edit state', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(0, 2).dispatchEvent(event);
        (gridObj.editModule as any).doubleClickTarget.getElementsByTagName('input')[0].value = '20';
        (gridObj.getRows()[0].getElementsByClassName('e-treegridexpand')[0] as HTMLElement).click();
        const cells: NodeListOf<Element> = gridObj.grid.getRows()[0].querySelectorAll('.e-rowcell');
        expect(cells[2].textContent === '20' ).toBeTruthy();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-36694 - Cell Update with aggregates', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                height: 400,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell',
                    newRowPosition: 'Below'

                },
                aggregates: [{
                    showChildSummary: true,
                    columns: [
                        {
                            type: 'Max',
                            field: 'duration',
                            columnName: 'duration',
                            footerTemplate: 'Maximum: ${Max}'
                        }
                    ]
                }],
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [
                    {
                        field: 'taskID', headerText: 'Task ID', isPrimaryKey: true, textAlign: 'Right',
                        validationRules: { required: true, number: true}, width: 90
                    },
                    { field: 'taskName', headerText: 'Task Name', editType: 'stringedit', width: 220, validationRules: {required: true} },
                    { field: 'startDate', headerText: 'Start Date', textAlign: 'Right', width: 130, editType: 'datepickeredit',
                        format: 'yMd', validationRules: { date: true} },
                    {
                        field: 'duration', headerText: 'Duration', textAlign: 'Right', width: 100, editType: 'numericedit',
                        validationRules: { number: true, min: 0}, edit: { params: {  format: 'n'}}
                    }
                ]
            },
            done
        );
    });
    it('Edit Cell', (done: Function) => {
        actionComplete = (args?: any): void => {
            if (args.requestType === 'save') {
                expect((gridObj.getRows()[7].getElementsByClassName('e-treecell')[0] as HTMLElement).innerText === 'test').toBe(true);
            }
            done();
        };
        gridObj.actionComplete = actionComplete;
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(7, 1).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'test';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('checkbox retained after cell edit and cancel', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                autoCheckHierarchy: true,
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, mode: 'Cell', allowDeleting: true, allowAdding: true, showDeleteConfirmDialog: true, newRowPosition: 'Below' },
                columns: [
                    { field: 'taskID', headerText: 'Task ID', width: 90, isPrimaryKey: true, textAlign: 'Right' },
                    { field: 'taskName', headerText: 'Task Name', width: 150, showCheckbox: true },
                    { field: 'duration', headerText: 'Duration', width: 80, textAlign: 'Right' },
                    { field: 'progress', headerText: 'progress', width: 80, textAlign: 'Right' }
                ]
            },
            done
        );
    });
    it('CheckBox rendering', () => {
        const click: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(2, 1).dispatchEvent(click);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'test2';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_cancel' } });
        expect(gridObj.getRows()[2].getElementsByClassName('e-treecolumn-container')[0].children[4].className).toBe('e-treecell');
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('checkbox not rendered  after cell edit and cancel with drag and drop', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                allowRowDragAndDrop: true,
                autoCheckHierarchy: true,
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, mode: 'Cell', allowDeleting: true, allowAdding: true, showDeleteConfirmDialog: true, newRowPosition: 'Below' },
                columns: [
                    { field: 'taskID', headerText: 'Task ID', width: 90, isPrimaryKey: true, textAlign: 'Right' },
                    { field: 'taskName', headerText: 'Task Name', width: 150, showCheckbox: true },
                    { field: 'duration', headerText: 'Duration', width: 80, textAlign: 'Right' },
                    { field: 'progress', headerText: 'progress', width: 80, textAlign: 'Right' }
                ]
            },
            done
        );
    });
    it('CheckBox renders', () => {
        const click: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(2, 1).dispatchEvent(click);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'test2';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_cancel' } });
        expect(gridObj.getCellFromIndex(2, 0).classList.contains('e-treegridcheckbox')).toBe(false);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Editing', () => {
    let gridObj: TreeGrid;
    const preventDefault: Function = new Function();
    const data: Object[] = sampleData;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data.slice(0, 1),
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                height: 400,
                selectionSettings: {
                    mode: 'Cell'
                },

                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell',
                    newRowPosition: 'Child'

                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true, textAlign: 'Right',  width: 90 },
                    { field: 'taskName', headerText: 'Task Name'  },
                    { field: 'startDate', headerText: 'Start', textAlign: 'Right', width: 130, showCheckbox: true },
                    { field: 'progress', headerText: 'Duration', textAlign: 'Right', width: 100 }
                ]
            },
            done
        );
    });
    it('Double click', (done: Function) => {
        const click: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.cellEdit = (args?: Object) : void => {
            if (args['columnName'] === 'progress'){
                expect(args['type'] === 'edit').toBe(true);
                expect(args['cancel'] === 'true').toBe(false);
            }
            done();
        };
        const cell: any = gridObj.element.querySelectorAll('.e-rowcell')[1];
        gridObj.getCellFromIndex(0, 1).dispatchEvent(click);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = '102';
        gridObj.grid.keyboardModule.keyAction({ action: 'enter', preventDefault: preventDefault,  target: cell } as any);
        expect(cell.innerText = '102').toBeTruthy();
        gridObj.getCellFromIndex(0, 3).dispatchEvent(click);
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('update rows method', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Cell' },
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'duration', headerText: 'Duration', width: 80, textAlign: 'Right' }
                ]
            },
            done
        );
    });
    it(' update row method with index value', () => {
        gridObj.updateRow(2, {taskID: 3, taskName: 'test'});
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(2, 3).dispatchEvent(event);
        (gridObj.editModule as any).doubleClickTarget.getElementsByTagName('input')[0].value = '20';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        expect(gridObj.getCurrentViewRecords()[2]['duration'] === 20 ).toBeTruthy();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-43565 - Cell Edit with frozen Columns', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                frozenColumns: 1,
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Cell' },
                columns: [
                    { field: 'taskName', headerText: 'Task Name'},
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'duration', headerText: 'Duration', width: 80, textAlign: 'Right' }
                ]
            },
            done
        );
    });
    it('Edit Movable Cell', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(0, 2).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = '101';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        expect((gridObj.getRows()[0].getElementsByClassName('e-rowcell')[2] as HTMLElement).innerText === '101').toBe(true);
    });
    it('Edit Frozen Cell', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(0, 0).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'Planning Completed';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        expect((gridObj.getRows()[0].getElementsByClassName('e-rowcell')[0] as HTMLElement).innerText === 'Planning Completed').toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Tab Next Row Edit Testing - EJ2-45352', () => {
    let gridObj: TreeGrid;
    const preventDefault: Function = new Function();
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, allowNextRowEdit: true, mode: 'Cell',
                    newRowPosition: 'Child' },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'priority', headerText: 'priority' }
                ]
            },
            done
        );
    });
    it('Edit mode continued to the next row on tab click', () => {
        gridObj.editCell(0, 'priority');
        gridObj.element.querySelector('.e-editedbatchcell').querySelector('input').value = 'updated';
        expect(gridObj.getRows()[0].classList.contains('e-editedrow')).toBe(true);
        gridObj.grid.keyboardModule.keyAction({ action: 'tab', preventDefault: preventDefault, target: gridObj.element.querySelector('.e-editedbatchcell') } as any);
        gridObj.grid.keyboardModule.keyAction({ action: 'tab', preventDefault: preventDefault, target: gridObj.element.querySelector('.e-editedbatchcell') } as any);
        expect(gridObj.getRows()[1].classList.contains('e-editedrow')).toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Cancelling the edit action Testing - EJ2-50710', () => {
    let gridObj: TreeGrid;
    const preventDefault: Function = new Function();
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, allowNextRowEdit: true, mode: 'Cell',
                    newRowPosition: 'Child' },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'priority', headerText: 'priority' }
                ]
            },
            done
        );
    });
    it('Cancelling the edit action testing on escape click', () => {
        gridObj.editCell(0, 'taskName');
        gridObj.grid.keyboardModule.keyAction({ action: 'escape', preventDefault: preventDefault, target: gridObj.element.querySelector('.e-editedbatchcell') } as any);
        expect(gridObj.getRows()[0].querySelectorAll('.e-treegridexpand').length === 1).toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Tab Next Cell allowEdit false Testing - EJ2-51661', () => {
    let gridObj: TreeGrid;
    const preventDefault: Function = new Function();
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, allowNextRowEdit: true, mode: 'Cell',
                    newRowPosition: 'Child' },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'priority', allowEditing: false, headerText: 'priority' }
                ]
            },
            done
        );
    });
    it('Edit mode is not continued to the Cell on tab click', () => {
        gridObj.editCell(0, 'taskName');
        gridObj.element.querySelector('.e-editedbatchcell').querySelector('input').value = 'updated';
        expect(gridObj.getRows()[0].classList.contains('e-editedrow')).toBe(true);
        gridObj.grid.keyboardModule.keyAction({ action: 'tab', preventDefault: preventDefault, target: gridObj.element.querySelector('.e-editedbatchcell') } as any);
        expect(gridObj.getRows()[0].classList.contains('e-editedrow')).toBe(false);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-43565 - Cell Edit with isFrozen property', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Cell' },
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name', width: 200, isFrozen: true },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'duration', headerText: 'Duration', width: 80, textAlign: 'Right' }
                ]
            },
            done
        );
    });
    it('Edit Frozen Cell', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(0, 0).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'Planning Completed';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        expect((gridObj.getRows()[0].getElementsByClassName('e-rowcell')[0] as HTMLElement).innerText === 'Planning Completed').toBe(true);
    });
    it('Edit Movable Cell', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(0, 2).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = '101';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        expect((gridObj.getRows()[0].getElementsByClassName('e-rowcell')[2] as HTMLElement).innerText === '101').toBe(true);
    });
    it('Edit another Movable Cell', () => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(0, 3).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = '51';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        expect((gridObj.getRows()[0].getElementsByClassName('e-rowcell')[3] as HTMLElement).innerText === '51').toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-57487 - edit the cell using editCell method and press tab key for moving to another cell', () => {
    let gridObj: TreeGrid;
    const preventDefault: Function = new Function();
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, mode: 'Cell' },
                enableVirtualization: true,
                treeColumnIndex: 1,
                height: 400,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'startDate', headerText: 'Start Date' }
                ]
            },
            done
        );
    });
    it('Edit mode continued to the next cell on tab click', (done: Function) => {
        gridObj.editCell(2, 'taskName');
        expect(gridObj.getRows()[2].classList.contains('e-editedrow')).toBe(true);
        gridObj.grid.keyboardModule.keyAction({ action: 'tab', preventDefault: preventDefault, target: gridObj.element.querySelector('.e-editedbatchcell') } as any);
        expect(parseInt(gridObj.getRows()[2].getAttribute('aria-rowindex'), 10) - 1 === 2).toBe(true);
        done();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-60332 - editing the dropdown column with params when Persistence enabled', () => {
    let gridObj: TreeGrid;
    const preventDefault: Function = new Function();
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: projectData2,
                height: 400,
                idMapping: 'TaskID',
                parentIdMapping: 'parentID',
                editSettings: {
                    allowAdding: true,
                    allowEditing: true
                },
                enablePersistence: true,
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                allowPaging: true,
                treeColumnIndex: 1,
                columns: [
                    { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 140, isPrimaryKey: true },
                    { field: 'TaskName', headerText: 'Task Name', width: 160 },
                    { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120, format: { skeleton: 'yMd', type: 'date' }},
                    { field: 'EndDate', headerText: 'End Date', textAlign: 'Right', width: 120, format: { skeleton: 'yMd', type: 'date' }},
                    { field: 'Duration', headerText: 'Duration', textAlign: 'Right', width: 110,  editType: 'numericedit',
                        edit: { params: { format: 'n' } } },
                    { field: 'Priority', headerText: 'Priority', editType: 'dropdownedit',
                        edit: {
                            params: {
                                dataSource: new DataManager([
                                    { name: 'Not Started', value: 'Not Started' },
                                    { name: 'In Progress', value: 'In Progress' },
                                    { name: 'Completed', value: 'Completed' },
                                    { name: 'Rejected', value: 'Rejected' }
                                ]),
                                fields: { text: 'name', value: 'value' },
                                query: new Query()
                            }
                        } }
                ]
            },
            done
        );
    });
    it('Editing the dropdown column with params', (done: Function) => {
        gridObj.editCell(2, 'Priority');
        expect(gridObj.getRows()[2].classList.contains('e-editedrow')).toBe(true);
        done();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Record double click the edit action Testing', () => {
    let gridObj: TreeGrid;
    const preventDefault: Function = new Function();
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, allowNextRowEdit: true, mode: 'Cell',
                    newRowPosition: 'Child' },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Update', 'Delete', 'Cancel'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'priority', headerText: 'priority' }
                ]
            },
            done
        );
    });
    it('Record double click the edit action testing on f2 click', () => {
        gridObj.grid.keyboardModule.keyAction({ action: 'f2', preventDefault: preventDefault, target: gridObj.getCellFromIndex(0, 1) } as any);
        expect(gridObj.getRows()[0].querySelectorAll('.e-treegridexpand').length === 1).toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
});
describe('Bug 871546: Action Complete with args.requestType Cancel not passed on performing cell Edit action', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                height: 400,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell',
                    newRowPosition: 'Below'

                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel', 'Indent', 'Outdent'],
                columns: [
                    {
                        field: 'taskID', headerText: 'Task ID', isPrimaryKey: true, textAlign: 'Right',
                        validationRules: { required: true, number: true }, width: 90
                    },
                    { field: 'taskName', headerText: 'Task Name', editType: 'stringedit', width: 220, validationRules: { required: true } },
                    {
                        field: 'startDate', headerText: 'Start Date', textAlign: 'Right', width: 130, editType: 'datepickeredit',
                        format: 'yMd', validationRules: { date: true }
                    },
                    {
                        field: 'duration', headerText: 'Duration', textAlign: 'Right', width: 140, editType: 'numericedit',
                        validationRules: { number: true, min: 0 }, edit: { params: { format: 'n' } }
                    }
                ],
            },
            done
        );
    });
    it('action complete with cell edit action', (done: Function) => {
        actionComplete = (args?: any): void => {
            if (args['requestType'] === 'cancel') {
                expect(args.requestType === 'cancel').toBe(true);
            }
            done();
        };
        gridObj.actionComplete = actionComplete;
        gridObj.editCell(2, 'taskName');
        gridObj.closeEdit();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('code coverage', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                height: 400,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Cell',
                    newRowPosition: 'Below'

                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel', 'Indent', 'Outdent'],
                columns: [
                    {
                        field: 'taskID', headerText: 'Task ID', isPrimaryKey: true, textAlign: 'Right',
                        validationRules: { required: true, number: true }, width: 90
                    },
                    { field: 'taskName', headerText: 'Task Name', editType: 'stringedit', width: 220, validationRules: { required: true } },
                    {
                        field: 'startDate', headerText: 'Start Date', textAlign: 'Right', width: 130, editType: 'datepickeredit',
                        format: 'yMd', validationRules: { date: true }
                    },
                    {
                        field: 'duration', headerText: 'Duration', textAlign: 'Right', width: 140, editType: 'numericedit',
                        validationRules: { number: true, min: 0 }, edit: { params: { format: 'n' } }
                    }
                ],
            },
            done
        );
    });
    it('action complete with cell edit action', (done: Function) => {
        actionComplete = (args?: any): void => {
            if (args['requestType'] === 'cancel') {
                expect(args.requestType === 'cancel').toBe(true);
            }
            done();
        };
        gridObj.actionComplete = actionComplete;
        gridObj.editCell(2, 'taskName');
        gridObj.endEdit();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('code coverage', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, mode: 'Cell', allowDeleting: true, allowAdding: true, newRowPosition: 'Top' },

                treeColumnIndex: 1,
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'startDate', headerText: 'Start Date' }
                ]
            },
            done
        );
    });
    it('record double click', (done: Function) => {
        gridObj.cellEdit = (args?: CellEditArgs): void => {
            expect(args.columnName).toBe('taskName');
            done();
        };
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(2, 1).dispatchEvent(event);
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'test';
        gridObj.saveCell();
        gridObj.actionComplete = (args?: any): void => {
            expect(gridObj.dataSource[0].subtasks[1].taskName).toBe('test');
            done();
        };
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('code coverage', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                editSettings: { allowEditing: true, mode: 'Cell', allowDeleting: true, allowAdding: true, newRowPosition: 'Top' },
                treeColumnIndex: 1,
                toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll'],
                columns: [{ field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' },
                    { field: 'startDate', headerText: 'Start Date' }
                ]
            },
            done
        );
    });
    it('add record method', (done: Function) => {
        gridObj.addRecord({TaskID: 111, TaskName: 'Child record'}, 3, 'Child');
        expect(gridObj.flatData.length === 37).toBe(true);
        done();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Without bind EditSettings', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true, width: 60, textAlign: 'Right' },
                    { field: 'taskName', headerText: 'Task Name', width: 180, textAlign: 'Left' },
                    {
                        field: 'startDate', headerText: 'Start Date', width: 90, textAlign: 'Right', type: 'date', format: 'yMd'
                    },
                    { field: 'duration', headerText: 'Duration', width: 80, textAlign: 'Right' }
                ]
            },
            done
        );
    });
    it('Checking data without any script error', () => {
        gridObj.setCellValue(1, 'taskName', 'test');
        expect(gridObj.dataSource[0].taskName === 'test').toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
    });
  });

describe('Deleted row reappears after sorting in TreeGrid with Row Editing', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                allowPaging: true,
                allowFiltering: true,
                filterSettings: {
                    type: 'FilterBar',
                    hierarchyMode: 'Parent'
                },
                allowSorting: true,
                allowSelection: true,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Row',
                    newRowPosition: 'Top'
                },
                height: 250,
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true, width: 60, textAlign: 'Right' },
                    { field: 'taskName', headerText: 'Task Name', width: 180, textAlign: 'Left' },
                    {
                        field: 'startDate', headerText: 'Start Date', width: 90, textAlign: 'Right', type: 'date', format: 'yMd'
                    },
                    { field: 'duration', headerText: 'Duration', width: 80, textAlign: 'Right' }
                ]
            },
            done
        );
    });
    it('Checking data render correctly after sorting', () => {
        gridObj.startEdit(gridObj.getRows()[1]);
        let formEle: HTMLFormElement = gridObj.grid.editModule.formObj.element;
        (select('#' + gridObj.grid.element.id + 'taskName', formEle) as any).value = 'test';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
        gridObj.selectRow(1);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_delete' } });
        gridObj.sortByColumn("taskName", "Ascending", true);
        gridObj.sortByColumn("taskName", "Descending", true);
        expect((gridObj.flatData[1] as any).taskID === 3).toBe(true);
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('handling null index', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                allowPaging: true,
                allowFiltering: true,
                filterSettings: {
                    type: 'FilterBar',
                    hierarchyMode: 'Parent'
                },
                allowSorting: true,
                allowSelection: true,
                editSettings: {
                    allowAdding: true,
                    allowEditing: true,
                    allowDeleting: true,
                    mode: 'Row',
                    newRowPosition: 'Top'
                },
                height: 250,
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true, width: 60, textAlign: 'Right' },
                    { field: 'taskName', headerText: 'Task Name', width: 180, textAlign: 'Left' },
                    {
                        field: 'startDate', headerText: 'Start Date', width: 90, textAlign: 'Right', type: 'date', format: 'yMd'
                    },
                    { field: 'duration', headerText: 'Duration', width: 80, textAlign: 'Right' }
                ]
            },
            done
        );
    });
    it('handling null index with top position', (done: Function) => {
        gridObj.addRecord({ taskID: 111, taskName: 'Child record' }, null, 'Top');
        expect((gridObj.flatData[0] as any).taskID === 111).toBe(true);
        done();
    });
    it('handling null index with Above position', (done: Function) => {
        gridObj.addRecord({ taskID: 114, taskName: 'Child record' }, null, 'Above');
        expect((gridObj.flatData[0] as any).taskID === 114).toBe(true);
        done();
    });
    it('handling null index with Child position', (done: Function) => {
        gridObj.addRecord({ taskID: 115, taskName: 'Child record' }, null, 'Child');
        expect((gridObj.flatData[0] as any).taskID === 115).toBe(true);
        done();
    });
    it('handling null index with Below position', (done: Function) => {
        gridObj.addRecord({ taskID: 117, taskName: 'Child record' }, null, 'Below');
        expect((gridObj.flatData[0] as any).taskID === 117).toBe(true);
        done();
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('956322 - AddRecord method not working as expected after level 2', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                allowPaging:true,
                allowSelection:true,
                height: 400,
                editSettings: {
                allowAdding: true,
                allowEditing: true,
                allowDeleting: true,
                mode: 'Cell',
                newRowPosition: 'Child',
                },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel', 'Indent', 'Outdent'],
                columns: [
                {
                    field: 'taskID',
                    headerText: 'Task ID',
                    isPrimaryKey: true,
                    
                },
                {
                    field: 'taskName',
                    headerText: 'Task Name',
                    
                   
                },
                
                ],
            },
            done
        );
    });
    it('Add new record without specifying index', (done: Function) => {
        gridObj.selectRow(2);
        gridObj.addRecord({
            taskID: 100,
            taskName: 'Fist Record',
        });
        gridObj.selectRow(3);
        gridObj.addRecord({
            taskID: 101,
            taskName: 'Fist Record',
        });
        
        expect((gridObj.flatData[3] as any).taskID === 100).toBe(true);
        done();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Cell Editing - Add Record on Second Page', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                allowPaging: true,

                childMapping: 'subtasks',
                editSettings: { allowAdding: true , newRowPosition:'Child',mode:'Cell' },
                treeColumnIndex: 1,
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' }
                ]
            },
            done
        );
    });

    beforeEach((done: Function) => {
        // Navigate to second page before each test
        gridObj.actionComplete = (args?: any): void => {
            if (args.requestType === 'paging') {
                done();
            }
        };


        gridObj.goToPage(2);
    });
    it('should add the record as child of a selected level 0 record', (done: Function) => {
        // Navigate to second page


        actionComplete = (args?: any): void => {
            if (args.requestType === 'save') {
                expect((gridObj.flatData[20] as any).taskID === 9999).toBe(true);
                expect((gridObj.getRows()[8].getElementsByClassName('e-rowcell')[0] as HTMLElement).innerText === '9999').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        gridObj.selectRow(0);
        gridObj.addRecord({ taskID: 9999, taskName: 'Child of Selected Parent' });

    });

    afterAll(() => {
        destroy(gridObj);
    });
});


describe('Cell Editing - Add Record on Second Page', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                allowPaging: true,

                childMapping: 'subtasks',
                editSettings: { allowAdding: true , newRowPosition:'Child',mode:'Cell' },
                treeColumnIndex: 1,
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' }
                ]
            },
            done
        );
    });

    beforeEach((done: Function) => {
        // Navigate to second page before each test
        gridObj.actionComplete = (args?: any): void => {
            if (args.requestType === 'paging') {
                done();
            }
        };

        gridObj.goToPage(2);
    });
    it('should add the record as child of a selected level 1 record', (done: Function) => {
        actionComplete = (args?: any): void => {
            if (args.requestType === 'save') {
                expect((gridObj.flatData[20] as any).taskID === 9999).toBe(true);
                expect((gridObj.flatData[20] as any).parentItem.taskID === 14).toBe(true);
                expect((gridObj.getRows()[8].getElementsByClassName('e-rowcell')[0] as HTMLElement).innerText === '9999').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        gridObj.selectRow(1);
        gridObj.addRecord({ taskID: 9999, taskName: 'Child of Selected Parent' });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Cell Editing - Delete Record on Second Page', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                allowPaging: true,
               toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                childMapping: 'subtasks',
                editSettings: { allowDeleting: true , newRowPosition:'Child',mode:'Cell' },
                treeColumnIndex: 1,
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' }
                ]
            },
            done
        );
    });
    beforeEach((done: Function) => {
        // Navigate to second page before each test
        gridObj.actionComplete = (args?: any): void => {
            if (args.requestType === 'paging') {
                done();
            }
        };
        gridObj.goToPage(2);
    });
    it('should delete the selected level 0 record', (done: Function) => {
        actionComplete = (args?: any): void => {
            if (args.requestType === 'delete') {
                expect((gridObj.flatData[12] as any).taskID === 21).toBe(true);
                expect((gridObj.getRows()[0].getElementsByClassName('e-rowcell')[0] as HTMLElement).innerText === '21').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        gridObj.selectRow(0);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_delete' } });

    });
    afterAll(() => {
        destroy(gridObj);
    });
});


describe('Cell Editing - Delete Record on Second Page', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                allowPaging: true,
               toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                childMapping: 'subtasks',
                editSettings: { allowDeleting: true , newRowPosition:'Child',mode:'Cell' },
                treeColumnIndex: 1,
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' }
                ]
            },
            done
        );
    });

    beforeEach((done: Function) => {
        gridObj.actionComplete = (args?: any): void => {
            if (args.requestType === 'paging') {
                done();
            }
        };
        gridObj.goToPage(2);
    });

    it('should delete the selected level 1 record', (done: Function) => {
        actionComplete = (args?: any): void => {
            if (args.requestType === 'delete') {
                expect((gridObj.flatData[13] as any).taskID === 21).toBe(true);
                expect((gridObj.getRows()[1].getElementsByClassName('e-rowcell')[0] as HTMLElement).innerText === '21').toBe(true);
                done();
            }
        };
        gridObj.actionComplete = actionComplete;
        gridObj.selectRow(1);
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_delete' } });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Cell Editing - Update Record on Second Page', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                allowPaging: true,
               toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                childMapping: 'subtasks',
                editSettings: { allowEditing: true , newRowPosition:'Child', mode:'Cell' },
                treeColumnIndex: 1,
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' }
                ]
            },
            done
        );
    });
    beforeEach((done: Function) => {
        gridObj.actionComplete = (args?: any): void => {
            if (args.requestType === 'paging') {
                done();
            }
        };
        gridObj.goToPage(2);
    });
    it('should Edit the level 0 record', (done: Function) => {

        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(0, 1).dispatchEvent(event);
        actionComplete = (args?: any): void => {
               expect((gridObj.getRows()[0].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText === 'Test').toBe(true);
                done();
        };
        gridObj.actionComplete = actionComplete;
        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'Test';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } }); 
    });
    afterAll(() => {
        destroy(gridObj);
    });
});


describe('Cell Editing - Update Record on Second Page', () => {
    let gridObj: TreeGrid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                allowPaging: true,
               toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                childMapping: 'subtasks',
                editSettings: { allowEditing: true , newRowPosition:'Child',mode:'Cell' },
                treeColumnIndex: 1,
                columns: [
                    { field: 'taskID', headerText: 'Task ID', isPrimaryKey: true },
                    { field: 'taskName', headerText: 'Task Name' },
                    { field: 'progress', headerText: 'Progress' }
                ]
            },
            done
        );
    });
    beforeEach((done: Function) => {
        gridObj.actionComplete = (args?: any): void => {
            if (args.requestType === 'paging') {
                done();
            }
        };
        gridObj.goToPage(2);
    });

    it('should Edit the level 1 record', (done: Function) => {
        const event: MouseEvent = new MouseEvent('dblclick', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        gridObj.getCellFromIndex(1, 1).dispatchEvent(event);
        actionComplete = (args?: any): void => {
               expect((gridObj.getRows()[1].getElementsByClassName('e-rowcell')[1] as HTMLElement).innerText === 'Test').toBe(true);
                done();
        };
        gridObj.actionComplete = actionComplete;

        gridObj.grid.editModule.formObj.element.getElementsByTagName('input')[0].value = 'Test';
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_update' } });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});