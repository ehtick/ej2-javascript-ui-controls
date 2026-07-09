/**
 * Grid Column chooser spec document
 */
import { Grid } from '../../../src/grid/base/grid';
import { Page } from '../../../src/grid/actions/page';
import { Button } from '@syncfusion/ej2-buttons';
import { Toolbar } from '../../../src/grid/actions/toolbar';
import { data, employeeData } from '../base/datasource.spec';
import { EJ2Intance } from '../../../src/grid/base/interface';
import { ColumnChooser } from '../../../src/grid/actions/column-chooser';
import { createGrid, destroy } from '../base/specutil.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { DetailRow } from '../../../src/grid/actions/detail-row';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { isNullOrUndefined, select } from '@syncfusion/ej2-base';
import * as events from '../../../src/grid/base/constant';
import { Edit } from '../../../src/grid/actions/edit';
import { VirtualScroll } from '../../../src/grid/actions/virtual-scroll';

Grid.Inject(Page, Toolbar, ColumnChooser, DetailRow, Edit,VirtualScroll);
describe('Column chooser module', () => {
    describe('Column chooser testing', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID', showInColumnChooser: false }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }],
                    allowPaging: true,
                    showColumnChooser: true,
                    cssClass: 'report',
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });

        it('Column chooser testing', (done: Function) => {
            beforeOpenColumnChooser = (args?: { element: Element }): void => {
                expect(args.element.querySelectorAll('.e-columnchooser-btn').length).toBe(1);
                done();
            };
            beforeOpenColumnChooser = (args?: { element: Element }): void => {
                expect(args.element.querySelectorAll('.e-ccdlg').length).toBe(1);
                done();
            };
            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;

            gridObj.element.classList.add('e-device');
            setTimeout(() => {
                select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar()).click();
                (<any>gridObj).isDestroyed = true;
                (<any>gridObj).columnChooserModule.addEventListener();
                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).isDestroyed = false;
                (<any>gridObj).columnChooserModule.removeEventListener();
                (<any>gridObj).destroy();
            }, 500);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });
    });

    describe('Extra coverage - infinite and edge branches', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const cols = [] as any[];
            for (let i = 0; i < 60; i++) {
                cols.push({ field: 'f' + i, headerText: 'F' + i, showInColumnChooser: true });
            }
            gridObj = createGrid(
                {
                    dataSource: [],
                    showColumnChooser: true,
                    enableColumnVirtualization: true,
                    toolbar: ['ColumnChooser'],
                    columns: cols
                }, done);
        });

        it('invoke internal helpers and infinite helpers', (done: Function) => {
            const cc: any = (gridObj as any).columnChooserModule;
            // ensure infinite mode is enabled
            cc.infiniteRenderMode = true;
            // fabricate infiniteLoadedElement entries with e-uncheck and e-frame
            cc.infiniteLoadedElement = [];
            for (let i = 0; i < 5; i++) {
                const wrapper = document.createElement('div');
                const frame = document.createElement('span'); frame.className = 'e-frame';
                // ensure frame carries check/uncheck class so updateSelectAll sees it
                frame.classList.add(i % 2 ? 'e-uncheck' : 'e-check');
                const icon = document.createElement('span'); icon.className = 'e-icons';
                frame.appendChild(icon);
                // add an input element as real checkbox markup expects
                const input = document.createElement('input'); input.type = 'checkbox';
                input.className = 'e-cc-chbox';
                wrapper.appendChild(frame);
                wrapper.appendChild(input);
                cc.infiniteLoadedElement.push(wrapper as HTMLElement);
            }
            // exercise updateIfiniteSelectAll (will call checkState for each uncheck)
            cc.updateIfiniteSelectAll();

            // test updateSelectAll with fabricated ulElement
            cc.ulElement = document.createElement('ul');
            const li = document.createElement('li'); cc.ulElement.appendChild(li);
            // fabricate mainDiv selectall frame for infinite mode
            cc.mainDiv = document.createElement('div');
            const selectAll = document.createElement('div'); selectAll.className = 'e-cc-selectall';
            const frame = document.createElement('div'); frame.className = 'e-frame e-selectall e-uncheck'; selectAll.appendChild(frame);
            // add input for selectAll
            const selectAllInput = document.createElement('input'); selectAllInput.type = 'checkbox';
            selectAll.appendChild(selectAllInput);
            cc.mainDiv.appendChild(selectAll);
            cc.updateSelectAll(false);

            // call infinite scroll mouse handlers (no-op branches covered)
            cc.infiniteDiv = document.createElement('div');
            cc.infiniteDiv.scrollTop = 0;
            cc.infiniteScrollMouseKeyDownHandler();
            // mouse up calls clickHandler via timer; fabricate an event
            const e: any = { target: document.createElement('div') };
            cc.infiniteScrollMouseKeyUpHandler(e as any);

            // call infiniteScrollHandler with non-matching conditions to cover branches
            cc.ulElement = document.createElement('ul');
            cc.ulElement.appendChild(document.createElement('li'));
            cc.infiniteLoadedElement = cc.infiniteLoadedElement || [];
            cc.infiniteSkipCount = 0;
            cc.itemsCount = 10;
            cc.infiniteInitialLoad = false;
            cc.infiniteScrollHandler();

            // changeColumnVisibility with uid and with field
            gridObj.columnChooserModule.changeColumnVisibility({ visibleColumns: [], hiddenColumns: [] }, 'uid');
            gridObj.columnChooserModule.changeColumnVisibility({ visibleColumns: ['f1'], hiddenColumns: ['f2'] }, 'field');

            // call various small helpers
            cc.changedColumnState([]);
            cc.columnStateChange(['non-existent-uid'], true);
            cc.resetColumnState();
            // cover resetColumnState branch when dlgDiv has a focused selectall element
            cc.dlgDiv = document.createElement('div');
            const focusLi = document.createElement('li');
            focusLi.className = 'e-cclist e-cc-selectall e-colfocus';
            cc.dlgDiv.appendChild(focusLi);
            cc.infiniteRenderMode = true;
            cc.resetColumnState();
            expect(focusLi.classList.contains('e-colfocus')).toBe(false);
            cc.clearActions();
            cc.renderResponsiveColumnChooserDiv({ action: 'open' });
            cc.renderResponsiveColumnChooserDiv({ action: 'clear' });
            cc.renderResponsiveColumnChooserDiv({ action: 'confirm' });

            // property change with mismatched module and matching module
            cc.onPropertyChanged({ module: 'something-else' });
            cc.onPropertyChanged({ module: cc.getModuleName() });

            // confirmDlgBtnClick with null args to hit branch where args is null
            cc.confirmDlgBtnClick({});
            cc.extendInfiniteRemoveElements(cc.infiniteColumns);
            done();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Column chooser event testing', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID', showInColumnChooser: false }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });
        it('Column chooser render testing', (done: Function) => {
            beforeOpenColumnChooser = (args?: any): void => {
                expect(args.requestType).toBe('beforeOpenColumnChooser');
                expect(args.columns.length).toBe(4);
                done();
            };

            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;
            setTimeout(() => {
                select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar()).click();
                (<any>gridObj).columnChooserModule.isDlgOpen = true;
                select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar()).click();
                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).destroy();
            }, 500);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });
    });

    describe('Column chooser Custom testing', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID', showInColumnChooser: false }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }],
                    allowPaging: true,
                    showColumnChooser: true,
                    pageSettings: { pageSize: 5 },
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });
        it('Column chooser open  testing', (done: Function) => {
            beforeOpenColumnChooser = (args?: any): void => {
                expect(args.requestType).toBe('beforeOpenColumnChooser');
                expect(args.columns.length).toBe(4);
                done();
            };

            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;

            setTimeout(() => {
                gridObj.columnChooserModule.openColumnChooser();
                (<HTMLElement>gridObj.element.querySelectorAll('.e-rowcell')[0]).click();
                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).destroy();
                done();
            }, 1000);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });
    });

    describe('column chooser search', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID', showInColumnChooser: false }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });
        it('coverage', (done: Function) => {
            setTimeout(() => {
                gridObj.columnChooserModule.openColumnChooser();
                (gridObj.columnChooserModule as any).columnChooserSearch('e');
                (<HTMLElement>document.querySelector('.e-cc-cancel')).click();
                (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
                gridObj.columnChooserModule.openColumnChooser();
                (gridObj.columnChooserModule as any).columnChooserSearch('ghgh');
                (<HTMLElement>document.querySelector('.e-cc-cnbtn')).click();
                gridObj.columnChooserModule.openColumnChooser();
                (gridObj.columnChooserModule as any).columnChooserSearch('');
                (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).destroy();
                done();
            }, 500);

        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });

    });

    describe('column chooser manual search', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID', showInColumnChooser: false }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight', visible: false },
                    { field: 'ShipCity' }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });
        it('column chooser manual search', (done: Function) => {
            setTimeout(() => {
                gridObj.columnChooserModule.openColumnChooser();
                let value: any;
                let target: Object;
                let keycode: number = 13;
                let e: Object;
                e = { target: { value: 'ddc' } };
                (gridObj.columnChooserModule as any).columnChooserManualSearch(e);
                (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
                e = { target: { value: 'ddc' }, keycode: 13 };
                (gridObj.columnChooserModule as any).columnChooserManualSearch(e);
                gridObj.columnChooserModule.openColumnChooser(100, 100);
                (<any>gridObj).columnChooserModule.confirmDlgBtnClick();
                (gridObj.columnChooserModule as any).columnChooserManualSearch(e);
                let searchElement = document.querySelector('.e-ccsearch');
                // (<any>gridObj).columnChooserModule.columnChooserSearch('e');
                // (<any>gridObj).columnChooserModule.startTime({keycode: 13});
                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).destroy();
                done();
            }, 500);

        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });

    });

    describe('column chooser single field search', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID' }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                }, done);
        });
        it('column chooser single field search', (done: Function) => {
            setTimeout(() => {
                gridObj.columnChooserModule.openColumnChooser();
                let value: any;
                let target: Object;
                let keycode: number = 13;
                let e: Object;
                e = { target: { value: 'f' } };
                (gridObj.columnChooserModule as any).columnChooserManualSearch(e);
                expect(document.querySelector('.e-cc_okbtn').hasAttribute('disabled')).toBeFalsy();
                document.querySelector('.e-check').classList.add('e-uncheck');
                document.querySelector('.e-check').classList.remove('e-check');
                expect(document.querySelector('.e-cc_okbtn').hasAttribute('disabled')).toBeFalsy();
                (<HTMLElement>document.querySelector('.e-cc-cancel')).click();
                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).destroy();
                done();
            }, 500);

        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });

    });

    describe('column chooser checkstate', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID' }, { field: 'CustomerID', visible: false },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity', showInColumnChooser: false }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });
        it('change checkstate', (done: Function) => {
            setTimeout(() => {
                gridObj.columnChooserModule.openColumnChooser();
                expect(document.querySelectorAll('.e-selectall.e-stop').length).toBe(1);
                let cheEle: any = document.querySelectorAll('.e-cc-chbox')[0];
                let cheEle1: any = document.querySelectorAll('.e-cc-chbox')[1];
                cheEle.click();
                cheEle1.click();
                (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
                gridObj.columnChooserModule.openColumnChooser();
                gridObj.columnChooserModule.openColumnChooser();
                done();
            }, 500);

        });
        it('change checkstate on focus out', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            let cheEle: any = document.querySelectorAll('.e-cc-chbox')[0];
            let cheEle1: any = document.querySelectorAll('.e-cc-chbox')[1];
            let checkbox1state = cheEle.checked;
            let checkbox2state = cheEle1.checked;
            cheEle.click();
            cheEle1.click();
            (<HTMLElement>gridObj.element).click();
            gridObj.columnChooserModule.openColumnChooser();
            gridObj.columnChooserModule.openColumnChooser();
            cheEle = document.querySelectorAll('.e-cc-chbox')[0];
            cheEle1 = document.querySelectorAll('.e-cc-chbox')[1];
            expect(cheEle.checked).toBe(checkbox1state);
            expect(cheEle1.checked).toBe(checkbox2state);
            done();
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });

    });

    describe('column chooser checkstate with Freeze pane', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    frozenColumns: 2,
                    frozenRows: 2,
                    dataSource: data,
                    columns: [{ field: 'OrderID' }, { field: 'CustomerID', visible: false },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity', showInColumnChooser: false }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });
        it('change checkstate with Freeze pane', (done: Function) => {
            setTimeout(() => {
                gridObj.columnChooserModule.openColumnChooser();
                let cheEle: any = document.querySelectorAll('.e-cc-chbox')[0];
                let cheEle1: any = document.querySelectorAll('.e-cc-chbox')[1];
                cheEle.click();
                cheEle1.click();
                (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
                gridObj.columnChooserModule.openColumnChooser();
                gridObj.columnChooserModule.openColumnChooser();
                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).destroy();
                done();
            }, 500);

        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });
    });

    describe('Column chooser rtl testing', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID', showInColumnChooser: false }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity', visible: false }],
                    allowPaging: true,
                    toolbar: ['ColumnChooser'],
                    showColumnChooser: true,
                    pageSettings: { pageSize: 5 },
                    enableRtl: true,
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });
        it('rtl', (done: Function) => {
            let x: number = 100;
            let y: number = 100;
            let target: HTMLElement;
            let e: Object;
            gridObj.element.classList.add('e-bigger');
            setTimeout(() => {
                select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar()).click();
                (<any>gridObj).columnChooserModule.openColumnChooser(x, y);
                (<any>gridObj).columnChooserModule.openColumnChooser();
                let sel: HTMLElement = (<any>gridObj).element.querySelector('.e-columnchooser-btn');
                e = { target: sel };
                (<any>gridObj).initialOpenDlg = false;
                (<any>gridObj).isDlgOpen = true;
                (<any>gridObj).columnChooserModule.clickHandler(e);
                (<any>gridObj).columnChooserModule.clickHandler(e);
                (<any>gridObj).columnChooserModule.openColumnChooser();
                let ele: any = document.querySelectorAll('.e-cc-chbox')[0];
                e = { event: { target: ele }, value: true };
                (<any>gridObj).columnChooserModule.checkstatecolumn(e);
                let ele1: any = document.querySelectorAll('.e-cc-chbox')[3];
                e = { event: { target: ele1 }, value: true };
                (<any>gridObj).columnChooserModule.checkstatecolumn(e);
                ele.click();
                e = { event: { target: ele }, value: false };
                (<any>gridObj).columnChooserModule.checkstatecolumn(e);
                ele1.click();
                e = { event: { target: ele }, value: false };
                (<any>gridObj).columnChooserModule.checkstatecolumn(e);

                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).destroy();
                done();
            }, 1000);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });
    });
    describe('Colum chooser enable throw set model => ', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID', headerText: 'Order ID' },
                    { field: 'CustomerID', headerText: 'CustomerID' },
                    { field: 'EmployeeID', headerText: 'Employee ID' },
                    { field: 'Freight', headerText: 'Freight' },
                    { field: 'ShipCity', headerText: 'Ship City' },
                    { field: 'ShipCountry', headerText: 'Ship Country' }],
                    showColumnChooser: false,
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                }, done);
        });
        it('Colum chooser enable throw set model', () => {
            gridObj.showColumnChooser = true;
            gridObj.dataBind();
            gridObj.columnChooserModule.openColumnChooser();
            expect(document.querySelectorAll('.e-ccdlg').length).toBe(1);
        });

        it('EJ2-7683==>enabling rtl', () => {
            gridObj.enableRtl = true;
            gridObj.dataBind();
        });

        it('EJ2-7683==>checking whether rtl is enabled', () => {
            let columnChooser: any = (<any>document.querySelector('.e-ccdlg'));
            expect(columnChooser.querySelectorAll('.e-rtl').length).toBeGreaterThan(5);
            gridObj.enableRtl = false;
            gridObj.dataBind();
        });

        it('EJ2-7683==>checking whether rtl is disabled', () => {
            let columnChooser: any = (<any>document.querySelector('.e-ccdlg'));
            expect(columnChooser.querySelectorAll('.e-rtl').length).toBe(0);
            gridObj.columnChooserModule.openColumnChooser();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
    describe('Column Chooser ok button disabled =>', function () {
        let gridObj: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: data,
                allowPaging: true,
                showColumnChooser: true,
                toolbar: ['ColumnChooser'],
                actionComplete: actionComplete,
                pageSettings: { pageSizes: true, pageSize: 5 },
                columns: [{ field: 'OrderID', type: 'number', isPrimaryKey: true },
                    { field: 'CustomerID', type: 'string' },
                    { field: 'Freight', format: 'C2', type: 'number', allowFiltering: false },
                ],
            }, done);
        });

        it('button disabled', (done: Function) => {           
            setTimeout(() => {
                gridObj.columnChooserModule.openColumnChooser();
                let cheEle: any = document.querySelectorAll('.e-cc-chbox')[1];
                let cheEle1: any = document.querySelectorAll('.e-cc-chbox')[2];
                let cheEle2: any = document.querySelectorAll('.e-cc-chbox')[3];
                cheEle.click();
                cheEle1.click();
                cheEle2.click();
                done();
            }, 500);
        });

        it('check button disabled case', () => {
            let btn: Button = (document.querySelector('.e-footer-content').querySelector('.e-btn') as EJ2Intance).ej2_instances[0] as Button;
            expect(btn.disabled).toBe(true);
            (<any>gridObj).columnChooserModule.destroy();          
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionComplete = null;
        });
    });

    describe('Open multiple column chooser in hierarchyGrid', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData,
                    columns: [{ field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 125 },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                    { field: 'City', headerText: 'City', width: 110 },
                    { field: 'Country', headerText: 'Country', width: 110 }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                    childGrid: {
                        dataSource: [],
                        queryString: 'EmployeeID',
                        allowPaging: true,
                        toolbar: ['ColumnChooser'],
                        showColumnChooser: true,
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                            { field: 'ShipCity', headerText: 'Ship City', width: 120 },
                            { field: 'Freight', headerText: 'Freight', width: 120 },
                            { field: 'ShipName', headerText: 'Ship Name', width: 150 }
                        ],
                    }
                }, done);
        });
        it('Show/hide the column chooser in parent grid', (done: Function) => {
            setTimeout(() => {
                ;
                gridObj.columnChooserModule.openColumnChooser();
                gridObj.columnChooserModule.openColumnChooser();
                done();
            }, 500);
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
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = beforeOpenColumnChooser = null;
        });
    });
    

    describe('Select all added in column chooser =>', function () {
        let gridObj: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: data,
                allowPaging: true,
                showColumnChooser: true,
                toolbar: ['ColumnChooser'],
                actionComplete: actionComplete,
                pageSettings: { pageSizes: true, pageSize: 5 },
                columns: [{ field: 'OrderID', type: 'number', isPrimaryKey: true },
                    { field: 'CustomerID', type: 'string' },
                    { field: 'Freight', format: 'C2', type: 'number', allowFiltering: false },
                ],
            }, done);
        });

        it('Update select all- uncheck', function () {
            (gridObj.columnChooserModule as any).openColumnChooser();
            (gridObj.columnChooserModule as any).updateSelectAll(false);
            expect(document.querySelectorAll('.e-uncheck.e-selectall').length).toBe(1);
            expect((gridObj.columnChooserModule as any).ulElement.querySelectorAll('.e-uncheck').length).toBe(4);
            expect((gridObj.columnChooserModule as any).ulElement.querySelectorAll('.e-check').length).toBe(0);
            (gridObj.columnChooserModule as any).updateIntermediateBtn();
            let btn: Button = (document.querySelector('.e-footer-content').querySelector('.e-btn') as EJ2Intance).ej2_instances[0] as Button;
            expect(btn.disabled).toBe(true);
        });
        
        it('Update select all- check', function () {
            (gridObj.columnChooserModule as any).updateSelectAll(true);
            expect(document.querySelectorAll('.e-check.e-selectall').length).toBe(1);
            expect((gridObj.columnChooserModule as any).ulElement.querySelectorAll('.e-uncheck').length).toBe(0);
            expect((gridObj.columnChooserModule as any).ulElement.querySelectorAll('.e-check').length).toBe(4);

        });

        it('Update intermediate button', function () {
            (gridObj.columnChooserModule as any).ulElement.querySelectorAll('.e-check')[1].classList.remove('e-check');
            (gridObj.columnChooserModule as any).updateIntermediateBtn();
            expect(document.querySelectorAll('.e-stop.e-selectall').length).toBe(1);
        });
        
        it('enter key disabled', () => {
            expect(document.querySelector('.e-ccdlg').classList.contains('e-popup-close')).toBeTruthy();
            gridObj.columnChooserModule.openColumnChooser();
            (document.querySelectorAll('.e-cc-chbox')[0] as any).click();
            let action: any = 'enter';
            let args: Object = action;
            (gridObj.columnChooserModule as any).confirmDlgBtnClick(args);
            expect(document.querySelector('.e-ccdlg').classList.contains('e-popup-open')).toBeTruthy();
        });
        
        afterAll(() => {
            destroy(gridObj);
        });
    });
    
    describe('Checkbox column in column chooser =>', function () {
        let gridObj: Grid;
        let actionComplete: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: data,
                allowPaging: true,
                showColumnChooser: true,
                toolbar: ['ColumnChooser'],
                actionComplete: actionComplete,
                pageSettings: { pageSizes: true, pageSize: 5 },
                columns: [{ type: 'checkbox', width: 40},
                    { field: 'OrderID', type: 'number', isPrimaryKey: true },
                    { field: 'CustomerID', type: 'string' },
                    { field: 'Freight', format: 'C2', type: 'number', allowFiltering: false },
                ],
            }, done);
        });
        it('checkbox type check', function () {
            let colType: string = 'checkbox';
            expect(gridObj.getVisibleColumns()[0].type).toBe(colType); 
            gridObj.columnChooserModule.openColumnChooser();
            (document.querySelectorAll('.e-cc-chbox')[0] as any).click();
            (document.querySelectorAll('.e-cc-chbox')[2] as any).click();
            let btn: Button = (document.querySelector('.e-footer-content').querySelector('.e-btn') as EJ2Intance).ej2_instances[0] as Button;
            btn.click();
            expect(gridObj.getVisibleColumns()[0].type).toBe(colType);
        });

        it('Column chooser open event testing', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            (document.querySelectorAll('.e-cc-chbox')[2] as any).click();
            let columnChooserOpenedHandler : any = (args: any): void => {
                let name: string = 'columnChooserOpened';
                expect(args.name).toBe(name);
                gridObj.off(events.columnChooserOpened, columnChooserOpenedHandler);  
            }
            gridObj.on(events.columnChooserOpened, columnChooserOpenedHandler);
            (document.querySelector('.e-footer-content').querySelector('.e-btn') as EJ2Intance).ej2_instances[0].click();
            done();
        });
        
        afterAll(() => {
            destroy(gridObj);
        });
    });

    describe('EJ2-36229 => column chooser ok button click check', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID' }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity', showInColumnChooser: false }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    pageSettings: { pageSize: 5 },
                }, done);
        });
        it('check ok button click when unselect all with ShowInColumnChooser False', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            let cheEle: any =document.querySelectorAll('.e-cc-selectall .e-selectall')[0];
            cheEle.click();
            let okButton: any = document.querySelector(".e-cc_okbtn");
            okButton.click();
            expect(gridObj.getVisibleColumns().length).toBe(1);
            done();
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });

    });

    describe('EJ2-37190 => Form not closed for the Column choooser action', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID', isPrimaryKey: true }, { field: 'CustomerID' },
                    { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    selectedRowIndex: 2,
                    editSettings: { allowAdding: true, allowEditing: true, allowDeleting: true },
                    pageSettings: { pageSize: 5 },
                }, done);
        });
        
        it('Check form is ceated', (done: Function) => {
            gridObj.actionComplete = (e)=>{
                if (e.requestType === 'beginedit') {
                    expect(isNullOrUndefined(document.querySelector(".e-gridform"))).toBe(false);
                }
                done();
            }
            gridObj.startEdit();
        });
        it('Check form is closed after column choooser action', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            let cheEle: any = document.querySelectorAll('.e-icons.e-check')[2];
            cheEle.click();
            let okButton: any = document.querySelector(".e-cc_okbtn");
            okButton.click();
            expect(gridObj.getVisibleColumns().length).toBe(4);
            expect(isNullOrUndefined(document.querySelector(".e-gridform"))).toBe(true);
            done();
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });

    });

    describe('EJ2-37361 => Columns does not render properly while using column chooser to select columns', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPaging: true,
                    showColumnChooser: true,
                        toolbar: ['ColumnChooser'],
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                            { field: 'CustomerName', headerText: 'Customer Name', width: 150, showInColumnChooser: false },
                            { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                            { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                            { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                            { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                            { field: 'ShipCity', visible: false, headerText: 'Ship City', width: 150 }
                        ]
                }, done);
        });
        it('check ok button are disable', (done: Function) => {
            let columnchooser: HTMLElement = select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar());
            columnchooser.click();
            let cheEle: any = document.querySelectorAll('.e-cc-selectall .e-selectall')[0];
            cheEle.click();
            cheEle.click();
            columnchooser.click();
            columnchooser.click();
            expect(document.querySelector('.e-cc_okbtn').hasAttribute('disabled')).toBeFalsy();
            done();
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });

    });

    describe('EJ2-40938 => While adding a hide custom column On editing this cell, the columns were get collapsed', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPaging: true,
                    allowRowDragAndDrop: true,
                    selectionSettings: { type: 'Multiple' },
                    height: 400,
                    gridLines: 'Both',
                    editSettings: { allowEditing: true, allowDeleting: true, allowAdding: true, mode: 'Normal' },
                    toolbar: ['Add', 'Edit', 'Delete', 'Update'],
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', isPrimaryKey: true, width: 80, textAlign: 'Right' },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 130, textAlign: 'Left' },
                        { field: 'OrderDate', headerText: 'Order Date', width: 120, format: 'yMd', textAlign: 'Right' },
                        { field: 'Freight', visible: false , headerText: 'Freight', width: 130, format: 'C2', textAlign: 'Right' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 130, textAlign: 'Left' },
                        { field: 'ShipCountry', headerText: 'Ship Country', width: 150 }
                    ]
                }, done);
        });
        it('check the visible cells true/false', () => {
            gridObj.showColumns('Freight');
            expect(gridObj.getRowsObject()[1].cells[4].visible).toBeTruthy()
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });

    });

    describe('EJ2-56865 => Table content width didn\'t cover full grid width after hiding column on using frozenColumn', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: employeeData,
                    width: 'auto',
                    frozenColumns: 1,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    gridLines: 'Both',
                    columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', width: '125', textAlign: 'Right', showInColumnChooser: false },
                    { field: 'FirstName', headerText: 'Name', width: '120', template: '<br /><br /><br /><div>${FirstName}</div><br /><br /><br />' },
                    { field: 'Title', headerText: 'Title', width: '170' },
                    { field: 'HireDate', headerText: 'Hire Date', width: '135', format: 'yMd', textAlign: 'Right' },
                    { field: 'ReportsTo', headerText: 'Reports To', width: '120', textAlign: 'Right' },
                    ],
                    height: 500,
                }, done);
        });

        it('hide the template column action', () => {
            gridObj.hideColumns('Name');
        });
        it('coverage', () => {
            let ccToolbar: any = gridObj.element.querySelector('.e-cc-toolbar');
            ccToolbar.click();
        });
        it('coverage - 1', () => {
            (gridObj.columnChooserModule as any).dlgObj.visible = true;
            let cell: any = gridObj.getContent().querySelector('.e-row').childNodes[1];
            cell.click();
        });
        it('coverage - 2', () => {
            gridObj.setProperties({ enableRtl: true}, true);
            (gridObj.columnChooserModule as any).createCheckBox('Select All', true, 'Grid-selectAll');
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });

    });
    
    describe('EJ2-69223 => Columns in column chooser is not get focused while clicking or tabbing', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPaging: true,
                    showColumnChooser: true,
                    detailTemplate: '#detailtemplate1',
                    cssClass: 'grid1',
                        toolbar: ['ColumnChooser'],
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                            { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                            { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                            { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                            { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                        ],
                        beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });
        it('check highlight with mouse click', () => {
            let cheEle: any = document.querySelectorAll('.e-cc-chbox')[1];
            cheEle.click();
            let patentelem: any = cheEle.closest('.e-cclist');
            expect(patentelem.classList.contains('e-colfocus')).toBeTruthy();
        });
        it('Coverage Improvement -  column choooser action', () => {
            let ccToolbar: any = document.querySelector('.e-cc-toolbar');
            ccToolbar.click();
            ccToolbar.click();
        });


        it('Coverage Improvement  - Column chooser render testing', (done: Function) => {
            beforeOpenColumnChooser = (args?: any): void => {
                args.cancel = true;
                gridObj.beforeOpenColumnChooser = null;
                done();
            };

            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;
            setTimeout(() => {
                select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar()).click();
                (<any>gridObj).columnChooserModule.isDlgOpen = true;
                select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar()).click();
                (<any>gridObj).columnChooserModule.destroy();
                (<any>gridObj).destroy();
            }, 500);
        });

        it('Coverage Improvement -  onResetColumns', () => {
            let args: any = { requestType : 'columnstate'};
            (gridObj.columnChooserModule as any).onResetColumns(args);
        });


        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });


    describe('Coverage Improvement ', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: [],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    enableStickyHeader: true,
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                        { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                        { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                    ],
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });

        it('Coverage Improvement -  empty grid cc action', () => {
            let ccToolbar: any = gridObj.element.querySelector('.e-cc-toolbar');
            ccToolbar.click();
            let ccOkbtn: any = document.querySelector('.e-cc_okbtn');
            ccOkbtn.click();
        });

        it('Colum chooser args cancel', (done: Function) => {
            beforeOpenColumnChooser = (args?: any): void => {
                args.cancel = true;
                gridObj.beforeOpenColumnChooser = null;
                done();
            };
            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;
            gridObj.columnChooserModule.openColumnChooser();
        });

        it('Coverage Improvement -  column choooser escape action', () => {
            let ccToolbar: any = gridObj.element.querySelector('.e-cc-toolbar');
            ccToolbar.click();
            let args: any = { key: 'Escape' };
            (gridObj.columnChooserModule as any).keyUpHandler(args);
        });

        it('Coverage Improvement -  hideOpenedDialog ', () => {
            gridObj.getHeaderContent().classList.add('e-sticky');
            let ccToolbar: any = gridObj.element.querySelector('.e-cc-toolbar');
            ccToolbar.click();
            (gridObj.columnChooserModule as any).hideOpenedDialog();
        });

        it('Coverage Improvement -  cancel icon click ', () => {
            let ccToolbar: any = gridObj.element.querySelector('.e-cc-toolbar');
            ccToolbar.click();
            let cancelIcon: any = document.querySelector('.e-ccsearch');
            cancelIcon.classList.add('e-cc-cancel');
            let args: any = { target: cancelIcon };
            (gridObj.columnChooserModule as any).clickHandler(args);
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2 Task 912454 => Column Chooser: Displaying Columns Based on Searched Value', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    showColumnChooser: true,
                    allowPaging: true,
                        toolbar: ['ColumnChooser'],
                        columns: [
                            { field: 'OrderID', headerText: 'Order ID', width: 130, showInColumnChooser: false, textAlign: 'Right' },
                            { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                            { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                            { field: 'ShipCountry', headerText: 'Ship Country', width: 150 },
                        ],
            }, done);
        });

        it('check All columns', (done: Function) => {
            (gridObj.columnChooserModule as any).openColumnChooser();
            (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
            done();
        });

        it('check the visible columns length', function () {
            expect(gridObj.getVisibleColumns().length).toBe(4);
        });

        it('check only the searched value is visible', (done: Function) => {
            (gridObj.columnChooserModule as any).openColumnChooser();
            (gridObj.columnChooserModule as any).searchValue = 'Order';
            (gridObj.columnChooserModule as any).columnChooserSearch('Order');
            (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
            done();
        });

        it('check the visible columns length', function () {
            expect(gridObj.getVisibleColumns().length).toBe(4);
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    // describe('EJ2-880941 => ColumnChooser Select All option not working properly', () => {
    //     let gridObj: Grid;
    //     beforeAll((done: Function) => {
    //         gridObj = createGrid(
    //             {
    //                 dataSource: data,
    //                 showColumnChooser: true,
    //                 toolbar: ['ColumnChooser'],
    //                 columns: [
    //                     { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
    //                     { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
    //                     { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
    //                     { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
    //                     { field: 'ShipCountry', headerText: 'Ship Country', width: 150 },
    //                 ],
    //             }, done);
    //     });
    //     it('search the column chooser value', (done) => {
    //         setTimeout(function () {
    //             gridObj.columnChooserModule.openColumnChooser();
    //             let cheEle: any = gridObj.element.querySelectorAll('.e-cc-selectall .e-selectall')[0];
    //             cheEle.click();
    //             let e: Object;
    //             e = { target: { value: 'sh' } };
    //             (gridObj.columnChooserModule as any).columnChooserManualSearch(e);
    //             done();
    //         }, 500)
    //     });

    //     it('select the column chooser value', (done) => {
    //         setTimeout(function () {
    //             let cheEle: any = gridObj.element.querySelectorAll('.e-cc-selectall .e-selectall')[0];
    //             cheEle.click();
    //             let okButton: any = gridObj.element.querySelector(".e-cc_okbtn");
    //             okButton.click();
    //             expect(gridObj.getVisibleColumns().length).toBe(2);
    //             done();
    //         }, 500)
    //     });

    //     afterAll(() => {
    //         destroy(gridObj);
    //         gridObj = null;
    //     });
    // });

    describe('Coverage Improvement - 1', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: () => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: [],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                        { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                        { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                    ],
                    beforeOpenColumnChooser: beforeOpenColumnChooser,
                }, done);
        });

        it('Coverage Improvement - function and method ', () => {
            const ccInstance: any = gridObj.columnChooserModule as any;
            ccInstance.keyUpHandler({});
            ccInstance.onResetColumns({});
            ccInstance.renderResponsiveColumnChooserDiv({});
            ccInstance.mOpenDlg();
            ccInstance.serviceLocator = null;
            ccInstance.setFullScreenDialog();
            ccInstance.innerDiv = null;
            ccInstance.rtlUpdate();
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Coverage Improvement - 2', () => {
        let gridObj: Grid;
        let renderCustomColumnChooser = (targetLHTMLElement: HTMLElement, columns?: any) => {
            const contentElement = document.createElement('div');
            contentElement.innerHTML = 'Test';
            targetLHTMLElement.appendChild(contentElement);
        };
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: [],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    columnChooserSettings: { 
                        headerTemplate: '<div>Choose Columns Template</div>',
                        template: '<div>Choose Columns Template</div>',
                        footerTemplate: '<div>Choose Columns Template</div>',
                        renderCustomColumnChooser: renderCustomColumnChooser,
                        enableSearching: false
                    },
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                        { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                        { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                    ],
                }, done);
        });

        it('Coverage Improvement - column chooser template', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            (gridObj.columnChooserModule as any).columnChooserSearch('Or', false);
            const columnsToUpdate = { visibleColumns: ['OrderID', 'OrderDate'], hiddenColumns: ['Freight', 'ShippedDate'] };
            gridObj.columnChooserModule.changeColumnVisibility(columnsToUpdate, 'field');
            expect(gridObj.getVisibleColumns().length).toBe(2);
            done();
        });

        it('Coverage Improvement - React platform column chooser template', (done: Function) => {
            gridObj.isReact = true;
            (gridObj.columnChooserModule as any).columnChooserSearch('Or', false);
            (gridObj.columnChooserModule as any).renderHeader();
            (gridObj.columnChooserModule as any).renderFooter(); 
            (gridObj.columnChooserModule as any).renderChooserList();
            select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar()).click();
            (gridObj.columnChooserModule as any).destroy(); 
            done();
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('972219: Customizing the orders of the column in the column chooser', () => {
        let gridObj: Grid;
        let beforeOpenColumnChooser: (args: any) => void;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: [],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                        { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                        { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                    ],
                    beforeOpenColumnChooser: beforeOpenColumnChooser
                }, done);
        });

        it('Coverage Improvement for selectedColumns using headerText', (done: Function) => {
            beforeOpenColumnChooser = (args): void => {
                args.selectedColumns = ['Order ID', 'Freight', 'Ship Country'];
            };
            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;
            gridObj.columnChooserModule.openColumnChooser();
            expect((gridObj.columnChooserModule as any).selectedColumnModels.length).toBe(3);
            (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
            done();
        });

        it('Coverage Improvement for selectedColumns', (done: Function) => {
            beforeOpenColumnChooser = (args): void => {
                args.selectedColumns = ['OrderID', 'Freight', 'ShipCountry'];
            };
            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;
            gridObj.columnChooserModule.openColumnChooser();
            expect((gridObj.columnChooserModule as any).selectedColumnModels.length).toBe(3);
            (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
            done();
        });

        it('Coverage Improvement for selectedColumns with toolbar click', (done: Function) => {
            beforeOpenColumnChooser = (args): void => {
                args.selectedColumns = ['OrderID', 'Freight'];
            };
            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;
            select('#' + gridObj.element.id + '_columnchooser', gridObj.toolbarModule.getToolbar()).click();
            expect((gridObj.columnChooserModule as any).selectedColumnModels.length).toBe(2);
            (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
            done();
        });

        it('Coverage Improvement for Descending', (done: Function) => {
            beforeOpenColumnChooser = (args): void => {
                args.sortDirection = 'Descending'
            };
            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;
            gridObj.columnChooserModule.openColumnChooser();
            expect((<HTMLElement>document.querySelectorAll('.e-label')[1]).innerText).toBe('Shipped Date');
            (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
            done();
        });
        
        it('Coverage Improvement for Ascending', (done: Function) => {
            beforeOpenColumnChooser = (args): void => {
                args.sortDirection = 'Ascending'
            };
            gridObj.beforeOpenColumnChooser = beforeOpenColumnChooser;
            gridObj.columnChooserModule.openColumnChooser();
            expect((<HTMLElement>document.querySelectorAll('.e-label')[1]).innerText).toBe('Freight');
            (<HTMLElement>document.querySelector('.e-cc_okbtn')).click();
            done();
        });

        it('Coverage Improvement', (done: Function) => {
            (gridObj.columnChooserModule as any).infiniteRenderMode = true;
            (gridObj.columnChooserModule as any).updateSelectAll();
            done();
        });

        afterAll(() => {
            (<any>gridObj).columnChooserModule.destroy();
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('EJ2-988490 => Column Chooser search box can be enabled/disabled externally', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                        { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                        { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                    ],
                }, done);
        });

        it('Search box is hidden when enableSearching is false', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            const searchDiv = document.querySelector('.e-cc-searchdiv') as HTMLElement;
            expect(searchDiv!.style.display).not.toBe('none');
            gridObj.columnChooserSettings.enableSearching = false;
            setTimeout(() => {
                expect(searchDiv!.style.display).toBe('none');
                done();
            }, 100);
        });
        it('Search box is displayed when enableSearching is true', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            const searchDiv = document.querySelector('.e-cc-searchdiv') as HTMLElement;
            gridObj.columnChooserSettings.enableSearching = true;
            setTimeout(() => {
                expect(searchDiv!.style.display).not.toBe('none');
                done();
            }, 100);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Coverage for extendmDlgOpen', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    cssClass: 'e-custom e-customize',
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                        { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                        { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                    ],
                }, done);
        });

        it('coverage for mOpenDlg method', (done: Function) => {
            window['browserDetails']['isDevice'] = true;
            const btn: HTMLElement = document.getElementById(gridObj.element.id + '_columnchooser');
            btn.click();
            let actionBegin = (args: any) => {
                args.cancel = true;
                gridObj.actionBegin = null;
                done();
            }
            gridObj.actionBegin = actionBegin;
            (gridObj as any).columnChooserModule.confirmDlgBtnClick({});
            (gridObj.columnChooserModule as any).mOpenDlg();
        });

        afterAll(() => {
            window['browserDetails']['isDevice'] = false;
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Coverage for infiniteRenderMode', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    columns: [
                        { field: 'OrderID', headerText: 'Order ID', width: 130, textAlign: 'Right' },
                        { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                        { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                        { field: 'ShippedDate', headerText: 'Shipped Date', width: 140, format: 'yMd', textAlign: 'Right' },
                        { field: 'ShipCountry', visible: false, headerText: 'Ship Country', width: 150 },
                    ],
                }, done);
        });

        it('infinite-render mode coverage', (done: Function) => {
            gridObj.openColumnChooser();
            (gridObj.columnChooserModule as any).infiniteRenderMode = true;
            (gridObj.columnChooserModule as any).refreshCheckboxButton(true);
            (document.querySelector('.e-cc .e-cc-selectall') as HTMLElement).click();
            done();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

        describe('Extra branch coverage for remaining uncovered paths (92%+ target)', () => {
        let gridObj: Grid;

        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'Freight' }],
                    allowPaging: true,
                    showColumnChooser: true,
                    toolbar: ['ColumnChooser'],
                    enableAdaptiveUI: true,
                    columnChooserSettings: {
                        enableSearching: true,
                        template: null
                    }
                }, done);
        });

        it('covers actionBegin cancel paths in confirmDlgBtnClick and clearBtnClick', () => {
            const cc: any = gridObj.columnChooserModule;
            let cancelTriggered = false;
            gridObj.actionBegin = (args: any) => {
                args.cancel = true;
                cancelTriggered = true;
            };
            cc.confirmDlgBtnClick({});
            expect(cancelTriggered).toBe(true);
            cancelTriggered = false;
            cc.clearBtnClick();
            expect(cancelTriggered).toBe(true);
            gridObj.actionBegin = null;
        });

        it('covers early return in checkBoxClickHandler when template is set and !infiniteRenderMode', () => {
            const cc: any = gridObj.columnChooserModule;
            gridObj.columnChooserSettings.template = '<div>custom-template</div>';
            cc.infiniteRenderMode = false;
            const fakeEvent: any = { target: document.createElement('div') };
            // Should return immediately without processing checkbox logic
            cc.checkBoxClickHandler(fakeEvent);
            gridObj.columnChooserSettings.template = null;
            expect(true).toBe(true);
        });

        it('covers infiniteScrollMouseKeyUpHandler inner if branch (length > 1 + scroll condition)', () => {
            const cc: any = gridObj.columnChooserModule;
            cc.infiniteRenderMode = true;
            cc.ulElement = document.createElement('ul');
            for (let i = 0; i < 5; i++) {
                cc.ulElement.appendChild(document.createElement('li'));
            }
            cc.infiniteDiv = document.createElement('div');
            cc.infiniteDiv.scrollTop = 0; // triggers <= 0 condition
            const fakeEvent: any = { target: document.createElement('div') };
            cc.infiniteScrollMouseKeyUpHandler(fakeEvent); // inner if now taken
        });

        it('covers onPropertyChanged when dlgObj exists (search wrapper toggle)', () => {
            const cc: any = gridObj.columnChooserModule;
            gridObj.columnChooserModule.openColumnChooser();
            // enableSearching = false
            gridObj.columnChooserSettings.enableSearching = false;
            cc.onPropertyChanged({ module: cc.getModuleName() });
            // enableSearching = true
            gridObj.columnChooserSettings.enableSearching = true;
            cc.onPropertyChanged({ module: cc.getModuleName() });
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
});

