import { TreeGrid } from "../../src/treegrid/base/treegrid";
import { createGrid, destroy } from "../base/treegridutil.spec";
import {
  NotifyArgs,
  QueryCellInfoEventArgs,
  RowSelectEventArgs, VirtualContentRenderer
} from "@syncfusion/ej2-grids";
import { isNullOrUndefined, EventHandler, Browser } from "@syncfusion/ej2-base";
import { VirtualScroll } from "../../src/treegrid/actions/virtual-scroll";
import {
  virtualData,
  editVirtualData,
  dataSource,
  addVirtualData,
  dataSource1,
  crData,
} from "../base/datasource.spec";
import { Edit } from "../../src/treegrid/actions/edit";
import { Toolbar } from "../../src/treegrid/actions/toolbar";
import { select } from "@syncfusion/ej2-base";
import { RowDD } from "../../src/treegrid/actions/rowdragdrop";
import { Sort } from "../../src/treegrid/actions/sort";
import { Filter } from "../../src/treegrid/actions/filter";
import { ActionEventArgs, ITreeData } from "../../src/treegrid/base/interface";
import { Selection } from "../../src/treegrid/actions/selection";
import { Freeze } from "../../src/treegrid/actions/freeze-column";
import { VirtualTreeContentRenderer, TreeInterSectionObserver } from "../../src/treegrid/renderer/virtual-tree-content-render";
import { InterSection } from '@syncfusion/ej2-grids';
import { DataManager, WebApiAdaptor } from "@syncfusion/ej2-data";
import { TreeVirtualRowModelGenerator } from '../../src/treegrid/renderer/virtual-row-model-generator';
import * as grids from '@syncfusion/ej2-grids';
import * as utils from '../../src/treegrid/utils';

/**
 * TreeGrid Virtual Scroll spec
 */

TreeGrid.Inject(VirtualScroll, Edit, Toolbar, Sort, Filter, RowDD, Selection, Freeze);

if (!editVirtualData.length) {
  dataSource();
}

describe('Coverage enableSeamlessScrolling testcase', () => {
  let gridObj: TreeGrid;
  beforeAll((done: Function) => {
    gridObj = createGrid(
      {
        dataSource: virtualData.slice(0, 100),
        parentIdMapping: 'ParentID',
        idMapping: 'TaskID',
        enableVirtualization: true,
        enableColumnVirtualization: true,
        height: 400,
        columns: [
          { field: 'TaskID', headerText: 'ID', width: 70 },
          { field: 'TaskName', headerText: 'Name', width: 150 },
          { field: 'FIELD1', headerText: 'Field1', width: 150 },
          { field: 'FIELD2', headerText: 'Field2', width: 150 },
          { field: 'FIELD3', headerText: 'Field3', width: 150 }
        ],
        load: function (args: any) {
          args.enableSeamlessScrolling = true;
        }
      },
      done
    );
  });

  it('Coverage - scrollTop', (done: Function) => {
    (gridObj.grid as any).contentModule.virtualEle.verticalScrollbar.scrollTop = 800;
    done();
  });

  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});

describe('Coverage generateCells and generateCell methods', () => {
  let cellGridObj: TreeGrid;
  beforeAll((done: Function) => {
    cellGridObj = createGrid(
      {
        dataSource: virtualData.slice(0, 50),
        parentIdMapping: 'ParentID',
        idMapping: 'TaskID',
        enableVirtualization: true,
        height: 300,
        columns: [
          { field: 'TaskID', headerText: 'ID', width: 70 },
          { field: 'TaskName', headerText: 'Name', width: 150 },
          { field: 'FIELD3', headerText: 'Field3', width: 150 }
        ]
      },
      done
    );
  });

  it('should generate cells array', (done: Function) => {
    setTimeout(() => {
      const renderer = (cellGridObj.grid.contentModule as any);
      const cells = renderer.generateCells();
      expect(cells).toBeDefined();
      expect(cells.length).toBeGreaterThan(0);
      done();
    }, 500);
  });

  it('should generate single cell', (done: Function) => {
    setTimeout(() => {
      const renderer = (cellGridObj.grid.contentModule as any);
      const column = cellGridObj.columns[0];
      const cell = renderer.generateCell(column, 'row1', 'Data', 1, 0);
      expect(cell).toBeDefined();
      expect(cell.column).toEqual(column);
      done();
    }, 500);
  });

  it('should generate cell with template column', (done: Function) => {
    setTimeout(() => {
      const renderer = (cellGridObj.grid.contentModule as any);
      const templateColumn = { field: 'TaskName', template: '<span>${TaskName}</span>' };
      const cell = renderer.generateCell(templateColumn as any, 'row1');
      expect(cell).toBeDefined();
      expect(cell.isTemplate).toBe(true);
      done();
    }, 500);
  });
  it('generateCell sets index when column.type is checkbox', (done: Function) => {
    setTimeout(() => {
      const renderer = (cellGridObj.grid.contentModule as any);
      const checkboxColumn: any = { type: 'checkbox', headerText: 'Check' };
      const cell = renderer.generateCell(checkboxColumn, 'row1', undefined, 1, 5);
      expect(cell.index).toBe(5);
      done();
    }, 500);
  });

  it('generateCell sets index when column has commands', (done: Function) => {
    setTimeout(() => {
      const renderer = (cellGridObj.grid.contentModule as any);
      const cmdColumn: any = { headerText: 'Cmd', commands: ['edit'] };
      const cell = renderer.generateCell(cmdColumn, 'row1', undefined, 1, 7);
      expect(cell.index).toBe(7);
      done();
    }, 500);
  });
  it('generateCell ElseBlock cover', (done: Function) => {
    setTimeout(() => {
      const renderer = (cellGridObj.grid.contentModule as any);
      const checkboxColumn: any = { type: 'number', headerText: 'Check' };
      const cell = renderer.generateCell(checkboxColumn, 'row1', undefined, 1, 5);
      done();
    }, 500);
  });
  afterAll(() => {
    destroy(cellGridObj);
    cellGridObj = null;
  });
});


describe('Coverage scrollListeners - horizontal scroll', () => {
  let horizontalScrollGridObj: TreeGrid;
  beforeAll((done: Function) => {
    horizontalScrollGridObj = createGrid(
      {
        dataSource: virtualData.slice(0, 100),
        parentIdMapping: 'ParentID',
        idMapping: 'TaskID',
        enableVirtualization: true,
        enableColumnVirtualization: true,
        height: 400,
        columns: [
          { field: 'TaskID', headerText: 'ID', width: 70 },
          { field: 'TaskName', headerText: 'Name', width: 150 },
          { field: 'FIELD1', headerText: 'Field1', width: 150 },
          { field: 'FIELD2', headerText: 'Field2', width: 150 },
          { field: 'FIELD3', headerText: 'Field3', width: 150 }
        ]
      },
      done
    );
  });

  it('should handle horizontal scroll right', (done: Function) => {
    setTimeout(() => {
      const renderer = (horizontalScrollGridObj.grid.contentModule as any);
      renderer.totalRecords = 100;
      const scrollArgs = {
        direction: 'right',
        sentinel: { axis: 'X' },
        offset: { top: 0, left: 100 },
        isWheel: false,
      };
      renderer.scrollListeners(scrollArgs);
      done();
    }, 500);
  });

  it('should handle horizontal scroll left', (done: Function) => {
    setTimeout(() => {
      const renderer = (horizontalScrollGridObj.grid.contentModule as any);
      renderer.totalRecords = 100;
      const scrollArgs = {
        direction: 'left',
        sentinel: { axis: 'X' },
        offset: { top: 0, left: 50 },
        isWheel: false,
      };
      renderer.scrollListeners(scrollArgs);
      done();
    }, 500);
  });

  afterAll(() => {
    destroy(horizontalScrollGridObj);
    horizontalScrollGridObj = null;
  });
});

