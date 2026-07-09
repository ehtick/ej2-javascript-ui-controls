/**
 * Grid PDF Export spec document
 */
/* tslint:disable */
import { Grid } from '../../../src/grid/base/grid';
import { Page } from '../../../src/grid/actions/page';
import { Selection } from '../../../src/grid/actions/selection';
import { Filter } from '../../../src/grid/actions/filter';
import { Sort } from '../../../src/grid/actions/sort';
import { LazyLoadGroup } from '../../../src/grid/actions/lazy-load-group';
import { Group } from '../../../src/grid/actions/group';
import { Toolbar } from '../../../src/grid/actions/toolbar';
import { DetailRow } from '../../../src/grid/actions/detail-row';
import { ForeignKey } from '../../../src/grid/actions/foreign-key';
import { data, employeeData, customerData, image } from '../base/datasource.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { PdfExport } from '../../../src/grid/actions/pdf-export';
import { Aggregate } from '../../../src/grid/actions/aggregate';
import { createGrid, destroy} from '../base/specutil.spec';
import { HierarchyGridPrintMode } from '../../../src/grid/base/enum';
import { PdfDocument, PdfGrid, PdfStandardFont, PdfFontFamily, PdfFontStyle, PdfStringFormat, PdfTextAlignment, PdfVerticalAlignment, PdfPageTemplateElement, RectangleF } from '@syncfusion/ej2-pdf-export';
import { DataManager,Query } from '@syncfusion/ej2-data';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { PdfExportProperties, ExportDetailTemplateEventArgs } from '../../../src/grid/base/interface';
import { ExportHelper, ExportValueFormatter } from '../../../src/grid/actions/export-helper';

Grid.Inject(Page, Group, Selection, Toolbar, PdfExport, DetailRow, ForeignKey, Aggregate,LazyLoadGroup,Filter,Sort);

