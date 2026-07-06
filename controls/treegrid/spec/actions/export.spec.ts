import { TreeGrid } from '../../src/treegrid/base/treegrid';
import { createGrid, destroy } from '../base/treegridutil.spec';
import { sampleData, projectData, summaryRowData } from '../base/datasource.spec';
import { isNullOrUndefined, setValue, EmitType, createElement, remove } from '@syncfusion/ej2-base';
import { actionComplete, getObject, ExcelQueryCellInfoEventArgs, PdfQueryCellInfoEventArgs, ExcelExportProperties } from '@syncfusion/ej2-grids';
import { Filter } from '../../src/treegrid/actions/filter';
import {ExcelExport } from '../../src/treegrid/actions/excel-export';
import {  PdfExport } from '../../src/treegrid/actions/pdf-export';
import { TreeGridExcelExportProperties, TreeGridPdfExportProperties } from '../../src';
import { Page } from '../../src/treegrid/actions/page';
import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';
import { Aggregate } from '../../src/treegrid/actions/summary';
import { Workbook } from '@syncfusion/ej2-excel-export';
import { Toolbar } from '../../src/treegrid/actions/toolbar';
import { Query } from '@syncfusion/ej2-data';

/**
 * Grid Export spec 
 */
TreeGrid.Inject(Filter, ExcelExport, PdfExport, Page, Aggregate, Toolbar);
let exportComplete: () => void = () => true;
describe('Exporting Module Test cases', () => {
    describe('Excel Exporting local data', () => {
        let gridObj: TreeGrid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: sampleData,
                    childMapping: 'subtasks',
                    treeColumnIndex: 1,
                    allowExcelExport: true,
                    allowPdfExport: true,
                    columns: ['taskID', 'taskName', 'startDate', 'endDate', 'duration', 'progress'],
                },
                done
            );
        });
        it('Checking the excel export', (done: Function) => {
            gridObj.excelExport().then((doc: Workbook)=>{
                expect(doc).not.toBeUndefined();
                done();
            });
        });
        afterAll(() => {
            destroy(gridObj);
        });
    });
});

describe('Excel Exporting custom data', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
      gridObj = createGrid(
        {
          dataSource: sampleData,
          childMapping: 'subtasks',
          treeColumnIndex: 1,
          allowPaging: true,
          allowExcelExport: true,
          allowPdfExport: true,
          columns: ['taskID', 'taskName', 'startDate', 'endDate', 'duration', 'progress']
        },
        done
      );
    });
    it('Checking the export with custom data source', (done: Function) => {
        let excelExportProperties: TreeGridExcelExportProperties = {
            dataSource: sampleData.slice(0,1),
            exportType: 'AllPages',
            isCollapsedStatePersist: true
        }
        gridObj.excelExport(excelExportProperties).then((doc: Workbook)=>{
            expect(doc).not.toBeUndefined();
            done();
        });
    });
    afterAll(() => {
      destroy(gridObj);
    });
});

describe('Pdf Exporting local data', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                allowExcelExport: true,
                allowPdfExport: true,
                columns: ['taskID', 'taskName', 'startDate', 'endDate', 'duration', 'progress'],
            },
            done
        );
    });
    it('Checking the pdf export', (done: Function) => {
        gridObj.pdfExport().then((doc)=>{
            expect(doc).not.toBeUndefined();
            done();
        });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Pdf Exporting custom data', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
      gridObj = createGrid(
        {
          dataSource: sampleData,
          childMapping: 'subtasks',
          treeColumnIndex: 1,
          allowPaging: true,
          allowExcelExport: true,
          allowPdfExport: true,
          columns: ['taskID', 'taskName', 'startDate', 'endDate', 'duration', 'progress']
        },
        done
      );
    });
    it('Checking the export with custom data source', (done: Function) => {
        let pdfExportProperties: TreeGridPdfExportProperties = {
            dataSource: sampleData.slice(0,1),
            isCollapsedStatePersist: true
        }
        gridObj.pdfExport(pdfExportProperties).then((doc)=>{
            expect(doc).not.toBeUndefined();
            done();
        });
    });
    afterAll(() => {
      destroy(gridObj);
    });
});