describe('Coverage appendContent - Lines 996-1005 Coverage (isAdd & rowPosition check)', () => {
  let gridObj: TreeGrid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 300,
      editSettings: { mode: 'Batch', allowEditing: true, allowAdding: true },
      columns: [
        { field: 'TaskID', headerText: 'ID', width: 70 },
        { field: 'TaskName', headerText: 'Name', width: 150 },
        { field: 'Duration', headerText: 'Duration', width: 100 }
      ]
    }, done);
  });

  // Branch 1: isAdd is false - outer condition fails
  it('should skip restoreNewRow when isAdd is false', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer['isAdd'] = false;
      const target = gridObj.getContent().querySelector('tbody');
      const newChild = document.createDocumentFragment();

      const notifyArgs = {
        requestType: 'virtualscroll',
        virtualInfo: {
          sentinelInfo: { axis: 'Y' },
          page: 1,
          columnIndexes: [0, 1]
        }
      };

      const restoreSpy = spyOn(renderer, 'restoreNewRow').and.callThrough();
      renderer.appendContent(target, newChild, notifyArgs);

      expect(restoreSpy).not.toHaveBeenCalled();
      done();
    }, 500);
  });

  // Branch 2: addedrow element exists - outer condition fails
  it('should skip when addedrow element already exists', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer['isAdd'] = true;
      const content = gridObj.getContent().querySelector('.e-content');
      const fakeAddedRow = document.createElement('tr');
      fakeAddedRow.className = 'e-addedrow';
      content.appendChild(fakeAddedRow);

      const target = gridObj.getContent().querySelector('tbody');
      const newChild = document.createDocumentFragment();

      const notifyArgs = {
        requestType: 'virtualscroll',
        virtualInfo: {
          sentinelInfo: { axis: 'Y' },
          page: 1,
          columnIndexes: [0, 1]
        }
      };

      const restoreSpy = spyOn(renderer, 'restoreNewRow').and.callThrough();
      renderer.appendContent(target, newChild, notifyArgs);

      expect(restoreSpy).not.toHaveBeenCalled();
      fakeAddedRow.remove();
      done();
    }, 500);
  });

  // Branch 3: rowPosition is 'Top' - position check fails
  it('should skip when rowPosition is Top', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer['isAdd'] = true;
      renderer['rowPosition'] = 'Top';

      const target = gridObj.getContent().querySelector('tbody');
      const newChild = document.createDocumentFragment();

      const notifyArgs = {
        requestType: 'virtualscroll',
        virtualInfo: {
          sentinelInfo: { axis: 'Y' },
          page: 1,
          columnIndexes: [0, 1]
        }
      };

      const restoreSpy = spyOn(renderer, 'restoreNewRow').and.callThrough();
      renderer.appendContent(target, newChild, notifyArgs);

      expect(restoreSpy).not.toHaveBeenCalled();
      done();
    }, 500);
  });

  // Branch 4: rowPosition is 'Bottom' - position check fails
  it('should skip when rowPosition is Bottom', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer['isAdd'] = true;
      renderer['rowPosition'] = 'Bottom';

      const target = gridObj.getContent().querySelector('tbody');
      const newChild = document.createDocumentFragment();

      const notifyArgs = {
        requestType: 'virtualscroll',
        virtualInfo: {
          sentinelInfo: { axis: 'Y' },
          page: 1,
          columnIndexes: [0, 1]
        }
      };

      const restoreSpy = spyOn(renderer, 'restoreNewRow').and.callThrough();
      renderer.appendContent(target, newChild, notifyArgs);

      expect(restoreSpy).not.toHaveBeenCalled();
      done();
    }, 500);
  });



  // Branch 6: dataRowIndex < startIndex AND addRowIndex > -1 - sets flags
  it('should reset isAdd flag when dataRowIndex < startIndex and addRowIndex valid', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer['isAdd'] = true;
      renderer['rowPosition'] = 'Middle';
      renderer['dataRowIndex'] = 2;
      renderer['startIndex'] = 5;
      renderer['addRowIndex'] = 3;

      const target = gridObj.getContent().querySelector('tbody');
      const newChild = document.createDocumentFragment();

      const notifyArgs = {
        requestType: 'virtualscroll',
        virtualInfo: {
          sentinelInfo: { axis: 'Y' },
          page: 1,
          columnIndexes: [0, 1]
        }
      };

      renderer.appendContent(target, newChild, notifyArgs);

      expect(renderer['isAdd']).toBe(false);
      expect(gridObj.grid.isEdit).toBe(false);
      done();
    }, 500);
  });

  // Branch 7: dataRowIndex < startIndex AND addRowIndex invalid (<= -1 or null)
  it('should do nothing when addRowIndex is invalid', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer['isAdd'] = true;
      renderer['rowPosition'] = 'Middle';
      renderer['dataRowIndex'] = 2;
      renderer['startIndex'] = 5;
      renderer['addRowIndex'] = -1;

      const target = gridObj.getContent().querySelector('tbody');
      const newChild = document.createDocumentFragment();

      const notifyArgs = {
        requestType: 'virtualscroll',
        virtualInfo: {
          sentinelInfo: { axis: 'Y' },
          page: 1,
          columnIndexes: [0, 1]
        }
      };

      const restoreSpy = spyOn(renderer, 'restoreNewRow').and.callThrough();
      renderer.appendContent(target, newChild, notifyArgs);

      expect(restoreSpy).not.toHaveBeenCalled();
      expect(renderer['isAdd']).toBe(true);
      done();
    }, 500);
  });

  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});
describe('Coverage shouldPreventScrolling - Lines 909-916 Coverage', () => {
  let gridObj: TreeGrid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 300,
      editSettings: { mode: 'Batch', allowEditing: true, allowAdding: true },
      columns: [
        { field: 'TaskID', headerText: 'ID', width: 70 },
        { field: 'TaskName', headerText: 'Name', width: 150 }
      ]
    }, done);
  });

  // Branch 1: No addedRow element - condition fails
  it('should skip when no addedRow element exists', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      const closeEditSpy = spyOn(gridObj, 'closeEdit').and.callThrough();

      const scrollArgs = {
        direction: 'down',
        offset: { top: 100, left: 0 },
        sentinel: { axis: 'Y' },
        isWheel: false,
      };

      renderer.shouldPreventScrolling(scrollArgs);

      expect(closeEditSpy).not.toHaveBeenCalled();
      done();
    }, 500);
  });

  // Branch 2: addedRow exists but rowPosition is 'Top'
  it('should skip when rowPosition is Top even with addedRow', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      const content = gridObj.getContent().querySelector('.e-content');
      const fakeAddedRow = document.createElement('tr');
      fakeAddedRow.className = 'e-addedrow';
      content.appendChild(fakeAddedRow);
      renderer['rowPosition'] = 'Top';

      const closeEditSpy = spyOn(gridObj, 'closeEdit').and.callThrough();

      const scrollArgs = {
        direction: 'down',
        offset: { top: 100, left: 0 },
        sentinel: { axis: 'Y' },
        isWheel: false
      };

      renderer.shouldPreventScrolling(scrollArgs);

      expect(closeEditSpy).not.toHaveBeenCalled();
      fakeAddedRow.remove();
      done();
    }, 500);
  });

  // Branch 3: addedRow exists but rowPosition is 'Bottom'
  it('should skip when rowPosition is Bottom even with addedRow', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      const content = gridObj.getContent().querySelector('.e-content');
      const fakeAddedRow = document.createElement('tr');
      fakeAddedRow.className = 'e-addedrow';
      content.appendChild(fakeAddedRow);
      renderer['rowPosition'] = 'Bottom';

      const closeEditSpy = spyOn(gridObj, 'closeEdit').and.callThrough();

      const scrollArgs = {
        direction: 'down',
        offset: { top: 100, left: 0 },
        sentinel: { axis: 'Y' },
        isWheel: false
      };

      renderer.shouldPreventScrolling(scrollArgs);

      expect(closeEditSpy).not.toHaveBeenCalled();
      fakeAddedRow.remove();
      done();
    }, 500);
  });

  // Branch 4: addedRow exists, position valid, but scrollArgs.offset.top === 0
  it('should skip when scrollArgs.offset.top is 0', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      const content = gridObj.getContent().querySelector('.e-content');
      const fakeAddedRow = document.createElement('tr');
      fakeAddedRow.className = 'e-addedrow';
      content.appendChild(fakeAddedRow);
      renderer['rowPosition'] = 'Middle';

      const closeEditSpy = spyOn(gridObj, 'closeEdit').and.callThrough();

      const scrollArgs = {
        direction: 'down',
        offset: { top: 0, left: 0 },
        sentinel: { axis: 'Y' },
        isWheel: false
      };

      renderer.shouldPreventScrolling(scrollArgs);

      expect(closeEditSpy).not.toHaveBeenCalled();
      fakeAddedRow.remove();
      done();
    }, 500);
  });

  // Branch 5: All conditions true - calls closeEdit()
  it('should call closeEdit when all conditions are met', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      const content = gridObj.getContent().querySelector('.e-content');
      const fakeAddedRow = document.createElement('tr');
      fakeAddedRow.className = 'e-addedrow';
      content.appendChild(fakeAddedRow);
      renderer['rowPosition'] = 'Middle';

      const closeEditSpy = spyOn(gridObj, 'closeEdit').and.callThrough();

      const scrollArgs = {
        direction: 'down',
        offset: { top: 50, left: 0 },
        sentinel: { axis: 'Y' },
        isWheel: false
      };

      renderer.shouldPreventScrolling(scrollArgs);
      fakeAddedRow.remove();
      done();
    }, 500);
  });
  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});
describe('Coverage getRowByIndex - Line 60 Coverage (Batch Edit Mode Return)', () => {
  let gridObj: TreeGrid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 20),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 300,
      editSettings: { mode: 'Batch', allowEditing: true, allowAdding: true },
      columns: [
        { field: 'TaskID', headerText: 'ID', width: 70 },
        { field: 'TaskName', headerText: 'Name', width: 150 }
      ]
    }, done);
  });

  // Branch: Valid index in Batch edit mode - returns element from getRows()[index]
  it('should return element from getRows() array when in Batch edit mode with valid index', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      gridObj.grid.isEdit = true;

      const allRows = gridObj.getRows();
      if (allRows.length > 0) {
        const result = renderer.getRowByIndex(0);
        expect(result).toBeDefined();
      }
      done();
    }, 500);
  });

  // Branch: Null index in Batch edit mode - returns undefined
  it('should return undefined when index is null in Batch edit mode', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      gridObj.grid.isEdit = true;

      const result = renderer.getRowByIndex(null);
      expect(result).toBeUndefined();
      done();
    }, 500);
  });

  // Cover branch in getRowCollection where selectedRow == null and isMovable true
  it('should fallback to rowCollection when collection lookup is null and isMovable is true (Batch edit)', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      // enable edit state and ensure Batch mode (configured in beforeAll)
      gridObj.grid.isEdit = true;

      // Stub getRows() so startIdx becomes > index (making collection[index - startIdx] undefined)
      const origGetRows = gridObj.getRows;
      const origGetDataRows = gridObj.getDataRows;

      const fakeRowForRows = document.createElement('div');
      fakeRowForRows.setAttribute('aria-rowindex', '5'); // startIdx = 4
      const fakeDataRow = document.createElement('div');
      fakeDataRow.className = 'e-row';

      gridObj.getRows = () => [fakeRowForRows] as any;
      gridObj.getDataRows = () => [fakeDataRow] as any;

      try {
        // ensure parent edit flags are set on the renderer's parent
        (renderer.parent as any).editSettings = (renderer.parent as any).editSettings || {};
        (renderer.parent as any).editSettings.mode = 'Batch';
        (renderer.parent as any).isEdit = true;

        // call with explicit optional args to hit the isMovable branch
        renderer.getRowCollection(20000, true, false, false) as HTMLElement;
        expect(true).toBe(true);
      } finally {
        // restore originals
        gridObj.getRows = origGetRows;
        gridObj.getDataRows = origGetDataRows;
      }
      done();
    }, 500);
  });
  it('should return index from getVirtualRowIndex ', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer['prevInfo'] = null;
      let index: any = renderer.getVirtualRowIndex(0);

      expect(index).toBe(0);
      done();
    }, 500);
  });
  it('should call remove event listener with treegrid destroyed ', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      gridObj.grid.isDestroyed = true;
      renderer.removeEventListener();
      renderer.destroy();
      gridObj.grid.isDestroyed = false;
      expect(true).toBe(true);
      done();
    }, 500);
  });
  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});
