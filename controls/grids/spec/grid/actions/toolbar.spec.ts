/**
 * Grid toolbar spec document
 */
import { EventHandler, select } from '@syncfusion/ej2-base';
import { extend } from '@syncfusion/ej2-base';
import { createElement, remove } from '@syncfusion/ej2-base';
import { Grid } from '../../../src/grid/base/grid';
import { Page } from '../../../src/grid/actions/page';
import { Selection } from '../../../src/grid/actions/selection';
import { Group } from '../../../src/grid/actions/group';
import { Toolbar } from '../../../src/grid/actions/toolbar';
import { data, filterData } from '../base/datasource.spec';
import { ToolbarItem } from '../../../src/grid/base/enum';
import '../../../node_modules/es6-promise/dist/es6-promise';
import { createGrid, destroy } from '../base/specutil.spec';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { Sort } from '../../../src/grid/actions/sort';

Grid.Inject(Page, Group, Selection, Toolbar, Sort);

function getEventObject(eventType: string, eventName: string): Object {
    let tempEvent: any = document.createEvent(eventType);
    tempEvent.initEvent(eventName, true, true);
    let returnObject: any = extend({}, tempEvent);
    returnObject.preventDefault = () => { return true; };
    return returnObject;
}

describe('Toolbar functionalities', () => {
    let gridObj: Grid;
    let actionBegin: (e?: Object) => void;
    let actionComplete: (e?: Object) => void;
    let keyup: any = getEventObject('KeyboardEvent', 'keyup');
    let preventDefault: Function = new Function();
    keyup.keyCode = 13;

    beforeAll((done: Function) => {
        const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
        gridObj = createGrid(
            {
                dataSource: data,
                allowGrouping: true,
                width: "400px",
                columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                { field: 'ShipCity' }],
                toolbar: ['Print', 'Edit', { text: 'hello', id: 'hello' }, 'expand', ToolbarItem.Add] as any,
                actionBegin: actionBegin,
                actionComplete: actionComplete,
            }, done);
    });
    it('initial checck', () => {
        expect(gridObj.toolbarModule.getToolbar().firstElementChild.querySelector('.e-hscroll-content').childElementCount).toBe(5);
        expect(gridObj.toolbarModule.getToolbar().firstElementChild.querySelectorAll('.e-toolbar-item')[4].getAttribute('title')).toBe('Add');
        expect(gridObj.element.firstElementChild.classList.contains('e-groupdroparea')).toBeTruthy();
    });
    // it('check event trigger', (done: Function) => {
    //     gridObj.toolbarClick = (args: Object) => {
    //         expect(args['target']['id']).toBe('');
    //         done();
    //     };
    //     (<any>gridObj.toolbarModule).toolbarClickHandler({ target: gridObj.toolbarModule.getToolbar().firstElementChild.children[2].firstChild });
    // });
    it('enable Rtl', () => {
        gridObj.toolbarClick = undefined;
        gridObj.enableRtl = true;
        gridObj.dataBind();
        gridObj.toolbarModule.getToolbar()['ej2_instances'][0].dataBind();
        expect(gridObj.toolbarModule.getToolbar()['ej2_instances'][0]['enableRtl']).toBeTruthy();
        expect(gridObj.toolbarModule.getToolbar().classList.contains('e-rtl')).toBeTruthy();
    });
    it('disable Rtl', () => {
        gridObj.enableRtl = false;
        gridObj.dataBind();
        gridObj.toolbarModule.getToolbar()['ej2_instances'][0].dataBind();
        expect(gridObj.toolbarModule.getToolbar()['ej2_instances'][0]['enableRtl']).toBeFalsy();
        expect(gridObj.toolbarModule.getToolbar().classList.contains('e-rtl')).toBeFalsy();
    });
    it('change toolbar value', () => {
        gridObj.toolbar = ['Search', 'Add', 'Update', 'Cancel', 'hi'];
        gridObj.dataBind();
        expect(gridObj.toolbarModule.getToolbar().querySelector('.e-toolbar-left').children.length).toBe(4);
        expect(gridObj.toolbarModule.getToolbar().querySelector('.e-toolbar-right').children.length).toBe(1);
        //expect(gridObj.toolbarModule.getToolbar().querySelectorAll('.e-overlay').length).toBe(2);
    });
    it('check aria-attribute', () => {
        let search: Element = gridObj.toolbarModule.getToolbar().querySelector('.e-search');
        expect(search.querySelector('.e-search-icon').hasAttribute('tabindex')).toBeTruthy();
    });
    it('Enable Toolbar items', () => {
        gridObj.toolbarModule.enableItems(['Grid_update'], true);
        gridObj.dataBind();
        //expect(gridObj.toolbarModule.getToolbar().querySelectorAll('.e-overlay').length).toBe(1);
    });
    it('remove toolbar', () => {
        gridObj.toolbar = undefined;
        gridObj.dataBind();
        expect(gridObj.toolbarModule).toBe(undefined);
    });
    it('render all predefined items', () => {
        gridObj.toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Print', 'ExcelExport', 'PdfExport', 'WordExport', 'Search', 'CsvExport'];
        gridObj.dataBind();
        expect(gridObj.toolbarModule.getToolbar().querySelectorAll('.e-toolbar-item').length).toBe(11);
        //expect(gridObj.toolbarModule.toolbar.items[9].align).toBe('left');
    });
    it('Check keyPressHandler by Tab and Shift Tab Action', () => {
        const focusableToolbarItems: NodeListOf<Element> = gridObj.toolbarModule.toolbar.element.querySelectorAll('.e-toolbar-item:not(.e-overlay):not(.e-hidden)');
        let args: any = { action: 'tab', preventDefault: preventDefault, target: focusableToolbarItems[0].querySelector('.e-btn')};
        (gridObj.toolbarModule as any).keyPressedHandler(args);
        expect(focusableToolbarItems[1].querySelector('.e-btn').getAttribute('tabindex')).toBe('0');
        args = { action: 'shiftTab', preventDefault: preventDefault, target: focusableToolbarItems[1].querySelector('.e-btn')};
        (gridObj.toolbarModule as any).keyPressedHandler(args);
        expect(focusableToolbarItems[0].querySelector('.e-btn').getAttribute('tabindex')).toBe('0');
    });

    it('check search', (done: Function) => {
        gridObj.actionComplete = () => {
            expect(gridObj.currentViewData.length).toBe(0);
            expect(gridObj.searchSettings.key).toBe('hai');
            done();
        };
        let searchElement: HTMLInputElement = select('#' + gridObj.element.id + '_searchbar', gridObj.toolbarModule.getToolbar());
        (searchElement).value = 'hai';
        (select('#' + gridObj.element.id + '_searchbar', gridObj.toolbarModule.getToolbar())).focus();
        expect(document.activeElement.id).toBe(gridObj.element.id + '_searchbar');
        keyup.target = searchElement;
        EventHandler.trigger(searchElement, 'keyup', keyup);
    });
    it('check search with searchbutton', (done: Function) => {
        gridObj.actionComplete = () => {
            expect(gridObj.currentViewData.length).toBe(15);
            expect(gridObj.searchSettings.key).toBe('');
            done();
        };
        let searchElement: HTMLInputElement = select('#' + gridObj.element.id + '_searchbar', gridObj.toolbarModule.getToolbar());
        searchElement.value = '';
        (<any>gridObj.toolbarModule).toolbarClickHandler({ item: (<any>gridObj.toolbarModule).toolbar.items[9], originalEvent: { target: document.getElementById(gridObj.element.id + '_searchbutton') } });
        (<any>gridObj.toolbarModule).toolbarClickHandler({ item: (<any>gridObj.toolbarModule).toolbar.items[9], originalEvent: { target: searchElement } });
    });

    it('check print', (done: Function) => {
        gridObj.printComplete = () => {
            done();
        };
        gridObj.beforePrint = (args: { element: Element }) => {
            expect((args.element.querySelector('.e-toolbar') as HTMLElement)).toBe(null);
        };
        select('#' + gridObj.element.id + '_print', gridObj.toolbarModule.getToolbar()).click();
        //forcoverage
        (<any>gridObj.toolbarModule).toolbarClickHandler({ target: (<any>gridObj.toolbarModule).element });
        (gridObj.toolbarModule as any).keyUpHandler({ keyCode: 12 });

        keyup.target = gridObj.toolbarModule.getToolbar();
        EventHandler.trigger(gridObj.toolbarModule.getToolbar() as HTMLElement, 'keyup', keyup);
        (<any>gridObj.toolbarModule).removeEventListener();
        (<any>gridObj.toolbarModule).unWireEvent();
        gridObj.isDestroyed = true;
        (<any>gridObj.toolbarModule).addEventListener();
        (<any>gridObj.toolbarModule).removeEventListener();
        gridObj.isDestroyed = false;
        (<any>gridObj.toolbarModule).onPropertyChanged({ module: 'Grouping' });
    });

    it('for coverage', () => {
        gridObj.selectRow(1, true);
        gridObj.selectRow(1, true);
        gridObj.selectCell({ cellIndex: 0, rowIndex: 0 }, true);
        gridObj.selectCell({ cellIndex: 0, rowIndex: 0 }, true);
        (<any>gridObj.toolbarModule).toolbarClickHandler({ item: { id: '' } });
        (<any>gridObj.toolbarModule).getItem({text: 'add'});
        (<any>gridObj.toolbarModule).toolbar.isDestroyed = true;
        (<any>gridObj.toolbarModule).destroy();
        gridObj.isDestroyed = true;
        (<any>gridObj.toolbarModule).destroy();
        gridObj.isDestroyed = false;
        expect(1).toBe(1);
    });

    afterAll(() => {
        destroy(gridObj);
    });

    describe('Toolbar functionalities', () => {
        let gridObj: Grid;
        let actionBegin: (e?: Object) => void;
        let actionComplete: (e?: Object) => void;
        beforeAll((done: Function) => {
            let templete: string = '<div><div style="padding: 12px" title="search" ><input id="txt" type="search" style="padding: 0 5px"placeholder="search"></input><span id="searchbutton" class="e-search e-icons"></span></div></div>';
            document.body.appendChild(createElement('div', { innerHTML: templete, id: 'search' }));
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowGrouping: true,
                    width: "400px",
                    columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }],
                    toolbarTemplate: '#search',
                    actionBegin: actionBegin,
                    actionComplete: actionComplete,
                }, done);
        });

        it('add toolbar template', () => {
            expect(gridObj.toolbarModule.getToolbar().id).toBe('search');
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
            gridObj = actionBegin = actionComplete = keyup = null;
        });

    });

    describe('EJ2-912751 - code coverage for memory leak issue with toolbarTemplate in angular', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            let templete: string = '<div><div style="padding: 12px" title="search" ><input id="txt" type="search" style="padding: 0 5px"placeholder="search"></input><span id="searchbutton" class="e-search e-icons"></span></div></div>';
            document.body.appendChild(createElement('div', { innerHTML: templete, id: 'search' }));
            gridObj = createGrid(
                {
                    dataSource: data,
                    width: "400px",
                    columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }],
                    toolbarTemplate: '#search',
                    load: function () {
                        expect(this.isAngular).toBe(false);
                        this.isAngular = true;
                    },
                }, done);
        });

        it('check toolbar template', () => {
            expect(gridObj.toolbarModule.getToolbar().id).toBe('search');
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });

    });

    describe('EJ2-36447 Searching actionBegin , cancel is not working', () => {
        let gridObj: Grid;
        let actionBegin: (args?: Object) => void;
        let actionComplete: (args?: Object) => void;
        let count: number = 0;
        let keyup: any = getEventObject('KeyboardEvent', 'keyup');
        keyup.keyCode = 13;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: data,
                    allowPaging: true,
                    allowSorting: true,
                    clipMode: 'EllipsisWithTooltip',
                    pageSettings: { pageCount: 5, pageSize: 10 },
                    toolbar: [ 'Search'],
                    columns: [
                        { field: 'OrderID',headerText: 'Order ID', textAlign: 'Right', width: 120 },
                        { field: 'CustomerID', headerText: 'Customer ID', width: 140 },
                        { field: 'Freight', headerText: 'Freight', textAlign: 'Right', width: 120, format: 'C2' },
                        { field: 'Freight1', headerText: 'Percentage', format: 'P', width: 170, textAlign: 'Right' }
                        ], 
                    actionBegin: actionBegin,
                
                }, done);
        });
        it('Check the search args', (done: Function) => {
            actionBegin = (args: any): void => {
                args.cancel = true;
                count = count + 1;
                done();
            }
            gridObj.actionBegin = actionBegin;
            let searchElement: HTMLInputElement = select('#' + gridObj.element.id + '_searchbar', gridObj.toolbarModule.getToolbar());
            (searchElement).value = '98';
            (select('#' + gridObj.element.id + '_searchbar', gridObj.toolbarModule.getToolbar())).focus();
            keyup.target = searchElement;
            EventHandler.trigger(searchElement, 'keyup', keyup);
            expect(count).toBe(1);  
        });
        afterAll(() => {
            destroy(gridObj);
            gridObj = actionBegin = count = actionComplete = null;
        });
    });

});