describe('Excel Exporting Remote data', () => {
    let gridObj: TreeGrid;
    let data: Object = new DataManager({
        url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
        adaptor: new WebApiAdaptor,
        crossDomain: true
    });
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                hasChildMapping: 'isParent',
                idMapping: 'TaskID',
                parentIdMapping: 'ParentItem',
                height: 400,
                treeColumnIndex: 1,
                allowExcelExport: true,
                allowPdfExport: true,
                columns: [
                    { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
                    { field: 'TaskName', headerText: 'Task Name', width: 150 },
                    { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
                ],
                excelExportComplete: exportComplete
            },
            done
        );
    });
    it('Checking the excel export', (done: Function) => {
        gridObj.excelExport().then((doc: Workbook)=>{
            expect(doc).not.toBeUndefined();
            done();
        });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Excel Exporting Remote data with custom data source', () => {
    let gridObj: TreeGrid;
    let data: Object = new DataManager({
        url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
        adaptor: new WebApiAdaptor,
        crossDomain: true
    });
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                hasChildMapping: 'isParent',
                idMapping: 'TaskID',
                parentIdMapping: 'ParentItem',
                height: 400,
                treeColumnIndex: 1,
                allowPaging: true,
                allowExcelExport: true,
                allowPdfExport: true,
                columns: [
                    { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
                    { field: 'TaskName', headerText: 'Task Name', width: 150 },
                    { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
                ],
                excelExportComplete: exportComplete
            },
            done
        );
    });
    it('Checking the excel export', (done: Function) => {
        let excelExportProperties: TreeGridExcelExportProperties = {
            dataSource: data,
            isCollapsedStatePersist: true,
            exportType: 'CurrentPage'
        }
        gridObj.excelExport(excelExportProperties).then((doc)=>{
            expect(doc).not.toBeUndefined();
            done();
        })
        
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

// describe('Pdf Exporting Remote data', () => {
//     let gridObj: TreeGrid;
//     let data: Object = new DataManager({
//         url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
//         adaptor: new WebApiAdaptor,
//         crossDomain: true
//     });
//     beforeAll((done: Function) => {
//         gridObj = createGrid(
//             {
//                 dataSource: data,
//                 hasChildMapping: 'isParent',
//                 idMapping: 'TaskID',
//                 parentIdMapping: 'ParentItem',
//                 height: 400,
//                 treeColumnIndex: 1,
//                 allowExcelExport: true,
//                 allowPdfExport: true,
//                 columns: [
//                     { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
//                     { field: 'TaskName', headerText: 'Task Name', width: 150 },
//                     { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
//                 ]
//             },
//             done
//         );
//     });
//     it('Checking the excel export', (done: Function) => {
//         gridObj.pdfExport().then((doc)=>{
//             expect(doc).not.toBeUndefined();
//             done();
//         });
//     });
//     afterAll(() => {
//         destroy(gridObj);
//     });
// });

// describe('Pdf Exporting Remote data with custom data source', () => {
//     let gridObj: TreeGrid;
//     let data: Object = new DataManager({
//         url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
//         adaptor: new WebApiAdaptor,
//         crossDomain: true
//     });
//     beforeAll((done: Function) => {
//         gridObj = createGrid(
//             {
//                 dataSource: data,
//                 hasChildMapping: 'isParent',
//                 idMapping: 'TaskID',
//                 parentIdMapping: 'ParentItem',
//                 height: 400,
//                 treeColumnIndex: 1,
//                 allowPaging: true,
//                 allowExcelExport: true,
//                 allowPdfExport: true,
//                 columns: [
//                     { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
//                     { field: 'TaskName', headerText: 'Task Name', width: 150 },
//                     { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
//                 ]
//             },
//             done
//         );
//     });
//     it('Checking the excel export', (done: Function) => {
//         let pdfportProperties: TreeGridPdfExportProperties = {
//             dataSource: data,
//             isCollapsedStatePersist: true,
//             exportType: 'CurrentPage'
//         }
//         gridObj.pdfExport(pdfportProperties).then((doc)=>{
//             expect(doc).not.toBeUndefined();
//             done();
//         });
//     });
//     afterAll(() => {
//         destroy(gridObj);
//     });
// });

describe('Csv Exporting local data', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                allowExcelExport: true,
                allowPdfExport: true,
                columns: ['taskID', 'taskName', 'startDate', 'endDate', 'duration', 'progress'],
            },
            done
        );
    });
    it('Checking the csv export', (done: Function) => {
        gridObj.csvExport().then((doc)=>{
            expect(doc).not.toBeUndefined();
            done();
        });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Exporting with aggregates', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: summaryRowData,
                childMapping: 'children',
                treeColumnIndex: 0,
                allowExcelExport: true,
                allowPdfExport: true,
                toolbar: ['PdfExport', 'ExcelExport', 'CsvExport'],
                height: 400,
                columns: [
                    { field: 'FreightID', headerText: 'Freight ID', width: 130 },
                    { field: 'FreightName', width: 200, headerText: 'Freight Name' },
                    { field: 'UnitWeight', headerText: 'Weight Per Unit', type: 'number', width: 140, textAlign: 'Right' },
                    { field: 'TotalUnits', headerText: 'Total Units', type: 'number', width: 140, textAlign: 'Right' }
                ],
                aggregates: [{
                    columns: [
                        {
                            type: 'Max',
                            field: 'UnitWeight',
                            columnName: 'UnitWeight',
                            footerTemplate: 'Maximum: ${Max}'
                        },
                        {
                            type: 'Min',
                            field: 'TotalUnits',
                            columnName: 'TotalUnits',
                            footerTemplate: 'Minimum: ${Min}'
                        }]
                }],
            },
            done
        );
    });
    it('Checking the pdfExport', (done: Function) => {
        gridObj.pdfExport().then((doc) => {
            expect(doc).not.toBeUndefined();
            done();
        });
    });
    it('Checking the excelExport', (done: Function) => {
        gridObj.excelExport().then((doc)=>{
            expect(doc).not.toBeUndefined();
            done();
        });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Exporting with aggregates', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: summaryRowData,
                childMapping: 'children',
                treeColumnIndex: 0,
                allowExcelExport: true,
                allowPdfExport: true,
                toolbar: ['PdfExport', 'ExcelExport', 'CsvExport'],
                height: 400,
                columns: [
                    { field: 'FreightID', headerText: 'Freight ID', width: 130 },
                    { field: 'FreightName', width: 200, headerText: 'Freight Name' },
                    { field: 'UnitWeight', headerText: 'Weight Per Unit', type: 'number', width: 140, textAlign: 'Right' },
                    { field: 'TotalUnits', headerText: 'Total Units', type: 'number', width: 140, textAlign: 'Right' }
                ],
                aggregates: [{
                    columns: [
                        {
                            type: 'Max',
                            field: 'UnitWeight',
                            columnName: 'UnitWeight',
                            footerTemplate: 'Maximum: ${Max}'
                        },
                        {
                            type: 'Min',
                            field: 'TotalUnits',
                            columnName: 'TotalUnits',
                            footerTemplate: 'Minimum: ${Min}'
                        }]
                }],
            },
            done
        );
    });
    it('Checking the excelExport', (done: Function) => {
        gridObj.excelExport().then((doc)=>{
            expect(doc).not.toBeUndefined();
            done();
        });
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Excel Exporting Remote data without exportType', () => {
    let gridObj: TreeGrid;
    let data: Object = new DataManager({
        url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
        adaptor: new WebApiAdaptor,
        crossDomain: true
    });
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                hasChildMapping: 'isParent',
                idMapping: 'TaskID',
                parentIdMapping: 'ParentItem',
                height: 400,
                treeColumnIndex: 1,
                allowPaging: true,
                allowExcelExport: true,
                allowPdfExport: true,
                columns: [
                    { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
                    { field: 'TaskName', headerText: 'Task Name', width: 150 },
                    { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
                ],
                excelExportComplete: exportComplete
            },
            done
        );
    });
    it('Checking the excel export', (done: Function) => {
        let excelExportProperties: TreeGridExcelExportProperties = {
            dataSource: data,
            isCollapsedStatePersist: true
        }
        gridObj.excelExport(excelExportProperties);
        done();
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj.excelExportModule.destroy();
    });
});