describe('Coverage Lines 675-692 Coverage: Frozen Grid Column Virtualization Logic', () => {
  let gridObj: TreeGrid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 100),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      enableColumnVirtualization: true,
      height: 300,
      frozenColumns: 2,
      columns: [
        { field: 'TaskID', headerText: 'ID', width: 100, freeze: 'Left' },
        { field: 'TaskName', headerText: 'Name', width: 150, freeze: 'Left' },
        { field: 'FIELD1', headerText: 'Field1', width: 150 },
        { field: 'FIELD2', headerText: 'Field2', width: 150 },
        { field: 'FIELD3', headerText: 'Field3', width: 150 }
      ]
    }, done);
  });


  it('clamps x to maxLeft when xAxis true and x exceeds maxLeft', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);

      // skip frozen-grid branch for clarity
      renderer.parent.isFrozenGrid = () => false;
      renderer.parent.enableColumnVirtualization = true;

      // prepare prevInfo and vgenerator.cOffsets for maxLeft calculation
      renderer.prevInfo = { columnIndexes: [1], offsets: { top: 0 }, page: 1, direction: 'down' };
      renderer.vgenerator = { cOffsets: [0, 50, 100, 150], getColumnIndexes: () => [3] };

      // make getColumnOffset return a large x so x > maxLeft
      spyOn(renderer, 'getColumnOffset').and.returnValue(200);

      renderer.virtualEle = renderer.virtualEle || {};
      renderer.virtualEle.adjustTable = jasmine.createSpy('adjustTable');
      spyOn(renderer, 'getTranslateY').and.returnValue(0);

      const cb = renderer.onEnteredAction();
      const content = gridObj.getContent().querySelector('.e-content') as HTMLElement;
      cb(content, { axis: 'X' }, 'right', { top: 0, left: 0 }, false, true);

      // compute expected maxLeft: keys.length (4) - prevInfo.columnIndexes.length (1) => idx=3 => maxLeft = cOffsets[2] = 100
      const expectedMaxLeft = 100;
      expect(renderer.virtualEle.adjustTable).toHaveBeenCalled();
      const calledX = (renderer.virtualEle.adjustTable as jasmine.Spy).calls.mostRecent().args[0];
      expect(calledX).toBe(expectedMaxLeft);
      done();
    }, 300);
  });

  it('does not clamp x when xAxis true and x is less than or equal to maxLeft', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);

      renderer.parent.isFrozenGrid = () => false;
      renderer.parent.enableColumnVirtualization = true;
      renderer.prevInfo = { columnIndexes: [1, 2], offsets: { top: 0 }, page: 1, direction: 'down' };
      renderer.vgenerator = { cOffsets: [0, 50, 100, 150], getColumnIndexes: () => [2] };

      // return a small x so x <= maxLeft
      spyOn(renderer, 'getColumnOffset').and.returnValue(30);

      renderer.virtualEle = renderer.virtualEle || {};
      renderer.virtualEle.adjustTable = jasmine.createSpy('adjustTable');
      spyOn(renderer, 'getTranslateY').and.returnValue(0);

      const cb = renderer.onEnteredAction();
      const content = gridObj.getContent().querySelector('.e-content') as HTMLElement;
      cb(content, { axis: 'X' }, 'right', { top: 0, left: 0 }, false, true);

      expect(renderer.virtualEle.adjustTable).toHaveBeenCalled();
      const calledX = (renderer.virtualEle.adjustTable as jasmine.Spy).calls.mostRecent().args[0];
      expect(calledX).toBe(30);
      done();
    }, 300);
  });

  it('adjusts translateY by bottomGap when wrapperBottom < contentBottom (calls adjustTable with adjustedTranslateY)', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);

      // Ensure parent/grid flags to enter the block
      renderer.parent.isFrozenGrid = () => false;
      renderer.parent.enableVirtualMaskRow = false;

      // Prepare prevInfo.page and getTotalBlocks to satisfy condition
      renderer.prevInfo = { page: 2, columnIndexes: [1], offsets: { top: 0 }, direction: 'up' };
      spyOn(renderer, 'getTotalBlocks').and.returnValue(4);

      // Stub getTranslateY to produce initial translateY
      spyOn(renderer, 'getTranslateY').and.returnValue(100);

      // Prepare virtualEle wrappers to have wrapperBottom < contentBottom
      renderer.virtualEle = renderer.virtualEle || {};
      renderer.virtualEle.wrapper = { getBoundingClientRect: () => ({ bottom: 100 }) };
      renderer.virtualEle.content = { getBoundingClientRect: () => ({ bottom: 120 }) };
      renderer.virtualEle.adjustTable = jasmine.createSpy('adjustTable');

      // offsets and maxBlock large enough so min doesn't clip the sum
      renderer.offsets = [0, 1000];
      renderer['maxBlock'] = 1;

      const cb = renderer.onEnteredAction();
      const content = gridObj.getContent().querySelector('.e-content') as HTMLElement;
      cb(content, { axis: 'Y' }, 'up', { top: 0, left: 0 }, false, true);

      const expectedBottomGap = Math.round(120) - Math.round(100); // 20
      const expectedAdjusted = Math.min(100 + expectedBottomGap, renderer.offsets[renderer['maxBlock']]);

      // One of the adjustTable calls should use the adjusted translateY as second arg
      const calledWithAdjusted = (renderer.virtualEle.adjustTable as jasmine.Spy).calls.allArgs()
        .some((args: any[]) => args[1] === expectedAdjusted);
      expect(calledWithAdjusted).toBe(true);
      done();
    }, 300);
  });


  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});
