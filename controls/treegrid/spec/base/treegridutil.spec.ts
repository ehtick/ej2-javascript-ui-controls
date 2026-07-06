import { TreeGridModel } from '../../src/treegrid/base/treegrid-model';
import { TreeGrid } from '../../src/treegrid/base/treegrid';
import { getUniqueID, EmitType, createElement, remove } from '@syncfusion/ej2-base';
import { DataManager, DataUtil } from '@syncfusion/ej2-data';
import { isRemoteData, getExpandStatus } from '../../src/treegrid/utils';

/**
 * Util functions for test cases.
 */

export function createGrid(options: TreeGridModel, done: Function): TreeGrid {
    let id: string = getUniqueID('Grid');
    let dataBound: EmitType<Object> = () => {
        if (document.querySelectorAll('.e-popup-open').length) {
            document.querySelectorAll('.e-popup-open')[0].remove();
        }
        done();
    };
    if (!(options.dataSource instanceof DataManager)) {
        let data: Object[] = (<Object[]>options.dataSource).slice();
        delete options['dataSource'];
        options.dataSource = DataUtil.parse.parseJson(JSON.stringify(data));
    }
    if (!options.hasOwnProperty('dataBound')) {
        options.dataBound = dataBound;
    }
    if (!options.hasOwnProperty('columns')) {
        options.columns = [];
    }
    let grid: TreeGrid = new TreeGrid(options);
    document.body.appendChild(createElement('div', { id: id }));
    grid.appendTo('#' + id);
    return grid;
}

export function destroy(grid: TreeGrid): void {
    if (grid && !grid.isDestroyed) {
        let id: string = grid.element.id;
        grid.destroy();
        remove(document.getElementById(id));
        //ensure once again, because sometimes element not removed from dom.
        if (document.getElementById(id)) {
            document.getElementById(id).remove();
        }
    }
}

describe('Coverage - isRemoteData (Gantt branch)', () => {
  it('should return false when gantt without child mapping', () => {
    const parent: any = {
      treeGrid: { isGantt: true },
      taskFields: { hasChildMapping: false },
      dataSource: {}
    };
    const result = isRemoteData(parent);
    expect(result).toBe(false);
  });

  it('should return false when gantt with child mapping but no DataManager', () => {
    const parent: any = {
      treeGrid: { isGantt: true },
      taskFields: { hasChildMapping: true },
      dataSource: {}
    };
    const result = isRemoteData(parent);
    expect(result).toBe(false);
  });
});

describe('Coverage - getExpandStatus (uncovered branches)', () => {
    let parent: any;
    beforeEach(() => {
        parent = {
            initialRender: false,
            expandStateMapping: 'expandedState',
            uniqueIDCollection: {}
        };
    });
    
    it('should execute recursive parent expansion path', () => {
        parent.uniqueIDCollection = {
            '1': { uniqueID: '1', parentItem: { uniqueID: '2' }, expanded: true },
            '2': { uniqueID: '2', expanded: true }
        };
        const record: any = {
            parentItem: { uniqueID: '1' }
        };
        const result = getExpandStatus(parent, record, []);
        expect(result).toBe(true);
    });

    it('should return true when no parent exists in collection', () => {
        parent.uniqueIDCollection = {
            '1': { uniqueID: '1', parentItem: { uniqueID: '999' }, expanded: true }
        };
        const record: any = {
            parentItem: { uniqueID: '1' }
        };
        const result = getExpandStatus(parent, record, []);
        expect(result).toBe(true);
    });
});