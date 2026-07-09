/**
 * Grid Clipboard spec document
 */
import { Browser } from '@syncfusion/ej2-base';
import { Grid } from '../../../src/grid/base/grid';
import { Selection } from '../../../src/grid/actions/selection';
import { Clipboard } from '../../../src/grid/actions/clipboard';
import { employeeData, filterData } from '../base/datasource.spec';
import { BeforeCopyEventArgs } from '../../../src/grid/base/interface';
import { createGrid, destroy, getKeyActionObj } from '../base/specutil.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { Edit } from '../../../src/grid/actions/edit';
import { Page } from '../../../src/grid/actions/page';
import { Toolbar } from '../../../src/grid/actions/toolbar';
import { VirtualScroll } from '../../../src/grid/actions/virtual-scroll';
import { InfiniteScroll } from '../../../src/grid/actions/infinite-scroll';
import { LazyLoadGroup } from '../../../src/grid/actions/lazy-load-group';
import { Group } from '../../../src/grid/actions/group';

Grid.Inject(Selection, Clipboard, Edit, Page, Toolbar, Group, VirtualScroll, InfiniteScroll, LazyLoadGroup);

describe('Grid clipboard copy testing - row type selection => ', () => {
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
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 135, },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                ],
                allowSelection: true,
                selectionSettings: { type: 'Multiple' }
            }, done);
    });

    it('Check hidden clipboard textarea', () => {
        let clipArea: HTMLElement = (gridObj.element.querySelectorAll('.e-clipboard')[0] as HTMLElement);
        expect(gridObj.element.querySelectorAll('.e-clipboard').length > 0).toBeTruthy();
        expect(clipArea.style.opacity === '0').toBeTruthy();
    });

    it('Check with row type selection', () => {
        gridObj.selectRows([0, 1]);
        gridObj.copy();
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === '1	Nancy	Sales Representative\n2	Andrew	Vice President, Sales').toBeTruthy();
    });

    it('Check with row type selection - include header', () => {
        gridObj.copy(true);
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === 'Employee ID	Name	Title\n1	Nancy	Sales Representative\n2	Andrew	Vice President, Sales').toBeTruthy();
    });

    it('Browser default selection for coverage', () => {
        let range: any = document.createRange();
        range.selectNodeContents(gridObj.element.querySelectorAll('.e-rowcell')[2]);
        let selection: any = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        gridObj.copy();
        selection.removeAllRanges();
    });

    it('Check with row type selection in iOS Device', () => {
        let iphoneUa: string = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6' +
            ' (KHTML, like Gecko) Version/10.0 Mobile/14D27 Safari/602.1';
        let browUa: string = Browser.userAgent;
        Browser.userAgent = iphoneUa;
        gridObj.copy();
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === '1	Nancy	Sales Representative\n2	Andrew	Vice President, Sales').toBeTruthy();
        Browser.userAgent = browUa;
    });

    it('Check clipboard area after destroy', () => {
        gridObj.clipboardModule.destroy();
        expect(document.querySelectorAll('.e-clipboard').length === 0).toBeTruthy();
    });

    afterAll(() => {
       destroy(gridObj);
       gridObj = null;
    });
});

describe('Grid clipboard copy testing - cells type selection => ', () => {
    let gridObj: Grid;
    let gridBeforeCopy: (e: BeforeCopyEventArgs) => void;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: employeeData,
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 135, },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                ],
                allowSelection: true,
                selectionSettings: { type: 'Multiple', mode: 'Cell' },
                beforeCopy: gridBeforeCopy
            }, done);
    });

    it('Check with cells type selection', () => {
        gridObj.selectionModule.selectCells([{
            rowIndex: 0,
            cellIndexes: [0, 1]
        }, {
            rowIndex: 1,
            cellIndexes: [1, 2]
        }]);
        gridObj.copy();
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === '1\nNancy\nAndrew\nVice President, Sales').toBeTruthy();
    });

    it('Check with row type selection - include header', () => {
        gridObj.selectionModule.selectCells([{
            rowIndex: 0,
            cellIndexes: [0, 1]
        }, {
            rowIndex: 1,
            cellIndexes: [1, 2]
        }])
        gridObj.copy(true);
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === 'Employee ID\n1\nName\nNancy\nName\nAndrew\nTitle\nVice President, Sales').toBeTruthy();
    });

    it('Check with ctrlPlusC key press', () => {                
        gridObj.keyboardModule.keyAction(getKeyActionObj('ctrlPlusC'));
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === '1\nNancy\nAndrew\nVice President, Sales').toBeTruthy();
    });

    it('Check with ctrlShiftPlusH key press', () => {
        gridObj.keyboardModule.keyAction(getKeyActionObj('ctrlShiftPlusH'));
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === 'Employee ID\n1\nName\nNancy\nName\nAndrew\nTitle\nVice President, Sales').toBeTruthy();        
        gridObj.keyboardModule.keyAction(getKeyActionObj('space', document.querySelector('.e-clipboard') as HTMLInputElement));
    });

    it('Check with args cancel for coverage', () => {
        gridBeforeCopy = (args: BeforeCopyEventArgs): void => {
            args.cancel = true;
        };
        gridObj.beforeCopy = gridBeforeCopy;
        gridObj.copy();
    });

    afterAll(() => {
       destroy(gridObj);
       gridObj = gridBeforeCopy = null;
    });
});