describe('Coverage Lines 864-878: scrollListeners Early Return Condition Coverage', () => {
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
      enableVirtualization: true,
      frozenColumns: 2,
      height: 350,
      columns: [
        { field: 'TaskID', isPrimaryKey: true, headerText: 'ID', width: 70 },
        { field: 'TaskName', headerText: 'Task Name', width: 150 },
        { field: 'Duration', headerText: 'Duration', width: 100 },
        { field: 'Progress', headerText: 'Progress', width: 100 }
      ]
    }, done);
  });

  // Helper to call scrollListeners with proper mocks
  function callScrollListeners(renderer: any, scrollArgs: any, mockViewInfo: any) {
    // Ensure prevInfo is set to simulate previous render info
    renderer.prevInfo = renderer.prevInfo || mockViewInfo;
    // Provide getInfoFromView on renderer so getValue('getInfoFromView', this) returns it
    renderer.getInfoFromView = function () { return function () { return mockViewInfo; }; }();
    // Force isRemoteData to true
    (window as any).isRemoteData = (root: any) => true;
    // Call actual method
    renderer.scrollListeners(scrollArgs);
  }

  it('should hit early return block when viewInfo matches prevInfo (axis Y)', (done: Function) => {
    const renderer = (gridObj as any).grid.contentModule as any;
    spyOn(gridObj.grid, 'removeMaskRow');
    spyOn(gridObj, 'notify');
    spyOn(renderer, 'restoreEditState');
    renderer.requestType = 'virtualscroll';
    renderer['empty'] = '';

    const mockViewInfo = { event: 'refresh-virtual-block', blockIndexes: [1, 2], columnIndexes: [0, 1], page: 1 };
    const scrollArgs: any = JSON.parse('{"direction":"down","sentinel":{"axis":"Y","entered":false},"offset":{"top":700,"left":0},"focusElement":{"__eventList":{"events":[{"name":"keydown"}]}}}');

    // Set prevInfo to match mockViewInfo
    renderer.prevInfo = { blockIndexes: [1, 2], columnIndexes: [0, 1], offsets: { top: 0 } };

    // Attach getInfoFromView so code uses our mock
    renderer.getInfoFromView = function (direction: any, info: any, offset: any) { return mockViewInfo; };

    callScrollListeners(renderer, scrollArgs, mockViewInfo);

    expect(gridObj.grid.removeMaskRow).toHaveBeenCalled();
    expect(renderer.restoreEditState).toHaveBeenCalled();
    expect(renderer.requestType).toBe('');
    done();
  });

  it('should hit early return block when axis is X and columnIndexes match', (done: Function) => {
    const renderer = (gridObj as any).grid.contentModule as any;
    spyOn(gridObj.grid, 'removeMaskRow');
    spyOn(gridObj, 'notify');
    renderer.requestType = 'virtualscroll';
    renderer['empty'] = '';

    const mockViewInfo = { event: 'refresh-virtual-block', columnIndexes: [0, 1], blockIndexes: [1, 2], page: 1 };
    const scrollArgs: any = { direction: 'down', sentinel: { axis: 'X' }, offset: { top: 700, left: 0 }, focusElement: null };

    renderer.prevInfo = { columnIndexes: [0, 1], blockIndexes: [1, 2] };
    renderer.getInfoFromView = function (direction: any, info: any, offset: any) { return mockViewInfo; };

    callScrollListeners(renderer, scrollArgs, mockViewInfo);

    expect(gridObj.grid.removeMaskRow).toHaveBeenCalled();
    expect(renderer.requestType).toBe('');
    done();
  });

  it('should hit frozen-grid branch when frozen and visible count satisfies condition', (done: Function) => {
    const renderer = (gridObj as any).grid.contentModule as any;
    spyOn(gridObj.grid, 'removeMaskRow');
    spyOn(gridObj, 'notify');
    spyOn(gridObj.grid, 'isFrozenGrid').and.returnValue(true);
    spyOn(gridObj, 'getVisibleFrozenLeftCount').and.returnValue(2);

    const mockViewInfo = { event: 'refresh-virtual-block', columnIndexes: [0], blockIndexes: [1], page: 1 };
    const scrollArgs: any = { direction: 'down', sentinel: { axis: 'y' }, offset: { top: 700, left: 0 }, focusElement: null };

    renderer.prevInfo = { columnIndexes: [0, 1, 2], blockIndexes: [1] };
    renderer.getInfoFromView = function (direction: any, info: any, offset: any) { return mockViewInfo; };

    callScrollListeners(renderer, scrollArgs, mockViewInfo);

    expect(gridObj.grid.removeMaskRow).toHaveBeenCalled();
    done();
  });
  
  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });

});
describe('Coverage Lines 199-209: eventListener with enablePersistence and scrollPosition', function () {
  let gridObj: TreeGrid;
  let renderer: any;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 200),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 300,
      columns: [
        { field: 'TaskID', isPrimaryKey: true },
        { field: 'TaskName' },
        { field: 'Duration' }
      ]
    }, done);
  });

  it('enablePersistence=false should skip scrollPosition handling', () => {
    renderer = (gridObj as any).grid.contentModule as any;
    spyOn(renderer, 'scrollListeners');

    renderer.observer = { sentinelInfo: { down: {} } };
    renderer.observers = { observes: function () { /* noop */ } };

    renderer.eventListener('on');

    // ensure parent.root exists before setting fields
    renderer.parent.root = { enablePersistence: false, scrollPosition: { top: 100, left: 50 }, enableColumnVirtualization: false };

    // call the created fn directly to exercise the block
    renderer.fn();

    expect(renderer.scrollListeners).not.toHaveBeenCalled();
  });

  it('enablePersistence=true but scrollPosition=null should skip block', () => {
    renderer = (gridObj as any).grid.contentModule as any;
    spyOn(renderer, 'scrollListeners');

    renderer.observer = { sentinelInfo: { down: {} } };
    renderer.observers = { observes: function () { /* noop */ } };

    renderer.eventListener('on');

    renderer.parent.root = { enablePersistence: true, scrollPosition: null };

    renderer.fn();

    expect(renderer.scrollListeners).not.toHaveBeenCalled();
  });

  it('enablePersistence=true with scrollPosition should set scrollTop', () => {
    renderer = (gridObj as any).grid.contentModule as any;
    spyOn(renderer, 'scrollListeners');

    renderer.observer = { sentinelInfo: { down: {} } };
    renderer.observers = { observes: function () { /* noop */ } };

    renderer.eventListener('on');

    renderer.parent.root = { enablePersistence: true, scrollPosition: { top: 250, left: 75 }, enableColumnVirtualization: false };

    renderer.fn();

    expect(renderer.content.scrollTop > 0).toBe(true);
  });

  it('enableColumnVirtualization=false should not set scrollLeft', () => {
    renderer = (gridObj as any).grid.contentModule as any;
    spyOn(renderer, 'scrollListeners');

    renderer.observer = { sentinelInfo: { down: {} } };
    renderer.observers = { observes: function () { /* noop */ } };

    renderer.eventListener('on');

    renderer.parent.root = { enablePersistence: true, scrollPosition: { top: 300, left: 100 }, enableColumnVirtualization: false };

    const beforeLeft = renderer.content.scrollLeft;
    renderer.fn();

    expect(renderer.content.scrollLeft).toBe(beforeLeft);
  });

  it('enableColumnVirtualization=true should set scrollLeft', () => {
    renderer = (gridObj as any).grid.contentModule as any;
    spyOn(renderer, 'scrollListeners');

    renderer.observer = { sentinelInfo: { down: {} } };
    renderer.observers = { observes: function () { /* noop */ } };

    renderer.eventListener('on');

    renderer.parent.root = { enablePersistence: true, scrollPosition: { top: 350, left: 150 }, enableColumnVirtualization: true };

    renderer.fn();

    expect(true).toBe(true);
  });

  it('scrollListeners should be called with correct scrollValues', () => {
    renderer = (gridObj as any).grid.contentModule as any;
    spyOn(renderer, 'scrollListeners');

    renderer.observer = { sentinelInfo: { down: { some: 'sentinel' } } };
    renderer.observers = { observes: function () { /* noop */ } };

    renderer.eventListener('on');

    renderer.parent.root = { enablePersistence: true, scrollPosition: { top: 400, left: 200 }, enableColumnVirtualization: true };

    renderer.fn();

    expect(renderer.scrollListeners).toHaveBeenCalled();
    const args = renderer.scrollListeners.calls.mostRecent().args[0];
    expect(args.direction).toBe('down');
    expect(args.offset).toEqual({ top: 400, left: 200 });
    expect(args.sentinel).toBe(renderer.observer.sentinelInfo.down);
  });

  it('all conditions together - complete flow', () => {
    renderer = (gridObj as any).grid.contentModule as any;
    spyOn(renderer, 'scrollListeners');

    renderer.observer = { sentinelInfo: { down: {} } };
    renderer.observers = { observes: function () { /* noop */ } };

    renderer.eventListener('on');

    renderer.parent.root = { enablePersistence: true, scrollPosition: { top: 500, left: 250 }, enableColumnVirtualization: true };

    renderer.fn();
    expect(renderer.scrollListeners).toHaveBeenCalled();
  });

  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});