describe('Pdf Exporting local data without enable the property', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: sampleData,
                childMapping: 'subtasks',
                treeColumnIndex: 1,
                allowExcelExport: false,
                allowPdfExport: false,
                columns: ['taskID', 'taskName', 'startDate', 'endDate', 'duration', 'progress'],
                toolbar: ['ExcelExport', 'CsvExport', 'PdfExport'],
            },
            done
        );
    });
    it('Export with toolbar', (done: Function) => {
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_excelexport' } });
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_pdfexport' } });
        (<any>gridObj.grid.toolbarModule).toolbarClickHandler({ item: { id: gridObj.grid.element.id + '_csvexport' } });
        done();
    });
    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Excel Exporting Remote data with exportType as AllPage', () => {
    let gridObj: TreeGrid;
    let data: Object = new DataManager({
        url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
        adaptor: new WebApiAdaptor,
        crossDomain: true
    });
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                hasChildMapping: 'isParent',
                idMapping: 'TaskID',
                parentIdMapping: 'ParentItem',
                height: 400,
                treeColumnIndex: 1,
                allowPaging: true,
                allowExcelExport: true,
                allowPdfExport: true,
                columns: [
                    { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
                    { field: 'TaskName', headerText: 'Task Name', width: 150 },
                    { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
                ],
                excelExportComplete: exportComplete
            },
            done
        );
    });
    it('Checking the excel export', (done: Function) => {
        gridObj.filterModule = null;
        let excelExportProperties: any = {
            exportType:'AllPages'
        }
        gridObj.excelExport(excelExportProperties);
        done();
    });
    afterAll(() => {
        destroy(gridObj);
        gridObj.excelExportModule.destroy();
    });
});

