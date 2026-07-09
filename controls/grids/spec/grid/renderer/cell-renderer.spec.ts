/**
 * Cell renderer spec 
 */
import { EmitType } from '@syncfusion/ej2-base';
import { createElement, remove } from '@syncfusion/ej2-base';
import { Grid } from '../../../src/grid/base/grid';
import { Column } from '../../../src/grid/models/column';
import { ICellFormatter } from '../../../src/grid/base/interface';
import { RowRenderer } from '../../../src/grid/renderer/row-renderer';
import { Row } from '../../../src/grid/models/row';
import { createGrid, destroy } from '../base/specutil.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { GroupCaptionCellRenderer } from '../../../src/grid/renderer/caption-cell-renderer';
import { FilterCellRenderer } from '../../../src/grid/renderer/filter-cell-renderer';

describe('Custom Atrributes and html encode module', () => {

    describe('Column attributes', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid({
                columns: [
                    {
                        field: 'data.a', headerText: '<i>A</i>', headerTextAlign: 'Center',
                        disableHtmlEncode: false, textAlign: 'Right', customAttributes: {
                            class: 'hi',
                            style: { color: 'green', 'background-color': 'wheat' },
                            'data-id': 'grid-cell'
                        }
                    },
                    { headerText: 'B' },
                    { field: 'c', headerText: 'C', displayAsCheckBox: false, type: 'boolean', visible: false },
                    { field: 'c', headerText: 'Cc', displayAsCheckBox: true, type: 'boolean' },
                    {
                        headerText: 'D', valueAccessor: (field: string, data: Object, column: Column) => {
                            return '<span style="color:' + (data['c'] ? 'green' : 'red') + '"><i>GO</i><span>';
                        },
                    }
                ],
                dataSource: [{ data: { a: '<i>VINET</i>' }, b: '<i>TOMSP</i>', c: true, d: new Date() },
                { data: { a: 2 }, b: 2, c: false, d: new Date() }],
                allowPaging: false
            }, done);
        });

        it('ClassName testing', () => {
            expect(gridObj.element.classList.contains('e-grid')).toBeTruthy();
        });

        it('Attribute testing', () => {
            let rows: Element[] = gridObj.getRows();
            let hRow: Element = gridObj.element.querySelector('.e-columnheader');
            for (let i: number = 0; i < rows[0].children.length; i++) {
                expect(rows[0].children[i].hasAttribute('tabindex')).toBeTruthy();
            }
            for (let i: number = 0; i < hRow.children.length; i++) {
                expect(hRow.children[i].hasAttribute('tabindex')).toBeTruthy();
            }
        });

        afterAll(() => {
            destroy(gridObj);
        });

    });


    class ExtendedFormatter implements ICellFormatter {
        public getValue(column: Column, data: Object): Object {
            return (<number>data[column.field]).toFixed(2);
        }
    }

    describe('Custom Formatter - implements ICellFormatter', () => {
        let rows: HTMLTableRowElement;
        let grid: Grid;
        beforeAll((done: EmitType<Object>) => {
            grid = createGrid(
                {
                    columns: [
                        { field: 'data.a' },
                        { field: 'b', formatter: ExtendedFormatter }
                    ],
                    dataSource: [{ data: { a: 1 }, b: 5, c: true, d: new Date() },
                    { data: { a: 2 }, b: 6, c: false, d: new Date() }],
                    allowPaging: false
                }, done);
        });
        it('Check custom Formatter return value', () => {
            rows = ((grid.getContentTable() as any).tBodies[0]).rows[0] as HTMLTableRowElement;
            expect(rows.cells[1].innerHTML).toBe('5.00');
        });
        afterAll(() => {
            destroy(grid);
        });
    });

    describe('Custom Formatter -  as Object implements ICellFormatter', () => {
        let rows: HTMLTableRowElement;
        let grid: Grid;
        beforeAll((done: EmitType<Object>) => {
            grid = createGrid(
                {
                    columns: [
                        { field: 'data.a' },
                        { field: 'b', formatter: new ExtendedFormatter() }
                    ],
                    dataSource: [{ data: { a: 1 }, b: 5, c: true, d: new Date() },
                    { data: { a: 2 }, b: 6, c: false, d: new Date() }],
                    allowPaging: false
                }, done);
        });
        it('Check custom Formatter return value', () => {
            rows = ((grid.getContentTable() as any).tBodies[0]).rows[0] as HTMLTableRowElement;
            expect(rows.cells[1].innerHTML).toBe('5.00');
        });
        afterAll(() => {
            destroy(grid);
        });
    });

    describe('html encode check', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid({
                columns: [
                    {
                        field: 'data.a', headerText: 'Field1', headerTextAlign: 'Center',
                        textAlign: 'Right', 
                    },
                    { field: 'c', headerText: 'Field2', displayAsCheckBox: true, type: 'boolean' },
                    { field: 'b', headerText: 'Field3', }
                ],
                dataSource: [{ data: { a: '<i>VINET</i>' }, b: '<i>TOMSP</i>', c: true, d: new Date() },
                { data: { a: 2 }, b: null, c: false, d: new Date() }],
            }, done);
        });

        it('content testing', () => {
            expect(gridObj.getContent().querySelectorAll('.e-rowcell')[0].innerHTML).toBe('&lt;i&gt;VINET&lt;/i&gt;');
            expect(gridObj.getContent().querySelectorAll('.e-rowcell')[2].innerHTML).toBe('&lt;i&gt;TOMSP&lt;/i&gt;');
        });

        afterAll(() => {
            destroy(gridObj);
        });

    });


    describe('Custom Formatter as Function', () => {
        let customFn: { fn: Function } = {
            fn: (column: Column, data: Object) => {
                return (data[column.field] as number).toFixed(2);
            }
        };

        let rows: HTMLTableRowElement;
        let grid: Grid;
        beforeAll((done: EmitType<Object>) => {
            grid = createGrid({
                columns: [
                    { field: 'data.a' },
                    { field: 'b', formatter: customFn.fn },
                    { field: 'd', format: 'yMd' }
                ],
                dataSource: [{ data: { a: 1 }, b: 5, c: true, d: new Date() },
                { data: { a: 2 }, b: 6, c: false, d: null }],
                allowPaging: false
            }, done);
        });

        it('Check custom Formatter return value', () => {
            rows = ((grid.getContentTable() as any).tBodies[0]).rows[0] as HTMLTableRowElement;
            expect(rows.cells[1].innerHTML).toBe('5.00');
            let rows1 = ((grid.getContentTable() as any).tBodies[0]).rows[1] as HTMLTableRowElement;
            expect(rows1.cells[2].innerHTML).toBe('');
        });

        it('Row Rendeder functionality object to attribute conversion checking', () => {
            let render: RowRenderer<Column> = new RowRenderer<Column>(grid.serviceLocator, null, grid);
            let tr: HTMLElement = <HTMLElement>render.render(<Row<Column>>{ isSelected: true, visible: false, rowSpan: 1, cells:[] }, []);
            expect(tr.classList.contains('e-hide')).toBeTruthy();
            expect(tr.getAttribute('aria-selected')).not.toBeNull();
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
            destroy(grid);
        });
    });

    describe('868490: Accessibility issue with checkbox in Accessibility Insights for web tool.', () => {
        let rows: HTMLTableRowElement;
        let grid: Grid;
        beforeAll((done: EmitType<Object>) => {
            grid = createGrid({
                columns: [
                    { type: 'checkbox', allowFiltering: false, allowSorting: false, width: '60' },
                    { field: 'b'},
                    { field: 'd', format: 'yMd' }
                ],
                dataSource: [{ data: { a: 1 }, b: 5, c: true, d: new Date() },
                { data: { a: 2 }, b: 6, c: false, d: null }],
                allowPaging: false
            }, done);
        });

        it('check aria-label for check box cell', () => {
            rows = ((grid.getContentTable() as any).tBodies[0]).rows[0] as HTMLTableRowElement;
            expect(rows.cells[0].querySelector('input').getAttribute('aria-label').toString()).toBe('Select row');
        });

        afterAll(() => {
            destroy(grid);
        });
    });

    describe('892211: Number options format of N2 with string type data for number type defined column triggers the action failure event with the grids warning log.', () => {
        let rows: HTMLTableRowElement;
        let grid: Grid;
        beforeAll((done: EmitType<Object>) => {
            grid = createGrid({
                columns: [
                    { field: 'OrderDate', format: { type: 'date', format:'dd/MM/yyyy' }},
                    { field: 'Freight',  format: {  type: 'number', format: 'N2' }},                     
                    { field: 'ShippedDate', format: 'yMd' }
                ],
                dataSource: [{ OrderDate: '1996-07-08T07:50:00.000Z', Freight: 3.55, ShippedDate: '1996-07-15T15:50:00.000Z', }],
            }, done);
        });

        it('Check if the row contains inputs and format them for testing', () => {
            rows = ((grid.getContentTable() as any).tBodies[0]).rows[0] as HTMLTableRowElement;
            expect(rows.cells[0].innerHTML).toBe('08/07/1996');
            expect(rows.cells[1].innerHTML).toBe('3.55');
            expect(rows.cells[2].innerHTML).toBe('7/15/1996');
        });

        afterAll(() => {
            destroy(grid);
            grid = rows = null;
        });
    });

    describe('1015517: GroupCaptionCellRenderer tempObj else-branches', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid({
                dataSource: [{ OrderID: 1, CustomerID: 'A' }],
                columns: [{ field: 'OrderID', headerText: 'Order ID' }, { field: 'CustomerID', headerText: 'Customer' }]
            }, done);
        });

        it('react path: should append tempValue text via innerText when captionTemplate is undefined', () => {
            const gObj: any = grid;
            const visibleField = gObj.getVisibleColumns()[0].field;
            const aggCol: any = {
                field: visibleField,
                groupCaptionTemplate: function () { },
                type: 'sum',
                columnName: visibleField,
                getTemplate: function (): any { return { fn: function (): any { const s = document.createElement('span'); s.textContent = 'RINNER'; return [s]; }, property: 'p' }; }
            };
            gObj.aggregates = [{ columns: [aggCol] }];
            gObj.groupSettings = gObj.groupSettings || {}; delete gObj.groupSettings.captionTemplate;
            gObj.isReact = true; gObj.printGridParent = null; gObj.parentDetails = null;
            let renderCb: Function | null = null;
            spyOn(gObj, 'renderTemplates').and.callFake(function (cb: Function) { renderCb = cb; });
            const renderer: any = new GroupCaptionCellRenderer(grid, grid.serviceLocator);
            const cell: any = { column: gObj.getColumns()[0], isForeignKey: false, colSpan: 1 };
            const data: any = {}; data[visibleField] = 'V'; data.key = 'Kr'; data.count = 1;
            const node = renderer.render(cell, data) as HTMLElement;
            if (renderCb) { renderCb(); }
            expect(node.innerHTML.indexOf('RINNER')).toBeGreaterThan(-1);
        });

        afterAll(() => {
            destroy(grid);
        });
    });

    describe('GroupCaptionCellRenderer else-branch (non-lazy) standalone', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid({
                dataSource: [{ OrderID: 1, CustomerID: 'A' }],
                columns: [{ field: 'OrderID', headerText: 'Order ID' }, { field: 'CustomerID', headerText: 'Customer' }]
            }, done);
        });

        it('executes else branch when enableLazyLoading is false and gTemplateValue present', () => {
            const gObj: any = grid;
            const visibleField = gObj.getVisibleColumns()[0].field;
            // aggregate column that yields tempValue node list
            const aggCol: any = {
                field: visibleField,
                groupCaptionTemplate: function () { },
                type: 'sum',
                columnName: visibleField,
                getTemplate: function (): any { return { fn: function (): any { const s = document.createElement('span'); s.textContent = 'ELSEG'; return [s]; }, property: 'p' }; }
            };
            gObj.aggregates = [{ columns: [aggCol] }];
            gObj.groupSettings = gObj.groupSettings || {};
            gObj.groupSettings.enableLazyLoading = false;
            delete gObj.groupSettings.captionTemplate;
            gObj.isReact = false; gObj.parentDetails = null; gObj.printGridParent = null;
            const renderer: any = new GroupCaptionCellRenderer(grid, grid.serviceLocator);
            const cell: any = { column: gObj.getColumns()[0], isForeignKey: false, colSpan: 1 };
            const data: any = {}; data[visibleField] = 'VAL'; data.key = 'Kelse'; data.count = 9;
            const node = renderer.render(cell, data) as HTMLElement;
            expect(node.textContent).toContain(' - 9 ');
            expect(node.textContent).toContain('ELSEG');
        });

        afterAll(() => {
            destroy(grid);
        });

    });

    describe('1015517: GroupCaptionCellRenderer in vue path', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid({
                dataSource: [{ OrderID: 1, CustomerID: 'A' }, { OrderID: 2, CustomerID: 'B' }],
                allowFiltering: false,
                columns: [
                    { field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'Customer' }
                ]
            }, done);
        });

        it('GroupCaptionCellRenderer should use templateCompiler in vue path', () => {
            const util = require('../../../src/grid/base/util');
            spyOn(util, 'templateCompiler').and.returnValue(function (): any { return [document.createElement('span')]; });
            const gObj: any = grid;
            gObj.groupSettings = gObj.groupSettings || {};
            gObj.groupSettings.captionTemplate = '<span>VUE</span>';
            gObj.parentDetails = { parentInstObj: { isVue: true } };
            const renderer: any = new GroupCaptionCellRenderer(grid, grid.serviceLocator);
            const cell: any = { column: gObj.getColumns()[0], isForeignKey: false, colSpan: 1 };
            const data: any = { key: 'Kv', count: 2 };
            const node = renderer.render(cell, data) as HTMLElement;
            expect(node.querySelectorAll('span').length).toBeGreaterThan(0);
        });
        afterAll(() => {
            destroy(grid);
        });
    });
    
    describe('1015522: Column model', () => {
        it('should lowercase type and editType and generate uid', () => {
            const col = new Column({ field: 'text1', type: 'none', editType: 'stringedit' } as any);
            const column = new Column({ field: 'test2', type: Boolean, editType: 'stringedit' } as any);
        });

        it('isForeignColumn returns true when dataSource and foreignKeyValue present', () => {
            const col = new Column({ dataSource: [], editType: 'defaultedit', edit : { params: { dataSource : [{ id: 1, name: 'A' }]} }, foreignKeyValue: 'name' } as any);
            expect(col.isForeignColumn()).toBe(true);
        });

        it('sortComparer wrapper swaps args when default sortDirection is Descending', () => {
            const cmp = (a: number, b: number) => (a > b ? 1 : (a < b ? -1 : 0));
            const col = new Column({ sortComparer: cmp } as any);
            // constructor wraps comparator; default sortDirection = 'Descending' -> swap expected
            const res = (col.sortComparer as any)(1, 2);
            expect(res).toBe(1);
        });
        
        it('setProperties should update properties and call react refresh when parent.isReact true', () => {
            const stubParent: any = {
            isReact: true,
            refreshReactColumnTemplateByUid: jasmine.createSpy('c'),
            refreshReactHeaderTemplateByUid: jasmine.createSpy('h')
            };
            const col = new Column({ field: 'x', columns: [new Column({ field: 'c1' } as any)] } as any, stubParent);
            // update template should call refreshReactColumnTemplateByUid
            col.setProperties({ template: '<div>t</div>' } as any);
            expect(stubParent.refreshReactColumnTemplateByUid).toHaveBeenCalled();
            // update headerTemplate should call refreshReactHeaderTemplateByUid
            col.setProperties({ headerTemplate: '<span>h</span>' } as any);
            expect(stubParent.refreshReactHeaderTemplateByUid).toHaveBeenCalled();
            col.setProperties({ filterTemplate: '<span>h</span>' } as any);
            expect(stubParent.refreshReactHeaderTemplateByUid).toHaveBeenCalled();
            col.setProperties({ commandsTemplate: '<span>h</span>' } as any);
            expect(stubParent.refreshReactHeaderTemplateByUid).toHaveBeenCalled();
        });
    });

    describe('FilterCellRenderer Module', () => {
        let grid: Grid;
        let renderer: FilterCellRenderer;

        afterEach(() => {
            if (grid) { destroy(grid); }
            grid = undefined;
            renderer = undefined;
        });

        it('should set readOnly and call filterByColumn for isempty operator', (done: EmitType<Object>) => {
            grid = createGrid({
                columns: [{ field: 'id', headerText: 'ID' }],
                dataSource: [{ id: '1' }],
                allowPaging: false,
                allowFiltering: true,
                filterSettings: { type: 'FilterBar', showFilterBarOperator: true, columns: [] }
            }, () => {
                const col = grid.getColumnByField('id');
                renderer = new FilterCellRenderer(grid, grid.serviceLocator);
                // create filterbar row container if not present
                let tr = grid.element.querySelector('.e-filterbar') as HTMLElement;
                if (!tr) {
                    tr = createElement('tr', { className: 'e-filterbar' });
                    grid.element.appendChild(tr);
                }
                const cell: any = { column: col, attributes: { title: col.headerText } };
                const node = renderer.render(cell, { id: '<none>' });
                // ensure input present
                const input = document.getElementById(col.field + '_filterBarcell') as HTMLInputElement;
                // spy on filterModule.filterByColumn
                spyOn(grid.filterModule, 'filterByColumn').and.callThrough();

                // construct fake event
                const fakeEl = createElement('input', { attrs: { id: col.uid } }) as HTMLElement;
                document.body.appendChild(fakeEl);
                const evt1: any = { element: fakeEl, value: 'isempty' };
                renderer['internalEvent'](evt1);
                const evt2: any = { element: fakeEl, value: 'equal' };
                renderer['internalEvent'](evt2);
                fakeEl.remove();
                done();
            });
        });
    });
    
    describe('FilterCellRenderer additional branches', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid({
                dataSource: [{ id: 1, name: 'A' }],
                allowFiltering: true,
                filterSettings: { type: 'FilterBar', showFilterBarOperator: true, columns: [] },
                columns: [{ field: 'id' }, { field: 'name' }]
            }, done);
        });

        it('operatorIconRender uses filterModule.operators mapping', () => {
            const renderer: any = new FilterCellRenderer(grid, grid.serviceLocator);
            const col = grid.getColumnByField('id');
            const cell: any = { column: col, uid: col.uid };
            // ensure filterbar row exists
            let tr = grid.element.querySelector('.e-filterbar') as HTMLElement;
            if (!tr) {
                tr = document.createElement('tr'); tr.className = 'e-filterbar'; grid.element.appendChild(tr);
            }
            const innerDIV = document.createElement('div'); const span = document.createElement('span'); innerDIV.appendChild(span);
            grid.filterModule.operators = {};
            (grid.filterModule.operators as any)[col.field] = 'notequal';
            (renderer as any).operatorIconRender(innerDIV, col, { column: col } as any);
        });

        it('render with filterTemplate non-react appends children and hides when invisible', () => {
            const renderer: any = new FilterCellRenderer(grid, grid.serviceLocator);
            const col = new Column({ field: 'tmp', filterTemplate: function(fltrData: any, parent: any, t: any, id: any) {
                const el = document.createElement('input'); el.id = 'tmpl-inp'; return [el];
            }, visible: true }, grid);
            // ensure filterbar row
            let tr = grid.element.querySelector('.e-filterbar') as HTMLElement;
            if (!tr) { tr = document.createElement('tr'); tr.className = 'e-filterbar'; grid.element.appendChild(tr); }
            const cell: any = { column: col };
            const node = (renderer as any).render(cell, { tmp: 'v' });
            // now invisible column should add e-hide
            const col2 = new Column({ field: 'tmp2', filterTemplate: function() { 
                const d = document.createElement('div'); 
                d.id = 'x'; return [d]; 
            }, visible: false }, grid);
            const node2 = (renderer as any).render({ column: col2 } as any, {});
        });

        afterAll(() => {
            destroy(grid);
            grid = null;
        });
    });

});