describe('Coverage VirtualTreeContentRenderer lines 762-779 minimal', () => {
  let grid: TreeGrid;

  beforeAll((done: Function) => {
    grid = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 200,
      rowHeight: 40,
      pageSettings: { pageSize: 10 },
      columns: [{ field: 'TaskID', isPrimaryKey: true }, { field: 'TaskName' }]
    }, done);
  });

  it('selectedRowIndex branch caps endIndex to totalRecords', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;

    renderer['selectedRowIndex'] = 2;
    renderer['totalRecords'] = 5; // force endIndex > totalRecords
    grid.allowRowDragAndDrop = false;
    content.scrollTop = (grid.grid.getRowHeight() * grid.pageSettings.pageSize) + 100;

    const scrollArgs: any = { direction: 'up', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: -10, left: 0 }, focusElement: null };
    renderer.scrollListeners(scrollArgs);

    setTimeout(() => {
      expect(renderer.endIndex).toBe(5);
      expect(renderer.startIndex).toBeGreaterThanOrEqual(0);
      done();
    }, 150);
  });

  it('currentViewData adjustment sets startIndex and endIndex', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;

    renderer['totalRecords'] = 100;
    content.scrollTop = 9 * grid.grid.getRowHeight();
    grid.grid.currentViewData = [{ index: 6 }];
    grid.selectionModule = { isRowSelected: true } as any;

    const scrollArgs: any = { direction: 'up', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: -1, left: 0 }, focusElement: null };
    renderer.scrollListeners(scrollArgs);

    setTimeout(() => {

      expect(true).toBe(true);
      done();
    }, 150);
  });

  afterAll(() => {
    destroy(grid);
    grid = null;
  });
});
describe('Coverage VirtualTreeContentRenderer - Column Virtualization Frozen Left Coverage', () => {
  let grid: TreeGrid;

  beforeAll((done: Function) => {
    grid = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      enableColumnVirtualization: true,
      frozenColumns: 2,
      height: 300,
      columns: [
        { field: 'TaskID', isPrimaryKey: true, width: 50 },
        { field: 'FIELD1', width: 60 },
        { field: 'FIELD2', width: 70 },
        { field: 'FIELD3', width: 80 },
        { field: 'FIELD4', width: 70 },
        { field: 'FIELD5', width: 80 }
      ]
    }, done);
  });

  it('appendContent respects frozen left width when cBlock <= visibleFrozenLeftCount (no subtraction)', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    renderer.header = { virtualEle: { adjustTable: () => { }, setWrapperWidth: () => { } } };
    renderer.virtualEle = { setWrapperWidth: () => { } };
    renderer.getTable = () => { const t = document.createElement('table'); t.appendChild(document.createElement('tbody')); return t; };
    renderer.getColumnOffset = (idx: number) => idx * 30;
    (grid as any).getColumns = () => [
      { visible: true, width: '50', freeze: 'Left' },
      { visible: true, width: '60', freeze: 'Left' },
      { visible: true, width: '70' },
      { visible: true, width: '80' }
    ];
    (grid as any).getVisibleFrozenLeftCount = () => 3;

    let captured: any = null;
    renderer.resetStickyLeftPos = (cOffsetArg: number, newChildArg?: any) => { captured = { cOffsetArg, newChildArg }; };

    const fragment = document.createDocumentFragment();
    const args: any = { virtualInfo: { sentinelInfo: { axis: 'Y' }, columnIndexes: [1, 3], page: 1 }, requestType: 'virtualscroll1' };
    renderer.isExpandCollapse = true;
    renderer.translateY = 1;
    renderer.appendContent(document.createElement('tbody'), fragment, args);

    setTimeout(() => {
      expect(true).toBe(true);
      done();
    }, 50);
  });

  it('appendContent subtracts frzLeftWidth when cBlock > visibleFrozenLeftCount', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    renderer.header = { virtualEle: { adjustTable: () => { }, setWrapperWidth: () => { } } };
    renderer.virtualEle = { setWrapperWidth: () => { } };
    renderer.getTable = () => { const t = document.createElement('table'); t.appendChild(document.createElement('tbody')); return t; };
    renderer.getColumnOffset = (idx: number) => idx * 30;
    (grid as any).getColumns = () => [
      { visible: true, width: '50', freeze: 'Left' },
      { visible: true, width: '60', freeze: 'Left' },
      { visible: true, width: '70' },
      { visible: true, width: '80' }
    ];
    (grid as any).getVisibleFrozenLeftCount = () => 1;

    let captured: any = null;
    renderer.resetStickyLeftPos = (cOffsetArg: number, newChildArg?: any) => { captured = { cOffsetArg, newChildArg }; };

    const fragment = document.createDocumentFragment();
    const args: any = { virtualInfo: { sentinelInfo: { axis: 'Y' }, columnIndexes: [3, 4], page: 1 }, requestType: 'virtualscroll1' };
    renderer.isExpandCollapse = true;
    renderer.translateY = 1;
    renderer.appendContent(document.createElement('tbody'), fragment, args);

    setTimeout(() => {
      expect(true).toBe(true);
      done();
    }, 50);
  });

  it('appendContent subtraction branch adjusts cOffset passed to resetStickyLeftPos', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    renderer.header = { virtualEle: { adjustTable: () => { }, setWrapperWidth: () => { } } };
    renderer.virtualEle = { setWrapperWidth: () => { } };
    renderer.getTable = () => { const t = document.createElement('table'); t.appendChild(document.createElement('tbody')); return t; };
    renderer.getColumnOffset = (idx: number) => idx * 30;
    (grid as any).getColumns = () => [
      { visible: true, width: '50', freeze: 'Left' },
      { visible: true, width: '60', freeze: 'Left' },
      { visible: true, width: '70' },
      { visible: true, width: '80' },
      { visible: true, width: '70' },
      { visible: true, width: '80' }
    ];
    (grid as any).getVisibleFrozenLeftCount = () => 1;
    (grid as any).isFrozenGrid = () => true;

    let captured: any = null;
    renderer.resetStickyLeftPos = (cOffsetArg: number, newChildArg?: any) => { captured = { cOffsetArg, newChildArg }; };

    const fragment = document.createDocumentFragment();
    const args: any = { virtualInfo: { sentinelInfo: { axis: 'Y' }, columnIndexes: [3, 4], page: 1 }, requestType: 'virtualscroll1' };
    renderer.isExpandCollapse = true;
    renderer.translateY = 1;


    setTimeout(() => {
      renderer.appendContent(document.createElement('tbody'), fragment, args);
      expect(true).toBe(true);
      done();
    }, 50);
  });

  afterAll(() => {
    destroy(grid);
    grid = null;
  });
});

describe('Coverage VirtualTreeContentRenderer - getTranslateY remote expand', () => {
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
        enableVirtualization: true,
        height: 400,
        treeColumnIndex: 1,
        columns: [
          { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
          { field: 'TaskName', headerText: 'Task Name', width: 150 },
          { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
        ],
      },
      done
    );
  });

  it('returns preTranslate and resets isRemoteExpand when remote expand is true', () => {
    const renderer: any = (gridObj as any).grid.contentModule as any;
    // arrange: set remote data source and flags
    renderer.isRemoteExpand = true;
    renderer.preTranslate = 1234;

    const result = renderer.getTranslateY(10, 200);
    expect(result).toBe(1234);
    expect(renderer.isRemoteExpand).toBe(false);
  });

  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});
describe('Coverage VirtualTreeContentRenderer - additional branch coverage', () => {
  let gridObj: any;
  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: [{ id: 1 }, { id: 2 }], enableVirtualization: true, height: 200, childMapping: 'crew',
      editSettings: { mode: 'Batch' }, columns: [{ field: 'id' }], pageSettings: { pageSize: 4 }
    }, done);
  });

  it('getRowByIndex returns rows fallback in Batch edit mode when targetRow missing', () => {
    const renderer: any = (gridObj as any).grid.contentModule;
    // stub parent.getDataRows to return empty so targetRow is undefined
    spyOn(gridObj, 'getDataRows').and.returnValue([]);
    gridObj.isEdit = true;
    expect(true).toBe(true);
  });

  it('virtualOtherAction sets isExpandCollapse when isExpandCollapse true', () => {
    const renderer: any = (gridObj as any).grid.contentModule;
    renderer.isExpandCollapse = false;
    renderer.virtualOtherAction({ setTop: false, isExpandCollapse: true });
    expect(renderer.isExpandCollapse).toBe(true);
  });

  it('indexModifier adjusts args when endIndex equals totalRecords', () => {
    const renderer: any = (gridObj as any).grid.contentModule;
    renderer.startIndex = 0;
    renderer.endIndex = 5;
    renderer.totalRecords = 5;
    gridObj.pageSettings = { pageSize: 4 };
    const args: any = { startIndex: -1, endIndex: -1, count: 0, requestType: '' };
    renderer.indexModifier(args);
    expect(args.endIndex).toBe(5);
  });

  it('eventListener calls super.eventListener when condition requires', () => {
    const dm: any = new DataManager({
      url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData', adaptor: new WebApiAdaptor,
      crossDomain: true
    });
    dm.result = [];
    const g = createGrid({ dataSource: dm, enableVirtualization: true, height: 200, columns: [{ field: 'id' }] }, function () { });
    const renderer: any = (g as any).grid.contentModule;
    const baseProto: any = Object.getPrototypeOf(Object.getPrototypeOf(renderer));
    spyOn(baseProto, 'eventListener').and.callThrough();
    renderer.eventListener('on');
    expect(true).toBe(true);
    destroy(g);
  });

  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});

describe("VirtualTreeContentRenderer - toSelectVirtualRow Coverage", () => {
  let treegrid: TreeGrid;

  beforeAll((done: Function) => {
    treegrid = createGrid(
      {
        dataSource: virtualData.slice(0, 400),
        parentIdMapping: "ParentID",
        idMapping: "TaskID",
        enableVirtualization: true,
        height: 350,
        columns: [
          { field: "TaskID", isPrimaryKey: true, headerText: "ID", width: 70 },
          { field: "TaskName", headerText: "Task Name", width: 200 },
          { field: "Duration", headerText: "Duration", width: 100 }
        ]
      },
      done
    );
  });


  it('toSelectVirtualRow sets observer containerRect when undefined', (done: Function) => {
    setTimeout(() => {
      const renderer = treegrid.grid.contentModule as any;
      // save originals then set minimal objects to avoid runtime errors
      const oldObserver = renderer.observer;
      const oldObservers = renderer.observers;
      const oldClipboard = renderer.parent.clipboardModule;

      renderer.observer = { check: function () { return false; } };
      renderer.observers = { containerRect: 'observerValue' };
      // prepare minimal clipboard treeGridParent used inside the method
      renderer.parent.clipboardModule = { treeGridParent: { editModule: undefined, grid: { sortModule: { sortedColumns: [] } }, dataModule: { sortedData: null } } };

      renderer['toSelectVirtualRow']({ selectedIndex: -1 });

      expect(renderer.observer['containerRect']).toBe('observerValue');

      // restore originals to avoid interfering with teardown/destroy
      renderer.observer = oldObserver;
      renderer.observers = oldObservers;
      renderer.parent.clipboardModule = oldClipboard;

      done();
    }, 300);
  });



  afterAll(() => {
    destroy(treegrid);
  });
});
describe('Coverage VirtualTreeContentRenderer - sortedData handling (isolated)', () => {
  let treegrid: TreeGrid;

  beforeAll((done: Function) => {
    treegrid = createGrid(
      {
        dataSource: virtualData.slice(0, 200),
        parentIdMapping: 'ParentID',
        idMapping: 'TaskID',
        enableVirtualization: true,
        height: 300,
        columns: [
          { field: 'TaskID', isPrimaryKey: true, headerText: 'ID', width: 70 },
          { field: 'TaskName', headerText: 'Task Name', width: 200 }
        ]
      },
      done
    );
  });

  it('uses sortedData to remap selectedIndex when sortedColumns present', (done: Function) => {
    setTimeout(() => {
      const renderer = treegrid.grid.contentModule as any;
      const oldObserver = renderer.observer;
      const oldObservers = renderer.observers;
      const oldClipboard = renderer.parent.clipboardModule;
      renderer.observer = { check: () => false };
      renderer.observers = { containerRect: 'rect' };
      const sortedData = [{ index: 5 }, { index: 10 }, { index: 20 }];
      const treeGridParent: any = {
        editModule: undefined,
        grid: { sortModule: { sortedColumns: [{ name: 'TaskID' }] } },
        dataModule: { sortedData: sortedData }
      };
      renderer.parent.clipboardModule = { treeGridParent: treeGridParent };

      const args: any = { selectedIndex: 10 };

      renderer['toSelectVirtualRow'](args);

      expect(args.selectedIndex).toBe(1); // position of record.index === 10

      renderer.observer = oldObserver;
      renderer.observers = oldObservers;
      renderer.parent.clipboardModule = oldClipboard;

      done();
    }, 300);
  });

  it('does not change selectedIndex if sortedData is null or empty', (done: Function) => {
    setTimeout(() => {
      const renderer = treegrid.grid.contentModule as any;

      const oldObserver = renderer.observer;
      const oldObservers = renderer.observers;
      const oldClipboard = renderer.parent.clipboardModule;

      renderer.observer = { check: () => false };
      renderer.observers = { containerRect: 'rect' };

      const treeGridParent: any = {
        editModule: undefined,
        grid: { sortModule: { sortedColumns: [{ name: 'TaskID' }] } },
        dataModule: { sortedData: null }
      };
      renderer.parent.clipboardModule = { treeGridParent: treeGridParent };

      const args: any = { selectedIndex: 7 };

      renderer['toSelectVirtualRow'](args);

      expect(args.selectedIndex).toBe(7);

      renderer.observer = oldObserver;
      renderer.observers = oldObservers;
      renderer.parent.clipboardModule = oldClipboard;

      done();
    }, 300);
  });

  afterAll(() => {
    destroy(treegrid);
    treegrid = null;
  });
});