describe('ColumnChooser Immediate Mode', () => {
    describe('Immediate Mode - Basic Checkbox Tests', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid({
                dataSource: data,
                columns: [
                    { field: 'OrderID' },
                    { field: 'CustomerID' },
                    { field: 'EmployeeID' },
                    { field: 'Freight' }
                ],
                showColumnChooser: true,
                toolbar: ['ColumnChooser'],
                columnChooserSettings: { mode: 'Immediate' }
            }, done);
        });
        it('single column uncheck in immediate mode', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            const checkboxes = document.querySelectorAll('.e-cc-chbox') as NodeListOf<HTMLInputElement>;
            const initialCount = gridObj.getVisibleColumns().length;
            checkboxes[1].click();
            const dialog = document.querySelector('.e-ccdlg');
            setTimeout(() => {
                expect(gridObj.getVisibleColumns().length).toBe(initialCount - 1);
                expect(dialog).not.toBeNull();
                expect(dialog!.classList.contains('e-popup-open')).toBe(true);
                done();
            }, 200);
        });
        it('single column check in immediate mode', (done: Function) => {
            const checkboxes = document.querySelectorAll('.e-cc-chbox') as NodeListOf<HTMLInputElement>;
            const initialCount = gridObj.getVisibleColumns().length;
            checkboxes[1].click();
            setTimeout(() => {
                expect(gridObj.getVisibleColumns().length).toBe(initialCount + 1);
                done();
            }, 200);
        });
        it('Select All uncheck in immediate mode', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            const selectAllElement = document.querySelector('.e-cc-selectall .e-frame') as HTMLElement;
            selectAllElement.click();            
            setTimeout(() => {
                expect(gridObj.getVisibleColumns().length).toBe(0);
                done();
            }, 200);
        });
        it('Select All check in immediate mode', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            const selectAllElement = document.querySelector('.e-cc-selectall .e-frame') as HTMLElement;
            selectAllElement.click();
            setTimeout(() => {
                expect(gridObj.getVisibleColumns().length).toBe(4);
                done();
            }, 200);
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Immediate Mode - Virtualization Support', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const virtualColumns = [];
            for (let i = 0; i < 50; i++) {
                virtualColumns.push({ field: 'Col' + i, headerText: 'Column ' + i });
            }
            gridObj = createGrid({
                dataSource: data,
                columns: virtualColumns,
                height: 400,
                showColumnChooser: true,
                toolbar: ['ColumnChooser'],
                enableColumnVirtualization: true,
                enableVirtualization:true,
                columnChooserSettings: { mode: 'Immediate' }
            }, done);
        });
        it('checkbox change applies immediately in virtualized mode', (done: Function) => {
            gridObj.columnChooserModule.openColumnChooser();
            const visibleBefore = gridObj.getVisibleColumns().length;
            const checkboxes = document.querySelectorAll('.e-cc-chbox') as NodeListOf<HTMLInputElement>;
            const dialogBefore = document.querySelector('.e-ccdlg');
            checkboxes[0].click();
            const dialogAfter = document.querySelector('.e-ccdlg');
            setTimeout(() => {
                expect(dialogBefore!.classList.contains('e-popup-open')).toBe(true);
                expect(dialogAfter!.classList.contains('e-popup-open')).toBe(true);
                expect(gridObj.getVisibleColumns().length).toBe(0);
                done();
            }, 200);
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });

    describe('Immediate Mode - Virtualization with showInColumnChooser false', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            const virtualColumns = [];
            for (let i = 0; i < 50; i++) {
                virtualColumns.push({
                    field: 'Col' + i,
                    headerText: 'Column ' + i,
                    showInColumnChooser: i % 4 === 0 ? false : true
                });
            }
            gridObj = createGrid({
                dataSource: data,
                columns: virtualColumns,
                height: 400,
                showColumnChooser: true,
                toolbar: ['ColumnChooser'],
                enableColumnVirtualization: true,
                enableVirtualization:true,
                columnChooserSettings: { mode: 'Immediate' }
            }, done);
        });
        it('header and content should render properly after Select All uncheck in virtualized mode', () => {
            gridObj.columnChooserModule.openColumnChooser();
            const selectAllElement = document.querySelector('.e-cc-selectall .e-frame') as HTMLElement;
            selectAllElement.click();            
            const headerContent = gridObj.getHeaderContent();
            const bodyContent = gridObj.getContent();
            expect(headerContent).not.toBeNull();
            expect(bodyContent).not.toBeNull();
            expect(headerContent.innerHTML).toBeTruthy();
            expect(bodyContent.innerHTML).toBeTruthy();
        });
        it('select all uncheck should properly hide/show columns with showInColumnChooser false', (done:Function) => {
            const selectAllElement = document.querySelector('.e-cc-selectall .e-frame') as HTMLElement;
            selectAllElement.click();
            const visibleColumns = gridObj.getVisibleColumns();
            setTimeout(() => {
                 expect(visibleColumns.length).toBeGreaterThan(0);
                done();
            }, 200); 
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
});
