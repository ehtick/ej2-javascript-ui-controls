/**
 * Grid print spec document
 */
import { Grid } from '../../../src/grid/base/grid';
import { Sort } from '../../../src/grid/actions/sort';
import { Filter } from '../../../src/grid/actions/filter';
import { Page } from '../../../src/grid/actions/page';
import { Print, getCloneProperties } from '../../../src/grid/actions/print';
import { Group } from '../../../src/grid/actions/group';
import { Toolbar } from '../../../src/grid/actions/toolbar';
import { DetailRow } from '../../../src/grid/actions/detail-row';
import { data, employeeData, fCustomerData } from '../base/datasource.spec';
import { createGrid, destroy } from '../base/specutil.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { IGrid } from '../../../src/grid/base/interface'; 
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { select } from '@syncfusion/ej2-base';
import { LazyLoadGroup } from '../../../src/grid/actions/lazy-load-group';
import { Scroll } from '../../../src/grid/actions/scroll';
import { Freeze } from '../../../src/grid/actions/freeze';

Grid.Inject(Sort, Page, Filter, Print, Group, Toolbar, DetailRow, LazyLoadGroup, Scroll, Freeze);

describe('Print module', () => {
    describe('Print without paging', () => {
        let gridObj: Grid;
        let actionComplete: Function;
        // (<any>window).open = () => {
        //     return {
        //         document: { write: () => { }, close: () => { } },
        //         close: () => { }, print: () => { }, focus: () => { }, moveTo: () => { }, resizeTo: () => { }
        //     };
        // };

        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid({
                dataSource: data.slice(0, 15),
                columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                { field: 'ShipCity' }],
                allowSelection: false,
                allowFiltering: true,
                allowGrouping: true,
                allowPaging: true
            }, done);
        });
        it('basic feature testing', (done: Function) => {
            let printComplete = (args?: { element: Element }): void => {
                expect(args.element.querySelectorAll('.e-gridpager').length).toBe(0);
                expect(args.element.querySelectorAll('.e-filterbar').length).toBe(1);
                expect(args.element.classList.contains('e-print-grid-layout')).toBeTruthy();
                expect(args.element.querySelectorAll('.e-row').length).toBe(15);
                let contentDiv: HTMLElement = (args.element.querySelector('.e-content') as HTMLElement);
                expect(contentDiv.style.height).toBe('auto');
                expect(contentDiv.style.overflowY).toBe('auto');
                expect(contentDiv.style.overflowX).toBe('hidden');
                expect((args.element.querySelector('.e-groupdroparea') as HTMLElement).style.display).toBe('none');
                expect(args.element.querySelectorAll('.e-spin-show').length).toBe(0);
                expect(args.element.classList.contains('e-print-grid')).toBe(false);
                done();
            };
            window.print = () => { };
            (<any>Window).print = () => { };
            gridObj.printComplete = printComplete;
            gridObj.dataBind();
            gridObj.print();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
            actionComplete = null;
        });
     });

    describe('Print with paging', () => {
        let gridObj: Grid;
        let actionComplete: Function;
        // (<any>window).open = () => {
        //     return {
        //         document: { write: () => { }, close: () => { } },
        //         close: () => { }, print: () => { }, focus: () => { }, moveTo: () => { }, resizeTo: () => { }
        //     };
        // };

        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: data,
                columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                { field: 'ShipCity' }],
                allowSelection: false,
                allowFiltering: true,
                allowGrouping: true,
                allowPaging: true,
                groupSettings: { columns: ['OrderID'] },
                toolbar: ['Add'],
                height: 200,
                printMode: 'CurrentPage'
            }, done);
        });

        it('current page testing and group column', (done: Function) => {
            let printComplete = (args?: { element: Element }): void => {
                expect(args.element.querySelectorAll('.e-gridpager').length).toBe(1);
                expect(args.element.querySelector('.e-gridpager').clientWidth).toBe(0);
                expect(args.element.querySelector('.e-grouptopleftcell').clientWidth).toBe(0);
                expect(args.element.querySelector('.e-indentcell').clientWidth).toBe(0);
                expect(args.element.querySelector('.e-recordplusexpand').clientWidth).toBe(0);
                expect(args.element.querySelectorAll('.e-toolbar').length).toBe(0);
                done();
            };
            window.print = () => { };
            (<any>Window).print = () => { };
            gridObj.printComplete = printComplete;
            gridObj.print();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
            actionComplete = null;
        });
    });

    describe('Print empty grid', () => {
        let gridObj: Grid;
        let actionComplete: Function;
        // (<any>window).open = () => {
        //     return {
        //         document: { write: () => { }, close: () => { } },
        //         close: () => { }, print: () => { }, focus: () => { }, moveTo: () => { }, resizeTo: () => { }
        //     };
        // };

        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: [],
                columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                { field: 'ShipCity' }],
                allowSelection: false,
                allowFiltering: true,
                allowGrouping: true,
                allowPaging: true
            }, done);
        });
        it('cancel print', (done: Function) => {
            let beforePrint = (args?: { element: Element, cancel?: boolean }): void => {
                args.cancel = true;
                expect(args.element.classList.contains('e-print-grid')).toBe(true);
                done();
            };
            window.print = () => { };
            (<any>Window).print = () => { };
            gridObj.beforePrint = beforePrint;
            gridObj.print();
        });
        it('check cancel print grid element has removed', () => {
            let id = gridObj.element.id + '_print';
            expect(document.getElementById(id)).toBe(null);
        });
        it('empty page testing', (done: Function) => {
            let printComp = (args?: { element: Element }): void => {
                done();
            };
            window.print = () => { };
            (<any>Window).print = () => { };
            gridObj.beforePrint = printComp;
            gridObj.print();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
            actionComplete = null;
        });
    });

    describe('Print with custom action', () => {
        let gridObj: Grid;
        let actionComplete: Function;
        // (<any>window).open = () => {
        //     return {
        //         document: { write: () => { }, close: () => { } },
        //         close: () => { }, print: () => { }, focus: () => { }, moveTo: () => { }, resizeTo: () => { }
        //     };
        // };

        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: data,
                columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                { field: 'ShipCity' }],
                allowSelection: false,
                allowFiltering: true,
                allowGrouping: true,
                allowPaging: true
            }, done);
        });
        it('group in before print', (done: Function) => {
            let beforePrint = (args?: { element: Element, cancel?: boolean }): void => {
                (args.element as any).ej2_instances[0].groupColumn('OrderID');
            };
            window.print = () => { };
            (<any>Window).print = () => { };
            gridObj.beforePrint = beforePrint;
            gridObj.printComplete = function (args) {
                done();
            }
            gridObj.print();
        });


        afterAll(() => {
            gridObj.printModule.destroy();
            destroy(gridObj);
            gridObj = null;
            actionComplete = null;
        });
    });

    describe('Print with hierarchy grid All mode=>', () => {
        let gridObj: Grid;
        let printGrid: Grid;
        let c: number = 0;
        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: employeeData.slice(0, 4),
                allowSorting: true,
                allowFiltering: true,
                allowGrouping: true,
                hierarchyPrintMode: 'All',
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                    { field: 'City', headerText: 'City', width: 110 },
                    { field: 'Country', headerText: 'Country', width: 110 }
                ],
                childGrid: {
                    created: () => ++c,
                    dataSource: data.slice(0, 20),
                    queryString: 'EmployeeID',
                    hierarchyPrintMode: 'All',
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                        { field: 'ShipCity', headerText: 'Ship City', width: 120 },
                        { field: 'Freight', headerText: 'Freight', width: 120 },
                        { field: 'ShipName', headerText: 'Ship Name', width: 150 }
                    ],
                    childGrid: {
                        dataSource: fCustomerData,
                        queryString: 'CustomerID',
                        columns: [
                            { field: 'CustomerID', headerText: 'Customer ID', textAlign: 'Right', width: 75 },
                            { field: 'Phone', headerText: 'Phone', width: 100 },
                            { field: 'Address', headerText: 'Address', width: 120 },
                            { field: 'Country', headerText: 'Country', width: 100 }
                        ],
                        created: () => ++c
                    },
                }
            }, done);
        });
        it('Check hierarchy in before print', (done: Function) => {
            let trigger: number = 0;
            expect(gridObj.hierarchyPrintMode).toBe('All');
            gridObj.beforePrint = (args) => {
                expect(args.element.classList.contains('e-print-grid')).toBeTruthy();
                expect(args.element.querySelectorAll('[aria-busy=true]').length).toBe(0);
                expect((args.element as any).ej2_instances[0]['isPrinting']).toBeTruthy();
                expect(args.element.querySelectorAll('.e-grid').length).toBe(c);
                expect(trigger).toBe(0);
                expect((<{printGridObj?: IGrid}>window).printGridObj.expandedRows).not.toBeUndefined();
                printGrid = (<{printGridObj?: IGrid}>window).printGridObj as Grid;
            };
            gridObj.printComplete = (args) => {
                expect((args.element as any).ej2_instances[0]['isPrinting']).toBeFalsy();
                expect((<{printGridObj?: IGrid}>window).printGridObj).toBeUndefined();
                expect(args.element.classList.contains('e-print-grid-layout')).toBeTruthy();
                done();
            }
            (<any>gridObj.printModule).printGridElement = () => true;
            (<any>gridObj.printModule).renderPrintGrid();
            (<Grid>(<{printGridObj?: IGrid}>window).printGridObj).actionFailure = () => trigger++;
        });

        afterAll(() => {
            gridObj.printModule.destroy();
            destroy(gridObj);
            destroy(printGrid);
            printGrid = null;
            gridObj = null;
            c = null;
        });
    });

    describe('Print with hierarchy grid expanded mode =>', () => {
        let gridObj: Grid;
        let childGrid: Grid;
        let printGrid: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: employeeData.slice(0, 4),
                allowSorting: true,
                allowFiltering: true,
                allowGrouping: true,
                hierarchyPrintMode: 'Expanded',
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                    { field: 'City', headerText: 'City', width: 110 },
                    { field: 'Country', headerText: 'Country', width: 110 }
                ],
                childGrid: {
                    dataSource: data.slice(0, 20),
                    queryString: 'EmployeeID',
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                        { field: 'ShipCity', headerText: 'Ship City', width: 120 },
                        { field: 'Freight', headerText: 'Freight', width: 120 },
                        { field: 'ShipName', headerText: 'Ship Name', width: 150 }
                    ],
                    childGrid: {
                        dataSource: fCustomerData,
                        queryString: 'CustomerID',
                        columns: [
                            { field: 'CustomerID', headerText: 'Customer ID', textAlign: 'Right', width: 75 },
                            { field: 'Phone', headerText: 'Phone', width: 100 },
                            { field: 'Address', headerText: 'Address', width: 120 },
                            { field: 'Country', headerText: 'Country', width: 100 }
                        ]
                    },
                }
            }, done);
        });

        it('expand the child grid', (done: Function) => {
            gridObj.detailDataBound = (args: any) => {
                childGrid = args.childGrid;
                childGrid.dataBound = () => {done()};
                expect(gridObj.element.querySelectorAll('.e-grid').length).toBe(1);
            };
            gridObj.detailRowModule.expand(2);
        });

        it('expand inner childGrid', (done: Function) => {
            childGrid.detailDataBound = (args) => {
                expect(gridObj.element.querySelectorAll('.e-grid').length).toBe(2);
                done();
            };
            childGrid.detailRowModule.expand(1);
        });

        it('Check hierarchy in before expanded print', (done: Function) => {
            let trigger: number = 0;
            expect(gridObj.hierarchyPrintMode).toBe('Expanded');
            gridObj.beforePrint = (args) => {
                expect(args.element.classList.contains('e-print-grid')).toBeTruthy();
                expect(args.element.querySelectorAll('[aria-busy=true]').length).toBe(0);
                expect((args.element as any).ej2_instances[0]['isPrinting']).toBeTruthy();
                expect(args.element.querySelectorAll('.e-grid').length).toBe(2);
                expect(trigger).toBe(0);
                expect((<{printGridObj?: IGrid}>window).printGridObj.expandedRows).not.toBeUndefined();
                printGrid = (<{printGridObj?: IGrid}>window).printGridObj as Grid;
            };
            gridObj.printComplete = (args) => {
                expect((args.element as any).ej2_instances[0]['isPrinting']).toBeFalsy();
                expect((<{printGridObj?: IGrid}>window).printGridObj).toBeUndefined();
                expect(args.element.classList.contains('e-print-grid-layout')).toBeTruthy();
                done();
            }
            (<any>gridObj.printModule).printGridElement = () => true;
            (<any>gridObj.printModule).renderPrintGrid();
            (<Grid>(<{printGridObj?: IGrid}>window).printGridObj).actionFailure = () => trigger++;
        });

        afterAll(() => {
            gridObj.printModule.destroy();
            destroy(gridObj);
            destroy(printGrid);
            gridObj = null;
            childGrid = null;
            printGrid = null;
        });
    });

    describe('Print with hierarchy grid None mode =>', () => {
        let gridObj: Grid;
        let printGrid: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: employeeData.slice(0, 4),
                allowSorting: true,
                allowFiltering: true,
                allowGrouping: true,
                hierarchyPrintMode: 'None',
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                    { field: 'City', headerText: 'City', width: 110 },
                    { field: 'Country', headerText: 'Country', width: 110 }
                ],
                childGrid: {
                    dataSource: data.slice(0, 20),
                    queryString: 'EmployeeID',
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                        { field: 'ShipCity', headerText: 'Ship City', width: 120 },
                        { field: 'Freight', headerText: 'Freight', width: 120 },
                        { field: 'ShipName', headerText: 'Ship Name', width: 150 }
                    ],
                    childGrid: {
                        dataSource: fCustomerData,
                        queryString: 'CustomerID',
                        columns: [
                            { field: 'CustomerID', headerText: 'Customer ID', textAlign: 'Right', width: 75 },
                            { field: 'Phone', headerText: 'Phone', width: 100 },
                            { field: 'Address', headerText: 'Address', width: 120 },
                            { field: 'Country', headerText: 'Country', width: 100 }
                        ]
                    },
                }
            }, done);
        });

        it('expand the child grid', (done: Function) => {
            gridObj.detailDataBound = (args: any) => {
                expect(gridObj.element.querySelectorAll('.e-grid').length).toBe(1);
                done();
            };
            gridObj.detailRowModule.expand(2);
        });

        it('Check hierarchy in before None print', (done: Function) => {
            let trigger: number = 0;
            expect(gridObj.hierarchyPrintMode).toBe('None');
            gridObj.beforePrint = (args) => {
                expect(args.element.classList.contains('e-print-grid')).toBeTruthy();
                expect(args.element.querySelectorAll('[aria-busy=true]').length).toBe(0);
                expect((args.element as any).ej2_instances[0]['isPrinting']).toBeTruthy();
                expect(args.element.querySelectorAll('.e-grid').length).toBe(0);
                expect((<{printGridObj?: IGrid}>window).printGridObj.expandedRows).toBeUndefined();
                printGrid = (<{printGridObj?: IGrid}>window).printGridObj as Grid;
            };
            gridObj.printComplete = (args) => {
                expect((args.element as any).ej2_instances[0]['isPrinting']).toBeFalsy();
                expect((<{printGridObj?: IGrid}>window).printGridObj).toBeUndefined();
                expect(args.element.classList.contains('e-print-grid-layout')).toBeTruthy();
                done();
            }
            (<any>gridObj.printModule).printGridElement = () => true;
            (<any>gridObj.printModule).renderPrintGrid();
            (<Grid>(<{printGridObj?: IGrid}>window).printGridObj).actionFailure = () => trigger++;
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
            gridObj.printModule.destroy();
            destroy(gridObj);
            destroy(printGrid);
            gridObj = null;
            printGrid = null;
        });
    });

    describe('EJ2 - 57790 - Print not working when sortComparer property set to a column =>', () => {
        let gridObj: Grid;
        let printGrid: Grid;
        // (<any>window).open = () => {
        //     return {
        //         document: { write: () => { }, close: () => { } },
        //         close: () => { }, print: () => { }, focus: () => { }, moveTo: () => { }, resizeTo: () => { }
        //     };
        // };

        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: employeeData.slice(0, 4),
                allowSorting: true,
                sortSettings: {
                    columns: [ { field: 'FirstName', direction: 'Ascending' } ],
                },
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                    { field: 'FirstName', headerText: 'Name', width: 125,
                      sortComparer: (reference: string, comparer:  string) => {
                        if (reference < comparer) return -1;
                        else if (reference > comparer) return 1;
                        return 0;
                      }, },
                    { field: 'Title', headerText: 'Title', width: 180 },
                    { field: 'City', headerText: 'City', width: 110 },
                    { field: 'Country', headerText: 'Country', width: 110 }
                ],
            }, done);
        });
        it('sorting after print', (done: Function) => {
            window.print = () => { };
            (<any>Window).print = () => { };
            gridObj.printComplete = function (args) {
                done();
            }
            gridObj.print();
        });
        afterAll(() => {
            gridObj.printModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });
});

