/**
 * Grid Grouping spec document
 */
import { createElement, isNullOrUndefined } from '@syncfusion/ej2-base';
import { DataManager } from '@syncfusion/ej2-data';
import { Grid } from '../../../src/grid/base/grid';
import { ReturnType } from '../../../src/grid/base/type';
import { Sort } from '../../../src/grid/actions/sort';
import { Selection } from '../../../src/grid/actions/selection';
import { Aggregate } from '../../../src/grid/actions/aggregate';
import { Filter } from '../../../src/grid/actions/filter';
import { Page } from '../../../src/grid/actions/page';
import { Group } from '../../../src/grid/actions/group';
import { Toolbar } from '../../../src/grid/actions/toolbar';
import { Reorder } from '../../../src/grid/actions/reorder';
import { getComplexFieldID } from '../../../src/grid/base/util';
import { employeeSelectData, filterData } from '../base/datasource.spec';
import { createGrid, destroy, getClickObj, getKeyActionObj } from '../base/specutil.spec';
import { VirtualScroll } from '../../../src/grid/actions/virtual-scroll';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { Render } from '../../../src/grid/renderer/render';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { DetailRow } from '../../../src/grid/actions/detail-row';
import { InfiniteScroll } from '../../../src/grid/actions/infinite-scroll';
import { Edit } from '../../../src/grid/actions/edit';

Grid.Inject(Sort, Page, Filter, Group, Selection, Reorder, VirtualScroll, Aggregate, Toolbar, DetailRow, InfiniteScroll, Edit);


function copyObject(source: Object, destiation: Object): Object {
    for (let prop in source) {
        destiation[prop] = source[prop];
    }
    return destiation;
}

function getEventObject(eventType: string, eventName: string, target?: Element, x?: number, y?: number): Object {
    let tempEvent: any = document.createEvent(eventType);
    tempEvent.initEvent(eventName, true, true);
    let returnObject: any = copyObject(tempEvent, {});
    returnObject.preventDefault = () => { return true; };

    if (!isNullOrUndefined(x)) {
        returnObject.pageX = x;
        returnObject.clientX = x;
    }
    if (!isNullOrUndefined(y)) {
        returnObject.pageY = y;
        returnObject.clientY = y;
    }
    if (!isNullOrUndefined(target)) {
        returnObject.target = returnObject.srcElement = returnObject.toElement = returnObject.currentTarget = target;
    }

    return returnObject;
}