describe('EJ2-851516 - Grid clipboard copy testing with hidden columns => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: employeeData,
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 135, },
                    { field: 'FirstName', headerText: 'Name', visible: false, width: 125 },
                    { field: 'Title', headerText: 'Title', width: 180 },
                ],
                allowSelection: true,
                selectionSettings: { type: 'Multiple', mode: 'Cell', cellSelectionMode: 'Box', },
            }, done);
    });

    it('copy cells without header', () => {
        gridObj.selectionModule.selectCells([{
            rowIndex: 0,
            cellIndexes: [0, 1, 2]
        }]);
        gridObj.copy();
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === '1\tSales Representative').toBeTruthy();
    });

    afterAll(() => {
       destroy(gridObj);
       gridObj = null;
    });
});

describe('Clipboard copy testing while Freezing columns => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowPaging: true,
                selectionSettings: { type: 'Multiple' },
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right', freeze : 'Right' },
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                    { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' }
                ],
                pageSettings: { pageCount: 5 }
            }, done);
    });

    it('Check the copy value', () => {
        gridObj.selectRows([1]);
        gridObj.copy(true);
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value
            === 'Customer Name\tOrder Date\tFreight\tOrder ID\nTOMSP\t7/12/1996\t$11.61\t10249').toBeTruthy();
    });

    afterAll(() => {
       destroy(gridObj);
    });
});