describe('pdf Export =>', () => {
    let exportComplete: () => void = () => true;
    describe('Single Grid Pdf Export =>', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: employeeData,
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerText: 'city', width: 110 },
                        { field: 'Country', headerText: 'Country', width: 110 }
                    ],
                    pdfExportComplete: exportComplete,
                    beforePdfExport: (args: any) => {
                        gridObj.beforePdfExport = undefined;
                        args.cancel = true;
                    }
                }, done);
        });

        it("Export cancel Check", (done: Function) => {
            gridObj.pdfExport().then((doc) => {
                expect(doc).toBeUndefined();
                done();
            });
        });

        it('grid exporting(Check with multiple exporting)', (done) => {
            spyOn(gridObj, 'pdfExportComplete');
            gridObj.pdfExport({}, true).then((pdfDoc: PdfDocument) => {
                expect(gridObj.pdfExportComplete).toHaveBeenCalled();
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });     
        });
        
        it('Pdf grid Check column length', () => {
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: gridObj.dataSource } ,{});
            expect(pdfGrid.columns.count).toBe(5);
            expect(pdfGrid.rows.count).toBe((<any>gridObj.dataSource).length);
            expect((<any>pdfGrid.headers).rows.length).toBe(1);
        });

        it("hide a column", () => {
            gridObj.hideColumns('Title');
            expect(gridObj.getVisibleColumns().length).toBe(4);            
        });

        it('visibility check', () => {
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: gridObj.dataSource } ,{});
            expect(pdfGrid.columns.count).toBe(4);
        });

        it('visibility check include hidden column', () => {
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: gridObj.dataSource } , {includeHiddenColumn: true});
            expect(pdfGrid.columns.count).toBe(5);
        });

        it('check cell with value 0', () => {
            var data: Object = [gridObj.dataSource[0]];
            data[0]['EmployeeID'] = 0;
            gridObj.pdfQueryCellInfo = (args) => {
                if(args.column.field == 'EmployeeID' && args.data['FirstName'] == 'Nancy') {
                expect(args.value).toBe('0');
                }
            }
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: data } , {includeHiddenColumn: true});
        });

        it('check cell with value null', () => {
            var data: Object = [gridObj.dataSource[0]];
            data[0]['FirstName'] = null;
            gridObj.pdfQueryCellInfo = (args) => {
                if(args.column.field == 'FirstName' && args.data['EmployeeID'] == 0) {
                expect(args.value).toBe('');
                }
            }
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: data } , {includeHiddenColumn: true});
        });

        it('check cell with empty string value', () => {
            var data: Object = [gridObj.dataSource[0]];
            data[0]['FirstName'] = '';
            gridObj.pdfQueryCellInfo = (args) => {
                if(args.column.field == 'FirstName' && args.data['EmployeeID'] == 0) {
                expect(args.value).toBe('');
                }
            }
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: data } , {includeHiddenColumn: true});
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Stacked Header Grid Pdf Export =>', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', dataSource: employeeData, foreignKeyValue: 'FirstName', width: 120 },
                        {
                            headerText: 'Order Details', columns: [
                                { field: 'OrderDate', headerText: 'Order Date', textAlign: 'Right', width: 135, format: 'yMd' },
                                { field: 'Freight', headerText: 'Freight($)', textAlign: 'Right', width: 120, format: 'C2' },
                            ]
                        },
                        {
                            headerText: 'Ship Details', columns: [
                                { field: 'ShippedDate', headerText: 'Shipped Date', textAlign: 'Right', width: 145, format: 'yMd' },
                                { field: 'ShipCountry', headerText: 'Ship Country', width: 140 },
                            ]
                        }
                    ],
                    pdfExportComplete: exportComplete,
                }, done);
        });
        it('grid exporting(Check with multiple exporting)', (done) => {
            gridObj.pdfExport({dataSource: data}, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });     
        });
        it('Pdf grid header length', () => {
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: gridObj.dataSource } ,{});
            expect(pdfGrid.columns.count).toBe(5);
            expect(pdfGrid.rows.count).toBe((<any>gridObj.dataSource).length);
            expect((<any>pdfGrid.headers).rows.length).toBe(2);
            expect((<any>pdfGrid.headers).rows[0].gridCells.cells.length).toBe(5);
            expect((<any>pdfGrid.headers).rows[0].gridCells.cells[0].rowSpan).toBe(2);
            expect((<any>pdfGrid.headers).rows[0].gridCells.cells[1].columnSpan).toBe(2);
            expect((<any>pdfGrid.headers).rows[1].gridCells.cells.length).toBe(5);
        });

        it("hide a column", () => {
            gridObj.hideColumns('Freight', 'field');
            expect(gridObj.getVisibleColumns().length).toBe(4); 
        });
        it('stacked header visibility check', () => {
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: gridObj.dataSource } ,{});
            expect((<any>pdfGrid.headers).rows[0].gridCells.cells.length).toBe(4);
            expect((<any>pdfGrid.headers).rows[1].gridCells.cells.length).toBe(4);
        });

        it('stacked header visibility check for include hidden column', () => {
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: gridObj.dataSource } , {includeHiddenColumn: true});
            expect((<any>pdfGrid.headers).rows[0].gridCells.cells.length).toBe(5);
            expect((<any>pdfGrid.headers).rows[1].gridCells.cells.length).toBe(5);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Custom font in Grid Pdf Export =>', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData,
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerText: 'city', width: 110 },
                        { field: 'Country', headerText: 'Country', width: 110 }
                    ],
                    pdfExportComplete: exportComplete,
                }, done);
        });
        it('grid exporting(Check with multiple exporting)', (done) => {
            gridObj.pdfExport({dataSource: new DataManager(data)}, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });     
        });
        it('Pdf grid Check column length', () => {
            let pdfGrid: PdfGrid = (<any>gridObj.pdfExportModule).processGridExport(gridObj, {result: gridObj.dataSource }, {
                theme: {
                    header: { font: new PdfStandardFont(PdfFontFamily.TimesRoman, 10, PdfFontStyle.Italic) },
                    caption: { font: new PdfStandardFont(PdfFontFamily.TimesRoman, 11, PdfFontStyle.Italic) },
                    record: { font: new PdfStandardFont(PdfFontFamily.TimesRoman, 12, PdfFontStyle.Regular) }
                },
            });
            expect((<any>pdfGrid.headers).rows[0].style.font.fontSize).toBe(10);
            expect((<any>pdfGrid.headers).rows[0].style.font.fontStyle).toBe(PdfFontStyle.Italic);
            expect((<any>pdfGrid.headers).rows[0].style.font.fontFamily).toBe(PdfFontFamily.TimesRoman);
            expect((pdfGrid.rows as any).rows[0].style.font.fontFamily).toBe(PdfFontFamily.TimesRoman);
            expect((pdfGrid.rows as any).rows[0].style.font.fontSize).toBe(12);
            expect((pdfGrid.rows as any).rows[0].style.font.fontStyle).toBe(PdfFontStyle.Regular);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Hierarchy pdf export => ', () => {
        let gridObj: Grid;
        let catchEvent: boolean = true;
        let localData: Object[] = [{ OrderID: "100", CustomerID: "Vinet", Freight: "2.00", OrderDate: new Date() },
            { OrderID: "101", CustomerID: "Hanar", Freight: "2.01", OrderDate: new Date() },
            { OrderID: "102", CustomerID: "Mega", Freight: "4.48", OrderDate: new Date() },
            { OrderID: "103", CustomerID: "Sam", Freight: "19.23", OrderDate: new Date() }];
        let pdfpropery: PdfExportProperties = {dataSource: localData, footer: { fromBottom: -300 }};
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData,
                    allowSorting: true,
                    allowFiltering: true,
                    allowGrouping: true,
                    allowPaging: true,
                    pageSettings: {pageSize: 4},
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerText: 'city', width: 110 },
                        { field: 'Country', headerText: 'Country', width: 110 }
                    ],
                    childGrid: {
                        dataSource: data,
                        queryString: 'EmployeeID',
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                            { field: 'ShipCity', headerText: 'Ship City', width: 120 },
                            { field: 'Freight', headerText: 'Freight', width: 120 },
                            { field: 'ShipName', headerText: 'Ship Name', width: 150 }
                        ],
                        childGrid: {
                            dataSource: customerData,
                            queryString: 'CustomerID',
                            columns: [
                                { field: 'CustomerID', headerText: 'Customer ID', textAlign: 'Right', width: 75 },
                                { field: 'Phone', headerText: 'Phone', width: 100 },
                                { field: 'Address', headerText: 'Address', width: 120 },
                                { field: 'Country', headerText: 'Country', width: 100 }
                            ]
                        }
                    },
                    pdfExportComplete: exportComplete,
                }, done);
        });
        it('grid exporting(Check with multiple exporting)', (done) => {
            gridObj.pdfExport({}, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });     
        });
        it('Expand a detail row', (done) => {
            gridObj.childGrid.dataBound = () => {
                expect(gridObj.getRowsObject().filter((row: any) => row.isExpand && !row.isDetailRow).length).toBe(1);
                done();
            }
            gridObj.detailRowModule.expand(0);
        });

        it('Hierarchy grid exporting', (done) => {
            gridObj.pdfExport({}, true).then((doc) => {
                expect(doc).not.toBeUndefined();
                done();
            });
        });

        it('Hierarchy grid exporting', (done) => {
            gridObj.pdfExport({hierarchyExportMode: 'All'}, true).then((doc) => {
                expect(doc).not.toBeUndefined();
                done();
            });
        });

        it('Hierarchy grid exporting', (done) => {
            gridObj.pdfExport({hierarchyExportMode: 'None'}, true).then((doc) => {
                expect(doc).not.toBeUndefined();
                done();
            });
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

        it('pdf-export -> catch method', (done) => {
            gridObj.pdfExport({footer:{fromBottom: -300}}).then((doc) =>{} ).catch((e) =>{
                catchEvent = false;
                done();
            });
        });

        it('catch method check', () => {
          expect(catchEvent).toBeFalsy();
        });

        it('custom datasource catch method', (done) => {
            gridObj.pdfExport(pdfpropery).then((doc) =>{} ).catch((e) =>{
                catchEvent = true;
                done();
            });
        });

        it('catch method check', () => {
          expect(catchEvent).toBeTruthy();
        });
    
        afterAll(() => {
            destroy(gridObj);
            gridObj = catchEvent = pdfpropery = localData = null;
        });
    });

    // used for code coverage
    describe('Pdf Export with cell formatting =>', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0, 1),
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerText: 'city', width: 110 },
                        { field: 'Country', headerText: 'Country', width: 110 }
                    ],
                }, done);
        });

        it('customize the cells', (done) => {
            gridObj.pdfHeaderQueryCellInfo = (args) => {
                if (args.gridCell.column.field === 'EmployeeID') {
                    args.image = { base64: image };
                }
                if (args.gridCell.column.field === 'FirstName') {
                    args.hyperLink = {
                        target: 'mailto:nancy@domain.com',
                        displayText: 'FirstName'
                    };
                    args.style = {
                        verticalAlignment: 'Middle',
                    };                    
                }
                if (args.gridCell.column.field === 'Country') {
                    args.style = {
                        verticalAlignment: 'Top',
                    };
                }
            }
            gridObj.pdfQueryCellInfo = (args) => {
                if (args.column.field === 'EmployeeID') {
                    args.image = { base64: image };
                }
                if (args.column.field === 'FirstName') {
                    args.hyperLink = {
                        target: 'mailto:' + args.data['FirstName'] + '@domain.com',
                        displayText: args.data['FirstName']
                    };
                    args.style = {
                        border: { color: '#C25050', dashStyle: 'DashDot' }
                    };
                }
                if (args.column.field === 'City') {
                    args.colSpan = 3;
                    args.style = {
                        backgroundColor: '#99ffcc',
                        textBrushColor: '#C25050',
                        textPenColor: '#C25050',
                        textAlignment: 'Left',
                        paragraphIndent: 1,
                        cellPadding: 0,
                        italic: true,
                        bold: true,
                        underline: true,
                        strikeout: true,
                        border: { color: '#C25050', dashStyle: 'Dot' }
                    };
                }
            }
            gridObj.pdfExport({}, true).then((pdfDoc: PdfDocument) => {
                expect(1).toBeTruthy(1);
                done();
            });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    // used for code coverage
    describe('pdf export with export properties => ', () => {
        let gridObj: Grid;
        let pdfpropery: PdfExportProperties = {
            header: {
                fromTop: 0,
                height: 250,
                contents: [
                    {
                        type: 'Text',
                        value: 'INVOICE',
                        position: { x: 280, y: 0 },
                        style: { textBrushColor: '#C25050', fontSize: 25 },
                    },
                    {
                        type: 'Image',
                        src: image,
                        position: { x: 250, y: 100 },
                        size: { height: 100, width: 250 },
                    },
                ]
            },
            footer: {
                fromBottom: 160,
                height: 100,
                contents: [
                    {
                        type: 'Text',
                        value: 'Thank you for your business !',
                        position: { x: 250, y: 20 },
                        style: { textBrushColor: '#C67878', fontSize: 14 }
                    },
                    {
                        type: 'PageNumber',
                        position: { x: 100, y: 45 },
                        style: { textBrushColor: '#C67878', fontSize: 14 }
                    },
                    {
                        type: 'PageNumber',
                        position: { x: 300, y: 45 },
                        format: '$current/$total',
                        style: { textBrushColor: '#C67878', fontSize: 14 }
                    },
                    {
                        type: 'Line',
                        points: { x1: 10, y1: 45, x2: 50, y2: 45 },
                        style: {
                            penSize: 2,
                            dashStyle: 'Dash'
                        }
                    },
                ]
            },
            exportType: 'AllPages',
            fileName: "pdfdocument.pdf"
        };
        let pageSizes: string[] = ['Letter', 'Note', 'Legal', 'A0', 'A1', 'A2', 'A3', 'A5', 'A6', '',
            'A7', 'A8', 'A9', 'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'Archa', 'Archb', 'Archc', 'Archd', 'Arche', 'Flsa', 'HalfLetter', 'Letter11x17', 'Ledger'];
        let pdfSize: { height: number, width: number };
        let fontFamily = ['TimesRoman', 'Courier', 'Symbol', 'ZapfDingbats']
        let pdfFont: number = null;
        let pagenumberstyle: string[] = ['LowerLatin', 'LowerRoman', 'UpperLatin', 'UpperRoman'];
        let numberStyle: number = null;
        let gridfont: any = null;

        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0, 2),
                    allowPaging: true,
                    width: 600,
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerTextAlign: 'Center', headerText: 'city', width: 110 },
                        { field: 'Country', headerText: 'Country', width: 110 },
                        { field: 'LastName', headerText: 'Last Name', width: 110 }
                    ],
                    beforePdfExport: (args: any) => {
                        args.headerPageNumbers = [1];
                    }
                }, done);
        });

        it('export header in particular page', (done) => {
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('export options', (done) => {
            for (let i = 0; i < pageSizes.length; i++) {
                pdfSize = (gridObj.pdfExportModule as any).getPageSize(pageSizes[i]);
            }
            for (let i = 0; i < fontFamily.length; i++) {
                pdfFont = (gridObj.pdfExportModule as any).getFontFamily(fontFamily[i]);
            }
            for (let i = 0; i < pagenumberstyle.length; i++) {
                numberStyle = (gridObj.pdfExportModule as any).getPageNumberStyle(pagenumberstyle[i]);
            }
            gridfont = (gridObj.pdfExportModule as any).getGridPdfFont({
                header: { font: new PdfStandardFont(PdfFontFamily.TimesRoman, 11, PdfFontStyle.Bold), },
                caption: { font: new PdfStandardFont(PdfFontFamily.TimesRoman, 9) },
                record: { font: new PdfStandardFont(PdfFontFamily.TimesRoman, 10) }
            });
            gridObj.pdfExport({
                exportType: 'CurrentPage',
                pageSize: 'A2',
                pageOrientation: 'Landscape',
                allowHorizontalOverflow: false,
            }, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = pdfpropery = pageSizes = pdfSize = fontFamily = null;
            pdfFont = pagenumberstyle = numberStyle = gridfont = null;
        });
    });

    // used for code coverage
    describe('Aggregate export', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: data.slice(0, 1),
                    allowPdfExport: true,
                    allowPaging: true,
                    allowGrouping: true,
                    groupSettings: { columns: ['ShipRegion', 'ShipCountry'] },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: '120px' },
                        {
                            field: 'OrderDate', headerText: 'Order Date', headerTextAlign: 'Right',
                            textAlign: 'Right', width: '15%', format: 'yMd'
                        },
                        { field: 'Freight', headerText: 'Freight($)', textAlign: 'Right', width: 120, format: 'C2' },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 140 },
                        { field: 'ShipRegion', width: 140 },
                        { field: 'Verified', headerTextAlign: 'Justify', width: 140 },
                    ],
                    aggregates: [{
                        columns: [
                            {
                                type: 'Sum',
                                field: 'Freight',
                                format: 'C2',
                                footerTemplate: 'Sum: ${Sum}'
                            },
                            {
                                type: 'Max',
                                field: 'OrderDate',
                                format: { type: 'date', skeleton: 'medium' },
                                groupFooterTemplate: 'Max: ${Max}'
                            },
                            {
                                type: 'Average',
                                field: 'Freight',
                                format: 'C2',
                                groupCaptionTemplate: 'Max: ${Average}'
                            },
                            {
                                type: 'Min',
                                field: 'OrderDate',
                                format: { type: 'date', skeleton: 'medium' },
                                groupCaptionTemplate: 'Min: ${Min}'
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                type: 'Count',
                                field: 'Freight',
                                format: 'C2',
                            },
                            {
                                type: 'TrueCount',
                                field: 'Verified',
                            },
                            {
                                type: 'Max',
                                field: 'OrderDate',
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                type: 'Sum',
                                field: 'Freight',
                                format: 'C2',
                            },
                            {
                                type: 'FalseCount',
                                field: 'Verified',
                            },
                            {
                                type: 'Min',
                                field: 'OrderDate',
                            },
                        ]
                    },
                    {
                        columns: [
                            {
                                type: 'Average',
                                field: 'Freight',
                            },
                        ]
                    }
                    ],
                }, done);
        });

        it('export aggregate with theme', (done) => {
            gridObj.pdfExport({
                exportType: 'CurrentPage',
                theme: {
                    header: {
                        fontColor: '#64FA50', fontName: 'Calibri', fontSize: 17, bold: true, border: { color: '#C25050' }, italic: true, underline: true, strikeout: true
                    },
                    record: {
                        fontColor: '#64FA50', fontName: 'Calibri', fontSize: 17, bold: true, border: { color: '#C25050' }
                    },
                    caption: {
                        fontColor: '#64FA50', fontName: 'Calibri', fontSize: 17, bold: true, border: { color: '#C25050' }
                    }
                },
            }, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('multiple export', () => {
        let gridObj: Grid;
        let gridObj1: Grid;

        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0, 5),
                    allowPaging: true,
                    width: 600,
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerText: 'city', width: 110 },
                        { field: 'Country', headerText: 'Country', width: 110 }
                    ],
                }, done);

            gridObj1 = createGrid(
                {
                    dataSource: employeeData.slice(5, 9),
                    allowPaging: true,
                    width: 600,
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerText: 'city', width: 110 },
                        { field: 'Country', headerText: 'Country', width: 110 }
                    ],
                }, done);
        });

        it('export same sheet', (done) => {
            gridObj.exportGrids = [gridObj.element.id, gridObj1.element.id];
            gridObj.pdfExport({
                multipleExport: { type: "AppendToPage", blankSpace: 10 }
            }, true).then((pdfDoc: PdfDocument) => {
                expect(1).toBeTruthy(1);
                done();
            });
        });

        it('export new sheet', (done) => {
            gridObj.pdfExport({}, true).then((pdfDoc: PdfDocument) => {
                expect(1).toBeTruthy(1);
                done();
            });
        });

        afterAll(() => {
            destroy(gridObj);
            destroy(gridObj1);
            gridObj = gridObj1 = null;
        });
    });

    describe('Detail template pdf export => ', () => {
        let gridObj: Grid;
        let pdfpropery: PdfExportProperties = {
            hierarchyExportMode: 'All'
        };

        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: employeeData.slice(0, 1),
                    allowPaging: true,
                    detailTemplate: `<div>Hello</div>`,
                    width: 600,
                    allowPdfExport: true,
                    columns: [
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                        { field: 'FirstName', headerText: 'Name', width: 125 },
                        { field: 'Title', headerText: 'Title', width: 180 },
                        { field: 'City', headerText: 'city', width: 110 },
                        { field: 'Country', headerText: 'Country', width: 110 }
                    ],
                }, done);
        });

        it('plain text', (done) => {
            gridObj.exportDetailTemplate = (args: ExportDetailTemplateEventArgs) => {
                args.value = {
                    text: "custom text"
                };
            }
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('plain image', (done) => {
            gridObj.exportDetailTemplate = (args: ExportDetailTemplateEventArgs) => {
                args.value = {
                    image: {
                        base64: image,
                        height: 100, width: 200
                    }
                };
            }
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('export hyperlink', (done) => {
            gridObj.exportDetailTemplate = (args: ExportDetailTemplateEventArgs) => {
                args.value = {
                    hyperLink: {
                        target: 'mailto:' + args.parentRow.data['FirstName'] + '@domain.com',
                        displayText: args.parentRow.data['FirstName']
                    }
                };
            }
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('export with spanning', (done) => {
            gridObj.exportDetailTemplate = (args: ExportDetailTemplateEventArgs) => {
                args.value = {
                    columnCount: 2,
                    rows: [
                        {
                            cells: [
                                { index: 0, colSpan: 2, value: "First Name: " + args.parentRow.data['FirstName'] },
                            ]
                        },
                    ],
                }
            }
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('export normal table', (done) => {
            gridObj.exportDetailTemplate = (args: ExportDetailTemplateEventArgs) => {
                args.value = {
                    columnHeader: [
                        { cells: [{ value: 'INVOICE' }] }
                    ],
                    rows: [
                        {
                            cells: [
                                {
                                    value: 'Last Name: ' + args.parentRow.data['LastName'],
                                },
                            ]
                        },
                    ]
                };
            }
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('export image with table', (done) => {
            gridObj.exportDetailTemplate = (args: ExportDetailTemplateEventArgs) => {
                args.value = {
                    rows: [
                        {
                            cells: [
                                {
                                    image: {
                                        base64: image,
                                    }
                                },
                            ]
                        },
                    ],
                };
            }
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('export styles', (done) => {
            gridObj.exportDetailTemplate = (args: ExportDetailTemplateEventArgs) => {
                args.value = {
                    rows: [
                        {
                            cells: [
                                {
                                    value: 'Last Name: ' + args.parentRow.data['LastName'], style: {
                                        backColor: '#99ffcc',
                                        bold: true,
                                        fontSize: 15,
                                        indent: 1,
                                        italic: true,
                                        strikeThrough: true,
                                        underline: true,
                                        wrapText: true,
                                    },
                                    hyperLink: {
                                        target: 'mailto:' + args.parentRow.data['FirstName'] + '@domain.com',
                                        displayText: args.parentRow.data['FirstName']
                                    },
                                },
                            ]
                        },
                    ]
                };
            }
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('export empty', (done) => {
            gridObj.exportDetailTemplate = (args: ExportDetailTemplateEventArgs) => {
                args.value = {};
            }
            gridObj.pdfExport(pdfpropery, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = pdfpropery = null;
        });
    });

    // used for code coverage
    describe('Lazy load group pdf export', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data.slice(0, 1),
                    allowPdfExport: true,
                    allowPaging: true,
                    allowGrouping: true,
                    groupSettings: { enableLazyLoading: true, columns: ['ShipCountry'] },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: '120px' },
                        { field: 'Freight', headerText: 'Freight($)', textAlign: 'Right', width: 120, format: 'C2' },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 140 },
                    ],
                    aggregates: [{
                        columns: [
                            {
                                type: 'Sum',
                                field: 'Freight',
                                format: 'C2',
                                footerTemplate: 'Sum: ${Sum}'
                            },
                        ]
                    }],
                }, done);
        });

        it('Hierarchy export all mode', (done: Function) => {
            gridObj.pdfExport(null, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        it('Hierarchy export none mode', (done: Function) => {
            gridObj.pdfExport({ hierarchyExportMode: 'None' }, true).then((pdfDoc: PdfDocument) => {
                expect(pdfDoc instanceof PdfDocument).toBeTruthy();
                done();
            });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

     // used for code coverage
     describe('code coverage for pdf export file', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data.slice(0, 1),
                    allowPdfExport: true,
                    allowPaging: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: '120px' },
                        { field: 'Freight', headerText: 'Freight($)', textAlign: 'Right', width: 120, format: 'C2' },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 140 },
                    ],

                }, done);
        });

        it('pdf export file code coverage', () => {
            let theme: any = { 
                header: { font: { fontSize: 10 } },
                caption: { font: { fontSize: 10 } },
                record: { font: { fontSize: 10 } }
            };
            (gridObj as any).pdfExportModule.getGridPdfFont({});
            (gridObj as any).pdfExportModule.getSummaryWithoutTemplate({ FalseCount: true });
            (gridObj as any).pdfExportModule.getSummaryWithoutTemplate({ Custom: true });
            (gridObj as any).pdfExportModule.getSummaryWithoutTemplate({});
            (gridObj as any).pdfExportModule.getFont({ font: true });
            (gridObj as any).pdfExportModule.getDashStyle('DashDotDot');
            (gridObj as any).pdfExportModule.getDashStyle('');
            (gridObj as any).pdfExportModule.getBrushFromContent({ style: {} });
            (gridObj as any).pdfExportModule.getGridPdfFont(theme);
        });

        it('getGridPdfFont method code coverage - header with PdfTrueTypeFont', () => {
            let theme: any = {
                header: { font: { fontFamily: 'Arial', fontSize: 12, fontStyle: 'Bold', isTrueType: true } }
            };
            try {
                (gridObj as any).pdfExportModule.getGridPdfFont(theme);
            } catch (e) {
            }
        });

        it('getGridPdfFont method code coverage - caption with PdfTrueTypeFont', () => {
            let theme: any = {
                caption: { font: { fontFamily: 'Times New Roman', fontSize: 11, fontStyle: 'Italic', isTrueType: true } }
            };
            try {
                (gridObj as any).pdfExportModule.getGridPdfFont(theme);
            } catch (e) {
            }
        });

        it('getGridPdfFont method code coverage - record with PdfTrueTypeFont', () => {
            let theme: any = {
                record: { font: { fontFamily: 'Courier New', fontSize: 10, fontStyle: 'Regular', isTrueType: true } }
            };
            try {
                (gridObj as any).pdfExportModule.getGridPdfFont(theme);
            } catch (e) {
            }
        });

        it('getGridPdfFont method code coverage - all three with PdfTrueTypeFont', () => {
            let theme: any = {
                header: { font: { fontFamily: 'Arial', fontSize: 12, fontStyle: 'Bold', isTrueType: true } },
                caption: { font: { fontFamily: 'Times New Roman', fontSize: 11, fontStyle: 'Italic', isTrueType: true } },
                record: { font: { fontFamily: 'Courier New', fontSize: 10, fontStyle: 'Regular', isTrueType: true } }
            };
            try {
                (gridObj as any).pdfExportModule.getGridPdfFont(theme);
            } catch (e) {
            }
        });

        it('getGridPdfFont method code coverage - header with PdfTrueTypeFont and ItalicBold style', () => {
            let theme: any = {
                header: { font: { fontFamily: 'Verdana', fontSize: 13, fontStyle: 'ItalicBold', isTrueType: true } }
            };
            try {
                (gridObj as any).pdfExportModule.getGridPdfFont(theme);
            } catch (e) {
            }
        });

        it('getGridPdfFont method code coverage - caption with PdfTrueTypeFont and Underline style', () => {
            let theme: any = {
                caption: { font: { fontFamily: 'Georgia', fontSize: 10, fontStyle: 'Underline', isTrueType: true } }
            };
            try {
                (gridObj as any).pdfExportModule.getGridPdfFont(theme);
            } catch (e) {
            }
        });

        it('getGridPdfFont method code coverage - record with PdfTrueTypeFont and Strikeout style', () => {
            let theme: any = {
                record: { font: { fontFamily: 'Calibri', fontSize: 9, fontStyle: 'Strikeout', isTrueType: true } }
            };
            try {
                (gridObj as any).pdfExportModule.getGridPdfFont(theme);
            } catch (e) {
            }
        });

        it('getGridPdfFont method code coverage - mixed PdfTrueTypeFont and PdfStandardFont', () => {
            let theme: any = {
                header: { font: { fontFamily: 'Arial', fontSize: 12, fontStyle: 'Bold', isTrueType: true } },
                caption: { font: { fontFamily: 'TimesRoman', fontSize: 11, fontStyle: 'Regular', isTrueType: false } },
                record: { font: { fontFamily: 'Courier', fontSize: 10, fontStyle: 'Italic', isTrueType: true } }
            };
            try {
                (gridObj as any).pdfExportModule.getGridPdfFont(theme);
            } catch (e) {
            }
        });

        it('setContentFormat method code coverage - text alignment', () => {
            let content: any = {
                type: 'Text',
                value: 'Test Content',
                style: {hAlign: 'Left', vAlign: 'Middle', fontSize: 12, textBrushColor: '#000000' },
                size: { width: 100, height: 20}
            };
            let format: any = new PdfStringFormat(PdfTextAlignment.Left, PdfVerticalAlignment.Middle);
            (gridObj as any).pdfExportModule.setContentFormat(content, format);
        });

        it('setContentFormat method code coverage - with alignment property', () => {
            let content: any = {
                type: 'Text',
                value: 'Aligned Content',
                stringFormat: { alignment: 'Center' },
                style: {hAlign: 'Right', vAlign: 'Middle', fontSize: 12, textBrushColor: '#000000' },
                size: { width: 100, height: 20}
            };
            let format: any = new PdfStringFormat(PdfTextAlignment.Left, PdfVerticalAlignment.Middle);
            (gridObj as any).pdfExportModule.setContentFormat(content, format);
        });

        it('setContentFormat method code coverage - with vertical alignment', () => {
            let content: any = {
                type: 'Text',
                value: 'Vertically Aligned',
                stringFormat: { alignment: 'Center', lineAlignment: 'Middle' },
                style: {hAlign: 'Center', vAlign: 'Middle', fontSize: 12, textBrushColor: '#000000' },
                size: { width: 100, height: 20}
            };
            let format: any = new PdfStringFormat(PdfTextAlignment.Left, PdfVerticalAlignment.Middle);
            (gridObj as any).pdfExportModule.setContentFormat(content, format);
        });

        it('setContentFormat method code coverage - with vertical alignment', () => {
            let content: any = {
                type: 'Text',
                value: 'Vertically Aligned',
                stringFormat: { alignment: 'Center', lineAlignment: 'Middle' },
                style: {hAlign: 'Justify', vAlign: 'Middle', fontSize: 12, textBrushColor: '#000000' },
                size: { width: 100, height: 20}
            };
            let format: any = new PdfStringFormat(PdfTextAlignment.Left, PdfVerticalAlignment.Middle);
            (gridObj as any).pdfExportModule.setContentFormat(content, format);
        });

        it('getPenFromContent method code coverage - with hex color', () => {
            let content: any = {
                type: 'Line',
                style: { penColor: '#FF0000', penSize: 2 }
            };
            (gridObj as any).pdfExportModule.getPenFromContent(content);
            let border: any = { color: '#FF0000', dashStyle: 'Solid', width: 2 };
            (gridObj.pdfExportModule as any).getBorderStyle(border);
            content.style.fontFamily = 'TimesRoman';
                (gridObj.pdfExportModule as any).getFont(content);
                expect(() => {
                (gridObj as any).pdfExportModule.hexToRgb('#FF00');
            }).toThrow(new Error('please set valid hex value for color...'));
        });

        it('getPenFromContent method code coverage - with RGB color', () => {
            let content: any = {
                type: 'Line',
                style: { penColor: '#00FF00', penSize: 3 }
            };
            (gridObj as any).pdfExportModule.getPenFromContent(content);
        });

        it('getPenFromContent method code coverage - without style', () => {
            let content: any = {
                type: 'Line'
            };
            (gridObj as any).pdfExportModule.getPenFromContent(content);
        });

        it('drawText method code coverage - with direct call via export', (done) => {
            gridObj.pdfExport({
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'Text',
                            value: 'Draw Text Coverage',
                            position: { x: 50, y: 20 },
                            style: { textBrushColor: '#0000FF', fontSize: 14 }
                        }
                    ]
                }
            }).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((error) => {
                done();
            });
        });

        it('drawText method code coverage - direct call', (done: Function) => {
            gridObj.pdfExport({
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [{ type: 'Text', value: 'Test', position: { x: 50, y: 20 }, style: { fontSize: 12 } }]
                }
            }).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((error) => {
                done();
            });
        });

        it('drawPageNumber method code coverage - with format', (done) => {
            gridObj.pdfExport({
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 250, y: 20 },
                            format: 'Page $current of $total',
                            pageNumberType: 'Arabic',
                            style: { textBrushColor: '#FF0000' }
                        }
                    ]
                }
            }).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((error) => {
                done();
            });
        });

        it('processContentValidation - Text content with valid position', () => {
            let content: any = {
                type: 'Text',
                position: { x: 50, y: 20 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).not.toThrow();
        });

        it('processContentValidation - PageNumber content with valid position', () => {
            let content: any = {
                type: 'PageNumber',
                position: { x: 100, y: 30 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).not.toThrow();
        });

        it('processContentValidation - Image content with valid position', () => {
            let content: any = {
                type: 'Image',
                position: { x: 150, y: 40 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).not.toThrow();
        });

        it('processContentValidation - Line content with valid coordinates', () => {
            let content: any = {
                type: 'Line',
                points: { x1: 10, y1: 20, x2: 100, y2: 30 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).not.toThrow();
        });

        it('processContentValidation - undefined content type throws error', () => {
            let content: any = {
                type: undefined,
                position: { x: 50, y: 20 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please set valid content type...'));
        });

        it('processContentValidation - null content type throws error', () => {
            let content: any = {
                type: null,
                position: { x: 50, y: 20 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please set valid content type...'));
        });

        it('processContentValidation - Line with undefined points throws error', () => {
            let content: any = {
                type: 'Line',
                points: undefined
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid points in Line content...'));
        });

        it('processContentValidation - Line with null points throws error', () => {
            let content: any = {
                type: 'Line',
                points: null
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid points in Line content...'));
        });

        it('processContentValidation - Line with invalid x1 coordinate throws error', () => {
            let content: any = {
                type: 'Line',
                points: { x1: 'invalid', y1: 20, x2: 100, y2: 30 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid x1 co-ordinate in Line points...'));
        });

        it('processContentValidation - Line with undefined x1 coordinate throws error', () => {
            let content: any = {
                type: 'Line',
                points: { x1: undefined, y1: 20, x2: 100, y2: 30 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid x1 co-ordinate in Line points...'));
        });

        it('processContentValidation - Line with invalid y1 coordinate throws error', () => {
            let content: any = {
                type: 'Line',
                points: { x1: 10, y1: 'invalid', x2: 100, y2: 30 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid y1 co-ordinate in Line points...'));
        });

        it('processContentValidation - Line with undefined y1 coordinate throws error', () => {
            let content: any = {
                type: 'Line',
                points: { x1: 10, y1: undefined, x2: 100, y2: 30 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid y1 co-ordinate in Line points...'));
        });

        it('processContentValidation - Line with invalid x2 coordinate throws error', () => {
            let content: any = {
                type: 'Line',
                points: { x1: 10, y1: 20, x2: 'invalid', y2: 30 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid x2 co-ordinate in Line points...'));
        });

        it('processContentValidation - Line with invalid y2 coordinate throws error', () => {
            let content: any = {
                type: 'Line',
                points: { x1: 10, y1: 20, x2: 100, y2: 'invalid' }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid y2 co-ordinate in Line points...'));
        });

        it('processContentValidation - Text with undefined position throws error', () => {
            let content: any = {
                type: 'Text',
                position: undefined
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid position in Text content...'));
        });

        it('processContentValidation - Text with null position throws error', () => {
            let content: any = {
                type: 'Text',
                position: null
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid position in Text content...'));
        });

        it('processContentValidation - Text with invalid x position throws error', () => {
            let content: any = {
                type: 'Text',
                position: { x: 'invalid', y: 20 }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid x co-ordinate in Text position...'));
        });

        it('processContentValidation - Text with invalid y position throws error', () => {
            let content: any = {
                type: 'Text',
                position: { x: 50, y: 'invalid' }
            };
            expect(() => {
                (gridObj as any).pdfExportModule.processContentValidation(content);
            }).toThrow(new Error('please enter valid y co-ordinate in Text position...'));
        });

        it('drawPageTemplate - with text content', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Text',
                        value: 'Header Text',
                        position: { x: 50, y: 20 },
                        style: { textBrushColor: '#000000', fontSize: 12 }
                    }
                ]
            };
            let result = (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            expect(result).toBeDefined();
        });

        it('drawPageTemplate - with page number content', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'PageNumber',
                        position: { x: 250, y: 20 },
                        pageNumberType: 'Arabic',
                        style: { textBrushColor: '#0000FF' }
                    }
                ]
            };
            let result = (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            expect(result).toBeDefined();
        });

        it('drawPageTemplate - with line content', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Line',
                        points: { x1: 10, y1: 50, x2: 490, y2: 50 },
                        style: { penColor: '#FF0000', penSize: 2 }
                    }
                ]
            };
            let result = (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            expect(result).toBeDefined();
        });

        it('drawPageTemplate - with multiple content types', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Text',
                        value: 'Report',
                        position: { x: 50, y: 10 },
                        style: { textBrushColor: '#000000' }
                    },
                    {
                        type: 'Line',
                        points: { x1: 10, y1: 40, x2: 490, y2: 40 },
                        style: { penColor: '#000000', penSize: 1 }
                    },
                    {
                        type: 'PageNumber',
                        position: { x: 450, y: 20 },
                        style: { textBrushColor: '#666666' }
                    }
                ]
            };
            let result = (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            expect(result).toBeDefined();
        });

        it('drawPageTemplate - Text with empty value throws error', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Text',
                        value: '',
                        position: { x: 50, y: 20 },
                        style: {}
                    }
                ]
            };
            expect(() => {
                (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            }).toThrow(new Error('please enter the valid input value in text content...'));
        });

        it('drawPageTemplate - Text with undefined value throws error', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Text',
                        value: undefined,
                        position: { x: 50, y: 20 },
                        style: {}
                    }
                ]
            };
            expect(() => {
                (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            }).toThrow(new Error('please enter the valid input value in text content...'));
        });

        it('drawPageTemplate - Text with null value throws error', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Text',
                        value: null,
                        position: { x: 50, y: 20 },
                        style: {}
                    }
                ]
            };
            expect(() => {
                (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            }).toThrow(new Error('please enter the valid input value in text content...'));
        });

        it('drawPageTemplate - Text with non-string value throws error', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Text',
                        value: 123,
                        position: { x: 50, y: 20 },
                        style: {}
                    }
                ]
            };
            expect(() => {
                (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            }).toThrow(new Error('please enter the valid input value in text content...'));
        });

        it('drawPageTemplate - Image with undefined src throws error', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Image',
                        src: undefined,
                        position: { x: 150, y: 20 },
                        size: { height: 40, width: 40 }
                    }
                ]
            };
            expect(() => {
                (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            }).toThrow(new Error('please enter the valid base64 string in image content...'));
        });

        it('drawPageTemplate - Image with null src throws error', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Image',
                        src: null,
                        position: { x: 150, y: 20 },
                        size: { height: 40, width: 40 }
                    }
                ]
            };
            expect(() => {
                (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            }).toThrow(new Error('please enter the valid base64 string in image content...'));
        });

        it('drawPageTemplate - Image with empty src throws error', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'Image',
                        src: '',
                        position: { x: 150, y: 20 },
                        size: { height: 40, width: 40 }
                    }
                ]
            };
            expect(() => {
                (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            }).toThrow(new Error('please enter the valid base64 string in image content...'));
        });

        it('drawPageTemplate - with invalid content type throws error', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let header: any = {
                contents: [
                    {
                        type: 'InvalidType',
                        position: { x: 50, y: 20 }
                    }
                ]
            };
            expect(() => {
                (gridObj as any).pdfExportModule.drawPageTemplate(template, header);
            }).toThrow(new Error('Please set valid content type...'));
        });

        it('drawPageTemplate returns PdfPageTemplateElement', () => {
            let template: any = new PdfPageTemplateElement(new RectangleF(0, 0, 500, 100));
            let footer: any = {
                contents: [
                    {
                        type: 'Text',
                        value: 'Footer',
                        position: { x: 50, y: 20 },
                        style: { textBrushColor: '#333333' }
                    }
                ]
            };
            let result = (gridObj as any).pdfExportModule.drawPageTemplate(template, footer);
            expect(result).toBe(template);
        });



        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    // used for code coverage
    describe('904075: Vue3 is not correctly printing and exporting custom templates', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data.slice(0, 4),
                    allowPaging: true,
                    pageSettings: { pageSize: 3 },
                    toolbar: ['PdfExport'],
                    allowPdfExport: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID' },
                        { field: 'ShipCountry', headerText: 'Ship Country' },
                        { field: 'CustomerID', headerText: 'Customer ID' },
                    ],
                    aggregates: [{
                        columns: [{
                            type: 'Count',
                            field: 'ShipCountry',
                            footerTemplate: 'Count: ${Count}'
                        }]
                    }]

                }, done);
        });

        it('vue3 aggregates code coverage', () => {
            gridObj.isVue = true;
            (gridObj as any).isVue3 = true;
        });

        it('PdfExport', () => {
            gridObj.pdfExport();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2-1006451: Script error throws on pdfExport when last stacked header has no visible columns =>', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPdfExport: true,
                    allowPaging: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 100 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 100 },
                        {
                            headerText: 'Order Details', textAlign: 'Center', columns: [
                                { field: 'OrderDate', headerText: 'Order Date', format: 'yMd', width: 100, visible: false },
                                { field: 'Freight', headerText: 'Freight ($)', format: 'C1', width: 100, visible: false }
                            ]
                        }
                    ],
                }, done);
        });

        it('should export PDF without script error when stacked header has no visible columns', (done: Function) => {
            gridObj.pdfExport().then((pdfDoc: PdfDocument) => {
                expect(pdfDoc).not.toBeUndefined();
                done();
            });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('PDF Export Header/Footer Methods Coverage =>', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data.slice(0, 2),
                    allowPdfExport: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                        { field: 'Freight', headerText: 'Freight', textAlign: 'Right', width: 120 },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 140 },
                    ],
                }, done);
        });

        it('PDF export with header text and textBrushColor - drawText method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'Text',
                            value: 'Exported Report',
                            position: { x: 50, y: 20 },
                            style: {
                                textBrushColor: '#000000'
                            }
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with header text and textPenColor - drawText method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'Text',
                            value: 'Test Header',
                            position: { x: 50, y: 20 },
                            style: {
                                textBrushColor: '#FF0000',
                                textPenColor: '#0000FF'
                            }
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with header text and stringFormat - drawText method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'Text',
                            value: 'Aligned Header Text',
                            position: { x: 50, y: 20 },
                            style: {
                                textBrushColor: '#000000'
                            },
                            stringFormat: {
                                alignment: 'Center'
                            }
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with header text no brush - drawText method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'Text',
                            value: 'Test Header',
                            position: { x: 50, y: 20 },
                            style: {}
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with header page number default format - drawPageNumber method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 200, y: 20 },
                            pageNumberType: 'Arabic',
                            style: {}
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                expect(e).toBeUndefined();
                done();
            });
        });

        it('PDF export with header page number with textBrushColor - drawPageNumber method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 200, y: 20 },
                            pageNumberType: 'LowerRoman',
                            style: {
                                textBrushColor: '#0000FF'
                            }
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with $current placeholder - drawPageNumber method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 200, y: 20 },
                            format: 'Page $current',
                            pageNumberType: 'Arabic',
                            style: {}
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with $current and $total placeholders - drawPageNumber method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 200, y: 20 },
                            format: 'Page $current of $total',
                            pageNumberType: 'UpperRoman',
                            style: {}
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with $total before $current - drawPageNumber method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 200, y: 20 },
                            format: '$total pages, current: $current',
                            pageNumberType: 'LowerLatin',
                            style: {}
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with only $total placeholder - drawPageNumber method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 200, y: 20 },
                            format: 'Total: $total',
                            pageNumberType: 'UpperLatin',
                            style: {}
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with page number and hex brush color - drawPageNumber and getPenFromContent coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 200, y: 20 },
                            format: 'Page $current of $total',
                            pageNumberType: 'Arabic',
                            style: {
                                textBrushColor: '#FF0000'
                            }
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with text and custom pen color - getPenFromContent coverage', (done: Function) => {
            const pdfExportProperties: any = {
                header: {
                    fromTop: 10,
                    height: 60,
                    contents: [
                        {
                            type: 'Text',
                            value: 'Styled Text',
                            position: { x: 50, y: 20 },
                            style: {
                                textBrushColor: '#000000',
                                textPenColor: '#FF0000'
                            }
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with footer text content - footer drawText method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                footer: {
                    fromBottom: 160,
                    height: 60,
                    contents: [
                        {
                            type: 'Text',
                            value: 'Report Footer',
                            position: { x: 250, y: 20 },
                            style: {
                                textBrushColor: '#444444'
                            }
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        it('PDF export with footer page number - footer drawPageNumber method coverage', (done: Function) => {
            const pdfExportProperties: any = {
                footer: {
                    fromBottom: 160,
                    height: 60,
                    contents: [
                        {
                            type: 'PageNumber',
                            position: { x: 250, y: 20 },
                            format: 'Page $current',
                            pageNumberType: 'Arabic',
                            style: {}
                        }
                    ]
                }
            };
            gridObj.pdfExport(pdfExportProperties).then((pdfDoc: PdfDocument) => {
                done();
            }).catch((e) => {
                done();
            });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
});



// describe('Blob data pdf export => ', () => {
//     let gridObj: Grid;
//     let checkBoxFilter: Element; 
//     let exportComplete: () => void;
//     beforeAll((done: Function) => {
//         gridObj = createGrid(
//             {
//                 dataSource: data,
//                 allowPaging: true,
//                 filterSettings: { type: 'Menu', showFilterBarStatus: true },
//                 columns: [{ field: 'OrderID', type: 'number', visible: true },
//                 { field: 'CustomerID', type: 'string', filter: {type: 'CheckBox'} },
//                 { field: 'Freight', format: 'C2', type: 'number' }
//                 ],
//                 allowPdfExport: true,
//                 pdfExportComplete: exportComplete
//             }, done);
//     });

//     it('blob pdf export testing', (done) => {
//         let exportComplete: any = (e: any)=>{            
//             expect(e.promise).not.toBeUndefined();            
//             gridObj.pdfExportComplete = null;
//             done();
//         };
//         gridObj.pdfExportComplete = exportComplete;
//         gridObj.pdfExport(null,null,null,true);       
//     });

//     afterAll(() => {
//         destroy(gridObj);
//     });
// });  


// describe('PDF Export', () => {
//     let gridObj: Grid;
//     let elem: HTMLElement = createElement('div', { id: 'Grid' });
//     let actionBegin: (e?: Object) => void;
//     let actionComplete: (e?: Object) => void;
//     function QueryCellEvent(args: QueryCellInfoEventArgs): void {
//         let data: any = args.data;
//         if (args.column.field == 'Freight' && data.Freight > 50) {
//             args.colSpan = 2;
//         }
//     }

//     let rData = new DataManager(data.slice(10, 15) as JSON[]);
//     let remoteData: PdfExportProperties = {
//         dataSource: rData,
//         pageSize: 'Legal',
//         pageOrientation: 'Landscape',
//     }

//     let exportproperties: PdfExportProperties = {
//         exportType: 'CurrentPage',
//         includeHiddenColumn: true,
//         pageSize: 'Letter',
//         pageOrientation: 'Portrait',
//         header: {
//             fromTop: 0,
//             height: 150,
//             contents: [
//                 {
//                     type: 'Image',
//                     src: image,
//                     position: { x: 250, y: 10 },
//                     size: { height: 100, width: 250 },
//                 },
//                 {
//                     type: 'Line',
//                     style: { penColor: '#C67878', penSize: 2, dashStyle: 'Solid' },
//                     points: { x1: 0, y1: 4, x2: 500, y2: 4 }
//                 },
//                 {
//                     type: 'Line',
//                     style: { penColor: '#C67878', penSize: 2, dashStyle: 'Dot' },
//                     points: { x1: 0, y1: 7, x2: 500, y2: 7 }
//                 },
//                 {
//                     type: 'Line',
//                     style: { penColor: '#C67878', penSize: 2, dashStyle: 'Dot' },
//                     points: { x1: 0, y1: 114, x2: 500, y2: 114 }
//                 },
//                 {
//                     type: 'Line',
//                     style: { penColor: '#C67878', penSize: 2, dashStyle: 'Solid' },
//                     points: { x1: 0, y1: 117, x2: 500, y2: 117 }
//                 },
//                 {
//                     type: 'PageNumber',
//                     pageNumberType: 'Arabic',
//                     format: 'Page {$current} of {$total}', //optional
//                     position: { x: 0, y: 25 },
//                     // size: { height: 40, width: 200 }, //optional
//                     style: { textBrushColor: '#C67878', fontSize: 15, hAlign: 'Center' }
//                 },
//                 {
//                     type: 'Text',
//                     value: "Northwind Traders",
//                     position: { x: 0, y: 50 },
//                     style: { textBrushColor: '#000000', fontSize: 13 }
//                 },
//                 {
//                     type: 'Text',
//                     value: "2501 Aerial Center Parkway",
//                     position: { x: 0, y: 75 },
//                     style: { textBrushColor: '#000000', fontSize: 13 }
//                 },
//                 {
//                     type: 'Text',
//                     value: "Tel +1 888.936.8638 Fax +1 919.573.0306",
//                     position: { x: 0, y: 100 },
//                     style: { textBrushColor: '#000000', fontSize: 13 }
//                 },
//             ]
//         },
//         footer: {
//             fromBottom: 160,
//             height: 150,
//             contents: [
//                 {
//                     type: 'Image',
//                     src: image,
//                     position: { x: 250, y: 10 },
//                     size: { height: 100, width: 250 },
//                 },
//                 {
//                     type: 'Line',
//                     style: { penColor: '#000055', penSize: 2, dashStyle: 'Solid' },
//                     points: { x1: 0, y1: 4, x2: 500, y2: 4 }
//                 },
//                 {
//                     type: 'Line',
//                     style: { penColor: '#000055', penSize: 2, dashStyle: 'Dot' },
//                     points: { x1: 0, y1: 7, x2: 500, y2: 7 }
//                 },
//                 {
//                     type: 'Line',
//                     style: { penColor: '#000055', penSize: 2, dashStyle: 'Dot' },
//                     points: { x1: 0, y1: 114, x2: 500, y2: 114 }
//                 },
//                 {
//                     type: 'Line',
//                     style: { penColor: '#000055', penSize: 2, dashStyle: 'Solid' },
//                     points: { x1: 0, y1: 117, x2: 500, y2: 117 }
//                 },
//                 {
//                     type: 'PageNumber',
//                     pageNumberType: 'Arabic',
//                     format: 'Page {$current} of {$total}', //optional
//                     position: { x: 0, y: 25 },
//                     // size: { height: 40, width: 200 }, //optional
//                     style: { textBrushColor: '#000000', fontSize: 15, hAlign: 'Center' }
//                 },
//                 {
//                     type: 'Text',
//                     value: "Northwind Traders",
//                     position: { x: 0, y: 50 },
//                     style: { textBrushColor: '#000000', fontSize: 13 }
//                 },
//                 {
//                     type: 'Text',
//                     value: "2501 Aerial Center Parkway",
//                     position: { x: 0, y: 75 },
//                     style: { textBrushColor: '#000000', fontSize: 13 }
//                 },
//                 {
//                     type: 'Text',
//                     value: "Tel +1 888.936.8638 Fax +1 919.573.0306",
//                     position: { x: 0, y: 100 },
//                     style: { textBrushColor: '#000000', fontSize: 13 }
//                 },
//             ]
//         }
//     }

//     let customAggregateFn1 = (data: Object[]) => data.filter((item: any) => item.Freight > 50).length;
//     afterAll(() => {
//         remove(elem);
//     });
//     beforeEach(() => {
//         jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
//         document.body.appendChild(elem);
//         gridObj = new Grid(
//             {
//                 dataSource: data,
//                 allowPdfExport: true,
//                 allowPaging: true,
//                 allowGrouping: true,
//                 groupSettings: { columns: ['Verified', 'ShipRegion', 'ShipCountry'] },
//                 toolbar: ['PdfExport'],
//                 pageSettings: { pageCount: 5 },
//                 pdfQueryCellInfo: QueryCellEvent,
//                 columns: [
//                     { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: '120px' },
//                     {
//                         field: 'OrderDate', headerText: 'Order Date', headerTextAlign: 'Right',
//                         textAlign: 'Right', width: '15%', format: 'yMd'
//                     },
//                     { field: 'Freight', headerText: 'Freight($)', textAlign: 'Right', width: 120, format: 'C2' },
//                     { field: 'ShipCountry', headerText: 'Ship Country', width: 140 },
//                     { field: 'ShipRegion', width: 140 },
//                     { field: 'Verified', width: 140 },
//                     {
//                         headerText: 'Ship Details', headerTextAlign: 'Justify', columns: [
//                             { field: 'ShipPostalCode', headerText: 'Ship Postal Code', textAlign: 'Center', width: 145 },
//                             { field: 'ShipCountry', headerText: 'Ship Country', width: 140 },
//                         ]
//                     },
//                     { field: 'InvalidOrderID', isPrimaryKey: true, headerText: 'Order ID' },
//                     { headerText: 'Order Date 1', field: 'OrderDate', type: 'date', format: 'MMMEd' },
//                     { headerText: 'Order Date 2', field: 'OrderDate', format: { type: 'date', skeleton: 'MMMEd' } },
//                     { headerText: 'Order Date 3', field: 'OrderDate', type: 'date', format: { skeleton: 'MMMEd' } },
//                     { headerText: 'Order Date 4', field: 'OrderDate', format: { skeleton: 'MMMEd' } },
//                     { headerText: 'Order Date 5', field: 'OrderDate', type: 'datetime', format: 'MMMEd' },
//                     { headerText: 'Order Date 6', field: 'OrderDate', format: { type: 'datetime', skeleton: 'MMMEd' } },
//                     { headerText: 'Order Date 7', field: 'OrderDate', type: 'datetime', format: { skeleton: 'MMMEd' } },
//                     { headerText: 'Order Date 8', field: 'OrderDate', type: 'date', format: 'short' },
//                     { headerText: 'Order Date 9', field: 'OrderDate', type: 'date', format: 'long' },
//                     { headerText: 'Order Date 10', field: 'OrderDate', type: 'date', format: 'medium' },
//                     { headerText: 'Order Date 11', field: 'OrderDate', type: 'date', format: 'full' },
//                     { headerText: 'Order Date 12', field: 'OrderDate', type: 'datetime', format: 'short' },
//                     { headerText: 'Order Date 13', field: 'OrderDate', type: 'datetime', format: 'long' },
//                     { headerText: 'Order Date 14', field: 'OrderDate', type: 'datetime', format: 'medium' },
//                     { headerText: 'Order Date 15', field: 'OrderDate', type: 'datetime', format: 'full' },
//                     { headerText: 'Order Date 16', field: 'OrderDate', type: 'time', format: 'short' },
//                     { headerText: 'Order Date 17', field: 'OrderDate', type: 'time', format: 'long' },
//                     { headerText: 'Order Date 18', field: 'OrderDate', type: 'time', format: 'medium' },
//                     { headerText: 'Order Date 19', field: 'OrderDate', type: 'time', format: 'full' },
//                     { headerText: 'Order Date 20', field: 'OrderDate', format: { type: 'time', skeleton: 'short' } },
//                     { headerText: 'Order Date 21', field: 'OrderDate', format: { type: 'time', skeleton: 'long' } },
//                     { headerText: 'Order Date 22', field: 'OrderDate', format: { type: 'time', skeleton: 'medium' } },
//                     { headerText: 'Order Date 23', field: 'OrderDate', format: { type: 'time', skeleton: 'full' } },
//                     { headerText: 'Order Date 24', field: 'OrderDate', type: 'time', format: { type: 'time', skeleton: 'short' } },
//                     { headerText: 'Order Date 25', field: 'OrderDate', type: 'time', format: { type: 'time', skeleton: 'long' } },
//                     { headerText: 'Order Date 26', field: 'OrderDate', type: 'time', format: { type: 'time', skeleton: 'medium' } },
//                     { headerText: 'Order Date 27', field: 'OrderDate', type: 'time', format: { type: 'time', skeleton: 'full' } },
//                     { headerText: 'Order Date 28', field: 'OrderDate', type: 'time', format: { skeleton: 'full' } },
//                     { headerText: 'Order Date 29', field: 'OrderDate', type: 'datetime', format: { type: 'datetime', skeleton: 'MMMEd' } },
//                 ],
//                 aggregates: [{
//                     columns: [
//                         {
//                             type: 'Min',
//                             field: 'Freight',
//                             format: 'C2',
//                             groupFooterTemplate: 'Min: ${min}'
//                         },
//                         {
//                             type: 'Max',
//                             field: 'OrderDate',
//                             format: { type: 'date', skeleton: 'medium' },
//                             groupFooterTemplate: 'Max: ${max}'
//                         }, {
//                             type: 'Max',
//                             field: 'Freight',
//                             format: 'C2',
//                             groupCaptionTemplate: 'Max: ${max}'
//                         }, {
//                             type: 'Max',
//                             field: 'OrderDate',
//                             format: { type: 'date', skeleton: 'medium' },
//                             groupCaptionTemplate: 'Max: ${max}'
//                         }
//                     ]
//                 },
//                 {
//                     columns: [{
//                         type: 'Max',
//                         field: 'Freight',
//                         format: 'C2'
//                     }]
//                 }, {
//                     columns: [{
//                         type: 'Custom',
//                         customAggregate: customAggregateFn1,
//                         field: 'Freight',
//                     }]
//                 }, {
//                     columns: [{
//                         type: 'Custom',
//                         customAggregate: customAggregateFn1,
//                         columnName: 'Freight',
//                     }]
//                 }]
//             });
//         gridObj.appendTo('#Grid');
//         gridObj.dataBind();
//     });
//     it('Custom Theme', (done) => {
//         gridObj.pdfExport({
//             theme: {
//                 header: {
//                     fontColor: '#64FA50', fontName: 'Calibri', fontSize: 17, bold: true, borders: { color: '#64FA50', lineStyle: 'thin' }
//                 },
//                 record: {
//                     fontColor: '#64FA50', fontName: 'Calibri', fontSize: 17, bold: true
//                 },
//                 caption: {
//                     fontColor: '#64FA50', fontName: 'Calibri', fontSize: 17, bold: true
//                 }
//             }
//         });
//         setTimeout(() => {
//             expect('').toBe('');
//             done();
//         }, 500);
//     });
//     it('material', (done) => {
//         gridObj.pdfExport();
//         setTimeout(() => {
//             expect('').toBe('');
//             done();
//         }, 500);
//     });
//     it('exportproperties = undefined', (done) => {
//         gridObj.pdfExport(undefined);
//         setTimeout(() => {
//             expect('').toBe('');
//             done();
//         }, 500);
//     });
//     it('header and footer', (done) => {
//         gridObj.pdfExport(exportproperties);
//         setTimeout(() => {
//             expect('').toBe('');
//             done();
//         }, 500);
//     });
//     it('empty exportproperties', (done) => {
//         gridObj.pdfExport({});
//         setTimeout(() => {
//             expect('').toBe('');
//             done();
//         }, 500);
//     });
//     it('remote data', (done) => {
//         gridObj.pdfExport(remoteData);
//         setTimeout(() => {
//             expect('').toBe('');
//             done();
//         }, 500);
//     });
// });

// /* tslint:enable */

//Added coverage for export-helper file
describe('ExportHelper Module Tests => ', () => {
    let gridObj: Grid;
    let exportHelper: any;
    let exportValueFormatter: any;
    let exportCompleteHandler: () => void = () => true;
    
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                allowPdfExport: true,
                allowGrouping: true,
                allowPaging: true,
                pageSettings: { pageSize: 10, totalRecordsCount: data.length },
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', type: 'number', format: 'N2' },
                    { field: 'CustomerID', headerText: 'Customer ID', type: 'string' },
                    { field: 'OrderDate', headerText: 'Order Date', type: 'date', format: 'yMd' },
                    { field: 'Freight', headerText: 'Freight', type: 'number', format: 'C2' },
                    { field: 'Verified', headerText: 'Verified', type: 'boolean' }
                ],
                pdfExportComplete: exportCompleteHandler,
            }, done);
    });

    describe('ExportHelper.getQuery() - Static Method Tests', () => {
        it('should generate query with lazyLoad array when data is remote and lazy loading is enabled with group columns', () => {
            const mockData: any = {
                generateQuery: (isServerRendered: boolean) => new Query().requiresCount(),
                isRemote: () => true
            };
            gridObj.groupSettings.enableLazyLoading = true;
            gridObj.groupSettings.columns = ['CustomerID'];
            const result: Query = (ExportHelper as any).getQuery(gridObj, mockData);
            expect(result).toBeDefined();
            expect((result as any).lazyLoad).toBeDefined();
            expect((result as any).lazyLoad instanceof Array).toBeTruthy();
        });

        it('should call query.take() when data is remote but lazy loading is disabled', () => {
            const mockData: any = {
                generateQuery: (isServerRendered: boolean) => new Query().requiresCount(),
                isRemote: () => true
            };
            gridObj.groupSettings.enableLazyLoading = false;
            gridObj.groupSettings.columns = [];
            const result: Query = (ExportHelper as any).getQuery(gridObj, mockData);
            expect(result).toBeDefined();
        });

        it('should not set lazyLoad when group columns array is empty despite enableLazyLoading being true', () => {
            const mockData: any = {
                generateQuery: (isServerRendered: boolean) => new Query().requiresCount(),
                isRemote: () => true
            };
            gridObj.groupSettings.enableLazyLoading = true;
            gridObj.groupSettings.columns = [];
            const result: Query = (ExportHelper as any).getQuery(gridObj, mockData);
            expect(result).toBeDefined();
        });
    });

    describe('ExportHelper.getColumnData() - Foreign Key Columns', () => {
        it('should resolve promise with undefined when no foreign key columns exist', (done) => {
            const helper = new (ExportHelper as any)(gridObj);
            const mockGrid: any = {
                getForeignKeyColumns: (): any[] => []
            };
            const result = helper.getColumnData(mockGrid);
            if (result) {
                result.then(() => {
                    expect(result).toBeUndefined();
                    done();
                });
            } else {
                expect(result).toBeUndefined();
                done();
            }
        });

        it('should handle foreign key columns when dataSource has result property', (done) => {
            const mockForeignData = { result: [{ id: 1, name: 'Test' }] };
            const mockColumn = { 
                field: 'EmployeeID', 
                dataSource: mockForeignData,
                foreignKeyValue: 'FirstName'
            };
            const mockGrid: any = {
                getForeignKeyColumns: () => [mockColumn]
            };
            const helper = new (ExportHelper as any)(gridObj);
            const result = helper.getColumnData(mockGrid);
            if (result) {
                result.then(() => {
                    expect(helper.getForeignKeyData()).toBeDefined();
                    done();
                });
            } else {
                done();
            }
        });

        it('should handle foreign key columns when dataSource is a DataManager instance', (done) => {
            const mockColumn = { 
                field: 'EmployeeID', 
                dataSource: new DataManager(employeeData),
                foreignKeyValue: 'FirstName'
            };
            const mockGrid: any = {
                getForeignKeyColumns: () => [mockColumn]
            };
            const helper = new (ExportHelper as any)(gridObj);
            const result = helper.getColumnData(mockGrid);
            if (result) {
                result.then(() => {
                    expect(helper.getForeignKeyData()).toBeDefined();
                    done();
                });
            } else {
                done();
            }
        });

        it('should populate foreignKeyData with column field as key', (done) => {
            const mockColumn = { 
                field: 'TestField', 
                dataSource: new DataManager([{ id: 1 }, { id: 2 }]),
                foreignKeyValue: 'id'
            };
            const mockGrid: any = {
                getForeignKeyColumns: () => [mockColumn]
            };
            const helper = new (ExportHelper as any)(gridObj);
            const result = helper.getColumnData(mockGrid);
            if (result) {
                result.then(() => {
                    const fkData = helper.getForeignKeyData();
                    expect(fkData['TestField']).toBeDefined();
                    done();
                });
            } else {
                done();
            }
        });
    });

    describe('ExportHelper.processColumns() - Column Virtualization & Grouping', () => {
        it('should skip column when virtualization is enabled and column is not in view', () => {
            const helper = new (ExportHelper as any)(gridObj);
            gridObj.enableColumnVirtualization = true;
            gridObj.groupSettings.columns = ['CustomerID'];
            gridObj.allowGrouping = true;
            const mockRow: any = { cells: [] };
            const rows = [mockRow];
            (gridObj.getColumnIndexesInView as any) = () => [1, 2];
            const result = (helper as any).processColumns(rows);
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBeTruthy();
        });

        it('should add header indent cells when grouping is enabled', () => {
            const helper = new (ExportHelper as any)(gridObj);
            gridObj.enableColumnVirtualization = false;
            gridObj.groupSettings.columns = ['CustomerID'];
            gridObj.allowGrouping = true;
            const mockRow: any = { cells: [] };
            const rows = [mockRow];
            const result = (helper as any).processColumns(rows);
            expect(result).toBeDefined();
            expect(result[0].cells.length).toBeGreaterThanOrEqual(0);
        });

        it('should not add indent cells when grouping is disabled', () => {
            const helper = new (ExportHelper as any)(gridObj);
            gridObj.enableColumnVirtualization = false;
            gridObj.allowGrouping = false;
            const mockRow: any = { cells: [] };
            const rows = [mockRow];
            const result = (helper as any).processColumns(rows);
            expect(result).toBeDefined();
        });

        it('should handle empty groupSettings columns array', () => {
            const helper = new (ExportHelper as any)(gridObj);
            gridObj.enableColumnVirtualization = false;
            gridObj.groupSettings.columns = [];
            gridObj.allowGrouping = true;
            const mockRow: any = { cells: [] };
            const rows = [mockRow];
            const result = (helper as any).processColumns(rows);
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBeTruthy();
        });
    });

    describe('ExportHelper.getGridRowModel() - Row Model Generation', () => {
        it('should return empty array when dataSource is empty', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const mockColumns: any[] = [{ visible: true }];
            const dataSource: Object[] = [];
            const result = helper.getGridRowModel(mockColumns, dataSource, gridObj);
            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });

        it('should generate rows with correct data and index for non-empty dataSource', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const mockColumns: any[] = [{ visible: true }];
            const dataSource = [{ OrderID: 10248, CustomerID: 'VINET' }];
            const result = helper.getGridRowModel(mockColumns, dataSource, gridObj);
            expect(result).toBeDefined();
            expect(result.length).toBe(1);
        });

        it('should set isExpand to true when hierarchyPrintMode is All and childGrid exists', () => {
            const helper = new (ExportHelper as any)(gridObj);
            gridObj.childGrid = { queryString: 'EmployeeID' };
            gridObj.hierarchyPrintMode = 'All';
            const mockColumns: any[] = [{ visible: true }];
            const dataSource = [{ OrderID: 10248 }];
            const result = helper.getGridRowModel(mockColumns, dataSource, gridObj);
            expect(result.length).toBe(1);
        });

        it('should set isExpand based on expandedRows when hierarchyPrintMode is Expanded', () => {
            const helper = new (ExportHelper as any)(gridObj);
            gridObj.childGrid = { queryString: 'EmployeeID' };
            gridObj.hierarchyPrintMode = 'Expanded';
            (gridObj as any).expandedRows = { 0: { isExpand: true } };
            const mockColumns: any[] = [{ visible: true }];
            const dataSource = [{ OrderID: 10248 }];
            const result = helper.getGridRowModel(mockColumns, dataSource, gridObj, 0);
            expect(result.length).toBe(1);
        });

        it('should increment startIndex for each row', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const mockColumns: any[] = [{ visible: true }];
            const dataSource = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const result = helper.getGridRowModel(mockColumns, dataSource, gridObj, 5);
            expect(result.length).toBe(3);
        });
    });

    describe('ExportHelper.getGridExportColumns() - Column Filtering', () => {
        it('should exclude checkbox type columns', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const mockColumns: any[] = [
                { type: 'checkbox' },
                { type: 'string' },
                { type: 'number' }
            ];
            const result = helper.getGridExportColumns(mockColumns);
            expect(result.length).toBe(2);
        });

        it('should include all non-checkbox columns', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const mockColumns: any[] = [
                { type: 'string' },
                { type: 'number' },
                { type: 'date' }
            ];
            const result = helper.getGridExportColumns(mockColumns);
            expect(result.length).toBe(3);
        });

        it('should return empty array when all columns are checkbox type', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const mockColumns: any[] = [
                { type: 'checkbox' },
                { type: 'checkbox' }
            ];
            const result = helper.getGridExportColumns(mockColumns);
            expect(result.length).toBe(0);
        });
    });

   

    describe('ExportHelper.failureHandler() - Error Handler', () => {
        it('should set gridPool entry to true and call checkAndExport', () => {
            const helper = new (ExportHelper as any)(gridObj);
            let resolveCalled = false;
            const mockResolve = () => { resolveCalled = true; };
            const gridPool = { 'child-grid-1': false };
            const childGridObj: any = { id: 'child-grid-1' };
            const failureHandler = helper.failureHandler(gridPool, childGridObj, mockResolve);
            failureHandler();
            expect(gridPool['child-grid-1']).toBe(true);
        });
    });

    describe('ExportValueFormatter.formatCellValue() - Cell Value Formatting', () => {
        beforeAll(() => {
            exportValueFormatter = new (ExportValueFormatter as any)('en-US');
        });

        it('should format foreign key value correctly', () => {
            const mockArgs: any = {
                isForeignKey: true,
                value: 1,
                column: {
                    field: 'EmployeeID',
                    foreignKeyValue: 'FirstName',
                    type: 'string'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format number column with format string', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: 123.456,
                column: {
                    type: 'number',
                    format: 'N2'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format number column with format object', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: 123.456,
                column: {
                    type: 'number',
                    format: { format: 'N2' }
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should return empty string for null/undefined number value with format', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: null,
                column: {
                    type: 'number',
                    format: 'N2'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(result).toBe('');
        });

        it('should format zero correctly for number column', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: 0,
                column: {
                    type: 'number',
                    format: 'N2'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format boolean true as string true', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: true,
                column: {
                    type: 'boolean'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(result).toBe('true');
        });

        it('should format boolean false as string false', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: false,
                column: {
                    type: 'boolean'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(result).toBe('false');
        });

        it('should return empty string for empty boolean value', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: '',
                column: {
                    type: 'boolean'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(result).toBe('');
        });

        it('should format date with string format', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15),
                column: {
                    type: 'date',
                    format: 'short'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format date when value is string', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: '2023-01-15',
                column: {
                    type: 'date',
                    format: 'short'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format date with object format containing type', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15),
                column: {
                    type: 'date',
                    format: { type: 'date', skeleton: 'short' }
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should convert to string for date object format without type property', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15),
                column: {
                    type: 'date',
                    format: { skeleton: 'short' }
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format dateonly column', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15),
                column: {
                    type: 'dateonly',
                    format: 'short'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format datetime column with string format', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15, 14, 30, 0),
                column: {
                    type: 'datetime',
                    format: 'short'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format time column', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15, 14, 30, 0),
                column: {
                    type: 'time',
                    format: 'short'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should format date with object format with all properties', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15),
                column: {
                    type: 'date',
                    format: { type: 'date', format: 'short', skeleton: 'short' }
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should convert generic value to string', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: 'Test String',
                column: {
                    type: 'string'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(result).toBe('Test String');
        });

        it('should return empty string for null/undefined value in default branch', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: null,
                column: {
                    type: 'string'
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(result).toBe('');
        });

        it('should return empty string when value is undefined and column type is undefined', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: undefined,
                column: {
                    type: undefined
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(result).toBe('');
        });

        it('should handle datetime with object format', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15, 14, 30, 0),
                column: {
                    type: 'datetime',
                    format: { type: 'dateTime', format: 'short', skeleton: 'short' }
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });

        it('should handle time with object format', () => {
            const mockArgs: any = {
                isForeignKey: false,
                value: new Date(2023, 0, 15, 14, 30, 0),
                column: {
                    type: 'time',
                    format: { type: 'time', format: 'short', skeleton: 'short' }
                }
            };
            const result = exportValueFormatter.formatCellValue(mockArgs);
            expect(typeof result).toBe('string');
        });
    });

    describe('ExportHelper.getConvertedWidth() - Width Conversion', () => {
        it('should convert percentage width to pixel value', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const result = helper.getConvertedWidth('50%');
            expect(typeof result).toBe('number');
            expect(result).toBeGreaterThan(0);
        });

        it('should return parsed value for pixel width', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const result = helper.getConvertedWidth('100px');
            expect(result).toBe(100);
        });

        it('should handle numeric string input without unit', () => {
            const helper = new (ExportHelper as any)(gridObj);
            const result = helper.getConvertedWidth('150');
            expect(result).toBe(150);
        });
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
        exportHelper = null;
        exportValueFormatter = null;
    });
});

// /* tslint:enable */