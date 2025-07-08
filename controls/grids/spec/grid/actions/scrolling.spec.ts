/**
 * Scrolling module spec
 */
import { Browser } from '@syncfusion/ej2-base';
import { extend } from '@syncfusion/ej2-base';
import { createElement, remove } from '@syncfusion/ej2-base';
import { Grid } from '../../../src/grid/base/grid';
import { uiUpdate } from '../../../src/grid/base/constant';
import { GridModel } from '../../../src/grid/base/grid-model';
import { Scroll } from '../../../src/grid/actions/scroll';
import { data, filterData } from '../base/datasource.spec';
import '../../../node_modules/es6-promise/dist/es6-promise';
import  {profile , inMB, getMemoryProfile} from '../base/common.spec';
import { getClickObj } from '../base/specutil.spec';
import { SortSettingsModel } from '../../../src/grid/base/grid-model';
import { Sort } from '../../../src/grid/actions/sort';
import { Filter } from '../../../src/grid/actions/filter';
import { Group } from '../../../src/grid/actions/group';
import { Toolbar } from '../../../src/grid/actions/toolbar';

Grid.Inject(Scroll, Group, Filter, Sort, Toolbar);

const ieUa: string = 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; .NET4.0E; .NET4.0C; ' +
    'Tablet PC 2.0; .NET CLR 3.5.30729; .NET CLR 2.0.50727; .NET CLR 3.0.30729; InfoPath.3; rv:11.0) like Gecko';

const mozUa: string = 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0';


