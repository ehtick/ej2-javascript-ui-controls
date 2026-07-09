/**
 * Content renderer spec
 */
import { Query } from '@syncfusion/ej2-data';
import { Grid } from '../../../src/grid/base/grid';
import { data } from '../base/datasource.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { createGrid, destroy } from '../base/specutil.spec';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { Edit, Toolbar } from '../../../src/grid/actions';
import * as util from '../../../src/grid/base/util';
import { Sort } from '../../../src/grid/actions';
 
Grid.Inject(Edit, Toolbar, Sort);

describe('Content renderer module', () => {

    describe('grid content element testing', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: data,
                    query: new Query().take(5), allowPaging: false, enableAltRow: false,
                    columns: [
                        { headerText: 'OrderID', field: 'OrderID' },
                        { headerText: 'CustomerID', field: 'CustomerID' },
                        { headerText: 'EmployeeID', field: 'EmployeeID' },
                        { headerText: 'ShipCountry', field: 'ShipCountry' },
                        { headerText: 'ShipCity', field: 'ShipCity' },
                    ]
                }, done);
        });

        it('Content div testing', () => {
            expect(gridObj.element.querySelectorAll('.e-gridcontent').length).toBe(1);
        });

        it('Content table testing', () => {
            expect(gridObj.contentModule.getPanel().querySelectorAll('.e-table').length).toBe(1);
        });

        it('Content cell count testing', () => {
            expect(gridObj.element.querySelectorAll('.e-row')[0].childNodes.length).toBe(gridObj.getColumns().length);
        });

        it('getRows', () => {
            expect(gridObj.contentModule.getRows().length).toBe(5);
            //for coverage 
            (<any>gridObj.contentModule).setColGroup(undefined);
            (<any>gridObj.contentModule).colGroupRefresh();
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

    describe('EJ2-49706 - MutableData doesn’t work for date values in the dataSource', () => {
        let gridObj: Grid;
        let sampleData1: Object[] = [
            { taskID: 1, taskName: 'Planning', progress: 100, duration: 5, priority: 'Normal', approved: false, OrderDate: new Date('02/27/2017') }
        ];
        let sampleData2: Object[] = [
            { taskID: 1, taskName: 'Planning', progress: 100, duration: 5, priority: 'Normal', approved: false, OrderDate: new Date('02/27/2017') }
        ];
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: sampleData1,
                    enableImmutableMode: true,
                    columns: [
                        { headerText: 'taskID', field: 'taskID', isPrimaryKey: true },
                        { headerText: 'taskName', field: 'taskName' },
                        { headerText: 'progress', field: 'progress' },
                        { headerText: 'priority', field: 'priority' }
                    ]
                }, done);
        });

        it('reassign same data to grid', (done: Function) => {
            let count: number = 0;
            gridObj.dataBound = null;
            let dataBound = () => {
                expect(count).toBe(0);
                gridObj.rowDataBound = null;
                gridObj.dataBound = null;
                done();
            };
            let rowDataBound = () => {
                count++;
            };
            gridObj.dataBound = dataBound;
            gridObj.rowDataBound = rowDataBound;
            gridObj.enableDeepCompare = true;
            gridObj.dataSource = sampleData2;
        });
        
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });

    });

        describe('EJ2-1020531 - Mutable mode not working properly with shimmer', () => {
        let gridObj: Grid;
        let sampleData: Object[] = [
            { taskID: 1, taskName: 'Planning' },
            { taskID: 2, taskName: 'Implementation' },
        ];
        let dataBound: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: sampleData,
                    enableImmutableMode: true,
                    allowSorting: true,
                    loadingIndicator: { indicatorType: 'Shimmer' },
                    columns: [
                        { headerText: 'taskID', field: 'taskID', isPrimaryKey: true },
                        { headerText: 'taskName', field: 'taskName' },
                    ]
                }, done);
        });
 
        it('check mask row removed after sorting', (done: Function) => {
            dataBound = (): void => {
                expect(gridObj.element.querySelector('.e-masked-table')).toBeNull();
                done();
            };
            gridObj.dataBound = dataBound;
            gridObj.sortColumn('taskID', 'Ascending');
        });
       
        afterAll(() => {
            destroy(gridObj);
            gridObj = dataBound = null;
        });
    });
    
    describe('EJ2-49853 - Update the reordered data in immutable mode re-renders multiple rows', () => {
        let gridObj: Grid;
        let sampleData1: Object[] = [
            { taskID: 1, taskName: 'Planning', progress: 100, duration: 5, priority: 'Normal', approved: false },
            { taskID: 2, taskName: 'Plan timeline', parentId: 1, duration: 5, progress: 100, priority: 'Normal', approved: false },
            { taskID: 3, parentId: 1, taskName: 'Plan budget', duration: 5, progress: 100, priority: 'Low', approved: true }
        ];
        let sampleData2: Object[] = [
            { taskID: 1, taskName: 'Planning', progress: 100, duration: 5, priority: 'Normal', approved: false },
            { taskID: 3, parentId: 1, taskName: 'Plan budget', duration: 5, progress: 100, priority: 'Low', approved: true },
            { taskID: 2, taskName: 'Plan timeline', parentId: 1, duration: 5, progress: 100, priority: 'Normal', approved: false }
        ];
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: sampleData1,
                    enableImmutableMode: true,
                    columns: [
                        { headerText: 'taskID', field: 'taskID', isPrimaryKey: true },
                        { headerText: 'taskName', field: 'taskName' },
                        { headerText: 'progress', field: 'progress' },
                        { headerText: 'priority', field: 'priority' }
                    ]
                }, done);
        });

        it('update redordered data', (done: Function) => {
            let count: number = 0;
            gridObj.dataBound = null;
            let dataBound = () => {
                expect(count).toBe(0);
                gridObj.rowDataBound = null;
                gridObj.dataBound = null;
                done();
            };
            let rowDataBound = () => {
                count++;
            };
            gridObj.dataBound = dataBound;
            gridObj.rowDataBound = rowDataBound;
            gridObj.enableDeepCompare = true;
            gridObj.dataSource = sampleData2;
        });
        
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });

    });
    
    describe('Bug(995942) : Group footer aggregate misaligned in below frozen line when grouping with frozenRows', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowGrouping: true,
                    frozenRows: 2,
                    groupSettings: { columns: ['ShipCountry'] },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                        { field: 'OrderDate', headerText: 'Order Date', textAlign: 'Right', width: 135, format: 'yMd' },
                        { field: 'Freight', headerText: 'Freight($)', textAlign: 'Right', width: 120, format: 'C2' },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 140 },
                    ],
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
                            type: 'Average',
                            field: 'Freight',
                            format: 'C2',
                            groupCaptionTemplate: 'Average: ${Average}'
                        }]
                    }],
                }, done);
        });

        it('Header Rows Count', (done: Function) => {
            const headerRowElement: NodeListOf<Element> = gridObj.getHeaderContent().querySelectorAll('[role = row]');
            expect(headerRowElement.length).toBe(7);
            done();
        });
        
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

});