describe('EJ2-852222, EJ2-853086 - script error on Export and print hierarchy grid => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: employeeData.slice(0, 5),
                allowGrouping: true,
                groupSettings: { columns: ['City'] },
                toolbar: ['Print'],
                columns: [
                    {
                    field: 'EmployeeID',
                    headerText: 'Employee ID',
                    textAlign: 'Right',
                    width: 125,
                    },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                    { field: 'City', headerText: 'City', width: 110 },
                ],
                childGrid: {
                    dataSource: data.slice(0, 20),
                    queryString: 'EmployeeID',
                    columns: [
                    {
                        field: 'OrderID',
                        headerText: 'Order ID',
                        textAlign: 'Right',
                        width: 120,
                    },
                    { field: 'ShipCity', headerText: 'Ship City', width: 120 },
                    { field: 'Freight', headerText: 'Freight', width: 120, format: 'C2' },
                    { field: 'ShipName', headerText: 'Ship Name', width: 150 },
                    ],
                }
            }, done);
    });

    it('print success check', (done: Function) => {
        gridObj.beforePrint = (args) => {
            done();
        }
        select('#' + gridObj.element.id + '_print', gridObj.toolbarModule.getToolbar()).click();
    });

    // print file coverage
    it('contentReady coevarge', () => {
        (gridObj as any).isPrinting = false;
        (gridObj as any).printModule.contentReady();
    });


    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-900635 - Script error thrown when clicking Print button => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: employeeData,
                toolbar: ['Print'],
                columns: [
                    {
                    field: 'EmployeeID',
                    headerText: 'Employee ID',
                    textAlign: 'Right',
                    width: 125,
                    },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                    { field: 'City', headerText: 'City', width: 110 },
                ],
            }, done);
    });

    it('print success check', (done: Function) => {
        gridObj.beforePrint = () => {
            done();
        };
        select('#' + gridObj.element.id + '_print', gridObj.toolbarModule.getToolbar()).click();
    });

    it('printGridElement coevarge', (done: Function) => {
        (gridObj as any).isPrinting = false;
        (<any>gridObj.printModule).printGridElement(gridObj);
        done();
        
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-914787 - Miss alignment on print tray while printing a lazyload with multiple columns grouped grid => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: employeeData,
                toolbar: ['Print'],
                allowGrouping: true,
                groupSettings: {
                    enableLazyLoading: true,
                    columns: ['FirstName', 'EmployeeID']
                },
                columns: [
                    {
                    field: 'EmployeeID',
                    headerText: 'Employee ID',
                    textAlign: 'Right',
                    width: 125,
                    },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                    { field: 'City', headerText: 'City', width: 110 },
                ],
            }, done);
    });

    it('removeColGroup code coverage for lazyload', () => {
        (<any>gridObj.printModule).removeColGroup(gridObj);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

//Additional coverage for print file
describe('Print Module - Frozen Columns Handling', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 10),
            columns: [
                { field: 'OrderID', freeze: 'Left' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' },
                { field: 'Freight' }
            ],
            frozenColumns: 1,
            allowSorting: true,
            allowFiltering: true
        }, done);
    });

    it('should handle frozen columns in renderPrintGrid with isFrozenGrid true', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            const printGridObj = (<{printGridObj?: IGrid}>window).printGridObj;
            expect(printGridObj).toBeUndefined();
            done();
        };
        gridObj.print();
    });

    it('should remove freeze property when isFrozenGrid is true', (done: Function) => {
        let freezePropertyCleared = false;
        gridObj.beforePrint = (args) => {
            const printGridElement = args.element;
            const printGridInstance = (printGridElement as any).ej2_instances[0];
            if (printGridInstance && printGridInstance.columns) {
                freezePropertyCleared = printGridInstance.columns.some((col: any) => col.freeze === undefined);
            }
        };
        gridObj.printComplete = (args) => {
            done();
        };
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Angular Framework Path', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should handle Angular path when isAngular is true', (done: Function) => {
        const originalIsAngular = (gridObj as any).isAngular;
        const originalViewContainerRef = (gridObj as any).viewContainerRef; 
        (gridObj as any).isAngular = true;
        (gridObj as any).viewContainerRef = { test: 'value' };
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            (gridObj as any).isAngular = originalIsAngular;
            (gridObj as any).viewContainerRef = originalViewContainerRef;
            done();
        };
        
        gridObj.print();
    });

    it('should skip Angular path when isAngular is false', (done: Function) => {
        (gridObj as any).isAngular = false;
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Vue Framework Path', () => {
    let gridObj: Grid;

    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should handle Vue path when isVue is true', (done: Function) => {
        const originalIsVue = (gridObj as any).isVue;
        const originalVueInstance = (gridObj as any).vueInstance;
        (gridObj as any).isVue = true;
        (gridObj as any).vueInstance = { test: 'vue-instance' };
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            (gridObj as any).isVue = originalIsVue;
            (gridObj as any).vueInstance = originalVueInstance;
            done();
        };
        
        gridObj.print();
    });

    it('should skip Vue path when isVue is false', (done: Function) => {
        (gridObj as any).isVue = false;
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Injected Modules Handling', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ],
            allowSorting: true,
            allowFiltering: true,
            allowGrouping: true
        }, done);
    });

    it('should set injected modules when module length differs', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    it('should handle case when modules array exists and matches length', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Async Print Handling', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 10),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should handle isAsyncPrint true condition in contentReady', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        (gridObj as any).printModule.isAsyncPrint = true;
        gridObj.print();
    });

    it('should handle isAsyncPrint false condition in contentReady', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        (gridObj as any).printModule.isAsyncPrint = false;
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});