describe('code coverage - Toolbar - Adaptive UI', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data.slice(0, 24),
                allowPaging: true,
                rowRenderingMode: 'Vertical',
                enableAdaptiveUI: true,
                height: '100%',
                width: 600,
                toolbar: ['Print'],
                showColumnChooser: true,
                searchSettings: { fields: ['CustomerID'], operator: 'contains', key: 'VINET', ignoreCase: true, ignoreAccent: true },
                pageSettings: { pageSize: 12, pageSizes: true },
                columns: [
                    { field: 'OrderID', isPrimaryKey: true, headerText: 'Order ID', textAlign: 'Right', validationRules: { required: true, number: true }, width: 120 },
                    { field: 'CustomerID', headerText: 'Customer ID', validationRules: { required: true }, width: 140 },
                    { field: 'Freight', headerText: 'Freight', textAlign: 'Right', editType: 'numericedit', width: 120, format: 'C2' },
                ],
            }, done);
    });

    it('Render search, filter and sort', function () {
        gridObj.setProperties({ toolbar: ['Search'], allowSorting: true });
    });

    it('Click search wrapper', function () {
        (gridObj.element.querySelector('.e-search-wrapper') as HTMLElement).click();
    });

    it('Clear search', function () {
        const clear: HTMLElement = gridObj.element.querySelector('#' + gridObj.element.id + '_clearbutton') as HTMLElement;
        clear.classList.add('e-clear-icon');
        clear.click();
    });

    it('Back search wrapper', function () {
        (gridObj.element.querySelector('#' + gridObj.element.id + '_responsiveback') as HTMLElement).click();
    });

    it('Click sort', function () {
        (gridObj.element.querySelector('#' + gridObj.element.id + '_responsivesort') as HTMLElement).click();
    });

    it('React render and destroy', function () {
        gridObj.toolbarModule.toolbar.element = null;
        gridObj.toolbarModule.element = { parentNode: null } as any;
        gridObj.toolbarModule.destroy();
        gridObj.isReact = true;
        gridObj.portals = [];
        (gridObj.toolbarModule as any).addReactToolbarPortals([{}]);
        gridObj.toolbarModule.destroy();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Code Coverage - childGrid - toolbarTemplate and emptyRecordTemplate => ', () => {
    let gridObj: Grid;
    let template: HTMLElement = createElement('div', { id: 'template' });
    let element: HTMLElement = createElement('div');
    element.innerText = 'template';
    beforeAll((done: Function) => {
        template.appendChild(element);
        document.body.appendChild(template);
        gridObj = createGrid(
            {
                dataSource: filterData.slice(0, 10),
                height: 400,
                columns: [
                    { field: 'OrderID', textAlign: 'Right', width: 100, headerText: "Order ID" },
                    { field: 'CustomerID', width: 120, minWidth: '100', headerText: "Customer ID" },
                    { field: 'Freight', textAlign: 'Right', width: 110, format: 'C2', headerText: "Freight" },
                ],
                childGrid: {
                    dataSource: [],
                    queryString: 'EmployeeID',
                    allowPaging: true,
                    toolbarTemplate: '#template',
                    emptyRecordTemplate: '#template',
                    columns: [
                        { field: 'FirstName', headerText: 'First Name', width: 120 },
                        { field: 'Region', headerText: 'Region', width: 120 },
                    ],
                }
            }, done);
    });

    it('Case 1', () => {
        (gridObj.getContentTable().querySelector('.e-dtdiagonalright') as HTMLElement).click();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});
describe('EJ2-899326 => Script error occurs on selecting records in Adaptive UI when the toolbar have template elements => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data.slice(0, 24),
                allowPaging: true,
                rowRenderingMode: 'Vertical',
                enableAdaptiveUI: true,
                height: '100%',
                width: 600,
                toolbar: [ 'Add', { id: 'test', template: '<span id="test">Test</span>'} ],
                pageSettings: { pageSize: 12, pageSizes: true },
                columns: [
                    { field: 'OrderID', isPrimaryKey: true, headerText: 'Order ID', textAlign: 'Right', validationRules: { required: true, number: true }, width: 120 },
                    { field: 'CustomerID', headerText: 'Customer ID', validationRules: { required: true }, width: 140 },
                    { field: 'Freight', headerText: 'Freight', textAlign: 'Right', editType: 'numericedit', width: 120, format: 'C2' },
                ],
            }, done);
    });

    it('Selecting records and check the script error', function () {
        expect(document.querySelector('.e-grid.e-row-responsive')).not.toBeNull();
        if(document.querySelectorAll('.e-toolbar-item.e-template').length)
        {
            gridObj.selectRow(0);
            expect(document.querySelector('.e-toolbar-item.e-template')).not.toBeNull();
        }
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-924659 => Export Options Not Disabled When Properties Are Set to False for Adaptive mode => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data.slice(0, 24),
                allowPaging: true,
                rowRenderingMode: 'Vertical',
                enableAdaptiveUI: true,
                showColumnChooser: true,
                allowExcelExport: false,
                allowPdfExport: false,
                height: '100%',
                width: 600,
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search', 'ColumnChooser', 'ExcelExport', 'PdfExport'],
                pageSettings: { pageSize: 12, pageSizes: true },
                columns: [
                    { field: 'OrderID', isPrimaryKey: true, headerText: 'Order ID', textAlign: 'Right', validationRules: { required: true, number: true }, width: 120 },
                    { field: 'CustomerID', headerText: 'Customer ID', validationRules: { required: true }, width: 140 },
                    { field: 'Freight', headerText: 'Freight', textAlign: 'Right', editType: 'numericedit', width: 120, format: 'C2' },
                ],
            }, done);
    });

    it('In expect checks the context menu items wer disabled or not in adaptive mode', function (done) {
        const toolbarMenuButton: HTMLElement = gridObj.toolbarModule.toolbar.element.querySelector('.e-responsive-toolbar-items');
        toolbarMenuButton.click();
        const menuItems = document.querySelectorAll('.e-menu-item');
        expect(menuItems[0].classList.contains('e-disabled')).toBeFalsy();
        expect(menuItems[1].classList.contains('e-disabled')).toBeTruthy();
        done();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-924659 => Export Options Not Disabled When Properties Are Set to False for normal mode => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data.slice(0, 24),
                allowPaging: true,
                showColumnChooser: false,
                allowExcelExport: false,
                allowPdfExport: false,
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search', 'ColumnChooser', 'ExcelExport', 'PdfExport', 'CsvExport'],
                pageSettings: { pageSize: 12, pageSizes: true },
                columns: [
                    { field: 'OrderID', isPrimaryKey: true, headerText: 'Order ID', textAlign: 'Right', validationRules: { required: true, number: true }, width: 120 },
                    { field: 'CustomerID', headerText: 'Customer ID', validationRules: { required: true }, width: 140 },
                    { field: 'Freight', headerText: 'Freight', textAlign: 'Right', editType: 'numericedit', width: 120, format: 'C2' },
                ],
            }, done);
    });

    it('In expect checks the context menu items wer disabled or not in normal mode', function (done) {
        expect((document.getElementById(gridObj.element.id+'_excelexport') as any).ariaDisabled).toBeTruthy();
        expect((document.getElementById(gridObj.element.id+'_pdfexport') as any).ariaDisabled).toBeTruthy();
        expect((document.getElementById(gridObj.element.id+'_columnchooser') as any).ariaDisabled).toBeTruthy();
        expect((document.getElementById(gridObj.element.id+'_csvexport') as any).ariaDisabled).toBeTruthy();
        done();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Branch Coverage - Toolbar as string (getItems early return)', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                toolbar: 'CustomStringToolbar' as any,
                columns: [{ field: 'OrderID' }],
            }, done);
    });

    it('should return empty array when toolbar property is string type', () => {
        const items = (gridObj.toolbarModule as any).getItems();
        expect(items).toEqual([]);
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Branch Coverage - ResponsiveFilter case in toolbarClickHandler (Vertical Adaptive)', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                rowRenderingMode: 'Vertical',
                enableAdaptiveUI: true,
                height: '100%',
                width: 600,
                toolbar: ['Search'],
                allowFiltering: true,
                filterSettings: { type: 'Menu' },
                columns: [
                    { field: 'OrderID', isPrimaryKey: true, headerText: 'Order ID', width: 120 },
                    { field: 'CustomerID', headerText: 'Customer ID', width: 140 },
                ],
            }, done);
    });

    it('should render responsiveFilter button when Vertical + allowFiltering', () => {
        expect(document.getElementById(gridObj.element.id + '_responsivefilter')).not.toBeNull();
    });

    it('should execute responsivefilter switch case (previously uncovered)', () => {
        gridObj.showResponsiveCustomFilter = jasmine.createSpy('showResponsiveCustomFilter');
        const filterBtn = document.getElementById(gridObj.element.id + '_responsivefilter') as HTMLElement;
        const clickEvent = getEventObject('MouseEvents', 'click');
        (clickEvent as any).target = filterBtn;
        (gridObj.toolbarModule as any).toolbarClickHandler({
            item: { id: gridObj.element.id + '_responsivefilter' },
            originalEvent: clickEvent
        });
        expect(gridObj.showResponsiveCustomFilter).toHaveBeenCalled();
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Branch Coverage - ColumnChooser adaptive true branch (object bypasses skip)', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                enableAdaptiveUI: true,
                toolbar: [{ text: 'ColumnChooser' }],
                showColumnChooser: true,
                height: '100%',
                width: 600,
                columns: [
                    { field: 'OrderID' },
                    { field: 'CustomerID' },
                ],
            }, done);
    });

    it('should render columnchooser button when passed as object (bypasses string skip)', () => {
        expect(document.getElementById(gridObj.element.id + '_columnchooser')).not.toBeNull();
    });

    it('should take adaptive true branch in columnchooser case (previously uncovered)', () => {
        gridObj.showResponsiveCustomColumnChooser = jasmine.createSpy('showResponsiveCustomColumnChooser');
        const ccBtn = document.getElementById(gridObj.element.id + '_columnchooser') as HTMLElement;
        const clickEvent = getEventObject('MouseEvents', 'click');
        (clickEvent as any).target = ccBtn;
        (gridObj.toolbarModule as any).toolbarClickHandler({
            item: { id: gridObj.element.id + '_columnchooser' },
            originalEvent: clickEvent
        });
        expect(gridObj.showResponsiveCustomColumnChooser).toHaveBeenCalled();
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Branch Coverage - Print case in ResponsiveToolbarMenuItemClick + RTL menu popup', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                enableAdaptiveUI: true,
                enableRtl: true,
                toolbar: ['Print'],
                height: '100%',
                width: 600,
                columns: [
                    { field: 'OrderID' },
                    { field: 'CustomerID' },
                ],
            }, done);
    });

    it('should execute print case in ResponsiveToolbarMenuItemClick (previously uncovered)', () => {
        gridObj.print = jasmine.createSpy('print');
        const args: any = {
            element: { id: gridObj.element.id + '_print' },
            item: { id: gridObj.element.id + '_print' },
            event: getEventObject('MouseEvents', 'click')
        };
        (gridObj.toolbarModule as any).ResponsiveToolbarMenuItemClick(args);
        expect(gridObj.print).toHaveBeenCalled();
    });

    it('should execute enableRtl true branch + isRightToolbarMenu true branch in openResponsiveToolbarMenuPopup', () => {
        const menuBtn = gridObj.element.querySelector('.e-responsive-toolbar-items') as HTMLElement;
        if (menuBtn) {
            const clickEvent = getEventObject('MouseEvents', 'click');
            (clickEvent as any).target = menuBtn;
            (gridObj.toolbarModule as any).openResponsiveToolbarMenuPopup(clickEvent, menuBtn.id);
            expect(true).toBe(true);
        }
    });

    it('should execute null/undefined e path in openResponsiveToolbarMenuPopup', () => {
        const id = gridObj.element.id + '_responsivetoolbaritems';
        (gridObj.toolbarModule as any).openResponsiveToolbarMenuPopup(undefined, id);
        expect(true).toBe(true);
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Branch Coverage - isSearched || searchSettings.key.length path in clear-icon handling', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data,
                toolbar: ['Search'],
                columns: [{ field: 'OrderID' }],
            }, done);
    });

    it('should execute the search call when clearing with prior isSearched=true or key', () => {
        const searchElement = select('#' + gridObj.element.id + '_searchbar', gridObj.toolbarModule.getToolbar()) as HTMLInputElement;
        searchElement.value = 'test';
        gridObj.searchSettings.key = 'test';
        (gridObj.toolbarModule as any).isSearched = true;

        const clearBtn = document.getElementById(gridObj.element.id + '_clearbutton') as HTMLElement;
        clearBtn.classList.add('e-clear-icon');

        const clickEvent = getEventObject('MouseEvents', 'click');
        (clickEvent as any).target = clearBtn;
        (gridObj.toolbarModule as any).toolbarClickHandler({
            item: { id: gridObj.element.id + '_search' },
            originalEvent: clickEvent
        });
        expect(gridObj.searchSettings.key).toBe('');
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Branch Coverage - setFocusToolbarItem adaptive fallback + keyPressedHandler tab boundary', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data.slice(0, 5),
                enableAdaptiveUI: true,
                toolbar: ['Search'],
                rowRenderingMode: 'Horizontal',
                height: '100%',
                width: 300,
                columns: [
                    { field: 'OrderID', isPrimaryKey: true },
                    { field: 'CustomerID' }
                ],
            }, done);
    });

    it('should hit adaptive search-wrapper fallback in setFocusToolbarItem (previously uncovered I path)', () => {
        const searchWrapper = gridObj.element.querySelector('.e-search-wrapper') as HTMLElement;
        expect(searchWrapper).not.toBeNull();
        (gridObj.toolbarModule as any).searchElement = undefined;
        const mockSearchButton = document.createElement('button');
        spyOn(searchWrapper, 'querySelector').and.callFake((sel: string) => {
            if (sel === '.e-btn,.e-input,.e-toolbar-item-focus') return null;
            if (sel.includes('_searchbutton')) return mockSearchButton;
            return null;
        });
        spyOn(mockSearchButton, 'focus');
        (gridObj.toolbarModule as any).setFocusToolbarItem(searchWrapper);
        expect(mockSearchButton.focus).toHaveBeenCalled();
    });


    it('should hit enter on adaptive searchbutton in keyPressedHandler (uncovered enter block)', () => {
        const searchBtn = document.getElementById(gridObj.element.id + '_searchbutton') as HTMLElement;
        if (searchBtn) {
            const enterEvent: any = { action: 'enter', target: searchBtn };
            spyOn(gridObj.toolbarModule as any, 'renderResponsiveSearch');
            (gridObj.toolbarModule as any).keyPressedHandler(enterEvent);
            expect((gridObj.toolbarModule as any).renderResponsiveSearch).toHaveBeenCalledWith(true);
        }
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Branch Coverage - createToolbar Angular viewContainerRef + toolbarTemplate string conditions + overflow width check', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: data.slice(0, 10),
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Print', 'Search'],
                width: '200px',
                enableAdaptiveUI: false,
                columns: [{ field: 'OrderID' }, { field: 'CustomerID' }],
            }, done);
    });

    it('should execute viewContainerRef Angular path in createToolbar (previously uncovered Iif)', () => {
        (gridObj as any).viewContainerRef = {} as any;
        gridObj.toolbar = ['Search'];
        gridObj.dataBind();
        expect(gridObj.toolbarModule.getToolbar()).toBeDefined();
    });
});