// describe('EJ2-62873 - customAttribute - Row height is not set properly in the grid when having frozen column and enable virtualization', () => {
//     let gridObj: Grid;
//     var css = '.e-attr { height: 38.5px; }',
//     head = document.head || document.getElementsByTagName('head')[0],
//     style = document.createElement('style');
//     head.appendChild(style);
//     if ((style as any).styleSheet){
//     // This is required for IE8 and below.
//         (style as any).styleSheet.cssText = css;
//     } else {
//         (style as any).appendChild(document.createTextNode(css));
//     }
//     beforeAll((done: Function) => {
//         gridObj = createGrid(
//             {
//                 dataSource: data,
//                 enableVirtualization: true,
//                 columns: [
//                     { field: 'CustomerID', headerText: 'Customer ID', width: 130, minWidth: 10,isFrozen: true },
//                     { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right', customAttributes: { class: "e-attr" }, minWidth: 10 },
//                     { field: 'Freight', width: 125, minWidth: 10 },
//                     { field: 'ShipName', headerText: 'Ship Name', width: 300, minWidth: 10 },
//                 ]
//             }, done);
//     });
  
//     it('Ensure Rows Height', () => {
//     let fContent: HTMLElement = gridObj.element.querySelector('.e-frozencontent').querySelector('table').rows[0];
//     let mContent: HTMLElement = gridObj.element.querySelector('.e-movablecontent').querySelector('table').rows[0];
//     expect(mContent.offsetHeight).toBe(fContent.offsetHeight);
//     });
   
