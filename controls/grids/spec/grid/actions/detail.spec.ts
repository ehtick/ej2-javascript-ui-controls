/**
 * Grid detail template spec document
 */
import { EmitType, initializeCSPTemplate } from '@syncfusion/ej2-base';
import { createElement, remove } from '@syncfusion/ej2-base';
import { Grid } from '../../../src/grid/base/grid';
import { Sort } from '../../../src/grid/actions/sort';
import { Group } from '../../../src/grid/actions/group';
import { Selection } from '../../../src/grid/actions/selection';
import { Filter } from '../../../src/grid/actions/filter';
import { Page } from '../../../src/grid/actions/page';
import {RowDD } from "../../../src/grid/actions/row-reorder";
import { DetailRow } from '../../../src/grid/actions/detail-row';
import { filterData, employeeData, customerData } from '../base/datasource.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { Edit } from '../../../src/grid/actions/edit';
import { createGrid, destroy } from '../base/specutil.spec';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { Toolbar } from '../../../src/grid/actions/toolbar';
import { Aggregate } from '../../../src/grid/actions/aggregate';
import { getParentIns } from '../../../src/grid/base/util';
import { Reorder } from '../../../src/grid/actions/reorder';

Grid.Inject(Sort, Page, Filter, DetailRow, Group, Selection, Edit, RowDD, Toolbar, Aggregate,Reorder);