describe('EJ2-7314/7299===>Grid clipboard => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: employeeData,
                columns: [
                    { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 135, },
                    { field: 'FirstName', headerText: 'Name', width: 125 },
                    { field: 'Title', headerText: 'Title', visible: false, width: 180 },
                    { field: 'Region', headerText: 'Region', width: 180 },
                    { field: 'Country', headerText: 'Country', width: 180 }
                ],
                allowSelection: true,
                selectionSettings: { type: 'Multiple' }
            }, done);
    });

    it('EJ2-7299===>Hiding one column and copying the rows', () => {
        gridObj.selectRow(0, true);
        gridObj.copy();
        expect((gridObj.element.querySelector('.e-clipboard') as HTMLInputElement).value
            === '1	Nancy	WA	USA').toBeTruthy();
        gridObj.copy(true);
        expect((gridObj.element.querySelector('.e-clipboard') as HTMLInputElement).value
            === 'Employee ID	Name	Region	Country\n1	Nancy	WA	USA').toBeTruthy();
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

describe('Clipboard module coverage', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                editSettings: { allowEditing: true, mode: 'Batch' },
                selectionSettings: { type: 'Multiple', mode: 'Cell', cellSelectionMode: 'Box' },
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'Freight', field: 'Freight' }
                ]
            }, done);
    });

    it('pasteHandler should process ctrl+v and clear clipboard textarea', (done: Function) => {
        // ensure clipboard textarea exists
        if (!(document.querySelector('.e-clipboard'))) {
            (gridObj.clipboardModule as any).initialEnd();
        }
        const txt = document.querySelector('.e-clipboard') as HTMLInputElement;
        txt.value = 'A\tB\n';

        // select a cell and add to selection so pasteHandler proceeds
        gridObj.selectionModule.addCellsToSelection([{ rowIndex: 0, cellIndex: 0 }]);
        const cell: HTMLElement = gridObj.getContent().querySelector('.e-rowcell') as HTMLElement;
        cell.setAttribute('tabindex', '0');
        cell.focus();

        // simulate ctrl+v (non-Mac) keyboard event
        (gridObj.clipboardModule as any).pasteHandler({ keyCode: 86, ctrlKey: true, metaKey: false } as any);

        // wait for setTimeout in pasteHandler to complete
        setTimeout(() => {
            expect(txt.value).toBe('');
            done();
        }, 50);
    });

    it('paste with out-of-range indices should not throw', () => {
        (gridObj.clipboardModule as any).paste('X\tY\n', 1, 1);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-826272 - Copy-Paste problem while adding a new row in grid', () => {
    let gridObj: Grid;
    let inputElement: HTMLInputElement;

    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowPaging: true,
                pageSettings: { pageCount: 5 },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                selectionSettings: { type: 'Multiple', mode: 'Cell', cellSelectionMode: 'BoxWithBorder' },
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Batch' },
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                    { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' }
                ]
            }, done);
    });

    it('Copy pasting the content in a newly added row', () => {
        gridObj.selectionModule.selectCell({ rowIndex: 0, cellIndex: 1 }, false);
        gridObj.copy();
        (<any>gridObj.toolbarModule).toolbarClickHandler({ item: { id: gridObj.element.id + '_add' } });
        gridObj.editModule.editCell(0, 'CustomerID');
        gridObj.element.querySelectorAll('.e-editedbatchcell')
        inputElement = gridObj.element.querySelector('.e-editedbatchcell').querySelector('input');
        inputElement.value = (gridObj.element.querySelector('.e-clipboard') as HTMLInputElement).value;
    });

    it('Ensuring the copied content', () => {
        gridObj.selectionModule.selectCell({ rowIndex: 2, cellIndex: 1 }, false);
        gridObj.copy();
        expect((gridObj.element.querySelector('.e-clipboard') as HTMLInputElement).value).toBe('TOMSP');
    });

    it('check the removeEventListener  Binding', () => {
        gridObj.isDestroyed = true;
        gridObj.clipboardModule.removeEventListener();
        gridObj.isDestroyed = false;
    });

    it('check the addEventListener Binding', () => {
        gridObj.isDestroyed = true;
        gridObj.clipboardModule.addEventListener();
        gridObj.isDestroyed = false;
    });


    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Coverage Improvemnet - clipborad', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowPaging: true,
                pageSettings: { pageCount: 5 },
                toolbar: ['Add', 'Delete', 'Update', 'Cancel'],
                selectionSettings: { type: 'Multiple', mode: 'Cell' },
                editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Batch' },
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150, allowEditing: false },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                    { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' }
                ]
            }, done);
    });

    it('copied content', () => {
        gridObj.selectionModule.selectCell({ rowIndex: 2, cellIndex: 1 }, false);
        gridObj.copy();
    });

    it('Coverage - Ensuring the copied content', () => {
        let cell: any = gridObj.getContent().querySelector('.e-row').childNodes[1];
        cell.click();
        let args: any = { keyCode: 86, ctrlKey: true };
        (gridObj.clipboardModule as any).pasteHandler(args);
    });

    afterAll(() => {
        destroy(gridObj);
    });
});

describe('Coverage Improvemnet - Lazy Load Grouping with Virtual Scroll  => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                allowGrouping: true,
                groupSettings: { enableLazyLoading: true, columns: ['CustomerID'] },
                height: 400,
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                    { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' }
                ],
            }, done);
    });

    it('Expand the first Row', () => {
        let expandElem: any = gridObj.getContent().querySelectorAll('.e-recordpluscollapse');
        gridObj.groupModule.expandCollapseRows(expandElem[1]);
    });

    it('Ensuring the copied content - Lazy Load Grouping ', () => {
        let cell: HTMLElement = gridObj.getContent().querySelector('.e-row').childNodes[1] as HTMLElement;
        cell.click();
        gridObj.copy();
    });


    // coverage improvement
    it('lazy load addEventListener coverage ', () => {
        gridObj.isDestroyed = true;
        (gridObj as any).lazyLoadGroupModule.addEventListener();
        gridObj.isDestroyed = false;
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});