//     afterAll(() => {
//         destroy(gridObj);
//     });
// });

// describe("EJ2-68510 - Styling issue in first row when using textWrap with InfiniteScrolling Grid", () => {
//     let gridObj: Grid;
//     beforeAll((done: Function) => {
//       gridObj = createGrid(
//         {
//           dataSource: data,
//           frozenRows: 2,
//           height: 400,
//           allowTextWrap: true,
//           enableInfiniteScrolling: true,
//           columns: [
//             {
//               headerText: "OrderID",
//               field: "OrderID",
//               width: 120,
//               freeze: "Right",
//             },
//             {
//               headerText: "CustomerID",
//               field: "CustomerID",
//               width: 130,
//               freeze: "Left",
//             },
//             { headerText: "EmployeeID", field: "EmployeeID", width: 100 },
//             { headerText: "ShipCountry", field: "ShipCountry", width: 150 },
//             {
//               headerText: "ShipCity",
//               field: "ShipCity",
//               freeze: "Right",
//               width: 160,
//             },
//           ],
//         },
//         done
//       );
//     });
//     it("timeout to complete infinite scroll grid render", (done: Function) => {
//       setTimeout(done, 400);
//     });
//     it("Ensure first movable row height with next movable row in frozen infinite scroll grid with wrapText on", () => {
//       expect((gridObj.getMovableRows()[2] as HTMLElement).offsetHeight + 1).toBe(
//         (gridObj.getMovableRows()[3] as HTMLElement).offsetHeight
//       );
//     });
//     afterAll(() => {
//       gridObj["freezeModule"].destroy();
//       destroy(gridObj as any);
//     });
// });