describe('Detail template module', () => {

    function detail(e: any): void {
        let data: any = [];
        for (let i = 0; i < filterData.length; i++) {
            if (filterData[i]['EmployeeID'] === e.data.EmployeeID) {
                data.push(filterData[i]);
            }
        }
        let grid1: Grid = new Grid(
            {
                dataSource: filterData,
                selectionSettings: { type: 'Multiple', mode: 'Row' },
                allowSorting: true,
                allowPaging: true,
                pageSettings: { pageSize: 3 },
                allowGrouping: true,
                allowReordering: true,
                allowTextWrap: true,
                allowFiltering: true,
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                    { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                    { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                    { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                ],
            });
        grid1.appendTo((e.detailElement as Element).querySelector('#detailgrid') as HTMLElement);
    }

    describe('Render with invalid id testing', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: '#detailtemplate1',
                    detailDataBound: detail,
                    allowGrouping: true,
                    selectionSettings: { type: 'Multiple', mode: 'Row' },
                    allowFiltering: true,
                    allowSorting: true,
                    allowReordering: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ]
                }, done);
        });

        it('Detail row render testing', () => {
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrowcollapse').length).toBe(12);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-detailheadercell').length).toBe(1);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-mastercell').length).toBe(1);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-mastercell')[0].classList.contains('e-filterbarcell')).toBeTruthy();
        });

        it('Detail row expand testing', () => {
            (gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand').length).toBe(1);
        });

        it('Detail collapse testing', () => {
            (gridObj.getDataRows()[0].querySelector('.e-detailrowexpand') as HTMLElement).click();
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand').length).toBe(0);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Render testing', () => {
        let gridObj: Grid;
        let template: HTMLElement = createElement('script', { id: 'detailtemplate' });
        template.appendChild(createElement('div', { id: 'detailgrid' }));
        document.body.appendChild(template);
        let actionComplete: () => void;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.map(data => data),
                    allowPaging: true,
                    detailTemplate: '#detailtemplate',
                    detailDataBound: detail,
                    allowGrouping: true,
                    editSettings: { allowAdding: true, allowDeleting: true, allowEditing: true },
                    toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                    selectionSettings: { type: 'Multiple', mode: 'Row' },
                    allowFiltering: true,
                    allowSorting: true,
                    allowReordering: true,
                    actionComplete: actionComplete,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ],
                }, done);
        });

        it('Detail row render testing', () => {
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrowcollapse').length).toBe(12);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-detailheadercell').length).toBe(1);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-mastercell').length).toBe(1);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-mastercell')[0].classList.contains('e-filterbarcell')).toBeTruthy();
        });

        it('Detail row expand testing', () => {
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse')[0].getAttribute('aria-expanded')).toBe("false");
            (gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[0] as HTMLElement).style.display).toBe('');
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse').length).toBe(0);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand')[0].getAttribute('aria-expanded')).toBe("true");
        });

        it('Detail collapse testing', () => {
            (gridObj.getDataRows()[0].querySelector('.e-detailrowexpand') as HTMLElement).click();
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[0] as HTMLElement).style.display).toBe('none');
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand').length).toBe(0);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse')[0].getAttribute('aria-expanded')).toBe("false");
        });

        it('Expand method testing', () => {
            gridObj.detailRowModule.expand(gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse'));
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[1] as HTMLElement).style.display).toBe('');

            gridObj.detailRowModule.expand(gridObj.getDataRows()[1].querySelector('.e-detailrowexpand'));
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
        });

        it('EJ2-7253- expand and collapse button is not working well after edit', () => {
            gridObj.detailRowModule.expand(gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse'));
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            gridObj.selectRow(1);
            gridObj.startEdit();
            gridObj.endEdit();
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBeGreaterThan(0);
        });


        it('Collapse method testing', () => {
            gridObj.detailRowModule.collapse(gridObj.getDataRows()[1].querySelector('.e-detailrowexpand'));
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[1] as HTMLElement).style.display).toBe('none');

            gridObj.detailRowModule.collapse(gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse'));
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
        });

        it('Alt Down shortcut testing', (done: Function) => {
            gridObj.element.focus();
            let args: any = { action: 'altDownArrow', preventDefault: () => { }, target: createElement('div') };
            let leftArgs: any = { action: 'rightArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.rowSelected = () => {
                gridObj.keyboardModule.keyAction(leftArgs);
                gridObj.keyboardModule.keyAction(args);
                expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(3);
                expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowexpand').length).toBe(1);
                expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[2] as HTMLElement).style.display).toBe('');
                gridObj.keyboardModule.keyAction(args);
                expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowexpand').length).toBe(1);
                gridObj.rowSelected = null;
                done();
            };
            gridObj.selectRow(2, true);
        });

        it('Alt Up shortcut testing', () => {
            let args: any = { action: 'altUpArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(3);
            expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[2] as HTMLElement).style.display).toBe('none');

            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
        });

        it('ctrlDownArrow shortcut testing', () => {
            let args: any = { action: 'ctrlDownArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.selectRow(3, true);
            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(12);
            expect(gridObj.getDataRows()[3].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getDataRows()[4].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[3] as HTMLElement).style.display).toBe('');
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[4] as HTMLElement).style.display).toBe('');
        });

        it('ctrlUpArrow shortcut testing', () => {
            let args: any = { action: 'ctrlUpArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(12);
            expect(gridObj.getDataRows()[3].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect(gridObj.getDataRows()[4].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[3] as HTMLElement).style.display).toBe('none');
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[4] as HTMLElement).style.display).toBe('none');
        });

        it('Alt Down shortcut with selection disabled testing', () => {
            gridObj.allowSelection = false;
            gridObj.dataBind();
            let leftArgs: any = { action: 'rightArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(leftArgs);
            let args: any = { action: 'altDownArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(args);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[2] as HTMLElement).style.display).toBe('none');

            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowexpand').length).toBe(0);
        });


        it('Single column group testing', (done: Function) => {
            actionComplete = (args?: any): void => {
                if (args.requestType === 'grouping') {
                    let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
                    let content = gridObj.getContent().querySelectorAll('tr');

                    expect(grpHIndent[0].querySelector('.e-headercelldiv').classList.contains('e-emptycell')).toBeTruthy();
                    expect(gridObj.getHeaderTable().querySelectorAll('.e-detailheadercell').length).toBe(1);
                    expect(content[1].querySelectorAll('.e-indentcell').length).toBe(1);
                    done();
                }
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('OrderID');
        });

        it('Alt Down shortcut with grouping testing', (done: Function) => {
            let actionComplete = () => {
                gridObj.actionComplete = null;
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.element.focus();
            gridObj.allowSelection = true;
            gridObj.dataBind();
        });

        it('Select the row', (done: Function) => {
            gridObj.rowSelected = () => {
                let args: any = { action: 'altDownArrow', preventDefault: () => { }, target: createElement('div') };
                let leftArgs: any = { action: 'rightArrow', preventDefault: () => { }, target: createElement('div') };
                gridObj.keyboardModule.keyAction(leftArgs);
                gridObj.keyboardModule.keyAction(args);
                expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[0] as HTMLElement).style.display).toBe('');
                done();
            };
            gridObj.selectRow(1, true);
        });

        it('Expand method with grouping testing', () => {
            gridObj.detailRowModule.expand(gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse'));
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[0] as HTMLElement).style.display).toBe('');
        });

        it('expandcollapse group rows method testing', () => {
            gridObj.groupModule.expandCollapseRows(gridObj.getContent().querySelectorAll('.e-recordplusexpand')[4]);
            //     expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(33);
        });

        it('toogleExpandcollapse with invalid element testing', () => {
            (gridObj.detailRowModule as any).toogleExpandcollapse(gridObj.getDataRows()[1].querySelector('.e-rowcell'));
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[1] as HTMLElement).style.display).toBe('');
        });


        afterAll(() => {
            remove(document.getElementById('detailtemplate'));
            destroy(gridObj);
            gridObj = template = actionComplete = null;
        });
    });

    describe('Hierarchy Render testing', () => {
        let gridObj: Grid;
        let actionComplete: () => void;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData,
                    allowPaging: true,
                    allowGrouping: true,
                    selectionSettings: { type: 'Multiple', mode: 'Row' },
                    allowFiltering: true,
                    allowSorting: true,
                    allowReordering: true,
                    actionComplete: actionComplete,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                        { field: 'FirstName', headerText: 'First Name', textAlign: 'Left', width: 100 },
                        { field: 'Title', headerText: 'Title', textAlign: 'Left', width: 120 },
                        { field: 'City', headerText: 'City', textAlign: 'Left', width: 100 },
                        { field: 'Country', headerText: 'Country', textAlign: 'Left', width: 100 }
                    ],
                    childGrid: {
                        dataSource: filterData, queryString: 'EmployeeID',
                        allowPaging: true,
                        allowGrouping: true,
                        selectionSettings: { type: 'Multiple', mode: 'Row' },
                        pageSettings: { pageCount: 5, pageSize: 5 },
                        allowFiltering: true,
                        allowSorting: true,
                        groupSettings: { showGroupedColumn: false },
                        allowReordering: true,
                        allowTextWrap: true,
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 75 },
                            { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                            { field: 'ShipCity', headerText: 'Ship City', textAlign: 'Left', width: 100 },
                            { field: 'Freight', headerText: 'Freight', textAlign: 'Left', width: 120 },
                            { field: 'ShipName', headerText: 'Ship Name', textAlign: 'Left', width: 100 }
                        ],
                        childGrid: {
                            dataSource: customerData,
                            allowPaging: true,
                            allowGrouping: true,
                            selectionSettings: { type: 'Multiple', mode: 'Row' },
                            pageSettings: { pageCount: 5, pageSize: 5 },
                            allowFiltering: true,
                            allowSorting: true,
                            groupSettings: { showGroupedColumn: false },
                            allowReordering: true,
                            allowTextWrap: true,
                            queryString: 'CustomerID',
                            columns: [
                                { field: 'CustomerID', headerText: 'Customer ID', textAlign: 'Right', width: 75 },
                                { field: 'Phone', headerText: 'Phone', textAlign: 'Left', width: 100 },
                                { field: 'Address', headerText: 'Address', textAlign: 'Left', width: 120 },
                                { field: 'Country', headerText: 'Country', textAlign: 'Left', width: 100 }
                            ],
                        },
                    },
                }, done);
        });

        it('Hierarchy row render testing', () => {
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrowcollapse').length).toBe(9);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-detailheadercell').length).toBe(1);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-mastercell').length).toBe(1);
            expect(gridObj.getHeaderTable().querySelectorAll('.e-mastercell')[0].classList.contains('e-filterbarcell')).toBeTruthy();
        });

        it('Hierarchy row expand testing', () => {
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse')[0].getAttribute('aria-expanded')).toBe('false');
            (gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[0].querySelectorAll('.e-grid').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[0] as HTMLElement).style.display).toBe('');
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse').length).toBe(0);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand')[0].getAttribute('aria-expanded')).toBe('true');
        });

        it('Hierarchy collapse testing', () => {
            (gridObj.getDataRows()[0].querySelector('.e-detailrowexpand') as HTMLElement).click();
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[0].querySelectorAll('.e-grid').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[0] as HTMLElement).style.display).toBe('none');
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand').length).toBe(0);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowcollapse')[0].getAttribute('aria-expanded')).toBe('false');
        });

        it('Expand method testing', () => {
            gridObj.detailRowModule.expand(gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse'));
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[1].querySelectorAll('.e-grid').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[1] as HTMLElement).style.display).toBe('');

            gridObj.detailRowModule.expand(gridObj.getDataRows()[1].querySelector('.e-detailrowexpand'));
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
        });

        it('Collapse method testing', () => {
            gridObj.detailRowModule.collapse(gridObj.getDataRows()[1].querySelector('.e-detailrowexpand'));
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[1].querySelectorAll('.e-grid').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[1] as HTMLElement).style.display).toBe('none');

            gridObj.detailRowModule.collapse(gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse'));
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
        });

        it('Expand method with number args testing', () => {
            gridObj.detailRowModule.expand(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[1].querySelectorAll('.e-grid').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[1] as HTMLElement).style.display).toBe('');

            gridObj.detailRowModule.expand(gridObj.getDataRows()[1].querySelector('.e-detailrowexpand'));
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
        });

        it('Collapse method with number args testing', () => {
            gridObj.detailRowModule.collapse(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[1].querySelectorAll('.e-grid').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[1] as HTMLElement).style.display).toBe('none');

            gridObj.detailRowModule.collapse(gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse'));
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
        });

        it('Alt Down shortcut testing', () => {
            let args: any = { action: 'altDownArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.selectRow(2, true);
            let leftArgs: any = { action: 'rightArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(leftArgs);
            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(3);
            expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[2].querySelectorAll('.e-grid').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[2] as HTMLElement).style.display).toBe('');

            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowexpand').length).toBe(1);
        });

        it('Alt Up shortcut testing', () => {
            let args: any = { action: 'altUpArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(3);
            expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[2].querySelectorAll('.e-grid').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[2] as HTMLElement).style.display).toBe('none');

            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
        });

        it('ctrlDownArrow shortcut testing', () => {
            let args: any = { action: 'ctrlDownArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.selectRow(3, true);
            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(9);
            expect(gridObj.getDataRows()[3].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getDataRows()[4].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-grid').length).toBe(9);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[3] as HTMLElement).style.display).toBe('');
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[4] as HTMLElement).style.display).toBe('');
        });

        it('ctrlUpArrow shortcut testing', () => {
            let args: any = { action: 'ctrlUpArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(9);
            expect(gridObj.getDataRows()[3].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect(gridObj.getDataRows()[4].querySelectorAll('.e-detailrowcollapse').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-grid').length).toBe(9);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[3] as HTMLElement).style.display).toBe('none');
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[4] as HTMLElement).style.display).toBe('none');
        });

        it('Alt Down shortcut with selection disabled testing', () => {
            gridObj.allowSelection = false;
            gridObj.dataBind();
            let leftArgs: any = { action: 'rightArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(leftArgs);
            let args: any = { action: 'altDownArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(args);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[2] as HTMLElement).style.display).toBe('none');

            gridObj.keyboardModule.keyAction(args);
            expect(gridObj.getDataRows()[2].querySelectorAll('.e-detailrowexpand').length).toBe(0);
        });


        it('Single column group testing', (done: Function) => {
            actionComplete = (args?: any): void => {
                if (args.requestType === 'grouping') {
                    let grpHIndent = gridObj.getHeaderContent().querySelectorAll('.e-grouptopleftcell');
                    let content = gridObj.getContent().querySelectorAll('tr');

                    expect(grpHIndent[0].querySelector('.e-headercelldiv').classList.contains('e-emptycell')).toBeTruthy();
                    expect(gridObj.getHeaderTable().querySelectorAll('.e-detailheadercell').length).toBe(1);
                    expect(content[1].querySelectorAll('.e-indentcell').length).toBe(1);
                    done();
                }
            };
            gridObj.actionComplete = actionComplete;
            gridObj.groupModule.groupColumn('EmployeeID');
        });

        it('Alt Down shortcut with grouping testing', (done: Function) => {
            let actionComplete = () => {
                gridObj.actionComplete = null;
                done();
            };
            gridObj.actionComplete = actionComplete;
            gridObj.allowSelection = true;
            gridObj.dataBind();
        });

        it('Select the row', () => {
            gridObj.selectRow(1, true);
            let leftArgs: any = { action: 'rightArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(leftArgs);
            let args: any = { action: 'altDownArrow', preventDefault: () => { }, target: createElement('div') };
            gridObj.keyboardModule.keyAction(args);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[0] as HTMLElement).style.display).toBe('');
        });

        it('Expand method with grouping testing', () => {
            gridObj.detailRowModule.expand(gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse'));
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[0].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[0] as HTMLElement).style.display).toBe('');
        });

        it('expandcollapse group rows method testing', () => {
            gridObj.groupModule.expandCollapseRows(gridObj.getContent().querySelectorAll('.e-recordplusexpand')[4]);
            //expect(gridObj.getContent().querySelectorAll('tr:not([style*="display: none"])').length).toBe(27);
        });

        it('toogleExpandcollapse with invalid element testing', () => {
            (gridObj.detailRowModule as any).toogleExpandcollapse(gridObj.getDataRows()[1].querySelector('.e-rowcell'));
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(2);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect((gridObj.getContentTable().querySelectorAll('.e-detailrow')[1] as HTMLElement).style.display).toBe('');
        });


        afterAll(() => {
            (gridObj.detailRowModule as any).destroy();
            destroy(gridObj);
            gridObj = actionComplete = null;
        });
    });

    describe('Keyboard operation', () => {
        let gridObj: Grid;
        let elem: HTMLElement = createElement('div', { id: 'Grid' });

        beforeAll((done: Function) => {
            let dataBound: EmitType<Object> = () => {
                gridObj.element.focus();
                gridObj.dataBound = null;
                done();
            };
            document.body.appendChild(elem);
            gridObj = new Grid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: '#detailtemplate',
                    detailDataBound: detail,
                    allowGrouping: true,
                    selectionSettings: { type: 'Multiple', mode: 'Row' },
                    allowFiltering: true,
                    allowSorting: true,
                    allowReordering: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ],
                    dataBound: dataBound
                });
            gridObj.appendTo('#Grid');
        });
        it('Detail expand testing', () => {
            let target: any = (gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement);
            gridObj.keyboardModule.keyAction(<any>{ action: 'enter', target: target, preventDefault: () => { } });
            expect(target.classList.contains('e-detailrowexpand')).toBeTruthy();
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
            elem.remove();
            gridObj = elem = null;
        });
    });
    describe('Action Complete event for expandAll and collapseAll=> ', () => {
        let gridObj: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    detailTemplate: '#detailtemplate',
                    allowPaging: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ],
                    actionComplete: actionComplete
                }, done);
        });
        it('actionComplete event triggerred for expandAll action complete', () => {
            actionComplete = (args?: any): void => {
                expect(args.requestType).toBe('expandAllComplete');
            }
            gridObj.actionComplete = actionComplete;
            gridObj.detailRowModule.expandAll();
        });
        it('actionComplete event triggerred for collapseAll action complete', () => {
            actionComplete = (args?: any): void => {
                expect(args.requestType).toBe('collapseAllComplete');
            }
            gridObj.actionComplete = actionComplete;
            gridObj.detailRowModule.collapseAll();
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionComplete = null;
        });
    });   
    
     describe('Hierarchy Render testing', () => {
        let gridObj: Grid;
        let actionComplete: () => void;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData,
                    allowPaging: true,
                    allowGrouping: true,
                    selectionSettings: { type: 'Multiple', mode: 'Row' },
                    allowFiltering: true,
                    allowSorting: true,
                    allowReordering: true,
                    actionComplete: actionComplete,
                    allowRowDragAndDrop: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                        { field: 'FirstName', headerText: 'First Name', textAlign: 'Left', width: 100 },
                        { field: 'Title', headerText: 'Title', textAlign: 'Left', width: 120 },
                        { field: 'City', headerText: 'City', textAlign: 'Left', width: 100 },
                        { field: 'Country', headerText: 'Country', textAlign: 'Left', width: 100 }
                    ],
                    childGrid: {
                        dataSource: filterData, queryString: 'EmployeeID',
                        allowPaging: true,
                        allowGrouping: true,
                        allowRowDragAndDrop: true,
                        selectionSettings: { type: 'Multiple', mode: 'Row' },
                        pageSettings: { pageCount: 5, pageSize: 5 },
                        allowFiltering: true,
                        allowSorting: true,
                        groupSettings: { showGroupedColumn: false },
                        allowReordering: true,
                        allowTextWrap: true,
                        
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 75 },
                            { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                            { field: 'ShipCity', headerText: 'Ship City', textAlign: 'Left', width: 100 },
                            { field: 'Freight', headerText: 'Freight', textAlign: 'Left', width: 120 },
                            { field: 'ShipName', headerText: 'Ship Name', textAlign: 'Left', width: 100 }
                        ]
                    },
                }, done);
        });

        it('EJ2-895366 - Error throws when using dialogTemplate editing in the Child grid', (done: Function) => {
            // code coverage
            let detailDataBound: (e: any) => void = (e: any) => {
                e.childGrid.parentDetails.parentInstObj = gridObj;
                let parentIns = getParentIns(e.childGrid);
                parentIns = detailDataBound = gridObj.detailDataBound = null;
                done();
            };
            gridObj.detailDataBound = detailDataBound;
            gridObj.detailRowModule.expand(gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse'));
        });
        
        it('Hierarchy row with expand-RowDD', () => {
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
            expect(gridObj.getDataRows()[1].querySelectorAll('.e-detailrowexpand').length).toBe(1);
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow')[0].children[1].getAttribute('colspan')).toBe('6');
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionComplete = null;
        });
    });

    describe('Hierarchy Render testing with detailExpand and detailCollapse events', () => {
        let gridObj: Grid;
        let detailExpand: () => void;
        let detailCollapse: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(5),
                    allowPaging: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                        { field: 'FirstName', headerText: 'First Name', textAlign: 'Left', width: 100 },
                    ],
                    childGrid: {
                        dataSource: filterData.slice(0, 10),
                        queryString: 'EmployeeID',                      
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 75 },
                            { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                        ]
                    },
                    detailCollapse: detailCollapse,
                    detailExpand: detailExpand
                }, done);
        });

        it('prevent detail action', (done: Function) => {
            let detailExpand: (e: any) => void = (e: any) => {
                e.cancel = true;
                expect(e.parentRow).toBeDefined();
                expect(e.detailRow).toBeNull();
                expect(e.event).not.toBeDefined();
                expect(e.rowData).toBeDefined();
                done();
            };
            gridObj.detailExpand = detailExpand;
            gridObj.detailRowModule.expand(1);
        });
        
        it('expand detail row', (done: Function) => {
            const detailRows: NodeListOf<HTMLElement> = gridObj.getContentTable().querySelectorAll('.e-detailrow');
            const visibleRows = Array.from(detailRows).filter(el => {
                return el.style.display !== 'none';
            });
            expect(visibleRows.length).toBe(0);
            let detailExpand: (e: any) => void = (e: any) => {
                done();
            };
            gridObj.detailExpand = detailExpand;
            gridObj.detailRowModule.expand(1);
        });

        it('prevent collapse action', (done: Function) => {
            const detailRows: NodeListOf<HTMLElement> = gridObj.getContentTable().querySelectorAll('.e-detailrow');
            const visibleRows = Array.from(detailRows).filter(el => {
                return el.style.display !== 'none';
            });
            expect(visibleRows.length).toBe(1);
            let detailCollapse: (e: any) => void = (e: any) => {
                e.cancel = true;
                expect(e.parentRow).toBeDefined();
                expect(e.detailRow).toBeDefined();
                expect(e.event).not.toBeDefined();
                expect(e.rowData).toBeDefined();
                done();
            };
            gridObj.detailCollapse = detailCollapse;
            gridObj.detailExpand = null;
            gridObj.detailRowModule.collapse(1);
        });
        
        it('collapse detail row', (done: Function) => {
            const detailRows: NodeListOf<HTMLElement> = gridObj.getContentTable().querySelectorAll('.e-detailrow');
            const visibleRows = Array.from(detailRows).filter(el => {
                return el.style.display !== 'none';
            });
            expect(visibleRows.length).toBe(1);
            let detailCollapse: (e: any) => void = (e: any) => {
                done();
            };
            gridObj.detailCollapse = detailCollapse;
            gridObj.detailRowModule.collapse(1);
        });
        
        
        it('check the detail status 1', (done: Function) => {
            const detailRows: NodeListOf<HTMLElement> = gridObj.getContentTable().querySelectorAll('.e-detailrow');
            const visibleRows = Array.from(detailRows).filter(el => {
                return el.style.display !== 'none';
            });
            expect(visibleRows.length).toBe(0);
            gridObj.detailCollapse = null;
            gridObj.detailExpand = null;
            done();
        });

        it('prevent detail action with mouse click', (done: Function) => {
            let detailExpand: (e: any) => void = (e: any) => {
                e.cancel = true;
                expect(e.parentRow).toBeDefined();
                expect(e.detailRow).toBeNull();
                expect(e.event).toBeDefined();
                expect(e.rowData).toBeDefined();
                done();
            };
            gridObj.detailExpand = detailExpand;
            (gridObj.getDataRows()[2].querySelector('.e-detailrowcollapse') as HTMLElement).click();
        });
        
        it('expand detail row with mouse click', (done: Function) => {
            const detailRows: NodeListOf<HTMLElement> = gridObj.getContentTable().querySelectorAll('.e-detailrow');
            const visibleRows = Array.from(detailRows).filter(el => {
                return el.style.display !== 'none';
            });
            expect(visibleRows.length).toBe(0);
            let detailExpand: (e: any) => void = (e: any) => {
                done();
            };
            gridObj.detailExpand = detailExpand;
            (gridObj.getDataRows()[2].querySelector('.e-detailrowcollapse') as HTMLElement).click();
        });

        it('prevent collapse action with mouse click', (done: Function) => {
            const detailRows: NodeListOf<HTMLElement> = gridObj.getContentTable().querySelectorAll('.e-detailrow');
            const visibleRows = Array.from(detailRows).filter(el => {
                return el.style.display !== 'none';
            });
            expect(visibleRows.length).toBe(1);
            let detailCollapse: (e: any) => void = (e: any) => {
                e.cancel = true;
                expect(e.parentRow).toBeDefined();
                expect(e.detailRow).toBeDefined();
                expect(e.event).toBeDefined();
                expect(e.rowData).toBeDefined();
                done();
            };
            gridObj.detailCollapse = detailCollapse;
            gridObj.detailExpand = null;
            (gridObj.getDataRows()[2].querySelector('.e-detailrowexpand') as HTMLElement).click();
        });
        
        it('collapse detail row', (done: Function) => {
            const detailRows: NodeListOf<HTMLElement> = gridObj.getContentTable().querySelectorAll('.e-detailrow');
            const visibleRows = Array.from(detailRows).filter(el => {
                return el.style.display !== 'none';
            });
            expect(visibleRows.length).toBe(1);
            let detailCollapse: (e: any) => void = (e: any) => {
                done();
            };
            gridObj.detailCollapse = detailCollapse;
            (gridObj.getDataRows()[2].querySelector('.e-detailrowexpand') as HTMLElement).click();
        });
        
        it('check the detail status 2', (done: Function) => {
            const detailRows: NodeListOf<HTMLElement> = gridObj.getContentTable().querySelectorAll('.e-detailrow');
            const visibleRows = Array.from(detailRows).filter(el => {
                return el.style.display !== 'none';
            });
            expect(visibleRows.length).toBe(0);
            gridObj.detailCollapse = null;
            gridObj.detailExpand = null;
            done();
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = detailCollapse = detailExpand = null;
        });
    });

    describe('indent cell width check for autogenerated cols', () => {
        let gridObj: Grid;
        let rowDataBound: (args: any) => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 30),
                    allowFiltering: true,
                    filterSettings: { type: 'Excel' },
                    detailTemplate:'#detailTemp',
                }, done);
        });
        it('indent width checking:', () => {
            rowDataBound = (args: any) =>{
                expect(((gridObj.element.querySelectorAll('.e-detailrowcollapse')[0])as HTMLElement).offsetWidth).toBe(30);
                expect(((gridObj.element.querySelectorAll('.e-detailheadercell')[0])as HTMLElement).offsetWidth).toBe(30);
            }
            gridObj.rowDataBound = rowDataBound;
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = rowDataBound = null;
        });
    });
    
    describe('EJ2-48397 - getRowIndexByPrimaryKey thrown script error while render child grid', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: `<div>Hello</div>`,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right', isPrimaryKey: true },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ]
                }, done);
        });
        it('Test script error', (done: Function) => {
            let detailDataBound = (e: any) => {
                gridObj.getRowIndexByPrimaryKey(10249);
                gridObj.detailDataBound = null;
                done();
            }
            gridObj.detailDataBound = detailDataBound;
            (gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement).click();
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2-49020 - minWidth is not working', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: `<div>Hello</div>`,
                    width:600,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', minWidth: 100, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 150, showInColumnChooser: false },
                        { field: 'OrderDate', headerText: 'Order Date', format: 'yMd', width: 150, textAlign: 'Right' },
                        { field: 'Freight', format: 'C2', minWidth: 120, textAlign: 'Right' },
                        { field: 'ShippedDate', headerText: 'Shipped Date', width: 150, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
                    ]
                }, done);
        });
        it('Test script error', (done: Function) => {
            expect(gridObj.getHeaderTable().querySelectorAll('col')[1].style.width).toBe('100px');
            expect(gridObj.getHeaderTable().querySelectorAll('col')[4].style.width).toBe('120px');
            expect(gridObj.getContentTable().querySelectorAll('col')[1].style.width).toBe('100px');
            expect(gridObj.getContentTable().querySelectorAll('col')[4].style.width).toBe('120px');
            done();
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
    
    describe('EJ2-61821 - Destroying Grid with child Grid', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData,
                    aggregates: [{
                        columns: [{
                            type: 'Max',
                            field: 'HireDate',
                            format: { type: 'date', skeleton: 'medium' },
                            footerTemplate: '${Max}',
                        }],
                    }],
                    columns: [
                        {field: 'EmployeeID',headerText: 'Employee ID',textAlign: 'Right',width: 125},
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerText: 'City', width: 110 },
                        {field: 'HireDate',headerText: 'Hire date',width: 130,format: 'yMd',type: 'datetime'},],
                    childGrid: {
                        dataSource: filterData, queryString: 'EmployeeID',
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', width: 120 },
                            { field: 'ShipCity', headerText: 'Ship City', width: 120 },
                            { field: 'Freight', headerText: 'Freight', width: 120, format: 'N2' },
                            { field: 'ShipName', headerText: 'Ship Name', width: 150 },
                        ],
                    aggregates: [{
                        columns: [{
                            type: 'Average',
                            field: 'Freight',
                            footerTemplate: 'Average: ${Average}',}
                        ]},
                        {
                            columns: [{type: 'Sum',
                            field: 'Freight',
                            footerTemplate: 'Sum: ${Sum}',}]
                        }],
                    },}, done);
                });
                it('Grid destroy testing', () => {
                gridObj.detailRowModule.expand(gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse'));
                gridObj.destroy();
                expect(document.getElementsByClassName('e-grid')[0]).toBe(undefined);
            });
            afterAll(() => {
            destroy(gridObj);
        });
    });

    describe('EJ2-867924 - Refresh row element without collapsing detail row', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0,3),
                    allowPaging: true,
                    selectionSettings: { type: 'Multiple', mode: 'Row' },
                    height: 500,
                    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: "Batch", showConfirmDialog: false },
                    toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', isPrimaryKey: true, width: 75 },
                        { field: 'FirstName', headerText: 'First Name', textAlign: 'Left', width: 100 },
                        { field: 'Title', headerText: 'Title', textAlign: 'Left', width: 120 },
                    ],
                    childGrid: {
                        dataSource: [],
                        queryString: 'EmployeeID',
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 75 },
                            { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                            { field: 'ShipCity', headerText: 'Ship City', textAlign: 'Left', width: 100 },
                        ]
                    },
                }, done);
        });
        it('Expand row', () => {
            (gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
        });
        it('close edit', (done: Function) => {
            let cellSaved = (args?: any): void => {
                gridObj.closeEdit();
                expect(gridObj.getRowsObject()[2].index).toBe(1);
                gridObj.cellSaved = null;
                done();
            };
            gridObj.editCell(1, 'FirstName');
            gridObj.cellSaved = cellSaved;
            gridObj.saveCell();
        });

        afterAll(() => {
            (gridObj.detailRowModule as any).destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Hierarchy Render testing', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0,3),
                    allowPaging: true,
                    selectionSettings: { type: 'Multiple', mode: 'Row' },
                    allowFiltering: true,
                    height: 500,
                    allowSorting: true,
                    allowReordering: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                        { field: 'FirstName', headerText: 'First Name', textAlign: 'Left', width: 100 },
                        { field: 'Title', headerText: 'Title', textAlign: 'Left', width: 120 },
                        { field: 'City', headerText: 'City', textAlign: 'Left', width: 100 },
                        { field: 'Country', headerText: 'Country', textAlign: 'Left', width: 100 }
                    ],
                    childGrid: {
                        dataSource: filterData, queryString: 'EmployeeID',
                        allowPaging: true,
                        allowGrouping: true,
                        selectionSettings: { type: 'Multiple', mode: 'Row' },
                        pageSettings: { pageCount: 5, pageSize: 5 },
                        allowFiltering: true,
                        allowSorting: true,
                        groupSettings: { showGroupedColumn: false },
                        allowReordering: true,
                        allowTextWrap: true,
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 75 },
                            { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                            { field: 'ShipCity', headerText: 'Ship City', textAlign: 'Left', width: 100 },
                            { field: 'Freight', headerText: 'Freight', textAlign: 'Left', width: 120 },
                            { field: 'ShipName', headerText: 'Ship Name', textAlign: 'Left', width: 100 }
                        ]
                    },
                }, done);
        });

        it('keypress testing', () => {
            (gridObj.getDataRows()[0].querySelector('.e-rowcell') as HTMLElement).click();
            let args: any = { action: 'enter' };
            (gridObj.detailRowModule as any).keyPressHandler(args);
        });
        it('Hierarchy row expand testing', () => {
            gridObj.childGrid.query = gridObj.query;
            (gridObj as any).isPrinting = true;
            (gridObj.getDataRows()[2].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
        });

        it('Detail collapse testing', () => {
            (gridObj.getDataRows()[2].querySelector('.e-detailrowexpand') as HTMLElement).click();
            expect(gridObj.getContentTable().querySelectorAll('.e-detailrow').length).toBe(1);
            (gridObj.detailRowModule as any).refreshColSpan();
        });


        afterAll(() => {
            (gridObj.detailRowModule as any).destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Code Coverage - Hierarchy Render testing', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0,3),
                    allowPaging: true,
                    allowFiltering: true,
                    allowTextWrap: true,
                    height: 'auto',
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                        { field: 'FirstName', headerText: 'First Name', textAlign: 'Left', width: 100 },
                        { field: 'Title', headerText: 'Title', textAlign: 'Left', width: 120 },
                        { field: 'City', headerText: 'City', textAlign: 'Left', width: 100 },
                        { field: 'Country', headerText: 'Country', textAlign: 'Left', width: 100 }
                    ],
                    childGrid: {
                        dataSource: filterData,
                        queryString: 'EmployeeID',
                        allowPaging: true,
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 75 },
                            { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                            { field: 'ShipCity', headerText: 'Ship City', textAlign: 'Left', width: 100 },
                            { field: 'Freight', headerText: 'Freight', textAlign: 'Left', width: 120 },
                            { field: 'ShipName', headerText: 'Ship Name', textAlign: 'Left', width: 100 }
                        ]
                    },
                }, done);
        });


        it('row expand testing - 1', () => {
            (gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse') as HTMLElement).click();
        });

        it('row expand empty cell testing ', () => {
            (gridObj.getDataRows()[0].querySelector('.e-rowcell') as HTMLElement).click();
        });

        it('row expand testing - 2', () => {
            (gridObj.getDataRows()[2].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            gridObj.isDestroyed = true;
            gridObj.element.innerHTML = '';
            (gridObj.detailRowModule as any).destroy();
        });

        it('check the addEventListener Binding', () => {
            gridObj.isDestroyed = true;
            gridObj.detailRowModule.addEventListener();
            gridObj.isDestroyed = false;
        });

        afterAll(() => {
            (gridObj.detailRowModule as any).destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('On property change detail template', () => {
        let gridObj: Grid;
        let dataBound: (e: any) => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData.slice(0, 5),
                    allowPaging: true,
                    width: 600,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', minWidth: 100, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 150, showInColumnChooser: false },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
                    ]
                }, done);
        });
        it('Bind detail template', (done: Function) => {
            dataBound = function (e: any) {
                expect(gridObj.element.querySelector('.e-detailrowcollapse')).not.toBeNull();
                gridObj.dataBound = null;
                done();
            };
            gridObj.dataBound = dataBound;
            gridObj.detailTemplate = "<div>Hello</div>";
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = dataBound = null;
        });
    });

    describe('On property change child grid', () => {
        let gridObj: Grid;
        let dataBound: (e: any) => void;
        let columns: string[];

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0, 2),
                    allowPaging: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                        { field: 'FirstName', headerText: 'First Name', textAlign: 'Left', width: 100 },
                        { field: 'Title', headerText: 'Title', textAlign: 'Left', width: 120 },
                    ],
                }, done);
        });

        it('Bind child grid', (done) => {
            dataBound = function (e: any) {
                expect(gridObj.element.querySelector('.e-detailrowcollapse')).not.toBeNull();
                columns = gridObj.getColumnFieldNames();
                gridObj.dataBound = null;
                done();
            };
            gridObj.dataBound = dataBound;
            gridObj.childGrid = {
                dataSource: filterData,
                queryString: 'EmployeeID',
                allowPaging: true,
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 75 },
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                    { field: 'ShipCity', headerText: 'Ship City', textAlign: 'Left', width: 100 },
                ]
            };
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = columns = dataBound = null;
        });
    });


    describe('Code Coverage - Hierarchy Render testing', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0, 3),
                    allowPaging: true,
                    allowFiltering: true,
                    height: 700,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                        { field: 'FirstName', headerText: 'First Name', textAlign: 'Left', width: 100 },
                        { field: 'Title', headerText: 'Title', textAlign: 'Left', width: 120 },
                        { field: 'City', headerText: 'City', textAlign: 'Left', width: 100 },
                        { field: 'Country', headerText: 'Country', textAlign: 'Left', width: 100 }
                    ],
                    childGrid: {
                        dataSource: filterData.slice(0, 1),
                        queryString: 'EmployeeID',
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 75 },
                            { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 75 },
                            { field: 'ShipCity', headerText: 'Ship City', textAlign: 'Left', width: 100 },
                            { field: 'Freight', headerText: 'Freight', textAlign: 'Left', width: 120 },
                            { field: 'ShipName', headerText: 'Ship Name', textAlign: 'Left', width: 100 }
                        ]
                    },
                }, done);
        });


        it('auxilaryclickHandler coverage', () => {
            (gridObj as any).detailRowModule.auxilaryclickHandler({ button: 1, preventDefault: () => { }, target: gridObj.element.querySelector('.e-icon-grightarrow')});
            (gridObj as any).detailRowModule.auxilaryclickHandler({ button: 1, preventDefault: () => { }, target: gridObj.element.querySelector('.e-rowcell')});
        });

        it('auxilaryclickHandler coverage', () => {
            (gridObj as any).detailRowModule.auxilaryclickHandler({ button: 1, preventDefault: () => { }, target: gridObj.element.querySelector('.e-rowcell')});
            (gridObj as any).isReact = true;
            (gridObj as any).detailRowModule.clickHandler({ button: 1, preventDefault: () => { }, target: gridObj.element.querySelector('.e-icon-grightarrow')});
        });

        afterAll(() => {
            (gridObj.detailRowModule as any).destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2-916181 - All template is not rendering in React when using the CSPTemplate function', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: initializeCSPTemplate(function() { return '<span>detailTemplate</span>' }),
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ]
                }, done);
        });

        it('Coverage the expand row', (done: Function) => {
            gridObj.isReact = true;
            gridObj.detailRowModule.expand(gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse'));
            done();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

   
    describe('DetailHeaderIndentCellRenderer - Unit Tests', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: '#detailtemplate',
                    allowGrouping: true,
                    selectionSettings: { type: 'Multiple', mode: 'Row' },
                    allowFiltering: true,
                    allowSorting: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ]
                }, done);
        });

        it('DetailHeaderIndentCellRenderer - render method with cell having rowSpan > 0', () => {
            const renderService:any = gridObj.serviceLocator.getService('cellRendererFactory');
            const renderer: any = renderService.getCellRenderer('DetailHeader');
            renderer.parent = gridObj;

            // Create a cell object with rowSpan > 0
            const mockCell: any = {
                rowSpan: 2,
                index: 0
            };

            // Render with cell having rowSpan > 0
            const element = renderer.render(mockCell, {});
            
            // Verify element has rowspan attribute set and is visible
            expect(element).toBeDefined();
            expect(element.getAttribute('rowspan')).toBe('2');
            expect((element as HTMLElement).style.display).not.toBe('none');
            expect(element.classList.contains('e-detailheadercell')).toBeTruthy();
        });

        it('DetailHeaderIndentCellRenderer - render method with cell having rowSpan === 0', () => {
            const renderService:any = gridObj.serviceLocator.getService('cellRendererFactory');
            const renderer: any = renderService.getCellRenderer('DetailHeader');
            renderer.parent = gridObj;

            // Create a cell object with rowSpan === 0
            const mockCell: any = {
                rowSpan: 0,
                index: 0
            };

            // Render with cell having rowSpan === 0
            const element = renderer.render(mockCell, {});
            
            // Verify element is hidden (display: none) when rowSpan is 0
            expect(element).toBeDefined();
            expect((element as HTMLElement).style.display).toBe('none');
            expect(element.getAttribute('rowspan')).toBeNull();
        });

        it('DetailHeaderIndentCellRenderer - render method with cell having rowSpan undefined', () => {
            const renderService:any = gridObj.serviceLocator.getService('cellRendererFactory');
            const renderer: any = renderService.getCellRenderer('DetailHeader');
            renderer.parent = gridObj;

            // Create a cell object without rowSpan property
            const mockCell: any = {
                index: 0
            };

            // Render with cell having undefined rowSpan
            const element = renderer.render(mockCell, {});
            
            // Verify element is visible and does not have rowspan attribute
            expect(element).toBeDefined();
            expect((element as HTMLElement).style.display).not.toBe('none');
            expect(element.getAttribute('rowspan')).toBeNull();
        });

        it('DetailHeaderIndentCellRenderer - element class name verification', () => {
            const renderService:any = gridObj.serviceLocator.getService('cellRendererFactory');
            const renderer: any = renderService.getCellRenderer('DetailHeader');
            renderer.parent = gridObj;

            // Render element
            const element = renderer.render(null, {});
            
            // Verify CSS classes
            expect(element.classList.contains('e-detailheadercell')).toBeTruthy();
            expect(element.classList.length).toBeGreaterThanOrEqual(1);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
});