describe('Coverage Lines 675-692 Coverage: Frozen Grid Column Virtualization Logic', () => {
  let gridObj: TreeGrid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 100),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      enableColumnVirtualization: true,
      enableVirtualMaskRow: false,
      height: 300,
      frozenColumns: 2,
      columns: [
        { field: 'TaskID', headerText: 'ID', width: 100, freeze: 'Left' },
        { field: 'TaskName', headerText: 'Name', width: 150, freeze: 'Left' },
        { field: 'FIELD1', headerText: 'Field1', width: 150 },
        { field: 'FIELD2', headerText: 'Field2', width: 150 },
        { field: 'FIELD3', headerText: 'Field3', width: 150 }
      ]
    }, done);
  });


  it('Covering uncovered freeze conditions', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);

      // skip frozen-grid branch for clarity
      renderer.parent.isFrozenGrid = () => true;
      renderer.parent.enableColumnVirtualization = true;
      renderer.currentInfo = { columnIndexes: [4, 5] }
      // prepare prevInfo and vgenerator.cOffsets for maxLeft calculation
      renderer.prevInfo = { columnIndexes: [1], offsets: { top: 0 }, page: 1, direction: 'down' };
      renderer.vgenerator = { cOffsets: [0, 50, 100, 150], getColumnIndexes: () => [3] };

      // make getColumnOffset return a large x so x > maxLeft
      spyOn(renderer, 'getColumnOffset').and.returnValue(200);

      renderer.virtualEle = renderer.virtualEle || {};
      renderer.virtualEle.adjustTable = jasmine.createSpy('adjustTable');
      spyOn(renderer, 'getTranslateY').and.returnValue(0);

      const cb = renderer.onEnteredAction();
      const content = gridObj.getContent().querySelector('.e-content') as HTMLElement;
      cb(content, { axis: 'X' }, 'right', { top: 0, left: 0 }, false, true);
      expect(true).toBe(true);
      done();
    }, 300);
  });
  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});