describe('custom aggregate Pdf Exporting with pdfAggregateQueryCellInfo', () => {
    let gridObj: TreeGrid;
    beforeAll((done: Function) => {
      gridObj = createGrid(
        {
          dataSource: sampleData,
          childMapping: 'subtasks',
          treeColumnIndex: 1,
          allowPaging: true,
          allowExcelExport: true,
          allowPdfExport: true,
          columns: ['taskID', 'taskName', 'startDate', 'endDate', 'duration', 'progress'],
        },
        done
      );
    });
    it('check the removeEventListener', (done: Function) => {
        gridObj.isDestroyed = true;
        gridObj.pdfExportModule.removeEventListener();
        done();
    });
    it('check the removeEventListener', (done: Function) => {
        gridObj.isDestroyed = false;
        gridObj.pdfExportModule.removeEventListener();
        done();
    done();
    });
    it('check the destroy method', (done: Function) => {
        gridObj.pdfExportModule.destroy();
        done();
    });
    afterAll(() => {
      destroy(gridObj);
    });
});

describe('Pdf Exporting Remote data with isCollapsedStatePersist false', () => {
    let gridObj: TreeGrid;
    let data: Object = new DataManager({
        url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
        adaptor: new WebApiAdaptor,
        crossDomain: true
    });
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                hasChildMapping: 'isParent',
                idMapping: 'TaskID',
                parentIdMapping: 'ParentItem',
                height: 400,
                treeColumnIndex: 1,
                allowPaging: true,
                allowPdfExport: true,
                allowExcelExport: true,
                columns: [
                    { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
                    { field: 'TaskName', headerText: 'Task Name', width: 150 },
                    { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
                ],
                pdfExportComplete: exportComplete,
                excelExportComplete: exportComplete
            },
            done
        );
    });
    
    it('Checking the pdf export', (done: Function) => {
        let prop: any = {
            isCollapsedStatePersist: false,
        }
        let dtSrc: any = [];
        (gridObj.pdfExportModule as any).manipulatePdfProperties(prop, dtSrc);
        done();
    });

    it('Checking the pdf export with custom data', (done: Function) => {
        let pdfExportProperties: any = {
            isCollapsedStatePersist: false,
            dataSource: []
        }
        gridObj.pdfExport(pdfExportProperties);
        done();
    });

    it('Checking the pdf export with export type current page', (done: Function) => {
        let pdfExportProperties: any = {
            isCollapsedStatePersist: false,
            exportType: 'CurrentPage'
        }
        gridObj.pdfExport(pdfExportProperties);
        done();
    });

    it('Checking the excel export', (done: Function) => {
        let prop: any = {
            isCollapsedStatePersist: false,
        }
        let dtSrc: any = [];
        (gridObj.excelExportModule as any).manipulateExportProperties(prop, dtSrc);
        done();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj.pdfExportModule.destroy();
        gridObj.excelExportModule.destroy();
    });
});