describe('Detail-expand-cell-rendererModule', () => {

    let DetailExpandCellRenderer: any;

    beforeAll(() => {
        // require the module under test
        // path relative to this spec file
        DetailExpandCellRenderer = require('../../../src/grid/renderer/detail-expand-cell-renderer').DetailExpandCellRenderer;
    });

    function makeRenderer() {
        const parent = {
            createElement: (tagName: string, options?: any) => {
                const el = document.createElement(tagName);
                if (options) {
                    if (options.className) { el.className = options.className; }
                    if (options.attrs) {
                        Object.keys(options.attrs).forEach((k) => {
                            el.setAttribute(k, options.attrs[k]);
                        });
                    }
                }
                return el;
            }
        };

        const obj: any = Object.create(DetailExpandCellRenderer.prototype);
        obj.parent = parent;
        obj.localizer = { getConstant: (k: string) => (k === 'Expanded' ? 'Expanded Text' : 'Collapsed Text') };
        obj.element = parent.createElement('TD', { className: 'e-detailrowcollapse', attrs: { 'aria-expanded': 'false', tabindex: '-1' } });
        return obj as any;
    }

    it('should render collapsed anchor when no attributes provided', () => {
        const r = makeRenderer();
        const cell: any = { isSelected: false };
        const node: Element = r.render(cell, {});
        expect(node.nodeName.toUpperCase()).toBe('TD');
        const a = (node as HTMLElement).querySelector('a') as HTMLElement;
        expect(a).toBeDefined();
        expect(a.className).toContain('e-dtdiagonalright');
        expect(a.getAttribute('title')).toBe('Collapsed Text');
        expect(node.classList.contains('e-selectionbackground')).toBe(false);
    });

    it('should render expanded anchor when attributes.class is provided', () => {
        const r = makeRenderer();
        const cell: any = { isSelected: false };
        const node: Element = r.render(cell, {}, { class: 'custom-class' });
        expect(node.className).toBe('custom-class');
        const a = (node as HTMLElement).querySelector('a') as HTMLElement;
        expect(a).toBeDefined();
        expect(a.className).toContain('e-dtdiagonaldown');
        expect(a.getAttribute('title')).toBe('Expanded Text');
    });

    it('should add selection classes when cell.isSelected is true', () => {
        const r = makeRenderer();
        const cell: any = { isSelected: true };
        const node: Element = r.render(cell, {});
        expect(node.classList.contains('e-selectionbackground')).toBe(true);
        expect(node.classList.contains('e-active')).toBe(true);
    });

    it('should treat empty string class as provided (append expanded anchor)', () => {
        const r = makeRenderer();
        const cell: any = { isSelected: false };
        const node: Element = r.render(cell, {}, { class: '' });
        // className should be set to the empty string by implementation
        expect(node.className).toBe('');
        const a = (node as HTMLElement).querySelector('a') as HTMLElement;
        expect(a.className).toContain('e-dtdiagonaldown');
    });

    it('should fallback to collapsed anchor when attributes present but class is null', () => {
        const r = makeRenderer();
        const cell: any = { isSelected: false };
        const node: Element = r.render(cell, {}, { class: null });
        const a = (node as HTMLElement).querySelector('a') as HTMLElement;
        expect(a.className).toContain('e-dtdiagonalright');
    });

});