describe('Grouping module => ', () => {


    describe('Grouping functionalites => ', () => {
        let gridObj: Grid;
        let actionBegin: () => void;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    allowSelection: true,
                    groupSettings: { showGroupedColumn: true },
                    allowPaging: true,
                    actionBegin: actionBegin,
                    actionComplete: actionComplete,
                }, done);
        });

        it('group drop area testing', () => {
            let dropArea: any = gridObj.element.querySelectorAll('.e-groupdroparea');
            expect(dropArea.length).toBe(1);
            expect(dropArea[0].textContent).toBe('Drag a column header here to group its column');
        });

        it('Single column group testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
                let content = gridObj.getContent().querySelectorAll('tr');
                let gHeader = gridObj.element.querySelectorAll('.e-groupheadercell');
                expect(grpHIndent.length).toBe(1);
                expect(grpHIndent[0].querySelector('.e-headercelldiv').classList.contains('e-emptycell')).toBeTruthy();
                expect(content[0].querySelectorAll('.e-recordplusexpand').length).toBe(1);
                expect(content[0].querySelectorAll('.e-recordplusexpand'
                )[0].firstElementChild.classList.contains('e-gdiagonaldown')).toBeTruthy();

                expect(content[0].querySelectorAll('.e-groupcaption').length).toBe(1);
                expect(content[0].querySelectorAll('.e-groupcaption')[0].getAttribute('colspan')).toBe('6');
                expect(content[0].querySelectorAll('.e-groupcaption')[0].textContent).toBe('Ship City: Albuquerque - 5 items');

                expect(content[1].querySelectorAll('.e-indentcell').length).toBe(1);

                expect(gridObj.getContent().querySelectorAll('.e-recordplusexpand').length).toBe(6);

                expect(gHeader.length).toBe(1);
                expect(gHeader[0].querySelectorAll('.e-grouptext').length).toBe(1);
                expect(gHeader[0].querySelectorAll('.e-grouptext')[0].textContent).toBe('Ship City');
                expect(gHeader[0].querySelectorAll('.e-groupsort').length).toBe(1);
                expect(gHeader[0].querySelectorAll('.e-groupsort')[0].classList.contains('e-ascending')).toBeTruthy();
                expect(gHeader[0].querySelectorAll('.e-ungroupbutton').length).toBe(1);

                expect(gridObj.groupSettings.columns.length).toBe(1);
                expect(gridObj.sortSettings.columns.length).toBe(1);


                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('ShipCity');
        });

        it('Expandcollase row shortcut testing', () => {
            gridObj.selectRow(1, true);
            (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('altUpArrow'));
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(13);
            (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('altUpArrow'));
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(13);
            (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('altDownArrow'));
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(18);
            (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('altDownArrow'));
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(18);
        });

        it('Expandcollase row - selection disable testing', (done: Function) => {
            let actionComplete = (e: any) => {
                gridObj.actionComplete = null;
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.allowSelection = false;
            gridObj.dataBind();
            (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('altUpArrow'));
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(18);
            gridObj.allowSelection = true;
            gridObj.dataBind();
        });

        it('multi column group testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.groupSettings.columns.length).toBe(2);
                expect(gridObj.sortSettings.columns.length).toBe(2);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('ShipCountry');
        });

        it('multiple column group testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
                let content = gridObj.getContent().querySelectorAll('tr');
                let gHeader = gridObj.element.querySelectorAll('.e-groupheadercell');
                expect(grpHIndent.length).toBe(3);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell').length).toBe(3);
                expect(content[0].querySelectorAll('.e-recordplusexpand').length).toBe(1);
                expect((content[0].querySelectorAll('.e-recordplusexpand')[0] as HTMLTableCellElement).cellIndex).toBe(0);
                expect(content[0].querySelectorAll('.e-indentcell').length).toBe(0);
                expect(content[0].querySelectorAll('.e-recordplusexpand'
                )[0].firstElementChild.classList.contains('e-gdiagonaldown')).toBeTruthy();

                expect(content[1].querySelectorAll('.e-recordplusexpand').length).toBe(1);
                expect((content[1].querySelectorAll('.e-recordplusexpand')[0] as HTMLTableCellElement).cellIndex).toBe(1);
                expect(content[1].querySelectorAll('.e-indentcell').length).toBe(1);
                expect(content[1].querySelectorAll('.e-recordplusexpand'
                )[0].firstElementChild.classList.contains('e-gdiagonaldown')).toBeTruthy();

                expect(content[2].querySelectorAll('.e-recordplusexpand').length).toBe(1);
                expect((content[2].querySelectorAll('.e-recordplusexpand')[0] as HTMLTableCellElement).cellIndex).toBe(2);
                expect(content[2].querySelectorAll('.e-indentcell').length).toBe(2);
                expect(content[2].querySelectorAll('.e-recordplusexpand'
                )[0].firstElementChild.classList.contains('e-gdiagonaldown')).toBeTruthy();

                expect(content[0].querySelectorAll('.e-groupcaption')[0].getAttribute('colspan')).toBe('8');
                expect(content[1].querySelectorAll('.e-groupcaption')[0].getAttribute('colspan')).toBe('7');
                expect(content[2].querySelectorAll('.e-groupcaption')[0].getAttribute('colspan')).toBe('6');

                expect(content[0].querySelectorAll('.e-groupcaption').length).toBe(1);
                expect(content[1].querySelectorAll('.e-groupcaption').length).toBe(1);
                expect(content[2].querySelectorAll('.e-groupcaption').length).toBe(1);

                expect(content[0].querySelectorAll('.e-groupcaption')[0].textContent).toBe('Ship City: Albuquerque - 1 item');
                expect(content[1].querySelectorAll('.e-groupcaption')[0].textContent).toBe('Ship Country: USA - 1 item');
                expect(content[2].querySelectorAll('.e-groupcaption')[0].textContent).toBe('CustomerID: RATTC - 5 items');

                expect(content[3].querySelectorAll('.e-indentcell').length).toBe(3);

                expect(gridObj.getContent().querySelectorAll('.e-recordplusexpand').length).toBe(18);

                expect(gHeader.length).toBe(3);

                expect(gridObj.groupSettings.columns.length).toBe(3);
                expect(gridObj.sortSettings.columns.length).toBe(3);

                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('CustomerID');
        });


        it('ungroup testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
                let content = gridObj.getContent().querySelectorAll('tr');
                let gHeader = gridObj.element.querySelectorAll('.e-groupheadercell');
                expect(grpHIndent.length).toBe(2);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell').length).toBe(2);
                expect(content[0].querySelectorAll('.e-recordplusexpand').length).toBe(1);
                expect((content[0].querySelectorAll('.e-recordplusexpand')[0] as HTMLTableCellElement).cellIndex).toBe(0);
                expect(content[0].querySelectorAll('.e-indentcell').length).toBe(0);
                expect(content[0].querySelectorAll('.e-recordplusexpand'
                )[0].firstElementChild.classList.contains('e-gdiagonaldown')).toBeTruthy();

                expect(content[1].querySelectorAll('.e-recordplusexpand').length).toBe(1);
                expect((content[1].querySelectorAll('.e-recordplusexpand')[0] as HTMLTableCellElement).cellIndex).toBe(1);
                expect(content[1].querySelectorAll('.e-indentcell').length).toBe(1);
                expect(content[1].querySelectorAll('.e-recordplusexpand'
                )[0].firstElementChild.classList.contains('e-gdiagonaldown')).toBeTruthy();

                expect(content[0].querySelectorAll('.e-groupcaption')[0].getAttribute('colspan')).toBe('7');
                expect(content[1].querySelectorAll('.e-groupcaption')[0].getAttribute('colspan')).toBe('6');

                expect(content[0].querySelectorAll('.e-groupcaption').length).toBe(1);
                expect(content[1].querySelectorAll('.e-groupcaption').length).toBe(1);

                expect(content[0].querySelectorAll('.e-groupcaption')[0].textContent).toBe('Ship City: Albuquerque - 1 item');
                expect(content[1].querySelectorAll('.e-groupcaption')[0].textContent).toBe('CustomerID: RATTC - 5 items');

                expect(content[2].querySelectorAll('.e-indentcell').length).toBe(2);

                expect(gridObj.getContent().querySelectorAll('.e-recordplusexpand').length).toBe(12);

                expect(gHeader.length).toBe(2);

                expect(gridObj.groupSettings.columns.length).toBe(2);
                expect(gridObj.sortSettings.columns.length).toBe(2);

                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.ungroupColumn('ShipCountry');
        });

        it('Sort column with sorting disabled testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.element.querySelector('.e-groupdroparea').querySelectorAll('.e-descending').length).toBe(0);
                expect(gridObj.element.querySelector('.e-groupdroparea').querySelectorAll('.e-ascending').length).toBe(2);
                expect(gridObj.sortSettings.columns[0].direction).toBe('Ascending');
                expect(gridObj.sortSettings.columns[1].direction).toBe('Ascending');
                expect(gridObj.getColumnHeaderByField('CustomerID').querySelectorAll('.e-ascending').length).toBe(1);
                expect(gridObj.getColumnHeaderByField('ShipCity').querySelectorAll('.e-ascending').length).toBe(1);
                done();
            };
            gridObj.actionComplete = actionComplete;
            let grpHCell = gridObj.element.querySelectorAll('.e-groupheadercell');
            (gridObj.groupModule as any).clickHandler(getClickObj(grpHCell[0]));
            (gridObj.groupModule as any).clickHandler(getClickObj(grpHCell[1]));
            gridObj.allowSorting = true;
            gridObj.dataBind();

        });

        it('Sort column with sorting enable testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.element.querySelector('.e-groupdroparea').querySelectorAll('.e-descending').length).toBe(1);
                expect(gridObj.element.querySelector('.e-groupdroparea').querySelectorAll('.e-ascending').length).toBe(1);
                expect(gridObj.sortSettings.columns[1].direction).toBe('Descending');
                expect(gridObj.getColumnHeaderByField('ShipCity').querySelectorAll('.e-descending').length).toBe(1);
                done();
            };
            let grpHCell = gridObj.element.querySelectorAll('.e-groupheadercell');
            gridObj.actionComplete = actionComplete;
            (gridObj.groupModule as any).clickHandler(getClickObj(grpHCell[0]));
        });

        it('Sort column with sorting enable testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.element.querySelector('.e-groupdroparea').querySelectorAll('.e-descending').length).toBe(2);
                expect(gridObj.element.querySelector('.e-groupdroparea').querySelectorAll('.e-ascending').length).toBe(0);
                expect(gridObj.sortSettings.columns[1].direction).toBe('Descending');
                expect(gridObj.getColumnHeaderByField('CustomerID').querySelectorAll('.e-descending').length).toBe(1);
                done();
            };
            let grpHCell = gridObj.element.querySelectorAll('.e-groupheadercell');
            gridObj.actionComplete = actionComplete;
            (gridObj.groupModule as any).clickHandler(getClickObj(grpHCell[1]));
        });

        it('ungroup from button click testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
                let gHeader = gridObj.element.querySelectorAll('.e-groupheadercell');
                expect(grpHIndent.length).toBe(1);
                expect(gridObj.getContent().querySelectorAll('.e-recordplusexpand').length).toBe(8);
                expect(gHeader.length).toBe(1);
                expect(gridObj.groupSettings.columns.length).toBe(1);
                expect(gridObj.sortSettings.columns.length).toBe(2);
                done();
            };
            gridObj.actionComplete = actionComplete;
            (gridObj.groupModule as any).clickHandler(getClickObj(gridObj.element.getElementsByClassName('e-groupheadercell')[0].querySelector('.e-ungroupbutton')));
        });

        // it('ungroup from drag and drop testing', (done: Function) => {
        //     actionComplete = (args?: Object): void => {
        //         let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
        //         let gHeader = gridObj.element.querySelectorAll('.e-groupheadercell');
        //         expect(grpHIndent.length).toBe(0);
        //         expect(gridObj.getContent().querySelectorAll('.e-recordplusexpand').length).toBe(0);
        //         expect(gHeader.length).toBe(0);
        //         expect(gridObj.groupSettings.columns.length).toBe(0);
        //         expect(gridObj.sortSettings.columns.length).toBe(2);
        //         done();
        //     };
        //     gridObj.actionComplete = actionComplete;
        //     let gHeaders = gridObj.element.querySelectorAll('.e-groupheadercell');
        //     let mousedown: any = getEventObject('MouseEvents', 'mousedown', gHeaders[0], 10, 10);
        //     EventHandler.trigger(gridObj.element.querySelector('.e-groupdroparea') as HTMLElement, 'mousedown', mousedown);

        //     let mousemove: any = getEventObject('MouseEvents', 'mousemove', gHeaders[0]);
        //     EventHandler.trigger(<any>(document), 'mousemove', mousemove);
        //     mousemove.srcElement = mousemove.target = mousemove.toElement = gridObj.element.querySelector('.e-cloneproperties');
        //     EventHandler.trigger(<any>(document), 'mousemove', mousemove);
        //     mousemove.srcElement = mousemove.target = mousemove.toElement = gridObj.getContent().querySelectorAll('.e-rowcell')[1];
        //     EventHandler.trigger(<any>(document), 'mousemove', mousemove);

        //     let mouseup: any = getEventObject('MouseEvents', 'mouseup', gridObj.getContent().querySelectorAll('.e-rowcell')[1], 198, 198);
        //     EventHandler.trigger(<any>(document), 'mouseup', mouseup);
        // });

        // it('group from drag and drop testing', (done: Function) => {
        //     actionComplete = (args?: Object): void => {
        //         let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
        //         let gHeader = gridObj.element.querySelectorAll('.e-groupheadercell');
        //         expect(grpHIndent.length).toBe(1);
        //         expect(gridObj.getContent().querySelectorAll('.e-recordplusexpand').length).toBe(8);
        //         expect(gHeader.length).toBe(1);
        //         expect(gridObj.groupSettings.columns.length).toBe(1);
        //         expect(gridObj.sortSettings.columns.length).toBe(2);
        //         done();
        //     };
        //     gridObj.actionComplete = actionComplete;
        //     let gHeaders = gridObj.element.querySelectorAll('.e-groupheadercell');
        //     let headers = gridObj.getHeaderContent().querySelectorAll('.e-headercell');

        //     let mousedown: any = getEventObject('MouseEvents', 'mousedown', headers[1].querySelector('.e-headercelldiv'), 20, 40);
        //     EventHandler.trigger(gridObj.getHeaderContent().querySelector('.e-columnheader') as HTMLElement, 'mousedown', mousedown);

        //     let mousemove: any = getEventObject('MouseEvents', 'mousemove', headers[1]);
        //     EventHandler.trigger(<any>(document), 'mousemove', mousemove);
        //     mousemove.srcElement = mousemove.target = mousemove.toElement = gridObj.element.querySelector('.e-cloneproperties');
        //     EventHandler.trigger(<any>(document), 'mousemove', mousemove);
        //     mousemove.srcElement = mousemove.target = mousemove.toElement = gridObj.element.querySelector('.e-groupdroparea');
        //     EventHandler.trigger(<any>(document), 'mousemove', mousemove);

        //     let mouseup: any = getEventObject('MouseEvents', 'mouseup', gridObj.element.querySelector('.e-groupdroparea'), 10, 13);
        //     EventHandler.trigger(<any>(document), 'mouseup', mouseup);
        // });

        it('collapseAll method testing', () => {
            let expandElem = gridObj.getContent().querySelectorAll('.e-recordplusexpand');
            gridObj.groupModule.expandCollapseRows(expandElem[1]);
            gridObj.groupModule.expandCollapseRows(expandElem[0]);
            gridObj.groupModule.collapseAll();
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(8);
        });

        it('expandAll method testing', () => {
            gridObj.groupModule.expandAll();
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(20);
        });

        it('collapseAll shortcut testing', () => {
            let expandElem = gridObj.getContent().querySelectorAll('.e-recordplusexpand');
            gridObj.groupModule.expandCollapseRows(expandElem[1]);
            gridObj.groupModule.expandCollapseRows(expandElem[0]);
            (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('ctrlUpArrow'));
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(8);
        });

        it('expandAll shortcut testing', () => {
            (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('ctrlDownArrow'));
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(20);
        });

        it('multi column group testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.groupSettings.columns.length).toBe(2);
                expect(gridObj.sortSettings.columns.length).toBe(2);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('ShipCity');
        });

        it('expandcollapse rows method testing', () => {
            let expandElem = gridObj.getContent().querySelectorAll('.e-recordplusexpand');
            gridObj.groupModule.expandCollapseRows(expandElem[1]);
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(28);

            // EJ2-59755 - Screen Reader not announcing the state of the expand and collapse icon properly
            expect(expandElem[0].firstElementChild.getAttribute('title')).toBe('Expanded');

            gridObj.groupModule.expandCollapseRows(expandElem[0]);

            // EJ2-59755 - Screen Reader not announcing the state of the expand and collapse icon properly
            expect(expandElem[0].firstElementChild.getAttribute('title')).toBe('Collapsed');
            
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(27);
            gridObj.groupModule.expandCollapseRows(expandElem[0]);
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(28);
            gridObj.groupModule.expandCollapseRows(expandElem[1]);
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(30);
            gridObj.groupModule.expandCollapseRows(expandElem[2]);
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(27);
            gridObj.groupModule.expandCollapseRows(expandElem[2]);
            expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(30);
        });

        // used for code coverage
        it('clear grouping', () => {
            gridObj.clearGrouping();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = actionComplete = null;
        });
    });

    describe('Grouping columns hide => ', () => {
        let gridObj: Grid;
        let actionBegin: () => void;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    allowSorting: true,
                    groupSettings: { showGroupedColumn: false },
                    allowPaging: true,
                    actionBegin: actionBegin,
                    actionComplete: actionComplete
                }, done);
        });

        it('Single column group testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.groupSettings.columns.length).toBe(1);
                expect(gridObj.sortSettings.columns.length).toBe(1);
                expect(gridObj.element.querySelectorAll('.e-headercell:not(.e-hide)').length).toBe(5);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('ShipCity');
        });

        it('Single column ungroup testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.groupSettings.columns.length).toBe(0);
                expect(gridObj.sortSettings.columns.length).toBe(0);
                expect(gridObj.element.querySelectorAll('.e-headercell:not(.e-hide)').length).toBe(6);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.ungroupColumn('ShipCity');
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = actionComplete = null;
        });
    });

    describe('Grouping set model test case and reorder => ', () => {
        let gridObj: Grid;
        let actionBegin: () => void;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    allowSorting: true,
                    allowPaging: true,
                    allowReordering: true,
                    groupSettings: { showDropArea: false, showToggleButton: true, showUngroupButton: true },
                    actionBegin: actionBegin,
                    actionComplete: actionComplete
                }, done);
        });
        it('check default group property rendering', () => {
            expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(1);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn').length).toBe(gridObj.columns.length);
        });
        it('disable Grouping', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(0);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn').length).toBe(0);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.allowGrouping = false;
            gridObj.dataBind();
        });
        it('enable Grouping', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(1);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn').length).toBe(gridObj.columns.length);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.allowGrouping = true;
            gridObj.dataBind();
        });
        it('group a column', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(1);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn.e-toggleungroup').length).toBe(1);
                expect(gridObj.element.querySelectorAll('.e-groupdroparea')[0].querySelectorAll('.e-ungroupbutton').length).toBe(1);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-ascending').length).toBe(1);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('EmployeeID');
        });
        it('reOrder the grouped column', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn.e-toggleungroup').length).toBe(1);
                expect(gridObj.element.querySelectorAll('.e-groupdroparea')[0].querySelectorAll('.e-ungroupbutton').length).toBe(1);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-ascending').length).toBe(1);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-headercell')[5].children[0].innerHTML).toMatch('Employee ID');
                expect(gridObj.getContent().querySelectorAll('.e-row').length).toBe(12);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.reorderColumns('EmployeeID', 'ShipCountry');
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = actionComplete = null;
        });

    });


    describe('Group settings apis => ', () => {
        let gridObj: Grid;
        let actionBegin: () => void;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    allowSorting: true,
                    groupSettings: { showToggleButton: true, showGroupedColumn: true },
                    allowPaging: true,
                    actionBegin: actionBegin,
                    actionComplete: actionComplete,
                }, done);
        });

        it('sort after group testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.groupSettings.columns.length).toBe(1);
                done();
            };
            gridObj.actionComplete = actionComplete;
            let headers = gridObj.getHeaderContent().querySelectorAll('.e-headercell');
            (gridObj.groupModule as any).clickHandler(getClickObj(headers[0].querySelector('.e-grptogglebtn')));
        });

        it('group from toogle header testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.sortSettings.columns.length).toBe(2);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.sortColumn('CustomerID', 'Ascending', false);
        });

        it('hide drop area', () => {
            gridObj.groupSettings.showDropArea = false;
            gridObj.dataBind();
            expect((gridObj.element.querySelectorAll('.e-groupdroparea')[0] as HTMLElement).style.display).toBe('none');
        });

        it('show drop area', () => {
            gridObj.groupSettings.showDropArea = true;
            gridObj.dataBind();
            expect((gridObj.element.querySelectorAll('.e-groupdroparea')[0] as HTMLElement).style.display).toBe('')
        });

        it('hide group toggle button', () => {
            gridObj.groupSettings.showToggleButton = false;
            gridObj.dataBind();
            expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn').length).toBe(0);
        });

        it('show group toggle button', () => {
            gridObj.groupSettings.showToggleButton = true;
            gridObj.dataBind();
            expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn').length).toBe(gridObj.columns.length);
        });

        it('hide ungroup button', () => {
            gridObj.groupSettings.showUngroupButton = false;
            gridObj.dataBind();
            expect((gridObj.element.querySelectorAll('.e-groupdroparea')[0].
                querySelectorAll('.e-ungroupbutton')[0] as HTMLElement).style.display).toBe('none');
        });

        it('show ungroup button', () => {
            gridObj.groupSettings.showUngroupButton = true;
            gridObj.dataBind();
            expect((gridObj.element.querySelectorAll('.e-groupdroparea')[0].
                querySelectorAll('.e-ungroupbutton')[0] as HTMLElement).style.display).toBe('');
        });

        it('ungroup from toogele header testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.groupSettings.columns.length).toBe(0);
                done();
            };
            gridObj.actionComplete = actionComplete;
            let headers = gridObj.getHeaderContent().querySelectorAll('.e-headercell');
            (gridObj.groupModule as any).clickHandler(getClickObj(headers[0].querySelector('.e-grptogglebtn')));
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = actionComplete = null;
        });
    });

    describe('Stacked header with grouping => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData, allowPaging: false,
                    columns: [
                        {
                            headerText: 'Order Details', toolTip: 'Order Details',
                            columns: [{ field: 'OrderID', headerText: 'Order ID' },
                            { field: 'OrderDate', headerText: 'Order Date', format: { skeleton: 'yMd', type: 'date' }, type: 'date' }]
                        },
                        { field: 'CustomerID', headerText: 'Customer ID' },
                        { field: 'EmployeeID', headerText: 'Employee ID' },
                        {
                            headerText: 'Ship Details',
                            columns: [
                                { field: 'ShipCity', headerText: 'Ship City' },
                                { field: 'ShipCountry', headerText: 'Ship Country' },
                                {
                                    headerText: 'Ship Name Verified', columns: [{ field: 'ShipName', headerText: 'Ship Name' },
                                    { field: 'Verified', headerText: 'Verified' }]
                                },
                            ],
                        }
                    ],
                    allowGrouping: true,
                    allowSorting: true,
                }, done);
        });

        it('group a column', (done: Function) => {
            let actionComplete = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(1);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(1);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(3);
                done();
            };
            gridObj.groupModule.groupColumn('EmployeeID');
            gridObj.actionComplete = actionComplete;
        });
        it('sort a column', (done: Function) => {
            let actionComplete = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(1);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(2);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(3);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.sortColumn('OrderDate', 'Ascending');
        });
        it('ungroup a column', (done: Function) => {
            let actionComplete = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(0);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(1);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(0);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.ungroupColumn('EmployeeID');
        });
        it('clear sort', (done: Function) => {
            let actionComplete = (args: Object) => {
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(0);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.clearSorting();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Grouping set model test case and reorder => ', () => {
        let gridObj: Grid;
        let actionBegin: () => void;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    allowSorting: true,
                    allowPaging: true,
                    allowReordering: true,
                    groupSettings: { showDropArea: false, showToggleButton: true, showUngroupButton: true },
                    actionBegin: actionBegin,
                    actionComplete: actionComplete
                }, done);
        });
        it('check default group property rendering', () => {
            expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(1);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn').length).toBe(gridObj.columns.length);
        });
        it('disable Grouping', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(0);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn').length).toBe(0);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.allowGrouping = false;
            gridObj.dataBind();
        });
        it('enable Grouping', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(1);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn').length).toBe(gridObj.columns.length);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.allowGrouping = true;
            gridObj.dataBind();
        });
        it('group a column', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(1);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn.e-toggleungroup').length).toBe(1);
                expect(gridObj.element.querySelectorAll('.e-groupdroparea')[0].querySelectorAll('.e-ungroupbutton').length).toBe(1);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-ascending').length).toBe(1);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('EmployeeID');
        });
        it('reOrder the grouped column', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.getHeaderTable().querySelectorAll('.e-grptogglebtn.e-toggleungroup').length).toBe(1);
                expect(gridObj.element.querySelectorAll('.e-groupdroparea')[0].querySelectorAll('.e-ungroupbutton').length).toBe(1);
                expect(gridObj.getHeaderTable().querySelectorAll('.e-ascending').length).toBe(1);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-headercell')[5].children[0].innerHTML).toMatch('Employee ID');
                expect(gridObj.getContent().querySelectorAll('.e-row').length).toBe(12);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.reorderColumns('EmployeeID', 'ShipCountry');
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = actionComplete = null;
        });

    });
    //initial render with grouping
    describe('Grouping a column in default =>', () => {
        let gridObj: Grid;
        let actionBegin: () => void;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: { columns: ['EmployeeID'] },
                    allowSorting: true,
                    allowPaging: true,
                    allowFiltering: true,
                    actionBegin: actionBegin,
                    actionComplete: actionComplete
                }, done);
        });
        it('check default group property rendering', () => {
            expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(1);
            expect(gridObj.element.querySelectorAll('.e-groupdroparea')[0].children.length).toBe(1);
            expect(gridObj.element.querySelectorAll('.e-groupdroparea')[0].querySelectorAll('.e-ungroupbutton').length).toBe(1);
            expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(1);
            expect(gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell').length).toBe(2);
            expect(gridObj.getContent().querySelectorAll('.e-indentcell').length > 0).toBeTruthy()
            expect(gridObj.getContent().querySelectorAll('.e-rowcell')[0].innerHTML).toBe('10258');
            expect(gridObj.groupSettings.columns.length).toBe(1);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = actionComplete = null;
        });
    });
    //initial render with two columns grouped. 
    describe('Grouping two columns initial => ', () => {
        let gridObj: Grid;
        let actionBegin: () => void;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: { columns: ['EmployeeID', 'ShipCity'] },
                    allowSorting: true,
                    allowPaging: true,
                    actionBegin: actionBegin,
                    actionComplete: actionComplete
                }, done);
        });
        it('check default group property rendering', () => {
            expect(gridObj.element.querySelectorAll('.e-groupdroparea').length).toBe(1);
            expect(gridObj.element.querySelectorAll('.e-groupdroparea')[0].children.length).toBe(2);
            expect(gridObj.element.querySelectorAll('.e-groupdroparea')[0].querySelectorAll('.e-ungroupbutton').length).toBe(2);
            expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(2);
            expect(gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell').length).toBe(2);
            expect(gridObj.getContentTable().querySelectorAll('.e-indentcell').length > 0).toBeTruthy();
            expect(gridObj.groupSettings.columns.length).toBe(2);
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = actionComplete = null;
        });

    });

    // initially grouping and sort same column
    describe('Grouping and sorting same column and aria => ', () => {
        let gridObj: Grid;
        let actionBegin: () => void;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: { columns: ['EmployeeID'] },
                    sortSettings: { columns: [{ field: 'EmployeeID', direction: 'Ascending' }] },
                    allowSorting: true,
                    allowPaging: true,
                    actionBegin: actionBegin,
                    actionComplete: actionComplete
                }, done);
        });
        it('initial render testing', () => {
            expect(gridObj.groupSettings.columns.length).toBe(gridObj.sortSettings.columns.length);
            expect(gridObj.getHeaderContent().querySelectorAll('.e-sortnumber').length).toBe(0);
            expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(1);
        });
        it('check aria attribute', () => {
            let groupDropArea: Element = gridObj.element.querySelector('.e-groupdroparea');
            expect(groupDropArea.querySelector('.e-grouptext').hasAttribute('tabindex')).toBeTruthy();
            expect(groupDropArea.querySelector('.e-groupsort').hasAttribute('tabindex')).toBeTruthy();
            expect(groupDropArea.querySelector('.e-ungroupbutton').hasAttribute('tabindex')).toBeTruthy();
            expect(groupDropArea.querySelector('.e-groupsort').hasAttribute('aria-label')).toBeTruthy();
            expect(groupDropArea.querySelector('.e-ungroupbutton').hasAttribute('aria-label')).toBeTruthy();
            expect(gridObj.element.querySelector('.e-recordplusexpand').hasAttribute('tabindex')).toBeTruthy();
        });
        it('clear Grouping', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.sortSettings.columns.length).toBe(1);
                expect(gridObj.groupSettings.columns.length).toBe(0);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(1);
                expect(gridObj.getContent().querySelectorAll('tr').length).toBe(12);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.ungroupColumn('EmployeeID');
        });
        it('clear sorting', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.sortSettings.columns.length).toBe(0);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(0);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.clearSorting();
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = actionComplete = null;
        });

    });

    describe('Grouping remote data => ', () => {
        let gridObj: Grid;
        let old: (e: ReturnType) => Promise<Object> = Render.prototype.validateGroupRecords;
        let fetchSpy: any;
        beforeAll(async (done: Function) => {
            fetchSpy = spyOn(window, 'fetch');
            fetchSpy.and.returnValue(Promise.resolve({
                status: 200,
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                json: function () {
                    return Promise.resolve({ d: { results: filterData, __count: 100 } });
                }
            }));
    
            gridObj = createGrid(
                {
                    dataSource: new DataManager({ url: '/api/test' }),
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'OrderDate', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: { disablePageWiseAggregates: true, columns: ['EmployeeID', 'CustomerID'] },
                    allowPaging: true
                }, done);
    
            done();
        });
    
        it('check data', () => {
            expect(gridObj.groupSettings.columns.length).not.toBeNull();
        });
    
        afterAll(() => {
            fetchSpy.calls.reset();
            Render.prototype.validateGroupRecords = old;
            destroy(gridObj);
            gridObj = old = null;
        });
    });

    describe('Grouping column by format using setmodel => ', () => {
        let gridObj: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'OrderDate', headerText: 'Order Date', format: 'y', enableGroupByFormat: true, type: 'date' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    // groupSettings: { disablePageWiseAggregates: true, columns: ['OrderDate', 'ShipCountry'] },
                    allowPaging: true,
                    allowSorting: true
                }, done);
        });
        it('Single column group testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
                let content = gridObj.getContent().querySelectorAll('tr');
                let gHeader = gridObj.element.querySelectorAll('.e-groupheadercell');
                expect(grpHIndent.length).toBe(1);

                expect(content[0].querySelectorAll('.e-groupcaption').length).toBe(1);

                expect(gHeader.length).toBe(1);
                expect(gHeader[0].querySelectorAll('.e-grouptext').length).toBe(1);
                expect(gHeader[0].querySelectorAll('.e-grouptext')[0].textContent).toBe('Order Date');
                expect(gHeader[0].querySelectorAll('.e-groupsort').length).toBe(1);
                expect(gHeader[0].querySelectorAll('.e-groupsort')[0].classList.contains('e-ascending')).toBeTruthy();
                expect(gHeader[0].querySelectorAll('.e-ungroupbutton').length).toBe(1);

                expect(gridObj.groupSettings.columns.length).toBe(1);
                expect(gridObj.sortSettings.columns.length).toBe(1);


                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('OrderDate');
        });
        it('multi grouping with group by format', (done: Function) => {
            let actionComplete: any = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupcaption')[0].innerHTML.indexOf('Order Date: 1996 ') > -1).toBeTruthy();
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(2);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(2);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(2);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('EmployeeID');

        });
        it('sort a column with multi grouping', (done: Function) => {
            let actionComplete: any = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupcaption')[0].innerHTML.indexOf('Order Date: 1996 ') > -1).toBeTruthy();
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(2);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(3);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(2);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.sortColumn('OrderID', 'Ascending');
        });
        it('ungroup a column', (done: Function) => {
            let actionComplete: any = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupcaption')[0].innerHTML.indexOf('Order Date: 1996 ') > -1).toBeTruthy();
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(1);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(2);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(1);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.ungroupColumn('EmployeeID');
        });
        it('clear Grouping', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.groupSettings.columns.length).toBe(0);
                expect(gridObj.getContent().querySelectorAll('tr').length).toBe(12);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(1);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.ungroupColumn('OrderDate');
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionComplete = null;
        });
    });

    describe('Grouping remote data for group by format => ', () => {
        let gridObj: Grid;
        let old: (e: ReturnType) => Promise<Object> = Render.prototype.validateGroupRecords;
        let fetchSpy: any;
        beforeAll((done: Function) => {
            fetchSpy = spyOn(window, 'fetch');
            fetchSpy.and.returnValue(Promise.resolve({
                status: 200,
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                json: function () {
                    return Promise.resolve({ d: { results: filterData, __count: 100 } });
                }
            }));
    
            gridObj = createGrid(
                {
                    dataSource: new DataManager({ url: '/api/test' }),
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'OrderDate', headerText: 'Order Date', format: 'y', enableGroupByFormat: true, type: 'date' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: { disablePageWiseAggregates: true, columns: ['OrderDate', 'CustomerID'] },
                    allowPaging: true
                }, done);
        });
    
        it('check data', () => {
            expect(gridObj.groupSettings.columns.length).not.toBeNull();
        });
    
        afterAll(() => {
            fetchSpy.calls.reset();
            Render.prototype.validateGroupRecords = old;
            destroy(gridObj);
            gridObj = old = null;
        });
    });
    
    describe('Grouping column by format at initial settings => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight', format: 'C1', enableGroupByFormat: true, type: 'number' },
                    { field: 'OrderDate', headerText: 'Order Date', format: 'y', enableGroupByFormat: true, type: 'date' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: { disablePageWiseAggregates: true, columns: ['OrderDate', 'Freight'] },
                    allowPaging: true,
                    allowSorting: true
                }, done);
        });
        it('multi grouping with group by format at initial', (done: Function) => {
            let actionComplete: any = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupcaption')[0].getAttribute('aria-label').indexOf('Order Date: 1996 ') > -1).toBeTruthy();
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(3);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(3);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(3);
                done();
            };
            gridObj.groupModule.groupColumn('EmployeeID');
            gridObj.getColumnByField('OrderDate').type = 'undefined';
            gridObj.dataSource[0].OrderDate = new Date('07 07 1996 00:00:23');
            gridObj.actionComplete = actionComplete;
            gridObj.dataBind();
        });
        it('sort a column with multi grouping', (done: Function) => {
            let actionComplete: any = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupcaption')[0].getAttribute('aria-label').indexOf('Order Date: 1996 ') > -1).toBeTruthy();
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(3);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(4);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(3);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.getColumnByField('OrderDate').type = 'undefined';
            gridObj.dataSource[0].OrderDate = new Date('07 07 1996 00:01:23');
            gridObj.sortColumn('OrderID', 'Ascending');
            gridObj.dataBind();
        });
        it('ungroup a column', (done: Function) => {
            let actionComplete: any = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(2);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(3);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(2);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.ungroupColumn('EmployeeID');
            gridObj.getColumnByField('OrderDate').type = 'undefined';
            gridObj.dataSource[0].OrderDate = new Date('07 07 1996 00:00:20');
            gridObj.dataBind();
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
    describe('Grouping column by format at initial settings without column type declaration => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight', format: 'C1', enableGroupByFormat: true },
                    { field: 'OrderDate', headerText: 'Order Date', format: 'y', enableGroupByFormat: true },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: { disablePageWiseAggregates: true, columns: ['OrderDate', 'Freight'] },
                    allowPaging: true,
                    allowSorting: true
                }, done);
        });
        it('multi grouping with group by format at initial', (done: Function) => {
            let actionComplete: any = (args: Object) => {
                expect(gridObj.element.querySelectorAll('.e-groupcaption')[0].getAttribute('aria-label').indexOf('Order Date: 1996 ') > -1).toBeTruthy();
                expect(gridObj.element.querySelectorAll('.e-groupheadercell').length).toBe(3);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-ascending').length).toBe(3);
                expect(gridObj.getHeaderContent().querySelectorAll('.e-emptycell').length).toBe(3);
                done();
            };
            gridObj.groupModule.groupColumn('EmployeeID');
            gridObj.actionComplete = actionComplete;
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Grouping disablePageWiseAggregates with empty datasource => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: [],
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'OrderDate', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: { disablePageWiseAggregates: true, columns: ['OrderDate', 'ShipCountry'] },
                    allowPaging: true
                }, done);
        });
        it('check data length', () => {
            expect(gridObj.currentViewData.length).toBe(0);
        });
        it('EJ2-7165-complex data group', () => {
            expect((<any>gridObj.groupModule).getGHeaderCell('Name.FirstName')).toBeNull();
        });
        afterAll((done) => {
            destroy(gridObj);
            gridObj = null;
        });
    });
    describe('EJ2-6791-Groped content not renders properly , when grouping enabled throw set model => ', () => {
        let gridObj: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowSorting: true,
                    allowPaging: true,
                    allowReordering: true,
                    actionComplete: actionComplete
                }, done);
        });
        it('Grouping enabled throw set model', () => {
            gridObj.allowGrouping = true;
            gridObj.groupSettings.columns = ['EmployeeID'];
            let actionComplete: any = (args: Object) => {
                expect(gridObj.getContent().querySelectorAll('.e-recordplusexpand').length).toBe(7);
            };
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionComplete = null;
        });
    });

    describe('MT-870619 - After grouping the column, the focus is not working properly => ', () => {
        let gridObj: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0,5),
                    columns: [
                    { field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    allowPaging: true,
                    allowSorting: true
                }, done);
        });
        it('Single column group testing', (done: Function) => {
            actionComplete = (args?: Object): void => {
                expect(gridObj.element.querySelector('.e-gdiagonaldown').classList.contains('e-focus')).toBeTruthy();
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('ShipCountry');
        });
        it('clear Grouping', (done: Function) => {
            actionComplete = () => {
                expect(gridObj.groupSettings.columns.length).toBe(0);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.ungroupColumn('ShipCountry');
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionComplete = null;
        });
    });

    describe('Grouping functionalites with empty grid => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: [],
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    allowGrouping: true,
                    groupSettings: {columns:['OrderID']}
                }, done);
        });

        it('group drop area - header present testing', (done: Function) => {
            //Since no event for group complete on init, used set timeout
            setTimeout(function(){
                let dropArea: any = gridObj.element.querySelectorAll('.e-groupdroparea');
                expect(dropArea.length).toBe(1);
                let headerCell = dropArea[0].querySelectorAll('.e-groupheadercell')
                expect(headerCell.length).toBe(1);
                done();
            }, 100);            
        });
        it('group drop area - ungroup column', (done) => {
            gridObj.actionComplete = function (args) {
                if (args.requestType === 'ungrouping') {
                    expect(gridObj.groupSettings.columns.length).toBe(0);
                    let dropArea: any = gridObj.element.querySelectorAll('.e-groupdroparea');
                    let headerCell = dropArea[0].querySelectorAll('.e-groupheadercell')
                    expect(headerCell.length).toBe(0);
                    done();
                }
            }
            gridObj.ungroupColumn('OrderID')
        });

        it('group drop area - group column', (done) => {
            gridObj.actionComplete = function (args) {
                if (args.requestType === 'grouping') {
                    expect(gridObj.groupSettings.columns.length).toBe(1);
                    let dropArea: any = gridObj.element.querySelectorAll('.e-groupdroparea');
                    let headerCell = dropArea[0].querySelectorAll('.e-groupheadercell')
                    expect(headerCell.length).toBe(1);
                    done();
                }
            }
            gridObj.groupColumn('OrderID')
        });
        it('memory leak', () => {     
            profile.sample();
            let average: any = inMB(profile.averageChange)
            //Check average change in memory samples to not be over 10MB
            expect(average).toBeLessThan(10);
            let memory: any = inMB(getMemoryProfile())
            //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
            expect(memory).toBeLessThan(profile.samples[0] + 0.25);
        });   

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2-23852-Data row not renders properly , when grouping the all columns in grid => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    groupSettings: { showGroupedColumn: true, columns: ['OrderID', 'CustomerID', 'EmployeeID', 'Freight'] },
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' }],
                    allowSorting: true,
                    allowPaging: true,
                    allowGrouping: true
                }, done);
        });
        it('Check whether data row is rendered while we grouping all columns in grid', () => {
            expect(gridObj.element.querySelector('.e-row').querySelector('.e-rowcell').classList.contains('e-hide')).toBeFalsy();
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Group with disable pageWise aggregate', () => {
        let grid: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            grid = createGrid(
                {
                    allowGrouping: true,
                    groupSettings: { disablePageWiseAggregates: true },
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right'
                        },
                        { field: 'Verified', displayAsCheckBox: true, type: 'boolean' },
                        { field: 'Freight', format: 'C1' },
                        { field: 'OrderDate', format: 'yMd', type: 'datetime' },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right' }
                    ],
                    aggregates: [{
                        columns: [{
                            type: 'Average',
                            field: 'Freight',
                            groupFooterTemplate: '${Average}'
                        }]
                    },
                    {
                        columns: [{
                            type: ['Max'],
                            field: 'OrderDate',
                            format: 'yMd',
                            groupCaptionTemplate: '${Max}'
                        }]
                    }],
                    actionComplete: actionComplete
                },
                done
            );
        });
        
        it('checking aggreagates with grouping', (done: Function) => {
            let actionComplete: any =  function (args: any) {
                if (args.requestType === 'grouping') {
                    expect(grid.groupSettings.columns.length).toBe(1);
                done();
                }
            };
            grid.groupModule.groupColumn('Verified');
            grid.actionComplete = actionComplete;
        });

        afterAll(() => {
            destroy(grid);
            grid = actionComplete = null;
        });
    });
    //focus strategy script error
    // describe('expand and collapse on enter => ', () => {
    //     let gridObj: Grid;
    //     let actionBegin: () => void;
    //     let actionComplete: () => void;
    //     let columns: any;
    //     beforeAll((done: Function) => {
    //         gridObj = createGrid(
    //             {
    //                 dataSource: filterData,
    //                 columns: [{ field: 'OrderID', headerText: 'Order ID' },
    //                 { field: 'CustomerID', headerText: 'CustomerID' },
    //                 { field: 'EmployeeID', headerText: 'Employee ID' },
    //                 { field: 'Freight', headerText: 'Freight' },
    //                 { field: 'ShipCity', headerText: 'Ship City' },
    //                 { field: 'ShipCountry', headerText: 'Ship Country' }],
    //                 allowGrouping: true,
    //                 allowSelection: true,
    //                 groupSettings: { columns: ['OrderID'] },
    //                 allowPaging: true,
    //                 actionBegin: actionBegin,
    //                 actionComplete: actionComplete
    //             }, done);
    //     });

    //     it('collapse check', () => {
    //         gridObj.element.focus();
    //         gridObj.keyboardModule.keyAction(<any>{ action: 'enter', target: (<any>gridObj.contentModule.getTable()).rows[0].cells[0],
    //         preventDefault: () => {} });
    //     });
    //     it('expand check', () => {
    //         gridObj.keyboardModule.keyAction(<any>{ action: 'enter', target: (<any>gridObj.contentModule.getTable()).rows[0].cells[0],
    //         preventDefault: () => {} });
    //     });
    //     it('collapse check with edit', () => {
    //         gridObj.isEdit = true;
    //         gridObj.keyboardModule.keyAction(<any>{ action: 'enter', target: (<any>gridObj.contentModule.getTable()).rows[0].cells[0],
    //         preventDefault: () => {} });
    //         expect((<any>gridObj.contentModule.getTable()).rows[0].querySelector('.e-recordplusexpand')).not.toBeNull();
    //         gridObj.isEdit = false;
    //     });
    // afterAll((done) => {
    //     destroy(gridObj);
    //      setTimeout(function () {
    //          done();
    //      }, 1000);    
    //  });
    // });
     describe('EJ2-35816-Grouping with animation => ', () => {
        let gridObj: Grid;
        let actionComplete: () => void;
        let allowGroupReordering:string = 'allowGroupReordering';
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    groupSettings: { columns: ['OrderID', 'CustomerID'], allowReordering: true },
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' }],
                    allowSorting: true,
                    allowPaging: true,
                    allowGrouping: true,
                    actionComplete: actionComplete
                }, done);
        });
        it('Check whether grouped columns added in the droparea', (done) => {
            gridObj.actionComplete = (args?: Object): void => {
                expect(gridObj.element.querySelectorAll('.e-group-animator').length).toBe(3);
                expect(gridObj.element.querySelectorAll('.e-icon-drag').length).toBe(3);
                expect(gridObj.element.querySelectorAll('.e-group-animator .e-icon-next').length).toBe(3);
                done();
            }
            gridObj.groupColumn('EmployeeID');
        });
        it('Check whether ungroup is working', (done) => {
            gridObj.actionComplete = (args?: Object): void => {
                expect(gridObj.element.querySelectorAll('.e-group-animator').length).toBe(2);
                expect(gridObj.element.querySelectorAll('.e-icon-drag').length).toBe(2);
                expect(gridObj.element.querySelectorAll('.e-group-animator .e-icon-next').length).toBe(2);
                done();
            };
            gridObj.ungroupColumn('EmployeeID');
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

});