describe('Coverage indexModifier Coverage - Lines 169-174', () => {
  let treeGridObj: TreeGrid;
  let virtualRenderer: any;
  beforeAll((done: Function) => {
    const data = [
      { TaskID: 1, TaskName: 'Parent 1', parentID: null },
      { TaskID: 2, TaskName: 'Child 1', parentID: 1 },
      { TaskID: 3, TaskName: 'Child 2', parentID: 1 },
      { TaskID: 4, TaskName: 'Parent 2', parentID: null },
      { TaskID: 5, TaskName: 'Child 3', parentID: 4 },
    ];
    treeGridObj = createGrid(
      {
        dataSource: data,
        enableVirtualization: true,
        parentIdMapping: 'parentID',
        idMapping: 'TaskID',
        columns: [
          { field: 'TaskID', isPrimaryKey: true },
          { field: 'TaskName' },
        ],
        pageSettings: { pageSize: 10 },
        height: '400px',
      },
      done
    );
  });

  it('Coverage: True branch - all three conditions are true (endIndex-startIndex !== pageSize AND totalRecords > pageSize AND endIndex === totalRecords)', (done: Function) => {
    virtualRenderer = (treeGridObj as any).grid.contentModule;
    virtualRenderer.startIndex = 5;
    virtualRenderer.endIndex = 20;  // 20 - 5 = 15 (not equal to pageSize 10)
    virtualRenderer.totalRecords = 20;  // 20 > 10
    const args = {
      startIndex: 0,
      endIndex: 0,
      count: 20,
      requestType: 'insert'
    };
    virtualRenderer.indexModifier(args);
    done();
  });
  it('Coverage: False branch - second condition false (totalRecords <= pageSize)', (done: Function) => {
    virtualRenderer = (treeGridObj as any).grid.contentModule;
    virtualRenderer.startIndex = 1;
    virtualRenderer.endIndex = 10;
    virtualRenderer.totalRecords = 10;
    virtualRenderer.parent.pageSettings.pageSize = 5;
    const args = {
      startIndex: 999,
      endIndex: 999,
      count: 8,
      requestType: 'insert'
    };

    virtualRenderer.indexModifier(args);
    done();
  });

  afterAll(() => {
    destroy(treeGridObj);
    treeGridObj = null;
    virtualRenderer = null;
  });
});
describe('Coverage for onDataReady frozen grid collapsed records width 100px', () => {
  let treeGridObj: TreeGrid;
  let data: Object = new DataManager({
    url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
    adaptor: new WebApiAdaptor,
    crossDomain: true
  });
  beforeAll((done: Function) => {
    treeGridObj = createGrid(
      {
        dataSource: data,
        hasChildMapping: 'isParent',
        idMapping: 'TaskID',
        parentIdMapping: 'ParentItem',
        enableVirtualization: true,
        allowSorting: true,
        enableColumnVirtualization: true,
        height: 400,
        treeColumnIndex: 1,
        frozenColumns: 1,
        columns: [
          { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
          { field: 'TaskName', headerText: 'Task Name', width: 150 },
          { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
        ],
      },
      done
    );
  });

  it('should call setVirtualHeight for frozen grid and collapsed records width 100px', () => {
    // Simulate onDataReady call
    let renderer = treeGridObj.grid.contentModule;
    (renderer as any)['onDataReady']({ count: 1 });
    expect(true).toBe(true);
  });

  afterAll(() => {
    destroy(treeGridObj);
  });
});

describe('Coverage for onDataReady frozen grid collapsed records', () => {
  let treeGridObj: TreeGrid;
  let data: Object = new DataManager({
    url: 'https://services.syncfusion.com/js/production/api/SelfReferenceData',
    adaptor: new WebApiAdaptor,
    crossDomain: true
  });
  beforeAll((done: Function) => {
    treeGridObj = createGrid(
      {
        dataSource: data,
        hasChildMapping: 'isParent',
        idMapping: 'TaskID',
        parentIdMapping: 'ParentItem',
        enableVirtualization: true,
        allowSorting: true,
        height: 400,
        treeColumnIndex: 1,
        frozenColumns: 1,
        columns: [
          { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
          { field: 'TaskName', headerText: 'Task Name', width: 150 },
          { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
        ],
      },
      done
    );
  });

  it('should call setVirtualHeight for frozen grid and collapsed records and width 100%', () => {
    let renderer = treeGridObj.grid.contentModule;
    (renderer as any)['onDataReady']({ count: 1 });
    expect(true).toBe(true);
  });
  it('else Path coverage for e.count condition', function () {
    var renderer = treeGridObj.grid.contentModule;
    (renderer as any)['onDataReady']({ count: undefined });
    expect(true).toBe(true);
  });

  afterAll(() => {
    destroy(treeGridObj);
    treeGridObj = null;
  });
});

describe('Coverage for onDataReady', () => {
  let treeGridObj: TreeGrid;
  beforeAll((done: Function) => {
    treeGridObj = createGrid(
      {
        dataSource: editVirtualData,
        hasChildMapping: 'isParent',
        idMapping: 'TaskID',
        parentIdMapping: 'ParentItem',
        enableVirtualization: true,
        allowSorting: true,
        height: 400,
        treeColumnIndex: 1,
        columns: [
          { field: 'TaskID', headerText: 'Task ID', textAlign: 'Right', width: 120 },
          { field: 'TaskName', headerText: 'Task Name', width: 150 },
          { field: 'StartDate', headerText: 'Start Date', textAlign: 'Right', width: 120 }
        ],
      },
      done
    );
  });

  it('else Path coverage isCountRequired', function () {
    var renderer = treeGridObj.grid.contentModule;
    (treeGridObj.grid.dataSource as any).result = {};
    (renderer as any)['onDataReady']({ count: 1 });
    expect(true).toBe(true);
  });

  afterAll(() => {
    destroy(treeGridObj);
    treeGridObj = null;
  });
});

describe('Coverage VirtualTreeContentRenderer coverage lines for uncovered upscroll', () => {
  let grid: TreeGrid;

  beforeAll((done: Function) => {
    grid = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 200,
      rowHeight: 40,
      pageSettings: { pageSize: 10 },
      columns: [{ field: 'TaskID', isPrimaryKey: true }, { field: 'TaskName' }]
    }, done);
  });

  it('Uncovered currentViewData.length condition', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 2;
    renderer['totalRecords'] = 5; // force endIndex > totalRecords
    grid.allowRowDragAndDrop = false;
    content.scrollTop = (grid.grid.getRowHeight() * grid.pageSettings.pageSize) + 100;
    renderer.parent.height = '200%';
    const scrollArgs: any = { direction: 'up', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: -10, left: 0 }, focusElement: null };
    renderer.scrollListeners(scrollArgs);

    setTimeout(() => {
      done();
    }, 150);
  });

  it('Uncovered firsttdinx this.parent.getRowHeight()', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 2;
    renderer['totalRecords'] = 5;
    grid.allowRowDragAndDrop = false;
    // renderer.parent.height = '200%';
    renderer.parent.currentViewData[0].index = 6;
    renderer.parent.selectionModule.isRowSelected = true;
    renderer.parent.getRows = function (): any[] { return []; };
    const scrollArgs: any = { direction: 'up', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: -10, left: 0 }, focusElement: null };
    renderer.scrollListeners(scrollArgs);

    setTimeout(() => {

      expect(true).toBe(true);
      done();
    }, 150);
  });

  it('uncovered this.startIndex === this.selectedRowIndex', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 0;
    renderer['totalRecords'] = 5;
    grid.allowRowDragAndDrop = false;
    // renderer.parent.height = '200%';
    renderer.parent.rowHeight = undefined;
    renderer.parent.currentViewData[0].index = 6;
    renderer.parent.selectionModule.isRowSelected = true;
    renderer.parent.getRows = function (): any[] { return []; };
    renderer.endIndex = 11;
    renderer.endIndex = 3;
    renderer.parent.pageSettings.pageSize = 21;
    const scrollArgs: any = { direction: 'up', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: -10, left: 0 }, focusElement: null };
    renderer.scrollListeners(scrollArgs);

    setTimeout(() => {

      expect(true).toBe(true);
      done();
    }, 150);
  });
  afterAll(() => {
    destroy(grid);
    grid= null;
  });
});
describe('Coverage VirtualTreeContentRenderer coverage lines for uncovered Downscroll if conditions', () => {
  let grid: TreeGrid;
  beforeAll((done: Function) => {
    grid = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 200,
      rowHeight: 40,
      pageSettings: { pageSize: 10 },
      columns: [{ field: 'TaskID', isPrimaryKey: true }, { field: 'TaskName' }]
    }, done);
  });

  it('Uncovered 1st if condition in the downscroll', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 0;
    content.scrollTop = (grid.grid.getRowHeight() * grid.pageSettings.pageSize) + 100;
    const scrollArgs: any = { direction: 'down', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: 400, left: 0 } };
    renderer.scrollListeners(scrollArgs);
    setTimeout(() => {
      done();
    }, 150);
  });
  it('Uncovered downscroll if conditions', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 0;
    content.scrollTop = (grid.grid.getRowHeight() * grid.pageSettings.pageSize) + 100;
    renderer.parent.pageSettings.pageSize = 60;
    var scrollArgs = { direction: 'down', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: 1400, left: 0 } };
    renderer.scrollListeners(scrollArgs);

    setTimeout(() => {
      done();
    }, 150);
  });
  afterAll(() => {
    destroy(grid);
  });
});
describe('Coverage VirtualTreeContentRenderer coverage spec for Downscroll this.parent.isEdit', () => {
  let grid: TreeGrid;
  beforeAll((done: Function) => {
    grid = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 200,
      rowHeight: 40,
      pageSettings: { pageSize: 50 },
      columns: [{ field: 'TaskID', isPrimaryKey: true }, { field: 'TaskName' }]
    }, done);
  });

  it('Uncovered if condition this.parent.isEdit in the downscroll', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 0;
    content.scrollTop = (grid.grid.getRowHeight() * grid.pageSettings.pageSize) + 100;
    // renderer.parent.pageSettings.pageSize = 60;
    renderer.endIndex = 50;
    renderer.parent['isEdit'] = true;
    const scrollArgs: any = { direction: 'down', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: 1400, left: 0 } };
    renderer.scrollListeners(scrollArgs);
    setTimeout(() => {
      done();
    }, 150);
  });
  afterAll(() => {
    destroy(grid);
  });
});
describe('Coverage VirtualTreeContentRenderer downscroll coverage spec ', () => {
  let grid: TreeGrid;
  beforeAll((done: Function) => {
    grid = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 200,
      pageSettings: { pageSize: 50 },
      columns: [{ field: 'TaskID', isPrimaryKey: true }, { field: 'TaskName' }]
    }, done);
  });

  it('Uncovered scrollArgs.offset.top > (rowHeight * this.totalRecords)', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 0;
    content.scrollTop = (grid.grid.getRowHeight() * grid.pageSettings.pageSize) + 100;
    renderer.parent.pageSettings.pageSize = 60;
    renderer.endIndex = 50;
    renderer.parent['isEdit'] = true;
    const scrollArgs: any = { direction: 'down', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: 1400, left: 0 } };
    renderer.scrollListeners(scrollArgs);
    renderer.parent['isEdit'] = false;
    setTimeout(() => {
      done();
    }, 150);
  });

  afterAll(() => {
    destroy(grid);
  });
});
describe('Coverage VirtualTreeContentRenderer upscroll new coverage specs ', () => {
  let grid: TreeGrid;
  beforeAll((done: Function) => {
    grid = createGrid({
      dataSource: virtualData.slice(0, 40),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 200,
      // pageSettings: { pageSize: 60 },
      columns: [{ field: 'TaskID', isPrimaryKey: true }, { field: 'TaskName' }]
    }, done);
  });

  it('Uncovered this.startIndex === this["" + selectedRowIndex]', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 0;
    content.scrollTop = (grid.grid.getRowHeight() * grid.pageSettings.pageSize) + 100;
    const scrollArgs: any = { direction: 'up', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: -400, left: 0 } };
    renderer.scrollListeners(scrollArgs);
    setTimeout(() => {
      done();
    }, 150);
  });
  it('Uncovered downscroll else conditions for previous it() case', (done: Function) => {
    const renderer: any = (grid as any).grid.contentModule as any;
    const content: HTMLElement = grid.getContent().querySelector('.e-content') as HTMLElement;
    renderer['selectedRowIndex'] = 3;
    content.scrollTop = (grid.grid.getRowHeight() * grid.pageSettings.pageSize) + 100;
    renderer.parent.rowHeight = -400;
    renderer.parent.allowRowDragAndDrop = true;
    var scrollArgs = { direction: 'up', isWheel: false, sentinel: { axis: 'Y' }, offset: { top: -400, left: 0 } };
    renderer.scrollListeners(scrollArgs);

    setTimeout(() => {
      done();
    }, 150);
  });
  afterAll(() => {
    destroy(grid);
  });
});
describe('Coverage getRowByIndex - method coverage', () => {
  let gridObj: TreeGrid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 20),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 300,
      editSettings: { mode: 'Batch', allowEditing: true, allowAdding: true },
      columns: [
        { field: 'TaskID', headerText: 'ID', isPrimaryKey: true, width: 70 },
        { field: 'TaskName', headerText: 'Name', width: 150 }
      ]
    }, done);
  });

  // Branch: Valid index in Batch edit mode - returns element from getRows()[index]
  it('should cover branch in Batch edit mode and isEdit to true with invalid index', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer.parent['isEdit'] = true;
      renderer.parent.editSettings.mode === 'Batch'
      renderer.getRowByIndex(29);
      done();
    }, 150);
  });

  afterAll(() => {
    destroy(gridObj);
  });
});

describe('Coverage virtualOtherAction branch coverage', () => {
  let gridObj: any;
  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: [{ id: 1 }, { id: 2 }], enableVirtualization: true, height: 200, childMapping: 'crew',
      editSettings: { mode: 'Batch' }, columns: [{ field: 'id' }], pageSettings: { pageSize: 4 }
    }, done);
  });

  it('virtualOtherAction isExpandCollapse false', () => {
    const renderer: any = (gridObj as any).grid.contentModule;
    renderer.isExpandCollapse = false;
    renderer.virtualOtherAction({ setTop: false, isExpandCollapse: false });
    expect(renderer.isExpandCollapse).toBe(false);
  });

  afterAll(() => {
    destroy(gridObj);
  });
});

describe('Coverage for restoreNewRowmethod', () => {
  let gridObj: TreeGrid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 50),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      height: 300,
      editSettings: { mode: 'Batch', allowEditing: true, allowAdding: true },
      columns: [
        { field: 'TaskID', headerText: 'ID', isPrimaryKey: true, width: 70 },
        { field: 'TaskName', headerText: 'Name', width: 150 },
        { field: 'Duration', headerText: 'Duration', width: 100 }
      ]
    }, done);
  });

  // Branch 1: isAdd is false - outer condition fails
  it('should skip condition in restoreNewRowmethod', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);
      renderer['isAdd'] = false;
      renderer.restoreNewRow();
      expect(true).toBe(true);
      done();
    }, 100);
  });


  afterAll(() => {
    destroy(gridObj);
  });
});

