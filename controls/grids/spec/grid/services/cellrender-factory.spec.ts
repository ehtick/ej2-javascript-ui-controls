/**
 * Service Locator spec
 */
import { EmitType } from '@syncfusion/ej2-base';
import { createElement, remove } from '@syncfusion/ej2-base';
import { Grid } from '../../../src/grid/base/grid';
import { ICellRenderer, NotifyArgs } from '../../../src/grid/base/interface';
import { Cell } from '../../../src/grid/models/cell';
import { CellRendererFactory } from '../../../src/grid/services/cell-render-factory';
import { data } from '../base/datasource.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { createGrid, destroy } from '../base/specutil.spec';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { VirtualRowModelGenerator } from '../../../src/grid/services/virtual-row-model-generator';
import { VirtualScroll } from '../../../src/grid/actions/virtual-scroll';
import { InfiniteScroll } from '../../../src/grid/actions/infinite-scroll';
import { Page } from '../../../src/grid/actions/page';
import { Freeze } from '../../../src/grid/actions/freeze';
import { Group } from '../../../src/grid/actions/group';
Grid.Inject(VirtualScroll, InfiniteScroll, Page, Freeze, Group);

describe('CellRendererFactory module', () => {
    describe('Register and get service', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: data, allowPaging: false,
                    columns: [
                        { headerText: 'OrderID', field: 'OrderID' },
                        { headerText: 'CustomerID', field: 'CustomerID' },
                        { headerText: 'EmployeeID', field: 'EmployeeID' },
                        { headerText: 'ShipCountry', field: 'ShipCountry' },
                        { headerText: 'ShipCity', field: 'ShipCity' },
                    ]
                }, done);
        });

        it('Check fallback', () => {
            expect(() => gridObj.serviceLocator.getService<CellRendererFactory>('cellRendererFactory')
                .getCellRenderer('hi')).toThrow('The cellRenderer hi is not found');
        });

        it('Check string register', () => {
            class CellMock implements ICellRenderer<{}> {
                public render(cell: Cell<{}>, data: Object, attributes?: { [x: string]: string }): Element {
                    return createElement('td');
                }
            }

            class DupCellMock extends CellMock { }
            let factory: CellRendererFactory = gridObj.serviceLocator.getService<CellRendererFactory>('cellRendererFactory');
            factory.addCellRenderer('hi', new CellMock);
            factory.addCellRenderer('hi', new DupCellMock);
            expect('hi' in factory.cellRenderMap).toBeTruthy();
            expect(factory.getCellRenderer('hi') instanceof CellMock).toBeTruthy();
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
        });
    });

});