describe('EJ2-43460-Ungrouping arguments => ', () => {
    let gridObj: Grid;
    let actionBegin: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                columns: [{ field: 'OrderID', headerText: 'Order ID' },
                { field: 'CustomerID', headerText: 'CustomerID' },
                { field: 'EmployeeID', headerText: 'Employee ID' },
                { field: 'Freight', headerText: 'Freight' },
                { field: 'ShipCity', headerText: 'Ship City' }],
                allowSorting: true,
                allowPaging: true,
                allowGrouping: true,
                actionBegin: actionBegin,
            }, done);
    });
    it('Check whether column name is defined while grouping', (done) => {
        gridObj.actionBegin = (args?: any): void => {
            expect(args.columnName).toBeDefined();
            gridObj.actionBegin= null;
            done();
        }
        gridObj.groupModule.groupColumn('EmployeeID');
    });
    it('Check whether column name is defined while ungrouping', (done) => {
        gridObj.actionBegin = (args?: any): void => {
            expect(args.columnName).toBeDefined();
            gridObj.actionBegin= null;
            done();
        }
        gridObj.groupModule.ungroupColumn('EmployeeID');
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
        gridObj = actionBegin = null;
    });
});

describe('EJ2-44597-Sorting not removed when groupsettings column is changed => ', () => {
    let gridObj: Grid;
    let actionBegin: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                groupSettings: { showGroupedColumn: true , columns:['OrderID'] },
                sortSettings: {columns:[{field:'CustomerID', direction:'Descending'}]},
                columns: [{ field: 'OrderID', headerText: 'Order ID' },
                { field: 'CustomerID', headerText: 'CustomerID' },
                { field: 'EmployeeID', headerText: 'Employee ID' },
                { field: 'Freight', headerText: 'Freight' },
                { field: 'ShipCity', headerText: 'Ship City' }],
                allowSorting: true,
                allowPaging: true,
                allowGrouping: true,
                actionBegin: actionBegin,
            }, done);
    });
    it('Checking initial Grouping sorting columns', () => {
        expect(gridObj.sortSettings.columns.length).toBe(2);
    });
    it('Checking sorting columns after changing groupsetting columns', (done) => {
        gridObj.actionBegin = (args?: any): void => {
            expect(gridObj.sortSettings.columns.length).toBe(2);
            done();
        }
        gridObj.groupSettings = { showGroupedColumn:true, columns : ['EmployeeID']};
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
        gridObj = actionBegin = null;
    });
});