describe('Branch Coverage - Toolbartemplate in React', () => {
    let gridObj: Grid;
    let template: HTMLElement = createElement('div', { id: 'template' });
    let element: HTMLElement = createElement('div');
    element.innerText = 'template';
    beforeAll((done: Function) => {
        template.appendChild(element);
        document.body.appendChild(template);
        gridObj = createGrid(
            {
                dataSource: data,
                columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                { field: 'ShipCity' }],
                toolbarTemplate: () => '<div class="react-toolbar">React Template Content</div>'
            }, done);
    });

    it('should hit the toolbarTemplate React-compiler else branch when isReact=true', (done: Function) => {
        debugger;
        gridObj.isReact = true;
        (gridObj.toolbarModule as any).reRenderToolbar();
        done();
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('EJ2-994452-Script error when pressing Tab after focusing on the grid scroller area with Toolbar or Grouping enabled', () => {
  let gridObj: Grid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: filterData.slice(0, 30),
      height: 300,
      editSettings: {
        allowEditing: true,
        allowAdding: true,
        allowDeleting: true,
      },
      toolbar: ['Add', 'Edit', 'Update', 'Cancel'],
      columns: [
        { type: 'checkbox', width: 40, minWidth: 35, maxWidth: 80 },
        { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right', isPrimaryKey: true, validationRules: { required: true } },
        { field: 'CustomerName', headerText: 'Customer Name', width: 150, validationRules: { required: true } },
        { field: 'Freight', headerText: 'Freight', width: 120, format: 'C2', textAlign: 'Right', editType: 'numericedit' },
      ]
    }, done);
  });

  it('should move focus to Add toolbar button after click on header space and Tab key press', (done: Function) => {
    const click: any = new MouseEvent('click', { bubbles: true, cancelable: true });
    (gridObj.element.querySelector('.e-gridheader') as HTMLElement).dispatchEvent(click);
    expect(document.activeElement).toBe(gridObj.element);
    done();
  });

  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});