//VirtualRowModelGenerator Coverage
describe('VirtualRowModelGenerator - Coverage', () => {
    let gObj: Grid;

    beforeAll((done: Function) => {
        gObj = createGrid(
            {
                dataSource: data,
                height: 300,
                enableVirtualization: true,
                enableColumnVirtualization: true,
                allowPaging: true,
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'EmployeeID', field: 'EmployeeID' },
                    { headerText: 'ShipCountry', field: 'ShipCountry' },
                    { headerText: 'ShipCity', field: 'ShipCity' },
                ]
            }, done);
    });
    it('should handle getStartIndex with full parameter true', () => {
        const gen: any = new VirtualRowModelGenerator(gObj);
        const index1 = (gen as any).getStartIndex(1, data, true);
        expect(typeof index1).toBe('number');
    });

    it('should handle getStartIndex with full parameter false and even block', () => {
        const gen: any = new VirtualRowModelGenerator(gObj);
        const index = (gen as any).getStartIndex(2, data, false);
        expect(typeof index).toBe('number');
    });

    afterAll(() => {
        destroy(gObj);
    });
});
describe('columnInfiniteRows - enableCache path', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                frozenColumns: 2,
                frozenRows: 2,
                enableVirtualization: true,
                enableInfiniteScrolling: true,
                enableColumnVirtualization: true,
                infiniteScrollSettings: { enableCache: true },
                height: 400,
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'EmployeeID', field: 'EmployeeID' },
                    { headerText: 'ShipCountry', field: 'ShipCountry' },
                    { headerText: 'ShipCity', field: 'ShipCity' },
                ]
            }, done);
    });

    it('should execute columnInfiniteRows with enableCache true', () => {
        const generator: any = new VirtualRowModelGenerator(gridObj);
        const notifyArgs: NotifyArgs = {
            requestType: 'virtualscroll'
        };
        gridObj.pageSettings.currentPage = 1;
        generator.columnInfiniteRows(gridObj.dataSource, notifyArgs);
    });

    it('should execute columnInfiniteRows with enableCache false', () => {
        const generator: any = new VirtualRowModelGenerator(gridObj);
        generator.parent.infiniteScrollSettings.enableCache = false;
        const notifyArgs: NotifyArgs = {
            requestType: 'virtualscroll'
        };
        gridObj.pageSettings.currentPage = 1;
        generator.columnInfiniteRows(gridObj.dataSource, notifyArgs);
    });

    afterAll(() => {
        destroy(gridObj);
    });
});
describe('iterateGroup - group row update logic', () => {
    let gridObj: any;

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                frozenColumns: 2,
                frozenRows: 2,
                enableVirtualization: true,
                allowGrouping: true,
                groupSettings: { columns: ['Column1'] },
                height: 400,
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'EmployeeID', field: 'EmployeeID' },
                    { headerText: 'ShipCountry', field: 'ShipCountry' },
                    { headerText: 'ShipCity', field: 'ShipCity' },
                ]
            }, done);
    });
    it('should execute grouping logic with adaptive virtualization', () => {
        const generator: any = new VirtualRowModelGenerator(gridObj);
        const rows: any = generator.getRows();
        expect(Array.isArray(rows)).toBe(true);
    });
    it('should enter if(res) and shift when at least one group matches', () => {
        const generator: any = new VirtualRowModelGenerator(gridObj);
        const current = [
            { isDataRow: false, data: { field: 'Country', key: 'Spain' } },
            { isDataRow: false, data: { field: 'Country', key: 'Italy' } }
        ];

        const rows = [
            { isDataRow: true, data: {} },
            {
                isDataRow: false,
                data: { field: 'Country', key: 'Italy' }
            }
        ];
        generator.iterateGroup(current, rows);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});
describe('getColumnIndexes - diffWidth calculation paths', () => {
    let gridObj: any;

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                frozenColumns: 2,
                enableVirtualization: true,
                enableColumnVirtualization: true,
                height: 400,
                width: 600,
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID', freeze: 'Left', },
                    { headerText: 'EmployeeID', field: 'EmployeeID', freeze: 'Left', },
                    { headerText: 'ShipCountry', field: 'ShipCountry', freeze: 'Left', },
                    { headerText: 'ShipCity', field: 'ShipCity' },
                ]
            }, done);
    });

    it('should use 2 * cWidth when Browser.isDevice = true', () => {
        const generator: any = new VirtualRowModelGenerator(gridObj);
        window['browserDetails']['isDevice'] = true;
        const headerContent = gridObj.element.querySelector('.e-headercontent');
        generator.getColumnIndexes(headerContent);
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});
describe('generateRows - pin/unpin row request types', () => {
    let gridObj: any;

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                frozenColumns: 2,
                frozenRows: 2,
                enableVirtualization: true,
                height: 400,
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID', freeze: 'Left', },
                    { headerText: 'EmployeeID', field: 'EmployeeID', freeze: 'Left', },

                ]
            }, done);
    });

    it('should reset startIndex on pin-row request', () => {
        const generator: any = new VirtualRowModelGenerator(gridObj);
        generator.startIndex = 100;
        const notifyArgs: NotifyArgs = {
            requestType: 'pin-row',
            virtualInfo: { page: 1, blockIndexes: [1, 2] }
        };
        generator.currentInfo = { blockIndexes: [1, 2] };
        generator.includePrevPage = true;
        generator.generateRows(gridObj.dataSource, notifyArgs);
    });

    it('should reset startIndex on unpin-row request', () => {
        const generator: any = new VirtualRowModelGenerator(gridObj);
        const notifyArgs: NotifyArgs = {
            requestType: 'unpin-row',
            virtualInfo: { page: 1, blockIndexes: [1, 2] }
        };
        generator.generateRows(gridObj.dataSource, notifyArgs);

    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});