describe('EJ2-49314- Error hiding/showing columns => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData.slice(0,40),
                enableVirtualization: true,
                allowGrouping: true,
                height: 300,
                pageSettings : { pageSize: 100 },
                columns: [{ field: 'OrderID', headerText: 'Order ID' },
                { field: 'CustomerID', headerText: 'CustomerID' },
                { field: 'EmployeeID', headerText: 'Employee ID' },
                { field: 'Freight', headerText: 'Freight' },
                { field: 'ShipCity', headerText: 'Ship City' }],
            }, done);
    });
    it('Checking initial Grouping sorting columns', () => {
        expect(Object.keys(gridObj.currentViewData).length).toBe(40);
    });
    
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-49647- Column grouping with complex binding is broken when allowReordering is set => ', () => {
    let gridObj: Grid;
    let complexData: Object[] = [
        { OrderID: { ID: { ordID: 10248 } }, CustomerID: "VINET", Freight: 32.38, ShipCountry: "France" },
        { OrderID: { ID: { ordID: 10249 } }, CustomerID: "TOMSP", Freight: 11.61, ShipCountry: "Germany" },
        { OrderID: { ID: { ordID: 10250 } }, CustomerID: "HANAR", Freight: 65.83, ShipCountry: "Brazil" },
        { OrderID: { ID: { ordID: 10251 } }, CustomerID: "VICTE", Freight: 41.34, ShipCountry: "France" }];
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: complexData,
                allowPaging: true,
                allowGrouping: true,
                groupSettings: { allowReordering: true },
                columns: [
                    { headerText: 'OrderID', field: 'OrderID.ID.ordID', isPrimaryKey: true },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'Freight', field: 'Freight',  },
                    { headerText: 'ShipCountry', field: 'ShipCountry' },
                ],

            }, done);
    });
    it('Check the grouping complex field', (done: Function) => {
        let actionComplete: any = (args: any) => {
            expect(gridObj.element.querySelector('.e-groupdroparea div[ej-complexname=' + getComplexFieldID(args.columnName) + ']') ).toBeDefined();
            done();
        };
        gridObj.actionComplete = actionComplete;
        gridObj.groupModule.groupColumn('OrderID.ID.ordID');
    });
    
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Group caption 1st column template =>', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowGrouping: true,
                groupSettings: { showDropArea: true, columns: ['OrderID'] },
                columns: [
                    { field: 'Freight', headerText: 'Freight', width: 150, format: 'C2' },
                    { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                    { field: 'CustomerID', headerText: 'Customer ID', width: 150 },
                    { field: 'OrderDate', headerText: 'Order Date', width: 120, format: 'yMd' },
                    { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
                ],
                height: 290,
                aggregates: [{
                    columns: [{
                        type: 'Sum',
                        field: 'Freight',
                        format: 'C2',
                        groupFooterTemplate: 'Sum: ${Sum}'
                    }]
                },
                {
                    columns: [{
                        type: 'Max',
                        field: 'Freight',
                        format: 'C2',
                        groupCaptionTemplate: 'Max: ${Max}'
                    }]
                }]
            }, done);
    });

    it('check 1st column template', () => {
        expect(gridObj.getContent().querySelectorAll('.e-groupcaption')[0].innerHTML).toBe('Order ID: 10248 - 1 item   Max: $32.38');
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-62665 Collapse icon is read as expanded by NVDA Reader => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowGrouping: true,
                groupSettings: { columns: ['ShipCountry'] },
                columns: [
                    { headerText: 'OrderID', field: 'OrderID.ID.ordID', isPrimaryKey: true },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'Freight', field: 'Freight',  },
                    { headerText: 'ShipCountry', field: 'ShipCountry' },
                ],
            }, done);
    });
    it('Expand collapse icon check', () => {
       gridObj.groupModule.collapseAll();
       expect((gridObj.getContent().querySelectorAll('tr')[0].querySelector('td').firstElementChild).getAttribute('title')).toBe('Collapsed');
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-62134 Disabling expand and collapse support for infinite scrolling cache with grouping enabled grid. => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowGrouping: true,
                groupSettings: { columns: ['ShipCountry'] },
                infiniteScrollSettings: { enableCache: true },
                enableInfiniteScrolling: true,
                columns: [
                    { headerText: 'OrderID', field: 'OrderID.ID.ordID', isPrimaryKey: true },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'Freight', field: 'Freight',  },
                    { headerText: 'ShipCountry', field: 'ShipCountry' },
                ],
            }, done);
    });
    it('Expand collapse icon check', () => {
       expect(gridObj.getContent().querySelectorAll('tr')[0].querySelector('td').firstElementChild).toBe(null);
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-67363 - Bottom borderline is not shown when collapsing the last grouped row => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData.slice(0, 3),
                allowGrouping: true,
                groupSettings: { columns: ['CustomerID'] },
                height: 300,
                columns: [{ field: 'OrderID', headerText: 'Order ID' },
                { field: 'CustomerID', headerText: 'CustomerID' },
                { field: 'Freight', headerText: 'Freight' },
                { field: 'ShipCity', headerText: 'Ship City' }],
            }, done);
    });
    it('Checking last border in collapseAll method', () => {
        let capElem = gridObj.getContent().querySelectorAll('.e-groupcaptionrow');
        gridObj.groupModule.collapseAll();
        expect((capElem[2].children[0]).classList.contains('e-lastrowcell')).toBeTruthy();
        expect((capElem[2].children[1]).classList.contains('e-lastrowcell')).toBeTruthy();
    });
    
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Code Coverage - group by drag and drop simulate => ', () => {
    let gridObj: Grid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowPaging:true,
                allowSorting:true,
                allowGrouping:true,
                allowFiltering:true,
                allowReordering: true,
                actionComplete: actionComplete,
                groupSettings: { showToggleButton: true, allowReordering: true },
                sortSettings:{columns:[{field:"Freight",direction:'Ascending'},{field:"CustomerID",direction:'Ascending'}]},
                columns: [
                    { field: 'CustomerID' ,width:120, headerText:"Customer ID"},
                    { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                    { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry',width:130, headerText:"Ship Country" }
                ],
            }, done);
    });

    it('for coverage - 1', (done: Function) => {
        let actionComplete: any = (args: any) => {
            done();
        };
        gridObj.actionComplete = actionComplete;
        const dragHeaderElem: Element = gridObj.getHeaderContent().querySelectorAll('.e-headercell')[0];
        const dragColumn: any = gridObj.getColumnByIndex(0);
        (gridObj.headerModule as any).draggable.currentStateTarget = dragHeaderElem;
        (gridObj.headerModule as any).helper({
            element: dragHeaderElem,
            sender: { target: dragHeaderElem }
        });
        const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-headerclone');
        (gridObj.groupModule as any).columnDragStart({
            column: dragColumn,
            target: dragHeaderElem,
            event: { target: dragHeaderElem }
        });
        const dropArea: Element = gridObj.groupModule.element;
        (gridObj.groupModule as any).columnDrag({
            column: dragColumn,
            target: dropArea,
            event: { target: dropArea }
        });
        (gridObj.groupModule as any).drop({
            droppedElement: dropClone,
            target: dropArea,
            event: { target: dropArea }
        });
    });

    it('for coverage - 2', (done: Function) => {
        let actionComplete: any = (args: any) => {
            done();
        };
        gridObj.actionComplete = actionComplete;
        const dragHeaderElem: Element = gridObj.getHeaderContent().querySelectorAll('.e-headercell')[1];
        const dragColumn: any = gridObj.getColumnByIndex(1);
        (gridObj.headerModule as any).draggable.currentStateTarget = dragHeaderElem;
        (gridObj.headerModule as any).helper({
            element: dragHeaderElem,
            sender: { target: dragHeaderElem }
        });
        const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-headerclone');
        (gridObj.groupModule as any).columnDragStart({
            column: dragColumn,
            target: dragHeaderElem.children[0],
            event: { target: dragHeaderElem.children[0] }
        });
        const dropArea: Element = gridObj.groupModule.element;
        (gridObj.groupModule as any).columnDrag({
            column: dragColumn,
            target: gridObj.getContentTable(),// recent change => dropArea
            event: { target: dropArea }
        });
        (gridObj.groupModule as any).drop({
            droppedElement: dropClone,
            target: dropArea,
            event: { target: dropArea }
        });
    });

    it('for coverage - 3', (done: Function) => {
        let actionComplete: any = (args: any) => {
            done();
        };
        gridObj.actionComplete = actionComplete;
        let dragGroupedElem: Element = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0].querySelector('.e-drag');
        let dropGroupedElem: Element = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[1];
        (gridObj.groupModule as any).helper({
            element: dragGroupedElem,
            sender: { target: dragGroupedElem }
        });
        const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-gdclone');
        (gridObj.groupModule as any).dragStart({
            dragElement: dropClone,
            element: dragGroupedElem,
            target: dragGroupedElem,
            event: { target: dragGroupedElem }
        });
        (gridObj.groupModule as any).drag({
            element: gridObj.groupModule.element,
            target: dropGroupedElem,
            event: { target: dropGroupedElem }
        });
        dragGroupedElem = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0];
        dropGroupedElem = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[1];
        (gridObj.groupModule as any).drag({
            element: gridObj.groupModule.element,
            target: dragGroupedElem,
            event: { target: dragGroupedElem }
        });
        dragGroupedElem = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0];
        dropGroupedElem = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[1];
        (gridObj.groupModule as any).drag({
            element: gridObj.groupModule.element,
            target: dropGroupedElem,
            event: { target: dropGroupedElem }
        });
        dragGroupedElem = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0];
        dropGroupedElem = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[1];
        (gridObj.groupModule as any).dragStop({
            element: gridObj.groupModule.element,
            helper: dropClone,
            target: dropGroupedElem,
            event: { target: dropGroupedElem }
        });
    });

    it('for coverage - 4', () => {
        const dragGroupedElem: Element = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0].querySelector('.e-drag');
        (gridObj.groupModule as any).helper({
            element: dragGroupedElem,
            sender: { target: dragGroupedElem }
        });
        const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-gdclone');
        dropClone.setAttribute('action', 'grouping');
        (gridObj.groupModule as any).dragStart({
            dragElement: dropClone,
            element: dragGroupedElem,
            target: dragGroupedElem,
            event: { target: dragGroupedElem }
        });
        (gridObj.groupModule as any).drag({
            element: gridObj.groupModule.element,
            target: gridObj.getHeaderContent().querySelectorAll('.e-headercell')[2],
            event: { target: gridObj.getHeaderContent().querySelectorAll('.e-headercell')[2] }
        });
        (gridObj.groupModule as any).columnDrop({
            droppedElement: dropClone,
            target: gridObj.getHeaderContent().querySelectorAll('.e-headercell')[2]
        });
    });

    it('for coverage - 5', () => {
        const dragHeaderElem: Element = gridObj.getHeaderContent().querySelectorAll('.e-headercell')[3];
        const dragColumn: any = gridObj.getColumnByIndex(3);
        (gridObj.headerModule as any).draggable.currentStateTarget = dragHeaderElem;
        (gridObj.headerModule as any).helper({
            element: dragHeaderElem,
            sender: { target: dragHeaderElem }
        });
        const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-headerclone');
        (gridObj.groupModule as any).columnDragStart({
            column: dragColumn,
            target: dragHeaderElem,
            event: { target: dragHeaderElem }
        });
        // for coverage
        gridObj.groupSettings.allowReordering = false;
        const dropArea: Element = gridObj.groupModule.element;
        (gridObj.groupModule as any).columnDrag({
            column: dragColumn,
            target: gridObj.getContentTable(),
            event: { target: dropArea }
        });
        (gridObj.groupModule as any).drop({
            droppedElement: dropClone,
            target: dropArea,
            event: { target: dropArea }
        });
        gridObj.groupSettings.showGroupedColumn = true;
        gridObj.groupSettings.enableLazyLoading = true;
    });

    it('for coverage - 6', () => {
        let dragGroupedElem: Element = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0];
        (gridObj.groupModule as any).helper({
            element: dragGroupedElem,
            sender: { target: dragGroupedElem }
        });
        const dropClone: Element = document.querySelector('.e-cloneproperties.e-dragclone.e-gdclone');
        (gridObj.groupModule as any).dragStart({
            dragElement: dropClone,
            element: dragGroupedElem,
            target: dragGroupedElem,
            event: { target: dragGroupedElem }
        });
        (gridObj.groupModule as any).drag({
            element: gridObj.groupModule.element,
            target: gridObj.groupModule.element,
            event: { target: gridObj.groupModule.element }
        });
        (gridObj.groupModule as any).dragStop({
            element: gridObj.groupModule.element,
            helper: dropClone,
            target: gridObj.groupModule.element,
            event: { target: gridObj.groupModule.element }
        });
    });
    
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Code Coverage - show grouped column edit grouped row reorder and Key board interaction => ', () => {
    let gridObj: Grid;
    let preventDefault: Function = new Function();
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowPaging:true,
                allowGrouping:true,
                groupSettings: { showGroupedColumn: true, allowReordering: true, columns: ['CustomerID', 'OrderDate'] },
                columns: [
                    { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                    { field: 'CustomerID' ,width:120, headerText:"Customer ID"},
                    { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry',width:130, headerText:"Ship Country" }
                ],
            }, done);
    });
    it('for coverage - 1', () => {
        const dragRowObject: any = gridObj.getRowObjectFromUID(gridObj.getRowByIndex(0).getAttribute('data-uid'));
        const dropRowObject: any = gridObj.getRowObjectFromUID(gridObj.getRowByIndex(1).getAttribute('data-uid'));
        gridObj.groupModule.groupedRowReorder(dragRowObject, dropRowObject);
        gridObj.groupModule.updateExpand({ uid: gridObj.getRowByIndex(1).getAttribute('data-uid'), isExpand: true });
    });

    it('for coverage - 2', () => {
        const target: HTMLElement = gridObj.groupModule.element;
        const innerTarget: HTMLCollection = target.querySelectorAll('.e-groupheadercell')[0].children[0].children;
        const expandCollapseTarget: Element = gridObj.getContentTable().querySelector('tr.e-groupcaptionrow td.e-recordplusexpand a');
        const groupHeaderElem: Element = gridObj.getHeaderContent().querySelectorAll('.e-headercell')[2];
        (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('tab', innerTarget[2]));
        (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('shiftTab', innerTarget[3]));
        (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('enter', innerTarget[2]));
        (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('enter', innerTarget[3]));
        (<any>gridObj.focusModule).currentInfo.elementToFocus = expandCollapseTarget;
        (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('enter', expandCollapseTarget));
        (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('enter', expandCollapseTarget));
        (<any>gridObj.focusModule).currentInfo.element = groupHeaderElem;
        (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('ctrlSpace', groupHeaderElem));
        (<any>gridObj.groupModule).keyPressHandler(getKeyActionObj('ctrlSpace', groupHeaderElem));
        (<any>gridObj.groupModule).clickHandler({ target: expandCollapseTarget, preventDefault });
        (<any>gridObj.groupModule).clickHandler({ target: expandCollapseTarget, preventDefault });
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-867832-groupSettings not updated properly when cancelling group action => ', () => {
    let gridObj: Grid;
    let actionBegin: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                groupSettings: { showGroupedColumn: true , columns:['OrderID'] },
                columns: [{ field: 'OrderID', headerText: 'Order ID' },
                { field: 'CustomerID', headerText: 'CustomerID' },
                { field: 'EmployeeID', headerText: 'Employee ID' },
                { field: 'Freight', headerText: 'Freight' },
                { field: 'ShipCity', headerText: 'Ship City' }],
                allowSorting: true,
                allowPaging: true,
                allowGrouping: true,
                actionBegin: function (args?: any): void {
                    args.cancel = true;
                    done();
                },
            }, done);
    });
    it('Checking initial Grouping columns', () => {
        expect(gridObj.groupSettings.columns.length).toBe(1);
    });
    it('Checking groupsetting columns after setting args.cancel as true', () => {
        gridObj.groupModule.groupColumn('ShipCity');
        expect(gridObj.groupSettings.columns.length).toBe(1);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
        gridObj = actionBegin = null;
    });
});