describe('Scrolling module', () => {
    Browser.userAgent = ieUa;
    let createGrid: Function = (options: GridModel, done: Function): Grid => {
        let grid: Grid;
        let dataBound: Function = () => { done(); };
        grid = new Grid(
            extend(
                {}, {
                    dataSource: data,
                    dataBound: dataBound,
                },
                options
            )
        );
        let div: HTMLElement = createElement('div', { id: 'Grid' });
        document.body.appendChild(div);
        grid.appendTo(div);
        return grid;
    };

    let destroy: Function = (grid: Grid) => {
        if (grid) {
            // grid.destroy();
            remove(grid.element);
        }
    };

    let raise: Function = (grid: Grid) => {
        let evt: Event = document.createEvent('HTMLEvents');
        evt.initEvent('scroll', true, true);
        (<HTMLElement>grid.getContent().firstChild).dispatchEvent(evt);
    };

    describe('Enable scrolling', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            grid = createGrid(
                {
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', visible: false
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean' },
                        { field: 'Freight', format: 'C1' },
                        { field: 'OrderDate', format: 'yMd' },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right' }
                    ]
                },
                done
            );
        });
        it('check content class', () => {
            expect((<HTMLElement>grid.getContent().firstChild).classList.contains('e-content')).toBeTruthy();
        });

        it('check header class', () => {
            expect((<HTMLElement>grid.getHeaderContent().firstChild).classList.contains('e-headercontent')).toBeTruthy();
        });


        afterAll(() => {
            destroy(grid);
            grid = null;
        });
    });

    describe('Scrolling with settings', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid(
                {
                    width: 300, height: '50%',
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', visible: false
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean' },
                        { field: 'Freight', format: 'C1' },
                        { field: 'OrderDate', format: 'yMd' },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right' }
                    ]
                },
                done
            );
        });
        it('check element width', () => {
            expect((<HTMLElement>grid.element).style.width).toBe('300px');
        });

        it('check element height', () => {
            expect((<HTMLElement>grid.getContent().firstChild).style.height).toBe('50%');
        });

        it('check padding and border', () => {
            let header: HTMLElement = <HTMLElement>grid.getHeaderContent();
            expect((<HTMLElement>header.firstChild).style.borderRightWidth).toBe('1px');
            expect((<HTMLElement>header).style.paddingRight).toBe(
                Browser.info.name === 'mozilla' ? '16.5px' : (Scroll.getScrollBarWidth() - 1) + 'px');
        });

        afterAll(() => {
            destroy(grid);
            grid = null;
        });
    });

    describe('Scrolling with settings - RTL', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid(
                {
                    width: 300, height: '50%',
                    enableRtl: true,
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', visible: false
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean' },
                        { field: 'Freight', format: 'C1' },
                        { field: 'OrderDate', format: 'yMd' },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right' }
                    ]
                },
                done
            );
        });
        it('check element width', () => {
            expect((<HTMLElement>grid.element).style.width).toBe('300px');
        });

        it('check element height', () => {
            expect((<HTMLElement>grid.getContent().firstChild).style.height).toBe('50%');
            //for coverage
            grid.isDestroyed = true;
            grid.scrollModule.addEventListener();
            grid.scrollModule.removeEventListener();
            grid.isDestroyed = false;

        });

        // it('check padding and border', () => {
        //     let header: HTMLElement = <HTMLElement>grid.getHeaderContent();
        //     expect((<HTMLElement>header.firstChild).style.borderLeftWidth).toBe('1px');
        //     expect((<HTMLElement>header).style.paddingLeft).toBe(
        //         Browser.info.name === 'mozilla' ? '16.5px' : (Scroll.getScrollBarWidth() - 1) + 'px');
        // });

        afterAll(() => {
            destroy(grid);
            grid = null;
        });
    });

    describe('Scrolling setModel', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid(
                {
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', visible: false
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean' },
                        { field: 'Freight', format: 'C1' },
                        { field: 'OrderDate', format: 'yMd' },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right' }
                    ]
                },
                () => {
                    grid.width = '100px';
                    grid.height = '100%';
                    grid.dataBind();
                    done();
                }
            );
        });
        it('check element width', () => {
            expect((<HTMLElement>grid.element).style.width).toBe('100px');
        });

        it('check element height', () => {
            expect((<HTMLElement>grid.getContent().firstChild).style.height).toBe('100%');
        });

        it('check padding and border', () => {
            let header: HTMLElement = <HTMLElement>grid.getHeaderContent();
            expect((<HTMLElement>header.firstChild).style.borderRightWidth).toBe('1px');
            expect((<HTMLElement>header).style.paddingRight).toBe(
                Browser.info.name === 'mozilla' ? '16.5px' : (Scroll.getScrollBarWidth() - 1) + 'px');
        });

        it('internal module call - module - different', () => {
            grid.notify(uiUpdate, { module: 'filter' });
            expect((<HTMLElement>grid.element).style.width).toBe('100px');
        });

        it('internal module call - Enable - false', () => {
            grid.notify(uiUpdate, { enable: false, module: 'scroll', properties:{} });
            expect((<HTMLElement>grid.element).style.width).toBe('100px');
        });

        afterAll(() => {
            destroy(grid);
            grid = null;
        });
    });

    describe('Scrolling setModel - back to default', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid(
                {
                    height: 300,
                    width: 300,
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', visible: false
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean' },
                        { field: 'Freight', format: 'C1' },
                        { field: 'OrderDate', format: 'yMd' },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right' }
                    ]
                },
                () => {
                    grid.width = 'auto';
                    grid.height = 'auto';
                    grid.dataBind();
                    done();
                }
            );
        });
        it('check element width', () => {
            expect((<HTMLElement>grid.element).style.width).toBe('auto');
        });

        it('check element height', () => {
            expect((<HTMLElement>grid.getContent().firstChild).style.height).toBe('auto');
        });

        it('check padding and border', () => {
            let header: HTMLElement = <HTMLElement>grid.getHeaderContent();
            expect((<HTMLElement>header.firstChild).style.borderRightWidth).toBe('');
            expect((<HTMLElement>header).style.paddingRight).toBe('');
        });

        afterAll(() => {
            destroy(grid);
            grid = null;
        });
    });

    describe('EJ2-6045-height issue set heigth as 100%', () => {
        let gridObj: Grid;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    height:'100%',
                    dataSource: data,
                    allowPaging: true,
                    pageSettings: { pageSize: 5 },
                    allowSorting: true,
                    allowGrouping: true,
                    columns: [{ field: 'OrderID' }, { field: 'CustomerID' }, { field: 'EmployeeID' }, { field: 'Freight' },
                    { field: 'ShipCity' }]
                }, done);
        });
          it('check sibling height', () => {
            var siblingheight:number= gridObj.widthService.getSiblingsHeight(<HTMLElement>gridObj.getContent())
            expect(siblingheight).toBeLessThan(200);
        
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });  
     });

    describe('Scrolling scroll event', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid(
                {
                    width: 300, height: 400,
                    allowPaging: true,
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', width: 200
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean', width: 200 },
                        { field: 'Freight', format: 'C1' },
                        { field: 'OrderDate', format: 'yMd', width: 200 },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 200 }
                    ]
                },
                done
            );
        });
        it('check scroll left header/content sync', () => {
            (<HTMLElement>grid.getContent().firstChild).scrollLeft = 100;
            raise(grid);
            // expect((<HTMLElement>grid.getHeaderContent().firstChild).scrollLeft)
            //     .toBe(100);
            (<HTMLElement>grid.getContent().firstChild).scrollTop = 10;
            raise(grid);
        });

        afterAll(() => {
            destroy(grid);
            grid = null;
        });
    });


    describe('Scrolling - emulate mobile scroller', () => {
        let grid: Grid;
        let old: () => number;
        beforeAll((done: Function) => {
            Browser.userAgent = mozUa;
            old = Scroll.getScrollBarWidth;
            Scroll.getScrollBarWidth = () => 0;
            grid = createGrid(
                {
                    width: 300, height: 300,
                    allowPaging: true,
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', width: 200
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean', width: 200 },
                        { field: 'Freight', format: 'C1', width: 200 },
                        { field: 'OrderDate', format: 'yMd', width: 200 },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 200 }
                    ]
                },
                done
            );
        });

        it('check padding and border', () => {
            let header: HTMLElement = <HTMLElement>grid.getHeaderContent();
            expect((<HTMLElement>header.firstChild).style.borderRightWidth).toBe('0px');
            expect((<HTMLElement>header).style.paddingRight).toBe('0px');
             //for coverage
            grid.isDestroyed = true;
            grid.scrollModule.removeEventListener();
            grid.isDestroyed = false;

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
            Scroll.getScrollBarWidth = old;
            destroy(grid);
            let desktop: string = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
            Browser.userAgent = desktop;
            grid = old = null;
        });
    });

    describe('Scrolling scroll event', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid(
                {
                    dataSource: filterData,
                    width: 300,
                    enableStickyHeader: true,
                    toolbar: ["Add", "Edit", "Delete"],
                    allowGrouping: true,
                    allowSorting: true,
                    allowFiltering: true,
                    filterSettings: { type: "Menu" },
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', width: 200
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean', width: 200 },
                        { field: 'Freight', format: 'C1' },
                        { field: 'ShipCity', headerText: 'Ship City', width: 200 },
                        { field: 'OrderDate', format: 'yMd', width: 200 },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 200 }
                    ]
                },
                done
            );
        });
        it('check sticky class without scroll', () => {
            expect(grid.getHeaderContent().classList.contains('e-sticky')).toBeFalsy();
        });
        it('Scrolling down', (done: Function) => {
            let listner: Function = () => {
                expect(grid.getHeaderContent().classList.contains('e-sticky')).toBeTruthy();
                grid.off('sticky-scroll-complete', listner);
                done();
            };
            grid.on('sticky-scroll-complete', listner, this);
            document.scrollingElement.scrollTop = 500;
        });
        
        // commented below code due to build failure. uncomment this case in future
        // it('Scrolling up', (done: Function) => {
        //     let listner: Function = () => {
        //         expect(grid.getHeaderContent().classList.contains('e-sticky')).toBeFalsy();
        //         grid.off('sticky-scroll-complete', listner);
        //         done();
        //     };
        //     grid.on('sticky-scroll-complete', listner, this);
        //     document.scrollingElement.scrollTop = 0;
        // });

        afterAll(() => {
            grid.enableStickyHeader = false;
            destroy(grid);
            grid = null;
        });
    });

    describe('965167: Horizontal Scrollbar Missing When Grid Height Is Set to 100% with Virtualization and Frozen Columns', () => {
        let grid: Grid;
        beforeAll((done: Function) => {
            grid = createGrid(
                {
                    enableColumnVirtualization: true,
                    height: '100%',
                    frozenColumns: 3,
                    dataSource: filterData, 
                    columns: [
                        {
                            field: 'OrderID', headerText: 'Order ID', headerTextAlign: 'Right',
                            textAlign: 'Right', width: 200
                        },
                        { field: 'Verified', displayAsCheckbox: true, type: 'boolean', width: 200 },
                        { field: 'Freight', format: 'C1' },
                        { field: 'OrderDate', format: 'yMd', width: 200 },
                        { field: 'EmployeeID', headerText: 'Employee ID', textAlign: 'Right', width: 200 }
                    ]
                },
                done
            );
        });

        it('Initial rendering with frozen columns', (done: Function) => {
            expect((<HTMLElement>grid.element.querySelector('.e-virtual-content')).style.height === "100%").toBeFalsy();
            done();
        });

        afterAll(() => {
            destroy(grid);
            grid = null;
        });
    });

});