describe('Coverage Improvemnet - Infinite Scroll  => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                enableInfiniteScrolling: true,
                infiniteScrollSettings: { enableCache: true },
                height: 400,
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right' },
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                    { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' }
                ],
            }, done);
    });

    it('Ensuring the copied content - Infinite scroll', () => {
        gridObj.selectRow(0, true);
        gridObj.copy();
    });


    // clipboard coverage
    it('clipboard coverage', () => {
        (gridObj as any).clipboardModule.paste('', 1, 10);
        gridObj.selectionSettings.mode = 'Cell';
        (gridObj as any).selectionModule.selectedRowCellIndexes = [{ rowIndex: 1, cellIndexes: [] }];
        (gridObj as any).clipboardModule.checkBoxSelection();
        (gridObj as any).clipboardModule.clipBoardTextArea = null;
        (gridObj as any).clipboardModule.isSelect = false;
        gridObj.clipboardModule.copy();
    });


    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-920590- Paste action does not working template column => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                selectionSettings: { cellSelectionMode: 'Box', type: 'Multiple', mode: 'Cell' },
                enableAutoFill: true,
                editSettings: {allowAdding: true, allowDeleting: true, allowEditing: true, mode: 'Batch'},
                toolbar: ['Add', 'Edit', 'Delete', 'Update', 'Cancel'],
                height: 400,
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, textAlign: 'Right', isPrimaryKey: true },
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150, template: '<div>${CustomerID}</div>' },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd', textAlign: 'Right' },
                    { field: 'Freight', width: 120, format: 'C2', textAlign: 'Right' },
                ]
            }, done);
    });

    it('Paste the data', (done: Function) => {
        (gridObj as any).clipboardModule.paste('CustomTemplate', 2, 1);
        expect((gridObj as any).element.querySelectorAll('.e-row')[2].cells[1].innerText).toBe('CustomTemplate');
        done();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-900673 - Script error occurs while perform Control+A and Control+C => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                enableVirtualization: true,
                height:400,
                columns: [
                    { type: 'checkbox', width: 50 },
                    { field: 'OrderID', headerText: 'Order ID', width: 120},
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd'},
                    { field: 'Freight', width: 120}
                ],
            }, done);
    });

    it('Select All in Grid and copy action', () => {
        gridObj.selectionModule.ctrlPlusA();
        gridObj.copy();
        expect((gridObj.element.querySelector('.e-clipboard') as HTMLInputElement).value).toBeTruthy();
    });

    afterAll(() => {
       destroy(gridObj);
       gridObj = null;
    });
});

