import { IDataSet } from '../../src/base/engine';
import { pivot_smalldata } from '../base/datasource.spec';
import { profile, inMB, getMemoryProfile } from '../common.spec';
import { PivotView } from '../../src/pivotview/base/pivotview';
import { createElement, EmitType, remove } from '@syncfusion/ej2-base';
import { GroupingBar } from '../../src/common/grouping-bar/grouping-bar';
import * as util from '../utils.spec';
import { PivotChart } from '../../src/pivotchart/index';
import { FieldList } from '../../src/common/actions/field-list';
import { IResizeEventArgs, Chart } from '@syncfusion/ej2-charts';
import { Toolbar } from '../../src/common/popups/toolbar';
import { Grouping } from '../../src/common/popups/grouping';
import { VirtualScroll } from '../../src/pivotview/actions';
import { PDFExport } from '../../src/pivotview/actions/pdf-export';
import { ExcelExport } from '../../src/pivotview/actions/excel-export';

describe('Classic layout spec', () => {
    let pivotDatas: IDataSet[] = [
        {
            _id: "5a940692c2d185d9fde50e5e",
            index: 0,
            guid: "810a1191-81bd-4c18-ac73-d16ad3fc80eb",
            isActive: "false",
            balance: 2430.87,
            advance: 7658,
            quantity: 11,
            age: 21,
            eyeColor: "blue",
            name: "Skinner Ward",
            gender: "male",
            company: "GROK",
            email: "skinnerward@grok.com",
            phone: "+1 (931) 600-3042",
            date: "Wed Feb 16 2000 15:01:01 GMT+053s0 (India Standard Time)",
            product: "Flight",
            state: "New Jercy",
            pno: "FEDD2340",
        },
        {
            _id: "5a940692c5752f1ed81bbb3d",
            index: 1,
            guid: "41c9986b-ccef-459e-a22d-5458bbdca9c7",
            isActive: "true",
            balance: 3192.7,
            advance: 6124,
            quantity: 15,

            age: 27,
            eyeColor: "brown",
            name: "Gwen Dixon",
            gender: "female",
            company: "ICOLOGY",
            email: "gwendixon@icology.com",
            phone: "+1 (951) 589-2187",
            date: "Sun Feb 10 1991 20:28:59 GMT+0530 (India Standard Time)",
            product: "Jet",
            state: "Vetaikan",
            pno: "ERTS4512",
        },
        {
            _id: "5a9406924c0e7f4c98a82ca7",
            index: 2,
            guid: "50d2bf16-9092-4202-84f6-e892721fe5a5",
            isActive: "true",
            balance: 1663.84,
            advance: 7631,
            quantity: 14,

            age: 28,
            eyeColor: "green",
            name: "Deena Gillespie",
            gender: "female",
            company: "OVERPLEX",
            email: "deenagillespie@overplex.com",
            phone: "+1 (826) 588-3430",
            date: "Thu Mar 18 1993 17:07:48 GMT+0530 (India Standard Time)",
            product: "Car",
            state: "New Jercy",
            pno: "ERTS4512",
        },
        {
            _id: "5a940692dd9db638eee09828",
            index: 3,
            guid: "b8bdc65e-4338-440f-a731-810186ce0b3a",
            isActive: "true",
            balance: 1601.82,
            advance: 6519,
            quantity: 18,

            age: 33,
            eyeColor: "green",
            name: "Susanne Peterson",
            gender: "female",
            company: "KROG",
            email: "susannepeterson@krog.com",
            phone: "+1 (868) 499-3292",
            date: "Sat Feb 09 2002 04:28:45 GMT+0530 (India Standard Time)",
            product: "Jet",
            state: "Vetaikan",
            pno: "CCOP1239",
        },
        {
            _id: "5a9406926f9971a87eae51af",
            index: 4,
            guid: "3f4c79ec-a227-4210-940f-162ca0c293de",
            isActive: "false",
            balance: 1855.77,
            advance: 7333,
            quantity: 20,

            age: 33,
            eyeColor: "green",
            name: "Stokes Hicks",
            gender: "male",
            company: "SIGNITY",
            email: "stokeshicks@signity.com",
            phone: "+1 (927) 585-2980",
            date: "Fri Mar 12 2004 11:08:06 GMT+0530 (India Standard Time)",
            product: "Van",
            state: "Tamilnadu",
            pno: "MEWD9812",
        },
        {
            _id: "5a940692bcbbcdde08fcf7ec",
            index: 5,
            guid: "1d0ee387-14d4-403e-9a0c-3a8514a64281",
            isActive: "true",
            balance: 1372.23,
            advance: 5668,
            quantity: 16,

            age: 39,
            eyeColor: "green",
            name: "Sandoval Nicholson",
            gender: "male",
            company: "IDEALIS",
            email: "sandovalnicholson@idealis.com",
            phone: "+1 (951) 438-3539",
            date: "Sat Aug 30 1975 22:02:15 GMT+0530 (India Standard Time)",
            product: "Bike",
            state: "Tamilnadu",
            pno: "CCOP1239",
        },
        {
            _id: "5a940692ff31a6e1cdd10487",
            index: 6,
            guid: "58417d45-f279-4e21-ba61-16943d0f11c1",
            isActive: "false",
            balance: 2008.28,
            advance: 7107,
            quantity: 14,

            age: 20,
            eyeColor: "brown",
            name: "Blake Thornton",
            gender: "male",
            company: "IMMUNICS",
            email: "blakethornton@immunics.com",
            phone: "+1 (852) 462-3571",
            date: "Mon Oct 03 2005 05:16:53 GMT+0530 (India Standard Time)",
            product: "Tempo",
            state: "New Jercy",
            pno: "CCOP1239",
        },
        {
            _id: "5a9406928f2f2598c7ac7809",
            index: 7,
            guid: "d16299e3-e243-4e57-90fb-52446c4c0275",
            isActive: "false",
            balance: 2052.58,
            advance: 7431,
            quantity: 20,

            age: 22,
            eyeColor: "blue",
            name: "Dillard Sharpe",
            gender: "male",
            company: "INEAR",
            email: "dillardsharpe@inear.com",
            phone: "+1 (963) 473-2308",
            date: "Thu May 25 1978 04:57:00 GMT+0530 (India Standard Time)",
            product: "Tempo",
            state: "Rajkot",
            pno: "ERTS4512",
        },
    ];
    describe('Default sample with classic layout with expandAll false', () => {
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotGrid', styles: 'height:200px; width:1000px' });
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            if (!document.getElementById(elem.id)) {
                document.body.appendChild(elem);
            }
            let dataBound: EmitType<Object> = () => { done(); };
            pivotGridObj = new PivotView({
                dataSourceSettings: {
                    dataSource: pivotDatas as IDataSet[],
                    valueSortSettings: { "headerDelimiter": "##", "sortOrder": "Ascending" },
                    sortSettings: [{ name: 'company', order: 'Descending' }, { name: 'product', order: 'Descending', membersOrder: ['Jet', 'Flight', 'Van'] }],
                    rows: [{ name: 'state' }, { name: 'age' }],
                    formatSettings: [{ name: 'balance', format: 'C' }, { name: 'date', format: 'dd/MM/yyyy', type: 'date' }],
                    columns: [{ name: 'gender' }, { name: 'advance' }],
                    values: [{ name: 'balance' }, { name: 'quantity' }],
                    expandAll: false,
                    enableSorting: true,
                    allowValueFilter: true,
                    allowLabelFilter: true,
                    filterSettings: [
                        { name: 'date', type: 'Date', condition: 'Between', value1: new Date('02/16/2000'), value2: new Date('02/16/2002') },
                    ],
                    fieldMapping: [{ name: 'product', dataType: 'string' },
                    { name: 'company', caption: 'Company' },
                    { name: 'pno', caption: 'Phone No' },
                    { name: 'email', caption: 'Email' },
                    { name: 'age', caption: 'Age' },
                    { name: 'guid', caption: 'Guid' }],
                },
                height: 800,
                width: 800,
                gridSettings: {
                    layout: 'Tabular',
                },
                dataBound: dataBound
            });
            pivotGridObj.appendTo('#PivotGrid');
        });
        it('values testing', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[3][2] as IDataSet).formattedText).toBe("14");
                done();
            }, 200);
        });
        it('Expand first member in row', (done: Function) => {
            setTimeout(() => {
                (document.querySelectorAll('.e-expand')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand first member in row', (done: Function) => {
            setTimeout(() => {
                expect(1).toBe(1);
                done();
            }, 200);
        });
        it('Expand second member in row', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 11).toBeTruthy();
                (document.querySelectorAll('.e-expand')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand first member in column', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 12).toBeTruthy();
                (document.querySelectorAll('.e-expand')[0] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Check the pivot values of pivot table', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[6][6] as IDataSet).formattedText).toBe('$1,663.84');
                done();
            }, 200);
        });
    });

    describe('Default sample with classic layout with expandAll true', () => {
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotGrid', styles: 'height:200px; width:1000px' });
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            if (!document.getElementById(elem.id)) {
                document.body.appendChild(elem);
            }
            let dataBound: EmitType<Object> = () => { done(); };
            pivotGridObj = new PivotView({
                dataSourceSettings: {
                    dataSource: pivotDatas as IDataSet[],
                    valueSortSettings: { "headerDelimiter": "##", "sortOrder": "Ascending" },
                    sortSettings: [{ name: 'company', order: 'Descending' }, { name: 'product', order: 'Descending', membersOrder: ['Jet', 'Flight', 'Van'] }],
                    rows: [{ name: 'state' }, { name: 'age' }],
                    formatSettings: [{ name: 'balance', format: 'C' }, { name: 'date', format: 'dd/MM/yyyy', type: 'date' }],
                    columns: [{ name: 'gender' }, { name: 'advance' }],
                    values: [{ name: 'balance' }, { name: 'quantity' }],
                    expandAll: true,
                    enableSorting: true,
                    allowValueFilter: true,
                    allowLabelFilter: true,
                    filterSettings: [
                        { name: 'date', type: 'Date', condition: 'Between', value1: new Date('02/16/2000'), value2: new Date('02/16/2002') },
                    ],
                    fieldMapping: [{ name: 'product', dataType: 'string' },
                    { name: 'company', caption: 'Company' },
                    { name: 'pno', caption: 'Phone No' },
                    { name: 'email', caption: 'Email' },
                    { name: 'age', caption: 'Age' },
                    { name: 'guid', caption: 'Guid' }],
                },
                height: 800,
                width: 800,
                gridSettings: {
                    layout: 'Tabular',
                },
                dataBound: dataBound
            });
            pivotGridObj.appendTo('#PivotGrid');
        });
        it('values testing', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[6][7] as IDataSet).formattedText).toBe("14");
                done();
            }, 1000);
        });
        it('Expand first member in row', (done: Function) => {
            setTimeout(() => {
                (document.querySelectorAll('.e-collapse')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand second member in row', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 13).toBeTruthy();
                (document.querySelectorAll('.e-collapse')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand first member in column', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 12).toBeTruthy();
                (document.querySelectorAll('.e-collapse')[0] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Check the pivot values of pivot table', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[3][3] as IDataSet).formattedText).toBe('14');
                done();
            }, 200);
        });
    });
    describe('Value Axis with classic layout with Value Axis in row', () => {
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotGrid', styles: 'height:200px; width:1000px' });
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            if (!document.getElementById(elem.id)) {
                document.body.appendChild(elem);
            }
            let dataBound: EmitType<Object> = () => { done(); };
            pivotGridObj = new PivotView({
                dataSourceSettings: {
                    dataSource: pivotDatas as IDataSet[],
                    valueSortSettings: { "headerDelimiter": "##", "sortOrder": "Ascending" },
                    sortSettings: [{ name: 'company', order: 'Descending' }, { name: 'product', order: 'Descending', membersOrder: ['Jet', 'Flight', 'Van'] }],
                    rows: [{ name: 'state' }, { name: 'age' }],
                    formatSettings: [{ name: 'balance', format: 'C' }, { name: 'date', format: 'dd/MM/yyyy', type: 'date' }],
                    columns: [{ name: 'gender' }, { name: 'advance' }],
                    values: [{ name: 'balance' }, { name: 'quantity' }],
                    expandAll: true,
                    enableSorting: true,
                    allowValueFilter: true,
                    allowLabelFilter: true,
                    filterSettings: [
                        { name: 'date', type: 'Date', condition: 'Between', value1: new Date('02/16/2000'), value2: new Date('02/16/2002') },
                    ],
                    fieldMapping: [{ name: 'product', dataType: 'string' },
                    { name: 'company', caption: 'Company' },
                    { name: 'pno', caption: 'Phone No' },
                    { name: 'email', caption: 'Email' },
                    { name: 'age', caption: 'Age' },
                    { name: 'guid', caption: 'Guid' }],
                    valueAxis: 'row'
                },
                height: 800,
                width: 800,
                gridSettings: {
                    layout: 'Tabular',
                },
                dataBound: dataBound
            });
            pivotGridObj.appendTo('#PivotGrid');
        });
        it('values testing', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[7][6] as IDataSet).formattedText).toBe("14");
                done();
            }, 1000);
        });
        it('Expand first member in row', (done: Function) => {
            setTimeout(() => {
                (document.querySelectorAll('.e-collapse')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand second member in row', (done: Function) => {
            setTimeout(() => {
                debugger
                expect(pivotGridObj.engineModule.pivotValues.length === 22).toBeTruthy();
                (document.querySelectorAll('.e-collapse')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand first member in column', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 20).toBeTruthy();
                (document.querySelectorAll('.e-collapse')[0] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Check the pivot values of pivot table', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[3][5] as IDataSet).formattedText).toBe('14');
                done();
            }, 200);
        });
    });
    describe('Value Axis with classic layout with expandAll false', () => {
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotGrid', styles: 'height:200px; width:1000px' });
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            if (!document.getElementById(elem.id)) {
                document.body.appendChild(elem);
            }
            let dataBound: EmitType<Object> = () => { done(); };
            pivotGridObj = new PivotView({
                dataSourceSettings: {
                    dataSource: pivotDatas as IDataSet[],
                    valueSortSettings: { "headerDelimiter": "##", "sortOrder": "Ascending" },
                    sortSettings: [{ name: 'company', order: 'Descending' }, { name: 'product', order: 'Descending', membersOrder: ['Jet', 'Flight', 'Van'] }],
                    rows: [{ name: 'state' }, { name: 'age' }],
                    formatSettings: [{ name: 'balance', format: 'C' }, { name: 'date', format: 'dd/MM/yyyy', type: 'date' }],
                    columns: [{ name: 'gender' }, { name: 'advance' }],
                    values: [{ name: 'balance' }, { name: 'quantity' }],
                    expandAll: false,
                    enableSorting: true,
                    allowValueFilter: true,
                    allowLabelFilter: true,
                    filterSettings: [
                        { name: 'date', type: 'Date', condition: 'Between', value1: new Date('02/16/2000'), value2: new Date('02/16/2002') },
                    ],
                    fieldMapping: [{ name: 'product', dataType: 'string' },
                    { name: 'company', caption: 'Company' },
                    { name: 'pno', caption: 'Phone No' },
                    { name: 'email', caption: 'Email' },
                    { name: 'age', caption: 'Age' },
                    { name: 'guid', caption: 'Guid' }],
                    valueAxis: 'row'
                },
                height: 500,
                width: 1000,
                gridSettings: {
                    layout: 'Tabular',
                },
                dataBound: dataBound
            });
            pivotGridObj.appendTo('#PivotGrid');
        });
        it('values testing', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[2][2] as IDataSet).formattedText).toBe("14");
                done();
            }, 200);
        });
        it('Expand first member in row', (done: Function) => {
            setTimeout(() => {
                (document.querySelectorAll('.e-expand')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand second member in row', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 17).toBeTruthy();
                (document.querySelectorAll('.e-expand')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand first member in column', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 19).toBeTruthy();
                (document.querySelectorAll('.e-expand')[0] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Check the pivot values of pivot table', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[6][6] as IDataSet).formattedText).toBe('$1,663.84');
                done();
            }, 200);
        });
    });
    describe('Grouping bar sample with classic layout with expandAll false', () => {
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotGrid', styles: 'height:200px; width:1000px' });
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            if (!document.getElementById(elem.id)) {
                document.body.appendChild(elem);
            }
            let dataBound: EmitType<Object> = () => { done(); };
            PivotView.Inject(GroupingBar);
            pivotGridObj = new PivotView({
                dataSourceSettings: {
                    dataSource: pivotDatas as IDataSet[],
                    valueSortSettings: { "headerDelimiter": "##", "sortOrder": "Ascending" },
                    sortSettings: [{ name: 'company', order: 'Descending' }, { name: 'product', order: 'Descending', membersOrder: ['Jet', 'Flight', 'Van'] }],
                    rows: [{ name: 'state' }, { name: 'age' }],
                    formatSettings: [{ name: 'balance', format: 'C' }, { name: 'date', format: 'dd/MM/yyyy', type: 'date' }],
                    columns: [{ name: 'gender' }, { name: 'advance' }],
                    values: [{ name: 'balance' }, { name: 'quantity' }],
                    expandAll: false,
                    enableSorting: true,
                    allowValueFilter: true,
                    allowLabelFilter: true,
                    filterSettings: [
                        { name: 'date', type: 'Date', condition: 'Between', value1: new Date('02/16/2000'), value2: new Date('02/16/2002') },
                    ],
                    fieldMapping: [{ name: 'product', dataType: 'string' },
                    { name: 'company', caption: 'Company' },
                    { name: 'pno', caption: 'Phone No' },
                    { name: 'email', caption: 'Email' },
                    { name: 'age', caption: 'Age' },
                    { name: 'guid', caption: 'Guid' }],
                },
                height: 800,
                width: 800,
                showGroupingBar: true,
                gridSettings: {
                    layout: 'Tabular',
                },
                dataBound: dataBound
            });
            pivotGridObj.appendTo('#PivotGrid');
        });
        it('values testing', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[3][2] as IDataSet).formattedText).toBe("14");
                done();
            }, 1000);
        });
        it('Expand first member in row', (done: Function) => {
            setTimeout(() => {
                (document.querySelectorAll('.e-expand')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand second member in row', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 11).toBeTruthy();
                (document.querySelectorAll('.e-expand')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand first member in column', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 12).toBeTruthy();
                (document.querySelectorAll('.e-expand')[0] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Check the pivot values of pivot table', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[6][6] as IDataSet).formattedText).toBe('$1,663.84');
                done();
            }, 200);
        });
    });
    describe('Grouping bar sample with classic layout with expandAll true', () => {
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotGrid', styles: 'height:200px; width:1000px' });
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            if (!document.getElementById(elem.id)) {
                document.body.appendChild(elem);
            }
            let dataBound: EmitType<Object> = () => { done(); };
            PivotView.Inject(GroupingBar);
            pivotGridObj = new PivotView({
                dataSourceSettings: {
                    dataSource: pivotDatas as IDataSet[],
                    valueSortSettings: { "headerDelimiter": "##", "sortOrder": "Ascending" },
                    sortSettings: [{ name: 'company', order: 'Descending' }, { name: 'product', order: 'Descending', membersOrder: ['Jet', 'Flight', 'Van'] }],
                    rows: [{ name: 'state' }, { name: 'age' }],
                    formatSettings: [{ name: 'balance', format: 'C' }, { name: 'date', format: 'dd/MM/yyyy', type: 'date' }],
                    columns: [{ name: 'gender' }, { name: 'advance' }],
                    values: [{ name: 'balance' }, { name: 'quantity' }],
                    expandAll: true,
                    enableSorting: true,
                    allowValueFilter: true,
                    allowLabelFilter: true,
                    filterSettings: [
                        { name: 'date', type: 'Date', condition: 'Between', value1: new Date('02/16/2000'), value2: new Date('02/16/2002') },
                    ],
                    fieldMapping: [{ name: 'product', dataType: 'string' },
                    { name: 'company', caption: 'Company' },
                    { name: 'pno', caption: 'Phone No' },
                    { name: 'email', caption: 'Email' },
                    { name: 'age', caption: 'Age' },
                    { name: 'guid', caption: 'Guid' }],
                },
                height: 800,
                width: 800,
                gridSettings: {
                    layout: 'Tabular',
                },
                showGroupingBar: true,
                dataBound: dataBound
            });
            pivotGridObj.appendTo('#PivotGrid');
        });
        it('values testing', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[6][7] as IDataSet).formattedText).toBe("14");
                done();
            }, 1000);
        });
        it('Expand first member in row', (done: Function) => {
            setTimeout(() => {
                (document.querySelectorAll('.e-collapse')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand first member in row', (done: Function) => {
            setTimeout(() => {
                expect(1).toBe(1);
                done();
            }, 200);
        });
        it('Expand second member in row', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 13).toBeTruthy();
                (document.querySelectorAll('.e-collapse')[2] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Expand first member in column', (done: Function) => {
            setTimeout(() => {
                expect(pivotGridObj.engineModule.pivotValues.length === 12).toBeTruthy();
                (document.querySelectorAll('.e-collapse')[0] as HTMLElement).click();
                done();
            }, 200);
        });
        it('Check the pivot values of pivot table', (done: Function) => {
            setTimeout(() => {
                expect((pivotGridObj.engineModule.pivotValues[3][3] as IDataSet).formattedText).toBe('14');
                done();
            }, 200);
        });
    });
    describe(' - VirtualScrolling1', () => {
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotGrid' });
        beforeAll((done: Function) => {
            document.body.appendChild(elem);
            let dataBound: EmitType<Object> = () => { done(); };
            pivotGridObj = new PivotView(
                {
                    dataSourceSettings: {
                        dataSource: pivotDatas as IDataSet[],
                        expandAll: true,
                        enableSorting: false,
                        sortSettings: [{ name: 'company', order: 'Descending' }],
                        formatSettings: [{ name: 'balance', format: 'C' }],
                        rows: [{ name: 'product' }, { name: 'state' }],
                        columns: [{ name: 'gender' }, { name: 'eyeColor' }],
                        values: [{ name: 'balance' }, { name: 'quantity' }],
                        filters: [],
                    },
                    allowCalculatedField: true,
                    enableVirtualization: true,
                    dataBound: dataBound,
                    gridSettings: {
                        layout: 'Tabular',
                    },
                    width: 600,
                    height: 300,
                    virtualScrollSettings: { allowSinglePage: false }
                });
            pivotGridObj.appendTo('#PivotGrid');
        });
        it('scroll top1', (done: Function) => {
            setTimeout(() => {
                done();
            }, 1000);
        });
        it('scroll top2', () => {
            expect(1).toBe(1);
        });
        it('scroll top3', () => {
            document.querySelectorAll('.e-content-virtualtable')[0].scrollTop = 317;
            pivotGridObj.virtualscrollModule.direction = 'vertical';
            let args: MouseEvent = new MouseEvent("touchstart", { clientY: 317, view: window, bubbles: true, cancelable: true });
            document.querySelectorAll('.e-content-virtualtable')[0].dispatchEvent(args);
            args = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            document.querySelectorAll('.e-content-virtualtable')[0].dispatchEvent(args);
            expect(Math.round(document.querySelectorAll('.e-content-virtualtable')[0].scrollTop) === 0).toBeTruthy();
            expect(document.querySelectorAll('.e-content-virtualtable td')[0].querySelector('td .e-cellvalue').textContent).toBe('Flight');
            expect(document.querySelectorAll('.e-content-virtualtable td')[1].querySelector('td .e-cellvalue').textContent).toBe('New Jercy');
        });

        it('scroll right', () => {
            document.querySelectorAll('.e-headercontent')[0].scrollLeft = 1360;
            pivotGridObj.virtualscrollModule.direction = 'horizondal';
            let args: MouseEvent = new MouseEvent("touchstart", { clientX: 1360, view: window, bubbles: true, cancelable: true });
            document.querySelector('.e-headercontent').dispatchEvent(args);
            args = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            document.querySelector('.e-headercontent').dispatchEvent(args);
            expect(document.querySelectorAll('.e-content-virtualtable td')[0].querySelector('td .e-cellvalue').textContent).toBe('Flight');
            expect(document.querySelectorAll('.e-content-virtualtable td')[1].querySelector('td .e-cellvalue').textContent).toBe('New Jercy');
        });

        it('scroll right false', () => {
            document.querySelectorAll('.e-headercontent')[0].scrollLeft = 1360;
            pivotGridObj.virtualscrollModule.direction = 'horizondal';
            let args: MouseEvent = new MouseEvent("touchstart", { clientX: 0, view: window, bubbles: true, cancelable: true });
            document.querySelector('.e-headercontent').dispatchEvent(args);
            args = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            document.querySelector('.e-headercontent').dispatchEvent(args);
            expect(document.querySelectorAll('.e-content-virtualtable td')[0].querySelector('td .e-cellvalue').textContent).toBe('Flight');
            expect(document.querySelectorAll('.e-content-virtualtable tr')[0].querySelector('td:not(.e-freezeleftborder) .e-cellvalue').textContent).toBe('$2,430.87');
        });

        it('scroll top wheel', () => {
            document.querySelectorAll('.e-content-virtualtable')[0].scrollTop = 0;
            pivotGridObj.virtualscrollModule.direction = 'vertical';
            let args: MouseEvent = new MouseEvent("wheel", { clientY: 0, view: window, bubbles: true, cancelable: true });
            document.querySelector('.e-content-virtualtable').dispatchEvent(args);
            args = new MouseEvent("mouseup", { view: window, bubbles: true, cancelable: true });
            document.querySelector('.e-content-virtualtable').dispatchEvent(args);
            expect(Math.round(document.querySelectorAll('.e-content-virtualtable')[0].scrollTop) === 0).toBeTruthy();
        });

        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
    });
    describe('Classic layout Normal Pivot Chart - ', () => {
        let originalTimeout: number;
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotView', styles: 'height:500px; width:100%' });
        let eventArgs: any;
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 13000;
            setTimeout(() => {
                if (!document.getElementById(elem.id)) {
                    document.body.appendChild(elem);
                }
                let dataBound: EmitType<Object> = () => { done(); };
                PivotView.Inject(GroupingBar, FieldList, PivotChart, Grouping);
                pivotGridObj = new PivotView({
                    dataSourceSettings: {
                        dataSource: pivot_smalldata as IDataSet[],
                        expandAll: false,
                        columns: [{ name: 'Date' }, { name: 'Product' }],
                        rows: [{ name: 'Country' }, { name: 'State' }],
                        formatSettings: [{ name: 'Amount', format: 'C' }],
                        values: [{ name: 'Amount' }, { name: 'Quantity' }], filters: [],
                    },
                    dataBound: dataBound,
                    height: '500px',
                    width: '80%',
                    displayOption: { view: 'Chart' },
                    chartSettings: {
                        enableExport: true,
                        primaryXAxis: { title: 'X axis title', labelIntersectAction: 'Rotate90' },
                        primaryYAxis: { title: 'Y axis title', labelFormat: 'N' },
                        beforePrint: (args: any) => { eventArgs = args; },
                        animationComplete: (args: any) => { eventArgs = args; },
                        legendRender: (args: any) => { eventArgs = args; },
                        textRender: (args: any) => { eventArgs = args; },
                        pointRender: (args: any) => { eventArgs = args; },
                        seriesRender: (args: any) => { eventArgs = args; },
                        chartMouseMove: (args: any) => { eventArgs = args; },
                        chartMouseClick: (args: any) => { eventArgs = args; },
                        pointMove: (args: any) => { eventArgs = args; },
                        pointClick: (args: any) => { eventArgs = args; },
                        chartMouseLeave: (args: any) => { eventArgs = args; },
                        chartMouseDown: (args: any) => { eventArgs = args; },
                        chartMouseUp: (args: any) => { eventArgs = args; },
                        dragComplete: (args: any) => { eventArgs = args; },
                        zoomComplete: (args: any) => { eventArgs = args; },
                        scrollStart: (args: any) => { eventArgs = args; },
                        scrollEnd: (args: any) => { eventArgs = args; },
                        scrollChanged: (args: any) => { eventArgs = args; },
                        tooltipRender: (args: any) => { eventArgs = args; },
                        loaded: (args: any) => { eventArgs = args; },
                        load: (args: any) => { eventArgs = args; },
                        resized: (args: any) => { eventArgs = args; },
                        axisLabelRender: (args: any) => { eventArgs = args; }
                    },
                    gridSettings: {
                        layout: 'Tabular',
                    },
                });
                pivotGridObj.appendTo('#PivotView');
            }, 1000);
        });
        beforeEach((done: Function) => {
            setTimeout(() => { done(); }, 1000);
        });
        it('Check initial render 1', (done: Function) => {
            pivotGridObj.chartSettings.chartSeries = {
                type: 'Column', animation: { enable: false }
            };
            setTimeout(() => {
                expect(document.getElementById('PivotView_chart_Series_0_Point_0').getAttribute('aria-label')).toBe('Canada:100, FY 2005');
                expect(document.getElementById('PivotView_chart_Series_1_Point_0').getAttribute('aria-label')).toBe('Canada:400, FY 2006');
                expect(document.getElementById('PivotView_chart_Series_0_Point_1').getAttribute('aria-label')).toBe('France:200, FY 2005');
                expect(document.getElementById('PivotView_chart_Series_3_Point_4').getAttribute('aria-label')).toBe('United States:400, FY 2008');
                expect(document.getElementById('PivotView_chart_Series_4_Point_4')).toBeNull();
                done();
            }, 1000);
        });
        it('Check initial render 2', (done: Function) => {
            setTimeout(() => {
                expect(document.querySelectorAll('#PivotView_chart0_Axis_MultiLevelLabel_Level_0_Text_4')[0].textContent).toBe(' + United States');
                expect(document.querySelectorAll('#PivotView_chart1_AxisLabel_5')[0].textContent).toBe('$500.00');
                expect(document.querySelectorAll('#PivotView_chart_AxisTitle_0')[0].textContent).toBe('X axis title');
                expect(document.querySelectorAll('#PivotView_chart_AxisTitle_1')[0].textContent).toBe('Y axis title');
                expect(document.querySelectorAll('#PivotView_chart_chart_legend_text_0')[0].textContent).toBe('FY 2005');
                expect(document.querySelectorAll('#PivotView_chart_chart_legend_text_3')[0].textContent).toBe('FY 2008');
                done();
            }, 1000);
        });
        it('change width to  800px', (done: Function) => {
            pivotGridObj.width = '800px';
            pivotGridObj.pivotChartModule.loadChart(pivotGridObj, pivotGridObj.chartSettings);
            setTimeout(() => {
                expect(document.getElementById('PivotView_chart_scrollBarThumb_primaryXAxis')).toBe(null);
                done();
            }, 1000);
        });
        it('change width to 500', (done: Function) => {
            pivotGridObj.width = 500;
            pivotGridObj.pivotChartModule.loadChart(pivotGridObj, pivotGridObj.chartSettings);
            setTimeout(() => {
                done();
            }, 1000);
        });
        it('current measure set to amt(false case)', (done: Function) => {
            pivotGridObj.chartSettings.value = 'Amt';
            setTimeout(() => {
                expect(document.getElementById('PivotView_chart_Series_0_Point_0').getAttribute('aria-label')).toBe('Canada:100, FY 2005');
                expect(document.getElementById('PivotView_chart_Series_1_Point_0').getAttribute('aria-label')).toBe('Canada:400, FY 2006');
                expect(document.getElementById('PivotView_chart_Series_0_Point_1').getAttribute('aria-label')).toBe('France:200, FY 2005');
                expect(document.getElementById('PivotView_chart_Series_3_Point_4').getAttribute('aria-label')).toBe('United States:400, FY 2008');
                done();
            }, 1000);
        });
        it('chart type changed to polar', (done: Function) => {
            pivotGridObj.chartSettings.chartSeries.type = 'Polar';
            setTimeout(() => {
                expect(document.getElementById('PivotView_chart_scrollBarThumb_primaryXAxis')).toBe(null);
                done();
            }, 1000);
        });
        it('chart type changed to radar', (done: Function) => {
            pivotGridObj.chartSettings.chartSeries.type = 'Radar';
            setTimeout(() => {
                expect(document.getElementById('PivotView_chart_scrollBarThumb_primaryXAxis')).toBe(null);
                done();
            }, 1000);
        });
        it('Set display option view as both, primary as chart', (done: Function) => {
            pivotGridObj.displayOption.primary = 'Chart';
            setTimeout(function () {
                expect(true).toBeTruthy();
                done();
            }, 1000);
        });
        it('expand all as true', function (done: Function) {
            pivotGridObj.dataSourceSettings = {
                expandAll: true,
            };
            setTimeout(function () {
                done();
            }, 1000);
        });
        it('expand all as false', function (done: Function) {
            pivotGridObj.dataSourceSettings = {
                dataSource: pivot_smalldata as IDataSet[],
                expandAll: false,
                enableSorting: true,
                allowLabelFilter: true,
                allowValueFilter: true,
                rows: [{ name: 'Country' }, { name: 'State' }],
                columns: [{ name: 'Date' }, { name: 'Product' }],
                values: [{ name: 'Amount' }, { name: 'Quantity' }],
                filters: [],
            };
            setTimeout(function () {
                done();
            }, 1000);
        });
        it('onResize', (done: Function) => {
            (pivotGridObj.pivotChartModule as any).resized({
                chart: pivotGridObj.chart,
                currentSize: { height: 800, width: 800 },
                previousSize: { height: 500, width: 500 },
                name: 'resized'
            } as IResizeEventArgs);
            setTimeout(() => {
                expect(true).toBeTruthy();
                done();
            }, 1000);
        });
    });
    describe('Hiding Sub-Totals in Chart', () => {
        let originalTimeout: number;
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotView', styles: 'height:500px; width:100%' });
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
            setTimeout(() => {
                if (!document.getElementById(elem.id)) {
                    document.body.appendChild(elem);
                }
                let dataBound: EmitType<Object> = () => { done(); };
                PivotView.Inject(GroupingBar, FieldList, PivotChart, Toolbar);
                pivotGridObj = new PivotView({
                    dataSourceSettings: {
                        dataSource: pivot_smalldata as IDataSet[],
                        expandAll: true,
                        enableSorting: true,
                        columns: [{ name: 'Date' }, { name: 'Product' }],
                        rows: [{ name: 'Country' }, { name: 'State' }],
                        formatSettings: [{ name: 'Amount', format: 'C' }],
                        values: [{ name: 'Amount' }, { name: 'Quantity' }], filters: [],
                        allowValueFilter: false,
                        allowLabelFilter: true,
                        showSubTotals: false,
                        showColumnSubTotals: false
                    },
                    dataBound: dataBound,
                    height: 500,
                    showGroupingBar: true,
                    showFieldList: true,
                    displayOption: { view: 'Chart' },
                    chartSettings: {
                        value: 'Amount', enableExport: true, chartSeries: { type: 'Column', animation: { enable: false } }, enableMultipleAxis: false,
                    },
                    gridSettings: {
                        layout: 'Tabular'
                    }
                });
                pivotGridObj.appendTo('#PivotView');
            }, 1000);
        });
        beforeEach((done: Function) => {
            setTimeout(() => { done(); }, 1000);
        });
        it('perform drill up operation', (done: Function) => {
            expect(document.querySelectorAll('#PivotView_chart0_Axis_MultiLevelLabel_Level_1_Text_0')[0].textContent).toBe(' - Canada');
            let args: MouseEvent = new MouseEvent("mousedown", { view: window, bubbles: true, cancelable: true });
            let node: HTMLElement = document.getElementById('PivotView_chart0_Axis_MultiLevelLabel_Level_1_Text_0') as HTMLElement;
            args = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
            node.dispatchEvent(args);
            setTimeout(function () {
                expect(document.querySelectorAll('#PivotView_chart0_Axis_MultiLevelLabel_Level_1_Text_0')[0].textContent).toBe(' + Canada');
                done();
            }, 3000);
        });
    });

    describe('Exporting', () => {
        let pivotGridObj: PivotView;
        let elem: HTMLElement = createElement('div', { id: 'PivotGrid', styles: 'height:200px; width:500px' });
        afterAll(() => {
            if (pivotGridObj) {
                pivotGridObj.destroy();
            }
            remove(elem);
        });
        beforeAll((done: Function) => {
            if (!document.getElementById(elem.id)) {
                document.body.appendChild(elem);
            }
            let dataBound: EmitType<Object> = () => { done(); };
            PivotView.Inject(FieldList, Toolbar, PDFExport, ExcelExport, VirtualScroll);
            pivotGridObj = new PivotView({
                dataSourceSettings: {
                    dataSource: pivot_smalldata as IDataSet[],
                    expandAll: true,
                    columns: [{ name: 'Date' }, { name: 'Product' }],
                    rows: [{ name: 'Country' }, { name: 'State' }],
                    formatSettings: [{ name: 'Amount', format: 'C' }],
                    values: [{ name: 'Amount' }, { name: 'Quantity' }], filters: [],
                },
                height: 800,
                width: 800,
                showToolbar: true,
                allowExcelExport: true,
                allowPdfExport: true,
                enableVirtualization: true,
                showFieldList: true,
                saveReport: util.saveReport.bind(this),
                fetchReport: util.fetchReport.bind(this),
                loadReport: util.loadReport.bind(this),
                removeReport: util.removeReport.bind(this),
                renameReport: util.renameReport.bind(this),
                newReport: util.newReport.bind(this),
                toolbarRender: util.beforeToolbarRender.bind(this),
                displayOption: { view: 'Both' },
                dataBound: dataBound,
                chartSettings: {
                    value: 'Amount', enableExport: true, chartSeries: { type: 'Column', animation: { enable: false } }, enableMultipleAxis: false,
                },
                gridSettings: {
                    layout: 'Tabular',
                    columnWidth: 120, rowHeight: 36
                },
                toolbar: ['New', 'Save', 'SaveAs', 'Rename', 'Remove', 'Load',
                    'Grid', 'Chart', 'MDX', 'Export', 'SubTotal', 'GrandTotal', 'ConditionalFormatting', 'FieldList'],
                virtualScrollSettings: { allowSinglePage: false }
            });
            pivotGridObj.appendTo('#PivotGrid');
        });
        beforeEach((done: Function) => {
            setTimeout(() => { done(); }, 1000);
        });
        it('Export', (done: Function) => {
            setTimeout(() => {
                let li: HTMLElement = document.getElementById('PivotGridexport_menu').children[0] as HTMLElement;
                expect(li.classList.contains('e-menu-caret-icon')).toBeTruthy();
                util.triggerEvent(li, 'mouseover');
                done();
            }, 1000);
        });
        it('PDF Export', (done: Function) => {
            setTimeout(() => {
                (document.querySelectorAll('.e-menu-popup li')[0] as HTMLElement).click();
                let li: HTMLElement = document.getElementById('PivotGridexport_menu').children[0] as HTMLElement;
                expect(li.classList.contains('e-menu-caret-icon')).toBeTruthy();
                util.triggerEvent(li, 'mouseover');
                done();
            }, 1000);
        });
    });

    it('memory leak', () => {
        profile.sample();
        let average: any = inMB(profile.averageChange);
        //Check average change in memory samples to not be over 10MB
        expect(average).toBeLessThan(10);
        let memory: any = inMB(getMemoryProfile());
    //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
            expect(memory).toBeLessThan(profile.samples[0] + 0.25);
        }); 
});
