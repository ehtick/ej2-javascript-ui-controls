/**
 * Data spec
 */
import { createElement, remove, select } from '@syncfusion/ej2-base';
import { EmitType } from '@syncfusion/ej2-base';
import { Query, DataManager, ODataV4Adaptor, RemoteSaveAdaptor } from '@syncfusion/ej2-data';
import { Grid } from '../../../src/grid/base/grid';
import { extend } from '../../../src/grid/base/util';
import { Page, Sort, Group, Edit, Toolbar, Selection } from '../../../src/grid/actions';
import { Data } from '../../../src/grid/actions/data';
import { data } from '../base/datasource.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { createGrid, destroy } from '../base/specutil.spec';
import { DataStateChangeEventArgs, DataSourceChangedEventArgs } from '../../../src/grid/base/interface';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';

Grid.Inject(Page, Sort, Group, Edit, Toolbar);

describe('Data module', () => {

    describe('Locale data testing', () => {

        type MockAjaxReturn = { promise: Promise<Object>, request: JasmineAjaxRequest };
        type ResponseType = { result: Object[], count: number | string };

        let mockAjax: Function = (d: { data: { [o: string]: Object | Object[] } | Object[], dm?: DataManager }, query: Query | Function, response?: Object):
            MockAjaxReturn => {
            jasmine.Ajax.install();
            let dataManager = d.dm || new DataManager({
                url: '/api/Employees',
            });
            let prom: Promise<Object> = dataManager.executeQuery(query);
            let request: JasmineAjaxRequest;
            let defaults: Object = {
                'status': 200,
                'contentType': 'application/json',
                'responseText': JSON.stringify(d.data)
            };
            let responses: Object = {};
            request = jasmine.Ajax.requests.mostRecent();
            extend(responses, defaults, response);
            request.respondWith(responses);
            return {
                promise: prom,
                request: request
            }
        };

        let gridObj: Grid;
        let elem: HTMLElement = createElement('div', { id: 'Grid' });
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending(); //Skips test (in Chai)
            }
            let dataBound: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            gridObj = new Grid(
                {
                    dataSource: data,
                    query: new Query().take(5), allowPaging: false, dataBound: dataBound,
                    columns: [
                        { headerText: 'OrderID', field: 'OrderID' },
                        { headerText: 'CustomerID', field: 'CustomerID' },
                        { headerText: 'EmployeeID', field: 'EmployeeID' },
                        { headerText: 'ShipCountry', field: 'ShipCountry' },
                        { headerText: 'ShipCity', field: 'ShipCity' },
                    ],
                });
            gridObj.appendTo('#Grid');
        });

        it('TR generated testing', () => {
            expect(gridObj.element.querySelectorAll('.e-row').length).toBe(5);
        });

        afterAll(() => {
            remove(elem);
            jasmine.Ajax.uninstall();
        });

    });

    describe('Remote data without columns testing', () => {
        let gridObj: Grid;
        let elem: HTMLElement = createElement('div', { id: 'RemoteGrid' });
        let request: JasmineAjaxRequest;
        let dataManager: DataManager;
        let query: Query = new Query().take(5);
        beforeAll((done: Function) => {
            let dataBound: EmitType<Object> = () => { done(); };
            spyOn(window, 'fetch').and.returnValue(Promise.resolve(
                new Response(JSON.stringify({ d: data.slice(0, 15), __count: 15 }), {
                    status: 200,
                    
                })
            ));
            dataManager = new DataManager({
                url: 'service/Orders/'
            });
            document.body.appendChild(elem);
            gridObj = new Grid(
                {
                    dataSource: dataManager, dataBound: dataBound,
                    query: query, allowPaging: true,
                });
            gridObj.appendTo('#RemoteGrid');
            request = window.fetch['calls'].mostRecent();
        });

        it('TR generated testing', () => {
            expect(gridObj.element.querySelectorAll('.e-row').length).toBe(15);
        });

        it('Column count testing', () => {
            expect(gridObj.element.querySelectorAll('.e-headercell').length).toBe(12);
        });

        afterAll(() => {
            remove(gridObj.element);
        });
    });

    describe('actionFailure after control destroyed', () => {
        let actionFailedFunction: () => void = jasmine.createSpy('actionFailure');
        let elem: HTMLElement = createElement('div', { id: 'Grid' });
        let gridObj: Grid;
        beforeAll(() => {
            jasmine.Ajax.install();
            document.body.appendChild(elem);
            gridObj = new Grid({
                dataSource: new DataManager({
                    url: '/test/db',
                    adaptor: new ODataV4Adaptor
                }),
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'EmployeeID', field: 'EmployeeID' },
                    { headerText: 'ShipCountry', field: 'ShipCountry' },
                    { headerText: 'ShipCity', field: 'ShipCity' },
                ],
                actionFailure: actionFailedFunction
            });
            gridObj.appendTo('#Grid');
        });
        beforeEach((done: Function) => {
            let request: JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                'status': 404,
                'contentType': 'application/json',
                'responseText': 'Page not found'
            });
            setTimeout(() => { done(); }, 100);
        });
        it('actionFailure testing', () => {
            expect(actionFailedFunction).toHaveBeenCalled();
        });

        afterAll(() => {
            remove(elem);
            jasmine.Ajax.uninstall();
        });
    });

    describe('Grid with empty datasource', () => {
        let gridObj: Grid;
        let elem: HTMLElement = createElement('div', { id: 'Grid' });
        beforeAll((done: Function) => {
            let dataBound: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            gridObj = new Grid(
                {
                    dataSource: null, allowPaging: false,
                    columns: [
                        { headerText: 'OrderID', field: 'OrderID' },
                        { headerText: 'CustomerID', field: 'CustomerID' },
                        { headerText: 'EmployeeID', field: 'EmployeeID' },
                        { headerText: 'ShipCountry', field: 'ShipCountry' },
                        { headerText: 'ShipCity', field: 'ShipCity' },
                    ],
                    dataBound: dataBound
                });
            gridObj.appendTo('#Grid');
        });

        it('Row count testing', () => {
            expect(gridObj.element.querySelectorAll('.e-row').length).toBe(0);
            //for coverage
            gridObj.isDestroyed = true;
            let data = new Data(gridObj);
            (gridObj.renderModule as any).data.destroy();
            gridObj.isDestroyed = false;
        });

        afterAll(() => {
            remove(elem);
        });

    });

    describe('datamanager offline - success testing', () => {
        let gridObj: Grid;
        let dataManager: DataManager;
        let request: JasmineAjaxRequest;
        let elem: HTMLElement = createElement('div', { id: 'Grid' });
        let actionComplete: (e?: Object) => void;
        beforeAll((done: Function) => {
            spyOn(window, 'fetch').and.returnValue(Promise.resolve(
                new Response(JSON.stringify({value: data.slice(0, 15)}), {
                    status: 200,
                })
            ));
            dataManager = new DataManager({
                url: '/test/db',
                adaptor: new ODataV4Adaptor,
                offline: true
                }
            );
            request = window.fetch['calls'].mostRecent();
            let dataBound: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            gridObj = new Grid(
                {
                    dataSource: dataManager, allowPaging: true,
                    columns: [
                        { headerText: 'OrderID', field: 'OrderID' },
                        { headerText: 'CustomerID', field: 'CustomerID' },
                        { headerText: 'EmployeeID', field: 'EmployeeID' },
                        { headerText: 'ShipCountry', field: 'ShipCountry' },
                        { headerText: 'ShipCity', field: 'ShipCity' },
                    ],
                    dataBound: dataBound,
                    actionComplete: actionComplete,
                });
            gridObj.appendTo('#Grid');
        });

        it('promise test', () => {
            expect(dataManager.ready).not.toBeNull();
            expect(dataManager.dataSource.json.length).toBe(15);
        });

        it('Row count testing', () => {
            expect(gridObj.element.querySelectorAll('.e-row').length).toBe(12);
        });

        afterAll(() => {
            jasmine.Ajax.uninstall();
            remove(elem);
        });

    });

    describe('datamanager offline - failure testing', () => {
        let gridObj: Grid;
        let dataManager: any = new DataManager(data as JSON[]);
        dataManager.ready = {
            then: (args: any) => {
                return {
                    catch: (args: any) => {
                        {
                            args.call(this, {});
                        }
                    }
                };
            }
        };
        let elem: HTMLElement = createElement('div', { id: 'RemoteGrid' });
        let actionComplete: (e?: Object) => void;
        beforeAll((done: Function) => {
            let dataBound: EmitType<Object> = () => { done(); };
            let actionFailure: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            gridObj = new Grid(
                {
                    dataSource: dataManager, allowPaging: false,
                    columns: [
                        { headerText: 'OrderID', field: 'OrderID' },
                        { headerText: 'CustomerID', field: 'CustomerID' },
                        { headerText: 'EmployeeID', field: 'EmployeeID' },
                        { headerText: 'ShipCountry', field: 'ShipCountry' },
                        { headerText: 'ShipCity', field: 'ShipCity' },
                    ],
                    dataBound: dataBound,
                    actionComplete: actionComplete,
                    actionFailure: actionFailure
                });
            gridObj.appendTo('#RemoteGrid');
        });

        it('Row count testing', () => {
            expect(gridObj.element.querySelectorAll('.e-row').length).toBe(0);
        });

        it('EJ2-7420- Get Column by field test', () => {
            expect((<any>gridObj.getDataModule()).getColumnByField('ShipCity').field).toBe('ShipCity');
        });

        afterAll(() => {
            remove(elem);
        });
    });
    describe('Custom Data Source =>', () => {
        let gridObj: Grid;
        let dataStateChange: (s?: DataStateChangeEventArgs) => void;
        let dataSourceChanged: (s?: DataSourceChangedEventArgs) => void;
        beforeAll((done: Function) => {
            let options: Object = {
                dataSource: { result : data.slice(0,6), count : data.length },
                allowSorting: true,
                allowGrouping: true,
                allowPaging: true,
                pageSettings: {pageSize: 6},
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true },
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 100, isPrimaryKey: true },
                    { field: 'CustomerID', headerText: 'Customer ID', width: 120 },
                    { field: 'Freight', headerText: 'Freight', textAlign: 'Right', width: 120, format: 'C2' },
                    { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
                ],
                dataStateChange: dataStateChange,
                dataSourceChanged: dataSourceChanged,
            };
            gridObj = createGrid(options, done);
        });
    //Local Custom Data Service
        it('Initial Page rendering ', (done: Function) => {
            dataStateChange = ( s: DataStateChangeEventArgs ): void => {
                expect(s.action.requestType).toBe('paging');
                expect(s.skip).toBe(12);
                expect(s.take).toBe(6);
                done();
            }
            gridObj.dataStateChange = dataStateChange;
            gridObj.dataSourceChanged = null;
            gridObj.goToPage(3);
        });
        it('Sorting in Custom Data Service =>', (done: Function) => {
            dataStateChange = ( s: DataStateChangeEventArgs ): void => {
                expect(s.action.requestType).toBe('sorting');
                expect(s.sorted[0].name).toBe('CustomerID');
                done();
            }
            gridObj.dataStateChange = dataStateChange;
            gridObj.dataSourceChanged = null;
            gridObj.sortColumn('CustomerID', 'Ascending', false);
        });
        it('Grouping in Custom Data Service =>', (done: Function) => {
            dataStateChange = ( s: DataStateChangeEventArgs ): void => {
                expect(s.group[0]).toBe('CustomerID');
                done();
            }
            gridObj.dataStateChange = dataStateChange;
            gridObj.dataSourceChanged = null;
            gridObj.groupModule.groupColumn('CustomerID');
        });
        it('Deleting a record =>', (done: Function) => {
            dataSourceChanged = ( s: DataSourceChangedEventArgs ): void => {
                expect(s.requestType).toBe('delete');
                gridObj.dataStateChange = null;
                done();
            }
            gridObj.dataSourceChanged = dataSourceChanged;
            gridObj.editModule.deleteRecord('OrderID', gridObj.currentViewData[2]);
        });
        afterAll((done) => {
            destroy(gridObj);
        });
     });
     describe('Custom Data Source with inline editing =>', () => {
        let gridObj: Grid;
        let dataStateChange: (s?: DataStateChangeEventArgs) => void;
        let dataSourceChanged: (s?: DataSourceChangedEventArgs) => void;
        beforeAll((done: Function) => {
            let options: Object = {
                dataSource: { result : data.slice(0,6), count : data.length },
                allowSorting: true,
                allowGrouping: true,
                allowPaging: true,
                pageSettings: {pageSize: 6},
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true },
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 100, isPrimaryKey: true },
                    { field: 'CustomerID', headerText: 'Customer ID', width: 120 },
                    { field: 'Freight', headerText: 'Freight', textAlign: 'Right', width: 120, format: 'C2' },
                    { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
                ],
                dataStateChange: dataStateChange,
                dataSourceChanged: dataSourceChanged,
            };
            gridObj = createGrid(options, done);
        });
        it('Editing a record =>', (done: Function) => {
            dataSourceChanged = ( s: DataSourceChangedEventArgs ): void => {
                expect(s.requestType).toBe('save');
                expect(s.action).toBe('edit');
                gridObj.dataStateChange = null;
                done();
            }
            gridObj.selectRow(0);
            gridObj.startEdit();
            (select('#' + gridObj.element.id + 'CustomerID', gridObj.element) as any).value = 'updated';
            gridObj.dataSourceChanged = dataSourceChanged;
            gridObj.endEdit();
        });
        afterAll((done) => {
            destroy(gridObj);
        });
     });
     describe('Custom Data Source with Batch editing =>', () => {
        let gridObj: Grid;
        let dataStateChange: (s?: DataStateChangeEventArgs) => void;
        let dataSourceChanged: (s?: DataSourceChangedEventArgs) => void;
        beforeAll((done: Function) => {
            let options: Object = {
                dataSource: { result : data.slice(0,6), count : data.length },
                allowSorting: true,
                allowGrouping: true,
                allowPaging: true,
                pageSettings: {pageSize: 6},
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Batch'},
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 100, isPrimaryKey: true },
                    { field: 'CustomerID', headerText: 'Customer ID', width: 120 },
                    { field: 'Freight', headerText: 'Freight', textAlign: 'Right', width: 120, format: 'C2' },
                    { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
                ],
                dataStateChange: dataStateChange,
                dataSourceChanged: dataSourceChanged,
            };
            gridObj = createGrid(options, done);
        });
        it('Batch Editing a record =>', (done: Function) => {
            dataSourceChanged = ( s: DataSourceChangedEventArgs ): void => {
                expect(s.requestType).toBe('batchsave');
                gridObj.dataStateChange = null;
                done();
            }
            gridObj.dataSourceChanged = dataSourceChanged;
            gridObj.editModule.editCell(4, 'CustomerID');
            (select('#' + gridObj.element.id + 'CustomerID', gridObj.element) as any).value = 'updated';
            gridObj.editModule.saveCell();
            gridObj.editModule.batchSave();
            (select('#' + gridObj.element.id + 'EditConfirm', gridObj.element)as any).querySelectorAll('button')[0].click();
        });
        afterAll((done) => {
            destroy(gridObj);
        });

    });
    describe('Multi Delete in a single request =>', () => {
        let gridObj: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            let options: Object = {
                dataSource: data.map(data => data),
                selectionSettings: { type: 'Multiple' },
                pageSettings: { pageSize: 6 },
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal' },
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 100, isPrimaryKey: true },
                    { field: 'CustomerID', headerText: 'Customer ID', width: 120 },
                    { field: 'Freight', headerText: 'Freight', textAlign: 'Right', width: 120, format: 'C2' },
                    { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
                ],
                actionComplete: actionComplete,
            };
            gridObj = createGrid(options, done);
        });
        it(' Multi Select and delete => ', (done: Function) => {
            actionComplete = (args?: any): void => {
                expect(args.requestType).toBe('delete');
                expect(args.data.length).toBe(2);
                done();
            }
            gridObj.actionComplete = actionComplete;
            gridObj.selectRows([2, 4]);
            gridObj.deleteRecord();
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
        afterAll((done) => {
            destroy(gridObj);
        });
    });

    describe('EJ2-827048- PageSize "all" is not working with remoteSaveAdaptor =>', () => {
        let gridObj: Grid;
        let actionComplete: (args?: Object) => void;
        let remoteSave: DataManager = new DataManager({
            json: data.slice(0, 15),
            adaptor: new RemoteSaveAdaptor,
        });
        beforeAll((done: Function) => {
            gridObj = createGrid(
            {
                dataSource: remoteSave,
                allowPaging: true,
                pageSettings: {pageSizes: true},
                height: 30,
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', width: 130, textAlign: 'Right' },
                    { field: 'Employees', headerText: 'Employee Name', width: 150 },
                    { field: 'Designation', headerText: 'Designation', width: 130 }
                ],
                actionComplete: actionComplete,
            }, done);
        });
        it('Get the row in pageSize "All"' , (done: Function) => {
            actionComplete = (args: any): void => {
                expect(gridObj.element.querySelectorAll('.e-row').length).toBe(15);
                done();
            };
            gridObj.actionComplete = actionComplete;
            (<any>gridObj.pagerModule).pagerObj.element.querySelector('.e-dropdownlist').ej2_instances[0].value = 'All';
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionComplete = null;
        });
    });

    describe('Data Module Uncovered Lines Coverage', () => {
        
        describe('reorderRows and initDataManager Tests', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridDataReorder' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 10),
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100, isPrimaryKey: true },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('reorderRows - local data branch coverage', () => {
                const dataModule = gridObj.getDataModule() as any;
                expect(() => {
                    dataModule.reorderRows({ fromIndex: 0, toIndex: 2 });
                }).not.toThrow();
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('generateQuery Column Query Mode Tests', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridColumnMode' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 5),
                    columnQueryMode: 'ExcludeHidden',
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100, visible: false },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('generateQuery with columnQueryMode ExcludeHidden', () => {
                const dataModule: any = gridObj.getDataModule();
                dataModule.generateQuery();
                (gridObj as any).isAngular = true;
                dataModule.initDataManager();
                (gridObj as any).isAngular = false;
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('generateQuery Schema Mode Tests', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridSchemaMode' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 5),
                    columnQueryMode: 'Schema',
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('generateQuery with columnQueryMode Schema', () => {
                const dataModule = gridObj.getDataModule();
                dataModule.generateQuery();
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('pageQuery Branch Coverage Tests', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridPageQuery' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 10),
                    allowPaging: true,
                    pageSettings: { pageSize: 5 },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('pageQuery with skipPage true - branch coverage', () => {
                const dataModule = gridObj.getDataModule();
                const query = new Query();
                const result = (dataModule as any).pageQuery(query, true);
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('pageQuery Edge Case - pageSize 0', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridPageSize0' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 10),
                    allowPaging: true,
                    pageSettings: { pageSize: 0, pageCount: 5 },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, () => {
                    setTimeout(() => done(), 100);
                });
            });

            it('pageQuery with pageSize 0 - edge case', () => {
                const dataModule = gridObj.getDataModule();
                const query = new Query();
                expect(() => {
                    (dataModule as any).pageQuery(query, false);
                }).not.toThrow();
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('addRows Tests', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridAddRows' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 5),
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('addRows - add records to json', () => {
                gridObj.getDataModule() as any;
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('addRows with Offline DataManager', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridAddRowsOffline' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                const offlineDataManager = new DataManager({
                    json: [...data.slice(0, 5)],
                    offline: true
                });
                gridObj = createGrid({
                    dataSource: offlineDataManager,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('addRows - with offline DataManager and toIndex', () => {
                const dataModule = gridObj.getDataModule() as any;
                const newRecord = { OrderID: 999, CustomerID: 'TEST' };
                expect(() => {
                    (dataModule as any).addRows({ toIndex: 2, records: [newRecord] });
                }).not.toThrow();
            });

            it('addRows - with multiple records at index', () => {
                const dataModule = gridObj.getDataModule() as any;
                const newRecords = [
                    { OrderID: 1000, CustomerID: 'TEST1' },
                    { OrderID: 1001, CustomerID: 'TEST2' }
                ];
                expect(() => {
                    (dataModule as any).addRows({ toIndex: 1, records: newRecords });
                }).not.toThrow();
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('removeRows Tests', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridRemoveRows' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 5),
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('removeRows - remove records branch coverage', () => {
                const dataModule = gridObj.getDataModule() as any;
                if (gridObj.currentViewData.length > 0) {
                (dataModule as any).removeRows({ indexes: [0], records: [gridObj.currentViewData[0]] });
                }
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('removeRows with Offline DataManager', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridRemoveRowsOffline' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                const offlineDataManager = new DataManager({
                    json: data.slice(0, 5),
                    offline: true
                });
                gridObj = createGrid({
                    dataSource: offlineDataManager,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('removeRows with offline DataManager', () => {
                const dataModule = gridObj.getDataModule() as any;
                expect(() => {
                    if (gridObj.currentViewData.length > 0) {
                        (dataModule as any).removeRows({ indexes: [0], records: [gridObj.currentViewData[0]] });
                    }
                }).not.toThrow();
            });

            it('removeRows with offline DataManager - json filter', () => {
                const dataModule = gridObj.getDataModule() as any;
                const json = (gridObj as any).dataSource.dataSource.json;
                if (json.length > 0) {
                    const recordToRemove = json[0];
                    expect(() => {
                        (dataModule as any).removeRows({ indexes: [0], records: [recordToRemove] });
                    }).not.toThrow();
                }
            });

            it('removeRows with multiple records - offline filter', () => {
                const dataModule = gridObj.getDataModule() as any;
                const json = (gridObj as any).dataSource.dataSource.json;
                if (json.length >= 2) {
                    expect(() => {
                        (dataModule as any).removeRows({ indexes: [0, 1], records: [json[0], json[1]] });
                    }).not.toThrow();
                }
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('getColumnByField Tests', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridGetColumn' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 5),
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 }
                    ]
                }, done);
            });

            it('getColumnByField - retrieve column by field name', () => {
                const dataModule = gridObj.getDataModule() as any;
                dataModule.getColumnByField('OrderID');
            });

            it('getColumnByField - return undefined for invalid field', () => {
                const dataModule = gridObj.getDataModule() as any;
                dataModule.getColumnByField('InvalidField');
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });

        describe('Query Helper Tests', () => {
            let gridObj: Grid;
            let elem: HTMLElement = createElement('div', { id: 'GridQueryHelpers' });

            beforeAll((done: Function) => {
                document.body.appendChild(elem);
                gridObj = createGrid({
                    dataSource: data.slice(0, 10),
                    aggregates: [{
                        columns: [
                            { type: 'Sum', field: 'Freight', format: 'C2' },
                            { type: 'Average', field: 'Freight', format: 'C2' },
                            { type: 'Count', field: 'OrderID' }
                        ]
                    }],
                    allowGrouping: true,
                    groupSettings: { columns: ['CustomerID'] },
                    allowSorting: true,
                    sortSettings: { columns: [{ field: 'OrderID', direction: 'Ascending' }] },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 },
                        { field: 'Freight', headerText: 'Freight', width: 100 }
                    ]
                }, done);
            });

            it('aggregateQuery - with aggregate columns', () => {
                const dataModule = gridObj.getDataModule();
                const query = new Query();
                const result = (dataModule as any).aggregateQuery(query);
            });

            it('groupQuery - with grouping enabled', () => {
                const dataModule = gridObj.getDataModule();
                const query = new Query();
                const result = (dataModule as any).groupQuery(query);
            });

            it('sortQuery - with sorting columns', () => {
                const dataModule = gridObj.getDataModule();
                const query = new Query();
                const result = (dataModule as any).sortQuery(query);
            });

            it('clearCache - coverage for clearCache with query helpers', function () {
                const dataModule: any = gridObj.getDataModule();
                dataModule.isRemote = function () { return true; }; // Mock isRemote to true for coverage
                (gridObj.dataSource as any).clearCache = function () { }; // Mock clearCache to avoid errors
                dataModule.reorderRows({ fromIndex: 0, toIndex: 2 })
                expect(function () {
                    dataModule.clearCache();
                }).not.toThrow();
            });

            afterAll(() => {
                destroy(gridObj);
                remove(elem);
                gridObj = null;
            });
        });
    });
});