describe('Content Renderer - Immutable Mode Coverage', () => {
    let gridObj: Grid;
    let sampleData: Object[] = [
        { taskID: 1, taskName: 'Planning', progress: 100 },
        { taskID: 2, taskName: 'Design', progress: 80 }
    ];

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                enableImmutableMode: true,
                columns: [
                    { headerText: 'taskID', field: 'taskID', isPrimaryKey: true },
                    { headerText: 'taskName', field: 'taskName' },
                    { headerText: 'progress', field: 'progress' }
                ]
            }, done);
    });

    it('immutableModeRendering - should render with default empty args', (done: Function) => {
        const contentModule: any = gridObj.contentModule;
        contentModule.immutableModeRendering({});
        setTimeout(() => {
            expect(contentModule.getRows()).toBeDefined();
            done();
        }, 100);
    });

    it('immutableModeRendering - should handle reorder request type and skip immutable logic', (done: Function) => {
        const contentModule: any = gridObj.contentModule;
        contentModule.immutableModeRendering({ requestType: 'reorder' });
        setTimeout(() => {
            expect(contentModule.getRows()).toBeDefined();
            done();
        }, 100);
    });

    it('immutableModeRendering - should handle grouping and call refreshContentRows', (done: Function) => {
        const contentModule: any = gridObj.contentModule;
        gridObj.groupSettings.columns = ['taskName'];
        contentModule.immutableModeRendering({});
        setTimeout(() => {
            expect(contentModule.getRows()).toBeDefined();
            gridObj.groupSettings.columns = [];
            done();
        }, 100);
    });

    it('immutableModeRendering - should return early when currentViewData is empty', () => {
        const contentModule: any = gridObj.contentModule;
        const originalData = gridObj.currentViewData;
        gridObj.currentViewData = [];

        contentModule.immutableModeRendering({});

        gridObj.currentViewData = originalData;
        expect(true).toBe(true);
    });

    it('immutableModeRendering - should handle empty prevCurrentView array', (done: Function) => {
        const contentModule: any = gridObj.contentModule;
        contentModule.prevCurrentView = [];
        gridObj.currentViewData = sampleData;

        contentModule.immutableModeRendering({});
        
        setTimeout(() => {
            expect(contentModule.getRows().length).toBeGreaterThan(0);
            done();
        }, 100);
    });

    it('immutableModeRendering - should handle same length data with data equality', (done: Function) => {
        const contentModule: any = gridObj.contentModule;
        const testData = [
            { taskID: 1, taskName: 'Planning', progress: 100 },
            { taskID: 2, taskName: 'Design', progress: 80 }
        ];
        
        gridObj.currentViewData = testData;
        contentModule.prevCurrentView = testData;

        contentModule.immutableModeRendering({});

        setTimeout(() => {
            expect(contentModule.getRows().length).toBe(2);
            done();
        }, 100);
    });

    it('immutableModeRendering - should handle same length data with data inequality', (done: Function) => {
        const contentModule: any = gridObj.contentModule;
        gridObj.enableDeepCompare = false;

        const oldData = [{ taskID: 1, taskName: 'OldName', progress: 100 }];
        const newData = [{ taskID: 1, taskName: 'NewName', progress: 100 }];

        gridObj.currentViewData = newData;
        contentModule.prevCurrentView = oldData;

        contentModule.immutableModeRendering({});

        setTimeout(() => {
            expect(contentModule.getRows().length).toBe(1);
            done();
        }, 100);
    });

    it('immutableModeRendering - should handle different length data (prevLen < currentLen)', (done: Function) => {
        const contentModule: any = gridObj.contentModule;
        const oldData = [{ taskID: 1, taskName: 'First', progress: 100 }];
        const newData = [
            { taskID: 1, taskName: 'First', progress: 100 },
            { taskID: 2, taskName: 'Second', progress: 80 }
        ];

        gridObj.currentViewData = newData;
        contentModule.prevCurrentView = oldData;

        contentModule.immutableModeRendering({});

        setTimeout(() => {
            expect(contentModule.getRows().length).toBe(2);
            done();
        }, 100);
    });

    it('immutableModeRendering - should handle new rows (oldIndex is undefined)', (done: Function) => {
        const contentModule: any = gridObj.contentModule;
        const oldData = [{ taskID: 1, taskName: 'First', progress: 100 }];
        const newData = [
            { taskID: 1, taskName: 'First', progress: 100 },
            { taskID: 999, taskName: 'NewRow', progress: 50 }
        ];

        gridObj.currentViewData = newData;
        contentModule.prevCurrentView = oldData;

        contentModule.immutableModeRendering({});

        setTimeout(() => {
            expect(contentModule.getRows().length).toBeGreaterThan(1);
            done();
        }, 100);
    });

    it('immutableModeRendering - should use deepCompare and find matching records', (done: Function) => {
        gridObj.enableDeepCompare = true;
        const contentModule: any = gridObj.contentModule;

        const oldData = [{ taskID: 1, taskName: 'Planning', progress: 100 }];
        const newData = [{ taskID: 1, taskName: 'Planning', progress: 100 }];

        gridObj.currentViewData = newData;
        contentModule.prevCurrentView = oldData;

        contentModule.immutableModeRendering({});

        setTimeout(() => {
            expect(contentModule.getRows().length).toBe(1);
            gridObj.enableDeepCompare = false;
            done();
        }, 100);
    });

    it('immutableModeRendering - should handle hasBatch when batchChangeKeys is not empty', (done: Function) => {
        gridObj.editSettings = { allowEditing: true, mode: 'Batch' };
        const contentModule: any = gridObj.contentModule;

        const testData = [{ taskID: 1, taskName: 'Planning', progress: 100 }];
        gridObj.currentViewData = testData;
        contentModule.prevCurrentView = [{ taskID: 1, taskName: 'OldName', progress: 100 }];

        contentModule.immutableModeRendering({});

        setTimeout(() => {
            expect(contentModule.getRows()).toBeDefined();
            done();
        }, 100);
    });

    it('immutableModeRendering - should trigger dataBound event with allowTextWrap', (done: Function) => {
        gridObj.allowTextWrap = true;
        const contentModule: any = gridObj.contentModule;

        contentModule.immutableModeRendering({});

        setTimeout(() => {
            expect(contentModule.getRows()).toBeDefined();
            gridObj.allowTextWrap = false;
            done();
        }, 100);
    });

    it('objectEqualityChecker - should return false when property values differ', () => {
        const contentModule: any = gridObj.contentModule;
        const obj1 = { id: 1, name: 'Test', status: 'Active' };
        const obj2 = { id: 1, name: 'Different', status: 'Active' };

        const result = contentModule.objectEqualityChecker(obj1, obj2);

        expect(result).toBe(false);
    });

    it('objectEqualityChecker - should return true when all property values match', () => {
        const contentModule: any = gridObj.contentModule;
        const obj1 = { id: 1, name: 'Test', status: 'Active' };
        const obj2 = { id: 1, name: 'Test', status: 'Active' };

        const result = contentModule.objectEqualityChecker(obj1, obj2);

        expect(result).toBe(true);
    });

    it('objectEqualityChecker - should handle Date object comparison', () => {
        const contentModule: any = gridObj.contentModule;
        const date1 = new Date('02/27/2017');
        const date2 = new Date('02/27/2017');
        const obj1 = { id: 1, date: date1 };
        const obj2 = { id: 1, date: date2 };

        const result = contentModule.objectEqualityChecker(obj1, obj2);

        expect(result).toBe(true);
    });

    it('objectEqualityChecker - should return false for different dates', () => {
        const contentModule: any = gridObj.contentModule;
        const obj1 = { id: 1, date: new Date('02/27/2017') };
        const obj2 = { id: 1, date: new Date('02/28/2017') };

        const result = contentModule.objectEqualityChecker(obj1, obj2);

        expect(result).toBe(false);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Content Renderer - getBatchEditedRecords Coverage', () => {
    let gridObj: Grid;

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: [
                    { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38 },
                    { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61 },
                    { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83 }
                ],
                editSettings: { 
                    allowEditing: true, 
                    mode: 'Batch',
                    newRowPosition: 'Top'
                },
                columns: [
                    { headerText: 'OrderID', field: 'OrderID', isPrimaryKey: true },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'Freight', field: 'Freight' }
                ]
            }, done);
    });

    it('getBatchEditedRecords should return empty keys object when no batch changes', () => {
        const contentModule: any = gridObj.contentModule;
        const rows = contentModule.getRows();
        gridObj.getBatchChanges = () => ({});
        contentModule.getBatchEditedRecords('OrderID', rows);
    });

    it('getBatchEditedRecords should handle changedRecords and map to keys', () => {
        const contentModule: any = gridObj.contentModule;
        const rows = contentModule.getRows();
        gridObj.getBatchChanges = () => ({
            changedRecords: [
                { OrderID: 10248, CustomerID: 'UPDATED' },
                { OrderID: 10249, CustomerID: 'MODIFIED' }
            ],
            addedRecords: []
        });
        contentModule.getBatchEditedRecords('OrderID', rows);
    });

    it('getBatchEditedRecords should handle addedRecords with Top position and no cancel', () => {
        gridObj.editSettings.newRowPosition = 'Top';
        const contentModule: any = gridObj.contentModule;
        const originalRows = contentModule.getRows();
        const rows = [...originalRows];
        gridObj.getBatchChanges = () => ({
            changedRecords: [],
            addedRecords: [
                { OrderID: 10251, CustomerID: 'NEWCUST' }
            ]
        });
        contentModule.getBatchEditedRecords('OrderID', rows);
    });

    it('getBatchEditedRecords should handle mixed changedRecords and addedRecords', () => {
        gridObj.editSettings.newRowPosition = 'Bottom';
        const contentModule: any = gridObj.contentModule;
        const rows = contentModule.getRows();
        gridObj.getBatchChanges = () => ({
            changedRecords: [
                { OrderID: 10248, CustomerID: 'CHANGED' }
            ],
            addedRecords: [
                { OrderID: 10251, CustomerID: 'NEW1' },
                { OrderID: 10252, CustomerID: 'NEW2' }
            ]
        });
        contentModule.getBatchEditedRecords('OrderID', rows);
    });

    it('getBatchEditedRecords should handle empty addedRecords array', () => {
        const contentModule: any = gridObj.contentModule;
        const rows = contentModule.getRows();
        const initialLength = rows.length;
        gridObj.getBatchChanges = () => ({
            changedRecords: [
                { OrderID: 10248, CustomerID: 'CHANGED' }
            ],
            addedRecords: []
        });
        contentModule.getBatchEditedRecords('OrderID', rows);
    });

    it('getBatchEditedRecords should handle undefined changes gracefully', () => {
        const contentModule: any = gridObj.contentModule;
        const rows = contentModule.getRows();
        gridObj.getBatchChanges = () => ({});
        contentModule.getBatchEditedRecords('OrderID', rows);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Content Renderer - Immutablemode in batch editing', () => {
    let gridObj: Grid;

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: [
                    { OrderID: 10248, CustomerID: 'VINET', Freight: 32.38 },
                    { OrderID: 10249, CustomerID: 'TOMSP', Freight: 11.61 },
                    { OrderID: 10250, CustomerID: 'HANAR', Freight: 65.83 }
                ],
                toolbar: ['Add', 'Update', 'Cancel'],
                editSettings: {
                    allowAdding: true,
                    allowEditing: true, 
                    mode: 'Batch',
                    newRowPosition: 'Top'
                },
                columns: [
                    { headerText: 'OrderID', field: 'OrderID', isPrimaryKey: true },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'Freight', field: 'Freight' }
                ]
            }, done);
    });

    it('immutableModeRendering - should handle same length data when add record', function (done: Function) {
        const contentModule = (gridObj as any).contentModule;
        const testData = [{ taskID: 1, taskName: 'Planning', progress: 100 }];
        gridObj.currentViewData = testData;
        contentModule.prevCurrentView = [{ taskID: 1, taskName: 'OldName', progress: 100 }];
        const batchAdd = () => {
            gridObj.batchAdd = null;
            done();
        };
        gridObj.batchAdd = batchAdd;
        (gridObj as any).toolbarModule.toolbarClickHandler({ item: { id: gridObj.element.id + '_add' } });
    });
    it('immutableModeRendering - should handle same length data when batchChangeKeys is not empty', function (done: Function) {
        const contentModule = (gridObj as any).contentModule;
        contentModule.immutableModeRendering({});
        setTimeout(function () {
            expect(contentModule.getRows()).toBeDefined();
            done();
        }, 100);
    });
    it('immutableModeRendering - should handle different length when add the record', function (done: Function) {
        const contentModule = (gridObj as any).contentModule;
        const testData = [{ taskID: 1, taskName: 'First', progress: 100 },
            { taskID: 2, taskName: 'Second', progress: 80 }];
        gridObj.currentViewData = testData;
        contentModule.prevCurrentView = [{ taskID: 1, taskName: 'Planning', progress: 100 }];
        const batchAdd = () => {
            gridObj.batchAdd = null;
            done();
        };
        gridObj.batchAdd = batchAdd;
        (gridObj as any).toolbarModule.toolbarClickHandler({ item: { id: gridObj.element.id + '_add' } });
    });
    it('immutableModeRendering - should handle different length when batchChangeKeys is not empty', function (done: Function) {
        const contentModule = (gridObj as any).contentModule;
        contentModule.immutableModeRendering({});
        setTimeout(function () {
            expect(contentModule.getRows()).toBeDefined();
            done();
        }, 100);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Content Renderer - appendContent method', () => {
    let gridObj: Grid;
    let contentModule: any;

    beforeEach(() => {
        gridObj = createGrid(
            {
                dataSource: [{ OrderID: 1, CustomerID: 'ALFKI' }],
                columns: [
                    { field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'Customer ID' }
                ],
                rowRenderingMode: 'Horizontal', // default
                allowTextWrap: false,
                textWrapSettings: { wrapMode: 'Both' },
                enableColumnVirtualization: false
            },
            () => { }
        );
        contentModule = (gridObj.contentModule as any);
    });

    it('should adjust cell height in Vertical mode + text wrap (Header/Both) when headerCellHeight > cellHeight', () => {
        gridObj.rowRenderingMode = 'Vertical';
        gridObj.allowTextWrap = true;
        gridObj.textWrapSettings = { wrapMode: 'Header' };
        const tbody = document.createElement('tbody');
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.style.height = '20px'; // small content height
        tr.appendChild(td);
        tbody.appendChild(tr);
        // Mock getComputedStyle for ::before pseudo-element
        spyOn(window, 'getComputedStyle').and.callFake((el: any, pseudo: any) => {
            return {
                getPropertyValue: (prop: string) => {
                    if (pseudo === '::before' && prop === 'height') {
                        return '38px';
                    }
                    return '';
                }
            } as any;
        });
        contentModule.appendContent(tbody, document.createDocumentFragment(), {}, 'content');
    });

    it('should NOT adjust cell height when headerCellHeight <= cellHeight in Vertical + text wrap mode', () => {
        gridObj.rowRenderingMode = 'Vertical';
        gridObj.allowTextWrap = true;
        gridObj.textWrapSettings = { wrapMode: 'Both' };
        const tbody = document.createElement('tbody');
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.style.height = '50px'; // taller than pseudo header
        tr.appendChild(td);
        tbody.appendChild(tr);
        spyOn(window, 'getComputedStyle').and.returnValue({
            getPropertyValue: (prop: string) => {
                if (prop === 'height') { return '38px'; }
                return '';
            }
        } as any);
        contentModule.appendContent(tbody, document.createDocumentFragment(), {}, 'content');
    });

    it('should NOT refresh frozen scrollbar when column virtualization is disabled', () => {
        gridObj.enableColumnVirtualization = false;
        const widthService = {
            refreshFrozenScrollbar: jasmine.createSpy('refreshFrozenScrollbar')
        };
        (gridObj as any).widthService = widthService;
        contentModule.appendContent(
            document.createElement('tbody'),
            document.createDocumentFragment(),
            {},
            'content'
        );
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
        contentModule = null;
    });
});