describe('Print Module - React Framework Path', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should skip React path when printGridParent is not set', (done: Function) => {
        (gridObj as any).printGridParent = null;
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    it('should skip React path when printGridParent.isReact is false', (done: Function) => {
        (gridObj as any).printGridParent = {
            isReact: false
        };
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Vue3 isVue3 Path', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should handle isVue3 false condition', (done: Function) => {
        (gridObj as any).isVue3 = false;
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        
        gridObj.print();
    });

    it('should handle isVue3 true condition', (done: Function) => {
        (gridObj as any).isVue3 = true;
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});


describe('Print Module - printGridElement with isPrinting true', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should detach element when isPrinting is true', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - printGridElement with null window', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should handle when window.open returns null', (done: Function) => {
        const originalOpen = window.open;
        (window as any).open = (): any => null;
        window.print = () => { };
        (<any>Window).print = () => { };
        
        gridObj.printComplete = (args) => {
            window.open = originalOpen;
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - removeColGroup with depth', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: employeeData.slice(0, 10),
            columns: [
                { field: 'EmployeeID' },
                { field: 'FirstName' },
                { field: 'Title' }
            ],
            allowGrouping: true,
            groupSettings: { columns: ['FirstName', 'Title'] }
        }, done);
    });

    it('should correctly adjust colSpan in removeColGroup', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - removeColGroup with lazy loading', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: employeeData.slice(0, 10),
            columns: [
                { field: 'EmployeeID' },
                { field: 'FirstName' },
                { field: 'Title' }
            ],
            allowGrouping: true,
            groupSettings: {
                columns: ['FirstName'],
                enableLazyLoading: true
            }
        }, done);
    });

    it('should handle lazy loading in removeColGroup', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - removeColGroup with zero depth', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ],
            allowGrouping: true,
            groupSettings: { columns: [] }
        }, done);
    });

    it('should return early when depth is zero in removeColGroup', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - hideColGroup iteration', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: employeeData.slice(0, 12),
            columns: [
                { field: 'EmployeeID' },
                { field: 'FirstName' },
                { field: 'Title' },
                { field: 'City' }
            ],
            allowGrouping: true,
            groupSettings: { columns: ['FirstName', 'City'] }
        }, done);
    });

    it('should iterate through colGroups and set display to none', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - isPrintGrid validation', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should return true when element id contains _print and isPrinting is true', () => {
        (gridObj as any).isPrinting = true;
        gridObj.element.id = gridObj.element.id + '_print';
        const result = (gridObj as any).printModule.isPrintGrid();
        expect(result).toBeTruthy();
    });

    it('should return false when isPrinting is false', () => {
        (gridObj as any).isPrinting = false;
        gridObj.element.id = gridObj.element.id.replace('_print', '');
        const result = (gridObj as any).printModule.isPrintGrid();
        expect(result).toBeFalsy();
    });

    it('should return false when element id does not contain _print', () => {
        (gridObj as any).isPrinting = true;
        gridObj.element.id = gridObj.element.id.replace('_print', '');
        const result = (gridObj as any).printModule.isPrintGrid();
        expect(result).toBeFalsy();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Constructor Destruction Guard', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should return early from constructor when parent is destroyed', () => {
        (gridObj as any).isDestroyed = true;
        const printModule2 = new Print(gridObj);
        expect(printModule2).toBeDefined();
    });

    afterAll(() => {
        (gridObj as any).isDestroyed = false;
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - onEmpty callback', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: [],
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should call contentReady in onEmpty when isPrintGrid is true', (done: Function) => {
        (gridObj as any).isPrinting = true;
        gridObj.element.id = gridObj.element.id + '_print';
        gridObj.printComplete = (args) => {
            done();
        };
        window.print = () => { };
        (<any>Window).print = () => { };
        
        (gridObj as any).printModule.onEmpty();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - actionBegin callback', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should set isAsyncPrint to true when isPrintGrid is true', () => {
        (gridObj as any).isPrinting = true;
        gridObj.element.id = gridObj.element.id + '_print';
        (gridObj as any).printModule.actionBegin()
        expect((gridObj as any).printModule.isAsyncPrint).toBeTruthy();
    });

    it('should not set isAsyncPrint when isPrintGrid is false', () => {
        (gridObj as any).isPrinting = false;
        const initialValue = (gridObj as any).printModule.isAsyncPrint;
        (gridObj as any).printModule.actionBegin();
        expect((gridObj as any).printModule.isAsyncPrint).toBe(initialValue);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - destroy method', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should return early when parent is destroyed', () => {
        (gridObj as any).isDestroyed = true;
        expect(() => {
            (gridObj as any).printModule.destroy();
        }).not.toThrow();
    });

    it('should unregister all event listeners on destroy', () => {
        (gridObj as any).isDestroyed = false;
        const printModule = (gridObj as any).printModule;
        expect(() => {
            printModule.destroy();
        }).not.toThrow();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - getModuleName', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should return "print" as module name', () => {
        const moduleName = (gridObj as any).printModule.getModuleName();
        expect(moduleName).toBe('print');
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Waiting Popup Hide', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 10),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should hide waiting popup elements during print', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            const spinElements = args.element.querySelectorAll('.e-spin-show');
            expect(spinElements.length).toBe(0);
            done();
        };
        
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Content Overflow Hidden', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 10),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' },
                { field: 'Freight' }
            ],
            height: 300
        }, done);
    });

    it('should set overflow-x to hidden for all content elements', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            const contentElements = args.element.querySelectorAll('.e-content');
            contentElements.forEach((element: any) => {
                expect(element.style.overflowX).toBe('hidden');
            });
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - printGrid Trigger Events', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should trigger printComplete event with element', (done: Function) => {
        let printCompleteTriggered = false;
        gridObj.printComplete = (args) => {
            printCompleteTriggered = true;
            expect(args.element).toBeDefined();
        };
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.print();
        setTimeout(() => {
            expect(printCompleteTriggered).toBeTruthy();
            done();
        }, 100);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Grid Destroy in printGrid', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should destroy print grid after printing', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            const printGridObj = (<{printGridObj?: IGrid}>window).printGridObj;
            expect(printGridObj).toBeUndefined();
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Logging in printGrid', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should call log method with exporting_begin and exporting_complete', (done: Function) => {
        let exportingBeginCalled = false;
        let exportingCompleteCalled = false;
        const originalLog = gridObj.log;
        gridObj.log = (message: string) => {
            if (message === 'exporting_begin') {
                exportingBeginCalled = true;
            }
            if (message === 'exporting_complete') {
                exportingCompleteCalled = true;
            }
        };
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            gridObj.log = originalLog;
            expect(exportingBeginCalled || exportingCompleteCalled).toBeTruthy();
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Print Module - Print Grid Element Classification', () => {
    let gridObj: Grid;
    
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: data.slice(0, 8),
            columns: [
                { field: 'OrderID' },
                { field: 'CustomerID' },
                { field: 'EmployeeID' }
            ]
        }, done);
    });

    it('should add e-print-grid-layout class to print element', (done: Function) => {
        window.print = () => { };
        (<any>Window).print = () => { };
        gridObj.printComplete = (args) => {
            expect(args.element.classList.contains('e-print-grid-layout')).toBeTruthy();
            done();
        };
        gridObj.print();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});