describe('PdfExport - additional branch coverage', () => {
let gridObj: TreeGrid;

beforeAll((done: Function) => {
    gridObj = createGrid({
        dataSource: sampleData,
        childMapping: 'subtasks',
        treeColumnIndex: 1,
        allowPaging: true,
        pageSettings: {pageSize:10, pageCount:2},
        allowExcelExport: true,
        allowPdfExport: true,
        columns: ['taskID', 'taskName', 'startDate'],
    }, done);
});
it('generateQuery: converts CurrentPage -> AllPages and mutates prop', (done: Function) => {
    const pdfModule: any = gridObj.pdfExportModule;
    const q: Query = new Query();
    const prop: any = { exportType: 'CurrentPage' };
    (gridObj.grid.renderModule.data as any).pageQuery = (args: any)=> {};
    pdfModule.generateQuery(q, prop)
    expect(prop.exportType).toBe('AllPages');
    done();
});
it('pdfQueryCellInfo: uses filterLevel when present to calculate paragraphIndent', (done: Function) => {
    const colUid = (gridObj.grid.columns as any)[gridObj.treeColumnIndex].uid;
    const args: any = { column: { uid: colUid }, data: { level: 2, filterLevel: 4 }, style: {} };
    (gridObj.pdfExportModule as any).pdfQueryCellInfo(args);
    expect(args.style.paragraphIndent).toBe(4 * 3);
    done();
});

afterAll(() => {
    destroy(gridObj);
});
});

describe('PdfExport - additional branch coverage for map method', () => {
let gridObj: TreeGrid;
    let data: Object = new DataManager({
        url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
        adaptor: new WebApiAdaptor,
        crossDomain: true
    });

beforeAll((done: Function) => {
    gridObj = createGrid({
        dataSource: data,
        hasChildMapping: 'isParent',
        idMapping: 'TaskID',
        parentIdMapping: 'ParentItem',
        treeColumnIndex: 1,
        allowExcelExport: true,
        allowPdfExport: true,
        columns: ['taskID', 'taskName', 'startDate'],
    }, done);
});
it('Coverage in map method',  () => {
  const pdfModule: any = gridObj.pdfExportModule;
  let pdfExportProperties: any = {};
  gridObj.beforePdfExport= (args: any) => {
    args.cancel = true;
  }
  gridObj.pdfExport(pdfExportProperties);
})

afterAll(() => {
    destroy(gridObj);
});
});