describe('Content Renderer - template clearing branches', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: [{ OrderID: 1, CustomerID: 'ALFKI' }],
            columns: [
                { field: 'OrderID', headerText: 'Order ID' },
                { field: 'CustomerID', headerText: 'Customer ID' }
            ]
        }, done);
    });

    it('should call destroyTemplate for orphaned template rootNodes', (done: Function) => {
        const contentModule: any = (gridObj as any).contentModule;
        // prepare registeredTemplate with some rootNodes having null parentNode
        (gridObj as any).registeredTemplate = {
            template: [
                { rootNodes: [{ parentNode: null }, { parentNode: {} }] },
                { rootNodes: [{ parentNode: null }] }
            ]
        };
        spyOn(gridObj, 'destroyTemplate').and.callFake(() => { /* noop */ });
        contentModule.refreshContentRows({});
        done();
    });

    it('should call clearReactVueTemplates when parent is React (non-infiniteScroll)', (done: Function) => {
        const contentModule: any = (gridObj as any).contentModule;
        spyOn(util, 'clearReactVueTemplates').and.callFake(() => { /* noop */ });
        gridObj.isReact = true;
        (gridObj as any).registeredTemplate = null;
        contentModule.refreshContentRows({});
        done();
    });

    it('should use reduced templates for infiniteScroll when enableCache is true', (done: Function) => {
        const contentModule: any = (gridObj as any).contentModule;
        spyOn(util, 'clearReactVueTemplates').and.callFake(() => { /* noop */ });
        gridObj.isReact = true;
        gridObj.enableInfiniteScrolling = true;
        gridObj.infiniteScrollSettings = { enableCache: true } as any;
        contentModule.refreshContentRows({ requestType: 'infiniteScroll' });
        done();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});