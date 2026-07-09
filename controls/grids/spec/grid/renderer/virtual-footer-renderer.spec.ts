import { Grid } from '../../../src/grid/base/grid';
import { VirtualFooterRenderer } from '../../../src/grid/renderer/virtual-footer-renderer';
import { VirtualElementHandler } from '../../../src/grid/renderer/virtual-content-renderer';
import { VirtualRowModelGenerator } from '../../../src/grid/services/virtual-row-model-generator';
import { largeDataset } from '../base/datasource.spec';
import { Column } from '../../../src/grid/models/column';
import { GridModel } from '../../../src/grid/base/grid-model';
import { createElement, EmitType, extend } from '@syncfusion/ej2-base';

let createGrid: Function = (options: GridModel, done: Function): Grid => {
    let grid: Grid;
    let dataBound: EmitType<Object> = () => { done(); };
    let div: HTMLElement = createElement('div', { id: 'Grid' });
    document.body.appendChild(div);
    grid = new Grid(
        extend(
            {}, {
                dataBound: dataBound,
            },
            options
        ),
    );
    grid.appendTo(div);
    return grid;
};

let destroy: EmitType<Object> = (grid: Grid) => {
    if (grid) {
        grid.destroy();
        document.getElementById('Grid').remove();
    }
};
let ctr: number = 0;
let count500: string[] = Array.apply(null, Array(5)).map(() => 'Column' + ++ctr + '');
let count5000: string[] = Array.apply(null, Array(500)).map(() => 'Column' + ++ctr + '');
let data: Object[] = (() => {
    let arr: Object[] = [];
    for (let i: number = 0, o: Object = {}, j: number = 0; i < 1000; i++ , j++ , o = {}) {
        count500.forEach((lt: string) => o[lt] = 'Column' + lt + 'Row' + i);
        arr[j] = o;
    }
    return arr;
})();

let data1: Object[] = (() => {
    let arr: Object[] = [];
    for (let i: number = 0, o: Object = {}, j: number = 0; i < 1000; i++ , j++ , o = {}) {
        count5000.forEach((lt: string) => o[lt] = 'Column' + lt + 'Row' + i);
        arr[j] = o;
    }
    return arr;
})();

let virtualData: Object[] = (() => {
    let arr: Object[] = [];
    for (let i: number = 0, o: Object = {}, j: number = 0; i < 1000; i++ , j++ , o = {}) {
        count500.forEach((lt: string) => o[lt] = i);
        arr[j] = o;
    }
    return arr;
})();




let largeDatasetColumns: Function = (count: number): Object[] => {
    let columns: any = [];
    for (let i: number = 0; i < count; i++) {
        columns.push({ field: 'FIELD' + i });
        columns[i].width = 120;
        columns[i].isPrimaryKey = columns[i].field === 'FIELD1';
    }
    return columns;
};


describe ('Virtual footer renderer', () => {
    describe('Render the virtual footer renderer', () => {
        let gridObj: Grid;
        let columns: Column[] = largeDatasetColumns(30);
        let virtualFooterRenderer: VirtualFooterRenderer;
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: largeDataset.slice(0, 50),
                    columns: columns,
                    enableVirtualization: true,
                    enableColumnVirtualization: true,
                    height: 300,
                    width: 400,
                    footerRowHeight: 50,
                    aggregates: [
                        {
                            columns: [
                                { type: 'Max', field: 'FIELD2', footerTemplate: 'Max: ${Max}' }
                            ]
                        }
                    ]
                }, done);
        });

        it('should initialize VirtualFooterRenderer with parent and locator', () => {
            virtualFooterRenderer = gridObj.aggregateModule['footerRenderer'] as VirtualFooterRenderer;
            expect(virtualFooterRenderer).toBeDefined();
        });

        it('should initialize virtualEle as VirtualElementHandler', () => {
            expect(virtualFooterRenderer.virtualElement).toBeDefined();
            expect(virtualFooterRenderer.virtualElement instanceof VirtualElementHandler).toBe(true);
        });

        it('should initialize gen as VirtualRowModelGenerator', () => {
            expect(virtualFooterRenderer.rowModelGenerator).toBeDefined();
            expect(virtualFooterRenderer.rowModelGenerator instanceof VirtualRowModelGenerator).toBe(true);
        });

        it('should call parent constructor', () => {
            spyOn(Object.getPrototypeOf(Object.getPrototypeOf(VirtualFooterRenderer.prototype)), 'constructor').and.callThrough();
            expect(virtualFooterRenderer).toBeDefined();
            expect((virtualFooterRenderer as any).parent).toBe(gridObj);
        });

        it('scroll the grid', (done: Function) => {
            gridObj.getContent().firstElementChild.scrollLeft = 900;
            gridObj.getContent().firstElementChild.scrollLeft = 1200;
            setTimeout(done, 200);
        });

        it('scroll the grid in horizontal', () => {
            expect(gridObj.getFooterContent().firstElementChild.scrollLeft).toBe(1200);
        });

        it('should not update column group when colGroup is not available', () => {
            spyOn(virtualFooterRenderer, 'getColGroup').and.returnValue(null);
            (virtualFooterRenderer as any).updateColGroup();
        });

        it('should skip virtual rendering when summary content is not present', () => {
            spyOn(virtualFooterRenderer.getPanel(), 'querySelector').and.returnValue(null);
            spyOn(virtualFooterRenderer.virtualElement, 'renderWrapper');
            spyOn(virtualFooterRenderer.virtualElement, 'renderPlaceHolder');
            virtualFooterRenderer.renderTable();
            expect(virtualFooterRenderer.virtualElement.renderWrapper).not.toHaveBeenCalled();
            expect(virtualFooterRenderer.virtualElement.renderPlaceHolder).not.toHaveBeenCalled();
        });

        it('should not refresh when summary content element is missing', () => {
            spyOn(virtualFooterRenderer.getPanel(), 'querySelector').and.returnValue(null);
            spyOn((virtualFooterRenderer as any).parent, 'setColumnIndexesInView');
            virtualFooterRenderer.refresh();
            expect((virtualFooterRenderer as any).parent.setColumnIndexesInView).not.toHaveBeenCalled();
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
    describe('Render the virtual footer renderer in frozencolumns', () => {
        let gridObj: Grid;
        let columns: Column[] = largeDatasetColumns(50);
        columns[9]['freeze'] = 'Right';
        beforeAll((done: Function) => {
            gridObj = createGrid(
                {
                    dataSource: largeDataset.slice(0, 50),
                    columns: columns,
                    enableVirtualization: true,
                    enableColumnVirtualization: true,
                    height: 300,
                    width: 400,
                    footerRowHeight: 50,
                    frozenColumns: 2,
                    aggregates: [
                        {
                            columns: [
                                { type: 'Max', field: 'FIELD2', footerTemplate: 'Max: ${Max}' }
                            ]
                        }
                    ]
                }, done);
        });

        it('scroll the grid', (done: Function) => {
            gridObj.getContent().firstElementChild.scrollLeft = 900;
            gridObj.getContent().firstElementChild.scrollLeft = 1200;
            setTimeout(done, 200);
        });

        it('scroll the grid in horizontal', () => {
            expect(gridObj.getFooterContent().firstElementChild.scrollLeft).toBe(1200);
        });

        afterAll(() => {
            destroy(gridObj);
            gridObj = null;
        });
    });
});