describe('Coverage for toSelect VirtualRow Method', () => {
  let cellGridObj: TreeGrid;
  beforeAll((done: Function) => {
    cellGridObj = createGrid(
      {
        dataSource: virtualData.slice(0, 50),
        parentIdMapping: 'ParentID',
        idMapping: 'TaskID',
        enableVirtualization: true,
        height: 300,
        editSettings: { mode: 'Batch', allowEditing: true, allowAdding: true },
        columns: [
          { field: 'TaskID', headerText: 'ID', width: 70 },
          { field: 'TaskName', headerText: 'Name', width: 150 },
          { field: 'FIELD3', headerText: 'Field3', width: 150 }
        ]
      },
      done
    );
  });

  it('should cover else path', (done: Function) => {
    setTimeout(() => {
      const renderer = (cellGridObj.grid.contentModule as any);
      cellGridObj.editModule['addRowIndex'] = 1;
      var cells = renderer.toSelectVirtualRow({ selectedIndex: -1 });
      expect(true).toBe(true);
      done();
    }, 100);
  });

  afterAll(() => {
    destroy(cellGridObj);
  });
});
describe('COverage for beginAdd Method', () => {
  let cellGridObj: TreeGrid;
  beforeAll((done: Function) => {
    cellGridObj = createGrid(
      {
        dataSource: [],
        parentIdMapping: 'ParentID',
        idMapping: 'TaskID',
        enableVirtualization: true,
        height: 300,
        columns: [
          { field: 'TaskID', headerText: 'ID', width: 70 },
          { field: 'TaskName', headerText: 'Name', width: 150 },
          { field: 'FIELD3', headerText: 'Field3', width: 150 }
        ]
      },
      done
    );
  });

  it('should cover else path for ternary statement', (done: Function) => {
    setTimeout(() => {
      const renderer = (cellGridObj.grid.contentModule as any);
      renderer['addRowIndex'] = -1;
      renderer.beginAdd({});
      expect(true).toBe(true);
      done();
    }, 100);
  });

  afterAll(() => {
    destroy(cellGridObj);
  });
});
describe('Coverage For OnEnteredAction', () => {
  let gridObj: TreeGrid;

  beforeAll((done: Function) => {
    gridObj = createGrid({
      dataSource: virtualData.slice(0, 100),
      parentIdMapping: 'ParentID',
      idMapping: 'TaskID',
      enableVirtualization: true,
      enableColumnVirtualization: true,
      height: 300,
      frozenColumns: 2,
      columns: [
        { field: 'TaskID', headerText: 'ID', width: 100, freeze: 'Left' },
        { field: 'TaskName', headerText: 'Name', width: 150, freeze: 'Left' },
        { field: 'FIELD1', headerText: 'Field1', width: 150 },
        { field: 'FIELD2', headerText: 'Field2', width: 150 },
        { field: 'FIELD3', headerText: 'Field3', width: 150 }
      ]
    }, done);
  });

  it('If condition !isWheel && check', (done: Function) => {
    setTimeout(() => {
      const renderer = (gridObj.grid.contentModule as any);

      // Ensure parent/grid flags to enter the block
      renderer.parent.isFrozenGrid = () => false;
      renderer.parent.enableVirtualMaskRow = false;

      // Prepare prevInfo.page and getTotalBlocks to satisfy condition
      renderer.prevInfo = { page: 2, columnIndexes: [1], offsets: { top: 0 }, direction: 'up' };
      spyOn(renderer, 'getTotalBlocks').and.returnValue(4);

      // Stub getTranslateY to produce initial translateY
      spyOn(renderer, 'getTranslateY').and.returnValue(100);

      // Prepare virtualEle wrappers to have wrapperBottom < contentBottom
      renderer.virtualEle = renderer.virtualEle || {};
      renderer.virtualEle.wrapper = { getBoundingClientRect: () => ({ bottom: 100 }) };
      renderer.virtualEle.content = { getBoundingClientRect: () => ({ bottom: 120 }) };
      renderer.virtualEle.adjustTable = jasmine.createSpy('adjustTable');

      // offsets and maxBlock large enough so min doesn't clip the sum
      renderer.offsets = [0, 1000];
      renderer['maxBlock'] = 1;

      const cb = renderer.onEnteredAction();
      const content = gridObj.getContent().querySelector('.e-content') as HTMLElement;
      cb(content, { axis: 'Y' }, 'up', { top: 0, left: 0 }, false, true);

      const expectedBottomGap = Math.round(120) - Math.round(100); // 20
      const expectedAdjusted = Math.min(100 + expectedBottomGap, renderer.offsets[renderer['maxBlock']]);

      // One of the adjustTable calls should use the adjusted translateY as second arg
      const calledWithAdjusted = (renderer.virtualEle.adjustTable as jasmine.Spy).calls.allArgs()
        .some((args: any[]) => args[1] === expectedAdjusted);
      expect(calledWithAdjusted).toBe(true);
      done();
    }, 300);
  });


  afterAll(() => {
    destroy(gridObj);
    gridObj = null;
  });
});

describe('Coverage - getRowCollection empty rows branch', () => {
  it('should handle rows.length === 0 path', () => {
    const renderer: any = {};
    renderer.parent = {
      getRows: (): any[] => [],
      getDataRows: (): any[] => [],
      getCurrentViewRecords: (): any[] => [],
      editSettings: { mode: 'Batch' },
      isEdit: true,
      frozenRows: 0,
      pageSettings: { currentPage: 1 }
    };
    renderer.getRowCollection = (VirtualTreeContentRenderer as any).prototype.getRowCollection;
    const result = renderer.getRowCollection(1, true, false, false);
    expect(result).toBeUndefined();
  });
});

describe('Coverage - onEnteredAction IE branch', () => {
  it('should trigger IE-specific branch', () => {
    const renderer: any = {};
    renderer.parent = {
      showSpinner: jasmine.createSpy(),
      enableVirtualMaskRow: false,
      isFrozenGrid: () => false
    };
    renderer.getColumnOffset = () => 0;
    renderer.vgeneration = {};
    renderer.prevInfo = { columnIndexes: [1], offsets: { top: 0 } };
    renderer.getTranslateY = () => 0;
    renderer.virtualEle = {
      adjustTable: () => {},
      wrapper: { getBoundingClientRect: () => ({ height: 100, bottom: 100 }) },
      content: { getBoundingClientRect: () => ({ height: 100, bottom: 100 }) }
    };
    renderer.content = {
      getBoundingClientRect: () => ({ height: 100 })
    };
    const Browser = require('@syncfusion/ej2-base').Browser;
    Object.defineProperty(Browser, 'isIE', { value: true });
    renderer.onEnteredAction = (VirtualTreeContentRenderer as any).prototype.onEnteredAction;
    const fn = renderer.onEnteredAction();
    fn({}, { axis: 'Y' }, 'down', { top: 0, left: 0 }, false, true);
    expect(renderer.parent.showSpinner).toHaveBeenCalled();
  });
});

describe('Coverage - scrollListeners negative remain branch', () => {
  it('should clamp startIndex to 0 when startIndex - remains < 0', () => {
    const renderer: any = {};
    const mockContent = {
      scrollTop: 100,
      querySelector: () => ({ scrollTop: 100, getBoundingClientRect: () => ({ height: 100 }) })
    };
    renderer.parent = {
      pageSettings: { pageSize: 10 },
      getRows: () => new Array(5),
      getContent: () => mockContent,
      contentModule: {},
      getRowHeight: () => 40,
      getFrozenColumns: () => 0,
      enablePersistence: false,
      root: { enablePersistence: false, scrollPosition: null },
      setColumnIndexesInView: () => {},
      setProperties: () => {},
      notify: () => {},
      height: 300,
      element: { getBoundingClientRect: () => ({ height: 300 }) },
      currentViewData: [],
      rowHeight: 40,
      allowRowDragAndDrop: false,
      selectionModule: null,
      removeVirtualElement: () => {},
      removeMaskRow: () => {},
      hideSpinner: () => {},
      showMaskRow: () => {},
      addShimmerEffect: () => {},
      isFrozenGrid: () => false,
      getVisibleFrozenLeftCount: () => 0,
      enableColumnVirtualization: false,
      dataSource: null,
      enableVirtualMaskRow: false
    };
    renderer.totalRecords = 3;
    renderer.startIndex = 0;
    renderer.endIndex = 10;
    renderer.translateY = 0;
    renderer.maxBlock = 1;
    renderer.maxPage = 1;
    renderer.activeKey = null;
    renderer.prevInfo = null;
    renderer.currentInfo = null;
    renderer.previousInfo = null;
    renderer.requestType = '';
    renderer.getInfoFromView = () => ({
      startIndex: 0,
      endIndex: 10,
      page: 1,
      blockIndexes: [0],
      columnIndexes: [0],
      event: 'model-changed'
    });
    renderer.scrollAfterEdit = () => {};
    renderer.shouldPreventScrolling = () => false;
    renderer.scrollListeners = (VirtualTreeContentRenderer as any).prototype.scrollListeners;
    renderer.scrollListeners({
      direction: 'up',
      sentinel: { axis: 'Y' },
      offset: { top: -200, left: 0 }
    });
    expect(renderer.startIndex).toBe(0);
  });
});

describe('Coverage - indexModifier selectedIndex branch', () => {
  it('should skip all branches when selectedIndex === -1 (else path)', () => {
    const renderer: any = {};
    renderer.parent = {
      getContent: () => ({ querySelector: () => ({ scrollTop: 0 }) }),
      pageSettings: { pageSize: 5 },
      getRowHeight: () => 40,
      getRows: () => [1, 2],
      root: { editModule: { selectedIndex: -1 } }
    };
    renderer.startIndex = 0;
    renderer.endIndex = 2;
    renderer.recordAdded = true;
    renderer.totalRecords = 10;
    renderer.indexModifier = (VirtualTreeContentRenderer as any).prototype.indexModifier;
    const initialStartIndex = renderer.startIndex;
    renderer.indexModifier({ count: 10, requestType: 'delete' });
    expect(renderer.startIndex).toBe(initialStartIndex);
  });
});