describe('Improve coverage for Detail Row Module', () => {
    let gridObj: any;

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData.slice(0, 5),
                detailTemplate: '#detailtemplate',
                allowPaging: false,
                allowTextWrap: true,
                height: 'auto',
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                    { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                    { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                    { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                ]
            }, done);
    });

    it('covers early return when rowObj is null/undefined (invalid UID)', () => {
        const fakeTr = createElement('tr', { attrs: { 'data-uid': 'invalid-uid-12345' } });
        const fakeTarget = createElement('td', { className: 'e-detailrowcollapse' });
        fakeTr.appendChild(fakeTarget);
        (gridObj.detailRowModule as any).toogleExpandcollapse(fakeTarget);
    });

    it('covers early return when target is masked cell', () => {
        const target = gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement;
        target.classList.add('e-masked-cell');
        (gridObj.detailRowModule as any).toogleExpandcollapse(target);
        target.classList.remove('e-masked-cell');
    });

    it('covers no-nextSibling path when expanding the last data row', () => {
        const rows = gridObj.getDataRows();
        const lastRowCollapse = rows[rows.length - 1].querySelector('.e-detailrowcollapse') as HTMLElement;
        gridObj.detailRowModule.expand(lastRowCollapse);
        const detailRows = gridObj.getContentTable().querySelectorAll('.e-detailrow');
    });

    it('covers Mac metaKey remapping (downArrow → ctrlDownArrow) in keyPressHandler', () => {
        const original = navigator.platform;  // safer string restore
        Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
        const e: any = { action: 'downArrow', metaKey: true, preventDefault: () => { } };
        (gridObj.detailRowModule as any).keyPressHandler(e);

        const detailRows = gridObj.getContentTable().querySelectorAll('.e-detailrow');
        const visibleDetailRows = Array.from(detailRows).filter(el => (el as HTMLElement).style.display !== 'none');
        expect(visibleDetailRows.length).toBeGreaterThan(0);

        Object.defineProperty(navigator, 'platform', { value: original, configurable: true });
    });

    it('covers Mac metaKey remapping (upArrow → ctrlUpArrow) in keyPressHandler', () => {
        const original = navigator.platform;
        Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
        const e: any = { action: 'upArrow', metaKey: true, preventDefault: () => { } };
        (gridObj.detailRowModule as any).keyPressHandler(e);

        const detailRows = gridObj.getContentTable().querySelectorAll('.e-detailrow');
        const visibleDetailRows = Array.from(detailRows).filter(el => (el as HTMLElement).style.display !== 'none');
        expect(visibleDetailRows.length).toBe(0);

        Object.defineProperty(navigator, 'platform', { value: original, configurable: true });
    });

    it('covers enter key when focused element is the expand/collapse icon (parentElement logic)', () => {
        const row = gridObj.getDataRows()[0];
        const collapseTd = row.querySelector('.e-detailrowcollapse') as HTMLElement;
        const icon = collapseTd.querySelector('.e-icon-grightarrow, .e-icon-gdownarrow') || collapseTd.firstElementChild as HTMLElement;
        const originalGetFocused = gridObj.focusModule.getFocusedElement.bind(gridObj.focusModule);
        gridObj.focusModule.getFocusedElement = () => icon;
        (gridObj.detailRowModule as any).keyPressHandler({ action: 'enter', preventDefault: () => { } } as any);
        const detailRows = gridObj.getContentTable().querySelectorAll('.e-detailrow');
        gridObj.focusModule.getFocusedElement = originalGetFocused;
    });

    it('covers lastrowcell logic in expand (clientHeight > scrollHeight) and collapse', () => {
        const rows = gridObj.getDataRows();
        const target = rows[rows.length - 1].querySelector('.e-detailrowcollapse') as HTMLElement;
        target.classList.add('e-lastrowcell');
        const content = gridObj.getContent();
        const table = gridObj.getContentTable();
        const origClient = content.clientHeight;
        const origScroll = table.scrollHeight;
        Object.defineProperty(content, 'clientHeight', { value: 2000, configurable: true });
        Object.defineProperty(table, 'scrollHeight', { value: 1000, configurable: true });
        gridObj.detailRowModule.expand(target);
        gridObj.detailRowModule.collapse(target);

        // Restore native getters (prevents any leak)
        delete content.clientHeight;
        delete table.scrollHeight;

        target.classList.remove('e-lastrowcell');
    });

    afterAll(() => {
        if (gridObj) {
            // Clean all detail rows before destroy (prevents DOM pollution for later specs like row-reorder hierarchy/child-grid)
            gridObj.detailRowModule.collapseAll();
        }
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Detail row expand/collapse complete events (detailExpanded & detailCollapsed)', () => {
    let gridObj: Grid;
    let detailExpandedFired: boolean = false;
    let detailCollapsedFired: boolean = false;
    let detailExpandFiredBeforeExpanded: boolean = false;
    let detailCollapseFiredBeforeCollapsed: boolean = false;
    let expandedEventArgs: any = null;
    let collapsedEventArgs: any = null;

    describe('detailExpanded event firing', () => {
        beforeAll((done: Function) => {
            detailExpandedFired = false;
            detailExpandFiredBeforeExpanded = false;
            expandedEventArgs = null;
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: '#detailtemplate',
                    detailExpand: (args: any) => {
                        detailExpandFiredBeforeExpanded = true;
                    },
                    detailExpanded: (args: any) => {
                        detailExpandedFired = true;
                        expandedEventArgs = args;
                    },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ]
                }, done);
        });

        it('detailExpanded event fires after detail row is expanded', (done: Function) => {
            (gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            expect(detailExpandedFired).toBe(true);
            expect(detailExpandFiredBeforeExpanded).toBe(true);
            done();
        });

        it('detailExpanded fires after detailExpand event', (done: Function) => {
            detailExpandFiredBeforeExpanded = false;
            detailExpandedFired = false;
            (gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            expect(detailExpandFiredBeforeExpanded).toBe(true);
            expect(detailExpandedFired).toBe(true);
            done();
        });

        it('detailExpanded event args contain rowData', (done: Function) => {
            expect(expandedEventArgs).toBeDefined();
            expect(expandedEventArgs.rowData).toBeDefined();
            done();
        });

        it('detailExpanded event args contain parentRow', (done: Function) => {
            expect(expandedEventArgs).toBeDefined();
            expect(expandedEventArgs.parentRow).toBeDefined();
            expect(expandedEventArgs.parentRow.classList.contains('e-grid')).toBe(false);
            done();
        });

        it('detailExpanded event args contain event property when triggered by user interaction', (done: Function) => {
            expect(expandedEventArgs).toBeDefined();
            expect(expandedEventArgs.event).toBeDefined();
            done();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('detailCollapsed event firing', () => {
        beforeAll((done: Function) => {
            detailCollapsedFired = false;
            detailCollapseFiredBeforeCollapsed = false;
            collapsedEventArgs = null;
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: '#detailtemplate',
                    detailCollapse: (args: any) => {
                        detailCollapseFiredBeforeCollapsed = true;
                    },
                    detailCollapsed: (args: any) => {
                        detailCollapsedFired = true;
                        collapsedEventArgs = args;
                    },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 150 }
                    ]
                }, done);
        });

        it('detailCollapsed event fires after detail row is collapsed', (done: Function) => {
            (gridObj.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            detailCollapsedFired = false;
            (gridObj.getDataRows()[0].querySelector('.e-detailrowexpand') as HTMLElement).click();
            expect(detailCollapsedFired).toBe(true);
            done();
        });

        it('detailCollapsed fires after detailCollapse event', (done: Function) => {
            (gridObj.getDataRows()[1].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            detailCollapseFiredBeforeCollapsed = false;
            detailCollapsedFired = false;
            (gridObj.getDataRows()[1].querySelector('.e-detailrowexpand') as HTMLElement).click();
            expect(detailCollapseFiredBeforeCollapsed).toBe(true);
            expect(detailCollapsedFired).toBe(true);
            done();
        });

        it('detailCollapsed event args contain rowData', (done: Function) => {
            expect(collapsedEventArgs).toBeDefined();
            expect(collapsedEventArgs.rowData).toBeDefined();
            expect(collapsedEventArgs.rowData.OrderID).toBeDefined();
            done();
        });

        it('detailCollapsed event args contain parentRow', (done: Function) => {
            expect(collapsedEventArgs).toBeDefined();
            expect(collapsedEventArgs.parentRow).toBeDefined();
            done();
        });

        it('detailCollapsed event args contain detailRow element', (done: Function) => {
            expect(collapsedEventArgs).toBeDefined();
            expect(collapsedEventArgs.detailRow).toBeDefined();
            expect(collapsedEventArgs.detailRow.classList.contains('e-detailrow')).toBe(true);
            done();
        });

        it('detailCollapsed event fires with collapsed DOM state', (done: Function) => {
            expect(collapsedEventArgs.detailRow.style.display).toBe('none');
            done();
        });

        it('detailCollapsed does not fire when detailCollapse cancellation occurs', (done: Function) => {
            let gridObj2: Grid;
            detailCollapsedFired = false;
            gridObj2 = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: '#detailtemplate',
                    detailCollapse: (args: any) => {
                        args.cancel = true;
                    },
                    detailCollapsed: (args: any) => {
                        detailCollapsedFired = true;
                    },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' }
                    ]
                }, (a: any) => {
                    (gridObj2.getDataRows()[0].querySelector('.e-detailrowcollapse') as HTMLElement).click();
                    (gridObj2.getDataRows()[0].querySelector('.e-detailrowexpand') as HTMLElement).click();
                    expect(detailCollapsedFired).toBe(false);
                    destroy(gridObj2);
                    gridObj2 = null;
                    done();
                });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Multiple rapid expand/collapse actions', () => {
        let expandedCount: number = 0;
        let collapsedCount: number = 0;

        beforeAll((done: Function) => {
            expandedCount = 0;
            collapsedCount = 0;
            gridObj = createGrid(
                {
                    dataSource: filterData,
                    allowPaging: true,
                    detailTemplate: '#detailtemplate',
                    detailExpanded: (args: any) => {
                        expandedCount++;
                    },
                    detailCollapsed: (args: any) => {
                        collapsedCount++;
                    },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 125 },
                        { field: 'Freight', width: 120, format: 'C', textAlign: 'Right' }
                    ]
                }, done);
        });

        it('detailExpanded fires correctly for multiple rows', (done: Function) => {
            for (let i = 0; i < 3; i++) {
                (gridObj.getDataRows()[i].querySelector('.e-detailrowcollapse') as HTMLElement).click();
            }
            expect(expandedCount).toBe(3);
            done();
        });

        it('detailCollapsed fires correctly for multiple rows', (done: Function) => {
            for (let i = 0; i < 3; i++) {
                (gridObj.getDataRows()[i].querySelector('.e-detailrowexpand') as HTMLElement).click();
            }
            expect(collapsedCount).toBe(3);
            done();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
});