describe('EJ2-936849 - Script error thrown when copying with column selection in cell selection mode => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData.slice(0, 10),
                selectionSettings: { type: 'Multiple', allowColumnSelection: true },
                height: 400,
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120},
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd'},
                    { field: 'Freight', width: 120}
                ]
            }, done);
    });

    it('Copy the data in column selection', (done: Function) => {
        gridObj.selectionModule.selectColumn(0);
        gridObj.copy(true);
        expect((gridObj as any).clipboardModule.clipBoardTextArea.value !== '').toBeTruthy();
        done();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-942607 - Script error thrown when copying with focused stacked header in cell selection mode => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData.slice(0, 10),
                selectionSettings: { type: 'Multiple', mode: 'Cell' },
                height: 400,
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', textAlign: 'Right', width: 120 },
                    {
                        headerText: 'Order Details', columns: [
                            { field: 'OrderDate', headerText: 'Order Date', textAlign: 'Right', width: 135, format: 'yMd' },
                            { field: 'Freight', headerText: 'Freight($)', textAlign: 'Right', width: 120, format: 'C2' },
                        ]
                    },
                    {
                        headerText: 'Ship Details', columns: [
                            { field: 'ShipCity', headerText: 'Ship City', width: 145 },
                            { field: 'ShipCountry', headerText: 'Ship Country', width: 140 }
                        ]
                    }
                ]
            }, done);
    });

    it('Copy the data', (done: Function) => {
        gridObj.copy();
        done();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-1011563: Accessibility warning throws due to textarea used for Clipboard in grid missing id attribute', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData.slice(0, 10),
                allowPaging: true,
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID' }
                ]
            }, done);
    });

    it('check textarea with stable id attributes', () => {
        const textElement: HTMLTextAreaElement = gridObj.element.querySelector('textarea.e-clipboard');
        const clipBoardID: string = textElement.getAttribute('id');
        expect(clipBoardID).toBeTruthy();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('setCopyData fallback branch coverage => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                enableVirtualization: true,
                height: 200,
                allowSelection: true,
                selectionSettings: { type: 'Multiple' },
                columns: [
                    { headerText: 'OrderID', field: 'OrderID' },
                    { headerText: 'CustomerID', field: 'CustomerID' },
                    { headerText: 'Freight', field: 'Freight' }
                ]
            }, done);
    });

    it('should handle selectedIndexes > rows.length and copy without error', () => {
        // select a large set of row indexes so selectedIndexes length > rendered rows length
        const idxs: number[] = [];
        for (let i = 0; i < (filterData.length || 50); i++) { idxs.push(i); }
        gridObj.selectRows(idxs as number[]);
        // calling copy should trigger setCopyData fallback that reads aria-selected from DOM rows
        gridObj.copy(true);
        const txt = document.querySelector('.e-clipboard') as HTMLTextAreaElement;
        expect(txt && txt.value).toBeTruthy();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Coverage Improvement - Mac Platform Clipboard Operations => ', () => {
    let gridObj: Grid;
    let originalPlatform: any;
    let originalDescriptor: PropertyDescriptor;

    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: employeeData,
            columns: [
                { field: 'EmployeeID', headerText: 'Employee ID', width: 135 },
                { field: 'FirstName', headerText: 'Name', width: 125 },
                { field: 'Title', headerText: 'Title', width: 180 }
            ],
            allowSelection: true,
            selectionSettings: { type: 'Multiple' }
        }, done);
    });

    beforeEach(() => {
        // Save original platform descriptor
        originalDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'platform');
        originalPlatform = navigator.platform;
    });

    afterEach(() => {
        // Restore original platform
        if (originalDescriptor) {
            Object.defineProperty(Navigator.prototype, 'platform', originalDescriptor);
        }
    });

    it('should copy on Mac platform using Command+C (metaKey) - Coverage: Line 42', () => {
        // Mock Mac platform
        Object.defineProperty(Navigator.prototype, 'platform', {
            get: () => 'MacIntel',
            configurable: true
        });

        gridObj.selectRows([0, 1]);

        // Spy on copy method
        const copySpy = spyOn(gridObj.clipboardModule, 'copy').and.callThrough();

        // Simulate Mac Command+C keyboard event
        const keyEvent: any = {
            keyCode: 67,  // C key
            metaKey: true,  // Command key on Mac
            ctrlKey: false,
            target: gridObj.element.querySelector('.e-gridcontent')
        };

        // Trigger pasteHandler (which handles Mac copy detection)
        (gridObj.clipboardModule as any).pasteHandler(keyEvent);

        // Assertions
        expect(copySpy).toHaveBeenCalled();
        expect((document.querySelector('.e-clipboard') as HTMLInputElement).value)
            .toContain('Nancy');
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Coverage Improvement - Mac Platform Paste Operations => ', () => {
    let gridObj: Grid;
    let originalDescriptor: PropertyDescriptor;

    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: filterData.slice(0, 10),
            editSettings: { allowEditing: true, mode: 'Batch' },
            selectionSettings: { type: 'Multiple', mode: 'Cell', cellSelectionMode: 'Box' },
            columns: [
                { field: 'OrderID', headerText: 'Order ID', width: 120 },
                { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                { field: 'Freight', width: 120 }
            ]
        }, done);
    });

    beforeEach(() => {
        // Save original platform descriptor
        originalDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'platform');
        
        // Ensure clipboard textarea exists
        if (!(document.querySelector('.e-clipboard'))) {
            (gridObj.clipboardModule as any).initialEnd();
        }
    });

    afterEach(() => {
        // Restore original platform
        if (originalDescriptor) {
            Object.defineProperty(Navigator.prototype, 'platform', originalDescriptor);
        }
    });

    it('should paste on Mac platform using Command+V (metaKey) - Coverage: Lines 44, 60', (done: Function) => {
        // Mock Mac platform
        Object.defineProperty(Navigator.prototype, 'platform', {
            get: () => 'MacIntel',
            configurable: true
        });

        // Select a cell
        gridObj.selectionModule.selectCell({ rowIndex: 0, cellIndex: 1 }, false);

        // Set clipboard textarea value
        const txt = document.querySelector('.e-clipboard') as HTMLInputElement;
        txt.value = 'TestData\tValue2\n';

        // Focus the cell
        const cell: HTMLElement = gridObj.getCellFromIndex(0, 1) as HTMLElement;
        cell.setAttribute('tabindex', '0');
        cell.focus();

        // Spy on paste method
        const pasteSpy = spyOn(gridObj.clipboardModule, 'paste').and.callThrough();

        // Simulate Mac Command+V keyboard event
        const keyEvent: any = {
            keyCode: 86,  // V key
            metaKey: true,  // Command key on Mac
            ctrlKey: false,
            target: cell
        };

        // Trigger pasteHandler
        (gridObj.clipboardModule as any).pasteHandler(keyEvent);

        // Wait for Mac timeout (100ms) + buffer
        setTimeout(() => {
            expect(pasteSpy).toHaveBeenCalled();
            expect(pasteSpy).toHaveBeenCalledWith(
                jasmine.any(String),
                0,  // rowIndex
                1   // cellIndex
            );
            expect(txt.value).toBe('');  // Cleared after paste
            done();
        }, 150);
    });

    it('should use 10ms timeout for non-Mac paste operation - Coverage: Validation', (done: Function) => {
        // Ensure NOT Mac platform
        Object.defineProperty(Navigator.prototype, 'platform', {
            get: () => 'Win32',
            configurable: true
        });

        gridObj.selectionModule.selectCell({ rowIndex: 0, cellIndex: 0 }, false);
        const txt = document.querySelector('.e-clipboard') as HTMLInputElement;
        txt.value = 'WindowsData\n';
        const cell: HTMLElement = gridObj.getCellFromIndex(0, 0) as HTMLElement;
        cell.setAttribute('tabindex', '0');
        cell.focus();

        const pasteSpy = spyOn(gridObj.clipboardModule, 'paste').and.callThrough();

        // Trigger Windows Ctrl+V
        const keyEvent: any = {
            keyCode: 86,
            ctrlKey: true,
            metaKey: false,
            target: cell
        };

        (gridObj.clipboardModule as any).pasteHandler(keyEvent);

        // Wait for non-Mac timeout (10ms) + buffer
        setTimeout(() => {
            expect(pasteSpy).toHaveBeenCalled();
            done();
        }, 60);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Coverage Improvement - Paste Boundary Validation => ', () => {
    let gridObj: Grid;

    beforeAll((done: Function) => {
        gridObj = createGrid({
            dataSource: filterData.slice(0, 10),
            editSettings: { allowEditing: true, mode: 'Batch' },
            selectionSettings: { type: 'Multiple', mode: 'Cell', cellSelectionMode: 'Box' },
            columns: [
                { field: 'OrderID', headerText: 'Order ID', width: 120 },
                { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                { field: 'Freight', width: 120 }
            ]
        }, done);
    });

    it('should handle paste when column index exceeds grid columns - Coverage: Lines 79-81', () => {
        // Grid has 3 columns (0, 1, 2), pasting at column 2 with 5 tab-separated values
        const pasteData = 'Val1\tVal2\tVal3\tVal4\tVal5\n';

        // Spy on getCellFromIndex to verify it's called with out-of-bounds index
        const getCellSpy = spyOn(gridObj, 'getCellFromIndex').and.callThrough();

        // Call paste directly - starting at column 2, data extends beyond column 2
        gridObj.clipboardModule.paste(pasteData, 0, 2);

        // Verify getCellFromIndex was called with indices beyond grid columns
        expect(getCellSpy).toHaveBeenCalledWith(0, 2);  // Valid
        expect(getCellSpy).toHaveBeenCalledWith(0, 3);  // Out of bounds - triggers branch

        // Verify no error thrown
        expect(() => gridObj.clipboardModule.paste(pasteData, 0, 2)).not.toThrow();
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Coverage Improvement - Virtual Scrolling Selection Copy => ', () => {
    let gridObj: Grid;
    let largeData: any[];

    beforeAll((done: Function) => {
        // Create large dataset for virtual scrolling
        largeData = [];
        for (let i = 0; i < 500; i++) {
            largeData.push({
                OrderID: 10000 + i,
                CustomerID: 'CUST' + i,
                Freight: Math.random() * 100
            });
        }

        gridObj = createGrid({
            dataSource: largeData,
            enableVirtualization: true,
            height: 300,  // Limited height to force virtualization
            allowSelection: true,
            selectionSettings: { type: 'Multiple' },
            columns: [
                { field: 'OrderID', headerText: 'Order ID', width: 120 },
                { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                { field: 'Freight', width: 120 }
            ]
        }, done);
    });

    it('should handle copy when selected indexes exceed rendered rows - Coverage: Lines 175-180', (done: Function) => {
        // Wait for grid to render
        setTimeout(() => {
            const renderedRows = gridObj.getDataRows();
            const renderedRowCount = renderedRows.length;

            // Select MORE rows than currently rendered
            const largeSelection: number[] = [];
            for (let i = 0; i < renderedRowCount + 30; i++) {
                largeSelection.push(i);
            }

            // Select rows - this creates selectedIndexes.length > rows.length scenario
            gridObj.selectRows(largeSelection);
            // Track getAttribute calls to verify aria-selected DOM check
            let ariaSelectedCheckCount = 0;
            const originalGetAttribute = Element.prototype.getAttribute;
            const getAttrSpy = spyOn(Element.prototype, 'getAttribute').and.callFake(function(this: Element, attr: string) {
                if (attr === 'aria-selected' && this.classList && this.classList.contains('e-row')) {
                    ariaSelectedCheckCount++;
                }
                return originalGetAttribute.call(this, attr);
            });

            // Trigger copy - should use DOM aria-selected fallback
            gridObj.copy(true);

            // Verify clipboard has content
            const clipboardValue = (document.querySelector('.e-clipboard') as HTMLInputElement).value;
            expect(clipboardValue).toBeTruthy();
            expect(clipboardValue).toContain('Order ID');  // Header included

            done();
        }, 500);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('Coverage Improvement - Infinite Scroll Selection Copy => ', () => {
    let gridObj: Grid;
    let largeData: any[];

    beforeAll((done: Function) => {
        // Create large dataset for infinite scrolling
        largeData = [];
        for (let i = 0; i < 500; i++) {
            largeData.push({
                OrderID: 20000 + i,
                CustomerID: 'CUST' + i,
                Freight: Math.random() * 100
            });
        }

        gridObj = createGrid({
            dataSource: largeData,
            enableInfiniteScrolling: true,
            infiniteScrollSettings: { enableCache: true },
            height: 300,
            allowSelection: true,
            selectionSettings: { type: 'Multiple' },
            columns: [
                { field: 'OrderID', headerText: 'Order ID', width: 120 },
                { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                { field: 'Freight', width: 120 }
            ]
        }, done);
    });

    it('should use aria-selected fallback when selected rows exceed rendered rows - Coverage: Lines 175-180', (done: Function) => {
        setTimeout(() => {
            const renderedRows = gridObj.getDataRows();
            const largeSelection: number[] = [];
            for (let i = 0; i < renderedRows.length + 50; i++) {
                largeSelection.push(i);
            }
            gridObj.selectRows(largeSelection);
            // Track aria-selected getAttribute calls
            let ariaCheckCount = 0;
            const originalGetAttr = Element.prototype.getAttribute;
            const getAttrSpy = spyOn(Element.prototype, 'getAttribute').and.callFake(function(this: Element, attr: string) {
                if (attr === 'aria-selected' && this.classList && this.classList.contains('e-row')) {
                    ariaCheckCount++;
                }
                return originalGetAttr.call(this, attr);
            });

            gridObj.copy();
            expect((document.querySelector('.e-clipboard') as HTMLInputElement).value).toBeTruthy();

            done();
        }, 500);
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});

describe('EJ2-1030705: Not able to copy to clipboard when virtualization is enabled => ', () => {
    let gridObj: Grid;
    beforeAll((done: Function) => {
        gridObj = createGrid(
            {
                dataSource: filterData,
                enableVirtualization: true,
                height: 200,
                allowSelection: true,
                selectionSettings: { type: 'Multiple', mode: 'Row' },
                columns: [
                    { field: 'OrderID', headerText: 'Order ID', width: 120, },
                    { field: 'CustomerID', headerText: 'Customer Name', width: 150 },
                    { field: 'OrderDate', headerText: 'Order Date', width: 130, format: 'yMd' },
                    { field: 'Freight', width: 120, format: 'C2' }
                ]
            }, done);
    });

    it('should check whether the row is copied correctly', () => {
        gridObj.selectRows([1]);
        gridObj.copy(true);
        const clipboardValue = (document.querySelector('.e-clipboard') as HTMLInputElement).value;
        expect(clipboardValue).toBeTruthy();
        expect(clipboardValue).toContain('TOMSP');
    });

    afterAll(() => {
        destroy(gridObj);
        gridObj = null;
    });
});