describe('Coverage - Additional Excel Export coverage (targeted branches)', () => {
    let gridObj: TreeGrid;
    let remoteData: Object = new DataManager({
        url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
        adaptor: new WebApiAdaptor,
        crossDomain: true
    });

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: remoteData,
                hasChildMapping: 'isParent',
                idMapping: 'TaskID',
                parentIdMapping: 'ParentItem',
                height: 400,
                treeColumnIndex: 1,
                allowPaging: true,
                allowExcelExport: true,
                allowPdfExport: true,
                columns: [
                    { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
                    { field: 'TaskName', headerText: 'Task Name', width: 150 },
                    { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
                ]
            },
            done
        );
    });

    it('removeEventListener and destroy should run without early-return', (done: Function) => {
        gridObj.isDestroyed = true;
        gridObj.excelExportModule.removeEventListener();
        gridObj.isDestroyed = false;
        gridObj.excelExportModule.removeEventListener();
        gridObj.excelExportModule.destroy();
        done();
    });

    it('Map should delegate to grid.excelExportModule.Map when remote and dataSource passed (plain array)', (done: Function) => {
        let excelExportProperties: any = {
            dataSource: sampleData.slice(0, 2),
            isCollapsedStatePersist: true
        };
        gridObj.excelExport(excelExportProperties).then((doc: Workbook) => {
            expect(doc).not.toBeUndefined();
            done();
        });
    });

    it('generateQuery should convert CurrentPage -> AllPages when allowPaging is true', () => {
        const prop: any = { exportType: 'CurrentPage' };
        (gridObj.grid.renderModule as any) = gridObj.grid.renderModule || {};
        (gridObj.grid.renderModule.data as any) = gridObj.grid.renderModule.data || {};
        (gridObj.grid.renderModule.data as any).pageQuery = function (qry: any) { return qry; };
        (gridObj.excelExportModule as any).generateQuery(new Query(), prop);
        expect(prop.exportType).toBe('AllPages');
    });

    it('manipulateExportProperties should filter out onWhere preds with null and remove IdMapping params', (done: Function) => {
        (gridObj.grid as any).getDataModule = () => ({
            generateQuery: (flag?: boolean) => ({
                queries: [{ fn: 'onWhere', e: { field: gridObj.parentIdMapping, value: 'null' } }],
                params: [{ key: 'IdMapping' }]
            }),
            isRemote: () => false,
            getState: () => ({})
        });

        const prop: any = { isCollapsedStatePersist: false };
        const dtSrc: any = [];
        const res = (gridObj.excelExportModule as any).manipulateExportProperties(prop, dtSrc, { result: [] });
        expect(res.dataSource).toBeDefined();
        done();
    });

    it('manipulateExportProperties should use property.dataSource.dataSource.json when DataManager provided', (done: Function) => {
        const dm = new DataManager({ json: sampleData.slice(0, 2) });
        const prop: any = { dataSource: dm };
        const dtSrc: any = [];
        const convSpy = spyOn((gridObj as any).dataModule, 'convertToFlatData').and.callThrough();
        const res = (gridObj.excelExportModule as any).manipulateExportProperties(prop, dtSrc, { result: [] });
        expect(convSpy).toHaveBeenCalled();
        expect(res.dataSource).toBeDefined();
        expect(res.dataSource instanceof DataManager).toBe(true);
        done();
    });

    it('excelQueryCellInfo should use filterLevel when present', (done: Function) => {
        const col = gridObj.getColumns()[gridObj.treeColumnIndex];
        const args: any = { column: { uid: col.uid }, data: { level: 1, filterLevel: 3 } };
        (gridObj.excelExportModule as any).excelQueryCellInfo(args);
        expect(args.style).toBeDefined();
        expect(args.style.indent).toBe(3);
        done();
    });

    it('exportRowDataBound should set grouping for nodes with hasChildRecords and null parentItem', (done: Function) => {
        const excelRow: any = { type: 'excel', excelRows: [{}], rowObj: { data: { level: 2, parentItem: null, hasChildRecords: true } } };
        (gridObj.excelExportModule as any).exportRowDataBound(excelRow);
        expect(excelRow.excelRows[0].grouping).toBeDefined();
        done();
    });

    it('finalPageSetup should set pageSetup when worksheet rows exist', () => {
        const wb: any = { worksheets: [{ rows: [{}] }, {}] };
        (gridObj.excelExportModule as any).finalPageSetup(wb);
        expect(wb.worksheets[0].pageSetup).toBeDefined();
    });

    it('exportRowDataBound should mark grouping as hidden and collapsed-state respected when isCollapsedStatePersist is true and parent is remote', (done: Function) => {
        const excelrowobj: any = { level: 2, parentItem: { uniqueID: 'p_parent_1' }, expanded: true };
        const excelRow: any = { type: 'excel', excelRows: [{}, {}], rowObj: { data: excelrowobj } };

        (gridObj.grid as any).filterSettings = (gridObj.grid as any).filterSettings || { columns: [] };

        (gridObj as any).uniqueIDCollection = (gridObj as any).uniqueIDCollection || {};
        (gridObj as any).uniqueIDCollection['p_parent_1'] = { uniqueID: 'p_parent_1' };

        (gridObj.excelExportModule as any).isCollapsedStatePersist = true;
        (gridObj as any).isLocalData = false;

        (gridObj.excelExportModule as any).exportRowDataBound(excelRow);

        const grouping = excelRow.excelRows[excelRow.excelRows.length - 1].grouping;
        expect(grouping).toBeDefined();
        expect(grouping.isCollapsed).toBe(false);
        expect(grouping.isHidden).toBe(true);
        done();
    });

    afterAll(() => {
        destroy(gridObj);
    });
});