describe('EJ2-881066-Refreshing aggregateModule throws script error with Grouping => ', () => {
    let gridObj: Grid;
    let actionBegin: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                columns: [
                    {
                        field: 'OrderID', isPrimaryKey: true, headerText: 'Order ID', textAlign: 'Right',
                        validationRules: { required: true, number: true }, width: 120
                    },
                    {
                        field: 'Freight', headerText: 'Freight', textAlign: 'Right', editType: 'numericedit',
                        width: 120, format: 'C2', validationRules: { required: true, min: 0, number: true }
                    },
                    {
                        field: 'OrderDate', headerText: 'Order Date', editType: 'datepickeredit', format: 'yMd',
                        width: 170
                    },
                    {
                        field: 'ShipCountry', headerText: 'Ship Country', editType: 'dropdownedit', width: 150,
                        edit: { params: { popupHeight: '300px' } }
                    }
                ],
                allowPaging: true,
                allowGrouping: true,
                groupSettings: { columns: ['ShipCity'] },
                aggregates: [
                    {
                      columns: [
                        {
                          field: 'Freight',
                          columnName: 'Freight',
                          type: 'Custom',
                          format: 'C2',
                          footerTemplate: 'Sum: ${Custom}',
                          customAggregate() {
                            const selectedRecords = gridObj.getSelectedRecords();
                            return (
                              selectedRecords.length > 0 ? selectedRecords : gridObj.dataSource as any
                            ).reduce((sum?: any, rec?: any) => sum + rec['Freight'], 0);
                          },
                        },
                      ],
                    },
                  ]
            }, done);
    });
    it('Checking script error occurs when refresh aggragtes', () => {
        (gridObj.aggregateModule as any).refresh();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-904971-Issue with Initial Grouping and Sorting in the Grid  => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                groupSettings: { columns:['OrderID','CustomerID'] },
                sortSettings: { columns: [{ field: "OrderID", direction: 'Descending' }] },
                columns: [{ field: 'OrderID', headerText: 'Order ID' },
                { field: 'CustomerID', headerText: 'CustomerID' },
                { field: 'EmployeeID', headerText: 'Employee ID' },
                { field: 'Freight', headerText: 'Freight' },
                { field: 'ShipCity', headerText: 'Ship City' }],
                allowSorting: true,
                allowPaging: true,
                allowGrouping: true,
            }, done);
    });
    it('Checking Sort direction of initial sorting of Grouped column', () => {
        expect(gridObj.sortSettings.columns[1].field).toBe('OrderID');
        expect(gridObj.sortSettings.columns[1].direction).toBe('Descending');
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

// used for code coverage
describe('Code Coverage => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowPaging:true,
                allowGrouping:true,
                groupSettings: { columns: ['CustomerID'] },
                columns: [
                    { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                    { field: 'CustomerID' ,width:120, headerText:"Customer ID"},
                    { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                ],
            }, done);
    });
    it('grid file coverage', function () {
        gridObj.showResponsiveCustomFilter();
        gridObj.showResponsiveCustomSort();
        gridObj.showResponsiveCustomColumnChooser();
        gridObj.showAdaptiveFilterDialog();
        gridObj.showAdaptiveSortDialog();
    });
    it('refresh grid', function(done: Function){
        gridObj['isExpanded'] = false;
        let dataBound = () => {
            gridObj.dataBound = null;
            done();
        };
        gridObj.dataBound = dataBound;
        gridObj.refresh();
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});


// used for code coverage
describe('Code Coverage => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowPaging:true,
                allowGrouping:true,
                groupSettings: { columns: ['CustomerID'] },
                columns: [
                    { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                    { field: 'CustomerID' ,width:120, headerText:"Customer ID"},
                    { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                ],
            }, done);
    });

    it('Grouped refresh row checked', () => {
        (gridObj.groupModule as any).groupGenerator.refreshRows(gridObj.getRowsObject())
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });


    describe('Code Coverage with grouping=> ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    enableColumnVirtualization: true,
                    height: 400,
                    allowGrouping: true,
                    groupSettings: { columns: ['CustomerID'] },
                    columns: [
                        { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                        { field: 'CustomerID' ,width:120, minWidth:'100', headerText:"Customer ID"},
                        { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                    ],
                }, done);
        });

    
        it('Grouped refresh row checked', () => {
            (gridObj as any).inViewIndexes = [7,8,9,10];
            (gridObj.groupModule as any).groupGenerator.refreshRows(gridObj.getRowsObject());
            gridObj.widthService.setWidthToColumns();
        });
        it('refresh generateDataRows group', () =>{
            (gridObj as any).inViewIndexes = [7,8,9,10];
            (gridObj.groupModule as any).groupGenerator.generateDataRows(gridObj.dataSource, 1);
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage => ', () => {
        let gridObj: Grid;
        let e: any;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    toolbar: ['Add', 'Edit'],
                    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true },
                    columns: [
                        { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                        { field: 'CustomerID' ,width:120, minWidth:'100', headerText:"Customer ID"},
                        { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                    ],
                }, done);
        });

    
        it('Focus onKeyPress coverage - 1', () => {
            e = { target: gridObj.element.querySelector('.e-groupdroparea'), preventDefault: new Function(), action:'shiftTab' };
            gridObj.element.classList.add('e-childgrid');
            (gridObj as any).focusModule.onKeyPress(e);
            e.target = gridObj.element.querySelector('.e-toolbar-item');
            (gridObj as any).focusModule.onKeyPress(e);
            gridObj.groupSettings.showDropArea = false;
            (gridObj as any).focusModule.onKeyPress(e);
            gridObj.groupSettings.showDropArea = true;
            e.target = gridObj.element;
            e.action = 'tab';
            (gridObj as any).focusModule.onKeyPress(e);
            e.target = gridObj.element.querySelector('.e-groupdroparea');
            (gridObj as any).focusModule.onKeyPress(e);
        });

        it('Focus onKeyPress coverage - 1', () => {
            gridObj.groupSettings.showDropArea = false;
            e.target = gridObj.element.querySelector('.e-toolbar');
            (gridObj as any).focusModule.onKeyPress(e);
            gridObj.toolbar = null;
            e.target = gridObj.element;
            (gridObj as any).focusModule.onKeyPress(e);

        });


        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage => ', () => {
        let gridObj: Grid;
        let e: any;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    toolbar: ['Add', 'Edit'],
                    groupSettings: { columns: ['ProductID'] },
                    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true },
                    columns: [
                        { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                        { field: 'CustomerID' ,width:120, minWidth:'100', headerText:"Customer ID"},
                        { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                    ],
                }, done);
        });

        it('Focus onKeyPress coverage - 3', () => {
            e = { target: gridObj.element.querySelector('.e-groupdroparea'), preventDefault: new Function(), action:'tab' };
            (gridObj as any).focusModule.onKeyPress(e);
            e.action = 'shiftTab';
            e.target = gridObj.element.querySelector('.e-toolbar-item');
        });

        it('Focus focusOutFromHeader coverage - 4', () => {
            (gridObj as any).focusModule.focusOutFromHeader(e);
            gridObj.toolbar = null;
            (gridObj as any).focusModule.focusOutFromHeader(e);
            gridObj.element.classList.add('e-childgrid');
            gridObj.groupSettings.showDropArea = false;
            (gridObj as any).focusModule.focusOutFromHeader(e);

        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - 1=> ', () => {
        let gridObj: Grid;
        let e: any;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    toolbar: ['Add', 'Edit'],
                    groupSettings: { columns: ['CustomerID'] },
                    columns: [
                        { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                        { field: 'CustomerID' ,width:120, minWidth:'100', headerText:"Customer ID"},
                        { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                    ],
                    aggregates: [{
                        columns: [{
                            type: 'Sum',
                            field: 'Freight',
                            format: 'C2',
                        }]
                    },
                    {
                        columns: [{
                            type: 'Average',
                            field: 'Freight',
                            format: 'C2',
                        }]
                    }]
                }, done);
        });

    
        it('Focus skipOn coverage - 3', () => {
            e = { target: gridObj.element.querySelector('.e-toolbar-item'), preventDefault: new Function(), action:'tab' };
            (gridObj as any).focusModule.skipOn(e);
            e.action = 'tab';
            (gridObj as any).focusModule.skipOn(e);
            e.target = gridObj.element.querySelector('.e-groupheadercell');
            (gridObj as any).focusModule.skipOn(e);
        });

        it('renderer resetTemplates  coverage - 3', () => {
            gridObj.renderModule.resetTemplates();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('892984 - Scroll with frozen columns and aggregations not work as expected => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    frozenColumns: 2,
                    groupSettings: { columns: ['CustomerID'] },
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width:100, headerText:"Order ID"},
                        { field: 'CustomerID', width:120, headerText:"Customer ID"},
                        { field: 'Freight', textAlign: 'Right', width:110 ,format:'C2',headerText:"Freight"},
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right', editType: 'datepickeredit' },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 150, editType: 'dropdownedit' },
                    ],
                    aggregates: [{
                        columns: [{
                            type: 'Sum',
                            field: 'Freight',
                            format: 'C2',
                            groupCaptionTemplate: 'Sum: ${Sum}'
                        }]
                    }]
                }, done);
        });

        it('check groupcaption template class name', () => {
            expect(gridObj.getContent().querySelectorAll('.e-groupcaption')[0].classList.contains('e-freezeleftborder')).toBeTruthy();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2-907737 - Height 100% is not working when dynamically changing properties', () => {
        let gridObj: Grid;
        let contentHeight: string;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 1),
                    allowGrouping: true,
                    groupSettings: { columns: ['CustomerID'] },
                    height: '100%',
                    width: 200,
                    columns: [{ field: 'OrderID', headerText: 'Order ID', width: 180 },
                    { field: 'CustomerID', headerText: 'Customer Full Name', width: 180 },
                    { field: 'ShipCity', headerText: 'Customer Ship City', width: 180 },
                    { field: 'Freight', width: 200 }],
                }, done);
        });
        it('Get the initial height', () => {
            contentHeight = (gridObj.element.querySelector('.e-gridcontent') as HTMLElement).style.height;
            expect(contentHeight).not.toBeUndefined();
        });
        it('remove grouping', (done: Function) => {
            actionComplete = () => {
                let newHeight: string = (gridObj.element.querySelector('.e-gridcontent') as HTMLElement).style.height;
                expect(contentHeight).not.toEqual(newHeight);
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.ungroupColumn('CustomerID');
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = contentHeight = actionComplete = null;
        });
    });

    describe('Code Coverage - 2 => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    enableVirtualization: true,
                    height: 400,
                    groupSettings: { columns: ['CustomerID'] },
                    columns: [
                        { field: 'OrderID' ,textAlign: 'Right',width:100,headerText:"Order ID"},
                        { field: 'CustomerID' ,width:120, minWidth:'100', headerText:"Customer ID"},
                        { field: 'Freight',textAlign: 'Right',width:110 ,format:'C2',headerText:"Freight"},
                    ],
                }, done);
        });



        it('vertical scroll in down direction', (done: Function) => {
            (gridObj as any).contentModule.droppableDestroy();
            (gridObj as any).contentModule.setRowsInLazyGroup();
            (gridObj as any).contentModule.getCurrentBlockInfiniteRecords();
            (<HTMLElement>gridObj.getContent().firstChild).scrollTop = 700;
            setTimeout(done, 200);
        });

        it('vertical scroll in down 1 direction', (done: Function) => {
            (<HTMLElement>gridObj.getContent().firstChild).scrollTop = 200000;
            setTimeout(done, 200);
        });

        it('vertical scroll in up direction', (done: Function) => {
            (<HTMLElement>gridObj.getContent().firstChild).scrollTop = 200;
            setTimeout(done, 200);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 10),
                    allowGrouping: true,
                    allowSorting: true,
                    height: 400,
                    groupSettings: { columns: ['CustomerID'], allowReordering: true },
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                }, done);
        });

        it('Click handler for text in descending', () => {
            (gridObj.groupModule.element.querySelector('.e-grouptext') as HTMLElement).click();
        });

        it('Click handler for sort', () => {
            (gridObj.groupModule.element.querySelector('.e-groupsort') as HTMLElement).click();
        });

        it('Group helper', () => {
            (gridObj.groupModule as any).helper({
                sender: { target: createElement('div') }
            });
        });

        it('Group drag stop 1', () => {
            let dragGroupedElem: Element = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0].querySelector('.e-drag');
            (gridObj.groupModule as any).helper({
                element: dragGroupedElem,
                sender: { target: dragGroupedElem }
            });
            const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-gdclone');
            (gridObj.groupModule as any).dragStop({
                helper: dropClone,
                target: gridObj.getHeaderContent(),
            });
        });

        it('Group drag stop 2', () => {
            let dragGroupedElem: Element = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0].querySelector('.e-drag');
            (gridObj.groupModule as any).helper({
                element: dragGroupedElem,
                sender: { target: dragGroupedElem }
            });
            const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-gdclone');
            (gridObj.groupModule as any).dragStop({
                helper: dropClone,
                target: gridObj.element,
            });
        });

        it('Group drag stop 3', () => {
            let dragGroupedElem: Element = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0].querySelector('.e-drag');
            (gridObj.groupModule as any).helper({
                element: dragGroupedElem,
                sender: { target: dragGroupedElem }
            });
            const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-gdclone');
            dropClone.setAttribute('e-mappinguid', gridObj.getColumns()[0].uid);
            (gridObj.groupModule as any).dragStop({
                helper: dropClone,
                target: createElement('div'),
            });
        });

        it('Group drag stop 4', () => {
            let dragGroupedElem: Element = gridObj.groupModule.element.querySelectorAll('.e-groupheadercell')[0].querySelector('.e-drag');
            (gridObj.groupModule as any).helper({
                element: dragGroupedElem,
                sender: { target: dragGroupedElem }
            });
            const dropClone: HTMLElement = document.querySelector('.e-cloneproperties.e-dragclone.e-gdclone');
            (gridObj.groupModule as any).dragStop({
                helper: dropClone,
                target: createElement('div'),
            });
        });

        it('destroy', () => {
            gridObj.destroy();
            gridObj.groupModule.addEventListener();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - expandCollapseRows => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 10),
                    allowGrouping: true,
                    allowSorting: true,
                    height: 400,
                    groupSettings: { columns: ['CustomerID'] },
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                    childGrid: {
                        dataSource: employeeSelectData,
                        queryString: 'EmployeeID',
                        allowPaging: true,
                        columns: [
                            { field: 'FirstName', headerText: 'First Name', width: 120 },
                            { field: 'Region', headerText: 'Region', width: 120 },
                        ],
                    }
                }, done);
        });

        it('Case 1', () => {
            (gridObj.element.querySelector('.e-detailrowcollapse') as HTMLElement).click();
        });

        it('Case 2', () => {
            (gridObj.element.querySelector('.e-recordplusexpand') as HTMLElement).click();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group enableInfiniteScrolling childGrid => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 10),
                    allowGrouping: true,
                    allowSorting: true,
                    height: 400,
                    groupSettings: { columns: ['CustomerID'] },
                    enableInfiniteScrolling: true,
                    infiniteScrollSettings: { enableCache: true },
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                    childGrid: {
                        dataSource: employeeSelectData,
                        queryString: 'EmployeeID',
                        allowPaging: true,
                        columns: [
                            { field: 'FirstName', headerText: 'First Name', width: 120 },
                            { field: 'Region', headerText: 'Region', width: 120 },
                        ],
                    }
                }, done);
        });

        it('Case 1', () => {
            (gridObj.element.querySelector('.e-detailrowcollapse') as HTMLElement).click();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - enableInfiniteScrolling expandCollapseRows => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 10),
                    allowGrouping: true,
                    allowSorting: true,
                    height: 400,
                    groupSettings: { columns: ['CustomerID'] },
                    enableInfiniteScrolling: true,
                    infiniteScrollSettings: { enableCache: true },
                    editSettings: {allowAdding: true},
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ]
                }, done);
        });

        it('Case 1', () => {
            gridObj.addRecord();
        });

        it('Case 2', () => {
            const expand = gridObj.element.querySelector('.e-recordplusexpand');
            const arrow = createElement('div');
            arrow.classList.add('e-icon-gdownarrow');
            expand.append(arrow);
            (gridObj.element.querySelector('.e-recordplusexpand') as HTMLElement).click();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - expandCollapseRows showAddNewRow Top => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 10),
                    allowGrouping: true,
                    allowSorting: true,
                    height: 400,
                    groupSettings: { columns: ['CustomerID'] },
                    editSettings: { allowAdding: true, showAddNewRow: true, newRowPosition: 'Top' },
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                }, done);
        });

        it('Case 1', () => {
            (gridObj.element.querySelector('.e-recordplusexpand') as HTMLElement).click();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - expandCollapseRows showAddNewRow Bottom => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 10),
                    allowGrouping: true,
                    allowSorting: true,
                    height: 400,
                    groupSettings: { columns: ['CustomerID'] },
                    editSettings: { allowAdding: true, showAddNewRow: true, newRowPosition: 'Bottom' },
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                }, done);
        });

        it('Case 1', () => {
            (gridObj.element.querySelector('.e-recordplusexpand') as HTMLElement).click();
        });

        it('Case 2', () => {
            gridObj.getContentTable().querySelector('tbody').lastElementChild.classList.remove('e-addedrow');
            (gridObj.element.querySelector('.e-recordplusexpand') as HTMLElement).click();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - addLabel => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 10),
                    allowGrouping: true,
                    allowSorting: true,
                    height: 400,
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                }, done);
        });

        it('Case 1', () => {
            (gridObj.groupModule as any).addLabel();
        });

        it('columnDragStart', () => {
            const cell: HTMLElement = gridObj.getHeaderTable().querySelector('.e-headercell');
            cell.classList.add('e-stackedheadercell');
            (gridObj.groupModule as any).columnDragStart({ target: cell });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - expandCollapseRows enableVirtualization => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    allowSorting: true,
                    enableVirtualization: true,
                    groupSettings: { columns: ['CustomerID'] },
                    height: 400,
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                }, done);
        });

        it('Case 1', () => {
            (gridObj.element.querySelector('.e-recordplusexpand') as HTMLElement).click();
        });

        it('Case 2', () => {
            (gridObj.element.querySelector('.e-recordpluscollapse') as HTMLElement).click();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - Group Aggregates enableInfiniteScrolling => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    enableInfiniteScrolling: true,
                    groupSettings: { showGroupedColumn: true, allowReordering: true, columns: ['CustomerID', 'OrderDate'] },
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City' },
                        { field: 'ShipCountry', width: 130, headerText: "Ship Country" }
                    ],
                }, done);
        });

        it('for coverage - 1', () => {
            const dragRowObject: any = gridObj.getRowObjectFromUID(gridObj.getRowByIndex(0).getAttribute('data-uid'));
            const dropRowObject: any = gridObj.getRowObjectFromUID(gridObj.getRowByIndex(1).getAttribute('data-uid'));
            gridObj.groupModule.groupedRowReorder(dragRowObject, dropRowObject);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - React => ', () => {
        let gridObj: Grid;
        let preventDefault: Function = new Function();
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    groupSettings: { showGroupedColumn: true, allowReordering: true, columns: ['CustomerID'] },
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                }, done);
        });

        it('for coverage - 1', () => {
            (gridObj.groupModule as any).addOrRemoveFocus({ target: gridObj.element });
        });

        it('for coverage - 2', () => {
            const element = gridObj.getContentTable().querySelector('.e-icon-gdownarrow');
            (gridObj.groupModule as any).auxilaryclickHandler({ target: element, button: 1, preventDefault });
        });

        it('for coverage - 3', () => {
            gridObj.isReact = true;
            (gridObj.groupModule as any).onGroupAggregates({ OrderID: 10248, CustomerID: 'GG', Freight: 1 });
        });

        it('for coverage - 4', () => {
            (gridObj.groupModule as any).destroyRefreshGroupCaptionFooterTemplate();
        });

        it('for coverage - 5', () => {
            (gridObj.groupModule as any).updateLazyLoadGroupAggregates();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Group - keyPressHandler => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    allowSorting: true,
                    groupSettings: { columns: ['CustomerID'] },
                    height: 400,
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                }, done);
        });

        it('Case 1', () => {
            (gridObj.groupModule as any).keyPressHandler({ target: gridObj.groupModule.element.querySelector('.e-ungroupbutton'), action: 'tab' });
        });

        it('Case 2', () => {
            gridObj.groupModule.render();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2-911894: Browser automatically scrolls to grid when rendered with groupSettings. => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowGrouping: true,
                    groupSettings: { columns: ['CustomerID'] },
                    height: 400,
                    columns: [
                        { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                        { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                        { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    ],
                }, done);
        });

        it('Active element testing', () => {
            const activeElementClass = document.activeElement.className;
            expect(activeElementClass.includes('e-icon-gdownarrow')).toBe(false);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2-917361: Grid displays empty state when grouped column contains null values with aggregate and infinite scrolling enabled. => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                dataSource: filterData, 
                allowSorting: true,
                enableInfiniteScrolling: true,
                pageSettings: { pageSize: 5 },
                allowGrouping:true,
                groupSettings: {columns: ['CustomerID1'],
                showDropArea: false,
                disablePageWiseAggregates: true,
                allowReordering: false,showGroupedColumn:true,},
                height:100,
                columns: [
                    {
                        field: 'OrderID', isPrimaryKey: true, headerText: 'Order ID', textAlign: 'Right',
                        validationRules: { required: true, number: true }, width: 140
                    },
                    {
                        field: 'CustomerID1', headerText: 'Customer ID', type: 'string',
                        validationRules: { required: true }, width: 140
                    },
                    {
                        field: 'Freight', headerText: 'Freight', textAlign: 'Right', editType: 'numericedit',
                        width: 140, format: 'C2', validationRules: { required: true }
                    },
                ],
                aggregates: [{
                    columns: [ {
                        type: 'Sum',
                        field: 'Freight',
                        format: 'C2',
                        footerTemplate: 'Sum : ${Sum}'
                    },
                    {
                        type: 'Sum',
                        field: 'Freight',
                        format: 'C2',
                        groupFooterTemplate: 'Sum : ${Sum}'
                    },
                    {
                        type: 'Average',
                        field: 'Freight',
                        format: 'C2',
                        groupCaptionTemplate: 'Average: ${Average}'
                    }]
                }],
        }, done);
        });

        it('Check the record is rendered testing.', () => {
            expect(gridObj.getContent().querySelectorAll('.e-row').length).toBeTruthy();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

});

describe('EJ2-920968: The browser automatically scrolls to the grid when perform grouping programmatically. => ', () => {
    let gridObj: Grid;
    let actionBegin: () => void;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowGrouping: true,
                height: 400,
                columns: [
                    { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                    { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                    { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                ],
                actionBegin: actionBegin,
                actionComplete: actionComplete,
            }, done);
    });

    it('Active element testing when programatic grouping', (done: Function) => {
        actionComplete = (args?: Object): void => {
            expect(gridObj.element.querySelector('.e-gdiagonaldown').classList.contains('e-focus')).not.toBeTruthy();
            done();
        };
        actionBegin = (args?: any): void => {
            if (args.requestType === "grouping") {
                args.preventFocusOnGroup = true;
            }
        };
        gridObj.actionBegin = actionBegin;
        gridObj.actionComplete = actionComplete;
        gridObj.groupColumn('Freight');
    });

    it('Programmatically ungrouping the column', (done: Function) => {
        actionComplete = (): void => {
            done();
        };
        gridObj.actionComplete = actionComplete;
        gridObj.clearGrouping();
    });

    it('Again programmatically Grouping', (done: Function) => {
        actionComplete = (args?: Object): void => {
            expect(gridObj.element.querySelector('.e-gdiagonaldown').classList.contains('e-focus')).not.toBeTruthy();
            done();
        };
        gridObj.actionComplete = actionComplete;
        gridObj.groupColumn('Freight');
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = actionBegin = actionComplete = null;
    });
});

describe('EJ2-934107: Group caption text not displayed properly when grouping with frozen columns. => ', () => {
    let gridObj: Grid;
    let actionComplete: () => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowGrouping: true,
                width: '100%',
                columns: [
                    { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID", isFrozen: true },
                    { field: 'CustomerID', width: 120, headerText: "Customer ID" },
                    { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                    { field: 'ShipCountry', width: 120, headerText: "ShipCountry" },
                    { field: 'ShipName', width: 120, headerText: "ShipName" },
                ],
                actionComplete: actionComplete,
            }, done);
    });

    it('Group the column', (done: Function) => {
        actionComplete = (): void => {
            let content = gridObj.getContent().querySelectorAll('tr');
            expect(content[0].querySelectorAll('.e-groupcaption')[0].getAttribute('colspan')).toBe('4');
            done();
        };
        gridObj.actionComplete = actionComplete;
        gridObj.groupColumn('CustomerID');
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = actionComplete = null;
    });
});
